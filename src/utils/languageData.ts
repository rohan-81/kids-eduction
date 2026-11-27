// Unified language, number names, and table chanting data for Gujarati, Hindi, and English

export const GUJARATI_DIGITS = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
export const HINDI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

export const toGujDigits = (num: number | string): string =>
  num
    .toString()
    .split('')
    .map((d) => (d >= '0' && d <= '9' ? GUJARATI_DIGITS[parseInt(d, 10)] : d))
    .join('');

export const toHiDigits = (num: number | string): string =>
  num
    .toString()
    .split('')
    .map((d) => (d >= '0' && d <= '9' ? HINDI_DIGITS[parseInt(d, 10)] : d))
    .join('');

export const formatNumberDigits = (num: number | string, lang?: 'gu' | 'hi' | 'en'): string => {
  const targetLang = lang || 'gu';
  if (targetLang === 'hi') return toHiDigits(num);
  if (targetLang === 'gu') return toGujDigits(num);
  return num.toString();
};

export const formatDurationMinutes = (
  totalMinutes: number,
  lang?: 'gu' | 'hi' | 'en',
  compact = false
): string => {
  const safeMins = Math.max(0, Math.round(totalMinutes));
  if (safeMins < 60) {
    if (compact) {
      const shortMin = lang === 'gu' ? ' મિ' : lang === 'hi' ? ' मि' : 'm';
      return `${formatNumberDigits(safeMins, lang)}${shortMin}`;
    }
    const minUnit = lang === 'gu' ? 'મિનિટ' : lang === 'hi' ? 'मिनट' : 'm';
    return `${formatNumberDigits(safeMins, lang)} ${minUnit}`;
  }
  const hrs = Math.floor(safeMins / 60);
  const remMins = safeMins % 60;
  if (compact) {
    if (lang === 'en') {
      return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs}h`;
    }
    const unit = lang === 'gu' ? ' ક' : ' घ';
    const hh = formatNumberDigits(hrs, lang);
    if (remMins === 0) return `${hh}${unit}`;
    const mm = formatNumberDigits(remMins < 10 ? `0${remMins}` : remMins, lang);
    return `${hh}:${mm}${unit}`;
  }
  const hrUnit = lang === 'gu' ? 'કલાક' : lang === 'hi' ? 'घंटा' : 'h';
  const minUnit = lang === 'gu' ? 'મિનિટ' : lang === 'hi' ? 'मिनट' : 'm';
  if (remMins === 0) return `${formatNumberDigits(hrs, lang)} ${hrUnit}`;
  return `${formatNumberDigits(hrs, lang)} ${hrUnit} ${formatNumberDigits(remMins, lang)} ${minUnit}`;
};

export const formatMathExpression = (expr: string, lang: 'gu' | 'hi' | 'en'): string => {
  if (!expr) return '';
  const guToEng: Record<string, string> = {
    '૦': '0', '૧': '1', '૨': '2', '૩': '3', '૪': '4',
    '૫': '5', '૬': '6', '૭': '7', '૮': '8', '૯': '9',
  };
  const hiToEng: Record<string, string> = {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
  };

  // First convert any Indic digits into regular standard 0-9 digits
  let normalized = expr
    .split('')
    .map((c) => guToEng[c] || hiToEng[c] || c)
    .join('');

  if (lang === 'en') {
    return normalized;
  }
  if (lang === 'gu') {
    return normalized
      .split('')
      .map((c) => (c >= '0' && c <= '9' ? GUJARATI_DIGITS[parseInt(c, 10)] : c))
      .join('');
  }
  if (lang === 'hi') {
    return normalized
      .split('')
      .map((c) => (c >= '0' && c <= '9' ? HINDI_DIGITS[parseInt(c, 10)] : c))
      .join('');
  }
  return normalized;
};

export const GUJARATI_NUMBERS: Record<number, string> = {
  0: 'શૂન્ય',
  1: 'એક', 2: 'બે', 3: 'ત્રણ', 4: 'ચાર', 5: 'પાંચ',
  6: 'છ', 7: 'સાત', 8: 'આઠ', 9: 'નવ', 10: 'દસ',
  11: 'અગિયાર', 12: 'બાર', 13: 'તેર', 14: 'ચૌદ', 15: 'પંદર',
  16: 'સોળ', 17: 'સત્તર', 18: 'અઢાર', 19: 'ઓગણીસ', 20: 'વીસ',
  21: 'એકવીસ', 22: 'બાવીસ', 23: 'તેવીસ', 24: 'ચોવીસ', 25: 'પચ્ચીસ',
  26: 'છવ્વીસ', 27: 'સત્તાવીસ', 28: 'અઠ્ઠાવીસ', 29: 'ઓગણત્રીસ', 30: 'ત્રીસ',
  31: 'એકત્રીસ', 32: 'બત્રીસ', 33: 'તેત્રીસ', 34: 'ચોત્રીસ', 35: 'પાંત્રીસ',
  36: 'છત્રીસ', 37: 'સાડત્રીસ', 38: 'આડત્રીસ', 39: 'ઓગણચાલીસ', 40: 'ચાલીસ',
  41: 'એકતાલીસ', 42: 'બેતાલીસ', 43: 'તેતાલીસ', 44: 'ચુંમાલીસ', 45: 'પિસ્તાલીસ',
  46: 'છેતાલીસ', 47: 'સુડતાલીસ', 48: 'અડતાલીસ', 49: 'ઓગણપચાસ', 50: 'પચાસ',
  51: 'એકાવન', 52: 'બાવન', 53: 'ત્રેપન', 54: 'ચોપન', 55: 'પંચાવન',
  56: 'છપ્પન', 57: 'સત્તાવન', 58: 'અઠ્ઠાવન', 59: 'ઓગણસાઠ', 60: 'સાઠ',
  61: 'એકસઠ', 62: 'બાસઠ', 63: 'ત્રેસઠ', 64: 'ચોસઠ', 65: 'પાંસઠ',
  66: 'છાસઠ', 67: 'સડસઠ', 68: 'અડસઠ', 69: 'ઓગણોસિત્તેર', 70: 'સિત્તેર',
  71: 'એકોતેર', 72: 'બોતેર', 73: 'તોતેર', 74: 'ચુમોતેર', 75: 'પંચોતેર',
  76: 'છોતેર', 77: 'સિત્તોતેર', 78: 'ઇઠ્ઠોતેર', 79: 'ઓગણએંસી', 80: 'એંસી',
  81: 'એક્યાસી', 82: 'બ્યાસી', 83: 'ત્યાસી', 84: 'ચોર્યાસી', 85: 'પંચાસી',
  86: 'છ્યાસી', 87: 'સિત્યાસી', 88: 'અઠ્યાસી', 89: 'નેવ્યાસી', 90: 'નેવું',
  91: 'એકાણું', 92: 'બાણું', 93: 'ત્રાણું', 94: 'ચોરાણું', 95: 'પંચાણું',
  96: 'છન્નું', 97: 'સત્તાણું', 98: 'અઠ્ઠાણું', 99: 'નવ્વાણું', 100: 'સો',
};

export const HINDI_NUMBERS: Record<number, string> = {
  0: 'शून्य',
  1: 'एक', 2: 'दो', 3: 'तीन', 4: 'चार', 5: 'पांच',
  6: 'छह', 7: 'सात', 8: 'आठ', 9: 'नौ', 10: 'दस',
  11: 'ग्यारह', 12: 'बारह', 13: 'तेरह', 14: 'चौदह', 15: 'पंद्रह',
  16: 'सोलह', 17: 'सत्रह', 18: 'अठारह', 19: 'उन्नीस', 20: 'बीस',
  21: 'इक्कीस', 22: 'बाईस', 23: 'तेईस', 24: 'चौबीस', 25: 'पच्चीस',
  26: 'छब्बीस', 27: 'सत्ताईस', 28: 'अट्ठाईस', 29: 'उनतीस', 30: 'तीस',
  31: 'इकतीस', 32: 'बत्तीस', 33: 'तैंतीस', 34: 'चौंतीस', 35: 'पैंतीस',
  36: 'छत्तीस', 37: 'सैंतीस', 38: 'अड़तीस', 39: 'उनतालीस', 40: 'चालीस',
  41: 'इकतालीस', 42: 'बयालीस', 43: 'तैंतालीस', 44: 'चवालीस', 45: 'पैंतालीस',
  46: 'छियालीस', 47: 'सैंतालीस', 48: 'अड़तालीस', 49: 'उनचास', 50: 'पचास',
  51: 'इक्यावन', 52: 'बावन', 53: 'तिरपन', 54: 'चौवन', 55: 'पचपन',
  56: 'छप्पन', 57: 'सत्तावन', 58: 'अट्ठावन', 59: 'उनसठ', 60: 'साठ',
  61: 'इकसठ', 62: 'बासठ', 63: 'तिरसठ', 64: 'चौंसठ', 65: 'पैंसठ',
  66: 'छियासठ', 67: 'सरसठ', 68: 'अड़सठ', 69: 'उनहत्तर', 70: 'सत्तर',
  71: 'इकहत्तर', 72: 'बहत्तर', 73: 'तिहत्तर', 74: 'चौहत्तर', 75: 'पचहत्तर',
  76: 'छिहत्तर', 77: 'सतहत्तर', 78: 'अठहत्तर', 79: 'उनासी', 80: 'अस्सी',
  81: 'इक्यासी', 82: 'बयासी', 83: 'तिरासी', 84: 'चौरासी', 85: 'पचासी',
  86: 'छियासी', 87: 'सत्तासी', 88: 'अट्ठासी', 89: 'नवासी', 90: 'नब्बे',
  91: 'इक्यानवे', 92: 'बानवे', 93: 'तिरानवे', 94: 'चौरानवे', 95: 'पंचानवे',
  96: 'छियानवे', 97: 'सत्तानवे', 98: 'अट्ठानवे', 99: 'निन्यानवे', 100: 'सौ',
};

export const ENGLISH_NUMBERS: Record<number, string> = {
  0: 'Zero',
  1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five',
  6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine', 10: 'Ten',
  11: 'Eleven', 12: 'Twelve', 13: 'Thirteen', 14: 'Fourteen', 15: 'Fifteen',
  16: 'Sixteen', 17: 'Seventeen', 18: 'Eighteen', 19: 'Nineteen', 20: 'Twenty',
  21: 'Twenty-One', 22: 'Twenty-Two', 23: 'Twenty-Three', 24: 'Twenty-Four', 25: 'Twenty-Five',
  26: 'Twenty-Six', 27: 'Twenty-Seven', 28: 'Twenty-Eight', 29: 'Twenty-Nine', 30: 'Thirty',
  31: 'Thirty-One', 32: 'Thirty-Two', 33: 'Thirty-Three', 34: 'Thirty-Four', 35: 'Thirty-Five',
  36: 'Thirty-Six', 37: 'Thirty-Seven', 38: 'Thirty-Eight', 39: 'Thirty-Nine', 40: 'Forty',
  41: 'Forty-One', 42: 'Forty-Two', 43: 'Forty-Three', 44: 'Forty-Four', 45: 'Forty-Five',
  46: 'Forty-Six', 47: 'Forty-Seven', 48: 'Forty-Eight', 49: 'Forty-Nine', 50: 'Fifty',
  51: 'Fifty-One', 52: 'Fifty-Two', 53: 'Fifty-Three', 54: 'Fifty-Four', 55: 'Fifty-Five',
  56: 'Fifty-Six', 57: 'Fifty-Seven', 58: 'Fifty-Eight', 59: 'Fifty-Nine', 60: 'Sixty',
  61: 'Sixty-One', 62: 'Sixty-Two', 63: 'Sixty-Three', 64: 'Sixty-Four', 65: 'Sixty-Five',
  66: 'Sixty-Six', 67: 'Sixty-Seven', 68: 'Sixty-Eight', 69: 'Sixty-Nine', 70: 'Seventy',
  71: 'Seventy-One', 72: 'Seventy-Two', 73: 'Seventy-Three', 74: 'Seventy-Four', 75: 'Seventy-Five',
  76: 'Seventy-Six', 77: 'Seventy-Seven', 78: 'Seventy-Eight', 79: 'Seventy-Nine', 80: 'Eighty',
  81: 'Eighty-One', 82: 'Eighty-Two', 83: 'Eighty-Three', 84: 'Eighty-Four', 85: 'Eighty-Five',
  86: 'Eighty-Six', 87: 'Eighty-Seven', 88: 'Eighty-Eight', 89: 'Eighty-Nine', 90: 'Ninety',
  91: 'Ninety-One', 92: 'Ninety-Two', 93: 'Ninety-Three', 94: 'Ninety-Four', 95: 'Ninety-Five',
  96: 'Ninety-Six', 97: 'Ninety-Seven', 98: 'Ninety-Eight', 99: 'Ninety-Nine', 100: 'One Hundred',
};

export const getNumberWord = (num: number, lang?: 'gu' | 'hi' | 'en'): string => {
  if (lang === 'hi') {
    if (HINDI_NUMBERS[num]) return HINDI_NUMBERS[num];
    return toHiDigits(num);
  }
  if (lang === 'gu') {
    if (GUJARATI_NUMBERS[num]) return GUJARATI_NUMBERS[num];
    return toGujDigits(num);
  }
  if (ENGLISH_NUMBERS[num]) return ENGLISH_NUMBERS[num];
  return num.toString();
};

export const GUJARATI_TABLE_RECITATION: Record<number, Record<number, { text: string; audio: string }>> = {
  1: {
    1: { text: 'એક એકા એક', audio: 'એક એકા એક ... ૧ ગુણ્યા ૧ બરાબર ૧' },
    2: { text: 'એક દુ બે', audio: 'એક દુ બે ... ૧ ગુણ્યા ૨ બરાબર ૨' },
    3: { text: 'એક તરી ત્રણ', audio: 'એક તરી ત્રણ ... ૧ ગુણ્યા ૩ બરાબર ૩' },
    4: { text: 'એક ચોક ચાર', audio: 'એક ચોક ચાર ... ૧ ગુણ્યા ૪ બરાબર ૪' },
    5: { text: 'એક પંચા પાંચ', audio: 'એક પંચા પાંચ ... ૧ ગુણ્યા ૫ બરાબર ૫' },
    6: { text: 'એક છક છ', audio: 'એક છક છ ... ૧ ગુણ્યા ૬ બરાબર ૬' },
    7: { text: 'એક સતા સાત', audio: 'એક સતા સાત ... ૧ ગુણ્યા ૭ બરાબર ૭' },
    8: { text: 'એક અઠા આઠ', audio: 'એક અઠા આઠ ... ૧ ગુણ્યા ૮ બરાબર ૮' },
    9: { text: 'એક નવા નવ', audio: 'એક નવા નવ ... ૧ ગુણ્યા ૯ બરાબર ૯' },
    10: { text: 'એક દાન દસ', audio: 'એક દાન દસ ... ૧ ગુણ્યા ૧૦ બરાબર ૧૦' },
  },
  2: {
    1: { text: 'બે એકા બે', audio: 'બે એકા બે ... ૨ ગુણ્યા ૧ બરાબર ૨' },
    2: { text: 'બે દુ ચાર', audio: 'બે દુ ચાર ... ૨ ગુણ્યા ૨ બરાબર ૪' },
    3: { text: 'બે તરી છ', audio: 'બે તરી છ ... ૨ ગુણ્યા ૩ બરાબર ૬' },
    4: { text: 'બે ચોક આઠ', audio: 'બે ચોક આઠ ... ૨ ગુણ્યા ૪ બરાબર ૮' },
    5: { text: 'બે પંચા દસ', audio: 'બે પંચા દસ ... ૨ ગુણ્યા ૫ બરાબર ૧૦' },
    6: { text: 'બે છક બાર', audio: 'બે છક બાર ... ૨ ગુણ્યા ૬ બરાબર ૧૨' },
    7: { text: 'બે સતા ચૌદ', audio: 'બે સતા ચૌદ ... ૨ ગુણ્યા ૭ બરાબર ૧૪' },
    8: { text: 'બે અઠા સોળ', audio: 'બે અઠા સોળ ... ૨ ગુણ્યા ૮ બરાબર ૧૬' },
    9: { text: 'બે નવા અઢાર', audio: 'બે નવા અઢાર ... ૨ ગુણ્યા ૯ બરાબર ૧૮' },
    10: { text: 'બે દાન વીસ', audio: 'બે દાન વીસ ... ૨ ગુણ્યા ૧૦ બરાબર ૨૦' },
  },
  3: {
    1: { text: 'ત્રણ એકા ત્રણ', audio: 'ત્રણ એકા ત્રણ ... ૩ ગુણ્યા ૧ બરાબર ૩' },
    2: { text: 'ત્રણ દુ છ', audio: 'ત્રણ દુ છ ... ૩ ગુણ્યા ૨ બરાબર ૬' },
    3: { text: 'ત્રણ તરી નવ', audio: 'ત્રણ તરી નવ ... ૩ ગુણ્યા ૩ બરાબર ૯' },
    4: { text: 'ત્રણ ચોક બાર', audio: 'ત્રણ ચોક બાર ... ૩ ગુણ્યા ૪ બરાબર ૧૨' },
    5: { text: 'ત્રણ પંચા પંદર', audio: 'ત્રણ પંચા પંદર ... ૩ ગુણ્યા ૫ બરાબર ૧૫' },
    6: { text: 'ત્રણ છક અઢાર', audio: 'ત્રણ છક અઢાર ... ૩ ગુણ્યા ૬ બરાબર ૧૮' },
    7: { text: 'ત્રણ સતા એકવીસ', audio: 'ત્રણ સતા એકવીસ ... ૩ ગુણ્યા ૭ બરાબર ૨૧' },
    8: { text: 'ત્રણ અઠા ચોવીસ', audio: 'ત્રણ અઠા ચોવીસ ... ૩ ગુણ્યા ૮ બરાબર ૨૪' },
    9: { text: 'ત્રણ નવા સત્તાવીસ', audio: 'ત્રણ નવા સત્તાવીસ ... ૩ ગુણ્યા ૯ બરાબર ૨૭' },
    10: { text: 'ત્રણ દાન ત્રીસ', audio: 'ત્રણ દાન ત્રીસ ... ૩ ગુણ્યા ૧૦ બરાબર ૩૦' },
  },
  4: {
    1: { text: 'ચાર એકા ચાર', audio: 'ચાર એકા ચાર ... ૪ ગુણ્યા ૧ બરાબર ૪' },
    2: { text: 'ચાર દુ આઠ', audio: 'ચાર દુ આઠ ... ૪ ગુણ્યા ૨ બરાબર ૮' },
    3: { text: 'ચાર તરી બાર', audio: 'ચાર તરી બાર ... ૪ ગુણ્યા ૩ બરાબર ૧૨' },
    4: { text: 'ચાર ચોક સોળ', audio: 'ચાર ચોક સોળ ... ૪ ગુણ્યા ૪ બરાબર ૧૬' },
    5: { text: 'ચાર પંચા વીસ', audio: 'ચાર પંચા વીસ ... ૪ ગુણ્યા ૫ બરાબર ૨૦' },
    6: { text: 'ચાર છક ચોવીસ', audio: 'ચાર છક ચોવીસ ... ૪ ગુણ્યા ૬ બરાબર ૨૪' },
    7: { text: 'ચાર સતા અઠ્ઠાવીસ', audio: 'ચાર સતા અઠ્ઠાવીસ ... ૪ ગુણ્યા ૭ બરાબર ૨૮' },
    8: { text: 'ચાર અઠા બત્રીસ', audio: 'ચાર અઠા બત્રીસ ... ૪ ગુણ્યા ૮ બરાબર ૩૨' },
    9: { text: 'ચાર નવા છત્રીસ', audio: 'ચાર નવા છત્રીસ ... ૪ ગુણ્યા ૯ બરાબર ૩૬' },
    10: { text: 'ચાર દાન ચાલીસ', audio: 'ચાર દાન ચાલીસ ... ૪ ગુણ્યા ૧૦ બરાબર ૪૦' },
  },
  5: {
    1: { text: 'પાંચ એકા પાંચ', audio: 'પાંચ એકા પાંચ ... ૫ ગુણ્યા ૧ બરાબર ૫' },
    2: { text: 'પાંચ દુ દસ', audio: 'પાંચ દુ દસ ... ૫ ગુણ્યા ૨ બરાબર ૧૦' },
    3: { text: 'પાંચ તરી પંદર', audio: 'પાંચ તરી પંદર ... ૫ ગુણ્યા ૩ બરાબર ૧૫' },
    4: { text: 'પાંચ ચોક વીસ', audio: 'પાંચ ચોક વીસ ... ૫ ગુણ્યા ૪ બરાબર ૨૦' },
    5: { text: 'પાંચ પંચા પચ્ચીસ', audio: 'પાંચ પંચા પચ્ચીસ ... ૫ ગુણ્યા ૫ બરાબર ૨૫' },
    6: { text: 'પાંચ છક ત્રીસ', audio: 'પાંચ છક ત્રીસ ... ૫ ગુણ્યા ૬ બરાબર ૩૦' },
    7: { text: 'પાંચ સતા પાંત્રીસ', audio: 'પાંચ સતા પાંત્રીસ ... ૫ ગુણ્યા ૭ બરાબર ૩૫' },
    8: { text: 'પાંચ અઠા ચાલીસ', audio: 'પાંચ અઠા ચાલીસ ... ૫ ગુણ્યા ૮ બરાબર ૪૦' },
    9: { text: 'પાંચ નવા પિસ્તાલીસ', audio: 'પાંચ નવા પિસ્તાલીસ ... ૫ ગુણ્યા ૯ બરાબર ૪૫' },
    10: { text: 'પાંચ દાન પચાસ', audio: 'પાંચ દાન પચાસ ... ૫ ગુણ્યા ૧૦ બરાબર ૫૦' },
  },
  6: {
    1: { text: 'છ એકા છ', audio: 'છ એકા છ ... ૬ ગુણ્યા ૧ બરાબર ૬' },
    2: { text: 'છ દુ બાર', audio: 'છ દુ બાર ... ૬ ગુણ્યા ૨ બરાબર ૧૨' },
    3: { text: 'છ તરી અઢાર', audio: 'છ તરી અઢાર ... ૬ ગુણ્યા ૩ બરાબર ૧૮' },
    4: { text: 'છ ચોક ચોવીસ', audio: 'છ ચોક ચોવીસ ... ૬ ગુણ્યા ૪ બરાબર ૨૪' },
    5: { text: 'છ પંચા ત્રીસ', audio: 'છ પંચા ત્રીસ ... ૬ ગુણ્યા ૫ બરાબર ૩૦' },
    6: { text: 'છ છક છત્રીસ', audio: 'છ છક છત્રીસ ... ૬ ગુણ્યા ૬ બરાબર ૩૬' },
    7: { text: 'છ સતા બેતાલીસ', audio: 'છ સતા બેતાલીસ ... ૬ ગુણ્યા ૭ બરાબર ૪૨' },
    8: { text: 'છ અઠા અડતાલીસ', audio: 'છ અઠા અડતાલીસ ... ૬ ગુણ્યા ૮ બરાબર ૪૮' },
    9: { text: 'છ નવા ચોપ્પન', audio: 'છ નવા ચોપ્પન ... ૬ ગુણ્યા ૯ બરાબર ૫૪' },
    10: { text: 'છ દાન સાઠ', audio: 'છ દાન સાઠ ... ૬ ગુણ્યા ૧૦ બરાબર ૬૦' },
  },
  7: {
    1: { text: 'સાત એકા સાત', audio: 'સાત એકા સાત ... ૭ ગુણ્યા ૧ બરાબર ૭' },
    2: { text: 'સાત દુ ચૌદ', audio: 'સાત દુ ચૌદ ... ૭ ગુણ્યા ૨ બરાબર ૧૪' },
    3: { text: 'સાત તરી એકવીસ', audio: 'સાત તરી એકવીસ ... ૭ ગુણ્યા ૩ બરાબર ૨૧' },
    4: { text: 'સાત ચોક અઠ્ઠાવીસ', audio: 'સાત ચોક અઠ્ઠાવીસ ... ૭ ગુણ્યા ૪ બરાબર ૨૮' },
    5: { text: 'સાત પંચા પાંત્રીસ', audio: 'સાત પંચા પાંત્રીસ ... ૭ ગુણ્યા ૫ બરાબર ૩૫' },
    6: { text: 'સાત છક બેતાલીસ', audio: 'સાત છક બેતાલીસ ... ૭ ગુણ્યા ૬ બરાબર ૪૨' },
    7: { text: 'સાત સતા ઓગણપચાસ', audio: 'સાત સતા ઓગણપચાસ ... ૭ ગુણ્યા ૭ બરાબર ૪૯' },
    8: { text: 'સાત અઠા છપ્પન', audio: 'સાત અઠા છપ્પન ... ૭ ગુણ્યા ૮ બરાબર ૫૬' },
    9: { text: 'સાત નવા ત્રેસઠ', audio: 'સાત નવા ત્રેસઠ ... ૭ ગુણ્યા ૯ બરાબર ૬૩' },
    10: { text: 'સાત દાન સિત્તેર', audio: 'સાત દાન સિત્તેર ... ૭ ગુણ્યા ૧૦ બરાબર ૭૦' },
  },
  8: {
    1: { text: 'આઠ એકા આઠ', audio: 'આઠ એકા આઠ ... ૮ ગુણ્યા ૧ બરાબર ૮' },
    2: { text: 'આઠ દુ સોળ', audio: 'આઠ દુ સોળ ... ૮ ગુણ્યા ૨ બરાબર ૧૬' },
    3: { text: 'આઠ તરી ચોવીસ', audio: 'આઠ તરી ચોવીસ ... ૮ ગુણ્યા ૩ બરાબર ૨૪' },
    4: { text: 'આઠ ચોક બત્રીસ', audio: 'આઠ ચોક બત્રીસ ... ૮ ગુણ્યા ૪ બરાબર ૩૨' },
    5: { text: 'આઠ પંચા ચાલીસ', audio: 'આઠ પંચા ચાલીસ ... ૮ ગુણ્યા ૫ બરાબર ૪૦' },
    6: { text: 'આઠ છક અડતાલીસ', audio: 'આઠ છક અડતાલીસ ... ૮ ગુણ્યા ૬ બરાબર ૪૮' },
    7: { text: 'આઠ સતા છપ્પન', audio: 'આઠ સતા છપ્પન ... ૮ ગુણ્યા ૭ બરાબર ૫૬' },
    8: { text: 'આઠ અઠા ચોસઠ', audio: 'આઠ અઠા ચોસઠ ... ૮ ગુણ્યા ૮ બરાબર ૬૪' },
    9: { text: 'આઠ નવા બોતેર', audio: 'આઠ નવા બોતેર ... ૮ ગુણ્યા ૯ બરાબર ૭૨' },
    10: { text: 'આઠ દાન એંસી', audio: 'આઠ દાન એંસી ... ૮ ગુણ્યા ૧૦ બરાબર ૮૦' },
  },
  9: {
    1: { text: 'નવ એકા નવ', audio: 'નવ એકા નવ ... ૯ ગુણ્યા ૧ બરાબર ૯' },
    2: { text: 'નવ દુ અઢાર', audio: 'નવ દુ અઢાર ... ૯ ગુણ્યા ૨ બરાબર ૧૮' },
    3: { text: 'નવ તરી સત્તાવીસ', audio: 'નવ તરી સત્તાવીસ ... ૯ ગુણ્યા ૩ બરાબર ૨૭' },
    4: { text: 'નવ ચોક છત્રીસ', audio: 'નવ ચોક છત્રીસ ... ૯ ગુણ્યા ૪ બરાબર ૩૬' },
    5: { text: 'નવ પંચા પિસ્તાલીસ', audio: 'નવ પંચા પિસ્તાલીસ ... ૯ ગુણ્યા ૫ બરાબર ૪૫' },
    6: { text: 'નવ છક ચોપ્પન', audio: 'નવ છક ચોપ્પન ... ૯ ગુણ્યા ૬ બરાબર ૫૪' },
    7: { text: 'નવ સતા ત્રેસઠ', audio: 'નવ સતા ત્રેસઠ ... ૯ ગુણ્યા ૭ બરાબર ૬૩' },
    8: { text: 'નવ અઠા બોતેર', audio: 'નવ અઠા બોતેર ... ૯ ગુણ્યા ૮ બરાબર ૭૨' },
    9: { text: 'નવ નવા એક્યાસી', audio: 'નવ નવા એક્યાસી ... ૯ ગુણ્યા ૯ બરાબર ૮૧' },
    10: { text: 'નવ દાન નેવું', audio: 'નવ દાન નેવું ... ૯ ગુણ્યા ૧૦ બરાબર ૯૦' },
  },
  10: {
    1: { text: 'દસ એકા દસ', audio: 'દસ એકા દસ ... ૧૦ ગુણ્યા ૧ બરાબર ૧૦' },
    2: { text: 'દસ દુ વીસ', audio: 'દસ દુ વીસ ... ૧૦ ગુણ્યા ૨ બરાબર ૨૦' },
    3: { text: 'દસ તરી ત્રીસ', audio: 'દસ તરી ત્રીસ ... ૧૦ ગુણ્યા ૩ બરાબર ૩૦' },
    4: { text: 'દસ ચોક ચાલીસ', audio: 'દસ ચોક ચાલીસ ... ૧૦ ગુણ્યા ૪ બરાબર ૪૦' },
    5: { text: 'દસ પંચા પચાસ', audio: 'દસ પંચા પચાસ ... ૧૦ ગુણ્યા ૫ બરાબર ૫૦' },
    6: { text: 'દસ છક સાઠ', audio: 'દસ છક સાઠ ... ૧૦ ગુણ્યા ૬ બરાબર ૬૦' },
    7: { text: 'દસ સતા સિત્તેર', audio: 'દસ સતા સિત્તેર ... ૧૦ ગુણ્યા ૭ બરાબર ૭૦' },
    8: { text: 'દસ અઠા એંસી', audio: 'દસ અઠા એંસી ... ૧૦ ગુણ્યા ૮ બરાબર ૮૦' },
    9: { text: 'દસ નવા નેવું', audio: 'દસ નવા નેવું ... ૧૦ ગુણ્યા ૯ બરાબર ૯૦' },
    10: { text: 'દસ દાન સો', audio: 'દસ દાન સો ... ૧૦ ગુણ્યા ૧૦ બરાબર ૧૦૦' },
  },
};

export const HINDI_TABLE_RECITATION: Record<number, Record<number, { text: string; audio: string }>> = {
  1: {
    1: { text: 'एक एकम एक', audio: 'एक एकम एक' },
    2: { text: 'एक दूनी दो', audio: 'एक दूनी दो' },
    3: { text: 'एक तिया तीन', audio: 'एक तिया तीन' },
    4: { text: 'एक चौके चार', audio: 'एक चौके चार' },
    5: { text: 'एक पंचे पांच', audio: 'एक पंचे पांच' },
    6: { text: 'एक छक्के छह', audio: 'एक छक्के छह' },
    7: { text: 'एक सत्ते सात', audio: 'एक सत्ते सात' },
    8: { text: 'एक अट्टे आठ', audio: 'एक अट्टे आठ' },
    9: { text: 'एक निम्मे नौ', audio: 'एक निम्मे नौ' },
    10: { text: 'एक दहाई दस', audio: 'एक दहाई दस' },
  },
  2: {
    1: { text: 'दो एकम दो', audio: 'दो एकम दो' },
    2: { text: 'दो दूनी चार', audio: 'दो दूनी चार' },
    3: { text: 'दो तिया छह', audio: 'दो तिया छह' },
    4: { text: 'दो चौके आठ', audio: 'दो चौके आठ' },
    5: { text: 'दो पंचे दस', audio: 'दो पंचे दस' },
    6: { text: 'दो छक्के बारह', audio: 'दो छक्के बारह' },
    7: { text: 'दो सत्ते चौदह', audio: 'दो सत्ते चौदह' },
    8: { text: 'दो अट्टे सोलह', audio: 'दो अट्टे सोलह' },
    9: { text: 'दो निम्मे अठारह', audio: 'दो निम्मे अठारह' },
    10: { text: 'दो दहाई बीस', audio: 'दो दहाई बीस' },
  },
  3: {
    1: { text: 'तीन एकम तीन', audio: 'तीन एकम तीन' },
    2: { text: 'तीन दूनी छह', audio: 'तीन दूनी छह' },
    3: { text: 'तीन तिया नौ', audio: 'तीन तिया नौ' },
    4: { text: 'तीन चौके बारह', audio: 'तीन चौके बारह' },
    5: { text: 'तीन पंचे पंद्रह', audio: 'तीन पंचे पंद्रह' },
    6: { text: 'तीन छक्के अठारह', audio: 'तीन छक्के अठारह' },
    7: { text: 'तीन सत्ते इक्कीस', audio: 'तीन सत्ते इक्कीस' },
    8: { text: 'तीन अट्टे चौबीस', audio: 'तीन अट्टे चौबीस' },
    9: { text: 'तीन निम्मे सत्ताईस', audio: 'तीन निम्मे सत्ताईस' },
    10: { text: 'तीन दहाई तीस', audio: 'तीन दहाई तीस' },
  },
  4: {
    1: { text: 'चार एकम चार', audio: 'चार एकम चार' },
    2: { text: 'चार दूनी आठ', audio: 'चार दूनी आठ' },
    3: { text: 'चार तिया बारह', audio: 'चार तिया बारह' },
    4: { text: 'चार चौके सोलह', audio: 'चार चौके सोलह' },
    5: { text: 'चार पंचे बीस', audio: 'चार पंचे बीस' },
    6: { text: 'चार छक्के चौबीस', audio: 'चार छक्के चौबीस' },
    7: { text: 'चार सत्ते अट्ठाईस', audio: 'चार सत्ते अट्ठाईस' },
    8: { text: 'चार अट्टे बत्तीस', audio: 'चार अट्टे बत्तीस' },
    9: { text: 'चार निम्मे छत्तीस', audio: 'चार निम्मे छत्तीस' },
    10: { text: 'चार दहाई चालीस', audio: 'चार दहाई चालीस' },
  },
  5: {
    1: { text: 'पांच एकम पांच', audio: 'पांच एकम पांच' },
    2: { text: 'पांच दूनी दस', audio: 'पांच दूनी दस' },
    3: { text: 'पांच तिया पंद्रह', audio: 'पांच तिया पंद्रह' },
    4: { text: 'पांच चौके बीस', audio: 'पांच चौके बीस' },
    5: { text: 'पांच पंचे पच्चीस', audio: 'पांच पंचे पच्चीस' },
    6: { text: 'पांच छक्के तीस', audio: 'पांच छक्के तीस' },
    7: { text: 'पांच सत्ते पैंतीस', audio: 'पांच सत्ते पैंतीस' },
    8: { text: 'पांच अट्टे चालीस', audio: 'पांच अट्टे चालीस' },
    9: { text: 'पांच निम्मे पैंतालीस', audio: 'पांच निम्मे पैंतालीस' },
    10: { text: 'पांच दहाई पचास', audio: 'पांच दहाई पचास' },
  },
  6: {
    1: { text: 'छह एकम छह', audio: 'छह एकम छह' },
    2: { text: 'छह दूनी बारह', audio: 'छह दूनी बारह' },
    3: { text: 'छह तिया अठारह', audio: 'छह तिया अठारह' },
    4: { text: 'छह चौके चौबीस', audio: 'छह चौके चौबीस' },
    5: { text: 'छह पंचे तीस', audio: 'छह पंचे तीस' },
    6: { text: 'छह छक्के छत्तीस', audio: 'छह छक्के छत्तीस' },
    7: { text: 'छह सत्ते बयालीस', audio: 'छह सत्ते बयालीस' },
    8: { text: 'छह अट्टे अड़तालीस', audio: 'छह अट्टे अड़तालीस' },
    9: { text: 'छह निम्मे चौवन', audio: 'छह निम्मे चौवन' },
    10: { text: 'छह दहाई साठ', audio: 'छह दहाई साठ' },
  },
  7: {
    1: { text: 'सात एकम सात', audio: 'सात एकम सात' },
    2: { text: 'सात दूनी चौदह', audio: 'सात दूनी चौदह' },
    3: { text: 'सात तिया इक्कीस', audio: 'सात तिया इक्कीस' },
    4: { text: 'सात चौके अट्ठाईस', audio: 'सात चौके अट्ठाईस' },
    5: { text: 'सात पंचे पैंतीस', audio: 'सात पंचे पैंतीस' },
    6: { text: 'सात छक्के बयालीस', audio: 'सात छक्के बयालीस' },
    7: { text: 'सात सत्ते उनचास', audio: 'सात सत्ते उनचास' },
    8: { text: 'सात अट्टे छप्पन', audio: 'सात अट्टे छप्पन' },
    9: { text: 'सात निम्मे तिरसठ', audio: 'सात निम्मे तिरसठ' },
    10: { text: 'सात दहाई सत्तर', audio: 'सात दहाई सत्तर' },
  },
  8: {
    1: { text: 'आठ एकम आठ', audio: 'आठ एकम आठ' },
    2: { text: 'आठ दूनी सोलह', audio: 'आठ दूनी सोलह' },
    3: { text: 'आठ तिया चौबीस', audio: 'आठ तिया चौबीस' },
    4: { text: 'आठ चौके बत्तीस', audio: 'आठ चौके बत्तीस' },
    5: { text: 'आठ पंचे चालीस', audio: 'आठ पंचे चालीस' },
    6: { text: 'आठ छक्के अड़तालीस', audio: 'आठ छक्के अड़तालीस' },
    7: { text: 'आठ सत्ते छप्पन', audio: 'आठ सत्ते छप्पन' },
    8: { text: 'आठ अट्टे चौंसठ', audio: 'आठ अट्टे चौंसठ' },
    9: { text: 'आठ निम्मे बहत्तर', audio: 'आठ निम्मे बहत्तर' },
    10: { text: 'आठ दहाई अस्सी', audio: 'आठ दहाई अस्सी' },
  },
  9: {
    1: { text: 'नौ एकम नौ', audio: 'नौ एकम नौ' },
    2: { text: 'नौ दूनी अठारह', audio: 'नौ दूनी अठारह' },
    3: { text: 'नौ तिया सत्ताईस', audio: 'नौ तिया सत्ताईस' },
    4: { text: 'नौ चौके छत्तीस', audio: 'नौ चौके छत्तीस' },
    5: { text: 'नौ पंचे पैंतालीस', audio: 'नौ पंचे पैंतालीस' },
    6: { text: 'नौ छक्के चौवन', audio: 'नौ छक्के चौवन' },
    7: { text: 'नौ सत्ते तिरसठ', audio: 'नौ सत्ते तिरसठ' },
    8: { text: 'नौ अट्टे बहत्तर', audio: 'नौ अट्टे बहत्तर' },
    9: { text: 'नौ निम्मे इक्यासी', audio: 'नौ निम्मे इक्यासी' },
    10: { text: 'नौ दहाई नब्बे', audio: 'नौ दहाई नब्बे' },
  },
  10: {
    1: { text: 'दस एकम दस', audio: 'दस एकम दस' },
    2: { text: 'दस दूनी बीस', audio: 'दस दूनी बीस' },
    3: { text: 'दस तिया तीस', audio: 'दस तिया तीस' },
    4: { text: 'दस चौके चालीस', audio: 'दस चौके चालीस' },
    5: { text: 'दस पंचे पचास', audio: 'दस पंचे पचास' },
    6: { text: 'दस छक्के साठ', audio: 'दस छक्के साठ' },
    7: { text: 'दस सत्ते सत्तर', audio: 'दस सत्ते सत्तर' },
    8: { text: 'दस अट्टे अस्सी', audio: 'दस अट्टे अस्सी' },
    9: { text: 'दस निम्मे नब्बे', audio: 'दस निम्मे नब्बे' },
    10: { text: 'दस दहाई सौ', audio: 'दस दहाई सौ' },
  },
};

export const ENGLISH_TABLE_RECITATION: Record<number, Record<number, { text: string; audio: string }>> = {
  1: {
    1: { text: '1 times 1 is 1', audio: '1 times 1 is 1' },
    2: { text: '1 times 2 is 2', audio: '1 times 2 is 2' },
    3: { text: '1 times 3 is 3', audio: '1 times 3 is 3' },
    4: { text: '1 times 4 is 4', audio: '1 times 4 is 4' },
    5: { text: '1 times 5 is 5', audio: '1 times 5 is 5' },
    6: { text: '1 times 6 is 6', audio: '1 times 6 is 6' },
    7: { text: '1 times 7 is 7', audio: '1 times 7 is 7' },
    8: { text: '1 times 8 is 8', audio: '1 times 8 is 8' },
    9: { text: '1 times 9 is 9', audio: '1 times 9 is 9' },
    10: { text: '1 times 10 is 10', audio: '1 times 10 is 10' },
  },
  2: {
    1: { text: '2 times 1 is 2', audio: '2 times 1 is 2' },
    2: { text: '2 times 2 is 4', audio: '2 times 2 is 4' },
    3: { text: '2 times 3 is 6', audio: '2 times 3 is 6' },
    4: { text: '2 times 4 is 8', audio: '2 times 4 is 8' },
    5: { text: '2 times 5 is 10', audio: '2 times 5 is 10' },
    6: { text: '2 times 6 is 12', audio: '2 times 6 is 12' },
    7: { text: '2 times 7 is 14', audio: '2 times 7 is 14' },
    8: { text: '2 times 8 is 16', audio: '2 times 8 is 16' },
    9: { text: '2 times 9 is 18', audio: '2 times 9 is 18' },
    10: { text: '2 times 10 is 20', audio: '2 times 10 is 20' },
  },
  3: {
    1: { text: '3 times 1 is 3', audio: '3 times 1 is 3' },
    2: { text: '3 times 2 is 6', audio: '3 times 2 is 6' },
    3: { text: '3 times 3 is 9', audio: '3 times 3 is 9' },
    4: { text: '3 times 4 is 12', audio: '3 times 4 is 12' },
    5: { text: '3 times 5 is 15', audio: '3 times 5 is 15' },
    6: { text: '3 times 6 is 18', audio: '3 times 6 is 18' },
    7: { text: '3 times 7 is 21', audio: '3 times 7 is 21' },
    8: { text: '3 times 8 is 24', audio: '3 times 8 is 24' },
    9: { text: '3 times 9 is 27', audio: '3 times 9 is 27' },
    10: { text: '3 times 10 is 30', audio: '3 times 10 is 30' },
  },
  4: {
    1: { text: '4 times 1 is 4', audio: '4 times 1 is 4' },
    2: { text: '4 times 2 is 8', audio: '4 times 2 is 8' },
    3: { text: '4 times 3 is 12', audio: '4 times 3 is 12' },
    4: { text: '4 times 4 is 16', audio: '4 times 4 is 16' },
    5: { text: '4 times 5 is 20', audio: '4 times 5 is 20' },
    6: { text: '4 times 6 is 24', audio: '4 times 6 is 24' },
    7: { text: '4 times 7 is 28', audio: '4 times 7 is 28' },
    8: { text: '4 times 8 is 32', audio: '4 times 8 is 32' },
    9: { text: '4 times 9 is 36', audio: '4 times 9 is 36' },
    10: { text: '4 times 10 is 40', audio: '4 times 10 is 40' },
  },
  5: {
    1: { text: '5 times 1 is 5', audio: '5 times 1 is 5' },
    2: { text: '5 times 2 is 10', audio: '5 times 2 is 10' },
    3: { text: '5 times 3 is 15', audio: '5 times 3 is 15' },
    4: { text: '5 times 4 is 20', audio: '5 times 4 is 20' },
    5: { text: '5 times 5 is 25', audio: '5 times 5 is 25' },
    6: { text: '5 times 6 is 30', audio: '5 times 6 is 30' },
    7: { text: '5 times 7 is 35', audio: '5 times 7 is 35' },
    8: { text: '5 times 8 is 40', audio: '5 times 8 is 40' },
    9: { text: '5 times 9 is 45', audio: '5 times 9 is 45' },
    10: { text: '5 times 10 is 50', audio: '5 times 10 is 50' },
  },
  6: {
    1: { text: '6 times 1 is 6', audio: '6 times 1 is 6' },
    2: { text: '6 times 2 is 12', audio: '6 times 2 is 12' },
    3: { text: '6 times 3 is 18', audio: '6 times 3 is 18' },
    4: { text: '6 times 4 is 24', audio: '6 times 4 is 24' },
    5: { text: '6 times 5 is 30', audio: '6 times 5 is 30' },
    6: { text: '6 times 6 is 36', audio: '6 times 6 is 36' },
    7: { text: '6 times 7 is 42', audio: '6 times 7 is 42' },
    8: { text: '6 times 8 is 48', audio: '6 times 8 is 48' },
    9: { text: '6 times 9 is 54', audio: '6 times 9 is 54' },
    10: { text: '6 times 10 is 60', audio: '6 times 10 is 60' },
  },
  7: {
    1: { text: '7 times 1 is 7', audio: '7 times 1 is 7' },
    2: { text: '7 times 2 is 14', audio: '7 times 2 is 14' },
    3: { text: '7 times 3 is 21', audio: '7 times 3 is 21' },
    4: { text: '7 times 4 is 28', audio: '7 times 4 is 28' },
    5: { text: '7 times 5 is 35', audio: '7 times 5 is 35' },
    6: { text: '7 times 6 is 42', audio: '7 times 6 is 42' },
    7: { text: '7 times 7 is 49', audio: '7 times 7 is 49' },
    8: { text: '7 times 8 is 56', audio: '7 times 8 is 56' },
    9: { text: '7 times 9 is 63', audio: '7 times 9 is 63' },
    10: { text: '7 times 10 is 70', audio: '7 times 10 is 70' },
  },
  8: {
    1: { text: '8 times 1 is 8', audio: '8 times 1 is 8' },
    2: { text: '8 times 2 is 16', audio: '8 times 2 is 16' },
    3: { text: '8 times 3 is 24', audio: '8 times 3 is 24' },
    4: { text: '8 times 4 is 32', audio: '8 times 4 is 32' },
    5: { text: '8 times 5 is 40', audio: '8 times 5 is 40' },
    6: { text: '8 times 6 is 48', audio: '8 times 6 is 48' },
    7: { text: '8 times 7 is 56', audio: '8 times 7 is 56' },
    8: { text: '8 times 8 is 64', audio: '8 times 8 is 64' },
    9: { text: '8 times 9 is 72', audio: '8 times 9 is 72' },
    10: { text: '8 times 10 is 80', audio: '8 times 10 is 80' },
  },
  9: {
    1: { text: '9 times 1 is 9', audio: '9 times 1 is 9' },
    2: { text: '9 times 2 is 18', audio: '9 times 2 is 18' },
    3: { text: '9 times 3 is 27', audio: '9 times 3 is 27' },
    4: { text: '9 times 4 is 36', audio: '9 times 4 is 36' },
    5: { text: '9 times 5 is 45', audio: '9 times 5 is 45' },
    6: { text: '9 times 6 is 54', audio: '9 times 6 is 54' },
    7: { text: '9 times 7 is 63', audio: '9 times 7 is 63' },
    8: { text: '9 times 8 is 72', audio: '9 times 8 is 72' },
    9: { text: '9 times 9 is 81', audio: '9 times 9 is 81' },
    10: { text: '9 times 10 is 90', audio: '9 times 10 is 90' },
  },
  10: {
    1: { text: '10 times 1 is 10', audio: '10 times 1 is 10' },
    2: { text: '10 times 2 is 20', audio: '10 times 2 is 20' },
    3: { text: '10 times 3 is 30', audio: '10 times 3 is 30' },
    4: { text: '10 times 4 is 40', audio: '10 times 4 is 40' },
    5: { text: '10 times 5 is 50', audio: '10 times 5 is 50' },
    6: { text: '10 times 6 is 60', audio: '10 times 6 is 60' },
    7: { text: '10 times 7 is 70', audio: '10 times 7 is 70' },
    8: { text: '10 times 8 is 80', audio: '10 times 8 is 80' },
    9: { text: '10 times 9 is 90', audio: '10 times 9 is 90' },
    10: { text: '10 times 10 is 100', audio: '10 times 10 is 100' },
  },
};
