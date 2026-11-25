import { Platform, ViewStyle } from 'react-native';

/**
 * KidsZone "Fun Kingdom" design system.
 *
 * Every accent colour is a "tone": a candy fill, a deeper edge colour used for the
 * 3D bottom lip of buttons/cards, a readable text colour, a colour for text drawn ON
 * the fill, and a pastel tint for bubble-card backgrounds. Screens pick tones instead
 * of hardcoding hex values; tone keys are stable so the palette can evolve.
 *
 * 60-30-10 rule: 60% warm milk-cream canvas (#FDFBF7), 30% white surface cards
 * (#FFFFFF, 2px #E2E8F0 outline, radius 24-30), 10% candy tones:
 *
 *   sky      -> Ocean Sky       #0EA5E9 / #0284C7  tint #E0F2FE  text-on-fill #FFFFFF  (lessons, reading, CTA)
 *   sun      -> Sunshine Gold   #F59E0B / #D97706  tint #FEF3C7  text-on-fill #451A03  (coins, stars, companions)
 *   mint     -> Spring Mint     #10B981 / #059669  tint #D1FAE5  text-on-fill #022C22  (success, nature, math)
 *   lavender -> Fairy Lavender  #8B5CF6 / #7C3AED  tint #EDE9FE  text-on-fill #FFFFFF  (stories, rhymes)
 *   coral    -> Berry Coral     #F43F5E / #E11D48  tint #FFE4E6  text-on-fill #FFFFFF  (games, quests, drawing)
 *
 * Headings use ink #1E293B (never pure black); helper text #64748B at 15px+.
 */
export type KidTone = 'sky' | 'sun' | 'coral' | 'mint' | 'lavender' | 'white';

export interface ToneSpec {
  fill: string;
  edge: string;
  text: string;
  onFill: string;
  tint: string;
  tintBorder: string;
}

/**
 * Approved premium candy tones (keys kept stable from earlier palettes):
 *   cyan  = Magic Ocean Cyan      coral = Sweet Berry Coral
 *   gold  = Sunshine Marigold     mint  = Spring Clover Green
 *   grape = Fairy Tale Lavender
 */
export const candy = {
  coral: '#F43F5E',
  coralDeep: '#E11D48',
  gold: '#F59E0B',
  goldDeep: '#D97706',
  cyan: '#0EA5E9',
  cyanDeep: '#0284C7',
  mint: '#10B981',
  mintDeep: '#059669',
  grape: '#8B5CF6',
  grapeDeep: '#7C3AED',
} as const;

/** Warm, low-strain canvases (cards are pure white on top of these). */
export const kidBackdrops = {
  cream: '#FDFBF7', // warm milk-cream (app canvas)
  sky: '#F0F7FF', // soft cloud sky
  lavender: '#F5F3FF',
  mint: '#F0FDF8',
  peach: '#FFF5F6',
} as const;

export const kidPalette = {
  // Soft pastel accents (decorative bubbles, rings)
  sky: '#38BDF8',
  sun: '#FBBF24',
  coral: '#FB7185',
  mint: '#34D399',
  lavender: '#A78BFA',

  tintSky: '#EFF6FF',
  tintSun: '#FEF3C7',
  tintMint: '#ECFDF5',
  tintLavender: '#FAF5FF',
  tintCoral: '#FFF1F2',

  border: '#E2E8F0',
  /** Delicate card outline (approved: borderWidth 2, #E2E8F0). */
  softBorder: '#E2E8F0',
  ink: '#1E293B',
  inkSoft: '#334155',
  inkMuted: '#64748B',
  inkFaint: '#94A3B8',
  appBg: kidBackdrops.cream,
  surface: '#FFFFFF',
} as const;

