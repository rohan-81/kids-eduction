import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  Animated,
  Pressable,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { soundEffects } from '../src/services/soundEffects';
import { useApp } from '../src/context/AppContext';
import { BottomNav } from '../src/components/BottomNav';
import { LESSONS } from '../src/data/lessons';
import { STORIES_DATA } from '../src/data/storiesData';
import { ProgressRing } from '../src/components/clay';
import { RHYMES_DATA } from '../src/data/rhymesData';
import { kidTones, kidPalette, clayShadow, toneAt } from '../src/theme/kidTheme';
import { AppGlobalBackground } from '../src/components/common/AppGlobalBackground';
import { filterLessonsForClass } from '../src/utils/ageDetailHelper';
import {
  // Math badges
  TopicNumberSenseBadge,
  TopicAdditionBadge,
  TopicSubtractionBadge,
  TopicMultiplicationBadge,
  TopicDivisionBadge,
  TopicFractionsBadge,
  TopicDecimalsBadge,
  TopicGeometryBadge,
  TopicMeasurementBadge,
  TopicTimeBadge,
  TopicMoneyBadge,
  TopicPatternsBadge,
  TopicAlgebraBadge,
  TopicWordProblemsBadge,
  // Science badges
  TopicAnimalsBadge,
  TopicPlantsBadge,
  TopicHumanBodyBadge,
  TopicFoodBadge,
  TopicWaterAirBadge,
  TopicWeatherBadge,
  TopicEarthBadge,
  TopicSpaceBadge,
  TopicMatterBadge,
  TopicDiscoveriesBadge,
  // English badges
  TopicAlphabetBadge,
  TopicPhonicsBadge,
  TopicVowelsBadge,
  TopicVocabularyBadge,
  TopicGrammarBadge,
  TopicNounsBadge,
  TopicVerbsBadge,
  TopicSentencesBadge,
  TopicRhymesBadge,
  TopicComprehensionBadge,
  TopicSpellingBadge,
  // GK badges
  TopicOurWorldBadge,
  TopicCountriesCapitalsBadge,
  TopicMonumentsBadge,
  TopicHistoryBadge,
  TopicGeographyBadge,
  TopicVehiclesBadge,
  TopicPersonalitiesBadge,
  TopicInventionsBadge,
  TopicNationalSymbolsBadge,
  TopicSportsBadge,
  TopicFactsBadge,
  // Logic badges
  TopicLogicalReasoningBadge,
  TopicNumberSeriesBadge,
  TopicPatternRecognitionBadge,
  TopicOddOneOutBadge,
  TopicPuzzlesBadge,
  TopicShapesSequencesBadge,
  TopicCodingDecodingBadge,
  TopicCriticalThinkingBadge,
} from '../src/components/SubjectBadgeIcons';
import { toGujDigits, toHiDigits, formatNumberDigits } from '../src/utils/languageData';
import { getAgeClassBadgeInfo } from '../src/utils/ageDetailHelper';
import { SUBJECT_CARD_ART } from '../src/utils/imageHelper';
import { webStyle } from '../src/utils/webStyle';
import type { AppRoute } from '../src/utils/navigationHelper';

const useNativeDriver = Platform.OS !== 'web';

