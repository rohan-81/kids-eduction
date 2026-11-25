// 3D renders moved from the app bundle to Django media + expo-image disk cache.
import fs from 'fs';
import path from 'path';

const mockStorage: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (k: string) => mockStorage[k] ?? null),
    setItem: jest.fn(async (k: string, v: string) => {
      mockStorage[k] = v;
    }),
  },
}));

import {
  characterAsset,
  getMediaBaseUrl,
  isBackendCharacterUrl,
  isRemoteImageSource,
  CHARACTER_ASSET_VERSION,
} from '../src/utils/remoteAssets';
import { renderLesson3DVisual, hasLesson3DVisual } from '../src/components/Lesson3DVisuals';
import { Remote3DImage } from '../src/components/common/Remote3DImage';
import { ANIMAL_RENDERS_BY_LESSON } from '../src/utils/animalRenders';
import { mapBackendLesson } from '../src/services/apiService';
import { LESSONS } from '../src/data/lessons';

const ROOT = path.join(__dirname, '..');
const walk = (d: string): string[] =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(d, e.name)) : /\.(tsx?|js)$/.test(e.name) ? [path.join(d, e.name)] : []
  );

describe('remote asset URLs', () => {
  test('characterAsset builds a versioned /media/characters/<key>.webp URL', () => {
    const src = characterAsset('3d_lion');
    expect(src.uri).toBe(`${getMediaBaseUrl()}/characters/3d_lion.webp?v=${CHARACTER_ASSET_VERSION}`);
    expect(getMediaBaseUrl()).toMatch(/\/media$/);
    expect(getMediaBaseUrl()).not.toMatch(/\/api\/media$/);
    expect(characterAsset('3d_lion')).toBe(src); // memoized: stable identity for React
  });

  test('backend render URLs are recognised; photos and emoji are not', () => {
    expect(isBackendCharacterUrl('https://api.kidszone.app/media/characters/3d_lion.webp')).toBe(true);
    expect(isBackendCharacterUrl('http://127.0.0.1:8000/media/characters/3d_lion.webp?v=v1')).toBe(true);
    expect(isBackendCharacterUrl('https://images.unsplash.com/photo-1550258987?w=600')).toBe(false);
    expect(isBackendCharacterUrl('characters/3d_lion.webp')).toBe(false); // must be absolute
    expect(isBackendCharacterUrl('🦁')).toBe(false);
    expect(isBackendCharacterUrl(undefined)).toBe(false);
  });

  test('render registries are remote sources, not bundled requires', () => {
    expect(isRemoteImageSource(ANIMAL_RENDERS_BY_LESSON['an-lion'])).toBe(true);
    expect(isRemoteImageSource(42)).toBe(false);
  });
});

