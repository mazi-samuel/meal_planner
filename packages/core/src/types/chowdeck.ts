import type { GroceryList } from './plan';

/**
 * ready-to-eat: search Chowdeck for the finished dish / a nearby vendor.
 * ingredients:  open Chowdeck Groceries with the shopping list in hand.
 */
export type OrderMode = 'ready-to-eat' | 'ingredients';

export interface ChowdeckOrderIntent {
  mode: OrderMode;
  title: string;
  /** Custom-scheme link that opens the installed Chowdeck app. */
  nativeUrl: string;
  /** HTTPS link used when the app is not installed. */
  webUrl: string;
  /** Present only for `ingredients` intents. */
  groceryList?: GroceryList;
}
