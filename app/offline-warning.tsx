import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useApp } from '../src/context/AppContext';
import { ClayButton } from '../src/components/clay/ClayButton';
import { GuestNameModal } from '../src/components/common/GuestNameModal';
import { GlobeIcon, WarningIcon } from '../src/components/fun';
import { kidPalette, kidTones, claySurface } from '../src/theme/kidTheme';
import { soundEffects } from '../src/services/soundEffects';
import { checkInternetAvailable } from '../src/utils/networkCheck';
import { AgeGroup } from '../src/types';

export default function OfflineWarningScreen() {
  const router = useRouter();
  const { language, setLanguage, continueAsGuest, isGuest } = useApp();

  const [checkingNet, setCheckingNet] = useState(false);
  const [stillOfflineMsg, setStillOfflineMsg] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);

  const cycleLanguage = () => {
    soundEffects.playBubblePop();
    const next = language === 'gu' ? 'en' : language === 'en' ? 'hi' : 'gu';
    setLanguage(next);
  };

  const handleEnterOfflineMode = async () => {
    soundEffects.playBubblePop();
    if (isGuest) {
      router.replace('/home');
      return;
    }
    setShowGuestModal(true);
  };

  const handleConfirmGuest = async (childName: string, selectedAge: AgeGroup, avatar: string) => {
    setShowGuestModal(false);
    await continueAsGuest(childName, selectedAge, avatar);
    router.replace('/home');
  };

  const handleRetryInternet = async () => {
    soundEffects.playBubblePop();
    setCheckingNet(true);
    setStillOfflineMsg(false);
    const online = await checkInternetAvailable(3500);
    setCheckingNet(false);
    if (online) {
      router.replace('/login');
    } else {
      setStillOfflineMsg(true);
    }
  };

  const points =
    language === 'gu'
      ? [
          {
            icon: '✨',
            bg: '#DCFCE7',
            title: 'બધા 3D ચિત્રો, અવાજ અને વાર્તાઓ ચાલશે',
            desc: 'ડાઉનલોડ કરેલા બધા નવા 3D પાઠ, પ્રાણીઓના અવાજ, વાર્તાઓ અને કવિતાઓ ઇન્ટરનેટ વગર ચાલશે.',
          },
          {
            icon: '🎮',
            bg: '#FEF3C7',
            title: 'રોજની 5 ગેમ્સની મર્યાદા',
            desc: 'Offline Mode માં બાળક દરરોજ વધુમાં વધુ 5 ગેમ્સ રમી શકશે.',
          },
          {
            icon: '☁️',
            bg: '#FEE2E2',
            title: 'Cloud Sync અને બેકઅપ બંધ રહેશે',
            desc: 'તમારા સ્ટાર્સ, સિક્કા અને પ્રોગ્રેસ ફક્ત આ ફોનમાં જ સેવ થશે; બીજા ડિવાઇસમાં સિંક નહીં થાય.',
          },
          {
            icon: '👨‍👩‍👧',
            bg: '#EDE9FE',
            title: 'Parent Login અને નવા અપડેટ્સ નહીં મળે',
            desc: 'એકાઉન્ટ લોગિન અને નવા પાઠ/કવિતાઓ મેળવવા માટે ઇન્ટરનેટ ચાલુ કરવું પડશે.',
          },
        ]
      : language === 'hi'
      ? [
          {
            icon: '✨',
            bg: '#DCFCE7',
            title: 'सभी 3D चित्र, आवाज़ें और कहानियाँ चलेंगी',
            desc: 'डाउनलोड किए गए सभी नए 3D पाठ, जानवरों की आवाज़ें, कहानियाँ और कविताएँ बिना इंटरनेट के चलेंगी।',
          },
          {
            icon: '🎮',
            bg: '#FEF3C7',
            title: 'रोज़ाना 5 गेम्स की सीमा',
            desc: 'Offline Mode में बच्चा प्रतिदिन अधिकतम 5 गेम्स ही खेल सकेगा।',
          },
          {
            icon: '☁️',
            bg: '#FEE2E2',
            title: 'Cloud Sync और बैकअप बंद रहेगा',
            desc: 'स्टार्स, सिक्के और प्रगति केवल इसी फ़ोन में सेव होंगे; दूसरे डिवाइस पर सिंक नहीं होंगे।',
          },
          {
            icon: '👨‍👩‍👧',
            bg: '#EDE9FE',
            title: 'Parent Login और नए अपडेट नहीं मिलेंगे',
            desc: 'अकाउंट लॉगिन और नए पाठ पाने के लिए इंटरनेट चालू करना होगा।',
          },
        ]
      : [
          {
            icon: '✨',
            bg: '#DCFCE7',
            title: 'All 3D Pictures, Sounds & Stories Work!',
            desc: 'Every downloaded 3D lesson, animal sound, story & rhyme works smoothly without internet.',
          },
          {
            icon: '🎮',
            bg: '#FEF3C7',
            title: 'Daily Limit: 5 Games per Day',
            desc: 'In Offline Mode, kids can play up to 5 educational games per day.',
          },
          {
            icon: '☁️',
            bg: '#FEE2E2',
            title: 'Cloud Sync & Backup Paused',
            desc: 'Stars, coins & progress are saved only on this device and will not sync across devices.',
          },
          {
            icon: '👨‍👩‍👧',
            bg: '#EDE9FE',
            title: 'Parent Login & Updates Unavailable',
            desc: 'Connect to the internet anytime to sign in to your parent account or get new lessons.',
          },
        ];

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="offlineBgGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor={kidPalette.tintSun} stopOpacity="1" />
              <Stop offset="45%" stopColor="#FFFDF7" stopOpacity="1" />
              <Stop offset="100%" stopColor={kidPalette.tintSky} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#offlineBgGrad)" />
        </Svg>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View style={styles.offlineBadge}>
            <WarningIcon size={16} color="#B45309" />
            <Text style={styles.offlineBadgeText}>
              {language === 'gu'
                ? 'ઇન્ટરનેટ બંધ છે'
                : language === 'hi'
                ? 'इंटरनेट बंद है'
                : 'No Internet'}
            </Text>
          </View>

          <TouchableOpacity style={styles.langPill} onPress={cycleLanguage} activeOpacity={0.8}>
            <GlobeIcon size={16} color={kidTones.sky.edge} />
            <Text style={styles.langPillText}>
              {language === 'gu' ? 'ગુજરાતી' : language === 'hi' ? 'हिन्दी' : 'English'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, claySurface('#FFFFFF', '#FDE68A')]}>
          <Image source={require('../assets/icon.png')} style={styles.logo} resizeMode="contain" />

          <Text style={styles.title}>
            {language === 'gu'
              ? 'Offline Mode ચેતવણી'
              : language === 'hi'
              ? 'Offline Mode चेतावनी'
              : 'Offline Mode Notice'}
          </Text>

          <Text style={styles.subtitle}>
            {language === 'gu'
              ? 'તમે ઇન્ટરનેટ વગર આગળ વધી રહ્યા છો. Offline Mode માં નીચે મુજબની મર્યાદાઓ રહેશે:'
              : language === 'hi'
              ? 'आप बिना इंटरनेट के आगे बढ़ रहे हैं। Offline Mode में नीचे दी गई सीमाएँ रहेंगी:'
              : 'You are continuing without internet. Here is what to know about Offline Mode:'}
          </Text>

          <View style={styles.pointsList}>
            {points.map((pt, idx) => (
              <View key={idx} style={styles.pointRow}>
                <View style={[styles.pointIconWrap, { backgroundColor: pt.bg }]}>
                  <Text style={styles.pointIcon}>{pt.icon}</Text>
                </View>
                <View style={styles.pointTextCol}>
                  <Text style={styles.pointTitle}>{pt.title}</Text>
                  <Text style={styles.pointDesc}>{pt.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {stillOfflineMsg && (
            <Text style={styles.stillOfflineText}>
              {language === 'gu'
                ? 'હજુ પણ ઇન્ટરનેટ મળતું નથી — કૃપા કરીને Wi-Fi/Data ચેક કરો.'
                : language === 'hi'
                ? 'अभी भी इंटरनेट नहीं मिला — कृपया Wi-Fi/Data जाँचें।'
                : 'Still offline — please check your Wi-Fi or mobile data.'}
            </Text>
          )}

          <ClayButton
            tone="sun"
            size="md"
            style={styles.primaryBtn}
            onPress={handleEnterOfflineMode}
            title={
              language === 'gu'
                ? 'Offline Mode માં શરૂ કરો'
                : language === 'hi'
                ? 'Offline Mode में शुरू करें'
                : 'Offline Mode'
            }
          />

          <ClayButton
            tone="white"
            size="sm"
            style={styles.secondaryBtn}
            onPress={handleRetryInternet}
            title={
              checkingNet
                ? language === 'gu'
                  ? 'તપાસી રહ્યા છીએ...'
                  : 'Checking...'
                : language === 'gu'
                ? 'ઇન્ટરનેટ ચાલુ છે? Login પર જાઓ →'
                : language === 'hi'
                ? 'इंटरनेट चालू है? Login पर जाएँ →'
                : 'Back Online? Go to Login →'
            }
          />
        </View>
      </ScrollView>

      <GuestNameModal
        visible={showGuestModal}
        language={language}
        onConfirm={handleConfirmGuest}
        onCancel={() => setShowGuestModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: kidPalette.tintSun,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FCD34D',
  },
  offlineBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B45309',
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
  },
  langPillText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0284C7',
  },
  card: {
    width: '100%',
    borderRadius: 28,
    padding: 20,
    alignItems: 'center',
  },
  logo: {
    width: 78,
    height: 78,
    borderRadius: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 16,
  },
  pointsList: {
    width: '100%',
    gap: 10,
    marginBottom: 16,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pointIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointIcon: {
    fontSize: 18,
  },
  pointTextCol: {
    flex: 1,
  },
  pointTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  pointDesc: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#64748B',
    fontWeight: '500',
  },
  stillOfflineText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  primaryBtn: {
    width: '100%',
    marginBottom: 10,
  },
  secondaryBtn: {
    width: '100%',
  },
});

