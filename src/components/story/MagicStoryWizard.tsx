import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { ClayButton } from '../clay';
import { Glyph, PencilIcon } from '../fun';
import { soundEffects } from '../../services/soundEffects';
import { backendService } from '../../services/backendService';
import { AVATAR_3D_BOY, AVATAR_3D_GIRL, ICON_3D_STAR, MAGIC_UI_ART } from '../../utils/imageHelper';
import { formatChildName } from '../../utils/nameTransliterator';
import {
  COMPANION_SOUND_KEYS,
  WizardStep,
  getWizardChoices,
  getWizardPrompt,
  getWizardTitle,
} from '../../utils/magicStoryGenerator';
import { AppLanguage } from '../../types';
import { Remote3DImage } from '../common/Remote3DImage';

const useNative = Platform.OS !== 'web';

type Tri = { gu: string; hi: string; en: string };
const tr = (lang: AppLanguage, s: Tri) => (lang === 'gu' ? s.gu : lang === 'hi' ? s.hi : s.en);

/** Selection colour schemes: white when idle; sunshine (companions/heroes) or sky (quests/tools) when picked. */
const PICK = {
  sun: { fill: '#F59E0B', edge: '#D97706', tint: '#FEF3C7', text: '#451A03' },
  sky: { fill: '#0EA5E9', edge: '#0284C7', tint: '#E0F2FE', text: '#0369A1' },
} as const;
type PickTone = keyof typeof PICK;

export interface MagicStoryChoice {
  childName: string;
  companionId: string;
  themeId: string;
  toolId: string;
}

interface MagicStoryWizardProps {
  visible: boolean;
  language: AppLanguage;
  /** The active child's name (pre-selected hero, no typing needed). */
  defaultHeroName: string;
  speak: (text: string, lang: AppLanguage) => void;
  onClose: () => void;
  onCreate: (choice: MagicStoryChoice) => void;
}

interface HeroOption {
  key: string;
  name: string;
  image: any;
}

// ---------------------------------------------------------------- small pieces

/** Simple speaker glyph (no emoji). */
const SpeakerIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = '#6D28D9' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill={color} />
    <Path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
  </Svg>
);

/** Twinkling gold sparkles scattered over the twilight header. */
const TWINKLES = [
  { left: '8%', top: 10, size: 14, delay: 0 },
  { left: '30%', top: 6, size: 10, delay: 400 },
  { left: '52%', top: 14, size: 12, delay: 800 },
  { left: '74%', top: 8, size: 9, delay: 200 },
  { left: '88%', top: 70, size: 12, delay: 600 },
  { left: '20%', top: 84, size: 9, delay: 1000 },
  { left: '64%', top: 92, size: 11, delay: 300 },
] as const;

const Twinkle: React.FC<{ size: number; delay: number; style: any }> = ({ size, delay, style }) => {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(t, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: useNative }),
        Animated.timing(t, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: useNative }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [t, delay]);
  const opacity = t.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] });
  const scale = t.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.15] });
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', opacity, transform: [{ scale }] }, style]}>
      <Svg width={size} height={size} viewBox="0 0 20 20">
        <Path d="M10 0 L12.2 7.8 L20 10 L12.2 12.2 L10 20 L7.8 12.2 L0 10 L7.8 7.8 Z" fill="#FDE68A" />
      </Svg>
    </Animated.View>
  );
};

const HeaderTwinkles: React.FC = () => (
  <>
    {TWINKLES.map((s, i) => (
      <Twinkle key={i} size={s.size} delay={s.delay} style={{ left: s.left, top: s.top }} />
    ))}
  </>
);

/**
 * Big tactile 3D choice card.
 * Idle: white, 2px #E2E8F0 border, soft shadow, ink text.
 * Picked: tone tint, 3px tone border, pulsing glow ring, popping green ✓ badge.
 * Tap: squash-and-spring bounce.
 */
