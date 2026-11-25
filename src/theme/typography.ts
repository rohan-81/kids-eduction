import { TextStyle, Platform } from 'react-native';
import { colors } from './colors';

/**
 * High-quality multilingual font stack:
 * 1. 'Inter' - for crisp, highly legible English/Latin letters, numbers, and symbols.
 * 2. 'Noto Sans Gujarati' - complete character coverage for Gujarati vowels, matras, conjuncts, and numerals.
 * 3. 'Noto Sans Devanagari' - complete character coverage for Hindi/Devanagari vowels, shirorekha, matras, and conjuncts.
 * 4. 'Noto Sans' - universal Google Noto fallback.
 * 5. System UI fallbacks for instant rendering before web fonts hydrate.
 */
export const FONT_STACK = Platform.select({
  web: "'Noto Sans Gujarati', 'Noto Sans Devanagari', 'Inter', 'Noto Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  ios: 'System',
  android: 'Roboto',
  default: 'sans-serif',
});

export const FONT_FAMILY = FONT_STACK;

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const typography: Record<string, TextStyle> = {
  h1: {
    fontFamily: FONT_FAMILY,
    fontSize: 26,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 38, // Generous line height prevents upper/lower Indic matras from clipping
    paddingVertical: 2,
    includeFontPadding: true,
  },
  h2: {
    fontFamily: FONT_FAMILY,
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 30,
    paddingVertical: 2,
    includeFontPadding: true,
  },
  h3: {
    fontFamily: FONT_FAMILY,
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 26,
    paddingVertical: 1,
    includeFontPadding: true,
  },
  body: {
    fontFamily: FONT_FAMILY,
    fontSize: 15,
    fontWeight: '400',
    color: colors.textPrimary,
    lineHeight: 24,
    paddingVertical: 1,
    includeFontPadding: true,
  },
  bodySecondary: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 22,
    paddingVertical: 1,
    includeFontPadding: true,
  },
  caption: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 18,
    paddingVertical: 1,
    includeFontPadding: true,
  },
  letterHuge: {
    fontFamily: FONT_FAMILY,
    fontSize: 64,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 88,
    paddingVertical: 4,
    includeFontPadding: true,
  },
  letterLarge: {
    fontFamily: FONT_FAMILY,
    fontSize: 42,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 60,
    paddingVertical: 4,
    includeFontPadding: true,
  },
  buttonText: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    fontWeight: '500',
    color: colors.white,
    lineHeight: 24,
    paddingVertical: 2,
    letterSpacing: 0, // Never apply letterSpacing to Indic scripts
    includeFontPadding: true,
  },
};

