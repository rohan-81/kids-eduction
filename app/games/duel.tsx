import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/colors';
import { spacing, radii, shadows } from '../../src/theme/spacing';
import { useApp } from '../../src/context/AppContext';
import { soundEffects } from '../../src/services/soundEffects';
import { audioService } from '../../src/services/audioService';
import { formatNumberDigits } from '../../src/utils/languageData';
import { evaluateDuelAnswer, createDuelRoundController } from '../../src/utils/duelRound';
import { CARTOON_BATTLE_IMAGE } from '../../src/utils/imageHelper';
import { EmojiArt, splitEmojiLabel } from '../../src/components/art3d/ContentArt';
import { StarArt, TrophyArt } from '../../src/components/art3d/Art3D';
import { Glyph } from '../../src/components/fun';
import { AppGlobalBackground } from '../../src/components/common/AppGlobalBackground';

interface DuelQuestion {
  promptGu: string;
  promptHi: string;
  promptEn: string;
  symbol: string;
  options: Array<{ id: string; textGu: string; textHi: string; textEn: string; isCorrect: boolean }>;
}

const DUEL_QUESTIONS: DuelQuestion[] = [
  {
    promptGu: 'આમાંથી "સિંહ" કયો છે?',
    promptHi: 'इनमें से "शेर" कौन सा है?',
    promptEn: 'Which animal is the "Lion"?',
    symbol: '👑',
    options: [
      { id: '1', textGu: 'સિંહ 🦁', textHi: 'शेर 🦁', textEn: 'Lion 🦁', isCorrect: true },
      { id: '2', textGu: 'હાથી 🐘', textHi: 'हाथी 🐘', textEn: 'Elephant 🐘', isCorrect: false },
      { id: '3', textGu: 'વાંદરો 🐒', textHi: 'बंदर 🐒', textEn: 'Monkey 🐒', isCorrect: false },
      { id: '4', textGu: 'હરણ 🦌', textHi: 'हिरण 🦌', textEn: 'Deer 🦌', isCorrect: false },
    ],
  },
  {
    promptGu: 'સરવાળો કરો: ૩ + ૨ = ?',
    promptHi: 'जोड़ करें: ३ + २ = ?',
    promptEn: 'Add: 3 + 2 = ?',
    symbol: '➕',
    options: [
      { id: '1', textGu: '૪ (ચાર)', textHi: '४ (चार)', textEn: '4 (Four)', isCorrect: false },
      { id: '2', textGu: '૫ (પાંચ)', textHi: '५ (पांच)', textEn: '5 (Five)', isCorrect: true },
      { id: '3', textGu: '૬ (છ)', textHi: '६ (छह)', textEn: '6 (Six)', isCorrect: false },
      { id: '4', textGu: '૩ (ત્રણ)', textHi: '३ (तीन)', textEn: '3 (Three)', isCorrect: false },
    ],
  },
  {
    promptGu: '"ક" થી શું શરૂ થાય છે?',
    promptHi: '"क" से क्या शुरू होता है?',
    promptEn: 'What starts with the letter "K"?',
    symbol: '🔤',
    options: [
      { id: '1', textGu: 'કમળ 🌸', textHi: 'कमल 🌸', textEn: 'Kangaroo 🦘', isCorrect: true },
      { id: '2', textGu: 'ખિસકોલી 🐿️', textHi: 'गिलहरी 🐿️', textEn: 'Squirrel 🐿️', isCorrect: false },
      { id: '3', textGu: 'ગાય 🐄', textHi: 'गाय 🐄', textEn: 'Cow 🐄', isCorrect: false },
      { id: '4', textGu: 'ચકલી 🐦', textHi: 'चिड़िया 🐦', textEn: 'Sparrow 🐦', isCorrect: false },
    ],
  },
  {
    promptGu: 'આમાંથી લાલ રંગનું "સફરજન" કયું છે?',
    promptHi: 'इनमें से लाल "सेब" कौन सा है?',
    promptEn: 'Which fruit is a red "Apple"?',
    symbol: '🍎',
    options: [
      { id: '1', textGu: 'કેરી 🥭', textHi: 'आम 🥭', textEn: 'Mango 🥭', isCorrect: false },
      { id: '2', textGu: 'કેળું 🍌', textHi: 'केला 🍌', textEn: 'Banana 🍌', isCorrect: false },
      { id: '3', textGu: 'સફરજન 🍎', textHi: 'सेब 🍎', textEn: 'Apple 🍎', isCorrect: true },
      { id: '4', textGu: 'દ્રાક્ષ 🍇', textHi: 'अंगूर 🍇', textEn: 'Grapes 🍇', isCorrect: false },
    ],
  },
  {
    promptGu: 'ગુણાકાર કરો: ૨ × ૪ = ?',
    promptHi: 'गुणा करें: २ × ४ = ?',
    promptEn: 'Calculate: 2 × 4 = ?',
    symbol: '✖️',
    options: [
      { id: '1', textGu: '૮ (આઠ)', textHi: '८ (आठ)', textEn: '8 (Eight)', isCorrect: true },
      { id: '2', textGu: '૬ (છ)', textHi: '६ (छह)', textEn: '6 (Six)', isCorrect: false },
      { id: '3', textGu: '૧૦ (દસ)', textHi: '१० (दस)', textEn: '10 (Ten)', isCorrect: false },
      { id: '4', textGu: '૪ (ચાર)', textHi: '४ (चार)', textEn: '4 (Four)', isCorrect: false },
    ],
  },
  {
    promptGu: '"A" થી શું શરૂ થાય છે?',
    promptHi: '"A" से क्या शुरू होता है?',
    promptEn: 'Which word starts with "A"?',
    symbol: '🅰️',
    options: [
      { id: '1', textGu: 'Apple 🍎 (સફરજન)', textHi: 'Apple 🍎 (सेब)', textEn: 'Apple 🍎', isCorrect: true },
      { id: '2', textGu: 'Ball ⚽ (દડો)', textHi: 'Ball ⚽ (गेंद)', textEn: 'Ball ⚽', isCorrect: false },
      { id: '3', textGu: 'Cat 🐱 (બિલાડી)', textHi: 'Cat 🐱 (बिल्ली)', textEn: 'Cat 🐱', isCorrect: false },
      { id: '4', textGu: 'Duck 🦆 (બતક)', textHi: 'Duck 🦆 (बत्तख)', textEn: 'Duck 🦆', isCorrect: false },
    ],
  },
  {
    promptGu: 'આકાશમાં ઉડતું પક્ષી કયું છે?',
    promptHi: 'आकाश में उड़ने वाला पक्षी कौन सा है?',
    promptEn: 'Which beautiful bird flies in the sky?',
    symbol: '🦚',
    options: [
      { id: '1', textGu: 'માછલી 🐟', textHi: 'मछली 🐟', textEn: 'Fish 🐟', isCorrect: false },
      { id: '2', textGu: 'મોર 🦚', textHi: 'मोर 🦚', textEn: 'Peacock 🦚', isCorrect: true },
      { id: '3', textGu: 'દેડકો 🐸', textHi: 'मेंढक 🐸', textEn: 'Frog 🐸', isCorrect: false },
      { id: '4', textGu: 'કાચબો 🐢', textHi: 'कछुआ 🐢', textEn: 'Turtle 🐢', isCorrect: false },
    ],
  },
  {
    promptGu: 'બાદબાકી કરો: ૫ - ૨ = ?',
    promptHi: 'घटाव करें: ५ - २ = ?',
    promptEn: 'Subtract: 5 - 2 = ?',
    symbol: '➖',
    options: [
      { id: '1', textGu: '૨ (બે)', textHi: '२ (दो)', textEn: '2 (Two)', isCorrect: false },
      { id: '2', textGu: '૩ (ત્રણ)', textHi: '३ (तीन)', textEn: '3 (Three)', isCorrect: true },
      { id: '3', textGu: '૪ (ચાર)', textHi: '४ (चार)', textEn: '4 (Four)', isCorrect: false },
      { id: '4', textGu: '૧ (એક)', textHi: '१ (एक)', textEn: '1 (One)', isCorrect: false },
    ],
  },
  {
    promptGu: '"ગોળ" આકાર કયો છે?',
    promptHi: '"गोल" आकार कौन सा है?',
    promptEn: 'Which object has a "Circle" shape?',
    symbol: '⭕',
    options: [
      { id: '1', textGu: 'દડો ⚽ (ગોળ)', textHi: 'गेंद ⚽ (गोल)', textEn: 'Ball ⚽ (Circle)', isCorrect: true },
      { id: '2', textGu: 'પેટી 📦 (ચોરસ)', textHi: 'डिब्बा 📦 (चौकोर)', textEn: 'Box 📦 (Square)', isCorrect: false },
      { id: '3', textGu: 'સમોસું 🔺 (ત્રિકોણ)', textHi: 'समोसा 🔺 (त्रिकोण)', textEn: 'Samosa 🔺 (Triangle)', isCorrect: false },
      { id: '4', textGu: 'દરવાજો 🚪 (લંબચોરસ)', textHi: 'दरवाजा 🚪 (आयत)', textEn: 'Door 🚪 (Rectangle)', isCorrect: false },
    ],
  },
  {
    promptGu: 'આમાંથી પીળો રંગ કયો છે?',
    promptHi: 'इनमें से पीला रंग कौन सा है?',
    promptEn: 'Which fruit is naturally "Yellow"?',
    symbol: '🍌',
    options: [
      { id: '1', textGu: 'પાકું કેળું 🍌', textHi: 'पका केला 🍌', textEn: 'Ripe Banana 🍌', isCorrect: true },
      { id: '2', textGu: 'સફરજન 🍎', textHi: 'लाल सेब 🍎', textEn: 'Red Apple 🍎', isCorrect: false },
      { id: '3', textGu: 'જાંબુ 🍇', textHi: 'जामुन 🍇', textEn: 'Grapes 🍇', isCorrect: false },
      { id: '4', textGu: 'તરબૂચ 🍉', textHi: 'तरबूज 🍉', textEn: 'Watermelon 🍉', isCorrect: false },
    ],
  },
  {
    promptGu: 'ઘડિયા: ૩ × ૩ = ?',
    promptHi: 'पहाड़े: ३ × ३ = ?',
    promptEn: 'Multiply: 3 × 3 = ?',
    symbol: '✖️',
    options: [
      { id: '1', textGu: '૬ (છ)', textHi: '६ (छह)', textEn: '6 (Six)', isCorrect: false },
      { id: '2', textGu: '૯ (નવ)', textHi: '९ (नौ)', textEn: '9 (Nine)', isCorrect: true },
      { id: '3', textGu: '૮ (આઠ)', textHi: '८ (आठ)', textEn: '8 (Eight)', isCorrect: false },
      { id: '4', textGu: '૧૨ (બાર)', textHi: '१२ (बारह)', textEn: '12 (Twelve)', isCorrect: false },
    ],
  },
  {
    promptGu: 'પાણીમાં તરતી જીવંત "માછલી" કઈ છે?',
    promptHi: 'पानी में तैरने वाली "मछली" कौन सी है?',
    promptEn: 'Which animal swims in the water?',
    symbol: '🌊',
    options: [
      { id: '1', textGu: 'બિલાડી 🐱', textHi: 'बिल्ली 🐱', textEn: 'Cat 🐱', isCorrect: false },
      { id: '2', textGu: 'માછલી 🐠', textHi: 'मछली 🐠', textEn: 'Fish 🐠', isCorrect: true },
      { id: '3', textGu: 'કૂતરો 🐶', textHi: 'कुत्ता 🐶', textEn: 'Dog 🐶', isCorrect: false },
      { id: '4', textGu: 'સિંહ 🦁', textHi: 'शेर 🦁', textEn: 'Lion 🦁', isCorrect: false },
    ],
  },
];

