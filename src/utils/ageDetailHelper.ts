import { AgeGroup, AppLanguage, LessonItem } from '../types';
import { toGujDigits, toHiDigits } from './languageData';

export interface AgeClassBadgeInfo {
  title: string;
  subtitle: string;
  badgeLabel: string;
  tagColor: string;
  tagBg: string;
  border: string;
}

/**
 * Returns class badge information matching the child's age group.
 */
export function getAgeClassBadgeInfo(
  ageGroup: AgeGroup,
  language: AppLanguage,
  subject?: string
): AgeClassBadgeInfo {
  switch (ageGroup) {
    case '2-4': {
      let title =
        language === 'gu'
          ? 'સરળ પાયો'
          : language === 'hi'
          ? 'सरल आधार'
          : 'Core Foundation';
      let subtitle =
        language === 'gu'
          ? 'ચિત્ર અને અવાજ સાથે મૂળભૂત ઓળખ'
          : language === 'hi'
          ? 'चित्र और आवाज़ के साथ बुनियादी पहचान'
          : 'Visual recognition & basic sounds';

      if (subject === 'math') {
        title = language === 'gu' ? 'અંક ઓળખ' : language === 'hi' ? 'अंक पहचान' : 'Number Fun';
        subtitle =
          language === 'gu'
            ? 'ચિત્ર ગણતરી અને ૧ થી ૧૦ અંકો'
            : language === 'hi'
            ? 'चित्र गणना और १ से १० अंक'
            : 'Count objects & numbers 1-10';
      } else if (subject === 'science') {
        title = language === 'gu' ? 'કુદરત અને પ્રાણીઓ' : language === 'hi' ? 'प्रकृति और जीव' : 'Nature & Animals';
        subtitle =
          language === 'gu'
            ? 'પ્રાણીઓ, પક્ષીઓ અને ફળોની સરળ ઓળખ'
            : language === 'hi'
            ? 'जानवर, पक्षी और फलों की सरल पहचान'
            : 'Explore animals, birds & fruits';
      } else if (subject === 'english') {
        title = language === 'gu' ? 'મૂળાક્ષર પાયો' : language === 'hi' ? 'वर्णमाला आधार' : 'Alphabet Basics';
        subtitle =
          language === 'gu'
            ? 'A થી Z અક્ષરો અને અંગ્રેજી બાળગીતો'
            : language === 'hi'
            ? 'A से Z अक्षर और अंग्रेजी बालगीत'
            : 'A to Z letters and simple rhymes';
      } else if (subject === 'gk') {
        title = language === 'gu' ? 'આપણી દુનિયા' : language === 'hi' ? 'हमारी दुनिया' : 'Our World';
        subtitle =
          language === 'gu'
            ? 'રાષ્ટ્રીય પ્રતીકો, વાહનો અને પરિચય'
            : language === 'hi'
            ? 'राष्ट्रीय प्रतीक, वाहन और बुनियादी ज्ञान'
            : 'Symbols, vehicles & world basics';
      } else if (subject === 'logic') {
        title = language === 'gu' ? 'પેટર્ન અને પઝલ' : language === 'hi' ? 'पैटर्न और पहेली' : 'Patterns & Puzzles';
        subtitle =
          language === 'gu'
            ? 'સરળ આકારો, રંગો અને પેટર્ન ઓળખ'
            : language === 'hi'
            ? 'सरल आकार, रंग और पैटर्न पहचान'
            : 'Simple shapes, colors & pattern play';
      }

      return {
        badgeLabel:
          language === 'gu'
            ? '👶 બાલવાટિકા (નર્સરી)'
            : language === 'hi'
            ? '👶 बालवाटिका (नर्सरी)'
            : '👶 Nursery (Balvatika)',
        title,
        subtitle,
        tagColor: '#059669',
        tagBg: '#ECFDF5',
        border: '#A7F3D0',
      };
    }
    case '4-6': {
      let title =
        language === 'gu'
          ? 'શબ્દ અને ફોનિક્સ'
          : language === 'hi'
          ? 'शब्द और फोनिक्स'
          : 'Words & Phonics';
      let subtitle =
        language === 'gu'
          ? 'શબ્દ રચના, વાક્ય વપરાશ અને ફોનિક્સ અવાજ'
          : language === 'hi'
          ? 'शब्द निर्माण, वाक्य प्रयोग और फोनिक्स ध्वनि'
          : 'Spelling, sentence usage & phonics';

      if (subject === 'math') {
        title = language === 'gu' ? 'સરવાળા અને બાદબાકી' : language === 'hi' ? 'जोड़ और घटाव' : 'Add & Subtract';
        subtitle =
          language === 'gu'
            ? 'સંખ્યા ઓળખ, સરવાળા, બાદબાકી અને આકારો'
            : language === 'hi'
            ? 'संख्या पहचान, जोड़, घटाव और आकृतियां'
            : 'Number skills, basic math & shapes';
      } else if (subject === 'science') {
        title = language === 'gu' ? 'વિજ્ઞાન અને પર્યાવરણ' : language === 'hi' ? 'विज्ञान और पर्यावरण' : 'Science & Nature';
        subtitle =
          language === 'gu'
            ? 'વનસ્પતિ, માનવ શરીર, હવામાન અને પાણી'
            : language === 'hi'
            ? 'पेड़-पौधे, मानव शरीर, मौसम और जल'
            : 'Plants, human body, weather & water';
      } else if (subject === 'english') {
        title = language === 'gu' ? 'શબ્દ અને ફોનિક્સ' : language === 'hi' ? 'शब्द और फोनिक्स' : 'Words & Phonics';
        subtitle =
          language === 'gu'
            ? 'શબ્દ રચના, વાક્ય વપરાશ અને ફોનિક્સ અવાજ'
            : language === 'hi'
            ? 'शब्द निर्माण, वाक्य प्रयोग और फोनिक्स ध्वनि'
            : 'Spelling, sentence usage & phonics';
      } else if (subject === 'gk') {
        title = language === 'gu' ? 'સામાન્ય જ્ઞાન' : language === 'hi' ? 'सामान्य ज्ञान' : 'General Knowledge';
        subtitle =
          language === 'gu'
            ? 'સ્મારકો, રમતો અને સામાન્ય જ્ઞાન ક્વિઝ'
            : language === 'hi'
            ? 'स्मारक, खेल और सामान्य ज्ञान क्विज़'
            : 'Monuments, sports & trivia quiz';
      } else if (subject === 'logic') {
        title = language === 'gu' ? 'તાર્કિક વિચારણા' : language === 'hi' ? 'तार्किक विचार' : 'Logical Thinking';
        subtitle =
          language === 'gu'
            ? 'કોડિંગ-ડિકોડિંગ, કોયડા અને મગજ કસરત'
            : language === 'hi'
            ? 'कोडिंग-डिकोडिंग, पहेलियां और दिमागी खेल'
            : 'Coding-decoding, puzzles & brain games';
      }

      return {
        badgeLabel:
          language === 'gu'
            ? '👦 ધોરણ ૧-૨ (પ્રાથમિક પાયો)'
            : language === 'hi'
            ? '👦 कक्षा १-२ (प्राथमिक आधार)'
            : '👦 Class 1-2 (Junior)',
        title,
        subtitle,
        tagColor: '#2563EB',
        tagBg: '#EFF6FF',
        border: '#BFDBFE',
      };
    }
    case '6-8':
    default: {
      let title =
        language === 'gu'
          ? 'સંપૂર્ણ વિગત અને ફેક્ટ્સ'
          : language === 'hi'
          ? 'विस्तृत विवरण और रोचक तथ्य'
          : 'In-Depth Details & Facts';
      let subtitle =
        language === 'gu'
          ? 'ઊંડાણપૂર્વક વિજ્ઞાન, સામાન્ય જ્ઞાન અને તથ્યો'
          : language === 'hi'
          ? 'विज्ञान, सामान्य ज्ञान और महत्वपूर्ण तथ्य'
          : 'Comprehensive concepts, science & trivia';

      if (subject === 'math') {
        title = language === 'gu' ? 'ગણિત માસ્ટરી' : language === 'hi' ? 'गणित मास्टरी' : 'Math Mastery';
        subtitle =
          language === 'gu'
            ? 'ગુણાકાર, ભાગાકાર, સમય, નાણાં અને વ્યવહારિક ગણિત'
            : language === 'hi'
            ? 'गुणा, भाग, समय, सिक्के और व्यावहारिक गणित'
            : 'Multiplication, division, time, money & advanced math';
      } else if (subject === 'science') {
        title = language === 'gu' ? 'વિજ્ઞાન સંશોધન' : language === 'hi' ? 'विज्ञान खोज' : 'Science Discovery';
        subtitle =
          language === 'gu'
            ? 'સૌરમંડળ, પૃથ્વી અને વૈજ્ઞાનિક શોધો'
            : language === 'hi'
            ? 'सौरमंडल, पृथ्वी और वैज्ञानिक खोजें'
            : 'Solar system, earth & scientific discoveries';
      } else if (subject === 'english') {
        title = language === 'gu' ? 'અંગ્રેજી વ્યાકરણ' : language === 'hi' ? 'अंग्रेजी व्याकरण' : 'English Grammar';
        subtitle =
          language === 'gu'
            ? 'ક્રિયાપદો, વાક્ય રચના અને વાર્તા અર્થગ્રહણ'
            : language === 'hi'
            ? 'क्रियाएं, वाक्य निर्माण और कहानी बोध'
            : 'Verbs, sentence building & reading comprehension';
      } else if (subject === 'gk') {
        title = language === 'gu' ? 'વિશ્વ જ્ઞાન' : language === 'hi' ? 'विश्व ज्ञान' : 'World Knowledge';
        subtitle =
          language === 'gu'
            ? 'રાજ્યો, દેશો, ઇતિહાસ, ભૂગોળ અને મહાન વ્યક્તિઓ'
            : language === 'hi'
            ? 'राज्य, देश, इतिहास, भूगोल और महान हस्तियां'
            : 'States, countries, history, geography & personalities';
      } else if (subject === 'logic') {
        title = language === 'gu' ? 'વિવેચનાત્મક તર્ક' : language === 'hi' ? 'तार्किक सोच' : 'Critical Reasoning';
        subtitle =
          language === 'gu'
            ? 'સંખ્યા શ્રેણી, વિવેચનાત્મક વિચાર અને જટિલ કોયડા'
            : language === 'hi'
            ? 'संख्या श्रृंखला, तार्किक सोच और जटिल पहेलियां'
            : 'Number series, critical reasoning & challenge puzzles';
      }

      return {
        badgeLabel:
          language === 'gu'
            ? '🎓 ધોરણ ૩-૫ (ઊંડાણપૂર્વક માસ્ટરી)'
            : language === 'hi'
            ? '🎓 कक्षा ३-५ (गहराई से मास्टरी)'
            : '🎓 Class 3-5 (Senior Scholar)',
        title,
        subtitle,
        tagColor: '#7C3AED',
        tagBg: '#F5F3FF',
        border: '#DDD6FE',
      };
    }
  }
}

export interface EducationalFactEntry {
  gu: string;
  hi: string;
  en: string;
  aliases?: string[];
}

/**
 * Common educational fun facts across standard lessons for Class 3-5 (Age 6-8).
 */
