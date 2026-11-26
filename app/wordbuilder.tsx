import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { colors } from '../src/theme/colors';
import { spacing, radii, shadows } from '../src/theme/spacing';
import { Header } from '../src/components/Header';
import { useApp } from '../src/context/AppContext';
import { soundEffects } from '../src/services/soundEffects';
import { audioService } from '../src/services/audioService';
import { CoinLabel } from '../src/components/common/GoldCoinIcon';
import { AppGlobalBackground } from '../src/components/common/AppGlobalBackground';
import type { TimerHandle } from '../src/utils/runtime';

interface WordPuzzle {
  id: string;
  word: string;
  displayTitle: string;
  icon: string;
  letters: string[];
  spokenWord: string;
}

const PUZZLES_EN: WordPuzzle[] = [
  { id: 'en-cat', word: 'CAT', displayTitle: 'Cat (🐱)', icon: '🐱', letters: ['C', 'A', 'T'], spokenWord: 'Cat' },
  { id: 'en-dog', word: 'DOG', displayTitle: 'Dog (🐶)', icon: '🐶', letters: ['D', 'O', 'G'], spokenWord: 'Dog' },
  { id: 'en-sun', word: 'SUN', displayTitle: 'Sun (☀️)', icon: '☀️', letters: ['S', 'U', 'N'], spokenWord: 'Sun' },
  { id: 'en-car', word: 'CAR', displayTitle: 'Car (🚗)', icon: '🚗', letters: ['C', 'A', 'R'], spokenWord: 'Car' },
  { id: 'en-fish', word: 'FISH', displayTitle: 'Fish (🐟)', icon: '🐟', letters: ['F', 'I', 'S', 'H'], spokenWord: 'Fish' },
  { id: 'en-star', word: 'STAR', displayTitle: 'Star (⭐)', icon: '⭐', letters: ['S', 'T', 'A', 'R'], spokenWord: 'Star' },
  { id: 'en-ball', word: 'BALL', displayTitle: 'Ball (⚽)', icon: '⚽', letters: ['B', 'A', 'L', 'L'], spokenWord: 'Ball' },
  { id: 'en-bird', word: 'BIRD', displayTitle: 'Bird (🐦)', icon: '🐦', letters: ['B', 'I', 'R', 'D'], spokenWord: 'Bird' },
  { id: 'en-tree', word: 'TREE', displayTitle: 'Tree (🌳)', icon: '🌳', letters: ['T', 'R', 'E', 'E'], spokenWord: 'Tree' },
  { id: 'en-book', word: 'BOOK', displayTitle: 'Book (📖)', icon: '📖', letters: ['B', 'O', 'O', 'K'], spokenWord: 'Book' },
  { id: 'en-lion', word: 'LION', displayTitle: 'Lion (🦁)', icon: '🦁', letters: ['L', 'I', 'O', 'N'], spokenWord: 'Lion' },
  { id: 'en-apple', word: 'APPLE', displayTitle: 'Apple (🍎)', icon: '🍎', letters: ['A', 'P', 'P', 'L', 'E'], spokenWord: 'Apple' },
];

