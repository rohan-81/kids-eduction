import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, ImageStyle, Platform, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Stop, Rect, Circle, Ellipse, Path, G } from 'react-native-svg';
import { SceneComposition, SceneSetting, castScene } from '../../utils/storyArt';
import { STORY_CHARACTER_IMAGES, STORY_PROP_IMAGES } from '../../utils/imageHelper';
import { Remote3DImage } from '../common/Remote3DImage';

const useNative = Platform.OS !== 'web';

export interface CharacterFraming {
  scale?: number;
  translateY?: number;
}

/** Per-character visual framing offsets so heads/bodies are centered and not cut off at card edges */
export const CHARACTER_FRAMING: Record<string, CharacterFraming> = {
  '🦅': { scale: 1.18, translateY: -10 },   // crow - raises head/body so eyes & beak are centered
  '🐦‍⬛': { scale: 1.18, translateY: -10 },
  '🦁': { scale: 1.22, translateY: -12 },   // lion - raises chin and mane up into center of frame
  '🐢': { scale: 1.34, translateY: -14 },   // tortoise - wider aspect ratio, scaled up & raised so shell and legs are clear
  '🐇': { scale: 1.15, translateY: -8 },    // hare
  '🐰': { scale: 1.15, translateY: -8 },
  '🐒': { scale: 1.12, translateY: -6 },    // monkey
  '🐵': { scale: 1.12, translateY: -6 },
  '🕊️': { scale: 1.25, translateY: -10 },  // dove - raised so full body and branch are visible
  '🕊': { scale: 1.25, translateY: -10 },
  '🪓': { scale: 1.18, translateY: -10 },   // woodcutter - raised so torso and axe are centered
  '🦊': { scale: 1.16, translateY: -8 },    // fox
  '🐦': { scale: 1.22, translateY: -8 },    // sparrow
};

interface StoryIllustrationProps {
  /** Real artwork (require() or { uri }) - preferred when present. */
  image?: any | null;
  composition: SceneComposition;
  /** Unique id so SVG gradient ids never collide between instances (they are global on web). */
  artId: string;
  height: number;
  radius?: number;
  /** Size of the standing characters; defaults from the frame height. */
  actorSize?: number;
  /** Story hero glyph; stands in when a page has no character with 3D art. */
  hero?: string;
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
}

const PALETTES: Record<SceneSetting, { skyTop: string; skyBottom: string; far: string; near: string; ground: string }> = {
  desert: { skyTop: '#7DD3FC', skyBottom: '#FEF3C7', far: '#FCD34D', near: '#F59E0B', ground: '#FBBF24' },
  river: { skyTop: '#7DD3FC', skyBottom: '#E0F2FE', far: '#86EFAC', near: '#4ADE80', ground: '#22C55E' },
  forest: { skyTop: '#93C5FD', skyBottom: '#ECFDF5', far: '#6EE7B7', near: '#34D399', ground: '#10B981' },
  rain: { skyTop: '#94A3B8', skyBottom: '#CBD5E1', far: '#86EFAC', near: '#4ADE80', ground: '#16A34A' },
  home: { skyTop: '#BAE6FD', skyBottom: '#FEF9C3', far: '#BBF7D0', near: '#86EFAC', ground: '#4ADE80' },
  meadow: { skyTop: '#A5F3FC', skyBottom: '#FDF4FF', far: '#BBF7D0', near: '#86EFAC', ground: '#4ADE80' },
};

