import { CharacterStrokeDefinition } from '../types';
import { sampleCurve, sampleLine, makeLoop, createStroke } from '../strokeSampler';

/**
 * Authentic Gujarati Vowels (સ્વર: અ થી અઃ)
 * Handcrafted vector stroke definitions respecting authentic Gujarati handwriting conventions (No Shirorekha).
 */
export const GUJARATI_VOWELS: Record<string, CharacterStrokeDefinition> = {
  // અ (A)
  // Authentic Gujarati handwriting: Upper arch curving right, central loop/knot,
  // lower bowl swooping down-left and right, middle connector, and vertical stem.
  'અ': {
    character: 'અ',
    language: 'gu',
    category: 'vowel',
    strokes: [
      createStroke(
        'gu_vow_a_s1',
        1,
        sampleCurve([
          { x: 30, y: 34 },
          { x: 44, y: 26 },
          { x: 56, y: 36 },
          { x: 46, y: 48 },
          { x: 36, y: 52 },
          { x: 44, y: 56 },
          { x: 26, y: 68 },
          { x: 38, y: 84 },
          { x: 56, y: 76 },
        ]),
        'forward',
        'Upper arch, central knot, and lower bowl of A'
      ),
      createStroke(
        'gu_vow_a_s2',
        2,
        sampleLine({ x: 44, y: 52 }, { x: 68, y: 52 }),
        'left_to_right',
        'Middle horizontal connector'
      ),
      createStroke(
        'gu_vow_a_s3',
        3,
        sampleLine({ x: 68, y: 26 }, { x: 68, y: 86 }),
        'down',
        'Right vertical stem'
      ),
    ],
    totalStrokes: 3,
    metadata: { phonetic: 'A' },
  },

  // આ (Aa)
  // Authentic Gujarati Aa: Same base body as અ with an additional vertical stem on the right.
  'આ': {
    character: 'આ',
    language: 'gu',
    category: 'vowel',
    strokes: [
      createStroke(
        'gu_vow_aa_s1',
        1,
        sampleCurve([
          { x: 22, y: 34 },
          { x: 36, y: 26 },
          { x: 48, y: 36 },
          { x: 38, y: 48 },
          { x: 28, y: 52 },
          { x: 36, y: 56 },
          { x: 18, y: 68 },
          { x: 30, y: 84 },
          { x: 48, y: 76 },
        ]),
        'forward',
        'Main curved body of Aa'
      ),
      createStroke(
        'gu_vow_aa_s2',
        2,
        sampleLine({ x: 36, y: 52 }, { x: 58, y: 52 }),
        'left_to_right',
        'Middle connector'
      ),
      createStroke(
        'gu_vow_aa_s3',
        3,
        sampleLine({ x: 58, y: 26 }, { x: 58, y: 86 }),
        'down',
        'First vertical stem'
      ),
      createStroke(
        'gu_vow_aa_s4',
        4,
        sampleLine({ x: 78, y: 26 }, { x: 78, y: 86 }),
        'down',
        'Second vertical stem (Aa matra)'
      ),
    ],
    totalStrokes: 4,
    metadata: { phonetic: 'Aa' },
  },

  // ઇ (Short I)
  // Authentic Gujarati I: Top arch, central knot, lower bowl, and baseline sweep.
  'ઇ': {
    character: 'ઇ',
    language: 'gu',
    category: 'vowel',
    strokes: [
      createStroke(
        'gu_vow_i_s1',
        1,
        sampleCurve([
          { x: 34, y: 34 },
          { x: 48, y: 26 },
          { x: 62, y: 32 },
          { x: 66, y: 44 },
          { x: 52, y: 52 },
          { x: 40, y: 54 },
          { x: 44, y: 60 },
          { x: 32, y: 72 },
          { x: 44, y: 84 },
          { x: 58, y: 84 },
          { x: 70, y: 74 },
        ]),
        'forward',
        'Top arch, central loop, and baseline sweep of Gujarati I'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'I' },
  },

  // ઈ (Long I / Ee)
  // Authentic Gujarati Ee: Same base body as ઇ with top Reph hook starting from top arch.
  'ઈ': {
    character: 'ઈ',
    language: 'gu',
    category: 'vowel',
    strokes: [
      createStroke(
        'gu_vow_ee_s1',
        1,
        sampleCurve([
          { x: 34, y: 38 },
          { x: 48, y: 30 },
          { x: 62, y: 36 },
          { x: 66, y: 48 },
          { x: 52, y: 56 },
          { x: 40, y: 58 },
          { x: 44, y: 64 },
          { x: 32, y: 76 },
          { x: 44, y: 86 },
          { x: 58, y: 86 },
          { x: 70, y: 76 },
        ]),
        'forward',
        'Main body curve of Ee'
      ),
      createStroke(
        'gu_vow_ee_s2',
        2,
        sampleCurve([
          { x: 52, y: 28 },
          { x: 64, y: 16 },
          { x: 76, y: 14 },
        ]),
        'up',
        'Top Reph hook curving up-right'
      ),
    ],
    totalStrokes: 2,
    metadata: { phonetic: 'Ee' },
  },

  // ઉ (Short U)
  // Shape: Like digit ૩ — double arch with middle notch.
  'ઉ': {
    character: 'ઉ',
    language: 'gu',
    category: 'vowel',
    strokes: [
      createStroke(
        'gu_vow_u_s1',
        1,
        sampleCurve([
          { x: 34, y: 34 },
          { x: 52, y: 26 },
          { x: 70, y: 34 },
          { x: 54, y: 48 },
          { x: 44, y: 52 },
          { x: 58, y: 54 },
          { x: 72, y: 64 },
          { x: 68, y: 78 },
          { x: 50, y: 86 },
          { x: 34, y: 80 },
        ]),
        'forward',
        'Continuous double-arch body of Gujarati U'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'U' },
  },

  // ઊ (Long U / Oo)
  // Shape: Same as ઉ with descending tail looping under and sweeping across to right.
  'ઊ': {
    character: 'ઊ',
    language: 'gu',
    category: 'vowel',
    strokes: [
      createStroke(
        'gu_vow_oo_s1',
        1,
        sampleCurve([
          { x: 34, y: 32 },
          { x: 52, y: 24 },
          { x: 70, y: 32 },
          { x: 54, y: 46 },
          { x: 44, y: 50 },
          { x: 58, y: 52 },
          { x: 72, y: 62 },
          { x: 66, y: 74 },
          { x: 48, y: 80 },
          { x: 34, y: 76 },
        ]),
        'forward',
        'Main double-arch body'
      ),
      createStroke(
        'gu_vow_oo_s2',
        2,
        sampleCurve([
          { x: 34, y: 76 },
          { x: 26, y: 84 },
          { x: 36, y: 92 },
          { x: 54, y: 92 },
          { x: 74, y: 84 },
        ]),
        'forward',
        'Tail looping under and sweeping right across baseline'
      ),
    ],
    totalStrokes: 2,
    metadata: { phonetic: 'Oo' },
  },

  // ઋ (Ri)
  'ઋ': {
    character: 'ઋ',
    language: 'gu',
    category: 'vowel',
    strokes: [
      createStroke(
        'gu_vow_ri_s1',
        1,
        sampleLine({ x: 46, y: 26 }, { x: 46, y: 86 }),
        'down',
        'Central vertical stem'
      ),
      createStroke(
        'gu_vow_ri_s2',
        2,
        sampleCurve([
          { x: 26, y: 40 },
          { x: 46, y: 52 },
          { x: 26, y: 68 },
        ]),
        'forward',
        'Left branching strokes'
      ),
      createStroke(
        'gu_vow_ri_s3',
        3,
        sampleCurve([
          { x: 46, y: 52 },
          { x: 64, y: 44 },
          { x: 60, y: 62 },
          { x: 72, y: 82 },
        ]),
        'forward',
        'Right loop into bottom hook'
      ),
    ],
    totalStrokes: 3,
    metadata: { phonetic: 'Ri' },
  },

  // એ (E)
  'એ': {
    character: 'એ',
    language: 'gu',
    category: 'vowel',
    strokes: [
      createStroke(
        'gu_vow_e_s1',
        1,
        sampleCurve([
          { x: 30, y: 36 },
          { x: 44, y: 28 },
          { x: 56, y: 38 },
          { x: 46, y: 50 },
          { x: 36, y: 54 },
          { x: 44, y: 58 },
          { x: 26, y: 70 },
          { x: 38, y: 86 },
          { x: 56, y: 78 },
        ]),
        'forward',
        'Main curved body'
      ),
      createStroke(
        'gu_vow_e_s2',
        2,
        sampleLine({ x: 44, y: 54 }, { x: 68, y: 54 }),
        'left_to_right',
        'Middle connector'
      ),
      createStroke(
        'gu_vow_e_s3',
        3,
        sampleLine({ x: 68, y: 30 }, { x: 68, y: 86 }),
        'down',
        'Right vertical stem'
      ),
      createStroke(
        'gu_vow_e_s4',
        4,
        sampleLine({ x: 64, y: 28 }, { x: 74, y: 14 }),
        'up',
        'Top slant matra'
      ),
    ],
    totalStrokes: 4,
    metadata: { phonetic: 'E' },
  },

  // ઐ (Ai)
  'ઐ': {
    character: 'ઐ',
    language: 'gu',
    category: 'vowel',
    strokes: [
      createStroke(
        'gu_vow_ai_s1',
        1,
        sampleCurve([
          { x: 30, y: 38 },
          { x: 44, y: 30 },
          { x: 56, y: 40 },
          { x: 46, y: 52 },
          { x: 36, y: 56 },
          { x: 44, y: 60 },
          { x: 26, y: 72 },
          { x: 38, y: 88 },
          { x: 56, y: 80 },
        ]),
        'forward',
        'Main body'
      ),
      createStroke(
        'gu_vow_ai_s2',
        2,
        sampleLine({ x: 44, y: 56 }, { x: 68, y: 56 }),
        'left_to_right',
        'Middle connector'
      ),
      createStroke(
        'gu_vow_ai_s3',
        3,
        sampleLine({ x: 68, y: 32 }, { x: 68, y: 88 }),
        'down',
        'Vertical stem'
      ),
      createStroke(
        'gu_vow_ai_s4',
        4,
        sampleLine({ x: 60, y: 30 }, { x: 70, y: 14 }),
        'up',
        'First slant matra'
      ),
      createStroke(
        'gu_vow_ai_s5',
        5,
        sampleLine({ x: 68, y: 30 }, { x: 78, y: 14 }),
        'up',
        'Second slant matra'
      ),
    ],
    totalStrokes: 5,
    metadata: { phonetic: 'Ai' },
  },

  // ઓ (O)
  'ઓ': {
    character: 'ઓ',
    language: 'gu',
    category: 'vowel',
    strokes: [
      createStroke(
        'gu_vow_o_s1',
        1,
        sampleCurve([
          { x: 22, y: 36 },
          { x: 36, y: 28 },
          { x: 48, y: 38 },
          { x: 38, y: 50 },
          { x: 28, y: 54 },
          { x: 36, y: 58 },
          { x: 18, y: 70 },
          { x: 30, y: 86 },
          { x: 48, y: 78 },
        ]),
        'forward',
        'Main curved body'
      ),
      createStroke(
        'gu_vow_o_s2',
        2,
        sampleLine({ x: 36, y: 54 }, { x: 58, y: 54 }),
        'left_to_right',
        'Middle connector'
      ),
      createStroke(
        'gu_vow_o_s3',
        3,
        sampleLine({ x: 58, y: 30 }, { x: 58, y: 86 }),
        'down',
        'First vertical stem'
      ),
      createStroke(
        'gu_vow_o_s4',
        4,
        sampleLine({ x: 78, y: 30 }, { x: 78, y: 86 }),
        'down',
        'Second vertical stem'
      ),
      createStroke(
        'gu_vow_o_s5',
        5,
        sampleLine({ x: 74, y: 28 }, { x: 86, y: 14 }),
        'up',
        'Top slant matra'
      ),
    ],
    totalStrokes: 5,
    metadata: { phonetic: 'O' },
  },

  // ઔ (Au)
  'ઔ': {
    character: 'ઔ',
    language: 'gu',
    category: 'vowel',
    strokes: [
      createStroke(
        'gu_vow_au_s1',
        1,
        sampleCurve([
          { x: 22, y: 38 },
          { x: 36, y: 30 },
          { x: 48, y: 40 },
          { x: 38, y: 52 },
          { x: 28, y: 56 },
          { x: 36, y: 60 },
          { x: 18, y: 72 },
          { x: 30, y: 88 },
          { x: 48, y: 80 },
        ]),
        'forward',
        'Main curved body'
      ),
      createStroke(
        'gu_vow_au_s2',
        2,
        sampleLine({ x: 36, y: 56 }, { x: 58, y: 56 }),
        'left_to_right',
        'Middle connector'
      ),
      createStroke(
        'gu_vow_au_s3',
        3,
        sampleLine({ x: 58, y: 32 }, { x: 58, y: 88 }),
        'down',
        'First vertical stem'
      ),
      createStroke(
        'gu_vow_au_s4',
        4,
        sampleLine({ x: 78, y: 32 }, { x: 78, y: 88 }),
        'down',
        'Second vertical stem'
      ),
      createStroke(
        'gu_vow_au_s5',
        5,
        sampleLine({ x: 72, y: 30 }, { x: 82, y: 14 }),
        'up',
        'First top slant matra'
      ),
      createStroke(
        'gu_vow_au_s6',
        6,
        sampleLine({ x: 80, y: 30 }, { x: 90, y: 14 }),
        'up',
        'Second top slant matra'
      ),
    ],
    totalStrokes: 6,
    metadata: { phonetic: 'Au' },
  },

  // અં (Am)
  'અં': {
    character: 'અં',
    language: 'gu',
    category: 'vowel',
    strokes: [
      createStroke(
        'gu_vow_am_s1',
        1,
        sampleCurve([
          { x: 30, y: 36 },
          { x: 44, y: 28 },
          { x: 56, y: 38 },
          { x: 46, y: 50 },
          { x: 36, y: 54 },
          { x: 44, y: 58 },
          { x: 26, y: 70 },
          { x: 38, y: 86 },
          { x: 56, y: 78 },
        ]),
        'forward',
        'Main body'
      ),
      createStroke(
        'gu_vow_am_s2',
        2,
        sampleLine({ x: 44, y: 54 }, { x: 68, y: 54 }),
        'left_to_right',
        'Middle connector'
      ),
      createStroke(
        'gu_vow_am_s3',
        3,
        sampleLine({ x: 68, y: 30 }, { x: 68, y: 86 }),
        'down',
        'Vertical stem'
      ),
      createStroke(
        'gu_vow_am_s4',
        4,
        makeLoop(54, 16, 4, 4),
        'clockwise',
        'Top anusvara bindu'
      ),
    ],
    totalStrokes: 4,
    metadata: { phonetic: 'Am' },
  },

  // અઃ (Aha)
  'અઃ': {
    character: 'અઃ',
    language: 'gu',
    category: 'vowel',
    strokes: [
      createStroke(
        'gu_vow_aha_s1',
        1,
        sampleCurve([
          { x: 26, y: 34 },
          { x: 40, y: 26 },
          { x: 52, y: 36 },
          { x: 42, y: 48 },
          { x: 32, y: 52 },
          { x: 40, y: 56 },
          { x: 22, y: 68 },
          { x: 34, y: 84 },
          { x: 52, y: 76 },
        ]),
        'forward',
        'Main body'
      ),
      createStroke(
        'gu_vow_aha_s2',
        2,
        sampleLine({ x: 40, y: 52 }, { x: 64, y: 52 }),
        'left_to_right',
        'Middle connector'
      ),
      createStroke(
        'gu_vow_aha_s3',
        3,
        sampleLine({ x: 64, y: 26 }, { x: 64, y: 86 }),
        'down',
        'Vertical stem'
      ),
      createStroke(
        'gu_vow_aha_s4',
        4,
        makeLoop(80, 44, 3.5, 3.5),
        'clockwise',
        'Upper visarga dot'
      ),
      createStroke(
        'gu_vow_aha_s5',
        5,
        makeLoop(80, 68, 3.5, 3.5),
        'clockwise',
        'Lower visarga dot'
      ),
    ],
    totalStrokes: 5,
    metadata: { phonetic: 'Aha' },
  },
};
