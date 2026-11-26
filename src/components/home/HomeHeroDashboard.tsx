import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Easing } from 'react-native';
import { useSafeRouter } from '../../utils/navigationHelper';
import { AppLanguage, UserProgress } from '../../types';
import { getResumeLesson } from '../../utils/resumeLesson';
import { getLessonDisplayLabels } from '../../data/lessons';
import { ClayButton } from '../clay/ClayButton';
import { kidTones, kidPalette, claySurface, kidRadii } from '../../theme/kidTheme';
import { formatNumberDigits } from '../../utils/languageData';
import { GoldCoinIcon } from '../common/GoldCoinIcon';
import { AppIcon } from '../AppIcon';
import { StarArt, TrophyArt } from '../art3d/Art3D';

const useNative = Platform.OS !== 'web';

type Tri = { gu: string; hi: string; en: string };
const tr = (lang: AppLanguage, s: Tri) => (lang === 'gu' ? s.gu : lang === 'hi' ? s.hi : s.en);

/** Bounces whenever `value` changes (coins / stars). */
function useBounceOnChange(value: number) {
  const scale = useRef(new Animated.Value(1)).current;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    scale.setValue(1.25);
    Animated.spring(scale, { toValue: 1, friction: 3, tension: 160, useNativeDriver: useNative }).start();
  }, [value, scale]);
  return scale;
}

interface Props {
  language: AppLanguage;
  progress: UserProgress;
}

const CATEGORY_NAMES: Record<string, { en: string; gu: string; hi: string }> = {
  animals: { en: 'Animals', gu: 'પ્રાણીઓ', hi: 'जानवर' },
  fruits: { en: 'Fruits & Veggies', gu: 'ફળો અને શાકભાજી', hi: 'फल और सब्जियां' },
  objects: { en: 'Objects', gu: 'વસ્તુઓ', hi: 'वस्तुएं' },
  numbers: { en: 'Numbers', gu: 'એકડા', hi: 'गिनती' },
  math: { en: 'Math', gu: 'ગણિત', hi: 'गणित' },
  'math-time': { en: 'Math', gu: 'ગણિત', hi: 'गणित' },
  'math-addition': { en: 'Math', gu: 'ગણિત', hi: 'गणित' },
  'math-subtraction': { en: 'Math', gu: 'ગણિત', hi: 'गणित' },
  'math-multiplication': { en: 'Math', gu: 'ગણિત', hi: 'गणित' },
  'math-division': { en: 'Math', gu: 'ગણિત', hi: 'गणित' },
  'math-money': { en: 'Math', gu: 'ગણિત', hi: 'गणित' },
  'math-fractions': { en: 'Math', gu: 'ગણિત', hi: 'गणित' },
  'math-patterns': { en: 'Math', gu: 'ગણિત', hi: 'गणित' },
  'math-geometry': { en: 'Math', gu: 'ગણિત', hi: 'गणित' },
  'math-measurement': { en: 'Math', gu: 'ગણિત', hi: 'गणित' },
  ghadiya: { en: 'Tables', gu: 'ઘડિયા', hi: 'पहाड़े' },
  'gu-varnamala': { en: 'Gujarati Alphabet', gu: 'ગુજરાતી કક્કો', hi: 'गुजराती वर्णमाला' },
  'gu-barakhadi': { en: 'Barakhadi', gu: 'બારાખડી', hi: 'बारहखड़ी' },
  'hi-varnamala': { en: 'Hindi Varnamala', gu: 'હિન્દી કક્કો', hi: 'हिंदी वर्णमाला' },
  'en-alphabet': { en: 'Alphabet', gu: 'અંગ્રેજી એબીસીડી', hi: 'अंग्रेजी वर्णमाला' },
  'en-phonics': { en: 'Phonics', gu: 'ફોનિક્સ', hi: 'ध्वनि' },
  'colors-shapes': { en: 'Colors & Shapes', gu: 'રંગો અને આકારો', hi: 'रंग और आकार' },
  science: { en: 'Science', gu: 'વિજ્ઞાન', hi: 'विज्ञान' },
  english: { en: 'English', gu: 'અંગ્રેજી', hi: 'अंग्रेजी' },
  gk: { en: 'GK', gu: 'સામાન્ય જ્ઞાન', hi: 'सामान्य ज्ञान' },
  logic: { en: 'Logic', gu: 'તર્ક', hi: 'तर्क' },
  braingames: { en: 'Brain Games', gu: 'બ્રેઇન ગેમ્સ', hi: 'दिमागी खेल' },
};

