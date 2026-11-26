import { StoryBook, StoryScene } from '../data/storiesData';
import { formatChildName } from './nameTransliterator';
import { AppLanguage } from '../types';
import { characterAsset, appAsset } from './remoteAssets';

export interface MagicCompanion {
  id: string;
  emoji: string;
  /** Bundled transparent 3D PNG shown instead of the emoji in the UI. */
  image: any;
  nameGu: string;
  nameHi: string;
  nameEn: string;
  descGu: string;
  descHi: string;
  descEn: string;
}

export interface MagicTheme {
  id: string;
  emoji: string;
  /** Bundled transparent 3D PNG shown instead of the emoji in the UI. */
  image: any;
  titleGu: string;
  titleHi: string;
  titleEn: string;
  bgColor: string;
  badgeGu: string;
  badgeHi: string;
  badgeEn: string;
}

export interface MagicTool {
  id: string;
  emoji: string;
  /** Bundled transparent 3D PNG shown instead of the emoji in the UI. */
  image: any;
  nameGu: string;
  nameHi: string;
  nameEn: string;
}

export const MAGIC_COMPANIONS: MagicCompanion[] = [
  {
    id: 'lion',
    emoji: '🦁',
    image: characterAsset('3d_lion'),
    nameGu: 'સિંહ શેરુ',
    nameHi: 'शेर शेरू',
    nameEn: 'Sheru the Lion',
    descGu: 'બહાદુર અને વફાદાર મિત્ર',
    descHi: 'बहादुर और वफादार दोस्त',
    descEn: 'Brave & loyal buddy',
  },
  {
    id: 'elephant',
    emoji: '🐘',
    image: appAsset('magic/3d_elephant.webp'),
    nameGu: 'હાથી ગજ્જુ',
    nameHi: 'हाथी गज्जू',
    nameEn: 'Gajju the Elephant',
    descGu: 'શક્તિશાળી અને દયાળુ સાથી',
    descHi: 'बलवान और दयालु साथी',
    descEn: 'Strong & kind giant',
  },
  {
    id: 'monkey',
    emoji: '🐵',
    image: characterAsset('3d_monkey'),
    nameGu: 'વાંદરો ચીંટુ',
    nameHi: 'बंदर चींटू',
    nameEn: 'Chintu the Monkey',
    descGu: 'ચતુર અને રમુજી દોસ્ત',
    descHi: 'चतुर और नटखट दोस्त',
    descEn: 'Clever & playful pal',
  },
  {
    id: 'rabbit',
    emoji: '🐰',
    image: characterAsset('3d_hare'),
    nameGu: 'સસલું બન્ની',
    nameHi: 'खरगोश बन्नी',
    nameEn: 'Bunny the Rabbit',
    descGu: 'ઝડપી અને ક્યૂટ સાથી',
    descHi: 'फुर्तीला और प्यारा साथी',
    descEn: 'Fast & adorable friend',
  },
  {
    id: 'parrot',
    emoji: '🦜',
    image: appAsset('magic/3d_parrot.webp'),
    nameGu: 'પોપટ મીઠુ',
    nameHi: 'तोता मीठू',
    nameEn: 'Mithu the Parrot',
    descGu: 'મીઠું બોલતો હોશિયાર પંખી',
    descHi: 'मीठा बोलने वाला होशियार पक्षी',
    descEn: 'Wise talking bird',
  },
  {
    id: 'puppy',
    emoji: '🐶',
    image: appAsset('magic/3d_puppy.webp'),
    nameGu: 'ગલૂડિયું ટોમી',
    nameHi: 'पिल्ला टॉमी',
    nameEn: 'Tommy the Puppy',
    descGu: 'સૌથી પ્રેમાળ ચોકીદાર',
    descHi: 'सबसे प्यारा और सच्चा साथी',
    descEn: 'Loving & playful puppy',
  },
  {
    id: 'unicorn',
    emoji: '🦄',
    image: appAsset('magic/3d_unicorn.webp'),
    nameGu: 'જાદુઈ યુનિકોર્ન',
    nameHi: 'जादुई यूनिकॉर्न',
    nameEn: 'Sparkle the Unicorn',
    descGu: 'ચમકતો તારક રાજકુમાર',
    descHi: 'चमकता हुआ जादुई राजकुमार',
    descEn: 'Magical glittering unicorn',
  },
  {
    id: 'dolphin',
    emoji: '🐬',
    image: appAsset('magic/3d_dolphin.webp'),
    nameGu: 'ડોલ્ફિન ફ્લિપી',
    nameHi: 'डॉल्फ़िन फ़्लिप्पी',
    nameEn: 'Flippy the Dolphin',
    descGu: 'તરવામાં ઉસ્તાદ જળપરી',
    descHi: 'पानी की लहरों की रानी',
    descEn: 'Cheerful ocean swimmer',
  },
];

export const MAGIC_THEMES: MagicTheme[] = [
  {
    id: 'rainbow',
    emoji: '🌈',
    image: appAsset('magic/quest_rainbow.webp'),
    titleGu: 'મેઘધનુષ રત્નનું રહસ્ય',
    titleHi: 'इंद्रधनुष रत्न का रहस्य',
    titleEn: 'The Rainbow Crystal Quest',
    bgColor: '#E0F2FE',
    badgeGu: 'ચમકતું સાહસ',
    badgeHi: 'चमकीला रोमांच',
    badgeEn: 'Sparkling Adventure',
  },
  {
    id: 'space',
    emoji: '🚀',
    image: appAsset('magic/quest_rocket.webp'),
    titleGu: 'ચાંદામામા અને તારાઓની સફર',
    titleHi: 'चंदा मामा और तारों की सैर',
    titleEn: 'Rocket Journey to the Moon',
    bgColor: '#EDE9FE',
    badgeGu: 'અવકાશી રોમાંચ',
    badgeHi: 'अंतरिक्ष की उड़ान',
    badgeEn: 'Cosmic Voyage',
  },
  {
    id: 'icecream',
    emoji: '🍦',
    image: appAsset('magic/quest_icecream.webp'),
    titleGu: 'જાદુઈ ચોકલેટ અને આઈસ્ક્રીમ મહેલ',
    titleHi: 'जादुई चॉकलेट व आइसक्रीम महल',
    titleEn: 'The Secret Ice Cream Castle',
    bgColor: '#FCE7F3',
    badgeGu: 'મીઠો ખજાનો',
    badgeHi: 'मीठा खजाना',
    badgeEn: 'Sweet Surprise',
  },
  {
    id: 'dino',
    emoji: '🦕',
    image: appAsset('magic/quest_dino.webp'),
    titleGu: 'બેબી ડાયનાસોરનું રહસ્યમય જંગલ',
    titleHi: 'बेबी डायनासोर का जादुई जंगल',
    titleEn: 'The Friendly Dino Forest',
    bgColor: '#DCFCE7',
    badgeGu: 'જંગલ સાહસ',
    badgeHi: 'जंगल का सफर',
    badgeEn: 'Jungle Explorer',
  },
  {
    id: 'ocean',
    emoji: '🌊',
    image: appAsset('magic/quest_ocean.webp'),
    titleGu: 'દરિયાઈ મોતી અને સુવર્ણ ખજાનો',
    titleHi: 'समुद्र का जादुई मोती और खजाना',
    titleEn: 'Deep Ocean Golden Treasure',
    bgColor: '#CCFBF1',
    badgeGu: 'સમુદ્રી સફર',
    badgeHi: 'समुद्र की सैर',
    badgeEn: 'Underwater Quest',
  },
  {
    id: 'cloud',
    emoji: '🏰',
    image: appAsset('magic/quest_cloud.webp'),
    titleGu: 'વાદળોનો સ્વપ્ન મહેલ',
    titleHi: 'बादलों का उड़ता हुआ महल',
    titleEn: 'The Floating Cloud Castle',
    bgColor: '#FEF3C7',
    badgeGu: 'જાદુઈ આકાશ',
    badgeHi: 'जादुई गगन',
    badgeEn: 'Sky Kingdom',
  },
];

