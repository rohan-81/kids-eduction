import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  StyleProp,
  useWindowDimensions,
  type ImageSourcePropType
} from 'react-native';
import { kidTones, kidPalette, KidTone } from '../../theme/kidTheme';
import { soundEffects } from '../../services/soundEffects';
import { Glyph } from './KidIcons';
import { FloatingSparkles } from './FloatingSparkles';
import { ICON_3D_STAR, ICONS_3D, STORY_CHARACTER_IMAGES } from '../../utils/imageHelper';
import * as Art from '../art3d/Art3D';
import { Remote3DImage } from '../common/Remote3DImage';
import { webStyle } from '../../utils/webStyle';
import type { ImageAsset } from '../../utils/remoteAssets';

/** Emblem emojis callers pass -> real 3D renders (characters) so no system emoji is drawn. */
const EMBLEM_IMAGES: Record<string, ImageAsset> = {
  '🦉': STORY_CHARACTER_IMAGES['🦉'],
  '🐻': STORY_CHARACTER_IMAGES['🐻'],
  '👶': STORY_CHARACTER_IMAGES['🐰'],
};
/** Emblem emojis -> crisp 3D vector art. */
const EMBLEM_ART: Record<string, React.FC<{ size?: number }>> = {
  '✏️': Art.PencilArt,
  '💪': Art.HeartArt,
  '❤️': Art.HeartArt,
  '👍': Art.StarArt,
  '✨': Art.StarArt,
  '🎉': Art.StarArt,
  '⏳': Art.ClockArt,
  '⏰': Art.ClockArt,
  '🛡️': Art.ShieldArt,
  '💬': Art.ChatBubbleArt,
  '🎁': Art.GiftArt,
  '🎮': Art.GamepadArt,
  '🎨': Art.PaletteArt,
  '🚀': Art.RocketArt,
  '🏅': Art.MedalArt,
  '📅': Art.CalendarArt,
  '🗺️': Art.TreasureMapArt,
  '🎒': Art.BackpackArt,
  '🔒': Art.KeyArt,
};
/** Emblem emojis -> SVG glyphs for system / warning popups. */
const EMBLEM_GLYPHS: Record<string, { name: 'trash' | 'warning' | 'lock'; color: string }> = {
  '🗑️': { name: 'trash', color: '#E11D48' },
  '⚠️': { name: 'warning', color: '#D97706' },
};

const useNative = Platform.OS !== 'web';
const EMBLEM = 92;

