// Centralized local & remote image resolver for KidsZone
// Ensures all animal, bird, and fruit photos are 100% authentic, verified, and bundled locally
import { EXTRA_RENDERS_BY_LESSON } from './extraRenders';
import { ANIMAL_RENDERS_BY_LESSON } from './animalRenders';
import { characterAsset, appAsset, isBackendCharacterUrl } from './remoteAssets';

export const CARTOON_HERO_IMAGE = appAsset('cartoon_hero.webp');
export const CARTOON_BATTLE_IMAGE = appAsset('cartoon_battle.webp');
export const CARTOON_WORDS_IMAGE = appAsset('cartoon_words.webp');
export const CARTOON_MARKET_IMAGE = appAsset('cartoon_market.webp');
export const CARTOON_DRAWING_IMAGE = appAsset('cartoon_drawing.webp');
export const CARTOON_BALLOONS_IMAGE = appAsset('cartoon_balloons.webp');
export const CARTOON_RHYMES_IMAGE = appAsset('cartoon_rhymes.webp');
export const CARTOON_ADVENTURE_IMAGE = appAsset('cartoon_adventure.webp');
export const CARTOON_GARDEN_IMAGE = appAsset('cartoon_garden.webp');
export const ADVENTURE_MAP_BACKGROUND = appAsset('adventure_map_bg.webp');
export const FANTASY_ADVENTURE_HEADER = appAsset('fantasy_adventure_header.webp');
export const ADVENTURE_SEAMLESS_BG = appAsset('adventure_seamless_bg.webp');

// 3D Pixar / Claymorphic Studio Style Assets Matching Reference Design
export const HERO_3D_BANNER = require('../../assets/images/3d_style/hero_3d_banner.webp');
export const HERO_PENCIL_BOY = require('../../assets/images/3d_style/hero_pencil_boy.webp');
export const AVATAR_3D_BOY = require('../../assets/images/3d_style/avatar_3d_boy.webp');
export const AVATAR_3D_GIRL = require('../../assets/images/3d_style/avatar_3d_girl.webp');
export const MILESTONE_BANNER = require('../../assets/images/3d_style/milestone_banner.webp');
export const ICON_3D_STAR = require('../../assets/images/3d_style/3d_yellow_star.webp');
export const ICON_3D_MOUNTAIN = require('../../assets/images/3d_style/3d_mountain_flag.webp');

export const ICONS_3D = {
  math: require('../../assets/images/3d_style/new_icon_math.webp'),
  science: require('../../assets/images/3d_style/new_icon_science.webp'),
  globe: require('../../assets/images/3d_style/new_icon_globe.webp'),
  bulb: require('../../assets/images/3d_style/new_icon_bulb.webp'),
  words: require('../../assets/images/3d_style/new_icon_words.webp'),
  book: require('../../assets/images/3d_style/new_icon_book.webp'),
  palette: require('../../assets/images/3d_style/new_icon_creativity.webp'),
  brain: require('../../assets/images/3d_style/new_icon_brain.webp'),
  trophy: require('../../assets/images/3d_style/new_icon_trophy.webp'),
};

/**
 * 3D Pixar / Cartoon transparent character illustrations matching reference design
 */
export const STORY_CHARACTER_IMAGES: Record<string, any> = {
  '🦅': characterAsset('3d_eagle'),
  '🦁': characterAsset('3d_lion'),
  '🐭': characterAsset('3d_mouse'),
  '🐢': characterAsset('3d_tortoise'),
  '🐇': characterAsset('3d_hare'),
  '🐒': characterAsset('3d_monkey'),
  '🐵': characterAsset('3d_monkey'),
  '🐁': characterAsset('3d_mouse'),
  '🐰': characterAsset('3d_hare'),
  '🐊': characterAsset('3d_crocodile'),
  '🐜': characterAsset('3d_ant'),
  '🕊️': characterAsset('3d_dove'),
  '🕊': characterAsset('3d_dove'),
  '🪓': characterAsset('3d_woodcutter'),
  '🦊': characterAsset('3d_fox'),
  '🐦‍⬛': characterAsset('3d_crow'),
  '🐄': characterAsset('3d_cow'),
  '🐦': characterAsset('3d_sparrow'),
  '🐻': characterAsset('3d_bear'),
  '🦉': characterAsset('3d_owl'),
  vulture: characterAsset('3d_vulture'),
  eagle: characterAsset('3d_eagle'),
  // AI Magic Story Maker companions (downloaded & disk-cached on first use)
  '🐘': appAsset('magic/3d_elephant.webp'),
  '🐶': appAsset('magic/3d_puppy.webp'),
  '🦄': appAsset('magic/3d_unicorn.webp'),
  '🐬': appAsset('magic/3d_dolphin.webp'),
  '🦜': appAsset('magic/3d_parrot.webp'),
};

