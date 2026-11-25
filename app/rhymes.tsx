import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Animated, Easing } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { kidTones, kidPalette, kidBackdrops, kidRadii, clayShadow, toneAt, KidTone } from '../src/theme/kidTheme';
import { useApp } from '../src/context/AppContext';
import { Header } from '../src/components/Header';
import { soundEffects } from '../src/services/soundEffects';
import { audioService } from '../src/services/audioService';
import { rhymeAudioService } from '../src/services/rhymeAudioService';
import { apiService } from '../src/services/apiService';
import {
  RHYMES_DATA,
  RhymeItem,
  RhymeCategoryLang,
  getRhymeDisplayTitleSecondary,
  getRhymeDisplaySubtitle,
} from '../src/data/rhymesData';
import { ClayButton } from '../src/components/clay';
import { FloatingSparkles, SpeechBubble, Glyph, useKidDialog } from '../src/components/fun';
import { formatNumberDigits } from '../src/utils/languageData';
import { AppGlobalBackground } from '../src/components/common/AppGlobalBackground';
import { GoldCoinStack } from '../src/components/common/GoldCoinIcon';
import * as Art from '../src/components/art3d/Art3D';
import { getRhyme3DVisual } from '../src/utils/rhymeRenders';
import { Remote3DImage } from '../src/components/common/Remote3DImage';

export type { RhymeItem, RhymeCategoryLang, RhymeLine } from '../src/data/rhymesData';

const useNative = Platform.OS !== 'web';

const LANG_TABS: { id: RhymeCategoryLang; emoji: string; label: string; tone: KidTone }[] = [
  { id: 'en', emoji: '🇬🇧', label: 'English', tone: 'sky' },
  { id: 'gu', emoji: '🪔', label: 'ગુજરાતી', tone: 'sun' },
  { id: 'hi', emoji: '🌸', label: 'हिंदी', tone: 'coral' },
];

/** Bouncing equaliser bars: the "rhythm indicator". Still when paused. */
const RhythmBars: React.FC<{ playing: boolean; color: string }> = ({ playing, color }) => {
  const bars = useRef([0, 1, 2, 3, 4].map(() => new Animated.Value(0.3))).current;
  useEffect(() => {
    if (!playing) {
      bars.forEach((b) => Animated.timing(b, { toValue: 0.3, duration: 200, useNativeDriver: useNative }).start());
      return;
    }
    const loops = bars.map((b, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(b, { toValue: 1, duration: 260 + i * 60, easing: Easing.out(Easing.quad), useNativeDriver: useNative }),
          Animated.timing(b, { toValue: 0.25, duration: 260 + i * 60, easing: Easing.in(Easing.quad), useNativeDriver: useNative }),
        ])
      )
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [playing, bars]);
  return (
    <View style={styles.rhythmRow} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {bars.map((b, i) => (
        <Animated.View key={i} style={[styles.rhythmBar, { backgroundColor: color, transform: [{ scaleY: b }] }]} />
      ))}
    </View>
  );
};

/** The rhyme's star emoji: dances while playing, gently breathes when paused. */
const StageStar: React.FC<{ rhymeId?: string; emoji: string; playing: boolean }> = ({ rhymeId, emoji, playing }) => {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: playing ? 380 : 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: useNative }),
        Animated.timing(t, { toValue: 0, duration: playing ? 380 : 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: useNative }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [playing, t]);
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [0, playing ? -18 : -6] });
  const rotate = t.interpolate({ inputRange: [0, 1], outputRange: playing ? ['-10deg', '10deg'] : ['0deg', '0deg'] });
  const scale = t.interpolate({ inputRange: [0, 1], outputRange: [1, playing ? 1.12 : 1.04] });

  const visual3D = rhymeId ? getRhyme3DVisual(rhymeId) : null;
  if (visual3D) {
    return (
      <Animated.View style={{ transform: [{ translateY }, { rotate }, { scale }], alignItems: 'center', justifyContent: 'center' }}>
        <Remote3DImage
          source={visual3D}
          style={{ width: 120, height: 120 }}
          fallback={<Text style={styles.stageStar}>{emoji}</Text>}
        />
      </Animated.View>
    );
  }

  return <Animated.Text style={[styles.stageStar, { transform: [{ translateY }, { rotate }, { scale }] }]}>{emoji}</Animated.Text>;
};

