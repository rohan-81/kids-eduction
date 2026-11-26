import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Platform,
  type StyleProp,
  type ViewStyle,
  type TextStyle
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/theme/colors';
import { spacing, radii, shadows } from '../src/theme/spacing';
import { Header } from '../src/components/Header';
import { BottomNav } from '../src/components/BottomNav';
import { AppIcon } from '../src/components/AppIcon';
import { useApp } from '../src/context/AppContext';
import { soundEffects } from '../src/services/soundEffects';
import { audioService } from '../src/services/audioService';
import { ClayButton } from '../src/components/clay/ClayButton';
import { ConfettiCelebration } from '../src/components/common/ConfettiCelebration';
import { kidTones, kidPalette, claySurface, clayShadow, kidRadii } from '../src/theme/kidTheme';
import { formatNumberDigits } from '../src/utils/languageData';
import { AppGlobalBackground } from '../src/components/common/AppGlobalBackground';
import {
  TestQuestion,
  TEST_QUESTIONS,
  getRandomChallengeQuestions,
} from '../src/data/challengeData';
import * as Art from '../src/components/art3d/Art3D';
import { Glyph } from '../src/components/fun/KidIcons';
import { EmojiArt, splitEmojiLabel } from '../src/components/art3d/ContentArt';
import { GoldCoinIcon } from '../src/components/common/GoldCoinIcon';

export { TestQuestion, TEST_QUESTIONS };

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];
const OPTION_TONES: (keyof typeof kidTones)[] = ['sky', 'sun', 'lavender', 'coral'];

