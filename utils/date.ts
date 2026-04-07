import { 
  format, 
  isToday, 
  isYesterday, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  differenceInDays,
  parseISO
} from 'date-fns';
import { Transaction } from '../models/transaction';

/**
 * Formats a date for display (e.g., "Today", "Yesterday", or "15 Oct").
 */
export const formatDisplayDate = (date: Date): string => {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'd MMM');
};

/**
 * Formats a date as short string (e.g., "15 Oct").
 */
export const formatShortDate = (date: Date): string => {
  return format(date, 'd MMM');
};

/**
 * Returns the start and end of a given month.
 */
export const getMonthRange = (date: Date = new Date()) => ({
  start: startOfMonth(date),
  end: endOfMonth(date),
});

/**
 * Returns the start and end of the current week.
 */
export const getWeekRange = (date: Date = new Date()) => ({
  start: startOfWeek(date, { weekStartsOn: 1 }), // Monday
  end: endOfWeek(date, { weekStartsOn: 1 }),
});

/**
 * Checks if two dates are consecutive days.
 */
export const isConsecutiveDay = (date1: Date, date2: Date): boolean => {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.abs(differenceInDays(d1, d2)) === 1;
};

/**
 * Groups transactions by display date label.
 */
export const groupByDate = (transactions: Transaction[]): Record<string, Transaction[]> => {
  return transactions.reduce((groups, t) => {
    const label = formatDisplayDate(t.date);
    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(t);
    return groups;
  }, {} as Record<string, Transaction[]>);
};
