import * as fs from 'fs';
import * as path from 'path';
import { audioService } from '../src/services/audioService';
import { formatChildName } from '../src/utils/nameTransliterator';

const readNormalized = (p: string) => fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');

describe('BUG 1: Unified Learning Module Action Buttons Consistency', () => {
  const lessonScreenPath = path.join(__dirname, '../app/lessons/[id].tsx');
  const actionSectionPath = path.join(__dirname, '../src/components/LessonActionSection.tsx');

  test('LessonActionSection component exists and is imported in lesson detail screen', () => {
    expect(fs.existsSync(actionSectionPath)).toBe(true);
    const lessonCode = readNormalized(lessonScreenPath);
    expect(lessonCode).toContain("import { LessonActionSection } from '../../src/components/LessonActionSection'");
    expect(lessonCode).toContain('<LessonActionSection');
  });

  test('Lesson detail screen eliminates language-divergent dualAudioButtonsRow hardcoding', () => {
    const lessonCode = readNormalized(lessonScreenPath);
    // Ensure the old divergent JSX block where Hindi had huge ClayButtons while English had circular AudioSpeakerButton is removed
    expect(lessonCode).not.toContain('<ClayButton\n                tone="sky"\n                size="lg"\n                sound={false}\n                onPress={handleSpeak}');
  });

  test('canShowTracing is kept strictly for English Alphabet (ABCD) and Numbers, and removed from Phonics, Gujarati & Hindi', () => {
    const lessonCode = readNormalized(lessonScreenPath);
    const alphabetBlock = lessonCode.slice(
      lessonCode.indexOf('const isEnglishAlphabetCategory'),
      lessonCode.indexOf('const canShowTracing')
    );
    expect(alphabetBlock).toContain("'en-alphabet'");
    expect(alphabetBlock).not.toContain("'en-phonics'");

    const tracingBlock = lessonCode.slice(
      lessonCode.indexOf('const canShowTracing'),
      lessonCode.indexOf('const canShowTracing') + 300
    );
    expect(tracingBlock).toContain('(isEnglishAlphabetCategory || isNumberCategory)');
    expect(tracingBlock).not.toContain('(isLetterCategory || isNumberCategory)');
  });

  test('LessonActionSection provides consistent circular audio controls and localized labels', () => {
    const actionCode = readNormalized(actionSectionPath);

    // Both single listen and dual audio (with real voice) use 64x64 circular buttons
    expect(actionCode).toContain('styles.circleBtn');
    expect(actionCode).toContain('styles.speakCircle');
    expect(actionCode).toContain('styles.realCircle');

    // Consistent Gujarati, Hindi, and English audio button labels
    expect(actionCode).toContain("'નામ સાંભળો'");
    expect(actionCode).toContain("'नाम सुनें'");
    expect(actionCode).toContain("'Speak Name'");

    expect(actionCode).toContain("'અસલી અવાજ'");
    expect(actionCode).toContain("'असली आवाज़'");
    expect(actionCode).toContain("'Real Voice'");

    // Consistent phonics labels
    expect(actionCode).toContain("'ફોનિક્સ અવાજ'");
    expect(actionCode).toContain("'फोनिक्स ध्वनि'");
    expect(actionCode).toContain("'Phonics Sound'");

    // Consistent tracing labels (emoji-free: icons are SVG / 3D art, never raw emoji)
    expect(actionCode).toContain("'આંગળીથી ટ્રેસ કરો'");
    expect(actionCode).toContain("'उंगली से ट्रेस करें'");
    expect(actionCode).toContain("'Finger Trace'");
    expect(actionCode).not.toContain('✏️');

    // Arrow-only Previous/Next navigation; Complete button removed (Next handles completion)
    expect(actionCode).toContain('<Glyph name="back"');
    expect(actionCode).toContain('<Glyph name="next"');
    expect(actionCode).toContain('onPress={hasNext && onNext ? onNext : onComplete}');
    expect(actionCode).not.toContain("'પૂરું થયું'");
    expect(actionCode).not.toContain("'पूरा हुआ'");
    expect(actionCode).not.toContain("'← પાછળ'");
    expect(actionCode).not.toContain("'← पिछला'");
    expect(actionCode).not.toContain("'← Prev'");
  });

  test('formatChildName filters raw avatar slugs and displays friendly child names', () => {
    expect(formatChildName('avatar_3d_boy', 'en')).toBe('Little Star');
    expect(formatChildName('avatar_3d_boy', 'gu')).toBe('નાનો તારો');
    expect(formatChildName('avatar_3d_boy', 'hi')).toBe('छोटा तारा');
  });
});

