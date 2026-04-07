import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from './storage';
import { Transaction } from '../models/transaction';
import { useTransactionStore } from './transactionStore';
import { Goal, GoalHistory, StreakData } from '../models/goal';
import { differenceInDays, parseISO } from 'date-fns';

/**
 * Compute the current streak given an array of logged ISO date strings.
 * Counts consecutive days ending today (or yesterday, to allow for today not yet logged).
 */
function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const unique = [...new Set(dates)].sort().reverse(); // newest first, deduped
  const today = new Date().toISOString().split('T')[0];
  let streak = 0;
  let expected = today;

  for (const d of unique) {
    if (d === expected) {
      streak++;
      // Next expected date is the previous day
      const prev = new Date(expected);
      prev.setDate(prev.getDate() - 1);
      expected = prev.toISOString().split('T')[0];
    } else if (d < expected) {
      // Gap — streak broken
      break;
    }
  }
  return streak;
}

interface GoalState {
  activeGoal: Goal | null;
  goalHistory: GoalHistory[];
  streak: StreakData;

  // Actions
  setGoal: (goal: Goal) => void;
  updateGoal: (updates: Partial<Goal>) => void;
  deleteGoal: () => void;
  archiveGoal: () => void;
  updateStreak: (date: Date) => void;
  syncGoalProgress: (transactions: any[]) => void;
  deleteHistoryItem: (goalId: string) => void;
  updateHistoryItem: (goalId: string, updates: Partial<GoalHistory>) => void;
}

export const useGoalStore = create<GoalState>()(
  persist(
    (set, get) => ({
      activeGoal: null,
      goalHistory: [],
      streak: {
        currentStreak: 0,
        longestStreak: 0,
        streakDates: [],
      },

      setGoal: (goal) => {
        set({ activeGoal: goal });
        const { transactions } = useTransactionStore.getState();
        if (transactions.length > 0) {
          get().syncGoalProgress(transactions);
        }
      },

      updateGoal: (updates) =>
        set((state) => {
          const newGoal = state.activeGoal ? { ...state.activeGoal, ...updates } : null;
          if (newGoal) {
            const { transactions } = useTransactionStore.getState();
            if (transactions.length > 0) {
              const income = transactions
                .filter((t: Transaction) =>
                  String(t.type) === 'income' &&
                  new Date(t.date).getMonth() === newGoal.month - 1 &&
                  new Date(t.date).getFullYear() === newGoal.year
                )
                .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
              const expenses = transactions
                .filter((t: Transaction) =>
                  t.type === 'expense' &&
                  new Date(t.date).getMonth() === newGoal.month - 1 &&
                  new Date(t.date).getFullYear() === newGoal.year
                )
                .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
              newGoal.currentSaved = income - expenses;
            }
          }
          return { activeGoal: newGoal };
        }),

      deleteGoal: () => set({ activeGoal: null }),

      archiveGoal: () => {
        const { activeGoal } = get();
        if (!activeGoal) return;

        const historyItem: GoalHistory = {
          goalId: activeGoal.id,
          month: activeGoal.month,
          year: activeGoal.year,
          targetAmount: activeGoal.targetAmount,
          savedAmount: activeGoal.currentSaved,
          met: activeGoal.currentSaved >= activeGoal.targetAmount,
        };

        set((state) => ({
          goalHistory: [historyItem, ...state.goalHistory],
          activeGoal: null,
        }));
      },

      deleteHistoryItem: (goalId) =>
        set((state) => ({
          goalHistory: state.goalHistory.filter((h) => h.goalId !== goalId),
        })),

      updateHistoryItem: (goalId, updates) =>
        set((state) => ({
          goalHistory: state.goalHistory.map((h) =>
            h.goalId === goalId
              ? { ...h, ...updates, met: (updates.savedAmount ?? h.savedAmount) >= (updates.targetAmount ?? h.targetAmount) }
              : h
          ),
        })),

      updateStreak: (date) => {
        const { streak } = get();
        const dateStr = date.toISOString().split('T')[0];

        // Already logged today
        if (streak.streakDates.includes(dateStr)) return;

        const newDates = [...streak.streakDates, dateStr];
        const newCurrent = computeStreak(newDates);
        const newLongest = Math.max(newCurrent, streak.longestStreak);

        set({
          streak: {
            currentStreak: newCurrent,
            longestStreak: newLongest,
            streakDates: newDates,
          },
        });
      },

      syncGoalProgress: (transactions) => {
        const { activeGoal } = get();
        if (!activeGoal) return;

        const relevantTransactions = transactions.filter((t) => {
          const tDate = new Date(t.date);
          return (
            tDate.getMonth() === activeGoal.month - 1 &&
            tDate.getFullYear() === activeGoal.year
          );
        });

        const income = relevantTransactions
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);

        const expenses = relevantTransactions
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        const currentSavings = income - expenses;

        if (activeGoal.currentSaved !== currentSavings) {
          set((state) => ({
            activeGoal: state.activeGoal
              ? { ...state.activeGoal, currentSaved: currentSavings }
              : null,
          }));
        }
      },
    }),
    {
      name: 'goal-storage',
      storage: createJSONStorage(() => mmkvStorage),
      onRehydrateStorage: () => (state) => {
        if (state && state.activeGoal) {
          state.activeGoal = {
            ...state.activeGoal,
            createdAt: new Date(state.activeGoal.createdAt),
          };
        }
        // Migrate old streak format (lastLoggedDate string) to streakDates array
        if (state && state.streak) {
          const s = state.streak as any;
          if (!s.streakDates) {
            const legacyDate = s.lastLoggedDate as string | null;
            state.streak = {
              currentStreak: s.currentStreak ?? 0,
              longestStreak: s.longestStreak ?? 0,
              streakDates: legacyDate ? [legacyDate] : [],
            };
          }
        }
      },
    }
  )
);
