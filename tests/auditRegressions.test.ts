import fs from 'fs';
import path from 'path';

const ROOT = path.join(__dirname, '..');
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

describe('Audit Regression Suite: Nursery Rhymes Native Timing & Audio Service', () => {
  let mockPlayer: any;
  let statusListener: ((status: any) => void) | null = null;

  beforeEach(() => {
    statusListener = null;
    mockPlayer = {
      volume: 1.0,
      play: jest.fn(),
      pause: jest.fn(),
      seekTo: jest.fn(),
      addListener: jest.fn((event: string, fn: (status: any) => void) => {
        if (event === 'playbackStatusUpdate') {
          statusListener = fn;
        }
        return { remove: jest.fn() };
      }),
    };

    jest.resetModules();
  });

  test('expo-audio native player preserves currentTime and duration in seconds (no / 1000 division)', async () => {
    jest.mock('expo-audio', () => ({
      createAudioPlayer: jest.fn(() => mockPlayer),
      setAudioModeAsync: jest.fn(async () => {}),
    }));

    jest.mock('react-native', () => ({
      ...jest.requireActual('./mocks/reactNativeMock.js'),
      Platform: { OS: 'ios', select: (o: any) => o.ios ?? o.default },
    }));

    // Mock global fetch HEAD probe to return ok: true
    const originalFetch = global.fetch;
    (global as any).fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
    }));

    try {
      const { rhymeAudioService } = require('../src/services/rhymeAudioService');

      let lastEmittedStatus: any = null;
      rhymeAudioService.addListener((s: any) => {
        lastEmittedStatus = s;
      });

      const fakeRhyme = {
        id: 'twinkle',
        title: 'Twinkle Star',
        categoryLang: 'en',
        lines: ['Twinkle twinkle little star'],
        cueTimestamps: [0, 4, 8],
      };

      const played = await rhymeAudioService.playRhyme(fakeRhyme);
      expect(played).toBe(true);

      // Simulate native expo-audio status update with duration = 35.5s and currentTime = 12.4s
      expect(statusListener).toBeTruthy();
      statusListener!({
        duration: 35.5,
        currentTime: 12.4,
        isPlaying: true,
      });

      // Verify duration and currentTime are in SECONDS (not crushed down by / 1000 to 0.0355 / 0.0124)
      expect(lastEmittedStatus.duration).toBe(35.5);
      expect(lastEmittedStatus.currentTime).toBe(12.4);

      // Verify seekTo passes seconds directly (not multiplied by 1000)
      rhymeAudioService.seek(18.2);
      expect(mockPlayer.seekTo).toHaveBeenCalledWith(18.2);
    } finally {
      global.fetch = originalFetch;
    }
  });

  test('rapid song switching discards rejected promise in catch and does NOT wipe new active song', async () => {
    const { rhymeAudioService } = require('../src/services/rhymeAudioService');

    // Song A play starts
    const rhymeA = { id: 'twinkle', lines: ['A'] };
    const rhymeB = { id: 'johny', lines: ['B'] };

    // rhymeAudioService.stop() increments playRequestId
    const p1 = (rhymeAudioService as any).playRequestId;
    rhymeAudioService.stop();
    const p2 = (rhymeAudioService as any).playRequestId;
    expect(p2).toBeGreaterThan(p1);

    // Verify catch guard logic: if playRequestId !== requestId, catch block returns early
    const code = read('src/services/rhymeAudioService.ts');
    expect(code).toMatch(/} catch \{\s*if \(this\.playRequestId !== requestId\) return 'superseded';/);
  });
});

describe('Audit Regression Suite: Parental Gate & Settings Data Management', () => {
  test('Reset Progress requires ParentGateModal challenge before confirmation dialog', () => {
    const code = read('app/settings.tsx');

    // Must set pendingChange with kind 'reset'
    expect(code).toContain("setPendingChange({ kind: 'reset' })");

    // ParentGateModal must be conditioned on pendingChange !== null
    expect(code).toContain('ParentGateModal');
    expect(code).toContain('pendingChange !== null');

    // Reset action only executes after gate passes (in applyPendingChange)
    expect(code).toContain("else if (change.kind === 'reset')");
    expect(code).toContain('await resetProgress()');
  });

  test('Reset Progress Hindi label is pure Devanagari रीसेट करें without Gujarati characters', () => {
    const code = read('app/settings.tsx');

    // Devanagari 'र' (\u0930) followed by matra 'ी' (\u0940)
    expect(code).toContain("'रीसेट करें'");

    // Must NOT contain Gujarati 'ર' (\u0ab0) in the Hindi string
    expect(code).not.toContain("'રીસેટ करें'");
  });
});

