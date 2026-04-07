import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval,
  startOfWeek, endOfWeek, subWeeks, eachWeekOfInterval, eachDayOfInterval,
  getWeek } from 'date-fns';
import { Transaction } from '../models/transaction';

export type TimePeriod = 'thisMonth' | 'lastMonth' | '3months';

/** Returns transactions filtered to the selected time period */
export const getTransactionsForPeriod = (
  transactions: Transaction[],
  period: TimePeriod
): Transaction[] => {
  const now = new Date();
  let start: Date;
  let end: Date;

  switch (period) {
    case 'thisMonth':
      start = startOfMonth(now);
      end = endOfMonth(now);
      break;
    case 'lastMonth': {
      const lastMonth = subMonths(now, 1);
      start = startOfMonth(lastMonth);
      end = endOfMonth(lastMonth);
      break;
    }
    case '3months':
      start = startOfMonth(subMonths(now, 2));
      end = endOfMonth(now);
      break;
    default:
      start = startOfMonth(now);
      end = endOfMonth(now);
  }

  return transactions.filter(t => {
    const d = new Date(t.date);
    return isWithinInterval(d, { start, end });
  });
};

/** Category breakdown sorted by highest spending */
export const calculateCategoryBreakdown = (
  transactions: Transaction[]
): { category: string; amount: number; percentage: number }[] => {
  const expenses = transactions.filter(t => t.type === 'expense');
  const totals: Record<string, number> = {};
  let totalSpending = 0;

  expenses.forEach(t => {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
    totalSpending += t.amount;
  });

  return Object.keys(totals)
    .map(category => ({
      category,
      amount: totals[category],
      percentage: totalSpending > 0 ? (totals[category] / totalSpending) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
};

/** Week-over-week spending comparison */
export const calculateWeekOverWeek = (transactions: Transaction[]) => {
  const now = new Date();
  const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

  const currentWeekExpenses = transactions
    .filter(t =>
      t.type === 'expense' &&
      isWithinInterval(new Date(t.date), { start: currentWeekStart, end: currentWeekEnd })
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const lastWeekExpenses = transactions
    .filter(t =>
      t.type === 'expense' &&
      isWithinInterval(new Date(t.date), { start: lastWeekStart, end: lastWeekEnd })
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const diff = currentWeekExpenses - lastWeekExpenses;
  // Avoid divide-by-zero: if last week was 0 and this week has data, it's 100% increase
  const percentageChange =
    lastWeekExpenses > 0
      ? (diff / lastWeekExpenses) * 100
      : currentWeekExpenses > 0
      ? 100
      : 0;

  return {
    currentWeekExpenses,
    lastWeekExpenses,
    diff,
    percentageChange,
    trend: diff >= 0 ? 'up' : 'down',
  };
};

/** Returns the top spending category object */
export const getTopCategory = (
  breakdown: { category: string; amount: number; percentage: number }[]
) => {
  return breakdown.length > 0 ? breakdown[0] : null;
};

/** Largest single expense in the period */
export const getLargestExpense = (transactions: Transaction[]): Transaction | null => {
  const expenses = transactions.filter(t => t.type === 'expense');
  if (expenses.length === 0) return null;
  return expenses.reduce((prev, curr) => (curr.amount > prev.amount ? curr : prev));
};

/**
 * Trend data for charts.
 * - For thisMonth / lastMonth: daily buckets
 * - For 3months: weekly buckets labeled "Wk N"
 */
export const getTrendData = (
  transactions: Transaction[],
  period: TimePeriod
): { label: string; amount: number }[] => {
  const now = new Date();

  if (period === '3months') {
    // Weekly buckets for 3-month view
    const start = startOfMonth(subMonths(now, 2));
    const end = endOfMonth(now);
    const periodExpenses = transactions.filter(
      t =>
        t.type === 'expense' &&
        isWithinInterval(new Date(t.date), { start, end })
    );

    const weekStarts = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });
    const weeklyTotals: Record<string, number> = {};

    periodExpenses.forEach(t => {
      const tDate = new Date(t.date);
      // Find the week bucket for this transaction
      const weekStart = weekStarts.find((ws, i) => {
        const nextWs = weekStarts[i + 1];
        return tDate >= ws && (nextWs ? tDate < nextWs : true);
      });
      if (weekStart) {
        const key = format(weekStart, 'yyyy-MM-dd');
        weeklyTotals[key] = (weeklyTotals[key] || 0) + t.amount;
      }
    });

    return weekStarts.map((ws, i) => ({
      label: `Wk ${i + 1}`,
      amount: weeklyTotals[format(ws, 'yyyy-MM-dd')] || 0,
    }));
  }

  // Daily view for thisMonth / lastMonth
  const periodTransactions = getTransactionsForPeriod(transactions, period).filter(
    t => t.type === 'expense'
  );

  const start =
    period === 'lastMonth'
      ? startOfMonth(subMonths(now, 1))
      : startOfMonth(now);
  const end =
    period === 'lastMonth' ? endOfMonth(subMonths(now, 1)) : now;

  const days = eachDayOfInterval({ start, end });
  const dailyTotals: Record<string, number> = {};

  periodTransactions.forEach(t => {
    const day = format(new Date(t.date), 'yyyy-MM-dd');
    dailyTotals[day] = (dailyTotals[day] || 0) + t.amount;
  });

  return days.map(day => ({
    label: format(day, 'd'),
    amount: dailyTotals[format(day, 'yyyy-MM-dd')] || 0,
  }));
};

/** Legacy alias kept for backwards compat if any file uses it */
export const getDailyTrendData = getTrendData;
