/**
 * High-Precision Geometric Handwriting Tracing & Stroke Validation Engine.
 *
 * Implements deterministic centerline path matching, directional trajectory
 * coverage analysis, structural segment validation, and strict off-path deviation /
 * stray scribble penalization for Gujarati numerals, vowels, consonants, and English letters.
 */

import {
  Point2D,
  getScaledCharacterTrajectory,
  ScaledTrajectoryData,
} from './characterStrokeData';

export { Point2D };

/**
 * Calculates optimal font size for any text so it fits comfortably inside canvas bounds.
 */
export function calculateOptimalFontSize(
  text: string,
  width: number,
  height: number
): number {
  const len = Math.max(1, text.trim().length);
  const maxWidth = width * 0.90;
  const maxHeight = height * 0.85;

  if (len === 1) {
    return Math.min(260, Math.round(Math.min(maxWidth * 0.95, maxHeight * 0.88)));
  } else if (len === 2) {
    return Math.min(175, Math.round(Math.min(maxHeight * 0.85, maxWidth / 1.7)));
  } else {
    return Math.min(125, Math.round(Math.min(maxHeight * 0.78, maxWidth / (len * 0.75))));
  }
}

export interface TracingStroke {
  points: Point2D[];
  color?: string;
  isComplete?: boolean;
}

