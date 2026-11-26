import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { colors } from '../theme/colors';
import { spacing, radii, shadows } from '../theme/spacing';
import { useApp } from '../context/AppContext';
import { soundEffects } from '../services/soundEffects';
import type { TimerHandle } from '../utils/runtime';

const MASCOT_MESSAGES_GU = [
  'ખૂબ સરસ દોસ્ત! તું બહુ હોશિયાર છે! 🌟',
  'શાબાશ! આગળ વધો અને નવા સ્ટાર્સ જીતો! 🚀',
  'ભૂલ પડે તો ચિંતા નહીં, ફરીથી પ્રયત્ન કરીએ! 💪',
  'આજે કંઈક નવું શીખવાની મજા આવી ને? 🎉',
  'રોજ ઘડિયા અને કક્કો બોલવાથી યાદ શક્તિ વધે છે! 🧠',
];

const MASCOT_MESSAGES_HI = [
  'बहुत बढ़िया दोस्त! तुम बहुत होशियार हो! 🌟',
  'शाबाश! आगे बढ़ो और नए सितारे जीतो! 🚀',
  'गलती हो तो कोई बात नहीं, फिर से कोशिश करते हैं! 💪',
  'आज कुछ नया सीखने में मज़ा आया ना? 🎉',
  'रोज़ पहाड़े और वर्णमाला बोलने से याददाश्त बढ़ती है! 🧠',
];

const MASCOT_MESSAGES_EN = [
  'Awesome job! You are super smart! 🌟',
  'Keep going to win more shining stars! 🚀',
  'Mistakes help us learn! Try again! 💪',
  'Learning something new is so much fun! 🎉',
  'Practicing every day makes you a champion! 🧠',
];

export const MascotGuide: React.FC = () => {
  const { language, speak } = useApp();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const [bubbleText, setBubbleText] = useState<string | null>(null);
  const [character, setCharacter] = useState<'🐵' | '🦁' | '🐰'>('🐵');
  const timerRef = useRef<TimerHandle | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleTap = () => {
    soundEffects.playBubblePop();
    const messages =
      language === 'hi'
        ? MASCOT_MESSAGES_HI
        : language === 'en'
        ? MASCOT_MESSAGES_EN
        : MASCOT_MESSAGES_GU;
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    setBubbleText(randomMsg);
    speak(randomMsg, language);

    // Cycle mascot
    setCharacter((prev) => (prev === '🐵' ? '🦁' : prev === '🦁' ? '🐰' : '🐵'));

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setBubbleText(null);
    }, 4500);
  };

  return (
    <View style={[styles.container, isCompact && styles.containerCompact]} pointerEvents="box-none">
      {bubbleText && (
        <View style={[styles.speechBubble, isCompact && styles.speechBubbleCompact, shadows.card]}>
          <Text style={[styles.bubbleText, isCompact && styles.bubbleTextCompact]}>{bubbleText}</Text>
          <View style={styles.bubbleArrow} />
        </View>
      )}

      <TouchableOpacity
        style={[styles.mascotButton, isCompact && styles.mascotButtonCompact, shadows.card]}
        onPress={handleTap}
        activeOpacity={0.8}
      >
        <Text style={[styles.mascotEmoji, isCompact && styles.mascotEmojiCompact]}>{character}</Text>
        <View style={[styles.sparkleBadge, isCompact && styles.sparkleBadgeCompact]}>
          <Text style={styles.sparkleText}>✨</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 96,
    right: 14,
    zIndex: 899,
    alignItems: 'flex-end',
  },
  containerCompact: {
    bottom: 84,
    right: 10,
  },
  speechBubble: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.card,
    borderWidth: 2,
    borderColor: colors.accent,
    marginBottom: spacing.xs,
    maxWidth: 220,
  },
  speechBubbleCompact: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: 180,
  },
  bubbleText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 18,
  },
  bubbleTextCompact: {
    fontSize: 11,
    lineHeight: 15,
  },
  bubbleArrow: {
    position: 'absolute',
    bottom: -8,
    right: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.accent,
  },
  mascotButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.yellow,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotButtonCompact: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
  },
  mascotEmoji: {
    fontSize: 30,
  },
  mascotEmojiCompact: {
    fontSize: 24,
  },
  sparkleBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#FFFFFF',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleBadgeCompact: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    top: -2,
    right: -2,
  },
  sparkleText: {
    fontSize: 10,
  },
});
