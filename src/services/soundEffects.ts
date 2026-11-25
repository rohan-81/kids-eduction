import { Platform } from 'react-native';
import { safeGetApiBaseUrl } from './apiConfig';

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

let ExpoAvAudio: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ExpoAv = require('expo-av');
  ExpoAvAudio = ExpoAv?.Audio || null;
} catch {
  // Native module not linked or not supported
}

const ANIMAL_AUDIO_MAP: Record<string, any> = {
  lion: require('../../assets/audio/animals/lion.mp3'),
  tiger: require('../../assets/audio/animals/tiger.wav'),
  cat: require('../../assets/audio/animals/cat.mp3'),
  dog: require('../../assets/audio/animals/dog.mp3'),
  cow: require('../../assets/audio/animals/cow.mp3'),
  peacock: require('../../assets/audio/animals/peacock.mp3'),
  bird: require('../../assets/audio/animals/sparrow.mp3'),
  sparrow: require('../../assets/audio/animals/sparrow.mp3'),
  elephant: require('../../assets/audio/animals/elephant.mp3'),
  horse: require('../../assets/audio/animals/horse.mp3'),
  parrot: require('../../assets/audio/animals/parrot.wav'),
  rabbit: require('../../assets/audio/animals/rabbit.mp3'),
  monkey: require('../../assets/audio/animals/monkey.mp3'),
  duck: require('../../assets/audio/animals/duck.mp3'),
  camel: require('../../assets/audio/animals/camel.wav'),
  deer: require('../../assets/audio/animals/deer.mp3'),
  giraffe: require('../../assets/audio/animals/giraffe.mp3'),
  zebra: require('../../assets/audio/animals/zebra.mp3'),
  bear: require('../../assets/audio/animals/bear.mp3'),
  pigeon: require('../../assets/audio/animals/pigeon.mp3'),
  rooster: require('../../assets/audio/animals/rooster.mp3'),
  sheep: require('../../assets/audio/animals/sheep.mp3'),
  goat: require('../../assets/audio/animals/goat.mp3'),
  frog: require('../../assets/audio/animals/frog.mp3'),
  donkey: require('../../assets/audio/animals/donkey.wav'),
  crow: require('../../assets/audio/animals/crow.mp3'),
  owl: require('../../assets/audio/animals/owl.mp3'),
  bee: require('../../assets/audio/animals/bee.mp3'),
  buffalo: require('../../assets/audio/animals/buffalo.mp3'),
  fox: require('../../assets/audio/animals/fox.mp3'),
  wolf: require('../../assets/audio/animals/wolf.mp3'),
  leopard: require('../../assets/audio/animals/leopard.mp3'),
  cheetah: require('../../assets/audio/animals/cheetah.mp3'),
  panda: require('../../assets/audio/animals/panda.mp3'),
  kangaroo: require('../../assets/audio/animals/kangaroo.mp3'),
  hippo: require('../../assets/audio/animals/hippo.mp3'),
  rhino: require('../../assets/audio/animals/rhino.mp3'),
  squirrel: require('../../assets/audio/animals/squirrel.mp3'),
  ox: require('../../assets/audio/animals/ox.mp3'),
  turtle: require('../../assets/audio/animals/turtle.wav'),
  crocodile: require('../../assets/audio/animals/crocodile.mp3'),
  koel: require('../../assets/audio/animals/koel.mp3'),
  eagle: require('../../assets/audio/animals/eagle.mp3'),
  swan: require('../../assets/audio/animals/swan.mp3'),
  flamingo: require('../../assets/audio/animals/flamingo.mp3'),
  crane: require('../../assets/audio/animals/crane.mp3'),
  woodpecker: require('../../assets/audio/animals/woodpecker.mp3'),
  kingfisher: require('../../assets/audio/animals/kingfisher.mp3'),
  penguin: require('../../assets/audio/animals/penguin.mp3'),
  ostrich: require('../../assets/audio/animals/ostrich.mp3'),
  vulture: require('../../assets/audio/animals/vulture.mp3'),
};

