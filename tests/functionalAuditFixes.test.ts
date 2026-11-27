/**
 * Regressions for the end-to-end functional audit:
 *  - progress counters are updated atomically (rapid taps / concurrent rewards never lose coins);
 *  - coins spent on the device are reported to the server as a lifetime counter (no refund on sync);
 *  - reward exploits found screen-by-screen stay closed (source guards for screens that have no
 *    render harness in this node-only Jest setup).
 */
const mockStorage: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (key: string) => mockStorage[key] ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      // Yield like the real bridge does, so overlapping read-modify-write races would surface.
      await new Promise((r) => setTimeout(r, 1));
      mockStorage[key] = value;
    }),
    removeItem: jest.fn(async (key: string) => {
      delete mockStorage[key];
    }),
  },
}));

import * as fs from 'fs';
import * as path from 'path';
import { storageService } from '../src/services/storageService';
import { backendService } from '../src/services/backendService';
import { apiService } from '../src/services/apiService';
import { authService } from '../src/services/authService';
import { mergeServerProgress } from '../src/utils/progressMerge';
import type { CloudSyncPayload, CloudSyncResponse } from '../src/types/api';

const ROOT = path.join(__dirname, '..');
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

beforeEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  storageService.setUser(null);
  storageService.setProfile(null);
});

describe('atomic progress updates', () => {
  test('concurrent addCoins calls never overwrite each other', async () => {
    await storageService.saveProgress({ coins: 100 });
    await Promise.all(Array.from({ length: 10 }, () => storageService.addCoins(5)));
    expect((await storageService.getProgress()).coins).toBe(150);
  });

  test('two rapid purchases cannot both pass the balance check', async () => {
    await storageService.saveProgress({ coins: 100, coinsSpentTotal: 0 });
    const results = await Promise.all([storageService.spendCoins(60), storageService.spendCoins(60)]);
    expect(results.filter(Boolean)).toHaveLength(1);
    const prog = await storageService.getProgress();
    expect(prog.coins).toBe(40);
    expect(prog.coinsSpentTotal).toBe(60);
  });

  test('spendCoins rejects negative / NaN amounts and treats 0 as free', async () => {
    await storageService.saveProgress({ coins: 10 });
    expect(await storageService.spendCoins(-5)).toBe(false);
    expect(await storageService.spendCoins(NaN)).toBe(false);
    expect(await storageService.spendCoins(0)).toBe(true);
    expect((await storageService.getProgress()).coins).toBe(10);
  });

  test('a double "complete lesson" rewards exactly once', async () => {
    await storageService.saveProgress({ coins: 0, completedLessons: [] });
    const [a, b] = await Promise.all([
      storageService.markLessonCompleted('gu-ka'),
      storageService.markLessonCompleted('gu-ka'),
    ]);
    expect([a.isFirstTime, b.isFirstTime].filter(Boolean)).toHaveLength(1);
    const prog = await storageService.getProgress();
    expect(prog.coins).toBe(10);
    expect(prog.completedLessons).toEqual(['gu-ka']);
  });

  test('coins from a game and a lesson at the same moment both land', async () => {
    await storageService.saveProgress({ coins: 0, completedLessons: [] });
    await Promise.all([
      storageService.recordGameScore('counting', 4), // +5
      storageService.markLessonCompleted('gu-kha'), // +10
      storageService.addCoins(2),
    ]);
    expect((await storageService.getProgress()).coins).toBe(17);
  });

  test('resetting progress restarts the lifetime spend counter', async () => {
    await storageService.saveProgress({ coinsSpentTotal: 80 });
    const fresh = await storageService.resetUserProgress('Kid');
    expect(fresh.coinsSpentTotal).toBe(0);
  });
});

