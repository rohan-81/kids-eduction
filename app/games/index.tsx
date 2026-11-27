import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  Animated,
  Pressable,
  Image,
  type StyleProp,
  type ViewStyle,
  type DimensionValue
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/colors';
import { spacing, radii, shadows } from '../../src/theme/spacing';
import { kidRadii, clayShadow } from '../../src/theme/kidTheme';
import { CornerRibbon } from '../../src/components/fun';
import { useApp } from '../../src/context/AppContext';
import { Header } from '../../src/components/Header';
import { BottomNav } from '../../src/components/BottomNav';
import { AppGlobalBackground } from '../../src/components/common/AppGlobalBackground';
import { GameType, AgeGroup, AppLanguage } from '../../src/types';
import { soundEffects } from '../../src/services/soundEffects';
import { formatNumberDigits } from '../../src/utils/languageData';
import {
  BalloonsArt,
  PaletteArt,
  ShopCartArt,
  JigsawArt,
  FindObjectArt,
  MemoryCardsArt,
  WordTilesArt,
  BoxingGlovesArt,
  MathJellyArt,
  MusicArt,
  MegaphoneArt,
} from '../../src/components/art3d/Art3D';
import { HOME_CARD_ART } from '../../src/utils/imageHelper';
import { GuestLimitationModal, GuestLimitType } from '../../src/components/common/GuestLimitationModal';
import * as Art from '../../src/components/art3d/Art3D';
import { webStyle } from '../../src/utils/webStyle';
import type { AppRoute } from '../../src/utils/navigationHelper';
import type { ImageAsset } from '../../src/utils/remoteAssets';

export interface GameItemConfig {
  id: string;
  type?: GameType;
  route: AppRoute;
  titleGu: string;
  titleHi: string;
  titleEn: string;
  descGu: string;
  descHi: string;
  descEn: string;
  badgeGu: string;
  badgeHi: string;
  badgeEn: string;
  icon: string;
  bgColor: string;
  borderColor: string;
  accentColor: string;
  minAge: AgeGroup;
}

