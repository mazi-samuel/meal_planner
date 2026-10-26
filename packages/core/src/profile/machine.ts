import type {
  AllergenTag,
  DietaryPreference,
  PrepStyle,
  UserProfile,
} from '../types';

/** Ordered onboarding steps. `done` is terminal. */
export const PROFILE_STEPS = ['diet', 'exclusions', 'prepStyle', 'review', 'done'] as const;
export type ProfileStep = (typeof PROFILE_STEPS)[number];

export const MIN_HOUSEHOLD = 1;
export const MAX_HOUSEHOLD = 8;

export interface ProfileFormState {
  step: ProfileStep;
  dietaryPreference: DietaryPreference | null;
  allergens: AllergenTag[];
  dislikedIngredientIds: string[];
  prepStyle: PrepStyle | null;
  householdSize: number;
}

export type ProfileFormEvent =
  | { type: 'SELECT_DIET'; diet: DietaryPreference }
  | { type: 'TOGGLE_ALLERGEN'; allergen: AllergenTag }
  | { type: 'TOGGLE_DISLIKE'; ingredientId: string }
  | { type: 'SELECT_PREP_STYLE'; prepStyle: PrepStyle }
  | { type: 'SET_HOUSEHOLD_SIZE'; size: number }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'SUBMIT' }
  | { type: 'LOAD'; profile: UserProfile };

export const initialProfileFormState: ProfileFormState = {
  step: 'diet',
  dietaryPreference: null,
  allergens: [],
  dislikedIngredientIds: [],
  prepStyle: null,
  householdSize: 1,
};

function toggle<T>(list: readonly T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

/** Whether the current step has everything it needs to move forward. */
export function canAdvance(state: ProfileFormState): boolean {
  switch (state.step) {
    case 'diet':
      return state.dietaryPreference !== null;
    case 'exclusions':
      return true; // Skipping is valid: "no allergies, I eat everything".
    case 'prepStyle':
      return state.prepStyle !== null;
    case 'review':
      return isComplete(state);
    case 'done':
      return false;
  }
}

export function isComplete(state: ProfileFormState): boolean {
  return state.dietaryPreference !== null && state.prepStyle !== null;
}

export function stepIndex(step: ProfileStep): number {
  return PROFILE_STEPS.indexOf(step);
}

/** Pure reducer: every transition is guarded so the UI can never reach an invalid state. */
export function profileFormReducer(
  state: ProfileFormState,
  event: ProfileFormEvent,
): ProfileFormState {
  switch (event.type) {
    case 'SELECT_DIET':
      return state.step === 'diet' ? { ...state, dietaryPreference: event.diet } : state;

    case 'TOGGLE_ALLERGEN':
      return state.step === 'exclusions'
        ? { ...state, allergens: toggle(state.allergens, event.allergen) }
        : state;

    case 'TOGGLE_DISLIKE':
      return state.step === 'exclusions'
        ? { ...state, dislikedIngredientIds: toggle(state.dislikedIngredientIds, event.ingredientId) }
        : state;

    case 'SELECT_PREP_STYLE':
      return state.step === 'prepStyle' ? { ...state, prepStyle: event.prepStyle } : state;

    case 'SET_HOUSEHOLD_SIZE': {
      if (state.step !== 'review') return state;
      const size = Math.min(MAX_HOUSEHOLD, Math.max(MIN_HOUSEHOLD, Math.round(event.size)));
      return { ...state, householdSize: size };
    }

    case 'NEXT': {
      if (!canAdvance(state) || state.step === 'review') return state;
      return { ...state, step: PROFILE_STEPS[stepIndex(state.step) + 1]! };
    }

    case 'BACK': {
      const index = stepIndex(state.step);
      if (index <= 0 || state.step === 'done') return state;
      return { ...state, step: PROFILE_STEPS[index - 1]! };
    }

    case 'SUBMIT':
      return state.step === 'review' && isComplete(state) ? { ...state, step: 'done' } : state;

    case 'LOAD':
      return {
        step: 'diet',
        dietaryPreference: event.profile.dietaryPreference,
        allergens: [...event.profile.allergens],
        dislikedIngredientIds: [...event.profile.dislikedIngredientIds],
        prepStyle: event.profile.prepStyle,
        householdSize: event.profile.householdSize,
      };
  }
}

export interface BuildProfileOptions {
  id: string;
  displayName?: string;
  /** Preserve the original creation time when editing an existing profile. */
  createdAt?: string;
  now?: Date;
}

export function buildUserProfile(
  state: ProfileFormState,
  options: BuildProfileOptions,
): UserProfile {
  if (state.dietaryPreference === null || state.prepStyle === null) {
    throw new Error('Cannot build a profile from an incomplete form.');
  }
  const timestamp = (options.now ?? new Date()).toISOString();
  return {
    id: options.id,
    displayName: options.displayName,
    dietaryPreference: state.dietaryPreference,
    allergens: state.allergens,
    dislikedIngredientIds: state.dislikedIngredientIds,
    prepStyle: state.prepStyle,
    householdSize: state.householdSize,
    createdAt: options.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
}
