// Sticker catalogue API (backend precedence + offline fallback), the Home resume
// logic and the design-system tokens.
const mockStorage: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (key: string) => mockStorage[key] || null),
    setItem: jest.fn(async (key: string, value: string) => {
      mockStorage[key] = value;
    }),
    removeItem: jest.fn(async (key: string) => {
      delete mockStorage[key];
    }),
    clear: jest.fn(async () => {
      Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
    }),
  },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../src/services/apiService';
import {
  STICKER_CATALOG,
  mapBackendStickers,
  toBackendSticker,
  getStickerCategories,
  getStickerCategoryMeta,
  getStickerName,
} from '../src/data/stickersData';
import { getResumeLesson } from '../src/utils/resumeLesson';
import { LESSONS } from '../src/data/lessons';
import { kidTones, kidPalette, kidSizes, toneAt, TONE_CYCLE } from '../src/theme/kidTheme';

const fs = require('fs');
const path = require('path');

const jsonResponse = (body: any, status = 200) =>
  Promise.resolve({ ok: status >= 200 && status < 300, status, json: async () => body } as Response);
const originalFetch = global.fetch;

describe('Sticker catalogue API', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });
  afterEach(() => {
    global.fetch = originalFetch;
  });

  test('bundled catalogue round-trips through the backend serializer layout', () => {
    const back = mapBackendStickers(STICKER_CATALOG.map((s, i) => toBackendSticker(s, i)));
    expect(back).toEqual(STICKER_CATALOG);
  });

  test('committed Django seed fixture matches src/data/stickersData.ts', () => {
    const fixturePath = path.join(__dirname, '..', 'backend', 'rewards', 'fixtures', 'sticker_catalog.json');
    const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
    expect(fixture.stickers).toEqual(STICKER_CATALOG.map((s, i) => toBackendSticker(s, i)));
  });

  test('live backend stickers win and hit /rewards/stickers/', async () => {
    global.fetch = jest.fn(() =>
      jsonResponse([
        { slug: 'stk-dino', emoji: '🦖', category: 'dinosaurs', name_en: 'Tiny Dino', name_gu: 'નાનો ડાયનો', default_unlocked: true },
        { slug: 'stk-off', emoji: '🙈', category: 'animals', name_en: 'Hidden', is_active: false },
      ])
    ) as any;
    const list = await apiService.fetchStickers();
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toContain('/rewards/stickers/');
    expect(list).toHaveLength(1);
    expect(list[0]).toEqual({
      id: 'stk-dino',
      emoji: '🦖',
      category: 'dinosaurs',
      name: { en: 'Tiny Dino', gu: 'નાનો ડાયનો', hi: 'Tiny Dino' },
      defaultUnlocked: true,
    });
  });

  test('offline: falls back to last good response, then the bundled catalogue', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('offline'))) as any;
    expect(await apiService.fetchStickers()).toBe(STICKER_CATALOG);

    global.fetch = jest.fn(() => jsonResponse([{ slug: 'stk-x', emoji: '⭐', name_en: 'X' }])) as any;
    await apiService.fetchStickers();
    global.fetch = jest.fn(() => Promise.reject(new Error('offline'))) as any;
    const cached = await apiService.fetchStickers();
    expect(cached.map((s) => s.id)).toEqual(['stk-x']);
  });

  test('server error with empty list keeps bundled stickers', async () => {
    global.fetch = jest.fn(() => jsonResponse([], 200)) as any;
    expect(await apiService.fetchStickers()).toBe(STICKER_CATALOG);
  });

  test('categories are derived from data; unknown ones get a generic tab', () => {
    expect(getStickerCategories(STICKER_CATALOG)).toEqual(['animals', 'space', 'magic', 'treats']);
    expect(getStickerCategoryMeta('space', 'gu')).toEqual({ icon: '🚀', label: 'અંતરિક્ષ' });
    expect(getStickerCategoryMeta('dinosaurs', 'en')).toEqual({ icon: '✨', label: 'Dinosaurs' });
  });

  test('names fall back to English when a translation is missing', () => {
    const [s] = mapBackendStickers([{ slug: 'a', emoji: '🐙', name_en: 'Octopus', name_gu: '', name_hi: '' }]);
    expect(getStickerName(s, 'hi')).toBe('Octopus');
  });
});

describe('Home resume adventure', () => {
  const firstCat = LESSONS[0].categoryId;
  const catLessons = LESSONS.filter((l) => l.categoryId === firstCat);

  test('nothing completed -> null (Start button goes to subjects)', () => {
    expect(getResumeLesson([])).toBeNull();
  });

  test('resumes at the lesson after the most recently completed one', () => {
    expect(getResumeLesson([catLessons[0].id])?.id).toBe(catLessons[1].id);
  });

  test('skips lessons already completed and ignores non-lesson entries', () => {
    const done = [catLessons[2].id, catLessons[0].id, 'rhyme-twinkle'];
    expect(getResumeLesson(done)?.id).toBe(catLessons[1].id);
  });
});

describe('Design system tokens', () => {
  test('approved palette values', () => {
    expect(kidPalette.sky).toBe('#38BDF8');
    expect(kidPalette.sun).toBe('#FBBF24');
    expect(kidPalette.coral).toBe('#FB7185');
    expect(kidPalette.mint).toBe('#34D399');
    expect(kidPalette.lavender).toBe('#A78BFA');
    expect(kidPalette.border).toBe('#E2E8F0');
  });

  test('chunky sizes and fixed image frames', () => {
    expect(kidSizes.buttonSm).toBeGreaterThanOrEqual(52);
    expect(kidSizes.buttonLg).toBeLessThanOrEqual(64);
    expect([kidSizes.gridImage, kidSizes.detailImageW, kidSizes.detailImageH]).toEqual([72, 280, 230]);
    expect(kidSizes.maxContent).toBe(1200);
  });

  test('every tone has fill, deeper edge, text and tint', () => {
    Object.values(kidTones).forEach((t) => {
      ['fill', 'edge', 'text', 'onFill', 'tint', 'tintBorder'].forEach((k) => expect((t as any)[k]).toMatch(/^#[0-9A-F]{6}$/i));
    });
    expect(toneAt(0)).toBe(TONE_CYCLE[0]);
    expect(toneAt(TONE_CYCLE.length + 1)).toBe(TONE_CYCLE[1]);
    expect(toneAt(-1)).toBe(TONE_CYCLE[TONE_CYCLE.length - 1]);
  });
});
