const fs = require('fs');

const numbersContent = fs.readFileSync('scripts/output_numbers.txt', 'utf8');
const ghadiyaContent = fs.readFileSync('scripts/output_ghadiya.txt', 'utf8');
let lessonsContent = fs.readFileSync('src/data/lessons.ts', 'utf8');

// Section 1: Replace numbers 1-20 (from line 1950 header to before FRUITS & VEGETABLES)
const num1Header = '// ==========================================\n  // NUMBERS / AKADA (1 TO 20)';
const fruitsHeader = '// ==========================================\n  // FRUITS & VEGETABLES (WITH REAL PHOTOGRAPHY)';

const idxNum1 = lessonsContent.indexOf('// ==========================================\n  // NUMBERS / AKADA');
const idxFruits = lessonsContent.indexOf('// ==========================================\n  // FRUITS & VEGETABLES');

if (idxNum1 === -1 || idxFruits === -1) {
  console.error('Could not find numbers or fruits header!', { idxNum1, idxFruits });
  process.exit(1);
}

const numbersReplacement = `// ==========================================
  // COMPLETE NUMBERS (1 TO 100 IN GUJARATI DIGITS)
  // ==========================================
${numbersContent}
  `;

lessonsContent = lessonsContent.substring(0, idxNum1) + numbersReplacement + lessonsContent.substring(idxFruits);

// Section 2: Replace continuous numbers (21-100) with Ghadiya (1-10 Tables)
const idxContNum = lessonsContent.indexOf('// ==========================================\n  // CONTINUOUS NUMBERS (21 TO 30 & TENS TO 100)');
const idxPhonics = lessonsContent.indexOf('// ==========================================\n  // ENGLISH PHONICS & LETTER SOUNDS (A TO Z)');

if (idxContNum === -1 || idxPhonics === -1) {
  console.error('Could not find continuous numbers or phonics header!', { idxContNum, idxPhonics });
  process.exit(1);
}

const ghadiyaReplacement = `// ==========================================
  // GUJARATI GHADIYA (MULTIPLICATION TABLES 1 TO 10)
  // ==========================================
${ghadiyaContent}
  `;

lessonsContent = lessonsContent.substring(0, idxContNum) + ghadiyaReplacement + lessonsContent.substring(idxPhonics);

fs.writeFileSync('src/data/lessons.ts', lessonsContent, 'utf8');
console.log('Successfully updated src/data/lessons.ts with 100 Numbers and 100 Ghadiya tables!');
