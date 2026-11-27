/**
 * Unified Backend Service for KidsZone
 * Handles profile management, progress synchronization, and offline fallback.
 *
 * Offline model (audit P1-1 / P1-2 / P1-3):
 * - Guests: profiles and progress live only on the device. Nothing is sent to the server.
 * - Signed-in parents: every profile write is applied locally first. If the request cannot be
 *   delivered (offline, timeout, 5xx, 429) it is queued in a persisted outbox
 *   (`@kidszone_profile_outbox`) and replayed, in order, before the next cloud refresh. The
 *   refresh then MERGES the server list with still-pending local changes instead of
 *   overwriting them, so offline creates/renames/deletes are never silently undone.
 * - A progress reset is remembered per profile (`@kidszone_pending_reset_<id>`) and re-sent
 *   with `is_reset: true` until the server acknowledges it.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChildProfile, AgeGroup, LessonItem, AppLanguage, UserProgress } from '../types';
import { listFrom, type BackendChildProfile, type CloudSyncPayload, type CloudSyncResponse } from '../types/api';
import { apiService } from './apiService';
import { authService } from './authService';
import { storageService } from './storageService';
import { normalizeAvatarEmoji, emojiToAvatarSlug } from '../utils/avatarHelper';

import { safeGetApiBaseUrl } from './apiConfig';
const LOCAL_PROFILES_KEY = '@kidszone_child_profiles';
const GUEST_PROFILES_KEY = '@kidszone_guest_profiles';
const ACTIVE_PROFILE_KEY = '@kidszone_active_profile_id';
export const PROFILE_OUTBOX_KEY = '@kidszone_profile_outbox';
export const PENDING_RESET_PREFIX = '@kidszone_pending_reset_';

export const NETWORK_TIMEOUT_MS = 5000;

const isStaleNickname = (name?: string): boolean => {
  if (!name) return true;
  const n = name.trim().toLowerCase();
  return n === 'aa' || n === 'bb';
};

const DEFAULT_PROFILES: ChildProfile[] = [
  { id: 1, nickname: 'Little Star', age_group: '2-4', avatar: 'avatar_3d_boy' },
];

type ProfilePatch = Partial<Pick<ChildProfile, 'nickname' | 'age_group' | 'avatar'>>;

export type ProfileOutboxOp =
  | { kind: 'create'; localId: number; body: { nickname: string; age_group: AgeGroup; avatar: string } }
  | { kind: 'patch'; id: number; body: ProfilePatch }
  | { kind: 'delete'; id: number };

type SendOutcome = 'ok' | 'gone' | 'rejected' | 'retry';

/** fetch with an abort timeout that also covers reading the JSON body. */
async function fetchJson(
  url: string,
  init: RequestInit,
  timeoutMs = NETWORK_TIMEOUT_MS
): Promise<{ status: number; ok: boolean; data: unknown }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    let data: unknown = null;
    if (res.status !== 204) {
      try {
        data = await res.json();
      } catch {
        data = null;
      }
    }
    return { status: res.status, ok: res.ok, data };
  } finally {
    clearTimeout(timeoutId);
  }
}

/** Maps a response status to what the outbox should do with the operation. */
/** A plausible profile row from the API or the local cache. */
function isProfileLike(p: unknown): p is BackendChildProfile {
  const v = p as Partial<BackendChildProfile> | null;
  return !!v && typeof v === 'object' && (typeof v.id === 'number' || typeof v.id === 'string');
}

function classifyStatus(status: number, ok: boolean): SendOutcome {
  if (ok) return 'ok';
  if (status === 401) return 'rejected';
  if (status === 404 || status === 410) return 'gone';
  if (status === 408 || status === 429 || status >= 500) return 'retry';
  return 'rejected'; // 400/403/409...: replaying will never succeed
}

