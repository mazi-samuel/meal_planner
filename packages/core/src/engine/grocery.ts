import { CATEGORY_LABELS, CATEGORY_ORDER } from '../data/ingredients';
import { DEFAULT_CATALOG, type Catalog } from '../data/catalog';
import { formatQuantity, isCountable } from '../lib/format';
import type {
  GroceryGroup,
  GroceryItem,
  GroceryList,
  Ingredient,
  MealServing,
} from '../types';

const STEP_BY_UNIT: Partial<Record<Ingredient['unit'], number>> = {
  kg: 0.1,
  L: 0.25,
};

/** Rounds a needed amount up to something that can be bought at a market or on Chowdeck. */
function purchasableQuantity(needed: number, unit: Ingredient['unit']): number {
  if (isCountable(unit)) return Math.max(1, Math.ceil(needed - 1e-9));
  const step = STEP_BY_UNIT[unit] ?? 0.1;
  return Number((Math.ceil(needed / step - 1e-9) * step).toFixed(2));
}

export function buildGroceryList(
  servings: readonly MealServing[],
  catalog: Catalog = DEFAULT_CATALOG,
): GroceryList {
  const needed = new Map<string, number>();
  for (const { meal, servings: count } of servings) {
    for (const line of meal.ingredients) {
      needed.set(line.ingredientId, (needed.get(line.ingredientId) ?? 0) + line.quantity * count);
    }
  }

  const byCategory = new Map<Ingredient['category'], GroceryItem[]>();
  let totalEstimatedNgn = 0;
  let itemCount = 0;

  for (const [ingredientId, amount] of needed) {
    const ingredient = catalog.ingredientsById.get(ingredientId);
    if (!ingredient) continue;

    const quantity = purchasableQuantity(amount, ingredient.unit);
    const estimatedCostNgn = Math.round(quantity * ingredient.unitPriceNgn);
    const item: GroceryItem = {
      ingredientId,
      name: ingredient.name,
      localName: ingredient.localName,
      quantity,
      unit: ingredient.unit,
      estimatedCostNgn,
      chowdeckQuery: ingredient.chowdeckQuery,
    };

    const bucket = byCategory.get(ingredient.category) ?? [];
    bucket.push(item);
    byCategory.set(ingredient.category, bucket);
    totalEstimatedNgn += estimatedCostNgn;
    itemCount++;
  }

  const groups: GroceryGroup[] = CATEGORY_ORDER.filter((c) => byCategory.has(c)).map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    items: byCategory.get(category)!.sort((a, b) => a.name.localeCompare(b.name)),
  }));

  return { groups, itemCount, totalEstimatedNgn };
}

/** Plain-text version of a list, suitable for the native share sheet. */
export function groceryListToText(list: GroceryList, title: string): string {
  const lines = [title, ''];
  for (const group of list.groups) {
    lines.push(group.label.toUpperCase());
    for (const item of group.items) {
      lines.push(`- ${formatQuantity(item.quantity, item.unit as Ingredient['unit'])} ${item.name}`);
    }
    lines.push('');
  }
  return lines.join('\n').trimEnd();
}
