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

    expect(adventureFile).toContain("speak('અરેરે! ખોટો જવાબ, ફરીથી પ્રયત્ન કરો!', 'gu');");
    expect(adventureFile).toContain("speak('अरे! गलत जवाब, फिर से प्रयास करें!', 'hi');");
    expect(adventureFile).toContain("speak('Oops! Wrong answer, try again!', 'en');");

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

    // AppContext merges cloud wallet and adventureLevel on loadData and loginUser
    expect(appContextFile).toContain('syncAllProgressWithCloud');
    expect(appContextFile).toContain('serverState.wallet');
    expect(appContextFile).toContain('Math.max(activeProg.coins');
    expect(appContextFile).toContain('Math.max(activeProg.stars');
    expect(appContextFile).toContain('Math.max(activeProg.adventureLevel');
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
    expect(viewsFile).toContain('Sync Adventure Progress');
    expect(viewsFile).toContain("'adventure_level': server_adv_level");
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

