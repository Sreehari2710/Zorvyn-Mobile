import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useTheme } from '@theme/ThemeProvider';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface FABProps {
  style?: ViewStyle;
}

export const FAB: React.FC<FABProps> = ({ style }) => {
  const { theme } = useTheme();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!reduceMotion) {
      scale.value = withSpring(0.92, { damping: 10, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    if (!reduceMotion) {
      scale.value = withSpring(1, { damping: 10, stiffness: 300 });
    }
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/transaction/new');
  };

  return (
    <Animated.View style={[styles.fab, { ...theme.elevation[3] }, animatedStyle, style]}>
      <Pressable
        style={[
          styles.fabInner,
          { backgroundColor: theme.colors.primary },
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {/* @ts-ignore */}
        <Plus size={24} color="white" />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  fabInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
