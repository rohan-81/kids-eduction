import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  useWindowDimensions,
  Platform,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/colors';
import { spacing, radii, shadows } from '../../src/theme/spacing';
import { kidRadii, kidPalette, kidTones, clayShadow } from '../../src/theme/kidTheme';
import { useApp } from '../../src/context/AppContext';
import { Header } from '../../src/components/Header';
import { PastelButton } from '../../src/components/PastelButton';
import { AudioSpeakerButton } from '../../src/components/AudioSpeakerButton';
import { GAME_QUESTIONS, PUZZLE_PICTURES } from '../../src/data/gamesData';
import { GameType, GameQuestion, GameOption } from '../../src/types';
import { soundEffects } from '../../src/services/soundEffects';
import { audioService } from '../../src/services/audioService';
import { apiService } from '../../src/services/apiService';
import { ClayButton } from '../../src/components/clay';
import { HeartMeter, StarMeter, CoinBurst, KidModal, Glyph } from '../../src/components/fun';
import { GoldCoinIcon, GoldCoinStack } from '../../src/components/common/GoldCoinIcon';
import { getRoundStars, getNextGameRoute } from '../../src/utils/gameRound';
import { formatNumberDigits } from '../../src/utils/languageData';
import { GAMES_LIST } from './index';
import { kidBackdrops } from '../../src/theme/kidTheme';
import { AppGlobalBackground } from '../../src/components/common/AppGlobalBackground';
import * as Art from '../../src/components/art3d/Art3D';
import { VisualArt, EmojiArt, splitEmojiLabel } from '../../src/components/art3d/ContentArt';
import { resolveOfflineMediaSource } from '../../src/utils/remoteAssets';
import type { TimerHandle } from '../../src/utils/runtime';

const MEMORY_EMOJI_BANK = [
  '🦁', '🐰', '🐢', '🦊', '🐯', '🐬', '🐘', '🦄', '🐒', '🐶',
  '🍎', '🥭', '🍓', '🍌', '🍉', '🍇', '🐸', '🦆', '🐄', '🍊',
  '🚗', '🚀', '⭐', '🎈', '🦌', '🍦', '🦋', '🌻', '🎁', '👑',
  '🌙', '☀️', '⚽', '💎', '🐠', '🦕', '🐱', '🏰', '🎨', '🏠',
];

const FRUIT_OBJECT_EMOJI_MAP: Record<string, string> = {
  'संतरा': '🍊',
  'નારંગી': '🍊',
  'orange': '🍊',
  'आम': '🥭',
  'કેરી': '🥭',
  'mango': '🥭',
  'केला': '🍌',
  'કેળું': '🍌',
  'banana': '🍌',
  'सेब': '🍎',
  'સફરજન': '🍎',
  'apple': '🍎',
  'अंगूर': '🍇',
  'દ્રાક્ષ': '🍇',
  'grapes': '🍇',
  'तरबूज': '🍉',
  'તરબૂચ': '🍉',
  'watermelon': '🍉',
  'अनानास': '🍍',
  'અનાનસ': '🍍',
  'pineapple': '🍍',
  'पपीता': '🍈',
  'પપૈયું': '🍈',
  'papaya': '🍈',
  'स्ट्रॉबेरी': '🍓',
  'સ્ટ્રોબેરી': '🍓',
  'strawberry': '🍓',
  'गाजर': '🥕',
  'ગાજર': '🥕',
  'carrot': '🥕',
};

function ensureOptionEmoji(label: string): string {
  if (!label) return '';
  if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(label)) {
    return label;
  }
  const cleanKey = label.trim().toLowerCase();
  for (const [key, emoji] of Object.entries(FRUIT_OBJECT_EMOJI_MAP)) {
    if (cleanKey === key.toLowerCase() || label.includes(key)) {
      return `${label} ${emoji}`;
    }
  }
  return label;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

function initPuzzlePieces(count: number): Array<{ id: number; correctPos: number }> {
  const pieces = Array.from({ length: count }, (_, i) => ({ id: i, correctPos: i }));
  let shuffled = shuffleArray(pieces);
  if (shuffled.every((p, idx) => p.correctPos === idx)) {
    const temp = shuffled[0];
    shuffled[0] = shuffled[1];
    shuffled[1] = temp;
  }
  return shuffled;
}

