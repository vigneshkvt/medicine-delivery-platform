export const formatCurrency = (value: number, currency = 'INR') => {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
};

export const metresToKilometres = (metres: number) => (metres / 1000).toFixed(1);
