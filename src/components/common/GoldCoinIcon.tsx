import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

export interface GoldCoinIconProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * 3D Shiny Pixar-style Golden Coin
 * Replaces unreliable unicode emoji '🪙' which renders as broken tofu boxes on Windows/Web/Android.
 */
export const GoldCoinIcon: React.FC<GoldCoinIconProps> = ({ size = 24, style }) => {
  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        {/* 3D Bottom Lip / Shadow */}
        <Circle cx="16" cy="18" r="13" fill="#B45309" />
        <Circle cx="16" cy="17" r="13" fill="#D97706" />

        {/* Outer Coin Rim */}
        <Circle cx="16" cy="15.5" r="13" fill="#F59E0B" stroke="#B45309" strokeWidth="1.2" />

        {/* Inner Bevel Ring */}
        <Circle cx="16" cy="15.5" r="10.5" fill="#D97706" />
        <Circle cx="16" cy="15" r="9.5" fill="#FBBF24" />

        {/* Embossed Center Star */}
        <Path
          d="M16 9.5L17.8 13.5L22 13.9L18.8 16.8L19.8 21L16 18.8L12.2 21L13.2 16.8L10 13.9L14.2 13.5Z"
          fill="#FFFBEB"
          stroke="#D97706"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />

        {/* Specular Curved Highlight on Rim */}
        <Path
          d="M8.5 12C10 8.5 13 7 16.5 7"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />

        {/* Sparkle Dot */}
        <Circle cx="9.5" cy="10" r="1.2" fill="#FFFFFF" fillOpacity="0.95" />
      </Svg>
    </View>
  );
};

/**
 * Multi-coin Stack for Rewards / Victory Displays
 * Shows 3 overlapping shiny 3D gold coins
 */
export const GoldCoinStack: React.FC<{ size?: number; style?: StyleProp<ViewStyle> }> = ({ size = 26, style }) => {
  const overlap = size * 0.55;
  return (
    <View style={[styles.stackRow, style]}>
      <GoldCoinIcon size={size} style={{ zIndex: 1 }} />
      <GoldCoinIcon size={size} style={{ marginLeft: -overlap * 0.45, zIndex: 2 }} />
      <GoldCoinIcon size={size} style={{ marginLeft: -overlap * 0.45, zIndex: 3 }} />
    </View>
  );
};

/**
 * A 3D gold coin next to a label ("+20 coins"), laid out as a row so it never relies on
 * emoji fonts and never nests a View inside Text (which breaks lines on web).
 */
export const CoinLabel: React.FC<{
  children: React.ReactNode;
  size?: number;
  iconAfter?: boolean;
  align?: 'start' | 'center';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}> = ({ children, size = 18, iconAfter = false, align = 'start', style, textStyle }) => (
  <View style={[styles.coinLabelRow, align === 'center' && styles.coinLabelCenter, style]}>
    {!iconAfter ? <GoldCoinIcon size={size} /> : null}
    <Text style={textStyle}>{children}</Text>
    {iconAfter ? <GoldCoinIcon size={size} /> : null}
  </View>
);

const styles = StyleSheet.create({
  stackRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coinLabelCenter: {
    alignSelf: 'center',
    justifyContent: 'center',
  },
});
