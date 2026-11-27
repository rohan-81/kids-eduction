import fs from 'fs';
import path from 'path';
import { formatChildName } from '../src/utils/nameTransliterator';
import { getAvatarImageSource } from '../src/utils/avatarHelper';
import { GAME_QUESTIONS } from '../src/data/gamesData';

const readNormalized = (rel: string) =>
  fs.readFileSync(path.join(__dirname, '..', rel), 'utf8').replace(/\r\n/g, '\n');

describe('App-Wide Audit Bug Fixes Verification', () => {
  test('Bugs 1 & 12: Games reset isAnsweredRef on Play Again & fallback, and find-object renders EmojiArt fallback', () => {
    const src = readNormalized('app/games/[type].tsx');
    const initGameSlice = src.slice(src.indexOf('const initGame = () => {'), src.indexOf('if (gameType === \'picture-puzzle\')'));
    expect(initGameSlice).toContain('isAnsweredRef.current = false;');
    expect(src).toContain('<EmojiArt emoji={splitEmojiLabel(option.label || \'\').emoji} size={52} />');
  });

  test('Bugs 2, 3, 4, 5, 6, 7: Context/Storage/Outbox/Splash safety guards', () => {
    const indexSrc = readNormalized('app/index.tsx');
    expect(indexSrc).toContain('if (isLoading || hasNavigated.current) return;');

    const ctxSrc = readNormalized('src/context/AppContext.tsx');
    expect(ctxSrc).toContain("...(childName !== undefined ? { childName: childName.trim() } : {})");
    expect(ctxSrc).toContain('profileEpochRef.current += 1;');
    expect(ctxSrc).toContain('storageService.setPrimaryProfileId(null);');
    expect(ctxSrc).toContain('markNameCompleted');

    const storageSrc = readNormalized('src/services/storageService.ts');
    expect(storageSrc).toContain('let base: UserProgress = { ...DEFAULT_PROGRESS };');
    expect(storageSrc).not.toContain('if (key !== STORAGE_KEYS.PROGRESS) {\n        await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS');

    const backendSrc = readNormalized('src/services/backendService.ts');
    expect(backendSrc).toContain("if (op.kind === 'create' && o.kind === 'create' && o.localId === op.localId)");
  });

  test('Bugs 8, 9, 10, 11: Audio stop/AbortError guards, rhyme cleanup, BGM soundEnabled check, and wellness dismiss lock', () => {
    const audioSrc = readNormalized('src/services/audioService.ts');
    expect(audioSrc).toContain("if (requestId !== currentSpeechRequestId || activeWebAudio !== audio) return;");

    const rhymeSrc = readNormalized('src/services/rhymeAudioService.ts');
    expect(rhymeSrc).toContain("finally {\n            clearTimeout(timeoutId);");
    expect(rhymeSrc).toContain('try { player.remove(); } catch {}');

    const sfxSrc = readNormalized('src/services/soundEffects.ts');
    expect(sfxSrc).toContain('if (!this.soundEnabled || this.isBgmPlaying || this.bgmMuted) return;');

    const wellnessSrc = readNormalized('src/services/screenWellnessService.ts');
    expect(wellnessSrc).toContain('this.continuousMinutes >= 20');
    expect(wellnessSrc).toContain('isLimitDismissedToBedtime');
  });

  test('Bugs 13, 14, 15, 16: Stories single completion, Progress story ID & Math mapping, Coloring star sum, Subjects fixes', () => {
    const storiesSrc = readNormalized('app/stories.tsx');
    expect(storiesSrc).not.toContain("completeLesson('story-' + selectedStory.id)");
    expect(storiesSrc).toContain('isRead={completed.has(s.id) || completed.has(\'story-\' + s.id)}');

    const progressSrc = readNormalized('app/progress.tsx');
    expect(progressSrc).toContain("'story-crow'");
    expect(progressSrc).toContain("['numbers', 'math', 'ghadiya'].includes(l.categoryId)");
    expect(progressSrc).toContain("route: '/lessons?categoryId=colors-shapes'");

    const coloringSrc = readNormalized('app/coloring.tsx');
    expect(coloringSrc).toContain('stars: (progress.stars || 0) + 9');

    const subjectsSrc = readNormalized('app/subjects.tsx');
    expect(subjectsSrc).toContain("subCatId === 'geometry' || subCatId === 'shapes' || topic.id === 'shapes-sequences'");
    expect(subjectsSrc).toContain("name: language === 'gu' ? 'સરવાળા' : language === 'hi' ? 'जोड़' : 'Addition'");
    expect(subjectsSrc).toContain("router.push('/progress')");
  });

  test('Bugs 17, 18, 19, 20, 21: Math op header, dynamic avatar, Little Learner alias, games pts & Hindi digit 8', () => {
    const detailSrc = readNormalized('app/lessons/[id].tsx');
    expect(detailSrc).toContain("sub: { gu: 'બાદબાકી', hi: 'घटाव', en: 'Subtraction' }");

    expect(getAvatarImageSource('avatar_3d_girl')).toBeTruthy();
    expect(getAvatarImageSource('🦊')).toBeNull();
    expect(formatChildName('Little Learner', 'gu')).toBe('નાનો તારો');

    const gamesIndexSrc = readNormalized('app/games/index.tsx');
    expect(gamesIndexSrc).toContain("language === 'gu' ? 'પોઇન્ટ્સ' : language === 'hi' ? 'पॉइंट्स' : 'pts'");

    const cntHi9 = GAME_QUESTIONS.counting.hi.find((q) => q.id === 'cnt-hi-9');
    expect(cntHi9?.options[0].label).toBe('८ 🎈');

    const ageHelperSrc = readNormalized('src/utils/ageDetailHelper.ts');
    expect(ageHelperSrc).toContain('८,८४८.८६');
  });
});

