// Logic behind the redesigned popups: parental math gate, victory-popup stars,
// and the "Next Game" route.
import {
  createGateChallenge,
  checkGateAnswer,
  registerGateFailure,
  registerGateSuccess,
  getGateLockRemainingMs,
  resetGateLockout,
  GATE_LOCKOUT_MS,
} from '../src/utils/parentGate';
import { getRoundStars, getNextGameRoute } from '../src/utils/gameRound';

describe('Parental math gate', () => {
  test('always a two-digit multiplication in the 12-19 x 3-9 range', () => {
    for (let i = 0; i < 500; i++) {
      const c = createGateChallenge();
      expect(c.a).toBeGreaterThanOrEqual(12);
      expect(c.a).toBeLessThanOrEqual(19);
      expect(c.b).toBeGreaterThanOrEqual(3);
      expect(c.b).toBeLessThanOrEqual(9);
      expect(c.answer).toBe(c.a * c.b);
    }
  });

  test('covers the extremes of the range deterministically', () => {
    expect(createGateChallenge(() => 0)).toEqual({ a: 12, b: 3, answer: 36 });
    expect(createGateChallenge(() => 0.999)).toEqual({ a: 19, b: 9, answer: 171 });
  });

  test('never asks a 1-10 times-table question the app teaches to children', () => {
    for (let i = 0; i < 500; i++) {
      expect(createGateChallenge().a).toBeGreaterThan(10);
    }
  });

  test('answers always fit the 3-digit keypad display', () => {
    for (let i = 0; i < 500; i++) {
      expect(String(createGateChallenge().answer).length).toBeLessThanOrEqual(3);
    }
  });

  test('accepts only the exact numeric answer', () => {
    const c = { a: 7, b: 8, answer: 56 };
    expect(checkGateAnswer(c, '56')).toBe(true);
    expect(checkGateAnswer(c, ' 56 ')).toBe(true);
    expect(checkGateAnswer(c, '55')).toBe(false);
    expect(checkGateAnswer(c, '')).toBe(false);
    expect(checkGateAnswer(c, '5a')).toBe(false);
    expect(checkGateAnswer(c, '-56')).toBe(false);
    expect(checkGateAnswer(c, '0056')).toBe(false);
  });
});

describe('Parental gate lockout', () => {
  beforeEach(() => resetGateLockout());

  test('locks for 30 seconds after 3 consecutive wrong answers', () => {
    const t0 = 1_000_000;
    expect(registerGateFailure(t0)).toBe(0);
    expect(registerGateFailure(t0)).toBe(0);
    expect(registerGateFailure(t0)).toBe(GATE_LOCKOUT_MS);
    expect(getGateLockRemainingMs(t0 + 10_000)).toBe(20_000);
    expect(getGateLockRemainingMs(t0 + GATE_LOCKOUT_MS)).toBe(0);
  });

  test('a correct answer resets the failure streak', () => {
    const t0 = 2_000_000;
    registerGateFailure(t0);
    registerGateFailure(t0);
    registerGateSuccess();
    expect(registerGateFailure(t0)).toBe(0);
    expect(getGateLockRemainingMs(t0)).toBe(0);
  });
});

describe('Victory popup stars', () => {
  test('stars scale with the share of correct answers', () => {
    expect(getRoundStars(10, 10)).toBe(3);
    expect(getRoundStars(9, 10)).toBe(3);
    expect(getRoundStars(6, 10)).toBe(2);
    expect(getRoundStars(5, 10)).toBe(1);
    expect(getRoundStars(0, 10)).toBe(1);
  });

  test('running out of hearts gives at most one encouraging star', () => {
    expect(getRoundStars(8, 10, true)).toBe(1);
    expect(getRoundStars(0, 10, true)).toBe(0);
  });

  test('empty rounds do not divide by zero', () => {
    expect(getRoundStars(0, 0)).toBe(1);
  });
});

describe('Next Game route', () => {
  const routes = ['/games/balloon-pop', '/games/counting', '/games/duel', '/games/memory-match', '/subjects'];

  test('goes to the next single-player game in hub order', () => {
    expect(getNextGameRoute('balloon-pop', routes)).toBe('/games/counting');
  });

  test('skips the two-player duel and non-game routes', () => {
    expect(getNextGameRoute('counting', routes)).toBe('/games/memory-match');
  });

  test('wraps around after the last game', () => {
    expect(getNextGameRoute('memory-match', routes)).toBe('/games/balloon-pop');
  });

  test('unknown current game starts at the first game; a lone game has no next', () => {
    expect(getNextGameRoute('mystery', routes)).toBe('/games/balloon-pop');
    expect(getNextGameRoute('counting', ['/games/counting'])).toBeNull();
    expect(getNextGameRoute('counting', [])).toBeNull();
  });
});
