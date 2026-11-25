import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  BackHandler,
  Modal,
} from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle } from 'react-native-svg';
import { screenWellnessService } from '../services/screenWellnessService';
import { soundEffects } from '../services/soundEffects';
import { audioService } from '../services/audioService';
import { useApp } from '../context/AppContext';
import { KidModal, ParentGateModal, Glyph } from './fun';
import { ClayButton } from './clay/ClayButton';
import { kidTones, kidPalette } from '../theme/kidTheme';
import { formatNumberDigits } from '../utils/languageData';
import { AppLanguage } from '../types';
import * as Art from './art3d/Art3D';

/** Stretch-step emoji ids -> 3D vector art. */
const STEP_ART: Record<string, React.FC<{ size?: number }>> = {
  '👀': Art.MagnifierArt,
  '😌': Art.HeartArt,
  '🙆': Art.SneakerArt,
};

type Tri = { gu: string; hi: string; en: string };
const tr = (lang: AppLanguage, s: Tri) => (lang === 'gu' ? s.gu : lang === 'hi' ? s.hi : s.en);

/** Gentle stretch / eye-care steps shown during the break. */
const STRETCHES: { emoji: string; text: Tri }[] = [
  { emoji: '👀', text: { gu: 'દૂર કોઈ વસ્તુ જુઓ', hi: 'दूर किसी चीज़ को देखें', en: 'Look at something far away' } },
  { emoji: '😌', text: { gu: '૧૦ વાર આંખો પટપટાવો', hi: '१० बार पलकें झपकाएं', en: 'Blink slowly 10 times' } },
  { emoji: '🙆', text: { gu: 'હાથ ઊંચા કરી ખેંચો', hi: 'हाथ ऊपर करके खिंचाव करें', en: 'Reach up high and stretch' } },
];

