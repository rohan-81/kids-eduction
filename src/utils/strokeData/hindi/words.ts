import { CharacterStrokeDefinition, StrokeDefinition, Point2D } from '../types';
import { HINDI_VOWELS } from './vowels';
import { HINDI_CONSONANTS } from './consonants';
import { createStroke } from '../strokeSampler';

/**
 * Composes multi-syllable Hindi words into a single scaled stroke set.
 * Characters are laid out horizontally from left to right, and a unified Shirorekha is drawn across the top.
 */
export function composeWordStrokes(word: string, parts: string[]): CharacterStrokeDefinition {
  const count = parts.length;
  const padding = 6;
  const totalWidth = 100 - (padding * 2);
  const partWidth = totalWidth / count;

  const combinedStrokes: StrokeDefinition[] = [];
  let strokeCounter = 1;

  for (let i = 0; i < count; i++) {
    const part = parts[i];
    // Find base character definition
    let baseDef = HINDI_VOWELS[part] || HINDI_CONSONANTS[part];
    
    // If not found directly, check first char of part
    if (!baseDef && part.length > 0) {
      baseDef = HINDI_VOWELS[part[0]] || HINDI_CONSONANTS[part[0]];
    }

    const slotStartX = padding + (i * partWidth);
    const slotScaleX = (partWidth * 0.9) / 100;

    if (baseDef) {
      // Exclude base shirorekha from individual characters (we draw a continuous one at the end)
      const nonShiroStrokes = baseDef.strokes.filter(s => !s.id.includes('shiro'));
      for (const st of nonShiroStrokes) {
        const shiftedPoints: Point2D[] = st.points.map(pt => ({
          x: Math.round((slotStartX + (pt.x * slotScaleX)) * 10) / 10,
          y: pt.y
        }));
        combinedStrokes.push(createStroke(
          `hi_word_${word}_part${i}_${st.id}`,
          strokeCounter++,
          shiftedPoints,
          st.direction
        ));
      }
    }
  }

  // Add the unified Shirorekha spanning across the entire word at y = 24
  combinedStrokes.push(createStroke(
    `hi_word_${word}_unified_shiro`,
    strokeCounter,
    [
      { x: padding, y: 24 },
      { x: 100 - padding, y: 24 }
    ],
    'left_to_right'
  ));

  return {
    character: word,
    language: 'hi',
    category: 'word',
    strokes: combinedStrokes,
    totalStrokes: combinedStrokes.length,
    metadata: {
      description: `Devanagari Word ${word}`
    }
  };
}

/**
 * Common pre-authored Hindi words for lessons and multi-character tracing.
 * Each word correctly connects individual characters under a unified Devanagari headline (Shirorekha).
 */
export const HINDI_WORDS: Record<string, CharacterStrokeDefinition> = {
  'अनार': composeWordStrokes('अनार', ['अ', 'ना', 'र']),
  'आम': composeWordStrokes('आम', ['आ', 'म']),
  'इमली': composeWordStrokes('इमली', ['इ', 'म', 'ली']),
  'ईख': composeWordStrokes('ईख', ['ई', 'ख']),
  'उल्लू': composeWordStrokes('उल्लू', ['उ', 'ल्लू']),
  'ऊन': composeWordStrokes('ऊन', ['ऊ', 'न']),
  'ऋषि': composeWordStrokes('ऋषि', ['ऋ', 'षि']),
  'कमल': composeWordStrokes('कमल', ['क', 'म', 'ल']),
  'घर': composeWordStrokes('घर', ['घ', 'र']),
  'नल': composeWordStrokes('नल', ['न', 'ल']),
  'फल': composeWordStrokes('फल', ['फ', 'ल']),
  'बस': composeWordStrokes('बस', ['ब', 'स'])
};
