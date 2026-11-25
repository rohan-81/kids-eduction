import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AgeGroup, AppLanguage } from '../../types';
import { soundEffects } from '../../services/soundEffects';
import { Image } from 'react-native';
import { AVATAR_3D_BOY, AVATAR_3D_GIRL, STORY_CHARACTER_IMAGES } from '../../utils/imageHelper';
import * as Art from '../art3d/Art3D';
import { Glyph } from '../fun';
import { Remote3DImage } from './Remote3DImage';

interface GuestNameModalProps {
  visible: boolean;
  language: AppLanguage;
  initialAgeGroup?: AgeGroup;
  initialName?: string;
  onConfirm: (childName: string, ageGroup: AgeGroup, avatar: string) => void;
  onCancel: () => void;
}

const AVATAR_OPTIONS = [
  { id: 'avatar_3d_boy', image: AVATAR_3D_BOY, labelEn: 'Boy', labelGu: 'છોકરો', labelHi: 'लड़का' },
  { id: 'avatar_3d_girl', image: AVATAR_3D_GIRL, labelEn: 'Girl', labelGu: 'છોકરી', labelHi: 'लड़की' },
  { id: '🦁', image: STORY_CHARACTER_IMAGES['🦁'], labelEn: 'Lion', labelGu: 'સિંહ', labelHi: 'शेर' },
  { id: '🦊', image: STORY_CHARACTER_IMAGES['🦊'], labelEn: 'Fox', labelGu: 'શિયાળ', labelHi: 'लोमड़ी' },
  { id: '🐻', image: STORY_CHARACTER_IMAGES['🐻'], labelEn: 'Bear', labelGu: 'રીંછ', labelHi: 'भालू' },
];