export const GAMES_LIST: GameItemConfig[] = [
  {
    id: 'balloon-pop',
    type: 'balloon-pop',
    route: '/games/balloon-pop',
    titleGu: 'ફુગ્ગા ફોડો',
    titleHi: 'गुब्बारा फोड़ो',
    titleEn: 'Balloon Pop Game',
    descGu: 'રંગબેરંગી ફુગ્ગા ફોડો, અવાજ સાંભળો અને રંગો-અંકો શીખો!',
    descHi: 'रंग-बिरंगे गुब्बारे फोड़ें, आवाज सुनें और रंग-संख्याएं सीखें!',
    descEn: 'Pop vibrant balloons with pop sounds and learn colors & numbers!',
    badgeGu: 'બાળકોનું ફેવરિટ',
    badgeHi: 'बच्चों का पसंदीदा',
    badgeEn: 'Kids Favorite',
    icon: '🎈',
    bgColor: '#FFFBEB',
    borderColor: '#FDE68A',
    accentColor: '#D97706',
    minAge: '2-4',
  },
  {
    id: 'colors-shapes',
    type: 'colors-shapes',
    route: '/games/colors-shapes',
    titleGu: 'રંગો અને આકારો',
    titleHi: 'रंग और आकृतियां',
    titleEn: 'Colors & Shapes Quiz',
    descGu: 'સુંદર રંગો, ત્રિકોણ, ચોરસ અને વર્તુળ આકારોની મનોરંજક ઓળખ!',
    descHi: 'सुंदर रंगों, त्रिभुज, वर्ग और वृत्त आकृतियों की मजेदार पहचान!',
    descEn: 'Identify vibrant colors and geometric shapes with fun questions!',
    badgeGu: 'રંગબેરંગી દુનિયા',
    badgeHi: 'रंग-बिरंगी दुनिया',
    badgeEn: 'Color Fun',
    icon: '🎨',
    bgColor: '#FFF1F2',
    borderColor: '#FECDD3',
    accentColor: '#E11D48',
    minAge: '2-4',
  },
  {
    id: 'picture-matching',
    type: 'picture-matching',
    route: '/games/picture-matching',
    titleGu: 'ચિત્ર જોડો',
    titleHi: 'चित्र मिलाओ',
    titleEn: 'Picture Matching',
    descGu: 'ફળો, શાકભાજી અને પ્રાણીઓને તેમના સાચા જોડીદાર સાથે જોડો!',
    descHi: 'फलों, सब्जियों और जानवरों को उनकी सही जोड़ी से मिलाएं!',
    descEn: 'Match lovely fruits, veggies, and cute animals with their pairs!',
    badgeGu: 'ઓળખ અને મેચિંગ',
    badgeHi: 'पहचान और मिलान',
    badgeEn: 'Visual Matching',
    icon: '🖼️',
    bgColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    accentColor: '#0284C7',
    minAge: '2-4',
  },
  {
    id: 'counting',
    type: 'counting',
    route: '/games/counting',
    titleGu: 'અંકો ગણો',
    titleHi: 'संख्याएं गिनें',
    titleEn: 'Counting Challenge',
    descGu: 'તારાઓ, સફરજન અને ફૂલોને ગણીને સાચો અંક પસંદ કરો!',
    descHi: 'तारे, सेब और फूल गिनकर सही संख्या चुनें!',
    descEn: 'Count smiling stars, apples, and flowers to pick the number!',
    badgeGu: 'ગણતરી ૧ થી ૩૦',
    badgeHi: 'गिनती १ से ३०',
    badgeEn: 'Numbers 1 to 30',
    icon: '🔢',
    bgColor: '#FAF5FF',
    borderColor: '#E9D5FF',
    accentColor: '#9333EA',
    minAge: '2-4',
  },
  {
    id: 'picture-puzzle',
    type: 'picture-puzzle',
    route: '/games/picture-puzzle',
    titleGu: 'ચિત્ર પઝલ',
    titleHi: 'चित्र पहेली',
    titleEn: 'Picture Jigsaw Puzzle',
    descGu: 'પઝલના ટુકડા જોડીને સુંદર આખું ચિત્ર પૂર્ણ કરો!',
    descHi: 'टुकड़ों को सही जोड़कर पूरी तस्वीर बनाएं!',
    descEn: 'Piece together puzzle tiles to form colorful kid illustrations!',
    badgeGu: 'જિગ્સો પઝલ',
    badgeHi: 'जिग्सॉ पहेली',
    badgeEn: 'Jigsaw Fun',
    icon: '🧩',
    bgColor: '#FEF3C7',
    borderColor: '#FDE68A',
    accentColor: '#D97706',
    minAge: '2-4',
  },
  {
    id: 'shopgame',
    route: '/shopgame',
    titleGu: 'સુપરમાર્કેટ શોપિંગ',
    titleHi: 'सुपरमार्केट शॉपिंग',
    titleEn: 'Supermarket Shopping',
    descGu: 'કાર્ટમાં વસ્તુઓ ખરીદો, સિક્કા ગણો અને બિલ ચૂકવો!',
    descHi: 'कार्ट में चीजें खरीदें, सिक्के गिनें और बिल चुकाएं!',
    descEn: 'Shop groceries into the cart, count coins, and pay!',
    badgeGu: 'ગણતરી અને મજા',
    badgeHi: 'गिनती और मज़ा',
    badgeEn: 'Shopping Fun',
    icon: '🛒',
    bgColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    accentColor: '#059669',
    minAge: '2-4',
  },
  {
    id: 'find-object',
    type: 'find-object',
    route: '/games/find-object',
    titleGu: 'સાચી વસ્તુ શોધો',
    titleHi: 'सही वस्तु खोजें',
    titleEn: 'Find the Correct Object',
    descGu: 'પ્રશ્ન વાંચીને કે સાંભળીને સાચી વસ્તુ પર ટેપ કરો!',
    descHi: 'सवाल पढ़कर या सुनकर सही वस्तु पर टैप करें!',
    descEn: 'Identify fruits, animals, and objects with cheerful hints!',
    badgeGu: 'શોધખોળ અને જ્ઞાન',
    badgeHi: 'खोज और ज्ञान',
    badgeEn: 'Discovery',
    icon: '🔎',
    bgColor: '#F0FDFA',
    borderColor: '#99F6E4',
    accentColor: '#0D9488',
    minAge: '2-4',
  },
  {
    id: 'wordbuilder',
    route: '/wordbuilder',
    titleGu: 'શબ્દ જોડો',
    titleHi: 'शब्द जोड़ो',
    titleEn: 'Word Builder',
    descGu: 'સાચા અક્ષરો ગોઠવીને સુંદર શબ્દો બનાવો અને સિક્કા જીતો!',
    descHi: 'सही अक्षर जोड़कर शब्द बनाएं और सिक्के जीतें!',
    descEn: 'Arrange letters to build real words and earn reward coins!',
    badgeGu: 'ભાષા અને સ્પેલિંગ',
    badgeHi: 'भाषा और शब्द',
    badgeEn: 'Language & Words',
    icon: '🔤',
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    accentColor: '#2563EB',
    minAge: '4-6',
  },
  {
    id: 'duel',
    route: '/games/duel',
    titleGu: '૨-પ્લેયર બેટલ',
    titleHi: '२-प्लेयर बैटल',
    titleEn: '2-Player Battle Quiz',
    descGu: 'એક જ સ્ક્રીન પર સામસામે ઝડપી ક્વિઝ રમો અને પોઈન્ટ્સ બનાવો!',
    descHi: 'एक ही स्क्रीन पर आमने-सामने तेज क्विज़ खेलें और पॉइंट्स बनाएं!',
    descEn: 'Split-screen head-to-head multiplayer challenge on one screen!',
    badgeGu: 'મમ્મી-પપ્પા સાથે રમો',
    badgeHi: 'पेरेंट्स के साथ खेलें',
    badgeEn: 'Play with Parent',
    icon: '⚔️',
    bgColor: '#EEF2FF',
    borderColor: '#C7D2FE',
    accentColor: '#0284C7',
    minAge: '4-6',
  },
  {
    id: 'math-quiz',
    type: 'math-quiz',
    route: '/games/math-quiz',
    titleGu: 'ગણિત મેજિક ક્વિઝ',
    titleHi: 'गणित मैजिक क्विज़',
    titleEn: 'Math Magic Quiz',
    descGu: 'સરવાળા, બાદબાકી, ગુણાકાર અને ભાગાકારના સ્માર્ટ સવાલો ઉકેલો!',
    descHi: 'जोड़, घटाव, गुणा और भाग के स्मार्ट सवाल हल करें!',
    descEn: 'Solve smart addition, subtraction, multiplication & division puzzles!',
    badgeGu: 'ગણિત ચેલેન્જ',
    badgeHi: 'गणित चुनौती',
    badgeEn: 'Math Challenge',
    icon: '➕',
    bgColor: '#FEFCE8',
    borderColor: '#FEF08A',
    accentColor: '#CA8A04',
    minAge: '4-6',
  },
  {
    id: 'memory-match',
    type: 'memory-match',
    route: '/games/memory-match',
    titleGu: 'મેમરી મેચ',
    titleHi: 'मेमोरी मैच',
    titleEn: 'Memory Match Cards',
    descGu: 'કાર્ડ પલટો, જોડી યાદ રાખો અને મગજની શક્તિ વધારો!',
    descHi: 'कार्ड पलटें, जोड़ी याद रखें और दिमाग तेज करें!',
    descEn: 'Flip cards, remember pairs, and train brain memory power!',
    badgeGu: 'બ્રેઇન બૂસ્ટર',
    badgeHi: 'ब्रेन बूस्टर',
    badgeEn: 'Brain Booster',
    icon: '🃏',
    bgColor: '#FFF7ED',
    borderColor: '#FED7AA',
    accentColor: '#EA580C',
    minAge: '2-4',
  },
  {
    id: 'missing-letter',
    type: 'missing-letter',
    route: '/games/missing-letter',
    titleGu: 'ખૂટતો અક્ષર',
    titleHi: 'छूटा हुआ अक्षर',
    titleEn: 'Missing Letter Puzzle',
    descGu: 'શબ્દમાં ખાલી જગ્યા પૂરો અને સાચો મૂળાક્ષર પસંદ કરો!',
    descHi: 'शब्द में छूटा हुआ सही अक्षर चुनकर पूरा करें!',
    descEn: 'Fill in the blank letter to complete the correct word!',
    badgeGu: 'શબ્દ પઝલ',
    badgeHi: 'शब्द पहेली',
    badgeEn: 'Word Puzzle',
    icon: '🧩',
    bgColor: '#FDF2F8',
    borderColor: '#FBCFE8',
    accentColor: '#DB2777',
    minAge: '4-6',
  },
  {
    id: 'find-letter',
    type: 'find-letter',
    route: '/games/find-letter',
    titleGu: 'સાચો અક્ષર શોધો',
    titleHi: 'सही अक्षर खोजें',
    titleEn: 'Find the Correct Letter',
    descGu: 'ચિત્ર અને અવાજ પરથી સાચો મૂળાક્ષર ક્લિક કરો!',
    descHi: 'चित्र और आवाज सुनकर सही अक्षर पर क्लिक करें!',
    descEn: 'Listen and see the hint to tap the matching alphabet!',
    badgeGu: 'મૂળાક્ષર ઓળખ',
    badgeHi: 'अक्षर पहचान',
    badgeEn: 'Alphabet Mastery',
    icon: '🔤',
    bgColor: '#F0FDFA',
    borderColor: '#99F6E4',
    accentColor: '#0D9488',
    minAge: '2-4',
  },
  {
    id: 'listen-choose',
    type: 'listen-choose',
    route: '/games/listen-choose',
    titleGu: 'સાંભળો અને પસંદ કરો',
    titleHi: 'सुनें और चुनें',
    titleEn: 'Listen & Choose',
    descGu: 'સ્પીકરનો અવાજ સાંભળીને સાચું ચિત્ર ઓળખો!',
    descHi: 'स्पीकर की आवाज सुनकर सही चित्र पहचानें!',
    descEn: 'Hear the voice pronunciation and choose the matching picture!',
    badgeGu: 'ઓડિયો ક્વિઝ',
    badgeHi: 'ऑडियो क्विज़',
    badgeEn: 'Audio Quiz',
    icon: '🎧',
    bgColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    accentColor: '#0284C7',
    minAge: '4-6',
  },
];

