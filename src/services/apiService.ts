import AsyncStorage from '@react-native-async-storage/async-storage';
import { LESSONS } from '../data/lessons';
import { CATEGORIES } from '../data/categories';
import { ADVENTURE_LEVELS } from '../data/adventureLevels';
import { COLORING_TEMPLATES } from '../data/coloringTemplates';
import { STORIES_DATA, StoryBook } from '../data/storiesData';
import { GAME_QUESTIONS } from '../data/gamesData';
import { BADGE_DEFINITIONS, BadgeItemDef } from '../data/badgesData';
import { RHYMES_DATA, RhymeItem, mapBackendRhymes, isRetiredRhymeId } from '../data/rhymesData';
import { STICKER_CATALOG, StickerItem, mapBackendStickers } from '../data/stickersData';
import { isImageRef, toAbsoluteImageUrl, withArtVersion } from '../utils/storyArt';
import { LessonItem, AppLanguage, AgeGroup, GameType, GameQuestion } from '../types';
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

/** Maps one row from backend/lessons/serializers.py (LessonSerializer) to the app's LessonItem. */
export function mapBackendLesson(item: any): LessonItem {
  const extra = item.lesson_data || {};
  return {
    id: String(item.stable_id || item.id),
    categoryId: item.category,
    language: item.language,
    ageGroup: item.age_group,
    symbol: item.symbol || item.title?.charAt(0) || '★',
    title: item.title,
    subtitle: item.subtitle,
    phonetic: item.phonetic,
    exampleWord: item.example_word,
    exampleMeaning: item.example_meaning,
    exampleMeaningGu: extra.exampleMeaningGu || item.example_meaning,
    exampleMeaningHi: extra.exampleMeaningHi || item.example_meaning,
    exampleImage: item.example_image || extra.imageUrl,
    imageUrl: item.example_image || extra.imageUrl,
    audioPrompt: item.audio_prompt || item.title,
    audioPromptGu: extra.audioPromptGu || item.audio_prompt,
    audioPromptHi: extra.audioPromptHi,
    audioPromptEn: extra.audioPromptEn,
    subType: extra.subType,
    soundKey: extra.soundKey,
    audioUrl: extra.audioUrl,
    visualColor: item.visual_color,
    tracingPath: item.tracing_path,
    words: item.words,
    rhyme: item.rhyme_text,
    lessonData: extra,
  } as LessonItem;
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
  const merged: any = { ...bundled };
  Object.entries(fresh).forEach(([k, v]) => {
    const empty = v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
    if (!empty) merged[k] = v;
  });
  merged.id = bundled.id;
  return merged as LessonItem;
}

