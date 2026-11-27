import React from 'react';
import {
  Platform,
  ScrollView,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { webStyle } from '../../utils/webStyle';

export interface HorizontalScrollRowProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  nestedScrollEnabled?: boolean;
  directionalLockEnabled?: boolean;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  showsHorizontalScrollIndicator?: boolean;
  scrollEventThrottle?: number;
}

/**
 * Horizontal scrollable row: on web renders a CSS `overflowX: 'auto'` View to avoid
 * React Native Web's nested ScrollView responder-rejection warning, while on native it
 * renders a horizontal `<ScrollView>` with `nestedScrollEnabled` support.
 */
export const HorizontalScrollRow: React.FC<HorizontalScrollRowProps> = ({
  children,
  style,
  contentContainerStyle,
  nestedScrollEnabled = true,
  directionalLockEnabled = true,
  keyboardShouldPersistTaps = 'handled',
  showsHorizontalScrollIndicator = false,
  scrollEventThrottle,
}) => {
  if (Platform.OS === 'web') {
    return (
      <View
        style={[
          style,
          contentContainerStyle,
          webStyle({ overflowX: 'auto', overflowY: 'hidden' }),
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      style={style}
      contentContainerStyle={contentContainerStyle}
      nestedScrollEnabled={nestedScrollEnabled}
      directionalLockEnabled={directionalLockEnabled}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      scrollEventThrottle={scrollEventThrottle}
    >
      {children}
    </ScrollView>
  );
};

