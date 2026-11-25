import { CharacterStrokeDefinition } from '../types';
import { sampleCurve, sampleLine, makeLoop, createStroke } from '../strokeSampler';
import { GUJARATI_CONSONANTS } from './consonants';

/**
 * Authentic Gujarati Vowel Signs / Matras (બારાખડી માત્રાઓ)
 */
export const GUJARATI_MATRAS: Record<string, CharacterStrokeDefinition> = {
  // ા (Aa matra / Kano)
  'ા': {
    character: 'ા',
    language: 'gu',
    category: 'matra',
    strokes: [
      createStroke('gu_matra_aa_s1', 1, sampleLine({ x: 50, y: 22 }, { x: 50, y: 88 }), 'down', 'Vertical stem'),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Aa matra' },
  },

  // િ (Hrasva I matra)
  'િ': {
    character: 'િ',
    language: 'gu',
    category: 'matra',
    strokes: [
      createStroke(
        'gu_matra_i_s1',
        1,
        sampleCurve([
          { x: 80, y: 24 },
          { x: 50, y: 14 },
          { x: 20, y: 24 },
          { x: 20, y: 88 },
        ]),
        'forward',
        'Top arch into left vertical stem'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Hrasva I matra' },
  },

  // ી (Deergha I matra)
  'ી': {
    character: 'ી',
    language: 'gu',
    category: 'matra',
    strokes: [
      createStroke(
        'gu_matra_ee_s1',
        1,
        sampleCurve([
          { x: 20, y: 24 },
          { x: 50, y: 14 },
          { x: 80, y: 24 },
          { x: 80, y: 88 },
        ]),
        'forward',
        'Top arch into right vertical stem'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Deergha I matra' },
  },

  // ુ (Hrasva U matra)
  'ુ': {
    character: 'ુ',
    language: 'gu',
    category: 'matra',
    strokes: [
      createStroke(
        'gu_matra_u_s1',
        1,
        sampleCurve([
          { x: 50, y: 82 },
          { x: 38, y: 90 },
          { x: 44, y: 98 },
          { x: 54, y: 92 },
        ]),
        'forward',
        'Bottom leftward hook'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Hrasva U matra' },
  },

  // ૂ (Deergha U matra)
  'ૂ': {
    character: 'ૂ',
    language: 'gu',
    category: 'matra',
    strokes: [
      createStroke(
        'gu_matra_oo_s1',
        1,
        sampleCurve([
          { x: 50, y: 82 },
          { x: 62, y: 90 },
          { x: 68, y: 98 },
        ]),
        'forward',
        'Bottom rightward tail'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Deergha U matra' },
  },

  // ૃ (Ri matra)
  'ૃ': {
    character: 'ૃ',
    language: 'gu',
    category: 'matra',
    strokes: [
      createStroke(
        'gu_matra_ri_s1',
        1,
        sampleCurve([
          { x: 50, y: 82 },
          { x: 40, y: 88 },
          { x: 42, y: 96 },
          { x: 56, y: 94 },
        ]),
        'forward',
        'Bottom C-curl'
      ),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Ri matra' },
  },

  // ે (E matra)
  'ે': {
    character: 'ે',
    language: 'gu',
    category: 'matra',
    strokes: [
      createStroke('gu_matra_e_s1', 1, sampleLine({ x: 40, y: 26 }, { x: 54, y: 14 }), 'up', 'Top slant matra'),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'E matra' },
  },

  // ૈ (Ai matra)
  'ૈ': {
    character: 'ૈ',
    language: 'gu',
    category: 'matra',
    strokes: [
      createStroke('gu_matra_ai_s1', 1, sampleLine({ x: 38, y: 26 }, { x: 50, y: 14 }), 'up', 'First slant'),
      createStroke('gu_matra_ai_s2', 2, sampleLine({ x: 48, y: 26 }, { x: 60, y: 14 }), 'up', 'Second slant'),
    ],
    totalStrokes: 2,
    metadata: { phonetic: 'Ai matra' },
  },

  // ો (O matra)
  'ો': {
    character: 'ો',
    language: 'gu',
    category: 'matra',
    strokes: [
      createStroke('gu_matra_o_s1', 1, sampleLine({ x: 80, y: 22 }, { x: 80, y: 88 }), 'down', 'Vertical stem'),
      createStroke('gu_matra_o_s2', 2, sampleLine({ x: 74, y: 24 }, { x: 86, y: 14 }), 'up', 'Top slant'),
    ],
    totalStrokes: 2,
    metadata: { phonetic: 'O matra' },
  },

  // ૌ (Au matra)
  'ૌ': {
    character: 'ૌ',
    language: 'gu',
    category: 'matra',
    strokes: [
      createStroke('gu_matra_au_s1', 1, sampleLine({ x: 80, y: 22 }, { x: 80, y: 88 }), 'down', 'Vertical stem'),
      createStroke('gu_matra_au_s2', 2, sampleLine({ x: 72, y: 24 }, { x: 82, y: 14 }), 'up', 'First slant'),
      createStroke('gu_matra_au_s3', 3, sampleLine({ x: 80, y: 24 }, { x: 90, y: 14 }), 'up', 'Second slant'),
    ],
    totalStrokes: 3,
    metadata: { phonetic: 'Au matra' },
  },

  // ં (Anusvara)
  'ં': {
    character: 'ં',
    language: 'gu',
    category: 'matra',
    strokes: [
      createStroke('gu_matra_bindu_s1', 1, makeLoop(50, 16, 4, 4), 'clockwise', 'Top bindu dot'),
    ],
    totalStrokes: 1,
    metadata: { phonetic: 'Anusvara' },
  },

  // ઃ (Visarga)
  'ઃ': {
    character: 'ઃ',
    language: 'gu',
    category: 'matra',
    strokes: [
      createStroke('gu_matra_visarga_s1', 1, makeLoop(50, 44, 3.5, 3.5), 'clockwise', 'Upper dot'),
      createStroke('gu_matra_visarga_s2', 2, makeLoop(50, 68, 3.5, 3.5), 'clockwise', 'Lower dot'),
    ],
    totalStrokes: 2,
    metadata: { phonetic: 'Visarga' },
  },
};

/**
 * Composes a full Gujarati Barakhadi compound glyph (e.g. 'ખા', 'ખી', 'કુ', etc.).
 */
export function composeGujaratiBarakhadi(text: string): CharacterStrokeDefinition | null {
  const chars = Array.from(text.trim());
  if (chars.length === 2 && GUJARATI_CONSONANTS[chars[0]]) {
    const baseDef = GUJARATI_CONSONANTS[chars[0]];
    const matra = chars[1];

    if (matra === 'ા' || matra === '\u0ABE') {
      const scaledStrokes = baseDef.strokes.map((s, idx) => ({
        ...s,
        id: `${s.id}_b`,
        points: s.points.map((p) => ({ x: 14 + (p.x / 100) * 60, y: p.y })),
        startPoint: { x: 14 + (s.startPoint.x / 100) * 60, y: s.startPoint.y },
        endPoint: { x: 14 + (s.endPoint.x / 100) * 60, y: s.endPoint.y },
      }));
      const kanoStroke = createStroke(
        `gu_bk_${chars[0]}_kano`,
        scaledStrokes.length + 1,
        sampleLine({ x: 84, y: 22 }, { x: 84, y: 88 }),
        'down',
        'Kano vertical stem'
      );
      return {
        character: text,
        language: 'gu',
        category: 'conjunct',
        strokes: [...scaledStrokes, kanoStroke],
        totalStrokes: scaledStrokes.length + 1,
      };
    } else if (matra === 'િ' || matra === '\u0ABF') {
      const scaledStrokes = baseDef.strokes.map((s) => ({
        ...s,
        order: s.order + 1,
        points: s.points.map((p) => ({ x: 26 + (p.x / 100) * 62, y: p.y })),
        startPoint: { x: 26 + (s.startPoint.x / 100) * 62, y: s.startPoint.y },
        endPoint: { x: 26 + (s.endPoint.x / 100) * 62, y: s.endPoint.y },
      }));
      const iCurve = createStroke(
        `gu_bk_${chars[0]}_i`,
        1,
        sampleCurve([
          { x: 78, y: 24 },
          { x: 50, y: 14 },
          { x: 18, y: 24 },
          { x: 18, y: 88 },
        ]),
        'forward',
        'Left Hrasva I curve'
      );
      return {
        character: text,
        language: 'gu',
        category: 'conjunct',
        strokes: [iCurve, ...scaledStrokes],
        totalStrokes: scaledStrokes.length + 1,
      };
    } else if (matra === 'ી' || matra === '\u0AC0') {
      const scaledStrokes = baseDef.strokes.map((s) => ({
        ...s,
        points: s.points.map((p) => ({ x: 14 + (p.x / 100) * 62, y: p.y })),
        startPoint: { x: 14 + (s.startPoint.x / 100) * 62, y: s.startPoint.y },
        endPoint: { x: 14 + (s.endPoint.x / 100) * 62, y: s.endPoint.y },
      }));
      const iiCurve = createStroke(
        `gu_bk_${chars[0]}_ii`,
        scaledStrokes.length + 1,
        sampleCurve([
          { x: 50, y: 24 },
          { x: 74, y: 14 },
          { x: 86, y: 24 },
          { x: 86, y: 88 },
        ]),
        'forward',
        'Right Deergha I curve'
      );
      return {
        character: text,
        language: 'gu',
        category: 'conjunct',
        strokes: [...scaledStrokes, iiCurve],
        totalStrokes: scaledStrokes.length + 1,
      };
    } else if (matra === 'ુ' || matra === '\u0AC1') {
      const uHook = createStroke(
        `gu_bk_${chars[0]}_u`,
        baseDef.strokes.length + 1,
        sampleCurve([
          { x: 50, y: 84 },
          { x: 38, y: 92 },
          { x: 44, y: 98 },
          { x: 54, y: 92 },
        ]),
        'forward',
        'Bottom Hrasva U hook'
      );
      return {
        character: text,
        language: 'gu',
        category: 'conjunct',
        strokes: [...baseDef.strokes, uHook],
        totalStrokes: baseDef.strokes.length + 1,
      };
    } else if (matra === 'ૂ' || matra === '\u0AC2') {
      const ooTail = createStroke(
        `gu_bk_${chars[0]}_oo`,
        baseDef.strokes.length + 1,
        sampleCurve([
          { x: 50, y: 84 },
          { x: 62, y: 92 },
          { x: 68, y: 98 },
        ]),
        'forward',
        'Bottom Deergha U tail'
      );
      return {
        character: text,
        language: 'gu',
        category: 'conjunct',
        strokes: [...baseDef.strokes, ooTail],
        totalStrokes: baseDef.strokes.length + 1,
      };
    } else if (matra === 'ે' || matra === '\u0AC7') {
      const eStroke = createStroke(
        `gu_bk_${chars[0]}_e`,
        baseDef.strokes.length + 1,
        sampleLine({ x: 42, y: 24 }, { x: 56, y: 14 }),
        'up',
        'Top slant matra'
      );
      return {
        character: text,
        language: 'gu',
        category: 'conjunct',
        strokes: [...baseDef.strokes, eStroke],
        totalStrokes: baseDef.strokes.length + 1,
      };
    } else if (matra === 'ૈ' || matra === '\u0AC8') {
      const ai1 = createStroke(
        `gu_bk_${chars[0]}_ai1`,
        baseDef.strokes.length + 1,
        sampleLine({ x: 38, y: 24 }, { x: 50, y: 14 }),
        'up',
        'First slant'
      );
      const ai2 = createStroke(
        `gu_bk_${chars[0]}_ai2`,
        baseDef.strokes.length + 2,
        sampleLine({ x: 48, y: 24 }, { x: 60, y: 14 }),
        'up',
        'Second slant'
      );
      return {
        character: text,
        language: 'gu',
        category: 'conjunct',
        strokes: [...baseDef.strokes, ai1, ai2],
        totalStrokes: baseDef.strokes.length + 2,
      };
    } else if (matra === 'ો' || matra === '\u0ACB') {
      const scaledStrokes = baseDef.strokes.map((s) => ({
        ...s,
        points: s.points.map((p) => ({ x: 14 + (p.x / 100) * 60, y: p.y })),
        startPoint: { x: 14 + (s.startPoint.x / 100) * 60, y: s.startPoint.y },
        endPoint: { x: 14 + (s.endPoint.x / 100) * 60, y: s.endPoint.y },
      }));
      const stem = createStroke(
        `gu_bk_${chars[0]}_o_stem`,
        scaledStrokes.length + 1,
        sampleLine({ x: 84, y: 22 }, { x: 84, y: 88 }),
        'down',
        'Vertical stem'
      );
      const slant = createStroke(
        `gu_bk_${chars[0]}_o_slant`,
        scaledStrokes.length + 2,
        sampleLine({ x: 74, y: 24 }, { x: 86, y: 14 }),
        'up',
        'Top slant'
      );
      return {
        character: text,
        language: 'gu',
        category: 'conjunct',
        strokes: [...scaledStrokes, stem, slant],
        totalStrokes: scaledStrokes.length + 2,
      };
    } else if (matra === 'ૌ' || matra === '\u0ACC') {
      const scaledStrokes = baseDef.strokes.map((s) => ({
        ...s,
        points: s.points.map((p) => ({ x: 14 + (p.x / 100) * 60, y: p.y })),
        startPoint: { x: 14 + (s.startPoint.x / 100) * 60, y: s.startPoint.y },
        endPoint: { x: 14 + (s.endPoint.x / 100) * 60, y: s.endPoint.y },
      }));
      const stem = createStroke(
        `gu_bk_${chars[0]}_au_stem`,
        scaledStrokes.length + 1,
        sampleLine({ x: 84, y: 22 }, { x: 84, y: 88 }),
        'down',
        'Vertical stem'
      );
      const s1 = createStroke(
        `gu_bk_${chars[0]}_au_s1`,
        scaledStrokes.length + 2,
        sampleLine({ x: 72, y: 24 }, { x: 82, y: 14 }),
        'up',
        'First slant'
      );
      const s2 = createStroke(
        `gu_bk_${chars[0]}_au_s2`,
        scaledStrokes.length + 3,
        sampleLine({ x: 80, y: 24 }, { x: 90, y: 14 }),
        'up',
        'Second slant'
      );
      return {
        character: text,
        language: 'gu',
        category: 'conjunct',
        strokes: [...scaledStrokes, stem, s1, s2],
        totalStrokes: scaledStrokes.length + 3,
      };
    } else if (matra === 'ં' || matra === '\u0A82') {
      const dot = createStroke(
        `gu_bk_${chars[0]}_bindu`,
        baseDef.strokes.length + 1,
        makeLoop(54, 16, 4, 4),
        'clockwise',
        'Top bindu dot'
      );
      return {
        character: text,
        language: 'gu',
        category: 'conjunct',
        strokes: [...baseDef.strokes, dot],
        totalStrokes: baseDef.strokes.length + 1,
      };
    } else if (matra === 'ઃ' || matra === '\u0A83') {
      const d1 = createStroke(
        `gu_bk_${chars[0]}_vis1`,
        baseDef.strokes.length + 1,
        makeLoop(80, 44, 3.5, 3.5),
        'clockwise',
        'Upper visarga dot'
      );
      const d2 = createStroke(
        `gu_bk_${chars[0]}_vis2`,
        baseDef.strokes.length + 2,
        makeLoop(80, 68, 3.5, 3.5),
        'clockwise',
        'Lower visarga dot'
      );
      return {
        character: text,
        language: 'gu',
        category: 'conjunct',
        strokes: [...baseDef.strokes, d1, d2],
        totalStrokes: baseDef.strokes.length + 2,
      };
    }
  }
  return null;
}

