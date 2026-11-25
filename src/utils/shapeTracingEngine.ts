import { TraceShapeId, TargetDot } from './drawingShapes';

export interface Point2D {
  x: number;
  y: number;
}

export interface TracingPathSegment {
  pathId: string;
  nameGu: string;
  nameHi: string;
  nameEn: string;
  isClosed: boolean;
  densePoints: Point2D[];
  dots: TargetDot[];
}

export interface ShapeTracingModel {
  shapeId: TraceShapeId;
  segments: TracingPathSegment[];
  allDots: TargetDot[];
  totalDots: number;
  startPoint: Point2D;
}

// Distance between two points
export function distance(p1: Point2D, p2: Point2D): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

// Distance from point to line segment
export function distanceToSegment(
  p: Point2D,
  a: Point2D,
  b: Point2D
): { dist: number; projected: Point2D; t: number } {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) {
    return { dist: distance(p, a), projected: { ...a }, t: 0 };
  }
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  const projected = {
    x: a.x + t * dx,
    y: a.y + t * dy,
  };
  return { dist: distance(p, projected), projected, t };
}

// Cubic Bézier formula
function cubicBezier(p0: Point2D, p1: Point2D, p2: Point2D, p3: Point2D, t: number): Point2D {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  return {
    x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
  };
}

// Quadratic Bézier formula
function quadBezier(p0: Point2D, p1: Point2D, p2: Point2D, t: number): Point2D {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
}

// High-density sampling helper for a path
class PathSampler {
  dense: Point2D[] = [];

  addLine(p1: Point2D, p2: Point2D, stepDist = 3) {
    const len = distance(p1, p2);
    const steps = Math.max(1, Math.ceil(len / stepDist));
    for (let i = (this.dense.length === 0 ? 0 : 1); i <= steps; i++) {
      const t = i / steps;
      this.dense.push({
        x: Math.round((p1.x + (p2.x - p1.x) * t) * 10) / 10,
        y: Math.round((p1.y + (p2.y - p1.y) * t) * 10) / 10,
      });
    }
  }

  addCircle(cx: number, cy: number, r: number, startAngle = -Math.PI / 2, stepDist = 3) {
    const circum = 2 * Math.PI * r;
    const steps = Math.max(8, Math.ceil(circum / stepDist));
    for (let i = 0; i <= steps; i++) {
      const angle = startAngle + (i / steps) * Math.PI * 2;
      this.dense.push({
        x: Math.round((cx + r * Math.cos(angle)) * 10) / 10,
        y: Math.round((cy + r * Math.sin(angle)) * 10) / 10,
      });
    }
  }

  addEllipse(cx: number, cy: number, rx: number, ry: number, stepDist = 3) {
    const circum = Math.PI * (rx + ry);
    const steps = Math.max(8, Math.ceil(circum / stepDist));
    for (let i = 0; i <= steps; i++) {
      const angle = -Math.PI / 2 + (i / steps) * Math.PI * 2;
      this.dense.push({
        x: Math.round((cx + rx * Math.cos(angle)) * 10) / 10,
        y: Math.round((cy + ry * Math.sin(angle)) * 10) / 10,
      });
    }
  }

  addCubic(p0: Point2D, p1: Point2D, p2: Point2D, p3: Point2D, stepDist = 3) {
    const chord = distance(p0, p1) + distance(p1, p2) + distance(p2, p3);
    const steps = Math.max(4, Math.ceil(chord / stepDist));
    for (let i = (this.dense.length === 0 ? 0 : 1); i <= steps; i++) {
      const pt = cubicBezier(p0, p1, p2, p3, i / steps);
      this.dense.push({
        x: Math.round(pt.x * 10) / 10,
        y: Math.round(pt.y * 10) / 10,
      });
    }
  }

  addQuad(p0: Point2D, p1: Point2D, p2: Point2D, stepDist = 3) {
    const chord = distance(p0, p1) + distance(p1, p2);
    const steps = Math.max(4, Math.ceil(chord / stepDist));
    for (let i = (this.dense.length === 0 ? 0 : 1); i <= steps; i++) {
      const pt = quadBezier(p0, p1, p2, i / steps);
      this.dense.push({
        x: Math.round(pt.x * 10) / 10,
        y: Math.round(pt.y * 10) / 10,
      });
    }
  }
}

