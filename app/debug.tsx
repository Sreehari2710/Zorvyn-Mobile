import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useTransactionStore } from '../store/transactionStore';
import { useGoalStore } from '../store/goalStore';

import { getDaysRemainingInMonth, calculateBalance, calculateWeeklyTotals } from '../utils/calculations';
import { formatCurrency, formatCurrencyCompact } from '../utils/currency';
import { formatDisplayDate } from '../utils/date';
import { useTheme } from '@theme/ThemeProvider';
import { CATEGORIES } from '../utils/categories';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { ProgressBar } from '../components/ProgressBar';
import { CategoryChip } from '../components/CategoryChip';
import { MetricCard } from '../components/MetricCard';
import { TransactionItem } from '../components/TransactionItem';
import { TrendingUp, TrendingDown } from 'lucide-react-native';

export default function DebugScreen() {

  const { theme } = useTheme();
  const { transactions, addTransaction, getFilteredTransactions } = useTransactionStore();
  const { streak, updateStreak } = useGoalStore();



  const handleTestStreak = () => {
    updateStreak(new Date());
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[theme.typography.heading1, { color: theme.colors.text }]}>Data Debug</Text>
        
        <View style={styles.section}>
          <Text style={[theme.typography.heading2, { color: theme.colors.text, marginBottom: 12 }]}>
            Category Palette (CP-02 Verified)
          </Text>
          <View style={styles.paletteGrid}>
            {CATEGORIES.map((cat) => (
              <CategoryChip key={cat} category={cat} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[theme.typography.heading2, { color: theme.colors.text }]}>Formatters Test</Text>
          <Text style={{ color: theme.colors.text }}>Currency: {formatCurrency(1234.56)}</Text>
          <Text style={{ color: theme.colors.text }}>Compact: {formatCurrencyCompact(1200000)}</Text>
          <Text style={{ color: theme.colors.text }}>Date: {formatDisplayDate(new Date())}</Text>
          <Text style={{ color: theme.colors.text }}>Total Balance: {formatCurrency(calculateBalance(transactions))}</Text>
          <Text style={{ color: theme.colors.text }}>Remaining Days: {getDaysRemainingInMonth()}</Text>
          <Text style={{ color: theme.colors.text }}>Weekly Spending: {calculateWeeklyTotals(transactions).map(d => `${d.day}: ${d.total}`).join(', ')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[theme.typography.heading2, { color: theme.colors.text, marginBottom: 12 }]}>UI Component Library</Text>
          
          <Card style={{ marginBottom: 16 }}>
            <Text style={[theme.typography.heading3, { color: theme.colors.text, marginBottom: 8 }]}>Buttons</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Button label="Primary" onPress={() => {}} />
              <Button label="Secondary" variant="secondary" onPress={() => {}} />
              <Button label="Destructive" variant="destructive" onPress={() => {}} />
            </View>
          </Card>

          <Card style={{ marginBottom: 16 }}>
            <Text style={[theme.typography.heading3, { color: theme.colors.text, marginBottom: 8 }]}>Inputs</Text>
            <Input 
              label="Sample Input" 
              value="" 
              onChangeText={() => {}} 
              placeholder="Type something..." 
              helperText="Helper text example"
            />
          </Card>

          <Card style={{ marginBottom: 16 }}>
            <Text style={[theme.typography.heading3, { color: theme.colors.text, marginBottom: 8 }]}>Progress & Chips</Text>
            <ProgressBar progress={65} />
            <View style={{ height: 12 }} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <CategoryChip category="Food & Dining" />
              <CategoryChip category="Salary" />
              <CategoryChip category="Shopping" />
            </View>
          </Card>

          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <MetricCard 
              label="Income" 
              value="₹50,000" 
              icon={TrendingUp as any} 
              type="income" 
            />
            <MetricCard 
              label="Expenses" 
              value="₹12,400" 
              icon={TrendingDown as any} 
              type="expense" 
            />
          </View>

          <Card>
            <Text style={[theme.typography.heading3, { color: theme.colors.text, marginBottom: 8 }]}>Transaction Item</Text>
            <TransactionItem 
              transaction={{
                id: '1',
                amount: 450,
                type: 'expense',
                category: 'Transport',
                date: new Date(),
                notes: 'Uber to office',
                createdAt: new Date()
              }} 
            />
          </Card>
        </View>


        <View style={styles.section}>
          <Text style={[theme.typography.heading2, { color: theme.colors.text }]}>Streak: {streak.currentStreak}</Text>

          <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
            Last Log: {streak.streakDates.length > 0 ? streak.streakDates[streak.streakDates.length - 1] : 'Never'}
          </Text>
          <Pressable onPress={handleTestStreak} style={styles.button}>
            <Text style={{ color: 'white' }}>Update Streak (Today)</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={[theme.typography.heading2, { color: theme.colors.text }]}>
            Transactions: {transactions.length}
          </Text>

        </View>

        <View style={styles.section}>
          <Text style={[theme.typography.heading2, { color: theme.colors.text }]}>Filtered (First 5):</Text>
          {getFilteredTransactions().slice(0, 5).map(t => (
            <View key={t.id} style={styles.item}>
              <Text style={{ color: theme.colors.text }}>{t.category}: ${t.amount}</Text>
              <Text style={{ color: theme.colors.textSecondary, ...theme.typography.caption }}>{t.notes}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  section: {
    marginVertical: 10,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  paletteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#4F6EF7',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  item: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  }
});