export const ScreenWellnessOverlay: React.FC = () => {
  const { language } = useApp();
  const lang = (language || 'en') as AppLanguage;
  const [showEyeBreak, setShowEyeBreak] = useState(false);
  const [showDailyLimit, setShowDailyLimit] = useState(false);
  const [isBedtimeLocked, setIsBedtimeLocked] = useState(false);
  const [showParentGate, setShowParentGate] = useState(false);
  const [limitMinutes, setLimitMinutes] = useState(30);

  useEffect(() => {
    const unsubscribe = screenWellnessService.subscribe({
      onEyeCareDue: () => {
        soundEffects.playBubblePop();
        audioService.stop();
        soundEffects.stopBgm();
        setShowEyeBreak(true);
      },
      onDailyLimitReached: (_used, limit) => {
        soundEffects.playLevelUp();
        audioService.stop();
        soundEffects.stopAnimalSound();
        soundEffects.stopBgm();
        setLimitMinutes(limit);
        setShowDailyLimit(true);
      },
      onDailyLimitUnlocked: () => {
        setShowDailyLimit(false);
        setIsBedtimeLocked(false);
        setShowParentGate(false);
      },
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Trap Android hardware back button so the child cannot escape the screen time limit
  useEffect(() => {
    if (!showDailyLimit && !isBedtimeLocked) return;

    const onBackPress = () => {
      if (Platform.OS === 'android') {
        BackHandler.exitApp();
        return true;
      }
      return true;
    };

    const backSub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => {
      backSub.remove();
    };
  }, [showDailyLimit, isBedtimeLocked]);

  const handleDismissEyeBreak = () => {
    screenWellnessService.acknowledgeEyeBreak();
    setShowEyeBreak(false);
  };

  /**
   * Child taps "Okay, bye for now!":
   * Cleanly ends the session without granting free snooze time.
   * On Android, exits the app. On Web/iOS or return, displays the calm locked Bedtime Screen.
   */
  const handleDismissDailyLimit = () => {
    soundEffects.playBubblePop();
    soundEffects.stopAnimalSound();
    soundEffects.stopBgm();
    screenWellnessService.dismissDailyLimit();
    setShowDailyLimit(false);
    setIsBedtimeLocked(true);

    if (Platform.OS === 'android') {
      try {
        BackHandler.exitApp();
      } catch { }
    }
  };

  /**
   * Parent successfully solves the Math Gate:
   * Grants 15 additional active minutes, unlocks the app, and celebrates.
   */
  const handleParentApproved = () => {
    soundEffects.playTadaaa();
    screenWellnessService.snoozeDailyLimit(15);
    setShowParentGate(false);
    setShowDailyLimit(false);
    setIsBedtimeLocked(false);
  };

  return (
    <>
      {/* 1. Eye-care break: sleepy owl, calming lavender */}
      <KidModal
        visible={showEyeBreak}
        emblem="🦉"
        tone="lavender"
        title={tr(lang, { gu: 'આંખોને આરામ આપીએ!', hi: 'आँखों को आराम दें!', en: 'Rest Time for Your Eyes!' })}
        subtitle={tr(lang, {
          gu: 'તમે ૨૦ મિનિટથી સરસ શીખી રહ્યા છો. ચાલો થોડો આરામ કરીએ:',
          hi: 'आप २० मिनट से बढ़िया सीख रहे हैं। चलो थोड़ा आराम करें:',
          en: "You've been learning for 20 minutes. Let's take a tiny break:",
        })}
        sparkles
      >
        <View style={styles.ruleChip}>
          <Text style={styles.ruleChipText}>{tr(lang, { gu: '૨૦-૨૦-૨૦ નિયમ', hi: '२०-२०-२० नियम', en: 'The 20-20-20 rule' })}</Text>
        </View>
        <View style={styles.steps}>
          {STRETCHES.map((s, i) => (
            <View key={i} style={[styles.step, { backgroundColor: i % 2 === 0 ? kidTones.lavender.tint : kidTones.sky.tint }]}>
              <View style={styles.stepEmoji}>{React.createElement(STEP_ART[s.emoji] ?? Art.StarArt, { size: 36 })}</View>
              <Text style={styles.stepText}>{tr(lang, s.text)}</Text>
            </View>
          ))}
        </View>
        <ClayButton
          tone="lavender"
          size="lg"
          style={styles.fullBtn}
          onPress={handleDismissEyeBreak}
          icon={<Glyph name="check" size={22} />}
          title={tr(lang, { gu: 'મેં આરામ કરી લીધો!', hi: 'मैंने आराम कर लिया!', en: "I'm refreshed!" })}
        />
      </KidModal>

      {/* 2. Daily limit reached initial alert: sleeping bear, calm sky */}
      <KidModal
        visible={showDailyLimit && !showParentGate && !isBedtimeLocked}
        emblem="🐻"
        tone="sky"
        title={tr(lang, { gu: 'આજનો સમય પૂરો!', hi: 'आज का समय पूरा!', en: "That's All for Today!" })}
        subtitle={tr(lang, {
          gu: 'શાબાશ! હવે બહાર રમો, ચિત્ર દોરો અથવા પુસ્તક વાંચો. કાલે ફરી મળીશું!',
          hi: 'शाबाश! अब बाहर खेलें, चित्र बनाएं या किताब पढ़ें। कल फिर मिलेंगे!',
          en: 'Amazing learning! Now go play outside, draw, or read a book. See you tomorrow!',
        })}
      >
        <View style={styles.limitChip}>
          <Text style={styles.limitChipText}>
            {tr(lang, { gu: 'મર્યાદા', hi: 'सीमा', en: 'Limit' })}: {formatNumberDigits(limitMinutes, lang)}{' '}
            {tr(lang, { gu: 'મિનિટ', hi: 'मिनट', en: 'min' })}
          </Text>
        </View>
        <ClayButton
          tone="sky"
          size="lg"
          style={styles.fullBtn}
          onPress={handleDismissDailyLimit}
          title={tr(lang, { gu: 'ઠીક છે, આવજો!', hi: 'ठीक है, फिर मिलेंगे!', en: 'Okay, bye for now!' })}
        />
        <ClayButton
          tone="white"
          size="sm"
          style={styles.fullBtn}
          onPress={() => setShowParentGate(true)}
          icon={<Glyph name="lock" size={18} color={kidPalette.inkSoft} />}
          title={tr(lang, { gu: 'વાલી: +૧૫ મિનિટ', hi: 'अभिभावक: +१५ मिनट', en: 'Grown-up: +15 min' })}
          textStyle={{ color: kidPalette.inkSoft }}
        />
      </KidModal>

      {/* 3. Bedtime Rest Screen (Full-Screen locked overlay when child taps "Bye for now" or reaches daily limit) */}
      <Modal
        visible={isBedtimeLocked && !showParentGate}
        transparent={false}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {
          if (Platform.OS === 'android') {
            BackHandler.exitApp();
          }
        }}
      >
        <View style={styles.bedtimeContainer}>
          {/* Deep Twilight Night Sky Background */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg width="100%" height="100%">
              <Defs>
                <LinearGradient id="nightSkyGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#0B132B" stopOpacity="1" />
                  <Stop offset="50%" stopColor="#1C2541" stopOpacity="1" />
                  <Stop offset="100%" stopColor="#3A506B" stopOpacity="1" />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#nightSkyGrad)" />
              {/* Twinkling ambient stars */}
              <Circle cx="15%" cy="18%" r="3.5" fill="#FEF08A" fillOpacity="0.85" />
              <Circle cx="85%" cy="14%" r="4" fill="#FEF08A" fillOpacity="0.9" />
              <Circle cx="78%" cy="28%" r="2.5" fill="#FFFFFF" fillOpacity="0.75" />
              <Circle cx="22%" cy="42%" r="2" fill="#FFFFFF" fillOpacity="0.6" />
              <Circle cx="90%" cy="56%" r="3" fill="#FEF08A" fillOpacity="0.7" />
              <Circle cx="12%" cy="75%" r="3" fill="#FFFFFF" fillOpacity="0.65" />
              <Circle cx="82%" cy="85%" r="2.5" fill="#FEF08A" fillOpacity="0.8" />
            </Svg>
          </View>

          <View style={styles.bedtimeCard}>
            {/* Sleepy Moon Emblem */}
            <View style={styles.moonWrap}>
              <Art.MoonArt size={68} />
            </View>

            {/* Title */}
            <Text style={styles.bedtimeTitle}>
              {tr(lang, {
                gu: 'કાલે ફરી મળીશું!',
                hi: 'कल फिर मिलेंगे!',
                en: 'See You Tomorrow!',
              })}
            </Text>

            {/* Subtitle */}
            <Text style={styles.bedtimeDesc}>
              {tr(lang, {
                gu: 'આજનો શીખવાનો સમય પૂરો થયો છે! તારલાઓ હવે સૂઈ ગયા છે. હવે બહાર રમો અથવા વાર્તા વાંચો.',
                hi: 'आज का सीखने का समय पूरा हो गया है! तारे अब सो गए हैं। अब बाहर खेलें या कहानी पढ़ें।',
                en: "Today's learning time is finished! The stars have gone to sleep. Time to play outside, draw, or rest.",
              })}
            </Text>

            {/* Stats Chip */}
            <View style={styles.bedtimeStatChip}>
              <Text style={styles.bedtimeStatText}>
                {tr(lang, { gu: 'આજનો સમય', hi: 'आज का समय', en: "Today's Playtime" })}: {formatNumberDigits(limitMinutes, lang)}{' '}
                {tr(lang, { gu: 'મિનિટ પૂર્ણ', hi: 'मिनट पूरे', en: 'min completed' })}
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.bedtimeActions}>
              {Platform.OS === 'android' && (
                <ClayButton
                  tone="sky"
                  size="md"
                  style={styles.fullBtn}
                  onPress={() => {
                    soundEffects.playBubblePop();
                    BackHandler.exitApp();
                  }}
                  title={tr(lang, { gu: 'એપ બંધ કરો', hi: 'ऐप बंद करें', en: 'Close App' })}
                />
              )}

              <ClayButton
                tone="white"
                size="sm"
                style={styles.fullBtn}
                onPress={() => setShowParentGate(true)}
                icon={<Glyph name="lock" size={18} color={kidPalette.inkSoft} />}
                title={tr(lang, { gu: 'વાલી: અનલોક કરો / +૧૫ મિનિટ', hi: 'अभिभावक: अनलॉक / +१५ मिनट', en: 'Grown-up: Unlock / +15 min' })}
                textStyle={{ color: kidPalette.inkSoft }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* 4. Parent Math Gate Verification */}
      <ParentGateModal
        visible={showParentGate}
        language={lang}
        reason={tr(lang, {
          gu: '૧૫ મિનિટ વધુ આપવા માટે આ સવાલનો જવાબ આપો:',
          hi: '१५ मिनट और देने के लिए इस सवाल का जवाब दें:',
          en: 'To give 15 more minutes, solve this:',
        })}
        onSuccess={handleParentApproved}
        onCancel={() => setShowParentGate(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  ruleChip: {
    backgroundColor: kidTones.mint.tint,
    borderColor: kidTones.mint.tintBorder,
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  ruleChipText: {
    fontSize: 13.5,
    fontWeight: '900',
    color: kidTones.mint.text,
  },
  steps: {
    width: '100%',
    gap: 8,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  stepEmoji: {
    width: 36,
    height: 36,
  },
  stepText: {
    flex: 1,
    fontSize: 15.5,
    fontWeight: '800',
    color: kidPalette.ink,
  },
  limitChip: {
    backgroundColor: kidTones.sun.tint,
    borderColor: kidTones.sun.tintBorder,
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  limitChipText: {
    fontSize: 14,
    fontWeight: '900',
    color: kidTones.sun.text,
  },
  fullBtn: {
    width: '100%',
  },
  bedtimeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#0B132B',
  },
  bedtimeCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 28,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderBottomWidth: 6,
    borderBottomColor: '#94A3B8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 12,
  },
  moonWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EFF6FF',
    borderWidth: 3,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -48,
    marginBottom: 16,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  bedtimeTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 10,
  },
  bedtimeDesc: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  bedtimeStatChip: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 24,
  },
  bedtimeStatText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#B45309',
  },
  bedtimeActions: {
    width: '100%',
    gap: 12,
  },
});