/**
 * 3D Character icons for all animals & wildlife keyed directly by soundKey/animalId
 */
export const ANIMAL_CHARACTER_IMAGES: Record<string, any> = {
  lion: characterAsset('3d_lion'),
  cow: characterAsset('3d_cow'),
  cat: characterAsset('3d_cat'),
  dog: characterAsset('3d_dog'),
  bird: characterAsset('3d_sparrow'),
  peacock: characterAsset('3d_peacock'),
  elephant: characterAsset('3d_elephant'),
  duck: characterAsset('3d_duck'),
  monkey: characterAsset('3d_monkey'),
  rooster: characterAsset('3d_rooster'),
  horse: characterAsset('3d_horse'),
  sheep: characterAsset('3d_sheep'),
  tiger: characterAsset('3d_tiger'),
  frog: characterAsset('3d_frog'),
  bee: characterAsset('3d_butterfly'),
  parrot: characterAsset('3d_parrot'),
  rabbit: characterAsset('3d_hare'),
  hare: characterAsset('3d_hare'),
  camel: characterAsset('3d_camel'),
  deer: characterAsset('3d_deer'),
  giraffe: characterAsset('3d_giraffe'),
  zebra: characterAsset('3d_zebra'),
  bear: characterAsset('3d_bear'),
  pigeon: characterAsset('3d_dove'),
  dove: characterAsset('3d_dove'),
  donkey: characterAsset('3d_donkey'),
  crow: characterAsset('3d_crow'),
  owl: characterAsset('3d_owl'),
  goat: characterAsset('3d_goat'),
  sparrow: characterAsset('3d_sparrow'),
  buffalo: characterAsset('3d_buffalo'),
  fox: characterAsset('3d_fox'),
  wolf: characterAsset('3d_wolf'),
  leopard: characterAsset('3d_leopard'),
  cheetah: characterAsset('3d_cheetah'),
  panda: characterAsset('3d_panda'),
  kangaroo: characterAsset('3d_kangaroo'),
  hippo: characterAsset('3d_hippo'),
  rhino: characterAsset('3d_rhino'),
  squirrel: characterAsset('3d_squirrel'),
  ox: characterAsset('3d_ox'),
  turtle: characterAsset('3d_tortoise'),
  tortoise: characterAsset('3d_tortoise'),
  crocodile: characterAsset('3d_crocodile'),
  koel: characterAsset('3d_koel'),
  eagle: characterAsset('3d_eagle'),
  swan: characterAsset('3d_swan'),
  flamingo: characterAsset('3d_flamingo'),
  crane: characterAsset('3d_crane'),
  woodpecker: characterAsset('3d_woodpecker'),
  kingfisher: characterAsset('3d_kingfisher'),
  penguin: characterAsset('3d_penguin'),
  ostrich: characterAsset('3d_ostrich'),
  vulture: characterAsset('3d_vulture'),
};



/**
 * 3D clay art for story objects (shown in small bubbles on a story page instead of
 * emoji). Generated by scripts/generate_clay_icons.py.
 */
