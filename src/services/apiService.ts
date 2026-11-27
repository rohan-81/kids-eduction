import AsyncStorage from '@react-native-async-storage/async-storage';
import { LESSONS } from '../data/lessons';
import { CATEGORIES } from '../data/categories';
import { ADVENTURE_LEVELS, type AdventureLevel } from '../data/adventureLevels';
import { COLORING_TEMPLATES } from '../data/coloringTemplates';
import { STORIES_DATA, type StoryBook, type StoryChoice, type StoryScene } from '../data/storiesData';
import { GAME_QUESTIONS } from '../data/gamesData';
import { BADGE_DEFINITIONS, BadgeItemDef } from '../data/badgesData';
import { RHYMES_DATA, RhymeItem, mapBackendRhymes, isRetiredRhymeId, type BackendRhyme } from '../data/rhymesData';
import { STICKER_CATALOG, StickerItem, mapBackendStickers, type BackendSticker } from '../data/stickersData';
import { isImageRef, toAbsoluteImageUrl, withArtVersion } from '../utils/storyArt';
import type {
  LessonItem,
  AppLanguage,
  AgeGroup,
  GameType,
  GameQuestion,
  CategoryInfo,
  CategoryId,
  UserProgress,
} from '../types';
import {
  listFrom,
  type BackendAdventureLevel,
  type BackendBadge,
  type BackendCategory,
  type BackendColoringTemplate,
  type BackendGameQuestion,
  type BackendLesson,
  type BackendStory,
  type BackendStoryScene,
  type CloudSyncPayload,
  type CloudSyncResponse,
  type GameResultPayload,
  type LessonProgressPayload,
  type QuestionSubmitResult,
} from '../types/api';
import { authService } from './authService';
import { filterLessonsForClass } from '../utils/ageDetailHelper';
import { API_BASE_URL, safeGetApiBaseUrl } from './apiConfig';

const CACHE_KEYS = {
  LESSONS: '@kidszone_lessons_cache',
  CATEGORIES: '@kidszone_categories_cache',
  STORIES: '@kidszone_stories_cache',
  BADGES: '@kidszone_badges_cache',
  ADVENTURE: '@kidszone_adventure_cache',
  COLORING: '@kidszone_coloring_cache',
  RHYMES: '@kidszone_rhymes_cache',
  STICKERS: '@kidszone_stickers_cache',
  GAME_QUESTIONS_PREFIX: '@kidszone_gq_',
};

const LANGUAGES: ReadonlyArray<LessonItem['language']> = ['gu', 'en', 'hi', 'all'];
const AGE_GROUPS: ReadonlyArray<LessonItem['ageGroup']> = ['2-4', '4-6', '6-8', 'all'];

const asLanguage = (v: unknown): LessonItem['language'] =>
  LANGUAGES.includes(v as LessonItem['language']) ? (v as LessonItem['language']) : 'all';
const asAgeGroup = (v: unknown): LessonItem['ageGroup'] =>
  AGE_GROUPS.includes(v as LessonItem['ageGroup']) ? (v as LessonItem['ageGroup']) : 'all';
/** null/'' from the API become undefined so optional LessonItem fields stay absent. */
const opt = (v: string | null | undefined): string | undefined => (v === null || v === '' ? undefined : v);

/** Maps one row from backend/lessons/serializers.py (LessonSerializer) to the app's LessonItem. */
export function mapBackendLesson(item: BackendLesson): LessonItem {
  const extra = item.lesson_data || {};
  const exampleMeaning = opt(item.example_meaning);
  const audioPrompt = opt(item.audio_prompt);
  const image = opt(item.example_image) || extra.imageUrl;
  return {
    id: String(item.stable_id || item.id),
    // Server categories are open-ended; unknown ones still render as a plain category id.
    categoryId: item.category as CategoryId,
    language: asLanguage(item.language),
    ageGroup: asAgeGroup(item.age_group),
    symbol: opt(item.symbol) || item.title?.charAt(0) || '★',
    title: item.title,
    subtitle: opt(item.subtitle),
    phonetic: opt(item.phonetic),
    exampleWord: opt(item.example_word),
    exampleMeaning,
    exampleMeaningGu: extra.exampleMeaningGu || exampleMeaning,
    exampleMeaningHi: extra.exampleMeaningHi || exampleMeaning,
    exampleImage: image,
    imageUrl: image,
    audioPrompt: audioPrompt || item.title,
    audioPromptGu: extra.audioPromptGu || audioPrompt,
    audioPromptHi: extra.audioPromptHi,
    audioPromptEn: extra.audioPromptEn,
    subType: extra.subType,
    soundKey: extra.soundKey,
    audioUrl: extra.audioUrl,
    visualColor: opt(item.visual_color),
    tracingPath: item.tracing_path,
    words: item.words,
    rhyme: opt(item.rhyme_text),
    lessonData: extra,
  };
}