export default function ChallengeCertificateScreen() {
  const router = useRouter();
  const { speak, addCoins, progress, language, ageGroup, soundEnabled } = useApp();

  const [questions, setQuestions] = useState<TestQuestion[]>(() => getRandomChallengeQuestions(5, ageGroup));
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [testFinished, setTestFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);

  const isMountedRef = useRef(true);
  const isAnsweredRef = useRef(false);
  const speechTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speakRef = useRef(speak);
  speakRef.current = speak;

  const clearPendingTimers = useCallback(() => {
    if (speechTimerRef.current) {
      clearTimeout(speechTimerRef.current);
      speechTimerRef.current = null;
    }
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearPendingTimers();
    };
  }, [clearPendingTimers]);

  // Stop audio and pending transitions immediately when leaving this screen
  useFocusEffect(
    useCallback(() => {
      return () => {
        clearPendingTimers();
        audioService.stop();
        soundEffects.stopAnimalSound();
      };
    }, [clearPendingTimers])
  );

  // Every time age group changes or user restarts, generate a fresh random set of questions
  useEffect(() => {
    clearPendingTimers();
    isAnsweredRef.current = false;
    setQuestions(getRandomChallengeQuestions(5, ageGroup));
    setCurrentQIndex(0);
    setScore(0);
    setTestFinished(false);
    setSelectedOption(null);
    setIsAnswered(false);
    setFeedback(null);

    return () => {
      clearPendingTimers();
      audioService.stop();
      soundEffects.stopAnimalSound();
    };
  }, [ageGroup, clearPendingTimers]);

  // Auto-play question audio when question index changes or test starts
  useEffect(() => {
    if (testFinished || !questions || questions.length === 0) return;

    // Stop any leftover speech or feedback immediately
    audioService.stop();

    const activeQ = questions[currentQIndex] || TEST_QUESTIONS[0];
    if (!activeQ) return;

    const promptText =
      language === 'hi'
        ? activeQ.promptHi
        : language === 'en'
        ? activeQ.promptEn
        : activeQ.promptGu;

    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        speakRef.current(promptText, language);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      audioService.stop();
    };
  }, [currentQIndex, testFinished, language, questions]);

  const defaultChildName =
    [progress.firstName, progress.lastName].filter(Boolean).join(' ') ||
    progress.childName ||
    (language === 'gu' ? 'બાળમિત્ર' : language === 'hi' ? 'बालमित्र' : 'Little Champion');

  const [childName, setChildName] = useState(defaultChildName);

  const totalQuestions = questions.length || 5;
  const q = questions[currentQIndex] || questions[0] || TEST_QUESTIONS[0];

  const currentOptions =
    language === 'hi' ? q.optionsHi : language === 'en' ? q.optionsEn : q.optionsGu;
  const currentCorrectAnswer =
    language === 'hi'
      ? q.correctAnswerHi
      : language === 'en'
      ? q.correctAnswerEn
      : q.correctAnswerGu;

  const handleSelectOption = (opt: string) => {
    if (isAnsweredRef.current || isAnswered) return; // Prevent double taps
    isAnsweredRef.current = true;

    // Stop question audio and any stale timers when child answers
    clearPendingTimers();
    audioService.stop();

    setIsAnswered(true);
    setSelectedOption(opt);

    const isCorrect = opt === currentCorrectAnswer;
    let feedbackText: string;
    if (isCorrect) {
      soundEffects.playCorrectSound();
      setScore((prev) => prev + 1);
      feedbackText =
        language === 'gu'
          ? 'સાચો જવાબ! શાબાશ!'
          : language === 'hi'
          ? 'सही जवाब! शाबाश!'
          : 'Correct Answer! Great Job!';
      setFeedback({ isCorrect: true, text: feedbackText });
    } else {
      soundEffects.playBuzzer();
      feedbackText =
        language === 'gu'
          ? 'ફરીથી પ્રયત્ન કરો!'
          : language === 'hi'
          ? 'फिर से कोशिश करें!'
          : 'Try again!';
      setFeedback({ isCorrect: false, text: feedbackText });
    }

    let hasAdvanced = false;
    const advanceSafely = () => {
      if (!isMountedRef.current || hasAdvanced) return;
      hasAdvanced = true;
      clearPendingTimers();

      isAnsweredRef.current = false;
      setSelectedOption(null);
      setIsAnswered(false);
      setFeedback(null);

      if (currentQIndex < totalQuestions - 1) {
        setCurrentQIndex((prev) => prev + 1);
      } else {
        // Test finished!
        soundEffects.playTadaaa();
        setTestFinished(true);
        addCoins(30);
        const praiseMsg =
          language === 'gu'
            ? 'અભિનંદન! તમે ટેસ્ટ સફળતાપૂર્વક પાસ કરી લીધી! તમારું ગોલ્ડન સર્ટિફિકેટ તૈયાર છે!'
            : language === 'hi'
            ? 'बधाई हो! आपने टेस्ट सफलतापूर्वक पास कर लिया! आपका गोल्डन प्रमाणपत्र तैयार है!'
            : 'Congratulations! You completed the challenge! Your Golden Certificate is ready!';
        speechTimerRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            speakRef.current(praiseMsg, language);
          }
        }, 250);
      }
    };

    // Wait 180ms after chime, speak full feedback, and advance ONLY after audio finishes naturally
    const postSpeechPauseMs = soundEnabled ? 550 : 1200;
    speechTimerRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      speakRef.current(feedbackText, language, () => {
        if (!isMountedRef.current || hasAdvanced) return;
        if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
        advanceTimerRef.current = setTimeout(advanceSafely, postSpeechPauseMs);
      });
    }, 180);

    // Generous safety fallback ONLY if TTS callback fails or stalls (never cuts off normal speech)
    advanceTimerRef.current = setTimeout(() => {
      audioService.stop();
      advanceSafely();
    }, 7500);
  };

  const handleRestart = () => {
    clearPendingTimers();
    isAnsweredRef.current = false;
    audioService.stop();
    soundEffects.playBubblePop();
    setQuestions(getRandomChallengeQuestions(5, ageGroup));
    setCurrentQIndex(0);
    setScore(0);
    setTestFinished(false);
    setSelectedOption(null);
    setIsAnswered(false);
    setFeedback(null);
  };

  const screenTitle =
    language === 'gu'
      ? 'ચેલેન્જ ટેસ્ટ'
      : language === 'hi'
      ? 'चैलेंज टेस्ट'
      : 'Challenge Quiz';

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppGlobalBackground id="challengeBgGrad" />
      <Header title={screenTitle} showBack={true} backHref="/home" />

      {/* Confetti celebration when test is completed */}
      <ConfettiCelebration visible={testFinished} language={language} speakPraise={false} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {!testFinished ? (
          /* ========================================================= */
          /* QUIZ IN PROGRESS - 3D CLAY AESTHETIC MATCHING HOMEPAGE     */
          /* ========================================================= */
          <View style={styles.contentWrap}>
            {/* 1. Hero Challenge Dashboard Banner */}
            <View style={[styles.heroBanner, claySurface('lavender', 2), shadows.soft]}>
              <View style={styles.heroTopRow}>
                <View style={styles.heroTitleGroup}>
                  <AppIcon name="fire" size={34} />
                  <View>
                    <Text style={styles.heroTitle}>
                      {language === 'gu'
                        ? 'આજનો પડકાર'
                        : language === 'hi'
                        ? 'आज की चुनौती'
                        : "Today's Quest"}
                    </Text>
                    <Text style={styles.heroSubtitle}>
                      {language === 'gu'
                        ? '૫ માંથી ૫ લાવો અને ગોલ્ડ સર્ટિફિકેટ જીતો!'
                        : language === 'hi'
                        ? '५ में से ५ लाएं और गोल्ड सर्टिफिकेट जीतें!'
                        : 'Answer 5 questions to win your Gold Medal!'}
                    </Text>
                  </View>
                </View>

                {/* Live Coins Reward Badge */}
                <View style={[styles.rewardBadge, claySurface('sun', 1)]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <GoldCoinIcon size={18} />
                    <Text style={styles.rewardBadgeText}>+30</Text>
                  </View>
                </View>
              </View>

              {/* 2. Step Progress Indicators (5 Segments) */}
              <View style={styles.progressRow}>
                {Array.from({ length: totalQuestions }).map((_, idx) => {
                  const isDone = idx < currentQIndex;
                  const isCurrent = idx === currentQIndex;
                  return (
                    <View
                      key={`step-${idx}`}
                      style={[
                        styles.progressStep,
                        isDone && styles.progressStepDone,
                        isCurrent && styles.progressStepCurrent,
                      ]}
                    >
                      <Text
                        style={[
                          styles.progressStepText,
                          isDone && styles.progressStepTextDone,
                          isCurrent && styles.progressStepTextCurrent,
                        ]}
                      >
                        {isDone ? '✓' : formatNumberDigits(idx + 1, language)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* 3. Main Question Card */}
            <View style={[styles.questionCard, claySurface('white', 2), shadows.card]}>
              <View style={styles.questionHeader}>
                <View style={[styles.subjectPill, { backgroundColor: kidTones.lavender.tint, borderColor: kidTones.lavender.tintBorder }]}>
                  <Text style={[styles.subjectPillText, { color: kidTones.lavender.text }]}>
                    {language === 'gu' ? q.subjectGu : language === 'hi' ? q.subjectHi : q.subjectEn}
                  </Text>
                </View>

                <View style={styles.scoreCounterPill}>
                  <Text style={styles.scoreCounterText}>
                    {formatNumberDigits(score, language)} / {formatNumberDigits(totalQuestions, language)}
                  </Text>
                </View>
              </View>

              {/* Question Prompt & Large Audio Button */}
              <View style={styles.qPromptRow}>
                <Text style={styles.qPromptText}>
                  {language === 'gu' ? q.promptGu : language === 'hi' ? q.promptHi : q.promptEn}
                </Text>

                <TouchableOpacity
                  style={[styles.speakerBtn, shadows.card]}
                  onPress={() => {
                    soundEffects.playBubblePop();
                    audioService.stop();
                    const promptToSpeak =
                      language === 'hi' ? q.promptHi : language === 'en' ? q.promptEn : q.promptGu;
                    speak(promptToSpeak, language);
                  }}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Listen again"
                >
                  <AppIcon name="speaker" size={24} />
                </TouchableOpacity>
              </View>

              {language !== 'en' && <Text style={styles.qPromptEnSubtitle}>{q.promptEn}</Text>}

              {/* 4. 3D Clay Options */}
              <View style={styles.optionsCol}>
                {currentOptions.map((opt, idx) => {
                  const isSelected = selectedOption === opt;
                  const isCorrectOpt = opt === currentCorrectAnswer;
                  const toneKey = OPTION_TONES[idx % OPTION_TONES.length];
                  const tone = kidTones[toneKey];

                  let optCardStyle: StyleProp<ViewStyle> = styles.optClayDefault;
                  let optTextStyle: StyleProp<TextStyle> = styles.optTextDefault;
                  let statusBadge = null;

                  if (isAnswered) {
                    if (isSelected) {
                      if (isCorrectOpt) {
                        optCardStyle = styles.optClayCorrect;
                        optTextStyle = styles.optTextCorrect;
                        statusBadge = <Glyph name="check" size={21} color={'#475569'} strokeWidth={3} />;
                      } else {
                        optCardStyle = styles.optClayWrong;
                        optTextStyle = styles.optTextWrong;
                        statusBadge = <Glyph name="close" size={21} color={'#475569'} strokeWidth={3} />;
                      }
                    } else if (isCorrectOpt) {
                      // Reveal correct answer in gentle green
                      optCardStyle = styles.optClayReveal;
                      optTextStyle = styles.optTextReveal;
                      statusBadge = <Glyph name="check" size={21} color={'#475569'} strokeWidth={3} />;
                    }
                  }

                  return (
                    <TouchableOpacity
                      key={`opt-${idx}`}
                      style={[styles.optClayBtn, optCardStyle, shadows.soft]}
                      onPress={() => handleSelectOption(opt)}
                      activeOpacity={0.8}
                      disabled={isAnswered}
                    >
                      {/* Left Badge: A, B, C, D in colored bubble */}
                      <View style={[styles.optLetterBubble, { backgroundColor: tone.tint, borderColor: tone.tintBorder }]}>
                        <Text style={[styles.optLetterText, { color: tone.text }]}>
                          {OPTION_LETTERS[idx]}
                        </Text>
                      </View>

                      {/* Option Text */}
                      <EmojiArt emoji={splitEmojiLabel(opt).emoji ?? splitEmojiLabel(q.optionsEn[idx] ?? '').emoji} size={40} />
                      <Text style={[styles.optLabelText, optTextStyle]} numberOfLines={2}>
                        {splitEmojiLabel(opt).label}
                      </Text>

                      {/* Right Status Indicator */}
                      <View style={styles.optStatusBox}>{statusBadge}</View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* 5. Live Answer Feedback Banner */}
              {feedback && (
                <View
                  style={[
                    styles.feedbackPill,
                    feedback.isCorrect ? styles.feedbackPillCorrect : styles.feedbackPillWrong,
                    shadows.soft,
                  ]}
                >
                  <Text
                    style={[
                      styles.feedbackPillText,
                      feedback.isCorrect ? styles.feedbackTextCorrect : styles.feedbackTextWrong,
                    ]}
                  >
                    {feedback.text}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          /* ========================================================= */
          /* CERTIFICATE VIEW - LUXURY GOLDEN HONORS AWARD             */
          /* ========================================================= */
          <View style={styles.contentWrap}>
            {/* Top Celebration Banner */}
            <View style={[styles.completionHeader, claySurface('sun', 2), shadows.soft]}>
              <View style={{ marginBottom: 4 }}><Art.TrophyArt size={70} /></View>
              <Text style={styles.completionHeading}>
                {score >= 4
                  ? language === 'gu'
                    ? 'શાનદાર! ઉત્કૃષ્ટ પ્રદર્શન!'
                    : language === 'hi'
                    ? 'शानदार! उत्कृष्ट प्रदर्शन!'
                    : 'Outstanding! Excellent Job!'
                  : language === 'gu'
                  ? 'ખૂબ સરસ પ્રયાસ! શાબાશ!'
                  : language === 'hi'
                  ? 'बहुत बढ़िया प्रयास! शाबाश!'
                  : 'Great Effort! Well Done!'}
              </Text>
              <View style={styles.completionBadgeRow}>
                <View style={styles.completionBadgeItem}>
                  <Text style={styles.completionBadgeVal}>
                    {formatNumberDigits(score, language)} / {formatNumberDigits(totalQuestions, language)}
                  </Text>
                  <Text style={styles.completionBadgeLbl}>
                    {language === 'gu' ? 'સાચા જવાબો' : language === 'hi' ? 'सही जवाब' : 'Correct'}
                  </Text>
                </View>
                <View style={styles.completionBadgeItem}>
                  <Text style={styles.completionBadgeVal}>🪙 +30</Text>
                  <Text style={styles.completionBadgeLbl}>
                    {language === 'gu' ? 'સિક્કા મળ્યા' : language === 'hi' ? 'सिक्के मिले' : 'Coins Earned'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Child Name Edit Row */}
            <View style={[styles.nameEditCard, claySurface('white', 1), shadows.soft]}>
              <Text style={styles.nameEditLabel}>
                {language === 'gu' ? 'પ્રમાણપત્ર પર નામ:' : language === 'hi' ? 'प्रमाणपत्र पर नाम:' : 'Certificate Name:'}
              </Text>
              {isEditingName ? (
                <View style={styles.nameInputRow}>
                  <TextInput
                    style={styles.nameTextInput}
                    value={childName}
                    onChangeText={setChildName}
                    autoFocus
                    placeholder={language === 'gu' ? 'નામ લખો' : language === 'hi' ? 'नाम लिखें' : 'Enter name'}
                  />
                  <TouchableOpacity
                    style={styles.nameDoneBtn}
                    onPress={() => setIsEditingName(false)}
                    activeOpacity={0.8}
                  >
                    <Glyph name="check" size={18} color={'#FFFFFF'} strokeWidth={3} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.nameDisplayRow}
                  onPress={() => setIsEditingName(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.nameDisplayText}>{childName}</Text>
                  <Art.PencilArt size={21} />
                </TouchableOpacity>
              )}
            </View>

            {/* Golden Luxury Certificate Card */}
            <View style={[styles.certCard, shadows.card]}>
              <View style={styles.certInnerBorder}>
                <View style={{ marginBottom: 4 }}><Art.MedalArt size={62} /></View>

                <Text style={styles.certAcademyName}>
                  {language === 'gu'
                    ? 'કિડ્ઝ ઝોન લર્નિંગ એકેડેમી'
                    : language === 'hi'
                    ? 'किड्स ज़ोन लर्निंग एकेडमी'
                    : 'KIDSZONE LEARNING ACADEMY'}
                </Text>

                <Text style={styles.certMainTitle}>
                  {language === 'gu'
                    ? 'પ્રશંસાપત્ર • CERTIFICATE OF MERIT'
                    : language === 'hi'
                    ? 'प्रशंसापत्र • CERTIFICATE OF MERIT'
                    : 'CERTIFICATE OF MERIT'}
                </Text>

                <View style={styles.certGoldLine} />

                <Text style={styles.certPresentedTo}>
                  {language === 'gu'
                    ? 'આ પ્રમાણપત્ર ગર્વ અને સન્માન સાથે એનાયત કરવામાં આવે છે:'
                    : language === 'hi'
                    ? 'यह प्रमाणपत्र गर्व और सम्मान के साथ प्रदान किया जाता है:'
                    : 'This certificate is proudly awarded to:'}
                </Text>

                <Text style={styles.certStudentName}>{childName}</Text>

                <Text style={styles.certDescription}>
                  {language === 'gu'
                    ? `જેમણે દૈનિક ક્વિઝ ચેલેન્જમાં ${formatNumberDigits(totalQuestions, language)} માંથી ${formatNumberDigits(score, language)} ગુણ મેળવીને તેમની બુદ્ધિ, મહેનત અને જ્ઞાનનું શ્રેષ્ઠ પ્રદર્શન કર્યું છે.`
                    : language === 'hi'
                    ? `जिन्होंने दैनिक क्विज चुनौती में ${formatNumberDigits(totalQuestions, language)} में से ${formatNumberDigits(score, language)} अंक प्राप्त कर अपनी बुद्धि, मेहनत और ज्ञान का उत्कृष्ट प्रदर्शन किया है।`
                    : `For achieving ${score} out of ${totalQuestions} in the Daily Challenge Quiz, demonstrating outstanding effort, intelligence, and learning excellence.`}
                </Text>

                {/* Star Badges */}
                <View style={styles.certStarsRow}>
                  {Array.from({ length: Math.max(1, score) }).map((_, idx) => (
                    <Text key={`star-${idx}`} style={styles.certStarEmoji}>
                      ⭐
                    </Text>
                  ))}
                </View>

                {/* Certificate Footer */}
                <View style={styles.certFooterRow}>
                  <View style={styles.certFooterCol}>
                    <Text style={styles.certFooterVal}>
                      {new Date().toLocaleDateString(
                        language === 'gu' ? 'gu-IN' : language === 'hi' ? 'hi-IN' : 'en-US'
                      )}
                    </Text>
                    <Text style={styles.certFooterLbl}>
                      {language === 'gu' ? 'તારીખ' : language === 'hi' ? 'दिनांक' : 'Date'}
                    </Text>
                  </View>

                  <View style={styles.certFooterCol}>
                    <Text style={styles.certFooterVal}>🎖️ KidsZone Certified</Text>
                    <Text style={styles.certFooterLbl}>
                      {language === 'gu' ? 'સિદ્ધિ' : language === 'hi' ? 'उपलब्धि' : 'Honor'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.certActionsRow}>
              <ClayButton
                tone="mint"
                size="lg"
                title={`${language === 'gu' ? 'ફરીથી રમો' : language === 'hi' ? 'फिर से खेलें' : 'Play Again'}`}
                onPress={handleRestart}
                style={styles.actionBtn}
              />
              <ClayButton
                tone="sun"
                size="lg"
                title={`${language === 'gu' ? 'હોમ પેજ' : language === 'hi' ? 'होम पेज' : 'Home'}`}
                onPress={() => router.replace('/home')}
                style={styles.actionBtn}
              />
            </View>
          </View>
        )}
        <View style={{ height: 90 }} />
      </ScrollView>
      <BottomNav activeTab="challenges" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl * 2,
    alignItems: 'center',
  },
  contentWrap: {
    width: '100%',
    maxWidth: 520,
    alignItems: 'center',
  },

  // 1. Hero Challenge Banner
  heroBanner: {
    width: '100%',
    borderRadius: kidRadii.card,
    padding: spacing.md + 2,
    marginBottom: spacing.md,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm + 2,
  },
  heroTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  heroFlameIcon: {
    fontSize: 28,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#4C1D95',
  },
  heroSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6D28D9',
    marginTop: 2,
  },
  rewardBadge: {
    borderRadius: radii.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  rewardBadgeText: {
    fontSize: 14,
    fontWeight: '900',
    color: kidTones.sun.text,
  },

  // Stepper Progress Indicators
  progressRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    marginTop: 4,
  },
  progressStep: {
    flex: 1,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: '#EDE9FE',
    borderWidth: 2,
    borderColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStepDone: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  progressStepCurrent: {
    backgroundColor: '#FEF08A',
    borderColor: '#FACC15',
    transform: [{ scale: 1.05 }],
  },
  progressStepText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#7C3AED',
  },
  progressStepTextDone: {
    color: '#15803D',
  },
  progressStepTextCurrent: {
    color: '#854D0E',
  },

  // 2. Question Card
  questionCard: {
    width: '100%',
    borderRadius: kidRadii.card,
    padding: spacing.lg,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  subjectPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.full,
    borderWidth: 1.5,
  },
  subjectPillText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  scoreCounterPill: {
    backgroundColor: '#F1F5F9',
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  scoreCounterText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
  },

  qPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 4,
  },
  qPromptText: {
    fontSize: 21,
    fontWeight: '900',
    color: '#1E1B4B',
    lineHeight: 30,
    flex: 1,
  },
  speakerBtn: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: '#F3E8FF',
    borderWidth: 2,
    borderColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qPromptEnSubtitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: spacing.lg,
    marginTop: 2,
  },

  // 3. Options
  optionsCol: {
    gap: 12,
    width: '100%',
  },
  optClayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderBottomWidth: 5,
  },
  optClayDefault: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderBottomColor: '#CBD5E1',
  },
  optClayCorrect: {
    backgroundColor: '#DCFCE7',
    borderColor: '#4ADE80',
    borderBottomColor: '#16A34A',
  },
  optClayWrong: {
    backgroundColor: '#FEE2E2',
    borderColor: '#F87171',
    borderBottomColor: '#DC2626',
  },
  optClayReveal: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
    borderBottomColor: '#22C55E',
    borderStyle: 'dashed',
  },
  optLetterBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optLetterText: {
    fontSize: 15,
    fontWeight: '900',
  },
  optLabelText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
  },
  optTextDefault: {
    color: '#1E293B',
  },
  optTextCorrect: {
    color: '#14532D',
  },
  optTextWrong: {
    color: '#7F1D1D',
  },
  optTextReveal: {
    color: '#166534',
  },
  optStatusBox: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optStatusIcon: {
    fontSize: 20,
  },

  // Feedback Banner
  feedbackPill: {
    marginTop: spacing.md + 2,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  feedbackPillCorrect: {
    backgroundColor: '#DCFCE7',
    borderColor: '#22C55E',
  },
  feedbackPillWrong: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  feedbackPillText: {
    fontSize: 14.5,
    fontWeight: '900',
    textAlign: 'center',
  },
  feedbackTextCorrect: {
    color: '#15803D',
  },
  feedbackTextWrong: {
    color: '#B91C1C',
  },

  // Certificate Screen
  completionHeader: {
    width: '100%',
    borderRadius: kidRadii.card,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  trophyIcon: {
    fontSize: 54,
    marginBottom: 4,
  },
  completionHeading: {
    fontSize: 20,
    fontWeight: '900',
    color: '#78350F',
    textAlign: 'center',
    marginBottom: 10,
  },
  completionBadgeRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionBadgeItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.full,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignItems: 'center',
  },
  completionBadgeVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#B45309',
  },
  completionBadgeLbl: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },

  nameEditCard: {
    width: '100%',
    borderRadius: radii.card,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  nameEditLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 4,
  },
  nameDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  nameDisplayText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1E293B',
  },
  nameEditIcon: {
    fontSize: 16,
  },
  nameInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameTextInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
  },
  nameDoneBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameDoneBtnText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '900',
  },

  // Gold Luxury Certificate
  certCard: {
    width: '100%',
    backgroundColor: '#FFFDF5',
    borderRadius: 24,
    borderWidth: 3.5,
    borderColor: '#F59E0B',
    padding: 8,
    marginBottom: spacing.lg,
  },
  certInnerBorder: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D97706',
    borderRadius: 18,
    padding: spacing.lg,
    alignItems: 'center',
  },
  certRibbonSeal: {
    fontSize: 48,
    marginBottom: 4,
  },
  certAcademyName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#B45309',
    letterSpacing: 0.5,
  },
  certMainTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#78350F',
    marginVertical: 4,
    textAlign: 'center',
  },
  certGoldLine: {
    width: 140,
    height: 2.5,
    backgroundColor: '#F59E0B',
    marginVertical: 10,
    borderRadius: radii.full,
  },
  certPresentedTo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  certStudentName: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1E293B',
    marginVertical: 6,
    textAlign: 'center',
  },
  certDescription: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginVertical: 6,
  },
  certStarsRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 10,
  },
  certStarEmoji: {
    fontSize: 26,
  },
  certFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    borderTopWidth: 1.5,
    borderTopColor: '#FDE68A',
    paddingTop: 10,
    marginTop: 8,
  },
  certFooterCol: {
    alignItems: 'center',
  },
  certFooterVal: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#78350F',
  },
  certFooterLbl: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#B45309',
    marginTop: 2,
  },

  certActionsRow: {
    width: '100%',
    gap: 12,
  },
  actionBtn: {
    width: '100%',
  },
});