describe('Audit Regression Suite: Rhyme Completion IDs & Farming Prevention', () => {
  test('rhymes.tsx uses standardized rhyme-${id} and prevents coin farming', () => {
    const code = read('app/rhymes.tsx');

    // Saves with standard hyphenated prefix
    expect(code).toContain("const rhymeLessonId = `rhyme-${cleanId}`;");

    // Gated by completedLessons to prevent coin farming on repeat listens
    expect(code).toContain('!progress.completedLessons?.includes(rhymeLessonId)');
    expect(code).toContain('addCoins(10)');
    expect(code).toContain('completeLesson(rhymeLessonId)');
  });

  test('subjects.tsx and progress.tsx accept both rhyme- and rhyme_ formats for backward compatibility', () => {
    const subjectsCode = read('app/subjects.tsx');
    expect(subjectsCode).toContain('completedSet.has(`rhyme-${clean}`)');
    expect(subjectsCode).toContain('completedSet.has(`rhyme_${clean}`)');

    const progressCode = read('app/progress.tsx');
    expect(progressCode).toContain('completedSet.has(`rhyme_${clean}`)');
    expect(progressCode).toContain('completedSet.has(id)');
  });
});

describe('Audit Regression Suite: 2-Player Duel Concurrency', () => {
  test('duel.tsx uses synchronous useRef guards to prevent game freeze and double-advance', () => {
    const code = read('app/games/duel.tsx');

    // Refs must be declared
    expect(code).toContain('roundCompletedRef = useRef(false)');
    expect(code).toContain('p1LockedRef = useRef(false)');
    expect(code).toContain('p2LockedRef = useRef(false)');

    // Handlers must inspect refs synchronously via evaluateDuelAnswer
    expect(code).toContain('evaluateDuelAnswer(1, isCorrect');
    expect(code).toContain('evaluateDuelAnswer(2, isCorrect');
    expect(code).toContain('if (res.ignored) return');

    // Refs must be cleared on round advance and game reset
    expect(code).toContain('roundCompletedRef.current = false');
    expect(code).toContain('p1LockedRef.current = false');
    expect(code).toContain('p2LockedRef.current = false');

    // The advance timer lives in the round controller (behaviour tested in finalHardening.test.ts);
    // the screen must cancel it on reset, exit, unmount and blur.
    expect(code).toContain('createDuelRoundController(');
    expect(code).toContain('roundController.reset()');
    expect(code).toContain('cancelAdvanceTimer');
    expect(code).toContain('roundControllerRef.current?.cancel()');
  });

  test('duel timer cancellation prevents race condition and false coin awards on rapid reset or exit', () => {
    // Drives the REAL controller used by app/games/duel.tsx (not a copy of its logic).
    jest.useFakeTimers();
    try {
      const { createDuelRoundController } = require('../src/utils/duelRound');
      let gameOvers = 0;
      const c = createDuelRoundController(5, 1200, {
        onRoundStart: () => {},
        onGameOver: () => gameOvers++,
      });

      // Play to the final question (index 4).
      for (let i = 0; i < 4; i++) {
        c.scheduleAdvance();
        jest.advanceTimersByTime(1200);
      }
      expect(c.round).toBe(4);

      // Final answer, then Reset 500ms into the feedback pause.
      c.scheduleAdvance();
      jest.advanceTimersByTime(500);
      c.reset();
      expect(c.hasPendingAdvance).toBe(false);
      jest.advanceTimersByTime(5000);

      // The old game's advance never lands on the new game: no game over, no coins, round 0.
      expect(c.round).toBe(0);
      expect(gameOvers).toBe(0);
      expect(c.isFinished).toBe(false);
    } finally {
      jest.useRealTimers();
    }
  });

  test('evaluateDuelAnswer pure function handles simultaneous taps cleanly with behavioral coverage', () => {
    const { evaluateDuelAnswer } = require('../src/utils/duelRound');

    let state = {
      p1Locked: false,
      p2Locked: false,
      roundCompleted: false,
      p1Score: 0,
      p2Score: 0,
    };

    // Case A: Simultaneous wrong answers from both players
    const resP1Wrong = evaluateDuelAnswer(1, false, state);
    state = resP1Wrong.nextState;
    expect(resP1Wrong.feedback).toBe('wrong');
    expect(resP1Wrong.shouldAdvance).toBe(false);

    const resP2Wrong = evaluateDuelAnswer(2, false, state);
    state = resP2Wrong.nextState;
    expect(resP2Wrong.feedback).toBe('wrong');
    expect(resP2Wrong.shouldAdvance).toBe(true); // Both locked -> advances! Never freezes
    expect(state.p1Locked).toBe(true);
    expect(state.p2Locked).toBe(true);
    expect(state.roundCompleted).toBe(true);

    // Case B: Simultaneous correct answers from both players
    state = {
      p1Locked: false,
      p2Locked: false,
      roundCompleted: false,
      p1Score: 0,
      p2Score: 0,
    };

    const resP1Correct = evaluateDuelAnswer(1, true, state);
    state = resP1Correct.nextState;
    expect(resP1Correct.feedback).toBe('correct');
    expect(resP1Correct.shouldAdvance).toBe(true);
    expect(resP1Correct.awardedPlayer).toBe(1);
    expect(state.p1Score).toBe(10);
    expect(state.roundCompleted).toBe(true);

    // P2 taps correct in the same tick after P1
    const resP2Ignored = evaluateDuelAnswer(2, true, state);
    expect(resP2Ignored.ignored).toBe(true);
    expect(resP2Ignored.shouldAdvance).toBe(false);
    expect(resP2Ignored.awardedPlayer).toBe(null);
    expect(state.p2Score).toBe(0); // P2 does not get duplicate coins
  });
});

