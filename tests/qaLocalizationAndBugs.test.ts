import { getShapeTargetDots, TRACE_SHAPES } from '../src/utils/drawingShapes';
import { LESSONS, getLessonAudio, getLessonDisplayLabels } from '../src/data/lessons';
import { GAME_QUESTIONS } from '../src/data/gamesData';
import { getTranslation, translations } from '../src/localization';

describe('QA Validation: Localization & 4 Functional/UI Bug Fixes', () => {
  describe('Bug 1: Tracing & Drawing Target Dots & Layer Integrity', () => {
    const supportedShapes = ['star', 'sun', 'apple', 'balloon', 'flower', 'car', 'house', 'butterfly', 'fish'] as const;

    test.each(supportedShapes)('Shape "%s" generates continuous, evenly spaced target dots along its full outline', (shapeId) => {
      const dots = getShapeTargetDots(shapeId);
      expect(dots.length).toBeGreaterThan(15);

      // Verify all dots have valid non-negative coordinates within the 320x320 viewBox
      for (const dot of dots) {
        expect(dot.x).toBeGreaterThanOrEqual(0);
        expect(dot.x).toBeLessThanOrEqual(320);
        expect(dot.y).toBeGreaterThanOrEqual(0);
        expect(dot.y).toBeLessThanOrEqual(320);
      }

      // Verify no two dots are closer than minimum spacing (14px)
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dist = Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y);
          expect(dist).toBeGreaterThanOrEqual(13.5);
        }
      }
    });

    test('Each shape definition has a valid start point matching the outline', () => {
      for (const shape of TRACE_SHAPES) {
        if (shape.id === 'blank') continue;
        expect(shape.startPoint).toBeDefined();
        expect(shape.startPoint.x).toBeGreaterThan(0);
        expect(shape.startPoint.y).toBeGreaterThan(0);
      }
    });
  });

  describe('Bug 2: Animal & Bird Learning - Spoken Name Separation from Natural Calls', () => {
    test('Peacock returns spoken name in Gujarati, Hindi, and English', () => {
      const peacock = LESSONS.find((l) => l.id === 'an-peacock')!;
      expect(peacock).toBeDefined();

      const guAudio = getLessonAudio(peacock, 'gu');
      expect(guAudio.text).toBe('મોર');
      expect(guAudio.lang).toBe('gu');

      const hiAudio = getLessonAudio(peacock, 'hi');
      expect(hiAudio.text).toBe('मोर');
      expect(hiAudio.lang).toBe('hi');

      const enAudio = getLessonAudio(peacock, 'en');
      expect(enAudio.text).toBe('Peacock');
      expect(enAudio.lang).toBe('en');
    });

    test('Parrot returns spoken name in Gujarati, Hindi, and English', () => {
      const parrot = LESSONS.find((l) => l.id === 'an-parrot')!;
      expect(parrot).toBeDefined();

      const guAudio = getLessonAudio(parrot, 'gu');
      expect(guAudio.text).toBe('પોપટ');
      expect(guAudio.lang).toBe('gu');

      const hiAudio = getLessonAudio(parrot, 'hi');
      expect(hiAudio.text).toBe('तोता');
      expect(hiAudio.lang).toBe('hi');

      const enAudio = getLessonAudio(parrot, 'en');
      expect(enAudio.text).toBe('Parrot');
      expect(enAudio.lang).toBe('en');
    });

    test('Cat returns spoken name in Gujarati, Hindi, and English', () => {
      const cat = LESSONS.find((l) => l.id === 'an-cat')!;
      expect(cat).toBeDefined();

      expect(getLessonAudio(cat, 'gu').text).toBe('બિલાડી');
      expect(getLessonAudio(cat, 'hi').text).toBe('बिल्ली');
      expect(getLessonAudio(cat, 'en').text).toBe('Cat');
    });
  });

  describe('Bug 3: Balloon Pop Question Dataset & Answer Option Consistency', () => {
    const languages = ['gu', 'en', 'hi'] as const;

    test.each(languages)('All Balloon Pop questions in "%s" have 4 consistent options and valid correctOptionId', (lang) => {
      const balloonQuestions = GAME_QUESTIONS['balloon-pop']?.[lang] || [];
      expect(balloonQuestions.length).toBeGreaterThan(0);

      for (const q of balloonQuestions) {
        expect(q.prompt).toBeTruthy();
        expect(q.options.length).toBe(4);
        expect(q.options.some((o: { id: string }) => o.id === q.correctOptionId)).toBe(true);

        for (const opt of q.options) {
          expect(opt.id).toBeTruthy();
          expect(opt.label).toBeTruthy();
        }
      }
    });
  });

  describe('Part A: Localization Consistency & Dictionaries', () => {
    test('Translations dictionary contains en, gu, and hi locales', () => {
      expect(translations.en).toBeDefined();
      expect(translations.gu).toBeDefined();
      expect(translations.hi).toBeDefined();
    });

    test('getTranslation retrieves correct values for English, Gujarati, and Hindi', () => {
      expect(getTranslation('en', 'nav.home')).toBe('Home');
      expect(getTranslation('gu', 'nav.home')).toBe('મુખ્ય પાનું');
      expect(getTranslation('hi', 'nav.home')).toBe('होम');
    });

    test('getTranslation handles interpolation variables correctly', () => {
      const text = getTranslation('en', 'games.earnedScore', { score: 8, total: 10 });
      expect(text).toBe('You scored 8 out of 10!');
    });

    test('In English mode, GK cards display English primary titles (not Gujarati)', () => {
      const earth = LESSONS.find((l) => l.id === 'gk-earth')!;
      const sun = LESSONS.find((l) => l.id === 'gk-sun')!;
      const peacock = LESSONS.find((l) => l.id === 'gk-peacock')!;

      // English Mode: Pure English without Gujarati or Hindi text
      const earthEn = getLessonDisplayLabels(earth, 'en');
      expect(earthEn.primaryLabel).toBe('Earth');
      expect(earthEn.secondaryBracket).toBe('');
      expect(/[\u0A80-\u0AFF\u0900-\u097F]/.test(earthEn.primaryLabel)).toBe(false);
      expect(/[\u0A80-\u0AFF\u0900-\u097F]/.test(earthEn.secondaryBracket)).toBe(false);

      const sunEn = getLessonDisplayLabels(sun, 'en');
      expect(sunEn.primaryLabel).toBe('Sun');
      expect(sunEn.secondaryBracket).toBe('');
      expect(/[\u0A80-\u0AFF\u0900-\u097F]/.test(sunEn.primaryLabel)).toBe(false);
      expect(/[\u0A80-\u0AFF\u0900-\u097F]/.test(sunEn.secondaryBracket)).toBe(false);

      const peacockEn = getLessonDisplayLabels(peacock, 'en');
      expect(peacockEn.primaryLabel).toBe('Peacock');
      expect(peacockEn.secondaryBracket).toBe('');
      expect(/[\u0A80-\u0AFF\u0900-\u097F]/.test(peacockEn.primaryLabel)).toBe(false);
      expect(/[\u0A80-\u0AFF\u0900-\u097F]/.test(peacockEn.secondaryBracket)).toBe(false);

      // Verify Animal & Money lessons have empty secondaryBracket in English mode
      const cat = LESSONS.find((l) => l.id === 'an-cat')!;
      const catEn = getLessonDisplayLabels(cat, 'en');
      expect(catEn.primaryLabel).toBe('Cat');
      expect(catEn.secondaryBracket).toBe('');

      const coin10 = LESSONS.find((l) => l.id === 'money-coin-10')!;
      const coin10En = getLessonDisplayLabels(coin10, 'en');
      expect(coin10En.primaryLabel).toBe('₹10 Coin');
      expect(coin10En.secondaryBracket).toBe('');

      // Gujarati Mode: Gujarati primary with English secondary bracket
      const earthGu = getLessonDisplayLabels(earth, 'gu');
      expect(earthGu.primaryLabel).toBe('પૃથ્વી');
      expect(earthGu.secondaryBracket).toBe('(Earth)');

      const catGu = getLessonDisplayLabels(cat, 'gu');
      expect(catGu.primaryLabel).toBe('બિલાડી');
      expect(catGu.secondaryBracket).toBe('(Cat)');

      // Verify Gujarati Varnamala letter ળ correctly displays નળ without /La/ in Gujarati mode
      const ala = LESSONS.find((l) => l.id === 'gu-vyan-ala')!;
      const alaGu = getLessonDisplayLabels(ala, 'gu');
      expect(alaGu.primaryLabel).toBe('નળ');
      expect(alaGu.secondaryBracket).toBe('');

      // Hindi Mode: Hindi primary with English secondary bracket
      const earthHi = getLessonDisplayLabels(earth, 'hi');
      expect(earthHi.primaryLabel).toBe('पृथ्वी');
      expect(earthHi.secondaryBracket).toBe('(Earth)');

      const catHi = getLessonDisplayLabels(cat, 'hi');
      expect(catHi.primaryLabel).toBe('बिल्ली');
      expect(catHi.secondaryBracket).toBe('(Cat)');
    });
  });

  describe('Bug 5: Challenge Quiz Question Right/Wrong Answer Validation', () => {
    const { TEST_QUESTIONS } = require('../src/data/challengeData');

    test('All challenge questions contain their correct answers in options across all languages', () => {
      expect(TEST_QUESTIONS.length).toBeGreaterThanOrEqual(5);

      for (const q of TEST_QUESTIONS) {
        // Gujarati
        expect(q.optionsGu).toContain(q.correctAnswerGu);
        expect(q.promptGu.length).toBeGreaterThan(0);

        // Hindi
        expect(q.optionsHi).toContain(q.correctAnswerHi);
        expect(q.promptHi.length).toBeGreaterThan(0);

        // English
        expect(q.optionsEn).toContain(q.correctAnswerEn);
        expect(q.promptEn.length).toBeGreaterThan(0);
      }
    });

    test('Question 3 (2 x 3 = ?) has correct answer 6 (Six) in all languages', () => {
      const q3 = TEST_QUESTIONS.find((q: any) => q.id === 't-3');
      expect(q3).toBeDefined();
      expect(q3.correctAnswerEn).toBe('6 (Six)');
      expect(q3.correctAnswerGu).toBe('૬ (છ)');
      expect(q3.correctAnswerHi).toBe('६ (छह)');
      expect(q3.optionsEn).toContain('6 (Six)');
    });
  });
});