/** Draws the landscape for a setting in a 400 x 240 viewBox (sliced to fill any frame). */
const Landscape: React.FC<{ setting: SceneSetting; id: string; rainbow: boolean; sparkle: boolean }> = ({ setting, id, rainbow, sparkle }) => {
  const p = PALETTES[setting];
  const sky = `sky-${id}`;
  const sun = `sun-${id}`;
  return (
    <Svg width="100%" height="100%" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice">
      <Defs>
        <LinearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={p.skyTop} />
          <Stop offset="100%" stopColor={p.skyBottom} />
        </LinearGradient>
        <RadialGradient id={sun} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFF7AE" />
          <Stop offset="70%" stopColor="#FCD34D" />
          <Stop offset="100%" stopColor="#F59E0B" />
        </RadialGradient>
      </Defs>
      <Rect width="400" height="240" fill={`url(#${sky})`} />

      {/* Sun or rain clouds */}
      {setting === 'rain' ? (
        <G>
          <Ellipse cx="110" cy="44" rx="62" ry="24" fill="#E2E8F0" />
          <Ellipse cx="150" cy="34" rx="44" ry="22" fill="#F1F5F9" />
          <Ellipse cx="290" cy="52" rx="70" ry="24" fill="#E2E8F0" />
          {Array.from({ length: 18 }).map((_, i) => (
            <Path key={i} d={`M${20 + i * 22} ${78 + (i % 3) * 14} l-6 16`} stroke="#60A5FA" strokeWidth={3} strokeLinecap="round" />
          ))}
        </G>
      ) : (
        <G>
          <Circle cx="335" cy="48" r="30" fill={`url(#${sun})`} />
          <Circle cx="335" cy="48" r="40" fill="#FDE68A" opacity={0.25} />
          <Ellipse cx="80" cy="46" rx="46" ry="16" fill="#FFFFFF" opacity={0.9} />
          <Ellipse cx="112" cy="38" rx="30" ry="16" fill="#FFFFFF" opacity={0.9} />
          <Ellipse cx="220" cy="62" rx="34" ry="11" fill="#FFFFFF" opacity={0.75} />
        </G>
      )}

      {rainbow ? (
        <G opacity={0.75}>
          {['#F43F5E', '#F59E0B', '#FDE047', '#10B981', '#0EA5E9', '#8B5CF6'].map((c, i) => (
            <Path key={c} d={`M${60 + i * 7} 170 A${140 - i * 7} ${110 - i * 7} 0 0 1 ${340 - i * 7} 170`} stroke={c} strokeWidth={7} fill="none" />
          ))}
        </G>
      ) : null}

      {/* Far + near hills / dunes */}
      {setting === 'desert' ? (
        <G>
          <Path d="M0 150 Q90 110 180 145 T400 135 V240 H0 Z" fill={p.far} />
          <Path d="M0 175 Q120 140 240 172 T400 168 V240 H0 Z" fill={p.near} />
          {/* cactus */}
          <Path d="M58 176 V128 a9 9 0 0 1 18 0 V176 Z M50 150 v-14 a6 6 0 0 1 12 0 v14 Z M72 146 v-16 a6 6 0 0 1 12 0 v16 Z" fill="#16A34A" />
        </G>
      ) : (
        <G>
          <Path d="M0 150 Q100 105 200 140 T400 128 V240 H0 Z" fill={p.far} />
          <Path d="M0 172 Q110 138 230 168 T400 160 V240 H0 Z" fill={p.near} />
        </G>
      )}

      {setting === 'forest' || setting === 'river' || setting === 'rain' ? (
        <G>
          {[30, 92, 300, 362].map((x, i) => (
            <G key={x}>
              <Rect x={x - 5} y={122 - (i % 2) * 8} width={10} height={44} rx={4} fill="#92400E" />
              <Circle cx={x} cy={112 - (i % 2) * 8} r={24} fill={i % 2 ? '#15803D' : '#16A34A'} />
              <Circle cx={x - 12} cy={124 - (i % 2) * 8} r={15} fill="#22C55E" />
              <Circle cx={x + 13} cy={122 - (i % 2) * 8} r={14} fill="#4ADE80" />
            </G>
          ))}
        </G>
      ) : null}

      {setting === 'home' ? (
        <G>
          <Rect x="290" y="118" width="70" height="52" rx="6" fill="#FFFFFF" />
          <Path d="M282 122 L325 88 L368 122 Z" fill="#F43F5E" />
          <Rect x="318" y="140" width="16" height="30" rx="3" fill="#B45309" />
          <Rect x="298" y="132" width="14" height="14" rx="2" fill="#7DD3FC" />
          <Rect x="340" y="132" width="14" height="14" rx="2" fill="#7DD3FC" />
        </G>
      ) : null}

      {/* Ground band where characters stand */}
      {setting === 'river' ? (
        <G>
          <Path d="M0 190 Q100 180 200 190 T400 188 V240 H0 Z" fill="#38BDF8" />
          <Path d="M0 200 q25 -8 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" stroke="#E0F2FE" strokeWidth={3} fill="none" opacity={0.8} />
          <Path d="M0 216 q25 -8 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" stroke="#BAE6FD" strokeWidth={3} fill="none" opacity={0.7} />
        </G>
      ) : (
        <Path d="M0 192 Q200 178 400 192 V240 H0 Z" fill={p.ground} />
      )}

      {setting === 'rain' ? (
        <G>
          <Ellipse cx="120" cy="214" rx="34" ry="6" fill="#93C5FD" opacity={0.8} />
          <Ellipse cx="290" cy="222" rx="26" ry="5" fill="#93C5FD" opacity={0.8} />
        </G>
      ) : null}

      {setting === 'meadow' || setting === 'home' ? (
        <G>
          {[40, 75, 140, 260, 330, 372].map((x, i) => (
            <G key={x}>
              <Circle cx={x} cy={206 + (i % 2) * 10} r={5} fill={['#F43F5E', '#F59E0B', '#8B5CF6'][i % 3]} />
              <Circle cx={x} cy={206 + (i % 2) * 10} r={2} fill="#FEF3C7" />
            </G>
          ))}
        </G>
      ) : null}

      {sparkle ? (
        <G>
          {[[70, 90], [200, 40], [250, 100], [150, 70]].map(([x, y], i) => (
            <Path key={i} d={`M${x} ${y - 7} L${x + 2} ${y - 2} L${x + 7} ${y} L${x + 2} ${y + 2} L${x} ${y + 7} L${x - 2} ${y + 2} L${x - 7} ${y} L${x - 2} ${y - 2} Z`} fill="#FFFFFF" />
          ))}
        </G>
      ) : null}
    </Svg>
  );
};

