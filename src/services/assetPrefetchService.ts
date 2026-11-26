/**
 * Downloads every remote 3D render into expo-image's disk cache once per asset version, so after
 * the first online launch lessons, quizzes and rhymes show their 3D art fully offline.
 *
 * Runs in small batches a few seconds after startup so it never competes with the first screen.
 * If any batch fails (offline, server down) the version is not marked done and it retries on the
 * next launch; already-cached files are cheap to "prefetch" again.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { Platform } from 'react-native';
import {
  CHARACTER_ASSET_VERSION,
  APP_ASSET_VERSION,
  getAllCharacterAssets,
  getAllAppAssets,
  getMediaBaseUrl,
} from '../utils/remoteAssets';
import { contentPackService } from './contentPackService';
// Importing the registries populates the remote asset lists.
import '../utils/animalRenders';
import '../utils/natureRenders';
import '../utils/extraRenders';
import '../utils/rhymeRenders';
import '../utils/imageHelper'; // story characters + app assets
import '../utils/magicStoryGenerator'; // magic story companions, themes & tools
import '../components/SubjectBadgeIcons'; // topic badges

const DONE_KEY = '@kidszone_char_prefetch_done';
const APP_ASSETS_DONE_KEY = '@kidszone_app_assets_prefetch_done';
const ANIMAL_AUDIO_DONE_KEY = '@kidszone_animal_audio_prefetch_done';
const BATCH_SIZE = 4;
const BATCH_PAUSE_MS = 120;
const START_DELAY_MS = 3500;

let started = false;

const ANIMAL_KEYS_TO_PREFETCH = [
  'lion', 'tiger', 'cat', 'dog', 'cow', 'peacock', 'sparrow', 'elephant',
  'horse', 'parrot', 'rabbit', 'monkey', 'duck', 'camel', 'deer', 'giraffe',
  'zebra', 'bear', 'pigeon', 'rooster', 'sheep', 'goat', 'frog', 'donkey',
  'crow', 'owl', 'bee', 'buffalo', 'fox', 'wolf', 'leopard', 'cheetah',
  'panda', 'kangaroo', 'hippo', 'rhino', 'squirrel', 'ox', 'turtle',
  'crocodile', 'koel', 'eagle', 'swan', 'flamingo', 'crane', 'woodpecker',
  'kingfisher', 'penguin', 'ostrich', 'vulture',
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function prefetchImageUrls(urls: string[], doneKey: string, marker: string): Promise<boolean> {
  try {
    if ((await AsyncStorage.getItem(doneKey)) === marker) return true;
  } catch {}

  let allOk = true;
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    try {
      const ok = await Image.prefetch(urls.slice(i, i + BATCH_SIZE), 'disk');
      if (!ok) allOk = false;
    } catch {
      allOk = false;
      break; // offline: stop now, retry next launch
    }
    if (typeof process === 'undefined' || !process.env?.JEST_WORKER_ID) {
      await sleep(BATCH_PAUSE_MS);
    }
  }

  if (allOk) {
    try {
      await AsyncStorage.setItem(doneKey, marker);
    } catch {}
  }
  return allOk;
}

export async function prefetchCharacterAssets(): Promise<boolean> {
  if (Platform.OS !== 'web' && contentPackService.isPackInstalled()) return true;
  const urls = getAllCharacterAssets().map((s) => s.uri);
  const marker = `${CHARACTER_ASSET_VERSION}:${urls.length}`;
  return prefetchImageUrls(urls, DONE_KEY, marker);
}

/** Downloads compressed app images (animals, stories, currency, magic) into disk cache for offline use. */
export async function prefetchAppAssets(): Promise<boolean> {
  if (Platform.OS !== 'web' && contentPackService.isPackInstalled()) return true;
  const urls = getAllAppAssets().map((s) => s.uri);
  if (urls.length === 0) return true;
  const marker = `${APP_ASSET_VERSION}:${urls.length}`;
  return prefetchImageUrls(urls, APP_ASSETS_DONE_KEY, marker);
}

/** Downloads compressed animal MP3s (~1 MB total) to local mobile storage once for instant offline playback. */
export async function prefetchAnimalAudio(): Promise<boolean> {
  if (Platform.OS === 'web' || contentPackService.isPackInstalled()) return true;
  const marker = `v1:${ANIMAL_KEYS_TO_PREFETCH.length}`;
  try {
    if ((await AsyncStorage.getItem(ANIMAL_AUDIO_DONE_KEY)) === marker) return true;
  } catch {}

  let FileSystem: any = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    FileSystem = require('expo-file-system/legacy');
  } catch {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      FileSystem = require('expo-file-system');
    } catch {
      return false;
    }
  }
  const baseDir = FileSystem?.documentDirectory || FileSystem?.cacheDirectory;
  if (!baseDir || typeof FileSystem?.downloadAsync !== 'function') return false;

  const audioDir = `${baseDir}kidszone_audio/animals/`;
  try {
    await FileSystem.makeDirectoryAsync(audioDir, { intermediates: true });
  } catch {}

  const mediaBase = getMediaBaseUrl();
  let allOk = true;
  for (const key of ANIMAL_KEYS_TO_PREFETCH) {
    const target = `${audioDir}${key}.mp3`;
    try {
      const info = await FileSystem.getInfoAsync(target);
      if (info?.exists && (info.size ?? 0) > 500) continue;
      const res = await FileSystem.downloadAsync(`${mediaBase}/audio/animals/${key}.mp3`, target);
      if (res?.status && res.status >= 400) {
        allOk = false;
        try { await FileSystem.deleteAsync(target, { idempotent: true }); } catch {}
      }
    } catch {
      allOk = false;
      break;
    }
    await sleep(60);
  }

  if (allOk) {
    try {
      await AsyncStorage.setItem(ANIMAL_AUDIO_DONE_KEY, marker);
    } catch {}
  }
  return allOk;
}

/** Starts the background prefetch once per app session (safe to call repeatedly). */
export function schedulePrefetchCharacterAssets(delayMs: number = START_DELAY_MS): void {
  if (started) return;
  started = true;
  const timer = setTimeout(() => {
    prefetchCharacterAssets()
      .then(() => prefetchAppAssets())
      .then(() => prefetchAnimalAudio())
      .catch(() => {});
  }, delayMs);
  if (typeof timer === 'object' && typeof (timer as any).unref === 'function') {
    (timer as any).unref();
  }
}
