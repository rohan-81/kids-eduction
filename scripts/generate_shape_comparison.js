const fs = require('fs');
const path = require('path');

function extractDefinitions(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const blocks = content.split(/\n  '([^'\n]+)': \{/);
  const results = [];

  for (let i = 1; i < blocks.length; i += 2) {
    const char = blocks[i];
    const blockBody = blocks[i + 1] || '';
    
    const strokeBlocks = blockBody.split(/createStroke\(/);
    const strokes = [];

    for (let s = 1; s < strokeBlocks.length; s++) {
      const sBody = strokeBlocks[s];
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
        if (pts.length > 0) strokes.push(pts);
      } else {
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

    results.push({ char, strokes });
  }

  return results;
}

const gujVowels = extractDefinitions('src/utils/strokeData/gujarati/vowels.ts');
const gujConsonants = extractDefinitions('src/utils/strokeData/gujarati/consonants.ts');
const gujNumbers = extractDefinitions('src/utils/strokeData/gujarati/numbers.ts');

const hiVowels = extractDefinitions('src/utils/strokeData/hindi/vowels.ts');
const hiConsonants = extractDefinitions('src/utils/strokeData/hindi/consonants.ts');
const hiNumbers = extractDefinitions('src/utils/strokeData/hindi/numbers.ts');

function renderComparisonRow(item, fontClass, scriptLabel) {
  const { char, strokes } = item;
  
  // Centerline & corridor paths
  const corridorSvg = strokes.map(pts => {
    if (!pts || pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) d += ` L ${pts[i].x} ${pts[i].y}`;
    return `<path d="${d}" stroke="#334155" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round" />`;
  }).join('');

  const centerlineSvg = strokes.map(pts => {
    if (!pts || pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) d += ` L ${pts[i].x} ${pts[i].y}`;
    return `<path d="${d}" stroke="#38BDF8" stroke-width="2.5" stroke-dasharray="3,3" fill="none" stroke-linecap="round" stroke-linejoin="round" />`;
  }).join('');

  const startDotSvg = strokes[0] && strokes[0][0] ? `
    <circle cx="${strokes[0][0].x}" cy="${strokes[0][0].y}" r="4.5" fill="#10B981" stroke="#FFFFFF" stroke-width="1.5" />
  ` : '';

  return `
    <div class="comp-row">
      <div class="char-badge">
        <span class="char-symbol ${fontClass}">${char}</span>
        <span class="char-meta">${scriptLabel} • ${strokes.length} stroke${strokes.length > 1 ? 's' : ''}</span>
      </div>

      <!-- LEFT: Verified Standard Handwriting Reference -->
      <div class="comp-panel left-panel">
        <div class="panel-header">1. Standard Reference</div>
        <div class="glyph-box">
          <div class="ref-font ${fontClass}">${char}</div>
        </div>
      </div>

      <!-- CENTER: Tracing Corridor & Path Geometry -->
      <div class="comp-panel center-panel">
        <div class="panel-header">2. Tracing Geometry</div>
        <div class="glyph-box">
          <svg viewBox="0 0 100 100" class="vector-svg">
            ${corridorSvg}
            ${centerlineSvg}
            ${startDotSvg}
          </svg>
        </div>
      </div>

      <!-- RIGHT: Precision Overlay Comparison -->
      <div class="comp-panel right-panel">
        <div class="panel-header">3. Precision Overlay (Audit Fit)</div>
        <div class="glyph-box">
          <div class="ref-font ${fontClass}" style="opacity: 0.35">${char}</div>
          <svg viewBox="0 0 100 100" class="vector-svg">
            ${centerlineSvg}
            ${startDotSvg}
          </svg>
        </div>
      </div>
    </div>
  `;
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Multilingual Handwriting Tracing Shape Comparison</title>
<style>
  body { font-family: system-ui, -apple-system, sans-serif; background: #0B0F19; color: #F1F5F9; margin: 0; padding: 28px; }
  h1 { text-align: center; color: #38BDF8; font-size: 26px; margin-bottom: 6px; }
  p.subtitle { text-align: center; color: #94A3B8; font-size: 14px; margin-bottom: 28px; }
  .section-title { color: #FBBF24; font-size: 20px; font-weight: 700; margin: 36px 0 16px; border-bottom: 1px solid #1E293B; padding-bottom: 8px; }
  .comp-row { display: grid; grid-template-columns: 140px 1fr 1fr 1fr; gap: 14px; background: #131B2E; border: 1px solid #1E293B; border-radius: 12px; padding: 14px; margin-bottom: 14px; align-items: center; }
  .char-badge { display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .char-symbol { font-size: 52px; font-weight: bold; color: #FFFFFF; line-height: 1; }
  .char-meta { font-size: 11px; color: #64748B; margin-top: 6px; text-align: center; }
  .font-gujarati { font-family: "Noto Sans Gujarati", "Shruti", "Nirmala UI", sans-serif; }
  .font-hindi { font-family: "Noto Sans Devanagari", "Mangal", "Nirmala UI", sans-serif; }
  .comp-panel { background: #0A0E17; border: 1px solid #1E293B; border-radius: 8px; padding: 10px; text-align: center; }
  .panel-header { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #94A3B8; margin-bottom: 8px; }
  .glyph-box { position: relative; width: 90px; height: 90px; margin: 0 auto; background: #0F172A; border-radius: 6px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
  .ref-font { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 64px; color: #FFFFFF; }
  .vector-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .legend { display: flex; justify-content: center; gap: 24px; background: #131B2E; padding: 14px; border-radius: 8px; max-width: 800px; margin: 0 auto 28px; font-size: 13px; }
  .legend-item { display: flex; align-items: center; gap: 8px; }
  .dot-ref { width: 12px; height: 12px; border-radius: 2px; background: #FFFFFF; }
  .dot-corridor { width: 12px; height: 12px; border-radius: 2px; background: #334155; }
  .dot-centerline { width: 12px; height: 12px; border-radius: 2px; background: #38BDF8; }
  .dot-start { width: 12px; height: 12px; border-radius: 50%; background: #10B981; }
</style>
</head>
<body>
  <h1>Verified Educational Handwriting Tracing Shape Comparison</h1>
  <p class="subtitle">Systematic audit of Gujarati & Hindi glyph shapes against native primary school typography standards.</p>

  <div class="legend">
    <div class="legend-item"><div class="dot-ref"></div> Native Standard Reference</div>
    <div class="legend-item"><div class="dot-corridor"></div> Tracing Corridor (width=14)</div>
    <div class="legend-item"><div class="dot-centerline"></div> Centerline Path</div>
    <div class="legend-item"><div class="dot-start"></div> Active Green Start Dot</div>
  </div>

  <div class="section-title">Priority Gujarati Characters (ક, ખ, ગ, ઘ, ચ, છ, જ, ટ, ડ, ણ, ત, દ, પ, ફ, બ, મ, ય, ર, લ, વ, શ, સ, હ)</div>
  ${gujConsonants.map(item => renderComparisonRow(item, 'font-gujarati', 'Gujarati Consonant')).join('')}

  <div class="section-title">Gujarati Vowels (અ, આ, ઇ, ઈ, ઉ, ઊ, ઋ, એ, ઐ, ઓ, ઔ, અં, અઃ)</div>
  ${gujVowels.map(item => renderComparisonRow(item, 'font-gujarati', 'Gujarati Vowel')).join('')}

  <div class="section-title">Gujarati Numerals (૦, ૧, ૨, ૩, ૪, ૫, ૬, ૭, ૮, ૯)</div>
  ${gujNumbers.map(item => renderComparisonRow(item, 'font-gujarati', 'Gujarati Numeral')).join('')}

  <div class="section-title">Hindi / Devanagari Consonants (क to ज्ञ)</div>
  ${hiConsonants.map(item => renderComparisonRow(item, 'font-hindi', 'Hindi Consonant')).join('')}

  <div class="section-title">Hindi / Devanagari Vowels (अ to अः)</div>
  ${hiVowels.map(item => renderComparisonRow(item, 'font-hindi', 'Hindi Vowel')).join('')}

  <div class="section-title">Hindi / Devanagari Numerals (० to ९)</div>
  ${hiNumbers.map(item => renderComparisonRow(item, 'font-hindi', 'Hindi Numeral')).join('')}
</body>
</html>
`;

fs.writeFileSync('tests/handwriting_shape_comparison.html', html, 'utf8');
console.log('Visual comparison HTML successfully generated at tests/handwriting_shape_comparison.html');

