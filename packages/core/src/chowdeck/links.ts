import { DEFAULT_CATALOG, type Catalog } from '../data/catalog';
import { buildGroceryList } from '../engine/grocery';
import type {
  ChowdeckOrderIntent,
  Meal,
  MealServing,
  OrderMode,
  PrepStyle,
} from '../types';

/**
 * Single source of truth for Chowdeck URLs. If Chowdeck publishes a different
 * scheme or web path, this is the only place to change.
 */
export const CHOWDECK_CONFIG = {
  nativeScheme: 'chowdeck://',
  webBase: 'https://chowdeck.com',
  searchPath: 'search',
  groceriesPath: 'groceries',
} as const;

/** `"Efo Riro" -> "Efo+Riro"` (form-style encoding, matching `chowdeck://search?query=Efo+Riro`). */
export function encodeSearchQuery(query: string): string {
  return encodeURIComponent(query.trim()).replace(/%20/g, '+');
}

export interface ChowdeckLinks {
  nativeUrl: string;
  webUrl: string;
}

export function buildSearchLinks(query: string): ChowdeckLinks {
  const q = encodeSearchQuery(query);
  const { nativeScheme, webBase, searchPath } = CHOWDECK_CONFIG;
  return {
    nativeUrl: `${nativeScheme}${searchPath}?query=${q}`,
    webUrl: `${webBase}/${searchPath}?query=${q}`,
  };
}

export function buildGroceryLinks(): ChowdeckLinks {
  const { nativeScheme, webBase, groceriesPath } = CHOWDECK_CONFIG;
  return {
    nativeUrl: `${nativeScheme}${groceriesPath}`,
    webUrl: `${webBase}/${groceriesPath}`,
  };
}

/** Ready-to-eat and bulk-prep users order finished food; everyone else shops for ingredients. */
export function defaultOrderMode(prepStyle: PrepStyle): OrderMode {
  return prepStyle === 'ready-to-eat-order' ? 'ready-to-eat' : 'ingredients';
}

export function buildReadyToEatIntent(meal: Meal): ChowdeckOrderIntent {
  return {
    mode: 'ready-to-eat',
    title: meal.name,
    ...buildSearchLinks(meal.chowdeckQuery),
  };
}

export function buildIngredientsIntent(
  servings: readonly MealServing[],
  title: string,
  catalog: Catalog = DEFAULT_CATALOG,
): ChowdeckOrderIntent {
  return {
    mode: 'ingredients',
    title,
    ...buildGroceryLinks(),
    groceryList: buildGroceryList(servings, catalog),
  };
}

export interface BuildOrderIntentInput {
  mode: OrderMode;
  servings: readonly MealServing[];
  /** Overrides the default title (the meal name, or "Groceries"). */
  title?: string;
}

export function buildOrderIntent(
  input: BuildOrderIntentInput,
  catalog: Catalog = DEFAULT_CATALOG,
): ChowdeckOrderIntent {
  const { mode, servings, title } = input;
  if (servings.length === 0) throw new Error('Cannot build a Chowdeck order with no meals.');

  if (mode === 'ready-to-eat') {
    const intent = buildReadyToEatIntent(servings[0]!.meal);
    return title ? { ...intent, title } : intent;
  }
  const defaultTitle = servings.length === 1 ? servings[0]!.meal.name : 'Groceries';
  return buildIngredientsIntent(servings, title ?? defaultTitle, catalog);
}
