import * as fs from 'fs';
import * as path from 'path';
import { LESSONS, getLessonDisplayLabels } from '../src/data/lessons';
import { filterLessonSiblings } from '../src/utils/lessonNavigation';

const readNormalized = (rel: string) =>
  fs.readFileSync(path.join(__dirname, '..', rel), 'utf8').replace(/\r\n/g, '\n');

describe('First-item Prev suppression & Lesson sibling scoping', () => {
  test('math-sub-1 has no previous sibling with or without explicit sub scope', () => {
    const mathLessons = LESSONS.filter((l) => l.categoryId === 'math');
    const firstSub = mathLessons.find((l) => l.id === 'math-sub-1');
    expect(firstSub).toBeDefined();

    const directScoped = filterLessonSiblings(mathLessons, firstSub);
    expect(directScoped[0].id).toBe('math-sub-1');
    expect(directScoped.every((l) => l.id.startsWith('math-sub'))).toBe(true);

    const tabScoped = filterLessonSiblings(mathLessons, firstSub, 'sub');
    expect(tabScoped[0].id).toBe('math-sub-1');
  });

  test('an-cat (Animals tab) & an-peacock (Birds tab) start at index 0 with no previous sibling', () => {
    const animalLessons = LESSONS.filter((l) => l.categoryId === 'animals');
    const cat = animalLessons.find((l) => l.id === 'an-cat');
    const peacock = animalLessons.find((l) => l.id === 'an-peacock');
    expect(cat).toBeDefined();
    expect(peacock).toBeDefined();

    const animalsOnly = filterLessonSiblings(animalLessons, cat, 'animals');
    expect(animalsOnly.findIndex((l) => l.id === 'an-cat')).toBe(0);

    const birdsOnly = filterLessonSiblings(animalLessons, peacock, 'birds');
    expect(birdsOnly.findIndex((l) => l.id === 'an-peacock')).toBe(0);

    const directCat = filterLessonSiblings(animalLessons, cat);
    expect(directCat.findIndex((l) => l.id === 'an-cat')).toBe(0);
  });

  test('gu-swar-1, hi-swar-a, num-21, num-51, ghadiya-2-1, and Consonants start at index 0 in their groups', () => {
    const gu = LESSONS.filter((l) => l.categoryId === 'gu-varnamala');
    const guSwarFirst = gu.find((l) => l.id.startsWith('gu-swar'));
    expect(guSwarFirst).toBeDefined();
    expect(filterLessonSiblings(gu, guSwarFirst).findIndex((l) => l.id === guSwarFirst?.id)).toBe(0);

    const hi = LESSONS.filter((l) => l.categoryId === 'hi-varnamala');
    const hiSwarFirst = hi.find((l) => l.id.startsWith('hi-swar'));
    expect(hiSwarFirst).toBeDefined();
    expect(filterLessonSiblings(hi, hiSwarFirst).findIndex((l) => l.id === hiSwarFirst?.id)).toBe(0);

    const nums = LESSONS.filter((l) => l.categoryId === 'numbers');
    const num21 = nums.find((l) => l.id === 'num-21');
    const num51 = nums.find((l) => l.id === 'num-51');
    expect(num21).toBeDefined();
    expect(num51).toBeDefined();
    expect(filterLessonSiblings(nums, num21, '21-50')[0].id).toBe('num-21');
    expect(filterLessonSiblings(nums, num51, '51-100')[0].id).toBe('num-51');

    const ghadiya = LESSONS.filter((l) => l.categoryId === 'ghadiya');
    const g21 = ghadiya.find((l) => l.id === 'ghadiya-2-1');
    expect(g21).toBeDefined();
    expect(filterLessonSiblings(ghadiya, g21)[0].id).toBe('ghadiya-2-1');

    const enAlpha = LESSONS.filter((l) => l.categoryId === 'en-alphabet');
    const enB = enAlpha.find((l) => l.id === 'en-alpha-b');
    expect(enB).toBeDefined();
    expect(filterLessonSiblings(enAlpha, enB, 'consonants')[0].id).toBe('en-alpha-b');
  });

  test('Stories page 1 & Rhymes line 0 do not render Prev buttons on initial item', () => {
    const storiesSrc = readNormalized('app/stories.tsx');
    expect(storiesSrc).toContain('currentPage > 1 ? (');
    expect(storiesSrc).not.toContain('disabled={currentPage <= 1}');

    const rhymesSrc = readNormalized('app/rhymes.tsx');
    expect(rhymesSrc).toContain('currentLineIndex > 0 ? (');
  });

  test('Lesson detail screen completes current lesson on Next and applies narrow responsive layout', () => {
    const detailSrc = readNormalized('app/lessons/[id].tsx');
    expect(detailSrc).toContain('completeLesson(currentLesson.id)');
    expect(detailSrc).toContain('useWindowDimensions');
    expect(detailSrc).toContain('styles.funFactCardNarrow');
    expect(detailSrc).toContain("flexWrap: 'wrap'");
  });

  test('Word problem labels localize concisely without clipped English equations in headers or cards', () => {
    const probApple = LESSONS.find((l) => l.id === 'prob-apple-add')!;
    expect(probApple).toBeDefined();

    const gu = getLessonDisplayLabels(probApple, 'gu');
    expect(gu.primaryLabel).toBe('સફરજનનો કોયડો');
    expect(gu.secondaryBracket).toBe('(૩ + ૨ = ૫)');

    const hi = getLessonDisplayLabels(probApple, 'hi');
    expect(hi.primaryLabel).toBe('सेब का सवाल');
    expect(hi.secondaryBracket).toBe('(३ + २ = ५)');

    const indexSrc = readNormalized('app/lessons/index.tsx');
    expect(indexSrc).toContain('cardSecondaryTitle} numberOfLines={2} ellipsizeMode="tail"');

    const detailSrc = readNormalized('app/lessons/[id].tsx');
    expect(detailSrc).toContain("currentLesson.categoryId === 'math-word-problems'");
  });
});

