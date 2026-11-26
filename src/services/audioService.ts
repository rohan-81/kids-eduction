import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppLanguage } from '../types';
import { safeGetApiBaseUrl } from './apiConfig';
import { PROMPT_AUDIO_MAP, WEB_PROMPT_AUDIO_MAP } from './promptAudioMap';
import { GUJARATI_NUMBERS, HINDI_NUMBERS } from '../utils/languageData';

export type VoiceGender = 'male' | 'female' | 'child';

const VOICE_GENDER_KEY = '@kidszone_voice_gender';
const VOICE_RATE_KEY = '@kidszone_voice_rate';
const VOICE_PITCH_KEY = '@kidszone_voice_pitch';
let currentVoiceGender: VoiceGender = 'female';
let currentVoiceRate: number = 1.18; // Default to energetic, brisk speed
let currentVoicePitch: number = 1.20; // Default to lively, elevated cheerful pitch

// Pre-initialize voice gender, rate, and pitch from storage (default female)
AsyncStorage.getItem(VOICE_GENDER_KEY)
  .then((val) => {
    if (val === 'male' || val === 'female' || val === 'child') {
      currentVoiceGender = val;
    }
  })
  .catch(() => {});

AsyncStorage.getItem(VOICE_RATE_KEY)
  .then((val) => {
    if (val) {
      const parsed = parseFloat(val);
      if (!isNaN(parsed) && parsed >= 0.8 && parsed <= 1.5) {
        currentVoiceRate = parsed;
      }
    }
  })
  .catch(() => {});

AsyncStorage.getItem(VOICE_PITCH_KEY)
  .then((val) => {
    if (val) {
      const parsed = parseFloat(val);
      if (!isNaN(parsed) && parsed >= 0.8 && parsed <= 1.6) {
        currentVoicePitch = parsed;
      }
    }
  })
  .catch(() => {});

let activeUtterance: any = null;
let activeWebAudio: any = null;
let activeWebAudioList: any[] = [];
let globalSoundEnabled: boolean = true;
let activeNativeAudio: any = null;
let cachedWebVoices: SpeechSynthesisVoice[] = [];
const voiceCache = new Map<string, any>();
let cachedNativeVoices: Speech.Voice[] = [];
let isNativeVoicesLoaded = false;
let nativeVoicesInFlightPromise: Promise<Speech.Voice[]> | null = null;
let currentSpeechRequestId = 0;

export interface WordBoundaryEvent {
  charIndex: number;
  charLength?: number;
  word?: string;
  wordIndex?: number;
  progress?: number;
  sessionId?: number;
}

export type WordBoundaryListener = (data: WordBoundaryEvent) => void;
export type SpeechEndListener = () => void;
export type SpeechStartListener = () => void;

const wordBoundaryListeners = new Set<WordBoundaryListener>();
const speechEndListeners = new Set<SpeechEndListener>();
const speechStartListeners = new Set<SpeechStartListener>();

export function emitWordBoundary(data: WordBoundaryEvent): void {
  wordBoundaryListeners.forEach((fn) => {
    try {
      fn(data);
    } catch {}
  });
}

export function emitSpeechEnd(): void {
  speechEndListeners.forEach((fn) => {
    try {
      fn();
    } catch {}
  });
}

export function emitSpeechStart(): void {
  speechStartListeners.forEach((fn) => {
    try {
      fn();
    } catch {}
  });
}

export function splitIntoSpeechChunks(text: string, maxLen = 85): string[] {
  if (!text || text.length <= maxLen) return text ? [text] : [];
  const sentenceRegex = /[^.!?\n।]+[.!?\n।]*/g;
  const sentences = text.match(sentenceRegex) || [text];
  const chunks: string[] = [];
  let current = '';

  for (const s of sentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;
    if ((current + ' ' + trimmed).trim().length <= maxLen) {
      current = (current + ' ' + trimmed).trim();
    } else {
      if (current) chunks.push(current);
      if (trimmed.length <= maxLen) {
        current = trimmed;
      } else {
        const parts = trimmed.split(/,\s*/);
        for (const p of parts) {
          if ((current + ' ' + p).trim().length <= maxLen) {
            current = (current + ' ' + p).trim();
          } else {
            if (current) chunks.push(current);
            current = p;
          }
        }
      }
    }
  }
  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [text];
}

let createAudioPlayerFn: ((source: any, options?: any) => any) | null = null;
let setAudioModeAsyncFn: ((mode: any) => Promise<any>) | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ExpoAudio = require('expo-audio');
  createAudioPlayerFn = ExpoAudio?.createAudioPlayer || ExpoAudio?.default?.createAudioPlayer || null;
  setAudioModeAsyncFn = ExpoAudio?.setAudioModeAsync || ExpoAudio?.default?.setAudioModeAsync || null;
} catch {
  // Native module not linked or web environment
}

let ExpoAvAudio: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ExpoAv = require('expo-av');
  ExpoAvAudio = ExpoAv?.Audio || null;
} catch {
  // Native module not linked or web environment
}

let fileSystemDownloadAsync: ((uri: string, fileUri: string, options?: any) => Promise<any>) | null = null;
let fileSystemCacheDir: string | null = null;
let fileSystemGetInfoAsync: ((uri: string) => Promise<any>) | null = null;
try {
  // SDK 54+: the classic downloadAsync/getInfoAsync/cacheDirectory API lives in "expo-file-system/legacy";
  // the same names on the root export are stubs that throw at runtime.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const FileSystem = require('expo-file-system/legacy');
  fileSystemDownloadAsync = FileSystem?.downloadAsync || FileSystem?.default?.downloadAsync || null;
  fileSystemCacheDir = FileSystem?.cacheDirectory || FileSystem?.default?.cacheDirectory || null;
  fileSystemGetInfoAsync = FileSystem?.getInfoAsync || FileSystem?.default?.getInfoAsync || null;
} catch {
  // Native module not linked or web environment
}

let isAudioModeConfigured = false;
export async function ensureNativeAudioMode(): Promise<void> {
  if (isAudioModeConfigured) return;
  if (setAudioModeAsyncFn) {
    try {
      await setAudioModeAsyncFn({
        playsInSilentMode: true,
        interruptionMode: 'duckOthers',
      });
      isAudioModeConfigured = true;
    } catch {}
  }
  if (ExpoAvAudio?.setAudioModeAsync) {
    try {
      await ExpoAvAudio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      isAudioModeConfigured = true;
    } catch {}
  }
}

if (Platform.OS !== 'web') {
  ensureNativeAudioMode().catch(() => {});
}

// Initialize Web Speech Voices listener with active polling for reliable population
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const loadWebVoices = () => {
    try {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        cachedWebVoices = v;
        voiceCache.clear();
      }
    } catch {}
  };
  loadWebVoices();
  window.speechSynthesis.onvoiceschanged = loadWebVoices;
  // Multiple timeouts to catch asynchronous voice loading across different Chromium and WebKit versions
  setTimeout(loadWebVoices, 100);
  setTimeout(loadWebVoices, 400);
  setTimeout(loadWebVoices, 1200);

  // Eager pre-warm on first user interaction anywhere in the document to eliminate speech delays
  if (typeof document !== 'undefined') {
    const eagerUnlock = () => {
      try {
        if (cachedWebVoices.length === 0) {
          cachedWebVoices = window.speechSynthesis.getVoices();
        }
        const silentUtterance = new SpeechSynthesisUtterance(' ');
        silentUtterance.volume = 0;
        window.speechSynthesis.speak(silentUtterance);
      } catch {}
      document.removeEventListener('pointerdown', eagerUnlock, true);
      document.removeEventListener('touchstart', eagerUnlock, true);
      document.removeEventListener('click', eagerUnlock, true);
    };
    document.addEventListener('pointerdown', eagerUnlock, { capture: true, once: true, passive: true });
    document.addEventListener('touchstart', eagerUnlock, { capture: true, once: true, passive: true });
    document.addEventListener('click', eagerUnlock, { capture: true, once: true, passive: true });
  }
}

// Gujarati digit words for authentic pronunciation instead of reading digits in English
export const GUJARATI_DIGIT_WORDS: Record<string, string> = {
  '૦': 'શૂન્ય',
  '૧': 'એક',
  '૨': 'બે',
  '૩': 'ત્રણ',
  '૪': 'ચાર',
  '૫': 'પાંચ',
  '૬': 'છ',
  '૭': 'સાત',
  '૮': 'આઠ',
  '૯': 'નવ',
  '૧૦': 'દસ',
  '0': 'શૂન્ય',
  '1': 'એક',
  '2': 'બે',
  '3': 'ત્રણ',
  '4': 'ચાર',
  '5': 'પાંચ',
  '6': 'છ',
  '7': 'સાત',
  '8': 'આઠ',
  '9': 'નવ',
  '10': 'દસ',
};

// Hindi digit words for authentic pronunciation instead of reading digits in English
export const HINDI_DIGIT_WORDS: Record<string, string> = {
  '०': 'शून्य',
  '१': 'एक',
  '२': 'दो',
  '३': 'तीन',
  '४': 'चार',
  '५': 'पांच',
  '६': 'छह',
  '७': 'सात',
  '८': 'आठ',
  '९': 'नौ',
  '१०': 'दस',
  '0': 'शून्य',
  '1': 'एक',
  '2': 'दो',
  '3': 'तीन',
  '4': 'चार',
  '5': 'पांच',
  '6': 'छह',
  '7': 'सात',
  '8': 'आठ',
  '9': 'नौ',
  '10': 'दस',
};

/**
 * Automatically detects whether text contains Gujarati or Devanagari script.
 * Prevents callers from sending Gujarati text to an English or Hindi TTS engine,
 * or sending Hindi text to an English engine.
 */
export function detectContentLanguage(text: string, preferredLang: AppLanguage = 'en'): AppLanguage {
  if (!text) return preferredLang;

  // 1. If text contains the script of the user's preferred language, strictly honor user preference
  // (Prevents compound titles like "Apple • સફરજન • सेब" from incorrectly forcing 'gu' in Hindi/English mode)
  if (preferredLang === 'gu' && /[\u0A80-\u0AFF]/.test(text)) {
    return 'gu';
  }
  if (preferredLang === 'hi' && /[\u0900-\u097F]/.test(text)) {
    return 'hi';
  }
  if (preferredLang === 'en' && /[A-Za-z]/.test(text)) {
    return 'en';
  }

  // 2. Otherwise auto-detect the content script
  // Gujarati Unicode block: 0x0A80 to 0x0AFF
  if (/[\u0A80-\u0AFF]/.test(text)) {
    return 'gu';
  }
  // Devanagari Unicode block: 0x0900 to 0x097F
  if (/[\u0900-\u097F]/.test(text)) {
    return 'hi';
  }
  // Latin / English characters
  if (/[A-Za-z]/.test(text)) {
    return 'en';
  }
  return preferredLang;
}

/**
 * Normalizes speech text for kid-friendly pronunciation:
 * - Replaces multi-dot pauses ("...") with commas (", ") so TTS pauses naturally without clicks or saying "dot dot dot"
 * - Converts standalone digits to authentic language number words
 * - Strips phonetic slashes ("/t/" -> "t")
 * - Strips parenthetical English translations in Indian language texts (e.g. "(Tiger)" or "(Apple)")
 */
/**
 * Parses a Latin, Gujarati, or Devanagari integer token and returns its 0-100 spoken word in `lang`,
 * or null if outside 0-100 / not a plain integer.
 */
function numberTokenToWord(token: string, lang: 'gu' | 'hi'): string | null {
  const ascii = token
    .replace(/[૦-૯]/g, (d) => String(d.charCodeAt(0) - 0x0ae6))
    .replace(/[०-९]/g, (d) => String(d.charCodeAt(0) - 0x0966));
  if (!/^\d+$/.test(ascii)) return null;
  // Preserve leading-zero multi-digit codes such as "05" as-is
  if (ascii.length > 1 && ascii.startsWith('0')) return null;
  const n = parseInt(ascii, 10);
  if (Number.isNaN(n) || n < 0 || n > 100) return null;
  return lang === 'gu' ? GUJARATI_NUMBERS[n] ?? null : HINDI_NUMBERS[n] ?? null;
}