/** Alternate ids a lesson may be linked under (animal lessons historically used both prefixes). */
export function lessonIdAliases(id: string): string[] {
  return Array.from(new Set([id, id.replace('animal-', 'an-'), `an-${id}`, id.replace('an-', 'animal-')]));
}

/** Finds a lesson in the bundled offline data, honouring legacy id aliases. */
export function findBundledLesson(id: string): LessonItem | undefined {
  const aliases = lessonIdAliases(id);
  return LESSONS.find((l) => aliases.includes(l.id));
}

/**
 * Overlays a backend lesson on its bundled counterpart: backend values win,
 * but fields the backend leaves empty keep the bundled value (e.g. local image requires).
 */
export function mergeLesson(bundled: LessonItem | undefined, fresh: LessonItem): LessonItem {
  if (!bundled) return fresh;
  const merged: Record<string, unknown> = { ...bundled };
  Object.entries(fresh).forEach(([k, v]) => {
    const empty = v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
    if (!empty) merged[k] = v;
  });
  merged.id = bundled.id;
  // Every key comes from one of two LessonItems, so the merged record is a LessonItem.
  return merged as unknown as LessonItem;
}

const inFlightRefreshes = new Map<string, Promise<unknown>>();
let backendWarmed = false;

async function readJsonCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function dedupedRefresh<T>(key: string, fetcher: () => Promise<T | null>): Promise<T | null> {
  const existing = inFlightRefreshes.get(key);
  if (existing) return existing as Promise<T | null>;
  const promise = fetcher().finally(() => {
    inFlightRefreshes.delete(key);
  });
  inFlightRefreshes.set(key, promise);
  return promise;
}

/** Story scene from the API -> app scene, reusing bundled emoji art when the API sends an image. */
function mapBackendScene(sc: BackendStoryScene, bundled: StoryBook | undefined): StoryScene {
  const page = sc.scene_number || 1;
  const illustration = sc.illustration;
  const textEn = sc.text_english || '';
  let choice: StoryChoice | undefined;
  if (Array.isArray(sc.choices)) choice = sc.choices[0];
  else if (sc.choices && Array.isArray(sc.choices.options)) choice = sc.choices;
  return {
    page,
    image: isImageRef(illustration) ? withArtVersion(toAbsoluteImageUrl(illustration, API_BASE_URL)) : undefined,
    illustration: isImageRef(illustration)
      ? bundled?.scenes[page - 1]?.illustration || bundled?.coverEmoji || '📖'
      : illustration || '📖',
    textGu: sc.text_gujarati || textEn,
    textHi: sc.text_hindi || textEn,
    textEn,
    choice,
  };
}

/** Maps one row from backend/stories/serializers.py (StorySerializer) to a StoryBook. */
export function mapBackendStory(item: BackendStory): StoryBook {
  const slug = item.slug || String(item.id);
  const bundled = STORIES_DATA.find((st) => st.id === slug);
  const cover = item.cover_image;
  const moral = item.moral || '';
  return {
    id: slug,
    titleGu: item.title_gujarati || item.title,
    titleHi: item.title_hindi || item.title,
    titleEn: item.title,
    coverEmoji: isImageRef(cover) ? bundled?.coverEmoji || '📖' : cover || bundled?.coverEmoji || '📖',
    coverImage: isImageRef(cover) ? withArtVersion(toAbsoluteImageUrl(cover, API_BASE_URL)) : undefined,
    bgColor: '#E8F8F5',
    moralGu: item.moral_gujarati || moral,
    moralHi: item.moral_hindi || moral,
    moralEn: moral,
    category: item.category || undefined,
    ageGroup: item.age_group || undefined,
    scenes: (item.scenes || []).map((sc) => mapBackendScene(sc, bundled)),
  };
}

