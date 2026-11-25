import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  useWindowDimensions,
  Platform,
  Easing,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { AppLanguage } from '../../types';
import { soundEffects } from '../../services/soundEffects';
import { audioService } from '../../services/audioService';

interface ConfettiCelebrationProps {
  visible: boolean;
  language?: AppLanguage;
  onComplete?: () => void;
  speakPraise?: boolean;
}

const PARTICLE_COLORS = [
  '#8062F5', // Lavender Purple
  '#F59E0B', // Golden Amber
  '#10B981', // Mint Green
  '#EC4899', // Bright Pink
  '#3B82F6', // Sky Blue
  '#F97316', // Warm Coral
  '#A855F7', // Royal Violet
];

interface ParticleData {
  id: number;
  startX: number;
  color: string;
  shape: 'star' | 'circle' | 'rect' | 'diamond';
  size: number;
  swayDir: number;
  spinDegrees: number;
  anim: Animated.Value;
}

export const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({
  visible,
  language = 'en',
  onComplete,
  speakPraise = true,
}) => {
  const { width, height } = useWindowDimensions();
  const particlesRef = useRef<ParticleData[]>([]);

  if (particlesRef.current.length === 0) {
    const list: ParticleData[] = [];
    const count = 24;
    const shapes: ('star' | 'circle' | 'rect' | 'diamond')[] = ['star', 'circle', 'rect', 'diamond'];
    for (let i = 0; i < count; i++) {
      list.push({
        id: i,
        startX: (i / count) * 100 + ((i % 3) - 1) * 2,
        color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
        shape: shapes[i % shapes.length],
        size: 11 + (i % 6) * 2,
        swayDir: i % 2 === 0 ? 1 : -1,
        spinDegrees: 360 + (i % 4) * 180,
        anim: new Animated.Value(0),
      });
    }
    particlesRef.current = list;
  }

  useEffect(() => {
    if (!visible) return;

    soundEffects.playLevelUp();
    if (speakPraise) {
      audioService.speakCelebration(language);
    }

    const animations = particlesRef.current.map((p, idx) => {
      p.anim.setValue(0);
      const delay = (idx % 6) * 35;
      const duration = 1450 + (idx % 4) * 120;

      return Animated.timing(p.anim, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: Platform.OS !== 'web',
      });
    });

    Animated.parallel(animations).start(() => {
      if (onComplete) onComplete();
    });
  }, [visible, language, onComplete, speakPraise]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particlesRef.current.map((p) => {
        const xPos = (p.startX / 100) * width;
        const translateY = p.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [-25, height + 40],
        });
        const translateX = p.anim.interpolate({
          inputRange: [0, 0.35, 0.7, 1],
          outputRange: [0, p.swayDir * 22, -p.swayDir * 16, p.swayDir * 8],
        });
        const rotate = p.anim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', `${p.spinDegrees}deg`],
        });
        const opacity = p.anim.interpolate({
          inputRange: [0, 0.75, 1],
          outputRange: [1, 1, 0],
        });

        return (
          <Animated.View
            key={p.id}
            style={[
              styles.particleWrap,
              {
                left: xPos,
                opacity,
                transform: [
                  { translateY },
                  { translateX },
                  { rotate },
                ],
              },
            ]}
          >
            {p.shape === 'star' ? (
              <Svg width={p.size} height={p.size} viewBox="0 0 24 24">
                <Path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  fill={p.color}
                />
              </Svg>
            ) : p.shape === 'circle' ? (
              <Svg width={p.size} height={p.size} viewBox="0 0 24 24">
                <Circle cx="12" cy="12" r="10" fill={p.color} />
              </Svg>
            ) : p.shape === 'diamond' ? (
              <Svg width={p.size} height={p.size} viewBox="0 0 24 24">
                <Path d="M12 2L22 12L12 22L2 12Z" fill={p.color} />
              </Svg>
            ) : (
              <Svg width={p.size * 1.4} height={p.size * 0.7} viewBox="0 0 28 14">
                <Rect width="28" height="14" rx="3" fill={p.color} />
              </Svg>
            )}
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  particleWrap: {
    position: 'absolute',
    top: 0,
    zIndex: 9999,
  },
});