/**
 * Converts spaced math operators between numbers (+, -, ×, ÷, =) and 0-100 numbers
 * into natural spoken words while leaving hyphenated ranges (e.g. "૧-૨", "A-Z") intact.
 */
function normalizeMathAndNumbers(text: string, lang: AppLanguage): string {
  let out = text;
  const numPat = '(?:[0-9]+|[૦-૯]+|[०-९]+)';

  const ops =
    lang === 'gu'
      ? { plus: ' વત્તા ', minus: ' ઓછા ', times: ' ગુણ્યા ', div: ' ભાગ્યા ', eqWhat: ' બરાબર કેટલા', eq: ' બરાબર ' }
      : lang === 'hi'
      ? { plus: ' जमा ', minus: ' घटा ', times: ' गुणा ', div: ' भाग ', eqWhat: ' बराबर कितना', eq: ' बराबर ' }
      : { plus: ' plus ', minus: ' minus ', times: ' times ', div: ' divided by ', eqWhat: ' equals what', eq: ' equals ' };

  out = out.replace(new RegExp(`(${numPat})\\s*\\+\\s*(${numPat})`, 'g'), `$1${ops.plus}$2`);
  // Only treat spaced hyphen/en-dash or mathematical minus (−, U+2212) as subtraction, so "૧-૨" stays hyphenated
  out = out.replace(new RegExp(`(${numPat})(?:\\s+[-–]\\s+|\\s*−\\s*)(${numPat})`, 'g'), `$1${ops.minus}$2`);
  out = out.replace(new RegExp(`(${numPat})\\s*[×✕✖]\\s*(${numPat})`, 'g'), `$1${ops.times}$2`);
  out = out.replace(new RegExp(`(${numPat})\\s*(?:÷|\\s+/\\s+)\\s*(${numPat})`, 'g'), `$1${ops.div}$2`);
  out = out.replace(/=\s*\?/g, ops.eqWhat);
  out = out.replace(new RegExp(`(${numPat})\\s*=\\s*(${numPat})`, 'g'), `$1${ops.eq}$2`);

  if (lang === 'gu' || lang === 'hi') {
    out = out.replace(
      /(^|[\s,.:;!?("'“”‘’–—\[\-])([0-9]+|[૦-૯]+|[०-९]+)(?=$|[\s,.:;!?)("'“”‘’–—\]\-])/g,
      (full, prefix: string, numToken: string) => {
        const word = numberTokenToWord(numToken, lang);
        return word ? `${prefix}${word}` : full;
      }
    );
  }

  return out;
}

export function normalizeSpeechText(text: string, lang: AppLanguage): string {
  if (!text) return '';

  let clean = text.trim();

  // Strip all Unicode emojis and pictographs so TTS never reads out redundant emoji descriptions (without stripping digits)
  clean = clean.replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, '');

  // 1. Replace multi-dot pauses with clean natural commas for natural breath pauses
  clean = clean.replace(/\.{2,}/g, ', ');

  // 2. Strip phonetic slashes: "/t/" -> "t" (whole string, or a sound inside a sentence)
  clean = clean.replace(/^\/([^/]+)\/$/, '$1');
  clean = clean.replace(/(^|\s)\/([^/\s]{1,4})\/(?=\s|$|[.,!?])/g, '$1$2');

  // 2b. Strip list/markup symbols TTS engines would read aloud ("bullet", "asterisk", "hash"...).
  // Bullets and arrows become a short comma pause so list items stay separated.
  clean = clean.replace(/<\/?[a-z][^<>]*>/gi, ' '); // stray HTML tags such as <b>...</b>
  clean = clean.replace(/\s*[•·▪►▶→←⇒]\s*/g, ', ');
  clean = clean.replace(/[*#~|{}[\]✓✔✗✘_]/g, ' ');
  // Keep < and > only for numeric comparisons such as "5 > 3"; strip them everywhere else.
  clean = clean.replace(/[<>]/g, (m, offset: number, str: string) => {
    const before = str.slice(0, offset).trimEnd();
    const after = str.slice(offset + 1).trimStart();
    return /\d$/.test(before) && /^\d/.test(after) ? m : ' ';
  });

  // 3. Language-specific normalization
  if (lang === 'gu') {
    // Strip Latin/English parenthetical annotations e.g. "સિંહ (Lion)" -> "સિંહ"
    clean = clean.replace(/\s*\([A-Za-z\s-]+\)/g, '');

    // Convert English loanword "પેટર્ન" to phonetic open-vowel "પૅટર્ન" for natural native Gujarati TTS
    clean = clean.replace(/પેટર્ન/g, 'પૅટર્ન');

    // Phonetic tuning for "ગણપતિ": TTS engines swallow or clip the short final 'તિ' into "Ganpat/ગણપત";
    // substituting phonetic "ગણપતી" forces TTS to pronounce full, resonant "ગ-ણ-પ-તિ" (Ganapati)
    clean = clean.replace(/ગણપતિ/g, 'ગણપતી');

    // Phonetic tuning for "યજ્ઞ": In Gujarati, "જ્ઞ" is pronounced as "ગ્ન" (Yagna / ગ્ન);
    // prevents Google TTS / Web Speech from pronouncing harsh Sanskrit "Yajnya" or Hindi "Yagya"
    clean = clean.replace(/યજ્ઞ/g, 'યગ્ન');

    // Gujarati 'જ્ઞ' (Gna) is universally pronounced as 'ગ્ન' in Gujarati (જ્ઞાની -> ગ્નાની, જ્ઞાન -> ગ્નાન)
    clean = clean.replace(/જ્ઞ/g, 'ગ્ન');

    // Convert math expressions (+, -, ×, ÷, =) and 0-100 numbers to authentic Gujarati words
    clean = normalizeMathAndNumbers(clean, 'gu');
  } else if (lang === 'hi') {
    // Strip Latin/English parenthetical annotations e.g. "शेर (Lion)" -> "शेर"
    clean = clean.replace(/\s*\([A-Za-z\s-]+\)/g, '');

    // Phonetic tuning for "गणपति": forces TTS to pronounce full, resonant "गणपति" instead of "Ganpat"
    clean = clean.replace(/गणपति/g, 'गणपती');

    // Convert math expressions (+, -, ×, ÷, =) and 0-100 numbers to authentic Hindi words
    clean = normalizeMathAndNumbers(clean, 'hi');
  } else if (lang === 'en') {
    // Strip parenthetical non-English annotations e.g. "Lion (સિંહ)" -> "Lion"
    clean = clean.replace(/\s*\([^\w\s.,'-]+\)/g, '');

    // Convert math expressions (+, -, ×, ÷, =) into clear English math words
    clean = normalizeMathAndNumbers(clean, 'en');
  }

  // Clean double spaces, stray spaces before punctuation, and stray commas
  clean = clean
    .replace(/\s+([!?,.:;])/g, '$1')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .replace(/(,\s*){2,}/g, ', ')
    .replace(/^[,\s]+|[,\s]+$/g, '')
    .trim();

  return clean;
}

/**
 * Convert Gujarati Unicode characters to Devanagari with Gujarati-specific phonetic adjustments.
 * Allows high-quality Indian TTS engines (like Google हिन्दी on Android or Microsoft Swara on Windows)
 * to pronounce Gujarati text with authentic, natural native Indian pronunciation when a standalone Gujarati voice
 * is not installed on the system.
 */
export function gujaratiToDevanagari(text: string): string {
  if (!text) return '';

  let clean = text;

  // 1. Replace multi-dot pauses with clean natural commas
  clean = clean.replace(/\.{2,}/g, ', ');

  // 2. Convert math expressions (+, -, ×, ÷, =) and 0-100 numbers to Gujarati spoken words first
  clean = normalizeMathAndNumbers(clean, 'gu');

  // 3. Gujarati 'જ્ઞ' (Gna) sounds like 'ગ્ન' in Gujarati (Hindi voice reads 'ज्ञ' as 'Gya')
  clean = clean.replace(/જ્ઞ/g, 'ગ્ન');

  // 4. English loanword "પેટર્ન"/"પૅટર્ન" sounds like "पैटर्न" (Pattern) in Indian TTS engines (prevents distorted "पे-टर्-न")
  clean = clean.replace(/પ[ેૅ]ટર્ન/g, 'पैटर्न');

  let out = '';
  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);

    // Gujarati 'ળ' (0x0AB3) -> In Hindi TTS, ळ is not supported natively and distorts/clicks.
    // Transcribing to 'ल' (0x0932) produces clean, crisp, native-like pronunciation (કમળ -> कमल, ફળ -> फल)
    if (code === 0x0AB3) {
      out += '\u0932'; // Devanagari 'ल'
      continue;
    }

    // Gujarati Swar, Vyanjan, and Matras offset to Devanagari is exactly -0x0180 (384)
    if (code >= 0x0A81 && code <= 0x0AF9) {
      out += String.fromCharCode(code - 0x0180);
    } else {
      out += clean[i];
    }
  }
  return out;
}

/**
 * Checks whether a given voice name or identifier belongs to an authentic male speaker.
 */
export function isMaleVoiceName(name: string): boolean {
  const n = (name || '').toLowerCase();
  return (
    n.includes('niranjan') ||
    n.includes('madhur') ||
    n.includes('hemant') ||
    n.includes('david') ||
    n.includes('ravi') ||
    n.includes('guy') ||
    n.includes('george') ||
    n.includes('mark') ||
    n.includes('stefan') ||
    n.includes('daniel') ||
    n.includes('alok') ||
    n.includes('ajay') ||
    n.includes('tarun') ||
    n.includes('vijay') ||
    n.includes('-gud') ||
    n.includes('-gub') ||
    n.includes('-hic') ||
    n.includes('-hid') ||
    n.includes('-hib') ||
    n.includes('-cfl') ||
    n.includes('-enc') ||
    n.includes('-enb') ||
    n.includes('-end') ||
    n.includes('-iom') ||
    n.includes('-iob') ||
    n.includes('-tpd') ||
    (n.includes('male') && !n.includes('female')) ||
    n.includes('पुरुष')
  );
}

/**
 * Calculates a safe, studio-grade speech pitch that guarantees a clear, authentic persona:
 * - Sir (Male): 0.95 if authentic male voice installed, or 0.74 pitch transposition if base voice is female.
 * - Madam (Female): 1.00 (pure natural clarity).
 * - Child: 1.05 (lively, cheerful kid).
 */
export function getCalibratedPitch(
  gender: VoiceGender = 'female',
  userPitch: number = 1.0,
  voiceIsActuallyMale: boolean = false
): number {
  if (gender === 'male') {
    if (voiceIsActuallyMale) {
      return 0.95;
    }
    // Deepen female base voice (e.g. Google हिन्दी) so it resonates distinctly as an adult male teacher
    return 0.74;
  }

  if (gender === 'child') {
    return 1.05;
  }

  return 1.00;
}

/**
 * Intelligently scores and selects the most natural, sweetest, high-fidelity voice
 * for children's learning according to language and selected voice type ('male' | 'female' | 'child').
 * Prioritizes natural neural voices (e.g. Microsoft Niranjan/Dhwani for Gujarati,
 * Microsoft Madhur/Swara for Hindi, Google हिन्दी, Google US English).
 * Strictly avoids harsh robotic legacy SAPI voices (Kalpana).
 */
export function selectBestVoice<T extends { name?: string; lang?: string; language?: string }>(
  voices: T[],
  lang: AppLanguage,
  gender: VoiceGender = 'female'
): T | null {
  if (!voices || voices.length === 0) return null;

  const scoreVoice = (v: T): number => {
    const name = (v.name || '').toLowerCase();
    const vLang = (v.lang || v.language || '').toLowerCase();
    let score = 0;

    // 1. Language matching
    if (lang === 'gu') {
      if (vLang.startsWith('gu') || name.includes('gujarati')) {
        score += 6000;
      } else if (vLang.startsWith('hi') || name.includes('hindi') || name.includes('हिन्दी')) {
        score += 3000; // Best natural Indian phonetic fallback for Gujarati
      } else {
        return -50000; // Disallow non-Indian voices for Gujarati to prevent English robot accents
      }
    } else if (lang === 'hi') {
      if (vLang.startsWith('hi') || name.includes('hindi') || name.includes('हिन्दी')) {
        score += 6000;
      } else {
        return -50000;
      }
    } else {
      if (vLang.startsWith('en')) {
        score += 6000;
      } else {
        return -50000;
      }
    }

    // 2. High-Quality Neural / Natural / Online voices (Edge, Chrome, Windows, Android)
    if (name.includes('natural') || name.includes('neural') || name.includes('online')) {
      score += 800;
    }
    if (name.includes('google')) {
      score += 600;
    }

    // 3. Gender classification
    const isMale =
      name.includes('niranjan') || // Microsoft Niranjan (Natural Gujarati Male)
      name.includes('madhur') ||   // Microsoft Madhur (Natural Hindi Male)
      name.includes('hemant') ||   // Microsoft Hemant (Hindi Male)
      name.includes('david') ||    // Microsoft David (US Male)
      name.includes('ravi') ||     // Indian Male
      name.includes('guy') ||      // Microsoft Guy
      name.includes('george') ||
      name.includes('mark') ||
      name.includes('stefan') ||
      name.includes('daniel') ||
      name.includes('alok') ||
      name.includes('-gud') ||     // Google Gujarati Male (Android Voice D)
      name.includes('-gub') ||     // Google Gujarati Male (Android Voice B)
      name.includes('-hic') ||     // Google Hindi Male (Android Voice C)
      name.includes('-hid') ||     // Google Hindi Male (Android Voice D)
      name.includes('-hib') ||     // Google Hindi Male (Android Voice B)
      name.includes('-cfl') ||     // Android Hindi Male
      name.includes('-enc') ||     // Google English Male
      name.includes('-enb') ||     // Google English Male
      name.includes('-end') ||     // Google English Male
      name.includes('-iom') ||     // Google US Male
      name.includes('-iob') ||     // Google US Male
      name.includes('-tpd') ||     // Google US Male
      (name.includes('male') && !name.includes('female'));

    const isFemale =
      name.includes('dhwani') ||   // Microsoft Dhwani (Natural Gujarati Female)
      name.includes('swara') ||    // Microsoft Swara (Natural Hindi Female)
      name.includes('neerja') ||   // Microsoft Neerja (Natural Indian English Female)
      name.includes('jenny') ||    // Microsoft Jenny (Natural US Female)
      name.includes('aria') ||     // Microsoft Aria (Natural US Female)
      name.includes('samantha') || // Apple Samantha
      name.includes('victoria') || // Apple Victoria
      name.includes('karen') ||
      name.includes('zira') ||
      name.includes('heera') ||
      name.includes('kalpana') ||
      name.includes('-gua') ||     // Google Gujarati Female (Android Voice A)
      name.includes('-guc') ||     // Google Gujarati Female (Android Voice C)
      name.includes('-hia') ||     // Google Hindi Female (Android Voice A)
      name.includes('-hie') ||     // Google Hindi Female (Android Voice E)
      name.includes('-hif') ||     // Google Hindi Female (Android Voice F)
      name.includes('-cfh') ||     // Android Hindi Female
      name.includes('-ena') ||     // Google Indian English Female (Android Voice A)
      name.includes('-ene') ||     // Google Indian English Female (Android Voice E)
      name.includes('-sfg') ||     // Google US Female (Android)
      name.includes('-iog') ||     // Google US Female (Android)
      name.includes('female') ||
      name.includes('woman') ||
      name.includes('girl') ||
      (name.includes('google') && !isMale);

    if (gender === 'female') {
      if (isFemale) {
        score += 2500;
      }
      if (isMale) {
        score -= 20000;
      }
    } else if (gender === 'child') {
      if (isFemale) {
        score += 1500;
      }
      if (isMale) {
        score -= 10000;
      }
    } else {
      if (isMale) {
        score += 2500;
      }
      if (isFemale) {
        score -= 1500;
      }
    }

    // 4. Heavily penalize legacy robotic desktop SAPI voices (Kalpana, Desktop)
    if (name.includes('desktop') || name.includes('kalpana')) {
      score -= 1500;
    }

    return score;
  };

  const ranked = voices
    .map((v) => ({ voice: v, score: scoreVoice(v) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return ranked.length > 0 ? ranked[0].voice : null;
}

/**
 * Backward compatibility wrapper for selectBestFemaleVoice
 */
export function selectBestFemaleVoice<T extends { name?: string; lang?: string; language?: string }>(
  voices: T[],
  lang: AppLanguage
): T | null {
  return selectBestVoice(voices, lang, 'female');
}

export interface WordTiming {
  wordIndex: number;
  word: string;
  cleanWord: string;
  startChar: number;
  endChar: number;
  startTime: number;
  endTime: number;
  pauseAfter: number;
}

export function buildWordTimings(
  text: string,
  totalDuration: number,
  language: AppLanguage = 'hi',
  secondsPerUnitOverride?: number
): WordTiming[] {
  if (!text) return [];
  if (totalDuration <= 0 && (!secondsPerUnitOverride || secondsPerUnitOverride <= 0)) return [];

  const regex = /\S+/g;
  let match: RegExpExecArray | null;
  const rawWords: { word: string; start: number; end: number }[] = [];

  while ((match = regex.exec(text)) !== null) {
    rawWords.push({
      word: match[0],
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  if (rawWords.length === 0) return [];

  const SHORT_WORDS = new Set([
    'में', 'पर', 'ने', 'को', 'का', 'की', 'के', 'से', 'था', 'थी', 'थे', 'है', 'हैं', 'हो',
    'रहा', 'रहे', 'रही',
    'તે', 'ને', 'માં', 'થી', 'છે', 'હતો', 'હતી', 'હતા', 'એ', 'તો', 'પણ', 'કે',
    'in', 'on', 'at', 'to', 'for', 'of', 'and', 'the', 'a', 'an', 'is', 'was', 'he', 'it'
  ]);

  const weights: number[] = [];
  const pauses: number[] = [];

  for (let i = 0; i < rawWords.length; i++) {
    const w = rawWords[i].word;
    const clean = w.replace(/[.,/#!$%^&*;:{}=\-_`~()?"'–—।|“’”«»]/g, '').trim();

    // Syllables / aksharas count
    const baseChars = clean.replace(
      /[\u0900-\u0903\u093A-\u094F\u0951-\u0957\u0962-\u0963\u0A81-\u0A83\u0ABE-\u0ACD\u0AE2-\u0AE3]/g,
      ''
    );
    const syllables = Math.max(1, baseChars.length);

    let weight = 1.0;
    if (syllables === 1) weight = 0.85;
    else if (syllables === 2) weight = 1.15;
    else if (syllables === 3) weight = 1.5;
    else if (syllables === 4) weight = 1.85;
    else weight = 2.1 + (syllables - 4) * 0.3;

    // Matra count (long vowel marks)
    const longVowels = (clean.match(/[\u093E\u0940\u0942\u0947\u0948\u094B\u094C\u0ABE\u0AC0\u0AC2\u0AC7\u0AC8\u0ACB\u0ACC]/g) || []).length;
    weight += longVowels * 0.15;

    if (SHORT_WORDS.has(clean)) {
      weight *= 0.75;
    }

    let pause = 0;
    if (w.includes('।') || w.includes('.') || w.includes('!') || w.includes('?')) {
      pause = 1.1; // ~320ms equivalent pause
    } else if (w.includes(',') || w.includes(';') || w.includes('،')) {
      pause = 0.55; // ~160ms equivalent pause
    }

    weights.push(weight);
    pauses.push(pause);
  }

  const totalWeight = weights.reduce((a, b) => a + b, 0) + pauses.reduce((a, b) => a + b, 0);
  const timePerUnit = (typeof secondsPerUnitOverride === 'number' && secondsPerUnitOverride > 0)
    ? secondsPerUnitOverride
    : (totalDuration / Math.max(0.001, totalWeight));

  const timings: WordTiming[] = [];
  let currentTime = 0;

  for (let i = 0; i < rawWords.length; i++) {
    const w = rawWords[i];
    const clean = w.word.replace(/[.,/#!$%^&*;:{}=\-_`~()?"'–—।|“’”«»]/g, '').trim();
    const wordDuration = weights[i] * timePerUnit;
    const pauseDuration = pauses[i] * timePerUnit;

    const startTime = currentTime;
    const endTime = startTime + wordDuration;

    timings.push({
      wordIndex: i,
      word: w.word,
      cleanWord: clean,
      startChar: w.start,
      endChar: w.end,
      startTime: Math.round(startTime * 1000) / 1000,
      endTime: Math.round(endTime * 1000) / 1000,
      pauseAfter: Math.round(pauseDuration * 1000) / 1000,
    });

    currentTime = endTime + pauseDuration;
  }

  return timings;
}

export const audioService = {
  addWordBoundaryListener(listener: WordBoundaryListener): () => void {
    wordBoundaryListeners.add(listener);
    return () => {
      wordBoundaryListeners.delete(listener);
    };
  },

  addSpeechEndListener(listener: SpeechEndListener): () => void {
    speechEndListeners.add(listener);
    return () => {
      speechEndListeners.delete(listener);
    };
  },

  addSpeechStartListener(listener: SpeechStartListener): () => void {
    speechStartListeners.add(listener);
    return () => {
      speechStartListeners.delete(listener);
    };
  },

  getEffectiveSpeechRate(lang: AppLanguage = 'en', baseRate?: number): number {
    const rateToUse = typeof baseRate === 'number' && !isNaN(baseRate) ? baseRate : currentVoiceRate;
    if (lang === 'gu') {
      return Math.min(1.35, Math.max(0.85, Math.round(0.95 * rateToUse * 100) / 100));
    } else if (lang === 'hi') {
      return Math.min(1.35, Math.max(0.85, Math.round(0.96 * rateToUse * 100) / 100));
    }
    return Math.min(1.35, Math.max(0.85, Math.round(rateToUse * 100) / 100));
  },

  getVoiceGender(): VoiceGender {
    return currentVoiceGender;
  },

  async setVoiceGender(gender: VoiceGender): Promise<void> {
    currentVoiceGender = gender;
    voiceCache.clear();
    try {
      await AsyncStorage.setItem(VOICE_GENDER_KEY, gender);
    } catch {}
  },

  async initVoiceGender(): Promise<VoiceGender> {
    try {
      const stored = await AsyncStorage.getItem(VOICE_GENDER_KEY);
      if (stored === 'male' || stored === 'female' || stored === 'child') {
        currentVoiceGender = stored;
      }
    } catch {}
    return currentVoiceGender;
  },

  getVoiceRate(): number {
    return currentVoiceRate;
  },

  async setVoiceRate(rate: number): Promise<void> {
    currentVoiceRate = Math.min(1.5, Math.max(0.8, rate));
    try {
      await AsyncStorage.setItem(VOICE_RATE_KEY, String(currentVoiceRate));
    } catch {}
  },

  async initVoiceRate(): Promise<number> {
    try {
      const stored = await AsyncStorage.getItem(VOICE_RATE_KEY);
      if (stored) {
        const parsed = parseFloat(stored);
        if (!isNaN(parsed) && parsed >= 0.8 && parsed <= 1.5) {
          currentVoiceRate = parsed;
        }
      }
    } catch {}
    return currentVoiceRate;
  },

  getVoicePitch(): number {
    return currentVoicePitch;
  },

  async setVoicePitch(pitch: number): Promise<void> {
    currentVoicePitch = Math.min(1.6, Math.max(0.8, pitch));
    try {
      await AsyncStorage.setItem(VOICE_PITCH_KEY, String(currentVoicePitch));
    } catch {}
  },

  async initVoicePitch(): Promise<number> {
    try {
      const stored = await AsyncStorage.getItem(VOICE_PITCH_KEY);
      if (stored) {
        const parsed = parseFloat(stored);
        if (!isNaN(parsed) && parsed >= 0.8 && parsed <= 1.6) {
          currentVoicePitch = parsed;
        }
      }
    } catch {}
    return currentVoicePitch;
  },

  setSoundEnabled(enabled: boolean): void {
    globalSoundEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  },

  isSoundEnabled(): boolean {
    return globalSoundEnabled;
  },

  getLanguageLocale(lang: AppLanguage): string {
    switch (lang) {
      case 'gu':
        return 'gu-IN';
      case 'hi':
        return 'hi-IN';
      case 'en':
      default:
        return 'en-US';
    }
  },

  async loadNativeVoices(): Promise<Speech.Voice[]> {
    if (isNativeVoicesLoaded && cachedNativeVoices.length > 0) {
      return cachedNativeVoices;
    }
    try {
      if (Platform.OS !== 'web') {
        if (!nativeVoicesInFlightPromise) {
          nativeVoicesInFlightPromise = Speech.getAvailableVoicesAsync()
            .then((voices) => {
              if (voices && voices.length > 0) {
                cachedNativeVoices = voices;
                isNativeVoicesLoaded = true;
              }
              return cachedNativeVoices;
            })
            .catch(() => cachedNativeVoices)
            .finally(() => {
              nativeVoicesInFlightPromise = null;
            });
        }
        const timeoutPromise = new Promise<Speech.Voice[]>((resolve) =>
          setTimeout(() => resolve(cachedNativeVoices), 1500)
        );
        await Promise.race([nativeVoicesInFlightPromise, timeoutPromise]);
      }
    } catch {
      // Native voices unavailable or mocked in testing environment
    }
    return cachedNativeVoices;
  },

  async speak(
    text: string,
    lang: AppLanguage = 'en',
    enabledOrOnDone?: boolean | (() => void),
    onDone?: () => void
  ): Promise<void> {
    let enabled: boolean | undefined = undefined;
    let doneCb: (() => void) | undefined = onDone;
    if (typeof enabledOrOnDone === 'function') {
      doneCb = enabledOrOnDone;
    } else if (typeof enabledOrOnDone === 'boolean') {
      enabled = enabledOrOnDone;
    }

    const isAllowed = enabled !== undefined ? enabled : globalSoundEnabled;
    if (!isAllowed || !globalSoundEnabled || !text) {
      if (doneCb) {
        try {
          doneCb();
        } catch {}
      }
      return;
    }

    try {
      // 1. Stop any ongoing playback before starting new speech without falsely signaling end for upcoming speech
      this.stopInternal(false);

      // 2. Now allocate the request ID for this speech call
      const requestId = ++currentSpeechRequestId;

      // Ensure content script matches intended voice language
      const effectiveLang = detectContentLanguage(text, lang);
      const normalizedText = normalizeSpeechText(text, effectiveLang);
      if (!normalizedText) {
        if (doneCb) {
          try {
            doneCb();
          } catch {}
        }
        return;
      }

      // 1. WEB BROWSER IMPLEMENTATION (Zero-latency native Google TTS audio with Web Speech Synthesis fallback)
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        if (!globalSoundEnabled || requestId !== currentSpeechRequestId) {
          if (doneCb) {
            try {
              doneCb();
            } catch {}
          }
          return;
        }

        // Priority 0: Check offline local bundled asset first
        const offlineKey = `${effectiveLang}:${normalizedText}`;
        const localAudioUrl = WEB_PROMPT_AUDIO_MAP[offlineKey] || WEB_PROMPT_AUDIO_MAP[normalizedText];

        // When pre-bundled offline audio is available and female voice is selected, play instant local asset
        if (localAudioUrl && currentVoiceGender === 'female') {
          this.speakWebNativeAudio(normalizedText, effectiveLang, requestId, doneCb);
          return;
        }

        // Check if Web Speech Synthesis actually has a compatible voice for this language
        const voices = this.getAvailableWebVoices();
        const hasCompatibleVoice = !!selectBestVoice(voices, effectiveLang, currentVoiceGender);

        // For stories, sentences, dynamic reading, or male/child voices:
        // When a compatible native voice is available, use zero-latency Web SpeechSynthesis
        if (hasCompatibleVoice) {
          this.speakWebSynthesis(normalizedText, effectiveLang, requestId, doneCb);
        } else {
          // If no compatible voice is installed in the PC browser (e.g. Windows without Hindi/Gujarati voice pack, or Brave browser),
          // play authentic native audio via Google TTS proxy / direct stream!
          this.speakWebNativeAudio(normalizedText, effectiveLang, requestId, doneCb);
        }
        return;
      }

      // 2. NATIVE ANDROID / IOS IMPLEMENTATION (High-Fidelity Google TTS with Expo Speech Fallback)
      if (currentVoiceGender !== 'female') {
        this.speakNativeSpeech(normalizedText, effectiveLang, requestId, doneCb);
        return;
      }
      this.speakNativeAudio(normalizedText, effectiveLang, requestId, doneCb);
    } catch (e) {
      console.log('Audio speak error:', e);
      if (doneCb) {
        try {
          doneCb();
        } catch {}
      }
    }
  },

  async speakNativeAudio(
    text: string,
    lang: AppLanguage,
    requestId: number,
    onDone?: () => void
  ): Promise<void> {
    if ((!createAudioPlayerFn && !ExpoAvAudio?.Sound) || !globalSoundEnabled) {
      this.speakNativeSpeech(text, lang, requestId, onDone);
      return;
    }

    ensureNativeAudioMode().catch(() => {});

    // Priority 0: Check offline pre-bundled asset first for 100% offline, zero-latency, identical playback
    const offlineKey = `${lang}:${text}`;
    const bundledSource = PROMPT_AUDIO_MAP[offlineKey] || PROMPT_AUDIO_MAP[text];
    let targetSource: any = bundledSource || null;

    // Fast-path: When no pre-bundled local asset exists, immediately speak using native device speech synthesis
    // Eliminates HTTP network requests, caching latency, and delays across Android and iOS
    if (!targetSource) {
      this.speakNativeSpeech(text, lang, requestId, onDone);
      return;
    }

    // High-fidelity Google TTS endpoints
    const apiBase = safeGetApiBaseUrl();
    const proxyUrl = apiBase
      ? `${apiBase}/tts/audio.mp3?lang=${encodeURIComponent(lang)}&text=${encodeURIComponent(text)}`
      : null;
    const directUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(text)}`;

    // Check if we can download/cache to local file for instant native ExoPlayer playback
    if (!targetSource && fileSystemDownloadAsync && fileSystemCacheDir) {
      try {
        let hash = 0;
        const key = `${lang}:${text}`;
        for (let i = 0; i < key.length; i++) {
          hash = ((hash << 5) - hash) + key.charCodeAt(i);
          hash |= 0;
        }
        const safeFilename = `tts_${lang}_${Math.abs(hash)}.mp3`;
        const localTarget = `${fileSystemCacheDir}${safeFilename}`;

        let exists = false;
        if (fileSystemGetInfoAsync) {
          try {
            const info = await fileSystemGetInfoAsync(localTarget);
            if (info && info.exists && info.size > 200) {
              exists = true;
              targetSource = localTarget;
            }
          } catch {}
        }

        if (!exists) {
          // Priority 1: Django LAN proxy (serves full MP3 headers & bypasses mobile Google 403)
          // Priority 2: Direct Google TTS endpoint
          const candidateUrls: string[] = [];
          if (proxyUrl) candidateUrls.push(proxyUrl);
          candidateUrls.push(directUrl);

          for (const url of candidateUrls) {
            try {
              const res = await fileSystemDownloadAsync(url, localTarget, {
                headers: {
                  'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                },
              });
              if (res && res.status === 200 && res.uri) {
                targetSource = res.uri;
                break;
              }
            } catch (dlErr) {
              console.log('[AudioService] FileSystem download error from:', url, dlErr);
            }
          }
        }
      } catch (err) {
        console.log('[AudioService] Local disk cache download exception:', err);
      }
    }

    // If local caching was unavailable, stream directly via proxyUrl or directUrl
    if (!targetSource) {
      targetSource = proxyUrl || directUrl;
    }

    if (requestId !== currentSpeechRequestId || !globalSoundEnabled) {
      if (onDone) try { onDone(); } catch {}
      return;
    }

    const rate = Math.min(1.35, Math.max(0.85, Math.round(currentVoiceRate * 100) / 100));

    try {
      if (activeNativeAudio) {
        try {
          if (typeof activeNativeAudio.pause === 'function') activeNativeAudio.pause();
          if (typeof activeNativeAudio.stopAsync === 'function') activeNativeAudio.stopAsync();
          if (typeof activeNativeAudio.unloadAsync === 'function') activeNativeAudio.unloadAsync();
          if (typeof activeNativeAudio.remove === 'function') activeNativeAudio.remove();
        } catch {}
        activeNativeAudio = null;
      }

      let started = false;
      let finished = false;
      let player: any = null;
      let soundObj: any = null;

      const finishOnce = () => {
        if (finished) return;
        finished = true;
        clearTimeout(fallbackTimer);
        emitSpeechEnd();
        if (activeNativeAudio === player || activeNativeAudio === soundObj) {
          activeNativeAudio = null;
        }
        try {
          if (player && typeof player.remove === 'function') player.remove();
          if (soundObj) {
            soundObj.stopAsync().catch(() => {});
            soundObj.unloadAsync().catch(() => {});
          }
        } catch {}
        if (onDone) {
          try {
            onDone();
          } catch {}
        }
      };

      const fallbackTimer = setTimeout(() => {
        if (!started && requestId === currentSpeechRequestId && globalSoundEnabled) {
          try {
            if (player) {
              player.pause();
              if (typeof player.remove === 'function') player.remove();
            }
            if (soundObj) {
              soundObj.stopAsync().catch(() => {});
              soundObj.unloadAsync().catch(() => {});
            }
          } catch {}
          if (activeNativeAudio === player || activeNativeAudio === soundObj) activeNativeAudio = null;
          this.speakNativeSpeech(text, lang, requestId, onDone);
        }
      }, 2000);

      // Attempt 1: expo-audio player
      if (createAudioPlayerFn) {
        try {
          player = createAudioPlayerFn(targetSource);
          if (player) {
            activeNativeAudio = player;
            try {
              player.playbackRate = rate;
            } catch {}

            if (typeof player.addListener === 'function') {
              player.addListener('playbackStatusUpdate', (status: any) => {
                if (status?.playing) {
                  started = true;
                  clearTimeout(fallbackTimer);
                }
                if (status?.duration && status.duration > 0 && typeof status.currentTime === 'number') {
                  const prog = Math.min(1, Math.max(0, status.currentTime / status.duration));
                  emitWordBoundary({
                    progress: prog,
                    charIndex: Math.floor(prog * text.length),
                  });
                }
                if (status?.didJustFinish) {
                  finishOnce();
                }
                if (status?.error || status?.playbackState === 'error') {
                  clearTimeout(fallbackTimer);
                  if (!started && requestId === currentSpeechRequestId && globalSoundEnabled) {
                    try {
                      player.pause();
                      if (typeof player.remove === 'function') player.remove();
                    } catch {}
                    if (activeNativeAudio === player) activeNativeAudio = null;
                    this.speakNativeSpeech(text, lang, requestId, onDone);
                  } else {
                    finishOnce();
                  }
                }
              });
            }

            player.play();
            return;
          }
        } catch (playerErr) {
          console.log('[AudioService] createAudioPlayerFn threw, trying expo-av:', playerErr);
          player = null;
        }
      }

      // Attempt 2: expo-av Sound
      if (!player && ExpoAvAudio?.Sound) {
        try {
          const soundInstance = new ExpoAvAudio.Sound();
          soundObj = soundInstance;
          activeNativeAudio = soundInstance;
          const uri = typeof targetSource === 'string' ? targetSource : targetSource?.uri;
          await soundInstance.loadAsync({ uri }, { shouldPlay: true, rate });
          started = true;
          clearTimeout(fallbackTimer);
          soundInstance.setOnPlaybackStatusUpdate((status: any) => {
            if (status?.isLoaded && status?.durationMillis && status.durationMillis > 0 && typeof status.positionMillis === 'number') {
              const prog = Math.min(1, Math.max(0, status.positionMillis / status.durationMillis));
              emitWordBoundary({
                progress: prog,
                charIndex: Math.floor(prog * text.length),
              });
            }
            if (status?.didJustFinish) {
              finishOnce();
            }
            if (status?.error) {
              clearTimeout(fallbackTimer);
              if (!started && requestId === currentSpeechRequestId && globalSoundEnabled) {
                this.speakNativeSpeech(text, lang, requestId, onDone);
              } else {
                finishOnce();
              }
            }
          });
          return;
        } catch (avErr) {
          console.log('[AudioService] expo-av playback failed:', avErr);
          soundObj = null;
        }
      }

      clearTimeout(fallbackTimer);
      this.speakNativeSpeech(text, lang, requestId, onDone);
    } catch (e) {
      console.warn('Native Google TTS streaming failed, falling back to on-device speech:', e);
      this.speakNativeSpeech(text, lang, requestId, onDone);
    }
  },

  async speakNativeSpeech(
    normalizedText: string,
    effectiveLang: AppLanguage,
    requestId: number,
    doneCb?: () => void
  ): Promise<void> {
    try {
      const voices =
        isNativeVoicesLoaded && cachedNativeVoices.length > 0
          ? cachedNativeVoices
          : await this.loadNativeVoices();
      if (requestId !== currentSpeechRequestId) {
        if (doneCb) {
          try {
            doneCb();
          } catch {}
        }
        return;
      }

      let targetLocale = this.getLanguageLocale(effectiveLang);
      let targetText = normalizedText;
      let selectedVoiceIdentifier: string | undefined = undefined;

      const bestVoice = selectBestVoice(voices, effectiveLang, currentVoiceGender);
      if (bestVoice) {
        const vLang = ((bestVoice as any).language || (bestVoice as any).lang || '').toLowerCase();
        const vName = ((bestVoice as any).name || '').toLowerCase();
        const isGujaratiVoice = vLang.startsWith('gu') || vName.includes('gujarati');
        const isHindiVoice = vLang.startsWith('hi') || vName.includes('hindi') || vName.includes('हिन्दी');

        if (isGujaratiVoice) {
          targetLocale = 'gu-IN';
          targetText = normalizedText;
          selectedVoiceIdentifier = (bestVoice as any).identifier;
        } else if (isHindiVoice && effectiveLang === 'gu') {
          targetLocale = 'hi-IN';
          targetText = gujaratiToDevanagari(normalizedText);
          selectedVoiceIdentifier = (bestVoice as any).identifier;
        } else {
          targetLocale = this.getLanguageLocale(effectiveLang);
          targetText = normalizedText;
          selectedVoiceIdentifier = (bestVoice as any).identifier;
        }
      } else {
        if (effectiveLang === 'gu') {
          // Robust Indian fallback: If no Gujarati voice exists on device, use Devanagari transliteration with Hindi locale
          const fallbackHindiVoice = selectBestVoice(voices, 'hi', currentVoiceGender);
          targetLocale = 'hi-IN';
          targetText = gujaratiToDevanagari(normalizedText);
          if (fallbackHindiVoice) {
            selectedVoiceIdentifier = (fallbackHindiVoice as any).identifier;
          }
        } else {
          targetLocale = this.getLanguageLocale(effectiveLang);
          targetText = normalizedText;
        }
      }

      const voiceIsActuallyMale = bestVoice ? isMaleVoiceName((bestVoice as any).name || (bestVoice as any).identifier || '') : false;
      const speechPitch = getCalibratedPitch(currentVoiceGender, currentVoicePitch, voiceIsActuallyMale);
      const speechRate = currentVoiceGender === 'male' ? Math.min(1.3, Math.max(0.85, currentVoiceRate * 0.96)) : currentVoiceRate;

      let hasReceivedNativeBoundary = false;
      let nativeBoundaryFallbackInterval: any = null;
      let initialLatencyTimer: any = null;

      const clearFallback = () => {
        if (initialLatencyTimer) {
          clearTimeout(initialLatencyTimer);
          initialLatencyTimer = null;
        }
        if (nativeBoundaryFallbackInterval) {
          clearInterval(nativeBoundaryFallbackInterval);
          nativeBoundaryFallbackInterval = null;
        }
      };

      // Android SpeechModule.kt passes options.language to Locale.Builder().setLanguage(it),
      // which throws IllformedLocaleException for hyphenated tags like "hi-IN" / "gu-IN".
      const nativeLocale = Platform.OS === 'android' ? targetLocale.split('-')[0] : targetLocale;

      const speechOptions: Speech.SpeechOptions = {
        language: nativeLocale,
        pitch: speechPitch,
        rate: speechRate,
        onStart: () => {
          if (requestId === currentSpeechRequestId) {
            // Android native AudioTrack buffer latency:
            // TextToSpeech.speak() on Android fires onStart when synthesis begins in the service,
            // but the first sound does not exit the mobile speaker until ~340ms later.
            const initialLatencyMs = Platform.OS === 'android' ? 340 : 0;

            const startTracking = () => {
              if (requestId !== currentSpeechRequestId) return;
              emitSpeechStart();

              const wordsList = targetText.match(/\S+/g) || [];
              if (wordsList.length > 0) {
                // Real Google TTS speech cadence for Indic storytelling:
                // Google TTS speaks Hindi/Gujarati at ~155-165 WPM.
                // Each weight unit is ~0.40 seconds scaled by speechRate.
                const secondsPerUnit = 0.40 / Math.max(0.75, speechRate);
                const timings = buildWordTimings(targetText, 0, effectiveLang, secondsPerUnit);
                const startTimestamp = Date.now();
                let lastReportedIdx = -1;

                nativeBoundaryFallbackInterval = setInterval(() => {
                  if (requestId !== currentSpeechRequestId || hasReceivedNativeBoundary) {
                    clearFallback();
                    return;
                  }
                  const elapsedSeconds = (Date.now() - startTimestamp) / 1000;
                  for (let i = 0; i < timings.length; i++) {
                    const item = timings[i];
                    if (elapsedSeconds >= item.startTime && elapsedSeconds < item.endTime + item.pauseAfter) {
                      if (i !== lastReportedIdx) {
                        lastReportedIdx = i;
                        emitWordBoundary({
                          wordIndex: i,
                          charIndex: item.startChar,
                          charLength: item.endChar - item.startChar,
                          progress: targetText.length > 0 ? item.startChar / targetText.length : 0,
                          sessionId: requestId,
                        });
                      }
                      break;
                    }
                  }
                }, 25);
              }
            };

            if (initialLatencyMs > 0) {
              initialLatencyTimer = setTimeout(startTracking, initialLatencyMs);
            } else {
              startTracking();
            }
          }
        },
        onBoundary: (event: any) => {
          if (requestId === currentSpeechRequestId) {
            hasReceivedNativeBoundary = true;
            clearFallback();
            const charIndex = typeof event?.charIndex === 'number' ? event.charIndex : 0;
            const charLength = typeof event?.charLength === 'number' ? event.charLength : undefined;
            emitWordBoundary({
              charIndex,
              charLength,
              progress: targetText.length > 0 ? charIndex / targetText.length : 0,
              sessionId: requestId,
            });
          }
        },
        onStopped: () => {
          clearFallback();
          if (requestId === currentSpeechRequestId) {
            emitSpeechEnd();
          }
        },
        onError: (err) => {
          clearFallback();
          console.log('Native speech error:', err);
          if (requestId === currentSpeechRequestId) {
            emitSpeechEnd();
            // Fallback: If native gu-IN failed (e.g. missing Android offline voice pack), retry with hi-IN transliteration
            if (effectiveLang === 'gu' && targetLocale !== 'hi-IN') {
              try {
                Speech.speak(gujaratiToDevanagari(normalizedText), {
                  language: Platform.OS === 'android' ? 'hi' : 'hi-IN',
                  pitch: speechPitch,
                  rate: speechRate,
                  onStart: () => {
                    if (requestId === currentSpeechRequestId) emitSpeechStart();
                  },
                  onStopped: () => {
                    if (requestId === currentSpeechRequestId) emitSpeechEnd();
                  },
                  onError: () => {
                    if (requestId === currentSpeechRequestId) {
                      emitSpeechEnd();
                      if (doneCb) try { doneCb(); } catch {}
                    }
                  },
                  onDone: () => {
                    if (requestId === currentSpeechRequestId) {
                      emitSpeechEnd();
                      if (doneCb) try { doneCb(); } catch {}
                    }
                  },
                });
                return;
              } catch {}
            }
            if (selectedVoiceIdentifier) {
              try {
                Speech.speak(targetText, {
                  language: nativeLocale,
                  pitch: speechPitch,
                  rate: speechRate,
                  onBoundary: (event: any) => {
                    if (requestId === currentSpeechRequestId) {
                      const charIndex = typeof event?.charIndex === 'number' ? event.charIndex : 0;
                      const charLength = typeof event?.charLength === 'number' ? event.charLength : undefined;
                      emitWordBoundary({
                        charIndex,
                        charLength,
                        progress: targetText.length > 0 ? charIndex / targetText.length : 0,
                      });
                    }
                  },
                  onStopped: () => {
                    if (requestId === currentSpeechRequestId) {
                      emitSpeechEnd();
                    }
                  },
                  onError: () => {
                    if (requestId === currentSpeechRequestId) {
                      emitSpeechEnd();
                      if (doneCb) try { doneCb(); } catch {}
                    }
                  },
                  onDone: () => {
                    if (requestId === currentSpeechRequestId) {
                      emitSpeechEnd();
                      if (doneCb) try { doneCb(); } catch {}
                    }
                  },
                });
                return;
              } catch {}
            }
            if (doneCb) {
              try {
                doneCb();
              } catch {}
            }
          }
        },
        onDone: () => {
          clearFallback();
          if (requestId === currentSpeechRequestId) {
            emitSpeechEnd();
            if (doneCb) {
              try {
                doneCb();
              } catch {}
            }
          }
        },
      };
      if (selectedVoiceIdentifier) {
        speechOptions.voice = selectedVoiceIdentifier;
      }
      Speech.speak(targetText, speechOptions);
    } catch (e) {
      console.log('Native speech error:', e);
      if (doneCb) {
        try {
          doneCb();
        } catch {}
      }
    }
  },

  getAvailableWebVoices(): any[] {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (cachedWebVoices && cachedWebVoices.length > 0) return cachedWebVoices;
      try {
        const v = window.speechSynthesis.getVoices();
        if (v && v.length > 0) {
          cachedWebVoices = v;
          return v;
        }
      } catch {}
    }
    return cachedWebVoices || [];
  },

  splitIntoSpeechChunks(text: string, maxLen: number = 180): string[] {
    if (!text || text.length <= maxLen) return text ? [text] : [];
    const sentences = text.match(/[^।!?.।\n]+[।!?.।\n]*/g) || [text];
    const chunks: string[] = [];
    let cur = '';

    const pushChunk = (str: string) => {
      const trimmed = str.trim();
      if (trimmed) chunks.push(trimmed);
    };

    for (const rawS of sentences) {
      const s = rawS.trim();
      if (!s) continue;

      // If a single sentence exceeds maxLen, break it safely at clause / comma boundaries
      const subSentences: string[] = s.length > maxLen ? s.split(/([,،;:]\s*)/).filter(Boolean) : [s];
      const atomicParts: string[] = [];
      for (let i = 0; i < subSentences.length; i++) {
        if (/^[,،;:]\s*$/.test(subSentences[i]) && atomicParts.length > 0) {
          atomicParts[atomicParts.length - 1] += subSentences[i];
        } else {
          atomicParts.push(subSentences[i]);
        }
      }

      for (const part of atomicParts) {
        if (!cur) {
          cur = part;
        } else if ((cur + ' ' + part).length <= maxLen) {
          cur = cur + ' ' + part;
        } else {
          pushChunk(cur);
          cur = part;
        }
      }
    }
    if (cur.trim()) {
      pushChunk(cur);
    }
    return chunks.length > 0 ? chunks : [text];
  },

  speakWebNativeAudio(text: string, lang: AppLanguage, requestId: number, onDone?: () => void): void {
    if (typeof window === 'undefined') {
      if (onDone) {
        try { onDone(); } catch {}
      }
      return;
    }
    if (requestId !== currentSpeechRequestId || !globalSoundEnabled) {
      if (onDone) {
        try { onDone(); } catch {}
      }
      return;
    }

    if (typeof Audio === 'undefined') {
      this.speakWebSynthesis(text, lang, requestId, onDone);
      return;
    }

    let hasEnded = false;
    const finishOnce = () => {
      if (hasEnded) return;
      hasEnded = true;
      emitSpeechEnd();
      if (onDone) {
        try {
          onDone();
        } catch {}
      }
    };

    try {
      if (activeWebAudio) {
        try {
          activeWebAudio.pause();
          activeWebAudio.src = '';
          activeWebAudio.currentTime = 0;
        } catch {}
        activeWebAudio = null;
      }

      // Priority 0: Check offline local bundled asset first
      const offlineKey = `${lang}:${text}`;
      const localAudioUrl = WEB_PROMPT_AUDIO_MAP[offlineKey] || WEB_PROMPT_AUDIO_MAP[text];

      const effectiveRate = this.getEffectiveSpeechRate(lang);

      if (localAudioUrl) {
        const audio = new Audio(localAudioUrl);
        activeWebAudio = audio;
        audio.playbackRate = effectiveRate;
        try {
          (audio as any).preservesPitch = true;
        } catch {}

        audio.onplay = () => {
          emitSpeechStart();
        };

        audio.ontimeupdate = () => {
          if (audio.duration && audio.duration > 0 && !isNaN(audio.duration)) {
            const progress = Math.min(1, Math.max(0, audio.currentTime / audio.duration));
            emitWordBoundary({
              charIndex: Math.floor(progress * text.length),
              progress,
            });
          }
        };

        audio.onended = () => {
          if (activeWebAudio === audio) activeWebAudio = null;
          finishOnce();
        };

        audio.onerror = () => {
          this.speakWebSynthesis(text, lang, requestId, onDone);
        };

        audio.play().catch(() => {
          this.speakWebSynthesis(text, lang, requestId, onDone);
        });
        return;
      }

      // Dynamic Story / Sentence audio streaming via Google TTS proxy or direct endpoint
      const chunks = this.splitIntoSpeechChunks(text, 180);
      if (chunks.length === 0) {
        finishOnce();
        return;
      }

      const apiBase = safeGetApiBaseUrl();
      let currentChunkIdx = 0;
      let cumulativeChars = 0;
      let cumulativeWords = 0;

      const playNextChunk = () => {
        if (currentChunkIdx >= chunks.length || requestId !== currentSpeechRequestId) {
          finishOnce();
          return;
        }

        const chunkText = chunks[currentChunkIdx];
        const chunkStartOffset = cumulativeChars;
        const chunkChars = chunkText.length;
        const chunkWordOffset = cumulativeWords;

        const wordsMatch = chunkText.match(/\S+/g);
        const chunkWordCount = wordsMatch ? wordsMatch.length : 0;

        const proxyUrl = apiBase
          ? `${apiBase}/tts/audio.mp3?lang=${encodeURIComponent(lang)}&text=${encodeURIComponent(chunkText)}`
          : null;
        const directUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(chunkText)}`;
        const targetUrl = proxyUrl || directUrl;

        const audio = new Audio(targetUrl);
        activeWebAudio = audio;
        audio.playbackRate = effectiveRate;
        try {
          (audio as any).preservesPitch = true;
        } catch {}

        let chunkTimings: WordTiming[] = [];
        let lastReportedTimingIdx = -1;
        let trackInterval: any = null;

        const ensureTimings = () => {
          if (chunkTimings.length === 0 && audio.duration && audio.duration > 0 && !isNaN(audio.duration)) {
            chunkTimings = buildWordTimings(chunkText, audio.duration, lang);
          }
        };

        const updateWordPosition = () => {
          if (requestId !== currentSpeechRequestId || !activeWebAudio || activeWebAudio !== audio) {
            if (trackInterval) clearInterval(trackInterval);
            return;
          }
          ensureTimings();
          if (chunkTimings.length === 0) return;

          const t = audio.currentTime;
          for (let i = 0; i < chunkTimings.length; i++) {
            const item = chunkTimings[i];
            if (t >= item.startTime && t < item.endTime + item.pauseAfter) {
              if (i !== lastReportedTimingIdx) {
                lastReportedTimingIdx = i;
                emitWordBoundary({
                  wordIndex: chunkWordOffset + i,
                  charIndex: chunkStartOffset + item.startChar,
                  charLength: item.endChar - item.startChar,
                  progress: text.length > 0 ? (chunkStartOffset + item.startChar) / text.length : 0,
                  sessionId: requestId,
                });
              }
              break;
            }
          }
        };

        audio.onloadedmetadata = ensureTimings;
        audio.ondurationchange = ensureTimings;

        audio.onplay = () => {
          if (currentChunkIdx === 0) {
            emitSpeechStart();
          }
          ensureTimings();
          updateWordPosition();
          if (trackInterval) clearInterval(trackInterval);
          trackInterval = setInterval(updateWordPosition, 25);
        };

        audio.ontimeupdate = updateWordPosition;

        audio.onpause = () => {
          if (trackInterval) clearInterval(trackInterval);
        };

        audio.onended = () => {
          if (trackInterval) clearInterval(trackInterval);
          cumulativeWords += chunkWordCount;
          cumulativeChars += chunkChars;
          currentChunkIdx++;
          if (currentChunkIdx < chunks.length) {
            playNextChunk();
          } else {
            if (activeWebAudio === audio) activeWebAudio = null;
            finishOnce();
          }
        };

        audio.onerror = () => {
          if (trackInterval) clearInterval(trackInterval);
          // If proxy failed, try direct Google TTS
          if (proxyUrl && audio.src === proxyUrl && directUrl) {
            audio.src = directUrl;
            audio.play().catch(() => {
              cumulativeWords += chunkWordCount;
              cumulativeChars += chunkChars;
              currentChunkIdx++;
              playNextChunk();
            });
            return;
          }
          cumulativeWords += chunkWordCount;
          cumulativeChars += chunkChars;
          currentChunkIdx++;
          playNextChunk();
        };

        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch((err) => {
            console.warn('Web audio play failed, trying direct fallback:', err);
            if (proxyUrl && audio.src === proxyUrl && directUrl) {
              audio.src = directUrl;
              audio.play().catch(() => finishOnce());
            } else {
              finishOnce();
            }
          });
        }
      };

      playNextChunk();
    } catch {
      finishOnce();
    }
  },

  speakWebSynthesis(
    text: string,
    lang: AppLanguage,
    requestId?: number,
    onDone?: () => void,
    sentenceContext?: { startWordIndex: number; totalGlobalWords: number; startChar?: number }
  ): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onDone) {
        try { onDone(); } catch {}
      }
      return;
    }
    if (requestId && requestId !== currentSpeechRequestId) {
      if (onDone) {
        try { onDone(); } catch {}
      }
      return;
    }

    try {
      const isSpeakingOrPending = window.speechSynthesis.speaking || window.speechSynthesis.pending;
      if (isSpeakingOrPending) {
        window.speechSynthesis.cancel();
      }
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const executeSpeak = () => {
        if (requestId && requestId !== currentSpeechRequestId) {
          if (onDone) {
            try { onDone(); } catch {}
          }
          return;
        }
        if (!globalSoundEnabled) {
          if (onDone) {
            try { onDone(); } catch {}
          }
          return;
        }

        let voices = cachedWebVoices;
        if (!voices || voices.length === 0) {
          voices = window.speechSynthesis.getVoices();
          if (voices && voices.length > 0) cachedWebVoices = voices;
        }

        const cacheKey = `${lang}:${currentVoiceGender}`;
        let selectedVoice = voiceCache.get(cacheKey) || null;
        if (!selectedVoice && voices && voices.length > 0) {
          selectedVoice = selectBestVoice(voices, lang, currentVoiceGender);
          if (selectedVoice) {
            voiceCache.set(cacheKey, selectedVoice);
          }
        }

        let finalText = text;
        let targetLocale = this.getLanguageLocale(lang);

        if (selectedVoice) {
          const vName = (selectedVoice.name || '').toLowerCase();
          const vLang = (selectedVoice.lang || '').toLowerCase();

          if (lang === 'gu') {
            if (vLang.startsWith('gu') || vName.includes('gujarati')) {
              targetLocale = selectedVoice.lang || 'gu-IN';
              finalText = text;
            } else {
              // High quality Hindi/Indian natural voice fallback (Microsoft Madhur/Swara or Google Hindi)
              targetLocale = selectedVoice.lang || 'hi-IN';
              finalText = gujaratiToDevanagari(text);
            }
          } else if (lang === 'hi') {
            targetLocale = selectedVoice.lang || 'hi-IN';
            finalText = text;
          } else {
            targetLocale = selectedVoice.lang || 'en-US';
            finalText = text;
          }
        } else {
          // If voices list is not ready yet, prepare safe transliteration for Indian text
          if (lang === 'gu') {
            finalText = gujaratiToDevanagari(text);
            targetLocale = 'hi-IN';
          }
        }

        const utterance = new SpeechSynthesisUtterance(finalText);
        activeUtterance = utterance;
        if (typeof window !== 'undefined') {
          (window as any).__activeUtterance = utterance;
          (window as any).__kidsUtterance = utterance;
        }

        if (selectedVoice) {
          const vLang = (selectedVoice.lang || '').toLowerCase();
          const vName = (selectedVoice.name || '').toLowerCase();
          const isIndianLang = lang === 'gu' || lang === 'hi';
          const isVoiceIndian =
            vLang.startsWith('gu') ||
            vLang.startsWith('hi') ||
            vName.includes('gujarati') ||
            vName.includes('hindi') ||
            vName.includes('हिन्दी');

          if (!isIndianLang || isVoiceIndian) {
            utterance.voice = selectedVoice;
            utterance.lang = selectedVoice.lang || targetLocale;
          } else {
            utterance.lang = targetLocale;
          }
        } else {
          utterance.lang = targetLocale;
        }

        // Language-calibrated natural pitch and storytelling pace for kids
        const voiceIsActuallyMale = selectedVoice ? isMaleVoiceName(selectedVoice.name || '') : false;
        const speechPitch = getCalibratedPitch(currentVoiceGender, currentVoicePitch, voiceIsActuallyMale);
        const speechRate = this.getEffectiveSpeechRate(lang);

        utterance.pitch = speechPitch;
        utterance.rate = speechRate;
        utterance.volume = 1.0;

        utterance.onstart = () => {
          emitSpeechStart();
        };

        utterance.onboundary = (event: any) => {
          if (event?.name && event.name !== 'word') {
            return;
          }
          const charIndex = typeof event?.charIndex === 'number' ? event.charIndex : 0;
          const charLength = typeof event?.charLength === 'number' ? event.charLength : undefined;

          let targetWordIndex: number | undefined;
          if (sentenceContext) {
            let localIdx = 0;
            let runningChar = 0;
            const words = text.match(/\S+/g) || [];
            for (let i = 0; i < words.length; i++) {
              const wStart = text.indexOf(words[i], runningChar);
              const wEnd = wStart >= 0 ? wStart + words[i].length : runningChar + words[i].length;
              runningChar = wEnd;
              if (charIndex >= wStart && charIndex <= wEnd) {
                localIdx = i;
                break;
              }
            }
            targetWordIndex = sentenceContext.startWordIndex + localIdx;
          }

          emitWordBoundary({
            wordIndex: targetWordIndex,
            charIndex: sentenceContext?.startChar !== undefined ? sentenceContext.startChar + charIndex : charIndex,
            charLength,
            progress: finalText.length > 0 ? charIndex / finalText.length : 0,
            sessionId: requestId || currentSpeechRequestId,
          });
        };

        let hasUtteranceEnded = false;
        const finishUtteranceOnce = () => {
          if (hasUtteranceEnded) return;
          hasUtteranceEnded = true;
          if (requestId === currentSpeechRequestId) {
            emitSpeechEnd();
            if (onDone) {
              try {
                onDone();
              } catch {}
            }
          }
        };

        utterance.onend = () => {
          if (activeUtterance === utterance) {
            activeUtterance = null;
            if (typeof window !== 'undefined') {
              (window as any).__activeUtterance = null;
            }
          }
          finishUtteranceOnce();
        };

        utterance.onerror = (e) => {
          // 'interrupted' / 'canceled' are expected whenever speech is stopped on purpose
          // (navigation, a new line replacing the old one); only log real failures.
          const code = (e as SpeechSynthesisErrorEvent)?.error;
          if (code !== 'interrupted' && code !== 'canceled') {
            console.log('Web speech error:', e);
            if (code === 'language-unavailable' || code === 'voice-unavailable' || code === 'not-allowed' || code === 'network') {
              if (activeUtterance === utterance) {
                activeUtterance = null;
                if (typeof window !== 'undefined') {
                  (window as any).__activeUtterance = null;
                }
              }
              this.speakWebNativeAudio(text, lang, requestId || currentSpeechRequestId, onDone);
              return;
            }
          }
          if (activeUtterance === utterance) {
            activeUtterance = null;
            if (typeof window !== 'undefined') {
              (window as any).__activeUtterance = null;
            }
          }
          finishUtteranceOnce();
        };

        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.speak(utterance);
      };

      // Zero-latency path: If no audio is currently speaking, execute immediately in current user gesture tick
      if (!isSpeakingOrPending) {
        executeSpeak();
      } else {
        // Cancel flush via microtask rather than 15ms macrotask to preserve click activation
        Promise.resolve().then(executeSpeak);
      }
    } catch (err) {
      console.log('Web speech synthesis error:', err);
      if (onDone) {
        try {
          onDone();
        } catch {}
      }
    }
  },

  stopInternal(emitEnd: boolean = true): void {
    try {
      if (activeWebAudioList && activeWebAudioList.length > 0) {
        activeWebAudioList.forEach((audioItem) => {
          try {
            audioItem.pause();
            audioItem.currentTime = 0;
            audioItem.src = '';
            if (typeof audioItem.load === 'function') audioItem.load();
          } catch {}
        });
        activeWebAudioList = [];
      }
      if (activeWebAudio) {
        try {
          activeWebAudio.pause();
          activeWebAudio.currentTime = 0;
          activeWebAudio.src = '';
          if (typeof activeWebAudio.load === 'function') activeWebAudio.load();
        } catch {}
        activeWebAudio = null;
      }
      if (activeNativeAudio) {
        try {
          if (typeof activeNativeAudio.pause === 'function') activeNativeAudio.pause();
          if (typeof activeNativeAudio.stopAsync === 'function') activeNativeAudio.stopAsync();
          if (typeof activeNativeAudio.unloadAsync === 'function') activeNativeAudio.unloadAsync();
          if (typeof activeNativeAudio.remove === 'function') activeNativeAudio.remove();
        } catch {}
        activeNativeAudio = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        activeUtterance = null;
      }
      try {
        const stopRes = Speech.stop();
        if (stopRes && typeof stopRes.catch === 'function') {
          stopRes.catch(() => {});
        }
      } catch {}
      if (emitEnd) {
        emitSpeechEnd();
      }
    } catch {}
  },

  async stop(): Promise<void> {
    currentSpeechRequestId++;
    this.stopInternal(true);
  },

  /**
   * Pauses active narration and freezes the current highlighted word in place.
   */
  pause(): void {
    if (activeWebAudio && !activeWebAudio.paused) {
      try {
        activeWebAudio.pause();
      } catch {}
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
        }
      } catch {}
    }
    try {
      if (typeof (Speech as any).pause === 'function') {
        (Speech as any).pause();
      }
    } catch {}
  },

  /**
   * Resumes active narration from the exact current audio position.
   */
  resume(): void {
    if (activeWebAudio && activeWebAudio.paused) {
      try {
        activeWebAudio.play().catch(() => {});
      } catch {}
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch {}
    }
    try {
      if (typeof (Speech as any).resume === 'function') {
        (Speech as any).resume();
      }
    } catch {}
  },

  /**
   * Returns true if narration is currently paused.
   */
  isPaused(): boolean {
    if (activeWebAudio) return activeWebAudio.paused;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) return window.speechSynthesis.paused;
    return false;
  },

  /**
   * Pre-warms the SpeechSynthesis / audio subsystem for zero initial latency.
   */
  prewarmEngine(): void {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (cachedWebVoices.length === 0) {
          try {
            cachedWebVoices = window.speechSynthesis.getVoices();
          } catch {}
        }
        // Silent instant utterance to awaken browser audio subsystem
        const silentUtterance = new SpeechSynthesisUtterance(' ');
        silentUtterance.volume = 0;
        window.speechSynthesis.speak(silentUtterance);
      }
    } catch {}
  },

  /**
   * 100% Audio-Driven Story Narration Engine.
   * Splits story scene text into natural sentences and speaks them sequentially.
   * - On Web: Streams high-fidelity Indic MP3 audio via Audio element, mapping real hardware
   *   currentTime to exact word timestamps without race conditions or dropped boundary events.
   * - On Native Mobile: Speaks sentence-by-sentence with native onDone lifecycle synchronization,
   *   calibrating real speaker latency (~450ms on Android) and completely eliminating inter-sentence drift.
   */
  async narrateStory(
    text: string,
    lang: AppLanguage = 'gu',
    onDone?: () => void
  ): Promise<void> {
    if (!globalSoundEnabled || !text) {
      if (onDone) try { onDone(); } catch {}
      return;
    }

    this.stopInternal(false);
    const requestId = ++currentSpeechRequestId;

    const effectiveLang = detectContentLanguage(text, lang);

    // 1. Compute exact global word spans
    const wordRegex = /\S+/g;
    let match: RegExpExecArray | null;
    const globalWordSpans: { word: string; start: number; end: number }[] = [];
    while ((match = wordRegex.exec(text)) !== null) {
      globalWordSpans.push({
        word: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    if (globalWordSpans.length === 0) {
      if (onDone) try { onDone(); } catch {}
      return;
    }

    // 2. Split into sentences preserving word boundaries
    const sentenceRegex = /[^।!?.\n]+[।!?.\n]*/g;
    const rawSentences = text.match(sentenceRegex) || [text];
    interface StorySentence {
      text: string;
      cleanText: string;
      words: string[];
      startWordIndex: number;
      endWordIndex: number;
      startChar: number;
      endChar: number;
    }

    const sentences: StorySentence[] = [];
    let wordPointer = 0;
    for (const rawS of rawSentences) {
      const sWords = rawS.match(/\S+/g) || [];
      if (sWords.length === 0) continue;
      const sStartChar = globalWordSpans[wordPointer]?.start ?? 0;
      const sEndChar = globalWordSpans[wordPointer + sWords.length - 1]?.end ?? (sStartChar + rawS.length);
      sentences.push({
        text: rawS.trim(),
        cleanText: normalizeSpeechText(rawS.trim(), effectiveLang),
        words: sWords,
        startWordIndex: wordPointer,
        endWordIndex: wordPointer + sWords.length,
        startChar: sStartChar,
        endChar: sEndChar,
      });
      wordPointer += sWords.length;
    }

    if (sentences.length === 0) {
      if (onDone) try { onDone(); } catch {}
      return;
    }

    let sentenceIdx = 0;
    let isTerminated = false;

    const finishNarration = () => {
      if (isTerminated) return;
      isTerminated = true;
      if (requestId === currentSpeechRequestId) {
        emitSpeechEnd();
        if (onDone) try { onDone(); } catch {}
      }
    };

    const effectiveRate = this.getEffectiveSpeechRate(effectiveLang);

    // Sentence execution loop
    const playSentence = async () => {
      if (isTerminated || requestId !== currentSpeechRequestId || !globalSoundEnabled) {
        finishNarration();
        return;
      }

      if (sentenceIdx >= sentences.length) {
        finishNarration();
        return;
      }

      const s = sentences[sentenceIdx];

      // --- PATH A: WEB BROWSER (Audio Element streaming from backend proxy / Google TTS) ---
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const apiBase = safeGetApiBaseUrl();
        const proxyUrl = apiBase
          ? `${apiBase}/tts/audio.mp3?lang=${encodeURIComponent(effectiveLang)}&text=${encodeURIComponent(s.cleanText)}`
          : null;
        const directUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(effectiveLang)}&q=${encodeURIComponent(s.cleanText)}`;
        const targetUrl = proxyUrl || directUrl;

        let audio: HTMLAudioElement | null = null;
        try {
          audio = new Audio(targetUrl);
        } catch {
          audio = null;
        }

        if (!audio) {
          // Fallback to web synthesis for this sentence if Audio construction fails
          this.speakWebSynthesis(s.cleanText, effectiveLang, requestId, () => {
            sentenceIdx++;
            setTimeout(playSentence, 220);
          }, {
            startWordIndex: s.startWordIndex,
            totalGlobalWords: globalWordSpans.length,
            startChar: s.startChar,
          });
          return;
        }

        activeWebAudio = audio;
        audio.playbackRate = effectiveRate;
        try {
          (audio as any).preservesPitch = true;
        } catch {}

        let timings: WordTiming[] = [];
        let lastReportedIdx = -1;
        let currentSentenceMaxReportedIdx = -1;
        let trackInterval: any = null;

        const ensureTimings = () => {
          if (audio && audio.duration && audio.duration > 0 && !isNaN(audio.duration) && isFinite(audio.duration)) {
            timings = buildWordTimings(s.text, audio.duration, effectiveLang);
          } else if (timings.length === 0) {
            const secondsPerUnit = 0.36 / Math.max(0.75, effectiveRate);
            timings = buildWordTimings(s.text, 0, effectiveLang, secondsPerUnit);
          }
        };

        // Initialize default timings immediately so tracking never halts
        ensureTimings();

        const updatePosition = () => {
          if (isTerminated || requestId !== currentSpeechRequestId || !activeWebAudio || activeWebAudio !== audio) {
            if (trackInterval) clearInterval(trackInterval);
            return;
          }
          ensureTimings();
          if (timings.length === 0) return;

          const t = audio.currentTime;
          for (let i = 0; i < timings.length; i++) {
            const item = timings[i];
            const isLast = i === timings.length - 1;
            if (t >= item.startTime && (isLast || t < item.endTime + item.pauseAfter)) {
              if (i !== lastReportedIdx) {
                lastReportedIdx = i;
                const globalIdx = s.startWordIndex + i;
                if (globalIdx < globalWordSpans.length && globalIdx >= currentSentenceMaxReportedIdx) {
                  currentSentenceMaxReportedIdx = globalIdx;
                  emitWordBoundary({
                    wordIndex: globalIdx,
                    charIndex: globalWordSpans[globalIdx].start,
                    charLength: globalWordSpans[globalIdx].end - globalWordSpans[globalIdx].start,
                    progress: globalIdx / globalWordSpans.length,
                    sessionId: requestId,
                  });
                }
              }
              break;
            }
          }
        };

        audio.onloadedmetadata = ensureTimings;
        audio.ondurationchange = ensureTimings;
        audio.ontimeupdate = updatePosition;

        audio.onplay = () => {
          if (sentenceIdx === 0) emitSpeechStart();
          ensureTimings();
          updatePosition();
          if (trackInterval) clearInterval(trackInterval);
          trackInterval = setInterval(updatePosition, 20);

          // Preload upcoming sentence audio in background to eliminate transition latency
          if (sentenceIdx + 1 < sentences.length) {
            const nextS = sentences[sentenceIdx + 1];
            const nextProxyUrl = apiBase
              ? `${apiBase}/tts/audio.mp3?lang=${encodeURIComponent(effectiveLang)}&text=${encodeURIComponent(nextS.cleanText)}`
              : null;
            const nextDirectUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(effectiveLang)}&q=${encodeURIComponent(nextS.cleanText)}`;
            try {
              const preloader = new Audio(nextProxyUrl || nextDirectUrl);
              preloader.preload = 'auto';
            } catch {}
          }
        };

        audio.onpause = () => {
          if (trackInterval) clearInterval(trackInterval);
        };

        const onSentenceFinish = () => {
          if (trackInterval) clearInterval(trackInterval);
          if (activeWebAudio === audio) activeWebAudio = null;
          // Ensure final word of sentence was marked
          const lastGlobalIdx = s.endWordIndex - 1;
          if (lastGlobalIdx < globalWordSpans.length) {
            emitWordBoundary({
              wordIndex: lastGlobalIdx,
              charIndex: globalWordSpans[lastGlobalIdx].start,
              charLength: globalWordSpans[lastGlobalIdx].end - globalWordSpans[lastGlobalIdx].start,
              progress: lastGlobalIdx / globalWordSpans.length,
              sessionId: requestId,
            });
          }
          sentenceIdx++;
          // Natural storytelling breath break before next sentence
          setTimeout(playSentence, 220);
        };

        audio.onended = onSentenceFinish;

        audio.onerror = () => {
          if (trackInterval) clearInterval(trackInterval);
          // Try direct URL if proxy failed
          if (proxyUrl && audio && audio.src === proxyUrl && directUrl) {
            audio.src = directUrl;
            audio.play().catch(() => {
              this.speakWebSynthesis(s.cleanText, effectiveLang, requestId, () => {
                sentenceIdx++;
                setTimeout(playSentence, 220);
              }, {
                startWordIndex: s.startWordIndex,
                totalGlobalWords: globalWordSpans.length,
                startChar: s.startChar,
              });
            });
            return;
          }
          this.speakWebSynthesis(s.cleanText, effectiveLang, requestId, () => {
            sentenceIdx++;
            setTimeout(playSentence, 220);
          }, {
            startWordIndex: s.startWordIndex,
            totalGlobalWords: globalWordSpans.length,
            startChar: s.startChar,
          });
        };

        audio.play().catch((err) => {
          console.log('[AudioService] audio.play() caught:', err);
          this.speakWebSynthesis(s.cleanText, effectiveLang, requestId, () => {
            sentenceIdx++;
            setTimeout(playSentence, 220);
          }, {
            startWordIndex: s.startWordIndex,
            totalGlobalWords: globalWordSpans.length,
            startChar: s.startChar,
          });
        });

        return;
      }

      // --- PATH B: NATIVE MOBILE (Sentence-by-sentence via Speech.speak with verified onDone) ---
      const voices =
        isNativeVoicesLoaded && cachedNativeVoices.length > 0
          ? cachedNativeVoices
          : await this.loadNativeVoices();

      const bestVoice = selectBestVoice(voices || [], effectiveLang, currentVoiceGender);
      const selectedVoiceIdentifier = (bestVoice as any)?.identifier || undefined;
      const rawLocale = (bestVoice as any)?.lang || bestVoice?.language || this.getLanguageLocale(effectiveLang);
      const targetLocale = Platform.OS === 'android' ? String(rawLocale).split('-')[0] : rawLocale;
      const voiceIsActuallyMale = bestVoice ? isMaleVoiceName((bestVoice as any).name || (bestVoice as any).identifier || '') : false;
      const speechPitch = getCalibratedPitch(currentVoiceGender, currentVoicePitch, voiceIsActuallyMale);
      const speechRate = effectiveRate;

      let sentenceTrackInterval: any = null;
      let mobileLastReported = -1;
      let mobileMaxReportedIdx = -1;

      const clearSentenceTimer = () => {
        if (sentenceTrackInterval) { clearInterval(sentenceTrackInterval); sentenceTrackInterval = null; }
      };

      // Syllable-calibrated word timings for this sentence with natural speech cadence
      // Calibrated to real Google TTS / Indic speech tempo (~0.32s per syllable at 1.0x rate)
      const secondsPerUnit = (effectiveLang === 'en' ? 0.35 : 0.32) / Math.max(0.72, speechRate);
      const timings = buildWordTimings(s.text, 0, effectiveLang, secondsPerUnit);

      const updateMobilePosition = (elapsedSeconds: number) => {
        if (requestId !== currentSpeechRequestId || isTerminated) {
          clearSentenceTimer();
          return;
        }
        for (let i = 0; i < timings.length; i++) {
          const item = timings[i];
          const isLast = i === timings.length - 1;
          if (elapsedSeconds >= item.startTime && (isLast || elapsedSeconds < item.endTime + item.pauseAfter)) {
            if (i !== mobileLastReported) {
              mobileLastReported = i;
              const globalIdx = s.startWordIndex + i;
              if (globalIdx < globalWordSpans.length && globalIdx >= mobileMaxReportedIdx) {
                mobileMaxReportedIdx = globalIdx;
                emitWordBoundary({
                  wordIndex: globalIdx,
                  charIndex: globalWordSpans[globalIdx].start,
                  charLength: globalWordSpans[globalIdx].end - globalWordSpans[globalIdx].start,
                  progress: globalIdx / globalWordSpans.length,
                  sessionId: requestId,
                });
              }
            }
            break;
          }
        }
      };

      // Android SpeechModule.kt passes options.language to Locale.Builder().setLanguage(it),
      // which throws IllformedLocaleException for hyphenated tags like "hi-IN" / "gu-IN".
      const nativeLocale = Platform.OS === 'android' ? targetLocale.split('-')[0] : targetLocale;

      const speechOptions: Speech.SpeechOptions = {
        language: nativeLocale,
        pitch: speechPitch,
        rate: speechRate,
        voice: selectedVoiceIdentifier,
        onStart: () => {
          if (requestId !== currentSpeechRequestId || isTerminated) return;
          if (sentenceIdx === 0) emitSpeechStart();

          // Compensate for Android/iOS native speech synthesizer audio pipeline delay (~240ms on Android)
          const hardwareLatencyMs = Platform.OS === 'android' ? 240 : Platform.OS === 'ios' ? 80 : 0;
          const startTimestamp = Date.now() + hardwareLatencyMs;

          if (hardwareLatencyMs > 0) {
            setTimeout(() => {
              if (requestId === currentSpeechRequestId && !isTerminated) {
                updateMobilePosition(0);
              }
            }, hardwareLatencyMs);
          } else {
            updateMobilePosition(0);
          }

          sentenceTrackInterval = setInterval(() => {
            const elapsed = Math.max(0, (Date.now() - startTimestamp) / 1000);
            updateMobilePosition(elapsed);
          }, 20);
        },
        onBoundary: (event: any) => {
          if (requestId !== currentSpeechRequestId || isTerminated) return;
          const charIndex = typeof event?.charIndex === 'number' ? event.charIndex : -1;
          if (charIndex >= 0) {
            let localWordIdx = 0;
            for (let i = 0; i < timings.length; i++) {
              if (charIndex >= timings[i].startChar && charIndex <= timings[i].endChar) {
                localWordIdx = i;
                break;
              }
            }
            const globalIdx = s.startWordIndex + localWordIdx;
            if (globalIdx < globalWordSpans.length && globalIdx >= mobileMaxReportedIdx) {
              mobileMaxReportedIdx = globalIdx;
              emitWordBoundary({
                wordIndex: globalIdx,
                charIndex: globalWordSpans[globalIdx].start,
                charLength: globalWordSpans[globalIdx].end - globalWordSpans[globalIdx].start,
                progress: globalIdx / globalWordSpans.length,
                sessionId: requestId,
              });
            }
          }
        },
        onDone: () => {
          clearSentenceTimer();
          if (requestId !== currentSpeechRequestId || isTerminated) return;
          // Sentence is 100% finished on mobile hardware!
          const lastGlobalIdx = s.endWordIndex - 1;
          if (lastGlobalIdx < globalWordSpans.length) {
            emitWordBoundary({
              wordIndex: lastGlobalIdx,
              charIndex: globalWordSpans[lastGlobalIdx].start,
              charLength: globalWordSpans[lastGlobalIdx].end - globalWordSpans[lastGlobalIdx].start,
              progress: lastGlobalIdx / globalWordSpans.length,
              sessionId: requestId,
            });
          }
          sentenceIdx++;
          setTimeout(playSentence, 220);
        },
        onStopped: () => {
          clearSentenceTimer();
        },
        onError: (err) => {
          clearSentenceTimer();
          console.log('[AudioService] Mobile sentence speech error:', err);
          sentenceIdx++;
          setTimeout(playSentence, 150);
        },
      };

      try {
        Speech.speak(s.cleanText, speechOptions);
      } catch (e) {
        console.log('[AudioService] Speech.speak threw:', e);
        sentenceIdx++;
        setTimeout(playSentence, 150);
      }
    };

    // Begin first sentence
    playSentence();
  },

  /**
   * Pre-resolves text and caches speech utterances for the next upcoming cards.
   */
  preloadSpeech(text: string, lang: AppLanguage = 'en'): void {
    try {
      if (!text || typeof text !== 'string') return;
      const detectedLang = detectContentLanguage(text, lang);
      normalizeSpeechText(text, detectedLang);
      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (cachedWebVoices.length === 0) {
          cachedWebVoices = window.speechSynthesis.getVoices();
        }
      }
    } catch {}
  },

  /**
   * Speaks joyful, child-friendly congratulatory celebration praises
   * in Gujarati, Hindi, or English.
   */
  async speakCelebration(lang: AppLanguage = 'en'): Promise<void> {
    const celebrationPhrases: Record<AppLanguage, string[]> = {
      gu: [
        'શાબાશ! ખૂબ સરસ!',
        'અરે વાહ! તમે કરી બતાવ્યું!',
        'અદ્ભુત! તમે સુપર સ્ટાર છો!',
      ],
      hi: [
        'शाबाश! बहुत बढ़िया!',
        'अरे वाह! कमाल कर दिया!',
        'अद्भुत! आप सुपर स्टार हैं!',
      ],
      en: [
        'Awesome! Great job!',
        'Hooray! You did it!',
        'Super star! Fantastic work!',
      ],
    };
    const list = celebrationPhrases[lang] || celebrationPhrases.en;
    const phrase = list[Math.floor(Math.random() * list.length)];
    await this.speak(phrase, lang);
  },
};
