import React from 'react';
import { Animated, Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { AppLanguage } from '../../types';
import { SUBJECT_CARD_ART } from '../../utils/imageHelper';
import { ClayPressCard, ClayCardColors } from './ClayPressCard';
import { useSafeRouter } from '../../utils/navigationHelper';

interface HomeSubjectCardsGridProps {
  language: AppLanguage;
}

type Tri = { gu: string; hi: string; en: string };
const tr = (lang: AppLanguage, s: Tri) => (lang === 'gu' ? s.gu : lang === 'hi' ? s.hi : s.en);

type SubjectTone = ClayCardColors & { title: string };

/** Candy-clay tones per subject (fill / border / 3D lip / title). */
const SUBJECT_TONES: Record<string, SubjectTone> = {
  math: { fill: '#FFF7ED', border: '#FED7AA', lip: '#FDBA74', title: '#9A3412' }, // warm peach
  science: { fill: '#F0FDF4', border: '#BBF7D0', lip: '#86EFAC', title: '#065F46' }, // spring mint
  english: { fill: '#EFF6FF', border: '#BFDBFE', lip: '#93C5FD', title: '#1E40AF' }, // ocean sky
  gk: { fill: '#FAF5FF', border: '#E9D5FF', lip: '#D8B4FE', title: '#581C87' }, // magic lavender
  logic: { fill: '#FDF2F8', border: '#FBCFE8', lip: '#F472B6', title: '#9D174D' }, // berry pink
  braingames: { fill: '#FFFBEB', border: '#FDE68A', lip: '#FCD34D', title: '#92400E' }, // sunshine gold
};

const CHALLENGE_TONE: ClayCardColors = { fill: '#F5F3FF', border: '#C4B5FD', lip: '#A78BFA' };

export const HomeSubjectCardsGrid: React.FC<HomeSubjectCardsGridProps> = ({ language }) => {
  const router = useSafeRouter();
  const { width } = useWindowDimensions();
  const cardWidth: any = width >= 1000 ? '31.8%' : '48%';
  const artSize = width < 360 ? 70 : width < 768 ? 80 : 84;

  const subjects: { id: keyof typeof SUBJECT_CARD_ART; title: string; route: string }[] = [
    { id: 'math', title: tr(language, { gu: 'ગણિત', hi: 'गणित', en: 'Math' }), route: '/subjects?subjectId=math' },
    { id: 'science', title: tr(language, { gu: 'વિજ્ઞાન', hi: 'विज्ञान', en: 'Science' }), route: '/subjects?subjectId=science' },
    { id: 'english', title: tr(language, { gu: 'અંગ્રેજી', hi: 'अंग्रेजी', en: 'English' }), route: '/subjects?subjectId=english' },
    { id: 'gk', title: tr(language, { gu: 'સામાન્ય જ્ઞાન', hi: 'सामान्य ज्ञान', en: 'GK' }), route: '/subjects?subjectId=gk' },
    { id: 'logic', title: tr(language, { gu: 'તર્ક', hi: 'तर्क', en: 'Logic' }), route: '/subjects?subjectId=logic' },
    { id: 'braingames', title: tr(language, { gu: 'બ્રેઇન ગેમ્સ', hi: 'दिमागी खेल', en: 'Brain Games' }), route: '/games' },
  ];

  return (
    <View style={styles.sectionContainer}>
      {/* ==================== 6 SUBJECT CARDS ==================== */}
      <View style={styles.grid}>
        {subjects.map((item) => {
          const tone = SUBJECT_TONES[item.id];
          return (
            <ClayPressCard
              key={item.id}
              colors={tone}
              onPress={() => router.push(item.route as any)}
              accessibilityLabel={item.title}
              style={{ width: cardWidth }}
              faceStyle={styles.cardFace}
            >
              <Image source={SUBJECT_CARD_ART[item.id]} resizeMode="contain" style={{ width: artSize, height: artSize }} />
              <Text style={[styles.cardTitle, { color: tone.title }]} numberOfLines={2}>
                {item.title}
              </Text>
            </ClayPressCard>
          );
        })}
      </View>

      {/* ==================== TODAY'S CHALLENGE ==================== */}
      <ClayPressCard
        colors={CHALLENGE_TONE}
        sound="levelUp"
        lip={4}
        onPress={() => router.push('/challenge')}
        accessibilityLabel="Today's Challenge"
        style={styles.challengeOuter}
        faceStyle={styles.challengeFace}
        background={
          <Svg width="100%" height="100%">
            <Defs>
              <LinearGradient id="home-challenge-glow" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor="#EDE9FE" />
                <Stop offset="55%" stopColor="#F5F3FF" />
                <Stop offset="100%" stopColor="#E0F2FE" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#home-challenge-glow)" />
          </Svg>
        }
      >
        {(press) => (
          <>
            <View style={styles.starBubble}>
              <Image source={SUBJECT_CARD_ART.star} resizeMode="contain" style={styles.starArt} />
            </View>
            <View style={styles.challengeTextCol}>
              <Text style={styles.challengeHeading} numberOfLines={1} adjustsFontSizeToFit>
                {tr(language, { gu: 'આજનો પડકાર', hi: 'आज की चुनौती', en: "Today's Challenge" })}
              </Text>
              <Text style={styles.challengeSub} numberOfLines={2}>
                {tr(language, {
                  gu: '૫ પ્રશ્નો પૂર્ણ કરો અને સ્ટાર મેળવો!',
                  hi: '५ सवाल पूरे करें और सितारा पाएं!',
                  en: 'Complete 5 questions and earn a star!',
                })}
              </Text>
            </View>
            {/* 3D round arrow button: sinks onto its own lip with the card press */}
            <View style={styles.arrowOuter}>
              <View style={styles.arrowLip} />
              <Animated.View
                style={[
                  styles.arrowFace,
                  { transform: [{ translateY: press.interpolate({ inputRange: [0, 1], outputRange: [0, 4] }) }] },
                ]}
              >
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Path d="M9 5.5L15.5 12L9 18.5" stroke="#FFFFFF" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </Animated.View>
            </View>
          </>
        )}
      </ClayPressCard>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    width: '100%',
    marginVertical: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
    marginBottom: 16,
  },
  cardFace: {
    flex: 1,
    minHeight: 154,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.2,
    lineHeight: 22,
    minHeight: 44,
  },
  challengeOuter: {
    width: '100%',
    marginTop: 4,
  },
  challengeFace: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 14,
    gap: 12,
    minHeight: 92,
  },
  starBubble: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 2,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starArt: {
    width: 62,
    height: 62,
  },
  challengeTextCol: {
    flex: 1,
  },
  challengeHeading: {
    fontSize: 19,
    fontWeight: '900',
    color: '#4C1D95',
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  challengeSub: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    lineHeight: 19,
  },
  arrowOuter: {
    width: 50,
    height: 54,
  },
  arrowLip: {
    position: 'absolute',
    left: 0,
    top: 4,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6D28D9',
  },
  arrowFace: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 2,
  },
});
