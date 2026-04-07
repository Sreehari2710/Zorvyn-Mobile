import { formatDisplayDate, isConsecutiveDay } from '../utils/date';
import { subDays, addDays } from 'date-fns';

describe('Date Utilities', () => {
  test('formatDisplayDate should return "Today" for current date', () => {
    expect(formatDisplayDate(new Date())).toBe('Today');
  });

  test('formatDisplayDate should return "Yesterday" for previous day', () => {
    expect(formatDisplayDate(subDays(new Date(), 1))).toBe('Yesterday');
  });

  test('formatDisplayDate should return formatted date for older dates', () => {
    const olderDate = new Date(2023, 9, 15); // 15 Oct 2023
    expect(formatDisplayDate(olderDate)).toBe('15 Oct');
  });

  test('isConsecutiveDay should return true for truly consecutive days', () => {
    const today = new Date();
    const yesterday = subDays(today, 1);
    expect(isConsecutiveDay(today, yesterday)).toBe(true);
  });

  test('isConsecutiveDay should return false for same day or distant days', () => {
    const today = new Date();
    expect(isConsecutiveDay(today, today)).toBe(false);
    expect(isConsecutiveDay(today, subDays(today, 2))).toBe(false);
  });
});
