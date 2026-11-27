describe('Backend & API integration bug fixes', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it('remaps offline localId after flushOutbox and includes game_stats in CloudSyncPayload', async () => {
    const store: Record<string, string> = {};
    const syncCalls: Array<{ url: string; body: Record<string, unknown> }> = [];
    const serverProfile = {
      id: 777,
      name: 'Aarav',
      age_group: '6-8',
      avatar: 'avatar_3d_boy',
      preferred_language: 'gu',
      xp: 0,
      coins: 0,
      level: 1,
    };

    global.fetch = jest.fn(async (url: string, init: RequestInit = {}) => {
      const method = (init.method || 'GET').toUpperCase();
      const body = init.body ? JSON.parse(String(init.body)) : undefined;
      if (url.endsWith('/profiles/') && method === 'POST') {
        return { ok: true, status: 201, json: async () => serverProfile } as Response;
      }
      if (url.endsWith('/profiles/') && method === 'GET') {
        return { ok: true, status: 200, json: async () => [serverProfile] } as Response;
      }
      if (url.endsWith('/sync/') && method === 'POST') {
        syncCalls.push({ url, body });
        return {
          ok: true,
          status: 200,
          json: async () => ({ status: 'synchronized', child_profile_id: 777 }),
        } as Response;
      }
      return { ok: true, status: 200, json: async () => ({}) } as Response;
    }) as unknown as typeof fetch;

    jest.doMock('@react-native-async-storage/async-storage', () => ({
      __esModule: true,
      default: {
        getItem: jest.fn(async (k: string) => store[k] ?? null),
        setItem: jest.fn(async (k: string, v: string) => {
          store[k] = v;
        }),
        removeItem: jest.fn(async (k: string) => {
          delete store[k];
        }),
      },
    }));
    jest.doMock('../src/services/authService', () => ({
      authService: {
        isAuthenticated: () => true,
        getAuthHeaders: () => ({ 'Content-Type': 'application/json', Authorization: 'Token test' }),
        init: jest.fn(async () => {}),
        logout: jest.fn(async () => {}),
      },
    }));

    const { backendService } = require('../src/services/backendService');
    const localId = 1700000001234;
    store['@kidszone_child_profiles'] = JSON.stringify([
      {
        id: localId,
        nickname: 'Aarav',
        age_group: '6-8',
        avatar: 'avatar_3d_boy',
      },
    ]);
    store['@kidszone_profile_outbox'] = JSON.stringify([
      {
        kind: 'create',
        localId,
        body: { nickname: 'Aarav', age_group: '6-8', avatar: 'avatar_3d_boy' },
      },
    ]);

    const progress = {
      completedLessons: [],
      quizScores: {},
      totalStars: 5,
      streak: 1,
      coins: 20,
      coinsSpentTotal: 0,
      gameStats: { 'math-quiz': { highScore: 80, timesPlayed: 2 } },
    };

    const res = await backendService.syncAllProgressWithCloud(progress, false, localId);
    expect(res?.child_profile_id).toBe(777);
    expect(syncCalls).toHaveLength(1);
    expect(syncCalls[0].body.child_profile_id).toBe(777);
    expect(syncCalls[0].body.game_stats).toEqual({ 'math-quiz': { highScore: 80, timesPlayed: 2 } });
  });

  it('refreshProfilesFromCloud clears cache on empty list and logs out on 401', async () => {
    const store: Record<string, string> = {
      '@kidszone_child_profiles': JSON.stringify([{ id: 1, nickname: 'Old', age_group: '4-6', avatar: 'avatar_3d_boy' }]),
    };
    let status = 200;
    const logoutMock = jest.fn(async () => {});

    global.fetch = jest.fn(async () => ({
      ok: status === 200,
      status,
      json: async () => [],
    })) as unknown as typeof fetch;

    jest.doMock('@react-native-async-storage/async-storage', () => ({
      __esModule: true,
      default: {
        getItem: jest.fn(async (k: string) => store[k] ?? null),
        setItem: jest.fn(async (k: string, v: string) => {
          store[k] = v;
        }),
        removeItem: jest.fn(async (k: string) => {
          delete store[k];
        }),
      },
    }));
    jest.doMock('../src/services/authService', () => ({
      authService: {
        isAuthenticated: () => true,
        getAuthHeaders: () => ({ 'Content-Type': 'application/json', Authorization: 'Token expired' }),
        init: jest.fn(async () => {}),
        logout: logoutMock,
      },
    }));

    const { backendService } = require('../src/services/backendService');
    const emptyList = await backendService.refreshProfilesFromCloud();
    expect(emptyList).toEqual([]);
    expect(JSON.parse(store['@kidszone_child_profiles'])).toEqual([]);

    status = 401;
    await backendService.refreshProfilesFromCloud();
    expect(logoutMock).toHaveBeenCalledTimes(1);
  });

  it('apiService sends public catalog GETs without Authorization and logs out + retries on 401 submit', async () => {
    const store: Record<string, string> = {};
    const requestHeaders: Array<Record<string, string>> = [];
    const logoutMock = jest.fn(async () => {
      authed = false;
    });
    let authed = true;

    global.fetch = jest.fn(async (url: string, init: RequestInit = {}) => {
      const hdrs = (init.headers || {}) as Record<string, string>;
      requestHeaders.push(hdrs);
      if (url.endsWith('/lessons/categories/')) {
        return { ok: true, status: 200, json: async () => [{ id: 1, slug: 'abc', name_en: 'ABC' }] } as Response;
      }
      if (url.endsWith('/questions/submit/')) {
        if (hdrs.Authorization) {
          return { ok: false, status: 401, json: async () => ({ detail: 'Invalid token' }) } as Response;
        }
        return { ok: true, status: 200, json: async () => ({ correct: true }) } as Response;
      }
      if (url.endsWith('/sync/')) {
        return { ok: false, status: 401, json: async () => ({ detail: 'Invalid token' }) } as Response;
      }
      return { ok: true, status: 200, json: async () => ({}) } as Response;
    }) as unknown as typeof fetch;

    jest.doMock('@react-native-async-storage/async-storage', () => ({
      __esModule: true,
      default: {
        getItem: jest.fn(async (k: string) => store[k] ?? null),
        setItem: jest.fn(async (k: string, v: string) => {
          store[k] = v;
        }),
        removeItem: jest.fn(async (k: string) => {
          delete store[k];
        }),
      },
    }));
    jest.doMock('../src/services/authService', () => ({
      authService: {
        isAuthenticated: () => authed,
        getAuthHeaders: () =>
          authed
            ? { 'Content-Type': 'application/json', Authorization: 'Token stale-tok' }
            : { 'Content-Type': 'application/json' },
        init: jest.fn(async () => {}),
        logout: logoutMock,
      },
    }));

    const { apiService } = require('../src/services/apiService');
    await apiService.fetchCategories();
    expect(requestHeaders[0].Authorization).toBeUndefined();

    const submitRes = await apiService.submitQuestionAnswer(12, 'A');
    expect(submitRes).toEqual({ correct: true });
    expect(logoutMock).toHaveBeenCalledTimes(1);
    expect(requestHeaders[2].Authorization).toBeUndefined();

    authed = true;
    const syncRes = await apiService.syncCloudState({ child_profile_id: 1 });
    expect(syncRes).toBeNull();
    expect(logoutMock).toHaveBeenCalledTimes(2);
  });

  it('authService.logout notifies sessionService to clear currentSession', async () => {
    jest.dontMock('../src/services/authService');
    const store: Record<string, string> = {};
    jest.doMock('@react-native-async-storage/async-storage', () => ({
      __esModule: true,
      default: {
        getItem: jest.fn(async (k: string) => store[k] ?? null),
        setItem: jest.fn(async (k: string, v: string) => {
          store[k] = v;
        }),
        removeItem: jest.fn(async (k: string) => {
          delete store[k];
        }),
      },
    }));

    const { authService } = require('../src/services/authService');
    const { sessionService } = require('../src/services/sessionService');

    await sessionService.startSession('tok-123', { id: 1, username: 'p', email: 'p@x.com' });
    expect(sessionService.getCurrentSession()).not.toBeNull();

    await authService.logout();
    expect(sessionService.getCurrentSession()).toBeNull();
  });
});

