import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import { colors } from '../../theme/colors';
import { radii, shadows } from '../../theme/spacing';
import { soundEffects } from '../../services/soundEffects';
import { formatNumberDigits } from '../../utils/languageData';
import { AppLanguage } from '../../types';
import { GiftArt } from '../art3d/Art3D';
import { Glyph } from '../fun/KidIcons';

interface KidsDatePickerModalProps {
  visible: boolean;
  initialDate?: string; // DD/MM/YYYY or YYYY-MM-DD
  language: AppLanguage;
  onClose: () => void;
  onConfirm: (formattedDate: string, calculatedAge: number | null) => void;
}

const MONTHS_DATA = [
  { index: 1, gu: 'જાન્યુઆરી', hi: 'जनवरी', en: 'January', short: 'Jan' },
  { index: 2, gu: 'ફેબ્રુઆરી', hi: 'फ़रवरी', en: 'February', short: 'Feb' },
  { index: 3, gu: 'માર્ચ', hi: 'मार्च', en: 'March', short: 'Mar' },
  { index: 4, gu: 'એપ્રિલ', hi: 'अप्रैल', en: 'April', short: 'Apr' },
  { index: 5, gu: 'મે', hi: 'मई', en: 'May', short: 'May' },
  { index: 6, gu: 'જૂન', hi: 'जून', en: 'June', short: 'Jun' },
  { index: 7, gu: 'જુલાઈ', hi: 'जुलाई', en: 'July', short: 'Jul' },
  { index: 8, gu: 'ઓગસ્ટ', hi: 'अगस्त', en: 'August', short: 'Aug' },
  { index: 9, gu: 'સપ્ટેમ્બર', hi: 'सितंबर', en: 'September', short: 'Sep' },
  { index: 10, gu: 'ઓક્ટોબર', hi: 'अक्टूबर', en: 'October', short: 'Oct' },
  { index: 11, gu: 'નવેમ્બર', hi: 'नवंबर', en: 'November', short: 'Nov' },
  { index: 12, gu: 'ડિસેમ્બર', hi: 'दिसंबर', en: 'December', short: 'Dec' },
];

// Target audience: kids 1 to 12 years old
const CURRENT_YEAR = new Date().getFullYear();
const YEARS_DATA: number[] = [];
for (let y = CURRENT_YEAR; y >= CURRENT_YEAR - 12; y--) {
  YEARS_DATA.push(y);
}

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

function parseInitialDate(dateStr?: string): { day: number; month: number; year: number } {
  const now = new Date();
  const defaultYear = now.getFullYear() - 4; // default to 4 years old (kids app)
  const defaultMonth = now.getMonth() + 1;
  const defaultDay = 15;

  if (!dateStr || typeof dateStr !== 'string') {
    return { day: defaultDay, month: defaultMonth, year: defaultYear };
  }

  const clean = dateStr.trim();
  const parts = clean.includes('/') ? clean.split('/') : clean.includes('-') ? clean.split('-') : [];

  if (parts.length === 3) {
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
    if (d > 0 && d <= 31 && m > 0 && m <= 12 && y >= 2000 && y <= CURRENT_YEAR) {
      return { day: d, month: m, year: y };
    }
  }

  return { day: defaultDay, month: defaultMonth, year: defaultYear };
}

function computeAge(day: number, month: number, year: number): number {
  const today = new Date();
  let age = today.getFullYear() - year;
  const mDiff = today.getMonth() + 1 - month;
  if (mDiff < 0 || (mDiff === 0 && today.getDate() < day)) {
    age--;
  }
  return Math.max(0, age);
}

