// "Fun Kingdom" art direction: candy palette tokens and story catalogue metadata
// (reading time / difficulty / category badge are derived from real content).
import { candy, kidBackdrops, kidTones, kidPalette, claySurface, CLAY_DEPTH } from '../src/theme/kidTheme';
import { getStoryReadingMinutes, getStoryDifficulty, getStoryCategoryMeta } from '../src/utils/storyMeta';
import { STORIES_DATA, StoryBook } from '../src/data/storiesData';

const makeStory = (pages: string[], withChoice = false): StoryBook => ({
  id: 'test-story',
  titleGu: 'ટેસ્ટ',
  titleHi: 'टेस्ट',
  titleEn: 'Test',
  coverEmoji: '📖',
  bgColor: '#FFFFFF',
  moralGu: '',
  moralHi: '',
  moralEn: '',
  scenes: pages.map((textEn, i) => ({
    page: i + 1,
    illustration: '⭐',
    textEn,
    textGu: textEn,
    textHi: textEn,
    choice:
      withChoice && i === 0
        ? {
            questionEn: 'Q?',
            questionGu: 'Q?',
            questionHi: 'Q?',
            options: [{ textEn: 'A', textGu: 'A', textHi: 'A', isBest: true, feedbackEn: '', feedbackGu: '', feedbackHi: '' }],
          }
        : undefined,
  })),
});

describe('Approved premium children palette', () => {
  test('candy tones match the approved palette', () => {
    expect(candy).toMatchObject({
      cyan: '#0EA5E9', // Magic Ocean Cyan
      cyanDeep: '#0284C7',
      gold: '#F59E0B', // Sunshine Marigold
      goldDeep: '#D97706',
      coral: '#F43F5E', // Sweet Berry Coral
      coralDeep: '#E11D48',
      mint: '#10B981', // Spring Clover Green
      mintDeep: '#059669',
      grape: '#8B5CF6', // Fairy Tale Lavender
      grapeDeep: '#7C3AED',
    });
  });

  test('tints and text colours match the approved palette', () => {
    expect([kidTones.sky.tint, kidTones.sky.text]).toEqual(['#E0F2FE', '#0369A1']);
    expect([kidTones.sun.tint, kidTones.sun.text]).toEqual(['#FEF3C7', '#B45309']);
    expect([kidTones.coral.tint, kidTones.coral.text]).toEqual(['#FFE4E6', '#BE123C']);
    expect([kidTones.mint.tint, kidTones.mint.text]).toEqual(['#D1FAE5', '#047857']);
    expect([kidTones.lavender.tint, kidTones.lavender.text]).toEqual(['#EDE9FE', '#6D28D9']);
    expect(kidPalette.ink).toBe('#1E293B');
  });

  test('tones use candy fills with their deeper lip colour', () => {
    expect([kidTones.sky.fill, kidTones.sky.edge]).toEqual([candy.cyan, candy.cyanDeep]);
    expect([kidTones.sun.fill, kidTones.sun.edge]).toEqual([candy.gold, candy.goldDeep]);
    // coral & lavender buttons use the one-step-deeper candy fill so white text meets WCAG AA
    expect([kidTones.coral.fill, kidTones.coral.edge]).toEqual([candy.coralDeep, '#BE123C']);
    expect([kidTones.mint.fill, kidTones.mint.edge]).toEqual([candy.mint, candy.mintDeep]);
    expect([kidTones.lavender.fill, kidTones.lavender.edge]).toEqual([candy.grapeDeep, '#6D28D9']);
  });

  test('milk-cream canvas, white cards with 2px #E2E8F0 borders and a 6px arcade lip', () => {
    expect(kidBackdrops).toMatchObject({ cream: '#FDFBF7', sky: '#F0F7FF' });
    expect(kidPalette.appBg).toBe('#FDFBF7');
    const card = claySurface('plain');
    expect(card.backgroundColor).toBe('#FFFFFF');
    expect(card.borderWidth).toBe(2);
    expect(card.borderColor).toBe('#E2E8F0');
    expect(CLAY_DEPTH).toBe(6);
  });
});

describe('Story catalogue metadata', () => {
  test('reading time is derived from the story text (at least 1 minute)', () => {
    expect(getStoryReadingMinutes(makeStory(['one two three']), 'en')).toBe(1);
    const long = makeStory([Array.from({ length: 150 }, (_, i) => `word${i}`).join(' ')]);
    expect(getStoryReadingMinutes(long, 'en')).toBe(3); // 150 words / 70 wpm
  });

  test('emoji-only tokens are not counted as words', () => {
    expect(getStoryReadingMinutes(makeStory(['🦁 🐯 🐻 '.repeat(100)]), 'en')).toBe(1);
  });

  test('difficulty grows with words per page and branching choices', () => {
    expect(getStoryDifficulty(makeStory(['short page'.repeat(2)]))).toBe(1);
    expect(getStoryDifficulty(makeStory(['a '.repeat(25)]))).toBe(2);
    expect(getStoryDifficulty(makeStory(['a '.repeat(25)], true))).toBe(3);
    expect(getStoryDifficulty(makeStory([]))).toBe(1);
  });

  test('every bundled story gets sane metadata in all 3 languages', () => {
    STORIES_DATA.forEach((s) => {
      (['en', 'gu', 'hi'] as const).forEach((lang) => {
        const mins = getStoryReadingMinutes(s, lang);
        expect(mins).toBeGreaterThanOrEqual(1);
        expect(mins).toBeLessThan(30);
        expect([1, 2, 3]).toContain(getStoryDifficulty(s, lang));
      });
    });
  });

  test('category badges come from the backend category, with a generic fallback', () => {
    expect(getStoryCategoryMeta('moral', 'en')).toEqual({ icon: '✨', label: 'Moral Tale', tone: 'lavender' });
    expect(getStoryCategoryMeta('animals', 'en')).toEqual({ icon: '🐾', label: 'Cute Animals', tone: 'mint' });
    expect(getStoryCategoryMeta('wisdom', 'en')).toEqual({ icon: '🌟', label: 'Wisdom', tone: 'sun' });
    expect(getStoryCategoryMeta('animals', 'gu')).toEqual({ icon: '🐾', label: 'પ્રાણીઓ', tone: 'mint' });
    expect(getStoryCategoryMeta(undefined, 'en').label).toBe('Moral Tale');
    expect(getStoryCategoryMeta('space-pirates', 'en')).toEqual({ icon: '✨', label: 'Space-pirates', tone: 'sky' });
  });
});
