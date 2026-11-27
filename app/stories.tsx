import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  View, Text, StyleSheet, ScrollView, Platform, Animated, Easing, Pressable, useWindowDimensions, Modal,
  TextInput, TouchableOpacity, Image,
  type DimensionValue,
  type ImageStyle
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Defs, LinearGradient, Stop, Rect, Path } from 'react-native-svg';
import { Header } from '../src/components/Header';
import { BottomNav } from '../src/components/BottomNav';
import { useApp } from '../src/context/AppContext';
import { soundEffects } from '../src/services/soundEffects';
import { audioService } from '../src/services/audioService';
import { apiService } from '../src/services/apiService';
import { WordGlowReader } from '../src/components/common/WordGlowReader';
import { formatChildName } from '../src/utils/nameTransliterator';
import { GoldCoinIcon, GoldCoinStack } from '../src/components/common/GoldCoinIcon';
import {
  MAGIC_COMPANIONS,
  MAGIC_THEMES,
  MAGIC_TOOLS,
  generatePersonalizedStory,
} from '../src/utils/magicStoryGenerator';
import { ConfettiCelebration } from '../src/components/common/ConfettiCelebration';
import { ClayButton } from '../src/components/clay';
import { FloatingSparkles, SpeechBubble, CornerRibbon, Glyph, useKidDialog } from '../src/components/fun';
import { STORIES_DATA, StoryBook, StoryScene, StoryChoiceOption, type StoryChoice } from '../src/data/storiesData';
import { getStoryReadingMinutes, getStoryDifficulty, getStoryCategoryMeta } from '../src/utils/storyMeta';
import { StoryIllustration } from '../src/components/story/StoryIllustration';
import { composeCover, getSceneComposition, resolveStoryCover, resolveStoryScene } from '../src/utils/storyArt';
import { MagicStoryWizard, MagicStoryChoice } from '../src/components/story/MagicStoryWizard';
import { STORY_IMAGE_MAP, MAGIC_UI_ART } from '../src/utils/imageHelper';
import { HorizontalScrollRow } from '../src/components/common/HorizontalScrollRow';
import { resolveOfflineMediaSource } from '../src/utils/remoteAssets';
import { formatNumberDigits } from '../src/utils/languageData';
import { kidTones, kidPalette, kidBackdrops, kidRadii, clayShadow, toneAt, KidTone } from '../src/theme/kidTheme';
import { AppGlobalBackground } from '../src/components/common/AppGlobalBackground';
import { SkeletonGrid } from '../src/components/common/SkeletonCard';
import { spacing, radii, shadows } from '../src/theme/spacing';
import { AppLanguage } from '../src/types';
import * as Art from '../src/components/art3d/Art3D';
import { VolumeIcon } from '../src/components/fun';
import { Remote3DImage } from '../src/components/common/Remote3DImage';
import { webStyle } from '../src/utils/webStyle';
import type { ImageAsset } from '../src/utils/remoteAssets';

const useNative = Platform.OS !== 'web';

function getStoryTitle(story: StoryBook, lang: string): string {
  if (lang === 'en') return story.titleEn;
  if (lang === 'hi') return story.titleHi || story.titleGu;
  return story.titleGu;
}

function getStoryMoral(story: StoryBook, lang: string): string {
  if (lang === 'en') return story.moralEn;
  if (lang === 'hi') return story.moralHi || story.moralGu;
  return story.moralGu;
}

function getSceneText(scene: StoryScene, lang: string): string {
  if (lang === 'en') return scene.textEn;
  if (lang === 'hi') return scene.textHi || scene.textGu;
  return scene.textGu;
}

function getChoiceQuestion(choice: StoryChoice | undefined, lang: string): string {
  if (!choice) return '';
  if (lang === 'en') return choice.questionEn;
  if (lang === 'hi') return choice.questionHi || choice.questionGu;
  return choice.questionGu;
}

function getChoiceOptionText(opt: StoryChoiceOption, lang: string): string {
  if (lang === 'en') return opt.textEn;
  if (lang === 'hi') return opt.textHi || opt.textGu;
  return opt.textGu;
}

function getChoiceFeedback(opt: StoryChoiceOption, lang: string): string {
  if (lang === 'en') return opt.feedbackEn;
  if (lang === 'hi') return opt.feedbackHi || opt.feedbackGu;
  return opt.feedbackGu;
}

type Tri = { gu: string; hi: string; en: string };
const tr = (lang: string, s: Tri) => (lang === 'gu' ? s.gu : lang === 'hi' ? s.hi : s.en);

/** Two-stop soft gradient backdrop (works on web + native via react-native-svg). */
const GradientStage: React.FC<{ id: string; from: string; to: string; radius?: number }> = ({ id, from, to, radius = 0 }) => (
  <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden' }]}>
    <Svg width="100%" height="100%">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0.4" y2="1">
          <Stop offset="0%" stopColor={from} stopOpacity="1" />
          <Stop offset="100%" stopColor={to} stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  </View>
);

/** Visual framing offsets for cover art so characters are centered and not cropped at edges */
/** objectPosition is web-only (react-native-web); native ignores it. */
const STORY_COVER_FRAMING: Record<string, ImageStyle & { objectPosition?: string }> = {
  'story-crow': { objectPosition: 'center 68%', transform: [{ translateY: -10 }, { scale: 1.1 }] },
  'crow': { objectPosition: 'center 68%', transform: [{ translateY: -10 }, { scale: 1.1 }] },
  '1': { objectPosition: 'center 68%', transform: [{ translateY: -10 }, { scale: 1.1 }] },
  'story-lion-mouse': { objectPosition: 'center 65%', transform: [{ translateY: -12 }, { scale: 1.12 }] },
  'lion-mouse': { objectPosition: 'center 65%', transform: [{ translateY: -12 }, { scale: 1.12 }] },
  '2': { objectPosition: 'center 65%', transform: [{ translateY: -12 }, { scale: 1.12 }] },
  'story-tortoise-hare': { objectPosition: 'center 75%', transform: [{ translateY: -18 }, { scale: 1.18 }] },
  'tortoise-hare': { objectPosition: 'center 75%', transform: [{ translateY: -18 }, { scale: 1.18 }] },
  '3': { objectPosition: 'center 75%', transform: [{ translateY: -18 }, { scale: 1.18 }] },
  'story-monkey-crocodile': { objectPosition: 'center 55%', transform: [{ translateY: -4 }, { scale: 1.05 }] },
  'monkey-crocodile': { objectPosition: 'center 55%', transform: [{ translateY: -4 }, { scale: 1.05 }] },
  '4': { objectPosition: 'center 55%', transform: [{ translateY: -4 }, { scale: 1.05 }] },
  'story-ant-dove': { objectPosition: 'center 72%', transform: [{ translateY: -12 }, { scale: 1.12 }] },
  'ant-dove': { objectPosition: 'center 72%', transform: [{ translateY: -12 }, { scale: 1.12 }] },
  '5': { objectPosition: 'center 72%', transform: [{ translateY: -12 }, { scale: 1.12 }] },
  'story-honest-woodcutter': { objectPosition: 'center 68%', transform: [{ translateY: -10 }, { scale: 1.1 }] },
  'honest-woodcutter': { objectPosition: 'center 68%', transform: [{ translateY: -10 }, { scale: 1.1 }] },
  '6': { objectPosition: 'center 68%', transform: [{ translateY: -10 }, { scale: 1.1 }] },
};

