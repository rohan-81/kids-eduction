import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../src/theme/colors';
import { spacing, radii, shadows } from '../src/theme/spacing';
import { Header } from '../src/components/Header';
import { useApp } from '../src/context/AppContext';
import { soundEffects } from '../src/services/soundEffects';
import { getTodayDateKey } from '../src/services/storageService';
import { KidModal } from '../src/components/fun';
import { ClayButton } from '../src/components/clay';
import { kidTones, kidPalette } from '../src/theme/kidTheme';
import { formatNumberDigits } from '../src/utils/languageData';
import { GoldCoinIcon, GoldCoinStack, CoinLabel } from '../src/components/common/GoldCoinIcon';
import * as Art from '../src/components/art3d/Art3D';
import { AppGlobalBackground } from '../src/components/common/AppGlobalBackground';
import type { AppRoute } from '../src/utils/navigationHelper';

/** Mission / reward emoji ids -> 3D vector art (no raw emoji on screen). */
const MISSION_ART: Record<string, React.FC<{ size?: number }>> = {
  '✖️': Art.TimesArt,
  '🎮': Art.GamepadArt,
  '🌱': Art.SproutArt,
  '✍️': Art.PencilArt,
  '💧': Art.DropArt,
  '⭐': Art.StarArt,
};

/** Daily Missions treasure chest reward (single source for the grant and the popup). */
const CHEST_REWARD = { coins: 50, water: 5, stars: 3 };

interface MissionItem {
  id: string;
  icon: string;
  titleGu: string;
  titleHi: string;
  titleEn: string;
  target: number;
  current: number;
  rewardCoins: number;
  route: AppRoute;
}

