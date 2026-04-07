import { startOfToday, subDays, format, isSameDay, endOfMonth, differenceInDays, isToday, isYesterday } from 'date-fns';
import { Transaction } from '../models/transaction';
import { getWeekRange } from './date';

/**
 * Returns the number of days remaining in the current month.
 */
export const getDaysRemainingInMonth = (): number => {
  const today = startOfToday();
  const lastOfMonth = endOfMonth(today);
  return differenceInDays(lastOfMonth, today);
};

/**
 * Calculates total balance.
 */
export const calculateBalance = (transactions: Transaction[]): number => {
  return transactions.reduce((sum, t) => 
    t.type === 'income' ? sum + t.amount : sum - t.amount, 0);
};

/**
 * Calculates total income.
 */
export const calculateTotalIncome = (transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
};

/**
 * Calculates total expenses.
 */
export const calculateTotalExpenses = (transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
};

/**
 * Calculates progress percentage for a goal.
 */
export const calculateGoalProgress = (current: number, target: number): number => {
  if (target <= 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
};

/**
 * Calculates category-wise breakdown sorted descending.
 */
export const calculateCategoryBreakdown = (transactions: Transaction[]) => {
  const breakdown = transactions.reduce((acc, t) => {
    if (t.type === 'expense') {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const total = Object.values(breakdown).reduce((s, v) => s + v, 0);

  return Object.entries(breakdown)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
};

/**
 * Calculates week-over-week change.
 */
export const calculateWeekOverWeek = (transactions: Transaction[]) => {
  const { start: thisStart } = getWeekRange(new Date());
  const lastWeekDate = subDays(thisStart, 1);
  const { start: lastStart, end: lastEnd } = getWeekRange(lastWeekDate);

  const thisWeekTotal = transactions
    .filter(t => t.date >= thisStart && t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const lastWeekTotal = transactions
    .filter(t => t.date >= lastStart && t.date <= lastEnd && t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const changePercent = lastWeekTotal > 0 
    ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100 
    : 0;

  return { thisWeek: thisWeekTotal, lastWeek: lastWeekTotal, changePercent };
};

/**
 * Calculates daily totals for the last 7 days.
 */
export const calculateWeeklyTotals = (transactions: Transaction[]) => {
  const days = Array.from({ length: 7 }, (_, i) => subDays(startOfToday(), 6 - i));
  
  return days.map(day => {
    const total = transactions
      .filter(t => isSameDay(t.date, day) && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      day: format(day, 'EEE'),
      total,
    };
  });
};

/**
 * Returns the largest expense transaction.
 */
export const getLargestExpense = (transactions: Transaction[]): Transaction | null => {
  const expenses = transactions.filter(t => t.type === 'expense');
  if (expenses.length === 0) return null;
  return expenses.reduce((max, t) => t.amount > max.amount ? t : max);
};

/**
 * Returns the category with the highest spending.
 */
export const getTopCategory = (transactions: Transaction[]): string | null => {
  const breakdown = calculateCategoryBreakdown(transactions);
  return breakdown.length > 0 ? breakdown[0].category : null;
};

/**
 * Groups transactions by date for display.
 */
export const groupTransactionsByDate = (transactions: Transaction[]) => {
  const sorted = [...transactions].sort((a, b) => b.date.getTime() - a.date.getTime());
  
  const groups: { title: string; data: Transaction[] }[] = [];
  
  sorted.forEach(t => {
    let title = '';
    if (isToday(t.date)) title = 'Today';
    else if (isYesterday(t.date)) title = 'Yesterday';
    else title = format(t.date, 'MMMM d, yyyy');
    
    // Check if group already exists
    const existingGroup = groups.find(g => g.title === title);
    if (existingGroup) {
      existingGroup.data.push(t);
    } else {
      groups.push({ title, data: [t] });
    }
  });
  
  return groups;
};

/**
 * Calculates current month's spending average per day.
 */
export const calculateDailySpendAverage = (transactions: Transaction[]): number => {
  const now = new Date();
  const daysPassed = now.getDate();
  const totalSpent = transactions
    .filter(t => t.type === 'expense' && t.date.getMonth() === now.getMonth() && t.date.getFullYear() === now.getFullYear())
    .reduce((sum, t) => sum + t.amount, 0);
  
  return daysPassed > 0 ? totalSpent / daysPassed : 0;
};

/**
 * Linearly extrapolates savings based on current month's performance.
 */
export const calculateProjectedSavings = (currentSaved: number): number => {
  const now = new Date();
  const daysPassed = now.getDate();
  const daysInMonth = endOfMonth(now).getDate();
  
  if (daysPassed === 0) return 0;
  return (currentSaved / daysPassed) * daysInMonth;
};
