/**
 * Bundled nursery rhymes: offline fallback cache for the Rhymes studio.
 * When online, rhymes from the Django API (/api/rhymes/) take precedence;
 * see apiService.fetchRhymes and mapBackendRhyme below.
 */

export type RhymeCategoryLang = 'en' | 'gu' | 'hi';

export interface RhymeLine {
  main: string;
  sub?: string;
  subHi?: string;
  subGu?: string;
  subEn?: string;
}

export interface RhymeItem {
  id: string;
  categoryLang: RhymeCategoryLang;
  title: string;
  titleSecondary?: string;
  titleSecondaryGu?: string;
  titleSecondaryHi?: string;
  titleSecondaryEn?: string;
  themeEmoji: string;
  colorBg: string;
  colorBorder: string;
  colorAccent: string;
  lines: RhymeLine[];
  audioUrl?: string;
  cueTimestamps?: number[];
}

export function getRhymeDisplayTitleSecondary(rhyme: RhymeItem, appLang: 'gu' | 'hi' | 'en'): string {
  if (appLang === 'hi') {
    if (rhyme.titleSecondaryHi) return rhyme.titleSecondaryHi;
    if (rhyme.categoryLang === 'hi') return '';
    if (rhyme.titleSecondary && !/[\u0A80-\u0AFF]/.test(rhyme.titleSecondary)) return rhyme.titleSecondary;
    return '';
  }
  if (appLang === 'gu') {
    return rhyme.titleSecondaryGu || rhyme.titleSecondary || '';
  }
  // English mode:
  if (rhyme.categoryLang === 'en') return '';
  if (rhyme.titleSecondaryEn) return rhyme.titleSecondaryEn;
  if (rhyme.titleSecondary && !/[\u0A80-\u0AFF\u0900-\u097F]/.test(rhyme.titleSecondary)) {
    return rhyme.titleSecondary;
  }
  return '';
}

export function getRhymeDisplaySubtitle(line: RhymeLine, rhymeCat: RhymeCategoryLang, appLang: 'gu' | 'hi' | 'en'): string {
  if (appLang === 'hi') {
    if (line.subHi) return line.subHi;
    // Never show Gujarati script in Hindi mode:
    if (line.sub && /[\u0A80-\u0AFF]/.test(line.sub)) {
      return line.subEn || '';
    }
    return line.sub || '';
  }
  if (appLang === 'gu') {
    if (line.subGu) return line.subGu;
    return line.sub || '';
  }
  // English mode:
  if (line.subEn) return line.subEn;
  // Never show Gujarati or Hindi script in pure English mode:
  if (line.sub && /[\u0A80-\u0AFF\u0900-\u097F]/.test(line.sub)) {
    return '';
  }
  return line.sub || '';
}

/**
 * Rhymes withdrawn for licensing reasons (see AUDIO_PROVENANCE.md, Category B) and replaced
 * with public-domain rhymes. Filtered out of backend responses and on-device caches, so an
 * old database row or an install that cached them before the update never shows them again.
 */
export const RETIRED_RHYME_IDS: ReadonlySet<string> = new Set(['lakdi-kathi', 'chanda-mama', 'titli', 'bus-wheels']);

export const isRetiredRhymeId = (id?: string | null): boolean => !!id && RETIRED_RHYME_IDS.has(id);