describe('Audit Regression Suite: Audio Backgrounding & Web Blur Polish', () => {
  test('_layout.tsx stops rhymeAudioService on background and does NOT stop on window.blur', () => {
    const code = read('app/_layout.tsx');

    // rhymeAudioService.stop() must be called on AppState background and visibilitychange
    expect(code).toContain('rhymeAudioService.stop()');

    // window.blur listener must be absent to prevent cutting off audio when user clicks outside tab without hiding it
    expect(code).not.toContain("window.addEventListener('blur'");
    expect(code).not.toContain("window.removeEventListener('blur'");

    // visibilitychange must be preserved for tab switching
    expect(code).toContain("document.addEventListener('visibilitychange'");
  });
});

describe('Audit Regression Suite: Localized Numerals & Layout Width', () => {
  test('lessons index displays localized numerals (૩૭ / ३७) instead of Latin 37', () => {
    const code = read('app/lessons/index.tsx');
    expect(code).toContain("'વ્યંજન (ક થી જ્ઞ) • ૩૭ અક્ષર'");
    expect(code).toContain("'व्यंजन (क से ज्ञ) • ३७ अक्षर'");
    expect(code).not.toContain("'વ્યંજન (ક થી જ્ઞ) • 37 અક્ષર'");
    expect(code).not.toContain("'व्यंजन (क से ज्ञ) • 37 अक्षर'");
  });

  test('tracing canvas displays ५०% in Hindi mode', () => {
    const code = read('src/components/TracingCanvas.tsx');
    expect(code).toContain("'थोड़ा और ट्रेस करें! (५०% जरूरी है ✏️)'");
    expect(code).not.toContain("'थोड़ा और ट्रेस करें! (50% जरूरी है ✏️)'");
  });

  test('rhymes screen displays localized +૧૦ / +१० coins reward', () => {
    const code = read('app/rhymes.tsx');
    expect(code).toContain("gu: 'આખું ગીત સાંભળીને +૧૦ ગોલ્ડ કોઈન મેળવો! ⭐'");
    expect(code).toContain("hi: 'पूरा गीत सुनकर +१० सिक्के अर्जित करें! ⭐'");
  });

  test('language screen bounds width with maxWidth: 600', () => {
    const code = read('app/language.tsx');
    expect(code).toMatch(/container:\s*\{[^}]*maxWidth:\s*600/);
    expect(code).toMatch(/container:\s*\{[^}]*alignSelf:\s*'center'/);
  });
});

