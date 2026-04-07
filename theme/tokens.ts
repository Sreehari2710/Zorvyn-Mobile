/**
 * Design Tokens - Single Source of Truth for Zorvyn Finance
 * Based on design doc.md
 */

export const palette = {
  brand: {
    primary: '#4F6EF7',
    primaryLight: '#EEF1FE',
    primaryDark: '#3A55D4',
  },
  semantic: {
    income: '#22C55E',
    incomeBg: '#F0FDF4',
    expense: '#EF4444',
    expenseBg: '#FFF5F5',
    warning: '#F59E0B',
    warningBg: '#FFFBEB',
    success: '#22C55E',
    destructive: '#DC2626',
  },
  neutral: {
    900: '#0F172A',
    700: '#334155',
    500: '#64748B',
    300: '#CBD5E1',
    100: '#F1F5F9',
    50: '#F8FAFC',
    white: '#FFFFFF',
    // Rich Dark Blue Scale
    darkBg: '#050A1A',
    darkSurface: '#0D152D',
    darkBorder: '#1E2A4A',
  },
};


export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  horizontal: 20,
};

export const typography = {
  display: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  heading1: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  heading2: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  heading3: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  overline: {
    fontSize: 11,
    fontWeight: '600' as const,
    lineHeight: 14,
    textTransform: 'uppercase' as const,
  },
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const elevation = {
  0: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  3: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 8,
  },
};

import { 
  Utensils, 
  Bus, 
  ShoppingBag, 
  Tv, 
  Heart, 
  Home, 
  Zap, 
  DollarSign, 
  Briefcase, 
  MoreHorizontal,
  LucideIcon
} from 'lucide-react-native';

export const categoryConfig: Record<string, { bg: string; text: string; icon: LucideIcon }> = {
  'Food & Dining': { bg: '#FFF7ED', text: '#C2410C', icon: Utensils },
  Transport: { bg: '#EFF6FF', text: '#1D4ED8', icon: Bus },
  Shopping: { bg: '#FDF4FF', text: '#7E22CE', icon: ShoppingBag },
  Entertainment: { bg: '#FFF1F2', text: '#BE123C', icon: Tv },
  Health: { bg: '#F0FDF4', text: '#15803D', icon: Heart },
  Housing: { bg: '#F0F9FF', text: '#0369A1', icon: Home },
  Utilities: { bg: '#FAFAF9', text: '#44403C', icon: Zap },
  Salary: { bg: '#F0FDF4', text: '#166534', icon: DollarSign },
  Freelance: { bg: '#ECFDF5', text: '#065F46', icon: Briefcase },
  Other: { bg: '#F8FAFC', text: '#475569', icon: MoreHorizontal },
};