const ChoiceCard: React.FC<{
  image: any;
  label: string;
  selected: boolean;
  tone: PickTone;
  onPress: () => void;
  layout?: 'tile' | 'wide';
  imageSize?: number;
  width?: any;
}> = ({ image, label, selected, tone, onPress, layout = 'tile', imageSize = 96, width }) => {
  const spec = PICK[tone];
  const squash = useRef(new Animated.Value(1)).current;
  const check = useRef(new Animated.Value(selected ? 1 : 0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(check, { toValue: selected ? 1 : 0, friction: 4, tension: 180, useNativeDriver: useNative }).start();
    if (!selected) {
      glow.setValue(0);
      bob.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(glow, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: useNative }),
          Animated.timing(glow, { toValue: 0, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: useNative }),
        ]),
        Animated.sequence([
          Animated.timing(bob, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: useNative }),
          Animated.timing(bob, { toValue: 0, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: useNative }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [selected, check, glow, bob]);

  const handlePress = () => {
    squash.setValue(0.9);
    Animated.spring(squash, { toValue: 1, friction: 3, tension: 200, useNativeDriver: useNative }).start();
    onPress();
  };

  const ringOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.95] });
  const ringScale = glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] });
  const imgLift = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
  const isWide = layout === 'wide';

  return (
    <Animated.View style={[{ transform: [{ scale: squash }] }, width ? { width } : null]}>
      {selected ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.glowRing, { borderColor: spec.fill, opacity: ringOpacity, transform: [{ scale: ringScale }] }]}
        />
      ) : null}
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={label}
        style={[
          styles.card,
          isWide ? styles.cardWide : styles.cardTile,
          selected
            ? { backgroundColor: spec.tint, borderColor: spec.fill, borderWidth: 3, borderBottomWidth: 6, borderBottomColor: spec.edge }
            : null,
          Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
        ]}
      >
        <Animated.View style={{ transform: [{ translateY: imgLift }] }}>
          <Remote3DImage
            source={image}
            style={{ width: imageSize, height: imageSize }}
            fallback={<Glyph name="sparkle" size={Math.round(imageSize * 0.6)} color="#A78BFA" />}
          />
        </Animated.View>
        <Text
          style={[styles.cardLabel, isWide && styles.cardLabelWide, selected && { color: spec.text }]}
          numberOfLines={2}
        >
          {label}
        </Text>
        <Animated.View pointerEvents="none" style={[styles.checkBadge, { transform: [{ scale: check }] }]}>
          <Glyph name="check" size={18} color="#FFFFFF" strokeWidth={3.6} />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

/** Star progress tracker: one star per step, the current one bounces. */
const StarTracker: React.FC<{ step: WizardStep }> = ({ step }) => {
  const bounce = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    bounce.setValue(0);
    Animated.spring(bounce, { toValue: 1, friction: 3, tension: 140, useNativeDriver: useNative }).start();
  }, [step, bounce]);
  const scale = bounce.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.15] });
  return (
    <View style={styles.tracker} accessibilityLabel={`Step ${step} of 3`}>
      {[1, 2, 3].map((n) => {
        const reached = n <= step;
        const current = n === step;
        return (
          <React.Fragment key={n}>
            {n > 1 ? <View style={[styles.trackerLine, reached && styles.trackerLineOn]} /> : null}
            <Animated.View style={[styles.trackerStar, current && { transform: [{ scale }] }]}>
              <Image source={ICON_3D_STAR} resizeMode="contain" style={[styles.trackerStarImg, !reached && styles.trackerStarOff]} />
            </Animated.View>
          </React.Fragment>
        );
      })}
    </View>
  );
};

