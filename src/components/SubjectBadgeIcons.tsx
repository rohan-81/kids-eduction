import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { HOME_CARD_ART, SUBJECT_CARD_ART, TOPIC_ART } from '../utils/imageHelper';
import * as Art from './art3d/Art3D';
import { Remote3DImage } from './common/Remote3DImage';
import { characterAsset, isRemoteImageSource } from '../utils/remoteAssets';

/**
 * Subject & topic badges as 3D clay tokens: an embossed circular candy base (tint fill,
 * soft border, darker bottom lip) holding either a crisp vector 3D illustration
 * (src/components/art3d/Art3D.tsx) or an authentic high-res 3D render.
 *
 * Every export name and its `size` prop are unchanged from the previous flat SVG
 * squircle badges, so all screens keep working as-is.
 */
interface BadgeIconProps {
  size?: number;
}

export type TokenTone = 'peach' | 'mint' | 'sky' | 'lavender' | 'pink' | 'gold';

const TOKEN_TONES: Record<TokenTone, { tint: string; border: string; lip: string }> = {
  peach: { tint: '#FFF7ED', border: '#FED7AA', lip: '#FDBA74' }, // math
  mint: { tint: '#F0FDF4', border: '#BBF7D0', lip: '#86EFAC' }, // science
  sky: { tint: '#EFF6FF', border: '#BFDBFE', lip: '#93C5FD' }, // english
  lavender: { tint: '#FAF5FF', border: '#E9D5FF', lip: '#D8B4FE' }, // gk
  pink: { tint: '#FDF2F8', border: '#FBCFE8', lip: '#F472B6' }, // logic
  gold: { tint: '#FFFBEB', border: '#FDE68A', lip: '#FCD34D' }, // brain games
};

type VectorArt = React.FC<{ size?: number }>;
type BadgeArt = any | VectorArt;
const isVector = (a: BadgeArt): a is VectorArt => typeof a === 'function';

/**
 * The clay token itself (exported for reuse with any 3D artwork: bundled image, remote render
 * `{ uri }` from characterAsset(), or a vector component). Remote renders show `fallback`
 * (a bundled clay vector) until they are downloaded, so the token is never empty offline.
 */
export const ClayBadgeToken: React.FC<{ art: BadgeArt; tone: TokenTone; size?: number; fallback?: VectorArt }> = ({
  art,
  tone,
  size = 48,
  fallback = Art.StarArt,
}) => {
  const t = TOKEN_TONES[tone];
  const lip = Math.max(3, Math.round(size * 0.08));
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.base,
          {
            borderRadius: size / 2,
            backgroundColor: t.tint,
            borderColor: t.border,
            borderBottomColor: t.lip,
            borderBottomWidth: lip,
          },
        ]}
      />
      <View style={styles.artWrap} pointerEvents="none">
        {isVector(art) ? (
          <View style={{ marginTop: -lip }}>
            {React.createElement(art, { size: Math.round(size * 0.84) })}
          </View>
        ) : isRemoteImageSource(art) ? (
          <Remote3DImage
            source={art}
            style={{ width: size * 0.86, height: size * 0.86, marginTop: -lip }}
            fallback={React.createElement(fallback, { size: Math.round(size * 0.84) })}
          />
        ) : (
          <Image source={art} resizeMode="contain" style={{ width: size * 0.86, height: size * 0.86, marginTop: -lip }} />
        )}
      </View>
    </View>
  );
};

const badge = (art: any, tone: TokenTone, defaultSize: number, fallback?: VectorArt): React.FC<BadgeIconProps> => {
  const Badge: React.FC<BadgeIconProps> = ({ size = defaultSize }) => (
    <ClayBadgeToken art={art} tone={tone} size={size} fallback={fallback} />
  );
  return Badge;
};

// -------------------------------------------------------------
// 1. SUBJECT BADGES (home / subjects)
// -------------------------------------------------------------
export const MathBadgeIcon = badge(SUBJECT_CARD_ART.math, 'peach', 64);
export const ScienceBadgeIcon = badge(SUBJECT_CARD_ART.science, 'mint', 64);
export const EnglishBadgeIcon = badge(SUBJECT_CARD_ART.english, 'sky', 64);
export const GKBadgeIcon = badge(SUBJECT_CARD_ART.gk, 'lavender', 64);
export const LogicBadgeIcon = badge(SUBJECT_CARD_ART.logic, 'pink', 64);
export const BrainGamesBadgeIcon = badge(SUBJECT_CARD_ART.braingames, 'gold', 64);