export interface KidModalProps {
  visible: boolean;
  /** Called by the ✕ badge, Android back button and (if enabled) backdrop tap. Omit to make the popup non-dismissable. */
  onClose?: () => void;
  /** Emoji shown in the popping top emblem (🏆 ⭐ 🛡️ 🎁 🦉 ...). */
  emblem?: string;
  /** High-resolution 3D asset or PNG image overriding raw emoji. */
  emblemImage?: ImageSourcePropType;
  /** React element (e.g. vector icon) overriding raw emoji. */
  emblemIcon?: React.ReactNode;
  tone?: KidTone;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  /** Floating stars/sparkles behind the content. */
  sparkles?: boolean;
  maxWidth?: number;
  cardStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Shared kid-friendly 3D claymorphic popup shell:
 *   - soft tinted backdrop rgba(15,23,42,0.65) that fades in
 *   - bouncy bubble card (radius 30, 2px #E2E8F0 border, padding 26, deep layered shadow)
 *   - circular emblem popping out of the top edge
 *   - chunky 3D close badge (SVG ✕) instead of a text cross
 */
export const KidModal: React.FC<KidModalProps> = ({
  visible,
  onClose,
  emblem,
  emblemImage,
  emblemIcon,
  tone = 'sun',
  title,
  subtitle,
  children,
  sparkles = false,
  maxWidth = 420,
  cardStyle,
  testID,
}) => {
  const spec = kidTones[tone];
  const { height } = useWindowDimensions();
  const fade = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(0)).current;
  const wobble = useRef(new Animated.Value(0)).current;

  // Resolve 3D icon for common game/lesson emblems if no custom emblemImage is provided
  const resolvedImage =
    emblemImage ||
    (emblem === '🏆'
      ? ICONS_3D.trophy
      : emblem === '⭐' || emblem === '🌟'
        ? ICON_3D_STAR
        : emblem === '📖' || emblem === '📚'
          ? ICONS_3D.book
          : emblem === '💡'
            ? ICONS_3D.bulb
            : emblem === '🧠'
              ? ICONS_3D.brain
              : (emblem && EMBLEM_IMAGES[emblem]) || null);
  const vectorEmblem = !emblemIcon && emblem ? EMBLEM_ART[emblem] : undefined;
  const glyphEmblem = !emblemIcon && emblem ? EMBLEM_GLYPHS[emblem] : undefined;

  useEffect(() => {
    if (!visible) {
      fade.setValue(0);
      pop.setValue(0);
      return;
    }
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: useNative }),
      Animated.spring(pop, { toValue: 1, friction: 5, tension: 90, useNativeDriver: useNative }),
    ]).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(wobble, { toValue: 1, duration: 900, useNativeDriver: useNative }),
        Animated.timing(wobble, { toValue: 0, duration: 900, useNativeDriver: useNative }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [visible, fade, pop, wobble]);

  const scale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });
  const emblemY = wobble.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });
  const emblemRotate = wobble.interpolate({ inputRange: [0, 1], outputRange: ['-4deg', '4deg'] });

  const close = () => {
    if (!onClose) return;
    soundEffects.playBubblePop();
    onClose();
  };

  const hasEmblem = Boolean(emblem || resolvedImage || emblemIcon);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose ? close : () => { }} statusBarTranslucent>
      <Animated.View style={[styles.backdrop, { opacity: fade }]} testID={testID}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { minHeight: height }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.cardWrap, { maxWidth, transform: [{ scale }] }]}>
            <View
              style={[
                styles.card,
                { paddingTop: hasEmblem ? EMBLEM / 2 + 18 : 28, borderBottomColor: spec.tintBorder },
                Platform.OS === 'web'
                  ? webStyle({ boxShadow: '0 20px 45px rgba(0, 0, 0, 0.22), 0 4px 0 rgba(0,0,0,0.04)' })
                  : styles.cardNativeShadow,
                cardStyle,
              ]}
              accessibilityViewIsModal
            >
              {sparkles ? <FloatingSparkles count={8} seed={7} size={16} opacity={0.6} /> : null}
              {title ? <Text style={styles.title}>{title}</Text> : null}
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
              {children}
            </View>

            {hasEmblem ? (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.emblem,
                  { backgroundColor: spec.tint, borderColor: spec.fill, borderBottomColor: spec.edge },
                  { transform: [{ translateY: emblemY }, { rotate: emblemRotate }] },
                ]}
              >
                {resolvedImage ? (
                  <Remote3DImage
                    source={resolvedImage}
                    style={styles.emblemImg}
                    fallback={emblem ? <Text style={{ fontSize: 40 }}>{emblem}</Text> : null}
                  />
                ) : emblemIcon ? (
                  emblemIcon
                ) : vectorEmblem ? (
                  React.createElement(vectorEmblem, { size: 58 })
                ) : glyphEmblem ? (
                  <Glyph name={glyphEmblem.name} size={40} color={glyphEmblem.color} strokeWidth={2.6} />
                ) : (
                  <Text style={styles.emblemEmoji}>{emblem}</Text>
                )}
              </Animated.View>
            ) : null}

            {onClose ? (
              <Pressable
                onPress={close}
                accessibilityRole="button"
                accessibilityLabel="Close"
                hitSlop={8}
                style={[styles.closeBadge, webStyle({ cursor: 'pointer' })]}
              >
                <Glyph name="close" size={18} color={kidPalette.inkSoft} strokeWidth={3.4} />
              </Pressable>
            ) : null}
          </Animated.View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  scroll: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 40,
  },
  cardWrap: {
    width: '100%',
    marginTop: EMBLEM / 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderBottomWidth: 7,
    padding: 26,
    alignItems: 'center',
    overflow: 'hidden',
    gap: 12,
  },
  cardNativeShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 16,
  },
  emblem: {
    position: 'absolute',
    top: -EMBLEM / 2,
    alignSelf: 'center',
    width: EMBLEM,
    height: EMBLEM,
    borderRadius: EMBLEM / 2,
    borderWidth: 4,
    borderBottomWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 18,
  },
  emblemEmoji: {
    fontSize: 46,
  },
  emblemImg: {
    width: 54,
    height: 54,
    borderRadius: 14,
  },
  closeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderBottomWidth: 5,
    borderBottomColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    elevation: 19,
  },
  title: {
    fontSize: 25,
    fontWeight: '900',
    color: kidPalette.ink,
    textAlign: 'center',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: kidPalette.inkMuted,
    textAlign: 'center',
    lineHeight: 23,
    marginTop: -4,
  },
});
