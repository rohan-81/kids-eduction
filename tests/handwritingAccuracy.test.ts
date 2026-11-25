import {
  getCharacterStrokeDefinition,
  detectScript,
  GUJARATI_NUMBERS,
  GUJARATI_VOWELS,
  GUJARATI_CONSONANTS,
  HINDI_NUMBERS,
  HINDI_VOWELS,
  HINDI_CONSONANTS,
  HINDI_WORDS,
} from '../src/utils/strokeData';
import {
  buildReferenceGlyphData,
  evaluateTracingAccuracy,
  Point2D,
} from '../src/utils/tracingEngine';

describe('Gujarati & Hindi Handwriting Tracing Accuracy Test Suite', () => {
  const WIDTH = 400;
  const HEIGHT = 300;

  describe('Script Auto-Detection', () => {
    it('accurately distinguishes Gujarati, Hindi (Devanagari), and Latin scripts', () => {
      expect(detectScript('૫')).toBe('gu');
      expect(detectScript('૧')).toBe('gu');
      expect(detectScript('અ')).toBe('gu');
      expect(detectScript('ક')).toBe('gu');

      expect(detectScript('५')).toBe('hi');
      expect(detectScript('१')).toBe('hi');
      expect(detectScript('अ')).toBe('hi');
      expect(detectScript('अनार')).toBe('hi');
      expect(detectScript('क')).toBe('hi');

      expect(detectScript('5')).toBe('en');
      expect(detectScript('A')).toBe('en');
    });
  });

  describe('Gujarati Handwriting Geometry & Accuracy', () => {
    it('Gujarati digit ૫ has authentic curved cup geometry and NOT consonant પ vertical stem', () => {
      const defFive = getCharacterStrokeDefinition('૫', 'gu');
      expect(defFive).not.toBeNull();
      expect(defFive?.character).toBe('૫');
      expect(defFive?.strokes.length).toBeGreaterThanOrEqual(1);

      const pts = defFive!.strokes[0].points;
      // Start is near upper-left
      expect(pts[0].x).toBeLessThan(45);
      expect(pts[0].y).toBeLessThan(45);

      // Bottom of the cup dips down
      const maxY = Math.max(...pts.map((p) => p.y));
      expect(maxY).toBeGreaterThanOrEqual(75);

      // Consonant પ has a dedicated vertical right stem stroke starting high at (66, 32). In digit ૫, right crest is mid-height (~52).
      const defConsonantPa = getCharacterStrokeDefinition('પ', 'gu');
      expect(defConsonantPa).not.toBeNull();
      const paRightStem = defConsonantPa!.strokes[1];
      expect(paRightStem).toBeDefined();
      expect(paRightStem.startPoint.y).toBeLessThanOrEqual(32);
      expect(paRightStem.endPoint.y).toBeGreaterThanOrEqual(84);
    });

    it('Gujarati digit ૧ has smooth continuous top loop and fluid stem', () => {
      const defOne = getCharacterStrokeDefinition('૧', 'gu');
      expect(defOne).not.toBeNull();
      expect(defOne?.character).toBe('૧');
      expect(defOne!.strokes[0].points.length).toBeGreaterThan(10);

      // End point of the stem curves slightly right at the bottom
      const endPoint = defOne!.strokes[0].endPoint;
      expect(endPoint.y).toBeGreaterThanOrEqual(80);
      expect(endPoint.x).toBeGreaterThan(50);
    });

    it('All Gujarati digits ૦ through ૯ are defined with valid handwriting paths', () => {
      const digits = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
      for (const d of digits) {
        const def = getCharacterStrokeDefinition(d, 'gu');
        expect(def).not.toBeNull();
        expect(def?.strokes.length).toBeGreaterThanOrEqual(1);
        for (const s of def!.strokes) {
          expect(s.points.length).toBeGreaterThanOrEqual(2);
        }
      }
    });

    it('Gujarati vowels (અ, આ, ઇ, etc.) have proper handwriting structure without Shirorekha', () => {
      const defA = getCharacterStrokeDefinition('અ', 'gu');
      expect(defA).not.toBeNull();
      expect(defA?.category).toBe('vowel');
      // Gujarati vowels do NOT have Devanagari headline (Shirorekha)
      const hasShiro = defA!.strokes.some((s) => s.id.includes('shiro') || s.description?.toLowerCase().includes('shirorekha'));
      expect(hasShiro).toBe(false);

      const defAa = getCharacterStrokeDefinition('આ', 'gu');
      expect(defAa).not.toBeNull();
      // Aa has additional vertical stem
      expect(defAa!.strokes.length).toBeGreaterThan(defA!.strokes.length);
    });

    it('All 34 Gujarati consonants are defined with valid paths', () => {
      const consonants = ['ક', 'ખ', 'ગ', 'ઘ', 'ચ', 'છ', 'જ', 'ઝ', 'ટ', 'ઠ', 'ડ', 'ઢ', 'ણ', 'ત', 'થ', 'દ', 'ધ', 'ન', 'પ', 'ફ', 'બ', 'ભ', 'મ', 'ય', 'ર', 'લ', 'વ', 'શ', 'ષ', 'સ', 'હ', 'ળ', 'ક્ષ', 'જ્ઞ'];
      for (const c of consonants) {
        const def = getCharacterStrokeDefinition(c, 'gu');
        expect(def).not.toBeNull();
        const expectedCat = (c === 'ક્ષ' || c === 'જ્ઞ') ? 'conjunct' : 'consonant';
        expect(def?.category).toBe(expectedCat);
      }
    });
  });

  describe('Hindi (Devanagari) Handwriting Geometry & Accuracy', () => {
    it('Devanagari vowel अ has 5 distinct strokes including the headline (शिरोरेखा)', () => {
      const def = getCharacterStrokeDefinition('अ', 'hi');
      expect(def).not.toBeNull();
      expect(def?.character).toBe('अ');
      expect(def?.totalStrokes).toBe(5);

      // Verify stroke structure:
      // 1. Upper 3-curve
      // 2. Lower 3-curve
      // 3. Middle horizontal connector
      // 4. Vertical main stem
      // 5. Top headline (shirorekha)
      const strokeIds = def!.strokes.map((s) => s.id);
      expect(strokeIds[0]).toContain('s1');
      expect(strokeIds[1]).toContain('s2');
      expect(strokeIds[2]).toContain('s3');
      expect(strokeIds[3]).toContain('s4');
      expect(strokeIds[4]).toContain('s5');

      // The final stroke is the Shirorekha
      const shiro = def!.strokes[4];
      expect(shiro.description?.toLowerCase()).toContain('shirorekha');
      expect(shiro.startPoint.y).toBe(24);
      expect(shiro.endPoint.y).toBe(24);
      expect(shiro.endPoint.x).toBeGreaterThan(shiro.startPoint.x);
    });

    it('Devanagari vowel आ has 6 distinct strokes including second vertical stem and headline', () => {
      const def = getCharacterStrokeDefinition('आ', 'hi');
      expect(def).not.toBeNull();
      expect(def?.character).toBe('आ');
      expect(def?.totalStrokes).toBe(6);

      const shiro = def!.strokes[5];
      expect(shiro.description?.toLowerCase()).toContain('shirorekha');
      expect(shiro.startPoint.y).toBe(24);
      expect(shiro.endPoint.y).toBe(24);
    });

    it('Hindi word "अनार" generates valid multi-character trajectory with unified Shirorekha', () => {
      const def = getCharacterStrokeDefinition('अनार', 'hi');
      expect(def).not.toBeNull();
      expect(def?.category).toBe('word');

      // Check unified Shirorekha stroke
      const lastStroke = def!.strokes[def!.strokes.length - 1];
      expect(lastStroke.id).toContain('unified_shiro');
      expect(lastStroke.startPoint.x).toBeLessThan(15);
      expect(lastStroke.endPoint.x).toBeGreaterThan(85);
      expect(lastStroke.startPoint.y).toBe(24);
      expect(lastStroke.endPoint.y).toBe(24);
    });

    it('All Devanagari digits ० through ९ are defined with authentic geometry', () => {
      const digits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
      for (const d of digits) {
        // Test Hindi digits
        const def = getCharacterStrokeDefinition(d, 'hi');
        expect(def).not.toBeNull();
      }
    });

    it('All Devanagari consonants (क through ह + क्ष, त्र, ज्ञ) have accurate stroke decomposition and Shirorekha', () => {
      const consonants = ['क', 'ख', 'ग', 'घ', 'च', 'छ', 'ज', 'झ', 'ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न', 'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह', 'क्ष', 'त्र', 'ज्ञ'];
      for (const c of consonants) {
        const def = getCharacterStrokeDefinition(c, 'hi');
        expect(def).not.toBeNull();
        const expectedCat = (c === 'क्ष' || c === 'त्र' || c === 'ज्ञ') ? 'conjunct' : 'consonant';
        expect(def?.category).toBe(expectedCat);

        // Consonants must have Shirorekha as final stroke at y = 24
        const lastStroke = def!.strokes[def!.strokes.length - 1];
        expect(lastStroke.startPoint.y).toBe(24);
        expect(lastStroke.endPoint.y).toBe(24);
      }
    });
  });

  describe('Tracing Accuracy & Progress Evaluation with Real Characters', () => {
    it('evaluates tracing accuracy on Gujarati digit ૫ smoothly and rewards correct coverage', () => {
      const ref = buildReferenceGlyphData('૫', WIDTH, HEIGHT, undefined, 'gu');
      expect(ref.referencePoints.length).toBeGreaterThan(20);

      // Trace first 50% of reference points
      const halfPoints = ref.referencePoints.slice(0, Math.floor(ref.referencePoints.length * 0.5));
      const evalHalf = evaluateTracingAccuracy(halfPoints, ref);
      expect(evalHalf.accuracy).toBeGreaterThanOrEqual(40);
      expect(evalHalf.accuracy).toBeLessThan(75);
      expect(evalHalf.isComplete).toBe(false);

      // Trace 100% of reference points
      const evalFull = evaluateTracingAccuracy(ref.referencePoints, ref);
      expect(evalFull.accuracy).toBeGreaterThanOrEqual(95);
      expect(evalFull.isComplete).toBe(true);
    });

    it('evaluates multi-stroke Hindi vowel अ and prevents 100% completion if strokes are skipped', () => {
      const ref = buildReferenceGlyphData('अ', WIDTH, HEIGHT, undefined, 'hi');
      expect(ref.segments.length).toBeGreaterThanOrEqual(4);

      // User draws ONLY the top shirorekha (which is only 1 of 5 strokes)
      const shiroSegment = ref.segments[ref.segments.length - 1];
      const evalShiroOnly = evaluateTracingAccuracy(shiroSegment.points, ref);

      // Progress must be low, nowhere near 100%
      expect(evalShiroOnly.accuracy).toBeLessThan(35);
      expect(evalShiroOnly.isComplete).toBe(false);
    });

    it('rejects drawing far outside the character guide and gives 0% accuracy', () => {
      const ref = buildReferenceGlyphData('અ', WIDTH, HEIGHT, undefined, 'gu');
      // Draw in the top-left corner far away from reference
      const outsidePoints: Point2D[] = [
        { x: 5, y: 5 },
        { x: 10, y: 5 },
        { x: 15, y: 10 },
      ];
      const evalResult = evaluateTracingAccuracy(outsidePoints, ref);
      expect(evalResult.accuracy).toBe(0);
      expect(evalResult.isComplete).toBe(false);
    });
  });

  describe('Matra & Vowel Sign Coverage', () => {
    it('All 12 Gujarati matras are defined with valid stroke geometries', () => {
      const guMatras = ['ા', 'િ', 'ી', 'ુ', 'ૂ', 'ૃ', 'ે', 'ૈ', 'ો', 'ૌ', 'ં', 'ઃ'];
      for (const m of guMatras) {
        const def = getCharacterStrokeDefinition(m, 'gu');
        expect(def).not.toBeNull();
        expect(def?.category).toBe('matra');
        expect(def?.strokes.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('All 13 Hindi matras and signs are defined with valid stroke geometries', () => {
      const hiMatras = ['ा', 'ि', 'ी', 'ु', 'ू', 'ृ', 'े', 'ै', 'ो', 'ौ', 'ं', 'ः', 'ँ'];
      for (const m of hiMatras) {
        const def = getCharacterStrokeDefinition(m, 'hi');
        expect(def).not.toBeNull();
        expect(def?.category).toBe('matra');
        expect(def?.strokes.length).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('Script Isolation & No-Pollution Validation', () => {
    it('gu and hi stroke registries contain zero cross-script misplaced characters', () => {
      const guDefA = getCharacterStrokeDefinition('અ', 'gu');
      expect(guDefA?.language).toBe('gu');

      const hiDefA = getCharacterStrokeDefinition('अ', 'hi');
      expect(hiDefA?.language).toBe('hi');

      // Gujarati ૫ is digit, consonant પ is consonant
      const guDigit5 = getCharacterStrokeDefinition('૫', 'gu');
      const guLetterPa = getCharacterStrokeDefinition('પ', 'gu');
      expect(guDigit5?.category).toBe('number');
      expect(guLetterPa?.category).toBe('consonant');
      expect(guDigit5?.strokes.length).toBe(1);
      expect(guLetterPa?.strokes.length).toBe(2);
    });
  });

  describe('Multi-Digit Number Kerning & Reduced Margin (Gujarati, Hindi, English)', () => {
    const W = 380;
    const H = 260;

    it('Gujarati multi-digit number ૧૭ has natural reduced margin (< 26px) instead of giant gap', () => {
      const ref = buildReferenceGlyphData('૧૭', W, H, undefined, 'gu');
      expect(ref.referencePoints.length).toBeGreaterThan(40);

      // Separate points into first digit and second digit
      const xs = ref.referencePoints.map((p) => p.x);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const midX = (minX + maxX) / 2;

      const digit1Points = ref.strokes.filter(s => s.id.startsWith('char_0_')).flatMap(s => s.points);
      const digit2Points = ref.strokes.filter(s => s.id.startsWith('char_1_')).flatMap(s => s.points);

      const digit1MaxX = Math.max(...digit1Points.map((p) => p.x));
      const digit2MinX = Math.min(...digit2Points.map((p) => p.x));

      const marginBetweenDigits = digit2MinX - digit1MaxX;
      // Margin between numerical characters should be tight (< 26px) and clean (>= 12px)
      expect(marginBetweenDigits).toBeLessThan(26);
      expect(marginBetweenDigits).toBeGreaterThanOrEqual(12);

      // Symmetrically centered on canvas
      const leftPad = minX;
      const rightPad = W - maxX;
      expect(Math.abs(leftPad - rightPad)).toBeLessThan(5);
    });

    it('English multi-digit number 17 has natural reduced margin (< 26px) between digits', () => {
      const ref = buildReferenceGlyphData('17', W, H, undefined, 'en');
      expect(ref.referencePoints.length).toBeGreaterThan(35);

      const xs = ref.referencePoints.map((p) => p.x);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const midX = (minX + maxX) / 2;

      const digit1Points = ref.strokes.filter(s => s.id.startsWith('char_0_')).flatMap(s => s.points);
      const digit2Points = ref.strokes.filter(s => s.id.startsWith('char_1_')).flatMap(s => s.points);

      const digit1MaxX = Math.max(...digit1Points.map((p) => p.x));
      const digit2MinX = Math.min(...digit2Points.map((p) => p.x));

      const marginBetweenDigits = digit2MinX - digit1MaxX;
      expect(marginBetweenDigits).toBeLessThan(26);
      expect(marginBetweenDigits).toBeGreaterThanOrEqual(12);

      const leftPad = minX;
      const rightPad = W - maxX;
      expect(Math.abs(leftPad - rightPad)).toBeLessThan(5);
    });

    it('Hindi multi-digit number १७ has natural reduced margin (< 26px) between digits', () => {
      const ref = buildReferenceGlyphData('१७', W, H, undefined, 'hi');
      expect(ref.referencePoints.length).toBeGreaterThan(40);

      const xs = ref.referencePoints.map((p) => p.x);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const midX = (minX + maxX) / 2;

      const digit1Points = ref.strokes.filter(s => s.id.startsWith('char_0_')).flatMap(s => s.points);
      const digit2Points = ref.strokes.filter(s => s.id.startsWith('char_1_')).flatMap(s => s.points);

      const digit1MaxX = Math.max(...digit1Points.map((p) => p.x));
      const digit2MinX = Math.min(...digit2Points.map((p) => p.x));

      const marginBetweenDigits = digit2MinX - digit1MaxX;
      expect(marginBetweenDigits).toBeLessThan(26);
      expect(marginBetweenDigits).toBeGreaterThanOrEqual(12);

      const leftPad = minX;
      const rightPad = W - maxX;
      expect(Math.abs(leftPad - rightPad)).toBeLessThan(5);
    });
  });
});
