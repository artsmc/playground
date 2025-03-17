export const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

export const formatCurrency = (value: string | number) => {
  return currencyFormatter.format(Number(value));
};

export const formatDate = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

export const formatObject = (value: unknown) => {
  if (typeof value !== 'object') return '';
  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
};

export const isDateColumn = (columnKey: string) => columnKey.toLowerCase().includes('date');
export const isCurrencyColumn = (columnKey: string) => {
  const lowerKey = columnKey.toLowerCase();
  return lowerKey.includes('price') || lowerKey.includes('amount');
};
