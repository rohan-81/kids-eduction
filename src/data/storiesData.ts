export interface StoryChoiceOption {
  textGu: string;
  textHi: string;
  textEn: string;
  isBest: boolean;
  feedbackGu: string;
  feedbackHi: string;
  feedbackEn: string;
}

export interface StoryChoice {
  questionGu: string;
  questionHi: string;
  questionEn: string;
  options: StoryChoiceOption[];
}

export interface StoryScene {
  page: number;
  illustration: string;
  /** Real scene artwork (absolute URL) from the backend; overrides the drawn scene. */
  image?: string;
  textGu: string;
  textHi: string;
  textEn: string;
  choice?: StoryChoice;
}

export interface StoryBook {
  id: string;
  titleGu: string;
  titleHi: string;
  titleEn: string;
  coverEmoji: string;
  /** Real cover artwork (absolute URL) from the backend; overrides the drawn cover. */
  coverImage?: string;
  bgColor: string;
  moralGu: string;
  moralHi: string;
  moralEn: string;
  scenes: StoryScene[];
  isCustomMagicStory?: boolean;
  createdAt?: string;
  /** Backend Story.category (e.g. 'moral', 'animals', 'adventure'). */
  category?: string;
  /** Backend Story.age_group. */
  ageGroup?: string;
}

