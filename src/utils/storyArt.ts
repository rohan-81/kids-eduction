/**
 * Storybook art resolution + scene analysis (pure, unit-tested).
 *
 * Image resolution order for a cover or page:
 *   1. Real artwork URL from the Django backend (Story.cover_image / StoryScene.illustration
 *      holding an http(s) URL or a /media/... path)
 *   2. Bundled artwork registered in STORY_IMAGE_MAP (src/utils/imageHelper.ts)
 *   3. null -> <StoryIllustration> draws an illustrated SVG scene (never a bare emoji box)
 */
import { StoryBook, StoryScene } from '../data/storiesData';

export type SceneSetting = 'desert' | 'river' | 'forest' | 'rain' | 'home' | 'meadow';

export interface SceneComposition {
  setting: SceneSetting;
  /** Characters / props to stand on the ground (setting glyphs removed), max 4. */
  actors: string[];
  rainbow: boolean;
  sparkle: boolean;
}

/** True when a backend field holds a picture reference rather than emoji text. */
export function isImageRef(value?: string | null): boolean {
  if (!value) return false;
  const v = value.trim();
  return /^https?:\/\//i.test(v) || /^\/media\//i.test(v) || /\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(v);
}

/** Makes /media/... paths absolute against the API origin (http://host:8000/api -> http://host:8000). */
export function toAbsoluteImageUrl(value: string, apiBaseUrl: string): string {
  const v = value.trim();
  if (/^https?:\/\//i.test(v)) return v;
  const origin = apiBaseUrl.replace(/\/api\/?$/, '');
  return `${origin}${v.startsWith('/') ? '' : '/'}${v}`;
}

/** Bump when the story artwork is regenerated so browsers/devices skip old cached images. */
export const STORY_ART_VERSION = '3d_art_v3';

/** Appends the artwork version as a cache-busting query param (keeps any existing query). */
export function withArtVersion(url: string, version: string = STORY_ART_VERSION): string {
  if (/[?&]v=/.test(url)) return url;
  return `${url}${url.includes('?') ? '&' : '?'}v=${version}`;
}

type ImageMap = Record<string, { cover?: any; scenes?: Record<number, any> }>;

export function resolveStoryCover(story: StoryBook, map: ImageMap): any | null {
  if (story.coverImage) return { uri: story.coverImage };
  const id = String(story.id || '');
  return (
    map[id]?.cover ??
    map[`story-${id}`]?.cover ??
    map[id.replace(/^story-/, '')]?.cover ??
    null
  );
}

export function resolveStoryScene(story: StoryBook, page: number, map: ImageMap): any | null {
  const scene = story.scenes[page - 1];
  if (scene?.image) return { uri: scene.image };
  const id = String(story.id || '');
  return (
    map[id]?.scenes?.[page] ??
    map[`story-${id}`]?.scenes?.[page] ??
    map[id.replace(/^story-/, '')]?.scenes?.[page] ??
    null
  );
}

// Glyphs that become part of the drawn landscape instead of floating characters.
const SETTING_GLYPHS: Record<SceneSetting, string[]> = {
  rain: ['🌧️', '⛈️', '🌧', '⛈'],
  desert: ['🏜️', '🏜', '🌵'],
  home: ['🏡', '🏠'],
  river: ['🌊', '🏖️', '🏖', '🚣'],
  forest: ['🌳', '🌲', '🌴'],
  meadow: [],
};
const SCENERY_GLYPHS = ['☀️', '☀', '🌈', '🌿', '🍃', '🌾', '🌸', '✨', '🎶'];
// Precedence when several settings appear in one scene.
const PRECEDENCE: SceneSetting[] = ['rain', 'desert', 'home', 'river', 'forest'];

/** Splits an illustration string ("☀️ 🦅 🏜️") into glyphs (they are space-separated in the data). */
function glyphs(illustration: string): string[] {
  return (illustration || '').split(/\s+/).map((g) => g.trim()).filter(Boolean);
}

export function composeScene(illustration: string, hero?: string): SceneComposition {
  const parts = glyphs(illustration);
  const setting = PRECEDENCE.find((s) => parts.some((g) => SETTING_GLYPHS[s].includes(g))) || 'meadow';
  const landscape = new Set<string>([...Object.values(SETTING_GLYPHS).flat(), ...SCENERY_GLYPHS]);
  let actors = parts.filter((g) => !landscape.has(g));
  if (actors.length === 0 && hero) actors = [hero];
  return {
    setting,
    actors: actors.slice(0, 4),
    rainbow: parts.includes('🌈'),
    sparkle: parts.includes('✨') || parts.includes('🎶'),
  };
}

/** Cover composition: the story's hero in the setting of its first page. */
export function composeCover(story: StoryBook): SceneComposition {
  const first = composeScene(story.scenes[0]?.illustration || '', story.coverEmoji);
  const heroFirst = [story.coverEmoji, ...first.actors.filter((a) => a !== story.coverEmoji)].slice(0, 2);
  return { ...first, actors: heroFirst };
}

export interface SceneCast {
  /** 3D characters with real artwork, one per distinct image (🪓 🪓 -> one woodcutter). */
  cast: { glyph: string; source: any }[];
  /** Objects / moods without character art (🏺 🍇 😢), shown as small badges. */
  props: string[];
}

/**
 * Splits a scene's actors into 3D-illustrated characters and small props.
 * When no actor has character art, the story hero stands in so a page is never empty.
 */
export function castScene(
  actors: string[],
  hero: string | undefined,
  lookup: (glyph: string) => any,
  maxCast = 3,
  maxProps = 2
): SceneCast {
  const cast: SceneCast['cast'] = [];
  const props: string[] = [];
  const seen = new Set<any>();
  actors.forEach((glyph) => {
    const source = lookup(glyph);
    if (source) {
      if (!seen.has(source) && cast.length < maxCast) {
        seen.add(source);
        cast.push({ glyph, source });
      }
    } else if (!props.includes(glyph) && props.length < maxProps) {
      props.push(glyph);
    }
  });
  if (cast.length === 0 && hero) {
    const heroSource = lookup(hero);
    if (heroSource) cast.push({ glyph: hero, source: heroSource });
  }
  return { cast, props };
}

export function getSceneComposition(scene: StoryScene | undefined, story: StoryBook): SceneComposition {
  return composeScene(scene?.illustration || '', story.coverEmoji);
}
