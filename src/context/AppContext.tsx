import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import {
  AppLanguage,
  AgeGroup,
  ChildProfile,
  UserPreferences,
  UserProgress,
  AuthUser,
  LoginPayload,
  RegisterPayload,
  AuthResult,
  SessionData,
} from '../types';
import {
  storageService,
  DEFAULT_PREFERENCES,
  DEFAULT_PROGRESS,
  getTodayDateKey,
} from '../services/storageService';
import { authService } from '../services/authService';
import { sessionService } from '../services/sessionService';
import { backendService } from '../services/backendService';
import { mergeServerProgress } from '../utils/progressMerge';
import { getTranslation } from '../localization';
import { audioService } from '../services/audioService';
import { soundEffects } from '../services/soundEffects';

interface AppContextValue {
  language: AppLanguage;
  ageGroup: AgeGroup;
  soundEnabled: boolean;
  hasCompletedOnboarding: boolean;
  progress: UserProgress;
  isLoading: boolean;
  currentUser: AuthUser | null;
  authToken: string | null;
  session: SessionData | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  activeProfileId: number | string;
  switchProfile: (profileId: number | string, newAgeGroup?: AgeGroup, nickname?: string) => Promise<UserProgress>;
  continueAsGuest: (childName?: string, ageGroup?: AgeGroup, avatar?: string, markNameCompleted?: boolean) => Promise<void>;
  t: (key: string, vars?: Record<string, string | number>) => string;
  setLanguage: (lang: AppLanguage) => Promise<void>;
  setAgeGroup: (group: AgeGroup) => Promise<void>;
  toggleSound: () => Promise<void>;
  finishOnboarding: (lang: AppLanguage, age: AgeGroup, childName?: string, dob?: string) => Promise<void>;
  completeLesson: (lessonId: string) => Promise<{ isFirstTime: boolean; newStars: number }>;
  /** Saves a game score locally and (signed-in parents only) reports it once to the backend. */
  recordScore: (gameType: string, score: number, totalQuestions?: number) => Promise<void>;
  updateProgress: (newProg: Partial<UserProgress>) => Promise<void>;
  addCoins: (amount: number) => Promise<void>;
  spendCoins: (amount: number) => Promise<boolean>;
  recordWrongAnswer: (wrong: { id: string; prompt: string; correctOption: string; hint?: string; language?: AppLanguage }) => Promise<void>;
  clearWrongAnswer: (id: string) => Promise<void>;
  voiceGender: 'male' | 'female' | 'child';
  setVoiceGender: (gender: 'male' | 'female' | 'child') => Promise<void>;
  voiceRate: number;
  setVoiceRate: (rate: number) => Promise<void>;
  voicePitch: number;
  setVoicePitch: (pitch: number) => Promise<void>;
  speak: (text: string, langOverride?: AppLanguage | (() => void), onDone?: () => void) => void;
  stopSpeaking: () => void;
  resetProgress: () => Promise<void>;
  resetAll: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<AuthResult>;
  registerUser: (payload: RegisterPayload) => Promise<AuthResult>;
  logoutUser: () => Promise<void>;
}

