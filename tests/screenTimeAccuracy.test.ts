import fs from 'fs';
import path from 'path';

const mockStorage: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (key: string) => mockStorage[key] ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      mockStorage[key] = value;
    }),
    removeItem: jest.fn(async (key: string) => {
      delete mockStorage[key];
    }),
  },
}));

let mockAppState: 'active' | 'background' | 'inactive' = 'active';
let appStateChangeHandler: ((next: 'active' | 'background' | 'inactive') => void) | null = null;

jest.mock('react-native', () => ({
  ...jest.requireActual('./mocks/reactNativeMock.js'),
  Platform: { OS: 'android', select: (o: Record<string, unknown>) => o.android ?? o.default },
  AppState: {
    get currentState() {
      return mockAppState;
    },
    addEventListener: jest.fn((_event: string, cb: (next: 'active' | 'background' | 'inactive') => void) => {
      appStateChangeHandler = cb;
      return { remove: jest.fn() };
    }),
  },
}));

async function loadFreshWellness() {
  let mod: typeof import('../src/services/screenWellnessService');
  jest.isolateModules(() => {
    mod = require('../src/services/screenWellnessService');
  });
  await mod!.screenWellnessService.whenReady();
  return mod!;
}

describe('Real screen time & weekly history accuracy', () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
    mockAppState = 'active';
    appStateChangeHandler = null;
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('accumulates exact active foreground seconds across background transitions without double counting or inflating', async () => {
    // Thursday Nov 26, 2026 10:00:00
    jest.setSystemTime(new Date(2026, 10, 26, 10, 0, 0));
    const { screenWellnessService: day1Svc } = await loadFreshWellness();

    // User spends 6 minutes 20 seconds in foreground on Thursday across two sessions
    jest.advanceTimersByTime(4 * 60_000 + 20_000);
    appStateChangeHandler?.('background');
    expect(day1Svc.getTodayUsageMinutes()).toBe(4);
    expect(day1Svc.getTodayUsageSeconds()).toBe(260);

    // 3 hours pass while app is backgrounded -> MUST NOT count toward screen time
    jest.advanceTimersByTime(3 * 60 * 60_000);
    expect(day1Svc.getTodayUsageMinutes()).toBe(4);

    // User returns to foreground for another 2 minutes (total Thu = 6m20s -> 6m)
    appStateChangeHandler?.('active');
    jest.advanceTimersByTime(2 * 60_000);
    day1Svc.flushActiveTime();
    expect(day1Svc.getTodayUsageMinutes()).toBe(6);
    expect(day1Svc.getUsageMinutesForDate('2026-11-26')).toBe(6);

    // Next day: Friday Nov 27, 2026 09:00:00 (new session / relaunch)
    jest.setSystemTime(new Date(2026, 10, 27, 9, 0, 0));
    const { screenWellnessService: day2Svc } = await loadFreshWellness();

    // Thursday's 6m must remain accurately preserved in history, while Friday starts at 0m
    expect(day2Svc.getTodayUsageMinutes()).toBe(0);
    expect(day2Svc.getUsageMinutesForDate('2026-11-26')).toBe(6);
    expect(day2Svc.getTotalTrackedMinutes()).toBe(6);

    // User spends 6 minutes on Friday
    jest.advanceTimersByTime(6 * 60_000);
    expect(day2Svc.getTodayUsageMinutes()).toBe(6);
    expect(day2Svc.getUsageMinutesForDate('2026-11-27')).toBe(6);
    expect(day2Svc.getTotalTrackedMinutes()).toBe(12);
  });

  test('progress.tsx and parents.tsx read real tracked time instead of fake lesson multipliers', () => {
    const progressSrc = fs.readFileSync(path.join(__dirname, '../app/progress.tsx'), 'utf8');
    const parentsSrc = fs.readFileSync(path.join(__dirname, '../app/parents.tsx'), 'utf8');

    expect(progressSrc).toContain('screenWellnessService.getTotalTrackedMinutes()');
    expect(progressSrc).toContain('screenWellnessService.getUsageMinutesForDate(dayKey)');
    expect(progressSrc).not.toContain('completedCount * 2 + totalGamesPlayed * 1.5');
    expect(progressSrc).not.toContain('Math.max(todayTrackedMinutes, Math.min(totalLearningMinutes, 15))');

    expect(parentsSrc).toContain('screenWellnessService.getTotalTrackedMinutes()');
    expect(parentsSrc).not.toContain('progress.completedLessons.length * 2 + totalGamesPlayed * 1.5');
  });
});

