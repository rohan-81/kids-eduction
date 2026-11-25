const fs = require('fs');
const path = require('path');

// Extract stroke definitions with their point coordinates
function extractFullDefinitions(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Regex to extract character blocks
  const blocks = content.split(/\n  '([^'\n]+)': \{/);
  const results = [];

  for (let i = 1; i < blocks.length; i += 2) {
    const char = blocks[i];
    const blockBody = blocks[i + 1] || '';
    
    // Extract strokes
    const strokeBlocks = blockBody.split(/createStroke\(/);
    const strokes = [];

    for (let s = 1; s < strokeBlocks.length; s++) {
      const sBody = strokeBlocks[s];
      // Extract points
      const pointsMatch = sBody.match(/\[\s*(\{[\s\S]*?\})\s*\]/);
      if (pointsMatch) {
        const ptStrings = pointsMatch[1].match(/\{\s*x:\s*[\d.]+\s*,\s*y:\s*[\d.]+\s*\}/g) || [];
        const pts = ptStrings.map(ps => {
          const xM = ps.match(/x:\s*([\d.]+)/);
          const yM = ps.match(/y:\s*([\d.]+)/);
          return {
            x: xM ? parseFloat(xM[1]) : 0,
            y: yM ? parseFloat(yM[1]) : 0,
          };
        });
        if (pts.length > 0) {
          strokes.push(pts);
        }
      } else {
        // Check for makeLoop
        const loopMatch = sBody.match(/makeLoop\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);
        if (loopMatch) {
          const cx = parseFloat(loopMatch[1]);
          const cy = parseFloat(loopMatch[2]);
          const rx = parseFloat(loopMatch[3]);
          const ry = parseFloat(loopMatch[4]);
          const pts = [];
          for (let a = 0; a <= 20; a++) {
            const angle = (a / 20) * Math.PI * 2;
            pts.push({
              x: Math.round((cx + rx * Math.cos(angle)) * 10) / 10,
              y: Math.round((cy + ry * Math.sin(angle)) * 10) / 10,
            });
          }
          strokes.push(pts);
        } else {
          // Check for sampleLine
          const lineMatch = sBody.match(/sampleLine\(\s*\{\s*x:\s*([\d.]+)\s*,\s*y:\s*([\d.]+)\s*\}\s*,\s*\{\s*x:\s*([\d.]+)\s*,\s*y:\s*([\d.]+)\s*\}\s*\)/);
          if (lineMatch) {
            strokes.push([
              { x: parseFloat(lineMatch[1]), y: parseFloat(lineMatch[2]) },
              { x: parseFloat(lineMatch[3]), y: parseFloat(lineMatch[4]) }
            ]);
          }
        }
      }
    }

    results.push({
      char,
      strokes,
    });
  }

  return results;
}

const gujNumbers = extractFullDefinitions('src/utils/strokeData/gujarati/numbers.ts');
const gujVowels = extractFullDefinitions('src/utils/strokeData/gujarati/vowels.ts');
const gujConsonants = extractFullDefinitions('src/utils/strokeData/gujarati/consonants.ts');
const gujMatras = extractFullDefinitions('src/utils/strokeData/gujarati/matras.ts');

const hiNumbers = extractFullDefinitions('src/utils/strokeData/hindi/numbers.ts');
const hiVowels = extractFullDefinitions('src/utils/strokeData/hindi/vowels.ts');
const hiConsonants = extractFullDefinitions('src/utils/strokeData/hindi/consonants.ts');
const hiMatras = extractFullDefinitions('src/utils/strokeData/hindi/matras.ts');

