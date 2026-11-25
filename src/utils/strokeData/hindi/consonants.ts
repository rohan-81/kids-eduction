import { CharacterStrokeDefinition } from '../types';
import { sampleCurve, sampleLine, makeLoop, createStroke } from '../strokeSampler';

/**
 * Authentic Hindi / Devanagari Consonants (व्यंजन: क से ज्ञ)
 * Complete set of all 36 consonants with authentic headline (शिरोरेखा) and stroke order.
 */
export const HINDI_CONSONANTS: Record<string, CharacterStrokeDefinition> = {
  // क (Ka)
  'क': {
    character: 'क',
    language: 'hi',
    category: 'consonant',
    strokes: [
      createStroke(
        'hi_con_ka_s1',
        1,
        sampleLine({ x: 50, y: 24 }, { x: 50, y: 86 }),
        'down',
        'Central vertical stem'
      ),
      createStroke(
        'hi_con_ka_s2',
        2,
        sampleCurve([
          { x: 50, y: 48 },
          { x: 34, y: 42 },
          { x: 26, y: 56 },
          { x: 36, y: 68 },
          { x: 50, y: 60 },
        ]),
        'counter_clockwise',
        'Left closed circular loop'
      ),
      createStroke(
        'hi_con_ka_s3',
        3,
        sampleCurve([
          { x: 50, y: 48 },
          { x: 68, y: 44 },
          { x: 74, y: 60 },
          { x: 66, y: 76 },
        ]),
        'forward',
        'Right downward hook'
      ),
      createStroke(
        'hi_con_ka_s4',
        4,
        sampleLine({ x: 20, y: 24 }, { x: 80, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 4,
    metadata: { phonetic: 'Ka', hasShirorekha: true },
  },

  // ख (Kha)
  'ख': {
    character: 'ख',
    language: 'hi',
    category: 'consonant',
    strokes: [
      createStroke(
        'hi_con_kha_s1',
        1,
        sampleCurve([
          { x: 34, y: 34 },
          { x: 46, y: 30 },
          { x: 36, y: 46 },
          { x: 48, y: 64 },
          { x: 64, y: 74 },
        ]),
        'forward',
        'Left reverse curve and connector'
      ),
      createStroke(
        'hi_con_kha_s2',
        2,
        sampleCurve([
          { x: 66, y: 50 },
          { x: 48, y: 46 },
          { x: 42, y: 58 },
          { x: 52, y: 68 },
          { x: 66, y: 64 },
        ]),
        'counter_clockwise',
        'Enclosed circular loop'
      ),
      createStroke(
        'hi_con_kha_s3',
        3,
        sampleLine({ x: 66, y: 24 }, { x: 66, y: 86 }),
        'down',
        'Right vertical stem'
      ),
      createStroke(
        'hi_con_kha_s4',
        4,
        sampleLine({ x: 22, y: 24 }, { x: 78, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 4,
    metadata: { phonetic: 'Kha', hasShirorekha: true },
  },

  // ग (Ga)
  'ग': {
    character: 'ग',
    language: 'hi',
    category: 'consonant',
    strokes: [
      createStroke(
        'hi_con_ga_s1',
        1,
        sampleCurve([
          { x: 42, y: 24 },
          { x: 42, y: 66 },
          { x: 34, y: 70 },
          { x: 30, y: 62 },
          { x: 42, y: 62 },
        ]),
        'down',
        'Left stem with inward loop knot'
      ),
      createStroke(
        'hi_con_ga_s2',
        2,
        sampleLine({ x: 66, y: 24 }, { x: 66, y: 86 }),
        'down',
        'Right vertical stem'
      ),
      createStroke(
        'hi_con_ga_s3',
        3,
        sampleLine({ x: 28, y: 24 }, { x: 78, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 3,
    metadata: { phonetic: 'Ga', hasShirorekha: true },
  },

  // घ (Gha)
  'घ': {
    character: 'घ',
    language: 'hi',
    category: 'consonant',
    strokes: [
      createStroke(
        'hi_con_gha_s1',
        1,
        sampleCurve([
          { x: 36, y: 32 },
          { x: 54, y: 30 },
          { x: 34, y: 48 },
        ]),
        'forward',
        'Upper left curve'
      ),
      createStroke(
        'hi_con_gha_s2',
        2,
        sampleCurve([
          { x: 34, y: 48 },
          { x: 54, y: 58 },
          { x: 36, y: 74 },
          { x: 66, y: 74 },
        ]),
        'forward',
        'Lower left curve'
      ),
      createStroke(
        'hi_con_gha_s3',
        3,
        sampleLine({ x: 66, y: 24 }, { x: 66, y: 86 }),
        'down',
        'Right vertical stem'
      ),
      createStroke(
        'hi_con_gha_s4',
        4,
        sampleLine({ x: 24, y: 24 }, { x: 78, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 4,
    metadata: { phonetic: 'Gha', hasShirorekha: true },
  },

  // ङ (Nga)
  'ङ': {
    character: 'ङ',
    language: 'hi',
    category: 'consonant',
    strokes: [
      createStroke(
        'hi_con_nga_s1',
        1,
        sampleLine({ x: 50, y: 24 }, { x: 50, y: 32 }),
        'down',
        'Top short anchor'
      ),
      createStroke(
        'hi_con_nga_s2',
        2,
        sampleCurve([
          { x: 50, y: 32 },
          { x: 36, y: 42 },
          { x: 54, y: 56 },
          { x: 36, y: 72 },
          { x: 50, y: 84 },
        ]),
        'forward',
        'S-curve body'
      ),
      createStroke(
        'hi_con_nga_s3',
        3,
        makeLoop(66, 56, 3.5, 3.5),
        'clockwise',
        'Right dot (bindu)'
      ),
      createStroke(
        'hi_con_nga_s4',
        4,
        sampleLine({ x: 28, y: 24 }, { x: 72, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 4,
    metadata: { phonetic: 'Nga', hasShirorekha: true },
  },

  // च (Cha)
  'च': {
    character: 'च',
    language: 'hi',
    category: 'consonant',
    strokes: [
      createStroke(
        'hi_con_cha_s1',
        1,
        sampleCurve([
          { x: 32, y: 52 },
          { x: 48, y: 52 },
          { x: 34, y: 68 },
          { x: 48, y: 76 },
          { x: 66, y: 74 },
        ]),
        'forward',
        'Horizontal stroke into loop'
      ),
      createStroke(
        'hi_con_cha_s2',
        2,
        sampleLine({ x: 66, y: 24 }, { x: 66, y: 86 }),
        'down',
        'Right vertical stem'
      ),
      createStroke(
        'hi_con_cha_s3',
        3,
        sampleLine({ x: 22, y: 24 }, { x: 78, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 3,
    metadata: { phonetic: 'Cha', hasShirorekha: true },
  },

  // छ (Chha)
  'छ': {
    character: 'छ',
    language: 'hi',
    category: 'consonant',
    strokes: [
      createStroke(
        'hi_con_chha_s1',
        1,
        sampleCurve([
          { x: 64, y: 34 },
          { x: 44, y: 30 },
          { x: 32, y: 44 },
          { x: 50, y: 54 },
          { x: 32, y: 68 },
          { x: 48, y: 84 },
          { x: 64, y: 74 },
          { x: 58, y: 62 },
          { x: 48, y: 66 },
        ]),
        'forward',
        'Continuous double loop into knot'
      ),
      createStroke(
        'hi_con_chha_s2',
        2,
        sampleLine({ x: 48, y: 24 }, { x: 48, y: 34 }),
        'down',
        'Top vertical connector'
      ),
      createStroke(
        'hi_con_chha_s3',
        3,
        sampleLine({ x: 22, y: 24 }, { x: 74, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 3,
    metadata: { phonetic: 'Chha', hasShirorekha: true },
  },

  // ज (Ja)
  'ज': {
    character: 'ज',
    language: 'hi',
    category: 'consonant',
    strokes: [
      createStroke(
        'hi_con_ja_s1',
        1,
        sampleCurve([
          { x: 34, y: 48 },
          { x: 32, y: 68 },
          { x: 48, y: 78 },
          { x: 64, y: 64 },
        ]),
        'forward',
        'Left curved cup'
      ),
      createStroke(
        'hi_con_ja_s2',
        2,
        sampleLine({ x: 48, y: 52 }, { x: 66, y: 52 }),
        'left_to_right',
        'Middle horizontal connector'
      ),
      createStroke(
        'hi_con_ja_s3',
        3,
        sampleLine({ x: 66, y: 24 }, { x: 66, y: 86 }),
        'down',
        'Right vertical stem'
      ),
      createStroke(
        'hi_con_ja_s4',
        4,
        sampleLine({ x: 26, y: 24 }, { x: 78, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 4,
    metadata: { phonetic: 'Ja', hasShirorekha: true },
  },

  // झ (Jha)
  'झ': {
    character: 'झ',
    language: 'hi',
    category: 'consonant',
    strokes: [
      createStroke(
        'hi_con_jha_s1',
        1,
        sampleLine({ x: 42, y: 24 }, { x: 42, y: 32 }),
        'down',
        'Top short anchor'
      ),
      createStroke(
        'hi_con_jha_s2',
        2,
        sampleCurve([
          { x: 42, y: 32 },
          { x: 30, y: 42 },
          { x: 46, y: 54 },
          { x: 30, y: 68 },
        ]),
        'forward',
        'S-curve body'
      ),
      createStroke(
        'hi_con_jha_s3',
        3,
        sampleCurve([
          { x: 30, y: 68 },
          { x: 40, y: 72 },
          { x: 32, y: 84 },
          { x: 50, y: 86 },
        ]),
        'forward',
        'Bottom loop and tail'
      ),
      createStroke(
        'hi_con_jha_s4',
        4,
        sampleLine({ x: 40, y: 54 }, { x: 66, y: 54 }),
        'left_to_right',
        'Middle connector'
      ),
      createStroke(
        'hi_con_jha_s5',
        5,
        sampleLine({ x: 66, y: 24 }, { x: 66, y: 86 }),
        'down',
        'Right vertical stem'
      ),
      createStroke(
        'hi_con_jha_s6',
        6,
        sampleLine({ x: 22, y: 24 }, { x: 78, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 6,
    metadata: { phonetic: 'Jha', hasShirorekha: true },
  },

  // ञ (Nya)
  'ञ': {
    character: 'ञ',
    language: 'hi',
    category: 'consonant',
    strokes: [
      createStroke(
        'hi_con_nya_s1',
        1,
        sampleCurve([
          { x: 50, y: 36 },
          { x: 34, y: 46 },
          { x: 46, y: 62 },
          { x: 34, y: 74 },
          { x: 46, y: 84 },
        ]),
        'forward',
        'Left reverse C-curve'
      ),
      createStroke(
        'hi_con_nya_s2',
        2,
        sampleLine({ x: 46, y: 56 }, { x: 66, y: 56 }),
        'left_to_right',
        'Horizontal connector'
      ),
      createStroke(
        'hi_con_nya_s3',
        3,
        sampleLine({ x: 66, y: 24 }, { x: 66, y: 86 }),
        'down',
        'Right vertical stem'
      ),
      createStroke(
        'hi_con_nya_s4',
        4,
        sampleLine({ x: 26, y: 24 }, { x: 78, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 4,
    metadata: { phonetic: 'Nya', hasShirorekha: true },
  },

  // ट (Ta retroflex)
  'ट': {
    character: 'ट',
    language: 'hi',
    category: 'consonant',
    strokes: [
      createStroke(
        'hi_con_ta_s1',
        1,
        sampleLine({ x: 50, y: 24 }, { x: 50, y: 34 }),
        'down',
        'Top short anchor'
      ),
      createStroke(
        'hi_con_ta_s2',
        2,
        sampleCurve([
          { x: 50, y: 34 },
          { x: 36, y: 44 },
          { x: 34, y: 64 },
          { x: 48, y: 82 },
          { x: 66, y: 82 },
        ]),
        'forward',
        'C-curve facing right'
      ),
      createStroke(
        'hi_con_ta_s3',
        3,
        sampleLine({ x: 24, y: 24 }, { x: 74, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 3,
    metadata: { phonetic: 'Ta', hasShirorekha: true },
  },

  // ठ (Tha retroflex)
  'ठ': {
    character: 'ठ',
    language: 'hi',
    category: 'consonant',
    strokes: [
      createStroke(
        'hi_con_tha_s1',
        1,
        sampleLine({ x: 50, y: 24 }, { x: 50, y: 34 }),
        'down',
        'Top short anchor'
      ),
      createStroke(
        'hi_con_tha_s2',
        2,
        makeLoop(50, 58, 20, 24),
        'counter_clockwise',
        'Closed circular loop'
      ),
      createStroke(
        'hi_con_tha_s3',
        3,
        sampleLine({ x: 24, y: 24 }, { x: 76, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 3,
    metadata: { phonetic: 'Tha', hasShirorekha: true },
  },

  // ड (Da retroflex)
  'ड': {
    character: 'ड',
    language: 'hi',
    category: 'consonant',
    strokes: [
      createStroke(
        'hi_con_da_s1',
        1,
        sampleLine({ x: 50, y: 24 }, { x: 50, y: 34 }),
        'down',
        'Top short anchor'
      ),
      createStroke(
        'hi_con_da_s2',
        2,
        sampleCurve([
          { x: 50, y: 34 },
          { x: 36, y: 44 },
          { x: 54, y: 58 },
          { x: 40, y: 78 },
          { x: 32, y: 80 },
        ]),
        'forward',
        'S-curve body'
      ),
      createStroke(
        'hi_con_da_s3',
        3,
        sampleLine({ x: 26, y: 24 }, { x: 74, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 3,
    metadata: { phonetic: 'Da', hasShirorekha: true },
  },

  // ढ (Dha retroflex)
  'ढ': {
    character: 'ढ',
    language: 'hi',
    category: 'consonant',
    strokes: [
      createStroke(
        'hi_con_dha_s1',
        1,
        sampleLine({ x: 50, y: 24 }, { x: 50, y: 34 }),
        'down',
        'Top short anchor'
      ),
      createStroke(
        'hi_con_dha_s2',
        2,
        sampleCurve([
          { x: 50, y: 34 },
          { x: 36, y: 44 },
          { x: 34, y: 66 },
          { x: 48, y: 80 },
          { x: 62, y: 74 },
          { x: 62, y: 62 },
          { x: 50, y: 62 },
        ]),
        'forward',
        'C-curve with interior knot'
      ),
      createStroke(
        'hi_con_dha_s3',
        3,
        sampleLine({ x: 26, y: 24 }, { x: 74, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 3,
    metadata: { phonetic: 'Dha', hasShirorekha: true },
  },

  // ण (Nna retroflex)
  'ण': {
    character: 'ण',
    language: 'hi',
    category: 'consonant',
    strokes: [
      createStroke(
        'hi_con_nna_s1',
        1,
        sampleCurve([
          { x: 36, y: 24 },
          { x: 36, y: 64 },
          { x: 46, y: 76 },
          { x: 46, y: 24 },
        ]),
        'forward',
        'Left open U-cup'
      ),
      createStroke(
        'hi_con_nna_s2',
        2,
        sampleLine({ x: 66, y: 24 }, { x: 66, y: 86 }),
        'down',
        'Right vertical stem'
      ),
      createStroke(
        'hi_con_nna_s3',
        3,
        sampleLine({ x: 24, y: 24 }, { x: 78, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 3,
    metadata: { phonetic: 'Nna', hasShirorekha: true },
  },

  // त (Ta dental)
  'त': {
    character: 'त',
    language: 'hi',
    category: 'consonant',
    strokes: [
      createStroke(
        'hi_con_dental_ta_s1',
        1,
        sampleCurve([
          { x: 66, y: 52 },
          { x: 52, y: 42 },
          { x: 38, y: 48 },
          { x: 36, y: 80 },
        ]),
        'forward',
        'Left downward arch'
      ),
      createStroke(
        'hi_con_dental_ta_s2',
        2,
        sampleLine({ x: 66, y: 24 }, { x: 66, y: 86 }),
        'down',
        'Right vertical stem'
      ),
      createStroke(
        'hi_con_dental_ta_s3',
        3,
        sampleLine({ x: 26, y: 24 }, { x: 78, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 3,
    metadata: { phonetic: 'Ta', hasShirorekha: true },
  },

  // थ (Tha dental)
  'थ': {
    character: 'थ',
    language: 'hi',
    category: 'consonant',
    strokes: [
      createStroke(
        'hi_con_dental_tha_s1',
        1,
        sampleCurve([
          { x: 38, y: 34 },
          { x: 46, y: 30 },
          { x: 38, y: 44 },
          { x: 44, y: 62 },
          { x: 48, y: 76 },
          { x: 66, y: 74 },
        ]),
        'forward',
        'Top loop with curved body'
      ),
      createStroke(
        'hi_con_dental_tha_s2',
        2,
        sampleLine({ x: 66, y: 24 }, { x: 66, y: 86 }),
        'down',
        'Right vertical stem'
      ),
      createStroke(
        'hi_con_dental_tha_s3',
        3,
        sampleLine({ x: 54, y: 24 }, { x: 78, y: 24 }),
        'left_to_right',
        'Top headline over stem'
      ),
    ],
    totalStrokes: 3,
    metadata: { phonetic: 'Tha', hasShirorekha: true },
  },

  // द (Da dental)
  'द': {
    character: 'द',
    language: 'hi',
    category: 'consonant',
    strokes: [
      createStroke(
        'hi_con_dental_da_s1',
        1,
        sampleLine({ x: 50, y: 24 }, { x: 50, y: 34 }),
        'down',
        'Top short anchor'
      ),
      createStroke(
        'hi_con_dental_da_s2',
        2,
        sampleCurve([
          { x: 50, y: 34 },
          { x: 36, y: 44 },
          { x: 34, y: 60 },
          { x: 56, y: 66 },
          { x: 40, y: 84 },
        ]),
        'forward',
        'C-curve with tail'
      ),
      createStroke(
        'hi_con_dental_da_s3',
        3,
        sampleLine({ x: 26, y: 24 }, { x: 72, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 3,
    metadata: { phonetic: 'Da', hasShirorekha: true },
  },

  // ध (Dha dental)
  'ध': {
    character: 'ध',
    language: 'hi',
    category: 'consonant',
    strokes: [
      createStroke(
        'hi_con_dental_dha_s1',
        1,
        sampleCurve([
          { x: 36, y: 38 },
          { x: 44, y: 34 },
          { x: 36, y: 46 },
          { x: 50, y: 56 },
          { x: 36, y: 74 },
          { x: 66, y: 74 },
        ]),
        'forward',
        'Double curved body with loop'
      ),
      createStroke(
        'hi_con_dental_dha_s2',
        2,
        sampleLine({ x: 66, y: 24 }, { x: 66, y: 86 }),
        'down',
        'Right vertical stem'
      ),
      createStroke(
        'hi_con_dental_dha_s3',
        3,
        sampleLine({ x: 54, y: 24 }, { x: 78, y: 24 }),
        'left_to_right',
        'Top headline over stem'
      ),
    ],
    totalStrokes: 3,
    metadata: { phonetic: 'Dha', hasShirorekha: true },
  },

  // न (Na)
  'न': {
    character: 'न',
    language: 'hi',
    category: 'consonant',
    strokes: [
      createStroke(
        'hi_con_na_s1',
        1,
        sampleCurve([
          { x: 34, y: 64 },
          { x: 44, y: 56 },
          { x: 46, y: 72 },
          { x: 34, y: 64 },
          { x: 48, y: 62 },
          { x: 66, y: 62 },
        ]),
        'forward',
        'Left loop into horizontal bar'
      ),
      createStroke(
        'hi_con_na_s2',
        2,
        sampleLine({ x: 66, y: 24 }, { x: 66, y: 86 }),
        'down',
        'Right vertical stem'
      ),
      createStroke(
        'hi_con_na_s3',
        3,
        sampleLine({ x: 24, y: 24 }, { x: 78, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 3,
    metadata: { phonetic: 'Na', hasShirorekha: true },
  },

  // प (Pa)
  'प': {
    character: 'प',
    language: 'hi',
    category: 'consonant',
    strokes: [
      createStroke(
        'hi_con_pa_s1',
        1,
        sampleCurve([
          { x: 36, y: 24 },
          { x: 36, y: 60 },
          { x: 48, y: 76 },
          { x: 66, y: 64 },
        ]),
        'forward',
        'Left U-cup'
      ),
      createStroke(
        'hi_con_pa_s2',
        2,
        sampleLine({ x: 66, y: 24 }, { x: 66, y: 86 }),
        'down',
        'Right vertical stem'
      ),
      createStroke(
        'hi_con_pa_s3',
        3,
        sampleLine({ x: 26, y: 24 }, { x: 78, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 3,
    metadata: { phonetic: 'Pa', hasShirorekha: true },
  },

  // फ (Pha)
  'फ': {
    character: 'फ',
    language: 'hi',
    category: 'consonant',
    strokes: [
      createStroke(
        'hi_con_pha_s1',
        1,
        sampleCurve([
          { x: 36, y: 24 },
          { x: 36, y: 60 },
          { x: 46, y: 76 },
          { x: 52, y: 64 },
        ]),
        'forward',
        'Left U-cup'
      ),
      createStroke(
        'hi_con_pha_s2',
        2,
        sampleLine({ x: 52, y: 24 }, { x: 52, y: 86 }),
        'down',
        'Central vertical stem'
      ),
      createStroke(
        'hi_con_pha_s3',
        3,
        sampleCurve([
          { x: 52, y: 48 },
          { x: 68, y: 46 },
          { x: 74, y: 64 },
          { x: 70, y: 78 },
        ]),
        'forward',
        'Right downward hook'
      ),
      createStroke(
        'hi_con_pha_s4',
        4,
        sampleLine({ x: 24, y: 24 }, { x: 80, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 4,
    metadata: { phonetic: 'Pha', hasShirorekha: true },
  },

  // ब (Ba)
  'ब': {
    character: 'ब',
    language: 'hi',
    category: 'consonant',
    strokes: [
      createStroke(
        'hi_con_ba_s1',
        1,
        sampleCurve([
          { x: 66, y: 48 },
          { x: 48, y: 42 },
          { x: 38, y: 56 },
          { x: 50, y: 68 },
          { x: 66, y: 64 },
        ]),
        'counter_clockwise',
        'Left closed circular loop'
      ),
      createStroke(
        'hi_con_ba_s2',
        2,
        sampleLine({ x: 46, y: 46 }, { x: 60, y: 64 }),
        'forward',
        'Diagonal interior slash'
      ),
      createStroke(
        'hi_con_ba_s3',
        3,
        sampleLine({ x: 66, y: 24 }, { x: 66, y: 86 }),
        'down',
        'Right vertical stem'
      ),
      createStroke(
        'hi_con_ba_s4',
        4,
        sampleLine({ x: 26, y: 24 }, { x: 78, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 4,
    metadata: { phonetic: 'Ba', hasShirorekha: true },
  },

  // भ (Bha)
  'भ': {
    character: 'भ',
    language: 'hi',
    category: 'consonant',
    strokes: [
      createStroke(
        'hi_con_bha_s1',
        1,
        sampleCurve([
          { x: 36, y: 34 },
          { x: 44, y: 30 },
          { x: 36, y: 42 },
          { x: 38, y: 64 },
          { x: 48, y: 72 },
          { x: 66, y: 72 },
        ]),
        'forward',
        'Top loop into knot and horizontal bar'
      ),
      createStroke(
        'hi_con_bha_s2',
        2,
        sampleLine({ x: 66, y: 24 }, { x: 66, y: 86 }),
        'down',
        'Right vertical stem'
      ),
      createStroke(
        'hi_con_bha_s3',
        3,
        sampleLine({ x: 54, y: 24 }, { x: 78, y: 24 }),
        'left_to_right',
        'Top headline over stem'
      ),
    ],
    totalStrokes: 3,
    metadata: { phonetic: 'Bha', hasShirorekha: true },
  },

  // म (Ma)
  'म': {
    character: 'म',
    language: 'hi',
    category: 'consonant',
    strokes: [
      createStroke(
        'hi_con_ma_s1',
        1,
        sampleCurve([
          { x: 36, y: 24 },
          { x: 36, y: 62 },
          { x: 38, y: 72 },
          { x: 48, y: 74 },
          { x: 66, y: 74 },
        ]),
        'forward',
        'Left stem with bottom knot into bar'
      ),
      createStroke(
        'hi_con_ma_s2',
        2,
        sampleLine({ x: 66, y: 24 }, { x: 66, y: 86 }),
        'down',
        'Right vertical stem'
      ),
      createStroke(
        'hi_con_ma_s3',
        3,
        sampleLine({ x: 26, y: 24 }, { x: 78, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 3,
    metadata: { phonetic: 'Ma', hasShirorekha: true },
  },

  // य (Ya)
  'य': {
    character: 'य',
    language: 'hi',
    category: 'consonant',
    strokes: [
      createStroke(
        'hi_con_ya_s1',
        1,
        sampleCurve([
          { x: 34, y: 34 },
          { x: 48, y: 42 },
          { x: 36, y: 58 },
          { x: 48, y: 76 },
          { x: 66, y: 74 },
        ]),
        'forward',
        'Upper inward curve and lower cup'
      ),
      createStroke(
        'hi_con_ya_s2',
        2,
        sampleLine({ x: 66, y: 24 }, { x: 66, y: 86 }),
        'down',
        'Right vertical stem'
      ),
      createStroke(
        'hi_con_ya_s3',
        3,
        sampleLine({ x: 26, y: 24 }, { x: 78, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 3,
    metadata: { phonetic: 'Ya', hasShirorekha: true },
  },

  // र (Ra)
  'र': {
    character: 'र',
    language: 'hi',
    category: 'consonant',
    strokes: [
      createStroke(
        'hi_con_ra_s1',
        1,
        sampleCurve([
          { x: 36, y: 32 },
          { x: 54, y: 28 },
          { x: 62, y: 42 },
          { x: 46, y: 56 },
          { x: 36, y: 82 },
        ]),
        'forward',
        'Top arch into downward slant tail'
      ),
      createStroke(
        'hi_con_ra_s2',
        2,
        sampleLine({ x: 24, y: 24 }, { x: 72, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 2,
    metadata: { phonetic: 'Ra', hasShirorekha: true },
  },

  // ल (La)
  'ल': {
    character: 'ल',
    language: 'hi',
    category: 'consonant',
    strokes: [
      createStroke(
        'hi_con_la_s1',
        1,
        sampleCurve([
          { x: 48, y: 54 },
          { x: 38, y: 68 },
          { x: 32, y: 64 },
        ]),
        'forward',
        'Left downward branch'
      ),
      createStroke(
        'hi_con_la_s2',
        2,
        sampleCurve([
          { x: 48, y: 54 },
          { x: 56, y: 48 },
          { x: 66, y: 58 },
        ]),
        'forward',
        'Connecting arch'
      ),
      createStroke(
        'hi_con_la_s3',
        3,
        sampleLine({ x: 66, y: 24 }, { x: 66, y: 86 }),
        'down',
        'Right vertical stem'
      ),
      createStroke(
        'hi_con_la_s4',
        4,
        sampleLine({ x: 24, y: 24 }, { x: 78, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 4,
    metadata: { phonetic: 'La', hasShirorekha: true },
  },

  // व (Va)
  'व': {
    character: 'व',
    language: 'hi',
    category: 'consonant',
    strokes: [
      createStroke(
        'hi_con_va_s1',
        1,
        sampleCurve([
          { x: 66, y: 48 },
          { x: 46, y: 42 },
          { x: 36, y: 56 },
          { x: 48, y: 68 },
          { x: 66, y: 64 },
        ]),
        'counter_clockwise',
        'Left oval loop'
      ),
      createStroke(
        'hi_con_va_s2',
        2,
        sampleLine({ x: 66, y: 24 }, { x: 66, y: 86 }),
        'down',
        'Right vertical stem'
      ),
      createStroke(
        'hi_con_va_s3',
        3,
        sampleLine({ x: 26, y: 24 }, { x: 78, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 3,
    metadata: { phonetic: 'Va', hasShirorekha: true },
  },

  // श (Sha palatal)
  'श': {
    character: 'श',
    language: 'hi',
    category: 'consonant',
    strokes: [
      createStroke(
        'hi_con_sha_s1',
        1,
        sampleCurve([
          { x: 36, y: 34 },
          { x: 48, y: 30 },
          { x: 42, y: 54 },
          { x: 56, y: 76 },
        ]),
        'forward',
        'Top loop into knot and tail'
      ),
      createStroke(
        'hi_con_sha_s2',
        2,
        sampleLine({ x: 66, y: 24 }, { x: 66, y: 86 }),
        'down',
        'Right vertical stem'
      ),
      createStroke(
        'hi_con_sha_s3',
        3,
        sampleLine({ x: 26, y: 24 }, { x: 78, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 3,
    metadata: { phonetic: 'Sha', hasShirorekha: true },
  },

  // ष (Ssa retroflex)
  'ष': {
    character: 'ष',
    language: 'hi',
    category: 'consonant',
    strokes: [
      createStroke(
        'hi_con_ssa_s1',
        1,
        sampleCurve([
          { x: 36, y: 24 },
          { x: 36, y: 60 },
          { x: 48, y: 76 },
          { x: 66, y: 64 },
        ]),
        'forward',
        'Left U-cup'
      ),
      createStroke(
        'hi_con_ssa_s2',
        2,
        sampleLine({ x: 38, y: 38 }, { x: 64, y: 68 }),
        'forward',
        'Diagonal slash'
      ),
      createStroke(
        'hi_con_ssa_s3',
        3,
        sampleLine({ x: 66, y: 24 }, { x: 66, y: 86 }),
        'down',
        'Right vertical stem'
      ),
      createStroke(
        'hi_con_ssa_s4',
        4,
        sampleLine({ x: 26, y: 24 }, { x: 78, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 4,
    metadata: { phonetic: 'Ssa', hasShirorekha: true },
  },

  // स (Sa dental)
  'स': {
    character: 'स',
    language: 'hi',
    category: 'consonant',
    strokes: [
      createStroke(
        'hi_con_sa_s1',
        1,
        sampleCurve([
          { x: 34, y: 34 },
          { x: 50, y: 28 },
          { x: 58, y: 42 },
          { x: 44, y: 54 },
          { x: 36, y: 76 },
        ]),
        'forward',
        'Left curve with tail'
      ),
      createStroke(
        'hi_con_sa_s2',
        2,
        sampleLine({ x: 46, y: 54 }, { x: 66, y: 54 }),
        'left_to_right',
        'Middle connector'
      ),
      createStroke(
        'hi_con_sa_s3',
        3,
        sampleLine({ x: 66, y: 24 }, { x: 66, y: 86 }),
        'down',
        'Right vertical stem'
      ),
      createStroke(
        'hi_con_sa_s4',
        4,
        sampleLine({ x: 24, y: 24 }, { x: 78, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 4,
    metadata: { phonetic: 'Sa', hasShirorekha: true },
  },

  // ह (Ha)
  'ह': {
    character: 'ह',
    language: 'hi',
    category: 'consonant',
    strokes: [
      createStroke(
        'hi_con_ha_s1',
        1,
        sampleLine({ x: 48, y: 24 }, { x: 48, y: 32 }),
        'down',
        'Top short anchor'
      ),
      createStroke(
        'hi_con_ha_s2',
        2,
        sampleCurve([
          { x: 48, y: 32 },
          { x: 36, y: 40 },
          { x: 52, y: 52 },
          { x: 36, y: 62 },
        ]),
        'forward',
        'Upper C-curve'
      ),
      createStroke(
        'hi_con_ha_s3',
        3,
        sampleCurve([
          { x: 42, y: 60 },
          { x: 56, y: 72 },
          { x: 44, y: 84 },
        ]),
        'forward',
        'Bottom C-curl'
      ),
      createStroke(
        'hi_con_ha_s4',
        4,
        sampleLine({ x: 28, y: 24 }, { x: 68, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 4,
    metadata: { phonetic: 'Ha', hasShirorekha: true },
  },

  // क्ष (Ksha)
  'क्ष': {
    character: 'क्ष',
    language: 'hi',
    category: 'conjunct',
    strokes: [
      createStroke(
        'hi_con_ksha_s1',
        1,
        sampleCurve([
          { x: 66, y: 44 },
          { x: 48, y: 34 },
          { x: 36, y: 46 },
          { x: 48, y: 52 },
          { x: 38, y: 66 },
          { x: 48, y: 80 },
          { x: 64, y: 76 },
        ]),
        'forward',
        'Left loop into knot and tail'
      ),
      createStroke(
        'hi_con_ksha_s2',
        2,
        sampleLine({ x: 66, y: 24 }, { x: 66, y: 86 }),
        'down',
        'Right vertical stem'
      ),
      createStroke(
        'hi_con_ksha_s3',
        3,
        sampleLine({ x: 40, y: 24 }, { x: 78, y: 24 }),
        'left_to_right',
        'Top headline over stem'
      ),
    ],
    totalStrokes: 3,
    metadata: { phonetic: 'Ksha', hasShirorekha: true },
  },

  // त्र (Tra)
  'त्र': {
    character: 'त्र',
    language: 'hi',
    category: 'conjunct',
    strokes: [
      createStroke(
        'hi_con_tra_s1',
        1,
        sampleLine({ x: 36, y: 40 }, { x: 54, y: 52 }),
        'forward',
        'Upper slant'
      ),
      createStroke(
        'hi_con_tra_s2',
        2,
        sampleLine({ x: 54, y: 52 }, { x: 36, y: 74 }),
        'forward',
        'Lower slant'
      ),
      createStroke(
        'hi_con_tra_s3',
        3,
        sampleLine({ x: 54, y: 24 }, { x: 54, y: 86 }),
        'down',
        'Vertical stem'
      ),
      createStroke(
        'hi_con_tra_s4',
        4,
        sampleLine({ x: 28, y: 24 }, { x: 72, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 4,
    metadata: { phonetic: 'Tra', hasShirorekha: true },
  },

  // ज्ञ (Gnya)
  'ज्ञ': {
    character: 'ज्ञ',
    language: 'hi',
    category: 'conjunct',
    strokes: [
      createStroke(
        'hi_con_gnya_s1',
        1,
        sampleCurve([
          { x: 66, y: 48 },
          { x: 46, y: 48 },
          { x: 36, y: 60 },
          { x: 46, y: 74 },
          { x: 42, y: 78 },
          { x: 56, y: 84 },
        ]),
        'forward',
        'Left loop into knot and tail'
      ),
      createStroke(
        'hi_con_gnya_s2',
        2,
        sampleLine({ x: 66, y: 24 }, { x: 66, y: 86 }),
        'down',
        'Right vertical stem'
      ),
      createStroke(
        'hi_con_gnya_s3',
        3,
        sampleLine({ x: 26, y: 24 }, { x: 78, y: 24 }),
        'left_to_right',
        'Top headline (Shirorekha)'
      ),
    ],
    totalStrokes: 3,
    metadata: { phonetic: 'Gnya', hasShirorekha: true },
  },
};

