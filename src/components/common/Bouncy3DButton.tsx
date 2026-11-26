import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleProp,
  ViewStyle,
  Platform,
} from 'react-native';
import { soundEffects } from '../../services/soundEffects';
import { webStyle } from '../../utils/webStyle';

interface Bouncy3DButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  depth?: number;
  playSound?: boolean;
  accessibilityRole?: 'button';
  accessibilityLabel?: string;
}

export const Bouncy3DButton: React.FC<Bouncy3DButtonProps> = ({
  children,
  onPress,
  style,
  disabled = false,
  depth = 3,
  playSound = true,
  accessibilityRole = 'button',
  accessibilityLabel,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const lastPressRef = useRef(0);

  const handlePressIn = () => {
    if (disabled) return;
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(translateYAnim, {
        toValue: depth,
        duration: 80,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  };

  const handlePress = () => {
    if (disabled) return;
    const now = Date.now();
    if (now - lastPressRef.current < 700) return;
    lastPressRef.current = now;

    if (playSound) {
      soundEffects.playBubblePop();
    }
    onPress();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      style={{
        ...webStyle({ cursor: disabled ? 'default' : 'pointer' }),
      }}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [
              { scale: scaleAnim },
              { translateY: translateYAnim },
            ],
          },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};

