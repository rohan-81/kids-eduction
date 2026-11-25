import { AppLanguage } from '../types';

/** Built-in album categories; the backend may add more (rendered with a generic tab). */
export type StickerCategory = 'animals' | 'space' | 'magic' | 'treats';

export interface StickerItem {
  id: string;
  emoji: string;
  category: StickerCategory | string;
  name: {
    en: string;
    gu: string;
    hi: string;
  };
  defaultUnlocked: boolean;
}

export interface StickerScene {
  id: string;
  name: {
    en: string;
    gu: string;
    hi: string;
  };
  icon: string;
  bgColor: string;
  groundColor: string;
  decorEmojis: string[];
}

export const STICKER_SCENES: StickerScene[] = [
  {
    id: 'park',
    name: {
      en: 'Sunny Garden Park',
      gu: 'તડકોવાળો બગીચો',
      hi: 'धूपदार बगीचा पार्क',
    },
    icon: '🌳',
    bgColor: '#E0F2FE',
    groundColor: '#86EFAC',
    decorEmojis: ['🌸', '☀️', '🌱', '🌼'],
  },
  {
    id: 'space',
    name: {
      en: 'Cosmic Galaxy',
      gu: 'અંતરિક્ષ આકાશ',
      hi: 'अंतरिक्ष गैलेक्सी',
    },
    icon: '🚀',
    bgColor: '#1E1B4B',
    groundColor: '#312E81',
    decorEmojis: ['✨', '🪐', '⭐', '🌌'],
  },
  {
    id: 'ocean',
    name: {
      en: 'Ocean Reef',
      gu: 'સમુદ્ર સફારી',
      hi: 'सागर रीफ सफारी',
    },
    icon: '🌊',
    bgColor: '#BAE6FD',
    groundColor: '#38BDF8',
    decorEmojis: ['🫧', '🪸', '🐚', '🐟'],
  },
  {
    id: 'castle',
    name: {
      en: 'Fairy Castle',
      gu: 'જાદુઈ પરી મહેલ',
      hi: 'जादुई परी महल',
    },
    icon: '🏰',
    bgColor: '#FCE7F3',
    groundColor: '#F472B6',
    decorEmojis: ['✨', '☁️', '🌈', '⭐'],
  },
];

