import { DEFAULT_CATALOG, type Catalog } from '../data/catalog';
import { addDays } from '../lib/dates';
import { createRng } from '../lib/rng';
import {
  MEAL_SLOTS,
  type DayPlan,
  type Meal,
  type MealPlan,
  type MealSlot,
  type PlannedMeal,
  type UserProfile,
} from '../types';
import { NoSafeMealError, getCandidates } from './filters';

export interface GeneratePlanInput {
  profile: UserProfile;
  /** First day of the plan, `YYYY-MM-DD`. */
  startDate: string;
  /** Number of days to plan. Defaults to 7. */
  days?: number;
  /** Changes the shuffle without changing the profile. Defaults to the start date. */
  seed?: string;
}

const MAX_BATCH_RUN = 3;

interface ScoreContext {
  profile: UserProfile;
  slot: MealSlot;
  previousDays: DayPlan[];
  todaysMealIds: Set<string>;
  rng: () => number;
}

function runLength(previousDays: DayPlan[], slot: MealSlot, mealId: string): number {
  let run = 0;
  for (let i = previousDays.length - 1; i >= 0; i--) {
    if (previousDays[i]!.meals[slot].meal.id !== mealId) break;
    run++;
  }
  return run;
}

function recentlyUsed(previousDays: DayPlan[], mealId: string, window: number): boolean {
  return previousDays
    .slice(-window)
    .some((day) => MEAL_SLOTS.some((slot) => day.meals[slot].meal.id === mealId));
}

function scoreMeal(meal: Meal, ctx: ScoreContext): number {
  const { profile, slot, previousDays, todaysMealIds, rng } = ctx;
  let score = rng() * 2;

  if (todaysMealIds.has(meal.id)) score -= 10;

  const isMain = slot !== 'breakfast';
  const batching = profile.prepStyle === 'sunday-bulk-prep' && isMain && meal.bulkPrepFriendly;
  const run = runLength(previousDays, slot, meal.id);

  switch (profile.prepStyle) {
    case 'daily-quick-cook':
      if (meal.prepMinutes <= 30) score += 1;
      if (meal.effort === 'involved') score -= 1.5;
      break;
    case 'sunday-bulk-prep':
      if (batching) score += 1.5;
      break;
    case 'ready-to-eat-order':
      // Restaurant-style dishes are easier to order than cooking hacks.
      if (meal.effort === 'involved') score += 1;
      if (meal.effort === 'brain-dead') score -= 1;
      break;
  }

  if (batching) {
    // Cook once, eat a few days in a row, then rotate.
    if (run > 0 && run < MAX_BATCH_RUN) score += 3;
    if (run >= MAX_BATCH_RUN) score -= 10;
  } else if (recentlyUsed(previousDays, meal.id, 2)) {
    score -= 3;
  }

  return score;
}

function pickMeal(profile: UserProfile, slot: MealSlot, catalog: Catalog, ctx: Omit<ScoreContext, 'profile' | 'slot'>): Meal {
  const candidates = getCandidates(profile, slot, catalog);
  if (candidates.length === 0) throw new NoSafeMealError(slot);

  let best = candidates[0]!;
  let bestScore = -Infinity;
  for (const meal of candidates) {
    const score = scoreMeal(meal, { ...ctx, profile, slot });
    if (score > bestScore) {
      best = meal;
      bestScore = score;
    }
  }
  return best;
}

/**
 * Deterministic for a given (profile, startDate, seed), so a plan can be
 * regenerated on any device or server and match.
 */
export function generateWeeklyPlan(
  input: GeneratePlanInput,
  catalog: Catalog = DEFAULT_CATALOG,
): MealPlan {
  const { profile, startDate, days = 7, seed = startDate } = input;
  const rng = createRng(`${profile.id}:${profile.dietaryPreference}:${seed}`);
  const planned: DayPlan[] = [];

  for (let offset = 0; offset < days; offset++) {
    const todaysMealIds = new Set<string>();
    const meals = {} as Record<MealSlot, PlannedMeal>;

    for (const slot of MEAL_SLOTS) {
      const meal = pickMeal(profile, slot, catalog, {
        previousDays: planned,
        todaysMealIds,
        rng,
      });
      todaysMealIds.add(meal.id);
      meals[slot] = { slot, meal, swappedForLowEffort: false };
    }

    planned.push({ date: addDays(startDate, offset), meals });
  }

  return {
    id: `${profile.id}:${startDate}:${seed}`,
    profileId: profile.id,
    prepStyle: profile.prepStyle,
    startDate,
    generatedAt: new Date().toISOString(),
    lowEffort: false,
    days: planned,
  };
}
