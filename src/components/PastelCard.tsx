import React from 'react';
import { ViewStyle } from 'react-native';
import { ClayCard } from './clay/ClayCard';
import { kidPalette } from '../theme/kidTheme';

interface PastelCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  onPress?: () => void;
  activeOpacity?: number;
  testID?: string;
}

/** Legacy card API, rendered as a clay bubble card. New code should use ClayCard directly. */
export const PastelCard: React.FC<PastelCardProps> = ({
  children,
  style,
  backgroundColor = kidPalette.surface,
  onPress,
  testID,
}) => (
  <ClayCard onPress={onPress} sound={false} style={[{ backgroundColor }, style]} testID={testID}>
    {children}
  </ClayCard>
);
