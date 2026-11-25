// Production compliance: licensed-song removal, playback error classification, image retry,
// cache-first profiles and the media URL build gate. Behavioural tests against real modules.
import fs from 'fs';
import path from 'path';

const ROOT = path.join(__dirname, '..');
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const RETIRED = ['lakdi-kathi', 'chanda-mama', 'titli', 'bus-wheels'];
const REPLACEMENTS = ['row-boat', 'mota-hathi', 'upar-pankha', 'bandar-mama'];

// ---------------------------------------------------------------------------------------------
// 1. Category B film songs are gone everywhere and cannot resurface
// ---------------------------------------------------------------------------------------------
describe('Retired Category B rhymes', () => {
  const { RHYMES_DATA, RETIRED_RHYME_IDS, mapBackendRhymes } = require('../src/data/rhymesData');
  const { RHYME_3D_ASSETS } = require('../src/utils/rhymeRenders');

  test('the bundled catalogue has the public-domain replacements and none of the retired songs', () => {
    const ids = RHYMES_DATA.map((r: any) => r.id);
    expect(ids).toHaveLength(17);
    for (const id of RETIRED) expect(ids).not.toContain(id);
    for (const id of REPLACEMENTS) expect(ids).toContain(id);
    expect([...RETIRED_RHYME_IDS].sort()).toEqual([...RETIRED].sort());
  });

  test('replacements have no audio yet (honest "Coming Soon"), but every listed track exists on disk', () => {
    for (const r of RHYMES_DATA) {
      if (REPLACEMENTS.includes(r.id)) {
        expect([r.id, r.audioUrl]).toEqual([r.id, undefined]);
        continue;
      }
      expect(r.audioUrl).toMatch(/^\/media\/rhymes\/audio\/.+\.mp3$/);
      expect([r.id, fs.existsSync(path.join(ROOT, 'backend', r.audioUrl))]).toEqual([r.id, true]);
    }
  });

  test('the retired MP3s are deleted and no app code references them', () => {
    for (const id of RETIRED) {
      expect(fs.existsSync(path.join(ROOT, 'backend/media/rhymes/audio', `${id}.mp3`))).toBe(false);
    }
    const offenders: string[] = [];
    const walk = (d: string): string[] =>
      fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? walk(path.join(d, e.name)) : /\.tsx?$/.test(e.name) ? [path.join(d, e.name)] : []
      );
    for (const f of [...walk(path.join(ROOT, 'app')), ...walk(path.join(ROOT, 'src'))]) {
      if (/(lakdi-kathi|chanda-mama|bus-wheels|titli)\.mp3/.test(fs.readFileSync(f, 'utf8'))) {
        offenders.push(path.relative(ROOT, f));
      }
    }
    expect(offenders).toEqual([]);
  });

  test('a stale backend row for a retired song is dropped from the API mapping', () => {
    const rows = [
      { slug: 'lakdi-kathi', title: 'लकड़ी की काठी', category: 'hi', lyrics_hindi: 'x', audio_url: '/media/rhymes/audio/lakdi-kathi.mp3' },
      { slug: 'row-boat', title: 'Row, Row, Row Your Boat', category: 'en', lyrics_english: 'Row, row, row your boat' },
    ];
    expect(mapBackendRhymes(rows).map((r: any) => r.id)).toEqual(['row-boat']);
  });

  test('every rhyme has a 3D render key, and no render key points at a removed rhyme', () => {
    for (const r of RHYMES_DATA) expect([r.id, Boolean(RHYME_3D_ASSETS[r.id])]).toEqual([r.id, true]);
    for (const id of RETIRED) expect(RHYME_3D_ASSETS[id]).toBeUndefined();
  });

  test('progress screen derives rhyme ids from the catalogue (no impossible-to-complete slots)', () => {
    const code = read('app/progress.tsx');
    expect(code).toContain('...RHYMES_DATA.map((r) => `rhyme-${');
    expect(code).not.toMatch(/'rhyme-(baa-baa|wheels-bus|titli-udi|lakdi-kathi|chanda-mama)'/);
  });

  test('backend export lists the replacements in importer-readable form', () => {
    const data = JSON.parse(read('backend/data_exports/kidszone_data.json'));
    const slugs = data.rhymes.map((r: any) => r.slug);
    for (const id of REPLACEMENTS) expect(slugs).toContain(id);
    for (const id of RETIRED) expect(slugs).not.toContain(id);
    expect(data.rhymes.every((r: any) => r.lyrics_english || r.lyrics_gujarati || r.lyrics_hindi)).toBe(true);
  });
});