export const KidsDatePickerModal: React.FC<KidsDatePickerModalProps> = ({
  visible,
  initialDate,
  language,
  onClose,
  onConfirm,
}) => {
  const [selectedDay, setSelectedDay] = useState(15);
  const [selectedMonth, setSelectedMonth] = useState(6);
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR - 4);

  useEffect(() => {
    if (visible) {
      const parsed = parseInitialDate(initialDate);
      setSelectedDay(parsed.day);
      setSelectedMonth(parsed.month);
      setSelectedYear(parsed.year);
    }
  }, [visible, initialDate]);

  const maxDays = getDaysInMonth(selectedMonth, selectedYear);
  const safeDay = Math.min(selectedDay, maxDays);

  const daysArray = Array.from({ length: maxDays }, (_, i) => i + 1);
  const currentAge = computeAge(safeDay, selectedMonth, selectedYear);

  const monthObj = MONTHS_DATA.find((m) => m.index === selectedMonth) || MONTHS_DATA[0];
  const monthName = language === 'gu' ? monthObj.gu : language === 'hi' ? monthObj.hi : monthObj.en;

  const formattedDate = `${String(safeDay).padStart(2, '0')}/${String(selectedMonth).padStart(2, '0')}/${selectedYear}`;

  const handleSelectQuickAge = (age: number) => {
    soundEffects.playBubblePop();
    const targetYear = CURRENT_YEAR - age;
    setSelectedYear(targetYear);
  };

  const handleConfirm = () => {
    soundEffects.playLevelUp();
    onConfirm(formattedDate, currentAge);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, shadows.card]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerIconCircle}>
              <GiftArt size={34} />
            </View>
            <View style={styles.headerTextCol}>
              <Text style={styles.headerTitle}>
                {language === 'gu'
                  ? 'જન્મ તારીખ પસંદ કરો'
                  : language === 'hi'
                  ? 'जन्म तिथि चुनें'
                  : 'Select Date of Birth'}
              </Text>
              <Text style={styles.headerSubtitle}>
                {language === 'gu'
                  ? 'બાળકની ઉંમર અને વર્ષ પસંદ કરો'
                  : language === 'hi'
                  ? 'बच्चे की आयु और वर्ष चुनें'
                  : 'Pick your child’s birthday'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Glyph name="close" size={14} color="#64748B" strokeWidth={3} />
            </TouchableOpacity>
          </View>

          {/* Active Preview Pill */}
          <View style={styles.previewPill}>
            <Text style={styles.previewDateText}>
              {formatNumberDigits(safeDay, language)} {monthName} {formatNumberDigits(selectedYear, language)}
            </Text>
            <View style={styles.ageBadge}>
              <Text style={styles.ageBadgeText}>
                {formatNumberDigits(currentAge, language)}{' '}
                {language === 'gu' ? 'વર્ષ' : language === 'hi' ? 'वर्ष' : 'Yrs Old'}
              </Text>
            </View>
          </View>

          {/* Quick Age Presets */}
          <Text style={styles.sectionLabel}>
            {language === 'gu' ? 'ઝડપી ઉંમર પસંદ કરો:' : language === 'hi' ? 'त्वरित आयु चुनें:' : 'Quick Age Shortcuts:'}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickAgeRow}
            nestedScrollEnabled={true}
            directionalLockEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
            {[2, 3, 4, 5, 6, 7, 8].map((age) => {
              const isSelected = currentAge === age;
              return (
                <TouchableOpacity
                  key={age}
                  style={[styles.quickAgeChip, isSelected && styles.quickAgeChipActive]}
                  onPress={() => handleSelectQuickAge(age)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.quickAgeChipText, isSelected && styles.quickAgeChipTextActive]}>
                    {formatNumberDigits(age, language)} {language === 'gu' ? 'વર્ષ' : language === 'hi' ? 'वर्ष' : 'yrs'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* 3-Column Visual Picker: Day, Month, Year */}
          <View style={styles.columnsContainer}>
            {/* 1. Day Column */}
            <View style={styles.pickerCol}>
              <Text style={styles.colTitle}>
                {language === 'gu' ? 'તારીખ (Day)' : language === 'hi' ? 'दिन (Day)' : 'Day'}
              </Text>
              <ScrollView style={styles.colScroll} showsVerticalScrollIndicator={false}>
                {daysArray.map((d) => {
                  const isSelected = safeDay === d;
                  return (
                    <TouchableOpacity
                      key={d}
                      style={[styles.colItemBtn, isSelected && styles.colItemBtnSelected]}
                      onPress={() => {
                        soundEffects.playBubblePop();
                        setSelectedDay(d);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.colItemText, isSelected && styles.colItemTextSelected]}>
                        {formatNumberDigits(d, language)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* 2. Month Column */}
            <View style={[styles.pickerCol, { flex: 1.3 }]}>
              <Text style={styles.colTitle}>
                {language === 'gu' ? 'મહિનો (Month)' : language === 'hi' ? 'माह (Month)' : 'Month'}
              </Text>
              <ScrollView style={styles.colScroll} showsVerticalScrollIndicator={false}>
                {MONTHS_DATA.map((m) => {
                  const isSelected = selectedMonth === m.index;
                  const label = language === 'gu' ? m.gu : language === 'hi' ? m.hi : m.short;
                  return (
                    <TouchableOpacity
                      key={m.index}
                      style={[styles.colItemBtn, isSelected && styles.colItemBtnSelected]}
                      onPress={() => {
                        soundEffects.playBubblePop();
                        setSelectedMonth(m.index);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.colItemText, isSelected && styles.colItemTextSelected]} numberOfLines={1}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* 3. Year Column */}
            <View style={styles.pickerCol}>
              <Text style={styles.colTitle}>
                {language === 'gu' ? 'વર્ષ (Year)' : language === 'hi' ? 'वर्ष (Year)' : 'Year'}
              </Text>
              <ScrollView style={styles.colScroll} showsVerticalScrollIndicator={false}>
                {YEARS_DATA.map((y) => {
                  const isSelected = selectedYear === y;
                  return (
                    <TouchableOpacity
                      key={y}
                      style={[styles.colItemBtn, isSelected && styles.colItemBtnSelected]}
                      onPress={() => {
                        soundEffects.playBubblePop();
                        setSelectedYear(y);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.colItemText, isSelected && styles.colItemTextSelected]}>
                        {formatNumberDigits(y, language)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.footerBtnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.cancelBtnText}>
                {language === 'gu' ? 'રદ કરો' : language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
              <Text style={styles.confirmBtnText}>
                {language === 'gu' ? 'તારીખ સાચવો' : language === 'hi' ? 'तारीख सेव करें' : 'Set Birthday'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    width: '100%',
    maxWidth: 420,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
  },
  previewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F3FF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
    marginBottom: 12,
  },
  previewDateText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5B21B6',
  },
  ageBadge: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  ageBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  quickAgeRow: {
    gap: 8,
    paddingBottom: 10,
  },
  quickAgeChip: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  quickAgeChipActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#7C3AED',
  },
  quickAgeChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  quickAgeChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  columnsContainer: {
    flexDirection: 'row',
    gap: 8,
    height: 190,
    marginTop: 6,
    marginBottom: 18,
  },
  pickerCol: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    padding: 4,
  },
  colTitle: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  colScroll: {
    flex: 1,
  },
  colItemBtn: {
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  colItemBtnSelected: {
    backgroundColor: '#8B5CF6',
  },
  colItemText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  colItemTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  footerBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  confirmBtn: {
    flex: 1.5,
    paddingVertical: 13,
    borderRadius: 16,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#059669',
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

