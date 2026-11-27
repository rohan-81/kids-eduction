import fs from 'fs';
import path from 'path';
import { formatChildName } from '../src/utils/nameTransliterator';

const readNormalized = (rel: string) =>
  fs.readFileSync(path.join(__dirname, '..', rel), 'utf8').replace(/\r\n/g, '\n');

describe('Parents Corner, Profile spacing, Name localization & Web audio AbortError handling', () => {
  test('formatChildName normalizes default star names across gu, hi, en', () => {
    expect(formatChildName('छोटा तारा', 'gu')).toBe('નાનો તારો');
    expect(formatChildName('Little Star', 'gu')).toBe('નાનો તારો');
    expect(formatChildName('નાનો તારો', 'hi')).toBe('छोटा तारा');
    expect(formatChildName('નાનો તારો', 'en')).toBe('Little Star');
    expect(formatChildName('છોટા તારા', 'gu')).toBe('છોટા તારા');
  });

  test('parents.tsx formats profile names & age group digits cleanly and displays Class 3-5', () => {
    const src = readNormalized('app/parents.tsx');
    expect(src).toContain('formatChildName(rawNickname, language)');
    expect(src).toContain('formatChildName(p.nickname, language)');
    expect(src).toContain('formatNumberDigits(p.age_group, language)');
    expect(src).toContain('ધોરણ ૩-૫ માસ્ટરી');
    expect(src).not.toContain('ધોરણ ૩-૪ માસ્ટરી');
  });

  test('profile.tsx has proper gap spacing before button arrows', () => {
    const src = readNormalized('app/profile.tsx');
    expect(src).toMatch(/parentsCornerBtn:\s*\{[^}]*gap:\s*8/);
    expect(src).toMatch(/createAccountBtn:\s*\{[^}]*gap:\s*8/);
  });

  test('audioService suppresses benign AbortError logs when pause interrupts play()', () => {
    const src = readNormalized('src/services/audioService.ts');
    expect(src).toContain("errName === 'AbortError'");
  });
});

