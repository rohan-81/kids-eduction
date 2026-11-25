import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Rect,
  Circle,
  Path,
  G,
  ClipPath,
  Polygon,
} from 'react-native-svg';
import { LessonItem } from '../types';
import { VisualArt, hasContentArt } from './art3d/ContentArt';

interface GKVisualProps {
  item: LessonItem;
  size?: number;
}

// -------------------------------------------------------------
// 1. High-Quality SVG Flags for Countries (Eliminates Windows Emoji Bug)
// -------------------------------------------------------------
export const CountryFlagSVG: React.FC<{ code: string; width?: number; height?: number }> = ({
  code,
  width = 64,
  height = 44,
}) => {
  const w = width;
  const h = height;
  const rx = 8;

  switch (code.toLowerCase()) {
    // INDIA (Tricolor + Ashoka Chakra)
    case 'in':
    case 'india':
    case 'country-india':
      return (
        <Svg width={w} height={h} viewBox="0 0 64 44" fill="none">
          <Defs>
            <ClipPath id="flagClipIn">
              <Rect width="64" height="44" rx={rx} />
            </ClipPath>
          </Defs>
          <G clipPath="url(#flagClipIn)">
            {/* Saffron band */}
            <Rect x="0" y="0" width="64" height="14.67" fill="#FF9933" />
            {/* White band */}
            <Rect x="0" y="14.67" width="64" height="14.67" fill="#FFFFFF" />
            {/* Green band */}
            <Rect x="0" y="29.34" width="64" height="14.67" fill="#138808" />
            {/* Ashoka Chakra */}
            <Circle cx="32" cy="22" r="5.5" stroke="#000080" strokeWidth="1.2" fill="none" />
            <Circle cx="32" cy="22" r="1.5" fill="#000080" />
            {/* Spokes */}
            <Path
              d="M32 16.5V27.5M26.5 22H37.5M28.1 18.1L35.9 25.9M28.1 25.9L35.9 18.1M29.8 16.8L34.2 27.2M29.8 27.2L34.2 16.8M26.8 19.8L37.2 24.2M26.8 24.2L37.2 19.8"
              stroke="#000080"
              strokeWidth="0.6"
            />
            {/* Border & Gloss */}
            <Rect width="64" height="44" rx={rx} stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" fill="none" />
          </G>
        </Svg>
      );

    // USA (Stars & Stripes)
    case 'us':
    case 'usa':
    case 'country-usa':
      return (
        <Svg width={w} height={h} viewBox="0 0 64 44" fill="none">
          <Defs>
            <ClipPath id="flagClipUs">
              <Rect width="64" height="44" rx={rx} />
            </ClipPath>
          </Defs>
          <G clipPath="url(#flagClipUs)">
            {/* 13 Stripes */}
            <Rect width="64" height="44" fill="#B22234" />
            <Rect y="3.38" width="64" height="3.38" fill="#FFFFFF" />
            <Rect y="10.15" width="64" height="3.38" fill="#FFFFFF" />
            <Rect y="16.92" width="64" height="3.38" fill="#FFFFFF" />
            <Rect y="23.69" width="64" height="3.38" fill="#FFFFFF" />
            <Rect y="30.46" width="64" height="3.38" fill="#FFFFFF" />
            <Rect y="37.23" width="64" height="3.38" fill="#FFFFFF" />
            {/* Blue Canton */}
            <Rect width="28" height="23.69" fill="#3C3B6E" />
            {/* Stars representation */}
            <Circle cx="7" cy="6" r="1.5" fill="#FFFFFF" />
            <Circle cx="14" cy="6" r="1.5" fill="#FFFFFF" />
            <Circle cx="21" cy="6" r="1.5" fill="#FFFFFF" />
            <Circle cx="10.5" cy="11.8" r="1.5" fill="#FFFFFF" />
            <Circle cx="17.5" cy="11.8" r="1.5" fill="#FFFFFF" />
            <Circle cx="7" cy="17.5" r="1.5" fill="#FFFFFF" />
            <Circle cx="14" cy="17.5" r="1.5" fill="#FFFFFF" />
            <Circle cx="21" cy="17.5" r="1.5" fill="#FFFFFF" />
            <Rect width="64" height="44" rx={rx} stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" fill="none" />
          </G>
        </Svg>
      );

    // UK (Union Jack)
    case 'gb':
    case 'uk':
    case 'country-uk':
      return (
        <Svg width={w} height={h} viewBox="0 0 64 44" fill="none">
          <Defs>
            <ClipPath id="flagClipUk">
              <Rect width="64" height="44" rx={rx} />
            </ClipPath>
          </Defs>
          <G clipPath="url(#flagClipUk)">
            {/* Blue field */}
            <Rect width="64" height="44" fill="#012169" />
            {/* White diagonals */}
            <Path d="M0 0L64 44M64 0L0 44" stroke="#FFFFFF" strokeWidth="8" />
            {/* Red diagonals */}
            <Path d="M0 0L64 44M64 0L0 44" stroke="#C8102E" strokeWidth="3" />
            {/* White cross */}
            <Path d="M32 0V44M0 22H64" stroke="#FFFFFF" strokeWidth="12" />
            {/* Red cross */}
            <Path d="M32 0V44M0 22H64" stroke="#C8102E" strokeWidth="6.5" />
            <Rect width="64" height="44" rx={rx} stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" fill="none" />
          </G>
        </Svg>
      );

    // JAPAN (Rising Sun)
    case 'jp':
    case 'japan':
    case 'country-japan':
      return (
        <Svg width={w} height={h} viewBox="0 0 64 44" fill="none">
          <Defs>
            <ClipPath id="flagClipJp">
              <Rect width="64" height="44" rx={rx} />
            </ClipPath>
          </Defs>
          <G clipPath="url(#flagClipJp)">
            <Rect width="64" height="44" fill="#FFFFFF" />
            <Circle cx="32" cy="22" r="12" fill="#BC002D" />
            <Rect width="64" height="44" rx={rx} stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" fill="none" />
          </G>
        </Svg>
      );

    // FRANCE (Tricolor)
    case 'fr':
    case 'france':
    case 'country-france':
      return (
        <Svg width={w} height={h} viewBox="0 0 64 44" fill="none">
          <Defs>
            <ClipPath id="flagClipFr">
              <Rect width="64" height="44" rx={rx} />
            </ClipPath>
          </Defs>
          <G clipPath="url(#flagClipFr)">
            <Rect x="0" width="21.33" height="44" fill="#002654" />
            <Rect x="21.33" width="21.34" height="44" fill="#FFFFFF" />
            <Rect x="42.67" width="21.33" height="44" fill="#ED2939" />
            <Rect width="64" height="44" rx={rx} stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" fill="none" />
          </G>
        </Svg>
      );

    // GERMANY (Black, Red, Gold)
    case 'de':
    case 'germany':
    case 'country-germany':
      return (
        <Svg width={w} height={h} viewBox="0 0 64 44" fill="none">
          <Defs>
            <ClipPath id="flagClipDe">
              <Rect width="64" height="44" rx={rx} />
            </ClipPath>
          </Defs>
          <G clipPath="url(#flagClipDe)">
            <Rect y="0" width="64" height="14.67" fill="#000000" />
            <Rect y="14.67" width="64" height="14.67" fill="#DD0000" />
            <Rect y="29.34" width="64" height="14.67" fill="#FFCC00" />
            <Rect width="64" height="44" rx={rx} stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" fill="none" />
          </G>
        </Svg>
      );

    // AUSTRALIA (Blue Field + Union Jack + Southern Cross)
    case 'au':
    case 'australia':
    case 'country-australia':
      return (
        <Svg width={w} height={h} viewBox="0 0 64 44" fill="none">
          <Defs>
            <ClipPath id="flagClipAu">
              <Rect width="64" height="44" rx={rx} />
            </ClipPath>
          </Defs>
          <G clipPath="url(#flagClipAu)">
            <Rect width="64" height="44" fill="#00008B" />
            {/* Mini Union Jack canton */}
            <Rect width="30" height="20" fill="#012169" />
            <Path d="M0 0L30 20M30 0L0 20" stroke="#FFFFFF" strokeWidth="4" />
            <Path d="M0 0L30 20M30 0L0 20" stroke="#C8102E" strokeWidth="1.8" />
            <Path d="M15 0V20M0 10H30" stroke="#FFFFFF" strokeWidth="6" />
            <Path d="M15 0V20M0 10H30" stroke="#C8102E" strokeWidth="3.2" />
            {/* Commonwealth Star */}
            <Circle cx="15" cy="32" r="3.2" fill="#FFFFFF" />
            {/* Southern Cross */}
            <Circle cx="48" cy="11" r="1.5" fill="#FFFFFF" />
            <Circle cx="42" cy="20" r="1.5" fill="#FFFFFF" />
            <Circle cx="54" cy="22" r="1.5" fill="#FFFFFF" />
            <Circle cx="48" cy="33" r="1.8" fill="#FFFFFF" />
            <Circle cx="50" cy="26" r="1" fill="#FFFFFF" />
            <Rect width="64" height="44" rx={rx} stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" fill="none" />
          </G>
        </Svg>
      );

    // CANADA (Maple Leaf)
    case 'ca':
    case 'canada':
    case 'country-canada':
      return (
        <Svg width={w} height={h} viewBox="0 0 64 44" fill="none">
          <Defs>
            <ClipPath id="flagClipCa">
              <Rect width="64" height="44" rx={rx} />
            </ClipPath>
          </Defs>
          <G clipPath="url(#flagClipCa)">
            <Rect width="64" height="44" fill="#FFFFFF" />
            <Rect x="0" width="16" height="44" fill="#D80027" />
            <Rect x="48" width="16" height="44" fill="#D80027" />
            {/* Maple Leaf */}
            <Path
              d="M32 10L34 16H38L35 19L37 24L33 22L32 29L31 22L27 24L29 19L26 16H30L32 10Z"
              fill="#D80027"
            />
            <Rect width="64" height="44" rx={rx} stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" fill="none" />
          </G>
        </Svg>
      );

    // RUSSIA (White, Blue, Red)
    case 'ru':
    case 'russia':
    case 'country-russia':
      return (
        <Svg width={w} height={h} viewBox="0 0 64 44" fill="none">
          <Defs>
            <ClipPath id="flagClipRu">
              <Rect width="64" height="44" rx={rx} />
            </ClipPath>
          </Defs>
          <G clipPath="url(#flagClipRu)">
            <Rect y="0" width="64" height="14.67" fill="#FFFFFF" />
            <Rect y="14.67" width="64" height="14.67" fill="#0039A6" />
            <Rect y="29.34" width="64" height="14.67" fill="#D52B1E" />
            <Rect width="64" height="44" rx={rx} stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" fill="none" />
          </G>
        </Svg>
      );

    // UAE (Red hoist + Green, White, Black)
    case 'ae':
    case 'uae':
    case 'country-uae':
      return (
        <Svg width={w} height={h} viewBox="0 0 64 44" fill="none">
          <Defs>
            <ClipPath id="flagClipUae">
              <Rect width="64" height="44" rx={rx} />
            </ClipPath>
          </Defs>
          <G clipPath="url(#flagClipUae)">
            <Rect y="0" width="64" height="14.67" fill="#00732F" />
            <Rect y="14.67" width="64" height="14.67" fill="#FFFFFF" />
            <Rect y="29.34" width="64" height="14.67" fill="#000000" />
            <Rect x="0" y="0" width="16" height="44" fill="#FF0000" />
            <Rect width="64" height="44" rx={rx} stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" fill="none" />
          </G>
        </Svg>
      );

    default:
      return (
        <View style={[styles.defaultFlagBox, { width: w, height: h, borderRadius: rx }]}>
          <Text style={{ fontSize: 24 }}>🌍</Text>
        </View>
      );
  }
};