const WEB_AUDIO_FILE_MAP: Record<string, string> = {
  lion: '/audio/animals/lion.mp3',
  tiger: '/audio/animals/tiger.wav',
  cat: '/audio/animals/cat.mp3',
  dog: '/audio/animals/dog.mp3',
  cow: '/audio/animals/cow.mp3',
  peacock: '/audio/animals/peacock.mp3',
  bird: '/audio/animals/sparrow.mp3',
  sparrow: '/audio/animals/sparrow.mp3',
  elephant: '/audio/animals/elephant.mp3',
  horse: '/audio/animals/horse.mp3',
  parrot: '/audio/animals/parrot.wav',
  rabbit: '/audio/animals/rabbit.mp3',
  monkey: '/audio/animals/monkey.mp3',
  duck: '/audio/animals/duck.mp3',
  camel: '/audio/animals/camel.wav',
  deer: '/audio/animals/deer.mp3',
  giraffe: '/audio/animals/giraffe.mp3',
  zebra: '/audio/animals/zebra.mp3',
  bear: '/audio/animals/bear.mp3',
  pigeon: '/audio/animals/pigeon.mp3',
  rooster: '/audio/animals/rooster.mp3',
  sheep: '/audio/animals/sheep.mp3',
  goat: '/audio/animals/goat.mp3',
  frog: '/audio/animals/frog.mp3',
  donkey: '/audio/animals/donkey.wav',
  crow: '/audio/animals/crow.mp3',
  owl: '/audio/animals/owl.mp3',
  bee: '/audio/animals/bee.mp3',
  buffalo: '/audio/animals/buffalo.mp3',
  fox: '/audio/animals/fox.mp3',
  wolf: '/audio/animals/wolf.mp3',
  leopard: '/audio/animals/leopard.mp3',
  cheetah: '/audio/animals/cheetah.mp3',
  panda: '/audio/animals/panda.mp3',
  kangaroo: '/audio/animals/kangaroo.mp3',
  hippo: '/audio/animals/hippo.mp3',
  rhino: '/audio/animals/rhino.mp3',
  squirrel: '/audio/animals/squirrel.mp3',
  ox: '/audio/animals/ox.mp3',
  turtle: '/audio/animals/turtle.wav',
  crocodile: '/audio/animals/crocodile.mp3',
  koel: '/audio/animals/koel.mp3',
  eagle: '/audio/animals/eagle.mp3',
  swan: '/audio/animals/swan.mp3',
  flamingo: '/audio/animals/flamingo.mp3',
  crane: '/audio/animals/crane.mp3',
  woodpecker: '/audio/animals/woodpecker.mp3',
  kingfisher: '/audio/animals/kingfisher.mp3',
  penguin: '/audio/animals/penguin.mp3',
  ostrich: '/audio/animals/ostrich.mp3',
  vulture: '/audio/animals/vulture.mp3',
};

// KidsZone Kid-Friendly Sound Effects & Authentic Animal Audio
class SoundEffectsService {
  private currentAnimalSound: any = null;
  private currentWebAudio: any = null;
  private animalStopTimeout: any = null;
  private animalFadeInterval: any = null;
  private audioCtx: any = null;
  private bgmInterval: any = null;
  private soundEnabled: boolean = true;
  private isBgmPlaying: boolean = false;
  private bgmMuted: boolean = false;
  private bgmStep: number = 0;

  // Master audio toggle
  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    if (!enabled) {
      this.stopAnimalSound();
      this.stopBgm();
    }
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  // Gentle pentatonic nursery rhyme melody frequencies (C4, D4, E4, G4, A4, G4, E4, C4)
  private melodyNotes: number[] = [
    261.63, 293.66, 329.63, 392.00, 440.00, 392.00, 329.63, 261.63,
    329.63, 392.00, 440.00, 523.25, 440.00, 392.00, 329.63, 261.63
  ];