export const STORY_PROP_IMAGES: Record<string, any> = {
  '🚀': appAsset('magic/quest_rocket.webp'),
  '🦕': appAsset('magic/quest_dino.webp'),
  '🍦': appAsset('magic/quest_icecream.webp'),
  '🏰': appAsset('magic/quest_cloud.webp'),
  '💎': appAsset('magic/quest_rainbow.webp'),
  '🪄': appAsset('magic/tool_wand.webp'),
  '🎈': appAsset('magic/tool_balloon.webp'),
  '👟': appAsset('magic/tool_shoes.webp'),
  '🦸': appAsset('magic/tool_cape.webp'),
  '🧭': appAsset('magic/tool_compass.webp'),
  '👑': appAsset('magic/ui_crown.webp'),
  '🧙‍♂️': appAsset('magic/ui_wizard.webp'),
};

/**
 * 3D clay art for the home screen's primary learning cards (scripts/generate_clay_icons.py).
 * ABC and 123 come per language so the toy blocks / candy numbers match the card title.
 */
export const HOME_CARD_ART = {
  abc: {
    en: require('../../assets/images/home/abc_en.webp'),
    gu: require('../../assets/images/home/abc_gu.webp'),
    hi: require('../../assets/images/home/abc_hi.webp'),
  },
  counting: {
    en: require('../../assets/images/home/123_en.webp'),
    gu: require('../../assets/images/home/123_gu.webp'),
    hi: require('../../assets/images/home/123_hi.webp'),
  },
  animals: require('../../assets/images/home/animals.webp'),
  coloring: require('../../assets/images/home/coloring.webp'),
  storybook: require('../../assets/images/home/storybook.webp'),
};

/**
 * Transparent 3D art for the home screen subject cards. math..logic are cut out of the
 * 3d_style/new_icon_*.jpg renders (scripts/cutout_subject_icons.py); braingames and the
 * challenge star are clay art (scripts/generate_clay_icons.py).
 */
export const SUBJECT_CARD_ART = {
  math: require('../../assets/images/subjects/math.webp'),
  science: require('../../assets/images/subjects/science.webp'),
  english: require('../../assets/images/subjects/english.webp'),
  gk: require('../../assets/images/subjects/gk.webp'),
  logic: require('../../assets/images/subjects/logic.webp'),
  braingames: require('../../assets/images/subjects/braingames.webp'),
  star: require('../../assets/images/subjects/star.webp'),
};

/** Authentic 3D render used by topic badges (cut out of 3d_style/new_icon_brain.jpg). Other topic art is vector (src/components/art3d). */
export const TOPIC_ART = {
  brain: require('../../assets/images/subjects/brain.webp'),
};

/** 3D clay reward art: trophy, medal and gift box (scripts/generate_clay_icons.py). */
export const REWARD_ART = {
  trophy: require('../../assets/images/rewards/trophy.webp'),
  medal: require('../../assets/images/rewards/medal.webp'),
  gift: require('../../assets/images/rewards/gift.webp'),
};

/** 3D header / badge art for the AI Magic Story Maker. */
export const MAGIC_UI_ART = {
  wizard: appAsset('magic/ui_wizard.webp'),
  crown: appAsset('magic/ui_crown.webp'),
  wand: appAsset('magic/tool_wand.webp'),
  rocket: appAsset('magic/quest_rocket.webp'),
  treasure: appAsset('magic/quest_ocean.webp'),
};

/**
 * 3D clay & character illustrations for Sticker Album items.
 * Ensures modern 3D look and avoids missing emoji glyphs (e.g. 🪄 magic wand on Windows 10).
 */
export const STICKER_IMAGE_MAP: Record<string, any> = {
  'stk-wand': appAsset('magic/tool_wand.webp'),
  'stk-rocket': appAsset('magic/quest_rocket.webp'),
  'stk-crown': appAsset('magic/ui_crown.webp'),
  'stk-icecream': appAsset('magic/quest_icecream.webp'),
  'stk-balloon': appAsset('magic/tool_balloon.webp'),
  'stk-rainbow': appAsset('magic/quest_rainbow.webp'),
  'stk-lion': characterAsset('3d_lion'),
  'stk-elephant': appAsset('magic/3d_elephant.webp'),
  'stk-bunny': characterAsset('3d_hare'),
  'stk-fox': characterAsset('3d_fox'),
  'stk-panda': characterAsset('3d_panda'),
  'stk-monkey': characterAsset('3d_monkey'),
  'stk-parrot': appAsset('magic/3d_parrot.webp'),
  'stk-unicorn': appAsset('magic/3d_unicorn.webp'),
  'stk-teddy': characterAsset('3d_bear'),
  'stk-star': require('../../assets/images/3d_style/3d_yellow_star.webp'),
  // Fallback lookup by emoji glyph:
  '🪄': appAsset('magic/tool_wand.webp'),
};

