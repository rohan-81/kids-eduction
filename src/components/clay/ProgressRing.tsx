import React, { useContext } from 'react';
import { View, Text, Platform } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { kidTones, KidTone } from '../../theme/kidTheme';
import { formatNumberDigits } from '../../utils/languageData';
import { AppContext } from '../../context/AppContext';

export interface ProgressRingProps {
  /** 0..1 */
  value: number;
  size?: number;
  stroke?: number;
  tone?: KidTone;
  /** Centre content; defaults to the percentage. */
  children?: React.ReactNode;
  showLabel?: boolean;
  language?: 'gu' | 'hi' | 'en';
}

/** Circular progress ring for subject / category cards. */
export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  size = 56,
  stroke = 6,
  tone = 'mint',
  children,
  showLabel = true,
  language,
}) => {
  const appContext = useContext(AppContext);
  const lang = language || appContext?.language || 'gu';
  const pct = Math.max(0, Math.min(1, isFinite(value) ? value : 0));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const spec = kidTones[tone];
  const roundedPct = Math.round(pct * 100);
  const percentText = `${formatNumberDigits(roundedPct, lang)}%`;

  if (Platform.OS === 'web') {
    return (
      <View
        style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: roundedPct }}
      >
        {React.createElement(
          'svg',
          {
            width: size,
            height: size,
            style: { position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' },
          },
          React.createElement('circle', {
            cx: size / 2,
            cy: size / 2,
            r,
            stroke: spec.tintBorder,
            strokeWidth: stroke,
            fill: 'none',
          }),
          React.createElement('circle', {
            cx: size / 2,
            cy: size / 2,
            r,
            stroke: spec.fill,
            strokeWidth: stroke,
            fill: 'none',
            strokeLinecap: 'round',
            strokeDasharray: `${c} ${c}`,
            strokeDashoffset: c * (1 - pct),
          })
        )}
        {children ??
          (showLabel ? (
            <Text
              style={{
                fontSize: Math.max(10, size * 0.24),
                fontWeight: '700',
                fontFamily: (Platform.OS === 'web' ? '"Baloo 2", "Noto Sans Gujarati", "Noto Sans Devanagari", "Shruti", sans-serif' : undefined) as any,
                color: spec.text,
              }}
            >
              {percentText}
            </Text>
          ) : null)}
      </View>
    );
  }

  return (
    <View
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: roundedPct }}
    >
      <Svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={spec.tintBorder} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={spec.fill}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c * (1 - pct)}
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {children ??
        (showLabel ? (
          <Text
            style={{
              fontSize: Math.max(10, size * 0.24),
              fontWeight: '700',
              color: spec.text,
            }}
          >
            {percentText}
          </Text>
        ) : null)}
    </View>
  );
};
