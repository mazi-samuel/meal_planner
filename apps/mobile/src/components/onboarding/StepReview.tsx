import { Pressable, Text, View } from 'react-native';
import {
  ALLERGEN_OPTIONS,
  DEFAULT_CATALOG,
  DIET_OPTIONS,
  MAX_HOUSEHOLD,
  MIN_HOUSEHOLD,
  PREP_STYLE_OPTIONS,
  type ProfileFormState,
} from '@mealplanner/core';

interface StepReviewProps {
  state: ProfileFormState;
  onHouseholdChange: (size: number) => void;
}

export function StepReview({ state, onHouseholdChange }: StepReviewProps) {
  const diet = DIET_OPTIONS.find((o) => o.id === state.dietaryPreference);
  const prep = PREP_STYLE_OPTIONS.find((o) => o.id === state.prepStyle);
  const allergenLabels = ALLERGEN_OPTIONS.filter((o) => state.allergens.includes(o.id)).map(
    (o) => o.label,
  );
  const dislikeLabels = state.dislikedIngredientIds.map(
    (id) => DEFAULT_CATALOG.ingredientsById.get(id)?.name ?? id,
  );

  return (
    <View className="gap-3">
      <Row label="Eating style" value={diet ? `${diet.emoji} ${diet.label}` : '-'} />
      <Row label="Prep style" value={prep ? `${prep.emoji} ${prep.label}` : '-'} />
      <Row label="Allergies" value={allergenLabels.length ? allergenLabels.join(', ') : 'None'} />
      <Row label="Dislikes" value={dislikeLabels.length ? dislikeLabels.join(', ') : 'None'} />

      <View className="flex-row items-center justify-between rounded-2xl border border-line bg-card p-4">
        <View>
          <Text className="text-base font-semibold text-ink">Cooking for</Text>
          <Text className="text-sm text-muted">Scales your grocery lists</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <Stepper
            label="Fewer people"
            glyph="−"
            disabled={state.householdSize <= MIN_HOUSEHOLD}
            onPress={() => onHouseholdChange(state.householdSize - 1)}
          />
          <Text
            className="w-8 text-center text-xl font-bold text-ink"
            accessibilityLabel={`${state.householdSize} people`}
          >
            {state.householdSize}
          </Text>
          <Stepper
            label="More people"
            glyph="+"
            disabled={state.householdSize >= MAX_HOUSEHOLD}
            onPress={() => onHouseholdChange(state.householdSize + 1)}
          />
        </View>
      </View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="rounded-2xl border border-line bg-card p-4">
      <Text className="text-xs font-bold uppercase tracking-wider text-muted">{label}</Text>
      <Text className="mt-1 text-base text-ink">{value}</Text>
    </View>
  );
}

interface StepperProps {
  label: string;
  glyph: string;
  disabled: boolean;
  onPress: () => void;
}

function Stepper({ label, glyph, disabled, onPress }: StepperProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      className={`h-11 w-11 items-center justify-center rounded-full bg-brand-50 active:bg-brand-100 ${
        disabled ? 'opacity-40' : ''
      }`}
    >
      <Text className="text-xl font-bold text-brand-700">{glyph}</Text>
    </Pressable>
  );
}
