import React from 'react';
import { Text, View } from 'react-native';
import { LessonItem, AppLanguage } from '../types';
import * as Art from './art3d/Art3D';
import { CONTENT_ART, EmojiArt, renderLocalArt } from './art3d/ContentArt';
import { Remote3DImage } from './common/Remote3DImage';
import { isBackendCharacterUrl } from '../utils/remoteAssets';
import { ANIMAL_RENDERS_BY_LESSON } from '../utils/animalRenders';
import { NATURE_RENDERS_BY_LESSON } from '../utils/natureRenders';
import { EXTRA_RENDERS_BY_LESSON } from '../utils/extraRenders';

type ArtComponent = React.FC<{ size?: number }>;

/**
 * Direct lookup map from lesson ID to custom 3D art component.
 * Replaces old flat OS 2D black-outlined emojis with high-definition 3D claymorphic vector art.
 */
const LESSON_ID_TO_ART: Record<string, ArtComponent> = {
  // Animals & Birds: full-body sitting characters (replace photos / flat faces / feather)
  'an-peacock': Art.PeacockArt,
  'an-cat': Art.KittenArt,
  'an-dog': Art.PuppyArt,
  'an-cow': Art.CalfArt,
  'an-tiger': Art.TigerCubArt,
  'an-horse': Art.PonyArt,
  'an-duck': Art.DucklingArt,
  'an-bear': Art.BearCubArt,
  'an-owl': Art.OwletArt,
  'an-eagle': Art.EagletArt,
  'an-vulture': Art.VultureChickArt,
  'an-koel': Art.KoelArt,
  'an-elephant': Art.ElephantCalfArt,
  'an-parrot': Art.ParrotChickArt,
  'an-camel': Art.CamelArt,
  'an-deer': Art.FawnArt,
  'an-giraffe': Art.GiraffeArt,
  'an-zebra': Art.ZebraArt,
  'an-rooster': Art.RoosterArt,
  'an-goat': Art.GoatKidArt,
  'an-sheep': Art.LambArt,
  'an-buffalo': Art.BuffaloCalfArt,
  'an-wolf': Art.WolfPupArt,
  'an-leopard': Art.LeopardCubArt,
  'an-cheetah': Art.CheetahCubArt,
  'an-panda': Art.PandaCubArt,
  'an-kangaroo': Art.KangarooJoeyArt,
  'an-hippo': Art.HippoCalfArt,
  'an-rhino': Art.RhinoCalfArt,
  'an-squirrel': Art.SquirrelPupArt,
  'an-donkey': Art.DonkeyFoalArt,
  'an-ox': Art.OxCalfArt,
  'an-frog': Art.FroggyArt,
  'an-swan': Art.CygnetArt,
  'an-flamingo': Art.FlamingoArt,
  'an-crane': Art.CraneChickArt,
  'an-woodpecker': Art.WoodpeckerArt,
  'an-kingfisher': Art.KingfisherArt,
  'an-penguin': Art.PenguinArt,
  'an-ostrich': Art.OstrichChickArt,

  // Geometry & 2D/3D Shapes
  'cs-circle': Art.CircleArt,
  'cs-square': Art.SquareArt,
  'cs-triangle': Art.TriangleArt,
  'cs-star': Art.StarArt,
  'cs-rectangle': Art.RectangleArt,
  'cs-oval': Art.OvalArt,
  'cs-diamond': Art.DiamondArt,
  'cs-heart': Art.HeartArt,
  'cs-crescent': Art.MoonArt,
  'cs-pentagon': Art.PentagonArt,
  'cs-hexagon': Art.HexagonArt,
  'cs-cube': Art.CubeArt,
  'cs-cylinder': Art.CylinderArt,
  'cs-cone': Art.ConeArt,
  'cs-sphere': Art.SphereArt,

  // Colors (Glossy 3D clay spheres)
  'cs-red': Art.RedBallArt,
  'cs-blue': Art.BlueBallArt,
  'cs-yellow': Art.YellowBallArt,
  'cs-green': Art.GreenBallArt,
  'cs-orange': Art.OrangeBallArt,
  'cs-purple': Art.PurpleBallArt,
  'cs-pink': Art.PinkBallArt,
  'cs-brown': Art.BrownBallArt,
  'cs-white': Art.WhiteBallArt,
  'cs-black': Art.BlackBallArt,

  // Cognitive Patterns & Sequences
  'cs-pattern-ab-color': Art.ColorPatternArt,
  'cs-pattern-ab-shape': Art.ShapePatternArt,
  'cs-pattern-abc-triple': Art.AbcPatternArt,
  'cs-pattern-size': Art.SizePatternArt,
  'cs-pattern-growing': Art.GrowingPatternArt,
  'cs-pattern-daynight': Art.DayNightPatternArt,
  'cs-pattern-direction': Art.DirectionPatternArt,
  'cs-pattern-wave': Art.WavePatternArt,

  // Time & Calendar
  'time-clock-hours': Art.AlarmClockArt,
  'time-days-week': Art.WeekCalendarArt,
  'time-months-year': Art.YearCalendarArt,
  'time-day-night': Art.CelestialDayNightArt,
  'time-am-pm': Art.MorningSunArt,
  'time-yesterday-today': Art.HourglassArt,
  'time-seasons-cycle': Art.LeafArt,
  'time-sixty-seconds': Art.StopwatchArt,

  // Measurement Units & Tools
  'math-meas-1': Art.RulerArt,
  'math-meas-2': Art.BalanceScaleArt,
  'math-meas-3': Art.BeakerArt,
  'math-meas-4': Art.SetSquareArt,
  'math-meas-5': Art.MeasuringTapeArt,
  'math-meas-6': Art.ThermometerArt,

  // Math Word Problems
  'prob-apple-add': Art.AppleArt,
  'prob-bird-sub': Art.BirdArt,
  'prob-pencil-box': Art.PencilArt,
  'prob-candy-share': Art.CandyArt,
  'prob-ball-add': Art.BallArt,
  'prob-star-sub': Art.StarArt,

  // Fruits & Weather
  'fr-pineapple': Art.PineappleArt,
  'weather-rainbow': Art.RainbowArt,
  'season-summer': Art.SunArt,
  'season-monsoon': Art.RainArt,
  'weather-windy': Art.CloudArt,
  'weather-snow': Art.SnowmanArt,

  // CVC English Words (Accurate 3D Clay Art)
  'word-box': Art.BoxArt,
  'word-hat': Art.CapArt,

  // State Cultural Landmark 3D Art
  'state-tamilnadu': Art.TempleArt,
};

