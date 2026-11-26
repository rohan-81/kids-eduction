/**
 * Audit P1-1 / P1-2 / P1-3 / P0-2 regressions for backendService:
 * offline profile edits are queued and replayed, refreshes merge instead of overwrite,
 * resets are retried until acknowledged, and guests never talk to the server.
 */
describe('backendService offline outbox', () => {
  const store: Record<string, string> = {};
  let authed = true;
  let online = true;
  let nextServerId = 500;
  let serverProfiles: any[] = [];
  const calls: { method: string; url: string; body?: any }[] = [];
  const originalFetch = global.fetch;

  const json = (status: number, data: any) => ({ ok: status >= 200 && status < 300, status, json: async () => data });

  const fakeFetch = jest.fn(async (url: string, init: any = {}) => {
    const method = (init.method || 'GET').toUpperCase();
    const body = init.body ? JSON.parse(init.body) : undefined;
    calls.push({ method, url, body });
    if (!online) throw new TypeError('Network request failed');
    const idMatch = url.match(/\/profiles\/(\d+)\/$/);
    if (url.endsWith('/profiles/') && method === 'GET') return json(200, serverProfiles);
    if (url.endsWith('/profiles/') && method === 'POST') {
      const created = { id: nextServerId++, ...body };
      serverProfiles.push(created);
      return json(201, created);
    }
    if (idMatch && method === 'PATCH') {
      const p = serverProfiles.find((s) => s.id === Number(idMatch[1]));
      if (!p) return json(404, {});
      Object.assign(p, body);
      return json(200, p);
    }
    if (idMatch && method === 'DELETE') {
      const before = serverProfiles.length;
      serverProfiles = serverProfiles.filter((s) => s.id !== Number(idMatch[1]));
      return { ok: before !== serverProfiles.length, status: before !== serverProfiles.length ? 204 : 404, json: async () => null };
    }
    if (url.endsWith('/sync/')) return json(200, { status: 'synchronized', is_reset: body?.is_reset });
    return json(201, {});
  });

  const load = () => {
    jest.resetModules();
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
        getAuthHeaders: () => ({ 'Content-Type': 'application/json' }),
        init: async () => {},
      },
    }));
    return require('../src/services/backendService').backendService;
  };

  const outbox = () => JSON.parse(store['@kidszone_profile_outbox'] || '[]');
  const localProfiles = () => JSON.parse(store['@kidszone_child_profiles'] || '[]');

  beforeEach(() => {
    Object.keys(store).forEach((k) => delete store[k]);
    calls.length = 0;
    authed = true;
    online = true;
    nextServerId = 500;
    serverProfiles = [{ id: 7, nickname: 'Asha', age_group: '4-6', avatar: 'avatar_3d_girl' }];
    store['@kidszone_child_profiles'] = JSON.stringify(serverProfiles.map((p) => ({ ...p })));
    (global as any).fetch = fakeFetch;
  });
  afterEach(() => {
    (global as any).fetch = originalFetch;
    jest.dontMock('@react-native-async-storage/async-storage');
    jest.dontMock('../src/services/authService');
  });

  test('a profile created offline survives the next refresh and is uploaded with its server id', async () => {
    const svc = load();
    online = false;
    const created = await svc.createProfile('Ravi', '2-4', 'avatar_3d_boy');
    expect(created.pendingSync).toBe(true);
    expect(outbox()).toEqual([expect.objectContaining({ kind: 'create', localId: created.id })]);

    online = true;
    const refreshed = await svc.getProfiles(); // cache-first
    expect(refreshed.map((p: any) => p.nickname)).toContain('Ravi');
    await svc.flushOutbox();
    await new Promise((r) => setTimeout(r, 0));

    expect(outbox()).toEqual([]);
    const ravi = localProfiles().find((p: any) => p.nickname === 'Ravi');
    expect(ravi.id).toBe(500); // remapped to the server id
    expect(serverProfiles.map((p) => p.nickname)).toEqual(['Asha', 'Ravi']);
    expect(store['@kidszone_active_profile_id']).toBe('500');
  });

  test('an offline rename is not reverted by a refresh and is replayed when online', async () => {
    const svc = load();
    online = false;
    await svc.updateProfileNickname(7, 'Asha Star');
    expect(outbox()).toEqual([{ kind: 'patch', id: 7, body: { nickname: 'Asha Star' } }]);
    expect(localProfiles()[0].nickname).toBe('Asha Star');

    online = true;
    await svc.getProfiles();
    await new Promise((r) => setTimeout(r, 0));
    await svc.flushOutbox();
    expect(serverProfiles[0].nickname).toBe('Asha Star');
    expect(localProfiles()[0].nickname).toBe('Asha Star');
    expect(outbox()).toEqual([]);
  });

  test('a refresh that runs while the edit is still queued keeps the local value', async () => {
    const svc = load();
    online = false;
    await svc.updateProfileNickname(7, 'Offline Name');
    // Server is reachable for GET but PATCH keeps failing with 503.
    online = true;
    (global as any).fetch = jest.fn(async (url: string, init: any = {}) =>
      (init.method || 'GET') === 'GET' ? json(200, serverProfiles) : json(503, {})
    );
    await svc.getProfiles();
    await new Promise((r) => setTimeout(r, 0));
    expect(localProfiles()[0].nickname).toBe('Offline Name');
    expect(outbox()).toHaveLength(1);
  });

  test('an offline delete is not resurrected and reaches the server later', async () => {
    const svc = load();
    online = false;
    await svc.deleteProfile(7);
    expect(localProfiles()).toEqual([]);
    expect(outbox()).toEqual([{ kind: 'delete', id: 7 }]);

    online = true;
    await svc.flushOutbox();
    expect(serverProfiles).toEqual([]);
    expect(outbox()).toEqual([]);
    expect(calls.some((c) => c.method === 'DELETE')).toBe(true);
    // Never relies on the spoofable header any more.
    expect(JSON.stringify(fakeFetch.mock.calls)).not.toContain('X-Parent-Verified');
  });

  test('deleting a profile that only exists locally never calls the server', async () => {
    const svc = load();
    online = false;
    const created = await svc.createProfile('Temp', '2-4');
    await svc.updateProfileNickname(created.id, 'Temp 2'); // folded into the create op
    expect(outbox()).toEqual([expect.objectContaining({ kind: 'create', body: expect.objectContaining({ nickname: 'Temp 2' }) })]);
    await svc.deleteProfile(created.id);
    expect(outbox()).toEqual([]);
    online = true;
    calls.length = 0;
    await svc.flushOutbox();
    expect(calls).toEqual([]);
  });

  test('a 4xx rejection is dropped instead of blocking the queue forever', async () => {
    const svc = load();
    store['@kidszone_profile_outbox'] = JSON.stringify([
      { kind: 'patch', id: 7, body: { nickname: '' } },
      { kind: 'patch', id: 7, body: { age_group: '6-8' } },
    ]);
    let n = 0;
    (global as any).fetch = jest.fn(async () => (n++ === 0 ? json(400, {}) : json(200, {})));
    await svc.flushOutbox();
    expect(outbox()).toEqual([]);
  });

  test('requests time out after 5 seconds instead of hanging', async () => {
    jest.useFakeTimers();
    try {
      const svc = load();
      (global as any).fetch = jest.fn(
        (_url: string, init: any) =>
          new Promise((_res, rej) => init.signal.addEventListener('abort', () => rej(new Error('aborted'))))
      );
      const p = svc.updateProfileNickname(7, 'Slow');
      await jest.advanceTimersByTimeAsync(5001);
      await p;
      expect(outbox()).toEqual([{ kind: 'patch', id: 7, body: { nickname: 'Slow' } }]);
    } finally {
      jest.useRealTimers();
    }
  });

  test('an offline reset is re-sent with is_reset=true until the server acknowledges it', async () => {
    const svc = load();
    online = false;
    expect(await svc.syncAllProgressWithCloud({ coins: 50, completedLessons: [] }, true, 7)).toBeNull();
    expect(store['@kidszone_pending_reset_7']).toBeDefined();

    online = true;
    const state = await svc.syncAllProgressWithCloud({ coins: 60, completedLessons: ['a'] }, false, 7);
    expect(state.is_reset).toBe(true);
    const syncBody = calls.filter((c) => c.url.endsWith('/sync/')).pop()!.body;
    expect(syncBody.is_reset).toBe(true);
    expect(store['@kidszone_pending_reset_7']).toBeUndefined();

    await svc.syncAllProgressWithCloud({ coins: 60, completedLessons: ['a'] }, false, 7);
    expect(calls.filter((c) => c.url.endsWith('/sync/')).pop()!.body.is_reset).toBe(false);
  });

  test('guests never send profiles or progress to the server', async () => {
    authed = false;
    const svc = load();
    await svc.createProfile('Guest Kid', '2-4');
    await svc.updateProfileNickname(1, 'Guest Kid 2');
    await svc.syncLessonProgress('gu-ka');
    await svc.syncGameResult('counting', 3, 5);
    expect(await svc.syncAllProgressWithCloud({ coins: 1 }, true)).toBeNull();
    expect(fakeFetch).not.toHaveBeenCalled();
    expect(store['@kidszone_profile_outbox']).toBeUndefined();
  });

  test('progress for a not-yet-created profile is held back instead of hitting another child', async () => {
    const svc = load();
    online = false;
    const created = await svc.createProfile('New', '4-6');
    online = true;
    // Make profile creation keep failing so the profile stays local-only.
    (global as any).fetch = jest.fn(async (url: string, init: any = {}) => {
      calls.push({ method: init.method || 'GET', url });
      return (init.method || 'GET') === 'POST' && url.endsWith('/profiles/') ? json(503, {}) : json(200, {});
    });
    calls.length = 0;
    expect(await svc.syncAllProgressWithCloud({ coins: 5 }, false, created.id)).toBeNull();
    expect(calls.some((c) => c.url.endsWith('/sync/'))).toBe(false);
  });
});
