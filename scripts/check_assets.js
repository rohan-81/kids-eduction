const fs = require('fs');
const path = require('path');

function checkAssets(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const dir = path.dirname(filePath);
  const regex = /require\(['"]([^'"]+)['"]\)/g;
  let match;
  let missing = 0;
  while ((match = regex.exec(content)) !== null) {
    const rel = match[1];
    if (rel.startsWith('.')) {
      const full = path.resolve(dir, rel);
      // Check full path or full path with extensions
      const exts = ['', '.ts', '.tsx', '.js', '.jsx', '.json', '.png', '.jpg', '.jpeg', '.mp3', '.wav'];
      const exists = exts.some(ext => fs.existsSync(full + ext));
      if (!exists) {
        console.error(`[${filePath}] Missing: ${rel}`);
        missing++;
      }
    }
  }
  return missing;
}

const filesToCheck = [
  'src/utils/imageHelper.ts',
  'src/services/soundEffects.ts',
  'app/home.tsx',
  'app/drawing.tsx',
  'app/coloring.tsx',
  'app/parents.tsx',
  'app/avatar.tsx',
  'app/onboarding.tsx',
];

let totalMissing = 0;
for (const f of filesToCheck) {
  if (fs.existsSync(f)) {
    totalMissing += checkAssets(f);
  }
}
console.log(`Scan completed. Total missing assets/imports: ${totalMissing}`);
