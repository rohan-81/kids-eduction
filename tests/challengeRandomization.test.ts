import { TEST_QUESTIONS, getRandomChallengeQuestions } from '../src/data/challengeData';

describe('Challenge Quiz Randomization Tests', () => {
  test('getRandomChallengeQuestions returns exactly 5 questions by default', () => {
    const questions = getRandomChallengeQuestions();
    expect(questions.length).toBe(5);
  });

  test('getRandomChallengeQuestions respects custom count', () => {
    const questions = getRandomChallengeQuestions(3);
    expect(questions.length).toBe(3);
  });

  test('All questions in random selection have valid matching correct answers in options across all languages', () => {
    const questions = getRandomChallengeQuestions(10);
    expect(questions.length).toBe(10);

    for (const q of questions) {
      expect(q.optionsGu).toContain(q.correctAnswerGu);
      expect(q.optionsHi).toContain(q.correctAnswerHi);
      expect(q.optionsEn).toContain(q.correctAnswerEn);
      expect(q.optionsGu.length).toBe(4);
      expect(q.optionsHi.length).toBe(4);
      expect(q.optionsEn.length).toBe(4);
    }
  });

  test('Multiple invocations produce randomized sets (not always identical question 1)', () => {
    const firstSet = getRandomChallengeQuestions(5);
    const setIds = new Set<string>();

    // Call 10 times to ensure we see variety from the pool of 25 questions
    for (let i = 0; i < 10; i++) {
      const set = getRandomChallengeQuestions(5);
      setIds.add(set[0].id);
    }

    // From 25 questions, 10 random rolls should pick more than 1 distinct starting question
    expect(setIds.size).toBeGreaterThan(1);
  });

  test('getRandomChallengeQuestions adapts pool for age groups', () => {
    const nursery = getRandomChallengeQuestions(5, '2-4');
    expect(nursery.length).toBe(5);
    for (const q of nursery) {
      expect(['2-4', 'all', undefined]).toContain(q.ageGroup);
    }

    const senior = getRandomChallengeQuestions(5, '6-8');
    expect(senior.length).toBe(5);
    for (const q of senior) {
      expect(['6-8', '4-6', 'all', undefined]).toContain(q.ageGroup);
    }
  });
});
