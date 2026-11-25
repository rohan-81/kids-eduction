import { CharacterStrokeDefinition } from '../types';
import { GUJARATI_NUMBERS } from './numbers';
import { GUJARATI_VOWELS } from './vowels';
import { GUJARATI_CONSONANTS } from './consonants';
import { GUJARATI_MATRAS, composeGujaratiBarakhadi } from './matras';

export { GUJARATI_NUMBERS, GUJARATI_VOWELS, GUJARATI_CONSONANTS, GUJARATI_MATRAS, composeGujaratiBarakhadi };

/**
 * Registry of all standalone Gujarati characters.
 */
export const GUJARATI_CHARACTERS: Record<string, CharacterStrokeDefinition> = {
  ...GUJARATI_NUMBERS,
  ...GUJARATI_VOWELS,
  ...GUJARATI_CONSONANTS,
  ...GUJARATI_MATRAS,
};

/**
 * Lookup function for any Gujarati character or compound Barakhadi sequence.
 */
export function getGujaratiCharacterDefinition(text: string): CharacterStrokeDefinition | null {
  const trimmed = text.trim();
  if (GUJARATI_CHARACTERS[trimmed]) {
    return GUJARATI_CHARACTERS[trimmed];
  }
  // Try Barakhadi composite (e.g. 'ખા', 'ખી', 'કુ')
  const barakhadi = composeGujaratiBarakhadi(trimmed);
  if (barakhadi) {
    return barakhadi;
  }
  return null;
}