export const MAGIC_TOOLS: MagicTool[] = [
  {
    id: 'wand',
    emoji: '✨',
    image: appAsset('magic/tool_wand.webp'),
    nameGu: 'દયાની જાદુઈ લાકડી',
    nameHi: 'दया की जादुई छड़ी',
    nameEn: 'Magic Star Wand',
  },
  {
    id: 'balloon',
    emoji: '🎈',
    image: appAsset('magic/tool_balloon.webp'),
    nameGu: 'ઉડતો જાદુઈ ફુગ્ગો',
    nameHi: 'उड़ता जादुई गुब्बारा',
    nameEn: 'Flying Dream Balloon',
  },
  {
    id: 'shoes',
    emoji: '👟',
    image: appAsset('magic/tool_shoes.webp'),
    nameGu: 'ઝડપી દોડતા સુપર શૂઝ',
    nameHi: 'सुपर स्पीड वाले जूते',
    nameEn: 'Super Speed Star Shoes',
  },
  {
    id: 'cape',
    emoji: '🦸',
    image: appAsset('magic/tool_cape.webp'),
    nameGu: 'સુવર્ણ સુપરહીરો કેપ',
    nameHi: 'स्वर्ण जादुई केप',
    nameEn: 'Golden Superhero Cape',
  },
  {
    id: 'compass',
    emoji: '🧭',
    image: appAsset('magic/tool_compass.webp'),
    nameGu: 'રહસ્ય શોધક જાદુઈ હોકાયંત્ર',
    nameHi: 'जादुई दिशा-सूचक कम्पास',
    nameEn: 'Magic Star Compass',
  },
];

// ---------------------------------------------------------------------------
// Step-by-step Magic Story wizard (ages 2-8): a short, curated set of choices so
// the screen stays uncluttered, plus the voice lines read aloud at every step.
// ---------------------------------------------------------------------------

export type WizardStep = 1 | 2 | 3;

export const WIZARD_COMPANION_IDS = ['lion', 'elephant', 'monkey', 'rabbit', 'puppy', 'unicorn'] as const;
export const WIZARD_QUEST_IDS = ['rainbow', 'space', 'dino'] as const;
export const WIZARD_TOOL_IDS = ['wand', 'balloon', 'shoes'] as const;

const pickById = <T extends { id: string }>(list: T[], ids: readonly string[]): T[] =>
  ids.map((id) => list.find((item) => item.id === id)).filter((item): item is T => Boolean(item));

export function getWizardChoices() {
  return {
    companions: pickById(MAGIC_COMPANIONS, WIZARD_COMPANION_IDS),
    quests: pickById(MAGIC_THEMES, WIZARD_QUEST_IDS),
    tools: pickById(MAGIC_TOOLS, WIZARD_TOOL_IDS),
  };
}

/** Real animal sound played when a companion card is tapped (keys of soundEffects' animal library). */
export const COMPANION_SOUND_KEYS: Record<string, string> = {
  lion: 'lion',
  elephant: 'elephant',
  monkey: 'monkey',
  rabbit: 'rabbit',
  puppy: 'dog',
  unicorn: 'horse',
  parrot: 'parrot',
};

type Tri = { gu: string; hi: string; en: string };
const pickLang = (lang: AppLanguage, s: Tri) => (lang === 'gu' ? s.gu : lang === 'hi' ? s.hi : s.en);

/** Short header title for each wizard step. */
export function getWizardTitle(step: WizardStep, lang: AppLanguage): string {
  const titles: Record<WizardStep, Tri> = {
    1: { en: 'Who is the Hero?', gu: 'હીરો કોણ છે?', hi: 'हीरो कौन है?' },
    2: { en: 'Pick Your Best Buddy!', gu: 'તમારો દોસ્ત પસંદ કરો!', hi: 'अपना दोस्त चुनें!' },
    3: { en: 'Where Are We Going?', gu: 'આપણે ક્યાં જઈશું?', hi: 'हम कहाँ जाएंगे?' },
  };
  return pickLang(lang, titles[step]);
}

/** Voice line read aloud when a step opens (and when the speaker / header is tapped). */
export function getWizardPrompt(step: WizardStep, lang: AppLanguage, heroName: string): string {
  const name = (heroName || '').trim();
  if (step === 1) {
    return pickLang(lang, {
      en: `Are you ready for an adventure, ${name || 'little hero'}?`,
      gu: `${name || 'નાના હીરો'}, શું તમે સાહસ માટે તૈયાર છો?`,
      hi: `${name || 'नन्हे हीरो'}, क्या आप रोमांच के लिए तैयार हैं?`,
    });
  }
  if (step === 2) {
    return pickLang(lang, {
      en: 'Pick your best buddy!',
      gu: 'તમારો સૌથી સારો દોસ્ત પસંદ કરો!',
      hi: 'अपना सबसे अच्छा दोस्त चुनें!',
    });
  }
  return pickLang(lang, {
    en: 'Where are we going? Then pick a magic tool!',
    gu: 'આપણે ક્યાં જઈશું? પછી એક જાદુઈ સાધન પસંદ કરો!',
    hi: 'हम कहाँ जा रहे हैं? फिर एक जादुई साधन चुनें!',
  });
}

export interface GenerateStoryOptions {
  childName?: string;
  companionId?: string;
  themeId?: string;
  toolId?: string;
}

