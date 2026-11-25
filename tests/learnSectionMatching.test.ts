import { CATEGORIES } from '../src/data/categories';
import { LESSONS } from '../src/data/lessons';
import { SCIENCE_LESSONS } from '../src/data/lessonsScience';
import { ENGLISH_LESSONS } from '../src/data/lessonsEnglish';
import { GK_LESSONS } from '../src/data/lessonsGK';
import { MATH_LESSONS } from '../src/data/lessonsMath';

describe('Learn Section Category-to-Content Matching Verification', () => {
  test('1. Every new subject category exists in CATEGORIES with unique ID and valid metadata', () => {
    const requiredCategories = [
      // Science
      'plants-nature',
      'human-body',
      'water-air',
      'weather-seasons',
      'earth-environment',
      'space-solar',
      'scientific-discoveries',
      // English
      'en-vowels',
      'en-words',
      'en-grammar',
      'en-nouns',
      'en-verbs',
      'en-sentences',
      // GK
      'gk-states',
      'gk-countries',
      'gk-monuments',
      'gk-history',
      'gk-geography',
      'gk-vehicles',
      'gk-personalities',
      'gk-inventions',
      'gk-symbols',
      'gk-sports',
      // Math
      'math-time',
      'math-money',
      'math-missing',
      'math-word-problems',
    ];

    const categoryIds = new Set(CATEGORIES.map((c) => c.id));
    for (const catId of requiredCategories) {
      expect(categoryIds.has(catId as any)).toBe(true);
      const cat = CATEGORIES.find((c) => c.id === catId);
      expect(cat).toBeDefined();
      expect(cat?.defaultTitle).toBeTruthy();
      expect(cat?.bgColor).toBeTruthy();
    }
  });

  test('2. Science categories have distinct, relevant, and non-empty lessons', () => {
    // Plants & Nature
    const plants = LESSONS.filter((l) => l.categoryId === 'plants-nature');
    expect(plants.length).toBe(10);
    const plantNames = plants.map((l) => (l.exampleWord || '').toLowerCase());
    expect(plantNames).toContain('banyan tree');
    expect(plantNames).toContain('leaf');
    expect(plantNames).toContain('rose');

    // Human Body & Senses
    const body = LESSONS.filter((l) => l.categoryId === 'human-body');
    expect(body.length).toBe(10);
    const bodyParts = body.map((l) => (l.exampleWord || '').toLowerCase());
    expect(bodyParts).toContain('eyes');
    expect(bodyParts).toContain('ears');
    expect(bodyParts).toContain('heart');

    // Water & Air
    const waterAir = LESSONS.filter((l) => l.categoryId === 'water-air');
    expect(waterAir.length).toBe(10);
    const waterAirWords = waterAir.map((l) => (l.exampleWord || '').toLowerCase());
    expect(waterAirWords).toContain('water');
    expect(waterAirWords).toContain('rain');

    // Weather & Seasons
    const weather = LESSONS.filter((l) => l.categoryId === 'weather-seasons');
    expect(weather.length).toBe(10);
    const weatherWords = weather.map((l) => (l.exampleWord || '').toLowerCase());
    expect(weatherWords).toContain('sunny');
    expect(weatherWords).toContain('rainy');
    expect(weatherWords).toContain('winter');

    // Earth & Environment
    const earth = LESSONS.filter((l) => l.categoryId === 'earth-environment');
    expect(earth.length).toBe(10);
    const earthWords = earth.map((l) => (l.exampleWord || '').toLowerCase());
    expect(earthWords).toContain('earth');
    expect(earthWords).toContain('mountains');

    // Space & Solar System
    const space = LESSONS.filter((l) => l.categoryId === 'space-solar');
    expect(space.length).toBe(12);
    const spaceWords = space.map((l) => (l.exampleWord || '').toLowerCase());
    expect(spaceWords).toContain('sun');
    expect(spaceWords).toContain('earth');
    expect(spaceWords).toContain('moon');
    expect(spaceWords).toContain('mars');

    // Scientific Discoveries
    const discoveries = LESSONS.filter((l) => l.categoryId === 'scientific-discoveries');
    expect(discoveries.length).toBe(10);
    const discoveryWords = discoveries.map((l) => (l.exampleWord || '').toLowerCase());
    expect(discoveryWords).toContain('gravity');
    expect(discoveryWords).toContain('wheel');
    expect(discoveryWords).toContain('light bulb');
  });

  test('3. English categories have distinct, relevant, and non-empty lessons', () => {
    // Vowels
    const vowels = LESSONS.filter((l) => l.categoryId === 'en-vowels');
    expect(vowels.length).toBe(5);
    expect(vowels.some((l) => l.id === 'vowel-a')).toBe(true);
    expect(vowels.some((l) => l.id === 'vowel-e')).toBe(true);
    expect(vowels.some((l) => l.id === 'vowel-i')).toBe(true);
    expect(vowels.some((l) => l.id === 'vowel-o')).toBe(true);
    expect(vowels.some((l) => l.id === 'vowel-u')).toBe(true);

    // Word Builder
    const words = LESSONS.filter((l) => l.categoryId === 'en-words');
    expect(words.length).toBe(12);
    const wordList = words.map((l) => (l.exampleWord || '').toLowerCase());
    expect(wordList).toContain('cat');
    expect(wordList).toContain('dog');
    expect(wordList).toContain('sun');

    // Grammar
    const grammar = LESSONS.filter((l) => l.categoryId === 'en-grammar');
    expect(grammar.length).toBe(8);

    // Nouns & Objects
    const nouns = LESSONS.filter((l) => l.categoryId === 'en-nouns');
    expect(nouns.length).toBe(8);

    // Verbs
    const verbs = LESSONS.filter((l) => l.categoryId === 'en-verbs');
    expect(verbs.length).toBe(10);

    // Sentence Formation
    const sentences = LESSONS.filter((l) => l.categoryId === 'en-sentences');
    expect(sentences.length).toBe(8);
  });

  test('4. GK categories have distinct, relevant, and non-empty lessons', () => {
    // States & Capitals
    const states = LESSONS.filter((l) => l.categoryId === 'gk-states');
    expect(states.length).toBe(12);
    expect(states.some((l) => l.title.includes('Gujarat'))).toBe(true);
    expect(states.some((l) => l.title.includes('Maharashtra'))).toBe(true);
    const capitals = states.map((l) => (l.exampleWord || '').toLowerCase());
    expect(capitals).toContain('gandhinagar');
    expect(capitals).toContain('mumbai');

    // Countries & Capitals
    const countries = LESSONS.filter((l) => l.categoryId === 'gk-countries');
    expect(countries.length).toBe(10);
    expect(countries.some((l) => l.title.includes('India'))).toBe(true);
    expect(countries.some((l) => l.title.includes('Japan'))).toBe(true);

    // Famous Monuments
    const monuments = LESSONS.filter((l) => l.categoryId === 'gk-monuments');
    expect(monuments.length).toBe(10);
    const monumentNames = monuments.map((l) => (l.exampleWord || '').toLowerCase());
    expect(monumentNames).toContain('taj mahal');
    expect(monumentNames).toContain('red fort');

    // History & Culture
    const history = LESSONS.filter((l) => l.categoryId === 'gk-history');
    expect(history.length).toBe(10);

    // Geography & Rivers
    const geography = LESSONS.filter((l) => l.categoryId === 'gk-geography');
    expect(geography.length).toBe(10);
    const geoNames = geography.map((l) => (l.exampleWord || '').toLowerCase());
    expect(geoNames).toContain('himalayas');
    expect(geoNames).toContain('ganga');

    // Vehicles & Transport
    const vehicles = LESSONS.filter((l) => l.categoryId === 'gk-vehicles');
    expect(vehicles.length).toBe(10);

    // Famous Personalities
    const personalities = LESSONS.filter((l) => l.categoryId === 'gk-personalities');
    expect(personalities.length).toBe(10);
    expect(personalities.some((l) => l.title.includes('Kalam'))).toBe(true);
    expect(personalities.some((l) => l.title.includes('Tagore'))).toBe(true);

    // Inventions & Discoveries
    const inventions = LESSONS.filter((l) => l.categoryId === 'gk-inventions');
    expect(inventions.length).toBe(10);

    // National Symbols
    const symbols = LESSONS.filter((l) => l.categoryId === 'gk-symbols');
    expect(symbols.length).toBe(10);

    // Sports & Games
    const sports = LESSONS.filter((l) => l.categoryId === 'gk-sports');
    expect(sports.length).toBe(10);
  });

  test('5. Math categories have dedicated, relevant, and non-empty lessons', () => {
    // Time & Calendar
    const time = LESSONS.filter((l) => l.categoryId === 'math-time');
    expect(time.length).toBe(8);

    // Money & Coins
    const money = LESSONS.filter((l) => l.categoryId === 'math-money');
    expect(money.length).toBe(8);

    // Missing Numbers
    const missing = LESSONS.filter((l) => l.categoryId === 'math-missing');
    expect(missing.length).toBe(8);

    // Word Problems
    const wordProblems = LESSONS.filter((l) => l.categoryId === 'math-word-problems');
    expect(wordProblems.length).toBe(6);
  });

  test('6. Trilingual audio prompts and example meanings are present for all new lessons', () => {
    const allNewLessons = [
      ...SCIENCE_LESSONS,
      ...ENGLISH_LESSONS,
      ...GK_LESSONS,
      ...MATH_LESSONS,
    ];

    expect(allNewLessons.length).toBe(255);

    for (const item of allNewLessons) {
      expect(item.id).toBeTruthy();
      expect(item.categoryId).toBeTruthy();
      expect(item.title).toBeTruthy();
      expect(item.audioPrompt).toBeTruthy();
      expect(item.audioPromptGu).toBeTruthy();
      expect(item.audioPromptHi).toBeTruthy();
      expect(item.audioPromptEn).toBeTruthy();
      expect(item.exampleMeaningGu).toBeTruthy();
      expect(item.exampleMeaningHi).toBeTruthy();
      expect(item.visualColor).toBeTruthy();
    }
  });
});
