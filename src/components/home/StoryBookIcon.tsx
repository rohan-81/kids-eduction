import React from 'react';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Path,
  Circle,
} from 'react-native-svg';

interface StoryBookIconProps {
  size?: number;
}

export const StoryBookIcon: React.FC<StoryBookIconProps> = ({ size = 32 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <Defs>
        {/* Book Cover Gradient: Royal indigo/purple */}
        <LinearGradient id="sbCover" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#6D28D9" />
          <Stop offset="100%" stopColor="#4F46E5" />
        </LinearGradient>

        {/* Page Gradient: Soft warm ivory to clean white */}
        <LinearGradient id="sbPage" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="100%" stopColor="#F8FAFC" />
        </LinearGradient>

        {/* Gold Sparkle Star Gradient */}
        <LinearGradient id="sbGold" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#FDE047" />
          <Stop offset="50%" stopColor="#F59E0B" />
          <Stop offset="100%" stopColor="#D97706" />
        </LinearGradient>

        {/* Ruby Ribbon Bookmark Gradient */}
        <LinearGradient id="sbRibbon" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#FB7185" />
          <Stop offset="100%" stopColor="#E11D48" />
        </LinearGradient>
      </Defs>

      {/* 1. Book Outer Cover (3D Depth) */}
      <Path
        d="M3 13.5C7.5 12 16.5 13.5 18 15.5C19.5 13.5 28.5 12 33 13.5V28C28.5 26.5 19.5 28 18 30C16.5 28 7.5 26.5 3 28V13.5Z"
        fill="url(#sbCover)"
      />

      {/* 2. Left Page (3D Arched Leaf) */}
      <Path
        d="M4.5 14.5C8.8 13.2 16.2 14.2 17.5 16V29C16.2 27.2 8.8 26.2 4.5 27.5V14.5Z"
        fill="url(#sbPage)"
      />

      {/* 3. Left Page Story Lines */}
      <Path
        d="M8 17.5H14M8 20.5H14M8 23.5H12"
        stroke="#94A3B8"
        strokeWidth={1.3}
        strokeLinecap="round"
      />

      {/* 4. Right Page (3D Arched Leaf) */}
      <Path
        d="M31.5 14.5C27.2 13.2 19.8 14.2 18.5 16V29C19.8 27.2 27.2 26.2 31.5 27.5V14.5Z"
        fill="url(#sbPage)"
      />

      {/* 5. Right Page Story Lines */}
      <Path
        d="M22 17.5H28M22 20.5H28M22 23.5H25"
        stroke="#94A3B8"
        strokeWidth={1.3}
        strokeLinecap="round"
      />

      {/* 6. Center Spine Shadow */}
      <Path
        d="M18 15.5V29.5"
        stroke="#CBD5E1"
        strokeWidth={1.2}
      />

      {/* 7. Ruby Ribbon Bookmark Hanging from Center */}
      <Path
        d="M17 15.5H19V32L18 30.5L17 32V15.5Z"
        fill="url(#sbRibbon)"
      />

      {/* 8. Fairy-Tale Magic Sparkle Star (Center-right above book) */}
      <Path
        d="M22 3L23.2 6.8L27 8L23.2 9.2L22 13L20.8 9.2L17 8L20.8 6.8L22 3Z"
        fill="url(#sbGold)"
      />

      {/* 9. Small Floating Gold Star (Top-left) */}
      <Path
        d="M11 5L11.8 7.2L14 8L11.8 8.8L11 11L10.2 8.8L8 8L10.2 7.2L11 5Z"
        fill="#FBBF24"
      />

      {/* 10. Magic Fairy Sparkle Dots */}
      <Circle cx="29" cy="5" r="1.3" fill="#FDE047" />
      <Circle cx="7" cy="11" r="1" fill="#FDE047" />
      <Circle cx="30" cy="11" r="1.2" fill="#FBBF24" />
    </Svg>
  );
};

