import { formatCurrency, formatCurrencyCompact } from '../utils/currency';

describe('Currency Utilities', () => {
  test('formatCurrency should format correctly for INR', () => {
    // Note: Intl formatting results can sometimes have non-breaking spaces or different characters 
    // depending on the environment, so we check for the numeric part and currency symbol existence.
    const result = formatCurrency(1234);
    expect(result).toContain('1,234');
    expect(result).toContain('₹');
  });

  test('formatCurrency should handle zero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
  });

  test('formatCurrencyCompact should format lakhs/thousands', () => {
    // en-IN compact notation: 1200000 -> 12L, 1000 -> 1K
    const result = formatCurrencyCompact(1200000);
    expect(result).toContain('12');
    expect(result).toContain('L');
  });

  test('formatCurrencyCompact should handle small numbers without suffix', () => {
    const result = formatCurrencyCompact(500);
    expect(result).toContain('500');
  });
});
