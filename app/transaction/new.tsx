import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput,
  Dimensions, KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { useTheme } from '@theme/ThemeProvider';
import { Calendar, X, Check } from 'lucide-react-native';
import { useTransactionStore } from '../../store/transactionStore';
import { useToastStore } from '../../store/toastStore';
import { CATEGORIES, getCategoryConfig } from '../../utils/categories';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { transactionSchema, Category } from '../../models/transaction';
import { format } from 'date-fns';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AddTransactionScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { addTransaction } = useTransactionStore();
  const { show } = useToastStore();

  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: 'Other' as Category,
    notes: '',
    date: new Date(),
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
        id: 'temp',
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        date: formData.date,
        notes: formData.notes,
        createdAt: new Date(),
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
          id: 'temp', amount: parseFloat(formData.amount), type: formData.type,
          category: formData.category, date: formData.date, notes: formData.notes, createdAt: new Date(),
        });
      } catch (err: any) {
        show(err?.errors?.[0]?.message || 'Please fix errors', 'error');
      }
      return;
    }
    const newTransaction = {
      id: Math.random().toString(36).substring(2, 15),
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      notes: formData.notes,
      date: formData.date,
      createdAt: new Date(),
    };
    addTransaction(newTransaction);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    show('Transaction added!', 'success');
    handleClose();
  };

  const categoryConfig = getCategoryConfig(formData.category);
  const isIncome = formData.type === 'income';

  return (
    <View style={styles.container}>
      <BottomSheet isVisible={isVisible} onClose={handleClose} height={SCREEN_HEIGHT * 0.92}>
        {/* Header */}
        <View style={styles.sheetHeader}>
          <Text style={[theme.typography.heading2, { color: theme.colors.text }]}>Add Record</Text>
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
            {/* Amount Block */}
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
                style={[styles.typeBtn, formData.type === 'expense' && { backgroundColor: theme.colors.expense }]}
              >
                <Text style={[theme.typography.bodyMedium, {
                  color: formData.type === 'expense' ? '#fff' : theme.colors.textSecondary,
                  fontWeight: formData.type === 'expense' ? '700' : '500',
                }]}>Expense</Text>
              </Pressable>
              <Pressable
                onPress={() => setFormData(f => ({ ...f, type: 'income' }))}
                style={[styles.typeBtn, formData.type === 'income' && { backgroundColor: theme.colors.income }]}
              >
                <Text style={[theme.typography.bodyMedium, {
                  color: formData.type === 'income' ? '#fff' : theme.colors.textSecondary,
                  fontWeight: formData.type === 'income' ? '700' : '500',
                }]}>Income</Text>
              </Pressable>
            </View>

            {/* Form Card */}
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
            <Button label="Save Transaction" onPress={handleSave} size="lg" />
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
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.catList}>
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
                    backgroundColor: theme.colors.surface,
                    borderColor: isActive ? config.text : theme.colors.border,
                    borderWidth: isActive ? 2 : 1,
                  },
                ]}
              >
                <View style={[styles.catRowIcon, { backgroundColor: config.bg, marginBottom: 8 }]}>
                  <config.icon size={22} color={config.text} />
                </View>
                <Text 
                  numberOfLines={1} 
                  style={[theme.typography.caption, { color: theme.colors.text, fontWeight: '600', textAlign: 'center' }]}
                >
                  {cat}
                </Text>
                {isActive && (
                  <View style={[styles.checkBadge, { backgroundColor: config.text }]}>
                    <Check size={10} color="#fff" strokeWidth={3} />
                  </View>
                )}
              </Pressable>
            );
          })}
          <View style={{ width: '100%', height: 40 }} />
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
    flexDirection: 'row', borderRadius: 16, padding: 4, marginBottom: 16,
  },
  typeBtn: {
    flex: 1, paddingVertical: 13, alignItems: 'center', borderRadius: 12,
  },
  formCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  fieldRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 16,
  },
  fieldIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  fieldTexts: { flex: 1, marginLeft: 14 },
  chevronBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  catList: { 
    paddingHorizontal: 16, 
    paddingTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  catRow: {
    width: '48.5%',
    flexDirection: 'column', 
    alignItems: 'center',
    borderRadius: 20, 
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginBottom: 12,
    position: 'relative',
  },
  catRowIcon: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