export const HomeHeroDashboard: React.FC<Props> = ({ language, progress }) => {
  const router = useSafeRouter();
  const streak = Math.max(0, progress.streakDays || 0);
  const coins = progress.coins || 0;
  const stars = progress.stars || 0;
  const resume = useMemo(() => getResumeLesson(progress.completedLessons || []), [progress.completedLessons]);

  // Flickering flame: gentle looping scale + wobble while a streak is alive.
  const flame = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (streak === 0) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(flame, { toValue: 1, duration: 650, easing: Easing.inOut(Easing.quad), useNativeDriver: useNative }),
        Animated.timing(flame, { toValue: 0, duration: 650, easing: Easing.inOut(Easing.quad), useNativeDriver: useNative }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [streak, flame]);
  const flameScale = flame.interpolate({ inputRange: [0, 1], outputRange: [1, 1.14] });
  const flameRotate = flame.interpolate({ inputRange: [0, 1], outputRange: ['-5deg', '5deg'] });

  const coinScale = useBounceOnChange(coins);
  const starScale = useBounceOnChange(stars);

  const resumeTitle = useMemo(() => {
    if (!resume) return '';
    try {
      const labels = getLessonDisplayLabels(resume, language);
      let title = labels.primaryLabel || resume.title || resume.symbol || '';
      if (title.includes('•')) {
        const parts = title.split('•').map((p) => p.trim());
        if (language === 'hi' && parts.length >= 3) title = parts[2];
        else if (language === 'gu' && parts.length >= 2) title = parts[1];
        else title = parts[0];
      }
      return title;
    } catch {
      let title = resume.title || resume.symbol || '';
      if (title.includes('•')) {
        const parts = title.split('•').map((p) => p.trim());
        if (language === 'hi' && parts.length >= 3) title = parts[2];
        else if (language === 'gu' && parts.length >= 2) title = parts[1];
        else title = parts[0];
      }
      return title;
    }
  }, [resume, language]);

  const categoryLabel = useMemo(() => {
    if (!resume) return '';
    const cat = CATEGORY_NAMES[resume.categoryId || ''];
    if (!cat) return '';
    return language === 'gu' ? cat.gu : language === 'hi' ? cat.hi : cat.en;
  }, [resume, language]);

  return (
    <View style={styles.wrap}>
      {/* Stat bubbles: streak, coins, stars */}
      <View style={styles.statsRow}>
        <View style={[styles.stat, claySurface('coral', 1)]}>
          <Animated.View
            style={[styles.statEmoji, streak === 0 && styles.dim, { transform: [{ scale: flameScale }, { rotate: flameRotate }] }]}
          >
            <AppIcon name="fire" size={32} />
          </Animated.View>
          <Text style={[styles.statValue, { color: kidTones.coral.text }]}>{formatNumberDigits(streak, language)}</Text>
          <Text style={styles.statLabel} numberOfLines={1}>
            {streak === 0
              ? tr(language, { gu: 'શરૂ કરો!', hi: 'शुरू करें!', en: 'Start!' })
              : tr(language, { gu: 'દિવસ', hi: 'दिन', en: streak === 1 ? 'day' : 'days' })}
          </Text>
        </View>

        <View style={[styles.stat, claySurface('sun', 1)]} accessibilityLabel={`${coins} coins`}>
          <Animated.View style={[{ transform: [{ scale: coinScale }] }, { marginBottom: 3 }]}>
            <GoldCoinIcon size={32} />
          </Animated.View>
          <Text style={[styles.statValue, { color: kidTones.sun.text }]}>{formatNumberDigits(coins, language)}</Text>
          <Text style={styles.statLabel} numberOfLines={1}>
            {tr(language, { gu: 'સિક્કા', hi: 'सिक्के', en: 'coins' })}
          </Text>
        </View>

        <View style={[styles.stat, claySurface('lavender', 1)]} accessibilityLabel={`${stars} stars`}>
          <Animated.View style={[styles.statEmoji, { transform: [{ scale: starScale }] }]}>
            <StarArt size={34} />
          </Animated.View>
          <Text style={[styles.statValue, { color: kidTones.lavender.text }]}>{formatNumberDigits(stars, language)}</Text>
          <Text style={styles.statLabel} numberOfLines={1}>
            {tr(language, { gu: 'તારા', hi: 'तारे', en: 'stars' })}
          </Text>
        </View>
      </View>

      {/* One-tap resume */}
      <View style={[styles.resumeCard, claySurface('sky', 2)]}>
        <View style={styles.resumeTextCol}>
          <Text style={styles.resumeKicker} numberOfLines={1}>
            {resume
              ? tr(language, { gu: 'તમારું સાહસ ચાલુ રાખો', hi: 'अपना सफ़र जारी रखें', en: 'Continue your adventure' })
              : tr(language, { gu: 'ચાલો શીખવાનું શરૂ કરીએ!', hi: 'चलो सीखना शुरू करें!', en: "Let's start learning!" })}
          </Text>
          {resume ? (
            <Text style={styles.resumeTitle} numberOfLines={1} ellipsizeMode="tail">
              {resume.symbol && !resumeTitle.includes(resume.symbol) ? `${resume.symbol}  ` : ''}
              {categoryLabel ? `${categoryLabel}: ` : ''}{resumeTitle}
            </Text>
          ) : null}
        </View>
        <ClayButton
          tone="sky"
          size="md"
          title={resume ? tr(language, { gu: 'આગળ ▶', hi: 'आगे ▶', en: 'Resume ▶' }) : tr(language, { gu: 'શરૂ ▶', hi: 'शुरू ▶', en: 'Start ▶' })}
          onPress={() => router.push((resume ? `/lessons/${resume.id}` : '/subjects'))}
          style={styles.resumeBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    gap: 14,
    marginTop: 6,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: kidRadii.card,
  },
  statEmoji: {
    height: 34,
    marginBottom: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dim: {
    opacity: 0.35,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: kidPalette.inkMuted,
  },
  resumeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    overflow: 'hidden',
  },
  resumeTextCol: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  resumeKicker: {
    fontSize: 13,
    fontWeight: '800',
    color: kidTones.sky.text,
  },
  resumeTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: kidPalette.ink,
    marginTop: 2,
    flexShrink: 1,
  },
  resumeBtn: {
    minWidth: 100,
    flexShrink: 0,
  },
});
