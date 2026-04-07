import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Pressable } from 'react-native';
import { useTheme } from '@theme/ThemeProvider';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  elevation?: 0 | 1 | 2 | 3;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  padding = 16,
  elevation = 1,
  onPress
}) => {
  const { theme } = useTheme();

  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper 
      onPress={onPress}
      style={({ pressed }: any) => [
        styles.card,
        { 
          backgroundColor: theme.colors.surface,
          padding,
          ...theme.elevation[elevation],
          borderRadius: theme.radius.lg,
          transform: [{ scale: (pressed && onPress) ? 0.98 : 1 }],
          opacity: (pressed && onPress) ? 0.9 : 1,
        },
        style
      ]}
    >
      {children}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    width: '100%',
  },
});
