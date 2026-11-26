import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { AppLanguage } from '../types';
import { AppIcon } from './AppIcon';
import { PastelButton } from './PastelButton';
import { radii, shadows, spacing } from '../theme/spacing';
import { colors } from '../theme/colors';
import { Image } from 'react-native';
import { STORY_CHARACTER_IMAGES, ANIMAL_CHARACTER_IMAGES } from '../utils/imageHelper';
import { PawArt, MegaphoneArt } from './art3d/Art3D';
import { Remote3DImage } from './common/Remote3DImage';

export interface PhonicsPromptInfo {
  phoneme: string;
  text: string;
  emoji?: string;
}

export interface RealVoiceInfo {
  emoji?: string;
  soundKey?: string;
}

export interface SpeechFeedbackInfo {
  status: 'idle' | 'success';
  msg?: string;
}

export interface LessonActionSectionProps {
  language: AppLanguage;
  onSpeak: () => void;
  onPlayRealVoice?: () => void;
  hasRealVoice?: boolean;
  realVoiceInfo?: RealVoiceInfo | null;
  characterImage?: any;
  phonicsPrompt?: PhonicsPromptInfo | null;
  onPlayPhonics?: () => void;
  speechFeedback?: SpeechFeedbackInfo;
  hasPrevious?: boolean;
  hasNext?: boolean;
  onPrevious?: () => void;
  onComplete: () => void;
  onNext?: () => void;
}

