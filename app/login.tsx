import {
  AuthUserIcon,
  AuthLockIcon,
  AuthEyeOpenIcon,
  AuthEyeClosedIcon,
  AuthBadgeLockIcon,
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
import { ClayButton } from '../src/components/clay/ClayButton';
import { kidPalette, kidTones, claySurface } from '../src/theme/kidTheme';
import { soundEffects } from '../src/services/soundEffects';
import { GuestNameModal } from '../src/components/common/GuestNameModal';
import { GlobeIcon, UserIcon, LogoutIcon, WarningIcon } from '../src/components/fun';
import { AgeGroup } from '../src/types';
import { localizeAuthError } from '../src/utils/authErrorTranslators';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { login, language, setLanguage, t, continueAsGuest, isAuthenticated, currentUser, logoutUser, isLoading: isAppLoading } = useApp();

  useEffect(() => {
    if (!isAppLoading && isAuthenticated) {
      router.replace('/home');
    }
  }, [isAppLoading, isAuthenticated, router]);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    router.replace('/');
  };

  const handleLogin = async () => {
    soundEffects.playBubblePop();
    setErrorMessage('');

    const trimmedUser = username.trim();
    if (!trimmedUser) {
      setErrorMessage(
        language === 'gu'
          ? 'કૃપા કરીને તમારું યુઝરનેમ અથવા ઈમેલ દાખલ કરો.'
          : language === 'hi'
          ? 'कृपया अपना उपयोगकर्ता नाम या ईमेल दर्ज करें।'
          : 'Please enter your username or email.'
      );
      soundEffects.playWrongSound();
      return;
    }

    if (!password) {
      setErrorMessage(
        language === 'gu'
          ? 'કૃપા કરીને તમારો પાસવર્ડ દાખલ કરો.'
          : language === 'hi'
          ? 'कृपया अपना पासवर्ड दर्ज करें।'
          : 'Please enter your password.'
      );
      soundEffects.playWrongSound();
      return;
    }

    setIsLoading(true);
    try {
      const res = await login({ username: trimmedUser, password });
      if (res.success) {
        soundEffects.playLevelUp();
        router.replace('/home');
      } else {
        soundEffects.playWrongSound();
        setErrorMessage(res.error || 'Invalid username/email or password.');
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
            <LinearGradient id="loginBgGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor={kidPalette.tintSky} stopOpacity="1" />
              <Stop offset="40%" stopColor="#FFFFFF" stopOpacity="1" />
              <Stop offset="75%" stopColor={kidPalette.tintSun} stopOpacity="1" />
              <Stop offset="100%" stopColor={kidPalette.tintMint} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#loginBgGrad)" />

          {/* Playful floating bubbles in the approved palette */}
          <Circle cx="12%" cy="15%" r="48" fill={kidPalette.sky} fillOpacity="0.18" />
          <Circle cx="88%" cy="12%" r="64" fill={kidPalette.sun} fillOpacity="0.2" />
          <Circle cx="92%" cy="80%" r="56" fill={kidPalette.lavender} fillOpacity="0.18" />
          <Circle cx="10%" cy="88%" r="44" fill={kidPalette.mint} fillOpacity="0.2" />
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
                    stroke="#1E293B"
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
              <GlobeIcon size={15} color="#475569" />
              <Text style={styles.langPillText}>
                {language === 'gu' ? 'ગુજરાતી' : language === 'hi' ? 'हिन्दी' : 'English'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Animated Header Badge */}
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
                <AuthBadgeLockIcon size={38} />
              </View>
            </Animated.View>

            <Text style={styles.title}>{t('auth.loginTitle')}</Text>
            <Text style={styles.subtitle}>{t('auth.loginSubtitle')}</Text>
          </Animated.View>

          {/* Card Form */}
          <Animated.View
            style={[
              styles.formCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Already Logged In Notice */}
            {isAuthenticated && (
              <View style={styles.alreadyLoggedInBanner}>
                <UserIcon size={16} color="#15803D" />
                <Text style={[styles.alreadyLoggedInText, { flex: 1, marginLeft: 6 }]}>
                  {currentUser?.username ? `Logged in as: ${currentUser.username}` : 'Logged In'}
                </Text>
                <TouchableOpacity
                  style={styles.logoutBannerBtn}
                  onPress={async () => {
                    soundEffects.playBubblePop();
                    await logoutUser();
                  }}
                  activeOpacity={0.8}
                >
                  <LogoutIcon size={14} color="#FFFFFF" strokeWidth={2.8} />
                  <Text style={styles.logoutBannerBtnText}>
                    {language === 'gu' ? 'લૉગ આઉટ' : language === 'hi' ? 'लॉग आउट' : 'Log Out'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Error Message Banner */}
            {!!errorMessage && (
              <View style={styles.errorBanner}>
                <WarningIcon size={18} color="#DC2626" />
                <Text style={styles.errorText}>
                  {localizeAuthError(errorMessage, language)}
                </Text>
              </View>
            )}

            {/* Username or Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('auth.usernameOrEmail')}</Text>
              <View style={styles.inputContainer}>
                <View style={styles.fieldIconWrap}><AuthUserIcon size={20} color="#64748B" /></View>
                <TextInput
                  style={styles.textInput}
                  placeholder={
                    language === 'gu'
                      ? 'યુઝરનેમ અથવા ઈમેલ'
                      : language === 'hi'
                      ? 'उपयोगकर्ता नाम या ईमेल'
                      : 'e.g. sarah_parent or sarah@email.com'
                  }
                  placeholderTextColor="#94A3B8"
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('auth.password')}</Text>
              <View style={styles.inputContainer}>
                <View style={styles.fieldIconWrap}><AuthLockIcon size={20} color="#64748B" /></View>
                <TextInput
                  style={styles.textInput}
                  placeholder={
                    language === 'gu'
                      ? 'તમારો પાસવર્ડ દાખલ કરો'
                      : language === 'hi'
                      ? 'अपना पासवर्ड दर्ज करें'
                      : 'Enter your password'
                  }
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <AuthEyeOpenIcon size={20} color={kidTones.sky.edge} /> : <AuthEyeClosedIcon size={20} color="#94A3B8" />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <View style={styles.btnWrapper}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={kidTones.sky.edge} />
                  <Text style={styles.loadingText}>{t('auth.loggingIn')}</Text>
                </View>
              ) : (
                <PurpleGradientButton
                  title={t('auth.loginBtn')}
                  onPress={handleLogin}
                  height={56}
                  borderRadius={28}
                  id="login-btn-grad"
                />
              )}
            </View>

            {/* Register Link */}
            <View style={styles.switchAuthRow}>
              <Text style={styles.switchAuthPrompt}>{t('auth.dontHaveAccount')}</Text>
              <TouchableOpacity
                onPress={() => {
                  soundEffects.playBubblePop();
                  router.push('/register');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.switchAuthLink}>{t('auth.registerBtn')}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Continue as Guest Button */}
          <ClayButton
            tone="white"
            size="sm"
            sound={false}
            style={styles.guestButton}
            onPress={handleContinueAsGuest}
            icon={<UserIcon size={18} color={kidPalette.inkSoft} />}
            title={
              language === 'gu'
                ? 'હમણાં માટે મહેમાન તરીકે રમો →'
                : language === 'hi'
                ? 'अभी के लिए अतिथि के रूप में खेलें →'
                : 'Play as Guest for Now →'
            }
            textStyle={styles.guestButtonText}
          />
        </ScrollView>
      </KeyboardAvoidingView>

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
    backgroundColor: kidPalette.tintSky,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 36,
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
    shadowColor: '#1E293B',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  langPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: kidTones.sky.text,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  badgeWrap: {
    marginBottom: 12,
  },
  badgeInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: kidTones.sun.tintBorder,
    shadowColor: kidTones.sun.edge,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  badgeIcon: {
    fontSize: 34,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: kidPalette.ink,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  formCard: {
    ...claySurface('plain', 3),
    paddingHorizontal: 22,
    paddingVertical: 26,
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
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 7,
    marginLeft: 2,
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
  btnWrapper: {
    marginTop: 8,
    marginBottom: 18,
  },
  loadingContainer: {
    height: 56,
    borderRadius: 28,
    backgroundColor: kidTones.sky.tint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '700',
    color: kidTones.sky.text,
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
    color: kidTones.sky.text,
    textDecorationLine: 'underline',
  },
  guestButton: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 340,
  },
  guestButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: kidPalette.inkSoft,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
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

