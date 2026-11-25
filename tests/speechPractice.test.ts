import {
  cleanSpeechText,
  computeLevenshtein,
  isSpeechMatch,
} from '../src/utils/speechHelper';

describe('Kids Microphone Practice Speech Verification Tests', () => {
  describe('cleanSpeechText', () => {
    test('Cleans punctuation, whitespace and special characters', () => {
      expect(cleanSpeechText('  "શાહમૃગ"  ')).toBe('શાહમૃગ');
      expect(cleanSpeechText('Ostrich • શાહમૃગ (Bird)')).toBe('ostrich શાહમૃગ bird');
      expect(cleanSpeechText('')).toBe('');
    });
  });

  describe('computeLevenshtein', () => {
    test('Calculates string distance correctly', () => {
      expect(computeLevenshtein('cat', 'cat')).toBe(0);
      expect(computeLevenshtein('cat', 'bat')).toBe(1);
      expect(computeLevenshtein('શાહમૃગ', 'શાહમૃગ')).toBe(0);
    });
  });

  describe('isSpeechMatch - Verified Matching', () => {
    test('Identifies exact matches', () => {
      expect(isSpeechMatch('શાહમૃગ', 'શાહમૃગ').match).toBe(true);
      expect(isSpeechMatch('કાગડો', 'કાગડો').match).toBe(true);
      expect(isSpeechMatch('Ostrich', 'Ostrich').match).toBe(true);
      expect(isSpeechMatch('સિંહ', 'સિંહ').match).toBe(true);
    });

    test('Identifies partial/containment matches when child says word in a phrase', () => {
      expect(isSpeechMatch('શાહમૃગ પક્ષી', 'શાહમૃગ').match).toBe(true);
      expect(isSpeechMatch('આ કાગડો છે', 'કાગડો').match).toBe(true);
      expect(isSpeechMatch('Big Ostrich', 'Ostrich').match).toBe(true);
    });

    test('Strictly REJECTS empty speech (no automatic celebration on silence)', () => {
      expect(isSpeechMatch('', 'શાહમૃગ').match).toBe(false);
      expect(isSpeechMatch('   ', 'કાગડો').match).toBe(false);
    });

    test('Strictly REJECTS completely incorrect spoken words', () => {
      expect(isSpeechMatch('બિલાડી', 'શાહમૃગ').match).toBe(false);
      expect(isSpeechMatch('કૂતરો', 'કાગડો').match).toBe(false);
      expect(isSpeechMatch('tiger', 'lion').match).toBe(false);
      expect(isSpeechMatch('apple', 'banana').match).toBe(false);
    });
  });
});