describe('device spending in cloud sync', () => {
  afterEach(() => jest.restoreAllMocks());

  const server = (over: Partial<CloudSyncResponse> = {}): CloudSyncResponse => ({
    status: 'synchronized',
    server_time: '',
    child_profile_id: 1,
    adventure_level: 1,
    lessons: [],
    wallet: { total_coins: 50, total_stars: 0 },
    streak: { current_streak: 1, longest_streak: 1 },
    avatar: {},
    garden: [],
    ...over,
  });

  test('the sync payload carries the lifetime spend counter', async () => {
    jest.spyOn(authService, 'isAuthenticated').mockReturnValue(true);
    jest.spyOn(backendService, 'flushOutbox').mockResolvedValue();
    let sent: CloudSyncPayload | null = null;
    jest.spyOn(apiService, 'syncCloudState').mockImplementation(async (payload) => {
      sent = payload;
      return server();
    });
    await backendService.syncAllProgressWithCloud({ coins: 50, stars: 2, coinsSpentTotal: 50 }, false, 7);
    expect(sent).not.toBeNull();
    expect(sent!.wallet).toEqual({ coins: 50, stars: 2, spent_total: 50 });
  });

  test('a reset sync starts the server ledger from zero', async () => {
    jest.spyOn(authService, 'isAuthenticated').mockReturnValue(true);
    jest.spyOn(backendService, 'flushOutbox').mockResolvedValue();
    let sent: CloudSyncPayload | null = null;
    jest.spyOn(apiService, 'syncCloudState').mockImplementation(async (payload) => {
      sent = payload;
      return server();
    });
    await backendService.syncAllProgressWithCloud({ coins: 50, coinsSpentTotal: 30 }, true, 7);
    expect(sent!.is_reset).toBe(true);
    expect(sent!.wallet.spent_total).toBe(0);
  });

  test('a purchase is not refunded by the merge, and other devices\' spending is adopted', () => {
    const local = { coins: 50, stars: 0, adventureLevel: 1, completedLessons: [], coinsSpentTotal: 50 };
    // Server applied the spend: balance 50, ledger 50 -> nothing to change locally.
    expect(mergeServerProgress(local, server({ coins_spent_total: 50 }))).toBeNull();
    // Another device spent 30 more: the counter moves up so this device's next spend is on top.
    const merged = mergeServerProgress(local, server({ coins_spent_total: 80 }));
    expect(merged?.coinsSpentTotal).toBe(80);
    expect(merged?.coins).toBe(50);
  });
});

