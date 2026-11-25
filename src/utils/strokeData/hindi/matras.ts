import { CharacterStrokeDefinition } from '../types';
import { createStroke, makeLoop } from '../strokeSampler';

export const HINDI_MATRAS: Record<string, CharacterStrokeDefinition> = {
  // ा - आ ની માત્રા (aa matra)
  'ा': {
    character: 'ा',
    language: 'hi',
    category: 'matra',
    totalStrokes: 2,
    strokes: [
      createStroke('hi_matra_aa_stem', 1, [
        { x: 50, y: 24 },
        { x: 50, y: 86 }
      ], 'down'),
      createStroke('hi_matra_aa_shiro', 2, [
        { x: 35, y: 24 },
        { x: 65, y: 24 }
      ], 'left_to_right')
    ]
  },

  // ि - ઇ ની માત્રા (i matra / hrasva i)
  'ि': {
    character: 'ि',
    language: 'hi',
    category: 'matra',
    totalStrokes: 3,
    strokes: [
      createStroke('hi_matra_i_stem', 1, [
        { x: 35, y: 24 },
        { x: 35, y: 86 }
      ], 'down'),
      createStroke('hi_matra_i_arch', 2, [
        { x: 35, y: 24 },
        { x: 42, y: 14 },
        { x: 58, y: 14 },
        { x: 68, y: 24 }
      ], 'left_to_right'),
      createStroke('hi_matra_i_shiro', 3, [
        { x: 25, y: 24 },
        { x: 75, y: 24 }
      ], 'left_to_right')
    ]
  },

  // ी - ઈ ની માત્રા (ii matra / dirgha ii)
  'ी': {
    character: 'ी',
    language: 'hi',
    category: 'matra',
    totalStrokes: 3,
    strokes: [
      createStroke('hi_matra_ii_stem', 1, [
        { x: 65, y: 24 },
        { x: 65, y: 86 }
      ], 'down'),
      createStroke('hi_matra_ii_arch', 2, [
        { x: 65, y: 24 },
        { x: 58, y: 14 },
        { x: 42, y: 14 },
        { x: 32, y: 24 }
      ], 'right_to_left'),
      createStroke('hi_matra_ii_shiro', 3, [
        { x: 25, y: 24 },
        { x: 75, y: 24 }
      ], 'left_to_right')
    ]
  },

  // ુ - ઉ ની માત્રા (u matra)
  'ु': {
    character: 'ु',
    language: 'hi',
    category: 'matra',
    totalStrokes: 1,
    strokes: [
      createStroke('hi_matra_u_curl', 1, [
        { x: 50, y: 78 },
        { x: 42, y: 84 },
        { x: 36, y: 90 },
        { x: 44, y: 94 },
        { x: 50, y: 88 }
      ], 'counter_clockwise')
    ]
  },

  // ૂ - ઊ ની માત્રા (uu matra)
  'ू': {
    character: 'ू',
    language: 'hi',
    category: 'matra',
    totalStrokes: 1,
    strokes: [
      createStroke('hi_matra_uu_tail', 1, [
        { x: 48, y: 78 },
        { x: 52, y: 84 },
        { x: 60, y: 91 },
        { x: 68, y: 96 }
      ], 'down')
    ]
  },

  // ૃ - ઋ ની માત્રા (vocalic r matra)
  'ृ': {
    character: 'ृ',
    language: 'hi',
    category: 'matra',
    totalStrokes: 1,
    strokes: [
      createStroke('hi_matra_ri_hook', 1, [
        { x: 50, y: 78 },
        { x: 50, y: 85 },
        { x: 40, y: 90 },
        { x: 40, y: 94 },
        { x: 48, y: 96 }
      ], 'counter_clockwise')
    ]
  },

  // े - એ ની માત્રા (e matra)
  'े': {
    character: 'े',
    language: 'hi',
    category: 'matra',
    totalStrokes: 2,
    strokes: [
      createStroke('hi_matra_e_slant', 1, [
        { x: 56, y: 12 },
        { x: 48, y: 24 }
      ], 'down'),
      createStroke('hi_matra_e_shiro', 2, [
        { x: 30, y: 24 },
        { x: 70, y: 24 }
      ], 'left_to_right')
    ]
  },

  // ै - ઐ ની માત્રા (ai matra)
  'ै': {
    character: 'ै',
    language: 'hi',
    category: 'matra',
    totalStrokes: 3,
    strokes: [
      createStroke('hi_matra_ai_slant1', 1, [
        { x: 44, y: 12 },
        { x: 42, y: 24 }
      ], 'down'),
      createStroke('hi_matra_ai_slant2', 2, [
        { x: 58, y: 10 },
        { x: 48, y: 24 }
      ], 'down'),
      createStroke('hi_matra_ai_shiro', 3, [
        { x: 30, y: 24 },
        { x: 70, y: 24 }
      ], 'left_to_right')
    ]
  },

  // ो - ઓ ની માત્રા (o matra)
  'ो': {
    character: 'ो',
    language: 'hi',
    category: 'matra',
    totalStrokes: 3,
    strokes: [
      createStroke('hi_matra_o_stem', 1, [
        { x: 66, y: 24 },
        { x: 66, y: 86 }
      ], 'down'),
      createStroke('hi_matra_o_flag', 2, [
        { x: 58, y: 12 },
        { x: 66, y: 24 }
      ], 'down'),
      createStroke('hi_matra_o_shiro', 3, [
        { x: 35, y: 24 },
        { x: 75, y: 24 }
      ], 'left_to_right')
    ]
  },

  // ૌ - ઔ ની માત્રા (au matra)
  'ौ': {
    character: 'ौ',
    language: 'hi',
    category: 'matra',
    totalStrokes: 4,
    strokes: [
      createStroke('hi_matra_au_stem', 1, [
        { x: 66, y: 24 },
        { x: 66, y: 86 }
      ], 'down'),
      createStroke('hi_matra_au_flag1', 2, [
        { x: 54, y: 12 },
        { x: 64, y: 24 }
      ], 'down'),
      createStroke('hi_matra_au_flag2', 3, [
        { x: 64, y: 10 },
        { x: 66, y: 24 }
      ], 'down'),
      createStroke('hi_matra_au_shiro', 4, [
        { x: 35, y: 24 },
        { x: 75, y: 24 }
      ], 'left_to_right')
    ]
  },

  // ं - અનુસ્વાર (anusvara)
  'ं': {
    character: 'ं',
    language: 'hi',
    category: 'matra',
    totalStrokes: 1,
    strokes: [
      createStroke('hi_matra_bindi', 1, makeLoop(50, 14, 3, 3), 'clockwise')
    ]
  },

  // ः - વિસર્ગ (visarga)
  'ः': {
    character: 'ः',
    language: 'hi',
    category: 'matra',
    totalStrokes: 2,
    strokes: [
      createStroke('hi_matra_visarga_top', 1, makeLoop(65, 44, 3, 3), 'clockwise'),
      createStroke('hi_matra_visarga_bottom', 2, makeLoop(65, 66, 3, 3), 'clockwise')
    ]
  },

  // ँ - ચંદ્રબિંદુ (candrabindu)
  'ँ': {
    character: 'ँ',
    language: 'hi',
    category: 'matra',
    totalStrokes: 2,
    strokes: [
      createStroke('hi_matra_candra', 1, [
        { x: 38, y: 16 },
        { x: 44, y: 20 },
        { x: 50, y: 21 },
        { x: 56, y: 20 },
        { x: 62, y: 16 }
      ], 'left_to_right'),
      createStroke('hi_matra_candra_dot', 2, makeLoop(50, 12, 2.5, 2.5), 'clockwise')
    ]
  }
};
