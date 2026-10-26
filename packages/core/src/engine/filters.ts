import { DEFAULT_CATALOG, type Catalog } from '../data/catalog';
import type {
  AllergenTag,
  DietaryPreference,
  Meal,
  MealSlot,
  UserProfile,
} from '../types';

export class NoSafeMealError extends Error {
  constructor(public readonly slot: MealSlot) {
    super(`No meal for ${slot} satisfies this profile's allergies and exclusions.`);
    this.name = 'NoSafeMealError';
  }
}

export function mealAllergens(meal: Meal, catalog: Catalog = DEFAULT_CATALOG): Set<AllergenTag> {
  const tags = new Set<AllergenTag>();
  for (const line of meal.ingredients) {
    const ingredient = catalog.ingredientsById.get(line.ingredientId);
    ingredient?.allergens.forEach((a) => tags.add(a));
  }
  return tags;
}

interface SafetyOptions {
  ignoreDislikes?: boolean;
}

/** Allergens are a hard rule. Dislikes are soft and can be relaxed as a last resort. */
export function isMealSafe(
  meal: Meal,
  profile: Pick<UserProfile, 'allergens' | 'dislikedIngredientIds'>,
  catalog: Catalog = DEFAULT_CATALOG,
  options: SafetyOptions = {},
): boolean {
  if (profile.allergens.length > 0) {
    const present = mealAllergens(meal, catalog);
    if (profile.allergens.some((a) => present.has(a))) return false;
  }
  if (!options.ignoreDislikes && profile.dislikedIngredientIds.length > 0) {
    const disliked = new Set(profile.dislikedIngredientIds);
    if (meal.ingredients.some((line) => disliked.has(line.ingredientId))) return false;
  }
  return true;
}

/** Diet rules derived from macros so the catalog never needs hand-maintained tags. */
export function matchesDiet(meal: Meal, slot: MealSlot, diet: DietaryPreference): boolean {
  const { calories, proteinG, carbsG, sugarG } = meal.macros;
  switch (diet) {
    case 'no-restrictions':
      return true;
    case 'keto':
      return carbsG <= 15;
    case 'low-sugar':
      return sugarG <= 8;
    case 'weight-loss':
      return calories <= 560;
    case 'fit-fam-high-protein':
      return proteinG >= (slot === 'breakfast' ? 20 : 30);
  }
}

/**
 * Meals for a slot that are safe for the profile. Falls back in this order:
 * 1. safe + diet-compatible + not disliked
 * 2. safe + diet-compatible (dislikes ignored)
 * 3. safe + not disliked (diet ignored)
 * 4. safe (diet and dislikes ignored)
 * Allergens are never relaxed.
 */
export function getCandidates(
  profile: UserProfile,
  slot: MealSlot,
  catalog: Catalog = DEFAULT_CATALOG,
  extraFilter: (meal: Meal) => boolean = () => true,
): Meal[] {
  const forSlot = catalog.meals.filter((m) => m.slots.includes(slot) && extraFilter(m));
  const strict = forSlot.filter((m) => isMealSafe(m, profile, catalog));
  const lenient = forSlot.filter((m) => isMealSafe(m, profile, catalog, { ignoreDislikes: true }));

  const dietOnly = (list: Meal[]) =>
    list.filter((m) => matchesDiet(m, slot, profile.dietaryPreference));

  for (const pool of [dietOnly(strict), dietOnly(lenient), strict, lenient]) {
    if (pool.length > 0) return pool;
  }
  return [];
}
