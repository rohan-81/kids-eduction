import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { radii, shadows, spacing } from '../theme/spacing';
import { audioService } from '../services/audioService';

import { AppIcon } from './AppIcon';

interface AudioSpeakerButtonProps {
  onPress: () => void;
  size?: number;
  label?: string;
  testID?: string;
}

export const AudioSpeakerButton: React.FC<AudioSpeakerButtonProps> = ({
  onPress,
  size = 56,
  label,
  testID,
}) => {
  const [isPressing, setIsPressing] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  useEffect(() => {
    const unsub = audioService.addSpeechLoadingListener(setIsAudioLoading);
    return unsub;
  }, []);

  const handlePress = () => {
    setIsPressing(true);
    onPress();
    setTimeout(() => setIsPressing(false), 500);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={[
          styles.button,
          shadows.card,
          {
            width: size,
            height: size,
            borderRadius: radii.full,
            backgroundColor: isPressing || isAudioLoading ? '#E9D5FF' : '#F3E8FF',
            borderColor: '#DDD6FE',
          },
        ]}
        testID={testID}
      >
        {isAudioLoading ? (
          <ActivityIndicator size="small" color="#7C3AED" />
        ) : (
          <AppIcon name="speaker" size={Math.round(size * 0.52)} />
        )}
      </TouchableOpacity>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  label: {
    marginTop: spacing.xs,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
