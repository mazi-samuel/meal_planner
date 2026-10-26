import type { Ingredient, Meal } from '../types';
import { INGREDIENTS } from './ingredients';
import { MEALS } from './meals';

export interface Catalog {
  meals: readonly Meal[];
  ingredients: readonly Ingredient[];
  ingredientsById: ReadonlyMap<string, Ingredient>;
}

/** Builds a catalog and fails fast if any recipe references an unknown ingredient. */
export function createCatalog(
  meals: readonly Meal[],
  ingredients: readonly Ingredient[],
): Catalog {
  const ingredientsById = new Map(ingredients.map((i) => [i.id, i]));
  for (const meal of meals) {
    for (const line of meal.ingredients) {
      if (!ingredientsById.has(line.ingredientId)) {
        throw new Error(
          `Meal "${meal.id}" references unknown ingredient "${line.ingredientId}"`,
        );
      }
    }
  }
  return { meals, ingredients, ingredientsById };
}

export const DEFAULT_CATALOG: Catalog = createCatalog(MEALS, INGREDIENTS);

export function getMealById(
  mealId: string,
  catalog: Catalog = DEFAULT_CATALOG,
): Meal | undefined {
  return catalog.meals.find((m) => m.id === mealId);
}
