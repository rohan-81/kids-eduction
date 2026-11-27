import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Platform,
} from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { soundEffects } from '../../services/soundEffects';
import { Bouncy3DButton } from '../common/Bouncy3DButton';
import { AppLanguage } from '../../types';
import { FANTASY_ADVENTURE_HEADER } from '../../utils/imageHelper';
import { resolveOfflineMediaSource } from '../../utils/remoteAssets';
import { formatNumberDigits } from '../../utils/languageData';
import { useApp } from '../../context/AppContext';
import { Glyph } from '../fun';
import { TreasureMapArt } from '../art3d/Art3D';
import { useSafeRouter } from '../../utils/navigationHelper';
import { webStyle } from '../../utils/webStyle';

interface HomeAdventureMapBannerProps {
  language: AppLanguage;
}

export const HomeAdventureMapBanner: React.FC<HomeAdventureMapBannerProps> = ({
  language,
}) => {
  const router = useSafeRouter();
  const { progress } = useApp();
  const { width } = useWindowDimensions();
  const isCompact = width < 360;
  const [isNavigating, setIsNavigating] = useState(false);

  const currentLevel = progress.adventureLevel || 1;

  const handleOpenAdventure = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    soundEffects.playBubblePop();
    router.push('/adventure');
    setTimeout(() => {
      setIsNavigating(false);
    }, 1500);
  };

  return (
    <Bouncy3DButton
      disabled={isNavigating}
      style={[
        styles.bannerCard,
        webStyle({
          boxShadow: '0 8px 24px rgba(234, 88, 12, 0.15), 0 2px 8px rgba(0, 0, 0, 0.04)',
        }),
      ]}
      onPress={handleOpenAdventure}
      accessibilityLabel="Adventure Map"
    >
      {/* Background 3D Fantasy Island Adventure Poster */}
      <Image
        source={resolveOfflineMediaSource(FANTASY_ADVENTURE_HEADER)}
        style={styles.bannerImage}
        resizeMode="cover"
      />

      {/* Dark/Vibrant Gradient Overlay for readability */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="advOverlayGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#1E1B4B" stopOpacity="0.88" />
              <Stop offset="45%" stopColor="#312E81" stopOpacity="0.75" />
              <Stop offset="100%" stopColor="#EA580C" stopOpacity="0.82" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#advOverlayGrad)" />
        </Svg>
      </View>

      {/* Content Area */}
      <View style={styles.contentContainer}>
        {/* Top Badges */}
        <View style={styles.badgesRow}>
          <View style={[styles.badgePill, { flexDirection: 'row', alignItems: 'center', gap: 5 }]}>
            <TreasureMapArt size={18} />
            <Text style={styles.badgePillText}>
              {language === 'gu' ? '૫૦ સાહસિક લેવલ' : language === 'hi' ? '५० साहसिक स्तर' : '50 Island Levels'}
            </Text>
          </View>
          <View style={[styles.levelPill, { flexDirection: 'row', alignItems: 'center', gap: 5 }]}>
            <Glyph name="star" size={12} color="#CA8A04" strokeWidth={1.5} />
            <Text style={styles.levelPillText}>
              {language === 'gu' ? `લેવલ ${formatNumberDigits(currentLevel, language)}` : language === 'hi' ? `लेवल ${formatNumberDigits(currentLevel, language)}` : `Level ${currentLevel}`}
            </Text>
          </View>
        </View>

        {/* Title & Description */}
        <Text style={styles.bannerTitle} numberOfLines={1}>
          {language === 'gu' ? 'સાહસિક સફર મેપ' : language === 'hi' ? 'साहसिक सफर नक्शा' : 'Learning Adventure Map'}
        </Text>
        <Text style={styles.bannerSubtitle} numberOfLines={2}>
          {language === 'gu'
            ? 'ટાપુઓ પર સફર કરો, પ્રશ્નો ઉકેલો અને ગોલ્ડન મુગટ જીતો!'
            : language === 'hi'
            ? 'द्वीपों पर यात्रा करें, प्रश्न हल करें और स्वर्ण मुकुट जीतें!'
            : 'Conquer islands, solve quests & win the Royal Crown!'}
        </Text>

        {/* Action Button */}
        <View style={[styles.actionBtn, { flexDirection: 'row', alignItems: 'center', gap: 5 }, isNavigating && { opacity: 0.9, backgroundColor: '#FEF3C7' }]}>
          <Text style={styles.actionBtnText}>
            {isNavigating
              ? (language === 'gu' ? 'શરૂ થઈ રહ્યું છે...' : language === 'hi' ? 'शुरू हो रहा है...' : 'Opening...')
              : (language === 'gu' ? 'સાહસ શરૂ કરો' : language === 'hi' ? 'साहस शुरू करें' : 'Play Adventure')}
          </Text>
          <Glyph name={isNavigating ? 'star' : 'next'} size={14} color="#EA580C" strokeWidth={3} />
        </View>
      </View>
    </Bouncy3DButton>
  );
};

const styles = StyleSheet.create({
  bannerCard: {
    width: '100%',
    height: 165,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 14,
    backgroundColor: '#312E81',
    borderWidth: 1.5,
    borderColor: '#FDBA74',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  badgePillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  levelPill: {
    backgroundColor: '#FEF08A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  levelPillText: {
    color: '#854D0E',
    fontSize: 11,
    fontWeight: '700',
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bannerSubtitle: {
    color: '#FED7AA',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  actionBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  actionBtnText: {
    color: '#EA580C',
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
