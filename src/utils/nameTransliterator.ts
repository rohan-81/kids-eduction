// Accurate Trilingual Child Name Transliterator for KidsZone
// Formats children's names accurately in Gujarati, Hindi, and English

import type { AppLanguage } from '../types';

const DEV_TO_GUJ_OFFSET = 0x0180;

export const convertDevanagariToGujarati = (text: string): string => {
  return text
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 0x0900 && code <= 0x097f) {
        return String.fromCharCode(code + DEV_TO_GUJ_OFFSET);
      }
      return char;
    })
    .join('');
};

export const convertGujaratiToDevanagari = (text: string): string => {
  return text
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 0x0a80 && code <= 0x0aff) {
        return String.fromCharCode(code - DEV_TO_GUJ_OFFSET);
      }
      return char;
    })
    .join('');
};

const COMMON_NAMES: Record<string, { gu: string; hi: string }> = {
  // Names
  kabir: { gu: 'કબીર', hi: 'कबीर' },
  singh: { gu: 'સિંહ', hi: 'सिंह' },
  sinh: { gu: 'સિંહ', hi: 'सिंह' },
  rohan: { gu: 'રોહન', hi: 'रोहन' },
  patel: { gu: 'પટેલ', hi: 'पटेल' },
  aarav: { gu: 'આરવ', hi: 'आरव' },
  arav: { gu: 'આરવ', hi: 'आरव' },
  diya: { gu: 'દિયા', hi: 'दीया' },
  deeya: { gu: 'દિયા', hi: 'दीया' },
  vivaan: { gu: 'વિવાન', hi: 'विवान' },
  vivan: { gu: 'વિવાન', hi: 'विवान' },
  ananya: { gu: 'અનન્યા', hi: 'अनन्या' },
  chirag: { gu: 'ચિરાગ', hi: 'चिराग' },
  ravi: { gu: 'રવિ', hi: 'रवि' },
  senjaliya: { gu: 'સેંજલિયા', hi: 'सेंजलिया' },
  aryan: { gu: 'આર્યન', hi: 'आर्यन' },
  reyansh: { gu: 'રેયાંશ', hi: 'रेयांश' },
  ayush: { gu: 'આયુષ', hi: 'आयुष' },
  ishaan: { gu: 'ઈશાન', hi: 'ईशान' },
  ishan: { gu: 'ઈશાન', hi: 'ईशान' },
  vihaan: { gu: 'વિહાન', hi: 'विहान' },
  dhruv: { gu: 'ધ્રુવ', hi: 'ध्रुव' },
  rudra: { gu: 'રુદ્ર', hi: 'रुद्र' },
  atharva: { gu: 'અથર્વ', hi: 'अथर्व' },
  atharv: { gu: 'અથર્વ', hi: 'अथर्व' },
  dev: { gu: 'દેવ', hi: 'देव' },
  veer: { gu: 'વીર', hi: 'वीर' },
  vir: { gu: 'વીર', hi: 'वीर' },
  virat: { gu: 'વિરાટ', hi: 'विराट' },
  raj: { gu: 'રાજ', hi: 'राज' },
  yash: { gu: 'યશ', hi: 'यश' },
  jay: { gu: 'જય', hi: 'जय' },
  om: { gu: 'ઓમ', hi: 'ॐ' },
  krishna: { gu: 'કૃષ્ણ', hi: 'कृष्ण' },
  shivam: { gu: 'શિવમ', hi: 'शिवम' },
  rahul: { gu: 'રાહુલ', hi: 'राहुल' },
  rohit: { gu: 'રોહિત', hi: 'रोहित' },
  hardik: { gu: 'હાર્દિક', hi: 'हार्दिक' },
  bhavin: { gu: 'ભાવિન', hi: 'भाविन' },
  krunal: { gu: 'કૃણાલ', hi: 'कृणाल' },
  sanjay: { gu: 'સંજય', hi: 'संजय' },
  manoj: { gu: 'મનોજ', hi: 'मनोज' },
  dhaval: { gu: 'ધવલ', hi: 'धवल' },
  amit: { gu: 'અમિત', hi: 'अमित' },
  anand: { gu: 'આનંદ', hi: 'आनंद' },
  deep: { gu: 'દીપ', hi: 'दीप' },
  jeet: { gu: 'જીત', hi: 'जीत' },
  meet: { gu: 'મીત', hi: 'मीत' },
  nilesh: { gu: 'નિલેશ', hi: 'निलेश' },
  hitesh: { gu: 'હિતેશ', hi: 'हितेश' },
  paresh: { gu: 'પરેશ', hi: 'परेश' },
  mukesh: { gu: 'મુકેશ', hi: 'मुकेश' },
  alpesh: { gu: 'અલ્પેશ', hi: 'अल्पेश' },
  kalpesh: { gu: 'કલ્પેશ', hi: 'कल्पेश' },
  kamlesh: { gu: 'કમલેશ', hi: 'कमलेश' },
  naresh: { gu: 'નરેશ', hi: 'नरेश' },
  ramesh: { gu: 'રમેશ', hi: 'रमेश' },
  suresh: { gu: 'સુરેશ', hi: 'सुरेश' },
  dinesh: { gu: 'દિનેશ', hi: 'दिनेश' },
  mahesh: { gu: 'મહેશ', hi: 'महेश' },
  priya: { gu: 'પ્રિયા', hi: 'प्रिया' },
  riya: { gu: 'રિયા', hi: 'रिया' },
  kiara: { gu: 'કિયારા', hi: 'कियारा' },
  avni: { gu: 'અવની', hi: 'अवनी' },
  mira: { gu: 'મીરા', hi: 'मीरा' },
  pooja: { gu: 'પૂજા', hi: 'पूजा' },
  puja: { gu: 'પૂજા', hi: 'पूजा' },
  neha: { gu: 'નેહા', hi: 'नेहा' },
  radha: { gu: 'રાધા', hi: 'राधा' },
  siya: { gu: 'સિયા', hi: 'सिया' },
  sia: { gu: 'સિયા', hi: 'सिया' },
  tanvi: { gu: 'તન્વી', hi: 'तन्वी' },
  saanvi: { gu: 'સાન્વી', hi: 'सान्वी' },
  sanvi: { gu: 'સાન્વી', hi: 'सान्वी' },
  anaya: { gu: 'અનાયા', hi: 'अनाया' },
  myra: { gu: 'માયરા', hi: 'मायरा' },
  ira: { gu: 'ઈરા', hi: 'इरा' },
  pari: { gu: 'પરી', hi: 'परी' },
  khushi: { gu: 'ખુશી', hi: 'खुशी' },
  riddhi: { gu: 'રિદ્ધિ', hi: 'ऋद्धि' },
  siddhi: { gu: 'સિદ્ધિ', hi: 'सिद्धि' },
  aditi: { gu: 'અદિતિ', hi: 'अदिति' },
  kavya: { gu: 'કાવ્યા', hi: 'काव्या' },
  drasti: { gu: 'દ્રષ્ટિ', hi: 'दृष्टि' },
  drashti: { gu: 'દ્રષ્ટિ', hi: 'दृष्टि' },
  prisha: { gu: 'પ્રિશા', hi: 'प्रिशा' },
  tanya: { gu: 'તાન્યા', hi: 'तान्या' },
  isha: { gu: 'ઈશા', hi: 'ईशा' },
  shreya: { gu: 'શ્રેયા', hi: 'श्रेया' },
  sneha: { gu: 'સ્નેહા', hi: 'स्नेहा' },

  // Surnames
  shah: { gu: 'શાહ', hi: 'शाह' },
  mehta: { gu: 'મહેતા', hi: 'मेहता' },
  joshi: { gu: 'જોશી', hi: 'जोशी' },
  sharma: { gu: 'શર્મા', hi: 'शर्मा' },
  verma: { gu: 'વર્મા', hi: 'वर्मा' },
  kumar: { gu: 'કુમાર', hi: 'कुमार' },
  gupta: { gu: 'ગુપ્તા', hi: 'गुप्ता' },
  yadav: { gu: 'યાદવ', hi: 'यादव' },
  desai: { gu: 'દેસાઈ', hi: 'देसाई' },
  soni: { gu: 'સોની', hi: 'सोनी' },
  parikh: { gu: 'પરીખ', hi: 'पारीख' },
  panchal: { gu: 'પાંચાલ', hi: 'पांचाल' },
  rana: { gu: 'રાણા', hi: 'राणा' },
  trivedi: { gu: 'ત્રિવેદી', hi: 'त्रिवेदी' },
  bhatt: { gu: 'ભટ્ટ', hi: 'भट्ट' },
  dave: { gu: 'દવે', hi: 'दवे' },
  pandya: { gu: 'પંડ્યા', hi: 'पंड्या' },
  chauhan: { gu: 'ચૌહાણ', hi: 'चौहान' },
  jadeja: { gu: 'જાડેજા', hi: 'जाडेजा' },
  solanki: { gu: 'સોલંકી', hi: 'सोलंकी' },
  prajapati: { gu: 'પ્રજાપતિ', hi: 'प्रजापति' },
  nayak: { gu: 'નાયક', hi: 'नायक' },
  vaghela: { gu: 'વાઘેલા', hi: 'वाघेला' },
  modi: { gu: 'મોદી', hi: 'मोदी' },
  barot: { gu: 'બારોટ', hi: 'बारोट' },
  pandit: { gu: 'પંડિત', hi: 'पंडित' },
  thakor: { gu: 'ઠાકોર', hi: 'ठाकोर' },
  mishra: { gu: 'મિશ્રા', hi: 'मिश्रा' },
};

