import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LessonItem, AppLanguage } from '../types';
import { toHiDigits, toGujDigits } from '../utils/languageData';
import { clayShadow } from '../theme/kidTheme';
import { INDIAN_CURRENCY_IMAGES } from '../utils/imageHelper';
import { resolveOfflineMediaSource } from '../utils/remoteAssets';

// -------------------------------------------------------------
// Helper: Localize digits for math visuals
// -------------------------------------------------------------
function locNum(val: number | string, lang: AppLanguage): string {
  const n = typeof val === 'number' ? val : parseInt(val, 10);
  if (isNaN(n)) return String(val);
  if (lang === 'hi') return toHiDigits(n);
  if (lang === 'gu') return toGujDigits(n);
  return String(n);
}

// -------------------------------------------------------------
// 1. High-Detail Authentic Indian Rupee Coin Visual
// Uses official Reserve Bank of India 2019 Definitive Grain Series Coins
// -------------------------------------------------------------
export const RupeeCoinVisual: React.FC<{
  value: 1 | 2 | 5 | 10;
  size?: number;
  language?: AppLanguage;
}> = ({ value, size = 64 }) => {
  const isDetail = size > 80;
  const imgSource = resolveOfflineMediaSource(INDIAN_CURRENCY_IMAGES[`money-coin-${value}`]);
  const coinSize = isDetail ? 140 : 58;

  return (
    <View style={[styles.coinWrap, isDetail ? styles.coinWrapDetail : styles.coinWrapCard]}>
      <Image
        source={imgSource}
        style={{
          width: coinSize,
          height: coinSize,
          borderRadius: coinSize / 2,
        }}
        resizeMode="contain"
      />
    </View>
  );
};

// -------------------------------------------------------------
// 2. High-Detail Authentic Indian Banknote Visual
// Uses official Reserve Bank of India Mahatma Gandhi New Series Notes
// -------------------------------------------------------------
interface NoteSpec {
  bgStart: string;
  bgEnd: string;
  border: string;
  accent: string;
  motif: string;
  motifLabel: string;
}

const NOTE_SPECS: Record<10 | 20 | 50 | 100, NoteSpec> = {
  10: {
    bgStart: '#92400E', // Chocolate Brown 10
    bgEnd: '#713F12',
    border: '#B45309',
    accent: '#FDE68A',
    motif: '☸️',
    motifLabel: 'Konark Wheel',
  },
  20: {
    bgStart: '#65A30D', // Greenish Yellow 20
    bgEnd: '#3F6212',
    border: '#84CC16',
    accent: '#FEF08A',
    motif: '⛰️',
    motifLabel: 'Ellora Caves',
  },
  50: {
    bgStart: '#0284C7', // Fluorescent Cyan 50
    bgEnd: '#075985',
    border: '#38BDF8',
    accent: '#E0F2FE',
    motif: '🏛️',
    motifLabel: 'Hampi Chariot',
  },
  100: {
    bgStart: '#7C3AED', // Lavender Purple 100
    bgEnd: '#5B21B6',
    border: '#A78BFA',
    accent: '#EDE9FE',
    motif: '🏰',
    motifLabel: 'Rani ki Vav',
  },
};

export const RupeeNoteVisual: React.FC<{
  value: 10 | 20 | 50 | 100;
  size?: number;
  language?: AppLanguage;
}> = ({ value, size = 64 }) => {
  const isDetail = size > 80;
  const spec = NOTE_SPECS[value];
  const imgSource = resolveOfflineMediaSource(INDIAN_CURRENCY_IMAGES[`money-note-${value}`]);
  const noteW = isDetail ? 252 : 90;
  const noteH = isDetail ? 118 : 46;

  return (
    <View
      style={[
        styles.noteWrap,
        isDetail ? styles.noteWrapDetail : styles.noteWrapCard,
        {
          borderColor: spec.border,
          borderWidth: isDetail ? 2 : 1.5,
          borderRadius: isDetail ? 12 : 7,
          backgroundColor: spec.bgStart,
          overflow: 'hidden',
        },
        clayShadow(2),
      ]}
    >
      <Image
        source={imgSource}
        style={{
          width: noteW,
          height: noteH,
          borderRadius: isDetail ? 10 : 5,
        }}
        resizeMode="cover"
      />
    </View>
  );
};

