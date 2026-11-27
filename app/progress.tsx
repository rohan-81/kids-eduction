import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/theme/colors';
import { spacing, radii, shadows } from '../src/theme/spacing';
import { kidRadii, kidPalette, clayShadow } from '../src/theme/kidTheme';
import { useApp } from '../src/context/AppContext';
import { Header } from '../src/components/Header';
import { BottomNav } from '../src/components/BottomNav';
import { soundEffects } from '../src/services/soundEffects';
import { AppIcon } from '../src/components/AppIcon';
import { MathBadgeIcon, TopicFoodBadge, TopicOurWorldBadge } from '../src/components/SubjectBadgeIcons';
import { LESSONS } from '../src/data/lessons';
import { STORIES_DATA } from '../src/data/storiesData';
import { RHYMES_DATA } from '../src/data/rhymesData';
import { filterLessonsForClass } from '../src/utils/ageDetailHelper';
import Svg, { Path } from 'react-native-svg';
import { formatNumberDigits, formatDurationMinutes } from '../src/utils/languageData';
import { AppGlobalBackground } from '../src/components/common/AppGlobalBackground';
import * as Art from '../src/components/art3d/Art3D';
import { Glyph } from '../src/components/fun/KidIcons';
import { ICON_3D_STAR } from '../src/utils/imageHelper';
import { screenWellnessService, formatLocalDateKey } from '../src/services/screenWellnessService';
import { webStyle } from '../src/utils/webStyle';
import type { AppRoute } from '../src/utils/navigationHelper';

