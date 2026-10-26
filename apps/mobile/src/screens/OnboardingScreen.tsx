import { useEffect, useReducer } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  PROFILE_STEPS,
  buildUserProfile,
  canAdvance,
  initialProfileFormState,
  profileFormReducer,
  stepIndex,
  toLocalIsoDate,
  type ProfileFormState,
  type ProfileStep,
} from '@mealplanner/core';
import { StepDiet } from '@/components/onboarding/StepDiet';
import { StepExclusions } from '@/components/onboarding/StepExclusions';
import { StepPrepStyle } from '@/components/onboarding/StepPrepStyle';
import { StepReview } from '@/components/onboarding/StepReview';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { createLocalId } from '@/lib/id';
import { useAppStore } from '@/store/appStore';

const STEP_COPY: Record<Exclude<ProfileStep, 'done'>, { title: string; subtitle: string }> = {
  diet: {
    title: 'How do you like to eat?',
    subtitle: 'Pick the one that fits your goals. You can change it anytime.',
  },
  exclusions: {
    title: 'Anything we should avoid?',
    subtitle: 'Skip this if you eat everything.',
  },
  prepStyle: {
    title: 'How do you handle cooking?',
    subtitle: 'This decides whether we send you to Chowdeck for food or groceries.',
  },
  review: {
    title: 'Looks good?',
    subtitle: 'Your first week of meals is one tap away.',
  },
};

// Steps shown in the progress bar (everything except the terminal state).
const VISIBLE_STEPS = PROFILE_STEPS.filter((s) => s !== 'done');

function initFromProfile(existing: ReturnType<typeof useAppStore.getState>['profile']): ProfileFormState {
  return existing
    ? profileFormReducer(initialProfileFormState, { type: 'LOAD', profile: existing })
    : initialProfileFormState;
}

export function OnboardingScreen() {
  const router = useRouter();
  const existing = useAppStore((s) => s.profile);
  const saveProfile = useAppStore((s) => s.saveProfile);

  const [state, dispatch] = useReducer(profileFormReducer, existing, initFromProfile);

  useEffect(() => {
    if (state.step !== 'done') return;
    const profile = buildUserProfile(state, {
      id: existing?.id ?? createLocalId(),
      displayName: existing?.displayName,
      createdAt: existing?.createdAt,
    });
    saveProfile(profile, toLocalIsoDate(new Date()));
    router.replace('/');
    // Runs once when the machine reaches its terminal state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.step]);

  if (state.step === 'done') return <Screen><View /></Screen>;

  const copy = STEP_COPY[state.step];
  const index = stepIndex(state.step);
  const isFirst = index === 0;
  const isReview = state.step === 'review';

  return (
    <Screen>
      <View className="gap-4 px-5 pt-4">
        <View
          className="flex-row gap-1.5"
          accessibilityRole="progressbar"
          accessibilityLabel={`Step ${index + 1} of ${VISIBLE_STEPS.length}`}
        >
          {VISIBLE_STEPS.map((step, i) => (
            <View
              key={step}
              className={`h-1.5 flex-1 rounded-full ${i <= index ? 'bg-brand-700' : 'bg-line'}`}
            />
          ))}
        </View>
        <View className="gap-1">
          <Text className="text-3xl font-extrabold text-ink">{copy.title}</Text>
          <Text className="text-base text-muted">{copy.subtitle}</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-6 pt-5"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {state.step === 'diet' ? (
          <StepDiet
            value={state.dietaryPreference}
            onSelect={(diet) => dispatch({ type: 'SELECT_DIET', diet })}
          />
        ) : null}
        {state.step === 'exclusions' ? (
          <StepExclusions
            allergens={state.allergens}
            dislikedIngredientIds={state.dislikedIngredientIds}
            onToggleAllergen={(allergen) => dispatch({ type: 'TOGGLE_ALLERGEN', allergen })}
            onToggleDislike={(ingredientId) => dispatch({ type: 'TOGGLE_DISLIKE', ingredientId })}
          />
        ) : null}
        {state.step === 'prepStyle' ? (
          <StepPrepStyle
            value={state.prepStyle}
            onSelect={(prepStyle) => dispatch({ type: 'SELECT_PREP_STYLE', prepStyle })}
          />
        ) : null}
        {isReview ? (
          <StepReview
            state={state}
            onHouseholdChange={(size) => dispatch({ type: 'SET_HOUSEHOLD_SIZE', size })}
          />
        ) : null}
      </ScrollView>

      <View className="flex-row gap-3 border-t border-line bg-surface px-5 pb-2 pt-3">
        {!isFirst ? (
          <Button
            label="Back"
            variant="secondary"
            onPress={() => dispatch({ type: 'BACK' })}
            className="flex-1"
          />
        ) : existing ? (
          <Button
            label="Cancel"
            variant="secondary"
            onPress={() => router.back()}
            className="flex-1"
          />
        ) : null}
        <Button
          label={isReview ? 'Build my week' : 'Continue'}
          onPress={() => dispatch({ type: isReview ? 'SUBMIT' : 'NEXT' })}
          disabled={!canAdvance(state)}
          className="flex-[2]"
        />
      </View>
    </Screen>
  );
}
