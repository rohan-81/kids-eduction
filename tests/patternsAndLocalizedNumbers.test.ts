import { formatNumberDigits, toHiDigits, toGujDigits } from '../src/utils/languageData';
import { filterLessonsForClass } from '../src/utils/ageDetailHelper';
import { LESSONS } from '../src/data/lessons';

describe('Numbers Localization & Pattern Category Verification', () => {
  describe('Image 1 Fix: Number Digit Localization in Hindi & Gujarati', () => {
    test('converts numbers to Hindi Devanagari numerals when language is Hindi', () => {
      expect(formatNumberDigits(1, 'hi')).toBe('१');
      expect(formatNumberDigits(2, 'hi')).toBe('२');
      expect(formatNumberDigits(3, 'hi')).toBe('३');
      expect(formatNumberDigits(10, 'hi')).toBe('१०');
      expect(formatNumberDigits(20, 'hi')).toBe('२०');
    });

    test('converts numbers to Gujarati numerals when language is Gujarati', () => {
      expect(formatNumberDigits(1, 'gu')).toBe('૧');
      expect(formatNumberDigits(2, 'gu')).toBe('૨');
      expect(formatNumberDigits(3, 'gu')).toBe('૩');
      expect(formatNumberDigits(10, 'gu')).toBe('૧૦');
    });

    test('retains standard international numerals when language is English', () => {
      expect(formatNumberDigits(1, 'en')).toBe('1');
      expect(formatNumberDigits(2, 'en')).toBe('2');
      expect(formatNumberDigits(10, 'en')).toBe('10');
    });
  });

  describe('Image 2 Fix: Patterns & Sequences (पैटर्न और अनुक्रम) Availability', () => {
    test('ensures filterLessonsForClass retains all pattern lessons in colors-shapes for age 4-6', () => {
      const allColorsShapes = LESSONS.filter((l) => l.categoryId === 'colors-shapes');
      const filtered = filterLessonsForClass(allColorsShapes, '4-6', 'colors-shapes');

      const patternLessons = filtered.filter((l) => l.id.startsWith('cs-pattern'));
      // All 8 cognitive patterns must be available and not sliced away
      expect(patternLessons.length).toBe(8);
      expect(patternLessons.map((l) => l.id)).toEqual([
        'cs-pattern-ab-color',
        'cs-pattern-ab-shape',
        'cs-pattern-abc-triple',
        'cs-pattern-size',
        'cs-pattern-growing',
        'cs-pattern-daynight',
        'cs-pattern-direction',
        'cs-pattern-wave',
      ]);
    });

    test('ensures patterns are also preserved for age 2-4 and 6-8', () => {
      const allColorsShapes = LESSONS.filter((l) => l.categoryId === 'colors-shapes');
      const filtered24 = filterLessonsForClass(allColorsShapes, '2-4', 'colors-shapes');
      const filtered68 = filterLessonsForClass(allColorsShapes, '6-8', 'colors-shapes');

      expect(filtered24.filter((l) => l.id.startsWith('cs-pattern')).length).toBe(8);
      expect(filtered68.filter((l) => l.id.startsWith('cs-pattern')).length).toBe(8);
    });
  });

  describe('Worksheet & Audio Language Consistency', () => {
    test('formats worksheet table headers correctly across languages', () => {
      const getHeader = (tNum: number, lang: 'gu' | 'hi' | 'en') =>
        lang === 'gu'
          ? `${toGujDigits(tNum)} નો ઘડિયો`
          : lang === 'hi'
          ? `${toHiDigits(tNum)} का पहाड़ा`
          : `Table of ${tNum}`;

      expect(getHeader(1, 'hi')).toBe('१ का पहाड़ा');
      expect(getHeader(5, 'hi')).toBe('५ का पहाड़ा');
      expect(getHeader(10, 'hi')).toBe('१० का पहाड़ा');

      expect(getHeader(1, 'gu')).toBe('૧ નો ઘડિયો');
      expect(getHeader(7, 'gu')).toBe('૭ નો ઘડિયો');

      expect(getHeader(1, 'en')).toBe('Table of 1');
    });

    test('formats worksheet formula steps in Indic numerals for Hindi & Gujarati', () => {
      const getFormula = (tNum: number, step: number, lang: 'gu' | 'hi' | 'en') =>
        `${formatNumberDigits(tNum, lang)} × ${formatNumberDigits(step, lang)} =`;

      expect(getFormula(2, 3, 'hi')).toBe('२ × ३ =');
      expect(getFormula(2, 3, 'gu')).toBe('૨ × ૩ =');
      expect(getFormula(2, 3, 'en')).toBe('2 × 3 =');
    });
  });
});

