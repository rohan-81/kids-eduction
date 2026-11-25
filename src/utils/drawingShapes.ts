export type TraceShapeId =
  | 'star'
  | 'sun'
  | 'apple'
  | 'balloon'
  | 'flower'
  | 'car'
  | 'house'
  | 'butterfly'
  | 'fish'
  | 'blank';

export interface TraceShapeDef {
  id: TraceShapeId;
  emoji: string;
  nameGu: string;
  nameHi: string;
  nameEn: string;
  startHintGu: string;
  startHintHi: string;
  startHintEn: string;
  startPoint: { x: number; y: number };
}

export const TRACE_SHAPES: TraceShapeDef[] = [
  {
    id: 'star',
    emoji: '⭐',
    nameGu: 'તારો',
    nameHi: 'तारा',
    nameEn: 'Star',
    startHintGu: 'ઉપરથી શરૂ કરો ➔',
    startHintHi: 'ऊपर से शुरू करें ➔',
    startHintEn: 'Start at top ➔',
    startPoint: { x: 160, y: 35 },
  },
  {
    id: 'sun',
    emoji: '☀️',
    nameGu: 'સૂર્ય',
    nameHi: 'सूरज',
    nameEn: 'Sun',
    startHintGu: 'ગોળ ફેરો ➔',
    startHintHi: 'गोल घुमाओ ➔',
    startHintEn: 'Circle around ➔',
    startPoint: { x: 160, y: 102 },
  },
  {
    id: 'apple',
    emoji: '🍎',
    nameGu: 'સફરજન',
    nameHi: 'सेब',
    nameEn: 'Apple',
    startHintGu: 'દાળખીથી દોરો ➔',
    startHintHi: 'ડંડી સે બનાઓ ➔',
    startHintEn: 'Start at stem ➔',
    startPoint: { x: 160, y: 95 },
  },
  {
    id: 'balloon',
    emoji: '🎈',
    nameGu: 'ફુગ્ગો',
    nameHi: 'गुब्बारा',
    nameEn: 'Balloon',
    startHintGu: 'ઉપરથી ગોળ ➔',
    startHintHi: 'ऊपर से गोल ➔',
    startHintEn: 'Top to bottom ➔',
    startPoint: { x: 160, y: 35 },
  },
  {
    id: 'flower',
    emoji: '🌸',
    nameGu: 'ફૂલ',
    nameHi: 'फूल',
    nameEn: 'Flower',
    startHintGu: 'પાંખડીઓ જોડો ➔',
    startHintHi: 'पंखुड़ियां जोड़ो ➔',
    startHintEn: 'Trace petals ➔',
    startPoint: { x: 160, y: 56 },
  },
  {
    id: 'car',
    emoji: '🚗',
    nameGu: 'ગાડી',
    nameHi: 'गाड़ी',
    nameEn: 'Car',
    startHintGu: 'છતથી શરૂ કરો ➔',
    startHintHi: 'छत से शुरू करें ➔',
    startHintEn: 'Start at roof ➔',
    startPoint: { x: 120, y: 90 },
  },
  {
    id: 'house',
    emoji: '🏠',
    nameGu: 'ઘર',
    nameHi: 'घर',
    nameEn: 'House',
    startHintGu: 'છાપરાથી દોરો ➔',
    startHintHi: 'छत से बनाओ ➔',
    startHintEn: 'Start at roof ➔',
    startPoint: { x: 160, y: 55 },
  },
  {
    id: 'butterfly',
    emoji: '🦋',
    nameGu: 'પતંગિયું',
    nameHi: 'तितली',
    nameEn: 'Butterfly',
    startHintGu: 'પાંખો દોરો ➔',
    startHintHi: 'पंख बनाओ ➔',
    startHintEn: 'Trace wings ➔',
    startPoint: { x: 160, y: 86 },
  },
  {
    id: 'fish',
    emoji: '🐟',
    nameGu: 'માછલી',
    nameHi: 'मछली',
    nameEn: 'Fish',
    startHintGu: 'મોંથી પૂંછડી ➔',
    startHintHi: 'मुंह से पूंछ ➔',
    startHintEn: 'Mouth to tail ➔',
    startPoint: { x: 45, y: 160 },
  },
  {
    id: 'blank',
    emoji: '✏️',
    nameGu: 'મુક્ત ડ્રોઇંગ',
    nameHi: 'मुक्त ड्राइंग',
    nameEn: 'Free Draw',
    startHintGu: 'મનપસંદ ચિત્ર દોરો!',
    startHintHi: 'मनपसंद चित्र बनाएं!',
    startHintEn: 'Draw freely!',
    startPoint: { x: 0, y: 0 },
  },
];

