import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle, Path } from 'react-native-svg';
import { PurpleGradientButton } from '../src/components/PurpleGradientButton';
import { soundEffects } from '../src/services/soundEffects';
import { useApp } from '../src/context/AppContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const { language, setLanguage, t, hasCompletedOnboarding, isAuthenticated, isGuest } = useApp();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const jumpFloatAnim = useRef(new Animated.Value(0)).current;
  const pulseLollipopAnim = useRef(new Animated.Value(1)).current;

  // 3-step pagination state (defaults to step 0 matching reference)
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (hasCompletedOnboarding || isAuthenticated || isGuest) {
      router.replace('/home');
      return;
    }

    // Screen entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 7,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle playful jumping levitation
    Animated.loop(
      Animated.sequence([
        Animated.timing(jumpFloatAnim, {
          toValue: -12,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(jumpFloatAnim, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Soft candy sparkle pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseLollipopAnim, {
          toValue: 1.08,
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.timing(pulseLollipopAnim, {
          toValue: 1,
          duration: 1100,
          useNativeDriver: true,
        }),
      ])
    ).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNext = () => {
    soundEffects.playBubblePop();
    // Navigate smoothly to Choose Your Class screen (Screen 3)
    router.push('/classes');
  };

  const handleParentLogin = () => {
    soundEffects.playBubblePop();
    router.push('/login');
  };

  const cycleLanguage = () => {
    soundEffects.playBubblePop();
    const next = language === 'gu' ? 'en' : language === 'en' ? 'hi' : 'gu';
    setLanguage(next);
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
      {/* Seamless full-screen illustration background */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Image
          source={require('../assets/images/onboard_boy_jump.webp')}
          style={styles.fullBgImage}
          resizeMode="cover"
        />
        {/* Soft subtle top/bottom scrims to ensure text & buttons are perfectly readable and blend into the clouds */}
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="onboardTopScrim" x1="0" y1="0" x2="0" y2="0.3">
              <Stop offset="0%" stopColor="#FFF8F0" stopOpacity="0.85" />
              <Stop offset="60%" stopColor="#FFF8F0" stopOpacity="0.3" />
              <Stop offset="100%" stopColor="#FFF8F0" stopOpacity="0" />
            </LinearGradient>
            <LinearGradient id="onboardBottomScrim" x1="0" y1="0.75" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFEFE6" stopOpacity="0" />
              <Stop offset="45%" stopColor="#FFEFE6" stopOpacity="0.6" />
              <Stop offset="100%" stopColor="#FFEFE6" stopOpacity="0.95" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#onboardTopScrim)" />
          <Rect width="100%" height="100%" fill="url(#onboardBottomScrim)" />
        </Svg>
      </View>

      <Animated.View
        style={[
          styles.mainContent,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Top Header: Title & Subtitle */}
        <View style={styles.headerSection}>
          {/* Subtle language switch badge for multilingual support */}
          <View style={styles.topUtilityRow}>
            <TouchableOpacity
              onPress={cycleLanguage}
              style={styles.langPill}
              activeOpacity={0.7}
              accessibilityLabel="Switch Language"
            >
              <Text style={styles.langPillText}>
                {language === 'gu' ? 'ગુજરાતી' : language === 'hi' ? 'हिन्दी' : 'EN'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>
            {language === 'gu'
              ? 'તેજસ્વી અને\nહોશિયાર તમે!'
              : language === 'hi'
                ? 'उज्ज्वल और\nहोशियार आप!'
                : 'A Brighter\nSmarter You!'}
          </Text>
          <Text style={styles.subtitle}>
            {language === 'gu'
              ? 'હોશિયાર આવતીકાલ માટે મજાનું શિક્ષણ'
              : language === 'hi'
                ? 'होशियार कल के लिए मज़ेदार पढ़ाई'
                : 'Fun learning for a smarter tomorrow'}
          </Text>
        </View>

        {/* Flexible center space - the 3D jumping boy is seamlessly integrated into the full-bleed artwork! */}
        <View style={styles.centerSpace} />

        {/* Bottom Section: Pagination Dots + Purple Gradient Next Button + Parent Sign In Link */}
        <View style={styles.bottomSection}>
          {/* 3 Pagination Dots */}
          <View style={styles.paginationDotsRow}>
            <View style={[styles.dot, activeStep === 0 ? styles.dotActive : styles.dotInactive]} />
            <View style={[styles.dot, activeStep === 1 ? styles.dotActive : styles.dotInactive]} />
            <View style={[styles.dot, activeStep === 2 ? styles.dotActive : styles.dotInactive]} />
          </View>

          {/* Rounded Purple Gradient Next Button */}
          <PurpleGradientButton
            title={language === 'gu' ? 'આગળ' : language === 'hi' ? 'आगे' : 'Next'}
            onPress={handleNext}
            height={56}
            borderRadius={28}
            id="onboarding-next-btn"
          />

          {/* Parent Sign In / Register Link */}
          <TouchableOpacity
            style={styles.parentSignInBtn}
            onPress={handleParentLogin}
            activeOpacity={0.7}
          >
            <Text style={styles.parentSignInText}>
              {language === 'gu'
                ? 'વાલી એકાઉન્ટ છે? લૉગ ઇન કરો'
                : language === 'hi'
                ? 'अभिभावक खाता है? लॉगिन करें'
                : 'Have a Parent Account? Sign In'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  mainContent: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 20,
  },
  headerSection: {
    alignItems: 'center',
    width: '100%',
  },
  topUtilityRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  langPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.6)',
  },
  langPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4338CA',
  },
  title: {
    fontSize: 29,
    fontWeight: '700',
    color: '#1E1B4B',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 35,
    marginBottom: 6,
    textShadowColor: 'rgba(255, 255, 255, 0.95)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
    letterSpacing: 0.1,
    textShadowColor: 'rgba(255, 255, 255, 0.95)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  fullBgImage: {
    width: '100%',
    height: '104%',
    top: 24,
    position: 'absolute',
  },
  centerSpace: {
    flex: 1,
    width: '100%',
    position: 'relative',
    minHeight: 180,
  },
  floatingDecor: {
    position: 'absolute',
    zIndex: 2,
  },
  flowerTopLeft: {
    top: 15,
    left: 20,
  },
  sparkleRight: {
    top: '25%',
    right: 18,
  },
  flowerBottomRight: {
    bottom: 25,
    right: 22,
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 8,
  },
  paginationDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 22,
    backgroundColor: '#7C3AED', // Active purple pill
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#D8B4FE', // Inactive soft lavender
  },
  parentSignInBtn: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  parentSignInText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6D28D9',
  },
});