describe('bundle size guard', () => {
  test('no 3D character PNG is require()d anywhere in the app (they are served remotely)', () => {
    const offenders: string[] = [];
    for (const f of [...walk(path.join(ROOT, 'app')), ...walk(path.join(ROOT, 'src'))]) {
      const code = fs.readFileSync(f, 'utf8');
      if (/require\(\s*['"][^'"]*characters\/3d_[\w-]+\.png['"]\s*\)/.test(code)) offenders.push(path.relative(ROOT, f));
    }
    expect(offenders).toEqual([]);
  });

  test('nothing in app/ or src/ references the old assets/images/characters folder', () => {
    const offenders = [...walk(path.join(ROOT, 'app')), ...walk(path.join(ROOT, 'src'))]
      .filter((f) => fs.readFileSync(f, 'utf8').includes('assets/images/characters'))
      .map((f) => path.relative(ROOT, f));
    expect(offenders).toEqual([]);
    expect(fs.existsSync(path.join(ROOT, 'assets/images/characters'))).toBe(false);
  });

  test('story characters, magic companions and topic badges are remote renders', () => {
    const { STORY_CHARACTER_IMAGES } = require('../src/utils/imageHelper');
    // 🐘 🐶 🦄 🐬 🦜 are the small bundled AI-story companions from assets/images/magic (out of scope)
    const MAGIC_BUNDLED = new Set(['🐘', '🐶', '🦄', '🐬', '🦜']);
    const entries = Object.entries(STORY_CHARACTER_IMAGES).filter(([emoji]) => !MAGIC_BUNDLED.has(emoji));
    expect(entries.length).toBeGreaterThanOrEqual(20);
    for (const [emoji, src] of entries) {
      expect([emoji, isRemoteImageSource(src)]).toEqual([emoji, true]);
    }
    const { MAGIC_COMPANIONS } = require('../src/utils/magicStoryGenerator');
    const remoteCompanions = MAGIC_COMPANIONS.filter((c: any) => isRemoteImageSource(c.image));
    expect(remoteCompanions.length).toBeGreaterThanOrEqual(3);
  });

  test('every remote topic badge has a bundled vector fallback for offline first launch', () => {
    const code = fs.readFileSync(path.join(ROOT, 'src/components/SubjectBadgeIcons.tsx'), 'utf8');
    expect(code).toMatch(/fallback=\{React\.createElement\(fallback/);
    expect(code).toMatch(/fallback = Art\.StarArt/);
    expect((code.match(/remoteBadge\('3d_/g) || []).length).toBeGreaterThanOrEqual(30);
  });

  test('every bundled require() target exists on disk', () => {
    const missing: string[] = [];
    for (const f of [...walk(path.join(ROOT, 'app')), ...walk(path.join(ROOT, 'src'))]) {
      const code = fs.readFileSync(f, 'utf8');
      for (const m of code.matchAll(/require\(\s*['"]([^'"]+\.(?:png|jpe?g|webp|mp3|wav))['"]\s*\)/g)) {
        if (!fs.existsSync(path.join(path.dirname(f), m[1]))) missing.push(`${path.relative(ROOT, f)} -> ${m[1]}`);
      }
    }
    expect(missing).toEqual([]);
  });
});

describe('renderLesson3DVisual: backend first, offline fallback', () => {
  const findRemote = (node: any): any => {
    if (!node || typeof node !== 'object') return null;
    if (node.type === Remote3DImage) return node;
    const kids = node.props?.children;
    for (const c of Array.isArray(kids) ? kids : [kids]) {
      const hit = findRemote(c);
      if (hit) return hit;
    }
    return null;
  };

  test('a backend-assigned render URL wins over the bundled registry', () => {
    const lion = LESSONS.find((l) => l.id === 'an-lion')!;
    const url = 'https://api.kidszone.app/media/characters/3d_lion_v2.webp';
    const el = findRemote(renderLesson3DVisual({ ...lion, imageUrl: url }, 64, 'en'));
    expect(el.props.source).toEqual({ uri: url });
  });

  test('a registry render is used when the backend gives none (or only a photo URL)', () => {
    const lion = LESSONS.find((l) => l.id === 'an-lion')!;
    const el = findRemote(
      renderLesson3DVisual({ ...lion, imageUrl: 'https://images.unsplash.com/photo-1?w=600' }, 64, 'en')
    );
    expect(el.props.source).toBe(ANIMAL_RENDERS_BY_LESSON['an-lion']);
  });

  test('every remote render carries a bundled offline fallback (never a blank box)', () => {
    const withRender = LESSONS.filter((l) => {
      const el = findRemote(renderLesson3DVisual(l, 64, 'en'));
      return el != null;
    });
    expect(withRender.length).toBeGreaterThan(150);
    const blank = withRender.filter((l) => findRemote(renderLesson3DVisual(l, 64, 'en')).props.fallback == null);
    expect(blank.map((l) => l.id)).toEqual([]);
  });

  test('hasLesson3DVisual honours backend render URLs', () => {
    expect(hasLesson3DVisual({ id: 'x-unknown', categoryId: 'x', imageUrl: 'https://h/media/characters/3d_owl.webp' } as any)).toBe(true);
  });
});

describe('backend lesson mapping', () => {
  test('mapBackendLesson keeps the absolute example_image URL for 3D renders', () => {
    const url = 'https://api.kidszone.app/media/characters/3d_lion.webp';
    const lesson = mapBackendLesson({ stable_id: 'an-lion', category: 'animals', title: 'Lion', example_image: url });
    expect(lesson.imageUrl).toBe(url);
    expect(lesson.exampleImage).toBe(url);
  });
});

describe('startup prefetch', () => {
  test('prefetches every remote render once per asset version', async () => {
    const { Image } = require('expo-image');
    const spy = jest.spyOn(Image, 'prefetch');
    const { prefetchCharacterAssets } = require('../src/services/assetPrefetchService');
    expect(await prefetchCharacterAssets()).toBe(true);
    const urls = spy.mock.calls.flatMap((c: any[]) => c[0]);
    expect(urls.length).toBeGreaterThan(150);
    expect(urls.every((u: string) => /\/media\/characters\/.+\.webp\?v=/.test(u))).toBe(true);

    spy.mockClear();
    expect(await prefetchCharacterAssets()).toBe(true); // already done for this version
    expect(spy).not.toHaveBeenCalled();
  });

  test('a failed download does not mark the version done (retries next launch)', async () => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
    const { Image } = require('expo-image');
    jest.spyOn(Image, 'prefetch').mockRejectedValueOnce(new Error('offline'));
    const { prefetchCharacterAssets } = require('../src/services/assetPrefetchService');
    expect(await prefetchCharacterAssets()).toBe(false);
    expect(Object.keys(mockStorage)).toEqual([]);
  });
});
