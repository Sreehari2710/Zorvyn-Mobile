import { Transaction } from '../models/transaction';

const generateId = () => Math.random().toString(36).substring(2, 11);

/**
 * Generates seed data for the current month
 */
export const getSeedTransactions = (): Transaction[] => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return [
    {
      id: generateId(),
      amount: 4500,
      type: 'income',
      category: 'Salary',
      date: new Date(currentYear, currentMonth, 1, 9, 0), // 9 AM
      notes: 'Monthly paycheck',
      createdAt: new Date(),
    },
    {
      id: generateId(),
      amount: 120,
      type: 'expense',
      category: 'Food & Dining',
      date: new Date(currentYear, currentMonth, 2, 19, 30), // 7:30 PM
      notes: 'Dinner with friends',
      createdAt: new Date(),
    },
    {
      id: generateId(),
      amount: 35,
      type: 'expense',
      category: 'Transport',
      date: new Date(currentYear, currentMonth, 3, 8, 15), // 8:15 AM
      notes: 'Fuel',
      createdAt: new Date(),
    },
    {
      id: generateId(),
      amount: 500,
      type: 'income',
      category: 'Freelance',
      date: new Date(currentYear, currentMonth, 5, 14, 0), // 2 PM
      notes: 'Web design project',
      createdAt: new Date(),
    },
    {
      id: generateId(),
      amount: 80,
      type: 'expense',
      category: 'Entertainment',
      date: new Date(currentYear, currentMonth, 7, 21, 0), // 9 PM
      notes: 'Movie tickets',
      createdAt: new Date(),
    },
    {
      id: generateId(),
      amount: 250,
      type: 'expense',
      category: 'Shopping',
      date: new Date(currentYear, currentMonth, 10, 11, 45), // 11:45 AM
      notes: 'New sneakers',
      createdAt: new Date(),
    },
    {
      id: generateId(),
      amount: 150,
      type: 'expense',
      category: 'Health',
      date: new Date(currentYear, currentMonth, 12, 10, 30), // 10:30 AM
      notes: 'Pharmacy',
      createdAt: new Date(),
    },
    {
      id: generateId(),
      amount: 1200,
      type: 'expense',
      category: 'Housing',
      date: new Date(currentYear, currentMonth, 1, 10, 0), // 10 AM (same day as Salary but later or earlier)
      notes: 'Rent',
      createdAt: new Date(),
    },
  ];

};
