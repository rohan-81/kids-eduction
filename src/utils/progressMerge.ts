import type { UserProgress } from '../types';
import type { CloudSyncResponse } from '../types/api';

export type ServerMergedFields = Pick<UserProgress, 'coins' | 'stars' | 'adventureLevel' | 'completedLessons' | 'coinsSpentTotal'>;

/**
 * Merges the authoritative state returned by POST /api/sync/ into local progress, using the
 * same monotonic rules as the server (max for counters, union for completed lessons).
 * Returns the fields to save, or null when nothing changed (or there is no server state).
 */
export function mergeServerProgress(
  local: Pick<UserProgress, 'coins' | 'stars' | 'adventureLevel' | 'completedLessons' | 'coinsSpentTotal'>,
  server: CloudSyncResponse | null | undefined
): ServerMergedFields | null {
  if (!server?.wallet) return null;
  const localLessons = local.completedLessons || [];
  const serverLessons = (server.lessons || []).map((l) => l.lesson_slug).filter((s): s is string => !!s);

  const merged: ServerMergedFields = {
    coins: Math.max(local.coins || 0, Number(server.wallet.total_coins) || 0),
    stars: Math.max(local.stars || 0, Number(server.wallet.total_stars) || 0),
    adventureLevel: Math.max(local.adventureLevel || 1, Number(server.adventure_level) || 1),
    completedLessons: Array.from(new Set([...localLessons, ...serverLessons])),
    // Another device's purchases raise the shared lifetime counter; adopt it so this device's
    // next spend is counted on top of it rather than ignored.
    coinsSpentTotal: Math.max(local.coinsSpentTotal || 0, Number(server.coins_spent_total) || 0),
  };

  const changed =
    merged.coins !== local.coins ||
    merged.stars !== local.stars ||
    merged.adventureLevel !== local.adventureLevel ||
    merged.coinsSpentTotal !== (local.coinsSpentTotal || 0) ||
    merged.completedLessons.length !== localLessons.length;
  return changed ? merged : null;
}
