import { localizeAuthError } from '../src/utils/authErrorTranslators';
import { getApiBaseUrl } from '../src/services/apiConfig';

describe('Auth Error Localization and Translation', () => {
  const networkErrorSample = 'Unable to connect to the server. Please check your network connection.';
  const invalidCredsSample = 'Invalid username/email or password.';
  const passwordMismatchSample = 'Passwords do not match.';

  test('translates network connection error correctly across all 3 languages', () => {
    const en = localizeAuthError(networkErrorSample, 'en');
    const gu = localizeAuthError(networkErrorSample, 'gu');
    const hi = localizeAuthError(networkErrorSample, 'hi');

    expect(en).toContain('connect to the server');
    expect(gu).toContain('સર્વર સાથે કનેક્ટ');
    expect(hi).toContain('सर्वर से कनेक्ट');
  });

  test('translates invalid credentials error correctly across all 3 languages', () => {
    const en = localizeAuthError(invalidCredsSample, 'en');
    const gu = localizeAuthError(invalidCredsSample, 'gu');
    const hi = localizeAuthError(invalidCredsSample, 'hi');

    expect(en).toContain('Invalid username');
    expect(gu).toContain('અમાન્ય વપરાશકર્તા');
    expect(hi).toContain('अमान्य उपयोगकर्ता');
  });

  test('translates password mismatch error correctly across all 3 languages', () => {
    const en = localizeAuthError(passwordMismatchSample, 'en');
    const gu = localizeAuthError(passwordMismatchSample, 'gu');
    const hi = localizeAuthError(passwordMismatchSample, 'hi');

    expect(en).toContain('Passwords do not match');
    expect(gu).toContain('પાસવર્ડ મેળ ખાતા નથી');
    expect(hi).toContain('पासवर्ड मेल नहीं खाते');
  });

  test('resolves api base url dynamically', () => {
    const url = getApiBaseUrl();
    expect(typeof url).toBe('string');
    expect(url.startsWith('http://')).toBe(true);
    expect(url.endsWith('/api')).toBe(true);
  });
});