/** Gentle 0 -> 1 -> 0 loop used for bobbing characters and floating props. */
function useBob(animated: boolean, index: number): Animated.Value {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!animated) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: 1300 + index * 180, easing: Easing.inOut(Easing.sin), useNativeDriver: useNative }),
        Animated.timing(t, { toValue: 0, duration: 1300 + index * 180, easing: Easing.inOut(Easing.sin), useNativeDriver: useNative }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [animated, index, t]);
  return t;
}

const lookupCharacter = (glyph: string) => STORY_CHARACTER_IMAGES[glyph] || STORY_CHARACTER_IMAGES[glyph.trim()] || null;

/**
 * A 3D character standing on the ground: transparent Pixar-style PNG, a soft contact
 * shadow that shrinks as it bobs up, and a gentle bounce. Emoji text is only used if a
 * glyph has no character art at all.
 */
const Actor: React.FC<{ glyph: string; source?: any; size: number; index: number; animated: boolean }> = ({
  glyph,
  source,
  size,
  index,
  animated,
}) => {
  const t = useBob(animated, index);
  const bobY = t.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const shadowScale = t.interpolate({ inputRange: [0, 1], outputRange: [1, 0.78] });
  const shadowOpacity = t.interpolate({ inputRange: [0, 1], outputRange: [1, 0.6] });
  const framing = CHARACTER_FRAMING[glyph] || CHARACTER_FRAMING[glyph.trim()] || {};
  const charScale = framing.scale ?? 1;
  const charOffset = framing.translateY ?? 0;
  const box = Math.round(size * 1.35 * charScale);

  return (
    <View style={[styles.actor, { transform: [{ translateY: charOffset }] }]}>
      {source ? (
        <Animated.View style={{ transform: [{ translateY: bobY }] }}>
          <Remote3DImage
            source={source}
            style={{ width: box, height: box }}
            fallback={<Text style={{ fontSize: size, lineHeight: size * 1.18 }}>{glyph}</Text>}
          />
        </Animated.View>
      ) : (
        <Animated.Text style={{ fontSize: size, lineHeight: size * 1.18, transform: [{ translateY: bobY }] }}>{glyph}</Animated.Text>
      )}
      <Animated.View
        style={[
          styles.actorShadow,
          {
            width: Math.round(size * 0.8 * charScale),
            height: Math.round(size * 0.16),
            borderRadius: Math.round(size * 0.08),
            marginTop: source ? -Math.round(size * 0.14 * charScale) : -6,
            opacity: shadowOpacity,
            transform: [{ scaleX: shadowScale }],
          },
        ]}
      />
    </View>
  );
};

