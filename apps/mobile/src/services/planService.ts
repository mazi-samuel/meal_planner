import {
  NoSafeMealError,
  generateWeeklyPlan,
  type MealPlan,
  type UserProfile,
} from '@mealplanner/core';

export type PlanResult =
  | { ok: true; plan: MealPlan }
  | { ok: false; message: string };

/**
 * Plans are generated on-device so the app works on patchy Lagos data.
 * To move planning server-side, replace the body with a call to
 * `POST /v1/profiles/:id/plans` on apps/api; callers don't change.
 */
export function createPlan(profile: UserProfile, startDate: string, seed?: string): PlanResult {
  try {
    return { ok: true, plan: generateWeeklyPlan({ profile, startDate, seed }) };
  } catch (error) {
    if (error instanceof NoSafeMealError) {
      return {
        ok: false,
        message: 'We could not find safe meals for your allergies. Try removing an exclusion.',
      };
    }
    throw error;
  }
}
