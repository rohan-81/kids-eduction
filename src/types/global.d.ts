/**
 * Browser APIs used by the web build that TypeScript's DOM lib does not declare: vendor-prefixed
 * constructors (Safari) and the Web Speech recognition API (Chrome/Safari only, not standardised
 * in lib.dom). Declaring them here keeps call sites typed instead of `(window as any)`.
 */
export {};

declare global {
  /** Minimal Web Speech API recognition surface used by KidsMicrophonePractice. */
  interface KidsSpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }

  interface KidsSpeechRecognitionResult {
    readonly length: number;
    readonly isFinal: boolean;
    [index: number]: KidsSpeechRecognitionAlternative;
  }

  interface KidsSpeechRecognitionEvent {
    readonly resultIndex: number;
    readonly results: {
      readonly length: number;
      [index: number]: KidsSpeechRecognitionResult;
    };
  }

  interface KidsSpeechRecognitionErrorEvent {
    readonly error: string;
    readonly message?: string;
  }

  interface KidsSpeechRecognition {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    onresult: ((event: KidsSpeechRecognitionEvent) => void) | null;
    onerror: ((event: KidsSpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    onstart?: (() => void) | null;
    start(): void;
    stop(): void;
    abort(): void;
  }

  type KidsSpeechRecognitionCtor = new () => KidsSpeechRecognition;

  interface Window {
    /** Safari < 14.1 */
    webkitAudioContext?: typeof AudioContext;
    SpeechRecognition?: KidsSpeechRecognitionCtor;
    webkitSpeechRecognition?: KidsSpeechRecognitionCtor;
    /** Keeps the active utterance reachable so Chrome does not garbage-collect it mid-speech. */
    __activeUtterance?: SpeechSynthesisUtterance | null;
    __kidsUtterance?: SpeechSynthesisUtterance | null;
  }
}
