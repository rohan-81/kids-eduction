/** Audit P3: the parental-gate lockout survives an app restart (force-close cannot reset it). */
describe('parental gate lockout persistence', () => {
  const store: Record<string, string> = {};

  const freshModule = () => {
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
    return require('../src/utils/parentGate');
  };

  beforeEach(() => Object.keys(store).forEach((k) => delete store[k]));
  afterEach(() => jest.dontMock('@react-native-async-storage/async-storage'));

  test('a lockout triggered before a restart is restored afterwards', async () => {
    const now = 1_000_000;
    const gate = freshModule();
    gate.registerGateFailure(now);
    gate.registerGateFailure(now);
    expect(gate.registerGateFailure(now)).toBe(gate.GATE_LOCKOUT_MS);
    await Promise.resolve();

    const restarted = freshModule(); // simulates killing and relaunching the app
    expect(restarted.getGateLockRemainingMs(now + 1000)).toBe(0); // not yet hydrated
    expect(await restarted.loadGateLockout(now + 1000)).toBe(restarted.GATE_LOCKOUT_MS - 1000);
    expect(restarted.getGateLockRemainingMs(now + 1000)).toBe(restarted.GATE_LOCKOUT_MS - 1000);
  });

  test('the failure streak also survives a restart', async () => {
    const now = 2_000_000;
    const gate = freshModule();
    gate.registerGateFailure(now);
    gate.registerGateFailure(now);
    await Promise.resolve();

    const restarted = freshModule();
    await restarted.loadGateLockout(now);
    expect(restarted.registerGateFailure(now)).toBe(restarted.GATE_LOCKOUT_MS); // third strike locks
  });

  test('a correct answer clears the persisted lockout', async () => {
    const now = 3_000_000;
    const gate = freshModule();
    [0, 1, 2].forEach(() => gate.registerGateFailure(now));
    gate.registerGateSuccess();
    await Promise.resolve();
    const restarted = freshModule();
    expect(await restarted.loadGateLockout(now)).toBe(0);
  });

  test('an implausibly long saved lockout (clock tampering) is ignored', async () => {
    store['@kidszone_parent_gate_lockout'] = JSON.stringify({ consecutiveFailures: 0, lockedUntil: 10 ** 15 });
    const gate = freshModule();
    expect(await gate.loadGateLockout(5_000_000)).toBe(0);
  });

  test('corrupt storage does not throw', async () => {
    store['@kidszone_parent_gate_lockout'] = '{not json';
    const gate = freshModule();
    await expect(gate.loadGateLockout()).resolves.toBe(0);
  });
});
