import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Image,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useSafeRouter } from '../src/utils/navigationHelper';
import { spacing, radii, shadows } from '../src/theme/spacing';
import { Header } from '../src/components/Header';
import { useApp } from '../src/context/AppContext';
import { soundEffects } from '../src/services/soundEffects';
import { audioService } from '../src/services/audioService';
import { formatNumberDigits } from '../src/utils/languageData';
import { BottomNav } from '../src/components/BottomNav';
import { FANTASY_ADVENTURE_HEADER } from '../src/utils/imageHelper';
import { ADVENTURE_LEVELS, AdventureLevel } from '../src/data/adventureLevels';
import { apiService } from '../src/services/apiService';
import { AgeGroup, AppLanguage, type UserProgress } from '../src/types';
import { is3DAvatar, normalizeAvatarEmoji, AVATAR_3D_BOY } from '../src/utils/avatarHelper';
import { formatChildName } from '../src/utils/nameTransliterator';
import { AppGlobalBackground } from '../src/components/common/AppGlobalBackground';
import { GoldCoinIcon, CoinLabel } from '../src/components/common/GoldCoinIcon';
import * as Art from '../src/components/art3d/Art3D';
import { Glyph } from '../src/components/fun/KidIcons';
import { Remote3DImage } from '../src/components/common/Remote3DImage';
import { characterAsset, resolveOfflineMediaSource } from '../src/utils/remoteAssets';

/** Practice reward for replaying a level that is already cleared. */
const REPLAY_REWARD = { coins: 5, stars: 1 };

const WORLD_GATES_CONFIG: Record<
  number,
  {
    emoji: string;
    titleGu: string;
    titleHi: string;
    titleEn: string;
    subGu: string;
    subHi: string;
    subEn: string;
    bg: string;
    border: string;
    borderBottom: string;
    isClassGate?: boolean;
    classBadgeGu?: string;
    classBadgeHi?: string;
    classBadgeEn?: string;
    reqClass?: AgeGroup;
  }
> = {
  1: {
    emoji: '🏝️',
    titleGu: 'વિશ્વ ૧: અક્ષર ટાપુ',
    titleHi: 'विश्व १: अक्षर द्वीप',
    titleEn: 'World 1: Alphabet Island',
    subGu: 'મૂળાક્ષરો શીખો અને સાહસ શરૂ કરો! (લેવલ ૧ - ૫)',
    subHi: 'वर्णमाला सीखें और साहसिक सफर शुरू करें! (लेवल १ - ५)',
    subEn: 'Master first letters & start the adventure! (Levels 1 - 5)',
    bg: '#E0F2FE',
    border: '#38BDF8',
    borderBottom: '#0284C7',
  },
  6: {
    emoji: '🍎',
    titleGu: 'વિશ્વ ૨: ફળ અને રંગોનું જંગલ',
    titleHi: 'विश्व २: फल और रंगों का जंगल',
    titleEn: 'World 2: Fruits & Colors Jungle',
    subGu: 'ફળો ગણો, રંગો અને આકારો ઓળખો! (લેવલ ૬ - ૧૦)',
    subHi: 'फल गिनें, रंग और आकृतियां पहचानें! (लेवल ६ - १०)',
    subEn: 'Count fruits, identify colors and shapes! (Levels 6 - 10)',
    bg: '#DCFCE7',
    border: '#34D399',
    borderBottom: '#059669',
  },
  11: {
    emoji: '🔢',
    titleGu: 'વિશ્વ ૩: સંખ્યા નગરી',
    titleHi: 'विश्व ३: संख्या नगरी',
    titleEn: 'World 3: Number Kingdom (1-10)',
    subGu: '૧ થી ૧૦ અંકો અને ગણતરી નો ખજાનો! (લેવલ ૧૧ - ૧૫)',
    subHi: '१ से १० संख्याएं और गिनती का खजाना! (लेवल ११ - १५)',
    subEn: 'Numbers 1 to 10 and playful counting! (Levels 11 - 15)',
    bg: '#FEF3C7',
    border: '#FACC15',
    borderBottom: '#CA8A04',
  },
  16: {
    emoji: '🦁',
    titleGu: 'વિશ્વ ૪: પ્રાણીઓનું રાજ્ય',
    titleHi: 'विश्व ४: जानवरों का राज्य',
    titleEn: 'World 4: Animals Oasis',
    subGu: 'પ્રાણીઓ, પક્ષીઓ અને પ્રી-સ્કૂલ ગ્રેજ્યુએશન! (લેવલ ૧૬ - ૨૦)',
    subHi: 'पशु-पक्षी और प्री-स्कूल ग्रेजुएशन! (लेवल १६ - २०)',
    subEn: 'Animals, birds and Pre-School graduation! (Levels 16 - 20)',
    bg: '#FCE7F3',
    border: '#F472B6',
    borderBottom: '#DB2777',
  },
  21: {
    emoji: '🎓',
    isClassGate: true,
    classBadgeGu: 'વર્ગ ૧ - ૨ પ્રવેશદ્વાર',
    classBadgeHi: 'कक्षा १ - २ प्रवेशद्वार',
    classBadgeEn: 'Class 1 - 2 Gate',
    reqClass: '4-6',
    titleGu: 'વર્ગ ૧-૨ પ્રવેશદ્વાર: વિશ્વ ૫ (શબ્દ ખીણ)',
    titleHi: 'कक्षा १-२ प्रवेशद्वार: विश्व ५ (शब्द घाटी)',
    titleEn: 'Class 1-2 Gate: World 5 (Word Valley)',
    subGu: 'શબ્દ રચના, સ્પેલિંગ અને બારાખડી! (લેવલ ૨૧ - ૨૫)',
    subHi: 'शब्द निर्माण, वर्तनी और बारहखड़ी! (लेवल २१ - २५)',
    subEn: 'Word builder, spelling and phonics! (Levels 21 - 25)',
    bg: '#EFF6FF',
    border: '#3B82F6',
    borderBottom: '#1D4ED8',
  },
  26: {
    emoji: '➕',
    titleGu: 'વિશ્વ ૬: ગણિત પર્વત',
    titleHi: 'विश्व ६: गणित पर्वत',
    titleEn: 'World 6: Math Peak (1-5)',
    subGu: 'સરવાળા, બાદબાકી અને ૧ થી ૫ ના ઘડિયા! (લેવલ ૨૬ - ૩૦)',
    subHi: 'जोड़, घटाव और १ से ५ के पहाड़े! (लेवल २६ - ३०)',
    subEn: 'Addition, subtraction & tables 1 to 5! (Levels 26 - 30)',
    bg: '#FEF9C3',
    border: '#FACC15',
    borderBottom: '#CA8A04',
  },
  31: {
    emoji: '🌿',
    titleGu: 'વિશ્વ ૭: પ્રકૃતિ અને વિજ્ઞાન સરોવર',
    titleHi: 'विश्व ७: प्रकृति और विज्ञान झील',
    titleEn: 'World 7: Science & Nature Lake',
    subGu: 'વિજ્ઞાન, દિશાઓ અને પ્રાથમિક ચેમ્પિયન ટ્રોફી! (લેવલ ૩૧ - ૩૫)',
    subHi: 'विज्ञान, दिशाएं और प्राथमिक चैंपियन ट्रॉफी! (लेवल ३१ - ३५)',
    subEn: 'Science, nature and Primary Champion trophy! (Levels 31 - 35)',
    bg: '#CCFBF1',
    border: '#2DD4BF',
    borderBottom: '#0D9488',
  },
  36: {
    emoji: '🏆',
    isClassGate: true,
    classBadgeGu: 'વર્ગ ૩ - ૫ પ્રવેશદ્વાર',
    classBadgeHi: 'कक्षा ३ - ५ प्रवेशद्वार',
    classBadgeEn: 'Class 3 - 5 Gate',
    reqClass: '6-8',
    titleGu: 'વર્ગ ૩-૫ પ્રવેશદ્વાર: વિશ્વ ૮ (ગુણાકાર કિલ્લો)',
    titleHi: 'कक्षा ३-५ प्रवेशद्वार: विश्व ८ (गुणा किला)',
    titleEn: 'Class 3-5 Gate: World 8 (Math Fortress)',
    subGu: 'ગુણાકાર, ભાગાકાર અને ૬-૧૦ ના ઘડિયા! (લેવલ ૩૬ - ૪૦)',
    subHi: 'गुणा, भाग और ६-१० के पहाड़े! (लेवल ३६ - ४०)',
    subEn: 'Multiplication, division & tables 6-10! (Levels 36 - 40)',
    bg: '#FAF5FF',
    border: '#A855F7',
    borderBottom: '#7E22CE',
  },
  41: {
    emoji: '🌍',
    titleGu: 'વિશ્વ ૯: સામાન્ય જ્ઞાન અને અવકાશ',
    titleHi: 'विश्व ९: सामान्य ज्ञान व अंतरिक्ष',
    titleEn: 'World 9: GK & Solar System',
    subGu: 'સૂર્યમંડળ, ભારત અને રોચક તથ્યો! (લેવલ ૪૧ - ૪૫)',
    subHi: 'सौरमंडल, भारत और रोचक तथ्य! (लेवल ४१ - ४५)',
    subEn: 'Solar system, geography & India facts! (Levels 41 - 45)',
    bg: '#FFE4E6',
    border: '#FB7185',
    borderBottom: '#E11D48',
  },
  46: {
    emoji: '👑',
    titleGu: 'વિશ્વ ૧૦: સુવર્ણ ચેમ્પિયન મહેલ',
    titleHi: 'विश्व १०: स्वर्ण चैंपियन महल',
    titleEn: 'World 10: Grand Champion Palace',
    subGu: 'ગ્રાન્ડ ફિનાલે અને સુવર્ણ શાહી મુગટ! (લેવલ ૪૬ - ૫૦)',
    subHi: 'ग्रैंड फिनाले और स्वर्ण शाही मुकुट! (लेवल ४६ - ५०)',
    subEn: 'Grand Finale & Royal Golden Crown! (Levels 46 - 50)',
    bg: '#FEF08A',
    border: '#EAB308',
    borderBottom: '#A16207',
  },
};

