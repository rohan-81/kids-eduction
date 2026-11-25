import React from 'react';
import { View, Text, StyleProp, ViewStyle } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { kidTones, clayShadow, KidTone } from '../../theme/kidTheme';

export type GlyphName =
  | 'next'
  | 'back'
  | 'close'
  | 'replay'
  | 'check'
  | 'backspace'
  | 'home'
  | 'lock'
  | 'book'
  | 'page'
  | 'clock'
  | 'sparkle'
  | 'star'
  | 'globe'
  | 'logout'
  | 'help'
  | 'info'
  | 'shield'
  | 'printer'
  | 'volume'
  | 'user'
  | 'warning'
  | 'pencil'
  | 'trash'
  | 'undo'
  | 'eraser'
  | 'backpack'
  | 'target'
  | 'drop'
  | 'sprout';

/**
 * Rounded, chunky SVG glyphs that replace raw text arrows / crosses (➔ ← ✕ OK).
 * SVG renders identically on web, iOS and Android (unlike font glyphs).
 */
export const Glyph: React.FC<{ name: GlyphName; size?: number; color?: string; strokeWidth?: number }> = ({
  name,
  size = 22,
  color = '#FFFFFF',
  strokeWidth = 3.2,
}) => {
  const common = { stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'next' && <Path d="M5 12H19M13 6L19 12L13 18" {...common} />}
      {name === 'back' && <Path d="M19 12H5M11 6L5 12L11 18" {...common} />}
      {name === 'close' && <Path d="M6.5 6.5L17.5 17.5M17.5 6.5L6.5 17.5" {...common} />}
      {name === 'check' && <Path d="M5 12.5L10 17.5L19 7" {...common} />}
      {name === 'replay' && (
        <>
          <Path d="M4.5 12A7.5 7.5 0 1 0 7 6.4" {...common} />
          <Path d="M4 3.5V8H8.5" {...common} />
        </>
      )}
      {name === 'backspace' && (
        <>
          <Path d="M9 5H20V19H9L3 12Z" {...common} />
          <Path d="M12.5 9.5L16.5 14.5M16.5 9.5L12.5 14.5" {...common} />
        </>
      )}
      {name === 'home' && <Path d="M4 11L12 4L20 11V20H14.5V14.5H9.5V20H4Z" {...common} />}
      {name === 'lock' && (
        <>
          <Path d="M6 11H18V20H6Z" {...common} />
          <Path d="M8.5 11V8A3.5 3.5 0 0 1 15.5 8V11" {...common} />
          <Circle cx="12" cy="15.5" r="0.8" fill={color} stroke={color} />
        </>
      )}
      {name === 'book' && (
        <>
          <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" {...common} />
          <Path d="M6.5 3H20V21H6.5A2.5 2.5 0 0 1 4 18.5V5.5A2.5 2.5 0 0 1 6.5 3Z" {...common} />
        </>
      )}
      {name === 'page' && (
        <>
          <Path d="M14 2H6A2 2 0 0 0 4 4V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V8L14 2Z" {...common} />
          <Path d="M14 2V8H20" {...common} />
          <Path d="M8 13H16M8 17H13" {...common} />
        </>
      )}
      {name === 'clock' && (
        <>
          <Circle cx="12" cy="12" r="9" {...common} />
          <Path d="M12 7V12L15 14" {...common} />
        </>
      )}
      {name === 'sparkle' && (
        <Path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" {...common} fill={color} />
      )}
      {name === 'star' && (
        <Path
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          {...common}
          fill={color}
        />
      )}
      {name === 'globe' && (
        <>
          <Circle cx="12" cy="12" r="9" {...common} />
          <Path d="M3 12H21M12 3C9.2 6 9.2 18 12 21M12 3C14.8 6 14.8 18 12 21" {...common} />
        </>
      )}
      {name === 'logout' && (
        <>
          <Path d="M13 4H6.5A1.5 1.5 0 0 0 5 5.5V18.5A1.5 1.5 0 0 0 6.5 20H13" {...common} />
          <Path d="M10 12H20M16.5 8L20 12L16.5 16" {...common} />
        </>
      )}
      {name === 'help' && (
        <>
          <Circle cx="12" cy="12" r="9" {...common} />
          <Path d="M9.5 9.5A2.5 2.5 0 1 1 13 11.8C12.3 12.2 12 12.7 12 13.5" {...common} />
          <Circle cx="12" cy="17" r="0.9" fill={color} stroke={color} />
        </>
      )}
      {name === 'info' && (
        <>
          <Circle cx="12" cy="12" r="9" {...common} />
          <Path d="M12 11V16.5" {...common} />
          <Circle cx="12" cy="7.8" r="0.9" fill={color} stroke={color} />
        </>
      )}
      {name === 'shield' && (
        <>
          <Path d="M12 3L19.5 6V11.5C19.5 16 16.3 19.4 12 21C7.7 19.4 4.5 16 4.5 11.5V6Z" {...common} />
          <Path d="M8.5 12L11 14.5L15.5 9.5" {...common} />
        </>
      )}
      {name === 'printer' && (
        <>
          <Path d="M7 9V3.5H17V9" {...common} />
          <Path d="M7 17H5A2 2 0 0 1 3 15V11A2 2 0 0 1 5 9H19A2 2 0 0 1 21 11V15A2 2 0 0 1 19 17H17" {...common} />
          <Path d="M7 14H17V20.5H7Z" {...common} />
        </>
      )}
      {name === 'volume' && (
        <>
          <Path d="M4 9.5H7.5L12 5.5V18.5L7.5 14.5H4Z" {...common} />
          <Path d="M15.5 9A4 4 0 0 1 15.5 15M18.5 6.5A7.5 7.5 0 0 1 18.5 17.5" {...common} />
        </>
      )}
      {name === 'user' && (
        <>
          <Circle cx="12" cy="8" r="4" {...common} />
          <Path d="M4.5 20.5C5.5 16.5 8.5 14.5 12 14.5S18.5 16.5 19.5 20.5" {...common} />
        </>
      )}
      {name === 'warning' && (
        <>
          <Path d="M12 3.5L21.5 20H2.5Z" {...common} />
          <Path d="M12 9.5V14" {...common} />
          <Circle cx="12" cy="17" r="0.9" fill={color} stroke={color} />
        </>
      )}
      {name === 'pencil' && (
        <>
          <Path d="M15.5 4.5L19.5 8.5L8.5 19.5H4.5V15.5Z" {...common} />
          <Path d="M13 7L17 11" {...common} />
        </>
      )}
      {name === 'trash' && (
        <>
          <Path d="M4 6.5H20M9.5 6.5V4H14.5V6.5" {...common} />
          <Path d="M6 6.5L7 20H17L18 6.5M10 10.5V16M14 10.5V16" {...common} />
        </>
      )}
      {name === 'undo' && (
        <>
          <Path d="M9 14L4 9L9 4" {...common} />
          <Path d="M4 9H14.5A5.5 5.5 0 0 1 14.5 20H11" {...common} />
        </>
      )}
      {name === 'eraser' && (
        <>
          <Path d="M14.5 4.5L20 10L11 19H7L3.5 15.5Z" {...common} />
          <Path d="M9 10L14.5 15.5M11 19H20" {...common} />
        </>
      )}
      {name === 'backpack' && (
        <>
          <Path d="M9 6V4.5A3 3 0 0 1 15 4.5V6" {...common} />
          <Path d="M8 6H16A3 3 0 0 1 19 9V19A1.5 1.5 0 0 1 17.5 20.5H6.5A1.5 1.5 0 0 1 5 19V9A3 3 0 0 1 8 6Z" {...common} />
          <Path d="M8.5 13.5H15.5V17.5H8.5Z" {...common} />
        </>
      )}
      {name === 'target' && (
        <>
          <Circle cx="12" cy="12" r="9" {...common} />
          <Circle cx="12" cy="12" r="5" {...common} />
          <Circle cx="12" cy="12" r="1.3" fill={color} stroke={color} />
        </>
      )}
      {name === 'drop' && <Path d="M12 3C12 3 5.5 10.5 5.5 14.5A6.5 6.5 0 0 0 18.5 14.5C18.5 10.5 12 3 12 3Z" {...common} fill={color} />}
      {name === 'sprout' && (
        <>
          <Path d="M12 21V11" {...common} />
          <Path d="M12 13C12 9 9 6.5 4.5 6.5C4.5 10.5 7.5 13 12 13ZM12 11C12 7 14.5 4 19.5 4C19.5 8.5 16.5 11 12 11Z" {...common} fill={color} />
        </>
      )}
    </Svg>
  );
};

