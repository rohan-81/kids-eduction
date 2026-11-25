/**
 * Remote 3D character renders (served by Django from /media/characters/, optionally via a CDN).
 *
 * The ~190 large 3D renders used by lessons, emoji art and rhymes are NOT bundled with the app
 * any more (they made the bundle ~200 MB). Registries reference them by key with
 * `characterAsset('3d_lion')`, which yields an image source `{ uri }`:
 *  - expo-image (see Remote3DImage) downloads it once and keeps it in its memory + disk cache,
 *    so after the first view (or the startup prefetch) it works offline;
 *  - when it cannot load (offline before first download), callers fall back to the bundled
 *    vector art / emoji, so there is never a blank box.
 *
 * Files are produced by backend/scripts/migrate_assets_to_db.py (512px WebP).
 */
import { safeGetApiBaseUrl } from '../services/apiConfig';

/** Bump when renders are re-exported under the same names, to bust app + CDN caches. */
export const CHARACTER_ASSET_VERSION = 'v1';

export interface RemoteImageSource {
  /** Versioned URL. expo-image caches by URL, which is also what Image.prefetch() fills. */
  uri: string;
}

/** Base URL of Django's /media/ (EXPO_PUBLIC_MEDIA_URL overrides it, e.g. a CDN). */
export function getMediaBaseUrl(): string {
  const override = process.env.EXPO_PUBLIC_MEDIA_URL?.trim();
  if (override) return override.replace(/\/+$/, '');
  return safeGetApiBaseUrl().replace(/\/+$/, '').replace(/\/api$/, '') + '/media';
}

const registry = new Map<string, RemoteImageSource>();

/** Image source for a 3D render by key, e.g. characterAsset('3d_lion'). */
export function characterAsset(key: string): RemoteImageSource {
  let src = registry.get(key);
  if (!src) {
    src = { uri: `${getMediaBaseUrl()}/characters/${key}.webp?v=${CHARACTER_ASSET_VERSION}` };
    registry.set(key, src);
  }
  return src;
}

/** Every remote render referenced by the app (registries are built at import time). */
export function getAllCharacterAssets(): RemoteImageSource[] {
  return Array.from(registry.values());
}

/** True for `{ uri }` image sources (remote), false for bundled `require()` numbers. */
export function isRemoteImageSource(src: unknown): src is { uri: string } {
  return !!src && typeof src === 'object' && typeof (src as { uri?: unknown }).uri === 'string';
}

/** True when a backend URL points at one of our 3D character renders (not an arbitrary photo). */
export function isBackendCharacterUrl(url?: string | null): url is string {
  return !!url && /^https?:\/\/.+\/characters\/[\w-]+\.(webp|png)(\?.*)?$/i.test(url);
}
