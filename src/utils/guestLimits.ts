import AsyncStorage from '@react-native-async-storage/async-storage';

export const GUEST_DAILY_GAMES_MAX = 5;

function getTodayKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `guest_games_played_${year}-${month}-${day}`;
}

/**
 * Gets the number of games played today in Guest Mode.
 */
export async function getDailyGuestGamesPlayed(): Promise<number> {
  try {
    const key = getTodayKey();
    const val = await AsyncStorage.getItem(key);
    if (!val) return 0;
    const n = parseInt(val, 10);
    return isNaN(n) ? 0 : Math.max(0, n);
  } catch {
    return 0;
  }
}

/**
 * Increments the daily games played count for Guest Mode by 1.
 */
export async function incrementDailyGuestGames(): Promise<number> {
  try {
    const key = getTodayKey();
    const current = await getDailyGuestGamesPlayed();
    const next = current + 1;
    await AsyncStorage.setItem(key, String(next));
    return next;
  } catch {
    return 1;
  }
}

/**
 * Checks if the daily game limit has been reached for Guest Mode.
 */
export async function isGuestDailyGamesLimitReached(): Promise<boolean> {
  const count = await getDailyGuestGamesPlayed();
  return count >= GUEST_DAILY_GAMES_MAX;
}