// ---------------------------------------------------------------------------------------------
// 2. Rhyme playback outcome: network trouble is never reported as "Coming Soon"
// ---------------------------------------------------------------------------------------------
describe('rhymeAudioService.play outcome', () => {
  const rhyme = { id: 'twinkle', categoryLang: 'en', title: 'Twinkle', lines: [], audioUrl: '/media/rhymes/audio/twinkle.mp3' };
  const originalFetch = global.fetch;
  let player: any;

  const load = () => {
    jest.resetModules();
    player = { volume: 1, play: jest.fn(), pause: jest.fn(), remove: jest.fn(), addListener: jest.fn(() => ({ remove: jest.fn() })) };
    jest.doMock('expo-audio', () => ({ createAudioPlayer: jest.fn(() => player), setAudioModeAsync: jest.fn(async () => {}) }));
    jest.doMock('react-native', () => ({
      ...jest.requireActual('./mocks/reactNativeMock.js'),
      Platform: { OS: 'ios', select: (o: any) => o.ios ?? o.default },
    }));
    return require('../src/services/rhymeAudioService').rhymeAudioService;
  };

  afterEach(() => {
    (global as any).fetch = originalFetch;
    jest.dontMock('expo-audio');
    jest.dontMock('react-native');
  });

  test('offline / timeout -> network-error', async () => {
    const svc = load();
    (global as any).fetch = jest.fn(async () => {
      throw new TypeError('Network request failed');
    });
    expect(await svc.play(rhyme)).toBe('network-error');
    expect(await svc.playRhyme(rhyme)).toBe(false); // boolean API unchanged
  });

  test('server error (5xx) -> network-error', async () => {
    const svc = load();
    (global as any).fetch = jest.fn(async () => ({ ok: false, status: 503 }));
    expect(await svc.play(rhyme)).toBe('network-error');
  });

  test('every candidate 404 -> unavailable (the only case that may say "Coming Soon")', async () => {
    const svc = load();
    (global as any).fetch = jest.fn(async () => ({ ok: false, status: 404 }));
    expect(await svc.play(rhyme)).toBe('unavailable');
  });

  test('a reachable track -> started', async () => {
    const svc = load();
    (global as any).fetch = jest.fn(async () => ({ ok: true, status: 200 }));
    expect(await svc.play(rhyme)).toBe('started');
    expect(player.play).toHaveBeenCalled();
    svc.stop();
  });

  test('switching songs while the first is still loading -> superseded, never an error', async () => {
    const svc = load();
    let release: (v: any) => void = () => {};
    (global as any).fetch = jest.fn(() => new Promise((res) => (release = res)));
    const first = svc.play(rhyme);
    await Promise.resolve();
    await Promise.resolve();
    svc.stop(); // child taps another rhyme / tab
    release({ ok: true, status: 200 });
    expect(await first).toBe('superseded');
  });

  test('rhymes.tsx maps each outcome to the right dialog', () => {
    const code = read('app/rhymes.tsx');
    const handler = code.slice(code.indexOf('const handleTogglePlaySong'), code.indexOf('const handlePlaybackNetworkError'));
    expect(handler).toContain('rhymeAudioService.play(activeRhyme)');
    expect(handler).toMatch(/outcome === 'superseded'\) return;/);
    expect(handler).toMatch(/outcome === 'network-error'\) \{\s*handlePlaybackNetworkError\(\);/);
    expect(code).toContain("en: \"Couldn't load the song\"");
    // The banner advertises studio audio only when this rhyme has a track.
    expect(code).not.toContain("selectedLang === 'en' ? handleTogglePlaySong");
  });
});

