import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser, SessionData } from '../types';
import { authService } from './authService';

const SESSION_KEY = '@kidszone_auth_session';
import { safeGetApiBaseUrl } from './apiConfig';

class SessionService {
  private currentSession: SessionData | null = null;
  private initialized: boolean = false;

  constructor() {
    authService.onLogout?.(() => {
      this.currentSession = null;
      this.initialized = false;
      AsyncStorage.removeItem(SESSION_KEY).catch(() => {});
    });
  }

  async init(): Promise<SessionData | null> {
    if (this.initialized) {
      return this.currentSession;
    }

    try {
      const stored = await AsyncStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed: SessionData = JSON.parse(stored);
        if (parsed.token && parsed.user && parsed.isActive) {
          authService.setSessionCredentials(parsed.token, parsed.user);
          this.currentSession = {
            ...parsed,
            lastActiveAt: new Date().toISOString(),
          };
          await this.saveSessionToStorage(this.currentSession);
        } else {
          this.currentSession = null;
        }
      } else {
        // Fallback: check if authService already has credentials stored
        const auth = await authService.init();
        if (auth.token && auth.user) {
          this.currentSession = {
            token: auth.token,
            user: auth.user,
            createdAt: new Date().toISOString(),
            lastActiveAt: new Date().toISOString(),
            isActive: true,
          };
          await this.saveSessionToStorage(this.currentSession);
        }
      }
    } catch {
      this.currentSession = null;
    } finally {
      this.initialized = true;
    }

    return this.currentSession;
  }

  getCurrentSession(): SessionData | null {
    return this.currentSession;
  }

  isSessionActive(): boolean {
    return !!(this.currentSession && this.currentSession.isActive && this.currentSession.token);
  }

  async startSession(token: string, user: AuthUser): Promise<SessionData> {
    authService.setSessionCredentials(token, user);
    const now = new Date().toISOString();
    const session: SessionData = {
      token,
      user,
      createdAt: now,
      lastActiveAt: now,
      isActive: true,
    };
    this.currentSession = session;
    this.initialized = true;
    await this.saveSessionToStorage(session);
    return session;
  }

  async updateActivity(): Promise<void> {
    if (!this.currentSession || !this.currentSession.isActive) return;
    this.currentSession.lastActiveAt = new Date().toISOString();
    await this.saveSessionToStorage(this.currentSession);
  }

  async endSession(): Promise<void> {
    this.currentSession = null;
    this.initialized = false;
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
    } catch {}
    try {
      await authService.logout();
    } catch {}
  }

  async verifyBackendSession(): Promise<{ isValid: boolean; user?: AuthUser }> {
    if (!this.currentSession?.token) {
      return { isValid: false };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    try {
      const res = await fetch(`${safeGetApiBaseUrl()}/auth/session/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${this.currentSession.token}`,
        },
        signal: controller.signal,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.is_active && data.user) {
          this.currentSession.user = data.user;
          this.currentSession.lastActiveAt = new Date().toISOString();
          await this.saveSessionToStorage(this.currentSession);
          return { isValid: true, user: data.user };
        }
      } else if (res.status === 401) {
        // Backend revoked token
        await this.endSession();
        return { isValid: false };
      }
    } catch {
      // In offline mode, treat local active session as valid
      return { isValid: true, user: this.currentSession.user };
    } finally {
      clearTimeout(timeoutId);
    }

    return { isValid: true, user: this.currentSession.user };
  }

  private async saveSessionToStorage(session: SessionData): Promise<void> {
    try {
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {}
  }
}

export const sessionService = new SessionService();
