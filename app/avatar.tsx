import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/theme/colors';
import { spacing, radii, shadows } from '../src/theme/spacing';
import { Header } from '../src/components/Header';
import { kidRadii, kidPalette, kidTones, clayShadow } from '../src/theme/kidTheme';
import { KidModal } from '../src/components/fun';
import { ClayButton } from '../src/components/clay';
import { useApp } from '../src/context/AppContext';
import { soundEffects } from '../src/services/soundEffects';
import { audioService } from '../src/services/audioService';
import { formatNumberDigits } from '../src/utils/languageData';
import { formatChildName } from '../src/utils/nameTransliterator';
import { BottomNav } from '../src/components/BottomNav';
import { AppGlobalBackground } from '../src/components/common/AppGlobalBackground';
import { AgeGroup } from '../src/types';
import { KidsDatePickerModal } from '../src/components/common/KidsDatePickerModal';
import { AVATAR_3D_BOY, AVATAR_3D_GIRL, MAGIC_UI_ART } from '../src/utils/imageHelper';
import { is3DAvatar } from '../src/utils/avatarHelper';
import { GoldCoinIcon, CoinLabel } from '../src/components/common/GoldCoinIcon';
import * as Art from '../src/components/art3d/Art3D';
import { Glyph } from '../src/components/fun/KidIcons';

interface AvatarOption {
  id: string;
  type: 'character' | 'hat' | 'accessory';
  nameGu: string;
  nameHi: string;
  nameEn: string;
  emoji: string;
  cost: number;
}

const CHARACTERS: AvatarOption[] = [
  { id: 'char-boy-3d', type: 'character', nameGu: 'સુપર બોય (૩D)', nameHi: 'सुपर बॉय (3D)', nameEn: 'Super Boy (3D)', emoji: 'avatar_3d_boy', cost: 0 },
  { id: 'char-girl', type: 'character', nameGu: 'વન્ડર ગર્લ', nameHi: 'वंडर गर्ल', nameEn: 'Wonder Girl', emoji: '👧', cost: 0 },
  { id: 'char-lion', type: 'character', nameGu: 'સિંહ (શેરુ)', nameHi: 'शेर (शेरू)', nameEn: 'Sheru the Lion', emoji: '🦁', cost: 0 },
  { id: 'char-bunny', type: 'character', nameGu: 'સસલું (બન્ની)', nameHi: 'खरगोश (बन्नी)', nameEn: 'Bunny the Rabbit', emoji: '🐰', cost: 0 },
  { id: 'char-puppy', type: 'character', nameGu: 'ગલૂડિયું (ટોમી)', nameHi: 'पिल्ला (टॉमी)', nameEn: 'Tommy the Puppy', emoji: '🐶', cost: 15 },
  { id: 'char-tiger', type: 'character', nameGu: 'વાઘ (ટાઇગર)', nameHi: 'बाघ (टाइगर)', nameEn: 'Tiger Champion', emoji: '🐯', cost: 25 },
  { id: 'char-monkey', type: 'character', nameGu: 'વાંદરો (ચીંટુ)', nameHi: 'बंदर (चींटू)', nameEn: 'Chintu the Monkey', emoji: '🐵', cost: 20 },
  { id: 'char-elephant', type: 'character', nameGu: 'હાથી (ગજ્જુ)', nameHi: 'हाथी (गज्जू)', nameEn: 'Gajju the Elephant', emoji: '🐘', cost: 30 },
  { id: 'char-bear', type: 'character', nameGu: 'રીંછ (ભાલુ)', nameHi: 'भालू (गोलू)', nameEn: 'Bear Pal', emoji: '🐻', cost: 35 },
  { id: 'char-peacock', type: 'character', nameGu: 'મોર (મયૂર)', nameHi: 'मोर (मयूर)', nameEn: 'Mayur the Peacock', emoji: '🦚', cost: 40 },
];

const HATS: AvatarOption[] = [
  { id: 'hat-none', type: 'hat', nameGu: 'કાંઈ નહીં', nameHi: 'कुछ नहीं', nameEn: 'No Hat', emoji: '❌', cost: 0 },
  { id: 'hat-crown', type: 'hat', nameGu: 'સોનાનો તાજ', nameHi: 'सोने का मुकुट', nameEn: 'Golden Crown', emoji: '👑', cost: 0 },
  { id: 'hat-party', type: 'hat', nameGu: 'પાર્ટી કેપ', nameHi: 'पार्टी कैप', nameEn: 'Party Cone', emoji: '🥳', cost: 10 },
  { id: 'hat-cap', type: 'hat', nameGu: 'સ્કૂલ કેપ', nameHi: 'स्कूल कैप', nameEn: 'Graduation Cap', emoji: '🎓', cost: 20 },
  { id: 'hat-cowboy', type: 'hat', nameGu: 'કાઉબોય હેટ', nameHi: 'काउबॉय हैट', nameEn: 'Cowboy Hat', emoji: '🤠', cost: 30 },
  { id: 'hat-bow', type: 'hat', nameGu: 'ક્યૂટ બો', nameHi: 'प्यारा बो', nameEn: 'Cute Pink Bow', emoji: '🎀', cost: 15 },
];

