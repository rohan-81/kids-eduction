const fs = require('fs');

['./src/data/lessons.ts', './kids-education/src/data/lessons.ts'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const target = `  if (lesson.categoryId === 'en-alphabet' || lesson.categoryId === 'en-phonics') {
    if (currentLanguage === 'gu') {
      return { text: lesson.audioPromptGu || lesson.audioPrompt, lang: 'gu' };
    }
    if (currentLanguage === 'hi') {
      return { text: lesson.audioPromptHi || lesson.audioPrompt, lang: 'hi' };
    }
    return { text: lesson.audioPromptEn || lesson.audioPrompt, lang: 'en' };
  }`;
  const replacement = `  if (lesson.categoryId === 'en-alphabet' || lesson.categoryId === 'en-phonics') {
    return { text: lesson.audioPromptEn || lesson.audioPrompt || lesson.title, lang: 'en' };
  }`;
  const isCRLF = content.includes('\r\n');
  const normalized = content.replace(/\r\n/g, '\n');
  if (normalized.includes(target)) {
    let updated = normalized.replace(target, replacement);
    if (isCRLF) {
      updated = updated.replace(/\n/g, '\r\n');
    }
    fs.writeFileSync(file, updated, 'utf8');
    console.log('Successfully updated:', file);
  } else {
    console.log('Target not found in:', file);
  }
});
