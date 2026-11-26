import { AppLanguage } from '../types';

/**
 * Standardized wrong-answer spoken prompt used uniformly across all quizzes and games.
 * Speaks only "Try again!" in the active language without extra distracting phrases.
 */
export function getTryAgainSpeech(language: AppLanguage): string {
  if (language === 'gu') return 'ફરીથી પ્રયત્ન કરો!';
  if (language === 'hi') return 'फिर से कोशिश करें!';
  return 'Try again!';
}

