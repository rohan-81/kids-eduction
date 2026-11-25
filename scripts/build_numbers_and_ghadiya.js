const fs = require('fs');

const guDigits = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
function toGuDigits(n) {
  return String(n).replace(/[0-9]/g, d => guDigits[parseInt(d, 10)]);
}

const guNumberWords = [
  "", "એક", "બે", "ત્રણ", "ચાર", "પાંચ", "છ", "સાત", "આઠ", "નવ", "દસ",
  "અગિયાર", "બાર", "તેર", "ચૌદ", "પંદર", "સોળ", "સત્તર", "અઢાર", "ઓગણત્રીસ", "વીસ",
  "એકવીસ", "બાવીસ", "ત્રેવીસ", "ચોવીસ", "પચ્ચીસ", "છવ્વીસ", "સત્યાવીસ", "અઠ્ઠાવીસ", "ઓગણત્રીસ", "ત્રીસ",
  "એકત્રીસ", "બત્રીસ", "તેત્રીસ", "ચોત્રીસ", "પાંત્રીસ", "છત્રીસ", "સાડત્રીસ", "આડત્રીસ", "ઓગણચાલીસ", "ચાલીસ",
  "એકતાલીસ", "બેતાલીસ", "તેતાલીસ", "ચોમાલીસ", "પિસ્તાલીસ", "છેતાલીસ", "સુડતાલીસ", "અડતાલીસ", "ઓગણપચાસ", "પચાસ",
  "એકાવન", "બાવન", "ત્રેપન", "ચોપન", "પંચાવન", "છપ્પન", "સત્તાવન", "અઠ્ઠાવન", "ઓગણસાઠ", "સાઠ",
  "એકસઠ", "બાસઠ", "ત્રેસઠ", "ચોસઠ", "પાંસઠ", "છાસઠ", "સાડસઠ", "અડસઠ", "ઓગણોસિત્તેર", "સિત્તેર",
  "ઇકોતેર", "બોતેર", "તેરોતેર", "ચુમોતેર", "પંચોતેર", "છોતેર", "સંતોતેર", "ઇઠોતેર", "ઓગણાએંસી", "એંસી",
  "એક્યાસી", "બ્યાસી", "ત્યાસી", "ચોર્યાસી", "પંચાસી", "છ્યાસી", "સત્યાસી", "અઠ્યાસી", "નેવ્યાસી", "નેવું",
  "એકાણું", "બાણું", "ત્રાણું", "ચોરાણું", "પંચાણું", "છન્નું", "સત્તાણું", "અઠ્ઠાણું", "નવાણું", "સો"
];

const enNumberWords = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen", "Twenty",
  "Twenty One", "Twenty Two", "Twenty Three", "Twenty Four", "Twenty Five", "Twenty Six", "Twenty Seven", "Twenty Eight", "Twenty Nine", "Thirty",
  "Thirty One", "Thirty Two", "Thirty Three", "Thirty Four", "Thirty Five", "Thirty Six", "Thirty Seven", "Thirty Eight", "Thirty Nine", "Forty",
  "Forty One", "Forty Two", "Forty Three", "Forty Four", "Forty Five", "Forty Six", "Forty Seven", "Forty Eight", "Forty Nine", "Fifty",
  "Fifty One", "Fifty Two", "Fifty Three", "Fifty Four", "Fifty Five", "Fifty Six", "Fifty Seven", "Fifty Eight", "Fifty Nine", "Sixty",
  "Sixty One", "Sixty Two", "Sixty Three", "Sixty Four", "Sixty Five", "Sixty Six", "Sixty Seven", "Sixty Eight", "Sixty Nine", "Seventy",
  "Seventy One", "Seventy Two", "Seventy Three", "Seventy Four", "Seventy Five", "Seventy Six", "Seventy Seven", "Seventy Eight", "Seventy Nine", "Eighty",
  "Eighty One", "Eighty Two", "Eighty Three", "Eighty Four", "Eighty Five", "Eighty Six", "Eighty Seven", "Eighty Eight", "Eighty Nine", "Ninety",
  "Ninety One", "Ninety Two", "Ninety Three", "Ninety Four", "Ninety Five", "Ninety Six", "Ninety Seven", "Ninety Eight", "Ninety Nine", "One Hundred"
];

const colorsList = ['colors.mint', 'colors.skyBlue', 'colors.peach', 'colors.yellow', 'colors.lavender'];

// 1. Generate Numbers 1 to 100
const numberLessons = [];
for (let i = 1; i <= 100; i++) {
  const guSym = toGuDigits(i);
  const wordGu = guNumberWords[i];
  const wordEn = enNumberWords[i];
  const col = colorsList[(i - 1) % colorsList.length];
  
  numberLessons.push(`  {
    id: 'num-${i}',
    categoryId: 'numbers',
    language: 'all',
    ageGroup: 'all',
    symbol: '${guSym}',
    title: '${guSym} • ${wordGu}',
    subtitle: '${guSym} ${wordGu} (${wordEn})',
    phonetic: '${wordEn}',
    exampleWord: '${wordGu}',
    exampleMeaning: '${wordEn}',
    exampleMeaningGu: '${guSym} ${wordGu}',
    exampleMeaningHi: '${wordHi || wordGu}',
    audioPrompt: '${wordGu}',
    audioPromptGu: '${wordGu}',
    audioPromptHi: '${wordHi || wordGu}',
    audioPromptEn: '${wordEn}',
    visualColor: ${col},
    illustrationType: 'number',
    countItems: ${i <= 20 ? i : 1},
  },`);
}