export interface TargetDot {
  id: number;
  x: number;
  y: number;
}

function cubicBezierPoint(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  t: number
) {
  const oneMinusT = 1 - t;
  const c0 = oneMinusT * oneMinusT * oneMinusT;
  const c1 = 3 * oneMinusT * oneMinusT * t;
  const c2 = 3 * oneMinusT * t * t;
  const c3 = t * t * t;
  return {
    x: c0 * p0.x + c1 * p1.x + c2 * p2.x + c3 * p3.x,
    y: c0 * p0.y + c1 * p1.y + c2 * p2.y + c3 * p3.y,
  };
}

function quadBezierPoint(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  t: number
) {
  const oneMinusT = 1 - t;
  const c0 = oneMinusT * oneMinusT;
  const c1 = 2 * oneMinusT * t;
  const c2 = t * t;
  return {
    x: c0 * p0.x + c1 * p1.x + c2 * p2.x,
    y: c0 * p0.y + c1 * p1.y + c2 * p2.y,
  };
}

/**
 * Generates accurately spaced target dots along each shape's dotted guide outline.
 * Every single dot lies exactly on the parametric SVG equations used in renderDottedGuide.
 */
export function getShapeTargetDots(shapeId: TraceShapeId): TargetDot[] {
  const rawDots: { x: number; y: number }[] = [];

  const addPoint = (x: number, y: number) => {
    rawDots.push({ x: Math.round(x), y: Math.round(y) });
  };

  const sampleLine = (x1: number, y1: number, x2: number, y2: number, steps?: number) => {
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const n = Math.max(steps || 1, Math.ceil(dist / 12));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      addPoint(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t);
    }
  };

  const sampleCircle = (cx: number, cy: number, r: number, steps?: number) => {
    const circum = 2 * Math.PI * r;
    const n = Math.max(steps || 8, Math.ceil(circum / 12));
    for (let i = 0; i < n; i++) {
      const angle = -Math.PI / 2 + (i / n) * Math.PI * 2;
      addPoint(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
    }
  };

  const sampleEllipse = (cx: number, cy: number, rx: number, ry: number, steps?: number) => {
    const circum = Math.PI * (rx + ry);
    const n = Math.max(steps || 8, Math.ceil(circum / 12));
    for (let i = 0; i < n; i++) {
      const angle = -Math.PI / 2 + (i / n) * Math.PI * 2;
      addPoint(cx + rx * Math.cos(angle), cy + ry * Math.sin(angle));
    }
  };

  const sampleCubic = (
    p0: { x: number; y: number },
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    p3: { x: number; y: number },
    steps?: number
  ) => {
    const approx =
      Math.hypot(p1.x - p0.x, p1.y - p0.y) +
      Math.hypot(p2.x - p1.x, p2.y - p1.y) +
      Math.hypot(p3.x - p2.x, p3.y - p2.y);
    const n = Math.max(steps || 4, Math.ceil(approx / 12));
    for (let i = 0; i <= n; i++) {
      const pt = cubicBezierPoint(p0, p1, p2, p3, i / n);
      addPoint(pt.x, pt.y);
    }
  };

  const sampleQuad = (
    p0: { x: number; y: number },
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    steps?: number
  ) => {
    const approx = Math.hypot(p1.x - p0.x, p1.y - p0.y) + Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const n = Math.max(steps || 4, Math.ceil(approx / 12));
    for (let i = 0; i <= n; i++) {
      const pt = quadBezierPoint(p0, p1, p2, i / n);
      addPoint(pt.x, pt.y);
    }
  };

  switch (shapeId) {
    case 'star': {
      const v = [
        { x: 160, y: 35 },
        { x: 198, y: 118 },
        { x: 288, y: 122 },
        { x: 218, y: 178 },
        { x: 242, y: 265 },
        { x: 160, y: 215 },
        { x: 78, y: 265 },
        { x: 102, y: 178 },
        { x: 32, y: 122 },
        { x: 122, y: 118 },
      ];
      for (let i = 0; i < v.length; i++) {
        const p1 = v[i];
        const p2 = v[(i + 1) % v.length];
        sampleLine(p1.x, p1.y, p2.x, p2.y, 3);
      }
      break;
    }

    case 'sun': {
      sampleCircle(160, 160, 58, 16);
      sampleLine(160, 82, 160, 30, 2);
      sampleLine(160, 238, 160, 290, 2);
      sampleLine(82, 160, 30, 160, 2);
      sampleLine(238, 160, 290, 160, 2);
      sampleLine(105, 105, 68, 68, 2);
      sampleLine(215, 105, 252, 68, 2);
      sampleLine(105, 215, 68, 252, 2);
      sampleLine(215, 215, 252, 252, 2);
      sampleQuad({ x: 144, y: 175 }, { x: 160, y: 190 }, { x: 176, y: 175 }, 3);
      break;
    }

    case 'apple': {
      sampleCubic({ x: 160, y: 95 }, { x: 130, y: 65 }, { x: 72, y: 75 }, { x: 72, y: 140 }, 6);
      sampleCubic({ x: 72, y: 140 }, { x: 72, y: 210 }, { x: 130, y: 270 }, { x: 160, y: 285 }, 6);
      sampleCubic({ x: 160, y: 285 }, { x: 190, y: 270 }, { x: 248, y: 210 }, { x: 248, y: 140 }, 6);
      sampleCubic({ x: 248, y: 140 }, { x: 248, y: 75 }, { x: 190, y: 65 }, { x: 160, y: 95 }, 6);
      sampleQuad({ x: 160, y: 95 }, { x: 165, y: 55 }, { x: 185, y: 42 }, 4);
      sampleQuad({ x: 165, y: 72 }, { x: 220, y: 50 }, { x: 225, y: 82 }, 4);
      sampleQuad({ x: 225, y: 82 }, { x: 195, y: 105 }, { x: 165, y: 72 }, 4);
      break;
    }

    case 'balloon': {
      sampleCubic({ x: 160, y: 35 }, { x: 225, y: 35 }, { x: 245, y: 95 }, { x: 245, y: 150 }, 6);
      sampleCubic({ x: 245, y: 150 }, { x: 245, y: 210 }, { x: 195, y: 232 }, { x: 165, y: 238 }, 6);
      sampleLine(165, 238, 160, 244, 2);
      sampleLine(160, 244, 155, 238, 2);
      sampleCubic({ x: 155, y: 238 }, { x: 125, y: 232 }, { x: 75, y: 210 }, { x: 75, y: 150 }, 6);
      sampleCubic({ x: 75, y: 150 }, { x: 75, y: 95 }, { x: 95, y: 35 }, { x: 160, y: 35 }, 6);
      sampleLine(152, 244, 168, 244, 2);
      sampleLine(168, 244, 160, 256, 1);
      sampleLine(160, 256, 152, 244, 1);
      sampleQuad({ x: 160, y: 256 }, { x: 142, y: 280 }, { x: 162, y: 300 }, 4);
      sampleQuad({ x: 162, y: 300 }, { x: 172, y: 310 }, { x: 160, y: 320 }, 4);
      break;
    }

    case 'flower': {
      sampleCircle(160, 82, 26, 8);
      sampleCircle(210, 110, 26, 8);
      sampleCircle(210, 170, 26, 8);
      sampleCircle(160, 198, 26, 8);
      sampleCircle(110, 170, 26, 8);
      sampleCircle(110, 110, 26, 8);
      sampleCircle(160, 140, 28, 8);
      sampleQuad({ x: 160, y: 224 }, { x: 166, y: 265 }, { x: 160, y: 305 }, 4);
      sampleQuad({ x: 162, y: 260 }, { x: 200, y: 248 }, { x: 206, y: 270 }, 3);
      sampleQuad({ x: 206, y: 270 }, { x: 188, y: 280 }, { x: 162, y: 268 }, 3);
      break;
    }

    case 'car': {
      sampleLine(85, 150, 120, 90, 3);
      sampleLine(120, 90, 200, 90, 4);
      sampleLine(200, 90, 235, 150, 3);
      sampleLine(45, 150, 275, 150, 7);
      sampleQuad({ x: 275, y: 150 }, { x: 285, y: 150 }, { x: 285, y: 170 }, 2);
      sampleLine(285, 170, 285, 200, 2);
      sampleQuad({ x: 285, y: 200 }, { x: 285, y: 210 }, { x: 275, y: 210 }, 2);
      sampleLine(275, 210, 245, 210, 2);
      sampleCubic({ x: 245, y: 210 }, { x: 245, y: 182 }, { x: 195, y: 182 }, { x: 195, y: 210 }, 5);
      sampleLine(195, 210, 125, 210, 3);
      sampleCubic({ x: 125, y: 210 }, { x: 125, y: 182 }, { x: 75, y: 182 }, { x: 75, y: 210 }, 5);
      sampleLine(75, 210, 45, 210, 2);
      sampleQuad({ x: 45, y: 210 }, { x: 35, y: 210 }, { x: 35, y: 200 }, 2);
      sampleLine(35, 200, 35, 170, 2);
      sampleQuad({ x: 35, y: 170 }, { x: 35, y: 150 }, { x: 45, y: 150 }, 2);
      sampleCircle(100, 210, 24, 8);
      sampleCircle(220, 210, 24, 8);
      break;
    }

    case 'house': {
      sampleLine(50, 145, 160, 55, 4);
      sampleLine(160, 55, 270, 145, 4);
      sampleLine(270, 145, 50, 145, 6);
      sampleLine(72, 145, 72, 275, 4);
      sampleLine(72, 275, 248, 275, 6);
      sampleLine(248, 275, 248, 145, 4);
      sampleLine(135, 275, 135, 200, 3);
      sampleLine(135, 200, 185, 200, 2);
      sampleLine(185, 200, 185, 275, 3);
      sampleLine(92, 175, 124, 175, 2);
      sampleLine(124, 175, 124, 207, 2);
      sampleLine(124, 207, 92, 207, 2);
      sampleLine(92, 207, 92, 175, 2);
      break;
    }

    case 'butterfly': {
      sampleCircle(160, 100, 14, 6);
      sampleEllipse(160, 165, 10, 52, 12);
      sampleCubic({ x: 152, y: 130 }, { x: 85, y: 80 }, { x: 45, y: 140 }, { x: 152, y: 180 }, 7);
      sampleCubic({ x: 168, y: 130 }, { x: 235, y: 80 }, { x: 275, y: 140 }, { x: 168, y: 180 }, 7);
      sampleCubic({ x: 152, y: 180 }, { x: 95, y: 210 }, { x: 110, y: 250 }, { x: 155, y: 210 }, 6);
      sampleCubic({ x: 168, y: 180 }, { x: 225, y: 210 }, { x: 210, y: 250 }, { x: 165, y: 210 }, 6);
      break;
    }

    case 'fish': {
      sampleCubic({ x: 230, y: 160 }, { x: 180, y: 85 }, { x: 75, y: 105 }, { x: 45, y: 160 }, 8);
      sampleCubic({ x: 45, y: 160 }, { x: 75, y: 215 }, { x: 180, y: 235 }, { x: 230, y: 160 }, 8);
      sampleLine(225, 160, 275, 115, 3);
      sampleLine(275, 115, 260, 160, 3);
      sampleLine(260, 160, 275, 205, 3);
      sampleLine(275, 205, 225, 160, 3);
      sampleCircle(85, 148, 6, 4);
      break;
    }

    case 'blank':
    default:
      break;
  }

  const uniqueDots: TargetDot[] = [];
  for (const d of rawDots) {
    const isTooClose = uniqueDots.some((u) => Math.hypot(u.x - d.x, u.y - d.y) < 14);
    if (!isTooClose) {
      uniqueDots.push({ id: uniqueDots.length, x: d.x, y: d.y });
    }
  }

  return uniqueDots;
}
