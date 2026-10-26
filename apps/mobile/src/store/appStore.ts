import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { addDays, type MealPlan, type UserProfile } from '@mealplanner/core';
import { createPlan } from '@/services/planService';

interface AppState {
  profile: UserProfile | null;
  plan: MealPlan | null;
  planError: string | null;
  brainDeadMode: boolean;

  saveProfile: (profile: UserProfile, today: string) => void;
  ensureFreshPlan: (today: string) => void;
  shufflePlan: (today: string) => void;
  setBrainDeadMode: (enabled: boolean) => void;
  reset: () => void;
}

function planCoversToday(plan: MealPlan, profile: UserProfile, today: string): boolean {
  const lastDay = addDays(plan.startDate, plan.days.length - 1);
  return plan.profileId === profile.id && plan.startDate <= today && today <= lastDay;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => {
      const regenerate = (profile: UserProfile, today: string, seed?: string) => {
        const result = createPlan(profile, today, seed);
        set(
          result.ok
            ? { plan: result.plan, planError: null }
            : { plan: null, planError: result.message },
        );
      };

      return {
        profile: null,
        plan: null,
        planError: null,
        brainDeadMode: false,

        saveProfile: (profile, today) => {
          set({ profile });
          regenerate(profile, today, `${today}:${profile.updatedAt}`);
        },

        ensureFreshPlan: (today) => {
          const { profile, plan, planError } = get();
          if (!profile) return;
          if (plan && !planError && planCoversToday(plan, profile, today)) return;
          regenerate(profile, today);
        },

        shufflePlan: (today) => {
          const { profile } = get();
          if (profile) regenerate(profile, today, `${today}:${Date.now()}`);
        },

        setBrainDeadMode: (brainDeadMode) => set({ brainDeadMode }),

        reset: () => set({ profile: null, plan: null, planError: null, brainDeadMode: false }),
      };
    },
    {
      name: 'meal-planner-state-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ profile, plan, brainDeadMode }) => ({ profile, plan, brainDeadMode }),
    },
  ),
);
