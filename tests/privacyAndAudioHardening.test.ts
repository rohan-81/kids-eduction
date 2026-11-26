/**
 * Audit regressions:
 *  - P1-6: child/parent names never reach remote TTS URLs.
 *  - P1-4: backend-only badges loaded from the JSON cache start LOCKED.
 *  - P1-5 / P2-5 / P3: animal-sound request tokens, speech-interruption completion and the
 *    removal of the dead expo-av fallback are in place.
 */
import * as fs from 'fs';
import * as path from 'path';
import { maskPrivateNames, setPrivateNames } from '../src/services/audioService';

const read = (rel: string) => fs.readFileSync(path.join(__dirname, '..', rel), 'utf8');

describe('remote TTS name masking (P1-6)', () => {
  afterEach(() => setPrivateNames([]));

  test('masks Latin names case-insensitively on word boundaries', () => {
    setPrivateNames(['Aarav Patel']);
    expect(maskPrivateNames('Awesome job aarav! Well done, AARAV PATEL.', 'en')).toBe(
      'Awesome job little friend! Well done, little friend.'
    );
    // No false positive inside other words.
    expect(maskPrivateNames('The aaravine river', 'en')).toBe('The aaravine river');
  });

  test('masks the Gujarati and Hindi transliterations used in personalised stories', () => {
    setPrivateNames(['Aarav']);
    const { formatChildName } = require('../src/utils/nameTransliterator');
    const gu = formatChildName('Aarav', 'gu');
    const hi = formatChildName('Aarav', 'hi');
    expect(maskPrivateNames(`શાબાશ ${gu}!`, 'gu')).toBe('શાબાશ નાના દોસ્ત!');
    expect(maskPrivateNames(`शाबाश ${hi}!`, 'hi')).toBe('शाबाश छोटे दोस्त!');
  });

  test('regex metacharacters in names are treated literally', () => {
    setPrivateNames(['A.J (Jr)']);
    expect(maskPrivateNames('Hi A.J (Jr)', 'en')).toBe('Hi little friend');
    expect(maskPrivateNames('Hi AxJ', 'en')).toBe('Hi AxJ');
  });

  test('text is unchanged when no names are registered', () => {
    expect(maskPrivateNames('Hello Riya', 'en')).toBe('Hello Riya');
  });

  test('every remote TTS URL in audioService goes through the mask', () => {
    const code = read('src/services/audioService.ts');
    const remoteLines = code.split('\n').filter((l) => l.includes('/tts/audio.mp3') || l.includes('translate_tts?'));
    expect(remoteLines.length).toBeGreaterThanOrEqual(8);
    for (const line of remoteLines) {
      expect(line).toMatch(/(text|q)=\$\{encodeURIComponent\(maskPrivateNames\(/);
    }
  });
});

describe('cached badge unlock logic (P1-4)', () => {
  const store: Record<string, string> = {};
  const originalFetch = global.fetch;

  const load = () => {
    jest.resetModules();
    jest.doMock('@react-native-async-storage/async-storage', () => ({
      __esModule: true,
      default: {
        getItem: jest.fn(async (k: string) => store[k] ?? null),
        setItem: jest.fn(async (k: string, v: string) => {
          store[k] = v;
        }),
        removeItem: jest.fn(async (k: string) => {
          delete store[k];
        }),
      },
    }));
    return require('../src/services/apiService').apiService;
  };

  beforeEach(() => {
    Object.keys(store).forEach((k) => delete store[k]);
    (global as any).fetch = jest.fn(() => new Promise(() => {})); // background refresh never resolves
  });
  afterEach(() => {
    (global as any).fetch = originalFetch;
    jest.dontMock('@react-native-async-storage/async-storage');
  });

  test('a backend-only badge from cache without a requirement stays locked', async () => {
    store['@kidszone_badges_cache'] = JSON.stringify([{ id: 'badge-backend-only', nameEn: 'Mystery' }]);
    const badges = await load().fetchBadges();
    const b = badges.find((x: any) => x.id === 'badge-backend-only');
    expect(b.checkUnlocked({ completedLessons: Array(500).fill('x') })).toBe(false);
  });

  test('a cached backend badge with a requirement unlocks only when earned', async () => {
    store['@kidszone_badges_cache'] = JSON.stringify([{ id: 'badge-ten', nameEn: 'Ten', requirementValue: 10 }]);
    const badges = await load().fetchBadges();
    const b = badges.find((x: any) => x.id === 'badge-ten');
    expect(b.checkUnlocked({ completedLessons: Array(9).fill('x') })).toBe(false);
    expect(b.checkUnlocked({ completedLessons: Array(10).fill('x') })).toBe(true);
    expect(b.getProgress({ completedLessons: Array(4).fill('x') })).toEqual({ current: 4, total: 10 });
  });
});

describe('audio lifecycle hardening (P1-5, P2-5, P3)', () => {
  test('animal sounds use a request token and release the previous player before creating one', () => {
    const code = read('src/services/soundEffects.ts');
    const fn = code.slice(code.indexOf('public async playAnimalSound('), code.indexOf('// 12. Play Wheel Spin Tick Sound'));
    expect(fn).toContain('const req = this.animalReqId;');
    // Every await is followed by a staleness check before any player is created.
    expect((fn.match(/if \(isStale\(\)\) return false;/g) || []).length).toBeGreaterThanOrEqual(5);
    const creations = fn.split('createAudioPlayerFn(').length - 1;
    expect(creations).toBe(2);
    expect((fn.match(/this\.releaseAnimalPlayers\(\);\n\s*const player = createAudioPlayerFn\(/g) || []).length).toBe(2);
  });

  test('stopAnimalSound cancels in-flight requests', () => {
    const code = read('src/services/soundEffects.ts');
    expect(code).toMatch(/public stopAnimalSound\(\): void \{\n\s*this\.animalReqId \+= 1;/);
  });

  test('an interrupted or stopped phrase still completes its request', () => {
    const code = read('src/services/audioService.ts');
    expect(code).toContain('activeNativeFinish = finishOnce;');
    expect(code).toMatch(/function releaseActiveNativeAudio\(\)[\s\S]*?finish\(\);/);
    expect((code.match(/releaseActiveNativeAudio\(\);/g) || []).length).toBeGreaterThanOrEqual(2);
  });

  test('the dead expo-av fallback is gone and hot-path logs are dev-only', () => {
    for (const f of ['src/services/audioService.ts', 'src/services/soundEffects.ts']) {
      const code = read(f);
      expect(code).not.toContain("require('expo-av')");
      expect(code).not.toContain('ExpoAvAudio');
      const unguarded = code.split('\n').filter((l) => /console\.log\(/.test(l) && !/if \(IS_DEV\)/.test(l));
      expect(unguarded).toEqual([]);
    }
  });
});
