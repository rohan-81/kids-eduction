import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useSafeRouter } from '../../utils/navigationHelper';
import { soundEffects } from '../../services/soundEffects';
import { AppLanguage } from '../../types';
import { ClayBadgeToken } from '../SubjectBadgeIcons';
import * as Art from '../art3d/Art3D';

interface HomeQuickFourButtonsProps {
  language: AppLanguage;
}

export const HomeQuickFourButtons: React.FC<HomeQuickFourButtonsProps> = ({
  language,
}) => {
  const router = useSafeRouter();
  const { width } = useWindowDimensions();
  const isCompact = width < 360;

  const buttons = [
    {
      id: 'worksheets',
      title: language === 'gu' ? 'વર્કશીટ્સ' : language === 'hi' ? 'वर्कशीट्स' : 'Worksheets',
      sub: language === 'gu' ? 'પીડીએફ ડાઉનલોડ →' : language === 'hi' ? 'पीडीएफ डाउनलोड →' : 'Print PDF →',
      badge: 'PDF',
      badgeBg: '#E0F2FE',
      badgeColor: '#0369A1',
      icon: 'worksheets' as const,
      art: Art.ScrollArt,
      tone: 'sky' as const,
      route: '/worksheets',
    },
    {
      id: 'certificate',
      title: language === 'gu' ? 'પ્રમાણપત્ર' : language === 'hi' ? 'प्रमाणपत्र' : 'Certificate',
      sub: language === 'gu' ? 'એવોર્ડ જુઓ →' : language === 'hi' ? 'अवार्ड देखें →' : 'Print Award →',
      badge: language === 'gu' ? 'ગોલ્ડ' : language === 'hi' ? 'गोल्ड' : 'GOLD',
      badgeBg: '#FEF3C7',
      badgeColor: '#B45309',
      icon: 'certificate' as const,
      art: Art.TrophyArt,
      tone: 'gold' as const,
      route: '/certificate',
    },
    {
      id: 'habits',
      title: language === 'gu' ? 'મોસમો' : language === 'hi' ? 'मौसम' : 'Seasons',
      sub: language === 'gu' ? 'ઋતુઓ & આદતો →' : language === 'hi' ? 'ऋतुएं और आदतें →' : 'Seasons & Habits →',
      badge: language === 'gu' ? 'દૈનિક' : language === 'hi' ? 'दैनिक' : 'DAILY',
      badgeBg: '#DCFCE7',
      badgeColor: '#15803D',
      icon: 'habits' as const,
      art: Art.WeatherArt,
      tone: 'mint' as const,
      route: '/calendar_habits',
    },
    {
      id: 'adventure',
      title: language === 'gu' ? 'સાહસ' : language === 'hi' ? 'साहस' : 'Adventure',
      sub: language === 'gu' ? 'નકશો રમો →' : language === 'hi' ? 'नक्शा खेलें →' : 'Play Quest →',
      badge: language === 'gu' ? '૫૦ લેવલ' : language === 'hi' ? '५० स्तर' : '50 LVL',
      badgeBg: '#FFEDD5',
      badgeColor: '#C2410C',
      icon: 'adventure' as const,
      art: Art.TreasureMapArt,
      tone: 'peach' as const,
      route: '/adventure',
    },
  ];

  return (
    <View style={styles.gridContainer}>
      {buttons.map((btn) => (
        <TouchableOpacity
          key={btn.id}
          style={[
            styles.cardBtn,
            Platform.OS === 'web' && ({
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
            } as any),
          ]}
          onPress={() => {
            soundEffects.playBubblePop();
            router.push(btn.route as any);
          }}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={btn.title}
        >
          <View style={styles.iconBox}>
            <ClayBadgeToken art={btn.art} tone={btn.tone} size={42} />
          </View>
          <View style={styles.textBox}>
            <View style={styles.titleRow}>
              <Text style={styles.titleText} numberOfLines={1} ellipsizeMode="tail">
                {btn.title}
              </Text>
              <View style={[styles.badgePill, { backgroundColor: btn.badgeBg }]}>
                <Text style={[styles.badgeText, { color: btn.badgeColor }]}>
                  {btn.badge}
                </Text>
              </View>
            </View>
            <Text style={styles.subText} numberOfLines={1} ellipsizeMode="tail">
              {btn.sub}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  cardBtn: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  iconBox: {
    // fits the 42px 3D clay token
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textBox: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    minWidth: 0,
    gap: 4,
  },
  titleText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1E293B',
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    letterSpacing: -0.2,
  },
  badgePill: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
    flexShrink: 0,
    marginLeft: 2,
  },
  badgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  subText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#2563EB',
    marginTop: 2,
    minWidth: 0,
  },
});