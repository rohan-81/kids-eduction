import React, { useRef } from 'react';
import { Animated, Pressable, View, Platform, StyleProp, ViewStyle } from 'react-native';
import { claySurface, KidTone } from '../../theme/kidTheme';
import { soundEffects } from '../../services/soundEffects';
import { webStyle } from '../../utils/webStyle';

export interface ClayCardProps {
  children: React.ReactNode;
  /** Pastel tint tone; 'plain' is a white card. */
  tone?: KidTone | 'plain';
  elevation?: 1 | 2 | 3;
  onPress?: () => void;
  sound?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
}

const useNative = Platform.OS !== 'web';

/** Rounded pastel bubble card (radius 24, border 1.5 #E2E8F0, soft layered shadow). Springs on tap. */
export const ClayCard: React.FC<ClayCardProps> = ({
  children,
  tone = 'plain',
  elevation = 2,
  onPress,
  sound = true,
  style,
  accessibilityLabel,
  testID,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const surface = [claySurface(tone, elevation), { padding: 16 }, style];

  if (!onPress) {
    return (
      <View style={surface} testID={testID}>
        {children}
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => {
        if (sound) soundEffects.playBubblePop();
        onPress();
      }}
      onPressIn={() => Animated.timing(scale, { toValue: 0.96, duration: 80, useNativeDriver: useNative }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 4, tension: 140, useNativeDriver: useNative }).start()}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={webStyle({ cursor: 'pointer' })}
    >
      <Animated.View style={[surface, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
};
