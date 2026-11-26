import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
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
    <View style={styles.header}>
      <View style={styles.left}>
        {showBack ? (
          <TouchableOpacity
            onPress={handleBack}
            style={styles.circleBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Back"
            accessibilityRole="button"
          >
            <View pointerEvents="none">
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
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
            <Text style={styles.brandTitle}>KidsZone</Text>
          </View>
        )}
      </View>

      <View style={styles.center}>
        {title ? (
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {title}
          </Text>
        ) : null}
      </View>

      <View style={styles.right}>
        {showStars ? (
          <TouchableOpacity
            onPress={() => {
              soundEffects.playBubblePop();
              router.push('/rewards');
            }}
            style={styles.starBadge}
            activeOpacity={0.8}
          >
            <AppIcon name="star" size={18} />
            <Text style={styles.starCount}>{formatNumberDigits(progress.stars || 0, language)}</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          onPress={handleToggleSound}
          style={[
            styles.circleBtn,
            soundEnabled ? styles.soundBtnActive : styles.soundBtnMuted,
          ]}
          activeOpacity={0.7}
          accessibilityLabel={soundEnabled ? 'Mute sound' : 'Unmute sound'}
          accessibilityRole="button"
        >
          <AppIcon name={soundEnabled ? 'speaker' : 'speaker_muted'} size={22} />
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
    backgroundColor: '#FFFFFF',
    minHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 40,
    flexShrink: 0,
  },
  center: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    flexShrink: 0,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: -0.2,
    textAlign: 'center',
    width: '100%',
    overflow: 'hidden',
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
  starGlyph: {
    fontSize: 14,
    lineHeight: 18,
  },
  starCount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B45309',
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
