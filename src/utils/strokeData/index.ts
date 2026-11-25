import { Point2D, CharacterStrokeDefinition, ScaledTrajectoryData, HandwritingLanguage } from './types';
import { interpolatePoints } from './strokeSampler';
import { GUJARATI_CHARACTERS, getGujaratiCharacterDefinition, GUJARATI_NUMBERS } from './gujarati';
import { HINDI_CHARACTERS, getHindiCharacterDefinition, HINDI_NUMBERS } from './hindi';
import { ENGLISH_CHARACTERS, getEnglishCharacterDefinition, ENGLISH_NUMBERS, ENGLISH_LETTERS } from './english';

export * from './types';
export * from './strokeSampler';
export * from './gujarati';
export * from './hindi';
export * from './english';

/**
 * Detects the language script of a character or string based on Unicode blocks.
 */
export function detectScript(text: string): HandwritingLanguage {
  if (!text) return 'en';
  // Gujarati Unicode block: 0x0A80 - 0x0AFF
  if (/[\u0A80-\u0AFF]/.test(text)) {
    return 'gu';
  }
  // Devanagari (Hindi) Unicode block: 0x0900 - 0x097F
  if (/[\u0900-\u097F]/.test(text)) {
    return 'hi';
  }
  return 'en';
}

/**
 * Fetches the structured stroke definition for a character or word in Gujarati or Hindi.
 */
export function getCharacterStrokeDefinition(
  text: string,
  preferredLanguage?: string
): CharacterStrokeDefinition | null {
  if (!text) return null;
  const trimmed = text.trim();
  const script = preferredLanguage === 'hi' || preferredLanguage === 'gu' || preferredLanguage === 'en'
    ? preferredLanguage
    : detectScript(trimmed);

  if (script === 'hi') {
    const hiDef = getHindiCharacterDefinition(trimmed);
    if (hiDef) return hiDef;
  } else if (script === 'gu') {
    const guDef = getGujaratiCharacterDefinition(trimmed);
    if (guDef) return guDef;
  } else if (script === 'en') {
    const enDef = getEnglishCharacterDefinition(trimmed);
    if (enDef) return enDef;
  }

  // Cross-language fallback check: English, Gujarati, Hindi
  const enFallback = getEnglishCharacterDefinition(trimmed);
  if (enFallback) return enFallback;

  const guFallback = getGujaratiCharacterDefinition(trimmed);
  if (guFallback) return guFallback;

  const hiFallback = getHindiCharacterDefinition(trimmed);
  if (hiFallback) return hiFallback;

  return null;
}

/**
 * Maps multi-character string or single symbol to canvas coordinates [width x height],
 * maintaining correct aspect ratio, authentic handwriting strokes, and smooth interpolation.
 */
