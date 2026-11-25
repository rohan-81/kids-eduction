import * as fs from 'fs';
import * as path from 'path';

describe('Worksheets Multiplication Chart and Daily Mystery Box Visual Integrity', () => {
  test('Worksheets displays complete tables 1 to 10 without ageGroup split and supports blank answers', () => {
    const worksheetsFile = fs.readFileSync(
      path.join(__dirname, '../app/worksheets.tsx'),
      'utf8'
    );

    // Verify Title supports 1 to 10
    expect(worksheetsFile).toContain('Multiplication Practice Worksheet (1 to 10)');
    expect(worksheetsFile).toContain('ઘડિયા પ્રેક્ટિસ વર્કશીટ (૧ થી ૧૦ ના ઘડિયા)');
    expect(worksheetsFile).toContain('पहाड़े अभ्यास वर्कशीट (१ से १०)');

    // Verify it doesn't have 6 to 10 in the title or ageGroup split for ghadiya
    expect(worksheetsFile).not.toContain('Multiplication Tables Chart (6 to 10)');
    expect(worksheetsFile).not.toContain('Multiplication Tables Chart (1 to 5)');

    // Verify all 10 tables (1..10) are mapped
    expect(worksheetsFile).toContain('[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((tNum)');

    // Verify answers are blank for practice by default
    expect(worksheetsFile).toContain("useState<'blank' | 'filled'>('blank')");
    expect(worksheetsFile).toContain('ghadiyaAnswerBoxBlank');
    expect(worksheetsFile).toContain('ghadiyaModeToggleRow');
  });

  test('Daily Mystery Box icon uses solid rich multi-layer 3D fills and no broken linear gradient URLs', () => {
    const mysteryBoxFile = fs.readFileSync(
      path.join(__dirname, '../src/components/home/DailyMysteryBox.tsx'),
      'utf8'
    );

    // Verify solid color layers exist for box body and ribbons
    expect(mysteryBoxFile).toContain('fill="#8B5CF6"');
    expect(mysteryBoxFile).toContain('fill="#6D28D9"');
    expect(mysteryBoxFile).toContain('fill="#F59E0B"');
    expect(mysteryBoxFile).toContain('fill="#FDE047"');

    // Verify broken url(#mBoxGrad) was replaced
    expect(mysteryBoxFile).not.toContain('url(#mBoxGrad)');
  });

  test('Daily Mystery Modal unopened box also uses solid 3D vector fills', () => {
    const modalFile = fs.readFileSync(
      path.join(__dirname, '../src/components/home/DailyMysteryModal.tsx'),
      'utf8'
    );

    expect(modalFile).not.toContain('url(#mBoxBody)');
    expect(modalFile).toContain('fill="#8B5CF6"');
  });
});
