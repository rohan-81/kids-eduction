/**
 * Pure helpers for the end-of-round victory popup (unit-tested).
 */

/** 1-3 stars for a finished round; 0-1 when the round ended because hearts ran out. */
export function getRoundStars(score: number, total: number, outOfLives = false): 0 | 1 | 2 | 3 {
  if (outOfLives) return score > 0 ? 1 : 0;
  const ratio = total > 0 ? score / total : 0;
  return ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1;
}

/**
 * "Next Game" target: the next single-player game after the current one, in
 * Games-hub order (wrapping around). Two-player duel and non-game routes are
 * skipped. Returns null when there is no other game.
 */
export function getNextGameRoute<R extends string>(currentType: string, routes: readonly R[]): R | null {
  const current = `/games/${currentType}`;
  const games = routes.filter((r) => /^\/games\/[\w-]+$/.test(r) && r !== '/games/duel');
  if (games.length === 0) return null;
  const idx = games.findIndex((r) => r === current);
  const next = games[(idx + 1) % games.length];
  return next === current ? null : next;
}