const EDUCATIONAL_FACTS_MAP: Record<string, EducationalFactEntry> = {
  // Animals & Birds (All 20 Animals)
  lion: {
    gu: 'સિંહને જંગલનો રાજા કહેવાય છે અને ગીરનું જંગલ એશિયાટિક સિંહનું એકમાત્ર કુદરતી રહેઠાણ છે.',
    hi: 'शेर को जंगल का राजा कहा जाता है और गिर का जंगल एशियाई शेरों का एकमात्र प्राकृतिक घर है।',
    en: 'Lions live in prides, and the Gir Forest in Gujarat is the only natural home for Asiatic lions.',
  },
  cat: {
    gu: 'બિલાડી ખૂબ ચપળ પાલતુ પ્રાણી છે. તે અંધારામાં પણ માણસ કરતાં ૬ ગણું સ્પષ્ટ જોઈ શકે છે!',
    hi: 'बिल्ली एक बहुत ही फुर्तीली और प्यारी पालतू जानवर है, जो रात के अंधेरे में भी इंसानों से ६ गुना साफ़ देख सकती है!',
    en: 'Cats are agile pets that can rotate their ears 180 degrees and have exceptional night vision.',
  },
  dog: {
    gu: 'કૂતરો સૌથી વફાદાર મિત્ર ગણાય છે અને તેની સૂંઘવાની શક્તિ માણસ કરતાં ૪૦ ગણી વધુ હોય છે!',
    hi: 'कुत्ता सबसे वफादार साथी होता है और इसकी सूंघने की क्षमता इंसानों से ४० गुना अधिक तेज़ होती है!',
    en: 'Dogs have a sense of smell that is over 40 times stronger than humans!',
  },
  cow: {
    gu: 'ગાયનું દૂધ કેલ્શિયમ અને પોષક તત્ત્વોથી ભરપૂર હોય છે, જે હાડકાંને મજબૂત બનાવે છે.',
    hi: 'गाय का दूध कैल्शियम और पौष्टिकता से भरपूर होता है, जिससे हमारा शरीर और हड्डियां मजबूत बनती हैं।',
    en: 'Cow milk is rich in calcium and essential vitamins needed for strong bones and teeth.',
  },
  tiger: {
    gu: 'વાઘ ભારતનું રાષ્ટ્રીય પ્રાણી છે. વાઘના શરીર પરની પટ્ટીઓ દરેક વાઘમાં ફિંગરપ્રિન્ટની જેમ અલગ હોય છે!',
    hi: 'बाघ भारत का राष्ट्रीय पशु है। हर बाघ के शरीर की धारियां अलग और अनोखी होती हैं!',
    en: 'The Tiger is the National Animal of India. No two tigers have the exact same stripe pattern!',
  },
  elephant: {
    gu: 'હાથી પૃથ્વી પરનું સૌથી મોટું જમીનનું સસ્તન પ્રાણી છે. તે સૂંઢ વડે ૮ લિટર પાણી એકસાથે ભરી શકે છે!',
    hi: 'हाथी ज़मीन पर रहने वाला सबसे विशाल स्तनपायी जीव है। वह सूंड से बहुत भारी वजन उठा सकता है!',
    en: 'Elephants are the largest living land mammals and have incredible memory and emotional bonds!',
  },
  horse: {
    gu: 'ઘોડો ખૂબ ઝડપી અને શક્તિશાળી પ્રાણી છે. ઘોડા ઊભા-ઊભા પણ આરામથી ઊંઘી શકે છે!',
    hi: 'घोड़ा बहुत फुर्तीला और शक्तिशाली जानवर है। घोड़े खड़े-खड़े भी आराम से सो सकते हैं!',
    en: 'Horses are powerful runners with great stamina and can sleep both lying down and standing up!',
  },
  parrot: {
    gu: 'પોપટ ખૂબ બુદ્ધિશાળી અને રંગબેરંગી પક્ષી છે. તે માણસોના અવાજ અને શબ્દોની હૂબહૂ નકલ કરી શકે છે!',
    hi: 'तोता बहुत समझदार और रंग-बिरंगा पक्षी है। यह इंसानों की आवाज़ और शब्दों की हूबहू नकल कर सकता है!',
    en: 'Parrots are exceptionally intelligent birds capable of mimicking human speech and sounds.',
  },
  peacock: {
    gu: 'મોર ભારતનું રાષ્ટ્રીય પક્ષી છે. ચોમાસામાં વાદળો જોઈને મોર કળા કરી સુંદર નૃત્ય કરે છે.',
    hi: 'मोर भारत का राष्ट्रीय पक्षी है। वर्षा ऋतु में मोर अपने खूबसूरत पंख फैलाकर मनमोहक नृत्य करता है।',
    en: 'The Indian Peafowl is the National Bird of India, known for its iridescent blue-green plumage.',
  },
  sparrow: {
    gu: 'ચકલી આપણા ઘર આંગણાનું પ્રિય પક્ષી છે. તે દાણા અને નાના જીવજંતુ ખાઈને પર્યાવરણને સ્વચ્છ રાખે છે.',
    hi: 'चिड़िया हमारे घर-आंगन की प्यारी सहेली है। यह नन्हे कीड़े खाकर पेड़-पौधों की रक्षा करती है।',
    en: 'Sparrows are friendly backyard birds that help maintain balance by eating garden pests.',
  },
  rabbit: {
    gu: 'સસલું ખૂબ ઝડપથી કૂદકા મારી શકે છે. તેના લાંબા કાન દૂરનો ઝીણો અવાજ પણ સહેલાઈથી સાંભળી લે છે.',
    hi: 'खरगोश बहुत फुर्तीला जीव है। इसके लंबे कान बहुत दूर की हल्की आहट भी आसानी से सुन लेते हैं।',
    en: 'Rabbits have panoramic vision and exceptionally long ears that detect sounds from far away.',
  },
  monkey: {
    gu: 'વાંદરા ખૂબ હોશિયાર હોય છે અને ઝાડ પર સંતુલન જાળવવા પોતાની પૂંછડીનો ઉપયોગ હાથની જેમ કરે છે!',
    hi: 'बंदर बहुत नटखट और बुद्धिमान होते हैं। वे पेड़ों पर संतुलन बनाने के लिए अपनी पूंछ का उपयोग करते हैं!',
    en: 'Monkeys are social animals that use their prehensile tails for balance and climbing trees.',
  },
  duck: {
    gu: 'બતકના પીંછા વોટરપ્રૂફ હોય છે જેથી પાણીમાં તરતી વખતે પણ તેના પીંછા ભીના થતા નથી!',
    hi: 'बत्तख के पंख वॉटरप्रूफ (जलरोधी) होते हैं, इसलिए पानी में तैरते समय भी वे गीले नहीं होते!',
    en: 'Ducks have waterproof feathers coated with natural oil that keep them dry while swimming.',
  },
  camel: {
    gu: 'ઊંટને રણનું વહાણ કહેવાય છે. તે પાણી વિના પણ રણમાં અઠવાડિયા સુધી મુસાફરી કરી શકે છે.',
    hi: 'ऊंट को रेगिस्तान का जहाज कहा जाता है। यह बिना पानी पिए भी कई दिनों तक रेगिस्तान में चल सकता है।',
    en: 'The Camel is known as the Ship of the Desert, perfectly adapted to store energy in its hump.',
  },
  deer: {
    gu: 'હરણ ખૂબ જ ચપળ અને ઝડપી દોડનાર પ્રાણી છે. તે જોખમ પારખીને આંખના પલકારામાં કૂદીને ભાગી શકે છે.',
    hi: 'हिरण बहुत चंचल और तेज़ दौड़ने वाला जीव है। यह खतरे की आहट पाते ही लंबी छलांगें लगाकर भागता है।',
    en: 'Deer are swift and graceful forest herbivores with keen senses of hearing and smell.',
  },
  giraffe: {
    gu: 'જિરાફ પૃથ્વી પરનું સૌથી ઊંચું પ્રાણી છે. તેની જીભ લગભગ ૪૫ સે.મી. લાંબી હોય છે જે કાંટાળા ઝાડમાંથી પણ પાંદડાં તોડી લે છે!',
    hi: 'जिराफ़ दुनिया का सबसे ऊंचा जानवर है। इसकी ४५ सेमी लंबी जीभ कांटों के बीच से भी पत्ते तोड़ लेती है!',
    en: 'The Giraffe is the tallest living terrestrial animal, with an exceptionally long neck and blue tongue.',
  },
  zebra: {
    gu: 'ઝીબ્રાના શરીર પરની કાળી અને સફેદ પટ્ટીઓ તેને ગરમીથી બચાવે છે અને શિકારીઓને ભ્રમિત કરે છે.',
    hi: 'ज़ेबरा के शरीर की काली और सफेद धारियां उसे तेज़ धूप से बचाती हैं और शिकारियों को चकमा देती हैं।',
    en: 'Zebras have black and white striped coats that confuse predators and act as natural sunscreen.',
  },
  bear: {
    gu: 'રીંછને મધ ખૂબ ભાવે છે. શિયાળામાં રીંછ લાંબી ગાઢ નિંદ્રા (હાઇબરનેશન) માણે છે.',
    hi: 'भालू को मीठा शहद बहुत पसंद होता है। सर्दियों के मौसम में भालू लंबी गहरी नींद (हाइबरनेशन) लेते हैं।',
    en: 'Bears have an extraordinary sense of smell and hibernate during cold winters to conserve energy.',
  },
  pigeon: {
    gu: 'કબૂતર રસ્તો યાદ રાખવામાં અજોડ છે. જૂના જમાનામાં સંદેશા મોકલવા માટે કબૂતરોનો ઉપયોગ થતો હતો!',
    hi: 'कबूतर दिशाएं याद रखने में माहिर होते हैं। पुराने समय में संदेश भेजने के लिए कबूतरों का उपयोग होता था!',
    en: 'Pigeons have exceptional navigational skills and were historically used to deliver letters.',
  },
  rooster: {
    gu: 'કૂકડો સૂર્યોદય થતાં જ મોટેથી કૂકડે-કૂક બોલીને બધાને જગાડે છે.',
    hi: 'मुर्गा सुबह सूर्योदय होते ही बाँग देकर सबको नई सुबह के लिए जगाता है।',
    en: 'Roosters crow at dawn, signaling the start of a brand new morning for farm life.',
  },
  woodpecker: {
    aliases: ['woodpecker', 'લક્કડખોદ', 'कठफोड़वा'],
    gu: 'લક્કડખોદ ઝાડના થડમાં ચાંચ મારીને એક સેકન્ડમાં ૨૦ જેટલા ટકોરા કરી શકે છે અને જીવાત શોધીને ખાય છે!',
    hi: 'कठफोड़वा अपनी मजबूत चोंच से पेड़ के तने पर एक सेकंड में २० बार तक वार कर सकता है और कीड़े ढूंढकर खाता है!',
    en: 'Woodpeckers can peck tree trunks up to 20 times per second with their shock-absorbing skulls!',
  },
  penguin: {
    aliases: ['penguin', 'પેંગ્વિન', 'पेंगुइन'],
    gu: 'પેંગ્વિન બરફીલા ઠંડા પ્રદેશનું પક્ષી છે. તે ઊડી શકતું નથી પણ સમુદ્રમાં એકદમ કુશળતાથી તરી શકે છે!',
    hi: 'पेंगुइन बर्फीले ठंडे इलाकों का पक्षी है। यह उड़ नहीं सकता, लेकिन पानी में बहुत तेज़ गति से तैरता है!',
    en: 'Penguins are flightless birds that are fantastic swimmers, using their wings like flippers in icy waters!',
  },
  crane: {
    aliases: ['crane', 'બગલો', 'બગલી', 'बगुला'],
    gu: 'બગલો લાંબા પગ અને લાંબી ચાંચવાળું શાંત પક્ષી છે. તે પાણીમાં સ્થિર ઊભા રહીને માછલી પકડે છે.',
    hi: 'बगुला लंबे पैरों और लंबी चोंच वाला शांत पक्षी है। यह पानी में एक पैर पर खड़े होकर फुर्ती से मछली पकड़ता है।',
    en: 'Cranes and herons have long legs and sharp beaks, expertly catching fish while standing motionless in water.',
  },
  owl: {
    aliases: ['owl', 'ઘુવડ', 'उल्लू'],
    gu: 'ઘુવડ રાત્રે જાગનાર પક્ષી છે. તે પોતાની ડોકને લગભગ ૨૭૦ ડિગ્રી સુધી ગોળ ફેરવી શકે છે!',
    hi: 'उल्लू रात के अंधेरे में साफ देख सकता है और अपनी गर्दन को २७० डिग्री तक घुमा सकता है!',
    en: 'Owls are nocturnal birds with exceptional hearing that can rotate their necks up to 270 degrees!',
  },
  eagle: {
    aliases: ['eagle', 'ગરુડ', 'चील', 'गरुड़'],
    gu: 'ગરુડ આકાશમાં ખૂબ ઊંચે ઊડી શકે છે. તેની નજર એટલી તેજ હોય છે કે હજારો ફૂટ ઊંચાઈએથી પણ જમીન પરનો શિકાર જોઈ લે છે!',
    hi: 'गरुड़ बहुत ऊंची उड़ान भरता है और इसकी तीखी नज़र मीलों दूर से भी ज़मीन पर अपने शिकार को देख लेती है!',
    en: 'Eagles have incredibly sharp eyesight, spotting small prey from several miles away in the sky.',
  },
  swan: {
    aliases: ['swan', 'હંસ', 'हंस'],
    gu: 'હંસ શાંતિ અને સુંદરતાનું પ્રતીક છે. તે આજીવન એક જ જોડીદાર સાથે રહેવા માટે જાણીતું છે.',
    hi: 'हंस सुंदरता और पवित्रता का प्रतीक है। यह शांत झीलों में तैरता है और जीवनभर एक ही साथी के साथ रहता है।',
    en: 'Swans are elegant waterfowl that mate for life and are universal symbols of grace and love.',
  },
  flamingo: {
    aliases: ['flamingo', 'સુરખાબ', 'फ्लेमिंगो', 'सुरखाब'],
    gu: 'સુરખાબ (ફ્લેમિંગો) ગુજરાતનું રાજ્ય પક્ષી છે. કચ્છના રણમાં લાખો સુરખાબ સુંદર માળા બનાવે છે!',
    hi: 'फ्लेमिंगो (सुरखाब) अपने गुलाबी पंखों और एक पैर पर खड़े रहने की आदत के लिए जाना जाता है!',
    en: 'Greater Flamingos are the state bird of Gujarat, famous for their pink feathers and S-shaped necks.',
  },
  kingfisher: {
    aliases: ['kingfisher', 'કલકલિયો', 'કિંગફિશર'],
    gu: 'કલકલિયો (કિંગફિશર) ચમકતા વાદળી-નારંગી રંગનું સુંદર પક્ષી છે જે વીજળીની ઝડપે પાણીમાં ડૂબકી મારીને માછલી પકડે છે!',
    hi: 'किंगफिशर चमकीले नीले और नारंगी रंगों वाला पक्षी है जो बिजली जैसी तेज़ी से पानी में डुबकी लगाकर मछली पकड़ता है!',
    en: 'Kingfishers have brilliantly colored plumage and dive at lightning speed to catch small fish.',
  },
  crow: {
    aliases: ['crow', 'કાગડો', 'कौआ'],
    gu: 'કાગડો ખૂબ ચતુર પક્ષી છે. તે ચહેરા ઓળખી શકે છે અને સમસ્યા ઉકેલવા તણખલાં કે પથ્થર જેવા સાધનો વાપરી શકે છે!',
    hi: 'कौआ बहुत बुद्धिमान और समझदार पक्षी है। यह चेहरों को याद रख सकता है और औजारों का उपयोग करता है!',
    en: 'Crows are among the smartest animals on Earth, capable of recognizing human faces and solving puzzles.',
  },
  koel: {
    aliases: ['koel', 'કોયલ', 'कोयल'],
    gu: 'કોયલ પોતાની મધુર કૂકૂ અવાજ માટે જાણીતી છે. તે વસંત ઋતુમાં આંબાની ડાળે બેસીને મીઠું ગાય છે.',
    hi: 'कोयल अपनी मीठी और सुरीली आवाज़ के लिए प्रसिद्ध है। यह वसंत ऋतु में आम के पेड़ों पर मीठे गीत गाती है।',
    en: 'The Asian Koel is famous for its melodious call that heralds the arrival of spring.',
  },
  ostrich: {
    aliases: ['ostrich', 'શાહમૃગ', 'शुतुरमुर्ग'],
    gu: 'શાહમૃગ પૃથ્વી પરનું સૌથી મોટું અને સૌથી ઝડપી દોડનાર પક્ષી છે. તેની આંખ તેના મગજ કરતાં પણ મોટી હોય છે!',
    hi: 'शुतुरमुर्ग दुनिया का सबसे बड़ा और सबसे तेज़ दौड़ने वाला पक्षी है। इसकी आंख उसके दिमाग से भी बड़ी होती है!',
    en: 'The Ostrich is the largest living bird, capable of running up to 70 km/h and laying the largest eggs.',
  },
  vulture: {
    aliases: ['vulture', 'ગીધ', 'गिद्ध'],
    gu: 'ગીધ કુદરતના સફાઈ કામદાર ગણાય છે. તે સડી ગયેલી વસ્તુઓ ખાઈને રોગચાળો ફેલાતો અટકાવે છે.',
    hi: 'गिद्ध प्रकृति के सफाईकर्मी कहलाते हैं। वे सड़ी-गली चीजों को खाकर पर्यावरण को स्वच्छ और रोगमुक्त रखते हैं।',
    en: 'Vultures are nature’s clean-up crew, consuming decaying matter and preventing dangerous diseases from spreading.',
  },
  fox: {
    aliases: ['fox', 'શિયાળ', 'लोमड़ी'],
    gu: 'શિયાળ પોતાની ચાલાકી અને ચતુરાઈ માટે જાણીતું છે. તેની રુંવાટીદાર પૂંછડી તેને શિયાળામાં ગરમ રાખે છે.',
    hi: 'लोमड़ी अपनी चतुर बुद्धि और फुर्ती के लिए जानी जाती है। इसकी घनी पूंछ इसे सर्दियों में ठंड से बचाती है।',
    en: 'Foxes are clever, adaptable creatures with bushy tails that help them balance and stay warm.',
  },
  wolf: {
    aliases: ['wolf', 'વરુ', 'भेड़िया'],
    gu: 'વરુ હંમેશાં જૂથમાં (ટોળામાં) શિકાર કરે છે અને એકબીજા સાથે સંપર્ક કરવા માટે રાત્રે લાળી (હોલિંગ) કરે છે.',
    hi: 'भेड़िये झुंड में रहते हैं और एक-दूसरे से संपर्क करने के लिए रात में दूर तक गूंजने वाली आवाज़ (हाउल) निकालते हैं।',
    en: 'Wolves live and hunt in packs, communicating through complex facial expressions and long-distance howls.',
  },
  leopard: {
    aliases: ['leopard', 'દીપડો', 'तेंदुआ'],
    gu: 'દીપડો ઝાડ પર ચડવામાં ખૂબ હોશિયાર હોય છે અને તે પોતાના શિકારને ઝાડની ઊંચી ડાળીઓ પર લઈ જઈ શકે છે!',
    hi: 'तेंदुआ पेड़ों पर चढ़ने में माहिर होता है और अपने शिकार को भारी होने पर भी पेड़ की डालियों पर खींच ले जाता है!',
    en: 'Leopards are incredible climbers and strong athletes that often drag heavy prey high up into tree branches.',
  },
  cheetah: {
    aliases: ['cheetah', 'ચિત્તો', 'ચીતા', 'चीता'],
    gu: 'ચિત્તો પૃથ્વી પરનું સૌથી ઝડપી જમીનનું પ્રાણી છે. તે માત્ર ૩ સેકન્ડમાં ૧૦૦ કિ.મી./કલાકની ઝડપ પકડી શકે છે!',
    hi: 'चीता ज़मीन पर दौड़ने वाला दुनिया का सबसे तेज़ धावक है। यह कुछ ही सेकंड में १०० किमी/घंटा की रफ्तार पकड़ लेता है!',
    en: 'The Cheetah is the fastest land animal, accelerating from 0 to 100 km/h in just three seconds!',
  },
  panda: {
    aliases: ['panda', 'પાંડા', 'पांडा'],
    gu: 'જાયન્ટ પાંડા દિવસના ૧૨ કલાક વાંસ (બામ્બૂ) ખાવામાં વિતાવે છે. તેઓ શાંત અને મળતાવડા હોય છે.',
    hi: 'विशाल पांडा दिन में लगभग १२ घंटे सिर्फ बांस खाने में बिताते हैं और पेड़ों पर आराम से झपकी लेते हैं।',
    en: 'Giant pandas spend up to 12 hours a day munching on bamboo, which makes up 99% of their diet.',
  },
  kangaroo: {
    aliases: ['kangaroo', 'કાંગારૂ', 'कंगारू'],
    gu: 'કાંગારૂ ઓસ્ટ્રેલિયાનું પ્રતીક છે. માતા કાંગારૂ પોતાના બચ્ચાં (જોયી) ને પેટની કોથળી (પાઉચ) માં સુરક્ષિત રાખે છે.',
    hi: 'कंगारू के पेट पर एक विशेष थैली (पाउच) होती है जिसमें वह अपने नन्हे बच्चे को सुरक्षित रखता है।',
    en: 'Kangaroos carry their newborn joeys in special front pouches until they are big enough to hop on their own.',
  },
  hippo: {
    aliases: ['hippo', 'જળઘોડો', 'દરિયાઈ ઘોડો', 'दरियाई घोड़ा'],
    gu: 'જળઘોડો (હિપ્પો) મોટાભાગનો સમય પાણીમાં વિતાવે છે જેથી તેની ચામડી તડકાથી સુરક્ષિત અને ઠંડી રહે.',
    hi: 'दरियाई घोड़ा (हिप्पो) धूप से बचने के लिए दिन का अधिकांश समय पानी या कीचड़ में बिताता है।',
    en: 'Hippopotamuses spend most of the day submerged in rivers and lakes to keep their skin cool and moist.',
  },
  rhino: {
    aliases: ['rhino', 'ગેંડો', 'गैंडा'],
    gu: 'ગેંડાના નાક પર કેરાટિનનું મજબૂત શિંગડું હોય છે. કાઝીરંગા નેશનલ પાર્ક એક શિંગડાવાળા ગેંડા માટે વિશ્વપ્રસિદ્ધ છે.',
    hi: 'गैंडे की नाक पर मजबूत सींग होता है। भारत का काजीरंगा राष्ट्रीय उद्यान एक सींग वाले गैंडों के लिए प्रसिद्ध है।',
    en: 'The Greater One-Horned Rhinoceros is native to the Indian subcontinent, thriving in protected national parks like Kaziranga.',
  },
  squirrel: {
    aliases: ['squirrel', 'ખિસકોલી', 'गिलहरी'],
    gu: 'ખિસકોલી ખૂબ ચપળ હોય છે. તે જમીનમાં બદામ અને બીજ સંતાડે છે, જેનાથી આપોઆપ નવાં વૃક્ષો ઊગી નીકળે છે!',
    hi: 'गिलहरी बहुत फुर्तीली होती है। यह ज़मीन में अखरोट और बीज छिपाती है, जिससे जंगल में नए पेड़ उगते हैं!',
    en: 'Squirrels bury thousands of nuts and seeds each year, inadvertently planting millions of new trees!',
  },
  frog: {
    aliases: ['frog', 'દેડકો', 'मेंढक'],
    gu: 'દેડકો જમીન અને પાણી બંનેમાં રહી શકે છે. તે પોતાની ત્વચા વડે પણ શ્વાસ લઈ શકે છે!',
    hi: 'मेंढक पानी और ज़मीन दोनों जगह रह सकता है। यह अपनी त्वचा से भी पानी और सांस सोख लेता है!',
    en: 'Frogs are amphibians that can breathe through their moist skin as well as their lungs.',
  },
  turtle: {
    aliases: ['turtle', 'કાચબો', 'कछुआ'],
    gu: 'કાચબો પોતાની પીઠ પર મજબૂત કવચ ધરાવે છે અને તે ૧૦૦ થી વધુ વર્ષો સુધી જીવી શકે છે!',
    hi: 'कछुए की पीठ पर बहुत मजबूत खोल होता है और कई कछुए १०० से अधिक वर्षों तक जीवित रहते हैं!',
    en: 'Turtles are ancient reptiles protected by tough bony shells, often living for over a century.',
  },
  crocodile: {
    aliases: ['crocodile', 'મગર', 'મગરમચ્છ', 'मगरमच्छ'],
    gu: 'મગર ખૂબ પ્રાચીન સરિસૃપ છે. તેનું જડબું અતિશય શક્તિશાળી હોય છે અને તે પાણીમાં દબાઈને શિકાર કરે છે.',
    hi: 'मगरमच्छ पानी का बहुत ताकतवर शिकारी है। इसके जबड़े में जबरदस्त ताकत होती है और यह पानी में घंटों छिप सकता है।',
    en: 'Crocodiles have the strongest bite force in the animal kingdom and have lived on Earth since the dinosaur era.',
  },
  goat: {
    aliases: ['goat', 'બકરી', 'બકરું', 'बकरी'],
    gu: 'બકરી પાલતુ પ્રાણી છે. બકરીનું દૂધ હળવું અને પચવામાં ખૂબ જ સરળ હોય છે.',
    hi: 'बकरी एक उपयोगी पालतू पशु है। बकरी का दूध हल्का, पौष्टिक और पचने में बहुत आसान होता है।',
    en: 'Goats are inquisitive, agile herd animals whose nutrient-rich milk is easy to digest.',
  },
  sheep: {
    aliases: ['sheep', 'ઘેટું', 'भेड़'],
    gu: 'ઘેટાંના શરીર પરથી મેળવાતી ઊનમાંથી શિયાળામાં પહેરવા માટે ગરમ સ્વેટર અને શાલ બનાવવામાં આવે છે.',
    hi: 'भेड़ के घने बालों से हमें मुलायम ऊन मिलती है, जिससे सर्दियों के लिए गर्म स्वेटर और शॉल बनते हैं।',
    en: 'Sheep provide soft, natural wool that is spun into cozy warm sweaters, blankets, and coats.',
  },
  buffalo: {
    aliases: ['buffalo', 'ભેંસ', 'भैंस'],
    gu: 'ભેંસનું દૂધ ખૂબ પૌષ્ટિક અને ઘટ્ટ હોય છે, જેમાંથી સ્વાદિષ્ટ ઘી, માખણ અને પનીર બનાવવામાં આવે છે.',
    hi: 'भैंस का दूध गाढ़ा और पौष्टिक होता है, जिससे स्वादिष्ट मक्खन, घी, दही और पनीर बनाया जाता है।',
    en: 'Water buffalo milk is rich in calcium and protein, traditionally used to make ghee, paneer, and mozzarella.',
  },
  donkey: {
    aliases: ['donkey', 'ગધેડું', 'ગર્દભ', 'गधा'],
    gu: 'ગધેડું ખૂબ મહેનતુ અને સહનશીલ પ્રાણી છે. તે ડુંગરાળ વિસ્તારોમાં સામાનનું વહન કરવામાં ખૂબ મદદરૂપ બને છે.',
    hi: 'गधा बहुत मेहनती और सहनशील पशु है जो पहाड़ी और पथरीले रास्तों पर सामान ढोने में मदद करता है।',
    en: 'Donkeys are sure-footed, hard-working helpers that carry loads across rugged mountain paths.',
  },
  ox: {
    aliases: ['ox', 'બળદ', 'બળદીયો', 'बैल'],
    gu: 'બળદ ખેડૂતનો સાચો મિત્ર છે. તે ખેતરમાં હળ ચલાવવામાં અને ગાડા ખેંચવામાં ખૂબ મદદરૂપ બને છે.',
    hi: 'बैल किसानों का सच्चा मित्र है। यह खेतों में हल चलाने और भारी गाड़ियों को खींचने में मदद करता है।',
    en: 'Oxen are strong, patient working animals that have assisted farmers with plowing and transportation for centuries.',
  },

  // Fruits & Vegetables (All 10 Fruits)
  apple: {
    gu: 'સફરજનમાં ૮૫% પાણી અને વિટામિન C હોય છે. દરરોજ એક સફરજન ખાવાથી તંદુરસ્તી જળવાય છે.',
    hi: 'सेब में प्रचुर मात्रा में फाइबर और विटामिन C होता है जो शरीर को चुस्त-दुरुस्त और स्वस्थ रखता है।',
    en: 'Apples are packed with fiber and antioxidants, which boost brain health and immunity.',
  },
  banana: {
    gu: 'કેળામાં પોટેશિયમ ભરપૂર માત્રામાં હોય છે જે શરીરને તરત જ ઊર્જા આપે છે.',
    hi: 'केले में भरपूर पोटेशियम और ऊर्जा होती है जो तुरंत शक्ति और ताजगी प्रदान करती है।',
    en: 'Bananas contain potassium and natural sugars that provide quick and sustained energy.',
  },
  mango: {
    gu: 'કેરીને ફળોનો રાજા કહેવામાં આવે છે અને તે ભારતનું રાષ્ટ્રીય ફળ છે.',
    hi: 'आम को फलों का राजा कहा जाता है और यह भारत का रसीला राष्ट्रीय फल है।',
    en: 'The Mango is the King of Fruits and the National Fruit of India.',
  },
  orange: {
    gu: 'નારંગી વિટામિન C નો અખૂટ ખજાનો છે, જે આપણી રોગપ્રતિકારક શક્તિ વધારે છે.',
    hi: 'संतरा विटामिन C का भरपूर स्रोत है, जो शरीर की रोग-प्रतिरोधक क्षमता (इम्युनिटी) बढ़ाता है।',
    en: 'Oranges are bursting with Vitamin C, keeping the immune system strong and vibrant.',
  },
  grapes: {
    gu: 'દ્રાક્ષ ઝૂમખામાં ઊગે છે. દ્રાક્ષ સૂકવીને તેમાંથી સ્વાદિષ્ટ કિસમિસ બનાવવામાં આવે છે!',
    hi: 'अंगूर गुच्छों में फलते हैं। अंगूरों को सुखाकर स्वादिष्ट किशमिश बनाई जाती है!',
    en: 'Grapes grow in clusters on vines and are dried to make naturally sweet raisins.',
  },
  watermelon: {
    gu: 'તરબૂચમાં ૯૨% પાણી હોય છે, જે ઉનાળાની ગરમીમાં શરીરને એકદમ ઠંડક અને હાઇડ્રેશન આપે છે.',
    hi: 'तरबूज में ९२% पानी होता है, जो गर्मियों की धूप में शरीर को ताजगी और शीतलता देता है।',
    en: 'Watermelons are 92% water, making them the ultimate hydrating refreshment on sunny days.',
  },
  pineapple: {
    gu: 'અનાનસ પાચન માટે ખૂબ સારું છે. તેની બહાર કાંટાળી છાલ અને અંદર મીઠો-ખાટો રસ હોય છે.',
    hi: 'अनानास पाचन तंत्र के लिए बहुत लाभकारी है। इसके अंदर खट्टा-मीठा रसीला गूदा होता है।',
    en: 'Pineapples are tropical fruits rich in bromelain, an enzyme that aids digestion.',
  },
  strawberry: {
    gu: 'સ્ટ્રોબેરી એકમાત્ર એવું ફળ છે જેના બીજ ફળની બહારની સપાટી પર હોય છે!',
    hi: 'स्ट्रॉबेरी दुनिया का एकमात्र ऐसा फल है जिसके बीज बाहर की सतह पर लगे होते हैं!',
    en: 'Strawberries are unique because their seeds grow on the outside rather than the inside.',
  },
  papaya: {
    gu: 'પપૈયું આંખો અને પેટના સ્વાસ્થ્ય માટે ઉત્તમ ફળ છે. તેમાં વિટામિન A ભરપૂર હોય છે.',
    hi: 'पपीता आंखों की रोशनी और पेट के पाचन के लिए बहुत फायदेमंद फल है। इसमें विटामिन A होता है।',
    en: 'Papayas are loaded with Vitamin A and papain, promoting eye health and healthy digestion.',
  },
  carrot: {
    gu: 'ગાજર આંખોની દ્રષ્ટિ તેજ કરવા માટે શ્રેષ્ઠ માનવામાં આવે છે કારણ કે તેમાં બીટા-કેરોટિન હોય છે.',
    hi: 'गाजर आंखों की रोशनी तेज़ करने के लिए सबसे बढ़िया है क्योंकि इसमें बीटा-कैरोटीन प्रचुर मात्रा में होता है।',
    en: 'Carrots are crunchy root vegetables loaded with beta-carotene, essential for sharp vision.',
  },

  // Space & Nature
  sun: {
    gu: 'સૂર્ય એક વિશાળ તારો છે જે પૃથ્વી પર પ્રકાશ અને જીવનનો મુખ્ય સ્ત્રોત છે.',
    hi: 'सूर्य एक विशाल तारा है और पृथ्वी पर जीवन व प्रकाश का मुख्य स्रोत है।',
    en: 'The Sun is a giant star at the center of the solar system, providing warmth and light for all life.',
  },
  moon: {
    gu: 'ચંદ્ર પૃથ્વીનો એકમાત્ર કુદરતી ઉપગ્રહ છે. ચંદ્ર પર પોતાનો પ્રકાશ નથી, તે સૂર્યના પ્રકાશથી ચમકે છે.',
    hi: 'चंद्रमा पृथ्वी का एकमात्र प्राकृतिक उपग्रह है और यह सूर्य के प्रकाश से चमकता है।',
    en: 'The Moon is Earth’s only natural satellite and causes ocean tides through its gravitational pull.',
  },
  earth: {
    gu: 'પૃથ્વી સૂર્યમંડળનો એકમાત્ર એવો ગ્રહ છે જેના પર જીવન, પાણી અને શ્વાસ લેવા માટે હવા છે.',
    hi: 'पृथ्वी सौरमंडल का एकमात्र ज्ञात ग्रह है जिस पर जीवन, पानी और वायुमंडल मौजूद है।',
    en: 'Earth is the only planet known to harbor life, with liquid water covering over 70% of its surface.',
  },
  water: {
    gu: 'પાણીનું રાસાયણિક સૂત્ર H₂O છે. આપણા શરીરનું લગભગ ૬૦% વજન પાણીનું બનેલું હોય છે!',
    hi: 'जल का रासायनिक सूत्र H₂O है। हमारे शरीर का लगभग ६०% हिस्सा पानी से बना है।',
    en: 'Pure water has the formula H₂O and is vital for every metabolic process in living organisms.',
  },

  // Math Concepts
  numbers: {
    gu: 'શૂન્ય (૦) ની શોધ પ્રાચીન ભારતના મહાન ગણિતશાસ્ત્રી આર્યભટ્ટે કરી હતી!',
    hi: 'शून्य (०) का आविष्कार प्राचीन भारत के महान गणितज्ञ आर्यभट्ट ने किया था!',
    en: 'The number zero (0) and decimal system were invented by ancient Indian mathematicians!',
  },
  addition: {
    gu: 'સરવાળો એ ગણિતની મૂળ ક્રિયા છે. કોઈપણ સંખ્યામાં શૂન્ય ઉમેરતાં તે જ સંખ્યા રહે છે.',
    hi: 'जोड़ गणित की बुनियादी क्रिया है। किसी भी संख्या में ० जोड़ने पर वही संख्या मिलती है।',
    en: 'Addition combines quantities together; adding zero to any number keeps it unchanged.',
  },
  multiplication: {
    gu: 'ગુણાકાર એટલે એક જ સરખી સંખ્યાનો વારંવાર થતો ઝડપી સરવાળો!',
    hi: 'गुणा का अर्थ है एक ही संख्या को बार-बार शीघ्रता से जोड़ना।',
    en: 'Multiplication is simply repeated addition of the same quantity in a faster way.',
  },
  fractions: {
    gu: 'અપૂર્ણાંક એ આખી વસ્તુના સમાન ભાગો દર્શાવે છે, જેમ કે અડધો (૧/૨) કે પા (૧/૪) ભાગ.',
    hi: 'भिन्न किसी पूरी वस्तु के समान भागों को दर्शाता है, जैसे आधा (१/२) या चौथाई (१/४)।',
    en: 'Fractions represent equal parts of a whole, such as one-half (1/2) or one-quarter (1/4).',
  },

  // Alphabet & Essential Learning Items
  lotus: {
    aliases: ['kamal', 'કમળ', 'कमल', 'lotus'],
    gu: 'કમળ ભારતનું રાષ્ટ્રીય ફૂલ છે. તે પાણી અને કાદવમાં ઊગીને પણ સદાય સ્વચ્છ અને સુંદર ખીલે છે.',
    hi: 'कमल भारत का राष्ट्रीय फूल है। यह जल में खिलता है और पवित्रता व सुंदरता का प्रतीक माना जाता है।',
    en: 'The Lotus is the National Flower of India, symbolizing purity, beauty, and resilience.',
  },
  ball: {
    aliases: ['dado', 'gend', 'દડો', 'गेंद', 'ball'],
    gu: 'દડો ગોળાકાર હોય છે અને બાળકો તેના વડે ક્રિકેટ અને ફૂટબોલ જેવી મનોરંજક રમતો રમે છે.',
    hi: 'गेंद गोल होती है और बच्चे इससे क्रिकेट, फुटबॉल जैसे कई मजेदार खेल खेलते हैं।',
    en: 'A ball is a spherical object enjoyed in numerous active outdoor sports and games.',
  },
  fish: {
    aliases: ['machhli', 'matsya', 'માછલી', 'મત્સ્ય', 'मछली', 'fish'],
    gu: 'માછલી પાણીની રાણી કહેવાય છે. તે પોતાના ઝાલર (ગિલ્સ) વડે પાણીમાંથી શ્વાસ લે છે.',
    hi: 'मछली जल की रानी है। यह गलफड़ों (गिल्स) की सहायता से पानी में सांस लेती है।',
    en: 'Fish are aquatic creatures that breathe underwater using their specialized gills.',
  },
  kite: {
    aliases: ['patang', 'પતંગ', 'पतंग', 'kite'],
    gu: 'પતંગ રંગબેરંગી કાગળમાંથી બને છે અને ઉત્તરાયણના પર્વે આકાશમાં ઊંચે ઉડાડવામાં આવે છે.',
    hi: 'पतंग रंग-बिरंगे कागज़ से बनाई जाती है और मकर संक्रांति के पावन पर्व पर आसमान में उड़ाई जाती है।',
    en: 'Kites fly high in the breeze and bring festive joy during cultural celebrations.',
  },
  umbrella: {
    aliases: ['chhatri', 'chhari', 'છત્રી', 'छाता', 'umbrella'],
    gu: 'છત્રી આપણને ચોમાસામાં વરસાદથી અને ઉનાળામાં સૂર્યના તેજ તડકાથી સુરક્ષિત રાખે છે.',
    hi: 'छाता हमें बारिश में भीगने से और तेज़ धूप की गर्मी से सुरक्षित रखता है।',
    en: 'An umbrella keeps us safe from rainy showers and shields us from strong sunshine.',
  },
  watch: {
    aliases: ['clock', 'ghadi', 'ghadiyal', 'ઘડિયાળ', 'घड़ी', 'watch'],
    gu: 'ઘડિયાળ આપણને ચોક્કસ સમય બતાવે છે અને સમયનું મૂલ્ય જાળવતાં શીખવે છે.',
    hi: 'घड़ी हमें सही समय बताती है और जीवन में अनुशासन व समय की कीमत सिखाती है।',
    en: 'A watch tells the time and reminds children of punctuality and discipline.',
  },
  tree: {
    aliases: ['jhad', 'vruksh', 'ped', 'ઝાડ', 'વૃક્ષ', 'पेड़', 'tree'],
    gu: 'વૃક્ષો આપણને શુદ્ધ ઓક્સિજન, મીઠાં ફળો, શીતળ છાંયડો અને પક્ષીઓને રહેઠાણ આપે છે.',
    hi: 'पेड़ हमें ताज़ा ऑक्सीजन, मीठे फल, शीतल छाया और औषधियां प्रदान करते हैं।',
    en: 'Trees give us fresh oxygen, sweet fruits, cool shade, and shelter for wildlife.',
  },
  ship: {
    aliases: ['jahaj', 'vahan', 'veh-ship', 'gk-ship', 'જહાજ', 'વહાણ', 'स्टीमर', 'जहाज'],
    gu: 'મોટું જહાજ સમુદ્રના વિશાળ મોજાં પર હજારો ટન માલસામાન અને મુસાફરોને એક દેશથી બીજા દેશ સુધી પહોંચાડે છે.',
    hi: 'विशाल समुद्री जहाज महासागरों की लहरों पर तैरते हुए लाखों टन सामान और यात्रियों को दूर देशों तक ले जाते हैं।',
    en: 'Giant cargo and passenger ships sail across deep oceans, connecting continents and carrying global trade.',
  },
  icecream: {
    aliases: ['ice cream', 'icecream', 'આઇસ્ક્રીમ', 'आइसक्रीम'],
    gu: 'આઇસ્ક્રીમ દૂધમાંથી બનતી ઠંડી અને મીઠી વાનગી છે જે ઉનાળામાં બધાને ખૂબ પસંદ પડે છે.',
    hi: 'आइसक्रीम दूध और मलाई से बनी ठंडी-मीठी मिठाई है जो सबको बहुत पसंद आती है।',
    en: 'Ice cream is a beloved creamy frozen dessert made from milk and delicious flavors.',
  },
  nest: {
    aliases: ['malo', 'ghonsla', 'માળો', 'घोंसला', 'nest'],
    gu: 'પક્ષીઓ તણખલાં ભેગાં કરીને વૃક્ષોની ડાળીઓ પર પોતાના ઈંડાં માટે માળો ગૂંથે છે.',
    hi: 'पक्षी तिनके और पत्तियां जोड़कर अपने नन्हे बच्चों और अंडों के लिए घोंसला बनाते हैं।',
    en: 'Birds carefully weave nests from twigs and leaves to protect their baby chicks.',
  },
  flute: {
    aliases: ['bansuri', 'sharanai', 'વાંસળી', 'શરણાઈ', 'बांसुरी', 'flute'],
    gu: 'વાંસળી વાંસમાંથી બનેલું સૂરિલો સંગીત વાદ્ય છે જે ભગવાન શ્રીકૃષ્ણને અતિ પ્રિય છે.',
    hi: 'बांसुरी एक सुरीला वाद्य यंत्र है जो भगवान श्रीकृष्ण को अत्यंत प्रिय है।',
    en: 'The flute is a classical melodic woodwind instrument that creates soothing music.',
  },
  butterfly: {
    aliases: ['patangiyu', 'titli', 'પતંગિયું', 'तितली', 'butterfly'],
    gu: 'પતંગિયું રંગબેરંગી સુંદર પાંખોવાળું જીવજંતુ છે જે બગીચામાં ફૂલોમાંથી મધુરસ ચૂસે છે.',
    hi: 'तितली रंग-बिरंगे पंखों वाला सुंदर कीट है जो फूलों से मीठा मकरंद पीती है।',
    en: 'Butterflies have vibrantly patterned wings and help pollinate garden flowers.',
  },
  rose: {
    aliases: ['gulab', 'ગુલાબ', 'गुलाब', 'rose'],
    gu: 'ગુલાબને ફૂલોનો રાજા કહેવાય છે અને તેની સુગંધ તથા પાંખડીઓ મનને શાંતિ આપે છે.',
    hi: 'गुलाब को फूलों का राजा माना जाता है। इसकी खुशबू और कोमल पंखुड़ियां मन मोह लेती हैं।',
    en: 'The Rose is known for its fragrant petals and is considered the king of flowers.',
  },
  sunflower: {
    aliases: ['surajmukhi', 'સૂર્યમુખી', 'सूरजमुखी', 'sunflower'],
    gu: 'સૂર્યમુખીનું મોટું પીળું ફૂલ હંમેશાં સૂર્યપ્રકાશ જે દિશામાં હોય તે તરફ નમે છે.',
    hi: 'सूरजमुखी का बड़ा पीला फूल हमेशा सूर्य की दिशा की ओर ही अपना मुख रखता है।',
    en: 'Sunflowers always turn their bright golden faces directly toward the sunlight.',
  },
  // =============================================================
  // GK VEHICLES
  // =============================================================
  'fire-truck': {
    aliases: ['fire-engine', 'fire truck', 'fire engine', 'veh-fire-truck', 'લાયબંબો', 'અગ્નિશામક ગાડી', 'दमकल गाड़ी', 'दमकल'],
    gu: 'લાયબંબો (ફાયર એન્જિન) આગ ઓલવવા અને લોકોનું રક્ષણ કરવા માટે ખૂબ ઉપયોગી છે. આપાતકાલીન સમયે ૧૦૧ નંબર ડાયલ કરીને ફાયર બ્રિગેડ બોલાવી શકાય છે.',
    hi: 'दमकल गाड़ी (फायर ब्रिगेड) आग बुझाने और लोगों की जान बचाने के लिए सायरन बजाते हुए तेजी से पहुंचती है। आपातकाल में १०१ नंबर डायल किया जाता है।',
    en: 'Fire engines speed to emergency rescues with loud sirens, high-pressure water hoses, and tall ladders. Emergency helpline is 101.',
  },
  'boat': {
    aliases: ['sailboat', 'hodi', 'veh-boat', 'હોડી', 'નાવ', 'नाव'],
    gu: 'હોડી (સેઇલબોટ) પવન અને હલેસાંની મદદથી નદી કે સરોવરમાં શાંતિથી તરે છે અને પ્રદૂષણ વિના જળમુસાફરી કરાવે છે.',
    hi: 'नाव (सेलबोट) हवा और चप्पू की मदद से शांत नदियों व झीलों में तैरती है और प्रदूषण रहित सुंदर जलयात्रा कराती है।',
    en: 'Sailboats catch the wind in their sails to glide smoothly across lakes and rivers without polluting nature.',
  },
  'bicycle': {
    aliases: ['cycle', 'saykal', 'veh-bicycle', 'gk-bicycle', 'સાયકલ', 'સાકલ', 'साइकिल'],
    gu: 'સાયકલ ચલાવવી એ શ્રેષ્ઠ કસરત છે જે શરીરને તંદુરસ્ત રાખે છે અને તેમાં કોઈ ઈંધણ ન વપરાતું હોવાથી પર્યાવરણ એકદમ શુદ્ધ રહે છે!',
    hi: 'साइकिल चलाना एक बेहतरीन व्यायाम है जो शरीर को स्वस्थ रखता है। इसमें किसी ईंधन की जरूरत नहीं होती, इसलिए प्रदूषण शून्य रहता है!',
    en: 'Bicycles provide healthy, eco-friendly transport that strengthens your heart and muscles while generating zero emissions!',
  },
  'train': {
    aliases: ['railgadi', 'veh-train', 'gk-train', 'ટ્રેન', 'રેલગાડી', 'रेलगाड़ी'],
    gu: 'ટ્રેન પાટા પર દોડે છે અને એકસાથે હજારો મુસાફરોને લાંબી મુસાફરી કરાવે છે. ભારતીય રેલવે વિશ્વના સૌથી મોટા નેટવર્કમાંનું એક છે!',
    hi: 'ट्रेन पटरियों पर दौड़ती है और लाखों यात्रियों को प्रतिदिन सुरक्षित यात्रा कराती है। भारतीय रेल विश्व के सबसे बड़े नेटवर्कों में से एक है!',
    en: 'Trains run on steel tracks, safely carrying thousands of commuters and tons of goods across cities and states.',
  },
  'aeroplane': {
    aliases: ['airplane', 'viman', 'veh-aeroplane', 'gk-aeroplane', 'inv-airplane', 'sci-airplane', 'હવાઈ જહાજ', 'વિમાન', 'हवाई जहाज़', 'विमान'],
    gu: 'વિમાન આકાશમાં વાદળોની ઉપર ઊડે છે અને હજારો કિલોમીટરનું અંતર થોડા જ કલાકોમાં કાપીને આપણને ઝડપથી મુકામે પહોંચાડે છે.',
    hi: 'हवाई जहाज बादलों के ऊपर उड़कर हजारों किलोमीटर की दूरी कुछ ही घंटों में तय कर लेता है। इसका आविष्कार राइट ब्रदर्स ने किया था।',
    en: 'Airplanes cruise high above the clouds at incredible speeds, connecting distant cities across the planet in just hours.',
  },
  'helicopter': {
    aliases: ['veh-helicopter', 'હેલિકોપ્ટર', 'हेलिकॉप्टर'],
    gu: 'હેલિકોપ્ટર રનવે વગર સીધું જ હવામાં ઊડી શકે છે. પૂર કે ભૂકંપ જેવી આપત્તિમાં તે લોકોને બચાવવા માટે ખૂબ ઉપયોગી બને છે.',
    hi: 'हेलिकॉप्टर बिना रनवे के सीधे ऊपर उड़ान भर सकता है और आपदा या बाढ़ के समय राहत व बचाव कार्य में बहुत मददगार होता है।',
    en: 'Helicopters can take off and land vertically and hover in place, making them essential for mountain and flood rescues.',
  },
  'ambulance': {
    aliases: ['veh-ambulance', 'એમ્બ્યુલન્સ', 'એમ્બ્યુલેન્સ', 'एम्बुलेंस'],
    gu: 'એમ્બ્યુલન્સ દર્દીઓને તાત્કાલિક હોસ્પિટલ પહોંચાડતી જીવનરક્ષક ગાડી છે. ભારતમાં ૧૦૮ નંબર પર ફોન કરવાથી એમ્બ્યુલન્સ તરત જ આવે છે.',
    hi: 'एम्बुलेंस बीमार व घायल लोगों को तुरंत अस्पताल पहुंचाने वाली जीवनरक्षक गाड़ी है। भारत में १०८ नंबर डायल करके इसे बुलाया जाता है।',
    en: 'Ambulances provide emergency mobile medical care and rapid hospital transport. Emergency helpline is 108.',
  },
  'car': {
    aliases: ['veh-car', 'મોટરકાર', 'ગાડી', 'કાર', 'कार'],
    gu: 'કાર આપણને પરિવાર સાથે સુરક્ષિત અને આરામદાયક મુસાફરી કરાવે છે. કારમાં બેસતી વખતે સીટબેલ્ટ પહેરવો અનિવાર્ય છે.',
    hi: 'कार परिवार के साथ आरामदायक यात्रा का लोकप्रिय साधन है। सड़क सुरक्षा के लिए कार में हमेशा सीटबेल्ट लगाना चाहिए।',
    en: 'Cars provide comfortable personal travel for families. Fastening seatbelts keeps all passengers safe on the road.',
  },
  'bus': {
    aliases: ['veh-bus', 'બસ', 'બસગાડી', 'बस'],
    gu: 'બસ સાર્વજનિક પરિવહનનું ખૂબ સરસ સાધન છે. એક જ બસમાં ઘણા બધા લોકો મુસાફરી કરે છે જેનાથી ટ્રાફિક અને પ્રદૂષણ ઘટે છે.',
    hi: 'बस सार्वजनिक परिवहन का प्रमुख साधन है। इसमें एक साथ कई लोग सफर करते हैं जिससे सड़कों पर भीड़ और प्रदूषण कम होता है।',
    en: 'Buses provide shared public transit for communities, cutting down traffic jams and reducing carbon footprints.',
  },
  'auto': {
    aliases: ['veh-auto', 'rickshaw', 'રિક્ષા', 'ઓટોરિક્ષા', 'ऑटो', 'ऑटो रिक्शा'],
    gu: 'ઓટોરિક્ષા શહેરના રસ્તાઓ પર ટૂંકી મુસાફરી માટે ખૂબ અનુકૂળ અને લોકપ્રિય ત્રણ પૈડાંવાળું વાહન છે.',
    hi: 'ऑटो रिक्शा शहर के भीतर छोटी यात्राओं के लिए बहुत लोकप्रिय और सुविधाजनक तीन पहियों वाला वाहन है।',
    en: 'Auto rickshaws are iconic three-wheeled vehicles offering convenient point-to-point urban transport.',
  },

  // =============================================================
  // GK NATIONAL SYMBOLS
  // =============================================================
  'anthem': {
    aliases: ['jana gana mana', 'national anthem', 'sym-anthem', 'રાષ્ટ્રગીત', 'જન ગણ મન', 'राष्ट्रगान', 'जन-गण-मन'],
    gu: 'ભારતનું રાષ્ટ્રગીત "જન ગણ મન" ગુરુદેવ રવીન્દ્રનાથ ટાગોરે લખ્યું હતું. રાષ્ટ્રગીતનું ગાન પૂર્ણ સન્માન સાથે ૫૨ સેકન્ડમાં કરવામાં આવે છે.',
    hi: 'भारत का राष्ट्रगान "जन-गण-मन" गुरुदेव रवींद्रनाथ टैगोर द्वारा रचा गया था। इसे पूरे सम्मान के साथ खड़े होकर ५२ सेकंड में गाया जाता है।',
    en: 'Our National Anthem "Jana Gana Mana" was composed by Rabindranath Tagore and is sung with pride in 52 seconds.',
  },
  'song': {
    aliases: ['vande mataram', 'national song', 'sym-song', 'રાષ્ટ્રગાન', 'વંદે માતરમ્', 'राष्ट्रीय गीत', 'वंदे मातरम्'],
    gu: 'ભારતનું રાષ્ટ્રીય ગાન "વંદે માતરમ્" બંકિમચંદ્ર ચટ્ટોપાધ્યાયે લખ્યું હતું, જે ભારત માતા પ્રત્યે અખૂટ આદર અને દેશભક્તિ વ્યક્ત કરે છે.',
    hi: 'भारत का राष्ट्रीय गीत "वंदे मातरम्" बंकिमचंद्र चटर्जी द्वारा रचा गया था। यह भारत माता के प्रति सच्ची देशभक्ति का पावन गान है।',
    en: 'Our National Song "Vande Mataram" was penned by Bankim Chandra Chatterjee in celebration of Mother India.',
  },
  'flag': {
    aliases: ['tiranga', 'tricolor', 'sym-flag', 'gk-flag', 'તિરંગો', 'રાષ્ટ્રધ્વજ', 'तिरंगा', 'ध्वज'],
    gu: 'ભારતના રાષ્ટ્રધ્વજ તિરંગામાં કેસરી રંગ શૌર્યનું, સફેદ શાંતિનું અને લીલો સમૃદ્ધિનું પ્રતીક છે. મધ્યમાં ૨૪ આરાવાળું અશોક ચક્ર છે.',
    hi: 'तिरंगे में केसरिया रंग वीरता, सफेद शांति और हरा समृद्धि का प्रतीक है। बीच में २४ तीलियों वाला नीले रंग का पावन अशोक चक्र है।',
    en: 'India’s National Flag has Saffron for courage, White for truth, Green for fertility, and the 24-spoke Ashoka Chakra.',
  },
  'emblem': {
    aliases: ['national emblem', 'sym-emblem', 'અશોક સ્તંભ', 'રાજચિહ્ન', 'રાષ્ટ્રીય પ્રતીક', 'अशोक स्तंभ', 'राष्ट्रीय प्रतीक'],
    gu: 'ભારતનું રાષ્ટ્રીય પ્રતીક સારનાથના અશોક સ્તંભ પરથી લેવાયેલું છે, જેમાં ચાર સિંહ છે અને નીચે "સત્યમેવ જયતે" સૂત્ર અંકિત છે.',
    hi: 'भारत का राष्ट्रीय प्रतीक सारनाथ के अशोक स्तंभ से लिया गया है। इसके नीचे मुंडकोपनिषद का अमर सूत्र "सत्यमेव जयते" लिखा है।',
    en: 'The National Emblem of India features four Asiatic lions back-to-back, with the sacred motto "Satyameva Jayate".',
  },
  'currency': {
    aliases: ['rupee', 'sym-currency', 'રૂપિયો', 'રૂપિયા', 'रुपया', 'रुपये'],
    gu: 'ભારતીય ચલણ રૂપિયો છે અને તેનું પ્રતીક "₹" છે. દરેક નોટ પર ભારતીય રિઝર્વ બેંકના ગવર્નરની સહી હોય છે.',
    hi: 'भारतीय मुद्रा रुपया है जिसका आधुनिक प्रतीक "₹" है। भारतीय रिज़र्व बैंक देश में नोटों का मुद्रण और संचालन करता है।',
    en: 'The Indian Rupee symbol (₹) represents the nation’s economy and is officially issued by the Reserve Bank of India.',
  },

  // =============================================================
  // GK INVENTIONS & DISCOVERIES
  // =============================================================
  'zero': {
    aliases: ['inv-zero', 'શૂન્ય', 'મીંડું', 'शून्य'],
    gu: 'શૂન્ય (૦) ની શોધ પ્રાચીન ભારતના મહાન ગણિતશાસ્ત્રી આર્યભટ્ટે કરી હતી. શૂન્ય વગર આજના કમ્પ્યુટર અને ગણિતની કલ્પના અશક્ય છે!',
    hi: 'शून्य (०) का आविष्कार प्राचीन भारत के महान गणितज्ञ आर्यभट्ट ने किया था। शून्य के बिना आधुनिक कंप्यूटर और विज्ञान असंभव था!',
    en: 'Zero (0) was gifted to the world by ancient Indian mathematician Aryabhata, forming the core of all modern computation.',
  },
  'bulb': {
    aliases: ['electric bulb', 'inv-bulb', 'sci-bulb', 'બલ્બ', 'વીજળીનો બલ્બ', 'बिजली का बल्ब', 'बल्ब'],
    gu: 'વીજળીના બલ્બની શોધ થોમસ આલ્વા એડિસને કરી હતી. બલ્બે રાત્રિના અંધકારને દૂર કરી સમગ્ર વિશ્વના ઘરોને રોશન કરી દીધા!',
    hi: 'बिजली के बल्ब का आविष्कार थॉमस अल्वा एडिसन ने किया था। बल्ब ने रात के अंधेरे को मिटाकर पूरी दुनिया को रोशनी से जगमगा दिया!',
    en: 'The electric light bulb was perfected by Thomas Alva Edison in 1879, illuminating homes and streets worldwide.',
  },
  'telephone': {
    aliases: ['mobile', 'smartphone', 'inv-telephone', 'sci-telephone', 'ફોન', 'ટેલિફોન', 'મોબાઇલ', 'टेलीफोन', 'मोबाइल'],
    gu: 'ટેલિફોનની શોધ એલેક્ઝાન્ડર ગ્રેહામ બેલે કરી હતી. આજે તેમાંથી સ્માર્ટફોન બન્યા છે જે પળવારમાં દુનિયાના કોઈપણ ખૂણે વાત કરાવે છે.',
    hi: 'टेलीफोन का आविष्कार अलेक्जेंडर ग्राहम बेल ने किया था। आज उसी तकनीक से स्मार्टफोन बने हैं जो हमें पूरी दुनिया से जोड़े रखते हैं।',
    en: 'Alexander Graham Bell patented the telephone in 1876, sparking a global communications revolution that led to smartphones.',
  },
  'wheel': {
    aliases: ['inv-wheel', 'sci-wheel', 'ચક્ર', 'પૈડું', 'पहिया', 'पहिए'],
    gu: 'પૈડાંની શોધ માનવ ઇતિહાસની સૌથી ક્રાંતિકારી શોધ છે. પૈડાં વગર સાયકલ, મોટરકાર, રેલવે કે ઘડિયાળનાં યંત્રો કશું જ શક્ય નહોતું!',
    hi: 'पहिए का आविष्कार मानव सभ्यता की सबसे युगांतरकारी खोज है। पहिए के बिना साइकिल, कार, ट्रेन या मशीनों की कल्पना असंभव थी!',
    en: 'The invention of the wheel in the Bronze Age transformed land transport, agriculture, pottery, and all machinery.',
  },
  'press': {
    aliases: ['printing-press', 'printing press', 'inv-press', 'છાપકામ', 'પ્રિન્ટિંગ પ્રેસ', 'प्रिंटिंग प्रेस', 'छपाई'],
    gu: 'પ્રિન્ટિંગ પ્રેસની શોધ જોહાન્સ ગુટેનબર્ગે કરી હતી. તેના કારણે પુસ્તકોનું છાપકામ શરૂ થયું અને શાળાના બાળકો સુધી જ્ઞાન પહોંચ્યું.',
    hi: 'प्रिंटिंग प्रेस का आविष्कार जोहानेस गुटेनबर्ग ने किया था। इसी के कारण पुस्तकें छपना और ज्ञान का जन-जन तक पहुंचना संभव हुआ।',
    en: 'Johannes Gutenberg’s printing press mechanized book production, spreading literacy and learning across the world.',
  },
  'radio': {
    aliases: ['inv-radio', 'રેડિયો', 'રેડિઓ', 'रेडियो'],
    gu: 'રેડિયો અદ્રશ્ય તરંગો વડે દૂર દૂર સુધી સમાચાર અને મધુર સંગીત પહોંચાડે છે. તેમાં ભારતના વૈજ્ઞાનિક જે.સી. બોઝનું મોટું યોગદાન હતું.',
    hi: 'रेडियो बिना तारों के हवा में तरंगों के जरिए दूर-दूर तक समाचार और गीत पहुंचाता है। इसमें वैज्ञानिक जे.सी. बोस का अमूल्य योगदान था।',
    en: 'Radio enables wireless sound transmission across great distances, pioneered by Guglielmo Marconi and Jagadish Chandra Bose.',
  },
  'tv': {
    aliases: ['television', 'inv-tv', 'ટીવી', 'ટેલિવિઝન', 'टेलीविज़न', 'टीवी'],
    gu: 'ટેલિવિઝન (ટીવી) ની શોધ જ્હોન લોગી બેયર્ડે કરી હતી. ટીવી વડે આપણે ઘરમાં બેસીને દેશ-વિદેશના સમાચાર, શિક્ષણ અને કાર્ટૂન જોઈ શકીએ છીએ.',
    hi: 'टेलीविज़न (टीवी) का आविष्कार जॉन लॉगी बेयर्ड ने किया था। टीवी हमें घर बैठे ज्ञानवर्धक कार्यक्रम, समाचार और शिक्षा दिखाता है।',
    en: 'The television was pioneered in the 1920s by John Logie Baird, bringing moving images, news, and entertainment into homes.',
  },
  'computer': {
    aliases: ['internet', 'inv-computer', 'sci-computer', 'કમ્પ્યુટર', 'લેપટોપ', 'कंप्यूटर', 'इंटरनेट'],
    gu: 'કમ્પ્યુટર એક શક્તિશાળી ઇલેક્ટ્રોનિક મશીન છે જે સેકન્ડોમાં અબજો ગણતરીઓ કરી શકે છે અને નવી નવી બાબતો શીખવામાં મદદ કરે છે.',
    hi: 'कंप्यूटर एक शक्तिशाली इलेक्ट्रॉनिक मशीन है जो पलक झपकते ही जटिल गणनाएं कर सकती है और पढ़ाई में सबसे बड़ी मददगार है।',
    en: 'Computers process information and perform calculations at astonishing speeds, serving as the gateway to the world’s knowledge.',
  },
  'clock': {
    aliases: ['inv-clock', 'ઘડિયાળ', 'घड़ी'],
    gu: 'ઘડિયાળ આપણને સમયનું મૂલ્ય સમજાવે છે. તે કલાક, મિનિટ અને સેકન્ડની ચોક્કસ ગણતરી દર્શાવીને આપણને નિયમિત બનાવે છે.',
    hi: 'घड़ी हमें समय की पाबंदी और अनुशासन सिखाती है। यह घंटे, मिनट और सेकंड की सही जानकारी देकर हमारी दिनचर्या बनाती है।',
    en: 'Clocks measure the passage of time accurately in hours, minutes, and seconds, teaching children the value of punctuality.',
  },
  'gravity': {
    aliases: ['sci-gravity', 'ગુરુત્વાકર્ષણ', 'गुरुत्वाकर्षण'],
    gu: 'સર આઇઝેક ન્યૂટને ઝાડ પરથી સફરજન પડતાં જોઈને ગુરુત્વાકર્ષણ બળની શોધ કરી હતી, જે આપણને જમીન સાથે જોડી રાખે છે.',
    hi: 'सर आइजक न्यूटन ने पेड़ से सेब गिरते देखकर गुरुत्वाकर्षण बल की खोज की थी, जो हमें ज़मीन पर टिकाए रखता है।',
    en: 'Sir Isaac Newton formulated the Law of Universal Gravitation after observing a falling apple, explaining orbital motion.',
  },
  'telescope': {
    aliases: ['sci-telescope', 'ટેલિસ્કોપ', 'દૂરબીન', 'टेलीस्कोप', 'दूरबीन'],
    gu: 'ગેલિલિયો ગેલિલીએ ટેલિસ્કોપની મદદથી આકાશમાં ગ્રહો, તારાઓ અને ચંદ્રના ખાડાઓનો સૌપ્રથમ ઊંડાણપૂર્વક અભ્યાસ કર્યો હતો.',
    hi: 'गैलीलियो गैलीली ने टेलीस्कोप (दूरबीन) की मदद से अंतरिक्ष में चंद्रमा, तारों और दूरस्थ ग्रहों का पहली बार अध्ययन किया था।',
    en: 'Galileo Galilei pioneered the use of the optical telescope for astronomy, discovering Jupiter’s four largest moons.',
  },
  'microscope': {
    aliases: ['sci-microscope', 'માઇક્રોસ્કોપ', 'સૂક્ષ્મદર્શક', 'माइक्रोस्कोप', 'सूक्ष्मदर्शी'],
    gu: 'માઇક્રોસ્કોપ (સૂક્ષ્મદર્શક યંત્ર) વડે નરી આંખે ન દેખાતા સૂક્ષ્મ જીવાણુઓ અને કોષોને હજારો ગણા મોટા કરીને જોઈ શકાય છે.',
    hi: 'माइक्रोस्कोप (सूक्ष्मदर्शी) की मदद से नंगी आंखों से न दिखने वाले सूक्ष्म जीवाणुओं और कोशिकाओं को हजारों गुना बड़ा देखा जा सकता है।',
    en: 'Microscopes reveal the unseen world of cells, bacteria, and microscopic organisms, revolutionizing biology and medicine.',
  },
  'steam-engine': {
    aliases: ['sci-steam-engine', 'વરાળ એન્જિન', 'સ્ટીમ એન્જિન', 'भाप इंजन'],
    gu: 'જેમ્સ વોટે વરાળ શક્તિથી ચાલતું એન્જિન બનાવ્યું હતું, જેનાથી વિશ્વમાં ઔદ્યોગિક ક્રાંતિ અને સ્ટીમ ટ્રેનોની શરૂઆત થઈ.',
    hi: 'जेम्स वाट ने भाप की शक्ति से चलने वाला शक्तिशाली इंजन बनाया, जिसने औद्योगिक क्रांति और रेलगाड़ियों को जन्म दिया।',
    en: 'James Watt perfected the steam engine in 1776, powering factories and locomotives and sparking the Industrial Revolution.',
  },
  'magnet': {
    aliases: ['sci-magnet', 'ચુંબક', 'ચુંબકીય', 'चुंबक'],
    gu: 'ચુંબક લોખંડની વસ્તુઓને આકર્ષે છે અને તેના બે ધ્રુવ (ઉત્તર અને દક્ષિણ) હોકાયંત્રમાં દિશા જાણવા માટે ખૂબ ઉપયોગી બને છે.',
    hi: 'चुंबक लोहे की वस्तुओं को अपनी ओर खींचता है। इसके उत्तर और दक्षिण ध्रुव दिशा सूचक कंपास में दिशाएं बताने में मदद करते हैं।',
    en: 'Magnets attract magnetic metals like iron and nickel. Their north and south poles are fundamental to navigational compasses.',
  },

  // =============================================================
  // GK MONUMENTS
  // =============================================================
  'taj': {
    aliases: ['mon-taj', 'taj mahal', 'તાજ મહેલ', 'તાજમહેલ', 'ताजमहल', 'ताज महल'],
    gu: 'તાજ મહેલ આગ્રામાં યમુના નદીના કિનારે સફેદ આરસપહાણથી બનેલું વિશ્વની સાત અજાયબીઓમાંનું એક અદભુત ઐતિહાસિક સ્મારક છે.',
    hi: 'ताजमहल आगरा में यमुना किनारे सफेद संगमरमर से बना विश्व के सात आश्चर्यों में से एक अत्यंत सुंदर स्मारक है।',
    en: 'The Taj Mahal in Agra is a breathtaking white marble mausoleum and one of the New Seven Wonders of the World.',
  },
  'statue-unity': {
    aliases: ['mon-statue-unity', 'statue of unity', 'સ્ટેચ્યુ ઓફ યુનિટી', 'સરદાર પટેલ પ્રતિમા', 'स्टैच्यू ऑफ यूनिटी'],
    gu: 'સ્ટેચ્યુ ઓફ યુનિટી ગુજરાતના નર્મદા નદીના કાંઠે આવેલી ૧૮૨ મીટર ઊંચી વિશ્વની સૌથી ઊંચી પ્રતિમા છે, જે સરદાર પટેલની સ્મૃતિમાં બનેલી છે.',
    hi: 'स्टैच्यू ऑफ यूनिटी गुजरात में नर्मदा किनारे स्थित १८२ मीटर ऊंची दुनिया की सबसे ऊंची प्रतिमा है, जो सरदार पटेल को समर्पित है।',
    en: 'The Statue of Unity in Gujarat rises 182 meters high as the world’s tallest statue, honoring iron man Sardar Vallabhbhai Patel.',
  },
  'red-fort': {
    aliases: ['mon-red-fort', 'lal qila', 'લાલ કિલ્લો', 'લાલકિલ્લો', 'लाल किला'],
    gu: 'લાલ કિલ્લો દિલ્હીમાં લાલ પથ્થરોથી બનેલો ભવ્ય કિલ્લો છે. દર વર્ષે ૧૫મી ઓગસ્ટે ભારતના વડાપ્રધાન અહીંથી ત્રિરંગો લહેરાવે છે.',
    hi: 'लाल किला दिल्ली में लाल बलुआ पत्थर से बना ऐतिहासिक दुर्ग है, जहां हर स्वतंत्रता दिवस पर प्रधानमंत्री तिरंगा फहराते हैं।',
    en: 'The Red Fort in Delhi is a magnificent fortress from which India’s Prime Minister addresses the nation every Independence Day.',
  },
  'qutub': {
    aliases: ['mon-qutub', 'qutub minar', 'કુતુબ મિનાર', 'कुतुब मीनार'],
    gu: 'કુતુબ મિનાર દિલ્હીમાં આવેલો ૭૨.૫ મીટર ઊંચો ઈંટોથી બનેલો વિશ્વનો સૌથી ઊંચો ઐતિહાસિક મિનારો છે જે યુનેસ્કો હેરિટેજ સાઇટ છે.',
    hi: 'कुतुब मीनार दिल्ली में स्थित ७२.५ मीटर ऊंची ईंटों से निर्मित दुनिया की सबसे ऊंची ऐतिहासिक मीनार है।',
    en: 'Qutub Minar in Delhi stands at 72.5 meters as the tallest brick minaret in the world, built in the 12th century.',
  },
  'india-gate': {
    aliases: ['mon-india-gate', 'ઇન્ડિયા ગેટ', 'इंडिया गेट'],
    gu: 'ઇન્ડિયા ગેટ નવી દિલ્હીમાં આવેલું ૪૨ મીટર ઊંચું રાષ્ટ્રીય સ્મારક છે, જ્યાં દેશના અમર શહીદ જવાનોની સ્મૃતિમાં જ્યોત પ્રજ્વલિત રહે છે.',
    hi: 'इंडिया गेट नई दिल्ली में स्थित ४२ मीटर ऊंचा राष्ट्रीय स्मारक है, जो देश के वीर सैनिकों के बलिदान की याद में बनाया गया है।',
    en: 'India Gate in New Delhi is an imposing 42-meter-tall arch commemorating the courage and sacrifice of Indian soldiers.',
  },
  'gateway': {
    aliases: ['mon-gateway', 'gateway of india', 'ગેટવે ઓફ ઇન્ડિયા', 'गेटवे ऑफ इंडिया'],
    gu: 'ગેટવે ઓફ ઇન્ડિયા મુંબઈના દરિયાકિનારે આવેલું ભવ્ય ઐતિહાસિક પ્રવેશદ્વાર છે, જે ભારતનું જાણીતું પ્રવાસી આકર્ષણ છે.',
    hi: 'गेटवे ऑफ इंडिया मुंबई के समुद्र तट पर स्थित भव्य ऐतिहासिक स्मारक है, जो भारत का प्रमुख पर्यटन केंद्र है।',
    en: 'The Gateway of India is an iconic 26-meter basalt arch monument erected on the waterfront in Mumbai.',
  },

  // =============================================================
  // GK PERSONALITIES
  // =============================================================
  'kalam': {
    aliases: ['pers-kalam', 'abdul kalam', 'અબ્દુલ કલામ', 'કલામ', 'अब्दुल कलाम'],
    gu: 'ડૉ. એ.પી.જે. અબ્દુલ કલામ ભારતના "મિસાઈલ મેન" અને લોકપ્રિય રાષ્ટ્રપતિ હતા. તેઓ બાળકોને મોટા સપના જોવાની પ્રેરણા આપતા હતા.',
    hi: 'डॉ. ए.पी.जे. अब्दुल कलाम भारत के "मिसाइल मैन" और अत्यंत प्रिय राष्ट्रपति थे, जिन्होंने बच्चों को सदैव बड़े सपने देखने की प्रेरणा दी।',
    en: 'Dr. A.P.J. Abdul Kalam was India’s "Missile Man" and 11th President, celebrated for his dedication to science and students.',
  },
  'tagore': {
    aliases: ['pers-tagore', 'rabindranath', 'રવીન્દ્રનાથ', 'ટાગોર', 'रवींद्रनाथ टैगोर', 'टैगोर'],
    gu: 'ગુરુદેવ રવીન્દ્રનાથ ટાગોર નોબેલ પુરસ્કાર મેળવનાર પ્રથમ ભારતીય હતા. તેમણે આપણું રાષ્ટ્રગીત "જન ગણ મન" રચ્યું હતું.',
    hi: 'गुरुदेव रवींद्रनाथ टैगोर साहित्य का नोबेल पुरस्कार पाने वाले प्रथम एशियाई थे। उन्होंने हमारे राष्ट्रगान "जन-गण-मन" की रचना की थी।',
    en: 'Rabindranath Tagore was a poet, artist, and educator who became the first Asian to win the Nobel Prize in Literature.',
  },
  'chawla': {
    aliases: ['pers-chawla', 'kalpana', 'કલ્પના ચાવલા', 'कल्पना चावला'],
    gu: 'કલ્પના ચાવલા અવકાશમાં ઉડાન ભરનાર પ્રથમ ભારતીય મૂળની મહિલા અંતરિક્ષયાત્રી હતાં. તેઓ ભારતની દીકરીઓ માટે મોટો આદર્શ છે.',
    hi: 'कल्पना चावला अंतरिक्ष में जाने वाली भारतीय मूल की पहली महिला थीं। उनका अदम्य साहस आज भी लाखों बालिकाओं को प्रेरित करता है।',
    en: 'Kalpana Chawla was the first Indian-born woman in space, inspiring young girls worldwide to reach for the stars.',
  },
  'aryabhata': {
    aliases: ['pers-aryabhata', 'આર્યભટ્ટ', 'आर्यभट्ट'],
    gu: 'આર્યભટ્ટ પ્રાચીન ભારતના વિશ્વપ્રસિદ્ધ ગણિતશાસ્ત્રી અને ખગોળશાસ્ત્રી હતા જેમણે શૂન્યની શોધ કરી અને પૃથ્વી ગોળ હોવાનું જણાવ્યું હતું.',
    hi: 'आर्यभट्ट प्राचीन भारत के महान गणितज्ञ और खगोलविद थे, जिन्होंने शून्य की अवधारणा दी और ग्रहों की गति के नियम समझाए थे।',
    en: 'Aryabhata was an ancient Indian mathematical genius who accurately calculated the value of Pi and Earth’s rotation.',
  },
  'raman': {
    aliases: ['pers-raman', 'c.v. raman', 'સી.વી. રામન', 'રામન', 'सी.वी. रमन', 'रमन'],
    gu: 'સર સી.વી. રામનને પ્રકાશના પ્રકીર્ણન (રામન ઇફેક્ટ) ની શોધ માટે નોબેલ પુરસ્કાર મળ્યો હતો. ૨૮ ફેબ્રુઆરીએ રાષ્ટ્રીય વિજ્ઞાન દિવસ ઉજવાય છે.',
    hi: 'सर सी.वी. रमन को "रमन प्रभाव" की महान खोज के लिए भौतिकी का नोबेल पुरस्कार मिला था। उनके सम्मान में २८ फरवरी को राष्ट्रीय विज्ञान दिवस मनाते हैं।',
    en: 'Sir C.V. Raman won the 1930 Nobel Prize in Physics for discovering the Raman Effect, celebrated annually as National Science Day.',
  },

  // =============================================================
  // GK GEOGRAPHY
  // =============================================================
  'himalayas': {
    aliases: ['geo-himalayas', 'હિમાલય', 'हिमालय'],
    gu: 'હિમાલય વિશ્વની સૌથી ઊંચી પર્વતમાળા છે જે ભારતનું ઉત્તર સીમાએ રક્ષણ કરે છે અને પવિત્ર નદીઓનું ઉદ્ગમ સ્થાન છે.',
    hi: 'हिमालय विश्व की सबसे ऊंची पर्वतमाला है जो भारत की उत्तरी सीमा का रक्षक है और गंगा-यमुना जैसी पावन नदियों का उद्गम है।',
    en: 'The Himalayas are the highest mountain range on Earth, home to Mount Everest and the cradle of perennial rivers.',
  },
  'ganga': {
    aliases: ['geo-ganga', 'sym-river', 'ગંગા', 'ગંગા નદી', 'गंगा', 'गंगा नदी'],
    gu: 'ગંગા ભારતની સૌથી પવિત્ર અને લાંબી નદી છે, જે હિમાલયની ગંગોત્રીમાંથી નીકળીને કરોડો લોકોને પીવાનું મીઠું પાણી પૂરું પાડે છે.',
    hi: 'गंगा भारत की सबसे पवित्र और सबसे लंबी नदी है, जो गंगोत्री हिमनद से निकलकर लाखों लोगों को अमृत तुल्य जल देती है।',
    en: 'The Ganges is India’s sacred lifeline, flowing from Himalayan glaciers across northern plains into the sea.',
  },
  'desert': {
    aliases: ['geo-desert', 'રણ', 'થાર', 'રણ પ્રદેશ', 'रेगिस्तान', 'मरुस्थल', 'थार'],
    gu: 'થારનું રણ અને કચ્છનું રણ ભારતના જાણીતા રણપ્રદેશો છે. કચ્છનું સફેદ રણ ચાંદની રાત્રે ચાંદી જેવું ઝળહળે છે!',
    hi: 'थार का मरुस्थल और कच्छ का रण भारत के प्रसिद्ध रेगिस्तानी क्षेत्र हैं। कच्छ का सफेद रण पूर्णिमा को चांदी सा चमकता है!',
    en: 'The Thar Desert and Great Rann of Kutch are famous for golden sands, vibrant culture, and shimmering white salt plains.',
  },
  'everest': {
    aliases: ['geo-everest', 'માઉન્ટ એવરેસ્ટ', 'એવરેસ્ટ', 'माउंट एवरेस्ट', 'एवरेस्ट'],
    gu: 'માઉન્ટ એવરેસ્ટ ૮,૮૪૮.૮૬ મીટરની ઊંચાઈ સાથે વિશ્વનું સૌથી ઊંચું શિખર છે, જે હિમાલય પર્વતમાળામાં આવેલું છે.',
    hi: 'माउंट एवरेस्ट ८,८४८.૮६ मीटर ऊंचाई के साथ दुनिया की सबसे ऊंची पर्वत चोटी है, जो हिमालय में स्थित है।',
    en: 'Mount Everest reaches 8,848.86 meters above sea level, standing proud as the highest point on our planet.',
  },

  // =============================================================
  // GK SPORTS
  // =============================================================
  'cricket': {
    aliases: ['sport-cricket', 'ક્રિકેટ', 'क्रिकेट'],
    gu: 'ક્રિકેટ બેટ અને બોલ વડે ૧૧-૧૧ ખેલાડીઓની બે ટીમ વચ્ચે રમાય છે. તે ભારતમાં સૌથી વધુ પ્રિય અને રોમાંચક રમત છે.',
    hi: 'क्रिकेट बैट और बॉल से खेला जाने वाला लोकप्रिय खेल है। भारत ने १९८३, २००७ और २०११ में विश्व कप जीते हैं।',
    en: 'Cricket is beloved across India, featuring 11-player teams competing with bat and ball across 22-yard pitches.',
  },
  'hockey': {
    aliases: ['sport-hockey', 'હોકી', 'हૉકી', 'हॉकी'],
    gu: 'હોકી ભારતની રાષ્ટ્રીય રમત છે. ભારતે ઓલિમ્પિકમાં હોકીમાં ૮ ગોલ્ડ મેડલ જીતીને વિશ્વમાં અજોડ ઇતિહાસ રચેલો છે!',
    hi: 'हॉकी भारत का राष्ट्रीय खेल है। भारतीय टीम ने ओलंपिक में ८ स्वर्ण पदक जीतकर विश्व रिकॉर्ड बनाया है!',
    en: 'Field hockey is India’s National Sport, celebrated for unmatched artistry and a record 8 Olympic Gold medals.',
  },
  'chess': {
    aliases: ['sport-chess', 'શતરંજ', 'ચેસ', 'शतरंज'],
    gu: 'ચેસ (શતરંજ) ની શોધ પ્રાચીન ભારતમાં થઈ હતી. તે મગજની એકાગ્રતા, વિચારવાની શક્તિ અને ધીરજ વધારતી ઉત્તમ રમત છે.',
    hi: 'शतरंज का आविष्कार प्राचीन भारत में हुआ था। यह ६४ खानों पर खेली जाने वाली बुद्धिमत्ता, एकाग्रता और रणनीति की महान खेल है।',
    en: 'Chess was invented in ancient India as Chaturanga, training strategic foresight, patience, and logic on a 64-square board.',
  },
  'athletics': {
    aliases: ['sport-athletics', 'એથ્લેટિક્સ', 'ભાલા ફેંક', 'भाला फेंक', 'दौड़ और एथलेटिक्स'],
    gu: 'એથ્લેટિક્સમાં દોડ, કૂદ અને ભાલા ફેંક જેવી રમતો હોય છે. નીરજ ચોપરાએ ભાલા ફેંકમાં ઓલિમ્પિક ગોલ્ડ મેડલ જીતી ભારતનું ગૌરવ વધાર્યું હતું!',
    hi: 'एथलेटिक्स में दौड़, कूद और भाला फेंक शामिल हैं। नीरज चोपड़ा ने टोक्यो ओलंपिक में भाला फेंक में ऐतिहासिक स्वर्ण पदक जीता था!',
    en: 'Athletics encompasses running, jumping, and throwing, highlighted by Neeraj Chopra’s historic Olympic Javelin Gold.',
  },

  // =============================================================
  // SCIENCE - HUMAN BODY & SPACE
  // =============================================================
  'body-eyes': {
    aliases: ['eyes', 'આંખ', 'આંખો', 'आंख', 'आंखें'],
    gu: 'આંખો વડે આપણે દુનિયાના સુંદર રંગો અને આકારો જોઈ શકીએ છીએ. આંખોને સ્વસ્થ રાખવા પૂરતી ઊંઘ અને લીલાં શાકભાજી જરૂરી છે.',
    hi: 'आंखें हमें दुनिया की सुंदरता और रंगों को देखने में मदद करती हैं। स्वस्थ दृष्टि के लिए हरी सब्जियां खानी चाहिए।',
    en: 'Our eyes allow us to perceive light, colors, and motion. Blinking keeps them clean and naturally hydrated.',
  },
  'body-heart': {
    aliases: ['heart', 'હૃદય', 'દિલ', 'हृदय', 'दिल'],
    gu: 'હૃદય આપણા શરીરનું અવિરત ધબકતું પમ્પ છે જે આખા શરીરમાં લોહી અને ઓક્સિજન પહોંચાડે છે. તે દિવસમાં ૧ લાખ વખત ધબકે છે!',
    hi: 'हृदय हमारे शरीर का अनवरत चलने वाला पंप है जो पूरे शरीर में रक्त पहुंचाता है। यह दिन में लगभग १ लाख बार धड़कता है!',
    en: 'The human heart beats about 100,000 times a day, pumping vital oxygen and blood to every cell in the body.',
  },
  'body-brain': {
    aliases: ['brain', 'મગજ', 'દિમાગ', 'मस्तिष्क', 'दिमाग'],
    gu: 'મગજ આપણા શરીરનું સુપરકમ્પ્યુટર છે. તે વિચારવા, યાદ રાખવા, શીખવા અને શરીરનાં તમામ અંગોનું નિયંત્રણ કરવામાં મદદ કરે છે.',
    hi: 'मस्तिष्क हमारे शरीर का सुपर कंप्यूटर है जो सोचने, सीखने, याद रखने और सभी अंगों को नियंत्रित करने का काम करता है।',
    en: 'The brain contains over 86 billion neurons, orchestrating all thoughts, memories, movements, and emotions.',
  },
  'body-lungs': {
    aliases: ['lungs', 'ફેફસાં', 'ફેફસા', 'फेफड़े'],
    gu: 'ફેફસાં આપણને શ્વાસ લેવામાં મદદ કરે છે. તે હવા માંથી તાજો ઓક્સિજન લોહીમાં ભેળવે છે અને કાર્બન ડાયોક્સાઇડ બહાર કાઢે છે.',
    hi: 'फेफड़े हमें सांस लेने में मदद करते हैं। वे ताज़ी हवा से ऑक्सीजन लेकर रक्त में मिलाते हैं और कार्बन डाइऑक्साइड बाहर निकालते हैं।',
    en: 'Our lungs breathe in fresh oxygen for our blood and exhale carbon dioxide, expanding and contracting with every breath.',
  },
  'space-earth': {
    aliases: ['earth', 'space-earth', 'પૃથ્વી', 'ધરતી', 'पृथ्वी', 'धरती'],
    gu: 'પૃથ્વી સૌરમંડળનો એકમાત્ર એવો ગ્રહ છે જ્યાં જીવન, હવા અને ૭૧% પાણી છે. તેથી તેને "વાદળી ગ્રહ" (Blue Planet) કહેવામાં આવે છે.',
    hi: 'पृथ्वी सौरमंडल का एकमात्र ज्ञात ग्रह है जहां जीवन और वायुमंडल है। सतह पर ७१% पानी होने के कारण इसे नीला ग्रह कहते हैं।',
    en: 'Earth is our home planet, unique for having liquid water oceans and an oxygen-rich atmosphere supporting life.',
  },
  'space-sun': {
    aliases: ['sun', 'space-sun', 'સૂર્ય', 'સૂરજ', 'सूर्य', 'सूरज'],
    gu: 'સૂર્ય આપણા સૌરમંડળના કેન્દ્રમાં આવેલો ધગધગતો વિશાળ તારો છે જે પૃથ્વી પર પ્રકાશ, ગરમી અને તમામ જીવનનો મુખ્ય આધાર છે.',
    hi: 'सूर्य सौरमंडल का केंद्र है और एक विशाल तारा है जिसके प्रकाश और ऊर्जा से ही पृथ्वी पर समस्त जीवन चलता है।',
    en: 'The Sun accounts for 99.8% of the solar system’s mass and radiates the light and warmth supporting all life.',
  },
  'space-moon': {
    aliases: ['moon', 'space-moon', 'ચંદ્ર', 'ચાંદ', 'चंद्रमा', 'चाँद'],
    gu: 'ચંદ્ર પૃથ્વીનો કુદરતી ઉપગ્રહ છે. ચંદ્ર પર પોતાનો પ્રકાશ નથી, તે સૂર્યના પ્રકાશથી ચમકીને રાત્રે શીતળ ચાંદની આપે છે.',
    hi: 'चंद्रमा पृथ्वी का एकमात्र प्राकृतिक उपग्रह है। यह सूर्य की रोशनी से चमकता है और रात में शीतल चांदनी बिखेरता है।',
    en: 'The Moon orbits Earth every 27.3 days, lighting up night skies and creating ocean tides with its gravity.',
  },
  'space-rocket': {
    aliases: ['rocket', 'space-rocket', 'રોકેટ', 'रॉकेट'],
    gu: 'રોકેટ શક્તિશાળી ઇંધણ વડે પૃથ્વીના ગુરુત્વાકર્ષણને પાર કરીને ઉપગ્રહો અને અંતરિક્ષયાત્રીઓને અવકાશમાં પહોંચાડે છે.',
    hi: 'रॉकेट शक्तिशाली ईंधन की मदद से पृथ्वी के गुरुत्वाकर्षण को पार कर उपग्रहों को अंतरिक्ष में स्थापित करता है।',
    en: 'Rockets use powerful propulsion to overcome Earth’s gravity, launching satellites and astronauts into orbit.',
  },

};

