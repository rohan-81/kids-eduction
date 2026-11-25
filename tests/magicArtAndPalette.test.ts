// AI Magic Story Maker art + unified 60-30-10 palette.
import { MAGIC_COMPANIONS, MAGIC_THEMES, MAGIC_TOOLS, generatePersonalizedStory } from '../src/utils/magicStoryGenerator';
import { STORY_CHARACTER_IMAGES, STORY_PROP_IMAGES, MAGIC_UI_ART } from '../src/utils/imageHelper';
import { castScene, composeScene } from '../src/utils/storyArt';
import { colors, candyTones } from '../src/theme/colors';
import { kidTones, kidBackdrops } from '../src/theme/kidTheme';

describe('Magic Story Maker uses bundled 3D art instead of emoji', () => {
  test('every companion, quest and tool has a 3D PNG', () => {
    [...MAGIC_COMPANIONS, ...MAGIC_THEMES, ...MAGIC_TOOLS].forEach((item) => {
      expect(item.image).toBeDefined();
      expect(item.image).not.toBeNull();
    });
    expect(MAGIC_UI_ART.wizard).toBeDefined();
    expect(MAGIC_UI_ART.crown).toBeDefined();
  });

  test('every companion appears as a 3D character on the story pages', () => {
    MAGIC_COMPANIONS.forEach((comp) => {
      expect(STORY_CHARACTER_IMAGES[comp.emoji]).toBeDefined();
    });
  });

  test('generated magic stories show a 3D companion on every page', () => {
    const lookup = (g: string) => STORY_CHARACTER_IMAGES[g];
    MAGIC_COMPANIONS.forEach((comp) => {
      MAGIC_THEMES.forEach((theme) => {
        const story = generatePersonalizedStory({ childName: 'Ravi', companionId: comp.id, themeId: theme.id, toolId: 'wand' });
        story.scenes.forEach((sc) => {
          const { cast } = castScene(composeScene(sc.illustration, comp.emoji).actors, comp.emoji, lookup);
          expect(cast.length).toBeGreaterThan(0);
        });
      });
    });
  });

  test('magic tools have 3D prop art for story pages', () => {
    ['🎈', '👟', '🦸', '🧭'].forEach((g) => expect(STORY_PROP_IMAGES[g]).toBeDefined());
  });
});

describe('unified 60-30-10 palette', () => {
  test('warm milk-cream canvas, white cards, slate ink', () => {
    expect(colors.background).toBe('#FDFBF7');
    expect(colors.appBg).toBe('#FDFBF7');
    expect(kidBackdrops.cream).toBe('#FDFBF7');
    expect(colors.card).toBe('#FFFFFF');
    expect(colors.border).toBe('#E2E8F0');
    expect(colors.textPrimary).toBe('#1E293B');
    expect(colors.textSecondary).toBe('#64748B');
  });

  test('the 5 candy tones match the spec in both theme files', () => {
    const spec = {
      // WCAG AA: deep text on bright sky; coral and lavender use their deeper fills for white text
      sky: ['#0EA5E9', '#0284C7', '#E0F2FE', '#082F49'],
      sun: ['#F59E0B', '#D97706', '#FEF3C7', '#451A03'],
      mint: ['#10B981', '#059669', '#D1FAE5', '#022C22'],
      lavender: ['#7C3AED', '#6D28D9', '#EDE9FE', '#FFFFFF'],
      coral: ['#E11D48', '#BE123C', '#FFE4E6', '#FFFFFF'],
    } as const;
    (Object.keys(spec) as (keyof typeof spec)[]).forEach((tone) => {
      const [fill, edge, tint, onFill] = spec[tone];
      expect(candyTones[tone]).toEqual({ fill, edge, tint, onFill });
      expect(kidTones[tone]).toMatchObject({ fill, edge, tint, onFill });
    });
  });
});

describe('step-by-step Magic Story wizard', () => {
  const { getWizardChoices, getWizardPrompt, getWizardTitle, COMPANION_SOUND_KEYS } = require('../src/utils/magicStoryGenerator');

  test('curated, uncluttered choices: 6 buddies, 3 quests, 3 tools, all with 3D art', () => {
    const { companions, quests, tools } = getWizardChoices();
    expect(companions.map((c: any) => c.id)).toEqual(['lion', 'elephant', 'monkey', 'rabbit', 'puppy', 'unicorn']);
    expect(quests.map((q: any) => q.id)).toEqual(['rainbow', 'space', 'dino']);
    expect(tools.map((t: any) => t.id)).toEqual(['wand', 'balloon', 'shoes']);
    [...companions, ...quests, ...tools].forEach((item: any) => expect(item.image).toBeDefined());
  });

  test('every companion card plays a real animal sound', () => {
    getWizardChoices().companions.forEach((c: any) => expect(COMPANION_SOUND_KEYS[c.id]).toBeTruthy());
  });

  test('each step has a spoken prompt and title in all three languages', () => {
    expect(getWizardPrompt(1, 'en', 'Ravi')).toBe('Are you ready for an adventure, Ravi?');
    expect(getWizardPrompt(1, 'gu', 'રવિ')).toContain('રવિ');
    expect(getWizardPrompt(1, 'hi', 'रवि')).toContain('रवि');
    expect(getWizardPrompt(1, 'en', '')).toContain('little hero');
    ([1, 2, 3] as const).forEach((step) => {
      (['en', 'gu', 'hi'] as const).forEach((lang) => {
        expect(getWizardPrompt(step, lang, 'Ravi').length).toBeGreaterThan(5);
        expect(getWizardTitle(step, lang).length).toBeGreaterThan(3);
      });
    });
    expect(getWizardTitle(2, 'en')).toBe('Pick Your Best Buddy!');
  });
});
