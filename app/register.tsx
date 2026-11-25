import {
  AuthUserIcon,
  AuthMailIcon,
  AuthLockIcon,
  AuthEyeOpenIcon,
  AuthEyeClosedIcon,
  AuthStarIcon,
  AuthBadgeSparkleIcon,
} from '../src/components/AuthIcons';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle, Path } from 'react-native-svg';
import { useApp } from '../src/context/AppContext';
import { PurpleGradientButton } from '../src/components/PurpleGradientButton';
import { soundEffects } from '../src/services/soundEffects';
import { AgeGroup } from '../src/types';
import { GuestNameModal } from '../src/components/common/GuestNameModal';
import { localizeAuthError } from '../src/utils/authErrorTranslators';
import { Glyph } from '../src/components/fun/KidIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AGE_GROUP_OPTIONS: { id: AgeGroup; labelEn: string; labelGu: string; labelHi: string; icon: string }[] = [
  { id: '2-4', labelEn: 'Pre-School (2–4 yrs)', labelGu: 'પ્રી-સ્કૂલ (૨-૪ વર્ષ)', labelHi: 'प्री-स्कूल (२-४ वर्ष)', icon: '🎒' },
  { id: '4-6', labelEn: 'Class 1–2 (4–6 yrs)', labelGu: 'વર્ગ ૧-૨ (૪-૬ વર્ષ)', labelHi: 'कक्षा १-२ (४-६ वर्ष)', icon: '📘' },
  { id: '6-8', labelEn: 'Class 3–5 (6–8 yrs)', labelGu: 'વર્ગ ૩-૫ (૬-૮ વર્ષ)', labelHi: 'कक्षा ३-५ (६-८ वर्ष)', icon: '🏆' },
];