/** Topic card that squashes down onto its candy lip and springs back (soft rubber feel). */
const SpringTopicCard: React.FC<{
  style: StyleProp<ViewStyle>;
  onPress: () => void;
  accessibilityLabel: string;
  children: React.ReactNode;
}> = ({ style, onPress, accessibilityLabel, children }) => {
  const press = useRef(new Animated.Value(0)).current;
  const translateY = press.interpolate({ inputRange: [0, 1], outputRange: [0, 3] });
  const scale = press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.975] });
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => Animated.timing(press, { toValue: 1, duration: 80, useNativeDriver }).start()}
      onPressOut={() => Animated.spring(press, { toValue: 0, friction: 4, tension: 170, useNativeDriver }).start()}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View style={[style, { transform: [{ translateY }, { scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
};

type SubjectKey = 'math' | 'science' | 'english' | 'gk' | 'logic';

interface TopicItem {
  id: string;
  name: string;
  subtitle?: string;
  count: string;
  totalCount?: number;
  icon: React.ReactNode;
  route: AppRoute;
  minAge?: '2-4' | '4-6' | '6-8';
}

export default function SubjectsScreen() {
  const router = useRouter();
  const { subjectId } = useLocalSearchParams<{ subjectId?: string }>();
  const { language, ageGroup, progress } = useApp();

  const [activeSubject, setActiveSubject] = useState<SubjectKey>(() => {
    if (
      subjectId === 'science' ||
      subjectId === 'english' ||
      subjectId === 'gk' ||
      subjectId === 'logic'
    ) {
      return subjectId;
    }
    return 'math';
  });

  useEffect(() => {
    if (
      subjectId === 'science' ||
      subjectId === 'english' ||
      subjectId === 'gk' ||
      subjectId === 'logic' ||
      subjectId === 'math'
    ) {
      setActiveSubject(subjectId);
    }
  }, [subjectId]);

  const getDynamicTopicCount = (
    categoryId: string,
    subcategoryId?: string,
    fallbackCount: number = 10
  ): number => {
    if (categoryId === 'colors-shapes') {
      const allCS = LESSONS.filter((l) => l.categoryId === 'colors-shapes');
      if (subcategoryId === 'geometry' || subcategoryId === 'shapes') {
        const colorIds = [
          'cs-red', 'cs-blue', 'cs-yellow', 'cs-green', 'cs-orange',
          'cs-purple', 'cs-pink', 'cs-brown', 'cs-white', 'cs-black',
        ];
        return allCS.filter((l) => !colorIds.includes(l.id) && !l.id.startsWith('cs-pattern')).length;
      }
      if (subcategoryId === 'patterns') {
        return allCS.filter((l) => l.id.startsWith('cs-pattern')).length;
      }
    }
    if (categoryId === 'math') {
      const allMath = LESSONS.filter((l) => l.categoryId === 'math');
      if (subcategoryId === 'addition') return allMath.filter((l) => l.id.startsWith('math-add')).length;
      if (subcategoryId === 'subtraction') return allMath.filter((l) => l.id.startsWith('math-sub')).length;
      if (subcategoryId === 'multiplication') return allMath.filter((l) => l.id.startsWith('math-mul')).length;
      if (subcategoryId === 'division') return allMath.filter((l) => l.id.startsWith('math-div')).length;
      if (subcategoryId === 'fractions') return allMath.filter((l) => l.id.startsWith('math-frac')).length;
      if (subcategoryId === 'measurement') return allMath.filter((l) => l.id.startsWith('math-meas')).length;
      if (subcategoryId === 'decimals') return allMath.filter((l) => l.id.startsWith('math-dec')).length;
    }
    const catLessons = LESSONS.filter((l) => l.categoryId === categoryId);
    if (catLessons.length > 0) {
      return filterLessonsForClass(catLessons, ageGroup, categoryId).length;
    }
    return fallbackCount;
  };

  const formatTopicCount = (count: number) => {
    if (language === 'gu') return `${toGujDigits(count)} વિષયો`;
    if (language === 'hi') return `${toHiDigits(count)} विषय`;
    return `${count} Topics`;
  };

  const getTopicProgressStats = (topic: TopicItem) => {
    const completedSet = new Set(progress.completedLessons || []);

    if (topic.route === '/stories') {
      const storyIds = STORIES_DATA.map((s) => s.id);
      const done = storyIds.filter((id) => completedSet.has(id)).length;
      const total = topic.totalCount || STORIES_DATA.length;
      const percent = Math.min(100, Math.round((done / total) * 100));
      return { done, total, percent };
    }

    if (topic.route.startsWith('/rhymes')) {
      const langMatch = topic.route.match(/[?&]lang=([^&]+)/);
      const rhymeLang = langMatch ? langMatch[1] : undefined;
      const rhymeKeys = RHYMES_DATA.filter((r) => !rhymeLang || r.categoryLang === rhymeLang).map((r) => r.id);
      const done = rhymeKeys.filter((id) => {
        const clean = id.replace(/^rhyme-/, '');
        return completedSet.has(id) || completedSet.has(`rhyme-${clean}`) || completedSet.has(`rhyme_${clean}`) || completedSet.has(`rhyme_${id}`);
      }).length;
      const total = rhymeKeys.length || topic.totalCount || 1;
      const percent = Math.min(100, Math.round((done / total) * 100));
      return { done, total, percent };
    }

    let relevantLessons: typeof LESSONS = [];

    const catMatch = topic.route.match(/[?&]categoryId=([^&]+)/);
    const subMatch = topic.route.match(/[?&]subcategoryId=([^&]+)/);
    const catId = catMatch ? catMatch[1] : undefined;
    const subCatId = subMatch ? subMatch[1] : undefined;

    if (catId === 'colors-shapes') {
      const allCS = LESSONS.filter((l) => l.categoryId === 'colors-shapes');
      const colorIds = [
        'cs-red', 'cs-blue', 'cs-yellow', 'cs-green', 'cs-orange',
        'cs-purple', 'cs-pink', 'cs-brown', 'cs-white', 'cs-black',
      ];
      if (topic.id === 'patterns' || subCatId === 'patterns') {
        relevantLessons = allCS.filter((l) => l.id.startsWith('cs-pattern'));
      } else if (subCatId === 'geometry' || subCatId === 'shapes' || topic.id === 'shapes-sequences') {
        relevantLessons = allCS.filter((l) => !colorIds.includes(l.id) && !l.id.startsWith('cs-pattern'));
      } else if (subCatId === 'colors' || topic.id === 'colors') {
        relevantLessons = allCS.filter((l) => colorIds.includes(l.id));
      } else {
        relevantLessons = allCS.filter((l) => !l.id.startsWith('cs-pattern'));
      }
    } else if (catId === 'math') {
      const allMath = LESSONS.filter((l) => l.categoryId === 'math');
      const op = (subCatId || topic.id || '').toLowerCase();
      if (op === 'addition') {
        relevantLessons = allMath.filter((l) => l.id.startsWith('math-add'));
      } else if (op === 'subtraction') {
        relevantLessons = allMath.filter((l) => l.id.startsWith('math-sub'));
      } else if (op === 'multiplication') {
        relevantLessons = allMath.filter((l) => l.id.startsWith('math-mul'));
      } else if (op === 'division') {
        relevantLessons = allMath.filter((l) => l.id.startsWith('math-div'));
      } else if (op === 'fractions') {
        relevantLessons = allMath.filter((l) => l.id.startsWith('math-frac'));
      } else if (op === 'decimals') {
        relevantLessons = allMath.filter((l) => l.id.startsWith('math-dec'));
      } else if (op === 'measurement') {
        relevantLessons = allMath.filter((l) => l.id.startsWith('math-meas'));
      } else {
        relevantLessons = allMath;
      }
    } else if (catId) {
      relevantLessons = LESSONS.filter((l) => l.categoryId === catId);
    } else {
      relevantLessons = [];
    }

    const resolvedCatId = catId || 'math';
    const filtered = filterLessonsForClass(relevantLessons, ageGroup, resolvedCatId);
    let total = filtered.length > 0 ? filtered.length : (topic.totalCount || relevantLessons.length || 1);
    let done = filtered.length > 0
      ? filtered.filter((l) => completedSet.has(l.id)).length
      : Array.from(completedSet).filter((id) => id.includes(topic.id)).length;

    if (!catId && filtered.length === 0) {
      const gameMatch = topic.route.match(/^\/games\/([^/?]+)/) || topic.route.match(/[?&]type=([^&]+)/);
      const gameKey = gameMatch ? gameMatch[1] : topic.route === '/challenge' ? 'challenge' : null;
      const gStats = gameKey ? progress.gameStats?.[gameKey] : undefined;
      if (topic.totalCount === undefined) {
        total = topic.route === '/challenge' ? 25 : 10;
      }
      if (gStats && gStats.timesPlayed > 0) {
        done = Math.min(total, Math.max(1, gStats.highScore || 1));
      }
    }
    const percent = Math.min(100, Math.round((done / total) * 100));
    return { done, total, percent };
  };

  // Math Topics (Accurately counted and strictly routed to dedicated lessons)
  const mathTopics: TopicItem[] = [
    {
      id: 'num-sense',
      name:
        ageGroup === '2-4'
          ? language === 'gu'
            ? 'ગણતરીની મજા'
            : language === 'hi'
              ? 'गिनती का मज़ा'
              : 'Counting Fun'
          : language === 'gu'
            ? 'સંખ્યા ઓળખ (૧-૩૦)'
            : language === 'hi'
              ? 'संख्या बोध (१-३०)'
              : 'Counting Fun',
      subtitle:
        language === 'gu'
          ? '૧ થી ૧૦ અંકો શીખો'
          : language === 'hi'
            ? '१ से १० संख्याएं सीखें'
            : 'Learn numbers 1 to 10',
      count: formatTopicCount(getDynamicTopicCount('numbers', undefined, ageGroup === '2-4' ? 10 : 30)),
      icon: <TopicNumberSenseBadge size={56} />,
      route: '/lessons?categoryId=numbers',
      minAge: '2-4',
    },
    {
      id: 'geometry',
      name: language === 'gu' ? 'આપણી આસપાસના આકારો' : language === 'hi' ? 'हमारे आसपास के आकार' : 'Shapes Around Us',
      subtitle:
        language === 'gu'
          ? 'વિવિધ આકારોનું અન્વેષણ કરો'
          : language === 'hi'
            ? 'विभिन्न आकारों को समझें'
            : 'Explore different shapes',
      count: formatTopicCount(15),
      icon: <TopicGeometryBadge size={56} />,
      route: '/lessons?categoryId=colors-shapes&subcategoryId=geometry',
      minAge: '2-4',
    },
    {
      id: 'patterns',
      name: language === 'gu' ? 'પેટર્ન રમત' : language === 'hi' ? 'पैटर्न खेल' : 'Patterns Play',
      subtitle:
        language === 'gu'
          ? 'પેટર્ન શોધો અને પૂર્ણ કરો'
          : language === 'hi'
            ? 'पैटर्न पहचानें और पूरा करें'
            : 'Find and complete patterns',
      count: formatTopicCount(8),
      icon: <TopicPatternsBadge size={56} />,
      route: '/lessons?categoryId=colors-shapes&subcategoryId=patterns',
      minAge: '2-4',
    },
    {
      id: 'addition',
      name: language === 'gu' ? 'સરવાળા' : language === 'hi' ? 'जोड़' : 'Addition',
      subtitle:
        language === 'gu'
          ? 'સરળ સરવાળા શીખો'
          : language === 'hi'
            ? 'सरल जोड़ सीखें'
            : 'Learn basic addition',
      count: formatTopicCount(6),
      totalCount: 6,
      icon: <TopicAdditionBadge size={56} />,
      route: '/lessons?categoryId=math&subcategoryId=addition',
      minAge: '4-6',
    },
    {
      id: 'subtraction',
      name: language === 'gu' ? 'બાદબાકી' : language === 'hi' ? 'घटाव' : 'Subtraction',
      count: formatTopicCount(6),
      totalCount: 6,
      icon: <TopicSubtractionBadge size={56} />,
      route: '/lessons?categoryId=math&subcategoryId=subtraction',
      minAge: '4-6',
    },
    {
      id: 'time',
      name: language === 'gu' ? 'સમય અને કેલેન્ડર' : language === 'hi' ? 'समय और कैलेंडर' : 'Time & Calendar',
      count: formatTopicCount(8),
      totalCount: 8,
      icon: <TopicTimeBadge size={56} />,
      route: '/lessons?categoryId=math-time',
      minAge: '4-6',
    },
    {
      id: 'money',
      name: language === 'gu' ? 'નાણાં અને સિક્કા' : language === 'hi' ? 'मुद्रा और सिक्के' : 'Money & Coins',
      count: formatTopicCount(8),
      totalCount: 8,
      icon: <TopicMoneyBadge size={56} />,
      route: '/lessons?categoryId=math-money',
      minAge: '4-6',
    },
    {
      id: 'algebra',
      name: language === 'gu' ? 'ખૂટતી સંખ્યાઓ' : language === 'hi' ? 'लुप्त संख्याएं' : 'Missing Numbers',
      count: formatTopicCount(8),
      totalCount: 8,
      icon: <TopicAlgebraBadge size={56} />,
      route: '/lessons?categoryId=math-missing',
      minAge: '4-6',
    },
    {
      id: 'multiplication',
      name: language === 'gu' ? 'ગુણાકાર' : language === 'hi' ? 'गुणा' : 'Multiplication',
      count: formatTopicCount(6),
      totalCount: 6,
      icon: <TopicMultiplicationBadge size={56} />,
      route: '/lessons?categoryId=math&subcategoryId=multiplication',
      minAge: '6-8',
    },
    {
      id: 'division',
      name: language === 'gu' ? 'ભાગાકાર' : language === 'hi' ? 'भाग' : 'Division',
      count: formatTopicCount(8),
      totalCount: 8,
      icon: <TopicDivisionBadge size={56} />,
      route: '/lessons?categoryId=math&subcategoryId=division',
      minAge: '6-8',
    },
    {
      id: 'fractions',
      name: language === 'gu' ? 'અપૂર્ણાંક' : language === 'hi' ? 'भिन्न' : 'Fractions',
      count: formatTopicCount(4),
      totalCount: 4,
      icon: <TopicFractionsBadge size={56} />,
      route: '/lessons?categoryId=math&subcategoryId=fractions',
      minAge: '6-8',
    },
    {
      id: 'decimals',
      name: language === 'gu' ? 'દશાંશ સંખ્યાઓ' : language === 'hi' ? 'दशमलव' : 'Decimals',
      count: formatTopicCount(4),
      totalCount: 4,
      icon: <TopicDecimalsBadge size={56} />,
      route: '/lessons?categoryId=math&subcategoryId=decimals',
      minAge: '6-8',
    },
    {
      id: 'measurement',
      name: language === 'gu' ? 'માપન' : language === 'hi' ? 'मापन' : 'Measurement',
      count: formatTopicCount(6),
      totalCount: 6,
      icon: <TopicMeasurementBadge size={56} />,
      route: '/lessons?categoryId=math&subcategoryId=measurement',
      minAge: '6-8',
    },
    {
      id: 'word-problems',
      name: language === 'gu' ? 'વ્યવહારુ કોયડાઓ' : language === 'hi' ? 'इबारती सवाल' : 'Word Problems',
      count: formatTopicCount(6),
      totalCount: 6,
      icon: <TopicWordProblemsBadge size={56} />,
      route: '/lessons?categoryId=math-word-problems',
      minAge: '6-8',
    },
  ];

  // Science Topics (Accurately counted matching lessons & activities)
  const scienceTopics: TopicItem[] = [
    {
      id: 'animals',
      name: language === 'gu' ? 'પ્રાણીઓ અને પક્ષીઓ' : language === 'hi' ? 'जानवर और पक्षी' : 'Animals & Birds',
      count: formatTopicCount(getDynamicTopicCount('animals', undefined, 8)),
      icon: <TopicAnimalsBadge size={56} />,
      route: '/lessons?categoryId=animals',
      minAge: '2-4',
    },
    {
      id: 'food',
      name: language === 'gu' ? 'ફળો અને શાકભાજી' : language === 'hi' ? 'फल और सब्जियां' : 'Fruits & Vegetables',
      count: formatTopicCount(getDynamicTopicCount('fruits', undefined, 5)),
      icon: <TopicFoodBadge size={56} />,
      route: '/lessons?categoryId=fruits',
      minAge: '2-4',
    },
    {
      id: 'nature',
      name: language === 'gu' ? 'કુદરત અને વનસ્પતિ' : language === 'hi' ? 'प्रकृति और पौधे' : 'Plants & Nature',
      count: formatTopicCount(10),
      icon: <TopicPlantsBadge size={56} />,
      route: '/lessons?categoryId=plants-nature',
      minAge: '2-4',
    },
    {
      id: 'matter',
      name: language === 'gu' ? 'રોજિંદી વસ્તુઓ' : language === 'hi' ? 'दैनिक वस्तुएं' : 'Everyday Objects',
      count: formatTopicCount(10),
      icon: <TopicMatterBadge size={56} />,
      route: '/lessons?categoryId=objects',
      minAge: '2-4',
    },
    {
      id: 'human-body',
      name: language === 'gu' ? 'માનવ શરીર અને ઇન્દ્રિયો' : language === 'hi' ? 'मानव शरीर और इंद्रियां' : 'Human Body & Senses',
      count: formatTopicCount(10),
      icon: <TopicHumanBodyBadge size={56} />,
      route: '/lessons?categoryId=human-body',
      minAge: '4-6',
    },
    {
      id: 'water-air',
      name: language === 'gu' ? 'પાણી અને હવા' : language === 'hi' ? 'पानी और हवा' : 'Water & Air',
      count: formatTopicCount(10),
      icon: <TopicWaterAirBadge size={56} />,
      route: '/lessons?categoryId=water-air',
      minAge: '4-6',
    },
    {
      id: 'weather',
      name: language === 'gu' ? 'હવામાન અને ઋતુઓ' : language === 'hi' ? 'मौसम और ऋतुएं' : 'Weather & Seasons',
      count: formatTopicCount(10),
      icon: <TopicWeatherBadge size={56} />,
      route: '/lessons?categoryId=weather-seasons',
      minAge: '4-6',
    },
    {
      id: 'earth',
      name: language === 'gu' ? 'પૃથ્વી અને પર્યાવરણ' : language === 'hi' ? 'पृथ्वी और पर्यावरण' : 'Earth & Environment',
      count: formatTopicCount(10),
      icon: <TopicEarthBadge size={56} />,
      route: '/lessons?categoryId=earth-environment',
      minAge: '6-8',
    },
    {
      id: 'solar-system',
      name: language === 'gu' ? 'સૌરમંડળ અને ગ્રહો' : language === 'hi' ? 'सौरमंडल और अंतरिक्ष' : 'Space & Solar System',
      count: formatTopicCount(12),
      icon: <TopicSpaceBadge size={56} />,
      route: '/lessons?categoryId=space-solar',
      minAge: '6-8',
    },
    {
      id: 'discoveries',
      name: language === 'gu' ? 'વૈજ્ઞાનિક શોધો' : language === 'hi' ? 'वैज्ञानिक खोजें' : 'Scientific Discoveries',
      count: formatTopicCount(10),
      icon: <TopicDiscoveriesBadge size={56} />,
      route: '/lessons?categoryId=scientific-discoveries',
      minAge: '6-8',
    },
  ];

  // English Topics (Accurately counted matching lessons & activities)
  const englishTopics: TopicItem[] = [
    {
      id: 'alphabets',
      name: language === 'gu' ? 'મૂળાક્ષરો (A to Z)' : language === 'hi' ? 'वर्णमाला (A to Z)' : 'Alphabet A-Z',
      count: formatTopicCount(getDynamicTopicCount('en-alphabet', undefined, 10)),
      icon: <TopicAlphabetBadge size={56} />,
      route: '/lessons?categoryId=en-alphabet',
      minAge: '2-4',
    },
    {
      id: 'rhymes',
      name:
        language === 'gu'
          ? 'અંગ્રેજી બાળગીતો'
          : language === 'hi'
            ? 'अंग्रेजी बालगीत'
            : 'English Rhymes & Songs',
      subtitle:
        language === 'gu'
          ? 'સંગીતમય ગીતો આગામી અપડેટમાં'
          : language === 'hi'
            ? 'संगीतमय बालगीत नए अपडेट में'
            : 'Musical songs in next update',
      count: '8',
      totalCount: 8,
      icon: <TopicRhymesBadge size={56} />,
      route: '/rhymes?lang=en',
      minAge: '2-4',
    },
    {
      id: 'phonics',
      name: language === 'gu' ? 'ફોનિક્સ અવાજો' : language === 'hi' ? 'ध्वनियां' : 'Phonics Sounds',
      count: formatTopicCount(getDynamicTopicCount('en-phonics', undefined, 8)),
      icon: <TopicPhonicsBadge size={56} />,
      route: '/lessons?categoryId=en-phonics',
      minAge: '4-6',
    },
    {
      id: 'vowels',
      name: language === 'gu' ? 'સ્વર' : language === 'hi' ? 'स्वर' : 'Vowels',
      count: formatTopicCount(5),
      icon: <TopicVowelsBadge size={56} />,
      route: '/lessons?categoryId=en-vowels',
      minAge: '4-6',
    },
    {
      id: 'words',
      name: language === 'gu' ? 'શબ્દ નિર્માણ' : language === 'hi' ? 'शब्द निर्माण' : 'Word Builder',
      count: formatTopicCount(12),
      icon: <TopicVocabularyBadge size={56} />,
      route: '/lessons?categoryId=en-words',
      minAge: '4-6',
    },
    {
      id: 'nouns',
      name: language === 'gu' ? 'વસ્તુઓના નામ' : language === 'hi' ? 'वस्तुओं के नाम' : 'Nouns & Objects',
      count: formatTopicCount(8),
      icon: <TopicNounsBadge size={56} />,
      route: '/lessons?categoryId=en-nouns',
      minAge: '4-6',
    },
    {
      id: 'spelling',
      name: language === 'gu' ? 'સ્પેલિંગ ક્વિઝ' : language === 'hi' ? 'वर्तनी क्विज़' : 'Spelling Quiz',
      count: formatTopicCount(5),
      icon: <TopicSpellingBadge size={56} />,
      route: '/games?type=missing-letter',
      minAge: '4-6',
    },
    {
      id: 'verbs',
      name: language === 'gu' ? 'ક્રિયાપદો' : language === 'hi' ? 'क्रियाएं' : 'Verbs',
      count: formatTopicCount(10),
      icon: <TopicVerbsBadge size={56} />,
      route: '/lessons?categoryId=en-verbs',
      minAge: '6-8',
    },
    {
      id: 'sentences',
      name: language === 'gu' ? 'વાક્ય રચના' : language === 'hi' ? 'वाक्य निर्माण' : 'Sentence Formation',
      count: formatTopicCount(8),
      icon: <TopicSentencesBadge size={56} />,
      route: '/lessons?categoryId=en-sentences',
      minAge: '6-8',
    },
    {
      id: 'grammar',
      name: language === 'gu' ? 'અંગ્રેજી વ્યાકરણ' : language === 'hi' ? 'व्याकरण' : 'Grammar',
      count: formatTopicCount(8),
      icon: <TopicGrammarBadge size={56} />,
      route: '/lessons?categoryId=en-grammar',
      minAge: '6-8',
    },
    {
      id: 'comprehension',
      name: language === 'gu' ? 'વાર્તા અને અર્થગ્રહણ' : language === 'hi' ? 'कहानी और बोध' : 'Comprehension Stories',
      count: formatTopicCount(8),
      totalCount: 8,
      icon: <TopicComprehensionBadge size={56} />,
      route: '/stories',
      minAge: '6-8',
    },
  ];

  // GK Topics (Accurately counted matching lessons & challenge quiz)
  const gkTopics: TopicItem[] = [
    {
      id: 'our-world',
      name: language === 'gu' ? 'સામાન્ય જ્ઞાન' : language === 'hi' ? 'सामान्य ज्ञान' : 'General Knowledge',
      count: formatTopicCount(getDynamicTopicCount('gk', undefined, 6)),
      icon: <TopicOurWorldBadge size={56} />,
      route: '/lessons?categoryId=gk',
      minAge: '2-4',
    },
    {
      id: 'symbols',
      name: language === 'gu' ? 'રાષ્ટ્રીય પ્રતીકો' : language === 'hi' ? 'राष्ट्रीय प्रतीक' : 'National Symbols',
      count: formatTopicCount(10),
      icon: <TopicNationalSymbolsBadge size={56} />,
      route: '/lessons?categoryId=gk-symbols',
      minAge: '2-4',
    },
    {
      id: 'vehicles',
      name: language === 'gu' ? 'વાહનો અને પરિવહન' : language === 'hi' ? 'वाहन और परिवहन' : 'Vehicles & Transport',
      count: formatTopicCount(10),
      icon: <TopicVehiclesBadge size={56} />,
      route: '/lessons?categoryId=gk-vehicles',
      minAge: '2-4',
    },
    {
      id: 'monuments',
      name: language === 'gu' ? 'પ્રખ્યાત સ્મારકો' : language === 'hi' ? 'प्रसिद्ध स्मारक' : 'Famous Monuments',
      count: formatTopicCount(10),
      icon: <TopicMonumentsBadge size={56} />,
      route: '/lessons?categoryId=gk-monuments',
      minAge: '4-6',
    },
    {
      id: 'sports',
      name: language === 'gu' ? 'રમતો અને ખેલકૂદ' : language === 'hi' ? 'खेल और खिलाड़ी' : 'Sports',
      count: formatTopicCount(10),
      icon: <TopicSportsBadge size={56} />,
      route: '/lessons?categoryId=gk-sports',
      minAge: '4-6',
    },
    {
      id: 'facts',
      name: language === 'gu' ? 'જનરલ ક્વિઝ ચેલેન્જ' : language === 'hi' ? 'जनरल क्विज़ चुनौती' : 'Quiz Challenge',
      count: formatTopicCount(25),
      icon: <TopicFactsBadge size={56} />,
      route: '/challenge',
      minAge: '4-6',
    },
    {
      id: 'countries',
      name: language === 'gu' ? 'દેશો અને રાજધાની' : language === 'hi' ? 'देश और राजधानियां' : 'Countries & Capitals',
      count: formatTopicCount(10),
      icon: <TopicCountriesCapitalsBadge size={56} />,
      route: '/lessons?categoryId=gk-countries',
      minAge: '6-8',
    },
    {
      id: 'history',
      name: language === 'gu' ? 'ઇતિહાસ અને સંસ્કૃતિ' : language === 'hi' ? 'इतिहास' : 'History',
      count: formatTopicCount(10),
      icon: <TopicHistoryBadge size={56} />,
      route: '/lessons?categoryId=gk-history',
      minAge: '6-8',
    },
    {
      id: 'geography',
      name: language === 'gu' ? 'ભૂગોળ અને નદીઓ' : language === 'hi' ? 'भूगोल' : 'Geography',
      count: formatTopicCount(10),
      icon: <TopicGeographyBadge size={56} />,
      route: '/lessons?categoryId=gk-geography',
      minAge: '6-8',
    },
    {
      id: 'personalities',
      name: language === 'gu' ? 'મહાન વ્યક્તિઓ' : language === 'hi' ? 'महान हस्तियां' : 'Famous Personalities',
      count: formatTopicCount(10),
      icon: <TopicPersonalitiesBadge size={56} />,
      route: '/lessons?categoryId=gk-personalities',
      minAge: '6-8',
    },
    {
      id: 'inventions',
      name: language === 'gu' ? 'શોધો અને સંશોધનો' : language === 'hi' ? 'आविष्कार और खोजें' : 'Inventions & Discoveries',
      count: formatTopicCount(10),
      icon: <TopicInventionsBadge size={56} />,
      route: '/lessons?categoryId=gk-inventions',
      minAge: '6-8',
    },
  ];

  // Logic Topics (Accurately counted matching logic games and quizzes)
  const logicTopics: TopicItem[] = [
    {
      id: 'odd-one-out',
      name: language === 'gu' ? 'અસંગત અલગ તારવો' : language === 'hi' ? 'विषम को अलग करें' : 'Odd One Out',
      count: formatTopicCount(5),
      icon: <TopicOddOneOutBadge size={56} />,
      route: '/games/odd-one-out',
      minAge: '2-4',
    },
    {
      id: 'pattern-rec',
      name: language === 'gu' ? 'પેટર્ન ઓળખ' : language === 'hi' ? 'पैटर्न पहचान' : 'Pattern Recognition',
      count: formatTopicCount(8),
      icon: <TopicPatternRecognitionBadge size={56} />,
      route: '/lessons?categoryId=colors-shapes&subcategoryId=patterns',
      minAge: '2-4',
    },
    {
      id: 'coding-decoding',
      name: language === 'gu' ? 'કોડિંગ-ડિકોડિંગ' : language === 'hi' ? 'कोडिंग-डिकोडिंग' : 'Coding-Decoding',
      count: formatTopicCount(5),
      icon: <TopicCodingDecodingBadge size={56} />,
      route: '/games?type=find-letter',
      minAge: '2-4',
    },
    {
      id: 'logical-reasoning',
      name: language === 'gu' ? 'તાર્કિક વિચારણા' : language === 'hi' ? 'तार्किक विचार' : 'Logical Reasoning',
      count: formatTopicCount(5),
      icon: <TopicLogicalReasoningBadge size={56} />,
      route: '/games/logic-reasoning',
      minAge: '4-6',
    },
    {
      id: 'puzzles',
      name: language === 'gu' ? 'પિક્ચર પઝલ્સ' : language === 'hi' ? 'पिक्चर पज़ल' : 'Picture Puzzles',
      count: formatTopicCount(5),
      icon: <TopicPuzzlesBadge size={56} />,
      route: '/games/picture-puzzle',
      minAge: '4-6',
    },
    {
      id: 'shapes-sequences',
      name: language === 'gu' ? 'આકારો અને ભૂમિતિ' : language === 'hi' ? 'आकार और ज्यामिति' : 'Shapes & Geometry',
      count: formatTopicCount(15),
      icon: <TopicShapesSequencesBadge size={56} />,
      route: '/lessons?categoryId=colors-shapes&subcategoryId=geometry',
      minAge: '4-6',
    },
    {
      id: 'number-series',
      name: language === 'gu' ? 'સંખ્યા શ્રેણી' : language === 'hi' ? 'संख्या श्रृंखला' : 'Number Series',
      count: formatTopicCount(5),
      icon: <TopicNumberSeriesBadge size={56} />,
      route: '/games?type=counting',
      minAge: '6-8',
    },
    {
      id: 'critical-thinking',
      name: language === 'gu' ? 'વિવેચનાત્મક વિચારસરણી' : language === 'hi' ? 'तार्किक सोच' : 'Critical Thinking',
      count: formatTopicCount(25),
      icon: <TopicCriticalThinkingBadge size={56} />,
      route: '/challenge',
      minAge: '6-8',
    },
  ];

  const allCurrentTopics =
    activeSubject === 'math'
      ? mathTopics
      : activeSubject === 'science'
        ? scienceTopics
        : activeSubject === 'english'
          ? englishTopics
          : activeSubject === 'gk'
            ? gkTopics
            : logicTopics;

  // Filter topics based on active child's age group (class)
  // 2-4 (Nursery): Only foundational topics
  // 4-6 (Junior): Foundational + Junior topics
  // 6-8 (Senior): All topics (Full mastery)
  const currentTopics = allCurrentTopics.filter((t) => {
    if (!t.minAge) return true;
    if (t.minAge === '4-6' && ageGroup === '2-4') return false;
    if (t.minAge === '6-8' && (ageGroup === '2-4' || ageGroup === '4-6')) return false;
    return true;
  });

  const classBadge = getAgeClassBadgeInfo(ageGroup, language, activeSubject);

  const currentSubjectMeta = {
    math: {
      title: language === 'gu' ? 'ગણિત' : language === 'hi' ? 'गणित' : 'Math',
      subtitle:
        language === 'gu'
          ? 'સંખ્યાઓ, ગણતરી અને કોયડાઓ શીખો'
          : language === 'hi'
            ? 'संख्याएं, गणना और गणितीय पहेलियां सीखें'
            : 'Practice numbers and problem solving',
    },
    science: {
      title: language === 'gu' ? 'વિજ્ઞાન' : language === 'hi' ? 'विज्ञान' : 'Science',
      subtitle:
        language === 'gu'
          ? 'પ્રાણીઓ, વનસ્પતિ અને બ્રહ્માંડની રસપ્રદ દુનિયા'
          : language === 'hi'
            ? 'प्रकृति, जीव-जंतु और अंतरिक्ष की दुनिया'
            : 'Explore nature, animals, and the world',
    },
    english: {
      title: language === 'gu' ? 'અંગ્રેજી' : language === 'hi' ? 'अंग्रेजी' : 'English',
      subtitle:
        language === 'gu'
          ? 'વાંચો, બોલો અને નવા શબ્દો શીખો'
          : language === 'hi'
            ? 'पढ़ना, बोलना और नए शब्द सीखें'
            : 'Read, speak, and learn vocabulary',
    },
    gk: {
      title: language === 'gu' ? 'સામાન્ય જ્ઞાન' : language === 'hi' ? 'सामान्य ज्ञान' : 'GK',
      subtitle:
        language === 'gu'
          ? 'દેશ, દુનિયા, ઇતિહાસ અને અજાયબીઓ'
          : language === 'hi'
            ? 'देश, दुनिया, इतिहास और रोचक तथ्य'
            : 'Discover facts, geography, and wonders',
    },
    logic: {
      title: language === 'gu' ? 'તર્ક શક્તિ' : language === 'hi' ? 'तर्क शक्ति' : 'Logic',
      subtitle:
        language === 'gu'
          ? 'મગજ કસરત, કોયડા અને પઝલ ગેમ્સ'
          : language === 'hi'
            ? 'दिमागी कसरत, पहेलियां और तर्क खेल'
            : 'Sharpen your mind and reasoning',
    },
  }[activeSubject];

  const subjectTabs: { id: SubjectKey; label: string }[] = [
    { id: 'math', label: language === 'gu' ? 'ગણિત' : language === 'hi' ? 'गणित' : 'Math' },
    { id: 'science', label: language === 'gu' ? 'વિજ્ઞાન' : language === 'hi' ? 'विज्ञान' : 'Science' },
    { id: 'english', label: language === 'gu' ? 'અંગ્રેજી' : language === 'hi' ? 'अंग्रेजी' : 'English' },
    { id: 'gk', label: language === 'gu' ? 'સામાન્ય જ્ઞાન' : language === 'hi' ? 'सामान्य ज्ञान' : 'GK' },
    { id: 'logic', label: language === 'gu' ? 'તર્ક શક્તિ' : language === 'hi' ? 'तर्क शक्ति' : 'Logic' },
  ];

  const handleBack = () => {
    soundEffects.playBubblePop();
    try {
      if (router.canGoBack()) {
        router.back();
        return;
      }
    } catch { }
    router.replace('/home');
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
      {/* Signature Universal Sky-to-Sunshine Gradient Background (Matching Home Screen) */}
      <AppGlobalBackground id="subjBgGrad" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {/* Top Bar with Back Arrow, Center Illustration & Notification Bell */}
        <View style={styles.topNavRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
            accessibilityLabel="Back"
          >
            <View pointerEvents="none">
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M19 12H5M12 19L5 12L12 5"
                  stroke="#475569"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          </TouchableOpacity>

          {/* Floating Cute 3D Paper Plane Graphic */}
          <View style={styles.centerGraphic}>
            <Svg width={42} height={42} viewBox="0 0 32 32" fill="none">
              <Defs>
                <LinearGradient id="planeGrad" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0%" stopColor="#FDE047" />
                  <Stop offset="50%" stopColor="#FB923C" />
                  <Stop offset="100%" stopColor="#F97316" />
                </LinearGradient>
              </Defs>
              <Path
                d="M28 4L4 14L14 18L18 28L28 4Z"
                fill="url(#planeGrad)"
                stroke="#EA580C"
                strokeWidth={1.5}
                strokeLinejoin="round"
              />
              <Path d="M14 18L28 4" stroke="#FFFFFF" strokeWidth={1.5} />
            </Svg>
          </View>

          {/* Bell Icon on Right */}
          <TouchableOpacity
            style={styles.bellButton}
            onPress={() => {
              soundEffects.playBubblePop();
              router.push('/progress');
            }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Progress and Activity"
          >
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path
                d="M18 8C18 6.4 17.3 4.8 16.2 3.7C15.1 2.6 13.6 2 12 2C10.4 2 8.8 2.6 7.7 3.7C6.6 4.8 6 6.4 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
                stroke="#475569"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M13.7 21C13.5 21.3 13.3 21.6 13 21.7C12.7 21.9 12.3 22 12 22C11.6 22 11.3 21.9 11 21.7C10.7 21.6 10.4 21.3 10.3 21"
                stroke="#475569"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Subject Navigation Tabs with full localization */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subjectPillsRow}
          nestedScrollEnabled={true}
          directionalLockEnabled={true}
          keyboardShouldPersistTaps="handled"
        >
          {subjectTabs.map((subj) => {
            const isActive = activeSubject === subj.id;
            return (
              <TouchableOpacity
                key={subj.id}
                onPress={() => {
                  soundEffects.playBubblePop();
                  setActiveSubject(subj.id);
                  try {
                    router.setParams({ subjectId: subj.id });
                  } catch {}
                }}
                style={[
                  styles.subjPill,
                  isActive && styles.subjPillActive,
                ]}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.subjPillText,
                    isActive && styles.subjPillTextActive,
                  ]}
                >
                  {subj.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Large Subject Heading & Subtitle Matching Active Language */}
        <View style={styles.titleSection}>
          <View style={styles.subjectArtBubble}>
            <Image source={SUBJECT_CARD_ART[activeSubject]} resizeMode="contain" style={styles.subjectArt} />
          </View>
          <View style={styles.titleTextCol}>
            <Text style={styles.subjectHeading}>{currentSubjectMeta.title}</Text>
            <Text style={styles.subjectSub}>{currentSubjectMeta.subtitle}</Text>
          </View>
        </View>

        {/* Adaptive Class & Age Badge Banner */}
        <View
          style={[
            styles.classBadgeBanner,
            { backgroundColor: classBadge.tagBg, borderColor: classBadge.border },
          ]}
        >
          <View style={styles.classBadgeHeaderRow}>
            <Text style={[styles.classBadgeText, { color: classBadge.tagColor }]}>
              {classBadge.badgeLabel}
            </Text>
            <View style={[styles.classLevelPill, { backgroundColor: classBadge.tagColor }]}>
              <Text style={styles.classLevelPillText}>{classBadge.title}</Text>
            </View>
          </View>
          <Text style={styles.classBadgeSubtitle}>{classBadge.subtitle}</Text>
        </View>

        {/* Rounded White Topic Cards with Distinct 3D Badges (Matching Image 2) */}
        <View style={styles.topicsList}>
          {currentTopics.map((topic, topicIndex) => {
            const stats = getTopicProgressStats(topic);
            const isMastered = stats.percent >= 100;
            const tone = isMastered ? 'mint' : toneAt(topicIndex);
            const toneSpec = kidTones[tone];
            return (
              <SpringTopicCard
                key={topic.id}
                style={[
                  styles.topicCard,
                  {
                    backgroundColor: toneSpec.tint,
                    borderColor: toneSpec.tintBorder,
                    borderBottomColor: toneSpec.fill,
                  },
                  clayShadow(2),
                  webStyle({ cursor: 'pointer' }),
                ]}
                onPress={() => {
                  soundEffects.playBubblePop();
                  router.push(topic.route);
                }}
                accessibilityLabel={`${topic.name}, ${stats.done} of ${stats.total} lessons`}
              >
                {/* 3D clay topic token (embossed circular candy base + 3D art) */}
                <View style={styles.topicBadgeWrapper}>{topic.icon}</View>

                {/* Title, Subtitle and Progress Row */}
                <View style={styles.topicInfoCol}>
                  <Text style={styles.topicName} numberOfLines={1}>{topic.name}</Text>
                  {topic.subtitle ? (
                    <Text style={styles.topicSubtitle} numberOfLines={1}>{topic.subtitle}</Text>
                  ) : null}

                  <View style={styles.topicProgressRow}>
                    <View style={styles.topicProgressTrack}>
                      <View
                        style={[
                          styles.topicProgressFill,
                          {
                            width: stats.percent > 0 ? `${Math.min(100, Math.max(stats.percent, 0))}%` : '0%',
                            opacity: stats.percent > 0 ? 1 : 0,
                            backgroundColor: toneSpec.fill,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.topicProgressFraction}>
                      {formatNumberDigits(stats.done, language)} / {formatNumberDigits(stats.total, language)}
                    </Text>
                  </View>
                </View>

                {/* Progress ring (live completion from the child's progress) */}
                <ProgressRing value={stats.percent / 100} size={54} stroke={6} tone={tone} language={language}>
                  {isMastered ? (
                    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M5 13L9 17L19 7"
                        stroke={toneSpec.edge}
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  ) : undefined}
                </ProgressRing>
              </SpringTopicCard>
            );
          })}
        </View>
      </ScrollView>

      {/* Floating Bottom Navigation */}
      <BottomNav activeTab="learn" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 8 : 12,
    paddingBottom: 120,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  centerGraphic: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  subjectPillsRow: {
    paddingVertical: 6,
    gap: 10,
    marginBottom: 16,
  },
  subjPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjPillActive: {
    backgroundColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  subjPillText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748B',
  },
  subjPillTextActive: {
    color: '#FFFFFF',
  },
  titleSection: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  titleTextCol: {
    flex: 1,
  },
  subjectArtBubble: {
    width: 88,
    height: 88,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderBottomWidth: 5,
    borderBottomColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectArt: {
    width: 76,
    height: 76,
  },
  subjectHeading: {
    fontSize: 34,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subjectSub: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
    lineHeight: 22,
  },
  topicsList: {
    gap: 14,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: kidPalette.surface,
    borderRadius: 24,
    padding: 16,
    gap: 4,
    borderWidth: 2,
    borderColor: kidPalette.border,
    // Claymorphic 3D lip (colour set per card tone)
    borderBottomWidth: 5,
    marginBottom: 4,
  },
  topicBadgeWrapper: {
    // the badge itself is the embossed 3D circular clay token
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  topicInfoCol: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 14,
    justifyContent: 'center',
  },
  topicName: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  topicSubtitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  topicProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topicProgressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EBE8F7',
    overflow: 'hidden',
  },
  topicProgressFill: {
    height: 6,
    borderRadius: 3,
  },
  topicProgressFraction: {
    marginLeft: 10,
    fontSize: 12.5,
    fontWeight: '800',
    color: '#64748B',
  },
  circularActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 14px rgba(128, 98, 245, 0.4)',
      cursor: 'pointer',
    } : {
      elevation: 4,
      shadowColor: '#0284C7',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.35,
      shadowRadius: 6,
    }),
  },
  circularActionButtonMastered: {
    backgroundColor: '#10B981',
    ...(webStyle({
      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
    })),
  },
  classBadgeBanner: {
    borderRadius: 18,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 18,
  },
  classBadgeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  classBadgeText: {
    fontSize: 14,
    fontWeight: '800',
  },
  classLevelPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  classLevelPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  classBadgeSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
});