/** Maps a game question row; returns null for rows the games cannot render. */
export function mapBackendGameQuestion(item: BackendGameQuestion, fallbackType: GameType): GameQuestion | null {
  if (!item || !item.question_text) return null;
  const options = Array.isArray(item.options) ? item.options : [];
  if (options.length < (fallbackType === 'picture-puzzle' ? 1 : 2)) return null;
  const resolvedType = (item.question_type || fallbackType) as GameType;
  let prompt = item.question_text;
  let audioText = item.audio_text || item.question_text;

  if (resolvedType === 'picture-matching') {
    const lang = item.language === 'hi' || item.language === 'en' ? item.language : 'gu';
    const vis = item.display_visual || '';
    const isBird = vis === '🦚' || vis === '🦆' || /પક્ષી|bird|पक्षी/.test(prompt);
    const isFruit = vis === '🥭' || /ફળ|fruit|फल/.test(prompt);
    const normalizedPrompt =
      lang === 'hi'
        ? isBird
          ? 'यह कौन सा पक्षी है?'
          : isFruit
            ? 'यह कौन सा फल है?'
            : 'यह कौन सा जानवर है?'
        : lang === 'en'
          ? isBird
            ? 'Which bird is this?'
            : isFruit
              ? 'Which fruit is this?'
              : 'Which animal is this?'
          : isBird
            ? 'આ કયું પક્ષી છે?'
            : isFruit
              ? 'આ કયું ફળ છે?'
              : 'આ કયું પ્રાણી છે?';
    prompt = normalizedPrompt;
    audioText = normalizedPrompt;
  }

  return {
    id: String(item.stable_id || item.id),
    gameType: resolvedType,
    prompt,
    audioText,
    displayVisual: item.display_visual || undefined,
    countTarget: item.count_target ?? undefined,
    options,
    correctOptionId: String(item.correct_option_id || item.correct_answer || '1'),
    ageGroup: item.age_group,
    explanation: item.explanation || undefined,
    hint: item.hint || undefined,
    image: item.image || undefined,
    audio: item.audio || undefined,
  };
}

const lessonCount = (p: Partial<UserProgress> | undefined): number =>
  p?.completedLessons?.length || 0;

/** Lesson-count unlock rule for backend-defined badges. */
const lessonCountRule = (required: number): Pick<BadgeItemDef, 'checkUnlocked' | 'getProgress'> => ({
  checkUnlocked: (p) => lessonCount(p) >= required,
  getProgress: (p) => ({ current: Math.min(lessonCount(p), required), total: required }),
});

/** Badge as persisted in the JSON cache: everything except the (non-serialisable) functions. */
type CachedBadge = Omit<BadgeItemDef, 'checkUnlocked' | 'getProgress'>;

/** Re-attaches unlock functions to cached badges. Unknown backend-only badges stay LOCKED. */
export function attachBadgeFunctions(items: CachedBadge[]): BadgeItemDef[] {
  const defaultMap = new Map(BADGE_DEFINITIONS.map((b) => [b.id, b]));
  return items.map((item) => {
    const def = defaultMap.get(item.id);
    if (def) return { ...item, checkUnlocked: def.checkUnlocked, getProgress: def.getProgress };
    const req = Number(item.requirementValue);
    if (Number.isFinite(req) && req > 0) return { ...item, ...lessonCountRule(req) };
    return { ...item, checkUnlocked: () => false, getProgress: () => ({ current: 0, total: 1 }) };
  });
}

export function mapBackendBadge(item: BackendBadge): BadgeItemDef {
  const def = BADGE_DEFINITIONS.find((b) => b.id === item.slug);
  const title = item.title || item.slug;
  const required = Number(item.requirement_value) > 0 ? Number(item.requirement_value) : 1;
  const rule = lessonCountRule(required);
  return {
    id: item.slug,
    emoji: item.icon || def?.emoji || '🏆',
    nameGu: item.name_gu || def?.nameGu || title,
    nameHi: item.name_hi || def?.nameHi || title,
    nameEn: item.name_en || def?.nameEn || title,
    descGu: item.desc_gu || def?.descGu || item.description || '',
    descHi: item.desc_hi || def?.descHi || item.description || '',
    descEn: item.desc_en || def?.descEn || item.description || '',
    reqGu: item.req_gu || def?.reqGu || '',
    reqHi: item.req_hi || def?.reqHi || '',
    reqEn: item.req_en || def?.reqEn || '',
    rewardCoins: item.reward_coins || def?.rewardCoins || 20,
    iconBg: def?.iconBg || '#FEF3C7',
    iconBorder: def?.iconBorder || '#FDE68A',
    requirementValue: required,
    checkUnlocked: def?.checkUnlocked || rule.checkUnlocked,
    getProgress: def?.getProgress || rule.getProgress,
  };
}

