import {
  generatePersonalizedStory,
  MAGIC_COMPANIONS,
  MAGIC_THEMES,
  MAGIC_TOOLS,
} from '../src/utils/magicStoryGenerator';

describe('Personalized AI Magic Storyteller Audit', () => {
  test('Has valid collections of companions, themes, and magic tools', () => {
    expect(MAGIC_COMPANIONS.length).toBeGreaterThanOrEqual(6);
    expect(MAGIC_THEMES.length).toBeGreaterThanOrEqual(5);
    expect(MAGIC_TOOLS.length).toBeGreaterThanOrEqual(4);

    for (const comp of MAGIC_COMPANIONS) {
      expect(comp.id).toBeTruthy();
      expect(comp.emoji).toBeTruthy();
      expect(comp.nameGu).toBeTruthy();
      expect(comp.nameHi).toBeTruthy();
      expect(comp.nameEn).toBeTruthy();
    }

    for (const theme of MAGIC_THEMES) {
      expect(theme.id).toBeTruthy();
      expect(theme.emoji).toBeTruthy();
      expect(theme.titleGu).toBeTruthy();
      expect(theme.titleHi).toBeTruthy();
      expect(theme.titleEn).toBeTruthy();
    }
  });

  test('generatePersonalizedStory dynamically personalizes story for child in Gujarati, Hindi, and English', () => {
    const story = generatePersonalizedStory({
      childName: 'Rohan',
      companionId: 'lion',
      themeId: 'rainbow',
      toolId: 'wand',
    });

    expect(story.id).toMatch(/^magic-rainbow-lion-/);
    expect(story.isCustomMagicStory).toBe(true);
    expect(story.scenes.length).toBe(4);

    // Title checks
    expect(story.titleGu).toContain('રોહન');
    expect(story.titleHi).toContain('रोहन');
    expect(story.titleEn).toContain('Rohan');

    // Scene 1: Introduction with companion and tool
    const scene1 = story.scenes[0];
    expect(scene1.textGu).toContain('રોહન');
    expect(scene1.textGu).toContain('સિંહ શેરુ');
    expect(scene1.textGu).toContain('દયાની જાદુઈ લાકડી');

    expect(scene1.textHi).toContain('रोहन');
    expect(scene1.textHi).toContain('शेर शेरू');
    expect(scene1.textHi).toContain('दया की जादुई छड़ी');

    expect(scene1.textEn).toContain('Rohan');
    expect(scene1.textEn).toContain('Sheru the Lion');
    expect(scene1.textEn).toContain('Magic Star Wand');

    // Scene 3: Interactive choice with valid best option
    const scene3 = story.scenes[2];
    expect(scene3.choice).toBeDefined();
    expect(scene3.choice?.options.length).toBe(2);
    expect(scene3.choice?.options.some((o) => o.isBest)).toBe(true);

    // Scene 4: Celebration and victory
    const scene4 = story.scenes[3];
    expect(scene4.illustration).toContain('👑');

    // Morals in 3 languages
    expect(story.moralGu).toBeTruthy();
    expect(story.moralHi).toBeTruthy();
    expect(story.moralEn).toBeTruthy();
    expect(/[\u0A80-\u0AFF]/.test(story.moralGu)).toBe(true);
    expect(/[\u0900-\u097F]/.test(story.moralHi)).toBe(true);
  });

  test('generatePersonalizedStory produces different storylines for different themes', () => {
    const spaceStory = generatePersonalizedStory({
      childName: 'Pari',
      companionId: 'rabbit',
      themeId: 'space',
      toolId: 'shoes',
    });

    const icecreamStory = generatePersonalizedStory({
      childName: 'Aarav',
      companionId: 'monkey',
      themeId: 'icecream',
      toolId: 'balloon',
    });

    expect(spaceStory.scenes[0].textGu).toContain('રોકેટ');
    expect(spaceStory.scenes[0].textHi).toContain('रॉकेट');
    expect(spaceStory.scenes[0].textEn).toContain('rocket');

    expect(icecreamStory.scenes[0].textGu).toContain('ચોકલેટ');
    expect(icecreamStory.scenes[0].textHi).toContain('चॉकलेट');
    expect(icecreamStory.scenes[0].textEn).toContain('chocolate');
  });

  test('generatePersonalizedStory cleanly handles custom hero names with localized transliteration', () => {
    const customStory = generatePersonalizedStory({
      childName: 'Kabir',
      companionId: 'lion',
      themeId: 'jungle',
      toolId: 'whistle',
    });

    expect(customStory.titleEn).toContain('Kabir');
    expect(customStory.titleGu).toContain('કબીર');
    expect(customStory.titleHi).toContain('कबीर');
    expect(customStory.scenes[0].textEn).toContain('Kabir');
    expect(customStory.scenes[0].textGu).toContain('કબીર');
    expect(customStory.scenes[0].textHi).toContain('कबीर');
  });
});

