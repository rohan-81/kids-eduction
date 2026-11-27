import { Platform, AppState, AppStateStatus, type NativeEventSubscription } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTodayDateKey } from './storageService';
import type { TimerHandle } from '../utils/runtime';

export type ScreenTimeLimitId = '15m' | '30m' | '45m' | '60m' | 'unlimited';

const STORAGE_KEYS = {
  SCREEN_TIME_LIMIT: '@kidszone_screen_time_limit',
  EYE_CARE_ENABLED: '@kidszone_eye_care_enabled',
  DAILY_USAGE: '@kidszone_daily_usage_v1',
};

const MAX_HISTORY_DAYS = 35;

export function formatLocalDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function pruneHistorySeconds(raw: Record<string, number>): Record<string, number> {
  const entries = Object.entries(raw)
    .filter(
      ([key, val]) =>
        /^\d{4}-\d{2}-\d{2}$/.test(key) &&
        typeof val === 'number' &&
        Number.isFinite(val) &&
        val > 0
    )
    .sort(([a], [b]) => a.localeCompare(b));
  if (entries.length <= MAX_HISTORY_DAYS) {
    return Object.fromEntries(entries);
  }
  return Object.fromEntries(entries.slice(entries.length - MAX_HISTORY_DAYS));
}

export const SCREEN_TIME_MINUTES_MAP: Record<ScreenTimeLimitId, number> = {
  '15m': 15,
  '30m': 30,
  '45m': 45,
  '60m': 60,
  unlimited: 0,
};

type WellnessListener = {
  onEyeCareDue?: () => void;
  onDailyLimitReached?: (minutesUsed: number, limitMinutes: number) => void;
  onDailyLimitUnlocked?: () => void;
};

class ScreenWellnessService {
  private listeners: Set<WellnessListener> = new Set();
  private usageListeners: Set<() => void> = new Set();
  private continuousMinutes: number = 0;
  private timerInterval: TimerHandle | null = null;
  // Default to unlimited so kids/testers aren't randomly locked out unless parents set a limit
  private currentLimit: ScreenTimeLimitId = 'unlimited';
  private eyeCareEnabled: boolean = true;
  private dailyMinutesUsed: number = 0;
  private todaySeconds: number = 0;
  private historySeconds: Record<string, number> = {};
  private lastActiveCheckpointMs: number | null = null;
  private snoozeUntilMinute: number = 0;
  private isEyeCareAlertActive: boolean = false;
  private isLimitAlertActive: boolean = false;
  private isAppActive: boolean = true;
  private appStateSubscription: NativeEventSubscription | null = null;
  private initialized: boolean = false;
  /** Date key the in-memory daily counters belong to (rolls over at midnight). */
  private dailyDateKey: string = getTodayDateKey();
  /** Resolves once persisted usage has loaded, so subscribers never see a stale 0 on cold start. */
  private ready: Promise<void>;

  constructor() {
    this.ready = this.init();
  }

  /** Resolves once persisted settings and today's usage have been loaded. */
  whenReady(): Promise<void> {
    return this.ready;
  }

  private notifyUsageListeners() {
    this.usageListeners.forEach((cb) => cb());
  }

