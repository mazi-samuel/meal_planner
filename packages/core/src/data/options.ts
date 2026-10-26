import type { AllergenTag, DietOption, Ingredient, PrepStyleOption } from '../types';
import { INGREDIENTS } from './ingredients';

export const DIET_OPTIONS: readonly DietOption[] = [
  { id: 'fit-fam-high-protein', label: 'Fit-Fam High-Protein', tagline: 'Gym-bro approved. 30g+ protein on every main.', emoji: '💪' },
  { id: 'keto', label: 'Keto', tagline: 'Low carb, high fat. Efo and turkey over swallow.', emoji: '🥑' },
  { id: 'weight-loss', label: 'Weight-Loss', tagline: 'Lighter plates, still proper Naija flavour.', emoji: '🎯' },
  { id: 'low-sugar', label: 'Low-Sugar', tagline: 'Steady energy. Easy on the dodo and sweet stuff.', emoji: '🍃' },
  { id: 'no-restrictions', label: 'No Restrictions', tagline: 'Give me everything. Jollof included.', emoji: '🍛' },
];

export const PREP_STYLE_OPTIONS: readonly PrepStyleOption[] = [
  { id: 'daily-quick-cook', label: 'Daily Quick Cook', tagline: 'I cook small and fresh most days.', emoji: '🍳' },
  { id: 'sunday-bulk-prep', label: 'Sunday Bulk Prep', tagline: 'Cook once on Sunday, eat all week.', emoji: '📦' },
  { id: 'ready-to-eat-order', label: '100% Ready-to-Eat', tagline: 'No cooking. Order it, eat it.', emoji: '🛵' },
];

export const ALLERGEN_OPTIONS: readonly { id: AllergenTag; label: string }[] = [
  { id: 'fish', label: 'Fish' },
  { id: 'shellfish', label: 'Shellfish & crayfish' },
  { id: 'egg', label: 'Eggs' },
  { id: 'dairy', label: 'Dairy' },
  { id: 'gluten', label: 'Gluten' },
  { id: 'nuts', label: 'Groundnut & nuts' },
  { id: 'legumes', label: 'Beans & legumes' },
];

const DISLIKE_CATEGORIES: readonly Ingredient['category'][] = [
  'proteins',
  'vegetables',
  'tubers',
  'swallow',
  'legumes',
  'fruits',
];

/** Ingredients a user may reasonably say "I don't like this" about. Excludes pantry staples. */
export function getDislikeOptions(): Ingredient[] {
  return INGREDIENTS.filter((i) => DISLIKE_CATEGORIES.includes(i.category));
}
