// Verifies that live Django responses take precedence over bundled data for
// rhymes and single-lesson lookups, and that offline fallbacks still work.
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
import { apiService, findBundledLesson, mergeLesson } from '../src/services/apiService';
import { RHYMES_DATA, mapBackendRhymes, toBackendRhyme } from '../src/data/rhymesData';
import { LESSONS } from '../src/data/lessons';

const jsonResponse = (body: any, status = 200) =>
  Promise.resolve({ ok: status >= 200 && status < 300, status, json: async () => body } as Response);

const originalFetch = global.fetch;

describe('Backend precedence & offline fallback', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('rhymes', () => {
    test('bundled rhymes round-trip through the backend field layout unchanged', () => {
      const rows = RHYMES_DATA.map((r, i) => toBackendRhyme(r, i));
      const back = mapBackendRhymes(rows);
      expect(back).toHaveLength(RHYMES_DATA.length);
      back.forEach((r, i) => {
        expect(r.id).toBe(RHYMES_DATA[i].id);
        expect(r.categoryLang).toBe(RHYMES_DATA[i].categoryLang);
        expect(r.title).toBe(RHYMES_DATA[i].title);
        expect(r.lines.map((l) => l.main)).toEqual(RHYMES_DATA[i].lines.map((l) => l.main));
        expect(r.lines.map((l) => l.sub)).toEqual(RHYMES_DATA[i].lines.map((l) => l.sub));
      });
    });

    test('backend lyrics win over bundled lyrics for the same slug', async () => {
      global.fetch = jest.fn(() =>
        jsonResponse([
          {
            slug: 'twinkle',
            title: 'Twinkle (Server Edit)',
            title_gujarati: 'ઝબૂક',
            category: 'en',
            lyrics_english: 'Line one from server\nLine two from server',
            lyrics_gujarati: 'પહેલી\nબીજી',
          },
        ])
      ) as any;
      const rhymes = await apiService.fetchRhymes();
      expect(rhymes).toHaveLength(1);
      expect(rhymes[0].title).toBe('Twinkle (Server Edit)');
      expect(rhymes[0].lines).toEqual([
        { main: 'Line one from server', sub: 'પહેલી' },
        { main: 'Line two from server', sub: 'બીજી' },
      ]);
    });

    test('empty backend rows (no lyrics) fall back to the bundled rhyme, unknown ones are dropped', async () => {
      global.fetch = jest.fn(() =>
        jsonResponse([
          { slug: 'machli', title: 'machli', category: 'nursery' },
          { slug: 'brand-new-empty', title: 'brand-new-empty', category: 'nursery' },
        ])
      ) as any;
      const rhymes = await apiService.fetchRhymes();
      expect(rhymes.map((r) => r.id)).toEqual(['machli']);
      expect(rhymes[0].categoryLang).toBe('hi');
      expect(rhymes[0].lines.length).toBeGreaterThan(0);
    });

    test('a backend-only rhyme infers its language from the script when category is generic', async () => {
      global.fetch = jest.fn(() =>
        jsonResponse([{ slug: 'new-gu', title: 'નવું ગીત', category: 'nursery', lyrics_gujarati: 'એક\nબે' }])
      ) as any;
      const [rhyme] = await apiService.fetchRhymes();
      expect(rhyme.categoryLang).toBe('gu');
      expect(rhyme.lines.map((l) => l.main)).toEqual(['એક', 'બે']);
    });

    test('offline: falls back to the bundled rhymes', async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error('offline'))) as any;
      const rhymes = await apiService.fetchRhymes();
      expect(rhymes).toBe(RHYMES_DATA);
    });

    test('offline: ignores legacy raw-row caches and uses mapped caches', async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error('offline'))) as any;
      await AsyncStorage.setItem('@kidszone_rhymes_cache', JSON.stringify([{ slug: 'twinkle' }]));
      expect(await apiService.fetchRhymes()).toBe(RHYMES_DATA);

      const mapped = mapBackendRhymes([toBackendRhyme(RHYMES_DATA[0], 0)]);
      await AsyncStorage.setItem('@kidszone_rhymes_cache', JSON.stringify(mapped));
      expect(await apiService.fetchRhymes()).toEqual(mapped);
    });
  });

  describe('lesson detail lookup', () => {
    const sample = LESSONS[5];

    test('returns the live backend lesson when online', async () => {
      global.fetch = jest.fn(() =>
        jsonResponse({ stable_id: sample.id, category: sample.categoryId, title: 'Server Title', lesson_data: {} })
      ) as any;
      const lesson = await apiService.fetchLessonById(sample.id);
      expect(lesson?.id).toBe(sample.id);
      expect(lesson?.title).toBe('Server Title');
      expect((global.fetch as jest.Mock).mock.calls[0][0]).toContain(`/lessons/by-slug/${sample.id}/`);
    });

    test('finds a backend-only lesson that is not in the bundle', async () => {
      global.fetch = jest.fn(() =>
        jsonResponse({ stable_id: 'server-only-1', category: 'animals', title: 'Axolotl', lesson_data: {} })
      ) as any;
      const lesson = await apiService.fetchLessonById('server-only-1');
      expect(lesson?.id).toBe('server-only-1');
      expect(lesson?.title).toBe('Axolotl');
    });

    test('offline: uses the bundled lesson, honouring animal id aliases', async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error('offline'))) as any;
      expect((await apiService.fetchLessonById(sample.id))?.id).toBe(sample.id);

      const animal = LESSONS.find((l) => l.id.startsWith('an-'));
      if (animal) {
        const alias = animal.id.replace('an-', 'animal-');
        expect((await apiService.fetchLessonById(alias))?.id).toBe(animal.id);
      }
    });

    test('unknown id returns null instead of silently opening another lesson', async () => {
      global.fetch = jest.fn(() => jsonResponse({ detail: 'Lesson not found.' }, 404)) as any;
      expect(await apiService.fetchLessonById('does-not-exist-xyz')).toBeNull();
      expect(findBundledLesson('does-not-exist-xyz')).toBeUndefined();
    });

    test('mergeLesson: backend values win, empty backend fields keep bundled values', () => {
      const bundled = { ...sample, imageUrl: 'https://example.test/bundled.jpg', subtitle: 'Bundled sub' };
      const merged = mergeLesson(bundled, {
        ...sample,
        id: 'an-alias-from-server',
        title: 'Fresh',
        imageUrl: '',
        subtitle: undefined,
      });
      expect(merged.title).toBe('Fresh');
      expect(merged.imageUrl).toBe('https://example.test/bundled.jpg');
      expect(merged.subtitle).toBe('Bundled sub');
      expect(merged.id).toBe(sample.id);
    });
  });
});
