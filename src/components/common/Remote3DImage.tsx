import React, { useEffect, useRef, useState } from 'react';
import { ImageStyle, StyleProp, StyleSheet, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { isRemoteImageSource, resolveOfflineMediaSource } from '../../utils/remoteAssets';

export interface Remote3DImageProps {
  /** `{ uri }` from characterAsset(), a backend URL source, or a bundled require() number. */
  source: unknown;
  style: StyleProp<ImageStyle>;
  contentFit?: 'contain' | 'cover';
  /**
   * Shown instead of the image when it can't load (offline before the first download, 404...).
   * Pass the vector art / emoji the screen used before remote renders existed, so a child
   * never sees an empty box.
   */
  fallback?: React.ReactNode;
  accessibilityLabel?: string;
}

/** Delays before each automatic re-download after a failed load (a weak 3G/4G blip). */
export const REMOTE_IMAGE_RETRY_DELAYS_MS = [2000, 8000];

/**
 * Schedules bounded retries after load errors. Each failure schedules the next attempt
 * (`onRetry(attemptNumber)`) until the delays run out; cancel() drops anything pending.
 * Kept free of React so the timing can be unit-tested with fake timers.
 */
export function createImageRetryScheduler(
  onRetry: (attempt: number) => void,
  delays: readonly number[] = REMOTE_IMAGE_RETRY_DELAYS_MS
) {
  let attempt = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };
  return {
    /** Call on every load error. Returns false once retries are exhausted. */
    fail(): boolean {
      cancel();
      if (attempt >= delays.length) return false;
      const delay = delays[attempt];
      timer = setTimeout(() => {
        timer = null;
        attempt += 1;
        onRetry(attempt);
      }, delay);
      return true;
    },
    cancel,
    reset() {
      cancel();
      attempt = 0;
    },
  };
}

/**
 * Renders a 3D character image with expo-image: memory + disk cache (downloaded once, then
 * available offline), a short cross-fade, and a graceful fallback when the image fails.
 * After a failure the fallback shows immediately while the image is retried quietly behind
 * it a couple of times; the render replaces the fallback only once it has actually loaded.
 */
export const Remote3DImage: React.FC<Remote3DImageProps> = ({
  source,
  style,
  contentFit = 'contain',
  fallback = null,
  accessibilityLabel,
}) => {
  const resolvedSource = resolveOfflineMediaSource(source);
  const key = isRemoteImageSource(resolvedSource) ? resolvedSource.uri : String(resolvedSource ?? '');
  const [failed, setFailed] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const schedulerRef = useRef<ReturnType<typeof createImageRetryScheduler> | null>(null);
  if (!schedulerRef.current) {
    schedulerRef.current = createImageRetryScheduler((attempt) => setRetryAttempt(attempt));
  }

  // A recycled list cell may receive a new source: give it a fresh attempt and retry budget.
  useEffect(() => {
    setFailed(false);
    setRetryAttempt(0);
    schedulerRef.current?.reset();
  }, [key]);

  useEffect(() => () => schedulerRef.current?.cancel(), []);

  const handleError = () => {
    setFailed(true);
    schedulerRef.current?.fail();
  };

  if (!resolvedSource) {
    return <View style={[style, styles.center]}>{fallback}</View>;
  }

  if (failed) {
    return (
      <View style={[style, styles.center]}>
        {fallback}
        {retryAttempt > 0 ? (
          // Invisible until loaded: onLoad swaps back to the normal image path (now cached).
          <ExpoImage
            key={`${key}#retry${retryAttempt}`}
            source={resolvedSource as never}
            style={[StyleSheet.absoluteFill, styles.hidden]}
            contentFit={contentFit}
            cachePolicy="memory-disk"
            onLoad={() => setFailed(false)}
            onError={handleError}
          />
        ) : null}
      </View>
    );
  }

  return (
    <ExpoImage
      source={resolvedSource as never}
      style={style}
      contentFit={contentFit}
      cachePolicy="memory-disk"
      transition={150}
      recyclingKey={key}
      accessibilityLabel={accessibilityLabel}
      onError={handleError}
    />
  );
};

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hidden: {
    opacity: 0,
  },
});
