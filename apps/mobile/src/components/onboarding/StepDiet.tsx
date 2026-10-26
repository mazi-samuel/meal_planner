import { View } from 'react-native';
import { DIET_OPTIONS, type DietaryPreference } from '@mealplanner/core';
import { SelectCard } from '@/components/ui/SelectCard';

interface StepDietProps {
  value: DietaryPreference | null;
  onSelect: (diet: DietaryPreference) => void;
}

export function StepDiet({ value, onSelect }: StepDietProps) {
  return (
    <View className="gap-3" accessibilityRole="radiogroup">
      {DIET_OPTIONS.map((option) => (
        <SelectCard
          key={option.id}
          emoji={option.emoji}
          title={option.label}
          subtitle={option.tagline}
          selected={value === option.id}
          onPress={() => onSelect(option.id)}
        />
      ))}
    </View>
  );
}