export const apiService = {
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
          headers: authService.getAuthHeaders(),
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
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
    const cacheKey = `${CACHE_KEYS.LESSONS}_${language || 'all'}_${category || 'all'}`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const params = new URLSearchParams();
      if (language) params.append('language', language);
      if (ageGroup && !category) params.append('age_group', ageGroup);
      if (category) params.append('category', category);

      const response = await fetch(`${API_BASE_URL}/lessons/?${params.toString()}`, {
        headers: authService.getAuthHeaders(),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const results = Array.isArray(data) ? data : (data?.results || []);
        if (results.length > 0) {
          const mapped: LessonItem[] = results.map(mapBackendLesson);

          // Cache fresh lessons for offline instant boot
          try {
            await AsyncStorage.setItem(cacheKey, JSON.stringify(mapped));
            await AsyncStorage.setItem(CACHE_KEYS.LESSONS, JSON.stringify(mapped));
          } catch { }

          let filtered = mapped;
          if (ageGroup && category) {
            filtered = filterLessonsForClass(filtered, ageGroup, category);
          }
          return filtered;
        }
      }
    } catch {
      // Backend offline or timeout - proceed to stale cache
    }

    // Try stale AsyncStorage cache
    try {
      const cached = (await AsyncStorage.getItem(cacheKey)) || (await AsyncStorage.getItem(CACHE_KEYS.LESSONS));
      if (cached) {
        const cachedLessons: LessonItem[] = JSON.parse(cached);
        if (Array.isArray(cachedLessons) && cachedLessons.length > 0) {
          let filtered = cachedLessons.filter((lesson) => {
            const matchLang = !language || lesson.language === 'all' || lesson.language === language;
            const matchCat = !category || lesson.categoryId === category;
            const matchAge = category ? true : (!ageGroup || lesson.ageGroup === 'all' || lesson.ageGroup === ageGroup);
            return matchLang && matchAge && matchCat;
          });
          if (ageGroup && category) {
            filtered = filterLessonsForClass(filtered, ageGroup, category);
          }
          return filtered;
        }
      }
    } catch { }

    // Fallback to local bundled lessons
    let filtered = LESSONS.filter((lesson) => {
      const matchLang = !language || lesson.language === 'all' || lesson.language === language;
      const matchCat = !category || lesson.categoryId === category;
      const matchAge = category ? true : (!ageGroup || lesson.ageGroup === 'all' || lesson.ageGroup === ageGroup);
      return matchLang && matchAge && matchCat;
    });
    if (ageGroup && category) {
      filtered = filterLessonsForClass(filtered, ageGroup, category);
    }
    return filtered;
  },

  async fetchCategories(): Promise<any[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${safeGetApiBaseUrl()}/lessons/categories/`, {
        headers: authService.getAuthHeaders(),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const results = Array.isArray(data) ? data : (data?.results || []);
        if (results.length > 0) {
          try {
            await AsyncStorage.setItem(CACHE_KEYS.CATEGORIES, JSON.stringify(results));
          } catch { }
          return results;
        }
      }
    } catch { }

    // Try cache
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.CATEGORIES);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { }

    return CATEGORIES;
  },

  async fetchStories(language?: AppLanguage): Promise<StoryBook[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${safeGetApiBaseUrl()}/stories/`, {
        headers: authService.getAuthHeaders(),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const results = Array.isArray(data) ? data : (data?.results || []);
        if (results.length > 0) {
          const mapped: StoryBook[] = results.map((item: any) => {
            const slug = item.slug || String(item.id);
            // Bundled copy supplies the drawn-scene composition when the backend holds image URLs.
            const bundled = STORIES_DATA.find((s) => s.id === slug);
            const coverIsImage = isImageRef(item.cover_image);
            return {
              id: slug,
              titleGu: item.title_gujarati || item.title,
              titleHi: item.title_hindi || item.title,
              titleEn: item.title,
              coverEmoji: coverIsImage ? bundled?.coverEmoji || '📖' : item.cover_image || bundled?.coverEmoji || '📖',
              coverImage: coverIsImage ? withArtVersion(toAbsoluteImageUrl(item.cover_image, API_BASE_URL)) : undefined,
              bgColor: '#E8F8F5',
              moralGu: item.moral_gujarati || item.moral,
              moralHi: item.moral_hindi || item.moral,
              moralEn: item.moral,
              category: item.category || undefined,
              ageGroup: item.age_group || undefined,
              scenes: (item.scenes || []).map((sc: any) => ({
                page: sc.scene_number,
                image: isImageRef(sc.illustration) ? withArtVersion(toAbsoluteImageUrl(sc.illustration, API_BASE_URL)) : undefined,
                illustration: isImageRef(sc.illustration)
                  ? bundled?.scenes[(sc.scene_number || 1) - 1]?.illustration || bundled?.coverEmoji || '📖'
                  : sc.illustration || '📖',
                textGu: sc.text_gujarati || sc.text_english,
                textHi: sc.text_hindi || sc.text_english,
                textEn: sc.text_english,
                choice: Array.isArray(sc.choices)
                  ? (sc.choices.length > 0 ? sc.choices[0] : undefined)
                  : (sc.choices?.options ? sc.choices : undefined),
              })),
            };
          });

          try {
            await AsyncStorage.setItem(CACHE_KEYS.STORIES, JSON.stringify(mapped));
          } catch { }
          return mapped;
        }
      }
    } catch { }

    // Stale cache
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.STORIES);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { }

    return STORIES_DATA;
  },

  async fetchGameQuestions(
    gameType: GameType,
    language: AppLanguage,
    ageGroup?: AgeGroup
  ): Promise<GameQuestion[]> {
    const cacheKey = `${CACHE_KEYS.GAME_QUESTIONS_PREFIX}${gameType}_${language}_${ageGroup || 'all'}`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const params = new URLSearchParams();
      params.append('question_type', gameType);
      params.append('language', language);
      if (ageGroup) params.append('age_group', ageGroup);

      const res = await fetch(`${API_BASE_URL}/questions/game-questions/?${params.toString()}`, {
        headers: authService.getAuthHeaders(),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const results = Array.isArray(data) ? data : (data?.results || []);
        if (results.length > 0) {
          const mapped: GameQuestion[] = results
            .filter((item: any) => {
              if (!item || !item.question_text) return false;
              if (!Array.isArray(item.options) || item.options.length < (gameType === 'picture-puzzle' ? 1 : 2)) return false;
              return true;
            })
            .map((item: any) => ({
              id: String(item.stable_id || item.id),
              gameType: (item.question_type || gameType) as GameType,
              prompt: item.question_text || '',
              audioText: item.audio_text || item.question_text || '',
              displayVisual: item.display_visual,
              countTarget: item.count_target,
              options: Array.isArray(item.options) ? item.options : [],
              correctOptionId: String(item.correct_option_id || item.correct_answer || '1'),
              ageGroup: item.age_group,
              explanation: item.explanation,
              hint: item.hint,
              image: item.image,
              audio: item.audio,
            }));

          if (mapped.length > 0) {
            try {
              await AsyncStorage.setItem(cacheKey, JSON.stringify(mapped));
            } catch { }
            return mapped;
          }
        } else {
          // Empty 200 response: server explicitly has 0 active questions.
          // Clear stale cache so deactivated content does not reappear.
          try {
            await AsyncStorage.removeItem(cacheKey);
          } catch { }
          return [];
        }
      }
    } catch { }

    // Stale cache (only on network failure)
    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { }

    // Local bundled fallback
    const rawList =
      GAME_QUESTIONS[gameType]?.[language] ||
      GAME_QUESTIONS[gameType]?.en ||
      [];
    return rawList;
  },

  async fetchBadges(language?: AppLanguage): Promise<BadgeItemDef[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${API_BASE_URL}/rewards/badges/`, {
        headers: authService.getAuthHeaders(),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const results = Array.isArray(data) ? data : (data?.results || []);
        if (results.length > 0) {
          const defaultMap = new Map(BADGE_DEFINITIONS.map((b) => [b.id, b]));
          const mapped: BadgeItemDef[] = results.map((item: any) => {
            const def = defaultMap.get(item.slug);
            return {
              id: item.slug,
              emoji: item.icon || def?.emoji || '🏆',
              nameGu: item.name_gu || def?.nameGu || item.title,
              nameHi: item.name_hi || def?.nameHi || item.title,
              nameEn: item.name_en || def?.nameEn || item.title,
              descGu: item.desc_gu || def?.descGu || item.description || '',
              descHi: item.desc_hi || def?.descHi || item.description || '',
              descEn: item.desc_en || def?.descEn || item.description || '',
              reqGu: item.req_gu || def?.reqGu || '',
              reqHi: item.req_hi || def?.reqHi || '',
              reqEn: item.req_en || def?.reqEn || '',
              rewardCoins: item.reward_coins || def?.rewardCoins || 20,
              iconBg: def?.iconBg || '#FEF3C7',
              iconBorder: def?.iconBorder || '#FDE68A',
              checkUnlocked: def?.checkUnlocked || ((p: any) => (p.completedLessons?.length || 0) >= (item.requirement_value || 1)),
              getProgress: def?.getProgress || ((p: any) => ({
                current: Math.min(p.completedLessons?.length || 0, item.requirement_value || 1),
                total: item.requirement_value || 1,
              })),
            };
          });

          try {
            await AsyncStorage.setItem(CACHE_KEYS.BADGES, JSON.stringify(mapped));
          } catch { }
          return mapped;
        }
      }
    } catch { }

    // Stale cache
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.BADGES);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const defaultMap = new Map(BADGE_DEFINITIONS.map((b) => [b.id, b]));
          return parsed.map((item: any) => {
            const def = defaultMap.get(item.id);
            return {
              ...item,
              checkUnlocked: def?.checkUnlocked || ((_p: any) => true),
              getProgress: def?.getProgress || ((_p: any) => ({ current: 1, total: 1 })),
            };
          });
        }
      }
    } catch { }

    return BADGE_DEFINITIONS;
  },

  /**
   * Rhymes for the Rhymes studio, already in UI shape.
   * Order: live backend -> last good backend response (AsyncStorage) -> bundled RHYMES_DATA.
   * Backend rows without lyrics fall back to the bundled rhyme of the same slug, or are skipped.
   */
  async fetchRhymes(): Promise<RhymeItem[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    try {
      const res = await fetch(`${API_BASE_URL}/rhymes/`, {
        headers: authService.getAuthHeaders(),
        signal: controller.signal,
      });
      if (res.ok) {
        const data = await res.json();
        const results = Array.isArray(data) ? data : (data?.results || []);
        const mapped = mapBackendRhymes(results);
        if (mapped.length > 0) {
          try {
            await AsyncStorage.setItem(CACHE_KEYS.RHYMES, JSON.stringify(mapped));
          } catch { }
          return mapped;
        }
      }
    } catch {
    } finally {
      clearTimeout(timeoutId);
    }

    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.RHYMES);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Only trust caches written in the mapped UI shape (older builds cached raw rows).
        if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0]?.lines)) {
          // Caches written before the licensing update may still list withdrawn rhymes.
          const current = parsed.filter((r: any) => !isRetiredRhymeId(r?.id));
          if (current.length > 0) return current;
        }
      }
    } catch { }

    return RHYMES_DATA;
  },

  /**
   * Sticker Album catalogue.
   * Order: live backend (/rewards/stickers/) -> last good response (AsyncStorage) -> bundled STICKER_CATALOG.
   */
  async fetchStickers(): Promise<StickerItem[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    try {
      const res = await fetch(`${API_BASE_URL}/rewards/stickers/`, {
        headers: authService.getAuthHeaders(),
        signal: controller.signal,
      });
      if (res.ok) {
        const data = await res.json();
        const mapped = mapBackendStickers(Array.isArray(data) ? data : data?.results || []);
        if (mapped.length > 0) {
          try {
            await AsyncStorage.setItem(CACHE_KEYS.STICKERS, JSON.stringify(mapped));
          } catch { }
          return mapped;
        }
      }
    } catch {
    } finally {
      clearTimeout(timeoutId);
    }

    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.STICKERS);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.name) return parsed;
      }
    } catch { }

    return STICKER_CATALOG;
  },

  async fetchAdventureLevels(): Promise<any[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${safeGetApiBaseUrl()}/gamification/levels/`, {
        headers: authService.getAuthHeaders(),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const results = Array.isArray(data) ? data : (data?.results || []);
        if (results.length > 0) {
          try {
            await AsyncStorage.setItem(CACHE_KEYS.ADVENTURE, JSON.stringify(results));
          } catch { }
          return results;
        }
      }
    } catch { }

    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.ADVENTURE);
      if (cached) return JSON.parse(cached);
    } catch { }

    return ADVENTURE_LEVELS;
  },

  async fetchColoringTemplates(): Promise<any[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${safeGetApiBaseUrl()}/creative/coloring/`, {
        headers: authService.getAuthHeaders(),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const results = Array.isArray(data) ? data : (data?.results || []);
        if (results.length > 0) {
          try {
            await AsyncStorage.setItem(CACHE_KEYS.COLORING, JSON.stringify(results));
          } catch { }
          return results;
        }
      }
    } catch { }

    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.COLORING);
      if (cached) return JSON.parse(cached);
    } catch { }

    return COLORING_TEMPLATES;
  },

  async submitQuestionAnswer(questionId: string | number, selectedAnswer: string, childProfileId?: number): Promise<any> {
    try {
      const res = await fetch(`${safeGetApiBaseUrl()}/questions/submit/`, {
        method: 'POST',
        headers: {
          ...authService.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question_id: questionId,
          selected_answer: selectedAnswer,
          child_profile_id: childProfileId,
        }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch { }
    return null;
  },

  async syncProgress(progressData: any): Promise<boolean> {
    try {
      await authService.init();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${safeGetApiBaseUrl()}/progress/`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(progressData),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return res.ok;
    } catch {
      return false;
    }
  },

  async syncGameResult(resultData: any): Promise<boolean> {
    try {
      await authService.init();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${safeGetApiBaseUrl()}/game-results/`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(resultData),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return res.ok;
    } catch {
      return false;
    }
  },

  async syncCloudState(syncPayload: any): Promise<any> {
    try {
      await authService.init();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`${safeGetApiBaseUrl()}/sync/`, {
        method: 'POST',
        headers: {
          ...authService.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(syncPayload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        return await res.json();
      }
    } catch { }
    return null;
  },
};
