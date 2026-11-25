// Final hardening: behavioural tests against the real modules (no copies of app logic).
import fs from 'fs';
import path from 'path';

const ROOT = path.join(__dirname, '..');

// ---------------------------------------------------------------------------------------------
// 1. Duel round controller (used by app/games/duel.tsx)
// ---------------------------------------------------------------------------------------------
describe('Duel round controller', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const make = (total = 3) => {
    const { createDuelRoundController } = require('../src/utils/duelRound');
    const events: string[] = [];
    const c = createDuelRoundController(total, 1200, {
      onRoundStart: (r: number) => events.push(`round:${r}`),
      onGameOver: () => events.push('gameover'),
    });
    return { c, events };
  };

  test('advances one question per feedback pause, then ends the game exactly once', () => {
    const { c, events } = make(3);
    c.scheduleAdvance();
    jest.advanceTimersByTime(1199);
    expect(events).toEqual([]); // still in the feedback pause
    jest.advanceTimersByTime(1);
    c.scheduleAdvance();
    jest.advanceTimersByTime(1200);
    c.scheduleAdvance();
    jest.advanceTimersByTime(1200);
    expect(events).toEqual(['round:1', 'round:2', 'gameover']);

    // Further schedules after game over are ignored: no second game over / coin award.
    c.scheduleAdvance();
    jest.advanceTimersByTime(5000);
    expect(events.filter((e) => e === 'gameover')).toHaveLength(1);
  });

  test('a second schedule during the pause replaces the first (never double-advances)', () => {
    const { c, events } = make(5);
    c.scheduleAdvance();
    jest.advanceTimersByTime(600);
    c.scheduleAdvance();
    jest.advanceTimersByTime(5000);
    expect(events).toEqual(['round:1']);
  });

  test('Reset mid-game during the pause: the new game starts at question 0, nothing skipped', () => {
    const { c, events } = make(5);
    c.scheduleAdvance();
    jest.advanceTimersByTime(1200); // now on question 1
    c.scheduleAdvance(); // answered question 1
    jest.advanceTimersByTime(300);
    c.reset();
    jest.advanceTimersByTime(5000);
    expect(c.round).toBe(0);
    expect(events).toEqual(['round:1']);

    // The fresh game advances normally from 0.
    c.scheduleAdvance();
    jest.advanceTimersByTime(1200);
    expect(events).toEqual(['round:1', 'round:1']);
    expect(c.round).toBe(1);
  });

  test('cancel (exit / unmount / blur) drops the pending advance', () => {
    const { c, events } = make(2);
    c.scheduleAdvance();
    jest.advanceTimersByTime(1200);
    c.scheduleAdvance(); // final answer
    c.cancel();
    jest.advanceTimersByTime(5000);
    expect(events).toEqual(['round:1']); // no game over, so no coins awarded after leaving
    expect(c.hasPendingAdvance).toBe(false);
  });

  test('duel.tsx drives the controller and keeps side effects out of state updaters', () => {
    const code = fs.readFileSync(path.join(ROOT, 'app/games/duel.tsx'), 'utf8');
    expect(code).toContain('createDuelRoundController(');
    expect(code).not.toMatch(/setCurrentRound\(\s*\(\s*prev/); // no functional updater with side effects
    expect(code).toContain('roundController.reset()');
  });
});

// ---------------------------------------------------------------------------------------------
// 2. Unconfigured release bundle must still boot (no throw while modules load)
// ---------------------------------------------------------------------------------------------
describe('Release boot without EXPO_PUBLIC_API_URL', () => {
  const saved = { NODE_ENV: process.env.NODE_ENV, API: process.env.EXPO_PUBLIC_API_URL, MEDIA: process.env.EXPO_PUBLIC_MEDIA_URL };
  const savedDev = (global as any).__DEV__;

  beforeEach(() => {
    process.env.NODE_ENV = 'production';
    (global as any).__DEV__ = false;
    delete process.env.EXPO_PUBLIC_API_URL;
    delete process.env.EXPO_PUBLIC_MEDIA_URL;
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    process.env.NODE_ENV = saved.NODE_ENV;
    if (saved.API === undefined) delete process.env.EXPO_PUBLIC_API_URL;
    else process.env.EXPO_PUBLIC_API_URL = saved.API;
    if (saved.MEDIA === undefined) delete process.env.EXPO_PUBLIC_MEDIA_URL;
    else process.env.EXPO_PUBLIC_MEDIA_URL = saved.MEDIA;
    (global as any).__DEV__ = savedDev;
    (console.error as jest.Mock).mockRestore();
  });

  test.each([
    '../src/services/apiConfig',
    '../src/utils/animalRenders',
    '../src/utils/extraRenders',
    '../src/utils/imageHelper',
    '../src/components/SubjectBadgeIcons',
    '../src/components/Lesson3DVisuals',
    '../src/services/rhymeAudioService',
    '../src/services/apiService',
  ])('%s loads without throwing', (mod) => {
    jest.isolateModules(() => {
      expect(() => require(mod)).not.toThrow();
    });
  });

  test('safe resolver falls back offline and records the error; strict resolver still throws', () => {
    jest.isolateModules(() => {
      const cfg = require('../src/services/apiConfig');
      expect(cfg.safeGetApiBaseUrl()).toBe(cfg.OFFLINE_FALLBACK_API_URL);
      expect(cfg.API_BASE_URL).toBe(cfg.OFFLINE_FALLBACK_API_URL);
      expect(cfg.getApiConfigError()).toMatch(/EXPO_PUBLIC_API_URL/);
      expect(() => cfg.getApiBaseUrl()).toThrow(/EXPO_PUBLIC_API_URL/);
    });
  });

  test('app code never calls the throwing resolver directly', () => {
    const offenders: string[] = [];
    const walk = (d: string): string[] =>
      fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? walk(path.join(d, e.name)) : /\.(tsx?)$/.test(e.name) ? [path.join(d, e.name)] : []
      );
    for (const f of [...walk(path.join(ROOT, 'app')), ...walk(path.join(ROOT, 'src'))]) {
      if (f.endsWith(path.join('services', 'apiConfig.ts'))) continue;
      if (/(?<![\w])getApiBaseUrl\s*\(/.test(fs.readFileSync(f, 'utf8'))) offenders.push(path.relative(ROOT, f));
    }
    expect(offenders).toEqual([]);
  });
});

// ---------------------------------------------------------------------------------------------
// 3. WCAG AA contrast for every button tone
// ---------------------------------------------------------------------------------------------
describe('Kid tone contrast (WCAG AA)', () => {
  const lum = (hex: string) => {
    const h = hex.replace('#', '');
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) =>
      v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
    );
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a: string, b: string) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };
  const { kidTones } = require('../src/theme/kidTheme');
  const { candyTones } = require('../src/theme/colors');

  test.each(Object.keys(kidTones))('%s: button text (onFill) on fill >= 4.5:1', (tone) => {
    const t = kidTones[tone];
    expect(ratio(t.onFill, t.fill)).toBeGreaterThanOrEqual(4.5);
  });

  test.each(Object.keys(kidTones).filter((k) => k !== 'white'))('%s: accent text on tint and on white >= 4.5:1', (tone) => {
    const t = kidTones[tone];
    expect(ratio(t.text, t.tint)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(t.text, '#FFFFFF')).toBeGreaterThanOrEqual(4.5);
  });

  test('colors.ts candyTones stay in sync with kidTones', () => {
    for (const tone of Object.keys(candyTones)) {
      const k = kidTones[tone];
      expect(candyTones[tone]).toEqual({ fill: k.fill, edge: k.edge, tint: k.tint, onFill: k.onFill });
    }
  });
});

