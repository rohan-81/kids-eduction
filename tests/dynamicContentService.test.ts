// Mock AsyncStorage
const mockStorage: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (key: string) => mockStorage[key] || null),
    setItem: jest.fn(async (key: string, value: string) => {
      mockStorage[key] = value;
    }),
    removeItem: jest.fn(async (key: string) => {
      delete mockStorage[key];
    }),
    clear: jest.fn(async () => {
      Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
    }),
  },
}));

import { apiService } from '../src/services/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('Dynamic Content & Model Service', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  test('fetchCategories returns categories and falls back gracefully', async () => {
    const categories = await apiService.fetchCategories();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(5);
    const hasAlphabet = categories.some((c) => c.id === 'en-alphabet' || c.slug === 'en-alphabet');
    expect(hasAlphabet).toBe(true);
  });

  test('fetchLessons returns lessons and filters by category', async () => {
    const lessons = await apiService.fetchLessons('gu', '2-4', 'gu-varnamala');
    expect(Array.isArray(lessons)).toBe(true);
    expect(lessons.length).toBeGreaterThan(0);
    expect(lessons[0]).toHaveProperty('id');
    expect(lessons[0]).toHaveProperty('title');

    // Hindi Varnamala must return all 50 letters (13 swar + 37 vyanjan) even for age 2-4
    const hindiLessons = await apiService.fetchLessons('hi', '2-4', 'hi-varnamala');
    expect(hindiLessons.length).toBe(50);
  });

  test('fetchStories returns all moral stories with scene data', async () => {
    const stories = await apiService.fetchStories('gu');
    expect(Array.isArray(stories)).toBe(true);
    expect(stories.length).toBeGreaterThanOrEqual(2);
    const crowStory = stories.find((s) => s.id === 'story-crow');
    expect(crowStory).toBeDefined();
    expect(crowStory?.scenes.length).toBeGreaterThanOrEqual(4);
    expect(crowStory?.titleGu).toBe('ચતુર કાગડો');
  });

  test('fetchGameQuestions returns questions for find-letter', async () => {
    const questions = await apiService.fetchGameQuestions('find-letter', 'gu', '2-4');
    expect(Array.isArray(questions)).toBe(true);
    expect(questions.length).toBeGreaterThan(0);
    expect(questions[0]).toHaveProperty('options');
    expect(questions[0]).toHaveProperty('correctOptionId');
  });

  test('fetchBadges returns all 8 achievement badges with unlock checks', async () => {
    const badges = await apiService.fetchBadges('gu');
    expect(Array.isArray(badges)).toBe(true);
    expect(badges.length).toBe(8);

    const welcomeBadge = badges.find((b) => b.id === 'badge-welcome');
    expect(welcomeBadge).toBeDefined();
    expect(welcomeBadge?.checkUnlocked({})).toBe(true);

    const firstStepBadge = badges.find((b) => b.id === 'badge-first-step');
    expect(firstStepBadge).toBeDefined();
    expect(firstStepBadge?.checkUnlocked({ completedLessons: ['l-1'] })).toBe(true);
    expect(firstStepBadge?.checkUnlocked({ completedLessons: [] })).toBe(false);
  });

  test('fetchColoringTemplates and fetchAdventureLevels return populated lists', async () => {
    const coloring = await apiService.fetchColoringTemplates();
    expect(Array.isArray(coloring)).toBe(true);
    expect(coloring.length).toBeGreaterThan(0);

    const levels = await apiService.fetchAdventureLevels();
    expect(Array.isArray(levels)).toBe(true);
    expect(levels.length).toBeGreaterThanOrEqual(20);
  });
});