export const STICKER_CATALOG: StickerItem[] = [
  // --- Animals ---
  {
    id: 'stk-lion',
    emoji: '🦁',
    category: 'animals',
    name: { en: 'Brave Lion', gu: 'બહાદુર સિંહ', hi: 'बहादुर शेर' },
    defaultUnlocked: true,
  },
  {
    id: 'stk-elephant',
    emoji: '🐘',
    category: 'animals',
    name: { en: 'Happy Elephant', gu: 'મોટો હાથી', hi: 'नटखट हाथी' },
    defaultUnlocked: true,
  },
  {
    id: 'stk-bunny',
    emoji: '🐰',
    category: 'animals',
    name: { en: 'Cute Bunny', gu: 'સફેદ સસલું', hi: 'प्यारा खरगोश' },
    defaultUnlocked: true,
  },
  {
    id: 'stk-butterfly',
    emoji: '🦋',
    category: 'animals',
    name: { en: 'Color Butterfly', gu: 'રંગબેરંગી પતંગિયું', hi: 'रंग-बिरंगी तितली' },
    defaultUnlocked: true,
  },
  {
    id: 'stk-fox',
    emoji: '🦊',
    category: 'animals',
    name: { en: 'Clever Fox', gu: 'ચતુર શિયાળ', hi: 'चालाक लोमड़ी' },
    defaultUnlocked: false,
  },
  {
    id: 'stk-panda',
    emoji: '🐼',
    category: 'animals',
    name: { en: 'Cuddly Panda', gu: 'પાંડા રીંછ', hi: 'प्यारा पांडा' },
    defaultUnlocked: false,
  },
  {
    id: 'stk-monkey',
    emoji: '🐵',
    category: 'animals',
    name: { en: 'Playful Monkey', gu: 'મસ્તીખોર વાંદરો', hi: 'नटखट बंदर' },
    defaultUnlocked: false,
  },
  {
    id: 'stk-parrot',
    emoji: '🦜',
    category: 'animals',
    name: { en: 'Talking Parrot', gu: 'મીઠો પોપટ', hi: 'मीठा तोता' },
    defaultUnlocked: false,
  },

  // --- Space & Adventure ---
  {
    id: 'stk-rocket',
    emoji: '🚀',
    category: 'space',
    name: { en: 'Speed Rocket', gu: 'રોકેટ વિમાન', hi: 'स्पीड रॉकेट' },
    defaultUnlocked: true,
  },
  {
    id: 'stk-star',
    emoji: '⭐',
    category: 'space',
    name: { en: 'Golden Star', gu: 'સોનેરી તારો', hi: 'चमकता तारा' },
    defaultUnlocked: true,
  },
  {
    id: 'stk-moon',
    emoji: '🌙',
    category: 'space',
    name: { en: 'Crescent Moon', gu: 'ચંદામામા', hi: 'चंदा मामा' },
    defaultUnlocked: true,
  },
  {
    id: 'stk-astronaut',
    emoji: '🧑‍🚀',
    category: 'space',
    name: { en: 'Star Astronaut', gu: 'અંતરિક્ષ યાત્રી', hi: 'अंतरिक्ष यात्री' },
    defaultUnlocked: false,
  },
  {
    id: 'stk-ufo',
    emoji: '🛸',
    category: 'space',
    name: { en: 'Flying Saucer', gu: 'ઉડતી રકાબી', hi: 'उड़न तश्तरी' },
    defaultUnlocked: false,
  },
  {
    id: 'stk-saturn',
    emoji: '🪐',
    category: 'space',
    name: { en: 'Ring Planet', gu: 'શનિ ગ્રહ', hi: 'शनि ग्रह' },
    defaultUnlocked: false,
  },

  // --- Magic & Fantasy ---
  {
    id: 'stk-crown',
    emoji: '👑',
    category: 'magic',
    name: { en: 'Golden Crown', gu: 'સોનાનો મુગટ', hi: 'सोने का ताज' },
    defaultUnlocked: true,
  },
  {
    id: 'stk-rainbow',
    emoji: '🌈',
    category: 'magic',
    name: { en: 'Magic Rainbow', gu: 'મેઘધનુષ', hi: 'इंद्रधनुष' },
    defaultUnlocked: true,
  },
  {
    id: 'stk-unicorn',
    emoji: '🦄',
    category: 'magic',
    name: { en: 'Magic Unicorn', gu: 'જાદુઈ ઘોડો', hi: 'जादुई यूनिकॉर्न' },
    defaultUnlocked: false,
  },
  {
    id: 'stk-wand',
    emoji: '🪄',
    category: 'magic',
    name: { en: 'Fairy Wand', gu: 'જાદુઈ લાકડી', hi: 'जादुई छड़ी' },
    defaultUnlocked: false,
  },
  {
    id: 'stk-gem',
    emoji: '💎',
    category: 'magic',
    name: { en: 'Sparkle Diamond', gu: 'ચમકતો હીરો', hi: 'चमकता हीरा' },
    defaultUnlocked: false,
  },

  // --- Sweet Treats & Fun ---
  {
    id: 'stk-icecream',
    emoji: '🍦',
    category: 'treats',
    name: { en: 'Yummy Ice Cream', gu: 'મીઠી આઈસ્ક્રીમ', hi: 'स्वादिष्ट आइसक्रीम' },
    defaultUnlocked: true,
  },
  {
    id: 'stk-teddy',
    emoji: '🧸',
    category: 'treats',
    name: { en: 'Teddy Bear', gu: 'વ્હાલો ટેડી બેર', hi: 'प्यारा टेडी बियर' },
    defaultUnlocked: true,
  },
  {
    id: 'stk-cake',
    emoji: '🎂',
    category: 'treats',
    name: { en: 'Birthday Cake', gu: 'કેક', hi: 'केक' },
    defaultUnlocked: false,
  },
  {
    id: 'stk-balloon',
    emoji: '🎈',
    category: 'treats',
    name: { en: 'Party Balloon', gu: 'ફુગ્ગો', hi: 'गुब्बारा' },
    defaultUnlocked: false,
  },
  {
    id: 'stk-guitar',
    emoji: '🎸',
    category: 'treats',
    name: { en: 'Music Guitar', gu: 'ગીત ગિટાર', hi: 'संगीत गिटार' },
    defaultUnlocked: false,
  },
];

