import { STORIES_DATA } from '../src/data/storiesData';
import { GAME_QUESTIONS } from '../src/data/gamesData';
import { AppLanguage } from '../src/types';

describe('Stories and Quiz Questions Localization and Quality Audit', () => {
  describe('Stories Audit', () => {
    test('Has at least 8 illustrated moral stories available', () => {
      expect(STORIES_DATA.length).toBeGreaterThanOrEqual(8);
    });

    test('All stories contain distinct, authentic titles, morals, and scenes across Gujarati, Hindi, and English', () => {
      for (const story of STORIES_DATA) {
        // IDs and cover
        expect(story.id).toBeTruthy();
        expect(story.coverEmoji).toBeTruthy();
        expect(story.bgColor).toMatch(/^#[0-9A-Fa-f]{6}$/);

        // Titles
        expect(story.titleGu).toBeTruthy();
        expect(story.titleHi).toBeTruthy();
        expect(story.titleEn).toBeTruthy();
        expect(story.titleGu).not.toEqual(story.titleEn);
        expect(story.titleHi).not.toEqual(story.titleEn);

        // Script checks
        expect(/[\u0A80-\u0AFF]/.test(story.titleGu)).toBe(true); // Gujarati script
        expect(/[\u0900-\u097F]/.test(story.titleHi)).toBe(true); // Devanagari script
        expect(/^[A-Za-z0-9\s'".!?\-–—]+$/.test(story.titleEn)).toBe(true); // English

        // Morals
        expect(story.moralGu).toBeTruthy();
        expect(story.moralHi).toBeTruthy();
        expect(story.moralEn).toBeTruthy();
        expect(/[\u0A80-\u0AFF]/.test(story.moralGu)).toBe(true);
        expect(/[\u0900-\u097F]/.test(story.moralHi)).toBe(true);

        // Scenes
        expect(story.scenes.length).toBeGreaterThanOrEqual(4);

        for (const scene of story.scenes) {
          expect(scene.page).toBeGreaterThanOrEqual(1);
          expect(scene.illustration).toBeTruthy();

          expect(scene.textGu).toBeTruthy();
          expect(scene.textHi).toBeTruthy();
          expect(scene.textEn).toBeTruthy();

          // Verify authentic languages
          expect(/[\u0A80-\u0AFF]/.test(scene.textGu)).toBe(true);
          expect(/[\u0900-\u097F]/.test(scene.textHi)).toBe(true);

          if (scene.choice) {
            expect(scene.choice.questionGu).toBeTruthy();
            expect(scene.choice.questionHi).toBeTruthy();
            expect(scene.choice.questionEn).toBeTruthy();
            expect(scene.choice.options.length).toBeGreaterThanOrEqual(2);

            const hasBest = scene.choice.options.some((o) => o.isBest);
            expect(hasBest).toBe(true);

            for (const opt of scene.choice.options) {
              expect(opt.textGu).toBeTruthy();
              expect(opt.textHi).toBeTruthy();
              expect(opt.textEn).toBeTruthy();
              expect(opt.feedbackGu).toBeTruthy();
              expect(opt.feedbackHi).toBeTruthy();
              expect(opt.feedbackEn).toBeTruthy();
            }
          }
        }
      }
    });
  });

  describe('Quiz Questions & Missing Letter Fixes Audit', () => {
    test('Zero occurrences of modern unsupported emoji 🪷 (Lotus) across all questions', () => {
      const allText = JSON.stringify(GAME_QUESTIONS);
      expect(allText).not.toContain('🪷');
    });

    test('ml-gu-1 has universally supported flower visual and correct options', () => {
      const q = GAME_QUESTIONS['missing-letter']['gu'].find((item) => item.id === 'ml-gu-1');
      expect(q).toBeDefined();
      expect(q!.displayVisual).toBe('🌸');
      expect(q!.prompt).toContain('ક _ ળ');
      const correctOpt = q!.options.find((o) => o.id === q!.correctOptionId);
      expect(correctOpt?.label).toBe('મ'); // કમળ
    });

    test('ml-gu-4 is accurately formatted for Dog/Puppy (કૂતરો)', () => {
      const q = GAME_QUESTIONS['missing-letter']['gu'].find((item) => item.id === 'ml-gu-4');
      expect(q).toBeDefined();
      expect(q!.displayVisual).toBe('🐶');
      expect(q!.prompt).toBe('ખૂટતો અક્ષર મૂકો: કૂ _ રો');
      expect(q!.audioText).toBe('કૂતરો શબ્દ પૂરો કરો');
      const correctOpt = q!.options.find((o) => o.id === q!.correctOptionId);
      expect(correctOpt?.label).toBe('ત'); // કૂતરો
    });

    test('ml-gu-7 is accurately formatted for Lion (સિંહ)', () => {
      const q = GAME_QUESTIONS['missing-letter']['gu'].find((item) => item.id === 'ml-gu-7');
      expect(q).toBeDefined();
      expect(q!.displayVisual).toBe('🦁');
      expect(q!.prompt).toBe('ખૂટતો અક્ષર મૂકો: સિં _');
      expect(q!.audioText).toBe('સિંહ શબ્દ પૂરો કરો');
      const correctOpt = q!.options.find((o) => o.id === q!.correctOptionId);
      expect(correctOpt?.label).toBe('હ'); // સિંહ
    });

    test('All missing-letter questions in all 3 languages have valid matching options', () => {
      for (const lang of ['gu', 'hi', 'en'] as AppLanguage[]) {
        const questions = GAME_QUESTIONS['missing-letter'][lang];
        expect(questions.length).toBeGreaterThanOrEqual(10);
        for (const q of questions) {
          expect(q.prompt).toBeTruthy();
          expect(q.audioText).toBeTruthy();
          expect(q.displayVisual).toBeTruthy();
          expect(q.options.length).toBe(4);
          const correct = q.options.find((o) => o.id === q.correctOptionId);
          expect(correct).toBeDefined();
          expect(correct?.label).toBeTruthy();
        }
      }
    });
  });
});

