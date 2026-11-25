import { CharacterStrokeDefinition } from '../types';
import { ENGLISH_NUMBERS } from './numbers';
import { ENGLISH_LETTERS } from './letters';

export { ENGLISH_NUMBERS, ENGLISH_LETTERS };

/**
 * Registry of all standalone English characters (numbers 0-9, 10, and letters A-Z).
 */
export const ENGLISH_CHARACTERS: Record<string, CharacterStrokeDefinition> = {
  ...ENGLISH_NUMBERS,
  ...ENGLISH_LETTERS,
};

/**
 * Returns a high-precision handwriting stroke definition for an English numeral or letter.
 */
export function getEnglishCharacterDefinition(text: string): CharacterStrokeDefinition | null {
  if (!text) return null;
  const trimmed = text.trim();

  // 1. Exact match (digits 0-9, 10, or uppercase letters A-Z)
  if (ENGLISH_CHARACTERS[trimmed]) {
    return ENGLISH_CHARACTERS[trimmed];
  }

  // 2. Case-insensitive letter match
  const upper = trimmed.toUpperCase();
  if (ENGLISH_CHARACTERS[upper]) {
    return ENGLISH_CHARACTERS[upper];
  }

  return null;
}

