import React, { useEffect, useState } from 'react';
import { View, Text, ImageSourcePropType, StyleProp, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { kidRadii, kidSizes, kidTones, KidTone } from '../../theme/kidTheme';
import { resolveOfflineMediaSource } from '../../utils/remoteAssets';

export interface ImageFrameProps {
  /** Remote URL, require() asset, or an ImageSource. Falls back to `emoji` when missing or broken. */
  source?: ImageSourcePropType | string | number | null;
  emoji?: string;
  /** 'card' = 72x72 (grids), 'detail' = 280x230 (lesson detail), or explicit numbers. */
  variant?: 'card' | 'detail';
  width?: number;
  height?: number;
  radius?: number;
  tone?: KidTone;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  resizeMode?: 'cover' | 'contain';
}

/**
 * Fixed-size rounded image box. The box preserves aspect ratio (`contain` by default)
 * so entire animals, birds, and educational objects are completely visible without cropping.
 */
export const ImageFrame: React.FC<ImageFrameProps> = ({
  source,
  emoji,
  variant = 'card',
  width,
  height,
  radius,
  tone = 'sky',
  style,
  accessibilityLabel,
  resizeMode = 'contain',
}) => {
  const [failed, setFailed] = useState(false);
  const w = width ?? (variant === 'detail' ? kidSizes.detailImageW : kidSizes.gridImage);
  const h = height ?? (variant === 'detail' ? kidSizes.detailImageH : kidSizes.gridImage);
  const r = radius ?? (variant === 'detail' ? kidRadii.card : kidRadii.frame);
  const spec = kidTones[tone];

  const resolvedRaw =
    typeof source === 'string' ? (source.trim() ? { uri: source } : null) : (source as ImageSourcePropType | null | undefined);
  const resolved = resolveOfflineMediaSource(resolvedRaw);
  const sourceKey = resolved && typeof resolved === 'object' && 'uri' in resolved ? String(resolved.uri) : String(resolved ?? '');

  // A recycled grid cell may get a new source: retry instead of keeping the old failure.
  useEffect(() => {
    setFailed(false);
  }, [sourceKey]);

  return (
    <View
      style={[
        {
          width: w,
          height: h,
          borderRadius: r,
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
          borderWidth: 1.5,
          borderColor: spec.tintBorder,
          alignItems: 'center',
          justifyContent: 'center',
          padding: variant === 'detail' ? 4 : 2,
        },
        style,
      ]}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityLabel ? 'image' : undefined}
    >
      {resolved && !failed ? (
        // expo-image: memory + disk cache, so remote renders keep working offline after first view
        <Image
          source={resolved as never}
          contentFit={resizeMode}
          cachePolicy="memory-disk"
          transition={150}
          recyclingKey={sourceKey}
          onError={() => setFailed(true)}
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <Text style={{ fontSize: Math.round(Math.min(w, h) * 0.5) }}>{emoji || '🖼️'}</Text>
      )}
    </View>
  );
};
