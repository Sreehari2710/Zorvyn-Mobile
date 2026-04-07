import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@theme/ThemeProvider';
import { Button } from './Button';

interface EmptyStateProps {
  heading: string;
  subtext: string;
  icon: React.ReactNode;
  ctaLabel?: string;
  onCta?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  heading,
  subtext,
  icon,
  ctaLabel,
  onCta
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.neutral[50] as string }]}>
        {icon}
      </View>
      <Text style={[styles.heading, { color: theme.colors.text, ...theme.typography.heading2 }]}>
        {heading}
      </Text>
      <Text style={[styles.subtext, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
        {subtext}
      </Text>
      {ctaLabel && onCta && (
        <Button 
          label={ctaLabel} 
          onPress={onCta} 
          variant="secondary" 
          style={styles.cta}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heading: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtext: {
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  cta: {
    minWidth: 160,
  },
});
