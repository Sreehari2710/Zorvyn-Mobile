import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Keyboard } from 'react-native';
import { useTheme } from '@theme/ThemeProvider';
import { Input } from './Input';
import { Button } from './Button';
import { Goal } from '../models/goal';
import { IndianRupee } from 'lucide-react-native';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';

interface GoalFormProps {
  initialData?: Goal | null;
  onSave: (goal: Partial<Goal>) => void;
  onCancel: () => void;
}

export const GoalForm = ({ initialData, onSave, onCancel }: GoalFormProps) => {
  const { theme } = useTheme();
  const [targetAmount, setTargetAmount] = useState(initialData?.targetAmount.toString() || '');
  const [error, setError] = useState('');

  // Sync state when initialData changes (e.g. when opening edit for a different goal)
  React.useEffect(() => {
    setTargetAmount(initialData?.targetAmount.toString() || '');
    setError('');
  }, [initialData]);

  const handleSave = () => {
    const amount = parseFloat(targetAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid target amount');
      return;
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Keyboard.dismiss();
    
    onSave({
      targetAmount: amount,
      month: initialData?.month || new Date().getMonth() + 1,
      year: initialData?.year || new Date().getFullYear(),
    });
  };

  const currentMonth = format(new Date(), 'MMMM yyyy');

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={[theme.typography.heading2, { color: theme.colors.text }]}>
          {initialData ? 'Edit Savings Goal' : 'Set Savings Goal'}
        </Text>
        <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
          Target for {currentMonth}
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Monthly Target Amount"
          placeholder="e.g. 5000"
          keyboardType="numeric"
          value={targetAmount}
          onChangeText={(val) => {
            setTargetAmount(val);
            setError('');
          }}
          error={error}
          leftIcon={<IndianRupee size={18} color={theme.colors.textSecondary} />} 
          returnKeyType="done"
          onSubmitEditing={handleSave}
        />

        <View style={styles.infoBox}>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
            Zorvyn will track your "Income" transactions for this month and compare them against this target to show your savings progress.
          </Text>
        </View>

        <View style={styles.footer}>
          <Button 
            label="Save Goal" 
            onPress={handleSave} 
            style={{ flex: 1 }}
          />
          <Button 
            label="Cancel" 
            variant="ghost" 
            onPress={onCancel}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  infoBox: {
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
    marginTop: -8,
  },
  footer: {
    marginTop: 16,
    gap: 8,
    paddingBottom: 40, // Extra space for keyboard safety
  }
});