describe('screen-level reward and race guards', () => {
  test('game runner records the final score from a ref, not a stale closure', () => {
    const src = read('app/games/[type].tsx');
    expect(src).toMatch(/const finalScore = scoreRef\.current;/);
    expect(src).toMatch(/recordScore\(gameType, scoreRef\.current, questions\.length\)/);
  });

  test('every quiz mode: a wrong answer is announced and auto-skips (no retry)', () => {
    const src = read('app/games/[type].tsx');
    const ms = (name: string) => Number(src.match(new RegExp(`const ${name} = (\\d+);`))?.[1]);
    expect(src).not.toMatch(/BALLOON_RETRY_MS|BALLOON_MAX_WRONG_TRIES|getTryAgainSpeech/);
    expect(src).toContain("gu: 'ખોટો જવાબ!'");
    expect(src).toContain("hi: 'गलत जवाब!'");
    expect(src).toContain("en: 'Wrong answer!'");
    // Standard quizzes / balloon pop and find-object share one wrong-answer flow.
    expect(src.match(/handleWrongAnswer\(\);/g)?.length).toBe(2);
    expect(src).toMatch(/advanceTimerRef\.current = setTimeout\(skipSafely, WRONG_SKIP_FALLBACK_MS\);/);
    expect(ms('WRONG_SKIP_FALLBACK_MS')).toBeLessThanOrEqual(2500);
    // Find-object locks after one answer instead of re-opening for another try.
    expect(src).toMatch(/const handleFindObjectOptionSelect = \(option: GameOption\) => \{\s*if \(isAnsweredRef\.current \|\| isAnswered\) return;\s*isAnsweredRef\.current = true;/);
    // Correct pop and out-of-lives still use the quick balloon delay instead of 7s / 1.8s.
    expect(ms('BALLOON_ADVANCE_MS')).toBeGreaterThanOrEqual(1200);
    expect(ms('BALLOON_ADVANCE_MS')).toBeLessThanOrEqual(1500);
    expect(src).toMatch(/setTimeout\(advanceSafely, isBalloonPop \? BALLOON_ADVANCE_MS : 7000\)/);
    expect(src).toMatch(/\}, isBalloonPop \? BALLOON_ADVANCE_MS : 1800\);/);
  });

  test('balloon pop: the tapped balloon bursts and the animation resets per question', () => {
    const src = read('app/games/[type].tsx');
    expect(src).toMatch(/Animated\.timing\(popAnim, \{\s*toValue: 1,\s*duration: BALLOON_POP_MS,/);
    expect(src).toContain('onPress={() => handleBalloonPop(option)}');
    expect(src).toContain('BALLOON_BURST_ANGLES.map(');
    expect(src.match(/popAnim\.setValue\(0\);/g)?.length).toBeGreaterThanOrEqual(3);
  });

  test('victory popup shows a single star rating and an emoji-free title under the emblem', () => {
    const src = read('app/games/[type].tsx');
    const modal = src.slice(src.indexOf('{/* Victory / game-over popup */}'), src.indexOf('</KidModal>'));
    expect(modal).not.toContain('<StarMeter');
    expect(modal.match(/<Art\.StarArt size=\{i === 1 \? 52 : 42\} \/>/g)).toHaveLength(1);
    expect(modal).toContain("t('games.gameOver').replace(/[\\p{Extended_Pictographic}\\uFE0F\\u200D]/gu, '')");
    expect(modal).toContain('styles.victoryActions');
  });

  test('lesson finish is single-shot and reports progress once', () => {
    const src = read('app/lessons/[id].tsx');
    expect(src).toMatch(/if \(finishingRef\.current\) return;/);
    expect(src).not.toMatch(/backendService\.syncLessonProgress\(/);
  });

  test('adventure replays pay a practice reward, not the level reward', () => {
    const src = read('app/adventure.tsx');
    expect(src).toMatch(/const isFirstClear = finishedLevel >= currentLevelUnlocked;/);
    expect(src).toMatch(/awardedReward\?\.coins/);
  });

  test('coloring auto-finish is cancellable; drawing credits only improvements', () => {
    expect(read('app/coloring.tsx').match(/cancelAutoFinish\(\);/g)?.length).toBeGreaterThanOrEqual(5);
    const drawing = read('app/drawing.tsx');
    expect(drawing).toMatch(/Math\.max\(0, stars - rewardedStarsRef\.current\)/);
    expect(drawing).not.toMatch(/addCoins\(6\)/);
  });

  test('habits, story choices and story completion pay once', () => {
    expect(read('app/calendar_habits.tsx')).toMatch(/if \(!rewardedHabitsRef\.current\.has\(habit\.id\)\)/);
    const stories = read('app/stories.tsx');
    expect(stories).toMatch(/rewardedChoicesRef\.current\.has\(choiceKey\)/);
    expect(stories).toMatch(/if \(!progress\.completedLessons\?\.includes\(selectedStory\.id\)\)/);
  });

  test('login / register ignore a second submit while a request is in flight', () => {
    expect(read('app/login.tsx')).toMatch(/const handleLogin = async \(\) => \{\n\s+if \(isLoading\) return;/);
    expect(read('app/register.tsx')).toMatch(/const handleRegister = async \(\) => \{\n\s+if \(isLoading\) return;/);
  });

  test('a token revoked on the server signs the app out', () => {
    expect(read('src/context/AppContext.tsx')).toMatch(/else if \(!verification\.isValid\)[\s\S]{0,400}router\.replace\('\/login'\)/);
  });
});