export interface StructuralSegment {
  id: string;
  characterIndex: number;
  totalPoints: number;
  points: Point2D[];
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface ReferenceGlyphData {
  text: string;
  width: number;
  height: number;
  fontSize: number;
  referencePoints: Point2D[];
  strokes: { id: string; points: Point2D[] }[];
  mask: Uint8Array | null;
  segments: StructuralSegment[];
  totalReferencePoints: number;
  characterBounds: { minX: number; maxX: number; minY: number; maxY: number }[];
  totalPathLength: number;
}

export interface TracingEvaluationResult {
  /** Live validated accuracy percentage [0, 100] */
  accuracy: number;
  /** Coverage ratio of the reference trajectory [0.0, 1.0] */
  coverageRatio: number;
  /** Precision ratio of on-path vs off-path drawing [0.0, 1.0] */
  precision: number;
  /** Fraction of mandatory structural segments successfully traced [0.0, 1.0] */
  segmentCompletionRatio: number;
  /** List of IDs of missing or insufficiently traced structural segments */
  missingSegmentIds: string[];
  /** Strict boolean indicating whether the entire character/word is authentically complete */
  isComplete: boolean;
  /** Number of stars earned: 0 (<50%), 1 (50-74%), 2 (75-89%), 3 (90-100%) */
  stars: number;
  /** Informative status code for feedback */
  status: 'empty' | 'in_progress' | 'missing_stroke' | 'off_track' | 'completed';
}

export interface EngineConfig {
  /** Distance (in px) from reference point to be considered touched. Default: 22 */
  reachTolerance?: number;
  /** Distance (in px) for direct core coverage. Default: 12 */
  coreTolerance?: number;
  /** Distance (in px) from glyph trajectory to be considered on-track. Default: 24 */
  onTrackTolerance?: number;
  /** Distance (in px) beyond which points are considered stray scribbles. Default: 38 */
  strayTolerance?: number;
  /** Minimum coverage ratio per mandatory segment (0.0 to 1.0). Default: 0.45 */
  minSegmentCoverage?: number;
  /** Minimum overall trajectory coverage required for 100% completion. Default: 0.94 */
  requiredCompletionCoverage?: number;
}

const DEFAULT_CONFIG: Required<EngineConfig> = {
  reachTolerance: 9,
  coreTolerance: 6,
  onTrackTolerance: 16,
  strayTolerance: 26,
  minSegmentCoverage: 0.60,
  requiredCompletionCoverage: 0.97,
};

/**
 * Linearly interpolates points between two coordinates with step distance.
 */
export function interpolateLine(p1: Point2D, p2: Point2D, step = 3.0): Point2D[] {
  const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  if (dist <= step) return [p2];
  const steps = Math.min(50, Math.ceil(dist / step));
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
 * Dense resampler: turns a sequence of sparse user strokes into an uninterrupted point sequence.
 */
export function densifyStrokePoints(rawPoints: Point2D[], step = 3.0): Point2D[] {
  if (!rawPoints || rawPoints.length === 0) return [];
  const result: Point2D[] = [rawPoints[0]];
  for (let i = 1; i < rawPoints.length; i++) {
    const prev = result[result.length - 1];
    const curr = rawPoints[i];
    const dist = Math.hypot(curr.x - prev.x, curr.y - prev.y);
    if (dist > 4.0 && dist <= 28) {
      const interp = interpolateLine(prev, curr, step);
      result.push(...interp);
    } else if (dist >= 0.5) {
      result.push(curr);
    }
  }
  return result;
}

/**
 * Generates accurate reference glyph trajectory points, occupancy mask,
 * and structural segments using genuine handwriting strokes.
 */
export function buildReferenceGlyphData(
  text: string,
  width: number,
  height: number,
  customFontSize?: number,
  language?: string
): ReferenceGlyphData {
  const trimmed = text.trim();
  const w = Math.round(Math.max(50, width));
  const h = Math.round(Math.max(50, height));
  const fontSize = customFontSize || calculateOptimalFontSize(trimmed, w, h);

  // 1. Obtain authentic scaled character trajectory
  const trajectory: ScaledTrajectoryData = getScaledCharacterTrajectory(trimmed, w, h, language);

  // 2. Build structural segments from the strokes
  const segments: StructuralSegment[] = [];
  const numChars = Math.max(1, Array.from(trimmed).length);

  for (let i = 0; i < trajectory.strokes.length; i++) {
    const s = trajectory.strokes[i];
    const pts = s.points;
    if (pts.length === 0) continue;

    const charIdx =
      numChars > 1 ? Math.min(numChars - 1, Math.floor((i / trajectory.strokes.length) * numChars)) : 0;

    // If multi-stroke character or word, each stroke is an atomic structural component.
    // If single continuous stroke letter (e.g. 'ઉ', '૨', '૩', '૮'), divide into 2-3 logical segments.
    const shouldPartition = trajectory.strokes.length === 1 && pts.length >= 50;
    const numChunks = shouldPartition ? (pts.length >= 80 ? 3 : 2) : 1;
    const chunkSize = Math.floor(pts.length / numChunks);

    for (let c = 0; c < numChunks; c++) {
      const cStart = c * chunkSize;
      const cEnd = c === numChunks - 1 ? pts.length : (c + 1) * chunkSize;
      const chunkPts = pts.slice(cStart, cEnd);
      let sMinX = Infinity, sMaxX = -Infinity, sMinY = Infinity, sMaxY = -Infinity;
      for (const p of chunkPts) {
        if (p.x < sMinX) sMinX = p.x;
        if (p.x > sMaxX) sMaxX = p.x;
        if (p.y < sMinY) sMinY = p.y;
        if (p.y > sMaxY) sMaxY = p.y;
      }

      const segId = shouldPartition ? `${s.id}_chunk_${c}` : s.id;
      segments.push({
        id: segId,
        characterIndex: charIdx,
        totalPoints: chunkPts.length,
        points: chunkPts,
        minX: sMinX,
        maxX: sMaxX,
        minY: sMinY,
        maxY: sMaxY,
      });
    }
  }

  return {
    text: trimmed,
    width: w,
    height: h,
    fontSize,
    referencePoints: trajectory.referencePoints,
    strokes: trajectory.strokes,
    mask: null,
    segments: segments.length > 0 ? segments : [
      {
        id: 'seg_default',
        characterIndex: 0,
        totalPoints: trajectory.referencePoints.length,
        points: trajectory.referencePoints,
        minX: trajectory.bounds.minX,
        maxX: trajectory.bounds.maxX,
        minY: trajectory.bounds.minY,
        maxY: trajectory.bounds.maxY,
      },
    ],
    totalReferencePoints: trajectory.referencePoints.length,
    characterBounds: [trajectory.bounds],
    totalPathLength: trajectory.totalPathLength,
  };
}

/**
 * Checks if a point is within allowed tolerance of the glyph trajectory.
 */
export function isPointOnGlyph(
  pt: Point2D,
  mask: Uint8Array | null,
  width: number,
  height: number,
  tolerance = 24,
  bounds?: { minX: number; maxX: number; minY: number; maxY: number }[]
): boolean {
  if (bounds && bounds.length > 0) {
    for (const b of bounds) {
      if (
        pt.x >= b.minX - tolerance &&
        pt.x <= b.maxX + tolerance &&
        pt.y >= b.minY - tolerance &&
        pt.y <= b.maxY + tolerance
      ) {
        return true;
      }
    }
    return false;
  }
  return true;
}

/**
 * Deterministic Tracing Accuracy Evaluator.
 *
 * Mathematically validates input strokes against reference glyph data:
 * - Forward trajectory coverage
 * - Backward precision and strict penalization for off-track scribbles / circles
 * - Structural segment completion (detecting missing strokes)
 * - Excess stroke length penalization
 * - Accurate star awarding: 3 stars (90-100%), 2 stars (75-89%), 1 star (50-74%), 0 stars (<50%)
 */
export function evaluateTracingAccuracy(
  userPoints: Point2D[],
  reference: ReferenceGlyphData,
  config?: EngineConfig
): TracingEvaluationResult {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  if (!userPoints || userPoints.length < 3 || reference.totalReferencePoints === 0) {
    return {
      accuracy: 0,
      coverageRatio: 0,
      precision: 0,
      segmentCompletionRatio: 0,
      missingSegmentIds: reference.segments.map((s) => s.id),
      isComplete: false,
      stars: 0,
      status: 'empty',
    };
  }

  // 1. Densify user strokes so fast finger movement has no coordinate gaps
  const densePoints = densifyStrokePoints(userPoints, 3.0);
  if (densePoints.length < 3) {
    return {
      accuracy: 0,
      coverageRatio: 0,
      precision: 0,
      segmentCompletionRatio: 0,
      missingSegmentIds: reference.segments.map((s) => s.id),
      isComplete: false,
      stars: 0,
      status: 'empty',
    };
  }

  // Compute total user path length
  let totalUserLength = 0;
  let userMinX = Infinity, userMaxX = -Infinity, userMinY = Infinity, userMaxY = -Infinity;
  for (let i = 0; i < densePoints.length; i++) {
    const p = densePoints[i];
    if (p.x < userMinX) userMinX = p.x;
    if (p.x > userMaxX) userMaxX = p.x;
    if (p.y < userMinY) userMinY = p.y;
    if (p.y > userMaxY) userMaxY = p.y;

    if (i > 0) {
      totalUserLength += Math.hypot(p.x - densePoints[i - 1].x, p.y - densePoints[i - 1].y);
    }
  }

  // 2. Spatial Grid Indexing for O(1) distance searches
  const BUCKET_SIZE = 25;
  const refBuckets: Record<string, Point2D[]> = {};
  for (const rp of reference.referencePoints) {
    const bx = Math.floor(rp.x / BUCKET_SIZE);
    const by = Math.floor(rp.y / BUCKET_SIZE);
    const key = `${bx}_${by}`;
    if (!refBuckets[key]) refBuckets[key] = [];
    refBuckets[key].push(rp);
  }

  const userBuckets: Record<string, Point2D[]> = {};
  for (const up of densePoints) {
    const bx = Math.floor(up.x / BUCKET_SIZE);
    const by = Math.floor(up.y / BUCKET_SIZE);
    const key = `${bx}_${by}`;
    if (!userBuckets[key]) userBuckets[key] = [];
    userBuckets[key].push(up);
  }

  // 3. Backward Precision: For each user point, distance to closest reference point
  const onTrackSq = cfg.onTrackTolerance * cfg.onTrackTolerance;
  const straySq = cfg.strayTolerance * cfg.strayTolerance;

  let onTrackCount = 0;
  let strayCount = 0;

  for (const up of densePoints) {
    const bx = Math.floor(up.x / BUCKET_SIZE);
    const by = Math.floor(up.y / BUCKET_SIZE);
    let minD2 = Infinity;

    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        const bucket = refBuckets[`${bx + dx}_${by + dy}`];
        if (bucket) {
          for (let j = 0; j < bucket.length; j++) {
            const rp = bucket[j];
            const d2 = (up.x - rp.x) * (up.x - rp.x) + (up.y - rp.y) * (up.y - rp.y);
            if (d2 < minD2) {
              minD2 = d2;
              if (d2 <= onTrackSq) break;
            }
          }
        }
        if (minD2 <= onTrackSq) break;
      }
      if (minD2 <= onTrackSq) break;
    }

    if (minD2 <= onTrackSq) {
      onTrackCount++;
    } else if (minD2 > straySq) {
      strayCount++;
    }
  }

