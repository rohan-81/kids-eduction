import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Stop, Rect, Path } from 'react-native-svg';
import { useApp } from '../src/context/AppContext';
import { contentPackService } from '../src/services/contentPackService';
import { checkInternetAvailable } from '../src/utils/networkCheck';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const { isLoading, isAuthenticated, isGuest, language } = useApp();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const starPulseAnim = useRef(new Animated.Value(1)).current;
  const progressBarAnim = useRef(new Animated.Value(0)).current;

  const hasNavigated = useRef(false);
  const bootCheckRef = useRef<Promise<{ packInstalled: boolean; online: boolean }> | null>(null);

  useEffect(() => {
    if (!bootCheckRef.current) {
      bootCheckRef.current = Promise.all([
        contentPackService.init().catch(() => false),
        checkInternetAvailable(2800).catch(() => false),
      ]).then(([packInstalled, online]) => ({ packInstalled, online }));
    }
  }, []);

  const navigateToOnboarding = async () => {
    if (isLoading || hasNavigated.current) return;
    hasNavigated.current = true;

    const boot = await (bootCheckRef.current || Promise.resolve({ packInstalled: true, online: true }));

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (Platform.OS !== 'web' && !boot.packInstalled) {
        router.replace('/setup');
      } else if (isAuthenticated || isGuest) {
        router.replace('/home');
      } else if (boot.online) {
        router.replace('/login');
      } else {
        router.replace('/offline-warning');
      }
    });
  };

  const mountTimeRef = useRef(Date.now());

  // Visual entrance & idle floating loops (mount only)
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    );
    floatLoop.start();

    const starLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(starPulseAnim, {
          toValue: 1.15,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(starPulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    starLoop.start();

    const progressLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(progressBarAnim, {
          toValue: 1,
          duration: 950,
          useNativeDriver: true,
        }),
        Animated.timing(progressBarAnim, {
          toValue: 0,
          duration: 950,
          useNativeDriver: true,
        }),
      ])
    );
    progressLoop.start();

    return () => {
      floatLoop.stop();
      starLoop.stop();
      progressLoop.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fast, responsive splash transition: minimum 1000ms brand reveal, then instant navigation once ready
  useEffect(() => {
    const minSplashDuration = 1000;
    const elapsed = Date.now() - mountTimeRef.current;
    const remainingTime = Math.max(0, minSplashDuration - elapsed);

    const timer = setTimeout(() => {
      if (!isLoading) {
        navigateToOnboarding();
      }
    }, remainingTime);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const isWeb = Platform.OS === 'web';

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
      {/* Seamless full-screen illustration background */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Image
          source={require('../assets/images/splash_boy_pencil.webp')}
          style={styles.fullBgImage}
          resizeMode="cover"
        />
        {/* Soft subtle bottom scrim to blend into the clouds and keep SmartKids crisp */}
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="splashBottomScrim" x1="0" y1="0.65" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
              <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.45" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.88" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#splashBottomScrim)" />
        </Svg>
      </View>

      <TouchableOpacity
        activeOpacity={1}
        onPress={navigateToOnboarding}
        style={styles.touchableArea}
      >
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Middle spacer - the boy on the pencil rocket is already seamlessly in the background! */}
          <View style={styles.centerSpacer} />

          {/* App Branding & Typography at bottom on the fluffy clouds */}
          <View style={styles.textContainer}>
            <Text style={styles.appName}>KidsZone</Text>
            <View style={styles.subtitleCol}>
              <Text style={styles.subtitle}>Learn Today</Text>
              <Text style={styles.subtitle}>Lead Tomorrow</Text>
            </View>
            <View style={styles.loadingStatusWrap}>
              <View style={styles.loadingTrack}>
                <Animated.View
                  style={[
                    styles.loadingFill,
                    {
                      transform: [
                        {
                          translateX: progressBarAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-56, 112],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              </View>
              <Text style={styles.loadingStatusText}>
                {language === 'gu'
                  ? 'તૈયાર થઈ રહ્યું છે...'
                  : language === 'hi'
                    ? 'तैयार हो रहा है...'
                    : 'Getting ready...'}
              </Text>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#7CC7FF',
  },
  touchableArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  fullBgImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  topStarsContainer: {
    width: '100%',
    height: 90,
    position: 'relative',
  },
  centerSpacer: {
    flex: 1,
    width: '100%',
  },
  floatingStar: {
    position: 'absolute',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  starTopLeft: {
    top: 15,
    left: 20,
  },
  starTopRight: {
    top: 10,
    right: 18,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Platform.OS === 'ios' ? 30 : 24,
    width: '100%',
  },
  appName: {
    fontSize: 42,
    fontWeight: '700',
    color: '#1E3A8A', // Deep royal navy
    letterSpacing: -0.6,
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(30, 58, 138, 0.15)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  subtitleCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3B82F6', // Playful royal blue
    textAlign: 'center',
    letterSpacing: 0.2,
    lineHeight: 27,
  },
  loadingStatusWrap: {
    marginTop: 14,
    alignItems: 'center',
    gap: 6,
  },
  loadingTrack: {
    width: 140,
    height: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    overflow: 'hidden',
  },
  loadingFill: {
    width: 68,
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#2563EB',
  },
  loadingStatusText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
    letterSpacing: 0.2,
  },
});