// ---------------------------------------------------------------------------------------------
// 3. Remote3DImage retries transient failures before settling on the fallback
// ---------------------------------------------------------------------------------------------
describe('Remote3DImage retry scheduler', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());
  const { createImageRetryScheduler, REMOTE_IMAGE_RETRY_DELAYS_MS } = require('../src/components/common/Remote3DImage');

  test('retries after each failure with backoff, then stops', () => {
    const retries: number[] = [];
    const s = createImageRetryScheduler((n: number) => retries.push(n));
    expect(s.fail()).toBe(true);
    jest.advanceTimersByTime(REMOTE_IMAGE_RETRY_DELAYS_MS[0] - 1);
    expect(retries).toEqual([]);
    jest.advanceTimersByTime(1);
    expect(retries).toEqual([1]);
    expect(s.fail()).toBe(true);
    jest.advanceTimersByTime(REMOTE_IMAGE_RETRY_DELAYS_MS[1]);
    expect(retries).toEqual([1, 2]);
    expect(s.fail()).toBe(false); // budget spent: fallback art stays
    jest.advanceTimersByTime(60_000);
    expect(retries).toEqual([1, 2]);
  });

  test('cancel (unmount) drops a pending retry; reset (new source) restores the budget', () => {
    const retries: number[] = [];
    const s = createImageRetryScheduler((n: number) => retries.push(n), [100]);
    s.fail();
    s.cancel();
    jest.advanceTimersByTime(1000);
    expect(retries).toEqual([]);
    s.fail();
    jest.advanceTimersByTime(100);
    expect(s.fail()).toBe(false);
    s.reset();
    expect(s.fail()).toBe(true);
  });

  test('component keeps the fallback visible while retrying and cleans up on unmount', () => {
    const code = read('src/components/common/Remote3DImage.tsx');
    expect(code).toMatch(/\{fallback\}\s*\{retryAttempt > 0/);
    expect(code).toContain('onLoad={() => setFailed(false)}');
    expect(code).toContain('useEffect(() => () => schedulerRef.current?.cancel(), [])');
  });
});

