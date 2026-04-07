import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useReducedMotion,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { useTheme } from '@theme/ThemeProvider';
import { CheckCircle, AlertCircle } from 'lucide-react-native';
import { useToastStore } from '../store/toastStore';

export const Toast = () => {
  const { theme } = useTheme();
  const { visible, message, type, hide } = useToastStore();
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        hide();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, hide]);

  if (!visible) return null;

  const isSuccess = type === 'success';
  const Icon = isSuccess ? CheckCircle : AlertCircle;
  const bgColor = isSuccess ? theme.colors.success : theme.colors.expense;

  // Slide up 8px + fade in 200ms; instant opacity swap when Reduce Motion enabled
  const entering = reduceMotion
    ? FadeIn.duration(100)
    : SlideInDown.springify().damping(20).mass(0.8);

  const exiting = reduceMotion
    ? FadeOut.duration(100)
    : SlideOutDown.duration(180);

  return (
    <Animated.View
      entering={entering}
      exiting={exiting}
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          ...theme.elevation[2],
        },
      ]}
    >
      <Icon size={20} color="white" />
      <Text style={[styles.text, { ...theme.typography.bodyMedium, color: 'white' }]}>
        {message}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 104,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    zIndex: 9999,
  },
  text: {
    marginLeft: 10,
    flex: 1,
  },
});
