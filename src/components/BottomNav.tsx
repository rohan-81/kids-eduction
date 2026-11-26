import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, useWindowDimensions, Platform } from 'react-native';
import { useSafeRouter, type AppRoute } from '../utils/navigationHelper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect, Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { soundEffects } from '../services/soundEffects';
import { audioService } from '../services/audioService';
import { useApp } from '../context/AppContext';
import { kidTones, kidPalette, kidSizes, clayShadow, KidTone } from '../theme/kidTheme';
import { webStyle } from '../utils/webStyle';

export type BottomNavTab =
  | 'home'
  | 'learn'
  | 'classes'
  | 'games'
  | 'challenges'
  | 'adventure'
  | 'progress'
  | 'rewards'
  | 'stories'
  | 'profile';

interface BottomNavProps {
  activeTab?: BottomNavTab;
}

const MUTED = kidPalette.inkFaint;
const useNative = Platform.OS !== 'web';

/** Each tab gets its own cheerful palette colour. */
const TAB_TONES: Record<string, KidTone> = {
  home: 'sky',
  learn: 'mint',
  games: 'sun',
  stories: 'coral',
  profile: 'lavender',
};

interface TabButtonProps {
  label: string;
  tone: KidTone;
  active: boolean;
  compact: boolean;
  renderIcon: (active: boolean, color: string) => React.ReactNode;
  onPress: () => void;
}

