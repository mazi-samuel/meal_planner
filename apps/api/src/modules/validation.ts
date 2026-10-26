import {
  ALLERGEN_OPTIONS,
  DEFAULT_CATALOG,
  DIET_OPTIONS,
  MAX_HOUSEHOLD,
  MIN_HOUSEHOLD,
  PREP_STYLE_OPTIONS,
  type AllergenTag,
  type DietaryPreference,
  type OrderMode,
  type PrepStyle,
} from '@mealplanner/core';
import { HttpError } from '../http/router';

type Json = Record<string, unknown>;

function asObject(value: unknown): Json {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new HttpError(400, 'Body must be a JSON object');
  }
  return value as Json;
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], field: string): T {
  if (typeof value === 'string' && (allowed as readonly string[]).includes(value)) return value as T;
  throw new HttpError(400, `"${field}" must be one of: ${allowed.join(', ')}`);
}

function stringArray(value: unknown, field: string): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some((v) => typeof v !== 'string')) {
    throw new HttpError(400, `"${field}" must be an array of strings`);
  }
  return [...new Set(value as string[])];
}

export interface ProfileInput {
  displayName?: string;
  dietaryPreference: DietaryPreference;
  allergens: AllergenTag[];
  dislikedIngredientIds: string[];
  prepStyle: PrepStyle;
  householdSize: number;
}

export function parseProfileInput(body: unknown): ProfileInput {
  const data = asObject(body);

  const allergens = stringArray(data.allergens, 'allergens').map((a) =>
    oneOf(a, ALLERGEN_OPTIONS.map((o) => o.id), 'allergens'),
  );
  const dislikedIngredientIds = stringArray(data.dislikedIngredientIds, 'dislikedIngredientIds');
  for (const id of dislikedIngredientIds) {
    if (!DEFAULT_CATALOG.ingredientsById.has(id)) {
      throw new HttpError(400, `Unknown ingredient "${id}" in dislikedIngredientIds`);
    }
  }

  const householdSize = data.householdSize === undefined ? 1 : data.householdSize;
  if (
    typeof householdSize !== 'number' ||
    !Number.isInteger(householdSize) ||
    householdSize < MIN_HOUSEHOLD ||
    householdSize > MAX_HOUSEHOLD
  ) {
    throw new HttpError(400, `"householdSize" must be an integer between ${MIN_HOUSEHOLD} and ${MAX_HOUSEHOLD}`);
  }

  const displayName = typeof data.displayName === 'string' ? data.displayName.trim().slice(0, 60) : undefined;

  return {
    displayName: displayName || undefined,
    dietaryPreference: oneOf(data.dietaryPreference, DIET_OPTIONS.map((o) => o.id), 'dietaryPreference'),
    allergens,
    dislikedIngredientIds,
    prepStyle: oneOf(data.prepStyle, PREP_STYLE_OPTIONS.map((o) => o.id), 'prepStyle'),
    householdSize,
  };
}

export interface PlanInput {
  startDate: string;
  seed?: string;
  brainDeadMode: boolean;
}

export function parsePlanInput(body: unknown, today: string): PlanInput {
  const data = asObject(body);
  const startDate = data.startDate === undefined ? today : data.startDate;
  if (typeof startDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    throw new HttpError(400, '"startDate" must be formatted YYYY-MM-DD');
  }
  if (data.seed !== undefined && typeof data.seed !== 'string') {
    throw new HttpError(400, '"seed" must be a string');
  }
  if (data.brainDeadMode !== undefined && typeof data.brainDeadMode !== 'boolean') {
    throw new HttpError(400, '"brainDeadMode" must be a boolean');
  }
  return { startDate, seed: data.seed as string | undefined, brainDeadMode: data.brainDeadMode === true };
}

export interface OrderInput {
  mode: OrderMode;
  mealIds: string[];
  servings: number;
  title?: string;
}

export function parseOrderInput(body: unknown): OrderInput {
  const data = asObject(body);
  const mode = oneOf(data.mode, ['ready-to-eat', 'ingredients'] as const, 'mode');
  const mealIds = stringArray(data.mealIds, 'mealIds');
  if (mealIds.length === 0) throw new HttpError(400, '"mealIds" must contain at least one meal id');
  for (const id of mealIds) {
    if (!DEFAULT_CATALOG.meals.some((m) => m.id === id)) throw new HttpError(400, `Unknown meal "${id}"`);
  }
  const servings = data.servings === undefined ? 1 : data.servings;
  if (typeof servings !== 'number' || !Number.isInteger(servings) || servings < 1 || servings > 20) {
    throw new HttpError(400, '"servings" must be an integer between 1 and 20');
  }
  return {
    mode,
    mealIds,
    servings,
    title: typeof data.title === 'string' ? data.title.slice(0, 80) : undefined,
  };
}