// -------------------------------------------------------------
// 3. Kids-Friendly Math Missing Number & Sequence Puzzle Visual
// -------------------------------------------------------------
interface MissingItemSpec {
  mode: 'sequence' | 'equation';
  items: Array<{ text: string; isMissing?: boolean }>;
  operator?: string;
  missingValue: number;
}

function parseMissingLesson(item: LessonItem): MissingItemSpec {
  const id = item.id;
  switch (id) {
    case 'math-miss-1':
      return {
        mode: 'sequence',
        items: [{ text: '1' }, { text: '2' }, { text: '3', isMissing: true }, { text: '4' }],
        missingValue: 3,
      };
    case 'math-miss-2':
      return {
        mode: 'sequence',
        items: [{ text: '5' }, { text: '6', isMissing: true }, { text: '7' }, { text: '8' }],
        missingValue: 6,
      };
    case 'math-miss-3':
      return {
        mode: 'sequence',
        items: [{ text: '2' }, { text: '4' }, { text: '6', isMissing: true }, { text: '8' }],
        missingValue: 6,
      };
    case 'math-miss-4':
      return {
        mode: 'sequence',
        items: [{ text: '5' }, { text: '10' }, { text: '15', isMissing: true }, { text: '20' }],
        missingValue: 15,
      };
    case 'math-miss-5':
      return {
        mode: 'sequence',
        items: [{ text: '10' }, { text: '20' }, { text: '30', isMissing: true }, { text: '40' }],
        missingValue: 30,
      };
    case 'math-miss-6':
      return {
        mode: 'equation',
        items: [{ text: '5' }, { text: '+' }, { text: '5', isMissing: true }, { text: '=' }, { text: '10' }],
        missingValue: 5,
      };
    case 'math-miss-7':
      return {
        mode: 'equation',
        items: [{ text: '8' }, { text: '-' }, { text: '3', isMissing: true }, { text: '=' }, { text: '5' }],
        missingValue: 3,
      };
    case 'math-miss-8':
      return {
        mode: 'equation',
        items: [{ text: '3' }, { text: '×' }, { text: '4', isMissing: true }, { text: '=' }, { text: '12' }],
        missingValue: 4,
      };
    default: {
      const match = (item.title || '').match(/(\d+)/);
      const val = match ? parseInt(match[1], 10) : 3;
      return {
        mode: 'sequence',
        items: [{ text: String(val), isMissing: true }],
        missingValue: val,
      };
    }
  }
}

