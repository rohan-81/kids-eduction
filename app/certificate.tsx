import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../src/context/AppContext';
import { Header } from '../src/components/Header';
import { soundEffects } from '../src/services/soundEffects';
import { GuestLimitationModal } from '../src/components/common/GuestLimitationModal';
import { formatNumberDigits, formatMathExpression } from '../src/utils/languageData';
import { AppGlobalBackground } from '../src/components/common/AppGlobalBackground';
import { ClayBadgeToken, TokenTone, type BadgeArt } from '../src/components/SubjectBadgeIcons';
import * as Art from '../src/components/art3d/Art3D';
import { HOME_CARD_ART, SUBJECT_CARD_ART } from '../src/utils/imageHelper';
import { Glyph, PencilIcon, PrinterIcon } from '../src/components/fun';
import { formatChildName } from '../src/utils/nameTransliterator';
import { webDomProps } from '../src/utils/webStyle';

const CERTIFICATE_CATEGORIES: { id: string; titleGu: string; titleHi: string; titleEn: string; art: BadgeArt; tone: TokenTone; badgeGu: string; badgeHi: string; badgeEn: string }[] = [
  {
    id: 'all-round',
    titleGu: 'ઓલ-રાઉન્ડ સુપર સ્ટાર લર્નર',
    titleHi: 'ऑल-राउंड सुपर स्टार शिक्षार्थी',
    titleEn: 'All-Round Super Star Learner',
    art: SUBJECT_CARD_ART.star,
    tone: 'gold',
    badgeGu: 'સર્વાંગી શ્રેષ્ઠતા • ગ્રેડ: A+ (ઉત્કૃષ્ટ)',
    badgeHi: 'सर्वांगीण उत्कृष्टता • ग्रेड: A+ (उत्कृष्ट)',
    badgeEn: 'All-Round Excellence • Grade: A+ (Outstanding)',
  },
  {
    id: 'ghadiya',
    titleGu: 'ઘડિયા કોષ્ટક ૧ થી ૫ માસ્ટરી',
    titleHi: 'पहाड़े १ से ५ तालिका मास्टर',
    titleEn: 'Multiplication Tables 1-5 Master',
    art: Art.TimesArt,
    tone: 'sky',
    badgeGu: 'ગણિત કોષ્ટક નિપુણ • ગ્રેડ: A+ (ઉત્કૃષ્ટ)',
    badgeHi: 'गणित तालिका निपुण • ग्रेड: A+ (उत्कृष्ट)',
    badgeEn: 'Multiplication Tables Master • Grade: A+ (Outstanding)',
  },
  {
    id: 'gu-varnamala',
    titleGu: 'સંપૂર્ણ કક્કો & મૂળાક્ષર માસ્ટર (ક થી જ્ઞ)',
    titleHi: 'संपूर्ण हिंदी वर्णमाला मास्टर (क से ज्ञ)',
    titleEn: 'Native Alphabet & Varnamala Champion',
    art: HOME_CARD_ART.abc.gu,
    tone: 'lavender',
    badgeGu: 'ભાષા પાયો ચેમ્પિયન • ગ્રેડ: A+ (ઉત્કૃષ્ટ)',
    badgeHi: 'हिंदी भाषा आधार चैंपियन • ग्रेड: A+ (उत्कृष्ट)',
    badgeEn: 'Language Foundation Champion • Grade: A+ (Outstanding)',
  },
  {
    id: 'numbers',
    titleGu: 'અંકો ૧ થી ૩૦ અને ગણિત વિજેતા',
    titleHi: 'संख्याएँ १ से ३० और गणित विजेता',
    titleEn: 'Numbers 1-30 & Math Master',
    art: HOME_CARD_ART.counting.en,
    tone: 'peach',
    badgeGu: 'અંકશાસ્ત્ર વિજેતા • ગ્રેડ: A+ (ઉત્કૃષ્ટ)',
    badgeHi: 'अंकशास्त्र विजेता • ग्रेड: A+ (उत्कृष्ट)',
    badgeEn: 'Mathematics & Counting Master • Grade: A+ (Outstanding)',
  },
  {
    id: 'en-alphabet',
    titleGu: 'અંગ્રેજી મૂળાક્ષરો & ફોનિક્સ (A to Z)',
    titleHi: 'अंग्रेजी वर्णमाला और फोनिक्स',
    titleEn: 'English Alphabet & Phonics Master',
    art: HOME_CARD_ART.abc.en,
    tone: 'sky',
    badgeGu: 'ઇંગ્લિશ ફોનિક્સ નિપુણ • ગ્રેડ: A+ (ઉત્કૃષ્ટ)',
    badgeHi: 'अंग्रेजी फोनिक्स निपुण • ग्रेड: A+ (उत्कृष्ट)',
    badgeEn: 'English Phonics & Reading Master • Grade: A+ (Outstanding)',
  },
  {
    id: 'duel-quiz',
    titleGu: 'ડ્યુઅલ ક્વિઝ & બ્રેઇન ચેમ્પિયન',
    titleHi: 'द्वंद्व प्रश्नोत्तरी और दिमाग चैंपियन',
    titleEn: '2-Player Duel Quiz Champion',
    art: Art.BoxingGlovesArt,
    tone: 'pink',
    badgeGu: 'ઝડપી મનોમંથન વિજેતા • ગ્રેડ: A+ (ઉત્કૃષ્ટ)',
    badgeHi: 'त्वरित बुद्धि विजेता • ग्रेड: A+ (उत्कृष्ट)',
    badgeEn: 'Brain Speed Duel Champion • Grade: A+ (Outstanding)',
  },
];

