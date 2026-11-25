import {
  getScaledCharacterTrajectory,
  getCharacterStrokeDefinition,
} from '../src/utils/strokeData';
import {
  buildReferenceGlyphData,
  evaluateTracingAccuracy,
  Point2D,
} from '../src/utils/tracingEngine';

describe('English Numerals and Characters Handwriting Accuracy', () => {
  const WIDTH = 300;
  const HEIGHT = 300;

  // Default fallback square bracket points (scaled into canvas)
  const isDefaultSquareBracket = (points: Point2D[]): boolean => {
    if (points.length < 3) return false;
    const pStart = points[0];
    const pMid1 = points[Math.floor(points.length * 0.33)];
    const pMid2 = points[Math.floor(points.length * 0.66)];
    const pEnd = points[points.length - 1];

    const isHoriz1 = Math.abs(pStart.y - pMid1.y) < 2;
    const isVert = Math.abs(pMid1.x - pMid2.x) < 2;
    const isHoriz2 = Math.abs(pMid2.y - pEnd.y) < 2;
    return isHoriz1 && isVert && isHoriz2;
  };

  test('1. Every English digit from 0 to 9 has a structured definition and NOT the default square bracket', () => {
    const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    for (const d of digits) {
      const def = getCharacterStrokeDefinition(d, 'en');
      expect(def).not.toBeNull();
      expect(def?.character).toBe(d);
      expect(def?.language).toBe('en');
      expect(def?.strokes.length).toBeGreaterThanOrEqual(1);

      const trajectory = getScaledCharacterTrajectory(d, WIDTH, HEIGHT, 'en');
      expect(trajectory.referencePoints.length).toBeGreaterThan(20);
      expect(trajectory.totalPathLength).toBeGreaterThan(60);

      // Must NEVER be the fallback square bracket
      expect(isDefaultSquareBracket(trajectory.referencePoints)).toBe(false);
    }
  });

  test('2. Digit 1 matches Screenshot 1: slanted top lead-in and straight vertical stem', () => {
    const ref = buildReferenceGlyphData('1', WIDTH, HEIGHT, undefined, 'en');
    expect(ref.referencePoints.length).toBeGreaterThan(20);

    // Points in lower half should be vertically aligned along center
    const lowerPoints = ref.referencePoints.filter(p => p.y > HEIGHT * 0.45);
    expect(lowerPoints.length).toBeGreaterThan(5);
    const xs = lowerPoints.map(p => p.x);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    expect(maxX - minX).toBeLessThan(4); // Straight vertical stem!
  });

  test('3. Digit 2 matches Screenshot 2: upper rounded arch and flat horizontal base', () => {
    const ref = buildReferenceGlyphData('2', WIDTH, HEIGHT, undefined, 'en');
    const bottomPoints = ref.referencePoints.filter(p => p.y > HEIGHT * 0.70);
    expect(bottomPoints.length).toBeGreaterThan(8);

    // Baseline should span horizontally
    const xs = bottomPoints.map(p => p.x);
    const width = Math.max(...xs) - Math.min(...xs);
    expect(width).toBeGreaterThan(HEIGHT * 0.25);
  });

  test('4. Digit 3 matches Screenshot 3: double rounded lobes and center waist', () => {
    const ref = buildReferenceGlyphData('3', WIDTH, HEIGHT, undefined, 'en');
    expect(ref.referencePoints.length).toBeGreaterThan(30);

    const ys = ref.referencePoints.map(p => p.y);
    const centerY = (Math.min(...ys) + Math.max(...ys)) / 2;
    const waistPoints = ref.referencePoints.filter(p => Math.abs(p.y - centerY) < 15);
    expect(waistPoints.length).toBeGreaterThan(0);
  });

  test('5. Digit 4 matches Screenshot 4: has slanted stroke, crossbar, and vertical stem', () => {
    const def = getCharacterStrokeDefinition('4', 'en');
    expect(def).not.toBeNull();
    expect(def?.strokes.length).toBe(2);

    const ref = buildReferenceGlyphData('4', WIDTH, HEIGHT, undefined, 'en');
    expect(ref.strokes?.length).toBe(2);
    expect(ref.totalPathLength).toBeGreaterThan(100);
  });

  test('6. Digits 5, 6, 7, 8, 9, 0 are distinct and authentic', () => {
    for (const d of ['5', '6', '7', '8', '9', '0']) {
      const ref = buildReferenceGlyphData(d, WIDTH, HEIGHT, undefined, 'en');
      expect(ref.referencePoints.length).toBeGreaterThan(25);
      expect(ref.totalPathLength).toBeGreaterThan(80);
      expect(isDefaultSquareBracket(ref.referencePoints)).toBe(false);
    }
  });

  test('7. Compound multi-digit number 10 renders both digits side-by-side', () => {
    const ref = buildReferenceGlyphData('10', WIDTH, HEIGHT, undefined, 'en');
    expect(ref.referencePoints.length).toBeGreaterThan(35);

    const xs = ref.referencePoints.map(p => p.x);
    const midX = (Math.min(...xs) + Math.max(...xs)) / 2;
    const leftPoints = ref.referencePoints.filter(p => p.x < midX);
    const rightPoints = ref.referencePoints.filter(p => p.x > midX);
    expect(leftPoints.length).toBeGreaterThan(10);
    expect(rightPoints.length).toBeGreaterThan(15);
  });

  test('8. Full trace along each English digit achieves 100% and 3 stars', () => {
    for (const d of ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']) {
      const ref = buildReferenceGlyphData(d, WIDTH, HEIGHT, undefined, 'en');
      const fullTrace = [...ref.referencePoints];
      const res = evaluateTracingAccuracy(fullTrace, ref);
      expect(res.accuracy).toBe(100);
      expect(res.isComplete).toBe(true);
      expect(res.stars).toBe(3);
    }
  });

  test('9. English uppercase alphabet letters (A to Z) have authentic trajectories', () => {
    for (let c = 65; c <= 90; c++) {
      const letter = String.fromCharCode(c);
      const def = getCharacterStrokeDefinition(letter, 'en');
      expect(def).not.toBeNull();
      expect(def?.character).toBe(letter);

      const ref = buildReferenceGlyphData(letter, WIDTH, HEIGHT, undefined, 'en');
      expect(ref.referencePoints.length).toBeGreaterThan(20);
      expect(isDefaultSquareBracket(ref.referencePoints)).toBe(false);
    }
  });
});
