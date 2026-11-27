import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useSafeRouter, type AppRoute } from '../../utils/navigationHelper';
import Svg, { Path } from 'react-native-svg';
import { spacing, radii } from '../../theme/spacing';
import { soundEffects } from '../../services/soundEffects';
import { AppLanguage } from '../../types';
import { ClayBadgeToken } from '../SubjectBadgeIcons';
import * as Art from '../art3d/Art3D';
import { webStyle } from '../../utils/webStyle';
import type { ArtProps } from '../art3d/Art3D';

interface FeaturedGamesSectionProps {
  language: AppLanguage;
}

interface GameCardItem {
  id: string;
  title: string;
  titleGu: string;
  titleHi: string;
  sub: string;
  subGu: string;
  subHi: string;
  art3d: React.FC<ArtProps>;
  tone: 'peach' | 'mint' | 'sky' | 'lavender' | 'pink' | 'gold';
  badge: string;
  badgeGu?: string;
  badgeHi?: string;
  badgeBg: string;
  badgeColor: string;
  cardBg: string;
  cardBorder: string;
  btnBg: string;
  route: AppRoute;
}

export const FEATURED_GAMES: GameCardItem[] = [
  {
    id: 'picture-puzzle',
    title: 'Jigsaw Puzzle',
    titleGu: 'ચિત્ર પઝલ',
    titleHi: 'चित्र पहेली',
    sub: 'Piece Together Fun Pictures',
    subGu: 'ટુકડા જોડી સુંદર ચિત્ર પૂર્ણ કરો',
    subHi: 'टुकड़े जोड़कर सुंदर तस्वीर बनाएं',
    art3d: Art.JigsawArt,
    tone: 'gold',
    badge: 'Jigsaw',
    badgeGu: 'પઝલ',
    badgeHi: 'पहेली',
    badgeBg: '#FEF3C7',
    badgeColor: '#B45309',
    cardBg: '#FFFFFF',
    cardBorder: '#FDE68A',
    btnBg: '#F59E0B',
    route: '/games/picture-puzzle',
  },
  {
    id: 'picture-matching',
    title: 'Picture Match',
    titleGu: 'ચિત્ર જોડો',
    titleHi: 'चित्र मिलाओ',
    sub: 'Match Pairs of Animals & Fruits',
    subGu: 'ફળો અને પ્રાણીઓની જોડી બનાવો',
    subHi: 'फलों और जानवरों की जोड़ी बनाएं',
    art3d: Art.MemoryCardsArt,
    tone: 'sky',
    badge: 'Matching',
    badgeGu: 'જોડકાં',
    badgeHi: 'जोड़ी',
    badgeBg: '#E0F2FE',
    badgeColor: '#0369A1',
    cardBg: '#FFFFFF',
    cardBorder: '#BAE6FD',
    btnBg: '#0284C7',
    route: '/games/picture-matching',
  },
  {
    id: 'word-builder',
    title: 'Word Builder',
    titleGu: 'શબ્દ જોડો',
    titleHi: 'शब्द जोड़ो',
    sub: 'Spell Letters & Win Coins',
    subGu: 'અક્ષરો જોડી શબ્દો બનાવો',
    subHi: 'अक्षर जोड़ें, शब्द बनाएं',
    art3d: Art.WordTilesArt,
    tone: 'lavender',
    badge: 'Spelling',
    badgeGu: 'શબ્દ',
    badgeHi: 'शब्द',
    badgeBg: '#EDE9FE',
    badgeColor: '#6D28D9',
    cardBg: '#FFFFFF',
    cardBorder: '#DDD6FE',
    btnBg: '#8B5CF6',
    route: '/wordbuilder',
  },
  {
    id: 'duel-battle',
    title: '2-Player Duel',
    titleGu: '૨-પ્લેયર બેટલ',
    titleHi: '२-प्लेयर बैटल',
    sub: 'Head-to-Head Challenge with Parents',
    subGu: 'સામસામે બેસી ઝડપી ક્વિઝ રમો',
    subHi: 'आमने-सामने तेज क्विज़ खेलें',
    art3d: Art.BoxingGlovesArt,
    tone: 'pink',
    badge: 'Multiplayer',
    badgeGu: '૨-પ્લેયર',
    badgeHi: '२-प्लेयर',
    badgeBg: '#FCE7F3',
    badgeColor: '#BE185D',
    cardBg: '#FFFFFF',
    cardBorder: '#FBCFE8',
    btnBg: '#EC4899',
    route: '/games/duel',
  },
  {
    id: 'balloon-pop',
    title: 'Balloon Pop Game',
    titleGu: 'ફુગ્ગા ફોડો રમત',
    titleHi: 'गुब्बारा फोड़ो खेल',
    sub: 'Pop Colorful Balloons & Learn',
    subGu: 'રંગીન ફુગ્ગા ફોડો અને શીખો',
    subHi: 'रंग-बिरंगे गुब्बारे फोड़ें और सीखें',
    art3d: Art.BalloonsArt,
    tone: 'peach',
    badge: 'Popular',
    badgeGu: 'લોકપ્રિય',
    badgeHi: 'लोकप्रिय',
    badgeBg: '#FFEDD5',
    badgeColor: '#C2410C',
    cardBg: '#FFFFFF',
    cardBorder: '#FED7AA',
    btnBg: '#FB923C',
    route: '/games/balloon-pop',
  },
  {
    id: 'shop-game',
    title: 'Supermarket Shop',
    titleGu: 'સુપરમાર્કેટ શોપ',
    titleHi: 'सुपरमार्केट दुकान',
    sub: 'Count Coins & Buy Items',
    subGu: 'સિક્કા ગણો, ખરીદી કરો',
    subHi: 'सिक्के गिनें, खरीदारी करें',
    art3d: Art.ShopCartArt,
    tone: 'gold',
    badge: 'Coins',
    badgeGu: 'સિક્કા',
    badgeHi: 'सिक्के',
    badgeBg: '#FEF3C7',
    badgeColor: '#B45309',
    cardBg: '#FFFFFF',
    cardBorder: '#FDE68A',
    btnBg: '#F59E0B',
    route: '/shopgame',
  },
  {
    id: 'math-quiz',
    title: 'Math Quiz',
    titleGu: 'ગણિત જાદુ ક્વિઝ',
    titleHi: 'गणित जादू क्विज़',
    sub: 'Quick Addition & Subtraction',
    subGu: 'ઝડપી સરવાળા અને બાદબાકી',
    subHi: 'तेज जोड़ और घटाव',
    art3d: Art.MathJellyArt,
    tone: 'peach',
    badge: 'Math',
    badgeGu: 'ગણિત',
    badgeHi: 'गणित',
    badgeBg: '#EFF6FF',
    badgeColor: '#1D4ED8',
    cardBg: '#FFFFFF',
    cardBorder: '#BFDBFE',
    btnBg: '#3B82F6',
    route: '/games/math-quiz',
  },
  {
    id: 'memory-match',
    title: 'Memory Match',
    titleGu: 'મેમરી મેચ ગેમ',
    titleHi: 'मेमोरी मैच खेल',
    sub: 'Flip & Match Pairs',
    subGu: 'કાર્ડ ઉલટાવી જોડી શોધો',
    subHi: 'कार्ड पलटें और जोड़ी खोजें',
    art3d: Art.MemoryCardsArt,
    tone: 'gold',
    badge: 'Memory',
    badgeGu: 'યાદશક્તિ',
    badgeHi: 'याददाश्त',
    badgeBg: '#FEF3C7',
    badgeColor: '#B45309',
    cardBg: '#FFFFFF',
    cardBorder: '#FDE68A',
    btnBg: '#F59E0B',
    route: '/games/memory-match',
  },
];