export const RHYMES_DATA: RhymeItem[] = [
  // ==========================================
  // 1. ENGLISH NURSERY RHYMES (8 Beloved Songs)
  // ==========================================
  {
    id: 'twinkle',
    categoryLang: 'en',
    title: 'Twinkle, Twinkle, Little Star ⭐',
    titleSecondary: 'ઝબૂક ઝબૂક નાનો તારો',
    titleSecondaryHi: 'टिमटिम करता छोटा तारा',
    titleSecondaryGu: 'ઝબૂક ઝબૂક નાનો તારો',
    titleSecondaryEn: 'Twinkle Little Star',
    themeEmoji: '⭐',
    colorBg: '#FEF3C7',
    colorBorder: '#FDE68A',
    colorAccent: '#D97706',
    audioUrl: '/media/rhymes/audio/twinkle.mp3',
    cueTimestamps: [0, 3.5, 7.0, 10.5, 14.0, 17.5],
    lines: [
      {
        main: 'Twinkle, twinkle, little star,',
        sub: 'ઝબૂક ઝબૂક ચમકતા નાના તારા,',
        subHi: 'टिमटिम करते छोटे तारे,',
      },
      {
        main: 'How I wonder what you are!',
        sub: 'મને નવાઈ લાગે છે કે તું શું છે!',
        subHi: 'कितने सुंदर लगते हो तुम सारे!',
      },
      {
        main: 'Up above the world so high,',
        sub: 'આ દુનિયાથી ઘણે ઊંચે આકાશમાં,',
        subHi: 'दुनिया से तुम बहुत ऊंचे,',
      },
      {
        main: 'Like a diamond in the sky!',
        sub: 'આકાશમાં જાણે કોઈ હીરો ચમકતો હોય!',
        subHi: 'आसमान में हीरे जैसे चमकते!',
      },
      {
        main: 'Twinkle, twinkle, little star,',
        sub: 'ઝબૂક ઝબૂક ચમકતા નાના તારા,',
        subHi: 'टिमटिम करते छोटे तारे,',
      },
      {
        main: 'How I wonder what you are!',
        sub: 'મને નવાઈ લાગે છે કે તું શું છે!',
        subHi: 'कितने सुंदर लगते हो तुम सारे!',
      },
    ],
  },
  {
    id: 'johny',
    categoryLang: 'en',
    title: 'Johny Johny Yes Papa 🍬',
    titleSecondary: 'જોની જોની હા પપ્પા',
    titleSecondaryHi: 'जॉनी जॉनी हाँ पापा',
    titleSecondaryGu: 'જોની જોની હા પપ્પા',
    titleSecondaryEn: 'Johny Johny Yes Papa',
    themeEmoji: '🍬',
    colorBg: '#FDF2F8',
    colorBorder: '#FCE7F3',
    colorAccent: '#DB2777',
    audioUrl: '/media/rhymes/audio/johny.mp3',
    cueTimestamps: [0, 3.2, 6.4, 9.6],
    lines: [
      {
        main: 'Johny, Johny, Yes, Papa?',
        sub: 'જોની, જોની, હા, પપ્પા?',
        subHi: 'जॉनी, जॉनी, हाँ, पापा?',
      },
      {
        main: 'Eating sugar? No, Papa!',
        sub: 'ખાંડ ખાય છે? ના, પપ્પા!',
        subHi: 'चीनी खाई? ना, पापा!',
      },
      {
        main: 'Telling lies? No, Papa!',
        sub: 'ખોટું બોલે છે? ના, પપ્પા!',
        subHi: 'झूठ बोले? ना, पापा!',
      },
      {
        main: 'Open your mouth, Ha! Ha! Ha!',
        sub: 'તારું મોઢું ખોલ, હા! હા! હા!',
        subHi: 'मुंह खोलो, हा! हा! हा!',
      },
    ],
  },
  {
    id: 'black-sheep',
    categoryLang: 'en',
    title: 'Baa Baa Black Sheep 🐑',
    titleSecondary: 'બા બા કાળી ઘેટાં',
    titleSecondaryHi: 'बाबा काली भेड़',
    titleSecondaryGu: 'બા બા કાળી ઘેટાં',
    titleSecondaryEn: 'Baa Baa Black Sheep',
    themeEmoji: '🐑',
    colorBg: '#F1F5F9',
    colorBorder: '#CBD5E1',
    colorAccent: '#475569',
    audioUrl: '/media/rhymes/audio/black-sheep.mp3',
    cueTimestamps: [0, 4.5, 9.0, 13.5],
    lines: [
      {
        main: 'Baa, baa, black sheep, have you any wool?',
        sub: 'બા બા કાળી ઘેટાં, શું તારી પાસે ઊન છે?',
        subHi: 'बाबा काली भेड़, क्या तुम्हारे पास ऊन है?',
      },
      {
        main: 'Yes, sir, yes, sir, three bags full!',
        sub: 'હા, સાહેબ, હા, સાહેબ, ત્રણ કોથળા ભરેલા!',
        subHi: 'हाँ जी, हाँ जी, तीन बोरियां भरी!',
      },
      {
        main: 'One for the master, and one for the dame,',
        sub: 'એક માલિક માટે અને એક શેઠાણી માટે,',
        subHi: 'एक मालिक के लिए और एक मालकिन के लिए,',
      },
      {
        main: 'And one for the little boy who lives down the lane!',
        sub: 'અને એક ગલીમાં રહેતા નાના બાળક માટે!',
        subHi: 'और एक गली में रहने वाले छोटे बच्चे के लिए!',
      },
    ],
  },
  {
    id: 'humpty',
    categoryLang: 'en',
    title: 'Humpty Dumpty 🥚',
    titleSecondary: 'હમ્પ્ટી ડમ્પ્ટી',
    titleSecondaryHi: 'हम्प्टी डम्प्टी',
    titleSecondaryGu: 'હમ્પ્ટી ડમ્પ્ટી',
    titleSecondaryEn: 'Humpty Dumpty',
    themeEmoji: '🥚',
    colorBg: '#FFFBEB',
    colorBorder: '#FDE68A',
    colorAccent: '#B45309',
    audioUrl: '/media/rhymes/audio/humpty.mp3',
    cueTimestamps: [0, 3.2, 6.5, 9.8],
    lines: [
      {
        main: 'Humpty Dumpty sat on a wall,',
        sub: 'હમ્પ્ટી ડમ્પ્ટી દીવાલ પર બેઠો હતો,',
        subHi: 'हम्प्टी डम्प्टी दीवार पर बैठा था,',
      },
      {
        main: 'Humpty Dumpty had a great fall!',
        sub: 'હમ્પ્ટી ડમ્પ્ટી નીચે જોરથી પડ્યો!',
        subHi: 'हम्प्टी डम्प्टी नीचे धड़ाम से गिरा!',
      },
      {
        main: "All the king's horses and all the king's men,",
        sub: 'રાજાના બધા ઘોડા અને સિપાહીઓ,',
        subHi: 'राजा के सारे घोड़े और सारे सिपाही,',
      },
      {
        main: "Couldn't put Humpty together again!",
        sub: 'હમ્પ્ટીને ફરીથી સાજો કરી શક્યા નહિ!',
        subHi: 'हम्प्टी को दोबारा जोड़ नहीं पाए!',
      },
    ],
  },
  {
    id: 'jack-jill',
    categoryLang: 'en',
    title: 'Jack and Jill 👦👧',
    titleSecondary: 'જેક અને જિલ',
    titleSecondaryHi: 'जैक और जिल',
    titleSecondaryGu: 'જેક અને જિલ',
    titleSecondaryEn: 'Jack and Jill',
    themeEmoji: '👦',
    colorBg: '#EFF6FF',
    colorBorder: '#DBEAFE',
    colorAccent: '#2563EB',
    audioUrl: '/media/rhymes/audio/jack-jill.mp3',
    cueTimestamps: [0, 3.5, 7.0, 10.5],
    lines: [
      {
        main: 'Jack and Jill went up the hill,',
        sub: 'જેક અને જિલ ટેકરી પર ચડ્યા,',
        subHi: 'जैक और जिल पहाड़ी पर चढ़े,',
      },
      {
        main: 'To fetch a pail of water!',
        sub: 'પાણીની એક ડોલ લાવવા માટે!',
        subHi: 'एक बाल्टी पानी लाने के लिए!',
      },
      {
        main: 'Jack fell down and broke his crown,',
        sub: 'જેક નીચે પડી ગયો અને માથું અથડાયું,',
        subHi: 'जैक नीचे गिरा और सिर में चोट लगी,',
      },
      {
        main: 'And Jill came tumbling after!',
        sub: 'અને જિલ પણ પાછળ ગબડતી આવી!',
        subHi: 'और जिल भी लुढ़कती हुई पीछे आई!',
      },
    ],
  },
  {
    id: 'rain-rain',
    categoryLang: 'en',
    title: 'Rain, Rain, Go Away 🌧️',
    titleSecondary: 'વરસાદ તું જતો રહે',
    titleSecondaryHi: 'बारिश बारिश दूर जाओ',
    titleSecondaryGu: 'વરસાદ તું જતો રહે',
    titleSecondaryEn: 'Rain Go Away',
    themeEmoji: '🌧️',
    colorBg: '#ECFDF5',
    colorBorder: '#D1FAE5',
    colorAccent: '#059669',
    audioUrl: '/media/rhymes/audio/rain-rain.mp3',
    cueTimestamps: [0, 4.0, 8.0, 12.0],
    lines: [
      {
        main: 'Rain, rain, go away,',
        sub: 'વરસાદ, વરસાદ, તું જતો રહે,',
        subHi: 'बारिश, बारिश, दूर चली जाओ,',
      },
      {
        main: 'Come again another day!',
        sub: 'બીજા કોઈ દિવસે પાછો આવજે!',
        subHi: 'किसी और दिन वापस आओ!',
      },
      {
        main: 'Little children want to play,',
        sub: 'નાના બાળકોને આજે રમવું છે,',
        subHi: 'छोटे बच्चों को आज खेलना है,',
      },
      {
        main: 'Rain, rain, go away!',
        sub: 'વરસાદ, વરસાદ, તું જતો રહે!',
        subHi: 'बारिश, बारिश, दूर चली जाओ!',
      },
    ],
  },
  {
    // Replaces "The Wheels on the Bus" (modern arrangement, licensing flagged in AUDIO_PROVENANCE.md).
    // "Row, Row, Row Your Boat": published 1852 (Eliphalet Oram Lyte), public domain.
    id: 'row-boat',
    categoryLang: 'en',
    title: 'Row, Row, Row Your Boat ⛵',
    titleSecondary: 'હોડી ચલાવો',
    titleSecondaryHi: 'अपनी नाव चलाओ',
    titleSecondaryGu: 'હોડી ચલાવો',
    titleSecondaryEn: 'Row, Row, Row Your Boat',
    themeEmoji: '⛵',
    colorBg: '#FFF7ED',
    colorBorder: '#FFEDD5',
    colorAccent: '#EA580C',
    // No audioUrl yet: shown as "Coming Soon" until a public-domain recording is produced.
    lines: [
      {
        main: 'Row, row, row your boat,',
        sub: 'હલેસાં મારો, હોડી ચલાવો,',
        subHi: 'चलाओ, चलाओ, अपनी नाव चलाओ,',
      },
      {
        main: 'Gently down the stream.',
        sub: 'ધીમે ધીમે ઝરણાની સાથે.',
        subHi: 'धीरे-धीरे धारा के साथ।',
      },
      {
        main: 'Merrily, merrily, merrily, merrily,',
        sub: 'ખુશીથી, ખુશીથી, ખુશીથી, ખુશીથી,',
        subHi: 'खुशी से, खुशी से, खुशी से, खुशी से,',
      },
      {
        main: 'Life is but a dream!',
        sub: 'જીવન તો એક સપનું છે!',
        subHi: 'जीवन बस एक सपना है!',
      },
    ],
  },
  {
    id: 'old-macdonald',
    categoryLang: 'en',
    title: 'Old MacDonald Had a Farm 🚜',
    titleSecondary: 'મેકડોનાલ્ડનું ફાર્મ',
    titleSecondaryHi: 'ओल्ड मैकडोनाल्ड का फार्म',
    titleSecondaryGu: 'મેકડોનાલ્ડનું ફાર્મ',
    titleSecondaryEn: 'Old MacDonald Had a Farm',
    themeEmoji: '🚜',
    colorBg: '#F0FDF4',
    colorBorder: '#DCFCE7',
    colorAccent: '#16A34A',
    audioUrl: '/media/rhymes/audio/old-macdonald.mp3',
    cueTimestamps: [0, 5.5, 11.5, 17.5],
    lines: [
      {
        main: 'Old MacDonald had a farm, E-I-E-I-O!',
        sub: 'ઓલ્ડ મેકડોનાલ્ડનું એક ફાર્મ હતું, ઈ-આઈ-ઈ-આઈ-ઓ!',
        subHi: 'ओल्ड मैकडोनाल्ड का एक खेत था, ई-आई-ई-आई-ओ!',
      },
      {
        main: 'And on that farm he had a cow, E-I-E-I-O!',
        sub: 'અને એ ફાર્મમાં એક ગાય હતી, ઈ-આઈ-ઈ-આઈ-ઓ!',
        subHi: 'और उस खेत में एक गाय थी, ई-आई-ई-आई-ओ!',
      },
      {
        main: 'With a moo-moo here and a moo-moo there,',
        sub: 'અહીં મૂ-મૂ અને ત્યાં મૂ-મૂ સાથે,',
        subHi: 'यहाँ मू-मू और वहाँ मू-मू के साथ,',
      },
      {
        main: 'Everywhere a moo-moo, E-I-E-I-O!',
        sub: 'ચારે બાજુ મૂ-મૂ, ઈ-આઈ-ઈ-આઈ-ઓ!',
        subHi: 'चारों तरफ मू-मू, ई-आई-ई-आई-ओ!',
      },
    ],
  },

  // ==========================================
  // 2. GUJARATI RHYMES (4 Famous Balgeeto)
  // ==========================================
  {
    id: 'chakiben',
    categoryLang: 'gu',
    title: 'ચકીબેન ચકીબેન 🐦',
    titleSecondary: 'Chakiben Chakiben',
    themeEmoji: '🐦',
    colorBg: '#FEF3C7',
    colorBorder: '#FDE68A',
    colorAccent: '#D97706',
    audioUrl: '/media/rhymes/audio/chakiben.mp3',
    cueTimestamps: [0, 14.0, 27.0, 36.0],
    lines: [
      {
        main: 'ચકીબેન ચકીબેન મારી સાથે રમવા આવશો કે નહિ?',
        sub: 'Chakiben Chakiben, will you play with me or not?',
      },
      {
        main: 'ચકીબેન ચકીબેન મારી સાથે રમવા આવશો કે નહિ?',
        sub: 'Chakiben Chakiben, will you play with me or not?',
      },
      {
        main: 'બેસવાને પાટલો ને સુવાને ખાટલો!',
        sub: 'A stool to sit and a cot to sleep!',
      },
      {
        main: 'ઓઢવાને પીંછા આપીશ તને!',
        sub: 'Soft feathers to keep you warm!',
      },
    ],
  },
  {
    id: 'dhingli',
    categoryLang: 'gu',
    title: 'ઢીંગલી મારી બોલતી નથી 🎎',
    titleSecondary: 'Dhingli Mari Bolti Nathi',
    themeEmoji: '🎎',
    colorBg: '#FDF2F8',
    colorBorder: '#FCE7F3',
    colorAccent: '#DB2777',
    audioUrl: '/media/rhymes/audio/dhingli.mp3',
    cueTimestamps: [0, 14.0, 29.0, 40.0],
    lines: [
      {
        main: 'ખાતી નથી, પીતી નથી, ઢીંગલી મારી બોલતી નથી!',
        sub: 'Does not eat, does not drink, my doll does not speak!',
      },
      {
        main: 'બોલ બા બોલ, એને કેમ રે બોલાવું?',
        sub: 'Tell me mom, how should I make her speak?',
      },
      {
        main: 'ડોલમાં બેસાડી એને નવરાવું!',
        sub: 'I make her bathe in a little tub!',
      },
      {
        main: 'ચંપાના ફૂલની વેણી ગૂંથાવું!',
        sub: 'I weave a jasmine garland for her hair!',
      },
    ],
  },
  {
    id: 'ekdo-salekhdo',
    categoryLang: 'gu',
    title: 'એકડો સાવ સળેખડો 🔢',
    titleSecondary: 'Ekdo Saav Salekhdo',
    themeEmoji: '🔢',
    colorBg: '#EFF6FF',
    colorBorder: '#DBEAFE',
    colorAccent: '#2563EB',
    audioUrl: '/media/rhymes/audio/ekdo-salekhdo.mp3',
    cueTimestamps: [0, 13.0, 24.0, 32.0],
    lines: [
      {
        main: 'એકડો સાવ સળેખડો ને બગડો ડીલે તગડો!',
        sub: 'Number 1 is like a stick, and 2 is plump and thick!',
      },
      {
        main: 'બંને બાથમબાથી કરતા કરતા મોટો ઝગડો!',
        sub: 'Both wrestled together in a big playful fight!',
      },
      {
        main: 'તગડો તાળી પાડે ને નાચે તા થઈ થઈ!',
        sub: 'Number 3 clapped hands and danced with joy!',
      },
      {
        main: 'ચોગડાની ઢીલી ચડ્ડી સરરર ઉતરી ગઈ!',
        sub: 'Number 4 lost his loose shorts with a whoosh!',
      },
    ],
  },
  {
    id: 'aav-re-varsad',
    categoryLang: 'gu',
    title: 'આવ રે વરસાદ 🌧️',
    titleSecondary: 'Aav Re Varsad',
    themeEmoji: '🌧️',
    colorBg: '#ECFDF5',
    colorBorder: '#D1FAE5',
    colorAccent: '#059669',
    audioUrl: '/media/rhymes/audio/aav-re-varsad.mp3',
    cueTimestamps: [0, 7.5, 16.5, 26.5],
    lines: [
      {
        main: 'આવ રે વરસાદ, ઘેબરિયો પરસાદ!',
        sub: 'Come, gentle rain, bring puddles and grain!',
      },
      {
        main: 'ઊની ઊની રોટલી ને કારેલાનું શાક!',
        sub: 'Warm fresh rotli and tasty green veg!',
      },
      {
        main: 'નદી નાળા રેલમ છેલ, પાણી જાય સરસર સર!',
        sub: 'Rivers overflow and water flows fast!',
      },
      {
        main: 'આવ રે વરસાદ, ઘેબરિયો પરસાદ!',
        sub: 'Come, gentle rain, bring puddles and grain!',
      },
    ],
  },

  // ==========================================
  // 3. HINDI RHYMES (5 Famous Balgeet)
  // ==========================================
  {
    id: 'machli',
    categoryLang: 'hi',
    title: 'मछली जल की रानी है 🐟',
    titleSecondary: 'Machli Jal Ki Rani Hai',
    titleSecondaryHi: 'मछली जल की रानी है',
    titleSecondaryGu: 'માછલી જળની રાણી છે',
    titleSecondaryEn: 'Machli Jal Ki Rani Hai',
    themeEmoji: '🐟',
    colorBg: '#E0F2FE',
    colorBorder: '#BAE6FD',
    colorAccent: '#0284C7',
    audioUrl: '/media/rhymes/audio/machli.mp3',
    cueTimestamps: [0, 7.0, 14.0],
    lines: [
      {
        main: 'मछली जल की रानी है, जीवन उसका पानी है!',
        sub: 'માછલી જળની રાણી છે, જીવન એનું પાણી છે!',
        subHi: 'मछली पानी की रानी है, पानी ही उसका जीवन है!',
        subEn: 'Fish is the queen of water, water is her life!',
      },
      {
        main: 'हाथ लगाओ तो डर जाएगी, बाहर निकालो तो मर जाएगी!',
        sub: 'હાથ અડાડો તો ડરી જશે, બહાર કાઢો તો મરી જશે!',
        subHi: 'हाथ लगाओ तो डर जाएगी, बाहर निकालो तो मर जाएगी!',
        subEn: 'Touch her and she gets scared, take her out and she dies!',
      },
      {
        main: 'पानी में डालोगे तो खुश हो जाएगी, तैर जाएगी!',
        sub: 'પાણીમાં મૂકો તો ખુશ થઈ જશે, તરી જશે!',
        subHi: 'पानी में डालोगे तो खुश हो जाएगी, तैर जाएगी!',
        subEn: 'Put her back in water and she swims happily!',
      },
    ],
  },
  {
    // Replaces "Chanda Mama Door Ke" (recording tied to the 1955 film Vachan).
    // "Ek Mota Hathi": anonymous traditional Hindi balgeet.
    id: 'mota-hathi',
    categoryLang: 'hi',
    title: 'एक मोटा हाथी 🐘',
    titleSecondary: 'Ek Mota Hathi',
    titleSecondaryHi: 'एक मोटा हाथी',
    titleSecondaryGu: 'એક જાડો હાથી',
    titleSecondaryEn: 'Ek Mota Hathi',
    themeEmoji: '🐘',
    colorBg: '#FEF3C7',
    colorBorder: '#FDE68A',
    colorAccent: '#D97706',
    lines: [
      {
        main: 'एक मोटा हाथी, झूम के चला!',
        sub: 'એક જાડો હાથી, ઝૂમતો ચાલ્યો!',
        subHi: 'एक मोटा हाथी, झूम के चला!',
        subEn: 'One big elephant went swaying along!',
      },
      {
        main: 'मकड़ी के जाले में, जा के फँसा!',
        sub: 'કરોળિયાના જાળામાં, જઈને ફસાયો!',
        subHi: 'मकड़ी के जाले में, जा के फँसा!',
        subEn: "He got caught in a spider's web!",
      },
      {
        main: 'उसने सोचा, ये तो है खेल!',
        sub: 'એણે વિચાર્યું, આ તો છે રમત!',
        subHi: 'उसने सोचा, ये तो है खेल!',
        subEn: 'He thought, "This is a fun game!"',
      },
      {
        main: 'दूसरे हाथी को भी लिया बुला!',
        sub: 'બીજા હાથીને પણ લીધો બોલાવી!',
        subHi: 'दूसरे हाथी को भी लिया बुला!',
        subEn: 'So he called another elephant to play!',
      },
    ],
  },
  {
    // Replaces "Titli Udi" (associated with the 1966 film Suraj).
    // "Upar Pankha Chalta Hai": anonymous traditional Hindi children's rhyme.
    id: 'upar-pankha',
    categoryLang: 'hi',
    title: 'ऊपर पंखा चलता है 😴',
    titleSecondary: 'Upar Pankha Chalta Hai',
    titleSecondaryHi: 'ऊपर पंखा चलता है',
    titleSecondaryGu: 'ઉપર પંખો ચાલે છે',
    titleSecondaryEn: 'Upar Pankha Chalta Hai',
    themeEmoji: '😴',
    colorBg: '#FDF2F8',
    colorBorder: '#FCE7F3',
    colorAccent: '#DB2777',
    lines: [
      {
        main: 'ऊपर पंखा चलता है, नीचे मुन्ना सोता है!',
        sub: 'ઉપર પંખો ચાલે છે, નીચે મુન્નો સૂએ છે!',
        subHi: 'ऊपर पंखा चलता है, नीचे मुन्ना सोता है!',
        subEn: 'The fan goes round up high, the little one sleeps below!',
      },
      {
        main: 'सोते-सोते भूख लगी, खा लो बेटा मूँगफली!',
        sub: 'સૂતાં-સૂતાં ભૂખ લાગી, ખાઈ લે બેટા મગફળી!',
        subHi: 'सोते-सोते भूख लगी, खा लो बेटा मूँगफली!',
        subEn: 'Sleepy and hungry: "Have some peanuts, dear!"',
      },
      {
        main: 'मूँगफली में दाना नहीं, हम तुम्हारे मामा नहीं!',
        sub: 'મગફળીમાં દાણો નહીં, અમે તમારા મામા નહીં!',
        subHi: 'मूँगफली में दाना नहीं, हम तुम्हारे मामा नहीं!',
        subEn: 'No nut inside the shell, and we are not your uncle!',
      },
      {
        main: 'मामा गए दिल्ली, वहाँ से लाए बिल्ली!',
        sub: 'મામા ગયા દિલ્હી, ત્યાંથી લાવ્યા બિલાડી!',
        subHi: 'मामा गए दिल्ली, वहाँ से लाए बिल्ली!',
        subEn: 'Uncle went to Delhi and brought back a kitty!',
      },
    ],
  },
  {
    // Replaces "Lakdi Ki Kathi" (1983 film Masoom; Gulzar / R.D. Burman).
    // "Bandar Mama Pahan Pajama": traditional Hindi balgeet.
    id: 'bandar-mama',
    categoryLang: 'hi',
    title: 'बंदर मामा पहन पजामा 🐒',
    titleSecondary: 'Bandar Mama Pahan Pajama',
    titleSecondaryHi: 'बंदर मामा पहन पजामा',
    titleSecondaryGu: 'વાંદરા મામા પહેરી પાયજામો',
    titleSecondaryEn: 'Bandar Mama Pahan Pajama',
    themeEmoji: '🐒',
    colorBg: '#FEF9C3',
    colorBorder: '#FEF08A',
    colorAccent: '#CA8A04',
    lines: [
      {
        main: 'बंदर मामा पहन पजामा, दावत खाने आए!',
        sub: 'વાંદરા મામા પહેરી પાયજામો, જમણ જમવા આવ્યા!',
        subHi: 'बंदर मामा पहन पजामा, दावत खाने आए!',
        subEn: 'Uncle Monkey put on his pyjamas and came to a feast!',
      },
      {
        main: 'ढीला कुर्ता, टोपी, जूता, पहन बहुत इतराए!',
        sub: 'ઢીલો કુર્તો, ટોપી, જૂતાં, પહેરી ખૂબ હરખાયા!',
        subHi: 'ढीला कुर्ता, टोपी, जूता, पहन बहुत इतराए!',
        subEn: 'Loose kurta, cap and shoes: he felt so very proud!',
      },
      {
        main: 'रसगुल्ले पर जी ललचाया, मुँह में रखा गप से!',
        sub: 'રસગુલ્લા પર મન લલચાયું, મોંમાં મૂક્યો ઝટથી!',
        subHi: 'रसगुल्ले पर जी ललचाया, मुँह में रखा गप से!',
        subEn: 'He longed for a rasgulla and popped it in his mouth!',
      },
    ],
  },
  {
    id: 'aalu-kachalu',
    categoryLang: 'hi',
    title: 'आलू कचालू बेटा कहां गए थे 🥔',
    titleSecondary: 'Aalu Kachalu Kahan Gaye The',
    titleSecondaryHi: 'आलू कचालू बेटा कहां गए थे',
    titleSecondaryGu: 'બટાકા બેટા ક્યાં ગયા હતા',
    titleSecondaryEn: 'Aalu Kachalu Kahan Gaye The',
    themeEmoji: '🥔',
    colorBg: '#FFEDD5',
    colorBorder: '#FED7AA',
    colorAccent: '#EA580C',
    audioUrl: '/media/rhymes/audio/aalu-kachalu.mp3',
    cueTimestamps: [0, 6.0, 12.5, 22.0],
    lines: [
      {
        main: 'आलू कचालू बेटा कहां गए थे?',
        sub: 'બટાકા બેટા ક્યાં ગયા હતા?',
        subHi: 'आलू कचालू बेटा कहां गए थे?',
        subEn: 'Little Potato, where had you gone?',
      },
      {
        main: 'बैंगन की टोकरी में सो रहे थे!',
        sub: 'રીંગણની ટોપલીમાં સૂતા હતા!',
        subHi: 'बैंगन की टोकरी में सो रहे थे!',
        subEn: 'Sleeping peacefully in the brinjal basket!',
      },
      {
        main: 'बैंगन ने लात मारी रो रहे थे, मम्मी ने प्यार किया हंस रहे थे!',
        sub: 'રીંગણે લાત મારી રડતા હતા, મમ્મીએ વહાલ કર્યું હસતા હતા!',
        subHi: 'बैंगन ने लात मारी रो रहे थे, मम्मी ने प्यार किया हंस रहे थे!',
        subEn: 'Brinjal kicked and he cried, Mom loved him and he smiled!',
      },
      {
        main: 'पापा ने पैसे दिए नाच रहे थे, भैया ने लड्डू दिए खा रहे थे!',
        sub: 'પપ્પાએ પૈસા આપ્યા નાચતા હતા, ભાઈએ લાડવો આપ્યો ખાતા હતા!',
        subHi: 'पापा ने पैसे दिए नाच रहे थे, भैया ने लड्डू दिए खा रहे थे!',
        subEn: 'Papa gave coins and he danced, Brother gave sweets and he ate!',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Backend (Django /api/rhymes/) -> UI mapping
// ---------------------------------------------------------------------------

/** Shape returned by backend/rhymes/serializers.py (RhymeSerializer). */
export interface BackendRhyme {
  slug: string;
  title?: string;
  title_gujarati?: string;
  title_hindi?: string;
  category?: string;
  lyrics_english?: string;
  lyrics_gujarati?: string;
  lyrics_hindi?: string;
  audio_url?: string;
  cover_image?: string;
  order?: number;
  is_active?: boolean;
}

const RHYME_PALETTE = [
  { colorBg: '#FEF3C7', colorBorder: '#FDE68A', colorAccent: '#D97706' },
  { colorBg: '#E0F2FE', colorBorder: '#BAE6FD', colorAccent: '#0284C7' },
  { colorBg: '#ECFDF5', colorBorder: '#A7F3D0', colorAccent: '#059669' },
  { colorBg: '#FAF5FF', colorBorder: '#E9D5FF', colorAccent: '#7C3AED' },
  { colorBg: '#FFE4E6', colorBorder: '#FECDD3', colorAccent: '#E11D48' },
];

/** Which language a rhyme's translation line is shown in, per primary language. */
const SECONDARY_LANG: Record<RhymeCategoryLang, RhymeCategoryLang> = { en: 'gu', gu: 'en', hi: 'gu' };

const splitLyrics = (text?: string): string[] =>
  (text || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

const lyricsFor = (r: BackendRhyme, lang: RhymeCategoryLang): string[] =>
  splitLyrics(lang === 'en' ? r.lyrics_english : lang === 'gu' ? r.lyrics_gujarati : r.lyrics_hindi);

const detectScript = (s: string): RhymeCategoryLang | null => {
  if (/[઀-૿]/.test(s)) return 'gu';
  if (/[ऀ-ॿ]/.test(s)) return 'hi';
  return null;
};

export const resolveRhymeLang = (r: BackendRhyme, local?: RhymeItem): RhymeCategoryLang => {
  const cat = (r.category || '').toLowerCase();
  if (cat === 'en' || cat === 'english') return 'en';
  if (cat === 'gu' || cat === 'gujarati') return 'gu';
  if (cat === 'hi' || cat === 'hindi') return 'hi';
  if (local) return local.categoryLang;
  return detectScript(r.title || '') || 'en';
};

/**
 * Converts one backend rhyme into the UI shape. Returns null when the backend
 * row has no lyrics and there is no bundled rhyme with the same id to fall back on.
 */
export function mapBackendRhyme(r: BackendRhyme, index: number, local?: RhymeItem): RhymeItem | null {
  const lang = resolveRhymeLang(r, local);
  const mainLines = lyricsFor(r, lang);
  if (mainLines.length === 0) return local || null;

  let subLines = lyricsFor(r, SECONDARY_LANG[lang]);
  if (subLines.length === 0) {
    const other = (['en', 'gu', 'hi'] as RhymeCategoryLang[]).find((l) => l !== lang && lyricsFor(r, l).length > 0);
    subLines = other ? lyricsFor(r, other) : [];
  }

  const primaryTitle =
    (lang === 'gu' ? r.title_gujarati : lang === 'hi' ? r.title_hindi : r.title) || r.title || local?.title || r.slug;
  const secondaryTitle =
    lang === 'en' ? r.title_gujarati || local?.titleSecondary : r.title && r.title !== primaryTitle ? r.title : local?.titleSecondary;
  const style = local || RHYME_PALETTE[index % RHYME_PALETTE.length];

  return {
    id: r.slug,
    categoryLang: lang,
    title: primaryTitle,
    titleSecondary: secondaryTitle || undefined,
    themeEmoji: r.cover_image && r.cover_image.length <= 4 ? r.cover_image : local?.themeEmoji || '🎵',
    colorBg: style.colorBg,
    colorBorder: style.colorBorder,
    colorAccent: style.colorAccent,
    lines: mainLines.map((main, i) => ({ main, sub: subLines[i] })),
    audioUrl: r.audio_url || local?.audioUrl,
    cueTimestamps: local?.cueTimestamps,
  };
}

/** Maps a backend list (already ordered by the API) using bundled rhymes to fill gaps. */
export function mapBackendRhymes(list: BackendRhyme[], fallback: RhymeItem[] = RHYMES_DATA): RhymeItem[] {
  const byId = new Map(fallback.map((r) => [r.id, r]));
  return list
    .filter((r) => r && r.slug && r.is_active !== false && !isRetiredRhymeId(r.slug))
    .map((r, i) => mapBackendRhyme(r, i, byId.get(r.slug)))
    .filter((r): r is RhymeItem => r !== null);
}

/** Flattens a bundled rhyme into the backend serializer's field layout (used by the data exporter). */
export function toBackendRhyme(r: RhymeItem, order: number): BackendRhyme {
  const main = r.lines.map((l) => l.main).join('\n');
  const sub = r.lines.map((l) => l.sub || '').filter(Boolean).join('\n');
  const secondary = SECONDARY_LANG[r.categoryLang];
  const field = (lang: RhymeCategoryLang) => (lang === r.categoryLang ? main : lang === secondary ? sub : '');
  return {
    slug: r.id,
    title: r.categoryLang === 'en' ? r.title : r.titleSecondary || r.title,
    title_gujarati: r.categoryLang === 'gu' ? r.title : r.categoryLang === 'en' ? r.titleSecondary || '' : '',
    title_hindi: r.categoryLang === 'hi' ? r.title : '',
    category: r.categoryLang,
    lyrics_english: field('en'),
    lyrics_gujarati: field('gu'),
    lyrics_hindi: field('hi'),
    audio_url: r.audioUrl,
    cover_image: r.themeEmoji,
    order,
    is_active: true,
  };
}