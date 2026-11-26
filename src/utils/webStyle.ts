import { Platform, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';

/**
 * CSS properties that react-native-web understands but React Native's style types either do not
 * declare (`outlineStyle`, `objectPosition`, `transition`) or declare more narrowly than the web
 * allows (`cursor` is only 'auto' | 'pointer' natively).
 */
export interface WebOnlyStyle {
  cursor?: 'auto' | 'default' | 'pointer' | 'text' | 'not-allowed' | 'grab' | 'grabbing';
  userSelect?: 'auto' | 'none' | 'text' | 'all' | 'contain';
  boxShadow?: string;
  outlineStyle?: 'none' | 'solid' | 'dashed' | 'dotted';
  objectPosition?: string;
  transition?: string;
  backgroundImage?: string;
  backgroundAttachment?: 'fixed' | 'scroll' | 'local';
  touchAction?: 'none' | 'auto' | 'pan-x' | 'pan-y' | 'manipulation';
}

type AnyStyle = ViewStyle | TextStyle | ImageStyle;

/**
 * DOM attributes for react-native-web (e.g. hooks for print CSS: `[data-print="hide"]`).
 * React Native's View props do not declare `data-*` attributes, so they are passed through this
 * typed helper (spread onto a View) and omitted entirely on native.
 */
export function webDomProps(attrs: { id?: string; [dataAttr: `data-${string}`]: string }): Record<string, string> {
  return Platform.OS === 'web' ? (attrs as Record<string, string>) : {};
}

/**
 * Returns `style` on web and `undefined` on native, typed as an ordinary RN style so it can be
 * used in style arrays, spreads and `Platform.select({ web: ... })` without `as any`.
 *
 *   style={[styles.card, webStyle({ cursor: 'pointer' })]}
 *   ...webStyle({ outlineStyle: 'none' })
 *
 * This is the single, intentional boundary between RN's style types and react-native-web's
 * wider CSS support.
 */
export function webStyle<S extends AnyStyle = ViewStyle>(style: WebOnlyStyle): S | undefined {
  return Platform.OS === 'web' ? (style as unknown as S) : undefined;
}

/**
 * On react-native-web a View ref is the underlying DOM element. Returns it when it can be
 * measured (`getBoundingClientRect`), otherwise null (native, or not yet mounted).
 */
export function webDomNode(ref: unknown): HTMLElement | null {
  if (Platform.OS !== 'web' || !ref || typeof ref !== 'object') return null;
  return typeof (ref as Partial<HTMLElement>).getBoundingClientRect === 'function' ? (ref as HTMLElement) : null;
}

/** Client coordinates carried by react-native-web touch/mouse events (absent on native). */
export interface WebClientPoint {
  clientX?: number;
  clientY?: number;
  touches?: ArrayLike<{ clientX: number; clientY: number }>;
}
