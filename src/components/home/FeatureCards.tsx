import React from 'react';
import { Image, StyleSheet, Text, View, useWindowDimensions, type DimensionValue } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AppLanguage } from '../../types';
import { HOME_CARD_ART } from '../../utils/imageHelper';
import { ClayPressCard } from './ClayPressCard';
import { useSafeRouter } from '../../utils/navigationHelper';
import type { ImageAsset } from '../../utils/remoteAssets';

interface FeatureCardsProps {
  language: AppLanguage;
  bigKidCardWidth: number | string;
  featureBtnWidth: number | string;
}

/** Candy-clay tones for the cards (fill / border / 3D lip / title). */
const CARD_TONES = {
  coral: { fill: '#FFF1F2', border: '#FECDD3', lip: '#FDA4AF', title: '#9F1239' },
  mint: { fill: '#F0FDF4', border: '#BBF7D0', lip: '#86EFAC', title: '#065F46' },
  gold: { fill: '#FFFBEB', border: '#FDE68A', lip: '#F59E0B', title: '#92400E' },
  lavender: { fill: '#FAF5FF', border: '#E9D5FF', lip: '#D8B4FE', title: '#581C87' },
  sky: { fill: '#0EA5E9', border: '#0284C7', lip: '#0369A1', title: '#FFFFFF' },
} as const;
type CardTone = keyof typeof CARD_TONES;

type Tri = { gu: string; hi: string; en: string };
const tr = (lang: AppLanguage, s: Tri) => (lang === 'gu' ? s.gu : lang === 'hi' ? s.hi : s.en);
const pickArt = (art: { en: ImageAsset; gu: ImageAsset; hi: ImageAsset }, lang: AppLanguage) => (lang === 'gu' ? art.gu : lang === 'hi' ? art.hi : art.en);

export const FeatureCards: React.FC<FeatureCardsProps> = ({ language }) => {
  const router = useSafeRouter();
  const { width } = useWindowDimensions();
  const cardWidth: DimensionValue = width < 768 ? '48%' : '23.5%';
  const artSize = width < 360 ? 72 : width < 768 ? 84 : 88;

  const openAlphabet = () => {
    const alphabetCatId = language === 'hi' ? 'hi-varnamala' : language === 'en' ? 'en-alphabet' : 'gu-varnamala';
    const subParam = alphabetCatId === 'en-alphabet' ? 'all' : 'vyanjan';
    router.push(`/lessons?categoryId=${alphabetCatId}&subcategoryId=${subParam}`);
  };

  const cards: { key: string; tone: CardTone; art: ImageAsset; title: string; label: string; onPress: () => void }[] = [
    {
      key: 'abc',
      tone: 'coral',
      art: pickArt(HOME_CARD_ART.abc, language),
      title: tr(language, { gu: 'ક ખ ગ', hi: 'क ख ग', en: 'A B C' }),
      label: 'Alphabet',
      onPress: openAlphabet,
    },
    {
      key: 'counting',
      tone: 'mint',
      art: pickArt(HOME_CARD_ART.counting, language),
      title: tr(language, { gu: '૧ ૨ ૩', hi: '१ २ ३', en: '1 2 3' }),
      label: 'Counting',
      onPress: () => router.push('/lessons?categoryId=numbers'),
    },
    {
      key: 'animals',
      tone: 'gold',
      art: HOME_CARD_ART.animals,
      title: tr(language, { gu: 'પ્રાણીઓ અને પક્ષીઓ', hi: 'जानवर और पक्षी', en: 'Animals & Birds' }),
      label: 'Animals',
      onPress: () => router.push('/lessons?categoryId=animals'),
    },
    {
      key: 'coloring',
      tone: 'lavender',
      art: HOME_CARD_ART.coloring,
      title: tr(language, { gu: 'રંગ પૂરો', hi: 'रंग भरो', en: 'Coloring' }),
      label: 'Coloring',
      onPress: () => router.push('/coloring'),
    },
  ];

  return (
    <View style={styles.featuresWrapper}>
      {/* ==================== 1. STORY BANNER (Ocean Sky) ==================== */}
      <ClayPressCard
        colors={CARD_TONES.sky}
        onPress={() => router.push('/stories')}
        accessibilityLabel="Listen to Stories"
        style={styles.bannerOuter}
        faceStyle={styles.bannerFace}
      >
        <View style={styles.bannerArtBubble}>
          <Image source={HOME_CARD_ART.storybook} resizeMode="contain" style={styles.bannerArt} />
        </View>
        <View style={styles.bannerTextCol}>
          <Text style={styles.bannerTitle} numberOfLines={1} adjustsFontSizeToFit>
            {tr(language, { gu: 'ચાલો વાર્તા સાંભળીએ!', hi: 'चलो कहानी सुनें!', en: 'Listen to Stories!' })}
          </Text>
          <Text style={styles.bannerSub} numberOfLines={2}>
            {tr(language, {
              gu: 'મજેદાર બોધક વાર્તાઓ અને પંચતંત્ર',
              hi: 'मजेदार ज्ञानवर्धक कहानियां',
              en: 'Moral tales & animated fun',
            })}
          </Text>
        </View>
        <View style={styles.playBtn}>
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Path d="M8 5.5v13l11-6.5z" fill="#0284C7" />
          </Svg>
        </View>
      </ClayPressCard>

      {/* ==================== 2. 4 BIG PRIMARY LEARNING CARDS ==================== */}
      <View style={styles.grid}>
        {cards.map((card) => (
          <ClayPressCard
            key={card.key}
            colors={CARD_TONES[card.tone]}
            onPress={card.onPress}
            accessibilityLabel={card.label}
            style={{ width: cardWidth }}
            faceStyle={styles.cardFace}
          >
            <Image source={card.art} resizeMode="contain" style={{ width: artSize, height: artSize }} />
            <Text style={[styles.cardTitle, { color: CARD_TONES[card.tone].title }]} numberOfLines={2}>
              {card.title}
            </Text>
          </ClayPressCard>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  featuresWrapper: {
    width: '100%',
    marginVertical: 4,
  },
  bannerOuter: {
    width: '100%',
    marginBottom: 14,
  },
  bannerFace: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 14,
    gap: 12,
    minHeight: 96,
  },
  bannerArtBubble: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerArt: {
    width: 68,
    height: 68,
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  bannerSub: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E0F2FE',
    lineHeight: 19,
  },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 4,
    borderBottomColor: '#BAE6FD',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
    width: '100%',
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
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.2,
    lineHeight: 22,
    minHeight: 44,
  },
});
