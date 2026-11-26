import { useRouter, type Href } from 'expo-router';

/**
 * Global navigation lock & timestamp to prevent rapid double/triple taps
 * from pushing multiple duplicate routes or triggering multiple redirects.
 */
let globalLastNavTime = 0;
let globalIsNavigating = false;
let globalTargetRoute: string | null = null;
const DEFAULT_DEBOUNCE_MS = 800;

/**
 * Every route path in the app as a string literal union (Expo Router typed routes, including
 * `?query` / `#hash` suffixes). Use it for route fields that are also inspected as strings.
 */
export type AppRoute = Extract<Href, string>;

type NavRouter = Pick<ReturnType<typeof useRouter>, 'push' | 'replace'>;

/** Stable comparison key for string and object hrefs. */
const hrefKey = (href: Href): string => (typeof href === 'string' ? href : JSON.stringify(href));

export const safeNavigate = (
  router: NavRouter,
  href: Href,
  mode: 'push' | 'replace' = 'push',
  debounceMs: number = DEFAULT_DEBOUNCE_MS
): boolean => {
  const now = Date.now();
  const key = hrefKey(href);
  // Drop rapid subsequent taps within debounce period
  if (globalIsNavigating && now - globalLastNavTime < debounceMs) {
    return false;
  }
  if (now - globalLastNavTime < debounceMs && globalTargetRoute === key) {
    return false;
  }

  globalIsNavigating = true;
  globalLastNavTime = now;
  globalTargetRoute = key;

  setTimeout(() => {
    globalIsNavigating = false;
    globalTargetRoute = null;
  }, debounceMs);

  try {
    if (mode === 'replace') {
      router.replace(href);
    } else {
      router.push(href);
    }
    return true;
  } catch {
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

  const push = (href: Href) => safeNavigate(router, href, 'push', debounceMs);
  const replace = (href: Href) => safeNavigate(router, href, 'replace', debounceMs);
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
