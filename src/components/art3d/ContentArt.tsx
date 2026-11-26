import React from 'react';
import { Image, Text, View } from 'react-native';
import * as Art from './Art3D';
import { STORY_CHARACTER_IMAGES, STORY_PROP_IMAGES, SUBJECT_CARD_ART } from '../../utils/imageHelper';
import { ANIMAL_RENDERS_BY_EMOJI } from '../../utils/animalRenders';
import { NATURE_RENDERS_BY_EMOJI } from '../../utils/natureRenders';
import { EXTRA_RENDERS_BY_EMOJI } from '../../utils/extraRenders';
import { isRemoteImageSource } from '../../utils/remoteAssets';
import { Remote3DImage } from '../common/Remote3DImage';

/**
 * Quiz / lesson content emojis -> real 3D art.
 *
 * Content data keeps its emoji (it is the stable answer key compared with `===`, stored in
 * progress and used for speech), so only the *rendering* changes: `splitEmojiLabel` gives the
 * clean label and the emoji, and `<EmojiArt>` draws the matching 3D render or clay vector.
 */
type ArtSource = number | { uri: string } | React.FC<{ size?: number }>;

const C = STORY_CHARACTER_IMAGES as Record<string, any>;
const P = STORY_PROP_IMAGES as Record<string, any>;

/**
 * Base emoji -> art map: clay vectors, bundled prop art, and the story-character renders
 * (remote, like the registries below). renderLocalArt() uses only its bundled entries as the
 * offline fallback when a remote 3D render can't be downloaded.
 */
