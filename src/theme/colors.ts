/**
 * Legacy colour tokens, aligned to the unified KidsZone "60-30-10" palette
 * (see src/theme/kidTheme.ts for the full tone system):
 *   60% warm milk-cream canvas  #FDFBF7
 *   30% white surface cards     #FFFFFF with #E2E8F0 outlines
 *   10% candy tones             Ocean Sky / Sunshine Gold / Spring Mint / Fairy Lavender / Berry Coral
 */
export const colors = {
  background: '#FDFBF7',
  card: '#FFFFFF',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  // pastel card tints of the candy tones
  mint: '#D1FAE5',
  skyBlue: '#E0F2FE',
  peach: '#FFE4E6',
  lavender: '#EDE9FE',
  yellow: '#FEF3C7',
  accent: '#059669',
  border: '#E2E8F0',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#F43F5E',
  white: '#FFFFFF',
  overlay: 'rgba(15, 23, 42, 0.65)',
  primaryPurple: '#8B5CF6',
  primaryBlue: '#0EA5E9',
  bannerYellow: '#F59E0B',
  slateDark: '#1E293B',
  slateMuted: '#64748B',
  appBg: '#FDFBF7',
} as const;

/** The 5 candy tones: fill, 3D lip edge, card tint and text drawn on the fill. */
export const candyTones = {
  // onFill reaches WCAG AA (>= 4.5:1) on every fill; kept in sync with kidTones (src/theme/kidTheme.ts)
  sky: { fill: '#0EA5E9', edge: '#0284C7', tint: '#E0F2FE', onFill: '#082F49' }, // lessons, reading, primary CTA
  sun: { fill: '#F59E0B', edge: '#D97706', tint: '#FEF3C7', onFill: '#451A03' }, // coins, stars, streaks, companions
  mint: { fill: '#10B981', edge: '#059669', tint: '#D1FAE5', onFill: '#022C22' }, // success, nature, math, health
  lavender: { fill: '#7C3AED', edge: '#6D28D9', tint: '#EDE9FE', onFill: '#FFFFFF' }, // stories, rhymes, imagination
  coral: { fill: '#E11D48', edge: '#BE123C', tint: '#FFE4E6', onFill: '#FFFFFF' }, // games, quests, drawing
} as const;

export type ColorName = keyof typeof colors;
