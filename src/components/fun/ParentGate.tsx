import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { kidTones, kidPalette, KidTone, CLAY_DEPTH } from '../../theme/kidTheme';
import { soundEffects } from '../../services/soundEffects';
import {
  createGateChallenge,
  checkGateAnswer,
  GateChallenge,
  getGateLockRemainingMs,
  registerGateFailure,
  registerGateSuccess,
} from '../../utils/parentGate';
import { formatNumberDigits } from '../../utils/languageData';
import { AppLanguage } from '../../types';
import { Glyph } from './KidIcons';
import { KidModal } from './KidModal';
import { ClayButton } from '../clay/ClayButton';

const useNative = Platform.OS !== 'web';
type Tri = { gu: string; hi: string; en: string };
const tr = (lang: AppLanguage, s: Tri) => (lang === 'gu' ? s.gu : lang === 'hi' ? s.hi : s.en);

/** One tactile 3D keypad key. */
const Key: React.FC<{ label?: string; glyph?: 'backspace' | 'check'; tone: KidTone; onPress: () => void; a11y: string }> = ({
  label,
  glyph,
  tone,
  onPress,
  a11y,
}) => {
  const spec = kidTones[tone];
  const press = useRef(new Animated.Value(0)).current;
  const translateY = press.interpolate({ inputRange: [0, 1], outputRange: [0, CLAY_DEPTH - 2] });
  const isWhite = tone === 'white';
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => Animated.timing(press, { toValue: 1, duration: 60, useNativeDriver: useNative }).start()}
      onPressOut={() => Animated.spring(press, { toValue: 0, friction: 4, tension: 180, useNativeDriver: useNative }).start()}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      style={[styles.keyWrap, Platform.OS === 'web' && ({ cursor: 'pointer', userSelect: 'none' } as any)]}
    >
      <View style={[styles.keyLip, { backgroundColor: spec.edge }]} />
      <Animated.View
        style={[
          styles.keyFace,
          { backgroundColor: spec.fill, borderWidth: isWhite ? 2 : 0, borderColor: '#E2E8F0', transform: [{ translateY }] },
        ]}
      >
        {glyph ? (
          <Glyph name={glyph} size={24} color={isWhite ? kidPalette.inkSoft : spec.onFill} />
        ) : (
          <Text style={[styles.keyText, { color: isWhite ? kidPalette.ink : spec.onFill }]}>{label}</Text>
        )}
      </Animated.View>
    </Pressable>
  );
};

export interface ParentGateProps {
  language: AppLanguage;
  onSuccess: () => void;
  onCancel?: () => void;
  cancelLabel?: string;
  /** Explains what the parent is unlocking. */
  reason?: string;
}