const ART = 52;
const pickLang = <T,>(art: { en: T; gu: T; hi: T }, lang?: AppLanguage): T =>
  lang === 'gu' ? art.gu : lang === 'hi' ? art.hi : art.en;

/** Crisp vector 3D art (or real 3D renders) for each game, sized for the 64px white stage. */
const renderGame3DIcon = (gameId: string, lang?: AppLanguage) => {
  const img = (src: ImageAsset) => <Image source={src} resizeMode="contain" style={{ width: ART + 4, height: ART + 4 }} />;
  switch (gameId) {
    case 'balloon-pop':
      return <BalloonsArt size={ART} />;
    case 'colors-shapes':
      return <PaletteArt size={ART} />;
    case 'picture-matching':
      return img(HOME_CARD_ART.animals);
    case 'counting':
      return img(pickLang(HOME_CARD_ART.counting, lang));
    case 'wordbuilder':
      return <WordTilesArt size={ART} />;
    case 'shopgame':
      return <ShopCartArt size={ART} />;
    case 'duel':
      return <BoxingGlovesArt size={ART} />;
    case 'math-quiz':
      return <MathJellyArt size={ART} />;
    case 'missing-letter':
    case 'find-letter':
      return img(pickLang(HOME_CARD_ART.abc, lang));
    case 'memory-match':
      return <MemoryCardsArt size={ART} />;
    case 'rhyme-match':
      return <MusicArt size={ART} />;
    case 'listen-choose':
      return <MegaphoneArt size={ART} />;
    case 'picture-puzzle':
      return <JigsawArt size={ART} />;
    case 'find-object':
      return <FindObjectArt size={ART} />;
    default:
      return <BalloonsArt size={ART} />;
  }
};

