import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { unzipSync } from 'fflate';
import { getMediaBaseUrl, setLocalPackBaseUri, getLocalPackBaseUri } from '../utils/remoteAssets';
import { apiService } from './apiService';

export const CONTENT_PACK_VERSION = 'v1';
const PACK_VERSION_KEY = '@kidszone_content_pack_version';
const PACK_DIR_KEY = '@kidszone_content_pack_dir';

let FileSystemLegacy: any = null;
let FileClass: any = null;
let DirectoryClass: any = null;
let PathsObj: any = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  FileSystemLegacy = require('expo-file-system/legacy');
} catch {}

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fsNext = require('expo-file-system');
  FileClass = fsNext?.File || null;
  DirectoryClass = fsNext?.Directory || null;
  PathsObj = fsNext?.Paths || null;
} catch {}

let initialized = false;

function getPackBaseDirUri(): string | null {
  if (Platform.OS === 'web') return null;
  const docDir: string | null =
    FileSystemLegacy?.documentDirectory ||
    PathsObj?.document?.uri ||
    null;
  if (!docDir) return null;
  const normalized = docDir.endsWith('/') ? docDir : `${docDir}/`;
  return `${normalized}kidszone_pack_${CONTENT_PACK_VERSION}/`;
}

export interface DownloadPackProgress {
  percent: number;
  stage: 'downloading' | 'extracting' | 'syncing' | 'done';
}

