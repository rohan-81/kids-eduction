import {
  detectContentLanguage,
  normalizeSpeechText,
  gujaratiToDevanagari,
  GUJARATI_DIGIT_WORDS,
  HINDI_DIGIT_WORDS,
  selectBestFemaleVoice,
  selectBestVoice,
  getCalibratedPitch,
  audioService,
} from '../src/services/audioService';

describe('Multilingual Audio & Pronunciation Service Tests', () => {
  describe('1. detectContentLanguage', () => {
    test('Correctly identifies Gujarati script', () => {
      expect(detectContentLanguage('ક')).toBe('gu');
      expect(detectContentLanguage('સિંહ')).toBe('gu');
      expect(detectContentLanguage('શાબાશ, ખૂબ સરસ!')).toBe('gu');
      expect(detectContentLanguage('૧ ૨ ૩')).toBe('gu');
    });

    test('Correctly identifies Devanagari / Hindi script', () => {
      expect(detectContentLanguage('क')).toBe('hi');
      expect(detectContentLanguage('शेर')).toBe('hi');
      expect(detectContentLanguage('बहुत बढ़िया!')).toBe('hi');
      expect(detectContentLanguage('१ २ ३')).toBe('hi');
    });

    test('Correctly identifies Latin / English script', () => {
      expect(detectContentLanguage('A')).toBe('en');
      expect(detectContentLanguage('Apple')).toBe('en');
      expect(detectContentLanguage('Well done, superstar!')).toBe('en');
      expect(detectContentLanguage('1 2 3')).toBe('en');
    });

    test('Falls back to preferred language when script is ambiguous', () => {
      expect(detectContentLanguage('', 'gu')).toBe('gu');
      expect(detectContentLanguage('!?', 'hi')).toBe('hi');
    });

    test('Strictly honors user preferred language when compound/multilingual text contains matching script', () => {
      expect(detectContentLanguage('Apple • સફરજન • सेब', 'hi')).toBe('hi');
      expect(detectContentLanguage('Apple • સફરજન • सेब', 'en')).toBe('en');
      expect(detectContentLanguage('Apple • સફરજન • सेब', 'gu')).toBe('gu');
      expect(detectContentLanguage('Cat • બિલાડી', 'en')).toBe('en');
      expect(detectContentLanguage('Cat • બિલાડી', 'gu')).toBe('gu');
    });
  });

  describe('2. normalizeSpeechText', () => {
    test('Replaces multi-dot ellipsis with natural pauses (commas) without "dot dot dot"', () => {
      const normalized = normalizeSpeechText('Ready... Set... Go!', 'en');
      expect(normalized).toBe('Ready, Set, Go!');
    });

    test('Strips phonetic slashes for alphabet sounds', () => {
      expect(normalizeSpeechText('/k/', 'en')).toBe('k');
      expect(normalizeSpeechText('/b/', 'en')).toBe('b');
    });

    test('Removes parenthetical English annotations from Gujarati text', () => {
      const normalized = normalizeSpeechText('સિંહ (Lion)', 'gu');
      expect(normalized).toBe('સિંહ');
    });

    test('Removes parenthetical English annotations from Hindi text', () => {
      const normalized = normalizeSpeechText('शेर (Lion)', 'hi');
      expect(normalized).toBe('शेर');
    });

    test('Converts Gujarati digits to authentic spoken words', () => {
      expect(normalizeSpeechText('૧', 'gu')).toBe(GUJARATI_DIGIT_WORDS['૧']);
      expect(normalizeSpeechText('5', 'gu')).toBe(GUJARATI_DIGIT_WORDS['5']);
      expect(normalizeSpeechText('૧, ૨, ૩', 'gu')).toBe('એક, બે, ત્રણ');
      expect(normalizeSpeechText('વર્ગ ૧-૨', 'gu')).toBe('વર્ગ એક-બે');
      expect(normalizeSpeechText('લેવલ ૫!', 'gu')).toBe('લેવલ પાંચ!');
    });

    test('Converts Hindi digits to authentic spoken words', () => {
      expect(normalizeSpeechText('१', 'hi')).toBe(HINDI_DIGIT_WORDS['१']);
      expect(normalizeSpeechText('5', 'hi')).toBe(HINDI_DIGIT_WORDS['5']);
      expect(normalizeSpeechText('१, २, ३', 'hi')).toBe('एक, दो, तीन');
      expect(normalizeSpeechText('कक्षा १-२', 'hi')).toBe('कक्षा एक-दो');
      expect(normalizeSpeechText('लेवल ५!', 'hi')).toBe('लेवल पांच!');
    });

    test('Preserves full multi-word sentences ending in genitive particles without truncating', () => {
      expect(normalizeSpeechText('ગુજરાત રાજ્યના લોકો', 'gu')).toBe('ગુજરાત રાજ્યના લોકો');
      expect(normalizeSpeechText('ભારત દેશના બાળકો', 'gu')).toBe('ભારત દેશના બાળકો');
      expect(normalizeSpeechText('भारत की राजधानी', 'hi')).toBe('भारत की राजधानी');
      expect(normalizeSpeechText('जंगल का राजा', 'hi')).toBe('जंगल का राजा');
    });

    test('Preserves authentic traditional alphabet letter prompts (e.g. ક કમળ નો ક / अ अनार का अ)', () => {
      expect(normalizeSpeechText('ક ... કમળ નો ક', 'gu')).toBe('ક, કમળ નો ક');
      expect(normalizeSpeechText('એ ... એરણ નો એ', 'gu')).toBe('એ, એરણ નો એ');
      expect(normalizeSpeechText('અ ... અનાનસ નો અ', 'gu')).toBe('અ, અનાનસ નો અ');
      expect(normalizeSpeechText('अ ... अनार का अ', 'hi')).toBe('अ, अनार का अ');
    });

    test('Normalizes English loanword પેટર્ન to open vowel પૅટર્ન in Gujarati', () => {
      expect(normalizeSpeechText('રંગ પેટર્ન', 'gu')).toBe('રંગ પૅટર્ન');
    });

    test('Phonetically normalizes ગણપતિ to prevent clipped Ganpat pronunciation in TTS', () => {
      expect(normalizeSpeechText('ગ ... ગણપતિ નો ગ', 'gu')).toBe('ગ, ગણપતી નો ગ');
      expect(normalizeSpeechText('ગણપતિ દાદા', 'gu')).toBe('ગણપતી દાદા');
    });

    test('Phonetically normalizes યજ્ઞ and જ્ઞ to authentic Gujarati Gna pronunciation', () => {
      expect(normalizeSpeechText('ય ... યજ્ઞ નો ય', 'gu')).toBe('ય, યગ્ન નો ય');
      expect(normalizeSpeechText('જ્ઞ ... જ્ઞાની નો જ્ઞ', 'gu')).toBe('ગ્ન, ગ્નાની નો ગ્ન');
    });

    test('Strips emojis, pictographs and symbols so TTS never reads out redundant emoji names', () => {
      expect(normalizeSpeechText('शाबाश! सेब 🍎 बिल्कुल सही जवाब है!', 'hi')).toBe('शाबाश! सेब बिल्कुल सही जवाब है!');
      expect(normalizeSpeechText('शाबाश! बंदर 🐵 बिल्कुल सही जवाब है!', 'hi')).toBe('शाबाश! बंदर बिल्कुल सही जवाब है!');
      expect(normalizeSpeechText('શાબાश! સફરજન 🍎 એકદમ સાચો જવાબ છે!', 'gu')).toBe('શાબાश! સફરજન એકદમ સાચો જવાબ છે!');
      expect(normalizeSpeechText('Super! Apple 🍎 That is right! 🌟 🎉', 'en')).toBe('Super! Apple That is right!');
    });

    test('Converts math expressions (+, -, ×, ÷, =) and 0-100 numbers into spoken words cleanly', () => {
      expect(normalizeSpeechText('૧૦ - ૪ બરાબર કેટલા થાય?', 'gu')).toBe('દસ ઓછા ચાર બરાબર કેટલા થાય?');
      expect(normalizeSpeechText('૨૦ - ૫ બરાબર કેટલા થાય?', 'gu')).toBe('વીસ ઓછા પાંચ બરાબર કેટલા થાય?');
      expect(normalizeSpeechText('૫ + ૫ બરાબર કેટલા થાય?', 'gu')).toBe('પાંચ વત્તા પાંચ બરાબર કેટલા થાય?');
      expect(normalizeSpeechText('અંક "૧૯" પછી કયો અંક આવે?', 'gu')).toBe('અંક "ઓગણીસ" પછી કયો અંક આવે?');
      expect(normalizeSpeechText('१० - ४ बराबर कितना होता है?', 'hi')).toBe('दस घटा चार बराबर कितना होता है?');
      expect(normalizeSpeechText('What is 10 - 4?', 'en')).toBe('What is 10 minus 4?');
      // Hyphenated letter/range tokens without spaces stay untouched
      expect(normalizeSpeechText('અંગ્રેજી એબીસીડી (A-Z) નો છેલ્લો અક્ષર કયો છે?', 'gu')).toBe(
        'અંગ્રેજી એબીસીડી નો છેલ્લો અક્ષર કયો છે?'
      );
    });
  });

  describe('3. gujaratiToDevanagari Transliteration Fallback', () => {
    test('Transliterates Gujarati vowels to Devanagari accurately', () => {
      expect(gujaratiToDevanagari('અ')).toBe('अ');
      expect(gujaratiToDevanagari('આ')).toBe('आ');
      expect(gujaratiToDevanagari('ઇ')).toBe('इ');
      expect(gujaratiToDevanagari('ઈ')).toBe('ई');
      expect(gujaratiToDevanagari('ઉ')).toBe('उ');
      expect(gujaratiToDevanagari('ઊ')).toBe('ऊ');
    });

    test('Transliterates Gujarati consonants to Devanagari accurately', () => {
      expect(gujaratiToDevanagari('ક')).toBe('क');
      expect(gujaratiToDevanagari('ખ')).toBe('ख');
      expect(gujaratiToDevanagari('ગ')).toBe('ग');
      expect(gujaratiToDevanagari('ઘ')).toBe('घ');
    });

    test('Handles Gujarati-specific phonetic adjustments (જ્ઞ -> ગ્ન, ળ -> ल, પેટર્ન -> पैटर्न)', () => {
      expect(gujaratiToDevanagari('જ્ઞ')).toBe('ग्न');
      expect(gujaratiToDevanagari('ફળ')).toBe('फल');
      expect(gujaratiToDevanagari('રંગ પેટર્ન')).toContain('पैटर्न');
    });

    test('Transliterates full words and sentences correctly', () => {
      expect(gujaratiToDevanagari('સિંહ')).toBe('सिंह');
      expect(gujaratiToDevanagari('કમળ')).toBe('कमल');
    });
  });

  describe('4. audioService.getLanguageLocale', () => {
    test('Maps app languages to official BCP-47 locales', () => {
      expect(audioService.getLanguageLocale('en')).toBe('en-US');
      expect(audioService.getLanguageLocale('gu')).toBe('gu-IN');
      expect(audioService.getLanguageLocale('hi')).toBe('hi-IN');
    });
  });

  describe('5. audioService.speak execution', () => {
    test('Calls Speech.speak for Gujarati content without self-cancelling', async () => {
      const Speech = require('expo-speech');
      Speech.speak.mockClear();

      await audioService.speak('અનાનસ', 'gu');
      expect(Speech.speak).toHaveBeenCalledTimes(1);
      const call = Speech.speak.mock.calls[0];
      expect(call[0]).toBeDefined();
      expect(call[1].language).toMatch(/gu-IN|hi-IN/);
    });

    test('Does not call Speech.speak when enabled is false (user muted)', async () => {
      const Speech = require('expo-speech');
      Speech.speak.mockClear();

      await audioService.speak('Apple', 'en', false);
      expect(Speech.speak).not.toHaveBeenCalled();
    });
  });

  describe('6. soundEffects master toggle and mute controls', () => {
    test('Respects soundEnabled toggle and halts audio playback', async () => {
      const { soundEffects } = require('../src/services/soundEffects');

      soundEffects.setSoundEnabled(false);
      expect(soundEffects.isSoundEnabled()).toBe(false);

      const animalResult = await soundEffects.playAnimalSound('lion');
      expect(animalResult).toBe(false);

      // Re-enabling sound
      soundEffects.setSoundEnabled(true);
      expect(soundEffects.isSoundEnabled()).toBe(true);
    });
  });

  describe('7. audioService pre-buffering and multi-language celebration praise', () => {
    test('prewarmEngine executes without throwing', () => {
      expect(() => audioService.prewarmEngine()).not.toThrow();
    });

    test('preloadSpeech normalizes upcoming text in advance', () => {
      expect(() => audioService.preloadSpeech('સફરજન', 'gu')).not.toThrow();
      expect(() => audioService.preloadSpeech('आम', 'hi')).not.toThrow();
      expect(() => audioService.preloadSpeech('Butterfly', 'en')).not.toThrow();
    });

    test('speakCelebration speaks joyful phrases in Gujarati, Hindi, and English', async () => {
      const Speech = require('expo-speech');
      Speech.speak.mockClear();

      await audioService.speakCelebration('gu');
      expect(Speech.speak).toHaveBeenCalled();

      Speech.speak.mockClear();
      await audioService.speakCelebration('hi');
      expect(Speech.speak).toHaveBeenCalled();

      Speech.speak.mockClear();
      await audioService.speakCelebration('en');
      expect(Speech.speak).toHaveBeenCalled();
    });
  });

  describe('8. selectBestFemaleVoice intelligent ranking', () => {
    const mockVoices = [
      { name: 'Microsoft David Desktop - English (United States)', lang: 'en-US' },
      { name: 'Microsoft Zira Desktop - English (United States)', lang: 'en-US' },
      { name: 'Microsoft Kalpana - Hindi (India)', lang: 'hi-IN' },
      { name: 'Microsoft Hemant - Hindi (India)', lang: 'hi-IN' },
      { name: 'Microsoft Swara Online (Natural) - Hindi (India)', lang: 'hi-IN' },
      { name: 'Microsoft Madhur Online (Natural) - Hindi (India)', lang: 'hi-IN' },
      { name: 'Microsoft Dhwani Online (Natural) - Gujarati (India)', lang: 'gu-IN' },
      { name: 'Microsoft Niranjan Online (Natural) - Gujarati (India)', lang: 'gu-IN' },
      { name: 'Google हिन्दी', lang: 'hi-IN' },
      { name: 'Google US English', lang: 'en-US' },
    ];

    test('Prioritizes Microsoft Dhwani (Natural Gujarati female voice) for Gujarati', () => {
      const selected = selectBestFemaleVoice(mockVoices, 'gu');
      expect(selected?.name).toBe('Microsoft Dhwani Online (Natural) - Gujarati (India)');
    });

    test('Falls back to Microsoft Swara (Natural Hindi female voice) when no Gujarati voice installed', () => {
      const withoutDhwani = mockVoices.filter((v) => !v.name.includes('Dhwani') && !v.name.includes('Niranjan'));
      const selected = selectBestFemaleVoice(withoutDhwani, 'gu');
      expect(selected?.name).toBe('Microsoft Swara Online (Natural) - Hindi (India)');
    });

    test('Prioritizes Microsoft Swara (Natural female voice) for Hindi over Kalpana and Madhur', () => {
      const selected = selectBestFemaleVoice(mockVoices, 'hi');
      expect(selected?.name).toBe('Microsoft Swara Online (Natural) - Hindi (India)');
    });

    test('Prioritizes high quality female voice for English over male desktop voice', () => {
      const selected = selectBestFemaleVoice(mockVoices, 'en');
      expect(selected?.name).toBe('Google US English');
    });

    test('Strictly avoids Android male boy voices (-gub, -hib, -gud) when female is requested', () => {
      const androidVoices = [
        { name: 'gu-in-x-gub-local', lang: 'gu-IN' }, // Android Gujarati Male (Voice B)
        { name: 'gu-in-x-gud-local', lang: 'gu-IN' }, // Android Gujarati Male (Voice D)
        { name: 'hi-in-x-hib-local', lang: 'hi-IN' }, // Android Hindi Male (Voice B)
        { name: 'hi-in-x-hia-local', lang: 'hi-IN' }, // Android Hindi Female (Voice A)
      ];
      const selected = selectBestFemaleVoice(androidVoices, 'gu');
      expect(selected?.name).toBe('hi-in-x-hia-local');
    });

    test('Picks Android female Gujarati voice when installed on device', () => {
      const androidVoices = [
        { name: 'gu-in-x-gub-local', lang: 'gu-IN' }, // Male
        { name: 'gu-in-x-gua-local', lang: 'gu-IN' }, // Female
        { name: 'hi-in-x-hia-local', lang: 'hi-IN' },
      ];
      const selected = selectBestFemaleVoice(androidVoices, 'gu');
      expect(selected?.name).toBe('gu-in-x-gua-local');
    });
  });

  describe('9. selectBestVoice multi-gender voice selection & settings', () => {
    const mockVoices = [
      { name: 'Microsoft David Desktop - English (United States)', lang: 'en-US' },
      { name: 'Microsoft Zira Desktop - English (United States)', lang: 'en-US' },
      { name: 'Microsoft Kalpana - Hindi (India)', lang: 'hi-IN' },
      { name: 'Microsoft Hemant - Hindi (India)', lang: 'hi-IN' },
      { name: 'Microsoft Swara Online (Natural) - Hindi (India)', lang: 'hi-IN' },
      { name: 'Microsoft Madhur Online (Natural) - Hindi (India)', lang: 'hi-IN' },
      { name: 'Microsoft Dhwani Online (Natural) - Gujarati (India)', lang: 'gu-IN' },
      { name: 'Microsoft Niranjan Online (Natural) - Gujarati (India)', lang: 'gu-IN' },
      { name: 'Google हिन्दी', lang: 'hi-IN' },
      { name: 'Google US English', lang: 'en-US' },
    ];

    test('Prioritizes Microsoft Niranjan (Natural Gujarati male voice) when male voice requested for Gujarati', () => {
      const selected = selectBestVoice(mockVoices, 'gu', 'male');
      expect(selected?.name).toBe('Microsoft Niranjan Online (Natural) - Gujarati (India)');
    });

    test('Falls back to Microsoft Madhur (Natural Hindi male voice) when no Gujarati voice installed and male requested', () => {
      const withoutGujarati = mockVoices.filter((v) => !v.lang.startsWith('gu'));
      const selected = selectBestVoice(withoutGujarati, 'gu', 'male');
      expect(selected?.name).toBe('Microsoft Madhur Online (Natural) - Hindi (India)');
    });

    test('Ensures Indian voice like Google Hindi is chosen over English voices even when male is requested', () => {
      const onlyChromeVoices = [
        { name: 'Microsoft David Desktop - English (United States)', lang: 'en-US' },
        { name: 'Microsoft Zira Desktop - English (United States)', lang: 'en-US' },
        { name: 'Google US English', lang: 'en-US' },
        { name: 'Google हिन्दी', lang: 'hi-IN' },
      ];
      const selected = selectBestVoice(onlyChromeVoices, 'gu', 'male');
      expect(selected?.name).toBe('Google हिन्दी');
    });

    test('Allows changing and reading voice gender in audioService', async () => {
      await audioService.setVoiceGender('male');
      expect(audioService.getVoiceGender()).toBe('male');

      await audioService.setVoiceGender('female');
      expect(audioService.getVoiceGender()).toBe('female');

      await audioService.setVoiceGender('child');
      expect(audioService.getVoiceGender()).toBe('child');
    });

    test('Allows changing, reading, and clamping voice rate in audioService', async () => {
      // Default rate should be energetic (1.18)
      expect(audioService.getVoiceRate()).toBeGreaterThanOrEqual(1.0);

      await audioService.setVoiceRate(1.0);
      expect(audioService.getVoiceRate()).toBe(1.0);

      await audioService.setVoiceRate(1.18);
      expect(audioService.getVoiceRate()).toBe(1.18);

      await audioService.setVoiceRate(1.30);
      expect(audioService.getVoiceRate()).toBe(1.30);

      // Clamps within [0.8, 1.5]
      await audioService.setVoiceRate(0.2);
      expect(audioService.getVoiceRate()).toBe(0.8);

      await audioService.setVoiceRate(2.5);
      expect(audioService.getVoiceRate()).toBe(1.5);
    });

    test('Allows changing, reading, and clamping voice pitch in audioService', async () => {
      // Default pitch should be elevated / cheerful (1.20)
      expect(audioService.getVoicePitch()).toBeGreaterThanOrEqual(1.1);

      await audioService.setVoicePitch(1.0);
      expect(audioService.getVoicePitch()).toBe(1.0);

      await audioService.setVoicePitch(1.20);
      expect(audioService.getVoicePitch()).toBe(1.20);

      await audioService.setVoicePitch(1.35);
      expect(audioService.getVoicePitch()).toBe(1.35);

      // Clamps within [0.8, 1.6]
      await audioService.setVoicePitch(0.3);
      expect(audioService.getVoicePitch()).toBe(0.8);

      await audioService.setVoicePitch(2.4);
      expect(audioService.getVoicePitch()).toBe(1.6);
    });

    test('getCalibratedPitch strictly preserves natural resonance without distortion', () => {
      // Natural baseline
      expect(getCalibratedPitch('female', 1.0)).toBe(1.00);
      expect(getCalibratedPitch('male', 1.0, true)).toBe(0.95);
      expect(getCalibratedPitch('male', 1.0, false)).toBe(0.74);
      expect(getCalibratedPitch('child', 1.0)).toBe(1.05);
    });
  });
});
