import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Circle,
  Path,
  G,
  Text as SvgText,
} from 'react-native-svg';

export type AppIconName =
  | 'abc'
  | 'counting'
  | 'animals'
  | 'coloring'
  | 'worksheets'
  | 'certificate'
  | 'habits'
  | 'adventure'
  | 'balloon'
  | 'shop'
  | 'spelling'
  | 'battle'
  | 'speaker'
  | 'speaker_muted'
  | 'star'
  | 'coin'
  | 'fire'
  | 'heart'
  | 'bell'
  | 'math'
  | 'science'
  | 'english'
  | 'gk'
  | 'logic'
  | 'brain'
  | 'puzzle'
  | 'story';

import { AppLanguage } from '../types';

interface AppIconProps {
  name: AppIconName;
  size?: number;
  style?: ViewStyle;
  language?: AppLanguage;
}

export const AppIcon: React.FC<AppIconProps> = ({ name, size = 48, style, language }) => {
  const s = size;

  switch (name) {
    case 'abc': {
      const abcText = language === 'gu' ? 'ક' : language === 'hi' ? 'क' : 'AB';
      const abcFontSize = language === 'gu' || language === 'hi' ? 18 : 16;
      const abcY = language === 'gu' || language === 'hi' ? 29 : 28;
      return (
        <Svg width={s} height={s} viewBox="0 0 48 48" fill="none" style={style}>
          <Defs>
            <LinearGradient id="abcGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#FBCFE8" />
              <Stop offset="50%" stopColor="#F472B6" />
              <Stop offset="100%" stopColor="#EC4899" />
            </LinearGradient>
            <LinearGradient id="abcHighlight" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect x="4" y="6" width="40" height="38" rx="13" fill="#EC4899" />
          <Rect x="4" y="3" width="40" height="40" rx="13" fill="url(#abcGrad)" />
          <Rect x="6" y="5" width="36" height="18" rx="11" fill="url(#abcHighlight)" />
          <SvgText
            x="24"
            y={abcY}
            fill="#FFFFFF"
            fontSize={abcFontSize}
            fontWeight="900"
            textAnchor="middle"
            letterSpacing={language === 'gu' || language === 'hi' ? '0' : '0.8'}
          >
            {abcText}
          </SvgText>
        </Svg>
      );
    }

    case 'counting': {
      const cntText = language === 'gu' ? '૧૨૩' : language === 'hi' ? '१२३' : '123';
      const cntFontSize = language === 'gu' || language === 'hi' ? 14 : 16;
      const cntY = language === 'gu' || language === 'hi' ? 29 : 28;
      return (
        <Svg width={s} height={s} viewBox="0 0 48 48" fill="none" style={style}>
          <Defs>
            <LinearGradient id="cntGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#A7F3D0" />
              <Stop offset="50%" stopColor="#34D399" />
              <Stop offset="100%" stopColor="#10B981" />
            </LinearGradient>
            <LinearGradient id="cntHighlight" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect x="4" y="6" width="40" height="38" rx="13" fill="#10B981" />
          <Rect x="4" y="3" width="40" height="40" rx="13" fill="url(#cntGrad)" />
          <Rect x="6" y="5" width="36" height="18" rx="11" fill="url(#cntHighlight)" />
          <SvgText
            x="24"
            y={cntY}
            fill="#FFFFFF"
            fontSize={cntFontSize}
            fontWeight="900"
            textAnchor="middle"
            letterSpacing={language === 'gu' || language === 'hi' ? '0.2' : '1'}
          >
            {cntText}
          </SvgText>
        </Svg>
      );
    }

    case 'animals':
      return (
        <Svg width={s} height={s} viewBox="0 0 48 48" fill="none" style={style}>
          <Defs>
            <LinearGradient id="aniGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#FDE68A" />
              <Stop offset="50%" stopColor="#FBBF24" />
              <Stop offset="100%" stopColor="#F59E0B" />
            </LinearGradient>
            <LinearGradient id="aniHighlight" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect x="4" y="6" width="40" height="38" rx="13" fill="#F59E0B" />
          <Rect x="4" y="3" width="40" height="40" rx="13" fill="url(#aniGrad)" />
          <Rect x="6" y="5" width="36" height="18" rx="11" fill="url(#aniHighlight)" />
          {/* Friendly Lion/Bear Face Emblem */}
          <Circle cx="17" cy="18" r="4" fill="#FFFFFF" opacity="0.9" />
          <Circle cx="31" cy="18" r="4" fill="#FFFFFF" opacity="0.9" />
          <Circle cx="24" cy="26" r="9.5" fill="#FFFFFF" />
          <Circle cx="20.5" cy="24" r="1.6" fill="#D97706" />
          <Circle cx="27.5" cy="24" r="1.6" fill="#D97706" />
          <Path d="M22 28C23 29.2 25 29.2 26 28" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" />
        </Svg>
      );

    case 'coloring':
      return (
        <Svg width={s} height={s} viewBox="0 0 48 48" fill="none" style={style}>
          <Defs>
            <LinearGradient id="colGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#C4B5FD" />
              <Stop offset="50%" stopColor="#A78BFA" />
              <Stop offset="100%" stopColor="#8B5CF6" />
            </LinearGradient>
            <LinearGradient id="colHighlight" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect x="4" y="6" width="40" height="38" rx="13" fill="#8B5CF6" />
          <Rect x="4" y="3" width="40" height="40" rx="13" fill="url(#colGrad)" />
          <Rect x="6" y="5" width="36" height="18" rx="11" fill="url(#colHighlight)" />
          {/* Artist Palette */}
          <Path
            d="M24 13C17.5 13 13 17.5 13 23C13 28.5 17 33 22 33C24 33 25 32 26 30C26.5 29 27.5 28.5 29 28.5H30.5C33 28.5 35 26.5 35 24C35 18 30 13 24 13Z"
            fill="#FFFFFF"
          />
          <Circle cx="18" cy="20" r="1.8" fill="#F87171" />
          <Circle cx="24" cy="17" r="1.8" fill="#FDE047" />
          <Circle cx="29" cy="20" r="1.8" fill="#60A5FA" />
          <Circle cx="22" cy="28" r="1.8" fill="#34D399" />
        </Svg>
      );

    case 'worksheets':
      return (
        <Svg width={s} height={s} viewBox="0 0 48 48" fill="none" style={style}>
          <Defs>
            <LinearGradient id="wsGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#7DD3FC" />
              <Stop offset="50%" stopColor="#38BDF8" />
              <Stop offset="100%" stopColor="#0EA5E9" />
            </LinearGradient>
            <LinearGradient id="wsHighlight" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.28" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect x="4" y="6" width="40" height="38" rx="13" fill="#0EA5E9" />
          <Rect x="4" y="3" width="40" height="40" rx="13" fill="url(#wsGrad)" />
          <Rect x="6" y="5" width="36" height="18" rx="11" fill="url(#wsHighlight)" />
          {/* Document / Worksheet with Lines */}
          <Rect x="16" y="13" width="16" height="20" rx="2.5" fill="#FFFFFF" />
          <Path d="M19 18H29M19 22H29M19 26H25" stroke="#0EA5E9" strokeWidth="2.2" strokeLinecap="round" />
        </Svg>
      );

    case 'certificate':
      return (
        <Svg width={s} height={s} viewBox="0 0 48 48" fill="none" style={style}>
          <Defs>
            <LinearGradient id="certGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#FEF08A" />
              <Stop offset="60%" stopColor="#FDE68A" />
              <Stop offset="100%" stopColor="#FBBF24" />
            </LinearGradient>
            <LinearGradient id="certHighlight" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect x="4" y="6" width="40" height="38" rx="13" fill="#FDE68A" />
          <Rect x="4" y="3" width="40" height="40" rx="13" fill="url(#certGrad)" />
          <Rect x="6" y="5" width="36" height="18" rx="11" fill="url(#certHighlight)" />
          {/* Trophy Cup */}
          <Path
            d="M16 15H32V22C32 26 28 29 24 29C20 29 16 26 16 22V15Z"
            fill="#FFFFFF"
          />
          <Path d="M24 29V33M19 33H29" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />
          <Path d="M16 17H13C12 17 11 18 11 19C11 21 13 22 16 22" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
          <Path d="M32 17H35C36 17 37 18 37 19C37 21 35 22 32 22" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
        </Svg>
      );

    case 'habits':
      return (
        <Svg width={s} height={s} viewBox="0 0 48 48" fill="none" style={style}>
          <Defs>
            <LinearGradient id="habGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#A7F3D0" />
              <Stop offset="60%" stopColor="#6EE7B7" />
              <Stop offset="100%" stopColor="#34D399" />
            </LinearGradient>
            <LinearGradient id="habHighlight" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect x="4" y="6" width="40" height="38" rx="13" fill="#6EE7B7" />
          <Rect x="4" y="3" width="40" height="40" rx="13" fill="url(#habGrad)" />
          <Rect x="6" y="5" width="36" height="18" rx="11" fill="url(#habHighlight)" />
          {/* Shining Morning Sun / Calendar Habit */}
          <Circle cx="24" cy="23" r="6.5" fill="#FFFFFF" />
          <Path d="M24 12V14M24 32V34M13 23H15M33 23H35M16 15L17.5 16.5M30.5 29.5L32 31M16 31L17.5 29.5M30.5 16.5L32 15" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        </Svg>
      );

    case 'adventure':
      return (
        <Svg width={s} height={s} viewBox="0 0 48 48" fill="none" style={style}>
          <Defs>
            <LinearGradient id="advGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#FDBA74" />
              <Stop offset="50%" stopColor="#FB923C" />
              <Stop offset="100%" stopColor="#F97316" />
            </LinearGradient>
            <LinearGradient id="advHighlight" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.28" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect x="4" y="6" width="40" height="38" rx="13" fill="#F97316" />
          <Rect x="4" y="3" width="40" height="40" rx="13" fill="url(#advGrad)" />
          <Rect x="6" y="5" width="36" height="18" rx="11" fill="url(#advHighlight)" />
          {/* Adventure Compass / Quest Flag */}
          <Path d="M15 14L33 20L27 26L21 32L15 14Z" fill="#FFFFFF" />
          <Circle cx="24" cy="23" r="2.8" fill="#F97316" />
        </Svg>
      );

    case 'balloon':
      return (
        <Svg width={s} height={s} viewBox="0 0 48 48" fill="none" style={style}>
          <Defs>
            <LinearGradient id="balGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#FECDD3" />
              <Stop offset="60%" stopColor="#FDA4AF" />
              <Stop offset="100%" stopColor="#FB7185" />
            </LinearGradient>
            <LinearGradient id="balHighlight" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect x="4" y="6" width="40" height="38" rx="13" fill="#FDA4AF" />
          <Rect x="4" y="3" width="40" height="40" rx="13" fill="url(#balGrad)" />
          <Rect x="6" y="5" width="36" height="18" rx="11" fill="url(#balHighlight)" />
          {/* Floating Balloon with knot */}
          <Circle cx="24" cy="20" r="8.5" fill="#FFFFFF" />
          <Circle cx="21" cy="17" r="2" fill="#FECDD3" />
          <Path d="M22 28L26 28L24 30Z" fill="#FFFFFF" />
          <Path d="M24 30C24 33 26 35 25 37" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
        </Svg>
      );

    case 'spelling':
      return (
        <Svg width={s} height={s} viewBox="0 0 48 48" fill="none" style={style}>
          <Defs>
            <LinearGradient id="splGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#BFDBFE" />
              <Stop offset="60%" stopColor="#93C5FD" />
              <Stop offset="100%" stopColor="#60A5FA" />
            </LinearGradient>
            <LinearGradient id="splHigh" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect x="4" y="6" width="40" height="38" rx="13" fill="#93C5FD" />
          <Rect x="4" y="3" width="40" height="40" rx="13" fill="url(#splGrad)" />
          <Rect x="6" y="5" width="36" height="18" rx="11" fill="url(#splHigh)" />
          {/* Letters Puzzle Blocks */}
          <Rect x="14" y="14" width="11" height="11" rx="3" fill="#FFFFFF" />
          <Rect x="23" y="21" width="11" height="11" rx="3" fill="#FFFFFF" />
          <SvgText x="19.5" y="23" fill="#2563EB" fontSize="9" fontWeight="900" textAnchor="middle">W</SvgText>
          <SvgText x="28.5" y="30" fill="#2563EB" fontSize="9" fontWeight="900" textAnchor="middle">D</SvgText>
        </Svg>
      );

    case 'shop':
      return (
        <Svg width={s} height={s} viewBox="0 0 48 48" fill="none" style={style}>
          <Defs>
            <LinearGradient id="shpGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#FEF3C7" />
              <Stop offset="60%" stopColor="#FDE68A" />
              <Stop offset="100%" stopColor="#FBBF24" />
            </LinearGradient>
            <LinearGradient id="shpHighlight" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect x="4" y="6" width="40" height="38" rx="13" fill="#FDE68A" />
          <Rect x="4" y="3" width="40" height="40" rx="13" fill="url(#shpGrad)" />
          <Rect x="6" y="5" width="36" height="18" rx="11" fill="url(#shpHighlight)" />
          {/* Shopping Cart */}
          <Path
            d="M13 15H16L18.5 27H31L33.5 18H17"
            stroke="#FFFFFF"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx="20" cy="31" r="2.2" fill="#FFFFFF" />
          <Circle cx="29" cy="31" r="2.2" fill="#FFFFFF" />
        </Svg>
      );

    case 'battle':
      return (
        <Svg width={s} height={s} viewBox="0 0 48 48" fill="none" style={style}>
          <Defs>
            <LinearGradient id="batGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#C7D2FE" />
              <Stop offset="60%" stopColor="#A5B4FC" />
              <Stop offset="100%" stopColor="#818CF8" />
            </LinearGradient>
            <LinearGradient id="batHigh" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect x="4" y="6" width="40" height="38" rx="13" fill="#A5B4FC" />
          <Rect x="4" y="3" width="40" height="40" rx="13" fill="url(#batGrad)" />
          <Rect x="6" y="5" width="36" height="18" rx="11" fill="url(#batHigh)" />
          {/* Crossed Swords */}
          <Path d="M15 14L33 32M15 18L19 14M33 28L29 32" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          <Path d="M33 14L15 32M29 14L33 18M15 28L19 32" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        </Svg>
      );

    case 'brain':
      return (
        <Svg width={s} height={s} viewBox="0 0 48 48" fill="none" style={style}>
          <Defs>
            <LinearGradient id="brnGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#FEF08A" />
              <Stop offset="60%" stopColor="#FDE68A" />
              <Stop offset="100%" stopColor="#FBBF24" />
            </LinearGradient>
            <LinearGradient id="brnHigh" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect x="4" y="6" width="40" height="38" rx="13" fill="#FDE68A" />
          <Rect x="4" y="3" width="40" height="40" rx="13" fill="url(#brnGrad)" />
          <Rect x="6" y="5" width="36" height="18" rx="11" fill="url(#brnHigh)" />
          {/* Lightbulb / Brain Gear */}
          <Circle cx="24" cy="21" r="8" fill="#FFFFFF" />
          <Rect x="20" y="29" width="8" height="4" rx="2" fill="#FFFFFF" />
        </Svg>
      );

    case 'story':
      return (
        <Svg width={s} height={s} viewBox="0 0 48 48" fill="none" style={style}>
          <Defs>
            <LinearGradient id="styGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#C4B5FD" />
              <Stop offset="50%" stopColor="#A78BFA" />
              <Stop offset="100%" stopColor="#8B5CF6" />
            </LinearGradient>
            <LinearGradient id="styHigh" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.32" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </LinearGradient>
            <LinearGradient id="styGold" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#FDE047" />
              <Stop offset="100%" stopColor="#F59E0B" />
            </LinearGradient>
            <LinearGradient id="styRibbon" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FB7185" />
              <Stop offset="100%" stopColor="#E11D48" />
            </LinearGradient>
          </Defs>
          <Rect x="4" y="6" width="40" height="38" rx="13" fill="#8B5CF6" />
          <Rect x="4" y="3" width="40" height="40" rx="13" fill="url(#styGrad)" />
          <Rect x="6" y="5" width="36" height="18" rx="11" fill="url(#styHigh)" />

          {/* 3D Open Storybook Backing Cover */}
          <Path
            d="M10 20C15 18.5 22.5 19.8 24 21.5C25.5 19.8 33 18.5 38 20V33C33 31.5 25.5 32.8 24 34.5C22.5 32.8 15 31.5 10 33V20Z"
            fill="#4C1D95"
            opacity="0.3"
          />

          {/* Left Page (White) */}
          <Path
            d="M11 20.5C15.5 19.2 22 20.2 23.5 21.8V33.5C22 32 15.5 31 11 32.2V20.5Z"
            fill="#FFFFFF"
          />
          {/* Left Page Story Lines */}
          <Path d="M14 23.5H20M14 26.5H20M14 29.5H18" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />

          {/* Right Page (White) */}
          <Path
            d="M37 20.5C32.5 19.2 26 20.2 24.5 21.8V33.5C26 32 32.5 31 37 32.2V20.5Z"
            fill="#F8FAFC"
          />
          {/* Right Page Story Lines */}
          <Path d="M28 23.5H34M28 26.5H34M28 29.5H31" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />

          {/* Center Spine */}
          <Path d="M24 21.5V34" stroke="#E2E8F0" strokeWidth="1" />

          {/* Ruby Ribbon Bookmark */}
          <Path d="M23 21.5H25V36L24 34.8L23 36V21.5Z" fill="url(#styRibbon)" />

          {/* Golden Magic Sparkle Star above book */}
          <Path
            d="M24 9L25.2 12.8L29 14L25.2 15.2L24 19L22.8 15.2L19 14L22.8 12.8L24 9Z"
            fill="url(#styGold)"
          />
          <Circle cx="32" cy="11" r="1.3" fill="#FDE047" />
          <Circle cx="16" cy="12" r="1" fill="#FDE047" />
        </Svg>
      );

    case 'math':
      return (
        <Svg width={s} height={s} viewBox="0 0 48 48" fill="none" style={style}>
          <Defs>
            <LinearGradient id="mthGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#FFEDD5" />
              <Stop offset="60%" stopColor="#FED7AA" />
              <Stop offset="100%" stopColor="#FDBA74" />
            </LinearGradient>
            <LinearGradient id="mthHigh" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect x="4" y="6" width="40" height="38" rx="13" fill="#FDBA74" />
          <Rect x="4" y="3" width="40" height="40" rx="13" fill="url(#mthGrad)" />
          <Rect x="6" y="5" width="36" height="18" rx="11" fill="url(#mthHigh)" />
          <Path d="M16 17H22M19 14V20" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />
          <Path d="M26 17H32" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />
          <Path d="M16 27L22 33M22 27L16 33" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />
          <Circle cx="29" cy="26" r="1.8" fill="#FFFFFF" />
          <Path d="M26 30H32" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
          <Circle cx="29" cy="34" r="1.8" fill="#FFFFFF" />
        </Svg>
      );

    case 'science':
      return (
        <Svg width={s} height={s} viewBox="0 0 48 48" fill="none" style={style}>
          <Defs>
            <LinearGradient id="sciGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#A7F3D0" />
              <Stop offset="60%" stopColor="#6EE7B7" />
              <Stop offset="100%" stopColor="#34D399" />
            </LinearGradient>
            <LinearGradient id="sciHigh" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect x="4" y="6" width="40" height="38" rx="13" fill="#6EE7B7" />
          <Rect x="4" y="3" width="40" height="40" rx="13" fill="url(#sciGrad)" />
          <Rect x="6" y="5" width="36" height="18" rx="11" fill="url(#sciHigh)" />
          {/* Atom Symbol */}
          <Circle cx="24" cy="23" r="4" fill="#FFFFFF" />
          <Path d="M24 14V17M24 29V32M15 23H18M30 23H33M18 17L20 19M28 27L30 29M18 29L20 27M28 19L30 17" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />
        </Svg>
      );

    case 'english':
      return (
        <Svg width={s} height={s} viewBox="0 0 48 48" fill="none" style={style}>
          <Defs>
            <LinearGradient id="engGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#BFDBFE" />
              <Stop offset="60%" stopColor="#93C5FD" />
              <Stop offset="100%" stopColor="#60A5FA" />
            </LinearGradient>
            <LinearGradient id="engHigh" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect x="4" y="6" width="40" height="38" rx="13" fill="#93C5FD" />
          <Rect x="4" y="3" width="40" height="40" rx="13" fill="url(#engGrad)" />
          <Rect x="6" y="5" width="36" height="18" rx="11" fill="url(#engHigh)" />
          {/* Droplet / Pen Tip */}
          <Path d="M24 15C24 15 17 24 17 28C17 31.8 20.1 35 24 35C27.9 35 31 31.8 31 28C31 24 24 15 24 15Z" fill="#FFFFFF" />
          <Circle cx="24" cy="28" r="2.5" fill="#3B82F6" />
        </Svg>
      );

    case 'gk':
      return (
        <Svg width={s} height={s} viewBox="0 0 48 48" fill="none" style={style}>
          <Defs>
            <LinearGradient id="gkGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#C4B5FD" />
              <Stop offset="50%" stopColor="#A78BFA" />
              <Stop offset="100%" stopColor="#8B5CF6" />
            </LinearGradient>
            <LinearGradient id="gkHigh" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.28" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect x="4" y="6" width="40" height="38" rx="13" fill="#8B5CF6" />
          <Rect x="4" y="3" width="40" height="40" rx="13" fill="url(#gkGrad)" />
          <Rect x="6" y="5" width="36" height="18" rx="11" fill="url(#gkHigh)" />
          {/* Globe */}
          <Circle cx="24" cy="23" r="9" stroke="#FFFFFF" strokeWidth="2.5" />
          <Path d="M15 23H33M24 14C26 17 27 20 27 23C27 26 26 29 24 32M24 14C22 17 21 20 21 23C21 26 22 29 24 32" stroke="#FFFFFF" strokeWidth="2" />
        </Svg>
      );

    case 'logic':
      return (
        <Svg width={s} height={s} viewBox="0 0 48 48" fill="none" style={style}>
          <Defs>
            <LinearGradient id="logGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#FBCFE8" />
              <Stop offset="50%" stopColor="#F472B6" />
              <Stop offset="100%" stopColor="#EC4899" />
            </LinearGradient>
            <LinearGradient id="logHigh" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.28" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect x="4" y="6" width="40" height="38" rx="13" fill="#EC4899" />
          <Rect x="4" y="3" width="40" height="40" rx="13" fill="url(#logGrad)" />
          <Rect x="6" y="5" width="36" height="18" rx="11" fill="url(#logHigh)" />
          {/* Lightbulb */}
          <Circle cx="24" cy="21" r="6.5" fill="#FFFFFF" />
          <Path d="M21 27H27M22 30H26" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
        </Svg>
      );

    case 'puzzle':
      return (
        <Svg width={s} height={s} viewBox="0 0 48 48" fill="none" style={style}>
          <Defs>
            <LinearGradient id="puzGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#FDE68A" />
              <Stop offset="50%" stopColor="#F59E0B" />
              <Stop offset="100%" stopColor="#D97706" />
            </LinearGradient>
            <LinearGradient id="puzHigh" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect x="4" y="6" width="40" height="38" rx="13" fill="#D97706" />
          <Rect x="4" y="3" width="40" height="40" rx="13" fill="url(#puzGrad)" />
          <Rect x="6" y="5" width="36" height="18" rx="11" fill="url(#puzHigh)" />
          {/* Jigsaw Puzzle Piece */}
          <Path
            d="M17 19H21.5C21.5 17.5 22.8 16.2 24.5 16.2C26.2 16.2 27.5 17.5 27.5 19H32C32.6 19 33 19.4 33 20V24.5C31.5 24.5 30.2 25.8 30.2 27.5C30.2 29.2 31.5 30.5 33 30.5V35C33 35.6 32.6 36 32 36H27.5C27.5 34.5 26.2 33.2 24.5 33.2C22.8 33.2 21.5 34.5 21.5 36H17C16.4 36 16 35.6 16 35V30.5C17.5 30.5 18.8 29.2 18.8 27.5C18.8 25.8 17.5 24.5 16 24.5V20C16 19.4 16.4 19 17 19Z"
            fill="#FFFFFF"
          />
        </Svg>
      );

    case 'speaker':
      return (
        <Svg width={s} height={s} viewBox="0 0 32 32" fill="none" style={style}>
          <Circle cx="16" cy="16" r="15" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="2" />
          <Path
            d="M10 13H13L17 9V23L13 19H10V13Z"
            fill="#3B82F6"
          />
          <Path
            d="M20 12C21.5 13.5 21.5 18.5 20 20"
            stroke="#3B82F6"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <Path
            d="M22.5 9.5C25 12.5 25 19.5 22.5 22.5"
            stroke="#3B82F6"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </Svg>
      );

    case 'speaker_muted':
      return (
        <Svg width={s} height={s} viewBox="0 0 32 32" fill="none" style={style}>
          <Circle cx="16" cy="16" r="15" fill="#FEF2F2" stroke="#FECDD3" strokeWidth="2" />
          <Path
            d="M10 13H13L17 9V23L13 19H10V13Z"
            fill="#EF4444"
          />
          <Path
            d="M20 13L24 19M24 13L20 19"
            stroke="#EF4444"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </Svg>
      );

    case 'star':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={style}>
          <Path
            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
            fill="#F59E0B"
            stroke="#D97706"
            strokeWidth={0.8}
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'coin':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={style}>
          <Circle cx="12" cy="12" r="10" fill="#FDE047" stroke="#F59E0B" strokeWidth="2" />
          <Circle cx="12" cy="12" r="7" stroke="#FBBF24" strokeWidth="1.2" strokeDasharray="2 2" />
          <SvgText x="12" y="16" fill="#92400E" fontSize="11" fontWeight="900" textAnchor="middle">
            ★
          </SvgText>
        </Svg>
      );

    case 'fire':
      return (
        <Svg width={s} height={s} viewBox="0 0 32 32" fill="none" style={style}>
          <Defs>
            <LinearGradient id="fireGrad" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0%" stopColor="#F97316" />
              <Stop offset="50%" stopColor="#FB923C" />
              <Stop offset="100%" stopColor="#FDE047" />
            </LinearGradient>
          </Defs>
          <Path
            d="M16 3C16 3 10 9 10 16C10 19.3 12.7 22 16 22C19.3 22 22 19.3 22 16C22 11 18 8 18 8C18 8 19 12 18 14C17 12 16 3 16 3Z"
            fill="url(#fireGrad)"
          />
          <Path
            d="M16 13C16 13 13 16 13 18.5C13 20.2 14.3 21.5 16 21.5C17.7 21.5 19 20.2 19 18.5C19 16.5 17.5 15.5 17.5 15.5C17.5 15.5 17.8 17 17 17.8C16.5 16.8 16 13 16 13Z"
            fill="#FEF9C3"
          />
        </Svg>
      );

    case 'bell':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={style}>
          <Path
            d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21S18 15 18 8Z"
            fill="#FDE047"
            stroke="#F59E0B"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <Path d="M10.3 21A1.94 1.94 0 0 0 13.7 21" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
          <Circle cx="18" cy="6" r="3.2" fill="#F87171" />
        </Svg>
      );

    case 'heart':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={style}>
          <Path
            d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
            fill="#FB7185"
          />
        </Svg>
      );

    default:
      return null;
  }
};
