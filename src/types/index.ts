export type AppLanguage = 'gu' | 'en' | 'hi';

export type AgeGroup = '2-4' | '4-6' | '6-8';

export type CategoryId =
  | 'gu-varnamala'
  | 'gu-barakhadi'
  | 'en-alphabet'
  | 'en-phonics'
  | 'hi-varnamala'
  | 'numbers'
  | 'math'
  | 'ghadiya'
  | 'colors-shapes'
  | 'animals'
  | 'fruits'
  | 'objects'
  | 'gk'
  | 'games'
  // Science Categories
  | 'plants-nature'
  | 'human-body'
  | 'water-air'
  | 'weather-seasons'
  | 'earth-environment'
  | 'space-solar'
  | 'scientific-discoveries'
  // English Categories
  | 'en-vowels'
  | 'en-words'
  | 'en-grammar'
  | 'en-nouns'
  | 'en-verbs'
  | 'en-sentences'
  // GK Categories
  | 'gk-states'
  | 'gk-countries'
  | 'gk-monuments'
  | 'gk-history'
  | 'gk-geography'
  | 'gk-vehicles'
  | 'gk-personalities'
  | 'gk-inventions'
  | 'gk-symbols'
  | 'gk-sports'
  // Math Categories
  | 'math-time'
  | 'math-money'
  | 'math-missing'
  | 'math-word-problems'
  | (string & {});

export interface CategoryInfo {
  id: CategoryId;
  titleKey: string;
  subtitleKey?: string;
  defaultTitle: string;
  subtitle: string;
  iconName: string;
  bgColor: string;
  minAge: AgeGroup;
}

export interface LessonItem {
  id: string;
  categoryId: CategoryId;
  language: AppLanguage | 'all';
  ageGroup: AgeGroup | 'all';
  symbol: string;
  title: string;
  subtitle?: string;
  phonetic?: string;
  exampleWord?: string;
  exampleMeaning?: string;
  exampleMeaningGu?: string;
  exampleMeaningHi?: string;
  audioPrompt: string;
  audioPromptGu?: string;
  audioPromptHi?: string;
  audioPromptEn?: string;
  visualColor?: string;
  illustrationType?: 'letter' | 'number' | 'shape' | 'fruit' | 'animal' | 'object' | 'math';
  countItems?: number;
  imageUrl?: string;
  /** Backend Lesson.example_image as an absolute URL (may be a 3D render under /media/characters/). */
  exampleImage?: string;
  subType?: 'animal' | 'bird' | 'vyanjan' | 'swar' | string;
  soundKey?: string;
  audioUrl?: string;
  /** Backend-only extras (LessonSerializer.tracing_path / words / rhyme_text / lesson_data). */
  tracingPath?: unknown;
  words?: unknown;
  rhyme?: string;
  lessonData?: import('./api').BackendLessonData;
}

export type GameType =
  | 'find-letter'
  | 'picture-matching'
  | 'counting'
  | 'memory-match'
  | 'missing-letter'
  | 'colors-shapes'
  | 'listen-choose'
  | 'balloon-pop'
  | 'math-quiz'
  | 'picture-puzzle'
  | 'find-object'
  | 'logic-reasoning'
  | 'odd-one-out';

export interface GameOption {
  id: string;
  label: string;
  visual?: string;
  color?: string;
  image?: string;
}

export interface GameQuestion {
  id: string;
  gameType: GameType;
  prompt: string;
  audioText: string;
  displayVisual?: string;
  displayVisualColor?: string;
  displayImage?: string;
  displayImageSource?: import('react-native').ImageSourcePropType;
  countTarget?: number;
  options: GameOption[];
  correctOptionId: string;
  hint?: string;
  /** Present on questions served by the backend. */
  ageGroup?: string;
  explanation?: string;
  image?: string;
  audio?: string;
}

export interface UserPreferences {
  language: AppLanguage;
  ageGroup: AgeGroup;
  soundEnabled: boolean;
  hasCompletedOnboarding: boolean;
  selectedClass?: string;
  isGuest?: boolean;
}

export interface BadgeItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  earnedAt?: string;
}

export interface GardenPlant {
  id: string;
  nameGu: string;
  nameHi?: string;
  nameEn: string;
  icon: string;
  stage: number; // 0: seed, 1: sprout, 2: blooming, 3: ripe fruit
  maxStage: number;
}

export interface UserProgress {
  childName?: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  hasCompletedFirstTimeName?: boolean;
  favoriteColor?: string;
  streakDays?: number;
  lastStreakDate?: string;
  completedLessons: string[];
  stars: number;
  coins: number;
  /**
   * Lifetime coins spent on this device's purchases. Sent on every sync so the server can deduct
   * spending exactly once (a plain max(server, local) merge refunded every purchase).
   */
  coinsSpentTotal?: number;
  seeds: number;
  water: number;
  adventureLevel: number;
  earnedBadges: string[];
  gameStats: Record<string, { highScore: number; timesPlayed: number }>;
  lastActive: string;
  lastSpinDate?: string;
  lastMysteryClaimDate?: string;
  /** Date key (YYYY-MM-DD) the Daily Missions treasure chest was last opened. */
  lastMissionChestDate?: string;
  mysteryRewardsClaimedCount?: number;
  gardenPlants: GardenPlant[];
  currentAvatar: {
    character: string;
    hat?: string;
    accessory?: string;
  };
  unlockedAvatarItems: string[];
  unlockedStickers?: string[];
  placedStickers?: Array<{
    id: string;
    stickerId: string;
    x: number;
    y: number;
  }>;
  wrongAnswers: Array<{
    id: string;
    prompt: string;
    correctOption: string;
    hint?: string;
    language?: AppLanguage;
  }>;
}

export interface ChildProfile {
  id: number;
  nickname: string;
  age_group: AgeGroup;
  created_at?: string;
  avatar?: string;
  /** True while the profile only exists locally and is queued in the profile outbox. */
  pendingSync?: boolean;
}

export interface AuthUser {
  id: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  date_joined?: string;
  child_profiles?: ChildProfile[];
}

export interface RegisterPayload {
  username: string;
  password: string;
  email?: string;
  parent_name?: string;
  child_nickname?: string;
  child_age_group?: AgeGroup;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  token?: string;
  user?: AuthUser;
  error?: string;
  message?: string;
}

export interface SessionData {
  token: string;
  user: AuthUser;
  createdAt: string;
  lastActiveAt: string;
  isActive: boolean;
}