describe('BUG 2: Audio Latency & Performance Optimization', () => {
  const audioServicePath = path.join(__dirname, '../src/services/audioService.ts');
  const lessonScreenPath = path.join(__dirname, '../app/lessons/[id].tsx');

  test('app/lessons/[id].tsx has removed artificial 180ms delay before auto-play', () => {
    const lessonCode = readNormalized(lessonScreenPath);
    expect(lessonCode).not.toContain('setTimeout(() => {\n      if (bundled) playName(bundled);\n    }, 180);');
    expect(lessonCode).toContain('if (bundled) {\n      playName(bundled);\n    }');
  });

  test('Lesson detail handleSpeak speaks the name immediately without colliding with animal sound or 750ms setTimeout', () => {
    const lessonCode = readNormalized(lessonScreenPath);
    expect(lessonCode).toContain('const handleSpeak = () => {');
    expect(lessonCode).toContain('audioService.stop();');
    expect(lessonCode).toContain('speakRef.current(audio.text, audio.lang);');
    expect(lessonCode).not.toContain('setTimeout(() => {\n        speak(audio.text, audio.lang);\n      }, 750);');
  });

  test('audioService.ts speakWebSynthesis does not artificially delay execution via 15ms timer', () => {
    const audioCode = readNormalized(audioServicePath);
    expect(audioCode).not.toContain('setTimeout(() => {\n        if (requestId && requestId !== currentSpeechRequestId) {');
    expect(audioCode).toContain('if (!isSpeakingOrPending) {\n        executeSpeak();\n      }');
  });

  test('audioService caches resolved voices for instant zero-latency lookup', () => {
    const audioCode = readNormalized(audioServicePath);
    expect(audioCode).toContain('voiceCache');
    expect(audioCode).toContain('voiceCache.get(cacheKey)');
  });

  test('audioService fast-paths native speech synthesis without slow HTTP network requests', () => {
    const audioCode = readNormalized(audioServicePath);
    expect(audioCode).toContain('// Fast-path: When no pre-bundled local asset exists, immediately speak using native device speech synthesis');
    expect(audioCode).toContain('this.speakNativeSpeech(text, lang, requestId, onDone);');
  });

  test('audioService prewarms engine and handles rapid repeated clicks safely', async () => {
    expect(() => audioService.prewarmEngine()).not.toThrow();

    // Rapid consecutive calls should not throw or deadlock
    const rapidCalls = ['A', 'B', 'C', 'D'];
    for (const char of rapidCalls) {
      await audioService.speak(`Letter ${char}`, 'en');
    }
    expect(audioService.isSoundEnabled()).toBe(true);
  });
});

describe('Calendar Habits Audio Lifecycle & Tab Switching', () => {
  const calendarScreenPath = path.join(__dirname, '../app/calendar_habits.tsx');

  test('calendar_habits.tsx silences speech and animal audio on screen blur', () => {
    const calendarCode = readNormalized(calendarScreenPath);
    expect(calendarCode).toContain('useFocusEffect(');
    expect(calendarCode).toContain('audioService.stop();');
    expect(calendarCode).toContain('soundEffects.stopAnimalSound();');
  });

  test('calendar_habits.tsx silences audio immediately when switching tabs', () => {
    const calendarCode = readNormalized(calendarScreenPath);
    // Verified in activeTab change effect
    expect(calendarCode).toContain('useEffect(() => {\n    audioService.stop();\n    soundEffects.stopAnimalSound();\n    setSelectedSeason(null);\n  }, [activeTab]);');
    // And in tab button onPress
    expect(calendarCode).toContain('audioService.stop();\n                  soundEffects.stopAnimalSound();\n                  soundEffects.playBubblePop();');
  });
});

