export interface CurrencyOption { code: string; symbol: string; label: string; locale: string; after?: boolean; decimals: number }

export const CURRENCIES: CurrencyOption[] = [
  { code: 'AOA', symbol: 'Kz', label: 'Kwanza (Kz)', locale: 'pt-AO', after: true, decimals: 0 },
  { code: 'EUR', symbol: '€', label: 'Euro (€)', locale: 'pt-PT', after: true, decimals: 2 },
  { code: 'USD', symbol: '$', label: 'Dólar americano ($)', locale: 'en-US', decimals: 2 },
  { code: 'BRL', symbol: 'R$', label: 'Real brasileiro (R$)', locale: 'pt-BR', decimals: 2 },
  { code: 'GBP', symbol: '£', label: 'Libra (£)', locale: 'en-GB', decimals: 2 },
  { code: 'MZN', symbol: 'MT', label: 'Metical (MT)', locale: 'pt-MZ', after: true, decimals: 2 },
  { code: 'CVE', symbol: 'Esc', label: 'Escudo cabo-verdiano', locale: 'pt-CV', after: true, decimals: 0 },
  { code: 'ZAR', symbol: 'R', label: 'Rand (R)', locale: 'en-ZA', decimals: 2 },
  { code: 'XOF', symbol: 'CFA', label: 'Franco CFA', locale: 'fr-FR', after: true, decimals: 0 },
  { code: 'NGN', symbol: '₦', label: 'Naira (₦)', locale: 'en-NG', decimals: 0 },
  { code: 'CHF', symbol: 'CHF', label: 'Franco suíço', locale: 'de-CH', decimals: 2 },
  { code: 'CAD', symbol: 'C$', label: 'Dólar canadiano', locale: 'en-CA', decimals: 2 },
  { code: 'AED', symbol: 'AED', label: 'Dirham', locale: 'en-AE', decimals: 2 },
  { code: 'JPY', symbol: '¥', label: 'Iene (¥)', locale: 'ja-JP', decimals: 0 },
  { code: 'CNY', symbol: '¥', label: 'Yuan', locale: 'zh-CN', decimals: 2 },
];

export function formatPrice(amount: number, code: string = 'AOA'): string {
  const c = CURRENCIES.find((x) => x.code === code) || CURRENCIES[0];
  const n = Number(amount) || 0;
  const hasCents = Math.round(n * 100) % 100 !== 0;
  const num = new Intl.NumberFormat(c.locale, { minimumFractionDigits: hasCents ? Math.min(2, c.decimals || 2) : 0, maximumFractionDigits: Math.max(c.decimals, hasCents ? 2 : 0) }).format(n);
  return c.after ? `${num} ${c.symbol}` : `${c.symbol} ${num}`;
}
