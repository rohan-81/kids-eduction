import {
  filterLessonsForClass,
  getLessonAgeAdaptation,
  getAgeClassBadgeInfo,
} from '../src/utils/ageDetailHelper';
import { LESSONS } from '../src/data/lessons';
import { LessonItem } from '../src/types';

describe('Progressive Detail and Curriculum by Age Group / Class', () => {
  describe('getAgeClassBadgeInfo', () => {
    it('returns appropriate nursery foundation badge for 2-4', () => {
      const badge = getAgeClassBadgeInfo('2-4', 'gu');
      expect(badge.badgeLabel).toContain('બાલવાટિકા');
      expect(badge.title).toBe('સરળ પાયો');
    });

    it('returns primary foundation badge for 4-6', () => {
      const badge = getAgeClassBadgeInfo('4-6', 'gu');
      expect(badge.badgeLabel).toContain('ધોરણ ૧-૨');
      expect(badge.title).toBe('શબ્દ અને ફોનિક્સ');
    });

    it('returns senior scholar badge for 6-8', () => {
      const badge = getAgeClassBadgeInfo('6-8', 'gu');
      expect(badge.badgeLabel).toContain('ધોરણ ૩-૫');
      expect(badge.title).toBe('સંપૂર્ણ વિગત અને ફેક્ટ્સ');
    });

    it('returns subject-tailored badge info for each subject', () => {
      const mathBadge = getAgeClassBadgeInfo('4-6', 'gu', 'math');
      expect(mathBadge.title).toBe('સરવાળા અને બાદબાકી');

      const scienceBadge = getAgeClassBadgeInfo('4-6', 'gu', 'science');
      expect(scienceBadge.title).toBe('વિજ્ઞાન અને પર્યાવરણ');

      const englishBadge = getAgeClassBadgeInfo('4-6', 'gu', 'english');
      expect(englishBadge.title).toBe('શબ્દ અને ફોનિક્સ');

      const gkBadge = getAgeClassBadgeInfo('4-6', 'gu', 'gk');
      expect(gkBadge.title).toBe('સામાન્ય જ્ઞાન');

      const logicBadge = getAgeClassBadgeInfo('4-6', 'gu', 'logic');
      expect(logicBadge.title).toBe('તાર્કિક વિચારણા');
    });
  });

  describe('filterLessonsForClass', () => {
    it('curates core lessons (max 10) for 2-4 toddlers to prevent cognitive overload', () => {
      const fruits = LESSONS.filter((l) => l.categoryId === 'fruits');
      const filtered = filterLessonsForClass(fruits, '2-4', 'fruits');
      expect(filtered.length).toBeLessThanOrEqual(10);
      expect(filtered.length).toBeGreaterThan(0);
    });

    it('curates junior lessons (max 18) for 4-6 children for progressive categories', () => {
      const gk = LESSONS.filter((l) => l.categoryId === 'gk');
      const filtered = filterLessonsForClass(gk, '4-6', 'gk');
      expect(filtered.length).toBeLessThanOrEqual(18);
      expect(filtered.length).toBeGreaterThanOrEqual(10);
    });

    it('provides all lessons for 6-8 senior students', () => {
      const animals = LESSONS.filter((l) => l.categoryId === 'animals');
      const filtered = filterLessonsForClass(animals, '6-8', 'animals');
      expect(filtered.length).toBe(animals.length);
    });
  });

  describe('getLessonAgeAdaptation', () => {
    const mockLesson: LessonItem = {
      id: 'an-elephant',
      categoryId: 'animals',
      language: 'all',
      ageGroup: 'all',
      symbol: '🐘',
      title: 'Elephant • હાથી • हाथी',
      exampleWord: 'હાથી',
      exampleMeaningGu: 'હાથી સૌથી મોટું જમીનનું પ્રાણી છે.',
      audioPrompt: 'Elephant',
      audioPromptGu: 'હાથી',
    };

    it('provides simple, visual-first format without sentence overload for 2-4', () => {
      const adapt = getLessonAgeAdaptation(mockLesson, '2-4', 'gu');
      expect(adapt.sentenceUsage).toBeNull();
      expect(adapt.funFact).toBeNull();
      expect(adapt.tierBadge.badgeLabel).toContain('બાલવાટિકા');
    });

    it('provides sentence usage and phonics context for 4-6', () => {
      const adapt = getLessonAgeAdaptation(mockLesson, '4-6', 'gu');
      expect(adapt.sentenceUsage).toBe('હાથી સૌથી મોટું જમીનનું પ્રાણી છે.');
      expect(adapt.funFact).toBeTruthy();
      expect(adapt.funFact).toContain('હાથી');
      expect(adapt.tierBadge.badgeLabel).toContain('ધોરણ ૧-૨');
    });

    it('provides rich educational fun fact card for 6-8 in Gujarati', () => {
      const adapt = getLessonAgeAdaptation(mockLesson, '6-8', 'gu');
      expect(adapt.sentenceUsage).toBe('હાથી સૌથી મોટું જમીનનું પ્રાણી છે.');
      expect(adapt.funFact).toBeTruthy();
      expect(adapt.funFact).toContain('હાથી');
      expect(adapt.tierBadge.badgeLabel).toContain('ધોરણ ૩-૫');
    });

    it('ensures cat, horse, parrot have proper Hindi educational facts, not English text', () => {
      const catLesson = LESSONS.find((l) => l.id === 'an-cat')!;
      const horseLesson = LESSONS.find((l) => l.id === 'an-horse')!;
      const parrotLesson = LESSONS.find((l) => l.id === 'an-parrot')!;

      const catAdapt = getLessonAgeAdaptation(catLesson, '6-8', 'hi');
      expect(catAdapt.funFact).toBeTruthy();
      expect(catAdapt.funFact).toContain('बिल्ली');
      expect(catAdapt.funFact).not.toContain('Cute meowing pet');

      const horseAdapt = getLessonAgeAdaptation(horseLesson, '6-8', 'hi');
      expect(horseAdapt.funFact).toBeTruthy();
      expect(horseAdapt.funFact).toContain('घोड़ा');
      expect(horseAdapt.funFact).not.toContain('Fast galloping strong horse');

      const parrotAdapt = getLessonAgeAdaptation(parrotLesson, '6-8', 'hi');
      expect(parrotAdapt.funFact).toBeTruthy();
      expect(parrotAdapt.funFact).toContain('तोता');
      expect(parrotAdapt.funFact).not.toContain('Green chatting clever bird');
    });

    it('guarantees all 20 animal lessons return Hindi facts in Hindi mode without English subtitles', () => {
      const animals = LESSONS.filter((l) => l.categoryId === 'animals');
      for (const a of animals) {
        const adapt = getLessonAgeAdaptation(a, '6-8', 'hi');
        expect(adapt.funFact).toBeTruthy();
        // Should not be identical to the English subtitle
        if (a.subtitle) {
          expect(adapt.funFact).not.toBe(a.subtitle);
        }
      }
    });

    it('ensures Gujarati alphabet lesson "ક - કમળ" displays rich educational fact rather than bare word', () => {
      const kamalLesson = LESSONS.find((l) => l.id === 'gu-vyan-ka')!;
      expect(kamalLesson).toBeDefined();
      const adapt = getLessonAgeAdaptation(kamalLesson, '4-6', 'gu');
      expect(adapt.funFact).toBeTruthy();
      expect(adapt.funFact).not.toBe('કમળ');
      expect(adapt.funFact).toContain('કમળ ભારતનું રાષ્ટ્રીય ફૂલ છે');
    });

    it('ensures woodpecker, penguin, and crane have rich Hindi educational facts without generic english word', () => {
      const woodpecker = LESSONS.find((l) => l.id === 'an-woodpecker')!;
      const penguin = LESSONS.find((l) => l.id === 'an-penguin')!;
      const crane = LESSONS.find((l) => l.id === 'an-crane')!;

      const wpAdapt = getLessonAgeAdaptation(woodpecker, '6-8', 'hi');
      expect(wpAdapt.funFact).toBeTruthy();
      expect(wpAdapt.funFact).toContain('कठफोड़वा');
      expect(wpAdapt.funFact).not.toContain("'Woodpecker'");

      const penAdapt = getLessonAgeAdaptation(penguin, '6-8', 'hi');
      expect(penAdapt.funFact).toBeTruthy();
      expect(penAdapt.funFact).toContain('पेंगुइन');
      expect(penAdapt.funFact).not.toContain("'Penguin'");

      const craneAdapt = getLessonAgeAdaptation(crane, '6-8', 'hi');
      expect(craneAdapt.funFact).toBeTruthy();
      expect(craneAdapt.funFact).toContain('बगुला');
      expect(craneAdapt.funFact).not.toContain("'Crane'");
    });
  });
});
