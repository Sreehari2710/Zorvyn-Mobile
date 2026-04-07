import React from 'react';
import { 
  Pressable, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ViewStyle, 
  TextStyle 
} from 'react-native';
import { useTheme } from '@theme/ThemeProvider';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon
}) => {
  const { theme } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: theme.colors.primary,
          text: 'white',
          elevation: 1,
        };
      case 'secondary':
        return {
          background: theme.colors.surface,
          text: theme.colors.text,
          borderWidth: 1,
          borderColor: theme.colors.border,
          elevation: 0,
        };
      case 'outline':
        return {
          background: 'transparent',
          text: theme.colors.primary,
          borderWidth: 1,
          borderColor: theme.colors.primary,
          elevation: 0,
        };
      case 'destructive':
        return {
          background: theme.colors.expense,
          text: 'white',
          elevation: 1,
        };
      case 'ghost':
        return {
          background: 'transparent',
          text: theme.colors.primary,
          elevation: 0,
        };
      case 'link':
        return {
          background: 'transparent',
          text: theme.colors.primary,
          elevation: 0,
          paddingHorizontal: 0,
          height: 'auto',
        };
      default:
        return {
          background: theme.colors.primary,
          text: 'white',
          elevation: 1,
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        {
          backgroundColor: vStyles.background,
          borderColor: vStyles.borderColor || 'transparent',
          borderWidth: vStyles.borderWidth || 0,
          borderRadius: theme.radius.md,
          opacity: (disabled || loading) ? 0.6 : 1,
          transform: [{ scale: (pressed && !disabled) ? 0.98 : 1 }],
          ...theme.elevation[((pressed || disabled) ? 0 : (vStyles.elevation ?? 0)) as 0 | 1 | 2 | 3],
        },
        vStyles.height !== undefined && { height: vStyles.height as any },
        vStyles.paddingHorizontal !== undefined && { paddingHorizontal: vStyles.paddingHorizontal },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={vStyles.text} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[
            { 
              color: vStyles.text, 
              ...theme.typography.bodyMedium,
              fontWeight: '600',
              textDecorationLine: variant === 'link' ? 'underline' : 'none'
            },
            icon ? { marginLeft: theme.spacing[2] } : {},
            textStyle
          ]}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sm: {
    height: 36,
    paddingHorizontal: 16,
  },
  md: {
    height: 48,
    paddingHorizontal: 20,
  },
  lg: {
    height: 56,
    paddingHorizontal: 24,
  },
});
