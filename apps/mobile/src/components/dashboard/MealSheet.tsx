import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  buildOrderIntent,
  defaultOrderMode,
  type Meal,
  type OrderMode,
  type PrepStyle,
} from '@mealplanner/core';
import { ChowdeckOrderButton } from '@/components/order/ChowdeckOrderButton';
import { GroceryListView } from '@/components/order/GroceryListView';
import { SheetModal } from '@/components/ui/SheetModal';

interface MealSheetProps {
  meal: Meal | null;
  prepStyle: PrepStyle;
  householdSize: number;
  onClose: () => void;
}

const MODES: { id: OrderMode; label: string }[] = [
  { id: 'ready-to-eat', label: 'Ready-made' },
  { id: 'ingredients', label: 'Ingredients' },
];

export function MealSheet({ meal, prepStyle, householdSize, onClose }: MealSheetProps) {
  const [mode, setMode] = useState<OrderMode>(defaultOrderMode(prepStyle));

  // Re-default whenever a different meal is opened.
  useEffect(() => {
    setMode(defaultOrderMode(prepStyle));
  }, [meal?.id, prepStyle]);

  const intent = useMemo(
    () =>
      meal
        ? buildOrderIntent({ mode, servings: [{ meal, servings: householdSize }] })
        : null,
    [meal, mode, householdSize],
  );

  return (
    <SheetModal
      visible={meal !== null}
      onClose={onClose}
      title={meal ? `${meal.emoji} ${meal.name}` : ''}
      footer={intent ? <ChowdeckOrderButton intent={intent} /> : null}
    >
      {meal && intent ? (
        <>
          <Text className="text-base text-muted">{meal.description}</Text>

          <View className="flex-row gap-2">
            <Stat label="Time" value={`${meal.prepMinutes} min`} />
            <Stat label="Calories" value={`~${meal.macros.calories}`} />
            <Stat label="Protein" value={`${meal.macros.proteinG}g`} />
            <Stat label="Carbs" value={`${meal.macros.carbsG}g`} />
          </View>

          <View
            className="flex-row rounded-2xl bg-line/60 p-1"
            accessibilityRole="tablist"
          >
            {MODES.map((option) => {
              const selected = option.id === mode;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => setMode(option.id)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                  className={`min-h-[44px] flex-1 items-center justify-center rounded-xl ${
                    selected ? 'bg-card' : ''
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${selected ? 'text-ink' : 'text-muted'}`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {intent.mode === 'ingredients' && intent.groceryList ? (
            <>
              <Text className="text-sm text-muted">
                Ingredients for {householdSize} {householdSize === 1 ? 'person' : 'people'}
              </Text>
              <GroceryListView list={intent.groceryList} shareTitle={`${meal.name} groceries`} />
              <View className="gap-2">
                <Text className="text-xs font-bold uppercase tracking-wider text-muted">
                  How to make it
                </Text>
                {meal.steps.map((step, index) => (
                  <View key={index} className="flex-row gap-3">
                    <Text className="w-5 text-base font-bold text-brand-700">{index + 1}</Text>
                    <Text className="flex-1 text-base text-ink">{step}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View className="rounded-2xl border border-line bg-card p-4">
              <Text className="text-base text-ink">
                Skip the cooking. We'll search Chowdeck for{' '}
                <Text className="font-bold">{meal.chowdeckQuery}</Text> from vendors near you.
              </Text>
            </View>
          )}
        </>
      ) : null}
    </SheetModal>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 items-center rounded-2xl border border-line bg-card py-3">
      <Text className="text-base font-bold text-ink">{value}</Text>
      <Text className="text-xs text-muted">{label}</Text>
    </View>
  );
}