export default function ProgressScreen() {
  const router = useRouter();
  const { progress, language, ageGroup, isAuthenticated, isGuest } = useApp();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isNarrow = width < 360;
  const [, setUsageRefreshTick] = useState(0);

  useEffect(() => {
    const unsubscribe = screenWellnessService.subscribeUsage(() => {
      setUsageRefreshTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  useFocusEffect(
    useCallback(() => {
      screenWellnessService.flushActiveTime();
      setUsageRefreshTick((t) => t + 1);
    }, [])
  );

  if (!isAuthenticated && !isGuest) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppGlobalBackground id="progressLockBgGrad" />
        <Header
          title={language === 'gu' ? 'બાળકની પ્રગતિ' : language === 'hi' ? 'बाल प्रगति' : 'Child Progress'}
          showBack={true}
          backHref="/home"
        />
        <View style={styles.authLockContainer}>
          <View style={[styles.authLockCard, shadows.card]}>
            <View style={styles.authLockIconWrap}>
              <Art.ChartArt size={62} />
            </View>
            <Text style={styles.authLockTitle}>
              {language === 'gu'
                ? 'પ્રગતિ રિપોર્ટ માટે લૉગ ઇન જરૂરી છે'
                : language === 'hi'
                  ? 'प्रगति रिपोर्ट के लिए लॉगिन आवश्यक है'
                  : 'Login Required for Progress'}
            </Text>
            <Text style={styles.authLockDesc}>
              {language === 'gu'
                ? 'બાળકની શીખવાની ગતિ, સાપ્તાહિક ચાર્ટ, વિષયવાર સિદ્ધિઓ અને ક્લાઉડ સિંક જોવા માટે કૃપા કરીને વાલી ખાતામાં લૉગ ઇન કરો.'
                : language === 'hi'
                  ? 'बच्चे की सीखने की गति, साप्ताहिक चार्ट और विषयवार रिपोर्ट देखने के लिए कृपया लॉगिन करें।'
                  : 'Sign in to access detailed child learning analytics, weekly charts, and cloud sync.'}
            </Text>
            <TouchableOpacity
              style={styles.authLockLoginBtn}
              onPress={() => {
                soundEffects.playBubblePop();
                router.push('/login');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.authLockLoginBtnText}>
                {language === 'gu' ? 'લૉગ ઇન કરો' : language === 'hi' ? 'लॉग इन करें' : 'Sign In / Login'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.authLockRegisterBtn}
              onPress={() => {
                soundEffects.playBubblePop();
                router.push('/register');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.authLockRegisterBtnText}>
                {language === 'gu' ? 'નવું ખાતું બનાવો' : language === 'hi' ? 'नया खाता बनाएं' : 'Create Free Account'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <BottomNav activeTab="progress" />
      </SafeAreaView>
    );
  }

  const completedCount = progress.completedLessons ? progress.completedLessons.length : 0;
  const starsCount = progress.stars || 0;
  const coinsCount = progress.coins || 0;
  const streak = progress.streakDays || 1;

  const completedSet = new Set(progress.completedLessons || []);

  // Real Subject Progress breakdown calculated dynamically from actual LESSONS & user progress:
  let langSubjectName = 'English Alphabet';
  let langSubjectNameGu = 'અંગ્રેજી A-Z';
  let langSubjectNameHi = 'अंग्रेजी A-Z';
  let langCatIds: string[] = ['en-alphabet', 'en-phonics'];

  if (language === 'gu') {
    langSubjectName = 'Gujarati Varnamala';
    langSubjectNameGu = 'ગુજરાતી મૂળાક્ષરો (ક ખ ગ)';
    langSubjectNameHi = 'गुजराती वर्णमाला (क ख ग)';
    langCatIds = ['gu-varnamala', 'gu-barakhadi'];
  } else if (language === 'hi') {
    langSubjectName = 'Hindi Varnamala';
    langSubjectNameGu = 'હિન્દી વર્ણમાળા (अ आ क)';
    langSubjectNameHi = 'हिन्दी वर्णमाला (अ आ क)';
    langCatIds = ['hi-varnamala'];
  }

  const rawLangLessons = LESSONS.filter((l) => langCatIds.includes(l.categoryId));
  const langLessons = langCatIds.flatMap((cid) =>
    filterLessonsForClass(rawLangLessons.filter((l) => l.categoryId === cid), ageGroup, cid)
  );
  const langDone = langLessons.filter((l) => completedSet.has(l.id)).length;

  const rawMathLessons = LESSONS.filter((l) =>
    ['numbers', 'math', 'ghadiya'].includes(l.categoryId)
  );
  const mathLessons = [
    ...filterLessonsForClass(rawMathLessons.filter((l) => l.categoryId === 'numbers'), ageGroup, 'numbers'),
    ...filterLessonsForClass(rawMathLessons.filter((l) => l.categoryId === 'math'), ageGroup, 'math'),
    ...filterLessonsForClass(rawMathLessons.filter((l) => l.categoryId === 'ghadiya'), ageGroup, 'ghadiya'),
  ];
  const mathDone = mathLessons.filter((l) => completedSet.has(l.id)).length;

  const rawEnglishLessons = LESSONS.filter((l) => l.categoryId === 'en-alphabet');
  const englishLessons = filterLessonsForClass(rawEnglishLessons, ageGroup, 'en-alphabet');
  const englishDone = englishLessons.filter((l) => completedSet.has(l.id)).length;

  const rawAnimalLessons = LESSONS.filter((l) => l.categoryId === 'animals');
  const animalLessons = filterLessonsForClass(rawAnimalLessons, ageGroup, 'animals');
  const animalDone = animalLessons.filter((l) =>
    completedSet.has(l.id) ||
    completedSet.has(l.id.replace('an-', 'animal-')) ||
    completedSet.has(l.id.replace('animal-', 'an-'))
  ).length;

  const rawFruitsLessons = LESSONS.filter((l) => l.categoryId === 'fruits');
  const fruitsLessons = filterLessonsForClass(rawFruitsLessons, ageGroup, 'fruits');
  const fruitsDone = fruitsLessons.filter((l) => completedSet.has(l.id)).length;

  const rawGkLessons = LESSONS.filter((l) => l.categoryId === 'gk' || l.categoryId.startsWith('gk-'));
  const gkLessons = filterLessonsForClass(rawGkLessons, ageGroup, 'gk');
  const gkDone = gkLessons.filter((l) => completedSet.has(l.id)).length;

  // Rhyme ids come from the bundled catalogue (same `rhyme-${id}` key rhymes.tsx saves), so a
  // renamed or replaced rhyme can never leave a progress slot that is impossible to complete.
  const allStoryRhymeIds = Array.from(
    new Set([
      'story-crow',
      ...STORIES_DATA.map((s) => s.id),
      ...RHYMES_DATA.map((r) => `rhyme-${r.id.replace(/^rhyme-/, '')}`),
    ])
  );

  const targetStoryRhymeIds =
    ageGroup === '2-4'
      ? allStoryRhymeIds.slice(0, 8)
      : ageGroup === '4-6'
        ? allStoryRhymeIds.slice(0, 14)
        : allStoryRhymeIds;

  const storyDone = targetStoryRhymeIds.filter((id) => {
    const clean = id.replace(/^rhyme-/, '');
    return (
      completedSet.has(id) ||
      completedSet.has(clean) ||
      completedSet.has(`rhyme_${clean}`) ||
      (id === 'story-crow' && completedSet.has('story-clever-crow'))
    );
  }).length;
  const storyTotal = targetStoryRhymeIds.length;

  const rawArtLessons = LESSONS.filter((l) => l.categoryId === 'colors-shapes');
  const artLessons = filterLessonsForClass(rawArtLessons, ageGroup, 'colors-shapes');
  const artDone = artLessons.filter((l) => completedSet.has(l.id)).length;

  interface SubjectProgressItem {
    name: string;
    nameGu: string;
    nameHi: string;
    key: string;
    done: number;
    total: number;
    color: string;
    route: AppRoute;
  }

  const subjectProgress: SubjectProgressItem[] = [
    {
      name: langSubjectName,
      nameGu: langSubjectNameGu,
      nameHi: langSubjectNameHi,
      key: 'abc',
      done: langDone,
      total: Math.max(langLessons.length, 1),
      color: '#EC4899',
      route: `/lessons?categoryId=${langCatIds[0]}`,
    },
    {
      name: 'Mathematics',
      nameGu: 'ગણિત અને અંકો',
      nameHi: 'गणित और अंक',
      key: 'math',
      done: mathDone,
      total: Math.max(mathLessons.length, 1),
      color: '#FF7A30',
      route: '/lessons?categoryId=numbers',
    },
    ...(language !== 'en'
      ? [
        {
          name: 'English Alphabet',
          nameGu: 'અંગ્રેજી A-Z',
          nameHi: 'अंग्रेजी A-Z',
          key: 'abc_en',
          done: englishDone,
          total: Math.max(englishLessons.length, 1),
          color: '#3B82F6',
          route: '/lessons?categoryId=en-alphabet',
        },
      ] satisfies SubjectProgressItem[]
      : []),
    {
      name: 'Animals & Birds',
      nameGu: 'પ્રાણીઓ અને પક્ષીઓ',
      nameHi: 'जानवर और पक्षी',
      key: 'animals',
      done: animalDone,
      total: Math.max(animalLessons.length, 1),
      color: '#F59E0B',
      route: '/lessons?categoryId=animals',
    },
    {
      name: 'Fruits & Vegetables',
      nameGu: 'ફળો અને શાકભાજી',
      nameHi: 'फल और सब्जियां',
      key: 'fruits',
      done: fruitsDone,
      total: Math.max(fruitsLessons.length, 1),
      color: '#EA580C',
      route: '/lessons?categoryId=fruits',
    },
    {
      name: 'General Knowledge',
      nameGu: 'સામાન્ય જ્ઞાન',
      nameHi: 'सामान्य ज्ञान',
      key: 'gk',
      done: gkDone,
      total: Math.max(gkLessons.length, 1),
      color: '#8B5CF6',
      route: '/lessons?categoryId=gk',
    },
    {
      name: 'Rhymes & Stories',
      nameGu: 'ગીતો અને વાર્તા',
      nameHi: 'कविताएं और कहानियां',
      key: 'story',
      done: storyDone,
      total: storyTotal,
      color: '#06B6D4',
      route: '/stories',
    },
    {
      name: 'Art & Drawing',
      nameGu: 'ચિત્રકામ અને રંગો',
      nameHi: 'चित्रकला और रंग',
      key: 'art',
      done: artDone,
      total: Math.max(artLessons.length, 1),
      color: '#10B981',
      route: '/lessons?categoryId=colors-shapes',
    },
  ];

  const renderSubjectIcon = (key: string) => {
    switch (key) {
      case 'math':
        return <MathBadgeIcon size={26} />;
      case 'abc':
        return <AppIcon name="abc" size={26} language={language} />;
      case 'abc_en':
        return <AppIcon name="abc" size={26} language="en" />;
      case 'animals':
        return <AppIcon name="animals" size={26} />;
      case 'story':
        return <AppIcon name="story" size={26} />;
      case 'fruits':
        return <TopicFoodBadge size={26} />;
      case 'gk':
        return <TopicOurWorldBadge size={26} />;
      case 'art':
        return <AppIcon name="coloring" size={26} />;
      default:
        return <AppIcon name="abc" size={26} language={language} />;
    }
  };

  // Real active foreground learning time tracked by screenWellnessService (exact minutes per calendar date)
  const totalLearningMinutes = screenWellnessService.getTotalTrackedMinutes();

  // Real Weekly Activity (Mon–Sun of the current calendar week)
  const dayNamesGu = ['સોમ', 'મંગળ', 'બુધ', 'ગુરુ', 'શુક્ર', 'શનિ', 'રવિ'];
  const dayNamesHi = ['सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि', 'रवि'];
  const dayNamesEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const DAY_THEMES = [
    { day: 'Mon', color: '#F59E0B', fill: '#FBBF24', track: '#FEF3C7', border: '#FDE68A' },
    { day: 'Tue', color: '#10B981', fill: '#34D399', track: '#D1FAE5', border: '#A7F3D0' },
    { day: 'Wed', color: '#06B6D4', fill: '#22D3EE', track: '#CFFAFE', border: '#A5F3FC' },
    { day: 'Thu', color: '#8B5CF6', fill: '#A78BFA', track: '#EDE9FE', border: '#DDD6FE' },
    { day: 'Fri', color: '#EC4899', fill: '#F472B6', track: '#FCE7F3', border: '#FBCFE8' },
    { day: 'Sat', color: '#0284C7', fill: '#38BDF8', track: '#E0F2FE', border: '#BAE6FD' },
    { day: 'Sun', color: '#F97316', fill: '#FB923C', track: '#FFEDD5', border: '#FED7AA' },
  ];

  const now = new Date();
  const currentDayOfWeek = (now.getDay() + 6) % 7; // 0=Mon, ..., 5=Sat, 6=Sun
  const mondayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - currentDayOfWeek);

  const todayDayNameGu = ['સોમવાર', 'મંગળવાર', 'બુધવાર', 'ગુરુવાર', 'શુક્રવાર', 'શનિવાર', 'રવિવાર'][currentDayOfWeek];
  const todayDayNameHi = ['सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार', 'रविवार'][currentDayOfWeek];
  const todayDayNameEn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][currentDayOfWeek];

  const DAILY_GOAL_MINUTES = 15;
  const todaySessionMinutes = screenWellnessService.getTodayUsageMinutes();

  const weeklyDays = dayNamesEn.map((dayEn, idx) => {
    const isToday = idx === currentDayOfWeek;
    const isFuture = idx > currentDayOfWeek;
    const theme = DAY_THEMES[idx];

    const dayDate = new Date(
      mondayDate.getFullYear(),
      mondayDate.getMonth(),
      mondayDate.getDate() + idx
    );
    const dayKey = formatLocalDateKey(dayDate);
    const dayMins = isFuture
      ? 0
      : isToday
        ? todaySessionMinutes
        : screenWellnessService.getUsageMinutesForDate(dayKey);
    const isActive = !isFuture && dayMins > 0;

    const label =
      language === 'gu'
        ? dayNamesGu[idx]
        : language === 'hi'
          ? dayNamesHi[idx]
          : dayEn;

    return {
      day: label,
      active: isActive || isToday,
      isToday,
      isFuture,
      mins: dayMins,
      goalReached: dayMins >= DAILY_GOAL_MINUTES,
      theme,
    };
  });

  const weeklyTotalMins = weeklyDays.reduce((acc, d) => acc + (d.isFuture ? 0 : d.mins), 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppGlobalBackground id="progressBgGrad" />
      <Header
        title={language === 'gu' ? 'પ્રગતિ રિપોર્ટ' : language === 'hi' ? 'प्रगति रिपोर्ट' : 'Progress Report'}
        showBack={true}
        backHref="/home"
      />

      <ScrollView
        contentContainerStyle={[styles.container, isMobile && styles.containerMobile]}
        showsVerticalScrollIndicator={false}
      >
        {/* Guest Mode Limitation Notice */}
        {(isGuest || !isAuthenticated) && (
          <View style={styles.guestProgressBanner}>
            <View style={{ marginRight: 10 }}><Art.CloudArt size={31} /></View>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.guestProgressTitle}>
                {language === 'gu'
                  ? 'મહેમાન મોડ: પ્રગતિ ફક્ત આ ઉપકરણ પર છે'
                  : language === 'hi'
                    ? 'अतिथि मोड: प्रगति केवल इस डिवाइस पर है'
                    : 'Guest Session: Saved Locally on this Device'}
              </Text>
              <Text style={styles.guestProgressSub}>
                {language === 'gu'
                  ? 'પ્રગતિ અને તારાઓ કાયમ માટે સાચવવા મફત ખાતું બનાવો.'
                  : language === 'hi'
                    ? 'प्रगति और सितारों को सुरक्षित रखने के लिए मुफ्त खाता बनाएं।'
                    : 'Sign up for free to backup your child’s stars & progress to the cloud.'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.guestProgressBtn}
              onPress={() => {
                soundEffects.playBubblePop();
                router.push('/register');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.guestProgressBtnText}>
                {language === 'gu' ? 'સેવ કરો' : language === 'hi' ? 'सेव करें' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Child Header banner */}
        <View style={[styles.summaryBanner, shadows.card]}>
          <View style={styles.bannerIconCircle}>
            <AppIcon name="certificate" size={38} />
          </View>
          <View style={styles.bannerTextCol}>
            <Text style={styles.bannerTitle}>
              {language === 'gu' ? 'સરસ પ્રગતિ ચાલી રહી છે!' : language === 'hi' ? 'शानदार प्रगति चल रही है!' : 'Keep Up The Great Work!'}
            </Text>
            <Text style={styles.bannerSubtitle}>
              {language === 'gu'
                ? `તમે ${formatNumberDigits(completedCount, language)} પાઠ પૂર્ણ કર્યા છે અને ${formatNumberDigits(starsCount, language)} તારા મેળવ્યા છે!`
                : language === 'hi'
                  ? `आपने ${formatNumberDigits(completedCount, language)} पाठ पूरे किए हैं और ${formatNumberDigits(starsCount, language)} सितारे अर्जित किए हैं!`
                  : `You have completed ${completedCount} lessons and collected ${starsCount} stars!`}
            </Text>
          </View>
        </View>

        {/* 4 Stat Metric Cards (Screenshot 1 Clean White Card Style) */}
        <View style={styles.metricsGrid}>
          <View
            style={[
              styles.metricCard,
              webStyle({
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
              }),
            ]}
          >
            <View style={{ marginBottom: 6 }}>
              <AppIcon name="counting" size={32} language={language} />
            </View>
            <Text style={[styles.metricVal, { color: '#1E293B' }]}>{formatNumberDigits(completedCount, language)}</Text>
            <Text style={styles.metricLabel}>
              {language === 'gu' ? 'પૂર્ણ પાઠ' : language === 'hi' ? 'पूरे पाठ' : 'Lessons Done'}
            </Text>
          </View>

          <View
            style={[
              styles.metricCard,
              webStyle({
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
              }),
            ]}
          >
            <View style={{ marginBottom: 6 }}>
              <AppIcon name="star" size={32} />
            </View>
            <Text style={[styles.metricVal, { color: '#1E293B' }]}>{formatNumberDigits(starsCount, language)}</Text>
            <Text style={styles.metricLabel}>
              {language === 'gu' ? 'કુલ તારા' : language === 'hi' ? 'कुल सितारे' : 'Stars Won'}
            </Text>
          </View>

          <View
            style={[
              styles.metricCard,
              webStyle({
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
              }),
            ]}
          >
            <View style={{ marginBottom: 6 }}>
              <AppIcon name="fire" size={32} />
            </View>
            <Text style={[styles.metricVal, { color: '#1E293B' }]}>
              {formatNumberDigits(streak, language)} {language === 'gu' ? 'દિવસ' : language === 'hi' ? 'दिन' : streak === 1 ? 'Day' : 'Days'}
            </Text>
            <Text style={styles.metricLabel}>
              {language === 'gu' ? 'દૈનિક સ્ટ્રીક' : language === 'hi' ? 'दैनिक स्ट्रीक' : 'Active Streak'}
            </Text>
          </View>

          <View
            style={[
              styles.metricCard,
              webStyle({
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
              }),
            ]}
          >
            <View style={{ marginBottom: 6 }}>
              <AppIcon name="brain" size={32} />
            </View>
            <Text
              style={[styles.metricVal, { color: '#1E293B' }, totalLearningMinutes >= 60 && { fontSize: 16.5 }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatDurationMinutes(totalLearningMinutes, language)}
            </Text>
            <Text style={styles.metricLabel}>
              {language === 'gu' ? 'શીખવાનો સમય' : language === 'hi' ? 'सीखने का समय' : 'Learning Time'}
            </Text>
          </View>
        </View>

        {/* Weekly Activity Tracker - Unique Kids-Friendly 3D Design */}
        <View style={[styles.cardSection, styles.weeklyCardSection, shadows.card]}>
          <View style={styles.weeklyHeaderRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.weeklyTitleBadgeRow}>
                <Text style={styles.sectionTitle}>
                  {language === 'gu' ? 'સાપ્તાહિક શિક્ષણ સારાંશ' : language === 'hi' ? 'साप्ताहिक शिक्षण सारांश' : 'Weekly Learning Summary'}
                </Text>
                <View style={styles.targetGoalPill}>
                  <Text style={styles.targetGoalPillText}>
                    {language === 'gu' ? '🎯 લક્ષ્ય: ૧૫ મિનિટ/દિવસ' : language === 'hi' ? '🎯 लक्ष्य: १५ मिनट/दिन' : '🎯 Target: 15m/Day'}
                  </Text>
                </View>
              </View>
              <Text style={styles.sectionSub}>
                {language === 'gu'
                  ? `ચાલુ સપ્તાહ (સોમ – રવિ) • આજે ${todayDayNameGu}`
                  : language === 'hi'
                    ? `चालू सप्ताह (सोम – रवि) • आज ${todayDayNameHi}`
                    : `Current Week (Mon – Sun) • Today is ${todayDayNameEn}`}
              </Text>
            </View>
            <View style={styles.todayPill}>
              <View style={styles.todayDot} />
              <Text style={styles.todayPillText}>
                {language === 'gu' ? 'આજે' : language === 'hi' ? 'आज' : 'Today'}
              </Text>
            </View>
          </View>

          {/* Weekly Learning Chart */}
          <View style={styles.chartWrapper}>
            {/* 3D Tactile Capsule Bars */}
            <View style={styles.weeklyBarRow}>
              {weeklyDays.map((d, idx) => {
                const fillPercent = d.isFuture
                  ? 0
                  : d.mins > 0
                    ? Math.min(100, Math.max(16, (d.mins / 20) * 100))
                    : 6;

                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.dayCol,
                      d.isToday && styles.dayColToday,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => {
                      soundEffects.playBubblePop();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`${d.day}, ${d.isFuture ? 'Upcoming' : `${d.mins} minutes`}`}
                  >
                    {/* Top Perched Milestone Icon */}
                    <View style={styles.topMilestoneSlot}>
                      {d.goalReached ? (
                        <Image source={ICON_3D_STAR} style={styles.topStarIcon} resizeMode="contain" />
                      ) : d.isToday ? (
                        <View style={styles.todayStarBadge}>
                          <Text style={styles.todayStarBadgeGlyph}>🌟</Text>
                        </View>
                      ) : d.active && d.mins > 0 ? (
                        <View style={styles.miniActiveDot} />
                      ) : d.isFuture ? (
                        <Text style={styles.futureCloudText}>☁️</Text>
                      ) : null}
                    </View>

                    {/* 3D Tactile Candy Capsule Bar */}
                    <View
                      style={[
                        styles.barTrack,
                        isNarrow && styles.barTrackNarrow,
                        {
                          backgroundColor: d.isFuture ? '#F8FAFC' : d.theme.track,
                          borderColor: d.isFuture ? '#E2E8F0' : d.theme.border,
                        },
                        d.isFuture && styles.barTrackFuture,
                        d.isToday && styles.barTrackToday,
                      ]}
                    >
                      {!d.isFuture ? (
                        <View
                          style={[
                            styles.barFill,
                            {
                              height: `${fillPercent}%`,
                              backgroundColor: d.isToday ? '#0284C7' : d.active ? d.theme.fill : '#CBD5E1',
                              borderTopColor: d.isToday ? '#38BDF8' : d.theme.border,
                            },
                          ]}
                        >
                          {/* Inner glass highlight */}
                          <View style={styles.barGlassHighlight} />
                        </View>
                      ) : (
                        <View style={styles.barFillFuture} />
                      )}
                    </View>

                    {/* Day Name */}
                    <Text
                      style={[
                        styles.dayLabel,
                        { color: d.isToday ? '#0284C7' : d.isFuture ? '#94A3B8' : '#334155' },
                        d.isToday && styles.dayLabelToday,
                      ]}
                    >
                      {d.day}
                    </Text>

                    {/* Time Pill */}
                    <View
                      style={[
                        styles.timePill,
                        d.isToday && styles.timePillToday,
                        d.goalReached && !d.isToday && styles.timePillGoal,
                      ]}
                    >
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.dayMins,
                          d.isToday && styles.dayMinsToday,
                          d.goalReached && !d.isToday && styles.dayMinsGoal,
                          d.isFuture && styles.dayMinsFuture,
                        ]}
                      >
                        {d.isFuture ? '–' : formatDurationMinutes(d.mins, language, true)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Cheerful Bottom Summary Row */}
          <View style={styles.weeklyFooterRow}>
            <View style={styles.weeklyFooterCol}>
              <Text style={styles.weeklyFooterLabel}>
                {language === 'gu' ? 'આ અઠવાડિયે શિક્ષણ:' : language === 'hi' ? 'इस सप्ताह अध्ययन:' : 'This Week Learning:'}
              </Text>
              <View style={styles.weeklyFooterValueRow}>
                <Image source={ICON_3D_STAR} style={styles.footerStarIcon} resizeMode="contain" />
                <Text style={styles.weeklyFooterValue} numberOfLines={1} adjustsFontSizeToFit>
                  {formatDurationMinutes(weeklyTotalMins, language)}
                </Text>
              </View>
            </View>

            <View style={styles.weeklyFooterDivider} />

            <View style={styles.weeklyFooterCol}>
              <Text style={styles.weeklyFooterLabel}>
                {language === 'gu' ? 'દૈનિક લક્ષ્ય સ્થિતિ:' : language === 'hi' ? 'दैनिक लक्ष्य स्थिति:' : 'Daily Goal Status:'}
              </Text>
              <View style={styles.weeklyFooterValueRow}>
                <Text style={styles.weeklyGoalBadge}>
                  {todaySessionMinutes >= DAILY_GOAL_MINUTES
                    ? (language === 'gu' ? `${formatNumberDigits(15, language)} મિનિટ લક્ષ્ય પૂર્ણ! ⭐` : language === 'hi' ? `${formatNumberDigits(15, language)} मिनट लक्ष्य पूर्ण! ⭐` : '15m Goal Met! ⭐')
                    : (language === 'gu' ? `${formatNumberDigits(todaySessionMinutes, language)}/${formatNumberDigits(15, language)} મિનિટ પ્રગતિ 🚀` : language === 'hi' ? `${formatNumberDigits(todaySessionMinutes, language)}/${formatNumberDigits(15, language)} मिनट प्रगति 🚀` : `${todaySessionMinutes}/15m In Progress 🚀`)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Subject-Wise Mastery Progress */}
        <View style={[styles.cardSection, shadows.card]}>
          <Text style={styles.sectionTitle}>
            {language === 'gu' ? 'વિષયવાર નિપુણતા' : language === 'hi' ? 'विषयवार दक्षता' : 'Subject-Wise Progress'}
          </Text>

          <View style={styles.subjectList}>
            {subjectProgress.map((sub, idx) => {
              const pct = sub.total > 0 ? Math.min(100, Math.round((sub.done / sub.total) * 100)) : 0;
              const isMastered = pct >= 100;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.subjectCardItem,
                    webStyle({
                      boxShadow: '0 8px 24px rgba(128, 98, 245, 0.08), 0 2px 6px rgba(0, 0, 0, 0.03)',
                      cursor: 'pointer',
                    }),
                  ]}
                  onPress={() => {
                    soundEffects.playBubblePop();
                    router.push(sub.route);
                  }}
                  activeOpacity={0.88}
                  accessibilityRole="button"
                  accessibilityLabel={`${sub.name}, ${sub.done} of ${sub.total} completed`}
                >
                  {/* Left Embossed Icon Container */}
                  <View style={styles.subjectIconBox}>
                    {renderSubjectIcon(sub.key)}
                  </View>

                  {/* Middle Content */}
                  <View style={styles.subjectInfoCol}>
                    <Text style={styles.subjectTitleText} numberOfLines={1}>
                      {language === 'gu' ? sub.nameGu : language === 'hi' ? sub.nameHi : sub.name}
                    </Text>
                    <Text style={styles.subjectSubText} numberOfLines={1}>
                      {formatNumberDigits(sub.done, language)} / {formatNumberDigits(sub.total, language)} {language === 'gu' ? 'પાઠ પૂર્ણ' : language === 'hi' ? 'पाठ पूरे' : 'lessons completed'}
                    </Text>

                    <View style={styles.progressRow}>
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: pct > 0 ? `${Math.min(100, pct)}%` : '0%',
                              opacity: pct > 0 ? 1 : 0,
                              backgroundColor: isMastered ? '#10B981' : '#0284C7',
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressCount}>{formatNumberDigits(pct, language)}%</Text>
                    </View>
                  </View>

                  {/* Right Circular 3D Purple Chevron Indicator */}
                  <View
                    style={[
                      styles.circularActionButton,
                      isMastered && styles.circularActionButtonMastered,
                    ]}
                  >
                    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                      <Path
                        d={isMastered ? 'M5 13L9 17L19 7' : 'M9 18L15 12L9 6'}
                        stroke="#FFFFFF"
                        strokeWidth={isMastered ? 3 : 2.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Parents Dashboard Link */}
        <TouchableOpacity
          style={[styles.parentGateBtn, shadows.soft]}
          onPress={() => {
            soundEffects.playBubblePop();
            router.push('/parent');
          }}
          activeOpacity={0.85}
        >
          <View style={styles.parentGateTextCol}>
            <Text style={styles.parentGateTitle}>
              {language === 'gu' ? 'વાલીઓ માટે કંટ્રોલ પેનલ' : language === 'hi' ? 'अभिभावक नियंत्रण पैनल' : 'Parent Control Dashboard'}
            </Text>
            <Text style={styles.parentGateSub}>
              {language === 'gu' ? 'સ્ક્રીન ટાઈમ મર્યાદા અને સિક્યોરિટી પિન' : language === 'hi' ? 'स्क्रीन समय सीमा और पिन नियंत्रण' : 'Screen time limits, eye care & detailed certificates'}
            </Text>
          </View>
          <Glyph name="next" size={17} color={'#2563EB'} strokeWidth={3} />
        </TouchableOpacity>

        <View style={{ height: 90 }} />
      </ScrollView>

      <BottomNav activeTab="progress" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  containerMobile: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  summaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  bannerIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  bannerEmoji: {
    fontSize: 28,
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    fontWeight: '500',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    padding: 16,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
    // design system: clay
    borderRadius: kidRadii.card,
    borderWidth: 1.5,
    ...clayShadow(2),
  },
  metricEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  metricVal: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  cardSection: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    marginBottom: 18,
    borderColor: '#E2E8F0',
    // design system: clay
    borderRadius: kidRadii.card,
    borderWidth: 1.5,
    ...clayShadow(2),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  sectionSub: {
    fontSize: 12.5,
    color: '#64748B',
    marginBottom: 16,
  },
  weeklyCardSection: {
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderBottomWidth: 5,
    borderBottomColor: '#CBD5E1',
    padding: 16,
    paddingTop: 18,
    backgroundColor: '#FFFFFF',
  },
  weeklyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  weeklyTitleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  targetGoalPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  targetGoalPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
  },
  todayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  todayDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#0284C7',
    marginRight: 5,
  },
  todayPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0284C7',
  },
  chartWrapper: {
    marginTop: 4,
    marginBottom: 4,
  },
  weeklyBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    minHeight: 165,
    paddingTop: 10,
    paddingHorizontal: 2,
  },
  dayCol: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 46,
    paddingVertical: 4,
    borderRadius: 14,
  },
  dayColToday: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
  },
  topMilestoneSlot: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  topStarIcon: {
    width: 20,
    height: 20,
  },
  todayStarBadge: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayStarBadgeGlyph: {
    fontSize: 14,
  },
  miniActiveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  futureCloudText: {
    fontSize: 12,
    opacity: 0.5,
  },
  barTrack: {
    height: 92,
    width: 30,
    borderRadius: 15,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderWidth: 2,
    marginBottom: 6,
    ...Platform.select({
      web: webStyle({ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)' }),
    }),
  },
  barTrackNarrow: {
    width: 22,
    borderRadius: 11,
  },
  barTrackFuture: {
    borderStyle: 'dashed',
    opacity: 0.6,
  },
  barTrackToday: {
    borderWidth: 2.5,
    borderColor: '#0284C7',
    ...Platform.select({
      web: webStyle({ boxShadow: '0 0 10px rgba(2, 132, 199, 0.25)' }),
    }),
  },
  barFill: {
    width: '100%',
    borderRadius: 13,
    position: 'relative',
    overflow: 'hidden',
  },
  barGlassHighlight: {
    position: 'absolute',
    left: 2,
    top: 2,
    bottom: 2,
    width: 3.5,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  barFillFuture: {
    height: 0,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 3,
  },
  dayLabelToday: {
    color: '#0284C7',
    fontWeight: '700',
  },
  timePill: {
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    minWidth: 34,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  timePillToday: {
    backgroundColor: '#0284C7',
  },
  timePillGoal: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
    borderWidth: 1,
  },
  dayMins: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '700',
  },
  dayMinsToday: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dayMinsGoal: {
    color: '#92400E',
    fontWeight: '700',
  },
  dayMinsFuture: {
    color: '#94A3B8',
  },
  weeklyFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  weeklyFooterCol: {
    flex: 1,
  },
  weeklyFooterDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
  },
  weeklyFooterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  weeklyFooterValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerStarIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  weeklyFooterValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  weeklyGoalBadge: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0284C7',
  },
  subjectList: {
    gap: 16,
  },
  subjectCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderColor: '#F1EDFF',
    marginBottom: 4,
    ...(webStyle({
      boxShadow: '0 8px 24px rgba(128, 98, 245, 0.08), 0 2px 6px rgba(0, 0, 0, 0.03)',
      cursor: 'pointer',
    })),
    // design system: clay
    borderRadius: kidRadii.card,
    borderWidth: 1.5,
    ...clayShadow(2),
  },
  subjectIconBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EAE6F8',
    ...(webStyle({
      boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.8), 0 2px 4px rgba(0, 0, 0, 0.03)',
    })),
  },
  subjectInfoCol: {
    flex: 1,
    marginHorizontal: 14,
    justifyContent: 'center',
  },
  subjectTitleText: {
    fontSize: 16.5,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  subjectSubText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EBE8F7',
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  progressCount: {
    marginLeft: 10,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  circularActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 14px rgba(128, 98, 245, 0.4)',
      cursor: 'pointer',
    } : {
      elevation: 4,
      shadowColor: '#0284C7',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.35,
      shadowRadius: 6,
    }),
  },
  circularActionButtonMastered: {
    backgroundColor: '#10B981',
    ...(webStyle({
      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
    })),
  },
  parentGateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    // design system: clay
    minHeight: 52,
    borderRadius: kidRadii.pill,
    justifyContent: 'center',
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(15, 23, 42, 0.22)',
  },
  parentGateTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  parentGateTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 3,
  },
  parentGateSub: {
    fontSize: 12,
    color: '#64748B',
  },
  parentGateArrow: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '700',
  },
  authLockContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  authLockCard: {
    backgroundColor: '#FFFFFF',
    padding: 28,
    alignItems: 'center',
    maxWidth: 420,
    width: '100%',
    borderColor: '#E2E8F0',
    // design system: clay
    borderRadius: kidRadii.card,
    borderWidth: 1.5,
    ...clayShadow(2),
  },
  authLockIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#C7D2FE',
  },
  authLockTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  authLockDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  authLockLoginBtn: {
    backgroundColor: '#7C3AED',
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    // design system: clay
    minHeight: 52,
    borderRadius: kidRadii.pill,
    justifyContent: 'center',
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(15, 23, 42, 0.22)',
  },
  authLockLoginBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  authLockRegisterBtn: {
    backgroundColor: '#F5EEFE',
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
    paddingVertical: 13,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    // design system: clay
    minHeight: 52,
    borderRadius: kidRadii.pill,
    justifyContent: 'center',
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(15, 23, 42, 0.22)',
  },
  authLockRegisterBtnText: {
    color: '#7C3AED',
    fontSize: 14.5,
    fontWeight: '600',
  },
  guestProgressBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderRadius: 18,
    padding: 14,
    marginBottom: spacing.md,
  },
  guestProgressIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  guestProgressTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#78350F',
    marginBottom: 2,
  },
  guestProgressSub: {
    fontSize: 11,
    color: '#92400E',
    lineHeight: 15,
    fontWeight: '600',
  },
  guestProgressBtn: {
    backgroundColor: '#8062F5',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    ...(webStyle({
      cursor: 'pointer',
    })),
  },
  guestProgressBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '600',
  },
});
