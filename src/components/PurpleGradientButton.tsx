import React from 'react';
import { ViewStyle, TextStyle } from 'react-native';
import { ClayButton } from './clay/ClayButton';
import { KidTone } from '../theme/kidTheme';

interface PurpleGradientButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  activeOpacity?: number;
  height?: number;
  borderRadius?: number;
  /** @deprecated colours now come from the design-system tone. */
  startColor?: string;
  /** @deprecated colours now come from the design-system tone. */
  endColor?: string;
  id?: string;
  tone?: KidTone;
}

/**
 * Primary call-to-action used by login, register, onboarding and class selection.
 * Kept under its historical name; renders the tactile 3D clay pill (Sky Blue by default).
 */
export const PurpleGradientButton: React.FC<PurpleGradientButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  height = 58,
  id,
  tone = 'sky',
}) => (
  <ClayButton
    title={title}
    onPress={onPress}
    tone={tone}
    size={height >= 58 ? 'lg' : height >= 54 ? 'md' : 'sm'}
    disabled={disabled}
    sound={false}
    style={[{ width: '100%' }, style]}
    textStyle={textStyle}
    testID={id}
  />
);
