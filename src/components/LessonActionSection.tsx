import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, useWindowDimensions, type ImageSourcePropType } from 'react-native';
import { AppLanguage } from '../types';
import { AppIcon } from './AppIcon';
import { ClayButton } from './clay';
import { Glyph } from './fun';
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
  characterImage?: ImageSourcePropType;
  phonicsPrompt?: PhonicsPromptInfo | null;
  onPlayPhonics?: () => void;
  canTrace?: boolean;
  isTracingOpen?: boolean;
  onToggleTracing?: () => void;
  isNumberLesson?: boolean;
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
  canTrace = false,
  isTracingOpen = false,
  onToggleTracing,
  isNumberLesson = false,
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

  // Localized tracing button label
  const traceButtonLabel = isTracingOpen
    ? language === 'gu'
      ? '▲ ટ્રેસિંગ છુપાવો'
      : language === 'hi'
      ? '▲ ट्रेसिंग छुपाएं'
      : '▲ Hide Tracing'
    : isNumberLesson
    ? language === 'gu'
      ? 'અંક ઘૂંટો'
      : language === 'hi'
      ? 'अंक ट्रेस करें'
      : 'Trace Number'
    : language === 'gu'
    ? 'આંગળીથી ટ્રેસ કરો'
    : language === 'hi'
    ? 'उंगली से ट्रेस करें'
    : 'Finger Trace';

  const { width } = useWindowDimensions();
  const isNarrow = width < 360;

  // Localized nav button accessibility labels (rendered as arrow-only icons)
  const prevA11y =
    language === 'gu'
      ? 'પાછળ'
      : language === 'hi'
      ? 'पिछला'
      : 'Previous';

  const nextA11y = hasNext
    ? language === 'gu'
      ? 'આગળ'
      : language === 'hi'
      ? 'अगला'
      : 'Next'
    : language === 'gu'
    ? 'સમાપ્ત'
    : language === 'hi'
    ? 'समाप्त'
    : 'Done';

  return (
    <View style={styles.actionContainer}>
      {/* 1. PRIMARY AUDIO CONTROLS (Single or Dual Symmetrical Circular Buttons) */}
      <View style={[styles.audioRow, isNarrow && styles.audioRowNarrow]}>
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

      {/* 2. SPEECH FEEDBACK BUBBLE */}
      {speechFeedback && speechFeedback.status !== 'idle' && speechFeedback.msg ? (
        <View style={[styles.speechBubble, shadows.soft]}>
          <Text style={styles.speechBubbleText}>{speechFeedback.msg}</Text>
        </View>
      ) : null}

      {/* 4. FINGER TRACING TOGGLE PILL (Available for English Alphabet & Numbers) */}
      {canTrace && onToggleTracing && (
        <View style={styles.traceContainer}>
          <TouchableOpacity
            onPress={onToggleTracing}
            style={[styles.traceBtn, shadows.soft]}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={traceButtonLabel}
          >
            <Text style={styles.traceBtnText}>{traceButtonLabel}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 5. NAVIGATION ROW (Arrow-only Previous & Next; Next triggers completion) */}
      <View style={[styles.navRow, isNarrow && styles.navRowNarrow]}>
        {hasPrevious && onPrevious ? (
          <ClayButton
            tone="white"
            size="md"
            sound={false}
            onPress={onPrevious}
            accessibilityLabel={prevA11y}
            style={[styles.navArrowBtn, isNarrow && styles.navArrowBtnNarrow]}
          >
            <Glyph name="back" size={isNarrow ? 22 : 26} color="#1E293B" strokeWidth={3.4} />
          </ClayButton>
        ) : (
          <View style={[styles.navArrowPlaceholder, isNarrow && styles.navArrowBtnNarrow]} />
        )}

        <ClayButton
          tone="mint"
          size="md"
          sound={false}
          onPress={hasNext && onNext ? onNext : onComplete}
          accessibilityLabel={nextA11y}
          style={[styles.navArrowBtn, isNarrow && styles.navArrowBtnNarrow]}
        >
          <Glyph name="next" size={isNarrow ? 22 : 26} color="#FFFFFF" strokeWidth={3.4} />
        </ClayButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actionContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  audioRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginVertical: 4,
    width: '100%',
  },
  audioRowNarrow: {
    gap: 16,
  },
  audioItemCol: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 68,
  },
  circleBtn: {
    width: 56,
    height: 56,
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
    maxWidth: '100%',
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
    fontWeight: '700',
    color: '#7E22CE',
  },
  phonicsText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#6B21A8',
    flexShrink: 1,
  },
  speechBubble: {
    marginTop: spacing.sm + 4,
    backgroundColor: '#DCFCE7',
    borderWidth: 1.5,
    borderColor: '#22C55E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    maxWidth: '95%',
    alignItems: 'center',
  },
  speechBubbleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#15803D',
    textAlign: 'center',
  },
  traceContainer: {
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  traceBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 240,
  },
  traceBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0284C7',
    textAlign: 'center',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
    gap: 12,
  },
  navRowNarrow: {
    gap: 8,
    marginTop: 8,
  },
  navArrowBtn: {
    flex: 1,
    maxWidth: 150,
    minWidth: 0,
    minHeight: 50,
  },
  navArrowBtnNarrow: {
    maxWidth: 112,
    minHeight: 46,
  },
  navArrowPlaceholder: {
    flex: 1,
    maxWidth: 150,
    minWidth: 0,
  },
});

