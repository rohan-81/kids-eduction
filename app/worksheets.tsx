import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Polygon } from 'react-native-svg';
import { colors } from '../src/theme/colors';
import { spacing, radii, shadows } from '../src/theme/spacing';
import { Header } from '../src/components/Header';
import { BottomNav } from '../src/components/BottomNav';
import { soundEffects } from '../src/services/soundEffects';
import { useApp } from '../src/context/AppContext';
import { GuestLimitationModal } from '../src/components/common/GuestLimitationModal';
import { toHiDigits, toGujDigits, formatNumberDigits } from '../src/utils/languageData';
import { AppGlobalBackground } from '../src/components/common/AppGlobalBackground';

const { width } = Dimensions.get('window');

type WorksheetType = 'kakko' | 'numbers' | 'ghadiya' | 'coloring';

/* Black & White Clean Outline Illustrations for Kids Coloring Worksheet */
function AppleOutline() {
  return (
    <Svg viewBox="0 0 100 100" width={90} height={90}>
      <Path
        d="M50,22 Q54,10 62,8"
        fill="none"
        stroke="#0F172A"
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      <Path
        d="M52,20 Q70,10 74,22 Q64,32 52,20 Z"
        fill="#FFFFFF"
        stroke="#0F172A"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <Path
        d="M50,28 C34,14 12,26 12,54 C12,80 34,94 50,94 C66,94 88,80 88,54 C88,26 66,14 50,28 Z"
        fill="#FFFFFF"
        stroke="#0F172A"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <Path
        d="M45,94 Q50,88 55,94"
        fill="none"
        stroke="#0F172A"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <Circle cx="38" cy="52" r="3.5" fill="#0F172A" />
      <Circle cx="62" cy="52" r="3.5" fill="#0F172A" />
      <Path
        d="M42,62 Q50,70 58,62"
        fill="none"
        stroke="#0F172A"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function MangoOutline() {
  return (
    <Svg viewBox="0 0 100 100" width={90} height={90}>
      <Path
        d="M42,16 Q44,8 50,6"
        fill="none"
        stroke="#0F172A"
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      <Path
        d="M45,15 Q62,8 64,18 Q56,26 45,15 Z"
        fill="#FFFFFF"
        stroke="#0F172A"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <Path
        d="M44,18 C62,18 86,32 86,58 C86,84 64,94 46,94 C26,94 16,80 16,60 C16,36 30,18 44,18 Z"
        fill="#FFFFFF"
        stroke="#0F172A"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <Circle cx="40" cy="50" r="3.5" fill="#0F172A" />
      <Circle cx="60" cy="50" r="3.5" fill="#0F172A" />
      <Path
        d="M44,60 Q50,66 56,60"
        fill="none"
        stroke="#0F172A"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function LionOutline() {
  return (
    <Svg viewBox="0 0 100 100" width={90} height={90}>
      <Path
        d="M50,10 C58,10 65,14 70,18 C78,16 86,22 88,30 C96,36 96,46 94,54 C98,62 94,72 88,78 C84,86 74,90 66,90 C58,94 42,94 34,90 C26,90 16,86 12,78 C6,72 2,62 6,54 C4,46 4,36 12,30 C14,22 22,16 30,18 C35,14 42,10 50,10 Z"
        fill="#FFFFFF"
        stroke="#0F172A"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <Circle
        cx="50"
        cy="52"
        r="24"
        fill="#FFFFFF"
        stroke="#0F172A"
        strokeWidth={2.5}
      />
      <Circle cx="34" cy="32" r="6" fill="#FFFFFF" stroke="#0F172A" strokeWidth={2.5} />
      <Circle cx="66" cy="32" r="6" fill="#FFFFFF" stroke="#0F172A" strokeWidth={2.5} />
      <Circle cx="42" cy="48" r="3" fill="#0F172A" />
      <Circle cx="58" cy="48" r="3" fill="#0F172A" />
      <Polygon points="46,56 54,56 50,61" fill="#0F172A" />
      <Path d="M50,61 L50,65 M44,65 Q50,69 56,65" fill="none" stroke="#0F172A" strokeWidth={2} strokeLinecap="round" />
      <Path d="M36,58 L28,56 M36,62 L28,64 M64,58 L72,56 M64,62 L72,64" stroke="#0F172A" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function ElephantOutline() {
  return (
    <Svg viewBox="0 0 100 100" width={90} height={90}>
      {/* Big Floppy Left Ear */}
      <Path
        d="M36,25 C14,12 8,50 25,62 C34,68 38,58 38,48 Z"
        fill="#FFFFFF"
        stroke="#0F172A"
        strokeWidth={2.8}
        strokeLinejoin="round"
      />
      {/* Left Inner Ear */}
      <Path
        d="M34,29 C20,20 16,48 28,56 C34,60 36,52 36,46 Z"
        fill="#FFFFFF"
        stroke="#0F172A"
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      {/* Big Floppy Right Ear */}
      <Path
        d="M64,25 C86,12 92,50 75,62 C66,68 62,58 62,48 Z"
        fill="#FFFFFF"
        stroke="#0F172A"
        strokeWidth={2.8}
        strokeLinejoin="round"
      />
      {/* Right Inner Ear */}
      <Path
        d="M66,29 C80,20 84,48 72,56 C66,60 64,52 64,46 Z"
        fill="#FFFFFF"
        stroke="#0F172A"
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      {/* Sitting Body */}
      <Path
        d="M30,55 C22,62 20,82 28,92 L72,92 C80,82 78,62 70,55 Z"
        fill="#FFFFFF"
        stroke="#0F172A"
        strokeWidth={2.8}
        strokeLinejoin="round"
      />
      {/* Left Foot */}
      <Path
        d="M26,75 C24,84 28,93 38,93 C46,93 48,84 46,75 Z"
        fill="#FFFFFF"
        stroke="#0F172A"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {/* Right Foot */}
      <Path
        d="M54,75 C52,84 54,93 62,93 C72,93 76,84 74,75 Z"
        fill="#FFFFFF"
        stroke="#0F172A"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {/* Toenails on Feet */}
      <Circle cx="31" cy="90" r="1.5" fill="#0F172A" />
      <Circle cx="37" cy="90" r="1.5" fill="#0F172A" />
      <Circle cx="43" cy="90" r="1.5" fill="#0F172A" />
      <Circle cx="57" cy="90" r="1.5" fill="#0F172A" />
      <Circle cx="63" cy="90" r="1.5" fill="#0F172A" />
      <Circle cx="69" cy="90" r="1.5" fill="#0F172A" />
      {/* Round Head */}
      <Circle
        cx="50"
        cy="40"
        r="22"
        fill="#FFFFFF"
        stroke="#0F172A"
        strokeWidth={3}
      />
      {/* Cute Eyes with Shine */}
      <Circle cx="40" cy="36" r="3.5" fill="#0F172A" />
      <Circle cx="41" cy="35" r="1.2" fill="#FFFFFF" />
      <Circle cx="60" cy="36" r="3.5" fill="#0F172A" />
      <Circle cx="61" cy="35" r="1.2" fill="#FFFFFF" />
      {/* Long Elephant Trunk (Curling Up Cheerfully) */}
      <Path
        d="M45,44 C44,56 42,70 50,72 C58,72 56,56 55,44 Z"
        fill="#FFFFFF"
        stroke="#0F172A"
        strokeWidth={2.8}
        strokeLinejoin="round"
      />
      {/* Trunk Fold Lines */}
      <Path d="M46,52 Q50,55 54,52" fill="none" stroke="#0F172A" strokeWidth={2} strokeLinecap="round" />
      <Path d="M46,60 Q50,63 54,60" fill="none" stroke="#0F172A" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export default function WorksheetsScreen() {
  const router = useRouter();
  const { language, ageGroup, isGuest } = useApp();
  const [showGuestLimitModal, setShowGuestLimitModal] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState<WorksheetType>(
    ageGroup === '6-8' ? 'ghadiya' : ageGroup === '4-6' ? 'numbers' : 'kakko'
  );
  const [ghadiyaMode, setGhadiyaMode] = useState<'blank' | 'filled'>('blank');

  const handlePrint = () => {
    soundEffects.playTadaaa();
    if (isGuest) {
      setShowGuestLimitModal(true);
      return;
    }
    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
      return;
    }
    Alert.alert(
      language === 'gu' ? 'વર્કશીટ તૈયાર છે!' : language === 'hi' ? 'वर्कशीट तैयार है!' : 'Worksheet Ready!',
      language === 'gu'
        ? 'તમે આ વર્કશીટનો સ્ક્રીનશોટ લઈ શકો છો અથવા ફોટો સેવ કરીને પ્રિન્ટ કરી શકો છો.'
        : language === 'hi'
        ? 'आप इस वर्कशीट का स्क्रीनशॉट ले सकते हैं या सुरक्षित रखकर प्रिंट कर सकते हैं।'
        : 'You can take a screenshot of this worksheet to save or print it!'
    );
  };

  const alphabetLetters =
    language === 'hi'
      ? [
          'अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ',
          'क', 'ख', 'ग', 'घ', 'च', 'छ', 'ज', 'झ', 'ट', 'ठ',
          'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न', 'प', 'फ',
          'ब', 'भ', 'म', 'य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह'
        ]
      : language === 'en'
      ? [
          'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
          'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
          'U', 'V', 'W', 'X', 'Y', 'Z'
        ]
      : [
          'ક', 'ખ', 'ગ', 'ઘ', 'ચ', 'છ', 'જ', 'ઝ',
          'ટ', 'ઠ', 'ડ', 'ઢ', 'ણ', 'ત', 'થ', 'દ',
          'ધ', 'ન', 'પ', 'ફ', 'બ', 'ભ', 'મ', 'ય',
          'ર', 'લ', 'વ', 'શ', 'ષ', 'સ', 'હ', 'ળ', 'ક્ષ', 'જ્ઞ'
        ];

  const numbersList =
    language === 'hi'
      ? ['१', '२', '३', '४', '५', '६', '७', '८', '९', '१०', '११', '१२', '१३', '१४', '१५', '१६', '१७', '१८', '१९', '२०']
      : language === 'en'
      ? ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20']
      : ['૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯', '૧૦', '૧૧', '૧૨', '૧૩', '૧૪', '૧૫', '૧૬', '૧૭', '૧૮', '૧૯', '૨૦'];

  const screenTitle =
    language === 'gu'
      ? 'વર્કશીટ્સ'
      : language === 'hi'
      ? 'वर्कशीट्स'
      : 'Worksheets';

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppGlobalBackground id="worksheetsBgGrad" />
      <Header title={screenTitle} showBack={true} backHref="/home" />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top Description & Action Bar */}
        <View style={[styles.headerBanner, shadows.soft]}>
          <View style={styles.headerBannerTextCol}>
            <Text style={styles.headerBannerTitle}>
              {language === 'gu'
                ? 'ઘરે પેન્સિલથી પ્રેક્ટિસ માટે વર્કશીટ'
                : language === 'hi'
                ? 'घर पर पेंसिल अभ्यास के लिए वर्कशीट'
                : 'Worksheets for Pencil Practice at Home'}
            </Text>
            <Text style={styles.headerBannerSub}>
              {language === 'gu'
                ? 'વાલીઓ ૧-ક્લિકમાં A4 પેપર પર પ્રિન્ટ કરી શકે છે અથવા PDF સેવ કરી શકે છે.'
                : language === 'hi'
                ? 'अभिभावक १-क्लिक में A4 पेपर पर प्रिंट कर सकते हैं या PDF सेव कर सकते हैं।'
                : 'Parents can print on A4 paper or save as PDF in 1 click.'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.printBtn, shadows.card]}
            onPress={handlePrint}
            activeOpacity={0.85}
          >
            <Text style={styles.printBtnText}>
              {language === 'gu'
                ? 'પ્રિન્ટ / PDF ડાઉનલોડ'
                : language === 'hi'
                ? 'प्रिंट / PDF डाउनलोड'
                : 'Print / Download PDF'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Class Filter & Difficulty Level Indicator */}
        <View style={styles.classInfoBar}>
          <View style={styles.classChipRow}>
            <Text style={styles.classChipLabel}>
              {ageGroup === '2-4'
                ? (language === 'gu' ? 'પ્રી-સ્કૂલ નર્સરી (૨-૪ વર્ષ)' : language === 'hi' ? 'प्री-स्कूल नर्सरी (२-४ वर्ष)' : 'Pre-School Nursery (2-4 yrs)')
                : ageGroup === '4-6'
                ? (language === 'gu' ? 'ધોરણ ૧ - ૨ (૪-૬ વર્ષ)' : language === 'hi' ? 'कक्षा १ - २ (४-६ वर्ष)' : 'Class 1 - 2 (4-6 yrs)')
                : (language === 'gu' ? 'ધોરણ ૩ - ૫ (૬-૮ વર્ષ)' : language === 'hi' ? 'कक्षा ३ - ५ (६-८ वर्ष)' : 'Class 3 - 5 (6-8 yrs)')}
            </Text>
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyBadgeText}>
                {ageGroup === '2-4'
                  ? (language === 'gu' ? 'સરળ સ્તર' : language === 'hi' ? 'आसान स्तर' : 'Easy Level')
                  : ageGroup === '4-6'
                  ? (language === 'gu' ? 'મધ્યમ સ્તર' : language === 'hi' ? 'मध्यम स्तर' : 'Medium Level')
                  : (language === 'gu' ? 'ઉન્નત સ્તર' : language === 'hi' ? 'उन्नत स्तर' : 'Advanced Level')}
              </Text>
            </View>
          </View>
          <Text style={styles.completionStatusText}>
            {language === 'gu'
              ? 'સ્થિતિ: પ્રિન્ટેબલ અને પેન્સિલ અભ્યાસ માટે તૈયાર'
              : language === 'hi'
              ? 'स्थिति: प्रिंट करने योग्य और पेंसिल अभ्यास हेतु तैयार'
              : 'Status: Printable & Ready for Pen/Pencil Practice'}
          </Text>
        </View>

        {/* Worksheet Selector Tabs */}
        <View style={styles.sheetSelectorRow}>
          {[
            {
              id: 'kakko' as WorksheetType,
              label:
                language === 'gu'
                  ? 'કક્કો ટ્રેસિંગ'
                  : language === 'hi'
                  ? 'वर्णमाला ट्रेसिंग'
                  : 'A-Z Alphabet Tracing',
            },
            {
              id: 'numbers' as WorksheetType,
              label:
                language === 'gu'
                  ? '૧-૨૦ અંકો'
                  : language === 'hi'
                  ? '१-२० संख्याएँ'
                  : '1-20 Numbers',
            },
            {
              id: 'ghadiya' as WorksheetType,
              label:
                language === 'gu'
                  ? '૧-૧૦ ઘડિયા વર્કશીટ'
                  : language === 'hi'
                  ? '१-१० पहाड़े वर्कशीट'
                  : '1-10 Tables Worksheet',
            },
            {
              id: 'coloring' as WorksheetType,
              label:
                language === 'gu'
                  ? 'કલરિંગ પેજ'
                  : language === 'hi'
                  ? 'रंग भरो पेज'
                  : 'Coloring Pages',
            },
          ].map((tab) => {
            const isSelected = selectedSheet === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.sheetTabBtn, isSelected && styles.sheetTabBtnActive]}
                onPress={() => {
                  soundEffects.playBubblePop();
                  setSelectedSheet(tab.id);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.sheetTabText, isSelected && styles.sheetTabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Ghadiya Mode Toggle: Blank Practice Worksheet vs Answer Key Chart */}
        {selectedSheet === 'ghadiya' && (
          <View style={styles.ghadiyaModeToggleRow}>
            <TouchableOpacity
              style={[
                styles.ghadiyaModeBtn,
                ghadiyaMode === 'blank' && styles.ghadiyaModeBtnActive,
              ]}
              onPress={() => {
                soundEffects.playBubblePop();
                setGhadiyaMode('blank');
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.ghadiyaModeBtnText,
                  ghadiyaMode === 'blank' && styles.ghadiyaModeBtnTextActive,
                ]}
              >
                {language === 'gu'
                  ? 'પ્રેક્ટિસ વર્કશીટ (જવાબ ખાલી)'
                  : language === 'hi'
                  ? 'अभ्यास वर्कशीट (उत्तर खाली)'
                  : 'Practice Worksheet (Blank Answers)'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.ghadiyaModeBtn,
                ghadiyaMode === 'filled' && styles.ghadiyaModeBtnActive,
              ]}
              onPress={() => {
                soundEffects.playBubblePop();
                setGhadiyaMode('filled');
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.ghadiyaModeBtnText,
                  ghadiyaMode === 'filled' && styles.ghadiyaModeBtnTextActive,
                ]}
              >
                {language === 'gu'
                  ? 'સંપૂર્ણ ઘડિયા (જવાબ સાથે)'
                  : language === 'hi'
                  ? 'पूरे पहाड़े (उत्तर सहित)'
                  : 'Reference Chart (With Answers)'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Printable Paper Canvas (Styled as actual A4 sheet) */}
        <View style={[styles.printablePaper, shadows.card]}>
          {/* Paper Header */}
          <View style={styles.paperHeader}>
            <View style={styles.paperTitleCol}>
              <Text style={styles.paperBrand}>
                {language === 'gu'
                  ? 'KidsZone • ગુજરાતી બાળશિક્ષણ'
                  : language === 'hi'
                  ? 'KidsZone • बाल शिक्षण'
                  : 'KidsZone • Early Learning Academy'}
              </Text>
              <Text style={styles.paperTitle}>
                {selectedSheet === 'kakko' &&
                  (language === 'gu'
                    ? 'ગુજરાતી મૂળાક્ષરો (કક્કો) ઘૂંટો અને લખો'
                    : language === 'hi'
                    ? 'वर्णमाला अक्षर घूंटो और लिखो'
                    : 'English Alphabet (A to Z) - Trace & Write')}
                {selectedSheet === 'numbers' &&
                  (language === 'gu'
                    ? 'ગુજરાતી અંકો ૧ થી ૨૦ ઘૂંટો અને ગણો'
                    : language === 'hi'
                    ? 'संख्याएँ १ से २० घूंटो और गिनो'
                    : 'Numbers 1 to 20 - Trace, Count & Write')}
                {selectedSheet === 'ghadiya' &&
                  (ghadiyaMode === 'blank'
                    ? language === 'gu'
                      ? 'ઘડિયા પ્રેક્ટિસ વર્કશીટ (૧ થી ૧૦ ના ઘડિયા)'
                      : language === 'hi'
                      ? 'पहाड़े अभ्यास वर्कशीट (१ से १०)'
                      : 'Multiplication Practice Worksheet (1 to 10)'
                    : language === 'gu'
                    ? 'ઘડિયા સંદર્ભ ચાર્ટ (૧ થી ૧૦ ના ઘડિયા)'
                    : language === 'hi'
                    ? 'पहाड़े संदर्भ चार्ट (१ से १०)'
                    : 'Multiplication Reference Chart (1 to 10)')}
                {selectedSheet === 'coloring' &&
                  (language === 'gu'
                    ? 'સુંદર ચિત્રોમાં મનગમતા રંગો પૂરો'
                    : language === 'hi'
                    ? 'सुंदर चित्रों में मनपसंद रंग भरें'
                    : 'Color the Fun Pictures with Beautiful Colors')}
              </Text>
            </View>
            <View style={styles.studentInfoBox}>
              <Text style={styles.infoLine}>
                {language === 'gu' ? 'નામ: ____________________' : language === 'hi' ? 'नाम: ____________________' : 'Name: ____________________'}
              </Text>
              <Text style={styles.infoLine}>
                {language === 'gu' ? 'તારીખ: __________________' : language === 'hi' ? 'दिनांक: __________________' : 'Date: ____________________'}
              </Text>
            </View>
          </View>

          {/* Practice Worksheet Instructions for Kids */}
          {selectedSheet === 'ghadiya' && ghadiyaMode === 'blank' && (
            <View style={styles.worksheetInstructionBox}>
              <Text style={styles.worksheetInstructionText}>
                {language === 'gu'
                  ? 'સૂચના: દરેક દાખલો ગણો અને ખાલી બોક્સ [  ] માં સાચો જવાબ લખો.'
                  : language === 'hi'
                  ? 'निर्देश: प्रत्येक सवाल हल करें और खाली बॉक्स [  ] में सही उत्तर लिखें।'
                  : 'Instructions: Solve each problem and write the answer inside the box [  ].'}
              </Text>
            </View>
          )}

          {/* Paper Content: Alphabet / Kakko */}
          {selectedSheet === 'kakko' && (
            <View style={styles.kakkoGrid}>
              {alphabetLetters.map((char) => (
                <View key={char} style={styles.letterBox}>
                  <Text style={styles.letterSolid}>{char}</Text>
                  <View style={styles.traceLines}>
                    <Text style={styles.letterDotted}>{char}</Text>
                    <Text style={styles.letterDotted}>{char}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Paper Content: Numbers */}
          {selectedSheet === 'numbers' && (
            <View style={styles.numbersGrid}>
              {numbersList.map((num, i) => (
                <View key={num} style={styles.numberRowBox}>
                  <View style={styles.numCircle}>
                    <Text style={styles.numSolidText}>{num}</Text>
                  </View>
                  <View style={styles.numTraceDots}>
                    <Text style={styles.numDottedText}>{num}</Text>
                    <Text style={styles.numDottedText}>{num}</Text>
                    <Text style={styles.numDottedText}>{num}</Text>
                  </View>
                  <View style={styles.numApplesRow}>
                    {Array.from({ length: Math.min(i + 1, 10) }).map((_, ai) => (
                      <Text key={ai} style={styles.smallApple}>🍎</Text>
                    ))}
                    {i + 1 > 10 && <Text style={styles.moreText}>+{formatNumberDigits(i + 1 - 10, language)}</Text>}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Paper Content: Ghadiya / Math Tables (Tables 1 to 10) */}
          {selectedSheet === 'ghadiya' && (
            <View style={styles.ghadiyaTableGrid}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((tNum) => (
                <View key={tNum} style={styles.ghadiyaColBox}>
                  <Text style={styles.ghadiyaColHeader}>
                    {language === 'gu'
                      ? `${toGujDigits(tNum)} નો ઘડિયો`
                      : language === 'hi'
                      ? `${toHiDigits(tNum)} का पहाड़ा`
                      : `Table of ${tNum}`}
                  </Text>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((step) => (
                    <View key={step} style={styles.ghadiyaRow}>
                      <Text style={styles.ghadiyaFormulaText}>
                        {formatNumberDigits(tNum, language)} × {formatNumberDigits(step, language)} =
                      </Text>
                      <View
                        style={[
                          styles.ghadiyaAnswerBox,
                          ghadiyaMode === 'blank' && styles.ghadiyaAnswerBoxBlank,
                        ]}
                      >
                        {ghadiyaMode === 'filled' ? (
                          <Text style={styles.ghadiyaAnswerFilledText}>{formatNumberDigits(tNum * step, language)}</Text>
                        ) : null}
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}

          {/* Paper Content: Coloring Page */}
          {selectedSheet === 'coloring' && (
            <View style={styles.coloringCanvas}>
              <View style={styles.coloringCard}>
                <View style={styles.coloringSvgWrap}>
                  <AppleOutline />
                </View>
                <Text style={styles.coloringLabel}>
                  {language === 'gu' ? 'સફરજન' : language === 'hi' ? 'सेब' : 'Apple'}
                </Text>
                <Text style={styles.coloringDottedChar}>
                  {language === 'gu' ? 'લાલ રંગ પૂરો' : language === 'hi' ? 'लाल रंग भरें' : 'Color with Red'}
                </Text>
              </View>
              <View style={styles.coloringCard}>
                <View style={styles.coloringSvgWrap}>
                  <MangoOutline />
                </View>
                <Text style={styles.coloringLabel}>
                  {language === 'gu' ? 'કેરી' : language === 'hi' ? 'आम' : 'Mango'}
                </Text>
                <Text style={styles.coloringDottedChar}>
                  {language === 'gu' ? 'પીળો રંગ પૂરો' : language === 'hi' ? 'पीला रंग भरें' : 'Color with Yellow'}
                </Text>
              </View>
              <View style={styles.coloringCard}>
                <View style={styles.coloringSvgWrap}>
                  <LionOutline />
                </View>
                <Text style={styles.coloringLabel}>
                  {language === 'gu' ? 'સિંહ' : language === 'hi' ? 'शेर' : 'Lion'}
                </Text>
                <Text style={styles.coloringDottedChar}>
                  {language === 'gu' ? 'કેસરી રંગ પૂરો' : language === 'hi' ? 'केसरिया रंग भरें' : 'Color with Orange'}
                </Text>
              </View>
              <View style={styles.coloringCard}>
                <View style={styles.coloringSvgWrap}>
                  <ElephantOutline />
                </View>
                <Text style={styles.coloringLabel}>
                  {language === 'gu' ? 'હાથી' : language === 'hi' ? 'हाथी' : 'Elephant'}
                </Text>
                <Text style={styles.coloringDottedChar}>
                  {language === 'gu' ? 'રાખોડી રંગ પૂરો' : language === 'hi' ? 'स्लेटी रंग भरें' : 'Color with Gray'}
                </Text>
              </View>
            </View>
          )}

          {/* Paper Footer */}
          <View style={styles.paperFooter}>
            <Text style={styles.footerStar}>
              {language === 'gu'
                ? 'સરસ પ્રયત્ન!'
                : language === 'hi'
                ? 'बहुत अच्छा प्रयास!'
                : 'Great Job! (Good Effort!)'}
            </Text>
            <Text style={styles.footerSignature}>
              {language === 'gu'
                ? 'શિક્ષક / વાલીની સહી: _________________'
                : language === 'hi'
                ? 'शिक्षक / अभिभावक के हस्ताक्षर: _________________'
                : 'Teacher / Parent Signature: _________________'}
            </Text>
          </View>
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>

      <GuestLimitationModal
        visible={showGuestLimitModal}
        limitType="worksheets"
        language={language}
        onClose={() => setShowGuestLimitModal(false)}
      />

      <BottomNav activeTab="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  classInfoBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  classChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  classChipLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  difficultyBadge: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  difficultyBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B45309',
  },
  completionStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16A34A',
  },
  container: {
    padding: spacing.md,
    paddingBottom: 110,
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
  },
  headerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    marginBottom: spacing.md,
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  headerBannerTextCol: {
    flex: 1,
    minWidth: 260,
  },
  headerBannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  headerBannerSub: {
    fontSize: 12,
    color: '#3B82F6',
    marginTop: 2,
  },
  printBtn: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderRadius: radii.full,
  },
  printBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sheetSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sheetTabBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  sheetTabBtnActive: {
    backgroundColor: '#EDE9FE',
    borderColor: '#8B5CF6',
  },
  sheetTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  sheetTabTextActive: {
    color: '#8B5CF6',
    fontWeight: '700',
  },

  /* White A4 Paper Simulation */
  printablePaper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    padding: width < 420 ? 12 : spacing.xl,
    minHeight: 650,
    overflow: 'hidden',
  },
  paperHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 2,
    borderBottomColor: '#0F172A',
    paddingBottom: spacing.sm,
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
    gap: spacing.sm,
    maxWidth: '100%',
  },
  paperTitleCol: {
    flex: 1,
    minWidth: 180,
    maxWidth: '100%',
    paddingRight: 6,
  },
  paperBrand: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  paperTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
    flexWrap: 'wrap',
  },
  studentInfoBox: {
    gap: 4,
  },
  infoLine: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },

  /* Kakko Grid */
  kakkoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  letterBox: {
    width: width > 600 ? '22%' : '47%',
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    gap: 4,
  },
  letterSolid: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
  },
  traceLines: {
    flexDirection: 'row',
    gap: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 4,
    width: '100%',
    justifyContent: 'center',
  },
  letterDotted: {
    fontSize: 24,
    color: '#94A3B8',
    fontWeight: '300',
  },

  /* Numbers Grid */
  numbersGrid: {
    gap: 8,
  },
  numberRowBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    borderRadius: 12,
    padding: 6,
    gap: 12,
  },
  numCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numSolidText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: Platform.OS === 'web' ? '"Baloo 2", "Noto Sans Gujarati", "Noto Sans Devanagari", sans-serif' : undefined,
  },
  numTraceDots: {
    flexDirection: 'row',
    gap: 16,
  },
  numDottedText: {
    fontSize: 20,
    color: '#94A3B8',
    fontWeight: '400',
    fontFamily: Platform.OS === 'web' ? '"Baloo 2", "Noto Sans Gujarati", "Noto Sans Devanagari", sans-serif' : undefined,
  },
  numApplesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    gap: 2,
    flexWrap: 'wrap',
  },
  smallApple: {
    fontSize: 16,
  },
  moreText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },

  /* Ghadiya Mode Toggle Bar */
  ghadiyaModeToggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
    alignSelf: 'flex-start',
    flexWrap: 'wrap',
  },
  ghadiyaModeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.full,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  ghadiyaModeBtnActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#7C3AED',
  },
  ghadiyaModeBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
  },
  ghadiyaModeBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  worksheetInstructionBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  worksheetInstructionText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#334155',
  },

  /* Ghadiya Table Grid */
  ghadiyaTableGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  ghadiyaColBox: {
    width: width > 760 ? '18.6%' : width > 480 ? '31.2%' : '48%',
    borderWidth: 1.5,
    borderColor: '#0F172A',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    marginBottom: 6,
    backgroundColor: '#FFFFFF',
  },
  ghadiyaColHeader: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    borderBottomWidth: 1.5,
    borderBottomColor: '#0F172A',
    paddingBottom: 4,
    marginBottom: 6,
    width: '100%',
    textAlign: 'center',
  },
  ghadiyaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    width: '100%',
  },
  ghadiyaFormulaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'right',
  },
  ghadiyaAnswerBox: {
    width: 28,
    height: 19,
    borderWidth: 1.2,
    borderColor: '#0F172A',
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginLeft: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghadiyaAnswerBoxBlank: {
    backgroundColor: '#FFFFFF',
    borderColor: '#0F172A',
  },
  ghadiyaAnswerFilledText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  ghadiyaLineText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginVertical: 1.5,
  },

  /* Coloring Canvas */
  coloringCanvas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'space-between',
  },
  coloringCard: {
    width: width > 600 ? '48%' : '100%',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  coloringBigEmoji: {
    fontSize: 54,
  },
  coloringSvgWrap: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  coloringLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  coloringDottedChar: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '700',
  },

  /* Paper Footer */
  paperFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1.5,
    borderTopColor: '#0F172A',
    marginTop: spacing.xl,
    paddingTop: spacing.md,
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  footerStar: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D97706',
  },
  footerSignature: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
});