/** Math-gate content (question card + keypad). Use inline or inside <ParentGateModal>. */
export const ParentGate: React.FC<ParentGateProps> = ({ language, onSuccess, onCancel, cancelLabel, reason }) => {
  const [challenge, setChallenge] = useState<GateChallenge>(() => createGateChallenge());
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);
  const [lockSeconds, setLockSeconds] = useState(() => Math.ceil(getGateLockRemainingMs() / 1000));
  const shake = useRef(new Animated.Value(0)).current;
  const isLocked = lockSeconds > 0;

  // Count down the 30s lockout (also resumes correctly if the gate is reopened mid-lockout)
  useEffect(() => {
    if (!isLocked) return;
    const id = setInterval(() => {
      const secs = Math.ceil(getGateLockRemainingMs() / 1000);
      setLockSeconds(secs);
      if (secs <= 0) setError(false);
    }, 500);
    return () => clearInterval(id);
  }, [isLocked]);

  const fail = () => {
    soundEffects.playWrongSound();
    const lockMs = registerGateFailure();
    if (lockMs > 0) setLockSeconds(Math.ceil(lockMs / 1000));
    setError(true);
    setAnswer('');
    setChallenge(createGateChallenge()); // fresh question after every wrong attempt
    shake.setValue(0);
    Animated.sequence(
      [1, -1, 1, -1, 0].map((v) => Animated.timing(shake, { toValue: v, duration: 55, useNativeDriver: useNative }))
    ).start();
  };

  const submit = () => {
    if (checkGateAnswer(challenge, answer)) {
      registerGateSuccess();
      soundEffects.playTadaaa();
      setError(false);
      setAnswer('');
      onSuccess();
    } else {
      fail();
    }
  };

  const press = (k: string) => {
    if (getGateLockRemainingMs() > 0) return; // locked after too many wrong answers
    soundEffects.playBubblePop();
    setError(false);
    if (k === 'del') setAnswer((a) => a.slice(0, -1));
    else if (k === 'ok') submit();
    else setAnswer((a) => (a.length < 3 ? a + k : a));
  };

  const translateX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-10, 10] });

  return (
    <View style={styles.gate}>
      <Text style={styles.reason}>
        {reason ||
          tr(language, {
            gu: 'બાળકો આકસ્મિક ફેરફાર ન કરે તે માટે આ સવાલનો જવાબ આપો:',
            hi: 'बच्चे गलती से बदलाव न करें, इसलिए इस सवाल का जवाब दें:',
            en: 'Grown-ups only! Solve this to continue:',
          })}
      </Text>

      <Animated.View style={[styles.questionCard, { transform: [{ translateX }] }]}>
        <Text style={styles.questionText} accessibilityLabel={`${challenge.a} times ${challenge.b}`}>
          {formatNumberDigits(challenge.a, language)} × {formatNumberDigits(challenge.b, language)} = ?
        </Text>
      </Animated.View>

      <View style={[styles.display, error && styles.displayError]}>
        <Text style={[styles.displayText, !answer && styles.displayPlaceholder]}>
          {answer ? formatNumberDigits(parseInt(answer, 10), language) : tr(language, { gu: 'જવાબ', hi: 'उत्तर', en: 'Answer' })}
        </Text>
      </View>
      {isLocked ? (
        <Text style={styles.errorText} accessibilityLiveRegion="polite">
          {tr(language, {
            gu: `ઘણા ખોટા જવાબ! ${formatNumberDigits(lockSeconds, language)} સેકન્ડ રાહ જુઓ`,
            hi: `बहुत सारे गलत जवाब! ${formatNumberDigits(lockSeconds, language)} सेकंड रुकें`,
            en: `Too many tries! Wait ${lockSeconds} seconds`,
          })}
        </Text>
      ) : error ? (
        <Text style={styles.errorText}>
          {tr(language, { gu: 'ઓહ! નવો સવાલ અજમાવો', hi: 'ओह! नया सवाल आज़माएं', en: 'Oops! Try this new one' })}
        </Text>
      ) : null}

      <View style={[styles.keypad, isLocked && styles.keypadLocked]} pointerEvents={isLocked ? 'none' : 'auto'}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((k, i) => (
          <Key key={k} label={formatNumberDigits(parseInt(k, 10), language)} tone={(['sky', 'sun', 'mint', 'lavender', 'coral'] as KidTone[])[i % 5]} onPress={() => press(k)} a11y={k} />
        ))}
        <Key glyph="backspace" tone="white" onPress={() => press('del')} a11y="Delete" />
        <Key label={formatNumberDigits(0, language)} tone="sky" onPress={() => press('0')} a11y="0" />
        <Key glyph="check" tone="mint" onPress={() => press('ok')} a11y="Submit" />
      </View>

      {onCancel ? (
        <ClayButton
          tone="white"
          size="sm"
          onPress={onCancel}
          style={styles.cancel}
          icon={<Glyph name="back" size={18} color={kidPalette.inkSoft} />}
          title={cancelLabel || tr(language, { gu: 'રદ કરો', hi: 'रद्द करें', en: 'Cancel' })}
          textStyle={{ color: kidPalette.inkSoft }}
        />
      ) : null}
    </View>
  );
};

/** Parental gate as a popup (🛡️ emblem). */
export const ParentGateModal: React.FC<ParentGateProps & { visible: boolean }> = ({ visible, ...props }) => (
  <KidModal
    visible={visible}
    emblem="🛡️"
    tone="sky"
    title={tr(props.language, { gu: 'વાલી સુરક્ષા', hi: 'अभिभावक सुरक्षा', en: 'Grown-ups Only' })}
    onClose={props.onCancel}
  >
    {visible ? <ParentGate {...props} /> : null}
  </KidModal>
);

const styles = StyleSheet.create({
  gate: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  reason: {
    fontSize: 15,
    fontWeight: '700',
    color: kidPalette.inkMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  questionCard: {
    width: '100%',
    backgroundColor: kidTones.lavender.fill,
    borderRadius: 24,
    borderBottomWidth: 7,
    borderBottomColor: kidTones.lavender.edge,
    paddingVertical: 18,
    alignItems: 'center',
  },
  questionText: {
    fontSize: 36,
    fontWeight: '700',
    fontFamily: (Platform.OS === 'web' ? '"Baloo 2", "Noto Sans Gujarati", "Noto Sans Devanagari", "Shruti", sans-serif' : undefined) as any,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  display: {
    width: '70%',
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: kidTones.sky.tintBorder,
    backgroundColor: kidTones.sky.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayError: {
    borderColor: kidTones.coral.fill,
    backgroundColor: kidTones.coral.tint,
  },
  displayText: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: (Platform.OS === 'web' ? '"Baloo 2", "Noto Sans Gujarati", "Noto Sans Devanagari", "Shruti", sans-serif' : undefined) as any,
    color: kidPalette.ink,
    letterSpacing: 3,
  },
  displayPlaceholder: {
    fontSize: 18,
    color: kidPalette.inkFaint,
    letterSpacing: 0,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '800',
    color: kidTones.coral.text,
  },
  keypad: {
    width: '100%',
    maxWidth: 300,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  keypadLocked: {
    opacity: 0.4,
  },
  keyWrap: {
    width: '31%',
    height: 58 + CLAY_DEPTH,
  },
  keyLip: {
    position: 'absolute',
    top: CLAY_DEPTH,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  keyFace: {
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: 26,
    fontWeight: '700',
    fontFamily: (Platform.OS === 'web' ? '"Baloo 2", "Noto Sans Gujarati", "Noto Sans Devanagari", "Shruti", sans-serif' : undefined) as any,
  },
  cancel: {
    alignSelf: 'center',
    minWidth: 170,
    marginTop: 4,
  },
});
