import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Rect, Path } from 'react-native-svg';
import { PurpleGradientButton } from '../src/components/PurpleGradientButton';
import { soundEffects } from '../src/services/soundEffects';
import { useApp } from '../src/context/AppContext';
import { AgeGroup } from '../src/types';
import { storageService } from '../src/services/storageService';
import { backendService } from '../src/services/backendService';
import { ClayBadgeToken, TokenTone } from '../src/components/SubjectBadgeIcons';
import * as Art from '../src/components/art3d/Art3D';
import { GlobeIcon } from '../src/components/fun';
import { AppGlobalBackground } from '../src/components/common/AppGlobalBackground';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type ClassCardId = 'pre-school' | 'class-1-2' | 'class-3-5';

export interface ClassOption {
  id: ClassCardId;
  labelEn: string;
  labelGu: string;
  labelHi: string;
  subEn: string;
  subGu: string;
  subHi: string;
  titleEn: string;
  titleGu: string;
  titleHi: string;
  ageGroup: AgeGroup;
  /** 3D clay token art (no emoji). */
  art: React.FC<{ size?: number }>;
  tone: TokenTone;
  themeBg: string;
}

export const CLASS_OPTIONS: ClassOption[] = [
  {
    id: 'pre-school',
    labelEn: 'Pre-School (2–4 yrs)',
    labelGu: 'પ્રી-સ્કૂલ (૨-૪ વર્ષ)',
    labelHi: 'प्री-स्कूल (२-४ वर्ष)',
    subEn: 'Letter recognition, shapes & colors',
    subGu: 'મૂળાક્ષર ઓળખ, રંગો અને આકારો',
    subHi: 'वर्णमाला पहचान, रंग और आकार',
    titleEn: 'Pre-School (2–4 yrs)',
    titleGu: 'પ્રી-સ્કૂલ (૨-૪ વર્ષ)',
    titleHi: 'प्री-स्कूल (२-४ वर्ष)',
    ageGroup: '2-4',
    art: Art.AppleArt,
    tone: 'peach',
    themeBg: '#FEF2F2',
  },
  {
    id: 'class-1-2',
    labelEn: 'Class 1–2 (4–6 yrs)',
    labelGu: 'વર્ગ ૧-૨ (૪-૬ વર્ષ)',
    labelHi: 'कक्षा १-२ (४-६ वर्ष)',
    subEn: 'Phonics, stroke tracing & counting',
    subGu: 'બારાખડી, ટ્રેસિંગ અને સાદી ગણતરી',
    subHi: 'बारहखड़ी, ट्रेसिंग और सरल गिनती',
    titleEn: 'Class 1–2 (4–6 yrs)',
    titleGu: 'વર્ગ ૧-૨ (૪-૬ વર્ષ)',
    titleHi: 'कक्षा १-२ (४-६ वर्ष)',
    ageGroup: '4-6',
    art: Art.WordTilesArt,
    tone: 'sky',
    themeBg: '#EFF6FF',
  },
  {
    id: 'class-3-5',
    labelEn: 'Class 3–5 (6–8 yrs)',
    labelGu: 'વર્ગ ૩-૫ (૬-૮ વર્ષ)',
    labelHi: 'कक्षा ३-५ (६-८ वर्ष)',
    subEn: 'Word spelling, tables & math quiz',
    subGu: 'શબ્દ નિર્માણ, ઘડિયા અને ગણિત ક્વિઝ',
    subHi: 'शब्द निर्माण, पहाड़े और गणित क्विज़',
    titleEn: 'Class 3–5 (6–8 yrs)',
    titleGu: 'વર્ગ ૩-૫ (૬-૮ વર્ષ)',
    titleHi: 'कक्षा ३-५ (६-८ वर्ष)',
    ageGroup: '6-8',
    art: Art.TrophyArt,
    tone: 'gold',
    themeBg: '#FFFBEB',
  },
];

