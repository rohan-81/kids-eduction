import { STARTER_UNLOCKED_STICKER_IDS } from '../data/stickersData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppLanguage, UserPreferences, UserProgress } from '../types';

const STORAGE_KEYS = {
  PREFERENCES: '@kidszone_preferences',
  PROGRESS: '@kidszone_progress',
  PRIMARY_PROFILE: '@kidszone_primary_profile_id',
} as const;

let currentUserId: string | number | null = null;
let currentProfileId: string | number | null = null;
let primaryProfileId: string | number | null = 1;

export const getProgressKeyForUser = (
  userId: string | number | null,
  profileId?: string | number | null
): string => {
  const baseKey =
    userId !== null && userId !== undefined && String(userId).trim().length > 0
      ? `@kidszone_progress_user_${userId}`
      : STORAGE_KEYS.PROGRESS;

  const targetProfileId = profileId !== undefined ? profileId : currentProfileId;
  if (
    targetProfileId !== null &&
    targetProfileId !== undefined &&
    String(targetProfileId) !== '1' &&
    String(targetProfileId) !== String(primaryProfileId) &&
    String(targetProfileId).trim().length > 0
  ) {
    return `${baseKey}_profile_${targetProfileId}`;
  }
  return baseKey;
};

export const getRemainingTimeToMidnight = (): string => {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const diffSec = Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
  const hh = String(Math.floor(diffSec / 3600)).padStart(2, '0');
  const mm = String(Math.floor((diffSec % 3600) / 60)).padStart(2, '0');
  const ss = String(diffSec % 60).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
};

export const getTodayDateKey = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getYesterdayDateKey = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const calculateUpdatedStreak = (
  streakDays: number | undefined,
  lastStreakDate: string | undefined
): { streakDays: number; lastStreakDate: string; changed: boolean } => {
  const today = getTodayDateKey();
  const yesterday = getYesterdayDateKey();

  if (lastStreakDate === today) {
    return { streakDays: streakDays || 1, lastStreakDate: today, changed: false };
  }

  if (lastStreakDate === yesterday) {
    const updated = (streakDays || 0) + 1;
    return { streakDays: updated, lastStreakDate: today, changed: true };
  }

  // First launch or missed streak -> 1 day
  return { streakDays: 1, lastStreakDate: today, changed: true };
};

let saveQueue: Promise<unknown> = Promise.resolve();

export const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'gu',
  ageGroup: '2-4',
  soundEnabled: true,
  hasCompletedOnboarding: false,
  isGuest: false,
};

export const DEFAULT_PROGRESS: UserProgress = {
  childName: '',
  firstName: '',
  lastName: '',
  dob: '',
  hasCompletedFirstTimeName: false,
  favoriteColor: '#6366F1',
  streakDays: 1,
  lastStreakDate: '',
  completedLessons: [],
  stars: 0,
  coins: 50,
  seeds: 5,
  water: 10,
  adventureLevel: 1,
  earnedBadges: ['badge-welcome'],
  gameStats: {},
  lastActive: new Date().toISOString(),
  lastSpinDate: '',
  gardenPlants: [
    { id: 'plant-1', nameGu: 'ગુલાબ', nameHi: 'गुलाब', nameEn: 'Rose', icon: '🌹', stage: 1, maxStage: 3 },
    { id: 'plant-2', nameGu: 'સૂર્યમુખી', nameHi: 'सूरजमुखी', nameEn: 'Sunflower', icon: '🌻', stage: 0, maxStage: 3 },
  ],
  currentAvatar: {
    character: '🦁',
    hat: '👑',
    accessory: '🎒',
  },
  unlockedAvatarItems: ['item-hat-crown', 'item-acc-backpack', 'avatar-lion', 'avatar-bunny'],
  unlockedStickers: STARTER_UNLOCKED_STICKER_IDS,
  placedStickers: [],
  wrongAnswers: [],
};

