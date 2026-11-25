import fs from 'fs';
import path from 'path';

describe('Adventure Map Seamless UI & Path Audit', () => {
  const adventureFilePath = path.join(__dirname, '../app/adventure.tsx');
  const adventureContent = fs.readFileSync(adventureFilePath, 'utf8');

  test('app/adventure.tsx does not use broken vertically repeated raster tiles', () => {
    // Ensuring ADVENTURE_SEAMLESS_BG is not repeated across the track causing horizontal cut lines
    expect(adventureContent).not.toContain('ADVENTURE_SEAMLESS_BG');
    expect(adventureContent).not.toContain('mapBgSeamlessTile');
  });

  test('app/adventure.tsx implements continuous procedural terrain hill bands', () => {
    expect(adventureContent).toContain('terrainHillBand');
    expect(adventureContent).toContain('terrainFleckRow');
    expect(adventureContent).toContain('terrainFleckEmoji');
  });

  test('app/adventure.tsx connects stepping stones organically with interpolated horizontal offsets', () => {
    expect(adventureContent).toContain('prevCurveOffset');
    expect(adventureContent).toContain('prevCurveOffset + (curveOffset - prevCurveOffset)');
    expect(adventureContent).toContain('stepDotCurrent');
    expect(adventureContent).toContain('stepDotCheck');
  });

  test('app/adventure.tsx includes ambient nature scenery framing the path along margins', () => {
    expect(adventureContent).toContain('AMBIENT_SCENERY_PRESETS');
    expect(adventureContent).toContain('ambientSceneryWrap');
    expect(adventureContent).toContain('sceneryLeft');
    expect(adventureContent).toContain('sceneryRight');
  });

  test('app/adventure.tsx does not contain modern unsupported emojis (🪷, 🪨, 🪧) that cause tofu boxes on Windows/older devices', () => {
    expect(adventureContent).not.toContain('🪷'); // U+1FAB7 Lotus (renders as black box on Windows 10)
    expect(adventureContent).not.toContain('🪨'); // U+1FAA8 Rock
    expect(adventureContent).not.toContain('🪧'); // U+1FAA7 Placard
  });

  test('app/adventure.tsx properly supports 3D avatar rendering without literal avatar ID string leak', () => {
    expect(adventureContent).toContain('is3DAvatar(progress.currentAvatar?.character)');
    expect(adventureContent).toContain('AVATAR_3D_BOY');
    expect(adventureContent).toContain('playerAvatar3DImage');
    expect(adventureContent).toContain('playerNamePill');
    expect(adventureContent).toContain('formatChildName');
  });

  test('app/adventure.tsx ambient scenery does not contain broken wave emoji that renders as tofu on Android', () => {
    expect(adventureContent).not.toContain("{ emoji1: '🌊'");
    expect(adventureContent).toContain('🐟');
  });

  test('app/adventure.tsx player marker avoids negative absolute collision with stepping dots and landmark badges', () => {
    // Ensuring playerAvatarBadge does not have position: absolute with top: -50 colliding into previous dots
    expect(adventureContent).not.toContain("top: -50");
    expect(adventureContent).toContain('nodeCurrentGlowRing');
  });
});


