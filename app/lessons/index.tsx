import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  useWindowDimensions,
  Platform,
  type GestureResponderEvent,
  type DimensionValue
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/colors';
import { spacing, radii, shadows } from '../../src/theme/spacing';
import { useApp } from '../../src/context/AppContext';
import { Header } from '../../src/components/Header';
import { BottomNav } from '../../src/components/BottomNav';
import { MascotGuide } from '../../src/components/MascotGuide';
import { CATEGORIES } from '../../src/data/categories';
import { LESSONS, getLessonAudio, getLessonDisplayLabels } from '../../src/data/lessons';
import { LessonItem } from '../../src/types';
import { apiService } from '../../src/services/apiService';
import { getLessonImageSource } from '../../src/utils/imageHelper';
import { ImageFrame } from '../../src/components/clay';
import { claySurface, kidRadii, kidBackdrops } from '../../src/theme/kidTheme';
import { renderGKCardVisual, formatGKCardTitle } from '../../src/components/GKCardVisuals';
import { renderMathCardVisual } from '../../src/components/MathCardVisuals';
import { renderLesson3DVisual } from '../../src/components/Lesson3DVisuals';
import { VisualArt } from '../../src/components/art3d/ContentArt';
import { GhadiyaTableView } from '../../src/components/GhadiyaTableView';
import { soundEffects } from '../../src/services/soundEffects';
import { audioService } from '../../src/services/audioService';
import { AppIcon } from '../../src/components/AppIcon';
import { HOME_CARD_ART, SUBJECT_CARD_ART } from '../../src/utils/imageHelper';
import { AppGlobalBackground } from '../../src/components/common/AppGlobalBackground';
import { PatternCardVisual } from '../../src/components/PatternCardVisuals';
import {
  MathBadgeIcon,
  TopicMultiplicationBadge,
  TopicNumberSenseBadge,
  TopicAdditionBadge,
  TopicSubtractionBadge,
  TopicDivisionBadge,
  TopicFractionsBadge,
  TopicMeasurementBadge,
  TopicGeometryBadge,
  TopicDecimalsBadge,
  TopicPatternsBadge,
  TopicTimeBadge,
  TopicMoneyBadge,
  TopicAlgebraBadge,
  TopicWordProblemsBadge,
  TopicAnimalsBadge,
  TopicPlantsBadge,
  TopicHumanBodyBadge,
  TopicFoodBadge,
  TopicWaterAirBadge,
  TopicWeatherBadge,
  TopicEarthBadge,
  TopicSpaceBadge,
  TopicMatterBadge,
  TopicDiscoveriesBadge,
  TopicGujaratiVarnamalaBadge,
  TopicHindiVarnamalaBadge,
  TopicAlphabetBadge,
  TopicPhonicsBadge,
  TopicVowelsBadge,
  TopicVocabularyBadge,
  TopicGrammarBadge,
  TopicNounsBadge,
  TopicVerbsBadge,
  TopicSentencesBadge,
  TopicOurWorldBadge,
  TopicStatesCapitalsBadge,
  TopicCountriesCapitalsBadge,
  TopicMonumentsBadge,
  TopicHistoryBadge,
  TopicGeographyBadge,
  TopicVehiclesBadge,
  TopicPersonalitiesBadge,
  TopicInventionsBadge,
  TopicNationalSymbolsBadge,
  TopicSportsBadge,
} from '../../src/components/SubjectBadgeIcons';
import {
  toGujDigits,
  toHiDigits,
  formatNumberDigits,
  formatMathExpression,
  HINDI_NUMBERS,
  GUJARATI_NUMBERS,
  ENGLISH_NUMBERS,
} from '../../src/utils/languageData';
import { filterLessonsForClass, getAgeClassBadgeInfo } from '../../src/utils/ageDetailHelper';
import { isBirdLesson } from '../../src/utils/lessonNavigation';
import * as Art from '../../src/components/art3d/Art3D';
import { webStyle } from '../../src/utils/webStyle';
import type { ImageAsset } from '../../src/utils/remoteAssets';


