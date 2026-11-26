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
export const CHARACTER_ASSET_VERSION = 'v3';
export const APP_ASSET_VERSION = 'v1';

/** A bundled `require()`d image (module id) or a remote, disk-cached `{ uri }` render. */
export type ImageAsset = number | RemoteImageSource;

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
const appAssetRegistry = new Map<string, RemoteImageSource>();
let localPackBaseUri: string | null = null;

/** Called once the permanently downloaded offline content pack is ready on device storage. */
export function setLocalPackBaseUri(baseUri: string | null): void {
  localPackBaseUri = baseUri ? (baseUri.endsWith('/') ? baseUri : `${baseUri}/`) : null;
}

export function getLocalPackBaseUri(): string | null {
  return localPackBaseUri;
}

/** Resolves a relative media path (e.g. `audio/animals/lion.mp3`) to the local pack `file://` URI if installed. */
export function resolvePackFileUri(relativePath: string): string | null {
  if (!localPackBaseUri) return null;
  const clean = relativePath.replace(/^\/+/, '').split('?')[0];
  return `${localPackBaseUri}${clean}`;
}

/** Converts a remote `/media/<relPath>` source to its local `file://` source when the offline pack is installed. */
export function resolveOfflineMediaSource<T>(source: T): T {
  if (!localPackBaseUri || !source || typeof source !== 'object') return source;
  const uri = (source as { uri?: unknown }).uri;
  if (typeof uri !== 'string') return source;
  const marker = '/media/';
  const idx = uri.indexOf(marker);
  if (idx === -1) return source;
  const rel = uri.slice(idx + marker.length).split('?')[0];
  if (!rel) return source;
  return { uri: `${localPackBaseUri}${rel}` } as unknown as T;
}

/** Image source for a 3D render by key, e.g. characterAsset('3d_lion'). */
export function characterAsset(key: string): RemoteImageSource {
  let src = registry.get(key);
  if (!src) {
    src = { uri: `${getMediaBaseUrl()}/characters/${key}.webp?v=${CHARACTER_ASSET_VERSION}` };
    registry.set(key, src);
  }
  return src;
}

/** Image source for an on-demand downloaded app asset under /media/app_assets/. */
export function appAsset(relPath: string): RemoteImageSource {
  const clean = relPath.replace(/^\/+/, '');
  let src = appAssetRegistry.get(clean);
  if (!src) {
    src = { uri: `${getMediaBaseUrl()}/app_assets/${clean}?v=${APP_ASSET_VERSION}` };
    appAssetRegistry.set(clean, src);
  }
  return src;
}

/** Every remote render referenced by the app (registries are built at import time). */
export function getAllCharacterAssets(): RemoteImageSource[] {
  return Array.from(registry.values());
}

/** Every remote app asset (animal photos, story covers, currency, magic art) for background caching. */
export function getAllAppAssets(): RemoteImageSource[] {
  return Array.from(appAssetRegistry.values());
}

/** True for `{ uri }` image sources (remote), false for bundled `require()` numbers. */
export function isRemoteImageSource(src: unknown): src is { uri: string } {
  return !!src && typeof src === 'object' && typeof (src as { uri?: unknown }).uri === 'string';
}

/** True when a backend URL points at one of our 3D character renders (not an arbitrary photo). */
export function isBackendCharacterUrl(url?: string | null): url is string {
  return !!url && /^https?:\/\/.+\/characters\/[\w-]+\.(webp|png)(\?.*)?$/i.test(url);
}
