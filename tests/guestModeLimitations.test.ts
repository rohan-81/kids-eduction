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

import {
  GUEST_DAILY_GAMES_MAX,
  getDailyGuestGamesPlayed,
  incrementDailyGuestGames,
  isGuestDailyGamesLimitReached,
} from '../src/utils/guestLimits';

describe('Guest Mode Limitations and Safeguards', () => {
  beforeEach(async () => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  });

  it('enforces GUEST_DAILY_GAMES_MAX as 5', () => {
    expect(GUEST_DAILY_GAMES_MAX).toBe(5);
  });

  it('tracks and increments daily guest games accurately', async () => {
    let played = await getDailyGuestGamesPlayed();
    expect(played).toBe(0);
    expect(await isGuestDailyGamesLimitReached()).toBe(false);

    // Play 4 games
    for (let i = 1; i <= 4; i++) {
      const updated = await incrementDailyGuestGames();
      expect(updated).toBe(i);
    }

    played = await getDailyGuestGamesPlayed();
    expect(played).toBe(4);
    expect(await isGuestDailyGamesLimitReached()).toBe(false);

    // 5th game reached
    const fifth = await incrementDailyGuestGames();
    expect(fifth).toBe(5);
    expect(await isGuestDailyGamesLimitReached()).toBe(true);

    // 6th attempt stays reached
    const sixth = await incrementDailyGuestGames();
    expect(sixth).toBe(6);
    expect(await isGuestDailyGamesLimitReached()).toBe(true);
  });
});