const PUZZLES_GU: WordPuzzle[] = [
  { id: 'gu-kamal', word: 'કમળ', displayTitle: 'કમળ', icon: '🌸', letters: ['ક', 'મ', 'ળ'], spokenWord: 'કમળ' },
  { id: 'gu-ghar', word: 'ઘર', displayTitle: 'ઘર', icon: '🏠', letters: ['ઘ', 'ર'], spokenWord: 'ઘર' },
  { id: 'gu-magar', word: 'મગર', displayTitle: 'મગર', icon: '🐊', letters: ['મ', 'ગ', 'ર'], spokenWord: 'મગર' },
  { id: 'gu-vad', word: 'વડ', displayTitle: 'વડનું ઝાડ', icon: '🌳', letters: ['વ', 'ડ'], spokenWord: 'વડ' },
  { id: 'gu-bas', word: 'બસ', displayTitle: 'સ્કૂલ બસ', icon: '🚌', letters: ['બ', 'સ'], spokenWord: 'બસ' },
  { id: 'gu-fal', word: 'ફળ', displayTitle: 'તાજા ફળ', icon: '🍎', letters: ['ફ', 'ળ'], spokenWord: 'ફળ' },
  { id: 'gu-batak', word: 'બતક', displayTitle: 'બતક', icon: '🦆', letters: ['બ', 'ત', 'ક'], spokenWord: 'બતક' },
  { id: 'gu-kalam', word: 'કલમ', displayTitle: 'કલમ', icon: '✏️', letters: ['ક', 'લ', 'મ'], spokenWord: 'કલમ' },
  { id: 'gu-taro', word: 'તારો', displayTitle: 'તારો', icon: '⭐', letters: ['તા', 'રો'], spokenWord: 'તારો' },
  { id: 'gu-hathi', word: 'હાથી', displayTitle: 'હાથી', icon: '🐘', letters: ['હા', 'થી'], spokenWord: 'હાથી' },
];

const PUZZLES_HI: WordPuzzle[] = [
  { id: 'hi-kamal', word: 'कमल', displayTitle: 'कमल', icon: '🌸', letters: ['क', 'म', 'ल'], spokenWord: 'कमल' },
  { id: 'hi-ghar', word: 'घर', displayTitle: 'घर', icon: '🏠', letters: ['घ', 'र'], spokenWord: 'घर' },
  { id: 'hi-magar', word: 'मगर', displayTitle: 'मगर', icon: '🐊', letters: ['म', 'ग', 'र'], spokenWord: 'मगर' },
  { id: 'hi-bas', word: 'बस', displayTitle: 'बस', icon: '🚌', letters: ['ब', 'स'], spokenWord: 'बस' },
  { id: 'hi-fal', word: 'फल', displayTitle: 'फल', icon: '🍎', letters: ['फ', 'ल'], spokenWord: 'फल' },
  { id: 'hi-nal', word: 'नल', displayTitle: 'नल', icon: '🚰', letters: ['न', 'ल'], spokenWord: 'नल' },
  { id: 'hi-tara', word: 'तारा', displayTitle: 'तारा', icon: '⭐', letters: ['ता', 'रा'], spokenWord: 'तारा' },
  { id: 'hi-sher', word: 'शेर', displayTitle: 'शेर', icon: '🦁', letters: ['शे', 'र'], spokenWord: 'शेर' },
  { id: 'hi-hathi', word: 'हाथी', displayTitle: 'हाथी', icon: '🐘', letters: ['हा', 'थी'], spokenWord: 'हाथी' },
];

const PUZZLES_BY_LANG: Record<string, WordPuzzle[]> = {
  en: PUZZLES_EN,
  gu: PUZZLES_GU,
  hi: PUZZLES_HI,
};

const UI_TEXT = {
  en: {
    headerTitle: 'Word Builder',
    subtitle: 'Tap letters in correct order to build the word!',
    scrambleLabel: 'Select letters (Tap in order):',
    reset: 'Reset',
    nextWord: 'Next Word ▶️ +10',
    successMsg: (w: string) => `Awesome! ${w}! You spelled it right!`,
    errorMsg: "Oops! Letters are not in the right order, try again!",
  },
  gu: {
    headerTitle: 'વર્ડ બિલ્ડર',
    subtitle: 'અક્ષરો જોડીને સાચો શબ્દ બનાવો!',
    scrambleLabel: 'અક્ષરો પસંદ કરો:',
    reset: 'ફરીથી ગોઠવો',
    nextWord: 'આગળનો શબ્દ ▶️ +૧૦',
    successMsg: (w: string) => `શાબાશ! ${w}! સાચો શબ્દ બન્યો!`,
    errorMsg: 'અરેરે! અક્ષરોનો ક્રમ ખોટો છે, ફરીથી પ્રયત્ન કરો!',
  },
  hi: {
    headerTitle: 'वर्ड बिल्डर',
    subtitle: 'अक्षरों को जोड़कर सही शब्द बनाएं!',
    scrambleLabel: 'अक्षर चुनें:',
    reset: 'फिर से लगाएं',
    nextWord: 'अगला शब्द ▶️ +१०',
    successMsg: (w: string) => `शाबाश! ${w}! सही शब्द बन गया!`,
    errorMsg: 'अरे! अक्षरों का क्रम गलत है, फिर से कोशिश करें!',
  },
};