const AMBIENT_SCENERY_PRESETS = [
  { emoji1: '🌳', emoji2: '🌸', bg: 'rgba(34, 197, 94, 0.22)' },
  { emoji1: '🐟', emoji2: '🦆', bg: 'rgba(56, 189, 248, 0.25)' },
  { emoji1: '💎', emoji2: '✨', bg: 'rgba(148, 163, 184, 0.25)' },
  { emoji1: '🌲', emoji2: '🍄', bg: 'rgba(34, 197, 94, 0.22)' },
  { emoji1: '🌻', emoji2: '🌼', bg: 'rgba(250, 204, 21, 0.25)' },
  { emoji1: '🐰', emoji2: '🍀', bg: 'rgba(74, 222, 128, 0.22)' },
  { emoji1: '🌺', emoji2: '🐝', bg: 'rgba(244, 114, 182, 0.25)' },
  { emoji1: '🍄', emoji2: '🌿', bg: 'rgba(239, 68, 68, 0.2)' },
  { emoji1: '🌳', emoji2: '🍎', bg: 'rgba(34, 197, 94, 0.22)' },
  { emoji1: '⭐', emoji2: '🚩', bg: 'rgba(217, 119, 6, 0.22)' },
];

interface LevelNodeItemProps {
  lvl: AdventureLevel;
  index: number;
  currentLevelUnlocked: number;
  ageGroup?: AgeGroup;
  language: AppLanguage;
  isMobile: boolean;
  progress: UserProgress;
  onLevelPress: (lvl: AdventureLevel) => void;
}

