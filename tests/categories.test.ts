import { CATEGORIES } from '../src/data/categories';
import { LESSONS } from '../src/data/lessons';
import { GAME_QUESTIONS } from '../src/data/gamesData';
import { getTranslation } from '../src/localization';

describe('KidsZone Educational Content & Data Tests', () => {
  test('should have 41 categories defined', () => {
    expect(CATEGORIES.length).toBe(41);
  });

  test('should have valid titles and themes for all categories', () => {
    CATEGORIES.forEach((cat) => {
      expect(cat.id).toBeDefined();
      expect(cat.defaultTitle).toBeTruthy();
      expect(cat.bgColor).toBeTruthy();
    });
  });

  test('should contain authentic Gujarati, English, and Hindi lessons', () => {
    const guLessons = LESSONS.filter((l) => l.language === 'gu');
    const enLessons = LESSONS.filter((l) => l.language === 'en');
    const hiLessons = LESSONS.filter((l) => l.language === 'hi');

    expect(guLessons.length).toBeGreaterThan(0);
    expect(enLessons.length).toBeGreaterThan(0);
    expect(hiLessons.length).toBeGreaterThan(0);

    // Verify Gujarati swar and vyanjan presence
    const ka = guLessons.find((l) => l.symbol === 'ક');
    expect(ka).toBeDefined();
    expect(ka?.exampleWord).toBe('કમળ');

    // Verify English letter A
    const a = enLessons.find((l) => l.symbol === 'A');
    expect(a).toBeDefined();
    expect(a?.exampleWord).toBe('Apple');

    // Verify Hindi swar
    const anar = hiLessons.find((l) => l.symbol === 'अ');
    expect(anar).toBeDefined();
    expect(anar?.exampleWord).toBe('अनार');
  });

  test('should provide valid questions for all educational game modes', () => {
    const gameTypes = [
      'find-letter',
      'picture-matching',
      'counting',
      'memory-match',
      'missing-letter',
      'colors-shapes',
      'listen-choose',
      'picture-puzzle',
      'find-object',
    ] as const;

    gameTypes.forEach((type) => {
      expect(GAME_QUESTIONS[type]).toBeDefined();
      expect(GAME_QUESTIONS[type].en.length).toBeGreaterThan(0);
      expect(GAME_QUESTIONS[type].gu.length).toBeGreaterThan(0);
      expect(GAME_QUESTIONS[type].hi.length).toBeGreaterThan(0);
    });
  });

  test('localization helper resolves Gujarati, Hindi, and English correctly', () => {
    expect(getTranslation('en', 'appName')).toBe('KidsZone');
    expect(getTranslation('gu', 'appName')).toBe('KidsZone');
    expect(getTranslation('hi', 'appName')).toBe('KidsZone');

    expect(getTranslation('gu', 'tagline')).toBe('શીખો, રમો અને આગળ વધો');
    expect(getTranslation('hi', 'tagline')).toBe('सीखें, खेलें और आगे बढ़ें');
    expect(getTranslation('en', 'tagline')).toBe('Learn, Play & Grow');
  });

  test('phonics and animal sound helpers resolve authentic trilingual data', () => {
    const { ENGLISH_PHONICS, ANIMAL_SOUNDS_DATA, getAnimalSoundInfo, getPhonicsPrompt } = require('../src/utils/phonicsData');
    expect(Object.keys(ENGLISH_PHONICS).length).toBe(26);
    expect(ENGLISH_PHONICS.A.phoneme).toBe('/æ/');
    expect(ENGLISH_PHONICS.A.wordGu).toBe('સફરજન');
    expect(ENGLISH_PHONICS.A.wordHi).toBe('सेब');

    const lion = getAnimalSoundInfo('lion king');
    expect(lion).toBeDefined();
    expect(lion?.nameGu).toBe('સિંહ');
    expect(lion?.nameHi).toBe('शेर');
    expect(lion?.onomatopoeiaGu).toBe('ગર્ર્ર્ર!');

    const cow = getAnimalSoundInfo('ગાય');
    expect(cow).toBeDefined();
    expect(cow?.soundKey).toBe('cow');

    const phonicsA = getPhonicsPrompt('A', 'gu');
    expect(phonicsA).toBeDefined();
    expect(phonicsA?.phoneme).toBe('/æ/');
  });

  test('English ABCD alphabet & phonics both contain all 26 letters (A to Z) completely', () => {
    const phonicsLessons = LESSONS.filter((l) => l.categoryId === 'en-phonics');
    const alphabetLessons = LESSONS.filter((l) => l.categoryId === 'en-alphabet');

    // Exactly 26 letters in English alphabet!
    expect(phonicsLessons.length).toBe(26);
    expect(alphabetLessons.length).toBe(26);

    const expectedLetters = [
      'Aa', 'Bb', 'Cc', 'Dd', 'Ee', 'Ff', 'Gg', 'Hh', 'Ii', 'Jj',
      'Kk', 'Ll', 'Mm', 'Nn', 'Oo', 'Pp', 'Qq', 'Rr', 'Ss', 'Tt',
      'Uu', 'Vv', 'Ww', 'Xx', 'Yy', 'Zz',
    ];

    expectedLetters.forEach((pair, idx) => {
      expect(phonicsLessons[idx].symbol).toBe(pair);
    });

    const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    uppercaseLetters.forEach((ch, idx) => {
      expect(alphabetLessons[idx].symbol).toBe(ch);
    });
  });

  test('Class curriculum data matches all class poster claims', () => {
    // 1. Class 2-4 (Nursery): Numbers 1-10, Varnamala, Alphabet, Animals, Colors
    const nurseryNumbers = LESSONS.filter((l) => {
      if (l.categoryId !== 'numbers') return false;
      const m = l.id.match(/^num-(\d+)$/);
      return m ? parseInt(m[1], 10) <= 10 : false;
    });
    expect(nurseryNumbers.length).toBe(10);

    const guVarnamala = LESSONS.filter((l) => l.categoryId === 'gu-varnamala');
    expect(guVarnamala.length).toBeGreaterThan(30);

    const animals = LESSONS.filter((l) => l.categoryId === 'animals');
    expect(animals.length).toBeGreaterThan(15);

    // 2. Class 4-6 (Class 1-2): Tables 1-5, Phonics, Barakhadi, Math
    const tables1to5 = LESSONS.filter(
      (l) => l.categoryId === 'ghadiya' && [1, 2, 3, 4, 5].includes(parseInt(l.id.split('-')[1], 10))
    );
    expect(tables1to5.length).toBe(50); // 5 tables * 10 rows

    const mathLessons = LESSONS.filter((l) => l.categoryId === 'math');
    expect(mathLessons.length).toBeGreaterThan(10);

    // 3. Class 6-8 (Class 3-5): Tables 6-10, Multiplication and Division
    const tables6to10 = LESSONS.filter(
      (l) => l.categoryId === 'ghadiya' && [6, 7, 8, 9, 10].includes(parseInt(l.id.split('-')[1], 10))
    );
    expect(tables6to10.length).toBe(50); // 5 tables * 10 rows

    // Multiplication & Division lessons with full trilingual audio prompts
    const mulLessons = LESSONS.filter((l) => l.categoryId === 'math' && l.id.startsWith('math-mul-'));
    expect(mulLessons.length).toBeGreaterThanOrEqual(6);

    const divLessons = LESSONS.filter((l) => l.categoryId === 'math' && l.id.startsWith('math-div-'));
    expect(divLessons.length).toBeGreaterThanOrEqual(8);

    mulLessons.forEach((l) => {
      expect(l.audioPromptGu).toBeTruthy();
      expect(l.audioPromptHi).toBeTruthy();
      expect(l.audioPromptEn).toBeTruthy();
    });
    divLessons.forEach((l) => {
      expect(l.audioPromptGu).toBeTruthy();
      expect(l.audioPromptHi).toBeTruthy();
      expect(l.audioPromptEn).toBeTruthy();
    });
  });

  test('All Subjects data includes dedicated Math Tables, Varnamala, Science and valid routes', () => {
    // Verify ghadiya is registered as a first-class subject category
    const ghadiyaCat = CATEGORIES.find((c) => c.id === 'ghadiya');
    expect(ghadiyaCat).toBeDefined();
    expect(ghadiyaCat?.defaultTitle).toContain('Ghadiya');

    // Verify GK category has rich lessons (Solar system, India symbols, seasons)
    const gkLessons = LESSONS.filter((l) => l.categoryId === 'gk');
    expect(gkLessons.length).toBeGreaterThanOrEqual(15);

    // Verify Science / Eco garden, Math, Animals, Fruits
    const animalsLessons = LESSONS.filter((l) => l.categoryId === 'animals');
    expect(animalsLessons.length).toBeGreaterThanOrEqual(20);

    const fruitsLessons = LESSONS.filter((l) => l.categoryId === 'fruits');
    expect(fruitsLessons.length).toBeGreaterThanOrEqual(10);
  });
});

