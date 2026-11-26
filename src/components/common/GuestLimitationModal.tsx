import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AppLanguage } from '../../types';
import { soundEffects } from '../../services/soundEffects';
import * as Art from '../art3d/Art3D';
import { ClayBadgeToken } from '../SubjectBadgeIcons';
import { webStyle } from '../../utils/webStyle';

/** Feature-lock icons (kept as emoji ids in data) rendered as 3D vector art. */
const LOCK_ART: Record<string, React.FC<{ size?: number }>> = {
  '🎮': Art.GamepadArt,
  '⚔️': Art.BoxingGlovesArt,
  '🎓': Art.MedalArt,
  '📝': Art.ScrollArt,
  '☁️': Art.CloudArt,
  '👨‍👩‍👧': Art.HeartArt,
};

export type GuestLimitType =
  | 'games'
  | 'cloud'
  | 'certificate'
  | 'worksheets'
  | 'duel'
  | 'profiles';

export interface GuestLimitationModalProps {
  visible: boolean;
  limitType?: GuestLimitType;
  language: AppLanguage;
  customTitle?: string;
  customDescription?: string;
  onClose: () => void;
  onAction?: () => void;
}

export function GuestLimitationModal({
  visible,
  limitType = 'games',
  language,
  customTitle,
  customDescription,
  onClose,
  onAction,
}: GuestLimitationModalProps) {
  const router = useRouter();

  if (!visible) return null;

  const getDetails = () => {
    switch (limitType) {
      case 'games':
        return {
          icon: '🎮',
          badgeText: language === 'gu' ? 'દૈનિક રમત મર્યાદા (૫/૫)' : language === 'hi' ? 'दैनिक खेल सीमा (५/५)' : 'Daily Play Limit (5/5)',
          title: customTitle || (language === 'gu' ? 'આજની ૫ રમતો પૂર્ણ થઈ!' : language === 'hi' ? 'आज के ५ खेल पूरे हुए!' : "Today's 5 Free Games Finished!"),
          desc:
            customDescription ||
            (language === 'gu'
              ? 'બાળકના સંતુલિત સ્ક્રીન ટાઈમ માટે ગેસ્ટ મોડમાં રોજ ૫ રમતોની મર્યાદા છે. અમર્યાદિત રમતો અને લેવલ્સ રમવા માટે મફત પેરન્ટ એકાઉન્ટ બનાવો.'
              : language === 'hi'
              ? 'बच्चों के संतुलित स्क्रीन समय के लिए गेस्ट मोड में प्रतिदिन ५ खेलों की सीमा है। असीमित खेल खेलने के लिए फ्री पैरेंट अकाउंट बनाएं।'
              : 'Guest mode includes 5 free games per day to maintain healthy screen time. Create a free parent account to unlock unlimited play.'),
        };
      case 'duel':
        return {
          icon: '⚔️',
          badgeText: language === 'gu' ? '૨-પ્લેયર ક્વિઝ ડ્યુઅલ' : language === 'hi' ? '२-प्लेयर क्विज़ मुकाबला' : '2-Player Quiz Duel',
          title: customTitle || (language === 'gu' ? 'પરિવાર સાથે ૨-પ્લેયર સ્પર્ધા!' : language === 'hi' ? 'परिवार के साथ मुकाबला!' : '2-Player Head-to-Head Duel!'),
          desc:
            customDescription ||
            (language === 'gu'
              ? 'મમ્મી-પપ્પા કે ભાઈ-બહેન સાથે સ્પ્લિટ-સ્ક્રીન ક્વિઝ રમવા અને સ્કોર સાચવવા માટે ફ્રી એકાઉન્ટ બનાવો.'
              : language === 'hi'
              ? 'माता-पिता या भाई-बहन के साथ क्विज़ मुकाबला खेलने और स्कोर सेव करने के लिए फ्री अकाउंट बनाएं।'
              : 'Create a free parent account to challenge family members in real-time split-screen quiz duel and save trophies.'),
        };
      case 'certificate':
        return {
          icon: '🎓',
          badgeText: language === 'gu' ? 'સત્તાવાર ગોલ્ડ સર્ટિફિકેટ' : language === 'hi' ? 'आधिकारिक गोल्ड सर्टिफिकेट' : 'Official Gold Certificate',
          title: customTitle || (language === 'gu' ? 'સર્ટિફિકેટ પ્રિન્ટ અને ડાઉનલોડ' : language === 'hi' ? 'सर्टिफिकेट प्रिंट और डाउनलोड' : 'Download Verified Certificate'),
          desc:
            customDescription ||
            (language === 'gu'
              ? 'બાળકના સાચા નામ સાથેનું સત્તાવાર પૂર્ણતા પ્રમાણપત્ર ડાઉનલોડ કરવા અને સાચવવા માટે ફ્રી પેરન્ટ એકાઉન્ટ જરૂરી છે.'
              : language === 'hi'
              ? 'बच्चे के नाम के साथ आधिकारिक प्रमाण पत्र डाउनलोड और प्रिंट करने के लिए फ्री पैरेंट अकाउंट आवश्यक है।'
              : "Download and print your child's official gold achievement award certificate by signing up for a free parent account."),
        };
      case 'worksheets':
        return {
          icon: '📝',
          badgeText: language === 'gu' ? 'પ્રિન્ટેબલ A4 વર્કશીટ્સ' : language === 'hi' ? 'प्रिंट करने योग्य A4 वर्कशीट्स' : 'Printable A4 Worksheets',
          title: customTitle || (language === 'gu' ? 'વર્કશીટ PDF ડાઉનલોડ અનલોક' : language === 'hi' ? 'वर्कशीट PDF डाउनलोड अनलॉक' : 'Unlock Printable Worksheets'),
          desc:
            customDescription ||
            (language === 'gu'
              ? 'ઘરે પેન્સિલથી કક્કો, બારાખડી અને અંકોના લેખન મહાવરા માટે પ્રિન્ટેબલ A4 વર્કશીટ્સ મેળવવા ફ્રી સાઇન-અપ કરો.'
              : language === 'hi'
              ? 'घर पर पेंसिल से वर्णमाला और गिनती अभ्यास के लिए प्रिंटेबल वर्कशीट्स डाउनलोड करने हेतु फ्री साइन-अप करें।'
              : 'Download unlimited colorful A4 tracing worksheets for pencil handwriting practice with a free account.'),
        };
      case 'cloud':
        return {
          icon: '☁️',
          badgeText: language === 'gu' ? 'ક્લાઉડ બેકઅપ ચેતવણી' : language === 'hi' ? 'क्लाउड बैकअप चेतावनी' : 'Cloud Backup Warning',
          title: customTitle || (language === 'gu' ? 'બાળકની પ્રગતિ સુરક્ષિત કરો!' : language === 'hi' ? 'बच्चे की प्रगति सुरक्षित करें!' : 'Protect Your Progress!'),
          desc:
            customDescription ||
            (language === 'gu'
              ? 'ગેસ્ટ મોડમાં ડેટા માત્ર આ ફોનમાં રહે છે. ફોન બદલાય કે એપ અનઇન્સ્ટોલ થાય તો સ્ટાર્સ અને કોઈન્સ ગુમાવવાનો ડર રહે છે. હમણાં જ બેકઅપ લો.'
              : language === 'hi'
              ? 'गेस्ट मोड में डेटा केवल इसी फोन में रहता है। फोन बदलने या ऐप हटाने पर स्टार्स खोने का डर रहता है। अभी बैकअप लें।'
              : 'Guest progress is only stored locally. Protect stars, coins, and learning data across all devices by signing up free.'),
        };
      case 'profiles':
      default:
        return {
          icon: '👨‍👩‍👧',
          badgeText: language === 'gu' ? 'મલ્ટીપલ ચાઇલ્ડ પ્રોફાઇલ' : language === 'hi' ? 'मल्टीपल चाइल्ड प्रोफाइल' : 'Multiple Profiles',
          title: customTitle || (language === 'gu' ? 'વધુ બાળકો ઉમેરો' : language === 'hi' ? 'अधिक बच्चे जोड़ें' : 'Add More Children'),
          desc:
            customDescription ||
            (language === 'gu'
              ? 'ગેસ્ટ મોડમાં માત્ર ૧ બાળકની પ્રોફાઇલ માન્ય છે. ઘરના અન્ય બાળકોની અલગ પ્રગતિ રાખવા માટે ફ્રી એકાઉન્ટ બનાવો.'
              : language === 'hi'
              ? 'गेस्ट मोड में केवल १ बच्चे की प्रोफाइल मान्य है। घर के अन्य बच्चों के लिए फ्री अकाउंट बनाएं।'
              : 'Guest mode supports 1 child profile. Create a free parent account to manage multiple kids with separate progress.'),
        };
    }
  };

  const details = getDetails();

  const handleRegister = () => {
    soundEffects.playBubblePop();
    onClose();
    if (onAction) {
      onAction();
    } else {
      router.push('/register');
    }
  };

  const handleCancel = () => {
    soundEffects.playBubblePop();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Top Emoji Mascot Bubble */}
          <View style={styles.emojiBubble}>
            {React.createElement(LOCK_ART[details.icon] ?? Art.StarArt, { size: 58 })}
          </View>

          {/* Badge */}
          <View style={styles.badgePill}>
            <Text style={styles.badgePillText}>{details.badgeText}</Text>
          </View>

          {/* Title */}
          <Text style={styles.titleText}>{details.title}</Text>

          {/* Description */}
          <Text style={styles.descText}>{details.desc}</Text>

          {/* Feature Highlights List */}
          <View style={styles.benefitBox}>
            <View style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <ClayBadgeToken art={Art.StarArt} tone="gold" size={26} />
              </View>
              <Text style={styles.benefitLabel}>
                {language === 'gu'
                  ? '૧૦૦% મફત પેરન્ટ એકાઉન્ટ (કોઈ ચાર્જ નથી)'
                  : language === 'hi'
                  ? '१००% फ्री पैरेंट अकाउंट (कोई शुल्क नहीं)'
                  : '100% Free Parent Account (No Charges)'}
              </Text>
            </View>
            <View style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <ClayBadgeToken art={Art.CloudArt} tone="sky" size={26} />
              </View>
              <Text style={styles.benefitLabel}>
                {language === 'gu'
                  ? 'ક્લાઉડ સેવ: સ્ટાર્સ અને કોઈન્સ ક્યારેય ભૂંસાશે નહીં'
                  : language === 'hi'
                  ? 'क्लाउड सेव: स्टार्स और कॉइन्स हमेशा सुरक्षित'
                  : 'Cloud Save: Stars and coins permanently backed up'}
              </Text>
            </View>
            <View style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <ClayBadgeToken art={Art.GamepadArt} tone="lavender" size={26} />
              </View>
              <Text style={styles.benefitLabel}>
                {language === 'gu'
                  ? 'અમર્યાદિત રમતો અને સ્પ્લિટ-સ્ક્રીન ક્વિઝ'
                  : language === 'hi'
                  ? 'असीमित खेल और २-प्लेयर मुकाबला'
                  : 'Unlimited games and 2-player quiz duel'}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleRegister}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryBtnText}>
              {language === 'gu'
                ? 'મફત એકાઉન્ટ બનાવો'
                : language === 'hi'
                ? 'फ्री अकाउंट बनाएं'
                : 'Create Free Account'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={handleCancel}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryBtnText}>
              {language === 'gu' ? 'પછી કરીશું / રદ કરો' : language === 'hi' ? 'बाद में करेंगे / रद्द' : 'Maybe Later / Close'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingTop: 36,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    ...(webStyle({
      boxShadow: '0 20px 48px rgba(0, 0, 0, 0.22), 0 4px 12px rgba(0, 0, 0, 0.08)',
    })),
    elevation: 12,
  },
  emojiBubble: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    borderWidth: 3,
    borderColor: '#C7D2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  badgePill: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  badgePillText: {
    color: '#B45309',
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  titleText: {
    fontSize: 21,
    fontWeight: '900',
    color: '#1E1B4B',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 28,
  },
  descText: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 16,
  },
  benefitBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 20,
    gap: 8,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitIcon: {
    marginRight: 8,
  },
  benefitLabel: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    flex: 1,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: '#6C5CE7',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    ...(webStyle({
      boxShadow: '0 6px 18px rgba(108, 92, 231, 0.4)',
      cursor: 'pointer',
    })),
    elevation: 4,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  secondaryBtnText: {
    color: '#64748B',
    fontSize: 13.5,
    fontWeight: '600',
  },
});