// -------------------------------------------------------------
// 2. MATH TOPICS (warm peach)
// -------------------------------------------------------------
export const TopicNumberSenseBadge = badge(HOME_CARD_ART.counting.en, 'peach', 48); // candy 1 2 3
/** Offline stand-ins (bundled clay vectors) for remote 3D renders used as topic badges. */
const BADGE_FALLBACK: Record<string, VectorArt> = {
  '3d_clock': Art.ClockArt,
  '3d_apple': Art.AppleArt,
  '3d_heart': Art.HeartArt,
  '3d_water_drop': Art.DropArt,
  '3d_rainbow': Art.CloudArt,
  '3d_earth_planet': Art.PlanetArt,
  '3d_earth': Art.PlanetArt,
  '3d_rocket': Art.RocketArt,
  '3d_telescope': Art.MagnifierArt,
  '3d_banyan_tree': Art.SproutArt,
  '3d_gram_noun': Art.GrammarArt,
  '3d_book': Art.BookArt,
  '3d_twinkling_star': Art.StarArt,
  '3d_pencil': Art.PencilArt,
  '3d_taj_mahal': Art.TempleArt,
  '3d_bus': Art.CarArt,
  '3d_trophy': Art.TrophyArt,
  '3d_computer': Art.GamepadArt,
  '3d_national_emblem': Art.FlagArt,
};

/** A topic badge whose artwork is a remote 3D render (served by Django, disk-cached). */
const remoteBadge = (key: string, tone: TokenTone, defaultSize: number): React.FC<BadgeIconProps> =>
  badge(characterAsset(key), tone, defaultSize, BADGE_FALLBACK[key]);

export const TopicAdditionBadge = badge(require('../../assets/images/topics/addition.webp'), 'peach', 48);
export const TopicSubtractionBadge = badge(require('../../assets/images/topics/subtraction.webp'), 'peach', 48);
export const TopicMultiplicationBadge = badge(require('../../assets/images/topics/multiplication.webp'), 'peach', 48);
export const TopicDivisionBadge = badge(require('../../assets/images/topics/division.webp'), 'peach', 48);
export const TopicFractionsBadge = badge(require('../../assets/images/topics/fractions.webp'), 'peach', 48);
export const TopicDecimalsBadge = badge(require('../../assets/images/topics/decimals.webp'), 'peach', 48);
export const TopicGeometryBadge = badge(require('../../assets/images/topics/geometry.webp'), 'peach', 48);
export const TopicMeasurementBadge = badge(require('../../assets/images/topics/measurement.webp'), 'peach', 48);
export const TopicTimeBadge = remoteBadge('3d_clock', 'peach', 48); // 3D smiling alarm clock
export const TopicMoneyBadge = badge(require('../../assets/images/topics/money.webp'), 'peach', 48);
export const TopicPatternsBadge = badge(require('../../assets/images/topics/patterns.webp'), 'peach', 48);
export const TopicAlgebraBadge = badge(require('../../assets/images/topics/algebra.webp'), 'peach', 48);
export const TopicWordProblemsBadge = badge(require('../../assets/images/topics/wordproblems.webp'), 'peach', 48);

// -------------------------------------------------------------
// 3. SCIENCE TOPICS (spring mint)
// -------------------------------------------------------------
export const TopicAnimalsBadge = remoteBadge('3d_lion', 'mint', 48); // 3D Pixar lion
export const TopicPlantsBadge = remoteBadge('3d_banyan_tree', 'mint', 48); // 3D Pixar banyan tree
export const TopicHumanBodyBadge = remoteBadge('3d_heart', 'mint', 48); // 3D Pixar beating heart
export const TopicFoodBadge = remoteBadge('3d_apple', 'mint', 48); // 3D Pixar shiny red apple
export const TopicWaterAirBadge = remoteBadge('3d_water_drop', 'mint', 48); // 3D Pixar water drop
export const TopicWeatherBadge = remoteBadge('3d_rainbow', 'mint', 48); // 3D Pixar rainbow
export const TopicEarthBadge = remoteBadge('3d_earth_planet', 'mint', 48); // 3D Pixar earth planet
export const TopicSpaceBadge = remoteBadge('3d_rocket', 'mint', 48); // 3D Pixar space rocket
export const TopicMatterBadge = remoteBadge('3d_clock', 'mint', 48); // 3D everyday objects
export const TopicDiscoveriesBadge = remoteBadge('3d_telescope', 'mint', 48); // 3D Pixar telescope

