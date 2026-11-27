import Svg, { Defs, LinearGradient, Stop, Rect, Circle, Path } from 'react-native-svg';
import { AppGlobalBackground } from '../src/components/common/AppGlobalBackground';
import {
  TopicGujaratiVarnamalaBadge,
  TopicHindiVarnamalaBadge,
  TopicAlphabetBadge,
  TopicPhonicsBadge,
  TopicVocabularyBadge,
  TopicNumberSenseBadge,
  TopicAdditionBadge,
  TopicMultiplicationBadge,
  TopicGeometryBadge,
  TopicAnimalsBadge,
  TopicPlantsBadge,
  TopicOurWorldBadge,
} from '../src/components/SubjectBadgeIcons';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/theme/colors';
import { spacing, radii, shadows } from '../src/theme/spacing';
import { useApp } from '../src/context/AppContext';
import { Header } from '../src/components/Header';
import { backendService } from '../src/services/backendService';
import { soundEffects } from '../src/services/soundEffects';
import { screenWellnessService } from '../src/services/screenWellnessService';
import { storageService } from '../src/services/storageService';
import { normalizeAvatarEmoji, is3DAvatar, AVATAR_3D_BOY } from '../src/utils/avatarHelper';
import { formatChildName } from '../src/utils/nameTransliterator';
import { ChildProfile, AgeGroup } from '../src/types';
import { CATEGORIES } from '../src/data/categories';
import { LESSONS } from '../src/data/lessons';
import { formatNumberDigits, formatDurationMinutes } from '../src/utils/languageData';
import { filterLessonsForClass } from '../src/utils/ageDetailHelper';
import { ParentGate, KidModal, Glyph, useKidDialog } from '../src/components/fun';
import { ClayButton } from '../src/components/clay';
import { kidTones, kidPalette, kidBackdrops } from '../src/theme/kidTheme';
import * as Art from '../src/components/art3d/Art3D';
import { webStyle } from '../src/utils/webStyle';
import { HorizontalScrollRow } from '../src/components/common/HorizontalScrollRow';
import type { ScreenTimeLimitId } from '../src/services/screenWellnessService';

const AVATAR_OPTIONS = ['avatar_3d_boy', '🦁', '🐰', '🐼', '🦊', '🐯', '🐥', '🦄', '🐬'];

const SCREEN_TIME_PRESETS = [
  { id: '15m', mins: 15, gu: '૧૫ મિનિટ', hi: '१५ मिनट', en: '15 Mins' },
  { id: '30m', mins: 30, gu: '૩૦ મિનિટ', hi: '३० मिनट', en: '30 Mins' },
  { id: '45m', mins: 45, gu: '૪૫ મિનિટ', hi: '४५ मिनट', en: '45 Mins' },
  { id: '60m', mins: 60, gu: '૧ કલાક', hi: '१ घंटा', en: '1 Hour' },
  { id: 'unlimited', mins: 0, gu: 'અમર્યાદિત', hi: 'असीमित', en: 'Unlimited' },
] satisfies ReadonlyArray<{ id: ScreenTimeLimitId; [key: string]: unknown }>;

