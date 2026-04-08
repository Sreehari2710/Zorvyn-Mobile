import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput, ScrollView,
  Dimensions, Alert, KeyboardAvoidingView, Platform, Keyboard, TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@theme/ThemeProvider';
import { Calendar, X, Trash2, Check } from 'lucide-react-native';
import { useTransactionStore } from '../../store/transactionStore';
import { useToastStore } from '../../store/toastStore';
import { CATEGORIES, getCategoryConfig } from '../../utils/categories';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { transactionSchema, Category } from '../../models/transaction';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export default function EditTransactionScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transactions, updateTransaction, deleteTransaction } = useTransactionStore();
  const { show } = useToastStore();

  const transaction = transactions.find(t => t.id === id);

  const [formData, setFormData] = useState({
    amount: transaction?.amount.toString() || '',
    type: (transaction?.type || 'expense') as 'income' | 'expense',
    category: (transaction?.category || 'Other') as Category,
    notes: transaction?.notes || '',
    date: transaction?.date ? new Date(transaction.date) : new Date(),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCategorySheetVisible, setCategorySheetVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => router.back(), 250);
  };

  const validate = () => {
    try {
      transactionSchema.parse({
        id: id || 'temp',
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        date: formData.date,
        notes: formData.notes,
        createdAt: transaction?.createdAt ? new Date(transaction.createdAt as any) : new Date(),
      });
      setErrors({});
      return true;
    } catch (err: any) {
      const fieldErrors: Record<string, string> = {};
      if (err?.errors) err.errors.forEach((e: any) => { fieldErrors[e.path[0]] = e.message; });
      setErrors(fieldErrors);
      return false;
    }
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') setDatePickerVisible(false);
    if (selectedDate) setFormData(f => ({ ...f, date: selectedDate }));
  };

  const handleSave = () => {
    if (!validate()) {
      try {
        transactionSchema.parse({
          id, amount: parseFloat(formData.amount), type: formData.type,
          category: formData.category, date: formData.date, notes: formData.notes,
          createdAt: transaction?.createdAt ? new Date(transaction.createdAt as any) : new Date(),
        });
      } catch (err: any) {
        show(err?.errors?.[0]?.message || 'Please fix errors', 'error');
      }
      return;
    }
    if (id) {
      updateTransaction(id, {
        amount: parseFloat(formData.amount),
        type: formData.type, category: formData.category,
        notes: formData.notes, date: formData.date,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Keyboard.dismiss();
      show('Transaction updated!', 'success');
      handleClose();
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Transaction', 'Are you sure you want to permanently delete this record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          deleteTransaction(id as string);
          show('Transaction deleted', 'success');
          handleClose();
        },
      },
    ]);
  };

  if (!transaction) return null;

  const categoryConfig = getCategoryConfig(formData.category);
  const isIncome = formData.type === 'income';

  return (
    <View style={styles.container}>
      <BottomSheet isVisible={isVisible} onClose={handleClose} height={SCREEN_HEIGHT * 0.92}>
        {/* Header */}
        <View style={styles.sheetHeader}>
          <Text style={[theme.typography.heading2, { color: theme.colors.text }]}>Edit Record</Text>
          <Pressable onPress={handleClose} style={[styles.closeBtn, { backgroundColor: theme.colors.neutral[100] as string }]}>
            <X size={18} color={theme.colors.textSecondary} />
          </Pressable>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Amount */}
            <View style={[styles.amountBlock, { backgroundColor: isIncome ? theme.colors.incomeBg : theme.colors.expenseBg }]}>
              <Text style={[theme.typography.overline, { color: isIncome ? theme.colors.income : theme.colors.expense, opacity: 0.7 }]}>
                TOTAL AMOUNT
              </Text>
              <View style={styles.amountRow}>
                <Text style={[styles.amountPrefix, { color: isIncome ? theme.colors.income : theme.colors.expense }]}>
                  {isIncome ? '+₹' : '-₹'}
                </Text>
                <TextInput
                  style={[styles.amountInput, { color: theme.colors.text }]}
                  placeholder="0"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="numeric"
                  value={formData.amount}
                  onChangeText={val => setFormData(f => ({ ...f, amount: val }))}
                />
              </View>
              {errors.amount && (
                <Text style={[theme.typography.caption, { color: theme.colors.expense }]}>{errors.amount}</Text>
              )}
            </View>

            {/* Type Toggle */}
            <View style={[styles.typeToggle, { backgroundColor: theme.colors.neutral[100] as string }]}>
              <Pressable
                onPress={() => setFormData(f => ({ ...f, type: 'expense' }))}
                style={[
                  styles.typeBtn,
                  formData.type === 'expense' && { backgroundColor: theme.colors.expense },
                ]}
              >
                <Text style={[theme.typography.bodyMedium, {
                  color: formData.type === 'expense' ? '#fff' : theme.colors.textSecondary,
                  fontWeight: formData.type === 'expense' ? '700' : '500',
                }]}>Expense</Text>
              </Pressable>
              <Pressable
                onPress={() => setFormData(f => ({ ...f, type: 'income' }))}
                style={[
                  styles.typeBtn,
                  formData.type === 'income' && { backgroundColor: theme.colors.income },
                ]}
              >
                <Text style={[theme.typography.bodyMedium, {
                  color: formData.type === 'income' ? '#fff' : theme.colors.textSecondary,
                  fontWeight: formData.type === 'income' ? '700' : '500',
                }]}>Income</Text>
              </Pressable>
            </View>

            {/* Form Rows */}
            <View style={[styles.formCard, { backgroundColor: theme.colors.surface, ...theme.elevation[1] }]}>
              {/* Category */}
              <Pressable
                onPress={() => setCategorySheetVisible(true)}
                style={[styles.fieldRow, { borderBottomColor: theme.colors.border, borderBottomWidth: 1 }]}
              >
                <View style={[styles.fieldIcon, { backgroundColor: categoryConfig.bg }]}>
                  <categoryConfig.icon size={20} color={categoryConfig.text} />
                </View>
                <View style={styles.fieldTexts}>
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>Category</Text>
                  <Text style={[theme.typography.bodyMedium, { color: theme.colors.text }]}>{formData.category}</Text>
                </View>
                <View style={[styles.chevronBadge, { backgroundColor: theme.colors.background }]}>
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>Change</Text>
                </View>
              </Pressable>

              {/* Date */}
              <Pressable
                onPress={() => setDatePickerVisible(true)}
                style={styles.fieldRow}
              >
                <View style={[styles.fieldIcon, { backgroundColor: theme.colors.primary + '12' }]}>
                  <Calendar size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.fieldTexts}>
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>Date</Text>
                  <Text style={[theme.typography.bodyMedium, { color: theme.colors.text }]}>
                    {format(formData.date, 'MMMM d, yyyy')}
                  </Text>
                </View>
                <View style={[styles.chevronBadge, { backgroundColor: theme.colors.background }]}>
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>Change</Text>
                </View>
              </Pressable>
            </View>

            {isDatePickerVisible && (
              <DateTimePicker
                value={formData.date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
              />
            )}

            {/* Notes */}
            <View style={{ marginTop: 4 }}>
              <Input
                label="Notes"
                placeholder="What was this for?"
                value={formData.notes}
                onChangeText={val => setFormData(f => ({ ...f, notes: val.slice(0, 200) }))}
                helperText={`${formData.notes.length}/200 characters`}
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
                maxLength={200}
              />
            </View>

            <View style={{ height: 12 }} />
            <Button label="Save Changes" onPress={handleSave} size="lg" />
            <Button
              label="Delete Record"
              onPress={handleDelete}
              variant="ghost"
              textStyle={{ color: theme.colors.expense, fontWeight: '600' }}
              style={{ marginTop: 4 }}
              icon={<Trash2 size={16} color={theme.colors.expense} />}
            />
            <View style={{ height: 20 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </BottomSheet>

      {/* Category Picker Sheet */}
      <BottomSheet
        isVisible={isCategorySheetVisible}
        onClose={() => setCategorySheetVisible(false)}
        height={SCREEN_HEIGHT * 0.72}
      >
        <View style={styles.sheetSubHeader}>
          <Text style={[theme.typography.heading2, { color: theme.colors.text }]}>Select Category</Text>
          <Pressable onPress={() => setCategorySheetVisible(false)} style={[styles.closeBtn, { backgroundColor: theme.colors.neutral[100] as string }]}>
            <X size={18} color={theme.colors.textSecondary} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.catList}>
          {CATEGORIES.map(cat => {
            const config = getCategoryConfig(cat);
            const isActive = formData.category === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => { setFormData(f => ({ ...f, category: cat as Category })); setCategorySheetVisible(false); }}
                style={[
                  styles.catRow,
                  {
                    backgroundColor: isActive ? config.bg : theme.colors.surface,
                    borderColor: isActive ? config.text : theme.colors.border,
                    borderWidth: isActive ? 1.5 : 1,
                  },
                ]}
              >
                <View style={[styles.catRowIcon, { backgroundColor: isActive ? 'transparent' : config.bg }]}>
                  <config.icon size={20} color={config.text} />
                </View>
                <Text style={[theme.typography.bodyMedium, { color: isActive ? config.text : theme.colors.text, flex: 1, marginLeft: 12 }]}>
                  {cat}
                </Text>
                {isActive && <Check size={18} color={config.text} strokeWidth={2.5} />}
              </Pressable>
            );
          })}
          <View style={{ height: 60 }} />
        </ScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 16,
  },
  sheetSubHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 12,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  scrollContent: { paddingHorizontal: 20 },
  amountBlock: {
    alignItems: 'center', borderRadius: 16,
    padding: 20, marginBottom: 16,
  },
  amountRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  amountPrefix: { fontSize: 32, fontWeight: '700', marginRight: 4 },
  amountInput: { fontSize: 48, fontWeight: '700', minWidth: 100, textAlign: 'center' },
  typeToggle: {
    flexDirection: 'row', borderRadius: 16,
    padding: 4, marginBottom: 16,
  },
  typeBtn: {
    flex: 1, paddingVertical: 13, alignItems: 'center', borderRadius: 12,
  },
  formCard: { borderRadius: 16, marginBottom: 16, overflow: 'hidden' },
  fieldRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16,
  },
  fieldIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  fieldTexts: { flex: 1, marginLeft: 14 },
  chevronBadge: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8, marginLeft: 8,
  },
  catList: { paddingHorizontal: 16, paddingTop: 4, gap: 8 },
  catRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, padding: 12,
  },
  catRowIcon: {
    width: 40, height: 40, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
});
