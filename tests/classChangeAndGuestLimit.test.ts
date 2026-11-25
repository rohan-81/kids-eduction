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

import { backendService } from '../src/services/backendService';
import { storageService } from '../src/services/storageService';

describe('Class Change and Guest Mode Limitations', () => {
  beforeEach(async () => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
    storageService.setUser(null);
    storageService.setProfile(null);
  });

  test('backendService.updateProfileAgeGroup updates profile age_group in storage', async () => {
    // Set an initial guest profile
    const initial = await backendService.setGuestProfile('Little Star', '2-4', 'avatar_3d_boy');
    expect(initial.age_group).toBe('2-4');

    // Update age group to 6-8 (Class 3-5)
    await backendService.updateProfileAgeGroup(initial.id, '6-8');

    // Fetch profiles and verify
    const profiles = await backendService.getProfiles();
    expect(profiles.length).toBe(1);
    expect(profiles[0].age_group).toBe('6-8');
  });

  test('Class change saves preferences and persists across reload', async () => {
    await storageService.savePreferences({ ageGroup: '2-4', selectedClass: 'pre-school' });
    let prefs = await storageService.getPreferences();
    expect(prefs.ageGroup).toBe('2-4');

    // Change to class-3-5
    await storageService.savePreferences({ ageGroup: '6-8', selectedClass: 'class-3-5' });
    prefs = await storageService.getPreferences();
    expect(prefs.ageGroup).toBe('6-8');
    expect(prefs.selectedClass).toBe('class-3-5');
  });

  test('Guest mode profile remains single and isolated', async () => {
    const guestProf = await backendService.setGuestProfile('Aarav', '4-6', '🦁');
    expect(guestProf.nickname).toBe('Aarav');
    expect(guestProf.age_group).toBe('4-6');

    // Switch age group to 6-8
    await backendService.updateProfileAgeGroup(guestProf.id, '6-8');
    const updatedProfiles = await backendService.getProfiles();
    expect(updatedProfiles.length).toBe(1);
    expect(updatedProfiles[0].age_group).toBe('6-8');
  });
});
