import {
  buildReferenceGlyphData,
  evaluateTracingAccuracy,
  densifyStrokePoints,
  calculateOptimalFontSize,
  Point2D,
  ReferenceGlyphData,
  MAX_PATH_LENGTH_RATIO,
} from '../src/utils/tracingEngine';

describe('Handwriting Tracing & Stroke Validation Engine Tests', () => {
  const WIDTH = 400;
  const HEIGHT = 300;

  // Helper to build reference glyph for testing
  function getReference(symbol: string): ReferenceGlyphData {
    return buildReferenceGlyphData(symbol, WIDTH, HEIGHT);
  }

  // Helper to simulate tracing along reference points
  function simulateTrace(
    refPoints: Point2D[],
    coverageFraction: number,
    offset = { dx: 0, dy: 0 },
    subsampleStep = 1
  ): Point2D[] {
    const totalCount = Math.floor(refPoints.length * Math.min(1, Math.max(0, coverageFraction)));
    const traced: Point2D[] = [];
    for (let i = 0; i < totalCount; i += subsampleStep) {
      traced.push({
        x: refPoints[i].x + offset.dx,
        y: refPoints[i].y + offset.dy,
      });
    }
    return traced;
  }

  test('1. Completely correct trace achieves 100% and marks isComplete true', () => {
    const ref = getReference('અ');
    // Trace all reference points directly along the path
    const userPoints = simulateTrace(ref.referencePoints, 1.0, { dx: 1, dy: 1 });
    const result = evaluateTracingAccuracy(userPoints, ref);

    expect(result.isComplete).toBe(true);
    expect(result.accuracy).toBe(100);
    expect(result.stars).toBe(3);
    expect(result.status).toBe('completed');
    expect(result.missingSegmentIds.length).toBe(0);
  });

  test('2. An 85% trace MUST remain strictly below 100% and isComplete false', () => {
    const ref = getReference('પ');
    // Trace only 85% of the reference points
    const userPoints = simulateTrace(ref.referencePoints, 0.85);
    const result = evaluateTracingAccuracy(userPoints, ref);

    expect(result.isComplete).toBe(false);
    expect(result.accuracy).toBeLessThan(100);
    expect(result.accuracy).toBeGreaterThanOrEqual(60);
    expect(result.accuracy).toBeLessThanOrEqual(92);
    expect(result.status).not.toBe('completed');
  });

  test('3. A 94% trace MUST remain strictly below 100% and NOT jump to 100%', () => {
    const ref = getReference('ઉ');
    // Trace 94% of the path (missing the last 6%)
    const userPoints = simulateTrace(ref.referencePoints, 0.94);
    const result = evaluateTracingAccuracy(userPoints, ref);

    expect(result.isComplete).toBe(false);
    expect(result.accuracy).toBeLessThan(100);
    expect(result.accuracy).toBeGreaterThanOrEqual(90);
    expect(result.accuracy).toBeLessThanOrEqual(99);
  });

  test('4. Nearly complete trace with a missing final stroke or stem is penalized and cannot get 100%', () => {
    const ref = getReference('પ');
    expect(ref.segments.length).toBeGreaterThan(1);

    // Omit the last segment (e.g. bottom stem of 'પ')
    const omittedSegment = ref.segments[ref.segments.length - 1];
    const remainingPoints = ref.referencePoints.filter(
      (p) => !omittedSegment.points.some((sp) => sp.x === p.x && sp.y === p.y)
    );

    const userPoints = simulateTrace(remainingPoints, 1.0);
    const result = evaluateTracingAccuracy(userPoints, ref);

    expect(result.isComplete).toBe(false);
    expect(result.missingSegmentIds).toContain(omittedSegment.id);
    expect(result.accuracy).toBeLessThanOrEqual(84);
  });

  test('5. Multi-character word skips an entire character and is correctly penalized', () => {
    const ref = getReference('કમળ');
    expect(ref.segments.length).toBeGreaterThan(1);

    // Omit points belonging to the rightmost third (representing the last character 'ળ')
    const maxX = Math.max(...ref.referencePoints.map((p) => p.x));
    const minX = Math.min(...ref.referencePoints.map((p) => p.x));
    const thresholdX = minX + (maxX - minX) * 0.65;

    const userPoints = ref.referencePoints.filter((p) => p.x <= thresholdX);
    const result = evaluateTracingAccuracy(userPoints, ref);

    expect(result.isComplete).toBe(false);
    expect(result.accuracy).toBeLessThan(75);
    expect(result.missingSegmentIds.length).toBeGreaterThan(0);
  });

  test('6. Wild off-path scribble in blank margins receives low score or 0%', () => {
    const ref = getReference('ક');
    // Create random scribble points outside the character in the top-left margin (0..50)
    const marginScribbles: Point2D[] = [];
    for (let i = 0; i < 40; i++) {
      marginScribbles.push({ x: 10 + (i % 20), y: 10 + Math.floor(i / 20) * 10 });
    }

    const result = evaluateTracingAccuracy(marginScribbles, ref);

    expect(result.isComplete).toBe(false);
    expect(result.accuracy).toBeLessThanOrEqual(20);
    expect(result.status).toBe('off_track');
  });

  test('7. Excessive retracing or repeated strokes does not falsely inflate accuracy', () => {
    const ref = getReference('અ');
    // Trace only the first 40% of the character, but retrace it 5 times back and forth
    const firstPart = simulateTrace(ref.referencePoints, 0.40);
    const repeatedStrokes: Point2D[] = [
      ...firstPart,
      ...firstPart.slice().reverse(),
      ...firstPart,
      ...firstPart.slice().reverse(),
      ...firstPart,
    ];

    const result = evaluateTracingAccuracy(repeatedStrokes, ref);

    expect(result.isComplete).toBe(false);
    // Retracing 40% over and over must not exceed 45% accuracy!
    expect(result.accuracy).toBeLessThan(50);
  });

  test('8. Correct trace drawn slowly or with fewer pointer events is densified and validates correctly', () => {
    const ref = getReference('A');
    // Simulate sparse touch events (sampled every 4th point)
    const sparsePoints = simulateTrace(ref.referencePoints, 1.0, { dx: 0, dy: 0 }, 4);
    expect(sparsePoints.length).toBeLessThan(ref.referencePoints.length / 3);

    // Engine's densifier smoothly fills the gaps
    const densified = densifyStrokePoints(sparsePoints);
    expect(densified.length).toBeGreaterThan(sparsePoints.length);

    const result = evaluateTracingAccuracy(sparsePoints, ref);
    expect(result.isComplete).toBe(true);
    expect(result.accuracy).toBe(100);
  });

  test('9. Reset / retry starts completely clean session with 0% accuracy', () => {
    const ref = getReference('આ');
    // Clean initial state
    const cleanResult = evaluateTracingAccuracy([], ref);
    expect(cleanResult.accuracy).toBe(0);
    expect(cleanResult.isComplete).toBe(false);
    expect(cleanResult.stars).toBe(0);
    expect(cleanResult.status).toBe('empty');

    // After drawing and then clearing back to empty
    const fullTrace = simulateTrace(ref.referencePoints, 1.0);
    const drawnResult = evaluateTracingAccuracy(fullTrace, ref);
    expect(drawnResult.isComplete).toBe(true);

    // Cleared
    const resetResult = evaluateTracingAccuracy([], ref);
    expect(resetResult.accuracy).toBe(0);
    expect(resetResult.isComplete).toBe(false);
  });

  test('10. Font sizing scales dynamically and single letter is enlarged by 25-35%', () => {
    const singleLetterSize = calculateOptimalFontSize('અ', 340, 350);
    const wordSize = calculateOptimalFontSize('અનાનસ', 340, 350);

    expect(singleLetterSize).toBeGreaterThanOrEqual(250);
    expect(singleLetterSize).toBeLessThanOrEqual(270);
    expect(singleLetterSize).toBeGreaterThan(wordSize);
    expect(wordSize).toBeGreaterThan(30);
  });

  test('11. Tracing about one-quarter of reference path displays approximately 25%', () => {
    const ref = getReference('ક');
    const userPoints = simulateTrace(ref.referencePoints, 0.25);
    const result = evaluateTracingAccuracy(userPoints, ref);

    expect(result.isComplete).toBe(false);
    expect(result.accuracy).toBeGreaterThanOrEqual(22);
    expect(result.accuracy).toBeLessThanOrEqual(28);
  });

  test('12. Tracing about half of reference path displays approximately 50%', () => {
    const ref = getReference('ગ');
    const userPoints = simulateTrace(ref.referencePoints, 0.50);
    const result = evaluateTracingAccuracy(userPoints, ref);

    expect(result.isComplete).toBe(false);
    expect(result.accuracy).toBeGreaterThanOrEqual(45);
    expect(result.accuracy).toBeLessThanOrEqual(55);
  });

  test('13. Proportional progress validation across multiple diverse Gujarati letters', () => {
    const testLetters = ['અ', 'ક', 'ગ', 'આ', 'પ', 'ઉ'];

    for (const letter of testLetters) {
      const ref = getReference(letter);
      const halfTrace = simulateTrace(ref.referencePoints, 0.50);
      const halfResult = evaluateTracingAccuracy(halfTrace, ref);

      // Half trace must accurately reflect ~50% (never crushed down to 20-25%)
      expect(halfResult.accuracy).toBeGreaterThanOrEqual(45);
      expect(halfResult.accuracy).toBeLessThanOrEqual(58);

      const fullTrace = simulateTrace(ref.referencePoints, 1.0, { dx: 0.5, dy: 0.5 });
      const fullResult = evaluateTracingAccuracy(fullTrace, ref);

      expect(fullResult.accuracy).toBe(100);
      expect(fullResult.isComplete).toBe(true);
    }
  });

  test('14. Shape dots selection picks at most 3 dots ahead', () => {
    const { getShapeTargetDots } = require('../src/utils/drawingShapes');
    const starDots = getShapeTargetDots('star');
    const coveredIds = new Set<number>([0, 1, 2, 3, 4, 5]);

    // Filter unhit dots
    const unhit = starDots.filter((d: any) => !coveredIds.has(d.id));
    const ahead = unhit.slice(0, 3);

    // Exactly 3 dots ahead
    expect(ahead.length).toBe(3);
    expect(ahead[0].id).toBe(6);
    expect(ahead[1].id).toBe(7);
    expect(ahead[2].id).toBe(8);
  });

  test('15. Tracing Gujarati numeral ૧ correctly gives 100% and 3 stars', () => {
    const ref = getReference('૧');
    const userPoints = simulateTrace(ref.referencePoints, 1.0, { dx: 1, dy: 1 });
    const result = evaluateTracingAccuracy(userPoints, ref);

    expect(result.isComplete).toBe(true);
    expect(result.accuracy).toBe(100);
    expect(result.stars).toBe(3);
    expect(result.status).toBe('completed');
  });

  test('16. Screenshot 2 reproduction: Drawing random circles around Gujarati numeral ૧ receives < 30% and 0 stars', () => {
    const ref = getReference('૧');
    // Draw large circles surrounding the number on the canvas (matching Screenshot 2)
    const circlePoints: Point2D[] = [];
    const cx = WIDTH / 2;
    const cy = HEIGHT / 2;
    // Outer circle (radius 110px) and middle circle (radius 85px)
    for (const r of [110, 85, 60]) {
      for (let angle = 0; angle < Math.PI * 2; angle += 0.08) {
        circlePoints.push({
          x: cx + r * Math.cos(angle),
          y: cy + r * Math.sin(angle),
        });
      }
    }

    const result = evaluateTracingAccuracy(circlePoints, ref);

    // Must never receive 79% or 97% or 2 stars! Must be < 30% and 0 stars!
    expect(result.isComplete).toBe(false);
    expect(result.accuracy).toBeLessThan(30);
    expect(result.stars).toBe(0);
    expect(result.status).toBe('off_track');
  });

  test('17. Screenshot 1 reproduction: Tracing 25% of Gujarati numeral ૨ displays ~25% and 0 stars', () => {
    const ref = getReference('૨');
    const userPoints = simulateTrace(ref.referencePoints, 0.25);
    const result = evaluateTracingAccuracy(userPoints, ref);

    expect(result.isComplete).toBe(false);
    expect(result.accuracy).toBeGreaterThanOrEqual(22);
    expect(result.accuracy).toBeLessThanOrEqual(28);
    expect(result.stars).toBe(0); // <50% is 0 stars
  });

  test('18. Random zigzag lines across canvas receives low score and 0 stars', () => {
    const ref = getReference('૨');
    const zigzags: Point2D[] = [];
    for (let x = 20; x < WIDTH - 20; x += 5) {
      const y = (x % 40 < 20) ? 40 : 260;
      zigzags.push({ x, y });
    }

    const result = evaluateTracingAccuracy(zigzags, ref);

    expect(result.isComplete).toBe(false);
    expect(result.accuracy).toBeLessThan(25);
    expect(result.stars).toBe(0);
    expect(result.status).toBe('off_track');
  });

  test('19. Tracing numeral correctly with extra stray lines outside character reduces score', () => {
    const ref = getReference('૩');
    const goodTrace = simulateTrace(ref.referencePoints, 1.0);
    // Add extra scribbles outside
    const extraStrayLines: Point2D[] = [];
    for (let i = 0; i < 30; i++) {
      extraStrayLines.push({ x: 20 + i * 2, y: 20 + i * 2 });
    }
    const mixedTrace = [...goodTrace, ...extraStrayLines];

    const goodResult = evaluateTracingAccuracy(goodTrace, ref);
    const mixedResult = evaluateTracingAccuracy(mixedTrace, ref);

    expect(goodResult.accuracy).toBe(100);
    expect(mixedResult.accuracy).toBeLessThan(goodResult.accuracy);
    expect(mixedResult.isComplete).toBe(false);
  });

  test('20. All Gujarati numerals (૧ to ૦) have distinct non-empty reference trajectories', () => {
    const numerals = ['૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯', '૦'];
    for (const num of numerals) {
      const ref = getReference(num);
      expect(ref.referencePoints.length).toBeGreaterThan(30);
      expect(ref.totalPathLength).toBeGreaterThan(50);
      expect(ref.segments.length).toBeGreaterThanOrEqual(1);

      // Tracing full reference achieves 100% and 3 stars
      const fullTrace = simulateTrace(ref.referencePoints, 1.0);
      const res = evaluateTracingAccuracy(fullTrace, ref);
      expect(res.accuracy).toBe(100);
      expect(res.isComplete).toBe(true);
    }
  });

  test('21. All English digits (0 to 9) have valid reference trajectories and trace accurately to 100%', () => {
    const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    for (const digit of digits) {
      const ref = getReference(digit);
      expect(ref.referencePoints.length).toBeGreaterThan(30);
      expect(ref.totalPathLength).toBeGreaterThan(50);
      expect(ref.segments.length).toBeGreaterThanOrEqual(1);
      expect(ref.strokes?.length).toBeGreaterThanOrEqual(1);

      // Tracing full reference achieves 100% and 3 stars
      const fullTrace = simulateTrace(ref.referencePoints, 1.0);
      const res = evaluateTracingAccuracy(fullTrace, ref);
      expect(res.accuracy).toBe(100);
      expect(res.isComplete).toBe(true);
      expect(res.stars).toBe(3);
    }
  });

  test('22. Straight vs curved strokes in English numbers (1, 4, 7 vs 0, 2, 3, 8) evaluate accurately', () => {
    // Straight strokes: 1, 4, 7
    for (const digit of ['1', '4', '7']) {
      const ref = getReference(digit);
      const fullTrace = simulateTrace(ref.referencePoints, 1.0);
      const res = evaluateTracingAccuracy(fullTrace, ref);
      expect(res.accuracy).toBe(100);
      expect(res.isComplete).toBe(true);
    }

    // Curved strokes: 0, 2, 3, 8
    for (const digit of ['0', '2', '3', '8']) {
      const ref = getReference(digit);
      const fullTrace = simulateTrace(ref.referencePoints, 1.0);
      const res = evaluateTracingAccuracy(fullTrace, ref);
      expect(res.accuracy).toBe(100);
      expect(res.isComplete).toBe(true);
    }
  });

  test('23. Fast drawing (sparse points) along digit path is handled cleanly', () => {
    const ref = getReference('2');
    // Fast stroke: subsampled points every 2 steps
    const fastTrace = simulateTrace(ref.referencePoints, 1.0, { dx: 0, dy: 0 }, 2);
    const res = evaluateTracingAccuracy(fastTrace, ref);
    expect(res.accuracy).toBeGreaterThanOrEqual(95);
    expect(res.isComplete).toBe(true);
  });

  test('24. Partial tracing of English digits yields proportional accurate percentage', () => {
    const ref = getReference('2');
    const halfTrace = simulateTrace(ref.referencePoints, 0.5);
    const res = evaluateTracingAccuracy(halfTrace, ref);
    expect(res.isComplete).toBe(false);
    expect(res.accuracy).toBeGreaterThanOrEqual(40);
    expect(res.accuracy).toBeLessThanOrEqual(60);
  });

  test('25. Drawing completely outside the number bounds yields 0 stars and off_track', () => {
    const ref = getReference('1');
    // User draws circles at the canvas edge
    const edgePoints: Point2D[] = [];
    for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
      edgePoints.push({
        x: 30 + 20 * Math.cos(angle),
        y: 30 + 20 * Math.sin(angle),
      });
    }
    const res = evaluateTracingAccuracy(edgePoints, ref);
    expect(res.isComplete).toBe(false);
    expect(res.accuracy).toBeLessThan(15);
    expect(res.stars).toBe(0);
    expect(res.status).toBe('off_track');
  });

  test('26. Compound Gujarati Barakhadi characters (e.g. ખા) generate integrated strokes', () => {
    const ref = getReference('ખા');
    expect(ref.referencePoints.length).toBeGreaterThan(50);
    expect(ref.strokes?.length).toBeGreaterThanOrEqual(2); // Consonant + Matra
    const fullTrace = simulateTrace(ref.referencePoints, 1.0);
    const res = evaluateTracingAccuracy(fullTrace, ref);
    expect(res.accuracy).toBe(100);
    expect(res.isComplete).toBe(true);
    expect(res.stars).toBe(3);
  });

  // ---------------------------------------------------------------------------------------
  // Anti-cheat regressions (audit P0-1, P2-1, P2-2)
  // ---------------------------------------------------------------------------------------
  const DENSE_GLYPHS: [string, string][] = [
    ['ક', 'gu'], ['અ', 'gu'], ['ગ', 'gu'], ['૩', 'gu'], ['ह', 'hi'], ['क', 'hi'], ['B', 'en'], ['8', 'en'],
  ];

  function bboxZigzag(ref: Point2D[], rowStep: number): Point2D[] {
    const xs = ref.map((p) => p.x);
    const ys = ref.map((p) => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const out: Point2D[] = [];
    let dir = 1;
    for (let y = minY; y <= maxY; y += rowStep) {
      for (let i = 0; i <= 40; i++) {
        const t = i / 40;
        out.push({ x: dir > 0 ? minX + (maxX - minX) * t : maxX - (maxX - minX) * t, y });
      }
      dir *= -1;
    }
    return out;
  }

  function colourIn(ref: Point2D[], radius: number): Point2D[] {
    const xs = ref.map((p) => p.x);
    const ys = ref.map((p) => p.y);
    const out: Point2D[] = [];
    let dir = 1;
    for (let y = Math.min(...ys) - radius; y <= Math.max(...ys) + radius; y += 4) {
      const row: Point2D[] = [];
      for (let x = Math.min(...xs) - radius; x <= Math.max(...xs) + radius; x += 2) {
        if (ref.some((r) => (r.x - x) ** 2 + (r.y - y) ** 2 <= radius * radius)) row.push({ x, y });
      }
      if (dir < 0) row.reverse();
      out.push(...row);
      dir *= -1;
    }
    return out;
  }

  test.each(DENSE_GLYPHS)('27. Bounding-box zigzag over %s never completes or exceeds 74%%', (glyph, lang) => {
    const ref = buildReferenceGlyphData(glyph, 320, 320, undefined, lang);
    for (const step of [5, 8]) {
      const res = evaluateTracingAccuracy(bboxZigzag(ref.referencePoints, step), ref);
      expect(res.isComplete).toBe(false);
      expect(res.accuracy).toBeLessThanOrEqual(74);
      expect(res.stars).toBeLessThanOrEqual(1);
      expect(res.pathLengthRatio).toBeGreaterThan(MAX_PATH_LENGTH_RATIO);
    }
  });

  test.each(DENSE_GLYPHS)('28. "Colouring in" the band around %s is not accepted as tracing', (glyph, lang) => {
    const ref = buildReferenceGlyphData(glyph, 320, 320, undefined, lang);
    const res = evaluateTracingAccuracy(colourIn(ref.referencePoints, 10), ref);
    expect(res.isComplete).toBe(false);
    expect(res.accuracy).toBeLessThanOrEqual(74);
  });

  test.each(DENSE_GLYPHS)('29. A clean stroke-by-stroke trace of %s (as separate strokes) still scores 100%%', (glyph, lang) => {
    const ref = buildReferenceGlyphData(glyph, 320, 320, undefined, lang);
    const strokes = ref.strokes.map((s) => s.points.map((p) => ({ x: p.x + 1, y: p.y - 1 })));
    const res = evaluateTracingAccuracy(strokes, ref);
    expect(res.isComplete).toBe(true);
    expect(res.accuracy).toBe(100);
    expect(res.reversedSegmentIds).toEqual([]);
    expect(res.pathLengthRatio).toBeLessThanOrEqual(MAX_PATH_LENGTH_RATIO);
  });

  test('30. Tracing the reference twice (natural re-trace) is still allowed to complete', () => {
    const ref = buildReferenceGlyphData('અ', 320, 320, undefined, 'gu');
    const once = ref.strokes.map((s) => s.points);
    const res = evaluateTracingAccuracy([...once, ...once], ref);
    expect(res.isComplete).toBe(true);
    expect(res.accuracy).toBe(100);
  });

  test('31. An open stroke traced backwards is capped at 2 stars and never completes', () => {
    const ref = buildReferenceGlyphData('L', 320, 320, undefined, 'en');
    const reversed = [...ref.strokes].reverse().map((s) => [...s.points].reverse());
    const res = evaluateTracingAccuracy(reversed, ref);
    expect(res.reversedSegmentIds.length).toBeGreaterThan(0);
    expect(res.isComplete).toBe(false);
    expect(res.accuracy).toBeLessThanOrEqual(89);
    expect(res.stars).toBeLessThanOrEqual(2);
  });

  test('32. enforceDirection: false restores lenient scoring for reversed strokes', () => {
    const ref = buildReferenceGlyphData('L', 320, 320, undefined, 'en');
    const reversed = [...ref.strokes].reverse().map((s) => [...s.points].reverse());
    const res = evaluateTracingAccuracy(reversed, ref, { enforceDirection: false });
    expect(res.reversedSegmentIds).toEqual([]);
    expect(res.isComplete).toBe(true);
  });

  test('33. Finger lifts are not bridged: two far-apart dots do not draw the line between them', () => {
    const ref = buildReferenceGlyphData('L', 320, 320, undefined, 'en');
    const stem = ref.strokes[0].points;
    const a = stem[0];
    const b = stem[Math.min(stem.length - 1, 6)];
    // Each "stroke" is a tiny tap; as separate strokes nothing between them is inked.
    const taps = [[a, { x: a.x + 0.6, y: a.y }], [b, { x: b.x + 0.6, y: b.y }]];
    const res = evaluateTracingAccuracy(taps, ref);
    expect(res.accuracy).toBeLessThan(25);
  });
});