export const CONTENT_ART_LOCAL: Record<string, ArtSource> = {
  // animals (real 3D renders where we have them)
  '🦁': C['🦁'], '🐘': Art.ElephantCalfArt, '🐒': C['🐒'], '🐵': C['🐵'], '🐦': C['🐦'], '🐢': C['🐢'], '🐶': Art.PuppyArt, '🐕': Art.PuppyArt,
  '🦊': C['🦊'], '🐻': Art.BearCubArt, '🦜': Art.ParrotChickArt, '🕊️': C['🕊️'], '🕊': C['🕊'], '🦅': Art.EagletArt, '🦉': Art.OwletArt,
  '🐰': C['🐰'], '🐇': C['🐇'], '🐭': C['🐭'], '🐁': C['🐁'], '🐊': C['🐊'], '🐜': C['🐜'], '🦄': C['🦄'], '🐬': C['🐬'],
  // animals (clay vectors)
  '🐱': Art.KittenArt, '🐈': Art.KittenArt, '🐯': Art.TigerCubArt, '🐅': Art.TigerCubArt, '🐄': Art.CalfArt, '🐮': Art.CalfArt,
  '🐎': Art.PonyArt, '🐴': Art.PonyArt, '🪶': Art.FeatherArt,
  '🐪': Art.CamelArt, '🐫': Art.CamelArt, '🦒': Art.GiraffeArt, '🦓': Art.ZebraArt, '🐓': Art.RoosterArt, '🐐': Art.GoatKidArt,
  '🐑': Art.LambArt, '🐃': Art.BuffaloCalfArt, '🐺': Art.WolfPupArt, '🐆': Art.LeopardCubArt, '🐼': Art.PandaCubArt,
  '🦛': Art.HippoCalfArt, '🦏': Art.RhinoCalfArt, '🫏': Art.DonkeyFoalArt, '🐂': Art.OxCalfArt, '🦢': Art.CygnetArt,
  '🦩': Art.FlamingoArt, '🪿': Art.CraneChickArt, '🐧': Art.PenguinArt,
  '🦌': Art.FawnArt, '🐿️': Art.SquirrelPupArt, '🐿': Art.SquirrelPupArt, '🦘': Art.KangarooJoeyArt, '🐸': Art.FroggyArt,
  '🦆': Art.DucklingArt, '🐦‍⬛': C['🦅'], '🐟': Art.FishArt, '🐠': Art.FishArt, '🦚': Art.PeacockArt, '🦋': Art.ButterflyArt,
  // fruits & food
  '🍎': Art.AppleArt, '🍏': Art.GreenAppleArt, '🍌': Art.BananaArt, '🍇': Art.GrapesArt, '🥭': Art.MangoArt,
  '🍉': Art.WatermelonArt, '🍊': Art.OrangeArt, '🍓': Art.StrawberryArt, '🍍': Art.PineappleArt, '🥔': Art.PotatoArt, '🥕': Art.CarrotArt, '🍦': P['🍦'],
  // objects & nature
  '⚽': Art.BallArt, '📦': Art.BoxArt, '🚪': Art.DoorArt, '🪑': Art.ChairArt, '🛏️': Art.BedArt, '🛏': Art.BedArt, '🚗': Art.CarArt, '🏠': Art.HouseArt, '🎈': Art.BalloonsArt,
  '🚀': P['🚀'], '👑': P['👑'], '💎': P['💎'], '🏰': P['🏰'], '🦕': P['🦕'],
  '☀️': Art.SunArt, '☀': Art.SunArt, '🌞': Art.SunArt, '🌙': Art.MoonArt, '⭐': Art.StarArt, '🌟': Art.StarArt, '☁️': Art.CloudArt, '☁': Art.CloudArt, '🌧️': Art.RainArt, '⛈️': Art.RainArt, '⛈': Art.RainArt, '🌪️': Art.CloudArt, '🌪': Art.CloudArt, '🌈': Art.RainbowArt,
  '🌍': SUBJECT_CARD_ART.gk, '🌎': SUBJECT_CARD_ART.gk, '🪐': Art.PlanetArt, '🔴': Art.RedBallArt, '🔵': Art.BlueBallArt,
  '🌿': Art.SproutArt, '🌱': Art.SproutArt, '🌸': Art.FlowerArt, '🌹': Art.RoseArt, '🌻': Art.SunflowerArt, '🪷': Art.LotusArt, '💧': Art.DropArt,
  '🌊': Art.DropArt, '❄️': Art.SnowmanArt, '⛄': Art.SnowmanArt, '☃️': Art.SnowmanArt, '☃': Art.SnowmanArt, '🍂': Art.LeafArt,
  // symbols
  '➕': Art.PlusArt, '➖': Art.MinusArt, '✖️': Art.TimesArt, '➗': Art.DivideArt, '🔤': Art.VowelsArt,
  '🅰️': Art.GrammarArt, '⭕': Art.CircleArt, '⬛': Art.SquareArt, '🔺': Art.TriangleArt, '▭': Art.RectangleArt, '▬': Art.RectangleArt,
  '⬭': Art.OvalArt, '🥚': Art.OvalArt, '💠': Art.DiamondArt, '⬟': Art.PentagonArt, '⬡': Art.HexagonArt,
  '🎲': Art.CubeArt, '🔋': Art.CylinderArt, '🔢': Art.SeriesArt, '🎨': Art.PaletteArt, '📚': Art.BookArt,
  '📖': Art.BookArt, '✏️': Art.PencilArt, '✏': Art.PencilArt, '🏆': Art.TrophyArt, '🎵': Art.MusicArt, '❤️': Art.HeartArt, '❤': Art.HeartArt,
  // measurement, time & everyday things
  '📏': Art.RulerArt, '⚖️': Art.BalanceScaleArt, '🥛': Art.BeakerArt, '📐': Art.SetSquareArt,
  '🌡️': Art.ThermometerArt, '⏱️': Art.StopwatchArt, '⏳': Art.HourglassArt, '⌛': Art.HourglassArt,
  '🗓️': Art.YearCalendarArt, '🍬': Art.CandyArt,
  // colour swatches & everyday things used by the game banks
  '🟢': Art.GreenBallArt, '🟡': Art.YellowBallArt, '🟠': Art.OrangeBallArt, '🟣': Art.PurpleBallArt,
  '⚪': Art.WhiteBallArt, '⚫': Art.BlackBallArt, '☂️': Art.UmbrellaArt, '☂': Art.UmbrellaArt, '🎒': Art.BackpackArt, '📓': Art.BookArt,
  '🧸': C['🐻'], '🧢': Art.CapArt, '🔍': Art.MagnifierArt, '🧼': Art.SoapArt, '🎁': Art.GiftArt,
  '🌳': Art.SproutArt, '🎧': Art.MusicArt, '🧩': Art.JigsawArt, '🐾': Art.PawArt, '⏰': Art.ClockArt, '🦷': Art.ToothArt,
  '✨': Art.StarArt, '🖊️': Art.PencilArt, '🎮': Art.GamepadArt, '🗺️': Art.TreasureMapArt, '📅': Art.CalendarArt,
};