// -------------------------------------------------------------
// 2. High-Impact Thematic 3D Visual Badges
// -------------------------------------------------------------
export const ThematicBadgeCircle: React.FC<{
  icon: string;
  bgGradient: [string, string];
  size?: number;
}> = ({ icon, bgGradient, size = 64 }) => {
  const s = size;
  const gradId = `bgGrad_${icon}_${size}`.replace(/[^a-zA-Z0-9]/g, '');
  const highlightId = `hl_${gradId}`;
  const lipH = Math.round(s * 0.11);  // 3D clay bottom lip height
  const artSize = Math.round(s * 0.56);
  const hasArt = hasContentArt(icon);

  return (
    <View style={[styles.thematicBadgeWrap, { width: s, height: s + lipH, borderRadius: s / 2 }]}>
      {/* 3D clay bottom lip — darker version of gradient[1] */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: s * 0.08,
          right: s * 0.08,
          height: s / 2 + lipH,
          borderRadius: s / 2,
          backgroundColor: bgGradient[1],
          opacity: 0.65,
        }}
      />
      {/* Main circle with gradient fill + specular highlight */}
      <View style={{ width: s, height: s, position: 'absolute', top: 0, left: 0 }}>
        <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
          <Defs>
            <LinearGradient id={gradId} x1="0.15" y1="0" x2="0.85" y2="1">
              <Stop offset="0%" stopColor={bgGradient[0]} />
              <Stop offset="100%" stopColor={bgGradient[1]} />
            </LinearGradient>
            <RadialGradient id={highlightId} cx="38%" cy="30%" r="50%" fx="38%" fy="30%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
              <Stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.1" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          {/* Base gradient fill */}
          <Circle cx={s / 2} cy={s / 2} r={s / 2 - 1} fill={`url(#${gradId})`} />
          {/* White rim border */}
          <Circle cx={s / 2} cy={s / 2} r={s / 2 - 1} stroke="rgba(255,255,255,0.75)" strokeWidth="2.5" fill="none" />
          {/* Specular highlight dome */}
          <Circle cx={s / 2} cy={s / 2} r={s / 2 - 1} fill={`url(#${highlightId})`} />
        </Svg>
        {/* Icon — 3D art if available, else styled text emoji */}
        <View style={[styles.badgeEmojiCenter]}>
          {hasArt ? (
            <VisualArt value={icon} size={artSize} />
          ) : (
            <Text style={{ fontSize: s * 0.46, lineHeight: s * 0.56 }}>{icon}</Text>
          )}
        </View>
      </View>
    </View>
  );
};