// 2. Generate Ghadiya (Multiplication Tables 1 to 10)
const ghadiyaPhonetics = {
  1: ["એક એકા એક", "એક દુ બે", "એક તરી ત્રણ", "એક ચોક ચાર", "એક પંચા પાંચ", "એક છક છ", "એક સતા સાત", "એક અઠા આઠ", "એક નવા નવ", "એક દાન દસ"],
  2: ["બે એકા બે", "બે દુ ચાર", "બે તરી છ", "બે ચોક આઠ", "બે પંચા દસ", "બે છક બાર", "બે સતા ચૌદ", "બે અઠા સોળ", "બે નવા અઢાર", "બે દાન વીસ"],
  3: ["ત્રણ એકા ત્રણ", "ત્રણ દુ છ", "ત્રણ તરી નવ", "ત્રણ ચોક બાર", "ત્રણ પંચા પંદર", "ત્રણ છક અઢાર", "ત્રણ સતા એકવીસ", "ત્રણ અઠા ચોવીસ", "ત્રણ નવા સત્યાવીસ", "ત્રણ દાન ત્રીસ"],
  4: ["ચાર એકા ચાર", "ચાર દુ આઠ", "ચાર તરી બાર", "ચાર ચોક સોળ", "ચાર પંચા વીસ", "ચાર છક ચોવીસ", "ચાર સતા અઠ્ઠાવીસ", "ચાર અઠા બત્રીસ", "ચાર નવા છત્રીસ", "ચાર દાન ચાલીસ"],
  5: ["પાંચ એકા પાંચ", "પાંચ દુ દસ", "પાંચ તરી પંદર", "પાંચ ચોક વીસ", "પાંચ પંચા પચ્ચીસ", "પાંચ છક ત્રીસ", "પાંચ સતા પાંત્રીસ", "પાંચ અઠા ચાલીસ", "પાંચ નવા પિસ્તાલીસ", "પાંચ દાન પચાસ"],
  6: ["છ એકા છ", "છ દુ બાર", "છ તરી અઢાર", "છ ચોક ચોવીસ", "છ પંચા ત્રીસ", "છ છક છત્રીસ", "છ સતા બેતાલીસ", "છ અઠા અડતાલીસ", "છ નવા ચોપન", "છ દાન સાઠ"],
  7: ["સાત એકા સાત", "સાત દુ ચૌદ", "સાત તરી એકવીસ", "સાત ચોક અઠ્ઠાવીસ", "સાત પંચા પાંત્રીસ", "સાત છક બેતાલીસ", "સાત સતા ઓગણપચાસ", "સાત અઠા છપ્પન", "સાત નવા ત્રેસઠ", "સાત દાન સિત્તેર"],
  8: ["આઠ એકા આઠ", "આઠ દુ સોળ", "આઠ તરી ચોવીસ", "આઠ ચોક બત્રીસ", "આઠ પંચા ચાલીસ", "આઠ છક અડતાલીસ", "આઠ સતા છપ્પન", "આઠ અઠા ચોસઠ", "આઠ નવા બોતેર", "આઠ દાન એંસી"],
  9: ["નવ એકા નવ", "નવ દુ અઢાર", "નવ તરી સત્યાવીસ", "નવ ચોક છત્રીસ", "નવ પંચા પિસ્તાલીસ", "નવ છક ચોપન", "નવ સતા ત્રેસઠ", "નવ અઠા બોતેર", "નવ નવા એક્યાસી", "નવ દાન નેવું"],
  10: ["દસ એકા દસ", "દસ દુ વીસ", "દસ તરી ત્રીસ", "દસ ચોક ચાલીસ", "દસ પંચા પચાસ", "દસ છક સાઠ", "દસ સતા સિત્તેર", "દસ અઠા એંસી", "દસ નવા નેવું", "દસ દાન સો"]
};

const ghadiyaLessons = [];
for (let t = 1; t <= 10; t++) {
  const guTbl = toGuDigits(t);
  for (let i = 1; i <= 10; i++) {
    const guI = toGuDigits(i);
    const ans = t * i;
    const guAns = toGuDigits(ans);
    const recitation = ghadiyaPhonetics[t][i - 1];
    const col = colorsList[(i - 1) % colorsList.length];

    ghadiyaLessons.push(`  {
    id: 'ghadiya-${t}-${i}',
    categoryId: 'ghadiya',
    language: 'all',
    ageGroup: 'all',
    symbol: '${guTbl} × ${guI} = ${guAns}',
    title: '${recitation}',
    subtitle: '${guTbl} ગુણ્યા ${guI} બરાબર ${guAns}',
    phonetic: '${t} times ${i} is ${ans}',
    exampleWord: '${recitation}',
    exampleMeaning: '${t} x ${i} = ${ans}',
    exampleMeaningGu: '${recitation}',
    exampleMeaningHi: '${recitation}',
    audioPrompt: '${recitation} ... ${guTbl} ગુણ્યા ${guI} બરાબર ${guAns}',
    audioPromptGu: '${recitation} ... ${guTbl} ગુણ્યા ${guI} બરાબર ${guAns}',
    audioPromptHi: '${recitation}',
    audioPromptEn: '${t} times ${i} equals ${ans}',
    visualColor: ${col},
    illustrationType: 'math',
  },`);
  }
}

console.log('Numbers lessons count:', numberLessons.length);
console.log('Ghadiya lessons count:', ghadiyaLessons.length);

fs.writeFileSync('scripts/output_numbers.txt', numberLessons.join('\n'));
fs.writeFileSync('scripts/output_ghadiya.txt', ghadiyaLessons.join('\n'));
console.log('Files generated successfully!');