/**
 * Checks if a lesson item has a specialized 3D icon.
 */
export function hasLesson3DVisual(item?: LessonItem | null): boolean {
  if (!item) return false;
  if (getBackendRenderUrl(item)) return true;
  if (item.id && (ANIMAL_RENDERS_BY_LESSON[item.id] || NATURE_RENDERS_BY_LESSON[item.id] || EXTRA_RENDERS_BY_LESSON[item.id] || LESSON_ID_TO_ART[item.id])) return true;
  if (item.symbol && CONTENT_ART[item.symbol] != null) return true;
  return false;
}

/** A backend-assigned 3D render URL for this lesson (ignores arbitrary photo URLs). */
function getBackendRenderUrl(item: LessonItem): string | null {
  const candidate = item.imageUrl || item.exampleImage;
  return isBackendCharacterUrl(candidate) ? candidate : null;
}

/** Bundled-only art for a lesson: its clay vector, the symbol's local art, or the symbol text. */
function renderOfflineFallback(item: LessonItem, size: number): React.ReactNode {
  const ArtComp = item.id ? LESSON_ID_TO_ART[item.id] : undefined;
  if (ArtComp) return <ArtComp size={size} />;
  const local = item.symbol ? renderLocalArt(item.symbol, size) : null;
  if (local) return local;
  return item.symbol ? <Text style={{ fontSize: Math.round(size * 0.7) }}>{item.symbol}</Text> : null;
}

/**
 * Renders high-definition 3D vector art for lesson cards and detail screens.
 * Returns null if no 3D asset is mapped (allowing caller to fall back to photo or typography).
 */
export function renderLesson3DVisual(
  item: LessonItem,
  size: number = 64,
  _language?: AppLanguage
): React.ReactNode {
  if (!item) return null;

  // 0. Real 3D renders beat any vector stand-in. Priority:
  //    a) the render the backend database assigned to this lesson (Lesson.example_image), then
  //    b) the app's render registry (animals, nature, weather, objects...).
  //    Both are remote + disk-cached; offline before first download they fall back to the
  //    bundled vector art / emoji below, so the card is never blank.
  const backendUrl = getBackendRenderUrl(item);
  const renderImg = backendUrl
    ? { uri: backendUrl }
    : item.id
      ? ANIMAL_RENDERS_BY_LESSON[item.id] || NATURE_RENDERS_BY_LESSON[item.id] || EXTRA_RENDERS_BY_LESSON[item.id]
      : null;
  if (renderImg) {
    const box = Math.round(size * 1.15);
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Remote3DImage source={renderImg} style={{ width: box, height: box }} fallback={renderOfflineFallback(item, size)} />
      </View>
    );
  }

  // 1. Direct ID Match
  if (item.id && LESSON_ID_TO_ART[item.id]) {
    const ArtComp = LESSON_ID_TO_ART[item.id];
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <ArtComp size={size} />
      </View>
    );
  }

  // 2. Direct Symbol Match from CONTENT_ART
  if (item.symbol && CONTENT_ART[item.symbol] != null) {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <EmojiArt emoji={item.symbol} size={size} />
      </View>
    );
  }

  return null;
}