const LevelNodeItem: React.FC<LevelNodeItemProps> = React.memo(({
  lvl,
  index,
  currentLevelUnlocked,
  ageGroup,
  language,
  isMobile,
  progress,
  onLevelPress,
}) => {
  const isUnlocked = lvl.level <= currentLevelUnlocked;
  const isCurrent = lvl.level === currentLevelUnlocked;
  const isCompleted = lvl.level < currentLevelUnlocked;

  // Check if level is locked by Class Tier
  const isClassLocked =
    (ageGroup === '2-4' && lvl.level > 20) ||
    (ageGroup === '4-6' && lvl.level > 35);

  // S-Curve sine wave translation for natural winding path
  const prevCurveOffset =
    index === 0 ? 0 : Math.sin(((index - 1) / 2) * Math.PI) * (isMobile ? 54 : 80);
  const curveOffset = Math.sin((index / 2) * Math.PI) * (isMobile ? 54 : 80);

  const gateConfig = WORLD_GATES_CONFIG[lvl.level];
  const openSide = curveOffset >= 0 ? 'left' : 'right';
  const scenery = AMBIENT_SCENERY_PRESETS[index % AMBIENT_SCENERY_PRESETS.length];

  const levelTitle =
    language === 'gu' ? lvl.titleGu : language === 'hi' ? lvl.titleHi : lvl.titleEn;

  return (
    <View
      style={[
        styles.nodeColumnWrapper,
        styles.mapTrackRow,
        isMobile && styles.mapTrackMobile,
        { backgroundColor: index % 2 === 0 ? '#38A149' : '#339643' },
        index === 0 && styles.mapTrackRowFirst,
        index === 49 && styles.mapTrackRowLast,
      ]}
    >
      <View style={styles.terrainHillBand} pointerEvents="none">
        <View style={[styles.terrainFleckRow, { top: 22 }]}>
          <Text style={styles.terrainFleckEmoji}>🌸</Text>
          <Text style={styles.terrainFleckEmoji}>✨</Text>
          <Text style={styles.terrainFleckEmoji}>🌿</Text>
        </View>
      </View>
      {/* 3D MILESTONE WORLD GATEWAY */}
      {gateConfig && (
        <View
          style={[
            styles.worldGateCard,
            {
              borderColor: gateConfig.border,
              borderBottomColor: gateConfig.borderBottom,
            },
            gateConfig.isClassGate && styles.classGateSpecial,
            shadows.card,
          ]}
        >
          {/* Top Golden Ribbon Bar */}
          <View style={styles.worldGateTopBar}>
            <View
              style={[
                styles.worldPillTag,
                {
                  backgroundColor: gateConfig.bg,
                  borderColor: gateConfig.border,
                },
              ]}
            >
              <Text style={[styles.worldPillTagText, { color: gateConfig.borderBottom }]}>
                {language === 'gu'
                  ? `વિશ્વ ${lvl.level <= 5 ? '૧' : lvl.level <= 10 ? '૨' : lvl.level <= 15 ? '૩' : lvl.level <= 20 ? '૪' : lvl.level <= 25 ? '૫' : lvl.level <= 30 ? '૬' : lvl.level <= 35 ? '૭' : lvl.level <= 40 ? '૮' : lvl.level <= 45 ? '૯' : '૧૦'}`
                  : language === 'hi'
                    ? `विश्व ${Math.floor((lvl.level - 1) / 5) + 1}`
                    : `World ${Math.floor((lvl.level - 1) / 5) + 1}`}
              </Text>
            </View>
            <View style={styles.rewardPillTag}>
              <Text style={styles.rewardPillTagText}>
                {language === 'gu'
                  ? 'ખજાનો: +૫૦ સિક્કા'
                  : language === 'hi'
                    ? 'खजाना: +५० सिक्के'
                    : '+50 Coins Reward'}
              </Text>
            </View>
          </View>

          {/* Main Landmark Content Row */}
          <View style={styles.worldGateMainRow}>
            <View
              style={[
                styles.worldGateIcon3DBadge,
                {
                  backgroundColor: gateConfig.bg,
                  borderColor: gateConfig.border,
                  borderBottomColor: gateConfig.borderBottom,
                },
              ]}
            >
              <Text style={styles.worldGateEmojiLarge}>{gateConfig.emoji}</Text>
            </View>

            <View style={styles.worldGateTextCol}>
              {gateConfig.isClassGate && (
                <View style={styles.classGateBadgePill}>
                  <Text style={styles.classGateBadgeText}>
                    {language === 'gu'
                      ? gateConfig.classBadgeGu
                      : language === 'hi'
                        ? gateConfig.classBadgeHi
                        : gateConfig.classBadgeEn}
                  </Text>
                </View>
              )}
              <Text style={styles.worldGateTitle}>
                {language === 'gu'
                  ? gateConfig.titleGu
                  : language === 'hi'
                    ? gateConfig.titleHi
                    : gateConfig.titleEn}
              </Text>
              <Text style={styles.worldGateSub}>
                {language === 'gu'
                  ? gateConfig.subGu
                  : language === 'hi'
                    ? gateConfig.subHi
                    : gateConfig.subEn}
              </Text>
            </View>
          </View>

          {/* Bottom Status / Range Strip */}
          <View style={styles.worldGateBottomStrip}>
            <Text style={styles.worldGateLevelRange}>
              {language === 'gu'
                ? `લેવલ ${formatNumberDigits(lvl.level, language)} - ${formatNumberDigits(lvl.level + 4, language)}`
                : language === 'hi'
                  ? `स्तर ${formatNumberDigits(lvl.level, language)} - ${formatNumberDigits(lvl.level + 4, language)}`
                  : `Levels ${lvl.level} - ${lvl.level + 4}`}
            </Text>
            <Text
              style={[
                styles.worldGateStatusBadge,
                currentLevelUnlocked >= lvl.level + 5
                  ? styles.statusCompleted
                  : currentLevelUnlocked >= lvl.level
                    ? styles.statusActive
                    : styles.statusLocked,
              ]}
            >
              {currentLevelUnlocked >= lvl.level + 5
                ? (language === 'gu' ? 'પૂર્ણ થયેલ' : language === 'hi' ? 'पूर्ण' : 'Completed')
                : currentLevelUnlocked >= lvl.level
                  ? (language === 'gu' ? 'ચાલુ સાહસ' : language === 'hi' ? 'સક્રિય' : 'In Progress')
                  : (language === 'gu' ? 'લૉક' : language === 'hi' ? 'लॉक' : 'Locked')}
            </Text>
          </View>
        </View>
      )}

      {/* Ambient Nature Scenery along outer margin framing the winding trail */}
      {!gateConfig && (
        <View
          style={[
            styles.ambientSceneryWrap,
            openSide === 'left' ? styles.sceneryLeft : styles.sceneryRight,
          ]}
          pointerEvents="none"
        >
          <View style={[styles.sceneryShadowPatch, { backgroundColor: scenery.bg }]} />
          <Text style={styles.sceneryEmojiPrimary}>{scenery.emoji1}</Text>
          <Text style={styles.sceneryEmojiSecondary}>{scenery.emoji2}</Text>
        </View>
      )}

      {/* 3D Cobblestone Stepping Stones path smoothly connecting from previous node */}
      {index > 0 && !gateConfig && (
        <View style={styles.steppingDotsRow}>
          {[0, 1, 2].map((d) => {
            const dotOffset =
              prevCurveOffset + (curveOffset - prevCurveOffset) * ((d + 1) / 4);
            return (
              <View
                key={`step-dot-${lvl.level}-${d}`}
                style={[
                  styles.stepDot,
                  isCompleted && styles.stepDotCompleted,
                  isCurrent && !isClassLocked && styles.stepDotCurrent,
                  { transform: [{ translateX: dotOffset }] },
                ]}
              >
                {isCompleted ? (
                  <View style={[styles.stepDotCheck, { marginTop: -1 }]}><Glyph name="check" size={12} color={'#FFFFFF'} strokeWidth={3} /></View>
                ) : (
                  <View style={styles.stepDotCore} />
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Node with horizontal S-curve transform */}
      <View style={[styles.nodeContentWrap, { transform: [{ translateX: curveOffset }] }]}>
        {/* Current Player Character Pin on Active Level */}
        {isCurrent && !isClassLocked && (
          <View style={styles.playerAvatarBadge}>
            <View style={styles.playerSpeechBubble}>
              <Text style={styles.playerSpeechText}>
                {language === 'gu' ? 'તમે અહીં છો!' : language === 'hi' ? 'आप यहाँ हैं!' : 'YOU ARE HERE!'}
              </Text>
              <View style={styles.playerSpeechTail} />
            </View>
            <View style={[styles.playerAvatarPill, shadows.card]}>
              {is3DAvatar(progress.currentAvatar?.character) ? (
                <Image
                  source={AVATAR_3D_BOY}
                  style={styles.playerAvatar3DImage}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.playerAvatarEmoji}>
                  {normalizeAvatarEmoji(progress.currentAvatar?.character)}
                </Text>
              )}
              {progress.currentAvatar?.hat && progress.currentAvatar.hat !== '❌' ? (
                <Text style={styles.playerAvatarHat}>{progress.currentAvatar.hat}</Text>
              ) : null}
            </View>
            {progress.childName ? (
              <View style={styles.playerNamePill}>
                <Text style={styles.playerNameText} numberOfLines={1}>
                  {formatChildName(progress.childName, language)}
                </Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Special Landmark Banner if landmark level */}
        {lvl.isLandmark && (
          <View style={[styles.landmarkBadge, shadows.soft]}>
            <Text style={styles.landmarkBadgeText}>
              {language === 'gu' ? lvl.landmarkLabelGu : language === 'hi' ? lvl.landmarkLabelHi : lvl.landmarkLabelEn}
            </Text>
          </View>
        )}

        {/* 3D Cartoon Node Button */}
        <TouchableOpacity
          style={[
            styles.nodeButton,
            isCompleted
              ? styles.nodeButtonCompleted
              : isCurrent && !isClassLocked
                ? styles.nodeButtonCurrent
                : isClassLocked
                  ? styles.nodeButtonClassLocked
                  : styles.nodeButtonLocked,
            shadows.card,
          ]}
          onPress={() => onLevelPress(lvl)}
          activeOpacity={0.82}
        >
          {/* Glowing Aura for Current Active Quest */}
          {isCurrent && !isClassLocked && (
            <View style={styles.nodeCurrentGlowRing} pointerEvents="none" />
          )}
          {/* 3 Stars on top of completed level */}
          {isCompleted && (
            <View style={styles.completedStarsRow}>
              <Art.StarArt size={13} />
              <View style={{ marginTop: -3 }}><Art.StarArt size={17} /></View>
              <Art.StarArt size={13} />
            </View>
          )}

          <View style={styles.nodeIcon}>
            {isClassLocked ? (
              lvl.level > 35 ? <Art.TrophyArt size={26} /> : <Art.MedalArt size={26} />
            ) : !isUnlocked ? (
              <Glyph name="lock" size={22} color="#94A3B8" strokeWidth={2.8} />
            ) : isCompleted ? (
              <Glyph name="check" size={22} color="#10B981" strokeWidth={3.8} />
            ) : (
              <Text style={styles.nodeIconText}>{lvl.icon}</Text>
            )}
          </View>

          <Text style={[styles.nodeNum, (!isUnlocked || isClassLocked) && styles.nodeNumLocked, isCompleted && styles.nodeNumCompleted]}>
            {formatNumberDigits(lvl.level, language)}
          </Text>
        </TouchableOpacity>

        {/* Node Subtitle Pill */}
        <View style={[styles.nodeTitlePill, isCurrent && !isClassLocked && styles.nodeTitlePillCurrent]}>
          <Text style={[styles.nodeTitleText, isCurrent && !isClassLocked && styles.nodeTitleTextCurrent]} numberOfLines={1}>
            {isClassLocked
              ? (language === 'gu' ? 'વર્ગ અપગ્રેડ કરો' : language === 'hi' ? 'कक्षा अपग्रेड करें' : 'Upgrade Class')
              : levelTitle}
          </Text>
        </View>
      </View>
    </View>
  );
});

export default function AdventureMapScreen() {
  const router = useSafeRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const { progress, updateProgress, language, speak, stopSpeaking, ageGroup, setAgeGroup, isAuthenticated, isGuest } = useApp();

  const currentLevelUnlocked = progress.adventureLevel || 1;
  const [awardedReward, setAwardedReward] = useState<{ coins: number; stars: number } | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<AdventureLevel | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<AdventureLevel['question']['options']>([]);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizSuccess, setQuizSuccess] = useState<boolean | null>(null);
  // Upgrade Class Celebration Modal (declared before the guest early-return: hooks must run in the same order every render)
  const [upgradeModalInfo, setUpgradeModalInfo] = useState<{
    targetClass: AgeGroup;
    completedLevel: number;
  } | null>(null);
  const nextTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Progressive level rendering: initial batch loads instantly, remaining levels expand after transition
  const initialBatch = Math.min(ADVENTURE_LEVELS.length, Math.max(8, currentLevelUnlocked + 4));
  const [renderedLevelCount, setRenderedLevelCount] = useState<number>(initialBatch);

  useEffect(() => {
    if (renderedLevelCount < ADVENTURE_LEVELS.length) {
      let timer: ReturnType<typeof setTimeout> | null = null;
      const raf = requestAnimationFrame(() => {
        timer = setTimeout(() => {
          setRenderedLevelCount(ADVENTURE_LEVELS.length);
        }, 60);
      });
      return () => {
        cancelAnimationFrame(raf);
        if (timer) clearTimeout(timer);
      };
    }
  }, [renderedLevelCount]);

  const [adventureLevels, setAdventureLevels] = useState<AdventureLevel[]>(ADVENTURE_LEVELS);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      apiService.fetchAdventureLevels().then((fetched) => {
        if (!cancelled && fetched && fetched.length > 0 && fetched.length !== ADVENTURE_LEVELS.length) {
          setAdventureLevels(fetched);
        }
      });
    }, 120);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const randomizeOptions = (options: AdventureLevel['question']['options']) => {
    const list = [...options];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  };

  const stopSpeakingRef = useRef(stopSpeaking);
  stopSpeakingRef.current = stopSpeaking;

  useEffect(() => {
    return () => {
      if (nextTimeoutRef.current) {
        clearTimeout(nextTimeoutRef.current);
        nextTimeoutRef.current = null;
      }
      audioService.stop();
      stopSpeakingRef.current();
      soundEffects.stopAll();
    };
  }, []);

  // Silence all audio immediately when this screen loses focus or user navigates to another page
  useFocusEffect(
    useCallback(() => {
      return () => {
        if (nextTimeoutRef.current) {
          clearTimeout(nextTimeoutRef.current);
          nextTimeoutRef.current = null;
        }
        audioService.stop();
        stopSpeakingRef.current();
        soundEffects.stopAll();
      };
    }, [])
  );

  const levelPressRef = useRef<(lvl: AdventureLevel) => void>(() => {});
  const stableLevelPress = useCallback((lvl: AdventureLevel) => {
    levelPressRef.current(lvl);
  }, []);

  const visibleLevels = React.useMemo(
    () => ADVENTURE_LEVELS.slice(0, renderedLevelCount),
    [renderedLevelCount]
  );

  const renderLevelItem = useCallback(
    ({ item, index }: { item: AdventureLevel; index: number }) => (
      <LevelNodeItem
        lvl={item}
        index={index}
        currentLevelUnlocked={currentLevelUnlocked}
        ageGroup={ageGroup}
        language={language}
        isMobile={isMobile}
        progress={progress}
        onLevelPress={stableLevelPress}
      />
    ),
    [currentLevelUnlocked, ageGroup, language, isMobile, progress, stableLevelPress]
  );

  const handleCloseQuizModal = () => {
    if (nextTimeoutRef.current) {
      clearTimeout(nextTimeoutRef.current);
      nextTimeoutRef.current = null;
    }
    stopSpeaking();
    soundEffects.stopAll();
    setShowQuizModal(false);
    setSelectedLevel(null);
    setShuffledOptions([]);
    setQuizSuccess(null);
  };

  if (!isAuthenticated && !isGuest) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header
          title={language === 'gu' ? 'સાહસિક નકશો' : language === 'hi' ? 'साहसिक मानचित्र' : 'Adventure Map'}
          showBack={true}
          backHref="/home"
        />
        <View style={styles.authLockContainer}>
          <View style={[styles.authLockCard, shadows.card]}>
            <View style={styles.authLockIconWrap}>
              <Remote3DImage
                source={characterAsset('3d_red_fort')}
                style={{ width: 68, height: 68 }}
                fallback={<Text style={{ fontSize: 44 }}>🏰</Text>}
              />
            </View>
            <Text style={styles.authLockTitle}>
              {language === 'gu'
                ? 'સાહસિક ગેમ માટે લૉગ ઇન જરૂરી છે'
                : language === 'hi'
                  ? 'साहसिक खेल के लिए लॉगिन आवश्यक है'
                  : 'Login Required for Adventure'}
            </Text>
            <Text style={styles.authLockDesc}>
              {language === 'gu'
                ? '૫૦ રોમાંચક લેવલ્સ, સ્ટાર્સ અને મેળવેલ ઇનામો ક્લાઉડ પર સુરક્ષિત સાચવવા માટે કૃપા કરીને વાલી ખાતામાં લૉગ ઇન કરો.'
                : language === 'hi'
                  ? '५० रोमांचक स्तर, सितारे और पुरस्कार सुरक्षित रखने के लिए कृपया लॉगिन करें।'
                  : 'Sign in to save your 50 adventure levels and rewards safely on the cloud.'}
            </Text>
            <TouchableOpacity
              style={styles.authLockLoginBtn}
              onPress={() => {
                soundEffects.playBubblePop();
                router.push('/login');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.authLockLoginBtnText}>
                {language === 'gu' ? 'લૉગ ઇન કરો' : language === 'hi' ? 'लॉग इन करें' : 'Sign In / Login'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.authLockRegisterBtn}
              onPress={() => {
                soundEffects.playBubblePop();
                router.push('/register');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.authLockRegisterBtnText}>
                {language === 'gu' ? 'નવું ખાતું બનાવો' : language === 'hi' ? 'नया खाता बनाएं' : 'Create Free Account'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <BottomNav activeTab="games" />
      </SafeAreaView>
    );
  }

  const totalLevels = adventureLevels.length; // 50
  const progressPercent = Math.min(100, Math.round(((currentLevelUnlocked - 1) / totalLevels) * 100));

  const getPromptText = (lvl: AdventureLevel) => {
    if (language === 'gu') return lvl.question.promptGu;
    if (language === 'hi') return lvl.question.promptHi;
    return lvl.question.promptEn;
  };

  const getLevelTitle = (lvl: AdventureLevel) => {
    if (language === 'gu') return lvl.titleGu;
    if (language === 'hi') return lvl.titleHi;
    return lvl.titleEn;
  };

  const getOptionText = (opt: AdventureLevel['question']['options'][0]) => {
    if (language === 'gu') return opt.textGu;
    if (language === 'hi') return opt.textHi;
    return opt.textEn;
  };

  const goToNextLevel = (finishedLevel: number) => {
    if (nextTimeoutRef.current) {
      clearTimeout(nextTimeoutRef.current);
      nextTimeoutRef.current = null;
    }

    // 1. Check if finished level triggers Class Upgrade prompt
    if (finishedLevel === 20 && ageGroup === '2-4') {
      handleCloseQuizModal();
      setUpgradeModalInfo({ targetClass: '4-6', completedLevel: 20 });
      return;
    }
    if (finishedLevel === 35 && ageGroup === '4-6') {
      handleCloseQuizModal();
      setUpgradeModalInfo({ targetClass: '6-8', completedLevel: 35 });
      return;
    }

    // 2. Check if all levels completed
    if (finishedLevel >= adventureLevels.length) {
      handleCloseQuizModal();
      soundEffects.playTadaaa();
      if (language === 'gu') {
        speak('અદ્ભુત! તમે સાહસિક મેપના તમામ ૫૦ લેવલ જીતી લીધા છે!', 'gu');
      } else if (language === 'hi') {
        speak('अद्भुत! आपने साहसिक मानचित्र के सभी ५० स्तर जीत लिए हैं!', 'hi');
      } else {
        speak('Incredible! You have conquered all 50 adventure levels!', 'en');
      }
      return;
    }

    // 3. Automatically advance to the next level
    const nextLvl = adventureLevels.find((l) => l.level === finishedLevel + 1);
    if (nextLvl) {
      setSelectedLevel(nextLvl);
      setShuffledOptions(randomizeOptions(nextLvl.question.options));
      setQuizSuccess(null);
      const prompt = getPromptText(nextLvl);
      setTimeout(() => {
        speak(prompt, language);
      }, 250);
    } else {
      handleCloseQuizModal();
    }
  };

  // Plain function (not useCallback): it is declared after the guest early-return, and hooks there
  // would change the hook order between renders ("Rendered more hooks" crash). Callers use inline
  // arrows, so memoization gave no benefit anyway.
  const handleLevelPress = (lvl: AdventureLevel) => {
    soundEffects.playBubblePop();

    // 1. Check Class Boundary Restrictions:
    // Class 1 (2-4 yrs): Levels 1 to 20
    if (ageGroup === '2-4' && lvl.level > 20) {
      setUpgradeModalInfo({ targetClass: '4-6', completedLevel: 20 });
      if (language === 'gu') {
        speak('આ લેવલ ૨૧ થી ૩૫ વર્ગ ૧-૨ માટે છે! આગળ રમવા માટે વર્ગ ૧-૨ માં અપગ્રેડ કરો!', 'gu');
      } else if (language === 'hi') {
        speak('यह स्तर २१ से ३५ कक्षा १-२ के लिए है! आगे खेलने के लिए कक्षा १-२ में अपग्रेड करें!', 'hi');
      } else {
        speak('Levels 21 to 35 are for Class 1-2! Upgrade your class to unlock!', 'en');
      }
      return;
    }

    // Class 2 (4-6 yrs): Levels 21 to 35
    if (ageGroup === '4-6' && lvl.level > 35) {
      setUpgradeModalInfo({ targetClass: '6-8', completedLevel: 35 });
      if (language === 'gu') {
        speak('આ લેવલ ૩૬ થી ૫૦ વર્ગ ૩-૫ માટે છે! આગળ રમવા માટે વર્ગ ૩-૫ માં અપગ્રેડ કરો!', 'gu');
      } else if (language === 'hi') {
        speak('यह स्तर ३६ से ५० कक्षा ३-५ के लिए है! आगे खेलने के लिए कक्षा ३-५ में अपग्रेड करें!', 'hi');
      } else {
        speak('Levels 36 to 50 are for Class 3-5! Upgrade your class to unlock!', 'en');
      }
      return;
    }

    // 2. Check sequential progression lock:
    if (lvl.level > currentLevelUnlocked) {
      if (language === 'gu') {
        speak('આ લેવલ હજી લોક છે! આગળ વધવા પહેલાંનું લેવલ પૂર્ણ કરો!', 'gu');
      } else if (language === 'hi') {
        speak('यह स्तर अभी लॉक है! आगे बढ़ने के लिए पिछला स्तर पूरा करें!', 'hi');
      } else {
        speak('This level is locked! Complete earlier levels to unlock!', 'en');
      }
      return;
    }

    setSelectedLevel(lvl);
    setShuffledOptions(randomizeOptions(lvl.question.options));
    setQuizSuccess(null);
    setShowQuizModal(true);

    const prompt = getPromptText(lvl);
    speak(prompt, language);
  };

  const handleAnswer = async (isCorrect: boolean) => {
    if (quizSuccess !== null) return;

    if (isCorrect) {
      soundEffects.playTadaaa();
      setQuizSuccess(true);

      const finishedLevel = selectedLevel?.level || 0;
      const nextLevel = Math.max(currentLevelUnlocked, finishedLevel + 1);
      // Completed levels stay replayable for practice, but only the first clear pays the level
      // reward; replaying level 50 used to pay 500 coins every time.
      const isFirstClear = finishedLevel >= currentLevelUnlocked;
      const bonusCoins = !isFirstClear
        ? REPLAY_REWARD.coins
        : selectedLevel?.isLandmark
        ? (selectedLevel.level === 50 ? 500 : 100)
        : 20;
      const bonusStars = isFirstClear ? 3 : REPLAY_REWARD.stars;
      setAwardedReward({ coins: bonusCoins, stars: bonusStars });

      // Gentle 180ms delay allows the sparkling chime to start cleanly without drowning out speech
      setTimeout(() => {
        if (language === 'gu') {
          speak('શાબાશ! સાચો જવાબ!', 'gu');
        } else if (language === 'hi') {
          speak('शाबाश! सही जवाब!', 'hi');
        } else {
          speak('Awesome! Correct answer!', 'en');
        }
      }, 180);

      await updateProgress({
        adventureLevel: nextLevel,
        stars: (progress.stars || 0) + bonusStars,
        coins: (progress.coins || 0) + bonusCoins,
      });

      // Automatically advance to the next level after 3.5 seconds so speech is never cut off!
      if (nextTimeoutRef.current) clearTimeout(nextTimeoutRef.current);
      nextTimeoutRef.current = setTimeout(() => {
        goToNextLevel(finishedLevel);
      }, 3500);
    } else {
      soundEffects.playWrongSound();
      setQuizSuccess(false);

      if (language === 'gu') {
        speak('ફરીથી પ્રયત્ન કરો!', 'gu');
      } else if (language === 'hi') {
        speak('फिर से कोशिश करें!', 'hi');
      } else {
        speak('Try again!', 'en');
      }

      // Re-enable options after full speech completes (3.2 seconds) so voice is never cut off
      setTimeout(() => {
        setQuizSuccess(null);
      }, 3200);
    }
  };

  const handleUpgradeClass = (targetClass: AgeGroup) => {
    soundEffects.playTadaaa();
    setAgeGroup(targetClass);
    setUpgradeModalInfo(null);

    if (language === 'gu') {
      speak(
        targetClass === '4-6'
          ? 'અભિનંદન! તમે વર્ગ ૧-૨ માં અપગ્રેડ થયા છો! લેવલ ૨૧ થી ૩૫ અનલૉક થયા!'
          : 'અભિનંદન! તમે વર્ગ ૩-૫ માં અપગ્રેડ થયા છો! એડવાન્સ લેવલ ૩૬ થી ૫૦ અનલૉક થયા!',
        'gu'
      );
    } else if (language === 'hi') {
      speak(
        targetClass === '4-6'
          ? 'बधाई! आप कक्षा १-२ में अपग्रेड हुए! स्तर २१ से ३५ अनलॉक हुए!'
          : 'बधाई! आप कक्षा ३-५ में अपग्रेड हुए! उन्नत स्तर ३६ से ५० अनलॉक हुए!',
        'hi'
      );
    } else {
      speak(
        targetClass === '4-6'
          ? 'Congratulations! Upgraded to Class 1-2! Levels 21 to 35 unlocked!'
          : 'Congratulations! Upgraded to Class 3-5! Levels 36 to 50 unlocked!',
        'en'
      );
    }
  };

  if (!isAuthenticated && !isGuest) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppGlobalBackground id="adventureLockBgGrad" />
        <Header
          title={language === 'gu' ? 'સાહસિક નકશો' : language === 'hi' ? 'સાહસિક માનચિત્ર' : 'Adventure Map'}
          showBack={true}
          backHref="/home"
        />
        <View style={styles.authLockContainer}>
          <View style={[styles.authLockCard, shadows.card]}>
            <View style={styles.authLockIconWrap}>
              <Text style={{ fontSize: 48 }}>🏰</Text>
            </View>
            <Text style={styles.authLockTitle}>
              {language === 'gu'
                ? 'સાહસિક ગેમ માટે લૉગ ઇન જરૂરી છે'
                : language === 'hi'
                  ? 'साहसिक खेल के लिए लॉगिन आवश्यक है'
                  : 'Login Required for Adventure'}
            </Text>
            <Text style={styles.authLockDesc}>
              {language === 'gu'
                ? '૫૦ રોમાંચક લેવલ્સ, સ્ટાર્સ અને મેળવેલ ઇનામો ક્લાઉડ પર સુરક્ષિત સાચવવા માટે કૃપા કરીને વાલી ખાતામાં લૉગ ઇન કરો.'
                : language === 'hi'
                  ? '५० रोमांचक स्तर, सितारे और पुरस्कार सुरक्षित रखने के लिए कृपया लॉगिन करें।'
                  : 'Sign in to save your 50 adventure levels and rewards safely on the cloud.'}
            </Text>
            <TouchableOpacity
              style={styles.authLockLoginBtn}
              onPress={() => {
                soundEffects.playBubblePop();
                router.push('/login');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.authLockLoginBtnText}>
                {language === 'gu' ? 'લૉગ ઇન કરો' : language === 'hi' ? 'लॉग इन करें' : 'Sign In / Login'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.authLockRegisterBtn}
              onPress={() => {
                soundEffects.playBubblePop();
                router.push('/register');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.authLockRegisterBtnText}>
                {language === 'gu' ? 'નવું ખાતું બનાવો' : language === 'hi' ? 'નયા ખાતા બનાએં' : 'Create Free Account'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <BottomNav activeTab="games" />
      </SafeAreaView>
    );
  }

  const headerTitle =
    language === 'gu'
      ? 'સાહસિક મેપ'
      : language === 'hi'
        ? 'साहसिक नक्शा'
        : 'Adventure Map';

  const activeClassLabel =
    ageGroup === '2-4'
      ? language === 'gu'
        ? 'પ્રી-સ્કૂલ (લેવલ ૧ - ૨૦)'
        : language === 'hi'
          ? 'प्री-स्कूल (स्तर १ - २०)'
          : 'Pre-School (Levels 1 - 20)'
      : ageGroup === '4-6'
        ? language === 'gu'
          ? 'વર્ગ ૧ - ૨ (લેવલ ૨૧ - ૩૫)'
          : language === 'hi'
            ? 'कक्षा १ - २ (स्तर २१ - ३५)'
            : 'Class 1 - 2 (Levels 21 - 35)'
        : language === 'gu'
          ? 'વર્ગ ૩ - ૫ (લેવલ ૩૬ - ૫૦)'
          : language === 'hi'
            ? 'कक्षा ३ - ५ (स्तर ३६ - ५०)'
            : 'Class 3 - 5 (Levels 36 - 50)';

  levelPressRef.current = handleLevelPress;

  const listHeader = (
    <View style={styles.listHeaderWrap}>
        {/* 1. 3D CARTOON HERO BANNER */}
        <View style={[styles.heroPosterCard, shadows.card]}>
          <Image
            source={resolveOfflineMediaSource(FANTASY_ADVENTURE_HEADER)}
            style={styles.heroPosterImage}
            resizeMode="cover"
          />
          <View style={styles.heroPosterOverlay}>
            <View style={styles.heroBadgeRow}>
              <View style={styles.heroBadgePill}>
                <Text style={styles.heroBadgePillText}>
                  {language === 'gu' ? '૫૦ સાહસિક લેવલ' : language === 'hi' ? '५० साहसिक स्तर' : '50 Epic Island Levels'}
                </Text>
              </View>
              <View style={styles.worldPill}>
                <Text style={styles.worldPillText}>
                  {activeClassLabel}
                </Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>
              {language === 'gu' ? 'સાહસિક સફર મેપ' : language === 'hi' ? 'साहसिक सफर नक्शा' : 'Learning Adventure Map'}
            </Text>
            <Text style={styles.heroSub}>
              {language === 'gu'
                ? (ageGroup === '2-4'
                  ? 'પ્રી-સ્કૂલ: ૧ થી ૨૦ લેવલ જીતી વર્ગ ૧-૨ અનલૉક કરો!'
                  : ageGroup === '4-6'
                    ? 'વર્ગ ૧-૨: ૨૧ થી ૩૫ લેવલ જીતી વર્ગ ૩-૫ અનલૉક કરો!'
                    : 'વર્ગ ૩-૫: ૩૬ થી ૫૦ લેવલ જીતી સુવર્ણ મુગટ મેળવો!')
                : language === 'hi'
                  ? (ageGroup === '2-4'
                    ? 'प्री-स्कूल: १ से २० स्तर जीतकर कक्षा १-२ अनलॉक करें!'
                    : ageGroup === '4-6'
                      ? 'कक्षा १-२: २१ से ३५ स्तर जीतकर कक्षा ३-५ अनलॉक करें!'
                      : 'कक्षा ३-५: ३६ से ५० स्तर जीतकर स्वर्ण मुकुट पाएं!')
                  : (ageGroup === '2-4'
                    ? 'Pre-School: Beat levels 1 to 20 to unlock Class 1-2!'
                    : ageGroup === '4-6'
                      ? 'Class 1-2: Beat levels 21 to 35 to unlock Class 3-5!'
                      : 'Class 3-5: Conquer levels 36 to 50 for the Royal Crown!')}
            </Text>

            <View style={styles.heroActionRow}>
              {currentLevelUnlocked <= totalLevels && (
                <TouchableOpacity
                  style={styles.heroPlayNextBtn}
                  onPress={() => {
                    const targetLvl =
                      adventureLevels.find((l) => l.level === currentLevelUnlocked) ||
                      adventureLevels[0];
                    handleLevelPress(targetLvl);
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.heroPlayNextBtnText}>
                    {language === 'gu' ? `લેવલ ${formatNumberDigits(currentLevelUnlocked, language)} રમો` : language === 'hi' ? `लेवल ${formatNumberDigits(currentLevelUnlocked, language)} खेलें` : `Play Level ${currentLevelUnlocked}`}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.heroCertBtn}
                onPress={() => {
                  soundEffects.playBubblePop();
                  router.push('/challenge');
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.heroCertBtnText}>
                  {language === 'gu' ? 'ચેલેન્જ ટેસ્ટ' : language === 'hi' ? 'चुनौती टेस्ट' : 'Challenge Quiz'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 2. 3D CANDY HUD STATUS BAR */}
        <View style={[styles.hudContainer, shadows.card]}>
          <View style={styles.hudTopRow}>
            {/* Level Badge */}
            <View style={[styles.hudCard, { backgroundColor: '#EFF6FF', borderColor: '#3B82F6', borderBottomColor: '#1D4ED8' }]}>
              <Art.FlagArt size={28} />
              <View>
                <Text style={styles.hudLabel}>{language === 'gu' ? 'લેવલ' : language === 'hi' ? 'लेवल' : 'Level'}</Text>
                <Text style={[styles.hudVal, { color: '#1E40AF' }]}>
                  {formatNumberDigits(currentLevelUnlocked, language)} <Text style={styles.hudMaxVal}>/{formatNumberDigits(totalLevels, language)}</Text>
                </Text>
              </View>
            </View>

            {/* Coins Badge */}
            <View style={[styles.hudCard, { backgroundColor: '#FEF9C3', borderColor: '#FACC15', borderBottomColor: '#CA8A04' }]}>
              <GoldCoinIcon size={28} />
              <View>
                <Text style={styles.hudLabel}>{language === 'gu' ? 'સિક્કા' : language === 'hi' ? 'सिक्के' : 'Coins'}</Text>
                <Text style={[styles.hudVal, { color: '#854D0E' }]}>
                  {formatNumberDigits(progress.coins || 0, language)}
                </Text>
              </View>
            </View>

            {/* Stars Badge */}
            <View style={[styles.hudCard, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B', borderBottomColor: '#D97706' }]}>
              <Art.StarArt size={29} />
              <View>
                <Text style={styles.hudLabel}>{language === 'gu' ? 'સ્ટાર્સ' : language === 'hi' ? 'सितारे' : 'Stars'}</Text>
                <Text style={[styles.hudVal, { color: '#B45309' }]}>
                  {formatNumberDigits(progress.stars || 0, language)}
                </Text>
              </View>
            </View>
          </View>

          {/* Rainbow Progress Bar */}
          <View style={styles.progressBarSection}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressTitle}>
                {language === 'gu' ? 'ટાપુ પર પ્રગતિ:' : language === 'hi' ? 'द्वीप पर प्रगति:' : 'Island Quest Progress:'}
              </Text>
              <Text style={styles.progressPercentText}>
                {formatNumberDigits(progressPercent, language || 'gu')}%
              </Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: progressPercent > 0 ? `${Math.min(100, progressPercent)}%` : '0%',
                    opacity: progressPercent > 0 ? 1 : 0,
                  },
                ]}
              />
              <View style={{ position: 'absolute', right: -4 }}><Art.StarArt size={18} /></View>
            </View>
          </View>
        </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppGlobalBackground id="adventureBgGrad" />
      <Header title={headerTitle} showBack={true} backHref="/home" />

      <FlatList
        data={visibleLevels}
        keyExtractor={(lvl) => `level-node-${lvl.level}`}
        renderItem={renderLevelItem}
        ListHeaderComponent={listHeader}
        ListFooterComponent={<View style={{ height: 90 }} />}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews={Platform.OS !== 'web'}
      />

      {/* 4. CARTOON LEVEL CHALLENGE MODAL */}
      <Modal visible={showQuizModal} transparent animationType="fade" onRequestClose={handleCloseQuizModal}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, shadows.card]}>
            {selectedLevel && (
              <>
                {/* Gold Ribbon Header */}
                <View style={styles.modalRibbonHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Text style={styles.modalRibbonText}>
                      {language === 'gu' ? 'લેવલ' : language === 'hi' ? 'लेवल' : 'LEVEL'} {formatNumberDigits(selectedLevel.level, language)} {language === 'gu' ? 'ચેલેન્જ' : language === 'hi' ? 'चुनौती' : 'QUEST'}
                    </Text>
                    <Glyph name="star" size={18} color="#F59E0B" />
                  </View>
                </View>

                {/* Prompt Card with Audio Replay */}
                <View style={styles.modalPromptCard}>
                  <Text style={styles.modalPromptText}>{getPromptText(selectedLevel)}</Text>
                  <TouchableOpacity
                    style={styles.speakerBtn}
                    disabled={quizSuccess !== null}
                    onPress={() => speak(getPromptText(selectedLevel), language)}
                    activeOpacity={0.8}
                  >
                    <Art.MegaphoneArt size={23} />
                  </TouchableOpacity>
                </View>

                {/* 3 Bouncy 3D Option Cards */}
                <View style={styles.optionsCol}>
                  {(shuffledOptions.length > 0 ? shuffledOptions : selectedLevel.question.options).map((opt, oIdx) => {
                    const isCorrectAnswer = opt.isCorrect;
                    const letterBadge = oIdx === 0 ? 'A' : oIdx === 1 ? 'B' : 'C';

                    return (
                      <TouchableOpacity
                        key={`opt-${oIdx}`}
                        disabled={quizSuccess !== null}
                        style={[
                          styles.optBtn,
                          quizSuccess === true && isCorrectAnswer && styles.optBtnCorrect,
                          quizSuccess === false && styles.optBtnErrorShake,
                        ]}
                        onPress={() => handleAnswer(opt.isCorrect)}
                        activeOpacity={0.82}
                      >
                        <View style={styles.optLetterBadge}>
                          <Text style={styles.optLetterText}>{letterBadge}</Text>
                        </View>
                        <Text style={styles.optBtnText}>{getOptionText(opt)}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Success Feedback Card */}
                {quizSuccess === true && (
                  <View style={styles.feedbackSuccessCard}>
                    <Text style={styles.feedbackSuccessTitle}>
                      {language === 'gu' ? 'ખૂબ સરસ! સાચો જવાબ!' : language === 'hi' ? 'बहुत बढ़िया! सही उत्तर!' : 'Awesome! Correct Answer!'}
                    </Text>
                    <CoinLabel align="center" size={20} textStyle={styles.feedbackSuccessCoins}>
                      +{formatNumberDigits(awardedReward?.coins ?? 0, language)} {language === 'gu' ? 'સિક્કા' : language === 'hi' ? 'सिक्के' : 'Coins'} & +{formatNumberDigits(awardedReward?.stars ?? 0, language)} ⭐
                    </CoinLabel>
                    <TouchableOpacity
                      style={styles.nextLevelBtn}
                      onPress={() => goToNextLevel(selectedLevel.level)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.nextLevelBtnText}>
                        {language === 'gu' ? 'આગળનું લેવલ ➔' : language === 'hi' ? 'अगला स्तर ➔' : 'Next Level ➔'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Error Feedback Card */}
                {quizSuccess === false && (
                  <View style={styles.feedbackErrorCard}>
                    <Text style={styles.feedbackErrorTitle}>
                      {language === 'gu' ? 'ખોટો જવાબ, ફરીથી કોશિશ કરો!' : language === 'hi' ? 'गलत उत्तर, पुनः प्रयास करें!' : 'Incorrect answer! Try again!'}
                    </Text>
                  </View>
                )}

                {/* Close Button */}
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={handleCloseQuizModal}
                  activeOpacity={0.8}
                >
                  <Text style={styles.closeBtnText}>
                    {language === 'gu' ? 'પાછા જાઓ' : language === 'hi' ? 'वापस जाएं' : 'Back to Map'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* 5. CLASS UPGRADE CELEBRATION MODAL */}
      <Modal visible={!!upgradeModalInfo} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.upgradeModalBox, shadows.card]}>
            <View style={styles.upgradeIconCircle}>
              {upgradeModalInfo?.targetClass === '4-6' ? (
                <Art.MedalArt size={54} />
              ) : (
                <Art.TrophyArt size={54} />
              )}
            </View>

            <Text style={styles.upgradeModalTitle}>
              {upgradeModalInfo?.targetClass === '4-6'
                ? (language === 'gu' ? 'વર્ગ ૧ - ૨ માં અપગ્રેડ કરો!' : language === 'hi' ? 'कक्षा १ - २ में अपग्रेड करें!' : 'Upgrade to Class 1-2!')
                : (language === 'gu' ? 'વર્ગ ૩ - ૫ માં અપગ્રેડ કરો!' : language === 'hi' ? 'कक्षा ३ - ५ में अपग्रेड करें!' : 'Upgrade to Class 3-5!')}
            </Text>

            <Text style={styles.upgradeModalDesc}>
              {upgradeModalInfo?.targetClass === '4-6'
                ? (language === 'gu'
                  ? `અભિનંદન! તમે પ્રી-સ્કૂલના તમામ ૨૦ લેવલ પાર કર્યા છે! 🎉 આગળના ૨૧ થી ૩૫ લેવલ રમવા માટે તમારો વર્ગ ૧-૨ (૪-૬ વર્ષ) માં અપગ્રેડ કરો!`
                  : language === 'hi'
                    ? `बधाई! आपने प्री-स्कूल के सभी २० स्तर पूरे कर लिए हैं! 🎉 आगे के २१ से ३५ स्तर खेलने के लिए कक्षा १-२ (४-६ वर्ष) में अपग्रेड करें!`
                    : `Congratulations! You completed all 20 Pre-School levels! 🎉 Upgrade to Class 1-2 (4-6 yrs) to unlock levels 21 to 35!`)
                : (language === 'gu'
                  ? `શાબાશ! તમે વર્ગ ૧-૨ ના તમામ ૩૫ લેવલ પૂર્ણ કર્યા છે! 🌟 હવે ગુણાકાર, ભાગાકાર અને એડવાન્સ લેવલ ૩૬ થી ૫૦ રમવા માટે વર્ગ ૩-૫ (૬-૮ વર્ષ) માં અપગ્રેડ કરો!`
                  : language === 'hi'
                    ? `शाबाश! आपने कक्षा १-२ के सभी ३५ स्तर पूरे कर लिए हैं! 🌟 अब गुणा, भाग और उन्नत स्तर ३६ से ५० के लिए कक्षा ३-५ (६-८ वर्ष) में अपग्रेड करें!`
                    : `Awesome! You completed all 35 levels of Class 1-2! 🌟 Unlock multiplication, division and levels 36 to 50 by upgrading to Class 3-5 (6-8 yrs)!`)}
            </Text>

            <View style={styles.upgradeBenefitsCard}>
              <Text style={styles.upgradeBenefitsTitle}>
                {language === 'gu' ? 'તમને શું નવું મળશે:' : language === 'hi' ? 'आपको क्या नया मिलेगा:' : 'What You Unlock:'}
              </Text>
              {upgradeModalInfo?.targetClass === '4-6' ? (
                <>
                  <View style={styles.upgradeBenefitRow}><Glyph name="sparkle" size={15} color="#D97706" /><Text style={styles.upgradeBenefitItem}>{language === 'gu' ? 'નવા ૧૫ લેવલ (લેવલ ૨૧ થી ૩૫)' : language === 'hi' ? 'नए १५ स्तर (लेवल २१ से ३५)' : 'New 15 levels (Levels 21 to 35)'}</Text></View>
                  <View style={styles.upgradeBenefitRow}><Glyph name="book" size={15} color="#4F46E5" /><Text style={styles.upgradeBenefitItem}>{language === 'gu' ? 'શબ્દ રચના, સ્પેલિંગ અને બારાખડી' : language === 'hi' ? 'शब्द निर्माण और बारहखड़ी' : 'Word builder & barakhadi'}</Text></View>
                  <View style={styles.upgradeBenefitRow}><Glyph name="check" size={15} color="#059669" strokeWidth={3.5} /><Text style={styles.upgradeBenefitItem}>{language === 'gu' ? 'સરવાળા, બાદબાકી અને ૧ થી ૫ ના ઘડિયા' : language === 'hi' ? 'जोड़, घटाव और १ से ५ के पहाड़े' : 'Addition, subtraction & tables 1-5'}</Text></View>
                </>
              ) : (
                <>
                  <View style={styles.upgradeBenefitRow}><Glyph name="sparkle" size={15} color="#D97706" /><Text style={styles.upgradeBenefitItem}>{language === 'gu' ? 'નવા ૧૫ એડવાન્સ લેવલ (લેવલ ૩૬ થી ૫૦)' : language === 'hi' ? 'नए १५ उन्नत स्तर (लेवल ३६ से ५०)' : 'New 15 levels (Levels 36 to 50)'}</Text></View>
                  <View style={styles.upgradeBenefitRow}><Glyph name="target" size={15} color="#DC2626" /><Text style={styles.upgradeBenefitItem}>{language === 'gu' ? 'ગુણાકાર, ભાગાકાર અને ૬ થી ૧૦ ના ઘડિયા' : language === 'hi' ? 'गुणा, भाग और ६ से १० के पहाड़े' : 'Multiplication, division & tables 6-10'}</Text></View>
                  <View style={styles.upgradeBenefitRow}><Glyph name="star" size={15} color="#F59E0B" /><Text style={styles.upgradeBenefitItem}>{language === 'gu' ? 'વિજ્ઞાન, ભૂગોળ અને ગ્રાન્ડ શાહી મુગટ ૫૦' : language === 'hi' ? 'विज्ञान, भूगोल और स्वर्ण शाही मुकुट ५०' : 'Science, geography & Royal Crown 50'}</Text></View>
                </>
              )}
            </View>

            <TouchableOpacity
              style={[styles.upgradeConfirmBtn, shadows.card]}
              onPress={() => upgradeModalInfo && handleUpgradeClass(upgradeModalInfo.targetClass)}
              activeOpacity={0.85}
            >
              <Text style={styles.upgradeConfirmBtnText}>
                {upgradeModalInfo?.targetClass === '4-6'
                  ? (language === 'gu' ? 'વર્ગ ૧ - ૨ માં અપગ્રેડ કરો' : language === 'hi' ? 'कक्षा १ - २ में अपग्रेड करें' : 'Upgrade to Class 1-2')
                  : (language === 'gu' ? 'વર્ગ ૩ - ૫ માં અપગ્રેડ કરો' : language === 'hi' ? 'कक्षा ३ - ५ में अपग्रेड करें' : 'Upgrade to Class 3-5')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.upgradeLaterBtn}
              onPress={() => {
                stopSpeaking();
                soundEffects.stopAll();
                setUpgradeModalInfo(null);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.upgradeLaterBtnText}>
                {language === 'gu' ? 'હમણાં નહીં (પછી કરીશ)' : language === 'hi' ? 'अभी नहीं (बाद में)' : 'Maybe Later'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomNav activeTab="challenges" />
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
  },
  listHeaderWrap: {
    width: '100%',
    maxWidth: 580,
    alignSelf: 'center',
  },
  mapTrackRow: {
    width: '100%',
    maxWidth: 580,
    alignSelf: 'center',
    paddingVertical: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  mapTrackRowFirst: {
    paddingTop: 24,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
  },
  mapTrackRowLast: {
    paddingBottom: 24,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },

  /* 1. HERO POSTER BANNER */
  heroPosterCard: {
    width: '100%',
    maxWidth: 580,
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 3,
    borderColor: '#38BDF8',
    borderBottomWidth: 6,
    borderBottomColor: '#0284C7',
    position: 'relative',
  },
  heroPosterImage: {
    width: '100%',
    height: '100%',
  },
  heroPosterOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.38)',
    padding: 14,
    justifyContent: 'space-between',
  },
  heroBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroBadgePill: {
    backgroundColor: '#FEF08A',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: '#FACC15',
  },
  heroBadgePillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#854D0E',
  },
  worldPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.full,
  },
  worldPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    marginTop: 4,
  },
  heroSub: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FEF08A',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 4,
  },
  heroActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  heroPlayNextBtn: {
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#16A34A',
    borderBottomWidth: 4,
    borderBottomColor: '#15803D',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  heroPlayNextBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  heroCertBtn: {
    backgroundColor: '#3B82F6',
    borderWidth: 2,
    borderColor: '#2563EB',
    borderBottomWidth: 4,
    borderBottomColor: '#1D4ED8',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  heroCertBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  /* 2. 3D CANDY HUD */
  hudContainer: {
    width: '100%',
    maxWidth: 580,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    marginBottom: spacing.lg,
    borderWidth: 2.5,
    borderBottomWidth: 5,
    borderColor: '#E2E8F0',
    borderBottomColor: '#CBD5E1',
  },
  hudTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  hudCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 4,
  },
  hudIcon: {
    fontSize: 22,
  },
  hudLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  hudVal: {
    fontSize: 16,
    fontWeight: '700',
  },
  hudMaxVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  progressBarSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  progressPercentText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  progressBarTrack: {
    height: 14,
    backgroundColor: '#E2E8F0',
    borderRadius: 7,
    position: 'relative',
    justifyContent: 'center',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 7,
  },
  progressMarkerEmoji: {
    position: 'absolute',
    right: -4,
    fontSize: 14,
  },

  /* 3. WINDING MAP TRACK WITH AMBIENT SCENERY */
  mapTrack: {
    width: '100%',
    maxWidth: 580,
    alignItems: 'center',
    paddingVertical: 24,
    borderRadius: 36,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2.5,
    borderColor: '#86EFAC',
    borderBottomWidth: 6,
    borderBottomColor: '#22C55E',
    backgroundColor: '#38A149',
  },
  mapTrackMobile: {
    borderRadius: 0,
    borderWidth: 0,
    borderBottomWidth: 0,
  },
  mapBackgroundLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    backgroundColor: '#38A149',
  },
  terrainHillBand: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  terrainFleckRow: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  terrainFleckEmoji: {
    fontSize: 14,
    opacity: 0.22,
  },
  mapBgWashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  nodeColumnWrapper: {
    width: '100%',
    alignItems: 'center',
    zIndex: 2,
    paddingHorizontal: 12,
  },

  /* 3D World Gate Landmark Cards */
  worldGateCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    marginTop: 18,
    marginBottom: 52,
    borderWidth: 2,
    borderBottomWidth: 5,
  },
  classGateSpecial: {
    borderWidth: 2.5,
    borderBottomWidth: 6,
  },
  classGateBadgePill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
    alignSelf: 'flex-start',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  classGateBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  worldGateTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  worldPillTag: {
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: radii.full,
    borderWidth: 1.5,
  },
  worldPillTagText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  rewardPillTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: '#FACC15',
  },
  rewardPillTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  worldGateMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  worldGateIcon3DBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 2,
    borderBottomWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  worldGateEmojiLarge: {
    fontSize: 30,
  },
  worldGateTextCol: {
    flex: 1,
  },
  worldGateTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  worldGateSub: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  worldGateBottomStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  worldGateLevelRange: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  worldGateStatusBadge: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: radii.full,
  },
  statusCompleted: {
    backgroundColor: '#DCFCE7',
    color: '#15803D',
  },
  statusActive: {
    backgroundColor: '#FEF3C7',
    color: '#B45309',
  },
  statusLocked: {
    backgroundColor: '#F1F5F9',
    color: '#94A3B8',
  },

  /* Ambient Nature Scenery */
  ambientSceneryWrap: {
    position: 'absolute',
    top: 6,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    width: 60,
    height: 60,
  },
  sceneryLeft: {
    left: 12,
  },
  sceneryRight: {
    right: 12,
  },
  sceneryShadowPatch: {
    position: 'absolute',
    bottom: 4,
    width: 48,
    height: 16,
    borderRadius: 12,
  },
  sceneryEmojiPrimary: {
    fontSize: 28,
  },
  sceneryEmojiSecondary: {
    position: 'absolute',
    bottom: 2,
    right: -2,
    fontSize: 16,
  },

  /* 3D Cobblestone Stepping Stones Path */
  steppingDotsRow: {
    height: 52,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginVertical: 3,
    zIndex: 1,
  },
  stepDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderBottomWidth: 3,
    borderBottomColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  stepDotCompleted: {
    backgroundColor: '#4ADE80',
    borderColor: '#22C55E',
    borderBottomColor: '#16A34A',
    shadowColor: '#22C55E',
    shadowOpacity: 0.35,
    shadowRadius: 3,
  },
  stepDotCurrent: {
    backgroundColor: '#FDE047',
    borderColor: '#EAB308',
    borderBottomColor: '#CA8A04',
    shadowColor: '#EAB308',
    shadowOpacity: 0.35,
    shadowRadius: 3,
  },
  stepDotCore: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  stepDotCheck: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: -1,
  },

  /* Node Content Wrapper */
  nodeContentWrap: {
    alignItems: 'center',
    position: 'relative',
    marginVertical: 4,
  },

  /* Player Avatar Current Marker */
  playerAvatarBadge: {
    alignItems: 'center',
    marginBottom: 6,
    zIndex: 10,
  },
  playerSpeechBubble: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: '#FEF08A',
    marginBottom: 2,
    shadowColor: '#B45309',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  playerSpeechText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  playerSpeechTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#F59E0B',
    alignSelf: 'center',
    marginBottom: 2,
  },
  playerAvatarPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: 48,
    height: 48,
    borderWidth: 2.5,
    borderColor: '#F59E0B',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  playerAvatar3DImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  playerAvatarEmoji: {
    fontSize: 26,
  },
  playerAvatarHat: {
    position: 'absolute',
    top: -9,
    right: -6,
    fontSize: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  playerNamePill: {
    marginTop: 3,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: '#FDE68A',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 1,
  },
  playerNameText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#78350F',
  },

  /* Landmark Special Ribbon */
  landmarkBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderBottomWidth: 3,
    borderBottomColor: '#D97706',
    marginBottom: 8,
    shadowColor: '#B45309',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  landmarkBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },

  /* Node Button */
  nodeButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3.5,
    borderBottomWidth: 7,
    position: 'relative',
  },
  nodeCurrentGlowRing: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: 'rgba(254, 240, 138, 0.85)',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    zIndex: -1,
  },
  nodeButtonCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
    borderBottomColor: '#047857',
  },
  nodeButtonCurrent: {
    backgroundColor: '#3B82F6',
    borderColor: '#2563EB',
    borderBottomColor: '#1D4ED8',
  },
  nodeButtonLocked: {
    backgroundColor: '#E2E8F0',
    borderColor: '#CBD5E1',
    borderBottomColor: '#94A3B8',
  },
  nodeButtonClassLocked: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FACC15',
    borderBottomColor: '#CA8A04',
  },
  completedStarsRow: {
    position: 'absolute',
    top: -12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  miniStar: {
    fontSize: 10,
  },
  miniStarCenter: {
    fontSize: 13,
    marginTop: -3,
  },
  nodeIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeIconText: {
    fontSize: 22,
  },
  nodeNum: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 1,
  },
  nodeNumLocked: {
    color: '#64748B',
  },
  nodeNumCompleted: {
    color: '#FFFFFF',
  },
  nodeTitlePill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 6,
    maxWidth: 130,
  },
  nodeTitlePillCurrent: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  nodeTitleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  nodeTitleTextCurrent: {
    color: '#2563EB',
  },

  /* 4. CHALLENGE QUIZ MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBox: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 20,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#38BDF8',
  },
  modalRibbonHeader: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: radii.full,
    marginBottom: 16,
  },
  modalRibbonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  modalPromptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    width: '100%',
    marginBottom: 16,
  },
  modalPromptText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 22,
    paddingRight: 8,
  },
  speakerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
  },
  speakerBtnIcon: {
    fontSize: 18,
  },
  optionsCol: {
    width: '100%',
    gap: 10,
    marginBottom: 14,
  },
  optBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: '#E2E8F0',
    borderBottomColor: '#CBD5E1',
    gap: 10,
  },
  optBtnCorrect: {
    backgroundColor: '#DCFCE7',
    borderColor: '#22C55E',
    borderBottomColor: '#15803D',
  },
  optBtnErrorShake: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  optLetterBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  optLetterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  optBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  feedbackSuccessCard: {
    backgroundColor: '#DCFCE7',
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  feedbackSuccessTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#15803D',
  },
  feedbackSuccessCoins: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
    marginTop: 2,
  },
  feedbackErrorCard: {
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 14,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  feedbackErrorTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },
  nextLevelBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: radii.full,
    borderBottomWidth: 3,
    borderBottomColor: '#059669',
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  nextLevelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  closeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radii.full,
  },
  closeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },

  /* 5. CLASS UPGRADE CELEBRATION MODAL */
  upgradeModalBox: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    borderWidth: 3.5,
    borderColor: '#F59E0B',
  },
  upgradeIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#F59E0B',
    marginBottom: 12,
  },
  upgradeModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  upgradeModalDesc: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  upgradeBenefitsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    width: '100%',
    marginBottom: 18,
    gap: 6,
  },
  upgradeBenefitsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  upgradeBenefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  upgradeBenefitItem: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    lineHeight: 18,
  },
  upgradeConfirmBtn: {
    backgroundColor: '#3B82F6',
    borderWidth: 2,
    borderColor: '#60A5FA',
    borderBottomWidth: 5,
    borderBottomColor: '#2563EB',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 22,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  upgradeConfirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  upgradeLaterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  upgradeLaterBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  authLockContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  authLockCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    maxWidth: 420,
    width: '100%',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  authLockIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#C7D2FE',
  },
  authLockTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E1B4B',
    textAlign: 'center',
    marginBottom: 8,
  },
  authLockDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  authLockLoginBtn: {
    backgroundColor: '#7C3AED',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  authLockLoginBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  authLockRegisterBtn: {
    backgroundColor: '#F5EEFE',
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  authLockRegisterBtnText: {
    color: '#7C3AED',
    fontSize: 14.5,
    fontWeight: '600',
  },
});