export default function CertificateScreen() {
  const router = useRouter();
  const { progress, language, isGuest } = useApp();
  const [showGuestLimitModal, setShowGuestLimitModal] = useState(false);

  const profileFullName =
    [progress.firstName, progress.lastName].filter(Boolean).join(' ') ||
    progress.childName ||
    '';

  const defaultStudentName =
    (profileFullName.trim() ? formatChildName(profileFullName.trim(), language) : '') ||
    (language === 'gu'
      ? 'બાળમિત્ર'
      : language === 'hi'
      ? 'बालमित्र'
      : 'Little Champion');

  const [studentName, setStudentName] = useState(defaultStudentName);
  const [hasCustomName, setHasCustomName] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState('all-round');

  useEffect(() => {
    if (!hasCustomName) {
      const currentProfile =
        [progress.firstName, progress.lastName].filter(Boolean).join(' ') ||
        progress.childName ||
        '';
      if (currentProfile.trim()) {
        setStudentName(formatChildName(currentProfile.trim(), language));
      } else {
        setStudentName(defaultStudentName);
      }
    }
  }, [language, defaultStudentName, hasCustomName, progress.firstName, progress.lastName, progress.childName]);

  // Silence all audio immediately when this screen loses focus or user navigates to another page
  useFocusEffect(
    useCallback(() => {
      return () => {
        soundEffects.stopAnimalSound();
      };
    }, [])
  );

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const styleId = 'certificate-print-exclusive-styles';
      let styleTag = document.getElementById(styleId) as HTMLStyleElement | null;
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = styleId;
        document.head.appendChild(styleTag);
      }
      styleTag.innerHTML = `
        @page {
          size: A4 portrait;
          margin: 0;
        }
        @media print {
          html, body {
            background: #FFFFFF !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
            overflow: hidden !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          header, nav, [role="navigation"], .no-print, [data-print="hide"],
          #no-print-header, #no-print-controls,
          div[style*="position: fixed"] {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            opacity: 0 !important;
          }
          body * {
            visibility: hidden;
          }
          #certificate-print-canvas,
          #certificate-print-canvas * {
            visibility: visible !important;
          }
          #certificate-print-canvas {
            position: absolute !important;
            left: 0 !important;
            right: 0 !important;
            top: 6mm !important;
            margin: 0 auto !important;
            width: 195mm !important;
            max-width: 195mm !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            background: #FFFEF7 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `;
    }
  }, []);

  const selectedCategory =
    CERTIFICATE_CATEGORIES.find((c) => c.id === selectedCatId) || CERTIFICATE_CATEGORIES[0];

  const categoryTitle =
    language === 'gu'
      ? selectedCategory.titleGu
      : language === 'hi'
      ? selectedCategory.titleHi
      : selectedCategory.titleEn;

  const categoryBadge =
    language === 'gu'
      ? selectedCategory.badgeGu
      : language === 'hi'
      ? selectedCategory.badgeHi
      : selectedCategory.badgeEn;

  const handlePrint = () => {
    soundEffects.playLevelUp();
    if (isGuest) {
      setShowGuestLimitModal(true);
      return;
    }
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.print) {
      window.print();
      return;
    }
    Alert.alert(
      language === 'gu' ? 'પ્રમાણપત્ર તૈયાર છે!' : language === 'hi' ? 'प्रमाणपत्र तैयार है!' : 'Certificate Ready!',
      language === 'gu'
        ? 'તમે તમારા ફોનમાં આ પ્રમાણપત્રનો સ્ક્રીનશોટ લઈ શકો છો અથવા ગેલેરીમાં સાચવી શકો છો.'
        : language === 'hi'
        ? 'आप अपने फोन में इस प्रमाणपत्र का स्क्रीनशॉट ले सकते हैं या सुरक्षित रख सकते हैं।'
        : 'You can take a screenshot of this certificate to save or share it!'
    );
  };

  const rawDate = new Date().toLocaleDateString(
    language === 'gu' ? 'gu-IN' : language === 'hi' ? 'hi-IN' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );
  const todayFormatted = formatMathExpression(rawDate, language);

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppGlobalBackground id="certBgGrad" />
      <View
        nativeID="no-print-header"
        {...webDomProps({ id: 'no-print-header', 'data-print': 'hide' })}
        style={styles.noPrintArea}
      >
        <Header
          title={language === 'gu' ? 'પ્રમાણપત્ર' : language === 'hi' ? 'प्रमाणपत्र' : 'Certificate'}
          showBack={true}
          backHref="/parents"
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
        <View style={styles.container}>
          {/* TOP CUSTOMIZER CONTROLS (Hidden during printing) */}
          <View
            nativeID="no-print-controls"
            {...webDomProps({ id: 'no-print-controls', 'data-print': 'hide' })}
            style={[styles.controlsCard, styles.noPrintArea]}
          >
            {/* Student Name Editor */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <PencilIcon size={16} color="#1E293B" />
                <Text style={styles.controlLabel}>
                  {language === 'gu' ? 'બાળકનું નામ લખો:' : language === 'hi' ? 'बच्चे का नाम लिखें:' : "Child's Full Name:"}
                </Text>
              </View>
              <View style={styles.nameInputWrapper}>
                <TextInput
                  style={styles.nameInput}
                  value={studentName}
                  onChangeText={(val) => {
                    setStudentName(val);
                    setHasCustomName(true);
                  }}
                  placeholder={
                    language === 'gu'
                      ? 'નામ દાખલ કરો'
                      : language === 'hi'
                      ? 'नाम दर्ज करें'
                      : 'Enter name'
                  }
                  placeholderTextColor="#94A3B8"
                />
                <TouchableOpacity
                  style={styles.resetNameBtn}
                  onPress={() => {
                    setHasCustomName(false);
                    setStudentName(defaultStudentName);
                  }}
                >
                  <Text style={styles.resetNameText}>
                    {language === 'gu'
                      ? 'ડિફોલ્ટ'
                      : language === 'hi'
                      ? 'डिफ़ॉल्ट'
                      : 'Default'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Achievement Selector */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <ClayBadgeToken art={Art.TrophyArt} tone="gold" size={24} />
                <Text style={styles.controlLabel}>
                  {language === 'gu' ? 'સિદ્ધિ / વિષય પસંદ કરો:' : language === 'hi' ? 'उपलब्धि / विषय चुनें:' : 'Select Achievement Subject:'}
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsScroll}
                nestedScrollEnabled={true}
                directionalLockEnabled={true}
                keyboardShouldPersistTaps="handled"
              >
                {CERTIFICATE_CATEGORIES.map((cat) => {
                  const isActive = selectedCatId === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.catChip, isActive && styles.catChipActive]}
                      onPress={() => {
                        soundEffects.playBubblePop();
                        setSelectedCatId(cat.id);
                      }}
                      activeOpacity={0.8}
                    >
                      <ClayBadgeToken art={cat.art} tone={cat.tone} size={26} />
                      <Text style={[styles.catChipText, isActive && styles.catChipTextActive]}>
                        {language === 'gu' ? cat.titleGu : language === 'hi' ? cat.titleHi : cat.titleEn}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Print & PDF Download Action Button */}
            <TouchableOpacity
              style={styles.printActionBtn}
              onPress={handlePrint}
              activeOpacity={0.85}
            >
              <PrinterIcon size={18} color="#FFFFFF" strokeWidth={2.6} />
              <Text style={styles.printActionBtnText}>
                {language === 'gu' ? 'પ્રિન્ટ / PDF ડાઉનલોડ કરો (A4 સાઇઝ)' : language === 'hi' ? 'प्रिंट / PDF डाउनलोड करें' : 'Print / Download A4 Certificate'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ============================================================== */}
          {/* REAL CLASSIC GOLD AWARD CERTIFICATE (A4 / Diploma Format)       */}
          {/* ============================================================== */}
          <View
            nativeID="certificate-print-canvas"
            {...webDomProps({ id: 'certificate-print-canvas' })}
            style={[styles.certificateCanvas, styles.printableArea]}
          >
            {/* Outer Regal Antique Border */}
            <View style={styles.outerRegalBorder}>
              {/* Gap between double borders */}
              <View style={styles.middleBorderGap}>
                {/* Inner Ornate Gold Border */}
                <View style={styles.innerOrnateBorder}>
                  {/* 4 Classic Baroque Corner Flourishes */}
                  <View style={[styles.cornerFlourish, styles.flourishTL]}>
                    <Glyph name="sparkle" size={18} color="#D97706" />
                  </View>
                  <View style={[styles.cornerFlourish, styles.flourishTR]}>
                    <Glyph name="sparkle" size={18} color="#D97706" />
                  </View>
                  <View style={[styles.cornerFlourish, styles.flourishBL]}>
                    <Glyph name="sparkle" size={18} color="#D97706" />
                  </View>
                  <View style={[styles.cornerFlourish, styles.flourishBR]}>
                    <Glyph name="sparkle" size={18} color="#D97706" />
                  </View>

                  {/* Corner Filigree Brackets */}
                  <View style={[styles.cornerBracket, styles.bracketTL]} />
                  <View style={[styles.cornerBracket, styles.bracketTR]} />
                  <View style={[styles.cornerBracket, styles.bracketBL]} />
                  <View style={[styles.cornerBracket, styles.bracketBR]} />

                  {/* Top Academy Coat of Arms / Crest */}
                  <View style={styles.topCrestContainer}>
                    <View style={styles.crestShield}>
                      <Art.TempleArt size={40} />
                    </View>
                    <Text style={styles.academyMainTitle}>
                      KIDSZONE ACADEMY OF EXCELLENCE
                    </Text>
                    <Text style={styles.academySubtitle}>
                      {language === 'gu'
                        ? 'બાળ શિક્ષણ અને સંસ્કાર કેન્દ્ર • માન્યતા પ્રાપ્ત ફાઉન્ડેશન'
                        : language === 'hi'
                        ? 'बाल शिक्षा एवं संस्कार केंद्र • मान्यता प्राप्त फ़ाउंडेशन'
                        : 'FOUNDATION FOR EARLY CHILDHOOD LEARNING & CHARACTER'}
                    </Text>
                    <View style={styles.ornateDivider}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.dividerDiamond}>❖ ✦ ❖</Text>
                      <View style={styles.dividerLine} />
                    </View>
                  </View>

                  {/* Formal Certificate Main Heading */}
                  <View style={styles.headingBlock}>
                    <Text style={[styles.classicHonorific, language === 'en' && styles.fontSerif]}>
                      {language === 'gu'
                        ? 'વિશિષ્ટ સિદ્ધિ અને ઉત્કૃષ્ટતા'
                        : language === 'hi'
                        ? 'विशिष्ट उपलब्धि एवं उत्कृष्टता'
                        : 'HONOR OF MERIT & DISTINCTION'}
                    </Text>
                    <Text style={[styles.certificateBigHeading, language === 'en' && styles.fontSerif]}>
                      {language === 'gu'
                        ? 'પ્રશંસા અને ગૌરવ પ્રમાણપત્ર'
                        : language === 'hi'
                        ? 'प्रशंसा एवं गौरव प्रमाण पत्र'
                        : 'CERTIFICATE OF EXCELLENCE'}
                    </Text>
                  </View>

                  {/* Formal Conferral Pre-Text */}
                  <Text style={[styles.conferralText, language === 'en' && styles.fontSerif]}>
                    {language === 'gu'
                      ? 'આ સન્માનપૂર્વક પ્રમાણપત્ર ગૌરવ સાથે એનાયત કરવામાં આવે છે'
                      : language === 'hi'
                      ? 'यह सम्मानपूर्वक प्रमाण पत्र गौरव के साथ प्रदान किया जाता है'
                      : 'THIS IS PROUDLY PRESENTED AND CONFERRED UPON'}
                  </Text>

                  {/* Student Full Name (Prestigious Calligraphic Presentation) */}
                  <View style={styles.studentNameBlock}>
                    <Text style={[styles.studentFullName, language === 'en' && styles.fontSerif]}>
                      {studentName || defaultStudentName}
                    </Text>
                    <View style={styles.nameFlourishLine}>
                      <View style={styles.flourishUnderline} />
                      <Text style={styles.flourishStar}>★ ✦ ★</Text>
                      <View style={styles.flourishUnderline} />
                    </View>
                  </View>

                  {/* Commendation Citation Text */}
                  <Text style={[styles.citationBody, language === 'en' && styles.fontSerif]}>
                    {language === 'gu'
                      ? 'એમણે કિડ્સઝોન લર્નિંગ એકેડેમી પર અવિરત ઉત્સાહ, નિયમિત અભ્યાસ અને સખત મહેનત સાથે નીચે દર્શાવેલ વિષયમાં સંપૂર્ણ શ્રેષ્ઠતા સાબિત કરી છે:'
                      : language === 'hi'
                      ? 'इन्होंने किड्सज़ोन लर्निंग अकादमी पर निरंतर लगन, नियमित अभ्यास और निष्ठा के साथ निम्नलिखित विषय में पूर्ण उत्कृष्टता सिद्ध की है:'
                      : 'for demonstrating remarkable enthusiasm, consistent academic dedication, and mastering the curriculum with highest distinction in:'}
                  </Text>

                  {/* Achievement Title Box (Framed with Gold Laurel) */}
                  <View style={styles.achievementDiplomaCard}>
                    <View style={styles.laurelBranch}>
                      <Art.SproutArt size={30} />
                    </View>
                    <View style={styles.achievementTextCol}>
                      <Text style={[styles.achievementSubjectText, language === 'en' && styles.fontSerif]}>
                        {categoryTitle}
                      </Text>
                      <Text style={styles.achievementBadgeSub}>
                        {categoryBadge}
                      </Text>
                    </View>
                    <View style={styles.laurelBranch}>
                      <Art.SproutArt size={30} />
                    </View>
                  </View>

                  {/* Result & Evaluation Note */}
                  <Text style={[styles.evaluationNote, language === 'en' && styles.fontSerif]}>
                    {language === 'gu'
                      ? 'તમામ પડકારો અને કસોટીઓમાં ઉત્કૃષ્ટ પરિણામ મેળવીને આ સુવર્ણ સન્માન પ્રાપ્ત કર્યું છે.'
                      : language === 'hi'
                      ? 'सभी चुनौतियों और अभ्यासों में उत्कृष्ट परिणाम प्राप्त कर यह स्वर्ण सम्मान अर्जित किया है।'
                      : 'Having successfully mastered all curriculum milestones and educational assessments.'}
                  </Text>

                  {/* ========================================================= */}
                  {/* BOTTOM AUTHENTICATION: DATE | 3D GOLD SEAL | SIGNATURES    */}
                  {/* ========================================================= */}
                  <View style={styles.authenticationSection}>
                    {/* Column 1: Date & Serial ID */}
                    <View style={styles.authColumnLeft}>
                      <Text style={styles.authDateValue}>{todayFormatted}</Text>
                      <View style={styles.authUnderline} />
                      <Text style={styles.authLabel}>
                        {language === 'gu' ? 'તારીખ' : language === 'hi' ? 'दिनांक' : 'Date of Issue'}
                      </Text>
                      <Text style={styles.serialNumber}>
                        {language === 'gu' ? 'નોંધણી ક્રમાંક' : language === 'hi' ? 'पंजीकरण संख्या' : 'Registration No'}: KZ-${formatNumberDigits(2026, language)}-★{formatNumberDigits(progress.stars, language)}★
                      </Text>
                    </View>

                    {/* Column 2: Authentic 3D Starburst Gold Rosette Seal with Ribbons */}
                    <View style={styles.authColumnCenter}>
                      {/* Draped Silk Ribbons (hanging below) */}
                      <View style={styles.ribbonsContainer}>
                        <View style={[styles.ribbonTail, styles.ribbonLeft]} />
                        <View style={[styles.ribbonTail, styles.ribbonRight]} />
                      </View>

                      {/* Rosette Gold Medallion */}
                      <View style={styles.rosetteMedalCircle}>
                        <View style={styles.rosetteInnerCircle}>
                          <Text style={styles.rosetteStars}>★ ★ ★</Text>
                          <View style={styles.rosetteIcon}>
                            <Art.MedalArt size={22} />
                          </View>
                          <Text style={styles.rosetteTextTop}>OFFICIAL</Text>
                          <Text style={styles.rosetteTextBottom}>GOLD SEAL</Text>
                        </View>
                      </View>
                    </View>

                    {/* Column 3: Authorized Signatures */}
                    <View style={styles.authColumnRight}>
                      {/* Mentor/Director Signature */}
                      <View style={styles.sigWrap}>
                        <Text style={styles.cursiveDirectorSignature}>
                          KidsZone Academic Board
                        </Text>
                        <View style={styles.authUnderline} />
                        <Text style={styles.authLabel}>
                          {language === 'gu' ? 'શિક્ષક / એકેડેમી સંચાલક' : language === 'hi' ? 'अकादमी निदेशक' : 'Academy Director'}
                        </Text>
                      </View>

                      {/* Parent Signature Line */}
                      <View style={[styles.sigWrap, { marginTop: 12 }]}>
                        <View style={[styles.authUnderline, { borderStyle: 'dashed' }]} />
                        <Text style={styles.authLabel}>
                          {language === 'gu' ? 'વાલીની સહી' : language === 'hi' ? 'अभिभावक हस्ताक्षर' : 'Parent Signature'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <GuestLimitationModal
        visible={showGuestLimitModal}
        limitType="certificate"
        language={language}
        onClose={() => setShowGuestLimitModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  noPrintArea: {},
  scrollContent: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 960,
    paddingHorizontal: 12,
  },

  /* CONTROLS CARD */
  controlsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    gap: 14,
  },
  inputGroup: {
    gap: 8,
  },
  controlLabel: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1E293B',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nameInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  resetNameBtn: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  resetNameText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8B5CF6',
  },
  chipsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  catChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  catChipTextActive: {
    color: '#1D4ED8',
    fontWeight: '900',
  },
  printActionBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  printActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
  },

  /* ============================================================== */
  /* CLASSIC CERTIFICATE CANVAS & ORNATE BORDERS                    */
  /* ============================================================== */
  certificateCanvas: {
    width: '100%',
    backgroundColor: '#FFFDF9',
    borderRadius: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
  },
  printableArea: {},
  outerRegalBorder: {
    borderWidth: 6,
    borderColor: '#854D0E', // Deep antique gold
    padding: 6,
    backgroundColor: '#FFFDF9',
  },
  middleBorderGap: {
    borderWidth: 1.5,
    borderColor: '#CA8A04',
    padding: 4,
    backgroundColor: '#FFFDF9',
  },
  innerOrnateBorder: {
    borderWidth: 2.5,
    borderColor: '#B45309',
    borderRadius: 4,
    paddingTop: 24,
    paddingBottom: 44,
    paddingHorizontal: 22,
    backgroundColor: '#FFFEFA',
    position: 'relative',
    alignItems: 'center',
  },

  /* Corner Baroque Ornaments */
  cornerFlourish: {
    position: 'absolute',
    zIndex: 10,
  },
  flourishTL: { top: 8, left: 8 },
  flourishTR: { top: 8, right: 8 },
  flourishBL: { bottom: 8, left: 8 },
  flourishBR: { bottom: 8, right: 8 },

  /* Corner Geometric Brackets */
  cornerBracket: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderColor: '#D97706',
  },
  bracketTL: { top: 6, left: 6, borderTopWidth: 2, borderLeftWidth: 2 },
  bracketTR: { top: 6, right: 6, borderTopWidth: 2, borderRightWidth: 2 },
  bracketBL: { bottom: 6, left: 6, borderBottomWidth: 2, borderLeftWidth: 2 },
  bracketBR: { bottom: 6, right: 6, borderBottomWidth: 2, borderRightWidth: 2 },

  /* Academy Crest / Header */
  topCrestContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  crestShield: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#B45309',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  academyMainTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  academySubtitle: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginTop: 2,
    textAlign: 'center',
  },
  ornateDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    width: 260,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#CBD5E1',
  },
  dividerDiamond: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '900',
  },

  /* Main Heading Block */
  headingBlock: {
    alignItems: 'center',
    marginVertical: 6,
  },
  classicHonorific: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  certificateBigHeading: {
    fontSize: 26,
    fontWeight: '900',
    color: '#78350F', // Classic deep burnt gold
    textAlign: 'center',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  /* Conferral line */
  conferralText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 6,
  },

  /* Student Name Block */
  studentNameBlock: {
    alignItems: 'center',
    marginVertical: 4,
  },
  studentFullName: {
    fontSize: 30,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  nameFlourishLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 220,
    marginTop: 2,
  },
  flourishUnderline: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#B45309',
  },
  flourishStar: {
    fontSize: 11,
    color: '#D97706',
  },

  /* Citation Body Text */
  citationBody: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 620,
    marginVertical: 6,
    paddingHorizontal: 12,
  },

  /* Achievement Diploma Card */
  achievementDiplomaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginVertical: 6,
    gap: 8,
    maxWidth: 640,
  },
  laurelBranch: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementTextCol: {
    alignItems: 'center',
    flex: 1,
  },
  achievementSubjectText: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#92400E',
    textAlign: 'center',
  },
  achievementBadgeSub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
    marginTop: 1,
  },

  /* Evaluation Note */
  evaluationNote: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 16,
    maxWidth: 580,
  },

  /* ============================================================== */
  /* BOTTOM AUTHENTICATION: 3 COLUMNS                               */
  /* ============================================================== */
  authenticationSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },

  /* Left Column: Date */
  authColumnLeft: {
    flex: 1,
    alignItems: 'flex-start',
    paddingLeft: 6,
    paddingBottom: 2,
  },
  authDateValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  authUnderline: {
    width: '100%',
    maxWidth: 140,
    height: 1.5,
    backgroundColor: '#94A3B8',
    marginBottom: 3,
  },
  authLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  serialNumber: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 4,
  },

  /* Center Column: 3D Royal Gold Seal */
  authColumnCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginHorizontal: 10,
  },
  ribbonsContainer: {
    position: 'absolute',
    bottom: -18,
    width: 60,
    height: 36,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    zIndex: 1,
  },
  ribbonTail: {
    width: 14,
    height: 32,
    backgroundColor: '#991B1B', // Rich royal crimson
    borderWidth: 1,
    borderColor: '#D97706',
    borderTopWidth: 0,
  },
  ribbonLeft: {
    transform: [{ rotate: '-14deg' }],
  },
  ribbonRight: {
    transform: [{ rotate: '14deg' }],
  },
  rosetteMedalCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#D97706',
    borderWidth: 3,
    borderColor: '#78350F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#78350F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 5,
  },
  rosetteInnerCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#B45309',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rosetteStars: {
    fontSize: 7.5,
    color: '#B45309',
    fontWeight: '900',
    letterSpacing: 1,
  },
  rosetteIcon: {
    marginVertical: -1,
  },
  rosetteTextTop: {
    fontSize: 6.5,
    fontWeight: '900',
    color: '#78350F',
    letterSpacing: 0.5,
  },
  rosetteTextBottom: {
    fontSize: 6.5,
    fontWeight: '900',
    color: '#92400E',
    letterSpacing: 0.5,
  },

  /* Right Column: Signatures */
  authColumnRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  sigWrap: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 150,
  },
  cursiveDirectorSignature: {
    fontSize: 14,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#1E3A8A', // Deep navy ink
    marginBottom: 2,
  },
  fontSerif: {
    fontFamily: Platform.OS === 'web' ? "'Cinzel', 'Playfair Display', Georgia, serif" : undefined,
  },
});
