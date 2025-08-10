import { formatCurrency, getCurrencySymbol } from "@shared/currencies";

export function useCurrency() {
  return {
    formatCurrency,
    getCurrencySymbol,
  };
}