export default function ChooseClassScreen() {
  const router = useRouter();
  const {
    ageGroup,
    setAgeGroup,
    finishOnboarding,
    language,
    setLanguage,
    speak,
    isAuthenticated,
    isGuest,
    activeProfileId,
  } = useApp();

  // Initially select based on active child's ageGroup or default to pre-school
  const [selectedClassId, setSelectedClassId] = useState<ClassCardId>(() => {
    if (ageGroup === '4-6') return 'class-1-2';
    if (ageGroup === '6-8') return 'class-3-5';
    return 'pre-school';
  });

  // Load active class: prioritize current active child ageGroup, fallback to pre-school
  useEffect(() => {
    if (ageGroup === '2-4') setSelectedClassId('pre-school');
    else if (ageGroup === '4-6') setSelectedClassId('class-1-2');
    else if (ageGroup === '6-8') setSelectedClassId('class-3-5');
    else setSelectedClassId('pre-school');
  }, [ageGroup]);

  // Entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const cycleLanguage = () => {
    soundEffects.playBubblePop();
    const next = language === 'gu' ? 'en' : language === 'en' ? 'hi' : 'gu';
    setLanguage(next);
  };

  const handleSelectClass = (opt: ClassOption) => {
    soundEffects.playBubblePop();
    setSelectedClassId(opt.id);
  };

  const handleBack = () => {
    soundEffects.playBubblePop();
    try {
      if (router.canGoBack()) {
        router.back();
        return;
      }
    } catch {}
    router.replace('/onboarding');
  };

  const handleContinue = async () => {
    soundEffects.playLevelUp();

    const selectedOption = CLASS_OPTIONS.find((c) => c.id === selectedClassId) || CLASS_OPTIONS[0];

    // Save preferences with selectedClass and mapped ageGroup
    await storageService.savePreferences({
      selectedClass: selectedOption.id,
      ageGroup: selectedOption.ageGroup,
      hasCompletedOnboarding: true,
    });
    await setAgeGroup(selectedOption.ageGroup);
    await finishOnboarding(language, selectedOption.ageGroup);

    try {
      const activeId = activeProfileId || (await backendService.getActiveProfileId()) || 1;
      await backendService.updateProfileAgeGroup(activeId, selectedOption.ageGroup);
    } catch {}

    // Speak confirmation
    const title =
      language === 'gu'
        ? selectedOption.titleGu
        : language === 'hi'
        ? selectedOption.titleHi
        : selectedOption.titleEn;
    speak(title, language);

    // Continue should navigate to home if authenticated, or login screen
    if (isAuthenticated || isGuest) {
      router.replace('/home');
    } else {
      router.replace('/login');
    }
  };

  // Localized Strings
  const tHeading =
    language === 'gu'
      ? 'તમારો વર્ગ પસંદ કરો'
      : language === 'hi'
      ? 'अपनी कक्षा चुनें'
      : 'Choose Your Class';

  const tSubtitle =
    language === 'gu'
      ? 'તમારા બાળકની યોગ્ય શીખવાની સફર પસંદ કરો'
      : language === 'hi'
      ? 'अपने बच्चे की सीखने की यात्रा को अनुकूलित करें'
      : "We'll personalise your learning journey";

  const tSectionLabel =
    language === 'gu'
      ? 'બાળકનો વર્ગ / ઉંમર જૂથ'
      : language === 'hi'
      ? 'बच्चे की कक्षा / आयु समूह'
      : "Child's Class / Age Group";

  const tContinueBtn =
    language === 'gu'
      ? 'આગળ વધો'
      : language === 'hi'
      ? 'आगे बढ़ें'
      : 'Continue';

  const tLangLabel =
    language === 'gu'
      ? 'ગુજરાતી'
      : language === 'hi'
      ? 'हिन्दी'
      : 'English';

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
      {/* Signature Sky-to-Sunshine Gradient Background */}
      <AppGlobalBackground id="classesBgGrad" />

      <Animated.View
        style={[
          styles.mainContent,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Top Header Row with Back Button & Language Selector */}
        <View style={styles.topBarRow}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={0.75}
            accessibilityLabel="Back"
            accessibilityRole="button"
          >
            <View pointerEvents="none">
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M19 12H5M12 19L5 12L12 5"
                  stroke="#1E1B4B"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.langPill}
            onPress={cycleLanguage}
            activeOpacity={0.8}
            accessibilityLabel="Change Language"
            accessibilityRole="button"
          >
            <GlobeIcon size={15} color="#6D28D9" />
            <Text style={styles.langPillText}>{tLangLabel}</Text>
          </TouchableOpacity>
        </View>

        {/* Center Title and Subtitle */}
        <View style={styles.headerSection}>
          <Text style={styles.headerHeading}>{tHeading}</Text>
          <Text style={styles.headerSubtitle}>{tSubtitle}</Text>
        </View>

        {/* Section Label: Immediate above cards without giant empty gap */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>{tSectionLabel}</Text>
        </View>

        {/* 3 Selection Cards */}
        <View style={styles.cardsContainer}>
          {CLASS_OPTIONS.map((opt) => {
            const isSelected = selectedClassId === opt.id;
            const label =
              language === 'gu'
                ? opt.labelGu
                : language === 'hi'
                ? opt.labelHi
                : opt.labelEn;

            const subLabel =
              language === 'gu'
                ? opt.subGu
                : language === 'hi'
                ? opt.subHi
                : opt.subEn;

            return (
              <TouchableOpacity
                key={opt.id}
                onPress={() => handleSelectClass(opt)}
                activeOpacity={0.85}
                style={[
                  styles.card,
                  isSelected ? styles.cardSelected : styles.cardUnselected,
                ]}
                accessibilityRole="button"
                accessibilityLabel={label}
              >
                {/* Left Icon with Soft Themed Background */}
                <View style={styles.cardIconWrapper}>
                  <ClayBadgeToken art={opt.art} tone={opt.tone} size={48} />
                </View>

                {/* Class & Age Group Title + Subtitle */}
                <View style={styles.cardTextWrapper}>
                  <Text
                    style={[
                      styles.cardTitle,
                      isSelected ? styles.cardTitleSelected : styles.cardTitleUnselected,
                    ]}
                  >
                    {label}
                  </Text>
                  <Text style={styles.cardSubText}>{subLabel}</Text>
                </View>

                {/* Right Selection Radio / Checkmark */}
                <View
                  style={[
                    styles.checkCircle,
                    isSelected ? styles.checkCircleSelected : styles.checkCircleUnselected,
                  ]}
                >
                  {isSelected ? (
                    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M20 6L9 17L4 12"
                        stroke="#FFFFFF"
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Spacer to push continue button nicely to bottom */}
        <View style={styles.flexSpacer} />

        {/* Bottom Full-width Rounded Purple Gradient Continue Button */}
        <View style={styles.bottomContainer}>
          <PurpleGradientButton
            title={tContinueBtn}
            onPress={handleContinue}
            height={56}
            borderRadius={28}
            id="choose-class-continue-btn"
          />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  mainContent: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'ios' ? 8 : 14,
    paddingBottom: Platform.OS === 'ios' ? 24 : 20,
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  langPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6D28D9',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  headerHeading: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E1B4B',
    letterSpacing: -0.4,
    textAlign: 'center',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  sectionHeaderRow: {
    marginBottom: 10,
    marginTop: 4,
    paddingHorizontal: 2,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#334155',
    letterSpacing: -0.2,
  },
  cardsContainer: {
    gap: 12,
  },
  card: {
    minHeight: 74,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
  },
  cardUnselected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardSelected: {
    backgroundColor: '#FBF8FF',
    borderColor: '#8B5CF6',
    borderWidth: 2,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 4,
  },
  cardIconWrapper: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardTextWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    letterSpacing: 0.1,
    marginBottom: 2,
  },
  cardTitleSelected: {
    color: '#6D28D9',
    fontWeight: '800',
  },
  cardTitleUnselected: {
    color: '#1E293B',
    fontWeight: '700',
  },
  cardSubText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  checkCircleSelected: {
    backgroundColor: '#8B5CF6',
  },
  checkCircleUnselected: {
    borderWidth: 1.8,
    borderColor: '#CBD5E1',
    backgroundColor: 'transparent',
  },
  flexSpacer: {
    flex: 1,
    minHeight: 20,
  },
  bottomContainer: {
    width: '100%',
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 8 : 4,
  },
});
