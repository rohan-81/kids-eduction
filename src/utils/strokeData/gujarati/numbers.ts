import { CharacterStrokeDefinition } from '../types';
import { sampleCurve, sampleLine, makeLoop, createStroke } from '../strokeSampler';

/**
 * Authentic Gujarati Numerals (૦ to ૯) with correct handwriting stroke geometry and directions.
 */
export const GUJARATI_NUMBERS: Record<string, CharacterStrokeDefinition> = {
  // ૦ (Zero): Smooth oval loop drawn counter-clockwise from the top
  '૦': {
    character: '૦',
    language: 'gu',
    category: 'number',
    strokes: [
      createStroke(
        'gu_num_0_s1',
        1,
        makeLoop(50, 52, 20, 26, -Math.PI / 2, Math.PI * 2, 28),
        'counter_clockwise',
        'Oval loop starting from top'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Shoonya', transliteration: '0' },
  },

  // ૧ (One): Natural Gujarati 1 matching official printed glyph - round circular loop and straight vertical stem with rightward bottom flick
  '૧': {
    character: '૧',
    language: 'gu',
    category: 'number',
    strokes: [
      createStroke(
        'gu_num_1_s1',
        1,
        sampleCurve([
          { x: 46, y: 42 },
          { x: 36, y: 40 },
          { x: 31, y: 32 },
          { x: 35, y: 23 },
          { x: 46, y: 21 },
          { x: 56, y: 25 },
          { x: 58, y: 35 },
          { x: 56, y: 44 },
          { x: 56, y: 56 },
          { x: 56, y: 70 },
          { x: 56, y: 78 },
          { x: 60, y: 84 },
          { x: 68, y: 84 },
        ], 16),
        'forward',
        'Top circular loop into straight vertical stem with rightward bottom flick'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Ek', transliteration: '1' },
  },

  // ૨ (Two): Top rounded arch sweeping into a tight left rounded loop and steep downward-right tail
  '૨': {
    character: '૨',
    language: 'gu',
    category: 'number',
    strokes: [
      createStroke(
        'gu_num_2_s1',
        1,
        sampleCurve([
          { x: 37, y: 28 },
          { x: 48, y: 24 },
          { x: 61, y: 30 },
          { x: 65, y: 42 },
          { x: 58, y: 54 },
          { x: 43, y: 58 },
          { x: 35, y: 55 },
          { x: 36, y: 50 },
          { x: 42, y: 52 },
          { x: 48, y: 61 },
          { x: 54, y: 71 },
          { x: 59, y: 80 },
        ], 14),
        'forward',
        'Top rounded arch sweeping into a left round loop and steep downward-right tail'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Bé', transliteration: '2' },
  },

  // ૩ (Three): Upper arch, middle notch, lower arch
  '૩': {
    character: '૩',
    language: 'gu',
    category: 'number',
    strokes: [
      createStroke(
        'gu_num_3_s1',
        1,
        sampleCurve([
          { x: 34, y: 34 },
          { x: 52, y: 26 },
          { x: 68, y: 34 },
          { x: 52, y: 48 },
          { x: 44, y: 52 },
          { x: 58, y: 54 },
          { x: 72, y: 64 },
          { x: 68, y: 78 },
          { x: 50, y: 86 },
          { x: 34, y: 80 },
        ]),
        'forward',
        'Double arch with inward middle notch'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Tran', transliteration: '3' },
  },

  // ૪ (Four): Authentic Gujarati ૪ - straight diagonal V-arms crossing smoothly into a teardrop bottom loop
  '૪': {
    character: '૪',
    language: 'gu',
    category: 'number',
    strokes: [
      createStroke(
        'gu_num_4_s1',
        1,
        sampleCurve([
          { x: 31, y: 27 },
          { x: 41, y: 36 },
          { x: 50, y: 45 },
          { x: 59, y: 55 },
          { x: 62, y: 66 },
          { x: 57, y: 75 },
          { x: 50, y: 77 },
          { x: 43, y: 75 },
          { x: 38, y: 66 },
          { x: 41, y: 55 },
          { x: 50, y: 45 },
          { x: 59, y: 36 },
          { x: 69, y: 27 },
        ], 16),
        'forward',
        'Top-left straight diagonal arm crossing through center into teardrop bottom loop and rising diagonally top-right'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Chaar', transliteration: '4' },
  },

  // ૫ (Five): Authentic Gujarati ૫ - single continuous stroke with top-left lip, rounded U-cup, clean vertical stem, and rightward foot
  '૫': {
    character: '૫',
    language: 'gu',
    category: 'number',
    strokes: [
      createStroke(
        'gu_num_5_s1',
        1,
        sampleCurve([
          { x: 28, y: 28 },
          { x: 35, y: 30 },
          { x: 36, y: 42 },
          { x: 38, y: 56 },
          { x: 46, y: 63 },
          { x: 56, y: 60 },
          { x: 63, y: 50 },
          { x: 63, y: 38 },
          { x: 63, y: 27 },
          { x: 63, y: 46 },
          { x: 63, y: 68 },
          { x: 66, y: 78 },
          { x: 73, y: 80 },
        ], 16),
        'forward',
        'Top-left curved lip, U-cup ascending to top stem crest, and vertical stem with bottom-right foot'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Paanch', transliteration: '5' },
  },

  // ૬ (Six): Authentic Gujarati ૬ matching official glyph - upper 'C' curve, middle horizontal shelf, diagonal descent, and open lower curve
  '૬': {
    character: '૬',
    language: 'gu',
    category: 'number',
    strokes: [
      createStroke(
        'gu_num_6_s1',
        1,
        sampleCurve([
          { x: 62, y: 22 },
          { x: 46, y: 19 },
          { x: 33, y: 27 },
          { x: 30, y: 38 },
          { x: 38, y: 45 },
          { x: 54, y: 47 },
          { x: 64, y: 47 },
          { x: 50, y: 50 },
          { x: 38, y: 56 },
          { x: 48, y: 67 },
          { x: 63, y: 74 },
          { x: 63, y: 82 },
          { x: 54, y: 88 },
          { x: 42, y: 88 },
          { x: 32, y: 82 },
          { x: 28, y: 74 },
        ], 18),
        'forward',
        'Upper arch into center shelf, swooping down-right and rounding along bottom with leftward terminal'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Chha', transliteration: '6' },
  },

  // ૭ (Seven): Authentic Gujarati ૭ - top-right loop, descending right stem, and bottom U-bowl rising on left
  '૭': {
    character: '૭',
    language: 'gu',
    category: 'number',
    strokes: [
      createStroke(
        'gu_num_7_s1',
        1,
        sampleCurve([
          { x: 56, y: 22 },
          { x: 48, y: 26 },
          { x: 46, y: 36 },
          { x: 54, y: 42 },
          { x: 62, y: 36 },
          { x: 60, y: 26 },
          { x: 56, y: 22 },
          { x: 62, y: 52 },
          { x: 62, y: 68 },
          { x: 60, y: 78 },
          { x: 50, y: 88 },
          { x: 38, y: 88 },
          { x: 28, y: 80 },
          { x: 24, y: 68 },
          { x: 24, y: 54 },
        ], 20),
        'forward',
        'Top-right loop descending down right stem and curving around bottom into left arm'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Saat', transliteration: '7' },
  },

  // ૮ (Eight): Authentic Gujarati ૮ - diagonal slant down from top-right, curving around bottom into right tail
  '૮': {
    character: '૮',
    language: 'gu',
    category: 'number',
    strokes: [
      createStroke(
        'gu_num_8_s1',
        1,
        sampleCurve([
          { x: 66, y: 24 },
          { x: 56, y: 36 },
          { x: 46, y: 50 },
          { x: 36, y: 64 },
          { x: 38, y: 76 },
          { x: 48, y: 82 },
          { x: 60, y: 80 },
          { x: 72, y: 74 },
        ], 14),
        'forward',
        'Slanted crescent stroke starting top-right and rounding along bottom'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Aath', transliteration: '8' },
  },

  // ૯ (Nine): Authentic Gujarati ૯ - curved C-arc with detached tilted inner dash
  '૯': {
    character: '૯',
    language: 'gu',
    category: 'number',
    strokes: [
      createStroke(
        'gu_num_9_s1',
        1,
        sampleCurve([
          { x: 56, y: 28 },
          { x: 44, y: 32 },
          { x: 35, y: 42 },
          { x: 33, y: 55 },
          { x: 39, y: 68 },
          { x: 52, y: 74 },
          { x: 67, y: 72 },
        ], 18),
        'forward',
        'Smooth curved C-arc from top-right to bottom-right'
      ),
      createStroke(
        'gu_num_9_s2',
        2,
        sampleLine({ x: 51, y: 53 }, { x: 66, y: 48 }, 12),
        'forward',
        'Tilted short center bar inside the opening'
      ),
    ],
    totalStrokes: 2,
    metadata: { phonetic: 'Nav', transliteration: '9' },
  },
};