class BackendService {
  // Bumped on every local profile write / logout. A background refresh only persists the
  // server list if nothing changed locally while it was in flight, so a slow GET can never
  // overwrite a rename, avatar change, deletion or logout that happened after it started.
  private profileWriteGen = 0;
  private profileRefresh: Promise<ChildProfile[] | null> | null = null;
  private outboxLock: Promise<unknown> = Promise.resolve();
  private flushing: Promise<void> | null = null;
  private remappedProfileIds = new Map<number, number>();

  private normalizeProfiles(list: unknown[]): ChildProfile[] {
    return list
      .filter(isProfileLike)
      .filter((p) => !isStaleNickname(p.nickname))
      .map((p) => ({ ...p, id: Number(p.id), avatar: normalizeAvatarEmoji(p.avatar) }));
  }

  private async readCachedProfiles(storageKey: string): Promise<ChildProfile[]> {
    try {
      const local = await AsyncStorage.getItem(storageKey);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) return this.normalizeProfiles(parsed);
      }
    } catch {}
    return [];
  }

  private async writeProfiles(storageKey: string, profiles: ChildProfile[]): Promise<void> {
    this.profileWriteGen += 1;
    await AsyncStorage.setItem(storageKey, JSON.stringify(profiles));
  }

  private storageKey(): string {
    return authService.isAuthenticated() ? LOCAL_PROFILES_KEY : GUEST_PROFILES_KEY;
  }

  // ---------------------------------------------------------------------------------------
  // Outbox
  // ---------------------------------------------------------------------------------------

  /** Serializes every outbox read-modify-write so concurrent edits cannot drop operations. */
  private withOutbox<T>(fn: (ops: ProfileOutboxOp[]) => Promise<{ ops: ProfileOutboxOp[]; result: T }>): Promise<T> {
    const run = this.outboxLock.then(async () => {
      const ops = await this.readOutbox();
      const { ops: next, result } = await fn(ops);
      await AsyncStorage.setItem(PROFILE_OUTBOX_KEY, JSON.stringify(next));
      return result;
    });
    this.outboxLock = run.catch(() => {});
    return run;
  }

  async readOutbox(): Promise<ProfileOutboxOp[]> {
    try {
      const raw = await AsyncStorage.getItem(PROFILE_OUTBOX_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private enqueue(op: ProfileOutboxOp): Promise<void> {
    return this.withOutbox(async (ops) => {
      if (op.kind === 'patch') {
        // Fold edits of a not-yet-created profile into its create op.
        const create = ops.find((o) => o.kind === 'create' && o.localId === op.id);
        if (create && create.kind === 'create') {
          // The create body carries the server's avatar slug, the patch the device's emoji form.
          const { avatar, ...rest } = op.body;
          create.body = { ...create.body, ...rest, ...(avatar !== undefined ? { avatar: emojiToAvatarSlug(avatar) } : {}) };
          return { ops, result: undefined };
        }
        const existing = ops.find((o) => o.kind === 'patch' && o.id === op.id);
        if (existing && existing.kind === 'patch') {
          existing.body = { ...existing.body, ...op.body };
          return { ops, result: undefined };
        }
        return { ops: [...ops, op], result: undefined };
      }
      if (op.kind === 'delete') {
        const wasLocalOnly = ops.some((o) => o.kind === 'create' && o.localId === op.id);
        const rest = ops.filter(
          (o) => !((o.kind === 'create' && o.localId === op.id) || ((o.kind === 'patch' || o.kind === 'delete') && o.id === op.id))
        );
        // A profile the server never saw needs no server-side delete.
        return { ops: wasLocalOnly ? rest : [...rest, op], result: undefined };
      }
      return { ops: [...ops, op], result: undefined };
    });
  }

  private async sendOp(op: ProfileOutboxOp): Promise<{ outcome: SendOutcome; serverProfile?: BackendChildProfile }> {
    const base = `${safeGetApiBaseUrl()}/profiles/`;
    try {
      if (op.kind === 'create') {
        const res = await fetchJson(base, {
          method: 'POST',
          headers: authService.getAuthHeaders(),
          body: JSON.stringify(op.body),
        });
        const outcome = classifyStatus(res.status, res.ok);
        return { outcome, serverProfile: outcome === 'ok' && isProfileLike(res.data) ? res.data : undefined };
      }
      if (op.kind === 'patch') {
        const res = await fetchJson(`${base}${op.id}/`, {
          method: 'PATCH',
          headers: authService.getAuthHeaders(),
          body: JSON.stringify({
            ...op.body,
            ...(op.body.avatar !== undefined ? { avatar: emojiToAvatarSlug(op.body.avatar) } : {}),
          }),
        });
        return { outcome: classifyStatus(res.status, res.ok) };
      }
      const res = await fetchJson(`${base}${op.id}/`, {
        method: 'DELETE',
        headers: authService.getAuthHeaders(),
      });
      return { outcome: classifyStatus(res.status, res.ok) };
    } catch {
      return { outcome: 'retry' }; // offline / timeout
    }
  }

  /** Replaces a local (offline) profile id with the server id everywhere it is referenced. */
  private async remapProfileId(localId: number, serverId: number, serverProfile: BackendChildProfile): Promise<void> {
    this.remappedProfileIds.set(localId, serverId);
    const cached = await this.readCachedProfiles(LOCAL_PROFILES_KEY);
    const updated = cached.map((p) =>
      p.id === localId
        ? { ...p, ...this.normalizeProfiles([serverProfile])[0], id: serverId, avatar: p.avatar, pendingSync: false }
        : p
    );
    await this.writeProfiles(LOCAL_PROFILES_KEY, updated);
    const active = await AsyncStorage.getItem(ACTIVE_PROFILE_KEY);
    if (active === String(localId)) await this.setActiveProfileId(serverId);
    await storageService.renameProfileProgress(localId, serverId);
    const pendingReset = await AsyncStorage.getItem(`${PENDING_RESET_PREFIX}${localId}`);
    if (pendingReset) {
      await AsyncStorage.setItem(`${PENDING_RESET_PREFIX}${serverId}`, pendingReset);
      await AsyncStorage.removeItem(`${PENDING_RESET_PREFIX}${localId}`);
    }
  }

  /**
   * Replays queued profile operations in order. Stops at the first operation that should be
   * retried later (offline / server error) so ordering is preserved. Safe to call repeatedly.
   */
  flushOutbox(): Promise<void> {
    if (!authService.isAuthenticated()) return Promise.resolve();
    if (this.flushing) return this.flushing;
    this.flushing = (async () => {
      try {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const ops = await this.readOutbox();
          if (ops.length === 0) return;
          const op = ops[0];
          const { outcome, serverProfile } = await this.sendOp(op);
          if (outcome === 'retry') return;

          await this.withOutbox(async (current) => {
            let extraPatchForCreate: Record<string, unknown> | null = null;
            let next = current.filter((o) => {
              if (op.kind === 'create' && o.kind === 'create' && o.localId === op.localId) {
                const sentBody = op.body as Record<string, unknown>;
                const curBody = o.body as Record<string, unknown>;
                const diff: Record<string, unknown> = {};
                for (const [k, v] of Object.entries(curBody)) {
                  if (sentBody[k] !== v) diff[k] = v;
                }
                if (Object.keys(diff).length > 0) extraPatchForCreate = diff;
                return false;
              }
              if (op.kind === 'create' && outcome === 'rejected' && o.kind !== 'create' && o.id === op.localId) {
                return false;
              }
              return JSON.stringify(o) !== JSON.stringify(op);
            });
            if (op.kind === 'create' && outcome === 'ok' && serverProfile?.id) {
              const serverId = Number(serverProfile.id);
              next = next.map((o) => (o.kind !== 'create' && o.id === op.localId ? { ...o, id: serverId } : o));
              if (extraPatchForCreate) {
                next = [...next, { kind: 'patch', id: serverId, body: extraPatchForCreate as Partial<ChildProfile> }];
              }
            }
            return { ops: next, result: undefined };
          });

          if (op.kind === 'create' && outcome === 'ok' && serverProfile?.id) {
            await this.remapProfileId(op.localId, Number(serverProfile.id), serverProfile);
          } else if (op.kind === 'create' && outcome === 'rejected') {
            const cached = await this.readCachedProfiles(LOCAL_PROFILES_KEY);
            const cleaned = cached.filter((p) => p.id !== op.localId);
            await this.writeProfiles(LOCAL_PROFILES_KEY, cleaned);
          }
        }
      } finally {
        this.flushing = null;
      }
    })();
    return this.flushing;
  }

  /** Applies still-queued local changes on top of a server profile list. */
  private mergeWithPending(server: ChildProfile[], local: ChildProfile[], ops: ProfileOutboxOp[]): ChildProfile[] {
    const deleted = new Set(ops.filter((o) => o.kind === 'delete').map((o) => (o as { id: number }).id));
    const patches = new Map<number, ProfilePatch>();
    ops.forEach((o) => {
      if (o.kind === 'patch') patches.set(o.id, { ...(patches.get(o.id) || {}), ...o.body });
    });
    const pendingCreates = new Set(ops.filter((o) => o.kind === 'create').map((o) => (o as { localId: number }).localId));

    const merged: ChildProfile[] = server
      .filter((p) => !deleted.has(p.id))
      .map((p) => {
        const patch = patches.get(p.id);
        return { ...p, ...(patch || {}) };
      });
    local
      .filter((l) => pendingCreates.has(l.id) && !merged.some((m) => m.id === l.id))
      .forEach((l) => merged.push({ ...l, pendingSync: true }));
    return merged;
  }

  /** One shared network refresh of the parent's profiles; resolves null when offline or stale. */
  private refreshProfilesFromCloud(): Promise<ChildProfile[] | null> {
    if (this.profileRefresh) return this.profileRefresh;
    this.profileRefresh = (async () => {
      try {
        await this.flushOutbox();
        const startGen = this.profileWriteGen;
        const res = await fetchJson(`${safeGetApiBaseUrl()}/profiles/`, {
          headers: authService.getAuthHeaders(),
        });
        if (res.status === 401) {
          await authService.logout();
          return null;
        }
        if (!res.ok) return null;
        const server = this.normalizeProfiles(listFrom<unknown>(res.data));
        // Logged out, or edited locally, while the request was in flight: keep local state.
        if (!authService.isAuthenticated() || this.profileWriteGen !== startGen) return null;
        const [local, ops] = await Promise.all([this.readCachedProfiles(LOCAL_PROFILES_KEY), this.readOutbox()]);
        const merged = this.mergeWithPending(server, local, ops);
        await this.writeProfiles(LOCAL_PROFILES_KEY, merged);
        return merged;
      } catch {
        return null; // Backend offline or network timeout
      } finally {
        this.profileRefresh = null;
      }
    })();
    return this.profileRefresh;
  }

  // 1. Fetch child profiles (Scoped by Guest vs Authenticated Parent with offline cache).
  // Cache-first: a signed-in parent with saved profiles gets them straight from AsyncStorage
  // and the cloud copy refreshes in the background. Only a first login (no cache) waits.
  async getProfiles(): Promise<ChildProfile[]> {
    const isAuthed = authService.isAuthenticated();
    const storageKey = isAuthed ? LOCAL_PROFILES_KEY : GUEST_PROFILES_KEY;
    const cachedProfiles = await this.readCachedProfiles(storageKey);

    if (isAuthed) {
      if (cachedProfiles.length > 0) {
        void this.refreshProfilesFromCloud();
        return cachedProfiles;
      }
      const remote = await this.refreshProfilesFromCloud();
      if (remote && remote.length > 0) return remote;
    }

    if (cachedProfiles.length > 0) return cachedProfiles;
    return DEFAULT_PROFILES;
  }

  /** Local cache only (never triggers a network refresh). */
  private async getLocalProfiles(): Promise<ChildProfile[]> {
    const cached = await this.readCachedProfiles(this.storageKey());
    return cached.length > 0 ? cached : authService.isAuthenticated() ? [] : DEFAULT_PROFILES;
  }

  // Set dedicated guest profile
  async setGuestProfile(nickname: string, age_group: AgeGroup, avatar: string = 'avatar_3d_boy'): Promise<ChildProfile> {
    const normAvatar = normalizeAvatarEmoji(avatar);
    const guestProfile: ChildProfile = {
      id: 1,
      nickname: nickname.trim() || 'Little Star',
      age_group,
      avatar: normAvatar,
      created_at: new Date().toISOString(),
    };
    await this.writeProfiles(GUEST_PROFILES_KEY, [guestProfile]);
    await this.setActiveProfileId(1);
    return guestProfile;
  }

  async clearGuestProfiles(): Promise<void> {
    try {
      await AsyncStorage.removeItem(GUEST_PROFILES_KEY);
    } catch {}
  }

  // 2. Create new child profile
  async createProfile(nickname: string, age_group: AgeGroup, avatar: string = 'avatar_3d_boy'): Promise<ChildProfile> {
    const isAuthed = authService.isAuthenticated();
    const storageKey = this.storageKey();
    const normAvatar = normalizeAvatarEmoji(avatar);
    const body = { nickname, age_group, avatar: emojiToAvatarSlug(normAvatar) };
    let createdProfile: ChildProfile | null = null;
    let queued = false;

    if (isAuthed) {
      await this.flushOutbox(); // keep server-side ordering of earlier offline edits
      const { outcome, serverProfile } = await this.sendOp({ kind: 'create', localId: 0, body });
      if (outcome === 'ok' && serverProfile?.id) {
        createdProfile = { ...serverProfile, id: Number(serverProfile.id), avatar: normAvatar };
      } else if (outcome === 'retry') {
        queued = true;
      } else if (outcome === 'rejected') {
        throw new Error('Profile creation rejected by server.');
      }
    }

    if (!createdProfile) {
      createdProfile = {
        id: Date.now(),
        nickname,
        age_group,
        avatar: normAvatar,
        created_at: new Date().toISOString(),
        ...(queued ? { pendingSync: true } : {}),
      };
    }

    const existing = await this.getLocalProfiles();
    const updated = [...existing.filter((p) => p.id !== createdProfile!.id), createdProfile];
    await this.writeProfiles(storageKey, updated);
    await this.setActiveProfileId(createdProfile.id);
    if (queued) {
      await this.enqueue({ kind: 'create', localId: createdProfile.id, body });
    }

    return createdProfile;
  }

  /** Applies a profile edit locally, then delivers it (or queues it when offline). */
  private async applyProfilePatch(profileId: number, patch: ProfilePatch, matchAll = false): Promise<void> {
    const isAuthed = authService.isAuthenticated();
    const storageKey = this.storageKey();
    const existing = await this.getLocalProfiles();
    const targetProfileId = matchAll && existing.length === 1 ? existing[0].id : profileId;
    if (existing.length === 0 && patch.age_group) {
      await this.writeProfiles(storageKey, [
        {
          id: targetProfileId || 1,
          nickname: 'Little Star',
          age_group: patch.age_group,
          avatar: 'avatar_3d_boy',
          created_at: new Date().toISOString(),
        },
      ]);
    } else {
      const updated = existing.map((p) =>
        p.id === targetProfileId ? { ...p, ...patch } : p
      );
      await this.writeProfiles(storageKey, updated);
    }

    if (!isAuthed || !targetProfileId || isNaN(targetProfileId)) return;

    const ops = await this.readOutbox();
    const isLocalOnly = ops.some((o) => o.kind === 'create' && o.localId === targetProfileId);
    if (!isLocalOnly) {
      await this.flushOutbox();
      const resolvedId = this.remappedProfileIds.get(targetProfileId) ?? targetProfileId;
      const { outcome } = await this.sendOp({ kind: 'patch', id: resolvedId, body: patch });
      if (outcome !== 'retry') return;
      await this.enqueue({ kind: 'patch', id: resolvedId, body: patch });
      return;
    }
    await this.enqueue({ kind: 'patch', id: targetProfileId, body: patch });
  }

  // 2b. Update profile nickname
  async updateProfileNickname(profileId: number, nickname: string): Promise<void> {
    await this.applyProfilePatch(profileId, { nickname });
  }

  // 2c. Update profile avatar
  async updateProfileAvatar(profileId: number, avatar: string): Promise<void> {
    await this.applyProfilePatch(profileId, { avatar });
  }

  // 2d. Update profile age group / class
  async updateProfileAgeGroup(profileId: number | string, age_group: AgeGroup): Promise<void> {
    const numericId = typeof profileId === 'number' ? profileId : parseInt(String(profileId), 10);
    await this.applyProfilePatch(numericId, { age_group }, true);
  }

  // 3. Delete profile
  async deleteProfile(profileId: number): Promise<void> {
    const isAuthed = authService.isAuthenticated();
    const storageKey = this.storageKey();

    const existing = await this.getLocalProfiles();
    const updated = existing.filter((p) => p.id !== profileId);
    await this.writeProfiles(storageKey, updated);
    const active = await this.getActiveProfileId();
    if (active === profileId) {
      if (updated.length > 0) {
        await this.setActiveProfileId(updated[0].id);
      } else {
        await AsyncStorage.removeItem(ACTIVE_PROFILE_KEY);
      }
    }

    if (!isAuthed) return;
    const ops = await this.readOutbox();
    const isLocalOnly = ops.some((o) => o.kind === 'create' && o.localId === profileId);
    if (!isLocalOnly) {
      await this.flushOutbox();
      const { outcome } = await this.sendOp({ kind: 'delete', id: profileId });
      if (outcome !== 'retry') {
        // Drop any queued edits for the now-deleted profile.
        await this.withOutbox(async (cur) => ({
          ops: cur.filter((o) => !(o.kind !== 'create' && o.id === profileId)),
          result: undefined,
        }));
        return;
      }
    }
    await this.enqueue({ kind: 'delete', id: profileId });
  }

  // 3b. Clear all local cached profiles on user logout
  async clearLocalProfiles(): Promise<void> {
    this.profileWriteGen += 1; // an in-flight refresh must not repopulate a logged-out cache
    try {
      await AsyncStorage.removeItem(LOCAL_PROFILES_KEY);
      await AsyncStorage.removeItem(ACTIVE_PROFILE_KEY);
      await AsyncStorage.removeItem(PROFILE_OUTBOX_KEY);
    } catch {}
  }

  // 4. Active Profile tracking
  async getActiveProfileId(): Promise<number> {
    try {
      const val = await AsyncStorage.getItem(ACTIVE_PROFILE_KEY);
      if (val && !isNaN(parseInt(val, 10))) return parseInt(val, 10);
      const profiles = await this.getProfiles();
      if (profiles && profiles.length > 0 && profiles[0].id) {
        await this.setActiveProfileId(profiles[0].id);
        return profiles[0].id;
      }
    } catch {}
    return 1;
  }

  async setActiveProfileId(profileId: number): Promise<void> {
    try {
      await AsyncStorage.setItem(ACTIVE_PROFILE_KEY, profileId.toString());
    } catch {}
  }

  /** True when the id belongs to a profile the server has not created yet. */
  private async isPendingLocalProfile(profileId: number): Promise<boolean> {
    const ops = await this.readOutbox();
    return ops.some((o) => o.kind === 'create' && o.localId === profileId);
  }

  // 5. Sync Lesson Progress with Django Backend (signed-in parents only)
  async syncLessonProgress(lessonId: string, completed: boolean = true): Promise<void> {
    if (!authService.isAuthenticated()) return; // guest progress never leaves the device
    try {
      const profileId = await this.getActiveProfileId();
      if (await this.isPendingLocalProfile(profileId)) return;
      await fetchJson(`${safeGetApiBaseUrl()}/progress/`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({
          child_profile: profileId,
          lesson: lessonId,
          completed,
          best_score: 1,
        }),
      });
    } catch {
      // Offline: the next full cloud sync carries completed lessons.
    }
  }

  // 6. Sync Game Results with Django Backend (signed-in parents only)
  async syncGameResult(gameType: string, score: number, totalQuestions: number): Promise<void> {
    try {
      await authService.init();
      if (!authService.isAuthenticated()) return;
      const profileId = await this.getActiveProfileId();
      if (await this.isPendingLocalProfile(profileId)) return;
      await fetchJson(`${safeGetApiBaseUrl()}/game-results/`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({
          child_profile: profileId,
          game_type: gameType,
          score,
          total_questions: totalQuestions,
        }),
      });
    } catch {
      // Offline fallback
    }
  }

  // 7. Fetch educational lessons from Django backend with local fallback
  async fetchLessons(
    language?: AppLanguage,
    ageGroup?: AgeGroup,
    category?: string
  ): Promise<LessonItem[]> {
    return apiService.fetchLessons(language, ageGroup, category);
  }

  /** Whether a reset for this profile is still waiting for server acknowledgement. */
  async hasPendingReset(profileId: number): Promise<boolean> {
    try {
      return (await AsyncStorage.getItem(`${PENDING_RESET_PREFIX}${profileId}`)) !== null;
    } catch {
      return false;
    }
  }

  // 8. Full Multi-device cloud synchronization (signed-in parents only)
  async syncAllProgressWithCloud(
    localProgress: Partial<UserProgress>,
    isReset: boolean = false,
    explicitProfileId?: number | string
  ): Promise<CloudSyncResponse | null> {
    if (!authService.isAuthenticated()) return null; // guests: on-device only (audit P0-2)
    try {
      let profileId = explicitProfileId ? Number(explicitProfileId) : await this.getActiveProfileId();
      if (!profileId || isNaN(profileId)) {
        profileId = await this.getActiveProfileId();
      }
      if (!profileId) return null;

      let resetKey = `${PENDING_RESET_PREFIX}${profileId}`;
      if (isReset) {
        // Persist first: if this request fails, the next sync must still reset the server.
        await AsyncStorage.setItem(resetKey, new Date().toISOString());
      }

      await this.flushOutbox();
      const remappedId = this.remappedProfileIds.get(profileId);
      if (remappedId) {
        const oldResetKey = resetKey;
        profileId = remappedId;
        resetKey = `${PENDING_RESET_PREFIX}${profileId}`;
        if (isReset) {
          await AsyncStorage.setItem(resetKey, new Date().toISOString());
          await AsyncStorage.removeItem(oldResetKey);
        }
      }
      if (await this.isPendingLocalProfile(profileId)) return null; // server profile not created yet

      const sendReset = isReset || (await this.hasPendingReset(profileId));
      const streak = Math.max(1, Number(localProgress.streakDays) || 1);

      const payload: CloudSyncPayload = {
        child_profile_id: profileId,
        is_reset: sendReset,
        adventure_level: localProgress.adventureLevel || 1,
        lessons: (localProgress.completedLessons || []).map((id: string) => ({
          lesson_id: id,
          completed: true,
        })),
        wallet: {
          coins: localProgress.coins || 0,
          stars: localProgress.stars || 0,
          // A reset starts a fresh ledger on the server, so the counter restarts with it.
          spent_total: sendReset ? 0 : localProgress.coinsSpentTotal || 0,
        },
        streak: {
          current_streak: streak,
          // The device does not track a separate longest streak; the server keeps the max.
          longest_streak: streak,
          last_active_date: localProgress.lastStreakDate || undefined,
        },
        avatar: {
          base_avatar: localProgress.currentAvatar?.character || 'fox',
          equipped_hat: localProgress.currentAvatar?.hat || '',
          equipped_backpack: localProgress.currentAvatar?.accessory || '',
          unlocked_items: localProgress.unlockedAvatarItems || [],
        },
        ...(localProgress.gameStats ? { game_stats: localProgress.gameStats } : {}),
      };

      const serverState = await apiService.syncCloudState(payload);
      if (serverState && sendReset) {
        await AsyncStorage.removeItem(resetKey);
      }
      return serverState;
    } catch {
      return null;
    }
  }
}

export const backendService = new BackendService();
