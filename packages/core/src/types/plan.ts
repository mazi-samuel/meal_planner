import type { Meal, MealSlot } from './meal';
import type { PrepStyle } from './profile';

export interface PlannedMeal {
  slot: MealSlot;
  meal: Meal;
  /** True when Brain-Dead Mode replaced a more involved meal. */
  swappedForLowEffort: boolean;
  /** The meal that was replaced, when `swappedForLowEffort` is true. */
  originalMealId?: string;
}

export interface DayPlan {
  /** Local calendar date, `YYYY-MM-DD`. */
  date: string;
  meals: Record<MealSlot, PlannedMeal>;
}

export interface MealPlan {
  id: string;
  profileId: string;
  prepStyle: PrepStyle;
  /** First day covered by the plan, `YYYY-MM-DD`. */
  startDate: string;
  generatedAt: string;
  lowEffort: boolean;
  days: DayPlan[];
}

export interface MealServing {
  meal: Meal;
  servings: number;
}

export interface GroceryItem {
  ingredientId: string;
  name: string;
  localName?: string;
  /** Rounded up to something you can actually buy. */
  quantity: number;
  unit: string;
  estimatedCostNgn: number;
  chowdeckQuery: string;
}

export interface GroceryGroup {
  category: string;
  label: string;
  items: GroceryItem[];
}

export interface GroceryList {
  groups: GroceryGroup[];
  itemCount: number;
  totalEstimatedNgn: number;
}