export const storageService = {
  setUser(userId: string | number | null) {
    currentUserId = userId;
  },

  getUser(): string | number | null {
    return currentUserId;
  },

  setProfile(profileId: string | number | null) {
    currentProfileId = profileId;
  },

  getProfile(): string | number | null {
    return currentProfileId;
  },

  setPrimaryProfileId(id: string | number | null) {
    primaryProfileId = id;
    if (id !== null && id !== undefined) {
      AsyncStorage.setItem(STORAGE_KEYS.PRIMARY_PROFILE, String(id)).catch(() => {});
    } else {
      AsyncStorage.removeItem(STORAGE_KEYS.PRIMARY_PROFILE).catch(() => {});
    }
  },

  getPrimaryProfileId(): string | number | null {
    return primaryProfileId;
  },

  async loadPrimaryProfileId(): Promise<string | number | null> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.PRIMARY_PROFILE);
      if (stored !== null && stored !== undefined && stored.trim().length > 0) {
        primaryProfileId = stored;
        return stored;
      }
    } catch {}
    return primaryProfileId;
  },

  async removeProfileProgress(profileId: string | number): Promise<void> {
    try {
      const key = getProgressKeyForUser(currentUserId, profileId);
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.warn('Failed to remove profile progress:', e);
    }
  },

  /**
   * Moves a profile's saved progress to a new id (used when an offline-created profile receives
   * its server id). Never overwrites progress already stored under the new id.
   */
  async renameProfileProgress(oldId: string | number, newId: string | number): Promise<void> {
    try {
      const oldKey = getProgressKeyForUser(currentUserId, oldId);
      const newKey = getProgressKeyForUser(currentUserId, newId);
      if (oldKey !== newKey) {
        const [oldVal, newVal] = await Promise.all([AsyncStorage.getItem(oldKey), AsyncStorage.getItem(newKey)]);
        if (oldVal && !newVal) await AsyncStorage.setItem(newKey, oldVal);
        if (oldVal) await AsyncStorage.removeItem(oldKey);
      }
      if (currentProfileId !== null && String(currentProfileId) === String(oldId)) {
        currentProfileId = newId;
      }
    } catch (e) {
      console.warn('Failed to move profile progress:', e);
    }
  },

  getProgressKey(): string {
    return getProgressKeyForUser(currentUserId, currentProfileId);
  },

  async overwriteProgress(progress: UserProgress): Promise<UserProgress> {
    const task = saveQueue.then(async () => {
      try {
        const key = this.getProgressKey();
        await AsyncStorage.setItem(key, JSON.stringify(progress));
      } catch (e) {
        console.warn('Failed to overwrite progress:', e);
      }
      return progress;
    });
    saveQueue = task.catch(() => {});
    return task;
  },

  async resetUserProgress(
    preservedChildName?: string,
    preservedDetails?: Partial<Pick<UserProgress, 'firstName' | 'lastName' | 'dob' | 'hasCompletedFirstTimeName'>>
  ): Promise<UserProgress> {
    const task = saveQueue.then(async () => {
      try {
        const key = this.getProgressKey();
        const fresh: UserProgress = {
          ...DEFAULT_PROGRESS,
          childName: preservedChildName || '',
          firstName: preservedDetails?.firstName ?? '',
          lastName: preservedDetails?.lastName ?? '',
          dob: preservedDetails?.dob ?? '',
          hasCompletedFirstTimeName: preservedDetails?.hasCompletedFirstTimeName ?? false,
          streakDays: 1,
          lastStreakDate: getTodayDateKey(),
          completedLessons: [],
          stars: 0,
          coins: 50,
          coinsSpentTotal: 0,
          seeds: 5,
          water: 10,
          adventureLevel: 1,
          earnedBadges: ['badge-welcome'],
          gameStats: {},
          wrongAnswers: [],
          lastActive: new Date().toISOString(),
        };
        await AsyncStorage.setItem(key, JSON.stringify(fresh));
        return fresh;
      } catch (e) {
        console.warn('Failed to reset user progress:', e);
        return { ...DEFAULT_PROGRESS };
      }
    });
    saveQueue = task.catch(() => {});
    return task;
  },

  async getPreferences(): Promise<UserPreferences> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (data) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('Failed to read preferences from storage:', e);
    }
    return DEFAULT_PREFERENCES;
  },

  async savePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      const current = await this.getPreferences();
      const updated = { ...current, ...preferences };
      await AsyncStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn('Failed to save preferences to storage:', e);
      return { ...DEFAULT_PREFERENCES, ...preferences };
    }
  },

  async getProgress(): Promise<UserProgress> {
    try {
      const key = this.getProgressKey();
      let data = await AsyncStorage.getItem(key);
      if (!data && currentProfileId && String(currentProfileId) === String(primaryProfileId)) {
        const altKey = `${key}_profile_${currentProfileId}`;
        const altData = await AsyncStorage.getItem(altKey);
        if (altData) {
          data = altData;
        }
      }
      let base: UserProgress = { ...DEFAULT_PROGRESS };
      if (data) {
        const parsed = JSON.parse(data);
        base = {
          ...DEFAULT_PROGRESS,
          ...parsed,
          coins: parsed.coins ?? DEFAULT_PROGRESS.coins,
          seeds: parsed.seeds ?? DEFAULT_PROGRESS.seeds,
          water: parsed.water ?? DEFAULT_PROGRESS.water,
          adventureLevel: parsed.adventureLevel ?? DEFAULT_PROGRESS.adventureLevel,
          gardenPlants: parsed.gardenPlants ?? DEFAULT_PROGRESS.gardenPlants,
          currentAvatar: parsed.currentAvatar ?? DEFAULT_PROGRESS.currentAvatar,
          unlockedAvatarItems: parsed.unlockedAvatarItems ?? DEFAULT_PROGRESS.unlockedAvatarItems,
          unlockedStickers: parsed.unlockedStickers ?? DEFAULT_PROGRESS.unlockedStickers,
          placedStickers: parsed.placedStickers ?? DEFAULT_PROGRESS.placedStickers,
          wrongAnswers: parsed.wrongAnswers ?? DEFAULT_PROGRESS.wrongAnswers,
        };
      }

      // Automatically track and increment real daily streak
      const streakResult = calculateUpdatedStreak(base.streakDays, base.lastStreakDate);
      if (streakResult.changed) {
        base.streakDays = streakResult.streakDays;
        base.lastStreakDate = streakResult.lastStreakDate;
        AsyncStorage.setItem(key, JSON.stringify(base)).catch(() => {});
      }

      return base;
    } catch (e) {
      console.warn('Failed to read progress from storage:', e);
    }
    return DEFAULT_PROGRESS;
  },

  async saveProgress(progress: Partial<UserProgress>): Promise<UserProgress> {
    return (await this.mutateProgress(() => ({ patch: progress, result: null }))).progress;
  },

  /**
   * Atomic read-modify-write of the active profile's progress. `fn` runs inside the save queue
   * with the latest stored progress, so concurrent updates (rapid taps, coins from a game and a
   * mission at once) cannot read the same value and overwrite each other. Return `patch: null`
   * to write nothing.
   */
  async mutateProgress<R>(
    fn: (current: UserProgress) => { patch: Partial<UserProgress> | null; result: R }
  ): Promise<{ progress: UserProgress; result: R }> {
    const task = saveQueue.then(async () => {
      const current = await this.getProgress();
      const { patch, result } = fn(current);
      if (!patch) return { progress: current, result };
      const updated = { ...current, ...patch, lastActive: new Date().toISOString() };
      try {
        await AsyncStorage.setItem(this.getProgressKey(), JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save progress to storage:', e);
      }
      return { progress: updated, result };
    });
    saveQueue = task.catch(() => {});
    return task;
  },

  async addCoins(amount: number): Promise<UserProgress> {
    return (await this.mutateProgress((current) => ({
      patch: { coins: (current.coins || 0) + amount },
      result: null,
    }))).progress;
  },

  async markLessonCompleted(lessonId: string): Promise<{ isFirstTime: boolean; newStars: number }> {
    try {
      const { result } = await this.mutateProgress((current) => {
        if (current.completedLessons.includes(lessonId)) {
          return { patch: null, result: { isFirstTime: false, newStars: current.stars } };
        }
        const completedLessons = [...current.completedLessons, lessonId];
        const stars = current.stars + 1;
        const earnedBadges = [...current.earnedBadges];
        if (completedLessons.length >= 1 && !earnedBadges.includes('badge-first-step')) earnedBadges.push('badge-first-step');
        if (completedLessons.length >= 5 && !earnedBadges.includes('badge-scholar')) earnedBadges.push('badge-scholar');
        if (completedLessons.length >= 10 && !earnedBadges.includes('badge-master')) earnedBadges.push('badge-master');
        return {
          patch: {
            completedLessons,
            stars,
            coins: (current.coins || 0) + 10,
            seeds: (current.seeds || 0) + 1,
            water: (current.water || 0) + 2,
            earnedBadges,
          },
          // A double tap on "complete" now rewards (and celebrates) exactly once.
          result: { isFirstTime: true, newStars: stars },
        };
      });
      return result;
    } catch (e) {
      console.warn('Error marking lesson complete:', e);
      return { isFirstTime: false, newStars: 0 };
    }
  },

  async recordGameScore(gameType: string, score: number): Promise<void> {
    try {
      await this.mutateProgress((current) => {
        const existing = current.gameStats[gameType] || { highScore: 0, timesPlayed: 0 };
        return {
          patch: {
            gameStats: {
              ...current.gameStats,
              [gameType]: { highScore: Math.max(existing.highScore, score), timesPlayed: existing.timesPlayed + 1 },
            },
            // Award star & coins if score > 0
            stars: current.stars + (score > 0 ? 1 : 0),
            coins: (current.coins || 0) + 5,
            water: (current.water || 0) + 1,
          },
          result: null,
        };
      });
    } catch (e) {
      console.warn('Error recording game score:', e);
    }
  },

  async recordWrongAnswer(wrong: { id: string; prompt: string; correctOption: string; hint?: string; language?: AppLanguage }): Promise<void> {
    try {
      await this.mutateProgress((current) => {
        const existing = current.wrongAnswers || [];
        return { patch: existing.some((w) => w.id === wrong.id) ? null : { wrongAnswers: [...existing, wrong] }, result: null };
      });
    } catch (e) {
      console.warn('Error recording wrong answer:', e);
    }
  },

  async clearWrongAnswer(id: string): Promise<void> {
    try {
      await this.mutateProgress((current) => {
        const existing = current.wrongAnswers || [];
        const filtered = existing.filter((w) => w.id !== id);
        return { patch: filtered.length === existing.length ? null : { wrongAnswers: filtered }, result: null };
      });
    } catch (e) {
      console.warn('Error clearing wrong answer:', e);
    }
  },

  async spendCoins(amount: number): Promise<boolean> {
    try {
      if (!Number.isFinite(amount) || amount < 0) return false;
      if (amount === 0) return true; // free items
      // Check and deduct in one queued step: two rapid purchases can no longer both pass the check.
      const { result } = await this.mutateProgress((current) =>
        (current.coins || 0) >= amount
          ? {
              patch: {
                coins: (current.coins || 0) - amount,
                coinsSpentTotal: (current.coinsSpentTotal || 0) + amount,
              },
              result: true,
            }
          : { patch: null, result: false }
      );
      return result;
    } catch (e) {
      console.warn('Error spending coins:', e);
      return false;
    }
  },

  async resetAllData(): Promise<void> {
    try {
      const key = this.getProgressKey();
      await AsyncStorage.removeItem(STORAGE_KEYS.PREFERENCES);
      await AsyncStorage.removeItem(STORAGE_KEYS.PROGRESS);
      if (key !== STORAGE_KEYS.PROGRESS) {
        await AsyncStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('Error clearing storage:', e);
    }
  },
};
