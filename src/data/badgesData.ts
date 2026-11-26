import type { UserProgress } from '../types';

export interface BadgeItemDef {
  id: string;
  emoji: string;
  nameGu: string;
  nameHi: string;
  nameEn: string;
  descGu: string;
  descHi: string;
  descEn: string;
  reqGu: string;
  reqHi: string;
  reqEn: string;
  rewardCoins: number;
  iconBg: string;
  iconBorder: string;
  /** Lessons required for backend-defined badges (functions are lost when cached as JSON). */
  requirementValue?: number;
  /** Rules read progress defensively, so any partial snapshot can be evaluated. */
  checkUnlocked: (progress: Partial<UserProgress>) => boolean;
  getProgress: (progress: Partial<UserProgress>) => { current: number; total: number };
}

export const BADGE_DEFINITIONS: BadgeItemDef[] = [
  {
    id: 'badge-welcome',
    emoji: '🚀',
    nameGu: 'પ્રથમ ડગલું',
    nameHi: 'पहला कदम',
    nameEn: 'First Step Explorer',
    descGu: 'KidsZone માં સ્વાગત છે! નવું શિક્ષણ સાહસ શરૂ થયું!',
    descHi: 'KidsZone में स्वागत है! नई सीखने की यात्रा शुरू हुई!',
    descEn: 'Welcome to KidsZone! Joined the learning adventure!',
    reqGu: 'એપમાં પ્રવેશ કર્યો',
    reqHi: 'ऐप में शामिल हुए',
    reqEn: 'Joined KidsZone',
    rewardCoins: 10,
    iconBg: '#DBEAFE',
    iconBorder: '#93C5FD',
    checkUnlocked: (_p) => true,
    getProgress: (_p) => ({ current: 1, total: 1 }),
  },
  {
    id: 'badge-first-step',
    emoji: '⭐',
    nameGu: 'સુપર સ્ટાર વિદ્યાર્થી',
    nameHi: 'सुपर स्टार विद्यार्थी',
    nameEn: 'Super Star Student',
    descGu: 'તમારો પહેલો પાઠ સફળતાપૂર્વક પૂર્ણ કર્યો!',
    descHi: 'पहला पाठ सफलतापूर्वक पूरा किया!',
    descEn: 'Completed your first interactive lesson!',
    reqGu: '૧ પાઠ પૂર્ણ',
    reqHi: '१ पाठ पूरा',
    reqEn: '1 lesson completed',
    rewardCoins: 15,
    iconBg: '#FEF3C7',
    iconBorder: '#FDE68A',
    checkUnlocked: (p) => (p.completedLessons?.length || 0) >= 1,
    getProgress: (p) => ({
      current: Math.min(p.completedLessons?.length || 0, 1),
      total: 1,
    }),
  },
  {
    id: 'badge-scholar',
    emoji: '🔤',
    nameGu: 'મૂળાક્ષર માસ્ટર',
    nameHi: 'वर्णमाला मास्टर',
    nameEn: 'Alphabet Master',
    descGu: 'કક્કો અને અંગ્રેજી A-Z ના ૫ પાઠ શીખ્યા!',
    descHi: 'वर्णमाला और अंग्रेजी के ५ पाठ सीखे!',
    descEn: 'Finished 5 language & alphabet lessons!',
    reqGu: '૫ પાઠ પૂર્ણ',
    reqHi: '५ पाठ पूरे',
    reqEn: '5 lessons finished',
    rewardCoins: 20,
    iconBg: '#EDE9FE',
    iconBorder: '#DDD6FE',
    checkUnlocked: (p) => (p.completedLessons?.length || 0) >= 5,
    getProgress: (p) => ({
      current: Math.min(p.completedLessons?.length || 0, 5),
      total: 5,
    }),
  },
  {
    id: 'badge-math-wizard',
    emoji: '🔢',
    nameGu: 'ગણિતના જાદુગર',
    nameHi: 'गणित के जादूगर',
    nameEn: 'Math Wizard',
    descGu: 'અંકો અને ગણતરીના પાઠ સફળતાપૂર્વક શીખ્યા!',
    descHi: 'अंकों और गिनती के पाठ सीखे!',
    descEn: 'Mastered counting and numbers!',
    reqGu: '૮ પાઠ પૂર્ણ',
    reqHi: '८ पाठ पूरे',
    reqEn: '8 lessons finished',
    rewardCoins: 25,
    iconBg: '#FFEDD5',
    iconBorder: '#FED7AA',
    checkUnlocked: (p) => (p.completedLessons?.length || 0) >= 8,
    getProgress: (p) => ({
      current: Math.min(p.completedLessons?.length || 0, 8),
      total: 8,
    }),
  },
  {
    id: 'badge-animal-lover',
    emoji: '🦁',
    nameGu: 'પ્રાણી સાહસી',
    nameHi: 'वन्यजीव खोजी',
    nameEn: 'Wildlife Explorer',
    descGu: 'પ્રાણીઓ અને પક્ષીઓની ઓળખ અને અવાજ શીખ્યા!',
    descHi: 'जानवरों और पक्षियों की पहचान की!',
    descEn: 'Explored animals and birds!',
    reqGu: 'પ્રાણી પાઠ પૂર્ણ',
    reqHi: 'जानवर पाठ पूरा',
    reqEn: 'Animal lessons explored',
    rewardCoins: 20,
    iconBg: '#FEF9C3',
    iconBorder: '#FEF08A',
    checkUnlocked: (p) =>
      (p.completedLessons || []).some((id: string) => id.startsWith('an-')) ||
      (p.completedLessons?.length || 0) >= 3,
    getProgress: (p) => ({
      current: (p.completedLessons || []).some((id: string) => id.startsWith('an-')) || (p.completedLessons?.length || 0) >= 3 ? 1 : 0,
      total: 1,
    }),
  },
  {
    id: 'badge-master',
    emoji: '🏆',
    nameGu: 'ગ્રાન્ડ ચેમ્પિયન',
    nameHi: 'ग्रैंड चैंपियन',
    nameEn: 'Grand Champion',
    descGu: '૧૦ થી વધુ પાઠ પૂર્ણ કરીને સુવર્ણ સિદ્ધિ મેળવી!',
    descHi: '१० से अधिक पाठ पूरे करके स्वर्ण उपलब्धि पाई!',
    descEn: 'Mastered 10+ educational lessons!',
    reqGu: '૧૦ પાઠ પૂર્ણ',
    reqHi: '१० पाठ पूरे',
    reqEn: '10 lessons finished',
    rewardCoins: 50,
    iconBg: '#FEF3C7',
    iconBorder: '#FCD34D',
    checkUnlocked: (p) => (p.completedLessons?.length || 0) >= 10,
    getProgress: (p) => ({
      current: Math.min(p.completedLessons?.length || 0, 10),
      total: 10,
    }),
  },
  {
    id: 'badge-game-champ',
    emoji: '🎮',
    nameGu: 'રમતરંગ ચેમ્પિયન',
    nameHi: 'खेल चैंपियन',
    nameEn: 'Games Champion',
    descGu: 'વિવિધ શૈક્ષણિક રમતો રમીને નવા રેકોર્ડ બનાવ્યા!',
    descHi: 'शैक्षणिक खेल खेलकर नए रिकॉर्ड बनाए!',
    descEn: 'Played fun educational games & quizzes!',
    reqGu: '૨ રમતો રમી',
    reqHi: '२ खेल खेले',
    reqEn: '2 games played',
    rewardCoins: 30,
    iconBg: '#DCFCE7',
    iconBorder: '#86EFAC',
    checkUnlocked: (p) =>
      Object.keys(p.gameStats || {}).length >= 2 || (p.stars || 0) >= 20,
    getProgress: (p) => ({
      current: Math.min(Object.keys(p.gameStats || {}).length, 2),
      total: 2,
    }),
  },
  {
    id: 'badge-artist',
    emoji: '🎨',
    nameGu: 'નાનો કલાકાર',
    nameHi: 'छोटा कलाकार',
    nameEn: 'Little Artist',
    descGu: 'ચિત્રકામ, આકારો અને રંગોમાં કલાત્મક કૌશલ્ય બતાવ્યું!',
    descHi: 'रंग और आकृतियों में कलात्मकता दिखाई!',
    descEn: 'Explored colors, shapes and drawings!',
    reqGu: 'કલા પ્રવૃત્તિ પૂર્ણ',
    reqHi: 'कला गतिविधि पूरी',
    reqEn: 'Art activity completed',
    rewardCoins: 25,
    iconBg: '#FCE7F3',
    iconBorder: '#FBCFE8',
    checkUnlocked: (p) =>
      (p.completedLessons || []).some((id: string) => id.startsWith('cs-') || id.startsWith('draw-')) ||
      (p.completedLessons?.length || 0) >= 4,
    getProgress: (p) => ({
      current: (p.completedLessons || []).some((id: string) => id.startsWith('cs-') || id.startsWith('draw-')) || (p.completedLessons?.length || 0) >= 4 ? 1 : 0,
      total: 1,
    }),
  },
];
