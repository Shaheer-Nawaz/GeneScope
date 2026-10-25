// Number and currency formatting utilities — kept separate from calculation
// so the engine stays pure-number.

export function fmtCurrency(value: number | null, opts?: { currency?: string; scale?: 'units' | 'thousands' | 'millions' | 'billions'; decimals?: number }): string {
  if (value === null || Number.isNaN(value)) return '—';
  const { currency = 'USD', scale = 'millions', decimals } = opts ?? {};
  const divisor = scale === 'units' ? 1 : scale === 'thousands' ? 1_000 : scale === 'millions' ? 1_000_000 : 1_000_000_000;
  const scaled = value / divisor;
  const d = decimals ?? (Math.abs(scaled) >= 100 ? 1 : 2);
  const symbol = currency === 'USD' ? '$' : '';
  const suffix = scale === 'billions' ? 'B' : scale === 'millions' ? 'M' : scale === 'thousands' ? 'K' : '';
  return `${symbol}${scaled.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}${suffix}`;
}

export function fmtNumber(value: number | null, decimals = 2): string {
  if (value === null || Number.isNaN(value)) return '—';
  return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function fmtPct(value: number | null, decimals = 1): string {
  if (value === null || Number.isNaN(value)) return '—';
  return `${(value * 100).toFixed(decimals)}%`;
}

export function fmtMultiple(value: number | null, decimals = 1): string {
  if (value === null || Number.isNaN(value)) return '—';
  return `${value.toFixed(decimals)}×`;
}

export function fmtCompact(value: number | null): string {
  if (value === null || Number.isNaN(value)) return '—';
  return Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}
