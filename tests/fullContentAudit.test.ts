import { CATEGORIES } from '../src/data/categories';
import { LESSONS, getLessonAudio, getLessonDisplayLabels } from '../src/data/lessons';
import { GAME_QUESTIONS } from '../src/data/gamesData';
import { TEST_QUESTIONS } from '../src/data/challengeData';

describe('Complete Deep Audit of Educational Content & Classifications', () => {
  test('1. Category Integrity: All categories have valid IDs, non-empty titles, and colors', () => {
    expect(CATEGORIES.length).toBe(41);
    const catIds = new Set<string>();
    for (const cat of CATEGORIES) {
      expect(cat.id).toBeTruthy();
      expect(cat.defaultTitle).toBeTruthy();
      expect(cat.bgColor).toBeTruthy();
      expect(catIds.has(cat.id)).toBeFalsy();
      catIds.add(cat.id);
    }
  });

  test('2. Lesson Mapping: Every lesson in LESSONS belongs to a valid registered CategoryId', () => {
    const validCatIds = new Set(CATEGORIES.map((c) => c.id));
    const lessonIds = new Set<string>();

    for (const lesson of LESSONS) {
      // Unique ID check
      expect(lessonIds.has(lesson.id)).toBeFalsy();
      lessonIds.add(lesson.id);

      // Category belongs to valid CategoryId
      expect(validCatIds.has(lesson.categoryId)).toBeTruthy();

      // Non-empty symbol & title
      expect(lesson.symbol).toBeTruthy();
      expect(lesson.title).toBeTruthy();

      // Audio prompt should be defined
      expect(lesson.audioPrompt).toBeTruthy();
    }
  });

  test('3. Subject & Language Consistency: Lessons have matching localized fields', () => {
    for (const lesson of LESSONS) {
      if (lesson.exampleMeaningGu) {
        expect(lesson.exampleMeaningGu.trim().length).toBeGreaterThan(0);
      }
      if (lesson.exampleMeaningHi) {
        expect(lesson.exampleMeaningHi.trim().length).toBeGreaterThan(0);
      }
      if (lesson.exampleMeaning) {
        expect(lesson.exampleMeaning.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test('4. Games Content Mapping: All game questions have valid options and a matching correct answer', () => {
    const gameTypes = Object.keys(GAME_QUESTIONS) as (keyof typeof GAME_QUESTIONS)[];
    const languages = ['gu', 'hi', 'en'] as const;

    let totalGameQuestionsChecked = 0;

    for (const gType of gameTypes) {
      for (const lang of languages) {
        const questions = GAME_QUESTIONS[gType][lang];
        expect(questions).toBeDefined();
        expect(questions.length).toBeGreaterThanOrEqual(1);

        for (const q of questions) {
          totalGameQuestionsChecked++;
          expect(q.prompt).toBeTruthy();
          if (gType === 'picture-puzzle') {
            expect(q.options.length).toBeGreaterThanOrEqual(1);
          } else {
            expect(q.options.length).toBeGreaterThanOrEqual(2);
          }
          const optionIds = q.options.map((o) => o.id);
          expect(optionIds).toContain(q.correctOptionId);
        }
      }
    }

    expect(totalGameQuestionsChecked).toBeGreaterThan(100);
  });

  test('5. Challenge Questions Pool: All 25 challenge questions are multi-lingual and have matching answers', () => {
    expect(TEST_QUESTIONS.length).toBeGreaterThanOrEqual(25);

    for (const q of TEST_QUESTIONS) {
      expect(q.optionsGu).toContain(q.correctAnswerGu);
      expect(q.optionsHi).toContain(q.correctAnswerHi);
      expect(q.optionsEn).toContain(q.correctAnswerEn);
    }
  });
});
