import { LESSONS } from '../src/data/lessons';
import { filterLessonsForClass } from '../src/utils/ageDetailHelper';

describe('Lesson Count and Progress Calculation Accuracy', () => {
  it('correctly filters animal lessons for age 2-4 and matches completed count', () => {
    const rawAnimalLessons = LESSONS.filter((l) => l.categoryId === 'animals');
    const animalLessons = filterLessonsForClass(rawAnimalLessons, '2-4', 'animals');

    // 2-4 age group must have exactly 8 animals
    expect(animalLessons.length).toBe(8);
    expect(animalLessons[0].id).toBe('an-peacock');
    expect(animalLessons[1].id).toBe('an-cat');
    expect(animalLessons[2].id).toBe('an-dog');
    expect(animalLessons[3].id).toBe('an-cow');

    // Simulated user progress with 4 completed animals (as in screenshot)
    const completedLessons = ['an-peacock', 'an-cat', 'an-dog', 'an-cow'];
    const completedSet = new Set(completedLessons);

    const animalDone = animalLessons.filter((l) =>
      completedSet.has(l.id) ||
      completedSet.has(l.id.replace('an-', 'animal-')) ||
      completedSet.has(l.id.replace('animal-', 'an-'))
    ).length;

    expect(animalDone).toBe(4);
    const percentage = Math.round((animalDone / animalLessons.length) * 100);
    expect(percentage).toBe(50);
  });

  it('correctly filters math/numbers lessons for age 2-4 without ghadiya/math leaking', () => {
    const rawMathLessons = LESSONS.filter((l) => l.categoryId === 'numbers');
    const mathLessons = filterLessonsForClass(rawMathLessons, '2-4', 'numbers');

    // Age 2-4 numbers must be 1 to 10 (10 lessons, not 150)
    expect(mathLessons.length).toBe(10);
    expect(mathLessons.map((l) => l.id)).toEqual([
      'num-1',
      'num-2',
      'num-3',
      'num-4',
      'num-5',
      'num-6',
      'num-7',
      'num-8',
      'num-9',
      'num-10',
    ]);

    // When 10 numbers are completed
    const completedNumbers = mathLessons.map((l) => l.id);
    const completedSet = new Set(completedNumbers);
    const mathDone = mathLessons.filter((l) => completedSet.has(l.id)).length;

    expect(mathDone).toBe(10);
    const percentage = Math.round((mathDone / mathLessons.length) * 100);
    expect(percentage).toBe(100);
  });

  it('ensures filterLessonsForClass does not accept non-number IDs when category is numbers', () => {
    const mixedLessons = [
      { id: 'math-add-1', categoryId: 'math', title: 'Add 1' } as any,
      { id: 'ghadiya-1-1', categoryId: 'ghadiya', title: 'Table 1' } as any,
      { id: 'num-1', categoryId: 'numbers', title: '1' } as any,
      { id: 'num-5', categoryId: 'numbers', title: '5' } as any,
      { id: 'num-15', categoryId: 'numbers', title: '15' } as any,
    ];

    const filtered = filterLessonsForClass(mixedLessons, '2-4', 'numbers');
    expect(filtered.map((l) => l.id)).toEqual(['num-1', 'num-5']);
  });

  it('correctly calculates topic lesson counts for all Math topics on subjects screen', () => {
    // Missing Numbers (math-missing): exactly 8 lessons (not 40!)
    const missing = LESSONS.filter((l) => l.categoryId === 'math-missing');
    expect(missing.length).toBe(8);

    // Decimals (math-dec): exactly 4 lessons (not 40!)
    const decimals = LESSONS.filter((l) => l.categoryId === 'math' && l.id.startsWith('math-dec'));
    expect(decimals.length).toBe(4);

    // Measurement (math-meas): exactly 6 lessons (not 40!)
    const measurement = LESSONS.filter((l) => l.categoryId === 'math' && l.id.startsWith('math-meas'));
    expect(measurement.length).toBe(6);

    // Word Problems (math-word-problems): exactly 6 lessons (not 40!)
    const wordProblems = LESSONS.filter((l) => l.categoryId === 'math-word-problems');
    expect(wordProblems.length).toBe(6);

    // Multiplication (math-mul): exactly 6 lessons
    const multiplication = LESSONS.filter((l) => l.categoryId === 'math' && l.id.startsWith('math-mul'));
    expect(multiplication.length).toBe(6);

    // Division (math-div): exactly 8 lessons
    const division = LESSONS.filter((l) => l.categoryId === 'math' && l.id.startsWith('math-div'));
    expect(division.length).toBe(8);

    // Fractions (math-frac): exactly 4 lessons
    const fractions = LESSONS.filter((l) => l.categoryId === 'math' && l.id.startsWith('math-frac'));
    expect(fractions.length).toBe(4);

    // Time & Calendar (math-time): exactly 8 lessons
    const time = LESSONS.filter((l) => l.categoryId === 'math-time');
    expect(time.length).toBe(8);

    // Money & Coins (math-money): exactly 8 lessons
    const money = LESSONS.filter((l) => l.categoryId === 'math-money');
    expect(money.length).toBe(8);
  });
});

