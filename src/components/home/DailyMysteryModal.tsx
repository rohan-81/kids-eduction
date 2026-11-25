import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, Pressable, Animated, Platform, Easing } from 'react-native';
import Svg, { Path, Rect, Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import { AppLanguage } from '../../types';
import { soundEffects } from '../../services/soundEffects';
import { audioService } from '../../services/audioService';
import { getRemainingTimeToMidnight } from '../../services/storageService';
import { ConfettiCelebration } from '../common/ConfettiCelebration';
import { KidModal } from '../fun/KidModal';
import { Glyph } from '../fun/KidIcons';
import { ClayButton } from '../clay/ClayButton';
import { kidTones, kidPalette } from '../../theme/kidTheme';
import { formatNumberDigits, formatMathExpression } from '../../utils/languageData';
import { GoldCoinIcon } from '../common/GoldCoinIcon';
import { REWARD_ART, STORY_PROP_IMAGES, STORY_CHARACTER_IMAGES } from '../../utils/imageHelper';
import { Image } from 'react-native';
import { StarArt } from '../art3d/Art3D';
import { Remote3DImage } from '../common/Remote3DImage';

/** Sticker emoji ids -> bundled 3D renders. */
const STICKER_ART: Record<string, any> = {
  '👑': STORY_PROP_IMAGES['👑'],
  '🚀': STORY_PROP_IMAGES['🚀'],
  '💎': STORY_PROP_IMAGES['💎'],
  '🦁': STORY_CHARACTER_IMAGES['🦁'],
  '🦄': STORY_CHARACTER_IMAGES['🦄'],
};

interface DailyMysteryModalProps {
  visible: boolean;
  language: AppLanguage;
  isClaimedToday?: boolean;
  onClaim: (stars: number, coins: number, stickerId?: string) => void;
  onClose: () => void;
}

const MYSTERY_STICKERS = [
  { id: 'stk-crown', emoji: '👑', en: 'Golden Crown', gu: 'સોનાનો મુગટ', hi: 'सोने का मुकुट' },
  { id: 'stk-rocket', emoji: '🚀', en: 'Space Rocket', gu: 'સ્પેસ રોકેટ', hi: 'अंतरिक्ष रॉकेट' },
  { id: 'stk-lion', emoji: '🦁', en: 'Brave Lion', gu: 'બહાદુર સિંહ', hi: 'बहादुर शेर' },
  { id: 'stk-unicorn', emoji: '🦄', en: 'Magic Unicorn', gu: 'જાદુઈ યુનિકોર્ન', hi: 'जादुई यूनिकॉर्न' },
  { id: 'stk-gem', emoji: '💎', en: 'Sparkle Gem', gu: 'ચમકતો હીરો', hi: 'चमकता हीरा' },
];

const REWARD_STARS = 15;
const REWARD_COINS = 25;
const useNative = Platform.OS !== 'web';
type Tri = { gu: string; hi: string; en: string };
const tr = (lang: AppLanguage, s: Tri) => (lang === 'gu' ? s.gu : lang === 'hi' ? s.hi : s.en);

/** Slowly rotating starburst behind the gift / reward. */
const Starburst: React.FC<{ size: number; color: string }> = ({ size, color }) => {
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 9000, easing: Easing.linear, useNativeDriver: useNative }));
    loop.start();
    return () => loop.stop();
  }, [spin]);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const c = size / 2;
  const rays = Array.from({ length: 12 }, (_, i) => {
    const a1 = (i * 30 - 6) * (Math.PI / 180);
    const a2 = (i * 30 + 6) * (Math.PI / 180);
    return `M${c},${c} L${c + c * Math.cos(a1)},${c + c * Math.sin(a1)} L${c + c * Math.cos(a2)},${c + c * Math.sin(a2)} Z`;
  });
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center, { transform: [{ rotate }] }]}>
      <Svg width={size} height={size}>
        <G opacity={0.55}>
          {rays.map((d, i) => (
            <Path key={i} d={d} fill={color} />
          ))}
        </G>
      </Svg>
    </Animated.View>
  );
};

