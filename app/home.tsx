import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Platform,
  View,
  Text,
  TouchableOpacity,
  type DimensionValue
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { spacing } from '../src/theme/spacing';
import { useApp } from '../src/context/AppContext';
import { BottomNav } from '../src/components/BottomNav';
import { MascotGuide } from '../src/components/MascotGuide';
import { soundEffects } from '../src/services/soundEffects';
import { AgeGroup } from '../src/types';
import { formatChildName } from '../src/utils/nameTransliterator';
import { HomeHeader } from '../src/components/home/HomeHeader';
import { HomeAdventureMapBanner } from '../src/components/home/HomeAdventureMapBanner';
import { DailyMysteryBox } from '../src/components/home/DailyMysteryBox';
import { audioService } from '../src/services/audioService';
import { FeaturedGamesSection } from '../src/components/home/FeaturedGamesSection';
import { HomeQuickFourButtons } from '../src/components/home/HomeQuickFourButtons';
import { HomeSubjectCardsGrid } from '../src/components/home/HomeSubjectCardsGrid';
import { FeatureCards } from '../src/components/home/FeatureCards';
import { GuestNameModal } from '../src/components/common/GuestNameModal';
import { HomeHeroDashboard } from '../src/components/home/HomeHeroDashboard';
import { kidPalette } from '../src/theme/kidTheme';
import { AppGlobalBackground } from '../src/components/common/AppGlobalBackground';
import { PaletteArt } from '../src/components/art3d/Art3D';

let hasConfirmedStandardInSession = false;

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isCompact = width < 360;

  const containerPadding = isCompact ? 20 : isMobile ? 28 : 48;
  const availableContentWidth = Math.min(width, 1200) - containerPadding;

  const bigKidCardWidth: DimensionValue =
    Platform.OS === 'web'
      ? isMobile
        ? 'calc(50% - 5px)'
        : 'calc(25% - 7.5px)'
      : isMobile
        ? Math.floor((availableContentWidth - 10) / 2) - 1
        : Math.floor((availableContentWidth - 30) / 4) - 1;

  const featureBtnWidth: DimensionValue =
    Platform.OS === 'web'
      ? isMobile
        ? 'calc(50% - 4px)'
        : 'calc(25% - 6px)'
      : isMobile
        ? Math.floor((availableContentWidth - 8) / 2) - 1
        : Math.floor((availableContentWidth - 24) / 4) - 1;

  const {
    language,
    setLanguage,
    ageGroup,
    setAgeGroup,
    progress,
    isAuthenticated,
    isGuest,
    isLoading,
    continueAsGuest,
  } = useApp();

  const [showGuestNameModal, setShowGuestNameModal] = useState<boolean>(false);

  useEffect(() => {
    if (
      isGuest &&
      !progress.hasCompletedFirstTimeName &&
      (!progress.childName ||
        progress.childName.trim().toLowerCase() === 'aa' ||
        progress.childName.trim().toLowerCase() === 'bb' ||
        progress.childName === 'Little Star')
    ) {
      setShowGuestNameModal(true);
    }
  }, [isGuest, progress.hasCompletedFirstTimeName, progress.childName]);

  const handleConfirmGuestName = async (name: string, age: AgeGroup, avatar: string) => {
    setShowGuestNameModal(false);
    await continueAsGuest(name, age, avatar, true);
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isGuest) {
      router.replace('/login');
    }
    audioService.prewarmEngine();
  }, [isLoading, isAuthenticated, isGuest, router]);

  const [showClassModal, setShowClassModal] = useState<boolean>(false);

  const cycleLanguage = () => {
    soundEffects.playBubblePop();
    const nextLang = language === 'gu' ? 'en' : language === 'en' ? 'hi' : 'gu';
    setLanguage(nextLang);
  };

  const handleSelectStandard = async (selectedAge: AgeGroup) => {
    soundEffects.playLevelUp();
    await setAgeGroup(selectedAge);
    hasConfirmedStandardInSession = true;
    setShowClassModal(false);
  };

  let rawName =
    progress.childName ||
    [progress.firstName, progress.lastName].filter(Boolean).join(' ') ||
    progress.firstName ||
    '';
  if (rawName.trim().toLowerCase() === 'aa' || rawName.trim().toLowerCase() === 'bb') {
    rawName = 'Little Star';
  }
  const childName = formatChildName(rawName, language);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Signature Sky-to-Sunshine Gradient Background (Image 1 Standard) */}
      <AppGlobalBackground id="homeBgGrad" />

      <ScrollView
        contentContainerStyle={[
          styles.container,
          isMobile && styles.containerMobile,
          isCompact && styles.containerCompact,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Profile Header with Avatar, Greeting & Day Streak Card (Reference 1) */}
        <HomeHeader
          language={language}
          ageGroup={ageGroup}
          streakDays={progress.streakDays || 0}
          childName={childName}
          isCompact={isCompact}
          onCycleLanguage={cycleLanguage}
          showClassModal={showClassModal}
          setShowClassModal={setShowClassModal}
          onSelectStandard={handleSelectStandard}
        />

        {/* 1b. Hero dashboard: live streak flame, coin bank, one-tap resume, daily challenge */}
        <HomeHeroDashboard language={language} progress={progress} />

        {/* 2. Daily Mystery Star Box (High-engagement reward) */}
        <DailyMysteryBox language={language} />

        {/* 3. Top Upar Adventure Map (Master User Request) */}
        <HomeAdventureMapBanner language={language} />

        {/* 3. Pachhi Majedar Games (Screenshots & Master Prompt) */}
        <FeaturedGamesSection language={language} />

        {/* 4. Ena Pachhi Worksheet, Pramanpatra, Sadguno, Sahas 4 Buttons */}
        <HomeQuickFourButtons language={language} />

        {/* 5. P6i Maths, Science, English, etc. Subject Cards */}
        <HomeSubjectCardsGrid language={language} />

        {/* 4. Creative Studio & Learning Activities (All existing features preserved) */}
        <View style={styles.moreActivitiesSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
              <PaletteArt size={26} />
              <Text style={[styles.sectionTitle, { flexShrink: 1 }]}>
                {language === 'gu'
                  ? 'ક્રિએટિવ સ્ટુડિયો અને પ્રવૃત્તિઓ'
                  : language === 'hi'
                    ? 'रचनात्मक स्टूडियो और गतिविधियां'
                    : 'Creative Studio & Activities'}
              </Text>
            </View>
          </View>

          <FeatureCards
            language={language}
            bigKidCardWidth={bigKidCardWidth}
            featureBtnWidth={featureBtnWidth}
          />
        </View>
      </ScrollView>

      {/* Floating Interactive Mascot Guide */}
      <MascotGuide />

      {/* Modern Floating Bottom Navigation Bar (Reference 1) */}
      <BottomNav activeTab="home" />

      {/* Guest Mode Child Setup Modal */}
      <GuestNameModal
        visible={showGuestNameModal}
        language={language}
        initialAgeGroup={ageGroup}
        onConfirm={handleConfirmGuestName}
        onCancel={() => setShowGuestNameModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: 12,
    paddingBottom: 150,
    maxWidth: 520, // Clean mobile-first centered card layout matching Reference 1
    width: '100%',
    alignSelf: 'center',
  },
  containerMobile: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 150,
  },
  containerCompact: {
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 140,
  },
  moreActivitiesSection: {
    width: '100%',
    marginTop: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: kidPalette.ink,
    letterSpacing: -0.2,
  },
});