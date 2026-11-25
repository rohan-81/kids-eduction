/**
 * Pure helpers for content labels that carry an emoji (e.g. quiz options 'Lion 🦁').
 * The original string is never modified: it stays the answer key / speech text.
 */
export const EMOJI_RE =
  /(?:[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{25A0}-\u{25FF}\u{231A}-\u{23FF}](?:\u{FE0F}|\u{200D}[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{25A0}-\u{25FF}])*)/gu;

/** 'Ball ⚽ (Circle)' -> { label: 'Ball (Circle)', emoji: '⚽' }. */
export function splitEmojiLabel(text: string): { label: string; emoji: string | null } {
  const found = text.match(EMOJI_RE);
  const label = text.replace(EMOJI_RE, '').replace(/\s{2,}/g, ' ').replace(/\s+([),.!?])/g, '$1').trim();
  return { label: label || text, emoji: found ? found[0] : null };
}

/** All emoji in a string, in order. */
export const extractEmojis = (text: string): string[] => text.match(EMOJI_RE) ?? [];