export const MissingNumberPuzzleVisual: React.FC<{
  item: LessonItem;
  size?: number;
  language?: AppLanguage;
}> = ({ item, size = 64, language = 'en' }) => {
  const isDetail = size > 80;
  const spec = parseMissingLesson(item);

  return (
    <View style={[styles.puzzleContainer, isDetail && styles.puzzleContainerDetail]}>
      {/* Top Playful Subtitle Pill in Detail View */}
      {isDetail && (
        <View style={styles.puzzleDetailTag}>
          <Text style={styles.puzzleDetailTagText}>
            {language === 'gu'
              ? '🧩 ખૂટતો અંક શોધો'
              : language === 'hi'
              ? '🧩 छूटी संख्या पहचानें'
              : '🧩 Find the Missing Number'}
          </Text>
        </View>
      )}

      {/* Stepping Stones / Equation Track */}
      <View style={[styles.trackRow, isDetail && styles.trackRowDetail]}>
        {spec.items.map((slot, idx) => {
          const isOp = slot.text === '+' || slot.text === '-' || slot.text === '×' || slot.text === '=';
          if (isOp) {
            return (
              <View key={`op-${idx}`} style={[styles.opBadge, isDetail && styles.opBadgeDetail]}>
                <Text style={[styles.opText, isDetail && styles.opTextDetail]}>{slot.text}</Text>
              </View>
            );
          }

          const displayNum = locNum(slot.text, language);
          if (slot.isMissing) {
            return (
              <View
                key={`slot-${idx}`}
                style={[
                  styles.missingPill,
                  isDetail ? styles.missingPillDetail : styles.missingPillCard,
                  clayShadow(2, '#B45309'),
                ]}
              >
                <Text style={[styles.missingBlankText, isDetail && styles.missingBlankTextDetail]}>
                  ?
                </Text>
              </View>
            );
          }

          return (
            <View
              key={`slot-${idx}`}
              style={[
                styles.normalPill,
                isDetail ? styles.normalPillDetail : styles.normalPillCard,
                clayShadow(1),
              ]}
            >
              <Text style={[styles.normalNumText, isDetail && styles.normalNumTextDetail]}>
                {displayNum}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// -------------------------------------------------------------
// 4. Unified Dispatcher for Lesson Cards & Detail Screens
// -------------------------------------------------------------
export function renderMathCardVisual(
  item: LessonItem,
  size: number = 64,
  language: AppLanguage = 'en'
): React.ReactNode {
  // 1. Currency Coins & Banknotes
  if (item.categoryId === 'math-money') {
    if (item.id === 'money-coin-1') return <RupeeCoinVisual value={1} size={size} language={language} />;
    if (item.id === 'money-coin-2') return <RupeeCoinVisual value={2} size={size} language={language} />;
    if (item.id === 'money-coin-5') return <RupeeCoinVisual value={5} size={size} language={language} />;
    if (item.id === 'money-coin-10') return <RupeeCoinVisual value={10} size={size} language={language} />;
    if (item.id === 'money-note-10') return <RupeeNoteVisual value={10} size={size} language={language} />;
    if (item.id === 'money-note-20') return <RupeeNoteVisual value={20} size={size} language={language} />;
    if (item.id === 'money-note-50') return <RupeeNoteVisual value={50} size={size} language={language} />;
    if (item.id === 'money-note-100') return <RupeeNoteVisual value={100} size={size} language={language} />;
  }

  // 2. Missing Numbers & Sequence Puzzles
  if (item.categoryId === 'math-missing') {
    return <MissingNumberPuzzleVisual item={item} size={size} language={language} />;
  }

  return null;
}

const styles = StyleSheet.create({
  coinWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    backgroundColor: 'transparent',
  },
  coinWrapCard: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  coinWrapDetail: {
    width: 144,
    height: 144,
    borderRadius: 72,
    marginVertical: 6,
  },
  noteWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  noteWrapCard: {
    width: 90,
    height: 48,
    borderRadius: 6,
  },
  noteWrapDetail: {
    width: 264,
    height: 120,
    borderRadius: 10,
    marginVertical: 6,
  },
  puzzleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  puzzleContainerDetail: {
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    width: '100%',
  },
  puzzleDetailTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    marginBottom: 12,
  },
  puzzleDetailTagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  trackRowDetail: {
    gap: 8,
  },
  normalPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  normalPillCard: {
    minWidth: 26,
    height: 32,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  normalPillDetail: {
    minWidth: 50,
    height: 60,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderBottomWidth: 3,
    borderBottomColor: '#94A3B8',
  },
  normalNumText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  normalNumTextDetail: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  missingPill: {
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#F59E0B',
    borderBottomWidth: 4,
    borderBottomColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  missingPillCard: {
    minWidth: 32,
    height: 36,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  missingPillDetail: {
    minWidth: 64,
    height: 66,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  missingBlankText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#B45309',
  },
  missingBlankTextDetail: {
    fontSize: 30,
    fontWeight: '700',
    color: '#78350F',
  },
  missingNumText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
  },
  missingNumTextDetail: {
    fontSize: 26,
    fontWeight: '700',
    color: '#78350F',
  },
  opBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  opBadgeDetail: {
    paddingHorizontal: 6,
  },
  opText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  opTextDetail: {
    fontSize: 24,
    fontWeight: '700',
    color: '#475569',
  },
});