export const STARTER_UNLOCKED_STICKER_IDS = STICKER_CATALOG
  .filter((s) => s.defaultUnlocked)
  .map((s) => s.id);

export function getStickerName(sticker: StickerItem, lang: AppLanguage): string {
  if (lang === 'gu') return sticker.name.gu || sticker.name.en;
  if (lang === 'hi') return sticker.name.hi || sticker.name.en;
  return sticker.name.en;
}

// ---------------------------------------------------------------------------
// Backend (Django /api/rewards/stickers/) <-> UI mapping
// ---------------------------------------------------------------------------

/** Shape returned by backend/rewards/serializers.py (StickerSerializer). */
export interface BackendSticker {
  slug: string;
  emoji: string;
  category?: string;
  name_en?: string;
  name_gu?: string;
  name_hi?: string;
  default_unlocked?: boolean;
  order?: number;
  is_active?: boolean;
}

export function mapBackendSticker(s: BackendSticker): StickerItem | null {
  if (!s || !s.slug || !s.emoji || s.is_active === false) return null;
  const en = s.name_en || s.slug;
  return {
    id: s.slug,
    emoji: s.emoji,
    category: s.category || 'animals',
    name: { en, gu: s.name_gu || en, hi: s.name_hi || en },
    defaultUnlocked: !!s.default_unlocked,
  };
}

export function mapBackendStickers(list: BackendSticker[]): StickerItem[] {
  return (Array.isArray(list) ? list : [])
    .map(mapBackendSticker)
    .filter((s): s is StickerItem => s !== null);
}

export function toBackendSticker(s: StickerItem, order: number): BackendSticker {
  return {
    slug: s.id,
    emoji: s.emoji,
    category: s.category,
    name_en: s.name.en,
    name_gu: s.name.gu,
    name_hi: s.name.hi,
    default_unlocked: s.defaultUnlocked,
    order,
    is_active: true,
  };
}

/** Tab metadata for the album; unknown backend categories get a generic tab. */
export const STICKER_CATEGORY_META: Record<string, { icon: string; label: { en: string; gu: string; hi: string } }> = {
  animals: { icon: '🦁', label: { en: 'Animals', gu: 'પ્રાણીઓ', hi: 'जानवर' } },
  space: { icon: '🚀', label: { en: 'Space', gu: 'અંતરિક્ષ', hi: 'अंतरिक्ष' } },
  magic: { icon: '👑', label: { en: 'Magic', gu: 'જાદુ', hi: 'जादू' } },
  treats: { icon: '🍦', label: { en: 'Treats', gu: 'રમકડાં', hi: 'खिलौने' } },
};

/** Ordered, de-duplicated category list in the order stickers appear. */
export function getStickerCategories(stickers: StickerItem[]): string[] {
  return Array.from(new Set(stickers.map((s) => s.category)));
}

export function getStickerCategoryMeta(category: string, lang: AppLanguage): { icon: string; label: string } {
  const meta = STICKER_CATEGORY_META[category];
  if (!meta) return { icon: '✨', label: category.charAt(0).toUpperCase() + category.slice(1) };
  return { icon: meta.icon, label: meta.label[lang] || meta.label.en };
}