// General rule-based phonetic engine for any Indian name
const CONSONANTS: [string, string, string][] = [
  ['shh', 'ષ', 'ष'],
  ['chh', 'છ', 'छ'],
  ['kh', 'ખ', 'ख'],
  ['gh', 'ઘ', 'घ'],
  ['ch', 'ચ', 'च'],
  ['jh', 'ઝ', 'झ'],
  ['th', 'થ', 'थ'],
  ['dh', 'ધ', 'ध'],
  ['ph', 'ફ', 'फ'],
  ['bh', 'ભ', 'भ'],
  ['sh', 'શ', 'श'],
  ['k', 'ક', 'क'],
  ['g', 'ગ', 'ग'],
  ['j', 'જ', 'ज'],
  ['t', 'ત', 'त'],
  ['d', 'દ', 'द'],
  ['n', 'ન', 'न'],
  ['p', 'પ', 'प'],
  ['f', 'ફ', 'फ'],
  ['b', 'બ', 'ब'],
  ['m', 'મ', 'म'],
  ['y', 'ય', 'य'],
  ['r', 'ર', 'र'],
  ['l', 'લ', 'ल'],
  ['v', 'વ', 'व'],
  ['w', 'વ', 'व'],
  ['s', 'સ', 'स'],
  ['h', 'હ', 'ह'],
  ['c', 'ક', 'क'],
  ['z', 'ઝ', 'ज़'],
];