export function getStickerImage(key?: string): any | null {
  if (!key) return null;
  return STICKER_IMAGE_MAP[key] ?? null;
}

/**
 * Local storybook artwork registry: story id -> bundled cover / per-page scene images.
 */
export const STORY_IMAGE_MAP: Record<string, { cover?: any; scenes?: Record<number, any> }> = {
  'story-crow': { cover: appAsset('stories/story_crow_cover.webp') },
  'crow': { cover: appAsset('stories/story_crow_cover.webp') },
  '1': { cover: appAsset('stories/story_crow_cover.webp') },
  'story-lion-mouse': { cover: appAsset('stories/story_lion_mouse_cover.webp') },
  'lion-mouse': { cover: appAsset('stories/story_lion_mouse_cover.webp') },
  '2': { cover: appAsset('stories/story_lion_mouse_cover.webp') },
  'story-tortoise-hare': { cover: appAsset('stories/story_tortoise_hare_cover.webp') },
  'tortoise-hare': { cover: appAsset('stories/story_tortoise_hare_cover.webp') },
  '3': { cover: appAsset('stories/story_tortoise_hare_cover.webp') },
  'story-monkey-crocodile': { cover: appAsset('stories/story_monkey_crocodile_cover.webp') },
  'monkey-crocodile': { cover: appAsset('stories/story_monkey_crocodile_cover.webp') },
  '4': { cover: appAsset('stories/story_monkey_crocodile_cover.webp') },
  'story-ant-dove': { cover: appAsset('stories/story_ant_dove_cover.webp') },
  'ant-dove': { cover: appAsset('stories/story_ant_dove_cover.webp') },
  '5': { cover: appAsset('stories/story_ant_dove_cover.webp') },
  'story-honest-woodcutter': { cover: appAsset('stories/story_woodcutter_cover.webp') },
  'story-woodcutter': { cover: appAsset('stories/story_woodcutter_cover.webp') },
  'woodcutter': { cover: appAsset('stories/story_woodcutter_cover.webp') },
  'honest-woodcutter': { cover: appAsset('stories/story_woodcutter_cover.webp') },
  '6': { cover: appAsset('stories/story_woodcutter_cover.webp') },
  'story-fox-grapes': { cover: appAsset('stories/story_fox_grapes_cover.webp') },
  'fox-grapes': { cover: appAsset('stories/story_fox_grapes_cover.webp') },
  '7': { cover: appAsset('stories/story_fox_grapes_cover.webp') },
  'story-kind-sparrow': { cover: appAsset('stories/story_sparrow_cover.webp') },
  'story-sparrow': { cover: appAsset('stories/story_sparrow_cover.webp') },
  'sparrow': { cover: appAsset('stories/story_sparrow_cover.webp') },
  'kind-sparrow': { cover: appAsset('stories/story_sparrow_cover.webp') },
  '8': { cover: appAsset('stories/story_sparrow_cover.webp') },
};

