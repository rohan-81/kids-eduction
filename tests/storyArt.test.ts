// Storybook art: image-reference detection, resolution order (backend -> local map ->
// drawn scene) and scene composition from the story data.
import {
  isImageRef,
  toAbsoluteImageUrl,
  resolveStoryCover,
  resolveStoryScene,
  composeScene,
  composeCover,
  castScene,
  withArtVersion,
  STORY_ART_VERSION,
} from '../src/utils/storyArt';
import { STORIES_DATA, StoryBook } from '../src/data/storiesData';
import { STORY_IMAGE_MAP, STORY_CHARACTER_IMAGES } from '../src/utils/imageHelper';

const crow = STORIES_DATA.find((s) => s.id === 'story-crow') as StoryBook;

describe('image references from the backend', () => {
  test('URLs, media paths and image files are images; emoji text is not', () => {
    expect(isImageRef('https://cdn.example.com/crow.png')).toBe(true);
    expect(isImageRef('/media/stories/crow_1.jpg')).toBe(true);
    expect(isImageRef('stories/crow_cover.webp')).toBe(true);
    expect(isImageRef('☀️ 🦅 🏜️')).toBe(false);
    expect(isImageRef('🦅')).toBe(false);
    expect(isImageRef('')).toBe(false);
    expect(isImageRef(undefined)).toBe(false);
  });

  test('artwork URLs get a cache-busting version without breaking existing queries', () => {
    expect(STORY_ART_VERSION).toBe('3d_art_v3');
    expect(withArtVersion('http://h/media/a.png')).toBe('http://h/media/a.png?v=3d_art_v3');
    expect(withArtVersion('http://h/a.png?w=640')).toBe('http://h/a.png?w=640&v=3d_art_v3');
    expect(withArtVersion('http://h/a.png?v=old')).toBe('http://h/a.png?v=old');
  });

  test('media paths are made absolute against the API origin', () => {
    expect(toAbsoluteImageUrl('/media/a.png', 'http://127.0.0.1:8000/api')).toBe('http://127.0.0.1:8000/media/a.png');
    expect(toAbsoluteImageUrl('https://x.test/a.png', 'http://127.0.0.1:8000/api')).toBe('https://x.test/a.png');
  });
});

describe('resolution order', () => {
  test('backend artwork wins over the local map', () => {
    const story: StoryBook = {
      ...crow,
      coverImage: 'https://x.test/cover.png',
      scenes: crow.scenes.map((s, i) => (i === 0 ? { ...s, image: 'https://x.test/p1.png' } : s)),
    };
    const map = { 'story-crow': { cover: 101, scenes: { 1: 202, 2: 303 } } };
    expect(resolveStoryCover(story, map)).toEqual({ uri: 'https://x.test/cover.png' });
    expect(resolveStoryScene(story, 1, map)).toEqual({ uri: 'https://x.test/p1.png' });
    expect(resolveStoryScene(story, 2, map)).toBe(303);
  });

  test('no artwork anywhere -> null (component draws the illustrated scene)', () => {
    expect(resolveStoryCover(crow, {})).toBeNull();
    expect(resolveStoryScene(crow, 1, {})).toBeNull();
    expect(resolveStoryScene(crow, 99, {})).toBeNull();
  });

  test('the bundled registry maps authentic story cover illustrations', () => {
    expect(Object.keys(STORY_IMAGE_MAP).length).toBeGreaterThanOrEqual(8);
    expect(STORY_IMAGE_MAP['story-crow']?.cover).toBeDefined();
    expect(STORY_IMAGE_MAP['story-lion-mouse']?.cover).toBeDefined();
  });
});

describe('scene composition', () => {
  test('setting glyphs become the landscape, characters stand in it', () => {
    expect(composeScene('☀️ 🦅 🏜️')).toEqual({ setting: 'desert', actors: ['🦅'], rainbow: false, sparkle: false });
    expect(composeScene('🌊 🐜 🍃 🕊️ 🌳').setting).toBe('river');
    expect(composeScene('🌳 🐦 🏡 🌧️ ⛈️').setting).toBe('rain');
    expect(composeScene('🏡 🏺 💧').setting).toBe('home');
    expect(composeScene('🦁 💤 🌳 🐭').setting).toBe('forest');
    expect(composeScene('🦊 🍇').setting).toBe('meadow');
  });

  test('rainbows and sparkles are drawn, not shown as characters', () => {
    const c = composeScene('🦅 💧 🌈 🥳');
    expect(c.rainbow).toBe(true);
    expect(c.actors).toEqual(['🦅', '💧', '🥳']);
    expect(composeScene('☀️ 🌈 🐦 🌸 🦋 🎶').sparkle).toBe(true);
  });

  test('at most 4 characters; empty scenes fall back to the story hero', () => {
    expect(composeScene('🐭 🦷 🕸️ 🦁 🤝').actors).toHaveLength(4);
    expect(composeScene('', '🦁').actors).toEqual(['🦁']);
  });

  test('cover shows the hero first in its opening setting', () => {
    const cover = composeCover(crow);
    expect(cover.actors[0]).toBe(crow.coverEmoji);
    expect(cover.setting).toBe('desert');
  });

  test('3D cast: one figure per character art, objects become props, hero fills empty pages', () => {
    const lookup = (g: string) => ({ '🪓': 'woodcutter', '🦅': 'crow' } as Record<string, string>)[g];
    expect(castScene(['🧚‍♀️', '🎁', '🪓', '🪓'], '🪓', lookup)).toEqual({
      cast: [{ glyph: '🪓', source: 'woodcutter' }],
      props: ['🧚‍♀️', '🎁'],
    });
    expect(castScene(['🏺', '💧'], '🦅', lookup)).toEqual({ cast: [{ glyph: '🦅', source: 'crow' }], props: ['🏺', '💧'] });
  });

  test('every story page shows at least one real 3D character (no emoji-only stages)', () => {
    const lookup = (g: string) => STORY_CHARACTER_IMAGES[g];
    STORIES_DATA.forEach((s) => {
      expect(lookup(s.coverEmoji)).toBeDefined();
      s.scenes.forEach((sc) => {
        const { cast } = castScene(composeScene(sc.illustration, s.coverEmoji).actors, s.coverEmoji, lookup);
        expect(cast.length).toBeGreaterThan(0);
      });
    });
  });

  test('every bundled scene composes into a drawn illustration with at least one character', () => {
    STORIES_DATA.forEach((s) => {
      expect(composeCover(s).actors.length).toBeGreaterThan(0);
      s.scenes.forEach((sc) => {
        const comp = composeScene(sc.illustration, s.coverEmoji);
        expect(comp.actors.length).toBeGreaterThan(0);
        expect(['desert', 'river', 'forest', 'rain', 'home', 'meadow']).toContain(comp.setting);
      });
    });
  });
});
