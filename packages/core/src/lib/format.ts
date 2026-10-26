import type { MeasureUnit } from '../types';

const COUNTABLE: ReadonlySet<MeasureUnit> = new Set([
  'piece',
  'bunch',
  'pack',
  'tin',
  'sachet',
  'loaf',
  'cup',
]);

export function isCountable(unit: MeasureUnit): boolean {
  return COUNTABLE.has(unit);
}

const PLURALS: Record<string, string> = {
  piece: 'pieces',
  bunch: 'bunches',
  pack: 'packs',
  tin: 'tins',
  sachet: 'sachets',
  loaf: 'loaves',
  cup: 'cups',
};

/** Human-friendly quantity, e.g. `0.3 kg -> "300 g"`, `2 tin -> "2 tins"`. */
export function formatQuantity(quantity: number, unit: MeasureUnit): string {
  if (unit === 'kg') {
    return quantity < 1 ? `${Math.round(quantity * 1000)} g` : `${trim(quantity)} kg`;
  }
  if (unit === 'L') {
    return quantity < 1 ? `${Math.round(quantity * 1000)} ml` : `${trim(quantity)} L`;
  }
  const label = quantity === 1 ? unit : (PLURALS[unit] ?? unit);
  return `${trim(quantity)} ${label}`;
}

function trim(n: number): string {
  return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(2)));
}

export function formatNaira(amount: number): string {
  const rounded = Math.round(amount / 50) * 50;
  return `₦${rounded.toLocaleString('en-NG')}`;
}