export default function GameRunnerScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: string }>();
  const gameType = (type || 'find-letter') as GameType;

  const { language, speak, recordScore, recordWrongAnswer, clearWrongAnswer, t, ageGroup, addCoins } = useApp();
  const { width } = useWindowDimensions();

  // ---- Game-show HUD: lives, coin awards, correct-answer flash ----
  /** Little learners (2-4) get more hearts; nobody gets a harsh game over. */
  const maxLives = ageGroup === '2-4' ? 5 : 3;
  const COINS_PER_CORRECT = 2;
  /** Only standard quizzes cost a heart; find-object is intentionally gentle and memory/puzzle have no wrong answers. */
  const usesLives = gameType !== 'memory-match' && gameType !== 'picture-puzzle' && gameType !== 'find-object';
  const [lives, setLives] = useState(maxLives);
  const [outOfLives, setOutOfLives] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [coinBurst, setCoinBurst] = useState(0);
  const flashAnim = useRef(new Animated.Value(0)).current;

  const nextGameRoute = getNextGameRoute(gameType, GAMES_LIST.map((g) => g.route));

  const celebrateCorrect = () => {
    addCoins(COINS_PER_CORRECT);
    setCoinsEarned((c) => c + COINS_PER_CORRECT);
    setCoinBurst((n) => n + 1);
    flashAnim.setValue(1);
    Animated.timing(flashAnim, { toValue: 0, duration: 650, useNativeDriver: Platform.OS !== 'web' }).start();
  };

  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const isAnsweredRef = useRef(false);
  const [score, setScoreState] = useState(0);
  // Timers and speech callbacks run with the closure of the render that scheduled them, so the
  // final result is read from this ref; the state copy (one tap behind) undercounted by one.
  const scoreRef = useRef(0);
  const setScore = (next: number | ((prev: number) => number)) => {
    scoreRef.current = typeof next === 'function' ? next(scoreRef.current) : next;
    setScoreState(scoreRef.current);
  };
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);

  // For Memory Match specific game state
  const [memoryCards, setMemoryCards] = useState<
    Array<{ id: number; val: string; isFlipped: boolean; isMatched: boolean }>
  >([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);

  // For Picture Puzzle specific game state
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [puzzlePieceMode, setPuzzlePieceMode] = useState<4 | 6 | 9>(6);
  const [puzzlePieces, setPuzzlePieces] = useState<Array<{ id: number; correctPos: number }>>([]);
  const [selectedPieceSlot, setSelectedPieceSlot] = useState<number | null>(null);
  const [isPuzzleSolved, setIsPuzzleSolved] = useState(false);
  const [showPuzzlePeek, setShowPuzzlePeek] = useState(false);
  const [puzzleMoveCount, setPuzzleMoveCount] = useState(0);
  const promptTimerRef = useRef<TimerHandle | null>(null);
  const advanceTimerRef = useRef<TimerHandle | null>(null);
  const speechTimerRef = useRef<TimerHandle | null>(null);
  const memoryTimerRef = useRef<TimerHandle | null>(null);
  const isMountedRef = useRef(true);
  const loadIdRef = useRef(0);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Cheerful praise audio once when a round ends (stars match the popup).
  useEffect(() => {
    if (!isGameOver) return;
    const total =
      gameType === 'memory-match' ? Math.floor(memoryCards.length / 2) : gameType === 'picture-puzzle' ? 10 : questions.length;
    const stars = getRoundStars(score, total, outOfLives);
    const praise = outOfLives
      ? language === 'gu'
        ? 'સરસ પ્રયત્ન! ફરી રમીએ!'
        : language === 'hi'
        ? 'बहुत अच्छी कोशिश! फिर से खेलें!'
        : 'Great try! Let us play again!'
      : stars === 3
      ? language === 'gu'
        ? 'વાહ! તમે ત્રણ તારા જીત્યા!'
        : language === 'hi'
        ? 'वाह! आपने तीन तारे जीते!'
        : 'Wow! You won three stars!'
      : language === 'gu'
      ? 'શાબાશ! સરસ રમ્યા!'
      : language === 'hi'
      ? 'शाबाश! बढ़िया खेले!'
      : 'Well done! Great playing!';
    const id = setTimeout(() => speak(praise, language), 700);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameOver]);

  // Load questions
  useEffect(() => {
    initGame();
    return () => {
      if (promptTimerRef.current) {
        clearTimeout(promptTimerRef.current);
      }
      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current);
      }
      if (speechTimerRef.current) {
        clearTimeout(speechTimerRef.current);
      }
      if (memoryTimerRef.current) {
        clearTimeout(memoryTimerRef.current);
      }
      audioService.stop();
      soundEffects.stopAnimalSound();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameType, language, ageGroup]);

  // Silence all audio immediately when this screen loses focus or user navigates to another page
  useFocusEffect(
    useCallback(() => {
      return () => {
        if (promptTimerRef.current) {
          clearTimeout(promptTimerRef.current);
        }
        if (advanceTimerRef.current) {
          clearTimeout(advanceTimerRef.current);
        }
        if (speechTimerRef.current) {
          clearTimeout(speechTimerRef.current);
        }
        if (memoryTimerRef.current) {
          clearTimeout(memoryTimerRef.current);
        }
        audioService.stop();
        soundEffects.stopAnimalSound();
      };
    }, [])
  );

  const initGame = () => {
    const thisLoadId = ++loadIdRef.current;
    if (promptTimerRef.current) {
      clearTimeout(promptTimerRef.current);
    }
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
    }
    setLives(maxLives);
    setOutOfLives(false);
    setCoinsEarned(0);
    setCoinBurst(0);

    if (gameType === 'picture-puzzle') {
      setPuzzlePieces(initPuzzlePieces(puzzlePieceMode));
      setSelectedPieceSlot(null);
      setIsPuzzleSolved(false);
      setShowPuzzlePeek(false);
      setPuzzleMoveCount(0);
      setScore(0);
      setIsGameOver(false);
      const curPuz = PUZZLE_PICTURES[puzzleIndex];
      const puzTitle = language === 'gu' ? curPuz.titleGu : language === 'hi' ? curPuz.titleHi : curPuz.titleEn;
      promptTimerRef.current = setTimeout(() => {
        if (!isMountedRef.current || thisLoadId !== loadIdRef.current) return;
        speak(puzTitle, language);
      }, 500);
      return;
    }

    apiService.fetchGameQuestions(gameType, language, ageGroup)
      .then((fetchedQuestions) => {
        if (!isMountedRef.current || thisLoadId !== loadIdRef.current) return;

        // 1. Validate questions: must have valid options array with >= 2 options
        const validServerQuestions = (fetchedQuestions || []).filter((q) => {
          if (!q || !q.prompt) return false;
          if (!Array.isArray(q.options) || q.options.length < 2) return false;
          const hasValidOpts = q.options.every((o) => o && Boolean(o.id) && (o.label || o.visual));
          if (!hasValidOpts) return false;
          const corrId = String(q.correctOptionId || '1');
          return q.options.some((o) => String(o.id) === corrId);
        });

        // 2. Bundled fallback pool for this specific game & language
        const bundledPool: GameQuestion[] =
          GAME_QUESTIONS[gameType]?.[language] ||
          GAME_QUESTIONS[gameType]?.en ||
          [];

        // 3. Merge server questions and top-up from bundled pool to reach at least 10
        const seenPrompts = new Set<string>();
        const mergedList: GameQuestion[] = [];

        for (const q of validServerQuestions) {
          if (!seenPrompts.has(q.prompt)) {
            seenPrompts.add(q.prompt);
            mergedList.push(q);
          }
        }

        // Top up from bundled pool if fewer than 10
        for (const q of bundledPool) {
          if (mergedList.length >= 10 && validServerQuestions.length > 0) break;
          if (!seenPrompts.has(q.prompt)) {
            seenPrompts.add(q.prompt);
            mergedList.push(q);
          }
        }

        // 4. Age-matched filtering if counting
        let adaptedList = [...mergedList];
        if (gameType === 'counting' && ageGroup === '2-4') {
          const easyCounts = adaptedList.filter((q) => (q.countTarget ? q.countTarget <= 6 : true));
          if (easyCounts.length >= 10) adaptedList = easyCounts;
        }

        // 5. Shuffle questions with Fisher-Yates shuffleArray and take up to 10
        const shuffledQuestions = shuffleArray(adaptedList).slice(0, 10);

        // 6. Shuffle answer options (Fisher-Yates) so correct answer position changes
        const finalRoundQuestions = shuffledQuestions.map((q) => {
          if (!q.options || q.options.length <= 1) return q;
          return { ...q, options: shuffleArray(q.options) };
        });

        setQuestions(finalRoundQuestions);
        setCurrentIndex(0);
        setSelectedOptionId(null);
        setIsAnswered(false);
        setScore(0);
        setFeedback(null);
        setIsGameOver(false);

        // Auto-prompt sound with gentle delay
        if (finalRoundQuestions.length > 0) {
          const firstAudio = getLocalizedAudioText(finalRoundQuestions[0]);
          if (firstAudio) {
            promptTimerRef.current = setTimeout(() => {
              if (!isMountedRef.current || thisLoadId !== loadIdRef.current) return;
              speak(firstAudio, language);
            }, 500);
          }
        }
      })
      .catch(() => {
        if (!isMountedRef.current || thisLoadId !== loadIdRef.current) return;
        // Fallback safely to bundled questions on any unhandled error
        const bundled = GAME_QUESTIONS[gameType]?.[language] || GAME_QUESTIONS[gameType]?.en || [];
        const fallbackQuestions = shuffleArray(bundled).slice(0, 10).map((q) => ({
          ...q,
          options: shuffleArray(q.options || []),
        }));
        setQuestions(fallbackQuestions);
      });

    // Initialize Memory Match cards adapted to age group with fresh random emoji pool and sequence
    if (gameType === 'memory-match') {
      const pairCount = ageGroup === '2-4' ? 6 : 8; // 12 cards (6 pairs) or 16 cards (8 pairs: 4x4)
      const shuffledBank = shuffleArray(MEMORY_EMOJI_BANK);
      const chosenSymbols = shuffledBank.slice(0, pairCount);
      const deck = shuffleArray([...chosenSymbols, ...chosenSymbols]).map((val, idx) => ({
        id: Date.now() + idx,
        val,
        isFlipped: false,
        isMatched: false,
      }));
      setMemoryCards(deck);
      setFlippedIndices([]);
    }
  };

  const getLocalizedPrompt = (q?: GameQuestion) => {
    if (!q) return '';
    const raw = q.prompt || '';
    if (!raw || raw.trim() === 'Identify the correct answer' || raw.trim() === 'Identify the correct answer:') {
      if (gameType === 'odd-one-out') {
        return language === 'gu'
          ? 'આમાંથી અલગ શું પડે છે શોધો:'
          : language === 'hi'
          ? 'इनमें से अलग क्या है पहचानें:'
          : 'Find the odd one out:';
      }
      return language === 'gu'
        ? 'સાચો જવાબ પસંદ કરો:'
        : language === 'hi'
        ? 'सही उत्तर चुनें:'
        : 'Identify the correct answer:';
    }
    return raw;
  };

  const getLocalizedAudioText = (q?: GameQuestion) => {
    if (!q) return '';
    const raw = q.audioText || q.prompt || '';
    if (!raw || raw.trim() === 'Identify the correct answer' || raw.trim() === 'Identify the correct answer:') {
      return getLocalizedPrompt(q);
    }
    return raw;
  };

  const currentQ = questions[currentIndex];

  const handleOptionSelect = (option: GameOption) => {
    if (isAnsweredRef.current || isAnswered) return; // Prevent double taps
    isAnsweredRef.current = true;

    soundEffects.playBubblePop();
    setIsAnswered(true);
    setSelectedOptionId(option.id);

    const isCorrect = option.id === currentQ.correctOptionId;
    const rawLabel = option.label || '';
    const cleanWord = rawLabel
      .replace(/[\p{Extended_Pictographic}\uFE0F\u200D]+/gu, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (isCorrect) {
      clearWrongAnswer(currentQ.id);
      soundEffects.playCorrectSound();
      setScore((prev) => prev + 1);
      celebrateCorrect();
      setFeedback({
        isCorrect: true,
        text: t('games.correct'),
      });
      const praise =
        language === 'gu'
          ? cleanWord
            ? `શાબાશ! ${cleanWord} એકદમ સાચો જવાબ છે!`
            : `શાબાશ! એકદમ સાચો જવાબ છે!`
          : language === 'hi'
          ? cleanWord
            ? `शाबाश! ${cleanWord} बिल्कुल सही जवाब है!`
            : `शाबाश! बिल्कुल सही जवाब है!`
          : cleanWord
          ? `Super! ${cleanWord} is right!`
          : `Super! That is right!`;

      let hasAdvanced = false;
      const advanceSafely = () => {
        if (hasAdvanced) return;
        hasAdvanced = true;
        if (advanceTimerRef.current) {
          clearTimeout(advanceTimerRef.current);
          advanceTimerRef.current = null;
        }
        handleNextQuestion();
      };

      // Auto-advance smoothly after celebratory audio completes (with gentle 140ms buffer so correct chime doesn't clash)
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
      speechTimerRef.current = setTimeout(() => {
        speak(praise, language, () => {
          if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
          advanceTimerRef.current = setTimeout(advanceSafely, 500);
        });
      }, 140);

      // Safety fallback timer if audio callback is not received or sound disabled
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = setTimeout(advanceSafely, 7000);
    } else {
      recordWrongAnswer({
        id: currentQ.id,
        prompt: currentQ.prompt,
        correctOption: currentQ.options.find((o) => o.id === currentQ.correctOptionId)?.label || '',
        hint: currentQ.hint || '',
        language,
      });
      soundEffects.playWrongSound();
      setFeedback({
        isCorrect: false,
        text: t('games.wrong'),
      });
      const tryAgain =
        language === 'gu'
          ? cleanWord
            ? `આ તો ${cleanWord} છે! ફરીથી પ્રયત્ન કરો!`
            : `ફરીથી પ્રયત્ન કરો!`
          : language === 'hi'
          ? cleanWord
            ? `यह तो ${cleanWord} है! फिर से कोशिश करो!`
            : `फिर से कोशिश करो!`
          : cleanWord
          ? `That is ${cleanWord}! Let us try again!`
          : `Let us try again!`;
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
      speechTimerRef.current = setTimeout(() => {
        speak(tryAgain, language);
      }, 140);

      if (usesLives) {
        const remaining = lives - 1;
        setLives(remaining);
        if (remaining <= 0) {
          // Out of hearts: end the round kindly (score still saved & synced).
          if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
          advanceTimerRef.current = setTimeout(() => {
            audioService.stop();
            setOutOfLives(true);
            setIsGameOver(true);
            recordScore(gameType, scoreRef.current, questions.length);
          }, 1800);
        }
      }
    }
  };

  // Find the Correct Object Option Select Handler (with gentle hints & positive feedback)
  const handleFindObjectOptionSelect = (option: GameOption) => {
    if (isAnsweredRef.current || (isAnswered && feedback?.isCorrect)) return;

    soundEffects.playBubblePop();
    setSelectedOptionId(option.id);

    const isCorrect = option.id === currentQ.correctOptionId;

    if (isCorrect) {
      isAnsweredRef.current = true;
      setIsAnswered(true);
      clearWrongAnswer(currentQ.id);
      soundEffects.playCorrectSound();
      setScore((prev) => prev + 1);
      celebrateCorrect();
      setFeedback({
        isCorrect: true,
        text: t('games.correct'),
      });
      const praise =
        language === 'gu'
          ? `શાબાશ! એકદમ સાચો જવાબ છે!`
          : language === 'hi'
          ? `शाबाश! बिल्कुल सही उत्तर!`
          : `Super! That is right!`;

      let hasAdvanced = false;
      const advanceSafely = () => {
        if (hasAdvanced) return;
        hasAdvanced = true;
        if (advanceTimerRef.current) {
          clearTimeout(advanceTimerRef.current);
          advanceTimerRef.current = null;
        }
        handleNextQuestion();
      };

      speak(praise, language, () => {
        if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
        advanceTimerRef.current = setTimeout(advanceSafely, 500);
      });

      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = setTimeout(advanceSafely, 7000);
    } else {
      // Gentle hint without discouraging words
      const gentleMessage =
        currentQ.hint ||
        (language === 'gu'
          ? `આ તો ${option.label} છે! ફરી ધ્યાનથી શોધો`
          : language === 'hi'
          ? `यह तो ${option.label} है! फिर से ध्यान से खोजें`
          : `That is a ${option.label}! Try again`);

      setFeedback({
        isCorrect: false,
        text: gentleMessage,
      });
      const gentleVoice =
        language === 'gu'
          ? 'કોઈ વાંધો નહીં, ફરી પ્રયત્ન કરો!'
          : language === 'hi'
          ? 'कोई बात नहीं, फिर से कोशिश करें!'
          : 'Nice try! Look carefully and try again!';
      speak(gentleVoice, language);

      // Keep child able to try another option immediately
      setIsAnswered(false);
    }
  };

  const handleNextQuestion = () => {
    isAnsweredRef.current = false;
    if (speechTimerRef.current) {
      clearTimeout(speechTimerRef.current);
      speechTimerRef.current = null;
    }
    // Round is ending because hearts ran out; the out-of-lives timer records the result once.
    if (usesLives && lives <= 0) return;
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    audioService.stop();
    soundEffects.playBubblePop();
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setSelectedOptionId(null);
      setIsAnswered(false);
      setFeedback(null);

      const nextAudio = getLocalizedAudioText(questions[nextIdx]);
      if (nextAudio) {
        if (promptTimerRef.current) clearTimeout(promptTimerRef.current);
        promptTimerRef.current = setTimeout(() => {
          speak(nextAudio, language);
        }, 500);
      }
    } else {
      // Game Completed
      const finalScore = scoreRef.current;
      soundEffects.playTadaaa();
      setIsGameOver(true);
      recordScore(gameType, finalScore, questions.length);
    }
  };

  // Picture Puzzle handlers
  const handlePieceTap = (slotIndex: number) => {
    if (isPuzzleSolved) return;
    soundEffects.playBubblePop();

    if (selectedPieceSlot === null) {
      setSelectedPieceSlot(slotIndex);
    } else if (selectedPieceSlot === slotIndex) {
      setSelectedPieceSlot(null);
    } else {
      const newPieces = [...puzzlePieces];
      const temp = newPieces[selectedPieceSlot];
      newPieces[selectedPieceSlot] = newPieces[slotIndex];
      newPieces[slotIndex] = temp;

      setPuzzlePieces(newPieces);
      setSelectedPieceSlot(null);
      setPuzzleMoveCount((m) => m + 1);

      const solved = newPieces.every((p, idx) => p.correctPos === idx);
      if (solved) {
        soundEffects.playTadaaa();
        setIsPuzzleSolved(true);
        const earnedStars = puzzlePieceMode === 4 ? 3 : puzzlePieceMode === 6 ? 5 : 8;
        setScore((s) => s + earnedStars);
        const praise =
          language === 'gu'
            ? 'શાબાશ! તમે પઝલ પૂર્ણ કરી લીધી!'
            : language === 'hi'
            ? 'शाबाश! आपने पहेली पूरी कर ली!'
            : 'Super! You completed the puzzle!';
        speak(praise, language);
        recordScore('picture-puzzle', earnedStars, 10);
      }
    }
  };

  const handleRestartPuzzle = () => {
    soundEffects.playBubblePop();
    setPuzzlePieces(initPuzzlePieces(puzzlePieceMode));
    setSelectedPieceSlot(null);
    setIsPuzzleSolved(false);
    setPuzzleMoveCount(0);
  };

  const handleNextPuzzle = () => {
    soundEffects.playBubblePop();
    const nextIdx = (puzzleIndex + 1) % PUZZLE_PICTURES.length;
    setPuzzleIndex(nextIdx);
    setPuzzlePieces(initPuzzlePieces(puzzlePieceMode));
    setSelectedPieceSlot(null);
    setIsPuzzleSolved(false);
    setPuzzleMoveCount(0);
    const nextPuz = PUZZLE_PICTURES[nextIdx];
    const puzTitle = language === 'gu' ? nextPuz.titleGu : language === 'hi' ? nextPuz.titleHi : nextPuz.titleEn;
    speak(puzTitle, language);
  };

  const handleChangePieceMode = (mode: 4 | 6 | 9) => {
    soundEffects.playBubblePop();
    setPuzzlePieceMode(mode);
    setPuzzlePieces(initPuzzlePieces(mode));
    setSelectedPieceSlot(null);
    setIsPuzzleSolved(false);
    setPuzzleMoveCount(0);
  };

  // Memory match card click handler
  const handleCardClick = (index: number) => {
    if (flippedIndices.length === 2 || memoryCards[index].isMatched || memoryCards[index].isFlipped) {
      return;
    }

    soundEffects.playBubblePop();
    const updated = [...memoryCards];
    updated[index].isFlipped = true;
    const newFlipped = [...flippedIndices, index];
    setMemoryCards(updated);
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (updated[first].val === updated[second].val) {
        // Matched - play cheerful chime without talking/speaking
        if (memoryTimerRef.current) clearTimeout(memoryTimerRef.current);
        memoryTimerRef.current = setTimeout(() => {
          updated[first].isMatched = true;
          updated[second].isMatched = true;
          setMemoryCards([...updated]);
          setFlippedIndices([]);
          setScore((s) => s + 1);
          soundEffects.playCorrectSound();

          // Check if all matched
          if (updated.every((c) => c.isMatched)) {
            const pairTotal = Math.floor(updated.length / 2);
            soundEffects.playTadaaa();
            setIsGameOver(true);
            recordScore('memory-match', pairTotal, pairTotal);
          }
        }, 500);
      } else {
        // Not matched - flip back
        if (memoryTimerRef.current) clearTimeout(memoryTimerRef.current);
        memoryTimerRef.current = setTimeout(() => {
          updated[first].isFlipped = false;
          updated[second].isFlipped = false;
          setMemoryCards([...updated]);
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  const getGameTitle = () => {
    switch (gameType) {
      case 'balloon-pop':
        return t('games.balloonPop');
      case 'picture-matching':
        return t('games.pictureMatching');
      case 'find-letter':
        return t('games.findLetter');
      case 'memory-match':
        return t('games.memoryMatch');
      case 'missing-letter':
        return t('games.missingLetter');
      case 'colors-shapes':
        return t('games.colorsShapes');
      case 'listen-choose':
        return t('games.listenChoose');
      case 'counting':
        return t('games.counting');
      case 'math-quiz':
        return t('games.mathQuiz');
      case 'picture-puzzle':
        return t('games.picturePuzzle') || 'Picture Puzzle';
      case 'find-object':
        return t('games.findObject') || 'Find the Object';
      case 'logic-reasoning':
        return language === 'gu'
          ? 'તાર્કિક વિચારણા'
          : language === 'hi'
          ? 'तार्किक विचार'
          : 'Logical Reasoning';
      case 'odd-one-out':
        return language === 'gu'
          ? 'અસંગત અલગ તારવો'
          : language === 'hi'
          ? 'विषम को अलग करें'
          : 'Odd One Out';
      default:
        return t('games.title');
    }
  };

  const handleBack = () => {
    audioService.stop();
    soundEffects.playBubblePop();
    if (Platform.OS === 'web') {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
      try {
        if (router.canGoBack()) {
          router.back();
          setTimeout(() => {
            if (typeof window !== 'undefined' && window.location.pathname + window.location.search === currentPath) {
              router.replace('/games');
            }
          }, 150);
          return;
        }
      } catch {}
      router.replace('/games');
      return;
    }

    try {
      if (router.canGoBack()) {
        router.back();
        return;
      }
    } catch {}
    router.replace('/games');
  };

  if (!currentQ && gameType !== 'memory-match' && gameType !== 'picture-puzzle') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title={getGameTitle()} showBack={true} backHref="/games" onBack={handleBack} />
        <View style={styles.centerBox}>
          <Text style={styles.promptText}>
            {language === 'gu'
              ? 'પ્રશ્નો લોડ થઈ રહ્યા છે...'
              : language === 'hi'
              ? 'प्रश्न लोड हो रहे हैं...'
              : 'Loading questions...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppGlobalBackground id="gamePlayerBgGrad" />
      <Header
        title={getGameTitle()}
        showBack={true}
        backHref="/games"
        onBack={handleBack}
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
        {/* Game-show HUD: hearts, level star meter, coin bank */}
        <View style={[styles.hud, clayShadow(2)]}>
          <View style={styles.hudTopRow}>
            {usesLives ? <HeartMeter lives={lives} max={maxLives} /> : <Art.GamepadArt size={29} />}
            <View style={styles.hudCoins}>
              <GoldCoinIcon size={18} />
              <Text style={styles.hudCoinsText}>{formatNumberDigits(coinsEarned, language)}</Text>
            </View>
            <View style={styles.hudScore}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Art.StarArt size={20} />
                <Text style={styles.hudScoreText}>{formatNumberDigits(score, language)}</Text>
              </View>
            </View>
          </View>
          {gameType === 'picture-puzzle' ? (
            <StarMeter
              value={(puzzleIndex + (isPuzzleSolved ? 1 : 0)) / PUZZLE_PICTURES.length}
              label={`${formatNumberDigits(puzzleIndex + 1, language)} / ${formatNumberDigits(PUZZLE_PICTURES.length, language)}`}
            />
          ) : gameType === 'memory-match' ? (
            <StarMeter
              value={memoryCards.length ? memoryCards.filter((c) => c.isMatched).length / memoryCards.length : 0}
              label={`${formatNumberDigits(Math.floor(memoryCards.filter((c) => c.isMatched).length / 2), language)} / ${formatNumberDigits(Math.floor(memoryCards.length / 2), language)}`}
            />
          ) : (
            <StarMeter
              value={questions.length ? (currentIndex + (isAnswered && feedback?.isCorrect ? 1 : 0)) / questions.length : 0}
              label={`${t('games.question')} ${formatNumberDigits(currentIndex + 1, language)} / ${formatNumberDigits(questions.length, language)}`}
            />
          )}
        </View>

        {/* 1. MEMORY MATCH SPECIAL INTERFACE */}
        {gameType === 'memory-match' ? (
          <View style={styles.memoryContainer}>
            <Text style={styles.promptText}>
              {language === 'gu'
                ? 'જોડી શોધો - ૨ સરખા કાર્ડ મેળવો'
                : language === 'hi'
                ? 'जोड़ी खोजें - २ समान कार्ड मिलाएं'
                : 'Match Pairs - Flip 2 cards'}
            </Text>
            <View style={styles.memoryGrid}>
              {memoryCards.map((card, idx) => (
                <TouchableOpacity
                  key={card.id}
                  onPress={() => handleCardClick(idx)}
                  activeOpacity={0.8}
                  style={[
                    styles.memoryCard,
                    card.isFlipped || card.isMatched
                      ? styles.memoryCardFlipped
                      : styles.memoryCardBack,
                    shadows.soft,
                  ]}
                >
                  {card.isFlipped || card.isMatched ? (
                    <VisualArt value={card.val} size={46} textStyle={styles.memoryCardText} />
                  ) : (
                    <Glyph name="help" size={30} color="#FFFFFF" strokeWidth={2.6} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : gameType === 'picture-puzzle' ? (
          /* 2. PICTURE PUZZLE INTERFACE */
          <View style={styles.puzzleContainer}>
            {/* Piece Count Selector (4, 6, 9) */}
            <View style={styles.puzzleModeSelector}>
              {([4, 6, 9] as const).map((mode) => {
                const isSelected = puzzlePieceMode === mode;
                const label =
                  mode === 4
                    ? t('games.pieces4') || '4 Pieces'
                    : mode === 6
                    ? t('games.pieces6') || '6 Pieces'
                    : t('games.pieces9') || '9 Pieces';
                return (
                  <TouchableOpacity
                    key={mode}
                    onPress={() => handleChangePieceMode(mode)}
                    style={[styles.puzzleModePill, isSelected && styles.puzzleModePillActive]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.puzzleModePillText, isSelected && styles.puzzleModePillTextActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Animal Title & Peek Toggle */}
            <View style={styles.puzzleTitleRow}>
              <Text style={styles.puzzleTitleText}>
                {language === 'gu'
                  ? PUZZLE_PICTURES[puzzleIndex].titleGu
                  : language === 'hi'
                  ? PUZZLE_PICTURES[puzzleIndex].titleHi
                  : PUZZLE_PICTURES[puzzleIndex].titleEn}
              </Text>
              <TouchableOpacity
                style={styles.puzzlePeekBtn}
                onPress={() => {
                  soundEffects.playBubblePop();
                  setShowPuzzlePeek(!showPuzzlePeek);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.puzzlePeekBtnText} numberOfLines={1}>
                  {showPuzzlePeek
                    ? language === 'gu'
                      ? 'છુપાવો'
                      : language === 'hi'
                      ? 'छिपाएं'
                      : 'Hide'
                    : language === 'gu'
                    ? '👁️ ઝલક (Peek)'
                    : language === 'hi'
                    ? '👁️ झलक (Peek)'
                    : '👁️ Original (Peek)'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Reference Preview Card (Peek) */}
            {showPuzzlePeek && (
              <View style={[styles.puzzlePeekCard, shadows.soft]}>
                <Image
                  source={resolveOfflineMediaSource(PUZZLE_PICTURES[puzzleIndex].imageSource)}
                  style={styles.puzzlePeekImage}
                  resizeMode="cover"
                />
                <Text style={styles.puzzlePeekHint}>
                  {language === 'gu'
                    ? 'આ ચિત્ર મુજબ ટુકડા ગોઠવો!'
                    : language === 'hi'
                    ? 'इस चित्र के अनुसार टुकड़े व्यवस्थित करें!'
                    : 'Arrange pieces to match this picture!'}
                </Text>
              </View>
            )}

            {/* Puzzle Board Grid */}
            {(() => {
              const cols = puzzlePieceMode === 4 ? 2 : puzzlePieceMode === 6 ? 3 : 3;
              const rows = puzzlePieceMode === 4 ? 2 : puzzlePieceMode === 6 ? 2 : 3;
              const boardW = Math.min(width - 48, 330);
              const pieceW = Math.floor(boardW / cols);
              const pieceH = Math.floor(boardW / rows);
              const totalW = pieceW * cols;
              const totalH = pieceH * rows;

              return (
                <View
                  style={[
                    styles.puzzleBoard,
                    { width: totalW, height: totalH },
                    isPuzzleSolved && styles.puzzleBoardSolved,
                    shadows.card,
                  ]}
                >
                  {isPuzzleSolved ? (
                    /* Solved whole unified picture */
                    <View style={{ width: totalW, height: totalH, overflow: 'hidden', borderRadius: radii.md }}>
                      <Image
                        source={resolveOfflineMediaSource(PUZZLE_PICTURES[puzzleIndex].imageSource)}
                        style={{ width: totalW, height: totalH }}
                        resizeMode="cover"
                      />
                    </View>
                  ) : (
                    puzzlePieces.map((piece, slotIdx) => {
                      const origCol = piece.correctPos % cols;
                      const origRow = Math.floor(piece.correctPos / cols);
                      const isSelected = selectedPieceSlot === slotIdx;

                      return (
                        <TouchableOpacity
                          key={piece.id}
                          activeOpacity={0.85}
                          onPress={() => handlePieceTap(slotIdx)}
                          style={[
                            styles.puzzlePiece,
                            {
                              width: pieceW,
                              height: pieceH,
                              left: (slotIdx % cols) * pieceW,
                              top: Math.floor(slotIdx / cols) * pieceH,
                            },
                            isSelected && styles.puzzlePieceSelected,
                          ]}
                        >
                          <View style={{ width: pieceW, height: pieceH, overflow: 'hidden' }}>
                            <Image
                              source={resolveOfflineMediaSource(PUZZLE_PICTURES[puzzleIndex].imageSource)}
                              style={{
                                width: totalW,
                                height: totalH,
                                position: 'absolute',
                                top: -origRow * pieceH,
                                left: -origCol * pieceW,
                              }}
                              resizeMode="cover"
                            />
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              );
            })()}

            {/* Celebration Success Banner when Solved */}
            {isPuzzleSolved && (
              <View style={[styles.puzzleSuccessCard, shadows.card]}>
                <View style={[styles.puzzleSuccessStars, { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 4 }]}>
                  <Art.StarArt size={28} />
                  <Art.StarArt size={34} />
                  <Art.TrophyArt size={44} />
                  <Art.StarArt size={34} />
                  <Art.StarArt size={28} />
                </View>
                <Text style={styles.puzzleSuccessTitle}>{t('games.puzzleCompleted')}</Text>
                <Text style={styles.puzzleSuccessSub}>
                  {language === 'gu'
                    ? `ખૂબ સરસ! તમે ${formatNumberDigits(puzzleMoveCount, language)} ચાલમાં પઝલ ઉકેલી!`
                    : language === 'hi'
                    ? `शानदार! आपने ${formatNumberDigits(puzzleMoveCount, language)} चालों में पहेली हल की!`
                    : `Great job! You solved the puzzle in ${puzzleMoveCount} moves!`}
                </Text>
              </View>
            )}

            {/* Restart and Next Puzzle Actions */}
            <View style={styles.puzzleActionRow}>
              <TouchableOpacity
                style={[styles.puzzleActionBtn, { backgroundColor: colors.skyBlue }]}
                onPress={handleRestartPuzzle}
                activeOpacity={0.8}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Glyph name="replay" size={16} color="#1E293B" strokeWidth={2.8} />
                  <Text style={styles.puzzleActionBtnText}>{t('games.restartPuzzle')}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.puzzleActionBtn, { backgroundColor: colors.mint }]}
                onPress={handleNextPuzzle}
                activeOpacity={0.8}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.puzzleActionBtnText}>{t('games.nextPuzzle')}</Text>
                  <Glyph name="next" size={16} color="#1E293B" strokeWidth={2.8} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ) : gameType === 'find-object' ? (
          /* 3. FIND THE CORRECT OBJECT INTERFACE */
          <View style={styles.findObjectContainer}>
            {/* Animated Progress Bar */}
            <View style={styles.findObjectProgressBox}>
              <View style={styles.findObjectProgressTrack}>
                <View
                  style={[
                    styles.findObjectProgressFill,
                    {
                      width: `${Math.max(10, Math.round(((currentIndex + 1) / questions.length) * 100))}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.findObjectProgressText}>
                {t('games.question')} {formatNumberDigits(currentIndex + 1, language)} / {formatNumberDigits(questions.length, language)}
              </Text>
            </View>

            {/* Prompt Card */}
            <View style={[styles.findObjectPromptCard, shadows.card]}>
              <Text style={styles.findObjectPromptText}>{getLocalizedPrompt(currentQ)}</Text>
              {currentQ.displayVisual && (
                <View style={styles.findObjectVisualCircle}>
                  <VisualArt value={currentQ.displayVisual} size={52} textStyle={styles.findObjectVisualEmoji} />
                </View>
              )}
              {currentQ.audioText && (
                <AudioSpeakerButton
                  onPress={() => speak(getLocalizedAudioText(currentQ), language)}
                  size={50}
                  label={t('lesson.repeatAudio')}
                />
              )}
            </View>

            {/* 4 Colorful Choice Cards */}
            <View style={styles.findObjectGrid}>
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedOptionId === option.id;
                const isCorrect = option.id === currentQ.correctOptionId;

                const cardColors = [colors.mint, colors.skyBlue, colors.peach, colors.yellow];
                let cardBg = option.color || cardColors[idx % cardColors.length];
                let borderColor = 'transparent';

                if (isAnswered) {
                  if (isCorrect) {
                    cardBg = colors.mint;
                    borderColor = colors.accent;
                  } else if (isSelected && !isCorrect) {
                    cardBg = colors.peach;
                    borderColor = colors.error;
                  }
                } else if (isSelected && !feedback?.isCorrect) {
                  cardBg = colors.yellow;
                  borderColor = colors.warning;
                }

                return (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => handleFindObjectOptionSelect(option)}
                    activeOpacity={0.8}
                    style={[
                      styles.findObjectCard,
                      { backgroundColor: cardBg, borderColor },
                      shadows.soft,
                    ]}
                  >
                    {option.visual && <VisualArt value={option.visual} size={54} textStyle={styles.findObjectCardEmoji} />}
                    <Text style={styles.findObjectCardLabel}>{splitEmojiLabel(option.label).label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Gentle Hint or Positive Feedback Banner */}
            {feedback ? (
              <View
                style={[
                  styles.feedbackBanner,
                  {
                    backgroundColor: feedback.isCorrect ? colors.mint : colors.yellow,
                  },
                ]}
              >
                <Text style={styles.feedbackText}>{feedback.text}</Text>
                {feedback.isCorrect ? (
                  <PastelButton
                    title={
                      currentIndex < questions.length - 1
                        ? `${t('lesson.next')} →`
                        : t('lesson.finish')
                    }
                    onPress={handleNextQuestion}
                    variant="primary"
                    style={styles.nextFeedbackBtn}
                    textStyle={styles.nextFeedbackBtnText}
                  />
                ) : null}
              </View>
            ) : null}
          </View>
        ) : (
          /* 4. STANDARD EDUCATIONAL GAMES INTERFACE */
          <View style={styles.gameContent}>
            {/* Question Prompt */}
            <View
              style={[
                styles.promptCard,
                gameType === 'balloon-pop' && styles.balloonPromptCard,
                shadows.soft,
              ]}
            >
              {gameType === 'balloon-pop' && (
                <View style={styles.balloonSkyBanner}>
                  <Text style={styles.balloonSkyBannerText}>
                    {language === 'gu' ? 'ફુગ્ગો ફોડો!' : language === 'hi' ? 'गुब्बारा फोड़ो!' : 'Pop the Balloon!'} 🎈 ☁️
                  </Text>
                </View>
              )}
              <Text
                style={[
                  styles.promptText,
                  gameType === 'balloon-pop' && styles.balloonPromptText,
                ]}
              >
                {getLocalizedPrompt(currentQ)}
              </Text>

              {/* Display Real Image, Visual, or Repeated Counting Items */}
              {currentQ.displayImageSource || currentQ.displayImage ? (
                <View style={styles.gameImageBox}>
                  <Image
                    source={resolveOfflineMediaSource(
                      currentQ.displayImageSource || {
                        uri: currentQ.displayImage,
                      }
                    )}
                    style={styles.gameImage}
                    resizeMode="cover"
                  />
                </View>
              ) : currentQ.countTarget ? (
                <View style={styles.counterRow}>
                  {Array.from({ length: currentQ.countTarget }).map((_, i) => {
                    const singleEmoji = currentQ.displayVisual
                      ? currentQ.displayVisual.trim().split(/\s+/)[0]
                      : '⭐';
                    return (
                      <VisualArt key={i} value={singleEmoji} size={50} textStyle={styles.counterItem} />
                    );
                  })}
                </View>
              ) : currentQ.displayVisual && currentQ.displayVisual.includes('_') ? (
                <View style={styles.sequenceContainer}>
                  <View style={styles.sequenceRow}>
                    {currentQ.displayVisual.split(/\s+/).filter(Boolean).map((part, pIdx) => {
                      const isBlank = part.includes('_');
                      if (!isBlank) {
                        return (
                          <View key={pIdx} style={styles.sequenceTileCard}>
                            <VisualArt value={part} size={40} textStyle={styles.sequenceTileText} />
                          </View>
                        );
                      }

                      const selectedOpt = currentQ.options.find((o) => o.id === selectedOptionId);
                      const isCorrect = isAnswered && selectedOptionId === currentQ.correctOptionId;
                      const isWrong = isAnswered && selectedOptionId !== currentQ.correctOptionId;

                      return (
                        <View
                          key={pIdx}
                          style={[
                            styles.sequenceSlotCard,
                            isCorrect && styles.sequenceSlotCorrect,
                            isWrong && styles.sequenceSlotWrong,
                          ]}
                        >
                          <Text
                            style={[
                              styles.sequenceSlotText,
                              isCorrect && styles.sequenceSlotTextCorrect,
                              isWrong && styles.sequenceSlotTextWrong,
                            ]}
                          >
                            {isAnswered && selectedOpt ? selectedOpt.label : '?'}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ) : currentQ.displayVisual ? (
                <View
                  style={[
                    styles.visualBox,
                    currentQ.displayVisualColor
                      ? { backgroundColor: currentQ.displayVisualColor }
                      : null,
                  ]}
                >
                  <VisualArt value={currentQ.displayVisual} size={54} textStyle={styles.visualText} />
                </View>
              ) : null}

              {/* Speaker for Listen & Choose or Prompt Audio */}
              <AudioSpeakerButton
                onPress={() => speak(getLocalizedAudioText(currentQ), language)}
                size={50}
                label={t('lesson.repeatAudio')}
              />
            </View>

            {/* Answer Options Grid (Special 3D Floating Balloons for balloon-pop) */}
            <View style={gameType === 'balloon-pop' ? styles.balloonGrid : styles.optionsGrid}>
              {currentQ.options.map((option, optIdx) => {
                const isSelected = selectedOptionId === option.id;
                const isCorrect = option.id === currentQ.correctOptionId;

                const fallbackBalloonColors = [
                  '#EF4444', // Red
                  '#3B82F6', // Blue
                  '#10B981', // Green
                  '#F59E0B', // Amber
                  '#8B5CF6', // Purple
                  '#EC4899', // Pink
                  '#F97316', // Orange
                  '#06B6D4', // Cyan
                ];
                const balloonColor = option.color || fallbackBalloonColors[optIdx % fallbackBalloonColors.length];

                if (gameType === 'balloon-pop') {
                  const balloonScale = isSelected ? 1.06 : 1;
                  const balloonOpacity = isAnswered && !isSelected && !isCorrect ? 0.45 : 1;
                  let balloonBorder = '#FFFFFF';
                  let feedbackBadge: string | null = null;

                  if (isAnswered) {
                    if (isSelected && isCorrect) {
                      balloonBorder = '#22C55E';
                      feedbackBadge = 'great';
                    } else if (isSelected && !isCorrect) {
                      balloonBorder = '#DC2626';
                      feedbackBadge = 'oops';
                    } else if (isCorrect) {
                      balloonBorder = '#22C55E';
                      feedbackBadge = 'star';
                    }
                  }

                  const cleanLabel = option.label.replace(/^🎈\s*/, '').trim();

                  return (
                    <TouchableOpacity
                      key={option.id}
                      onPress={() => {
                        soundEffects.playBubblePop();
                        handleOptionSelect(option);
                      }}
                      disabled={isAnswered}
                      activeOpacity={0.82}
                      style={[
                        styles.balloonWrapper,
                        { transform: [{ scale: balloonScale }], opacity: balloonOpacity },
                      ]}
                    >
                      {/* 3D Inflatable Balloon Body */}
                      <View
                        style={[
                          styles.balloonBody,
                          {
                            backgroundColor: balloonColor,
                            borderColor: balloonBorder,
                          },
                          shadows.soft,
                        ]}
                      >
                        {/* 3D Gloss Shine Reflection */}
                        <View style={styles.balloonGlossShine} />

                        {/* Centered Balloon Text */}
                        <Text
                          style={[
                            styles.balloonText,
                            cleanLabel.length > 5 ? styles.balloonTextSmall : null,
                          ]}
                          numberOfLines={2}
                          adjustsFontSizeToFit
                        >
                          {cleanLabel}
                        </Text>

                        {/* Pop / Feedback Badge */}
                        {feedbackBadge ? (
                          <View style={styles.balloonBadge}>
                            {feedbackBadge === 'oops' ? (
                              <Glyph name="close" size={16} color="#DC2626" strokeWidth={3.2} />
                            ) : (
                              <Art.StarArt size={22} />
                            )}
                          </View>
                        ) : null}
                      </View>

                      {/* Tied Knot */}
                      <View
                        style={[
                          styles.balloonKnot,
                          { borderBottomColor: balloonColor },
                        ]}
                      />

                      {/* Dangling String */}
                      <View style={styles.balloonString} />
                    </TouchableOpacity>
                  );
                }

                // Tactile 3D Cards for all other games
                let cardBg: string = colors.card;
                let cardBorder: string = '#E2E8F0';
                let cardBottomBorder: string = '#CBD5E1';

                if (isAnswered) {
                  if (isSelected && isCorrect) {
                    cardBg = '#DCFCE7';
                    cardBorder = '#22C55E';
                    cardBottomBorder = '#16A34A';
                  } else if (isSelected && !isCorrect) {
                    cardBg = '#FEE2E2';
                    cardBorder = '#EF4444';
                    cardBottomBorder = '#DC2626';
                  } else if (isCorrect) {
                    cardBg = '#F0FDF4';
                    cardBorder = '#86EFAC';
                    cardBottomBorder = '#4ADE80';
                  }
                } else if (isSelected) {
                  cardBorder = colors.accent;
                  cardBottomBorder = colors.accent;
                }

                return (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => handleOptionSelect(option)}
                    disabled={isAnswered}
                    activeOpacity={0.8}
                    style={[
                      styles.optionCard,
                      {
                        backgroundColor: cardBg,
                        borderColor: cardBorder,
                        borderBottomColor: cardBottomBorder,
                      },
                      shadows.soft,
                    ]}
                  >
                    <View style={styles.optionContentRow}>
                      {option.color && !/\p{Extended_Pictographic}/u.test(option.label || '') && !option.visual ? (
                        <View
                          style={[
                            styles.optionColorDot,
                            { backgroundColor: option.color },
                          ]}
                        />
                      ) : null}
                      {option.visual ? (
                        <VisualArt value={option.visual} size={36} textStyle={styles.optionVisual} />
                      ) : (
                        <EmojiArt emoji={splitEmojiLabel(option.label || '').emoji} size={36} />
                      )}
                      <Text style={styles.optionLabel}>
                        {option.visual || splitEmojiLabel(option.label || '').emoji ? splitEmojiLabel(option.label || '').label : option.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Feedback Alert Bar & Next Button */}
            {feedback ? (
              <View
                style={[
                  styles.feedbackBanner,
                  {
                    backgroundColor: feedback.isCorrect ? colors.mint : colors.yellow,
                  },
                ]}
              >
                <Text style={styles.feedbackText}>{feedback.text}</Text>
                {currentQ.hint && !feedback.isCorrect ? (
                  <Text style={styles.hintText}>{currentQ.hint}</Text>
                ) : null}

                <PastelButton
                  title={
                    currentIndex < questions.length - 1
                      ? `${t('lesson.next')} →`
                      : t('lesson.finish')
                  }
                  onPress={handleNextQuestion}
                  variant="primary"
                  style={styles.nextFeedbackBtn}
                  textStyle={styles.nextFeedbackBtnText}
                />
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>

      {/* Correct-answer green flash + floating coin award */}
      <Animated.View pointerEvents="none" style={[styles.correctFlash, { opacity: flashAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.28] }) }]} />
      <CoinBurst amount={COINS_PER_CORRECT} trigger={coinBurst} />

      {/* Victory / game-over popup */}
      {(() => {
        const total =
          gameType === 'memory-match' ? Math.floor(memoryCards.length / 2) : gameType === 'picture-puzzle' ? 10 : questions.length;
        const stars = getRoundStars(score, total, outOfLives);
        return (
          <KidModal
            visible={isGameOver}
            emblem={outOfLives ? '💪' : stars === 3 ? '🏆' : '🌟'}
            tone={outOfLives ? 'coral' : 'sun'}
            sparkles
            onClose={() => router.replace('/games')}
            title={
              outOfLives
                ? language === 'gu'
                  ? 'સરસ પ્રયત્ન!'
                  : language === 'hi'
                  ? 'बहुत अच्छी कोशिश!'
                  : 'Great try!'
                : t('games.gameOver')
            }
          >
            <View style={[styles.victoryScoreCard, clayShadow(1)]}>
              <View
                style={[styles.victoryStars, { flexDirection: 'row', justifyContent: 'center', gap: 4 }]}
                accessibilityLabel={`${stars} of 3 stars`}
              >
                {[0, 1, 2].map((i) => (
                  <View key={i} style={i >= stars ? styles.victoryStarsOff : null}>
                    <Art.StarArt size={40} />
                  </View>
                ))}
              </View>
              <StarMeter value={total > 0 ? score / total : 0} label={`${formatNumberDigits(score, language)} / ${formatNumberDigits(total, language)}`} />
              <Text style={styles.victorySub}>{t('games.earnedScore', { score: formatNumberDigits(score, language), total: formatNumberDigits(total, language) })}</Text>
            </View>
            {coinsEarned > 0 ? (
              <View style={styles.victoryCoins}>
                <GoldCoinStack size={26} />
                <Text style={styles.victoryCoinsText}>+{formatNumberDigits(coinsEarned, language)}</Text>
              </View>
            ) : null}
            {outOfLives ? (
              <Text style={styles.victoryHint}>
                {language === 'gu'
                  ? 'દિલ ખતમ થઈ ગયા. ફરી રમીને વધુ તારા જીતો!'
                  : language === 'hi'
                  ? 'दिल खत्म हो गए। फिर से खेलकर और तारे जीतें!'
                  : 'Out of hearts. Play again to win more stars!'}
              </Text>
            ) : null}
            <View style={styles.modalBtnRow}>
              <ClayButton
                tone="mint"
                size="lg"
                icon={<Glyph name="replay" size={20} color={kidTones.mint.onFill} />}
                title={t('games.playAgain')}
                textStyle={{ color: kidTones.mint.onFill }}
                onPress={initGame}
                style={styles.victoryBtn}
              />
              {nextGameRoute ? (
                <ClayButton
                  tone="lavender"
                  size="lg"
                  icon={<Glyph name="next" size={20} />}
                  title={language === 'gu' ? 'આગલી રમત' : language === 'hi' ? 'अगला खेल' : 'Next Game'}
                  onPress={() => router.replace(nextGameRoute)}
                  style={styles.victoryBtn}
                />
              ) : null}
            </View>
            <ClayButton
              tone="white"
              size="sm"
              icon={<Art.GamepadArt size={23} />}
              title={t('games.title')}
              textStyle={{ color: kidPalette.inkSoft }}
              onPress={() => router.replace('/games')}
              style={{ alignSelf: 'center', minWidth: 180 }}
            />
          </KidModal>
        );
      })()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  hud: {
    backgroundColor: kidPalette.surface,
    borderRadius: kidRadii.card,
    borderWidth: 2,
    borderColor: kidPalette.softBorder,
    borderBottomWidth: 6,
    borderBottomColor: '#E5E7EB',
    padding: 12,
    gap: 10,
    marginBottom: spacing.lg,
  },
  hudTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hudMode: {
    fontSize: 22,
  },
  hudCoins: {
    marginLeft: 'auto',
    backgroundColor: kidTones.sun.fill,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderBottomWidth: 3,
    borderBottomColor: kidTones.sun.edge,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hudCoinsText: {
    fontSize: 15,
    fontWeight: '900',
    color: kidTones.sun.onFill,
  },
  hudScore: {
    backgroundColor: kidTones.lavender.fill,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderBottomWidth: 3,
    borderBottomColor: kidTones.lavender.edge,
  },
  hudScoreText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  correctFlash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: kidTones.mint.fill,
  },
  victoryScoreCard: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
    backgroundColor: kidBackdrops.cream,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: kidPalette.softBorder,
    padding: 14,
  },
  victoryBtn: {
    flexGrow: 1,
    flexBasis: 140,
  },
  victoryCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: kidBackdrops.cream,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: kidPalette.softBorder,
    borderBottomWidth: 8,
    borderBottomColor: '#F2D7A6',
    padding: 24,
    alignItems: 'center',
    gap: 10,
    overflow: 'hidden',
  },
  victoryBadge: {
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 3,
    borderBottomWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  victoryTrophy: {
    fontSize: 62,
  },
  victoryTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: kidPalette.ink,
    textAlign: 'center',
  },
  victoryStars: {
    marginBottom: 2,
  },
  victoryStarsOff: {
    opacity: 0.2,
  },
  victorySub: {
    fontSize: 16,
    fontWeight: '700',
    color: kidPalette.inkMuted,
    textAlign: 'center',
  },
  victoryCoins: {
    backgroundColor: kidTones.sun.fill,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 5,
    borderBottomColor: kidTones.sun.edge,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    alignSelf: 'center',
  },
  victoryCoinsText: {
    fontSize: 22,
    fontWeight: '900',
    color: kidTones.sun.onFill,
  },
  victoryHint: {
    fontSize: 14,
    fontWeight: '700',
    color: kidTones.coral.text,
    textAlign: 'center',
  },
  container: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  gameContent: {
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
  },
  balloonPromptCard: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    borderWidth: 2,
    borderRadius: 26,
    paddingTop: spacing.md,
  },
  balloonSkyBanner: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#7DD3FC',
  },
  balloonSkyBannerText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0369A1',
    letterSpacing: 0.5,
  },
  balloonPromptText: {
    fontSize: 22,
    color: '#0C4A6E',
  },
  balloonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  balloonWrapper: {
    width: '45%',
    maxWidth: 150,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  balloonBody: {
    width: 125,
    height: 148,
    borderTopLeftRadius: 62,
    borderTopRightRadius: 62,
    borderBottomLeftRadius: 52,
    borderBottomRightRadius: 52,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderBottomWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 6,
  },
  balloonGlossShine: {
    position: 'absolute',
    top: 14,
    left: 18,
    width: 13,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    transform: [{ rotate: '-28deg' }],
  },
  balloonText: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 3,
  },
  balloonTextSmall: {
    fontSize: 18,
    fontWeight: '800',
  },
  balloonBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1.5,
    borderColor: '#FCD34D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  balloonBadgeText: {
    fontSize: 14,
    fontWeight: '800',
  },
  balloonKnot: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 10,
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  balloonString: {
    width: 2,
    height: 26,
    backgroundColor: '#94A3B8',
    borderRadius: 1,
    marginTop: 0,
  },
  promptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  promptText: {
    fontSize: 21,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  gameImageBox: {
    width: 140,
    height: 140,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginVertical: spacing.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  gameImage: {
    width: '100%',
    height: '100%',
  },
  visualBox: {
    minWidth: 100,
    minHeight: 80,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#F5EEFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
    alignSelf: 'center',
  },
  visualText: {
    fontSize: 42,
    textAlign: 'center',
    fontFamily: Platform.select({
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif',
      default: undefined,
    }),
  },
  sequenceContainer: {
    marginVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  sequenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  sequenceTileCard: {
    width: 68,
    height: 76,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderBottomWidth: 4,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sequenceTileText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
  },
  sequenceSlotCard: {
    width: 68,
    height: 76,
    borderRadius: 20,
    backgroundColor: '#FAF5FF',
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: '#C084FC',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sequenceSlotText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#7C3AED',
    textAlign: 'center',
  },
  sequenceSlotCorrect: {
    backgroundColor: '#DCFCE7',
    borderColor: '#22C55E',
    borderStyle: 'solid',
  },
  sequenceSlotTextCorrect: {
    color: '#15803D',
  },
  sequenceSlotWrong: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
    borderStyle: 'solid',
  },
  sequenceSlotTextWrong: {
    color: '#B91C1C',
  },
  counterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.md,
    maxWidth: 360,
    alignSelf: 'center',
  },
  counterItem: {
    fontSize: 42,
    margin: 4,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  optionCard: {
    width: '47%',
    minHeight: 84,
    borderRadius: (typeof kidRadii !== 'undefined' && kidRadii?.card) ? kidRadii.card : 24,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderWidth: 1.5,
    // Chunky claymorphic 3D lip
    borderBottomWidth: 6,
    borderColor: (typeof kidPalette !== 'undefined' && kidPalette?.border) ? kidPalette.border : '#E2E8F0',
    borderBottomColor: '#CBD5E1',
    backgroundColor: (typeof kidPalette !== 'undefined' && kidPalette?.surface) ? kidPalette.surface : '#FFFFFF',
    ...(typeof clayShadow === 'function' ? clayShadow(1) : {}),
  },
  optionContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  optionColorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.15)',
  },
  optionSelected: {
    borderColor: kidTones.sky.fill,
    borderBottomColor: kidTones.sky.edge,
    backgroundColor: kidTones.sky.tint,
  },
  optionVisual: {
    fontSize: 28,
    marginBottom: 4,
  },
  optionLabel: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
  },
  feedbackBanner: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    width: '100%',
  },
  nextFeedbackBtn: {
    marginTop: spacing.md,
    width: 220,
    maxWidth: '90%',
    alignSelf: 'center',
  },
  nextFeedbackBtnText: {
    textAlign: 'center',
    width: '100%',
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  hintText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  memoryContainer: {
    alignItems: 'center',
    width: '100%',
  },
  memoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: spacing.md,
    maxWidth: 360,
    alignSelf: 'center',
  },
  memoryCard: {
    width: 68,
    height: 78,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  memoryCardBack: {
    backgroundColor: colors.skyBlue,
  },
  memoryCardFlipped: {
    backgroundColor: colors.card,
    borderColor: colors.accent,
  },
  memoryCardText: {
    fontSize: 28,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    padding: spacing.xxl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  modalTrophy: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  // Picture Puzzle Styles
  puzzleContainer: {
    width: '100%',
    alignItems: 'center',
  },
  puzzleModeSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  puzzleModePill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.full,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  puzzleModePillActive: {
    backgroundColor: colors.yellow,
    borderColor: colors.warning,
  },
  puzzleModePillText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  puzzleModePillTextActive: {
    color: colors.textPrimary,
  },
  puzzleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
    gap: spacing.sm,
  },
  puzzleTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  puzzlePeekBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    backgroundColor: colors.skyBlue,
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  puzzlePeekBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  puzzlePeekCard: {
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: radii.card,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  puzzlePeekImage: {
    width: 130,
    height: 130,
    borderRadius: radii.md,
    marginBottom: spacing.xs,
  },
  puzzlePeekHint: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  puzzleBoard: {
    backgroundColor: '#EDE9FE',
    borderRadius: radii.card,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: spacing.md,
    borderWidth: 3,
    borderColor: '#DDD6FE',
    alignSelf: 'center',
  },
  puzzleBoardSolved: {
    borderColor: '#10B981',
    borderWidth: 3,
  },
  puzzlePiece: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: '#DDD6FE',
  },
  puzzlePieceSelected: {
    borderWidth: 3,
    borderColor: '#F59E0B',
    zIndex: 10,
    elevation: 8,
  },
  pieceWatermark: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieceWatermarkText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  puzzleSuccessCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderRadius: radii.card,
    padding: spacing.lg,
    alignItems: 'center',
    marginVertical: spacing.md,
    width: '100%',
  },
  puzzleSuccessStars: {
    marginBottom: spacing.xs,
  },
  puzzleSuccessTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#065F46',
    textAlign: 'center',
  },
  puzzleSuccessSub: {
    fontSize: 14,
    color: '#047857',
    textAlign: 'center',
    marginTop: 4,
  },
  puzzleActionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
    marginTop: spacing.md,
  },
  puzzleActionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radii.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  puzzleActionBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },

  // Find the Correct Object Styles
  findObjectContainer: {
    width: '100%',
  },
  findObjectProgressBox: {
    width: '100%',
    marginBottom: spacing.md,
  },
  findObjectProgressTrack: {
    width: '100%',
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  findObjectProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: radii.full,
  },
  findObjectProgressText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'right',
  },
  findObjectPromptCard: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  findObjectPromptText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  findObjectVisualCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  findObjectVisualEmoji: {
    fontSize: 40,
  },
  findObjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  findObjectCard: {
    width: '47%',
    minHeight: 110,
    borderRadius: radii.card,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  findObjectCardEmoji: {
    fontSize: 42,
    marginBottom: spacing.xs,
  },
  findObjectCardLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
