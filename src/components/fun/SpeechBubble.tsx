import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, type DimensionValue } from 'react-native';
import { kidTones, kidPalette, kidRadii, clayShadow, KidTone } from '../../theme/kidTheme';

interface SpeechBubbleProps {
  children: React.ReactNode;
  tone?: KidTone | 'plain';
  /** Where the cartoon pointer sits. */
  pointer?: 'top' | 'bottom' | 'none';
  /** Horizontal position of the pointer, 0..1 across the bubble. */
  pointerAt?: number;
  style?: StyleProp<ViewStyle>;
}

const POINTER = 14;

/**
 * Friendly speech-bubble dialogue card with a triangular cartoon pointer.
 * The pointer is drawn with the border-triangle trick so it works on web, iOS and Android.
 */
export const SpeechBubble: React.FC<SpeechBubbleProps> = ({ children, tone = 'plain', pointer = 'top', pointerAt = 0.2, style }) => {
  const bg = tone === 'plain' ? kidPalette.surface : kidTones[tone].tint;
  const outline = tone === 'plain' ? '#E5E7EB' : kidTones[tone].tintBorder;

  const tri = (color: string, size: number, dir: 'up' | 'down') => ({
    width: 0,
    height: 0,
    borderLeftWidth: size,
    borderRightWidth: size,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    ...(dir === 'up' ? { borderBottomWidth: size, borderBottomColor: color } : { borderTopWidth: size, borderTopColor: color }),
  });

  const pointerStyle = { position: 'absolute' as const, left: `${Math.round(pointerAt * 100)}%` as DimensionValue, marginLeft: -POINTER - 2 };

  return (
    <View style={[{ marginTop: pointer === 'top' ? POINTER : 0, marginBottom: pointer === 'bottom' ? POINTER : 0 }, style]}>
      <View style={[styles.bubble, { backgroundColor: bg, borderColor: outline }, clayShadow(2)]}>{children}</View>
      {pointer === 'top' && (
        <>
          <View pointerEvents="none" style={[pointerStyle, { top: -POINTER - 2 }, tri(outline, POINTER + 2, 'up')]} />
          <View pointerEvents="none" style={[pointerStyle, { top: -POINTER + 1, marginLeft: -POINTER }, tri(bg, POINTER, 'up')]} />
        </>
      )}
      {pointer === 'bottom' && (
        <>
          <View pointerEvents="none" style={[pointerStyle, { bottom: -POINTER - 2 }, tri(outline, POINTER + 2, 'down')]} />
          <View pointerEvents="none" style={[pointerStyle, { bottom: -POINTER + 1, marginLeft: -POINTER }, tri(bg, POINTER, 'down')]} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    borderRadius: kidRadii.card,
    borderWidth: 2,
    padding: 18,
  },
});