// -------------------------------------------------------------
// 3. Main Central Visual Resolver for All GK & Universal Cards
// -------------------------------------------------------------
export const renderGKCardVisual = (item: LessonItem, size: number = 64) => {
  const cat = item.categoryId;
  const id = item.id;

  // A. COUNTRIES: Beautiful SVG Flags (fixes Windows IN/US/GB emoji bug)
  if (cat === 'gk-countries' || id.startsWith('country-')) {
    const code = id.replace('country-', '');
    return (
      <View style={styles.flagShadowWrap}>
        <CountryFlagSVG code={code} width={68} height={46} />
      </View>
    );
  }

  // B. FAMOUS PERSONALITIES: Tailored Glowing Badges
  if (cat === 'gk-personalities' || id.startsWith('pers-')) {
    const personalityMap: Record<string, { icon: string; grad: [string, string] }> = {
      'pers-kalam': { icon: '🚀', grad: ['#38BDF8', '#0284C7'] }, // Missile Man of India
      'pers-tagore': { icon: '📜', grad: ['#FDE047', '#EAB308'] }, // Gitanjali / Nobel
      'pers-chawla': { icon: '👩‍🚀', grad: ['#C084FC', '#7C3AED'] }, // Space Astronaut
      'pers-aryabhata': { icon: '🪐', grad: ['#FDBA74', '#EA580C'] }, // Zero & Astronomy
      'pers-raman': { icon: '🔬', grad: ['#4ADE80', '#16A34A'] }, // Raman Effect Light
      'pers-teresa': { icon: '🕊️', grad: ['#E0F2FE', '#38BDF8'] }, // Peace & Compassion
      'pers-vivekananda': { icon: '🧘', grad: ['#FCA5A5', '#DC2626'] }, // Wisdom & Torch
      'pers-ramanujan': { icon: '♾️', grad: ['#F472B6', '#DB2777'] }, // Math Infinity
      'pers-bhabha': { icon: '⚛️', grad: ['#818CF8', '#4F46E5'] }, // Nuclear Energy
      'pers-sarabhai': { icon: '🛰️', grad: ['#2DD4BF', '#0D9488'] }, // Father of ISRO
    };

    const cfg = personalityMap[id] || { icon: item.symbol || '🌟', grad: ['#A78BFA', '#6D28D9'] };
    return <ThematicBadgeCircle icon={cfg.icon} bgGradient={cfg.grad} size={size} />;
  }

  // C. GEOGRAPHY & RIVERS: High-Definition Scenery Badges
  if (cat === 'gk-geography' || id.startsWith('geo-')) {
    const geoMap: Record<string, { icon: string; grad: [string, string] }> = {
      'geo-himalayas': { icon: '🏔️', grad: ['#E0F2FE', '#0284C7'] },
      'geo-ganga': { icon: '🌊', grad: ['#BAE6FD', '#0369A1'] },
      'geo-narmada': { icon: '🏞️', grad: ['#BBF7D0', '#15803D'] },
      'geo-ocean': { icon: '🌊', grad: ['#93C5FD', '#1D4ED8'] },
      'geo-desert': { icon: '🏜️', grad: ['#FEF08A', '#CA8A04'] },
      'geo-everest': { icon: '🏔️', grad: ['#DDD6FE', '#7C3AED'] },
      'geo-continents': { icon: '🌍', grad: ['#86EFAC', '#16A34A'] },
      'geo-oceans': { icon: '🌐', grad: ['#7DD3FC', '#0284C7'] },
      'geo-islands': { icon: '🏝️', grad: ['#A7F3D0', '#059669'] },
      'geo-monsoon': { icon: '⛈️', grad: ['#CBD5E1', '#475569'] },
    };

    const cfg = geoMap[id] || { icon: item.symbol || '🗺️', grad: ['#BAE6FD', '#0284C7'] };
    return <ThematicBadgeCircle icon={cfg.icon} bgGradient={cfg.grad} size={size} />;
  }

  // D. STATES & CAPITALS: Landmark / Cultural Badges (Fixes Delhi "IN" bug)
  if (cat === 'gk-states' || id.startsWith('state-')) {
    const stateMap: Record<string, { icon: string; grad: [string, string] }> = {
      'state-gujarat': { icon: '🦁', grad: ['#FEF08A', '#EAB308'] }, // Gir Lion / Capital Gandhinagar
      'state-maharashtra': { icon: '🏛️', grad: ['#FED7AA', '#EA580C'] }, // Gateway of India / Mumbai
      'state-rajasthan': { icon: '🏰', grad: ['#FECDD3', '#E11D48'] }, // Pink City / Jaipur
      'state-karnataka': { icon: '💻', grad: ['#DDD6FE', '#7C3AED'] }, // Tech Hub / Bengaluru
      'state-tamilnadu': { icon: '🛕', grad: ['#FDE047', '#D97706'] }, // Classical Temple / Chennai
      'state-delhi': { icon: '🏛️', grad: ['#BAE6FD', '#0284C7'] }, // India Gate / New Delhi (NO "IN" text!)
      'state-punjab': { icon: '🌾', grad: ['#FEF08A', '#CA8A04'] }, // Golden Wheat / Chandigarh
      'state-up': { icon: '🕌', grad: ['#BBF7D0', '#15803D'] }, // Taj Mahal / Lucknow
      'state-kerala': { icon: '🌴', grad: ['#A7F3D0', '#059669'] }, // God's Own Country / Thiruvananthapuram
      'state-wb': { icon: '🌉', grad: ['#FBCFE8', '#DB2777'] }, // Howrah Bridge / Kolkata
      'state-mp': { icon: '🐅', grad: ['#FED7AA', '#D97706'] }, // Heart of India Tiger / Bhopal
      'state-goa': { icon: '🏖️', grad: ['#7DD3FC', '#0284C7'] }, // Sunny Beaches / Panaji
    };

    const cfg = stateMap[id] || { icon: item.symbol || '🏛️', grad: ['#FED7AA', '#EA580C'] };
    return <ThematicBadgeCircle icon={cfg.icon} bgGradient={cfg.grad} size={size} />;
  }

  // E. Fallback for other GK items: vivid category-matched gradient
  const fallbackGrad = ((): [string, string] => {
    if (cat === 'gk-inventions' || cat === 'gk-history')  return ['#FDE68A', '#F59E0B'];
    if (cat === 'gk-monuments')                           return ['#FBCFE8', '#EC4899'];
    if (cat === 'gk-sports')                              return ['#A7F3D0', '#10B981'];
    if (cat === 'gk-vehicles')                            return ['#BAE6FD', '#0EA5E9'];
    if (cat === 'gk-symbols')                             return ['#FEF08A', '#EAB308'];
    return ['#C4B5FD', '#7C3AED'];
  })();
  return (
    <ThematicBadgeCircle
      icon={item.symbol || '⭐'}
      bgGradient={fallbackGrad}
      size={size}
    />
  );
};

