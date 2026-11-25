import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing, radii, shadows } from '../theme/spacing';
import { LessonItem } from '../types';
import { audioService } from '../services/audioService';
import { soundEffects } from '../services/soundEffects';
import { backendService } from '../services/backendService';
import { useApp } from '../context/AppContext';
import {
  toGujDigits,
  toHiDigits,
  formatNumberDigits,
  HINDI_TABLE_RECITATION,
  GUJARATI_TABLE_RECITATION,
  ENGLISH_TABLE_RECITATION,
} from '../utils/languageData';
import { Glyph } from './fun';

interface GhadiyaTableViewProps {
  lessons: LessonItem[];
  completedLessonIds: string[];
  onCompleteLesson: (id: string) => void;
  onOpenLessonDetail?: (id: string) => void;
}

const TABLE_THEMES: Record<
  number,
  {
    bg: string;
    cardBg: string;
    border: string;
    accent: string;
    text: string;
    badgeBg: string;
    emoji: string;
  }
> = {
  1: { bg: '#EFF6FF', cardBg: '#F8FAFC', border: '#BFDBFE', accent: '#2563EB', text: '#1E40AF', badgeBg: '#DBEAFE', emoji: '🔢' },
  2: { bg: '#ECFDF5', cardBg: '#F8FAFC', border: '#A7F3D0', accent: '#059669', text: '#065F46', badgeBg: '#D1FAE5', emoji: '✌️' },
  3: { bg: '#FEFCE8', cardBg: '#F8FAFC', border: '#FEF08A', accent: '#D97706', text: '#92400E', badgeBg: '#FEF3C7', emoji: '🌟' },
  4: { bg: '#FAF5FF', cardBg: '#F8FAFC', border: '#E9D5FF', accent: '#7C3AED', text: '#5B21B6', badgeBg: '#F3E8FF', emoji: '🍀' },
  5: { bg: '#FFF7ED', cardBg: '#F8FAFC', border: '#FED7AA', accent: '#EA580C', text: '#9A3412', badgeBg: '#FFEDD5', emoji: '🎈' },
  6: { bg: '#EEF2FF', cardBg: '#F8FAFC', border: '#C7D2FE', accent: '#4F46E5', text: '#3730A3', badgeBg: '#E0E7FF', emoji: '🌈' },
  7: { bg: '#F0FDF4', cardBg: '#F8FAFC', border: '#BBF7D0', accent: '#16A34A', text: '#166534', badgeBg: '#DCFCE7', emoji: '🚀' },
  8: { bg: '#FFF1F2', cardBg: '#F8FAFC', border: '#FECDD3', accent: '#E11D48', text: '#9F1239', badgeBg: '#FFE4E6', emoji: '🏆' },
  9: { bg: '#FDF4FF', cardBg: '#F8FAFC', border: '#F5D0FE', accent: '#9333EA', text: '#6B21A8', badgeBg: '#FAE8FF', emoji: '🎨' },
  10: { bg: '#FFFBEB', cardBg: '#F8FAFC', border: '#FDE68A', accent: '#B45309', text: '#78350F', badgeBg: '#FEF3C7', emoji: '🔟' },
};

