import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/theme/colors';
import { spacing, radii, shadows } from '../src/theme/spacing';
import { useApp } from '../src/context/AppContext';
import { Header } from '../src/components/Header';
import { BottomNav } from '../src/components/BottomNav';
import { soundEffects } from '../src/services/soundEffects';
import { AppIcon } from '../src/components/AppIcon';
import { formatNumberDigits } from '../src/utils/languageData';
import { AppLanguage } from '../src/types';
import { BADGE_DEFINITIONS, BadgeItemDef } from '../src/data/badgesData';
import { apiService } from '../src/services/apiService';
import { AppGlobalBackground } from '../src/components/common/AppGlobalBackground';
import { GoldCoinIcon, CoinLabel } from '../src/components/common/GoldCoinIcon';
import { REWARD_ART, SUBJECT_CARD_ART } from '../src/utils/imageHelper';
import * as Art from '../src/components/art3d/Art3D';
import { webStyle } from '../src/utils/webStyle';



export default function RewardsScreen() {
  const router = useRouter();
  const { progress, language, speak } = useApp();

  const [badges, setBadges] = useState<BadgeItemDef[]>(BADGE_DEFINITIONS);

  useEffect(() => {
    let isMounted = true;
    apiService.fetchBadges(language).then((fetched) => {
      if (isMounted && fetched && fetched.length > 0) {
        setBadges(fetched);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [language]);

  const childGreeting = progress.childName || (language === 'gu' ? 'નાના દોસ્ત' : language === 'hi' ? 'छोटे दोस्त' : 'Young Star');

  const completedCount = progress.completedLessons?.length || 0;
  const gamesCount = Object.keys(progress.gameStats || {}).length;
  const starsCount = progress.stars || 0;
  const coinsCount = progress.coins || 0;

  // Calculate unlocked badges count
  const unlockedBadgesCount = badges.filter((b) =>
    b.checkUnlocked(progress)
  ).length;

  const handleHeroTrophyTap = () => {
    soundEffects.playTadaaa();
    const cheer =
      language === 'gu'
        ? `શાબાશ ${childGreeting}! તમે ${formatNumberDigits(starsCount, language)} તારા મેળવ્યા છે! ખૂબ આગળ વધો!`
        : language === 'hi'
        ? `शाबाश ${childGreeting}! आपने ${formatNumberDigits(starsCount, language)} सितारे जीते हैं! बहुत बढ़िया!`
        : `Awesome job ${childGreeting}! You have collected ${starsCount} stars! Keep shining!`;
    speak(cheer, language);
  };

  const handleBadgeTap = (badge: BadgeItemDef, isUnlocked: boolean) => {
    soundEffects.playBubblePop();
    const name =
      language === 'gu' ? badge.nameGu : language === 'hi' ? badge.nameHi : badge.nameEn;
    const desc =
      language === 'gu' ? badge.descGu : language === 'hi' ? badge.descHi : badge.descEn;

    const message = isUnlocked
      ? `${name}! ${desc}`
      : `${name}! ${desc} ${language === 'gu' ? 'આ બેજ મેળવવા વધુ અભ્યાસ કરો!' : language === 'hi' ? 'यह बैज पाने के लिए अभ्यास करें!' : 'Keep learning to unlock this badge!'}`;

    speak(message, language);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppGlobalBackground id="rewardsBgGrad" />
      <Header
        title={
          language === 'gu'
            ? 'મારા તારા અને બેજ'
            : language === 'hi'
            ? 'मेरे सितारे और बैज'
            : 'My Stars & Badges'
        }
        showBack={true}
        showStars={true}
        backHref="/home"
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* 1. HERO CELEBRATION TROPHY SHOWCASE CARD */}
        <TouchableOpacity
          style={[styles.heroCard, shadows.card]}
          onPress={handleHeroTrophyTap}
          activeOpacity={0.9}
        >
          {/* Top Decorative Sparkles */}
          <View style={styles.heroTopRow}>
            <View style={styles.trophyIconWrap}>
              <Image source={REWARD_ART.trophy} resizeMode="contain" style={{ width: 64, height: 64 }} />
              <View style={styles.sparkleBadge}>
                <Art.StarArt size={18} />
              </View>
            </View>

            <View style={styles.heroTextCol}>
              <View style={styles.superStarPill}>
                <Text style={styles.superStarPillText}>
                  {language === 'gu'
                    ? 'સુવર્ણ સિદ્ધિ બોર્ડ'
                    : language === 'hi'
                    ? 'स्वर्ण उपलब्धि बोर्ड'
                    : 'Hall of Fame'}
                </Text>
              </View>
              <Text style={styles.heroTitleText} numberOfLines={1}>
                {language === 'gu'
                  ? `શાબાશ, ${childGreeting}!`
                  : language === 'hi'
                  ? `शाबाश, ${childGreeting}!`
                  : `Super, ${childGreeting}!`}
              </Text>
              <Text style={styles.heroSubtitleText}>
                {language === 'gu'
                  ? `તમે ${formatNumberDigits(unlockedBadgesCount, language)} / ${formatNumberDigits(badges.length, language)} બેજ અને ${formatNumberDigits(starsCount, language)} તારા મેળવ્યા છે!`
                  : language === 'hi'
                  ? `आपने ${formatNumberDigits(unlockedBadgesCount, language)} / ${formatNumberDigits(badges.length, language)} बैज और ${formatNumberDigits(starsCount, language)} सितारे जीते हैं!`
                  : `You unlocked ${unlockedBadgesCount} / ${badges.length} badges & ${starsCount} stars!`}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 2. 4-METRIC TACTILE STATS GRID */}
        <View style={styles.statsGrid}>
          {/* Stars Card */}
          <View style={[styles.statCard, { backgroundColor: '#FEF9C3', borderColor: '#FDE047' }]}>
            <View style={[styles.statIconCircle, { backgroundColor: '#FEF08A' }]}>
              <Image source={SUBJECT_CARD_ART.star} resizeMode="contain" style={{ width: 30, height: 30 }} />
            </View>
            <Text style={[styles.statNumber, { color: '#B45309' }]}>
              {formatNumberDigits(starsCount, language)}
            </Text>
            <Text style={styles.statLabelText}>
              {language === 'gu' ? 'કુલ તારા' : language === 'hi' ? 'कुल सितारे' : 'Stars Won'}
            </Text>
          </View>

          {/* Coins Card */}
          <View style={[styles.statCard, { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }]}>
            <View style={[styles.statIconCircle, { backgroundColor: '#BBF7D0' }]}>
              <GoldCoinIcon size={28} />
            </View>
            <Text style={[styles.statNumber, { color: '#15803D' }]}>
              {formatNumberDigits(coinsCount, language)}
            </Text>
            <Text style={styles.statLabelText}>
              {language === 'gu' ? 'સિક્કા' : language === 'hi' ? 'सिक्के' : 'Coins'}
            </Text>
          </View>

          {/* Lessons Done Card */}
          <View style={[styles.statCard, { backgroundColor: '#EDE9FE', borderColor: '#C4B5FD' }]}>
            <View style={[styles.statIconCircle, { backgroundColor: '#DDD6FE' }]}>
              <Art.BookArt size={29} />
            </View>
            <Text style={[styles.statNumber, { color: '#6D28D9' }]}>
              {formatNumberDigits(completedCount, language)}
            </Text>
            <Text style={styles.statLabelText}>
              {language === 'gu' ? 'પૂર્ણ પાઠ' : language === 'hi' ? 'पूरे पाठ' : 'Lessons Done'}
            </Text>
          </View>

          {/* Games Played Card */}
          <View style={[styles.statCard, { backgroundColor: '#E0F2FE', borderColor: '#7DD3FC' }]}>
            <View style={[styles.statIconCircle, { backgroundColor: '#BAE6FD' }]}>
              <Art.GamepadArt size={29} />
            </View>
            <Text style={[styles.statNumber, { color: '#0369A1' }]}>
              {formatNumberDigits(gamesCount, language)}
            </Text>
            <Text style={styles.statLabelText}>
              {language === 'gu' ? 'કુલ રમતો' : language === 'hi' ? 'कुल खेल' : 'Games Played'}
            </Text>
          </View>
        </View>

        {/* 3. ACHIEVEMENT BADGES SECTION */}
        <View style={styles.sectionHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Image source={REWARD_ART.medal} resizeMode="contain" style={{ width: 30, height: 30 }} />
            <Text style={styles.sectionHeading}>
              {language === 'gu'
                ? 'મળેલા સિદ્ધિ બેજ'
                : language === 'hi'
                ? 'मिले हुए उपलब्धि बैज'
                : 'Achievement Badges'}
            </Text>
          </View>

          <View style={styles.unlockedCountPill}>
            <Text style={styles.unlockedCountText}>
              {formatNumberDigits(unlockedBadgesCount, language)} / {formatNumberDigits(badges.length, language)}
            </Text>
          </View>
        </View>

        {/* Badges List */}
        <View style={styles.badgeListContainer}>
          {badges.map((badge) => {
            const isUnlocked = badge.checkUnlocked(progress);
            const { current, total } = badge.getProgress(progress);
            const pct = Math.min(100, Math.round((current / (total || 1)) * 100));

            const badgeName =
              language === 'gu' ? badge.nameGu : language === 'hi' ? badge.nameHi : badge.nameEn;
            const badgeDesc =
              language === 'gu' ? badge.descGu : language === 'hi' ? badge.descHi : badge.descEn;
            const badgeReq =
              language === 'gu' ? badge.reqGu : language === 'hi' ? badge.reqHi : badge.reqEn;

            return (
              <TouchableOpacity
                key={badge.id}
                style={[
                  styles.badgeCard3D,
                  isUnlocked ? styles.badgeCardUnlocked : styles.badgeCardLocked,
                  shadows.soft,
                ]}
                onPress={() => handleBadgeTap(badge, isUnlocked)}
                activeOpacity={0.88}
              >
                {/* Left 3D Embellished Icon */}
                <View
                  style={[
                    styles.badgeIconWrapper,
                    {
                      backgroundColor: isUnlocked ? badge.iconBg : '#F1F5F9',
                      borderColor: isUnlocked ? badge.iconBorder : '#CBD5E1',
                    },
                  ]}
                >
                  <Text style={[styles.badgeIconEmoji, !isUnlocked && { opacity: 0.5 }]}>
                    {badge.emoji}
                  </Text>
                </View>

                {/* Middle Info Column */}
                <View style={styles.badgeContentCol}>
                  <View style={styles.badgeTitleRow}>
                    <Text
                      style={[
                        styles.badgeNameText,
                        !isUnlocked && { color: '#64748B' },
                      ]}
                      numberOfLines={1}
                    >
                      {badgeName}
                    </Text>
                  </View>

                  <Text style={styles.badgeDescText} numberOfLines={2}>
                    {badgeDesc}
                  </Text>

                  {/* Requirement & Progress Bar */}
                  <View style={styles.badgeReqRow}>
                    <View style={styles.reqPill}>
                      <Text style={styles.reqPillText}>🎯 {badgeReq}</Text>
                    </View>

                    {!isUnlocked && total > 1 && (
                      <View style={styles.progressTrackSmall}>
                        <View style={[styles.progressFillSmall, { width: `${pct}%` }]} />
                      </View>
                    )}
                  </View>
                </View>

                {/* Right Status Medal */}
                <View style={styles.statusCol}>
                  {isUnlocked ? (
                    <View style={styles.unlockedMedalWrap}>
                      <View style={styles.medalPill}>
                        <Image source={REWARD_ART.medal} resizeMode="contain" style={{ width: 18, height: 18 }} />
                        <Text style={styles.medalPillLabel}>
                          {language === 'gu' ? 'અનલોક' : language === 'hi' ? 'अनलॉक' : 'Unlocked'}
                        </Text>
                      </View>
                      <View style={styles.coinsBonusPill}>
                        <CoinLabel size={16} iconAfter textStyle={styles.coinsBonusText}>
                          +{formatNumberDigits(badge.rewardCoins, language)}
                        </CoinLabel>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.lockedMedalWrap}>
                      <View style={styles.lockPill}>
                        <Art.KeyArt size={14} />
                        <Text style={styles.lockPillLabel}>
                          {language === 'gu' ? 'બાકી' : language === 'hi' ? 'बाकी' : 'Locked'}
                        </Text>
                      </View>
                      <Text style={styles.pctLabel}>{pct}%</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 4. PREMIUM QUICK ACTIONS & REWARD CARDS */}
        <View style={styles.actionsHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Image source={REWARD_ART.gift} resizeMode="contain" style={{ width: 28, height: 28 }} />
            <Text style={styles.sectionHeading}>
              {language === 'gu'
                ? 'ઇનામો અને વિશેષ ફીચર્સ'
                : language === 'hi'
                ? 'पुरस्कार और विशेष सुविधाएं'
                : 'Rewards & Special Features'}
            </Text>
          </View>
        </View>

        {/* Sticker Book Action Card */}
        <TouchableOpacity
          style={[styles.featureActionCard, styles.stickerCard, shadows.card]}
          onPress={() => {
            soundEffects.playBubblePop();
            router.push('/stickers');
          }}
          activeOpacity={0.88}
        >
          <View style={styles.featureLeftCol}>
            <View style={[styles.unifiedIconBox, { backgroundColor: '#F3E8FF', borderColor: '#D8B4FE' }]}>
              <AppIcon name="coloring" size={32} />
            </View>
            <View style={styles.featureTextCol}>
              <Text style={[styles.featureCardTitle, { color: '#6B21A8' }]}>
                {language === 'gu'
                  ? 'સ્ટીકર બુક અને રમતરંગ'
                  : language === 'hi'
                  ? 'स्टिकर बुक और प्लेरूम'
                  : 'Sticker Album & Decorator Room'}
              </Text>
              <Text style={[styles.featureCardSub, { color: '#7E22CE' }]}>
                {language === 'gu'
                  ? 'તમારા મેળવેલા સ્ટીકરોથી સુંદર કમરો સજાવો!'
                  : language === 'hi'
                  ? 'अपने जीते हुए स्टिकर्स से कमरा सजाएं!'
                  : 'Decorate your playroom with won stickers!'}
              </Text>
            </View>
          </View>
          <View style={styles.stickerOpenBtn}>
            <Text style={styles.actionBtnLabel}>
              {language === 'gu' ? 'ખોલો' : language === 'hi' ? 'खोलें' : 'Open'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Gold Diploma Certificate Action Card */}
        <TouchableOpacity
          style={[styles.featureActionCard, styles.certificateCard, shadows.card]}
          onPress={() => {
            soundEffects.playBubblePop();
            router.push('/certificate');
          }}
          activeOpacity={0.88}
        >
          <View style={styles.featureLeftCol}>
            <View style={[styles.unifiedIconBox, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
              <AppIcon name="certificate" size={32} />
            </View>
            <View style={styles.featureTextCol}>
              <Text style={[styles.featureCardTitle, { color: '#92400E' }]}>
                {language === 'gu'
                  ? 'ગોલ્ડ સિદ્ધિ સર્ટિફિકેટ'
                  : language === 'hi'
                  ? 'गोल्ड उपलब्धि सर्टिफिकेट'
                  : 'Gold Graduation Diploma'}
              </Text>
              <Text style={[styles.featureCardSub, { color: '#B45309' }]}>
                {language === 'gu'
                  ? 'તમારું સર્ટિફિકેટ જુઓ અને PDF ડાઉનલોડ / પ્રિન્ટ કરો!'
                  : language === 'hi'
                  ? 'सर्टिफिकेट देखें और PDF प्रिंट करें!'
                  : 'View official diploma & print PDF certificate!'}
              </Text>
            </View>
          </View>
          <View style={styles.certificateOpenBtn}>
            <Text style={styles.actionBtnLabel}>
              {language === 'gu' ? 'જુઓ' : language === 'hi' ? 'देखें' : 'View'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Daily Habits & Calendar Action Card */}
        <TouchableOpacity
          style={[styles.featureActionCard, styles.habitsCard, shadows.card]}
          onPress={() => {
            soundEffects.playBubblePop();
            router.push('/calendar_habits');
          }}
          activeOpacity={0.88}
        >
          <View style={styles.featureLeftCol}>
            <View style={[styles.unifiedIconBox, { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }]}>
              <AppIcon name="habits" size={32} />
            </View>
            <View style={styles.featureTextCol}>
              <Text style={[styles.featureCardTitle, { color: '#166534' }]}>
                {language === 'gu'
                  ? 'દૈનિક ભેટ અને સારી ટેવો'
                  : language === 'hi'
                  ? 'दैनिक उपहार और अच्छी आदतें'
                  : 'Daily Gifts & Habits'}
              </Text>
              <Text style={[styles.featureCardSub, { color: '#15803D' }]}>
                {language === 'gu'
                  ? 'રોજ હાજરી પૂરીને નવા સિક્કા અને રહસ્યમય ગિફ્ટ જીતો!'
                  : language === 'hi'
                  ? 'रोज़ हाजिरी भरके नए सिक्के और गिफ्ट जीतें!'
                  : 'Check in daily to win mystery coin rewards!'}
              </Text>
            </View>
          </View>
          <View style={styles.habitsOpenBtn}>
            <Text style={styles.actionBtnLabel}>
              {language === 'gu' ? 'ખોલો' : language === 'hi' ? 'खोलें' : 'Open'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Encouraging Footer */}
        <View style={styles.encouragingFooter}>
          <View style={styles.footerIconBox}>
            <AppIcon name="star" size={26} />
          </View>
          <Text style={styles.footerText}>
            {language === 'gu'
              ? 'વધુ નવા બેજ મેળવવા માટે રોજ રમતા રહો અને નવું શીખતા રહો!'
              : language === 'hi'
              ? 'अधिक नए बैज पाने के लिए रोज़ खेलते रहें और सीखते रहें!'
              : 'Keep playing and learning every day to unlock all badges!'}
          </Text>
        </View>

        {/* Comfortable bottom spacer so floating BottomNav never cuts off content */}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Floating Bottom Navigation */}
      <BottomNav activeTab="profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },

  // 1. HERO CARD
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FEF08A',
    padding: 18,
    marginBottom: 16,
    ...webStyle({
          boxShadow: '0 8px 24px rgba(245, 158, 11, 0.12), 0 2px 6px rgba(0,0,0,0.04)',
        }),
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  trophyIconWrap: {
    width: 74,
    height: 74,
    borderRadius: 22,
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trophyEmoji: {
    fontSize: 40,
  },
  sparkleBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 2,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  sparkleEmoji: {
    fontSize: 14,
  },
  heroTextCol: {
    flex: 1,
  },
  superStarPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  superStarPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  heroTitleText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E1B4B',
    marginBottom: 2,
  },
  heroSubtitleText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    fontWeight: '600',
  },

  // 2. STATS GRID
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 22,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 14,
    alignItems: 'center',
    ...webStyle({
          boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
        }),
  },
  statIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '900',
  },
  statLabelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginTop: 2,
  },

  // 3. SECTION HEADERS
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  actionsHeaderRow: {
    marginTop: 22,
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E1B4B',
  },
  unlockedCountPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  unlockedCountText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#4338CA',
  },

  // BADGES LIST
  badgeListContainer: {
    gap: 12,
  },
  badgeCard3D: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1.8,
    padding: 14,
    backgroundColor: '#FFFFFF',
    ...webStyle({
          boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
        }),
  },
  badgeCardUnlocked: {
    borderColor: '#E2E8F0',
  },
  badgeCardLocked: {
    borderColor: '#F1F5F9',
    backgroundColor: '#FAFCFF',
  },
  badgeIconWrapper: {
    width: 54,
    height: 54,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  badgeIconEmoji: {
    fontSize: 28,
  },
  badgeContentCol: {
    flex: 1,
  },
  badgeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeNameText: {
    fontSize: 15.5,
    fontWeight: '900',
    color: '#1E1B4B',
  },
  badgeDescText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
    fontWeight: '500',
  },
  badgeReqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  reqPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
  },
  reqPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
  },
  progressTrackSmall: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    maxWidth: 90,
  },
  progressFillSmall: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 3,
  },

  // STATUS COLUMN
  statusCol: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  unlockedMedalWrap: {
    alignItems: 'center',
    gap: 4,
  },
  medalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 3,
  },
  medalPillEmoji: {
    fontSize: 12,
  },
  medalPillLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#B45309',
  },
  coinsBonusPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  coinsBonusText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#059669',
  },

  lockedMedalWrap: {
    alignItems: 'center',
    gap: 4,
  },
  lockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 3,
  },
  lockPillEmoji: {
    fontSize: 11,
  },
  lockPillLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
  },
  pctLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#94A3B8',
  },

  // 4. FEATURE ACTION CARDS
  featureActionCard: {
    borderRadius: 22,
    borderWidth: 2,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  featureLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  unifiedIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureTextCol: {
    flex: 1,
    minWidth: 0,
  },
  featureCardTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  featureCardSub: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
    fontWeight: '600',
  },
  stickerCard: {
    backgroundColor: '#FAF5FF',
    borderColor: '#D8B4FE',
  },
  stickerOpenBtn: {
    backgroundColor: '#9333EA',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    flexShrink: 0,
    marginLeft: 8,
  },

  certificateCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  certificateOpenBtn: {
    backgroundColor: '#D97706',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    flexShrink: 0,
    marginLeft: 8,
  },

  habitsCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  habitsOpenBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    flexShrink: 0,
    marginLeft: 8,
  },
  actionBtnLabel: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },

  // FOOTER
  encouragingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 22,
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 14,
  },
  footerIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FEF9C3',
    borderWidth: 1.5,
    borderColor: '#FDE047',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  footerText: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    fontWeight: '700',
    lineHeight: 19,
  },
});
