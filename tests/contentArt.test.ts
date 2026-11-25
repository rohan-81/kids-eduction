import * as fs from 'fs';
import * as path from 'path';
import { splitEmojiLabel, extractEmojis } from '../src/utils/emojiLabel';
import { TEST_QUESTIONS } from '../src/data/challengeData';

const read = (p: string) => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');

/** Emoji keys that have 3D art in CONTENT_ART (parsed from source, so no RN/SVG runtime needed). */
const contentArtKeys = (() => {
  const src = read('src/components/art3d/ContentArt.tsx');
  const block = src.slice(src.indexOf('export const CONTENT_ART'), src.indexOf('};', src.indexOf('export const CONTENT_ART')));
  return new Set(Array.from(block.matchAll(/'([^']+)':/g)).map((m) => m[1]));
})();

describe('Quiz content emojis render as 3D art without breaking answers', () => {
  test('splitEmojiLabel strips emoji for display only', () => {
    expect(splitEmojiLabel('Lion 🦁')).toEqual({ label: 'Lion', emoji: '🦁' });
    expect(splitEmojiLabel('Ball ⚽ (Circle)')).toEqual({ label: 'Ball (Circle)', emoji: '⚽' });
    expect(splitEmojiLabel('Apple 🍎 (સફરજન)')).toEqual({ label: 'Apple (સફરજન)', emoji: '🍎' });
    expect(splitEmojiLabel('4 (Four)')).toEqual({ label: '4 (Four)', emoji: null });
    expect(splitEmojiLabel('Crow 🐦‍⬛').emoji).toBe('🐦‍⬛');
  });

  test('challenge answer keys keep their emoji, so === answer checking is unchanged', () => {
    for (const q of TEST_QUESTIONS) {
      expect(q.optionsEn).toContain(q.correctAnswerEn);
      expect(q.optionsGu).toContain(q.correctAnswerGu);
      expect(q.optionsHi).toContain(q.correctAnswerHi);
    }
    const challenge = read('app/challenge.tsx');
    expect(challenge).toContain('const isCorrect = opt === currentCorrectAnswer;');
    expect(challenge).toContain('onPress={() => handleSelectOption(opt)}');
  });

  test('duel answers are still decided by isCorrect, not by label text', () => {
    const duel = read('app/games/duel.tsx');
    expect(duel).toContain('onPress={() => handleAnswer(opt.isCorrect)}');
    expect(duel).toContain('splitEmojiLabel(getOptionLabel(opt))');
  });

  test('every emoji in duel and challenge options has 3D art', () => {
    const duelOptions = Array.from(read('app/games/duel.tsx').matchAll(/text(?:Gu|Hi|En): '([^']*)'/g)).map((m) => m[1]);
    const challengeOptions = TEST_QUESTIONS.flatMap((q) => [...q.optionsEn, ...q.optionsGu, ...q.optionsHi]);
    const missing = new Set<string>();
    for (const opt of [...duelOptions, ...challengeOptions]) {
      for (const e of extractEmojis(opt)) if (!contentArtKeys.has(e)) missing.add(e);
    }
    expect(Array.from(missing)).toEqual([]);
  });

  test('stories screen has no raw UI emojis left', () => {
    const stories = read('app/stories.tsx');
    for (const e of ['🏆', '🎉', '🔄', '📚', '⏹️', '🔊', '👉', '🤔', '🧙‍♂️', '🚀', '💰']) {
      expect(stories).not.toContain(e);
    }
  });

  test('geometric shapes and furniture emojis are parsed and have 3D art', () => {
    expect(splitEmojiLabel('चौकोर ⬛')).toEqual({ label: 'चौकोर', emoji: '⬛' });
    expect(splitEmojiLabel('षट्कोण ⬡')).toEqual({ label: 'षट्कोण', emoji: '⬡' });
    expect(splitEmojiLabel('અંડાકાર ⬭')).toEqual({ label: 'અંડાકાર', emoji: '⬭' });
    expect(splitEmojiLabel('आयत ▬')).toEqual({ label: 'आयत', emoji: '▬' });
    expect(splitEmojiLabel('कुर्सी 🪑')).toEqual({ label: 'कुर्सी', emoji: '🪑' });
    expect(splitEmojiLabel('बिस्तर (पलंग) 🛏️')).toEqual({ label: 'बिस्तर (पलंग)', emoji: '🛏️' });

    for (const symbol of ['⬛', '⬡', '⬭', '▬', '🪑', '🛏️', '🥕']) {
      expect(contentArtKeys.has(symbol)).toBe(true);
    }
  });

  test('BottomNav includes backdrop shield to prevent scrolled content leaking underneath', () => {
    const bottomNav = read('src/components/BottomNav.tsx');
    expect(bottomNav).toContain('styles.navShield');
    expect(bottomNav).toContain('#FDE68A');
  });
});
