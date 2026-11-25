import { CharacterStrokeDefinition } from '../types';
import { sampleCurve, sampleLine, makeLoop, createStroke } from '../strokeSampler';

/**
 * Authentic English Numerals (0 to 9) with exact educational handwriting stroke geometry.
 * Strictly adheres to standard printed glyphs and single-continuous flow where applicable.
 */
export const ENGLISH_NUMBERS: Record<string, CharacterStrokeDefinition> = {
  // 0 (Zero): Smooth oval loop drawn counter-clockwise from the top crest
  '0': {
    character: '0',
    language: 'en',
    category: 'number',
    strokes: [
      createStroke(
        'en_num_0_s1',
        1,
        makeLoop(50, 53, 18, 34, -Math.PI / 2, Math.PI * 2, 28),
        'counter_clockwise',
        'Oval loop drawn counter-clockwise from top'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Zero', transliteration: '0' },
  },

  // 1 (One): Natural handwriting single continuous stroke: top slant into straight vertical stem
  '1': {
    character: '1',
    language: 'en',
    category: 'number',
    strokes: [
      createStroke(
        'en_num_1_s1',
        1,
        [
          ...sampleLine({ x: 36, y: 32 }, { x: 50, y: 18 }, 6),
          ...sampleLine({ x: 50, y: 18 }, { x: 50, y: 88 }, 16),
        ],
        'down',
        'Top slant rising to peak and dropping straight down vertical stem'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'One', transliteration: '1' },
  },

  // 2 (Two): Smooth upper arch, diagonal down-left slide, and flat horizontal base
  '2': {
    character: '2',
    language: 'en',
    category: 'number',
    strokes: [
      createStroke(
        'en_num_2_s1',
        1,
        [
          ...sampleCurve(
            [
              { x: 32, y: 34 },
              { x: 48, y: 18 },
              { x: 68, y: 28 },
              { x: 66, y: 44 },
              { x: 34, y: 88 },
            ],
            12
          ),
          ...sampleLine({ x: 34, y: 88 }, { x: 72, y: 88 }, 12),
        ],
        'forward',
        'Top rounded arch, diagonal down-left slide, and flat horizontal base'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Two', transliteration: '2' },
  },

  // 3 (Three): Double rounded arch with center junction
  '3': {
    character: '3',
    language: 'en',
    category: 'number',
    strokes: [
      createStroke(
        'en_num_3_s1',
        1,
        sampleCurve(
          [
            { x: 34, y: 28 },
            { x: 50, y: 18 },
            { x: 68, y: 28 },
            { x: 50, y: 48 },
            { x: 70, y: 66 },
            { x: 52, y: 88 },
            { x: 34, y: 80 },
          ],
          14
        ),
        'forward',
        'Upper arch into center waist and lower rounded belly terminating at base'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Three', transliteration: '3' },
  },

  // 4 (Four): Down-slant, horizontal crossbar, and vertical stem
  '4': {
    character: '4',
    language: 'en',
    category: 'number',
    strokes: [
      createStroke(
        'en_num_4_s1',
        1,
        [
          ...sampleLine({ x: 62, y: 18 }, { x: 28, y: 64 }, 10),
          ...sampleLine({ x: 28, y: 64 }, { x: 74, y: 64 }, 10),
        ],
        'forward',
        'Slanted down-stroke and horizontal crossbar'
      ),
      createStroke(
        'en_num_4_s2',
        2,
        sampleLine({ x: 62, y: 36 }, { x: 62, y: 88 }, 14),
        'down',
        'Vertical stem cutting straight down to baseline'
      ),
    ],
    totalStrokes: 2,
    metadata: { phonetic: 'Four', transliteration: '4' },
  },

  // 5 (Five): Single fluid continuous stroke: top bar left, vertical drop, curved belly
  '5': {
    character: '5',
    language: 'en',
    category: 'number',
    strokes: [
      createStroke(
        'en_num_5_s1',
        1,
        [
          ...sampleLine({ x: 68, y: 18 }, { x: 36, y: 18 }, 8),
          ...sampleLine({ x: 36, y: 18 }, { x: 36, y: 48 }, 8),
          ...sampleCurve(
            [
              { x: 36, y: 48 },
              { x: 68, y: 52 },
              { x: 70, y: 72 },
              { x: 52, y: 88 },
              { x: 34, y: 82 },
            ],
            12
          ),
        ],
        'forward',
        'Top bar left, vertical drop, and sweeping curved belly'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Five', transliteration: '5' },
  },

  // 6 (Six): Continuous curve starting top-right, looping around bottom belly
  '6': {
    character: '6',
    language: 'en',
    category: 'number',
    strokes: [
      createStroke(
        'en_num_6_s1',
        1,
        sampleCurve(
          [
            { x: 62, y: 20 },
            { x: 38, y: 44 },
            { x: 32, y: 66 },
            { x: 48, y: 88 },
            { x: 68, y: 72 },
            { x: 56, y: 52 },
            { x: 34, y: 64 },
          ],
          14
        ),
        'counter_clockwise',
        'Down-left sweep looping around bottom belly'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Six', transliteration: '6' },
  },

  // 7 (Seven): Top horizontal bar and diagonal down-stem
  '7': {
    character: '7',
    language: 'en',
    category: 'number',
    strokes: [
      createStroke(
        'en_num_7_s1',
        1,
        [
          ...sampleLine({ x: 30, y: 20 }, { x: 72, y: 20 }, 10),
          ...sampleLine({ x: 72, y: 20 }, { x: 44, y: 88 }, 16),
        ],
        'forward',
        'Top horizontal bar and diagonal down-stem'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Seven', transliteration: '7' },
  },

  // 8 (Eight): Continuous figure-eight double loop crossing at center
  '8': {
    character: '8',
    language: 'en',
    category: 'number',
    strokes: [
      createStroke(
        'en_num_8_s1',
        1,
        sampleCurve(
          [
            { x: 50, y: 50 },
            { x: 36, y: 34 },
            { x: 50, y: 18 },
            { x: 64, y: 34 },
            { x: 50, y: 50 },
            { x: 34, y: 70 },
            { x: 50, y: 88 },
            { x: 66, y: 70 },
            { x: 50, y: 50 },
          ],
          12
        ),
        'forward',
        'Figure-eight continuous double loop crossing at center'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Eight', transliteration: '8' },
  },

  // 9 (Nine): Top loop counter-clockwise into descending right stem
  '9': {
    character: '9',
    language: 'en',
    category: 'number',
    strokes: [
      createStroke(
        'en_num_9_s1',
        1,
        sampleCurve(
          [
            { x: 66, y: 50 },
            { x: 50, y: 20 },
            { x: 34, y: 34 },
            { x: 50, y: 52 },
            { x: 66, y: 50 },
            { x: 64, y: 72 },
            { x: 48, y: 88 },
          ],
          14
        ),
        'forward',
        'Top loop counter-clockwise into descending right stem'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Nine', transliteration: '9' },
  },

  // 10 (Ten): Compound number combining 1 and 0
  '10': {
    character: '10',
    language: 'en',
    category: 'number',
    strokes: [
      // '1' in left half (x: 20 to 45)
      createStroke(
        'en_num_10_s1',
        1,
        [
          ...sampleLine({ x: 22, y: 32 }, { x: 34, y: 18 }, 5),
          ...sampleLine({ x: 34, y: 18 }, { x: 34, y: 88 }, 14),
        ],
        'down',
        'Digit 1 in compound 10'
      ),
      // '0' in right half (x: 55 to 85)
      createStroke(
        'en_num_10_s2',
        2,
        makeLoop(70, 53, 15, 34, -Math.PI / 2, Math.PI * 2, 26),
        'counter_clockwise',
        'Digit 0 in compound 10'
      ),
    ],
    totalStrokes: 2,
    metadata: { phonetic: 'Ten', transliteration: '10' },
  },
};

