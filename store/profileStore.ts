import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from './storage';

export type CurrencyOption = {
  code: string;
  symbol: string;
  locale: string;
  label: string;
};

export const CURRENCIES: CurrencyOption[] = [
  { code: 'INR', symbol: '₹', locale: 'en-IN', label: 'Indian Rupee (₹)' },
  { code: 'USD', symbol: '$', locale: 'en-US', label: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', locale: 'en-DE', label: 'Euro (€)' },
  { code: 'GBP', symbol: '£', locale: 'en-GB', label: 'British Pound (£)' },
];

interface ProfileState {
  name: string;
  hasLaunched: boolean;
  currencyCode: string;
  currencyLocale: string;

  // Actions
  setName: (name: string) => void;
  setHasLaunched: (val: boolean) => void;
  setCurrency: (code: string, locale: string) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      name: '',
      hasLaunched: false,
      currencyCode: 'INR',
      currencyLocale: 'en-IN',

      setName: (name) => set({ name }),
      setHasLaunched: (val) => set({ hasLaunched: val }),
      setCurrency: (code, locale) => set({ currencyCode: code, currencyLocale: locale }),
    }),
    {
      name: 'profile-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