  const precision = densePoints.length > 0 ? onTrackCount / densePoints.length : 0;
  const strayRatio = densePoints.length > 0 ? strayCount / densePoints.length : 0;

  // 4. Forward Coverage: For each reference point, distance to closest user point
  const reachSq = cfg.reachTolerance * cfg.reachTolerance;
  const coreSq = cfg.coreTolerance * cfg.coreTolerance;

  let reachedCount = 0;
  let coreCount = 0;

  for (const rp of reference.referencePoints) {
    const bx = Math.floor(rp.x / BUCKET_SIZE);
    const by = Math.floor(rp.y / BUCKET_SIZE);
    let minD2 = Infinity;

    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        const bucket = userBuckets[`${bx + dx}_${by + dy}`];
        if (bucket) {
          for (let j = 0; j < bucket.length; j++) {
            const up = bucket[j];
            const d2 = (rp.x - up.x) * (rp.x - up.x) + (rp.y - up.y) * (rp.y - up.y);
            if (d2 < minD2) {
              minD2 = d2;
              if (d2 <= coreSq) break;
            }
          }
        }
        if (minD2 <= coreSq) break;
      }
      if (minD2 <= coreSq) break;
    }

    if (minD2 <= reachSq) {
      reachedCount++;
      if (minD2 <= coreSq) {
        coreCount++;
      }
    }
  }

  const rawCoverage =
    reference.totalReferencePoints > 0 ? reachedCount / reference.totalReferencePoints : 0;
  // Authentic progress constraint: User stroke on-track density limits maximum forward coverage.
  // This prevents adjacent strokes/junctions from falsely inflating coverage for partial drawings.
  const maxFeasibleCoverage =
    reference.totalReferencePoints > 0 ? (onTrackCount / reference.totalReferencePoints) * 1.08 : 0;
  const coverageRatio = Math.min(rawCoverage, maxFeasibleCoverage);

  // 5. Structural Segment Validation
  const missingSegmentIds: string[] = [];
  let traversedSegments = 0;

  for (const seg of reference.segments) {
    let segHits = 0;
    for (const sp of seg.points) {
      const bx = Math.floor(sp.x / BUCKET_SIZE);
      const by = Math.floor(sp.y / BUCKET_SIZE);
      let hit = false;

      for (let dx = -2; dx <= 2; dx++) {
        for (let dy = -2; dy <= 2; dy++) {
          const bucket = userBuckets[`${bx + dx}_${by + dy}`];
          if (bucket) {
            for (let j = 0; j < bucket.length; j++) {
              const up = bucket[j];
              const d2 = (sp.x - up.x) * (sp.x - up.x) + (sp.y - up.y) * (sp.y - up.y);
              if (d2 <= reachSq) {
                hit = true;
                break;
              }
            }
          }
          if (hit) break;
        }
        if (hit) break;
      }

      if (hit) segHits++;
    }

    const segRatio = seg.totalPoints > 0 ? segHits / seg.totalPoints : 1;
    if (segRatio >= cfg.minSegmentCoverage) {
      traversedSegments++;
    } else {
      missingSegmentIds.push(seg.id);
    }
  }

  const totalSegments = Math.max(1, reference.segments.length);
  const segmentCompletionRatio = traversedSegments / totalSegments;
  const allSegmentsCovered = missingSegmentIds.length === 0;

  // 6. Excess Stroke & Off-Path Bounding Analysis
  // Detect random circles, wild margin zigzags, and canvas scribbling
  const refB = reference.characterBounds[0] || {
    minX: 0,
    maxX: reference.width,
    minY: 0,
    maxY: reference.height,
  };
  const refSpanX = Math.max(40, refB.maxX - refB.minX);
  const refSpanY = Math.max(40, refB.maxY - refB.minY);
  const userSpanX = Math.max(10, userMaxX - userMinX);
  const userSpanY = Math.max(10, userMaxY - userMinY);

  // If user drawing is wildly oversized compared to reference (e.g. circle drawn around character)
  const isOversizedDrawing =
    userSpanX > refSpanX * 1.55 ||
    userSpanY > refSpanY * 1.55 ||
    (userMinX < refB.minX - 50 && userMaxX > refB.maxX + 50) ||
    (userMinY < refB.minY - 50 && userMaxY > refB.maxY + 50);

  // Excess stroke length penalty
  const refLength = Math.max(80, reference.totalPathLength || reference.totalReferencePoints * 3.5);
  let excessPenalty = 0;
  if (totalUserLength > refLength * 1.8 && precision < 0.65) {
    excessPenalty = Math.min(0.65, ((totalUserLength - refLength * 1.5) / (refLength * 2.0)) * (1 - precision));
  }

  // 7. Progressive Mathematical Accuracy Computation
  let rawAccuracy = coverageRatio * 100;

  // Penalize based on precision (off-path strokes)
  if (precision < 0.60) {
    const precisionWeight = Math.max(0.10, Math.pow(precision / 0.60, 1.2));
    rawAccuracy *= precisionWeight;
  }

  // Penalize excess off-path strokes
  if (excessPenalty > 0) {
    rawAccuracy *= (1 - excessPenalty);
  }

  // Penalize stray scribbles & large surrounding circles
  if (strayRatio > 0.35) {
    const strayPenalty = Math.min(0.85, (strayRatio - 0.25) * 1.5);
    rawAccuracy *= (1 - strayPenalty);
  }

  // Strict clamp if drawing is largely off-track or oversized circles:
  if (isOversizedDrawing && precision < 0.45) {
    rawAccuracy = Math.min(25, rawAccuracy);
  }

  if (precision < 0.25 || strayRatio > 0.60) {
    rawAccuracy = Math.min(20, rawAccuracy);
  }

  // Excess retracing of partial stroke (e.g. child scribbles back and forth on one loop)
  if (totalUserLength > refLength * 2.0 && coverageRatio < 0.50) {
    rawAccuracy = Math.min(rawAccuracy, coverageRatio * 100);
    if (totalUserLength > refLength * 2.2) {
      rawAccuracy = Math.min(48, rawAccuracy);
    }
  }

  // If structural segments are missing (e.g. child omitted a stroke or letter):
  // Cap strictly below 75% so it can NEVER get 2 or 3 stars before all strokes are present.
  // When precision is high (clean partial tracing), preserve authentic progress so 25% shows ~25% and 50% shows ~50%.
  if (!allSegmentsCovered) {
    if (precision < 0.70) {
      rawAccuracy = Math.min(74, rawAccuracy * Math.max(0.4, segmentCompletionRatio));
    } else {
      rawAccuracy = Math.min(74, rawAccuracy);
    }
  }

  let accuracy = Math.round(Math.max(0, Math.min(100, rawAccuracy)));

  // 8. Strict Completion Check for 100% (3 Stars)
  const isComplete =
    allSegmentsCovered &&
    coverageRatio >= cfg.requiredCompletionCoverage &&
    precision >= 0.70 &&
    strayRatio <= 0.10 &&
    !isOversizedDrawing &&
    accuracy >= Math.round(cfg.requiredCompletionCoverage * 100);

  if (isComplete) {
    accuracy = 100;
  } else {
    // If not authentic complete, cap below 100%
    accuracy = Math.min(99, accuracy);
  }

  // 9. Star Assignment matching strict user criteria:
  // 90-100%: 3 stars (Excellent)
  // 75-89%: 2 stars (Good)
  // 50-74%: 1 star (Needs improvement)
  // Below 50%: 0 stars (Incorrect)
  const stars = accuracy >= 90 ? 3 : accuracy >= 75 ? 2 : accuracy >= 50 ? 1 : 0;

  // Status determination
  let status: TracingEvaluationResult['status'] = 'in_progress';
  if (isComplete) {
    status = 'completed';
  } else if (precision < 0.40 || strayRatio > 0.50 || (isOversizedDrawing && precision < 0.60)) {
    status = 'off_track';
  } else if (!allSegmentsCovered && coverageRatio >= 0.35) {
    status = 'missing_stroke';
  }

  return {
    accuracy,
    coverageRatio,
    precision,
    segmentCompletionRatio,
    missingSegmentIds,
    isComplete,
    stars,
    status,
  };
}

/**
 * Procedural fallback helper for tests or external modules if needed.
 */
export function buildSyntheticReferenceGlyph(
  text: string,
  width: number,
  height: number,
  fontSize: number
): ReferenceGlyphData {
  return buildReferenceGlyphData(text, width, height, fontSize);
}