export default function RegisterScreen() {
  const router = useRouter();
  const {
    registerUser,
    language,
    setLanguage,
    t,
    continueAsGuest,
    isAuthenticated,
    currentUser,
    logoutUser,
    isLoading: isAppLoading,
    ageGroup,
    progress,
  } = useApp();

  useEffect(() => {
    if (!isAppLoading && isAuthenticated) {
      router.replace('/home');
    }
  }, [isAppLoading, isAuthenticated, router]);

  const [parentName, setParentName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [childNickname, setChildNickname] = useState(() => {
    if (progress?.childName && progress.childName !== 'Little Star' && progress.childName !== 'Little Learner') {
      return progress.childName;
    }
    return 'Little Star';
  });
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup>(() => {
    if (ageGroup === '2-4' || ageGroup === '4-6' || ageGroup === '6-8') {
      return ageGroup;
    }
    return '2-4';
  });

  useEffect(() => {
    if (ageGroup === '2-4' || ageGroup === '4-6' || ageGroup === '6-8') {
      setSelectedAgeGroup(ageGroup);
    } else {
      setSelectedAgeGroup('2-4');
    }
  }, [ageGroup]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showGuestModal, setShowGuestModal] = useState(false);

  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cycleLanguage = () => {
    soundEffects.playBubblePop();
    const next = language === 'gu' ? 'en' : language === 'en' ? 'hi' : 'gu';
    setLanguage(next);
  };

  const handleBack = () => {
    soundEffects.playBubblePop();
    try {
      if (router.canGoBack()) {
        router.back();
        return;
      }
    } catch {}
    router.replace(isAuthenticated ? '/profile' : '/login');
  };

  const handleRegister = async () => {
    soundEffects.playBubblePop();
    setErrorMessage('');

    const cleanUser = username.trim();
    if (!cleanUser || cleanUser.length < 3) {
      setErrorMessage(
        language === 'gu'
          ? 'યુઝરનેમ ઓછામાં ઓછા ૩ અક્ષરોનું હોવું જોઈએ.'
          : language === 'hi'
          ? 'उपयोगकर्ता नाम कम से कम ३ अक्षरों का होना चाहिए।'
          : 'Username must be at least 3 characters long.'
      );
      soundEffects.playWrongSound();
      return;
    }

    if (email.trim() && !email.includes('@')) {
      setErrorMessage(
        language === 'gu'
          ? 'કૃપા કરીને માન્ય ઈમેલ સરનામું દાખલ કરો.'
          : language === 'hi'
          ? 'कृपया एक मान्य ईमेल पता दर्ज करें।'
          : 'Please enter a valid email address.'
      );
      soundEffects.playWrongSound();
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage(
        language === 'gu'
          ? 'પાસવર્ડ ઓછામાં ઓછા ૬ અક્ષરોનો હોવો જોઈએ.'
          : language === 'hi'
          ? 'पासवर्ड कम से कम ६ अक्षरों का होना चाहिए।'
          : 'Password must be at least 6 characters long.'
      );
      soundEffects.playWrongSound();
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(
        language === 'gu'
          ? 'પાસવર્ડ અને કન્ફર્મ પાસવર્ડ મેળ ખાતા નથી.'
          : language === 'hi'
          ? 'पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते।'
          : 'Passwords do not match. Please re-enter.'
      );
      soundEffects.playWrongSound();
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerUser({
        username: cleanUser,
        password,
        email: email.trim() || undefined,
        parent_name: parentName.trim() || undefined,
        child_nickname: childNickname.trim() || 'Little Star',
        child_age_group: selectedAgeGroup,
      });

      if (res.success) {
        soundEffects.playTadaaa();
        router.replace('/home');
      } else {
        soundEffects.playWrongSound();
        setErrorMessage(res.error || 'Registration failed. Please try again.');
      }
    } catch {
      soundEffects.playWrongSound();
      setErrorMessage('Unable to connect to the server. Please check your network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    soundEffects.playBubblePop();
    setShowGuestModal(true);
  };

  const handleConfirmGuest = async (childName: string, selectedAge: AgeGroup, avatar: string) => {
    setShowGuestModal(false);
    await continueAsGuest(childName, selectedAge, avatar);
    router.replace('/home');
  };

  if (!isAppLoading && isAuthenticated) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
      {/* Background Pastel Gradient */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="regBgGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#FFF8F0" stopOpacity="1" />
              <Stop offset="30%" stopColor="#EFF6FF" stopOpacity="1" />
              <Stop offset="70%" stopColor="#F5F3FF" stopOpacity="1" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#regBgGrad)" />

          <Circle cx="8%" cy="10%" r="52" fill="#E0E7FF" fillOpacity="0.4" />
          <Circle cx="90%" cy="14%" r="68" fill="#FED7AA" fillOpacity="0.35" />
          <Circle cx="94%" cy="75%" r="60" fill="#DDD6FE" fillOpacity="0.35" />
          <Circle cx="6%" cy="85%" r="48" fill="#BAE6FD" fillOpacity="0.4" />
        </Svg>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Navigation Row */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.75}
              accessibilityLabel="Back"
              accessibilityRole="button"
            >
              <View pointerEvents="none">
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M19 12H5M12 19L5 12L12 5"
                    stroke="#1E1B4B"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.langPill}
              onPress={cycleLanguage}
              activeOpacity={0.8}
              accessibilityLabel="Change Language"
              accessibilityRole="button"
            >
              <Text style={styles.langPillText}>
                {language === 'gu' ? 'ગુજરાતી' : language === 'hi' ? 'हिन्दी' : 'English'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Header Title Section */}
          <Animated.View
            style={[
              styles.headerSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.badgeWrap,
                {
                  transform: [{ translateY: floatAnim }],
                },
              ]}
            >
              <View style={styles.badgeInner}>
                <AuthBadgeSparkleIcon size={38} />
              </View>
            </Animated.View>

            <Text style={styles.title}>{t('auth.registerTitle')}</Text>
            <Text style={styles.subtitle}>{t('auth.registerSubtitle')}</Text>
          </Animated.View>

          {/* Main Registration Form Card */}
          <Animated.View
            style={[
              styles.formCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Error Message Banner */}
            {!!errorMessage && (
              <View style={styles.errorBanner}>
                <Glyph name="warning" size={17} color={'#475569'} strokeWidth={3} />
                <Text style={styles.errorText}>
                  {localizeAuthError(errorMessage, language)}
                </Text>
              </View>
            )}

            {/* Parent Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('auth.parentName')}</Text>
              <View style={styles.inputContainer}>
                <View style={styles.fieldIconWrap}><AuthUserIcon size={20} color="#64748B" /></View>
                <TextInput
                  style={styles.textInput}
                  placeholder={
                    language === 'gu'
                      ? 'દા.ત. રમેશભાઈ પટેલ'
                      : language === 'hi'
                      ? 'उदा. रमेश शर्मा'
                      : 'e.g. Sarah Jenkins'
                  }
                  placeholderTextColor="#94A3B8"
                  value={parentName}
                  onChangeText={setParentName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {t('auth.username')} <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <View style={styles.fieldIconWrap}><AuthUserIcon size={20} color="#64748B" /></View>
                <TextInput
                  style={styles.textInput}
                  placeholder={
                    language === 'gu'
                      ? 'યુઝરનેમ (ઓછામાં ઓછા ૩ અક્ષરો)'
                      : language === 'hi'
                      ? 'उपयोगकर्ता नाम (कम से कम ३ अक्षर)'
                      : 'e.g. sarah_parent'
                  }
                  placeholderTextColor="#94A3B8"
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Email Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('auth.email')}</Text>
              <View style={styles.inputContainer}>
                <View style={styles.fieldIconWrap}><AuthMailIcon size={20} color="#64748B" /></View>
                <TextInput
                  style={styles.textInput}
                  placeholder={
                    language === 'gu'
                      ? 'તમારું ઈમેલ સરનામું'
                      : language === 'hi'
                      ? 'आपका ईमेल पता'
                      : 'sarah@example.com'
                  }
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {t('auth.password')} <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <View style={styles.fieldIconWrap}><AuthLockIcon size={20} color="#64748B" /></View>
                <TextInput
                  style={styles.textInput}
                  placeholder={
                    language === 'gu'
                      ? 'ઓછામાં ઓછા ૬ અક્ષરો'
                      : language === 'hi'
                      ? 'कम से कम ६ अक्षर'
                      : 'At least 6 characters'
                  }
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <AuthEyeOpenIcon size={20} color="#7C3AED" /> : <AuthEyeClosedIcon size={20} color="#94A3B8" />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {t('auth.confirmPassword')} <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <View style={styles.fieldIconWrap}><AuthLockIcon size={20} color="#64748B" /></View>
                <TextInput
                  style={styles.textInput}
                  placeholder={
                    language === 'gu'
                      ? 'પાસવર્ડ ફરી લખો'
                      : language === 'hi'
                      ? 'पासवर्ड पुनः दर्ज करें'
                      : 'Re-enter your password'
                  }
                  placeholderTextColor="#94A3B8"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                  accessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <AuthEyeOpenIcon size={20} color="#7C3AED" /> : <AuthEyeClosedIcon size={20} color="#94A3B8" />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Child Profile Section Card */}
            <View style={styles.childSectionCard}>
              <View style={styles.childSectionHeader}>
                <Text style={styles.childSectionTitle}>
                  {language === 'gu'
                    ? 'બાળકની વિગતો (વૈકલ્પિક)'
                    : language === 'hi'
                    ? 'बच्चे की जानकारी (वैकल्पिक)'
                    : "Child's Details (Optional)"}
                </Text>
                <Text style={styles.childSectionSubtitle}>
                  {language === 'gu'
                    ? 'પ્રથમ પ્રોફાઇલ આપોઆપ બની જશે'
                    : language === 'hi'
                    ? 'पहला प्रोफाइल स्वतः बन जाएगा'
                    : 'Initial profile will be created for you'}
                </Text>
              </View>

              {/* Child Nickname */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('auth.childNickname')}</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.fieldIconWrap}><AuthStarIcon size={20} /></View>
                  <TextInput
                    style={styles.textInput}
                    placeholder={
                      language === 'gu' ? 'દા.ત. આયાન' : language === 'hi' ? 'उदा. आरव' : 'e.g. Leo, Little Star'
                    }
                    placeholderTextColor="#94A3B8"
                    value={childNickname}
                    onChangeText={setChildNickname}
                  />
                </View>
              </View>

              {/* Age Group Selector Chips */}
              <View style={styles.ageSelectorGroup}>
                <Text style={styles.inputLabel}>{t('auth.childAge')}</Text>
                <View style={styles.chipsRow}>
                  {AGE_GROUP_OPTIONS.map((item) => {
                    const isSelected = selectedAgeGroup === item.id;
                    const label =
                      language === 'gu' ? item.labelGu : language === 'hi' ? item.labelHi : item.labelEn;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.chipBtn, isSelected && styles.chipBtnActive]}
                        onPress={() => {
                          soundEffects.playBubblePop();
                          setSelectedAgeGroup(item.id);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.chipIcon}>{item.icon}</Text>
                        <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Submit Button */}
            <View style={styles.btnWrapper}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#7C3AED" />
                  <Text style={styles.loadingText}>{t('auth.registering')}</Text>
                </View>
              ) : (
                <PurpleGradientButton
                  title={t('auth.registerBtn')}
                  onPress={handleRegister}
                  height={56}
                  borderRadius={28}
                  id="reg-btn-grad"
                />
              )}
            </View>

            {/* Login Link */}
            <View style={styles.switchAuthRow}>
              <Text style={styles.switchAuthPrompt}>{t('auth.alreadyHaveAccount')}</Text>
              <TouchableOpacity
                onPress={() => {
                  soundEffects.playBubblePop();
                  router.push('/login');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.switchAuthLink}>{t('auth.loginBtn')}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Continue as Guest Button */}
          <TouchableOpacity
            style={styles.guestButton}
            onPress={handleContinueAsGuest}
            activeOpacity={0.75}
          >
            <Text style={styles.guestButtonText}>
              {language === 'gu'
                ? 'હમણાં માટે મહેમાન તરીકે રમો →'
                : language === 'hi'
                ? 'अभी के लिए अतिथि के रूप में खेलें →'
                : 'Play as Guest for Now →'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <GuestNameModal
        visible={showGuestModal}
        language={language}
        initialAgeGroup={selectedAgeGroup}
        onConfirm={handleConfirmGuest}
        onCancel={() => setShowGuestModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 40,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#334155',
  },
  langPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  langPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6D28D9',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  badgeWrap: {
    marginBottom: 10,
  },
  badgeInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#EDE9FE',
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  badgeIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#242065',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 5,
    marginBottom: 20,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 18,
    gap: 8,
  },
  errorIcon: {
    fontSize: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginLeft: 2,
  },
  requiredAsterisk: {
    color: '#EF4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingLeft: 14,
    paddingRight: 8,
    height: 52,
    overflow: 'hidden',
  },
  fieldIconWrap: {
    marginRight: 10,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldIcon: {
    fontSize: 17,
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    paddingVertical: 0,
    height: '100%',
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
        } as any)
      : {}),
  },
  eyeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  eyeIcon: {
    fontSize: 18,
  },
  childSectionCard: {
    backgroundColor: '#FAF5FF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    marginVertical: 12,
  },
  childSectionHeader: {
    marginBottom: 14,
  },
  childSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#581C87',
    marginBottom: 2,
  },
  childSectionSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7E22CE',
  },
  ageSelectorGroup: {
    marginTop: 4,
  },
  chipsRow: {
    gap: 8,
  },
  chipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  chipBtnActive: {
    backgroundColor: '#F3E8FF',
    borderColor: '#7C3AED',
  },
  chipIcon: {
    fontSize: 18,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextActive: {
    color: '#6D28D9',
    fontWeight: '700',
  },
  btnWrapper: {
    marginTop: 14,
    marginBottom: 16,
  },
  loadingContainer: {
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F3FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6D28D9',
  },
  switchAuthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  switchAuthPrompt: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  switchAuthLink: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6D28D9',
    textDecorationLine: 'underline',
  },
  guestButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.7)',
  },
  guestButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },  alreadyLoggedInBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  alreadyLoggedInText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
    flex: 1,
  },
  logoutBannerBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginLeft: 8,
  },
  logoutBannerBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

});
