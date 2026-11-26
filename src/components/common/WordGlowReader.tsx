import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  type StyleProp,
  type ViewStyle
} from 'react-native';
import { AppLanguage } from '../../types';
import { soundEffects } from '../../services/soundEffects';
import { audioService, WordBoundaryEvent } from '../../services/audioService';
import { webStyle } from '../../utils/webStyle';

interface WordGlowReaderProps {
  text: string;
  language: AppLanguage;
  isNarrating?: boolean;
  speechRate?: number;
  onNarrationEnd?: () => void;
  style?: StyleProp<ViewStyle>;
}

interface WordSpan {
  word: string;
  start: number;
  end: number;
}

export const WordGlowReader: React.FC<WordGlowReaderProps> = ({
  text,
  language,
  isNarrating = false,
  speechRate,
  onNarrationEnd,
  style,
}) => {
  const [activeWordIdx, setActiveWordIdx] = useState<number>(-1);
  const [spokenThroughIdx, setSpokenThroughIdx] = useState<number>(-1);
  const [tappedWordIdx, setTappedWordIdx] = useState<number>(-1);

  // Compute exact word spans with start and end character offsets in the source text
  const wordSpans = useMemo<WordSpan[]>(() => {
    if (!text) return [];
    const spans: WordSpan[] = [];
    const regex = /\S+/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      spans.push({
        word: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }
    return spans;
  }, [text]);

  // Fast O(1) character-offset to word-index mapping array
  const charToWordIndex = useMemo(() => {
    if (!text || wordSpans.length === 0) return new Int32Array(0);
    const map = new Int32Array(text.length + 1).fill(-1);
    for (let i = 0; i < wordSpans.length; i++) {
      const span = wordSpans[i];
      for (let c = span.start; c < span.end && c <= text.length; c++) {
        map[c] = i;
      }
      const nextStart = i + 1 < wordSpans.length ? wordSpans[i + 1].start : text.length;
      for (let c = span.end; c < nextStart && c <= text.length; c++) {
        map[c] = i;
      }
    }
    return map;
  }, [text, wordSpans]);

  const activeIdxRef = useRef<number>(-1);
  const isNarratingRef = useRef<boolean>(isNarrating);
  const activeSessionIdRef = useRef<number | null>(null);

  isNarratingRef.current = isNarrating;

  useEffect(() => {
    if (!isNarrating || wordSpans.length === 0) {
      setActiveWordIdx(-1);
      setSpokenThroughIdx(-1);
      activeIdxRef.current = -1;
      activeSessionIdRef.current = null;
      return;
    }

    activeIdxRef.current = -1;
    setActiveWordIdx(-1);
    setSpokenThroughIdx(-1);

    const handleSpeechStart = () => {
      if (!isNarratingRef.current) return;
      activeSessionIdRef.current = null;
      activeIdxRef.current = 0;
      setActiveWordIdx(0);
      setSpokenThroughIdx(0);
    };

    // 100% Audio-Driven Synchronization:
    // The active highlight updates ONLY when the audio emits word boundary events
    const handleBoundary = (evt: WordBoundaryEvent) => {
      if (!isNarratingRef.current || wordSpans.length === 0) return;

      if (typeof evt.sessionId === 'number') {
        if (activeSessionIdRef.current === null || evt.sessionId >= activeSessionIdRef.current) {
          activeSessionIdRef.current = evt.sessionId;
        } else {
          // Genuinely stale event from an older prior playback session; ignore to prevent race condition
          return;
        }
      }

      let targetIdx = -1;
      if (typeof evt.wordIndex === 'number' && evt.wordIndex >= 0) {
        targetIdx = evt.wordIndex;
      } else if (typeof evt.charIndex === 'number' && evt.charIndex >= 0) {
        if (charToWordIndex.length > 0) {
          const clampedChar = Math.min(charToWordIndex.length - 1, Math.max(0, evt.charIndex));
          targetIdx = charToWordIndex[clampedChar];
        }
        if (targetIdx === -1) {
          targetIdx = wordSpans.findIndex((s) => evt.charIndex >= s.start && evt.charIndex < s.end);
        }
      } else if (typeof evt.progress === 'number' && evt.progress >= 0) {
        targetIdx = Math.min(
          wordSpans.length - 1,
          Math.max(0, Math.floor(evt.progress * wordSpans.length))
        );
      }

      if (targetIdx >= 0 && targetIdx < wordSpans.length) {
        if (targetIdx !== activeIdxRef.current) {
          activeIdxRef.current = targetIdx;
          setActiveWordIdx(targetIdx);
          setSpokenThroughIdx(targetIdx);
        }
      }
    };

    const handleSpeechEnd = () => {
      activeIdxRef.current = -1;
      setActiveWordIdx(-1);
      setSpokenThroughIdx(wordSpans.length - 1);
      activeSessionIdRef.current = null;
      onNarrationEnd?.();
    };

    const unsubStart = audioService.addSpeechStartListener(handleSpeechStart);
    const unsubBoundary = audioService.addWordBoundaryListener(handleBoundary);
    const unsubEnd = audioService.addSpeechEndListener(handleSpeechEnd);

    return () => {
      unsubStart();
      unsubBoundary();
      unsubEnd();
    };
  }, [isNarrating, text, wordSpans, charToWordIndex, onNarrationEnd]);

  const handleWordTap = (word: string, index: number) => {
    soundEffects.playBubblePop();
    setTappedWordIdx(index);

    // If whole-scene narration is currently active, cleanly notify parent to reset isNarrating
    if (isNarratingRef.current) {
      audioService.stop();
      activeIdxRef.current = -1;
      setActiveWordIdx(-1);
      activeSessionIdRef.current = null;
      onNarrationEnd?.();
    }

    // Strip trailing punctuation and quotes for clean TTS pronunciation
    const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()?"'–—।|“’”«»]/g, '').trim();
    if (cleanWord) {
      audioService.speak(cleanWord, language);
    }

    setTimeout(() => {
      setTappedWordIdx(-1);
    }, 1200);
  };

  const hintText =
    language === 'gu'
      ? 'કોઈપણ શબ્દ સાંભળવા માટે તેના પર ટેપ કરો'
      : language === 'hi'
        ? 'किसी भी शब्द को सुनने के लिए उस पर टैप करें'
        : 'Tap any word to hear it!';

  return (
    <View style={[styles.container, style]}>
      {/* Interactive Word Glow Paragraph */}
      <View style={styles.wordsWrapper}>
        {wordSpans.map((span, idx) => {
          const w = span.word;
          const isGlowing = isNarrating && idx === activeWordIdx;
          const isTapped = idx === tappedWordIdx;

          return (
            <TouchableOpacity
              key={`w-${idx}-${w}`}
              onPress={() => handleWordTap(w, idx)}
              activeOpacity={0.7}
              style={[
                styles.wordPill,
                isGlowing && styles.glowingPill,
                isTapped && styles.tappedPill,
                isGlowing && webStyle({ boxShadow: '0 4px 14px rgba(128, 98, 245, 0.45)' }),
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Word: ${w}`}
            >
              <Text
                style={[
                  styles.wordText,
                  isGlowing && styles.glowingWordText,
                  isTapped && styles.tappedWordText,
                  !isGlowing && !isTapped && isNarrating && idx <= spokenThroughIdx && styles.spokenWordText,
                ]}
              >
                {w}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Gentle Literacy Helper Tag */}
      <View style={styles.hintContainer}>
        <Text style={styles.hintLabel}>{hintText}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
  },
  wordsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  wordPill: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    marginVertical: 2,
    backgroundColor: 'transparent',
  },
  glowingPill: {
    backgroundColor: '#8062F5',
    transform: [{ scale: 1.08 }],
    shadowColor: '#8062F5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  tappedPill: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    transform: [{ scale: 1.05 }],
  },
  wordText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 28,
  },
  glowingWordText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  tappedWordText: {
    color: '#92400E',
    fontWeight: '900',
  },
  spokenWordText: {
    color: '#64748B',
  },
  hintContainer: {
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8B5CF6',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
});

