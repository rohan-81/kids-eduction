import { CharacterStrokeDefinition } from '../types';
import {
  sampleCurve,
  sampleLine,
  makeLoop,
  createStroke,
} from '../strokeSampler';

/**
 * Hindi / Devanagari Numbers: ० १ २ ३ ४ ५ ६ ७ ८ ९ १०
 *
 * Canvas: 0-100 (Standard handwriting baseline ~75-86, topline ~20-25)
 * Accurately shaped Devanagari paths strictly mirroring authentic printed glyphs.
 */

export const HINDI_NUMBERS: Record<string, CharacterStrokeDefinition> = {

  // ० - शून्य (Zero): Smooth oval loop drawn counter-clockwise from the top
  '०': {
    character: '०',
    language: 'hi',
    category: 'number',
    strokes: [
      createStroke(
        'hi_num_0_s1',
        1,
        makeLoop(50, 52, 18, 28, -Math.PI / 2, Math.PI * 2, 32),
        'counter_clockwise',
        'Draw an oval from top to bottom and close the loop'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Shunya', transliteration: '0' },
  },

  // १ - एक (One): Circular top head with graceful S-curved spine swinging left then right
  '१': {
    character: '१',
    language: 'hi',
    category: 'number',
    strokes: [
      createStroke(
        'hi_num_1_s1',
        1,
        sampleCurve([
          { x: 48, y: 40 },
          { x: 36, y: 36 },
          { x: 34, y: 26 },
          { x: 46, y: 18 },
          { x: 58, y: 24 },
          { x: 60, y: 36 },
          { x: 48, y: 44 },
          { x: 35, y: 52 },
          { x: 34, y: 64 },
          { x: 42, y: 74 },
          { x: 54, y: 80 },
          { x: 64, y: 84 },
        ], 16),
        'forward',
        'Top circular loop into graceful S-curved spine swinging left then right'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Ek', transliteration: '1' },
  },

  // २ - दो (Two): Top rounded arch, waist sweep into tight left rounded loop, and steep slanted tail
  '२': {
    character: '२',
    language: 'hi',
    category: 'number',
    strokes: [
      createStroke(
        'hi_num_2_s1',
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
    metadata: { phonetic: 'Do', transliteration: '2' },
  },

  // ३ - तीन (Three): Upper arch into center waist, lower rounded lobe, and downward tail
  '३': {
    character: '३',
    language: 'hi',
    category: 'number',
    strokes: [
      createStroke(
        'hi_num_3_s1',
        1,
        sampleCurve([
          { x: 34, y: 28 },
          { x: 50, y: 18 },
          { x: 68, y: 28 },
          { x: 50, y: 46 },
          { x: 70, y: 58 },
          { x: 66, y: 72 },
          { x: 52, y: 76 },
          { x: 42, y: 74 },
          { x: 50, y: 82 },
          { x: 58, y: 90 },
        ], 16),
        'forward',
        'Upper arch into center waist, lower rounded lobe, and downward tail'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Teen', transliteration: '3' },
  },

  // ४ - चार (Four): Ribbon loop with two upright horns: top-left swooping into bottom loop and rising to top-right
  '४': {
    character: '४',
    language: 'hi',
    category: 'number',
    strokes: [
      createStroke(
        'hi_num_4_s1',
        1,
        sampleCurve([
          { x: 34, y: 22 },
          { x: 40, y: 38 },
          { x: 46, y: 50 },
          { x: 38, y: 64 },
          { x: 42, y: 78 },
          { x: 50, y: 84 },
          { x: 58, y: 78 },
          { x: 62, y: 64 },
          { x: 54, y: 50 },
          { x: 60, y: 38 },
          { x: 66, y: 22 },
        ], 18),
        'forward',
        'Top-left horn swooping into bottom teardrop loop and rising to top-right horn'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Chaar', transliteration: '4' },
  },

  // ५ - पाँच (Five): U-shaped cup ascending to right stem and descending to baseline
  '५': {
    character: '५',
    language: 'hi',
    category: 'number',
    strokes: [
      createStroke(
        'hi_num_5_s1',
        1,
        sampleCurve([
          { x: 32, y: 24 },
          { x: 32, y: 46 },
          { x: 34, y: 58 },
          { x: 46, y: 66 },
          { x: 58, y: 60 },
          { x: 62, y: 46 },
          { x: 62, y: 34 },
          { x: 62, y: 56 },
          { x: 66, y: 72 },
          { x: 72, y: 86 },
        ], 18),
        'forward',
        'U-shaped cup ascending to right stem and descending to baseline'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Paanch', transliteration: '5' },
  },

  // ६ - छह (Six): Double left curve into bottom closed loop with descending tail
  '६': {
    character: '६',
    language: 'hi',
    category: 'number',
    strokes: [
      createStroke(
        'hi_num_6_s1',
        1,
        sampleCurve([
          { x: 64, y: 24 },
          { x: 48, y: 19 },
          { x: 34, y: 28 },
          { x: 42, y: 38 },
          { x: 50, y: 44 },
          { x: 38, y: 54 },
          { x: 34, y: 64 },
          { x: 44, y: 74 },
          { x: 58, y: 70 },
          { x: 62, y: 60 },
          { x: 54, y: 56 },
          { x: 46, y: 64 },
          { x: 54, y: 74 },
          { x: 66, y: 88 },
        ], 18),
        'forward',
        'Double left curve into bottom closed loop with descending tail'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Chhah', transliteration: '6' },
  },

  // ७ - सात (Seven): Authentic Devanagari 7 - top-right loop, right stem, bottom U-bowl rising into left vertical stem
  '७': {
    character: '७',
    language: 'hi',
    category: 'number',
    strokes: [
      createStroke(
        'hi_num_7_s1',
        1,
        sampleCurve([
          { x: 56, y: 38 },
          { x: 50, y: 30 },
          { x: 54, y: 22 },
          { x: 66, y: 22 },
          { x: 72, y: 32 },
          { x: 68, y: 44 },
          { x: 58, y: 44 },
          { x: 66, y: 56 },
          { x: 68, y: 70 },
          { x: 58, y: 84 },
          { x: 44, y: 84 },
          { x: 30, y: 74 },
          { x: 28, y: 50 },
          { x: 28, y: 22 },
        ], 18),
        'forward',
        'Top-right loop descending down right stem and curving around bottom into left vertical stem'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Saat', transliteration: '7' },
  },

  // ८ - आठ (Eight): Slanted diagonal sweep rounding along bottom into rightward terminal
  '८': {
    character: '८',
    language: 'hi',
    category: 'number',
    strokes: [
      createStroke(
        'hi_num_8_s1',
        1,
        sampleCurve([
          { x: 68, y: 22 },
          { x: 56, y: 36 },
          { x: 44, y: 50 },
          { x: 34, y: 64 },
          { x: 36, y: 76 },
          { x: 48, y: 86 },
          { x: 60, y: 82 },
          { x: 70, y: 74 },
        ], 16),
        'forward',
        'Slanted diagonal sweep rounding along bottom into rightward terminal'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Aath', transliteration: '8' },
  },

  // ९ - नौ (Nine): Top circular head into graceful down-right diagonal stem
  '९': {
    character: '९',
    language: 'hi',
    category: 'number',
    strokes: [
      createStroke(
        'hi_num_9_s1',
        1,
        sampleCurve([
          { x: 48, y: 42 },
          { x: 38, y: 38 },
          { x: 32, y: 28 },
          { x: 38, y: 18 },
          { x: 50, y: 18 },
          { x: 58, y: 26 },
          { x: 58, y: 38 },
          { x: 50, y: 46 },
          { x: 54, y: 56 },
          { x: 62, y: 70 },
          { x: 70, y: 84 },
        ], 18),
        'forward',
        'Top circular head into graceful down-right diagonal stem'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Nau', transliteration: '9' },
  },

  // १० - दस (Ten): Compound number combining १ and ०
  '१०': {
    character: '१०',
    language: 'hi',
    category: 'number',
    strokes: [
      // Digit १ in left half
      createStroke(
        'hi_num_10_s1',
        1,
        sampleCurve([
          { x: 32, y: 40 },
          { x: 24, y: 36 },
          { x: 22, y: 26 },
          { x: 30, y: 18 },
          { x: 38, y: 24 },
          { x: 40, y: 36 },
          { x: 32, y: 44 },
          { x: 24, y: 52 },
          { x: 24, y: 64 },
          { x: 30, y: 74 },
          { x: 38, y: 80 },
          { x: 44, y: 84 },
        ], 14),
        'forward',
        'Digit 1 in compound 10'
      ),
      // Digit ० in right half
      createStroke(
        'hi_num_10_s2',
        2,
        makeLoop(72, 52, 14, 28, -Math.PI / 2, Math.PI * 2, 28),
        'counter_clockwise',
        'Digit 0 in compound 10'
      ),
    ],
    totalStrokes: 2,
    metadata: { phonetic: 'Dus', transliteration: '10' },
  },
};
