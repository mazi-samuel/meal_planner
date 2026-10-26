export type IngredientCategory =
  | 'tubers'
  | 'grains'
  | 'swallow'
  | 'proteins'
  | 'legumes'
  | 'vegetables'
  | 'fruits'
  | 'oils'
  | 'bakery'
  | 'pantry';

export type AllergenTag =
  | 'fish'
  | 'shellfish'
  | 'egg'
  | 'dairy'
  | 'gluten'
  | 'nuts'
  | 'legumes';

export type MeasureUnit =
  | 'kg'
  | 'L'
  | 'piece'
  | 'bunch'
  | 'pack'
  | 'tin'
  | 'sachet'
  | 'loaf'
  | 'cup';

export interface Ingredient {
  id: string;
  name: string;
  /** Yoruba / Pidgin name shown alongside the English one where it helps. */
  localName?: string;
  category: IngredientCategory;
  /** The unit all quantities for this ingredient are expressed in. */
  unit: MeasureUnit;
  /** Rough Lagos market price per `unit`, in naira. Used for estimates only. */
  unitPriceNgn: number;
  allergens: AllergenTag[];
  /** Search term used when deep-linking to Chowdeck. */
  chowdeckQuery: string;
}

export interface RecipeIngredient {
  ingredientId: string;
  /** Quantity for ONE serving, in the ingredient's own unit. */
  quantity: number;
}