  async init() {
    if (this.initialized) return;
    if (Platform.OS === 'web' && typeof window === 'undefined') return;
    this.initialized = true;

    // Track active vs background state so time only counts when app is actually in foreground
    if (Platform.OS !== 'web') {
      try {
        this.isAppActive = AppState.currentState === 'active';
        this.lastActiveCheckpointMs = this.isAppActive ? Date.now() : null;
        this.appStateSubscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
          if (nextState === 'active') {
            this.rollOverIfNewDay();
            this.isAppActive = true;
            this.lastActiveCheckpointMs = Date.now();
          } else {
            this.flushActiveTime();
            this.isAppActive = false;
            this.lastActiveCheckpointMs = null;
          }
        });
      } catch {}
    } else if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
      // Web: don't count screen time while the browser tab is hidden in the background
      this.isAppActive = !document.hidden;
      this.lastActiveCheckpointMs = this.isAppActive ? Date.now() : null;
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          this.rollOverIfNewDay();
          this.isAppActive = true;
          this.lastActiveCheckpointMs = Date.now();
        } else {
          this.flushActiveTime();
          this.isAppActive = false;
          this.lastActiveCheckpointMs = null;
        }
      });
      if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
        window.addEventListener('pagehide', () => {
          this.flushActiveTime();
        });
      }
    }

    try {
      const [limitVal, eyeCareVal, dailyVal] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.SCREEN_TIME_LIMIT),
        AsyncStorage.getItem(STORAGE_KEYS.EYE_CARE_ENABLED),
        AsyncStorage.getItem(STORAGE_KEYS.DAILY_USAGE),
      ]);

      if (limitVal) {
        this.currentLimit = limitVal as ScreenTimeLimitId;
      }
      if (eyeCareVal !== null) {
        this.eyeCareEnabled = eyeCareVal === 'true';
      }
      if (dailyVal) {
        try {
          const parsed = JSON.parse(dailyVal);
          const loadedHistory =
            parsed && parsed.history && typeof parsed.history === 'object'
              ? pruneHistorySeconds(parsed.history as Record<string, number>)
              : {};

          if (parsed && parsed.date === getTodayDateKey()) {
            const secs =
              typeof parsed.seconds === 'number' && Number.isFinite(parsed.seconds)
                ? Math.max(0, Math.round(parsed.seconds))
                : Math.max(0, Math.round((Number(parsed.minutes) || 0) * 60));
            this.todaySeconds = secs;
            this.dailyMinutesUsed = Math.floor(secs / 60);
            // Restore extra time a grown-up granted earlier today
            this.snoozeUntilMinute = Number(parsed.snoozeUntil) || 0;
            this.historySeconds = pruneHistorySeconds({
              ...loadedHistory,
              ...(secs > 0 ? { [this.dailyDateKey]: secs } : {}),
            });
          } else {
            // Preserve prior day's tracked time in history before resetting today's counters
            if (parsed && parsed.date) {
              const prevSecs =
                typeof parsed.seconds === 'number' && Number.isFinite(parsed.seconds)
                  ? Math.max(0, Math.round(parsed.seconds))
                  : Math.max(0, Math.round((Number(parsed.minutes) || 0) * 60));
              if (prevSecs > 0) {
                loadedHistory[String(parsed.date)] = prevSecs;
              }
            }
            this.historySeconds = pruneHistorySeconds(loadedHistory);
            this.todaySeconds = 0;
            this.dailyMinutesUsed = 0;
            await this.saveDailyUsage(0);
          }
        } catch {
          this.todaySeconds = 0;
          this.dailyMinutesUsed = 0;
          this.historySeconds = {};
        }
      }
    } catch (e) {
      console.warn('ScreenWellnessService init error:', e);
    }

    this.lastActiveCheckpointMs = this.isAppActive ? Date.now() : null;
    this.notifyUsageListeners();
    this.startTracking();
  }

  private startTracking() {
    if (this.timerInterval) return;
    // Tick every 60 seconds of active foreground app usage
    this.timerInterval = setInterval(() => {
      this.handleMinuteTick();
    }, 60000);
  }

  private async saveDailyUsage(mins: number) {
    try {
      const historyToPersist = pruneHistorySeconds({
        ...this.historySeconds,
        ...(this.todaySeconds > 0 ? { [this.dailyDateKey]: this.todaySeconds } : {}),
      });
      this.historySeconds = historyToPersist;
      await AsyncStorage.setItem(
        STORAGE_KEYS.DAILY_USAGE,
        JSON.stringify({
          date: this.dailyDateKey,
          minutes: mins,
          seconds: this.todaySeconds,
          snoozeUntil: this.snoozeUntilMinute,
          history: historyToPersist,
        })
      );
    } catch {}
  }

  /**
   * Resets the daily counters when the calendar day changes while the app stays open
   * (e.g. a tablet left on overnight), so yesterday's minutes never lock out today.
   */
  private rollOverIfNewDay() {
    const today = getTodayDateKey();
    if (today === this.dailyDateKey) return;
    if (this.todaySeconds > 0) {
      this.historySeconds = pruneHistorySeconds({
        ...this.historySeconds,
        [this.dailyDateKey]: this.todaySeconds,
      });
    }
    this.dailyDateKey = today;
    this.todaySeconds = 0;
    this.dailyMinutesUsed = 0;
    this.continuousMinutes = 0;
    this.snoozeUntilMinute = 0;
    const wasLocked = this.isLimitAlertActive;
    this.isLimitAlertActive = false;
    if (wasLocked) this.listeners.forEach((l) => l.onDailyLimitUnlocked?.());
  }

  private commitActiveElapsedTime(fallbackSecondsWhenNull: number) {
    if (!this.isAppActive) return;

    this.rollOverIfNewDay();

    const now = Date.now();
    const elapsedSeconds =
      this.lastActiveCheckpointMs !== null
        ? Math.max(0, Math.round((now - this.lastActiveCheckpointMs) / 1000))
        : fallbackSecondsWhenNull;
    this.lastActiveCheckpointMs = now;

    if (elapsedSeconds <= 0) return;

    const prevMinutes = this.dailyMinutesUsed;
    this.todaySeconds += elapsedSeconds;
    this.dailyMinutesUsed = Math.floor(this.todaySeconds / 60);
    this.historySeconds[this.dailyDateKey] = this.todaySeconds;

    const deltaMinutes = Math.max(0, this.dailyMinutesUsed - prevMinutes);
    if (deltaMinutes > 0) {
      this.continuousMinutes += deltaMinutes;
    }

    this.saveDailyUsage(this.dailyMinutesUsed);
    this.notifyUsageListeners();

    if (deltaMinutes <= 0) return;

    // 1. Eye care reminder: every 20 continuous minutes
    if (
      this.eyeCareEnabled &&
      !this.isEyeCareAlertActive &&
      this.continuousMinutes > 0 &&
      this.continuousMinutes % 20 === 0
    ) {
      this.isEyeCareAlertActive = true;
      this.listeners.forEach((l) => l.onEyeCareDue?.());
    }

    // 2. Daily screen time limit check
    const limitMinutes = SCREEN_TIME_MINUTES_MAP[this.currentLimit];
    if (
      limitMinutes > 0 &&
      !this.isLimitAlertActive &&
      this.dailyMinutesUsed >= limitMinutes &&
      this.dailyMinutesUsed >= this.snoozeUntilMinute
    ) {
      this.isLimitAlertActive = true;
      this.listeners.forEach((l) =>
        l.onDailyLimitReached?.(this.dailyMinutesUsed, limitMinutes)
      );
    }
  }

  private handleMinuteTick() {
    this.commitActiveElapsedTime(60);
  }

  /** Commits any partial active seconds accumulated since the last tick or state change. */
  flushActiveTime() {
    this.commitActiveElapsedTime(0);
  }

  subscribe(listener: WellnessListener): () => void {
    this.listeners.add(listener);
    // If daily limit was already reached today, notify subscriber right away. Wait for persisted
    // usage to load first: checking synchronously on a cold start saw 0 minutes and let a
    // relaunched app skip the bedtime lock until the next minute tick.
    this.ready.then(() => {
      if (!this.listeners.has(listener)) return;
      this.rollOverIfNewDay();
      const limitMinutes = SCREEN_TIME_MINUTES_MAP[this.currentLimit];
      if (
        limitMinutes > 0 &&
        this.dailyMinutesUsed >= limitMinutes &&
        this.dailyMinutesUsed >= this.snoozeUntilMinute
      ) {
        this.isLimitAlertActive = true;
        setTimeout(() => {
          listener.onDailyLimitReached?.(this.dailyMinutesUsed, limitMinutes);
        }, 400);
      }
    });
    return () => {
      this.listeners.delete(listener);
    };
  }

  isDailyLimitLocked(): boolean {
    const limitMinutes = SCREEN_TIME_MINUTES_MAP[this.currentLimit];
    if (limitMinutes <= 0) return false;
    return this.dailyMinutesUsed >= limitMinutes && this.dailyMinutesUsed >= this.snoozeUntilMinute;
  }

  async getScreenTimeLimit(): Promise<ScreenTimeLimitId> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.SCREEN_TIME_LIMIT);
      if (val) {
        this.currentLimit = val as ScreenTimeLimitId;
        return this.currentLimit;
      }
    } catch {}
    return this.currentLimit;
  }

  async setScreenTimeLimit(limit: ScreenTimeLimitId): Promise<void> {
    this.currentLimit = limit;
    const limitMinutes = SCREEN_TIME_MINUTES_MAP[limit];
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SCREEN_TIME_LIMIT, limit);
    } catch (e) {
      console.warn('Error saving screen time limit:', e);
    }

    if (limitMinutes === 0 || this.dailyMinutesUsed < limitMinutes) {
      // Limit relaxed or set to unlimited: unlock immediately
      this.isLimitAlertActive = false;
      this.snoozeUntilMinute = 0;
      this.listeners.forEach((l) => l.onDailyLimitUnlocked?.());
    } else if (limitMinutes > 0 && this.dailyMinutesUsed >= limitMinutes) {
      this.isLimitAlertActive = true;
      this.listeners.forEach((l) =>
        l.onDailyLimitReached?.(this.dailyMinutesUsed, limitMinutes)
      );
    }
  }

  async getEyeCareEnabled(): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.EYE_CARE_ENABLED);
      if (val !== null) {
        this.eyeCareEnabled = val === 'true';
        return this.eyeCareEnabled;
      }
    } catch {}
    return this.eyeCareEnabled;
  }

  async setEyeCareEnabled(enabled: boolean): Promise<void> {
    this.eyeCareEnabled = enabled;
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.EYE_CARE_ENABLED, String(enabled));
    } catch (e) {
      console.warn('Error saving eye care setting:', e);
    }
  }

  getTodayUsageMinutes(): number {
    this.rollOverIfNewDay();
    return this.dailyMinutesUsed;
  }

  getTodayUsageSeconds(): number {
    this.rollOverIfNewDay();
    return this.todaySeconds;
  }

  getUsageMinutesForDate(dateKey: string): number {
    this.rollOverIfNewDay();
    if (dateKey === this.dailyDateKey) {
      return this.dailyMinutesUsed;
    }
    return Math.floor((this.historySeconds[dateKey] || 0) / 60);
  }

  getTotalTrackedMinutes(): number {
    this.rollOverIfNewDay();
    let total = this.dailyMinutesUsed;
    for (const [key, secs] of Object.entries(this.historySeconds)) {
      if (key !== this.dailyDateKey) {
        total += Math.floor((secs || 0) / 60);
      }
    }
    return total;
  }

  subscribeUsage(listener: () => void): () => void {
    this.usageListeners.add(listener);
    return () => {
      this.usageListeners.delete(listener);
    };
  }

  async resetDailyUsage(): Promise<void> {
    this.todaySeconds = 0;
    this.dailyMinutesUsed = 0;
    this.continuousMinutes = 0;
    this.snoozeUntilMinute = 0;
    this.isLimitAlertActive = false;
    this.lastActiveCheckpointMs = this.isAppActive ? Date.now() : null;
    delete this.historySeconds[this.dailyDateKey];
    await this.saveDailyUsage(0);
    this.notifyUsageListeners();
    this.listeners.forEach((l) => l.onDailyLimitUnlocked?.());
  }

  acknowledgeEyeBreak() {
    this.continuousMinutes = 0;
    this.isEyeCareAlertActive = false;
  }

  /**
   * Only called when parent authorizes extra time through Parent Gate.
   */
  snoozeDailyLimit(additionalMinutes: number = 15) {
    this.isLimitAlertActive = false;
    // Grants additional active minutes before prompting again
    this.snoozeUntilMinute = this.dailyMinutesUsed + additionalMinutes;
    // Persist so the grown-up's extra time survives an app relaunch
    this.saveDailyUsage(this.dailyMinutesUsed);
    this.listeners.forEach((l) => l.onDailyLimitUnlocked?.());
  }

  /**
   * Dismisses the active alert popup without granting any free snooze time.
   */
  dismissDailyLimit() {
    this.isLimitAlertActive = false;
  }
}

export const screenWellnessService = new ScreenWellnessService();
