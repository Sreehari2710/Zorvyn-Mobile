import { palette, spacing, typography, radius, elevation } from './tokens';

export const lightTheme = {
  dark: false,
  colors: {
    primary: palette.brand.primary,
    background: palette.neutral[50],
    surface: palette.neutral.white,
    text: palette.neutral[900],
    textSecondary: palette.neutral[700],
    textMuted: palette.neutral[500],
    border: palette.neutral[300],
    subtle: palette.neutral[100],
    
    income: palette.semantic.income,
    incomeBg: palette.semantic.incomeBg,
    expense: palette.semantic.expense,
    expenseBg: palette.semantic.expenseBg,
    warning: palette.semantic.warning,
    warningBg: palette.semantic.warningBg,
    destructive: palette.semantic.destructive,
    success: palette.semantic.success,
    neutral: palette.neutral,
  },
  spacing,
  typography,
  radius,
  elevation,
};

export const darkTheme: Theme = {
  dark: true,
  colors: {
    primary: palette.brand.primary,
    background: palette.neutral.darkBg,
    surface: palette.neutral.darkSurface,
    text: palette.neutral[50],
    textSecondary: palette.neutral[300],
    textMuted: palette.neutral[500],
    border: palette.neutral.darkBorder,
    subtle: palette.neutral.darkSurface,
    
    income: palette.semantic.income,
    incomeBg: '#1E2A5E', 
    expense: palette.semantic.expense,
    expenseBg: '#3F1616', 
    warning: palette.semantic.warning,
    warningBg: '#3F2D16', 
    destructive: palette.semantic.destructive,
    success: palette.semantic.success,
    neutral: palette.neutral,
  },
  spacing,
  typography,
  radius,
  elevation,
};


export type Theme = typeof lightTheme & {
  colors: {
    neutral: typeof palette.neutral;
  }
};
