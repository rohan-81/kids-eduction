import { Platform } from 'react-native';
import { RhymeItem } from '../data/rhymesData';
import { safeGetApiBaseUrl, API_BASE_URL } from './apiConfig';
import { getMediaBaseUrl } from '../utils/remoteAssets';

let ExpoFileSystem: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ExpoFileSystem = require('expo-file-system');
} catch {
  ExpoFileSystem = null;
}

function getRhymeCachePath(rhymeId: string): string | null {
  const baseDir = ExpoFileSystem?.documentDirectory || ExpoFileSystem?.cacheDirectory;
  if (!baseDir) return null;
  const safeId = rhymeId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${baseDir}kidszone_audio/rhymes/${safeId}.mp3`;
}

// Safely obtain native audio player factory if available (Expo SDK 53+ uses expo-audio)
let createAudioPlayerFn: ((source: any) => any) | null = null;
let setAudioModeAsyncFn: ((mode: any) => Promise<any>) | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ExpoAudio = require('expo-audio');
  createAudioPlayerFn = ExpoAudio?.createAudioPlayer || ExpoAudio?.default?.createAudioPlayer || null;
  setAudioModeAsyncFn = ExpoAudio?.setAudioModeAsync || ExpoAudio?.default?.setAudioModeAsync || null;
} catch {
  // Native module not linked or not supported
}

export interface RhymePlaybackStatus {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  currentLineIndex: number;
  didJustFinish: boolean;
  rhymeId?: string;
  error?: string;
}

/** Why play() did or did not start audio. See RhymeAudioService.play. */
export type RhymePlayOutcome = 'started' | 'superseded' | 'unavailable' | 'network-error';

export type RhymeStatusListener = (status: RhymePlaybackStatus) => void;

class RhymeAudioService {
  private currentWebAudio: any = null;
  private currentNativePlayer: any = null;
  private currentNativeSubscription: any = null;
  private activeRhyme: RhymeItem | null = null;
  private isPlayingState: boolean = false;
  private isPausedState: boolean = false;
  private currentTimeState: number = 0;
  private durationState: number = 0;
  private listeners = new Set<RhymeStatusListener>();
  private pollInterval: any = null;
  private playRequestId: number = 0;

  public addListener(fn: RhymeStatusListener): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private emitStatus(override?: Partial<RhymePlaybackStatus>): void {
    const dur = this.durationState || 1;
    const progress = Math.min(1, Math.max(0, this.currentTimeState / dur));
    const lineCount = this.activeRhyme?.lines?.length || 1;

    let lineIdx = 0;
    if (this.activeRhyme?.cueTimestamps && this.activeRhyme.cueTimestamps.length > 0) {
      const cues = this.activeRhyme.cueTimestamps;
      for (let i = 0; i < cues.length; i++) {
        if (this.currentTimeState >= cues[i]) {
          lineIdx = i;
        } else {
          break;
        }
      }
      lineIdx = Math.min(lineCount - 1, lineIdx);
    } else {
      lineIdx = Math.min(lineCount - 1, Math.floor(progress * lineCount));
    }

    const status: RhymePlaybackStatus = {
      isPlaying: this.isPlayingState,
      isPaused: this.isPausedState,
      currentTime: this.currentTimeState,
      duration: this.durationState,
      progress,
      currentLineIndex: lineIdx,
      didJustFinish: false,
      rhymeId: this.activeRhyme?.id,
      ...override,
    };

    this.listeners.forEach((fn) => {
      try {
        fn(status);
      } catch {}
    });
  }

  /**
   * Resolves an ordered list of candidate audio URLs for a rhyme:
   * 1. Rhyme's custom audioUrl (mapped to media base if relative /media/)
   * 2. Configured media base URL (${getMediaBaseUrl()}/rhymes/audio/<id>.mp3)
   *    (Points directly to CloudFront/S3 CDN when EXPO_PUBLIC_MEDIA_URL is set)
   * 3. Direct Django API origin fallback if media base points to an external CDN
   */
  public getCandidateUrls(rhyme: RhymeItem): string[] {
    const urls: string[] = [];
    const mediaBase = typeof getMediaBaseUrl === 'function' ? getMediaBaseUrl() : `${API_BASE_URL.replace(/\/api\/?$/, '')}/media`;
    const apiBase = safeGetApiBaseUrl();
    const directOriginMedia = `${apiBase.replace(/\/api\/?$/, '')}/media`;

    if (rhyme.audioUrl) {
      if (rhyme.audioUrl.startsWith('http://') || rhyme.audioUrl.startsWith('https://')) {
        urls.push(rhyme.audioUrl);
      } else if (rhyme.audioUrl.startsWith('/media/')) {
        urls.push(`${mediaBase}${rhyme.audioUrl.replace(/^\/media/, '')}`);
        if (directOriginMedia !== mediaBase) {
          urls.push(`${directOriginMedia}${rhyme.audioUrl.replace(/^\/media/, '')}`);
        }
      } else if (rhyme.audioUrl.startsWith('/')) {
        urls.push(`${apiBase.replace(/\/api\/?$/, '')}${rhyme.audioUrl}`);
      }
    }

    // 1. Primary route via configured media base (CDN or backend)
    const primaryAudio = `${mediaBase}/rhymes/audio/${rhyme.id}.mp3`;
    if (!urls.includes(primaryAudio)) {
      urls.push(primaryAudio);
    }

    // 2. Direct backend media origin fallback if mediaBase was overridden to a CDN
    if (directOriginMedia !== mediaBase) {
      const fallbackBackend = `${directOriginMedia}/rhymes/audio/${rhyme.id}.mp3`;
      if (!urls.includes(fallbackBackend)) {
        urls.push(fallbackBackend);
      }
    }

    return urls;
  }

  /**
   * Plays the audio track for a nursery rhyme. Resolves true once audio has started.
   * Prefer play() when the caller needs to know *why* playback did not start.
   */
  public async playRhyme(rhyme: RhymeItem): Promise<boolean> {
    return (await this.play(rhyme)) === 'started';
  }

  /**
   * Plays a rhyme and reports the outcome:
   * - 'started'       audio is playing
   * - 'superseded'    a newer play/stop request replaced this one (not an error; show nothing)
   * - 'unavailable'   the server answered but has no track (404/403/410): genuinely not available
   * - 'network-error' offline, timed out, server error, or the player failed to load the stream
   */
  public async play(rhyme: RhymeItem): Promise<RhymePlayOutcome> {
    this.stop();
    const requestId = ++this.playRequestId;
    this.activeRhyme = rhyme;

    const candidateUrls = this.getCandidateUrls(rhyme);
    if (candidateUrls.length === 0) {
      return 'unavailable';
    }
    // Any transport-level failure means "try again later", not "this song doesn't exist".
    let sawNetworkError = false;

    // Ensure native audio mode supports playback in silent/vibrate mode
    if (setAudioModeAsyncFn && Platform.OS !== 'web') {
      try {
        await setAudioModeAsyncFn({
          playsInSilentMode: true,
          allowsRecording: false,
        });
      } catch {}
    }

    if (this.playRequestId !== requestId) return 'superseded';

    // 1. Web Playback via HTMLAudioElement
    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof (window as any).Audio !== 'undefined') {
      for (const url of candidateUrls) {
        if (this.playRequestId !== requestId) return 'superseded';
        try {
          const audio = new (window as any).Audio(url);
          this.currentWebAudio = audio;
          audio.volume = 1.0;

          audio.onloadedmetadata = () => {
            if (this.currentWebAudio === audio) {
              this.durationState = audio.duration || 0;
              this.emitStatus();
            }
          };

          audio.ontimeupdate = () => {
            if (this.currentWebAudio === audio) {
              this.currentTimeState = audio.currentTime || 0;
              if (audio.duration && !this.durationState) {
                this.durationState = audio.duration;
              }
              this.emitStatus();
            }
          };

          audio.onended = () => {
            if (this.currentWebAudio === audio) {
              this.isPlayingState = false;
              this.isPausedState = false;
              this.emitStatus({ didJustFinish: true, isPlaying: false });
              this.stop();
            }
          };

          audio.onerror = () => {
            // Handled by loop or fallback
          };

          await audio.play();
          if (this.playRequestId !== requestId) {
            try { audio.pause(); } catch {}
            return 'superseded';
          }
          this.isPlayingState = true;
          this.isPausedState = false;
          this.emitStatus();
          return 'started';
        } catch {
          if (this.playRequestId !== requestId) return 'superseded';
          sawNetworkError = true;
          if (this.currentWebAudio) {
            try { this.currentWebAudio.pause(); } catch {}
            this.currentWebAudio = null;
          }
          continue;
        }
      }
      return sawNetworkError ? 'network-error' : 'unavailable';
    }

    // 2. Native Playback via expo-audio
    if (createAudioPlayerFn) {
      // Check local mobile storage cache first for instant offline playback
      const cachePath = getRhymeCachePath(rhyme.id);
      if (cachePath && typeof ExpoFileSystem?.getInfoAsync === 'function') {
        try {
          const info = await ExpoFileSystem.getInfoAsync(cachePath);
          if (info?.exists && (info.size ?? 0) > 1000) {
            const cachedPlayer = createAudioPlayerFn({ uri: cachePath });
            if (cachedPlayer) {
              this.currentNativePlayer = cachedPlayer;
              try { cachedPlayer.volume = 1.0; } catch {}
              if (typeof cachedPlayer.addListener === 'function') {
                this.currentNativeSubscription = cachedPlayer.addListener('playbackStatusUpdate', (status: any) => {
                  if (this.currentNativePlayer !== cachedPlayer) return;
                  if (status?.duration) this.durationState = status.duration;
                  if (status?.currentTime !== undefined) this.currentTimeState = status.currentTime;
                  if (status?.didJustFinish) {
                    this.isPlayingState = false;
                    this.isPausedState = false;
                    this.emitStatus({ didJustFinish: true, isPlaying: false });
                    this.stop();
                    return;
                  }
                  this.emitStatus();
                });
              }
              cachedPlayer.play();
              if (this.playRequestId !== requestId) {
                try { cachedPlayer.pause(); } catch {}
                return 'superseded';
              }
              this.isPlayingState = true;
              this.isPausedState = false;
              this.emitStatus();
              return 'started';
            }
          }
        } catch {}
      }

      for (const url of candidateUrls) {
        if (this.playRequestId !== requestId) return 'superseded';

        // Remote URL availability pre-check (detect 404/offline fast before loading on native)
        if (url.startsWith('http://') || url.startsWith('https://')) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);
            const probe = await fetch(url, { method: 'HEAD', signal: controller.signal });
            clearTimeout(timeoutId);
            if (!probe.ok && probe.status !== 405) {
              // 404 (missing) or 5xx (backend trouble): skip to next candidate URL (e.g. CDN fallback)
              if (probe.status >= 500) sawNetworkError = true;
              continue;
            }
          } catch {
            // Network failure or timeout: try next candidate URL
            sawNetworkError = true;
            continue;
          }
        }

        if (this.playRequestId !== requestId) return 'superseded';

        try {
          const player = createAudioPlayerFn({ uri: url });
          if (!player) {
            sawNetworkError = true;
            continue;
          }

          this.currentNativePlayer = player;
          try { player.volume = 1.0; } catch {}

          if (typeof player.addListener === 'function') {
            this.currentNativeSubscription = player.addListener('playbackStatusUpdate', (status: any) => {
              if (this.currentNativePlayer !== player) return;
              if (status?.duration) {
                // expo-audio reports duration in seconds
                this.durationState = status.duration;
              }
              if (status?.currentTime !== undefined) {
                // expo-audio reports currentTime in seconds
                this.currentTimeState = status.currentTime;
              }
              if (status?.didJustFinish) {
                this.isPlayingState = false;
                this.isPausedState = false;
                this.emitStatus({ didJustFinish: true, isPlaying: false });
                this.stop();
                return;
              }
              this.emitStatus();
            });
          }

          player.play();
          if (this.playRequestId !== requestId) {
            try { player.pause(); } catch {}
            return 'superseded';
          }
          this.isPlayingState = true;
          this.isPausedState = false;
          this.emitStatus();
          // Cache track locally in background so future plays are instant & offline
          if (cachePath && typeof ExpoFileSystem?.downloadAsync === 'function' && (url.startsWith('http://') || url.startsWith('https://'))) {
            const dir = cachePath.slice(0, cachePath.lastIndexOf('/') + 1);
            ExpoFileSystem.makeDirectoryAsync(dir, { intermediates: true })
              .catch(() => {})
              .then(() => ExpoFileSystem.downloadAsync(url, cachePath))
              .catch(() => {});
          }
          return 'started';
        } catch {
          if (this.playRequestId !== requestId) return 'superseded';
          sawNetworkError = true;
          if (this.currentNativePlayer) {
            try { this.currentNativePlayer.pause(); } catch {}
            this.currentNativePlayer = null;
          }
          continue;
        }
      }
    }

    return sawNetworkError ? 'network-error' : 'unavailable';
  }

  public pause(): void {
    if (this.currentWebAudio) {
      try {
        this.currentWebAudio.pause();
      } catch {}
    }
    if (this.currentNativePlayer) {
      try {
        this.currentNativePlayer.pause();
      } catch {}
    }
    this.isPlayingState = false;
    this.isPausedState = true;
    this.emitStatus();
  }

  public resume(): void {
    if (this.currentWebAudio) {
      try {
        this.currentWebAudio.play();
        this.isPlayingState = true;
        this.isPausedState = false;
        this.emitStatus();
        return;
      } catch {}
    }
    if (this.currentNativePlayer) {
      try {
        this.currentNativePlayer.play();
        this.isPlayingState = true;
        this.isPausedState = false;
        this.emitStatus();
        return;
      } catch {}
    }
    if (this.activeRhyme) {
      this.playRhyme(this.activeRhyme);
    }
  }

  public seek(seconds: number): void {
    const target = Math.max(0, seconds);
    this.currentTimeState = target;

    if (this.currentWebAudio) {
      try {
        this.currentWebAudio.currentTime = target;
      } catch {}
    }

    if (this.currentNativePlayer) {
      try {
        if (typeof this.currentNativePlayer.seekTo === 'function') {
          // expo-audio seekTo takes seconds
          this.currentNativePlayer.seekTo(target);
        }
      } catch {}
    }

    this.emitStatus();
  }

  public stop(): void {
    this.playRequestId++;
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    if (this.currentWebAudio) {
      try {
        this.currentWebAudio.pause();
        this.currentWebAudio.currentTime = 0;
        this.currentWebAudio.src = '';
      } catch {}
      this.currentWebAudio = null;
    }

    if (this.currentNativeSubscription) {
      try {
        if (typeof this.currentNativeSubscription.remove === 'function') {
          this.currentNativeSubscription.remove();
        }
      } catch {}
      this.currentNativeSubscription = null;
    }

    if (this.currentNativePlayer) {
      try {
        if (typeof this.currentNativePlayer.pause === 'function') {
          this.currentNativePlayer.pause();
        }
        if (typeof this.currentNativePlayer.remove === 'function') {
          this.currentNativePlayer.remove();
        }
      } catch {}
      this.currentNativePlayer = null;
    }

    this.isPlayingState = false;
    this.isPausedState = false;
    this.currentTimeState = 0;
    this.durationState = 0;
    this.emitStatus();
  }

  public isPlaying(): boolean {
    return this.isPlayingState;
  }

  public isPaused(): boolean {
    return this.isPausedState;
  }

  public getActiveRhyme(): RhymeItem | null {
    return this.activeRhyme;
  }
}

export const rhymeAudioService = new RhymeAudioService();