const useNativeDriver = Platform.OS !== 'web';

/** Game card with a soft press-down: the card dips and the Play pill sinks onto its lip. */
const GameCardPress: React.FC<{
  style: { width: DimensionValue; card: StyleProp<ViewStyle> };
  onPress: () => void;
  accessibilityLabel: string;
  children: (press: Animated.Value) => React.ReactNode;
}> = ({ style, onPress, accessibilityLabel, children }) => {
  const press = useRef(new Animated.Value(0)).current;
  const translateY = press.interpolate({ inputRange: [0, 1], outputRange: [0, 3] });
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => Animated.timing(press, { toValue: 1, duration: 80, useNativeDriver }).start()}
      onPressOut={() => Animated.spring(press, { toValue: 0, friction: 4, tension: 170, useNativeDriver }).start()}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[{ width: style.width }, webStyle({ cursor: 'pointer' })]}
    >
      <Animated.View style={[style.card, { flex: 1, transform: [{ translateY }] }]}>{children(press)}</Animated.View>
    </Pressable>
  );
};

/** Tiny filled SVG star for inline score labels (no emoji). */
const StarGlyph: React.FC = () => (
  <Svg width={12} height={12} viewBox="0 0 24 24">
    <Path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fill="#F59E0B" />
  </Svg>
);

