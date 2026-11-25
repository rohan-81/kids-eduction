/**
 * Comprehensive Character Reference Stroke Library for Gujarati & English.
 *
 * Provides accurate, normalized [0..100] centerline trajectories, curves,
 * loops, and structural segments for authentic handwriting tracing evaluation.
 */

import {
  getCharacterStrokeDefinition,
  getScaledCharacterTrajectory as getModularScaledTrajectory,
} from './strokeData';

export { getCharacterStrokeDefinition };

export interface Point2D {
  x: number;
  y: number;
}

export interface CharacterStroke {
  id: string;
  points: Point2D[];
}

export interface CharacterDef {
  symbol: string;
  strokes: CharacterStroke[];
  viewBox?: { minX: number; maxX: number; minY: number; maxY: number };
}

/**
 * Linearly interpolates between points with a fixed step distance.
 */
export function interpolatePoints(p1: Point2D, p2: Point2D, step = 3.0): Point2D[] {
  const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  if (dist <= step) return [p2];
  const steps = Math.max(1, Math.floor(dist / step));
  const pts: Point2D[] = [];
  for (let s = 1; s <= steps; s++) {
    const t = s / steps;
    pts.push({
      x: p1.x + (p2.x - p1.x) * t,
      y: p1.y + (p2.y - p1.y) * t,
    });
  }
  return pts;
}

/**
 * Smooth quadratic/cubic spline interpolation for curved strokes.
 */
