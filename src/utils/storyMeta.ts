import { StoryBook, StoryScene } from '../data/storiesData';
import { AppLanguage } from '../types';
import { KidTone } from '../theme/kidTheme';

/**
 * Story catalogue metadata derived from real story content (never placeholder values).
 */

function sceneText(scene: StoryScene, lang: AppLanguage): string {
  if (lang === 'en') return scene.textEn || '';
  if (lang === 'hi') return scene.textHi || scene.textGu || '';
  return scene.textGu || scene.textEn || '';
}

function wordCount(text: string): number {
  // Explicit script ranges (Latin, Devanagari, Gujarati) instead of \p{L}, which Hermes may not support.
  return text.split(/\s+/).filter((w) => /[A-Za-z0-9ऀ-ॿ઀-૿]/.test(w)).length;
}

/** Narrated reading pace for young listeners (words per minute), incl. page turns. */
const KID_NARRATION_WPM = 70;

/** Minutes to read the whole story aloud, rounded up, at least 1. */
export function getStoryReadingMinutes(story: StoryBook, lang: AppLanguage): number {
  const words = story.scenes.reduce((n, sc) => n + wordCount(sceneText(sc, lang)), 0);
  return Math.max(1, Math.ceil(words / KID_NARRATION_WPM));
}

/** 1-3 difficulty stars from average words per page, plus one for branching choices. */
export function getStoryDifficulty(story: StoryBook, lang: AppLanguage = 'en'): 1 | 2 | 3 {
  if (story.scenes.length === 0) return 1;
  const avg = story.scenes.reduce((n, sc) => n + wordCount(sceneText(sc, lang)), 0) / story.scenes.length;
  const hasChoices = story.scenes.some((sc) => sc.choice && Array.isArray(sc.choice.options) && sc.choice.options.length > 0);
  let level = avg <= 18 ? 1 : avg <= 30 ? 2 : 3;
  if (hasChoices && level < 3) level += 1;
  return level as 1 | 2 | 3;
}

const CATEGORY_META: Record<string, { icon: string; tone: KidTone; label: Record<AppLanguage, string> }> = {
  moral: { icon: '✨', tone: 'lavender', label: { en: 'Moral Tale', gu: 'બોધ કથા', hi: 'नैतिक कथा' } },
  animals: { icon: '🐾', tone: 'mint', label: { en: 'Cute Animals', gu: 'પ્રાણીઓ', hi: 'जानवर' } },
  wisdom: { icon: '🌟', tone: 'sun', label: { en: 'Wisdom', gu: 'જ્ઞાન', hi: 'ज्ञान' } },
  adventure: { icon: '🌟', tone: 'sun', label: { en: 'Adventure', gu: 'સાહસ', hi: 'रोमांच' } },
  fairy: { icon: '🧚', tone: 'coral', label: { en: 'Fairy Tales', gu: 'પરીકથા', hi: 'परी कथा' } },
  folk: { icon: '🪔', tone: 'sun', label: { en: 'Folk Tales', gu: 'લોકકથા', hi: 'लोक कथा' } },
  science: { icon: '🔬', tone: 'sky', label: { en: 'Science', gu: 'વિજ્ઞાન', hi: 'विज्ञान' } },
};

/** Badge for a backend Story.category; unknown categories get a generic badge. */
export function getStoryCategoryMeta(category: string | undefined, lang: AppLanguage): { icon: string; label: string; tone: KidTone } {
  const key = (category || 'moral').toLowerCase();
  const meta = CATEGORY_META[key];
  if (!meta) return { icon: '✨', label: key.charAt(0).toUpperCase() + key.slice(1), tone: 'sky' };
  return { icon: meta.icon, label: meta.label[lang] || meta.label.en, tone: meta.tone };
}