/** The treasure: a gift box that bounces & wobbles until tapped. */
const GiftBox: React.FC = () => (
  <Svg width={128} height={128} viewBox="0 0 116 116" fill="none">
    <Defs>
      <LinearGradient id="mRibbon" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#FFD166" />
        <Stop offset="100%" stopColor="#FB8500" />
      </LinearGradient>
    </Defs>
    <Rect x="16" y="40" width="84" height="66" rx="14" fill="#8B5CF6" />
    <Rect x="50" y="40" width="16" height="66" fill="url(#mRibbon)" />
    <Rect x="16" y="64" width="84" height="13" fill="url(#mRibbon)" />
    <Rect x="10" y="27" width="96" height="21" rx="9" fill="#8338EC" />
    <Rect x="50" y="27" width="16" height="21" fill="url(#mRibbon)" />
    <Circle cx="45" cy="20" r="11" fill="#FFD166" />
    <Circle cx="71" cy="20" r="11" fill="#FFD166" />
    <Circle cx="58" cy="23" r="7" fill="#FB8500" />
    <Circle cx="30" cy="55" r="3.5" fill="#FFFFFF" fillOpacity="0.75" />
    <Circle cx="86" cy="90" r="3" fill="#FFFFFF" fillOpacity="0.75" />
    <Path d="M84 50 L86 55 L91 56 L86 58 L84 63 L82 58 L77 56 L82 55 Z" fill="#FFFFFF" fillOpacity="0.8" />
  </Svg>
);