// -------------------------------------------------------------
// 4. ENGLISH & LANGUAGE TOPICS (ocean sky)
// -------------------------------------------------------------
export const TopicGujaratiVarnamalaBadge = badge(HOME_CARD_ART.abc.gu, 'sky', 48); // ક ખ ગ blocks
export const TopicHindiVarnamalaBadge = badge(HOME_CARD_ART.abc.hi, 'sky', 48); // क ख ग blocks
export const TopicAlphabetBadge = badge(HOME_CARD_ART.abc.en, 'sky', 48); // A B C blocks
export const TopicPhonicsBadge = badge(Art.MegaphoneArt, 'sky', 48); // megaphone + sound waves
export const TopicVowelsBadge = badge(Art.VowelsArt, 'sky', 48); // candy A E I
export const TopicVocabularyBadge = badge(SUBJECT_CARD_ART.english, 'sky', 48); // ABC block tower
export const TopicGrammarBadge = remoteBadge('3d_gram_noun', 'sky', 48); // 3D grammar character
export const TopicNounsBadge = remoteBadge('3d_apple', 'sky', 48); // 3D noun object
export const TopicVerbsBadge = remoteBadge('3d_dance', 'sky', 48); // 3D action verb character
export const TopicSentencesBadge = remoteBadge('3d_book', 'sky', 48); // 3D storybook
export const TopicRhymesBadge = remoteBadge('3d_twinkling_star', 'sky', 48); // 3D twinkling star
export const TopicComprehensionBadge = badge(HOME_CARD_ART.storybook, 'sky', 48); // glowing open book
export const TopicSpellingBadge = remoteBadge('3d_pencil', 'sky', 48); // 3D smiling pencil

// -------------------------------------------------------------
// 5. GENERAL KNOWLEDGE TOPICS (magic lavender)
// -------------------------------------------------------------
export const TopicOurWorldBadge = remoteBadge('3d_earth_planet', 'lavender', 48); // 3D Pixar earth planet
export const TopicStatesCapitalsBadge = badge(Art.MapPinArt, 'lavender', 48); // map pin
export const TopicCountriesCapitalsBadge = remoteBadge('3d_earth', 'lavender', 48); // 3D Pixar globe
export const TopicMonumentsBadge = remoteBadge('3d_taj_mahal', 'lavender', 48); // 3D Pixar Taj Mahal palace
export const TopicHistoryBadge = remoteBadge('3d_crown', 'lavender', 48); // 3D Pixar royal golden crown
export const TopicGeographyBadge = remoteBadge('3d_mountains', 'lavender', 48); // 3D Pixar mountains
export const TopicVehiclesBadge = remoteBadge('3d_bus', 'lavender', 48); // 3D Pixar school bus
export const TopicPersonalitiesBadge = remoteBadge('3d_gandhi', 'lavender', 48); // 3D Pixar Mahatma Gandhi
export const TopicInventionsBadge = remoteBadge('3d_bulb', 'lavender', 48); // 3D Pixar lightbulb
export const TopicNationalSymbolsBadge = remoteBadge('3d_national_emblem', 'lavender', 48); // 3D Pixar Ashoka Lion Capital
export const TopicSportsBadge = remoteBadge('3d_trophy', 'lavender', 48); // 3D Pixar golden trophy mascot
export const TopicFactsBadge = remoteBadge('3d_twinkling_star', 'lavender', 48); // 3D twinkling star

// -------------------------------------------------------------
// 6. LOGIC & REASONING TOPICS (berry pink)
// -------------------------------------------------------------
export const TopicLogicalReasoningBadge = remoteBadge('3d_brain', 'pink', 48); // 3D Pixar smart brain mascot
export const TopicNumberSeriesBadge = badge(require('../../assets/images/topics/series.webp'), 'pink', 48); // 3D candy 2 4 6 numbers
export const TopicPatternRecognitionBadge = badge(require('../../assets/images/topics/patterns.webp'), 'pink', 48); // 3D bead pattern arch
export const TopicOddOneOutBadge = badge(require('../../assets/images/topics/oddone.webp'), 'pink', 48); // 3D spheres & smiling star
export const TopicPuzzlesBadge = badge(SUBJECT_CARD_ART.braingames, 'pink', 48); // 3D interlocking jigsaw pieces
export const TopicShapesSequencesBadge = badge(require('../../assets/images/topics/shapes.webp'), 'pink', 48); // 3D shapes trio (sphere, triangle, cube)
export const TopicCodingDecodingBadge = remoteBadge('3d_computer', 'pink', 48); // 3D retro computer mascot
export const TopicCriticalThinkingBadge = remoteBadge('3d_bulb', 'pink', 48); // 3D Pixar lightbulb mascot

const styles = StyleSheet.create({
  base: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
  },
  artWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