export const GhadiyaTableView: React.FC<GhadiyaTableViewProps> = ({
  lessons,
  completedLessonIds,
  onCompleteLesson,
  onOpenLessonDetail,
}) => {
  const { language } = useApp();

  // Available tables from lessons
  const availableTableNums = Array.from(
    new Set(
      lessons.map((l) => {
        const parts = l.id.split('-');
        return parseInt(parts[1], 10) || 1;
      })
    )
  ).sort((a, b) => a - b);

  const tableList = availableTableNums.length > 0 ? availableTableNums : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const [selectedTable, setSelectedTable] = useState<number | 'all'>(tableList[0] || 1);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tableLessonsMap = tableList.reduce((acc, tNum) => {
    acc[tNum] = lessons.filter((l) => l.id.startsWith(`ghadiya-${tNum}-`));
    return acc;
  }, {} as Record<number, LessonItem[]>);

  useEffect(() => {
    if (selectedTable !== 'all' && !tableList.includes(selectedTable)) {
      setSelectedTable(tableList[0] || 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessons]);

  const activeTable =
    selectedTable === 'all'
      ? 'all'
      : tableList.includes(selectedTable)
      ? selectedTable
      : tableList[0] || 1;

  useEffect(() => {
    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
    };
  }, []);

  const stopAutoPlay = () => {
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
    setIsAutoPlaying(false);
    setActiveRowId(null);
  };

  const getRowPrompt = (tNum: number, rIndex: number, item: LessonItem) => {
    const rowNum = rIndex + 1;
    if (language === 'hi') {
      const entry = HINDI_TABLE_RECITATION[tNum]?.[rowNum];
      return {
        text: entry?.text || `${toHiDigits(tNum)} गुना ${toHiDigits(rowNum)} बराबर ${toHiDigits(tNum * rowNum)}`,
        audio: entry?.audio || `${toHiDigits(tNum)} गुना ${toHiDigits(rowNum)} बराबर ${toHiDigits(tNum * rowNum)}`,
        lang: 'hi' as const,
      };
    }
    if (language === 'gu') {
      const entry = GUJARATI_TABLE_RECITATION[tNum]?.[rowNum];
      return {
        text: entry?.text || item.title || `${toGujDigits(tNum)} એકા ${toGujDigits(tNum * rowNum)}`,
        audio: item.audioPromptGu || entry?.audio || `${toGujDigits(tNum)} ગુણ્યા ${toGujDigits(rowNum)} બરાબર ${toGujDigits(tNum * rowNum)}`,
        lang: 'gu' as const,
      };
    }
    const entry = ENGLISH_TABLE_RECITATION[tNum]?.[rowNum];
    return {
      text: entry?.text || `${tNum} times ${rowNum} is ${tNum * rowNum}`,
      audio: entry?.audio || `${tNum} times ${rowNum} is ${tNum * rowNum}`,
      lang: 'en' as const,
    };
  };

  const playSingleRow = (item: LessonItem, tNum: number, rIndex: number) => {
    stopAutoPlay();
    setActiveRowId(item.id);
    soundEffects.playBubblePop();
    const promptInfo = getRowPrompt(tNum, rIndex, item);
    audioService.speak(promptInfo.audio, promptInfo.lang);
    onCompleteLesson(item.id);
    backendService.syncLessonProgress(item.id);
  };

  const startAutoPlay = (tNum: number) => {
    const tableRows = tableLessonsMap[tNum] || [];
    if (tableRows.length === 0) return;

    stopAutoPlay();
    setIsAutoPlaying(true);
    soundEffects.playBubblePop();

    let step = 0;
    const playNext = () => {
      if (step >= tableRows.length) {
        setIsAutoPlaying(false);
        setActiveRowId(null);
        soundEffects.playTadaaa();
        return;
      }

      const currentItem = tableRows[step];
      setActiveRowId(currentItem.id);
      const promptInfo = getRowPrompt(tNum, step, currentItem);
      audioService.speak(promptInfo.audio, promptInfo.lang);
      onCompleteLesson(currentItem.id);
      backendService.syncLessonProgress(currentItem.id);

      step++;
      autoPlayTimerRef.current = setTimeout(playNext, 2500);
    };

    playNext();
  };

  const renderTableCard = (tNum: number) => {
    const tableRows = tableLessonsMap[tNum] || [];
    const theme = TABLE_THEMES[tNum] || TABLE_THEMES[1];
    const completedRowsCount = tableRows.filter((r) => completedLessonIds.includes(r.id)).length;

    const tableTitleText =
      language === 'gu'
        ? `${toGujDigits(tNum)} નો ઘડિયો`
        : language === 'hi'
        ? `${toHiDigits(tNum)} का पहाड़ा`
        : `Table of ${tNum}`;

    const tableSubText =
      language === 'gu'
        ? `${toGujDigits(completedRowsCount)}/${toGujDigits(tableRows.length)} પૂર્ણ કર્યા`
        : language === 'hi'
        ? `${toHiDigits(completedRowsCount)}/${toHiDigits(tableRows.length)} पूरे किए`
        : `${completedRowsCount}/${tableRows.length} completed`;

    const autoPlayLabel = isAutoPlaying && selectedTable === tNum
      ? language === 'gu' ? '⏹️ રોકો' : language === 'hi' ? '⏹️ रोकें' : '⏹️ Stop'
      : language === 'gu' ? '🎶 સળંગ ગાઓ' : language === 'hi' ? '🎶 लगातार गाएं' : '🎶 Chant All';

    return (
      <View
        key={`table-card-${tNum}`}
        style={[
          styles.tableCard,
          { borderColor: theme.border, backgroundColor: '#FFFFFF' },
          shadows.card,
        ]}
      >
        {/* 3D Cheerful Table Card Header */}
        <View style={[styles.tableCardHeader, { backgroundColor: theme.bg }]}>
          <View style={styles.headerLeftCol}>
            <View style={[styles.tableNumBadge, { backgroundColor: theme.accent }]}>
              <Text style={styles.tableNumBadgeText}>{formatNumberDigits(tNum, language)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.tableTitleRow}>
                <Text style={[styles.tableTitle, { color: theme.text }]} numberOfLines={1}>
                  {tableTitleText}
                </Text>
                <View style={[styles.tableSubBadge, { backgroundColor: theme.badgeBg }]}>
                  <Text style={[styles.tableSubBadgeText, { color: theme.accent }]}>
                    {theme.emoji}
                  </Text>
                </View>
              </View>
              <Text style={styles.tableSubtitle} numberOfLines={1}>{tableSubText}</Text>
            </View>
          </View>

          {/* Cheerful Auto Chant Button */}
          <TouchableOpacity
            style={[
              styles.autoPlayBtn,
              isAutoPlaying && selectedTable === tNum
                ? styles.autoPlayBtnActive
                : { backgroundColor: theme.accent },
              shadows.soft,
            ]}
            onPress={() => {
              if (isAutoPlaying) {
                stopAutoPlay();
              } else {
                startAutoPlay(tNum);
              }
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.autoPlayBtnText}>{autoPlayLabel}</Text>
          </TouchableOpacity>
        </View>

        {/* Structured Playful Table */}
        <View style={styles.tableContainer}>
          {/* Playful Table Column Headers */}
          <View style={styles.tableHeadRow}>
            <View style={styles.colIndex}>
              <Text style={styles.colHeadText}>#</Text>
            </View>
            <View style={styles.colEquation}>
              <Text style={styles.colHeadText}>
                {language === 'gu' ? '🔢 ગણતરી' : language === 'hi' ? '🔢 गणना' : '🔢 Equation'}
              </Text>
            </View>
            <View style={styles.colRecite}>
              <Text style={styles.colHeadText}>
                {language === 'gu' ? '🗣️ ઉચ્ચાર' : language === 'hi' ? '🗣️ उच्चारण' : '🗣️ Chant'}
              </Text>
            </View>
            <View style={styles.colSound}>
              <Glyph name="volume" size={14} color="#64748B" strokeWidth={2.8} />
            </View>
          </View>

          {/* Interactive Tactile Rows */}
          <View style={styles.rowsWrapper}>
            {tableRows.map((rowItem, rIndex) => {
              const isCompleted = completedLessonIds.includes(rowItem.id);
              const isActive = activeRowId === rowItem.id;
              const rNum = rIndex + 1;

              const promptInfo = getRowPrompt(tNum, rIndex, rowItem);

              return (
                <TouchableOpacity
                  key={rowItem.id}
                  style={[
                    styles.tactileRowCard,
                    isActive && [styles.rowActiveGlow, { borderColor: theme.accent, backgroundColor: '#FEF9C3' }],
                  ]}
                  onPress={() => playSingleRow(rowItem, tNum, rIndex)}
                  activeOpacity={0.75}
                >
                  {/* 1. Row Index Circle Badge */}
                  <View style={styles.colIndex}>
                    <View
                      style={[
                        styles.indexCircle,
                        isActive
                          ? { backgroundColor: theme.accent }
                          : { backgroundColor: '#F1F5F9' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.indexCircleText,
                          isActive && { color: '#FFFFFF', fontWeight: 'bold' },
                        ]}
                      >
                        {formatNumberDigits(rNum, language)}
                      </Text>
                    </View>
                  </View>

                  {/* 2. Playful Equation Blocks [ 2 ] ✖️ [ 1 ] 🟰 [ 2 ] */}
                  <View style={styles.colEquation}>
                    <View style={styles.equationBlocksRow}>
                      <View style={[styles.equationNumBox, { backgroundColor: theme.badgeBg }]}>
                        <Text style={[styles.equationNumText, { color: theme.text }]}>
                          {formatNumberDigits(tNum, language)}
                        </Text>
                      </View>
                      <Text style={styles.equationOperator}>×</Text>
                      <View style={[styles.equationNumBox, { backgroundColor: '#F1F5F9' }]}>
                        <Text style={styles.equationNumText}>
                          {formatNumberDigits(rNum, language)}
                        </Text>
                      </View>
                      <Text style={styles.equationOperator}>=</Text>
                      <View style={[styles.equationResultBox, { backgroundColor: theme.accent }]}>
                        <Text style={styles.equationResultText}>
                          {formatNumberDigits(tNum * rNum, language)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* 3. Recitation Bubble */}
                  <View style={styles.colRecite}>
                    <View
                      style={[
                        styles.reciteBubble,
                        isActive && { backgroundColor: '#FFFFFF', borderColor: '#F59E0B' },
                      ]}
                    >
                      <View style={styles.reciteBubbleQuote}>
                        <Glyph name="volume" size={10} color="#F59E0B" strokeWidth={2.8} />
                      </View>
                      <Text
                        style={[
                          styles.reciteText,
                          isActive && { color: '#B45309', fontWeight: '800' },
                        ]}
                        numberOfLines={1}
                      >
                        {promptInfo.text}
                      </Text>
                      {isCompleted && (
                        <View style={styles.starBadge}>
                          <Glyph name="star" size={11} color="#F59E0B" strokeWidth={2.4} />
                        </View>
                      )}
                    </View>
                  </View>

                  {/* 4. Speaker Audio Indicator */}
                  <View style={styles.colSound}>
                    <View
                      style={[
                        styles.speakerMiniBtn,
                        isActive
                          ? { backgroundColor: theme.accent }
                          : { backgroundColor: '#EFF6FF' },
                        shadows.soft,
                      ]}
                    >
                      <Glyph name="volume" size={14} color={isActive ? '#FFFFFF' : '#3B82F6'} strokeWidth={2.8} />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Cheerful Table Footer Encouragement */}
        <View style={[styles.tableFooterBar, { backgroundColor: theme.bg }]}>
          <View style={styles.tableFooterEmoji}>
            <Glyph name="sparkle" size={14} color={theme.accent} strokeWidth={2.8} />
          </View>
          <Text style={styles.tableFooterText}>
            {language === 'gu'
              ? `ખૂબ સરસ! ${toGujDigits(completedRowsCount)}/૧૦ લાઈન બોલાઈ ગઈ!`
              : language === 'hi'
              ? `शाबाश! ${toHiDigits(completedRowsCount)}/१० पंक्तियाँ पूरी हुईं!`
              : `Great job! ${completedRowsCount}/10 rows practiced!`}
          </Text>
        </View>
      </View>
    );
  };

  const tabsHeadingText =
    language === 'gu'
      ? 'ઘડિયો પસંદ કરો:'
      : language === 'hi'
      ? 'पहाड़ा चुनें:'
      : 'Select Table:';

  const minTable = tableList[0] || 1;
  const maxTable = tableList[tableList.length - 1] || 10;
  const allTablesTabText =
    tableList.length <= 1
      ? language === 'gu'
        ? `📚 ${toGujDigits(minTable)} નો ઘડિયો`
        : language === 'hi'
        ? `📚 ${toHiDigits(minTable)} का पहाड़ा`
        : `📚 Table of ${minTable}`
      : language === 'gu'
      ? `📚 બધા ઘડિયા (${toGujDigits(minTable)} થી ${toGujDigits(maxTable)})`
      : language === 'hi'
      ? `📚 सभी पहाड़े (${toHiDigits(minTable)} से ${toHiDigits(maxTable)})`
      : `📚 All Tables (${minTable} to ${maxTable})`;

  return (
    <View style={styles.wrapper}>
      {/* 3D Toy-like Selector Pills */}
      <View style={styles.tabsWrapper}>
        <Text style={styles.tabsHeading}>{tabsHeadingText}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
          nestedScrollEnabled={true}
          directionalLockEnabled={true}
          keyboardShouldPersistTaps="handled"
        >
          {tableList.map((tNum) => {
            const isSelected = activeTable === tNum;
            const theme = TABLE_THEMES[tNum] || TABLE_THEMES[1];

            const pillText =
              language === 'gu'
                ? `${toGujDigits(tNum)} નો ઘડિયો`
                : language === 'hi'
                ? `${toHiDigits(tNum)} का पहाड़ा`
                : `Table of ${tNum}`;

            return (
              <TouchableOpacity
                key={`tab-${tNum}`}
                style={[
                  styles.tabPill,
                  { borderColor: theme.border, backgroundColor: theme.bg },
                  isSelected && [
                    styles.tabPillSelected,
                    { backgroundColor: theme.accent, borderColor: theme.accent },
                  ],
                ]}
                onPress={() => {
                  stopAutoPlay();
                  setSelectedTable(tNum);
                  soundEffects.playBubblePop();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.tabPillEmoji}>{theme.emoji}</Text>
                <Text
                  style={[
                    styles.tabPillText,
                    { color: theme.text },
                    isSelected && styles.tabPillTextSelected,
                  ]}
                >
                  {pillText}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* All Tables Tab */}
          <TouchableOpacity
            style={[
              styles.tabPill,
              { backgroundColor: '#F3E8FF', borderColor: '#D8B4FE' },
              activeTable === 'all' && [
                styles.tabPillSelected,
                { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
              ],
            ]}
            onPress={() => {
              stopAutoPlay();
              setSelectedTable('all');
              soundEffects.playBubblePop();
            }}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabPillText,
                { color: '#6B21A8' },
                activeTable === 'all' && styles.tabPillTextSelected,
              ]}
            >
              {allTablesTabText}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Cheerful Audio Chanting Tip Box */}
      <View style={[styles.tipCard, shadows.soft]}>
        <View style={styles.tipIcon}>
          <Glyph name="info" size={18} color="#F59E0B" strokeWidth={2.8} />
        </View>
        <Text style={styles.tipText}>
          {language === 'gu'
            ? 'રોજ સવારે એક વાર ઘડિયો મોટેથી બોલવાથી ગણિત એકદમ પાકું થઈ જશે! 🌟'
            : language === 'hi'
            ? 'रोज़ सुबह एक बार पहाड़ा ज़ोर से बोलने से गणित बहुत आसान हो जाएगा! 🌟'
            : 'Chant tables out loud once every morning to master quick mental math! 🌟'}
        </Text>
      </View>

      {/* Render Single Table or All Tables */}
      <View style={styles.tablesContainer}>
        {activeTable === 'all' ? (
          tableList.map((tNum) => renderTableCard(tNum))
        ) : (
          renderTableCard(activeTable)
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  tabsWrapper: {
    marginBottom: spacing.sm,
  },
  tabsHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    paddingHorizontal: 2,
  },
  tabsScrollContent: {
    paddingVertical: spacing.xs,
    paddingHorizontal: 2,
    paddingRight: spacing.xl,
    gap: 6,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 3,
    borderRadius: radii.full,
    borderWidth: 1.5,
    marginRight: 4,
    ...shadows.soft,
  },
  tabPillSelected: {
    ...shadows.card,
    transform: [{ scale: 1.02 }],
  },
  tabPillEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  tabPillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderRadius: radii.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 3,
    marginBottom: spacing.md,
  },
  tipIcon: {
    marginRight: spacing.xs + 2,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    lineHeight: 16,
  },
  tablesContainer: {
    gap: spacing.lg,
    paddingBottom: 70,
  },
  tableCard: {
    borderRadius: radii.card + 4,
    borderWidth: 2,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  tableCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1.5,
    borderBottomColor: '#E2E8F0',
    gap: 6,
  },
  headerLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    flex: 1,
  },
  tableNumBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...shadows.soft,
  },
  tableNumBadgeText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  tableTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tableTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  tableSubBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: radii.full,
  },
  tableSubBadgeText: {
    fontSize: 11,
  },
  tableSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 1,
  },
  autoPlayBtn: {
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
  },
  autoPlayBtnActive: {
    backgroundColor: '#DC2626',
  },
  autoPlayBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  tableContainer: {
    width: '100%',
    padding: 4,
  },
  tableHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: radii.sm,
    marginBottom: 4,
  },
  colHeadText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  colIndexHeader: {},
  colEquationHeader: {},
  colReciteHeader: {},
  colSoundHeader: {},
  colIndex: {
    width: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colEquation: {
    width: 102,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colRecite: {
    flex: 1,
    paddingHorizontal: 3,
    justifyContent: 'center',
  },
  colSound: {
    width: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowsWrapper: {
    gap: 4,
  },
  tactileRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: radii.sm + 4,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    ...shadows.soft,
  },
  rowActiveGlow: {
    borderLeftWidth: 5,
    ...shadows.card,
    transform: [{ scale: 1.01 }],
  },
  indexCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexCircleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  equationBlocksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  equationNumBox: {
    minWidth: 22,
    height: 24,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  equationNumText: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  equationOperator: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    marginHorizontal: 1,
  },
  equationResultBox: {
    minWidth: 25,
    height: 24,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  equationResultText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  reciteBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: radii.full,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reciteBubbleQuote: {
    marginRight: 3,
  },
  reciteText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    flexShrink: 1,
  },
  starBadge: {
    marginLeft: 3,
  },
  speakerMiniBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableFooterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs + 3,
    paddingHorizontal: spacing.sm,
    borderTopWidth: 1.5,
    borderTopColor: '#E2E8F0',
    gap: spacing.xs,
  },
  tableFooterEmoji: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableFooterText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },
});
