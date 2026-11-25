import { LessonItem } from '../types';
import { LESSONS } from '../data/lessons';
import { findBundledLesson } from '../services/apiService';

/**
 * Where the Home "Resume adventure" button should go: the next unfinished lesson after
 * the most recently completed one, in the same category. `completed` is in completion
 * order (oldest first), as stored in UserProgress.completedLessons. Non-lesson entries
 * (e.g. "rhyme-twinkle") are skipped. Returns null when there is nothing to resume.
 */
export function getResumeLesson(completed: string[], lessons: LessonItem[] = LESSONS): LessonItem | null {
  const done = new Set(completed);
  for (let i = completed.length - 1; i >= 0; i--) {
    const last = findBundledLesson(completed[i]);
    if (!last) continue;
    const inCategory = lessons.filter((l) => l.categoryId === last.categoryId);
    const after = inCategory.slice(inCategory.findIndex((l) => l.id === last.id) + 1);
    const next = after.find((l) => !done.has(l.id)) || inCategory.find((l) => !done.has(l.id));
    if (next) return next;
  }
  return null;
}
