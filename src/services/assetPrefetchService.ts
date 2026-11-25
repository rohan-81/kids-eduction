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
import { CHARACTER_ASSET_VERSION, getAllCharacterAssets } from '../utils/remoteAssets';
// Importing the registries populates the remote asset list.
import '../utils/animalRenders';
import '../utils/natureRenders';
import '../utils/extraRenders';
import '../utils/rhymeRenders';
import '../utils/imageHelper'; // story characters
import '../utils/magicStoryGenerator'; // magic story companions
import '../components/SubjectBadgeIcons'; // topic badges

const DONE_KEY = '@kidszone_char_prefetch_done';
const BATCH_SIZE = 8;
const START_DELAY_MS = 6000;

let started = false;

export async function prefetchCharacterAssets(): Promise<boolean> {
  const marker = `${CHARACTER_ASSET_VERSION}:${getAllCharacterAssets().length}`;
  try {
    if ((await AsyncStorage.getItem(DONE_KEY)) === marker) return true;
  } catch {}

  const urls = getAllCharacterAssets().map((s) => s.uri);
  let allOk = true;
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    try {
      const ok = await Image.prefetch(urls.slice(i, i + BATCH_SIZE), 'disk');
      if (!ok) allOk = false;
    } catch {
      allOk = false;
      break; // offline: stop now, retry next launch
    }
  }

  if (allOk) {
    try {
      await AsyncStorage.setItem(DONE_KEY, marker);
    } catch {}
  }
  return allOk;
}

/** Starts the background prefetch once per app session (safe to call repeatedly). */
export function schedulePrefetchCharacterAssets(delayMs: number = START_DELAY_MS): void {
  if (started) return;
  started = true;
  setTimeout(() => {
    prefetchCharacterAssets().catch(() => {});
  }, delayMs);
}
