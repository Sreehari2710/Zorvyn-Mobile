import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, TextStyle, KeyboardTypeOptions } from 'react-native';
import { useTheme } from '@theme/ThemeProvider';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  error?: string;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  helperText?: string;
  trailingIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  multiline?: boolean;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onSubmitEditing?: () => void;
  maxLength?: number;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  error,
  style,
  inputStyle,
  helperText,
  trailingIcon,
  leftIcon,
  multiline = false,
  returnKeyType,
  onSubmitEditing,
  maxLength,
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = () => {
    if (error) return theme.colors.expense;
    if (isFocused) return theme.colors.primary;
    return theme.colors.border;
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
          {label}
        </Text>
      )}
      <View style={[
        styles.inputWrapper,
        { 
          backgroundColor: theme.colors.surface,
          borderColor: getBorderColor(),
          borderWidth: (isFocused || error) ? 2 : 1.5,
        }
      ]}>
        {leftIcon && (
          <View style={styles.leftIcon}>
            {leftIcon}
          </View>
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline={multiline}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          maxLength={maxLength}
          style={[
            styles.input,
            { color: theme.colors.text, ...theme.typography.body, marginLeft: leftIcon ? 8 : 0 },
            multiline && { height: 80, textAlignVertical: 'top', paddingTop: 8 },
            inputStyle,
          ]}
        />
        {trailingIcon && (
          <View style={styles.trailingIcon}>
            {trailingIcon}
          </View>
        )}
      </View>
      {(error || helperText) && (
        <Text style={[
          styles.footerText, 
          { color: error ? theme.colors.expense : theme.colors.textSecondary, ...theme.typography.caption }
        ]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    marginLeft: 4,
    fontWeight: '600',
  },
  inputWrapper: {
    minHeight: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: '100%',
  },
  trailingIcon: {
    marginLeft: 8,
  },
  leftIcon: {
    marginRight: 0,
  },
  footerText: {
    marginTop: 6,
    marginLeft: 4,
  }
});
