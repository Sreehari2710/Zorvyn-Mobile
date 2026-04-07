import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@theme/ThemeProvider';
import { Card } from './Card';
import { LucideIcon } from 'lucide-react-native';

interface MetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  type?: 'income' | 'expense' | 'neutral';
  style?: any;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  label, 
  value, 
  icon: Icon, 
  type = 'neutral',
  style
}) => {
  const { theme } = useTheme();

  const getValueColor = () => {
    if (type === 'income') return theme.colors.income;
    if (type === 'expense') return theme.colors.expense;
    return theme.colors.text;
  };

  const getIconColor = () => {
    if (type === 'income') return theme.colors.income;
    if (type === 'expense') return theme.colors.expense;
    return theme.colors.primary;
  };

  return (
    <Card style={[styles.card, style]} padding={12}>
      <View style={styles.header}>
        {/* @ts-ignore */}
        <Icon size={20} color={getIconColor()} />
        <Text style={[styles.label, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
          {label}
        </Text>
      </View>
      <Text style={[styles.value, { color: getValueColor(), ...theme.typography.heading1 }]} numberOfLines={1}>
        {value}
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    height: 100,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    marginLeft: 8,
  },
  value: {
    fontSize: 22,
  }
});