/** Magical book cover in the story catalogue. */
const BookCover: React.FC<{
  story: StoryBook;
  index: number;
  lang: AppLanguage;
  isRead: boolean;
  width: DimensionValue;
  onOpen: () => void;
}> = ({ story, index, lang, isRead, width, onOpen }) => {
  const tone: KidTone = toneAt(index);
  const spec = kidTones[tone];
  const cat = getStoryCategoryMeta(story.category, lang);
  const mins = getStoryReadingMinutes(story, lang);
  const level = getStoryDifficulty(story, lang);
  const press = useRef(new Animated.Value(0)).current;
  const scale = press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.96] });
  const translateY = press.interpolate({ inputRange: [0, 1], outputRange: [0, 4] });
  const pillSink = press.interpolate({ inputRange: [0, 1], outputRange: [0, 2] });

  return (
    <Pressable
      onPress={onOpen}
      onPressIn={() => Animated.timing(press, { toValue: 1, duration: 80, useNativeDriver: useNative }).start()}
      onPressOut={() => Animated.spring(press, { toValue: 0, friction: 4, tension: 150, useNativeDriver: useNative }).start()}
      accessibilityRole="button"
      accessibilityLabel={`${getStoryTitle(story, lang)}, ${mins} min`}
      style={[{ width, display: 'flex', flexDirection: 'column' }, webStyle({ cursor: 'pointer' })]}
    >
      <Animated.View style={[styles.book, { borderBottomColor: spec.edge }, clayShadow(3), { transform: [{ scale }, { translateY }] }]}>
        {/* Spine */}
        <View style={[styles.bookSpine, { backgroundColor: spec.edge }]} />
        {/* Illustrated cover art: real artwork when available, otherwise a drawn storybook scene */}
        <StoryIllustration
          image={resolveStoryCover(story, STORY_IMAGE_MAP)}
          composition={composeCover(story)}
          artId={`cover-${story.id}`}
          height={185}
          radius={0}
          actorSize={88}
          hero={story.coverEmoji}
          style={styles.bookHeader}
          imageStyle={STORY_COVER_FRAMING[story.id] || STORY_COVER_FRAMING[story.id.replace(/^story-/, '')]}
          accessibilityLabel={getStoryTitle(story, lang)}
        />
        {isRead && <CornerRibbon label={tr(lang, { gu: 'વાંચી', hi: 'पढ़ी', en: 'Read' })} tone="mint" />}

        <View style={styles.bookBody}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: kidTones[cat.tone].tint, borderColor: kidTones[cat.tone].tintBorder }]}>
              <Text style={[styles.badgeText, { color: kidTones[cat.tone].text }]}>
                {cat.label}
              </Text>
            </View>
            <View style={[styles.badge, styles.badgeNeutral]}>
              <Glyph name="clock" size={13} color="#B45309" strokeWidth={2.8} />
              <Text style={styles.badgeTextNeutral}>
                {formatNumberDigits(mins, lang)} {tr(lang, { gu: 'મિનિટ', hi: 'मिनट', en: 'min' })}
              </Text>
            </View>
          </View>

          <Text style={styles.bookTitle} numberOfLines={2}>
            {getStoryTitle(story, lang)}
          </Text>

          <View style={styles.bookFooter}>
            <View style={styles.difficultyStarsRow} accessibilityLabel={`Difficulty ${level} of 3`}>
              {[1, 2, 3].map((starIdx) => (
                <Svg key={starIdx} width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    fill={starIdx <= level ? '#F59E0B' : '#E2E8F0'}
                    stroke={starIdx <= level ? '#D97706' : '#CBD5E1'}
                    strokeWidth={1}
                    strokeLinejoin="round"
                  />
                </Svg>
              ))}
            </View>
            <View style={styles.pagesBadge}>
              <Glyph name="page" size={13} color={kidPalette.inkMuted} strokeWidth={2.6} />
              <Text style={styles.pagesText}>
                {formatNumberDigits(story.scenes.length, lang)} {tr(lang, { gu: 'પાનાં', hi: 'पृष्ठ', en: 'pages' })}
              </Text>
            </View>
          </View>

          {/* Visual 3D button only: the whole card is the pressable. It sinks onto its lip while pressed. */}
          <Animated.View
            style={[
              styles.readPill,
              { backgroundColor: spec.fill, borderBottomColor: spec.edge, transform: [{ translateY: pillSink }] },
            ]}
          >
            <View style={styles.readPillContent}>
              <Glyph name="book" size={16} color={spec.onFill} strokeWidth={2.8} />
              <Text style={[styles.readPillText, { color: spec.onFill }]}>
                {tr(lang, { gu: 'વાર્તા વાંચો', hi: 'कहानी पढ़ें', en: 'Read Story' })}
              </Text>
            </View>
          </Animated.View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

/** 3D quest badge for a saved magic story (its cover emoji is the quest's emoji). */
function getMagicCoverArt(story: StoryBook): ImageAsset | null {
  return MAGIC_THEMES.find((t) => t.emoji === story.coverEmoji)?.image ?? null;
}

const THEME_TONE_MAP: Record<string, KidTone> = {
  rainbow: 'sky',
  cloud: 'sun',
  space: 'lavender',
  icecream: 'coral',
  dino: 'mint',
  ocean: 'sky',
};

