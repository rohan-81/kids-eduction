import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser, RegisterPayload, LoginPayload, AuthResult } from '../types';

import { safeGetApiBaseUrl } from './apiConfig';
const TOKEN_KEY = '@kidszone_auth_token';
const USER_KEY = '@kidszone_auth_user';

class AuthService {
  private token: string | null = null;
  private user: AuthUser | null = null;
  private initialized: boolean = false;

  async init(): Promise<{ token: string | null; user: AuthUser | null }> {
    if (this.initialized) {
      return { token: this.token, user: this.user };
    }
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);
      this.token = storedToken;
      this.user = storedUser ? JSON.parse(storedUser) : null;
      this.initialized = true;
    } catch {
      this.token = null;
      this.user = null;
      this.initialized = true;
    }
    return { token: this.token, user: this.user };
  }

  setSessionCredentials(token: string | null, user: AuthUser | null): void {
    this.token = token;
    this.user = user;
    this.initialized = true;
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): AuthUser | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Token ${this.token}`;
    }
    return headers;
  }

  async register(payload: RegisterPayload): Promise<AuthResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${safeGetApiBaseUrl()}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json();

      if (res.ok && data.token) {
        this.token = data.token;
        this.user = data.user;
        await Promise.all([
          AsyncStorage.setItem(TOKEN_KEY, data.token),
          AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user)),
        ]);
        return {
          success: true,
          token: data.token,
          user: data.user,
          message: data.message || 'Account created successfully!',
        };
      }

      // Format validation errors cleanly
      let errorMsg = 'Registration failed. Please check your inputs.';
      if (typeof data === 'object') {
        const errorEntries = Object.entries(data);
        if (errorEntries.length > 0) {
          const [field, errors] = errorEntries[0];
          const text = Array.isArray(errors) ? errors[0] : String(errors);
          errorMsg = `${field.replace('_', ' ')}: ${text}`;
        }
      }

      return { success: false, error: errorMsg };
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return { success: false, error: 'Connection timed out. Please check your server or internet.' };
      }
      return {
        success: false,
        error: 'Unable to connect to the authentication server. Please try again.',
      };
    }
  }

  async login(payload: LoginPayload): Promise<AuthResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${safeGetApiBaseUrl()}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json();

      if (res.ok && data.token) {
        this.token = data.token;
        this.user = data.user;
        await Promise.all([
          AsyncStorage.setItem(TOKEN_KEY, data.token),
          AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user)),
        ]);
        return {
          success: true,
          token: data.token,
          user: data.user,
          message: data.message || 'Signed in successfully!',
        };
      }

      let errorMsg = 'Invalid username/email or password.';
      if (data?.non_field_errors) {
        errorMsg = Array.isArray(data.non_field_errors)
          ? data.non_field_errors[0]
          : String(data.non_field_errors);
      } else if (typeof data === 'object') {
        const errorEntries = Object.entries(data);
        if (errorEntries.length > 0) {
          const [field, errors] = errorEntries[0];
          const text = Array.isArray(errors) ? errors[0] : String(errors);
          errorMsg = `${field.replace('_', ' ')}: ${text}`;
        }
      }

      return { success: false, error: errorMsg };
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return { success: false, error: 'Connection timed out. Please check your server or internet.' };
      }
      return {
        success: false,
        error: 'Unable to reach the authentication service. Please verify your connection.',
      };
    }
  }

  async logout(): Promise<void> {
    const tokenToInvalidate = this.token;
    this.token = null;
    this.user = null;
    this.initialized = false;

    try {
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY),
        AsyncStorage.removeItem('@kidszone_auth_session'),
      ]);
    } catch {}

    if (tokenToInvalidate) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000);
        if (typeof timeoutId === 'object' && typeof (timeoutId as any).unref === 'function') {
          (timeoutId as any).unref();
        }
        fetch(`${safeGetApiBaseUrl()}/auth/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${tokenToInvalidate}`,
          },
          signal: controller.signal,
        })
          .then(() => clearTimeout(timeoutId))
          .catch(() => {});
      } catch {
        // Non-blocking fire-and-forget
      }
    }
  }

  async fetchCurrentUser(): Promise<AuthUser | null> {
    if (!this.token) return null;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(`${safeGetApiBaseUrl()}/auth/me/`, {
        headers: this.getAuthHeaders(),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          this.user = data.user;
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
          return data.user;
        }
      } else if (res.status === 401) {
        // Token expired or invalid
        await this.logout();
      }
    } catch {
      // Offline fallback: return existing cached user
    }
    return this.user;
  }
}

export const authService = new AuthService();