// ---------------------------------------------------------------------------------------------
// 4. Profiles: cache-first for signed-in parents, background refresh never clobbers local edits
// ---------------------------------------------------------------------------------------------
describe('backendService.getProfiles (cache-first)', () => {
  const store: Record<string, string> = {};
  let authed = true;
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
    jest.doMock('../src/services/authService', () => ({
      authService: { isAuthenticated: () => authed, getAuthHeaders: () => ({}) },
    }));
    return require('../src/services/backendService').backendService;
  };

  const cached = [{ id: 7, nickname: 'Asha', age_group: '4-6', avatar: 'avatar_3d_girl' }];
  const server = [{ id: 7, nickname: 'Asha (cloud)', age_group: '4-6', avatar: 'avatar_3d_girl' }];

  beforeEach(() => {
    Object.keys(store).forEach((k) => delete store[k]);
    authed = true;
  });
  afterEach(() => {
    (global as any).fetch = originalFetch;
    jest.dontMock('@react-native-async-storage/async-storage');
    jest.dontMock('../src/services/authService');
  });

  test('returns the cached list without waiting for a slow network, then refreshes once', async () => {
    store['@kidszone_child_profiles'] = JSON.stringify(cached);
    let release: (v: any) => void = () => {};
    const fetchMock = jest.fn(() => new Promise((res) => (release = res)));
    (global as any).fetch = fetchMock;
    const svc = load();

    const profiles = await svc.getProfiles(); // resolves while fetch is still pending
    expect(profiles.map((p: any) => p.nickname)).toEqual(['Asha']);
    await svc.getProfiles();
    expect(fetchMock).toHaveBeenCalledTimes(1); // concurrent callers share one refresh

    release({ ok: true, status: 200, json: async () => server });
    await new Promise((r) => setTimeout(r, 0));
    expect(JSON.parse(store['@kidszone_child_profiles'])[0].nickname).toBe('Asha (cloud)');
  });

  test('a local rename made during the refresh is not overwritten by the older server copy', async () => {
    store['@kidszone_child_profiles'] = JSON.stringify(cached);
    const pending: Array<(v: any) => void> = [];
    (global as any).fetch = jest.fn((_url: string, init?: any) =>
      init?.method === 'PATCH' ? Promise.resolve({ ok: true }) : new Promise((res) => pending.push(res))
    );
    const svc = load();

    await svc.getProfiles(); // starts background GET
    await svc.updateProfileNickname(7, 'Asha Star'); // local write while GET in flight
    pending.forEach((res) => res({ ok: true, status: 200, json: async () => server }));
    await new Promise((r) => setTimeout(r, 0));
    expect(JSON.parse(store['@kidszone_child_profiles'])[0].nickname).toBe('Asha Star');
  });

  test('logout during the refresh leaves the profile cache cleared', async () => {
    store['@kidszone_child_profiles'] = JSON.stringify(cached);
    let release: (v: any) => void = () => {};
    (global as any).fetch = jest.fn(() => new Promise((res) => (release = res)));
    const svc = load();

    await svc.getProfiles();
    authed = false;
    await svc.clearLocalProfiles();
    release({ ok: true, status: 200, json: async () => server });
    await new Promise((r) => setTimeout(r, 0));
    expect(store['@kidszone_child_profiles']).toBeUndefined();
  });

  test('first login (no cache) waits for the cloud list; offline falls back to the default profile', async () => {
    (global as any).fetch = jest.fn(async () => ({ ok: true, status: 200, json: async () => server }));
    expect((await load().getProfiles())[0].nickname).toBe('Asha (cloud)');

    Object.keys(store).forEach((k) => delete store[k]);
    (global as any).fetch = jest.fn(async () => {
      throw new TypeError('offline');
    });
    expect((await load().getProfiles())[0].nickname).toBe('Little Star');
  });

  test('getProfiles issues a single profiles request (merge duplicate removed)', () => {
    const code = read('src/services/backendService.ts');
    const fn = code.slice(code.indexOf('async getProfiles()'), code.indexOf('// Set dedicated guest profile'));
    expect(fn).not.toContain('fetch(');
    expect((code.match(/fetch\(`\$\{safeGetApiBaseUrl\(\)\}\/profiles\/`, \{\s*headers/g) || []).length).toBe(1);
  });
});

// ---------------------------------------------------------------------------------------------
// 5. Release build gate requires an explicit HTTPS media URL
// ---------------------------------------------------------------------------------------------
describe('app.config.js media URL gate', () => {
  const saved = { p: process.env.EAS_BUILD_PROFILE, a: process.env.EXPO_PUBLIC_API_URL, m: process.env.EXPO_PUBLIC_MEDIA_URL };
  const restore = (k: string, v?: string) => (v === undefined ? delete process.env[k] : (process.env[k] = v));
  afterEach(() => {
    restore('EAS_BUILD_PROFILE', saved.p);
    restore('EXPO_PUBLIC_API_URL', saved.a);
    restore('EXPO_PUBLIC_MEDIA_URL', saved.m);
  });
  const cfg = () => require('../app.config.js')({ config: { name: 'KidsZone' } });

  test.each([
    [undefined, /EXPO_PUBLIC_MEDIA_URL is missing for production build/],
    ['http://cdn.kidslearning.org/media', /EXPO_PUBLIC_MEDIA_URL must start with https:\/\//],
    ['https://cdn.example.com/media', /EXPO_PUBLIC_MEDIA_URL cannot use placeholder "example.com"/],
    ['https://cdn.kidslearning.org', /EXPO_PUBLIC_MEDIA_URL must end with "\/media"/],
  ])('production rejects media URL %p', (media, err) => {
    process.env.EAS_BUILD_PROFILE = 'production';
    process.env.EXPO_PUBLIC_API_URL = 'https://api.kidslearning.org/api';
    restore('EXPO_PUBLIC_MEDIA_URL', media as string | undefined);
    expect(cfg).toThrow(err);
  });

  test('a valid HTTPS media URL (trailing slash tolerated) passes; development needs neither', () => {
    process.env.EAS_BUILD_PROFILE = 'production';
    process.env.EXPO_PUBLIC_API_URL = 'https://api.kidslearning.org/api';
    process.env.EXPO_PUBLIC_MEDIA_URL = 'https://cdn.kidslearning.org/media/';
    expect(cfg().name).toBe('KidsZone');

    process.env.EAS_BUILD_PROFILE = 'development';
    delete process.env.EXPO_PUBLIC_API_URL;
    delete process.env.EXPO_PUBLIC_MEDIA_URL;
    const prevNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';
    try {
      expect(cfg().android.usesCleartextTraffic).toBe(true);
    } finally {
      process.env.NODE_ENV = prevNodeEnv;
    }
  });
});
