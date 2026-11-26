/**
 * Wire types for the Django REST API (each app's serializers.py under backend/) and the cloud-sync contract
 * (backend/progress/views.py:CloudSyncView). These describe what the server SENDS; mapping into
 * the app's own types (LessonItem, StoryBook, ...) happens in src/services/apiService.ts.
 *
 * Every field the client does not strictly need is optional: older servers and partially
 * filled rows must never crash a mapper.
 */
import type { AgeGroup, GameOption } from './index';
import type { StoryChoice } from '../data/storiesData';

/** DRF list endpoints return either a bare array or a paginated `{ results }` envelope. */
export type ListResponse<T> = T[] | { results?: T[] | null; count?: number };

/** Extracts the rows from a list response of unknown shape (never throws). */
export function listFrom<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && Array.isArray((data as { results?: unknown }).results)) {
    return (data as { results: T[] }).results;
  }
  return [];
}

// ---------------------------------------------------------------------------------- lessons

/** Free-form JSON stored in Lesson.lesson_data (bundled-lesson extras round-tripped). */
export interface BackendLessonData {
  exampleMeaningGu?: string;
  exampleMeaningHi?: string;
  imageUrl?: string;
  audioPromptGu?: string;
  audioPromptHi?: string;
  audioPromptEn?: string;
  subType?: string;
  soundKey?: string;
  audioUrl?: string;
  [key: string]: unknown;
}

export interface BackendLesson {
  id?: number | string;
  stable_id?: string | null;
  title: string;
  category: string;
  language?: string;
  age_group?: string;
  difficulty?: number;
  symbol?: string | null;
  subtitle?: string | null;
  phonetic?: string | null;
  example_word?: string | null;
  example_meaning?: string | null;
  example_image?: string | null;
  audio_prompt?: string | null;
  visual_color?: string | null;
  tracing_path?: unknown;
  words?: unknown;
  rhyme_text?: string | null;
  lesson_data?: BackendLessonData | null;
  order?: number;
  is_active?: boolean;
}

export interface BackendCategory {
  slug: string;
  title: string;
  title_gujarati?: string;
  title_hindi?: string;
  icon?: string;
  color?: string;
  gradient_start?: string;
  gradient_end?: string;
  description?: string;
  order?: number;
  is_active?: boolean;
}

// ---------------------------------------------------------------------------------- stories

export interface BackendStoryScene {
  scene_number?: number;
  text_english?: string;
  text_gujarati?: string;
  text_hindi?: string;
  illustration?: string | null;
  audio_prompt?: string;
  /** Either a list of choices (first one is used) or a single choice object. */
  choices?: StoryChoice[] | StoryChoice | null;
}

export interface BackendStory {
  id?: number;
  slug?: string;
  title: string;
  title_gujarati?: string;
  title_hindi?: string;
  category?: string;
  moral?: string;
  moral_gujarati?: string;
  moral_hindi?: string;
  cover_image?: string | null;
  reading_time_mins?: number;
  age_group?: string;
  order?: number;
  is_active?: boolean;
  scenes?: BackendStoryScene[];
}

// -------------------------------------------------------------------------------- questions

export interface BackendGameQuestion {
  id: number | string;
  stable_id?: string | null;
  category?: string;
  language?: string;
  age_group?: string;
  question_text?: string;
  question_type?: string;
  audio_text?: string | null;
  display_visual?: string | null;
  count_target?: number | null;
  options?: GameOption[] | null;
  correct_option_id?: string | number | null;
  /** Legacy servers sent the answer under this name. */
  correct_answer?: string | number | null;
  explanation?: string | null;
  hint?: string | null;
  image?: string | null;
  audio?: string | null;
  difficulty?: number;
  points?: number;
}

export interface QuestionSubmitResult {
  question_id: string | number;
  is_correct: boolean;
  correct_answer: string;
  explanation?: string | null;
  points_awarded: number;
}

// ----------------------------------------------------------------------------- gamification

export interface BackendBadge {
  slug: string;
  title?: string;
  name_gu?: string;
  name_hi?: string;
  name_en?: string;
  description?: string;
  desc_gu?: string;
  desc_hi?: string;
  desc_en?: string;
  req_gu?: string;
  req_hi?: string;
  req_en?: string;
  icon?: string;
  reward_coins?: number;
  category?: string;
  requirement_type?: string;
  requirement_value?: number;
  order?: number;
  is_active?: boolean;
}

export interface BackendAdventureLevel {
  level_number: number;
  world_name?: string;
  title?: string;
  required_stars?: number;
  reward_coins?: number;
  reward_stars?: number;
  questions_data?: unknown;
  is_active?: boolean;
}

export interface BackendColoringTemplate {
  slug: string;
  title?: string;
  name_gu?: string;
  name_hi?: string;
  name_en?: string;
  category?: string;
  svg_path?: string;
  view_box?: string;
  thumbnail?: string | null;
  difficulty?: number;
  default_color?: string;
  palette?: string[];
  order?: number;
  is_active?: boolean;
}

// --------------------------------------------------------------------------------- profiles

export interface BackendChildProfile {
  id: number;
  nickname: string;
  age_group: AgeGroup;
  avatar?: string;
  gender?: string;
  language_preference?: string;
  daily_goal_minutes?: number;
  has_pin?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// ------------------------------------------------------------------------------- cloud sync

export interface CloudSyncLessonItem {
  lesson_id: string;
  completed: boolean;
  stars?: number;
  best_score?: number;
}

/** Request body for POST /api/sync/. */
export interface CloudSyncPayload {
  child_profile_id: number;
  is_reset: boolean;
  adventure_level: number;
  lessons: CloudSyncLessonItem[];
  /** spent_total: lifetime coins spent on the device (idempotent; the server deducts only the new part). */
  wallet: { coins: number; stars: number; spent_total: number };
  streak: { current_streak: number; longest_streak: number; last_active_date?: string };
  avatar: {
    base_avatar: string;
    equipped_hat: string;
    equipped_backpack: string;
    unlocked_items: string[];
  };
  screen_time?: { minutes_used: number };
}

export interface CloudSyncLessonState {
  id?: number;
  child_profile?: number;
  lesson?: number | null;
  lesson_slug: string;
  completed: boolean;
  stars: number;
  best_score: number;
  times_played?: number;
}

/** Response of POST /api/sync/: the authoritative server state after merging. */
export interface CloudSyncResponse {
  status: 'synchronized';
  is_reset?: boolean;
  server_time: string;
  child_profile_id: number;
  adventure_level: number;
  lessons: CloudSyncLessonState[];
  wallet: { total_coins: number; total_stars: number };
  /** Lifetime device spending the server has already deducted. */
  coins_spent_total?: number;
  streak: { current_streak: number; longest_streak: number; last_active_date?: string | null };
  avatar: {
    base_avatar?: string;
    equipped_hat?: string;
    equipped_glasses?: string;
    equipped_outfit?: string;
    equipped_backpack?: string;
    unlocked_items?: string[];
  };
  garden: unknown[];
}

/** POST /api/progress/ (single lesson) request body. */
export interface LessonProgressPayload {
  child_profile: number;
  lesson: string;
  completed: boolean;
  stars?: number;
  best_score?: number;
}

/** POST /api/game-results/ request body. */
export interface GameResultPayload {
  child_profile: number;
  game_type: string;
  score: number;
  total_questions: number;
  time_spent_seconds?: number;
}
