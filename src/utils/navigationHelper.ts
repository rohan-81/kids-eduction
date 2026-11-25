import { useRouter } from 'expo-router';

/**
 * Global navigation lock & timestamp to prevent rapid double/triple taps
 * from pushing multiple duplicate routes or triggering multiple redirects.
 */
let globalLastNavTime = 0;
let globalIsNavigating = false;
let globalTargetRoute: string | null = null;
const DEFAULT_DEBOUNCE_MS = 800;

export const safeNavigate = (
  router: { push: (href: any) => void; replace: (href: any) => void; back?: () => void },
  href: string,
  mode: 'push' | 'replace' = 'push',
  debounceMs: number = DEFAULT_DEBOUNCE_MS
): boolean => {
  const now = Date.now();
  // Drop rapid subsequent taps within debounce period
  if (globalIsNavigating && now - globalLastNavTime < debounceMs) {
    return false;
  }
  if (now - globalLastNavTime < debounceMs && globalTargetRoute === href) {
    return false;
  }

  globalIsNavigating = true;
  globalLastNavTime = now;
  globalTargetRoute = href;

  setTimeout(() => {
    globalIsNavigating = false;
    globalTargetRoute = null;
  }, debounceMs);

  try {
    if (mode === 'replace') {
      router.replace(href as any);
    } else {
      router.push(href as any);
    }
    return true;
  } catch (err) {
    globalIsNavigating = false;
    globalTargetRoute = null;
    return false;
  }
};

/**
 * Hook to provide debounced router methods across screens and widgets.
 */
export const useSafeRouter = (debounceMs: number = DEFAULT_DEBOUNCE_MS) => {
  const router = useRouter();

  const push = (href: any) => safeNavigate(router, href, 'push', debounceMs);
  const replace = (href: any) => safeNavigate(router, href, 'replace', debounceMs);
  const back = () => {
    const now = Date.now();
    if (now - globalLastNavTime < debounceMs) return;
    globalLastNavTime = now;
    if (typeof router.back === 'function') {
      router.back();
    }
  };

  return {
    ...router,
    push,
    replace,
    back,
  };
};
