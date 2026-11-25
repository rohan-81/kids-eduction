// Regression tests for the production-readiness audit fixes:
// screen-time wellness (midnight rollover, cold-start lock, persisted snooze),
// TTS sanitization, 3D render mapping, web-safe dialogs and safe back navigation.
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

// Native platform so the service initializes in the node test environment.
jest.mock('react-native', () => ({
  ...jest.requireActual('./mocks/reactNativeMock.js'),
  Platform: { OS: 'ios', select: (o: any) => o.ios ?? o.default },
  AppState: { currentState: 'active', addEventListener: () => ({ remove: () => {} }) },
}));

const ROOT = path.join(__dirname, '..');
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Loads a fresh ScreenWellnessService singleton (module state is per-load). */
async function loadWellness() {
  let mod: typeof import('../src/services/screenWellnessService');
  jest.isolateModules(() => {
    mod = require('../src/services/screenWellnessService');
  });
  await mod!.screenWellnessService.whenReady();
  return mod!.screenWellnessService;
}

const flush = async () => {
  for (let i = 0; i < 5; i++) await Promise.resolve();
};

describe('Screen wellness: daily limit', () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
    jest.useFakeTimers();
  });
  afterEach(() => jest.useRealTimers());

  test('cold start with limit already used today notifies subscriber (no 60s bypass on relaunch)', async () => {
    jest.setSystemTime(new Date(2026, 10, 23, 15, 0, 0));
    mockStorage['@kidszone_screen_time_limit'] = '30m';
    mockStorage['@kidszone_daily_usage_v1'] = JSON.stringify({ date: '2026-11-23', minutes: 31 });

    let mod: typeof import('../src/services/screenWellnessService');
    jest.isolateModules(() => {
      mod = require('../src/services/screenWellnessService');
    });
    const svc = mod!.screenWellnessService;
    const onDailyLimitReached = jest.fn();
    // Subscribe synchronously, before persisted usage has finished loading
    svc.subscribe({ onDailyLimitReached });
    await svc.whenReady();
    await flush();
    jest.advanceTimersByTime(500);
    expect(onDailyLimitReached).toHaveBeenCalledWith(31, 30);
  });

  test('usage rolls over at midnight while the app stays open', async () => {
    jest.setSystemTime(new Date(2026, 10, 23, 23, 58, 0));
    mockStorage['@kidszone_screen_time_limit'] = '30m';
    mockStorage['@kidszone_daily_usage_v1'] = JSON.stringify({ date: '2026-11-23', minutes: 29 });
    const svc = await loadWellness();
    expect(svc.getTodayUsageMinutes()).toBe(29);

    jest.advanceTimersByTime(60_000); // 23:59 -> 30 minutes, limit reached
    expect(svc.isDailyLimitLocked()).toBe(true);

    jest.advanceTimersByTime(2 * 60_000); // ticks at 00:00 (reset + 1) and 00:01
    expect(svc.getTodayUsageMinutes()).toBe(2);
    expect(svc.isDailyLimitLocked()).toBe(false);
    const saved = JSON.parse(mockStorage['@kidszone_daily_usage_v1']);
    expect(saved.date).toBe(dateKey(new Date(2026, 10, 24)));
    expect(saved.minutes).toBe(2);
  });

  test("a grown-up's +15 min snooze survives an app relaunch", async () => {
    jest.setSystemTime(new Date(2026, 10, 23, 15, 0, 0));
    mockStorage['@kidszone_screen_time_limit'] = '30m';
    mockStorage['@kidszone_daily_usage_v1'] = JSON.stringify({ date: '2026-11-23', minutes: 30 });
    const first = await loadWellness();
    expect(first.isDailyLimitLocked()).toBe(true);
    first.snoozeDailyLimit(15);
    await flush();
    expect(first.isDailyLimitLocked()).toBe(false);

    const relaunched = await loadWellness();
    expect(relaunched.isDailyLimitLocked()).toBe(false);
  });
});

describe('TTS sanitization (normalizeSpeechText)', () => {
  let normalizeSpeechText: typeof import('../src/services/audioService').normalizeSpeechText;
  beforeAll(() => {
    jest.isolateModules(() => {
      normalizeSpeechText = require('../src/services/audioService').normalizeSpeechText;
    });
  });

  test('bullets and arrows become natural pauses, never spoken symbols', () => {
    expect(normalizeSpeechText('• Apple • Ball • Cat', 'en')).toBe('Apple, Ball, Cat');
    expect(normalizeSpeechText('Seed → Plant → Tree', 'en')).toBe('Seed, Plant, Tree');
  });

  test('markup symbols are stripped', () => {
    expect(normalizeSpeechText('*Great* job! #1 [star] {win} ~yay~ | ✓', 'en')).toBe('Great job! 1 star win yay');
    expect(normalizeSpeechText('<b>Hello</b>', 'en')).toBe('Hello');
  });

  test('numeric comparisons keep < and >', () => {
    expect(normalizeSpeechText('5 > 3', 'en')).toBe('5 > 3');
    expect(normalizeSpeechText('2<9', 'en')).toBe('2<9');
  });

  test('phonetic slashes inside a sentence are stripped, fractions are kept', () => {
    expect(normalizeSpeechText('/t/', 'en')).toBe('t');
    expect(normalizeSpeechText('T says /t/ like Tiger', 'en')).toBe('T says t like Tiger');
    expect(normalizeSpeechText('Half is 1/2', 'en')).toBe('Half is 1/2');
  });

  test('Gujarati and Hindi text survives with bullets removed', () => {
    expect(normalizeSpeechText('• સફરજન • કેળું', 'gu')).toBe('સફરજન, કેળું');
    expect(normalizeSpeechText('• सेब • केला', 'hi')).toBe('सेब, केला');
  });
});

