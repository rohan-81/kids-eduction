import React, { useState, useEffect } from 'react';
import { backendService } from '../src/services/backendService';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/theme/colors';
import { spacing, radii, shadows } from '../src/theme/spacing';
import { kidRadii, kidPalette, kidTones, clayShadow } from '../src/theme/kidTheme';
import { KidModal, IconBadge, Glyph } from '../src/components/fun';
import { ClayButton } from '../src/components/clay';
import { useApp } from '../src/context/AppContext';
import { Header } from '../src/components/Header';
import { BottomNav } from '../src/components/BottomNav';
import { soundEffects } from '../src/services/soundEffects';
import { AppGlobalBackground } from '../src/components/common/AppGlobalBackground';
import { AVATAR_3D_BOY } from '../src/utils/imageHelper';
import { AppIcon } from '../src/components/AppIcon';
import { formatNumberDigits } from '../src/utils/languageData';
import { formatChildName } from '../src/utils/nameTransliterator';
import * as Art from '../src/components/art3d/Art3D';
import { webStyle } from '../src/utils/webStyle';

export default function ProfileScreen() {
  const router = useRouter();
  const { progress, updateProgress, language, ageGroup, currentUser, isAuthenticated, logoutUser, activeProfileId } = useApp();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState(progress.childName || 'Little Learner');

  useEffect(() => {
    if (progress.childName) {
      setNameInput(progress.childName);
    }
  }, [progress.childName]);

  useEffect(() => {
    async function syncActiveChildProfile() {
      try {
        const [profiles, activeId] = await Promise.all([
          backendService.getProfiles(),
          backendService.getActiveProfileId(),
        ]);
        const validProfiles = (profiles || []).filter(
          (p) => p.nickname && p.nickname.trim().toLowerCase() !== 'aa' && p.nickname.trim().toLowerCase() !== 'bb'
        );
        if (validProfiles.length > 0) {
          const activeObj = validProfiles.find((p) => p.id === activeId) || validProfiles[0];
          if (activeObj?.nickname && (!progress.childName || progress.childName === 'Little' || progress.childName === 'Little Star')) {
            await updateProgress({ childName: activeObj.nickname });
          }
        }
      } catch {}
    }
    syncActiveChildProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const childName = progress.childName || 'Little Learner';

  const classLabel =
    language === 'gu'
      ? ageGroup === '2-4'
        ? 'પ્રિ-સ્કૂલ નર્સરી (૨-૪ વર્ષ)'
        : ageGroup === '4-6'
        ? 'ધોરણ ૧ - ૨ (૪-૬ વર્ષ)'
        : 'ધોરણ ૩ - ૫ (૬-૮ વર્ષ)'
      : language === 'hi'
      ? ageGroup === '2-4'
        ? 'प्री-स्कूल नर्सरी (२-४ वर्ष)'
        : ageGroup === '4-6'
        ? 'कक्षा १ - २ (४-६ वर्ष)'
        : 'कक्षा ३ - ५ (६-८ वर्ष)'
      : ageGroup === '2-4'
      ? 'Pre-School Nursery (2-4 yrs)'
      : ageGroup === '4-6'
      ? 'Class 1 - 2 (4-6 yrs)'
      : 'Class 3 - 5 (6-8 yrs)';

  const handleSaveProfile = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    soundEffects.playLevelUp();
    await updateProgress({ childName: trimmed });
    if (activeProfileId) {
      const pId = typeof activeProfileId === 'number' ? activeProfileId : parseInt(String(activeProfileId), 10) || 1;
      backendService.updateProfileNickname(pId, trimmed).catch(() => {});
    }
    setIsEditModalOpen(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppGlobalBackground id="profileBgGrad" />
      <Header
        title={language === 'gu' ? 'મારી પ્રોફાઇલ' : language === 'hi' ? 'मेरी प्रोफ़ाइल' : 'Child Profile'}
        showBack={true}
        backHref="/home"
      />

      <ScrollView
        contentContainerStyle={[styles.container, isMobile && styles.containerMobile]}
        showsVerticalScrollIndicator={false}
      >
        {/* Child Profile Card */}
        <View style={[styles.profileCard, shadows.card]}>
          <View style={styles.avatarWrap}>
            <Image source={AVATAR_3D_BOY} style={styles.avatarImg} resizeMode="cover" />
            <TouchableOpacity
              style={styles.avatarEditBadge}
              onPress={() => {
                soundEffects.playBubblePop();
                router.push('/avatar');
              }}
              activeOpacity={0.8}
            >
              <Art.PencilArt size={17} />
            </TouchableOpacity>
          </View>

          <Text style={styles.childNameText}>{formatChildName(childName, language)}</Text>
          <View style={styles.classChip}>
            <Text style={styles.classChipText}>{classLabel}</Text>
          </View>

          <View style={styles.editRow}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => {
                soundEffects.playBubblePop();
                setNameInput(childName);
                setIsEditModalOpen(true);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.editBtnText}>
                {language === 'gu' ? 'નામ બદલો' : language === 'hi' ? 'नाम बदलें' : 'Edit Name'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.editBtn, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}
              onPress={() => {
                soundEffects.playBubblePop();
                router.push('/classes');
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.editBtnText, { color: '#2563EB' }]}>
                {language === 'gu' ? 'ક્લાસ બદલો' : language === 'hi' ? 'कक्षा बदलें' : 'Switch Class'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Learning Statistics Grid */}
        <Text style={styles.sectionHeader}>
          {language === 'gu' ? 'શિક્ષણ સિદ્ધિઓ' : language === 'hi' ? 'अध्ययन आंकड़े' : 'Learning Statistics'}
        </Text>

        <View style={styles.statsGrid}>
          <View
            style={[
              styles.statBox,
              webStyle({
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
              }),
            ]}
          >
            <View style={{ marginBottom: 6 }}>
              <AppIcon name="star" size={32} />
            </View>
            <Text style={[styles.statValue, { color: '#1E293B' }]}>{formatNumberDigits(progress.stars || 0, language)}</Text>
            <Text style={styles.statLabel}>
              {language === 'gu' ? 'કુલ તારા' : language === 'hi' ? 'कुल सितारे' : 'Stars Earned'}
            </Text>
          </View>

          <View
            style={[
              styles.statBox,
              webStyle({
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
              }),
            ]}
          >
            <View style={{ marginBottom: 6 }}>
              <AppIcon name="coin" size={32} />
            </View>
            <Text style={[styles.statValue, { color: '#1E293B' }]}>{formatNumberDigits(progress.coins || 0, language)}</Text>
            <Text style={styles.statLabel}>
              {language === 'gu' ? 'ગોલ્ડ કોઈન્સ' : language === 'hi' ? 'सोने के सिक्के' : 'Coins Collected'}
            </Text>
          </View>

          <View
            style={[
              styles.statBox,
              webStyle({
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
              }),
            ]}
          >
            <View style={{ marginBottom: 6 }}>
              <AppIcon name="counting" size={32} />
            </View>
            <Text style={[styles.statValue, { color: '#1E293B' }]}>{formatNumberDigits(progress.completedLessons?.length || 0, language)}</Text>
            <Text style={styles.statLabel}>
              {language === 'gu' ? 'પૂર્ણ પાઠ' : language === 'hi' ? 'पूरे पाठ' : 'Lessons Done'}
            </Text>
          </View>

          <View
            style={[
              styles.statBox,
              webStyle({
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
              }),
            ]}
          >
            <View style={{ marginBottom: 6 }}>
              <AppIcon name="fire" size={32} />
            </View>
            <Text style={[styles.statValue, { color: '#1E293B' }]}>{formatNumberDigits(progress.streakDays || 1, language)}</Text>
            <Text style={styles.statLabel}>
              {language === 'gu' ? 'સ્ટ્રીક દિવસો' : language === 'hi' ? 'दैनिक स्ट्रीक' : 'Streak Days'}
            </Text>
          </View>
        </View>

        {/* Parent Session & Controls Card (Image 2's options) */}
        <Text style={styles.sectionHeader}>
          {language === 'gu'
            ? 'વાલી ખાતું અને નિયંત્રણ'
            : language === 'hi'
            ? 'अभिभावक खाता एवं नियंत्रण'
            : 'Parent Account & Controls'}
        </Text>

        <View style={[styles.parentSessionCard, shadows.card]}>
          <View style={styles.sessionHeaderRow}>
            <View style={styles.sessionAvatarBox}>
              <Art.StarArt size={36} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Text style={styles.sessionUserNameText}>
                  {isAuthenticated
                    ? currentUser?.first_name
                      ? `${currentUser.first_name} (${currentUser.username})`
                      : currentUser?.username || 'Parent'
                    : language === 'gu'
                    ? 'અતિથિ એકાઉન્ટ'
                    : language === 'hi'
                    ? 'अतिथि खाता'
                    : 'Guest User'}
                </Text>
                <View
                  style={[
                    styles.sessionStatusPill,
                    !isAuthenticated && { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' },
                  ]}
                >
                  <Text
                    style={[
                      styles.sessionStatusText,
                      !isAuthenticated && { color: '#B45309' },
                    ]}
                  >
                    {isAuthenticated
                      ? language === 'gu'
                        ? 'સક્રિય ખાતું'
                        : language === 'hi'
                        ? 'सक्रिय खाता'
                        : 'Active Session'
                      : language === 'gu'
                      ? 'અતિથિ મોડ'
                      : language === 'hi'
                      ? 'अतिथि मोड'
                      : 'Guest Mode'}
                  </Text>
                </View>
              </View>
              <Text style={styles.sessionEmailText}>
                {isAuthenticated
                  ? currentUser?.email || `@${currentUser?.username}`
                  : language === 'gu'
                  ? 'ક્લાઉડ સિંક અને સલામતી માટે વાલી ખાતામાં લૉગ ઇન કરો'
                  : language === 'hi'
                  ? 'क्लाउड सिंक और सुरक्षा के लिए लॉगिन करें'
                  : 'Sign in to sync learning progress across devices'}
              </Text>
            </View>
          </View>

          {/* The 3 Actions exactly matching Image 2 */}
          <View style={styles.actionButtonsCol}>
            {/* 1. Parents Corner Button */}
            <TouchableOpacity
              style={styles.parentsCornerBtn}
              onPress={() => {
                soundEffects.playBubblePop();
                router.push('/parents');
              }}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Parents Corner"
            >
              <Text style={styles.parentsCornerBtnText}>
                {language === 'gu' ? 'વાલીઓ માટે કંટ્રોલ પેનલ' : language === 'hi' ? 'अभिभावक कंट्रोल पैनल' : 'Parents Corner'}
              </Text>
              <Glyph name="next" size={14} color={'#94A3B8'} strokeWidth={3} />
            </TouchableOpacity>

            {/* 2. Create New Account (Register) Button */}
            <TouchableOpacity
              style={styles.createAccountBtn}
              onPress={() => {
                soundEffects.playBubblePop();
                router.push('/register');
              }}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Create New Account"
            >
              <Text style={styles.createAccountBtnText}>
                {language === 'gu' ? 'નવું ખાતું બનાવો' : language === 'hi' ? 'नया खाता बनाएं' : 'Create New Account'}
              </Text>
              <Text style={[styles.btnChevron, { color: '#7E22CE' }]}>➔</Text>
            </TouchableOpacity>

            {/* 3. Log Out & Open Login Page (or Sign In if guest) */}
            {isAuthenticated ? (
              <TouchableOpacity
                style={styles.logoutPrimaryBtn}
                onPress={async () => {
                  soundEffects.playBubblePop();
                  await logoutUser();
                  router.replace('/login');
                }}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Log Out"
              >
                <Text style={styles.logoutPrimaryBtnText}>
                  {language === 'gu' ? 'લૉગ આઉટ કરો' : language === 'hi' ? 'लॉग आउट करें' : 'Log Out'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.signInPrimaryBtn}
                onPress={() => {
                  soundEffects.playBubblePop();
                  router.push('/login');
                }}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Sign In"
              >
                <Text style={styles.logoutPrimaryBtnText}>
                  {language === 'gu' ? 'વાલી લૉગ ઇન કરો' : language === 'hi' ? 'अभिभावक लॉगिन' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Other Hub Links */}
        <View style={styles.quickLinksCol}>
          {/* My Progress (moved out of the tab bar when Stories became a tab) */}
          <TouchableOpacity
            style={[styles.linkRow, shadows.soft]}
            onPress={() => {
              soundEffects.playBubblePop();
              router.push('/progress');
            }}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            <IconBadge tone="mint" size={48} emoji="📊" style={{ marginRight: 14 }} />
            <View style={styles.linkTextCol}>
              <Text style={styles.linkTitle}>
                {language === 'gu' ? 'મારી પ્રગતિ' : language === 'hi' ? 'मेरी प्रगति' : 'My Progress'}
              </Text>
              <Text style={styles.linkSub}>
                {language === 'gu' ? 'સાહસ નકશો, સ્ટ્રીક અને આંકડા' : language === 'hi' ? 'साहसिक नक्शा, स्ट्रीक और आंकड़े' : 'Adventure map, streak & stats'}
              </Text>
            </View>
            <IconBadge tone="mint" size={40} filled>
              <Glyph name="next" size={18} color={kidTones.mint.onFill} />
            </IconBadge>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.linkRow, shadows.soft]}
            onPress={() => {
              soundEffects.playBubblePop();
              router.push('/rewards');
            }}
            activeOpacity={0.8}
          >
            <View style={{ marginRight: 14 }}>
              <AppIcon name="certificate" size={32} />
            </View>
            <View style={styles.linkTextCol}>
              <Text style={styles.linkTitle}>
                {language === 'gu' ? 'મારા ઇનામો અને ટ્રોફી' : language === 'hi' ? 'मेरे पुरस्कार और ट्राफियां' : 'Rewards & Badges'}
              </Text>
              <Text style={styles.linkSub}>
                {language === 'gu' ? 'અનલોક કરેલ તમામ એવોર્ડ જુઓ' : language === 'hi' ? 'अनलॉक किए गए पुरस्कार देखें' : 'View milestone trophies & badges'}
              </Text>
            </View>
            <IconBadge tone="sky" size={40} filled><Glyph name="next" size={18} /></IconBadge>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.linkRow, shadows.soft]}
            onPress={() => {
              soundEffects.playBubblePop();
              router.push('/settings');
            }}
            activeOpacity={0.8}
          >
            <View style={{ marginRight: 14 }}>
              <AppIcon name="adventure" size={32} />
            </View>
            <View style={styles.linkTextCol}>
              <Text style={styles.linkTitle}>
                {language === 'gu' ? 'એપ સેટિંગ્સ' : language === 'hi' ? 'ऐप सेटिंग्स' : 'App Settings'}
              </Text>
              <Text style={styles.linkSub}>
                {language === 'gu' ? 'ભાષા, સાઉન્ડ અને સ્ક્રીન ટાઈમ' : language === 'hi' ? 'भाषा, ध्वनि और स्क्रीन समय' : 'Language, audio & eye care mode'}
              </Text>
            </View>
            <IconBadge tone="sky" size={40} filled><Glyph name="next" size={18} /></IconBadge>
          </TouchableOpacity>
        </View>
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Edit Name Modal */}
      <KidModal
        visible={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        emblem="✏️"
        tone="sky"
        title={language === 'gu' ? 'બાળકનું નામ બદલો' : language === 'hi' ? 'बच्चे का नाम बदलें' : 'Edit Child Name'}
        maxWidth={400}
      >
        <TextInput
          style={styles.funNameInput}
          value={nameInput}
          onChangeText={setNameInput}
          placeholder={language === 'gu' ? 'નામ લખો' : language === 'hi' ? 'नाम लिखें' : 'Enter name'}
          placeholderTextColor={kidPalette.inkFaint}
          maxLength={30}
          autoFocus={true}
          accessibilityLabel="Child name"
        />
        <View style={styles.funBtnRow}>
          <ClayButton
            tone="white"
            size="md"
            style={styles.funBtn}
            title={language === 'gu' ? 'રદ કરો' : language === 'hi' ? 'रद्द करें' : 'Cancel'}
            textStyle={{ color: kidPalette.inkSoft }}
            onPress={() => setIsEditModalOpen(false)}
          />
          <ClayButton
            tone="mint"
            size="md"
            style={styles.funBtn}
            disabled={!nameInput.trim()}
            title={`${language === 'gu' ? 'સાચવો' : language === 'hi' ? 'सहेजें' : 'Save'}`}
            textStyle={{ color: kidTones.mint.onFill }}
            onPress={handleSaveProfile}
          />
        </View>
      </KidModal>

      <BottomNav activeTab="profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  funNameInput: {
    width: '100%',
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: kidTones.sky.tintBorder,
    backgroundColor: kidTones.sky.tint,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '800',
    color: kidPalette.ink,
    ...webStyle({ outlineStyle: 'none' }),
  },
  funBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  funBtn: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    maxWidth: 750,
    alignSelf: 'center',
    width: '100%',
  },
  containerMobile: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    alignItems: 'center',
    marginBottom: 20,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    // design system: clay
    borderRadius: kidRadii.card,
    borderWidth: 1.5,
    ...clayShadow(2),
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#60A5FA',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0284C7',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarEditIcon: {
    fontSize: 13,
  },
  childNameText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
  },
  classChip: {
    backgroundColor: '#F3E8FF',
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    marginBottom: 16,
  },
  classChipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0284C7',
  },
  editRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    justifyContent: 'center',
  },
  editBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radii.full,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    width: '48%',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  parentSessionCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 20,
    borderColor: '#F1EDFF',
    ...(webStyle({
      boxShadow: '0 8px 24px rgba(128, 98, 245, 0.08), 0 2px 6px rgba(0, 0, 0, 0.03)',
    })),
    // design system: clay
    borderRadius: kidRadii.card,
    borderWidth: 1.5,
    ...clayShadow(2),
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sessionAvatarBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1.5,
    borderColor: '#EDE9FE',
  },
  sessionUserNameText: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#1E293B',
  },
  sessionStatusPill: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  sessionStatusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  sessionEmailText: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '500',
  },
  actionButtonsCol: {
    gap: 10,
  },
  parentsCornerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    paddingHorizontal: 16,
    ...(webStyle({
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
      cursor: 'pointer',
    })),
    // design system: clay
    minHeight: 52,
    borderRadius: kidRadii.pill,
    justifyContent: 'center',
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(15, 23, 42, 0.22)',
  },
  parentsCornerBtnText: {
    color: '#1E293B',
    fontSize: 14.5,
    fontWeight: '800',
  },
  createAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    borderWidth: 1.5,
    borderColor: '#C084FC',
    paddingVertical: 14,
    paddingHorizontal: 16,
    ...(webStyle({
      boxShadow: '0 2px 6px rgba(126, 34, 206, 0.08)',
      cursor: 'pointer',
    })),
    // design system: clay
    minHeight: 52,
    borderRadius: kidRadii.pill,
    justifyContent: 'center',
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(15, 23, 42, 0.22)',
  },
  createAccountBtnText: {
    color: '#7E22CE',
    fontSize: 14.5,
    fontWeight: '800',
  },
  signInPrimaryBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    minHeight: 52,
    borderRadius: kidRadii.pill,
    justifyContent: 'center',
    borderBottomWidth: 5,
    borderBottomColor: '#0369A1',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
    ...(webStyle({
      boxShadow: '0 4px 14px rgba(2, 132, 199, 0.32)',
      cursor: 'pointer',
    })),
  },
  logoutPrimaryBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    ...(webStyle({
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
      cursor: 'pointer',
    })),
    // design system: clay
    minHeight: 52,
    borderRadius: kidRadii.pill,
    justifyContent: 'center',
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(15, 23, 42, 0.22)',
  },
  logoutPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
  },
  btnChevron: {
    fontSize: 14,
    fontWeight: '800',
    color: '#94A3B8',
  },
  quickLinksCol: {
    gap: 12,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  linkEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  linkTextCol: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  linkSub: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
  },
  linkChevron: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 380,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 14,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 16,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalSaveBtn: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    alignItems: 'center',
    // design system: clay
    minHeight: 52,
    borderRadius: kidRadii.pill,
    justifyContent: 'center',
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(15, 23, 42, 0.22)',
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    alignItems: 'center',
    // design system: clay
    minHeight: 52,
    borderRadius: kidRadii.pill,
    justifyContent: 'center',
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(15, 23, 42, 0.22)',
  },
  modalCancelText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
});
