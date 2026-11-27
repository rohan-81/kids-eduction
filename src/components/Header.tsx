import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { spacing, radii } from '../theme/spacing';
import { useApp } from '../context/AppContext';
import { soundEffects } from '../services/soundEffects';
import { audioService } from '../services/audioService';
import { AppIcon } from './AppIcon';
import { formatNumberDigits } from '../utils/languageData';
import type { AppRoute } from '../utils/navigationHelper';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showStars?: boolean;
  backHref?: AppRoute;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = true,
  showStars = true,
  backHref,
  onBack,
}) => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isNarrow = width < 360;
  const { progress, soundEnabled, toggleSound, language } = useApp();

  const handleToggleSound = () => {
    toggleSound();
  };

  const handleBack = () => {
    // Immediately silence any speech or sound on back navigation
    audioService.stop();
    soundEffects.stopAnimalSound();
    soundEffects.stopBgm();

    if (soundEnabled) {
      soundEffects.playBubblePop();
    }
    if (onBack) {
      onBack();
      return;
    }
    if (Platform.OS === 'web') {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
      try {
        if (router.canGoBack()) {
          router.back();
          // Safety timeout: if URL did not change after back attempt, force navigate to backHref or /home
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              const newPath = window.location.pathname + window.location.search;
              if (newPath === currentPath) {
                if (backHref) {
                  router.replace(backHref);
                } else {
                  router.replace('/home');
                }
              }
            }
          }, 150);
          return;
        }
      } catch {}
      if (backHref) {
        router.replace(backHref);
        return;
      }
      router.replace('/home');
      return;
    }

    try {
      if (router.canGoBack()) {
        router.back();
        return;
      }
    } catch {}
    if (backHref) {
      router.replace(backHref);
      return;
    }
    router.replace('/home');
  };

  return (
    <View style={[styles.header, isNarrow && styles.headerNarrow]}>
      <View style={[styles.left, isNarrow && styles.leftNarrow]}>
        {showBack ? (
          <TouchableOpacity
            onPress={handleBack}
            style={[styles.circleBtn, isNarrow && styles.circleBtnNarrow]}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Back"
            accessibilityRole="button"
          >
            <View pointerEvents="none">
              <Svg width={isNarrow ? 18 : 22} height={isNarrow ? 18 : 22} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M19 12H5M12 19L5 12L12 5"
                  stroke="#475569"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.brandContainer}>
            <Text style={[styles.brandTitle, isNarrow && styles.brandTitleNarrow]}>KidsZone</Text>
          </View>
        )}
      </View>

      <View style={[styles.center, isNarrow && styles.centerNarrow]}>
        {title ? (
          <Text style={[styles.title, isNarrow && styles.titleNarrow]} numberOfLines={1} ellipsizeMode="tail">
            {title}
          </Text>
        ) : null}
      </View>

      <View style={[styles.right, isNarrow && styles.rightNarrow]}>
        {showStars ? (
          <TouchableOpacity
            onPress={() => {
              soundEffects.playBubblePop();
              router.push('/rewards');
            }}
            style={[styles.starBadge, isNarrow && styles.starBadgeNarrow]}
            activeOpacity={0.8}
          >
            <AppIcon name="star" size={isNarrow ? 15 : 18} />
            <Text style={[styles.starCount, isNarrow && styles.starCountNarrow]}>
              {formatNumberDigits(progress.stars || 0, language)}
            </Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          onPress={handleToggleSound}
          style={[
            styles.circleBtn,
            isNarrow && styles.circleBtnNarrow,
            soundEnabled ? styles.soundBtnActive : styles.soundBtnMuted,
          ]}
          activeOpacity={0.7}
          accessibilityLabel={soundEnabled ? 'Mute sound' : 'Unmute sound'}
          accessibilityRole="button"
        >
          <AppIcon name={soundEnabled ? 'speaker' : 'speaker_muted'} size={isNarrow ? 18 : 22} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'transparent',
    minHeight: 56,
  },
  headerNarrow: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    minHeight: 50,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 40,
    flexShrink: 0,
  },
  leftNarrow: {
    minWidth: 36,
  },
  center: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  centerNarrow: {
    marginHorizontal: 4,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    flexShrink: 0,
  },
  rightNarrow: {
    gap: 4,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  brandTitleNarrow: {
    fontSize: 17,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.2,
    textAlign: 'center',
    width: '100%',
    overflow: 'hidden',
  },
  titleNarrow: {
    fontSize: 15,
  },
  // Chunky tactile circle (back / sound) with a 3D lip
  circleBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderBottomWidth: 4,
    borderBottomColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBtnNarrow: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  starBadgeNarrow: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    gap: 3,
  },
  starGlyph: {
    fontSize: 14,
    lineHeight: 18,
  },
  starCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#B45309',
  },
  starCountNarrow: {
    fontSize: 12,
  },
  soundBtnActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
  },
  soundBtnMuted: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECDD3',
  },
});