export const LessonActionSection: React.FC<LessonActionSectionProps> = ({
  language,
  onSpeak,
  onPlayRealVoice,
  hasRealVoice = false,
  realVoiceInfo,
  characterImage,
  phonicsPrompt,
  onPlayPhonics,
  speechFeedback,
  hasPrevious = false,
  hasNext = false,
  onPrevious,
  onComplete,
  onNext,
}) => {
  const [isPressingSpeak, setIsPressingSpeak] = useState(false);
  const [isPressingReal, setIsPressingReal] = useState(false);
  const speakPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const realPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (speakPressTimerRef.current) clearTimeout(speakPressTimerRef.current);
      if (realPressTimerRef.current) clearTimeout(realPressTimerRef.current);
    };
  }, []);

  const handleSpeakPress = () => {
    if (speakPressTimerRef.current) clearTimeout(speakPressTimerRef.current);
    setIsPressingSpeak(true);
    onSpeak();
    speakPressTimerRef.current = setTimeout(() => setIsPressingSpeak(false), 300);
  };

  const handleRealPress = () => {
    if (!onPlayRealVoice) return;
    if (realPressTimerRef.current) clearTimeout(realPressTimerRef.current);
    setIsPressingReal(true);
    onPlayRealVoice();
    realPressTimerRef.current = setTimeout(() => setIsPressingReal(false), 300);
  };

  // Localized audio button labels
  const speakBtnLabel = hasRealVoice
    ? language === 'gu'
      ? 'નામ સાંભળો'
      : language === 'hi'
      ? 'नाम सुनें'
      : 'Speak Name'
    : language === 'gu'
    ? 'સાંભળો'
    : language === 'hi'
    ? 'सुनें'
    : 'Listen';

  const realVoiceLabel =
    language === 'gu'
      ? 'અસલી અવાજ'
      : language === 'hi'
      ? 'असली आवाज़'
      : 'Real Voice';

  // Localized phonics label
  const phonicsLabel =
    language === 'gu'
      ? 'ફોનિક્સ અવાજ'
      : language === 'hi'
      ? 'फोनिक्स ध्वनि'
      : 'Phonics Sound';

  // Localized nav button labels
  const prevLabel =
    language === 'gu'
      ? '← પાછળ'
      : language === 'hi'
      ? '← पिछला'
      : '← Prev';

  const completeLabel =
    language === 'gu'
      ? 'પૂરું થયું'
      : language === 'hi'
      ? 'पूरा हुआ'
      : 'Complete';

  const nextLabel = hasNext
    ? language === 'gu'
      ? 'આગળ →'
      : language === 'hi'
      ? 'अगला →'
      : 'Next →'
    : language === 'gu'
    ? 'સમાપ્ત'
    : language === 'hi'
    ? 'समाप्त'
    : 'Done';

  return (
    <View style={styles.actionContainer}>
      {/* 1. PRIMARY AUDIO CONTROLS (Single or Dual Symmetrical Circular Buttons) */}
      <View style={styles.audioRow}>
        {/* Listen / Pronounce Button */}
        <View style={styles.audioItemCol}>
          <TouchableOpacity
            onPress={handleSpeakPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={speakBtnLabel}
            style={[
              styles.circleBtn,
              styles.speakCircle,
              isPressingSpeak && styles.speakCirclePressed,
              shadows.card,
            ]}
          >
            <View pointerEvents="none">
              <AppIcon name="speaker" size={32} />
            </View>
          </TouchableOpacity>
          <Text style={styles.circleLabel} numberOfLines={1}>
            {speakBtnLabel}
          </Text>
        </View>

        {/* Real Voice Button (Available for animals/birds across all languages) */}
        {hasRealVoice && (
          <View style={styles.audioItemCol}>
            <TouchableOpacity
              onPress={handleRealPress}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={realVoiceLabel}
              style={[
                styles.circleBtn,
                styles.realCircle,
                isPressingReal && styles.realCirclePressed,
                shadows.card,
              ]}
            >
              {(() => {
                const charImg =
                  characterImage ||
                  (realVoiceInfo?.soundKey && ANIMAL_CHARACTER_IMAGES[realVoiceInfo.soundKey]) ||
                  (realVoiceInfo?.emoji && STORY_CHARACTER_IMAGES[realVoiceInfo.emoji]) ||
                  null;
                return charImg ? (
                  <Remote3DImage
                    source={charImg}
                    style={{ width: 44, height: 44, borderRadius: 22 }}
                    contentFit="contain"
                    fallback={
                      realVoiceInfo?.emoji ? (
                        <Text style={{ fontSize: 28 }}>{realVoiceInfo.emoji}</Text>
                      ) : (
                        <PawArt size={40} />
                      )
                    }
                  />
                ) : (
                  <PawArt size={40} />
                );
              })()}
            </TouchableOpacity>
            <Text style={styles.circleLabel} numberOfLines={1}>
              {realVoiceLabel}
            </Text>
          </View>
        )}
      </View>

      {/* 2. PHONICS SOUND PILL (Letters / Alphabet / Varnamala) */}
      {phonicsPrompt && (
        <View style={styles.phonicsContainer}>
          <TouchableOpacity
            style={[styles.phonicsBtn, shadows.soft]}
            onPress={onPlayPhonics}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={phonicsLabel}
          >
            <MegaphoneArt size={26} />
            <View style={styles.phonemeBadge}>
              <Text style={styles.phonemeText}>
                {phonicsPrompt.phoneme.replace(/[\/\[\]]/g, '')}
              </Text>
            </View>
            <Text style={styles.phonicsText}>{phonicsLabel}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 3. SPEECH FEEDBACK BUBBLE */}
      {speechFeedback && speechFeedback.status !== 'idle' && speechFeedback.msg ? (
        <View style={[styles.speechBubble, shadows.soft]}>
          <Text style={styles.speechBubbleText}>{speechFeedback.msg}</Text>
        </View>
      ) : null}

      {/* 5. NAVIGATION ROW (Previous, Complete, Next) */}
      <View style={styles.navRow}>
        {hasPrevious && onPrevious ? (
          <PastelButton
            title={prevLabel}
            onPress={onPrevious}
            variant="secondary"
            style={styles.navBtnSide}
          />
        ) : (
          <View style={styles.navBtnPlaceholder} />
        )}

        <PastelButton
          title={completeLabel}
          onPress={onComplete}
          variant="primary"
          style={styles.navBtnCenter}
        />

        {hasNext && onNext ? (
          <PastelButton
            title={nextLabel}
            onPress={onNext}
            variant="mint"
            style={styles.navBtnSide}
          />
        ) : (
          <PastelButton
            title={nextLabel}
            onPress={onComplete}
            variant="mint"
            style={styles.navBtnSide}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actionContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    marginVertical: spacing.sm,
    width: '100%',
  },
  audioItemCol: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  circleBtn: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakCircle: {
    backgroundColor: '#F3E8FF',
    borderColor: '#DDD6FE',
  },
  speakCirclePressed: {
    backgroundColor: '#E9D5FF',
    transform: [{ scale: 0.96 }],
  },
  realCircle: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  realCirclePressed: {
    backgroundColor: '#FDE68A',
    transform: [{ scale: 0.96 }],
  },
  circleLabel: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
    textAlign: 'center',
  },
  phonicsContainer: {
    marginTop: spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  phonicsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    borderWidth: 1.5,
    borderColor: '#C084FC',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 22,
    gap: 8,
  },
  phonemeBadge: {
    backgroundColor: '#E9D5FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C084FC',
  },
  phonemeText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#7E22CE',
  },
  phonicsText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#6B21A8',
  },
  speechBubble: {
    marginTop: spacing.sm + 4,
    backgroundColor: '#DCFCE7',
    borderWidth: 1.5,
    borderColor: '#22C55E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    maxWidth: '92%',
    alignItems: 'center',
  },
  speechBubbleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D',
    textAlign: 'center',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: spacing.lg,
    gap: 10,
  },
  navBtnSide: {
    flex: 1,
    minHeight: 48,
  },
  navBtnCenter: {
    flex: 1.25,
    minHeight: 48,
  },
  navBtnPlaceholder: {
    flex: 1,
  },
});

