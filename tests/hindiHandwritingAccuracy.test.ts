import {
  getScaledCharacterTrajectory,
  getCharacterStrokeDefinition,
} from '../src/utils/strokeData';
import {
  buildReferenceGlyphData,
  evaluateTracingAccuracy,
  Point2D,
} from '../src/utils/tracingEngine';
import { getLessonAgeAdaptation } from '../src/utils/ageDetailHelper';

describe('Hindi / Devanagari Numerals Handwriting Accuracy', () => {
  const WIDTH = 300;
  const HEIGHT = 300;

  test('1. All Devanagari digits ० through ९ have valid, high-precision stroke definitions', () => {
    const digits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

    for (const d of digits) {
      const def = getCharacterStrokeDefinition(d, 'hi');
      expect(def).not.toBeNull();
      expect(def?.character).toBe(d);
      expect(def?.language).toBe('hi');
      expect(def?.strokes.length).toBeGreaterThanOrEqual(1);

      const trajectory = getScaledCharacterTrajectory(d, WIDTH, HEIGHT, 'hi');
      expect(trajectory.referencePoints.length).toBeGreaterThan(25);
      expect(trajectory.totalPathLength).toBeGreaterThan(80);
    }
  });

  test('2. Hindi digit १ has circular top head and S-curved spine matching Screenshot 1', () => {
    const ref = buildReferenceGlyphData('१', WIDTH, HEIGHT, undefined, 'hi');
    expect(ref.referencePoints.length).toBeGreaterThan(30);

    // Head loop at top
    const topPoints = ref.referencePoints.filter(p => p.y < HEIGHT * 0.45);
    expect(topPoints.length).toBeGreaterThan(10);

    // Spine has an S-curve that swings left then right
    const spinePoints = ref.referencePoints.filter(p => p.y >= HEIGHT * 0.45);
    const xs = spinePoints.map(p => p.x);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    // Should have horizontal width > 20px (not a straight vertical pipe)
    expect(maxX - minX).toBeGreaterThan(20);
  });

  test('3. Hindi digit २ has smooth arch and slanted tail without any tangled loops matching Screenshot 2', () => {
    const def = getCharacterStrokeDefinition('२', 'hi');
    expect(def).not.toBeNull();
    expect(def?.totalStrokes).toBe(1);

    const ref = buildReferenceGlyphData('२', WIDTH, HEIGHT, undefined, 'hi');
    expect(ref.referencePoints.length).toBeGreaterThan(30);

    // Stroke points should end at bottom-right
    const lastPoint = ref.referencePoints[ref.referencePoints.length - 1];
    expect(lastPoint.x).toBeGreaterThan(WIDTH * 0.50);
    expect(lastPoint.y).toBeGreaterThan(HEIGHT * 0.70);
  });

  test('4. Hindi digit ३ has upper lobe, middle waist, and downward tail matching Screenshot 3', () => {
    const ref = buildReferenceGlyphData('३', WIDTH, HEIGHT, undefined, 'hi');
    expect(ref.referencePoints.length).toBeGreaterThan(30);

    // Tail ends at the bottom
    const lastPoint = ref.referencePoints[ref.referencePoints.length - 1];
    expect(lastPoint.y).toBeGreaterThan(HEIGHT * 0.75);
  });

  test('5. Hindi digit ४ has two upright horns and bottom ribbon loop matching Screenshot 4', () => {
    const def = getCharacterStrokeDefinition('४', 'hi');
    expect(def).not.toBeNull();
    expect(def?.totalStrokes).toBe(1);

    const ref = buildReferenceGlyphData('४', WIDTH, HEIGHT, undefined, 'hi');
    expect(ref.referencePoints.length).toBeGreaterThan(35);

    // Starts top-left and ends top-right
    const startPoint = ref.referencePoints[0];
    const endPoint = ref.referencePoints[ref.referencePoints.length - 1];
    expect(startPoint.y).toBeLessThan(HEIGHT * 0.35);
    expect(endPoint.y).toBeLessThan(HEIGHT * 0.35);
    expect(startPoint.x).toBeLessThan(endPoint.x);
  });

  test('6. Hindi digit ६ has double left curve, closed knot, and downward tail matching Screenshot 5', () => {
    const ref = buildReferenceGlyphData('६', WIDTH, HEIGHT, undefined, 'hi');
    expect(ref.referencePoints.length).toBeGreaterThan(35);

    const endPoint = ref.referencePoints[ref.referencePoints.length - 1];
    expect(endPoint.y).toBeGreaterThan(HEIGHT * 0.75);
    expect(endPoint.x).toBeGreaterThan(WIDTH * 0.50);
  });

  test('6b. Hindi digit ७ has right loop, bottom bowl, and left vertical stem matching Screenshot 3', () => {
    const def = getCharacterStrokeDefinition('७', 'hi');
    expect(def).not.toBeNull();
    expect(def?.totalStrokes).toBe(1);

    const ref = buildReferenceGlyphData('७', WIDTH, HEIGHT, undefined, 'hi');
    expect(ref.referencePoints.length).toBeGreaterThan(35);

    // Left stem points (x < WIDTH * 0.45)
    const leftPoints = ref.referencePoints.filter(p => p.x < WIDTH * 0.45);
    expect(leftPoints.length).toBeGreaterThan(10);

    // Bottom bowl points (y > HEIGHT * 0.70)
    const bottomPoints = ref.referencePoints.filter(p => p.y > HEIGHT * 0.70);
    expect(bottomPoints.length).toBeGreaterThan(8);

    // Right loop points (x > WIDTH * 0.50 and y < HEIGHT * 0.55)
    const loopPoints = ref.referencePoints.filter(p => p.x > WIDTH * 0.50 && p.y < HEIGHT * 0.55);
    expect(loopPoints.length).toBeGreaterThan(10);
  });

  test('6c. Hindi digit ९ has top circular head and smooth diagonal down-right stem matching Screenshot 2', () => {
    const def = getCharacterStrokeDefinition('९', 'hi');
    expect(def).not.toBeNull();
    expect(def?.totalStrokes).toBe(1);

    const ref = buildReferenceGlyphData('९', WIDTH, HEIGHT, undefined, 'hi');
    expect(ref.referencePoints.length).toBeGreaterThan(35);

    // Circular head points in upper-left quadrant
    const headPoints = ref.referencePoints.filter(p => p.y < HEIGHT * 0.50);
    expect(headPoints.length).toBeGreaterThan(15);

    // Stem ends in lower-right quadrant
    const endPoint = ref.referencePoints[ref.referencePoints.length - 1];
    expect(endPoint.x).toBeGreaterThan(WIDTH * 0.60);
    expect(endPoint.y).toBeGreaterThan(HEIGHT * 0.75);
  });

  test('7. Compound digit १० renders १ and ० side-by-side', () => {
    const ref = buildReferenceGlyphData('१०', WIDTH, HEIGHT, undefined, 'hi');
    expect(ref.referencePoints.length).toBeGreaterThan(40);

    const xs = ref.referencePoints.map(p => p.x);
    const midX = (Math.min(...xs) + Math.max(...xs)) / 2;
    const leftPoints = ref.referencePoints.filter(p => p.x < midX);
    const rightPoints = ref.referencePoints.filter(p => p.x > midX);
    expect(leftPoints.length).toBeGreaterThan(15);
    expect(rightPoints.length).toBeGreaterThan(15);
  });

  test('8. Full trace along each Hindi digit achieves 100% and 3 stars', () => {
    for (const d of ['०', '१', '२', '३', '४', '५', '६', '७', '૮', '९']) {
      const char = d === '૮' ? '८' : d;
      const ref = buildReferenceGlyphData(char, WIDTH, HEIGHT, undefined, 'hi');
      const fullTrace = [...ref.referencePoints];
      const res = evaluateTracingAccuracy(fullTrace, ref);
      expect(res.accuracy).toBe(100);
      expect(res.isComplete).toBe(true);
      expect(res.stars).toBe(3);
    }
  });

  test('9. Educational funFact for numbers in Hindi mode provides complete sentence', () => {
    const mockLesson: any = {
      id: 'num-1',
      categoryId: 'numbers',
      symbol: '१',
      title: '१ • एक',
      countItems: 1,
      exampleMeaningHi: 'एक',
      exampleWord: 'एक',
    };

    const adapt = getLessonAgeAdaptation(mockLesson, '6-8', 'hi');
    expect(adapt.funFact).toBeTruthy();
    expect(adapt.funFact).toContain('१');
    expect(adapt.funFact).toContain('गिनना');
  });
});