export default function MissionsScreen() {
  const router = useRouter();
  const { progress, updateProgress, speak, language } = useApp();
  const activeLang = language || 'en';

  const [missions] = useState<MissionItem[]>([
    {
      id: 'm-1',
      icon: '✖️',
      titleGu: '૧ ઘડિયો પૂરો સાંભળો',
      titleHi: '१ पहाड़ा पूरा सुनें',
      titleEn: 'Listen to 1 full math table',
      target: 1,
      current: progress.completedLessons.some((id) => id.startsWith('ghadiya')) ? 1 : 0,
      rewardCoins: 15,
      route: '/lessons?categoryId=ghadiya',
    },
    {
      id: 'm-2',
      icon: '🎮',
      titleGu: 'કોઈપણ ૧ રમત રમો',
      titleHi: 'कोई भी १ खेल खेलें',
      titleEn: 'Play 1 learning game',
      target: 1,
      current: Object.keys(progress.gameStats || {}).length > 0 ? 1 : 0,
      rewardCoins: 15,
      route: '/games',
    },
    {
      id: 'm-3',
      icon: '🌱',
      titleGu: 'બગીચામાં છોડને પાણી આપો',
      titleHi: 'बगीचे में पौधों को पानी दें',
      titleEn: 'Water plants in garden',
      target: 1,
      current: (progress.gardenPlants || []).some((p) => p.stage > 0) ? 1 : 0,
      rewardCoins: 20,
      route: '/garden',
    },
    {
      id: 'm-4',
      icon: '✍️',
      titleGu: 'અક્ષર ટ્રેસિંગ પ્રેક્ટિસ કરો',
      titleHi: 'अक्षर ट्रेसिंग का अभ्यास करें',
      titleEn: 'Practice letter tracing',
      target: 1,
      current: progress.completedLessons.length > 0 ? 1 : 0,
      rewardCoins: 10,
      route: activeLang === 'hi' ? '/lessons?categoryId=hi-varnamala' : activeLang === 'en' ? '/lessons?categoryId=en-alphabet' : '/lessons?categoryId=gu-varnamala',
    },
  ]);

  // Persisted per day (was local state, so leaving and re-entering the screen let the
  // chest be opened again for another +50 coins).
  const today = getTodayDateKey();
  const chestOpened = progress.lastMissionChestDate === today;
  const [chestModal, setChestModal] = useState(false);

  const completedCount = missions.filter((m) => m.current >= m.target).length;
  const canOpenChest = completedCount >= 2;

  const handleOpenChest = async () => {
    if (chestOpened) return;
    if (!canOpenChest) {
      speak(
        activeLang === 'en'
          ? 'Complete at least 2 missions first!'
          : activeLang === 'hi'
          ? 'पहले कम से कम २ मिशन पूरे करें!'
          : 'પહેલાં ઓછામાં ઓછા ૨ મિશન પૂરા કરો!',
        activeLang
      );
      return;
    }

    soundEffects.playTadaaa();
    setChestModal(true);
    // Award everything the popup shows (previously only the coins were actually granted).
    await updateProgress({
      coins: (progress.coins || 0) + CHEST_REWARD.coins,
      water: (progress.water || 0) + CHEST_REWARD.water,
      stars: (progress.stars || 0) + CHEST_REWARD.stars,
      lastMissionChestDate: today,
    });
    speak(
      activeLang === 'en'
        ? 'Woohoo! Secret treasure chest opened! You earned 50 coins!'
        : activeLang === 'hi'
        ? 'वाह! जादुई संदूक खुल गया! आपको ५० सिक्के मिले!'
        : 'અરે વાહ! સરપ્રાઈઝ તિજોરી ખુલી ગઈ! તમને ૫૦ સિક્કા મળ્યા!',
      activeLang
    );
  };

  const getMissionTitle = (m: MissionItem) => {
    if (activeLang === 'hi') return m.titleHi;
    if (activeLang === 'en') return m.titleEn;
    return m.titleGu;
  };

  const getMissionSubtitle = (m: MissionItem) => {
    if (activeLang === 'gu') return m.titleEn;
    return m.titleGu;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppGlobalBackground id="missionsBgGrad" />
      <Header
        title={
          activeLang === 'en'
            ? 'Daily Missions'
            : activeLang === 'hi'
            ? 'दैनिक मिशन'
            : 'દૈનિક મિશન્સ'
        }
        showBack={true}
        backHref="/home"
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Surprise Treasure Chest Hero Card */}
        <View style={[styles.chestHeroCard, shadows.card]}>
          <View style={[styles.chestEmoji, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
            {chestOpened ? <Art.StarArt size={34} /> : null}
            {canOpenChest || chestOpened ? <Art.GiftArt size={72} /> : <Art.KeyArt size={64} />}
            {chestOpened ? <Art.StarArt size={34} /> : null}
          </View>
          <Text style={styles.chestTitle}>
            {chestOpened
              ? (activeLang === 'en' ? 'Treasure Chest Opened!' : activeLang === 'hi' ? 'जादुई संदूक खुल गया!' : 'તિજોરી ખૂલી ગઈ!')
              : canOpenChest
              ? (activeLang === 'en' ? 'Ready to Open Chest!' : activeLang === 'hi' ? 'संदूक खोलने के लिए तैयार!' : 'તિજોરી ખોલવા માટે તૈયાર!')
              : (activeLang === 'en' ? 'Magic Treasure Chest' : activeLang === 'hi' ? 'जादुई गुप्त संदूक' : 'જાદુઈ સરપ્રાઈઝ તિજોરી')}
          </Text>
          <Text style={styles.chestSubtitle}>
            {chestOpened
              ? (activeLang === 'en'
                  ? "You unlocked today's big treasure!"
                  : activeLang === 'hi'
                  ? 'आपने आज का बड़ा खजाना पा लिया है!'
                  : 'તમે આજનો મોટો ખજાનો મેળવી લીધો છે!')
              : canOpenChest
              ? (activeLang === 'en'
                  ? 'Congratulations! Tap to open the chest!'
                  : activeLang === 'hi'
                  ? 'बधाई हो! संदूक खोलने के लिए टैप करें!'
                  : 'અભિનંદન! તિજોરી ખોલવા માટે ટેપ કરો!')
              : (activeLang === 'en'
                  ? 'Complete 2 missions to unlock the mystery treasure!'
                  : activeLang === 'hi'
                  ? '२ मिशन पूरे करें और रहस्यमयी खजाना खोलें!'
                  : '૨ મિશન્સ પૂરા કરો અને અંદર રહેલો ખજાનો અનલોક કરો!')}
          </Text>

          <TouchableOpacity
            style={[
              styles.openChestBtn,
              !canOpenChest && !chestOpened && styles.openChestBtnDisabled,
              chestOpened && styles.openChestBtnCompleted,
            ]}
            onPress={handleOpenChest}
            disabled={chestOpened || !canOpenChest}
            activeOpacity={0.8}
          >
            <Text style={styles.openChestBtnText}>
              {chestOpened
                ? (activeLang === 'en' ? 'Treasure Claimed (+50 coins)' : activeLang === 'hi' ? 'खजाना मिला (+५० सिक्के)' : 'ખજાનો મેળવી લીધો (+૫૦ સિક્કા)')
                : canOpenChest
                ? (activeLang === 'en' ? 'Open Chest!' : activeLang === 'hi' ? 'संदूक खोलें!' : 'તિજોરી ખોલો!')
                : (activeLang === 'en' ? 'Still Locked' : activeLang === 'hi' ? 'अभी बंद है' : 'હજી લોક છે')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Progress Tracker */}
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>
            {activeLang === 'en'
              ? "Today's Missions:"
              : activeLang === 'hi'
              ? 'आज के मिशन:'
              : 'આજના મિશન્સ:'}
          </Text>
          <Text style={styles.progressCounter}>
            {activeLang === 'en'
              ? `${completedCount}/${missions.length} Done`
              : activeLang === 'hi'
              ? `${completedCount}/${missions.length} पूर्ण`
              : `${completedCount}/${missions.length} પૂર્ણ`}
          </Text>
        </View>

        {/* Missions List */}
        <View style={styles.missionsList}>
          {missions.map((m) => {
            const isDone = m.current >= m.target;

            return (
              <View key={m.id} style={[styles.missionCard, isDone && styles.missionCardDone, shadows.soft]}>
                <View style={styles.missionLeftCol}>
                  <View style={styles.missionIcon}>{React.createElement(MISSION_ART[m.icon] ?? Art.StarArt, { size: 38 })}</View>
                  <View style={styles.missionTexts}>
                    <Text style={styles.missionCardTitle}>
                      {getMissionTitle(m)}
                    </Text>
                    <Text style={styles.missionCardSubtitle}>
                      {getMissionSubtitle(m)}
                    </Text>
                    <CoinLabel size={16} iconAfter textStyle={styles.missionRewardText}>
                      {activeLang === 'en'
                        ? `Reward: +${m.rewardCoins}`
                        : activeLang === 'hi'
                        ? `इनाम: +${m.rewardCoins}`
                        : `ઇનામ: +${m.rewardCoins}`}
                    </CoinLabel>
                  </View>
                </View>

                {isDone ? (
                  <View style={styles.doneBadge}>
                    <Text style={styles.doneText}>
                      {activeLang === 'en' ? 'Done' : 'पूर्ण'}
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.goBtn}
                    onPress={() => router.push(m.route)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.goBtnText}>
                      {activeLang === 'en' ? 'Start' : activeLang === 'hi' ? 'शुरू करें' : 'શરૂ કરો'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Chest celebration modal */}
      <KidModal
        visible={chestModal}
        onClose={() => setChestModal(false)}
        emblemIcon={<GoldCoinStack size={30} />}
        tone="sun"
        sparkles
        title={activeLang === 'en' ? 'Secret Chest Opened!' : activeLang === 'hi' ? 'जादुई संदूक खुला!' : 'જાદુઈ તિજોરી ખૂલી!'}
        subtitle={
          activeLang === 'en'
            ? "You completed today's missions with flying colors!"
            : activeLang === 'hi'
            ? 'आपने आज के मिशन बहुत अच्छे से पूरे किए!'
            : 'તમે આજના મિશન્સ ખૂબ સરસ રીતે પૂરા કર્યા!'
        }
      >
        <View style={styles.chestTokens}>
          {[
            { emoji: 'coin', n: CHEST_REWARD.coins, label: activeLang === 'en' ? 'Coins' : activeLang === 'hi' ? 'सिक्के' : 'સિક્કા', tone: kidTones.sun },
            { emoji: '💧', n: CHEST_REWARD.water, label: activeLang === 'en' ? 'Water' : activeLang === 'hi' ? 'पानी' : 'પાણી', tone: kidTones.sky },
            { emoji: '⭐', n: CHEST_REWARD.stars, label: activeLang === 'en' ? 'Stars' : activeLang === 'hi' ? 'सितारे' : 'તારા', tone: kidTones.lavender },
          ].map((r) => (
            <View key={r.emoji} style={[styles.chestToken, { backgroundColor: r.tone.tint, borderColor: r.tone.tintBorder, borderBottomColor: r.tone.fill }]}>
              {r.emoji === 'coin' ? <GoldCoinIcon size={34} /> : React.createElement(MISSION_ART[r.emoji] ?? Art.StarArt, { size: 38 })}
              <Text style={[styles.chestTokenValue, { color: r.tone.text }]}>+{formatNumberDigits(r.n, activeLang)}</Text>
              <Text style={styles.chestTokenLabel}>{r.label}</Text>
            </View>
          ))}
        </View>
        <ClayButton
          tone="sun"
          size="lg"
          style={{ width: '100%' }}
          onPress={() => setChestModal(false)}
          title={activeLang === 'en' ? 'Collect Treasure!' : activeLang === 'hi' ? 'खजाना प्राप्त करें!' : 'ખજાનો સ્વીકારો!'}
        />
      </KidModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl * 2,
  },
  chestTokens: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  chestToken: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderBottomWidth: 6,
  },
  chestTokenValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  chestTokenLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: kidPalette.inkMuted,
  },
  chestHeroCard: {
    backgroundColor: '#FEF9E7',
    borderRadius: radii.card + 6,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F9E79F',
    marginBottom: spacing.xl,
  },
  chestEmoji: {
    marginBottom: spacing.xs,
  },
  chestTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#7D6608',
    marginBottom: 4,
  },
  chestSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  openChestBtn: {
    backgroundColor: '#F39C12',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.full,
    ...shadows.soft,
  },
  openChestBtnDisabled: {
    backgroundColor: '#BDC3C7',
  },
  openChestBtnCompleted: {
    backgroundColor: '#27AE60',
  },
  openChestBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  progressCounter: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
  },
  missionsList: {
    gap: spacing.md,
  },
  missionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radii.card,
    padding: spacing.md + 2,
    borderWidth: 1.5,
    borderColor: '#EAEDED',
  },
  missionCardDone: {
    backgroundColor: '#EAFAF1',
    borderColor: '#A9DFBF',
  },
  missionLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  missionIcon: {
    width: 38,
    height: 38,
  },
  missionTexts: {
    flex: 1,
  },
  missionCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  missionCardSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  missionRewardText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E67E22',
    marginTop: 2,
  },
  doneBadge: {
    backgroundColor: '#27AE60',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
  },
  doneText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  goBtn: {
    backgroundColor: '#2C3E50',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
  },
  goBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.card + 6,
    padding: spacing.xl,
    alignItems: 'center',
    maxWidth: 360,
    width: '100%',
  },
  modalEmoji: {
    fontSize: 44,
    marginBottom: spacing.sm,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F39C12',
    marginBottom: spacing.xs,
  },
  modalDesc: {
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  rewardsList: {
    backgroundColor: '#FEF9E7',
    padding: spacing.md,
    borderRadius: radii.md,
    width: '100%',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  rewardItem: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7D6608',
  },
  modalCloseBtn: {
    backgroundColor: '#27AE60',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.full,
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
