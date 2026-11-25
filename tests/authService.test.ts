import { authService } from '../src/services/authService';
import { sessionService } from '../src/services/sessionService';

// Mock AsyncStorage
const mockStorage: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (key: string) => mockStorage[key] || null),
    setItem: jest.fn(async (key: string, value: string) => {
      mockStorage[key] = value;
    }),
    removeItem: jest.fn(async (key: string) => {
      delete mockStorage[key];
    }),
    clear: jest.fn(async () => {
      Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
    }),
  },
}));

describe('AuthService Tests', () => {
  beforeEach(async () => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
    await authService.logout();
    (global as any).fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('init loads token and user from storage', async () => {
    mockStorage['@kidszone_auth_token'] = 'test-token-123';
    mockStorage['@kidszone_auth_user'] = JSON.stringify({
      id: 5,
      username: 'parent_user',
      email: 'parent@test.com',
    });

    // Reset internal initialized state for testing
    (authService as any).initialized = false;
    const state = await authService.init();

    expect(state.token).toBe('test-token-123');
    expect(state.user?.username).toBe('parent_user');
    expect(authService.isAuthenticated()).toBe(true);
    expect(authService.getToken()).toBe('test-token-123');
  });

  test('getAuthHeaders returns Authorization header when token is set', () => {
    (authService as any).token = 'token-xyz';
    const headers = authService.getAuthHeaders();
    expect(headers['Authorization']).toBe('Token token-xyz');
    expect(headers['Content-Type']).toBe('application/json');
  });

  test('login successfully saves token and user', async () => {
    const mockUserData = {
      id: 10,
      username: 'john_doe',
      email: 'john@example.com',
      first_name: 'John Doe',
    };

    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        token: 'auth-token-456',
        user: mockUserData,
        message: 'Signed in successfully!',
      }),
    });

    const result = await authService.login({
      username: 'john_doe',
      password: 'password123',
    });

    expect(result.success).toBe(true);
    expect(result.token).toBe('auth-token-456');
    expect(result.user?.username).toBe('john_doe');
    expect(authService.getToken()).toBe('auth-token-456');
    expect(mockStorage['@kidszone_auth_token']).toBe('auth-token-456');
  });

  test('login failure returns clean error message', async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        non_field_errors: ['Invalid username/email or password.'],
      }),
    });

    const result = await authService.login({
      username: 'wrong_user',
      password: 'bad_password',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid username/email or password.');
    expect(authService.isAuthenticated()).toBe(false);
  });

  test('register successfully creates parent and saves credentials', async () => {
    const mockUserData = {
      id: 12,
      username: 'new_parent',
      email: 'parent@kidszone.test',
      first_name: 'Ravi',
      child_profiles: [{ id: 1, nickname: 'Aarav', age_group: '2-4' }],
    };

    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        token: 'new-reg-token-789',
        user: mockUserData,
        message: 'Account created successfully!',
      }),
    });

    const result = await authService.register({
      username: 'new_parent',
      password: 'password123',
      email: 'parent@kidszone.test',
      parent_name: 'Ravi',
      child_nickname: 'Aarav',
      child_age_group: '2-4',
    });

    expect(result.success).toBe(true);
    expect(result.token).toBe('new-reg-token-789');
    expect(result.user?.first_name).toBe('Ravi');
    expect(authService.getToken()).toBe('new-reg-token-789');
  });

  test('logout removes token and clears storage', async () => {
    (authService as any).token = 'token-to-delete';
    (authService as any).user = { id: 1, username: 'user' };
    mockStorage['@kidszone_auth_token'] = 'token-to-delete';
    mockStorage['@kidszone_auth_user'] = JSON.stringify({ id: 1, username: 'user' });

    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Logged out successfully.' }),
    });

    await authService.logout();

    expect(authService.getToken()).toBeNull();
    expect(authService.getUser()).toBeNull();
    expect(authService.isAuthenticated()).toBe(false);
    expect(mockStorage['@kidszone_auth_token']).toBeUndefined();
    expect(mockStorage['@kidszone_auth_user']).toBeUndefined();
    expect(mockStorage['@kidszone_auth_session']).toBeUndefined();
  });

  test('endSession terminates session and clears credentials on logout', async () => {
    mockStorage['@kidszone_auth_session'] = JSON.stringify({
      token: 'session-token-xyz',
      user: { id: 2, username: 'test_parent' },
      isActive: true,
    });
    mockStorage['@kidszone_auth_token'] = 'session-token-xyz';
    mockStorage['@kidszone_auth_user'] = JSON.stringify({ id: 2, username: 'test_parent' });

    await sessionService.endSession();

    expect(sessionService.getCurrentSession()).toBeNull();
    expect(sessionService.isSessionActive()).toBe(false);
    expect(authService.isAuthenticated()).toBe(false);
    expect(mockStorage['@kidszone_auth_session']).toBeUndefined();
    expect(mockStorage['@kidszone_auth_token']).toBeUndefined();
    expect(mockStorage['@kidszone_auth_user']).toBeUndefined();
  });
});
