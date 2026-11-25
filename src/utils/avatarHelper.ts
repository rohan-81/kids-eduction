/**
 * Avatar Emoji and Slug mapping helper.
 * Ensures consistent rendering of child avatars whether stored as emojis or slug strings (e.g. 'fox' -> '🦊').
 * Supports ultra-high resolution 3D Pixar-style boy avatar (512x512).
 */
import { AVATAR_3D_BOY, AVATAR_3D_GIRL } from './imageHelper';

export { AVATAR_3D_BOY, AVATAR_3D_GIRL };

const SLUG_TO_EMOJI: Record<string, string> = {
  fox: '🦊',
  lion: '🦁',
  tiger: '🐯',
  rabbit: '🐰',
  bunny: '🐰',
  panda: '🐼',
  chick: '🐥',
  duck: '🐥',
  unicorn: '🦄',
  dolphin: '🐬',
  star: '⭐',
  bear: '🐻',
  monkey: '🐵',
  elephant: '🐘',
  koala: '🐨',
  rocket: '🚀',
};

const EMOJI_TO_SLUG: Record<string, string> = {
  '🦊': 'fox',
  '🦁': 'lion',
  '🐯': 'tiger',
  '🐰': 'rabbit',
  '🐼': 'panda',
  '🐥': 'chick',
  '🦄': 'unicorn',
  '🐬': 'dolphin',
  '⭐': 'star',
  '🐻': 'bear',
  '🐵': 'monkey',
  '🐘': 'elephant',
  '🐨': 'koala',
  '🚀': 'rocket',
};

/**
 * Checks if avatar identifier refers to a 3D high-resolution child avatar.
 */
export function is3DAvatar(avatar?: string | null): boolean {
  if (!avatar || typeof avatar !== 'string') return false;
  const clean = avatar.trim().toLowerCase();
  return (
    clean === 'avatar_3d_boy' ||
    clean === 'avatar_3d_girl' ||
    clean === 'boy' ||
    clean === 'girl' ||
    clean === '3d_boy' ||
    clean === '3d_girl' ||
    clean === '3d' ||
    clean === '3d_hd' ||
    clean === '👦' ||
    clean === '👧' ||
    clean === 'little star' ||
    clean === 'default'
  );
}

/**
 * Normalizes any avatar input (slug, text, or emoji) into a clean, universally supported animal emoji.
 * If input is 'avatar_3d_boy', preserves 'avatar_3d_boy'.
 * If input is 'fox', returns '🦊'.
 */
export function normalizeAvatarEmoji(avatar?: string | null): string {
  if (!avatar || typeof avatar !== 'string') return '🦁';
  if (is3DAvatar(avatar)) return 'avatar_3d_boy';

  const clean = avatar.trim().toLowerCase();

  // 1. Direct slug match
  if (SLUG_TO_EMOJI[clean]) {
    return SLUG_TO_EMOJI[clean];
  }

  // 2. Partial / substring slug match
  for (const [slug, emoji] of Object.entries(SLUG_TO_EMOJI)) {
    if (clean.includes(slug)) {
      return emoji;
    }
  }

  // 3. If it's already an emoji or non-ASCII unicode symbol
  if (/[\uD800-\uDFFF]/.test(avatar) || /[^\x00-\x7F]/.test(avatar)) {
    return avatar.trim();
  }

  // Default fallback
  return '🦁';
}

/**
 * Converts an emoji or identifier to a backend slug (e.g. '🦊' -> 'fox', 'avatar_3d_boy' -> 'avatar_3d_boy').
 */
export function emojiToAvatarSlug(emoji?: string | null): string {
  if (!emoji || typeof emoji !== 'string') return 'avatar_3d_boy';
  const trimmed = emoji.trim();
  if (is3DAvatar(trimmed)) return 'avatar_3d_boy';
  return EMOJI_TO_SLUG[trimmed] || 'lion';
}
