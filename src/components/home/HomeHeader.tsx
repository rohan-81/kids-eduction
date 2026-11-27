import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Image,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { spacing, radii, shadows } from '../../theme/spacing';
import { soundEffects } from '../../services/soundEffects';
import { AgeGroup, AppLanguage } from '../../types';
import { formatNumberDigits } from '../../utils/languageData';
import { getAvatarImageSource, normalizeAvatarEmoji } from '../../utils/avatarHelper';
import { AppIcon } from '../AppIcon';
import { ClayBadgeToken, TokenTone } from '../SubjectBadgeIcons';
import * as Art from '../art3d/Art3D';
import { Glyph, GlobeIcon } from '../fun';
import { useApp } from '../../context/AppContext';
import type { AppRoute } from '../../utils/navigationHelper';

interface HomeHeaderProps {
  language: AppLanguage;
  ageGroup: AgeGroup;
  streakDays: number;
  childName: string;
  isCompact: boolean;
  onCycleLanguage: () => void;
  showClassModal: boolean;
  setShowClassModal: (show: boolean) => void;
  onSelectStandard: (age: AgeGroup) => void;
}

interface NotificationItem {
  id: string;
  icon: React.FC<{ size?: number }>;
  tone: TokenTone;
  iconBg: string;
  titleGu: string;
  titleHi: string;
  titleEn: string;
  bodyGu: string;
  bodyHi: string;
  bodyEn: string;
  actionGu: string;
  actionHi: string;
  actionEn: string;
  route: AppRoute;
  timeGu: string;
  timeHi: string;
  timeEn: string;
  isRead: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    icon: Art.StarArt,
    tone: 'gold',
    iconBg: '#FEF3C7',
    titleGu: 'આજનો દૈનિક પડકાર!',
    titleHi: 'आज की दैनिक चुनौती!',
    titleEn: 'Today’s Daily Challenge!',
    bodyGu: 'નવો ક્વિઝ ટેસ્ટ રમો અને ૧૫ ગોલ્ડ કોઈન્સ જીતો!',
    bodyHi: 'नई क्विज़ खेलें और 15 गोल्ड सिक्के जीतें!',
    bodyEn: 'Play the new challenge test and earn 15 bonus coins!',
    actionGu: 'પડકાર રમો →',
    actionHi: 'चुनौती खेलें →',
    actionEn: 'Play Challenge →',
    route: '/challenge',
    timeGu: 'હમણાં જ',
    timeHi: 'अभी-अभी',
    timeEn: 'Just now',
    isRead: false,
  },
  {
    id: 'notif-2',
    icon: Art.TreasureMapArt,
    tone: 'peach',
    iconBg: '#FFEDD5',
    titleGu: 'સાહસિક સફર નકશો!',
    titleHi: 'साहसिक सफर नक्शा!',
    titleEn: 'Adventure Map Quest!',
    bodyGu: 'નવા ટાપુઓ અનલોક થયા છે, આગળ વધો!',
    bodyHi: 'नए द्वीप अनलॉक हुए हैं, आगे बढ़ें!',
    bodyEn: 'New mystery islands unlocked! Explore the quest map.',
    actionGu: 'નકશો જુઓ →',
    actionHi: 'नक्शा देखें →',
    actionEn: 'Open Map →',
    route: '/adventure',
    timeGu: '૧ કલાક પહેલાં',
    timeHi: '1 घंटा पहले',
    timeEn: '1h ago',
    isRead: false,
  },
  {
    id: 'notif-3',
    icon: Art.TrophyArt,
    tone: 'lavender',
    iconBg: '#F3E8FF',
    titleGu: 'સુવર્ણ પ્રમાણપત્ર તૈયાર!',
    titleHi: 'स्वर्ण प्रमाणपत्र तैयार!',
    titleEn: 'Gold Certificate Ready!',
    bodyGu: 'તમારો ખાસ વિનર એવોર્ડ પ્રમાણપત્ર ડાઉનલોડ કરો.',
    bodyHi: 'अपना विशेष विजेता प्रमाणपत्र डाउनलोड करें।',
    bodyEn: 'View and download your official achievement award certificate.',
    actionGu: 'સર્ટિફિકેટ જુઓ →',
    actionHi: 'सर्टिफिकेट देखें →',
    actionEn: 'View Certificate →',
    route: '/certificate',
    timeGu: 'આજે',
    timeHi: 'आज',
    timeEn: 'Today',
    isRead: false,
  },
  {
    id: 'notif-4',
    icon: Art.SnowmanArt,
    tone: 'mint',
    iconBg: '#DCFCE7',
    titleGu: 'મોસમો અને કેલેન્ડર!',
    titleHi: 'मौसम और कैलेंडर!',
    titleEn: 'Seasons & Calendar!',
    bodyGu: 'શિયાળો, ઉનાળો અને ચોમાસાની મજાની વાતો શીખો.',
    bodyHi: 'सर्दी, गर्मी और बारिश के मौसम के बारे में जानें।',
    bodyEn: 'Explore seasons, weekdays, and healthy habits.',
    actionGu: 'મોસમો શીખો →',
    actionHi: 'मौसम सीखें →',
    actionEn: 'Learn Seasons →',
    route: '/calendar_habits',
    timeGu: 'આજે',
    timeHi: 'आज',
    timeEn: 'Today',
    isRead: true,
  },
];

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  language,
  ageGroup,
  streakDays,
  childName,
  isCompact,
  onCycleLanguage,
  showClassModal,
  setShowClassModal,
  onSelectStandard,
}) => {
  const router = useRouter();
  const { isAuthenticated, currentUser, logoutUser, progress } = useApp();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    soundEffects.playBubblePop();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotificationPress = (item: NotificationItem) => {
    soundEffects.playBubblePop();
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );
    setNotificationOpen(false);
    router.push(item.route);
  };

  const activeStandardLabel =
    ageGroup === '2-4'
      ? language === 'gu'
        ? 'પ્રી-સ્કૂલ'
        : language === 'hi'
        ? 'प्री-स्कूल'
        : 'Pre-School'
      : ageGroup === '4-6'
      ? language === 'gu'
        ? 'વર્ગ 1-2'
        : language === 'hi'
        ? 'कक्षा 1-2'
        : 'Class 1-2'
      : language === 'gu'
      ? 'વર્ગ 3-5'
      : language === 'hi'
      ? 'कक्षा 3-5'
      : 'Class 3-5';

  return (
    <View style={styles.headerContainer}>
      {/* Top Header Row: Profile Icon, Child Greeting, Class Badge, Language Selection, and Notification Bell */}
      <View style={styles.topUtilitiesRow}>
        <View style={styles.userProfileRow}>
          <TouchableOpacity
            style={styles.topProfileBtn}
            onPress={() => {
              soundEffects.playBubblePop();
              router.push('/profile');
            }}
            activeOpacity={0.8}
            accessibilityLabel="Profile"
            accessibilityRole="button"
          >
            {(() => {
              const avatarChar = progress.currentAvatar?.character || 'avatar_3d_boy';
              const avatarSource = getAvatarImageSource(avatarChar);
              if (avatarSource) {
                return <Image source={avatarSource} style={styles.topProfileAvatar} resizeMode="cover" />;
              }
              return <Text style={{ fontSize: 22 }}>{normalizeAvatarEmoji(avatarChar)}</Text>;
            })()}
          </TouchableOpacity>

          <View style={styles.userNameBlock}>
            <Text style={styles.userGreetingText} numberOfLines={1}>
              {language === 'gu'
                ? `નમસ્તે, ${childName || 'દોસ્ત'}! 👋`
                : language === 'hi'
                ? `नमस्ते, ${childName || 'दोस्त'}! 👋`
                : `Hello, ${childName || 'Friend'}! 👋`}
            </Text>
            <TouchableOpacity
              style={styles.classBadgePill}
              onPress={() => {
                soundEffects.playBubblePop();
                setShowClassModal(true);
              }}
              activeOpacity={0.8}
              accessibilityLabel={activeStandardLabel}
              accessibilityRole="button"
            >
              <Text style={styles.classBadgeText}>{activeStandardLabel} ▾</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.rightActionsRow}>
          <TouchableOpacity
            style={styles.langPillBtn}
            onPress={onCycleLanguage}
            activeOpacity={0.8}
            accessibilityLabel="Language"
            accessibilityRole="button"
          >
            <GlobeIcon size={13} color="#334155" />
            <Text style={styles.langPillText}>
              {language === 'gu' ? 'ગુજ' : language === 'hi' ? 'हिं' : 'EN'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => {
              soundEffects.playBubblePop();
              setNotificationOpen(true);
            }}
            activeOpacity={0.8}
            accessibilityLabel="Notifications"
            accessibilityRole="button"
          >
            <AppIcon name="bell" size={20} />
            {unreadCount > 0 && (
              <View style={styles.bellRedDot}>
                <Text style={styles.bellBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Interactive Class / Standard Selection Modal */}
      <Modal
        visible={showClassModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowClassModal(false)}
      >
        <View style={styles.classModalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setShowClassModal(false)}
          />
          <View style={styles.classModalCard}>
            {/* Modal Header */}
            <View style={styles.classModalHeader}>
              <View style={styles.classModalTitleBox}>
                <Art.BookArt size={28} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.classModalTitle}>
                    {language === 'gu'
                      ? 'તમારો વર્ગ (ધોરણ) પસંદ કરો'
                      : language === 'hi'
                      ? 'अपनी कक्षा चुनें'
                      : 'Choose Your Class'}
                  </Text>
                  <Text style={styles.classModalSubtitle}>
                    {language === 'gu'
                      ? 'તમારા ધોરણ મુજબ શિક્ષણ અને રમતો બદલાશે'
                      : language === 'hi'
                      ? 'आपकी कक्षा के अनुसार पाठ और खेल बदलेंगे'
                      : 'Lessons & games will match your level'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowClassModal(false)}
                style={styles.closeModalBtn}
                activeOpacity={0.8}
                accessibilityLabel="Close"
              >
                <Text style={styles.closeModalBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Standard Options */}
            <View style={styles.classOptionsList}>
              {[
                {
                  group: '2-4' as AgeGroup,
                  icon: Art.AppleArt,
                  badge: language === 'gu' ? '૨-૪ વર્ષ' : language === 'hi' ? '२-४ वर्ष' : '2-4 yrs',
                  title: language === 'gu' ? '🎒 પ્રી-સ્કૂલ' : language === 'hi' ? '🎒 प्री-स्कूल' : '🎒 Pre-School',
                  sub:
                    language === 'gu'
                      ? 'ચિત્રો, અવાજ અને રમૂજી ઓળખ'
                      : language === 'hi'
                      ? 'चित्र, आवाज और मजेदार पहचान'
                      : 'Visuals, sounds & basic recognition',
                  color: '#10B981',
                  bg: '#F0FDF4',
                  border: '#86EFAC',
                },
                {
                  group: '4-6' as AgeGroup,
                  icon: Art.WordTilesArt,
                  badge: language === 'gu' ? '૪-૬ વર્ષ' : language === 'hi' ? '४-૬ वर्ष' : '4-6 yrs',
                  title: language === 'gu' ? '📘 વર્ગ ૧-૨' : language === 'hi' ? '📘 कक्षा १-२' : '📘 Class 1-2',
                  sub:
                    language === 'gu'
                      ? 'મૂળાક્ષરો, સરવાળા-બાદબાકી અને વાંચન'
                      : language === 'hi'
                      ? 'वर्णमाला, जोड़-घटाव और शुरुआती पठन'
                      : 'Alphabet, simple math & early reading',
                  color: '#3B82F6',
                  bg: '#EFF6FF',
                  border: '#93C5FD',
                },
                {
                  group: '6-8' as AgeGroup,
                  icon: Art.TrophyArt,
                  badge: language === 'gu' ? '૬-૮ વર્ષ' : language === 'hi' ? '६-८ वर्ष' : '6-8 yrs',
                  title: language === 'gu' ? '🏆 વર્ગ ૩-૫' : language === 'hi' ? '🏆 कक्षा ३-५' : '🏆 Class 3-5',
                  sub:
                    language === 'gu'
                      ? 'ઘડિયા, વ્યાકરણ, વિજ્ઞાન અને કોયડા'
                      : language === 'hi'
                      ? 'पहाड़े, व्याकरण, विज्ञान और पहेलियां'
                      : 'Tables, grammar, science & puzzles',
                  color: '#8B5CF6',
                  bg: '#F5F3FF',
                  border: '#C4B5FD',
                },
              ].map((opt) => {
                const isSelected = ageGroup === opt.group;
                const IconComponent = opt.icon;
                return (
                  <TouchableOpacity
                    key={opt.group}
                    style={[
                      styles.classOptionCard,
                      { backgroundColor: opt.bg, borderColor: isSelected ? opt.color : opt.border },
                      isSelected && styles.classOptionCardSelected,
                    ]}
                    onPress={() => {
                      soundEffects.playLevelUp();
                      onSelectStandard(opt.group);
                      setShowClassModal(false);
                    }}
                    activeOpacity={0.85}
                  >
                    <View style={styles.classOptionLeft}>
                      <View style={[styles.classOptionIconBubble, { backgroundColor: '#FFFFFF' }]}>
                        <IconComponent size={30} />
                      </View>
                      <View style={styles.classOptionTextCol}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={[styles.classOptionTitle, { color: opt.color }]}>
                            {opt.title}
                          </Text>
                          <View style={[styles.classAgeBadge, { backgroundColor: opt.color }]}>
                            <Text style={styles.classAgeBadgeText}>{opt.badge}</Text>
                          </View>
                        </View>
                        <Text style={styles.classOptionSub}>{opt.sub}</Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.classRadioCircle,
                        isSelected && { backgroundColor: opt.color, borderColor: opt.color },
                      ]}
                    >
                      {isSelected && <Text style={styles.classRadioCheck}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* Interactive Notifications Modal */}
      <Modal
        visible={notificationOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setNotificationOpen(false)}
      >
        <View style={styles.notifModalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setNotificationOpen(false)}
          />
          <View style={styles.notifCard}>
            {/* Modal Header */}
            <View style={styles.notifHeaderRow}>
              <View style={styles.notifTitleBox}>
                <AppIcon name="bell" size={22} />
                <Text style={styles.notifHeaderTitle}>
                  {language === 'gu' ? 'સૂચનાઓ' : language === 'hi' ? 'सूचनाएं' : 'Notifications'}
                </Text>
                {unreadCount > 0 && (
                  <View style={styles.notifCountPill}>
                    <Text style={styles.notifCountPillText}>
                      {unreadCount} {language === 'gu' ? 'નવી' : language === 'hi' ? 'नई' : 'new'}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.notifHeaderActions}>
                {unreadCount > 0 && (
                  <TouchableOpacity
                    onPress={handleMarkAllRead}
                    style={styles.markReadBtn}
                    activeOpacity={0.8}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={styles.markReadBtnText}>
                        {language === 'gu' ? 'બધું વાંચ્યું' : language === 'hi' ? 'सब पढ़ा' : 'Mark all read'}
                      </Text>
                      <Glyph name="check" size={12} color="#2563EB" strokeWidth={3} />
                    </View>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => setNotificationOpen(false)}
                  style={styles.closeNotifBtn}
                  activeOpacity={0.8}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  accessibilityRole="button"
                  accessibilityLabel="Close notifications"
                >
                  <Glyph name="close" size={14} color="#475569" strokeWidth={3} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Notifications List */}
            <ScrollView style={styles.notifScrollList} showsVerticalScrollIndicator={false}>
              {notifications.length === 0 ? (
                <View style={styles.emptyNotifBox}>
                  <View style={styles.emptyNotifEmoji}>
                    <Art.StarArt size={56} />
                  </View>
                  <Text style={styles.emptyNotifText}>
                    {language === 'gu'
                      ? 'બધી સૂચનાઓ વાંચી લીધી છે!'
                      : language === 'hi'
                      ? 'सभी सूचनाएं पढ़ ली गई हैं!'
                      : 'All caught up! No new notifications.'}
                  </Text>
                </View>
              ) : (
                notifications.map((item) => {
                  const title = language === 'gu' ? item.titleGu : language === 'hi' ? item.titleHi : item.titleEn;
                  const body = language === 'gu' ? item.bodyGu : language === 'hi' ? item.bodyHi : item.bodyEn;
                  const action = language === 'gu' ? item.actionGu : language === 'hi' ? item.actionHi : item.actionEn;
                  const time = language === 'gu' ? item.timeGu : language === 'hi' ? item.timeHi : item.timeEn;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.notifItemCard,
                        !item.isRead && styles.notifItemCardUnread,
                      ]}
                      onPress={() => handleNotificationPress(item)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.notifIconCircle}>
                        <ClayBadgeToken art={item.icon} tone={item.tone} size={40} />
                      </View>

                      <View style={styles.notifContentCol}>
                        <View style={styles.notifItemTopRow}>
                          <Text style={[styles.notifItemTitle, !item.isRead && styles.notifItemTitleBold]}>
                            {title}
                          </Text>
                          {!item.isRead && <View style={styles.notifUnreadDot} />}
                        </View>
                        <Text style={styles.notifItemBody}>{body}</Text>
                        <View style={styles.notifItemFooter}>
                          <Text style={styles.notifTimeText}>{time}</Text>
                          <Text style={styles.notifActionText}>{action}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    marginBottom: 8,
  },
  topUtilitiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  userProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  userNameBlock: {
    justifyContent: 'center',
    flexShrink: 1,
  },
  userGreetingText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.2,
  },
  classBadgePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 2,
  },
  classBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  topProfileBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#60A5FA',
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  topProfileAvatar: {
    width: '100%',
    height: '100%',
  },
  rightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authPillBtn: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#C4B5FD',
  },
  authPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6D28D9',
  },
  authLoggedInPillBtn: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
  },
  authLoggedInPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
  },
  langPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  langPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
  },
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F1EDFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  searchCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  bellRedDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  bellBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    lineHeight: 10,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarBorder: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 3,
    borderColor: '#60A5FA', // Sky blue ring matching Reference 1
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 14,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  greetingCol: {
    flex: 1,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B', // Rich deep navy/purple
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  greetingSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B', // Soft slate
  },
  streakCard: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 8,
    gap: 10,
  },
  streakFlame: {
    fontSize: 24,
  },
  streakTextCol: {
    alignItems: 'flex-start',
  },
  streakCount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E293B',
    lineHeight: 20,
  },
  streakLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  classModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  classModalCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  classModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: '#F1F5F9',
    marginBottom: 14,
  },
  classModalTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  classModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
  },
  classModalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeModalBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeModalBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#64748B',
  },
  classOptionsList: {
    gap: 12,
  },
  classOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 18,
    borderWidth: 2,
  },
  classOptionCardSelected: {
    borderWidth: 2.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  classOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  classOptionIconBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  classOptionTextCol: {
    flex: 1,
  },
  classOptionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  classAgeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  classAgeBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  classOptionSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 16,
  },
  classRadioCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  classRadioCheck: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  notifModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  notifCard: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '82%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  notifHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: '#F1F5F9',
    marginBottom: 12,
  },
  notifTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notifHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  notifCountPill: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  notifCountPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
  },
  notifHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  markReadBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  markReadBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  closeNotifBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeNotifBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
  },
  notifScrollList: {
    maxHeight: 380,
  },
  emptyNotifBox: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyNotifEmoji: {
    marginBottom: 8,
  },
  emptyNotifText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
  },
  notifItemCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    alignItems: 'flex-start',
  },
  notifItemCardUnread: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FED7AA',
    borderWidth: 1.5,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  notifIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notifEmojiText: {
    fontSize: 20,
  },
  notifContentCol: {
    flex: 1,
  },
  notifItemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  notifItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  notifItemTitleBold: {
    fontWeight: '800',
    color: '#1E293B',
  },
  notifUnreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F97316',
    marginLeft: 6,
  },
  notifItemBody: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 6,
  },
  notifItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notifTimeText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  notifActionText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F97316',
  },  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  accountCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  accountHeaderBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  accountAvatarBubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
    borderColor: '#86EFAC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  accountTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  accountEmailText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
  },
  accountStatusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  accountStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
  },
  accountActionsContainer: {
    gap: 10,
  },
  accountLogoutPrimaryBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  accountLogoutPrimaryText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  accountSwitchSecondaryBtn: {
    backgroundColor: '#F5F3FF',
    borderWidth: 1.5,
    borderColor: '#C4B5FD',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  accountSwitchSecondaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7C3AED',
  },
  accountParentsBtn: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  accountParentsBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  accountDismissBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  accountDismissBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },

});
