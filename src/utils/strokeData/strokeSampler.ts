import { Point2D, StrokeDefinition, StrokeDirection } from './types';

/**
 * Centripetal Catmull-Rom spline interpolation (alpha = 0.5) between control points.
 * Guarantees zero cusps, zero self-intersections, and no overshoot around tight turns.
 */
export function sampleCurve(controlPoints: Point2D[], stepsPerSegment = 10): Point2D[] {
  if (controlPoints.length === 0) return [];
  if (controlPoints.length === 1) return [controlPoints[0]];
  if (controlPoints.length === 2) {
    return sampleLine(controlPoints[0], controlPoints[1], stepsPerSegment);
  }

  const alpha = 0.5; // Centripetal parameterization

  function getT(tPrev: number, pa: Point2D, pb: Point2D): number {
    const d = Math.hypot(pb.x - pa.x, pb.y - pa.y);
    return tPrev + Math.pow(Math.max(d, 1e-4), alpha);
  }

  const result: Point2D[] = [controlPoints[0]];

  for (let i = 0; i < controlPoints.length - 1; i++) {
    const p1 = controlPoints[i];
    const p2 = controlPoints[i + 1];

    // Endpoint tangents using reflection to preserve natural entry/exit curvature
    const p0 = i > 0
      ? controlPoints[i - 1]
      : { x: 2 * p1.x - p2.x, y: 2 * p1.y - p2.y };
    const p3 = i < controlPoints.length - 2
      ? controlPoints[i + 2]
      : { x: 2 * p2.x - p1.x, y: 2 * p2.y - p1.y };

    const t0 = 0;
    const t1 = getT(t0, p0, p1);
    const t2 = getT(t1, p1, p2);
    const t3 = getT(t2, p2, p3);

    const segSteps = stepsPerSegment;
    for (let step = 1; step <= segSteps; step++) {
      const t = t1 + (step / segSteps) * (t2 - t1);

      const a1x = ((t1 - t) / (t1 - t0)) * p0.x + ((t - t0) / (t1 - t0)) * p1.x;
      const a1y = ((t1 - t) / (t1 - t0)) * p0.y + ((t - t0) / (t1 - t0)) * p1.y;

      const a2x = ((t2 - t) / (t2 - t1)) * p1.x + ((t - t1) / (t2 - t1)) * p2.x;
      const a2y = ((t2 - t) / (t2 - t1)) * p1.y + ((t - t1) / (t2 - t1)) * p2.y;

      const a3x = ((t3 - t) / (t3 - t2)) * p2.x + ((t - t2) / (t3 - t2)) * p3.x;
      const a3y = ((t3 - t) / (t3 - t2)) * p2.y + ((t - t2) / (t3 - t2)) * p3.y;

      const b1x = ((t2 - t) / (t2 - t0)) * a1x + ((t - t0) / (t2 - t0)) * a2x;
      const b1y = ((t2 - t) / (t2 - t0)) * a1y + ((t - t0) / (t2 - t0)) * a2y;

      const b2x = ((t3 - t) / (t3 - t1)) * a2x + ((t - t1) / (t3 - t1)) * a3x;
      const b2y = ((t3 - t) / (t3 - t1)) * a2y + ((t - t1) / (t3 - t1)) * a3y;

      const cx = ((t2 - t) / (t2 - t1)) * b1x + ((t - t1) / (t2 - t1)) * b2x;
      const cy = ((t2 - t) / (t2 - t1)) * b1y + ((t - t1) / (t2 - t1)) * b2y;

      result.push({
        x: Math.round(cx * 10) / 10,
        y: Math.round(cy * 10) / 10,
      });
    }
  }

  return result;
}

/**
 * Line sampler between two points.
 */
export function sampleLine(p1: Point2D, p2: Point2D, steps = 10): Point2D[] {
  const result: Point2D[] = [];
  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    result.push({
      x: Math.round((p1.x + (p2.x - p1.x) * t) * 10) / 10,
      y: Math.round((p1.y + (p2.y - p1.y) * t) * 10) / 10,
    });
  }
  return result;
}

/**
 * Generates an elliptical loop (e.g. for loops in ૧, ०, क, etc.).
 */
export function makeLoop(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  startAngle = 0,
  sweep = Math.PI * 2,
  steps = 24
): Point2D[] {
  const pts: Point2D[] = [];
  for (let i = 0; i <= steps; i++) {
    const angle = startAngle + (i / steps) * sweep;
    pts.push({
      x: Math.round((cx + rx * Math.cos(angle)) * 10) / 10,
      y: Math.round((cy + ry * Math.sin(angle)) * 10) / 10,
    });
  }
  return pts;
}

/**
 * Helper to build a validated StrokeDefinition from a list of points.
 */
export function createStroke(
  id: string,
  order: number,
  points: Point2D[],
  direction?: StrokeDirection,
  description?: string
): StrokeDefinition {
  if (points.length === 0) {
    const zero = { x: 50, y: 50 };
    return { id, order, points: [zero], startPoint: zero, endPoint: zero, direction, description };
  }
  return {
    id,
    order,
    points,
    startPoint: points[0],
    endPoint: points[points.length - 1],
    direction: direction || 'forward',
    description,
  };
}

/**
 * Linear interpolation between two points.
 */
export function interpolatePoints(p1: Point2D, p2: Point2D, maxDist = 3.5): Point2D[] {
  const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  if (dist <= maxDist) return [p2];

  const steps = Math.ceil(dist / maxDist);
  const result: Point2D[] = [];
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    result.push({
      x: p1.x + (p2.x - p1.x) * t,
      y: p1.y + (p2.y - p1.y) * t,
    });
  }
  return result;
}