/** True for objects that are complete app-side adventure levels (not raw backend rows). */
export function isAdventureLevel(v: unknown): v is AdventureLevel {
  const lvl = v as Partial<AdventureLevel> | null;
  return (
    !!lvl &&
    typeof lvl.level === 'number' &&
    !!lvl.question &&
    Array.isArray(lvl.question.options) &&
    lvl.question.options.length > 0
  );
}

const isAdventureQuestion = (q: unknown): q is AdventureLevel['question'] => {
  const qq = q as Partial<AdventureLevel['question']> | null;
  return (
    !!qq &&
    typeof qq.promptEn === 'string' &&
    Array.isArray(qq.options) &&
    qq.options.length > 0 &&
    qq.options.some((o) => o && o.isCorrect === true)
  );
};

/**
 * Backend adventure rows (level_number/world_name/questions_data) are NOT app AdventureLevels.
 * They used to be stored as-is, so the map saw `level: undefined` (every level locked) and
 * tapping a level crashed on `question.options`. Rows now only adjust the bundled levels:
 * `is_active: false` hides a level, and a complete `questions_data` question replaces the
 * bundled one; localized titles/art always come from the bundle.
 */
export function mergeBackendAdventureLevels(rows: BackendAdventureLevel[]): AdventureLevel[] {
  const byNumber = new Map(rows.filter((r) => r && typeof r.level_number === 'number').map((r) => [r.level_number, r]));
  if (byNumber.size === 0) return ADVENTURE_LEVELS;
  return ADVENTURE_LEVELS.filter((lvl) => byNumber.get(lvl.level)?.is_active !== false).map((lvl) => {
    const row = byNumber.get(lvl.level);
    const q = Array.isArray(row?.questions_data) ? row?.questions_data[0] : row?.questions_data;
    return isAdventureQuestion(q) ? { ...lvl, question: q } : lvl;
  });
}

/** Names the colouring screen overlays on its own template definitions. */
export interface ColoringTemplateLabels {
  id: string;
  nameGu?: string;
  nameHi?: string;
  nameEn?: string;
}

/** Accepts backend rows (slug/name_*) or bundled/cached templates (id/name*). */
export function toColoringLabels(
  row: BackendColoringTemplate | ColoringTemplateLabels
): ColoringTemplateLabels | null {
  if ('slug' in row && row.slug) {
    return { id: row.slug, nameGu: row.name_gu, nameHi: row.name_hi, nameEn: row.name_en || row.title };
  }
  if ('id' in row && row.id) {
    return { id: row.id, nameGu: row.nameGu, nameHi: row.nameHi, nameEn: row.nameEn };
  }
  return null;
}

const toLabelsList = (rows: Array<BackendColoringTemplate | ColoringTemplateLabels>): ColoringTemplateLabels[] =>
  rows.map(toColoringLabels).filter((r): r is ColoringTemplateLabels => r !== null);

/** A category as returned by the API, or the bundled definition when offline. */
export type CategoryRecord = BackendCategory | CategoryInfo;

