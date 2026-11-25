import { CharacterStrokeDefinition } from '../types';
import { sampleCurve, sampleLine, makeLoop, createStroke } from '../strokeSampler';

/**
 * Authentic Hindi / Devanagari Vowels (स्वर: अ से अः)
 * Complete handwriting stroke geometry with proper headline (शिरोरेखा) handling.
 */
export const HINDI_VOWELS: Record<string, CharacterStrokeDefinition> = {
  // अ (A)
  'अ': {
    character: 'अ',
    language: 'hi',
    category: 'vowel',
    strokes: [
      createStroke(
        'hi_vow_a_s1',
        1,
        sampleCurve([
          { x: 30, y: 34 },
          { x: 44, y: 26 },
          { x: 56, y: 38 },
          { x: 44, y: 50 },
        ]),
        'forward',
        'Upper curve of A'
      ),
      createStroke(
        'hi_vow_a_s2',
        2,
        sampleCurve([
          { x: 44, y: 50 },
          { x: 58, y: 60 },
          { x: 54, y: 76 },
          { x: 38, y: 84 },
          { x: 52, y: 74 },
        ]),
        'forward',
        'Lower curve of A'
      ),
      createStroke(
        'hi_vow_a_s3',
        3,
        sampleLine({ x: 44, y: 52 }, { x: 66, y: 52 }),
        'left_to_right',
        'Middle horizontal connector'
      ),
      createStroke(
        'hi_vow_a_s4',
        4,
        sampleLine({ x: 66, y: 24 }, { x: 66, y: 86 }),
        'down',
        'Vertical stem (Danda)'
      ),
      createStroke(
        'hi_vow_a_s5',
        5,
        sampleLine({ x: 52, y: 24 }, { x: 82, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 5,
    metadata: { phonetic: 'A', hasShirorekha: true },
  },

  // आ (Aa)
  'आ': {
    character: 'आ',
    language: 'hi',
    category: 'vowel',
    strokes: [
      createStroke(
        'hi_vow_aa_s1',
        1,
        sampleCurve([
          { x: 22, y: 34 },
          { x: 36, y: 26 },
          { x: 48, y: 38 },
          { x: 36, y: 50 },
        ]),
        'forward',
        'Upper curve'
      ),
      createStroke(
        'hi_vow_aa_s2',
        2,
        sampleCurve([
          { x: 36, y: 50 },
          { x: 50, y: 60 },
          { x: 46, y: 76 },
          { x: 30, y: 84 },
          { x: 44, y: 74 },
        ]),
        'forward',
        'Lower curve'
      ),
      createStroke(
        'hi_vow_aa_s3',
        3,
        sampleLine({ x: 36, y: 52 }, { x: 58, y: 52 }),
        'left_to_right',
        'Middle connector'
      ),
      createStroke(
        'hi_vow_aa_s4',
        4,
        sampleLine({ x: 58, y: 24 }, { x: 58, y: 86 }),
        'down',
        'First vertical stem'
      ),
      createStroke(
        'hi_vow_aa_s5',
        5,
        sampleLine({ x: 78, y: 24 }, { x: 78, y: 86 }),
        'down',
        'Second vertical stem (Aa matra)'
      ),
      createStroke(
        'hi_vow_aa_s6',
        6,
        sampleLine({ x: 46, y: 24 }, { x: 92, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 6,
    metadata: { phonetic: 'Aa', hasShirorekha: true },
  },

  // इ (Short I)
  'इ': {
    character: 'इ',
    language: 'hi',
    category: 'vowel',
    strokes: [
      createStroke(
        'hi_vow_i_s1',
        1,
        sampleLine({ x: 50, y: 24 }, { x: 50, y: 34 }),
        'down',
        'Short top anchor'
      ),
      createStroke(
        'hi_vow_i_s2',
        2,
        sampleCurve([
          { x: 50, y: 34 },
          { x: 36, y: 44 },
          { x: 54, y: 56 },
          { x: 36, y: 70 },
        ]),
        'forward',
        'S-curve body'
      ),
      createStroke(
        'hi_vow_i_s3',
        3,
        sampleCurve([
          { x: 36, y: 70 },
          { x: 48, y: 74 },
          { x: 38, y: 84 },
          { x: 58, y: 86 },
        ]),
        'forward',
        'Bottom loop and descending tail'
      ),
      createStroke(
        'hi_vow_i_s4',
        4,
        sampleLine({ x: 28, y: 24 }, { x: 72, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 4,
    metadata: { phonetic: 'I', hasShirorekha: true },
  },

  // ई (Long I / Ee)
  'ई': {
    character: 'ई',
    language: 'hi',
    category: 'vowel',
    strokes: [
      createStroke(
        'hi_vow_ee_s1',
        1,
        sampleLine({ x: 50, y: 24 }, { x: 50, y: 34 }),
        'down',
        'Short top anchor'
      ),
      createStroke(
        'hi_vow_ee_s2',
        2,
        sampleCurve([
          { x: 50, y: 34 },
          { x: 36, y: 44 },
          { x: 54, y: 56 },
          { x: 36, y: 70 },
        ]),
        'forward',
        'S-curve body'
      ),
      createStroke(
        'hi_vow_ee_s3',
        3,
        sampleCurve([
          { x: 36, y: 70 },
          { x: 48, y: 74 },
          { x: 38, y: 84 },
          { x: 58, y: 86 },
        ]),
        'forward',
        'Bottom loop and tail'
      ),
      createStroke(
        'hi_vow_ee_s4',
        4,
        sampleCurve([
          { x: 48, y: 24 },
          { x: 60, y: 16 },
          { x: 70, y: 12 },
        ]),
        'up',
        'Top reph hook'
      ),
      createStroke(
        'hi_vow_ee_s5',
        5,
        sampleLine({ x: 28, y: 24 }, { x: 72, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 5,
    metadata: { phonetic: 'Ee', hasShirorekha: true },
  },

  // उ (Short U)
  'उ': {
    character: 'उ',
    language: 'hi',
    category: 'vowel',
    strokes: [
      createStroke(
        'hi_vow_u_s1',
        1,
        sampleCurve([
          { x: 34, y: 34 },
          { x: 52, y: 26 },
          { x: 68, y: 34 },
          { x: 50, y: 48 },
        ]),
        'forward',
        'Upper arch'
      ),
      createStroke(
        'hi_vow_u_s2',
        2,
        sampleCurve([
          { x: 50, y: 48 },
          { x: 72, y: 60 },
          { x: 68, y: 78 },
          { x: 46, y: 86 },
          { x: 34, y: 80 },
        ]),
        'forward',
        'Lower arch'
      ),
      createStroke(
        'hi_vow_u_s3',
        3,
        sampleLine({ x: 24, y: 24 }, { x: 76, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 3,
    metadata: { phonetic: 'U', hasShirorekha: true },
  },

  // ऊ (Long U / Oo)
  'ऊ': {
    character: 'ऊ',
    language: 'hi',
    category: 'vowel',
    strokes: [
      createStroke(
        'hi_vow_oo_s1',
        1,
        sampleCurve([
          { x: 34, y: 34 },
          { x: 52, y: 26 },
          { x: 68, y: 34 },
          { x: 50, y: 48 },
        ]),
        'forward',
        'Upper arch'
      ),
      createStroke(
        'hi_vow_oo_s2',
        2,
        sampleCurve([
          { x: 50, y: 48 },
          { x: 72, y: 60 },
          { x: 68, y: 78 },
          { x: 46, y: 86 },
          { x: 34, y: 80 },
        ]),
        'forward',
        'Lower arch'
      ),
      createStroke(
        'hi_vow_oo_s3',
        3,
        sampleCurve([
          { x: 50, y: 48 },
          { x: 66, y: 56 },
          { x: 74, y: 74 },
        ]),
        'down',
        'Middle downward tail'
      ),
      createStroke(
        'hi_vow_oo_s4',
        4,
        sampleLine({ x: 24, y: 24 }, { x: 76, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 4,
    metadata: { phonetic: 'Oo', hasShirorekha: true },
  },

  // ऋ (Ri)
  'ऋ': {
    character: 'ऋ',
    language: 'hi',
    category: 'vowel',
    strokes: [
      createStroke(
        'hi_vow_ri_s1',
        1,
        sampleLine({ x: 48, y: 24 }, { x: 48, y: 86 }),
        'down',
        'Central vertical stem'
      ),
      createStroke(
        'hi_vow_ri_s2',
        2,
        sampleLine({ x: 28, y: 42 }, { x: 48, y: 52 }),
        'forward',
        'Left upper slant'
      ),
      createStroke(
        'hi_vow_ri_s3',
        3,
        sampleLine({ x: 48, y: 52 }, { x: 28, y: 68 }),
        'forward',
        'Left lower slant'
      ),
      createStroke(
        'hi_vow_ri_s4',
        4,
        sampleCurve([
          { x: 48, y: 52 },
          { x: 66, y: 44 },
          { x: 62, y: 62 },
          { x: 74, y: 82 },
        ]),
        'forward',
        'Right loop into bottom hook'
      ),
      createStroke(
        'hi_vow_ri_s5',
        5,
        sampleLine({ x: 36, y: 24 }, { x: 64, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 5,
    metadata: { phonetic: 'Ri', hasShirorekha: true },
  },

  // ए (E)
  'ए': {
    character: 'ए',
    language: 'hi',
    category: 'vowel',
    strokes: [
      createStroke(
        'hi_vow_e_s1',
        1,
        sampleCurve([
          { x: 42, y: 24 },
          { x: 42, y: 52 },
          { x: 56, y: 74 },
        ]),
        'forward',
        'Left downward stem with slant'
      ),
      createStroke(
        'hi_vow_e_s2',
        2,
        sampleCurve([
          { x: 64, y: 24 },
          { x: 64, y: 52 },
          { x: 54, y: 56 },
        ]),
        'forward',
        'Right stem with hook'
      ),
      createStroke(
        'hi_vow_e_s3',
        3,
        sampleLine({ x: 28, y: 24 }, { x: 76, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 3,
    metadata: { phonetic: 'E', hasShirorekha: true },
  },

  // ऐ (Ai)
  'ऐ': {
    character: 'ऐ',
    language: 'hi',
    category: 'vowel',
    strokes: [
      createStroke(
        'hi_vow_ai_s1',
        1,
        sampleCurve([
          { x: 42, y: 28 },
          { x: 42, y: 54 },
          { x: 56, y: 76 },
        ]),
        'forward',
        'Left stem with slant'
      ),
      createStroke(
        'hi_vow_ai_s2',
        2,
        sampleCurve([
          { x: 64, y: 28 },
          { x: 64, y: 54 },
          { x: 54, y: 58 },
        ]),
        'forward',
        'Right stem'
      ),
      createStroke(
        'hi_vow_ai_s3',
        3,
        sampleLine({ x: 54, y: 28 }, { x: 66, y: 14 }),
        'up',
        'Top slant matra'
      ),
      createStroke(
        'hi_vow_ai_s4',
        4,
        sampleLine({ x: 28, y: 28 }, { x: 76, y: 28 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 4,
    metadata: { phonetic: 'Ai', hasShirorekha: true },
  },

  // ओ (O)
  'ओ': {
    character: 'ओ',
    language: 'hi',
    category: 'vowel',
    strokes: [
      createStroke(
        'hi_vow_o_s1',
        1,
        sampleCurve([
          { x: 22, y: 36 },
          { x: 36, y: 28 },
          { x: 48, y: 40 },
          { x: 36, y: 52 },
        ]),
        'forward',
        'Upper curve'
      ),
      createStroke(
        'hi_vow_o_s2',
        2,
        sampleCurve([
          { x: 36, y: 52 },
          { x: 50, y: 62 },
          { x: 46, y: 78 },
          { x: 30, y: 86 },
          { x: 44, y: 76 },
        ]),
        'forward',
        'Lower curve'
      ),
      createStroke(
        'hi_vow_o_s3',
        3,
        sampleLine({ x: 36, y: 54 }, { x: 58, y: 54 }),
        'left_to_right',
        'Middle connector'
      ),
      createStroke(
        'hi_vow_o_s4',
        4,
        sampleLine({ x: 58, y: 26 }, { x: 58, y: 88 }),
        'down',
        'First vertical stem'
      ),
      createStroke(
        'hi_vow_o_s5',
        5,
        sampleLine({ x: 78, y: 26 }, { x: 78, y: 88 }),
        'down',
        'Second vertical stem'
      ),
      createStroke(
        'hi_vow_o_s6',
        6,
        sampleLine({ x: 74, y: 26 }, { x: 86, y: 14 }),
        'up',
        'Top slant matra'
      ),
      createStroke(
        'hi_vow_o_s7',
        7,
        sampleLine({ x: 46, y: 26 }, { x: 92, y: 26 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 7,
    metadata: { phonetic: 'O', hasShirorekha: true },
  },

  // औ (Au)
  'औ': {
    character: 'औ',
    language: 'hi',
    category: 'vowel',
    strokes: [
      createStroke(
        'hi_vow_au_s1',
        1,
        sampleCurve([
          { x: 22, y: 38 },
          { x: 36, y: 30 },
          { x: 48, y: 42 },
          { x: 36, y: 54 },
        ]),
        'forward',
        'Upper curve'
      ),
      createStroke(
        'hi_vow_au_s2',
        2,
        sampleCurve([
          { x: 36, y: 54 },
          { x: 50, y: 64 },
          { x: 46, y: 80 },
          { x: 30, y: 88 },
          { x: 44, y: 78 },
        ]),
        'forward',
        'Lower curve'
      ),
      createStroke(
        'hi_vow_au_s3',
        3,
        sampleLine({ x: 36, y: 56 }, { x: 58, y: 56 }),
        'left_to_right',
        'Middle connector'
      ),
      createStroke(
        'hi_vow_au_s4',
        4,
        sampleLine({ x: 58, y: 28 }, { x: 58, y: 88 }),
        'down',
        'First vertical stem'
      ),
      createStroke(
        'hi_vow_au_s5',
        5,
        sampleLine({ x: 78, y: 28 }, { x: 78, y: 88 }),
        'down',
        'Second vertical stem'
      ),
      createStroke(
        'hi_vow_au_s6',
        6,
        sampleLine({ x: 72, y: 28 }, { x: 82, y: 14 }),
        'up',
        'First slant matra'
      ),
      createStroke(
        'hi_vow_au_s7',
        7,
        sampleLine({ x: 80, y: 28 }, { x: 90, y: 14 }),
        'up',
        'Second slant matra'
      ),
      createStroke(
        'hi_vow_au_s8',
        8,
        sampleLine({ x: 46, y: 28 }, { x: 94, y: 28 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 8,
    metadata: { phonetic: 'Au', hasShirorekha: true },
  },

  // अं (Am)
  'अं': {
    character: 'अं',
    language: 'hi',
    category: 'vowel',
    strokes: [
      createStroke(
        'hi_vow_am_s1',
        1,
        sampleCurve([
          { x: 30, y: 36 },
          { x: 44, y: 28 },
          { x: 56, y: 40 },
          { x: 44, y: 52 },
        ]),
        'forward',
        'Upper curve'
      ),
      createStroke(
        'hi_vow_am_s2',
        2,
        sampleCurve([
          { x: 44, y: 52 },
          { x: 58, y: 62 },
          { x: 54, y: 78 },
          { x: 38, y: 86 },
          { x: 52, y: 76 },
        ]),
        'forward',
        'Lower curve'
      ),
      createStroke(
        'hi_vow_am_s3',
        3,
        sampleLine({ x: 44, y: 54 }, { x: 66, y: 54 }),
        'left_to_right',
        'Middle connector'
      ),
      createStroke(
        'hi_vow_am_s4',
        4,
        sampleLine({ x: 66, y: 26 }, { x: 66, y: 88 }),
        'down',
        'Vertical stem'
      ),
      createStroke(
        'hi_vow_am_s5',
        5,
        makeLoop(66, 16, 4, 4),
        'clockwise',
        'Top bindu dot'
      ),
      createStroke(
        'hi_vow_am_s6',
        6,
        sampleLine({ x: 52, y: 26 }, { x: 82, y: 26 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 6,
    metadata: { phonetic: 'Am', hasShirorekha: true },
  },

  // अः (Aha)
  'अः': {
    character: 'अः',
    language: 'hi',
    category: 'vowel',
    strokes: [
      createStroke(
        'hi_vow_aha_s1',
        1,
        sampleCurve([
          { x: 26, y: 34 },
          { x: 40, y: 26 },
          { x: 52, y: 38 },
          { x: 38, y: 50 },
        ]),
        'forward',
        'Upper curve'
      ),
      createStroke(
        'hi_vow_aha_s2',
        2,
        sampleCurve([
          { x: 38, y: 50 },
          { x: 52, y: 60 },
          { x: 48, y: 76 },
          { x: 32, y: 84 },
          { x: 46, y: 74 },
        ]),
        'forward',
        'Lower curve'
      ),
      createStroke(
        'hi_vow_aha_s3',
        3,
        sampleLine({ x: 38, y: 52 }, { x: 62, y: 52 }),
        'left_to_right',
        'Middle connector'
      ),
      createStroke(
        'hi_vow_aha_s4',
        4,
        sampleLine({ x: 62, y: 24 }, { x: 62, y: 86 }),
        'down',
        'Vertical stem'
      ),
      createStroke(
        'hi_vow_aha_s5',
        5,
        makeLoop(78, 44, 3.5, 3.5),
        'clockwise',
        'Upper visarga dot'
      ),
      createStroke(
        'hi_vow_aha_s6',
        6,
        makeLoop(78, 68, 3.5, 3.5),
        'clockwise',
        'Lower visarga dot'
      ),
      createStroke(
        'hi_vow_aha_s7',
        7,
        sampleLine({ x: 48, y: 24 }, { x: 76, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 7,
    metadata: { phonetic: 'Aha', hasShirorekha: true },
  },
};

