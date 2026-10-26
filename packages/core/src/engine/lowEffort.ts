import { DEFAULT_CATALOG, type Catalog } from '../data/catalog';
import { hashString } from '../lib/rng';
import {
  MEAL_SLOTS,
  type DayPlan,
  type Meal,
  type MealPlan,
  type MealSlot,
  type PlannedMeal,
  type UserProfile,
} from '../types';
import { getCandidates } from './filters';

function closestLowEffort(
  original: Meal,
  slot: MealSlot,
  profile: UserProfile,
  catalog: Catalog,
  usedToday: Set<string>,
  yesterdayMealId: string | undefined,
): Meal | undefined {
  const pool = getCandidates(profile, slot, catalog, (m) => m.effort === 'brain-dead');
  const fresh = pool.filter((m) => !usedToday.has(m.id));
  const options = fresh.length > 0 ? fresh : pool;
  if (options.length === 0) return undefined;

  const score = (m: Meal) =>
    Math.abs(m.macros.calories - original.macros.calories) / 100 +
    (m.id === yesterdayMealId ? 1.5 : 0) +
    // Stable tie-break so the swap never flickers between renders.
    (hashString(`${original.id}:${m.id}`) % 100) / 1000;

  return options.reduce((best, m) => (score(m) < score(best) ? m : best));
}

/**
 * Brain-Dead Mode: replaces every meal that needs real cooking with the
 * closest-calorie option that takes <= 20 minutes, while still honouring
 * allergies, dislikes and the chosen diet. Pure and synchronous so the UI
 * toggle is instant, even offline.
 */
export function applyBrainDeadMode(
  plan: MealPlan,
  profile: UserProfile,
  catalog: Catalog = DEFAULT_CATALOG,
): MealPlan {
  if (plan.lowEffort) return plan;

  const days: DayPlan[] = plan.days.map((day, index) => {
    const usedToday = new Set<string>(
      MEAL_SLOTS.filter((s) => day.meals[s].meal.effort === 'brain-dead').map(
        (s) => day.meals[s].meal.id,
      ),
    );
    const previous = plan.days[index - 1];
    const meals = {} as Record<MealSlot, PlannedMeal>;

    for (const slot of MEAL_SLOTS) {
      const current = day.meals[slot];
      if (current.meal.effort === 'brain-dead') {
        meals[slot] = current;
        continue;
      }
      const replacement = closestLowEffort(
        current.meal,
        slot,
        profile,
        catalog,
        usedToday,
        previous?.meals[slot].meal.id,
      );
      if (!replacement) {
        meals[slot] = current;
        continue;
      }
      usedToday.add(replacement.id);
      meals[slot] = {
        slot,
        meal: replacement,
        swappedForLowEffort: true,
        originalMealId: current.meal.id,
      };
    }

    return { date: day.date, meals };
  });

  return { ...plan, lowEffort: true, days };
}
