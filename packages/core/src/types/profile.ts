import type { AllergenTag } from './ingredient';

export type DietaryPreference =
  | 'fit-fam-high-protein'
  | 'keto'
  | 'weight-loss'
  | 'low-sugar'
  | 'no-restrictions';

export type PrepStyle =
  | 'daily-quick-cook'
  | 'sunday-bulk-prep'
  | 'ready-to-eat-order';

export interface UserProfile {
  id: string;
  displayName?: string;
  dietaryPreference: DietaryPreference;
  /** Hard exclusions: a meal containing any ingredient with these tags is never suggested. */
  allergens: AllergenTag[];
  /** Soft exclusions: ingredients the user just doesn't like. */
  dislikedIngredientIds: string[];
  prepStyle: PrepStyle;
  /** Number of people the user cooks / orders for. Scales grocery quantities. */
  householdSize: number;
  createdAt: string;
  updatedAt: string;
}

export interface DietOption {
  id: DietaryPreference;
  label: string;
  tagline: string;
  emoji: string;
}

export interface PrepStyleOption {
  id: PrepStyle;
  label: string;
  tagline: string;
  emoji: string;
}
