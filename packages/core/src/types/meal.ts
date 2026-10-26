import type { RecipeIngredient } from './ingredient';

export type MealSlot = 'breakfast' | 'lunch' | 'dinner';

export const MEAL_SLOTS: readonly MealSlot[] = ['breakfast', 'lunch', 'dinner'];

/**
 * brain-dead: <= 20 minutes, 3 steps or fewer, almost no decisions.
 * easy:       <= 40 minutes of mostly straightforward cooking.
 * involved:   real cooking, usually worth batching on a Sunday.
 */
export type EffortLevel = 'brain-dead' | 'easy' | 'involved';

export interface Macros {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  sugarG: number;
}

export interface Meal {
  id: string;
  name: string;
  emoji: string;
  description: string;
  slots: MealSlot[];
  /** Ingredients for ONE serving. */
  ingredients: RecipeIngredient[];
  /** Approximate per-serving macros. */
  macros: Macros;
  prepMinutes: number;
  effort: EffortLevel;
  /** True when the dish keeps well for several days (good Sunday-prep candidate). */
  bulkPrepFriendly: boolean;
  steps: string[];
  /** Dish name searched on Chowdeck when ordering ready-made. */
  chowdeckQuery: string;
}