export const STORIES_DATA: StoryBook[] = [
  // 1. THE CLEVER CROW (ચતુર કાગડો / चतुर कौआ)
  {
    id: 'story-crow',
    titleGu: 'ચતુર કાગડો',
    titleHi: 'चतुर कौआ',
    titleEn: 'The Clever Crow',
    coverEmoji: '🐦‍⬛',
    bgColor: '#E8F8F5',
    moralGu: 'જ્યાં બુદ્ધિ અને ધીરજ છે, ત્યાં મુશ્કેલીનો ઉકેલ મળે છે.',
    moralHi: 'जहाँ बुद्धि और धैर्य है, वहाँ हर मुश्किल का हल मिल जाता है।',
    moralEn: 'Where there is wisdom and patience, there is always a way.',
    scenes: [
      {
        page: 1,
        illustration: '☀️ 🦅 🏜️',
        textGu: 'એક દિવસ ઉનાળાની ખૂબ ગરમી હતી. એક કાગડાને બહુ જ તરસ લાગી હતી. તે પાણીની શોધમાં આકાશમાં આમ-તેમ ઉડતો હતો.',
        textHi: 'गर्मी का एक बहुत तपता हुआ दिन था। एक कौवे को बहुत तेज प्यास लगी थी। वह पानी की खोज में जंगल में इधर-उधर उड़ रहा था।',
        textEn: 'One hot summer day, a thirsty crow was flying all around the forest looking for water.',
      },
      {
        page: 2,
        illustration: '🏡 🏺 💧',
        textGu: 'છેવટે તેને એક બગીચામાં માટીનો ઘડો દેખાયો. કાગડો ખુશ થઈને ઘડા પાસે ગયો, પણ ઘડામાં પાણી સાવ તળિયે હતું! તેની ચાંચ પાણી સુધી પહોંચતી નહોતી.',
        textHi: 'आखिरकार उसे एक बगीचे में मिट्टी का घड़ा दिखाई दिया। कौआ खुशी-खुशी पास गया, लेकिन पानी घड़े के बिल्कुल नीचे था! उसकी चोंच पानी तक नहीं पहुँच पा रही थी।',
        textEn: 'Finally, he spotted a pitcher in a garden. But the water was deep at the bottom, and his beak could not reach it!',
        choice: {
          questionGu: 'કાગડાએ પાણી પીવા માટે શું વિચારવું જોઈએ?',
          questionHi: 'कौवे को पानी पीने के लिए क्या तरकीब लगानी चाहिए?',
          questionEn: 'What should the clever crow do to drink water?',
          options: [
            {
              textGu: 'પાસે પડેલા નાના કાંકરા ઘડામાં નાખવા ⚪',
              textHi: 'पास पड़े छोटे कंकड़ घड़े में डालना ⚪',
              textEn: 'Drop small pebbles into the pitcher ⚪',
              isBest: true,
              feedbackGu: 'સરસ વિચાર! કાંકરા નાખવાથી પાણી ધીમે-ધીમે ઉપર આવશે!',
              feedbackHi: 'शानदार विचार! कंकड़ डालने से पानी धीरे-धीरे ऊपर आ जाएगा!',
              feedbackEn: 'Brilliant idea! Pebbles will make the water rise!',
            },
            {
              textGu: 'નિરાશ થઈને ઉડી જવું 💨',
              textHi: 'निराश होकर उड़ जाना 💨',
              textEn: 'Give up and fly away 💨',
              isBest: false,
              feedbackGu: 'ના, આપણે ક્યારેય હિંમત હારવી ન જોઈએ!',
              feedbackHi: 'नहीं, हमें कभी हिम्मत नहीं हारनी चाहिए!',
              feedbackEn: 'No, we should never give up easily!',
            },
          ],
        },
      },
      {
        page: 3,
        illustration: '⚪ 🏺 📈',
        textGu: 'કાગડાએ આજુબાજુથી એક પછી એક કાંકરા ચાંચમાં ઉપાડીને ઘડામાં નાખ્યા. ધીમે-ધીમે ઘડાનું પાણી ઉપર આવવા લાગ્યું!',
        textHi: 'कौवे ने अपनी चोंच से एक-एक करके छोटे कंकड़ उठाए और घड़े में डाले। धीरे-धीरे घड़े का पानी ऊपर आने लगा!',
        textEn: 'The crow picked up pebbles one by one and dropped them into the pitcher. Slowly, the water level started to rise!',
      },
      {
        page: 4,
        illustration: '🦅 💧 🌈 🥳',
        textGu: 'પાણી ઉપર આવી ગયું! ચતુર કાગડાએ ધરાઈને મીઠું પાણી પીધું અને ખુશ થઈને આકાશમાં ઉડી ગયો!',
        textHi: 'पानी ऊपर तक आ गया! चतुर कौवे ने जी भरकर ठंडा पानी पिया और खुशी से आसमान में उड़ गया!',
        textEn: 'The water reached the top! The clever crow drank his fill of cool water and flew away happily!',
      },
    ],
  },

  // 2. THE LION AND THE LITTLE MOUSE (સિંહ અને નાનો ઉંદર / शेर और नन्हा चूहा)
  {
    id: 'story-lion-mouse',
    titleGu: 'સિંહ અને નાનો ઉંદર',
    titleHi: 'शेर और नन्हा चूहा',
    titleEn: 'The Lion and the Little Mouse',
    coverEmoji: '🦁',
    bgColor: '#FEF9E7',
    moralGu: 'કોઈને ક્યારેય નાનું કે કમજોર ન સમજવું, દરેકની મદદ કિંમતી હોય છે.',
    moralHi: 'कभी किसी को छोटा या कमजोर न समझें, हर किसी की मदद कीमती होती है।',
    moralEn: 'No act of kindness, no matter how small, is ever wasted.',
    scenes: [
      {
        page: 1,
        illustration: '🦁 💤 🌳 🐭',
        textGu: 'એક જંગલમાં સિંહ ઝાડ નીચે ઘસઘસાટ ઊંઘતો હતો. ત્યાં એક નાનો ઉંદર રમતાં રમતાં સિંહના શરીર પર દોડવા લાગ્યો.',
        textHi: 'एक घने जंगल में एक शेर पेड़ की छाया में गहरी नींद सो रहा था। तभी एक नन्हा चूहा खेलते-खेलते शेर के शरीर पर दौड़ने लगा।',
        textEn: 'A mighty lion was sleeping under a shady tree. A playful little mouse ran over his nose and woke him up.',
      },
      {
        page: 2,
        illustration: '🦁 😠 🐭 🙏',
        textGu: 'સિંહ ગુસ્સે થઈને ઉંદરને પોતાના પંજામાં પકડી લીધો. ઉંદરે હાથ જોડીને કહ્યું: "હે રાજા, મને માફ કરો! ક્યારેક હું પણ તમારા કામમાં આવીશ!"',
        textHi: 'शेर ने गुस्से में दहाड़ मारकर चूहे को अपने पंजे में पकड़ लिया। चूहे ने हाथ जोड़कर कहा: "हे महाराज! मुझे माफ कर दीजिए, कभी मैं भी आपकी मदद करूँगा!"',
        textEn: 'The lion roared in anger and trapped the mouse. The mouse begged: "Please spare me, mighty king! Someday I might help you!"',
        choice: {
          questionGu: 'સિંહે શું કરવું જોઈએ?',
          questionHi: 'शेर को क्या करना चाहिए?',
          questionEn: 'What should the lion do?',
          options: [
            {
              textGu: 'દયા રાખીને ઉંદરને છોડી દેવો 💖',
              textHi: 'दया करके चूहे को छोड़ देना 💖',
              textEn: 'Be kind and let the mouse go 💖',
              isBest: true,
              feedbackGu: 'ખૂબ સરસ! દયા રાખવી એ સૌથી મોટો ગુણ છે.',
              feedbackHi: 'बहुत खूब! दया भाव रखना सबसे बड़ा गुण है।',
              feedbackEn: 'Great! Kindness is the greatest strength.',
            },
            {
              textGu: 'ઉંદર પર ગુસ્સો કરવો 😠',
              textHi: 'चूहे पर गुस्सा करना 😠',
              textEn: 'Stay angry at the little mouse 😠',
              isBest: false,
              feedbackGu: 'ના, આપણે નાના જીવો પર પણ પ્રેમ રાખવો જોઈએ.',
              feedbackHi: 'नहीं, हमें छोटे जीवों पर प्यार और दया रखनी चाहिए।',
              feedbackEn: 'No, we should show kindness to little friends.',
            },
          ],
        },
      },
      {
        page: 3,
        illustration: '🦁 🕸️ 🌲 😢',
        textGu: 'થોડા દિવસો પછી એક શિકારીએ સિંહને જાળમાં ફસાવી દીધો. સિંહ ગર્જના કરવા લાગ્યો પણ છૂટી શક્યો નહીં.',
        textHi: 'कुछ दिनों बाद एक शिकारी ने जंगल में जाल बिछाकर शेर को फंसा लिया। शेर जोर-जोर से दहाड़ने लगा पर छूट नहीं पाया।',
        textEn: 'A few days later, hunters trapped the lion in a strong rope net. The lion roared loudly, helpless.',
      },
      {
        page: 4,
        illustration: '🐭 🦷 🕸️ 🦁 🤝',
        textGu: 'નાના ઉંદરે સિંહનો અવાજ સાંભળ્યો. તે તરત જ દોડી આવ્યો અને પોતાના તીક્ષ્ણ દાંતથી જાળ કાપી નાખી! સિંહ આઝાદ થઈ ગયો અને બંને પાક્કા મિત્ર બની ગયા!',
        textHi: 'नन्हे चूहे ने शेर की दहाड़ सुनी। वह तुरंत दौड़ा आया और अपने पैने दांतों से जाल की रस्सियां काट दीं! शेर आज़ाद हो गया और दोनों पक्के दोस्त बन गए!',
        textEn: 'The little mouse heard the roar, quickly gnawed the ropes with his sharp teeth, and freed the lion! They became best friends forever!',
      },
    ],
  },

  // 3. THE TORTOISE AND THE HARE (સસલું અને કાચબો / कछुआ और खरगोश)
  {
    id: 'story-tortoise-hare',
    titleGu: 'સસલું અને કાચબો',
    titleHi: 'कछुआ और खरगोश',
    titleEn: 'The Tortoise and the Hare',
    coverEmoji: '🐢',
    bgColor: '#EAF2F8',
    moralGu: 'ધીમી પણ સતત મહેનત હંમેશાં સફળતા અપાવે છે.',
    moralHi: 'धीमी लेकिन लगातार की गई मेहनत हमेशा जीत दिलाती है।',
    moralEn: 'Slow and steady always wins the race.',
    scenes: [
      {
        page: 1,
        illustration: '🐇 💨 🐢 🌿',
        textGu: 'એક સસલાને પોતાની ઝડપી દોડ પર બહુ જ અભિમાન હતું. તે ધીમા કાચબાની મજાક ઉડાવતો હતો. કાચબાએ કહ્યું: "ચાલો, આપણે દોડની હરીફાઈ લગાવીએ!"',
        textHi: 'एक खरगोश को अपनी तेज दौड़ पर बहुत घमंड था। वह हमेशा कछुए की धीमी चाल का मजाक उड़ाता था। कछुए ने कहा: "आओ, हम दोनों दौड़ की प्रतियोगिता करते हैं!"',
        textEn: 'A speedy hare was very proud of his swift running. He teased a slow tortoise. The tortoise smiled and said: "Let us have a race!"',
      },
      {
        page: 2,
        illustration: '🏁 🐇 🏃‍♂️ 🌳 💤',
        textGu: 'દોડ શરૂ થઈ! સસલું પવનની જેમ આગળ દોડી ગયું. કાચબો ધીમે-ધીમે પાછળ રહ્યો. સસલાએ વિચાર્યું: "કાચબો તો ઘણો દૂર છે, લાવ થોડી વાર ઝાડ નીચે ઊંઘી લઉં!"',
        textHi: 'दौड़ शुरू हुई! खरगोश हवा की तरह तेजी से आगे निकल गया। कछुआ धीरे-धीरे आ रहा था। खरगोश ने सोचा: "कछुआ तो बहुत पीछे है, तब तक मैं पेड़ की ठंडी छांव में थोड़ी नींद ले लूँ!"',
        textEn: 'The race began! The hare dashed ahead like the wind. Looking back, he thought: "The tortoise is far behind. I have plenty of time for a nice nap under this tree."',
        choice: {
          questionGu: 'દોડ દરમિયાન સસલાએ શું કરવું જોઈતું હતું?',
          questionHi: 'दौड़ के समय खरगोश को क्या करना चाहिए था?',
          questionEn: 'What should the hare have done during the race?',
          options: [
            {
              textGu: 'આળસ ન કરતાં દોડ પૂરી કરવી 🏃',
              textHi: 'आलस छोड़कर दौड़ पूरी करना 🏃',
              textEn: 'Keep running without being lazy 🏃',
              isBest: true,
              feedbackGu: 'સાચું! કામ પૂરું ન થાય ત્યાં સુધી આળસ ન કરવી જોઈએ!',
              feedbackHi: 'बिल्कुल सही! काम पूरा होने तक आलस नहीं करना चाहिए।',
              feedbackEn: 'Correct! Never leave your task halfway!',
            },
            {
              textGu: 'અભિમાનમાં ઊંઘી જવું 😴',
              textHi: 'घमंड में आकर सो जाना 😴',
              textEn: 'Sleep proudly under the tree 😴',
              isBest: false,
              feedbackGu: 'ના, અભિમાન અને આળસથી હાર થાય છે.',
              feedbackHi: 'नहीं, घमंड और आलस से हमेशा हार होती है।',
              feedbackEn: 'No, overconfidence leads to failure.',
            },
          ],
        },
      },
      {
        page: 3,
        illustration: '😴 🐇 🐢 🐾 👣',
        textGu: 'સસલું ઘસઘસાટ ઊંઘી ગયું. બીજી બાજુ, કાચબો એક પણ પળ થોભ્યા વિના ધીમે-ધીમે અને મક્કમતાથી આગળ વધતો રહ્યો.',
        textHi: 'खरगोश गहरी नींद में सो गया। दूसरी तरफ, कछुआ बिना रुके धीरे-धीरे और लगातार अपनी मंजिल की ओर बढ़ता रहा।',
        textEn: 'The hare fell fast asleep. Meanwhile, the tortoise walked steadily, one step after another, without stopping for a moment.',
      },
      {
        page: 4,
        illustration: '🏁 🐢 🥇 🐇 😲',
        textGu: 'સસલું જાગ્યું ત્યારે કાચબો જીતની રેખા ઓળંગી ચૂક્યો હતો! કાચબો જીતી ગયો અને સસલાનું અભિમાન ઊતરી ગયું!',
        textHi: 'जब खरगोश की आँख खुली, तब तक कछुआ जीत की रेखा पार कर चुका था! कछुआ दौड़ जीत गया और खरगोश का घमंड चूर-चूर हो गया!',
        textEn: 'When the hare woke up, the tortoise was already crossing the finish line! The steady tortoise won the race, and the hare learned a valuable lesson!',
      },
    ],
  },

  // 4. THE MONKEY AND THE CROCODILE (વાંદરો અને મગર / बन्दर और मगरमच्छ)
  {
    id: 'story-monkey-crocodile',
    titleGu: 'વાંદરો અને મગર',
    titleHi: 'बन्दर और मगरमच्छ',
    titleEn: 'The Monkey and the Crocodile',
    coverEmoji: '🐵',
    bgColor: '#FDEDEC',
    moralGu: 'સંકટના સમયે બુદ્ધિ અને હાજરજવાબીપણું જીવ બચાવે છે.',
    moralHi: 'मुसीबत के समय सूझबूझ और शांत मन से काम लेना चाहिए।',
    moralEn: 'Presence of mind and quick thinking can save your life in danger.',
    scenes: [
      {
        page: 1,
        illustration: '🌳 🐵 🍒 🐊 🌊',
        textGu: 'નદી કિનારે જાંબુના ઝાડ પર એક ચતુર વાંદરો રહેતો હતો. નદીમાં રહેતા મગર સાથે તેની મિત્રતા થઈ ગઈ. વાંદરો મગરને રોજ મીઠાં જાંબુ ખવડાવતો.',
        textHi: 'नदी किनारे एक जामुन के पेड़ पर एक समझदार बन्दर रहता था। नदी के मगरमच्छ से उसकी पक्की दोस्ती हो गई। बन्दर रोज मगरमच्छ को मीठे जामुन खिलाता था।',
        textEn: 'On a tall jamun tree by a river lived a clever monkey. He befriended a crocodile and gave him delicious, sweet jamuns every day.',
      },
      {
        page: 2,
        illustration: '🐊 💬 🐵 🌊 🚣',
        textGu: 'મગરની પત્નીએ કહ્યું: "આટલાં મીઠાં જાંબુ ખાનાર વાંદરાનું કાળજું કેટલું મીઠું હશે! મારે તેનું કાળજું ખાવું છે!" મગરે વાંદરાને ઘેર ભોજનનું આમંત્રણ આપી પીઠ પર બેસાડ્યો. નદી વચ્ચે પહોંચી મગરે સાચી વાત જણાવી.',
        textHi: 'मगरमच्छ की पत्नी बोली: "जो रोज इतने मीठे जामुन खाता है, उसका कलेजा कितना मीठा होगा! मुझे उसका कलेजा खाना है।" मगरमच्छ ने बन्दर को दावत का बहाना बनाकर अपनी पीठ पर बिठा लिया। बीच नदी में उसने सच बता दिया।',
        textEn: 'The crocodile’s wife wanted the sweet heart of the monkey. The crocodile invited the monkey for a meal and took him across the river. In the deep middle of the river, he revealed his wicked plan.',
        choice: {
          questionGu: 'મુશ્કેલીમાં વાંદરાએ શું કરવું જોઈએ?',
          questionHi: 'मुसीबत के वक्त बन्दर को क्या करना चाहिए?',
          questionEn: 'What should the clever monkey do in danger?',
          options: [
            {
              textGu: 'શાંત રહીને ચતુરાઈથી યુક્તિ કરવી 💡',
              textHi: 'शांत रहकर समझदारी से तरकीब सोचना 💡',
              textEn: 'Stay calm and use a clever trick 💡',
              isBest: true,
              feedbackGu: 'ખૂબ સરસ! ગભરાવા કરતાં બુદ્ધિ વાપરવી ઉત્તમ છે.',
              feedbackHi: 'बहुत बढ़िया! घबराने की जगह बुद्धि का उपयोग ही सही रास्ता है।',
              feedbackEn: 'Great! Never panic, use your mind to find a way out.',
            },
            {
              textGu: 'ડરીને નદીમાં કૂદી પડવું 🌊',
              textHi: 'डर कर नदी में कूद जाना 🌊',
              textEn: 'Panic and jump into deep water 🌊',
              isBest: false,
              feedbackGu: 'ના, ગભરાઈને પગલું ભરવું નુકસાનકારક છે.',
              feedbackHi: 'नहीं, डर में लिया गया फैसला हमेशा गलत होता है।',
              feedbackEn: 'No, panicking makes things worse.',
            },
          ],
        },
      },
      {
        page: 3,
        illustration: '🐵 💡 🐊 ↩️ 🌊',
        textGu: 'વાંદરાએ હસીને કહ્યું: "અરે મિત્ર! તેં પહેલાં કેમ ન કહ્યું? મારું કાળજું તો મેં જાંબુના ઝાડની બખોલમાં સુરક્ષિત રાખ્યું છે! ચાલ પાછા જઈને લઈ આવીએ!" મગર તેની વાતમાં આવી ગયો અને પાછો વળ્યો.',
        textHi: 'बन्दर ने मुस्कुराकर कहा: "अरे प्यारे दोस्त! तुमने पहले क्यों नहीं बताया? अपना कलेजा तो मैं पेड़ के खोखल में ही छोड़ आया हूँ! चलो जल्दी वापस चलकर ले आते हैं!" मूर्ख मगरमच्छ तुरंत किनारे की ओर मुड़ गया।',
        textEn: 'The monkey said calmly: "Oh dear friend, why did you not tell me earlier? I left my sweet heart safely on the branch of the tree! Let us go back and fetch it!" The crocodile believed him and turned back.',
      },
      {
        page: 4,
        illustration: '🌳 🐵 🌴 🐊 🤦‍♂️',
        textGu: 'કિનારો આવતાં જ વાંદરો ફટાફટ ઝાડ પર ચડી ગયો! તેણે કહ્યું: "મૂર્ખ મગર, કાળજું ક્યારેય શરીરથી અલગ હોય? તેં મારી મિત્રતા સાથે વિશ્વાસઘાત કર્યો છે!" ચતુર વાંદરાનો જીવ બચી ગયો!',
        textHi: 'किनारा आते ही बन्दर उछलकर तुरंत पेड़ पर चढ़ गया! वह बोला: "मूर्ख मगरमच्छ, कलेजा कभी शरीर से अलग होता है क्या? तुमने दोस्ती में धोखा दिया!" समझदार बन्दर ने अपनी जान बचा ली!',
        textEn: 'As soon as they reached the shore, the monkey leaped high onto the safety of the tree! "Foolish crocodile! Can anyone leave their heart behind? You broke my trust!" The clever monkey was safe!',
      },
    ],
  },

  // 5. THE ANT AND THE DOVE (કીડી અને કબૂતર / चींटी और कबूतर)
  {
    id: 'story-ant-dove',
    titleGu: 'કીડી અને કબૂતર',
    titleHi: 'चींटी और कबूतर',
    titleEn: 'The Ant and the Dove',
    coverEmoji: '🐜',
    bgColor: '#EAFAF1',
    moralGu: 'કરેલી ભલાઈ ક્યારેય એળે જતી નથી, સારા કામનું સારું ફળ મળે છે.',
    moralHi: 'भलाई का फल हमेशा भलाई ही होता है, दूसरों की मदद जरूर करें।',
    moralEn: 'One good turn deserves another, and kindness always returns.',
    scenes: [
      {
        page: 1,
        illustration: '🌊 🐜 🍃 🕊️ 🌳',
        textGu: 'એક નાની કીડી ઝરણાં કિનારે પાણી પીતી વખતે લપસી પડી અને પાણીના વહેણમાં તણાવા લાગી. ઝાડ પર બેઠેલા દયાળુ કબૂતરે આ જોયું.',
        textHi: 'एक नन्ही चींटी नदी किनारे पानी पीते समय फिसलकर तेज धारा में बहने लगी। पेड़ पर बैठे एक दयालु कबूतर ने उसे डूबते हुए देख लिया।',
        textEn: 'A little ant slipped and fell into a rushing stream while drinking water. A kind dove sitting on an overhead tree branch saw her drowning.',
      },
      {
        page: 2,
        illustration: '🕊️ 🍂 🐜 💧 🏖️',
        textGu: 'કબૂતરે તરત જ ઝાડનું પાંદડું તોડીને કીડી પાસે પાણીમાં નાખ્યું. કીડી પાંદડા પર ચડી ગઈ અને સુરક્ષિત કિનારે પહોંચી ગઈ. તેણે કબૂતરનો આભાર માન્યો.',
        textHi: 'कबूतर ने तुरंत एक बड़ा पत्ता तोड़ा और चींटी के पास पानी में गिरा दिया। चींटी पत्ते पर चढ़ गई और तैरते हुए सुरक्षित किनारे आ गई। उसने कबूतर को धन्यवाद दिया।',
        textEn: 'The dove quickly plucked a leaf and dropped it into the water near the ant. The ant climbed onto the leaf and floated safely ashore!',
        choice: {
          questionGu: 'જો આપણને કોઈ મદદ કરે તો આપણે શું કરવું જોઈએ?',
          questionHi: 'अगर कोई हमारी मदद करे तो हमें क्या करना चाहिए?',
          questionEn: 'What should we do when someone helps us?',
          options: [
            {
              textGu: 'આભાર માનવો અને જરૂર પડ્યે મદદ કરવી 🤝',
              textHi: 'धन्यवाद कहना और जरूरत पड़ने पर मदद करना 🤝',
              textEn: 'Say thank you and be ready to help back 🤝',
              isBest: true,
              feedbackGu: 'ખૂબ સરસ! સાચા મિત્રો હંમેશાં એકબીજાને મદદ કરે છે.',
              feedbackHi: 'शाबाश! सच्चे मित्र हमेशा एक-दूसरे के काम आते हैं।',
              feedbackEn: 'Wonderful! True friends always support each other.',
            },
            {
              textGu: 'મદદ ભૂલી જવી ❌',
              textHi: 'मदद को भूल जाना ❌',
              textEn: 'Forget about their kindness ❌',
              isBest: false,
              feedbackGu: 'ના, આપણે હંમેશાં ઉપકાર યાદ રાખવો જોઈએ.',
              feedbackHi: 'नहीं, हमें हमेशा दूसरों के उपकार को याद रखना चाहिए।',
              feedbackEn: 'No, we should always remember acts of kindness.',
            },
          ],
        },
      },
      {
        page: 3,
        illustration: '🏹 🦹 🎯 🕊️ 💤',
        textGu: 'બીજા દિવસે એક શિકારી કબૂતરનો શિકાર કરવા તીર તાકીને ઊભો હતો. કબૂતર ઊંઘમાં હતું અને તેને ખબર નહોતી. કીડીએ આ જોયું.',
        textHi: 'अगले दिन एक शिकारी पेड़ पर सो रहे कबूतर पर निशाना साध रहा था। कबूतर को खतरे का बिल्कुल पता नहीं था। नन्ही चींटी ने शिकारी को देख लिया।',
        textEn: 'The next day, a hunter was aiming his arrow at the resting dove. The dove was unaware of the danger, but the little ant spotted the hunter!',
      },
      {
        page: 4,
        illustration: '🐜 🦶 💥 🏹 🕊️ ✨',
        textGu: 'કીડીએ દોડીને શિકારીના પગમાં જોરથી બટકું ભર્યું! શિકારી દર્દથી બૂમ પાડી ઊઠ્યો: "ઓય બાપ રે!" તેનો નિશાન ચૂકી ગયો અને કબૂતર સુરક્ષિત ઉડી ગયું! બંનેની મિત્રતા અમર બની ગઈ!',
        textHi: 'चींटी ने दौड़कर शिकारी के पैर पर जोर से काट लिया! शिकारी दर्द से चीख पड़ा: "आह!" उसका निशाना चूक गया और कबूतर उड़कर बच गया! दोनों पक्के दोस्त बन गए!',
        textEn: 'The ant rushed and bit the hunter hard on the ankle! The hunter yelled in pain, dropping his arrow. The dove woke up and flew safely away!',
      },
    ],
  },

  // 6. THE HONEST WOODCUTTER (પ્રામાણિક કઠિયારો / ईमानदार लकड़हारा)
  {
    id: 'story-honest-woodcutter',
    titleGu: 'પ્રામાણિક કઠિયારો',
    titleHi: 'ईमानदार लकड़हारा',
    titleEn: 'The Honest Woodcutter',
    coverEmoji: '🪓',
    bgColor: '#FCF3CF',
    moralGu: 'પ્રામાણિકતા એ જીવનનો સૌથી મોટો સદ્ગુણ છે.',
    moralHi: 'ईमानदारी जीवन का सबसे अनमोल और उत्तम गुण है।',
    moralEn: 'Honesty is the best policy and brings great rewards.',
    scenes: [
      {
        page: 1,
        illustration: '🌲 🪓 🌊 😢 🪵',
        textGu: 'એક ગરીબ કઠિયારો નદી કિનારે લાકડાં કાપતો હતો. અચાનક તેના હાથમાંથી લોખંડની કુહાડી છટકીને ઊંડી નદીમાં પડી ગઈ. તેની પાસે બીજી કોઈ કુહાડી નહોતી, તેથી તે રડવા લાગ્યો.',
        textHi: 'एक गरीब लकड़हारा नदी किनारे पेड़ की सूखी लकड़ियां काट रहा था। अचानक उसके हाथ से लोहे की कुल्हाड़ी छूटकर गहरी नदी में गिर गई। वह नदी किनारे बैठकर रोने लगा।',
        textEn: 'A poor woodcutter was chopping wood near a river. Suddenly, his iron axe slipped from his hands and sank into the deep water. He sat weeping on the bank.',
      },
      {
        page: 2,
        illustration: '🧚‍♀️ ✨ 🪓 💛 🌊',
        textGu: 'તેનું રુદન સાંભળી નદીમાંથી જળપરી પ્રગટ થઈ. તેણે સોનાની ચમકતી કુહાડી બહાર કાઢી પૂછ્યું: "શું આ તારી કુહાડી છે?"',
        textHi: 'उसका दुख देखकर नदी से एक जलपरी प्रकट हुई। उसने पानी में डुबकी लगाकर एक सोने की चमकती कुल्हाड़ी निकाली और पूछा: "क्या यह तुम्हारी कुल्हाड़ी है?"',
        textEn: 'Hearing his cries, the water fairy appeared. She dove into the water and brought out a gleaming golden axe: "Is this yours, good man?"',
        choice: {
          questionGu: 'કઠિયારાએ જળપરીને શું સાચો જવાબ આપવો જોઈએ?',
          questionHi: 'लकड़हारे को जलपरी को क्या सच बताना चाहिए?',
          questionEn: 'What should the honest woodcutter say?',
          options: [
            {
              textGu: '"ના, સોનાની કુહાડી મારી નથી, મારી લોખંડની હતી" 🌟',
              textHi: '"नहीं, यह सोने की कुल्हाड़ी मेरी नहीं, मेरी तो लोहे की थी" 🌟',
              textEn: '"No, the gold axe is not mine, mine was made of iron" 🌟',
              isBest: true,
              feedbackGu: 'ઉત્તમ! સત્ય અને પ્રામાણિકતા હંમેશાં આદર અપાવે છે.',
              feedbackHi: 'शानदार! सच और ईमानदारी ही इंसान को महान बनाती है।',
              feedbackEn: 'Excellent! Truth and honesty bring honor and peace.',
            },
            {
              textGu: 'લાલચમાં આવીને "હા, મારી છે" કહી દેવું ❌',
              textHi: 'लालच में आकर "हाँ, यह मेरी है" कह देना ❌',
              textEn: 'Greedily claim the golden axe ❌',
              isBest: false,
              feedbackGu: 'ના, લાલચ ક્યારેય ન કરવી જોઈએ.',
              feedbackHi: 'नहीं, लालच हमेशा नुकसान और शर्मिंदगी लाता है।',
              feedbackEn: 'No, greed always brings trouble.',
            },
          ],
        },
      },
      {
        page: 3,
        illustration: '🧚‍♀️ 🪓 🤍 🪓 🖤',
        textGu: 'કઠિયારાએ પ્રામાણિકતાથી ના પાડી. જળપરીએ ફરી ડૂબકી લગાવીને ચાંદીની કુહાડી કાઢી. કઠિયારાએ કહ્યું: "ના, આ પણ મારી નથી." છેવટે જળપરીએ તેની સાદી લોખંડની કુહાડી કાઢી. કઠિયારો હરખાઈને બોલ્યો: "હા, આ જ મારી કુહાડી છે!"',
        textHi: 'लकड़हारे ने ईमानदारी से मना कर दिया। जलपरी ने फिर डुबकी लगाकर चांदी की कुल्हाड़ी दिखाई। लकड़हारे ने फिर मना किया। अंत में जलपरी ने उसकी पुरानी लोहे की कुल्हाड़ी निकाली। लकड़हारा खुशी से बोला: "हाँ, यही मेरी कुल्हाड़ी है!"',
        textEn: 'The woodcutter refused the golden axe. The fairy brought a silver axe, but he refused again. Finally, she brought his old iron axe. The woodcutter smiled: "Yes, that is my axe!"',
      },
      {
        page: 4,
        illustration: '🧚‍♀️ 🎁 🪓 🪓 🪓 🥳',
        textGu: 'જળપરી કઠિયારાની સાચી પ્રામાણિકતા જોઈને અત્યંત પ્રસન્ન થઈ. તેણે લોખંડની કુહાડી સાથે સોના અને ચાંદીની બંને કુહાડીઓ પણ તેને ભેટ આપી દીધી! પ્રામાણિકતાનું મીઠું ફળ મળ્યું!',
        textHi: 'जलपरी लकड़हारे की सच्ची ईमानदारी से बहुत खुश हुई। उसने लोहे की कुल्हाड़ी के साथ सोने और चांदी की दोनों कुल्हाड़ियां भी उसे उपहार में दे दीं! ईमानदारी का पुरस्कार मिला!',
        textEn: 'Delighted with his pure honesty, the water fairy gifted him both the gold and silver axes along with his iron one! Honesty was richly rewarded!',
      },
    ],
  },

  // 7. THE FOX AND THE SOUR GRAPES (શિયાળ અને ખાટી દ્રાક્ષ / लोमड़ी और खट्टे अंगूर)
  {
    id: 'story-fox-grapes',
    titleGu: 'શિયાળ અને ખાટી દ્રાક્ષ',
    titleHi: 'लोमड़ी और खट्टे अंगूर',
    titleEn: 'The Fox and the Sour Grapes',
    coverEmoji: '🦊',
    bgColor: '#F5EEF8',
    moralGu: 'જે વસ્તુ આપણને ન મળે, તેને ખરાબ કહેવી એ આપણી નબળાઈ છે.',
    moralHi: 'जो चीज हमें न मिल सके, उसे बुरा कहना मूर्खता है।',
    moralEn: 'It is foolish to dislike what you cannot have.',
    scenes: [
      {
        page: 1,
        illustration: '🦊 🍇 🌿 🤤 ☀️',
        textGu: 'એક ભૂખ્યું શિયાળ ખોરાકની શોધમાં ગામના એક સુંદર બગીચામાં પહોંચ્યું. ત્યાં વેલા પર લટકતી રસદાર અને પાકી જાંબલી દ્રાક્ષના ઝૂમખાં જોઈ તેના મોંમાં પાણી આવી ગયું.',
        textHi: 'एक भूखी लोमड़ी भोजन की तलाश में एक सुंदर बगीचे में पहुँची। वहाँ बेलों पर लटके रसीले, मीठे अंगूरों के गुच्छे देखकर उसके मुँह में पानी आ गया।',
        textEn: 'A hungry fox wandered into a vineyard on a sunny afternoon. High up on the vines, he saw bunches of rich, purple, ripe grapes.',
      },
      {
        page: 2,
        illustration: '🦊 🦘 🍇 🧗‍♂️ 💨',
        textGu: 'દ્રાક્ષના ઝૂમખાં ખૂબ ઊંચાઈ પર હતા. શિયાળે પાછળ હટીને ઊંચો કૂદકો માર્યો, પણ તે પહોંચી શક્યું નહીં. તેણે ફરીથી જોર કરીને કૂદકો માર્યો.',
        textHi: 'अंगूर काफी ऊँचाई पर लटके थे। लोमड़ी थोड़ा पीछे हटी और जोर से उछली, लेकिन उसके हाथ कुछ न लगा। उसने फिर से पूरी ताकत लगाकर छलांग लगाई।',
        textEn: 'The juicy grapes hung high out of reach. The fox took a running start and jumped high, but missed by inches. He tried again with all his might.',
        choice: {
          questionGu: 'નિષ્ફળતા મળતાં શિયાળે શું વિચારવું જોઈએ?',
          questionHi: 'असफलता मिलने पर लोमड़ी को क्या सोचना चाहिए?',
          questionEn: 'What is the right attitude when facing failure?',
          options: [
            {
              textGu: 'હકીકત સ્વીકારવી અને વસ્તુને દોષ ન દેવો 🌱',
              textHi: 'सच्चाई स्वीकारना और चीजों को दोष न देना 🌱',
              textEn: 'Accept the truth without blaming the grapes 🌱',
              isBest: true,
              feedbackGu: 'સાચું! પોતાની ખામી છુપાવવા વસ્તુને ખરાબ ન કહેવી જોઈએ.',
              feedbackHi: 'बिल्कुल सही! अपनी कमी छुपाने के लिए किसी चीज को दोष नहीं देना चाहिए।',
              feedbackEn: 'Spot on! Never blame others or things for our own limitations.',
            },
            {
              textGu: 'દ્રાક્ષને ખોટી રીતે ખાટી કહી દેવી 🍇',
              textHi: 'अंगूरों को झूठा खट्टा कह देना 🍇',
              textEn: 'Falsely claim the grapes are sour anyway 🍇',
              isBest: false,
              feedbackGu: 'ના, આને જ ખાટી દ્રાક્ષનું બહાનું કહેવાય છે.',
              feedbackHi: 'नहीं, इसे ही खट्टे अंगूर का बहाना बनाना कहते हैं।',
              feedbackEn: 'No, that is just making proud excuses.',
            },
          ],
        },
      },
      {
        page: 3,
        illustration: '🦊 💦 🥵 🍇 🍃',
        textGu: 'શિયાળે વારંવાર કૂદકા માર્યા, પણ દ્રાક્ષ એટલી ઊંચી હતી કે તે એક પણ દાણો પકડી શક્યું નહીં. આખરે શિયાળ થાકીને લોથપોથ થઈ ગયું.',
        textHi: 'लोमड़ी ने बार-बार ऊँची छलांग लगाई, पर अंगूर इतने ऊँचे थे कि वह एक भी दाना छू नहीं पाई। आखिर में वह बुरी तरह थककर चूर हो गई।',
        textEn: 'The fox jumped again and again, but the luscious grapes stayed just beyond his grasp. Soon, he grew completely exhausted and out of breath.',
      },
      {
        page: 4,
        illustration: '🦊 😤 🚶‍♂️ 🍇 😒',
        textGu: 'પોતાની હાર છુપાવવા શિયાળે મોં મચકોડીને કહ્યું: "દ્રાક્ષ તો સાવ ખાટી છે, મારે નથી ખાવી!" અને તે ચાલતું થયું. સાચે જ, દ્રાક્ષ તો મીઠી જ હતી પણ શિયાળનું બહાનું હતું!',
        textHi: 'अपनी हार छुपाने के लिए लोमड़ी नाक सिकोड़कर बोली: "अंगूर तो बिल्कुल खट्टे हैं, मुझे नहीं खाने!" और वहाँ से चली गई। अंगूर तो मीठे थे, बस लोमड़ी का बहाना था!',
        textEn: 'To hide his disappointment, the fox walked away with his nose high: "The grapes are sour anyway, I do not want them!" But the grapes were sweet as honey!',
      },
    ],
  },

  // 8. THE KIND LITTLE SPARROW (દયાવાન નાની ચકલી / दयालु नन्ही गौरैया)
  {
    id: 'story-kind-sparrow',
    titleGu: 'દયાવાન નાની ચકલી',
    titleHi: 'दयालु नन्ही गौरैया',
    titleEn: 'The Kind Little Sparrow',
    coverEmoji: '🐦',
    bgColor: '#E8F6F3',
    moralGu: 'જરૂરિયાતમંદને આશરો આપવો એ સૌથી મોટો પુણ્યનો માર્ગ છે.',
    moralHi: 'जरूरतमंद को सहारा देना ही सबसे बड़ा धर्म और खुशी है।',
    moralEn: 'Helping someone in distress brings the truest warmth and joy.',
    scenes: [
      {
        page: 1,
        illustration: '🌳 🐦 🏡 🌧️ ⛈️',
        textGu: 'એક નાની ચકલીએ ઝાડની ડાળી પર સૂકા તણખલાંથી એક સુંદર અને ગરમ માળો બનાવ્યો હતો. સાંજ પડતાં જ આકાશમાં કાળા ડિબાંગ વાદળો ઘેરાયા અને જોરદાર વરસાદ શરૂ થયો.',
        textHi: 'एक नन्ही गौरैया ने पेड़ की टहनी पर तिनकों से एक सुंदर और आरामदायक घोंसला बनाया था। शाम होते ही आसमान में काले बादल छा गए और मूसलाधार बारिश होने लगी।',
        textEn: 'A kind little sparrow built a cozy nest high on a green tree branch. As evening fell, dark rainclouds gathered and cold rain began to pour.',
      },
      {
        page: 2,
        illustration: '🦋 🥶 🌧️ 🏡 🐦',
        textGu: 'એક નાનું પતંગિયું વરસાદમાં ભીંજાઈને ધ્રૂજતું ધ્રૂજતું ચકલીના માળા પાસે આવ્યું અને વિનંતી કરી: "ચકલીબેન, મારી પાંખો ભીંજાઈ ગઈ છે, મને થોડીવાર આશરો આપો!"',
        textHi: 'एक नन्ही तितली बारिश में भीगती और कांपती हुई गौरैया के घोंसले के पास आई। उसने कहा: "गौरैया दीदी, मेरे पंख भीग गए हैं, क्या मुझे थोड़ी देर अपने घोंसले में शरण मिल सकती है?"',
        textEn: 'A tiny butterfly, shivering with soaked delicate wings, knocked gently on the sparrow’s nest: "Dear sparrow, my wings are soaked, may I please shelter from the rain?"',
        choice: {
          questionGu: 'મુશ્કેલીમાં આવેલા પતંગિયા માટે ચકલીએ શું કરવું જોઈએ?',
          questionHi: 'मुसीबत में आई नन्ही तितली के लिए गौरैया को क्या करना चाहिए?',
          questionEn: 'What should the kind sparrow do for the butterfly?',
          options: [
            {
              textGu: 'પ્રેમથી માળામાં આશરો આપવો 🏡',
              textHi: 'प्यार से अपने घोंसले में जगह देना 🏡',
              textEn: 'Warmly welcome the butterfly inside 🏡',
              isBest: true,
              feedbackGu: 'ખૂબ સરસ! દયા અને પ્રેમથી વહેંચવામાં જ સાચો આનંદ છે.',
              feedbackHi: 'बहुत सुंदर! दूसरों को सहारा देने में ही सच्चा सुख है।',
              feedbackEn: 'Wonderful! Giving shelter to those in need is true love.',
            },
            {
              textGu: 'દરવાજો બંધ કરી દેવો 🚪',
              textHi: 'दरवाजा बंद कर लेना 🚪',
              textEn: 'Turn away the cold butterfly 🚪',
              isBest: false,
              feedbackGu: 'ના, આપણે મુસીબતમાં પડેલાની હંમેશાં મદદ કરવી જોઈએ.',
              feedbackHi: 'नहीं, हमें किसी असहाय को मुसीबत में अकेला नहीं छोड़ना चाहिए।',
              feedbackEn: 'No, we should never turn our back on someone in need.',
            },
          ],
        },
      },
      {
        page: 3,
        illustration: '🐦 💖 🦋 🌾 🏠',
        textGu: 'દયાળુ ચકલીએ તરત જ પતંગિયાને માળામાં બોલાવી લીધું અને પોતાની પાંખો નીચે હૂંફ આપી. બંનેએ સાથે મળીને મીઠા દાણા ખાધા.',
        textHi: 'दयालु गौरैया ने तुरंत तितली को घोंसले के अंदर बुला लिया और अपने पंखों की गर्माहट दी। दोनों ने मिलकर मीठे दाने खाए।',
        textEn: 'The sparrow opened her nest wide and protected the little butterfly under her warm wings. They shared sweet grains and rested safely together.',
      },
      {
        page: 4,
        illustration: '☀️ 🌈 🐦 🌸 🦋 🎶',
        textGu: 'સવારે સોનેરી સૂર્ય નીકળ્યો અને વરસાદ થંભી ગયો. પતંગિયાની પાંખો સુકાઈ ગઈ. બંને પાક્કા મિત્રો બનીને ખુશીથી ફૂલોના બગીચામાં ગીતો ગાવા લાગ્યા!',
        textHi: 'सुबह सुनहरा सूरज निकला और बारिश थम गई। तितली के पंख सूख गए। दोनों पक्के दोस्त बन गए और बगीचे के फूलों पर खुशी से गाने लगे!',
        textEn: 'The next morning, golden sunlight filled the woods. With dry wings and happy hearts, the sparrow and butterfly danced together among blooming flowers!',
      },
    ],
  },
];