export const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const logoutUserRef = React.useRef<(() => Promise<void>) | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [activeProfileId, setActiveProfileId] = useState<number | string>(1);
  const profileEpochRef = React.useRef<number>(0);
  const [voiceGender, setVoiceGenderState] = useState<'male' | 'female' | 'child'>(audioService.getVoiceGender());
  const [voiceRate, setVoiceRateState] = useState<number>(audioService.getVoiceRate());
  const [voicePitch, setVoicePitchState] = useState<number>(audioService.getVoicePitch());
  const [isLoading, setIsLoading] = useState(true);

  // Keep the remote-TTS name mask current: the child's and parent's names are replaced with a
  // neutral placeholder before any text is sent to the TTS proxy / Google (audit P1-6).
  useEffect(() => {
    audioService.setPrivateNames([
      progress.childName,
      progress.firstName,
      progress.lastName,
      currentUser?.first_name,
      currentUser?.last_name,
      currentUser?.username,
    ]);
  }, [progress.childName, progress.firstName, progress.lastName, currentUser?.first_name, currentUser?.last_name, currentUser?.username]);

  useEffect(() => {
    async function loadData() {
      try {
        const activeSession = await sessionService.init();
        if (activeSession && activeSession.token && activeSession.user) {
          setSession(activeSession);
          setAuthToken(activeSession.token);
          setCurrentUser(activeSession.user);
          setIsGuest(false);
          storageService.setUser(activeSession.user.id || activeSession.user.username);
        } else {
          setSession(null);
          setAuthToken(null);
          setCurrentUser(null);
          storageService.setUser(null);
        }

        // 1. Initialize child profiles and determine primary & active child profile
        const [profiles, storedActiveId, savedPrimaryId] = await Promise.all([
          backendService.getProfiles(),
          backendService.getActiveProfileId(),
          storageService.loadPrimaryProfileId(),
        ]);

        let resolvedPrimaryId: string | number = 1;
        if (profiles && profiles.length > 0) {
          resolvedPrimaryId = profiles[0].id;
        } else if (savedPrimaryId) {
          resolvedPrimaryId = savedPrimaryId;
        }
        storageService.setPrimaryProfileId(resolvedPrimaryId);

        let resolvedActiveId: string | number = storedActiveId || resolvedPrimaryId;
        if (profiles && profiles.length > 0) {
          const match = profiles.find((p) => String(p.id) === String(resolvedActiveId));
          if (!match) {
            resolvedActiveId = profiles[0].id;
          }
        }
        setActiveProfileId(resolvedActiveId);
        storageService.setProfile(resolvedActiveId);
        if (String(resolvedActiveId) !== String(storedActiveId)) {
          const numericId =
            typeof resolvedActiveId === 'number'
              ? resolvedActiveId
              : parseInt(String(resolvedActiveId), 10) || 1;
          backendService.setActiveProfileId(numericId).catch(() => {});
        }

        // 2. Load preferences & progress for this active child profile
        const [savedPrefs, savedProg] = await Promise.all([
          storageService.getPreferences(),
          storageService.getProgress(),
        ]);

        let activeProg = savedProg;
        // Purge any stale legacy test profile names ('aa', 'bb')
        if (activeProg.childName === 'aa' || activeProg.childName === 'bb') {
          activeProg = await storageService.saveProgress({
            childName: 'Little Star',
            hasCompletedFirstTimeName: false,
          });
        }

        const currentActiveProfile = profiles?.find((p) => String(p.id) === String(resolvedActiveId));
        if (
          currentActiveProfile?.nickname &&
          currentActiveProfile.nickname !== 'aa' &&
          currentActiveProfile.nickname !== 'bb' &&
          (!activeProg.childName || activeProg.childName === 'Little' || activeProg.childName === 'Little Star')
        ) {
          activeProg = await storageService.saveProgress({
            childName: currentActiveProfile.nickname,
            hasCompletedFirstTimeName: true,
          });
        }
        if (currentActiveProfile?.age_group && (!savedPrefs.ageGroup || savedPrefs.ageGroup !== currentActiveProfile.age_group)) {
          savedPrefs.ageGroup = currentActiveProfile.age_group;
          storageService.savePreferences({ ageGroup: currentActiveProfile.age_group }).catch(() => {});
        }

        setPreferences(savedPrefs);
        setProgress(activeProg);
        soundEffects.setSoundEnabled(savedPrefs.soundEnabled);
        audioService.setSoundEnabled(savedPrefs.soundEnabled);

        const [storedGender, storedRate, storedPitch] = await Promise.all([
          audioService.initVoiceGender(),
          audioService.initVoiceRate(),
          audioService.initVoicePitch(),
        ]);
        setVoiceGenderState(storedGender);
        setVoiceRateState(storedRate);
        setVoicePitchState(storedPitch);

        if (activeSession && activeSession.token && activeSession.user) {
          // Verify session freshness with backend in background
          sessionService.verifyBackendSession().then(async (verification) => {
            if (verification.user) {
              setCurrentUser(verification.user);
            } else if (!verification.isValid) {
              // The server revoked the token (logout elsewhere, password reset, account removed).
              // sessionService already cleared storage; without this the UI stayed "signed in"
              // while every sync silently failed with 401.
              await logoutUserRef.current?.();
              router.replace('/login');
            }
          }).catch(() => {});
        } else {
          // Only enter guest mode if user explicitly selected guest mode!
          // When logged out, isGuest is false, allowing splash screen to route to /login.
          if (savedPrefs.isGuest === true) {
            setIsGuest(true);
          } else {
            setIsGuest(false);
          }
        }

        // Trigger background cloud synchronization with Django backend
        if (activeSession && activeSession.token && activeSession.user) {
          const syncEpoch = profileEpochRef.current;
          backendService.syncAllProgressWithCloud(activeProg, false, Number(resolvedActiveId)).then(async (serverState) => {
            if (syncEpoch !== profileEpochRef.current) return;
            const latestLocal = await storageService.getProgress();
            if (syncEpoch !== profileEpochRef.current) return;
            const update = mergeServerProgress(latestLocal, serverState);
            if (update) {
              const saved = await storageService.saveProgress(update);
              if (syncEpoch === profileEpochRef.current) setProgress(saved);
            }
          }).catch(() => {});
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const continueAsGuest = async (
    childName?: string,
    ageGroupOption?: AgeGroup,
    avatarChoice?: string,
    markNameCompleted?: boolean
  ) => {
    setIsGuest(true);
    const chosenName = (childName && childName.trim().length > 0) ? childName.trim() : 'Little Star';
    const chosenAge = ageGroupOption || preferences.ageGroup || '2-4';
    const chosenAvatar = avatarChoice || 'avatar_3d_boy';

    // 1. Establish dedicated clean guest profile (never pollutes parent accounts)
    const guestProfile = await backendService.setGuestProfile(chosenName, chosenAge, chosenAvatar);
    setActiveProfileId(guestProfile.id);
    storageService.setUser(null);
    storageService.setProfile(guestProfile.id);
    storageService.setPrimaryProfileId(guestProfile.id);

    // 2. Persist guest preferences & progress cleanly
    const hasName =
      Boolean(markNameCompleted) ||
      (chosenName !== 'Little Star' && chosenName !== 'Little' && chosenName !== 'aa' && chosenName !== 'bb');
    const [updatedPrefs, updatedProg] = await Promise.all([
      storageService.savePreferences({
        hasCompletedOnboarding: true,
        isGuest: true,
        ageGroup: chosenAge,
      }),
      storageService.saveProgress({
        childName: chosenName,
        currentAvatar: { character: chosenAvatar },
        hasCompletedFirstTimeName: hasName,
      }),
    ]);

    setPreferences(updatedPrefs);
    setProgress(updatedProg);
  };

  const t = (key: string, vars?: Record<string, string | number>): string => {
    return getTranslation(preferences.language, key, vars);
  };

  const setLanguage = async (lang: AppLanguage) => {
    const updated = await storageService.savePreferences({ language: lang });
    setPreferences(updated);
  };

  const setAgeGroup = async (group: AgeGroup) => {
    const updated = await storageService.savePreferences({ ageGroup: group });
    setPreferences(updated);
    try {
      const activeId = activeProfileId || (await backendService.getActiveProfileId()) || 1;
      await backendService.updateProfileAgeGroup(activeId, group);
    } catch {}
  };

  const toggleSound = async () => {
    const nextSoundEnabled = !preferences.soundEnabled;
    const updated = await storageService.savePreferences({
      soundEnabled: nextSoundEnabled,
    });
    setPreferences(updated);
    soundEffects.setSoundEnabled(nextSoundEnabled);
    audioService.setSoundEnabled(nextSoundEnabled);
    if (!nextSoundEnabled) {
      audioService.stop();
      soundEffects.stopAnimalSound();
      soundEffects.stopBgm();
    } else {
      soundEffects.playBubblePop();
    }
  };

  const finishOnboarding = async (
    lang: AppLanguage,
    age: AgeGroup,
    childName?: string,
    dob?: string
  ) => {
    const updated = await storageService.savePreferences({
      language: lang,
      ageGroup: age,
      hasCompletedOnboarding: true,
    });
    setPreferences(updated);
    try {
      const activeId = activeProfileId || (await backendService.getActiveProfileId()) || 1;
      await backendService.updateProfileAgeGroup(activeId, age);
    } catch {}

    const updatedProg = await storageService.saveProgress({
      ...(childName !== undefined ? { childName: childName.trim() } : {}),
      hasCompletedFirstTimeName: true,
      ...(dob ? { dob } : {}),
    });
    setProgress(updatedProg);
  };

  const completeLesson = async (lessonId: string) => {
    const res = await storageService.markLessonCompleted(lessonId);
    const updatedProg = await storageService.getProgress();
    setProgress(updatedProg);
    // Guest progress stays on the device; only a signed-in parent's child syncs (audit P0-2).
    if (authToken && !isGuest) {
      backendService.syncLessonProgress(lessonId, true).catch(() => {});
    }
    return res;
  };

  const recordScore = async (gameType: string, score: number, totalQuestions?: number) => {
    await storageService.recordGameScore(gameType, score);
    const updatedProg = await storageService.getProgress();
    setProgress(updatedProg);
    if (authToken && !isGuest) {
      // Single reporting path (games used to post a second, duplicate result with total=5).
      const total = Math.max(score, totalQuestions ?? score);
      backendService.syncGameResult(gameType, score, total).catch(() => {});
    }
  };

  const updateProgress = async (newProg: Partial<UserProgress>) => {
    const updated = await storageService.saveProgress(newProg);
    setProgress(updated);
    if (authToken && !isGuest && activeProfileId) {
      backendService.syncAllProgressWithCloud(updated, false, Number(activeProfileId)).catch(() => {});
    }
  };

  const addCoins = async (amount: number) => {
    setProgress(await storageService.addCoins(amount));
  };

  const spendCoins = async (amount: number): Promise<boolean> => {
    const success = await storageService.spendCoins(amount);
    if (success) {
      const updated = await storageService.getProgress();
      setProgress(updated);
    }
    return success;
  };

  const recordWrongAnswer = async (wrong: { id: string; prompt: string; correctOption: string; hint?: string; language?: AppLanguage }) => {
    await storageService.recordWrongAnswer(wrong);
    const updated = await storageService.getProgress();
    setProgress(updated);
  };

  const clearWrongAnswer = async (id: string) => {
    await storageService.clearWrongAnswer(id);
    const updated = await storageService.getProgress();
    setProgress(updated);
  };

  const prefsRef = React.useRef(preferences);
  prefsRef.current = preferences;

  const speak = React.useCallback((text: string, langOverride?: AppLanguage | (() => void), onDone?: () => void) => {
    const curPrefs = prefsRef.current;
    let effectiveLang: AppLanguage = curPrefs.language;
    let doneCb: (() => void) | undefined = onDone;
    if (typeof langOverride === 'function') {
      doneCb = langOverride;
    } else if (typeof langOverride === 'string') {
      effectiveLang = langOverride;
    }
    audioService.speak(text, effectiveLang, curPrefs.soundEnabled, doneCb);
  }, []);

  const setVoiceGender = async (gender: 'male' | 'female' | 'child'): Promise<void> => {
    setVoiceGenderState(gender);
    await audioService.setVoiceGender(gender);
  };

  const setVoiceRate = async (rate: number): Promise<void> => {
    setVoiceRateState(rate);
    await audioService.setVoiceRate(rate);
  };

  const setVoicePitch = async (pitch: number): Promise<void> => {
    setVoicePitchState(pitch);
    await audioService.setVoicePitch(pitch);
  };

  const stopSpeaking = React.useCallback(() => {
    audioService.stop();
  }, []);

  const resetProgress = async () => {
    const current = await storageService.getProgress();
    const cleanProgress: UserProgress = {
      ...DEFAULT_PROGRESS,
      childName: current.childName || currentUser?.first_name || '',
      firstName: currentUser?.first_name || current.firstName || '',
      lastName: currentUser?.last_name || current.lastName || '',
      dob: current.dob || '',
      hasCompletedFirstTimeName: true,
      streakDays: 1,
      lastStreakDate: getTodayDateKey(),
      completedLessons: [],
      stars: 0,
      coins: 50,
      seeds: 5,
      water: 10,
      adventureLevel: 1,
      earnedBadges: ['badge-welcome'],
      gameStats: {},
      wrongAnswers: [],
      lastActive: new Date().toISOString(),
    };
    profileEpochRef.current += 1;
    await storageService.resetUserProgress(cleanProgress.childName, {
      firstName: cleanProgress.firstName,
      lastName: cleanProgress.lastName,
      dob: cleanProgress.dob,
      hasCompletedFirstTimeName: cleanProgress.hasCompletedFirstTimeName,
    });
    setProgress(cleanProgress);
    if (authToken && !isGuest) {
      // backendService persists a pending-reset flag and re-sends `is_reset: true` on every
      // later sync until the server acknowledges it, so an offline reset is not undone (P1-3).
      backendService.syncAllProgressWithCloud(cleanProgress, true, Number(activeProfileId)).catch(() => {});
    }
  };

  const resetAll = async () => {
    await storageService.resetAllData();
    await sessionService.endSession();
    storageService.setUser(null);
    storageService.setProfile(null);
    setActiveProfileId(1);
    setPreferences(DEFAULT_PREFERENCES);
    setProgress(DEFAULT_PROGRESS);
    setCurrentUser(null);
    setAuthToken(null);
    setSession(null);
    setIsGuest(false);
  };

  const login = async (payload: LoginPayload): Promise<AuthResult> => {
    const result = await authService.login(payload);
    if (result.success && result.user && result.token) {
      const activeSession = await sessionService.startSession(result.token, result.user);
      setSession(activeSession);
      setCurrentUser(result.user);
      setAuthToken(result.token);
      setIsGuest(false);
      storageService.setUser(result.user.id || result.user.username);
      await storageService.savePreferences({
        hasCompletedOnboarding: true,
        isGuest: false,
      });

      if (result.user.child_profiles && result.user.child_profiles.length > 0) {
        const firstChild = result.user.child_profiles[0];
        storageService.setPrimaryProfileId(firstChild.id);
        storageService.setProfile(firstChild.id);
        setActiveProfileId(firstChild.id);
        await backendService.setActiveProfileId(firstChild.id);
      }

      let userProg = await storageService.getProgress();

      if (result.user.child_profiles && result.user.child_profiles.length > 0) {
        const firstChild = result.user.child_profiles[0];
        if (firstChild.nickname && (!userProg.childName || userProg.childName === 'Little' || userProg.childName === 'Little Star')) {
          userProg = await storageService.saveProgress({ childName: firstChild.nickname, hasCompletedFirstTimeName: true });
        }
        if (firstChild.age_group) {
          await storageService.savePreferences({ ageGroup: firstChild.age_group });
          setPreferences((prev) => ({ ...prev, ageGroup: firstChild.age_group }));
        }
      }
      setProgress(userProg);

      profileEpochRef.current += 1;
      const syncEpoch = profileEpochRef.current;
      const targetChildId = result.user.child_profiles?.[0]?.id;
      backendService.syncAllProgressWithCloud(userProg, false, targetChildId).then(async (serverState) => {
        if (syncEpoch !== profileEpochRef.current) return;
        const latestLocal = await storageService.getProgress();
        if (syncEpoch !== profileEpochRef.current) return;
        const update = mergeServerProgress(latestLocal, serverState);
        if (update) {
          const saved = await storageService.saveProgress(update);
          if (syncEpoch === profileEpochRef.current) setProgress(saved);
        }
      }).catch(() => {});
    }
    return result;
  };

  const registerUser = async (payload: RegisterPayload): Promise<AuthResult> => {
    const result = await authService.register(payload);
    if (result.success && result.user && result.token) {
      const activeSession = await sessionService.startSession(result.token, result.user);
      setSession(activeSession);
      setCurrentUser(result.user);
      setAuthToken(result.token);
      setIsGuest(false);
      storageService.setUser(result.user.id || result.user.username);
      await storageService.savePreferences({
        hasCompletedOnboarding: true,
        isGuest: false,
      });

      // Bind the real ChildProfile ID created by the backend
      let activeChildId: number | string = 1;
      if (result.user.child_profiles && result.user.child_profiles.length > 0) {
        const firstChild = result.user.child_profiles[0];
        activeChildId = firstChild.id;
        storageService.setPrimaryProfileId(firstChild.id);
        storageService.setProfile(firstChild.id);
        setActiveProfileId(firstChild.id);
        await backendService.setActiveProfileId(firstChild.id);
      } else {
        storageService.setPrimaryProfileId(1);
        storageService.setProfile(1);
        setActiveProfileId(1);
        await backendService.setActiveProfileId(1);
      }

      // If user was previously playing as guest with earned progress, preserve it seamlessly
      const guestStars = isGuest && progress?.stars ? progress.stars : 0;
      const guestCoins = isGuest && progress?.coins ? Math.max(50, progress.coins) : 50;
      const guestAdventure = isGuest && progress?.adventureLevel ? progress.adventureLevel : 1;
      const guestLessons = isGuest && progress?.completedLessons ? progress.completedLessons : [];
      const guestBadges = isGuest && progress?.earnedBadges?.length ? progress.earnedBadges : ['badge-welcome'];

      const freshProgress: UserProgress = {
        ...DEFAULT_PROGRESS,
        childName: payload.child_nickname || result.user.first_name || payload.parent_name || 'Little Star',
        firstName: result.user.first_name || payload.parent_name || '',
        lastName: result.user.last_name || '',
        dob: '',
        hasCompletedFirstTimeName: true,
        streakDays: isGuest && progress?.streakDays ? progress.streakDays : 1,
        lastStreakDate: getTodayDateKey(),
        completedLessons: guestLessons,
        stars: guestStars,
        coins: guestCoins,
        seeds: 5,
        water: 10,
        adventureLevel: guestAdventure,
        earnedBadges: guestBadges,
        gameStats: isGuest && progress?.gameStats ? progress.gameStats : {},
        wrongAnswers: [],
        lastActive: new Date().toISOString(),
      };
      await storageService.overwriteProgress(freshProgress);
      setProgress(freshProgress);

      const initialProfile: ChildProfile = {
        id: typeof activeChildId === 'number' ? activeChildId : parseInt(String(activeChildId), 10) || 1,
        nickname: payload.child_nickname || freshProgress.childName || 'Little Star',
        age_group: (payload.child_age_group as AgeGroup) || '2-4',
        avatar: '🦁',
        created_at: new Date().toISOString(),
      };
      AsyncStorage.setItem('@kidszone_child_profiles', JSON.stringify([initialProfile])).catch(() => {});
      AsyncStorage.setItem('@kidszone_active_profile_id', String(activeChildId)).catch(() => {});

      if (payload.child_age_group) {
        const group: AgeGroup = payload.child_age_group;
        await storageService.savePreferences({ ageGroup: group });
        setPreferences((prev) => ({ ...prev, ageGroup: group }));
      }

      // Immediately sync initial progress to cloud with the bound profile ID
      backendService.syncAllProgressWithCloud(freshProgress, false, Number(activeChildId)).catch(() => {});
    }
    return result;
  };

  const switchProfile = async (
    profileId: number | string,
    newAgeGroup?: AgeGroup,
    nickname?: string
  ): Promise<UserProgress> => {
    profileEpochRef.current += 1;
    const syncEpoch = profileEpochRef.current;
    setActiveProfileId(profileId);
    storageService.setProfile(profileId);
    await backendService.setActiveProfileId(
      typeof profileId === 'number' ? profileId : parseInt(String(profileId), 10) || 1
    );

    if (newAgeGroup) {
      await storageService.savePreferences({ ageGroup: newAgeGroup });
      setPreferences((prev) => ({ ...prev, ageGroup: newAgeGroup }));
    }

    let profProgress = await storageService.getProgress();
    if ((!profProgress.childName || profProgress.childName === 'Little' || profProgress.childName === 'Little Star') && nickname) {
      profProgress = await storageService.saveProgress({
        childName: nickname,
        hasCompletedFirstTimeName: true,
      });
    }
    setProgress(profProgress);
    backendService.syncAllProgressWithCloud(profProgress, false, Number(profileId)).then(async (serverState) => {
      if (syncEpoch !== profileEpochRef.current) return;
      const latestLocal = await storageService.getProgress();
      if (syncEpoch !== profileEpochRef.current) return;
      const update = mergeServerProgress(latestLocal, serverState);
      if (update) {
        const saved = await storageService.saveProgress(update);
        if (syncEpoch === profileEpochRef.current) setProgress(saved);
      }
    }).catch(() => {});
    return profProgress;
  };

  const logoutUser = async (): Promise<void> => {
    profileEpochRef.current += 1;
    await sessionService.endSession();
    await backendService.clearLocalProfiles();
    await backendService.clearGuestProfiles();
    storageService.setUser(null);
    storageService.setProfile(null);
    storageService.setPrimaryProfileId(null);
    setActiveProfileId(1);
    setCurrentUser(null);
    setAuthToken(null);
    setSession(null);
    setIsGuest(false);
    setProgress(DEFAULT_PROGRESS);
    try {
      await storageService.savePreferences({ isGuest: false });
    } catch {}
  };

  logoutUserRef.current = logoutUser;

  const contextValue = React.useMemo<AppContextValue>(
    () => ({
      language: preferences.language,
      ageGroup: preferences.ageGroup,
      soundEnabled: preferences.soundEnabled,
      hasCompletedOnboarding: preferences.hasCompletedOnboarding,
      progress,
      isLoading,
      currentUser,
      authToken,
      session,
      isAuthenticated: !!authToken,
      isGuest,
      activeProfileId,
      switchProfile,
      continueAsGuest,
      t,
      setLanguage,
      setAgeGroup,
      toggleSound,
      finishOnboarding,
      completeLesson,
      recordScore,
      updateProgress,
      addCoins,
      spendCoins,
      recordWrongAnswer,
      clearWrongAnswer,
      voiceGender,
      setVoiceGender,
      voiceRate,
      setVoiceRate,
      voicePitch,
      setVoicePitch,
      speak,
      stopSpeaking,
      resetProgress,
      resetAll,
      login,
      registerUser,
      logoutUser,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      preferences.language,
      preferences.ageGroup,
      preferences.soundEnabled,
      preferences.hasCompletedOnboarding,
      progress,
      isLoading,
      currentUser,
      authToken,
      session,
      isGuest,
      activeProfileId,
      voiceGender,
      voiceRate,
      voicePitch,
    ]
  );

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
