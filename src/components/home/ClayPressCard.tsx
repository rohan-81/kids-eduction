import React, { useRef } from 'react';
import { Animated, Platform, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { soundEffects } from '../../services/soundEffects';

const useNative = Platform.OS !== 'web';
export const CLAY_CARD_LIP = 10;

export interface ClayCardColors {
  fill: string;
  border: string;
  lip: string;
}

interface ClayPressCardProps {
  colors: ClayCardColors;
  onPress: () => void;
  accessibilityLabel: string;
  /** Sound on tap (default: bubble pop). */
  sound?: 'pop' | 'levelUp';
  /** Lip height in px (default 5). */
  lip?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  faceStyle?: StyleProp<ViewStyle>;
  /** Painted behind the content inside the face (e.g. an SVG gradient). */
  background?: React.ReactNode;
  /** Content, or a render function receiving the press progress (0 -> 1) for extra spring effects. */
  children: React.ReactNode | ((press: Animated.Value) => React.ReactNode);
}

/**
 * Soft rubber 3D card: a darker lip sits under the face; pressing pushes the face
 * down onto the lip and it springs back up on release.
 */
export const ClayPressCard: React.FC<ClayPressCardProps> = ({
  colors,
  onPress,
  accessibilityLabel,
  sound = 'pop',
  lip = CLAY_CARD_LIP,
  radius = 24,
  style,
  faceStyle,
  background,
  children,
}) => {
  const press = useRef(new Animated.Value(0)).current;
  const lastPressRef = useRef(0);
  const translateY = press.interpolate({ inputRange: [0, 1], outputRange: [0, Math.max(3, lip - 3)] });
  const scale = press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.985] });

  const handlePress = () => {
    const now = Date.now();
    if (now - lastPressRef.current < 700) return;
    lastPressRef.current = now;

    if (sound === 'levelUp') soundEffects.playLevelUp();
    else soundEffects.playBubblePop();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => Animated.timing(press, { toValue: 1, duration: 70, useNativeDriver: useNative }).start()}
      onPressOut={() => Animated.spring(press, { toValue: 0, friction: 4, tension: 170, useNativeDriver: useNative }).start()}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[{ paddingBottom: lip }, Platform.OS === 'web' && ({ cursor: 'pointer', userSelect: 'none' } as any), style]}
    >
      <View style={[styles.lip, { top: lip, borderRadius: radius, backgroundColor: colors.lip, borderColor: colors.lip }]} />
      <Animated.View
        style={[
          styles.face,
          { borderRadius: radius, backgroundColor: colors.fill, borderColor: colors.border, transform: [{ translateY }, { scale }] },
          Platform.OS === 'web' && ({ boxShadow: '0 6px 16px rgba(120, 72, 32, 0.08)' } as any),
          faceStyle,
        ]}
      >
        {background ? (
          <View pointerEvents="none" style={[styles.background, { borderRadius: radius }]}>
            {background}
          </View>
        ) : null}
        {typeof children === 'function' ? children(press) : children}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  lip: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
  },
  face: {
    flex: 1,
    borderWidth: 2,
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
});
