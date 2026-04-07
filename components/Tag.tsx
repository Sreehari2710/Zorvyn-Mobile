import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { useTheme } from '@theme/ThemeProvider';
import { getCategoryConfig } from '../utils/categories';

interface TagProps {
  label: string;
  variant?: 'category' | 'filter';
  category?: string;
  active?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const Tag: React.FC<TagProps> = ({ 
  label, 
  variant = 'category', 
  category, 
  active = false, 
  onPress,
  style 
}) => {
  const { theme } = useTheme();

  const getStyles = () => {
    if (variant === 'category' && category) {
      const config = getCategoryConfig(category);
      return {
        bg: config.bg,
        text: config.text,
        border: 'transparent',
      };
    }

    if (variant === 'filter') {
      return {
        bg: active ? theme.colors.primary : theme.colors.surface,
        text: active ? 'white' : theme.colors.textSecondary,
        border: active ? theme.colors.primary : theme.colors.border,
      };
    }

    return {
      bg: theme.colors.neutral[100] as string,
      text: theme.colors.textSecondary,
      border: 'transparent',
    };
  };

  const colors = getStyles();

  return (
    <Pressable 
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.base,
        { 
          backgroundColor: colors.bg,
          borderColor: colors.border,
          borderWidth: variant === 'filter' ? 1.5 : 0,
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style
      ]}
    >
      <Text style={[
        styles.text, 
        { color: colors.text, ...theme.typography.overline, fontWeight: '700' }
      ]}>
        {label.toUpperCase()}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    letterSpacing: 0.5,
  },
});
