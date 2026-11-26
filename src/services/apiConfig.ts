import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { errorMessage } from '../utils/runtime';

/**
 * Dynamically resolves the API base URL.
 * - In Production: Enforces secure TLS HTTPS and strictly requires EXPO_PUBLIC_API_URL.
 * - On Web (Dev): Matches current browser host so localhost testing never fails.
 * - On Mobile (Dev): Auto-detects development machine's LAN IP from Expo Constants.
 */
export function getApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  // 1. Production build safeguard (outside development): enforce strict secure HTTPS
  const isProduction =
    process.env.NODE_ENV === 'production' &&
    typeof __DEV__ !== 'undefined' &&
    !__DEV__;

  if (isProduction) {
    if (!envUrl) {
      throw new Error(
        `[Security Error] Production build requires EXPO_PUBLIC_API_URL to be defined via environment or EAS secret.`
      );
    }
    // Allow private LAN IP testing in local release builds (e.g. testing local release APK over Wi-Fi)
    const isPrivateLan = /^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.|10\.0\.2\.2)/.test(envUrl);
    if (isPrivateLan) {
      return envUrl;
    }
    if (!envUrl.startsWith('https://')) {
      throw new Error(`[Security Error] Production API URL must use HTTPS. Received: "${envUrl}"`);
    }
    if (envUrl.includes('example.com')) {
      throw new Error(
        `[Configuration Error] Production API URL cannot use placeholder "example.com". Configure real server domain in EXPO_PUBLIC_API_URL.`
      );
    }
    return envUrl;
  }

  const isPrivateLanUrl = (url: string): boolean =>
    /^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|127\.0\.0\.1|localhost)(:\d+)?(\/|$)/i.test(
      url
    );

  // 2. On Web browser (Desktop or Mobile Chrome/Safari):
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location?.hostname) {
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1') {
        // When browsing locally on the dev PC, never let a stale mobile LAN IP in .env hijack localhost
        if (envUrl && !isPrivateLanUrl(envUrl)) {
          return envUrl;
        }
        return 'http://127.0.0.1:8000/api';
      }
      if (envUrl) {
        return envUrl;
      }
      const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
      return `${protocol}//${host}/api`;
    }
    return envUrl || 'http://127.0.0.1:8000/api';
  }

  // 3. Development / Testing (Native / Mobile): If explicit remote/cloud or LAN URL is configured, use it:
  if (envUrl && !envUrl.includes('127.0.0.1') && !envUrl.includes('localhost')) {
    return envUrl;
  }

  // 3. On Mobile device / Expo Go:
  // Auto-detect the development PC's IP address from Expo bundler connection URI
  // SDK < 46 classic manifests exposed `debuggerHost`; newer typings dropped the field.
  const legacyManifest = (Constants as { manifest?: { debuggerHost?: string } | null }).manifest;
  const rawHostUri: string =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    legacyManifest?.debuggerHost ||
    (Constants.linkingUri ? Constants.linkingUri.replace(/^exp:\/\//, '').split('/')[0] : null) ||
    (Constants.experienceUrl ? Constants.experienceUrl.replace(/^exp:\/\//, '').split('/')[0] : null) ||
    '';

  if (rawHostUri) {
    const match = rawHostUri.match(/(\d+\.\d+\.\d+\.\d+)/);
    if (match && match[1] && match[1] !== '127.0.0.1') {
      return `http://${match[1]}:8000/api`;
    }
  }

  // Android emulator fallback
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api';
  }

  return envUrl || 'http://127.0.0.1:8000/api';
}

/** Used when the API URL is misconfigured: requests fail fast and the app runs offline. */
export const OFFLINE_FALLBACK_API_URL = 'https://offline-fallback.local/api';

let lastConfigError: string | null = null;

/**
 * Non-throwing variant of getApiBaseUrl() for code that runs at module load or during playback
 * (render registries, media URLs, audio, fetches). A misconfigured release bundle must still boot
 * and run offline with bundled content instead of crashing before the first screen. Strict
 * validation still happens at build time (app.config.js) and via getApiBaseUrl() in tests/tooling.
 */
export function safeGetApiBaseUrl(): string {
  try {
    return getApiBaseUrl();
  } catch (e: unknown) {
    const message = errorMessage(e, String(e));
    if (message !== lastConfigError) {
      lastConfigError = message;
      if (typeof console !== 'undefined' && console.error) {
        console.error('[API Configuration Error]', message);
      }
    }
    return OFFLINE_FALLBACK_API_URL;
  }
}

/** The configuration error from the last resolution attempt, if any (for diagnostics screens). */
export function getApiConfigError(): string | null {
  return lastConfigError;
}

export const API_BASE_URL: string = safeGetApiBaseUrl();
