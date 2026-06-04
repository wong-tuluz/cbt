// src/composables/useCurrency.ts

export function useCurrency() {
  /**
   * Format number to Indonesian Rupiah currency
   * @param amount - Number to format
   * @returns Formatted currency string (e.g., "Rp 1.000.000")
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  /**
   * Parse currency string to number
   * @param value - Currency string to parse
   * @returns Parsed number
   */
  const parseCurrency = (value: string): number => {
    return parseFloat(value.replace(/[^0-9]/g, '')) || 0;
  };

  /**
   * Format number with thousand separators
   * @param amount - Number to format
   * @returns Formatted number string (e.g., "1.000.000")
   */
  const formatNumber = (amount: number): string => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  return {
    formatCurrency,
    parseCurrency,
    formatNumber
  };
}