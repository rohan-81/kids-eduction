/**
 * Unified Backend Service for KidsZone
 * Handles profile management, progress synchronization, and offline fallback.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChildProfile, AgeGroup, LessonItem, AppLanguage } from '../types';
import { apiService } from './apiService';
import { authService } from './authService';
import { normalizeAvatarEmoji, emojiToAvatarSlug } from '../utils/avatarHelper';

import { safeGetApiBaseUrl } from './apiConfig';
const LOCAL_PROFILES_KEY = '@kidszone_child_profiles';
const GUEST_PROFILES_KEY = '@kidszone_guest_profiles';
const ACTIVE_PROFILE_KEY = '@kidszone_active_profile_id';

const isStaleNickname = (name?: string): boolean => {
  if (!name) return true;
  const n = name.trim().toLowerCase();
  return n === 'aa' || n === 'bb';
};

const DEFAULT_PROFILES: ChildProfile[] = [
  { id: 1, nickname: 'Little Star', age_group: '2-4', avatar: 'avatar_3d_boy' },
];

class BackendService {
  // Bumped on every local profile write / logout. A background refresh only persists the
  // server list if nothing changed locally while it was in flight, so a slow GET can never
  // overwrite a rename, avatar change, deletion or logout that happened after it started.
  private profileWriteGen = 0;
  private profileRefresh: Promise<ChildProfile[] | null> | null = null;

  private normalizeProfiles(list: any[]): ChildProfile[] {
    return list
      .filter((p: any) => p && !isStaleNickname(p.nickname))
      .map((p: any) => ({ ...p, avatar: normalizeAvatarEmoji(p.avatar) }));
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

  /** One shared network refresh of the parent's profiles; resolves null when offline or stale. */
  private refreshProfilesFromCloud(): Promise<ChildProfile[] | null> {
    if (this.profileRefresh) return this.profileRefresh;
    const startGen = this.profileWriteGen;
    this.profileRefresh = (async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      try {
        const res = await fetch(`${safeGetApiBaseUrl()}/profiles/`, {
          headers: authService.getAuthHeaders(),
          signal: controller.signal,
        });
        if (!res.ok) return null;
        const data = await res.json();
        const normalized = this.normalizeProfiles(Array.isArray(data) ? data : data?.results || []);
        if (normalized.length === 0) return null;
        // Logged out, or edited locally, while the request was in flight: keep local state.
        if (!authService.isAuthenticated() || this.profileWriteGen !== startGen) return null;
        await this.writeProfiles(LOCAL_PROFILES_KEY, normalized);
        return normalized;
      } catch {
        return null; // Backend offline or network timeout
      } finally {
        clearTimeout(timeoutId);
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
    const storageKey = isAuthed ? LOCAL_PROFILES_KEY : GUEST_PROFILES_KEY;
    const normAvatar = normalizeAvatarEmoji(avatar);
    const payload = { nickname, age_group, avatar: emojiToAvatarSlug(normAvatar) };
    let createdProfile: ChildProfile | null = null;

    if (isAuthed) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const res = await fetch(`${safeGetApiBaseUrl()}/profiles/`, {
          method: 'POST',
          headers: authService.getAuthHeaders(),
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          createdProfile = await res.json();
        }
      } catch {
        // Offline mode
      }
    }

    if (!createdProfile) {
      createdProfile = {
        id: Date.now(),
        nickname,
        age_group,
        avatar: normAvatar,
        created_at: new Date().toISOString(),
      };
    } else {
      createdProfile.avatar = normAvatar;
    }

    // Update local cache
    const existing = await this.getProfiles();
    const updated = [...existing.filter((p) => p.id !== createdProfile!.id), createdProfile];
    await this.writeProfiles(storageKey, updated);
    await this.setActiveProfileId(createdProfile.id);

    return createdProfile;
  }

  // 2b. Update profile nickname
  async updateProfileNickname(profileId: number, nickname: string): Promise<void> {
    const isAuthed = authService.isAuthenticated();
    const storageKey = isAuthed ? LOCAL_PROFILES_KEY : GUEST_PROFILES_KEY;
    const existing = await this.getProfiles();
    const updated = existing.map((p) => (p.id === profileId ? { ...p, nickname } : p));
    await this.writeProfiles(storageKey, updated);
    if (isAuthed) {
      try {
        await fetch(`${safeGetApiBaseUrl()}/profiles/${profileId}/`, {
          method: 'PATCH',
          headers: {
            ...authService.getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nickname }),
        });
      } catch {}
    }
  }

  // 2c. Update profile avatar
  async updateProfileAvatar(profileId: number, avatar: string): Promise<void> {
    const isAuthed = authService.isAuthenticated();
    const storageKey = isAuthed ? LOCAL_PROFILES_KEY : GUEST_PROFILES_KEY;
    const existing = await this.getProfiles();
    const updated = existing.map((p) => (p.id === profileId ? { ...p, avatar } : p));
    await this.writeProfiles(storageKey, updated);
    if (isAuthed) {
      try {
        await fetch(`${safeGetApiBaseUrl()}/profiles/${profileId}/`, {
          method: 'PATCH',
          headers: {
            ...authService.getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ avatar: emojiToAvatarSlug(avatar) }),
        });
      } catch {}
    }
  }

  // 2d. Update profile age group / class
  async updateProfileAgeGroup(profileId: number | string, age_group: AgeGroup): Promise<void> {
    const isAuthed = authService.isAuthenticated();
    const storageKey = isAuthed ? LOCAL_PROFILES_KEY : GUEST_PROFILES_KEY;
    const existing = await this.getProfiles();
    const numericId = typeof profileId === 'number' ? profileId : parseInt(String(profileId), 10);
    const updated = existing.map((p) =>
      (existing.length === 1 || p.id === profileId || p.id === numericId || String(p.id) === String(profileId))
        ? { ...p, age_group }
        : p
    );
    if (existing.length === 0) {
      const defaultProf: ChildProfile = {
        id: numericId || 1,
        nickname: 'Little Star',
        age_group,
        avatar: 'avatar_3d_boy',
        created_at: new Date().toISOString(),
      };
      await this.writeProfiles(storageKey, [defaultProf]);
    } else {
      await this.writeProfiles(storageKey, updated);
    }

    if (isAuthed && numericId && !isNaN(numericId)) {
      try {
        await fetch(`${safeGetApiBaseUrl()}/profiles/${numericId}/`, {
          method: 'PATCH',
          headers: {
            ...authService.getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ age_group }),
        });
      } catch {}
    }
  }

  // 3. Delete profile
  async deleteProfile(profileId: number): Promise<void> {
    const isAuthed = authService.isAuthenticated();
    const storageKey = isAuthed ? LOCAL_PROFILES_KEY : GUEST_PROFILES_KEY;
    if (isAuthed) {
      try {
        await fetch(`${safeGetApiBaseUrl()}/profiles/${profileId}/`, {
          method: 'DELETE',
          headers: {
            ...authService.getAuthHeaders(),
            'X-Parent-Verified': 'true',
          },
        });
      } catch {}
    }

    const existing = await this.getProfiles();
    const updated = existing.filter((p) => p.id !== profileId);
    await this.writeProfiles(storageKey, updated);
    const active = await this.getActiveProfileId();
    if (active === profileId && updated.length > 0) {
      await this.setActiveProfileId(updated[0].id);
    }
  }

  // 3b. Clear all local cached profiles on user logout
  async clearLocalProfiles(): Promise<void> {
    this.profileWriteGen += 1; // an in-flight refresh must not repopulate a logged-out cache
    try {
      await AsyncStorage.removeItem(LOCAL_PROFILES_KEY);
      await AsyncStorage.removeItem(ACTIVE_PROFILE_KEY);
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

  // 5. Sync Lesson Progress with Django Backend
  async syncLessonProgress(lessonId: string, completed: boolean = true): Promise<void> {
    try {
      const profileId = await this.getActiveProfileId();
      await fetch(`${safeGetApiBaseUrl()}/progress/`, {
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
      // Offline fallback: silent
    }
  }

  // 6. Sync Game Results with Django Backend
  async syncGameResult(gameType: string, score: number, totalQuestions: number): Promise<void> {
    try {
      await authService.init();
      const profileId = await this.getActiveProfileId();
      await fetch(`${safeGetApiBaseUrl()}/game-results/`, {
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

  // 8. Full Multi-device cloud synchronization
  async syncAllProgressWithCloud(
    localProgress: any,
    isReset: boolean = false,
    explicitProfileId?: number | string
  ): Promise<any> {
    try {
      let profileId = explicitProfileId ? Number(explicitProfileId) : await this.getActiveProfileId();
      if (!profileId || isNaN(profileId)) {
        profileId = await this.getActiveProfileId();
      }
      if (!profileId) return null;

      const payload = {
        child_profile_id: profileId,
        is_reset: isReset,
        adventure_level: localProgress.adventureLevel || 1,
        lessons: (localProgress.completedLessons || []).map((id: string) => ({
          lesson_id: id,
          completed: true,
          stars: 3,
          best_score: 100,
        })),
        wallet: {
          coins: localProgress.coins || 0,
          stars: localProgress.stars || 0,
        },
        streak: {
          current_streak: localProgress.streakDays || 1,
          longest_streak: localProgress.streakDays || 1,
          last_active_date: localProgress.lastStreakDate || undefined,
        },
        avatar: {
          base_avatar: localProgress.currentAvatar?.character || 'fox',
          equipped_hat: localProgress.currentAvatar?.hat || '',
          equipped_backpack: localProgress.currentAvatar?.accessory || '',
          unlocked_items: localProgress.unlockedAvatarItems || [],
        },
      };

      const serverState = await apiService.syncCloudState(payload);
      return serverState;
    } catch {
      return null;
    }
  }
}

export const backendService = new BackendService();