export const FeaturedGamesSection: React.FC<FeaturedGamesSectionProps> = ({
  language,
}) => {
  const router = useSafeRouter();
  const { width } = useWindowDimensions();
  const isCompact = width < 360;

  return (
    <View style={styles.sectionContainer}>
      {/* Section Header */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleLeft}>
          <View style={{ marginRight: 6 }}>
            <ClayBadgeToken art={Art.BoxingGlovesArt} tone="pink" size={34} />
          </View>
          <View>
            <Text style={styles.sectionTitle}>
              {language === 'gu'
                ? 'મજેદાર ગેમ્સ અને રમતો'
                : language === 'hi'
                  ? 'मजेदार खेल और गेम्स'
                  : 'Fun Learning Games'}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {language === 'gu'
                ? 'રમો, શીખો અને સ્ટાર્સ જીતો!'
                : language === 'hi'
                  ? 'खेलें, सीखें और सितारे जीतें!'
                  : 'Play, learn & win stars!'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.seeAllBtn}
          onPress={() => {
            soundEffects.playBubblePop();
            router.push('/games');
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.seeAllText}>
            {language === 'gu' ? 'બધી રમતો →' : language === 'hi' ? 'सभी खेल →' : 'All Games →'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Carousel of Games */}
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.gamesScroll}
        nestedScrollEnabled={true}
        directionalLockEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        {FEATURED_GAMES.map((game) => {
          const title =
            language === 'gu'
              ? game.titleGu
              : language === 'hi'
                ? game.titleHi
                : game.title;
          const sub =
            language === 'gu'
              ? game.subGu
              : language === 'hi'
                ? game.subHi
                : game.sub;

          return (
            <TouchableOpacity
              key={game.id}
              style={[
                styles.gameCard,
                {
                  backgroundColor: game.cardBg,
                  borderColor: game.cardBorder,
                },
                webStyle({
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                }),
              ]}
              onPress={() => {
                if (Platform.OS === 'web' && typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
                  document.activeElement.blur();
                }
                soundEffects.playBubblePop();
                router.push(game.route);
              }}
              activeOpacity={0.85}
            >
              <View style={styles.gameCardHeader}>
                <ClayBadgeToken art={game.art3d} tone={game.tone} size={44} />
                <View style={[styles.gameBadge, { backgroundColor: game.badgeBg }]}>
                  <Text style={[styles.gameBadgeText, { color: game.badgeColor }]}>
                    {language === 'gu' ? game.badgeGu || game.badge : language === 'hi' ? game.badgeHi || game.badge : game.badge}
                  </Text>
                </View>
              </View>

              <Text style={styles.gameTitle} numberOfLines={1}>
                {title}
              </Text>
              <Text style={styles.gameSub} numberOfLines={2}>
                {sub}
              </Text>

              <View
                style={[
                  styles.gamePlayBtn,
                  {
                    backgroundColor: game.badgeBg,
                    borderColor: game.cardBorder,
                    borderWidth: 1.5,
                  },
                ]}
              >
                <Text style={[styles.gamePlayBtnText, { color: game.badgeColor }]}>
                  ▶ {language === 'gu' ? 'રમો' : language === 'hi' ? 'खेलें' : 'Play Now'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginVertical: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  headerIcon: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  seeAllBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
  },
  seeAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4338CA',
  },
  gamesScroll: {
    gap: 12,
    paddingVertical: 4,
  },
  gameCard: {
    width: 215,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    justifyContent: 'space-between',
  },
  gameCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gameBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 14,
  },
  gameBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  gameSub: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 14,
    fontWeight: '500',
  },
  gamePlayBtn: {
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  gamePlayBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
