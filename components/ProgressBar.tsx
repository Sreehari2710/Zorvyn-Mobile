import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';
import { useTheme } from '@theme/ThemeProvider';

interface ProgressBarProps {
  progress: number; // 0 to 100
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  showLabel = true,
}) => {
  const { theme } = useTheme();
  const reduceMotion = useReducedMotion();

  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      // Instant update when Reduce Motion is enabled
      animatedProgress.value = clampedProgress;
    } else {
      animatedProgress.value = withTiming(clampedProgress, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
    }
  }, [clampedProgress, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value}%`,
  }));

  const getProgressColor = () => {
    if (clampedProgress < 50) return theme.colors.expense;
    if (clampedProgress < 80) return theme.colors.warning;
    return theme.colors.income;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.track, { backgroundColor: theme.colors.neutral[100] as string }]}>
        {clampedProgress > 0 && (
          <Animated.View
            style={[
              styles.fill,
              { backgroundColor: getProgressColor() },
              animatedStyle,
            ]}
          />
        )}
      </View>
      {showLabel && (
        <Text
          style={[
            styles.label,
            { color: theme.colors.text, ...theme.typography.bodyMedium },
          ]}
        >
          {Math.round(clampedProgress)}%
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  track: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
  label: {
    marginLeft: 12,
    minWidth: 40,
  },
});
