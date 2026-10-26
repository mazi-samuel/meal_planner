import { useMemo } from 'react';
import { applyBrainDeadMode, type MealPlan } from '@mealplanner/core';
import { useAppStore } from '@/store/appStore';

/**
 * Both variants of the plan are computed up front, so flipping Brain-Dead Mode
 * is a pointer swap rather than a recomputation.
 */
export function useActivePlan(): { plan: MealPlan | null; brainDeadMode: boolean } {
  const profile = useAppStore((s) => s.profile);
  const plan = useAppStore((s) => s.plan);
  const brainDeadMode = useAppStore((s) => s.brainDeadMode);

  const lowEffortPlan = useMemo(
    () => (profile && plan ? applyBrainDeadMode(plan, profile) : null),
    [profile, plan],
  );

  return { plan: brainDeadMode ? lowEffortPlan : plan, brainDeadMode };
}
