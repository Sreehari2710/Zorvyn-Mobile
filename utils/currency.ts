/**
 * Formats a number as a currency string (e.g., ₹1,234.56).
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'INR',
  locale: string = 'en-IN'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formats a number as a compact currency string (e.g., ₹1.2L).
 */
export const formatCurrencyCompact = (
  amount: number,
  currency: string = 'INR',
  locale: string = 'en-IN'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
};