const ACCESSORIES: AvatarOption[] = [
  { id: 'acc-none', type: 'accessory', nameGu: 'કાંઈ નહીં', nameHi: 'कुछ नहीं', nameEn: 'No Item', emoji: '❌', cost: 0 },
  { id: 'acc-bag', type: 'accessory', nameGu: 'સ્કૂલ બેગ', nameHi: 'स्कूल बैग', nameEn: 'School Backpack', emoji: '🎒', cost: 0 },
  { id: 'acc-glasses', type: 'accessory', nameGu: 'કૂલ ચશ્મા', nameHi: 'कूल चश्मा', nameEn: 'Cool Sunglasses', emoji: '🕶️', cost: 25 },
  { id: 'acc-cape', type: 'accessory', nameGu: 'સુપરહીરો કેપ', nameHi: 'सुपरहीरो केप', nameEn: 'Superhero Cape', emoji: '🦸', cost: 40 },
  { id: 'acc-medal', type: 'accessory', nameGu: 'ગોલ્ડ મેડલ', nameHi: 'गोल्ड मेडल', nameEn: 'Champion Medal', emoji: '🏅', cost: 35 },
  { id: 'acc-wand', type: 'accessory', nameGu: 'જાદુઈ લાકડી', nameHi: 'जादुई छड़ी', nameEn: 'Magic Star Wand', emoji: '✨', cost: 30 },
];

const THEME_COLORS = [
  { id: 'blue', color: '#38BDF8', label: 'Sky' },
  { id: 'purple', color: '#A855F7', label: 'Magic' },
  { id: 'green', color: '#22C55E', label: 'Meadow' },
  { id: 'yellow', color: '#EAB308', label: 'Sunny' },
  { id: 'pink', color: '#EC4899', label: 'Candy' },
];

const NAME_SUGGESTIONS = ['Aarav', 'Pari', 'Kabir', 'Ananya', 'Rhea', 'Super Star', 'Little Hero', 'Champion'];

function calculateAgeFromDob(dobStr?: string): number | null {
  if (!dobStr) return null;
  const clean = dobStr.trim();
  const parts = clean.includes('/') ? clean.split('/') : clean.includes('-') ? clean.split('-') : [];
  if (parts.length !== 3) return null;
  let d = 0, m = 0, y = 0;
  if (parts[0].length === 4) {
    y = parseInt(parts[0], 10);
    m = parseInt(parts[1], 10);
    d = parseInt(parts[2], 10);
  } else {
    d = parseInt(parts[0], 10);
    m = parseInt(parts[1], 10);
    y = parseInt(parts[2], 10);
  }
  if (!d || !m || !y || isNaN(d) || isNaN(m) || isNaN(y)) return null;
  const birth = new Date(y, m - 1, d);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 && age < 100 ? age : null;
}