export function sampleCurve(controlPoints: Point2D[], stepsPerSegment = 10): Point2D[] {
  if (controlPoints.length < 2) return controlPoints;
  if (controlPoints.length === 2) {
    return [controlPoints[0], ...interpolatePoints(controlPoints[0], controlPoints[1])];
  }

  const result: Point2D[] = [controlPoints[0]];
  for (let i = 0; i < controlPoints.length - 1; i++) {
    const p0 = i > 0 ? controlPoints[i - 1] : controlPoints[i];
    const p1 = controlPoints[i];
    const p2 = controlPoints[i + 1];
    const p3 = i < controlPoints.length - 2 ? controlPoints[i + 2] : p2;

    for (let step = 1; step <= stepsPerSegment; step++) {
      const t = step / stepsPerSegment;
      const t2 = t * t;
      const t3 = t2 * t;

      // Catmull-Rom spline interpolation
      const x =
        0.5 *
        (2 * p1.x +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
      const y =
        0.5 *
        (2 * p1.y +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);

      result.push({ x, y });
    }
  }
  return result;
}

/**
 * Helper to build an elliptical loop.
 */
function makeLoop(cx: number, cy: number, rx: number, ry: number, startAngle = 0, sweep = Math.PI * 2, steps = 24): Point2D[] {
  const pts: Point2D[] = [];
  for (let i = 0; i <= steps; i++) {
    const angle = startAngle + (i / steps) * sweep;
    pts.push({
      x: cx + rx * Math.cos(angle),
      y: cy + ry * Math.sin(angle),
    });
  }
  return pts;
}

function sampleLine(p1: Point2D, p2: Point2D, steps = 12): Point2D[] {
  const pts: Point2D[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push({
      x: p1.x + (p2.x - p1.x) * t,
      y: p1.y + (p2.y - p1.y) * t,
    });
  }
  return pts;
}

// ============================================================================
// GUJARATI NUMERALS (૧, ૨, ૩, ૪, ૫, ૬, ૭, ૮, ૯, ૦)
// ============================================================================
const GUJARATI_NUMBERS: Record<string, Point2D[][]> = {
  // ૧ (One): Natural Gujarati 1 matching official printed glyph - round circular loop and straight vertical stem with rightward bottom flick
  '૧': [
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
  ],

  // ૨ (Two): Top arch + center loop + bottom tail
  '૨': [
    sampleCurve([
      { x: 30, y: 42 },
      { x: 42, y: 28 },
      { x: 64, y: 30 },
      { x: 72, y: 42 },
      { x: 62, y: 52 },
      { x: 48, y: 56 },
      { x: 38, y: 62 },
      { x: 36, y: 68 },
      { x: 46, y: 70 },
      { x: 62, y: 74 },
      { x: 76, y: 84 },
    ]),
  ],

  // ૩ (Three): Double arch + bottom hook
  '૩': [
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
  ],

  // ૪ (Four): Authentic Gujarati ૪ - ribbon loop starting top-left, dipping into bottom loop, and rising to top-right
  '૪': [
    sampleCurve([
      { x: 34, y: 24 },
      { x: 40, y: 38 },
      { x: 46, y: 50 },
      { x: 38, y: 64 },
      { x: 42, y: 78 },
      { x: 50, y: 84 },
      { x: 58, y: 78 },
      { x: 62, y: 64 },
      { x: 54, y: 50 },
      { x: 60, y: 38 },
      { x: 66, y: 24 },
    ], 16),
  ],

  // ૫ (Five): Authentic Gujarati 5 - left U-cup and full right vertical stem (like consonant પ)
  '૫': [
    sampleCurve([
      { x: 34, y: 26 },
      { x: 34, y: 52 },
      { x: 42, y: 76 },
      { x: 54, y: 76 },
      { x: 66, y: 56 },
      { x: 66, y: 24 },
      { x: 66, y: 56 },
      { x: 66, y: 86 },
    ], 16),
  ],

  // ૬ (Six): Authentic Gujarati ૬ matching official glyph - upper 'C' curve, middle horizontal shelf, diagonal descent, and open lower curve
  '૬': [
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
  ],

  // ૭ (Seven): Authentic Gujarati ૭ - top-right loop, descending right stem, and bottom U-bowl rising on left
  '૭': [
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
  ],

  // ૮ (Eight): Authentic Gujarati ૮ - diagonal slant down from top-right, curving around bottom into right tail
  '૮': [
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
  ],

  // ૯ (Nine): Authentic Gujarati ૯ - outer curved arc with center horizontal tongue pointing right
  '૯': [
    sampleCurve([
      { x: 56, y: 22 },
      { x: 40, y: 22 },
      { x: 28, y: 36 },
      { x: 28, y: 52 },
      { x: 44, y: 52 },
      { x: 58, y: 52 },
      { x: 44, y: 52 },
      { x: 28, y: 52 },
      { x: 28, y: 68 },
      { x: 40, y: 86 },
      { x: 56, y: 86 },
    ], 18),
  ],

  // ૦ (Zero): Oval circle
  '૦': [
    makeLoop(50, 52, 20, 26, -Math.PI / 2, Math.PI * 2, 28),
  ],
};

// ============================================================================
// ENGLISH NUMERALS (1, 2, 3, 4, 5, 6, 7, 8, 9, 0)
// ============================================================================
const ENGLISH_NUMBERS: Record<string, Point2D[][]> = {
  // '0': Smooth oval loop
  '0': [
    makeLoop(50, 53, 20, 33, -Math.PI / 2, Math.PI * 2, 28),
  ],

  // '1': Standard handwriting single continuous stroke: top slant into vertical stem
  '1': [
    [
      { x: 38, y: 34 },
      { x: 50, y: 18 },
      { x: 50, y: 88 },
    ],
  ],

  // '2': Smooth top arch, diagonal down to corner, and flat horizontal base
  '2': [
    [
      ...sampleCurve([
        { x: 34, y: 34 },
        { x: 50, y: 18 },
        { x: 68, y: 30 },
        { x: 66, y: 46 },
        { x: 34, y: 88 },
      ]),
      ...interpolatePoints({ x: 34, y: 88 }, { x: 74, y: 88 }),
    ],
  ],

  // '3': Double arch with center junction
  '3': [
    sampleCurve([
      { x: 34, y: 28 },
      { x: 52, y: 18 },
      { x: 68, y: 30 },
      { x: 52, y: 50 },
      { x: 68, y: 64 },
      { x: 56, y: 88 },
      { x: 34, y: 82 },
    ]),
  ],

  // '4': Down-slant, crossbar, and vertical stem
  '4': [
    [
      { x: 62, y: 18 },
      { x: 30, y: 64 },
      { x: 74, y: 64 },
    ],
    [
      { x: 62, y: 38 },
      { x: 62, y: 88 },
    ],
  ],

  // '5': Top bar, vertical drop, curved belly
  '5': [
    [
      { x: 68, y: 18 },
      { x: 36, y: 18 },
      { x: 36, y: 48 },
    ],
    sampleCurve([
      { x: 36, y: 48 },
      { x: 68, y: 52 },
      { x: 70, y: 72 },
      { x: 52, y: 88 },
      { x: 34, y: 82 },
    ]),
  ],

  // '6': Continuous curve starting top-right, looping around bottom
  '6': [
    sampleCurve([
      { x: 62, y: 22 },
      { x: 38, y: 46 },
      { x: 34, y: 70 },
      { x: 50, y: 88 },
      { x: 68, y: 72 },
      { x: 54, y: 52 },
      { x: 36, y: 66 },
    ]),
  ],

  // '7': Top bar and diagonal down-stem
  '7': [
    [
      { x: 30, y: 20 },
      { x: 74, y: 20 },
      { x: 46, y: 88 },
    ],
  ],

  // '8': Figure-8 crossing at center
  '8': [
    sampleCurve([
      { x: 50, y: 52 },
      { x: 36, y: 36 },
      { x: 50, y: 18 },
      { x: 64, y: 36 },
      { x: 50, y: 52 },
      { x: 34, y: 70 },
      { x: 50, y: 88 },
      { x: 66, y: 70 },
      { x: 50, y: 52 },
    ]),
  ],

  // '9': Top oval loop and downward stem
  '9': [
    sampleCurve([
      { x: 64, y: 52 },
      { x: 48, y: 22 },
      { x: 34, y: 34 },
      { x: 50, y: 52 },
      { x: 66, y: 38 },
      { x: 60, y: 72 },
      { x: 44, y: 88 },
    ]),
  ],
};

// ============================================================================
// GUJARATI VARNAMALA (SWAR & VYANJAN)
// ============================================================================
const GUJARATI_LETTERS: Record<string, Point2D[][]> = {
  // ક: S-curve + crossbar
  'ક': [
    sampleCurve([
      { x: 66, y: 32 },
      { x: 46, y: 28 },
      { x: 34, y: 42 },
      { x: 66, y: 56 },
      { x: 64, y: 74 },
      { x: 44, y: 82 },
      { x: 32, y: 78 },
    ]),
    [
      { x: 36, y: 66 },
      { x: 68, y: 40 },
    ],
  ],

  // ખ: Left loop + curve + vertical stem
  'ખ': [
    sampleCurve([
      { x: 34, y: 38 },
      { x: 44, y: 32 },
      { x: 34, y: 48 },
      { x: 36, y: 68 },
      { x: 50, y: 74 },
      { x: 66, y: 74 },
    ]),
    [
      { x: 68, y: 26 },
      { x: 68, y: 86 },
    ],
  ],

  // ગ: Left loop + right vertical stem
  'ગ': [
    sampleCurve([
      { x: 56, y: 34 },
      { x: 38, y: 34 },
      { x: 30, y: 54 },
      { x: 40, y: 76 },
      { x: 54, y: 76 },
    ]),
    [
      { x: 68, y: 26 },
      { x: 68, y: 86 },
    ],
  ],

  // ઘ: Double loop + vertical stem
  'ઘ': [
    sampleCurve([
      { x: 36, y: 30 },
      { x: 54, y: 30 },
      { x: 34, y: 48 },
      { x: 54, y: 58 },
      { x: 36, y: 74 },
      { x: 66, y: 74 },
    ]),
    [
      { x: 68, y: 26 },
      { x: 68, y: 86 },
    ],
  ],

  // ચ: Left hook + loop + right stem
  'ચ': [
    sampleCurve([
      { x: 34, y: 48 },
      { x: 50, y: 48 },
      { x: 36, y: 64 },
      { x: 48, y: 76 },
      { x: 66, y: 74 },
    ]),
    [
      { x: 68, y: 26 },
      { x: 68, y: 86 },
    ],
  ],

  // છ: Double loop + knot
  'છ': [
    sampleCurve([
      { x: 64, y: 32 },
      { x: 44, y: 28 },
      { x: 32, y: 42 },
      { x: 50, y: 52 },
      { x: 32, y: 66 },
      { x: 48, y: 82 },
      { x: 64, y: 74 },
      { x: 58, y: 60 },
      { x: 48, y: 64 },
    ]),
  ],

  // જ: Curve + loop + stem
  'જ': [
    sampleCurve([
      { x: 64, y: 32 },
      { x: 44, y: 36 },
      { x: 34, y: 54 },
      { x: 50, y: 62 },
      { x: 66, y: 62 },
      { x: 68, y: 84 },
    ]),
  ],

  // ઝ: S-curve + crossbar + stem
  'ઝ': [
    sampleCurve([
      { x: 56, y: 32 },
      { x: 38, y: 34 },
      { x: 34, y: 50 },
      { x: 54, y: 60 },
      { x: 34, y: 74 },
      { x: 48, y: 84 },
    ]),
    [
      { x: 48, y: 60 },
      { x: 68, y: 60 },
    ],
    [
      { x: 68, y: 30 },
      { x: 68, y: 86 },
    ],
  ],

  // ટ: C-hook
  'ટ': [
    sampleCurve([
      { x: 66, y: 34 },
      { x: 46, y: 30 },
      { x: 34, y: 50 },
      { x: 48, y: 76 },
      { x: 66, y: 82 },
    ]),
  ],

  // ઠ: Circle
  'ઠ': [
    makeLoop(50, 54, 18, 26, -Math.PI / 2, Math.PI * 2, 26),
  ],

  // ડ: S-curve
  'ડ': [
    sampleCurve([
      { x: 64, y: 32 },
      { x: 44, y: 34 },
      { x: 36, y: 48 },
      { x: 56, y: 60 },
      { x: 62, y: 74 },
      { x: 40, y: 84 },
    ]),
  ],

  // ઢ: S-curve with small bottom circle
  'ઢ': [
    sampleCurve([
      { x: 64, y: 32 },
      { x: 44, y: 34 },
      { x: 34, y: 52 },
      { x: 50, y: 76 },
      { x: 64, y: 74 },
      { x: 58, y: 62 },
      { x: 48, y: 68 },
    ]),
  ],

  // ણ: Left loop + center curve + right vertical stem
  'ણ': [
    sampleCurve([
      { x: 30, y: 38 },
      { x: 38, y: 32 },
      { x: 40, y: 68 },
      { x: 30, y: 76 },
      { x: 44, y: 74 },
      { x: 56, y: 74 },
    ]),
    [
      { x: 68, y: 26 },
      { x: 68, y: 86 },
    ],
  ],

  // ત: Top curve + stem
  'ત': [
    sampleCurve([
      { x: 34, y: 48 },
      { x: 48, y: 34 },
      { x: 64, y: 44 },
    ]),
    [
      { x: 68, y: 26 },
      { x: 68, y: 86 },
    ],
  ],

  // થ: Top loop + curve + stem
  'થ': [
    sampleCurve([
      { x: 40, y: 40 },
      { x: 32, y: 36 },
      { x: 34, y: 50 },
      { x: 48, y: 66 },
      { x: 66, y: 72 },
    ]),
    [
      { x: 68, y: 26 },
      { x: 68, y: 86 },
    ],
  ],

  // દ: Reverse C
  'દ': [
    sampleCurve([
      { x: 58, y: 32 },
      { x: 42, y: 34 },
      { x: 34, y: 52 },
      { x: 54, y: 70 },
      { x: 42, y: 86 },
    ]),
  ],

  // ધ: Like ઘ with open neck
  'ધ': [
    sampleCurve([
      { x: 42, y: 38 },
      { x: 54, y: 40 },
      { x: 36, y: 54 },
      { x: 54, y: 62 },
      { x: 38, y: 76 },
      { x: 66, y: 76 },
    ]),
    [
      { x: 68, y: 26 },
      { x: 68, y: 86 },
    ],
  ],

  // ન: Left loop + horizontal link + stem
  'ન': [
    sampleCurve([
      { x: 38, y: 56 },
      { x: 30, y: 66 },
      { x: 42, y: 74 },
      { x: 46, y: 62 },
      { x: 66, y: 62 },
    ]),
    [
      { x: 68, y: 26 },
      { x: 68, y: 86 },
    ],
  ],

  // પ: U-shape + stem
  'પ': [
    sampleCurve([
      { x: 34, y: 34 },
      { x: 34, y: 62 },
      { x: 48, y: 76 },
      { x: 66, y: 72 },
    ]),
    [
      { x: 68, y: 26 },
      { x: 68, y: 86 },
    ],
  ],

  // ફ: Loop + cross + stem
  'ફ': [
    sampleCurve([
      { x: 34, y: 34 },
      { x: 34, y: 62 },
      { x: 48, y: 76 },
      { x: 66, y: 72 },
    ]),
    [
      { x: 68, y: 26 },
      { x: 68, y: 86 },
    ],
    [
      { x: 38, y: 64 },
      { x: 70, y: 42 },
    ],
  ],

  // બ: Left loop + curve + stem
  'બ': [
    sampleCurve([
      { x: 34, y: 38 },
      { x: 46, y: 34 },
      { x: 36, y: 54 },
      { x: 48, y: 66 },
      { x: 66, y: 72 },
    ]),
    [
      { x: 68, y: 26 },
      { x: 68, y: 86 },
    ],
  ],

  // ભ: Left knot + loop + stem
  'ભ': [
    sampleCurve([
      { x: 32, y: 40 },
      { x: 44, y: 32 },
      { x: 36, y: 56 },
      { x: 48, y: 68 },
      { x: 66, y: 72 },
    ]),
    [
      { x: 68, y: 26 },
      { x: 68, y: 86 },
    ],
  ],

  // મ: Vertical stroke + bottom loop + horizontal bar + vertical stem
  'મ': [
    sampleCurve([
      { x: 36, y: 32 },
      { x: 36, y: 64 },
      { x: 28, y: 74 },
      { x: 44, y: 76 },
      { x: 66, y: 72 },
    ]),
    [
      { x: 68, y: 26 },
      { x: 68, y: 86 },
    ],
  ],

  // ય: Left loop + upward arch + right vertical stem
  'ય': [
    sampleCurve([
      { x: 34, y: 40 },
      { x: 48, y: 40 },
      { x: 34, y: 60 },
      { x: 50, y: 76 },
      { x: 66, y: 68 },
    ]),
    [
      { x: 68, y: 26 },
      { x: 68, y: 86 },
    ],
  ],

  // ર: Top arch + tail (like '૨')
  'ર': [
    sampleCurve([
      { x: 36, y: 42 },
      { x: 48, y: 32 },
      { x: 66, y: 42 },
      { x: 56, y: 58 },
      { x: 42, y: 72 },
      { x: 66, y: 84 },
    ]),
  ],

  // લ: C-curve + bridge + vertical stem
  'લ': [
    sampleCurve([
      { x: 50, y: 48 },
      { x: 34, y: 54 },
      { x: 38, y: 74 },
      { x: 52, y: 74 },
      { x: 66, y: 66 },
    ]),
    [
      { x: 68, y: 26 },
      { x: 68, y: 86 },
    ],
  ],

  // વ: Left circle + right vertical stem
  'વ': [
    makeLoop(46, 56, 14, 18, -Math.PI / 2, Math.PI * 2, 20),
    [
      { x: 68, y: 26 },
      { x: 68, y: 86 },
    ],
  ],

  // શ: 2-like loop + vertical stem
  'શ': [
    sampleCurve([
      { x: 32, y: 38 },
      { x: 44, y: 30 },
      { x: 54, y: 42 },
      { x: 44, y: 56 },
      { x: 36, y: 66 },
      { x: 52, y: 82 },
    ]),
    [
      { x: 68, y: 26 },
      { x: 68, y: 86 },
    ],
  ],

  // ષ: 'પ' with diagonal slash
  'ષ': [
    sampleCurve([
      { x: 34, y: 34 },
      { x: 34, y: 62 },
      { x: 48, y: 76 },
      { x: 66, y: 72 },
    ]),
    [
      { x: 68, y: 26 },
      { x: 68, y: 86 },
    ],
    [
      { x: 38, y: 44 },
      { x: 64, y: 74 },
    ],
  ],

  // સ: 'ર' + horizontal bar + vertical stem
  'સ': [
    sampleCurve([
      { x: 36, y: 42 },
      { x: 48, y: 32 },
      { x: 60, y: 42 },
      { x: 48, y: 58 },
      { x: 38, y: 72 },
      { x: 54, y: 84 },
    ]),
    [
      { x: 50, y: 58 },
      { x: 68, y: 58 },
    ],
    [
      { x: 68, y: 26 },
      { x: 68, y: 86 },
    ],
  ],

  // હ: Hook and tail
  'હ': [
    sampleCurve([
      { x: 42, y: 32 },
      { x: 56, y: 32 },
      { x: 44, y: 48 },
      { x: 58, y: 56 },
      { x: 40, y: 72 },
      { x: 58, y: 84 },
    ]),
  ],

  // ળ: Double bottom loop (like 'w' or infinity)
  'ળ': [
    sampleCurve([
      { x: 32, y: 42 },
      { x: 40, y: 78 },
      { x: 50, y: 54 },
      { x: 60, y: 78 },
      { x: 68, y: 42 },
    ]),
  ],

  // અ: 3-like shape + center link + vertical stem
  'અ': [
    sampleCurve([
      { x: 34, y: 32 },
      { x: 52, y: 26 },
      { x: 66, y: 36 },
      { x: 52, y: 48 },
      { x: 44, y: 52 },
      { x: 56, y: 56 },
      { x: 68, y: 68 },
      { x: 58, y: 82 },
      { x: 42, y: 84 },
      { x: 66, y: 72 },
    ]),
    [
      { x: 68, y: 26 },
      { x: 68, y: 86 },
    ],
  ],

  // આ: 'અ' + kanon stem
  'આ': [
    sampleCurve([
      { x: 26, y: 32 },
      { x: 42, y: 26 },
      { x: 54, y: 36 },
      { x: 42, y: 48 },
      { x: 34, y: 52 },
      { x: 46, y: 56 },
      { x: 56, y: 68 },
      { x: 48, y: 82 },
      { x: 34, y: 84 },
      { x: 56, y: 72 },
    ]),
    [
      { x: 58, y: 26 },
      { x: 58, y: 86 },
    ],
    [
      { x: 74, y: 26 },
      { x: 74, y: 86 },
    ],
  ],

  // ઉ: 3-like vowel
  'ઉ': [
    sampleCurve([
      { x: 34, y: 34 },
      { x: 52, y: 26 },
      { x: 70, y: 36 },
      { x: 54, y: 50 },
      { x: 42, y: 54 },
      { x: 58, y: 56 },
      { x: 72, y: 68 },
      { x: 62, y: 84 },
      { x: 38, y: 82 },
    ]),
  ],

  // એ: 'અ' with matra
  'એ': [
    sampleCurve([
      { x: 34, y: 36 },
      { x: 52, y: 30 },
      { x: 66, y: 40 },
      { x: 52, y: 52 },
      { x: 44, y: 56 },
      { x: 56, y: 60 },
      { x: 68, y: 72 },
      { x: 58, y: 84 },
      { x: 42, y: 84 },
      { x: 66, y: 74 },
    ]),
    [
      { x: 68, y: 30 },
      { x: 68, y: 86 },
    ],
    [
      { x: 68, y: 30 },
      { x: 56, y: 16 },
    ],
  ],
};

// ============================================================================
// ENGLISH ALPHABET (A to Z)
// ============================================================================
const ENGLISH_LETTERS: Record<string, Point2D[][]> = {
  'A': [
    [
      { x: 50, y: 24 },
      { x: 30, y: 86 },
    ],
    [
      { x: 50, y: 24 },
      { x: 70, y: 86 },
    ],
    [
      { x: 38, y: 62 },
      { x: 62, y: 62 },
    ],
  ],
  'B': [
    [
      { x: 34, y: 24 },
      { x: 34, y: 86 },
    ],
    sampleCurve([
      { x: 34, y: 24 },
      { x: 62, y: 24 },
      { x: 66, y: 40 },
      { x: 50, y: 52 },
      { x: 34, y: 52 },
    ]),
    sampleCurve([
      { x: 34, y: 52 },
      { x: 66, y: 52 },
      { x: 70, y: 70 },
      { x: 54, y: 86 },
      { x: 34, y: 86 },
    ]),
  ],
  'C': [
    sampleCurve([
      { x: 68, y: 34 },
      { x: 50, y: 24 },
      { x: 32, y: 42 },
      { x: 32, y: 68 },
      { x: 50, y: 86 },
      { x: 68, y: 76 },
    ]),
  ],
  'D': [
    [
      { x: 34, y: 24 },
      { x: 34, y: 86 },
    ],
    sampleCurve([
      { x: 34, y: 24 },
      { x: 56, y: 24 },
      { x: 72, y: 44 },
      { x: 72, y: 66 },
      { x: 56, y: 86 },
      { x: 34, y: 86 },
    ]),
  ],
  'E': [
    [
      { x: 34, y: 24 },
      { x: 34, y: 86 },
    ],
    [
      { x: 34, y: 24 },
      { x: 68, y: 24 },
    ],
    [
      { x: 34, y: 54 },
      { x: 60, y: 54 },
    ],
    [
      { x: 34, y: 86 },
      { x: 68, y: 86 },
    ],
  ],
  'F': [
    [
      { x: 34, y: 24 },
      { x: 34, y: 86 },
    ],
    [
      { x: 34, y: 24 },
      { x: 68, y: 24 },
    ],
    [
      { x: 34, y: 54 },
      { x: 58, y: 54 },
    ],
  ],
  'G': [
    sampleCurve([
      { x: 68, y: 34 },
      { x: 50, y: 24 },
      { x: 32, y: 42 },
      { x: 32, y: 68 },
      { x: 50, y: 86 },
      { x: 68, y: 86 },
      { x: 68, y: 56 },
      { x: 52, y: 56 },
    ]),
  ],
  'H': [
    [
      { x: 34, y: 24 },
      { x: 34, y: 86 },
    ],
    [
      { x: 66, y: 24 },
      { x: 66, y: 86 },
    ],
    [
      { x: 34, y: 55 },
      { x: 66, y: 55 },
    ],
  ],
  'I': [
    [
      { x: 50, y: 24 },
      { x: 50, y: 86 },
    ],
    [
      { x: 36, y: 24 },
      { x: 64, y: 24 },
    ],
    [
      { x: 36, y: 86 },
      { x: 64, y: 86 },
    ],
  ],
  'J': [
    sampleCurve([
      { x: 36, y: 24 },
      { x: 64, y: 24 },
    ]),
    sampleCurve([
      { x: 54, y: 24 },
      { x: 54, y: 72 },
      { x: 44, y: 86 },
      { x: 32, y: 76 },
    ]),
  ],
  'K': [
    [
      { x: 34, y: 24 },
      { x: 34, y: 86 },
    ],
    [
      { x: 66, y: 26 },
      { x: 36, y: 56 },
      { x: 68, y: 86 },
    ],
  ],
  'L': [
    [
      { x: 36, y: 24 },
      { x: 36, y: 86 },
      { x: 68, y: 86 },
    ],
  ],
  'M': [
    [
      { x: 32, y: 86 },
      { x: 32, y: 24 },
      { x: 50, y: 58 },
      { x: 68, y: 24 },
      { x: 68, y: 86 },
    ],
  ],
  'N': [
    [
      { x: 34, y: 86 },
      { x: 34, y: 24 },
      { x: 66, y: 86 },
      { x: 66, y: 24 },
    ],
  ],
  'O': [
    makeLoop(50, 55, 20, 29, -Math.PI / 2, Math.PI * 2, 28),
  ],
  'P': [
    [
      { x: 34, y: 24 },
      { x: 34, y: 86 },
    ],
    sampleCurve([
      { x: 34, y: 24 },
      { x: 62, y: 24 },
      { x: 68, y: 40 },
      { x: 54, y: 56 },
      { x: 34, y: 56 },
    ]),
  ],
  'Q': [
    makeLoop(50, 52, 20, 27, -Math.PI / 2, Math.PI * 2, 28),
    [
      { x: 54, y: 64 },
      { x: 72, y: 86 },
    ],
  ],
  'R': [
    [
      { x: 34, y: 24 },
      { x: 34, y: 86 },
    ],
    sampleCurve([
      { x: 34, y: 24 },
      { x: 62, y: 24 },
      { x: 68, y: 40 },
      { x: 54, y: 56 },
      { x: 34, y: 56 },
    ]),
    [
      { x: 50, y: 56 },
      { x: 68, y: 86 },
    ],
  ],
  'S': [
    sampleCurve([
      { x: 66, y: 34 },
      { x: 50, y: 24 },
      { x: 34, y: 36 },
      { x: 44, y: 52 },
      { x: 66, y: 64 },
      { x: 52, y: 84 },
      { x: 34, y: 78 },
    ]),
  ],
  'T': [
    [
      { x: 30, y: 24 },
      { x: 70, y: 24 },
    ],
    [
      { x: 50, y: 24 },
      { x: 50, y: 86 },
    ],
  ],
  'U': [
    sampleCurve([
      { x: 34, y: 24 },
      { x: 34, y: 68 },
      { x: 50, y: 86 },
      { x: 66, y: 68 },
      { x: 66, y: 24 },
    ]),
  ],
  'V': [
    [
      { x: 32, y: 24 },
      { x: 50, y: 86 },
      { x: 68, y: 24 },
    ],
  ],
  'W': [
    [
      { x: 28, y: 24 },
      { x: 40, y: 86 },
      { x: 50, y: 48 },
      { x: 60, y: 86 },
      { x: 72, y: 24 },
    ],
  ],
  'X': [
    [
      { x: 32, y: 24 },
      { x: 68, y: 86 },
    ],
    [
      { x: 68, y: 24 },
      { x: 32, y: 86 },
    ],
  ],
  'Y': [
    [
      { x: 32, y: 24 },
      { x: 50, y: 54 },
      { x: 68, y: 24 },
    ],
    [
      { x: 50, y: 54 },
      { x: 50, y: 86 },
    ],
  ],
  'Z': [
    [
      { x: 32, y: 24 },
      { x: 68, y: 24 },
      { x: 32, y: 86 },
      { x: 68, y: 86 },
    ],
  ],
};

/**
 * Fallback procedural stroke generator for any glyph not explicitly defined.
 * Generates an accurate 3-segment skeleton (top arch, center body, vertical stem).
 */
function generateProceduralStrokes(char: string): Point2D[][] {
  const code = char.charCodeAt(0);
  const isAscii = code < 128;

  if (isAscii) {
    // Basic letter/digit procedural skeleton
    return [
      sampleCurve([
        { x: 34, y: 30 },
        { x: 50, y: 24 },
        { x: 66, y: 38 },
        { x: 50, y: 56 },
        { x: 36, y: 74 },
        { x: 56, y: 84 },
        { x: 68, y: 72 },
      ]),
    ];
  }

  // Gujarati / Indic general curved body with right stem
  return [
    sampleCurve([
      { x: 34, y: 34 },
      { x: 48, y: 28 },
      { x: 58, y: 44 },
      { x: 46, y: 58 },
      { x: 36, y: 72 },
      { x: 54, y: 82 },
      { x: 68, y: 74 },
    ]),
    [
      { x: 68, y: 26 },
      { x: 68, y: 86 },
    ],
  ];
}

/**
 * Support for Gujarati compound characters / Barakhadi (e.g. 'ખા', 'ખી', 'કુ', etc.).
 * Combines base consonant with vowel matra in a unified composite glyph.
 */
export function getCompoundGujaratiStrokes(text: string): Point2D[][] | null {
  const chars = Array.from(text);
  if (chars.length === 2 && GUJARATI_LETTERS[chars[0]]) {
    const baseStrokes = GUJARATI_LETTERS[chars[0]];
    const matra = chars[1];

    if (matra === 'ા' || matra === '\u0ABE') {
      const scaledBase = baseStrokes.map((stroke) =>
        stroke.map((p) => ({ x: 14 + (p.x / 100) * 60, y: p.y }))
      );
      const kanoStroke: Point2D[] = [
        { x: 84, y: 22 },
        { x: 84, y: 88 },
      ];
      return [...scaledBase, kanoStroke];
    } else if (matra === 'િ' || matra === '\u0ABF') {
      const scaledBase = baseStrokes.map((stroke) =>
        stroke.map((p) => ({ x: 26 + (p.x / 100) * 62, y: p.y }))
      );
      const iCurve = sampleCurve([
        { x: 78, y: 24 },
        { x: 50, y: 14 },
        { x: 18, y: 24 },
        { x: 18, y: 88 },
      ]);
      return [iCurve, ...scaledBase];
    } else if (matra === 'ી' || matra === '\u0AC0') {
      const scaledBase = baseStrokes.map((stroke) =>
        stroke.map((p) => ({ x: 14 + (p.x / 100) * 62, y: p.y }))
      );
      const iiCurve = sampleCurve([
        { x: 50, y: 24 },
        { x: 74, y: 14 },
        { x: 86, y: 24 },
        { x: 86, y: 88 },
      ]);
      return [...scaledBase, iiCurve];
    } else if (matra === 'ુ' || matra === '\u0AC1') {
      const uHook = sampleCurve([
        { x: 50, y: 84 },
        { x: 38, y: 92 },
        { x: 44, y: 98 },
        { x: 54, y: 92 },
      ]);
      return [...baseStrokes, uHook];
    } else if (matra === 'ૂ' || matra === '\u0AC2') {
      const uuTail = sampleCurve([
        { x: 50, y: 84 },
        { x: 62, y: 92 },
        { x: 68, y: 98 },
      ]);
      return [...baseStrokes, uuTail];
    } else if (matra === 'ે' || matra === '\u0AC7') {
      const eStroke = [
        { x: 42, y: 24 },
        { x: 56, y: 14 },
      ];
      return [...baseStrokes, eStroke];
    } else if (matra === 'ૈ' || matra === '\u0AC8') {
      return [
        ...baseStrokes,
        [{ x: 38, y: 24 }, { x: 50, y: 14 }],
        [{ x: 48, y: 24 }, { x: 60, y: 14 }],
      ];
    } else if (matra === 'ો' || matra === '\u0ACB') {
      const scaledBase = baseStrokes.map((stroke) =>
        stroke.map((p) => ({ x: 14 + (p.x / 100) * 60, y: p.y }))
      );
      return [
        ...scaledBase,
        [{ x: 84, y: 22 }, { x: 84, y: 88 }],
        [{ x: 74, y: 24 }, { x: 86, y: 14 }],
      ];
    } else if (matra === 'ૌ' || matra === '\u0ACC') {
      const scaledBase = baseStrokes.map((stroke) =>
        stroke.map((p) => ({ x: 14 + (p.x / 100) * 60, y: p.y }))
      );
      return [
        ...scaledBase,
        [{ x: 84, y: 22 }, { x: 84, y: 88 }],
        [{ x: 72, y: 24 }, { x: 82, y: 14 }],
        [{ x: 80, y: 24 }, { x: 90, y: 14 }],
      ];
    } else if (matra === 'ં' || matra === '\u0A82') {
      return [...baseStrokes, makeLoop(54, 16, 4, 4)];
    } else if (matra === 'ઃ' || matra === '\u0A83') {
      return [
        ...baseStrokes,
        makeLoop(80, 44, 4, 4),
        makeLoop(80, 68, 4, 4),
      ];
    }
  }
  return null;
}

/**
 * Retrieves raw normalized [0..100] strokes for any single character.
 */
export function getSingleCharacterStrokes(char: string, language?: string): Point2D[][] {
  const structuredDef = getCharacterStrokeDefinition(char, language);
  if (structuredDef) {
    return structuredDef.strokes.map((s) => s.points);
  }
  const compound = getCompoundGujaratiStrokes(char);
  if (compound) return compound;
  if (GUJARATI_NUMBERS[char]) return GUJARATI_NUMBERS[char];
  if (ENGLISH_NUMBERS[char]) return ENGLISH_NUMBERS[char];
  if (GUJARATI_LETTERS[char]) return GUJARATI_LETTERS[char];
  if (ENGLISH_LETTERS[char.toUpperCase()]) return ENGLISH_LETTERS[char.toUpperCase()];
  return generateProceduralStrokes(char);
}

export interface ScaledTrajectoryData {
  referencePoints: Point2D[];
  strokes: { id: string; points: Point2D[] }[];
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
  totalPathLength: number;
}

/**
 * Maps multi-character string or single symbol to canvas coordinates [width x height],
 * maintaining correct aspect ratio and spacing between notebook guidelines.
 */
export function getScaledCharacterTrajectory(
  text: string,
  canvasWidth: number,
  canvasHeight: number,
  language?: string
): ScaledTrajectoryData {
  return getModularScaledTrajectory(text, canvasWidth, canvasHeight, language);
}