export default function WordBuilderScreen() {
  const { speak, addCoins, language } = useApp();

  const activeLang = language || 'en';
  const puzzles = PUZZLES_BY_LANG[activeLang] || PUZZLES_BY_LANG.en;
  const tUI = UI_TEXT[activeLang as keyof typeof UI_TEXT] || UI_TEXT.en;

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentPuzzle = puzzles[currentIndex] || puzzles[0];

  // Scramble letters
  const [availableLetters, setAvailableLetters] = useState<string[]>(() =>
    [...(currentPuzzle?.letters || [])].sort(() => Math.random() - 0.5)
  );
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [awardedPuzzles, setAwardedPuzzles] = useState<Record<string, boolean>>({});
  const resultTimerRef = useRef<TimerHandle | null>(null);

  useEffect(() => {
    return () => {
      if (resultTimerRef.current) {
        clearTimeout(resultTimerRef.current);
      }
      audioService.stop();
      soundEffects.stopAnimalSound();
    };
  }, []);

  // Silence all audio immediately when this screen loses focus or user navigates to another page
  useFocusEffect(
    useCallback(() => {
      return () => {
        if (resultTimerRef.current) {
          clearTimeout(resultTimerRef.current);
        }
        audioService.stop();
        soundEffects.stopAnimalSound();
      };
    }, [])
  );

  // Sync when language changes
  useEffect(() => {
    setCurrentIndex(0);
    const p = puzzles[0];
    if (p) {
      setAvailableLetters([...p.letters].sort(() => Math.random() - 0.5));
      setSelectedLetters([]);
      setIsSuccess(false);
      speak(p.spokenWord, activeLang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const initPuzzle = (index: number) => {
    if (resultTimerRef.current) {
      clearTimeout(resultTimerRef.current);
      resultTimerRef.current = null;
    }
    const p = puzzles[index];
    if (!p) return;
    setCurrentIndex(index);
    setAvailableLetters([...p.letters].sort(() => Math.random() - 0.5));
    setSelectedLetters([]);
    setIsSuccess(false);
    speak(p.spokenWord, activeLang);
  };

  const handleSelectLetter = (letter: string, indexInAvailable: number) => {
    if (resultTimerRef.current) {
      clearTimeout(resultTimerRef.current);
      resultTimerRef.current = null;
    }

    soundEffects.playBubblePop();
    speak(letter, activeLang);

    const nextSelected = [...selectedLetters, letter];
    const nextAvailable = availableLetters.filter((_, idx) => idx !== indexInAvailable);

    setSelectedLetters(nextSelected);
    setAvailableLetters(nextAvailable);

    // Check completion - allow tapped letter audio to speak fully before feedback message!
    if (nextSelected.length === currentPuzzle.letters.length) {
      const builtWord = nextSelected.join('');
      resultTimerRef.current = setTimeout(() => {
        if (builtWord === currentPuzzle.word) {
          soundEffects.playTadaaa();
          setIsSuccess(true);
          speak(tUI.successMsg(currentPuzzle.word), activeLang);
          if (!awardedPuzzles[currentPuzzle.id]) {
            addCoins(10);
            setAwardedPuzzles((prev) => ({ ...prev, [currentPuzzle.id]: true }));
          }
        } else {
          soundEffects.playBuzzer();
          speak(tUI.errorMsg, activeLang);
        }
      }, 750);
    }
  };

  const handleRemoveLetter = (indexInSelected: number) => {
    if (resultTimerRef.current) {
      clearTimeout(resultTimerRef.current);
      resultTimerRef.current = null;
    }
    soundEffects.playBubblePop();
    const removed = selectedLetters[indexInSelected];
    setSelectedLetters(selectedLetters.filter((_, idx) => idx !== indexInSelected));
    setAvailableLetters([...availableLetters, removed]);
    setIsSuccess(false);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % puzzles.length;
    initPuzzle(nextIdx);
  };

  const handleReset = () => {
    initPuzzle(currentIndex);
  };

  if (!currentPuzzle) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppGlobalBackground id="wordbuilderBgGrad" />
      <Header title={tUI.headerTitle} showBack={true} backHref="/games" />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
        {/* Puzzle Picture Card */}
        <View style={[styles.pictureCard, shadows.card]}>
          <Text style={styles.pictureEmoji}>{currentPuzzle.icon}</Text>
          <Text style={styles.pictureTitle}>{currentPuzzle.displayTitle}</Text>
          <Text style={styles.pictureSubtitle}>{tUI.subtitle}</Text>
        </View>

        {/* Word Answer Slots */}
        <View style={styles.slotsRow}>
          {currentPuzzle.letters.map((_, idx) => {
            const letter = selectedLetters[idx];

            return (
              <TouchableOpacity
                key={`slot-${idx}`}
                style={[
                  styles.slotBox,
                  letter && styles.slotBoxFilled,
                  isSuccess && styles.slotBoxSuccess,
                  shadows.soft,
                ]}
                onPress={() => letter && handleRemoveLetter(idx)}
                activeOpacity={0.8}
              >
                <Text style={styles.slotLetter}>{letter || '_'}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Scrambled Available Letters */}
        <Text style={styles.scrambleLabel}>{tUI.scrambleLabel}</Text>
        <View style={styles.lettersRow}>
          {availableLetters.map((char, lIdx) => (
            <TouchableOpacity
              key={`letter-${lIdx}-${char}`}
              style={[styles.letterTile, shadows.soft]}
              onPress={() => handleSelectLetter(char, lIdx)}
              activeOpacity={0.7}
            >
              <Text style={styles.letterTileText}>{char}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Text style={styles.resetBtnText}>{tUI.reset}</Text>
          </TouchableOpacity>

          {isSuccess && (
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
              <CoinLabel align="center" size={20} iconAfter textStyle={styles.nextBtnText}>{tUI.nextWord}</CoinLabel>
            </TouchableOpacity>
          )}
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
    padding: spacing.lg,
    paddingBottom: spacing.xxxl * 2,
    alignItems: 'center',
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  pictureCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: radii.card + 4,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EAEDED',
    marginBottom: spacing.xl,
  },
  pictureEmoji: {
    fontSize: 72,
    marginBottom: spacing.sm,
  },
  pictureTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  pictureSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  slotsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xxl,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  slotBox: {
    width: 58,
    height: 58,
    borderRadius: radii.card,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#BDC3C7',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotBoxFilled: {
    borderStyle: 'solid',
    borderColor: colors.accent,
    backgroundColor: '#E8F8F5',
  },
  slotBoxSuccess: {
    borderColor: '#27AE60',
    backgroundColor: '#D4EFDF',
  },
  slotLetter: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  scrambleLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  lettersRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  letterTile: {
    width: 60,
    height: 60,
    borderRadius: radii.card,
    backgroundColor: '#FEF9E7',
    borderWidth: 2,
    borderColor: '#F9E79F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterTileText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#7D6608',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  resetBtn: {
    backgroundColor: '#EBEDEF',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.full,
  },
  resetBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  nextBtn: {
    backgroundColor: '#10B981',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.full,
  },
  nextBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