export default function AvatarScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const { progress, updateProgress, spendCoins, speak, language, ageGroup, setAgeGroup } = useApp();

  const firstName = progress.firstName || '';
  const lastName = progress.lastName || '';
  let rawFullName = [firstName, lastName].filter(Boolean).join(' ') || progress.childName || '';
  if (rawFullName.trim().toLowerCase() === 'aa' || rawFullName.trim().toLowerCase() === 'bb') {
    rawFullName = '';
  }
  const fullName = formatChildName(rawFullName, language) || (language === 'gu' ? 'નાનો તારો' : language === 'hi' ? 'छोटा तारा' : 'Little Star');
  const childName = fullName;
  const dob = progress.dob || '';
  const childAge = calculateAgeFromDob(dob);

  const favColor = progress.favoriteColor || '#0284C7';
  const currentAvatar = progress.currentAvatar || { character: '🦁', hat: '👑', accessory: '🎒' };
  const unlockedItems = progress.unlockedAvatarItems || ['char-boy-3d', 'char-girl', 'char-lion', 'char-bunny', 'hat-none', 'hat-crown', 'acc-none', 'acc-bag'];

  const [activeTab, setActiveTab] = useState<'character' | 'hat' | 'accessory'>('character');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [tempFirstName, setTempFirstName] = useState(firstName);
  const [tempLastName, setTempLastName] = useState(lastName);
  const [tempDob, setTempDob] = useState(dob);
  const isPurchasingRef = useRef(false);

  // Silence all audio immediately when this screen loses focus or user navigates to another page
  useFocusEffect(
    useCallback(() => {
      return () => {
        audioService.stop();
        soundEffects.stopAnimalSound();
      };
    }, [])
  );

  const getItemName = (item: AvatarOption) => {
    if (language === 'gu') return item.nameGu;
    if (language === 'hi') return item.nameHi;
    return item.nameEn;
  };

  const handleOpenEditModal = () => {
    soundEffects.playBubblePop();
    setTempFirstName(progress.firstName || '');
    setTempLastName(progress.lastName || '');
    setTempDob(progress.dob || '');
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async () => {
    const fName = tempFirstName.trim();
    const lName = tempLastName.trim();
    const full = [fName, lName].filter(Boolean).join(' ') || fName || progress.childName || (language === 'gu' ? 'લિટલ ચેમ્પિયન' : language === 'hi' ? 'छोटा चैंपियन' : 'Little Champion');
    const cleanDob = tempDob.trim();

    soundEffects.playTadaaa();
    await updateProgress({
      firstName: fName,
      lastName: lName,
      childName: full,
      dob: cleanDob,
    });
    setIsEditModalOpen(false);

    if (language === 'gu') {
      speak(`અરે વાહ ${fName || full}! તમારી પ્રોફાઇલ સેવ થઈ ગઈ!`, 'gu');
    } else if (language === 'hi') {
      speak(`शाबाश ${fName || full}! आपकी प्रोफ़ाइल सेव हो गई!`, 'hi');
    } else {
      speak(`Awesome ${fName || full}! Your profile is updated!`, 'en');
    }
  };

  const handleSelectColor = async (colorHex: string) => {
    soundEffects.playBubblePop();
    await updateProgress({ favoriteColor: colorHex });
  };

  const equipItem = async (item: AvatarOption) => {
    soundEffects.playBubblePop();
    let updatedAvatar = { ...currentAvatar };

    if (item.type === 'character') {
      updatedAvatar.character = item.emoji;
    } else if (item.type === 'hat') {
      updatedAvatar.hat = item.id === 'hat-none' ? '' : item.emoji;
    } else if (item.type === 'accessory') {
      updatedAvatar.accessory = item.id === 'acc-none' ? '' : item.emoji;
    }

    await updateProgress({ currentAvatar: updatedAvatar });

    const spokenName = getItemName(item);
    if (language === 'gu') {
      speak(`${spokenName} પસંદ કર્યું!`, 'gu');
    } else if (language === 'hi') {
      speak(`${spokenName} चुना गया!`, 'hi');
    } else {
      speak(`${spokenName} equipped!`, 'en');
    }
  };

  const buyItem = async (item: AvatarOption) => {
    if (unlockedItems.includes(item.id) || isPurchasingRef.current) return;
    if ((progress.coins || 0) < item.cost) {
      if (language === 'gu') {
        speak('સિક્કા ખૂટે છે! નવી રમતો રમીને સિક્કા કમાઓ!', 'gu');
      } else if (language === 'hi') {
        speak('सिक्के कम हैं! खेल खेलकर सिक्के कमाएं!', 'hi');
      } else {
        speak('Not enough coins! Play fun games to earn more coins!', 'en');
      }
      return;
    }

    isPurchasingRef.current = true;
    try {
      const ok = await spendCoins(item.cost);
      if (ok) {
        soundEffects.playTadaaa();
        const newUnlocked = [...unlockedItems, item.id];
        await updateProgress({ unlockedAvatarItems: newUnlocked });
        equipItem(item);

        const spokenName = getItemName(item);
        if (language === 'gu') {
          speak(`અરે વાહ! ${spokenName} ખરીદી લીધું!`, 'gu');
        } else if (language === 'hi') {
          speak(`अरे वाह! ${spokenName} खरीद लिया!`, 'hi');
        } else {
          speak(`Awesome! You unlocked ${spokenName}!`, 'en');
        }
      }
    } finally {
      isPurchasingRef.current = false;
    }
  };

  const getActiveList = () => {
    switch (activeTab) {
      case 'character':
        return CHARACTERS;
      case 'hat':
        return HATS;
      case 'accessory':
        return ACCESSORIES;
    }
  };

  const standardBadgeLabel =
    ageGroup === '2-4'
      ? (language === 'gu' ? '૨-૪ વર્ષ (નર્સરી)' : language === 'hi' ? '२-४ वर्ष (नर्सरी)' : '2-4 Yrs Nursery')
      : ageGroup === '4-6'
        ? (language === 'gu' ? '૪-૬ વર્ષ (વર્ગ ૧-૨)' : language === 'hi' ? '४-६ वर्ष (कक्षा १-२)' : '4-6 Yrs Class 1-2')
        : (language === 'gu' ? '૬-૮ વર્ષ (વર્ગ ૩-૫)' : language === 'hi' ? '६-८ वर्ष (कक्षा ३-५)' : '6-8 Yrs Class 3-5');

  const greetingSpeech =
    language === 'gu'
      ? `નમસ્તે ${childName}! આજે શું નવું શીખીશું?`
      : language === 'hi'
        ? `नमस्ते ${childName}! आज क्या नया खेलेंगे?`
        : `Hi ${childName}! You look super awesome today!`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppGlobalBackground id="avatarBgGrad" />
      <Header
        title={language === 'gu' ? 'અવતાર સ્ટુડિયો' : language === 'hi' ? 'अवतार स्टूडियो' : 'Avatar Studio'}
        showBack={true}
        backHref="/home"
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* 1. EDITABLE KID IDENTITY CARD WITH 3D BORDER */}
        <View style={[styles.profileCard, { borderColor: favColor, borderBottomColor: favColor }, shadows.card]}>
          <View style={styles.profileCardHeader}>
            <View style={styles.profileBadgePill}>
              <Text style={styles.profileBadgePillText}>{standardBadgeLabel}</Text>
            </View>

            <TouchableOpacity
              style={[styles.editProfileBtn, shadows.soft]}
              onPress={handleOpenEditModal}
              activeOpacity={0.85}
            >
              <Text style={styles.editProfileBtnText}>
                {language === 'gu' ? 'પ્રોફાઇલ એડિટ કરો' : language === 'hi' ? 'प्रोफ़ाइल एडिट करें' : 'Edit Profile'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.childNameTitle} numberOfLines={1}>{fullName}</Text>
          <Text style={styles.childNameSub}>
            {language === 'gu' ? 'સુપર સ્ટાર શીખનાર' : language === 'hi' ? 'सुपर स्टार विद्यार्थी' : 'Super Star Learning Explorer'}
          </Text>

          {/* Date of Birth (DOB) & Age Badge - Tapping opens visual Date Picker directly */}
          <TouchableOpacity
            style={[styles.dobPillRow, shadows.soft]}
            onPress={() => {
              soundEffects.playBubblePop();
              setIsDatePickerOpen(true);
            }}
            activeOpacity={0.85}
          >
            <Art.GiftArt size={23} />
            <View style={styles.dobPillTextCol}>
              {dob ? (
                <Text style={styles.dobPillTitle}>
                  {language === 'gu' ? 'જન્મ તારીખ: ' : language === 'hi' ? 'जन्म तिथि: ' : 'Birthday: '}
                  <Text style={styles.dobPillHighlight}>{dob}</Text>
                  {childAge !== null ? (
                    language === 'gu'
                      ? ` • ${formatNumberDigits(childAge, language)} વર્ષ`
                      : language === 'hi'
                        ? ` • ${formatNumberDigits(childAge, language)} वर्ष`
                        : ` • ${childAge} Yrs Old`
                  ) : ''}
                </Text>
              ) : (
                <Text style={styles.dobPillPlaceholder}>
                  {language === 'gu' ? 'જન્મ તારીખ પસંદ કરો' : language === 'hi' ? 'जन्म तिथि चुनें' : 'Select Date of Birth'}
                </Text>
              )}
            </View>
            <Art.CalendarArt size={18} />
          </TouchableOpacity>

          {/* Favorite Theme Color Dots */}
          <View style={styles.colorPickerRow}>
            <Text style={styles.colorPickerLabel}>
              {language === 'gu' ? 'મનગમતો રંગ:' : language === 'hi' ? 'पसंदीदा रंग:' : 'Favorite Theme:'}
            </Text>
            <View style={styles.colorDotsContainer}>
              {THEME_COLORS.map((c) => {
                const isSelected = favColor === c.color;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.colorDot,
                      { backgroundColor: c.color },
                      isSelected && styles.colorDotSelected,
                    ]}
                    onPress={() => handleSelectColor(c.color)}
                    activeOpacity={0.8}
                  >
                    {isSelected && <Glyph name="check" size={14} color={'#FFFFFF'} strokeWidth={3} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* 2. 3D CARTOON AVATAR HERO STAGE */}
        <View style={[styles.avatarStage, shadows.card]}>
          {/* Top Bar: Centered Studio Badge */}
          <View style={styles.stageHeaderRow}>
            <View style={styles.stageHeaderPill}>
              <Glyph name="sparkle" size={13} color="#7C3AED" strokeWidth={2.8} />
              <Text style={styles.stageHeaderPillText}>
                {language === 'gu' ? 'સાથીદાર સ્ટુડિયો' : language === 'hi' ? 'साथीदार स्टूडियो' : 'Buddy Studio'}
              </Text>
            </View>
          </View>

          {/* Interactive Speech Bubble with down-pointing tail */}
          <TouchableOpacity
            style={[styles.speechBubble, shadows.soft]}
            onPress={() => speak(greetingSpeech)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={greetingSpeech}
          >
            <View style={styles.speechBubbleContent}>
              <Text style={styles.speechBubbleText}>{greetingSpeech}</Text>
              <View style={styles.speechBubbleSoundBadge}>
                <Glyph name="volume" size={13} color="#0284C7" strokeWidth={2.8} />
              </View>
            </View>
            <View style={styles.speechBubbleTail} />
          </TouchableOpacity>

          {/* 3D Character Podium with Glowing Halo */}
          <TouchableOpacity
            style={styles.avatarFigure}
            onPress={() => {
              soundEffects.playTadaaa();
              speak(greetingSpeech);
            }}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel={language === 'gu' ? 'સાથીદાર' : language === 'hi' ? 'साथीदार' : 'Learning Companion'}
          >
            {/* Luminous Sunshine Halo Ring */}
            <View style={styles.pedestalHalo}>
              {/* Floating Sparkle Accents */}
              <Text style={styles.haloSparkleTL}>✨</Text>
              <Text style={styles.haloSparkleTR}>⭐</Text>
              <Text style={styles.haloSparkleBL}>🌟</Text>

              {/* 3D Golden Podium Ring */}
              <View style={styles.avatarCirclePedestal}>
                {/* Sky Backdrop Inside Pedestal */}
                <View style={styles.pedestalSkyBackdrop}>
                  {currentAvatar.character === 'avatar_3d_boy' || is3DAvatar(currentAvatar.character) ? (
                    <Image
                      source={currentAvatar.character === '👧' ? AVATAR_3D_GIRL : AVATAR_3D_BOY}
                      style={styles.char3DImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.charEmoji}>{currentAvatar.character}</Text>
                  )}
                </View>

                {/* 3D Royal Golden Crown or Hat */}
                {currentAvatar.hat && currentAvatar.hat !== '❌' ? (
                  <View style={styles.hatContainer} pointerEvents="none">
                    {currentAvatar.hat === '👑' ? (
                      <Image source={MAGIC_UI_ART.crown} style={styles.crown3DArt} resizeMode="contain" />
                    ) : (
                      <Text style={styles.hatEmoji}>{currentAvatar.hat}</Text>
                    )}
                  </View>
                ) : null}

                {/* 3D Accessory Cameo Badge */}
                {currentAvatar.accessory && currentAvatar.accessory !== '❌' ? (
                  <View style={styles.accContainer} pointerEvents="none">
                    {currentAvatar.accessory === '🏅' ? (
                      <Image source={require('../assets/images/rewards/medal.webp')} style={styles.acc3DThumb} resizeMode="contain" />
                    ) : currentAvatar.accessory === '✨' ? (
                      <Image source={MAGIC_UI_ART.wand} style={styles.acc3DThumb} resizeMode="contain" />
                    ) : (
                      <Text style={styles.accEmoji}>{currentAvatar.accessory}</Text>
                    )}
                  </View>
                ) : null}
              </View>
            </View>
          </TouchableOpacity>

          <Text style={styles.stageTitle}>
            {language === 'gu' ? 'તમારો ક્યૂટ સાથીદાર' : language === 'hi' ? 'आपका प्यारा साथीदार' : 'Your Cute Learning Companion'}
          </Text>

          <View style={styles.stageHintPill}>
            <Glyph name="volume" size={12} color="#0284C7" strokeWidth={2.6} />
            <Text style={styles.stageHint}>
              {language === 'gu' ? 'અવાજ સાંભળવા સાથી પર ટચ કરો!' : language === 'hi' ? 'आवाज़ सुनने के लिए साथी पर टैप करें!' : 'Tap buddy to hear friendly greeting!'}
            </Text>
          </View>
        </View>

        {/* 3. 4 BIG 3D METRIC ACHIEVEMENTS BLOCKS */}
        <View style={styles.statsGrid}>
          <View style={[styles.statBox, styles.statBoxStars]}>
            <View style={styles.statIconWrap}>
              <Art.StarArt size={30} />
            </View>
            <Text style={[styles.statNumber, { color: '#B45309' }]}>
              {formatNumberDigits(progress.stars || 0, language)}
            </Text>
            <Text style={styles.statLabel}>
              {language === 'gu' ? 'કુલ તારા' : language === 'hi' ? 'कुल सितारे' : 'Stars'}
            </Text>
          </View>

          <View style={[styles.statBox, styles.statBoxCoins]}>
            <View style={styles.statIconWrap}>
              <GoldCoinIcon size={30} />
            </View>
            <Text style={[styles.statNumber, { color: '#B45309' }]}>
              {formatNumberDigits(progress.coins || 0, language)}
            </Text>
            <Text style={styles.statLabel}>
              {language === 'gu' ? 'સોનાના સિક્કા' : language === 'hi' ? 'सोने के सिक्के' : 'Coins'}
            </Text>
          </View>

          <View style={[styles.statBox, styles.statBoxLevel]}>
            <View style={styles.statIconWrap}>
              <Art.TreasureMapArt size={30} />
            </View>
            <Text style={[styles.statNumber, { color: '#047857' }]}>
              {formatNumberDigits(progress.adventureLevel || 1, language)}
            </Text>
            <Text style={styles.statLabel}>
              {language === 'gu' ? 'લેવલ પાર' : language === 'hi' ? 'स्तर पार' : 'Level'}
            </Text>
          </View>

          <View style={[styles.statBox, styles.statBoxLessons]}>
            <View style={styles.statIconWrap}>
              <Art.BookArt size={30} />
            </View>
            <Text style={[styles.statNumber, { color: '#9D174D' }]}>
              {formatNumberDigits(progress.completedLessons?.length || 0, language)}
            </Text>
            <Text style={styles.statLabel}>
              {language === 'gu' ? 'પાઠ પૂરા' : language === 'hi' ? 'पाठ पूर्ण' : 'Lessons'}
            </Text>
          </View>
        </View>

        {/* 4. DRESS-UP CLOSET TABS */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>
            {language === 'gu' ? 'અવતાર કપડાં & એસેસરીઝ' : language === 'hi' ? 'अवतार पोशाक और सामान' : 'Avatar Closet & Shop'}
          </Text>
        </View>

        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'character' && styles.tabBtnActive]}
            onPress={() => {
              setActiveTab('character');
              soundEffects.playBubblePop();
            }}
          >
            <Text style={[styles.tabBtnText, activeTab === 'character' && styles.tabBtnTextActive]}>
              {language === 'gu' ? 'પાત્ર' : language === 'hi' ? 'पात्र' : 'Characters'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'hat' && styles.tabBtnActive]}
            onPress={() => {
              setActiveTab('hat');
              soundEffects.playBubblePop();
            }}
          >
            <Text style={[styles.tabBtnText, activeTab === 'hat' && styles.tabBtnTextActive]}>
              {language === 'gu' ? 'ટોપીઓ' : language === 'hi' ? 'टोपियां' : 'Hats'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'accessory' && styles.tabBtnActive]}
            onPress={() => {
              setActiveTab('accessory');
              soundEffects.playBubblePop();
            }}
          >
            <Text style={[styles.tabBtnText, activeTab === 'accessory' && styles.tabBtnTextActive]}>
              {language === 'gu' ? 'સામાન' : language === 'hi' ? 'सामान' : 'Items'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Items Grid */}
        <View style={styles.itemsGrid}>
          {getActiveList().map((item) => {
            const isUnlocked = unlockedItems.includes(item.id) || item.cost === 0;
            const isEquipped =
              (item.type === 'character' && (currentAvatar.character === item.emoji || (item.emoji === 'avatar_3d_boy' && is3DAvatar(currentAvatar.character)))) ||
              (item.type === 'hat' && (item.id === 'hat-none' ? (!currentAvatar.hat || currentAvatar.hat === '❌') : currentAvatar.hat === item.emoji)) ||
              (item.type === 'accessory' && (item.id === 'acc-none' ? (!currentAvatar.accessory || currentAvatar.accessory === '❌') : currentAvatar.accessory === item.emoji));

            return (
              <View
                key={item.id}
                style={[
                  styles.itemCard,
                  isEquipped && styles.itemCardEquipped,
                  shadows.soft,
                ]}
              >
                {item.emoji === 'avatar_3d_boy' ? (
                  <Image source={AVATAR_3D_BOY} style={styles.closet3DThumb} resizeMode="cover" />
                ) : (
                  <Text style={styles.itemEmoji}>{item.emoji}</Text>
                )}
                <Text style={styles.itemName} numberOfLines={1}>{getItemName(item)}</Text>

                {isEquipped ? (
                  <View style={styles.equippedBadge}>
                    <Text style={styles.equippedText}>
                      {language === 'gu' ? 'પહેરેલું છે' : language === 'hi' ? 'पहना हुआ' : 'Equipped'}
                    </Text>
                  </View>
                ) : isUnlocked ? (
                  <TouchableOpacity
                    style={styles.equipBtn}
                    onPress={() => equipItem(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.equipBtnText}>
                      {language === 'gu' ? 'પહેરો' : language === 'hi' ? 'पहनें' : 'Wear'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.buyBtn}
                    onPress={() => buyItem(item)}
                    activeOpacity={0.8}
                  >
                    <CoinLabel align="center" size={16} textStyle={styles.buyBtnText}>
                      {formatNumberDigits(item.cost, language)} {language === 'gu' ? 'ખરીદો' : language === 'hi' ? 'खरीदें' : 'Get'}
                    </CoinLabel>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {/* 5. QUICK REWARD ACTIONS */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={[styles.actionCardBtn, { backgroundColor: '#FEF9C3', borderColor: '#FACC15', borderBottomColor: '#CA8A04' }]}
            onPress={() => {
              soundEffects.playLevelUp();
              router.push('/certificate');
            }}
            activeOpacity={0.85}
          >
            <Art.ScrollArt size={36} />
            <View style={styles.actionCardTextCol}>
              <Text style={styles.actionCardTitle}>
                {language === 'gu' ? 'ગોલ્ડ એવોર્ડ સર્ટિફિકેટ' : language === 'hi' ? 'स्वर्ण प्रमाण पत्र' : 'Gold Award Certificate'}
              </Text>
              <Text style={styles.actionCardSub}>
                {language === 'gu' ? 'બાળકના નામનું સર્ટિફિકેટ પ્રિન્ટ કરો' : language === 'hi' ? 'बच्चे के नाम से सर्टिफिकेट प्रिंट करें' : 'Printable gold completion certificate'}
              </Text>
            </View>
            <Text style={styles.actionCardArrow}>❯</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* EDIT PROFILE (NAME & DOB) MODAL */}
      <KidModal
        visible={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        emblem="✏️"
        tone="lavender"
        title={language === 'gu' ? 'પ્રોફાઇલ એડિટ કરો' : language === 'hi' ? 'प्रोफ़ाइल एडिट करें' : 'Edit Profile'}
        subtitle={language === 'gu' ? 'નામ અને જન્મ તારીખ બદલો' : language === 'hi' ? 'नाम और जन्म तिथि बदलें' : 'Update name and date of birth'}
        maxWidth={460}
      >
        <View style={{ width: '100%' }}>
          {/* Field 1: First Name */}
          <View style={styles.modalFieldGroup}>
            <Text style={styles.modalInputLabel}>
              {language === 'gu' ? '૧. પહેલું નામ:' : language === 'hi' ? '१. पहला नाम:' : '1. First Name:'}
            </Text>
            <TextInput
              style={styles.nameTextInput}
              value={tempFirstName}
              onChangeText={setTempFirstName}
              placeholder={language === 'gu' ? 'દા.ત. આરવ / Aarav' : language === 'hi' ? 'उदा. आरव / Aarav' : 'e.g. Aarav'}
              placeholderTextColor="#94A3B8"
              maxLength={24}
              autoFocus={true}
            />
          </View>

          {/* Field 2: Last Name */}
          <View style={styles.modalFieldGroup}>
            <Text style={styles.modalInputLabel}>
              {language === 'gu' ? '૨. અટક / ઉપનામ:' : language === 'hi' ? '२. उपनाम:' : '2. Last Name:'}
            </Text>
            <TextInput
              style={styles.nameTextInput}
              value={tempLastName}
              onChangeText={setTempLastName}
              placeholder={language === 'gu' ? 'દા.ત. પટેલ / Patel' : language === 'hi' ? 'उदा. पटेल / Patel' : 'e.g. Patel'}
              placeholderTextColor="#94A3B8"
              maxLength={24}
            />
          </View>

          {/* Field 3: Date of Birth (DOB) via Interactive Date Picker */}
          <View style={styles.modalFieldGroup}>
            <Text style={styles.modalInputLabel}>
              {language === 'gu'
                ? '૩. જન્મ તારીખ:'
                : language === 'hi'
                  ? '३. जन्म तिथि:'
                  : '3. Date of Birth:'}
            </Text>
            <TouchableOpacity
              style={styles.dobPickerButton}
              onPress={() => {
                soundEffects.playBubblePop();
                setIsDatePickerOpen(true);
              }}
              activeOpacity={0.85}
            >
              <View style={{ marginRight: 10 }}><Art.CalendarArt size={29} /></View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.dobPickerButtonText, !tempDob && styles.dobPickerButtonPlaceholder]}>
                  {tempDob
                    ? tempDob
                    : language === 'gu'
                      ? 'તારીખ પસંદ કરવા ટચ કરો'
                      : language === 'hi'
                        ? 'तारीख चुनने के लिए टैप करें'
                        : 'Tap to select birthday (Date Picker)'}
                </Text>
                {calculateAgeFromDob(tempDob) !== null && (
                  <Text style={styles.dobPickerAgeBadge}>
                    {formatNumberDigits(calculateAgeFromDob(tempDob)!, language)}{' '}
                    {language === 'gu' ? 'વર્ષ' : language === 'hi' ? 'वर्ष' : 'Years Old'}
                  </Text>
                )}
              </View>
              <View style={styles.dobPickerActionPill}>
                <Text style={styles.dobPickerActionText}>
                  {language === 'gu' ? 'પસંદ કરો' : language === 'hi' ? 'चुनें' : 'Pick'}
                </Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.dobHelperText}>
              {language === 'gu'
                ? 'કેલેન્ડરમાંથી સરળતાથી તારીખ અને ઉંમર પસંદ કરો'
                : language === 'hi'
                  ? 'कैलेंडर से आसानी से तिथि और आयु चुनें'
                  : 'Easily select day, month, and year with the visual Date Picker'}
            </Text>
          </View>

          {/* Quick Name Chips */}
          <Text style={styles.chipsTitle}>
            {language === 'gu' ? 'ઝડપી નામો:' : language === 'hi' ? 'त्वरित नाम सुझाव:' : 'Quick name ideas:'}
          </Text>
          <View style={styles.chipsRow}>
            {NAME_SUGGESTIONS.map((suggestion) => (
              <TouchableOpacity
                key={suggestion}
                style={styles.nameChip}
                onPress={() => {
                  soundEffects.playBubblePop();
                  setTempFirstName(suggestion);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.nameChipText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Modal Buttons */}
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
            style={[styles.funBtn, { flexGrow: 1.4 }]}
            title={`${language === 'gu' ? 'પ્રોફાઇલ સેવ કરો' : language === 'hi' ? 'प्रोफ़ाइल सहेजें' : 'Save Profile'}`}
            textStyle={{ color: kidTones.mint.onFill }}
            onPress={handleSaveProfile}
          />
        </View>
      </KidModal>

      {/* Birthday picker: fills the Edit Profile draft, or saves directly when opened from the 🎂 badge */}
      <KidsDatePickerModal
        visible={isDatePickerOpen}
        initialDate={isEditModalOpen ? tempDob : progress.dob || ''}
        language={language}
        onClose={() => setIsDatePickerOpen(false)}
        onConfirm={async (formattedDate) => {
          setIsDatePickerOpen(false);
          if (isEditModalOpen) {
            setTempDob(formattedDate);
          } else {
            soundEffects.playTadaaa();
            await updateProgress({ dob: formattedDate });
          }
        }}
      />

      {/* Persistent Bottom Nav */}
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
    padding: spacing.md,
    paddingBottom: 110,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },

  /* 1. EDITABLE PROFILE CARD */
  profileCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: spacing.md,
    borderBottomWidth: 5,
    // design system: clay
    borderRadius: kidRadii.card,
    borderWidth: 1.5,
    ...clayShadow(2),
    borderColor: kidPalette.border,
  },
  profileCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileBadgePill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
  },
  profileBadgePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E40AF',
  },
  editProfileBtn: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: '#FDE047',
  },
  editProfileBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#92400E',
  },
  childNameTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 2,
  },
  childNameSub: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  dobPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    gap: 8,
  },
  dobPillIcon: {
    fontSize: 18,
  },
  dobPillTextCol: {
    flex: 1,
  },
  dobPillTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#166534',
  },
  dobPillHighlight: {
    fontWeight: '900',
    color: '#15803D',
  },
  dobPillPlaceholder: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#16A34A',
  },
  dobEditHint: {
    fontSize: 14,
  },

  colorPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1.5,
    borderTopColor: '#F1F5F9',
  },
  colorPickerLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  colorDotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...shadows.soft,
  },
  colorDotSelected: {
    borderColor: '#1E293B',
    borderWidth: 2.5,
    transform: [{ scale: 1.15 }],
  },
  colorCheckMark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  /* 2. AVATAR STAGE */
  avatarStage: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 18,
    paddingBottom: 20,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 2.5,
    borderBottomWidth: 6,
    borderColor: '#FDE68A',
    borderBottomColor: '#F59E0B',
    position: 'relative',
    overflow: 'hidden',
  },
  stageHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  stageHeaderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
  },
  stageHeaderPillText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#6D28D9',
    letterSpacing: 0.3,
  },
  speechBubble: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#38BDF8',
    borderBottomWidth: 4,
    borderBottomColor: '#0284C7',
    marginBottom: 16,
    maxWidth: '96%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speechBubbleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  speechBubbleText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0369A1',
    textAlign: 'center',
    lineHeight: 19,
  },
  speechBubbleSoundBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speechBubbleTail: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    width: 14,
    height: 14,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#0284C7',
    transform: [{ rotate: '45deg' }],
  },
  avatarFigure: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    marginBottom: 8,
  },
  pedestalHalo: {
    width: 144,
    height: 144,
    borderRadius: 72,
    backgroundColor: 'rgba(254, 240, 138, 0.4)',
    borderWidth: 2,
    borderColor: 'rgba(253, 224, 71, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  haloSparkleTL: {
    position: 'absolute',
    top: 4,
    left: 8,
    fontSize: 16,
    opacity: 0.8,
  },
  haloSparkleTR: {
    position: 'absolute',
    top: 6,
    right: 8,
    fontSize: 15,
    opacity: 0.85,
  },
  haloSparkleBL: {
    position: 'absolute',
    bottom: 8,
    left: 6,
    fontSize: 14,
    opacity: 0.75,
  },
  avatarCirclePedestal: {
    width: 126,
    height: 126,
    borderRadius: 63,
    backgroundColor: '#FFFFFF',
    borderWidth: 3.5,
    borderColor: '#F59E0B',
    borderBottomWidth: 6,
    borderBottomColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  pedestalSkyBackdrop: {
    width: 114,
    height: 114,
    borderRadius: 57,
    backgroundColor: '#E0F2FE',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  charEmoji: {
    fontSize: 66,
    textAlign: 'center',
  },
  char3DImage: {
    width: 114,
    height: 114,
    borderRadius: 57,
  },
  closet3DThumb: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginBottom: 4,
  },
  hatContainer: {
    position: 'absolute',
    top: -24,
    alignSelf: 'center',
    zIndex: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crown3DArt: {
    width: 50,
    height: 40,
    shadowColor: '#B45309',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  hatEmoji: {
    fontSize: 34,
    textAlign: 'center',
  },
  accContainer: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    backgroundColor: '#FFFFFF',
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#F59E0B',
    borderBottomWidth: 4,
    borderBottomColor: '#D97706',
    zIndex: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  acc3DThumb: {
    width: 28,
    height: 28,
  },
  accEmoji: {
    fontSize: 22,
    textAlign: 'center',
  },
  stageTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1E293B',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  stageHintPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginTop: 6,
  },
  stageHint: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0369A1',
  },

  /* 3. METRIC STATS BLOCKS */
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.md,
  },
  statBox: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderBottomWidth: 5,
  },
  statBoxStars: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
    borderBottomColor: '#D97706',
  },
  statBoxCoins: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FBBF24',
    borderBottomColor: '#B45309',
  },
  statBoxLevel: {
    backgroundColor: '#ECFDF5',
    borderColor: '#6EE7B7',
    borderBottomColor: '#059669',
  },
  statBoxLessons: {
    backgroundColor: '#FDF2F8',
    borderColor: '#F472B6',
    borderBottomColor: '#BE185D',
  },
  statIconWrap: {
    marginBottom: 3,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 17,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 1,
  },

  /* 4. DRESS-UP TABS & GRID */
  sectionHeaderRow: {
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1E293B',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.md,
  },
  tabBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    // design system: clay
    minHeight: 52,
    borderRadius: kidRadii.pill,
    justifyContent: 'center',
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(15, 23, 42, 0.22)',
  },
  tabBtnActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
    borderBottomColor: '#312E81',
  },
  tabBtnText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  itemCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 5,
    borderColor: '#E2E8F0',
    borderBottomColor: '#CBD5E1',
    // design system: clay
    borderRadius: kidRadii.card,
    borderWidth: 1.5,
    ...clayShadow(2),
  },
  itemCardEquipped: {
    borderColor: '#22C55E',
    borderBottomColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  itemEmoji: {
    fontSize: 40,
    marginVertical: 4,
  },
  itemName: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  equippedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#86EFAC',
    width: '100%',
    alignItems: 'center',
  },
  equippedText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#166534',
  },
  equipBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 6,
    width: '100%',
    alignItems: 'center',
    // design system: clay
    minHeight: 52,
    borderRadius: kidRadii.pill,
    justifyContent: 'center',
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(15, 23, 42, 0.22)',
  },
  equipBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
  buyBtn: {
    backgroundColor: '#EAB308',
    paddingVertical: 6,
    width: '100%',
    alignItems: 'center',
    // design system: clay
    minHeight: 52,
    borderRadius: kidRadii.pill,
    justifyContent: 'center',
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(15, 23, 42, 0.22)',
  },
  buyBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 11,
  },

  /* 5. QUICK ACTIONS */
  quickActionsContainer: {
    marginBottom: spacing.md,
  },
  actionCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 5,
    gap: 12,
    // design system: clay
    borderRadius: kidRadii.card,
    borderWidth: 1.5,
    ...clayShadow(2),
    borderColor: kidPalette.border,
  },
  actionCardIcon: {
    fontSize: 28,
  },
  actionCardTextCol: {
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1E293B',
  },
  actionCardSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  actionCardArrow: {
    fontSize: 14,
    fontWeight: '900',
    color: '#A16207',
  },

  /* MODAL STYLES */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    maxWidth: 450,
    width: '100%',
    padding: spacing.lg,
    borderColor: '#E2E8F0',
    // design system: clay
    borderRadius: kidRadii.card,
    borderWidth: 1.5,
    ...clayShadow(2),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  modalIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalIconText: {
    fontSize: 20,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E293B',
  },
  modalHeaderTitleCol: {
    flex: 1,
  },
  modalSubheading: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  modalScroll: {
    maxHeight: 380,
  },
  modalFieldGroup: {
    marginBottom: 12,
  },
  modalInputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  // Soft pastel input (radius 18, 2px border)
  nameTextInput: {
    backgroundColor: kidTones.lavender.tint,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: kidTones.lavender.tintBorder,
    paddingHorizontal: 16,
    minHeight: 54,
    fontSize: 16.5,
    fontWeight: '800',
    color: '#1E293B',
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  funBtnRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
    marginTop: 6,
  },
  funBtn: {
    flexGrow: 1,
    flexBasis: 130,
  },
  dobHelperText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 4,
  },
  chipsTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 18,
  },
  nameChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  nameChipText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    // design system: clay
    minHeight: 52,
    borderRadius: kidRadii.pill,
    justifyContent: 'center',
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(15, 23, 42, 0.22)',
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
  },
  modalSaveBtn: {
    flex: 1.5,
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    alignItems: 'center',
    // design system: clay
    minHeight: 52,
    borderRadius: kidRadii.pill,
    justifyContent: 'center',
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(15, 23, 42, 0.22)',
  },
  modalSaveBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  dobPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#C7D2FE',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dobPickerButtonIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  dobPickerButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  dobPickerButtonPlaceholder: {
    color: '#6366F1',
    fontWeight: '700',
  },
  dobPickerAgeBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8B5CF6',
    marginTop: 2,
  },
  dobPickerActionPill: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  dobPickerActionText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