/** Giant pulsating launch button (68px, berry coral with a 3D lip). */
const LaunchButton: React.FC<{ label: string; onPress: () => void }> = ({ label, onPress }) => {
  const pulse = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: useNative }),
        Animated.timing(pulse, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: useNative }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });
  const sink = press.interpolate({ inputRange: [0, 1], outputRange: [0, 5] });
  return (
    <Animated.View style={[styles.launchWrap, { transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => Animated.timing(press, { toValue: 1, duration: 70, useNativeDriver: useNative }).start()}
        onPressOut={() => Animated.spring(press, { toValue: 0, friction: 4, tension: 160, useNativeDriver: useNative }).start()}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[styles.launchOuter, Platform.OS === 'web' && ({ cursor: 'pointer' } as any)]}
      >
        <View style={styles.launchLip} />
        <Animated.View style={[styles.launchFace, { transform: [{ translateY: sink }] }]}>
          <Image source={MAGIC_UI_ART.wand} resizeMode="contain" style={styles.launchIcon} />
          <Text style={styles.launchText} numberOfLines={1} adjustsFontSizeToFit>
            {label}
          </Text>
          <Image source={MAGIC_UI_ART.rocket} resizeMode="contain" style={styles.launchIcon} />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

// ---------------------------------------------------------------- wizard

/**
 * AI Magic Story Maker as a 3-step, zero-typing, audio-first wizard:
 *   1. Who is the Hero?   (child profile / hero chips, no keyboard)
 *   2. Pick Your Best Buddy!  (6 big 3D companion cards, animal sound + name)
 *   3. Where Are We Going? + magic tool, then the giant launch button.
 */
export const MagicStoryWizard: React.FC<MagicStoryWizardProps> = ({
  visible,
  language,
  defaultHeroName,
  speak,
  onClose,
  onCreate,
}) => {
  const { width, height } = useWindowDimensions();
  const { companions, quests, tools } = getWizardChoices();
  const [step, setStep] = useState<WizardStep>(1);
  const [heroes, setHeroes] = useState<HeroOption[]>([]);
  const [heroName, setHeroName] = useState(defaultHeroName);
  const [selectedHeroImage, setSelectedHeroImage] = useState<any>(AVATAR_3D_BOY);
  const [companionId, setCompanionId] = useState<string>(companions[0]?.id || 'lion');
  const [themeId, setThemeId] = useState<string>(quests[0]?.id || 'rainbow');
  const [toolId, setToolId] = useState<string>(tools[0]?.id || 'wand');
  const [customHeroName, setCustomHeroName] = useState('');
  const [isCustomActive, setIsCustomActive] = useState(false);
  const [isCustomFocused, setIsCustomFocused] = useState(false);
  const customInputRef = useRef<any>(null);
  const speakTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heroBob = useRef(new Animated.Value(0)).current;

  const displayName = (name: string) => formatChildName(name, language) || name;

  const isFeminineName = (name: string) => {
    const lower = name.trim().toLowerCase();
    return (
      lower.includes('rushika') ||
      lower.includes('girl') ||
      lower.endsWith('a') ||
      lower.endsWith('i') ||
      lower.endsWith('ee') ||
      lower.endsWith('ya')
    );
  };

  // Reset + load the family's saved child profiles each time the wizard opens.
  useEffect(() => {
    if (!visible) return;
    setStep(1);
    setHeroName(defaultHeroName);
    setCustomHeroName('');
    setIsCustomActive(false);
    setIsCustomFocused(false);
    const initialImg = defaultHeroName && isFeminineName(defaultHeroName) ? AVATAR_3D_GIRL : AVATAR_3D_BOY;
    setSelectedHeroImage(initialImg);

    let alive = true;
    const generic: HeroOption[] = [
      { key: 'g-girl', name: tr(language, { en: 'Wonder Girl', gu: 'વન્ડર ગર્લ', hi: 'वंडर गर्ल' }), image: AVATAR_3D_GIRL },
      { key: 'g-boy', name: tr(language, { en: 'Super Boy', gu: 'સુપર બોય', hi: 'सुपर बॉय' }), image: AVATAR_3D_BOY },
      { key: 'g-hero', name: tr(language, { en: 'Little Hero', gu: 'નાનો હીરો', hi: 'नन्हा हीरो' }), image: MAGIC_UI_ART.crown },
      { key: 'g-star', name: tr(language, { en: 'Super Star', gu: 'સુપર સ્ટાર', hi: 'सुपर स्टार' }), image: MAGIC_UI_ART.wand },
    ];
    const self: HeroOption[] = defaultHeroName ? [{ key: 'self', name: defaultHeroName, image: initialImg }] : [];
    setHeroes([...self, ...generic]);
    backendService
      .getProfiles()
      .then((profiles) => {
        if (!alive || !profiles) return;
        const family = profiles
          .map((p) => (p.nickname || '').trim())
          .filter((n) => n && n !== defaultHeroName)
          .slice(0, 2)
          .map((n, i) => ({
            key: `p-${i}-${n}`,
            name: n,
            image: isFeminineName(n) ? AVATAR_3D_GIRL : AVATAR_3D_BOY,
          }));
        setHeroes([...self, ...family, ...generic].slice(0, 4));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [visible, defaultHeroName, language]);

  // Every step greets the child out loud.
  useEffect(() => {
    if (!visible) return;
    if (speakTimer.current) clearTimeout(speakTimer.current);
    speakTimer.current = setTimeout(() => speak(getWizardPrompt(step, language, displayName(heroName)), language), 350);
    return () => {
      if (speakTimer.current) clearTimeout(speakTimer.current);
    };
    // heroName intentionally excluded: picking a hero speaks their name separately
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, step, language]);

  useEffect(() => {
    if (!visible) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(heroBob, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: useNative }),
        Animated.timing(heroBob, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: useNative }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [visible, heroBob]);

  const stopSounds = () => {
    if (speakTimer.current) clearTimeout(speakTimer.current);
    try {
      soundEffects.stopAnimalSound();
    } catch {}
  };

  const close = () => {
    stopSounds();
    soundEffects.playBubblePop();
    onClose();
  };

  const goTo = (next: WizardStep) => {
    stopSounds();
    if (next > step) soundEffects.playLevelUp();
    else soundEffects.playBubblePop();
    setStep(next);
  };

  const goBack = () => (step === 1 ? close() : goTo((step - 1) as WizardStep));

  const pickHero = (h: HeroOption) => {
    soundEffects.playBubblePop();
    setIsCustomActive(false);
    setHeroName(h.name);
    setSelectedHeroImage(h.image);
    speak(displayName(h.name), language);
  };

  const handleCustomNameChange = (val: string) => {
    setCustomHeroName(val);
    setIsCustomActive(true);
    const trimmed = val.trim();
    if (trimmed) {
      setHeroName(trimmed);
      const img = isFeminineName(trimmed) ? AVATAR_3D_GIRL : AVATAR_3D_BOY;
      setSelectedHeroImage(img);
    } else {
      setHeroName(defaultHeroName || tr(language, { en: 'Little Hero', gu: 'નાનો હીરો', hi: 'नन्हा हीरो' }));
    }
  };

  const handleCustomFocus = () => {
    setIsCustomFocused(true);
    setIsCustomActive(true);
    if (customHeroName.trim()) {
      setHeroName(customHeroName.trim());
    }
  };

  const handleClearCustom = () => {
    soundEffects.playBubblePop();
    setCustomHeroName('');
    setHeroName(defaultHeroName || tr(language, { en: 'Little Hero', gu: 'નાનો હીરો', hi: 'नन्हा हीरो' }));
    customInputRef.current?.focus();
  };

  const pickCompanion = (id: string, name: string) => {
    soundEffects.playBubblePop();
    setCompanionId(id);
    stopSounds();
    const soundKey = COMPANION_SOUND_KEYS[id];
    if (soundKey) soundEffects.playAnimalSound(soundKey, 1400).catch(() => {});
    speakTimer.current = setTimeout(() => speak(name, language), soundKey ? 1500 : 0);
  };

  const pickQuest = (id: string, title: string) => {
    soundEffects.playBubblePop();
    setThemeId(id);
    speak(title, language);
  };

  const pickTool = (id: string, name: string) => {
    soundEffects.playBubblePop();
    setToolId(id);
    speak(name, language);
  };

  const launch = () => {
    stopSounds();
    soundEffects.playTadaaa();
    onCreate({ childName: heroName, companionId, themeId, toolId });
  };

  const narrateStep = () => {
    soundEffects.playBubblePop();
    speak(getWizardPrompt(step, language, displayName(heroName)), language);
  };

  const wideScreen = width >= 640;
  const tileWidth = wideScreen ? '31%' : '47.5%';
  const heroLift = heroBob.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={goBack} statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={[styles.shell, { maxHeight: height - 24 }]}>
          {/* Twilight header: tap anywhere on it to hear the step again */}
          <Pressable onPress={narrateStep} accessibilityRole="button" accessibilityLabel={getWizardTitle(step, language)} style={styles.header}>
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
              <Svg width="100%" height="100%">
                <Defs>
                  <LinearGradient id="magic-wizard-twilight" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0%" stopColor="#6D28D9" />
                    <Stop offset="100%" stopColor="#8B5CF6" />
                  </LinearGradient>
                </Defs>
                <Rect width="100%" height="100%" fill="url(#magic-wizard-twilight)" />
              </Svg>
            </View>
            <HeaderTwinkles />
            <View style={styles.headerRow}>
              <Image source={MAGIC_UI_ART.wizard} resizeMode="contain" style={styles.headerArt} />
              <Text style={styles.headerTitle} numberOfLines={2}>
                {getWizardTitle(step, language)}
              </Text>
              <View style={styles.speakerBtn}>
                <SpeakerIcon />
              </View>
            </View>
            <StarTracker step={step} />
          </Pressable>

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {step === 1 ? (
              <View style={styles.stepWrap}>
                <Animated.View style={[styles.heroBubble, { transform: [{ translateY: heroLift }] }]}>
                  <Image source={selectedHeroImage} resizeMode="contain" style={styles.heroImg} />
                </Animated.View>
                <Text style={styles.heroName} numberOfLines={1} adjustsFontSizeToFit>
                  {displayName(heroName) || tr(language, { en: 'Little Hero', gu: 'નાનો હીરો', hi: 'नन्हा हीरो' })}
                </Text>
                <View style={styles.heroGrid}>
                  {heroes.map((h) => (
                    <ChoiceCard
                      key={h.key}
                      image={h.image}
                      label={displayName(h.name)}
                      tone="sun"
                      imageSize={64}
                      width={tileWidth}
                      selected={!isCustomActive && heroName === h.name}
                      onPress={() => pickHero(h)}
                    />
                  ))}
                </View>

                {/* Custom Name Section */}
                <View
                  style={[
                    styles.customCard,
                    isCustomActive && styles.customCardActive,
                  ]}
                >
                  <Pressable
                    onPress={() => {
                      setIsCustomActive(true);
                      customInputRef.current?.focus();
                    }}
                    style={styles.customHeaderRow}
                    accessibilityRole="button"
                    accessibilityLabel="Enter Custom Hero Name"
                  >
                    <View style={[styles.customIconBadge, isCustomActive && styles.customIconBadgeActive]}>
                      <PencilIcon size={18} color={isCustomActive ? '#B45309' : '#64748B'} />
                    </View>
                    <Text style={[styles.customHeaderTitle, isCustomActive && styles.customHeaderTitleActive]}>
                      {tr(language, {
                        en: 'Enter Custom Hero Name:',
                        gu: 'પોતાનું મનપસંદ નામ લખો:',
                        hi: 'अपना पसंदीदा नाम लिखें:',
                      })}
                    </Text>
                    {isCustomActive ? (
                      <View style={styles.customActiveCheck}>
                        <Glyph name="check" size={14} color="#FFFFFF" strokeWidth={3.5} />
                      </View>
                    ) : null}
                  </Pressable>

                  <View
                    style={[
                      styles.customInputRow,
                      isCustomFocused && styles.customInputRowFocused,
                      isCustomActive && !isCustomFocused && styles.customInputRowActive,
                    ]}
                  >
                    <TextInput
                      ref={customInputRef}
                      style={styles.customTextInput}
                      value={customHeroName}
                      onChangeText={handleCustomNameChange}
                      onFocus={handleCustomFocus}
                      onBlur={() => setIsCustomFocused(false)}
                      placeholder={tr(language, {
                        en: "Type child's name (e.g. Aarav, Diya)...",
                        gu: 'બાળકનું નામ લખો (દા.ત. આરવ, દિયા)...',
                        hi: 'बच्चे का नाम लिखें (जैसे आरव, दिया)...',
                      })}
                      placeholderTextColor="#94A3B8"
                      maxLength={24}
                      autoCapitalize="words"
                      autoCorrect={false}
                      returnKeyType="done"
                    />
                    {customHeroName.length > 0 ? (
                      <Pressable
                        onPress={handleClearCustom}
                        style={styles.clearBtn}
                        accessibilityRole="button"
                        accessibilityLabel="Clear custom name"
                      >
                        <Glyph name="close" size={14} color="#64748B" strokeWidth={3} />
                      </Pressable>
                    ) : null}
                  </View>

                  {/* Avatar look switcher for custom hero */}
                  <View style={styles.avatarPickerRow}>
                    <Text style={styles.avatarPickerLabel}>
                      {tr(language, {
                        en: 'Choose Hero Look:',
                        gu: 'હીરો લુક પસંદ કરો:',
                        hi: 'हीरो लुक चुनें:',
                      })}
                    </Text>
                    <View style={styles.avatarChoices}>
                      <Pressable
                        onPress={() => {
                          soundEffects.playBubblePop();
                          setIsCustomActive(true);
                          setSelectedHeroImage(AVATAR_3D_BOY);
                        }}
                        style={[
                          styles.avatarChoicePill,
                          isCustomActive && selectedHeroImage === AVATAR_3D_BOY && styles.avatarChoicePillActive,
                        ]}
                      >
                        <Image source={AVATAR_3D_BOY} style={styles.avatarChoiceThumb} resizeMode="contain" />
                        <Text
                          style={[
                            styles.avatarChoiceText,
                            isCustomActive && selectedHeroImage === AVATAR_3D_BOY && styles.avatarChoiceTextActive,
                          ]}
                        >
                          {tr(language, { en: 'Boy', gu: 'છોકરો', hi: 'लड़का' })}
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() => {
                          soundEffects.playBubblePop();
                          setIsCustomActive(true);
                          setSelectedHeroImage(AVATAR_3D_GIRL);
                        }}
                        style={[
                          styles.avatarChoicePill,
                          isCustomActive && selectedHeroImage === AVATAR_3D_GIRL && styles.avatarChoicePillActive,
                        ]}
                      >
                        <Image source={AVATAR_3D_GIRL} style={styles.avatarChoiceThumb} resizeMode="contain" />
                        <Text
                          style={[
                            styles.avatarChoiceText,
                            isCustomActive && selectedHeroImage === AVATAR_3D_GIRL && styles.avatarChoiceTextActive,
                          ]}
                        >
                          {tr(language, { en: 'Girl', gu: 'છોકરી', hi: 'लड़की' })}
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() => {
                          soundEffects.playBubblePop();
                          setIsCustomActive(true);
                          setSelectedHeroImage(MAGIC_UI_ART.crown);
                        }}
                        style={[
                          styles.avatarChoicePill,
                          isCustomActive && selectedHeroImage === MAGIC_UI_ART.crown && styles.avatarChoicePillActive,
                        ]}
                      >
                        <Image source={MAGIC_UI_ART.crown} style={styles.avatarChoiceThumb} resizeMode="contain" />
                        <Text
                          style={[
                            styles.avatarChoiceText,
                            isCustomActive && selectedHeroImage === MAGIC_UI_ART.crown && styles.avatarChoiceTextActive,
                          ]}
                        >
                          {tr(language, { en: 'Crown', gu: 'તાજ', hi: 'मुकुट' })}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            ) : null}

            {step === 2 ? (
              <View style={styles.grid}>
                {companions.map((c) => {
                  const name = tr(language, { en: c.nameEn, gu: c.nameGu, hi: c.nameHi });
                  return (
                    <ChoiceCard
                      key={c.id}
                      image={c.image}
                      label={name}
                      tone="sun"
                      imageSize={100}
                      width={tileWidth}
                      selected={companionId === c.id}
                      onPress={() => pickCompanion(c.id, name)}
                    />
                  );
                })}
              </View>
            ) : null}

            {step === 3 ? (
              <View style={styles.stepWrap}>
                <View style={styles.questList}>
                  {quests.map((q) => {
                    const title = tr(language, { en: q.titleEn, gu: q.titleGu, hi: q.titleHi });
                    return (
                      <ChoiceCard
                        key={q.id}
                        image={q.image}
                        label={title}
                        tone="sky"
                        layout="wide"
                        imageSize={92}
                        selected={themeId === q.id}
                        onPress={() => pickQuest(q.id, title)}
                      />
                    );
                  })}
                </View>
                <View style={styles.sectionLabelRow}>
                  <Image source={MAGIC_UI_ART.wand} resizeMode="contain" style={styles.sectionIcon} />
                  <Text style={styles.sectionLabel}>
                    {tr(language, { en: 'Pick a Magic Tool', gu: 'જાદુઈ સાધન પસંદ કરો', hi: 'जादुई साधन चुनें' })}
                  </Text>
                </View>
                <View style={styles.toolRow}>
                  {tools.map((t) => {
                    const name = tr(language, { en: t.nameEn, gu: t.nameGu, hi: t.nameHi });
                    return (
                      <ChoiceCard
                        key={t.id}
                        image={t.image}
                        label={name}
                        tone="sky"
                        imageSize={72}
                        width="31%"
                        selected={toolId === t.id}
                        onPress={() => pickTool(t.id, name)}
                      />
                    );
                  })}
                </View>
              </View>
            ) : null}
          </ScrollView>

          {/* Footer: big Back (closes on step 1) + Next / giant launch */}
          <View style={styles.footer}>
            <ClayButton
              tone="white"
              size="lg"
              sound={false}
              onPress={goBack}
              style={styles.backBtn}
              icon={<Glyph name="back" size={22} color="#334155" strokeWidth={3.4} />}
              title={step === 1 ? tr(language, { en: 'Close', gu: 'બંધ', hi: 'बंद' }) : tr(language, { en: 'Back', gu: 'પાછળ', hi: 'पीछे' })}
              textStyle={styles.backText}
            />
            {step < 3 ? (
              <ClayButton
                tone="sky"
                size="lg"
                sound={false}
                onPress={() => goTo((step + 1) as WizardStep)}
                style={styles.nextBtn}
                title={tr(language, { en: 'Next', gu: 'આગળ', hi: 'आगे' })}
                icon={<Glyph name="next" size={22} color="#FFFFFF" strokeWidth={3.4} />}
              />
            ) : null}
          </View>
          {step === 3 ? (
            <View style={styles.launchArea}>
              <LaunchButton
                label={tr(language, {
                  en: 'CREATE MY MAGIC STORY!',
                  gu: 'મારી જાદુઈ વાર્તા બનાવો!',
                  hi: 'मेरी जादुई कहानी बनाओ!',
                })}
                onPress={launch}
              />
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#FDFBF7',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  shell: {
    width: '100%',
    maxWidth: 600,
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0 24px 60px rgba(120,72,32,0.16), 0 6px 16px rgba(15,23,42,0.06)' } as any,
      default: { shadowColor: '#784820', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.16, shadowRadius: 24, elevation: 14 },
    }),
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerArt: {
    width: 56,
    height: 56,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 30,
  },
  speakerBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#EDE9FE',
    borderBottomWidth: 5,
    borderBottomColor: '#C4B5FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tracker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  trackerLine: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  trackerLineOn: {
    backgroundColor: '#FDE68A',
  },
  trackerStar: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackerStarImg: {
    width: 34,
    height: 34,
  },
  trackerStarOff: {
    opacity: 0.3,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 16,
    paddingBottom: 24,
  },
  stepWrap: {
    alignItems: 'center',
    gap: 16,
  },
  heroBubble: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#FEF3C7',
    borderWidth: 3,
    borderColor: '#FDE68A',
    borderBottomWidth: 8,
    borderBottomColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroImg: {
    width: 150,
    height: 150,
  },
  heroName: {
    fontSize: 30,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
  },
  heroGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
  },
  customCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderBottomWidth: 5,
    borderBottomColor: '#CBD5E1',
    padding: 16,
    gap: 12,
    marginTop: 4,
    ...Platform.select({
      web: { boxShadow: '0 4px 12px rgba(15,23,42,0.06)', cursor: 'pointer' } as any,
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 2,
      },
    }),
  },
  customCardActive: {
    backgroundColor: '#FFFDF5',
    borderColor: '#F59E0B',
    borderWidth: 2.5,
    borderBottomWidth: 6,
    borderBottomColor: '#D97706',
  },
  customHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  customIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customIconBadgeActive: {
    backgroundColor: '#FEF3C7',
  },
  customHeaderTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '900',
    color: '#334155',
  },
  customHeaderTitleActive: {
    color: '#78350F',
  },
  customActiveCheck: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    gap: 8,
  },
  customInputRowActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FCD34D',
  },
  customInputRowFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F59E0B',
    borderWidth: 2,
  },
  customTextInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    padding: 0,
    minHeight: 38,
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexWrap: 'wrap',
    gap: 8,
  },
  avatarPickerLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
  },
  avatarChoices: {
    flexDirection: 'row',
    gap: 8,
  },
  avatarChoicePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  avatarChoicePillActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  avatarChoiceThumb: {
    width: 22,
    height: 22,
  },
  avatarChoiceText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#475569',
  },
  avatarChoiceTextActive: {
    color: '#92400E',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  questList: {
    width: '100%',
    gap: 14,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  sectionIcon: {
    width: 32,
    height: 32,
  },
  sectionLabel: {
    fontSize: 19,
    fontWeight: '900',
    color: '#1E293B',
  },
  toolRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderBottomWidth: 5,
    borderBottomColor: '#CBD5E1',
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0 4px 12px rgba(15,23,42,0.06)' } as any,
      default: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
    }),
  },
  cardTile: {
    minHeight: 150,
    minWidth: 100,
    paddingVertical: 14,
    paddingHorizontal: 8,
    gap: 8,
  },
  cardWide: {
    flexDirection: 'row',
    minHeight: 120,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 16,
    justifyContent: 'flex-start',
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 20,
  },
  cardLabelWide: {
    flex: 1,
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'left',
  },
  glowRing: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 32,
    borderWidth: 4,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopWidth: 2,
    borderTopColor: '#F1EDE4',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    flex: 1,
  },
  backText: {
    color: '#334155',
  },
  nextBtn: {
    flex: 1.6,
  },
  launchArea: {
    paddingHorizontal: 16,
    paddingBottom: 18,
    backgroundColor: '#FFFFFF',
  },
  launchWrap: {
    width: '100%',
  },
  launchOuter: {
    height: 68 + 7,
    width: '100%',
  },
  launchLip: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 7,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E11D48',
  },
  launchFace: {
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F43F5E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    gap: 10,
  },
  launchIcon: {
    width: 40,
    height: 40,
  },
  launchText: {
    flexShrink: 1,
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
});
