import { AppLanguage } from '../types';

/**
 * Universal auth error translator.
 * Maps error messages or error keys to localized Gujarati, Hindi, and English strings.
 * Automatically translates dynamically whenever the language toggle is switched.
 */
export function localizeAuthError(
  rawError: string | null | undefined,
  language: AppLanguage
): string {
  if (!rawError || !rawError.trim()) return '';

  const err = rawError.trim();
  const lower = err.toLowerCase();

  // 1. Network / Server connection errors
  if (
    lower.includes('network') ||
    lower.includes('connect') ||
    lower.includes('server') ||
    lower.includes('failed to fetch') ||
    lower.includes('networkrequestfailed')
  ) {
    if (language === 'gu') {
      return 'સર્વર સાથે કનેક્ટ થઈ શકતું નથી. કૃપા કરીને તમારું ઇન્ટરનેટ કનેક્શન અથવા સર્વર તપાસો.';
    }
    if (language === 'hi') {
      return 'सर्वर से कनेक्ट करने में असमर्थ। कृपया अपना इंटरनेट कनेक्शन या सर्वर जांचें।';
    }
    return 'Unable to connect to the server. Please check your network connection or server.';
  }

  // 2. Timeout errors
  if (lower.includes('time') || lower.includes('timeout') || lower.includes('timed out')) {
    if (language === 'gu') {
      return 'કનેક્શન સમય સમાપ્ત થયો. કૃપા કરીને ફરી પ્રયાસ કરો.';
    }
    if (language === 'hi') {
      return 'कनेक्शन टाइम आउट हो गया। कृपया पुन: प्रयास करें।';
    }
    return 'Connection timed out. Please check your connection and try again.';
  }

  // 3. Invalid credentials
  if (
    lower.includes('invalid') ||
    lower.includes('credentials') ||
    lower.includes('credential') ||
    lower.includes('wrong password') ||
    lower.includes('incorrect') ||
    lower.includes('user not found')
  ) {
    if (language === 'gu') {
      return 'અમાન્ય વપરાશકર્તા નામ અથવા પાસવર્ડ. કૃપા કરીને સાચી વિગત દાખલ કરો.';
    }
    if (language === 'hi') {
      return 'अमान्य उपयोगकर्ता नाम या पासवर्ड। कृपया सही विवरण दर्ज करें।';
    }
    return 'Invalid username/email or password. Please check your credentials.';
  }

  // 4. Empty / missing required fields
  if (lower.includes('both') || lower.includes('required') || lower.includes('fill in all')) {
    if (language === 'gu') {
      return 'કૃપા કરીને બધી જરૂરી વિગતો ભરો.';
    }
    if (language === 'hi') {
      return 'कृपया सभी आवश्यक फ़ील्ड भरें।';
    }
    return 'Please fill in all required fields.';
  }

  // 5. Password mismatch
  if (lower.includes('match') || lower.includes('confirm')) {
    if (language === 'gu') {
      return 'બંને પાસવર્ડ મેળ ખાતા નથી. કૃપા કરીને ફરીથી ચકાસો.';
    }
    if (language === 'hi') {
      return 'दोनों पासवर्ड मेल नहीं खाते। कृपया दोबारा जांचें।';
    }
    return 'Passwords do not match. Please re-enter.';
  }

  // 6. Password too short
  if (lower.includes('at least 6') || lower.includes('short') || lower.includes('characters')) {
    if (language === 'gu') {
      return 'પાસવર્ડ ઓછામાં ઓછો ૬ અક્ષરનો હોવો જોઈએ.';
    }
    if (language === 'hi') {
      return 'पासवर्ड कम से कम ६ अक्षरों का होना चाहिए।';
    }
    return 'Password must be at least 6 characters.';
  }

  // 7. Username already exists
  if (lower.includes('username') && (lower.includes('exist') || lower.includes('taken') || lower.includes('already'))) {
    if (language === 'gu') {
      return 'આ વપરાશકર્તા નામ પહેલેથી વપરાયેલું છે. કૃપા કરીને બીજું નામ પસંદ કરો.';
    }
    if (language === 'hi') {
      return 'यह उपयोगकर्ता नाम पहले से मौजूद है। कृपया दूसरा चुनें।';
    }
    return 'A user with that username already exists. Please choose another.';
  }

  // 8. Email already exists
  if (lower.includes('email') && (lower.includes('exist') || lower.includes('already') || lower.includes('registered'))) {
    if (language === 'gu') {
      return 'આ ઇમેઇલ સરનામું પહેલેથી નોંધાયેલું છે. કૃપા કરીને લૉગિન કરો.';
    }
    if (language === 'hi') {
      return 'यह ईमेल पता पहले से पंजीकृत है। कृपया लॉगिन करें।';
    }
    return 'This email address is already registered. Please sign in instead.';
  }

  // 9. Registration failed
  if (lower.includes('register') || lower.includes('registration')) {
    if (language === 'gu') {
      return 'નોંધણી થઈ શકી નથી. કૃપા કરીને તમારી વિગતો અને કનેક્શન તપાસો.';
    }
    if (language === 'hi') {
      return 'पंजीकरण नहीं हो सका। कृपया अपना विवरण और कनेक्शन जांचें।';
    }
    return 'Registration failed. Please check your connection and inputs.';
  }

  // Fallback
  if (language === 'gu') {
    return 'કંઈક ખોટું થયું. કૃપા કરીને ફરી પ્રયાસ કરો.';
  }
  if (language === 'hi') {
    return 'कुछ गलत हो गया। कृपया पुन: प्रयास करें।';
  }
  return err;
}