/** A small story object (🏺 🍇 💧) floating in a white bubble, so it never competes with the 3D cast. */
const PropBadge: React.FC<{ glyph: string; size: number; index: number; animated: boolean }> = ({ glyph, size, index, animated }) => {
  const t = useBob(animated, index + 3);
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });
  const art = STORY_PROP_IMAGES[glyph];
  return (
    <Animated.View
      style={[styles.prop, { width: size, height: size, borderRadius: size / 2, transform: [{ translateY }] }]}
    >
      {art ? (
        <Image source={art} resizeMode="contain" style={{ width: size * 0.78, height: size * 0.78 }} />
      ) : (
        <Text style={{ fontSize: Math.round(size * 0.52) }}>{glyph}</Text>
      )}
    </Animated.View>
  );
};

/**
 * Story cover / page illustration. Shows real artwork when available, otherwise an
 * illustrated SVG landscape with the scene's characters standing in it.
 */
export const StoryIllustration: React.FC<StoryIllustrationProps> = ({
  image,
  composition,
  artId,
  height,
  radius = 24,
  actorSize,
  hero,
  animated = true,
  style,
  imageStyle,
  accessibilityLabel,
}) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [image]);
  const { cast, props } = castScene(composition.actors, hero, lookupCharacter);
  // No character art at all -> fall back to the composed glyphs so the page is never empty.
  const actors = cast.length > 0 ? cast : composition.actors.map((glyph) => ({ glyph, source: null }));
  const size = actorSize ?? Math.round(Math.min(96, height * (actors.length <= 1 ? 0.44 : 0.34)));
  const propSize = Math.max(34, Math.round(height * 0.17));

  return (
    <View
      style={[styles.frame, { height, borderRadius: radius }, style]}
      accessible={!!accessibilityLabel}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      {image && !failed ? (
        <Image
          source={image}
          resizeMode="cover"
          onError={() => setFailed(true)}
          style={[
            StyleSheet.absoluteFill,
            Platform.OS === 'web' && ({ objectPosition: 'center 70%' } as any),
            imageStyle,
          ]}
        />
      ) : (
        <>
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Landscape setting={composition.setting} id={artId} rainbow={composition.rainbow} sparkle={composition.sparkle} />
          </View>
          <View style={[styles.stageRow, { bottom: Math.round(height * 0.20) }]} pointerEvents="none">
            {actors.map((a, i) => (
              <Actor key={`${artId}-${i}-${a.glyph}`} glyph={a.glyph} source={a.source} size={size} index={i} animated={animated} />
            ))}
          </View>
          {cast.length > 0 && props.length > 0 ? (
            <View style={styles.propRow} pointerEvents="none">
              {props.map((g, i) => (
                <PropBadge key={`${artId}-prop-${i}-${g}`} glyph={g} size={propSize} index={i} animated={animated} />
              ))}
            </View>
          ) : null}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#E0F2FE',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  stageRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 16,
    zIndex: 2,
  },
  actor: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  actorShadow: {
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
  },
  propRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 8,
  },
  prop: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderBottomWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