  private getAudioContext(): any {
    if (!this.soundEnabled) return null;
    if (typeof window === 'undefined') return null;
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!this.audioCtx) {
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => { });
    }
    return this.audioCtx;
  }

  // 1. Play bubbly pop sound on button click / option selection
  public playBubblePop(): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const now = ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // 2. Play celebratory "Tadaaa! 🎉🌟" chime on completing a lesson or game
  public playTadaaa(): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const chords = [
        { freq: 523.25, time: 0.0, dur: 0.18 }, // C5
        { freq: 659.25, time: 0.12, dur: 0.18 }, // E5
        { freq: 783.99, time: 0.24, dur: 0.20 }, // G5
        { freq: 1046.50, time: 0.38, dur: 0.55 }, // C6
      ];

      const now = ctx.currentTime;
      chords.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.freq, now + note.time);

        gain.gain.setValueAtTime(0.001, now + note.time);
        gain.gain.linearRampToValueAtTime(0.28, now + note.time + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + note.time);
        osc.stop(now + note.time + note.dur);
      });
    } catch {
      // Ignore
    }
  }

  // 3. Play happy ding chime for correct quiz answers
  public playCorrectSound(): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.setValueAtTime(880.00, now + 0.08); // A5

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Ignore
    }
  }

  // 4. Play soft encouraging boing for wrong answers
  public playWrongSound(): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(200, now + 0.18);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.20);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.20);
    } catch {
      // Ignore
    }
  }

  public playBuzzer(): void {
    this.playWrongSound();
  }

  // 4b. Play ascending fanfare chime on Level Up or Class Selection
  public playLevelUp(): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
      const now = ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0.001, now + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.26);
      });
    } catch {
      // Ignore
    }
  }
  public startBgm(): void {
    if (this.isBgmPlaying || this.bgmMuted) return;
    this.isBgmPlaying = true;

    // Play next note every 450ms in a soft musical chime
    this.bgmInterval = setInterval(() => {
      if (this.bgmMuted || !this.isBgmPlaying) return;
      try {
        const ctx = this.getAudioContext();
        if (!ctx) return;

        const freq = this.melodyNotes[this.bgmStep % this.melodyNotes.length];
        this.bgmStep++;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Soft marimba-like bell tone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // Low volume so it is calming and never overpowers speech
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.025, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.40);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.42);
      } catch {
        // Ignore
      }
    }, 450);
  }

  public stopBgm(): void {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  public toggleBgm(): boolean {
    this.bgmMuted = !this.bgmMuted;
    if (this.bgmMuted) {
      this.stopBgm();
    } else {
      this.startBgm();
    }
    return !this.bgmMuted;
  }

  public isMuted(): boolean {
    return this.bgmMuted;
  }

  // Stop any currently playing animal / bird audio immediately
  public stopAnimalSound(): void {
    if (this.animalStopTimeout) {
      clearTimeout(this.animalStopTimeout);
      this.animalStopTimeout = null;
    }
    if (this.animalFadeInterval) {
      clearInterval(this.animalFadeInterval);
      this.animalFadeInterval = null;
    }
    if (this.currentWebAudio) {
      try {
        this.currentWebAudio.pause();
        this.currentWebAudio.currentTime = 0;
      } catch { }
      this.currentWebAudio = null;
    }
    if (this.currentAnimalSound) {
      try {
        if (typeof this.currentAnimalSound.pause === 'function') {
          this.currentAnimalSound.pause();
        }
        if (typeof this.currentAnimalSound.remove === 'function') {
          this.currentAnimalSound.remove();
        }
        if (typeof this.currentAnimalSound.stopAsync === 'function') {
          this.currentAnimalSound.stopAsync().catch(() => {});
        }
        if (typeof this.currentAnimalSound.unloadAsync === 'function') {
          this.currentAnimalSound.unloadAsync().catch(() => {});
        }
      } catch { }
      this.currentAnimalSound = null;
    }
  }

  public stopAll(): void {
    this.stopAnimalSound();
    this.stopBgm();
  }

  // 5. Authentic Real Animal & Bird Audio Playback (Concise kid-friendly snippet ~2.8s)
  public async playAnimalSound(
    animalKey: string,
    maxDurationMs: number = 2800,
    customAudioUrl?: string
  ): Promise<boolean> {
    try {
      // Always stop any previously playing audio immediately so sounds never overlap or run in background
      this.stopAnimalSound();

      if (!this.soundEnabled) return false;

      const key = (animalKey || '').toLowerCase();
      let matchedKey: string | null = null;
      for (const k of Object.keys(ANIMAL_AUDIO_MAP)) {
        if (key.includes(k)) {
          matchedKey = k;
          break;
        }
      }
      if (!matchedKey) {
        if (key.includes('સિંહ') || key.includes('sher') || key.includes('lion')) matchedKey = 'lion';
        else if (key.includes('વાઘ') || key.includes('bagh') || key.includes('tiger')) matchedKey = 'tiger';
        else if (key.includes('ગાય') || key.includes('gay') || key.includes('cow')) matchedKey = 'cow';
        else if (key.includes('બિલાડી') || key.includes('billi') || key.includes('cat')) matchedKey = 'cat';
        else if (key.includes('કૂતરો') || key.includes('kutro') || key.includes('kutta') || key.includes('dog')) matchedKey = 'dog';
        else if (key.includes('મોર') || key.includes('mor') || key.includes('peacock')) matchedKey = 'peacock';
        else if (key.includes('હાથી') || key.includes('hathi') || key.includes('elephant')) matchedKey = 'elephant';
        else if (key.includes('ઘોડો') || key.includes('ghoda') || key.includes('horse')) matchedKey = 'horse';
        else if (key.includes('પોપટ') || key.includes('tota') || key.includes('parrot')) matchedKey = 'parrot';
        else if (key.includes('ચકલી') || key.includes('પક્ષી') || key.includes('chidiya') || key.includes('sparrow') || key.includes('bird')) matchedKey = 'sparrow';
        else if (key.includes('સસલું') || key.includes('khargosh') || key.includes('rabbit') || key.includes('bunny')) matchedKey = 'rabbit';
        else if (key.includes('વાંદરો') || key.includes('bandar') || key.includes('monkey')) matchedKey = 'monkey';
        else if (key.includes('બતક') || key.includes('battakh') || key.includes('duck')) matchedKey = 'duck';
        else if (key.includes('ઊંટ') || key.includes('unt') || key.includes('camel')) matchedKey = 'camel';
        else if (key.includes('હરણ') || key.includes('hiran') || key.includes('deer')) matchedKey = 'deer';
        else if (key.includes('જિરાફ') || key.includes('giraffe')) matchedKey = 'giraffe';
        else if (key.includes('ઝીબ્રા') || key.includes('zebra')) matchedKey = 'zebra';
        else if (key.includes('રીંછ') || key.includes('bhalu') || key.includes('bear')) matchedKey = 'bear';
        else if (key.includes('કબૂતર') || key.includes('kabutar') || key.includes('pigeon') || key.includes('dove')) matchedKey = 'pigeon';
        else if (key.includes('કૂકડો') || key.includes('murga') || key.includes('rooster') || key.includes('cock')) matchedKey = 'rooster';
        else if (key.includes('ઘેટું') || key.includes('bhed') || key.includes('sheep')) matchedKey = 'sheep';
        else if (key.includes('બકરી') || key.includes('bakri') || key.includes('goat')) matchedKey = 'goat';
        else if (key.includes('દેડકો') || key.includes('mendhak') || key.includes('frog')) matchedKey = 'frog';
        else if (key.includes('ગધેડો') || key.includes('gadha') || key.includes('donkey')) matchedKey = 'donkey';
        else if (key.includes('કાગડો') || key.includes('kauwa') || key.includes('crow')) matchedKey = 'crow';
        else if (key.includes('ઘુવડ') || key.includes('ullu') || key.includes('owl')) matchedKey = 'owl';
        else if (key.includes('મધમાખી') || key.includes('madhumakkhi') || key.includes('bee')) matchedKey = 'bee';
        else if (key.includes('ભેંસ') || key.includes('bhains') || key.includes('buffalo')) matchedKey = 'buffalo';
        else if (key.includes('શિયાળ') || key.includes('lomdi') || key.includes('fox')) matchedKey = 'fox';
        else if (key.includes('વરુ') || key.includes('bhediya') || key.includes('wolf')) matchedKey = 'wolf';
        else if (key.includes('દીપડો') || key.includes('tendua') || key.includes('leopard')) matchedKey = 'leopard';
        else if (key.includes('ચિત્તો') || key.includes('chita') || key.includes('cheetah')) matchedKey = 'cheetah';
        else if (key.includes('પાંડા') || key.includes('panda')) matchedKey = 'panda';
        else if (key.includes('કાંગારૂ') || key.includes('kangaroo')) matchedKey = 'kangaroo';
        else if (key.includes('હિપ્પો') || key.includes('dariyai') || key.includes('hippo')) matchedKey = 'hippo';
        else if (key.includes('ગેંડો') || key.includes('gainda') || key.includes('rhino')) matchedKey = 'rhino';
        else if (key.includes('ખિસકોલી') || key.includes('gilahri') || key.includes('squirrel')) matchedKey = 'squirrel';
        else if (key.includes('બળદ') || key.includes('bail') || key.includes('ox')) matchedKey = 'ox';
        else if (key.includes('કાચબો') || key.includes('kachhua') || key.includes('turtle') || key.includes('tortoise')) matchedKey = 'turtle';
        else if (key.includes('મગર') || key.includes('magarmacch') || key.includes('crocodile')) matchedKey = 'crocodile';
        else if (key.includes('કોયલ') || key.includes('cuckoo') || key.includes('koel')) matchedKey = 'koel';
        else if (key.includes('ગરુડ') || key.includes('garud') || key.includes('eagle')) matchedKey = 'eagle';
        else if (key.includes('હંસ') || key.includes('swan')) matchedKey = 'swan';
        else if (key.includes('સુરખાબ') || key.includes('flamingo')) matchedKey = 'flamingo';
        else if (key.includes('બગલો') || key.includes('bagula') || key.includes('crane')) matchedKey = 'crane';
        else if (key.includes('લક્કડખોદ') || key.includes('woodpecker')) matchedKey = 'woodpecker';
        else if (key.includes('કલકલિયો') || key.includes('kingfisher')) matchedKey = 'kingfisher';
        else if (key.includes('પેંગ્વિન') || key.includes('penguin')) matchedKey = 'penguin';
        else if (key.includes('શાહમૃગ') || key.includes('shuturmurgh') || key.includes('ostrich')) matchedKey = 'ostrich';
        else if (key.includes('ગીધ') || key.includes('giddh') || key.includes('vulture')) matchedKey = 'vulture';
      }

      if (!matchedKey) return false;

      const bundledSource = ANIMAL_AUDIO_MAP[matchedKey];
      const apiBase = safeGetApiBaseUrl();
      const serverOrigin = apiBase.replace(/\/api\/?$/, '');

      let streamUrl: string;
      if (customAudioUrl && (customAudioUrl.startsWith('http://') || customAudioUrl.startsWith('https://'))) {
        streamUrl = customAudioUrl;
      } else if (customAudioUrl && customAudioUrl.startsWith('/')) {
        streamUrl = `${serverOrigin}${customAudioUrl}`;
      } else {
        streamUrl = `${apiBase}/lessons/animal-audio/${matchedKey}/`;
      }

      // Ensure native audio mode supports playback in silent/vibrate mode
      if (setAudioModeAsyncFn && Platform.OS !== 'web') {
        try {
          await setAudioModeAsyncFn({
            playsInSilentMode: true,
            allowsRecording: false,
          });
        } catch {}
      }

      // Web Audio playback
      if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof (window as any).Audio !== 'undefined') {
        const webFallbackFile = WEB_AUDIO_FILE_MAP[matchedKey] || `/audio/animals/${matchedKey}.mp3`;
        const candidateUrls = [
          typeof bundledSource === 'string' ? bundledSource : null,
          bundledSource && (bundledSource as any).default,
          bundledSource && (bundledSource as any).uri,
          webFallbackFile,
          streamUrl,
        ].filter(Boolean) as string[];

        for (const candidate of candidateUrls) {
          try {
            const audio = new (window as any).Audio(candidate);
            this.currentWebAudio = audio;
            audio.volume = 1.0;
            const playPromise = audio.play();
            if (playPromise !== undefined) {
              await playPromise;
            }

            // Stop with gentle fade-out after maxDurationMs
            const fadeDuration = 350;
            const playDuration = Math.max(800, maxDurationMs - fadeDuration);

            this.animalStopTimeout = setTimeout(() => {
              if (!this.currentWebAudio) return;
              let step = 0;
              const steps = 7;
              this.animalFadeInterval = setInterval(() => {
                step++;
                if (this.currentWebAudio) {
                  const vol = Math.max(0, 1.0 - step / steps);
                  try { this.currentWebAudio.volume = vol; } catch {}
                  if (step >= steps) {
                    this.stopAnimalSound();
                  }
                } else {
                  if (this.animalFadeInterval) {
                    clearInterval(this.animalFadeInterval);
                    this.animalFadeInterval = null;
                  }
                }
              }, fadeDuration / steps);
            }, playDuration);

            return true;
          } catch {
            // Try next candidate URL
            continue;
          }
        }
        return false;
      }

      // Native Audio playback via expo-audio (Priority 1: Pre-bundled local asset)
      if (createAudioPlayerFn) {
        // Priority 1: Instant bundled offline asset (zero network latency, offline-ready)
        if (bundledSource) {
          try {
            const player = createAudioPlayerFn(bundledSource);
            if (player) {
              this.currentAnimalSound = player;
              try { player.volume = 1.0; } catch {}
              player.play();

              this.animalStopTimeout = setTimeout(() => {
                if (this.currentAnimalSound === player) {
                  this.stopAnimalSound();
                }
              }, maxDurationMs);
              return true;
            }
          } catch (err) {
            console.warn('[soundEffects] Bundled native animal sound threw, trying remote:', err);
          }
        }

        // Priority 2: Remote stream fallback
        if (streamUrl) {
          try {
            const remoteSource = { uri: streamUrl };
            const player = createAudioPlayerFn(remoteSource);
            if (player) {
              this.currentAnimalSound = player;
              try { player.volume = 1.0; } catch {}
              player.play();

              this.animalStopTimeout = setTimeout(() => {
                if (this.currentAnimalSound === player) {
                  this.stopAnimalSound();
                }
              }, maxDurationMs);
              return true;
            }
          } catch (err) {
            console.warn('[soundEffects] Remote native animal audio error:', err);
          }
        }
      }

      // Priority 3: Fallback via expo-av Sound (for Expo Go & broad device compatibility)
      if (!this.currentAnimalSound && ExpoAvAudio?.Sound) {
        if (bundledSource) {
          try {
            const soundInstance = new ExpoAvAudio.Sound();
            this.currentAnimalSound = soundInstance;
            await soundInstance.loadAsync(bundledSource, { shouldPlay: true, volume: 1.0 });

            this.animalStopTimeout = setTimeout(() => {
              if (this.currentAnimalSound === soundInstance) {
                this.stopAnimalSound();
              }
            }, maxDurationMs);
            return true;
          } catch (avErr) {
            console.warn('[soundEffects] expo-av bundled animal sound failed:', avErr);
          }
        }

        if (streamUrl) {
          try {
            const soundInstance = new ExpoAvAudio.Sound();
            this.currentAnimalSound = soundInstance;
            await soundInstance.loadAsync({ uri: streamUrl }, { shouldPlay: true, volume: 1.0 });

            this.animalStopTimeout = setTimeout(() => {
              if (this.currentAnimalSound === soundInstance) {
                this.stopAnimalSound();
              }
            }, maxDurationMs);
            return true;
          } catch (avErr) {
            console.warn('[soundEffects] expo-av remote animal sound failed:', avErr);
          }
        }
      }
    } catch (e) {
      console.warn('playAnimalSound error:', e);
    }
    return false;
  }

  // 12. Play Wheel Spin Tick Sound
  public playWheelSpinTick(): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800 + Math.random() * 200, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.035);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.035);
    } catch {
      // Ignore
    }
  }

  // 13. Play Wheel Jackpot Celebration Sound
  public playWheelJackpot(): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      const now = ctx.currentTime;
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);

        gain.gain.setValueAtTime(0.01, now + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.28, now + i * 0.12 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.35);
      });
    } catch {
      // Ignore
    }
  }
}

export const soundEffects = new SoundEffectsService();
