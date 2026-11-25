import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { kidTones, KidTone } from '../../theme/kidTheme';

interface CornerRibbonProps {
  label: string;
  tone?: KidTone;
}

/**
 * Playful diagonal ribbon for the top-right corner of a card.
 * The parent must have `overflow: 'hidden'` and `position: 'relative'` (the default).
 */
export const CornerRibbon: React.FC<CornerRibbonProps> = ({ label, tone = 'coral' }) => {
  const spec = kidTones[tone];
  return (
    <View pointerEvents="none" style={styles.wrap}>
      <View style={[styles.ribbon, { backgroundColor: spec.fill, borderBottomColor: spec.edge }]}>
        <Text style={[styles.text, { color: spec.onFill }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 96,
    height: 96,
    overflow: 'hidden',
  },
  ribbon: {
    position: 'absolute',
    top: 18,
    right: -34,
    width: 140,
    paddingVertical: 4,
    alignItems: 'center',
    transform: [{ rotate: '45deg' }],
    borderBottomWidth: 3,
  },
  text: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
});