export default function DuelGameScreen() {
  const router = useRouter();
  const { language, addCoins, isGuest } = useApp();

  const [currentRound, setCurrentRound] = useState(0);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [p1Locked, setP1Locked] = useState(false);
  const [p2Locked, setP2Locked] = useState(false);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const roundCompletedRef = useRef(false);
  const p1LockedRef = useRef(false);
  const p2LockedRef = useRef(false);
  const [p1Feedback, setP1Feedback] = useState<'correct' | 'wrong' | null>(null);
  const [p2Feedback, setP2Feedback] = useState<'correct' | 'wrong' | null>(null);
  const [isFaceToFace, setIsFaceToFace] = useState(true);
  const [isSwapped, setIsSwapped] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Round counter + feedback-pause timer live in a controller (src/utils/duelRound.ts), not in
  // React state: Reset/Exit during the pause can't leak into the next game, game over fires once.
  const roundHandlersRef = useRef({
    onRoundStart: (_round: number) => {},
    onGameOver: () => {},
  });
  roundHandlersRef.current = {
    onRoundStart: (round: number) => {
      clearRoundLocks();
      setCurrentRound(round);
    },
    onGameOver: () => {
      clearRoundLocks();
      setIsGameOver(true);
      soundEffects.playTadaaa();
      addCoins(20);
    },
  };
  const roundControllerRef = useRef<ReturnType<typeof createDuelRoundController> | null>(null);
  if (roundControllerRef.current === null) {
    roundControllerRef.current = createDuelRoundController(DUEL_QUESTIONS.length, 1200, {
      onRoundStart: (round) => roundHandlersRef.current.onRoundStart(round),
      onGameOver: () => roundHandlersRef.current.onGameOver(),
    });
  }
  const roundController = roundControllerRef.current;

  const cancelAdvanceTimer = () => roundController.cancel();

  function clearRoundLocks() {
    roundCompletedRef.current = false;
    p1LockedRef.current = false;
    p2LockedRef.current = false;
    setP1Feedback(null);
    setP2Feedback(null);
    setP1Locked(false);
    setP2Locked(false);
    setRoundCompleted(false);
  }

  useEffect(() => {
    return () => {
      roundControllerRef.current?.cancel();
      audioService.stop();
      soundEffects.stopAnimalSound();
    };
  }, []);

  // Silence all audio immediately when this screen loses focus or user navigates to another page
  useFocusEffect(
    useCallback(() => {
      // Returning to a still-mounted duel: if the feedback pause was cut short by blur, resume
      // it, otherwise both players would stay locked on the answered question forever.
      const controller = roundControllerRef.current;
      if (controller && roundCompletedRef.current && !controller.hasPendingAdvance && !controller.isFinished) {
        controller.scheduleAdvance();
      }
      return () => {
        roundControllerRef.current?.cancel();
        audioService.stop();
        soundEffects.stopAnimalSound();
      };
    }, [])
  );

  const question = DUEL_QUESTIONS[currentRound] || DUEL_QUESTIONS[0];

  const promptText =
    language === 'gu'
      ? question.promptGu
      : language === 'hi'
      ? question.promptHi
      : question.promptEn;

  const pointsText = language === 'gu' ? '+૧૦!' : language === 'hi' ? '+१०!' : '+10!';

  const handleP1Answer = (isCorrect: boolean) => {
    const res = evaluateDuelAnswer(1, isCorrect, {
      p1Locked: p1LockedRef.current,
      p2Locked: p2LockedRef.current,
      roundCompleted: roundCompletedRef.current,
      p1Score,
      p2Score,
    });
    if (res.ignored) return;

    p1LockedRef.current = res.nextState.p1Locked;
    p2LockedRef.current = res.nextState.p2Locked;
    roundCompletedRef.current = res.nextState.roundCompleted;

    if (res.feedback === 'correct') {
      soundEffects.playCorrectSound();
      setP1Score(res.nextState.p1Score);
      setP1Feedback('correct');
      roundCompletedRef.current = true;
      setRoundCompleted(true);
      advanceRound();
    } else {
      soundEffects.playWrongSound();
      setP1Feedback('wrong');
      setP1Locked(true);
      if (res.shouldAdvance) {
        setRoundCompleted(true);
        advanceRound();
      }
    }
  };

  const handleP2Answer = (isCorrect: boolean) => {
    const res = evaluateDuelAnswer(2, isCorrect, {
      p1Locked: p1LockedRef.current,
      p2Locked: p2LockedRef.current,
      roundCompleted: roundCompletedRef.current,
      p1Score,
      p2Score,
    });
    if (res.ignored) return;

    p1LockedRef.current = res.nextState.p1Locked;
    p2LockedRef.current = res.nextState.p2Locked;
    roundCompletedRef.current = res.nextState.roundCompleted;

    if (res.feedback === 'correct') {
      soundEffects.playCorrectSound();
      setP2Score(res.nextState.p2Score);
      setP2Feedback('correct');
      roundCompletedRef.current = true;
      setRoundCompleted(true);
      advanceRound();
    } else {
      soundEffects.playWrongSound();
      setP2Feedback('wrong');
      setP2Locked(true);
      if (res.shouldAdvance) {
        setRoundCompleted(true);
        advanceRound();
      }
    }
  };

  const advanceRound = () => {
    roundController.scheduleAdvance();
  };

  const resetGame = () => {
    roundController.reset();
    soundEffects.playBubblePop();
    roundCompletedRef.current = false;
    p1LockedRef.current = false;
    p2LockedRef.current = false;
    setCurrentRound(0);
    setP1Score(0);
    setP2Score(0);
    setP1Locked(false);
    setP2Locked(false);
    setRoundCompleted(false);
    setP1Feedback(null);
    setP2Feedback(null);
    setIsGameOver(false);
  };

  const handleExit = () => {
    cancelAdvanceTimer();
    soundEffects.playBubblePop();
    audioService.stop();
    try {
      if (router.canGoBack()) {
        router.back();
        return;
      }
    } catch {
      // fallback
    }
    router.replace('/games');
  };

  const getOptionLabel = (opt: DuelQuestion['options'][0]) => {
    if (language === 'gu') return opt.textGu;
    if (language === 'hi') return opt.textHi;
    return opt.textEn;
  };

  const renderPlayerZone = (playerNum: 1 | 2, isTop: boolean) => {
    const isP1 = playerNum === 1;
    const score = isP1 ? p1Score : p2Score;
    const feedback = isP1 ? p1Feedback : p2Feedback;
    const locked = isP1 ? p1Locked : p2Locked;
    const handleAnswer = isP1 ? handleP1Answer : handleP2Answer;
    const avatar = isP1 ? '🐻' : '🐯';
    const avatarBg = isP1 ? '#F97316' : '#38BDF8';
    const zoneStyle = isP1 ? styles.p1Zone : styles.p2Zone;
    const optBtnStyle = isP1 ? styles.p1OptionBtn : styles.p2OptionBtn;
    const playerName = isP1
      ? language === 'gu'
        ? 'પ્લેયર ૧ (બાળક)'
        : language === 'hi'
        ? 'प्लेयर १ (बच्चा)'
        : 'Player 1 (Champion 1)'
      : language === 'gu'
      ? 'પ્લેયર ૨ (મિત્ર/વાલી)'
      : language === 'hi'
      ? 'प्लेयर २ (मित्र/अभिभावक)'
      : 'Player 2 (Champion 2)';

    const headerNode = (
      <View key="header" style={styles.playerHeader}>
        <View style={styles.playerInfoRow}>
          <View style={[styles.avatarBadge, { backgroundColor: avatarBg }]}>
            <EmojiArt emoji={avatar} size={30} />
          </View>
          <View>
            <Text style={styles.playerName}>{playerName}</Text>
            <Text style={styles.playerScoreText}>
              {formatNumberDigits(score, language)}{' '}
              {language === 'gu' ? 'પોઇન્ટ્સ' : language === 'hi' ? 'पॉइंट्स' : 'pts'}
            </Text>
          </View>
        </View>
        {feedback === 'correct' && (
          <View style={styles.optionInner}>
            <StarArt size={22} />
            <Text style={styles.feedbackEmoji}>{pointsText}</Text>
          </View>
        )}
        {feedback === 'wrong' && (
          <Text style={styles.feedbackEmoji}>
            {language === 'gu' ? 'ખોટો જવાબ' : language === 'hi' ? 'गलत' : 'Try Again!'}
          </Text>
        )}
      </View>
    );

    const optionsNode = (
      <View key="options" style={styles.optionsGrid}>
        {question.options.map((opt) => {
          const isRevealedCorrect = roundCompleted && opt.isCorrect;
          return (
            <TouchableOpacity
              key={`p${playerNum}-${opt.id}`}
              style={[
                styles.optionBtn,
                optBtnStyle,
                isRevealedCorrect && styles.correctOptionBtn,
                locked && styles.disabledOptionBtn,
              ]}
              onPress={() => handleAnswer(opt.isCorrect)}
              disabled={locked || roundCompleted}
              activeOpacity={0.7}
            >
              {(() => {
                const { label, emoji } = splitEmojiLabel(getOptionLabel(opt));
                return (
                  <View style={styles.optionInner}>
                    <EmojiArt emoji={emoji} size={34} />
                    <Text style={styles.optionBtnText}>{label}</Text>
                  </View>
                );
              })()}
            </TouchableOpacity>
          );
        })}
      </View>
    );

    // In Opposite mode (Face-to-Face):
    // Top player is rotated 180deg.
    // BOTH top and bottom zones put optionsGrid closest to the center banner!
    // For top zone (rotated 180deg): optionsGrid first, then headerNode (so optionsGrid is adjacent to center banner, and headerNode is at top edge).
    // For bottom zone (upright): optionsGrid first, then headerNode (optionsGrid is adjacent to center banner, headerNode is at bottom edge).
    // In Side mode:
    // Both zones are upright and BOTH have identical headerNode on top, optionsGrid below!
    const isRotated = isTop && isFaceToFace;
    const content = isFaceToFace
      ? [optionsNode, headerNode]
      : [headerNode, optionsNode];

    return (
      <View
        key={`zone-${playerNum}-${isTop ? 'top' : 'bottom'}`}
        style={[
          styles.playerZone,
          zoneStyle,
          feedback === 'correct' && styles.zoneCorrect,
          feedback === 'wrong' && styles.zoneWrong,
          isRotated && styles.faceToFaceRotate,
        ]}
      >
        {content}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppGlobalBackground id="duelBgGrad" />
      {/* Top Header / Exit & Controls */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleExit}
          activeOpacity={0.8}
        >
          <Text style={styles.backBtnText}>
            {language === 'gu' ? 'બહાર નીકળો' : language === 'hi' ? 'बाहर निकलें' : 'Exit'}
          </Text>
        </TouchableOpacity>

        <View style={styles.roundPill}>
          <Text style={styles.roundPillText}>
            {language === 'gu' ? 'રાઉન્ડ' : language === 'hi' ? 'राउंड' : 'Round'}{' '}
            {formatNumberDigits(currentRound + 1, language)} / {formatNumberDigits(DUEL_QUESTIONS.length, language)}
          </Text>
        </View>

        {/* Orientation Toggle: Opposite vs Side */}
        <TouchableOpacity
          style={[styles.modeToggleBtn, isFaceToFace && styles.modeToggleActive]}
          onPress={() => {
            soundEffects.playBubblePop();
            setIsFaceToFace((f) => !f);
          }}
          activeOpacity={0.8}
        >
          <Text style={[styles.modeToggleText, isFaceToFace && styles.modeToggleActiveText]}>
            {isFaceToFace
              ? (language === 'gu' ? 'સામસામે' : language === 'hi' ? 'आमने-सामने' : 'Opposite')
              : (language === 'gu' ? 'સાથે' : language === 'hi' ? 'साथ' : 'Side')}
          </Text>
        </TouchableOpacity>

        {/* Swap Sides / Players Button */}
        <TouchableOpacity
          style={styles.modeToggleBtn}
          onPress={() => {
            soundEffects.playBubblePop();
            setIsSwapped((s) => !s);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.modeToggleText}>
            {language === 'gu' ? 'બદલો' : language === 'hi' ? 'बदलें' : 'Swap'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resetPill}
          onPress={resetGame}
          activeOpacity={0.8}
        >
          <Glyph name="replay" size={18} color="#475569" strokeWidth={2.8} />
        </TouchableOpacity>
      </View>

      {/* DUEL ARENA: SPLIT SCREEN */}
      <View style={styles.arenaContainer}>
        {renderPlayerZone(isSwapped ? 1 : 2, true)}

        {/* CENTER QUESTION BANNER WITH 3D CARTOON BORDER */}
        <View style={styles.centerBanner}>
          <View style={styles.bannerHeaderRow}>
            <View style={styles.centerSymbol}>
              <EmojiArt emoji={question.symbol} size={36} />
            </View>
            <Text style={styles.arenaTitleBadge}>
              {language === 'gu' ? 'કોણ સૌથી પહેલા દબાવશે?' : language === 'hi' ? 'सबसे पहले कौन दबाएगा?' : 'Tap the Fastest!'}
            </Text>
          </View>
          <Text style={styles.centerPrompt}>{promptText}</Text>
        </View>

        {renderPlayerZone(isSwapped ? 2 : 1, false)}
      </View>

      {/* GAME OVER CELEBRATION MODAL */}
      {isGameOver && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, shadows.card]}>
            <Image
              source={CARTOON_BATTLE_IMAGE}
              style={styles.modalBannerImage}
              resizeMode="cover"
            />

            <View style={[styles.winnerEmoji, styles.optionInner]}>
              {p1Score === p2Score ? (
                <>
                  <EmojiArt emoji="🐻" size={56} />
                  <StarArt size={56} />
                  <EmojiArt emoji="🐯" size={56} />
                </>
              ) : (
                <>
                  <EmojiArt emoji={p1Score > p2Score ? '🐻' : '🐯'} size={64} />
                  <TrophyArt size={64} />
                </>
              )}
            </View>

            <Text style={styles.winnerTitle}>
              {p1Score > p2Score
                ? (language === 'gu' ? 'પ્લેયર ૧ (બાળક) વિજેતા બન્યા! શાબાશ!' : language === 'hi' ? 'प्लेयर १ (बच्चा) जीत गए! बहुत खूब!' : 'Player 1 Wins the Battle!')
                : p2Score > p1Score
                ? (language === 'gu' ? 'પ્લેયર ૨ વિજેતા બન્યા! અભિનંદન!' : language === 'hi' ? 'प्लेयर २ जीत गए! बधाई हो!' : 'Player 2 Wins the Battle!')
                : (language === 'gu' ? 'ટાઈ થઈ! બંને સુપરસ્ટાર છે!' : language === 'hi' ? 'टाई हुआ! दोनों सुपरस्टार हैं!' : "It's a Tie! Both are Superstars!")}
            </Text>

            <View style={styles.scoreRow}>
              <View style={[styles.scoreCol, { backgroundColor: '#FFF7ED', borderColor: '#F97316' }]}>
                <View style={styles.scoreValRow}>
                  <EmojiArt emoji="🐻" size={30} />
                  <Text style={styles.scoreVal}>{formatNumberDigits(p1Score, language)}</Text>
                </View>
                <Text style={styles.scoreSub}>{language === 'gu' ? 'પ્લેયર ૧' : language === 'hi' ? 'प्लेयर १' : 'Player 1'}</Text>
              </View>
              <Text style={styles.vsText}>VS</Text>
              <View style={[styles.scoreCol, { backgroundColor: '#F0F9FF', borderColor: '#0284C7' }]}>
                <View style={styles.scoreValRow}>
                  <EmojiArt emoji="🐯" size={30} />
                  <Text style={styles.scoreVal}>{formatNumberDigits(p2Score, language)}</Text>
                </View>
                <Text style={styles.scoreSub}>{language === 'gu' ? 'પ્લેયર ૨' : language === 'hi' ? 'प्लेयर २' : 'Player 2'}</Text>
              </View>
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.rematchBtn}
                onPress={resetGame}
                activeOpacity={0.8}
              >
                <Text style={styles.rematchBtnText}>
                  {language === 'gu' ? 'ફરી રમો' : language === 'hi' ? 'फिर से खेलें' : 'Rematch'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.homeBtn}
                onPress={handleExit}
                activeOpacity={0.8}
              >
                <Text style={styles.homeBtnText}>
                  {language === 'gu' ? 'બધી રમતો' : language === 'hi' ? 'सभी खेल' : 'All Games'}
                </Text>
              </TouchableOpacity>
            </View>

            {isGuest && (
              <View style={styles.guestDuelNote}>
                <Text style={styles.guestDuelNoteText}>
                  {language === 'gu'
                    ? 'ગેસ્ટ મોડ: આ સ્કોર અને ટ્રોફી કાયમ માટે સાચવવા મફત પેરન્ટ એકાઉન્ટ બનાવો!'
                    : language === 'hi'
                    ? 'गेस्ट मोड: इस स्कोर और ट्रॉफी को सुरक्षित रखने के लिए फ्री पैरेंट अकाउंट बनाएं!'
                    : 'Guest Mode: Create a free parent account to save trophies and scores permanently!'}
                </Text>
                <TouchableOpacity
                  style={styles.guestDuelSignUpBtn}
                  onPress={() => router.push('/register')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.guestDuelSignUpBtnText}>
                    {language === 'gu' ? 'મફત એકાઉન્ટ બનાવો' : language === 'hi' ? 'फ्री अकाउंट बनाएं' : 'Sign Up Free'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
    borderRadius: 20,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  backBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  backBtnText: {
    color: '#475569',
    fontWeight: '900',
    fontSize: 12.5,
  },
  roundPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#818CF8',
  },
  roundPillText: {
    color: '#4F46E5',
    fontWeight: '900',
    fontSize: 13,
  },
  modeToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  modeToggleActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  modeToggleText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '900',
  },
  modeToggleActiveText: {
    color: '#4F46E5',
  },
  resetPill: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  arenaContainer: {
    flex: 1,
    justifyContent: 'space-between',
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
    paddingVertical: 4,
  },

  // PLAYER ZONES (Fresh, vibrant 3D pastel aesthetics)
  playerZone: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
    borderRadius: 24,
    marginHorizontal: 10,
    marginVertical: 4,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  faceToFaceRotate: {
    transform: [{ rotate: '180deg' }],
  },
  p2Zone: {
    backgroundColor: 'rgba(239, 246, 255, 0.94)',
    borderColor: '#BFDBFE',
    borderBottomWidth: 4,
    borderBottomColor: '#93C5FD',
  },
  p1Zone: {
    backgroundColor: 'rgba(240, 253, 244, 0.94)',
    borderColor: '#BBF7D0',
    borderTopWidth: 4,
    borderTopColor: '#86EFAC',
  },
  zoneCorrect: {
    backgroundColor: 'rgba(220, 252, 231, 0.96)',
    borderColor: '#4ADE80',
  },
  zoneWrong: {
    backgroundColor: 'rgba(254, 226, 226, 0.96)',
    borderColor: '#F87171',
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  playerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  playerAvatar: {
    fontSize: 22,
  },
  playerName: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#1E293B',
  },
  playerScoreText: {
    fontSize: 12.5,
    color: '#D97706',
    fontWeight: '900',
  },
  feedbackEmoji: {
    fontSize: 16,
    fontWeight: '900',
    color: '#15803D',
  },

  // CARTOON 3D OPTIONS (Crisp tactile cards with thick 3D bottom lips)
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginVertical: 4,
  },
  optionBtn: {
    width: '48%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderBottomWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  p2OptionBtn: {
    backgroundColor: '#FFFFFF',
    borderColor: '#BFDBFE',
    borderBottomColor: '#3B82F6',
  },
  p1OptionBtn: {
    backgroundColor: '#FFFFFF',
    borderColor: '#BBF7D0',
    borderBottomColor: '#10B981',
  },
  correctOptionBtn: {
    backgroundColor: '#DCFCE7',
    borderColor: '#4ADE80',
    borderBottomColor: '#16A34A',
  },
  disabledOptionBtn: {
    opacity: 0.45,
  },
  optionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  optionBtnText: {
    color: '#1E293B',
    fontWeight: '900',
    fontSize: 14.5,
    textAlign: 'center',
  },

  // CENTER QUESTION BANNER (3D Royal Stage with Golden Trim)
  centerBanner: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    marginHorizontal: 10,
    marginVertical: 4,
    borderWidth: 2.5,
    borderColor: '#FDE047',
    borderBottomWidth: 5,
    borderBottomColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 4,
  },
  bannerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  centerSymbol: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arenaTitleBadge: {
    fontSize: 12,
    fontWeight: '900',
    color: '#D97706',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  centerPrompt: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 22,
  },

  // GAME OVER MODAL
  modalOverlay: {
    ...(StyleSheet.absoluteFill as any),
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 99,
    // Android draws elevated siblings (topBar has elevation 2) above zIndex-only views;
    // this keeps the game-over overlay on top of everything and blocks taps underneath.
    elevation: 10,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    overflow: 'hidden',
    paddingBottom: 24,
    borderWidth: 3,
    borderColor: '#FDE047',
  },
  modalBannerImage: {
    width: '100%',
    height: 140,
  },
  winnerEmoji: {
    marginTop: 10,
  },
  winnerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 16,
    width: '100%',
    paddingHorizontal: 20,
  },
  scoreCol: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 2,
  },
  scoreValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scoreVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  scoreSub: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 2,
  },
  vsText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#94A3B8',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    width: '100%',
  },
  rematchBtn: {
    flex: 1,
    backgroundColor: '#22C55E',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#15803D',
  },
  rematchBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  homeBtn: {
    flex: 1,
    backgroundColor: '#6366F1',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#4338CA',
  },
  homeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  guestDuelNote: {
    marginTop: 14,
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    width: '90%',
  },
  guestDuelNoteText: {
    fontSize: 12.5,
    color: '#92400E',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 8,
  },
  guestDuelSignUpBtn: {
    backgroundColor: '#6C5CE7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  guestDuelSignUpBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
});