export const GuestNameModal: React.FC<GuestNameModalProps> = ({
  visible,
  language,
  initialAgeGroup = '2-4',
  initialName = '',
  onConfirm,
  onCancel,
}) => {
  const [nickname, setNickname] = useState(
    initialName && initialName !== 'aa' && initialName !== 'bb' && initialName !== 'Little Star'
      ? initialName
      : ''
  );
  const [selectedAge, setSelectedAge] = useState<AgeGroup>(initialAgeGroup);
  const [selectedAvatar, setSelectedAvatar] = useState('avatar_3d_boy');

  const ageOptions: { group: AgeGroup; label: string; icon: React.FC<{ size?: number }>; range: string }[] = [
    {
      group: '2-4',
      icon: Art.AppleArt,
      label: language === 'gu' ? 'બાલવાટિકા' : language === 'hi' ? 'प्री-स्कूल' : 'Pre-School',
      range: language === 'gu' ? '૨-૪ વર્ષ' : language === 'hi' ? '२-४ वर्ष' : '2-4 yrs',
    },
    {
      group: '4-6',
      icon: Art.WordTilesArt,
      label: language === 'gu' ? 'ધોરણ ૧-૨' : language === 'hi' ? 'कक्षा १-२' : 'Class 1-2',
      range: language === 'gu' ? '૪-૬ વર્ષ' : language === 'hi' ? '४-६ वर्ष' : '4-6 yrs',
    },
    {
      group: '6-8',
      icon: Art.TrophyArt,
      label: language === 'gu' ? 'ધોરણ ૩-૫' : language === 'hi' ? 'कक्षा ३-૫' : 'Class 3-5',
      range: language === 'gu' ? '૬-૮ વર્ષ' : language === 'hi' ? '૬-૮ वर्ष' : '6-8 yrs',
    },
  ];

  const handleStart = () => {
    soundEffects.playLevelUp();
    const cleanName = nickname.trim() || (language === 'gu' ? 'નાનો તારો' : language === 'hi' ? 'छोटा तारा' : 'Little Star');
    onConfirm(cleanName, selectedAge, selectedAvatar);
  };

  const handleSkip = () => {
    soundEffects.playBubblePop();
    const fallbackName = language === 'gu' ? 'નાનો તારો' : language === 'hi' ? 'छोटा तारा' : 'Little Star';
    onConfirm(fallbackName, selectedAge, selectedAvatar);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onCancel}
        />

        <View style={styles.modalCard}>
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => {
              soundEffects.playBubblePop();
              onCancel();
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M18 6L6 18M6 6L18 18"
                stroke="#94A3B8"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollInside}
          >
            {/* Header Badge */}
            <View style={styles.headerIconWrapper}>
              <Art.StarArt size={48} />
            </View>

            <Text style={styles.modalTitle}>
              {language === 'gu'
                ? 'બાળકનું સ્વાગત છે!'
                : language === 'hi'
                ? 'बच्चे का स्वागत है!'
                : 'Welcome, Little Star!'}
            </Text>

            <Text style={styles.modalSubtitle}>
              {language === 'gu'
                ? 'શીખવાનું શરૂ કરતા પહેલાં તમારા બાળકનું નામ દાખલ કરો:'
                : language === 'hi'
                ? 'सीखना शुरू करने से पहले अपने बच्चे का नाम दर्ज करें:'
                : 'Enter your child’s nickname to personalize their learning adventure:'}
            </Text>

            {/* Child's Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {language === 'gu'
                  ? 'બાળકનું નામ (Child’s Nickname)'
                  : language === 'hi'
                  ? 'बच्चे का नाम (Child’s Nickname)'
                  : 'Child’s Nickname'}
              </Text>
              <View style={styles.inputBoxRow}>
                <View style={styles.inputEmoji}>
                  <Glyph name="star" size={18} color="#F59E0B" strokeWidth={1.5} />
                </View>
                <TextInput
                  style={styles.textInput}
                  value={nickname}
                  onChangeText={setNickname}
                  placeholder={
                    language === 'gu'
                      ? 'દા.ત. આરવ, પિયા...'
                      : language === 'hi'
                      ? 'उदा. आरव, प्रिया...'
                      : 'e.g. Aarav, Riya, Little Star'
                  }
                  placeholderTextColor="#94A3B8"
                  maxLength={24}
                  autoCapitalize="words"
                />
                {nickname.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setNickname('')}
                    style={styles.clearBtn}
                  >
                    <Glyph name="close" size={13} color="#94A3B8" strokeWidth={3} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Class / Age Group Selector */}
            <View style={styles.sectionWrapper}>
              <Text style={styles.inputLabel}>
                {language === 'gu'
                  ? 'બાળકનો વર્ગ / વયજૂથ (Class / Age Group)'
                  : language === 'hi'
                  ? 'बच्चे की कक्षा / आयु वर्ग (Class / Age Group)'
                  : 'Child’s Class / Age Group'}
              </Text>
              <View style={styles.ageRow}>
                {ageOptions.map((opt) => {
                  const isSelected = selectedAge === opt.group;
                  return (
                    <TouchableOpacity
                      key={opt.group}
                      style={[
                        styles.ageCard,
                        isSelected && styles.ageCardActive,
                      ]}
                      onPress={() => {
                        soundEffects.playBubblePop();
                        setSelectedAge(opt.group);
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={{ marginBottom: 2 }}>{React.createElement(opt.icon, { size: 32 })}</View>
                      <Text style={[styles.ageTitle, isSelected && styles.ageTitleActive]}>
                        {opt.label}
                      </Text>
                      <Text style={[styles.ageRange, isSelected && styles.ageRangeActive]}>
                        {opt.range}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Avatar Selector */}
            <View style={styles.sectionWrapper}>
              <Text style={styles.inputLabel}>
                {language === 'gu'
                  ? 'અવતાર પસંદ કરો (Choose Avatar)'
                  : language === 'hi'
                  ? 'अवतार चुनें (Choose Avatar)'
                  : 'Choose an Avatar'}
              </Text>
              <View style={styles.avatarRow}>
                {AVATAR_OPTIONS.map((av) => {
                  const isSelected = selectedAvatar === av.id;
                  return (
                    <TouchableOpacity
                      key={av.id}
                      style={[
                        styles.avatarChip,
                        isSelected && styles.avatarChipActive,
                      ]}
                      onPress={() => {
                        soundEffects.playBubblePop();
                        setSelectedAvatar(av.id);
                      }}
                      activeOpacity={0.8}
                    >
                      <Remote3DImage
                        source={av.image}
                        style={{ width: 34, height: 34, borderRadius: 17 }}
                        fallback={<Text style={{ fontSize: 24 }}>{av.id}</Text>}
                      />
                      <Text style={[styles.avatarLabel, isSelected && styles.avatarLabelActive]}>
                        {language === 'gu' ? av.labelGu : language === 'hi' ? av.labelHi : av.labelEn}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.startBtn}
                onPress={handleStart}
                activeOpacity={0.85}
              >
                <Text style={styles.startBtnText}>
                  {language === 'gu'
                    ? 'શીખવાનું શરૂ કરો'
                    : language === 'hi'
                    ? 'सीखना शुरू करें'
                    : 'Start Learning'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.skipBtn}
                onPress={handleSkip}
                activeOpacity={0.7}
              >
                <Text style={styles.skipBtnText}>
                  {language === 'gu'
                    ? 'પછીથી નામ બદલો (Skip)'
                    : language === 'hi'
                    ? 'बाद में नाम बदलें (Skip)'
                    : 'Skip for now'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 460,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 10,
    borderWidth: 1.5,
    borderColor: '#EDE9FE',
  },
  closeBtn: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  scrollInside: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  headerIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FDE047',
  },
  modalTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
    lineHeight: 19,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  inputBoxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 50,
  },
  inputEmoji: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    height: '100%',
  },
  clearBtn: {
    padding: 6,
  },
  sectionWrapper: {
    width: '100%',
    marginBottom: 18,
  },
  ageRow: {
    flexDirection: 'row',
    gap: 8,
  },
  ageCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  ageCardActive: {
    backgroundColor: '#F5F3FF',
    borderColor: '#8062F5',
  },
  ageTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },
  ageTitleActive: {
    color: '#8062F5',
  },
  ageRange: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 2,
  },
  ageRangeActive: {
    color: '#6D28D9',
  },
  avatarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  avatarChip: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    minWidth: 64,
  },
  avatarChipActive: {
    backgroundColor: '#FDF4FF',
    borderColor: '#D946EF',
  },
  avatarLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 4,
  },
  avatarLabelActive: {
    color: '#A21CAF',
    fontWeight: '700',
  },
  actionRow: {
    width: '100%',
    marginTop: 10,
    gap: 8,
  },
  startBtn: {
    backgroundColor: '#8062F5',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8062F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startBtnText: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  skipBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  skipBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textDecorationLine: 'underline',
  },
});

