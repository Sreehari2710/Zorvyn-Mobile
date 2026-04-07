import { z } from 'zod';

export const goalSchema = z.object({
  id: z.string(),
  targetAmount: z.number().positive(),
  currentSaved: z.number().default(0),
  month: z.number().min(1).max(12),
  year: z.number(),
  createdAt: z.date(),
});

export type Goal = z.infer<typeof goalSchema>;

export interface GoalHistory {
  goalId: string;
  month: number;
  year: number;
  targetAmount: number;
  savedAmount: number;
  met: boolean;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  streakDates: string[]; // Array of ISO date strings (YYYY-MM-DD)
}

export const streakSchema = z.object({
  currentStreak: z.number().default(0),
  longestStreak: z.number().default(0),
  streakDates: z.array(z.string()).default([]),
});
