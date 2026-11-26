import * as fs from 'fs';
import * as path from 'path';

describe('Cloud Sync, Mystery Box Persistence and Adventure Challenge Speech', () => {
  test('Adventure challenge quiz speech only announces right or wrong without coins/stars', () => {
    const adventureFile = fs.readFileSync(
      path.join(__dirname, '../app/adventure.tsx'),
      'utf8'
    );

    // Verify handleAnswer only speaks right/wrong in gu, hi, en
    expect(adventureFile).toContain("speak('શાબાશ! સાચો જવાબ!', 'gu');");
    expect(adventureFile).toContain("speak('शाबाश! सही जवाब!', 'hi');");
    expect(adventureFile).toContain("speak('Awesome! Correct answer!', 'en');");

    expect(adventureFile).toContain("speak('ફરીથી પ્રયત્ન કરો!', 'gu');");
    expect(adventureFile).toContain("speak('फिर से कोशिश करें!', 'hi');");
    expect(adventureFile).toContain("speak('Try again!', 'en');");

    // Verify speak call in handleAnswer does not speak coins or stars
    const handleAnswerMatch = adventureFile.match(/const handleAnswer = async \([\s\S]*?\n  \};/);
    expect(handleAnswerMatch).not.toBeNull();
    const handleAnswerCode = handleAnswerMatch![0];
    const speakCalls = Array.from(handleAnswerCode.matchAll(/speak\(([^)]+)\)/g)).map((m) => m[1]);
    expect(speakCalls.length).toBeGreaterThan(0);
    for (const call of speakCalls) {
      expect(call).not.toContain('coins');
      expect(call).not.toContain('stars');
      expect(call).not.toContain('સિક્કા');
      expect(call).not.toContain('सिक्के');
    }

    // Verify handleCloseQuizModal and unmount cleanup stop speech and sounds
    expect(adventureFile).toContain('const handleCloseQuizModal = () => {');
    expect(adventureFile).toContain('stopSpeaking()');
    expect(adventureFile).toContain('soundEffects.stopAll()');
    expect(adventureFile).toContain('setShowQuizModal(false)');
    expect(adventureFile).toContain('onRequestClose={handleCloseQuizModal}');
    expect(adventureFile).toContain('onPress={handleCloseQuizModal}');
  });

  test('Daily Mystery Modal claims immediately upon box opening and stops audio on close', () => {
    const modalFile = fs.readFileSync(
      path.join(__dirname, '../src/components/home/DailyMysteryModal.tsx'),
      'utf8'
    );

    // Check handleOpenBox immediately commits reward
    expect(modalFile).toContain('onClaim(15, 25, sticker.id)');
    expect(modalFile).toContain('audioService.stop()');
  });

  test('Daily Mystery Box maintains persistent fallback across refreshes', () => {
    const boxFile = fs.readFileSync(
      path.join(__dirname, '../src/components/home/DailyMysteryBox.tsx'),
      'utf8'
    );

    expect(boxFile).toContain('@kidszone_mystery_last_claimed');
    expect(boxFile).toContain('getRemainingTimeToMidnight');
    expect(boxFile).toContain('isClaimedToday');
  });

  test('Backend service and AppContext sync with cloud using correct profile ID and merge coins/stars', () => {
    const backendServiceFile = fs.readFileSync(
      path.join(__dirname, '../src/services/backendService.ts'),
      'utf8'
    );
    const appContextFile = fs.readFileSync(
      path.join(__dirname, '../src/context/AppContext.tsx'),
      'utf8'
    );

    // BackendService allows explicit profile ID and dynamically resolves active profile
    expect(backendServiceFile).toContain('explicitProfileId?: number | string');
    expect(backendServiceFile).toContain('async getActiveProfileId(): Promise<number>');

    // AppContext merges cloud wallet and adventureLevel on loadData, login and profile switch
    // through one shared, typed helper (previously three copy-pasted blocks).
    expect(appContextFile).toContain('syncAllProgressWithCloud');
    expect((appContextFile.match(/mergeServerProgress\(/g) || []).length).toBe(3);

    const { mergeServerProgress } = require('../src/utils/progressMerge');
    const server = {
      status: 'synchronized',
      server_time: '',
      child_profile_id: 7,
      adventure_level: 6,
      lessons: [{ lesson_slug: 'gu-ka', completed: true, stars: 3, best_score: 1 }],
      wallet: { total_coins: 120, total_stars: 4 },
      streak: { current_streak: 1, longest_streak: 1 },
      avatar: {},
      garden: [],
    };
    // Max for counters, union for lessons.
    expect(mergeServerProgress({ coins: 80, stars: 9, adventureLevel: 3, completedLessons: ['gu-kha'] }, server)).toEqual({
      coins: 120,
      stars: 9,
      adventureLevel: 6,
      completedLessons: ['gu-kha', 'gu-ka'],
      coinsSpentTotal: 0, // no device spending reported by either side
    });
    // Nothing to change -> null (no needless storage write / re-render).
    expect(mergeServerProgress({ coins: 200, stars: 9, adventureLevel: 9, completedLessons: ['gu-ka'] }, server)).toBeNull();
    expect(mergeServerProgress({ coins: 1, stars: 1, adventureLevel: 1, completedLessons: [] }, null)).toBeNull();
  });

  test('Say It Loud / KidsMicrophonePractice does not blindly grant stars without speech', () => {
    const micFile = fs.readFileSync(
      path.join(__dirname, '../src/components/common/KidsMicrophonePractice.tsx'),
      'utf8'
    );

    // Verify retry state exists for silence or permission failure
    expect(micFile).toContain("status, setStatus] = useState<'idle' | 'listening' | 'success' | 'retry'>('idle')");
    expect(micFile).toContain('triggerRetry');
    expect(micFile).toContain('retryReason');
    expect(micFile).toContain('playWrongSound');

    // Verify explicit manual speech confirmation button exists
    expect(micFile).toContain('handleManualSpokeConfirmation');
    expect(micFile).toContain('મેં બોલી લીધું');

    // Verify silence does not trigger celebration blindly
    expect(micFile).not.toContain('setTimeout(() => {\n      if (!isResolvedRef.current && isListeningRef.current) {\n        triggerCelebration(targetWord);\n      }\n    }, 3200);');
  });

  test('CloudSyncView in backend handles token auth and adventure level synchronization', () => {
    const viewsFile = fs.readFileSync(
      path.join(__dirname, '../backend/progress/views.py'),
      'utf8'
    );

    expect(viewsFile).toContain('TokenAuthentication');
    expect(viewsFile).toContain('Adventure progress');
    expect(viewsFile).toContain("'adventure_level': server_adv_level");
    // Audit P0-3: the level loop must never be driven by unbounded client input.
    expect(viewsFile).not.toMatch(/range\(1,\s*adv_level_in\)/);
    expect(viewsFile).toContain('permission_classes = PARENT_ONLY');
  });

  test('Authentic animal sound button in lesson screen utilizes local bundled asset with graceful speech fallback', () => {
    const lessonFile = fs.readFileSync(
      path.join(__dirname, '../app/lessons/[id].tsx'),
      'utf8'
    );
    expect(lessonFile).toContain('handlePlayRealAnimalVoice');
    expect(lessonFile).toContain('soundEffects.playAnimalSound');
    expect(lessonFile).toContain('animalSoundInfo.soundKey');
    expect(lessonFile).toContain('speak(onom, language)');

    const soundEffectsFile = fs.readFileSync(
      path.join(__dirname, '../src/services/soundEffects.ts'),
      'utf8'
    );
    expect(soundEffectsFile).toContain('ANIMAL_AUDIO_MAP[matchedKey]');
    expect(soundEffectsFile).toContain('cat: require(');
    expect(soundEffectsFile).toContain('setAudioModeAsyncFn');
  });
});

