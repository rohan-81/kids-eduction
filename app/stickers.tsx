import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TouchableOpacity, Platform, Animated, useWindowDimensions, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../src/context/AppContext';
import { Header } from '../src/components/Header';
import { soundEffects } from '../src/services/soundEffects';
import { audioService } from '../src/services/audioService';
import { apiService } from '../src/services/apiService';
import { ConfettiCelebration } from '../src/components/common/ConfettiCelebration';
import { ClayButton, ClayCard, ProgressRing } from '../src/components/clay';
import {
  STICKER_CATALOG,
  STARTER_UNLOCKED_STICKER_IDS,
  StickerItem,
  getStickerName,
  getStickerCategories,
  getStickerCategoryMeta,
} from '../src/data/stickersData';
import { formatNumberDigits } from '../src/utils/languageData';
import { kidTones, kidPalette, kidRadii, clayShadow, toneAt, CLAY_DEPTH, KidTone } from '../src/theme/kidTheme';
import { AppLanguage } from '../src/types';
import { HOME_CARD_ART, STICKER_IMAGE_MAP, getStickerImage } from '../src/utils/imageHelper';
import * as Art from '../src/components/art3d/Art3D';
import { AppGlobalBackground } from '../src/components/common/AppGlobalBackground';
import { Remote3DImage } from '../src/components/common/Remote3DImage';
import { webStyle } from '../src/utils/webStyle';
import type { TimerHandle } from '../src/utils/runtime';

const SEEN_KEY = '@kidszone_seen_unlocked_stickers';
const useNative = Platform.OS !== 'web';

type Tri = { gu: string; hi: string; en: string };
const tr = (lang: AppLanguage, s: Tri) => (lang === 'gu' ? s.gu : lang === 'hi' ? s.hi : s.en);

interface StickerCardProps {
  sticker: StickerItem;
  name: string;
  unlocked: boolean;
  selected: boolean;
  isNew: boolean;
  tone: KidTone;
  index: number;
  width: number;
  onPress: () => void;
}

/** One collectible: springs in, presses down onto its 3D lip, wiggles when newly unlocked. */
const StickerCard: React.FC<StickerCardProps> = ({ sticker, name, unlocked, selected, isNew, tone, index, width, onPress }) => {
  const spec = kidTones[tone];
  const enter = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(0)).current;
  const wiggle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    enter.setValue(0);
    Animated.spring(enter, {
      toValue: 1,
      delay: Math.min(index * 18, 140),
      friction: 7,
      tension: 180,
      useNativeDriver: useNative,
    }).start();
  }, [sticker.id, index, enter]);

  useEffect(() => {
    if (!isNew) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(wiggle, { toValue: 1, duration: 140, useNativeDriver: useNative }),
        Animated.timing(wiggle, { toValue: -1, duration: 140, useNativeDriver: useNative }),
        Animated.timing(wiggle, { toValue: 0, duration: 140, useNativeDriver: useNative }),
        Animated.delay(1400),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isNew, wiggle]);

  const scale = enter.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });
  const translateY = press.interpolate({ inputRange: [0, 1], outputRange: [0, CLAY_DEPTH - 1] });
  const rotate = wiggle.interpolate({ inputRange: [-1, 1], outputRange: ['-8deg', '8deg'] });
  const stickerImg = getStickerImage(sticker.id) || getStickerImage(sticker.emoji);

  const faceBg = unlocked ? (selected ? spec.tint : kidPalette.surface) : '#F1F5F9';
  const borderColor = selected ? spec.fill : unlocked ? spec.tintBorder : kidPalette.border;
  const lipColor = unlocked ? (selected ? spec.edge : spec.tintBorder) : '#CBD5E1';

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => Animated.timing(press, { toValue: 1, duration: 70, useNativeDriver: useNative }).start()}
      onPressOut={() => Animated.spring(press, { toValue: 0, friction: 4, tension: 160, useNativeDriver: useNative }).start()}
      accessibilityRole="button"
      accessibilityLabel={`${name}${unlocked ? '' : ' (locked)'}`}
      style={[{ width, height: width + CLAY_DEPTH + 26 }, webStyle({ cursor: 'pointer' })]}
    >
      <Animated.View style={{ flex: 1, opacity: enter, transform: [{ scale }] }}>
        <View style={[styles.cardLip, { top: CLAY_DEPTH, backgroundColor: lipColor }]} />
        <Animated.View
          style={[
            styles.cardFace,
            { backgroundColor: faceBg, borderColor, borderWidth: selected ? 2.5 : 1.5, transform: [{ translateY }] },
            !unlocked && styles.cardFaceLocked,
          ]}
        >
          {isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>{'NEW'}</Text>
            </View>
          )}
          <View style={styles.corner}>
            <Text style={{ fontSize: 13 }}>{unlocked ? '⭐' : '🔒'}</Text>
          </View>
          {stickerImg ? (
            <Animated.View
              style={[
                styles.cardImageWrap,
                !unlocked && styles.cardEmojiLocked,
                { transform: [{ rotate }] },
              ]}
            >
              <Remote3DImage
                source={stickerImg}
                style={{ width: Math.round(width * 0.44), height: Math.round(width * 0.44) }}
                contentFit="contain"
                fallback={
                  <Text style={[styles.cardEmoji, { fontSize: Math.round(width * 0.42), marginBottom: 0 }]}>
                    {sticker.emoji === '🪄' ? '✨' : sticker.emoji}
                  </Text>
                }
              />
            </Animated.View>
          ) : (
            <Animated.Text
              style={[styles.cardEmoji, { fontSize: Math.round(width * 0.42) }, !unlocked && styles.cardEmojiLocked, { transform: [{ rotate }] }]}
            >
              {sticker.emoji === '🪄' ? '✨' : sticker.emoji}
            </Animated.Text>
          )}
          <Text
            style={[styles.cardName, !unlocked && styles.cardNameLocked, selected && { color: spec.text }]}
            numberOfLines={1}
          >
            {name}
          </Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