describe('Today Challenge Screen Visual Makeover & Audio Cleanup', () => {
  const challengeScreenPath = path.join(__dirname, '../app/challenge.tsx');

  test('challenge.tsx silences speech on route blur via useFocusEffect', () => {
    const challengeCode = readNormalized(challengeScreenPath);
    expect(challengeCode).toContain('useFocusEffect(');
    expect(challengeCode).toContain('audioService.stop();');
  });

  test('challenge.tsx implements 3D clay theme styling and components', () => {
    const challengeCode = readNormalized(challengeScreenPath);
    expect(challengeCode).toContain("import { ClayButton } from '../src/components/clay/ClayButton'");
    expect(challengeCode).toContain("import { ConfettiCelebration } from '../src/components/common/ConfettiCelebration'");
    expect(challengeCode).toContain("import { kidTones, kidPalette, claySurface, clayShadow, kidRadii } from '../src/theme/kidTheme'");
    expect(challengeCode).toContain('<ConfettiCelebration');
    expect(challengeCode).toContain('<ClayButton');
    expect(challengeCode).toContain('claySurface(');
  });

  test('challenge.tsx renders 3D clay option cards with option badges A, B, C, D', () => {
    const challengeCode = readNormalized(challengeScreenPath);
    expect(challengeCode).toContain("const OPTION_LETTERS = ['A', 'B', 'C', 'D'];");
    expect(challengeCode).toContain('styles.optLetterBubble');
    expect(challengeCode).toContain('styles.certCard');
    expect(challengeCode).toContain('styles.certInnerBorder');
  });

  test('challenge.tsx awaits feedback audio completion via onDone callback before advancing to next question', () => {
    const challengeCode = readNormalized(challengeScreenPath);
    expect(challengeCode).toContain('speakRef.current(feedbackText, language, () => {');
    expect(challengeCode).toContain('advanceSafely');
    expect(challengeCode).not.toContain('const transitionDelay = isCorrect ? 2200 : 2800;');
  });
});

describe('Game Options Rendering & Color Dot Single Display', () => {
  const gameScreenPath = path.join(__dirname, '../app/games/[type].tsx');

  test('app/games/[type].tsx avoids rendering duplicate optionColorDot when option.label already contains an emoji', () => {
    const gameCode = readNormalized(gameScreenPath);
    expect(gameCode).toContain("option.color && !/\\p{Extended_Pictographic}/u.test(option.label || '') && !option.visual");
  });

  test('app/games/[type].tsx defaults Picture Puzzle to 6 pieces (medium) mode', () => {
    const gameCode = readNormalized(gameScreenPath);
    expect(gameCode).toContain('const [puzzlePieceMode, setPuzzlePieceMode] = useState<4 | 6 | 9>(6);');
  });

  test('app/games/[type].tsx ensures Next question feedback button text is centered with dedicated styles', () => {
    const gameCode = readNormalized(gameScreenPath);
    expect(gameCode).toContain('styles.nextFeedbackBtn');
    expect(gameCode).toContain('styles.nextFeedbackBtnText');
    expect(gameCode).toContain("textAlign: 'center'");
    expect(gameCode).toContain('width: 220');
  });
});

describe('Saved Stories Card Layout & Sticker Horizontal Scroll in Expo', () => {
  const storiesScreenPath = path.join(__dirname, '../app/stories.tsx');
  const stickersScreenPath = path.join(__dirname, '../app/stickers.tsx');

  test('app/stories.tsx prevents saved story badge overlap with dedicated title box and space-between layout', () => {
    const storiesCode = readNormalized(storiesScreenPath);
    expect(storiesCode).toContain('styles.savedStoryTitleBox');
    expect(storiesCode).toContain('justifyContent: \'space-between\'');
    expect(storiesCode).toContain('minHeight: 148');
  });

  test('app/stickers.tsx enables nested horizontal scrolling and prevents sticky tab buttons in Expo', () => {
    const stickersCode = readNormalized(stickersScreenPath);
    expect(stickersCode).toContain('nestedScrollEnabled={true}');
    expect(stickersCode).toContain('flexDirection: \'row\'');
    expect(stickersCode).toContain('flexShrink: 0');
    expect(stickersCode).toContain('scrollEventThrottle={16}');
    expect(stickersCode).toContain('TouchableOpacity');
  });

  test('app/stickers.tsx fixes showcase text cut off by constraining sound button width', () => {
    const stickersCode = readNormalized(stickersScreenPath);
    expect(stickersCode).toContain('styles.showcasePlayBtn');
    expect(stickersCode).toContain('minWidth: 0');
  });
});