describe('Audit Regression Suite: Production HTTPS & First-Party CDN Fallbacks', () => {
  test('app.config.js enforces build-time HTTPS validation and fails build if missing or invalid', () => {
    const appConfigFn = require('../app.config.js');
    const origProfile = process.env.EAS_BUILD_PROFILE;
    const origUrl = process.env.EXPO_PUBLIC_API_URL;
    const origMedia = process.env.EXPO_PUBLIC_MEDIA_URL;

    try {
      process.env.EAS_BUILD_PROFILE = 'production';
      process.env.EXPO_PUBLIC_MEDIA_URL = 'https://cdn.kidslearning.org/media';

      // 1. Missing URL fails build immediately
      delete process.env.EXPO_PUBLIC_API_URL;
      expect(() => appConfigFn({ config: {} })).toThrow(/EXPO_PUBLIC_API_URL is missing/);

      // 2. Insecure HTTP fails build
      process.env.EXPO_PUBLIC_API_URL = 'http://api.myserver.com/api';
      expect(() => appConfigFn({ config: {} })).toThrow(/must start with https:\/\//);

      // 3. Placeholder example.com fails build
      process.env.EXPO_PUBLIC_API_URL = 'https://api.example.com/api';
      expect(() => appConfigFn({ config: {} })).toThrow(/cannot use placeholder "example.com"/);

      // 4. Valid HTTPS passes build
      process.env.EXPO_PUBLIC_API_URL = 'https://api.kidslearning.org/api';
      const result = appConfigFn({ config: { name: 'KidsZone' } });
      expect(result.name).toBe('KidsZone');

      // 5. Preview release profile is also strictly gated
      process.env.EAS_BUILD_PROFILE = 'preview';
      delete process.env.EXPO_PUBLIC_API_URL;
      expect(() => appConfigFn({ config: {} })).toThrow(/EXPO_PUBLIC_API_URL is missing for preview build/);
    } finally {
      process.env.EAS_BUILD_PROFILE = origProfile;
      process.env.EXPO_PUBLIC_API_URL = origUrl;
      if (origMedia === undefined) delete process.env.EXPO_PUBLIC_MEDIA_URL;
      else process.env.EXPO_PUBLIC_MEDIA_URL = origMedia;
    }
  });

  test('apiConfig throws on missing, insecure HTTP, or placeholder example.com in production mode, while permitting private LAN in release testing', () => {
    const originalEnv = process.env.NODE_ENV;
    const originalApiUrl = process.env.EXPO_PUBLIC_API_URL;
    try {
      process.env.NODE_ENV = 'production';
      (global as any).__DEV__ = false;

      const { getApiBaseUrl, API_BASE_URL } = require('../src/services/apiConfig');

      // Module-level safe API_BASE_URL does not crash on unhandled throw
      expect(typeof API_BASE_URL).toBe('string');

      // Missing URL in production
      delete process.env.EXPO_PUBLIC_API_URL;
      expect(() => getApiBaseUrl()).toThrow(/requires EXPO_PUBLIC_API_URL to be defined/);

      // Insecure public HTTP rejection
      process.env.EXPO_PUBLIC_API_URL = 'http://insecure-backend.com/api';
      expect(() => getApiBaseUrl()).toThrow(/Production API URL must use HTTPS/);

      // Placeholder example.com rejection
      process.env.EXPO_PUBLIC_API_URL = 'https://api.kidszone.example.com/api';
      expect(() => getApiBaseUrl()).toThrow(/cannot use placeholder "example.com"/);

      // Private LAN HTTP URL (192.168.x.x) permitted in release for local Wi-Fi testing
      process.env.EXPO_PUBLIC_API_URL = 'http://192.168.1.100:8000/api';
      expect(getApiBaseUrl()).toBe('http://192.168.1.100:8000/api');
    } finally {
      process.env.NODE_ENV = originalEnv;
      process.env.EXPO_PUBLIC_API_URL = originalApiUrl;
      (global as any).__DEV__ = true;
    }
  });

  test('eas.json contains no example.com placeholders', () => {
    const easCode = read('eas.json');
    expect(easCode).not.toContain('example.com');
  });

  test('rhyme audio candidate URLs use getMediaBaseUrl (honoring EXPO_PUBLIC_MEDIA_URL) with zero dead kidszone.app fallbacks', () => {
    const { rhymeAudioService } = require('../src/services/rhymeAudioService');
    const origMedia = process.env.EXPO_PUBLIC_MEDIA_URL;

    try {
      // 1. In standard config, candidate URLs point to /media/rhymes/audio/
      const fake = { id: 'twinkle', audioUrl: '/media/rhymes/audio/twinkle.mp3', lines: [] };
      let candidates = rhymeAudioService.getCandidateUrls(fake);
      expect(candidates.length).toBeGreaterThanOrEqual(1);
      expect(candidates[0]).toContain('/media/rhymes/audio/twinkle.mp3');

      // Zero dead kidszone.app or archive.org domains
      candidates.forEach((url: string) => {
        expect(url).not.toContain('cdn.kidszone.app');
        expect(url).not.toContain('archive.org');
      });

      // 2. When EXPO_PUBLIC_MEDIA_URL CDN is configured, candidate URLs route to the CDN with direct backend fallback
      process.env.EXPO_PUBLIC_MEDIA_URL = 'https://d12345.cloudfront.net/media';
      candidates = rhymeAudioService.getCandidateUrls(fake);
      expect(candidates[0]).toBe('https://d12345.cloudfront.net/media/rhymes/audio/twinkle.mp3');
      expect(candidates.length).toBe(2); // CDN primary + backend origin fallback
    } finally {
      process.env.EXPO_PUBLIC_MEDIA_URL = origMedia;
    }
  });

  test('silence normalization script and written audio provenance exist; no stray wav files', () => {
    expect(fs.existsSync(path.join(ROOT, 'backend/scripts/normalize_rhyme_silence.py'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, 'AUDIO_PROVENANCE.md'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, 'backend/media/rhymes/audio/tmp_cue.wav'))).toBe(false);

    const prov = read('AUDIO_PROVENANCE.md');
    expect(prov).toContain('Category B: Cinema / Modern-Arrangement Works (RETIRED');
    for (const id of ['row-boat', 'mota-hathi', 'upar-pankha', 'bandar-mama']) expect(prov).toContain(`\`${id}\``);
    expect(prov).toContain('backend/media_backup_20261124.zip');
  });

  test('tracing canvas implements low-end Android digitizer jitter filter and requestAnimationFrame render throttle without per-move path rebuild', () => {
    const code = read('src/components/TracingCanvas.tsx');
    expect(code).toContain('requestAnimationFrame');
    expect(code).toContain('scheduleStrokeRender');
    expect(code).toContain('dist < 1.5');
    expect(code).toContain('cancelFrame');

    // pointsToSmoothSvgPath must NOT be called on every touch move; only scheduled in RAF
    expect(code).toContain('scheduleStrokeRender(color)');
    expect(code).not.toContain('scheduleStrokeRender({ d: smoothD');

    // Multi-touch / palm rejection: ignores touch movements when more than 1 finger is active
    expect(code).toContain('gestureState.numberActiveTouches > 1');
  });

  test('media deployment script uses modern S3 policies, zero ACLs, and tiered cache headers', () => {
    expect(fs.existsSync(path.join(ROOT, 'backend/scripts/deploy_media_s3.py'))).toBe(true);
    const deployCode = read('backend/scripts/deploy_media_s3.py');

    // Must NOT use --acl public-read (rejected by modern S3 buckets)
    expect(deployCode).not.toContain("'--acl'");
    expect(deployCode).not.toContain('" --acl"');

    // Two-tier cache control: 1-day for mutable audio, 1-year for immutable WebP
    expect(deployCode).toContain('max-age=86400, must-revalidate');
    expect(deployCode).toContain('max-age=31536000, immutable');

    // CloudFront cache policy with QueryString forwarding to bust cache via ?v=
    expect(deployCode).toContain('"QueryStringBehavior": "all"');

    // Uploads all 4 folders (characters, stories, audio/animals, rhymes/audio)
    expect(deployCode).toContain("media/characters/");
    expect(deployCode).toContain("media/stories/");
    expect(deployCode).toContain("media/audio/animals/");
    expect(deployCode).toContain("media/rhymes/audio/");

    // Excludes non-MP3 files from rhyme audio upload
    expect(deployCode).toContain('--exclude');
    expect(deployCode).toContain('--include');
    expect(deployCode).toContain('*.mp3');

    // Uses CloudFront OAC principal (not public wildcard)
    expect(deployCode).toContain('"Service": "cloudfront.amazonaws.com"');
    expect(deployCode).toContain('"AWS:SourceArn"');

    // Checks return code on invalidation
    expect(deployCode).toContain('res_inval.returncode != 0');

    // Guards against applying dummy placeholder policies that cause 403 media outages
    expect(deployCode).toContain('403 media outage');
    expect(deployCode).toContain('resolve_aws_account_id');

    // Safe cross-platform stdout encoding without Unicode charmap crashes on Windows
    expect(deployCode).toContain("reconfigure(encoding='utf-8')");
    expect(deployCode).not.toContain('\u2713');

    // Committed s3_bucket_policy.json is strictly private CloudFront OAC (never public wildcard)
    const committedPolicy = read('backend/scripts/s3_bucket_policy.json');
    expect(committedPolicy).toContain('"Service": "cloudfront.amazonaws.com"');
    expect(committedPolicy).not.toContain('"Principal": "*"');
  });
});
