import { GAME_QUESTIONS } from '../src/data/gamesData';
import { GameType, AppLanguage } from '../src/types';

describe('Game questions count verification', () => {
  it('ensures all interactive quiz and puzzle games have at least 10 questions in gu, hi, and en', () => {
    const requiredMin = 10;
    const testGames: GameType[] = [
      'balloon-pop',
      'find-letter',
      'missing-letter',
      'math-quiz',
      'counting',
      'find-object',
      'colors-shapes',
      'listen-choose',
      'odd-one-out',
      'logic-reasoning',
      'picture-matching',
      'picture-puzzle',
    ];

    const failures: string[] = [];

    for (const game of testGames) {
      const langs = GAME_QUESTIONS[game];
      for (const lang of ['gu', 'hi', 'en'] as AppLanguage[]) {
        const questions = langs[lang];
        if (!questions || questions.length < requiredMin) {
          failures.push(`${game} [${lang}]: only has ${questions?.length || 0} questions`);
        }
      }
    }

    if (failures.length > 0) {
      console.log('Fewer than 10 questions in:\n' + failures.join('\n'));
    }
    expect(failures).toEqual([]);
  });
});