export const CONTENT_ART: Record<string, ArtSource> = {
  ...CONTENT_ART_LOCAL,
  // Real 3D renders (served remotely + disk-cached). Spread EXTRA first so animal/nature
  // symbols like '🕊️' (dove/pigeon) and '🌸'/'🌳' are never overwritten by history/person icons.
  ...EXTRA_RENDERS_BY_EMOJI,
  ...NATURE_RENDERS_BY_EMOJI,
  ...ANIMAL_RENDERS_BY_EMOJI,
};

/** Bundled art for an emoji (no network): vector component, bundled image, or null. */
export const renderLocalArt = (emoji: string, size: number): React.ReactNode => {
  const local = CONTENT_ART_LOCAL[emoji];
  if (local == null || isRemoteImageSource(local)) return null; // remote art can't be an offline fallback
  if (typeof local === 'function') return React.createElement(local, { size });
  return <Image source={local as any} resizeMode="contain" style={{ width: size, height: size }} />;
};

export { splitEmojiLabel } from '../../utils/emojiLabel';

export const hasContentArt = (emoji?: string | null): boolean => !!emoji && CONTENT_ART[emoji] != null;

/** Draws the 3D art for a content emoji; gracefully falls back to the emoji text if no 3D art exists. */
export const EmojiArt: React.FC<{ emoji?: string | null; size?: number }> = ({ emoji, size = 40 }) => {
  if (!emoji) return null;
  const src = CONTENT_ART[emoji];
  if (src == null) {
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: Math.round(size * 0.72) }}>{emoji}</Text>
      </View>
    );
  }
  if (typeof src === 'function') return React.createElement(src, { size });
  if (isRemoteImageSource(src)) {
    // Offline before first download: bundled vector/render, else the emoji itself (never blank)
    const fallback = renderLocalArt(emoji, size) ?? <Text style={{ fontSize: Math.round(size * 0.75) }}>{emoji}</Text>;
    return (
      <View style={{ width: size, height: size }}>
        <Remote3DImage source={src} style={{ width: size, height: size }} fallback={fallback} />
      </View>
    );
  }
  return (
    <View style={{ width: size, height: size }}>
      <Image source={src as any} resizeMode="contain" style={{ width: size, height: size }} />
    </View>
  );
};

/**
 * Renders a visual string (one emoji, or several separated by spaces) as 3D art when every
 * emoji has art; otherwise falls back to the original text so no question loses its picture.
 */
export const VisualArt: React.FC<{ value: string; size?: number; textStyle?: any }> = ({ value, size = 48, textStyle }) => {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  const allArt = parts.length > 0 && parts.every((p) => hasContentArt(p));
  if (!allArt) return <Text style={textStyle}>{value}</Text>;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
      {parts.map((p, i) => (
        <EmojiArt key={`${p}-${i}`} emoji={p} size={parts.length > 3 ? Math.round(size * 0.7) : size} />
      ))}
    </View>
  );
};