// ---------------------------------------------------------------------------------------------
// 4. Tracing palm rejection (native re-anchor + web single-pointer)
// ---------------------------------------------------------------------------------------------
describe('Tracing palm rejection', () => {
  const code = fs.readFileSync(path.join(ROOT, 'src/components/TracingCanvas.tsx'), 'utf8');

  test('native: second touch ends the stroke; back to one finger re-anchors to its real position', () => {
    expect(code).toMatch(/numberActiveTouches > 1[\s\S]{0,400}endStrokeAt\(\)/);
    expect(code).toMatch(/touchStartRef\.current = \{ x: locX - \(gestureState\.dx/);
    expect(code).toContain('onPanResponderTerminate');
  });

  test('web: only the first pointer draws, and pointercancel closes the stroke', () => {
    expect(code).toContain('activePointerIdRef');
    expect(code).toContain('onPointerCancel');
  });

  test('touch clamping reads the live canvas size, not the first-render estimate', () => {
    expect(code).toContain('canvasDimsRef.current = canvasDims');
    expect(code).not.toMatch(/const \{ width, height \} = canvasDims;/);
  });
});

// ---------------------------------------------------------------------------------------------
// 5. iOS transient 'inactive' must not stop audio
// ---------------------------------------------------------------------------------------------
test("_layout stops audio on 'background' only, not on iOS 'inactive' overlays", () => {
  const code = fs.readFileSync(path.join(ROOT, 'app/_layout.tsx'), 'utf8');
  expect(code).toContain("if (nextAppState === 'background') {");
  expect(code).not.toMatch(/nextAppState === 'inactive'/);
});
