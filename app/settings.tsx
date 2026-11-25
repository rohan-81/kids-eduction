import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { screenWellnessService, ScreenTimeLimitId } from '../src/services/screenWellnessService';
import { ParentGateModal, useKidDialog } from '../src/components/fun';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, radii, shadows } from '../src/theme/spacing';
import { useApp } from '../src/context/AppContext';
import { Header } from '../src/components/Header';
import { BottomNav } from '../src/components/BottomNav';
import { soundEffects } from '../src/services/soundEffects';
import { AppLanguage } from '../src/types';
import * as Art from '../src/components/art3d/Art3D';
import { AppGlobalBackground } from '../src/components/common/AppGlobalBackground';

export default function SettingsScreen() {
  const router = useRouter();
  const {
    language,
    setLanguage,
    soundEnabled,
    toggleSound,
    voiceGender,
    setVoiceGender,
    voiceRate,
    setVoiceRate,
    speak,
    resetProgress,
    resetAll,
    currentUser,
    isAuthenticated,
    session,
    logoutUser,
  } = useApp();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // Wellness controls are persisted through screenWellnessService (they were local-only state
  // before, so changing them had no effect). Loosening them is a parent decision -> math gate.
  const [eyeCare, setEyeCare] = useState(true);
  const [screenLimit, setScreenLimit] = useState<ScreenTimeLimitId>('unlimited');
  const [pendingChange, setPendingChange] = useState<
    { kind: 'limit'; id: ScreenTimeLimitId } | { kind: 'eye'; value: boolean } | { kind: 'reset' } | null
  >(null);
  const { dialog, confirm } = useKidDialog();

  useEffect(() => {
    screenWellnessService.getScreenTimeLimit().then(setScreenLimit);
    screenWellnessService.getEyeCareEnabled().then(setEyeCare);
  }, []);

  const applyPendingChange = async () => {
    const change = pendingChange;
    setPendingChange(null);
    if (!change) return;
    if (change.kind === 'limit') {
      await screenWellnessService.setScreenTimeLimit(change.id);
      setScreenLimit(change.id);
    } else if (change.kind === 'eye') {
      await screenWellnessService.setEyeCareEnabled(change.value);
      setEyeCare(change.value);
    } else if (change.kind === 'reset') {
      const title =
        language === 'gu'
          ? 'ડેટા રીસેટ કરો?'
          : language === 'hi'
          ? 'डेटा रीसेट करें?'
          : 'Reset Progress?';

      const msg =
        language === 'gu'
          ? 'શું તમે ખરેખર બધો પ્રગતિ ડેટા અને તારા રીસેટ કરવા માંગો છો? આ પાછું લાવી શકાશે નહીં.'
          : language === 'hi'
          ? 'क्या आप वाकई सभी प्रगति डेटा और सितारे रीसेट करना चाहते हैं? इसे वापस नहीं लाया जा सकता।'
          : 'Are you sure you want to reset all progress, stars, and coins? This cannot be undone.';

      confirm({
        title,
        message: msg,
        emblem: '🗑️',
        destructive: true,
        cancelText: language === 'gu' ? 'રદ કરો' : language === 'hi' ? 'रद्द करें' : 'Cancel',
        confirmText: language === 'gu' ? 'રીસેટ કરો' : language === 'hi' ? 'रीसेट करें' : 'Reset All',
        onConfirm: async () => {
          await resetProgress();
          soundEffects.playLevelUp();
          router.replace('/home');
        },
      });
    }
  };

  const handleEyeCareToggle = (value: boolean) => {
    soundEffects.playBubblePop();
    if (value) {
      // Turning protection ON never needs a grown-up.
      setEyeCare(true);
      screenWellnessService.setEyeCareEnabled(true);
    } else {
      setPendingChange({ kind: 'eye', value: false });
    }
  };

  const languages: { id: AppLanguage; name: string; nativeName: string; flag: string }[] = [
    { id: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
    { id: 'en', name: 'English', nativeName: 'English', flag: '🌍' },
    { id: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  ];

  const screenLimits: { id: ScreenTimeLimitId; label: string }[] = [
    { id: '15m', label: language === 'gu' ? '૧૫ મિનિટ' : language === 'hi' ? '१५ मिनट' : '15 Mins' },
    { id: '30m', label: language === 'gu' ? '૩૦ મિનિટ' : language === 'hi' ? '३० मिनट' : '30 Mins' },
    { id: '45m', label: language === 'gu' ? '૪૫ મિનિટ' : language === 'hi' ? '४५ मिनट' : '45 Mins' },
    { id: '60m', label: language === 'gu' ? '૧ કલાક' : language === 'hi' ? '१ घंटा' : '1 Hour' },
    { id: 'unlimited', label: language === 'gu' ? 'અમર્યાદિત' : language === 'hi' ? 'असीमित' : 'Unlimited' },
  ];

  const speedOptions = [
    { rate: 1.0, label: language === 'gu' ? '૧.૦x (સામાન્ય)' : language === 'hi' ? '१.०x (सामान्य)' : '1.0x (Normal)' },
    { rate: 1.18, label: language === 'gu' ? '૧.૧૮x (ઝડપી)' : language === 'hi' ? '१.१८x (तेज़)' : '1.18x (Brisk)' },
    { rate: 1.30, label: language === 'gu' ? '૧.૩x (ખૂબ ઝડપી)' : language === 'hi' ? '१.३x (सुपर तेज़)' : '1.3x (Fast)' },
  ];



  const handleSelectLanguage = (lang: AppLanguage) => {
    soundEffects.playBubblePop();
    setLanguage(lang);
  };

  const handleResetData = () => {
    soundEffects.playBubblePop();
    setPendingChange({ kind: 'reset' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppGlobalBackground id="settingsBgGrad" />
      <Header
        title={language === 'gu' ? 'સેટિંગ્સ' : language === 'hi' ? 'सेटिंग्स' : 'Settings'}
        showBack={true}
        backHref="/home"
      />

      <ScrollView
        contentContainerStyle={[styles.container, isMobile && styles.containerMobile]}
        showsVerticalScrollIndicator={false}
      >
        {/* Parent Account & Session Card */}
        <View style={[styles.sectionCard, shadows.card]}>
          <View style={styles.sessionHeaderRow}>
            <Text style={styles.sectionTitle}>
              {language === 'gu' ? 'સેશન અને ખાતું' : language === 'hi' ? 'सत्र एवं खाता' : 'Session & Account'}
            </Text>
            <View
              style={[
                styles.sessionBadge,
                isAuthenticated ? styles.sessionBadgeActive : styles.sessionBadgeGuest,
              ]}
            >
              <View
                style={[
                  styles.sessionDot,
                  isAuthenticated ? styles.sessionDotActive : styles.sessionDotGuest,
                ]}
              />
              <Text
                style={[
                  styles.sessionBadgeText,
                  isAuthenticated ? styles.sessionBadgeTextActive : styles.sessionBadgeTextGuest,
                ]}
              >
                {isAuthenticated
                  ? language === 'gu'
                    ? 'સક્રિય સેશન'
                    : language === 'hi'
                    ? 'सक्रिय सत्र'
                    : 'Active Session'
                  : language === 'gu'
                  ? 'અતિથિ સેશન'
                  : language === 'hi'
                  ? 'अतिथि सत्र'
                  : 'Guest Session'}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionDesc}>
            {isAuthenticated
              ? language === 'gu'
                ? `કનેક્ટેડ ખાતું: ${currentUser?.first_name || currentUser?.username} (${currentUser?.email || `@${currentUser?.username}`})`
                : language === 'hi'
                ? `कनेक्टेड खाता: ${currentUser?.first_name || currentUser?.username} (${currentUser?.email || `@${currentUser?.username}`})`
                : `Connected Account: ${currentUser?.first_name || currentUser?.username} (${currentUser?.email || `@${currentUser?.username}`})`
              : language === 'gu'
              ? 'તમારી બધી પ્રગતિ, તારાઓ અને પ્રમાણપત્રો સર્વર પર સાચવવા માટે કાયમી સેશન બનાવો.'
              : language === 'hi'
              ? 'अपनी सभी प्रगति, सितारे और प्रमाणपत्र सर्वर पर सुरक्षित रखने के लिए स्थायी सत्र बनाएं।'
              : 'Sign in to create a permanent session and sync child progress to cloud.'}
          </Text>

          {isAuthenticated ? (
            <View style={styles.sessionMetaBox}>
              <Text style={styles.sessionMetaText}>
                {language === 'gu' ? 'સેશન સ્થિતિ:' : language === 'hi' ? 'सत्र स्थिति:' : 'Session Status:'}{' '}
                <Text style={{ fontWeight: '800', color: '#16A34A' }}>
                  {language === 'gu' ? 'સુરક્ષિત અને સક્રિય' : language === 'hi' ? 'सुरक्षित एवं सक्रिय' : 'Secure & Active'}
                </Text>
              </Text>
              <Text style={styles.sessionMetaSub}>
                {language === 'gu' ? 'ક્લાઉડ સિંક સક્ષમ છે (ઓટો-સેવ)' : language === 'hi' ? 'क्लाउड सिंक सक्रिय है (ऑटो-सेव)' : 'Cloud progress synchronization active'}
              </Text>
            </View>
          ) : (
            <View style={styles.sessionMetaBoxGuest}>
              <Text style={styles.sessionMetaTextGuest}>
                {language === 'gu' ? 'મહેમાન મોડ મર્યાદા:' : language === 'hi' ? 'अतिथि मोड सीमा:' : 'Guest Mode Limitations:'}
              </Text>
              <Text style={styles.sessionMetaSubGuest}>
                • {language === 'gu' ? 'ફક્ત ૧ બાળકની પ્રોફાઇલ ઉપલબ્ધ છે' : language === 'hi' ? 'केवल १ बाल प्रोफाइल समर्थित है' : 'Only 1 local child profile supported'}
              </Text>
              <Text style={styles.sessionMetaSubGuest}>
                • {language === 'gu' ? 'ક્લાઉડ બેકઅપ નિષ્ક્રિય છે (ડેટા આ ફોનમાં રહેશે)' : language === 'hi' ? 'क्लाउड बैकअप निष्क्रिय है (डेटा केवल इस फोन में)' : 'Cloud backup inactive (progress saved on this phone only)'}
              </Text>
              <Text style={styles.sessionMetaSubGuest}>
                • {language === 'gu' ? 'મલ્ટી-ડિવાઇસ સિંક અને પ્રિન્ટેબલ રિપોર્ટ માટે વાલી ખાતું જરૂરી' : language === 'hi' ? 'मल्टी-डिवाइस सिंक और रिपोर्ट के लिए अभिभावक खाता आवश्यक' : 'Multi-device sync & full report card require parent account'}
              </Text>
            </View>
          )}

          {isAuthenticated ? (
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={async () => {
                soundEffects.playBubblePop();
                await logoutUser();
                router.replace('/login');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.logoutBtnText}>
                {language === 'gu' ? 'સેશન સમાપ્ત કરો / લૉગ આઉટ' : language === 'hi' ? 'सत्र समाप्त करें / लॉग आउट' : 'End Session / Log Out'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.authButtonsRow}>
              <TouchableOpacity
                style={styles.signInBtn}
                onPress={() => {
                  soundEffects.playBubblePop();
                  router.push('/login');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.signInBtnText}>
                  {language === 'gu' ? 'લૉગ ઇન' : language === 'hi' ? 'लॉग इन' : 'Sign In'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.createAccountBtn}
                onPress={() => {
                  soundEffects.playBubblePop();
                  router.push('/register');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.createAccountBtnText}>
                  {language === 'gu' ? 'ખાતું બનાવો' : language === 'hi' ? 'खाता बनाएं' : 'Register'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Language Selection */}
        <View style={[styles.sectionCard, shadows.card]}>
          <Text style={styles.sectionTitle}>
            {language === 'gu' ? 'એપની ભાષા' : language === 'hi' ? 'ऐप की भाषा' : 'App Language'}
          </Text>
          <Text style={styles.sectionDesc}>
            {language === 'gu'
              ? 'પાઠ અને અવાજ માટે મનપસંદ ભાષા પસંદ કરો'
              : language === 'hi'
              ? 'पाठ और ऑडियो के लिए अपनी पसंदीदा भाषा चुनें'
              : 'Choose your preferred language for audio and lessons'}
          </Text>

          <View style={styles.langGrid}>
            {languages.map((l) => {
              const isSelected = language === l.id;
              return (
                <TouchableOpacity
                  key={l.id}
                  style={[
                    styles.langBtn,
                    isSelected ? styles.langBtnSelected : styles.langBtnUnselected,
                  ]}
                  onPress={() => handleSelectLanguage(l.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.langFlag}>{l.flag}</Text>
                  <Text
                    style={[
                      styles.langNative,
                      isSelected ? styles.langTextSelected : styles.langTextUnselected,
                    ]}
                  >
                    {l.nativeName}
                  </Text>
                  <Text
                    style={[
                      styles.langEng,
                      isSelected ? styles.langSubSelected : styles.langSubUnselected,
                    ]}
                  >
                    {l.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Audio Controls */}
        <View style={[styles.sectionCard, shadows.card]}>
          <Text style={styles.sectionTitle}>
            {language === 'gu' ? 'ધ્વનિ અને સંગીત' : language === 'hi' ? 'ध्वनि और संगीत' : 'Sound & Audio'}
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingLabel}>
                {language === 'gu' ? 'સાઉન્ડ ઇફેક્ટ્સ' : language === 'hi' ? 'ध्वनि प्रभाव' : 'Sound Effects & Speech'}
              </Text>
              <Text style={styles.settingSub}>
                {language === 'gu' ? 'અક્ષરો અને પ્રશ્નોના અવાજ' : language === 'hi' ? 'अक्षरों और प्रश्नों की आवाज़' : 'Audio pronunciation for letters and words'}
              </Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={toggleSound}
              trackColor={{ false: '#E2E8F0', true: '#DDD6FE' }}
              thumbColor={soundEnabled ? '#7C3AED' : '#94A3B8'}
            />
          </View>

          <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: '#F1F5F9' }]}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingLabel}>
                {language === 'gu' ? 'આઇ કેર મોડ (આંખોની સુરક્ષા)' : language === 'hi' ? 'आई केयर मोड (आंखों की सुरक्षा)' : 'Eye Care & Soft Screen'}
              </Text>
              <Text style={styles.settingSub}>
                {language === 'gu' ? 'બાળકોની આંખ પર તાણ ઓછો કરે છે' : language === 'hi' ? 'बच्चों की आंखों की सुरक्षा के लिए' : 'Warm, eye-friendly tones for kids'}
              </Text>
            </View>
            <Switch
              value={eyeCare}
              onValueChange={handleEyeCareToggle}
              trackColor={{ false: '#E2E8F0', true: '#DDD6FE' }}
              thumbColor={eyeCare ? '#7C3AED' : '#94A3B8'}
            />
          </View>

          {/* Teacher / Speaker Voice Selection */}
          <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
            <Text style={styles.settingLabel}>
              {language === 'gu' ? 'શિક્ષક / બોલનારનો અવાજ' : language === 'hi' ? 'शिक्षक / वक्ता की आवाज़' : 'Teacher / Speaker Voice'}
            </Text>
            <Text style={styles.settingSub}>
              {language === 'gu'
                ? 'ગુજરાતી અને અન્ય પાઠો માટે મનપસંદ અવાજ પસંદ કરો'
                : language === 'hi'
                ? 'पाठ और ऑडियो के लिए अपनी पसंदीदा आवाज़ चुनें'
                : 'Select your preferred voice for lesson audio'}
            </Text>

            <View style={styles.voiceRow}>
              {/* Male voice */}
              <TouchableOpacity
                style={[styles.voiceCard, voiceGender === 'male' && styles.voiceCardSelected]}
                onPress={() => {
                  soundEffects.playBubblePop();
                  setVoiceGender('male');
                }}
                activeOpacity={0.8}
              >
                <View style={{ marginBottom: 6 }}><Art.MegaphoneArt size={34} /></View>
                <Text style={[styles.voiceCardTitle, voiceGender === 'male' && styles.voiceCardTextSelected]}>
                  {language === 'gu' ? 'સર નો અવાજ' : language === 'hi' ? 'सर की आवाज़' : 'Sir (Male)'}
                </Text>
                <Text style={styles.voiceCardDesc}>
                  {language === 'gu' ? 'સ્પષ્ટ અને શાંત' : language === 'hi' ? 'स्पष्ट आवाज़' : 'Clear & Deep'}
                </Text>
              </TouchableOpacity>

              {/* Female voice */}
              <TouchableOpacity
                style={[styles.voiceCard, voiceGender === 'female' && styles.voiceCardSelected]}
                onPress={() => {
                  soundEffects.playBubblePop();
                  setVoiceGender('female');
                }}
                activeOpacity={0.8}
              >
                <View style={{ marginBottom: 6 }}><Art.MusicArt size={34} /></View>
                <Text style={[styles.voiceCardTitle, voiceGender === 'female' && styles.voiceCardTextSelected]}>
                  {language === 'gu' ? 'મેડમ નો અવાજ' : language === 'hi' ? 'मैडम की आवाज़' : 'Madam (Female)'}
                </Text>
                <Text style={styles.voiceCardDesc}>
                  {language === 'gu' ? 'મીઠો અવાજ' : language === 'hi' ? 'मधुर आवाज़' : 'Gentle & Sweet'}
                </Text>
              </TouchableOpacity>

              {/* Child voice */}
              <TouchableOpacity
                style={[styles.voiceCard, voiceGender === 'child' && styles.voiceCardSelected]}
                onPress={() => {
                  soundEffects.playBubblePop();
                  setVoiceGender('child');
                }}
                activeOpacity={0.8}
              >
                <View style={{ marginBottom: 6 }}><Art.StarArt size={34} /></View>
                <Text style={[styles.voiceCardTitle, voiceGender === 'child' && styles.voiceCardTextSelected]}>
                  {language === 'gu' ? 'બાળ અવાજ' : language === 'hi' ? 'बाल आवाज़' : 'Child Voice'}
                </Text>
                <Text style={styles.voiceCardDesc}>
                  {language === 'gu' ? 'મજેદાર બાળક' : language === 'hi' ? 'उत्साही आवाज़' : 'Playful Kid'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Voice Speed Selection */}
            <View style={{ marginTop: 4, marginBottom: 16 }}>
              <Text style={[styles.settingLabel, { fontSize: 13, marginBottom: 6 }]}>
                {language === 'gu' ? 'બોલવાની ઝડપ' : language === 'hi' ? 'बोलने की गति' : 'Speech Speed'}
              </Text>
              <View style={styles.speedRow}>
                {speedOptions.map((opt) => {
                  const isSelected = Math.abs(voiceRate - opt.rate) < 0.05;
                  return (
                    <TouchableOpacity
                      key={opt.rate}
                      style={[styles.speedBtn, isSelected && styles.speedBtnSelected]}
                      onPress={() => {
                        soundEffects.playBubblePop();
                        setVoiceRate(opt.rate);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.speedBtnText, isSelected && styles.speedBtnTextSelected]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Test Voice Button */}
            <TouchableOpacity
              style={styles.testVoiceBtn}
              onPress={() => {
                const sample =
                  language === 'gu'
                    ? 'નમસ્તે! આ નવો અવાજ છે, કેવો લાગે છે?'
                    : language === 'hi'
                    ? 'नमस्ते! यह नई आवाज़ है, कैसी लगी?'
                    : 'Hello! This is the new voice, how does it sound?';
                speak(sample, language);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.testVoiceBtnText}>
                {language === 'gu' ? 'અવાજ સાંભળી જુઓ' : language === 'hi' ? 'आवाज़ सुनकर देखें' : 'Test Audio'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Screen Time Limit */}
        <View style={[styles.sectionCard, shadows.card]}>
          <Text style={styles.sectionTitle}>
            {language === 'gu' ? 'દૈનિક સ્ક્રીન ટાઈમ' : language === 'hi' ? 'दैनिक स्क्रीन समय' : 'Daily Screen Time Limit'}
          </Text>
          <Text style={styles.sectionDesc}>
            {language === 'gu' ? 'સમય પૂર્ણ થતાં બાળકને બ્રેક લેવાની સલાહ આપવામાં આવશે' : language === 'hi' ? 'समय पूरा होने पर बच्चे को ब्रेक लेने का सुझाव दिया जाएगा' : 'Prompts healthy breaks after daily learning target'}
          </Text>

          <View style={styles.limitsRow}>
            {screenLimits.map((lim) => {
              const active = screenLimit === lim.id;
              return (
                <TouchableOpacity
                  key={lim.id}
                  style={[
                    styles.limitBtn,
                    active ? styles.limitBtnActive : styles.limitBtnInactive,
                  ]}
                  onPress={() => {
                    soundEffects.playBubblePop();
                    if (lim.id !== screenLimit) setPendingChange({ kind: 'limit', id: lim.id });
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.limitText,
                      active ? styles.limitTextActive : styles.limitTextInactive,
                    ]}
                  >
                    {lim.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Reset Progress */}
        <View style={[styles.sectionCard, shadows.card]}>
          <Text style={styles.sectionTitle}>
            {language === 'gu' ? 'ડેટા મેનેજમેન્ટ' : language === 'hi' ? 'डेटा प्रबंधन' : 'Data Management'}
          </Text>
          <Text style={styles.sectionDesc}>
            {language === 'gu' ? 'તમામ પૂર્ણ પાઠ અને સ્કોર ફરીથી શરૂ કરો' : language === 'hi' ? 'सभी पूरे किए गए पाठ और स्कोर रीसेट करें' : 'Reset all completed lessons, scores, and start fresh'}
          </Text>

          <TouchableOpacity
            style={styles.resetBtn}
            onPress={handleResetData}
            activeOpacity={0.8}
          >
            <Text style={styles.resetBtnText}>
              {language === 'gu' ? 'બધો પ્રગતિ ડેટા રીસેટ કરો' : language === 'hi' ? 'प्रगति डेटा रीसेट करें' : 'Reset All Progress'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      <BottomNav activeTab="profile" />

      <ParentGateModal
        visible={pendingChange !== null}
        language={language}
        reason={
          pendingChange?.kind === 'reset'
            ? language === 'gu'
              ? 'પ્રગતિ રીસેટ કરવા માટે કૃપા કરીને આ સવાલનો જવાબ આપો:'
              : language === 'hi'
              ? 'प्रगति रीसेट करने के लिए कृपया इस सवाल का जवाब दें:'
              : 'To reset all progress, please solve this:'
            : language === 'gu'
            ? 'આ સેટિંગ બદલવા માટે આ સવાલનો જવાબ આપો:'
            : language === 'hi'
            ? 'यह सेटिंग बदलने के लिए इस सवाल का जवाब दें:'
            : 'To change this setting, solve this:'
        }
        onSuccess={applyPendingChange}
        onCancel={() => setPendingChange(null)}
      />
      {dialog}
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
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1E1B4B',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  sectionDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 16,
    fontWeight: '500',
  },
  authButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  signInBtn: {
    flex: 1,
    backgroundColor: '#7C3AED',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  createAccountBtn: {
    flex: 1,
    backgroundColor: '#F5F3FF',
    borderWidth: 1.5,
    borderColor: '#7C3AED',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createAccountBtnText: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: '700',
  },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtnText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '800',
  },
  langGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  langBtn: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 2,
  },
  langBtnSelected: {
    backgroundColor: '#F5EEFE',
    borderColor: '#7C3AED',
  },
  langBtnUnselected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  langFlag: {
    fontSize: 22,
    marginBottom: 4,
  },
  langNative: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  langEng: {
    fontSize: 11,
    fontWeight: '600',
  },
  langTextSelected: {
    color: '#7C3AED',
  },
  langTextUnselected: {
    color: '#1E1B4B',
  },
  langSubSelected: {
    color: '#7C3AED',
  },
  langSubUnselected: {
    color: '#64748B',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  settingTextCol: {
    flex: 1,
    paddingRight: 14,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 2,
  },
  settingSub: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 16,
  },
  limitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  limitBtn: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  limitBtnActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  limitBtnInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  limitText: {
    fontSize: 13,
    fontWeight: '800',
  },
  limitTextActive: {
    color: '#FFFFFF',
  },
  limitTextInactive: {
    color: '#475569',
  },
  resetBtn: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FECACA',
  },
  resetBtnText: {
    color: '#DC2626',
    fontSize: 13.5,
    fontWeight: '800',
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sessionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  sessionBadgeActive: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  sessionBadgeGuest: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  sessionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sessionDotActive: {
    backgroundColor: '#16A34A',
  },
  sessionDotGuest: {
    backgroundColor: '#D97706',
  },
  sessionBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  sessionBadgeTextActive: {
    color: '#15803D',
  },
  sessionBadgeTextGuest: {
    color: '#B45309',
  },
  sessionMetaBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  sessionMetaText: {
    fontSize: 12.5,
    color: '#334155',
  },
  sessionMetaSub: {
    fontSize: 11.5,
    color: '#64748B',
  },
  sessionMetaBoxGuest: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    gap: 4,
  },
  sessionMetaTextGuest: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 2,
  },
  sessionMetaSubGuest: {
    fontSize: 11.5,
    color: '#78350F',
    lineHeight: 16,
    fontWeight: '500',
  },
  voiceRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    marginBottom: 12,
  },
  voiceCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  voiceCardSelected: {
    backgroundColor: '#FAF5FF',
    borderColor: '#9333EA',
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  voiceCardIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  voiceCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    textAlign: 'center',
    marginBottom: 2,
  },
  voiceCardTextSelected: {
    color: '#7E22CE',
  },
  voiceCardDesc: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  testVoiceBtn: {
    backgroundColor: '#F3E8FF',
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testVoiceBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7C3AED',
  },
  speedRow: {
    flexDirection: 'row',
    gap: 8,
  },
  speedBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  speedBtnSelected: {
    backgroundColor: '#FAF5FF',
    borderColor: '#9333EA',
  },
  speedBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  speedBtnTextSelected: {
    color: '#7E22CE',
    fontWeight: '800',
  },
});
