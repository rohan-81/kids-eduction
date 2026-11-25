import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/theme/colors';
import { spacing, radii, shadows } from '../src/theme/spacing';
import { useApp } from '../src/context/AppContext';
import { Header } from '../src/components/Header';
import { BottomNav } from '../src/components/BottomNav';
import { soundEffects } from '../src/services/soundEffects';
import { ClayBadgeToken, TokenTone } from '../src/components/SubjectBadgeIcons';
import * as Art from '../src/components/art3d/Art3D';
import { SUBJECT_CARD_ART } from '../src/utils/imageHelper';
import { AppGlobalBackground } from '../src/components/common/AppGlobalBackground';

interface FaqItem {
  q: string;
  a: string;
  art: React.FC<{ size?: number }>;
  tone: TokenTone;
}

export default function HelpScreen() {
  const router = useRouter();
  const { language } = useApp();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const faqs: FaqItem[] = [
    {
      art: Art.BackpackArt,
      tone: 'sky',
      q: language === 'gu' ? 'ક્લાસ કેવી રીતે બદલવો?' : language === 'hi' ? 'कक्षा कैसे बदलें?' : 'How do I change my child’s class?',
      a: language === 'gu' ? 'નીચેના નેવિગેશનમાં "ક્લાસ" પર ટેપ કરો અને પ્રી-સ્કૂલ, ક્લાસ ૧-૨ અથવા ક્લાસ ૩-૫ માંથી પસંદ કરો.' : language === 'hi' ? 'नीचे नेविगेशन में "कक्षाएं" पर टैप करें और प्री-स्कूल, कक्षा १-२ या कक्षा ३-५ में से चुनें।' : 'Tap "Classes" on the bottom bar, then select Pre-School Nursery, Class 1-2, or Class 3-5.',
    },
    {
      art: Art.MegaphoneArt,
      tone: 'mint',
      q: language === 'gu' ? 'પાઠનો અવાજ કેવી રીતે સાંભળવો?' : language === 'hi' ? 'पाठ की आवाज़ कैसे सुनें?' : 'How do I play audio pronunciation?',
      a: language === 'gu' ? 'દરેક પાઠમાં દેખાતા સ્પીકર આઇકોન પર ટેપ કરો. એપ ઉચ્ચાર બોલી સંભળાવશે.' : language === 'hi' ? 'प्रत्येक पाठ में स्पीकर आइकन पर टैप करें। ऐप सही उच्चारण बोलेगा।' : 'Tap the speaker button on any lesson card. The app speaks authentic pronunciations in your chosen language.',
    },
    {
      art: Art.ScrollArt,
      tone: 'gold',
      q: language === 'gu' ? 'વર્કશીટ્સ કેવી રીતે પ્રિન્ટ કરવી?' : language === 'hi' ? 'वर्कशीट्स कैसे प्रिंट करें?' : 'Can I print practice worksheets?',
      a: language === 'gu' ? 'મેનુ અથવા વર્કશીટ્સ વિભાગમાં જઈને "પ્રિન્ટ A4" બટન દબાવો.' : language === 'hi' ? 'मेन्यू से वर्कशीट्स खोलें और "प्रिंट" बटन दबाएं।' : 'Yes! Visit Worksheets from the Menu, and tap "Print A4 Worksheet" to print or save as PDF.',
    },
    {
      art: Art.MedalArt,
      tone: 'lavender',
      q: language === 'gu' ? 'પ્રમાણપત્ર ક્યારે મળે છે?' : language === 'hi' ? 'प्रमाण पत्र कब मिलता है?' : 'When does a child earn certificates?',
      a: language === 'gu' ? 'અભ્યાસક્રમના મુખ્ય પાઠ અને દૈનિક ચેલેન્જ પૂર્ણ કરવાથી સુંદર ગોલ્ડન પ્રમાણપત્રો અનલોક થાય છે.' : language === 'hi' ? 'पाठ और दैनिक चुनौतियां पूरी करने पर पदक और प्रमाण पत्र अनलॉक होते हैं।' : 'Certificates are unlocked as lessons and quizzes are completed. They can be viewed and printed anytime.',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppGlobalBackground id="helpBgGrad" />
      <Header
        title={language === 'gu' ? 'મદદ' : language === 'hi' ? 'सहायता' : 'Help'}
        showBack={true}
        backHref="/home"
      />

      <ScrollView
        contentContainerStyle={[styles.container, isMobile && styles.containerMobile]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, shadows.card]}>
          <View style={styles.heroArt}>
            <ClayBadgeToken art={SUBJECT_CARD_ART.logic} tone="gold" size={64} />
          </View>
          <Text style={styles.heroTitle}>
            {language === 'gu' ? 'અમે તમારી મદદ માટે અહીં છીએ' : language === 'hi' ? 'हम आपकी सहायता के लिए तैयार हैं' : 'Parent & Learner Support'}
          </Text>
          <Text style={styles.heroSub}>
            {language === 'gu' ? 'KidsZone નો શ્રેષ્ઠ ઉપયોગ કરવા માટે નીચેના પ્રશ્નો વાંચો.' : language === 'hi' ? 'KidsZone का सर्वोत्तम उपयोग करने के लिए नीचे दिए गए प्रश्नों को पढ़ें।' : 'Find quick answers on classes, audio, printing, and child progress.'}
          </Text>
        </View>

        <Text style={styles.sectionHeader}>
          {language === 'gu' ? 'સામાન્ય પ્રશ્નોત્તરી' : language === 'hi' ? 'अक्सर पूछे जाने वाले सवाल' : 'Frequently Asked Questions'}
        </Text>

        <View style={styles.faqList}>
          {faqs.map((faq, idx) => (
            <View key={idx} style={[styles.faqCard, shadows.soft]}>
              <View style={styles.faqHeaderRow}>
                <View style={styles.faqIcon}>
                  <ClayBadgeToken art={faq.art} tone={faq.tone} size={34} />
                </View>
                <Text style={styles.faqQuestion}>{faq.q}</Text>
              </View>
              <Text style={styles.faqAnswer}>{faq.a}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      <BottomNav activeTab="profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    maxWidth: 750,
    alignSelf: 'center',
    width: '100%',
  },
  containerMobile: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  heroCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
  },
  heroArt: {
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1D4ED8',
    marginBottom: 4,
    textAlign: 'center',
  },
  heroSub: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  faqList: {
    gap: 12,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  faqHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  faqIcon: {
    marginRight: 10,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  faqAnswer: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    paddingLeft: 44,
  },
});
