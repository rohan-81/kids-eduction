import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { kidTones, kidPalette } from '../../theme/kidTheme';
import { GoldCoinIcon } from '../common/GoldCoinIcon';
import { HeartArt, StarArt } from '../art3d/Art3D';

const useNative = Platform.OS !== 'web';

/** Lives counter ❤️❤️❤️: the heart that is lost pops and fades to grey. */
export const HeartMeter: React.FC<{ lives: number; max?: number; size?: number }> = ({ lives, max = 3, size = 22 }) => {
  const pops = useRef(Array.from({ length: max }, () => new Animated.Value(1))).current;
  const prev = useRef(lives);

  useEffect(() => {
    if (lives < prev.current) {
      for (let i = lives; i < prev.current && i < max; i++) {
        pops[i].setValue(1.6);
        Animated.spring(pops[i], { toValue: 1, friction: 3, tension: 140, useNativeDriver: useNative }).start();
      }
    }
    prev.current = lives;
  }, [lives, max, pops]);

  return (
    <View style={styles.row} accessibilityRole="text" accessibilityLabel={`${lives} of ${max} lives`}>
      {pops.map((scale, i) => (
        <Animated.View key={i} style={[{ transform: [{ scale }] }, i >= lives && styles.lost]}>
          <HeartArt size={Math.round(size * 1.35)} />
        </Animated.View>
      ))}
    </View>
  );
};

/** Level progress meter with a star track. `value` is 0..1. */
export const StarMeter: React.FC<{ value: number; label?: string }> = ({ value, label }) => {
  const width = useRef(new Animated.Value(0)).current;
  const pct = Math.max(0, Math.min(1, value || 0));

  useEffect(() => {
    // width can't use the native driver; this is a tiny layout animation.
    Animated.spring(width, { toValue: pct, friction: 7, tension: 60, useNativeDriver: false }).start();
  }, [pct, width]);

  const filledStars = pct >= 1 ? 3 : pct >= 0.66 ? 2 : pct >= 0.33 ? 1 : 0;

  return (
    <View style={styles.meterWrap}>
      <View style={styles.meterTrack}>
        <Animated.View
          style={[
            styles.meterFill,
            { width: width.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
          ]}
        />
        {label ? <Text style={styles.meterLabel}>{label}</Text> : null}
      </View>
      <View style={styles.row}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={i >= filledStars && styles.lost}>
            <StarArt size={24} />
          </View>
        ))}
      </View>
    </View>
  );
};

/** Floating "+N 🪙" award that rises and fades each time `trigger` changes. */
export const CoinBurst: React.FC<{ amount: number; trigger: number }> = ({ amount, trigger }) => {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!trigger) return;
    t.setValue(0);
    Animated.timing(t, { toValue: 1, duration: 1100, useNativeDriver: useNative }).start();
  }, [trigger, t]);

  if (!trigger) return null;
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [0, -70] });
  const opacity = t.interpolate({ inputRange: [0, 0.15, 0.75, 1], outputRange: [0, 1, 1, 0] });
  const scale = t.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.6, 1.25, 1] });

  return (
    <Animated.View pointerEvents="none" style={[styles.burst, { opacity, transform: [{ translateY }, { scale }] }]}>
      <GoldCoinIcon size={22} />
      <Text style={styles.burstText}>+{amount}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  lost: {
    opacity: 0.3,
  },
  meterWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  meterTrack: {
    flex: 1,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: kidPalette.softBorder,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  meterFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: kidTones.sun.fill,
    borderRadius: 9,
  },
  meterLabel: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: kidPalette.ink,
  },
  meterStar: {
    fontSize: 16,
  },
  burst: {
    position: 'absolute',
    alignSelf: 'center',
    top: '40%',
    backgroundColor: kidTones.sun.fill,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 4,
    borderBottomColor: kidTones.sun.edge,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 50,
  },
  burstText: {
    fontSize: 20,
    fontWeight: '700',
    color: kidTones.sun.onFill,
  },
});
