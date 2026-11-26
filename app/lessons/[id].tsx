import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  Platform,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/colors';
import { spacing, radii, shadows } from '../../src/theme/spacing';
import { useApp } from '../../src/context/AppContext';
import { Header } from '../../src/components/Header';
import { AudioSpeakerButton } from '../../src/components/AudioSpeakerButton';
import { LessonActionSection } from '../../src/components/LessonActionSection';
import { AppIcon } from '../../src/components/AppIcon';
import { TracingCanvas } from '../../src/components/TracingCanvas';
import { PastelButton } from '../../src/components/PastelButton';
import { LESSONS, getLessonAudio, getLessonDisplayLabels } from '../../src/data/lessons';
import { LessonItem } from '../../src/types';
import { getLessonImageSource } from '../../src/utils/imageHelper';
import { renderGKCardVisual } from '../../src/components/GKCardVisuals';
import { renderMathCardVisual } from '../../src/components/MathCardVisuals';
import { renderLesson3DVisual } from '../../src/components/Lesson3DVisuals';
import { soundEffects } from '../../src/services/soundEffects';
import { audioService } from '../../src/services/audioService';
import { apiService, findBundledLesson, mergeLesson } from '../../src/services/apiService';
import { ClayButton, ImageFrame } from '../../src/components/clay';
import { KidModal, Glyph } from '../../src/components/fun';
import { ConfettiCelebration } from '../../src/components/common/ConfettiCelebration';
import { AppGlobalBackground } from '../../src/components/common/AppGlobalBackground';
import { GoldCoinIcon } from '../../src/components/common/GoldCoinIcon';
import { kidTones, kidPalette, claySurface, clayShadow } from '../../src/theme/kidTheme';
import {
  toGujDigits,
  toHiDigits,
  formatNumberDigits,
  formatMathExpression,
  HINDI_NUMBERS,
  GUJARATI_NUMBERS,
  ENGLISH_NUMBERS,
  HINDI_TABLE_RECITATION,
  GUJARATI_TABLE_RECITATION,
} from '../../src/utils/languageData';
import { getAnimalSoundInfo, getPhonicsPrompt } from '../../src/utils/phonicsData';
import { filterLessonsForClass } from '../../src/utils/ageDetailHelper';
import { getLessonAgeAdaptation } from '../../src/utils/ageDetailHelper';
import { webStyle } from '../../src/utils/webStyle';

/** Coins awarded for a lesson result (shared by the reward and the popup so they can't drift). */
const coinsForStars = (stars: number) => (stars >= 3 ? 15 : stars === 2 ? 10 : 5);

/** Giant star bubble: springs in one after another and glows gold when earned. */
const CelebrationStar: React.FC<{ index: number; earned: boolean }> = ({ index, earned }) => {
  const pop = React.useRef(new Animated.Value(0)).current;
  const glow = React.useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(pop, { toValue: 1, delay: 180 + index * 220, friction: 4, tension: 110, useNativeDriver: Platform.OS !== 'web' }).start();
    if (!earned) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 700, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(glow, { toValue: 0, duration: 700, useNativeDriver: Platform.OS !== 'web' }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [index, earned, pop, glow]);
  const scale = Animated.multiply(
    pop.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }),
    glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] })
  );
  const big = index === 2;
  return (
    <Animated.View
      style={[
        styles.celebrateStar,
        big && styles.celebrateStarBig,
        earned ? styles.celebrateStarEarned : styles.celebrateStarEmpty,
        { opacity: pop, transform: [{ scale }, { translateY: big ? -10 : 0 }] },
      ]}
    >
      <Text style={[styles.celebrateStarGlyph, big && { fontSize: 46 }, !earned && { opacity: 0.25 }]}>⭐</Text>
    </Animated.View>
  );
};

/** Bouncing coin counter that counts up to the real reward. */
const CoinCounter: React.FC<{ amount: number; active: boolean; language: string }> = ({ amount, active, language }) => {
  const [shown, setShown] = useState(0);
  const bounce = React.useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!active) {
      setShown(0);
      return;
    }
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      setShown(n);
      if (n >= amount) {
        clearInterval(id);
        bounce.setValue(1.3);
        Animated.spring(bounce, { toValue: 1, friction: 3, tension: 160, useNativeDriver: Platform.OS !== 'web' }).start();
      }
    }, 45);
    return () => clearInterval(id);
  }, [active, amount, bounce]);
  const digits = language === 'gu' ? toGujDigits(shown) : language === 'hi' ? toHiDigits(shown) : String(shown);
  return (
    <Animated.View style={[styles.celebrateCoins, { transform: [{ scale: bounce }] }]}>
      <GoldCoinIcon size={24} />
      <Text style={styles.celebrateCoinsText}>+{digits}</Text>
    </Animated.View>
  );
};

