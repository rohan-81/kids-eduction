import { CharacterStrokeDefinition } from '../types';
import { HINDI_NUMBERS } from './numbers';
import { HINDI_VOWELS } from './vowels';
import { HINDI_CONSONANTS } from './consonants';
import { HINDI_MATRAS } from './matras';
import { HINDI_WORDS, composeWordStrokes } from './words';

export { HINDI_NUMBERS } from './numbers';
export { HINDI_VOWELS } from './vowels';
export { HINDI_CONSONANTS } from './consonants';
export { HINDI_MATRAS } from './matras';
export { HINDI_WORDS, composeWordStrokes } from './words';

export const HINDI_CHARACTERS: Record<string, CharacterStrokeDefinition> = {
  ...HINDI_NUMBERS,
  ...HINDI_VOWELS,
  ...HINDI_CONSONANTS,
  ...HINDI_MATRAS,
  ...HINDI_WORDS
};

/**
 * Returns a high-precision handwriting stroke definition for a Devanagari (Hindi) character or word.
 */
export function getHindiCharacterDefinition(text: string): CharacterStrokeDefinition | null {
  if (!text) return null;
  const trimmed = text.trim();

  // 1. Exact match in pre-authored registry
  if (HINDI_CHARACTERS[trimmed]) {
    return HINDI_CHARACTERS[trimmed];
  }

  // 2. Single character fallback
  const firstChar = Array.from(trimmed)[0];
  if (HINDI_CHARACTERS[firstChar]) {
    return HINDI_CHARACTERS[firstChar];
  }

  // 3. Multi-character word composition
  if (Array.from(trimmed).length > 1) {
    const chars = Array.from(trimmed);
    const hasKnownHindi = chars.some(c => HINDI_VOWELS[c] || HINDI_CONSONANTS[c]);
    if (hasKnownHindi) {
      return composeWordStrokes(trimmed, chars);
    }
  }

  return null;
}

