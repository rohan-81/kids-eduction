import {
  STICKER_CATALOG,
  STICKER_SCENES,
  STARTER_UNLOCKED_STICKER_IDS,
  getStickerName,
} from '../src/data/stickersData';
import enLocale from '../src/localization/en.json';
import guLocale from '../src/localization/gu.json';
import hiLocale from '../src/localization/hi.json';

describe('Sticker Book & Kids Audio Studio Suite', () => {
  test('STICKER_CATALOG contains valid items with all 3 languages (EN, GU, HI)', () => {
    expect(STICKER_CATALOG.length).toBeGreaterThanOrEqual(20);

    STICKER_CATALOG.forEach((item) => {
      expect(item.id).toMatch(/^stk-/);
      expect(item.emoji.length).toBeGreaterThan(0);
      expect(['animals', 'space', 'magic', 'treats']).toContain(item.category);
      expect(item.name.en).toBeTruthy();
      expect(item.name.gu).toBeTruthy();
      expect(item.name.hi).toBeTruthy();

      expect(getStickerName(item, 'en')).toBe(item.name.en);
      expect(getStickerName(item, 'gu')).toBe(item.name.gu);
      expect(getStickerName(item, 'hi')).toBe(item.name.hi);
    });
  });

  test('STARTER_UNLOCKED_STICKER_IDS provides rich starter selection', () => {
    expect(STARTER_UNLOCKED_STICKER_IDS.length).toBeGreaterThanOrEqual(10);
    STARTER_UNLOCKED_STICKER_IDS.forEach((id) => {
      const match = STICKER_CATALOG.find((s) => s.id === id);
      expect(match).toBeDefined();
      expect(match?.defaultUnlocked).toBe(true);
    });
  });

  test('STICKER_SCENES provides 4 unique themed room backgrounds', () => {
    expect(STICKER_SCENES).toHaveLength(4);
    const sceneIds = STICKER_SCENES.map((s) => s.id);
    expect(sceneIds).toEqual(['park', 'space', 'ocean', 'castle']);

    STICKER_SCENES.forEach((scene) => {
      expect(scene.name.en).toBeTruthy();
      expect(scene.name.gu).toBeTruthy();
      expect(scene.name.hi).toBeTruthy();
      expect(scene.bgColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(scene.groundColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(scene.decorEmojis.length).toBeGreaterThanOrEqual(3);
    });
  });

  test('Localization parity for stickers, speech, and readToMe across EN, GU, HI', () => {
    const requiredSections = ['stickers', 'speech', 'readToMe'] as const;

    requiredSections.forEach((sec) => {
      expect((enLocale as any)[sec]).toBeDefined();
      expect((guLocale as any)[sec]).toBeDefined();
      expect((hiLocale as any)[sec]).toBeDefined();

      const enKeys = Object.keys((enLocale as any)[sec]);
      const guKeys = Object.keys((guLocale as any)[sec]);
      const hiKeys = Object.keys((hiLocale as any)[sec]);

      expect(guKeys).toEqual(enKeys);
      expect(hiKeys).toEqual(enKeys);
    });
  });
});

