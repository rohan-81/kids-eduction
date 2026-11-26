/**
 * Regressions for the P2-6 type-safety pass:
 *  - backend adventure rows can no longer replace the app's levels with unusable objects
 *    (they did: every level rendered locked and tapping one crashed on `question.options`);
 *  - mappers validate wire values instead of trusting them;
 *  - explicit `any` / `@ts-ignore` stay out of the app code.
 */
import * as fs from 'fs';
import * as path from 'path';
import {
  isAdventureLevel,
  mapBackendLesson,
  mapBackendGameQuestion,
  mergeBackendAdventureLevels,
  toColoringLabels,
} from '../src/services/apiService';
import { ADVENTURE_LEVELS } from '../src/data/adventureLevels';
import { listFrom } from '../src/types/api';
import { errorMessage, isAbortError } from '../src/utils/runtime';

describe('adventure levels from the backend', () => {
  test('raw backend rows are merged onto bundled levels, never used as-is', () => {
    const rows = [
      { level_number: 1, world_name: 'World 1', title: 'Adventure Stage 1', questions_data: [] },
      { level_number: 2, world_name: 'World 1', title: 'Adventure Stage 2', questions_data: [] },
    ];
    const merged = mergeBackendAdventureLevels(rows);
    expect(merged).toHaveLength(ADVENTURE_LEVELS.length);
    expect(merged.every(isAdventureLevel)).toBe(true);
    // Localized bundled content wins over generic server placeholders.
    expect(merged[0].titleEn).toBe(ADVENTURE_LEVELS[0].titleEn);
    expect(merged[0].question.options.length).toBeGreaterThan(0);
  });

  test('is_active: false hides a level; a complete server question replaces the bundled one', () => {
    const question = {
      promptGu: 'પ્ર', promptHi: 'प्र', promptEn: 'Q?',
      options: [
        { textGu: 'a', textHi: 'a', textEn: 'A', isCorrect: true },
        { textGu: 'b', textHi: 'b', textEn: 'B', isCorrect: false },
      ],
    };
    const merged = mergeBackendAdventureLevels([
      { level_number: 2, is_active: false },
      { level_number: 3, questions_data: [question] },
    ]);
    expect(merged.find((l) => l.level === 2)).toBeUndefined();
    expect(merged.find((l) => l.level === 3)?.question).toEqual(question);
  });

  test('an incomplete server question (no correct option) is ignored', () => {
    const bad = { promptEn: 'Q?', options: [{ textEn: 'A', isCorrect: false }] };
    const merged = mergeBackendAdventureLevels([{ level_number: 1, questions_data: bad }]);
    expect(merged[0].question).toEqual(ADVENTURE_LEVELS[0].question);
  });

  test('stale caches holding raw rows are rejected by the shape guard', () => {
    expect(isAdventureLevel({ level_number: 1, world_name: 'World 1' })).toBe(false);
    expect(isAdventureLevel(ADVENTURE_LEVELS[0])).toBe(true);
  });
});

describe('wire-format mappers', () => {
  test('mapBackendLesson validates language / age group and drops nulls', () => {
    const lesson = mapBackendLesson({
      stable_id: 'x-1',
      title: 'Kamal',
      category: 'gu-varnamala',
      language: 'fr',
      age_group: '9-12',
      subtitle: null,
      example_image: '',
    });
    expect(lesson.language).toBe('all');
    expect(lesson.ageGroup).toBe('all');
    expect(lesson.subtitle).toBeUndefined();
    expect(lesson.imageUrl).toBeUndefined();
    expect(lesson.symbol).toBe('K');
  });

  test('mapBackendGameQuestion rejects rows games cannot render', () => {
    expect(mapBackendGameQuestion({ id: 1, question_text: '' }, 'counting')).toBeNull();
    expect(mapBackendGameQuestion({ id: 1, question_text: 'Q', options: [{ id: '1', label: 'a' }] }, 'counting')).toBeNull();
    const ok = mapBackendGameQuestion(
      { id: 7, question_text: 'Q', options: [{ id: '1', label: 'a' }, { id: '2', label: 'b' }], correct_answer: 2 },
      'counting'
    );
    expect(ok).toMatchObject({ id: '7', prompt: 'Q', audioText: 'Q', correctOptionId: '2', gameType: 'counting' });
  });

  test('colouring labels accept backend rows and bundled templates alike', () => {
    expect(toColoringLabels({ slug: 'apple', name_gu: 'સફરજન', title: 'Apple' })).toEqual({
      id: 'apple', nameGu: 'સફરજન', nameHi: undefined, nameEn: 'Apple',
    });
    expect(toColoringLabels({ id: 'apple', nameEn: 'Apple' })).toEqual({ id: 'apple', nameGu: undefined, nameHi: undefined, nameEn: 'Apple' });
  });

  test('listFrom handles bare arrays, paginated envelopes and junk', () => {
    expect(listFrom([1, 2])).toEqual([1, 2]);
    expect(listFrom({ results: [3] })).toEqual([3]);
    expect(listFrom({ detail: 'nope' })).toEqual([]);
    expect(listFrom(null)).toEqual([]);
  });

  test('error helpers work for Error, DOMException-like and plain values', () => {
    expect(errorMessage(new Error('boom'))).toBe('boom');
    expect(errorMessage('text')).toBe('text');
    expect(errorMessage({ message: 'shape' })).toBe('shape');
    expect(errorMessage(42, 'fallback')).toBe('fallback');
    expect(isAbortError({ name: 'AbortError' })).toBe(true); // RN polyfill is not an Error subclass
    expect(isAbortError(new Error('x'))).toBe(false);
  });
});

describe('type-safety guard', () => {
  const ROOT = path.join(__dirname, '..');
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(ts|tsx)$/.test(entry.name)) files.push(full);
    }
  };
  walk(path.join(ROOT, 'src'));
  walk(path.join(ROOT, 'app'));

  // Type-position `any` only (not the English word inside strings or comments).
  const ANY_IN_TYPE = /(:\s*any\b|\bas any\b|<any\b|\bany>|\bany\[\]|,\s*any\s*[>,)]|\|\s*any\b|\bany\s*\|)/;
  const stripStringsAndComments = (line: string) =>
    line
      .replace(/\/\/.*$/, '')
      .replace(/'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`/g, "''");

  test('no explicit `any` in app or src', () => {
    const offenders: string[] = [];
    for (const f of files) {
      fs.readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('*') || trimmed.startsWith('/*')) return;
        if (ANY_IN_TYPE.test(stripStringsAndComments(line))) offenders.push(`${path.relative(ROOT, f)}:${i + 1}`);
      });
    }
    expect(offenders).toEqual([]);
  });

  test('no @ts-ignore / @ts-nocheck / @ts-expect-error in app or src', () => {
    const offenders = files.filter((f) => /@ts-(ignore|nocheck|expect-error)/.test(fs.readFileSync(f, 'utf8')));
    expect(offenders.map((f) => path.relative(ROOT, f))).toEqual([]);
  });
});
