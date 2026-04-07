import { z } from 'zod';

export type TransactionType = 'income' | 'expense';

export const CategoryEnum = z.enum([
  'Food & Dining',
  'Transport',
  'Shopping',
  'Entertainment',
  'Health',
  'Housing',
  'Utilities',
  'Salary',
  'Freelance',
  'Other',
]);

export type Category = z.infer<typeof CategoryEnum>;

export const transactionSchema = z.object({
  id: z.string(), // We use custom generates often
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['income', 'expense']),
  category: CategoryEnum,
  date: z.date(),
  notes: z.string().max(200, 'Notes too long').optional(),
  createdAt: z.date(),
});

export type Transaction = z.infer<typeof transactionSchema>;
