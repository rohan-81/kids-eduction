/**
 * Offline Prompt Audio Map for KidsZone
 * When empty, audioService dynamically streams high-fidelity TTS or utilizes device speech synthesis.
 */

/** Bundled prompt audio: `require()`d module ids (native) or `{ uri }` sources. */
export const PROMPT_AUDIO_MAP: Record<string, number | { uri: string }> = {};

export const WEB_PROMPT_AUDIO_MAP: Record<string, string> = {};
