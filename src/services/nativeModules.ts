/**
 * Typed, failure-tolerant loaders for optional native modules.
 *
 * The audio services must keep working (falling back to on-device speech / Web Audio) when a
 * native module is not linked: Expo Go, web, or Jest. A static `import` would crash those
 * environments at module load, so the modules are `require`d lazily inside try/catch. This file
 * is the single place where an untyped `require()` result is given its real library type; every
 * consumer gets fully typed `AudioPlayer`, `AudioStatus`, file-system functions, etc.
 */
import type * as ExpoAudioTypes from 'expo-audio';

export type AudioPlayer = ExpoAudioTypes.AudioPlayer;
export type AudioStatus = ExpoAudioTypes.AudioStatus;
export type AudioSource = ExpoAudioTypes.AudioSource;
export type AudioModeConfig = Partial<ExpoAudioTypes.AudioMode>;
/** Subscription returned by `player.addListener(...)`. */
export type AudioSubscription = ReturnType<AudioPlayer['addListener']>;
export type AudioRecorder = ExpoAudioTypes.AudioRecorder;

export type ExpoAudioModule = typeof import('expo-audio');
export type FileSystemLegacyModule = typeof import('expo-file-system/legacy');
export type FileSystemNextModule = typeof import('expo-file-system');

/** Some bundlers expose CommonJS modules under `default`. */
type MaybeDefault<M> = M & { default?: M };

function loadOptional<M>(load: () => unknown): MaybeDefault<M> | null {
  try {
    const mod = load();
    return mod ? (mod as MaybeDefault<M>) : null;
  } catch {
    return null; // not linked in this environment (Expo Go, web, Jest)
  }
}

/** Resolves a member from the module or its `default` export. */
function pick<M, K extends keyof M>(mod: MaybeDefault<M> | null, key: K): M[K] | null {
  if (!mod) return null;
  return mod[key] ?? mod.default?.[key] ?? null;
}

/** expo-audio's player factory and audio-mode setter, or null when unavailable. */
export function loadExpoAudio(): {
  createAudioPlayer: ExpoAudioModule['createAudioPlayer'] | null;
  setAudioModeAsync: ExpoAudioModule['setAudioModeAsync'] | null;
} {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = loadOptional<ExpoAudioModule>(() => require('expo-audio'));
  return {
    createAudioPlayer: pick(mod, 'createAudioPlayer'),
    setAudioModeAsync: pick(mod, 'setAudioModeAsync'),
  };
}

/**
 * The classic file-system API. SDK 54+ moved it to `expo-file-system/legacy`; the same names
 * on the root export are stubs that throw at runtime, so the root is only a last resort.
 */
export function loadFileSystemLegacy(): FileSystemLegacyModule | null {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const legacy = loadOptional<FileSystemLegacyModule>(() => require('expo-file-system/legacy'));
  if (legacy) return legacy.default && !legacy.downloadAsync ? legacy.default : legacy;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const root = loadOptional<FileSystemLegacyModule>(() => require('expo-file-system'));
  return root ? (root.default && !root.downloadAsync ? root.default : root) : null;
}

/** The object-oriented SDK 54+ file API (`File`, `Directory`, `Paths`), or null when unavailable. */
export function loadFileSystemNext(): Pick<FileSystemNextModule, 'File' | 'Directory' | 'Paths'> | null {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = loadOptional<FileSystemNextModule>(() => require('expo-file-system'));
  if (!mod) return null;
  const File = pick(mod, 'File');
  const Directory = pick(mod, 'Directory');
  const Paths = pick(mod, 'Paths');
  return File && Directory && Paths ? { File, Directory, Paths } : null;
}

/** expo-audio's recording surface (permission, recorder class, presets), or null when unavailable. */
export function loadExpoAudioRecording(): Pick<
  ExpoAudioModule,
  'requestRecordingPermissionsAsync' | 'AudioModule' | 'RecordingPresets'
> | null {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = loadOptional<ExpoAudioModule>(() => require('expo-audio'));
  if (!mod) return null;
  const requestRecordingPermissionsAsync = pick(mod, 'requestRecordingPermissionsAsync');
  const AudioModule = pick(mod, 'AudioModule');
  const RecordingPresets = pick(mod, 'RecordingPresets');
  return requestRecordingPermissionsAsync && AudioModule && RecordingPresets
    ? { requestRecordingPermissionsAsync, AudioModule, RecordingPresets }
    : null;
}