export const kidTones: Record<KidTone, ToneSpec> = {
  // onFill must reach WCAG AA (>= 4.5:1) on its fill (guarded by tests/finalHardening.test.ts):
  // - sky, sun, mint keep their bright fills and use deep text (white is unreadable on them:
  //   2.8:1 on #0EA5E9, 2.2:1 on #F59E0B, 2.5:1 on #10B981);
  // - coral and lavender use their one-step-deeper fills so white text stays readable
  //   (white on #F43F5E is only 3.7:1, on #8B5CF6 only 4.2:1).
  sky: { fill: candy.cyan, edge: candy.cyanDeep, text: '#0369A1', onFill: '#082F49', tint: '#E0F2FE', tintBorder: '#BAE6FD' },
  sun: { fill: candy.gold, edge: candy.goldDeep, text: '#B45309', onFill: '#451A03', tint: '#FEF3C7', tintBorder: '#FDE68A' },
  coral: { fill: candy.coralDeep, edge: '#BE123C', text: '#BE123C', onFill: '#FFFFFF', tint: '#FFE4E6', tintBorder: '#FECDD3' },
  mint: { fill: candy.mint, edge: candy.mintDeep, text: '#047857', onFill: '#022C22', tint: '#D1FAE5', tintBorder: '#A7F3D0' },
  lavender: { fill: candy.grapeDeep, edge: '#6D28D9', text: '#6D28D9', onFill: '#FFFFFF', tint: '#EDE9FE', tintBorder: '#DDD6FE' },
  white: { fill: '#FFFFFF', edge: '#CBD5E1', text: '#1E293B', onFill: '#1E293B', tint: '#FFFFFF', tintBorder: '#E2E8F0' },
};

/** Cycles through the accent tones, e.g. for list items without their own colour. */
export const TONE_CYCLE: KidTone[] = ['sky', 'sun', 'mint', 'lavender', 'coral'];
export const toneAt = (index: number): KidTone => TONE_CYCLE[((index % TONE_CYCLE.length) + TONE_CYCLE.length) % TONE_CYCLE.length];

export const kidRadii = {
  frame: 20, // image frames inside grid cards (organic 20-28)
  card: 26, // bubble cards
  pill: 28, // chunky buttons
  full: 9999,
} as const;

/** Chunky touch targets (52-64px). */
export const kidSizes = {
  buttonSm: 52,
  buttonMd: 56,
  buttonLg: 60,
  tabBar: 72,
  gridImage: 72,
  detailImageW: 280,
  detailImageH: 230,
  maxContent: 1200,
  maxColumn: 560,
} as const;

/** Depth of the 3D arcade lip under buttons (compresses when pressed). */
export const CLAY_DEPTH = 6;

/** Soft multi-layer bouncy drop shadow. Web gets true layered box-shadows. */
export function clayShadow(level: 1 | 2 | 3 = 2, color = '#784820'): ViewStyle {
  const native: ViewStyle = {
    shadowColor: color,
    shadowOffset: { width: 0, height: level * 3 + 1 },
    shadowOpacity: 0.08 + level * 0.03,
    shadowRadius: 6 + level * 5,
    elevation: level * 2 + 1,
  };
  if (Platform.OS !== 'web') return native;
  const layers = [
    // Warm (amber-brown) layered clay shadows so cards sit softly on the cream canvas.
    `0 2px 0 rgba(120, 72, 32, 0.05)`,
    `0 ${level * 5}px ${level * 12}px rgba(120, 72, 32, ${0.06 + level * 0.025})`,
    `inset 0 -3px 0 rgba(120, 72, 32, 0.05)`,
  ];
  return { ...native, boxShadow: layers.join(', ') } as ViewStyle;
}

/**
 * Bubble card surface: pure white on the cream canvas by default (approved spec),
 * or a pastel tint for a toned card; 2px #E2E8F0 border + warm layered shadow.
 */
export function claySurface(tone: KidTone | 'plain' = 'plain', level: 1 | 2 | 3 = 2): ViewStyle {
  const spec = tone === 'plain' ? kidTones.white : kidTones[tone];
  return {
    backgroundColor: spec.tint,
    borderRadius: kidRadii.card,
    borderWidth: 2,
    borderColor: kidPalette.softBorder,
    ...clayShadow(level),
  };
}
