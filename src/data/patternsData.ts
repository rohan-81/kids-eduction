export interface PatternPuzzleDef {
  id: string;
  name: { gu: string; hi: string; en: string };
  sequence: string[];
  correctOption: string;
  options: string[];
  questionPrompt: { gu: string; hi: string; en: string };
  audioPrompt: { gu: string; hi: string; en: string };
  hint: { gu: string; hi: string; en: string };
}

export const PATTERN_PUZZLES_MAP: Record<string, PatternPuzzleDef> = {
  'cs-pattern-ab-color': {
    id: 'cs-pattern-ab-color',
    name: { gu: 'રંગ પેટર્ન', hi: 'रंग पैटर्न', en: 'Color Pattern' },
    sequence: ['🔴', '🟡', '🔴'],
    correctOption: '🟡',
    options: ['🟡', '🔴', '🟢', '🔵'],
    questionPrompt: {
      gu: 'પેટર્ન પૂર્ણ કરો: આગળ કયો રંગ આવશે?',
      hi: 'पैटर्न पूरा करें: आगे कौन सा रंग आएगा?',
      en: 'Complete the pattern: Which color comes next?',
    },
    audioPrompt: {
      gu: 'લાલ, પીળો, લાલ, હવે પછી કયો રંગ આવશે? સાચો રંગ પસંદ કરો!',
      hi: 'लाल, पीला, लाल, आगे कौन सा रंग आएगा? सही रंग चुनें!',
      en: 'Red, Yellow, Red, what color comes next? Choose the right color!',
    },
    hint: {
      gu: 'લાલ પછી પીળો રંગ આવે છે!',
      hi: 'लाल के बाद पीला रंग आता है!',
      en: 'Yellow comes right after red!',
    },
  },
  'cs-pattern-ab-shape': {
    id: 'cs-pattern-ab-shape',
    name: { gu: 'આકાર પેટર્ન', hi: 'आकार पैटर्न', en: 'Shape Pattern' },
    sequence: ['⭕', '⬛', '⭕'],
    correctOption: '⬛',
    options: ['⬛', '⭕', '🔺', '⭐'],
    questionPrompt: {
      gu: 'પેટર્ન પૂર્ણ કરો: આગળ કયો આકાર આવશે?',
      hi: 'पैटर्न पूरा करें: आगे कौन सा आकार आएगा?',
      en: 'Complete the pattern: Which shape comes next?',
    },
    audioPrompt: {
      gu: 'ગોળ, ચોરસ, ગોળ, હવે પછી કયો આકાર આવશે?',
      hi: 'गोल, चौकोर, गोल, आगे कौन सा आकार आएगा?',
      en: 'Circle, Square, Circle, what shape comes next?',
    },
    hint: {
      gu: 'ગોળ પછી ચોરસ આકાર આવે છે!',
      hi: 'गोल के बाद चौकोर आकार आता है!',
      en: 'Square comes after circle!',
    },
  },
  'cs-pattern-abc-triple': {
    id: 'cs-pattern-abc-triple',
    name: { gu: 'ત્રણ આકાર પેટર્ન', hi: 'तीन आकार पैटर्न', en: 'ABC Pattern' },
    sequence: ['🔺', '⭕', '⬛'],
    correctOption: '🔺',
    options: ['🔺', '⭕', '⬛', '⭐'],
    questionPrompt: {
      gu: 'ત્રણ આકારનો ક્રમ: હવે પછી કયો આકાર ફરી શરૂ થશે?',
      hi: 'तीन आकारों का क्रम: आगे नया चक्र किस आकार से शुरू होगा?',
      en: 'Three-step repeat: Which shape starts the cycle again?',
    },
    audioPrompt: {
      gu: 'ત્રિકોણ, ગોળ, ચોરસ, હવે ફરી કયો આકાર આવશે?',
      hi: 'त्रिकोण, गोल, चौकोर, अब फिर से क्या आएगा?',
      en: 'Triangle, Circle, Square, which shape repeats next?',
    },
    hint: {
      gu: 'નવો ક્રમ ત્રિકોણથી શરૂ થાય છે!',
      hi: 'नया चक्र त्रिकोण से शुरू होता है!',
      en: 'The sequence repeats from Triangle!',
    },
  },
  'cs-pattern-size': {
    id: 'cs-pattern-size',
    name: { gu: 'બડા-છોટા પેટર્ન', hi: 'बड़ा-छोटा पैटर्न', en: 'Size Pattern' },
    sequence: ['🐘', '🐁', '🐘'],
    correctOption: '🐁',
    options: ['🐁', '🐘', '🦁', '🐱'],
    questionPrompt: {
      gu: 'કદનો ક્રમ: મોટો, નાનો, મોટો...',
      hi: 'आकार का क्रम: बड़ा, छोटा, बड़ा...',
      en: 'Size pattern: Big, Small, Big...',
    },
    audioPrompt: {
      gu: 'મોટો હાથી, નાનો ઉંદર, મોટો હાથી, હવે શું આવશે?',
      hi: 'बड़ा हाथी, छोटा चूहा, बड़ा हाथी, अब क्या आएगा?',
      en: 'Big elephant, small mouse, big elephant, what comes next?',
    },
    hint: {
      gu: 'મોટા હાથી પછી નાનો ઉંદર આવે!',
      hi: 'बड़े हाथी के बाद छोटा चूहा आता है!',
      en: 'Small mouse comes after big elephant!',
    },
  },
  'cs-pattern-growing': {
    id: 'cs-pattern-growing',
    name: { gu: 'વધતો વિકાસ ક્રમ', hi: 'बढ़ता क्रम पैटर्न', en: 'Growing Pattern' },
    sequence: ['🌱', '🌿', '🌳'],
    correctOption: '🍎',
    options: ['🍎', '🚗', '🐱', '⚽'],
    questionPrompt: {
      gu: 'વિકાસ ક્રમ: બીજ, છોડ, ઝાડ... હવે ઝાડ પર શું ઊગશે?',
      hi: 'विकास क्रम: अंकुर, पौधा, पेड़... अब पेड़ पर क्या लगेगा?',
      en: 'Growing sequence: Sprout, Plant, Tree... What grows next?',
    },
    audioPrompt: {
      gu: 'નાનો છોડ, મોટું ઝાડ, હવે ઝાડ પર મીઠાં સફરજન લાગશે!',
      hi: 'छोटा पौधा, बड़ा पेड़, अब पेड़ पर मीठा सेब लगेगा!',
      en: 'Sprout, Plant, Tree, now sweet apples will grow on the tree!',
    },
    hint: {
      gu: 'મોટા ઘટાદાર ઝાડ પર મીઠાં ફળ (🍎) આવે છે!',
      hi: 'बड़े पेड़ पर मीठा फल (🍎) लगता है!',
      en: 'Big healthy trees grow sweet apples (🍎)!',
    },
  },
  'cs-pattern-daynight': {
    id: 'cs-pattern-daynight',
    name: { gu: 'દિવસ-રાત ચક્ર', hi: 'दिन-रात चक्र', en: 'Day & Night' },
    sequence: ['☀️', '🌙', '☀️'],
    correctOption: '🌙',
    options: ['🌙', '☀️', '⭐', '☁️'],
    questionPrompt: {
      gu: 'દિવસ અને રાત: સૂરજ (દિવસ), ચંદા (રાત), સૂરજ...',
      hi: 'दिन और रात का चक्र: सूरज (दिन), चंदा (रात), सूरज...',
      en: 'Day and Night: Sun (Day), Moon (Night), Sun...',
    },
    audioPrompt: {
      gu: 'સૂરજ એટલે દિવસ, ચંદ્ર એટલે રાત, સૂરજ દિવસ, હવે પછી શું આવશે?',
      hi: 'सूरज दिन, चंदा रात, सूरज दिन, आगे क्या आएगा?',
      en: 'Sun is day, moon is night, sun is day, what comes next?',
    },
    hint: {
      gu: 'દિવસ પછી સુંદર રાત્રે ચંદ્ર (🌙) આવે!',
      hi: 'दिन के बाद रात में चंदा मामा (🌙) आते हैं!',
      en: 'Night with the moon (🌙) follows the sunny day!',
    },
  },
  'cs-pattern-direction': {
    id: 'cs-pattern-direction',
    name: { gu: 'ઉપર-નીચે દિશા ક્રમ', hi: 'ऊपर-नीचे दिशा पैटर्न', en: 'Direction Pattern' },
    sequence: ['⬆️', '⬇️', '⬆️'],
    correctOption: '⬇️',
    options: ['⬇️', '⬆️', '⬅️', '➡️'],
    questionPrompt: {
      gu: 'દિશા ક્રમ: ઉપર, નીચે, ઉપર...',
      hi: 'दिशा क्रम: ऊपर, नीचे, ऊपर...',
      en: 'Direction: Up, Down, Up...',
    },
    audioPrompt: {
      gu: 'ઉપર તીર, નીચે તીર, ઉપર તીર, હવે કયું તીર આવશે?',
      hi: 'ऊपर तीर, नीचे तीर, ऊपर तीर, अब कौन सा तीर आएगा?',
      en: 'Up arrow, down arrow, up arrow, which arrow comes next?',
    },
    hint: {
      gu: 'ઉપર તીર પછી નીચેનું તીર (⬇️) આવે!',
      hi: 'ऊपर तीर के बाद नीचे का तीर (⬇️) आता है!',
      en: 'Down arrow (⬇️) comes after up arrow!',
    },
  },
  'cs-pattern-wave': {
    id: 'cs-pattern-wave',
    name: { gu: 'તરંગ અને ઝિગઝેગ', hi: 'तरंग और ज़िगज़ैग', en: 'Wave & Zigzag' },
    sequence: ['〰️', '⚡', '〰️'],
    correctOption: '⚡',
    options: ['⚡', '〰️', '⭐', '🌀'],
    questionPrompt: {
      gu: 'રેખા ક્રમ: લહેર, ઝિગઝેગ, લહેર...',
      hi: 'रेखा क्रम: लहर, ज़िगज़ैग, लहर...',
      en: 'Line pattern: Wave, Zigzag, Wave...',
    },
    audioPrompt: {
      gu: 'લહેરદાર વળાંક, ઝિગઝેગ વીજળી, લહેરદાર વળાંક, હવે શું આવશે?',
      hi: 'लहरदार रेखा, ज़िगज़ैग बिजली, लहरदार रेखा, आगे क्या आएगा?',
      en: 'Wavy line, zigzag line, wavy line, what comes next?',
    },
    hint: {
      gu: 'લહેર પછી ઝિગઝેગ વીજળી (⚡) આવે!',
      hi: 'लहर के बाद ज़िगज़ैग बिजली (⚡) आती है!',
      en: 'Zigzag lightning (⚡) follows wavy line!',
    },
  },
};

