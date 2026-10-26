import { useMemo } from 'react';
import { Text } from 'react-native';
import { buildOrderIntent, type MealPlan, type MealServing } from '@mealplanner/core';
import { ChowdeckOrderButton } from '@/components/order/ChowdeckOrderButton';
import { GroceryListView } from '@/components/order/GroceryListView';
import { SheetModal } from '@/components/ui/SheetModal';

interface WeekGroceriesSheetProps {
  visible: boolean;
  plan: MealPlan;
  householdSize: number;
  onClose: () => void;
}

export function WeekGroceriesSheet({ visible, plan, householdSize, onClose }: WeekGroceriesSheetProps) {
  const intent = useMemo(() => {
    const servings: MealServing[] = plan.days.flatMap((day) =>
      Object.values(day.meals).map((planned) => ({ meal: planned.meal, servings: householdSize })),
    );
    return buildOrderIntent({ mode: 'ingredients', servings, title: "This week's groceries" });
  }, [plan, householdSize]);

  return (
    <SheetModal
      visible={visible}
      onClose={onClose}
      title="🛒 This week's groceries"
      footer={<ChowdeckOrderButton intent={intent} />}
    >
      <Text className="text-sm text-muted">
        Everything for 7 days, {householdSize} {householdSize === 1 ? 'person' : 'people'}. Quantities are rounded up to what you can actually buy.
      </Text>
      {intent.groceryList ? (
        <GroceryListView list={intent.groceryList} shareTitle="Weekly groceries" />
      ) : null}
    </SheetModal>
  );
}
