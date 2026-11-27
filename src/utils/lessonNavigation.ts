import { LessonItem } from '../types';

export const VOWEL_LESSON_IDS = [
  'en-alpha-a',
  'en-alpha-e',
  'en-alpha-i',
  'en-alpha-o',
  'en-alpha-u',
] as const;

export const BIRD_LESSON_IDS = [
  'an-peacock',
  'an-parrot',
  'an-sparrow',
  'an-duck',
  'an-pigeon',
  'an-rooster',
  'an-crow',
  'an-koel',
  'an-owl',
  'an-eagle',
  'an-swan',
  'an-flamingo',
  'an-crane',
  'an-woodpecker',
  'an-kingfisher',
  'an-penguin',
  'an-ostrich',
  'an-vulture',
] as const;

const VOWEL_ID_SET = new Set<string>(VOWEL_LESSON_IDS);
const BIRD_ID_SET = new Set<string>(BIRD_LESSON_IDS);

export function isVowelLesson(lesson: LessonItem): boolean {
  return VOWEL_ID_SET.has(lesson.id);
}

export function isBirdLesson(lesson: LessonItem): boolean {
  return lesson.subType === 'bird' || BIRD_ID_SET.has(lesson.id);
}

export function getMathOperationKey(lessonId: string): string | null {
  const match = lessonId.match(/^math-(add|sub|mul|div|frac|meas|dec)(?:-|$)/);
  return match ? match[1] : null;
}

export function getNumberRangeScope(lesson: LessonItem): '1-20' | '21-50' | '51-100' {
  const match = lesson.id.match(/^num-(\d+)$/);
  const n = match ? parseInt(match[1], 10) : lesson.countItems || 0;
  if (n >= 51) return '51-100';
  if (n >= 21) return '21-50';
  return '1-20';
}

export function getGhadiyaTableNumber(lessonId: string): string | null {
  const match = lessonId.match(/^ghadiya-(\d+)-/);
  return match ? match[1] : null;
}

/**
 * Resolve which sibling list Prev/Next inside LessonDetailScreen should traverse.
 *
 * - If `scope === 'all'`, keep the full category list (e.g. child opened from the "All" tab).
 * - If an explicit sub-tab/operation `scope` is passed (e.g. `'sub'`, `'swar'`, `'birds'`, `'21-50'`, `'consonants'`),
 *   filter strictly to that sub-group.
 * - If no `scope` is passed (direct link / web URL reload like `/lessons/math-sub-1`), keep the list scoped
 *   to the lesson's natural sub-group so the first item of a topic (e.g. `math-sub-1`, `gu-swar-1`, `hi-swar-a`,
 *   `ghadiya-2-1`, `num-21`, `an-peacock`) never displays a misleading `Prev` button pointing into another section.
 */
export function filterLessonSiblings(
  lessons: LessonItem[],
  currentLesson: LessonItem | null | undefined,
  scope?: string
): LessonItem[] {
  if (!currentLesson || lessons.length === 0) return lessons;

  const categoryId = currentLesson.categoryId;

  if (categoryId === 'ghadiya') {
    const tableNum = getGhadiyaTableNumber(currentLesson.id);
    if (tableNum) {
      const scoped = lessons.filter((l) => getGhadiyaTableNumber(l.id) === tableNum);
      if (scoped.length > 0) return scoped;
    }
    return lessons;
  }

  if (scope === 'all') {
    return lessons;
  }

  if (categoryId === 'math') {
    const opKey =
      scope && ['add', 'sub', 'mul', 'div', 'frac', 'meas', 'dec'].includes(scope)
        ? scope
        : getMathOperationKey(currentLesson.id);
    if (opKey) {
      const prefix = `math-${opKey}`;
      const scoped = lessons.filter((l) => l.id.startsWith(prefix));
      if (scoped.length > 0) return scoped;
    }
    return lessons;
  }

  if (categoryId === 'gu-varnamala') {
    const targetPrefix =
      scope === 'swar'
        ? 'gu-swar'
        : scope === 'vyanjan'
          ? 'gu-vyan'
          : currentLesson.id.startsWith('gu-swar')
            ? 'gu-swar'
            : currentLesson.id.startsWith('gu-vyan')
              ? 'gu-vyan'
              : null;
    if (targetPrefix) {
      const scoped = lessons.filter((l) => l.id.startsWith(targetPrefix));
      if (scoped.length > 0) return scoped;
    }
    return lessons;
  }

  if (categoryId === 'hi-varnamala') {
    const targetPrefix =
      scope === 'swar'
        ? 'hi-swar'
        : scope === 'vyanjan'
          ? 'hi-vyan'
          : currentLesson.id.startsWith('hi-swar')
            ? 'hi-swar'
            : currentLesson.id.startsWith('hi-vyan')
              ? 'hi-vyan'
              : null;
    if (targetPrefix) {
      const scoped = lessons.filter((l) => l.id.startsWith(targetPrefix));
      if (scoped.length > 0) return scoped;
    }
    return lessons;
  }

  if (categoryId === 'en-alphabet') {
    if (scope === 'vowels') {
      const scoped = lessons.filter(isVowelLesson);
      if (scoped.length > 0) return scoped;
    }
    if (scope === 'consonants') {
      const scoped = lessons.filter((l) => !isVowelLesson(l));
      if (scoped.length > 0) return scoped;
    }
    return lessons;
  }

  if (categoryId === 'animals') {
    const wantBird =
      scope === 'birds'
        ? true
        : scope === 'animals'
          ? false
          : isBirdLesson(currentLesson);
    const scoped = lessons.filter((l) => isBirdLesson(l) === wantBird);
    if (scoped.length > 0) return scoped;
    return lessons;
  }

  if (categoryId === 'numbers') {
    const targetRange =
      scope === '1-20' || scope === '21-50' || scope === '51-100'
        ? scope
        : getNumberRangeScope(currentLesson);
    const scoped = lessons.filter((l) => getNumberRangeScope(l) === targetRange);
    if (scoped.length > 0) return scoped;
    return lessons;
  }

  return lessons;
}