export const LOCAL_ANIMAL_IMAGES: Record<string, any> = {
  // Verified photographs (served via backend/media/app_assets & disk-cached)
  'an-peacock': appAsset('peacock.webp'),
  'an-cat': appAsset('cat.webp'),
  'an-dog': appAsset('dog.webp'),
  'an-cow': appAsset('cow.webp'),
  'an-lion': appAsset('lion.webp'),
  'an-tiger': appAsset('tiger.webp'),
  'an-duck': appAsset('duck.webp'),
  'an-camel': appAsset('camel.webp'),
  'an-monkey': appAsset('monkey.webp'),
  'an-giraffe': appAsset('giraffe.webp'),
  'an-bear': appAsset('bear.webp'),
  'an-pigeon': appAsset('pigeon.webp'),
  'an-rooster': appAsset('rooster.webp'),
  'an-hippo': appAsset('hippo.webp'),
  'an-kangaroo': appAsset('kangaroo.webp'),
  'an-cheetah': appAsset('cheetah.webp'),
  'an-buffalo': appAsset('buffalo.webp'),
  'an-donkey': appAsset('donkey.webp'),
  'an-ox': appAsset('ox.webp'),
  'an-crocodile': appAsset('crocodile.webp'),
  'an-crow': appAsset('crow.webp'),
  'an-frog': appAsset('frog.webp'),
  'an-koel': appAsset('koel.webp'),
  'an-woodpecker': appAsset('woodpecker.webp'),
  'an-ostrich': appAsset('ostrich.webp'),
  'an-kingfisher': appAsset('kingfisher.webp'),
  'an-crane': appAsset('crane.webp'),
  'an-swan': appAsset('swan.webp'),
  'an-eagle': appAsset('eagle.webp'),
  'an-rhino': appAsset('rhino.jpg'),
  'an-wolf': appAsset('wolf.webp'),
  'an-sheep': appAsset('sheep.webp'),

  // Alphabet lessons mappings
  'gu-swar-6': appAsset('camel.webp'),
  'gu-vyan-ba': appAsset('duck.webp'),
  'gu-vyan-ma': appAsset('peacock.webp'),
  'hi-vyan-ka': appAsset('pigeon.webp'),
  'hi-vyan-mo': appAsset('peacock.webp'),
  'hi-vyan-va': appAsset('crane.webp'),
  'gu-bk-kaa': appAsset('crow.webp'),
  'gu-bk-ko': appAsset('koel.webp'),
  'en-c': appAsset('cat.webp'),
  'en-d': appAsset('dog.webp'),
  'en-l': appAsset('lion.webp'),
  'en-m': appAsset('monkey.webp'),
  'en-t': appAsset('tiger.webp'),
  'en-alpha-c': appAsset('cat.webp'),
  'en-alpha-d': appAsset('dog.webp'),
  'en-alpha-l': appAsset('lion.webp'),
  'en-alpha-m': appAsset('monkey.webp'),
  'en-alpha-p': appAsset('peacock.webp'),
  'en-alpha-t': appAsset('tiger.webp'),

  // GK Symbols & English Words
  'sym-bird': appAsset('peacock.webp'),
  'sym-animal': appAsset('tiger.webp'),
  'word-cat': appAsset('cat.webp'),
  'word-dog': appAsset('dog.webp'),
};

/**
 * Official Indian currency assets (Reserve Bank of India 2019 Definitive Coins & MG New Series Banknotes)
 */
export const INDIAN_CURRENCY_IMAGES: Record<string, any> = {
  'money-coin-1': appAsset('currency/coin_1_rupee.webp'),
  'money-coin-2': appAsset('currency/coin_2_rupee.webp'),
  'money-coin-5': appAsset('currency/coin_5_rupee.webp'),
  'money-coin-10': appAsset('currency/coin_10_rupee.webp'),
  'money-note-10': appAsset('currency/note_10_rupee.webp'),
  'money-note-20': appAsset('currency/note_20_rupee.webp'),
  'money-note-50': appAsset('currency/note_50_rupee.webp'),
  'money-note-100': appAsset('currency/note_100_rupee.webp'),
};

// Abstract and concept-only categories that should never display animal heuristic fallback photos
const NON_IMAGE_CATEGORIES = new Set([
  'weather-seasons',
  'scientific-discoveries',
  'plants-nature',
  'water-air',
  'earth-environment',
  'space-solar',
  'human-body',
  'en-grammar',
  'en-sentences',
  'en-vowels',
  'gk-states',
  'gk-countries',
  'gk-monuments',
  'gk-history',
  'gk-personalities',
  'gk-inventions',
  'math',
  'math-time',
  'math-missing',
  'math-word-problems',
  'numbers',
]);

