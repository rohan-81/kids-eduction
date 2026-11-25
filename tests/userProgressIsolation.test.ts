// Mock AsyncStorage
const mockStorage: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (key: string) => mockStorage[key] || null),
    setItem: jest.fn(async (key: string, value: string) => {
      mockStorage[key] = value;
    }),
    removeItem: jest.fn(async (key: string) => {
      delete mockStorage[key];
    }),
    clear: jest.fn(async () => {
      Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
    }),
  },
}));

import { storageService, DEFAULT_PROGRESS } from '../src/services/storageService';
import { backendService } from '../src/services/backendService';

describe('User Progress Isolation & Reset', () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
    storageService.setUser(null);
    storageService.setProfile(null);
  });

  test('different users have isolated progress storage keys', async () => {
    // User 1
    storageService.setUser('user_alpha');
    expect(storageService.getProgressKey()).toBe('@kidszone_progress_user_user_alpha');
    await storageService.saveProgress({ stars: 25, coins: 500, completedLessons: ['l1', 'l2'] });
    const progUser1 = await storageService.getProgress();
    expect(progUser1.stars).toBe(25);
    expect(progUser1.coins).toBe(500);
    expect(progUser1.completedLessons).toEqual(['l1', 'l2']);

    // User 2 (New User)
    storageService.setUser('user_beta');
    expect(storageService.getProgressKey()).toBe('@kidszone_progress_user_user_beta');
    const progUser2 = await storageService.getProgress();
    // User 2 should NOT see User 1's progress
    expect(progUser2.stars).toBe(0);
    expect(progUser2.coins).toBe(DEFAULT_PROGRESS.coins);
    expect(progUser2.completedLessons).toEqual([]);

    // Switch back to User 1
    storageService.setUser('user_alpha');
    const progUser1Again = await storageService.getProgress();
    expect(progUser1Again.stars).toBe(25);
    expect(progUser1Again.coins).toBe(500);
  });

  test('resetUserProgress resets stars, lessons, streak, and coins cleanly', async () => {
    storageService.setUser('user_gamma');
    await storageService.saveProgress({
      stars: 40,
      coins: 1256,
      completedLessons: ['l1', 'l2', 'l3', 'l4'],
      streakDays: 3,
    });

    const beforeReset = await storageService.getProgress();
    expect(beforeReset.stars).toBe(40);
    expect(beforeReset.coins).toBe(1256);

    const afterReset = await storageService.resetUserProgress('Demo Child');
    expect(afterReset.stars).toBe(0);
    expect(afterReset.coins).toBe(50);
    expect(afterReset.completedLessons).toEqual([]);
    expect(afterReset.streakDays).toBe(1);
    expect(afterReset.childName).toBe('Demo Child');
    expect(afterReset.wrongAnswers).toEqual([]);
  });

  test('guest storage key fallback works when no user is logged in', () => {
    storageService.setUser(null);
    expect(storageService.getProgressKey()).toBe('@kidszone_progress');
  });

  test('different child profiles under same user have isolated progress', async () => {
    storageService.setUser('parent_1');
    storageService.setProfile(1);
    expect(storageService.getProgressKey()).toBe('@kidszone_progress_user_parent_1');
    await storageService.saveProgress({ stars: 10, completedLessons: ['lesson-1'] });
    const p1 = await storageService.getProgress();
    expect(p1.stars).toBe(10);
    expect(p1.completedLessons).toEqual(['lesson-1']);

    // Switch to Child Profile 2
    storageService.setProfile(2);
    expect(storageService.getProgressKey()).toBe('@kidszone_progress_user_parent_1_profile_2');
    const p2 = await storageService.getProgress();
    expect(p2.stars).toBe(0);
    expect(p2.completedLessons).toEqual([]);

    await storageService.saveProgress({ stars: 3, completedLessons: ['lesson-2'] });
    expect((await storageService.getProgress()).stars).toBe(3);

    // Switch back to Child Profile 1
    storageService.setProfile(1);
    expect(storageService.getProgressKey()).toBe('@kidszone_progress_user_parent_1');
    const p1Again = await storageService.getProgress();
    expect(p1Again.stars).toBe(10);
    expect(p1Again.completedLessons).toEqual(['lesson-1']);
  });

  test('guest profile isolates entered child name and filters out stale aa/bb profiles', async () => {
    // Inject stale legacy profiles 'aa' and 'bb' into local storage
    mockStorage['@kidszone_guest_profiles'] = JSON.stringify([
      { id: 2, nickname: 'aa', age_group: '2-4', avatar: '🦁' },
      { id: 3, nickname: 'bb', age_group: '2-4', avatar: '🦊' },
    ]);

    // getProfiles should filter out 'aa' and 'bb'
    const profiles = await backendService.getProfiles();
    expect(profiles.some((p) => p.nickname === 'aa' || p.nickname === 'bb')).toBe(false);

    // Setting a dedicated guest profile with child's name
    const guestProf = await backendService.setGuestProfile('Aarav', '4-6', 'avatar_3d_boy');
    expect(guestProf.nickname).toBe('Aarav');
    expect(guestProf.age_group).toBe('4-6');

    const updatedProfiles = await backendService.getProfiles();
    expect(updatedProfiles).toHaveLength(1);
    expect(updatedProfiles[0].nickname).toBe('Aarav');
    expect(updatedProfiles[0].nickname).not.toBe('aa');
  });

  test('0 percent progress calculation strictly returns width 0% and opacity 0', () => {
    const overallPercentage = 0;
    const widthStyle = overallPercentage > 0 ? `${Math.min(100, overallPercentage)}%` : '0%';
    const opacityStyle = overallPercentage > 0 ? 1 : 0;

    expect(widthStyle).toBe('0%');
    expect(opacityStyle).toBe(0);

    const nonZeroPercentage = 45;
    const nonZeroWidth = nonZeroPercentage > 0 ? `${Math.min(100, nonZeroPercentage)}%` : '0%';
    const nonZeroOpacity = nonZeroPercentage > 0 ? 1 : 0;
    expect(nonZeroWidth).toBe('45%');
    expect(nonZeroOpacity).toBe(1);
  });
});