const VOWEL_MATRAS: [string, string, string, string, string][] = [
  // [rom, guInit, guMatra, hiInit, hiMatra]
  ['aa', 'આ', 'ા', 'आ', 'ा'],
  ['ai', 'ઐ', 'ૈ', 'ऐ', 'ै'],
  ['au', 'ઔ', 'ૌ', 'औ', 'ौ'],
  ['ee', 'ઈ', 'ી', 'ई', 'ी'],
  ['oo', 'ઊ', 'ૂ', 'ऊ', 'ू'],
  ['ou', 'ઔ', 'ૌ', 'औ', 'ौ'],
  ['ae', 'ઍ', 'ૅ', 'ऑ', 'ॉ'],
  ['a', 'અ', '', 'अ', ''],
  ['e', 'એ', 'ે', 'ए', 'े'],
  ['i', 'ઇ', 'િ', 'इ', 'ि'],
  ['o', 'ઓ', 'ો', 'ओ', 'ो'],
  ['u', 'ઉ', 'ુ', 'उ', 'ु'],
];

const phoneticConvertWord = (word: string, lang: 'gu' | 'hi'): string => {
  let str = word.toLowerCase();
  let result = '';
  let i = 0;

  while (i < str.length) {
    // Check if character is non-alphabet (space, dot, dash)
    if (!/[a-z]/.test(str[i])) {
      result += str[i];
      i++;
      continue;
    }

    // Check consonant match
    let matchedCons: [string, string, string] | null = null;
    for (const c of CONSONANTS) {
      if (str.startsWith(c[0], i)) {
        matchedCons = c;
        break;
      }
    }

    if (matchedCons) {
      const consChar = lang === 'gu' ? matchedCons[1] : matchedCons[2];
      i += matchedCons[0].length;

      // Check following vowel
      let matchedVowel: [string, string, string, string, string] | null = null;
      for (const v of VOWEL_MATRAS) {
        if (str.startsWith(v[0], i)) {
          matchedVowel = v;
          break;
        }
      }

      if (matchedVowel) {
        const matra = lang === 'gu' ? matchedVowel[2] : matchedVowel[4];
        result += consChar + matra;
        i += matchedVowel[0].length;
      } else {
        result += consChar;
      }
    } else {
      // Standalone initial vowel
      let matchedVowel: [string, string, string, string, string] | null = null;
      for (const v of VOWEL_MATRAS) {
        if (str.startsWith(v[0], i)) {
          matchedVowel = v;
          break;
        }
      }

      if (matchedVowel) {
        const initVowel = lang === 'gu' ? matchedVowel[1] : matchedVowel[3];
        result += initVowel;
        i += matchedVowel[0].length;
      } else {
        result += str[i];
        i++;
      }
    }
  }

  return result;
};