/** Magical 3D book cover for stories created by the child */
const SavedStoryCover: React.FC<{
  story: StoryBook;
  lang: AppLanguage;
  onOpen: () => void;
}> = ({ story, lang, onOpen }) => {
  const press = useRef(new Animated.Value(0)).current;
  const scale = press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.96] });
  const translateY = press.interpolate({ inputRange: [0, 1], outputRange: [0, 4] });

  // Resolve theme, companion and colors
  const idParts = story.id ? story.id.split('-') : [];
  const themeId = idParts.length > 1 ? idParts[1] : '';
  const companionId = idParts.length > 2 ? idParts[2] : '';

  const theme =
    MAGIC_THEMES.find((t) => t.id === themeId || t.emoji === story.coverEmoji) ||
    MAGIC_THEMES.find((t) => t.emoji === story.coverEmoji) ||
    MAGIC_THEMES[0];

  const companion = MAGIC_COMPANIONS.find((c) => c.id === companionId);
  const coverArt = theme?.image ?? getMagicCoverArt(story);
  const title = getStoryTitle(story, lang);

  const cardTone: KidTone = THEME_TONE_MAP[theme?.id] || 'lavender';
  const spec = kidTones[cardTone];
  const stageBg = theme?.bgColor || spec.tint;
  const themeBadge =
    lang === 'gu' ? theme?.badgeGu : lang === 'hi' ? theme?.badgeHi : theme?.badgeEn;

  return (
    <Pressable
      onPress={onOpen}
      onPressIn={() => Animated.timing(press, { toValue: 1, duration: 80, useNativeDriver: useNative }).start()}
      onPressOut={() => Animated.spring(press, { toValue: 0, friction: 4, tension: 150, useNativeDriver: useNative }).start()}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={[styles.savedBookWrap, webStyle({ cursor: 'pointer' })]}
    >
      <Animated.View
        style={[
          styles.savedBook,
          {
            borderColor: spec.tintBorder,
            borderBottomColor: spec.edge,
          },
          clayShadow(2),
          { transform: [{ scale }, { translateY }] },
        ]}
      >
        {/* Cover illustration stage with vibrant pastel backdrop and halo */}
        <View style={[styles.savedStage, { backgroundColor: stageBg, borderBottomColor: spec.tintBorder }]}>
          <GradientStage id={`mgrad-${story.id}`} from={stageBg} to="#FFFFFF" radius={0} />

          {/* Magical sparkle stars */}
          <Text style={styles.savedSparkleTopLeft}>✨</Text>
          <Text style={styles.savedSparkleBottomRight}>✨</Text>

          {/* Luminous circular halo for 3D Quest art */}
          <View style={styles.savedStageHalo}>
            {coverArt ? (
              <Remote3DImage
                source={coverArt}
                style={styles.savedStageArt}
                contentFit="contain"
                fallback={<Text style={styles.savedStageEmoji}>{story.coverEmoji}</Text>}
              />
            ) : (
              <Text style={styles.savedStageEmoji}>{story.coverEmoji}</Text>
            )}
          </View>

          {/* Clean modern floating pill badge for Magic */}
          <View style={styles.savedMagicPill}>
            <Glyph name="sparkle" size={10} color="#7C3AED" strokeWidth={2.8} />
            <Text style={styles.savedMagicPillText}>
              {tr(lang, { gu: 'જાદુઈ', hi: 'जादुई', en: 'AI Magic' })}
            </Text>
          </View>

          {/* Companion friend circular cameo */}
          {companion?.image && (
            <View style={[styles.savedCompanionCameo, { borderColor: spec.edge }]}>
              <Remote3DImage
                source={companion.image}
                style={styles.savedCompanionCameoImg}
                fallback={<Text style={{ fontSize: 20 }}>{companion.emoji}</Text>}
              />
            </View>
          )}
        </View>

        <View style={styles.savedBody}>
          <View style={styles.savedBadgeRow}>
            <View style={[styles.savedBadge, { backgroundColor: spec.tint, borderColor: spec.tintBorder }]}>
              <Glyph name="sparkle" size={10} color={spec.text} strokeWidth={2.8} />
              <Text style={[styles.savedBadgeText, { color: spec.text }]}>
                {themeBadge || tr(lang, { gu: 'મારી વાર્તા', hi: 'मेरी कहानी', en: 'My Story' })}
              </Text>
            </View>
            <View style={styles.savedPagesBadge}>
              <Glyph name="page" size={11} color={kidPalette.inkMuted} strokeWidth={2.6} />
              <Text style={styles.savedPagesText}>
                {formatNumberDigits(story.scenes.length, lang)} {tr(lang, { gu: 'પાનાં', hi: 'पृष्ठ', en: 'pages' })}
              </Text>
            </View>
          </View>

          <View style={styles.savedStoryTitleBox}>
            <Text style={styles.savedTitle} numberOfLines={2}>
              {title}
            </Text>
          </View>

          <View
            style={[
              styles.savedReadPill,
              {
                backgroundColor: spec.fill,
                borderBottomColor: spec.edge,
              },
            ]}
          >
            <Glyph name="book" size={15} color={spec.onFill} strokeWidth={2.8} />
            <Text style={[styles.savedReadPillText, { color: spec.onFill }]}>
              {tr(lang, { gu: 'વાર્તા વાંચો', hi: 'कहानी पढ़ें', en: 'Read Story' })}
            </Text>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

/**
 * Selectable 3D chip for the Magic Story Maker: [3D PNG] + bold name.
 * Selected -> 2.5px tone border, tint background, tone lip, springs to 1.05.
 * Idle     -> white card, #E2E8F0 border, neutral lip.
 */
const MagicChip: React.FC<{
  image: ImageAsset;
  label: string;
  selected: boolean;
  tone: KidTone;
  onPress: () => void;
  imageSize?: number;
  width?: DimensionValue;
}> = ({ image, label, selected, tone, onPress, imageSize = 64, width }) => {
  const spec = kidTones[tone];
  const scale = useRef(new Animated.Value(selected ? 1.05 : 1)).current;
  useEffect(() => {
    Animated.spring(scale, { toValue: selected ? 1.05 : 1, friction: 4, tension: 170, useNativeDriver: useNative }).start();
  }, [selected, scale]);
  return (
    <Animated.View style={[{ transform: [{ scale }] }, width ? { width } : null]}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={label}
        style={[
          styles.magicChip,
          selected
            ? { backgroundColor: spec.tint, borderColor: spec.fill, borderBottomColor: spec.edge, borderWidth: 2.5, borderBottomWidth: 5 }
            : null,
          webStyle({ cursor: 'pointer' }),
        ]}
      >
        <Remote3DImage
          source={image}
          style={{ width: imageSize, height: imageSize }}
          fallback={<Glyph name="sparkle" size={Math.round(imageSize * 0.6)} color="#A78BFA" />}
        />
        <Text style={styles.magicChipLabel} numberOfLines={2}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

export default function StoryModeScreen() {
  const router = useRouter();
  const { language, speak, addCoins, completeLesson, progress, voiceRate } = useApp();
  const { width: screenW } = useWindowDimensions();
  // Alert.alert is a no-op on react-native-web; KidDialog works on every platform.
  const { dialog: kidDialog, notify } = useKidDialog();

  const [stories, setStories] = useState<StoryBook[]>(STORIES_DATA);
  const [isLoadingStories, setIsLoadingStories] = useState<boolean>(STORIES_DATA.length === 0);
  const [selectedStory, setSelectedStory] = useState<StoryBook | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [choiceFeedback, setChoiceFeedback] = useState<{ text: string; good: boolean } | null>(null);
  const [isStoryFinished, setIsStoryFinished] = useState<boolean>(false);
  const [isNarrating, setIsNarrating] = useState<boolean>(false);

  // Personalized AI Magic Storyteller State
  const [showMagicModal, setShowMagicModal] = useState<boolean>(false);
  const [magicChildName, setMagicChildName] = useState<string>('');
  const [selectedCompanionId, setSelectedCompanionId] = useState<string>('lion');
  const [selectedThemeId, setSelectedThemeId] = useState<string>('rainbow');
  const [selectedToolId, setSelectedToolId] = useState<string>('wand');
  const [savedMagicStories, setSavedMagicStories] = useState<StoryBook[]>([]);

  useEffect(() => {
    if (progress?.childName && !magicChildName) {
      setMagicChildName(progress.childName);
    }
  }, [progress?.childName, magicChildName]);

  useEffect(() => {
    AsyncStorage.getItem('@kidszone_magic_stories').catch(() => null).then((val) => {
      if (val) {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) {
            setSavedMagicStories(parsed);
          }
        } catch { }
      }
    });
  }, []);

  const handleCreateMagicStory = async (choice?: MagicStoryChoice) => {
    stopAllAudio();
    soundEffects.playLevelUp();
    const heroName = (choice?.childName || magicChildName || '').trim() || progress?.childName || 'Rohan';
    const newStory = generatePersonalizedStory({
      childName: heroName,
      companionId: choice?.companionId || selectedCompanionId,
      themeId: choice?.themeId || selectedThemeId,
      toolId: choice?.toolId || selectedToolId,
    });

    const updated = [newStory, ...savedMagicStories.filter((s) => s.id !== newStory.id)].slice(0, 10);
    setSavedMagicStories(updated);
    try {
      await AsyncStorage.setItem('@kidszone_magic_stories', JSON.stringify(updated));
    } catch { }

    setShowMagicModal(false);
    startStory(newStory);
  };

  const handleClearMagicStories = async () => {
    soundEffects.playBubblePop();
    setSavedMagicStories([]);
    try {
      await AsyncStorage.removeItem('@kidszone_magic_stories');
    } catch { }
  };
  const pageAnim = useRef(new Animated.Value(1)).current;
  const pillAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Page pill bounces in whenever the page (or finish state) changes.
  useEffect(() => {
    pillAnim.setValue(0);
    Animated.spring(pillAnim, { toValue: 1, friction: 4, tension: 160, useNativeDriver: useNative }).start();
  }, [currentPage, isStoryFinished, pillAnim]);

  // Speaker pulses (with a glowing halo) while the story is being narrated.
  useEffect(() => {
    if (!isNarrating) {
      pulseAnim.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 650, easing: Easing.out(Easing.quad), useNativeDriver: useNative }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 650, easing: Easing.in(Easing.quad), useNativeDriver: useNative }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isNarrating, pulseAnim]);

  useEffect(() => {
    let isMounted = true;
    apiService
      .fetchStories(language)
      .then((fetched) => {
        if (isMounted && fetched && fetched.length > 0) {
          setStories(fetched);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingStories(false);
      });
    return () => {
      isMounted = false;
    };
  }, [language]);

  const stopAllAudio = () => {
    try {
      audioService.stop();
      soundEffects.stopAnimalSound();
    } catch { }
    setIsNarrating(false);
  };

  const handleBack = () => {
    stopAllAudio();
    soundEffects.playBubblePop();
    if (selectedStory) {
      setSelectedStory(null);
      setIsStoryFinished(false);
      setChoiceFeedback(null);
      return;
    }
    try {
      if (router.canGoBack()) {
        router.back();
        return;
      }
    } catch { }
    router.replace('/home');
  };

  // Automatically silence audio any time a story is closed or left
  useEffect(() => {
    if (!selectedStory) {
      stopAllAudio();
    }
  }, [selectedStory]);

  // Silence audio when screen unmounts or browser back button is used
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handlePop = () => {
        stopAllAudio();
      };
      window.addEventListener('popstate', handlePop);
      return () => {
        window.removeEventListener('popstate', handlePop);
        stopAllAudio();
      };
    }
    return () => {
      stopAllAudio();
    };
  }, []);

  // Silence audio when screen loses focus in navigation stack
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        stopAllAudio();
      };
    }, [])
  );

  const activeLang = (language || 'gu') as AppLanguage;
  const textLang = activeLang === 'hi' ? 'hi' : activeLang === 'en' ? 'en' : 'gu';

  /** Page-turn flourish: the book page swings in. */
  const flipIn = () => {
    pageAnim.setValue(0);
    Animated.spring(pageAnim, { toValue: 1, friction: 6, tension: 70, useNativeDriver: useNative }).start();
  };

  const narrate = (scene: StoryScene) => {
    setIsNarrating(true);
    const sceneText = getSceneText(scene, textLang);
    audioService.narrateStory(sceneText, textLang, () => {
      setIsNarrating(false);
    });
  };

  const startStory = (story: StoryBook) => {
    soundEffects.playBubblePop();
    setSelectedStory(story);
    setCurrentPage(1);
    setIsStoryFinished(false);
    setChoiceFeedback(null);
    flipIn();
    narrate(story.scenes[0]);
  };

  const handleToggleReadScene = (scene: StoryScene) => {
    if (isNarrating) {
      stopAllAudio();
      return;
    }
    soundEffects.playBubblePop();
    narrate(scene);
  };

  const rewardedChoicesRef = useRef<Set<string>>(new Set());

  const handleChoice = (opt: StoryChoiceOption) => {
    const fbText = getChoiceFeedback(opt, textLang);
    if (opt.isBest) {
      soundEffects.playTadaaa();
      setChoiceFeedback({ text: fbText, good: true });
      speak(fbText, textLang);
      // One reward per choice scene: the options stay tappable (and paging back re-arms them),
      // so every extra tap on the right answer used to pay another +10.
      const choiceKey = `${selectedStory?.id ?? ''}:${currentPage}`;
      if (!rewardedChoicesRef.current.has(choiceKey)) {
        rewardedChoicesRef.current.add(choiceKey);
        addCoins(10);
      }
    } else {
      soundEffects.playBuzzer();
      setChoiceFeedback({ text: fbText, good: false });
      speak(fbText, textLang);
    }
  };

  const handleFinishStory = () => {
    if (!selectedStory) return;
    soundEffects.playTadaaa();
    // Like rhymes and word builder: the completion bonus is paid on the first read only.
    if (!progress.completedLessons?.includes(selectedStory.id)) {
      // markLessonCompleted awards +10 coins & +1 star; add +10 more coins for 20 total.
      addCoins(10);
    }
    try {
      completeLesson(selectedStory.id);
    } catch { }
    setIsStoryFinished(true);
    flipIn();

    const title = getStoryTitle(selectedStory, activeLang);
    const moral = getStoryMoral(selectedStory, activeLang);

    const celebrationMsg =
      activeLang === 'en'
        ? `Congratulations! You finished ${title}! You earned 20 coins! ${moral}`
        : activeLang === 'hi'
          ? `बधाई हो! आपने ${title} पूरी कर ली! आपने २० सिक्के जीते! ${moral}`
          : `અભિનંદન! તમે ${title} સફળતાપૂર્વક પૂર્ણ કરી લીધી! તમને ૨૦ સિક્કા મળ્યા! ${moral}`;

    speak(celebrationMsg, activeLang);
  };

  const nextPage = () => {
    if (!selectedStory) return;
    stopAllAudio();
    soundEffects.playBubblePop();
    if (currentPage < selectedStory.scenes.length) {
      const nextIdx = currentPage;
      setCurrentPage(currentPage + 1);
      setChoiceFeedback(null);
      flipIn();
      narrate(selectedStory.scenes[nextIdx]);
    } else {
      handleFinishStory();
    }
  };

  const prevPage = () => {
    if (!selectedStory || currentPage <= 1) return;
    stopAllAudio();
    soundEffects.playBubblePop();
    const prevIdx = currentPage - 2;
    setCurrentPage(currentPage - 1);
    setChoiceFeedback(null);
    flipIn();
    if (prevIdx >= 0) narrate(selectedStory.scenes[prevIdx]);
  };

  const backToShelf = () => {
    stopAllAudio();
    soundEffects.playBubblePop();
    setIsStoryFinished(false);
    setSelectedStory(null);
    setCurrentPage(1);
    setChoiceFeedback(null);
  };

  const storyIndex = selectedStory ? Math.max(0, stories.findIndex((s) => s.id === selectedStory.id)) : 0;
  const readerTone: KidTone = toneAt(storyIndex);
  const readerSpec = kidTones[readerTone];
  const completed = new Set(progress.completedLessons || []);

  // Catalogue grid: 1 column on phones, 2 on tablets, 3 on wide desktop.
  const shelfCols = screenW >= 1000 ? 3 : screenW >= 640 ? 2 : 1;
  const coverWidth: DimensionValue = shelfCols === 1 ? '100%' : shelfCols === 2 ? '48%' : '31.8%';

  const pillScale = pillAnim.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] });
  const speakerScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const haloScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] });
  const haloOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });
  const pageScale = pageAnim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] });
  const pageRotate = pageAnim.interpolate({ inputRange: [0, 1], outputRange: ['-4deg', '0deg'] });

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppGlobalBackground id="storiesBgGrad" />
      <Header
        title={tr(activeLang, { gu: 'વાર્તાઓ', hi: 'कहानियां', en: 'Stories' })}
        showBack={true}
        onBack={handleBack}
        backHref="/home"
      />
      <ConfettiCelebration visible={isStoryFinished} language={activeLang} speakPraise={false} />

      <ScrollView
        contentContainerStyle={[styles.container, { maxWidth: selectedStory ? 680 : 1040, paddingBottom: selectedStory ? 56 : 130 }]}
        showsVerticalScrollIndicator={false}
      >
        {!selectedStory ? (
          /* Stories Shelf */
          <View style={styles.shelfContainer}>
            {/* 1. Dazzling AI Magic Story Maker Hero Banner - Coming Soon */}
            <TouchableOpacity
              style={[styles.magicBannerCard, shadows.card]}
              onPress={() => {
                soundEffects.playBubblePop();
                notify({
                  emblem: '✨',
                  tone: 'sun',
                  title:
                    activeLang === 'gu'
                      ? 'ટૂંક સમયમાં આવી રહ્યું છે!'
                      : activeLang === 'hi'
                        ? 'जल्द ही आ रहा है!'
                        : 'Coming Soon!',
                  message:
                    activeLang === 'gu'
                      ? 'જાદુઈ વાર્તા સર્જક ફીચર આગામી નવા અપડેટમાં ઉપલબ્ધ થશે. જોડાયેલા રહો!'
                      : activeLang === 'hi'
                        ? 'जादुई कहानी क्रिएटर फीचर आगामी नए अपडेट में उपलब्ध होगा। जुड़े रहें!'
                        : 'The AI Magic Story Maker feature will be available in an upcoming update. Stay tuned!',
                  okText: activeLang === 'gu' ? 'સમજાઈ ગયું' : activeLang === 'hi' ? 'समझ गया' : 'Got it!',
                });
              }}
              activeOpacity={0.88}
              accessibilityRole="button"
              accessibilityLabel="AI Magic Story Maker - Coming Soon"
            >
              <View style={styles.magicBannerTopStrip}>
                <View style={styles.magicAiTag}>
                  <Glyph name="sparkle" size={12} color="#6D28D9" strokeWidth={2.8} />
                  <Text style={styles.magicAiTagText}>
                    {tr(activeLang, {
                      gu: 'AI જાદુઈ વાર્તાકાર',
                      hi: 'AI जादुई कथाकार',
                      en: 'AI MAGIC STORYTELLER',
                    })}
                  </Text>
                </View>
                <View style={styles.comingSoonBadge}>
                  <Glyph name="sparkle" size={12} color="#854D0E" strokeWidth={2.8} />
                  <Text style={styles.comingSoonBadgeText}>
                    {activeLang === 'gu' ? 'ટૂંક સમયમાં' : activeLang === 'hi' ? 'जल्द आ रहा है' : 'COMING SOON'}
                  </Text>
                </View>
              </View>

              <View style={styles.magicBannerMainRow}>
                <View style={styles.magicBannerIconBadge}>
                  <Image source={resolveOfflineMediaSource(MAGIC_UI_ART.wizard)} resizeMode="contain" style={styles.magicBannerArt} />
                </View>
                <View style={{ flex: 1, paddingRight: 6 }}>
                  <Text style={styles.magicBannerTitle}>
                    {activeLang === 'gu'
                      ? 'તમારી પોતાની જાદુઈ વાર્તા બનાવો!'
                      : activeLang === 'hi'
                        ? 'अपनी खुद की जादुई कहानी बनाएं!'
                        : 'Create Your Own Magic Story!'}
                  </Text>
                  <Text style={styles.magicBannerSub}>
                    {activeLang === 'gu'
                      ? 'બાળકો માટે અદ્ભુત AI જાદુઈ વાર્તા સર્જક ટૂંક સમયમાં આવી રહ્યું છે! નવી અપડેટમાં જોડાયેલા રહો.'
                      : activeLang === 'hi'
                        ? 'बच्चों के लिए शानदार AI जादुई कहानी क्रिएटर जल्द ही आ रहा है! नए अपडेट में जुड़े रहें।'
                        : 'Exciting AI-powered custom story creation is coming soon in the next update! Stay tuned.'}
                  </Text>
                </View>
                <View style={styles.magicBannerArtDecor}>
                  <Image source={resolveOfflineMediaSource(MAGIC_UI_ART.wand)} resizeMode="contain" style={styles.magicDecorWand} />
                </View>
              </View>

              <View style={styles.magicBannerCtaBtn}>
                <Glyph name="sparkle" size={16} color="#FFFFFF" strokeWidth={2.8} />
                <Text style={styles.magicBannerCtaText}>
                  {activeLang === 'gu'
                    ? '✨ ટૂંક સમયમાં આવી રહ્યું છે'
                    : activeLang === 'hi'
                      ? '✨ जल्द ही आ रहा है'
                      : '✨ Coming Soon, Stay Tuned!'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* 2. My Created Stories (if any) */}
            {savedMagicStories.length > 0 && (
              <View style={styles.savedMagicSection}>
                <View style={styles.savedMagicHeaderRow}>
                  <View style={styles.savedMagicHeaderLeft}>
                    <Glyph name="star" size={18} color="#F59E0B" />
                    <Text style={styles.savedMagicHeading}>
                      {activeLang === 'gu'
                        ? 'મારી જાદુઈ વાર્તાઓ'
                        : activeLang === 'hi'
                          ? 'मेरी जादुई कहानियां'
                          : 'My Created Magic Stories'}
                    </Text>
                    <View style={styles.savedCountPill}>
                      <Text style={styles.savedCountPillText}>{formatNumberDigits(savedMagicStories.length, activeLang)}</Text>
                    </View>
                  </View>
                  {savedMagicStories.length > 0 && (
                    <TouchableOpacity
                      onPress={handleClearMagicStories}
                      style={styles.savedClearBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityRole="button"
                      accessibilityLabel="Clear magic stories"
                    >
                      <Text style={styles.savedClearBtnText}>
                        {activeLang === 'gu' ? 'સાફ કરો' : activeLang === 'hi' ? 'साफ़ करें' : 'Clear All'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <HorizontalScrollRow nestedScrollEnabled={true} contentContainerStyle={styles.savedScrollRow}>
                  {savedMagicStories.map((s) => (
                    <SavedStoryCover
                      key={s.id}
                      story={s}
                      lang={activeLang}
                      onOpen={() => startStory(s)}
                    />
                  ))}
                </HorizontalScrollRow>
              </View>
            )}

            {/* 3. Standard Library Stories */}
            <Text style={styles.shelfHeading}>
              {activeLang === 'en'
                ? 'Classic Story Library:'
                : activeLang === 'hi'
                  ? 'प्रसिद्ध कहानियां:'
                  : 'પ્રસિદ્ધ વાર્તાઓ:'}
            </Text>

            <View style={styles.shelfGrid}>
              {isLoadingStories && stories.length === 0 ? (
                <SkeletonGrid count={4} columns={2} cardHeight={170} />
              ) : (
                stories.map((s, i) => (
                  <BookCover
                    key={s.id}
                    story={s}
                    index={i}
                    lang={activeLang}
                    isRead={completed.has(s.id) || completed.has('story-' + s.id)}
                    width={coverWidth}
                    onOpen={() => startStory(s)}
                  />
                ))
              )}
            </View>
          </View>
        ) : (
          /* ============ READER: open fairy-tale book ============ */
          <View>
            {/* Floating reader top bar: 3D back button, story title, bouncy page pill */}
            <View style={[styles.readerBar, clayShadow(2)]}>
              <ClayButton
                tone="white"
                size="md"
                sound={false}
                onPress={backToShelf}
                style={styles.readerBackBtn}
                faceStyle={styles.readerBackFace}
                accessibilityLabel={tr(activeLang, { gu: 'બધી વાર્તાઓ', hi: 'सभी कहानियां', en: 'All Stories' })}
              >
                <Glyph name="back" size={22} color={kidPalette.inkSoft} strokeWidth={3.4} />
              </ClayButton>
              <Text style={styles.readerTitle} numberOfLines={1}>
                {getStoryTitle(selectedStory, activeLang)}
              </Text>
              <Animated.View
                style={[
                  styles.pagePill,
                  { backgroundColor: readerSpec.fill, borderBottomColor: readerSpec.edge, transform: [{ scale: pillScale }] },
                ]}
                accessibilityLabel={
                  isStoryFinished ? 'Story complete' : `Page ${currentPage} of ${selectedStory.scenes.length}`
                }
              >
                {isStoryFinished ? (
                  <Art.TrophyArt size={26} />
                ) : (
                  <Text style={[styles.pagePillText, { color: readerSpec.onFill }]}>
                    {`${tr(activeLang, { gu: 'પાનું', hi: 'पृष्ठ', en: 'Page' })} ${formatNumberDigits(currentPage, activeLang)} / ${formatNumberDigits(selectedStory.scenes.length, activeLang)}`}
                  </Text>
                )}
              </Animated.View>
            </View>

            <Animated.View style={{ transform: [{ scale: pageScale }, { rotate: pageRotate }] }}>
              {isStoryFinished ? (
                /* ---------- Golden parchment moral scroll ---------- */
                <View style={styles.finishWrap}>
                  <View style={[styles.trophyBubble, clayShadow(3)]}>
                    <Art.TrophyArt size={84} />
                  </View>
                  <Text style={styles.finishTitle}>
                    {tr(activeLang, { gu: 'વાર્તા પૂર્ણ!', hi: 'कहानी पूरी हो गई!', en: 'Story Complete!' })}
                  </Text>
                  <Text style={styles.finishSub}>
                    {tr(activeLang, {
                      gu: `શાબાશ! તમે "${getStoryTitle(selectedStory, activeLang)}" વાંચી લીધી!`,
                      hi: `शाबाश! आपने "${getStoryTitle(selectedStory, activeLang)}" पढ़ ली!`,
                      en: `Great reading! You finished "${getStoryTitle(selectedStory, activeLang)}"`,
                    })}
                  </Text>

                  <View style={styles.coinPile}>
                    <GoldCoinStack size={36} />
                    <Text style={styles.coinPileText}>
                      +{formatNumberDigits(20, activeLang)} {tr(activeLang, { gu: 'સિક્કા', hi: 'सिक्के', en: 'coins' })}
                    </Text>
                  </View>

                  {/* Golden royal scroll with ribbon header and star burst */}
                  <View style={[styles.scroll, clayShadow(2)]}>
                    <FloatingSparkles emojis={['⭐', '✨', '🌟']} count={7} seed={storyIndex + 21} size={16} opacity={0.75} />
                    <View style={[styles.scrollRoll, styles.scrollRollTop]} />
                    <View style={styles.scrollRibbon}>
                      <View style={[styles.ribbonTail, styles.ribbonTailLeft]} />
                      <View style={[styles.ribbonTail, styles.ribbonTailRight]} />
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Art.StarArt size={22} />
                        <Text style={styles.scrollRibbonText}>
                          {tr(activeLang, { gu: 'વાર્તાનો બોધ', hi: 'कहानी की सीख', en: 'Moral of the Story' })}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.scrollText}>{getStoryMoral(selectedStory, activeLang)}</Text>
                    <View style={styles.scrollStars}>
                      <Art.StarArt size={28} />
                      <Art.StarArt size={34} />
                      <Art.StarArt size={28} />
                    </View>
                    <View style={[styles.scrollRoll, styles.scrollRollBottom]} />
                  </View>

                  <View style={styles.finishActions}>
                    <ClayButton
                      tone="sun"
                      size="lg"
                      sound={false}
                      style={styles.finishBtn}
                      title={tr(activeLang, { gu: 'ફરી વાંચો', hi: 'फिर से पढ़ें', en: 'Read Again' })}
                      onPress={() => {
                        soundEffects.playBubblePop();
                        setIsStoryFinished(false);
                        setCurrentPage(1);
                        setChoiceFeedback(null);
                        flipIn();
                        narrate(selectedStory.scenes[0]);
                      }}
                    />
                    <ClayButton
                      tone="lavender"
                      size="lg"
                      sound={false}
                      style={styles.finishBtn}
                      title={tr(activeLang, { gu: 'બીજી વાર્તાઓ', hi: 'और कहानियां', en: 'Explore More Stories' })}
                      onPress={backToShelf}
                    />
                  </View>
                </View>
              ) : (
                (() => {
                  const currentScene = selectedStory.scenes[currentPage - 1];
                  const isLastPage = currentPage === selectedStory.scenes.length;
                  const hasChoice =
                    currentScene.choice && Array.isArray(currentScene.choice.options) && currentScene.choice.options.length > 0;

                  return (
                    <View style={[styles.bookOpen, clayShadow(3)]}>
                      {/* Page fold down the middle of the open book */}
                      <View pointerEvents="none" style={styles.bookFold} />

                      {/* Illustrated picture-book stage (fixed 240px, radius 24, cover) */}
                      <View style={[styles.stage, clayShadow(2)]}>
                        <StoryIllustration
                          image={resolveStoryScene(selectedStory, currentPage, STORY_IMAGE_MAP)}
                          composition={getSceneComposition(currentScene, selectedStory)}
                          artId={`stage-${selectedStory.id}-${currentPage}`}
                          height={240}
                          radius={24}
                          hero={selectedStory.coverEmoji}
                          accessibilityLabel={`${getStoryTitle(selectedStory, activeLang)} ${currentPage}`}
                        />
                      </View>

                      {/* Scene Text with Synchronized Word Glow Reader */}
                      <WordGlowReader
                        text={getSceneText(currentScene, activeLang)}
                        language={activeLang}
                        isNarrating={isNarrating}
                        speechRate={voiceRate}
                        onNarrationEnd={() => setIsNarrating(false)}
                      />

                      {/* Audio Speaker & Narration Controller */}
                      <TouchableOpacity
                        style={[
                          styles.speakerBtn,
                          isNarrating ? styles.speakerBtnActive : styles.speakerBtnIdle,
                          shadows.soft,
                          webStyle({ cursor: 'pointer' }),
                        ]}
                        onPress={() => handleToggleReadScene(currentScene)}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                        accessibilityLabel={isNarrating ? 'Stop reading' : 'Read aloud'}
                      >
                        <View style={styles.speakerBtnInner}>
                          <View style={styles.speakerIcon}>
                            {isNarrating ? (
                              <View style={styles.stopSquare} />
                            ) : (
                              <VolumeIcon size={20} color="#0369A1" strokeWidth={2.6} />
                            )}
                          </View>
                          <Text
                            style={[
                              styles.speakerBtnText,
                              isNarrating ? styles.speakerBtnTextActive : styles.speakerBtnTextIdle,
                            ]}
                          >
                            {isNarrating
                              ? activeLang === 'en'
                                ? 'Stop Reading'
                                : activeLang === 'hi'
                                  ? 'पढ़ना रोकें'
                                  : 'વાર્તા અટકાવો'
                              : activeLang === 'en'
                                ? 'Read Aloud'
                                : activeLang === 'hi'
                                  ? 'बोलकर सुनें'
                                  : 'મોટેથી સાંભળો'}
                          </Text>
                        </View>
                        {isNarrating && (
                          <View style={styles.narratingIndicator}>
                            <Text style={styles.narratingIndicatorText}>
                              {activeLang === 'en'
                                ? 'Speaking with Karaoke Word Glow...'
                                : activeLang === 'hi'
                                  ? 'शब्द-दर-शब्द वाचन शुरू है...'
                                  : 'શબ્દે-શબ્દ વાર્તા વંચાઈ રહી છે...'}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>

                      {/* Interactive Choice (if any) */}
                      {currentScene.choice && Array.isArray(currentScene.choice.options) && currentScene.choice.options.length > 0 ? (
                        <View style={styles.choiceBox}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: spacing.md }}>
                            <Art.QuestionBubbleArt size={30} />
                            <Text style={[styles.choicePrompt, { marginBottom: 0, flexShrink: 1 }]}>
                              {getChoiceQuestion(currentScene.choice, activeLang)}
                            </Text>
                          </View>
                          <View style={styles.optionsList}>
                            {currentScene.choice.options.map((opt: StoryChoiceOption, oIdx: number) => (
                              <ClayButton
                                key={`c-opt-${oIdx}`}
                                tone={oIdx % 2 === 0 ? 'sky' : 'coral'}
                                size="lg"
                                sound={false}
                                onPress={() => handleChoice(opt)}
                                style={styles.choiceBtn}
                              >
                                <View style={styles.choicePointer}>
                                  <Glyph name="next" size={20} color="#FFFFFF" strokeWidth={3.4} />
                                </View>
                                <Text style={styles.choiceText} numberOfLines={2}>
                                  {getChoiceOptionText(opt, activeLang)}
                                </Text>
                              </ClayButton>
                            ))}
                            {choiceFeedback && (
                              <SpeechBubble tone={choiceFeedback.good ? 'mint' : 'sun'} pointer="top" pointerAt={0.5}>
                                <View style={styles.feedbackRow}>
                                  {choiceFeedback.good ? <Art.StarArt size={26} /> : <Art.ChatBubbleArt size={26} />}
                                  <Text style={styles.feedbackText}>{choiceFeedback.text}</Text>
                                  {choiceFeedback.good && (
                                    <View style={styles.feedbackCoinBadge}>
                                      <GoldCoinIcon size={16} />
                                      <Text style={styles.feedbackCoinText}>+{formatNumberDigits(10, activeLang)}</Text>
                                    </View>
                                  )}
                                </View>
                              </SpeechBubble>
                            )}
                          </View>
                        </View>
                      ) : null}

                      {/* Page navigation */}
                      <View style={styles.pageNavRow}>
                        {currentPage > 1 ? (
                          <ClayButton
                            tone="white"
                            size="md"
                            sound={false}
                            onPress={prevPage}
                            style={styles.navBtn}
                            title={tr(activeLang, { gu: '◀ પાછળ', hi: '◀ पिछला', en: '◀ Back' })}
                          />
                        ) : null}
                        <ClayButton
                          tone={isLastPage ? 'sun' : readerTone}
                          size="md"
                          sound={false}
                          onPress={isLastPage ? handleFinishStory : nextPage}
                          style={[styles.navBtn, { flex: 1.4 }]}
                          title={
                            isLastPage
                              ? tr(activeLang, { gu: 'વાર્તા પૂર્ણ!', hi: 'कहानी पूरी!', en: 'The End!' })
                              : tr(activeLang, { gu: 'પાનું ફેરવો ▶', hi: 'पन्ना पलटें ▶', en: 'Turn Page ▶' })
                          }
                        />
                      </View>
                    </View>
                  );
                })()
              )}
            </Animated.View>
          </View>
        )}
      </ScrollView>
      {/* 5. AI MAGIC STORY MAKER: 3-step, zero-typing, audio-first wizard */}
      <MagicStoryWizard
        visible={showMagicModal}
        language={activeLang}
        defaultHeroName={progress?.childName || ''}
        speak={(text, lang) => speak(text, lang)}
        onClose={() => setShowMagicModal(false)}
        onCreate={handleCreateMagicStory}
      />
      {!selectedStory && <BottomNav activeTab="stories" />}
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
    paddingBottom: 56,
    width: '100%',
    alignSelf: 'center',
  },

  // ---------- Catalogue ----------
  shelfHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    marginBottom: 18,
    borderRadius: kidRadii.card,
    backgroundColor: kidTones.lavender.tint,
    borderWidth: 2,
    borderColor: kidPalette.softBorder,
    overflow: 'hidden',
    ...clayShadow(2),
  },
  shelfHeroEmoji: {
    fontSize: 54,
  },
  shelfHeroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: kidTones.lavender.text,
  },
  shelfHeroSub: {
    fontSize: 14,
    fontWeight: '700',
    color: kidPalette.inkMuted,
    marginTop: 2,
  },
  shelfGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    alignItems: 'stretch',
  },
  book: {
    backgroundColor: kidPalette.surface,
    borderRadius: kidRadii.card,
    borderWidth: 2,
    borderColor: kidPalette.softBorder,
    borderBottomWidth: 7,
    overflow: 'hidden',
    flex: 1,
  },
  bookSpine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 10,
    zIndex: 2,
    opacity: 0.9,
  },
  bookHeader: {
    borderWidth: 0,
    borderBottomWidth: 2,
  },
  bookBody: {
    padding: 16,
    paddingLeft: 22,
    gap: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeNeutral: {
    backgroundColor: kidBackdrops.cream,
    borderColor: '#FFE29A',
  },
  badgeText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  badgeTextNeutral: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#B45309',
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: kidPalette.ink,
    lineHeight: 26,
    minHeight: 52,
  },
  bookFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  difficultyStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  pagesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pagesText: {
    fontSize: 13,
    fontWeight: '600',
    color: kidPalette.inkMuted,
  },
  readPill: {
    minHeight: 52,
    borderRadius: kidRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    paddingHorizontal: 18,
  },
  readPillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  readPillText: {
    fontSize: 16,
    fontWeight: '700',
  },

  // ---------- Reader ----------
  readerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 10,
    backgroundColor: kidPalette.surface,
    borderRadius: kidRadii.card,
    borderWidth: 2,
    borderColor: kidPalette.softBorder,
  },
  readerBackBtn: {
    width: 52,
  },
  readerBackFace: {
    borderRadius: 26,
    paddingHorizontal: 0,
  },
  readerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  pagePill: {
    borderRadius: kidRadii.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderBottomWidth: 4,
  },
  pagePillText: {
    fontSize: 14,
    fontWeight: '700',
  },
  bookOpen: {
    backgroundColor: kidBackdrops.cream,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: kidPalette.softBorder,
    borderBottomWidth: 8,
    borderBottomColor: '#F2D7A6',
    padding: 14,
    gap: 12,
  },
  bookFold: {
    position: 'absolute',
    top: 10,
    bottom: 10,
    left: '50%',
    width: 2,
    marginLeft: -1,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  stage: {
    height: 240,
    borderRadius: 24,
  },
  speakerBtn: {
    paddingHorizontal: spacing.lg + 4,
    paddingVertical: spacing.sm + 4,
    borderRadius: radii.full,
    marginBottom: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakerBtnIdle: {
    backgroundColor: '#EDE9FE',
    borderWidth: 2,
    borderColor: '#C4B5FD',
    borderBottomWidth: 4,
    borderBottomColor: '#7C3AED',
  },
  speakerBtnActive: {
    backgroundColor: '#FFE4E6',
    borderWidth: 2,
    borderColor: '#FECDD3',
    borderBottomWidth: 4,
    borderBottomColor: '#E11D48',
  },
  speakerBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs + 2,
  },
  speakerIcon: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopSquare: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: '#E11D48',
  },
  speakerBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  speakerBtnTextIdle: {
    color: '#6D28D9',
  },
  speakerBtnTextActive: {
    color: '#DC2626',
  },
  narratingIndicator: {
    marginTop: 4,
    alignItems: 'center',
  },
  narratingIndicatorText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  choiceBox: {
    width: '100%',
    backgroundColor: '#FEF9E7',
    borderWidth: 1.5,
    borderColor: '#F9E79F',
    borderRadius: radii.card,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  choicePrompt: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7D6608',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  textBubbleInner: {
    paddingRight: 52, // room for the floating Listen button
    minHeight: 64,
  },
  listenBtn: {
    position: 'absolute',
    right: 14,
    top: 30,
    width: 60,
  },
  listenHalo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: kidTones.sky.fill,
  },
  listenBtnFace: {
    borderRadius: 30,
    paddingHorizontal: 0,
  },
  listenIcon: {
    fontSize: 26,
  },
  listenLabel: {
    position: 'absolute',
    right: 14,
    top: 98,
    width: 60,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: kidTones.sky.text,
  },
  bubbleSpacing: {
    marginTop: 18,
  },
  choiceArea: {
    marginTop: 16,
    gap: 12,
  },
  optionsList: {
    gap: 12,
  },
  choiceBtn: {
    width: '100%',
  },
  choicePointer: {
    marginRight: 10,
  },
  choiceText: {
    flexShrink: 1,
    fontSize: 16.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: '600',
    color: kidPalette.ink,
    lineHeight: 24,
  },
  pageNavRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  navBtn: {
    flex: 1,
  },

  // ---------- Finish ----------
  finishWrap: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 6,
  },
  trophyBubble: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: kidTones.sun.tint,
    borderWidth: 3,
    borderColor: kidTones.sun.fill,
    borderBottomWidth: 8,
    borderBottomColor: kidTones.sun.edge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: kidPalette.ink,
    textAlign: 'center',
  },
  finishSub: {
    fontSize: 16,
    fontWeight: '700',
    color: kidPalette.inkMuted,
    textAlign: 'center',
    lineHeight: 23,
  },
  coinPile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: kidTones.sun.fill,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderBottomWidth: 5,
    borderBottomColor: kidTones.sun.edge,
  },
  coinPileEmoji: {
    fontSize: 22,
  },
  coinPileText: {
    fontSize: 18,
    fontWeight: '700',
    color: kidTones.sun.onFill,
  },
  scroll: {
    width: '100%',
    backgroundColor: '#FFF4D6',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#F2C46D',
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: 'center',
    marginVertical: 8,
  },
  scrollRoll: {
    position: 'absolute',
    left: -6,
    right: -6,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F2C46D',
    borderBottomWidth: 3,
    borderBottomColor: '#D99A2B',
  },
  scrollRollTop: {
    top: -8,
  },
  scrollRollBottom: {
    bottom: -8,
  },
  scrollRibbon: {
    alignSelf: 'center',
    backgroundColor: '#F43F5E',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 6,
    marginBottom: 12,
    borderBottomWidth: 4,
    borderBottomColor: '#E11D48',
  },
  ribbonTail: {
    position: 'absolute',
    top: 8,
    width: 18,
    height: 22,
    backgroundColor: '#E11D48',
    zIndex: -1,
  },
  ribbonTailLeft: {
    left: -12,
    transform: [{ skewY: '18deg' }],
  },
  ribbonTailRight: {
    right: -12,
    transform: [{ skewY: '-18deg' }],
  },
  scrollRibbonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#78350F',
    textAlign: 'center',
    lineHeight: 27,
  },
  scrollStars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  finishActions: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 6,
  },
  finishBtn: {
    flexGrow: 1,
    flexBasis: 200,
  },
  shelfContainer: {
    gap: 18,
  },
  shelfHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: kidPalette.ink,
  },
  /* AI Magic Story Banner */
  magicBannerCard: {
    backgroundColor: '#7C3AED',
    borderRadius: radii.card,
    padding: spacing.md + 4,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#A78BFA',
    borderBottomWidth: 6,
    borderBottomColor: '#6D28D9',
  },
  magicBannerTopStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  magicAiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  magicAiTagText: {
    color: '#6D28D9',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  comingSoonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF08A',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: '#FDE047',
  },
  comingSoonBadgeText: {
    color: '#854D0E',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  magicRewardTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF08A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  magicRewardTagText: {
    color: '#854D0E',
    fontSize: 12,
    fontWeight: '700',
  },
  magicBannerMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  magicBannerIconBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  magicBannerArt: {
    width: 56,
    height: 56,
  },
  magicBannerArtDecor: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.95,
  },
  magicDecorWand: {
    width: 54,
    height: 54,
    transform: [{ rotate: '15deg' }],
  },
  magicBannerTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 4,
  },
  magicBannerSub: {
    color: '#EDE9FE',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  magicBannerCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#8B5CF6',
    borderRadius: kidRadii.pill,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: spacing.md,
    borderWidth: 1.5,
    borderColor: '#C4B5FD',
    borderBottomWidth: 4,
    borderBottomColor: '#6D28D9',
    alignSelf: 'stretch',
  },
  magicBannerCtaText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  /* My Saved Magic Stories */
  savedMagicSection: {
    marginBottom: spacing.lg,
  },
  savedMagicHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: spacing.sm,
  },
  savedMagicHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  savedMagicHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: kidPalette.ink,
  },
  savedCountPill: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  savedCountPillText: {
    color: '#0369A1',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Platform.OS === 'web' ? '"Baloo 2", "Noto Sans Gujarati", "Noto Sans Devanagari", "Shruti", sans-serif' : undefined,
  },
  savedClearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  savedClearBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  savedScrollRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  savedBookWrap: {
    width: 255,
  },
  savedBook: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 2,
    borderBottomWidth: 6,
    overflow: 'hidden',
  },
  savedStage: {
    height: 145,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderBottomWidth: 2,
    overflow: 'hidden',
  },
  savedStageHalo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  savedStageArt: {
    width: 76,
    height: 76,
  },
  savedStageEmoji: {
    fontSize: 50,
  },
  savedSparkleTopLeft: {
    position: 'absolute',
    top: 8,
    left: 12,
    fontSize: 14,
    opacity: 0.65,
  },
  savedSparkleBottomRight: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    fontSize: 13,
    opacity: 0.6,
  },
  savedMagicPill: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 1,
  },
  savedMagicPillText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#6D28D9',
  },
  savedCompanionCameo: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  savedCompanionCameoImg: {
    width: 26,
    height: 26,
  },
  savedBody: {
    padding: 13,
    paddingTop: 10,
    gap: 7,
    minHeight: 148,
    justifyContent: 'space-between',
  },
  savedStoryTitleBox: {
    minHeight: 44,
    justifyContent: 'center',
    marginVertical: 2,
  },
  savedBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  savedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  savedPagesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  savedPagesText: {
    fontSize: 11,
    fontWeight: '600',
    color: kidPalette.inkMuted,
  },
  savedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: kidPalette.ink,
    lineHeight: 21,
  },
  savedReadPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderBottomWidth: 4,
    borderRadius: 16,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginTop: 2,
  },
  savedReadPillText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  feedbackCoinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignSelf: 'center',
  },
  feedbackCoinText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B45309',
  },
  magicChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderBottomWidth: 4,
    borderBottomColor: '#CBD5E1',
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 6,
    minHeight: 120,
    justifyContent: 'center',
  },
  magicChipLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 17,
  },
  savedCoverArt: {
    width: 64,
    height: 64,
    marginBottom: 6,
  },
});
