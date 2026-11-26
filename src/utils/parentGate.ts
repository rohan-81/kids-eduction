/**
 * Parental gate challenge. A two-digit multiplication question (12-19 x 3-9) that parents
 * answer quickly but children cannot: the app itself teaches the 1-10 times tables
 * (Ghadiya) to 6-8 year olds, so the previous 6-9 x 3-9 gate was solvable by the very
 * children it is meant to keep out. A fresh question is generated after every wrong
 * attempt, and 3 consecutive wrong answers lock the gate for 30 seconds so answers
 * can't be brute-forced by tapping.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GateChallenge {
  a: number;
  b: number;
  op?: '+' | '×';
  answer: number;
}

export const GATE_MAX_ATTEMPTS = 3;
export const GATE_LOCKOUT_MS = 30_000;

export function createGateChallenge(random: () => number = Math.random): GateChallenge {
  const a = 11 + Math.floor(random() * 9); // 11..19
  const b = 2 + Math.floor(random() * 8);  // 2..9
  return { a, b, op: '+', answer: a + b };
}

export function checkGateAnswer(challenge: GateChallenge, input: string): boolean {
  const trimmed = (input || '').trim();
  if (!/^\d{1,3}$/.test(trimmed)) return false;
  return parseInt(trimmed, 10) === challenge.answer;
}

/**
 * Lockout state is module-level (not component state) on purpose: the gate modal unmounts
 * when closed, so component state would let a child reset the lockout by cancel + reopen.
 * It is also persisted, so force-closing the app does not reset it either (audit P3).
 */
let consecutiveFailures = 0;
let lockedUntil = 0;

export const GATE_LOCKOUT_STORAGE_KEY = '@kidszone_parent_gate_lockout';

function persistGateState(): void {
  try {
    AsyncStorage.setItem(
      GATE_LOCKOUT_STORAGE_KEY,
      JSON.stringify({ consecutiveFailures, lockedUntil })
    ).catch(() => {});
  } catch {
    // Storage unavailable: the in-memory lockout still applies for this session.
  }
}

/**
 * Restores a persisted lockout (call before showing the gate). Never shortens an in-memory
 * lockout, and ignores implausible values (e.g. a device clock moved far into the past).
 */
export async function loadGateLockout(now: number = Date.now()): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(GATE_LOCKOUT_STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      const savedUntil = Number(saved?.lockedUntil) || 0;
      if (savedUntil > lockedUntil && savedUntil - now <= GATE_LOCKOUT_MS) lockedUntil = savedUntil;
      const savedFailures = Math.floor(Number(saved?.consecutiveFailures) || 0);
      if (savedFailures > consecutiveFailures && savedFailures < GATE_MAX_ATTEMPTS) {
        consecutiveFailures = savedFailures;
      }
    }
  } catch {
    // Corrupt or unavailable storage: keep in-memory state.
  }
  return getGateLockRemainingMs(now);
}

/** Milliseconds left on the lockout (0 when the gate is usable). */
export function getGateLockRemainingMs(now: number = Date.now()): number {
  return Math.max(0, lockedUntil - now);
}

/** Records a wrong answer; returns the lockout remaining (ms) if this failure triggered one. */
export function registerGateFailure(now: number = Date.now()): number {
  consecutiveFailures += 1;
  if (consecutiveFailures >= GATE_MAX_ATTEMPTS) {
    consecutiveFailures = 0;
    lockedUntil = now + GATE_LOCKOUT_MS;
  }
  persistGateState();
  return getGateLockRemainingMs(now);
}

/** Clears the failure streak after a correct answer. */
export function registerGateSuccess(): void {
  consecutiveFailures = 0;
  lockedUntil = 0;
  persistGateState();
}

/** Test helper: resets the module-level lockout state. */
export function resetGateLockout(): void {
  consecutiveFailures = 0;
  lockedUntil = 0;
  persistGateState();
}
