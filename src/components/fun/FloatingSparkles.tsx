import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, View, type DimensionValue } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const STAR = 'M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z';
const SPARK = 'M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z';
const NOTE = 'M9 18.5A3 3 0 1 1 9 12.5V4L19 2V15.5A3 3 0 1 1 17 12.7V6.2L11 7.4V18.5Z';
/** Shape + colour for each decorative token (legacy emoji keys stay accepted). */
const SHAPES: Record<string, { d: string; color: string; edge: string }> = {
  '⭐': { d: STAR, color: '#FBBF24', edge: '#D97706' },
  '🌟': { d: STAR, color: '#FDE047', edge: '#EAB308' },
  '✨': { d: SPARK, color: '#FCD34D', edge: '#F59E0B' },
  '🎵': { d: NOTE, color: '#A78BFA', edge: '#7C3AED' },
  '🎶': { d: NOTE, color: '#F472B6', edge: '#DB2777' },
};

const useNative = Platform.OS !== 'web';

interface FloatingSparklesProps {
  emojis?: string[];
  count?: number;
  /** Changes the deterministic layout so neighbouring sections don't look identical. */
  seed?: number;
  size?: number;
  opacity?: number;
}

/** Pseudo-random but stable positions (no Math.random so layout never jumps between renders). */
function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

const Sparkle: React.FC<{ emoji: string; top: DimensionValue; left: DimensionValue; delay: number; size: number; opacity: number }> = ({
  emoji,
  top,
  left,
  delay,
  size,
  opacity,
}) => {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(t, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: useNative }),
        Animated.timing(t, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: useNative }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [t, delay]);

  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const scale = t.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.12] });
  const rotate = t.interpolate({ inputRange: [0, 1], outputRange: ['-10deg', '10deg'] });

  // Crisp SVG shapes instead of system emoji (the `emoji` value only picks the shape/colour).
  const shape = SHAPES[emoji] ?? SHAPES['✨'];
  return (
    <Animated.View
      style={[
        styles.sparkle,
        { top, left, opacity, transform: [{ translateY }, { scale }, { rotate }] },
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d={shape.d} fill={shape.color} stroke={shape.edge} strokeWidth={1} strokeLinejoin="round" />
      </Svg>
    </Animated.View>
  );
};

/** Decorative floating stars / sparkles. Purely visual: never intercepts touches. */
export const FloatingSparkles: React.FC<FloatingSparklesProps> = ({
  emojis = ['⭐', '✨', '🌟'],
  count = 6,
  seed = 1,
  size = 18,
  opacity = 0.7,
}) => {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        emoji: emojis[i % emojis.length],
        top: `${Math.round(4 + rand(seed + i * 3) * 82)}%`,
        left: `${Math.round(3 + rand(seed + i * 7 + 1) * 88)}%`,
        delay: Math.round(rand(seed + i * 11) * 1200),
        size: Math.round(size * (0.75 + rand(seed + i * 5) * 0.6)),
      })),
    [count, emojis, seed, size]
  );

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {items.map((it, i) => (
        <Sparkle key={i} {...it} opacity={opacity} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  sparkle: {
    position: 'absolute',
  },
});