export function getLessonAgeAdaptation(
  lesson: LessonItem,
  ageGroup: AgeGroup,
  language: AppLanguage
): {
  tierBadge: AgeClassBadgeInfo;
  sentenceUsage: string | null;
  funFact: string | null;
  grammarPhonicsTip: string | null;
} {
  const tierBadge = getAgeClassBadgeInfo(ageGroup, language);

  // Helper to extract localized title if title is compound format (e.g. "Cat • બિલાડી • बिल्ली")
  const getLocalizedName = () => {
    if (!lesson.title) return '';
    if (lesson.title.includes('•')) {
      const parts = lesson.title.split('•').map((p) => p.trim());
      if (language === 'hi' && parts.length >= 3) return parts[2];
      if (language === 'gu' && parts.length >= 2) return parts[1];
      return parts[0];
    }
    return lesson.title;
  };

  // 1. Sentence usage for Class 1-2 (4-6) & Class 3-5 (6-8)
  let sentenceUsage: string | null = null;
  if (ageGroup !== '2-4') {
    if (language === 'gu') {
      sentenceUsage = lesson.exampleMeaningGu || null;
    } else if (language === 'hi') {
      sentenceUsage = lesson.exampleMeaningHi || null;
    } else {
      sentenceUsage = lesson.exampleMeaning || lesson.subtitle || null;
    }
  }

  // 2. Dedicated Educational Fun Fact for Class 3-5 (6-8)
  let funFact: string | null = null;
  if (ageGroup === '6-8' || ageGroup === '4-6') {
    const lid = (lesson.id || '').toLowerCase();

    // A. Ghadiya (Times Tables) Dynamic Educational Fact
    if (lesson.categoryId === 'ghadiya') {
      const match = lid.match(/^ghadiya-(\d+)-(\d+)$/);
      if (match) {
        const a = parseInt(match[1], 10);
        const b = parseInt(match[2], 10);
        const res = a * b;
        if (language === 'gu') {
          funFact = `${toGujDigits(a)} × ${toGujDigits(b)} = ${toGujDigits(res)} થાય છે. ઘડિયા પાકા કરવાથી ગુણાકાર અને ભાગાકાર ખૂબ જ સરળ અને ઝડપી બને છે.`;
        } else if (language === 'hi') {
          funFact = `${toHiDigits(a)} × ${toHiDigits(b)} = ${toHiDigits(res)} होता है। पहाड़े याद करने से गुणा और भाग की गणना बहुत आसान और तेज़ हो जाती है।`;
        } else {
          funFact = `${a} × ${b} = ${res}. Mastering times tables builds strong foundations for rapid mental math.`;
        }
      }
    }

    // B. Direct ID Match in EDUCATIONAL_FACTS_MAP
    if (!funFact && EDUCATIONAL_FACTS_MAP[lid]) {
      funFact = EDUCATIONAL_FACTS_MAP[lid][language];
    }

    // C. Stripped Prefix Match (e.g. veh-fire-truck -> fire-truck, inv-bulb -> bulb, sym-anthem -> anthem)
    if (!funFact) {
      const baseId = lid.replace(
        /^(an|veh|gk|sym|inv|mon|pers|geo|sport|hist|sci|plant|body|space|earth|water|weather|season)-/,
        ''
      );
      if (EDUCATIONAL_FACTS_MAP[baseId]) {
        funFact = EDUCATIONAL_FACTS_MAP[baseId][language];
      }
    }

    // D. Precise Title & Word Matching (avoiding prose substrings like 'sung', 'pedal', 'oxygen', 'located')
    if (!funFact) {
      const titleSegments = (lesson.title || '')
        .split(/[•\-–—,()]/)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      const wordLower = (lesson.exampleWord || '').trim().toLowerCase();

      for (const [key, factObj] of Object.entries(EDUCATIONAL_FACTS_MAP)) {
        const k = key.toLowerCase();
        const aliases = factObj.aliases ? factObj.aliases.map((a) => a.toLowerCase()) : [];
        const terms = [k, ...aliases];

        const matched = terms.some((term) => {
          if (!term) return false;
          // Exact token equality with wordLower or any title segment
          if (wordLower === term || titleSegments.includes(term)) return true;
          // Word boundary regex on title
          try {
            const reg = new RegExp(`(^|[\\s•\\-–—,()])${term}([\\s•\\-–—,()]|$)`, 'i');
            return reg.test(lesson.title || '') || reg.test(lesson.exampleWord || '');
          } catch {
            return false;
          }
        });

        if (matched) {
          funFact = factObj[language];
          break;
        }
      }
    }

    // E. Intelligent, Topic-Specific Localized Fallback (NEVER leak false-match facts or generic nature text!)
    if (!funFact) {
      if (language === 'hi') {
        if (lesson.categoryId === 'numbers') {
          const match = lesson.id.match(/^num-(\d+)$/);
          const n = match ? match[1] : (lesson.countItems || '1');
          const hiNum = toHiDigits(parseInt(String(n), 10) || 1);
          const word = lesson.exampleMeaningHi || lesson.exampleWord || '';
          funFact = `${hiNum} (${word}) - संख्या ${hiNum} को सही रूप में गिनना और लिखना सीखें।`;
        } else if (
          lesson.audioPromptHi &&
          lesson.audioPromptHi.trim().length >= 10 &&
          lesson.audioPromptHi.trim() !== (lesson.exampleWord || '').trim()
        ) {
          funFact = lesson.audioPromptHi.trim();
        } else if (
          lesson.exampleMeaningHi &&
          lesson.exampleMeaningHi.trim().length >= 10 &&
          lesson.exampleMeaningHi.trim() !== (lesson.exampleWord || '').trim()
        ) {
          funFact = lesson.exampleMeaningHi.trim();
        } else {
          const hiWord = (getLocalizedName() || lesson.exampleMeaningHi || lesson.title || '').trim();
          funFact = `${hiWord} के बारे में रोचक और महत्वपूर्ण ज्ञान प्राप्त करें और अपनी समझ बढ़ाएं।`;
        }
      } else if (language === 'gu') {
        if (lesson.categoryId === 'numbers') {
          const match = lesson.id.match(/^num-(\d+)$/);
          const n = match ? match[1] : (lesson.countItems || '1');
          const guNum = toGujDigits(parseInt(String(n), 10) || 1);
          const word = lesson.exampleMeaningGu || lesson.exampleWord || '';
          funFact = `${guNum} (${word}) - અંક ${guNum} ની ગણતરી અને સુંદર લેખન મહાવરો કરો.`;
        } else if (
          lesson.audioPromptGu &&
          lesson.audioPromptGu.trim().length >= 10 &&
          lesson.audioPromptGu.trim() !== (lesson.exampleWord || '').trim()
        ) {
          funFact = lesson.audioPromptGu.trim();
        } else if (
          lesson.exampleMeaningGu &&
          lesson.exampleMeaningGu.trim().length >= 10 &&
          lesson.exampleMeaningGu.trim() !== (lesson.exampleWord || '').trim()
        ) {
          funFact = lesson.exampleMeaningGu.trim();
        } else {
          const guWord = (getLocalizedName() || lesson.exampleMeaningGu || lesson.title || '').trim();
          funFact = `${guWord} વિશે અવનવું અને રસપ્રદ જ્ઞાન મેળવો અને પોતાની જિજ્ઞાસા વધારો.`;
        }
      } else {
        if (lesson.categoryId === 'numbers') {
          const match = lesson.id.match(/^num-(\d+)$/);
          const n = match ? match[1] : (lesson.countItems || '1');
          const name = lesson.exampleMeaning || lesson.phonetic || `Number ${n}`;
          funFact = `${n} (${name}) - Learn and practice counting and writing the number ${n}.`;
        } else if (
          lesson.audioPromptEn &&
          lesson.audioPromptEn.trim().length >= 10 &&
          lesson.audioPromptEn.trim() !== (lesson.exampleWord || '').trim()
        ) {
          funFact = lesson.audioPromptEn.trim();
        } else if (lesson.subtitle && !/[\u0A80-\u0AFF\u0900-\u097F]/.test(lesson.subtitle)) {
          funFact = lesson.subtitle.trim();
        } else if (lesson.exampleMeaning && !/[\u0A80-\u0AFF\u0900-\u097F]/.test(lesson.exampleMeaning)) {
          funFact = `${lesson.exampleMeaning} - Learn and explore fascinating details about ${lesson.exampleMeaning}.`;
        } else {
          const englishName = (getLocalizedName() || lesson.exampleWord || 'this topic').trim();
          funFact = `Discover fascinating facts and enrich your learning about ${englishName}.`;
        }
      }
    }
  }

  // 3. Phonics & Grammatical tip for Class 1-2 (4-6)
  let grammarPhonicsTip: string | null = null;
  if (ageGroup === '4-6') {
    if (lesson.phonetic) {
      grammarPhonicsTip =
        language === 'gu'
          ? `ફોનિક્સ ઉચ્ચાર: /${lesson.phonetic}/`
          : language === 'hi'
          ? `फोनिक्स उच्चारण: /${lesson.phonetic}/`
          : `Phonetic sound: /${lesson.phonetic}/`;
    }
  }

  return {
    tierBadge,
    sentenceUsage,
    funFact,
    grammarPhonicsTip,
  };
}