export const CARD_PASTEL_THEMES = [
  { bg: '#F0F9FF', border: '#BAE6FD', text: '#0369A1', pillBg: '#E0F2FE', pillText: '#0284C7' }, // Sky
  { bg: '#FFFBEB', border: '#FDE68A', text: '#B45309', pillBg: '#FEF3C7', pillText: '#D97706' }, // Amber
  { bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D', pillBg: '#DCFCE7', pillText: '#16A34A' }, // Mint
  { bg: '#FAF5FF', border: '#E9D5FF', text: '#7E22CE', pillBg: '#F3E8FF', pillText: '#9333EA' }, // Lavender
  { bg: '#FFF1F2', border: '#FECDD3', text: '#BE123C', pillBg: '#FFE4E6', pillText: '#E11D48' }, // Rose
  { bg: '#EEF2FF', border: '#C7D2FE', text: '#4338CA', pillBg: '#E0E7FF', pillText: '#0284C7' }, // Indigo
  { bg: '#FFF7ED', border: '#FED7AA', text: '#C2410C', pillBg: '#FFEDD5', pillText: '#EA580C' }, // Peach
  { bg: '#F0FDFA', border: '#99F6E4', text: '#0F766E', pillBg: '#CCFBF1', pillText: '#0D9488' }, // Teal
];

const CATEGORY_THEMES: Record<
  string,
  { emoji: string; bg: string; border: string; accent: string; badgeBg: string }
> = {
  'gu-varnamala': { emoji: '🔤', bg: '#ECFDF5', border: '#A7F3D0', accent: '#059669', badgeBg: '#D1FAE5' },
  'gu-barakhadi': { emoji: '✏️', bg: '#EFF6FF', border: '#BFDBFE', accent: '#2563EB', badgeBg: '#DBEAFE' },
  'en-alphabet': { emoji: '🅰️', bg: '#FFF7ED', border: '#FED7AA', accent: '#EA580C', badgeBg: '#FFEDD5' },
  'en-phonics': { emoji: '📢', bg: '#FAF5FF', border: '#E9D5FF', accent: '#7C3AED', badgeBg: '#F3E8FF' },
  'hi-varnamala': { emoji: '🕉️', bg: '#FEFCE8', border: '#FEF08A', accent: '#D97706', badgeBg: '#FEF3C7' },
  'numbers': { emoji: '🔢', bg: '#EFF6FF', border: '#BFDBFE', accent: '#2563EB', badgeBg: '#DBEAFE' },
  'math': { emoji: '➕', bg: '#F0FDF4', border: '#BBF7D0', accent: '#16A34A', badgeBg: '#DCFCE7' },
  'ghadiya': { emoji: '📊', bg: '#FFFBEB', border: '#FDE68A', accent: '#B45309', badgeBg: '#FEF3C7' },
  'colors-shapes': { emoji: '🎨', bg: '#FFF1F2', border: '#FECDD3', accent: '#E11D48', badgeBg: '#FFE4E6' },
  'animals': { emoji: '🦁', bg: '#FAF5FF', border: '#E9D5FF', accent: '#7C3AED', badgeBg: '#F3E8FF' },
  'fruits': { emoji: '🍎', bg: '#FFFBEB', border: '#FDE68A', accent: '#D97706', badgeBg: '#FEF3C7' },
  'objects': { emoji: '🏠', bg: '#ECFDF5', border: '#A7F3D0', accent: '#059669', badgeBg: '#D1FAE5' },
  'games': { emoji: '🎮', bg: '#EEF2FF', border: '#C7D2FE', accent: '#0284C7', badgeBg: '#E0E7FF' },
  'gk': { emoji: '🌍', bg: '#FEFCE8', border: '#FEF08A', accent: '#D97706', badgeBg: '#FEF3C7' },
  // Science Categories
  'plants-nature': { emoji: '🌱', bg: '#ECFDF5', border: '#A7F3D0', accent: '#059669', badgeBg: '#D1FAE5' },
  'human-body': { emoji: '👀', bg: '#FFF7ED', border: '#FED7AA', accent: '#EA580C', badgeBg: '#FFEDD5' },
  'water-air': { emoji: '💧', bg: '#F0F9FF', border: '#BAE6FD', accent: '#0284C7', badgeBg: '#E0F2FE' },
  'weather-seasons': { emoji: '⛅', bg: '#FEFCE8', border: '#FEF08A', accent: '#D97706', badgeBg: '#FEF3C7' },
  'earth-environment': { emoji: '🌍', bg: '#ECFDF5', border: '#A7F3D0', accent: '#059669', badgeBg: '#D1FAE5' },
  'space-solar': { emoji: '🚀', bg: '#FAF5FF', border: '#E9D5FF', accent: '#7C3AED', badgeBg: '#F3E8FF' },
  'scientific-discoveries': { emoji: '💡', bg: '#FFF7ED', border: '#FED7AA', accent: '#EA580C', badgeBg: '#FFEDD5' },
  // English Categories
  'en-vowels': { emoji: '🔤', bg: '#FAF5FF', border: '#E9D5FF', accent: '#7C3AED', badgeBg: '#F3E8FF' },
  'en-words': { emoji: '📚', bg: '#ECFDF5', border: '#A7F3D0', accent: '#059669', badgeBg: '#D1FAE5' },
  'en-grammar': { emoji: '📖', bg: '#EFF6FF', border: '#BFDBFE', accent: '#2563EB', badgeBg: '#DBEAFE' },
  'en-nouns': { emoji: '📦', bg: '#FFF7ED', border: '#FED7AA', accent: '#EA580C', badgeBg: '#FFEDD5' },
  'en-verbs': { emoji: '🏃', bg: '#FEFCE8', border: '#FEF08A', accent: '#D97706', badgeBg: '#FEF3C7' },
  'en-sentences': { emoji: '📝', bg: '#ECFDF5', border: '#A7F3D0', accent: '#059669', badgeBg: '#D1FAE5' },
  // GK Categories
  'gk-states': { emoji: '🗺️', bg: '#FFF7ED', border: '#FED7AA', accent: '#EA580C', badgeBg: '#FFEDD5' },
  'gk-countries': { emoji: '🚩', bg: '#EFF6FF', border: '#BFDBFE', accent: '#2563EB', badgeBg: '#DBEAFE' },
  'gk-monuments': { emoji: '🏛️', bg: '#FEFCE8', border: '#FEF08A', accent: '#D97706', badgeBg: '#FEF3C7' },
  'gk-history': { emoji: '📜', bg: '#FAF5FF', border: '#E9D5FF', accent: '#7C3AED', badgeBg: '#F3E8FF' },
  'gk-geography': { emoji: '🧭', bg: '#ECFDF5', border: '#A7F3D0', accent: '#059669', badgeBg: '#D1FAE5' },
  'gk-vehicles': { emoji: '🚗', bg: '#FFF7ED', border: '#FED7AA', accent: '#EA580C', badgeBg: '#FFEDD5' },
  'gk-personalities': { emoji: '⭐', bg: '#EFF6FF', border: '#BFDBFE', accent: '#2563EB', badgeBg: '#DBEAFE' },
  'gk-inventions': { emoji: '⚙️', bg: '#FEFCE8', border: '#FEF08A', accent: '#D97706', badgeBg: '#FEF3C7' },
  'gk-symbols': { emoji: '🦚', bg: '#FAF5FF', border: '#E9D5FF', accent: '#7C3AED', badgeBg: '#F3E8FF' },
  'gk-sports': { emoji: '🏆', bg: '#ECFDF5', border: '#A7F3D0', accent: '#059669', badgeBg: '#D1FAE5' },
  // Math Categories
  'math-time': { emoji: '⏰', bg: '#FFF7ED', border: '#FED7AA', accent: '#EA580C', badgeBg: '#FFEDD5' },
  'math-money': { emoji: '💰', bg: '#ECFDF5', border: '#A7F3D0', accent: '#059669', badgeBg: '#D1FAE5' },
  'math-missing': { emoji: '❓', bg: '#EFF6FF', border: '#BFDBFE', accent: '#2563EB', badgeBg: '#DBEAFE' },
  'math-word-problems': { emoji: '💬', bg: '#FEFCE8', border: '#FEF08A', accent: '#D97706', badgeBg: '#FEF3C7' },
};

/** Categories with bundled 3D cartoon art (others keep their topic badge). */
const CATEGORY_3D_ART: Record<string, ImageAsset> = {
  'gu-varnamala': HOME_CARD_ART.abc.gu,
  'gu-barakhadi': HOME_CARD_ART.abc.gu,
  'hi-varnamala': HOME_CARD_ART.abc.hi,
  'en-alphabet': HOME_CARD_ART.abc.en,
  numbers: HOME_CARD_ART.counting.en,
  animals: HOME_CARD_ART.animals,
  gk: SUBJECT_CARD_ART.gk,
  'en-words': SUBJECT_CARD_ART.english,
  games: SUBJECT_CARD_ART.braingames,
};

const renderCategoryBadgeIcon = (
  categoryId: string,
  size = 48,
  subcategoryId?: string,
  mathOp?: string
) => {
  const art3d = CATEGORY_3D_ART[categoryId];
  if (art3d) {
    return <Image source={art3d} resizeMode="contain" style={{ width: size * 1.15, height: size * 1.15 }} />;
  }
  if (categoryId === 'colors-shapes') {
    const s = (subcategoryId || '').toLowerCase();
    if (s === 'geometry' || s === 'shapes') {
      return <TopicGeometryBadge size={size} />;
    }
    if (s === 'patterns') {
      return <TopicPatternsBadge size={size} />;
    }
    return <AppIcon name="coloring" size={size} />;
  }
  if (categoryId === 'math') {
    const s = (subcategoryId || mathOp || '').toLowerCase();
    if (s.includes('meas') || s === 'measurement') {
      return <TopicMeasurementBadge size={size} />;
    }
    if (s.includes('dec') || s === 'decimals') {
      return <TopicDecimalsBadge size={size} />;
    }
    if (s.includes('div') || s === 'division') {
      return <TopicDivisionBadge size={size} />;
    }
    if (s.includes('mul') || s === 'multiplication') {
      return <TopicMultiplicationBadge size={size} />;
    }
    if (s.includes('sub') || s === 'subtraction') {
      return <TopicSubtractionBadge size={size} />;
    }
    if (s.includes('frac') || s === 'fractions') {
      return <TopicFractionsBadge size={size} />;
    }
    return <TopicAdditionBadge size={size} />;
  }
  switch (categoryId) {
    case 'numbers':
      return <TopicNumberSenseBadge size={size} />;
    case 'ghadiya':
      return <TopicMultiplicationBadge size={size} />;
    case 'animals':
      return <TopicAnimalsBadge size={size} />;
    case 'fruits':
      return <TopicFoodBadge size={size} />;
    case 'objects':
      return <TopicMatterBadge size={size} />;
    case 'games':
      return <AppIcon name="balloon" size={size} />;
    case 'gk':
      return <TopicOurWorldBadge size={size} />;
    case 'plants-nature':
      return <TopicPlantsBadge size={size} />;
    case 'human-body':
      return <TopicHumanBodyBadge size={size} />;
    case 'water-air':
      return <TopicWaterAirBadge size={size} />;
    case 'weather-seasons':
      return <TopicWeatherBadge size={size} />;
    case 'earth-environment':
      return <TopicEarthBadge size={size} />;
    case 'space-solar':
      return <TopicSpaceBadge size={size} />;
    case 'scientific-discoveries':
      return <TopicDiscoveriesBadge size={size} />;
    case 'gu-varnamala':
    case 'gu-barakhadi':
      return <TopicGujaratiVarnamalaBadge size={size} />;
    case 'hi-varnamala':
      return <TopicHindiVarnamalaBadge size={size} />;
    case 'en-alphabet':
      return <TopicAlphabetBadge size={size} />;
    case 'en-phonics':
      return <TopicPhonicsBadge size={size} />;
    case 'en-vowels':
      return <TopicVowelsBadge size={size} />;
    case 'en-words':
      return <TopicVocabularyBadge size={size} />;
    case 'en-grammar':
      return <TopicGrammarBadge size={size} />;
    case 'en-nouns':
      return <TopicNounsBadge size={size} />;
    case 'en-verbs':
      return <TopicVerbsBadge size={size} />;
    case 'en-sentences':
      return <TopicSentencesBadge size={size} />;
    case 'gk-states':
      return <TopicStatesCapitalsBadge size={size} />;
    case 'gk-countries':
      return <TopicCountriesCapitalsBadge size={size} />;
    case 'gk-monuments':
      return <TopicMonumentsBadge size={size} />;
    case 'gk-history':
      return <TopicHistoryBadge size={size} />;
    case 'gk-geography':
      return <TopicGeographyBadge size={size} />;
    case 'gk-vehicles':
      return <TopicVehiclesBadge size={size} />;
    case 'gk-personalities':
      return <TopicPersonalitiesBadge size={size} />;
    case 'gk-inventions':
      return <TopicInventionsBadge size={size} />;
    case 'gk-symbols':
      return <TopicNationalSymbolsBadge size={size} />;
    case 'gk-sports':
      return <TopicSportsBadge size={size} />;
    case 'math-time':
      return <TopicTimeBadge size={size} />;
    case 'math-money':
      return <TopicMoneyBadge size={size} />;
    case 'math-missing':
      return <TopicAlgebraBadge size={size} />;
    case 'math-word-problems':
      return <TopicWordProblemsBadge size={size} />;
    default:
      return <AppIcon name="abc" size={size} />;
  }
};

const renderLessonMiniBadge = (item: LessonItem, size = 32) => {
  if (item.categoryId === 'gu-varnamala' || item.categoryId === 'gu-barakhadi') {
    return <TopicGujaratiVarnamalaBadge size={size} />;
  }
  if (item.categoryId === 'hi-varnamala') {
    return <TopicHindiVarnamalaBadge size={size} />;
  }
  if (item.categoryId === 'en-alphabet' || item.categoryId === 'en-phonics') {
    return <TopicAlphabetBadge size={size} />;
  }
  if (item.categoryId === 'numbers') {
    return <TopicNumberSenseBadge size={size} />;
  }
  if (item.categoryId === 'math') {
    if (item.id.startsWith('math-meas')) {
      return <TopicMeasurementBadge size={size} />;
    }
    if (item.id.startsWith('math-dec')) {
      return <TopicDecimalsBadge size={size} />;
    }
    if (item.id.startsWith('math-frac')) {
      return <TopicFractionsBadge size={size} />;
    }
    if (item.id.startsWith('math-div')) {
      return <TopicDivisionBadge size={size} />;
    }
    if (item.id.startsWith('math-mul')) {
      return <TopicMultiplicationBadge size={size} />;
    }
    const s = item.symbol || '';
    if (s.includes('-') || s.includes('−')) {
      return <TopicSubtractionBadge size={size} />;
    }
    if (s.includes('×') || s.includes('*')) {
      return <TopicMultiplicationBadge size={size} />;
    }
    if (s.includes('÷') || s.includes('/')) {
      return <TopicDivisionBadge size={size} />;
    }
    return <TopicAdditionBadge size={size} />;
  }
  if (item.categoryId === 'ghadiya') {
    return <TopicMultiplicationBadge size={size} />;
  }
  if (item.categoryId === 'colors-shapes') {
    if (item.id.startsWith('cs-pattern')) {
      return <TopicPatternsBadge size={size} />;
    }
    const colorIds = [
      'cs-red',
      'cs-blue',
      'cs-yellow',
      'cs-green',
      'cs-orange',
      'cs-purple',
      'cs-pink',
      'cs-brown',
      'cs-white',
      'cs-black',
    ];
    if (!colorIds.includes(item.id)) {
      return <TopicGeometryBadge size={size} />;
    }
  }
  return renderCategoryBadgeIcon(item.categoryId, size);
};

type MathOperation = 'all' | 'add' | 'sub' | 'mul' | 'div' | 'frac' | 'meas' | 'dec';

export default function CategoryLessonsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 680;
  const isCompact = width < 360;
  const containerPadding = isMobile ? (isCompact ? 16 : 24) : 32;
  const gridGap = isCompact ? 8 : 12;

  const { categoryId, subcategoryId, op } = useLocalSearchParams<{
    categoryId?: string;
    subcategoryId?: string;
    op?: string;
  }>();
  const { language, ageGroup, progress, completeLesson, speak, t } = useApp();

  const resolveInitialOp = (sub?: string, opParam?: string): MathOperation => {
    const target = (sub || opParam || '').toLowerCase();
    if (target.includes('meas') || target === 'measurement') return 'meas';
    if (target.includes('dec') || target === 'decimals') return 'dec';
    if (target.includes('add') || target === 'addition') return 'add';
    if (target.includes('sub') || target === 'subtraction') return 'sub';
    if (target.includes('mul') || target === 'multiplication') return 'mul';
    if (target.includes('div') || target === 'division') return 'div';
    if (target.includes('frac') || target === 'fractions') return 'frac';
    return 'all';
  };

  const resolveInitialTopicTab = (catId: string, sub?: string): string => {
    const target = (sub || '').toLowerCase();
    if (catId === 'gu-varnamala' || catId === 'hi-varnamala') {
      if (target === 'swar') return 'swar';
      if (target === 'all') return 'all';
      return 'vyanjan';
    }
    if (catId === 'en-alphabet') {
      if (target === 'vowels') return 'vowels';
      if (target === 'consonants') return 'consonants';
      return 'all';
    }
    if (catId === 'numbers') {
      if (target === '21-50' && ageGroup !== '2-4') return '21-50';
      if (target === '51-100' && ageGroup === '6-8') return '51-100';
      if (target === 'all') return 'all';
      return '1-20';
    }
    if (catId === 'animals') {
      if (target === 'birds' || target === 'bird' || target === 'pakshi') return 'birds';
      if (target === 'animals' || target === 'animal' || target === 'prani') return 'animals';
      return 'all';
    }
    return 'all';
  };

  const defaultCategoryId =
    language === 'hi' ? 'hi-varnamala' : language === 'en' ? 'en-alphabet' : 'gu-varnamala';
  const currentCategory =
    CATEGORIES.find((c) => c.id === categoryId) ||
    CATEGORIES.find((c) => c.id === defaultCategoryId) ||
    CATEGORIES[0];

  const catTheme = CATEGORY_THEMES[currentCategory.id] || {
    emoji: '⭐',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    accent: '#2563EB',
    badgeBg: '#DBEAFE',
  };

  const getSubjectForCategory = (catId?: string, subCatId?: string): string => {
    if (!catId) return 'math';
    if (['numbers', 'math', 'ghadiya', 'math-time', 'math-money', 'math-missing', 'math-word-problems'].includes(catId)) {
      return 'math';
    }
    if (catId === 'colors-shapes') {
      return subCatId === 'patterns' ? 'logic' : 'math';
    }
    if (['plants-nature', 'human-body', 'water-air', 'weather-seasons', 'earth-environment', 'space-solar', 'scientific-discoveries', 'fruits', 'animals'].includes(catId)) {
      return 'science';
    }
    if (['en-alphabet', 'en-phonics', 'en-vowels', 'en-words', 'en-grammar', 'en-nouns', 'en-verbs', 'en-sentences', 'gu-varnamala', 'gu-barakhadi', 'hi-varnamala'].includes(catId)) {
      return 'english';
    }
    if (catId.startsWith('gk') || catId === 'objects') {
      return 'gk';
    }
    if (catId === 'games') {
      return 'logic';
    }
    return 'math';
  };

  const activeSubject = getSubjectForCategory(currentCategory.id, subcategoryId);
  const classBadge = getAgeClassBadgeInfo(ageGroup, language, activeSubject);

  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [filterMode, setFilterMode] = useState<'all' | 'remaining' | 'done'>('all');
  const [mathOperation, setMathOperation] = useState<MathOperation>(() =>
    resolveInitialOp(subcategoryId, op)
  );
  const [activeTopicTab, setActiveTopicTab] = useState<string>(() =>
    resolveInitialTopicTab(currentCategory.id, subcategoryId)
  );

  useEffect(() => {
    const initialOp = resolveInitialOp(subcategoryId, op);
    setMathOperation(initialOp);
    setActiveTopicTab(resolveInitialTopicTab(currentCategory.id, subcategoryId));
    setFilterMode('all');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, subcategoryId, op, ageGroup, currentCategory.id]);

  const applyCurriculumFilters = (rawList: LessonItem[]): LessonItem[] => {
    let items = rawList.filter((l) => l.categoryId === currentCategory.id || !l.categoryId);

    // Dynamic Age-matched & Subcategory-targeted Curriculum Filtering
    if (currentCategory.id === 'colors-shapes') {
      const targetSub = (subcategoryId || '').toLowerCase();
      if (targetSub === 'geometry' || targetSub === 'shapes') {
        const colorIds = [
          'cs-red',
          'cs-blue',
          'cs-yellow',
          'cs-green',
          'cs-orange',
          'cs-purple',
          'cs-pink',
          'cs-brown',
          'cs-white',
          'cs-black',
        ];
        items = items.filter((l) => !colorIds.includes(l.id) && !l.id.startsWith('cs-pattern'));
      } else if (targetSub === 'patterns') {
        items = items.filter((l) => l.id.startsWith('cs-pattern'));
      } else if (targetSub === 'colors') {
        const colorIds = [
          'cs-red',
          'cs-blue',
          'cs-yellow',
          'cs-green',
          'cs-orange',
          'cs-purple',
          'cs-pink',
          'cs-brown',
          'cs-white',
          'cs-black',
        ];
        items = items.filter((l) => colorIds.includes(l.id));
      } else if (ageGroup === '2-4') {
        items = items.filter((l) => l.ageGroup === '2-4' || l.ageGroup === 'all');
      }
    } else if (currentCategory.id === 'numbers' || currentCategory.id === 'ghadiya') {
      items = filterLessonsForClass(items, ageGroup, currentCategory.id);
    } else if (currentCategory.id === 'math') {
      const adds = items.filter((l) => l.id.startsWith('math-add'));
      const subs = items.filter((l) => l.id.startsWith('math-sub'));
      const muls = items.filter((l) => l.id.startsWith('math-mul'));
      const divs = items.filter((l) => l.id.startsWith('math-div'));
      const fracs = items.filter((l) => l.id.startsWith('math-frac'));
      const meas = items.filter((l) => l.id.startsWith('math-meas'));
      const decs = items.filter((l) => l.id.startsWith('math-dec'));

      const initialOp = resolveInitialOp(subcategoryId, op);
      if (initialOp === 'div') {
        items = divs;
      } else if (initialOp === 'meas') {
        items = meas;
      } else if (initialOp === 'dec') {
        items = decs;
      } else if (initialOp === 'frac') {
        items = fracs;
      } else if (initialOp === 'mul') {
        items = muls;
      } else if (initialOp === 'sub') {
        items = subs;
      } else if (initialOp === 'add') {
        items = adds;
      } else {
        if (ageGroup === '2-4') {
          items = [...adds.slice(0, 4), ...subs.slice(0, 2)];
        } else if (ageGroup === '4-6') {
          items = [...adds, ...subs, ...muls.slice(0, 3)];
        } else {
          items = [...adds, ...subs, ...muls, ...divs, ...fracs, ...meas, ...decs];
        }
      }
    } else {
      items = filterLessonsForClass(items, ageGroup, currentCategory.id);
    }
    return items;
  };

  useEffect(() => {
    let isMounted = true;
    const initialLocal = LESSONS.filter((l) => l.categoryId === currentCategory.id);
    setLessons(applyCurriculumFilters(initialLocal));

    apiService.fetchLessons(language, ageGroup, currentCategory.id).then((fetched) => {
      if (isMounted && fetched && fetched.length > 0) {
        setLessons(applyCurriculumFilters(fetched));
      }
    });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, subcategoryId, op, language, ageGroup, currentCategory.id]);

  // Operation & Topic Tab Filtering (Math operations, Varnamala Vyanjan/Swar, Numbers 1-20/21-50/51-100, Alphabet)
  const operationFilteredLessons = lessons.filter((l) => {
    if (currentCategory.id === 'math' && mathOperation !== 'all') {
      if (mathOperation === 'add' && !l.id.startsWith('math-add')) return false;
      if (mathOperation === 'sub' && !l.id.startsWith('math-sub')) return false;
      if (mathOperation === 'mul' && !l.id.startsWith('math-mul')) return false;
      if (mathOperation === 'div' && !l.id.startsWith('math-div')) return false;
      if (mathOperation === 'frac' && !l.id.startsWith('math-frac')) return false;
      if (mathOperation === 'meas' && !l.id.startsWith('math-meas')) return false;
      if (mathOperation === 'dec' && !l.id.startsWith('math-dec')) return false;
    }

    if (currentCategory.id === 'gu-varnamala') {
      if (activeTopicTab === 'vyanjan' && !l.id.startsWith('gu-vyan')) return false;
      if (activeTopicTab === 'swar' && !l.id.startsWith('gu-swar')) return false;
    }

    if (currentCategory.id === 'hi-varnamala') {
      if (activeTopicTab === 'vyanjan' && !l.id.startsWith('hi-vyan')) return false;
      if (activeTopicTab === 'swar' && !l.id.startsWith('hi-swar')) return false;
    }

    if (currentCategory.id === 'en-alphabet') {
      const vowels = ['en-alpha-a', 'en-alpha-e', 'en-alpha-i', 'en-alpha-o', 'en-alpha-u'];
      if (activeTopicTab === 'vowels' && !vowels.includes(l.id)) return false;
      if (activeTopicTab === 'consonants' && vowels.includes(l.id)) return false;
    }

    if (currentCategory.id === 'numbers' && ageGroup !== '2-4') {
      const match = l.id.match(/^num-(\d+)$/);
      const n = match ? parseInt(match[1], 10) : (l.countItems || 0);
      if (activeTopicTab === '1-20' && (n < 1 || n > 20)) return false;
      if (activeTopicTab === '21-50' && (n < 21 || n > 50)) return false;
      if (activeTopicTab === '51-100' && (n < 51 || n > 100)) return false;
    }

    if (currentCategory.id === 'animals') {
      const bird = isBirdLesson(l);

      if (activeTopicTab === 'animals' && bird) return false;
      if (activeTopicTab === 'birds' && !bird) return false;
    }

    return true;
  });

  const displayedLessons = operationFilteredLessons.filter((l) => {
    const isDone = progress.completedLessons.includes(l.id);
    if (filterMode === 'done') return isDone;
    if (filterMode === 'remaining') return !isDone;
    return true;
  });

  const lessonCount = displayedLessons.length;
  const numGridCols =
    width < 380
      ? 1
      : width < 720
        ? 2
        : lessonCount === 6
          ? 3
          : lessonCount === 8
            ? (width < 1050 ? 2 : 4)
            : width < 1050
              ? 3
              : 4;
  const gridItemWidth: DimensionValue =
    numGridCols === 1
      ? '100%'
      : Platform.OS === 'web'
        ? `calc(${100 / numGridCols}% - ${((numGridCols - 1) * gridGap) / numGridCols}px)`
        : Math.floor((width - containerPadding - (numGridCols - 1) * gridGap) / numGridCols);

  const activeTotalCount = operationFilteredLessons.length;
  const activeCompletedCount = operationFilteredLessons.filter((l) =>
    progress.completedLessons.includes(l.id)
  ).length;

  const activePercent =
    activeTotalCount > 0 ? Math.round((activeCompletedCount / activeTotalCount) * 100) : 0;

  const categoryHeaderTitle =
    currentCategory.id === 'gu-varnamala'
      ? activeTopicTab === 'vyanjan'
        ? language === 'gu'
          ? 'ગુજરાતી કક્કો (ક ખ ગ)'
          : language === 'hi'
            ? 'गुजराती व्यंजन (क ख ग)'
            : 'Gujarati Consonants (Ka Kha Ga)'
        : activeTopicTab === 'swar'
          ? language === 'gu'
            ? 'ગુજરાતી સ્વર (અ આ ઇ)'
            : language === 'hi'
              ? 'गुजराती स्वर (अ आ इ)'
              : 'Gujarati Vowels (A Aa I)'
          : language === 'gu'
            ? 'ગુજરાતી વર્ણમાળા (ક ખ ગ)'
            : language === 'hi'
              ? 'गुजराती वर्णमाला (क ख ग)'
              : 'Gujarati Alphabet'
      : currentCategory.id === 'hi-varnamala'
        ? activeTopicTab === 'vyanjan'
          ? language === 'gu'
            ? 'હિન્દી વ્યંજન (ક ખ ગ)'
            : language === 'hi'
              ? 'हिंदी व्यंजन (क ख ग)'
              : 'Hindi Consonants (Ka Kha Ga)'
          : activeTopicTab === 'swar'
            ? language === 'gu'
              ? 'હિન્દી સ્વર (અ આ ઇ)'
              : language === 'hi'
                ? 'हिंदी स्वर (अ आ इ)'
                : 'Hindi Vowels (A Aa I)'
            : language === 'gu'
              ? 'હિન્દી વર્ણમાળા (ક ખ ગ)'
              : language === 'hi'
                ? 'हिंदी वर्णमाला (क ख ग)'
                : 'Hindi Alphabet'
        : currentCategory.id === 'en-alphabet'
          ? activeTopicTab === 'vowels'
            ? 'English Vowels (A, E, I, O, U)'
            : activeTopicTab === 'consonants'
              ? 'English Consonants (B, C, D...)'
              : 'English Alphabet (A to Z)'
          : currentCategory.id === 'numbers'
            ? ageGroup === '2-4'
              ? language === 'gu'
                ? 'અંકો અને ગણતરી (૧ થી ૧૦)'
                : language === 'hi'
                  ? 'संख्याएं और गिनती (१ से १०)'
                  : 'Numbers & Counting (1 to 10)'
              : activeTopicTab === '1-20'
                ? language === 'gu'
                  ? 'અંકો અને ગણતરી (૧ થી ૨૦)'
                  : language === 'hi'
                    ? 'संख्याएं और गिनती (१ से २०)'
                    : 'Numbers & Counting (1 to 20)'
                : activeTopicTab === '21-50'
                  ? ageGroup === '4-6'
                    ? language === 'gu'
                      ? 'અંકો અને ગણતરી (૨૧ થી ૩૦)'
                      : language === 'hi'
                        ? 'संख्याएं और गिनती (२१ से ३०)'
                        : 'Numbers & Counting (21 to 30)'
                    : language === 'gu'
                      ? 'અંકો અને ગણતરી (૨૧ થી ૫૦)'
                      : language === 'hi'
                        ? 'संख्याएं और गिनती (२१ से ५०)'
                        : 'Numbers & Counting (21 to 50)'
                  : activeTopicTab === '51-100'
                    ? language === 'gu'
                      ? 'અંકો અને ગણતરી (૫૧ થી ૧૦૦)'
                      : language === 'hi'
                        ? 'संख्याएं और गिनती (५१ से १००)'
                        : 'Numbers & Counting (51 to 100)'
                    : ageGroup === '4-6'
                      ? language === 'gu'
                        ? 'બધા અંકો (૧ થી ૩૦)'
                        : language === 'hi'
                          ? 'सभी संख्याएं (१ से ३०)'
                          : 'All Numbers (1 to 30)'
                      : (ageGroup as string) === '2-4'
                        ? language === 'gu'
                          ? 'બધા અંકો (૧ થી ૧૦)'
                          : language === 'hi'
                            ? 'सभी संख्याएं (१ से १०)'
                            : 'All Numbers (1 to 10)'
                        : language === 'gu'
                          ? 'બધા અંકો (૧ થી ૧૦૦)'
                          : language === 'hi'
                            ? 'सभी संख्याएं (१ से १००)'
                            : 'All Numbers (1 to 100)'
            : currentCategory.id === 'animals'
              ? activeTopicTab === 'animals'
                ? language === 'gu'
                  ? 'પ્રાણીઓ (Animals)'
                  : language === 'hi'
                    ? 'जानवर (Animals)'
                    : 'Animals'
                : activeTopicTab === 'birds'
                  ? language === 'gu'
                    ? 'પક્ષીઓ (Birds)'
                    : language === 'hi'
                      ? 'पक्षी (Birds)'
                      : 'Birds'
                  : language === 'gu'
                    ? 'પ્રાણીઓ અને પક્ષીઓ'
                    : language === 'hi'
                      ? 'जानवर और पक्षी'
                      : 'Animals & Birds'
              : currentCategory.id === 'ghadiya'
                ? language === 'gu'
                  ? ageGroup === '6-8'
                    ? 'ઘડિયા (૬ થી ૧૦)'
                    : 'ઘડિયા (૧ થી ૫)'
                  : language === 'hi'
                    ? ageGroup === '6-8'
                      ? 'पहाड़े (६ से १०)'
                      : 'पहाड़े (१ से ५)'
                    : ageGroup === '6-8'
                      ? 'Math Tables (6 to 10)'
                      : 'Math Tables (1 to 5)'
                : currentCategory.id === 'colors-shapes' &&
                  ((subcategoryId || '').toLowerCase() === 'geometry' || (subcategoryId || '').toLowerCase() === 'shapes')
                  ? language === 'gu'
                    ? 'ભૂમિતિ અને આકારો'
                    : language === 'hi'
                      ? 'ज्यामिति और आकार'
                      : 'Geometry & Shapes'
                  : currentCategory.id === 'colors-shapes' &&
                    (subcategoryId || '').toLowerCase() === 'patterns'
                    ? language === 'gu'
                      ? 'ગણિતીય પેટર્ન'
                      : language === 'hi'
                        ? 'पैटर्न और अनुक्रम'
                        : 'Patterns & Sequences'
                    : currentCategory.id === 'math'
                      ? mathOperation === 'meas' || (subcategoryId || '').toLowerCase() === 'measurement'
                        ? language === 'gu' ? 'માપન (Measurement)' : language === 'hi' ? 'मापन' : 'Measurement'
                        : mathOperation === 'div' || (subcategoryId || '').toLowerCase() === 'division'
                          ? language === 'gu' ? 'ભાગાકાર (Division)' : language === 'hi' ? 'भाग' : 'Division'
                          : mathOperation === 'mul' || (subcategoryId || '').toLowerCase() === 'multiplication'
                            ? language === 'gu' ? 'ગુણાકાર (Multiplication)' : language === 'hi' ? 'गुणा' : 'Multiplication'
                            : mathOperation === 'frac' || (subcategoryId || '').toLowerCase() === 'fractions'
                              ? language === 'gu' ? 'અપૂર્ણાંક (Fractions)' : language === 'hi' ? 'भिन्न' : 'Fractions'
                              : mathOperation === 'dec' || (subcategoryId || '').toLowerCase() === 'decimals'
                                ? language === 'gu' ? 'દશાંશ (Decimals)' : language === 'hi' ? 'दशमलव' : 'Decimals'
                                : language === 'gu'
                                  ? 'ગણિત'
                                  : language === 'hi'
                                    ? 'गणित'
                                    : 'Math'
                      : (() => {
                        const trans = currentCategory.titleKey ? t(currentCategory.titleKey) : '';
                        return trans && trans !== currentCategory.titleKey ? trans : currentCategory.defaultTitle;
                      })();

  const categorySubtitle =
    currentCategory.id === 'gu-varnamala'
      ? activeTopicTab === 'vyanjan'
        ? language === 'gu'
          ? 'વ્યંજન (ક થી જ્ઞ) • ૩૪ મૂળાક્ષરો'
          : language === 'hi'
            ? 'व्यंजन (क से ज्ञ) • ३४ अक्षर'
            : 'Consonants (Ka to Gna) • 34 letters'
        : activeTopicTab === 'swar'
          ? language === 'gu'
            ? 'સ્વર (અ થી અઃ) • ૧૩ સ્વરો'
            : language === 'hi'
              ? 'स्वर (अ से अः) • १३ स्वर'
              : 'Vowels (A to Ah) • 13 vowels'
          : language === 'gu'
            ? 'સ્વર અને વ્યંજન (અ થી જ્ઞ) • ૪૭ મૂળાક્ષરો'
            : language === 'hi'
              ? 'स्वर और व्यंजन (अ से ज्ञ) • ४७ अक्षर'
              : 'Vowels & Consonants • 47 letters'
      : currentCategory.id === 'hi-varnamala'
        ? activeTopicTab === 'vyanjan'
          ? language === 'gu'
            ? 'વ્યંજન (ક થી જ્ઞ) • ૩૭ અક્ષર'
            : language === 'hi'
              ? 'व्यंजन (क से ज्ञ) • ३७ अक्षर'
              : 'Consonants (Ka to Gna) • 37 letters'
          : activeTopicTab === 'swar'
            ? language === 'gu'
              ? 'સ્વર (અ થી અઃ) • ૧૩ સ્વરો'
              : language === 'hi'
                ? 'स्वर (अ से अः) • १३ स्वर'
                : 'Vowels (A to Ah) • 13 vowels'
            : language === 'gu'
              ? 'સ્વર અને વ્યંજન • ૫૦ અક્ષર'
              : language === 'hi'
                ? 'स्वर और व्यंजन • ५० अक्षर'
                : 'Vowels & Consonants • 50 letters'
        : currentCategory.id === 'en-alphabet'
          ? activeTopicTab === 'vowels'
            ? '5 Vowel Letters (A, E, I, O, U)'
            : activeTopicTab === 'consonants'
              ? '21 Consonant Letters (B, C, D...)'
              : '26 Letters from A to Z'
          : currentCategory.id === 'numbers'
            ? ageGroup === '2-4'
              ? language === 'hi'
                ? '१ से १० संख्याएं और गिनती'
                : language === 'en'
                  ? 'Numbers 1 to 10 & Counting'
                  : '૧ થી ૧૦ અંકો અને ગણતરી'
              : activeTopicTab === '1-20'
                ? language === 'hi'
                  ? '१ से २० संख्याएं और गिनती'
                  : language === 'en'
                    ? 'Numbers 1 to 20 & Counting'
                    : '૧ થી ૨૦ અંકો અને ગણતરી'
                : activeTopicTab === '21-50'
                  ? ageGroup === '4-6'
                    ? language === 'hi'
                      ? '२१ से ३० संख्याएं'
                      : language === 'en'
                        ? 'Numbers 21 to 30'
                        : '૨૧ થી ૩૦ અંકો'
                    : language === 'hi'
                      ? '२१ से ५० संख्याएं'
                      : language === 'en'
                        ? 'Numbers 21 to 50'
                        : '૨૧ થી ૫૦ અંકો'
                  : activeTopicTab === '51-100'
                    ? language === 'hi'
                      ? '५१ से १०० संख्याएं'
                      : language === 'en'
                        ? 'Numbers 51 to 100'
                        : '૫૧ થી ૧૦૦ અંકો'
                    : ageGroup === '4-6'
                      ? language === 'hi'
                        ? '१ से ३० तक की सभी संख्याएं'
                        : language === 'en'
                          ? 'All numbers from 1 to 30'
                          : '૧ થી ૩૦ સુધીના તમામ અંકો'
                      : (ageGroup as string) === '2-4'
                        ? language === 'hi'
                          ? '१ से १० तक की सभी संख्याएं'
                          : language === 'en'
                            ? 'All numbers from 1 to 10'
                            : '૧ થી ૧૦ સુધીના તમામ અંકો'
                        : language === 'hi'
                          ? '१ से १०० तक की सभी संख्याएं'
                          : language === 'en'
                            ? 'All numbers from 1 to 100'
                            : '૧ થી ૧૦૦ સુધીના તમામ અંકો'
            : currentCategory.id === 'animals'
              ? activeTopicTab === 'animals'
                ? language === 'gu'
                  ? 'સિંહ, વાઘ, હાથી, ગાય અને વન્ય પ્રાણીઓ'
                  : language === 'hi'
                    ? 'शेर, बाघ, हाथी, गाय और वन्य जीव'
                    : 'Lion, Tiger, Elephant, Cow & more'
                : activeTopicTab === 'birds'
                  ? language === 'gu'
                    ? 'મોર, પોપટ, ચકલી, હંસ અને સુંદર પક્ષીઓ'
                    : language === 'hi'
                      ? 'मोर, तोता, चिड़िया, हंस और सुंदर पक्षी'
                      : 'Peacock, Parrot, Sparrow, Swan & more'
                  : language === 'gu'
                    ? 'પ્રાણીઓ અને પક્ષીઓની રંગબેરંગી દુનિયા'
                    : language === 'hi'
                      ? 'जानवरों और पक्षियों की रंग-बिरंगी दुनिया'
                      : 'Explore animals and birds world'
              : currentCategory.id === 'ghadiya'
                ? language === 'hi'
                  ? ageGroup === '6-8'
                    ? '६ से १० के पहाड़े (तालिका)'
                    : '१ से ५ के पहाड़े (तालिका)'
                  : language === 'en'
                    ? ageGroup === '6-8'
                      ? 'Tables 6 to 10 (Table format)'
                      : 'Tables 1 to 5 (Table format)'
                    : ageGroup === '6-8'
                      ? '૬ થી ૧૦ ના ઘડિયા (કોષ્ટક)'
                      : '૧ થી ૫ ના ઘડિયા (કોષ્ટક)'
                : currentCategory.id === 'colors-shapes'
                  ? (subcategoryId || '').toLowerCase() === 'geometry' || (subcategoryId || '').toLowerCase() === 'shapes'
                    ? language === 'hi'
                      ? 'ज्यामिति और आकार (वृत्त, वर्ग, त्रिकोण, 3D आकार)'
                      : language === 'en'
                        ? 'Geometry & Shapes (Circle, Square, Triangle, 3D Shapes)'
                        : 'ભૂમિતિ અને આકારો (ગોળ, ચોરસ, ત્રિકોણ, ૩D આકારો)'
                    : (subcategoryId || '').toLowerCase() === 'patterns'
                      ? language === 'hi'
                        ? 'तार्किक पैटर्न और अनुक्रम'
                        : language === 'en'
                          ? 'Cognitive Patterns & Sequences'
                          : 'ગણિતીય પેટર્ન અને ક્રમ'
                      : currentCategory.subtitleKey
                        ? t(currentCategory.subtitleKey)
                        : currentCategory.subtitle
                  : currentCategory.id === 'math'
                    ? mathOperation === 'add'
                      ? language === 'hi' ? 'जोड़ के सवाल' : language === 'en' ? 'Addition Problems' : 'સરવાળાના દાખલા'
                      : mathOperation === 'sub'
                        ? language === 'hi' ? 'घटाव के सवाल' : language === 'en' ? 'Subtraction Problems' : 'બાદબાકીના દાખલા'
                        : mathOperation === 'mul'
                          ? language === 'hi' ? 'गुणा के सवाल' : language === 'en' ? 'Multiplication Problems' : 'ગુણાકારના દાખલા'
                          : mathOperation === 'div'
                            ? language === 'hi' ? 'भाग के सवाल' : language === 'en' ? 'Division Problems' : 'ભાગાકારના દાખલા'
                            : mathOperation === 'frac'
                              ? language === 'hi' ? 'भिन्न (आधा, चौथाई, पौना)' : language === 'en' ? 'Fractions (Half, Quarter)' : 'અપૂર્ણાંક (અડધું, પા, પોણો)'
                              : mathOperation === 'meas'
                                ? language === 'hi' ? 'मापन के पाठ (लंबाई, भार, धारिता)' : language === 'en' ? 'Measurement Lessons (Units & Scales)' : 'માપનના એકમો (લંબાઈ, વજન, ક્ષમતા)'
                                : mathOperation === 'dec'
                                  ? language === 'hi' ? 'दशमलव संख्याएं' : language === 'en' ? 'Decimal Numbers' : 'દશાંશ સંખ્યાઓ'
                                  : language === 'hi'
                                    ? 'गणित के अभ्यास सवाल'
                                    : language === 'en'
                                      ? 'Math Practice Problems'
                                      : 'ગણિતના દાખલાઓ'
                    : (() => {
                      const trans = currentCategory.subtitleKey ? t(currentCategory.subtitleKey) : '';
                      return trans && trans !== currentCategory.subtitleKey ? trans : (currentCategory.subtitle || '');
                    })();

  interface TopicTabItem {
    id: string;
    labelGu: string;
    labelHi: string;
    labelEn: string;
    symbol: string;
    accentColor: string;
    badgeBg: string;
    count: number;
  }

  let topicTabs: TopicTabItem[] = [];

  if (currentCategory.id === 'gu-varnamala') {
    const vyanjanCount = lessons.filter((l) => l.id.startsWith('gu-vyan')).length;
    const swarCount = lessons.filter((l) => l.id.startsWith('gu-swar')).length;
    topicTabs = [
      {
        id: 'vyanjan',
        labelGu: 'કક્કો (ક ખ ગ)',
        labelHi: 'ककौ (क ख ग)',
        labelEn: 'Consonants (Ka Kha Ga)',
        symbol: '🔤',
        accentColor: '#059669',
        badgeBg: '#D1FAE5',
        count: vyanjanCount,
      },
      {
        id: 'swar',
        labelGu: 'સ્વર (અ આ ઇ)',
        labelHi: 'स्वर (अ आ इ)',
        labelEn: 'Vowels (A Aa I)',
        symbol: '🅰️',
        accentColor: '#EA580C',
        badgeBg: '#FFEDD5',
        count: swarCount,
      },
      {
        id: 'all',
        labelGu: 'બધા મૂળાક્ષરો',
        labelHi: 'सभी अक्षर',
        labelEn: 'All Letters',
        symbol: '📚',
        accentColor: '#2563EB',
        badgeBg: '#DBEAFE',
        count: lessons.length,
      },
    ];
  } else if (currentCategory.id === 'hi-varnamala') {
    const vyanjanCount = lessons.filter((l) => l.id.startsWith('hi-vyan')).length;
    const swarCount = lessons.filter((l) => l.id.startsWith('hi-swar')).length;
    topicTabs = [
      {
        id: 'vyanjan',
        labelGu: 'વ્યંજન (ક ખ ગ)',
        labelHi: 'व्यंजन (क ख ग)',
        labelEn: 'Consonants (Ka Kha Ga)',
        symbol: '🔤',
        accentColor: '#D97706',
        badgeBg: '#FEF3C7',
        count: vyanjanCount,
      },
      {
        id: 'swar',
        labelGu: 'સ્વર (અ આ ઇ)',
        labelHi: 'स्वर (अ आ इ)',
        labelEn: 'Vowels (A Aa I)',
        symbol: '🅰️',
        accentColor: '#EA580C',
        badgeBg: '#FFEDD5',
        count: swarCount,
      },
      {
        id: 'all',
        labelGu: 'પૂરી વર્ણમાળા',
        labelHi: 'पूरी वर्णमाला',
        labelEn: 'All Letters',
        symbol: '📚',
        accentColor: '#2563EB',
        badgeBg: '#DBEAFE',
        count: lessons.length,
      },
    ];
  } else if (currentCategory.id === 'en-alphabet') {
    const vowels = ['en-alpha-a', 'en-alpha-e', 'en-alpha-i', 'en-alpha-o', 'en-alpha-u'];
    const vowelsCount = lessons.filter((l) => vowels.includes(l.id)).length;
    const consonantsCount = lessons.filter((l) => !vowels.includes(l.id)).length;
    topicTabs = [
      {
        id: 'all',
        labelGu: 'બધા (A to Z)',
        labelHi: 'सभी (A to Z)',
        labelEn: 'All Letters (A-Z)',
        symbol: '🔤',
        accentColor: '#EA580C',
        badgeBg: '#FFEDD5',
        count: lessons.length,
      },
      {
        id: 'vowels',
        labelGu: 'સ્વર (Vowels)',
        labelHi: 'स्वर (Vowels)',
        labelEn: 'Vowels (A, E, I, O, U)',
        symbol: '🅰️',
        accentColor: '#7C3AED',
        badgeBg: '#F3E8FF',
        count: vowelsCount,
      },
      {
        id: 'consonants',
        labelGu: 'વ્યંજન (Consonants)',
        labelHi: 'व्यंजन (Consonants)',
        labelEn: 'Consonants',
        symbol: '🔡',
        accentColor: '#2563EB',
        badgeBg: '#DBEAFE',
        count: consonantsCount,
      },
    ];
  } else if (currentCategory.id === 'numbers') {
    const num1to20Count = lessons.filter((l) => {
      const match = l.id.match(/^num-(\d+)$/);
      const n = match ? parseInt(match[1], 10) : (l.countItems || 0);
      return n >= 1 && n <= 20;
    }).length;
    const num21to50Count = lessons.filter((l) => {
      const match = l.id.match(/^num-(\d+)$/);
      const n = match ? parseInt(match[1], 10) : (l.countItems || 0);
      return n >= 21 && n <= 50;
    }).length;
    const num51to100Count = lessons.filter((l) => {
      const match = l.id.match(/^num-(\d+)$/);
      const n = match ? parseInt(match[1], 10) : (l.countItems || 0);
      return n >= 51 && n <= 100;
    }).length;

    const availableTabs = [];
    if (num1to20Count > 0) {
      availableTabs.push({
        id: '1-20',
        labelGu: ageGroup === '2-4' ? '૧ થી ૧૦' : '૧ થી ૨૦',
        labelHi: ageGroup === '2-4' ? '१ से १०' : '१ से २०',
        labelEn: ageGroup === '2-4' ? '1 to 10' : '1 to 20',
        symbol: '🔢',
        accentColor: '#2563EB',
        badgeBg: '#DBEAFE',
        count: num1to20Count,
      });
    }
    if (num21to50Count > 0) {
      availableTabs.push({
        id: '21-50',
        labelGu: ageGroup === '4-6' ? '૨૧ થી ૩૦' : '૨૧ થી ૫૦',
        labelHi: ageGroup === '4-6' ? '२१ से ३०' : '२१ से ५०',
        labelEn: ageGroup === '4-6' ? '21 to 30' : '21 to 50',
        symbol: '🔢',
        accentColor: '#059669',
        badgeBg: '#D1FAE5',
        count: num21to50Count,
      });
    }
    if (num51to100Count > 0) {
      availableTabs.push({
        id: '51-100',
        labelGu: '૫૧ થી ૧૦૦',
        labelHi: '५१ से १००',
        labelEn: '51 to 100',
        symbol: '💯',
        accentColor: '#7C3AED',
        badgeBg: '#EDE9FE',
        count: num51to100Count,
      });
    }

    // Only show tabs if there are multiple ranges (hide tabs when there's only 1 range, e.g. Nursery 1-10)
    if (availableTabs.length > 1) {
      availableTabs.push({
        id: 'all',
        labelGu: ageGroup === '4-6' ? 'બધા (૧-૩૦)' : ageGroup === '2-4' ? 'બધા (૧-૧૦)' : 'બધા (૧-૧૦૦)',
        labelHi: ageGroup === '4-6' ? 'सभी (१-३०)' : ageGroup === '2-4' ? 'सभी (१-१०)' : 'सभी (१-१००)',
        labelEn: ageGroup === '4-6' ? 'All (1-30)' : ageGroup === '2-4' ? 'All (1-10)' : 'All (1-100)',
        symbol: '⭐',
        accentColor: '#D97706',
        badgeBg: '#FEF3C7',
        count: lessons.length,
      });
      topicTabs = availableTabs;
    } else {
      topicTabs = [];
    }
  } else if (currentCategory.id === 'animals') {
    const birdsCount = lessons.filter(isBirdLesson).length;
    const animalsCount = lessons.filter((l) => !isBirdLesson(l)).length;

    topicTabs = [
      {
        id: 'all',
        labelGu: 'બધા',
        labelHi: 'सभी',
        labelEn: 'All',
        symbol: '🦁',
        accentColor: '#7C3AED',
        badgeBg: '#F3E8FF',
        count: lessons.length,
      },
      {
        id: 'animals',
        labelGu: 'પ્રાણીઓ',
        labelHi: 'जानवर',
        labelEn: 'Animals',
        symbol: '🐾',
        accentColor: '#EA580C',
        badgeBg: '#FFEDD5',
        count: animalsCount,
      },
      {
        id: 'birds',
        labelGu: 'પક્ષીઓ',
        labelHi: 'पक्षी',
        labelEn: 'Birds',
        symbol: '🐦',
        accentColor: '#059669',
        badgeBg: '#D1FAE5',
        count: birdsCount,
      },
    ];
  }

  const addCount = lessons.filter((l) => l.id.startsWith('math-add')).length;
  const subCount = lessons.filter((l) => l.id.startsWith('math-sub')).length;
  const mulCount = lessons.filter((l) => l.id.startsWith('math-mul')).length;
  const divCount = lessons.filter((l) => l.id.startsWith('math-div')).length;
  const fracCount = lessons.filter((l) => l.id.startsWith('math-frac')).length;
  const measCount = lessons.filter((l) => l.id.startsWith('math-meas')).length;
  const decCount = lessons.filter((l) => l.id.startsWith('math-dec')).length;

  interface MathOpItem {
    id: MathOperation;
    labelGu: string;
    labelHi: string;
    labelEn: string;
    symbol: string;
    accentColor: string;
    badgeBg: string;
    count: number;
  }

  const rawMathOps: MathOpItem[] = [
    {
      id: 'all',
      labelGu: 'બધું (All)',
      labelHi: 'सभी (All)',
      labelEn: 'All',
      symbol: '🔢',
      accentColor: '#2563EB',
      badgeBg: '#DBEAFE',
      count: lessons.length,
    },
    {
      id: 'add',
      labelGu: 'સરવાળા',
      labelHi: 'जोड़',
      labelEn: 'Addition',
      symbol: '➕',
      accentColor: '#059669',
      badgeBg: '#D1FAE5',
      count: addCount,
    },
    {
      id: 'sub',
      labelGu: 'બાદબાકી',
      labelHi: 'घटाव',
      labelEn: 'Subtraction',
      symbol: '➖',
      accentColor: '#DC2626',
      badgeBg: '#FEE2E2',
      count: subCount,
    },
    {
      id: 'mul',
      labelGu: 'ગુણાકાર',
      labelHi: 'गुणा',
      labelEn: 'Multiplication',
      symbol: '✖️',
      accentColor: '#D97706',
      badgeBg: '#FEF3C7',
      count: mulCount,
    },
    {
      id: 'div',
      labelGu: 'ભાગાકાર',
      labelHi: 'भाग',
      labelEn: 'Division',
      symbol: '➗',
      accentColor: '#7C3AED',
      badgeBg: '#EDE9FE',
      count: divCount,
    },
    {
      id: 'frac',
      labelGu: 'અપૂર્ણાંક',
      labelHi: 'भिन्न',
      labelEn: 'Fractions',
      symbol: '🥧',
      accentColor: '#059669',
      badgeBg: '#D1FAE5',
      count: fracCount,
    },
    {
      id: 'meas',
      labelGu: 'માપન',
      labelHi: 'मापन',
      labelEn: 'Measurement',
      symbol: '📏',
      accentColor: '#0D9488',
      badgeBg: '#CCFBF1',
      count: measCount,
    },
    {
      id: 'dec',
      labelGu: 'દશાંશ',
      labelHi: 'दशमलव',
      labelEn: 'Decimals',
      symbol: '🔢',
      accentColor: '#E11D48',
      badgeBg: '#FFE4E6',
      count: decCount,
    },
  ];

  const MATH_OPERATIONS = rawMathOps.filter((op) => op.id === 'all' || op.count > 0);

  const handleQuickPlay = async (e: GestureResponderEvent, item: LessonItem) => {
    e?.stopPropagation?.();
    soundEffects.playBubblePop();

    const audio = getLessonAudio(item, language);
    speak(audio.text, audio.lang);
  };

  const navigatingToChildRef = useRef(false);

  useEffect(() => {
    return () => {
      if (!navigatingToChildRef.current) {
        audioService.stop();
        soundEffects.stopAnimalSound();
      }
    };
  }, []);

  // Silence all audio immediately when screen loses focus in stack navigation
  useFocusEffect(
    useCallback(() => {
      navigatingToChildRef.current = false;
      return () => {
        if (!navigatingToChildRef.current) {
          audioService.stop();
          soundEffects.stopAnimalSound();
        }
      };
    }, [])
  );

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
              router.replace('/subjects');
            }
          }, 150);
          return;
        }
      } catch { }
      router.replace('/subjects');
      return;
    }

    try {
      if (router.canGoBack()) {
        router.back();
        return;
      }
    } catch { }
    router.replace('/subjects');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppGlobalBackground id="lessonsIndexBgGrad" />
      <Header
        title={categoryHeaderTitle}
        showBack={true}
        onBack={handleBack}
      />

      <ScrollView contentContainerStyle={[styles.container, isMobile && styles.containerMobile]} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
        {/* 3D Vibrant Gamified Hero Banner Matching Screenshot 1 Design */}
        <View
          style={[
            styles.heroBanner,
            isMobile && styles.heroBannerMobile,
            webStyle({
              boxShadow: '0 4px 18px rgba(0, 0, 0, 0.05)',
            }),
          ]}
        >
          {/* Left Column: Title, Subtitle & Gamified Progress */}
          <View style={styles.heroContentCol}>
            <View style={[styles.heroTagBadge, { backgroundColor: classBadge.tagBg }]}>
              <Text style={[styles.heroTagText, { color: classBadge.tagColor }]}>
                {classBadge.badgeLabel} • {classBadge.title}
              </Text>
            </View>

            <Text style={styles.heroTitle}>{categoryHeaderTitle}</Text>
            <Text style={styles.heroSubtitle}>{categorySubtitle}</Text>

            {/* Visual Progress Bar Track with Stars */}
            <View style={styles.progressSection}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(100, Math.max(0, activePercent))}%`,
                      backgroundColor: catTheme.accent,
                    },
                  ]}
                />
              </View>
              <View style={styles.progressInfoRow}>
                <Text style={styles.progressText}>
                  {language === 'gu'
                    ? `${toGujDigits(activeCompletedCount)} / ${toGujDigits(activeTotalCount)} પાઠ પૂર્ણ`
                    : language === 'hi'
                      ? `${toHiDigits(activeCompletedCount)} / ${toHiDigits(activeTotalCount)} पाठ पूरे`
                      : `${activeCompletedCount} / ${activeTotalCount} lessons completed`}
                </Text>
              </View>
            </View>
          </View>

          {/* Right Column: 3D Illustration & Percentage Ring */}
          <View style={styles.heroRightBadge}>
            <View
              style={[
                styles.emojiCircle,
                { backgroundColor: '#FFFFFF', borderColor: 'rgba(0,0,0,0.06)' },
                shadows.soft,
              ]}
            >
              {renderCategoryBadgeIcon(currentCategory.id, 46, subcategoryId || activeTopicTab, mathOperation)}
            </View>
            <View style={[styles.percentPill, { backgroundColor: catTheme.accent }, shadows.soft]}>
              <Text style={styles.percentText}>
                {formatNumberDigits(activePercent, language)}%
              </Text>
            </View>
          </View>
        </View>

        {/* If category is ghadiya, render dedicated 3D Table View */}
        {currentCategory.id === 'ghadiya' ? (
          <GhadiyaTableView
            lessons={lessons}
            completedLessonIds={progress.completedLessons}
            onCompleteLesson={(id) => completeLesson(id)}
            onOpenLessonDetail={(id) => router.push(`/lessons/${id}`)}
          />
        ) : (
          <>
            {/* Math Operations Filter Bar (Multiplication, Division, Addition, Subtraction) */}
            {currentCategory.id === 'math' && (
              <View style={styles.mathOpsContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.mathOpsScroll}
                  nestedScrollEnabled={true}
                  directionalLockEnabled={true}
                  keyboardShouldPersistTaps="handled"
                >
                  {MATH_OPERATIONS.map((op) => {
                    const isSelected = mathOperation === op.id;
                    const opLabel =
                      language === 'gu'
                        ? op.labelGu
                        : language === 'hi'
                          ? op.labelHi
                          : op.labelEn;

                    return (
                      <TouchableOpacity
                        key={op.id}
                        style={[
                          styles.mathOpButton,
                          isSelected
                            ? [
                              styles.mathOpButtonActive,
                              { backgroundColor: op.accentColor, borderColor: op.accentColor },
                            ]
                            : { borderColor: op.accentColor + '55', backgroundColor: '#FFFFFF' },
                          shadows.soft,
                        ]}
                        onPress={() => {
                          soundEffects.playBubblePop();
                          setMathOperation(op.id);
                        }}
                        activeOpacity={0.85}
                      >
                        <VisualArt value={op.symbol} size={22} textStyle={styles.mathOpEmoji} />
                        <Text
                          style={[
                            styles.mathOpText,
                            isSelected ? styles.mathOpTextActive : { color: '#1E293B' },
                          ]}
                        >
                          {opLabel}
                        </Text>
                        <View
                          style={[
                            styles.mathOpBadge,
                            isSelected
                              ? { backgroundColor: 'rgba(255,255,255,0.3)' }
                              : { backgroundColor: op.badgeBg },
                          ]}
                        >
                          <Text
                            style={[
                              styles.mathOpBadgeText,
                              isSelected ? { color: '#FFFFFF' } : { color: op.accentColor },
                            ]}
                          >
                            {formatNumberDigits(op.count, language)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Topic Subcategory Tabs for Gujarati, Hindi, English, and Numbers */}
            {topicTabs.length > 0 && (
              <View style={styles.mathOpsContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.mathOpsScroll}
                  nestedScrollEnabled={true}
                  directionalLockEnabled={true}
                  keyboardShouldPersistTaps="handled"
                >
                  {topicTabs.map((tab) => {
                    const isSelected = activeTopicTab === tab.id;
                    const tabLabel =
                      language === 'gu'
                        ? tab.labelGu
                        : language === 'hi'
                          ? tab.labelHi
                          : tab.labelEn;

                    return (
                      <TouchableOpacity
                        key={tab.id}
                        style={[
                          styles.mathOpButton,
                          isSelected
                            ? [
                              styles.mathOpButtonActive,
                              { backgroundColor: tab.accentColor, borderColor: tab.accentColor },
                            ]
                            : { borderColor: tab.accentColor + '55', backgroundColor: '#FFFFFF' },
                          shadows.soft,
                        ]}
                        onPress={() => {
                          soundEffects.playBubblePop();
                          setActiveTopicTab(tab.id);
                          setFilterMode('all');
                        }}
                        activeOpacity={0.85}
                      >
                        <VisualArt value={tab.symbol} size={22} textStyle={styles.mathOpEmoji} />
                        <Text
                          style={[
                            styles.mathOpText,
                            isSelected ? styles.mathOpTextActive : { color: '#1E293B' },
                          ]}
                        >
                          {tabLabel}
                        </Text>
                        <View
                          style={[
                            styles.mathOpBadge,
                            isSelected
                              ? { backgroundColor: 'rgba(255,255,255,0.3)' }
                              : { backgroundColor: tab.badgeBg },
                          ]}
                        >
                          <Text
                            style={[
                              styles.mathOpBadgeText,
                              isSelected ? { color: '#FFFFFF' } : { color: tab.accentColor },
                            ]}
                          >
                            {formatNumberDigits(tab.count, language)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Filter Chips Bar (All / Remaining / Completed) */}
            <View style={styles.filterRow}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterMode === 'all' && styles.filterChipActive,
                ]}
                onPress={() => {
                  soundEffects.playBubblePop();
                  setFilterMode('all');
                }}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterMode === 'all' && styles.filterChipTextActive,
                  ]}
                >
                  {language === 'gu' ? 'બધું' : language === 'hi' ? 'सभी' : 'All'} ({formatNumberDigits(activeTotalCount, language)})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterMode === 'remaining' && styles.filterChipActive,
                ]}
                onPress={() => {
                  soundEffects.playBubblePop();
                  setFilterMode('remaining');
                }}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterMode === 'remaining' && styles.filterChipTextActive,
                  ]}
                >
                  {language === 'gu' ? 'બાકી' : language === 'hi' ? 'बाकी' : 'To Learn'} ({formatNumberDigits(activeTotalCount - activeCompletedCount, language)})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterMode === 'done' && styles.filterChipActive,
                ]}
                onPress={() => {
                  soundEffects.playBubblePop();
                  setFilterMode('done');
                }}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterMode === 'done' && styles.filterChipTextActive,
                  ]}
                >
                  {language === 'gu' ? 'શીખેલા' : language === 'hi' ? 'सीखे हुए' : 'Done'} ({formatNumberDigits(activeCompletedCount, language)})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Empty State when no lessons match filter */}
            {displayedLessons.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={{ marginBottom: 8 }}><Art.StarArt size={57} /></View>
                <Text style={styles.emptyTitle}>
                  {currentCategory.id === 'math'
                    ? language === 'gu'
                      ? 'કોઈ દાખલા મળ્યા નથી'
                      : language === 'hi'
                        ? 'कोई सवाल नहीं मिले'
                        : 'No problems found'
                    : language === 'gu'
                      ? 'કોઈ પાઠ મળ્યા નથી'
                      : language === 'hi'
                        ? 'कोई पाठ नहीं मिले'
                        : 'No lessons found'}
                </Text>
                <TouchableOpacity
                  style={[styles.resetFilterBtn, { backgroundColor: catTheme.accent }]}
                  onPress={() => {
                    soundEffects.playBubblePop();
                    setMathOperation('all');
                    setFilterMode('all');
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.resetFilterBtnText}>
                    {currentCategory.id === 'math'
                      ? language === 'gu'
                        ? 'બધા દાખલા જુઓ'
                        : language === 'hi'
                          ? 'सभी सवाल देखें'
                          : 'View All Problems'
                      : language === 'gu'
                        ? 'બધા પાઠ જુઓ'
                        : language === 'hi'
                          ? 'सभी पाठ देखें'
                          : 'View All Lessons'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* 3D Tactile Grid of Lesson Cards */
              <View style={[styles.grid, { gap: gridGap }]}>
                {displayedLessons.map((item, idx) => {
                  const isCompleted = progress.completedLessons.includes(item.id);
                  const isGKCategory = item.categoryId.startsWith('gk-') || item.categoryId === 'gk';
                  const gkTitleInfo = isGKCategory ? formatGKCardTitle(item, language) : null;
                  const { primaryLabel, secondaryBracket } = getLessonDisplayLabels(item, language);
                  const cardTheme = CARD_PASTEL_THEMES[idx % CARD_PASTEL_THEMES.length];

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.card3D,
                        {
                          width: gridItemWidth,
                          backgroundColor: cardTheme.bg,
                          borderColor: cardTheme.border,
                        },
                        webStyle({
                          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05)',
                          cursor: 'pointer',
                        }),
                      ]}
                      onPress={() => {
                        navigatingToChildRef.current = true;
                        audioService.stop();
                        soundEffects.stopAnimalSound();
                        soundEffects.stopBgm();
                        soundEffects.playBubblePop();
                        const activeScope =
                          currentCategory.id === 'math'
                            ? mathOperation
                            : [
                                'gu-varnamala',
                                'hi-varnamala',
                                'en-alphabet',
                                'numbers',
                                'animals',
                              ].includes(currentCategory.id)
                              ? activeTopicTab
                              : undefined;
                        router.push({
                          pathname: '/lessons/[id]',
                          params: {
                            id: item.id,
                            ...(activeScope ? { scope: activeScope } : {}),
                          },
                        });
                      }}
                      activeOpacity={0.85}
                      accessibilityRole={Platform.OS === 'web' ? undefined : 'button'}
                      accessibilityLabel={primaryLabel}
                    >
                      {/* Top Row: Clean Lesson Index Number + Star completion */}
                      <View style={styles.cardHeaderRow}>
                        <View style={[styles.cardTagPill, { backgroundColor: cardTheme.pillBg }]}>
                          <Text style={[styles.cardTagText, { color: cardTheme.pillText }]}>
                            #{formatNumberDigits(idx + 1, language)}
                          </Text>
                        </View>
                        {isCompleted && (
                          <View style={[styles.checkBadge3D, shadows.soft]}>
                            <AppIcon name="star" size={14} />
                          </View>
                        )}
                      </View>

                      {/* Center: High-Definition Thematic Visual / Flag / Image / Symbol */}
                      <View style={styles.cardCenterVisualWrap}>
                        {(() => {
                          const visual3D = renderLesson3DVisual(item, 58, language);
                          if (visual3D) {
                            return visual3D;
                          }

                          if (isGKCategory || item.categoryId === 'gk-countries' || item.id.startsWith('country-')) {
                            return renderGKCardVisual(item, 62);
                          }
                          if (item.categoryId === 'math-money' || item.categoryId === 'math-missing') {
                            return renderMathCardVisual(item, 62, language);
                          }
                          if (item.id.startsWith('cs-pattern')) {
                            return <PatternCardVisual item={item} size={62} />;
                          }

                          const isSymbolCategory = [
                            'gu-varnamala',
                            'gu-barakhadi',
                            'en-alphabet',
                            'en-phonics',
                            'en-vowels',
                            'hi-varnamala',
                            'numbers',
                            'math',
                          ].includes(item.categoryId);

                          const imgSource = !isSymbolCategory ? getLessonImageSource(item) : null;
                          if (imgSource) {
                            return (
                              // Uniform 72x72 rounded frame (radius 16, resizeMode="cover")
                              <ImageFrame
                                source={imgSource}
                                emoji={item.symbol}
                                variant="card"
                                tone="sky"
                                style={[styles.cardImageContainer, shadows.soft]}
                              />
                            );
                          }
                          const match = item.id.match(/^num-(\d+)$/);
                          const n = match ? parseInt(match[1], 10) : item.countItems || 0;
                          const displaySymbol =
                            item.categoryId === 'numbers'
                              ? formatNumberDigits(n, language)
                              : item.categoryId === 'math'
                                ? formatMathExpression(item.symbol, language)
                                : item.symbol;

                          return (
                            <View style={{ alignItems: 'center', justifyContent: 'center', minHeight: 64, marginVertical: 2 }}>
                              <Text style={styles.symbolText3D}>{displaySymbol}</Text>
                            </View>
                          );
                        })()}
                      </View>

                      {/* Bottom: Playful Word, Detail Pill and Audio Mini Button */}
                      <View style={styles.cardBottomRow}>
                        <View style={styles.cardTextCol}>
                          {isGKCategory && gkTitleInfo ? (
                            <>
                              <Text style={styles.cardPrimaryTitle} numberOfLines={2}>
                                {gkTitleInfo.primaryName}
                              </Text>
                              {gkTitleInfo.detailPill ? (
                                <View style={[styles.gkDetailPill, { backgroundColor: cardTheme.pillBg }]}>
                                  <Text style={[styles.gkDetailPillText, { color: cardTheme.pillText }]} numberOfLines={1}>
                                    {gkTitleInfo.detailPill}
                                  </Text>
                                </View>
                              ) : null}
                              {gkTitleInfo.localSub ? (
                                <Text style={styles.cardSecondaryTitle} numberOfLines={2} ellipsizeMode="tail">
                                  {gkTitleInfo.localSub}
                                </Text>
                              ) : null}
                            </>
                          ) : (
                            <>
                              <Text style={styles.cardPrimaryTitle} numberOfLines={2} ellipsizeMode="tail">
                                {primaryLabel}
                              </Text>
                              {secondaryBracket ? (
                                <Text style={styles.cardSecondaryTitle} numberOfLines={2} ellipsizeMode="tail">
                                  {secondaryBracket}
                                </Text>
                              ) : null}
                            </>
                          )}
                        </View>

                        {/* Quick Audio Speak Button */}
                        <TouchableOpacity
                          style={[styles.quickAudioBtn, { backgroundColor: cardTheme.pillBg, borderColor: cardTheme.border }, shadows.soft]}
                          onPress={(e) => handleQuickPlay(e, item)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          activeOpacity={0.7}
                          accessibilityRole="button"
                          accessibilityLabel={`Play sound for ${primaryLabel}`}
                        >
                          <AppIcon name="speaker" size={16} />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Floating Interactive Mascot Guide */}
      <MascotGuide />

      {/* Cohesive Bottom Navigation Bar (Learn Active matching Screenshot 1) */}
      <BottomNav activeTab="learn" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 120,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  containerMobile: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 120,
  },
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    marginBottom: spacing.md,
  },
  heroBannerMobile: {
    padding: 14,
  },
  heroContentCol: {
    flex: 1,
    paddingRight: spacing.sm,
    minWidth: 0,
  },
  heroTagBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: radii.full,
    marginBottom: spacing.xs,
  },
  heroTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E293B',
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  progressSection: {
    width: '100%',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.full,
  },
  progressInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  heroRightBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flexShrink: 0,
  },
  emojiCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 26,
  },
  percentPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  percentText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    // design system: clay
    minHeight: 52,
    borderRadius: kidRadii.pill,
    justifyContent: 'center',
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(15, 23, 42, 0.22)',
  },
  filterChipActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card3D: {
    ...claySurface('plain', 2),
    minHeight: 154,
    padding: 14,
    justifyContent: 'space-between',
    overflow: 'hidden',
    // Claymorphic 3D lip under each lesson card
    borderBottomWidth: 5,
    borderBottomColor: '#CBD5E1',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  cardTagPill: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTagText: {
    fontSize: 12,
  },
  checkBadge3D: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  checkIcon: {
    fontSize: 12,
  },
  cardCenterVisualWrap: {
    minHeight: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  gkDetailPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    marginVertical: 2,
  },
  gkDetailPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardImageContainer: {
    width: 72,
    height: 72,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    padding: 0,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  symbolText3D: {
    fontSize: 44,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 56,
    paddingVertical: 4,
    includeFontPadding: true,
  },
  counterEmojiText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 2,
    letterSpacing: 2,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    width: '100%',
    minWidth: 0,
  },
  cardTextCol: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  cardPrimaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    lineHeight: 19,
    paddingVertical: 1,
    includeFontPadding: false,
  },
  cardSecondaryTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
    lineHeight: 14,
    includeFontPadding: false,
  },
  quickAudioBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    flexShrink: 0,
    backgroundColor: '#F5EEFE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E9D6FC',
  },
  mathOpsContainer: {
    marginBottom: 12,
  },
  mathOpsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  mathOpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    gap: 6,
    // design system: clay
    minHeight: 52,
    borderRadius: kidRadii.pill,
    justifyContent: 'center',
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(15, 23, 42, 0.22)',
  },
  mathOpButtonActive: {
    borderWidth: 1.5,
  },
  mathOpEmoji: {
    fontSize: 14,
  },
  mathOpText: {
    fontSize: 13,
    fontWeight: '700',
  },
  mathOpTextActive: {
    color: '#FFFFFF',
  },
  mathOpBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  mathOpBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: radii.card,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginTop: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 14,
  },
  resetFilterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: radii.full,
  },
  resetFilterBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
