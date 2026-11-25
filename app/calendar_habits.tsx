import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/theme/colors';
import { spacing, radii, shadows } from '../src/theme/spacing';
import { useApp } from '../src/context/AppContext';
import { Header } from '../src/components/Header';
import { AppIcon } from '../src/components/AppIcon';
import { ClayBadgeToken } from '../src/components/SubjectBadgeIcons';
import * as Art from '../src/components/art3d/Art3D';

type ArtIcon = React.FC<{ size?: number }>;
import { soundEffects } from '../src/services/soundEffects';
import { audioService } from '../src/services/audioService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppGlobalBackground } from '../src/components/common/AppGlobalBackground';

const { width } = Dimensions.get('window');

type ActiveTab = 'seasons' | 'days' | 'habits';

interface SeasonItem {
  id: string;
  nameGu: string;
  nameHi: string;
  nameEn: string;
  icon: ArtIcon;
  monthsGu: string;
  monthsHi: string;
  monthsEn: string;
  featuresGu: string;
  featuresHi: string;
  featuresEn: string;
  dressIcon: ArtIcon;
  dressNameGu: string;
  dressNameHi: string;
  dressNameEn: string;
  bgColor: string;
  borderColor: string;
}

const SEASONS: SeasonItem[] = [
  {
    id: 'winter',
    nameGu: 'શિયાળો',
    nameHi: 'सर्दियां',
    nameEn: 'Winter Season',
    icon: Art.SnowmanArt,
    monthsGu: 'કાર્તક થી મહા (નવેમ્બર-ફેબ્રુઆરી)',
    monthsHi: 'कार्तिक से माघ (नवंबर-फरवरी)',
    monthsEn: 'November to February',
    featuresGu: 'ઠંડી વાય, ગુલાબી સવાર, ગરમ ચા-દૂધ',
    featuresHi: 'ठंडी हवा, गुलाबी सुबह, गर्म दूध और चाय',
    featuresEn: 'Crisp cool air, cozy mornings & warm hot drinks',
    dressIcon: Art.SweaterArt,
    dressNameGu: 'સ્વેટર & મફલર',
    dressNameHi: 'स्वेटर & मफलर',
    dressNameEn: 'Sweater & Muffler',
    bgColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  {
    id: 'summer',
    nameGu: 'ઉનાળો',
    nameHi: 'गर्मी',
    nameEn: 'Summer Season',
    icon: Art.SunArt,
    monthsGu: 'ફાગણ થી જેઠ (માર્ચ-જૂન)',
    monthsHi: 'फाल्गुन से ज्येष्ठ (मार्च-जून)',
    monthsEn: 'March to June',
    featuresGu: 'ગરમી પડે, મીઠી કેરીઓ ખવાય, ઠંડુ પાણી',
    featuresHi: 'धूप और गर्मी, मीठे आम, ठंडा पानी',
    featuresEn: 'Bright sunny days, sweet mangoes & chilled lemonade',
    dressIcon: Art.CapArt,
    dressNameGu: 'ટોપી & ગોગલ્સ',
    dressNameHi: 'टोपी & चश्मा',
    dressNameEn: 'Cap & Sunglasses',
    bgColor: '#FEF3C7',
    borderColor: '#FCD34D',
  },
  {
    id: 'monsoon',
    nameGu: 'ચોમાસું',
    nameHi: 'बारिश',
    nameEn: 'Monsoon Season',
    icon: Art.RainArt,
    monthsGu: 'અષાઢ થી આસો (જુલાઈ-ઓક્ટોબર)',
    monthsHi: 'आषाढ़ से आश्विन (जुलाई-अक्टूबर)',
    monthsEn: 'July to October',
    featuresGu: 'વરસાદ વરસે, મોર નાચે, હરિયાળી છવાય',
    featuresHi: 'रिमझिम बारिश, नाचता मोर, चारों तरफ हरियाली',
    featuresEn: 'Gentle raindrops, dancing peacocks & green gardens',
    dressIcon: Art.UmbrellaArt,
    dressNameGu: 'છત્રી & રેઈનકોટ',
    dressNameHi: 'छाता & रेनकोट',
    dressNameEn: 'Umbrella & Raincoat',
    bgColor: '#ECFDF5',
    borderColor: '#6EE7B7',
  },
];

const DAYS_OF_WEEK = [
  { gu: 'સોમવાર', hi: 'सोमवार', en: 'Monday', icon: Art.MoonArt, color: '#EFF6FF' },
  { gu: 'મંગળવાર', hi: 'मंगलवार', en: 'Tuesday', icon: Art.HeartArt, color: '#FEF2F2' },
  { gu: 'બુધવાર', hi: 'बुधवार', en: 'Wednesday', icon: Art.SproutArt, color: '#ECFDF5' },
  { gu: 'ગુરુવાર', hi: 'गुरुवार', en: 'Thursday', icon: Art.StarArt, color: '#FEF9C3' },
  { gu: 'શુક્રવાર', hi: 'शुक्रवार', en: 'Friday', icon: Art.FlowerArt, color: '#F3E8FF' },
  { gu: 'શનિવાર', hi: 'शनिवार', en: 'Saturday', icon: Art.DropArt, color: '#DBEAFE' },
  { gu: 'રવિવાર', hi: 'रविवार', en: 'Sunday', icon: Art.SunArt, color: '#FFEDD5' },
];

const GUJARATI_MONTHS = [
  { num: '૧', gu: 'કાર્તક', en: 'Kartak' },
  { num: '૨', gu: 'માગશર', en: 'Magshar' },
  { num: '૩', gu: 'પોષ', en: 'Posh' },
  { num: '૪', gu: 'મહા', en: 'Maha' },
  { num: '૫', gu: 'ફાગણ', en: 'Fagan' },
  { num: '૬', gu: 'ચૈત્ર', en: 'Chaitra' },
  { num: '૭', gu: 'વૈશાખ', en: 'Vaishakh' },
  { num: '૮', gu: 'જેઠ', en: 'Jeth' },
  { num: '૯', gu: 'અષાઢ', en: 'Ashadh' },
  { num: '૧૦', gu: 'શ્રાવણ', en: 'Shravan' },
  { num: '૧૧', gu: 'ભાદરવો', en: 'Bhadarvo' },
  { num: '૧૨', gu: 'આસો', en: 'Aaso' },
];

const HINDI_MONTHS = [
  { num: '१', hi: 'जनवरी', en: 'January' },
  { num: '२', hi: 'फ़रवरी', en: 'February' },
  { num: '३', hi: 'मार्च', en: 'March' },
  { num: '४', hi: 'अप्रैल', en: 'April' },
  { num: '५', hi: 'मई', en: 'May' },
  { num: '६', hi: 'जून', en: 'June' },
  { num: '७', hi: 'जुलाई', en: 'July' },
  { num: '८', hi: 'अगस्त', en: 'August' },
  { num: '९', hi: 'सितंबर', en: 'September' },
  { num: '१०', hi: 'अक्टूबर', en: 'October' },
  { num: '११', hi: 'नवंबर', en: 'November' },
  { num: '१२', hi: 'दिसंबर', en: 'December' },
];

const ENGLISH_MONTHS = [
  { num: '1', name: 'January', icon: Art.SnowmanArt },
  { num: '2', name: 'February', icon: Art.FlowerArt },
  { num: '3', name: 'March', icon: Art.SproutArt },
  { num: '4', name: 'April', icon: Art.RainArt },
  { num: '5', name: 'May', icon: Art.SunArt },
  { num: '6', name: 'June', icon: Art.UmbrellaArt },
  { num: '7', name: 'July', icon: Art.DropArt },
  { num: '8', name: 'August', icon: Art.WeatherArt },
  { num: '9', name: 'September', icon: Art.AppleArt },
  { num: '10', name: 'October', icon: Art.LeafArt },
  { num: '11', name: 'November', icon: Art.MoonArt },
  { num: '12', name: 'December', icon: Art.GiftArt },
];

const HABITS_LIST = [
  {
    id: 'h1',
    titleGu: 'સવારે વહેલા ઊઠવું',
    titleHi: 'सुबह जल्दी उठना',
    titleEn: 'Wake Up Early',
    subGu: 'વહેલા સૂઈને વહેલા ઊઠવું',
    subHi: 'जल्दी सोना और जल्दी उठना',
    subEn: 'Early to bed, early to rise',
    icon: Art.ClockArt,
    coins: 2,
    speakGu: 'સવારે વહેલા ઊઠવું એ ઉત્તમ સ્વાસ્થ્ય આપે છે.',
    speakHi: 'सुबह जल्दी उठना सेहत के लिए बहुत अच्छा होता है।',
    speakEn: 'Waking up early keeps you fresh and energetic!',
  },
  {
    id: 'h2',
    titleGu: 'દાંત સાફ કરવા',
    titleHi: 'दांत साफ करना',
    titleEn: 'Brush Your Teeth',
    subGu: 'રોજ સવારે અને રાત્રે બ્રશ કરો',
    subHi: 'रोजाना दो बार ब्रश करें',
    subEn: 'Brush teeth twice daily',
    icon: Art.ToothArt,
    coins: 2,
    speakGu: 'રોજ બે વાર દાંત સાફ કરવા.',
    speakHi: 'रोजाना दो बार दांत साफ करने चाहिए।',
    speakEn: 'Brushing twice keeps your teeth sparkling clean!',
  },
  {
    id: 'h3',
    titleGu: 'રોજ સ્નાન કરવું',
    titleHi: 'रोज स्नान करना',
    titleEn: 'Take a Daily Bath',
    subGu: 'સ્વચ્છ અને તાજા રહો',
    subHi: 'साफ और तरोताजा रहें',
    subEn: 'Stay fresh and clean every day',
    icon: Art.SoapArt,
    coins: 2,
    speakGu: 'રોજ સ્નાન કરી સ્વચ્છ રહેવું.',
    speakHi: 'रोज स्नान करने से हम दिनभर तरोताजा रहते हैं।',
    speakEn: 'Taking a daily bath keeps you fresh all day!',
  },
  {
    id: 'h4',
    titleGu: 'જમતાં પહેલાં હાથ ધોવા',
    titleHi: 'खाने से पहले हाथ धोना',
    titleEn: 'Wash Hands Cleanly',
    subGu: 'સાબુથી હાથ સ્વચ્છ ધોવા',
    subHi: 'साबुन से हाथ साफ धोएं',
    subEn: 'Wash hands before every meal',
    icon: Art.DropArt,
    coins: 2,
    speakGu: 'જમતાં પહેલાં સાબુથી હાથ ધોવા.',
    speakHi: 'खाना खाने से पहले हमेशा हाथ धोने चाहिए।',
    speakEn: 'Always wash your hands before eating!',
  },
  {
    id: 'h5',
    titleGu: 'માતા-પિતાને પ્રણામ',
    titleHi: 'माता-पिता को प्रणाम',
    titleEn: 'Respect Elders & Parents',
    subGu: 'વડીલો અને ગુરુજીને નમન',
    subHi: 'बड़ों और गुरुजनों का आदर करें',
    subEn: 'Always greet and respect elders',
    icon: Art.HeartArt,
    coins: 2,
    speakGu: 'માતા-પિતા અને વડીલોને પ્રણામ કરવા.',
    speakHi: 'माता-पिता और बड़ों को हमेशा प्रणाम करना चाहिए।',
    speakEn: 'Respecting elders and parents brings true wisdom!',
  },
  {
    id: 'h6',
    titleGu: 'સમયસર સૂઈ જવું',
    titleHi: 'समय पर सो जाना',
    titleEn: 'Sleep on Time',
    subGu: 'પૂરી ૮ કલાક ઊંઘ લેવી',
    subHi: 'पूरी ८ घंटे नींद लें',
    subEn: 'Get 8 hours of peaceful sleep',
    icon: Art.MoonArt,
    coins: 2,
    speakGu: 'સમયસર સૂઈ જઈ પૂરતી ઊંઘ લેવી.',
    speakHi: 'समय पर सोकर पूरी नींद लेनी चाहिए।',
    speakEn: 'Sleeping on time charges you up for a great tomorrow!',
  },
];

export default function CalendarHabitsScreen() {
  const router = useRouter();
  const { addCoins, language } = useApp();

  const activeLang = language || 'en';

  const [activeTab, setActiveTab] = useState<ActiveTab>('seasons');
  const [selectedSeason, setSelectedSeason] = useState<string | null>('winter');
  const [completedHabits, setCompletedHabits] = useState<string[]>([]);

  const todayDateStr = new Date().toISOString().split('T')[0];
  const habitsStorageKey = `@kidszone_daily_habits_${todayDateStr}`;

  useEffect(() => {
    AsyncStorage.getItem(habitsStorageKey).then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setCompletedHabits(parsed);
        } catch {}
      }
    });
    return () => {
      audioService.stop();
      soundEffects.stopAnimalSound();
    };
  }, [habitsStorageKey]);

  // Silence all audio immediately when this screen loses focus or user navigates to another page
  useFocusEffect(
    useCallback(() => {
      return () => {
        audioService.stop();
        soundEffects.stopAnimalSound();
      };
    }, [])
  );

  // Silence all audio immediately when switching tabs (e.g. from Seasons to Days & Months)
  useEffect(() => {
    audioService.stop();
    soundEffects.stopAnimalSound();
    setSelectedSeason(null);
  }, [activeTab]);

  const handleSpeakDay = (day: { gu: string; hi: string; en: string }) => {
    soundEffects.playBubblePop();
    const spoken = activeLang === 'en' ? day.en : activeLang === 'hi' ? day.hi : day.gu;
    audioService.speak(spoken, activeLang);
  };

  const handleSpeakMonth = (mName: string) => {
    soundEffects.playBubblePop();
    const spoken =
      activeLang === 'en'
        ? mName
        : activeLang === 'hi'
        ? `${mName} महीना`
        : `${mName} મહિનો`;
    audioService.speak(spoken, activeLang);
  };

  const handleSpeakSeason = (season: SeasonItem) => {
    soundEffects.playBubblePop();
    setSelectedSeason(season.id);
    const spoken =
      activeLang === 'en'
        ? `${season.nameEn}. Months: ${season.monthsEn}. Weather: ${season.featuresEn}. What to wear: ${season.dressNameEn}.`
        : activeLang === 'hi'
        ? `${season.nameHi}. महीने: ${season.monthsHi}. मौसम: ${season.featuresHi}. पोशाक: ${season.dressNameHi}.`
        : `${season.nameGu}. મહિના: ${season.monthsGu}. વાતાવરણ: ${season.featuresGu}. પહેરવેશ: ${season.dressNameGu}.`;
    audioService.speak(spoken, activeLang);
  };

  const toggleHabit = (habit: typeof HABITS_LIST[0]) => {
    soundEffects.playBubblePop();
    if (completedHabits.includes(habit.id)) {
      const updated = completedHabits.filter((h) => h !== habit.id);
      setCompletedHabits(updated);
      AsyncStorage.setItem(habitsStorageKey, JSON.stringify(updated)).catch(() => {});
    } else {
      soundEffects.playTadaaa();
      const updated = [...completedHabits, habit.id];
      setCompletedHabits(updated);
      AsyncStorage.setItem(habitsStorageKey, JSON.stringify(updated)).catch(() => {});
      addCoins(2);
      const praise =
        activeLang === 'en'
          ? `Great job! ${habit.speakEn}`
          : activeLang === 'hi'
          ? `बहुत बढ़िया! ${habit.speakHi}`
          : `ખૂબ સરસ! ${habit.speakGu}`;
      audioService.speak(praise, activeLang);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppGlobalBackground id="calendarBgGrad" />
      <Header
        title={
          activeTab === 'seasons'
            ? activeLang === 'en'
              ? 'Seasons'
              : activeLang === 'hi'
              ? 'ऋतुएं'
              : 'ઋતુઓ'
            : activeTab === 'days'
            ? activeLang === 'en'
              ? 'Days & Months'
              : activeLang === 'hi'
              ? 'दिन और महीने'
              : 'વાર & મહિના'
            : activeLang === 'en'
            ? 'Daily Habits'
            : activeLang === 'hi'
            ? 'अच्छी आदतें'
            : 'સારી ટેવો'
        }
        showBack={true}
        backHref="/home"
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top 3 Segment Tabs */}
        <View style={[styles.tabBarRow, shadows.soft]}>
          {[
            {
              id: 'seasons' as ActiveTab,
              label: activeLang === 'en' ? 'Seasons' : activeLang === 'hi' ? 'ऋतुएं' : 'ઋતુઓ',
            },
            {
              id: 'days' as ActiveTab,
              label: activeLang === 'en' ? 'Days & Months' : activeLang === 'hi' ? 'दिन और महीने' : 'વાર & મહિના',
            },
            {
              id: 'habits' as ActiveTab,
              label: activeLang === 'en' ? 'Good Habits' : activeLang === 'hi' ? 'अच्छी आदतें' : 'સારી ટેવો',
            },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                onPress={() => {
                  audioService.stop();
                  soundEffects.stopAnimalSound();
                  soundEffects.playBubblePop();
                  setSelectedSeason(null);
                  setActiveTab(tab.id);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabBtnText, isActive && styles.tabBtnTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* TAB 1: ઋતુઓ (SEASONS) */}
        {activeTab === 'seasons' && (
          <View style={styles.sectionCol}>
            <Text style={styles.sectionHeading}>
              {activeLang === 'en'
                ? 'The 3 Main Seasons'
                : activeLang === 'hi'
                ? 'साल की ३ मुख्य ऋतुएं'
                : 'ગુજરાતની ૩ મુખ્ય ઋતુઓ'}
            </Text>
            <Text style={styles.sectionSub}>
              {activeLang === 'en'
                ? 'Tap any season to learn and hear details:'
                : activeLang === 'hi'
                ? 'ऋतु पर टैप करें और उसके बारे में सुनें:'
                : 'ઋતુ પર ટચ કરો અને તેના વિશે સાંભળો:'}
            </Text>

            <View style={styles.seasonsGrid}>
              {SEASONS.map((season) => {
                const isSelected = selectedSeason === season.id;
                return (
                  <TouchableOpacity
                    key={season.id}
                    style={[
                      styles.seasonCard,
                      { backgroundColor: season.bgColor, borderColor: season.borderColor },
                      isSelected && styles.seasonCardSelected,
                      shadows.card,
                    ]}
                    onPress={() => handleSpeakSeason(season)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.seasonTop}>
                      <View style={styles.seasonBigIcon}>{React.createElement(season.icon, { size: 52 })}</View>
                      <View style={styles.seasonTitleCol}>
                        <Text style={styles.seasonTitleGu}>
                          {activeLang === 'en' ? season.nameEn : activeLang === 'hi' ? season.nameHi : season.nameGu}
                        </Text>
                        <Text style={styles.seasonMonths}>
                          {activeLang === 'en' ? season.monthsEn : activeLang === 'hi' ? season.monthsHi : season.monthsGu}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.seasonFeatures}>
                      {activeLang === 'en' ? season.featuresEn : activeLang === 'hi' ? season.featuresHi : season.featuresGu}
                    </Text>

                    <View style={styles.seasonBottomRow}>
                      <View style={styles.dressBadge}>
                        <View style={styles.dressIcon}>{React.createElement(season.dressIcon, { size: 24 })}</View>
                        <Text style={styles.dressNameText} numberOfLines={1}>
                          {activeLang === 'en'
                            ? `Outfit: ${season.dressNameEn}`
                            : activeLang === 'hi'
                            ? `पोशाक: ${season.dressNameHi}`
                            : `પહેરવેશ: ${season.dressNameGu}`}
                        </Text>
                      </View>

                      <View style={styles.listenPill}>
                        <AppIcon name="speaker" size={15} />
                        <Text style={styles.listenPillText}>
                          {activeLang === 'en' ? 'Listen' : activeLang === 'hi' ? 'सुनें' : 'સાંભળો'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* TAB 2: વાર અને મહિના (DAYS & MONTHS) */}
        {activeTab === 'days' && (
          <View style={styles.sectionCol}>
            <Text style={styles.sectionHeading}>
              {activeLang === 'en' ? '7 Days of the Week' : activeLang === 'hi' ? 'सप्ताह के ७ दिन' : 'અઠવાડિયાના ૭ વાર'}
            </Text>
            <View style={styles.daysRowGrid}>
              {DAYS_OF_WEEK.map((day, idx) => (
                <TouchableOpacity
                  key={day.gu}
                  style={[styles.dayCard, { backgroundColor: day.color }, shadows.soft]}
                  onPress={() => handleSpeakDay(day)}
                  activeOpacity={0.8}
                >
                  <View style={styles.dayIcon}>{React.createElement(day.icon, { size: 34 })}</View>
                  <Text style={styles.dayGu}>{activeLang === 'en' ? day.en : activeLang === 'hi' ? day.hi : day.gu}</Text>
                  {activeLang !== 'en' && <Text style={styles.dayEn}>{day.en}</Text>}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionHeading, { marginTop: spacing.xl }]}>
              {activeLang === 'en'
                ? '12 Months of the Year'
                : activeLang === 'hi'
                ? 'साल के १२ महीने'
                : '૧૨ ગુજરાતી મહિના'}
            </Text>
            <View style={styles.monthsGrid}>
              {activeLang === 'en'
                ? ENGLISH_MONTHS.map((m) => (
                    <TouchableOpacity
                      key={m.name}
                      style={[styles.monthCard, shadows.soft]}
                      onPress={() => handleSpeakMonth(m.name)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.monthNumCircle}>
                        <Text style={styles.monthNumText}>{m.num}</Text>
                      </View>
                      <View style={styles.monthTextCol}>
                        <Text style={styles.monthGuText}>{m.name}</Text>
                        <Text style={styles.monthEnText}>Month #{m.num}</Text>
                      </View>
                      {React.createElement(m.icon, { size: 30 })}
                    </TouchableOpacity>
                  ))
                : activeLang === 'hi'
                ? HINDI_MONTHS.map((m) => (
                    <TouchableOpacity
                      key={m.hi}
                      style={[styles.monthCard, shadows.soft]}
                      onPress={() => handleSpeakMonth(m.hi)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.monthNumCircle}>
                        <Text style={styles.monthNumText}>{m.num}</Text>
                      </View>
                      <View style={styles.monthTextCol}>
                        <Text style={styles.monthGuText}>{m.hi}</Text>
                        <Text style={styles.monthEnText}>{m.en}</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                : GUJARATI_MONTHS.map((m) => (
                    <TouchableOpacity
                      key={m.gu}
                      style={[styles.monthCard, shadows.soft]}
                      onPress={() => handleSpeakMonth(m.gu)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.monthNumCircle}>
                        <Text style={styles.monthNumText}>{m.num}</Text>
                      </View>
                      <View style={styles.monthTextCol}>
                        <Text style={styles.monthGuText}>{m.gu}</Text>
                        <Text style={styles.monthEnText}>{m.en}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
            </View>
          </View>
        )}

        {/* TAB 3: સારી ટેવો (GOOD HABITS) */}
        {activeTab === 'habits' && (
          <View style={styles.sectionCol}>
            <Text style={styles.sectionHeading}>
              {activeLang === 'en'
                ? 'Daily Healthy Habits'
                : activeLang === 'hi'
                ? 'दैनिक अच्छी आदतें'
                : 'દૈનિક સારી ટેવો'}
            </Text>
            <Text style={styles.sectionSub}>
              {activeLang === 'en'
                ? 'Which healthy habits did you practice today? Tap to check & earn coins!'
                : activeLang === 'hi'
                ? 'आज आपने कौन-सी अच्छी आदत अपनाई? टैप करें और सिक्के जीतें!'
                : 'તમે આજે કઈ સારી ટેવ પાળી? ટચ કરીને ટીક કરો અને સિક્કા જીતો!'}
            </Text>

            <View style={styles.habitsList}>
              {HABITS_LIST.map((habit) => {
                const isDone = completedHabits.includes(habit.id);

                return (
                  <TouchableOpacity
                    key={habit.id}
                    style={[
                      styles.habitCard,
                      isDone && styles.habitCardDone,
                      shadows.soft,
                    ]}
                    onPress={() => toggleHabit(habit)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.habitEmojiCircle}>
                      <ClayBadgeToken art={habit.icon} tone={isDone ? 'mint' : 'sky'} size={44} />
                    </View>
                    <View style={styles.habitTextCol}>
                      <Text style={[styles.habitTitle, isDone && styles.habitTitleDone]}>
                        {activeLang === 'en'
                          ? habit.titleEn
                          : activeLang === 'hi'
                          ? habit.titleHi
                          : habit.titleGu}
                      </Text>
                      <Text style={styles.habitSub}>
                        {activeLang === 'en'
                          ? habit.subEn
                          : activeLang === 'hi'
                          ? habit.subHi
                          : habit.subGu}
                      </Text>
                    </View>
                    <View style={[styles.checkCircle, isDone && styles.checkCircleDone]}>
                      <Text style={styles.checkMarkText}>{isDone ? '✓' : '+'}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
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
    padding: spacing.md,
    paddingBottom: spacing.xxxl * 2,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },
  tabBarRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: radii.full,
    padding: 4,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: spacing.lg,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#6C5CE7',
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  sectionCol: {
    gap: spacing.md,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  sectionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: -4,
  },
  seasonsGrid: {
    gap: spacing.md,
  },
  seasonCard: {
    borderRadius: 20,
    borderWidth: 2,
    padding: spacing.md,
  },
  seasonCardSelected: {
    borderWidth: 3,
  },
  seasonTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  seasonBigIcon: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seasonTitleCol: {
    flex: 1,
  },
  seasonTitleGu: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  seasonMonths: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
    marginTop: 2,
  },
  seasonFeatures: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '700',
    marginVertical: 4,
  },
  seasonBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  dressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.full,
    gap: 6,
    flexShrink: 1,
    minWidth: 0,
  },
  dressIcon: {
    width: 24,
    height: 24,
    flexShrink: 0,
  },
  dressNameText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    flexShrink: 1,
  },
  listenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    flexShrink: 0,
  },
  listenPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4F46E5',
    includeFontPadding: false,
  },
  daysRowGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  dayCard: {
    width: width > 600 ? '13.5%' : '47.5%',
    borderRadius: 16,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  dayIcon: {
    marginBottom: 4,
  },
  dayGu: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  dayEn: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  monthCard: {
    width: width > 600 ? '23.5%' : '47.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  monthNumCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthNumText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#6C5CE7',
  },
  monthTextCol: {
    flex: 1,
  },
  monthGuText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
  },
  monthEnText: {
    fontSize: 10,
    color: '#64748B',
  },
  habitsList: {
    gap: spacing.sm,
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  habitCardDone: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  habitEmojiCircle: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitTextCol: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  habitTitleDone: {
    color: '#047857',
  },
  habitSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleDone: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkMarkText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
