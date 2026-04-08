import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Keyboard, Pressable } from 'react-native';
import { useTheme } from '@theme/ThemeProvider';
import { Input } from './Input';
import { Button } from './Button';
import { Goal } from '../models/goal';
import { 
  IndianRupee, Home, Car, Target, Plane, 
  GraduationCap, Shield, Laptop, Star 
} from 'lucide-react-native';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';

interface GoalFormProps {
  initialData?: Goal | null;
  onSave: (goal: Partial<Goal>) => void;
  onCancel: () => void;
}

const CATEGORIES = [
  { id: 'house', label: 'House', icon: Home },
  { id: 'car', label: 'Car', icon: Car },
  { id: 'target', label: 'Target', icon: Target },
  { id: 'travel', label: 'Travel', icon: Plane },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'emergency', label: 'Emergency', icon: Shield },
  { id: 'tech', label: 'Tech', icon: Laptop },
  { id: 'other', label: 'Other', icon: Star },
];

export const GoalForm = ({ initialData, onSave, onCancel }: GoalFormProps) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState(initialData?.title || '');
  const [category, setCategory] = useState<string>(initialData?.category || 'target');
  const [targetAmount, setTargetAmount] = useState(initialData?.targetAmount.toString() || '');
  const [error, setError] = useState('');

  // Sync state when initialData changes
  React.useEffect(() => {
    setTitle(initialData?.title || '');
    setCategory(initialData?.category || 'target');
    setTargetAmount(initialData?.targetAmount.toString() || '');
    setError('');
  }, [initialData]);

  const handleSave = () => {
    const amount = parseFloat(targetAmount);
    if (!title.trim()) {
      setError('Please enter a goal title');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid target amount');
      return;
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Keyboard.dismiss();
    
    onSave({
      title: title.trim(),
      category: category as any,
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
          label="Goal Title"
          placeholder="e.g. House Down Payment"
          value={title}
          onChangeText={(val) => {
            setTitle(val);
            setError('');
          }}
          returnKeyType="next"
        />

        <View>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: 8, marginLeft: 4 }]}>
            CATEGORY
          </Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = category === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setCategory(cat.id);
                  }}
                  style={[
                    styles.categoryBtn,
                    { 
                      backgroundColor: isActive ? theme.colors.primary : theme.colors.surface,
                      borderColor: isActive ? theme.colors.primary : theme.colors.border,
                      borderWidth: 1,
                    }
                  ]}
                >
                  <Icon size={20} color={isActive ? '#fff' : theme.colors.textSecondary} />
                  <Text 
                    numberOfLines={1} 
                    adjustsFontSizeToFit
                    style={[
                      theme.typography.caption, 
                      { 
                        color: isActive ? '#fff' : theme.colors.textSecondary,
                        marginTop: 4,
                        fontSize: 10,
                        fontWeight: isActive ? '700' : '400'
                      }
                    ]}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Input
          label="Monthly Target Amount"
          placeholder="e.g. 50000"
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
    gap: 20,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  categoryBtn: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
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
    paddingBottom: 40,
  }
});