/**
 * Extracts evenly spaced guide target dots along dense path points
 */
function extractGuideDots(
  densePoints: Point2D[],
  startId: number,
  pathIndex: number,
  spacing = 20
): TargetDot[] {
  if (densePoints.length === 0) return [];
  const dots: TargetDot[] = [];

  let accumulated = 0;
  dots.push({
    id: startId,
    x: Math.round(densePoints[0].x),
    y: Math.round(densePoints[0].y),
  });

  for (let i = 1; i < densePoints.length; i++) {
    const d = distance(densePoints[i - 1], densePoints[i]);
    accumulated += d;
    if (accumulated >= spacing) {
      dots.push({
        id: startId + dots.length,
        x: Math.round(densePoints[i].x),
        y: Math.round(densePoints[i].y),
      });
      accumulated = 0;
    }
  }

  // Ensure last point has a dot if not closed or distance is significant
  const lastDense = densePoints[densePoints.length - 1];
  const lastDot = dots[dots.length - 1];
  if (distance(lastDot, lastDense) >= spacing * 0.6) {
    dots.push({
      id: startId + dots.length,
      x: Math.round(lastDense.x),
      y: Math.round(lastDense.y),
    });
  }

  return dots;
}

/**
 * Builds the complete multi-segment reference tracing model for any shape
 */
