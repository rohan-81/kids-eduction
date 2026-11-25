import React from 'react';
import { ViewStyle, TextStyle } from 'react-native';
import { ClayButton } from './clay/ClayButton';
import { KidTone } from '../theme/kidTheme';

interface PastelButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'mint' | 'peach' | 'sky';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

const VARIANT_TONE: Record<NonNullable<PastelButtonProps['variant']>, KidTone> = {
  primary: 'sky',
  secondary: 'white',
  mint: 'mint',
  peach: 'coral',
  sky: 'sky',
};

const SIZE: Record<NonNullable<PastelButtonProps['size']>, 'sm' | 'md' | 'lg'> = {
  small: 'sm',
  medium: 'md',
  large: 'lg',
};

/**
 * Legacy button API, rendered with the tactile 3D clay pill from the design system.
 * New code should use ClayButton directly.
 */
export const PastelButton: React.FC<PastelButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  disabled = false,
  loading = false,
  style,
  textStyle,
  testID,
}) => (
  <ClayButton
    title={title}
    onPress={onPress}
    tone={VARIANT_TONE[variant]}
    size={SIZE[size]}
    icon={icon}
    disabled={disabled}
    loading={loading}
    // Callers already play their own tap sounds.
    sound={false}
    style={style}
    textStyle={textStyle}
    testID={testID}
  />
);