export const contentPackService = {
  async init(): Promise<boolean> {
    if (initialized) return getLocalPackBaseUri() !== null;
    initialized = true;
    if (Platform.OS === 'web') return true;
    try {
      const [ver, savedDir] = await Promise.all([
        AsyncStorage.getItem(PACK_VERSION_KEY),
        AsyncStorage.getItem(PACK_DIR_KEY),
      ]);
      const expectedDir = savedDir || getPackBaseDirUri();
      if (ver === CONTENT_PACK_VERSION && expectedDir) {
        if (typeof FileSystemLegacy?.getInfoAsync === 'function') {
          const manifestInfo = await FileSystemLegacy.getInfoAsync(`${expectedDir}manifest.json`);
          if (manifestInfo?.exists) {
            setLocalPackBaseUri(expectedDir);
            return true;
          }
        } else {
          setLocalPackBaseUri(expectedDir);
          return true;
        }
      }
    } catch {}
    return false;
  },

  isPackInstalled(): boolean {
    if (Platform.OS === 'web') return true;
    return getLocalPackBaseUri() !== null;
  },

  getActivePackBaseUri(): string | null {
    return getLocalPackBaseUri();
  },

  /**
   * Downloads `content_pack_v1.zip` from the backend, extracts all 398 media files into
   * permanent app document storage, and caches core JSON endpoints for 100% offline usage.
   */
  async downloadAndInstallPack(
    onProgress?: (p: DownloadPackProgress) => void
  ): Promise<{ success: boolean; error?: string }> {
    if (Platform.OS === 'web') {
      onProgress?.({ percent: 100, stage: 'done' });
      return { success: true };
    }

    const packDir = getPackBaseDirUri();
    if (!packDir || !FileSystemLegacy) {
      return { success: false, error: 'Device storage unavailable.' };
    }

    const zipUrl = `${getMediaBaseUrl()}/content_pack_${CONTENT_PACK_VERSION}.zip`;
    const tempZipUri = `${(FileSystemLegacy.cacheDirectory || packDir)}kidszone_pack_tmp.zip`;

    try {
      onProgress?.({ percent: 2, stage: 'downloading' });
      await FileSystemLegacy.makeDirectoryAsync(packDir, { intermediates: true }).catch(() => {});

      // 1. Download single ZIP archive with progress tracking
      if (typeof FileSystemLegacy.createDownloadResumable === 'function') {
        const task = FileSystemLegacy.createDownloadResumable(
          zipUrl,
          tempZipUri,
          {},
          (dp: { totalBytesWritten: number; totalBytesExpectedToWrite: number }) => {
            if (dp.totalBytesExpectedToWrite > 0) {
              const rawRatio = dp.totalBytesWritten / dp.totalBytesExpectedToWrite;
              const pct = Math.min(70, Math.max(5, Math.round(rawRatio * 70)));
              onProgress?.({ percent: pct, stage: 'downloading' });
            }
          }
        );
        const result = await task.downloadAsync();
        if (!result || (result.status && result.status >= 400)) {
          throw new Error(`HTTP ${result?.status || 500}`);
        }
      } else {
        const res = await FileSystemLegacy.downloadAsync(zipUrl, tempZipUri);
        if (res?.status && res.status >= 400) {
          throw new Error(`HTTP ${res.status}`);
        }
      }

      // 2. Read ZIP bytes and extract cleanly into permanent app document storage
      onProgress?.({ percent: 72, stage: 'extracting' });
      let zipBytes: Uint8Array;
      if (FileClass) {
        zipBytes = await new FileClass(tempZipUri).bytes();
      } else {
        const b64: string = await FileSystemLegacy.readAsStringAsync(tempZipUri, {
          encoding: FileSystemLegacy.EncodingType?.Base64 || 'base64',
        });
        const binStr = atob(b64);
        zipBytes = new Uint8Array(binStr.length);
        for (let i = 0; i < binStr.length; i++) zipBytes[i] = binStr.charCodeAt(i);
      }

      const entries = unzipSync(zipBytes);
      const fileKeys = Object.keys(entries).filter((k) => !k.endsWith('/'));
      const createdDirs = new Set<string>();

      for (let i = 0; i < fileKeys.length; i++) {
        const relPath = fileKeys[i];
        const data = entries[relPath];
        const targetUri = `${packDir}${relPath}`;
        const parentDir = targetUri.slice(0, targetUri.lastIndexOf('/') + 1);

        if (!createdDirs.has(parentDir)) {
          if (DirectoryClass) {
            try { new DirectoryClass(parentDir).create({ intermediates: true, idempotent: true }); } catch {}
          } else {
            await FileSystemLegacy.makeDirectoryAsync(parentDir, { intermediates: true }).catch(() => {});
          }
          createdDirs.add(parentDir);
        }

        if (FileClass) {
          const outFile = new FileClass(targetUri);
          outFile.create({ intermediates: true, overwrite: true });
          outFile.write(data);
        } else {
          // Fallback base64 write
          let binary = '';
          const chunk = 0x8000;
          for (let j = 0; j < data.length; j += chunk) {
            binary += String.fromCharCode(...data.subarray(j, j + chunk));
          }
          await FileSystemLegacy.writeAsStringAsync(targetUri, btoa(binary), {
            encoding: FileSystemLegacy.EncodingType?.Base64 || 'base64',
          });
        }

        if (i % 25 === 0 || i === fileKeys.length - 1) {
          const pct = 72 + Math.round(((i + 1) / fileKeys.length) * 20);
          onProgress?.({ percent: Math.min(92, pct), stage: 'extracting' });
        }
      }

      // Remove temporary ZIP archive
      await FileSystemLegacy.deleteAsync(tempZipUri, { idempotent: true }).catch(() => {});

      // 3. Sync API JSON catalogs into AsyncStorage so lessons, stories, rhymes, badges work offline
      onProgress?.({ percent: 94, stage: 'syncing' });
      await Promise.allSettled([
        apiService.fetchCategories(),
        apiService.fetchLessons(),
        apiService.fetchStories(),
        apiService.fetchBadges(),
        apiService.fetchRhymes(),
        apiService.fetchStickers(),
        apiService.fetchAdventureLevels(),
        apiService.fetchColoringTemplates(),
      ]);

      setLocalPackBaseUri(packDir);
      await Promise.all([
        AsyncStorage.setItem(PACK_VERSION_KEY, CONTENT_PACK_VERSION),
        AsyncStorage.setItem(PACK_DIR_KEY, packDir),
      ]);

      onProgress?.({ percent: 100, stage: 'done' });
      return { success: true };
    } catch (err: any) {
      await FileSystemLegacy.deleteAsync(tempZipUri, { idempotent: true }).catch(() => {});
      return { success: false, error: err?.message || 'Download failed' };
    }
  },
};