describe('Audio Lifecycle & Navigation Focus Cleanup Across Screens', () => {
  const screens = [
    'app/lessons/[id].tsx',
    'app/rhymes.tsx',
    'app/games/[type].tsx',
    'app/games/duel.tsx',
    'app/adventure.tsx',
    'app/shopgame.tsx',
    'app/wordbuilder.tsx',
  ];

  screens.forEach((screenRelPath) => {
    test(`${screenRelPath} implements useFocusEffect to stop audio immediately on route blur`, () => {
      const fullPath = path.join(__dirname, '..', screenRelPath);
      const code = readNormalized(fullPath);
      expect(code).toContain('useFocusEffect(');
      expect(code).toContain('audioService.stop()');
    });
  });
});

describe('Horizontal ScrollView Responsiveness in Expo & Android', () => {
  const components = [
    'app/certificate.tsx',
    'app/parents.tsx',
    'app/subjects.tsx',
    'src/components/common/KidsDatePickerModal.tsx',
    'src/components/GhadiyaTableView.tsx',
    'src/components/home/FeaturedGamesSection.tsx',
    'app/lessons/index.tsx',
  ];

  components.forEach((compRelPath) => {
    test(`${compRelPath} configures nestedScrollEnabled={true} for horizontal sliding`, () => {
      const fullPath = path.join(__dirname, '..', compRelPath);
      const code = readNormalized(fullPath);
      expect(code).toContain('nestedScrollEnabled={true}');
    });
  });
});

describe('Math Visuals: Distinct Coins, Banknotes & Kids-Friendly Missing Numbers', () => {
  const mathDataPath = path.join(__dirname, '../src/data/lessonsMath.ts');
  const lessonsIndexPath = path.join(__dirname, '../app/lessons/index.tsx');
  const lessonDetailPath = path.join(__dirname, '../app/lessons/[id].tsx');
  const mathVisualsPath = path.join(__dirname, '../src/components/MathCardVisuals.tsx');

  test('src/data/lessonsMath.ts eliminates generic question mark symbol across all missing number lessons', () => {
    const mathCode = readNormalized(mathDataPath);
    // Missing number lessons should have actual numeric symbols, not generic ❓
    expect(mathCode).not.toContain("symbol: '❓'");
    expect(mathCode).toContain("id: 'math-miss-1'");
    expect(mathCode).toContain("symbol: '3'");
  });

  test('src/data/lessonsMath.ts assigns distinct currency symbols to coins and notes', () => {
    const mathCode = readNormalized(mathDataPath);
    expect(mathCode).toContain("id: 'money-coin-1'");
    expect(mathCode).toContain("symbol: '₹1'");
    expect(mathCode).toContain("id: 'money-coin-5'");
    expect(mathCode).toContain("symbol: '₹5'");
    expect(mathCode).toContain("id: 'money-note-100'");
    expect(mathCode).toContain("symbol: '₹100'");
  });

  test('app/lessons/index.tsx and app/lessons/[id].tsx integrate renderMathCardVisual for math-money and math-missing', () => {
    const indexCode = readNormalized(lessonsIndexPath);
    const detailCode = readNormalized(lessonDetailPath);

    expect(indexCode).toContain('renderMathCardVisual');
    expect(indexCode).toContain("item.categoryId === 'math-money' || item.categoryId === 'math-missing'");

    expect(detailCode).toContain('renderMathCardVisual');
    expect(detailCode).toContain("currentLesson.categoryId === 'math-money' || currentLesson.categoryId === 'math-missing'");
  });

  test('src/components/MathCardVisuals.tsx provides distinct authentic coin, banknote and puzzle visuals', () => {
    const visualCode = readNormalized(mathVisualsPath);
    expect(visualCode).toContain('RupeeCoinVisual');
    expect(visualCode).toContain('RupeeNoteVisual');
    expect(visualCode).toContain('MissingNumberPuzzleVisual');
    expect(visualCode).toContain('renderMathCardVisual');
    // Authentic banknote colors: brown (10), green-yellow (20), cyan (50), lavender (100)
    expect(visualCode).toContain('#92400E'); // Chocolate brown 10
    expect(visualCode).toContain('#65A30D'); // Greenish yellow 20
    expect(visualCode).toContain('#0284C7'); // Fluorescent cyan 50
    expect(visualCode).toContain('#7C3AED'); // Lavender purple 100
  });
});





