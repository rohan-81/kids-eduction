import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Rect, Circle, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { AppLanguage } from '../../types';
import { useApp } from '../../context/AppContext';
import { soundEffects } from '../../services/soundEffects';
import { getTodayDateKey, getRemainingTimeToMidnight } from '../../services/storageService';
import { formatMathExpression } from '../../utils/languageData';
import { DailyMysteryModal } from './DailyMysteryModal';
import { Glyph } from '../fun';
import { StarArt } from '../art3d/Art3D';

interface DailyMysteryBoxProps {
  language: AppLanguage;
}

export const DailyMysteryBox: React.FC<DailyMysteryBoxProps> = ({ language }) => {
  const { progress, updateProgress } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [persistentClaimedDate, setPersistentClaimedDate] = useState<string | null>(null);

  const today = getTodayDateKey();
  const isClaimedToday = progress.lastMysteryClaimDate === today || persistentClaimedDate === today;

  const [countdown, setCountdown] = useState<string>(() => getRemainingTimeToMidnight());

  useEffect(() => {
    // Check persistent storage backup on mount
    AsyncStorage.getItem('@kidszone_mystery_last_claimed')
      .then((val) => {
        if (val) setPersistentClaimedDate(val);
      })
      .catch(() => {});
  }, [progress.lastMysteryClaimDate]);

  useEffect(() => {
    if (!isClaimedToday) return;
    const timer = setInterval(() => {
      setCountdown(getRemainingTimeToMidnight());
    }, 1000);
    return () => clearInterval(timer);
  }, [isClaimedToday]);

  const handleClaim = async (stars: number, coins: number, stickerId?: string) => {
    if (isClaimedToday) return;
    setPersistentClaimedDate(today);
    await AsyncStorage.setItem('@kidszone_mystery_last_claimed', today).catch(() => {});

    const currentUnlocked = progress.unlockedStickers || [];
    const updatedUnlocked = stickerId && !currentUnlocked.includes(stickerId)
      ? [...currentUnlocked, stickerId]
      : currentUnlocked;

    await updateProgress({
      stars: (progress.stars || 0) + stars,
      coins: (progress.coins || 0) + coins,
      unlockedStickers: updatedUnlocked,
      lastMysteryClaimDate: today,
      mysteryRewardsClaimedCount: (progress.mysteryRewardsClaimedCount || 0) + 1,
    });
  };

  const title =
    language === 'gu'
      ? 'દૈનિક જાદુઈ બોક્સ'
      : language === 'hi'
      ? 'दैनिक जादुई बॉक्स'
      : 'Daily Mystery Box';

  const formattedCountdown = formatMathExpression(countdown, language);
  const subtitle = isClaimedToday
    ? language === 'gu'
      ? `આજનું ઇનામ મેળવી લીધું છે! નવું બોક્સ: ${formattedCountdown}`
      : language === 'hi'
      ? `आज का इनाम प्राप्त हो चुका है! नया बॉक्स: ${formattedCountdown}`
      : `Reward collected! Next mystery box in: ${countdown}`
    : language === 'gu'
    ? 'આજનો સરપ્રાઈઝ બોક્સ ખોલો અને +૧૫ તારા જીતો!'
    : language === 'hi'
    ? 'आज का सरप्राइज़ बॉक्स खोलें और +१५ सितारे जीतें!'
    : 'Open today’s secret box to win +15 stars & coins!';

  return (
    <>
      <TouchableOpacity
        style={[
          styles.cardContainer,
          Platform.OS === 'web' && ({
            boxShadow: '0 8px 24px rgba(128, 98, 245, 0.08), 0 2px 6px rgba(0, 0, 0, 0.02)',
            cursor: 'pointer',
          } as any),
        ]}
        onPress={() => {
          soundEffects.playBubblePop();
          setModalOpen(true);
        }}
        activeOpacity={0.88}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        {/* Left 3D Gift Box Icon in Embossed Squircle (Solid Multi-Layered 3D Render) */}
        <View style={styles.giftIconSquircle}>
          <Svg width={46} height={46} viewBox="0 0 46 46" fill="none">
            {/* 3D Bottom Ground Shadow */}
            <Rect x="6" y="37" width="34" height="4" rx="2" fill="#E2E8F0" />
            {/* Box Body - 3D Shadow Base */}
            <Rect x="7" y="16" width="32" height="23" rx="5" fill="#6D28D9" />
            {/* Box Body - Vibrant Purple Main */}
            <Rect x="7" y="14" width="32" height="23" rx="5" fill="#8B5CF6" />
            {/* Subtle Left Highlight Sheen */}
            <Rect x="8" y="15" width="3" height="21" rx="1.5" fill="#A78BFA" opacity={0.6} />
            {/* Horizontal Ribbon - Shadow & Gold */}
            <Rect x="7" y="24" width="32" height="5.5" fill="#D97706" />
            <Rect x="7" y="23" width="32" height="5.5" fill="#F59E0B" />
            <Rect x="7" y="23" width="32" height="1.2" fill="#FDE047" />
            {/* Vertical Ribbon - Shadow & Gold */}
            <Rect x="20" y="14" width="6" height="23" fill="#D97706" />
            <Rect x="20" y="14" width="6" height="23" fill="#F59E0B" />
            <Rect x="21" y="14" width="1.5" height="23" fill="#FDE047" />
            {/* Box Lid - 3D Shadow Depth */}
            <Rect x="5" y="10.5" width="36" height="8" rx="3" fill="#581C87" />
            {/* Box Lid - Main Purple */}
            <Rect x="5" y="8.5" width="36" height="8" rx="3" fill="#9333EA" />
            {/* Box Lid - Top Highlight Stripe */}
            <Rect x="7" y="9.5" width="32" height="1.8" rx="0.9" fill="#C084FC" />
            {/* Lid Vertical Ribbon */}
            <Rect x="20" y="8.5" width="6" height="8" fill="#F59E0B" />
            <Rect x="21" y="8.5" width="1.5" height="8" fill="#FDE047" />
            {/* Golden Ribbon Bow - Left Loop */}
            <Path d="M23 9C23 5.5 16 4.5 15.5 7C15 9.5 21 9 23 9Z" fill="#F59E0B" stroke="#D97706" strokeWidth={0.8} />
            <Circle cx="18" cy="7" r="1.5" fill="#FDE047" />
            {/* Golden Ribbon Bow - Right Loop */}
            <Path d="M23 9C23 5.5 30 4.5 30.5 7C31 9.5 25 9 23 9Z" fill="#F59E0B" stroke="#D97706" strokeWidth={0.8} />
            <Circle cx="28" cy="7" r="1.5" fill="#FDE047" />
            {/* Center Bow Knot */}
            <Circle cx="23" cy="8.5" r="3" fill="#FDE047" stroke="#D97706" strokeWidth={0.8} />
            <Circle cx="22" cy="7.5" r="1" fill="#FFFFFF" />
            {/* Magical Sparkles */}
            <Path d="M36 4L37 6.5L39.5 7.5L37 8.5L36 11L35 8.5L32.5 7.5L35 6.5Z" fill="#FBBF24" />
            <Circle cx="11" cy="19" r="1.5" fill="#FFFFFF" />
            <Circle cx="35" cy="30" r="1.5" fill="#FFFFFF" />
          </Svg>
        </View>

        {/* Center Text Details */}
        <View style={styles.textColumn}>
          <View style={styles.titleRow}>
            <Text style={styles.titleText}>{title}</Text>
            {isClaimedToday && (
              <View style={[styles.claimedBadge, { flexDirection: 'row', alignItems: 'center', gap: 3 }]}>
                <Glyph name="check" size={11} color="#15803D" strokeWidth={3.2} />
                <Text style={styles.claimedBadgeText}>
                  {language === 'gu' ? 'પૂર્ણ' : language === 'hi' ? 'पूर्ण' : 'Done'}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.subtitleText} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>

        {/* Right Action Button */}
        {isClaimedToday ? (
          <View style={styles.claimedCircle}>
            <StarArt size={28} />
          </View>
        ) : (
          <View style={[styles.openPillBtn, { flexDirection: 'row', alignItems: 'center', gap: 5 }]}>
            <Text style={styles.openPillText}>
              {language === 'gu' ? 'ખોલો' : language === 'hi' ? 'खोलें' : 'Open'}
            </Text>
            <Glyph name="sparkle" size={12} color="#FFFFFF" strokeWidth={1.5} />
          </View>
        )}
      </TouchableOpacity>

      {/* The Interactive Gift Modal */}
      <DailyMysteryModal
        visible={modalOpen}
        language={language}
        isClaimedToday={isClaimedToday}
        onClaim={handleClaim}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1.5,
    borderColor: '#F1EDFF',
    width: '100%',
  },
  giftIconSquircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#FAF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EDE9FE',
    marginRight: 14,
    ...(Platform.OS === 'web' && ({
      boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.8), 0 2px 5px rgba(0, 0, 0, 0.03)',
    } as any)),
  },
  textColumn: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1B4B',
    letterSpacing: -0.2,
  },
  claimedBadge: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  claimedBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  subtitleText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
    lineHeight: 17,
  },
  openPillBtn: {
    backgroundColor: '#8062F5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && ({
      boxShadow: '0 4px 12px rgba(128, 98, 245, 0.35)',
    } as any)),
  },
  openPillText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  claimedCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