function generateCard(item, fontClass) {
  const { char, strokes } = item;
  const corridorPaths = strokes.map((pts) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      d += ` L ${pts[i].x} ${pts[i].y}`;
    }
    return `<path d="${d}" stroke="#334155" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round" />`;
  }).join('\n');

  const centerlinePaths = strokes.map((pts, idx) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      d += ` L ${pts[i].x} ${pts[i].y}`;
    }
    return `<path d="${d}" stroke="#38BDF8" stroke-width="2.5" stroke-dasharray="3,3" fill="none" stroke-linecap="round" stroke-linejoin="round" />`;
  }).join('\n');

  const startDot = strokes[0] && strokes[0][0] ? `
    <circle cx="${strokes[0][0].x}" cy="${strokes[0][0].y}" r="4.5" fill="#10B981" stroke="#FFFFFF" stroke-width="1.5" />
  ` : '';

  return `
    <div class="glyph-card">
      <div class="glyph-preview">
        <div class="font-glyph ${fontClass}">${char}</div>
        <svg viewBox="0 0 100 100" class="stroke-overlay">
          ${corridorPaths}
          ${centerlinePaths}
          ${startDot}
        </svg>
      </div>
      <div class="glyph-label">${char}</div>
      <div class="glyph-sub">${strokes.length} stroke${strokes.length > 1 ? 's' : ''}</div>
    </div>
  `;
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Indian Language Handwriting Tracing Audit</title>
<style>
  body { font-family: system-ui, sans-serif; background: #0F172A; color: #F8FAFC; margin: 0; padding: 24px; }
  h1 { text-align: center; color: #38BDF8; margin-bottom: 8px; }
  p.desc { text-align: center; color: #94A3B8; margin-bottom: 24px; font-size: 14px; }
  h2 { color: #FBBF24; margin-top: 32px; border-bottom: 1px solid #334155; padding-bottom: 8px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 16px; margin-top: 16px; }
  .glyph-card { background: #1E293B; border-radius: 12px; padding: 12px; text-align: center; border: 1px solid #334155; }
  .glyph-preview { position: relative; width: 100px; height: 100px; margin: 0 auto; background: #0F172A; border-radius: 8px; overflow: hidden; }
  .font-glyph { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 68px; color: rgba(255,255,255,0.20); user-select: none; }
  .font-gujarati { font-family: "Noto Sans Gujarati", "Shruti", "Nirmala UI", sans-serif; }
  .font-hindi { font-family: "Noto Sans Devanagari", "Mangal", "Nirmala UI", sans-serif; }
  .stroke-overlay { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
  .glyph-label { margin-top: 8px; font-size: 20px; font-weight: 700; color: #F8FAFC; }
  .glyph-sub { font-size: 11px; color: #94A3B8; margin-top: 2px; }
  .legend { display: flex; justify-content: center; gap: 20px; margin: 20px 0; font-size: 13px; }
  .legend-item { display: flex; align-items: center; gap: 6px; }
  .legend-swatch { width: 12px; height: 12px; border-radius: 50%; }
</style>
</head>
<body>
  <h1>Indian Language Tracing Alignment Audit</h1>
  <p class="desc">Light white outline = Native system typography font. Dark grey corridor = Tracing boundary. Blue dashed line = Centerline path. Green circle = Active Starting point.</p>
  
  <div class="legend">
    <div class="legend-item"><div class="legend-swatch" style="background: rgba(255,255,255,0.25)"></div> Native Unicode Font</div>
    <div class="legend-item"><div class="legend-swatch" style="background: #334155"></div> Tracing Corridor (width=14)</div>
    <div class="legend-item"><div class="legend-swatch" style="background: #38BDF8"></div> Centerline Path</div>
    <div class="legend-item"><div class="legend-swatch" style="background: #10B981"></div> Active Starting Point</div>
  </div>

  <h2>Gujarati Digits (૦–૯)</h2>
  <div class="grid">
    ${gujNumbers.map(item => generateCard(item, 'font-gujarati')).join('')}
  </div>

  <h2>Gujarati Vowels (અ–અઃ)</h2>
  <div class="grid">
    ${gujVowels.map(item => generateCard(item, 'font-gujarati')).join('')}
  </div>

  <h2>Gujarati Consonants (ક–જ્ઞ)</h2>
  <div class="grid">
    ${gujConsonants.map(item => generateCard(item, 'font-gujarati')).join('')}
  </div>

  <h2>Gujarati Matras</h2>
  <div class="grid">
    ${gujMatras.map(item => generateCard(item, 'font-gujarati')).join('')}
  </div>

  <h2>Hindi / Devanagari Digits (०–९)</h2>
  <div class="grid">
    ${hiNumbers.map(item => generateCard(item, 'font-hindi')).join('')}
  </div>

  <h2>Hindi / Devanagari Vowels (अ–अः)</h2>
  <div class="grid">
    ${hiVowels.map(item => generateCard(item, 'font-hindi')).join('')}
  </div>

  <h2>Hindi / Devanagari Consonants (क–ज्ञ)</h2>
  <div class="grid">
    ${hiConsonants.map(item => generateCard(item, 'font-hindi')).join('')}
  </div>

  <h2>Hindi Matras</h2>
  <div class="grid">
    ${hiMatras.map(item => generateCard(item, 'font-hindi')).join('')}
  </div>
</body>
</html>
`;

fs.writeFileSync('tests/handwriting_visual_audit.html', html, 'utf8');
console.log('Visual audit HTML successfully generated at tests/handwriting_visual_audit.html');
