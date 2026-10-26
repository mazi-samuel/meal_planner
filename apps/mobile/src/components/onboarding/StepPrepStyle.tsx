import { View } from 'react-native';
import { PREP_STYLE_OPTIONS, type PrepStyle } from '@mealplanner/core';
import { SelectCard } from '@/components/ui/SelectCard';

interface StepPrepStyleProps {
  value: PrepStyle | null;
  onSelect: (style: PrepStyle) => void;
}

export function StepPrepStyle({ value, onSelect }: StepPrepStyleProps) {
  return (
    <View className="gap-3" accessibilityRole="radiogroup">
      {PREP_STYLE_OPTIONS.map((option) => (
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
