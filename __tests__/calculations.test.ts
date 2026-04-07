import { 
  calculateBalance, 
  calculateTotalIncome, 
  calculateTotalExpenses, 
  calculateGoalProgress,
  calculateCategoryBreakdown,
  getTopCategory
} from '../utils/calculations';
import { Transaction } from '../models/transaction';

const mockTransactions: Transaction[] = [
  { id: '1', amount: 5000, type: 'income', category: 'Salary', date: new Date(), notes: '', createdAt: new Date() },
  { id: '2', amount: 1000, type: 'expense', category: 'Food & Dining', date: new Date(), notes: '', createdAt: new Date() },
  { id: '3', amount: 500, type: 'expense', category: 'Transport', date: new Date(), notes: '', createdAt: new Date() },
  { id: '4', amount: 200, type: 'expense', category: 'Food & Dining', date: new Date(), notes: '', createdAt: new Date() },
];

describe('Calculation Utilities', () => {
  test('calculateBalance should sum income and subtract expenses', () => {
    // 5000 - 1000 - 500 - 200 = 3300
    expect(calculateBalance(mockTransactions)).toBe(3300);
  });

  test('calculateTotalIncome should return sum of all income transactions', () => {
    expect(calculateTotalIncome(mockTransactions)).toBe(5000);
  });

  test('calculateTotalExpenses should return sum of all expense transactions', () => {
    expect(calculateTotalExpenses(mockTransactions)).toBe(1700);
  });

  test('calculateGoalProgress should return correct percentage', () => {
    expect(calculateGoalProgress(500, 1000)).toBe(50);
    expect(calculateGoalProgress(1200, 1000)).toBe(100); // capped at 100
    expect(calculateGoalProgress(0, 500)).toBe(0);
  });

  test('calculateCategoryBreakdown should group and sum expenses by category', () => {
    const result = calculateCategoryBreakdown(mockTransactions);
    // Food & Dining: 1000 + 200 = 1200
    // Transport: 500
    expect(result.find(r => r.category === 'Food & Dining')?.amount).toBe(1200);
    expect(result.find(r => r.category === 'Transport')?.amount).toBe(500);
  });

  test('getTopCategory should return category with most spending', () => {
    expect(getTopCategory(mockTransactions)).toBe('Food & Dining');
  });
});
