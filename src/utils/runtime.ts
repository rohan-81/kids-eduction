/** Small runtime helpers shared by services (kept dependency-free so tests can import them). */

/** Handle returned by setTimeout/setInterval in both React Native and Node/Jest. */
export type TimerHandle = ReturnType<typeof setTimeout>;

/**
 * Lets Node/Jest exit while a background timer is pending. React Native timers are plain
 * numbers without `unref`, so this is a no-op there.
 */
export function unrefTimer(timer: TimerHandle): void {
  const t = timer as unknown as { unref?: () => void };
  if (t && typeof t === 'object' && typeof t.unref === 'function') t.unref();
}

/** Human-readable message from any thrown value (Error, string, or something else). */
export function errorMessage(err: unknown, fallback = 'Unexpected error'): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === 'string' && err) return err;
  if (err && typeof err === 'object' && typeof (err as { message?: unknown }).message === 'string') {
    return (err as { message: string }).message || fallback;
  }
  return fallback;
}

/**
 * True for fetch aborts/timeouts. Checked structurally: React Native's fetch polyfill rejects
 * with a DOMException polyfill that is not guaranteed to extend Error.
 */
export function isAbortError(err: unknown): boolean {
  return !!err && typeof err === 'object' && (err as { name?: unknown }).name === 'AbortError';
}
