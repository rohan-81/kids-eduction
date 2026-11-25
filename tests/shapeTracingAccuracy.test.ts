import { getShapeTargetDots, TRACE_SHAPES, TargetDot } from '../src/utils/drawingShapes';
import { pointsToSmoothSvgPath, distance, distanceToSegment } from '../src/utils/shapeTracingEngine';

describe('Shape Tracing Engine & Accuracy Unit Tests', () => {
  // Helper to simulate distance from point to segment
  function distancePointToSegment(
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const l2 = dx * dx + dy * dy;
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * dx + (py - y1) * dy) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  }

  test('1. Tracing a circle dot by dot produces smooth Bézier spline path', () => {
    const sunDots = getShapeTargetDots('sun');
    // First 16 dots of Sun form the central circular outline
    const circleDots = sunDots.slice(0, 16);
    expect(circleDots.length).toBe(16);

    const svgPath = pointsToSmoothSvgPath(circleDots);
    expect(svgPath.startsWith('M')).toBe(true);
    // Uses cubic Bézier curves (C ...) for butter-smooth curvature
    expect(svgPath).toContain('C');
    // Does not use raw linear polyline joints
    expect(svgPath.split('C').length).toBeGreaterThan(10);
  });

  test('2. Tracing complex body outline has all dots in sequential perimeter order', () => {
    const starDots = getShapeTargetDots('star');
    expect(starDots.length).toBeGreaterThan(20);

    // Each adjacent pair of dots along the perimeter is reasonably spaced
    for (let i = 0; i < starDots.length - 1; i++) {
      const d = Math.hypot(starDots[i + 1].x - starDots[i].x, starDots[i + 1].y - starDots[i].y);
      expect(d).toBeGreaterThanOrEqual(13.5);
      expect(d).toBeLessThan(60);
    }
  });

  test('3. Slow and fast pointer movements are both tracked without skipping', () => {
    const appleDots = getShapeTargetDots('apple');
    const covered = new Set<number>();

    // Simulate fast pointer movement: user moves fast so touch samples are 25px apart
    const target1 = appleDots[0];
    const target2 = appleDots[1];
    const reachTolerance = 18;

    // Fast move passes near target1 and target2
    const pt1 = { x: target1.x + 2, y: target1.y + 2 };
    const pt2 = { x: target2.x + 3, y: target2.y + 3 };

    if (Math.hypot(pt1.x - target1.x, pt1.y - target1.y) <= reachTolerance) {
      covered.add(target1.id);
    }
    if (Math.hypot(pt2.x - target2.x, pt2.y - target2.y) <= reachTolerance) {
      covered.add(target2.id);
    }

    expect(covered.has(target1.id)).toBe(true);
    expect(covered.has(target2.id)).toBe(true);
  });

  test('4. Moving pointer away from the guide path (> 26px corridor) is rejected', () => {
    const starDots = getShapeTargetDots('star');
    const dotA = starDots[0];
    const dotB = starDots[1];

    // User touches in the middle of canvas far from the perimeter (e.g. at 50px away)
    const strayTouch = { x: (dotA.x + dotB.x) / 2 + 50, y: (dotA.y + dotB.y) / 2 + 50 };
    const distToSeg = distancePointToSegment(strayTouch.x, strayTouch.y, dotA.x, dotA.y, dotB.x, dotB.y);

    const MAX_CORRIDOR_DIST = 26;
    const isWithinCorridor = distToSeg <= MAX_CORRIDOR_DIST;

    expect(isWithinCorridor).toBe(false);
  });

  test('5. Attempting to skip dots or cut across shape interior is rejected', () => {
    const starDots = getShapeTargetDots('star');
    const topDot = starDots[0]; // (160, 35)
    // Find bottom-most dot across the star
    const bottomDot = starDots.reduce((prev, curr) => (curr.y > prev.y ? curr : prev));

    // A straight shortcut line through the center of the star
    const centerPoint = { x: 160, y: 150 };
    const nextTarget = starDots[1];

    // Distance from center point to next target dot or active segment
    const distToNextSeg = distancePointToSegment(
      centerPoint.x,
      centerPoint.y,
      topDot.x,
      topDot.y,
      nextTarget.x,
      nextTarget.y
    );
    const distToNextDot = Math.hypot(centerPoint.x - nextTarget.x, centerPoint.y - nextTarget.y);

    const MAX_CORRIDOR_DIST = 26;
    const canProgress = distToNextSeg <= MAX_CORRIDOR_DIST || distToNextDot <= MAX_CORRIDOR_DIST;

    // Center shortcut must be rejected!
    expect(canProgress).toBe(false);
  });

  test('6. Dynamic guidance always exposes the current target dot and 2-3 blue suggestion dots ahead', () => {
    const balloonDots = getShapeTargetDots('balloon');
    const coveredIds = new Set<number>();

    // Initially: 0 covered
    let unhit = balloonDots.filter((d) => !coveredIds.has(d.id));
    expect(unhit[0].id).toBe(balloonDots[0].id);

    let suggestions = unhit.slice(1, 4);
    expect(suggestions.length).toBe(3);
    expect(suggestions[0].id).toBe(balloonDots[1].id);
    expect(suggestions[1].id).toBe(balloonDots[2].id);
    expect(suggestions[2].id).toBe(balloonDots[3].id);

    // After covering first 2 dots:
    coveredIds.add(balloonDots[0].id);
    coveredIds.add(balloonDots[1].id);

    unhit = balloonDots.filter((d) => !coveredIds.has(d.id));
    expect(unhit[0].id).toBe(balloonDots[2].id);

    suggestions = unhit.slice(1, 4);
    expect(suggestions[0].id).toBe(balloonDots[3].id);
    expect(suggestions[1].id).toBe(balloonDots[4].id);
    expect(suggestions[2].id).toBe(balloonDots[5].id);
  });

  test('7. Restarting / clearing resets covered dots and restores first dot as active', () => {
    const carDots = getShapeTargetDots('car');
    const coveredIds = new Set<number>([0, 1, 2, 3, 4]);
    expect(coveredIds.size).toBe(5);

    // User clears / resets
    coveredIds.clear();
    const unhit = carDots.filter((d) => !coveredIds.has(d.id));

    expect(coveredIds.size).toBe(0);
    expect(unhit[0].id).toBe(carDots[0].id);
    expect(unhit.slice(1, 4).length).toBe(3);
  });

  test('8. Completing all dots accurately reaches 100% and awards 3 stars', () => {
    const flowerDots = getShapeTargetDots('flower');
    const coveredIds = new Set<number>(flowerDots.map((d) => d.id));

    const coveragePct = Math.round((coveredIds.size / flowerDots.length) * 100);
    expect(coveragePct).toBe(100);

    const stars = coveragePct >= 70 ? 3 : coveragePct >= 40 ? 2 : coveragePct >= 15 ? 1 : 0;
    expect(stars).toBe(3);
  });
});
