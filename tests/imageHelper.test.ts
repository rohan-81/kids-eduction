import { getLessonImageSource, LOCAL_ANIMAL_IMAGES, INDIAN_CURRENCY_IMAGES } from '../src/utils/imageHelper';
import { ANIMAL_RENDERS_BY_LESSON } from '../src/utils/animalRenders';
import { EXTRA_RENDERS_BY_LESSON } from '../src/utils/extraRenders';

describe('Animal Image Resolver Tests', () => {
  const allNewlyFixedAnimals = [
    'an-hippo',
    'an-kangaroo',
    'an-cheetah',
    'an-buffalo',
    'an-donkey',
    'an-ox',
    'an-crocodile',
    'an-crow',
    'an-frog',
    'an-koel',
    'an-woodpecker',
    'an-ostrich',
    'an-kingfisher',
    'an-crane',
    'an-swan',
    'an-eagle',
    'an-rhino',
    'an-wolf',
    'an-sheep',
  ];

  test('Direct ID lookup for all fixed animals resolves to their 3D render, else a verified local asset', () => {
    allNewlyFixedAnimals.forEach((id) => {
      const expected = EXTRA_RENDERS_BY_LESSON[id] || ANIMAL_RENDERS_BY_LESSON[id] || LOCAL_ANIMAL_IMAGES[id];
      expect(getLessonImageSource({ id })).toEqual(expected);
    });
  });

  test('every fixed animal keeps a bundled local asset for offline use', () => {
    allNewlyFixedAnimals.forEach((id) => {
      expect(LOCAL_ANIMAL_IMAGES[id]).toBeTruthy();
    });
  });

  test('Legacy inaccurate Unsplash URLs are intercepted and replaced with local authentic photos', () => {
    // Old cat image URL for hippo
    expect(
      getLessonImageSource({ imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600' })
    ).toEqual(LOCAL_ANIMAL_IMAGES['an-hippo']);

    // Old polar bear image URL for kangaroo
    expect(
      getLessonImageSource({ imageUrl: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=600' })
    ).toEqual(LOCAL_ANIMAL_IMAGES['an-kangaroo']);

    // Old sunflower image URL for crow
    expect(
      getLessonImageSource({ imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600' })
    ).toEqual(LOCAL_ANIMAL_IMAGES['an-crow']);

    // Old wrong image URL for frog
    expect(
      getLessonImageSource({ imageUrl: 'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?w=600' })
    ).toEqual(LOCAL_ANIMAL_IMAGES['an-frog']);

    // Donkey
    expect(
      getLessonImageSource({ imageUrl: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?w=600' })
    ).toEqual(LOCAL_ANIMAL_IMAGES['an-donkey']);

    // Ox
    expect(
      getLessonImageSource({ imageUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=600' })
    ).toEqual(LOCAL_ANIMAL_IMAGES['an-ox']);

    // Crocodile
    expect(
      getLessonImageSource({ imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600' })
    ).toEqual(LOCAL_ANIMAL_IMAGES['an-crocodile']);
  });

  test('Keyword matching correctly resolves Gujarati animal names', () => {
    expect(getLessonImageSource({ title: 'Donkey • ગધેડો • गधा' })).toEqual(LOCAL_ANIMAL_IMAGES['an-donkey']);
    expect(getLessonImageSource({ title: 'Ox • બળદ • बैल' })).toEqual(LOCAL_ANIMAL_IMAGES['an-ox']);
    expect(getLessonImageSource({ title: 'Crocodile • મગર • मगरमच्छ' })).toEqual(LOCAL_ANIMAL_IMAGES['an-crocodile']);
    expect(getLessonImageSource({ title: 'Crow • કાગડો • कौआ' })).toEqual(LOCAL_ANIMAL_IMAGES['an-crow']);
    expect(getLessonImageSource({ title: 'Frog • દેડકો • मेंढक' })).toEqual(LOCAL_ANIMAL_IMAGES['an-frog']);
    expect(getLessonImageSource({ title: 'Cuckoo • કોયલ • कोयल' })).toEqual(LOCAL_ANIMAL_IMAGES['an-koel']);
    expect(getLessonImageSource({ title: 'Woodpecker • લક્કડખોદ • कठफोड़वा' })).toEqual(LOCAL_ANIMAL_IMAGES['an-woodpecker']);
    expect(getLessonImageSource({ title: 'Ostrich • શાહમૃગ • शुतुरमुर्ग' })).toEqual(LOCAL_ANIMAL_IMAGES['an-ostrich']);
    expect(getLessonImageSource({ title: 'Kingfisher • કલકલિયો • नीलकंठ' })).toEqual(LOCAL_ANIMAL_IMAGES['an-kingfisher']);
    expect(getLessonImageSource({ title: 'Crane • બગલો • बगुला' })).toEqual(LOCAL_ANIMAL_IMAGES['an-crane']);
    expect(getLessonImageSource({ title: 'Swan • હંસ • हंस' })).toEqual(LOCAL_ANIMAL_IMAGES['an-swan']);
    expect(getLessonImageSource({ title: 'Eagle • ગરુડ • गरुड़' })).toEqual(LOCAL_ANIMAL_IMAGES['an-eagle']);
    expect(getLessonImageSource({ title: 'Rhino • ગેંડો • गैंडा' })).toEqual(LOCAL_ANIMAL_IMAGES['an-rhino']);
    expect(getLessonImageSource({ title: 'Wolf • વરુ • भेड़िया' })).toEqual(LOCAL_ANIMAL_IMAGES['an-wolf']);
    expect(getLessonImageSource({ title: 'Sheep • ઘેટું • भेड़' })).toEqual(LOCAL_ANIMAL_IMAGES['an-sheep']);
  });

  test('Official Indian currency images resolve correctly for all 8 coins and banknotes', () => {
    const currencyIds = [
      'money-coin-1',
      'money-coin-2',
      'money-coin-5',
      'money-coin-10',
      'money-note-10',
      'money-note-20',
      'money-note-50',
      'money-note-100',
    ];

    currencyIds.forEach((id) => {
      expect(INDIAN_CURRENCY_IMAGES[id]).toBeDefined();
      expect(getLessonImageSource({ id, categoryId: 'math-money' })).toEqual(INDIAN_CURRENCY_IMAGES[id]);
    });
  });
});
