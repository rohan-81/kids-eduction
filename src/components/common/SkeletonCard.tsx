import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';

interface SkeletonCardProps {
  height?: number;
  width?: number | `${number}%`;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Kid-friendly soft pulsing skeleton placeholder card for heavy lists.
 */
export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  height = 132,
  width = '100%',
  borderRadius = 22,
  style,
}) => {
  const pulse = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.9,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.45,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          height,
          width,
          borderRadius,
          opacity: pulse,
        },
        style,
      ]}
    >
      <View style={styles.avatarPlaceholder} />
      <View style={styles.lineLong} />
      <View style={styles.lineShort} />
    </Animated.View>
  );
};

interface SkeletonGridProps {
  count?: number;
  columns?: 1 | 2;
  cardHeight?: number;
}

export const SkeletonGrid: React.FC<SkeletonGridProps> = ({
  count = 4,
  columns = 2,
  cardHeight = 140,
}) => {
  const items = Array.from({ length: count }, (_, idx) => idx);
  return (
    <View style={columns === 2 ? styles.gridTwo : styles.gridOne}>
      {items.map((idx) => (
        <SkeletonCard
          key={idx}
          height={cardHeight}
          width={columns === 2 ? '48%' : '100%'}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  gridTwo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    width: '100%',
    paddingVertical: 6,
  },
  gridOne: {
    gap: 12,
    width: '100%',
    paddingVertical: 6,
  },
  card: {
    backgroundColor: '#E2E8F0',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#CBD5E1',
  },
  lineLong: {
    width: '72%',
    height: 12,
    borderRadius: 6,
    backgroundColor: '#CBD5E1',
  },
  lineShort: {
    width: '48%',
    height: 10,
    borderRadius: 5,
    backgroundColor: '#CBD5E1',
  },
});

