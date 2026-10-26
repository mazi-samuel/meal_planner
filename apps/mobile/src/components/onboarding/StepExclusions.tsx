import { useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { ALLERGEN_OPTIONS, getDislikeOptions, type AllergenTag } from '@mealplanner/core';
import { Chip } from '@/components/ui/Chip';

interface StepExclusionsProps {
  allergens: AllergenTag[];
  dislikedIngredientIds: string[];
  onToggleAllergen: (allergen: AllergenTag) => void;
  onToggleDislike: (ingredientId: string) => void;
}

export function StepExclusions({
  allergens,
  dislikedIngredientIds,
  onToggleAllergen,
  onToggleDislike,
}: StepExclusionsProps) {
  const [query, setQuery] = useState('');
  const options = useMemo(() => getDislikeOptions(), []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.name.toLowerCase().includes(q) || o.localName?.toLowerCase().includes(q),
    );
  }, [options, query]);

  return (
    <View className="gap-6">
      <View className="gap-3">
        <Text className="text-base font-bold text-ink">Allergies</Text>
        <Text className="-mt-2 text-sm text-muted">
          We will never suggest a meal containing these.
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {ALLERGEN_OPTIONS.map((option) => (
            <Chip
              key={option.id}
              label={option.label}
              tone="danger"
              selected={allergens.includes(option.id)}
              onPress={() => onToggleAllergen(option.id)}
            />
          ))}
        </View>
      </View>

      <View className="gap-3">
        <Text className="text-base font-bold text-ink">Foods you dislike</Text>
        <Text className="-mt-2 text-sm text-muted">
          We will avoid these whenever there is an alternative.
        </Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search ponmo, plantain, okra…"
          placeholderTextColor="#A8A29E"
          autoCorrect={false}
          accessibilityLabel="Search ingredients"
          className="min-h-[48px] rounded-2xl border border-line bg-card px-4 text-base text-ink"
        />
        <View className="flex-row flex-wrap gap-2">
          {visible.map((ingredient) => (
            <Chip
              key={ingredient.id}
              label={ingredient.name}
              selected={dislikedIngredientIds.includes(ingredient.id)}
              onPress={() => onToggleDislike(ingredient.id)}
            />
          ))}
          {visible.length === 0 ? (
            <Text className="text-sm text-muted">No ingredient matches "{query}".</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}