export default function StickerAlbumScreen() {
  const { progress, language } = useApp();
  const { width: screenW } = useWindowDimensions();

  // Catalogue: bundled immediately, replaced by the Django API (/api/rewards/stickers/).
  const [catalog, setCatalog] = useState<StickerItem[]>(STICKER_CATALOG);
  const [activeCategory, setActiveCategory] = useState<string>(STICKER_CATALOG[0]?.category || 'animals');
  const [selectedId, setSelectedId] = useState<string>(STICKER_CATALOG[0]?.id || '');
  const [showConfetti, setShowConfetti] = useState(false);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const previewScale = useRef(new Animated.Value(1)).current;
  const confettiTimerRef = useRef<TimerHandle | null>(null);

  useEffect(() => {
    return () => {
      if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current);
    };
  }, []);

  // Silence all audio immediately when this screen loses focus or user navigates to another page
  useFocusEffect(
    useCallback(() => {
      return () => {
        if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current);
        audioService.stop();
        soundEffects.stopAnimalSound();
      };
    }, [])
  );

  useEffect(() => {
    let cancelled = false;
    apiService.fetchStickers().then((list) => {
      if (cancelled || list.length === 0) return;
      setCatalog(list);
      const cats = getStickerCategories(list);
      setActiveCategory((cur) => (cats.includes(cur) ? cur : cats[0]));
      setSelectedId((cur) => (list.some((s) => s.id === cur) ? cur : list[0].id));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const unlockedIds = useMemo(() => {
    const ids = new Set<string>([...STARTER_UNLOCKED_STICKER_IDS, ...(progress.unlockedStickers || [])]);
    catalog.forEach((s) => s.defaultUnlocked && ids.add(s.id));
    return ids;
  }, [catalog, progress.unlockedStickers]);

  // Celebrate stickers unlocked since the last visit to the album.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let seen: string[] | null = null;
      try {
        const raw = await AsyncStorage.getItem(SEEN_KEY);
        seen = raw ? JSON.parse(raw) : null;
      } catch { }
      const current = catalog.filter((s) => unlockedIds.has(s.id)).map((s) => s.id);
      if (cancelled) return;
      if (seen) {
        const fresh = current.filter((id) => !seen!.includes(id));
        if (fresh.length > 0) {
          setNewIds(new Set(fresh));
          setShowConfetti(true);
          soundEffects.playTadaaa();
          if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current);
          confettiTimerRef.current = setTimeout(() => setShowConfetti(false), 2200);
        }
      }
      try {
        await AsyncStorage.setItem(SEEN_KEY, JSON.stringify(current));
      } catch { }
    })();
    return () => {
      cancelled = true;
    };
  }, [catalog, unlockedIds]);

  const categories = useMemo(() => getStickerCategories(catalog), [catalog]);
  const categoryStickers = catalog.filter((s) => s.category === activeCategory);
  const totalCount = catalog.length;
  const unlockedCount = catalog.filter((s) => unlockedIds.has(s.id)).length;
  const ratio = totalCount > 0 ? unlockedCount / totalCount : 0;
  const selected = catalog.find((s) => s.id === selectedId) || catalog[0];
  const isSelectedUnlocked = selected ? unlockedIds.has(selected.id) : false;
  const selectedTone = toneAt(Math.max(0, categories.indexOf(selected?.category || '')));

  // Responsive grid: 3 columns on phones, 4 when the 560px column has room.
  const contentW = Math.min(screenW, 560) - 32;
  const cols = contentW >= 480 ? 4 : 3;
  const gap = 12;
  const cardW = Math.floor((contentW - gap * (cols - 1)) / cols);

  const handleSelect = (sticker: StickerItem) => {
    soundEffects.playBubblePop();
    setSelectedId(sticker.id);
    previewScale.setValue(0.85);
    Animated.spring(previewScale, { toValue: 1, friction: 6, tension: 180, useNativeDriver: useNative }).start();

    const name = getStickerName(sticker, language);
    if (unlockedIds.has(sticker.id)) {
      audioService.speak(
        tr(language, { gu: `${name}! બહુ સરસ સ્ટીકર!`, hi: `${name}! बहुत सुंदर स्टिकर!`, en: `${name}! Awesome sticker!` }),
        language
      );
    } else {
      audioService.speak(
        tr(language, {
          gu: `આ ${name} અનલૉક કરવા દૈનિક જાદુઈ બોક્સ ખોલો અથવા પાઠ પૂરા કરો!`,
          hi: `यह ${name} अनलॉक करने के लिए दैनिक जादुई बॉक्स खोलें या पाठ पूरे करें!`,
          en: `Open the Daily Mystery Box or complete lessons to unlock ${name}!`,
        }),
        language
      );
    }
  };

  const handleCheer = () => {
    soundEffects.playTadaaa();
    setShowConfetti(true);
    audioService.speak(
      tr(language, {
        gu: 'શાબાશ! તમે સરસ સ્ટીકરો એકત્ર કર્યા છે!',
        hi: 'शाबाश! आपने बहुत अच्छे स्टिकर इकट्ठे किए हैं!',
        en: 'Super star! You collected fantastic stickers!',
      }),
      language
    );
    if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current);
    confettiTimerRef.current = setTimeout(() => setShowConfetti(false), 2200);
  };

  const headerTitle = tr(language, { gu: 'મેજિકલ સ્ટીકર આલ્બમ', hi: 'मैजिकल स्टिकर एल्बम', en: 'Sticker Album' });

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppGlobalBackground id="stickersBgGrad" />
      <Header title={headerTitle} showBack={true} showStars={true} backHref="/rewards" />
      <ConfettiCelebration visible={showConfetti} language={language} speakPraise={false} />

      <ScrollView
        nestedScrollEnabled={true}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.column}>
          {/* Hero: collection progress */}
          <ClayCard tone="lavender" elevation={3} style={styles.hero}>
            <ProgressRing value={ratio} size={78} stroke={9} tone="lavender">
              <Image source={HOME_CARD_ART.storybook} resizeMode="contain" style={{ width: 46, height: 46 }} />
            </ProgressRing>
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>
                {tr(language, { gu: 'તમારો સ્ટીકર ખજાનો', hi: 'आपका स्टिकर खजाना', en: 'My Sticker Collection' })}
              </Text>
              <Text style={styles.heroCount}>
                {formatNumberDigits(unlockedCount, language)} / {formatNumberDigits(totalCount, language)}
                <Text style={styles.heroCountSub}>
                  {'  '}
                  {tr(language, { gu: 'મેળવ્યા', hi: 'जीते', en: 'collected' })} ({formatNumberDigits(Math.round(ratio * 100), language)}%)
                </Text>
              </Text>
              <Text style={styles.heroTip}>
                {tr(language, {
                  gu: 'સ્ટીકર પર ટૅપ કરીને તેનું નામ સાંભળો!',
                  hi: 'स्टिकर पर टैप करके उसका नाम सुनें!',
                  en: 'Tap a sticker to hear its name!',
                })}
              </Text>
            </View>
            <ClayButton tone="sun" size="sm" onPress={handleCheer} sound={false} accessibilityLabel="Cheer" style={styles.cheerBtn}>
              <Art.StarArt size={29} />
            </ClayButton>
          </ClayCard>

          {/* Showcase of the selected sticker */}
          {selected && (
            <Animated.View style={{ transform: [{ scale: previewScale }] }}>
              <ClayCard tone={isSelectedUnlocked ? selectedTone : 'plain'} style={styles.showcase}>
                <View
                  style={[
                    styles.showcaseBubble,
                    { backgroundColor: kidPalette.surface, borderColor: kidTones[selectedTone].tintBorder },
                    clayShadow(1),
                  ]}
                >
                  {getStickerImage(selected.id) || getStickerImage(selected.emoji) ? (
                    <Remote3DImage
                      source={getStickerImage(selected.id) || getStickerImage(selected.emoji)}
                      style={[
                        styles.showcaseImage,
                        !isSelectedUnlocked && styles.cardEmojiLocked,
                      ]}
                      contentFit="contain"
                      fallback={
                        <Text style={[styles.showcaseEmoji, !isSelectedUnlocked && styles.cardEmojiLocked]}>
                          {selected.emoji === '🪄' ? '✨' : selected.emoji}
                        </Text>
                      }
                    />
                  ) : (
                    <Text style={[styles.showcaseEmoji, !isSelectedUnlocked && styles.cardEmojiLocked]}>
                      {selected.emoji === '🪄' ? '✨' : selected.emoji}
                    </Text>
                  )}
                </View>
                <View style={styles.showcaseText}>
                  <Text style={styles.showcaseTitle} numberOfLines={1}>
                    {getStickerName(selected, language)} {isSelectedUnlocked ? '✅' : '🔒'}
                  </Text>
                  <Text style={styles.showcaseStatus} numberOfLines={2}>
                    {isSelectedUnlocked
                      ? tr(language, {
                        gu: 'તમારા આલ્બમમાં છે! સાંભળવા ટૅપ કરો.',
                        hi: 'आपके एल्बम में है! सुनने के लिए टैप करें।',
                        en: 'In your album! Tap to listen.',
                      })
                      : tr(language, {
                        gu: 'દૈનિક જાદુઈ બોક્સ અથવા પાઠથી અનલૉક કરો!',
                        hi: 'दैनिक जादुई बॉक्स या पाठ से अनलॉक करें!',
                        en: 'Unlock via the Daily Mystery Box or lessons!',
                      })}
                  </Text>
                </View>
                <ClayButton
                  tone={selectedTone}
                  size="sm"
                  sound={false}
                  onPress={() => handleSelect(selected)}
                  accessibilityLabel="Play sound"
                  style={styles.showcasePlayBtn}
                >
                  <Art.MegaphoneArt size={29} />
                </ClayButton>
              </ClayCard>
            </Animated.View>
          )}

          {/* Category tabs, built from the catalogue so new backend categories appear automatically */}
          <ScrollView
            horizontal
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            style={styles.tabsScroll}
            contentContainerStyle={styles.tabsRow}
          >
            {categories.map((cat, i) => {
              const meta = getStickerCategoryMeta(cat, language);
              const active = cat === activeCategory;
              const tone = toneAt(i);
              const spec = kidTones[tone];
              return (
                <TouchableOpacity
                  key={cat}
                  activeOpacity={0.8}
                  onPress={() => {
                    soundEffects.playBubblePop();
                    setActiveCategory(cat);
                  }}
                  style={[
                    styles.tab,
                    active
                      ? [styles.tabActive, { backgroundColor: spec.fill, borderBottomColor: spec.edge }]
                      : styles.tabInactive,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={meta.label}
                  accessibilityState={{ selected: active }}
                >
                  <Text style={styles.tabIcon}>{meta.icon}</Text>
                  <Text
                    style={[
                      styles.tabText,
                      { color: active ? spec.onFill : kidTones[tone].text },
                    ]}
                  >
                    {meta.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Sticker grid */}
          <View style={[styles.grid, { gap }]}>
            {categoryStickers.map((stk, i) => (
              <StickerCard
                key={stk.id}
                sticker={stk}
                name={getStickerName(stk, language)}
                unlocked={unlockedIds.has(stk.id)}
                selected={selected?.id === stk.id}
                isNew={newIds.has(stk.id)}
                tone={toneAt(Math.max(0, categories.indexOf(stk.category)))}
                index={i}
                width={cardW}
                onPress={() => handleSelect(stk)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    padding: 16,
    paddingBottom: 56,
  },
  column: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    gap: 14,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroRingEmoji: {
    fontSize: 30,
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: kidPalette.ink,
  },
  heroCount: {
    fontSize: 22,
    fontWeight: '700',
    color: kidTones.lavender.text,
    marginTop: 2,
  },
  heroCountSub: {
    fontSize: 13,
    fontWeight: '600',
    color: kidPalette.inkMuted,
  },
  heroTip: {
    fontSize: 12.5,
    fontWeight: '700',
    color: kidPalette.inkMuted,
    marginTop: 4,
  },
  cheerBtn: {
    width: 56,
  },
  showcase: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  showcaseBubble: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  showcaseEmoji: {
    fontSize: 42,
  },
  showcaseText: {
    flex: 1,
    minWidth: 0,
    paddingRight: 6,
  },
  showcasePlayBtn: {
    width: 56,
    flexShrink: 0,
  },
  showcaseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: kidPalette.ink,
  },
  showcaseStatus: {
    fontSize: 13,
    fontWeight: '700',
    color: kidPalette.inkMuted,
    marginTop: 2,
  },
  tabsScroll: {
    width: '100%',
    flexGrow: 0,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: kidRadii.pill,
    minWidth: 116,
    height: 44,
    flexShrink: 0,
  },
  tabActive: {
    borderBottomWidth: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  tabInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderBottomWidth: 3,
    borderBottomColor: '#CBD5E1',
  },
  tabIcon: {
    fontSize: 18,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cardLip: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: kidRadii.card,
  },
  cardFace: {
    flex: 1,
    marginBottom: CLAY_DEPTH,
    borderRadius: kidRadii.card,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  cardFaceLocked: {
    borderStyle: 'dashed',
  },
  corner: {
    position: 'absolute',
    top: 7,
    right: 8,
  },
  newBadge: {
    position: 'absolute',
    top: 7,
    left: 8,
    backgroundColor: kidTones.coral.fill,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardEmoji: {
    marginBottom: 6,
  },
  cardImageWrap: {
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  showcaseImage: {
    width: 48,
    height: 48,
  },
  cardEmojiLocked: {
    opacity: 0.25,
  },
  cardName: {
    fontSize: 13,
    fontWeight: '700',
    color: kidPalette.inkSoft,
    textAlign: 'center',
  },
  cardNameLocked: {
    color: kidPalette.inkFaint,
    fontWeight: '700',
  },
});
