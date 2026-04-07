import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from './storage';
import { Transaction } from '../models/transaction';

interface TransactionState {
  transactions: Transaction[];
  filterType: 'all' | 'income' | 'expense';
  searchQuery: string;
  
  // Actions
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  setFilterType: (type: 'all' | 'income' | 'expense') => void;
  setSearchQuery: (query: string) => void;
  clearTransactions: () => void;
  
  // Selectors (simulated as helper functions for simplicity in v1)
  getFilteredTransactions: () => Transaction[];
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],
      filterType: 'all',
      searchQuery: '',

      addTransaction: (transaction) => 
        set((state) => {
          if (state.transactions.some(t => t.id === transaction.id)) return state;
          const newTransactions = [transaction, ...state.transactions];
          return { 
            transactions: newTransactions.sort((a, b) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            ) 
          };
        }),

      clearTransactions: () => set({ transactions: [] }),

      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions
            .map((t) => (String(t.id) === String(id) ? { ...t, ...updates } : t))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      setFilterType: (type) => set({ filterType: type }),
      
      setSearchQuery: (query) => set({ searchQuery: query }),

      getFilteredTransactions: () => {
        const { transactions, filterType, searchQuery } = get();
        return transactions.filter((t) => {
          const matchesType = filterType === 'all' || t.type === filterType;
          const matchesSearch = 
            t.notes?.toLowerCase().includes(searchQuery.toLowerCase()) || 
            t.category.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesType && matchesSearch;
        });
      },
    }),
    {
      name: 'transaction-storage',
      storage: createJSONStorage(() => mmkvStorage),
      onRehydrateStorage: () => (state) => {
        if (state && state.transactions) {
          state.transactions = state.transactions.map(t => ({
            ...t,
            date: new Date(t.date),
            createdAt: new Date(t.createdAt),
          }));
        }
      }
    }
  )
);
