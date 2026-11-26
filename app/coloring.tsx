import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Modal,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import Svg, {
  Path,
  Circle,
  Rect,
  G,
  Polygon,
  Line,
} from 'react-native-svg';
import { colors } from '../src/theme/colors';
import { spacing, radii, shadows } from '../src/theme/spacing';
import { kidRadii, kidPalette, clayShadow } from '../src/theme/kidTheme';
import { useApp } from '../src/context/AppContext';
import { soundEffects } from '../src/services/soundEffects';
import { audioService } from '../src/services/audioService';
import { STORY_CHARACTER_IMAGES, STORY_PROP_IMAGES, SUBJECT_CARD_ART } from '../src/utils/imageHelper';
import { formatNumberDigits } from '../src/utils/languageData';
import { apiService } from '../src/services/apiService';
import * as Art from '../src/components/art3d/Art3D';
import { Remote3DImage } from '../src/components/common/Remote3DImage';
import type { ImageAsset } from '../src/utils/remoteAssets';

const ButterflyIcon = ({ size = 22 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 4V20M12 4C9 1 3 4 3 9C3 13 8 14 12 14M12 4C15 1 21 4 21 9C21 13 16 14 12 14M12 14C8 14 4 15 4 18C4 21 9 21 12 17M12 14C16 14 20 15 20 18C20 21 15 21 12 17"
      stroke="#EA580C"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="#FED7AA"
    />
  </Svg>
);

const FishIcon = ({ size = 22 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12C19 8 13 5 8 5C5 5 2 7 2 12C2 17 5 19 8 19C13 19 19 16 19 12ZM19 12L23 15V9L19 12Z" fill="#38BDF8" stroke="#0284C7" strokeWidth={1.5} />
    <Circle cx="6" cy="10" r="1.5" fill="#FFFFFF" />
    <Circle cx="6" cy="10" r="0.8" fill="#0F172A" />
  </Svg>
);

const MushroomIcon = ({ size = 22 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 14C4 7 8 3 12 3C16 3 20 7 20 14H4Z" fill="#F43F5E" stroke="#BE123C" strokeWidth={1.5} />
    <Circle cx="8" cy="8" r="1.5" fill="#FFFFFF" />
    <Circle cx="16" cy="8" r="1.5" fill="#FFFFFF" />
    <Rect x="10" y="14" width="4" height="7" rx="1.5" fill="#FEF3C7" stroke="#D97706" strokeWidth={1.2} />
  </Svg>
);

const remotePropIcon = (source: ImageAsset, emoji: string) => (
  <Remote3DImage source={source} style={{ width: 22, height: 22 }} fallback={<Text style={{ fontSize: 16 }}>{emoji}</Text>} />
);

const renderTemplateIcon = (tplId: string) => {
  if (tplId === 'elephant' && STORY_CHARACTER_IMAGES['🐘']) {
    return remotePropIcon(STORY_CHARACTER_IMAGES['🐘'], '🐘');
  }
  if (tplId === 'butterfly') {
    return <ButterflyIcon size={22} />;
  }
  if (tplId === 'fish') {
    return <FishIcon size={22} />;
  }
  if (tplId === 'car') {
    return <Art.CarArt size={22} />;
  }
  if (tplId === 'flower') {
    return <Art.SproutArt size={22} />;
  }
  if (tplId === 'apple') {
    return <Art.AppleArt size={22} />;
  }
  if (tplId === 'rocket' && STORY_PROP_IMAGES['🚀']) {
    return remotePropIcon(STORY_PROP_IMAGES['🚀'], '🚀');
  }
  if (tplId === 'balloon' && STORY_PROP_IMAGES['🎈']) {
    return remotePropIcon(STORY_PROP_IMAGES['🎈'], '🎈');
  }
  if (tplId === 'star') {
    return <Image source={SUBJECT_CARD_ART.star} style={{ width: 22, height: 22 }} resizeMode="contain" />;
  }
  if (tplId === 'mushroom') {
    return <MushroomIcon size={22} />;
  }
  if (tplId === 'peacock') {
    return <Art.FeatherArt size={22} />;
  }
  if (tplId === 'dino' && STORY_PROP_IMAGES['🦕']) {
    return remotePropIcon(STORY_PROP_IMAGES['🦕'], '🦕');
  }
  if (tplId === 'lion' && STORY_CHARACTER_IMAGES['🦁']) {
    return remotePropIcon(STORY_CHARACTER_IMAGES['🦁'], '🦁');
  }
  if (tplId === 'castle' && STORY_PROP_IMAGES['🏰']) {
    return remotePropIcon(STORY_PROP_IMAGES['🏰'], '🏰');
  }
  return <Art.PaletteArt size={22} />;
};

export type AgeLevel = '2-4' | '4-6';

export interface TemplateDef {
  id: string;
  emoji: string;
  level: AgeLevel;
  nameGu: string;
  nameHi: string;
  nameEn: string;
  parts: string[];
}

export const TEMPLATES: TemplateDef[] = [
  /* ==================== LEVEL 1: ૨-૪ વર્ષ (સરળ / Toddler - 3-5 Big Shapes) ==================== */
  {
    id: 'apple',
    emoji: '🍎',
    level: '2-4',
    nameGu: 'સફરજન',
    nameHi: 'सेब',
    nameEn: 'Apple',
    parts: ['body', 'leaf', 'stem', 'cheeks'],
  },
  {
    id: 'sun',
    emoji: '☀️',
    level: '2-4',
    nameGu: 'હસતો સૂર્ય',
    nameHi: 'हंसता सूरज',
    nameEn: 'Happy Sun',
    parts: ['face', 'raysRing', 'cloudLeft', 'cloudRight', 'cheeks'],
  },
  {
    id: 'balloon',
    emoji: '🎈',
    level: '2-4',
    nameGu: 'ફુગ્ગો',
    nameHi: 'गुब्बारा',
    nameEn: 'Cute Balloon',
    parts: ['balloonBody', 'highlight', 'knot', 'string'],
  },
  {
    id: 'star',
    emoji: '⭐️',
    level: '2-4',
    nameGu: 'તારો',
    nameHi: 'तारा',
    nameEn: 'Star Character',
    parts: ['starBody', 'leftShoe', 'rightShoe', 'cheeks'],
  },
  {
    id: 'mushroom',
    emoji: '🍄',
    level: '2-4',
    nameGu: 'મશરૂમ',
    nameHi: 'मशरूम',
    nameEn: 'Mushroom',
    parts: ['cap', 'stem', 'spots', 'grass'],
  },

  /* ==================== LEVEL 2: ૪-૬ વર્ષ (મધ્યમ / Little Artist - 8-12 Shapes - Minor Hard) ==================== */
  {
    id: 'elephant',
    emoji: '🐘',
    level: '4-6',
    nameGu: 'નાનો હાથી',
    nameHi: 'छोटा हाथी',
    nameEn: 'Baby Elephant',
    parts: [
      'ear',
      'innerEar',
      'head',
      'trunk',
      'body',
      'belly',
      'frontLeftLeg',
      'frontRightLeg',
      'backLeg',
      'toenails',
      'tailPuff',
      'grass',
    ],
  },
  {
    id: 'butterfly',
    emoji: '🦋',
    level: '4-6',
    nameGu: 'પતંગિયું',
    nameHi: 'तितली',
    nameEn: 'Butterfly',
    parts: [
      'topLeftWing',
      'topRightWing',
      'bottomLeftWing',
      'bottomRightWing',
      'spot1',
      'spot2',
      'spot3',
      'spot4',
      'body',
      'head',
      'cloud',
    ],
  },
  {
    id: 'flower',
    emoji: '🌸',
    level: '4-6',
    nameGu: 'બગીચાનું ફૂલ',
    nameHi: 'बगीचे का फूल',
    nameEn: 'Garden Flower',
    parts: [
      'center',
      'petal1',
      'petal2',
      'petal3',
      'petal4',
      'petal5',
      'petal6',
      'stem',
      'leaf1',
      'leaf2',
      'pot',
    ],
  },
  {
    id: 'car',
    emoji: '🚗',
    level: '4-6',
    nameGu: 'રમકડાની કાર',
    nameHi: 'खिलौना कार',
    nameEn: 'Toy Car',
    parts: [
      'roof',
      'body',
      'frontWindow',
      'backWindow',
      'frontWheel',
      'backWheel',
      'frontHubcap',
      'backHubcap',
      'headlight',
      'bumper',
    ],
  },
  {
    id: 'fish',
    emoji: '🐠',
    level: '4-6',
    nameGu: 'નાની માછલી',
    nameHi: 'छोटी मछली',
    nameEn: 'Fish',
    parts: [
      'body',
      'tail',
      'topFin',
      'bottomFin',
      'stripe1',
      'stripe2',
      'bubble1',
      'bubble2',
    ],
  },
  {
    id: 'rocket',
    emoji: '🚀',
    level: '4-6',
    nameGu: 'રોકેટ',
    nameHi: 'रॉकेट',
    nameEn: 'Space Rocket',
    parts: [
      'rocketBody',
      'noseCone',
      'window',
      'leftWing',
      'rightWing',
      'nozzle',
      'flameOuter',
      'flameInner',
      'planet',
    ],
  },
];

const PALETTE = [
  '#EF4444', // Red
  '#FACC15', // Sunny Yellow
  '#10B981', // Mint Green
  '#0284C7', // Ocean Sky Blue
  '#8B5CF6', // Royal Purple
  '#F97316', // Orange
  '#EC4899', // Bright Pink
  '#854D0E', // Earth Brown
  '#475569', // Cool Slate
  '#059669', // Deep Forest Green
];

export default function TapToFillColoringScreen() {
  const router = useRouter();
  const { language, speak, progress, updateProgress, recordScore, ageGroup } = useApp();

  const [allTemplates, setAllTemplates] = useState<TemplateDef[]>(TEMPLATES);

  useEffect(() => {
    let cancelled = false;
    apiService.fetchColoringTemplates().then((fetched) => {
      if (!cancelled && fetched && fetched.length > 0) {
        const templateMap = new Map<string, TemplateDef>(TEMPLATES.map((t) => [t.id, t]));
        fetched.forEach((f) => {
          const id = f.id;
          const existing = templateMap.get(id);
          if (existing) {
            templateMap.set(id, {
              ...existing,
              nameGu: f.nameGu || existing.nameGu,
              nameHi: f.nameHi || existing.nameHi,
              nameEn: f.nameEn || existing.nameEn,
            });
          }
        });
        setAllTemplates(Array.from(templateMap.values()));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Child's level is automatically determined by the main app selection:
  // 2-4 years (Nursery / Jr. KG) -> Easy 3-5 shapes
  // 4-6+ years (Sr. KG / Class 1-5) -> Medium 8-12 shapes
  const activeLevel: AgeLevel = ageGroup === '2-4' ? '2-4' : '4-6';
  const levelTemplates = allTemplates.filter((t) => t.level === activeLevel);

  const [activeTemplate, setActiveTemplate] = useState<TemplateDef>(
    levelTemplates[0] || TEMPLATES[0]
  );

  // Synchronize template if standard/ageGroup changes in the app
  React.useEffect(() => {
    const tpls = allTemplates.filter((t) => t.level === (ageGroup === '2-4' ? '2-4' : '4-6'));
    if (tpls.length > 0 && !tpls.some((t) => t.id === activeTemplate.id)) {
      setActiveTemplate(tpls[0]);
      setFills({});
      setHistory([]);
    }
  }, [ageGroup, allTemplates, activeTemplate.id]);
  const [selectedColor, setSelectedColor] = useState<string>(PALETTE[0]);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  // Store fills: { partId: hexColor }
  const [fills, setFills] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<Array<{ partId: string; oldColor: string }>>([]);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [showRemainingToast, setShowRemainingToast] = useState<boolean>(false);
  const isFinishingRef = useRef<boolean>(false);
  // Pending auto-finish after the last region is filled; cancelled by Clear, a template switch
  // or leaving the screen (it used to award stars for a canvas the child had just cleared).
  const autoFinishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelAutoFinish = () => {
    if (autoFinishTimerRef.current) {
      clearTimeout(autoFinishTimerRef.current);
      autoFinishTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cancelAutoFinish();
      audioService.stop();
      soundEffects.stopAnimalSound();
    };
  }, []);

  // Silence all audio immediately when this screen loses focus or user navigates to another page
  useFocusEffect(
    useCallback(() => {
      return () => {
        audioService.stop();
        soundEffects.stopAnimalSound();
      };
    }, [])
  );

  const getFill = (partId: string) => fills[partId] || '#FFFFFF';

  // Strict completion check: EVERY single shape must have non-white color
  const totalParts = activeTemplate.parts.length;
  const coloredPartsCount = activeTemplate.parts.filter(
    (p) => fills[p] && fills[p] !== '#FFFFFF'
  ).length;
  const isAllComplete = coloredPartsCount === totalParts && totalParts > 0;

  const handlePartTap = (partId: string) => {
    soundEffects.playBubblePop();
    const currentColor = fills[partId] || '#FFFFFF';
    const newColor = isEraser ? '#FFFFFF' : selectedColor;

    if (currentColor === newColor) return;

    const nextFills = { ...fills, [partId]: newColor };
    setHistory((prev) => [...prev, { partId, oldColor: currentColor }]);
    setFills(nextFills);

    // Strictly check if 100% of shapes are colored!
    const coloredCount = activeTemplate.parts.filter((p) => nextFills[p] && nextFills[p] !== '#FFFFFF').length;
    if (coloredCount === activeTemplate.parts.length && !showCelebration && !isFinishingRef.current) {
      cancelAutoFinish();
      autoFinishTimerRef.current = setTimeout(() => {
        autoFinishTimerRef.current = null;
        handleFinish(nextFills);
      }, 500);
    }
  };

  const handleClear = () => {
    soundEffects.playBubblePop();
    cancelAutoFinish();
    isFinishingRef.current = false;
    setFills({});
    setHistory([]);
    setShowRemainingToast(false);
    speak(
      language === 'gu'
        ? 'ચિત્ર સાફ થઈ ગયું! ફરીથી નવો રંગ પૂરો!'
        : language === 'hi'
        ? 'चित्र साफ हो गया! फिर से नया रंग भरें!'
        : 'Canvas cleared! Paint fresh colors!',
      language
    );
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    cancelAutoFinish(); // undoing the last fill means the picture is no longer complete
    soundEffects.playBubblePop();
    const lastAction = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setFills((prev) => ({
      ...prev,
      [lastAction.partId]: lastAction.oldColor,
    }));
  };

  const handleSelectTemplate = (tpl: TemplateDef) => {
    soundEffects.playBubblePop();
    cancelAutoFinish();
    isFinishingRef.current = false;
    setActiveTemplate(tpl);
    setFills({});
    setHistory([]);
    setShowRemainingToast(false);
    const tplName = language === 'gu' ? tpl.nameGu : language === 'hi' ? tpl.nameHi : tpl.nameEn;
    speak(
      language === 'gu'
        ? `ચાલો ${tplName}માં રંગ પૂરીએ!`
        : language === 'hi'
        ? `चलो ${tplName} में रंग भरें!`
        : `Let's color ${tplName}!`,
      language
    );
  };

  const handleDoneClick = () => {
    if (!isAllComplete) {
      soundEffects.playBubblePop();
      const remaining = totalParts - coloredPartsCount;
      setShowRemainingToast(true);
      setTimeout(() => setShowRemainingToast(false), 3500);
      speak(
        language === 'gu'
          ? `હજી ${formatNumberDigits(remaining, language)} ભાગ બાકી છે! બધા ભાગમાં રંગ પૂરો!`
          : language === 'hi'
          ? `अभी ${formatNumberDigits(remaining, language)} भाग बाकी हैं! सभी भागों में रंग भरें!`
          : `Still ${remaining} shapes left! Color all parts to finish!`,
        language
      );
      return;
    }
    handleFinish();
  };

  const handleFinish = async (currentFills?: Record<string, string>) => {
    if (isFinishingRef.current) return;
    isFinishingRef.current = true;
    soundEffects.playTadaaa();
    await updateProgress({ stars: (progress.stars || 0) + 10 });
    await recordScore('coloring', 10);
    setShowCelebration(true);
    const tplName =
      language === 'gu'
        ? activeTemplate.nameGu
        : language === 'hi'
        ? activeTemplate.nameHi
        : activeTemplate.nameEn;
    speak(
      language === 'gu'
        ? `અરે વાહ! ${tplName}માં બધા રંગ કેટલા સુંદર પૂર્યા! શાબાશ!`
        : language === 'hi'
        ? `वाह! ${tplName} में सभी रंग कितने सुंदर भरे! शाबाश!`
        : `Wow! What a beautiful colored ${tplName}! Super job!`,
      language
    );
  };

  const handleBack = () => {
    soundEffects.playBubblePop();
    if (Platform.OS === 'web') {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
      try {
        if (router.canGoBack()) {
          router.back();
          setTimeout(() => {
            if (typeof window !== 'undefined' && window.location.pathname + window.location.search === currentPath) {
              router.replace('/home');
            }
          }, 150);
          return;
        }
      } catch {}
      router.replace('/home');
      return;
    }

    try {
      if (router.canGoBack()) {
        router.back();
        return;
      }
    } catch {}
    router.replace('/home');
  };

  const isWeb = Platform.OS === 'web';
  /** Web: DOM click on the SVG path (RN-web does not dispatch onPress for SVG); native: onPress. */
  const getPartEvents = (partId: string): { onPress?: () => void; onClick?: () => void; style?: { cursor: 'pointer' } } => {
    const handler = () => handlePartTap(partId);
    if (isWeb) {
      return {
        onClick: handler,
        style: { cursor: 'pointer' },
      };
    }
    return {
      onPress: handler,
    };
  };

  const screenWidth = Dimensions.get('window').width;
  const canvasSize = Math.min(340, Math.floor(screenWidth - 36));

  /* Render Interactive SVG Based on Selected Template */
  const renderSvgIllustration = () => {
    switch (activeTemplate.id) {
      /* ==================== 🍎 APPLE (સફરજન - Level 1: 4 Shapes) ==================== */
      case 'apple':
        return (
          <Svg viewBox="0 0 320 320" width={canvasSize} height={canvasSize}>
            {/* Stem */}
            <Path
              d="M160,80 Q168,45 185,35"
              fill="none"
              stroke={getFill('stem') === '#FFFFFF' ? '#78350F' : getFill('stem')}
              {...getPartEvents('stem')}
              strokeWidth={10}
              strokeLinecap="round"
            />

            {/* Big Leaf */}
            <Path
              d="M165,70 Q225,45 230,75 Q215,110 165,70 Z"
              fill={getFill('leaf')}
              {...getPartEvents('leaf')}
              stroke="#1E293B"
              strokeWidth={5}
              strokeLinejoin="round"
            />

            {/* Apple Big Body */}
            <Path
              d="M160,95 C115,60 45,90 45,175 C45,250 115,295 160,295 C205,295 275,250 275,175 C275,90 205,60 160,95 Z"
              fill={getFill('body')}
              {...getPartEvents('body')}
              stroke="#1E293B"
              strokeWidth={6}
              strokeLinejoin="round"
            />

            {/* Big Rosy Cheeks */}
            <G {...getPartEvents('cheeks')}>
              <Circle
                cx="108"
                cy="185"
                r="14"
                fill={getFill('cheeks')}
                stroke="#1E293B"
                strokeWidth={2.5}
              />
              <Circle
                cx="212"
                cy="185"
                r="14"
                fill={getFill('cheeks')}
                stroke="#1E293B"
                strokeWidth={2.5}
              />
            </G>

            {/* Cute Smiling Face Details */}
            <Circle cx="128" cy="165" r="7" fill="#1E293B" />
            <Circle cx="130" cy="163" r="2.5" fill="#FFFFFF" />
            <Circle cx="192" cy="165" r="7" fill="#1E293B" />
            <Circle cx="194" cy="163" r="2.5" fill="#FFFFFF" />
            <Path d="M145,188 Q160,210 175,188" stroke="#1E293B" strokeWidth={5} fill="none" strokeLinecap="round" />
          </Svg>
        );

      /* ==================== ☀️ SUN (હસતો સૂર્ય - Level 1: 5 Shapes) ==================== */
      case 'sun':
        return (
          <Svg viewBox="0 0 320 320" width={canvasSize} height={canvasSize}>
            {/* Sun Rays Ring */}
            <G {...getPartEvents('raysRing')}>
              <Polygon points="160,18 148,56 172,56" fill={getFill('raysRing')} stroke="#1E293B" strokeWidth={3} />
              <Polygon points="262,58 230,80 248,96" fill={getFill('raysRing')} stroke="#1E293B" strokeWidth={3} />
              <Polygon points="302,160 264,148 264,172" fill={getFill('raysRing')} stroke="#1E293B" strokeWidth={3} />
              <Polygon points="262,262 248,226 230,242" fill={getFill('raysRing')} stroke="#1E293B" strokeWidth={3} />
              <Polygon points="160,302 172,264 148,264" fill={getFill('raysRing')} stroke="#1E293B" strokeWidth={3} />
              <Polygon points="58,262 90,242 74,226" fill={getFill('raysRing')} stroke="#1E293B" strokeWidth={3} />
              <Polygon points="18,160 56,172 56,148" fill={getFill('raysRing')} stroke="#1E293B" strokeWidth={3} />
              <Polygon points="58,58 74,96 90,80" fill={getFill('raysRing')} stroke="#1E293B" strokeWidth={3} />
            </G>

            {/* Big Center Sun Face */}
            <Circle
              cx="160"
              cy="160"
              r="76"
              fill={getFill('face')}
              {...getPartEvents('face')}
              stroke="#1E293B"
              strokeWidth={6}
            />

            {/* Left Cloud */}
            <Path
              d="M25,230 C25,212 45,212 55,218 C62,200 84,200 94,215 C105,206 122,215 122,230 Z"
              fill={getFill('cloudLeft')}
              {...getPartEvents('cloudLeft')}
              stroke="#1E293B"
              strokeWidth={4}
              strokeLinejoin="round"
            />

            {/* Right Cloud */}
            <Path
              d="M205,235 C205,218 222,218 232,224 C238,206 260,206 270,220 C280,211 298,220 298,235 Z"
              fill={getFill('cloudRight')}
              {...getPartEvents('cloudRight')}
              stroke="#1E293B"
              strokeWidth={4}
              strokeLinejoin="round"
            />

            {/* Cheeks */}
            <G {...getPartEvents('cheeks')}>
              <Circle cx="120" cy="170" r="12" fill={getFill('cheeks')} stroke="#1E293B" strokeWidth={2} />
              <Circle cx="200" cy="170" r="12" fill={getFill('cheeks')} stroke="#1E293B" strokeWidth={2} />
            </G>

            {/* Smiling Eyes & Smile */}
            <Circle cx="132" cy="148" r="6" fill="#1E293B" />
            <Circle cx="188" cy="148" r="6" fill="#1E293B" />
            <Path d="M135,178 Q160,210 185,178" stroke="#1E293B" strokeWidth={5} fill="none" strokeLinecap="round" />
          </Svg>
        );

      /* ==================== 🎈 BALLOON (ફુગ્ગો - Level 1: 4 Shapes) ==================== */
      case 'balloon':
        return (
          <Svg viewBox="0 0 320 320" width={canvasSize} height={canvasSize}>
            {/* Balloon Body */}
            <Path
              d="M160,35 C95,35 70,100 70,165 C70,230 140,248 152,254 L168,254 C180,248 250,230 250,165 C250,100 225,35 160,35 Z"
              fill={getFill('balloonBody')}
              {...getPartEvents('balloonBody')}
              stroke="#1E293B"
              strokeWidth={6}
              strokeLinejoin="round"
            />

            {/* Highlight Shine Arc */}
            <Path
              d="M105,75 C90,110 90,150 102,175"
              fill="none"
              stroke={getFill('highlight') === '#FFFFFF' ? '#FDE047' : getFill('highlight')}
              {...getPartEvents('highlight')}
              strokeWidth={10}
              strokeLinecap="round"
            />

            {/* Tie Knot Triangle */}
            <Polygon
              points="148,254 172,254 160,268"
              fill={getFill('knot')}
              {...getPartEvents('knot')}
              stroke="#1E293B"
              strokeWidth={4}
              strokeLinejoin="round"
            />

            {/* Curly Hanging Ribbon / String */}
            <Path
              d="M160,268 Q145,282 165,295 Q180,305 160,315"
              fill="none"
              stroke={getFill('string') === '#FFFFFF' ? '#1E293B' : getFill('string')}
              {...getPartEvents('string')}
              strokeWidth={5}
              strokeLinecap="round"
            />

            {/* Cute Happy Face */}
            <Circle cx="135" cy="150" r="6" fill="#1E293B" />
            <Circle cx="185" cy="150" r="6" fill="#1E293B" />
            <Path d="M145,170 Q160,188 175,170" stroke="#1E293B" strokeWidth={4} fill="none" strokeLinecap="round" />
          </Svg>
        );

      /* ==================== ⭐️ STAR (ચમકતો તારો - Level 1: 4 Shapes) ==================== */
      case 'star':
        return (
          <Svg viewBox="0 0 320 320" width={canvasSize} height={canvasSize}>
            {/* Big Five-Point Star Body */}
            <Polygon
              points="160,25 198,115 295,120 220,180 248,272 160,222 72,272 100,180 25,120 122,115"
              fill={getFill('starBody')}
              {...getPartEvents('starBody')}
              stroke="#1E293B"
              strokeWidth={6}
              strokeLinejoin="round"
            />

            {/* Left Shoe */}
            <Path
              d="M72,272 C55,272 50,300 75,302 C95,302 98,285 92,275 Z"
              fill={getFill('leftShoe')}
              {...getPartEvents('leftShoe')}
              stroke="#1E293B"
              strokeWidth={4}
              strokeLinejoin="round"
            />

            {/* Right Shoe */}
            <Path
              d="M248,272 C265,272 270,300 245,302 C225,302 222,285 228,275 Z"
              fill={getFill('rightShoe')}
              {...getPartEvents('rightShoe')}
              stroke="#1E293B"
              strokeWidth={4}
              strokeLinejoin="round"
            />

            {/* Cheeks */}
            <G {...getPartEvents('cheeks')}>
              <Circle cx="125" cy="165" r="10" fill={getFill('cheeks')} stroke="#1E293B" strokeWidth={2} />
              <Circle cx="195" cy="165" r="10" fill={getFill('cheeks')} stroke="#1E293B" strokeWidth={2} />
            </G>

            {/* Big Cartoon Eyes & Big Smile */}
            <Circle cx="136" cy="145" r="7" fill="#1E293B" />
            <Circle cx="138" cy="143" r="2.5" fill="#FFFFFF" />
            <Circle cx="184" cy="145" r="7" fill="#1E293B" />
            <Circle cx="186" cy="143" r="2.5" fill="#FFFFFF" />
            <Path d="M142,175 Q160,198 178,175" stroke="#1E293B" strokeWidth={5} fill="none" strokeLinecap="round" />
          </Svg>
        );

      /* ==================== 🍄 MUSHROOM (મશરૂમ - Level 1: 4 Shapes) ==================== */
      case 'mushroom':
        return (
          <Svg viewBox="0 0 320 320" width={canvasSize} height={canvasSize}>
            {/* Green Grass Base */}
            <Path
              d="M40,280 Q160,265 280,280 L280,305 L40,305 Z"
              fill={getFill('grass')}
              {...getPartEvents('grass')}
              stroke="#1E293B"
              strokeWidth={4}
              strokeLinejoin="round"
            />

            {/* Stem */}
            <Path
              d="M125,185 C120,240 105,280 120,285 C145,290 175,290 200,285 C215,280 200,240 195,185 Z"
              fill={getFill('stem')}
              {...getPartEvents('stem')}
              stroke="#1E293B"
              strokeWidth={6}
              strokeLinejoin="round"
            />

            {/* Big Mushroom Cap */}
            <Path
              d="M45,190 C45,100 100,50 160,50 C220,50 275,100 275,190 C275,202 260,205 240,198 C215,190 105,190 80,198 C60,205 45,202 45,190 Z"
              fill={getFill('cap')}
              {...getPartEvents('cap')}
              stroke="#1E293B"
              strokeWidth={6}
              strokeLinejoin="round"
            />

            {/* Cap Spots */}
            <G {...getPartEvents('spots')}>
              <Circle cx="160" cy="95" r="18" fill={getFill('spots')} stroke="#1E293B" strokeWidth={3} />
              <Circle cx="105" cy="140" r="14" fill={getFill('spots')} stroke="#1E293B" strokeWidth={3} />
              <Circle cx="215" cy="140" r="14" fill={getFill('spots')} stroke="#1E293B" strokeWidth={3} />
            </G>

            {/* Cute Smile on Stem */}
            <Circle cx="145" cy="230" r="5" fill="#1E293B" />
            <Circle cx="175" cy="230" r="5" fill="#1E293B" />
            <Path d="M150,245 Q160,255 170,245" stroke="#1E293B" strokeWidth={3.5} fill="none" strokeLinecap="round" />
          </Svg>
        );

      /* ==================== 🐘 ELEPHANT (નાનો ક્યૂટ હાથી - Level 2: 12 Shapes - Redesigned & Cute) ==================== */
      case 'elephant':
        return (
          <Svg viewBox="0 0 320 320" width={canvasSize} height={canvasSize}>
            {/* Ground Lawn Patch */}
            <Path
              d="M15,285 Q160,268 305,285 L305,315 L15,315 Z"
              fill={getFill('grass')}
              {...getPartEvents('grass')}
              stroke="#1E293B"
              strokeWidth={4}
              strokeLinejoin="round"
            />

            {/* Cute Tail & Tuft */}
            <Path
              d="M58,205 Q35,225 40,248"
              fill="none"
              stroke="#1E293B"
              strokeWidth={5}
              strokeLinecap="round"
            />
            <Path
              d="M32,242 C20,255 42,270 48,252 Z"
              fill={getFill('tailPuff')}
              {...getPartEvents('tailPuff')}
              stroke="#1E293B"
              strokeWidth={3}
              strokeLinejoin="round"
            />

            {/* Back Leg */}
            <Path
              d="M65,195 L65,278 C65,286 98,286 98,278 L98,205 Z"
              fill={getFill('backLeg')}
              {...getPartEvents('backLeg')}
              stroke="#1E293B"
              strokeWidth={5}
              strokeLinejoin="round"
            />

            {/* Chubby Round Body */}
            <Path
              d="M68,155 C65,115 110,105 160,112 C205,118 225,145 220,195 C215,242 170,256 125,256 C80,256 68,210 68,155 Z"
              fill={getFill('body')}
              {...getPartEvents('body')}
              stroke="#1E293B"
              strokeWidth={6}
              strokeLinejoin="round"
            />

            {/* Cute Belly Patch */}
            <Path
              d="M95,170 C95,228 145,238 180,208 C160,162 115,158 95,170 Z"
              fill={getFill('belly')}
              {...getPartEvents('belly')}
              stroke="#1E293B"
              strokeWidth={4}
            />

            {/* Front Left Leg */}
            <Path
              d="M105,200 L105,280 C105,288 140,288 140,280 L140,205 Z"
              fill={getFill('frontLeftLeg')}
              {...getPartEvents('frontLeftLeg')}
              stroke="#1E293B"
              strokeWidth={5}
              strokeLinejoin="round"
            />

            {/* Front Right Leg */}
            <Path
              d="M165,200 L165,280 C165,288 200,288 200,280 L200,205 Z"
              fill={getFill('frontRightLeg')}
              {...getPartEvents('frontRightLeg')}
              stroke="#1E293B"
              strokeWidth={5}
              strokeLinejoin="round"
            />

            {/* Toenails for Legs */}
            <Path
              d="M106,270 Q123,260 139,270 L139,280 L106,280 Z M166,270 Q183,260 199,270 L199,280 L166,280 Z"
              fill={getFill('toenails')}
              {...getPartEvents('toenails')}
              stroke="#1E293B"
              strokeWidth={3}
              strokeLinejoin="round"
            />

            {/* Friendly Big Baby Head */}
            <Circle
              cx="198"
              cy="115"
              r="48"
              fill={getFill('head')}
              {...getPartEvents('head')}
              stroke="#1E293B"
              strokeWidth={6}
            />

            {/* Big Floppy Left Ear */}
            <Path
              d="M185,95 C125,55 95,120 120,168 C140,202 190,182 190,148 Z"
              fill={getFill('ear')}
              {...getPartEvents('ear')}
              stroke="#1E293B"
              strokeWidth={5}
              strokeLinejoin="round"
            />

            {/* Pink Inner Ear */}
            <Path
              d="M170,108 C135,80 115,125 132,154 C144,174 175,162 175,142 Z"
              fill={getFill('innerEar')}
              {...getPartEvents('innerEar')}
              stroke="#1E293B"
              strokeWidth={3}
              strokeLinejoin="round"
            />

            {/* Joyful Raised Curved Trunk */}
            <Path
              d="M236,128 C260,142 290,136 286,98 C282,70 248,74 252,90 C256,100 274,98 270,110 C262,122 242,118 226,112 Z"
              fill={getFill('trunk')}
              {...getPartEvents('trunk')}
              stroke="#1E293B"
              strokeWidth={5}
              strokeLinejoin="round"
            />

            {/* Big Sparkling Cartoon Eye */}
            <Circle cx="214" cy="104" r="8" fill="#1E293B" />
            <Circle cx="216" cy="102" r="3" fill="#FFFFFF" />
            <Circle cx="212" cy="107" r="1.5" fill="#FFFFFF" />
            <Path d="M208,94 Q215,90 222,94" stroke="#1E293B" strokeWidth={3} fill="none" strokeLinecap="round" />

            {/* Rosy Cheek */}
            <Circle cx="228" cy="118" r="7" fill="#FCA5A5" opacity={0.65} />
          </Svg>
        );

      /* ==================== 🦋 BUTTERFLY (પતંગિયું - Level 2: 11 Shapes) ==================== */
      case 'butterfly':
        return (
          <Svg viewBox="0 0 320 320" width={canvasSize} height={canvasSize}>
            {/* Fluffy Sky Cloud */}
            <Path
              d="M25,50 C25,36 40,36 50,40 C55,26 75,26 84,38 C94,30 108,38 108,50 C108,60 25,60 25,50 Z"
              fill={getFill('cloud')}
              {...getPartEvents('cloud')}
              stroke="#1E293B"
              strokeWidth={4}
              strokeLinejoin="round"
            />

            {/* Top Left Wing */}
            <Path
              d="M150,130 C120,35 30,45 35,135 C35,185 120,185 150,165 Z"
              fill={getFill('topLeftWing')}
              {...getPartEvents('topLeftWing')}
              stroke="#1E293B"
              strokeWidth={5}
              strokeLinejoin="round"
            />

            {/* Top Right Wing */}
            <Path
              d="M170,130 C200,35 290,45 285,135 C285,185 200,185 170,165 Z"
              fill={getFill('topRightWing')}
              {...getPartEvents('topRightWing')}
              stroke="#1E293B"
              strokeWidth={5}
              strokeLinejoin="round"
            />

            {/* Bottom Left Wing */}
            <Path
              d="M150,175 C100,185 55,225 75,270 C95,295 150,235 155,200 Z"
              fill={getFill('bottomLeftWing')}
              {...getPartEvents('bottomLeftWing')}
              stroke="#1E293B"
              strokeWidth={5}
              strokeLinejoin="round"
            />

            {/* Bottom Right Wing */}
            <Path
              d="M170,175 C220,185 265,225 245,270 C225,295 170,235 165,200 Z"
              fill={getFill('bottomRightWing')}
              {...getPartEvents('bottomRightWing')}
              stroke="#1E293B"
              strokeWidth={5}
              strokeLinejoin="round"
            />

            {/* 4 Wing Spots */}
            <Circle cx="85" cy="125" r="18" fill={getFill('spot1')} {...getPartEvents('spot1')} stroke="#1E293B" strokeWidth={4} />
            <Circle cx="235" cy="125" r="18" fill={getFill('spot2')} {...getPartEvents('spot2')} stroke="#1E293B" strokeWidth={4} />
            <Circle cx="115" cy="245" r="14" fill={getFill('spot3')} {...getPartEvents('spot3')} stroke="#1E293B" strokeWidth={4} />
            <Circle cx="205" cy="245" r="14" fill={getFill('spot4')} {...getPartEvents('spot4')} stroke="#1E293B" strokeWidth={4} />

            {/* Body */}
            <Rect
              x="150"
              y="110"
              width="20"
              height="120"
              rx="10"
              fill={getFill('body')}
              {...getPartEvents('body')}
              stroke="#1E293B"
              strokeWidth={5}
            />

            {/* Head */}
            <Circle
              cx="160"
              cy="95"
              r="16"
              fill={getFill('head')}
              {...getPartEvents('head')}
              stroke="#1E293B"
              strokeWidth={5}
            />

            {/* Antennae & Eyes */}
            <Path d="M155,80 Q130,45 120,55" stroke="#1E293B" strokeWidth={4} fill="none" strokeLinecap="round" />
            <Circle cx="118" cy="55" r="5" fill="#1E293B" />
            <Path d="M165,80 Q190,45 200,55" stroke="#1E293B" strokeWidth={4} fill="none" strokeLinecap="round" />
            <Circle cx="202" cy="55" r="5" fill="#1E293B" />
            <Circle cx="155" cy="94" r="2.5" fill="#1E293B" />
            <Circle cx="165" cy="94" r="2.5" fill="#1E293B" />
          </Svg>
        );

      /* ==================== 🌸 FLOWER (બગીચાનું ફૂલ - Level 2: 11 Shapes) ==================== */
      case 'flower':
        return (
          <Svg viewBox="0 0 320 320" width={canvasSize} height={canvasSize}>
            {/* Stem */}
            <Path
              d="M160,180 L160,265"
              fill="none"
              stroke={getFill('stem') === '#FFFFFF' ? '#15803D' : getFill('stem')}
              {...getPartEvents('stem')}
              strokeWidth={10}
              strokeLinecap="round"
            />

            {/* Leaves */}
            <Path
              d="M160,225 Q110,200 95,230 Q135,250 160,235 Z"
              fill={getFill('leaf1')}
              {...getPartEvents('leaf1')}
              stroke="#1E293B"
              strokeWidth={4}
              strokeLinejoin="round"
            />
            <Path
              d="M160,240 Q210,215 225,245 Q185,265 160,250 Z"
              fill={getFill('leaf2')}
              {...getPartEvents('leaf2')}
              stroke="#1E293B"
              strokeWidth={4}
              strokeLinejoin="round"
            />

            {/* Flower Pot */}
            <Polygon
              points="115,265 205,265 190,305 130,305"
              fill={getFill('pot')}
              {...getPartEvents('pot')}
              stroke="#1E293B"
              strokeWidth={5}
              strokeLinejoin="round"
            />

            {/* 6 Individual Petals */}
            <Circle cx="160" cy="72" r="36" fill={getFill('petal1')} {...getPartEvents('petal1')} stroke="#1E293B" strokeWidth={5} />
            <Circle cx="216" cy="100" r="36" fill={getFill('petal2')} {...getPartEvents('petal2')} stroke="#1E293B" strokeWidth={5} />
            <Circle cx="216" cy="165" r="36" fill={getFill('petal3')} {...getPartEvents('petal3')} stroke="#1E293B" strokeWidth={5} />
            <Circle cx="160" cy="195" r="36" fill={getFill('petal4')} {...getPartEvents('petal4')} stroke="#1E293B" strokeWidth={5} />
            <Circle cx="104" cy="165" r="36" fill={getFill('petal5')} {...getPartEvents('petal5')} stroke="#1E293B" strokeWidth={5} />
            <Circle cx="104" cy="100" r="36" fill={getFill('petal6')} {...getPartEvents('petal6')} stroke="#1E293B" strokeWidth={5} />

            {/* Center Disc with Face */}
            <Circle
              cx="160"
              cy="134"
              r="40"
              fill={getFill('center')}
              {...getPartEvents('center')}
              stroke="#1E293B"
              strokeWidth={5}
            />
            <Circle cx="146" cy="126" r="5" fill="#1E293B" />
            <Circle cx="174" cy="126" r="5" fill="#1E293B" />
            <Path d="M148,142 Q160,156 172,142" stroke="#1E293B" strokeWidth={4} fill="none" strokeLinecap="round" />
          </Svg>
        );

      /* ==================== 🚗 TOY CAR (રમકડાની કાર - Level 2: 10 Shapes) ==================== */
      case 'car':
        return (
          <Svg viewBox="0 0 320 320" width={canvasSize} height={canvasSize}>
            {/* Roof */}
            <Path
              d="M85,170 L110,115 C120,95 145,90 175,90 L220,90 C240,90 255,105 265,130 L285,170 Z"
              fill={getFill('roof')}
              {...getPartEvents('roof')}
              stroke="#1E293B"
              strokeWidth={5}
              strokeLinejoin="round"
            />

            {/* Front & Back Windows */}
            <Path
              d="M175,118 L225,118 L245,158 L175,158 Z"
              fill={getFill('frontWindow')}
              {...getPartEvents('frontWindow')}
              stroke="#1E293B"
              strokeWidth={4}
              strokeLinejoin="round"
            />
            <Path
              d="M115,118 L160,118 L160,158 L90,158 Z"
              fill={getFill('backWindow')}
              {...getPartEvents('backWindow')}
              stroke="#1E293B"
              strokeWidth={4}
              strokeLinejoin="round"
            />

            {/* Car Body */}
            <Path
              d="M35,215 L35,185 C35,180 45,175 65,170 L285,170 C295,175 300,185 300,200 L300,225 C300,235 290,235 285,235 L255,235 C255,210 220,210 220,235 L120,235 C120,210 85,210 85,235 L45,235 C35,235 35,225 35,215 Z"
              fill={getFill('body')}
              {...getPartEvents('body')}
              stroke="#1E293B"
              strokeWidth={6}
              strokeLinejoin="round"
            />

            {/* Front Bumper */}
            <Rect
              x="292"
              y="210"
              width="15"
              height="20"
              rx="4"
              fill={getFill('bumper')}
              {...getPartEvents('bumper')}
              stroke="#1E293B"
              strokeWidth={3}
            />

            {/* Headlight */}
            <Rect
              x="288"
              y="180"
              width="14"
              height="18"
              rx="4"
              fill={getFill('headlight')}
              {...getPartEvents('headlight')}
              stroke="#1E293B"
              strokeWidth={3}
            />

            {/* Wheels & Hubcaps */}
            <Circle cx="238" cy="235" r="30" fill={getFill('frontWheel')} {...getPartEvents('frontWheel')} stroke="#1E293B" strokeWidth={5} />
            <Circle cx="238" cy="235" r="14" fill={getFill('frontHubcap')} {...getPartEvents('frontHubcap')} stroke="#1E293B" strokeWidth={3} />
            <Circle cx="102" cy="235" r="30" fill={getFill('backWheel')} {...getPartEvents('backWheel')} stroke="#1E293B" strokeWidth={5} />
            <Circle cx="102" cy="235" r="14" fill={getFill('backHubcap')} {...getPartEvents('backHubcap')} stroke="#1E293B" strokeWidth={3} />
          </Svg>
        );

      /* ==================== 🐠 FISH (નાની માછલી - Level 2: 8 Shapes) ==================== */
      case 'fish':
        return (
          <Svg viewBox="0 0 320 320" width={canvasSize} height={canvasSize}>
            {/* Bubbles */}
            <Circle cx="45" cy="85" r="14" fill={getFill('bubble1')} {...getPartEvents('bubble1')} stroke="#1E293B" strokeWidth={3} />
            <Circle cx="68" cy="60" r="8" fill={getFill('bubble2')} {...getPartEvents('bubble2')} stroke="#1E293B" strokeWidth={3} />

            {/* Tail Fin */}
            <Path
              d="M225,160 L295,95 Q280,160 295,225 Z"
              fill={getFill('tail')}
              {...getPartEvents('tail')}
              stroke="#1E293B"
              strokeWidth={5}
              strokeLinejoin="round"
            />

            {/* Top & Bottom Fins */}
            <Path
              d="M135,95 Q170,55 200,95 Z"
              fill={getFill('topFin')}
              {...getPartEvents('topFin')}
              stroke="#1E293B"
              strokeWidth={4}
              strokeLinejoin="round"
            />
            <Path
              d="M145,225 Q175,265 195,225 Z"
              fill={getFill('bottomFin')}
              {...getPartEvents('bottomFin')}
              stroke="#1E293B"
              strokeWidth={4}
              strokeLinejoin="round"
            />

            {/* Body */}
            <Path
              d="M70,160 C90,85 200,85 235,160 C200,235 90,235 70,160 Z"
              fill={getFill('body')}
              {...getPartEvents('body')}
              stroke="#1E293B"
              strokeWidth={6}
              strokeLinejoin="round"
            />

            {/* Belly Stripes */}
            <Path
              d="M145,115 Q168,160 145,205"
              fill="none"
              stroke={getFill('stripe1') === '#FFFFFF' ? '#1E293B' : getFill('stripe1')}
              {...getPartEvents('stripe1')}
              strokeWidth={8}
              strokeLinecap="round"
            />
            <Path
              d="M180,125 Q200,160 180,195"
              fill="none"
              stroke={getFill('stripe2') === '#FFFFFF' ? '#1E293B' : getFill('stripe2')}
              {...getPartEvents('stripe2')}
              strokeWidth={8}
              strokeLinecap="round"
            />

            {/* Eye & Smile */}
            <Circle cx="115" cy="145" r="10" fill="#FFFFFF" stroke="#1E293B" strokeWidth={3} />
            <Circle cx="112" cy="145" r="5" fill="#1E293B" />
            <Path d="M75,165 Q85,175 95,168" stroke="#1E293B" strokeWidth={4} fill="none" strokeLinecap="round" />
          </Svg>
        );

      /* ==================== 🚀 ROCKET (રોકેટ - Level 2: 9 Shapes) ==================== */
      case 'rocket':
        return (
          <Svg viewBox="0 0 320 320" width={canvasSize} height={canvasSize}>
            {/* Distant Planet */}
            <Circle
              cx="260"
              cy="50"
              r="22"
              fill={getFill('planet')}
              {...getPartEvents('planet')}
              stroke="#1E293B"
              strokeWidth={3}
            />

            {/* Flame Outer & Inner */}
            <Path
              d="M140,240 L160,295 L180,240 Z"
              fill={getFill('flameOuter')}
              {...getPartEvents('flameOuter')}
              stroke="#1E293B"
              strokeWidth={4}
              strokeLinejoin="round"
            />
            <Path
              d="M150,240 L160,275 L170,240 Z"
              fill={getFill('flameInner')}
              {...getPartEvents('flameInner')}
              stroke="#1E293B"
              strokeWidth={2.5}
              strokeLinejoin="round"
            />

            {/* Exhaust Nozzle */}
            <Polygon
              points="135,230 185,230 175,245 145,245"
              fill={getFill('nozzle')}
              {...getPartEvents('nozzle')}
              stroke="#1E293B"
              strokeWidth={4}
              strokeLinejoin="round"
            />

            {/* Side Wings */}
            <Path
              d="M120,180 L75,230 L120,225 Z"
              fill={getFill('leftWing')}
              {...getPartEvents('leftWing')}
              stroke="#1E293B"
              strokeWidth={5}
              strokeLinejoin="round"
            />
            <Path
              d="M200,180 L245,230 L200,225 Z"
              fill={getFill('rightWing')}
              {...getPartEvents('rightWing')}
              stroke="#1E293B"
              strokeWidth={5}
              strokeLinejoin="round"
            />

            {/* Main Rocket Body */}
            <Path
              d="M120,100 C120,100 115,230 120,230 L200,230 C205,230 200,100 200,100 Z"
              fill={getFill('rocketBody')}
              {...getPartEvents('rocketBody')}
              stroke="#1E293B"
              strokeWidth={6}
              strokeLinejoin="round"
            />

            {/* Nose Cone */}
            <Path
              d="M120,100 Q160,35 200,100 Z"
              fill={getFill('noseCone')}
              {...getPartEvents('noseCone')}
              stroke="#1E293B"
              strokeWidth={6}
              strokeLinejoin="round"
            />

            {/* Round Glass Porthole Window */}
            <Circle
              cx="160"
              cy="150"
              r="22"
              fill={getFill('window')}
              {...getPartEvents('window')}
              stroke="#1E293B"
              strokeWidth={5}
            />
            <Circle cx="160" cy="150" r="12" fill="none" stroke="#CBD5E1" strokeWidth={2} />
          </Svg>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.homeCircleBtn}
            onPress={handleBack}
            activeOpacity={0.85}
            accessibilityLabel="Back"
            accessibilityRole="button"
          >
            <View pointerEvents="none">
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M19 12H5M12 19L5 12L12 5"
                  stroke="#FFFFFF"
                  strokeWidth={2.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          </TouchableOpacity>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Art.PaletteArt size={24} />
              <Text style={styles.headerTitle}>
                {language === 'gu'
                  ? 'મનપસંદ રંગ પૂરો!'
                  : language === 'hi'
                  ? 'मनपसंद रंग भरो!'
                  : 'Coloring Studio!'}
              </Text>
            </View>
            <Text style={styles.headerSubtitle}>
              {language === 'gu'
                ? 'ચિત્ર પર ટચ કરીને સુંદર રંગ પૂરો'
                : language === 'hi'
                ? 'चित्र पर टच करके सुंदर रंग भरें'
                : 'Tap any shape to fill colors'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.clearHeaderBtn}
          onPress={handleClear}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
              <Path d="M3 6H21M19 6V20C19 21.1 18.1 22 17 22H7C5.9 22 5 21.1 5 20V6M8 6V4C8 2.9 8.9 2 10 2H14C15.1 2 16 2.9 16 4V6" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={styles.clearHeaderBtnText}>
              {language === 'gu' ? 'સાફ કરો' : language === 'hi' ? 'साफ करें' : 'Clear'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>

        {/* 3. Horizontal Template Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.templateScrollRow}
          nestedScrollEnabled={true}
          directionalLockEnabled={true}
          keyboardShouldPersistTaps="handled"
        >
          {levelTemplates.map((tpl) => {
            const isSelected = tpl.id === activeTemplate.id;
            const tplName =
              language === 'gu' ? tpl.nameGu : language === 'hi' ? tpl.nameHi : tpl.nameEn;
            return (
              <TouchableOpacity
                key={tpl.id}
                style={[
                  styles.templatePill,
                  isSelected && styles.templatePillActive,
                  shadows.soft,
                ]}
                onPress={() => handleSelectTemplate(tpl)}
                activeOpacity={0.85}
              >
                <View style={{ marginRight: 6 }}>{renderTemplateIcon(tpl.id)}</View>
                <Text
                  style={[
                    styles.templatePillText,
                    isSelected && styles.templatePillTextActive,
                  ]}
                >
                  {tplName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 4. Live Progress Pill (Shows filled count / total parts) */}
        <View style={styles.progressStatusRow}>
          <View
            style={[
              styles.progressStatusPill,
              isAllComplete
                ? styles.progressStatusPillDone
                : styles.progressStatusPillPending,
            ]}
          >
            <Text
              style={[
                styles.progressStatusText,
                isAllComplete
                  ? styles.progressStatusTextDone
                  : styles.progressStatusTextPending,
              ]}
            >
              {isAllComplete
                ? language === 'gu'
                  ? 'બધા આકારો પૂર્ણ! (૧૦૦%)'
                  : language === 'hi'
                  ? 'सभी आकार पूरे! (१००%)'
                  : 'All Shapes Filled! (100%)'
                : language === 'gu'
                ? `રંગ પૂરાયા: ${formatNumberDigits(coloredPartsCount, language)} / ${formatNumberDigits(totalParts, language)} (${formatNumberDigits(totalParts - coloredPartsCount, language)} બાકી)`
                : language === 'hi'
                ? `रंग भरे: ${formatNumberDigits(coloredPartsCount, language)} / ${formatNumberDigits(totalParts, language)} (${formatNumberDigits(totalParts - coloredPartsCount, language)} बाकी)`
                : `Filled: ${coloredPartsCount} / ${totalParts} (${totalParts - coloredPartsCount} left)`}
            </Text>
          </View>
        </View>

        {/* 5. Warning Toast Banner if user taps Finish prematurely */}
        {showRemainingToast && (
          <View style={[styles.warningBanner, shadows.soft]}>
            <Text style={styles.warningBannerText}>
              ⚠️{' '}
              {language === 'gu'
                ? `હજી ${formatNumberDigits(totalParts - coloredPartsCount, language)} ભાગમાં રંગ પૂરવાનો બાકી છે! બધા ભાગ રંગીને પૂર્ણ કરો!`
                : language === 'hi'
                ? `अभी ${formatNumberDigits(totalParts - coloredPartsCount, language)} भाग बाकी हैं! सभी भागों में रंग भरें!`
                : `Still ${totalParts - coloredPartsCount} shapes left to color! Fill all parts to complete!`}
            </Text>
          </View>
        )}

        {/* 6. Tap-To-Fill SVG Canvas */}
        <View style={[styles.canvasCard, shadows.card]}>
          {renderSvgIllustration()}
        </View>

        {/* 7. Tool Bar: Eraser & Undo */}
        <View style={styles.toolControlsBar}>
          <View style={styles.activeColorIndicatorRow}>
            <Text style={styles.activeColorLabel}>
              {language === 'gu' ? 'પસંદ કરેલ રંગ:' : language === 'hi' ? 'चुना हुआ रंग:' : 'Selected Color:'}
            </Text>
            <View
              style={[
                styles.activeColorDot,
                { backgroundColor: isEraser ? '#FFFFFF' : selectedColor },
                isEraser && styles.activeColorDotEraser,
              ]}
            />
            {isEraser && (
              <Text style={styles.eraserActiveText}>
                {language === 'gu' ? '(રબર ચાલુ છે)' : language === 'hi' ? '(रबर चालू है)' : '(Eraser Active)'}
              </Text>
            )}
          </View>

          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={[styles.actionSquareBtn, isEraser && styles.actionSquareBtnActive]}
              onPress={() => {
                soundEffects.playBubblePop();
                setIsEraser(!isEraser);
              }}
              activeOpacity={0.8}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M19 14L10 23L2 15L11 6M19 14L14 9L18 5C19.1 3.9 20.9 3.9 22 5C23.1 6.1 23.1 7.9 22 9L19 14ZM19 14L10 23H22" stroke={isEraser ? '#DC2626' : '#64748B'} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill={isEraser ? '#FEE2E2' : '#F8FAFC'} />
              </Svg>
              <Text style={[styles.actionSquareText, isEraser && styles.actionSquareTextActive]}>
                {language === 'gu' ? 'રબર' : language === 'hi' ? 'रबर' : 'Eraser'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionSquareBtn}
              onPress={handleUndo}
              activeOpacity={0.8}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M4 9H15C18.314 9 21 11.686 21 15C21 18.314 18.314 21 15 21H8M4 9L9 4M4 9L9 14" stroke="#64748B" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={styles.actionSquareText}>
                {language === 'gu' ? 'પાછળ' : language === 'hi' ? 'वापस' : 'Undo'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 8. Big Vibrant Color Palette */}
        <View style={[styles.paletteContainer, shadows.card]}>
          <View style={styles.paletteGrid}>
            {PALETTE.map((color) => {
              const isSelected = selectedColor === color && !isEraser;
              return (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorBall,
                    { backgroundColor: color },
                    isSelected && styles.colorBallSelected,
                    shadows.soft,
                  ]}
                  onPress={() => {
                    soundEffects.playBubblePop();
                    setIsEraser(false);
                    setSelectedColor(color);
                  }}
                  activeOpacity={0.85}
                >
                  {isSelected && <View style={styles.colorBallCheck} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Finish Button: Calls handleDoneClick which strictly checks isAllComplete */}
          <TouchableOpacity
            style={[
              styles.doneButton,
              isAllComplete ? styles.doneButtonReady : styles.doneButtonPending,
              shadows.soft,
            ]}
            onPress={handleDoneClick}
            activeOpacity={0.85}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FDE047" stroke="#F59E0B" strokeWidth={1} />
              </Svg>
              <Text style={styles.doneButtonText}>
                {isAllComplete
                  ? language === 'gu'
                    ? 'શાબાશ! પૂર્ણ કરો'
                    : language === 'hi'
                    ? 'शाबाश! पूरा करें'
                    : 'Super! Complete'
                  : language === 'gu'
                  ? `બધા રંગ પૂરો (${formatNumberDigits(coloredPartsCount, language)}/${formatNumberDigits(totalParts, language)})`
                  : language === 'hi'
                  ? `सभी रंग भरें (${formatNumberDigits(coloredPartsCount, language)}/${formatNumberDigits(totalParts, language)})`
                  : `Fill All Shapes (${coloredPartsCount}/${totalParts})`}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 9. Celebration Modal */}
      <Modal visible={showCelebration} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, shadows.modal]}>
            <Text style={styles.modalEmoji}>🎉 🎨 ⭐</Text>
            <Text style={styles.modalTitle}>
              {language === 'gu'
                ? 'ખૂબ જ સરસ કલાત્મક ચિત્ર!'
                : language === 'hi'
                ? 'बहुत ही सुंदर कलात्मक चित्र!'
                : 'Wonderful Masterpiece!'}
            </Text>
            <Text style={styles.modalSub}>
              {language === 'gu'
                ? 'તમે ચિત્રના દરેક ભાગમાં રંગ પૂરીને ૧૦ સોનેરી સિતારા જીત્યા છે!'
                : language === 'hi'
                ? 'आपने चित्र के हर भाग में रंग भरकर १० सुनहरे सितारे जीते हैं!'
                : 'You filled all shapes & earned 10 Golden Stars!'}
            </Text>

            <View style={styles.modalStarPill}>
              <Text style={styles.modalStarText}>⭐ +10 Stars</Text>
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalRetryBtn}
                onPress={() => {
                  soundEffects.playBubblePop();
                  isFinishingRef.current = false;
                  setShowCelebration(false);
                  setFills({});
                  setHistory([]);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.modalRetryText}>
                  {language === 'gu' ? 'ફરીથી રંગો' : language === 'hi' ? 'फिर से रंगें' : 'Color Again'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalHomeBtn}
                onPress={() => {
                  soundEffects.playBubblePop();
                  setShowCelebration(false);
                  router.replace('/home');
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.modalHomeText}>
                  {language === 'gu' ? 'હોમ સ્ક્રીન' : language === 'hi' ? 'होम स्क्रीन' : 'Home'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  headerBar: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  homeCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeCircleIcon: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#E9D5FF',
    marginTop: 1,
    lineHeight: 16,
  },
  clearHeaderBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#DC2626',
  },
  clearHeaderBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  container: {
    padding: spacing.md,
    alignItems: 'center',
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 40,
  },



  /* Template Selector */
  templateScrollRow: {
    gap: 8,
    paddingVertical: 4,
    marginBottom: spacing.xs,
  },
  templatePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    // design system: clay
    minHeight: 52,
    borderRadius: kidRadii.pill,
    justifyContent: 'center',
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(15, 23, 42, 0.22)',
  },
  templatePillActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#7C3AED',
  },
  templatePillEmoji: {
    fontSize: 18,
  },
  templatePillText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#334155',
  },
  templatePillTextActive: {
    color: '#FFFFFF',
  },

  /* Live Progress Status */
  progressStatusRow: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 4,
  },
  progressStatusPill: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1.2,
  },
  progressStatusPillPending: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  progressStatusPillDone: {
    backgroundColor: '#ECFDF5',
    borderColor: '#6EE7B7',
  },
  progressStatusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressStatusTextPending: {
    color: '#1E40AF',
  },
  progressStatusTextDone: {
    color: '#047857',
  },

  /* Warning Banner */
  warningBanner: {
    width: '100%',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    marginBottom: 6,
    alignItems: 'center',
  },
  warningBannerText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B91C1C',
    textAlign: 'center',
  },

  /* Canvas */
  canvasCard: {
    width: '100%',
    aspectRatio: 1,
    maxHeight: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    padding: 10,
  },

  /* Tool Controls */
  toolControlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.sm,
    paddingHorizontal: 4,
  },
  activeColorIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeColorLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },
  activeColorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...shadows.soft,
  },
  activeColorDotEraser: {
    borderWidth: 1.5,
    borderColor: '#DC2626',
  },
  eraserActiveText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
  },

  quickActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionSquareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    // design system: clay
    minHeight: 52,
    borderRadius: kidRadii.pill,
    justifyContent: 'center',
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(15, 23, 42, 0.22)',
  },
  actionSquareBtnActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  actionSquareEmoji: {
    fontSize: 15,
  },
  actionSquareText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  actionSquareTextActive: {
    color: '#DC2626',
  },

  /* Palette */
  paletteContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  paletteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  colorBall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  colorBallSelected: {
    borderColor: '#1E293B',
    transform: [{ scale: 1.22 }],
  },
  colorBallCheck: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },

  doneButton: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    // design system: clay
    minHeight: 52,
    borderRadius: kidRadii.pill,
    justifyContent: 'center',
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(15, 23, 42, 0.22)',
  },
  doneButtonReady: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  doneButtonPending: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  doneButtonText: {
    fontSize: 15.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    padding: spacing.xl,
    alignItems: 'center',
    borderColor: '#7C3AED',
    // design system: clay
    borderRadius: kidRadii.card,
    borderWidth: 1.5,
    ...clayShadow(2),
  },
  modalEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
  },
  modalStarPill: {
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FACC15',
    marginVertical: 16,
  },
  modalStarText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#A16207',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  modalRetryBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    // design system: clay
    minHeight: 52,
    borderRadius: kidRadii.pill,
    justifyContent: 'center',
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(15, 23, 42, 0.22)',
  },
  modalRetryText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
  },
  modalHomeBtn: {
    flex: 1.2,
    backgroundColor: '#7C3AED',
    paddingVertical: 12,
    alignItems: 'center',
    // design system: clay
    minHeight: 52,
    borderRadius: kidRadii.pill,
    justifyContent: 'center',
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(15, 23, 42, 0.22)',
  },
  modalHomeText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