const formatGameTitle = (slug: string, lang: string): string => {
  const map: Record<string, { gu: string; hi: string; en: string }> = {
    'find-letter': { gu: 'અક્ષર શોધો', hi: 'अक्षर खोजें', en: 'Find Letter' },
    'picture-matching': { gu: 'ચિત્ર જોડો', hi: 'चित्र मिलान', en: 'Picture Match' },
    'counting': { gu: 'ગણતરી રમત', hi: 'गिनती खेल', en: 'Counting Fun' },
    'memory-match': { gu: 'મેમરી મેચ', hi: 'मेमोरी मैच', en: 'Memory Match' },
    'missing-letter': { gu: 'ખૂટતો અક્ષર', hi: 'लुप्त अक्षर', en: 'Missing Letter' },
    'colors-shapes': { gu: 'રંગો અને આકારો', hi: 'रंग और आकार', en: 'Colors & Shapes' },
    'listen-choose': { gu: 'સાંભળો અને પસંદ કરો', hi: 'सुनें और चुनें', en: 'Listen & Choose' },
    'balloon-pop': { gu: 'ફુગ્ગા ફોડો', hi: 'गुब्बारा फोड़ो', en: 'Balloon Pop' },
    'math-quiz': { gu: 'ગણિત ક્વિઝ', hi: 'गणित क्विज़', en: 'Math Quiz' },
    'picture-puzzle': { gu: 'ચિત્ર પઝલ', hi: 'चित्र पहेली', en: 'Picture Puzzle' },
    'find-object': { gu: 'વસ્તુ શોધો', hi: 'वस्तु खोजें', en: 'Find Object' },
    'logic-reasoning': { gu: 'તર્ક અને વિચાર', hi: 'तर्क और विचार', en: 'Logic & Reasoning' },
    'odd-one-out': { gu: 'અલગ તારવો', hi: 'अलग पहचानें', en: 'Odd One Out' },
    'word-builder': { gu: 'શબ્દ જોડો', hi: 'शब्द जोड़ो', en: 'Word Builder' },
    'shopgame': { gu: 'બાળ બજાર', hi: 'बाल बाज़ार', en: 'Kids Market' },
    'speed-math': { gu: 'સ્પીડ ગણિત', hi: 'स्पीड गणित', en: 'Speed Math' },
    'duel': { gu: '૨-પ્લેયર બેટલ', hi: '२-प्लेयर बैटल', en: '2-Player Duel' },
  };
  const item = map[slug.toLowerCase()];
  if (item) return lang === 'gu' ? item.gu : lang === 'hi' ? item.hi : item.en;
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function ParentsScreen() {
  const router = useRouter();
  const { progress, updateProgress, language, ageGroup, setAgeGroup, resetProgress, resetAll, currentUser, isAuthenticated, isGuest, logoutUser, switchProfile } = useApp();

  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<number>(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGuestLimitModalOpen, setIsGuestLimitModalOpen] = useState(false);
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [newAgeGroup, setNewAgeGroup] = useState<AgeGroup>('2-4');
  const [selectedAvatar, setSelectedAvatar] = useState('avatar_3d_boy');
  const [isProfileBusy, setIsProfileBusy] = useState(false);

  // Screen time & Eye care settings state
  const [selectedScreenTime, setSelectedScreenTime] = useState('unlimited');
  const [isEyeCareEnabled, setIsEyeCareEnabled] = useState(true);

  // Parental Gate Verification State
  const [isVerified, setIsVerified] = useState(false);
  // Kid-styled confirm/notify dialogs (Alert.alert is a no-op on web).
  const { dialog, confirm, notify } = useKidDialog();
  const [, setUsageRefreshTick] = useState(0);

  useEffect(() => {
    const unsubscribe = screenWellnessService.subscribeUsage(() => {
      setUsageRefreshTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  useFocusEffect(
    useCallback(() => {
      screenWellnessService.flushActiveTime();
      setUsageRefreshTick((t) => t + 1);
    }, [])
  );

  useEffect(() => {
    loadProfiles();
    screenWellnessService.getScreenTimeLimit().then((lim) => setSelectedScreenTime(lim));
    screenWellnessService.getEyeCareEnabled().then((eye) => setIsEyeCareEnabled(eye));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, progress.childName, ageGroup]);

  const loadProfiles = async () => {
    try {
      const [fetched, activeId] = await Promise.all([
        backendService.getProfiles(),
        backendService.getActiveProfileId(),
      ]);
      let list = (fetched && fetched.length > 0 ? fetched : []).filter(
        (p) => p.nickname && p.nickname.trim().toLowerCase() !== 'aa' && p.nickname.trim().toLowerCase() !== 'bb'
      );
      const currentChildName = progress.childName?.trim();
      if (currentChildName) {
        let matched = false;
        list = list.map((p) => {
          if (
            String(p.id) === String(activeId) &&
            (p.nickname === 'Little Star' || p.nickname === 'નાનો તારો' || p.nickname === 'छोटा तारा')
          ) {
            matched = true;
            return { ...p, nickname: currentChildName };
          }
          return p;
        });
        if (!matched && list.length === 0) {
          list = [{ id: 1, nickname: currentChildName, age_group: ageGroup, avatar: '🦁' }];
        }
      }
      if (list[0]?.id) {
        storageService.setPrimaryProfileId(list[0].id);
      }
      setActiveProfileId(activeId);
      const activeObj = list.find((p) => p.id === activeId);
      if (activeObj && ageGroup && activeObj.age_group !== ageGroup) {
        activeObj.age_group = ageGroup;
        list = list.map((p) => (p.id === activeObj.id ? { ...p, age_group: ageGroup } : p));
        backendService.updateProfileAgeGroup(activeObj.id, ageGroup).catch(() => {});
      }
      setProfiles(list);
    } catch {
      // Offline fallback
    }
  };

  const handleSelectProfile = async (profile: ChildProfile) => {
    if (isProfileBusy) return;
    soundEffects.playBubblePop();
    setIsProfileBusy(true);
    try {
      setActiveProfileId(profile.id);
      await backendService.setActiveProfileId(profile.id);
      if (switchProfile) {
        await switchProfile(profile.id, profile.age_group, profile.nickname);
      } else {
        await setAgeGroup(profile.age_group);
      }
    } finally {
      setIsProfileBusy(false);
    }
  };

  const handleToggle3DAvatar = async () => {
    soundEffects.playBubblePop();
    const currently3D = is3DAvatar(activeProfile.avatar);
    const nextAvatar = currently3D ? '🦊' : 'avatar_3d_boy';
    await backendService.updateProfileAvatar(activeProfile.id, nextAvatar);
    setProfiles((prev) =>
      prev.map((p) => (p.id === activeProfile.id ? { ...p, avatar: nextAvatar } : p))
    );
    await updateProgress({
      currentAvatar: {
        character: currently3D ? '🦊' : 'avatar_3d_boy',
        hat: progress.currentAvatar?.hat || '👑',
        accessory: progress.currentAvatar?.accessory || '🎒',
      },
    });
  };

  const handleCreateProfile = async () => {
    if (!newNickname.trim() || isProfileBusy) return;
    soundEffects.playBubblePop();
    setIsProfileBusy(true);
    try {
      const created = await backendService.createProfile(
        newNickname.trim(),
        newAgeGroup,
        selectedAvatar
      );
      setProfiles((prev) => [...prev, created]);
      setActiveProfileId(created.id);
      if (switchProfile) {
        await switchProfile(created.id, created.age_group, created.nickname);
      } else {
        await setAgeGroup(created.age_group);
      }
      setIsAddModalOpen(false);
      setNewNickname('');
      soundEffects.playTadaaa();
    } catch {
      // Ignore
    } finally {
      setIsProfileBusy(false);
    }
  };

  const handleDeleteProfile = (profileToDelete: ChildProfile) => {
    soundEffects.playBubblePop();
    if (profiles.length <= 1) {
      notify({
        emblem: '👶',
        tone: 'sun',
        title: language === 'gu' ? 'ચેતવણી' : language === 'hi' ? 'चेतावनी' : 'Notice',
        message:
          language === 'gu'
            ? 'ઓછામાં ઓછું એક બાળ પ્રોફાઇલ રાખવું જરૂરી છે.'
            : language === 'hi'
            ? 'कम से कम एक प्रोफाइल होना आवश्यक है।'
            : 'At least one child profile must remain.',
      });
      return;
    }

    const title =
      language === 'gu'
        ? 'પ્રોફાઇલ કાઢી નાખો'
        : language === 'hi'
        ? 'प्रोफाइल हटाएं'
        : 'Delete Profile';

    const message =
      language === 'gu'
        ? `શું તમે ખરેખર "${profileToDelete.nickname}" પ્રોફાઇલ કાઢી નાખવા માંગો છો? આ બાળકની તમામ પ્રગતિ દૂર થઈ જશે.`
        : language === 'hi'
        ? `क्या आप वाकई "${profileToDelete.nickname}" प्रोफाइल हटाना चाहते हैं? इस बच्चे की सभी प्रगति हट जाएगी।`
        : `Are you sure you want to remove "${profileToDelete.nickname}"? All progress for this child will be permanently deleted.`;

    const confirmText = language === 'gu' ? 'કાઢી નાખો' : language === 'hi' ? 'हटाएं' : 'Delete';
    const cancelText = language === 'gu' ? 'રદ કરો' : language === 'hi' ? 'रद्द करें' : 'Cancel';

    confirm({
      title,
      message,
      emblem: '🗑️',
      destructive: true,
      confirmText,
      cancelText,
      onConfirm: () => executeDeleteProfile(profileToDelete.id),
    });
  };

  const executeDeleteProfile = async (profileId: number) => {
    if (isProfileBusy) return;
    setIsProfileBusy(true);
    try {
      soundEffects.playBubblePop();
      await backendService.deleteProfile(profileId);
      await storageService.removeProfileProgress(profileId);

      const remaining = profiles.filter((p) => p.id !== profileId);
      setProfiles(remaining);

      if (activeProfileId === profileId && remaining.length > 0) {
        const next = remaining[0];
        setActiveProfileId(next.id);
        if (switchProfile) {
          await switchProfile(next.id, next.age_group, next.nickname);
        }
      }
    } catch (e) {
      console.warn('Failed to delete profile:', e);
    } finally {
      setIsProfileBusy(false);
    }
  };

  // Active Profile details
  const rawActive = profiles.find((p) => p.id === activeProfileId) || profiles[0];
  const rawNickname =
    rawActive?.nickname &&
    rawActive.nickname !== 'Little Star' &&
    rawActive.nickname !== 'નાનો તારો' &&
    rawActive.nickname !== 'छोटा तारा'
      ? rawActive.nickname
      : progress.childName?.trim() || rawActive?.nickname || 'Little Star';
  const activeProfile = {
    id: rawActive?.id || 1,
    nickname: formatChildName(rawNickname, language) || (language === 'gu' ? 'નાનો તારો' : language === 'hi' ? 'छोटा तारा' : 'Little Star'),
    age_group: ageGroup || rawActive?.age_group || '2-4',
    avatar: rawActive?.avatar || 'avatar_3d_boy',
  };

  // Calculate Category-wise Progress
  const categoryStats = CATEGORIES.filter((c) => c.id !== 'games').map((cat) => {
    const rawInCat = LESSONS.filter((l) => l.categoryId === cat.id);
    const filteredInCat = filterLessonsForClass(rawInCat, ageGroup, cat.id);
    const totalInCat = filteredInCat.length;
    const completedInCat = filteredInCat.filter(
      (l) =>
        progress.completedLessons.includes(l.id) ||
        progress.completedLessons.includes(l.id.replace('an-', 'animal-')) ||
        progress.completedLessons.includes(l.id.replace('animal-', 'an-'))
    ).length;
    const percent = totalInCat > 0 ? Math.round((completedInCat / totalInCat) * 100) : 0;

    let localizedTitle = cat.defaultTitle;
    if (language === 'gu') {
      if (cat.id === 'gu-varnamala') localizedTitle = 'ગુજરાતી વર્ણમાલા (ક ખ ગ)';
      else if (cat.id === 'gu-barakhadi') localizedTitle = 'ગુજરાતી બારાખડી (કા કિ કી)';
      else if (cat.id === 'en-alphabet') localizedTitle = 'અંગ્રેજી મૂળાક્ષરો (A to Z)';
      else if (cat.id === 'en-phonics') localizedTitle = 'અંગ્રેજી ફોનિક્સ (સાઉન્ડ્સ)';
      else if (cat.id === 'hi-varnamala') localizedTitle = 'હિન્દી વર્ણમાલા (अ आ इ)';
      else if (cat.id === 'numbers') localizedTitle = 'અંકો અને ગણતરી (૧ થી ૩૦)';
      else if (cat.id === 'math') localizedTitle = 'સરવાળા અને બાદબાકી';
      else if (cat.id === 'ghadiya') localizedTitle = 'ઘડિયા કોષ્ટક (૧ થી ૧૦)';
      else if (cat.id === 'colors-shapes') localizedTitle = 'રંગો અને આકારો';
      else if (cat.id === 'animals') localizedTitle = 'પ્રાણીઓ અને પક્ષીઓ';
      else if (cat.id === 'fruits') localizedTitle = 'ફળો અને શાકભાજી';
      else if (cat.id === 'objects') localizedTitle = 'રોજિંદા ઉપયોગની વસ્તુઓ';
    } else if (language === 'hi') {
      if (cat.id === 'gu-varnamala') localizedTitle = 'गुजराती वर्णमाला (ક ખ ગ)';
      else if (cat.id === 'gu-barakhadi') localizedTitle = 'गुजराती बारहखड़ी (કા કિ કી)';
      else if (cat.id === 'en-alphabet') localizedTitle = 'अंग्रेजी वर्णमाला (A to Z)';
      else if (cat.id === 'en-phonics') localizedTitle = 'अंग्रेजी फोनिक्स (ध्वनियाँ)';
      else if (cat.id === 'hi-varnamala') localizedTitle = 'हिन्दी वर्णमाला (अ आ इ)';
      else if (cat.id === 'numbers') localizedTitle = 'संख्याएं और गिनती (१ से ३०)';
      else if (cat.id === 'math') localizedTitle = 'जोड़ और घटाव';
      else if (cat.id === 'ghadiya') localizedTitle = 'पहाड़े तालिका (१ से १०)';
      else if (cat.id === 'colors-shapes') localizedTitle = 'रंग और आकार';
      else if (cat.id === 'animals') localizedTitle = 'जानवर और पक्षी';
      else if (cat.id === 'fruits') localizedTitle = 'फल और सब्जियां';
      else if (cat.id === 'objects') localizedTitle = 'दैनिक उपयोग की वस्तुएं';
    }

    // Category icon emojis
    let iconEmoji = '📚';
    if (cat.id === 'gu-varnamala' || cat.id === 'hi-varnamala') iconEmoji = '🔤';
    else if (cat.id === 'gu-barakhadi') iconEmoji = '✍️';
    else if (cat.id === 'en-alphabet' || cat.id === 'en-phonics') iconEmoji = '🔠';
    else if (cat.id === 'numbers') iconEmoji = '🔢';
    else if (cat.id === 'math') iconEmoji = '➕';
    else if (cat.id === 'ghadiya') iconEmoji = '✖️';
    else if (cat.id === 'colors-shapes') iconEmoji = '🎨';
    else if (cat.id === 'animals') iconEmoji = '🦁';
    else if (cat.id === 'fruits') iconEmoji = '🍎';
    else if (cat.id === 'objects') iconEmoji = '🧸';

    return {
      category: cat,
      title: localizedTitle,
      iconEmoji,
      total: totalInCat,
      completed: completedInCat,
      percent,
    };
  });

  // Calculate total lessons and overall curriculum percentage
  const totalSyllabusLessons = categoryStats.reduce((sum, c) => sum + c.total, 0);
  const totalCompletedInSyllabus = categoryStats.reduce((sum, c) => sum + c.completed, 0);
  const overallPercentage =
    totalSyllabusLessons > 0 ? Math.min(100, Math.round((totalCompletedInSyllabus / totalSyllabusLessons) * 100)) : 0;

  // Split categoryStats into 3 distinct logical groups
  const languageSubjects = categoryStats.filter((c) =>
    ['gu-varnamala', 'gu-barakhadi', 'en-alphabet', 'en-phonics', 'hi-varnamala'].includes(c.category.id)
  );
  const mathSubjects = categoryStats.filter((c) =>
    ['numbers', 'math', 'ghadiya'].includes(c.category.id)
  );
  const gkSubjects = categoryStats.filter((c) =>
    ['colors-shapes', 'animals', 'fruits', 'objects'].includes(c.category.id)
  );

  // Real active foreground learning time tracked across active sessions
  const activeLearningMins = screenWellnessService.getTotalTrackedMinutes();



  const renderSubject3DBadge = (categoryId: string, fallbackEmoji: string) => {
    switch (categoryId) {
      case 'gu-varnamala':
        return <TopicGujaratiVarnamalaBadge size={44} />;
      case 'gu-barakhadi':
        return <TopicVocabularyBadge size={44} />;
      case 'en-alphabet':
        return <TopicAlphabetBadge size={44} />;
      case 'en-phonics':
        return <TopicPhonicsBadge size={44} />;
      case 'hi-varnamala':
        return <TopicHindiVarnamalaBadge size={44} />;
      case 'numbers':
        return <TopicNumberSenseBadge size={44} />;
      case 'math':
        return <TopicAdditionBadge size={44} />;
      case 'ghadiya':
        return <TopicMultiplicationBadge size={44} />;
      case 'colors-shapes':
        return <TopicGeometryBadge size={44} />;
      case 'animals':
        return <TopicAnimalsBadge size={44} />;
      case 'fruits':
        return <TopicPlantsBadge size={44} />;
      case 'objects':
        return <TopicOurWorldBadge size={44} />;
      default:
        return <Text style={{ fontSize: 26 }}>{fallbackEmoji}</Text>;
    }
  };

  const getCategoryDescription = (categoryId: string) => {
    const descriptions: Record<string, { gu: string; hi: string; en: string }> = {
      'gu-varnamala': {
        gu: 'ક ખ ગ મૂળાક્ષરો અને શબ્દો શીખો',
        hi: 'गुजराती क ख ग वर्णमाला सीखें',
        en: 'Learn Gujarati vowels & consonants',
      },
      'gu-barakhadi': {
        gu: 'કા કી કુ બારાખડી અને શબ્દ રચના',
        hi: 'गुजराती बारहखड़ी और मात्राएं सीखें',
        en: 'Master vowel combinations & sounds',
      },
      'en-alphabet': {
        gu: 'A to Z મૂળાક્ષરો અને સરળ શબ્દો',
        hi: 'A से Z अक्षर और शुरुआती शब्द',
        en: 'Letters A to Z and simple words',
      },
      'en-phonics': {
        gu: 'અંગ્રેજી ફોનિક્સ અને ઉચ્ચારણ',
        hi: 'ध्वनि विज्ञान और अंग्रेजी उच्चारण',
        en: 'Phonics sounds and word blending',
      },
      'hi-varnamala': {
        gu: 'અ આ ક હિન્દી વર્ણમાળા શીખો',
        hi: 'अ आ क स्वर और व्यंजन सीखें',
        en: 'Learn Hindi vowels & consonants',
      },
      'numbers': {
        gu: '૧ થી ૧૦ અંકો અને મજેદાર ગણતરી',
        hi: '१ से १० संख्याएं और मजेदार गिनती',
        en: 'Learn numbers 1 to 10 and counting',
      },
      'math': {
        gu: 'મૂળભૂત સરવાળા અને બાદબાકી શીખો',
        hi: 'सरल जोड़ और घटाव सीखें',
        en: 'Learn basic addition and subtraction',
      },
      'ghadiya': {
        gu: '૧ થી ૧૦ ના ઘડિયા પાકા કરો',
        hi: '१ से १० के पहाड़े याद करें',
        en: 'Multiplication tables 1 to 10',
      },
      'colors-shapes': {
        gu: 'વિવિધ આકારો અને સુંદર રંગો',
        hi: 'विभिन्न आकार और सुंदर रंग',
        en: 'Explore different shapes and colors',
      },
      'animals': {
        gu: 'પ્રાણીઓ, પક્ષીઓ અને તેમના અવાજો',
        hi: 'जानवर, पक्षी और उनकी आवाजें',
        en: 'Animals, birds, and fun sounds',
      },
      'fruits': {
        gu: 'મીઠા ફળો અને તાજા શાકભાજી',
        hi: 'स्वादिष्ट फल और हरी सब्जियां',
        en: 'Healthy fruits and fresh vegetables',
      },
      'objects': {
        gu: 'રોજિંદા જીવનની ઉપયોગી વસ્તુઓ',
        hi: 'दैनिक जीवन की उपयोगी वस्तुएं',
        en: 'Everyday objects and world items',
      },
    };
    return (
      descriptions[categoryId]?.[language] ||
      (language === 'gu'
        ? 'પાઠ અને પ્રવૃત્તિઓ'
        : language === 'hi'
        ? 'पाठ और गतिविधियां'
        : 'Lessons and fun activities')
    );
  };

  const renderSubjectItemCard = (item: (typeof categoryStats)[0], pillarBg: string) => {
    const isMastered = item.percent >= 100;
    return (
      <TouchableOpacity
        key={item.category.id}
        style={[
          styles.premiumSubjectCard,
          webStyle({
            boxShadow: '0 8px 24px rgba(128, 98, 245, 0.08), 0 2px 6px rgba(0, 0, 0, 0.03)',
            cursor: 'pointer',
          }),
        ]}
        activeOpacity={0.88}
        onPress={() => {
          soundEffects.playBubblePop();
          router.push(`/lessons?categoryId=${item.category.id}`);
        }}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}, ${item.completed} of ${item.total} lessons`}
      >
        {/* Left Embossed 3D Badge Box */}
        <View style={[styles.embossedBadgeBox, { backgroundColor: pillarBg }]}>
          {renderSubject3DBadge(item.category.id, item.iconEmoji)}
        </View>

        {/* Middle Content: Title, Description & Progress Bar */}
        <View style={styles.cardContentCol}>
          <Text style={styles.cardItemTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.cardItemSubtitle} numberOfLines={1}>
            {getCategoryDescription(item.category.id)}
          </Text>

          <View style={styles.cardProgressRow}>
            <View style={styles.cardProgressTrack}>
              <View
                style={[
                  styles.cardProgressFill,
                  {
                    width: item.percent > 0 ? `${Math.min(100, Math.max(item.percent, 0))}%` : '0%',
                    opacity: item.percent > 0 ? 1 : 0,
                    backgroundColor: isMastered ? '#10B981' : '#8062F5',
                  },
                ]}
              />
            </View>
            <Text style={styles.cardProgressFraction}>
              {formatNumberDigits(item.completed, language)} / {formatNumberDigits(item.total, language)}
            </Text>
          </View>
        </View>

        {/* Right 3D Circular Purple Chevron Indicator */}
        <View
          style={[
            styles.circularActionButton,
            isMastered && styles.circularActionButtonMastered,
          ]}
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d={isMastered ? 'M5 13L9 17L19 7' : 'M9 18L15 12L9 6'}
              stroke="#FFFFFF"
              strokeWidth={isMastered ? 3 : 2.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      </TouchableOpacity>
    );
  };

  const getAgeGroupLabel = (ag: AgeGroup) => {
    if (language === 'gu') {
      if (ag === '2-4') return '૨ થી ૪ વર્ષ (બાલવાટિકા/નર્સરી)';
      if (ag === '4-6') return '૪ થી ૬ વર્ષ (ધોરણ ૧-૨ પાયો)';
      return '૬ થી ૮ વર્ષ (ધોરણ ૩-૫ માસ્ટરી)';
    }
    if (language === 'hi') {
      if (ag === '2-4') return '२ से ४ वर्ष (नर्सरी/केजी)';
      if (ag === '4-6') return '४ से ६ वर्ष (कक्षा १-२ नींव)';
      return '६ से ८ वर्ष (कक्षा ३-५ मास्टरी)';
    }
    if (ag === '2-4') return '2 to 4 Years (Nursery / KG)';
    if (ag === '4-6') return '4 to 6 Years (Class 1-2 Foundation)';
    return '6 to 8 Years (Class 3-5 Mastery)';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppGlobalBackground id="parentsBgGrad" />
      <Header
        title={language === 'gu' ? 'વાલી સંચાલન' : language === 'hi' ? 'अभिभावक कक्ष' : 'Parents Corner'}
        showBack={true}
        backHref="/home"
      />

      {/* Parental Gate Modal */}
      {!isVerified ? (
        <ScrollView contentContainerStyle={styles.gateWrapper} keyboardShouldPersistTaps="handled">
          <View style={styles.gateCardFun}>
            <View style={styles.gateEmblem}>
              <Art.ShieldArt size={42} />
            </View>
            <View style={styles.gatePillBadge}>
              <Text style={styles.gatePillBadgeText}>
                {language === 'gu' ? '🛡️ સુરક્ષા ચકાસણી' : language === 'hi' ? '🛡️ सुरक्षा जांच' : '🛡️ Grown-Up Check'}
              </Text>
            </View>
            <Text style={styles.gateTitle}>
              {language === 'gu'
                ? 'માતા-પિતા સુરક્ષા ચકાસણી'
                : language === 'hi'
                ? 'अभिभावक सुरक्षा सत्यापन'
                : 'Parental Safety Gate'}
            </Text>
            <ParentGate
              language={language}
              onSuccess={() => setIsVerified(true)}
              onCancel={() => router.push('/home')}
              cancelLabel={language === 'gu' ? 'હોમપેજ પર પાછા' : language === 'hi' ? 'मुख्य पृष्ठ पर' : 'Back to Home'}
            />
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          <View style={styles.mainContainer}>
            {/* 0. PARENT ACCOUNT & CLOUD SYNC CARD */}
            <View style={[styles.authCard, shadows.card]}>
              <View style={styles.authHeaderRow}>
                <View style={styles.authIconWrap}>
                  {isAuthenticated ? <Glyph name="user" size={26} color="#4338CA" strokeWidth={2.4} /> : <Art.ShieldArt size={32} />}
                </View>
                <View style={styles.authInfoCol}>
                  <Text style={styles.authTitle}>
                    {isAuthenticated
                      ? language === 'gu'
                        ? 'વાલી ખાતું'
                        : language === 'hi'
                        ? 'अभिभावक खाता'
                        : 'Parent Account'
                      : language === 'gu'
                      ? 'વાલી ખાતું (મહેમાન મોડ)'
                      : language === 'hi'
                      ? 'अभिभावक खाता (अतिथि मोड)'
                      : 'Parent Account (Guest Mode)'}
                  </Text>
                  <Text style={styles.authSub}>
                    {isAuthenticated
                      ? currentUser?.email || `@${currentUser?.username}`
                      : language === 'gu'
                      ? 'પ્રગતિ અને પ્રોફાઇલ્સ ક્લાઉડ પર સાચવવા માટે એકાઉન્ટ જોડો.'
                      : language === 'hi'
                      ? 'प्रगति और प्रोफाइल क्लाउड पर सहेजने के लिए खाता जोड़ें।'
                      : 'Sign in to sync progress and child profiles across devices.'}
                  </Text>
                </View>
                {isAuthenticated && (
                  <View style={styles.authSyncPill}>
                    <Text style={styles.authSyncPillText}>
                      {language === 'gu' ? 'કનેક્ટેડ' : language === 'hi' ? 'कनेक्टेड' : 'Synced'}
                    </Text>
                  </View>
                )}
              </View>

              {isAuthenticated ? (
                <View style={styles.authLoggedInRow}>
                  <Text style={styles.authWelcomeText}>
                    {language === 'gu' ? 'સ્વાગત છે, ' : language === 'hi' ? 'स्वागत है, ' : 'Welcome, '}
                    <Text style={{ fontWeight: '600', color: '#1E293B' }}>
                      {currentUser?.first_name || currentUser?.username}
                    </Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.authLogoutBtn}
                    onPress={async () => {
                      soundEffects.playBubblePop();
                      await logoutUser();
                      router.replace('/login');
                    }}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.authLogoutBtnText}>
                      {language === 'gu' ? 'લૉગ આઉટ' : language === 'hi' ? 'लॉग आउट' : 'Log Out'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.authActionRow}>
                  <TouchableOpacity
                    style={styles.authPrimaryBtn}
                    onPress={() => {
                      soundEffects.playBubblePop();
                      router.push('/login');
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.authPrimaryBtnText}>
                      {language === 'gu' ? 'લૉગ ઇન' : language === 'hi' ? 'लॉग इन' : 'Sign In'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.authSecondaryBtn}
                    onPress={() => {
                      soundEffects.playBubblePop();
                      router.push('/register');
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.authSecondaryBtnText}>
                      {language === 'gu' ? 'ખાતું બનાવો' : language === 'hi' ? 'खाता बनाएं' : 'Create Account'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Guest Mode Limitation Banner */}
            {(isGuest || !isAuthenticated) && (
              <View style={[styles.guestLimitationBanner, shadows.soft]}>
                <View style={styles.guestLimitIconWrap}>
                  <Art.CloudArt size={34} />
                </View>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <View style={styles.guestModePill}>
                    <Text style={styles.guestModePillText}>
                      {language === 'gu' ? 'મહેમાન મોડ મર્યાદા' : language === 'hi' ? 'अतिथि मोड सीमा' : 'Guest Mode Limitation'}
                    </Text>
                  </View>
                  <Text style={styles.guestLimitTitle}>
                    {language === 'gu'
                      ? 'ડેટા ફક્ત આ ઉપકરણ પર સંગ્રહિત છે'
                      : language === 'hi'
                      ? 'डेटा केवल इस डिवाइस पर सुरक्षित है'
                      : 'Data Saved Locally on this Device'}
                  </Text>
                  <Text style={styles.guestLimitDesc}>
                    {language === 'gu'
                      ? 'મહેમાન મોડમાં ૧ બાળકની પ્રોફાઇલ સપોર્ટેડ છે. ક્લાઉડ સિંક અને બહુવિધ પ્રોફાઇલ્સ માટે મફત વાલી ખાતું બનાવો.'
                      : language === 'hi'
                      ? 'अतिथि मोड में केवल १ बाल प्रोफाइल समर्थित है। क्लाउड सिंक और अधिक प्रोफाइल के लिए मुफ्त खाता बनाएं।'
                      : '1 child profile in Guest Mode. Create a free parent account to backup progress & add multiple children.'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.guestLimitBtn}
                  onPress={() => {
                    soundEffects.playBubblePop();
                    router.push('/register');
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.guestLimitBtnText}>
                    {language === 'gu' ? 'સેવ કરો' : language === 'hi' ? 'सेव करें' : 'Sign Up Free'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 1. HERO CHILD OVERVIEW CARD (Redesigned with Premium Kids Aesthetic) */}
            <View style={[styles.heroCard, shadows.card]}>
              {/* Soft Ambient SVG Gradient Background */}
              <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <Svg width="100%" height="100%">
                  <Defs>
                    <LinearGradient id="heroCardGrad" x1="0" y1="0" x2="1" y2="1">
                      <Stop offset="0%" stopColor="#8062F5" stopOpacity="1" />
                      <Stop offset="50%" stopColor="#6D43EE" stopOpacity="1" />
                      <Stop offset="100%" stopColor="#5B29E3" stopOpacity="1" />
                    </LinearGradient>
                  </Defs>
                  <Rect width="100%" height="100%" rx={28} ry={28} fill="url(#heroCardGrad)" />
                  <Circle cx="88%" cy="14%" r="80" fill="rgba(255, 255, 255, 0.09)" />
                  <Circle cx="12%" cy="92%" r="65" fill="rgba(0, 0, 0, 0.06)" />
                </Svg>
              </View>

              <View style={styles.heroTopRow}>
                <TouchableOpacity
                  style={styles.heroAvatarWrap}
                  onPress={handleToggle3DAvatar}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Toggle 3D avatar"
                >
                  {is3DAvatar(activeProfile.avatar) ? (
                    <Image
                      source={AVATAR_3D_BOY}
                      style={styles.heroAvatarImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.heroAvatarEmojiWrap}>
                      <Text style={styles.heroAvatarEmoji}>{normalizeAvatarEmoji(activeProfile.avatar)}</Text>
                    </View>
                  )}
                  <View style={styles.heroAvatarCrown}>
                    <Art.MedalArt size={17} />
                  </View>
                </TouchableOpacity>

                <View style={styles.heroInfoWrap}>
                  <View style={styles.heroNameRow}>
                    <Text style={styles.heroNickname}>{activeProfile.nickname}</Text>
                    <View style={styles.activePill}>
                      <Text style={styles.activePillText}>
                        {language === 'gu' ? 'સક્રિય લર્નર' : language === 'hi' ? 'सक्रिय शिक्षार्थी' : 'Active Learner'}
                      </Text>
                    </View>
                  </View>

                  {/* Tactile 3D HD / Mascot Toggle Pill */}
                  <TouchableOpacity
                    onPress={handleToggle3DAvatar}
                    style={[
                      styles.hdPill,
                      is3DAvatar(activeProfile.avatar) ? styles.hdPillActive : styles.hdPillInactive,
                    ]}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Switch avatar mode"
                  >
                    <Text
                      style={[
                        styles.hdPillText,
                        is3DAvatar(activeProfile.avatar) ? styles.hdPillTextActive : styles.hdPillTextInactive,
                      ]}
                    >
                      {is3DAvatar(activeProfile.avatar)
                        ? (language === 'gu' ? '3D HD મોડ' : language === 'hi' ? '3D HD मोड' : '3D HD Mode')
                        : (language === 'gu' ? '3D HD અવતાર કરો' : language === 'hi' ? '3D HD अवतार करें' : 'Switch to 3D HD')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      soundEffects.playBubblePop();
                      router.push('/classes');
                    }}
                    style={styles.heroAgeSubTouch}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Switch Class"
                  >
                    <Text style={styles.heroAgeSub}>
                      {getAgeGroupLabel(activeProfile.age_group)} •{' '}
                      {language === 'gu' ? 'બદલો' : language === 'hi' ? 'बदलें' : 'Change'}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.heroBadgesRow}>
                    <View style={styles.streakBadge}>
                      <Text style={styles.streakBadgeText}>
                        {formatNumberDigits(progress.streakDays || 1, language)} {language === 'gu' ? 'દિવસની સ્ટ્રીક' : language === 'hi' ? 'दिन की लकीर' : 'Days Streak'}
                      </Text>
                    </View>
                    <View style={styles.levelBadge}>
                      <Text style={styles.levelBadgeText}>
                        {language === 'gu' ? 'સ્તર: સુપર એક્સપ્લોરર' : language === 'hi' ? 'स्तर: सुपर खोजकर्ता' : 'Level: Explorer'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Overall Syllabus Progress Bar */}
              <View style={styles.heroProgressBox}>
                <View style={styles.heroProgressLabelRow}>
                  <Text style={styles.heroProgressTitle}>
                    {language === 'gu'
                      ? 'સંપૂર્ણ અભ્યાસક્રમ પૂર્ણતા'
                      : language === 'hi'
                      ? 'संपूर्ण पाठ्यक्रम प्रगति'
                      : 'Overall Curriculum Completion'}
                  </Text>
                  <Text style={styles.heroProgressPercent}>
                    {formatNumberDigits(overallPercentage, language)}%
                  </Text>
                </View>
                <View style={styles.heroProgressTrack}>
                  <View
                    style={[
                      styles.heroProgressBar,
                      {
                        width: overallPercentage > 0 ? `${Math.min(100, overallPercentage)}%` : '0%',
                        opacity: overallPercentage > 0 ? 1 : 0,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.heroEncourageText}>
                  {overallPercentage >= 50
                    ? (language === 'gu' ? 'શાનદાર પ્રગતિ! તમારું બાળક ઝડપથી આગળ વધી રહ્યું છે.' : language === 'hi' ? 'शानदार प्रगति! आपका बच्चा तेजी से सीख रहा है।' : 'Amazing progress! Your child is learning fast.')
                    : (language === 'gu' ? 'ઉત્તમ શરૂઆત! નિયમિત અભ્યાસથી જ્ઞાન મજબૂત બનશે.' : language === 'hi' ? 'बेहतरीन शुरुआत! नियमित अभ्यास से ज्ञान बढ़ेगा।' : 'Great start! Daily study builds strong foundations.')}
                </Text>
              </View>

              {/* Quick Actions inside Hero */}
              <View style={styles.heroActionsRow}>
                <TouchableOpacity
                  style={styles.heroActionBtn}
                  onPress={() => setIsReportCardOpen(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.heroActionBtnText}>
                    {language === 'gu' ? 'પ્રગતિ પત્રક જુઓ' : language === 'hi' ? 'प्रगति पत्रक देखें' : 'View Report Card'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.heroActionBtn, styles.heroActionBtnSecondary]}
                  onPress={() => {
                    soundEffects.playBubblePop();
                    if (isGuest || !isAuthenticated) {
                      setIsGuestLimitModalOpen(true);
                    } else {
                      setIsAddModalOpen(true);
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.heroActionBtnSecondaryText}>
                    + {language === 'gu' ? 'નવું બાળક ઉમેરો' : language === 'hi' ? 'नया बच्चा जोड़ें' : 'Add Child'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 2. CHILD PROFILES SELECTOR */}
            <View style={[styles.sectionCard, shadows.card]}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionHeading}>
                    {language === 'gu'
                      ? 'બાળકના પ્રોફાઇલ્સ'
                      : language === 'hi'
                      ? 'बच्चों के प्रोफाइल'
                      : 'Child Profiles'}
                  </Text>
                  <Text style={styles.sectionSub}>
                    {language === 'gu'
                      ? 'એક કરતાં વધુ બાળકો માટે અલગ પ્રોફાઇલ પસંદ કરો:'
                      : language === 'hi'
                      ? 'एक से अधिक बच्चों के लिए अलग प्रोफाइल चुनें:'
                      : 'Switch or manage profiles for multiple children:'}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    soundEffects.playBubblePop();
                    if (isGuest || !isAuthenticated) {
                      setIsGuestLimitModalOpen(true);
                    } else {
                      setIsAddModalOpen(true);
                    }
                  }}
                  style={styles.addProfileBtn}
                  activeOpacity={0.8}
                >
                  <Text style={styles.addProfileBtnText}>+ {language === 'gu' ? 'નવું પ્રોફાઇલ' : language === 'hi' ? 'नया प्रोफाइल' : 'New Profile'}</Text>
                </TouchableOpacity>
              </View>

              <HorizontalScrollRow
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.profilesRow}
                nestedScrollEnabled={true}
                directionalLockEnabled={true}
                keyboardShouldPersistTaps="handled"
              >
                {profiles.map((p) => {
                  const isActive = p.id === activeProfileId;
                  const avatarIcon = normalizeAvatarEmoji(p.avatar);
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[
                        styles.profileItem,
                        isActive && styles.activeProfileItem,
                        webStyle({ cursor: 'pointer' }),
                      ]}
                      onPress={() => handleSelectProfile(p)}
                      activeOpacity={0.8}
                      accessibilityRole={Platform.OS === 'web' ? undefined : 'button'}
                    >
                      {profiles.length > 1 && (
                        <TouchableOpacity
                          onPress={(e) => {
                            e?.stopPropagation?.();
                            handleDeleteProfile(p);
                          }}
                          style={styles.profileDeleteBtn}
                          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                          activeOpacity={0.7}
                        >
                          <Glyph name="close" size={12} color={'#DC2626'} strokeWidth={3} />
                        </TouchableOpacity>
                      )}
                      <View style={styles.profileAvatarBox}>
                        {is3DAvatar(p.avatar) ? (
                          <Image
                            source={AVATAR_3D_BOY}
                            style={styles.profileAvatarImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <Text style={styles.profileAvatarText}>{avatarIcon}</Text>
                        )}
                        {isActive && (
                          <View style={styles.profileCheckBadge}>
                            <Glyph name="check" size={12} color={'#FFFFFF'} strokeWidth={3} />
                          </View>
                        )}
                      </View>
                      <Text
                        style={[styles.profileName, isActive && styles.activeProfileText]}
                        numberOfLines={1}
                      >
                        {formatChildName(p.nickname, language) || p.nickname}
                      </Text>
                      <Text style={styles.profileAgeGroup}>
                        {formatNumberDigits(p.age_group, language)} {language === 'gu' ? 'વર્ષ' : language === 'hi' ? 'वर्ष' : 'Yrs'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </HorizontalScrollRow>
            </View>

            {/* 3. QUICK METRICS DASHBOARD (4 PREMIUM CARDS) */}
            <View style={styles.statsGrid}>
              <View style={[styles.statBox, { backgroundColor: '#FEF9C3', borderColor: '#FDE047' }, shadows.soft]}>
                <View style={styles.statIconCircle}>
                  <Art.StarArt size={36} />
                </View>
                <Text style={styles.statNumber}>{formatNumberDigits(progress.stars, language)}</Text>
                <Text style={styles.statLabel}>
                  {language === 'gu' ? 'કુલ સ્ટાર્સ' : language === 'hi' ? 'कुल सितारे' : 'Total Stars'}
                </Text>
                <Text style={styles.statSubText}>
                  {language === 'gu' ? 'લેસન અને ગેમ્સમાંથી' : language === 'hi' ? 'पाठ और खेलों से' : 'Earned in study'}
                </Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }, shadows.soft]}>
                <View style={styles.statIconCircle}>
                  <Art.BookArt size={36} />
                </View>
                <Text style={styles.statNumber}>{formatNumberDigits(progress.completedLessons.length, language)}</Text>
                <Text style={styles.statLabel}>
                  {language === 'gu' ? 'શીખેલા પાઠ' : language === 'hi' ? 'सीखे हुए पाठ' : 'Lessons Done'}
                </Text>
                <Text style={styles.statSubText}>
                  {language === 'gu' ? `કુલ ${formatNumberDigits(totalSyllabusLessons, language)} માંથી` : language === 'hi' ? `कुल ${formatNumberDigits(totalSyllabusLessons, language)} में से` : `Out of ${totalSyllabusLessons}`}
                </Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: '#E0F2FE', borderColor: '#7DD3FC' }, shadows.soft]}>
                <View style={styles.statIconCircle}>
                  <Art.ClockArt size={36} />
                </View>
                <Text
                  style={[styles.statNumber, activeLearningMins >= 60 && { fontSize: 17 }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {formatDurationMinutes(activeLearningMins, language)}
                </Text>
                <Text style={styles.statLabel}>
                  {language === 'gu' ? 'અભ્યાસ સમય' : language === 'hi' ? 'अध्ययन समय' : 'Learning Time'}
                </Text>
                <Text style={styles.statSubText}>
                  {language === 'gu' ? 'સક્રિય શિક્ષણ' : language === 'hi' ? 'सक्रिय अध्ययन' : 'Active screen time'}
                </Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: '#FFEDD5', borderColor: '#FDBA74' }, shadows.soft]}>
                <View style={styles.statIconCircle}>
                  <Art.TrophyArt size={36} />
                </View>
                <Text style={styles.statNumber}>{formatNumberDigits(progress.earnedBadges.length, language)}</Text>
                <Text style={styles.statLabel}>
                  {language === 'gu' ? 'મેળવેલ બેજ' : language === 'hi' ? 'अर्जित मेडल' : 'Badges Won'}
                </Text>
                <Text style={styles.statSubText}>
                  {language === 'gu' ? 'સિદ્ધિઓ પ્રાપ્ત' : language === 'hi' ? 'उपलब्धियां' : 'Achievements'}
                </Text>
              </View>
            </View>

            {/* 4. SUBJECT MASTERY GROUPED IN 3 PILLARS */}
            <View style={[styles.sectionCard, styles.masterySectionCard, shadows.card]}>
              <Text style={styles.sectionHeading}>
                {language === 'gu'
                  ? 'વિષય મુજબ પ્રગતિ અને માસ્ટરી'
                  : language === 'hi'
                  ? 'विषयवार प्रगति और मास्टरी'
                  : 'Subject-wise Mastery & Progress'}
              </Text>
              <Text style={styles.sectionSub}>
                {language === 'gu'
                  ? 'બાળકે કયા વિભાગમાં કેટલું જ્ઞાન મેળવ્યું તે વિગતવાર જુઓ:'
                  : language === 'hi'
                  ? 'बच्चे ने किस विषय में कितना ज्ञान प्राप्त किया, विस्तार से देखें:'
                  : 'Track your child’s progress across all educational pillars:'}
              </Text>

              {/* PILLAR 1: LANGUAGES */}
              <View style={[styles.pillarHeaderPill, { backgroundColor: '#F1EDFF', borderColor: '#DDD6FE' }]}>
                <Text style={[styles.pillarHeaderTitle, { color: '#6D28D9' }]}>
                  {language === 'gu' ? '૧. ભાષા અને અક્ષરજ્ઞાન' : language === 'hi' ? '१. भाषा और अक्षर ज्ञान' : '1. Languages & Phonics'}
                </Text>
              </View>
              <View style={styles.subjectsGrid}>
                {languageSubjects.map((item) => renderSubjectItemCard(item, '#F5F3FF'))}
              </View>

              {/* PILLAR 2: MATH & TABLES */}
              <View style={[styles.pillarHeaderPill, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA', marginTop: 22 }]}>
                <Text style={[styles.pillarHeaderTitle, { color: '#C2410C' }]}>
                  {language === 'gu' ? '૨. ગણિત અને ઘડિયા' : language === 'hi' ? '२. गणित और पहाड़े' : '2. Math & Multiplication'}
                </Text>
              </View>
              <View style={styles.subjectsGrid}>
                {mathSubjects.map((item) => renderSubjectItemCard(item, '#FFFBEB'))}
              </View>

              {/* PILLAR 3: GENERAL KNOWLEDGE */}
              <View style={[styles.pillarHeaderPill, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0', marginTop: 22 }]}>
                <Text style={[styles.pillarHeaderTitle, { color: '#047857' }]}>
                  {language === 'gu' ? '૩. સામાન્ય જ્ઞાન અને પર્યાવરણ' : language === 'hi' ? '३. सामान्य ज्ञान और पर्यावरण' : '3. General Knowledge & World'}
                </Text>
              </View>
              <View style={styles.subjectsGrid}>
                {gkSubjects.map((item) => renderSubjectItemCard(item, '#ECFDF5'))}
              </View>
            </View>

            {/* 6. GAME PERFORMANCE DASHBOARD */}
            <View style={[styles.sectionCard, shadows.card]}>
              <Text style={styles.sectionHeading}>
                {language === 'gu' ? 'રમત અને ક્વિઝ સ્કોર' : language === 'hi' ? 'खेल और क्विज़ स्कोर' : 'Games & Quiz Activity'}
              </Text>
              <Text style={styles.sectionSub}>
                {language === 'gu'
                  ? 'શિક્ષણ સાથે મનોરંજન માટે રમેલી રમતોનો રેકોર્ડ:'
                  : language === 'hi'
                  ? 'सीखने के साथ मनोरंजन के लिए खेले गए खेलों का रिकॉर्ड:'
                  : 'Score and engagement in educational minigames:'}
              </Text>

              <View style={styles.gameTable}>
                {Object.entries(progress.gameStats || {}).map(([gameName, st]) => (
                  <View key={gameName} style={styles.gameRow}>
                    <View style={styles.gameNameWrap}>
                      <Art.StarArt size={29} />
                      <Text style={styles.gameName}>{formatGameTitle(gameName, language)}</Text>
                    </View>
                    <View style={styles.gameScoresWrap}>
                      <View style={styles.gameScorePill}>
                        <Text style={styles.gameScoreText}>
                          {language === 'gu' ? 'હાઈ સ્કોર' : language === 'hi' ? 'उच्च स्कोर' : 'High'}: {formatNumberDigits(st.highScore, language)}
                        </Text>
                      </View>
                      <View style={[styles.gameScorePill, { backgroundColor: '#F1F5F9' }]}>
                        <Text style={[styles.gameScoreText, { color: '#475569' }]}>
                          {formatNumberDigits(st.timesPlayed, language)} {language === 'gu' ? 'વખત' : language === 'hi' ? 'बार' : 'times'}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
                {Object.keys(progress.gameStats || {}).length === 0 && (
                  <View style={styles.noGameBox}>
                    <View style={{ marginBottom: 10 }}><Art.JigsawArt size={62} /></View>
                    <Text style={styles.noGameText}>
                      {language === 'gu'
                        ? 'હજુ સુધી કોઈ રમત રમવામાં આવી નથી. બાળ બજાર કે ક્વિઝ રમવાથી યાદશક્તિ વધે છે!'
                        : language === 'hi'
                        ? 'अभी तक कोई खेल नहीं खेला गया है। क्विज़ और बाज़ार खेल से याददाश्त तेज होती है!'
                        : 'No games played yet. Encourage your child to play Word Builder or Market Game!'}
                    </Text>
                    <TouchableOpacity
                      style={styles.playGamesBtn}
                      onPress={() => {
                        soundEffects.playBubblePop();
                        router.push('/games');
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.playGamesBtnText}>
                        {language === 'gu' ? 'શૈક્ષણિક રમતો રમો' : language === 'hi' ? 'शैक्षणिक खेल खेलें' : 'Play Educational Games'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {/* 7. SCREEN TIME & CHILD WELLNESS SETTINGS */}
            <View style={[styles.sectionCard, shadows.card]}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionHeading}>
                    {language === 'gu' ? 'દૈનિક સ્ક્રીન ટાઈમ અને આંખ સંભાળ' : language === 'hi' ? 'दैनिक स्क्रीन समय और नेत्र सुरक्षा' : 'Daily Screen Time & Eye Care'}
                  </Text>
                  <Text style={styles.sectionSub}>
                    {language === 'gu'
                      ? 'બાળકના સ્વાસ્થ્ય માટે સ્ક્રીન ટાઈમ લિમિટ સેટ કરો:'
                      : language === 'hi'
                      ? 'बच्चे के स्वास्थ्य के लिए स्क्रीन समय सीमा निर्धारित करें:'
                      : 'Set healthy digital habits and daily usage limits:'}
                  </Text>
                </View>
                <View style={styles.healthShieldBadge}>
                  <Text style={styles.healthShieldText}>WHO {language === 'gu' ? 'ગાઇડલાઇન' : language === 'hi' ? 'दिशानिर्देश' : 'Care'}</Text>
                </View>
              </View>

              <View style={styles.presetsGrid}>
                {SCREEN_TIME_PRESETS.map((preset) => {
                  const isSelected = selectedScreenTime === preset.id;
                  const label = language === 'gu' ? preset.gu : language === 'hi' ? preset.hi : preset.en;
                  return (
                    <TouchableOpacity
                      key={preset.id}
                      style={[
                        styles.presetBtn,
                        isSelected && styles.presetBtnActive,
                      ]}
                      onPress={() => {
                        soundEffects.playBubblePop();
                        setSelectedScreenTime(preset.id);
                        screenWellnessService.setScreenTimeLimit(preset.id);
                        notify({
                          emblem: '⏳',
                          tone: 'mint',
                          title: language === 'gu' ? 'સ્ક્રીન ટાઈમ સેટ થયો' : language === 'hi' ? 'स्क्रीन समय सेट हुआ' : 'Screen Time Set',
                          message:
                            language === 'gu'
                              ? `દૈનિક લિમિટ ${label} રાખવામાં આવી છે.`
                              : language === 'hi'
                              ? `दैनिक सीमा ${label} रखी गई है।`
                              : `Daily limit has been set to ${label}.`,
                        });
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.presetBtnText,
                          isSelected && styles.presetBtnTextActive,
                        ]}
                      >
                        {isSelected ? '✓ ' : ''}{label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Eye Care & Break Reminder Toggle */}
              <TouchableOpacity
                style={styles.eyeCareBox}
                onPress={() => {
                  soundEffects.playBubblePop();
                  const nextVal = !isEyeCareEnabled;
                  setIsEyeCareEnabled(nextVal);
                  screenWellnessService.setEyeCareEnabled(nextVal);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.eyeCareLeft}>
                  <Art.MagnifierArt size={42} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eyeCareTitle}>
                      {language === 'gu'
                        ? 'દર ૨૦ મિનિટે આંખ આરામ રીમાઇન્ડર'
                        : language === 'hi'
                        ? 'हर २० मिनट में आंखों के आराम का रिमाइंडर'
                        : '20-Minute Eye Rest Break Reminder'}
                    </Text>
                    <Text style={styles.eyeCareDesc}>
                      {language === 'gu'
                        ? '૨૦ મિનિટના સતત ઉપયોગ પછી એપ્લિકેશન બાળકને આંખો પટપટાવવા અને આરામ કરવા જણાવશે.'
                        : language === 'hi'
                        ? '२० मिनट के लगातार उपयोग के बाद ऐप बच्चे को आराम करने के लिए कहेगा।'
                        : 'Gentle animated reminder to blink and rest eyes after 20 minutes.'}
                    </Text>
                  </View>
                </View>
                <View style={[styles.toggleSwitch, isEyeCareEnabled && styles.toggleSwitchActive]}>
                  <View style={[styles.toggleKnob, isEyeCareEnabled && styles.toggleKnobActive]} />
                </View>
              </TouchableOpacity>
            </View>

            {/* 8. PRINTABLE WORKSHEETS & OFFLINE PRACTICE BANNER */}
            <TouchableOpacity
              style={[styles.worksheetsBanner, shadows.card]}
              onPress={() => {
                soundEffects.playBubblePop();
                router.push('/worksheets');
              }}
              activeOpacity={0.85}
            >
              <View style={styles.worksheetsBannerLeft}>
                <View style={styles.worksheetIconBadge}>
                  <Art.ScrollArt size={36} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.worksheetsBannerTitle}>
                    {language === 'gu'
                      ? 'મફત પ્રિન્ટેબલ વર્કશીટ્સ & કલરિંગ પેજ'
                      : language === 'hi'
                      ? 'निःशुल्क प्रिंटेबल वर्कशीट्स और कलरिंग पेज'
                      : 'Free Printable Worksheets & Coloring'}
                  </Text>
                  <Text style={styles.worksheetsBannerSub}>
                    {language === 'gu'
                      ? 'ઘરે પેન્સિલથી કક્કો, અંગ્રેજી અને અંકો લખવાની પ્રેક્ટિસ માટે કલરફુલ PDF પ્રિન્ટ કરો'
                      : language === 'hi'
                      ? 'घर पर पेंसिल से वर्णमाला, अंग्रेजी और अंकों के अभ्यास के लिए PDF प्रिंट करें'
                      : 'Download colorful A4 PDFs to practice tracing and handwriting with pencils at home.'}
                  </Text>
                </View>
              </View>
              <View style={styles.worksheetsBannerArrow}>
                <Text style={styles.worksheetsBannerArrowText}>
                  {language === 'gu' ? 'ડાઉનલોડ કરો' : language === 'hi' ? 'डाउनलोड करें' : 'Download'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* 9. PRACTICAL PARENTING TIPS */}
            <View style={[styles.sectionCard, shadows.card]}>
              <Text style={styles.sectionHeading}>
                {language === 'gu' ? 'વાલીઓ માટે ઉપયોગી શિક્ષણ ટિપ્સ' : language === 'hi' ? 'अभिभावकों के लिए उपयोगी शिक्षण टिप्स' : 'Practical Parenting & Learning Tips'}
              </Text>
              <Text style={styles.sectionSub}>
                {language === 'gu'
                  ? 'બાળક ઝડપથી અને ખુશીથી શીખે તે માટે રોજિંદા જીવનના સરળ ઉપાયો:'
                  : language === 'hi'
                  ? 'बच्चा खुशी-खुशी और जल्दी सीखे, इसके लिए आसान सुझाव:'
                  : 'Actionable tips to maximize your child’s educational growth:'}
              </Text>

              <View style={styles.tipsList}>
                <View style={styles.tipCard}>
                  <Art.MegaphoneArt size={39} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tipCardTitle}>
                      {language === 'gu' ? 'રોજિંદા જીવનમાં શબ્દો બોલો' : language === 'hi' ? 'दैनिक जीवन में शब्द बोलें' : 'Everyday Vocabulary'}
                    </Text>
                    <Text style={styles.tipCardBody}>
                      {language === 'gu'
                        ? 'ઘરમાં સફરજન, બિલાડી કે પંખો જોતાં જ બાળકને તેનો ગુજરાતી અને અંગ્રેજી શબ્દ બોલવા પ્રોત્સાહિત કરો.'
                        : language === 'hi'
                        ? 'घर में सेब, बिल्ली या पंखा देखते ही बच्चे को उसका नाम बोलने के लिए प्रोत्साहित करें।'
                        : 'Ask your child to name everyday objects (apple, cat, spoon) in both languages.'}
                    </Text>
                  </View>
                </View>

                <View style={styles.tipCard}>
                  <Art.PencilArt size={39} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tipCardTitle}>
                      {language === 'gu' ? 'સાથે બેસીને ટ્રેસિંગ કરાવો' : language === 'hi' ? 'साथ बैठकर ट्रेसिंग कराएं' : 'Finger Tracing Together'}
                    </Text>
                    <Text style={styles.tipCardBody}>
                      {language === 'gu'
                        ? 'ટ્રેસિંગ મોડમાં બાળકની સાથે બેસીને આંગળીથી અક્ષર ઘૂંટાવો. તેનાથી હાથની મોટર સ્કિલ મજબૂત બને છે.'
                        : language === 'hi'
                        ? 'ट्रेसिंग मोड में बच्चे के साथ बैठकर उंगली से अक्षर बनवाएं। इससे उंगलियों की पकड़ मजबूत होती है।'
                        : 'Guide their finger along the letter stroke. It builds hand-eye coordination for writing.'}
                    </Text>
                  </View>
                </View>

                <View style={styles.tipCard}>
                  <Art.StarArt size={39} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tipCardTitle}>
                      {language === 'gu' ? 'નાના પ્રયાસોની પણ પ્રશંસા કરો' : language === 'hi' ? 'छोटे प्रयासों की भी प्रशंसा करें' : 'Celebrate Small Wins'}
                    </Text>
                    <Text style={styles.tipCardBody}>
                      {language === 'gu'
                        ? 'દરેક લેસન પૂરું થાય ત્યારે તાળી પાડીને શાબાશી આપો. તેનાથી બાળકનો આત્મવિશ્વાસ બમણો થાય છે.'
                        : language === 'hi'
                        ? 'प्रत्येक पाठ पूरा होने पर ताली बजाकर शाबाशी दें। इससे बच्चे का आत्मविश्वास बढ़ता है।'
                        : 'Clap and give high-fives when they earn stars. Encouragement keeps learning joyful.'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 10. RESET PROGRESS (DANGER ZONE) */}
            <View style={styles.dangerZoneBox}>
              <View>
                <Text style={styles.dangerZoneTitle}>
                  {language === 'gu' ? 'ડેટા અને પ્રોગ્રેસ રીસેટ' : language === 'hi' ? 'डेटा और प्रगति रीसेट' : 'Data & Progress Reset'}
                </Text>
                <Text style={styles.dangerZoneSub}>
                  {language === 'gu'
                    ? 'જો તમે શરૂઆતથી નવેસરથી અભ્યાસ શરૂ કરવા માંગતા હોવ:'
                    : language === 'hi'
                    ? 'यदि आप शुरुआत से दोबारा अभ्यास शुरू करना चाहते हैं:'
                    : 'Clear all stars and start fresh from the beginning:'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.resetBtn}
                activeOpacity={0.8}
                onPress={() => {
                  soundEffects.playBubblePop();
                  const confirmTitle =
                    language === 'gu'
                      ? 'ડેટા રીસેટ કરવો છે?'
                      : language === 'hi'
                      ? 'डेटा रीसेट करना है?'
                      : 'Reset All Progress?';
                  const confirmMsg =
                    language === 'gu'
                      ? 'આ બાળકના બધા સ્ટાર્સ અને લેસન પ્રોગ્રેસ ડિલીટ થઈ જશે.'
                      : language === 'hi'
                      ? 'इस बच्चे के सभी सितारे और पाठ प्रगति डिलीट हो जाएंगे।'
                      : 'All stars and completed lessons will be permanently reset.';

                  const executeReset = async () => {
                    await resetProgress();
                    soundEffects.playWrongSound();
                    const successMsg =
                      language === 'gu'
                        ? 'પ્રગતિ સફળતાપૂર્વક રીસેટ થઈ ગઈ છે!'
                        : language === 'hi'
                        ? 'प्रगति सफलतापूर्वक रीसेट हो गई!'
                        : 'Progress successfully reset!';

                    notify({ emblem: '✨', tone: 'mint', title: successMsg });
                  };

                  confirm({
                    title: confirmTitle,
                    message: confirmMsg,
                    emblem: '🗑️',
                    destructive: true,
                    confirmText: language === 'gu' ? 'હા, રીસેટ કરો' : language === 'hi' ? 'हां, रीसेट करें' : 'Yes, Reset',
                    cancelText: language === 'gu' ? 'રદ કરો' : language === 'hi' ? 'रद्द करें' : 'Cancel',
                    onConfirm: executeReset,
                  });
                }}
              >
                <Text style={styles.resetBtnText}>
                  {language === 'gu' ? 'પ્રોગ્રેસ રીસેટ કરો' : language === 'hi' ? 'प्रगति रीसेट करें' : 'Reset Progress'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}

      {/* MODAL: GUEST MODE LIMITATION */}
      <Modal visible={isGuestLimitModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, shadows.card]}>
            <View style={styles.guestModalHeader}>
              <View style={styles.guestModalIcon}>
                <Art.HeartArt size={47} />
              </View>
              <Text style={styles.guestModalTitle}>
                {language === 'gu'
                  ? 'વાલી ખાતું જરૂરી છે'
                  : language === 'hi'
                  ? 'अभिभावक खाता आवश्यक'
                  : 'Parent Account Required'}
              </Text>
              <Text style={styles.guestModalDesc}>
                {language === 'gu'
                  ? 'મહેમાન મોડમાં ફક્ત ૧ બાળકની પ્રોફાઇલ સપોર્ટેડ છે. એક કરતાં વધુ બાળકોના અલગ પ્રોફાઇલ બનાવવા, અલગ પ્રગતિ ટ્રેક કરવા અને ક્લાઉડ પર સુરક્ષિત કરવા માટે મફત વાલી ખાતું બનાવો!'
                  : language === 'hi'
                  ? 'अतिथि मोड में केवल १ बच्चे का प्रोफाइल समर्थित है। एक से अधिक बच्चों के प्रोफाइल बनाने, अलग प्रगति ट्रैक करने और क्लाउड पर सुरक्षित करने के लिए मुफ्त अभिभावक खाता बनाएं!'
                  : 'Guest Mode supports 1 child profile on this local device. Create a free parent account to manage multiple children, track separate progress, and sync across devices!'}
              </Text>
            </View>

            <View style={styles.guestModalActions}>
              <TouchableOpacity
                style={styles.guestModalPrimaryBtn}
                onPress={() => {
                  soundEffects.playBubblePop();
                  setIsGuestLimitModalOpen(false);
                  router.push('/register');
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.guestModalPrimaryBtnText}>
                  {language === 'gu' ? 'મફત ખાતું બનાવો' : language === 'hi' ? 'मुफ्त खाता बनाएं' : 'Create Free Parent Account'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.guestModalSecondaryBtn}
                onPress={() => {
                  soundEffects.playBubblePop();
                  setIsGuestLimitModalOpen(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.guestModalSecondaryBtnText}>
                  {language === 'gu' ? 'પછી કરીશું' : language === 'hi' ? 'बाद में' : 'Maybe Later'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 1: ADD NEW CHILD PROFILE */}
      <KidModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        emblem="👶"
        tone="coral"
        title={language === 'gu' ? 'નવું બાળ પ્રોફાઇલ' : language === 'hi' ? 'नया बाल प्रोफाइल' : 'New Child Profile'}
        maxWidth={460}
      >
        <View style={styles.funForm}>
          <Text style={styles.funLabel}>
            {language === 'gu' ? 'બાળકનું નામ' : language === 'hi' ? 'बच्चे का नाम' : 'Child nickname'}
          </Text>
          <TextInput
            style={styles.funInput}
            placeholder={language === 'gu' ? 'દા.ત. આરવ, દિયા, વિવાન' : language === 'hi' ? 'जैसे: आरव, दीया, विवान' : 'e.g. Aarav, Diya, Vivaan'}
            placeholderTextColor={kidPalette.inkFaint}
            value={newNickname}
            onChangeText={setNewNickname}
            maxLength={30}
            accessibilityLabel="Child nickname"
          />

          <Text style={styles.funLabel}>
            {language === 'gu' ? 'ઉંમર અને વર્ગ' : language === 'hi' ? 'उम्र और कक्षा' : 'Age & class'}
          </Text>
          <View style={styles.funPillRow}>
            {(['2-4', '4-6', '6-8'] as AgeGroup[]).map((ag, i) => (
              <ClayButton
                key={ag}
                tone={newAgeGroup === ag ? (['sun', 'mint', 'lavender'] as const)[i] : 'white'}
                size="sm"
                onPress={() => setNewAgeGroup(ag)}
                style={styles.funPill}
                title={`${formatNumberDigits(parseInt(ag.split('-')[0], 10), language)}-${formatNumberDigits(parseInt(ag.split('-')[1], 10), language)} ${language === 'gu' ? 'વર્ષ' : language === 'hi' ? 'वर्ष' : 'yrs'}`}
                textStyle={newAgeGroup === ag ? undefined : { color: kidPalette.inkSoft }}
              />
            ))}
          </View>

          <Text style={styles.funLabel}>
            {language === 'gu' ? 'અવતાર પસંદ કરો' : language === 'hi' ? 'अवतार चुनें' : 'Pick an avatar'}
          </Text>
          <HorizontalScrollRow
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.funAvatarRow}
            nestedScrollEnabled={true}
            directionalLockEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
            {AVATAR_OPTIONS.map((av, i) => {
              const active = selectedAvatar === av;
              const tone = kidTones[(['sky', 'sun', 'mint', 'lavender', 'coral'] as const)[i % 5]];
              return (
                <TouchableOpacity
                  key={av}
                  onPress={() => {
                    soundEffects.playBubblePop();
                    setSelectedAvatar(av);
                  }}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={[
                    styles.funAvatar,
                    { backgroundColor: tone.tint, borderColor: active ? tone.fill : tone.tintBorder, borderBottomColor: active ? tone.edge : tone.tintBorder },
                    active && styles.funAvatarActive,
                  ]}
                >
                  {av === 'avatar_3d_boy' ? (
                    <Image source={AVATAR_3D_BOY} style={styles.funAvatarImg} resizeMode="cover" />
                  ) : (
                    <Text style={styles.funAvatarEmoji}>{normalizeAvatarEmoji(av)}</Text>
                  )}
                  {active ? (
                    <View style={[styles.funAvatarCheck, { backgroundColor: tone.fill }]}>
                      <Glyph name="check" size={12} color={tone.onFill} strokeWidth={4} />
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </HorizontalScrollRow>

          <ClayButton
            tone="mint"
            size="lg"
            style={{ width: '100%', marginTop: 6 }}
            onPress={handleCreateProfile}
            disabled={!newNickname.trim() || isProfileBusy}
            title={
              isProfileBusy
                ? language === 'gu'
                  ? 'સાચવી રહ્યા છીએ...'
                  : language === 'hi'
                  ? 'सहेज रहे हैं...'
                  : 'Saving...'
                : `${language === 'gu' ? 'પ્રોફાઇલ સાચવો' : language === 'hi' ? 'प्रोफ़ाइल सहेजें' : 'Save Profile'}`
            }
          />
        </View>
      </KidModal>

      {/* MODAL 2: STUDENT PROGRESS REPORT CARD */}
      <Modal visible={isReportCardOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.reportCardBox, shadows.card]}>
            {/* Header Ribbon */}
            <View style={styles.reportRibbon}>
              <Text style={styles.reportRibbonText}>
                KidsZone • {language === 'gu' ? 'બાળ પ્રગતિ પત્રક' : language === 'hi' ? 'बाल प्रगति पत्रक' : 'Official Report Card'}
              </Text>
            </View>

            {/* Student Info Card */}
            <View style={styles.reportStudentRow}>
              <View style={styles.reportAvatarBig}>
                {is3DAvatar(activeProfile.avatar) ? (
                  <Image
                    source={AVATAR_3D_BOY}
                    style={styles.reportAvatarImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={{ fontSize: 44 }}>{normalizeAvatarEmoji(activeProfile.avatar)}</Text>
                )}
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={styles.reportStudentName}>{activeProfile.nickname}</Text>
                <Text style={styles.reportStudentGrade}>{getAgeGroupLabel(activeProfile.age_group)}</Text>
                <Text style={styles.reportDateText}>
                  {new Date().toLocaleDateString(language === 'gu' ? 'gu-IN' : language === 'hi' ? 'hi-IN' : 'en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </Text>
              </View>
            </View>

            {/* Score Grid inside Report */}
            <View style={styles.reportScoreGrid}>
              <View style={styles.reportScoreCol}>
                <Text style={styles.reportScoreNum}>{formatNumberDigits(progress.stars, language)}</Text>
                <Text style={styles.reportScoreLabel}>{language === 'gu' ? 'કુલ સ્ટાર્સ' : language === 'hi' ? 'कुल सितारे' : 'Total Stars'}</Text>
              </View>
              <View style={styles.reportScoreCol}>
                <Text style={styles.reportScoreNum}>{formatNumberDigits(progress.completedLessons.length, language)}</Text>
                <Text style={styles.reportScoreLabel}>{language === 'gu' ? 'શીખેલા પાઠ' : language === 'hi' ? 'पाठ पूर्ण' : 'Lessons'}</Text>
              </View>
              <View style={styles.reportScoreCol}>
                <Text style={styles.reportScoreNum}>{formatNumberDigits(progress.earnedBadges.length, language)}</Text>
                <Text style={styles.reportScoreLabel}>{language === 'gu' ? 'મેળવેલ બેજ' : language === 'hi' ? 'मेडल' : 'Badges'}</Text>
              </View>
              <View style={styles.reportScoreCol}>
                <Text style={styles.reportScoreNum}>{formatNumberDigits(overallPercentage, language)}%</Text>
                <Text style={styles.reportScoreLabel}>{language === 'gu' ? 'કોર્સ પરિણામ' : language === 'hi' ? 'पाठ्यक्रम' : 'Result'}</Text>
              </View>
            </View>

            {/* Teacher / Parent Stamp */}
            <View style={styles.reportStampBox}>
              <Art.MedalArt size={47} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.reportStampTitle}>
                  {overallPercentage >= 60
                    ? (language === 'gu' ? 'ઉત્તમ પ્રદર્શન' : language === 'hi' ? 'उत्कृष्ट प्रदर्शन' : 'Super Star Learner')
                    : (language === 'gu' ? 'ઉત્સાહી લર્નર' : language === 'hi' ? 'उत्साही शिक्षार्थी' : 'Active Explorer')}
                </Text>
                <Text style={styles.reportStampSub}>
                  {language === 'gu'
                    ? 'બાળકે એકાગ્રતા અને ઉત્સાહ સાથે પાઠ પૂરા કર્યા છે.'
                    : language === 'hi'
                    ? 'बच्चे ने एकाग्रता और लगन से पाठ पूरे किए हैं।'
                    : 'Demonstrated great curiosity and consistent learning.'}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <TouchableOpacity
                style={[styles.reportCloseBtn, { flex: 1, backgroundColor: '#10B981' }]}
                onPress={() => {
                  soundEffects.playBubblePop();
                  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.print) {
                    window.print();
                    return;
                  }
                  Alert.alert(
                    language === 'gu' ? 'રિપોર્ટ તૈયાર છે' : language === 'hi' ? 'रिपोर्ट तैयार है' : 'Report Ready',
                    language === 'gu'
                      ? 'તમે આ પ્રગતિ રિપોર્ટનો સ્ક્રીનશોટ લઈ શકો છો અથવા સાચવી શકો છો.'
                      : language === 'hi'
                      ? 'आप इस प्रगति रिपोर्ट का स्क्रीनशॉट ले सकते हैं।'
                      : 'You can take a screenshot of this progress summary to save or share it.'
                  );
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.reportCloseBtnText}>
                  {language === 'gu' ? 'પ્રિન્ટ / PDF' : language === 'hi' ? 'प्रिंट / PDF' : 'Print / PDF'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.reportCloseBtn, { flex: 1, backgroundColor: '#6366F1' }]}
                onPress={() => {
                  soundEffects.playBubblePop();
                  setIsReportCardOpen(false);
                  router.push('/certificate');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.reportCloseBtnText}>
                  {language === 'gu' ? 'ગોલ્ડ સર્ટિફિકેટ' : language === 'hi' ? 'सर्टिफिकेट' : 'Certificate'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.reportCloseBtn, { marginTop: 10, backgroundColor: '#475569' }]}
              onPress={() => setIsReportCardOpen(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.reportCloseBtnText}>
                {language === 'gu' ? 'બંધ કરો' : language === 'hi' ? 'बंद करें' : 'Close'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Kid-styled confirm / notify dialogs */}
      {dialog}

      {isProfileBusy && (
        <Modal visible transparent animationType="fade">
          <View style={styles.profileBusyOverlay}>
            <View style={styles.profileBusyCard}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.profileBusyText}>
                {language === 'gu'
                  ? 'પ્રોફાઇલ અપડેટ થઈ રહી છે...'
                  : language === 'hi'
                  ? 'प्रोफ़ाइल अपडेट हो रही है...'
                  : 'Updating profile...'}
              </Text>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  mainContainer: {
    width: '100%',
    maxWidth: 960,
  },

  // 1. GATE STYLES
  funForm: {
    width: '100%',
    gap: 10,
  },
  funLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: kidPalette.ink,
    marginTop: 4,
  },
  funInput: {
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: kidTones.sky.tintBorder,
    backgroundColor: kidTones.sky.tint,
    paddingHorizontal: 16,
    fontSize: 17,
    fontWeight: '600',
    color: kidPalette.ink,
    ...webStyle({ outlineStyle: 'none' }),
  },
  funPillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  funPill: {
    flex: 1,
  },
  funAvatarRow: {
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  funAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderBottomWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  funAvatarActive: {
    transform: [{ scale: 1.1 }],
  },
  funAvatarImg: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  funAvatarEmoji: {
    fontSize: 32,
  },
  funAvatarCheck: {
    position: 'absolute',
    right: -4,
    top: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  gateWrapper: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    paddingTop: 50,
    backgroundColor: 'transparent',
  },
  gateCardFun: {
    width: '100%',
    maxWidth: 370,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderBottomWidth: 6,
    borderBottomColor: kidTones.sky.tintBorder,
    padding: 20,
    paddingTop: 48,
    alignItems: 'center',
    gap: 4,
    ...(Platform.OS === 'web'
      ? webStyle({ boxShadow: '0 20px 45px rgba(0, 0, 0, 0.22)' })
      : { shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.22, shadowRadius: 22, elevation: 12 }),
  },
  gateEmblem: {
    position: 'absolute',
    top: -38,
    alignSelf: 'center',
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: kidTones.sky.tint,
    borderWidth: 3.5,
    borderColor: kidTones.sky.fill,
    borderBottomWidth: 7,
    borderBottomColor: kidTones.sky.edge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gatePillBadge: {
    backgroundColor: kidTones.lavender.tint,
    borderWidth: 1,
    borderColor: kidTones.lavender.tintBorder,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 3,
    marginBottom: 4,
  },
  gatePillBadgeText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: kidTones.lavender.text,
  },
  gateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    maxWidth: 430,
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...(webStyle({
      boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
    })),
  },
  gateShieldCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: '#C7D2FE',
  },
  gateShieldEmoji: {
    fontSize: 40,
  },
  gateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  gateSubtitle: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  mathEquationBox: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FDE047',
    marginBottom: spacing.md,
    ...(webStyle({
      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)',
    })),
  },
  mathText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#B45309',
    letterSpacing: 2,
  },
  gateDisplayBox: {
    width: '100%',
    height: 52,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  gateDisplayText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  keypadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    width: '100%',
    marginBottom: spacing.lg,
  },
  keypadBtn: {
    width: '30%',
    height: 50,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...(webStyle({
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
      cursor: 'pointer',
    })),
  },
  keypadBtnText: {
    fontSize: 19,
    fontWeight: '600',
    color: '#1E293B',
  },
  keypadOkBtn: {
    backgroundColor: '#6366F1',
    borderColor: '#4F46E5',
    ...(webStyle({
      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
    })),
  },
  keypadClearBtn: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  keypadActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  gateCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  gateCancelText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#6366F1',
  },

  // 0. AUTH CARD (TOP BAR)
  authCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: spacing.xl,
    borderWidth: 1.5,
    borderColor: '#EDE9FE',
    ...(webStyle({
      boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.07), 0 8px 10px -6px rgba(99, 102, 241, 0.03)',
    })),
  },
  authHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  authIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
    ...(webStyle({
      boxShadow: '0 2px 8px rgba(124, 58, 237, 0.1)',
    })),
  },
  authInfoCol: {
    flex: 1,
  },
  authTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E1B4B',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  authSub: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 17,
  },
  authSyncPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
  },
  authSyncPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#059669',
  },
  authLoggedInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  authWelcomeText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  authLogoutBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    ...(webStyle({
      cursor: 'pointer',
    })),
  },
  authLogoutBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#DC2626',
  },
  authActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  authPrimaryBtn: {
    flex: 1,
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...(webStyle({
      boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
      cursor: 'pointer',
    })),
  },
  authPrimaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13.5,
  },
  authSecondaryBtn: {
    flex: 1,
    backgroundColor: '#F5F3FF',
    borderWidth: 1.5,
    borderColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...(webStyle({
      cursor: 'pointer',
    })),
  },
  authSecondaryBtnText: {
    color: '#4F46E5',
    fontWeight: '600',
    fontSize: 13.5,
  },

  // 2. HERO CHILD OVERVIEW CARD (Modernized Kids Aesthetic)
  heroCard: {
    backgroundColor: '#8062F5',
    borderRadius: 28,
    padding: 22,
    marginBottom: spacing.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    position: 'relative',
    overflow: 'hidden',
    ...(webStyle({
      boxShadow: '0 18px 36px -8px rgba(128, 98, 245, 0.35), 0 8px 16px -4px rgba(128, 98, 245, 0.2)',
    })),
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 44,
  },
  heroAvatarEmojiWrap: {
    width: '100%',
    height: '100%',
    borderRadius: 44,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  reportAvatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  hdPill: {
    alignSelf: 'flex-start',
    marginTop: 6,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1.5,
    ...(webStyle({
      cursor: 'pointer',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    })),
  },
  hdPillInactive: {
    backgroundColor: '#FEF08A',
    borderColor: '#FACC15',
  },
  hdPillActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
    borderColor: 'rgba(255, 255, 255, 0.45)',
  },
  hdPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  hdPillTextInactive: {
    color: '#713F12',
  },
  hdPillTextActive: {
    color: '#FFFFFF',
  },
  heroAvatarWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginRight: spacing.md,
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
    ...(webStyle({
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
    })),
  },
  heroAvatarEmoji: {
    fontSize: 46,
  },
  heroAvatarCrown: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FEF08A',
    borderRadius: 14,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderWidth: 1.5,
    borderColor: '#FACC15',
    zIndex: 10,
    ...(webStyle({
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
    })),
  },
  heroInfoWrap: {
    flex: 1,
  },
  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  heroNickname: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  activePill: {
    backgroundColor: 'rgba(52, 211, 153, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#34D399',
  },
  activePillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  heroAgeSub: {
    fontSize: 11.5,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  heroBadgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  streakBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 11,
    paddingVertical: 4.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  streakBadgeText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '600',
  },
  levelBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 11,
    paddingVertical: 4.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  levelBadgeText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '600',
  },
  heroProgressBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 22,
    padding: 16,
    marginTop: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  heroProgressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroProgressTitle: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  heroProgressPercent: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FDE047',
    letterSpacing: -0.2,
  },
  heroProgressTrack: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  heroProgressBar: {
    height: '100%',
    backgroundColor: '#FACC15',
    borderRadius: 5,
  },
  heroEncourageText: {
    fontSize: 12,
    color: '#EDE9FE',
    marginTop: 8,
    fontWeight: '600',
    lineHeight: 17,
  },
  heroActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  heroActionBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 13,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...(webStyle({
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
      cursor: 'pointer',
    })),
  },
  heroActionBtnText: {
    color: '#8062F5',
    fontWeight: '700',
    fontSize: 13.5,
  },
  heroActionBtnSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
  },
  heroActionBtnSecondaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13.5,
  },

  // 3. SECTIONS COMMON
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 22,
    marginBottom: spacing.xl,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...(webStyle({
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.02)',
    })),
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    flexWrap: 'wrap',
    gap: 10,
  },
  sectionHeading: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  sectionSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 18,
  },
  addProfileBtn: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    ...(webStyle({
      cursor: 'pointer',
    })),
  },
  addProfileBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#4F46E5',
  },

  // PROFILES ROW
  profilesRow: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 6,
  },
  profileDeleteBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...(webStyle({
      cursor: 'pointer',
    })),
  },
  profileDeleteText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 13,
  },
  profileItem: {
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    minWidth: 108,
    ...(webStyle({
      cursor: 'pointer',
    })),
  },
  activeProfileItem: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
    ...(webStyle({
      boxShadow: '0 4px 14px rgba(99, 102, 241, 0.15)',
    })),
  },
  profileAvatarBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  profileAvatarText: {
    fontSize: 30,
  },
  profileCheckBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    backgroundColor: '#6366F1',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
    maxWidth: 90,
  },
  activeProfileText: {
    color: '#4F46E5',
  },
  profileAgeGroup: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '700',
  },

  // STATS GRID (4 GORGEOUS CARDS)
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: spacing.xl,
  },
  statBox: {
    flex: 1,
    minWidth: 200,
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    ...(webStyle({
      boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.04)',
    })),
  },
  statIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    ...(webStyle({
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
    })),
  },
  statEmoji: {
    fontSize: 28,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#334155',
    marginTop: 3,
  },
  statSubText: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },

  // SUBJECT MASTERY
  pillarHeaderBox: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
  },
  pillarHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4338CA',
    letterSpacing: 0.1,
  },
  subjectsGrid: {
    gap: 12,
  },
  masterySectionCard: {
    backgroundColor: '#FAF9FF',
    borderColor: '#ECE7FF',
    borderRadius: 28,
  },
  pillarHeaderPill: {
    borderRadius: 18,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  premiumSubjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#F1EDFF',
    marginBottom: 4,
    ...(webStyle({
      boxShadow: '0 8px 24px rgba(128, 98, 245, 0.08), 0 2px 6px rgba(0, 0, 0, 0.03)',
      cursor: 'pointer',
    })),
  },
  embossedBadgeBox: {
    width: 62,
    height: 62,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EAE6F8',
    ...(webStyle({
      boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.8), 0 2px 4px rgba(0, 0, 0, 0.03)',
    })),
  },
  cardContentCol: {
    flex: 1,
    marginHorizontal: 14,
    justifyContent: 'center',
  },
  cardItemTitle: {
    fontSize: 16.5,
    fontWeight: '600',
    color: '#1E1B4B',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  cardItemSubtitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  cardProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardProgressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EBE8F7',
    overflow: 'hidden',
  },
  cardProgressFill: {
    height: 6,
    borderRadius: 3,
  },
  cardProgressFraction: {
    marginLeft: 10,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  circularActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#8062F5',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 14px rgba(128, 98, 245, 0.4)',
      cursor: 'pointer',
    } : {
      elevation: 4,
      shadowColor: '#8062F5',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.35,
      shadowRadius: 6,
    }),
  },
  circularActionButtonMastered: {
    backgroundColor: '#10B981',
    ...(webStyle({
      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
    })),
  },
  subjectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...(webStyle({
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
      cursor: 'pointer',
    })),
  },
  subjectTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  subjectIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  subjectIconEmoji: {
    fontSize: 24,
  },
  subjectTitleBox: {
    flex: 1,
  },
  subjectTitleText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  subjectScoreText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  statusBadgePill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...(webStyle({
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
      cursor: 'pointer',
    })),
  },
  badgeMastered: {
    backgroundColor: '#DCFCE7',
    borderColor: '#4ADE80',
  },
  badgeMasteredText: {
    color: '#15803D',
    fontSize: 11.5,
    fontWeight: '700',
  },
  badgeLearning: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  badgeLearningText: {
    color: '#B45309',
    fontSize: 11.5,
    fontWeight: '700',
  },
  badgePending: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  badgePendingText: {
    color: '#4338CA',
    fontSize: 11.5,
    fontWeight: '700',
  },
  statusBadgeText: {
    fontSize: 11.5,
  },
  progressTrack: {
    height: 9,
    backgroundColor: '#F1F5F9',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressThumb: {
    height: '100%',
    borderRadius: 5,
  },

  // GAMES PERFORMANCE
  gameTable: {
    gap: 12,
  },
  gameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    flexWrap: 'wrap',
    gap: 10,
  },
  gameNameWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gameIconEmoji: {
    fontSize: 22,
  },
  gameName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  gameScoresWrap: {
    flexDirection: 'row',
    gap: 10,
  },
  gameScorePill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  gameScoreText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#B45309',
  },
  noGameBox: {
    alignItems: 'center',
    padding: 28,
    backgroundColor: '#F8FAFC',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  noGameEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  noGameText: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    maxWidth: 440,
    fontWeight: '500',
  },
  playGamesBtn: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4F46E5',
    ...(webStyle({
      boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
      cursor: 'pointer',
    })),
  },
  playGamesBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13.5,
  },

  // SCREEN TIME SETTINGS
  healthShieldBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  healthShieldText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#166534',
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: spacing.lg,
  },
  presetBtn: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...(webStyle({
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
      cursor: 'pointer',
    })),
  },
  presetBtnActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4338CA',
    ...(webStyle({
      boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
    })),
  },
  presetBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#475569',
  },
  presetBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  eyeCareBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 14,
    ...(webStyle({
      cursor: 'pointer',
    })),
  },
  eyeCareLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  eyeCareIcon: {
    fontSize: 32,
  },
  eyeCareTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  eyeCareDesc: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 17,
  },
  toggleSwitch: {
    width: 52,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#CBD5E1',
    padding: 3,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: '#10B981',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    ...(webStyle({
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    })),
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },

  // WORKSHEETS BANNER
  worksheetsBanner: {
    backgroundColor: '#047857',
    borderRadius: 26,
    padding: 22,
    marginBottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
    borderWidth: 1.5,
    borderColor: '#059669',
    ...(webStyle({
      boxShadow: '0 12px 28px -6px rgba(4, 120, 87, 0.35)',
      cursor: 'pointer',
    })),
  },
  worksheetsBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 260,
    gap: 16,
  },
  worksheetIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  worksheetsBannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  worksheetsBannerSub: {
    fontSize: 13,
    color: '#D1FAE5',
    marginTop: 4,
    lineHeight: 18,
  },
  worksheetsBannerArrow: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    ...(webStyle({
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    })),
  },
  worksheetsBannerArrowText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },

  // PARENTING TIPS
  tipsList: {
    gap: 14,
  },
  tipCard: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  tipIcon: {
    fontSize: 30,
  },
  tipCardTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  tipCardBody: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 18,
  },

  // DANGER ZONE
  dangerZoneBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF1F2',
    borderWidth: 1.5,
    borderColor: '#FECDD3',
    borderRadius: 22,
    padding: 20,
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: spacing.xxl,
  },
  dangerZoneTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#991B1B',
  },
  dangerZoneSub: {
    fontSize: 12.5,
    color: '#B91C1C',
    marginTop: 2,
  },
  resetBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 14,
    ...(webStyle({
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
      cursor: 'pointer',
    })),
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },

  // MODALS
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 24,
    width: '100%',
    maxWidth: 440,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...(webStyle({
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
    })),
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalCloseBtn: {
    padding: 6,
  },
  inputLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 12,
  },
  textInput: {
    height: 50,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    fontSize: 14.5,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  ageButtonGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  ageBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    ...(webStyle({
      cursor: 'pointer',
    })),
  },
  ageBtnActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
    ...(webStyle({
      boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)',
    })),
  },
  ageBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  ageBtnTextActive: {
    color: '#4F46E5',
    fontWeight: '700',
  },
  avatarsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  avatarBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    ...(webStyle({
      cursor: 'pointer',
    })),
  },
  avatarBtnActive: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
    ...(webStyle({
      boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)',
    })),
  },
  avatarEmoji: {
    fontSize: 26,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: spacing.xl,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...(webStyle({
      cursor: 'pointer',
    })),
  },
  modalCancelText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#475569',
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#6366F1',
    ...(webStyle({
      boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
      cursor: 'pointer',
    })),
  },
  modalSaveText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // REPORT CARD MODAL
  reportCardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 26,
    width: '100%',
    maxWidth: 480,
    borderWidth: 2,
    borderColor: '#FDE047',
    ...(webStyle({
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    })),
  },
  reportRibbon: {
    backgroundColor: '#4338CA',
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  reportRibbonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  reportStudentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  reportAvatarBig: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FDE047',
  },
  reportStudentName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  reportStudentGrade: {
    fontSize: 13,
    color: '#6366F1',
    fontWeight: '600',
    marginTop: 2,
  },
  reportDateText: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '600',
  },
  reportScoreGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 14,
    marginBottom: spacing.lg,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  reportScoreCol: {
    flex: 1,
    alignItems: 'center',
  },
  reportScoreNum: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  reportScoreLabel: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '600',
  },
  reportStampBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9C3',
    padding: 14,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FDE047',
    marginBottom: spacing.lg,
  },
  reportStampEmoji: {
    fontSize: 36,
  },
  reportStampTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#854D0E',
  },
  reportStampSub: {
    fontSize: 11.5,
    color: '#A16207',
    marginTop: 3,
    lineHeight: 16,
    fontWeight: '600',
  },
  reportCloseBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: 'center',
    ...(webStyle({
      cursor: 'pointer',
    })),
  },
  reportCloseBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13.5,
  },
  heroAgeSubTouch: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginTop: 6,
    maxWidth: '100%',
    ...(webStyle({
      cursor: 'pointer',
    })),
  },
  guestLimitationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderRadius: 20,
    padding: 16,
    marginBottom: spacing.lg,
  },
  guestLimitIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  guestModePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  guestModePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  guestLimitTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#78350F',
    marginBottom: 2,
  },
  guestLimitDesc: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#92400E',
    lineHeight: 16,
  },
  guestLimitBtn: {
    backgroundColor: '#8062F5',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...(webStyle({
      cursor: 'pointer',
    })),
  },
  guestLimitBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  guestModalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  guestModalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#BFDBFE',
  },
  guestModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1B4B',
    textAlign: 'center',
    marginBottom: 6,
  },
  guestModalDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 8,
  },
  guestModalActions: {
    gap: 10,
    marginTop: 8,
  },
  guestModalPrimaryBtn: {
    backgroundColor: '#8062F5',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...(webStyle({
      cursor: 'pointer',
    })),
  },
  guestModalPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  guestModalSecondaryBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...(webStyle({
      cursor: 'pointer',
    })),
  },
  guestModalSecondaryBtnText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
  },
  profileBusyOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  profileBusyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 22,
    paddingHorizontal: 28,
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: '#DBEAFE',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  profileBusyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E3A8A',
    textAlign: 'center',
  },
});