/** One popped reward token (stars / coins / sticker). */
const RewardToken: React.FC<{
  emoji?: string;
  icon?: React.ReactNode;
  value: string;
  label: string;
  toneKey: 'sun' | 'lavender' | 'coral';
  delay: number;
  show: boolean;
}> = ({
  emoji,
  icon,
  value,
  label,
  toneKey,
  delay,
  show,
}) => {
  const pop = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!show) {
      pop.setValue(0);
      return;
    }
    Animated.spring(pop, { toValue: 1, delay, friction: 4, tension: 110, useNativeDriver: useNative }).start();
  }, [show, delay, pop]);
  const spec = kidTones[toneKey];
  const scale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });
  return (
    <Animated.View
      style={[styles.token, { backgroundColor: spec.tint, borderColor: spec.tintBorder, borderBottomColor: spec.fill, opacity: pop, transform: [{ scale }] }]}
    >
      {icon ? (
        <View style={{ height: 36, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
      ) : (
        <Text style={styles.tokenEmoji}>{emoji}</Text>
      )}
      <Text style={[styles.tokenValue, { color: spec.text }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.tokenLabel} numberOfLines={1}>
        {label}
      </Text>
    </Animated.View>
  );
};

export const DailyMysteryModal: React.FC<DailyMysteryModalProps> = ({ visible, language, isClaimedToday = false, onClaim, onClose }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [sticker] = useState(() => MYSTERY_STICKERS[Math.floor(Math.random() * MYSTERY_STICKERS.length)]);
  const [countdown, setCountdown] = useState<string>(() => getRemainingTimeToMidnight());

  const bounce = useRef(new Animated.Value(0)).current;
  const burst = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setInterval(() => setCountdown(getRemainingTimeToMidnight()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!visible) {
      setIsOpen(false);
      setShowConfetti(false);
      burst.setValue(0);
      audioService.stop();
      return;
    }
    if (isClaimedToday && !isOpen) {
      audioService.speak(
        tr(language, {
          gu: 'આજનું સરપ્રાઈઝ ઇનામ મેળવી લીધું છે! કાલ ફરીથી નવું બોક્સ ખોલવા આવજો!',
          hi: 'आज का सरप्राइज़ उपहार प्राप्त हो चुका है! कल फिर नया बॉक्स खोलने आएं!',
          en: 'You already collected today’s mystery reward! Come back tomorrow for a new surprise!',
        }),
        language
      );
      return;
    }
    // Bouncing treasure wiggle while waiting to be tapped
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: 1, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: useNative }),
        Animated.timing(bounce, { toValue: 0, duration: 300, easing: Easing.in(Easing.quad), useNativeDriver: useNative }),
        Animated.timing(bounce, { toValue: 0.6, duration: 220, useNativeDriver: useNative }),
        Animated.timing(bounce, { toValue: 0, duration: 220, useNativeDriver: useNative }),
        Animated.delay(900),
      ])
    );
    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleOpenBox = () => {
    if (isOpen || isClaimedToday) return;
    setIsOpen(true);
    // Claim immediately so the reward is never lost if the popup is closed with ✕
    onClaim(15, 25, sticker.id);
    soundEffects.playLevelUp(); // joyful chime
    setShowConfetti(true);

    burst.setValue(0);
    Animated.spring(burst, { toValue: 1, friction: 5, tension: 80, useNativeDriver: useNative }).start();
    audioService.speak(
      tr(language, {
        gu: 'અરે વાહ! તમને મળ્યા ૧૫ તારા અને ૨૫ ગોલ્ડ સિક્કા!',
        hi: 'अरे वाह! आपको मिले १५ सितारे और २५ सोने के सिक्के!',
        en: 'Hooray! You won 15 Stars and 25 Gold Coins!',
      }),
      language
    );
  };

  const openStickerBook = () => {
    onClose();
    router.push('/stickers' as any);
  };

  const stickerName = tr(language, { gu: sticker.gu, hi: sticker.hi, en: sticker.en });
  const showRewardView = isOpen; // checked before isClaimedToday, which flips true once we claim
  const showClaimedView = !isOpen && isClaimedToday;

  const boxY = bounce.interpolate({ inputRange: [0, 1], outputRange: [0, -16] });
  const boxRotate = bounce.interpolate({ inputRange: [0, 0.6, 1], outputRange: ['0deg', '-6deg', '6deg'] });
  const boxScale = bounce.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });
  const heroScale = burst.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });

  return (
    <KidModal
      visible={visible}
      onClose={onClose}
      emblemImage={REWARD_ART.gift}
      tone="lavender"
      sparkles
      title={
        showClaimedView
          ? tr(language, { gu: 'આજનું ઇનામ મળી ગયું!', hi: 'आज का उपहार मिल चुका!', en: 'Already Claimed Today!' })
          : showRewardView
            ? tr(language, { gu: 'ખૂબ ખૂબ અભિનંદન!', hi: 'बहुत बहुत बधाई!', en: 'Congratulations!' })
            : tr(language, { gu: 'દૈનિક જાદુઈ બોક્સ!', hi: 'दैनिक जादुई बॉक्स!', en: 'Daily Mystery Box!' })
      }
      subtitle={
        showClaimedView
          ? tr(language, {
            gu: 'આવતીકાલે નવા સરપ્રાઈઝ માટે આવો!',
            hi: 'कल नए सरप्राइज़ के लिए आएं!',
            en: 'Come back tomorrow for a new surprise!',
          })
          : showRewardView
            ? tr(language, { gu: 'તમારું આજનું જાદુઈ ઇનામ!', hi: 'आपका आज का जादुई पुरस्कार!', en: 'Your magic gift is unlocked!' })
            : tr(language, { gu: 'ખોલવા માટે બોક્સ પર ટૅપ કરો!', hi: 'खोलने के लिए बॉक्स पर टैप करें!', en: 'Tap the treasure to open it!' })
      }
    >
      <ConfettiCelebration visible={showConfetti} language={language} speakPraise={false} />

      {showClaimedView ? (
        <View style={styles.stage}>
          <Svg width={96} height={96} viewBox="0 0 80 80" fill="none">
            <Circle cx="40" cy="40" r="36" fill={kidTones.mint.tint} />
            <Circle cx="40" cy="40" r="28" fill={kidTones.mint.fill} />
            <Path d="M28 40L36 48L52 32" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <View style={styles.countdownPill}>
            <Text style={styles.countdownText}>
              {tr(language, { gu: 'નવું બોક્સ', hi: 'नया बॉक्स', en: 'Next box in' })}: {formatMathExpression(countdown, language)}
            </Text>
          </View>
        </View>
      ) : !showRewardView ? (
        <Pressable
          onPress={handleOpenBox}
          accessibilityRole="button"
          accessibilityLabel="Open mystery box"
          style={[styles.stage, Platform.OS === 'web' && ({ cursor: 'pointer' } as any)]}
        >
          <Starburst size={210} color="#FFD166" />
          <Animated.View style={{ transform: [{ translateY: boxY }, { rotate: boxRotate }, { scale: boxScale }] }}>
            <GiftBox />
          </Animated.View>
          <View style={styles.shadowBlob} />
        </Pressable>
      ) : (
        <View style={styles.stage}>
          <Starburst size={210} color="#FFD166" />
          <Animated.View style={[styles.heroSticker, { transform: [{ scale: heroScale }] }]}>
            <Remote3DImage
              source={STICKER_ART[sticker.emoji] ?? REWARD_ART.gift}
              style={{ width: 110, height: 110 }}
              fallback={<Text style={{ fontSize: 72 }}>{sticker.emoji}</Text>}
            />
          </Animated.View>
        </View>
      )}

      {showRewardView ? (
        <View style={styles.tokens}>
          <RewardToken icon={<StarArt size={36} />} value={`+${formatNumberDigits(REWARD_STARS, language)}`} label={tr(language, { gu: 'તારા', hi: 'सितारे', en: 'Stars' })} toneKey="lavender" delay={250} show />
          <RewardToken icon={<GoldCoinIcon size={30} />} value={`+${formatNumberDigits(REWARD_COINS, language)}`} label={tr(language, { gu: 'સિક્કા', hi: 'सिक्के', en: 'Coins' })} toneKey="sun" delay={450} show />
          <RewardToken icon={<Remote3DImage source={STICKER_ART[sticker.emoji] ?? REWARD_ART.gift} style={{ width: 36, height: 36 }} fallback={<Text style={{ fontSize: 24 }}>{sticker.emoji}</Text>} />} value={stickerName} label={tr(language, { gu: 'સ્ટીકર', hi: 'स्टिकर', en: 'Sticker' })} toneKey="coral" delay={650} show />
        </View>
      ) : null}

      {showClaimedView ? (
        <>
          <ClayButton tone="lavender" size="lg" style={styles.fullBtn} title={`${tr(language, { gu: 'સ્ટીકર બુક જુઓ', hi: 'स्टिकर बुक देखें', en: 'My Sticker Book' })}`} onPress={openStickerBook} />
          <ClayButton tone="white" size="sm" style={styles.fullBtn} icon={<Glyph name="check" size={18} color={kidPalette.inkSoft} />} title={tr(language, { gu: 'સમજાઈ ગયું', hi: 'समझ गए', en: 'Got it!' })} textStyle={{ color: kidPalette.inkSoft }} onPress={onClose} />
        </>
      ) : showRewardView ? (
        <>
          <ClayButton tone="mint" size="lg" style={styles.fullBtn} title={`${tr(language, { gu: 'ચાલો રમીએ!', hi: 'चलो खेलें!', en: "Yay! Let's Play!" })}`} textStyle={{ color: kidTones.mint.onFill }} onPress={onClose} />
          <ClayButton tone="white" size="sm" style={styles.fullBtn} title={`${tr(language, { gu: 'સ્ટીકર બુકમાં જુઓ', hi: 'स्टिकर बुक में देखें', en: 'See it in my Sticker Book' })}`} textStyle={{ color: kidPalette.inkSoft }} onPress={openStickerBook} />
        </>
      ) : (
        <ClayButton tone="sun" size="lg" style={styles.fullBtn} title={`${tr(language, { gu: 'બોક્સ ખોલો!', hi: 'बॉक्स खोलें!', en: 'Open My Gift!' })}`} onPress={handleOpenBox} />
      )}
    </KidModal>
  );
};

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stage: {
    width: '100%',
    height: 210,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: kidTones.lavender.tint,
  },
  shadowBlob: {
    position: 'absolute',
    bottom: 22,
    width: 110,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(114, 9, 183, 0.18)',
  },
  heroSticker: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: kidTones.sun.fill,
    borderBottomWidth: 9,
    borderBottomColor: kidTones.sun.edge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStickerEmoji: {
    fontSize: 70,
  },
  tokens: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  token: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderBottomWidth: 6,
  },
  tokenEmoji: {
    fontSize: 30,
  },
  tokenValue: {
    fontSize: 17,
    fontWeight: '900',
    marginTop: 2,
  },
  tokenLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: kidPalette.inkMuted,
  },
  countdownPill: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: kidTones.lavender.tintBorder,
  },
  countdownText: {
    fontSize: 14.5,
    fontWeight: '900',
    color: kidTones.lavender.text,
  },
  fullBtn: {
    width: '100%',
  },
});
