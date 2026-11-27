/**
 * Game content accuracy: picture-matching questions never give the answer away, spoken audio
 * matches what is on screen, and option art is the object the label names.
 */
import { GAME_QUESTIONS } from '../src/data/gamesData';
import { EXTRA_RENDERS_BY_EMOJI } from '../src/utils/extraRenders';
import { splitEmojiLabel } from '../src/utils/emojiLabel';
import type { AppLanguage, GameQuestion } from '../src/types';

const LANGS: AppLanguage[] = ['gu', 'en', 'hi'];
const EMOJI = /\p{Extended_Pictographic}/u;
const correctLabel = (q: GameQuestion) => q.options.find((o) => o.id === q.correctOptionId)?.label ?? '';
const all = (): GameQuestion[] => Object.values(GAME_QUESTIONS).flatMap((byLang) => Object.values(byLang).flat());

describe('picture-matching', () => {
  test.each(LANGS)('%s: accurate, non-spoiling questions with matching audio', (lang) => {
    const qs = GAME_QUESTIONS['picture-matching'][lang];
    expect(qs.length).toBeGreaterThanOrEqual(10);
    for (const q of qs) {
      const answer = correctLabel(q);
      expect(answer).not.toBe('');
      // the spoken prompt is exactly what the child reads
      expect(q.audioText).toBe(q.prompt);
      // a picture is shown, and nothing in the prompt names the answer
      expect(q.displayVisual || q.displayImageSource).toBeTruthy();
      expect(q.prompt).not.toContain(answer);
      // word-only options: an emoji on an option would repeat the picture
      for (const o of q.options) expect(EMOJI.test(o.label)).toBe(false);
      expect(new Set(q.options.map((o) => o.label)).size).toBe(q.options.length);
    }
  });

  test('questions sharing the neutral prompt stay distinct after the merge de-dup', () => {
    for (const lang of LANGS) {
      const keys = GAME_QUESTIONS['picture-matching'][lang].map((q) => `${q.prompt}|${q.displayVisual}|${correctLabel(q)}`);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });
});

describe('audio and visual mismatches', () => {
  test('find-object: the quoted target is the correct option', () => {
    for (const lang of LANGS) {
      for (const q of GAME_QUESTIONS['find-object'][lang]) {
        const target = q.prompt.match(/"([^"]+)"/)?.[1];
        expect(splitEmojiLabel(correctLabel(q)).label).toBe(target);
      }
    }
  });

  test('no game option uses an emoji whose render is a different subject', () => {
    // 📚 renders the grammar singular/plural card, 👓 the Mahatma Gandhi portrait,
    // 🧼 soap (was "eraser"), 🧶 yarn (was "blanket"), 🌀 a cyclone (was "fan").
    expect(EXTRA_RENDERS_BY_EMOJI['📚']).toBeDefined();
    const banned = ['📚', '👓', '🧼', '🧶', '🌀'];
    for (const q of all()) {
      for (const o of q.options) {
        for (const e of banned) expect(`${q.id}: ${o.label}`).not.toContain(e);
      }
    }
  });

  test('find-letter / missing-letter pictures match the word in the prompt', () => {
    const visual = (id: string) => all().find((q) => q.id === id)?.displayVisual;
    expect(visual('fl-gu-6')).toBe('🚢'); // જહાજ
    expect(visual('fl-gu-8')).toBe('🍉'); // તરબૂચ
    expect(visual('fl-hi-2')).toBe('🍍'); // अनानास
    expect(visual('fl-hi-3')).toBe('🐄'); // गाय
    expect(visual('fl-hi-5')).toBe('🚂'); // रेल
    expect(visual('ml-en-4')).toBe('🚌'); // BUS
  });
});