export function getLessonImageSource(
  item: {
    id?: string;
    categoryId?: string;
    imageUrl?: string;
    title?: string;
    exampleWord?: string;
    exampleMeaning?: string;
    exampleMeaningGu?: string;
    exampleMeaningHi?: string;
  } | null | undefined
): any {
  if (!item) return null;

  // 0. A 3D render the backend database assigned to this lesson (absolute /media/characters/ URL)
  if (isBackendCharacterUrl(item.imageUrl)) {
    return { uri: item.imageUrl };
  }

  // 1. Direct ID lookup in the render registries (remote, disk-cached) and verified local assets
  if (item.id && EXTRA_RENDERS_BY_LESSON[item.id]) {
    return EXTRA_RENDERS_BY_LESSON[item.id];
  }
  if (item.id && ANIMAL_RENDERS_BY_LESSON[item.id]) {
    return ANIMAL_RENDERS_BY_LESSON[item.id];
  }
  if (item.id && INDIAN_CURRENCY_IMAGES[item.id]) {
    return INDIAN_CURRENCY_IMAGES[item.id];
  }
  if (item.id && LOCAL_ANIMAL_IMAGES[item.id]) {
    return LOCAL_ANIMAL_IMAGES[item.id];
  }

  // 2. Intercept and replace old inaccurate Unsplash IDs across legacy data
  const imgUrl = item.imageUrl || '';
  if (imgUrl.includes('1563281577-a7be47e20db9')) return LOCAL_ANIMAL_IMAGES['an-camel'];
  if (imgUrl.includes('1555854877-bab0e564b8d5')) return LOCAL_ANIMAL_IMAGES['an-duck'];
  if (imgUrl.includes('1518717758536-85ae29035b6d')) return LOCAL_ANIMAL_IMAGES['an-pigeon'];
  if (imgUrl.includes('1578885564199-db62248858cf')) return LOCAL_ANIMAL_IMAGES['an-peacock'];
  if (imgUrl.includes('1541781774459-bb2af2f05b55')) return LOCAL_ANIMAL_IMAGES['an-hippo'];
  if (imgUrl.includes('1589656966895-2f33e7653819')) return LOCAL_ANIMAL_IMAGES['an-kangaroo'];
  if (imgUrl.includes('1534177616072-ef7dc120449d')) return LOCAL_ANIMAL_IMAGES['an-cheetah'];
  if (imgUrl.includes('1549366021-9f761d450615')) return LOCAL_ANIMAL_IMAGES['an-buffalo'];
  if (imgUrl.includes('1596733430284-f7437764b1a9')) return LOCAL_ANIMAL_IMAGES['an-donkey'];
  if (imgUrl.includes('1570042225831-d98fa7577f1e')) return LOCAL_ANIMAL_IMAGES['an-ox'];
  if (imgUrl.includes('1516426122078-c23e76319801')) return LOCAL_ANIMAL_IMAGES['an-crocodile'];
  if (imgUrl.includes('1597848212624-a19eb35e2651')) return LOCAL_ANIMAL_IMAGES['an-crow'];
  if (imgUrl.includes('1579202673506-ca3ce28943ef')) return LOCAL_ANIMAL_IMAGES['an-frog'];
  if (imgUrl.includes('1606567595334-d39972c85dbe')) return LOCAL_ANIMAL_IMAGES['an-koel'];
  if (imgUrl.includes('1591871937573-74dbba515c4c')) return LOCAL_ANIMAL_IMAGES['an-woodpecker'];
  if (imgUrl.includes('1545671913-b89ac1b4ac10')) return LOCAL_ANIMAL_IMAGES['an-ostrich'];
  if (imgUrl.includes('1551887196-72e32bfc7bf3')) return LOCAL_ANIMAL_IMAGES['an-kingfisher'];
  if (imgUrl.includes('1559863345-02eae058c2c2')) {
    // Shared between swan and crane in legacy data
    if (item.id === 'an-crane' || (item.title && item.title.includes('Crane'))) {
      return LOCAL_ANIMAL_IMAGES['an-crane'];
    }
    return LOCAL_ANIMAL_IMAGES['an-swan'];
  }
  if (imgUrl.includes('1568607689150-17e625c1586e')) return LOCAL_ANIMAL_IMAGES['an-eagle'];
  if (imgUrl.includes('1533038590840-1cde6e668a91')) return LOCAL_ANIMAL_IMAGES['an-rhino'];
  if (imgUrl.includes('1564349683136-77e08dba1ef7')) return LOCAL_ANIMAL_IMAGES['an-wolf'];
  if (imgUrl.includes('1484557052118-f32bd25b45b5')) return LOCAL_ANIMAL_IMAGES['an-sheep'];
  if (imgUrl.includes('1501705388883-4ed8a543392c')) {
    return { uri: 'https://images.unsplash.com/photo-1578326457399-3b34dbbf23b8?w=600&auto=format&fit=crop&q=80' };
  }

  // 3. Skip heuristic animal matching for abstract/concept-only categories
  if (item.categoryId && NON_IMAGE_CATEGORIES.has(item.categoryId)) {
    if (item.imageUrl) {
      return { uri: item.imageUrl };
    }
    return null;
  }

  // 4. Keyword-based matching on title and exampleWord with whole words only
  const allTexts = ` ${[item.id || '', item.title || '', item.exampleWord || ''].join(' ').toLowerCase()} `;

  const hasWord = (w: string) => {
    const regex = new RegExp(`(^|[\\s•—\\-_.,/()]+)${w}([\\s•—\\-_.,/()]+|$)`, 'i');
    return regex.test(allTexts);
  };

  if (hasWord('zebra') || hasWord('ઝીબ્રા') || hasWord('ज़ेबरा')) {
    return { uri: 'https://images.unsplash.com/photo-1578326457399-3b34dbbf23b8?w=600&auto=format&fit=crop&q=80' };
  }

  if (hasWord('ઊંટ') || hasWord('ऊँट') || hasWord('camel')) {
    return LOCAL_ANIMAL_IMAGES['an-camel'];
  }
  if (hasWord('બતક') || hasWord('बत्तख') || hasWord('duck')) {
    return LOCAL_ANIMAL_IMAGES['an-duck'];
  }
  if (hasWord('કબૂતર') || hasWord('कबूतर') || hasWord('pigeon')) {
    return LOCAL_ANIMAL_IMAGES['an-pigeon'];
  }
  if (hasWord('મોર') || hasWord('मोर') || hasWord('peacock')) {
    return LOCAL_ANIMAL_IMAGES['an-peacock'];
  }
  if (hasWord('વાંદરો') || hasWord('વાંદરા') || hasWord('બંદર') || hasWord('monkey')) {
    return LOCAL_ANIMAL_IMAGES['an-monkey'];
  }
  if (hasWord('જિરાફ') || hasWord('जिराफ़') || hasWord('giraffe')) {
    return LOCAL_ANIMAL_IMAGES['an-giraffe'];
  }
  if (hasWord('રીંછ') || hasWord('भालू') || hasWord('bear')) {
    return LOCAL_ANIMAL_IMAGES['an-bear'];
  }
  if (hasWord('કૂકડો') || hasWord('मुर्गा') || hasWord('rooster')) {
    return LOCAL_ANIMAL_IMAGES['an-rooster'];
  }
  if (hasWord('બિલાડી') || hasWord('बिल्ली') || hasWord('cat')) {
    return LOCAL_ANIMAL_IMAGES['an-cat'];
  }
  if (hasWord('કૂતરો') || hasWord('કુતરો') || hasWord('कुत्ता') || hasWord('dog')) {
    return LOCAL_ANIMAL_IMAGES['an-dog'];
  }
  if (hasWord('ગાય') || hasWord('गाय') || hasWord('cow')) {
    return LOCAL_ANIMAL_IMAGES['an-cow'];
  }
  if (hasWord('સિંહ') || hasWord('सिंह') || hasWord('lion')) {
    return LOCAL_ANIMAL_IMAGES['an-lion'];
  }
  if (hasWord('વાઘ') || hasWord('बाघ') || hasWord('tiger')) {
    return LOCAL_ANIMAL_IMAGES['an-tiger'];
  }
  if (hasWord('hippo') || hasWord('હિપ્પો') || hasWord('દરિયાઈ ઘોડો') || hasWord('दरियाई घोड़ा')) {
    return LOCAL_ANIMAL_IMAGES['an-hippo'];
  }
  if (hasWord('kangaroo') || hasWord('કાંગારૂ') || hasWord('કંગારૂ') || hasWord('कंगारू')) {
    return LOCAL_ANIMAL_IMAGES['an-kangaroo'];
  }
  if (hasWord('cheetah') || hasWord('ચિત્તો') || hasWord('ચીતા') || hasWord('चीता')) {
    return LOCAL_ANIMAL_IMAGES['an-cheetah'];
  }
  if (hasWord('buffalo') || hasWord('ભેંસ') || hasWord('ભેસ') || hasWord('भैंस')) {
    return LOCAL_ANIMAL_IMAGES['an-buffalo'];
  }
  if (hasWord('donkey') || hasWord('ગધેડો') || hasWord('गधा')) {
    return LOCAL_ANIMAL_IMAGES['an-donkey'];
  }
  if (hasWord('ox') || hasWord('bull') || hasWord('બળદ') || hasWord('बैल')) {
    return LOCAL_ANIMAL_IMAGES['an-ox'];
  }
  if (hasWord('crocodile') || hasWord('alligator') || hasWord('મગર') || hasWord('मगरमच्छ')) {
    return LOCAL_ANIMAL_IMAGES['an-crocodile'];
  }
  if (hasWord('crow') || hasWord('કાગડો') || hasWord('કાગડા') || hasWord('कौआ')) {
    return LOCAL_ANIMAL_IMAGES['an-crow'];
  }
  if (hasWord('frog') || hasWord('દેડકો') || hasWord('દેડકા') || hasWord('मेंढक')) {
    return LOCAL_ANIMAL_IMAGES['an-frog'];
  }
  if (hasWord('koel') || hasWord('cuckoo') || hasWord('કોયલ') || hasWord('कोयल')) {
    return LOCAL_ANIMAL_IMAGES['an-koel'];
  }
  if (hasWord('woodpecker') || hasWord('લક્કડખોદ') || hasWord('कठफोड़वा')) {
    return LOCAL_ANIMAL_IMAGES['an-woodpecker'];
  }
  if (hasWord('ostrich') || hasWord('શાહમૃગ') || hasWord('शुतुरमुर्ग')) {
    return LOCAL_ANIMAL_IMAGES['an-ostrich'];
  }
  if (hasWord('kingfisher') || hasWord('કલકલિયો') || hasWord('નીલકંઠ') || hasWord('नीलकंठ')) {
    return LOCAL_ANIMAL_IMAGES['an-kingfisher'];
  }
  if (hasWord('crane') || hasWord('egret') || hasWord('બગલો') || hasWord('बगुला') || hasWord('वक')) {
    return LOCAL_ANIMAL_IMAGES['an-crane'];
  }
  if (hasWord('swan') || hasWord('હંસ') || hasWord('हंस')) {
    return LOCAL_ANIMAL_IMAGES['an-swan'];
  }
  if (hasWord('eagle') || hasWord('ગરુડ') || hasWord('गरुड़')) {
    return LOCAL_ANIMAL_IMAGES['an-eagle'];
  }
  if (hasWord('vulture') || hasWord('ગીધ') || hasWord('गिद्ध')) {
    return ANIMAL_CHARACTER_IMAGES['vulture'] || LOCAL_ANIMAL_IMAGES['an-eagle'];
  }
  if (hasWord('rhino') || hasWord('rhinoceros') || hasWord('ગેંડો') || hasWord('ગંડો') || hasWord('गैंडा')) {
    return LOCAL_ANIMAL_IMAGES['an-rhino'];
  }
  if (hasWord('wolf') || hasWord('વરુ') || hasWord('भेड़िया')) {
    return LOCAL_ANIMAL_IMAGES['an-wolf'];
  }
  if (hasWord('sheep') || hasWord('lamb') || hasWord('ઘેટું') || hasWord('ઘેટુ') || hasWord('ભેડ') || hasWord('भेड़')) {
    return LOCAL_ANIMAL_IMAGES['an-sheep'];
  }

  // 5. Fallback to valid remote image
  if (item.imageUrl) {
    return { uri: item.imageUrl };
  }

  return null;
}