type NamedIconProps = { size?: number; color?: string; strokeWidth?: number };
const named = (name: GlyphName) => {
  const Icon: React.FC<NamedIconProps> = (p) => <Glyph name={name} size={p.size ?? 18} color={p.color ?? '#1E293B'} strokeWidth={p.strokeWidth ?? 2.4} />;
  return Icon;
};
/** Crisp SVG replacements for system emojis in buttons, headers and banners. */
export const LogoutIcon = named('logout'); // 🚪
export const GlobeIcon = named('globe'); // 🌐
export const HelpIcon = named('help'); // ❓
export const InfoIcon = named('info'); // ℹ️
export const ShieldIcon = named('shield'); // 🛡️
export const PrinterIcon = named('printer'); // 🖨️
export const VolumeIcon = named('volume'); // 🔊
export const UserIcon = named('user'); // 👤
export const WarningIcon = named('warning'); // ⚠️
export const BackpackIcon = named('backpack'); // 🎒
export const PencilIcon = named('pencil'); // ✏️
export const TrashIcon = named('trash'); // 🗑️
export const UndoIcon = named('undo'); // ↩️
export const EraserIcon = named('eraser'); // 🧹
export const TargetIcon = named('target'); // 🎯

/**
 * Collectible "game token" enclosure: a soft pastel bubble (44-54px) holding an emoji,
 * glyph or any icon node, with a thin rim and a tiny 3D lip.
 */
export const IconBadge: React.FC<{
  tone?: KidTone;
  size?: number;
  emoji?: string;
  children?: React.ReactNode;
  filled?: boolean;
  style?: StyleProp<ViewStyle>;
}> = ({ tone = 'sky', size = 48, emoji, children, filled = false, style }) => {
  const spec = kidTones[tone];
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: filled ? spec.fill : spec.tint,
          borderWidth: 2,
          borderColor: filled ? spec.edge : spec.tintBorder,
          borderBottomWidth: 4,
          borderBottomColor: filled ? spec.edge : spec.tintBorder,
          alignItems: 'center',
          justifyContent: 'center',
        },
        clayShadow(1),
        style,
      ]}
    >
      {children ?? <Text style={{ fontSize: Math.round(size * 0.5) }}>{emoji}</Text>}
    </View>
  );
};