export const apiService = {
  /** Non-blocking ping at app startup so Render Free tier wakes up before the user taps a cloud screen. */
  warmUpBackend(): void {
    if (backendWarmed) return;
    backendWarmed = true;
    if (typeof process !== 'undefined' && process.env?.JEST_WORKER_ID) return;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      // Node/Jest timers expose unref(); React Native timers are plain numbers.
      const timer = timeoutId as unknown as { unref?: () => void };
      if (typeof timer === 'object' && typeof timer.unref === 'function') {
        timer.unref();
      }
      fetch(`${safeGetApiBaseUrl()}/lessons/categories/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      })
        .catch(() => {})
        .finally(() => clearTimeout(timeoutId));
    } catch {}
  },
  /**
   * Single lesson for the detail screen.
   * Order: live backend (/lessons/by-slug/<id>/) -> cached backend lists -> bundled LESSONS.
   * Returns null when the id is unknown everywhere.
   */
  async fetchLessonById(id: string): Promise<LessonItem | null> {
    const aliases = lessonIdAliases(id);
    for (const candidate of aliases) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      try {
        const res = await fetch(`${API_BASE_URL}/lessons/by-slug/${encodeURIComponent(candidate)}/`, {
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
        });
        if (res.ok) {
          const data = (await res.json()) as BackendLesson | null;
          if (data && (data.stable_id || data.id)) return mapBackendLesson(data);
        } else if (res.status !== 404) {
          break; // server error: don't hammer it with every alias
        }
      } catch {
        break; // offline / timeout: go straight to caches
      } finally {
        clearTimeout(timeoutId);
      }
    }

    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.LESSONS);
      if (cached) {
        const list: LessonItem[] = JSON.parse(cached);
        const hit = Array.isArray(list) ? list.find((l) => aliases.includes(l.id)) : undefined;
        if (hit) return hit;
      }
    } catch { }

    return findBundledLesson(id) || null;
  },

  async fetchLessons(
    language?: AppLanguage,
    ageGroup?: AgeGroup,
    category?: string
  ): Promise<LessonItem[]> {
    // The request filters by age group when no category is given, so the cache key must too;
    // otherwise a class change could be served another class's (incomplete) list (audit P2-3).
    const ageKey = category ? 'all' : ageGroup || 'all';
    const cacheKey = `${CACHE_KEYS.LESSONS}_${language || 'all'}_${category || 'all'}_${ageKey}`;
    const filterCached = (list: LessonItem[]) => {
      let filtered = list.filter((lesson) => {
        const matchLang = !language || lesson.language === 'all' || lesson.language === language;
        const matchCat = !category || lesson.categoryId === category;
        const matchAge = category ? true : (!ageGroup || lesson.ageGroup === 'all' || lesson.ageGroup === ageGroup);
        return matchLang && matchAge && matchCat;
      });
      if (ageGroup && category) {
        filtered = filterLessonsForClass(filtered, ageGroup, category);
      }
      return filtered;
    };

    const refreshFromNetwork = () =>
      dedupedRefresh(cacheKey, async (): Promise<LessonItem[] | null> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        try {
          const params = new URLSearchParams();
          if (language) params.append('language', language);
          if (ageGroup && !category) params.append('age_group', ageGroup);
          if (category) params.append('category', category);

          const response = await fetch(`${API_BASE_URL}/lessons/?${params.toString()}`, {
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
          });

          if (response.ok) {
            const results = listFrom<BackendLesson>(await response.json());
            if (results.length > 0) {
              const mapped: LessonItem[] = results.map(mapBackendLesson);
              try {
                await AsyncStorage.setItem(cacheKey, JSON.stringify(mapped));
                // The global cache backs fetchLessonById: merge by id instead of replacing it
                // with this (filtered) subset.
                const globalList = (await readJsonCache<LessonItem[]>(CACHE_KEYS.LESSONS)) || [];
                const byId = new Map<string, LessonItem>(
                  (Array.isArray(globalList) ? globalList : []).map((l) => [l.id, l])
                );
                mapped.forEach((l) => byId.set(l.id, l));
                await AsyncStorage.setItem(CACHE_KEYS.LESSONS, JSON.stringify(Array.from(byId.values())));
              } catch {}
              return mapped;
            }
          }
        } catch {
          // offline / timeout / bad JSON: caller falls back to cache or bundled data
        } finally {
          clearTimeout(timeoutId); // cleared only after the body was read (audit P2-7)
        }
        return null;
      });

    // Cache-first for instant UI; refresh quietly in background
    const cached =
      (await readJsonCache<LessonItem[]>(cacheKey)) ||
      (await readJsonCache<LessonItem[]>(CACHE_KEYS.LESSONS));
    if (Array.isArray(cached) && cached.length > 0) {
      const hit = filterCached(cached);
      if (hit.length > 0) {
        void refreshFromNetwork();
        return hit;
      }
    }

    const fresh = await refreshFromNetwork();
    if (fresh && fresh.length > 0) {
      return ageGroup && category ? filterLessonsForClass(fresh, ageGroup, category) : fresh;
    }

    return filterCached(LESSONS);
  },

  async fetchCategories(): Promise<CategoryRecord[]> {
    const refresh = () =>
      dedupedRefresh(CACHE_KEYS.CATEGORIES, async (): Promise<BackendCategory[] | null> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        try {
          const res = await fetch(`${safeGetApiBaseUrl()}/lessons/categories/`, {
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
          });
          if (res.ok) {
            const results = listFrom<BackendCategory>(await res.json());
            if (results.length > 0) {
              try {
                await AsyncStorage.setItem(CACHE_KEYS.CATEGORIES, JSON.stringify(results));
              } catch {}
              return results;
            }
          }
        } catch {
          // offline / timeout / bad JSON: caller falls back to cache or bundled data
        } finally {
          clearTimeout(timeoutId); // cleared only after the body was read (audit P2-7)
        }
        return null;
      });

    const cached = await readJsonCache<BackendCategory[]>(CACHE_KEYS.CATEGORIES);
    if (Array.isArray(cached) && cached.length > 0) {
      void refresh();
      return cached;
    }

    const fresh = await refresh();
    return fresh && fresh.length > 0 ? fresh : CATEGORIES;
  },

  async fetchStories(language?: AppLanguage): Promise<StoryBook[]> {
    const refresh = () =>
      dedupedRefresh(CACHE_KEYS.STORIES, async (): Promise<StoryBook[] | null> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        try {
          const res = await fetch(`${safeGetApiBaseUrl()}/stories/`, {
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
          });
          if (res.ok) {
            const results = listFrom<BackendStory>(await res.json());
            if (results.length > 0) {
              const mapped: StoryBook[] = results.map(mapBackendStory);
              try {
                await AsyncStorage.setItem(CACHE_KEYS.STORIES, JSON.stringify(mapped));
              } catch {}
              return mapped;
            }
          }
        } catch {
          // offline / timeout / bad JSON: caller falls back to cache or bundled data
        } finally {
          clearTimeout(timeoutId); // cleared only after the body was read (audit P2-7)
        }
        return null;
      });

    const cached = await readJsonCache<StoryBook[]>(CACHE_KEYS.STORIES);
    if (Array.isArray(cached) && cached.length > 0) {
      void refresh();
      return cached;
    }

    const fresh = await refresh();
    return fresh && fresh.length > 0 ? fresh : STORIES_DATA;
  },

  async fetchGameQuestions(
    gameType: GameType,
    language: AppLanguage,
    ageGroup?: AgeGroup
  ): Promise<GameQuestion[]> {
    const cacheKey = `${CACHE_KEYS.GAME_QUESTIONS_PREFIX}${gameType}_${language}_${ageGroup || 'all'}`;
    const refresh = () =>
      dedupedRefresh(cacheKey, async (): Promise<GameQuestion[] | null> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        try {
          const params = new URLSearchParams();
          params.append('question_type', gameType);
          params.append('language', language);
          if (ageGroup) params.append('age_group', ageGroup);

          const res = await fetch(`${API_BASE_URL}/questions/game-questions/?${params.toString()}`, {
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
          });

          if (res.ok) {
            const results = listFrom<BackendGameQuestion>(await res.json());
            if (results.length > 0) {
              const mapped: GameQuestion[] = results
                .map((item) => mapBackendGameQuestion(item, gameType))
                .filter((q): q is GameQuestion => q !== null);

              if (mapped.length > 0) {
                try {
                  await AsyncStorage.setItem(cacheKey, JSON.stringify(mapped));
                } catch {}
                return mapped;
              }
            } else {
              try {
                await AsyncStorage.removeItem(cacheKey);
              } catch {}
              return [];
            }
          }
        } catch {
          // offline / timeout / bad JSON: caller falls back to cache or bundled data
        } finally {
          clearTimeout(timeoutId); // cleared only after the body was read (audit P2-7)
        }
        return null;
      });

    const cached = await readJsonCache<GameQuestion[]>(cacheKey);
    const hasStalePicturePrompt =
      gameType === 'picture-matching' &&
      Array.isArray(cached) &&
      cached.some((q) => /ગૌમાતા|દૂધ આપનાર|ચિત્ર જુઓ:|Look at the picture:|चित्र देखें:/.test(q?.prompt || ''));
    if (Array.isArray(cached) && cached.length > 0 && !hasStalePicturePrompt) {
      void refresh();
      return cached;
    }

    const fresh = await refresh();
    if (fresh !== null) return fresh;

    const rawList =
      GAME_QUESTIONS[gameType]?.[language] ||
      GAME_QUESTIONS[gameType]?.en ||
      [];
    return rawList;
  },

  async fetchBadges(language?: AppLanguage): Promise<BadgeItemDef[]> {
    const refresh = () =>
      dedupedRefresh(CACHE_KEYS.BADGES, async (): Promise<BadgeItemDef[] | null> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        try {
          const res = await fetch(`${API_BASE_URL}/rewards/badges/`, {
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
          });

          if (res.ok) {
            const results = listFrom<BackendBadge>(await res.json());
            if (results.length > 0) {
              const mapped: BadgeItemDef[] = results.map(mapBackendBadge);
              try {
                await AsyncStorage.setItem(CACHE_KEYS.BADGES, JSON.stringify(mapped));
              } catch {}
              return mapped;
            }
          }
        } catch {
          // offline / timeout / bad JSON: caller falls back to cache or bundled data
        } finally {
          clearTimeout(timeoutId); // cleared only after the body was read (audit P2-7)
        }
        return null;
      });

    const cached = await readJsonCache<CachedBadge[]>(CACHE_KEYS.BADGES);
    if (Array.isArray(cached) && cached.length > 0) {
      void refresh();
      return attachBadgeFunctions(cached);
    }

    const fresh = await refresh();
    return fresh && fresh.length > 0 ? fresh : BADGE_DEFINITIONS;
  },

  /**
   * Rhymes for the Rhymes studio, already in UI shape.
   * Order: cached AsyncStorage (instant) + background refresh -> live backend -> bundled RHYMES_DATA.
   */
  async fetchRhymes(): Promise<RhymeItem[]> {
    const refresh = () =>
      dedupedRefresh(CACHE_KEYS.RHYMES, async (): Promise<RhymeItem[] | null> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        try {
          const res = await fetch(`${API_BASE_URL}/rhymes/`, {
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
          });
          if (res.ok) {
            const mapped = mapBackendRhymes(listFrom<BackendRhyme>(await res.json()));
            if (mapped.length > 0) {
              try {
                await AsyncStorage.setItem(CACHE_KEYS.RHYMES, JSON.stringify(mapped));
              } catch {}
              return mapped;
            }
          }
        } catch {
        } finally {
          clearTimeout(timeoutId);
        }
        return null;
      });

    const cached = await readJsonCache<RhymeItem[]>(CACHE_KEYS.RHYMES);
    if (Array.isArray(cached) && cached.length > 0 && Array.isArray(cached[0]?.lines)) {
      const current = cached.filter((r) => !isRetiredRhymeId(r?.id));
      if (current.length > 0) {
        void refresh();
        return current;
      }
    }

    const fresh = await refresh();
    return fresh && fresh.length > 0 ? fresh : RHYMES_DATA;
  },

  /**
   * Sticker Album catalogue.
   * Order: cached AsyncStorage (instant) + background refresh -> live backend -> bundled STICKER_CATALOG.
   */
  async fetchStickers(): Promise<StickerItem[]> {
    const refresh = () =>
      dedupedRefresh(CACHE_KEYS.STICKERS, async (): Promise<StickerItem[] | null> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        try {
          const res = await fetch(`${API_BASE_URL}/rewards/stickers/`, {
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
          });
          if (res.ok) {
            const mapped = mapBackendStickers(listFrom<BackendSticker>(await res.json()));
            if (mapped.length > 0) {
              try {
                await AsyncStorage.setItem(CACHE_KEYS.STICKERS, JSON.stringify(mapped));
              } catch {}
              return mapped;
            }
          }
        } catch {
        } finally {
          clearTimeout(timeoutId);
        }
        return null;
      });

    const cached = await readJsonCache<StickerItem[]>(CACHE_KEYS.STICKERS);
    if (Array.isArray(cached) && cached.length > 0 && cached[0]?.name) {
      void refresh();
      return cached;
    }

    const fresh = await refresh();
    return fresh && fresh.length > 0 ? fresh : STICKER_CATALOG;
  },

  async fetchAdventureLevels(): Promise<AdventureLevel[]> {
    const refresh = () =>
      dedupedRefresh(CACHE_KEYS.ADVENTURE, async (): Promise<AdventureLevel[] | null> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        try {
          const res = await fetch(`${safeGetApiBaseUrl()}/gamification/levels/`, {
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
          });
          if (res.ok) {
            const rows = listFrom<BackendAdventureLevel>(await res.json());
            if (rows.length > 0) {
              const levels = mergeBackendAdventureLevels(rows);
              try {
                await AsyncStorage.setItem(CACHE_KEYS.ADVENTURE, JSON.stringify(levels));
              } catch {}
              return levels;
            }
          }
        } catch {
          // offline / timeout / bad JSON: caller falls back to cache or bundled data
        } finally {
          clearTimeout(timeoutId); // cleared only after the body was read (audit P2-7)
        }
        return null;
      });

    // Older app versions cached raw backend rows here; only accept complete levels.
    const cached = await readJsonCache<unknown[]>(CACHE_KEYS.ADVENTURE);
    if (Array.isArray(cached) && cached.length > 0 && cached.every(isAdventureLevel)) {
      void refresh();
      return cached;
    }

    const fresh = await refresh();
    return fresh && fresh.length > 0 ? fresh : ADVENTURE_LEVELS;
  },

  async fetchColoringTemplates(): Promise<ColoringTemplateLabels[]> {
    const refresh = () =>
      dedupedRefresh(CACHE_KEYS.COLORING, async (): Promise<ColoringTemplateLabels[] | null> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        try {
          const res = await fetch(`${safeGetApiBaseUrl()}/creative/coloring/`, {
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
          });
          if (res.ok) {
            const labels = toLabelsList(listFrom<BackendColoringTemplate>(await res.json()));
            if (labels.length > 0) {
              try {
                await AsyncStorage.setItem(CACHE_KEYS.COLORING, JSON.stringify(labels));
              } catch {}
              return labels;
            }
          }
        } catch {
          // offline / timeout / bad JSON: caller falls back to cache or bundled data
        } finally {
          clearTimeout(timeoutId); // cleared only after the body was read (audit P2-7)
        }
        return null;
      });

    const cached = await readJsonCache<Array<BackendColoringTemplate | ColoringTemplateLabels>>(CACHE_KEYS.COLORING);
    const cachedLabels = Array.isArray(cached) ? toLabelsList(cached) : [];
    if (cachedLabels.length > 0) {
      void refresh();
      return cachedLabels;
    }

    const fresh = await refresh();
    return fresh && fresh.length > 0 ? fresh : toLabelsList(COLORING_TEMPLATES);
  },

  async submitQuestionAnswer(
    questionId: string | number,
    selectedAnswer: string,
    childProfileId?: number
  ): Promise<QuestionSubmitResult | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    try {
      const url = `${safeGetApiBaseUrl()}/questions/submit/`;
      const body = JSON.stringify({
        question_id: questionId,
        selected_answer: selectedAnswer,
        child_profile_id: childProfileId,
      });
      let res = await fetch(url, {
        signal: controller.signal,
        method: 'POST',
        headers: {
          ...authService.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body,
      });
      if (res.status === 401) {
        await authService.logout();
        res = await fetch(url, {
          signal: controller.signal,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
        });
      }
      if (res.ok) {
        return (await res.json()) as QuestionSubmitResult;
      }
    } catch {
      // offline / timeout
    } finally {
      clearTimeout(timeoutId);
    }
    return null;
  },

  async syncProgress(progressData: LessonProgressPayload): Promise<boolean> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    try {
      await authService.init();

      const res = await fetch(`${safeGetApiBaseUrl()}/progress/`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(progressData),
        signal: controller.signal,
      });
      if (res.status === 401) {
        await authService.logout();
        return false;
      }
      return res.ok;
    } catch {
      return false;
    } finally {
      clearTimeout(timeoutId);
    }
  },

  async syncGameResult(resultData: GameResultPayload): Promise<boolean> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    try {
      await authService.init();

      const res = await fetch(`${safeGetApiBaseUrl()}/game-results/`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(resultData),
        signal: controller.signal,
      });
      if (res.status === 401) {
        await authService.logout();
        return false;
      }
      return res.ok;
    } catch {
      return false;
    } finally {
      clearTimeout(timeoutId);
    }
  },

  async syncCloudState(syncPayload: CloudSyncPayload): Promise<CloudSyncResponse | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    try {
      await authService.init();

      const res = await fetch(`${safeGetApiBaseUrl()}/sync/`, {
        method: 'POST',
        headers: {
          ...authService.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(syncPayload),
        signal: controller.signal,
      });
      if (res.status === 401) {
        await authService.logout();
        return null;
      }
      if (res.ok) {
        return (await res.json()) as CloudSyncResponse;
      }
    } catch {
      // offline / timeout
    } finally {
      clearTimeout(timeoutId);
    }
    return null;
  },
};