export function getScaledCharacterTrajectory(
  text: string,
  canvasWidth: number,
  canvasHeight: number,
  language?: string
): ScaledTrajectoryData {
  const trimmed = text ? text.trim() : '';

  // Check if string is a multi-digit numerical sequence (English, Gujarati, or Hindi digits)
  const isNumericChar = (ch: string) => /^[\d\u0AE6-\u0AEF\u0966-\u096F]$/.test(ch);
  const chars = Array.from(trimmed);
  const isMultiDigitNumber = chars.length > 1 && chars.every(isNumericChar);

  // 1. Try unified structured definition (for single characters or explicitly compound non-numeric ligatures)
  const structuredDef = !isMultiDigitNumber ? getCharacterStrokeDefinition(trimmed, language) : undefined;
  let charUnits: Point2D[][][];

  if (structuredDef) {
    charUnits = [structuredDef.strokes.map(s => s.points)];
  } else {
    // Break down into characters
    charUnits = chars.map(ch => {
      const def = getCharacterStrokeDefinition(ch, language);
      if (def) {
        return def.strokes.map(s => s.points);
      }
      return [];
    });
  }

  // Fallback if empty
  if (charUnits.length === 0 || charUnits.every(u => u.length === 0)) {
    charUnits = [[
      [
        { x: 30, y: 30 },
        { x: 70, y: 30 },
        { x: 70, y: 70 },
        { x: 30, y: 70 }
      ]
    ]];
  }

  const numChars = Math.max(1, charUnits.length);

  // Guidelines: Top at 18%, Bottom at 82%
  const topGuideY = canvasHeight * 0.18;
  const botGuideY = canvasHeight * 0.82;
  const guideH = botGuideY - topGuideY;

  const padX = canvasWidth * 0.08;
  const availW = canvasWidth - 2 * padX;

  const allPoints: Point2D[] = [];
  const allStrokes: { id: string; points: Point2D[] }[] = [];

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let totalPathLength = 0;

  if (numChars === 1) {
    const padXSingle = canvasWidth * 0.10;
    const padYSingle = canvasHeight * 0.12;
    const availWSingle = canvasWidth - 2 * padXSingle;
    const availHSingle = canvasHeight - 2 * padYSingle;
    const charSize = Math.min(availHSingle, availWSingle * 0.92);
    const charStartX = (canvasWidth - charSize) / 2;
    const charStartY = (canvasHeight - charSize) / 2;

    const rawStrokes = charUnits[0];

    for (let sIdx = 0; sIdx < rawStrokes.length; sIdx++) {
      const stroke = rawStrokes[sIdx];
      if (stroke.length === 0) continue;

      const scaledStrokePts: Point2D[] = [];
      for (const p of stroke) {
        const sx = charStartX + (p.x / 100) * charSize;
        const sy = charStartY + (p.y / 100) * charSize;
        scaledStrokePts.push({ x: sx, y: sy });
      }

      const densifiedPts: Point2D[] = [scaledStrokePts[0]];
      for (let i = 1; i < scaledStrokePts.length; i++) {
        const p1 = densifiedPts[densifiedPts.length - 1];
        const p2 = scaledStrokePts[i];
        totalPathLength += Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const interpolated = interpolatePoints(p1, p2, 3.5);
        densifiedPts.push(...interpolated);
      }

      for (const dp of densifiedPts) {
        if (dp.x < minX) minX = dp.x;
        if (dp.x > maxX) maxX = dp.x;
        if (dp.y < minY) minY = dp.y;
        if (dp.y > maxY) maxY = dp.y;
        allPoints.push(dp);
      }

      allStrokes.push({
        id: `char_0_stroke_${sIdx}`,
        points: densifiedPts,
      });
    }
  } else if (isMultiDigitNumber) {
    // Multi-digit numerical layout: reduced margin between digits, optically kerned and centered
    let charSize = guideH * 0.95;
    let targetMargin = Math.max(14, Math.min(22, charSize * 0.12)); // ~18-20px natural handwriting margin

    // 1. Compute bounding boxes in [0..100] coordinate space for each digit
    const bounds = charUnits.map(unit => {
      let uMinX = 100;
      let uMaxX = 0;
      for (const stroke of unit) {
        for (const p of stroke) {
          if (p.x < uMinX) uMinX = p.x;
          if (p.x > uMaxX) uMaxX = p.x;
        }
      }
      return {
        minX: uMinX <= uMaxX ? uMinX : 30,
        maxX: uMinX <= uMaxX ? uMaxX : 70,
      };
    });

    // 2. Compute relative horizontal offsets ensuring exact targetMargin between adjacent digits
    const computeOffsets = (size: number, margin: number) => {
      const offsets: number[] = [0];
      for (let i = 0; i < numChars - 1; i++) {
        const delta = (bounds[i].maxX - bounds[i + 1].minX) * (size / 100) + margin;
        offsets.push(offsets[i] + delta);
      }
      let minG = Infinity;
      let maxG = -Infinity;
      for (let i = 0; i < numChars; i++) {
        const pMin = offsets[i] + bounds[i].minX * (size / 100);
        const pMax = offsets[i] + bounds[i].maxX * (size / 100);
        if (pMin < minG) minG = pMin;
        if (pMax > maxG) maxG = pMax;
      }
      return { offsets, totalW: maxG - minG, minG };
    };

    let { offsets, totalW, minG } = computeOffsets(charSize, targetMargin);

    // If total width exceeds available canvas width (e.g. 3-digit number 100 on narrow screens), scale down proportionally
    const maxAllowedW = canvasWidth * 0.88;
    if (totalW > maxAllowedW) {
      const scale = maxAllowedW / totalW;
      charSize *= scale;
      targetMargin *= scale;
      const res = computeOffsets(charSize, targetMargin);
      offsets = res.offsets;
      totalW = res.totalW;
      minG = res.minG;
    }

    const shiftX = (canvasWidth - totalW) / 2 - minG;
    const charStartY = topGuideY + (guideH - charSize) / 2;

    for (let c = 0; c < numChars; c++) {
      const rawStrokes = charUnits[c];
      const charStartX = offsets[c] + shiftX;

      for (let sIdx = 0; sIdx < rawStrokes.length; sIdx++) {
        const stroke = rawStrokes[sIdx];
        if (stroke.length === 0) continue;

        const scaledStrokePts: Point2D[] = [];
        for (const p of stroke) {
          const sx = charStartX + (p.x / 100) * charSize;
          const sy = charStartY + (p.y / 100) * charSize;
          scaledStrokePts.push({ x: sx, y: sy });
        }

        const densifiedPts: Point2D[] = [scaledStrokePts[0]];
        for (let i = 1; i < scaledStrokePts.length; i++) {
          const p1 = densifiedPts[densifiedPts.length - 1];
          const p2 = scaledStrokePts[i];
          totalPathLength += Math.hypot(p2.x - p1.x, p2.y - p1.y);
          const interpolated = interpolatePoints(p1, p2, 3.5);
          densifiedPts.push(...interpolated);
        }

        for (const dp of densifiedPts) {
          if (dp.x < minX) minX = dp.x;
          if (dp.x > maxX) maxX = dp.x;
          if (dp.y < minY) minY = dp.y;
          if (dp.y > maxY) maxY = dp.y;
          allPoints.push(dp);
        }

        allStrokes.push({
          id: `char_${c}_stroke_${sIdx}`,
          points: densifiedPts,
        });
      }
    }
  } else {
    // Multi-character word
    const charSlotW = availW / numChars;
    const charSize = Math.min(guideH, charSlotW * 0.92);
    const charStartY = topGuideY + (guideH - charSize) / 2;

    for (let c = 0; c < numChars; c++) {
      const rawStrokes = charUnits[c];
      const slotCenterX = padX + c * charSlotW + charSlotW / 2;
      const charStartX = slotCenterX - charSize / 2;

      for (let sIdx = 0; sIdx < rawStrokes.length; sIdx++) {
        const stroke = rawStrokes[sIdx];
        if (stroke.length === 0) continue;

        const scaledStrokePts: Point2D[] = [];
        for (const p of stroke) {
          const sx = charStartX + (p.x / 100) * charSize;
          const sy = charStartY + (p.y / 100) * charSize;
          scaledStrokePts.push({ x: sx, y: sy });
        }

        const densifiedPts: Point2D[] = [scaledStrokePts[0]];
        for (let i = 1; i < scaledStrokePts.length; i++) {
          const p1 = densifiedPts[densifiedPts.length - 1];
          const p2 = scaledStrokePts[i];
          totalPathLength += Math.hypot(p2.x - p1.x, p2.y - p1.y);
          const interpolated = interpolatePoints(p1, p2, 3.5);
          densifiedPts.push(...interpolated);
        }

        for (const dp of densifiedPts) {
          if (dp.x < minX) minX = dp.x;
          if (dp.x > maxX) maxX = dp.x;
          if (dp.y < minY) minY = dp.y;
          if (dp.y > maxY) maxY = dp.y;
          allPoints.push(dp);
        }

        allStrokes.push({
          id: `char_${c}_stroke_${sIdx}`,
          points: densifiedPts,
        });
      }
    }
  }

  return {
    referencePoints: allPoints,
    strokes: allStrokes,
    bounds: {
      minX: minX === Infinity ? 0 : minX,
      maxX: maxX === -Infinity ? canvasWidth : maxX,
      minY: minY === Infinity ? 0 : minY,
      maxY: maxY === -Infinity ? canvasHeight : maxY,
    },
    totalPathLength,
  };
}

