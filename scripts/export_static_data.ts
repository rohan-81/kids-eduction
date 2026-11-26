import fs from 'fs';
import path from 'path';

// Mock asset requires for Node environment
['.jpg', '.jpeg', '.png', '.webp', '.mp3', '.wav', '.gif'].forEach(ext => {
  // @ts-ignore
  require.extensions[ext] = (module, filename) => {
    module.exports = path.basename(filename);
  };
});

// Import datasets
import { CATEGORIES } from '../src/data/categories';
import { LESSONS } from '../src/data/lessons';
import { ENGLISH_LESSONS } from '../src/data/lessonsEnglish';
import { GK_LESSONS } from '../src/data/lessonsGK';
import { MATH_LESSONS } from '../src/data/lessonsMath';
import { SCIENCE_LESSONS } from '../src/data/lessonsScience';

import { GAME_QUESTIONS, PUZZLE_PICTURES } from '../src/data/gamesData';
import { STORIES_DATA } from '../src/data/storiesData';
import { ADVENTURE_LEVELS } from '../src/data/adventureLevels';
import { COLORING_TEMPLATES } from '../src/data/coloringTemplates';
import { TEST_QUESTIONS } from '../src/data/challengeData';
import { RHYMES_DATA, toBackendRhyme } from '../src/data/rhymesData';
import { STICKER_CATALOG, toBackendSticker } from '../src/data/stickersData';

const OTHER_SUBJECT_LESSON_IDS = new Set(
  [...ENGLISH_LESSONS, ...GK_LESSONS, ...MATH_LESSONS, ...SCIENCE_LESSONS].map((l) => l.id)
);

// Parse screen-defined data safely from sources
function extractArrayFromSource(filePath: string, startPattern: RegExp, endPattern: RegExp): any[] {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const startMatch = content.match(startPattern);
    if (!startMatch || startMatch.index === undefined) return [];
    
    const startIndex = startMatch.index + startMatch[0].length - 1; // start at '['
    let bracketCount = 0;
    let endIndex = -1;
    let inString: string | null = null;
    let isEscaped = false;

    for (let i = startIndex; i < content.length; i++) {
      const char = content[i];
      if (isEscaped) {
        isEscaped = false;
        continue;
      }
      if (char === '\\') {
        isEscaped = true;
        continue;
      }
      if (inString) {
        if (char === inString) {
          inString = null;
        }
        continue;
      }
      if (char === "'" || char === '"' || char === '`') {
        inString = char;
        continue;
      }
      if (char === '[') bracketCount++;
      if (char === ']') {
        bracketCount--;
        if (bracketCount === 0) {
          endIndex = i + 1;
          break;
        }
      }
    }

    if (endIndex !== -1) {
      const rawCode = content.substring(startIndex, endIndex);
      // Evaluate in safe function context
      const fn = new Function(`return ${rawCode};`);
      return fn();
    }
  } catch (err) {
    console.warn(`Could not extract array from ${filePath}:`, err);
  }
  return [];
}

const rootDir = path.resolve(__dirname, '..');
const storiesPath = path.join(rootDir, 'app', 'stories.tsx');
const avatarPath = path.join(rootDir, 'app', 'avatar.tsx');

// Keep the committed sticker seed catalog in sync with src/data/stickersData.ts
fs.writeFileSync(
  path.join(rootDir, 'backend', 'rewards', 'fixtures', 'sticker_catalog.json'),
  JSON.stringify({ stickers: STICKER_CATALOG.map((s, idx) => toBackendSticker(s, idx)) }, null, 2) + '\n',
  'utf8'
);

// Rhymes are exported already flattened to the Django Rhyme model's fields (lyrics_english, etc.).
const rhymesData = RHYMES_DATA.map((r, idx) => toBackendRhyme(r, idx));
const storiesData = extractArrayFromSource(storiesPath, /const STORIES: StoryBook\[\] = \[/, /\];/);
const charactersData = extractArrayFromSource(avatarPath, /const CHARACTERS: AvatarOption\[\] = \[/, /\];/);
const hatsData = extractArrayFromSource(avatarPath, /const HATS: AvatarOption\[\] = \[/, /\];/);
const accessoriesData = extractArrayFromSource(avatarPath, /const ACCESSORIES: AvatarOption\[\] = \[/, /\];/);

// Flatten all game questions into a standardized list
const questionsList: any[] = [];

// 1. From GAME_QUESTIONS: record of GameType -> Record<Language, Question[]>
if (GAME_QUESTIONS) {
  for (const [gameType, langMap] of Object.entries(GAME_QUESTIONS)) {
    if (typeof langMap === 'object' && langMap !== null) {
      for (const [lang, qList] of Object.entries(langMap as Record<string, any[]>)) {
        if (Array.isArray(qList)) {
          qList.forEach((q, idx) => {
            questionsList.push({
              stable_id: q.id || `gq-${gameType}-${lang}-${idx + 1}`,
              game_type: gameType,
              language: lang,
              age_group: q.ageGroup || 'all',
              question_text: q.prompt || q.question || q.title || `Identify the correct answer`,
              audio_text: q.audioText || '',
              display_visual: q.displayVisual || '',
              count_target: q.countTarget || null,
              options: q.options || [],
              correct_answer: String(q.correctOptionId ?? q.correctAnswer ?? q.answer ?? ''),
              correct_option_id: String(q.correctOptionId ?? q.correctAnswer ?? ''),
              explanation: q.explanation || '',
              hint: q.hint || '',
              image: q.image || '',
              audio: q.audio || '',
              points: 10,
              difficulty: q.difficulty || 1,
            });
          });
        }
      }
    }
  }
}