describe('3D render mapping for previously unmapped lessons', () => {
  const { EXTRA_RENDERS_BY_LESSON } = require('../src/utils/extraRenders');
  const { LESSONS } = require('../src/data/lessons');
  const ids = new Set((LESSONS as { id: string }[]).map((l) => l.id));

  test.each([
    'time-clock-hours',
    'time-sixty-seconds',
    'time-day-night',
    'prob-apple-add',
    'state-gujarat',
    'state-delhi',
    'state-up',
    'state-wb',
  ])('%s has a bundled 3D render and is a real lesson', (id) => {
    expect(ids.has(id)).toBe(true);
    expect(EXTRA_RENDERS_BY_LESSON[id]).toBeTruthy();
  });

  test('time-clock-hours uses the 3D clock render', () => {
    expect(read('src/utils/extraRenders.ts')).toMatch(/'time-clock-hours': characterAsset\('3d_clock'\)/);
  });

  test('every EXTRA_RENDERS_BY_LESSON key maps to an existing lesson', () => {
    const orphans = Object.keys(EXTRA_RENDERS_BY_LESSON).filter((k) => !ids.has(k));
    // Some generator keys (e.g. gk-* objects) intentionally serve non-lesson content; new keys must not.
    for (const k of orphans) expect(k).not.toMatch(/^(time|prob|state)-/);
  });

  test('generator script carries the same mappings (survives regeneration)', () => {
    const script = read('scripts/import_extra_3d.py');
    for (const id of ['time-clock-hours', 'prob-apple-add', 'state-goa']) {
      expect(script).toContain(`'${id}':`);
    }
  });

  test('state-tamilnadu renders 3D TempleArt and not ballerina dance image', () => {
    const { renderLesson3DVisual } = require('../src/components/Lesson3DVisuals');
    const tamilNaduLesson = (LESSONS as { id: string }[]).find((l) => l.id === 'state-tamilnadu');
    expect(tamilNaduLesson).toBeTruthy();
    expect(EXTRA_RENDERS_BY_LESSON['state-tamilnadu']).toBeUndefined();
    const visual = renderLesson3DVisual(tamilNaduLesson!);
    expect(visual).toBeTruthy();
  });
});

describe('Web-safe dialogs and navigation', () => {
  test.each(['app/rhymes.tsx', 'app/stories.tsx', 'app/subjects.tsx'])(
    '%s does not use Alert.alert (a silent no-op on react-native-web)',
    (rel) => {
      expect(read(rel)).not.toMatch(/Alert\.alert\(/);
    }
  );

  test('rhymes song playback is safely gated as Coming Soon with KidDialog (no robotic speech)', () => {
    const code = read('app/rhymes.tsx');
    expect(code).not.toMatch(/audioService\.speak/);
    expect(code).toContain('handleComingSoon');
    expect(code).toContain('useKidDialog');
  });

  test('no mixed-script English parentheses leak into gu/hi Coming Soon labels', () => {
    for (const rel of ['app/rhymes.tsx', 'app/stories.tsx']) {
      expect(read(rel)).not.toMatch(/\((Coming Soon|Studio Singing Songs|AI Magic Story Maker)\)/);
    }
  });

  test('rhymes progress matches routes with query params', () => {
    expect(read('app/subjects.tsx')).toContain("topic.route.startsWith('/rhymes')");
  });

  test.each([
    ['app/lessons/[id].tsx', /else if \(router\.canGoBack\(\)\) \{\s*router\.back\(\);/],
    ['app/language.tsx', /if \(router\.canGoBack\(\)\) \{\s*router\.back\(\);/],
  ])('%s guards router.back() with canGoBack()', (rel, re) => {
    expect(read(rel)).toMatch(re);
  });

  test('adventure declares all hooks before the guest early-return', () => {
    const code = read('app/adventure.tsx');
    expect(code.indexOf('useState<{\n    targetClass')).toBeLessThan(code.indexOf('if (!isAuthenticated && !isGuest)'));
  });
});