export function buildShapeTracingModel(shapeId: TraceShapeId): ShapeTracingModel {
  const segments: TracingPathSegment[] = [];
  let dotCounter = 0;

  const createSegment = (
    pathId: string,
    nameGu: string,
    nameHi: string,
    nameEn: string,
    isClosed: boolean,
    builder: (s: PathSampler) => void,
    dotSpacing = 20
  ) => {
    const s = new PathSampler();
    builder(s);
    const dots = extractGuideDots(s.dense, dotCounter, segments.length, dotSpacing);
    dotCounter += dots.length;
    segments.push({
      pathId,
      nameGu,
      nameHi,
      nameEn,
      isClosed,
      densePoints: s.dense,
      dots,
    });
  };

  switch (shapeId) {
    case 'star': {
      const v: Point2D[] = [
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
      createSegment('star-outline', 'તારાનો આકાર', 'तारे का आकार', 'Star Outline', true, (s) => {
        for (let i = 0; i < v.length; i++) {
          s.addLine(v[i], v[(i + 1) % v.length], 2.5);
        }
      }, 19);
      break;
    }

    case 'sun': {
      // Circle head
      createSegment('sun-circle', 'સૂર્યનું ગોળ', 'सूरज का गोला', 'Sun Center', true, (s) => {
        s.addCircle(160, 160, 58, -Math.PI / 2, 2.5);
      }, 20);

      // 8 Rays
      const rays: [Point2D, Point2D, string, string, string][] = [
        [{ x: 160, y: 82 }, { x: 160, y: 30 }, 'ઉપરનું કિરણ', 'ऊपर की किरण', 'Top Ray'],
        [{ x: 215, y: 105 }, { x: 252, y: 68 }, 'જમણી-ઉપર કિરણ', 'दाएं-ऊपर किरण', 'Top-Right Ray'],
        [{ x: 238, y: 160 }, { x: 290, y: 160 }, 'જમણું કિરણ', 'दाहिनी किरण', 'Right Ray'],
        [{ x: 215, y: 215 }, { x: 252, y: 252 }, 'જમણી-નીચે કિરણ', 'दाएं-नीचे किरण', 'Bottom-Right Ray'],
        [{ x: 160, y: 238 }, { x: 160, y: 290 }, 'નીચેનું કિરણ', 'नीचे की किरण', 'Bottom Ray'],
        [{ x: 105, y: 215 }, { x: 68, y: 252 }, 'ડાબી-નીચે કિરણ', 'बाएं-नीचे किरण', 'Bottom-Left Ray'],
        [{ x: 82, y: 160 }, { x: 30, y: 160 }, 'ડાબું કિરણ', 'बाईं किरण', 'Left Ray'],
        [{ x: 105, y: 105 }, { x: 68, y: 68 }, 'ડાબી-ઉપર કિરણ', 'बाएं-ऊपर किरण', 'Top-Left Ray'],
      ];

      rays.forEach(([p1, p2, nameGu, nameHi, nameEn], idx) => {
        createSegment(`ray-${idx + 1}`, nameGu, nameHi, nameEn, false, (s) => {
          s.addLine(p1, p2, 2.5);
        }, 18);
      });

      // Smile
      createSegment('sun-smile', 'હસતું મોં', 'मुस्कान', 'Smile', false, (s) => {
        s.addQuad({ x: 144, y: 175 }, { x: 160, y: 190 }, { x: 176, y: 175 }, 2);
      }, 16);
      break;
    }

    case 'apple': {
      createSegment('apple-body', 'સફરજનનો આકાર', 'सेब का आकार', 'Apple Body', true, (s) => {
        s.addCubic({ x: 160, y: 95 }, { x: 130, y: 65 }, { x: 72, y: 75 }, { x: 72, y: 140 }, 2.5);
        s.addCubic({ x: 72, y: 140 }, { x: 72, y: 210 }, { x: 130, y: 270 }, { x: 160, y: 285 }, 2.5);
        s.addCubic({ x: 160, y: 285 }, { x: 190, y: 270 }, { x: 248, y: 210 }, { x: 248, y: 140 }, 2.5);
        s.addCubic({ x: 248, y: 140 }, { x: 248, y: 75 }, { x: 190, y: 65 }, { x: 160, y: 95 }, 2.5);
      }, 20);

      createSegment('apple-stem', 'સફરજનની દાંડી', 'सेब की डंडी', 'Apple Stem', false, (s) => {
        s.addQuad({ x: 160, y: 95 }, { x: 165, y: 55 }, { x: 185, y: 42 }, 2.5);
      }, 16);

      createSegment('apple-leaf', 'લીલું પાંદડું', 'हरा पत्ता', 'Apple Leaf', true, (s) => {
        s.addQuad({ x: 165, y: 72 }, { x: 220, y: 50 }, { x: 225, y: 82 }, 2.5);
        s.addQuad({ x: 225, y: 82 }, { x: 195, y: 105 }, { x: 165, y: 72 }, 2.5);
      }, 18);
      break;
    }

    case 'balloon': {
      createSegment('balloon-body', 'ફુગ્ગાનો આકાર', 'गुब्बारे का गोला', 'Balloon Body', true, (s) => {
        s.addCubic({ x: 160, y: 35 }, { x: 225, y: 35 }, { x: 245, y: 95 }, { x: 245, y: 150 }, 2.5);
        s.addCubic({ x: 245, y: 150 }, { x: 245, y: 210 }, { x: 195, y: 232 }, { x: 165, y: 238 }, 2.5);
        s.addLine({ x: 165, y: 238 }, { x: 160, y: 244 }, 2.5);
        s.addLine({ x: 160, y: 244 }, { x: 155, y: 238 }, 2.5);
        s.addCubic({ x: 155, y: 238 }, { x: 125, y: 232 }, { x: 75, y: 210 }, { x: 75, y: 150 }, 2.5);
        s.addCubic({ x: 75, y: 150 }, { x: 75, y: 95 }, { x: 95, y: 35 }, { x: 160, y: 35 }, 2.5);
      }, 21);

      createSegment('balloon-knot', 'ફુગ્ગાની ગાંઠ', 'गांठ', 'Balloon Knot', true, (s) => {
        s.addLine({ x: 152, y: 244 }, { x: 168, y: 244 }, 2);
        s.addLine({ x: 168, y: 244 }, { x: 160, y: 256 }, 2);
        s.addLine({ x: 160, y: 256 }, { x: 152, y: 244 }, 2);
      }, 14);

      createSegment('balloon-string', 'લટકતી દોરી', 'धागा', 'Curly String', false, (s) => {
        s.addQuad({ x: 160, y: 256 }, { x: 142, y: 280 }, { x: 162, y: 300 }, 2.5);
        s.addQuad({ x: 162, y: 300 }, { x: 175, y: 315 }, { x: 158, y: 335 }, 2.5);
      }, 18);
      break;
    }

    case 'flower': {
      createSegment('flower-center', 'ફૂલનું કેન્દ્ર', 'फूल का केंद्र', 'Flower Center', true, (s) => {
        s.addCircle(160, 140, 28, -Math.PI / 2, 2.5);
      }, 19);

      const petals: [number, number, string, string, string][] = [
        [160, 82, 'ઉપરની પાંખડી', 'ऊपर की पंखुड़ी', 'Top Petal'],
        [210, 110, 'જમણી-ઉપર પાંખડી', 'दाएं-ऊपर पंखुड़ी', 'Top-Right Petal'],
        [210, 170, 'જમણી-નીચે પાંખડી', 'दाएं-नीचे पंखुड़ी', 'Bottom-Right Petal'],
        [160, 198, 'નીચેની પાંખડી', 'नीचे की पंखुड़ी', 'Bottom Petal'],
        [110, 170, 'ડાબી-નીચે પાંખડી', 'बाएं-नीचे पंखुड़ी', 'Bottom-Left Petal'],
        [110, 110, 'ડાબી-ઉપર પાંખડી', 'बाएं-ऊपर पंखुड़ी', 'Top-Left Petal'],
      ];

      petals.forEach(([cx, cy, nameGu, nameHi, nameEn], idx) => {
        createSegment(`petal-${idx + 1}`, nameGu, nameHi, nameEn, true, (s) => {
          s.addCircle(cx, cy, 26, -Math.PI / 2, 2.5);
        }, 19);
      });

      createSegment('flower-stem', 'દાંડી', 'डंडी', 'Stem', false, (s) => {
        s.addQuad({ x: 160, y: 224 }, { x: 166, y: 265 }, { x: 160, y: 305 }, 2.5);
      }, 18);

      createSegment('flower-leaf', 'પાંદડું', 'पत्ता', 'Leaf', true, (s) => {
        s.addQuad({ x: 162, y: 260 }, { x: 200, y: 248 }, { x: 206, y: 270 }, 2.5);
        s.addQuad({ x: 206, y: 270 }, { x: 188, y: 280 }, { x: 162, y: 268 }, 2.5);
      }, 18);
      break;
    }

    case 'car': {
      createSegment('car-roof', 'છત અને કાચ', 'छत और शीशा', 'Roof & Windows', true, (s) => {
        s.addLine({ x: 85, y: 150 }, { x: 120, y: 90 }, 2.5);
        s.addLine({ x: 120, y: 90 }, { x: 200, y: 90 }, 2.5);
        s.addLine({ x: 200, y: 90 }, { x: 235, y: 150 }, 2.5);
        s.addLine({ x: 235, y: 150 }, { x: 85, y: 150 }, 2.5);
      }, 20);

      createSegment('car-body', 'ગાડીની બોડી', 'गाड़ी का शरीर', 'Car Body', true, (s) => {
        s.addLine({ x: 45, y: 150 }, { x: 275, y: 150 }, 2.5);
        s.addQuad({ x: 275, y: 150 }, { x: 285, y: 150 }, { x: 285, y: 170 }, 2);
        s.addLine({ x: 285, y: 170 }, { x: 285, y: 200 }, 2);
        s.addQuad({ x: 285, y: 200 }, { x: 285, y: 210 }, { x: 275, y: 210 }, 2);
        s.addLine({ x: 275, y: 210 }, { x: 245, y: 210 }, 2.5);
        s.addCubic({ x: 245, y: 210 }, { x: 245, y: 182 }, { x: 195, y: 182 }, { x: 195, y: 210 }, 2.5);
        s.addLine({ x: 195, y: 210 }, { x: 125, y: 210 }, 2.5);
        s.addCubic({ x: 125, y: 210 }, { x: 125, y: 182 }, { x: 75, y: 182 }, { x: 75, y: 210 }, 2.5);
        s.addLine({ x: 75, y: 210 }, { x: 45, y: 210 }, 2.5);
        s.addQuad({ x: 45, y: 210 }, { x: 35, y: 210 }, { x: 35, y: 200 }, 2);
        s.addLine({ x: 35, y: 200 }, { x: 35, y: 170 }, 2);
        s.addQuad({ x: 35, y: 170 }, { x: 35, y: 150 }, { x: 45, y: 150 }, 2);
      }, 21);

      createSegment('car-wheel-front', 'આગળનું પૈડું', 'आगे का पहिया', 'Front Wheel', true, (s) => {
        s.addCircle(220, 210, 24, -Math.PI / 2, 2.5);
      }, 19);

      createSegment('car-wheel-rear', 'પાછળનું પૈડું', 'पीछे का पहिया', 'Rear Wheel', true, (s) => {
        s.addCircle(100, 210, 24, -Math.PI / 2, 2.5);
      }, 19);
      break;
    }

    case 'house': {
      createSegment('house-roof', 'ત્રિકોણ છાપરું', 'त्रिकोण छत', 'Roof Triangle', true, (s) => {
        s.addLine({ x: 50, y: 145 }, { x: 160, y: 55 }, 2.5);
        s.addLine({ x: 160, y: 55 }, { x: 270, y: 145 }, 2.5);
        s.addLine({ x: 270, y: 145 }, { x: 50, y: 145 }, 2.5);
      }, 20);

      createSegment('house-walls', 'દીવાલો અને ભોંય', 'दीवारें और फर्श', 'Walls & Floor', false, (s) => {
        s.addLine({ x: 72, y: 145 }, { x: 72, y: 275 }, 2.5);
        s.addLine({ x: 72, y: 275 }, { x: 248, y: 275 }, 2.5);
        s.addLine({ x: 248, y: 275 }, { x: 248, y: 145 }, 2.5);
      }, 20);

      createSegment('house-door', 'દરવાજો', 'दरवाजा', 'Front Door', false, (s) => {
        s.addLine({ x: 135, y: 275 }, { x: 135, y: 200 }, 2.5);
        s.addLine({ x: 135, y: 200 }, { x: 185, y: 200 }, 2.5);
        s.addLine({ x: 185, y: 200 }, { x: 185, y: 275 }, 2.5);
      }, 19);

      createSegment('house-window', 'બારી', 'खिड़की', 'Window', true, (s) => {
        s.addLine({ x: 92, y: 175 }, { x: 124, y: 175 }, 2);
        s.addLine({ x: 124, y: 175 }, { x: 124, y: 207 }, 2);
        s.addLine({ x: 124, y: 207 }, { x: 92, y: 207 }, 2);
        s.addLine({ x: 92, y: 207 }, { x: 92, y: 175 }, 2);
      }, 17);
      break;
    }

    case 'butterfly': {
      createSegment('bf-head', 'માથું', 'सिर', 'Head', true, (s) => {
        s.addCircle(160, 100, 14, -Math.PI / 2, 2);
      }, 14);

      createSegment('bf-body', 'શરીર', 'शरीर', 'Body', true, (s) => {
        s.addEllipse(160, 165, 10, 52, 2.5);
      }, 18);

      createSegment('bf-wing-tl', 'ડાબી-ઉપર પાંખ', 'बाईं-ऊपर पंख', 'Top-Left Wing', false, (s) => {
        s.addCubic({ x: 152, y: 130 }, { x: 85, y: 80 }, { x: 45, y: 140 }, { x: 152, y: 180 }, 2.5);
      }, 19);

      createSegment('bf-wing-tr', 'જમણી-ઉપર પાંખ', 'दाएं-ऊपर पंख', 'Top-Right Wing', false, (s) => {
        s.addCubic({ x: 168, y: 130 }, { x: 235, y: 80 }, { x: 275, y: 140 }, { x: 168, y: 180 }, 2.5);
      }, 19);

      createSegment('bf-wing-bl', 'ડાબી-નીચે પાંખ', 'बाईं-नीचे पंख', 'Bottom-Left Wing', false, (s) => {
        s.addCubic({ x: 152, y: 180 }, { x: 95, y: 210 }, { x: 110, y: 250 }, { x: 155, y: 210 }, 2.5);
      }, 19);

      createSegment('bf-wing-br', 'જમણી-નીચે પાંખ', 'दाएं-नीचे पंख', 'Bottom-Right Wing', false, (s) => {
        s.addCubic({ x: 168, y: 180 }, { x: 225, y: 210 }, { x: 210, y: 250 }, { x: 165, y: 210 }, 2.5);
      }, 19);
      break;
    }

    case 'fish': {
      createSegment('fish-body', 'માછલીનું શરીર', 'मछली का शरीर', 'Fish Body', true, (s) => {
        s.addCubic({ x: 230, y: 160 }, { x: 180, y: 85 }, { x: 75, y: 105 }, { x: 45, y: 160 }, 2.5);
        s.addCubic({ x: 45, y: 160 }, { x: 75, y: 215 }, { x: 180, y: 235 }, { x: 230, y: 160 }, 2.5);
      }, 20);

      createSegment('fish-tail', 'પૂંછડી', 'पूंछ', 'Tail Fin', true, (s) => {
        s.addLine({ x: 225, y: 160 }, { x: 275, y: 115 }, 2);
        s.addLine({ x: 275, y: 115 }, { x: 260, y: 160 }, 2);
        s.addLine({ x: 260, y: 160 }, { x: 275, y: 205 }, 2);
        s.addLine({ x: 275, y: 205 }, { x: 225, y: 160 }, 2);
      }, 17);

      createSegment('fish-eye', 'આંખ', 'आंख', 'Eye', true, (s) => {
        s.addCircle(85, 148, 6, -Math.PI / 2, 2);
      }, 12);
      break;
    }

    case 'blank':
    default:
      break;
  }

  const allDots: TargetDot[] = [];
  segments.forEach((seg) => {
    allDots.push(...seg.dots);
  });

  const startPoint =
    allDots.length > 0 ? { x: allDots[0].x, y: allDots[0].y } : { x: 160, y: 160 };

  return {
    shapeId,
    segments,
    allDots,
    totalDots: allDots.length,
    startPoint,
  };
}

/**
 * Catmull-Rom to Cubic Bézier spline path generator.
 * Produces butter-smooth, continuous G1 curves through points without sharp linear joints!
 */
export function pointsToSmoothSvgPath(pts: Point2D[]): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x},${pts[0].y} L ${pts[0].x},${pts[0].y}`;
  if (pts.length === 2) return `M ${pts[0].x},${pts[0].y} L ${pts[1].x},${pts[1].y}`;

  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = i > 0 ? pts[i - 1] : pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = i < pts.length - 2 ? pts[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${Math.round(cp1x * 10) / 10},${Math.round(cp1y * 10) / 10} ${Math.round(cp2x * 10) / 10},${Math.round(cp2y * 10) / 10} ${Math.round(p2.x * 10) / 10},${Math.round(p2.y * 10) / 10}`;
  }
  return d;
}

/**
 * Projects a user touch point onto the closest point of a reference segment's dense points.
 * Returns the projected point on the reference path and perpendicular distance.
 */
export function projectPointOntoDensePath(
  pt: Point2D,
  densePoints: Point2D[]
): { nearestPt: Point2D; minDist: number; nearestIdx: number } {
  let minDist = Infinity;
  let nearestPt = pt;
  let nearestIdx = 0;

  for (let i = 0; i < densePoints.length; i++) {
    const d = distance(pt, densePoints[i]);
    if (d < minDist) {
      minDist = d;
      nearestPt = densePoints[i];
      nearestIdx = i;
    }
  }

  return { nearestPt, minDist, nearestIdx };
}
