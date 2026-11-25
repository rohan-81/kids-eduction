import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { AppLanguage } from '../../types';
import { soundEffects } from '../../services/soundEffects';
import { audioService } from '../../services/audioService';
import { useApp } from '../../context/AppContext';
import { CoinLabel } from './GoldCoinIcon';
import Svg, { Path } from 'react-native-svg';
import { Glyph } from '../fun/KidIcons';

const MicSvgIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = '#8062F5' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2Z" fill={color} />
    <Path d="M19 10V11C19 14.87 15.87 18 12 18C8.13 18 5 14.87 5 11V10M12 18V22M8 22H16" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

interface KidsMicrophonePracticeProps {
  targetWord: string;
  targetSymbol?: string;
  language: AppLanguage;
  onSuccess?: (stars: number) => void;
}

export const KidsMicrophonePractice: React.FC<KidsMicrophonePracticeProps> = ({
  targetWord,
  targetSymbol,
  language,
  onSuccess,
}) => {
  const { addCoins } = useApp();
  const [status, setStatus] = useState<'idle' | 'listening' | 'success' | 'retry'>('idle');
  const [retryReason, setRetryReason] = useState<'silence' | 'permission'>('silence');
  const [recognizedText, setRecognizedText] = useState<string>('');

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const star1Scale = useRef(new Animated.Value(0)).current;
  const star2Scale = useRef(new Animated.Value(0)).current;
  const star3Scale = useRef(new Animated.Value(0)).current;
  const wave1Anim = useRef(new Animated.Value(0.3)).current;
  const wave2Anim = useRef(new Animated.Value(0.7)).current;
  const wave3Anim = useRef(new Animated.Value(0.4)).current;

  const recognitionRef = useRef<any>(null);
  const recorderRef = useRef<any>(null);
  const mediaStreamRef = useRef<any>(null);
  const audioContextRef = useRef<any>(null);
  const meterIntervalRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const isResolvedRef = useRef<boolean>(false);
  const voiceDetectedRef = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  const cleanupAudio = () => {
    isListeningRef.current = false;
    isResolvedRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (meterIntervalRef.current) clearInterval(meterIntervalRef.current);

    // Clean up Web Speech Recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    // Clean up Web MediaStream
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track: any) => track.stop());
      } catch {}
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }

    // Clean up Native Recorder
    if (recorderRef.current) {
      try {
        recorderRef.current.stop();
      } catch {}
      recorderRef.current = null;
    }
  };

  const startWaveAnimation = () => {
    const createLoop = (anim: Animated.Value, dur: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: dur,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(anim, {
            toValue: 0.2,
            duration: dur,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ])
      );

    Animated.parallel([
      createLoop(wave1Anim, 300),
      createLoop(wave2Anim, 450),
      createLoop(wave3Anim, 350),
    ]).start();
  };

  const handleStartListening = async () => {
    soundEffects.playBubblePop();
    cleanupAudio();

    isListeningRef.current = true;
    isResolvedRef.current = false;
    voiceDetectedRef.current = false;
    setStatus('listening');
    setRecognizedText('');
    startWaveAnimation();

    // Pulse button animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 400,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    ).start();

    // 1. Web Speech Recognition or Web Audio Metering
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognitionRef.current = recognition;
          recognition.continuous = false;
          recognition.interimResults = false;

          const langCode =
            language === 'gu' ? 'gu-IN' : language === 'hi' ? 'hi-IN' : 'en-US';
          recognition.lang = langCode;

          recognition.onresult = (event: any) => {
            const transcript = event.results?.[0]?.[0]?.transcript || '';
            if (!isResolvedRef.current && isListeningRef.current) {
              if (transcript.trim().length > 0) {
                voiceDetectedRef.current = true;
                setRecognizedText(transcript);
                triggerCelebration(transcript);
              } else {
                triggerRetry('silence');
              }
            }
          };

          recognition.onerror = (e: any) => {
            if (!isResolvedRef.current && isListeningRef.current) {
              if (e?.error === 'not-allowed' || e?.error === 'service-not-allowed') {
                triggerRetry('permission');
              } else {
                triggerRetry('silence');
              }
            }
          };

          recognition.onend = () => {
            if (!isResolvedRef.current && isListeningRef.current && !voiceDetectedRef.current) {
              triggerRetry('silence');
            }
          };

          recognition.start();

          // Safety timeout for web speech
          timerRef.current = setTimeout(() => {
            if (!isResolvedRef.current && isListeningRef.current) {
              if (!voiceDetectedRef.current) {
                triggerRetry('silence');
              }
            }
          }, 4500);

          return;
        } catch {
          // Fall through to getUserMedia volume meter
        }
      }

      // Web Audio API volume detection fallback
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStreamRef.current = stream;
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const audioCtx = new AudioContextClass();
            audioContextRef.current = audioCtx;
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            meterIntervalRef.current = setInterval(() => {
              if (!isListeningRef.current) {
                if (meterIntervalRef.current) clearInterval(meterIntervalRef.current);
                return;
              }
              analyser.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
              const avg = sum / dataArray.length;
              // Detect actual spoken voice above ambient room noise
              if (avg > 18) {
                voiceDetectedRef.current = true;
              }
            }, 100);

            timerRef.current = setTimeout(() => {
              if (meterIntervalRef.current) clearInterval(meterIntervalRef.current);
              if (!isResolvedRef.current && isListeningRef.current) {
                if (voiceDetectedRef.current) {
                  triggerCelebration(targetWord);
                } else {
                  triggerRetry('silence');
                }
              }
            }, 3600);

            return;
          }
        } catch (err: any) {
          triggerRetry('permission');
          return;
        }
      }
    }

    // 2. Mobile (Native Expo Go / React Native)
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const ExpoAudio = require('expo-audio');
      if (ExpoAudio?.requestRecordingPermissionsAsync) {
        const perm = await ExpoAudio.requestRecordingPermissionsAsync();
        if (!perm || perm.status !== 'granted') {
          triggerRetry('permission');
          return;
        }

        if (ExpoAudio.AudioModule?.AudioRecorder) {
          const recPreset = ExpoAudio.RecordingPresets?.LOW_QUALITY || {
            extension: '.m4a',
            sampleRate: 44100,
            numberOfChannels: 1,
            bitRate: 64000,
            android: { extension: '.m4a', outputFormat: 'mpeg_4', audioEncoder: 'aac' },
            ios: { outputFormat: 'aac ', audioQuality: 0 },
          };

          const recorder = new ExpoAudio.AudioModule.AudioRecorder({
            ...recPreset,
            isMeteringEnabled: true,
          });
          recorderRef.current = recorder;
          await recorder.prepareToRecordAsync();
          recorder.record();

          meterIntervalRef.current = setInterval(() => {
            if (!isListeningRef.current || !recorder) {
              if (meterIntervalRef.current) clearInterval(meterIntervalRef.current);
              return;
            }
            try {
              const recState = recorder.getStatus();
              // Normal voice volume registers higher than -45 dB (silence is -160 to -55 dB)
              if (typeof recState?.metering === 'number' && recState.metering > -45) {
                voiceDetectedRef.current = true;
              }
            } catch {}
          }, 150);

          timerRef.current = setTimeout(async () => {
            if (meterIntervalRef.current) clearInterval(meterIntervalRef.current);
            try {
              await recorder.stop();
            } catch {}

            if (!isResolvedRef.current && isListeningRef.current) {
              if (voiceDetectedRef.current) {
                triggerCelebration(targetWord);
              } else {
                triggerRetry('silence');
              }
            }
          }, 3600);

          return;
        }
      }
    } catch {
      // Fallback
    }

    // Fallback timer: if nothing was detected or microphone permission was blocked, DO NOT grant stars!
    timerRef.current = setTimeout(() => {
      if (!isResolvedRef.current && isListeningRef.current) {
        if (voiceDetectedRef.current) {
          triggerCelebration(targetWord);
        } else {
          triggerRetry('silence');
        }
      }
    }, 3800);
  };

  const handleManualSpokeConfirmation = () => {
    // Child or parent explicitly tapped "I Spoke!" button
    voiceDetectedRef.current = true;
    triggerCelebration(targetWord);
  };

  const triggerCelebration = async (heard: string) => {
    if (isResolvedRef.current) return;
    isResolvedRef.current = true;
    isListeningRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (meterIntervalRef.current) clearInterval(meterIntervalRef.current);

    cleanupAudio();

    pulseAnim.setValue(1);
    setStatus('success');

    soundEffects.playTadaaa();
    addCoins(5);

    // Staggered 3-Star Spring Entrance
    Animated.stagger(150, [
      Animated.spring(star1Scale, { toValue: 1, friction: 4, tension: 80, useNativeDriver: Platform.OS !== 'web' }),
      Animated.spring(star2Scale, { toValue: 1.25, friction: 4, tension: 80, useNativeDriver: Platform.OS !== 'web' }),
      Animated.spring(star3Scale, { toValue: 1, friction: 4, tension: 80, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();

    // Voice celebration
    await audioService.speakCelebration(language);
    onSuccess?.(3);
  };

  const triggerRetry = (reason: 'silence' | 'permission') => {
    if (isResolvedRef.current) return;
    isResolvedRef.current = true;
    isListeningRef.current = false;
    cleanupAudio();

    pulseAnim.setValue(1);
    soundEffects.playWrongSound();
    setRetryReason(reason);
    setStatus('retry');
  };

  const resetPractice = () => {
    cleanupAudio();
    soundEffects.playBubblePop();
    setStatus('idle');
    setRecognizedText('');
    setRetryReason('silence');
    star1Scale.setValue(0);
    star2Scale.setValue(0);
    star3Scale.setValue(0);
  };

  const displayText = targetWord || targetSymbol || 'A';

  return (
    <View
      style={[
        styles.container,
        status === 'success' && styles.successContainer,
        status === 'listening' && styles.listeningContainer,
        status === 'retry' && styles.retryContainer,
        Platform.OS === 'web' && ({
          boxShadow: '0 4px 18px rgba(128, 98, 245, 0.08)',
        } as any),
      ]}
    >
      {/* Top Banner Tag */}
      <View style={styles.headerTagRow}>
        <View
          style={[
            styles.headerTag,
            status === 'success'
              ? styles.headerTagSuccess
              : status === 'retry'
              ? styles.headerTagError
              : styles.headerTagPurple,
          ]}
        >
          <Text
            style={[
              styles.headerTagText,
              status === 'success'
                ? styles.headerTagTextSuccess
                : status === 'retry'
                ? styles.headerTagTextError
                : styles.headerTagTextPurple,
            ]}
          >
            {status === 'success'
              ? language === 'gu'
                ? '🌟 અદ્ભુત બોલ્યા!'
                : language === 'hi'
                ? '🌟 शानदार बोले!'
                : '🌟 Super Pronunciation!'
              : status === 'retry'
              ? retryReason === 'permission'
                ? language === 'gu'
                  ? '🔒 પરમિશન જરૂરી છે'
                  : language === 'hi'
                  ? '🔒 अनुमति आवश्यक है'
                  : '🔒 Permission Required'
                : language === 'gu'
                ? '❌ અવાજ સંભળાયો નહીં'
                : language === 'hi'
                ? '❌ आवाज़ नहीं आई'
                : '❌ No Voice Detected'
              : language === 'gu'
              ? '🎙️ બોલવાની પ્રેક્ટિસ'
              : language === 'hi'
              ? '🎙️ बोलने का अभ्यास'
              : '🎙️ Speak & Match'}
          </Text>
        </View>

        {status === 'success' && (
          <View style={styles.bonusCoinPill}>
            <CoinLabel size={16} iconAfter textStyle={styles.bonusCoinText}>+5</CoinLabel>
          </View>
        )}
      </View>

      {/* 1. IDLE STATE */}
      {status === 'idle' && (
        <View style={styles.centerCol}>
          <Text style={styles.promptTitle}>
            {language === 'gu'
              ? `મોટેથી બોલો: "${displayText}"`
              : language === 'hi'
              ? `ज़ोर से बोलिए: "${displayText}"`
              : `Say it loud: "${displayText}"`}
          </Text>
          <Text style={styles.promptSub}>
            {language === 'gu'
              ? 'માઈક ટેપ કરો અને બાળકને મોટેથી બોલવા દો!'
              : language === 'hi'
              ? 'माइक दबाएं और बच्चे को ज़ोर से बोलने दें!'
              : 'Tap mic & let your little superstar speak!'}
          </Text>

          <TouchableOpacity
            style={styles.micButton}
            onPress={handleStartListening}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Tap to speak"
          >
            <View style={styles.micIconCircle}>
              <MicSvgIcon size={24} color="#8062F5" />
            </View>
            <Text style={styles.micBtnText}>
              {language === 'gu'
                ? 'બોલો (Tap to Speak)'
                : language === 'hi'
                ? 'बोलिए (Tap to Speak)'
                : 'Tap to Speak'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 2. LISTENING STATE */}
      {status === 'listening' && (
        <View style={styles.centerCol}>
          <Text style={[styles.promptTitle, { color: '#E11D48' }]}>
            {language === 'gu'
              ? `સાંભળી રહ્યા છીએ... બોલો "${displayText}"!`
              : language === 'hi'
              ? `सुन रहे हैं... बोलिए "${displayText}"!`
              : `Listening... Say "${displayText}"!`}
          </Text>

          {/* Soundwave equalizer bars */}
          <View style={styles.soundwavesRow}>
            <Animated.View style={[styles.waveBar, { transform: [{ scaleY: wave1Anim }] }]} />
            <Animated.View style={[styles.waveBar, { transform: [{ scaleY: wave2Anim }], height: 36, backgroundColor: '#8062F5' }]} />
            <Animated.View style={[styles.waveBar, { transform: [{ scaleY: wave3Anim }] }]} />
          </View>

          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <View style={styles.listeningPill}>
              <MicSvgIcon size={20} color="#E11D48" />
              <Text style={styles.listeningText}>
                {language === 'gu' ? 'માઈક પાસે બોલો...' : language === 'hi' ? 'माइक के पास बोलें...' : 'Speak near mic...'}
              </Text>
            </View>
          </Animated.View>

          {/* Explicit Child Done Button */}
          <View style={styles.listeningActionRow}>
            <TouchableOpacity
              style={styles.spokeConfirmBtn}
              onPress={handleManualSpokeConfirmation}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Glyph name="check" size={16} color="#FFFFFF" strokeWidth={3.5} />
                <Text style={styles.spokeConfirmBtnText}>
                  {language === 'gu' ? 'મેં બોલી લીધું!' : language === 'hi' ? 'मैंने बोल दिया!' : 'I Spoke!'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelListeningBtn}
              onPress={resetPractice}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelListeningBtnText}>
                {language === 'gu' ? 'રદ કરો' : language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 3. RETRY STATE (WHEN NOTHING WAS SPOKEN OR SILENCE) */}
      {status === 'retry' && (
        <View style={styles.centerCol}>
          <Text style={[styles.promptTitle, { color: '#DC2626' }]}>
            {retryReason === 'permission'
              ? language === 'gu'
                ? 'માઇક્રોફોનની પરમિશન જરૂરી છે!'
                : language === 'hi'
                ? 'माइक्रोफ़ोन की अनुमति आवश्यक है!'
                : 'Microphone Permission Needed!'
              : language === 'gu'
              ? 'કાંઈ સંભળાયું નહીં! ફરીથી મોટેથી બોલો!'
              : language === 'hi'
              ? 'कोई आवाज़ सुनाई नहीं दी! ज़ोर से बोलें!'
              : "Didn't hear any sound! Please speak louder!"}
          </Text>
          <Text style={styles.promptSub}>
            {retryReason === 'permission'
              ? language === 'gu'
                ? 'બોલવાની પ્રેક્ટિસ માટે કૃપા કરીને સેટિંગ્સમાંથી માઈક ચાલુ કરો.'
                : language === 'hi'
                ? 'बोलने के अभ्यास के लिए कृपया सेटिंग्स से माइक चालू करें।'
                : 'Please enable microphone access in settings to practice speaking.'
              : language === 'gu'
              ? `શાંત જગ્યાએ માઈક નજીક રાખીને મોટેથી "${displayText}" બોલો.`
              : language === 'hi'
              ? `माइक के पास आकर ज़ोर से "${displayText}" बोलिए।`
              : `Come close to the mic and say "${displayText}" loudly.`}
          </Text>

          <TouchableOpacity
            style={styles.tryAgainBtn}
            onPress={resetPractice}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Glyph name="replay" size={16} color="#FFFFFF" strokeWidth={3} />
              <Text style={styles.tryAgainBtnText}>
                {language === 'gu'
                  ? 'ફરી પ્રયત્ન કરો'
                  : language === 'hi'
                  ? 'फिर से प्रयास करें'
                  : 'Try Again'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* 4. SUCCESS STATE (ONLY WHEN ACTUALLY SPOKEN) */}
      {status === 'success' && (
        <View style={styles.centerCol}>
          {/* 3 Bouncing Stars */}
          <View style={styles.starsRow}>
            <Animated.View style={{ transform: [{ scale: star1Scale }] }}>
              <Glyph name="star" size={32} color="#F59E0B" />
            </Animated.View>
            <Animated.View style={{ transform: [{ scale: star2Scale }], marginHorizontal: 8 }}>
              <Glyph name="star" size={44} color="#F59E0B" />
            </Animated.View>
            <Animated.View style={{ transform: [{ scale: star3Scale }] }}>
              <Glyph name="star" size={32} color="#F59E0B" />
            </Animated.View>
          </View>

          <Text style={styles.successPraise}>
            {recognizedText
              ? language === 'gu'
                ? `શાબાશ! તમે "${recognizedText}" બોલ્યા!`
                : language === 'hi'
                ? `शाबाश! आपने "${recognizedText}" बोला!`
                : `Awesome! You said "${recognizedText}"!`
              : language === 'gu'
              ? 'શાબાશ! ૧૦૦% સાચો અવાજ!'
              : language === 'hi'
              ? 'शाबाश! १००% सही उच्चारण!'
              : 'Spot On! 100% Perfect Voice!'}
          </Text>

          <TouchableOpacity
            style={styles.retryBtn}
            onPress={resetPractice}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Glyph name="replay" size={16} color="#475569" strokeWidth={3} />
              <Text style={styles.retryBtnText}>
                {language === 'gu'
                  ? 'ફરી બોલો'
                  : language === 'hi'
                  ? 'फिर से बोलें'
                  : 'Practice Again'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#EDE9FE',
    padding: 16,
    marginVertical: 12,
    alignItems: 'center',
  },
  listeningContainer: {
    borderColor: '#FECDD3',
    backgroundColor: '#FFF1F2',
  },
  retryContainer: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  successContainer: {
    borderColor: '#A7F3D0',
    backgroundColor: '#F0FDF4',
  },
  headerTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  headerTag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  headerTagPurple: {
    backgroundColor: '#F3E8FF',
  },
  headerTagSuccess: {
    backgroundColor: '#DCFCE7',
  },
  headerTagError: {
    backgroundColor: '#FEE2E2',
  },
  headerTagText: {
    fontSize: 12,
    fontWeight: '800',
  },
  headerTagTextPurple: {
    color: '#7C3AED',
  },
  headerTagTextSuccess: {
    color: '#059669',
  },
  headerTagTextError: {
    color: '#DC2626',
  },
  bonusCoinPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  bonusCoinText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
  },
  centerCol: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 4,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1B4B',
    textAlign: 'center',
    marginBottom: 4,
  },
  promptSub: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  micButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8062F5',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 26,
    shadowColor: '#8062F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  micIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  soundwavesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 42,
    marginVertical: 10,
  },
  waveBar: {
    width: 6,
    height: 28,
    borderRadius: 3,
    backgroundColor: '#F43F5E',
  },
  listeningPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FDA4AF',
    marginBottom: 12,
  },
  listeningText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#BE123C',
  },
  listeningActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  spokeConfirmBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  spokeConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  cancelListeningBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
  },
  cancelListeningBtnText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  tryAgainBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
    marginTop: 4,
  },
  tryAgainBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  starEmoji: {
    fontSize: 34,
  },
  successPraise: {
    fontSize: 15,
    fontWeight: '800',
    color: '#065F46',
    marginVertical: 6,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    marginTop: 6,
  },
  retryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
});