// -------------------------------------------------------------
// 4. Formatter to Prevent Text Truncation (e.g. "Gujarat → Gandhinaga...")
// -------------------------------------------------------------
export interface FormattedGKTitle {
  primaryName: string;
  detailPill: string;
  localSub: string;
}

export function formatGKCardTitle(
  item: LessonItem,
  language: 'gu' | 'en' | 'hi'
): FormattedGKTitle {
  const title = item.title || '';

  // Extract from 3-part bullet string: "English • Gujarati • Hindi"
  const parts = title.includes('•') ? title.split('•').map((s) => s.trim()) : [title];
  const enPart = parts[0] || item.exampleWord || '';
  const guPart = parts[1] || item.exampleMeaningGu || '';
  const hiPart = parts[2] || item.exampleMeaningHi || '';

  // Handle "A → B" pattern (e.g. "Gujarat → Gandhinagar" or "India → New Delhi")
  if (enPart.includes('→') || enPart.includes('->')) {
    const arrow = enPart.includes('→') ? '→' : '->';
    const [name, capital] = enPart.split(arrow).map((s) => s.trim());

    if (language === 'gu') {
      const guName = guPart ? guPart.replace(/\(.*?\)/g, '').trim() : name;
      return {
        primaryName: guName || name,
        detailPill: `📍 ${capital}`,
        localSub: `(${name} — ${capital})`,
      };
    }
    if (language === 'hi') {
      const hiName = hiPart ? hiPart.replace(/\(.*?\)/g, '').trim() : name;
      return {
        primaryName: hiName || name,
        detailPill: `📍 ${capital}`,
        localSub: `(${name} — ${capital})`,
      };
    }
    return {
      primaryName: name,
      detailPill: `📍 ${capital}`,
      localSub: `Capital: ${capital}`,
    };
  }

  // Handle standard names (e.g. "Dr. A.P.J. Abdul Kalam", "The Himalayas")
  const mainName = language === 'gu' && guPart ? guPart : language === 'hi' && hiPart ? hiPart : enPart;
  const subName = language === 'gu' ? (enPart !== mainName ? `(${enPart})` : '') : language === 'hi' ? (enPart !== mainName ? `(${enPart})` : '') : '';

  // Meaningful tag pill based on category
  let detailPill = '';
  if (language === 'en') {
    if (item.categoryId === 'gk-personalities') detailPill = '⭐ Great Leader';
    else if (item.categoryId === 'gk-geography') detailPill = '🏔️ Geography';
    else if (item.categoryId === 'gk-monuments') detailPill = '🏛️ Monument';
    else if (item.categoryId === 'gk-symbols') detailPill = '🇮🇳 National Symbol';
  } else if (language === 'hi') {
    if (item.categoryId === 'gk-personalities') detailPill = '⭐ महान व्यक्तित्व';
    else if (item.categoryId === 'gk-geography') detailPill = '🏔️ भूगोल';
    else if (item.categoryId === 'gk-monuments') detailPill = '🏛️ स्मारक';
    else if (item.categoryId === 'gk-symbols') detailPill = '🇮🇳 राष्ट्रीय प्रतीक';
  } else {
    if (item.categoryId === 'gk-personalities') detailPill = '⭐ મહાન વિભૂતિ';
    else if (item.categoryId === 'gk-geography') detailPill = '🏔️ ભૂગોળ';
    else if (item.categoryId === 'gk-monuments') detailPill = '🏛️ સ્મારક';
    else if (item.categoryId === 'gk-symbols') detailPill = '🇮🇳 રાષ્ટ્રીય';
  }

  return {
    primaryName: mainName,
    detailPill,
    localSub: subName,
  };
}

const styles = StyleSheet.create({
  flagShadowWrap: {
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  defaultFlagBox: {
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  thematicBadgeWrap: {
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    position: 'relative',
  },
  badgeEmojiCenter: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