export function filterLessonsForClass(
  items: LessonItem[],
  ageGroup: AgeGroup,
  categoryId: string
): LessonItem[] {
  if (!items || items.length === 0) return [];

  // Numbers category custom handling
  if (categoryId === 'numbers') {
    return items.filter((l) => {
      const match = l.id.match(/^num-(\d+)$/);
      if (!match) return false;
      const n = parseInt(match[1], 10);
      if (ageGroup === '2-4') return n >= 1 && n <= 10;
      if (ageGroup === '4-6') return n >= 1 && n <= 30;
      return n >= 1 && n <= 100;
    });
  }

  // Tables / Ghadiya custom handling
  if (categoryId === 'ghadiya') {
    return items.filter((l) => {
      const tNum = parseInt(l.id.split('-')[1], 10) || 1;
      if (ageGroup === '2-4') return tNum === 1 || tNum === 2;
      if (ageGroup === '4-6') return tNum >= 1 && tNum <= 5;
      return true; // 1 to 10 for 6-8
    });
  }

  // Hindi Varnamala: provide all letters (Vyanjan + Swar tabs organize them)
  if (categoryId === 'hi-varnamala') {
    return items;
  }

  // Gujarati Varnamala: provide all letters (Kakko / Vyanjan + Swar tabs organize them)
  if (categoryId === 'gu-varnamala' || categoryId === 'gu-barakhadi') {
    return items;
  }

  // English Alphabet: provide full A to Z (all 26 letters)
  if (categoryId === 'en-alphabet') {
    return items;
  }

  // English Phonics progressive depth
  if (categoryId === 'en-phonics') {
    if (ageGroup === '2-4') {
      return items.slice(0, 8);
    }
    if (ageGroup === '4-6') {
      return items.slice(0, 16);
    }
    return items; // All 26
  }

  // General Knowledge (GK) progressive depth
  if (categoryId === 'gk') {
    if (ageGroup === '2-4') {
      return items.slice(0, 6);
    }
    if (ageGroup === '4-6') {
      return items.slice(0, 12);
    }
    return items; // All 20
  }

  // Animals & Birds progressive depth
  if (categoryId === 'animals') {
    if (ageGroup === '2-4') {
      return items.slice(0, 8);
    }
    if (ageGroup === '4-6') {
      return items.slice(0, 14);
    }
    return items; // All 20
  }

  // Fruits & Vegetables progressive depth
  if (categoryId === 'fruits') {
    if (ageGroup === '2-4') {
      return items.slice(0, 5);
    }
    if (ageGroup === '4-6') {
      return items.slice(0, 8);
    }
    return items; // All 10
  }

  // Colors, Shapes & Patterns: provide all items so UI subcategories (colors, geometry, patterns) can filter properly
  if (categoryId === 'colors-shapes') {
    return items;
  }

  // Math & Operations: provide all operations so UI tabs / subcategories can filter properly
  if (categoryId === 'math') {
    return items;
  }

  // General categories: progressive depth
  if (ageGroup === '2-4') {
    const explicit = items.filter(
      (l) => l.ageGroup === '2-4' || l.ageGroup === 'all' || !l.ageGroup
    );
    return explicit.slice(0, 10);
  }

  if (ageGroup === '4-6') {
    const explicit = items.filter(
      (l) => l.ageGroup === '2-4' || l.ageGroup === '4-6' || l.ageGroup === 'all' || !l.ageGroup
    );
    return explicit.slice(0, 18);
  }

  // 6-8: Full syllabus mastery
  return items;
}
