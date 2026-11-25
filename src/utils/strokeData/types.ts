/**
 * Core handwriting tracing types for Gujarati, Hindi (Devanagari), and English.
 */

export interface Point2D {
  x: number;
  y: number;
}

export type StrokeDirection =
  | 'forward'
  | 'down'
  | 'up'
  | 'left_to_right'
  | 'right_to_left'
  | 'clockwise'
  | 'counter_clockwise';

export interface StrokeDefinition {
  id: string;
  order: number;
  points: Point2D[];
  startPoint: Point2D;
  endPoint: Point2D;
  direction?: StrokeDirection;
  description?: string;
}

export type CharacterCategory =
  | 'vowel'
  | 'consonant'
  | 'number'
  | 'matra'
  | 'word'
  | 'conjunct';

export type HandwritingLanguage = 'gu' | 'hi' | 'en' | 'all';

export interface CharacterStrokeDefinition {
  character: string;
  language: HandwritingLanguage;
  category: CharacterCategory;
  strokes: StrokeDefinition[];
  totalStrokes: number;
  metadata?: {
    phonetic?: string;
    transliteration?: string;
    hasShirorekha?: boolean;
    description?: string;
  };
}

export interface ScaledTrajectoryData {
  referencePoints: Point2D[];
  strokes: { id: string; points: Point2D[] }[];
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
  totalPathLength: number;
}

