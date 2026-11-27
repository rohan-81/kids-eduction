import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LessonItem, AppLanguage } from '../types';
import { kidPalette, kidRadii, clayShadow } from '../theme/kidTheme';
import { soundEffects } from '../services/soundEffects';
import { PATTERN_PUZZLES_MAP, PatternPuzzleDef } from '../data/patternsData';

export type { PatternPuzzleDef };
export { PATTERN_PUZZLES_MAP };

/**
 * 1. Compact Puzzle Card Visual for Lesson Lists
 * Renders the pattern sequence with a missing "?" slot so kids know it is a puzzle to solve.
 */
export const PatternCardVisual: React.FC<{ item: LessonItem; size?: number }> = ({ item, size = 64 }) => {
  const pz = PATTERN_PUZZLES_MAP[item.id];
  const sequence = pz ? pz.sequence : ['🔴', '🟡', '🔴'];

  return (
    <View style={styles.cardWrap}>
      <View style={styles.sequenceRowCard}>
        {sequence.map((sym, idx) => (
          <View key={`seq-${idx}`} style={[styles.symBubbleCard, clayShadow(1)]}>
            <Text style={styles.symTextCard}>{sym}</Text>
          </View>
        ))}
        {/* Missing Blank Slot with "?" */}
        <View style={[styles.missingBubbleCard, clayShadow(1, '#D97706')]}>
          <Text style={styles.missingQuestionCard}>❓</Text>
        </View>
      </View>
    </View>
  );
};

/**
 * 2. Interactive Pattern Lesson Detail Component
 * Allows kids to tap options, validates the answer, plays audio, fills slot with animation.
 */
export const InteractivePatternLessonView: React.FC<{
  item: LessonItem;
  language: AppLanguage;
  onCorrectSolved?: () => void;
}> = ({ item, language, onCorrectSolved }) => {
  const pz = PATTERN_PUZZLES_MAP[item.id] || PATTERN_PUZZLES_MAP['cs-pattern-ab-color'];
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleOptionPress = (option: string) => {
    soundEffects.playBubblePop();
    setSelectedAnswer(option);

    if (option === pz.correctOption) {
      setIsCorrect(true);
      soundEffects.playCorrectSound();
      const msg =
        language === 'gu'
          ? '🎉 શાબાશ! ખૂબ સરસ! સાચો જવાબ!'
          : language === 'hi'
          ? '🎉 शाबाश! बहुत बढ़िया! सही जवाब!'
          : '🎉 Great job! You found the pattern!';
      setFeedbackMsg(msg);
      if (onCorrectSolved) onCorrectSolved();
    } else {
      setIsCorrect(false);
      soundEffects.playWrongSound();
      const hint = pz.hint[language] || pz.hint.en;
      setFeedbackMsg(`🤔 ${hint}`);
    }
  };

  const questionPrompt = pz.questionPrompt[language] || pz.questionPrompt.en;

  return (
    <View style={[styles.detailContainer, clayShadow(2)]}>
      {/* Question Header Tag */}
      <View style={styles.questionTag}>
        <Text style={styles.questionTagText}>
          {language === 'gu' ? '🧩 પેટર્ન પૂર્ણ કરો' : language === 'hi' ? '🧩 पैटर्न पूरा करें' : '🧩 Complete the Pattern'}
        </Text>
      </View>

      <Text style={styles.questionPromptText}>{questionPrompt}</Text>

      {/* Sequence Track */}
      <View style={styles.detailTrackRow}>
        {pz.sequence.map((sym, idx) => (
          <React.Fragment key={`dt-${idx}`}>
            <View style={[styles.symBubbleDetail, clayShadow(2)]}>
              <Text style={styles.symTextDetail}>{sym}</Text>
            </View>
            <Text style={styles.arrowIcon}>→</Text>
          </React.Fragment>
        ))}

        {/* Missing / Answer Slot */}
        <View
          style={[
            styles.targetSlotDetail,
            isCorrect ? styles.targetSlotCorrect : styles.targetSlotEmpty,
            clayShadow(isCorrect ? 3 : 2, isCorrect ? '#059669' : '#D97706'),
          ]}
        >
          <Text style={[styles.targetSlotText, isCorrect && styles.targetSlotTextCorrect]}>
            {isCorrect ? selectedAnswer : '❓'}
          </Text>
          {isCorrect && <Text style={styles.correctStar}>✨</Text>}
        </View>
      </View>

      {/* Feedback Message */}
      {feedbackMsg ? (
        <View style={[styles.feedbackBanner, isCorrect ? styles.feedbackCorrect : styles.feedbackHint]}>
          <Text style={[styles.feedbackText, isCorrect ? styles.feedbackTextCorrect : styles.feedbackTextHint]}>
            {feedbackMsg}
          </Text>
        </View>
      ) : null}

      {/* Options Selection Row */}
      <View style={styles.optionsSection}>
        <Text style={styles.optionsHeader}>
          {language === 'gu'
            ? 'સાચો વિકલ્પ પસંદ કરો:'
            : language === 'hi'
            ? 'सही विकल्प चुनें:'
            : 'Choose the correct option:'}
        </Text>
        <View style={styles.optionsRow}>
          {pz.options.map((opt, i) => {
            const isSelected = selectedAnswer === opt;
            const isOptionCorrect = isSelected && isCorrect;
            return (
              <TouchableOpacity
                key={`opt-${i}`}
                onPress={() => handleOptionPress(opt)}
                activeOpacity={0.8}
                style={[
                  styles.optionBtn,
                  clayShadow(2),
                  isSelected && (isOptionCorrect ? styles.optionBtnCorrect : styles.optionBtnWrong),
                ]}
              >
                <Text style={styles.optionBtnText}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    width: '100%',
  },
  sequenceRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  symBubbleCard: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  symTextCard: {
    fontSize: 16,
  },
  missingBubbleCard: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingQuestionCard: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B45309',
  },
  detailContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: kidRadii.card,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    padding: 16,
    marginVertical: 12,
    alignItems: 'center',
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  questionTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    marginBottom: 8,
  },
  questionTagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  questionPromptText: {
    fontSize: 15,
    fontWeight: '700',
    color: kidPalette.ink,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  detailTrackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  symBubbleDetail: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  symTextDetail: {
    fontSize: 28,
  },
  arrowIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#94A3B8',
  },
  targetSlotDetail: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  targetSlotEmpty: {
    backgroundColor: '#FEF3C7',
    borderWidth: 2.5,
    borderStyle: 'dashed',
    borderColor: '#F59E0B',
  },
  targetSlotCorrect: {
    backgroundColor: '#ECFDF5',
    borderWidth: 2.5,
    borderColor: '#10B981',
  },
  targetSlotText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#B45309',
  },
  targetSlotTextCorrect: {
    fontSize: 30,
  },
  correctStar: {
    position: 'absolute',
    top: -4,
    right: -4,
    fontSize: 16,
  },
  feedbackBanner: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 14,
    width: '100%',
    alignItems: 'center',
  },
  feedbackCorrect: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1.5,
    borderColor: '#34D399',
  },
  feedbackHint: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#FCD34D',
  },
  feedbackText: {
    fontSize: 13.5,
    fontWeight: '600',
    textAlign: 'center',
  },
  feedbackTextCorrect: {
    color: '#065F46',
  },
  feedbackTextHint: {
    color: '#92400E',
  },
  optionsSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  optionsHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: kidPalette.inkMuted,
    marginBottom: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  optionBtn: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionBtnCorrect: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  optionBtnWrong: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  optionBtnText: {
    fontSize: 26,
  },
});
