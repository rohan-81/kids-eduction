import { Platform } from 'react-native';
import { safeGetApiBaseUrl } from '../services/apiConfig';

/**
 * Fast, reliable internet connectivity check.
 * Checks a lightweight 204 endpoint first (avoids falsely marking offline when Render free tier is waking up),
 * falling back to the backend API categories endpoint.
 */
export async function checkInternetAvailable(timeoutMs: number = 3500): Promise<boolean> {
  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.onLine === false) {
    return false;
  }

  const probe = async (url: string): Promise<boolean> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    if (typeof timer === 'object' && typeof (timer as any).unref === 'function') {
      (timer as any).unref();
    }
    try {
      const res = await fetch(url, { method: 'GET', cache: 'no-store', signal: controller.signal });
      return res.ok || res.status === 204;
    } catch {
      return false;
    } finally {
      clearTimeout(timer);
    }
  };

  if (await probe('https://clients3.google.com/generate_204')) {
    return true;
  }
  return probe(`${safeGetApiBaseUrl()}/lessons/categories/`);
}