export const formatChildName = (rawName: string | undefined | null, lang: AppLanguage): string => {
  if (!rawName || !rawName.trim()) return '';

  const trimmed = rawName.trim();

  // If a slug, avatar identifier, or default star alias is used, localize to the active language
  const defaultAliases = new Set([
    'avatar_3d_boy',
    'null',
    'undefined',
    'little star',
    'નાનો તારો',
    'छोटा तारा',
  ]);
  if (defaultAliases.has(trimmed.toLowerCase()) || trimmed.startsWith('avatar_')) {
    return lang === 'gu' ? 'નાનો તારો' : lang === 'hi' ? 'छोटा तारा' : 'Little Star';
  }

  // If already written in Gujarati script
  const isGujarati = /[\u0A80-\u0AFF]/.test(trimmed);
  if (isGujarati) {
    if (lang === 'gu') return trimmed;
    if (lang === 'hi') return convertGujaratiToDevanagari(trimmed);
    return trimmed;
  }

  // If already written in Devanagari Hindi script
  const isHindi = /[\u0900-\u097F]/.test(trimmed);
  if (isHindi) {
    if (lang === 'hi') return trimmed;
    if (lang === 'gu') return convertDevanagariToGujarati(trimmed);
    return trimmed;
  }

  // English letters: If requested language is English, keep capital casing
  if (lang === 'en') {
    return trimmed
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  // Transliterate to Gujarati or Hindi
  const words = trimmed.split(/\s+/);
  const convertedWords = words.map((word) => {
    const lower = word.toLowerCase();
    if (COMMON_NAMES[lower]) {
      return lang === 'gu' ? COMMON_NAMES[lower].gu : COMMON_NAMES[lower].hi;
    }
    return phoneticConvertWord(word, lang === 'gu' ? 'gu' : 'hi');
  });

  return convertedWords.join(' ');
};