/** One tactile tab: squashes on press, springs up into a raised clay bubble when active. */
const TabButton: React.FC<TabButtonProps> = ({ label, tone, active, compact, renderIcon, onPress }) => {
  const spec = kidTones[tone];
  const lift = useRef(new Animated.Value(active ? 1 : 0)).current;
  const squash = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(lift, { toValue: active ? 1 : 0, friction: 5, tension: 120, useNativeDriver: useNative }).start();
  }, [active, lift]);

  const translateY = lift.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
  const bubbleScale = lift.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  const iconScale = lift.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const bubbleSize = compact ? 40 : 46;

  return (
    <Pressable
      style={[styles.tabBtn, webStyle({ cursor: 'pointer' })]}
      onPress={onPress}
      onPressIn={() => Animated.timing(squash, { toValue: 0.86, duration: 70, useNativeDriver: useNative }).start()}
      onPressOut={() => Animated.spring(squash, { toValue: 1, friction: 3, tension: 180, useNativeDriver: useNative }).start()}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
    >
      <Animated.View style={{ alignItems: 'center', transform: [{ translateY }, { scale: squash }] }}>
        <View style={{ width: bubbleSize, height: bubbleSize + 4, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.bubble,
              {
                width: bubbleSize,
                height: bubbleSize,
                borderRadius: bubbleSize / 2,
                backgroundColor: spec.tint,
                borderColor: spec.tintBorder,
                borderBottomColor: spec.fill,
                opacity: lift,
                transform: [{ scale: bubbleScale }],
              },
            ]}
          />
          <Animated.View style={{ transform: [{ scale: iconScale }] }}>{renderIcon(active, spec.edge)}</Animated.View>
        </View>
        <Text
          style={[styles.tabLabel, compact && styles.tabLabelCompact, active && { color: spec.text, fontWeight: '900' }]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab = 'home' }) => {
  const router = useSafeRouter();
  const { language } = useApp();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isCompact = width < 380;
  // 5 primary navigation destinations matching Reference 1 (High Contrast & Clear Visibility)
  const navItems = [
    {
      id: 'home',
      label: language === 'gu' ? 'હોમ' : language === 'hi' ? 'होम' : 'Home',
      href: '/home',
      icon: (active: boolean, c: string) => (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path
            d="M3 10.5L12 3L21 10.5V20C21 20.6 20.6 21 20 21H15V14H9V21H4C3.4 21 3 20.6 3 20V10.5Z"
            fill={active ? c : 'none'}
            stroke={active ? c : MUTED}
            strokeWidth={active ? 2.4 : 2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ),
    },
    {
      id: 'learn',
      label: language === 'gu' ? 'શીખો' : language === 'hi' ? 'सीखें' : 'Learn',
      href: '/subjects',
      icon: (active: boolean, c: string) => (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 4L3 8.5L12 13L21 8.5L12 4Z"
            fill={active ? c : 'none'}
            stroke={active ? c : MUTED}
            strokeWidth={active ? 2.4 : 2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M6 10.5V16C6 18 8.7 20 12 20C15.3 20 18 18 18 16V10.5"
            stroke={active ? c : MUTED}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path d="M21 8.5V15" stroke={active ? c : MUTED} strokeWidth={2.2} strokeLinecap="round" />
        </Svg>
      ),
    },
    {
      id: 'games',
      label: language === 'gu' ? 'રમતો' : language === 'hi' ? 'खेल' : 'Games',
      href: '/games',
      icon: (active: boolean, c: string) => (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Rect
            x="3"
            y="6"
            width="18"
            height="13"
            rx="5"
            fill={active ? c : 'none'}
            stroke={active ? c : MUTED}
            strokeWidth={2.2}
          />
          <Path
            d="M7 12.5H11M9 10.5V14.5"
            stroke={active ? '#FFFFFF' : MUTED}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <Circle cx="16" cy="11.5" r="1.3" fill={active ? '#FFFFFF' : MUTED} />
          <Circle cx="18" cy="13.5" r="1.3" fill={active ? '#FFFFFF' : MUTED} />
        </Svg>
      ),
    },
    {
      id: 'stories',
      label: language === 'gu' ? 'વાર્તા' : language === 'hi' ? 'कहानी' : 'Stories',
      href: '/stories',
      icon: (active: boolean, c: string) => (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          {/* Open picture book */}
          <Path
            d="M12 6.5C10 5 7 4.5 3.5 5V18.5C7 18 10 18.5 12 20C14 18.5 17 18 20.5 18.5V5C17 4.5 14 5 12 6.5Z"
            fill={active ? c : 'none'}
            stroke={active ? c : MUTED}
            strokeWidth={2.2}
            strokeLinejoin="round"
          />
          <Path d="M12 6.5V20" stroke={active ? '#FFFFFF' : MUTED} strokeWidth={2} strokeLinecap="round" />
          {/* Gentle page lines to clearly look like an open book */}
          <Path d="M6 9.5H9.5M6 13H9.5M6 16.5H9" stroke={active ? '#FFFFFF' : MUTED} strokeWidth={1.5} strokeLinecap="round" />
          <Path d="M14.5 9.5H18M14.5 13H18M15 16.5H18" stroke={active ? '#FFFFFF' : MUTED} strokeWidth={1.5} strokeLinecap="round" />
        </Svg>
      ),
    },
    {
      id: 'profile',
      label: language === 'gu' ? 'પ્રોફાઇલ' : language === 'hi' ? 'प्रोफ़ाइल' : 'Profile',
      href: '/profile',
      icon: (active: boolean, c: string) => (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Circle
            cx="12"
            cy="8"
            r="4.5"
            fill={active ? c : 'none'}
            stroke={active ? c : MUTED}
            strokeWidth={active ? 2.4 : 2.2}
          />
          <Path
            d="M4 20C4 16.5 7.5 14.5 12 14.5C16.5 14.5 20 16.5 20 20"
            stroke={active ? c : MUTED}
            strokeWidth={2.2}
            strokeLinecap="round"
          />
        </Svg>
      ),
    },
  ] satisfies ReadonlyArray<{ href: AppRoute; [key: string]: unknown }>;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.navOuterWrapper, { paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 14 : 10) }]}
    >
      {/* Seamless ultra-smooth fade shield prevents scrolled cards from leaking without any harsh cut lines */}
      <View
        pointerEvents="none"
        style={[
          styles.navShield,
          { height: 110 + Math.max(insets.bottom, Platform.OS === 'ios' ? 14 : 10) },
        ]}
      >
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
          <Defs>
            <SvgLinearGradient id="bottomNavFadeGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
              <Stop offset="65%" stopColor="#FFFBEB" stopOpacity="0.08" />
              <Stop offset="88%" stopColor="#FEF9C3" stopOpacity="0.22" />
              <Stop offset="100%" stopColor="#FDE68A" stopOpacity="0.32" />
            </SvgLinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#bottomNavFadeGrad)" />
        </Svg>
      </View>
      <View style={[styles.container, isCompact && styles.containerCompact]} accessibilityRole="tablist">
        {navItems.map((item) => {
          const isActive =
            activeTab === item.id ||
            (item.id === 'games' && (activeTab === 'challenges' || activeTab === 'adventure')) ||
            (item.id === 'learn' && activeTab === 'classes') ||
            // Progress & rewards live under the child's Profile (reachable via "My Progress").
            (item.id === 'profile' && (activeTab === 'progress' || activeTab === 'rewards'));

          return (
            <TabButton
              key={item.id}
              label={item.label}
              tone={TAB_TONES[item.id] || 'sky'}
              active={isActive}
              compact={isCompact}
              renderIcon={item.icon}
              onPress={() => {
                audioService.stop();
                soundEffects.stopAnimalSound();
                soundEffects.stopBgm();
                soundEffects.playBubblePop();
                if (activeTab === item.id) return;
                router.replace(item.href);
              }}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navShield: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: -1,
  },
  navOuterWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
    paddingHorizontal: 16,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    paddingHorizontal: 8,
    borderRadius: 30,
    width: '100%',
    maxWidth: 560,
    height: kidSizes.tabBar,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    // Premium floating elevation with subtle kid-friendly soft ambient glow
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  containerCompact: {
    height: 64,
    paddingHorizontal: 4,
    borderRadius: 26,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  bubble: {
    position: 'absolute',
    top: 0,
    borderWidth: 1.5,
    borderBottomWidth: 4,
  },
  tabLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: MUTED,
    marginTop: 1,
  },
  tabLabelCompact: {
    fontSize: 10.5,
  },
});