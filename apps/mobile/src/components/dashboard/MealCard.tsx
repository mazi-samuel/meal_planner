import { Pressable, Text, View } from 'react-native';
import type { EffortLevel, MealSlot, PlannedMeal } from '@mealplanner/core';

const SLOT_LABEL: Record<MealSlot, { title: string; emoji: string }> = {
  breakfast: { title: 'Breakfast', emoji: '🌅' },
  lunch: { title: 'Lunch', emoji: '☀️' },
  dinner: { title: 'Dinner', emoji: '🌙' },
};

const EFFORT_LABEL: Record<EffortLevel, string> = {
  'brain-dead': 'No-brainer',
  easy: 'Easy',
  involved: 'Proper cooking',
};

const EFFORT_STYLE: Record<EffortLevel, string> = {
  'brain-dead': 'bg-night-50 text-night-800',
  easy: 'bg-brand-50 text-brand-800',
  involved: 'bg-accent-50 text-accent-600',
};

interface MealCardProps {
  planned: PlannedMeal;
  onPress: () => void;
}

export function MealCard({ planned, onPress }: MealCardProps) {
  const { slot, meal, swappedForLowEffort } = planned;
  const { title, emoji } = SLOT_LABEL[slot];
  const [effortBg, effortText] = EFFORT_STYLE[meal.effort].split(' ');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${meal.name}, ${meal.prepMinutes} minutes`}
      accessibilityHint="Opens meal details and ordering"
      className="gap-3 rounded-3xl border border-line bg-card p-4 active:bg-brand-50"
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-bold uppercase tracking-wider text-muted">
          {emoji} {title}
        </Text>
        {swappedForLowEffort ? (
          <View className="rounded-full bg-night-800 px-2.5 py-1">
            <Text className="text-xs font-semibold text-white">⚡ Easy swap</Text>
          </View>
        ) : null}
      </View>

      <View className="flex-row items-center gap-3">
        <Text className="text-4xl">{meal.emoji}</Text>
        <View className="flex-1">
          <Text className="text-lg font-bold text-ink" numberOfLines={2}>
            {meal.name}
          </Text>
          <Text className="mt-0.5 text-sm text-muted" numberOfLines={2}>
            {meal.description}
          </Text>
        </View>
      </View>

      <View className="flex-row flex-wrap items-center gap-2">
        <View className="rounded-full bg-surface px-2.5 py-1">
          <Text className="text-xs font-medium text-ink">⏱ {meal.prepMinutes} min</Text>
        </View>
        <View className={`rounded-full px-2.5 py-1 ${effortBg}`}>
          <Text className={`text-xs font-medium ${effortText}`}>{EFFORT_LABEL[meal.effort]}</Text>
        </View>
        <Text className="text-xs text-muted">
          ~{meal.macros.calories} kcal · {meal.macros.proteinG}g protein
        </Text>
      </View>
    </Pressable>
  );
}
