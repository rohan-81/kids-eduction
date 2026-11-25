import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

export interface AppGlobalBackgroundProps {
  id?: string;
}

const BG_COLORS = {
  top: '#E0F2FE',       // Sky tint
  mid: '#FFFDF5',       // Soft sunlight cream
  warmSun: '#FEF9C3',   // Warm sunlight
  sunshine: '#FDE68A',  // Sunny pastel yellow
};

/**
 * Universal kids app background:
 * - 0%: Soft Sky Tint (#E0F2FE)
 * - 40%: Soft Sunlight Cream (#FFFDF5)
 * - 75%: Warm Sunlight (#FEF9C3)
 * - 100%: Warm Sunshine Yellow (#FDE68A)
 *
 * Web: Uses fixed CSS linear-gradient for instant rendering on page refresh (no SVG ID caching issues)
 * Native: Uses SVG linear-gradient for crisp native vector rendering
 */
export const AppGlobalBackground: React.FC<AppGlobalBackgroundProps> = ({ id = 'appGlobalBgGrad' }) => {
  if (Platform.OS === 'web') {
    return (
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            // @ts-ignore - Web CSS linear-gradient background
            backgroundImage: `linear-gradient(180deg, ${BG_COLORS.top} 0%, ${BG_COLORS.mid} 40%, ${BG_COLORS.warmSun} 75%, ${BG_COLORS.sunshine} 100%)`,
            backgroundAttachment: 'fixed',
            zIndex: -1,
          },
        ]}
      />
    );
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={BG_COLORS.top} stopOpacity="1" />
            <Stop offset="40%" stopColor={BG_COLORS.mid} stopOpacity="1" />
            <Stop offset="75%" stopColor={BG_COLORS.warmSun} stopOpacity="1" />
            <Stop offset="100%" stopColor={BG_COLORS.sunshine} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
};