export function generatePersonalizedStory(options: GenerateStoryOptions): StoryBook {
  const rawName = (options.childName || '').trim() || 'Rohan';
  const nameGu = formatChildName(rawName, 'gu');
  const nameHi = formatChildName(rawName, 'hi');
  const nameEn = formatChildName(rawName, 'en');

  const companion =
    MAGIC_COMPANIONS.find((c) => c.id === options.companionId) || MAGIC_COMPANIONS[0];
  const theme =
    MAGIC_THEMES.find((t) => t.id === options.themeId) || MAGIC_THEMES[0];
  const tool =
    MAGIC_TOOLS.find((t) => t.id === options.toolId) || MAGIC_TOOLS[0];

  const storyId = `magic-${theme.id}-${companion.id}-${Date.now()}`;

  // Build localized narrative scenes based on theme
  let scenes: StoryScene[] = [];
  let moralGu = '';
  let moralHi = '';
  let moralEn = '';

  if (theme.id === 'rainbow') {
    moralGu = 'સાચી મિત્રતા, દયા અને હિંમતથી દરેક મુશ્કેલી જીતી શકાય છે.';
    moralHi = 'सच्ची दोस्ती, दया और हिम्मत से हर मंज़िल आसान हो जाती है।';
    moralEn = 'With kindness, true friendship, and courage, any dream can come true.';

    scenes = [
      {
        page: 1,
        illustration: `☀️ ${companion.emoji} 🌈 📜`,
        textGu: `એક સુંદર અને સોનેરી સવારે, આપણા બહાદુર દોસ્ત ${nameGu} અને તેનો વહાલો મિત્ર ${companion.nameGu} બગીચામાં રમી રહ્યા હતા. અચાનક આકાશમાંથી એક ચમકતો સોનેરી પત્ર આવ્યો! તેમાં લખ્યું હતું: "વાદળોની પાછળ રહેલું મેઘધનુષ રત્ન ખોવાઈ ગયું છે, માત્ર સાચા દિલનો બાળક જ તેને શોધી શકે છે!" ${nameGu} એ પોતાની ${tool.nameGu} હાથમાં લીધી અને સાહસ શરૂ થયું.`,
        textHi: `एक सुनहरी और खुशगवार सुबह, हमारे नन्हें नायक ${nameHi} और उनका प्यारा साथी ${companion.nameHi} खेल रहे थे। तभी आसमान से एक जगमगाता सुनहरा खत उतरा! उसमें लिखा था: "इंद्रधनुष का खोया हुआ जादुई रत्न केवल एक सच्चे और दयालु दिल का बच्चा ही ढूंढ सकता है!" ${nameHi} ने अपनी ${tool.nameHi} संभाली और उनका जादुई सफर शुरू हुआ।`,
        textEn: `On a bright and sunny morning, our brave little hero ${nameEn} and best buddy ${companion.nameEn} were playing happily. Suddenly, a sparkling golden envelope drifted down from the sky! It read: "The legendary Rainbow Crystal is missing beyond the clouds; only a kind-hearted champion can find it!" ${nameEn} picked up their ${tool.nameEn} and the magical quest began!`,
      },
      {
        page: 2,
        illustration: `🌊 🌉 ${tool.emoji} ✨`,
        textGu: `રસ્તામાં એક ખળખળ વહેતી સંગીતમય નદી આવી, પણ તેના પર કોઈ પુલ નહોતો. ${nameGu} એ જરાય હિંમત ન હારી! તેમણે પોતાની ${tool.nameGu} હવામાં લહેરાવી અને કહ્યું: "સૌનું ભલું થાઓ!" ચમત્કાર થયો! ચમકતા તારાઓમાંથી એક સુંદર ફૂલોનો પુલ બની ગયો, અને ${companion.nameGu} ખુશીથી કૂદકો મારીને સામે કાંઠે પહોંચી ગયો.`,
        textHi: `रास्ते में एक कल-कल बहती सुरम्य नदी आई, लेकिन उस पर कोई पुल नहीं था। ${nameHi} ने तनिक भी हिम्मत नहीं हारी! उन्होंने अपनी ${tool.nameHi} को हवा में लहराया और कहा: "सबका भला हो!" अचानक चमत्कार हुआ! चमकते तारों से एक सुंदर फूलों का पुल बन गया, और ${companion.nameHi} खुशी से उछलते हुए पार पहुंच गया।`,
        textEn: `Along the trail, a wide musical river blocked their way, with no bridge in sight. But ${nameEn} did not lose heart! Waving their ${tool.nameEn}, they whispered: "Let kindness lead the way!" Instantly, glittering stardust turned into a glowing bridge of flowers, and ${companion.nameEn} leaped across with joy!`,
      },
      {
        page: 3,
        illustration: `🌳 🐿️ ❓ 🤝`,
        textGu: `આગળ જતાં એક મોટો વડલો આવ્યો. ત્યાં એક નાનકડી ખિસકોલી રડતી હતી કારણ કે તેની મીઠી બદામ ઝાડની ઊંચી ડાળીમાં ફસાઈ ગઈ હતી. હવે ${nameGu} પાસે બે રસ્તા હતા.`,
        textHi: `आगे चलकर एक विशाल बरगद का पेड़ आया। वहाँ एक नन्हीं गिलहरी उदास बैठी थी क्योंकि उसकी मीठी बादाम बहुत ऊँची टहनी में फंस गई थी। अब ${nameHi} के सामने दो रास्ते थे।`,
        textEn: `Further ahead by an ancient banyan tree, a tiny squirrel was crying because its sweet nut was stuck high up on a tall branch. Now ${nameEn} had an important choice to make.`,
        choice: {
          questionGu: `${nameGu} એ શું કરવું જોઈએ?`,
          questionHi: `${nameHi} को क्या करना चाहिए?`,
          questionEn: `What should ${nameEn} do?`,
          options: [
            {
              textGu: 'ઊભા રહીને ખિસકોલીની મદદ કરવી 🐿️❤️',
              textHi: 'रुककर नन्हीं गिलहरी की मदद करना 🐿️❤️',
              textEn: 'Stop and help the little squirrel 🐿️❤️',
              isBest: true,
              feedbackGu: `શાબાશ! ${nameGu} એ ખિસકોલીને બદામ ઉતારી આપી. ખુશ થઈને ખિસકોલીએ ગુપ્ત ગુફાનો દરવાજો બતાવ્યો!`,
              feedbackHi: `शाबाश! ${nameHi} ने बादाम उतार कर दी। खुश होकर गिलहरी ने जादुई गुफा का गुप्त रास्ता दिखाया!`,
              feedbackEn: `Wonderful! ${nameEn} retrieved the nut. Grateful, the squirrel pointed right to the secret crystal cave!`,
            },
            {
              textGu: 'મોડું થાય છે એટલે સીધા આગળ દોડી જવું 🏃‍♂️',
              textHi: 'देर हो रही है इसलिए सीधे आगे दौड़ जाना 🏃‍♂️',
              textEn: 'Hurry ahead without stopping 🏃‍♂️',
              isBest: false,
              feedbackGu: `ખિસકોલી ભૂખી રહી ગઈ. ${companion.nameGu} એ કહ્યું: "પહેલાં મદદ કરીએ તો જ રસ્તો મળે!"`,
              feedbackHi: `गिलहरी भूखी रह गई। ${companion.nameHi} ने कहा: "मदद करने से ही सही राह मिलती है!"`,
              feedbackEn: `The squirrel remained sad. ${companion.nameEn} said: "Helping friends always lights up the path!"`,
            },
          ],
        },
      },
      {
        page: 4,
        illustration: `💎 🌈 🎉 👑`,
        textGu: `ખિસકોલીના બતાવેલા રસ્તે પહોંચતાં જ દિવ્ય પ્રકાશ ફેલાઈ ગયો! ત્યાં સોનેરી થાળમાં સાત રંગોથી ઝળહળતું મેઘધનુષ રત્ન ચમકી રહ્યું હતું! આકાશમાંથી ફૂલો વરસ્યા અને બધા પ્રાણીઓએ તાળીઓ પાડી: "શાબાશ ${nameGu}! તમે સાચા ચેમ્પિયન છો!" ${nameGu} અને ${companion.nameGu} આનંદથી નાચી ઊઠ્યા!`,
        textHi: `गुफा के अंदर पहुंचते ही दिव्य रोशनी फैल गई! वहाँ सोने की वेदी पर सतरंगी किरणों से चमकता इंद्रधनुष रत्न जगमगा रहा था! आसमान से फूलों की बारिश हुई और सबने तालियाँ बजाईं: "बधाई ${nameHi}! आप सच्चे विजेता हैं!" ${nameHi} और ${companion.nameHi} खुशी से झूम उठे!`,
        textEn: `Stepping into the cave, a dazzling light filled the air! There, resting on a pedestal, the magnificent Rainbow Crystal shimmered in seven brilliant colors! Petals floated down from the sky as all forest friends cheered: "Hooray for ${nameEn}, our true champion!" ${nameEn} and ${companion.nameEn} celebrated with victory high-fives!`,
      },
    ];
  } else if (theme.id === 'space') {
    moralGu = 'નવું જાણવાની ઉત્સુકતા અને હિંમત આપણને તારાઓ સુધી પહોંચાડે છે.';
    moralHi = 'नया सीखने की जिज्ञासा और साहस हमें चाँद-तारों तक ले जाता है।';
    moralEn = 'Curiosity, teamwork, and courage can take you all the way to the stars.';

    scenes = [
      {
        page: 1,
        illustration: `🌌 🚀 ${companion.emoji} ⭐`,
        textGu: `રાત્રિના નીરવ આકાશમાં ચાંદામામા હસી રહ્યા હતા. ${nameGu} અને તેમના સાથી ${companion.nameGu} એ ઘરની અગાશીમાંથી જોયું કે એક નાનો સોનેરી તારો ધરતી પર ઉતરી આવ્યો છે! તારાએ કહ્યું: "હું રસ્તો ભૂલી ગયો છું, મને મારા ઘર ચાંદામામા પાસે પહોંચાડો!" ${nameGu} એ પોતાની ${tool.nameGu} ની મદદથી રોકેટ સક્રિય કર્યું અને અવકાશ સફર શરૂ થઈ.`,
        textHi: `रात के शांत आसमान में चंदा मामा मुस्कुरा रहे थे। ${nameHi} और उनके साथी ${companion.nameHi} ने छत से देखा कि एक नन्हा तारा धरती पर उतर आया है! तारे ने कहा: "मैं रास्ता भटक गया हूँ, मुझे चंदा मामा के पास पहुंचा दो!" ${nameHi} ने अपनी ${tool.nameHi} की मदद से चमत्कारी रॉकेट तैयार किया और अंतरिक्ष की उड़ान शुरू हुई।`,
        textEn: `Under a velvety starry sky, the moon was smiling down. ${nameEn} and their pal ${companion.nameEn} spotted a tiny lost star sparkling on their rooftop! The star whispered: "I lost my way home to the moon!" Ready for action, ${nameEn} powered up their cosmic rocket with their ${tool.nameEn} and blasted off into space!`,
      },
      {
        page: 2,
        illustration: `🪐 ☄️ ${tool.emoji} ✨`,
        textGu: `અવકાશમાં વજન વગર હવામાં તરવાની ખૂબ મજા પડી! અચાનક સામેથી ચમકતા રંગબેરંગી ઉલ્કા-પથ્થરોનો વરસાદ આવ્યો. ${nameGu} એ હિંમતપૂર્વક પોતાની ${tool.nameGu} નો ઉપયોગ કર્યો અને રોકેટની આસપાસ એક સુરક્ષા કવચ બનાવી લીધું. રોકેટ સનસનાટીભેર સુરક્ષિત રીતે આગળ વધી ગયું!`,
        textHi: `अंतरिक्ष में शून्य गुरुत्वाकर्षण में हवा में तैरने का बड़ा मज़ा आया! तभी सामने से रंग-बिरंगे उल्कापिंडों की बौछार आई। ${nameHi} ने सूझबूझ से अपनी ${tool.nameHi} का इस्तेमाल किया और रॉकेट के चारों ओर सुरक्षा चक्र बना दिया। रॉकेट सुरक्षित रूप से आगे बढ़ गया!`,
        textEn: `Floating weightlessly in zero gravity was pure fun! Suddenly, a gentle shower of colorful space crystals appeared ahead. With quick thinking, ${nameEn} used their ${tool.nameEn} to create a protective glowing forcefield, steering the rocket smoothly through the galaxy!`,
      },
      {
        page: 3,
        illustration: `🌕 👽 ❓ 🤝`,
        textGu: `ચાંદામામાની નજીક પહોંચ્યા ત્યારે એક નાનકડો ક્યૂટ સ્પેસ રોબોટ બેટરી વિના બંધ થઈ ગયેલો દેખાયો. ${nameGu} પાસે હવે સમય ઓછો હતો.`,
        textHi: `चाँद के करीब पहुंचे तो एक नन्हा प्यारा स्पेस रोबोट मिला, जिसकी ऊर्जा समाप्त हो गई थी। ${nameHi} के पास अब समय कम था।`,
        textEn: `Near the lunar orbit, they found a friendly little space robot stranded with low energy. ${nameEn} had to make a swift decision.`,
        choice: {
          questionGu: `${nameGu} એ શું કરવું જોઈએ?`,
          questionHi: `${nameHi} को क्या करना चाहिए?`,
          questionEn: `What should ${nameEn} do?`,
          options: [
            {
              textGu: 'રોબોટને એનર્જી આપીને ચાલુ કરવો 🤖⚡',
              textHi: 'रोबोट को ऊर्जा देकर फिर से चालू करना 🤖⚡',
              textEn: 'Share power and recharge the friendly robot 🤖⚡',
              isBest: true,
              feedbackGu: `સરસ નિર્ણય! રોબોટે ખુશ થઈને ચાંદામામાના ગુપ્ત દરવાજાનો પાસવર્ડ જણાવી દીધો!`,
              feedbackHi: `शानदार फैसला! रोबोट ने खुश होकर चंदा मामा के मुख्य द्वार का गुप्त पासवर्ड बता दिया!`,
              feedbackEn: `Brilliant! Recharged, the joyful robot guided them straight through the moon's golden gates!`,
            },
            {
              textGu: 'રોબોટને ત્યાં જ મૂકીને આગળ જવું 🚀',
              textHi: 'रोबोट को वहीं छोड़कर आगे बढ़ जाना 🚀',
              textEn: 'Fly directly ahead without helping 🚀',
              isBest: false,
              feedbackGu: `ચાંદામામાના દરવાજે તાળું હતું. ${companion.nameGu} એ કહ્યું: "મિત્રને મદદ કરી હોત તો સરળતાથી પ્રવેશ મળત!"`,
              feedbackHi: `चाँद के मुख्य द्वार पर ताला लगा था। ${companion.nameHi} ने कहा: "मदद की होती तो चाबी मिल जाती!"`,
              feedbackEn: `The moon gate was locked. ${companion.nameEn} reminded: "Helping others always opens the right doors!"`,
            },
          ],
        },
      },
      {
        page: 4,
        illustration: `🌕 👑 ⭐ 🎊`,
        textGu: `ચાંદામામાના દરબારમાં પહોંચતાં જ ચાંદામામાએ હસીને નાના તારાને પોતાના ખોળામાં લીધો! ચાંદામામાએ ${nameGu} ને સોનેરી તારક મુગટ પહેરાવ્યો અને કહ્યું: "તમે આજના સૌથી બહાદુર અવકાશવીર છો!" ${nameGu} અને ${companion.nameGu} નું નામ આકાશમાં ચમકતા તારાઓમાં કંડારાઈ ગયું!`,
        textHi: `चंदा मामा के दरबार में पहुंचते ही चंदा मामा ने मुस्कुराकर नन्हें तारे को गले लगा लिया! उन्होंने ${nameHi} को एक चमकदार स्वर्ण मुकुट पहनाया और कहा: "तुम ब्रह्मांड के सबसे दयालु और बहादुर नायक हो!" ${nameHi} और ${companion.nameHi} का नाम आकाशगंगा में जगमगा उठा!`,
        textEn: `Arriving at the Moon Palace, the Moon smiled warmly and embraced the little star! The Moon placed a sparkling crown on ${nameEn}'s head and declared: "You are the bravest explorer in the universe!" ${nameEn} and ${companion.nameEn} returned home like legendary space heroes!`,
      },
    ];
  } else if (theme.id === 'icecream') {
    moralGu = 'વહેંચીને ખાવાથી અને જરૂરિયાતમંદને મદદ કરવાથી દરેક ખુશી બમણી થઈ જાય છે.';
    moralHi = 'बांटकर खाने और दूसरों की मदद करने से हर खुशी दोगुनी मीठी हो जाती है।';
    moralEn = 'Sharing your treats and spreading kindness makes every moment twice as sweet.';

    scenes = [
      {
        page: 1,
        illustration: `🏰 🍦 🍫 ${companion.emoji}`,
        textGu: `ગરમીની બપોરે ${nameGu} અને ${companion.nameGu} બગીચામાં બેઠા હતા. અચાનક ગુલાબી વાદળમાંથી વેનીલા અને ચોકલેટની સુગંધ આવવા લાગી! ત્યાં એક જાદુઈ ચોકલેટનો દરવાજો પ્રગટ થયો, જેના પર લખ્યું હતું: "સ્વાગત છે જાદુઈ આઈસ્ક્રીમ મહેલમાં!" ${nameGu} એ પોતાની ${tool.nameGu} સંભાળી અને સ્વાદિષ્ટ સાહસમાં પગ મૂક્યો.`,
        textHi: `दोपहर की गुनगुनी धूप में ${nameHi} और ${companion.nameHi} बैठे थे। अचानक गुलाबी बादलों से वैनिला और स्ट्रॉबेरी की मीठी खुशबू आने लगी! वहाँ एक जादुई चॉकलेट का दरवाज़ा दिखा, जिस पर लिखा था: "स्वागत है गुप्त आइसक्रीम महल में!" ${nameHi} ने अपनी ${tool.nameHi} संभाली और इस मीठे सफर में कदम रखा।`,
        textEn: `On a pleasant afternoon, ${nameEn} and ${companion.nameEn} were relaxing when a delicious aroma of vanilla and strawberries filled the breeze! A secret chocolate door appeared in the clouds, reading: "Welcome to the Secret Ice Cream Castle!" Grabbing their ${tool.nameEn}, ${nameEn} stepped into a wonderland of treats!`,
      },
      {
        page: 2,
        illustration: `🍫 🧇 ${tool.emoji} ✨`,
        textGu: `મહેલની અંદર ખળખળ વહેતો ગરમ ચોકલેટનો ફુવારો હતો અને રસ્તો ક્રિસ્પી વેફરનો બનેલો હતો. રસ્તામાં એક ખાડો આવ્યો જેમાં જેલી જામી ગઈ હતી. ${nameGu} એ પોતાની ${tool.nameGu} નો ઉપયોગ કર્યો અને જેલીને રબડી જેવા સ્મૂધ પુલમાં ફેરવી દીધી! બંને દોસ્તો હસતાં હસતાં આગળ વધ્યા.`,
        textHi: `महल के अंदर पिघली हुई गर्म चॉकलेट का फव्वारा बह रहा था और रास्ते कुरकुरी वेफर्स के बने थे। आगे एक गड्ढा आया जिसमें चिपचिपी जेली भरी थी। ${nameHi} ने तुरंत अपनी ${tool.nameHi} घुमाई और जेली को एक ठोस स्वादिष्ट पुल में बदल दिया! दोनों दोस्त मुस्कुराते हुए आगे बढ़ गए।`,
        textEn: `Inside, warm chocolate fountains flowed past crisp waffle pathways! Ahead, a sticky marshmallow canyon blocked the trail. With a clever wave of their ${tool.nameEn}, ${nameEn} transformed the fluff into a sturdy cookie bridge, bouncing happily across with ${companion.nameEn}!`,
      },
      {
        page: 3,
        illustration: `🧸 🍯 ❓ 🤝`,
        textGu: `દરબારના દરવાજે એક નાનકડો ટેડી રીંછ ભૂખ્યો બેઠો હતો. તેને ખૂબ જ ભૂખ લાગી હતી પણ તેની પાસે ખાવા માટે કંઈ નહોતું. હવે ${nameGu} એ નિર્ણય લેવાનો હતો.`,
        textHi: `महल के मुख्य द्वार पर एक नन्हा टेडी भालू उदास बैठा था। उसे बहुत भूख लगी थी लेकिन उसके पास खाने को कुछ नहीं था। अब ${nameHi} को फैसला लेना था।`,
        textEn: `Guarding the inner door sat a hungry little teddy bear who had lost his lunch basket. ${nameEn} had to choose what to do.`,
        choice: {
          questionGu: `${nameGu} એ શું કરવું જોઈએ?`,
          questionHi: `${nameHi} को क्या करना चाहिए?`,
          questionEn: `What should ${nameEn} do?`,
          options: [
            {
              textGu: 'પોતાનો જાદુઈ ચોકલેટ બાર ટેડી સાથે વહેંચવો 🍫❤️',
              textHi: 'अपनी जादुई चॉकलेट टेडी भालू के साथ बांटना 🍫❤️',
              textEn: 'Share their sweet snack with the hungry teddy 🍫❤️',
              isBest: true,
              feedbackGu: `ખૂબ સુંદર! ટેડી રીંછે ખુશ થઈને શાહી આઈસ્ક્રીમ ખજાનાની સુવર્ણ ચાવી આપી દીધી!`,
              feedbackHi: `अति सुंदर! टेडी ने खुश होकर शाही आइसक्रीम खजाने की सुनहरी चाबी थमा दी!`,
              feedbackEn: `Magnificent! Delighted, the teddy smiled and unlocked the grand golden ice cream vault!`,
            },
            {
              textGu: 'એકલાં જ અંદર દોડી જવું 🏃‍♂️',
              textHi: 'अकेले ही सीधे अंदर चले जाना 🏃‍♂️',
              textEn: 'Keep moving alone without sharing 🏃‍♂️',
              isBest: false,
              feedbackGu: `દરવાજો ખુલ્યો નહીં. ${companion.nameGu} એ કહ્યું: "વહેંચીને ખાવાથી જ અસલી મીઠાશ મળે છે!"`,
              feedbackHi: `दरवाजा नहीं खुला। ${companion.nameHi} ने समझाया: "बांटने से ही खुशियों का द्वार खुलता है!"`,
              feedbackEn: `The door remained sealed. ${companion.nameEn} said: "Sharing sweetness is the key to true joy!"`,
            },
          ],
        },
      },
      {
        page: 4,
        illustration: `🍧 🍦 👑 🎉`,
        textGu: `મુખ્ય હોલમાં પ્રવેશતાં જ અદ્ભુત દ્રશ્ય દેખાયું! રંગબેરંગી ચમકતી સ્પ્રિંકલ્સવાળો ગ્રાન્ડ શાહી આઈસ્ક્રીમ કપ તૈયાર હતો! આઈસ્ક્રીમના રાજાએ ${nameGu} ને "સ્વીટ સુપરહીરો" નો ખિતાબ આપ્યો! બધા દોસ્તોએ સાથે મળીને મીઠાઈ માણી અને આનંદની છોળો ઉડી!`,
        textHi: `मुख्य कक्ष में प्रवेश करते ही जादुई नज़ारा दिखा! रंग-बिरंगी स्प्रिंकल्स और फलों से सजा विशाल शाही आइसक्रीम कप जगमगा रहा था! आइसक्रीम के राजा ने ${nameHi} को "दयालु राजकुमार" का ताज पहनाया! सबने मिलकर दावत का आनंद लिया!`,
        textEn: `Entering the grand hall, fireworks of rainbow sprinkles lit up the ceiling! A towering golden sundae crowned with cherries awaited them! The Ice Cream King crowned ${nameEn} as the "Sweet Champion of Kindness!" Together, everyone enjoyed the sweetest party in the land!`,
      },
    ];
  } else if (theme.id === 'dino') {
    moralGu = 'પ્રાણીઓ પ્રત્યે પ્રેમ અને સહાનુભૂતિ રાખવાથી દુનિયા વધુ સુંદર બને છે.';
    moralHi = 'पशु-पक्षियों के प्रति प्रेम और दया रखने से हम सच्चे हीरो बनते हैं।';
    moralEn = 'Showing compassion to nature and animals makes you a true real-life hero.';

    scenes = [
      {
        page: 1,
        illustration: `🌴 🦕 🐾 ${companion.emoji}`,
        textGu: `એક હરિયાળા જંગલમાં પંખીઓ કલરવ કરી રહ્યા હતા. ${nameGu} અને તેમના દોસ્ત ${companion.nameGu} ને જમીન પર એક વિશાળ રહસ્યમય પગલું જોવા મળ્યું! તે પગલું ડાયનાસોરનું હતું. આગળથી ધીમો 'ચીપ-ચીપ' અવાજ આવ્યો. ${nameGu} એ પોતાની ${tool.nameGu} સંભાળી અને નિર્ભય બનીને જંગલના ઊંડાણમાં ડગ માંડ્યા.`,
        textHi: `एक घने हरे-भरे जंगल में पक्षी चहक रहे थे। ${nameHi} और उनके साथी ${companion.nameHi} को ज़मीन पर एक विशालकाय रहस्यमयी पदचिह्न दिखाई दिया! वह नन्हे डायनासोर का था। आगे से धीमी रोने की आवाज़ आई। ${nameHi} ने अपनी ${tool.nameHi} थामी और निडर होकर जंगल की ओर बढ़ चले।`,
        textEn: `Deep in an emerald rainforest, birds were singing cheerful melodies. ${nameEn} and companion ${companion.nameEn} spotted gigantic friendly footprints on the mossy trail! A soft whimper echoed from the bamboo grove. Ready to explore, ${nameEn} held their ${tool.nameEn} and bravely led the way!`,
      },
      {
        page: 2,
        illustration: `🌿 🕸️ ${tool.emoji} ✨`,
        textGu: `જંગલની ગીચ વેલાઓમાં એક નાનકડો લીલો બેબી ડાયનાસોર ફસાઈ ગયો હતો અને બહાર નીકળી શકતો નહોતો. ${nameGu} એ શાંતિથી પાસે જઈને પ્રેમથી પંપાળ્યો અને પોતાની ${tool.nameGu} ની મદદથી કાંટાળી વેલાઓને દૂર કરી દીધી! બેબી ડાયનાસોર ખુશ થઈને કૂદવા લાગ્યો.`,
        textHi: `जंगल की घनी बेलों में एक नन्हा हरा बेबी डायनासोर फंस गया था और बाहर नहीं आ पा रहा था। ${nameHi} ने हौसले से आगे बढ़कर उसे सहलाया और अपनी ${tool.nameHi} से कटीली लताओं को अलग कर दिया! नन्हा डायनासोर आज़ाद होकर खुशी से चहकने लगा।`,
        textEn: `Tangled in climbing vines was a cute baby green dinosaur, unable to reach his family. Speaking softly, ${nameEn} approached gently and used their ${tool.nameEn} to untie the knotty vines. Free at last, the baby dino nudged them affectionately!`,
      },
      {
        page: 3,
        illustration: `🌋 🪨 ❓ 🤝`,
        textGu: `હવે બેબી ડાયનાસોરને તેની મમ્મી પાસે પહોંચાડવાનો હતો. રસ્તામાં એક ઊંડી ખીણ આવી, જેના પર એક મોટો પથ્થર પડેલો હતો.`,
        textHi: `अब बेबी डायनासोर को उसकी माँ के पास पहुँचाना था। रास्ते में एक गहरी घाटी थी, जिस पर एक भारी पत्थर अटका हुआ था।`,
        textEn: `They needed to guide the baby dino safely back to his family across a rocky mountain canyon.`,
        choice: {
          questionGu: `${nameGu} એ શું કરવું જોઈએ?`,
          questionHi: `${nameHi} को क्या करना चाहिए?`,
          questionEn: `What should ${nameEn} do?`,
          options: [
            {
              textGu: `${companion.nameGu} સાથે મળીને પથ્થર હટાવવો 🪨🤝`,
              textHi: `${companion.nameHi} के साथ मिलकर पत्थर हटाना 🪨🤝`,
              textEn: `Team up with ${companion.nameEn} to clear the rock 🪨🤝`,
              isBest: true,
              feedbackGu: `સંપ ત્યાં જંપ! બંનેએ સાથે મળીને પથ્થર હટાવી દીધો અને રસ્તો એકદમ સાફ થઈ ગયો!`,
              feedbackHi: `एकता में ही बल है! दोनों ने मिलकर पत्थर हटाया और सुरक्षित रास्ता खुल गया!`,
              feedbackEn: `Teamwork wins! Working together, they rolled the boulder aside and cleared a safe path!`,
            },
            {
              textGu: 'ડરીને પાછા ભાગી જવું 🏃‍♂️',
              textHi: 'घबराकर वापस लौट जाना 🏃‍♂️',
              textEn: 'Give up and turn back 🏃‍♂️',
              isBest: false,
              feedbackGu: `બેબી ડાયનાસોર એકલો પડી ગયો. ${companion.nameGu} એ કહ્યું: "હિંમત રાખીએ તો જ સાચા મિત્ર કહેવાઈએ!"`,
              feedbackHi: `डायनासोर अकेला रह गया। ${companion.nameHi} ने कहा: "मुसीबत में साथ देना ही सच्ची मित्रता है!"`,
              feedbackEn: `The baby dino was scared. ${companion.nameEn} said: "Brave hearts never leave a buddy behind!"`,
            },
          ],
        },
      },
      {
        page: 4,
        illustration: `🦕 🌴 🌟 👑`,
        textGu: `સામેથી વિશાળ પણ અત્યંત પ્રેમાળ મમ્મી ડાયનાસોર આવી પહોંચી! પોતાના બચ્ચાંને સુરક્ષિત જોઈને મમ્મી ડાયનાસોરે ${nameGu} અને ${companion.nameGu} ને પોતાની પીઠ પર બેસાડ્યા અને આખા જંગલની સફર કરાવી! જંગલના રાજાએ ${nameGu} ને "જંગલ રક્ષક" નો સોનેરી બેજ એનાયત કર્યો!`,
        textHi: `सामने से विशाल पर ममतामयी माँ डायनासोर दौड़ी आई! अपने बच्चे को सकुशल पाकर माँ डायनासोर ने ${nameHi} और ${companion.nameHi} को अपनी पीठ पर बिठाकर पूरे जंगल की रोमांचक सैर कराई! सबने ${nameHi} को "जंगल का रक्षक" सम्मान दिया!`,
        textEn: `Through the clearing, the towering Mama Dinosaur arrived! Overjoyed to see her baby safe, she gently lowered her neck and invited ${nameEn} and ${companion.nameEn} for a thrilling ride across the tree canopy! All forest animals honored ${nameEn} as the "Guardian of the Wild!"`,
      },
    ];
  } else if (theme.id === 'ocean') {
    moralGu = 'શાંત મન અને પ્રમાણિકતાથી ઊંડાણમાં રહેલા રહસ્યો પણ ઉકેલી શકાય છે.';
    moralHi = 'धैर्य और ईमानदारी से जीवन की हर मुश्किल पहेली सुलझ जाती है।';
    moralEn = 'Patience, honesty, and a calm mind can solve the deepest puzzles of life.';

    scenes = [
      {
        page: 1,
        illustration: `🌊 🐬 🐚 ${companion.emoji}`,
        textGu: `દરિયાકિનારે લહેરો સાથે રમતાં રમતાં ${nameGu} અને ${companion.nameGu} ને પાણીની અંદરથી ચમકતો વાદળી પ્રકાશ દેખાયો! ત્યાં એક જાદુઈ પરપોટો આવ્યો જેણે બંનેને ઢાંકી લીધા જેથી તેઓ પાણીમાં પણ શ્વાસ લઈ શકતા હતા. દરિયાઈ પરીએ સંદેશો આપ્યો: "સમુદ્રનું સોનેરી મોતી જોખમમાં છે!" ${nameGu} એ પોતાની ${tool.nameGu} સંભાળી અને દરિયાના પેટાળમાં ઊતરી પડ્યા.`,
        textHi: `समुद्र तट पर लहरों के संग खेलते हुए ${nameHi} और ${companion.nameHi} को गहरे नीले पानी से चमकती किरणें दिखीं! वहाँ एक जादुई जल-बुलबुला आया जिसने दोनों को सुरक्षित घेर लिया। जलपरी ने पुकारा: "समुद्र का अनमोल मोती खतरे में है!" ${nameHi} ने अपनी ${tool.nameHi} पकड़ी और समुद्र की गहराइयों में छलांग लगाई।`,
        textEn: `While splashing along the sandy shore, ${nameEn} and ${companion.nameEn} noticed a shimmering aqua glow under the waves! A magical glowing bubble wrapped around them, allowing them to breathe underwater with ease. A sea mermaid called out: "The Golden Ocean Pearl needs a pure heart!" Clasping their ${tool.nameEn}, ${nameEn} dove into the deep blue sea!`,
      },
      {
        page: 2,
        illustration: `🐠 🪸 ${tool.emoji} ✨`,
        textGu: `પાણીની અંદર રંગબેરંગી માછલીઓ અને કોરલ રીફ્સનું સુંદર નગર હતું. રસ્તામાં એક વિશાળ ઓક્ટોપસ પોતાની લાંબી ભુજાઓ ફેલાવીને ઊંઘતો હતો અને રસ્તો બંધ હતો. ${nameGu} એ પોતાની ${tool.nameGu} નો ઉપયોગ કરીને ધીમું લોરી જેવું સંગીત વગાડ્યું, ઓક્ટોપસ શાંતિથી એક બાજુ ખસી ગયો!`,
        textHi: `पानी के भीतर रंग-बिरंगी मछलियों और मूंगे की चट्टानों का अद्भुत संसार था। आगे एक विशाल ऑक्टोपस आराम कर रहा था और रास्ता रुका हुआ था। ${nameHi} ने अपनी ${tool.nameHi} से एक मधुर लोरी जैसी धुन बजाई, ऑक्टोपस मुस्कुराकर एक ओर हो गया!`,
        textEn: `Underwater, schools of neon clownfish swam through luminous coral castles! Blocking the reef was a giant sleepy octopus. Thinking quickly, ${nameEn} tapped their ${tool.nameEn} to play a soothing oceanic lullaby. The octopus yawned peacefully and cleared the passage!`,
      },
      {
        page: 3,
        illustration: `🦪 🗝️ ❓ 🤝`,
        textGu: `સામે એક વિશાળ સોનેરી છીપલું હતું જેની અંદર મોતી બંધ હતું. છીપલા પર એક પ્રશ્ન લખેલો હતો.`,
        textHi: `आगे एक विशाल स्वर्णिम सीप रखी थी जिसमें मोती बंद था। सीप पर एक सवाल अंकित था।`,
        textEn: `Resting on a crystal pedestal was a glowing golden oyster holding the pearl, guarded by a riddle.`,
        choice: {
          questionGu: `${nameGu} એ કયો મંત્ર બોલવો જોઈએ?`,
          questionHi: `${nameHi} को कौन-सा जादुई मंत्र बोलना चाहिए?`,
          questionEn: `Which magic phrase should ${nameEn} whisper?`,
          options: [
            {
              textGu: '"હું હંમેશાં સાચું બોલીશ અને પ્રેમ વહેંચીશ" 💖',
              textHi: '"मैं हमेशा सच बोलूंगा और सबकी भलाई करूंगा" 💖',
              textEn: '"I promise to always speak truth and share love" 💖',
              isBest: true,
              feedbackGu: `વાહ! સાચું વચન સાંભળતાં જ સોનેરી છીપલું આપમેળે ખુલી ગયું અને મોતી ચમકી ઊઠ્યું!`,
              feedbackHi: `अद्भुत! सत्य का वचन सुनते ही सीप खुल गई और अनमोल मोती चमक उठा!`,
              feedbackEn: `Incredible! Hearing the pure promise, the golden oyster opened wide, revealing the radiant pearl!`,
            },
            {
              textGu: '"હું આ મોતી માત્ર મારા માટે જ રાખીશ" 💎',
              textHi: '"यह मोती सिर्फ मेरा है और मैं किसी को नहीं दूंगा" 💎',
              textEn: '"This pearl belongs only to me" 💎',
              isBest: false,
              feedbackGu: `છીપલું બંધ જ રહ્યું. ${companion.nameGu} એ કહ્યું: "સાચું દિલ જ ખજાનો ખોલી શકે છે!"`,
              feedbackHi: `सीप नहीं खुली। ${companion.nameHi} ने कहा: "निस्वार्थ भाव ही सच्चा खजाना दिलाता है!"`,
              feedbackEn: `The shell stayed closed. ${companion.nameEn} said: "Only generous hearts can unlock true wonders!"`,
            },
          ],
        },
      },
      {
        page: 4,
        illustration: `👑 🌊 🐬 ⭐`,
        textGu: `સોનેરી મોતી બહાર આવતાં જ આખા સમુદ્રમાં અજવાળું ફેલાઈ ગયું! ડોલ્ફિનોએ હવામાં ઊંચા કૂદકા માર્યા અને દરિયાઈ રાણીએ ${nameGu} ને "સમુદ્ર રત્ન" નો મુગટ પહેરાવ્યો! ${nameGu} અને ${companion.nameGu} સમુદ્રના હીરો બનીને કિનારે પાછા ફર્યા!`,
        textHi: `मोती बाहर आते ही पूरे समुद्र में सुनहरी रोशनी फैल गई! डॉल्फ़िन मछलियों ने करतब दिखाए और जलपरी रानी ने ${nameHi} को "सागर का संरक्षक" मुकुट पहनाया! ${nameHi} और ${companion.nameHi} गौरव से मुस्कराते हुए घर लौटे!`,
        textEn: `The moment the Golden Pearl was lifted, sunlight illuminated the ocean floor! Pods of dolphins leaped in celebratory circles, and the Sea Queen crowned ${nameEn} as "Champion of the Seas!" ${nameEn} and ${companion.nameEn} returned home with legends told in their honor!`,
      },
    ];
  } else {
    // Cloud Castle
    moralGu = 'મોટાં સપનાં જોવાની હિંમત અને મહેનત આપણને આકાશની ઊંચાઈએ પહોંચાડે છે.';
    moralHi = 'सपनों पर विश्वास और निरंतर प्रयास से हम हर ऊँचाई छू सकते हैं।';
    moralEn = 'Believing in your dreams and persevering allows you to reach the highest skies.';

    scenes = [
      {
        page: 1,
        illustration: `☁️ 🏰 🎈 ${companion.emoji}`,
        textGu: `સૂર્યાસ્ત સમયે આકાશ ગુલાબી અને સોનેરી બની ગયું હતું. ${nameGu} અને તેમના વહાલા દોસ્ત ${companion.nameGu} એ જોયું કે આકાશમાં રૂ જેવા પોચા સફેદ વાદળો વચ્ચે એક જાદુઈ મહેલ તરતો હતો! ત્યાંથી એક નાનું વાદળું નીચે આવ્યું અને કહ્યું: "મહેલમાં વાદળોના રાજા તમારી રાહ જુએ છે!" ${nameGu} એ પોતાની ${tool.nameGu} લીધી અને વાદળ પર સવાર થઈ ગયા.`,
        textHi: `शाम के समय आसमान में गुलाबी और सुनहरी छटा बिखरी थी। ${nameHi} और उनके साथी ${companion.nameHi} ने देखा कि बादलों के बीच एक जादुई महल तैर रहा है! वहाँ से एक नन्हा सफेद बादल उतरा और बोला: "महल के राजा आप दोनों की प्रतीक्षा कर रहे हैं!" ${nameHi} ने अपनी ${tool.nameHi} थामी और बादल पर सवार हो गए।`,
        textEn: `At sunset, the sky turned shades of gold and violet. ${nameEn} and companion ${companion.nameEn} looked up to see a castle of dreams floating atop soft cotton-candy clouds! A friendly little cloud drifted down, inviting them: "The Cloud King awaits our bravest champions!" With their ${tool.nameEn}, ${nameEn} soared into the sky!`,
      },
      {
        page: 2,
        illustration: `🌈 🪜 ${tool.emoji} ✨`,
        textGu: `આકાશમાં પહોંચતાં જ ઠંડો મીઠો પવન વાતો હતો. મહેલના મુખ્ય દરવાજા સુધી જવા માટે સીડી નહોતી. ${nameGu} એ જરાય ગભરાયા વગર પોતાની ${tool.nameGu} હવામાં ફેરવી! જોતજોતામાં સાત રંગોની મેઘધનુષી સીડી બની ગઈ, જેના પર દોડતાં દોડતાં ${companion.nameGu} ખુશીથી હસી પડ્યો.`,
        textHi: `ऊपर पहुंचते ही शीतल सुखद बयार बहने लगी। मुख्य द्वार तक जाने के लिए कोई सीढ़ी नहीं थी। ${nameHi} ने बिना डरे अपनी ${tool.nameHi} घुमाई! देखते ही देखते सतरंगी इंद्रधनुषी सीढ़ी बन गई, जिस पर दौड़ते हुए ${companion.nameHi} चहक उठा।`,
        textEn: `High above, gentle winds whispered ancient melodies. The grand gate was perched on a floating terrace. Smiling bravely, ${nameEn} pointed their ${tool.nameEn} and spun a staircase of rainbow crystal, climbing happily upward with ${companion.nameEn}!`,
      },
      {
        page: 3,
        illustration: `🌧️ 🌸 ❓ 🤝`,
        textGu: `દરવાજે એક નાનું વાદળું ઉદાસ બેઠું હતું કારણ કે તે ફૂલો પર વરસાદ વરસાવવાનું ભૂલી ગયું હતું. ${nameGu} પાસે મદદ કરવાનો મોકો હતો.`,
        textHi: `महल के द्वार पर एक नन्हा बादल उदास था क्योंकि वह फूलों पर बारिश बरसाने का तरीका भूल गया था। ${nameHi} के पास मदद का अवसर था।`,
        textEn: `Sitting on the terrace was a tearful baby cloud who had forgotten how to shower raindrops on blooming flowers.`,
        choice: {
          questionGu: `${nameGu} એ શું કરવું જોઈએ?`,
          questionHi: `${nameHi} को क्या करना चाहिए?`,
          questionEn: `What should ${nameEn} do?`,
          options: [
            {
              textGu: 'વાદળાંને ખુશ કરીને હસાવવું અને સાથ આપવો 🌧️🌸',
              textHi: 'बादल को हंसाकर प्यार से सिखाना 🌧️🌸',
              textEn: 'Cheer up the baby cloud with joyful encouragement 🌧️🌸',
              isBest: true,
              feedbackGu: `સુંદર! વાદળું ખડખડાટ હસી પડ્યું અને ધરતી પર ગુલાબી ફૂલોનો વરસાદ વરસી ગયો!`,
              feedbackHi: `शाबाश! बादल मुस्कुरा उठा और धरती पर सुगंधित फूलों की फुहार बरस पड़ी!`,
              feedbackEn: `Splendid! The cloud giggled with delight, showering fragrant flower drops across the meadows!`,
            },
            {
              textGu: 'મહેલમાં સીધા પ્રવેશવું 🏰',
              textHi: 'सीधे महल के अंदर चले जाना 🏰',
              textEn: 'Walk past into the castle alone 🏰',
              isBest: false,
              feedbackGu: `વાદળાંની ઉદાસીથી રસ્તો ધૂંધળો થઈ ગયો. ${companion.nameGu} એ કહ્યું: "પહેલાં હાસ્ય ફેલાવીએ!"`,
              feedbackHi: `रास्ता धुंधला हो गया। ${companion.nameHi} ने कहा: "खुशी बांटने से ही रास्ता साफ होता है!"`,
              feedbackEn: `Thick fog gathered. ${companion.nameEn} said: "Bringing a smile clears any misty sky!"`,
            },
          ],
        },
      },
      {
        page: 4,
        illustration: `🏰 👑 ✨ 🎉`,
        textGu: `વાદળોના રાજાએ દરબાર ભરીને ${nameGu} અને ${companion.nameGu} નું સ્વાગત કર્યું! રાજાએ કહ્યું: "તમારી દયા અને સપનાં જોવાની તાકાતે આખા આકાશને ખુશહાલ બનાવી દીધું!" ${nameGu} ને "સ્વપ્ન રક્ષક" નો સોનેરી સ્ટાર મળ્યો અને બંને સન્માનભેર પાછા ફર્યા!`,
        textHi: `बादलों के राजा ने विशाल सभा में ${nameHi} और ${companion.nameHi} का भव्य स्वागत किया! राजा ने कहा: "तुम्हारी नेकी और हौसले ने पूरे आकाश को चमका दिया है!" ${nameHi} को "सपनों का रक्षक" स्वर्ण पदक मिला! दोनों गर्व से खिल उठे!`,
        textEn: `The Cloud King welcomed ${nameEn} and ${companion.nameEn} with golden trumpets! The King announced: "Your kindness and imagination have brought harmony to the heavens!" ${nameEn} was gifted the "Star of Pure Dreams" as a heroic celebration echoed across the clouds!`,
      },
    ];
  }

  const titleGu = `${nameGu} અને ${companion.nameGu}: ${theme.titleGu}`;
  const titleHi = `${nameHi} और ${companion.nameHi}: ${theme.titleHi}`;
  const titleEn = `${nameEn} & ${companion.nameEn}: ${theme.titleEn}`;

  return {
    id: storyId,
    titleGu,
    titleHi,
    titleEn,
    coverEmoji: theme.emoji,
    bgColor: theme.bgColor,
    moralGu,
    moralHi,
    moralEn,
    scenes,
    isCustomMagicStory: true,
    createdAt: new Date().toISOString(),
  };
}