export default function LessonDetailScreen() {
  const router = useRouter();
  const { id, dir } = useLocalSearchParams<{ id: string; dir?: string }>();
  const { speak, completeLesson, addCoins, t, language, ageGroup } = useApp();
  const cardSlideX = useRef(
    new Animated.Value(dir === 'prev' ? -70 : dir === 'next' ? 70 : 0)
  ).current;

  useEffect(() => {
    if (dir === 'prev' || dir === 'next') {
      cardSlideX.setValue(dir === 'prev' ? -70 : 70);
      Animated.spring(cardSlideX, {
        toValue: 0,
        friction: 8,
        tension: 95,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    } else {
      cardSlideX.setValue(0);
    }
  }, [id, dir, cardSlideX]);

  const [currentLesson, setCurrentLesson] = useState<LessonItem | null>(null);
  const [showTracing, setShowTracing] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  /** True when the lesson was completed by tracing (affects popup copy and what "Retry" does). */
  const [finishedViaTracing, setFinishedViaTracing] = useState(false);
  const [traceResult, setTraceResult] = useState<{ pct: number; stars: number } | null>(null);
  const [tracingKey, setTracingKey] = useState<number>(0);
  const [speechFeedback, setSpeechFeedback] = useState<{
    status: 'idle' | 'success';
    msg?: string;
  }>({ status: 'idle' });

  // 'loading' while the backend lookup runs for an id that isn't bundled; 'missing' if unknown everywhere.
  const [lookupState, setLookupState] = useState<'ready' | 'loading' | 'missing'>('ready');
  // Category list for Prev/Next + progress bar: bundled first, replaced by the backend list.
  const [categoryLessons, setCategoryLessons] = useState<LessonItem[]>([]);

  const speakRef = useRef(speak);
  speakRef.current = speak;
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishingRef = useRef(false);

  // Silence all audio immediately when this screen loses focus or user navigates to another page
  useFocusEffect(
    useCallback(() => {
      return () => {
        if (feedbackTimerRef.current) {
          clearTimeout(feedbackTimerRef.current);
          feedbackTimerRef.current = null;
        }
        audioService.stop();
        soundEffects.stopAnimalSound();
      };
    }, [])
  );

  useEffect(() => {
    if (!showCelebration) finishingRef.current = false;
  }, [showCelebration]);

  useEffect(() => {
    // Immediately stop any leftover audio from previous screen
    audioService.stop();
    soundEffects.stopAnimalSound();

    let cancelled = false;
    const lessonId = String(id || '');
    const bundled = findBundledLesson(lessonId);
    const playName = (item: LessonItem) => {
      const audio = getLessonAudio(item, language);
      speakRef.current(audio.text, audio.lang);
    };

    // 1) Instant render from the offline bundle (never substitute a different lesson).
    setCurrentLesson(bundled || null);
    setLookupState(bundled ? 'ready' : 'loading');
    setShowTracing(false);
    setFinishedViaTracing(false);
    setTraceResult(null);

    // Auto-play name audio with instant response time
    if (bundled) {
      playName(bundled);
    }

    // 2) Backend is the source of truth: refresh with the live lesson.
    apiService.fetchLessonById(lessonId).then((fresh) => {
      if (cancelled) return;
      if (fresh) {
        setCurrentLesson(mergeLesson(bundled, fresh));
        setLookupState('ready');
        if (!bundled) playName(fresh);
      } else if (!bundled) {
        setLookupState('missing');
      }
    });

    return () => {
      cancelled = true;
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }
      audioService.stop();
      soundEffects.stopAnimalSound();
    };
  }, [id, language]);

  const categoryId = currentLesson?.categoryId;
  useEffect(() => {
    if (!categoryId) return;
    let cancelled = false;
    // Same query the Lesson Explorer uses, so Prev/Next follow the list the child just saw.
    setCategoryLessons(
      filterLessonsForClass(LESSONS.filter((l) => l.categoryId === categoryId), ageGroup, categoryId)
    );
    apiService.fetchLessons(language, ageGroup, categoryId).then((list) => {
      if (!cancelled && list.length > 0) setCategoryLessons(list);
    });
    return () => {
      cancelled = true;
    };
  }, [categoryId, language, ageGroup]);

  if (!currentLesson) {
    return (
      <SafeAreaView style={styles.lookupContainer}>
        <Text style={styles.lookupEmoji}>{lookupState === 'missing' ? '🔍' : '📚'}</Text>
        <Text style={styles.lookupText}>
          {lookupState === 'missing'
            ? language === 'gu'
              ? 'આ પાઠ મળ્યો નથી'
              : language === 'hi'
              ? 'यह पाठ नहीं मिला'
              : "We couldn't find this lesson"
            : language === 'gu'
            ? 'પાઠ લોડ થઈ રહ્યો છે...'
            : language === 'hi'
            ? 'पाठ लोड हो रहा है...'
            : 'Loading lesson...'}
        </Text>
        {lookupState === 'missing' && (
          <TouchableOpacity
            style={styles.lookupButton}
            activeOpacity={0.8}
            onPress={() => {
              soundEffects.playBubblePop();
              router.replace('/lessons');
            }}
          >
            <Text style={styles.lookupButtonText}>
              {language === 'gu' ? 'પાઠ પર પાછા જાઓ' : language === 'hi' ? 'पाठों पर वापस जाएं' : 'Back to lessons'}
            </Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    );
  }

  // Find index in category list for Previous/Next matching ageGroup
  const currentIndex = categoryLessons.findIndex((l) => l.id === currentLesson.id);
  const prevLesson = currentIndex > 0 ? categoryLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < categoryLessons.length - 1 ? categoryLessons[currentIndex + 1] : null;

  const handleSpeak = () => {
    if (!currentLesson) return;
    soundEffects.stopAnimalSound();
    audioService.stop();
    soundEffects.playBubblePop();
    const audio = getLessonAudio(currentLesson, language);
    speakRef.current(audio.text, audio.lang);
  };

  const handlePlayRealAnimalVoice = async () => {
    if (!animalSoundInfo) return;
    try {
      audioService.stop();
      soundEffects.playBubblePop();
      const onom =
        language === 'gu'
          ? animalSoundInfo.onomatopoeiaGu
          : language === 'hi'
          ? animalSoundInfo.onomatopoeiaHi
          : animalSoundInfo.onomatopoeiaEn;

      setSpeechFeedback({
        status: 'success',
        msg: `${animalSoundInfo.emoji} ${onom}`,
      });

      const played = await soundEffects.playAnimalSound(
        animalSoundInfo.soundKey,
        2800,
        currentLesson?.audioUrl || currentLesson?.lessonData?.audioUrl
      );

      // Robust fallback: if native audio playback is silenced or unavailable, speak onomatopoeia
      if (!played) {
        speak(onom, language);
      }

      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = setTimeout(() => {
        setSpeechFeedback((prev) => (prev.status === 'success' ? { status: 'idle', msg: '' } : prev));
      }, 2800);
    } catch {
      // Graceful fallback
      if (animalSoundInfo) {
        const onom =
          language === 'gu'
            ? animalSoundInfo.onomatopoeiaGu
            : language === 'hi'
            ? animalSoundInfo.onomatopoeiaHi
            : animalSoundInfo.onomatopoeiaEn;
        speak(onom, language);
      }
    }
  };

  const handleFinish = async (customResult?: { pct: number; stars: number }) => {
    // Double tap on "Complete" (or a trace completing while the button is pressed) used to pay
    // the coins twice. Released when the celebration closes (Retry / Next / dismiss).
    if (finishingRef.current) return;
    finishingRef.current = true;
    audioService.stop();
    soundEffects.stopAnimalSound();
    soundEffects.playTadaaa();

    const result = customResult || { pct: 100, stars: 3 };
    setTraceResult(result);

    setFinishedViaTracing(!!customResult);
    addCoins(coinsForStars(result.stars));

    const praise =
      result.stars === 3
        ? language === 'gu'
          ? 'અદ્ભુત! તમને ૩ સ્ટાર મળ્યા!'
          : language === 'hi'
          ? 'शानदार! आपको ३ स्टार मिले!'
          : 'Superb! You got 3 stars!'
        : result.stars === 2
        ? language === 'gu'
          ? 'ખૂબ સરસ! તમને ૨ સ્ટાર મળ્યા!'
          : language === 'hi'
          ? 'बहुत बढ़िया! आपको २ स्टार मिले!'
          : 'Great job! You got 2 stars!'
        : language === 'gu'
        ? 'સરસ પ્રયાસ! તમને ૧ સ્ટાર મળ્યો!'
        : language === 'hi'
        ? 'अच्छा प्रयास! आपको १ स्टार मिला!'
        : 'Good effort! You got 1 star!';
    speak(praise, language);

    if (currentLesson) {
      // completeLesson already reports to the backend (signed-in parents only); a second,
      // uncaught syncLessonProgress call here double-counted plays on the server.
      await completeLesson(currentLesson.id).catch(() => undefined);
    }
    setShowCelebration(true);
  };

  const goToNext = () => {
    audioService.stop();
    soundEffects.stopAnimalSound();
    if (nextLesson) {
      router.replace({ pathname: '/lessons/[id]', params: { id: nextLesson.id, dir: 'next' } });
    } else if (router.canGoBack()) {
      router.back();
    } else {
      // Deep link / web refresh on the last lesson: no history to pop
      router.replace(`/lessons?categoryId=${currentLesson.categoryId}`);
    }
  };

  // Language display priority:
  // If language is Gujarati: Big bold name is Gujarati (e.g. "સફરજન"), and secondary in brackets is "(Apple)"
  // If language is Hindi: Big bold name is Hindi (e.g. "सेब"), and secondary in brackets is "(Apple)"
  // If language is English: Big bold name is English (e.g. "Apple"), and secondary in brackets is "(સફરજન / सेब)"
  let primaryWord = currentLesson.exampleWord;
  let secondaryTranslation = '';

  if (currentLesson.categoryId === 'ghadiya') {
    const parts = currentLesson.id.split('-');
    const tNum = parseInt(parts[1], 10) || 1;
    const rNum = parseInt(parts[2], 10) || 1;
    if (language === 'hi') {
      primaryWord = HINDI_TABLE_RECITATION[tNum]?.[rNum]?.text || currentLesson.title;
      secondaryTranslation = `(${toHiDigits(tNum)} × ${toHiDigits(rNum)} = ${toHiDigits(tNum * rNum)})`;
    } else if (language === 'gu') {
      primaryWord = GUJARATI_TABLE_RECITATION[tNum]?.[rNum]?.text || currentLesson.title;
      secondaryTranslation = `(${toGujDigits(tNum)} × ${toGujDigits(rNum)} = ${toGujDigits(tNum * rNum)})`;
    } else {
      primaryWord = `${tNum} times ${rNum} is ${tNum * rNum}`;
      secondaryTranslation = `(${tNum} × ${rNum} = ${tNum * rNum})`;
    }
  } else {
    const labels = getLessonDisplayLabels(currentLesson, language);
    primaryWord = labels.primaryLabel;
    secondaryTranslation = labels.secondaryBracket;
  }

  const adaptation = getLessonAgeAdaptation(currentLesson, ageGroup, language);

  const isLetterCategory =
    currentLesson.categoryId === 'en-alphabet' ||
    currentLesson.categoryId === 'en-phonics' ||
    currentLesson.categoryId === 'gu-varnamala' ||
    currentLesson.categoryId === 'gu-barakhadi' ||
    currentLesson.categoryId === 'hi-varnamala';

  const isNumberCategory = currentLesson.categoryId === 'numbers';

  const isAnimalOrBird =
    currentLesson.categoryId === 'animals' ||
    currentLesson.illustrationType === 'animal' ||
    currentLesson.id.startsWith('an-') ||
    Boolean(
      currentLesson.categoryId !== 'en-alphabet' &&
      currentLesson.categoryId !== 'en-phonics' &&
      currentLesson.categoryId !== 'gu-varnamala' &&
      currentLesson.categoryId !== 'gu-barakhadi' &&
      currentLesson.categoryId !== 'hi-varnamala' &&
      currentLesson.categoryId !== 'numbers' &&
      getAnimalSoundInfo(
        `${currentLesson.id} ${currentLesson.soundKey || ''} ${currentLesson.exampleWord || ''} ${currentLesson.title || ''} ${currentLesson.exampleMeaning || ''}`
      )
    );

  const isEnglishAlphabetCategory =
    currentLesson.categoryId === 'en-alphabet' ||
    currentLesson.categoryId === 'en-phonics';

  // Tracing is strictly kept only for English Alphabet (ABCD) and Numbers (1-100),
  // and removed from Gujarati Kakko (ક ખ ગ) and Hindi Vyanjan (क ख ग)
  const canShowTracing =
    (isEnglishAlphabetCategory || isNumberCategory) &&
    currentLesson.categoryId !== 'animals' &&
    Boolean(currentLesson.symbol) &&
    currentLesson.symbol.trim().length > 0 &&
    currentLesson.symbol.trim().length <= 3;

  const animalSoundInfo = isAnimalOrBird
    ? getAnimalSoundInfo(
        `${currentLesson.id} ${currentLesson.soundKey || ''} ${currentLesson.exampleWord || ''} ${currentLesson.title || ''} ${currentLesson.exampleMeaning || ''}`
      )
    : null;

  const phonicsPrompt = isLetterCategory
    ? getPhonicsPrompt(currentLesson.symbol, language)
    : null;

  const displayedSymbol = (() => {
    if (currentLesson.categoryId === 'numbers') {
      const match = currentLesson.id.match(/^num-(\d+)$/);
      const n = match ? parseInt(match[1], 10) : currentLesson.countItems || 1;
      return formatNumberDigits(n, language);
    }
    if (currentLesson.categoryId === 'ghadiya') {
      const parts = currentLesson.id.split('-');
      const tNum = parseInt(parts[1], 10) || 1;
      const rNum = parseInt(parts[2], 10) || 1;
      if (language === 'hi') {
        return `${toHiDigits(tNum)} × ${toHiDigits(rNum)} = ${toHiDigits(tNum * rNum)}`;
      }
      if (language === 'gu') {
        return `${toGujDigits(tNum)} × ${toGujDigits(rNum)} = ${toGujDigits(tNum * rNum)}`;
      }
      return `${tNum} × ${rNum} = ${tNum * rNum}`;
    }
    if (currentLesson.categoryId === 'math') {
      return formatMathExpression(currentLesson.symbol, language);
    }
    return currentLesson.symbol;
  })();

  const handlePlayPhonicsSound = () => {
    soundEffects.playBubblePop();
    if (phonicsPrompt) {
      setSpeechFeedback({
        status: 'success',
        msg: `${phonicsPrompt.emoji} ${phonicsPrompt.text}`,
      });
      speak(phonicsPrompt.text, language);
    }
  };

  const headerTitle = (() => {
    if (currentLesson.categoryId === 'numbers') {
      const match = currentLesson.id.match(/^num-(\d+)$/);
      const n = match ? parseInt(match[1], 10) : currentLesson.countItems || 1;
      if (language === 'hi') {
        return `${toHiDigits(n)} • ${HINDI_NUMBERS[n] || toHiDigits(n)}`;
      }
      if (language === 'en') {
        return `${n} • ${ENGLISH_NUMBERS[n] || n}`;
      }
      return `${toGujDigits(n)} • ${GUJARATI_NUMBERS[n] || toGujDigits(n)}`;
    }
    if (currentLesson.categoryId === 'ghadiya') {
      const parts = currentLesson.id.split('-');
      const tNum = parseInt(parts[1], 10) || 1;
      const rNum = parseInt(parts[2], 10) || 1;
      if (language === 'hi') {
        return `पहाड़े • ${toHiDigits(tNum)} × ${toHiDigits(rNum)}`;
      }
      if (language === 'gu') {
        return `ઘડિયા • ${toGujDigits(tNum)} × ${toGujDigits(rNum)}`;
      }
      return `Tables • ${tNum} × ${rNum}`;
    }
    if (currentLesson.categoryId === 'math') {
      const formatted = formatMathExpression(currentLesson.exampleWord || currentLesson.symbol, language);
      return `${language === 'gu' ? 'સરવાળો' : language === 'hi' ? 'जोड़' : 'Addition'} • ${formatted}`;
    }
    if (currentLesson.categoryId === 'math-missing' || currentLesson.id.startsWith('cs-pattern')) {
      return primaryWord;
    }
    if (secondaryTranslation) {
      return `${primaryWord} ${secondaryTranslation}`;
    }
    return primaryWord || currentLesson.title;
  })();

  const handleBack = () => {
    audioService.stop();
    soundEffects.stopAnimalSound();
    soundEffects.playBubblePop();
    if (Platform.OS === 'web') {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
      try {
        if (router.canGoBack()) {
          router.back();
          setTimeout(() => {
            if (typeof window !== 'undefined' && window.location.pathname + window.location.search === currentPath) {
              router.replace(`/lessons?categoryId=${currentLesson.categoryId}`);
            }
          }, 150);
          return;
        }
      } catch {}
      router.replace(`/lessons?categoryId=${currentLesson.categoryId}`);
      return;
    }

    try {
      if (router.canGoBack()) {
        router.back();
        return;
      }
    } catch {}
    router.replace(`/lessons?categoryId=${currentLesson.categoryId}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppGlobalBackground id="lessonDetailBgGrad" />
      <Header
        title={headerTitle}
        showBack={true}
        onBack={handleBack}
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
        {/* Progress indicator */}
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${
                  categoryLessons.length > 0
                    ? ((currentIndex + 1) / categoryLessons.length) * 100
                    : 100
                }%`,
              },
            ]}
          />
        </View>

        {/* Main Card with Big Symbol & Illustration (Unified Screenshot 1 Style) */}
        <Animated.View
          style={[
            styles.card,
            { transform: [{ translateX: cardSlideX }] },
            webStyle({
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.05)',
            }),
          ]}
        >
          {/* Top Class Adaptation Badge */}
          {adaptation ? (
            <View
              style={[
                styles.cardHeaderTag,
                {
                  backgroundColor: adaptation.tierBadge.tagBg,
                  borderColor: adaptation.tierBadge.border,
                },
                shadows.soft,
              ]}
            >
              <Text
                style={[
                  styles.cardHeaderTagText,
                  { color: adaptation.tierBadge.tagColor },
                ]}
              >
                {adaptation.tierBadge.badgeLabel} • {adaptation.tierBadge.title}
              </Text>
            </View>
          ) : null}

          {/* Real Photo Image or Large Readable Symbol */}
          <TouchableOpacity style={styles.imageTouchable} onPress={handleSpeak} activeOpacity={0.85}>
            {(() => {
              // For all Alphabet / Varnamala / Phonics lessons: NO image, only BIG SIZE ALPHABET!
              if (isLetterCategory) {
                return <Text style={styles.hugeSymbol}>{displayedSymbol}</Text>;
              }

              const visual3D = renderLesson3DVisual(currentLesson, 110, language);
              if (visual3D) {
                return (
                  <View style={styles.mathDetailVisualBox}>
                    {visual3D}
                  </View>
                );
              }

              const isGKCategory =
                currentLesson.categoryId.startsWith('gk-') ||
                currentLesson.categoryId === 'gk' ||
                currentLesson.id.startsWith('country-');
              if (isGKCategory) {
                return (
                  <View style={styles.gkDetailVisualBox}>
                    {renderGKCardVisual(currentLesson, 110)}
                  </View>
                );
              }

              if (currentLesson.categoryId === 'math-money' || currentLesson.categoryId === 'math-missing') {
                return (
                  <View style={styles.mathDetailVisualBox}>
                    {renderMathCardVisual(currentLesson, 110, language)}
                  </View>
                );
              }
              const imgSource = getLessonImageSource(currentLesson);
              if (imgSource) {
                // Fixed 280x230 rounded frame, resizeMode="contain": entire animal or bird is always 100% visible without cropping.
                return (
                  <ImageFrame
                    source={imgSource}
                    emoji={displayedSymbol}
                    variant="detail"
                    tone="sky"
                    resizeMode="contain"
                    accessibilityLabel={currentLesson.title}
                    style={[clayShadow(2), styles.detailFrame]}
                  />
                );
              }
              return <Text style={styles.hugeSymbol}>{displayedSymbol}</Text>;
            })()}
          </TouchableOpacity>

          {/* Example Word & Meaning Bubble */}
          {primaryWord ? (
            <View style={[styles.wordBox, shadows.soft]}>
              <Text style={styles.exampleWord}>{primaryWord}</Text>
              {secondaryTranslation ? (
                <Text style={styles.exampleMeaning}>{secondaryTranslation}</Text>
              ) : null}
            </View>
          ) : null}

          {/* Class 3-5: In-Depth Educational Fun Fact Card */}
          {adaptation?.funFact ? (
            <View style={[styles.funFactCard, shadows.soft]}>
              <View style={styles.funFactHeaderRow}>
                <Text style={styles.funFactTitle}>
                  {language === 'gu'
                    ? 'શું તમે જાણો છો?'
                    : language === 'hi'
                    ? 'क्या आप जानते हैं?'
                    : 'Did You Know?'}
                </Text>
                <View style={styles.funFactBadge}>
                  <Text style={styles.funFactBadgeText}>
                    {language === 'gu'
                      ? 'ઊંડાણપૂર્વક જ્ઞાન'
                      : language === 'hi'
                      ? 'विस्तृत ज्ञान'
                      : 'Fact'}
                  </Text>
                </View>
              </View>
              <Text style={styles.funFactBody}>{adaptation.funFact}</Text>
            </View>
          ) : null}

          {/* Unified Action Controls Section: Audio, Phonics, Finger Tracing & Bottom Nav */}
          <LessonActionSection
            language={language}
            onSpeak={handleSpeak}
            onPlayRealVoice={animalSoundInfo ? handlePlayRealAnimalVoice : undefined}
            hasRealVoice={Boolean(animalSoundInfo)}
            realVoiceInfo={animalSoundInfo ? { emoji: animalSoundInfo.emoji, soundKey: animalSoundInfo.soundKey } : null}
            characterImage={getLessonImageSource(currentLesson) ?? undefined}
            phonicsPrompt={phonicsPrompt}
            onPlayPhonics={handlePlayPhonicsSound}
            canTrace={canShowTracing}
            isTracingOpen={showTracing}
            onToggleTracing={() => setShowTracing(!showTracing)}
            isNumberLesson={isNumberCategory}
            speechFeedback={speechFeedback}
            hasPrevious={Boolean(prevLesson)}
            hasNext={Boolean(nextLesson)}
            onPrevious={() => {
              if (prevLesson) {
                soundEffects.stopAnimalSound();
                router.replace({ pathname: '/lessons/[id]', params: { id: prevLesson.id, dir: 'prev' } });
              }
            }}
            onComplete={() => handleFinish()}
            onNext={() => {
              if (nextLesson) {
                soundEffects.stopAnimalSound();
                router.replace({ pathname: '/lessons/[id]', params: { id: nextLesson.id, dir: 'next' } });
              }
            }}
          />
        </Animated.View>

        {/* Finger Tracing Canvas (Opened on demand beneath main card) */}
        {canShowTracing && showTracing && (
          <View style={styles.tracingSection}>
            <TracingCanvas
              key={tracingKey}
              symbol={displayedSymbol}
              language={language}
              onTraceComplete={async (result) => {
                await handleFinish(result);
              }}
            />
          </View>
        )}
      </ScrollView>

      {/* Celebration popup when the lesson is completed */}
      <ConfettiCelebration visible={showCelebration && (traceResult?.stars ?? 3) >= 2} language={language} speakPraise={false} />
      {(() => {
        const stars = traceResult?.stars ?? 3;
        const coins = coinsForStars(stars);
        return (
          <KidModal
            visible={showCelebration}
            emblem={stars === 3 ? '🏆' : stars === 2 ? '🌟' : '👍'}
            tone="sun"
            sparkles
            onClose={() => setShowCelebration(false)}
            title={
              stars === 3
                ? language === 'gu' ? 'શાનદાર! ઉત્તમ કામ!' : language === 'hi' ? 'शानदार! उत्तम काम!' : 'Superb! Excellent!'
                : stars === 2
                ? language === 'gu' ? 'ખૂબ સરસ પ્રયાસ!' : language === 'hi' ? 'बहुत बढ़िया प्रयास!' : 'Great Effort!'
                : language === 'gu' ? 'સરસ શરૂઆત!' : language === 'hi' ? 'अच्छी शुरुआत!' : 'Good Start!'
            }
            subtitle={
              finishedViaTracing
                ? stars === 3
                  ? language === 'gu' ? 'તમે અક્ષર એકદમ સાચો ઘૂંટ્યો છે!' : language === 'hi' ? 'आपने बिल्कुल सही ट्रेस किया है!' : 'You traced it wonderfully!'
                  : language === 'gu' ? 'ફરીથી ઘૂંટો અને બધા ૩ સ્ટાર મેળવો!' : language === 'hi' ? 'फिर से ट्रेस करें और ३ स्टार पाएं!' : 'Trace again to earn all 3 stars!'
                : language === 'gu' ? 'તમે આ પાઠ પૂરો કર્યો!' : language === 'hi' ? 'आपने यह पाठ पूरा किया!' : 'You finished this lesson!'
            }
          >
            <View style={styles.celebrateStars}>
              {[1, 2, 3].map((i) => (
                <CelebrationStar key={`${showCelebration}-${i}`} index={i} earned={stars >= i} />
              ))}
            </View>

            <View style={styles.celebrateStatsRow}>
              {finishedViaTracing && traceResult ? (
                <View style={styles.celebratePct}>
                  <Text style={styles.celebratePctText}>
                    🎯{' '}
                    {language === 'gu'
                      ? `${toGujDigits(traceResult.pct)}%`
                      : language === 'hi'
                      ? `${toHiDigits(traceResult.pct)}%`
                      : `${traceResult.pct}%`}
                  </Text>
                </View>
              ) : null}
              <CoinCounter amount={coins} active={showCelebration} language={language} />
            </View>

            <View style={styles.celebrateActions}>
              <ClayButton
                tone="white"
                size="md"
                style={styles.celebrateBtn}
                icon={<Glyph name="replay" size={20} color={kidPalette.inkSoft} />}
                title={language === 'gu' ? 'ફરીથી' : language === 'hi' ? 'फिर से' : 'Retry'}
                textStyle={{ color: kidPalette.inkSoft }}
                onPress={() => {
                  // Retry THIS lesson (previously this jumped to the first lesson of the category).
                  setShowCelebration(false);
                  setTraceResult(null);
                  setSpeechFeedback({ status: 'idle', msg: '' });
                  audioService.stop();
                  soundEffects.stopAnimalSound();
                  if (finishedViaTracing) {
                    setTracingKey((prev) => prev + 1);
                    setShowTracing(true);
                  }
                  const audio = getLessonAudio(currentLesson, language);
                  speak(audio.text, audio.lang);
                }}
              />
              <ClayButton
                tone="mint"
                size="md"
                style={[styles.celebrateBtn, { flexGrow: 1.4 }]}
                title={
                  nextLesson
                    ? language === 'gu' ? 'આગળનો પાઠ' : language === 'hi' ? 'अगला पाठ' : 'Next Lesson'
                    : language === 'gu' ? 'પૂર્ણ' : language === 'hi' ? 'समाप्त' : 'All Done'
                }
                icon={<Glyph name={nextLesson ? 'next' : 'check'} size={20} color={kidTones.mint.onFill} />}
                textStyle={{ color: kidTones.mint.onFill }}
                onPress={() => {
                  setShowCelebration(false);
                  goToNext();
                }}
              />
            </View>
          </KidModal>
        );
      })()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  celebrateStars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
  },
  celebrateStar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderBottomWidth: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrateStarBig: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  celebrateStarEarned: {
    backgroundColor: '#FFF6D6',
    borderColor: '#FFB703',
    borderBottomColor: '#FB8500',
    shadowColor: '#FFB703',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 6,
  },
  celebrateStarEmpty: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    borderBottomColor: '#CBD5E1',
  },
  celebrateStarGlyph: {
    fontSize: 36,
  },
  celebrateStatsRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  celebratePct: {
    backgroundColor: '#E3F8FF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 2,
    borderColor: '#B5EAF7',
  },
  celebratePctText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0077B6',
  },
  celebrateCoins: {
    backgroundColor: '#FFB703',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderBottomWidth: 5,
    borderBottomColor: '#FB8500',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  celebrateCoinsText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#4A2500',
  },
  celebrateActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
    marginTop: 4,
  },
  celebrateBtn: {
    flexGrow: 1,
    flexBasis: 130,
  },
  lookupContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    padding: 24,
  },
  lookupEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  lookupText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
  },
  lookupButton: {
    marginTop: 24,
    minHeight: 56,
    paddingHorizontal: 28,
    borderRadius: 28,
    backgroundColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  lookupButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl + 32,
    alignItems: 'center',
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: radii.full,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0284C7',
    borderRadius: radii.full,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    minHeight: 300,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 4,
  },
  cardHeaderTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: spacing.md + 4,
    paddingVertical: 6,
    borderRadius: radii.full,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  cardHeaderTagText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B45309',
  },
  imageTouchable: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gkDetailVisualBox: {
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  mathDetailVisualBox: {
    width: '100%',
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  imageContainer: {
    width: 280,
    height: 230,
    maxWidth: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    marginVertical: spacing.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  realPhotoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  hugeSymbol: {
    fontSize: 140,
    fontWeight: '900',
    color: '#1E293B',
    marginVertical: spacing.md,
    textAlign: 'center',
    lineHeight: 175,
    paddingVertical: 8,
    includeFontPadding: true,
  },
  wordBox: {
    ...claySurface('sky', 1),
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    width: '90%',
  },
  exampleWord: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 46,
    paddingVertical: 4,
    includeFontPadding: true,
  },
  exampleMeaning: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 28,
    paddingVertical: 2,
    includeFontPadding: true,
  },
  sentenceBox: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    width: '100%',
  },
  sentenceLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
    marginBottom: 2,
  },
  sentenceText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 22,
  },
  phonicsTipPill: {
    marginTop: 8,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  phonicsTipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  funFactCard: {
    width: '90%',
    ...claySurface('sun', 1),
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: spacing.lg,
  },
  funFactHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  funFactTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#B45309',
  },
  funFactBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  funFactBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },
  funFactBody: {
    fontSize: 14,
    fontWeight: '600',
    color: '#78350F',
    lineHeight: 20,
  },
  tracingSection: {
    width: '100%',
    marginVertical: spacing.md,
    alignItems: 'center',
  },
  traceToggleBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 4,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  traceToggleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0284C7',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: spacing.md,
    gap: 12,
  },

  dualAudioButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginVertical: spacing.sm,
    width: '100%',
  },
  audioClayBtn: {
    flexGrow: 1,
    flexBasis: 150,
    maxWidth: 240,
  },
  audioClayTextCol: {
    marginLeft: 10,
    alignItems: 'flex-start',
    flexShrink: 1,
  },
  audioClayText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  audioClaySub: {
    fontSize: 11.5,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
  },
  detailFrame: {
    maxWidth: '100%',
    marginVertical: spacing.md,
    alignSelf: 'center',
  },
  audioActionCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioActionCircle: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  audioActionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
    textAlign: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: spacing.md,
    flexWrap: 'wrap',
  },
  animalSoundBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  animalSoundEmoji: {
    fontSize: 20,
  },
  animalSoundText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B45309',
  },
  onomatopoeiaBadge: {
    backgroundColor: '#FEF08A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EAB308',
  },
  onomatopoeiaText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#854D0E',
  },
  phonicsSoundBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    borderWidth: 1.5,
    borderColor: '#A855F7',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  phonicsSoundEmoji: {
    fontSize: 18,
  },
  phonicsPhonemeBadge: {
    backgroundColor: '#E9D5FF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C084FC',
  },
  phonicsPhonemeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#7E22CE',
  },
  phonicsSoundText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6B21A8',
  },
  speechPracticeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
    borderColor: '#0284C7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  speechPracticeBtnActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  speechPracticeEmoji: {
    fontSize: 18,
  },
  speechPracticeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0284C7',
  },
  speechPracticeTextActive: {
    color: '#DC2626',
  },
  speechBubble: {
    marginTop: spacing.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    maxWidth: '92%',
    alignItems: 'center',
  },
  speechBubbleListening: {
    backgroundColor: '#EEF2FF',
    borderColor: '#818CF8',
  },
  speechBubbleSuccess: {
    backgroundColor: '#DCFCE7',
    borderColor: '#22C55E',
  },
  speechBubbleTryAgain: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  speechBubbleText: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  speechBubbleTextListening: {
    color: '#4338CA',
  },
  speechBubbleTextSuccess: {
    color: '#15803D',
  },
  speechBubbleTextTryAgain: {
    color: '#B45309',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: spacing.xl,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    borderWidth: 2,
    borderColor: '#EEF2FF',
  },
  modalStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: spacing.md,
  },
  modalStarBubble: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalStarBubbleEarned: {
    backgroundColor: '#FEF3C7',
    borderWidth: 2.5,
    borderColor: '#F59E0B',
    transform: [{ scale: 1.05 }],
  },
  modalStarBubbleEmpty: {
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  modalStarGlyph: {
    fontSize: 34,
  },
  modalStarGlyphEmpty: {
    fontSize: 34,
    opacity: 0.35,
  },
  modalScorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: spacing.md,
  },
  modalScorePct: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
  },
  modalCoinBadge: {
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  modalCoinBadgeText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#854D0E',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  modalDesc: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
    lineHeight: 20,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: spacing.xs,
  },
  modalRetryBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalRetryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#475569',
  },
  modalNextBtn: {
    flex: 1.25,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#059669',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalNextBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
