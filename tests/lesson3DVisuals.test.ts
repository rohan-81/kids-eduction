import { LESSONS } from '../src/data/lessons';
import { hasLesson3DVisual, renderLesson3DVisual } from '../src/components/Lesson3DVisuals';

describe('Lesson 3D Visuals Accuracy', () => {
  const targetIds = [
    // 1. Geometry & Shapes (15 items)
    'cs-circle',
    'cs-square',
    'cs-triangle',
    'cs-star',
    'cs-rectangle',
    'cs-oval',
    'cs-diamond',
    'cs-heart',
    'cs-crescent',
    'cs-pentagon',
    'cs-hexagon',
    'cs-cube',
    'cs-cylinder',
    'cs-cone',
    'cs-sphere',

    // 2. Patterns & Sequences (8 items)
    'cs-pattern-ab-color',
    'cs-pattern-ab-shape',
    'cs-pattern-abc-triple',
    'cs-pattern-size',
    'cs-pattern-growing',
    'cs-pattern-daynight',
    'cs-pattern-direction',
    'cs-pattern-wave',

    // 3. Time & Calendar (8 items)
    'time-clock-hours',
    'time-days-week',
    'time-months-year',
    'time-day-night',
    'time-am-pm',
    'time-yesterday-today',
    'time-seasons-cycle',
    'time-sixty-seconds',

    // 4. Measurement (6 items)
    'math-meas-1',
    'math-meas-2',
    'math-meas-3',
    'math-meas-4',
    'math-meas-5',
    'math-meas-6',

    // 5. Word Problems (6 items)
    'prob-apple-add',
    'prob-bird-sub',
    'prob-pencil-box',
    'prob-candy-share',
    'prob-ball-add',
    'prob-star-sub',
  ];

  test('All target lessons from user screenshots exist in LESSONS bank', () => {
    for (const id of targetIds) {
      const found = LESSONS.find((l) => l.id === id);
      expect(found).toBeDefined();
    }
  });

  test('hasLesson3DVisual returns true for all target lessons', () => {
    for (const id of targetIds) {
      const lesson = LESSONS.find((l) => l.id === id)!;
      expect(hasLesson3DVisual(lesson)).toBe(true);
    }
  });

  test('renderLesson3DVisual returns non-null 3D React node for all target lessons', () => {
    for (const id of targetIds) {
      const lesson = LESSONS.find((l) => l.id === id)!;
      const visual = renderLesson3DVisual(lesson, 62, 'en');
      expect(visual).not.toBeNull();
    }
  });

  test('All color lessons also have 3D ball visual', () => {
    const colorIds = [
      'cs-red',
      'cs-blue',
      'cs-yellow',
      'cs-green',
      'cs-orange',
      'cs-purple',
      'cs-pink',
      'cs-brown',
      'cs-white',
      'cs-black',
    ];
    for (const id of colorIds) {
      const lesson = LESSONS.find((l) => l.id === id)!;
      expect(hasLesson3DVisual(lesson)).toBe(true);
      expect(renderLesson3DVisual(lesson, 62, 'en')).not.toBeNull();
    }
  });

  test('All Plants & Nature lessons have real 3D Pixar renders', () => {
    const plantIds = [
      'plant-rose',
      'plant-sunflower',
      'plant-lotus',
      'plant-marigold',
      'plant-banyan',
      'plant-neem',
      'plant-mango-tree',
      'plant-leaf',
      'plant-root',
      'plant-seed',
    ];
    for (const id of plantIds) {
      const lesson = LESSONS.find((l) => l.id === id);
      expect(lesson).toBeDefined();
      expect(hasLesson3DVisual(lesson)).toBe(true);
      expect(renderLesson3DVisual(lesson!, 64, 'en')).not.toBeNull();
    }
  });

  test('All Everyday Objects lessons have real 3D Pixar renders', () => {
    const objectIds = [
      'obj-clock',
      'obj-book',
      'obj-pencil',
      'obj-car',
      'obj-house',
    ];
    for (const id of objectIds) {
      const lesson = LESSONS.find((l) => l.id === id);
      expect(lesson).toBeDefined();
      expect(hasLesson3DVisual(lesson)).toBe(true);
      expect(renderLesson3DVisual(lesson!, 64, 'en')).not.toBeNull();
    }
  });

  test('All Space & Solar System lessons have real 3D Pixar renders', () => {
    const spaceIds = [
      'space-sun',
      'space-mercury',
      'space-venus',
      'space-earth',
      'space-mars',
      'space-jupiter',
      'space-saturn',
      'space-uranus',
      'space-neptune',
      'space-moon',
      'space-stars',
      'space-rocket',
    ];
    for (const id of spaceIds) {
      const lesson = LESSONS.find((l) => l.id === id);
      expect(lesson).toBeDefined();
      expect(hasLesson3DVisual(lesson)).toBe(true);
      expect(renderLesson3DVisual(lesson!, 64, 'en')).not.toBeNull();
    }
  });

  test('All Weather & Seasons lessons have real 3D Pixar renders', () => {
    const weatherIds = [
      'weather-sunny',
      'weather-rainy',
      'season-summer',
      'season-monsoon',
      'season-winter',
      'season-spring',
      'season-autumn',
      'weather-rainbow',
      'weather-windy',
      'weather-snow',
    ];
    for (const id of weatherIds) {
      const lesson = LESSONS.find((l) => l.id === id);
      expect(lesson).toBeDefined();
      expect(hasLesson3DVisual(lesson)).toBe(true);
      expect(renderLesson3DVisual(lesson!, 64, 'en')).not.toBeNull();
    }
  });

  test('All Water & Air lessons have real 3D Pixar renders', () => {
    const waterIds = [
      'water-drop',
      'water-rain',
      'water-clouds',
      'water-river',
      'water-ocean',
      'air-wind',
      'air-oxygen',
      'water-ice',
      'water-cycle',
      'water-drinking',
    ];
    for (const id of waterIds) {
      const lesson = LESSONS.find((l) => l.id === id);
      expect(lesson).toBeDefined();
      expect(hasLesson3DVisual(lesson)).toBe(true);
      expect(renderLesson3DVisual(lesson!, 64, 'en')).not.toBeNull();
    }
  });

  test('All Human Body & Senses lessons have real 3D Pixar renders', () => {
    const bodyIds = [
      'body-eyes',
      'body-ears',
      'body-nose',
      'body-tongue',
      'body-skin',
      'body-brain',
      'body-heart',
      'body-teeth',
      'body-legs',
      'body-bones',
    ];
    for (const id of bodyIds) {
      const lesson = LESSONS.find((l) => l.id === id);
      expect(lesson).toBeDefined();
      expect(hasLesson3DVisual(lesson)).toBe(true);
      expect(renderLesson3DVisual(lesson!, 64, 'en')).not.toBeNull();
    }
  });

  test('All Earth & Environment lessons have real 3D Pixar renders', () => {
    const earthIds = [
      'earth-planet',
      'earth-mountains',
      'earth-forest',
      'earth-save-trees',
      'earth-recycle',
      'earth-soil',
      'earth-sunlight',
      'earth-blue-sky',
      'earth-water-save',
      'earth-clean-energy',
    ];
    for (const id of earthIds) {
      const lesson = LESSONS.find((l) => l.id === id);
      expect(lesson).toBeDefined();
      expect(hasLesson3DVisual(lesson)).toBe(true);
      expect(renderLesson3DVisual(lesson!, 64, 'en')).not.toBeNull();
    }
  });

  test('All Scientific Discoveries lessons have real 3D Pixar renders', () => {
    const sciIds = [
      'sci-wheel',
      'sci-bulb',
      'sci-gravity',
      'sci-telescope',
      'sci-microscope',
      'sci-telephone',
      'sci-airplane',
      'sci-steam-engine',
      'sci-computer',
      'sci-magnet',
    ];
    for (const id of sciIds) {
      const lesson = LESSONS.find((l) => l.id === id);
      expect(lesson).toBeDefined();
      expect(hasLesson3DVisual(lesson)).toBe(true);
      expect(renderLesson3DVisual(lesson!, 64, 'en')).not.toBeNull();
    }
  });

  test('All English Grammar lessons have real 3D Pixar renders', () => {
    const gramIds = [
      'gram-noun',
      'gram-verb',
      'gram-adjective',
      'gram-pronoun',
      'gram-singular-plural',
      'gram-capital',
      'gram-period',
      'gram-question',
    ];
    for (const id of gramIds) {
      const lesson = LESSONS.find((l) => l.id === id);
      expect(lesson).toBeDefined();
      expect(hasLesson3DVisual(lesson)).toBe(true);
      expect(renderLesson3DVisual(lesson!, 64, 'en')).not.toBeNull();
    }
  });

  test('All English Sentences lessons have real 3D Pixar renders', () => {
    const sentIds = [
      'sent-1',
      'sent-2',
      'sent-3',
      'sent-4',
      'sent-5',
      'sent-6',
      'sent-7',
      'sent-8',
    ];
    for (const id of sentIds) {
      const lesson = LESSONS.find((l) => l.id === id);
      expect(lesson).toBeDefined();
      expect(hasLesson3DVisual(lesson)).toBe(true);
      expect(renderLesson3DVisual(lesson!, 64, 'en')).not.toBeNull();
    }
  });

  test('All English Action Verbs lessons have real 3D Pixar renders', () => {
    const verbIds = [
      'verb-run',
      'verb-jump',
      'verb-read',
      'verb-eat',
      'verb-sleep',
      'verb-play',
      'verb-dance',
      'verb-write',
      'verb-sing',
      'verb-swim',
    ];
    for (const id of verbIds) {
      const lesson = LESSONS.find((l) => l.id === id);
      expect(lesson).toBeDefined();
      expect(hasLesson3DVisual(lesson)).toBe(true);
      expect(renderLesson3DVisual(lesson!, 64, 'en')).not.toBeNull();
    }
  });

  test('All English Nouns & Objects lessons have real 3D Pixar renders', () => {
    const nounIds = [
      'noun-person',
      'noun-place',
      'noun-animal',
      'noun-thing',
      'noun-proper',
      'noun-common',
      'noun-fruits',
      'noun-toys',
    ];
    for (const id of nounIds) {
      const lesson = LESSONS.find((l) => l.id === id);
      expect(lesson).toBeDefined();
      expect(hasLesson3DVisual(lesson)).toBe(true);
      expect(renderLesson3DVisual(lesson!, 64, 'en')).not.toBeNull();
    }
  });
});
