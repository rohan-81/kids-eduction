import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useApp } from '../src/context/AppContext';
import { contentPackService, DownloadPackProgress } from '../src/services/contentPackService';
import { checkInternetAvailable } from '../src/utils/networkCheck';
import { ClayButton } from '../src/components/clay/ClayButton';
import { GlobeIcon, WarningIcon } from '../src/components/fun';
import { kidPalette, kidTones, claySurface } from '../src/theme/kidTheme';
import { soundEffects } from '../src/services/soundEffects';

export default function SetupScreen() {
  const router = useRouter();
  const { language, setLanguage, isAuthenticated } = useApp();

  const [status, setStatus] = useState<'checking' | 'offline' | 'downloading' | 'error'>('checking');
  const [progress, setProgress] = useState<DownloadPackProgress>({ percent: 1, stage: 'downloading' });
  const [displayPercent, setDisplayPercent] = useState<number>(1);
  const targetPercentRef = useRef<number>(1);
  const stageRef = useRef<DownloadPackProgress['stage']>('downloading');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const progressAnim = useRef(new Animated.Value(1)).current;
  const startedRef = useRef(false);

  // Smooth continuous visual ticker so percentage & bar never stall or jump from 2% -> 72%
  useEffect(() => {
    if (status !== 'downloading') return;
    let tickCount = 0;
    const timer = setInterval(() => {
      tickCount += 1;
      setDisplayPercent((prev) => {
        const target = targetPercentRef.current;
        if (prev < target) {
          const step = target - prev > 12 ? 2 : 1;
          return Math.min(target, prev + step);
        }
        // Gentle creep while waiting on cold start or stream chunks
        if (stageRef.current === 'downloading' && prev < 62 && tickCount % 8 === 0) {
          return prev + 1;
        }
        if (stageRef.current === 'syncing' && prev < 99 && tickCount % 5 === 0) {
          return prev + 1;
        }
        return prev;
      });
    }, 55);
    return () => clearInterval(timer);
  }, [status]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: displayPercent,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [displayPercent, progressAnim]);

  const startSetup = async () => {
    setStatus('checking');
    setErrorMsg('');
    targetPercentRef.current = 1;
    stageRef.current = 'downloading';
    setDisplayPercent(1);
    setProgress({ percent: 1, stage: 'downloading' });

    const online = await checkInternetAvailable(4500);
    if (!online) {
      setStatus('offline');
      return;
    }

    setStatus('downloading');
    const result = await contentPackService.downloadAndInstallPack((p) => {
      targetPercentRef.current = Math.max(targetPercentRef.current, p.percent);
      stageRef.current = p.stage;
      setProgress(p);
    });

    if (result.success) {
      targetPercentRef.current = 100;
      setDisplayPercent(100);
      soundEffects.playTadaaa();
      setTimeout(() => {
        router.replace(isAuthenticated ? '/home' : '/login');
      }, 350);
    } else {
      setStatus('error');
      setErrorMsg(result.error || 'Server waking up or network interrupted.');
    }
  };

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void startSetup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cycleLanguage = () => {
    soundEffects.playBubblePop();
    const next = language === 'gu' ? 'en' : language === 'en' ? 'hi' : 'gu';
    setLanguage(next);
  };

  const getStageLabel = () => {
    if (progress.stage === 'extracting') {
      return language === 'gu'
        ? 'ફોન સ્ટોરેજમાં 3D ચિત્રો અને અવાજ સેવ થઈ રહ્યા છે...'
        : language === 'hi'
        ? 'फ़ोन स्टोरेज में 3D चित्र और आवाज़ें सेव हो रही हैं...'
        : 'Saving 3D pictures & sounds to your device...';
    }
    if (progress.stage === 'syncing') {
      return language === 'gu'
        ? 'પાઠ, વાર્તાઓ અને ક્વિઝ તૈયાર થઈ રહ્યા છે...'
        : language === 'hi'
        ? 'पाठ, कहानियाँ और क्विज़ तैयार हो रहे हैं...'
        : 'Syncing lessons, stories & games...';
    }
    if (progress.stage === 'done') {
      return language === 'gu'
        ? 'બધું તૈયાર છે! 🎉'
        : language === 'hi'
        ? 'सब तैयार है! 🎉'
        : 'All ready! 🎉';
    }
    return language === 'gu'
      ? 'લર્નિંગ પેક ડાઉનલોડ થઈ રહ્યું છે (~15 MB, એક જ વાર)...'
      : language === 'hi'
      ? 'लर्निंग पैक डाउनलोड हो रहा है (~15 MB, केवल एक बार)...'
      : 'Downloading learning pack (~15 MB, one-time setup)...';
  };

  const barWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="setupBgGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor={kidPalette.tintSky} stopOpacity="1" />
              <Stop offset="50%" stopColor="#FFFDF7" stopOpacity="1" />
              <Stop offset="100%" stopColor={kidPalette.tintMint} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#setupBgGrad)" />
        </Svg>
      </View>

      <View style={styles.topBar}>
        <View />
        <TouchableOpacity style={styles.langPill} onPress={cycleLanguage} activeOpacity={0.8}>
          <GlobeIcon size={16} color={kidTones.sky.edge} />
          <Text style={styles.langPillText}>
            {language === 'gu' ? 'ગુજરાતી' : language === 'hi' ? 'हिन्दी' : 'English'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.centerWrap}>
        <View style={[styles.card, claySurface('plain', 2)]}>
          <Image source={require('../assets/icon.png')} style={styles.logo} resizeMode="contain" />

          <Text style={styles.title}>
            {language === 'gu'
              ? 'KidsZone સેટઅપ'
              : language === 'hi'
              ? 'KidsZone सेटअप'
              : 'KidsZone Setup'}
          </Text>

          {status === 'checking' && (
            <View style={styles.stateBox}>
              <ActivityIndicator size="large" color={kidTones.sky.edge} />
              <Text style={styles.desc}>
                {language === 'gu'
                  ? 'ઇન્ટરનેટ તપાસી રહ્યા છીએ...'
                  : language === 'hi'
                  ? 'इंटरनेट की जाँच हो रही है...'
                  : 'Checking internet connection...'}
              </Text>
            </View>
          )}

          {status === 'downloading' && (
            <View style={styles.stateBox}>
              <Text style={styles.desc}>{getStageLabel()}</Text>
              <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressFill, { width: barWidth }]} />
              </View>
              <Text style={styles.percentText}>{displayPercent}%</Text>
              <Text style={styles.hintText}>
                {language === 'gu'
                  ? 'આ એક જ વાર ડાઉનલોડ થશે — પછી ઇન્ટરનેટ વગર પણ બધું ચાલશે!'
                  : language === 'hi'
                  ? 'यह केवल एक बार डाउनलोड होगा — फिर बिना इंटरनेट के भी सब चलेगा!'
                  : 'One-time download — after this, all new 3D art & sounds work offline!'}
              </Text>
            </View>
          )}

          {(status === 'offline' || status === 'error') && (
            <View style={styles.stateBox}>
              <View style={styles.warnBadge}>
                <WarningIcon size={24} color="#D97706" />
              </View>
              <Text style={styles.warnTitle}>
                {status === 'offline'
                  ? language === 'gu'
                    ? 'પહેલી વાર ઇન્ટરનેટ ચાલુ કરો'
                    : language === 'hi'
                    ? 'पहली बार इंटरनेट चालू करें'
                    : 'Internet Required for First Setup'
                  : language === 'gu'
                  ? 'ડાઉનલોડમાં થોડી અડચણ આવી'
                  : language === 'hi'
                  ? 'डाउनलोड में समस्या आई'
                  : 'Could Not Complete Download'}
              </Text>
              <Text style={styles.desc}>
                {status === 'offline'
                  ? language === 'gu'
                    ? 'બધા નવા 3D ચિત્રો, પ્રાણીઓના અવાજ, વાર્તાઓ અને કવિતાઓ ફોનમાં સેવ કરવા માટે ઇન્ટરનેટ ચાલુ કરીને નીચેનું બટન દબાવો. પછી ઇન્ટરનેટ વગર પણ ચાલશે!'
                    : language === 'hi'
                    ? 'सभी नए 3D चित्र, जानवरों की आवाज़ें, कहानियाँ और कविताएँ फ़ोन में सेव करने के लिए इंटरनेट चालू करें। इसके बाद बिना इंटरनेट के भी चलेगा!'
                    : 'Turn on Internet once so all new 3D images, animal sounds, stories & rhymes can be saved to your phone. After this, it works offline!'
                  : errorMsg}
              </Text>

              <ClayButton
                tone="sky"
                size="md"
                style={styles.retryBtn}
                onPress={startSetup}
                title={
                  language === 'gu'
                    ? 'ઇન્ટરનેટ ચેક કરી ડાઉનલોડ કરો'
                    : language === 'hi'
                    ? 'इंटरनेट जाँचें और डाउनलोड करें'
                    : 'Check Internet & Download'
                }
              />
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: kidPalette.tintSky,
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
  },
  langPillText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0284C7',
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
  },
  logo: {
    width: 104,
    height: 104,
    borderRadius: 24,
    marginBottom: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  stateBox: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  warnBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warnTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#B45309',
    textAlign: 'center',
  },
  desc: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
    textAlign: 'center',
    fontWeight: '600',
  },
  progressTrack: {
    width: '100%',
    height: 16,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0EA5E9',
    borderRadius: 10,
  },
  percentText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0284C7',
  },
  hintText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
  },
  retryBtn: {
    width: '100%',
    marginTop: 6,
  },
});

