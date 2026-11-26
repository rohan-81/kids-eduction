import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
  StyleProp,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { kidTones, kidRadii, kidSizes, CLAY_DEPTH, KidTone } from '../../theme/kidTheme';
import { soundEffects } from '../../services/soundEffects';

export interface ClayButtonProps {
  title?: string;
  onPress: () => void;
  tone?: KidTone;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  /** Render custom content instead of icon + title. */
  children?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  /** Play the bubble-pop tap sound (default true). */
  sound?: boolean;
  style?: StyleProp<ViewStyle>;
  faceStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  testID?: string;
}

const HEIGHTS = { sm: kidSizes.buttonSm, md: kidSizes.buttonMd, lg: kidSizes.buttonLg };
const FONT = { sm: 15, md: 17, lg: 19 };
const useNative = Platform.OS !== 'web';

/**
 * Chunky tactile 3D pill button: a darker "lip" sits under the face; pressing pushes
 * the face down onto the lip with a springy release.
 */
export const ClayButton: React.FC<ClayButtonProps> = ({
  title,
  onPress,
  tone = 'sky',
  size = 'md',
  icon,
  children,
  disabled = false,
  loading = false,
  sound = true,
  style,
  faceStyle,
  textStyle,
  accessibilityLabel,
  testID,
}) => {
  const press = useRef(new Animated.Value(0)).current;
  const lastPressRef = useRef(0);
  const spec = disabled ? { fill: '#E2E8F0', edge: '#CBD5E1', onFill: '#94A3B8' } : kidTones[tone];
  const height = HEIGHTS[size];
  const isWhite = tone === 'white';

  const animateTo = (toValue: number) => {
    if (toValue === 1) {
      Animated.timing(press, { toValue, duration: 70, useNativeDriver: useNative }).start();
    } else {
      Animated.spring(press, { toValue, friction: 4, tension: 160, useNativeDriver: useNative }).start();
    }
  };

  const translateY = press.interpolate({ inputRange: [0, 1], outputRange: [0, CLAY_DEPTH - 1] });
  const scale = press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.98] });

  const handlePress = () => {
    if (disabled || loading) return;
    const now = Date.now();
    if (now - lastPressRef.current < 700) return;
    lastPressRef.current = now;

    if (sound) soundEffects.playBubblePop();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => !disabled && animateTo(1)}
      onPressOut={() => animateTo(0)}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      accessibilityLabel={accessibilityLabel || title}
      testID={testID}
      style={[
        styles.button,
        { height: height + CLAY_DEPTH, minWidth: height },
        Platform.OS === 'web' && ({ cursor: disabled ? 'default' : 'pointer', userSelect: 'none' } as any),
        style,
      ]}
    >
      <View
        style={[styles.lip, { top: CLAY_DEPTH, backgroundColor: spec.edge, borderRadius: kidRadii.pill }]}
      />
      <Animated.View
        style={[
          styles.face,
          {
            height,
            backgroundColor: spec.fill,
            borderRadius: kidRadii.pill,
            borderWidth: isWhite ? 1.5 : 0,
            borderColor: isWhite ? '#E2E8F0' : 'transparent',
            transform: [{ translateY }, { scale }],
          },
          faceStyle,
        ]}
      >
        <View style={styles.contentRow} pointerEvents="none">
          {loading ? (
            <ActivityIndicator color={spec.onFill} />
          ) : children ? (
            children
          ) : (
            <View style={styles.centerRow}>
              {icon ? <View style={title ? styles.iconWithText : undefined}>{icon}</View> : null}
              {title ? (
                <Text
                  style={[styles.text, { color: spec.onFill, fontSize: FONT[size] }, textStyle]}
                  numberOfLines={1}
                >
                  {title}
                </Text>
              ) : null}
            </View>
          )}
        </View>
        {/* Glossy top highlight for the clay look (placed after contentRow so it never offsets in-flow siblings) */}
        {!isWhite && !disabled && <View pointerEvents="none" style={styles.gloss} />}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  lip: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  face: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  contentRow: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gloss: {
    position: 'absolute',
    top: 4,
    left: 14,
    right: 14,
    height: '34%',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.22)',
    zIndex: 1,
  },
  iconWithText: {
    marginRight: 8,
  },
  text: {
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