// 2. From TEST_QUESTIONS
if (Array.isArray(TEST_QUESTIONS)) {
  TEST_QUESTIONS.forEach((q, idx) => {
    questionsList.push({
      stable_id: q.id || `tq-${idx + 1}`,
      game_type: 'daily-challenge',
      language: 'gu',
      category: q.subjectGu || 'general',
      question_text: q.promptGu || q.promptEn || '',
      options: q.optionsGu || q.optionsEn || [],
      correct_answer: String(q.correctAnswerGu || q.correctAnswerEn || ''),
      explanation: '',
      hint: '',
      image: '',
      audio: '',
      points: 15,
      difficulty: 1,
    });
  });
}

// Standardize Avatar items
const avatarItemsList = [
  ...charactersData.map(c => ({
    item_id: c.id,
    name: c.nameEn || c.nameGu || c.id,
    item_type: 'character',
    icon: c.emoji || '🦁',
    price_coins: c.cost || 0,
    is_premium: (c.cost || 0) > 20,
    is_active: true,
  })),
  ...hatsData.map(h => ({
    item_id: h.id,
    name: h.nameEn || h.nameGu || h.id,
    item_type: 'hat',
    icon: h.emoji || '👑',
    price_coins: h.cost || 0,
    is_premium: (h.cost || 0) > 15,
    is_active: true,
  })),
  ...accessoriesData.map(a => ({
    item_id: a.id,
    name: a.nameEn || a.nameGu || a.id,
    item_type: a.type === 'accessory' ? 'accessory' : 'backpack',
    icon: a.emoji || '🎒',
    price_coins: a.cost || 0,
    is_premium: (a.cost || 0) > 25,
    is_active: true,
  })),
];

const exportPayload = {
  meta: {
    exportedAt: new Date().toISOString(),
    generator: 'KidsZone Static Data Extractor',
    version: '1.0.0',
  },
  categories: CATEGORIES,
  lessons: {
    // LESSONS aggregates every subject; export only the lessons not already listed below so
    // each lesson appears exactly once (previously 255 lessons were duplicated).
    gujarati: LESSONS.filter((l) => !OTHER_SUBJECT_LESSON_IDS.has(l.id)),
    english: ENGLISH_LESSONS,
    gk: GK_LESSONS,
    math: MATH_LESSONS,
    science: SCIENCE_LESSONS,
  },
  questions: questionsList,
  puzzle_pictures: PUZZLE_PICTURES || [],
  adventure_levels: ADVENTURE_LEVELS,
  coloring_templates: COLORING_TEMPLATES,
  rhymes: rhymesData,
  stickers: STICKER_CATALOG.map((s, idx) => toBackendSticker(s, idx)),
  stories: STORIES_DATA,
  avatar_items: avatarItemsList,
};

const outputDir = path.join(rootDir, 'backend', 'data_exports');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'kidszone_data.json');
/**
 * Remote media sources resolve against the API host of whoever runs the export (e.g. a dev
 * machine's http://127.0.0.1:8000). Store them host-independently as the plain file name, the
 * same format bundled asset requires already use.
 */
const portableMedia = (_key: string, value: unknown): unknown => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const uri = (value as { uri?: unknown }).uri;
    if (typeof uri === 'string' && /\/media\//.test(uri) && Object.keys(value).length === 1) {
      return path.basename(uri.split('?')[0]);
    }
  }
  return value;
};

fs.writeFileSync(outputPath, JSON.stringify(exportPayload, portableMedia, 2), 'utf8');

console.log('✅ Static data exported successfully to:', outputPath);
console.log('Summary:');
console.log(`- Categories: ${exportPayload.categories.length}`);
console.log(`- Gujarati Lessons: ${exportPayload.lessons.gujarati.length}`);
console.log(`- English Lessons: ${exportPayload.lessons.english.length}`);
console.log(`- GK Lessons: ${exportPayload.lessons.gk.length}`);
console.log(`- Math Lessons: ${exportPayload.lessons.math.length}`);
console.log(`- Science Lessons: ${exportPayload.lessons.science.length}`);
console.log(`- Questions: ${exportPayload.questions.length}`);
console.log(`- Adventure Levels: ${exportPayload.adventure_levels.length}`);
console.log(`- Coloring Templates: ${exportPayload.coloring_templates.length}`);
console.log(`- Rhymes: ${exportPayload.rhymes.length}`);
console.log(`- Stories: ${exportPayload.stories.length}`);
console.log(`- Avatar Items: ${exportPayload.avatar_items.length}`);