export default function RhymesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ lang?: string; subjectId?: string }>();
  const { addCoins, speak, language, completeLesson, progress } = useApp();
  const { dialog, notify, confirm } = useKidDialog();

  const appLang = language || 'en';

  // Selected Rhyme Language Category (Defaults to 'en' when coming from English subject or when lang=en)
  const [selectedLang, setSelectedLang] = useState<RhymeCategoryLang>(() => {
    if (params.lang === 'en' || params.lang === 'gu' || params.lang === 'hi') {
      return params.lang as RhymeCategoryLang;
    }
    return 'en';
  });

  const [activeRhymeIndex, setActiveRhymeIndex] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);

  // Sync selected category if route param changes
  useEffect(() => {
    if (params.lang === 'en' || params.lang === 'gu' || params.lang === 'hi') {
      setSelectedLang(params.lang as RhymeCategoryLang);
      setActiveRhymeIndex(0);
      setCurrentLineIndex(0);
      isPlayingRef.current = false;
      setIsPlaying(false);
      audioService.stop();
      rhymeAudioService.stop();
    }
  }, [params.lang]);

  // Rhymes catalogue: bundled data renders instantly, then the Django API (/api/rhymes/) replaces it.
  const [rhymes, setRhymes] = useState<RhymeItem[]>(RHYMES_DATA);
  useEffect(() => {
    let cancelled = false;
    apiService.fetchRhymes().then((fetched) => {
      // Don't swap lyrics out from under a song that is already playing.
      if (!cancelled && fetched.length > 0 && !isPlayingRef.current) setRhymes(fetched);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Filter rhymes for the currently selected language category
  const langRhymes = rhymes.filter((r) => r.categoryLang === selectedLang);
  // Never show an empty language tab: fall back to bundled rhymes for that language.
  const filteredRhymes = langRhymes.length > 0 ? langRhymes : RHYMES_DATA.filter((r) => r.categoryLang === selectedLang);
  const activeRhyme = filteredRhymes[activeRhymeIndex] || filteredRhymes[0] || RHYMES_DATA[0];
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stop playback when unmounting or switching rhyme/category
  useEffect(() => {
    const t = timerRef.current;
    return () => {
      isPlayingRef.current = false;
      if (t) clearTimeout(t);
      audioService.stop();
      rhymeAudioService.stop();
    };
  }, []);

  // Silence all audio immediately when this screen loses focus or user navigates to another page
  useFocusEffect(
    useCallback(() => {
      return () => {
        isPlayingRef.current = false;
        setIsPlaying(false);
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        audioService.stop();
        soundEffects.stopAnimalSound();
        rhymeAudioService.stop();
      };
    }, [])
  );

  // Synchronize playback status with karaoke lyrics and reward on completion
  useEffect(() => {
    const unsub = rhymeAudioService.addListener((status) => {
      if (status.rhymeId && status.rhymeId !== activeRhyme.id) {
        return;
      }
      setIsPlaying(status.isPlaying);
      isPlayingRef.current = status.isPlaying;
      if (status.isPlaying && typeof status.currentLineIndex === 'number') {
        setCurrentLineIndex(status.currentLineIndex);
      }
      if (status.didJustFinish) {
        setIsPlaying(false);
        isPlayingRef.current = false;
        try {
          soundEffects.playTadaaa();
          const cleanId = activeRhyme.id.replace(/^rhyme-/, '');
          const rhymeLessonId = `rhyme-${cleanId}`;
          if (!progress.completedLessons?.includes(rhymeLessonId)) {
            addCoins(10);
          }
          completeLesson(rhymeLessonId);
        } catch {}
      }
    });
    return unsub;
  }, [activeRhyme.id, addCoins, completeLesson, progress.completedLessons]);

  const handleSelectLangCategory = (cat: RhymeCategoryLang) => {
    soundEffects.playBubblePop();
    isPlayingRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    audioService.stop();
    rhymeAudioService.stop();
    setIsPlaying(false);
    setSelectedLang(cat);
    setActiveRhymeIndex(0);
    setCurrentLineIndex(0);
  };

  const handleSelectRhyme = (index: number) => {
    soundEffects.playBubblePop();
    isPlayingRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    audioService.stop();
    rhymeAudioService.stop();
    setIsPlaying(false);
    setActiveRhymeIndex(index);
    setCurrentLineIndex(0);
  };

  const handleComingSoon = () => {
    soundEffects.playBubblePop();
    notify({
      emblem: '🎶',
      tone: 'sun',
      title:
        appLang === 'gu'
          ? 'ટૂંક સમયમાં આવી રહ્યું છે!'
          : appLang === 'hi'
            ? 'जल्द ही आ रहा है!'
            : 'Coming Soon!',
      message:
        appLang === 'gu'
          ? 'અસલી સંગીતમય બાળગીતો અને મ્યુઝિક આગામી નવા અપડેટમાં ઉપલબ્ધ થશે. જોડાયેલા રહો! 🎵'
          : appLang === 'hi'
            ? 'असली संगीतमय बालगीत और संगीत आगामी नए अपडेट में उपलब्ध होंगे। जुड़े रहें! 🎵'
            : 'Full studio singing songs with real musical melodies will be released in an upcoming update! Stay tuned. 🎵',
      okText: appLang === 'gu' ? 'સમજાઈ ગયું 👍' : appLang === 'hi' ? 'समझ गया 👍' : 'Got it 👍',
    });
  };

  const hasStudioAudio = Boolean(activeRhyme.audioUrl);

  const handleTogglePlaySong = async () => {
    soundEffects.playBubblePop();
    if (isPlaying) {
      rhymeAudioService.pause();
      setIsPlaying(false);
      isPlayingRef.current = false;
      return;
    }

    if (!activeRhyme.audioUrl) {
      handleComingSoon();
      return;
    }

    setIsPlaying(true);
    isPlayingRef.current = true;
    const outcome = await rhymeAudioService.play(activeRhyme);
    if (outcome === 'started') return;
    // A newer tap (another song, tab switch, leaving the screen) replaced this request:
    // that screen state already owns isPlaying, so don't touch it or show any dialog.
    if (outcome === 'superseded') return;
    setIsPlaying(false);
    isPlayingRef.current = false;
    if (outcome === 'network-error') {
      handlePlaybackNetworkError();
    } else {
      handleComingSoon();
    }
  };

  /** Offline / slow network / server down: say so, and offer a retry (never "Coming Soon"). */
  const handlePlaybackNetworkError = () => {
    confirm({
      emblem: '📶',
      tone: 'sky',
      title: tr({
        gu: 'ગીત લોડ ન થયું',
        hi: 'गीत लोड नहीं हुआ',
        en: "Couldn't load the song",
      }),
      message: tr({
        gu: 'ઇન્ટરનેટ કનેક્શન તપાસો અને ફરી પ્રયાસ કરો. ત્યાં સુધી તમે શબ્દો સાથે વાંચી શકો છો! 📖',
        hi: 'इंटरनेट कनेक्शन जांचें और फिर से कोशिश करें। तब तक आप शब्दों के साथ पढ़ सकते हैं! 📖',
        en: 'Please check the internet connection and try again. You can still read along with the words! 📖',
      }),
      confirmText: tr({ gu: 'ફરી પ્રયાસ કરો 🔄', hi: 'फिर से कोशिश करें 🔄', en: 'Try again 🔄' }),
      cancelText: tr({ gu: 'બંધ કરો', hi: 'बंद करें', en: 'Close' }),
      onConfirm: () => {
        void handleTogglePlaySong();
      },
    });
  };

  const jumpToLine = (idx: number) => {
    soundEffects.playBubblePop();
    setCurrentLineIndex(idx);
    if (activeRhyme.cueTimestamps && activeRhyme.cueTimestamps[idx] !== undefined && isPlaying) {
      rhymeAudioService.seek(activeRhyme.cueTimestamps[idx]);
    }
  };

  const handlePreviousLine = () => {
    soundEffects.playBubblePop();
    const newIdx = Math.max(0, currentLineIndex - 1);
    setCurrentLineIndex(newIdx);
    if (activeRhyme.cueTimestamps && activeRhyme.cueTimestamps[newIdx] !== undefined && isPlaying) {
      rhymeAudioService.seek(activeRhyme.cueTimestamps[newIdx]);
    }
  };

  const handleNextLine = () => {
    soundEffects.playBubblePop();
    const newIdx = Math.min(activeRhyme.lines.length - 1, currentLineIndex + 1);
    setCurrentLineIndex(newIdx);
    if (activeRhyme.cueTimestamps && activeRhyme.cueTimestamps[newIdx] !== undefined && isPlaying) {
      rhymeAudioService.seek(activeRhyme.cueTimestamps[newIdx]);
    }
  };

  const handleBack = () => {
    soundEffects.playBubblePop();
    isPlayingRef.current = false;
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    audioService.stop();
    rhymeAudioService.stop();
    if (Platform.OS === 'web') {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
      try {
        if (router.canGoBack()) {
          router.back();
          setTimeout(() => {
            if (typeof window !== 'undefined' && window.location.pathname + window.location.search === currentPath) {
              router.replace('/subjects?subjectId=english');
            }
          }, 150);
          return;
        }
      } catch { }
      router.replace('/subjects?subjectId=english');
      return;
    }

    try {
      if (router.canGoBack()) {
        router.back();
        return;
      }
    } catch { }
    router.replace('/subjects?subjectId=english');
  };

  const headerTitle =
    selectedLang === 'en'
      ? appLang === 'gu'
        ? 'અંગ્રેજી બાળગીતો'
        : appLang === 'hi'
        ? 'अंग्रेजी बालगीत'
        : 'English Nursery Rhymes'
      : selectedLang === 'gu'
      ? 'ગુજરાતી બાળગીતો'
      : 'हिंदी बालगीत';

  // Pop the karaoke line each time it changes.
  const linePop = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    linePop.setValue(0.88);
    Animated.spring(linePop, { toValue: 1, friction: 4, tension: 130, useNativeDriver: useNative }).start();
  }, [currentLineIndex, activeRhyme.id, linePop]);

  const langTab = LANG_TABS.find((l) => l.id === selectedLang) || LANG_TABS[0];
  const stageTone: KidTone = toneAt(activeRhymeIndex + (selectedLang === 'gu' ? 1 : selectedLang === 'hi' ? 2 : 0));
  const stageSpec = kidTones[stageTone];
  const currentLine = activeRhyme.lines[currentLineIndex];
  const prevLine = activeRhyme.lines[currentLineIndex - 1];
  const nextLine = activeRhyme.lines[currentLineIndex + 1];
  const tr = (s: { gu: string; hi: string; en: string }) => (appLang === 'gu' ? s.gu : appLang === 'hi' ? s.hi : s.en);

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppGlobalBackground id="rhymesBgGrad" />
      {dialog}
      <Header title={headerTitle} showBack={true} onBack={handleBack} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
        {/* Language tabs */}
        <View style={styles.langTabBar}>
          {LANG_TABS.map((tab) => {
            const active = tab.id === selectedLang;
            return (
              <ClayButton
                key={tab.id}
                tone={active ? tab.tone : 'white'}
                size="sm"
                sound={false}
                onPress={() => handleSelectLangCategory(tab.id)}
                icon={<Text style={styles.langTabEmoji}>{tab.emoji}</Text>}
                title={tab.label}
                textStyle={!active ? { color: kidTones[tab.tone].text } : undefined}
                style={styles.langTabBtn}
              />
            );
          })}
        </View>

        {/* Song picker */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.songsRow}
          nestedScrollEnabled={true}
          directionalLockEnabled={true}
          keyboardShouldPersistTaps="handled"
        >
          {filteredRhymes.map((rhyme, idx) => {
            const isSelected = activeRhymeIndex === idx;
            const tone = toneAt(idx);
            const spec = kidTones[tone];
            // Strip emoji using explicit script ranges (Hermes-safe; no \p{} escapes).
            const shortTitle = rhyme.title.replace(/[^A-Za-z0-9ऀ-ॿ઀-૿\s,'-]/g, '').trim().split(',')[0];
            const rhymeVisual = getRhyme3DVisual(rhyme.id);
            return (
              <Pressable
                key={rhyme.id}
                onPress={() => handleSelectRhyme(idx)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={rhyme.title}
                style={[
                  styles.songTile,
                  {
                    backgroundColor: isSelected ? spec.fill : kidPalette.surface,
                    borderColor: isSelected ? spec.fill : kidPalette.softBorder,
                    borderBottomColor: isSelected ? spec.edge : '#E5E7EB',
                  },
                  Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                ]}
              >
                <View style={[styles.songEmojiBubble, { backgroundColor: isSelected ? 'rgba(255,255,255,0.3)' : spec.tint }]}>
                  {rhymeVisual ? (
                    <Remote3DImage
                      source={rhymeVisual}
                      style={{ width: 44, height: 44 }}
                      fallback={<Text style={styles.songEmoji}>{rhyme.themeEmoji}</Text>}
                    />
                  ) : (
                    <Text style={styles.songEmoji}>{rhyme.themeEmoji}</Text>
                  )}
                </View>
                <Text style={[styles.songTitle, { color: isSelected ? spec.onFill : kidPalette.inkSoft }]} numberOfLines={2}>
                  {shortTitle || rhyme.title}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Coming Soon or Studio Singing Banner */}
        <Pressable
          style={[styles.comingSoonBanner, clayShadow(2), Platform.OS === 'web' && ({ cursor: 'pointer' } as any)]}
          onPress={hasStudioAudio ? handleTogglePlaySong : handleComingSoon}
          accessibilityRole="button"
          accessibilityLabel="Singing Rhymes Banner"
        >
          <View style={styles.comingSoonBadge}>
            <Glyph name="sparkle" size={13} color="#854D0E" strokeWidth={2.8} />
            <Text style={styles.comingSoonBadgeText}>
              {hasStudioAudio
                ? tr({ gu: 'અસલી ગીત ઉપલબ્ધ', hi: 'असली गीत उपलब्ध', en: 'STUDIO AUDIO' })
                : tr({ gu: 'ટૂંક સમયમાં આવી રહ્યું છે', hi: 'जल्द आ रहा है', en: 'COMING SOON' })}
            </Text>
          </View>
          <Text style={styles.comingSoonTitle}>
            {hasStudioAudio
              ? tr({
                  gu: '🎶 અસલી સંગીતમય બાળગીતો સાથે ગાઓ!',
                  hi: '🎶 असली संगीतमय बालगीत के साथ गाएं!',
                  en: '🎶 Real Musical Singing Songs!',
                })
              : tr({
                  gu: '✨ અસલી સંગીતમય બાળગીતો ટૂંક સમયમાં!',
                  hi: '✨ असली संगीतमय बालगीत जल्द ही!',
                  en: '✨ Real Singing Rhymes & Music Coming Soon!',
                })}
          </Text>
          <Text style={styles.comingSoonDesc}>
            {hasStudioAudio
              ? tr({
                  gu: 'નીચે આપેલ "ગીત વગાડો" બટન દબાવો અને સંગીત સાથે મજેદાર બાળગીતો માણો! 🎵',
                  hi: 'नीचे दिए गए "गीत बजाएं" बटन को दबाएं और संगीत के साथ प्यारे बालगीत सुनें! 🎵',
                  en: 'Press "Play Song" below to enjoy authentic musical nursery rhymes with synchronized karaoke lyrics! 🎵',
                })
              : tr({
                  gu: 'બાળકો માટે અસલી સંગીત અને મીઠા અવાજ સાથેના ગીતો આગામી અપડેટમાં ઉપલબ્ધ થશે. જોડાયેલા રહો!',
                  hi: 'बच्चों के लिए असली संगीत और मधुर आवाज के साथ बालगीत नए अपडेट में उपलब्ध होंगे। बने रहें!',
                  en: 'Full studio singing songs with real musical melodies will be released in an upcoming update! Stay tuned.',
                })}
          </Text>
        </Pressable>

        {/* ===== Performance stage ===== */}
        <View style={[styles.stageCard, { borderBottomColor: stageSpec.edge }, clayShadow(3)]}>
          <View style={styles.stage}>
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
              <Svg width="100%" height="100%">
                <Defs>
                  <LinearGradient id={`rhyme-stage-${activeRhyme.id}`} x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor={stageSpec.fill} stopOpacity="1" />
                    <Stop offset="100%" stopColor={stageSpec.edge} stopOpacity="1" />
                  </LinearGradient>
                </Defs>
                <Rect width="100%" height="100%" fill={`url(#rhyme-stage-${activeRhyme.id})`} />
              </Svg>
            </View>
            {/* Scalloped curtain */}
            <View pointerEvents="none" style={styles.curtain}>
              {Array.from({ length: 14 }).map((_, i) => (
                <View key={i} style={[styles.curtainScallop, { backgroundColor: i % 2 === 0 ? kidTones.coral.fill : kidTones.coral.edge }]} />
              ))}
            </View>
            <FloatingSparkles emojis={['🎵', '🎶', '✨', '⭐']} count={8} seed={activeRhymeIndex + 7} size={20} opacity={0.9} />
            <View style={styles.spotlight} />
            <StageStar rhymeId={activeRhyme.id} emoji={activeRhyme.themeEmoji} playing={isPlaying} />
            <View style={styles.stageFloor} />
            <View style={styles.stageTitleWrap}>
              <Text style={styles.stageTitle} numberOfLines={2}>
                {activeRhyme.title}
              </Text>
              {Boolean(getRhymeDisplayTitleSecondary(activeRhyme, appLang)) && (
                <Text style={styles.stageSubtitle} numberOfLines={1}>
                  {getRhymeDisplayTitleSecondary(activeRhyme, appLang)}
                </Text>
              )}
            </View>
          </View>

          {/* Karaoke */}
          <View style={styles.karaoke}>
            <View style={styles.karaokeTopRow}>
              <RhythmBars playing={isPlaying} color={stageSpec.fill} />
              <Text style={styles.lineCounter}>
                {formatNumberDigits(currentLineIndex + 1, appLang)} / {formatNumberDigits(activeRhyme.lines.length, appLang)}
              </Text>
            </View>

            {prevLine ? (
              <Text style={styles.fadedLine} numberOfLines={1}>
                {prevLine.main}
              </Text>
            ) : null}

            <Animated.View style={{ transform: [{ scale: linePop }] }}>
              <SpeechBubble tone={stageTone} pointer="none">
                <Text style={[styles.karaokeLine, { color: stageSpec.text }]}>{currentLine?.main}</Text>
                {Boolean(currentLine && getRhymeDisplaySubtitle(currentLine, activeRhyme.categoryLang, appLang)) && (
                  <Text style={styles.karaokeSub}>
                    {getRhymeDisplaySubtitle(currentLine!, activeRhyme.categoryLang, appLang)}
                  </Text>
                )}
              </SpeechBubble>
            </Animated.View>

            {nextLine ? (
              <Text style={styles.fadedLine} numberOfLines={1}>
                {nextLine.main}
              </Text>
            ) : null}

            <View style={styles.lineDots}>
              {activeRhyme.lines.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.lineDot,
                    i < currentLineIndex && { backgroundColor: stageSpec.tintBorder },
                    i === currentLineIndex && { backgroundColor: stageSpec.fill, width: 20 },
                  ]}
                />
              ))}
            </View>

            {/* Chunky arcade controls */}
            <View style={styles.controlsRow}>
              <ClayButton tone="white" size="lg" sound={false} onPress={handlePreviousLine} accessibilityLabel="Previous line" style={styles.sideCtrl}>
                <Glyph name="back" size={24} color={kidPalette.ink} strokeWidth={3.4} />
              </ClayButton>
              <ClayButton
                tone={isPlaying ? 'coral' : 'mint'}
                size="lg"
                sound={false}
                onPress={handleTogglePlaySong}
                style={styles.playCtrl}
                title={
                  isPlaying
                    ? appLang === 'gu'
                      ? '⏸️ રોકો'
                      : appLang === 'hi'
                        ? '⏸️ रोकें'
                        : '⏸️ Pause'
                    : appLang === 'gu'
                      ? '▶️ ગીત વગાડો'
                      : appLang === 'hi'
                        ? '▶️ गीत बजाएं'
                        : '▶️ Play Song 🎵'
                }
              />
              <ClayButton tone="white" size="lg" sound={false} onPress={handleNextLine} accessibilityLabel="Next line" style={styles.sideCtrl}>
                <Glyph name="next" size={24} color={kidPalette.ink} strokeWidth={3.4} />
              </ClayButton>
            </View>
          </View>
        </View>

        {/* All lyrics: tap any line to hear it */}
        <View style={[styles.lyricsCard, clayShadow(1)]}>
          <Text style={styles.lyricsHeading}>
            {tr({ gu: 'આખું ગીત', hi: 'पूरा गीत', en: 'All the words' })}
          </Text>
          {activeRhyme.lines.map((line, idx) => {
            const isCurrent = idx === currentLineIndex;
            return (
              <Pressable
                key={`line-${idx}`}
                style={[
                  styles.lineRow,
                  isCurrent && { backgroundColor: stageSpec.tint, borderColor: stageSpec.tintBorder },
                  Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                ]}
                accessibilityRole="button"
                onPress={() => {
                  jumpToLine(idx);
                }}
              >
                <View style={[styles.lineNum, { backgroundColor: isCurrent ? stageSpec.fill : '#F1F5F9' }]}>
                  <Text style={[styles.lineNumText, { color: isCurrent ? stageSpec.onFill : kidPalette.inkMuted }]}>
                    {formatNumberDigits(idx + 1, appLang)}
                  </Text>
                </View>
                <View style={styles.lineContent}>
                  <Text style={[styles.linePrimary, isCurrent && { color: stageSpec.text }]}>{line.main}</Text>
                  {Boolean(getRhymeDisplaySubtitle(line, activeRhyme.categoryLang, appLang)) && (
                    <Text style={styles.lineSub}>
                      {getRhymeDisplaySubtitle(line, activeRhyme.categoryLang, appLang)}
                    </Text>
                  )}
                </View>
                {isCurrent && <Art.MusicArt size={26} />}
              </Pressable>
            );
          })}
        </View>

        {/* Reward */}
        <View style={styles.rewardPill}>
          <GoldCoinStack size={22} />
          <Text style={styles.rewardText}>
            {tr({
              gu: 'આખું ગીત સાંભળીને +૧૦ ગોલ્ડ કોઈન મેળવો! ⭐',
              hi: 'पूरा गीत सुनकर +१० सिक्के अर्जित करें! ⭐',
              en: 'Listen to the full song to earn +10 Gold Coins! ⭐',
            })}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    padding: 16,
    paddingBottom: 64,
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
    gap: 16,
  },
  comingSoonBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: kidRadii.card,
    borderWidth: 2,
    borderColor: '#FDE68A',
    borderBottomWidth: 6,
    borderBottomColor: '#F59E0B',
    padding: 16,
    gap: 8,
  },
  comingSoonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF08A',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FDE047',
    alignSelf: 'flex-start',
  },
  comingSoonBadgeText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#854D0E',
    letterSpacing: 0.5,
  },
  comingSoonTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#78350F',
  },
  comingSoonDesc: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
    lineHeight: 18,
  },
  langTabBar: {
    flexDirection: 'row',
    gap: 10,
  },
  langTabBtn: {
    flex: 1,
  },
  langTabEmoji: {
    fontSize: 18,
  },
  songsRow: {
    gap: 12,
    paddingVertical: 4,
    paddingRight: 8,
  },
  songTile: {
    width: 112,
    minHeight: 124,
    borderRadius: kidRadii.card,
    borderWidth: 2,
    borderBottomWidth: 6,
    padding: 10,
    alignItems: 'center',
    gap: 8,
  },
  songEmojiBubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  songEmoji: {
    fontSize: 32,
  },
  songTitle: {
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  stageCard: {
    backgroundColor: kidPalette.surface,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: kidPalette.softBorder,
    borderBottomWidth: 8,
    overflow: 'hidden',
  },
  stage: {
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  curtain: {
    position: 'absolute',
    top: -14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  curtainScallop: {
    width: 44,
    height: 36,
    borderRadius: 22,
    marginHorizontal: -2,
  },
  spotlight: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  stageStar: {
    fontSize: 96,
  },
  stageFloor: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: 'rgba(0,0,0,0.16)',
  },
  stageTitleWrap: {
    position: 'absolute',
    bottom: 10,
    left: 14,
    right: 14,
    alignItems: 'center',
  },
  stageTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  stageSubtitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.92)',
  },
  karaoke: {
    padding: 16,
    gap: 10,
  },
  karaokeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rhythmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 30,
  },
  rhythmBar: {
    width: 8,
    height: 30,
    borderRadius: 4,
  },
  lineCounter: {
    fontSize: 14,
    fontWeight: '900',
    color: kidPalette.inkMuted,
  },
  fadedLine: {
    fontSize: 15,
    fontWeight: '700',
    color: kidPalette.inkFaint,
    textAlign: 'center',
  },
  karaokeLine: {
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 36,
  },
  karaokeSub: {
    fontSize: 15,
    fontWeight: '700',
    color: kidPalette.inkMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 22,
  },
  lineDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 2,
  },
  lineDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#E5E7EB',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  sideCtrl: {
    width: 68,
  },
  playCtrl: {
    flex: 1,
  },
  lyricsCard: {
    backgroundColor: kidPalette.surface,
    borderRadius: kidRadii.card,
    borderWidth: 2,
    borderColor: kidPalette.softBorder,
    padding: 14,
    gap: 6,
  },
  lyricsHeading: {
    fontSize: 17,
    fontWeight: '900',
    color: kidPalette.ink,
    marginBottom: 4,
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 52,
  },
  lineNum: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineNumText: {
    fontSize: 14,
    fontWeight: '900',
  },
  lineContent: {
    flex: 1,
  },
  linePrimary: {
    fontSize: 16,
    fontWeight: '800',
    color: kidPalette.inkSoft,
    lineHeight: 23,
  },
  lineSub: {
    fontSize: 13,
    fontWeight: '600',
    color: kidPalette.inkMuted,
    marginTop: 2,
  },
  lineNote: {
    fontSize: 20,
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: kidTones.sun.fill,
    borderRadius: kidRadii.pill,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 6,
    borderBottomColor: kidTones.sun.edge,
  },
  rewardEmoji: {
    fontSize: 22,
  },
  rewardText: {
    flex: 1,
    fontSize: 15.5,
    fontWeight: '900',
    color: kidTones.sun.onFill,
  },
});
