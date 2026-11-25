import { CharacterStrokeDefinition } from '../types';
import { sampleCurve, sampleLine, makeLoop, createStroke } from '../strokeSampler';

/**
 * Authentic Gujarati Consonants (વ્યંજન: ક થી જ્ઞ)
 * Complete set of all 34 consonants + conjuncts (ક્ષ, જ્ઞ).
 * Mapped to standard Gujarat State Board (GCERT) primary school handwriting geometry.
 */
export const GUJARATI_CONSONANTS: Record<string, CharacterStrokeDefinition> = {
  // ક (Ka): Smooth S-curve with centered diagonal slash
  'ક': {
    character: 'ક',
    language: 'gu',
    category: 'consonant',
    strokes: [
      createStroke(
        'gu_con_ka_s1',
        1,
        sampleCurve([
          { x: 36, y: 36 },
          { x: 50, y: 28 },
          { x: 60, y: 38 },
          { x: 50, y: 52 },
          { x: 36, y: 66 },
          { x: 46, y: 80 },
          { x: 62, y: 78 },
        ]),
        'forward',
        'Main S-curve of Ka'
      ),
      createStroke(
        'gu_con_ka_s2',
        2,
        sampleLine({ x: 64, y: 44 }, { x: 34, y: 66 }),
        'forward',
        'Crossing diagonal slash'
      ),
    ],
    totalStrokes: 2,
    metadata: { phonetic: 'Ka' },
  },

  // ખ (Kha): Smooth Gujarati 2-like hook transitioning into horizontal base and vertical stem
  'ખ': {
    character: 'ખ',
    language: 'gu',
    category: 'consonant',
    strokes: [
      createStroke(
        'gu_con_kha_s1',
        1,
        sampleCurve([
          { x: 32, y: 40 },
          { x: 42, y: 28 },
          { x: 52, y: 34 },
          { x: 44, y: 48 },
          { x: 36, y: 60 },
          { x: 38, y: 74 },
          { x: 50, y: 80 },
          { x: 68, y: 76 },
        ]),
        'forward',
        'Smooth left 2-hook and horizontal base connecting to stem'
      ),
      createStroke(
        'gu_con_kha_s2',
        2,
        sampleLine({ x: 68, y: 24 }, { x: 68, y: 86 }),
        'down',
        'Right vertical stem'
      ),
    ],
    totalStrokes: 2,
    metadata: { phonetic: 'Kha' },
  },

  // ગ (Ga): Left inverted rounded arch and separate vertical stem
  'ગ': {
    character: 'ગ',
    language: 'gu',
    category: 'consonant',
    strokes: [
      createStroke(
        'gu_con_ga_s1',
        1,
        sampleCurve([
          { x: 32, y: 82 },
          { x: 34, y: 46 },
          { x: 46, y: 28 },
          { x: 58, y: 46 },
          { x: 58, y: 82 },
        ]),
        'forward',
        'Left rounded inverted-U arch'
      ),
      createStroke(
        'gu_con_ga_s2',
        2,
        sampleLine({ x: 72, y: 24 }, { x: 72, y: 86 }),
        'down',
        'Right vertical stem'
      ),
    ],
    totalStrokes: 2,
    metadata: { phonetic: 'Ga' },
  },

  // ઘ (Gha): Authentic double bowl with pronounced rightward upper curve and waist meeting full vertical stem
  'ઘ': {
    character: 'ઘ',
    language: 'gu',
    category: 'consonant',
    strokes: [
      createStroke(
        'gu_con_gha_s1',
        1,
        sampleCurve([
          { x: 34, y: 32 },
          { x: 50, y: 28 },
          { x: 58, y: 38 },
          { x: 44, y: 50 },
          { x: 34, y: 62 },
          { x: 42, y: 80 },
          { x: 56, y: 82 },
          { x: 68, y: 66 },
        ]),
        'forward',
        'Pronounced double bowl with waist meeting stem'
      ),
      createStroke(
        'gu_con_gha_s2',
        2,
        sampleLine({ x: 68, y: 24 }, { x: 68, y: 86 }),
        'down',
        'Right vertical stem'
      ),
    ],
    totalStrokes: 2,
    metadata: { phonetic: 'Gha' },
  },

  // ઙ (Nga): S-curve with right bindu dot
  'ઙ': {
    character: 'ઙ',
    language: 'gu',
    category: 'consonant',
    strokes: [
      createStroke(
        'gu_con_nga_s1',
        1,
        sampleCurve([
          { x: 42, y: 32 },
          { x: 54, y: 30 },
          { x: 44, y: 50 },
          { x: 34, y: 68 },
          { x: 46, y: 82 },
          { x: 58, y: 80 },
        ]),
        'forward',
        'S-curve body'
      ),
      createStroke(
        'gu_con_nga_s2',
        2,
        makeLoop(68, 52, 3.5, 3.5),
        'clockwise',
        'Right dot (bindu)'
      ),
    ],
    totalStrokes: 2,
    metadata: { phonetic: 'Nga' },
  },

  // ચ (Cha): Horizontal start, downward loop, and bottom cup to vertical stem
  'ચ': {
    character: 'ચ',
    language: 'gu',
    category: 'consonant',
    strokes: [
      createStroke(
        'gu_con_cha_s1',
        1,
        sampleCurve([
          { x: 32, y: 44 },
          { x: 48, y: 44 },
          { x: 38, y: 56 },
          { x: 34, y: 70 },
          { x: 46, y: 82 },
          { x: 64, y: 76 },
        ]),
        'forward',
        'Left horizontal bar, loop, and under-cup'
      ),
      createStroke(
        'gu_con_cha_s2',
        2,
        sampleLine({ x: 68, y: 24 }, { x: 68, y: 86 }),
        'down',
        'Right vertical stem'
      ),
    ],
    totalStrokes: 2,
    metadata: { phonetic: 'Cha' },
  },

  // છ (Chha): Continuous double bowl terminating in top interior knot
  'છ': {
    character: 'છ',
    language: 'gu',
    category: 'consonant',
    strokes: [
      createStroke(
        'gu_con_chha_s1',
        1,
        sampleCurve([
          { x: 34, y: 32 },
          { x: 50, y: 28 },
          { x: 58, y: 38 },
          { x: 44, y: 50 },
          { x: 34, y: 62 },
          { x: 46, y: 82 },
          { x: 62, y: 80 },
          { x: 66, y: 66 },
          { x: 58, y: 52 },
          { x: 48, y: 56 },
          { x: 54, y: 64 },
        ]),
        'forward',
        'Continuous double bowl into top knot'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Chha' },
  },

  // જ (Ja): Authentic Gujarati open curl
  'જ': {
    character: 'જ',
    language: 'gu',
    category: 'consonant',
    strokes: [
      createStroke(
        'gu_con_ja_s1',
        1,
        sampleCurve([
          { x: 34, y: 36 },
          { x: 48, y: 32 },
          { x: 54, y: 42 },
          { x: 42, y: 54 },
          { x: 34, y: 68 },
          { x: 46, y: 82 },
          { x: 64, y: 78 },
          { x: 68, y: 62 },
        ]),
        'forward',
        'Authentic Gujarati open curl and rightward flick'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Ja' },
  },

  // ઝ (Zha): Left Da-base with horizontal connector and vertical stem
  'ઝ': {
    character: 'ઝ',
    language: 'gu',
    category: 'consonant',
    strokes: [
      createStroke(
        'gu_con_zha_s1',
        1,
        sampleCurve([
          { x: 38, y: 34 },
          { x: 50, y: 30 },
          { x: 44, y: 46 },
          { x: 34, y: 60 },
          { x: 44, y: 74 },
          { x: 54, y: 72 },
        ]),
        'forward',
        'Left S-curve'
      ),
      createStroke(
        'gu_con_zha_s2',
        2,
        sampleLine({ x: 46, y: 54 }, { x: 68, y: 54 }),
        'left_to_right',
        'Horizontal connector'
      ),
      createStroke(
        'gu_con_zha_s3',
        3,
        sampleLine({ x: 68, y: 24 }, { x: 68, y: 86 }),
        'down',
        'Right vertical stem'
      ),
    ],
    totalStrokes: 3,
    metadata: { phonetic: 'Zha' },
  },

  // ઞ (Nya)
  'ઞ': {
    character: 'ઞ',
    language: 'gu',
    category: 'consonant',
    strokes: [
      createStroke(
        'gu_con_nya_s1',
        1,
        sampleCurve([
          { x: 52, y: 34 },
          { x: 38, y: 44 },
          { x: 46, y: 58 },
          { x: 36, y: 72 },
          { x: 48, y: 82 },
        ]),
        'forward',
        'Left curved body'
      ),
      createStroke(
        'gu_con_nya_s2',
        2,
        sampleLine({ x: 46, y: 58 }, { x: 68, y: 58 }),
        'left_to_right',
        'Horizontal connector'
      ),
      createStroke(
        'gu_con_nya_s3',
        3,
        sampleLine({ x: 68, y: 24 }, { x: 68, y: 86 }),
        'down',
        'Right vertical stem'
      ),
    ],
    totalStrokes: 3,
    metadata: { phonetic: 'Nya' },
  },

  // ટ (Ta): Right-facing C-bowl
  'ટ': {
    character: 'ટ',
    language: 'gu',
    category: 'consonant',
    strokes: [
      createStroke(
        'gu_con_ta_s1',
        1,
        sampleCurve([
          { x: 64, y: 32 },
          { x: 44, y: 28 },
          { x: 34, y: 48 },
          { x: 38, y: 68 },
          { x: 52, y: 82 },
          { x: 66, y: 78 },
        ]),
        'forward',
        'Rounded C-curve facing right'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Ta' },
  },

  // ઠ (Tha): Closed circular loop
  'ઠ': {
    character: 'ઠ',
    language: 'gu',
    category: 'consonant',
    strokes: [
      createStroke(
        'gu_con_tha_s1',
        1,
        makeLoop(50, 54, 18, 24),
        'counter_clockwise',
        'Closed circular loop'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Tha' },
  },

  // ડ (Da): Standard handwritten S-curve
  'ડ': {
    character: 'ડ',
    language: 'gu',
    category: 'consonant',
    strokes: [
      createStroke(
        'gu_con_da_s1',
        1,
        sampleCurve([
          { x: 38, y: 34 },
          { x: 54, y: 28 },
          { x: 62, y: 40 },
          { x: 50, y: 52 },
          { x: 36, y: 66 },
          { x: 44, y: 82 },
          { x: 62, y: 80 },
        ]),
        'forward',
        'Smooth S-curve'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Da' },
  },

  // ઢ (Dha): C-curve with interior loop
  'ઢ': {
    character: 'ઢ',
    language: 'gu',
    category: 'consonant',
    strokes: [
      createStroke(
        'gu_con_dha_s1',
        1,
        sampleCurve([
          { x: 64, y: 32 },
          { x: 44, y: 28 },
          { x: 34, y: 48 },
          { x: 38, y: 68 },
          { x: 50, y: 80 },
          { x: 64, y: 76 },
          { x: 62, y: 60 },
          { x: 50, y: 60 },
        ]),
        'forward',
        'C-curve with interior knot'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Dha' },
  },

  // ણ (Nna): Left loop body flowing into horizontal base and vertical stem
  'ણ': {
    character: 'ણ',
    language: 'gu',
    category: 'consonant',
    strokes: [
      createStroke(
        'gu_con_nna_s1',
        1,
        sampleCurve([
          { x: 42, y: 36 },
          { x: 34, y: 28 },
          { x: 44, y: 24 },
          { x: 52, y: 32 },
          { x: 42, y: 46 },
          { x: 36, y: 64 },
          { x: 46, y: 80 },
          { x: 68, y: 76 },
        ]),
        'forward',
        'Left loop and sweeping base'
      ),
      createStroke(
        'gu_con_nna_s2',
        2,
        sampleLine({ x: 68, y: 24 }, { x: 68, y: 86 }),
        'down',
        'Right vertical stem'
      ),
    ],
    totalStrokes: 2,
    metadata: { phonetic: 'Nna' },
  },

  // ત (Ta dental): Arch branching from vertical stem
  'ત': {
    character: 'ત',
    language: 'gu',
    category: 'consonant',
    strokes: [
      createStroke(
        'gu_con_dental_ta_s1',
        1,
        sampleCurve([
          { x: 68, y: 52 },
          { x: 54, y: 44 },
          { x: 36, y: 54 },
          { x: 36, y: 82 },
        ]),
        'forward',
        'Branching leftward arch'
      ),
      createStroke(
        'gu_con_dental_ta_s2',
        2,
        sampleLine({ x: 68, y: 24 }, { x: 68, y: 86 }),
        'down',
        'Right vertical stem'
      ),
    ],
    totalStrokes: 2,
    metadata: { phonetic: 'Ta' },
  },

  // થ (Tha dental): Top loop into left bowl and vertical stem
  'થ': {
    character: 'થ',
    language: 'gu',
    category: 'consonant',
    strokes: [
      createStroke(
        'gu_con_dental_tha_s1',
        1,
        sampleCurve([
          { x: 38, y: 36 },
          { x: 32, y: 28 },
          { x: 42, y: 24 },
          { x: 48, y: 32 },
          { x: 40, y: 44 },
          { x: 34, y: 62 },
          { x: 46, y: 80 },
          { x: 68, y: 76 },
        ]),
        'forward',
        'Top loop into curved body'
      ),
      createStroke(
        'gu_con_dental_tha_s2',
        2,
        sampleLine({ x: 68, y: 24 }, { x: 68, y: 86 }),
        'down',
        'Right vertical stem'
      ),
    ],
    totalStrokes: 2,
    metadata: { phonetic: 'Tha' },
  },

  // દ (Da dental): Inward curve and tail
  'દ': {
    character: 'દ',
    language: 'gu',
    category: 'consonant',
    strokes: [
      createStroke(
        'gu_con_dental_da_s1',
        1,
        sampleCurve([
          { x: 36, y: 32 },
          { x: 52, y: 28 },
          { x: 58, y: 40 },
          { x: 46, y: 50 },
          { x: 56, y: 58 },
          { x: 50, y: 72 },
          { x: 38, y: 84 },
        ]),
        'forward',
        'Double rightward curve and tail'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Da' },
  },

  // ધ (Dha dental): Left double bowl with loop and lowered vertical stem
  'ધ': {
    character: 'ધ',
    language: 'gu',
    category: 'consonant',
    strokes: [
      createStroke(
        'gu_con_dental_dha_s1',
        1,
        sampleCurve([
          { x: 38, y: 38 },
          { x: 32, y: 32 },
          { x: 40, y: 28 },
          { x: 46, y: 36 },
          { x: 38, y: 42 },
          { x: 56, y: 44 },
          { x: 44, y: 52 },
          { x: 34, y: 66 },
          { x: 44, y: 82 },
          { x: 58, y: 82 },
          { x: 68, y: 68 },
        ]),
        'forward',
        'Left double bowl with knot'
      ),
      createStroke(
        'gu_con_dental_dha_s2',
        2,
        sampleLine({ x: 68, y: 40 }, { x: 68, y: 86 }),
        'down',
        'Lowered right vertical stem'
      ),
    ],
    totalStrokes: 2,
    metadata: { phonetic: 'Dha' },
  },

  // ન (Na): Left loop and horizontal bar into vertical stem
  'ન': {
    character: 'ન',
    language: 'gu',
    category: 'consonant',
    strokes: [
      createStroke(
        'gu_con_na_s1',
        1,
        sampleCurve([
          { x: 44, y: 60 },
          { x: 36, y: 52 },
          { x: 32, y: 60 },
          { x: 40, y: 68 },
          { x: 48, y: 60 },
          { x: 68, y: 60 },
        ]),
        'forward',
        'Left loop into horizontal bar'
      ),
      createStroke(
        'gu_con_na_s2',
        2,
        sampleLine({ x: 68, y: 24 }, { x: 68, y: 86 }),
        'down',
        'Right vertical stem'
      ),
    ],
    totalStrokes: 2,
    metadata: { phonetic: 'Na' },
  },

  // પ (Pa): Left U-cup and right vertical stem
  'પ': {
    character: 'પ',
    language: 'gu',
    category: 'consonant',
    strokes: [
      createStroke(
        'gu_con_pa_s1',
        1,
        sampleCurve([
          { x: 34, y: 34 },
          { x: 34, y: 62 },
          { x: 48, y: 78 },
          { x: 66, y: 64 },
        ]),
        'forward',
        'Left U-cup'
      ),
      createStroke(
        'gu_con_pa_s2',
        2,
        sampleLine({ x: 68, y: 24 }, { x: 68, y: 86 }),
        'down',
        'Right vertical stem'
      ),
    ],
    totalStrokes: 2,
    metadata: { phonetic: 'Pa' },
  },

  // ફ (Pha): S-curve with crossing diagonal slash
  'ફ': {
    character: 'ફ',
    language: 'gu',
    category: 'consonant',
    strokes: [
      createStroke(
        'gu_con_pha_s1',
        1,
        sampleCurve([
          { x: 36, y: 34 },
          { x: 54, y: 28 },
          { x: 62, y: 40 },
          { x: 48, y: 52 },
          { x: 36, y: 66 },
          { x: 44, y: 82 },
          { x: 60, y: 80 },
        ]),
        'forward',
        'S-curve base'
      ),
      createStroke(
        'gu_con_pha_s2',
        2,
        sampleLine({ x: 64, y: 42 }, { x: 32, y: 68 }),
        'forward',
        'Diagonal slash'
      ),
    ],
    totalStrokes: 2,
    metadata: { phonetic: 'Pha' },
  },

  // બ (Ba): Left loop and bottom traverse into vertical stem
  'બ': {
    character: 'બ',
    language: 'gu',
    category: 'consonant',
    strokes: [
      createStroke(
        'gu_con_ba_s1',
        1,
        sampleCurve([
          { x: 36, y: 38 },
          { x: 32, y: 30 },
          { x: 42, y: 26 },
          { x: 50, y: 34 },
          { x: 42, y: 46 },
          { x: 36, y: 62 },
          { x: 46, y: 78 },
          { x: 68, y: 76 },
        ]),
        'forward',
        'Left loop and horizontal base'
      ),
      createStroke(
        'gu_con_ba_s2',
        2,
        sampleLine({ x: 68, y: 24 }, { x: 68, y: 86 }),
        'down',
        'Right vertical stem'
      ),
    ],
    totalStrokes: 2,
    metadata: { phonetic: 'Ba' },
  },

  // ભ (Bha): Top loop, vertical drop, bottom knot, connector, and stem
  'ભ': {
    character: 'ભ',
    language: 'gu',
    category: 'consonant',
    strokes: [
      createStroke(
        'gu_con_bha_s1',
        1,
        sampleCurve([
          { x: 38, y: 36 },
          { x: 32, y: 28 },
          { x: 42, y: 24 },
          { x: 48, y: 32 },
          { x: 40, y: 42 },
          { x: 36, y: 64 },
          { x: 44, y: 78 },
          { x: 68, y: 76 },
        ]),
        'forward',
        'Top loop into knot and bottom bar'
      ),
      createStroke(
        'gu_con_bha_s2',
        2,
        sampleLine({ x: 68, y: 24 }, { x: 68, y: 86 }),
        'down',
        'Right vertical stem'
      ),
    ],
    totalStrokes: 2,
    metadata: { phonetic: 'Bha' },
  },

  // મ (Ma): Vertical drop, bottom knot, horizontal bar, and stem
  'મ': {
    character: 'મ',
    language: 'gu',
    category: 'consonant',
    strokes: [
      createStroke(
        'gu_con_ma_s1',
        1,
        sampleCurve([
          { x: 36, y: 30 },
          { x: 36, y: 66 },
          { x: 44, y: 78 },
          { x: 68, y: 76 },
        ]),
        'forward',
        'Left drop and bottom bar'
      ),
      createStroke(
        'gu_con_ma_s2',
        2,
        sampleLine({ x: 68, y: 24 }, { x: 68, y: 86 }),
        'down',
        'Right vertical stem'
      ),
    ],
    totalStrokes: 2,
    metadata: { phonetic: 'Ma' },
  },

  // ય (Ya): Left inward curve into lower cup and vertical stem
  'ય': {
    character: 'ય',
    language: 'gu',
    category: 'consonant',
    strokes: [
      createStroke(
        'gu_con_ya_s1',
        1,
        sampleCurve([
          { x: 34, y: 36 },
          { x: 46, y: 42 },
          { x: 38, y: 56 },
          { x: 48, y: 78 },
          { x: 68, y: 76 },
        ]),
        'forward',
        'Inward upper curve into lower cup'
      ),
      createStroke(
        'gu_con_ya_s2',
        2,
        sampleLine({ x: 68, y: 24 }, { x: 68, y: 86 }),
        'down',
        'Right vertical stem'
      ),
    ],
    totalStrokes: 2,
    metadata: { phonetic: 'Ya' },
  },

  // ર (Ra): Single continuous 2-like curve with sweeping tail
  'ર': {
    character: 'ર',
    language: 'gu',
    category: 'consonant',
    strokes: [
      createStroke(
        'gu_con_ra_s1',
        1,
        sampleCurve([
          { x: 36, y: 34 },
          { x: 52, y: 26 },
          { x: 64, y: 36 },
          { x: 52, y: 50 },
          { x: 38, y: 66 },
          { x: 52, y: 82 },
          { x: 68, y: 80 },
        ]),
        'forward',
        'Single continuous 2-like curve'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Ra' },
  },

  // લ (La): Double arch connected to vertical stem
  'લ': {
    character: 'લ',
    language: 'gu',
    category: 'consonant',
    strokes: [
      createStroke(
        'gu_con_la_s1',
        1,
        sampleCurve([
          { x: 36, y: 38 },
          { x: 46, y: 30 },
          { x: 52, y: 44 },
          { x: 42, y: 58 },
          { x: 52, y: 78 },
          { x: 68, y: 76 },
        ]),
        'forward',
        'Left double arch'
      ),
      createStroke(
        'gu_con_la_s2',
        2,
        sampleLine({ x: 68, y: 24 }, { x: 68, y: 86 }),
        'down',
        'Right vertical stem'
      ),
    ],
    totalStrokes: 2,
    metadata: { phonetic: 'La' },
  },

  // વ (Va): Left rounded oval loop and vertical stem
  'વ': {
    character: 'વ',
    language: 'gu',
    category: 'consonant',
    strokes: [
      createStroke(
        'gu_con_va_s1',
        1,
        sampleCurve([
          { x: 68, y: 50 },
          { x: 48, y: 38 },
          { x: 34, y: 52 },
          { x: 44, y: 72 },
          { x: 68, y: 64 },
        ]),
        'forward',
        'Left oval loop'
      ),
      createStroke(
        'gu_con_va_s2',
        2,
        sampleLine({ x: 68, y: 24 }, { x: 68, y: 86 }),
        'down',
        'Right vertical stem'
      ),
    ],
    totalStrokes: 2,
    metadata: { phonetic: 'Va' },
  },

  // શ (Sha palatal): Top loop, drop, knot, base, and stem
  'શ': {
    character: 'શ',
    language: 'gu',
    category: 'consonant',
    strokes: [
      createStroke(
        'gu_con_sha_s1',
        1,
        sampleCurve([
          { x: 40, y: 36 },
          { x: 32, y: 28 },
          { x: 42, y: 24 },
          { x: 52, y: 30 },
          { x: 44, y: 42 },
          { x: 36, y: 58 },
          { x: 40, y: 74 },
          { x: 48, y: 80 },
          { x: 66, y: 76 },
        ]),
        'forward',
        'Top loop into knot and base'
      ),
      createStroke(
        'gu_con_sha_s2',
        2,
        sampleLine({ x: 72, y: 24 }, { x: 72, y: 86 }),
        'down',
        'Right vertical stem'
      ),
    ],
    totalStrokes: 2,
    metadata: { phonetic: 'Sha' },
  },

  // ષ (Ssa retroflex): U-cup with diagonal slash and vertical stem
  'ષ': {
    character: 'ષ',
    language: 'gu',
    category: 'consonant',
    strokes: [
      createStroke(
        'gu_con_ssa_s1',
        1,
        sampleCurve([
          { x: 34, y: 34 },
          { x: 34, y: 62 },
          { x: 48, y: 78 },
          { x: 66, y: 64 },
        ]),
        'forward',
        'U-shaped body'
      ),
      createStroke(
        'gu_con_ssa_s2',
        2,
        sampleLine({ x: 38, y: 44 }, { x: 64, y: 70 }),
        'forward',
        'Diagonal slash'
      ),
      createStroke(
        'gu_con_ssa_s3',
        3,
        sampleLine({ x: 68, y: 24 }, { x: 68, y: 86 }),
        'down',
        'Right vertical stem'
      ),
    ],
    totalStrokes: 3,
    metadata: { phonetic: 'Ssa' },
  },

  // સ (Sa dental): Left 2-curve, horizontal connector, and vertical stem
  'સ': {
    character: 'સ',
    language: 'gu',
    category: 'consonant',
    strokes: [
      createStroke(
        'gu_con_sa_s1',
        1,
        sampleCurve([
          { x: 34, y: 34 },
          { x: 48, y: 26 },
          { x: 58, y: 36 },
          { x: 48, y: 50 },
          { x: 36, y: 66 },
          { x: 48, y: 80 },
          { x: 62, y: 78 },
        ]),
        'forward',
        'Left 2-curve'
      ),
      createStroke(
        'gu_con_sa_s2',
        2,
        sampleLine({ x: 48, y: 54 }, { x: 70, y: 54 }),
        'left_to_right',
        'Middle horizontal connector'
      ),
      createStroke(
        'gu_con_sa_s3',
        3,
        sampleLine({ x: 70, y: 24 }, { x: 70, y: 86 }),
        'down',
        'Right vertical stem'
      ),
    ],
    totalStrokes: 3,
    metadata: { phonetic: 'Sa' },
  },

  // હ (Ha): S-curve with bottom looping hook
  'હ': {
    character: 'હ',
    language: 'gu',
    category: 'consonant',
    strokes: [
      createStroke(
        'gu_con_ha_s1',
        1,
        sampleCurve([
          { x: 36, y: 32 },
          { x: 54, y: 28 },
          { x: 42, y: 46 },
          { x: 56, y: 58 },
          { x: 44, y: 70 },
          { x: 54, y: 82 },
          { x: 68, y: 78 },
        ]),
        'forward',
        'S-curve with bottom hook'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Ha' },
  },

  // ળ (Lla): Continuous figure-8 double loop
  'ળ': {
    character: 'ળ',
    language: 'gu',
    category: 'consonant',
    strokes: [
      createStroke(
        'gu_con_lla_s1',
        1,
        sampleCurve([
          { x: 34, y: 40 },
          { x: 48, y: 28 },
          { x: 58, y: 40 },
          { x: 46, y: 56 },
          { x: 34, y: 72 },
          { x: 50, y: 84 },
          { x: 66, y: 70 },
          { x: 66, y: 38 },
        ]),
        'forward',
        'Continuous figure-8 double loop'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Lla' },
  },

  // ક્ષ (Ksha): Top loop, spiral knot, and baseline flick into vertical stem
  'ક્ષ': {
    character: 'ક્ષ',
    language: 'gu',
    category: 'conjunct',
    strokes: [
      createStroke(
        'gu_con_ksha_s1',
        1,
        sampleCurve([
          { x: 64, y: 40 },
          { x: 48, y: 30 },
          { x: 36, y: 40 },
          { x: 46, y: 52 },
          { x: 58, y: 60 },
          { x: 44, y: 74 },
          { x: 36, y: 84 },
          { x: 48, y: 84 },
          { x: 62, y: 76 },
        ]),
        'forward',
        'Top loop into spiral and bottom flick'
      ),
      createStroke(
        'gu_con_ksha_s2',
        2,
        sampleLine({ x: 68, y: 24 }, { x: 68, y: 86 }),
        'down',
        'Right vertical stem'
      ),
    ],
    totalStrokes: 2,
    metadata: { phonetic: 'Ksha' },
  },

  // જ્ઞ (Gnya): Knot, horizontal bar, bottom loop into vertical stem
  'જ્ઞ': {
    character: 'જ્ઞ',
    language: 'gu',
    category: 'conjunct',
    strokes: [
      createStroke(
        'gu_con_gnya_s1',
        1,
        sampleCurve([
          { x: 36, y: 42 },
          { x: 46, y: 34 },
          { x: 36, y: 48 },
          { x: 48, y: 54 },
          { x: 36, y: 68 },
          { x: 50, y: 82 },
          { x: 64, y: 76 },
        ]),
        'forward',
        'Left knot into bottom loop'
      ),
      createStroke(
        'gu_con_gnya_s2',
        2,
        sampleLine({ x: 68, y: 24 }, { x: 68, y: 86 }),
        'down',
        'Right vertical stem'
      ),
    ],
    totalStrokes: 2,
    metadata: { phonetic: 'Gnya' },
  },
};