/** Small SVG play triangle (no emoji / font glyph). */
const PlayGlyph: React.FC = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24">
    <Path d="M7 4.5v15l13-7.5z" fill="#FFFFFF" />
  </Svg>
);

/** Darken a #RRGGBB colour for the 3D lip. */
const darken = (hex: string, k = 0.22) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.max(0, Math.round(v * (1 - k)));
  return `rgb(${ch((n >> 16) & 255)}, ${ch((n >> 8) & 255)}, ${ch(n & 255)})`;
};

export default function GamesHubScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const cols = width < 540 ? 1 : isMobile ? 2 : 3;

  const { type } = useLocalSearchParams<{ type?: string }>();
  const { progress, ageGroup, clearWrongAnswer, language, isGuest } = useApp();
  const [showGuestLimitModal, setShowGuestLimitModal] = useState<boolean>(false);
  const [guestLimitType, setGuestLimitType] = useState<GuestLimitType>('duel');

  useEffect(() => {
    if (type) {
      router.replace(`/games/${type}`);
    }
  }, [type, router]);

  const handleBack = () => {
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

  // Games automatically tailored and prioritized for the active class/ageGroup
  const filteredGames = GAMES_LIST.filter((game) => {
    if (ageGroup === '2-4') {
      return game.minAge === '2-4';
    }
    return true;
  }).sort((a, b) => {
    if (ageGroup === '6-8') {
      // Advanced Grade 3-5: Math quiz, 2-player battle, word builder, shopping first
      const priorityOrder = ['math-quiz', 'duel', 'wordbuilder', 'missing-letter', 'shopgame', 'memory-match'];
      const aIdx = priorityOrder.indexOf(a.id);
      const bIdx = priorityOrder.indexOf(b.id);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
    } else if (ageGroup === '4-6') {
      // Grade 1-2: Balloon pop, Word builder, Find letter, Missing letter, Shopping
      const priorityOrder = ['balloon-pop', 'wordbuilder', 'find-letter', 'missing-letter', 'shopgame', 'math-quiz', 'duel'];
      const aIdx = priorityOrder.indexOf(a.id);
      const bIdx = priorityOrder.indexOf(b.id);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
    } else {
      // Pre-school: Balloon pop, Colors-shapes, Picture match, Counting, Puzzle
      const priorityOrder = ['balloon-pop', 'colors-shapes', 'picture-matching', 'counting', 'shopgame', 'picture-puzzle', 'find-object'];
      const aIdx = priorityOrder.indexOf(a.id);
      const bIdx = priorityOrder.indexOf(b.id);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
    }
    return 0;
  });

  const wrongAnswers = (progress.wrongAnswers || []).filter((w) => {
    if (w.language) return w.language === language;
    const hasGu = /[\u0A80-\u0AFF]/.test(w.prompt || '') || /[\u0A80-\u0AFF]/.test(w.correctOption || '');
    const hasHi = /[\u0900-\u097F]/.test(w.prompt || '') || /[\u0900-\u097F]/.test(w.correctOption || '');
    if (language === 'hi') return !hasGu; // Never display Gujarati mistake prompts in Hindi mode
    if (language === 'gu') return !hasHi; // Never display Hindi mistake prompts in Gujarati mode
    if (language === 'en') return !hasGu && !hasHi; // Never display Indic mistake prompts in English mode
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppGlobalBackground id="gamesIndexBgGrad" />
      <Header
        title={language === 'gu' ? 'રમતો' : language === 'hi' ? 'खेल' : 'Games'}
        showBack={true}
        backHref="/home"
        onBack={handleBack}
      />

      <ScrollView
        contentContainerStyle={[styles.container, isMobile && styles.containerMobile]}
        showsVerticalScrollIndicator={false}
      >
        {/* 3D Gamified Hero Banner */}
        <View style={[styles.heroBanner, shadows.card]}>
          <View style={styles.heroTextCol}>
            <View style={styles.heroBadgeRow}>
              <View style={styles.heroEmojiPill}>
                <Text style={styles.heroEmojiPillText}>
                  {language === 'gu' ? 'ગેમ ઝોન' : language === 'hi' ? 'गेम ज़ोन' : 'Game Zone'}
                </Text>
              </View>
              <View style={styles.heroCountPill}>
                <Text style={styles.heroCountText}>
                  {formatNumberDigits(filteredGames.length, language)}{' '}
                  {language === 'gu' ? 'શાનદાર રમતો' : language === 'hi' ? 'शानदार खेल' : 'Fun Games'}
                </Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>
              {language === 'gu'
                ? 'રમતા રમતા હોંશિયાર બનો!'
                : language === 'hi'
                  ? 'खेलते-खेलते होशियार बनें!'
                  : 'Play, Learn & Level Up!'}
            </Text>
            <Text style={styles.heroSub}>
              {language === 'gu'
                ? 'રંગબેરંગી પઝલ, ક્વિઝ અને ગણતરીથી તમારું મગજ તેજ બનાવો!'
                : language === 'hi'
                  ? 'रंग-बिरंगी पहेली, क्विज़ और गिनती से अपना दिमाग तेज बनाएं!'
                  : 'Boost your brainpower with vibrant puzzles, quizzes and counting!'}
            </Text>
          </View>

          <View style={styles.heroGraphicCol}>
            <View style={styles.heroTrophyCircle}>
              <Art.TrophyArt size={39} />
            </View>
          </View>
        </View>

        {/* Mistake Practice Card: Encouraging, compact & rewarding */}
        {wrongAnswers.length > 0 && (
          <View style={[styles.mistakeCard, shadows.soft]}>
            <View style={styles.mistakeHeader}>
              <View style={styles.mistakeIconCircle}>
                <Art.StarArt size={26} />
              </View>
              <View style={styles.mistakeTitleCol}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.mistakeTitle}>
                    {language === 'gu'
                      ? 'સુધારો અને સિક્કા જીતો!'
                      : language === 'hi'
                        ? 'सुधारें और सिक्के जीतें!'
                        : 'Practice & Master!'}
                  </Text>
                  <View style={styles.mistakeCountBadge}>
                    <Text style={styles.mistakeCountBadgeText}>
                      {formatNumberDigits(wrongAnswers.length, language)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.mistakeSubtitle}>
                  {language === 'gu'
                    ? 'આ પ્રશ્નો ફરીથી શીખીને પરફેક્ટ સ્કોર બનાવો'
                    : language === 'hi'
                      ? 'इन सवालों को दोबारा सीखकर परफेक्ट स्कोर बनाएं'
                      : 'Review these questions to score 100%'}
                </Text>
              </View>
            </View>

            <View style={styles.wrongList}>
              {wrongAnswers.slice(0, 2).map((w, wIdx) => (
                <View key={`wrong-${wIdx}`} style={styles.wrongItemRow}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={styles.wrongPrompt} numberOfLines={1}>
                      {w.prompt}
                    </Text>
                    <View style={styles.wrongAnswerRow}>
                      <Text style={styles.wrongAnswerLabel}>
                        {language === 'gu' ? 'સાચો જવાબ: ' : language === 'hi' ? 'सही उत्तर: ' : 'Correct: '}
                      </Text>
                      <Text style={styles.wrongAnswerValue}>{w.correctOption}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.clearMistakeBtn}
                    onPress={() => {
                      soundEffects.playBubblePop();
                      clearWrongAnswer(w.id);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.clearMistakeText}>
                      {language === 'gu' ? 'આવડી ગયું' : language === 'hi' ? 'सीख लिया' : 'Got it'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Responsive Tactile Grid of Games with 3D Squircles & Unified Play Buttons */}
        <View style={styles.grid}>
          {filteredGames.map((game) => {
            const title =
              language === 'gu' ? game.titleGu : language === 'hi' ? game.titleHi : game.titleEn;
            const desc =
              language === 'gu' ? game.descGu : language === 'hi' ? game.descHi : game.descEn;
            const badge =
              language === 'gu' ? game.badgeGu : language === 'hi' ? game.badgeHi : game.badgeEn;
            const stats = game.type ? progress.gameStats[game.type] : undefined;

            return (
              <GameCardPress
                key={game.id}
                accessibilityLabel={title}
                style={{
                  width: cols === 1 ? '100%' : cols === 2 ? '48%' : '31.8%',
                  card: [
                    styles.gameCard,
                    {
                      backgroundColor: game.bgColor,
                      borderColor: game.borderColor,
                      borderBottomColor: game.accentColor,
                    },
                    clayShadow(2),
                  ],
                }}
                onPress={async () => {
                  if (Platform.OS === 'web' && typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                  }
                  soundEffects.playBubblePop();
                  if (isGuest && game.id === 'duel') {
                    setGuestLimitType('duel');
                    setShowGuestLimitModal(true);
                    return;
                  }
                  router.push(game.route);
                }}
              >
                {(press) => (
                <>
                {stats && stats.highScore > 0 ? (
                  <CornerRibbon label={formatNumberDigits(stats.highScore, language)} tone="sun" />
                ) : null}
                {/* Top Row: 3D Icon Squircle + Category Pill */}
                <View style={styles.cardTopRow}>
                  <View style={[styles.artStage, { borderColor: game.borderColor }, shadows.soft]}>
                    {renderGame3DIcon(game.id, language)}
                  </View>

                  <View
                    style={[
                      styles.countBadge,
                      { backgroundColor: '#FFFFFF', borderColor: game.borderColor },
                      // leave room for the high-score corner ribbon
                      stats && stats.highScore > 0 ? { marginRight: 44 } : null,
                    ]}
                  >
                    <Text
                      style={[styles.countBadgeText, { color: game.accentColor }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {badge}
                    </Text>
                  </View>
                </View>

                {/* Game Title & Description */}
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {title}
                </Text>
                <Text style={styles.cardSubtitle} numberOfLines={2}>
                  {desc}
                </Text>

                {/* Footer: Score / Level Badge + Vibrant 3D Play Button */}
                <View style={styles.cardFooter}>
                  {stats && stats.highScore > 0 ? (
                    <View style={[styles.scorePill, { backgroundColor: '#FFFFFF', borderColor: game.borderColor, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                      <StarGlyph />
                      <Text style={[styles.highScoreText, { color: game.accentColor }]}>
                        {formatNumberDigits(stats.highScore, language)}{' '}
                        {language === 'gu' ? 'પોઇન્ટ્સ' : language === 'hi' ? 'पॉइंट्स' : 'pts'}
                      </Text>
                    </View>
                  ) : (
                    <View style={[styles.scorePill, { backgroundColor: '#FFFFFF', borderColor: game.borderColor }]}>
                      <Text style={[styles.newGameText, { color: game.accentColor }]}>
                        {language === 'gu' ? 'નવી રમત' : language === 'hi' ? 'नया खेल' : 'New Game'}
                      </Text>
                    </View>
                  )}

                  <View style={[styles.playOuter, { backgroundColor: darken(game.accentColor) }]}>

                    <Animated.View

                      style={[

                        styles.playBtn,

                        { backgroundColor: game.accentColor },

                        { transform: [{ translateY: press.interpolate({ inputRange: [0, 1], outputRange: [0, 4] }) }] },

                      ]}

                    >

                      <PlayGlyph />

                      <Text style={styles.playBtnText}>

                        {language === 'gu' ? 'રમો' : language === 'hi' ? 'खेलें' : 'Play'}

                      </Text>

                    </Animated.View>

                  </View>
                </View>
              </>
                )}
              </GameCardPress>
            );
          })}
        </View>

        {/* Ample bottom spacer ensuring full visibility above BottomNav */}
        <View style={{ height: 120 }} />
      </ScrollView>

      <GuestLimitationModal
        visible={showGuestLimitModal}
        limitType={guestLimitType}
        language={language}
        onClose={() => setShowGuestLimitModal(false)}
      />

      <BottomNav activeTab="games" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    maxWidth: 1100,
    alignSelf: 'center',
    width: '100%',
  },
  containerMobile: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    backgroundColor: '#EEF2FF',
  },
  heroTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  heroEmojiPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  heroEmojiPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0284C7',
  },
  heroCountPill: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  heroCountText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 12.5,
    color: '#4338CA',
    lineHeight: 18,
  },
  heroGraphicCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTrophyCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#C7D2FE',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  mistakeCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
  },
  mistakeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mistakeIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#86EFAC',
  },
  mistakeTitleCol: {
    flex: 1,
  },
  mistakeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#166534',
  },
  mistakeCountBadge: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 10,
  },
  mistakeCountBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  mistakeSubtitle: {
    fontSize: 12,
    color: '#15803D',
    marginTop: 2,
  },
  wrongList: {
    gap: 8,
  },
  wrongItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  wrongPrompt: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  wrongAnswerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  wrongAnswerLabel: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  wrongAnswerValue: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '700',
  },
  clearMistakeBtn: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  clearMistakeText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#15803D',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  gameCard: {
    borderRadius: kidRadii.card,
    padding: 16,
    borderWidth: 2,
    // Claymorphic 3D lip in the game's accent colour
    borderBottomWidth: 5,
    justifyContent: 'space-between',
    minHeight: 185,
    overflow: 'hidden',
  },
  artStage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playOuter: {
    borderRadius: kidRadii.pill,
    paddingBottom: 4,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconSquircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
    maxWidth: '65%',
    flexShrink: 1,
  },
  countBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 17.5,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
    lineHeight: 22,
  },
  cardSubtitle: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 14,
    flex: 1,
    fontWeight: '400',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  scorePill: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  highScoreText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  newGameText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  playBtn: {
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: kidRadii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    // the darker lip is the playOuter wrapper peeking out 4px underneath
  },
  playBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  guestNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderRadius: 20,
    padding: 14,
    marginBottom: 20,
    gap: 12,
    ...(webStyle({
      boxShadow: '0 4px 14px rgba(245, 158, 11, 0.08)',
    })),
  },
  guestNoticeIconCol: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#FCD34D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestNoticeContentCol: {
    flex: 1,
  },
  guestNoticeBadgeRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  guestNoticeBadge: {
    backgroundColor: '#FDE68A',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  guestNoticeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
    letterSpacing: 0.2,
  },
  guestNoticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#78350F',
    lineHeight: 18,
  },
  guestNoticeActionBtn: {
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  guestNoticeActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
