import { Share, Text, View } from 'react-native';
import {
  formatNaira,
  formatQuantity,
  groceryListToText,
  type GroceryList,
  type MeasureUnit,
} from '@mealplanner/core';
import { Button } from '@/components/ui/Button';

interface GroceryListViewProps {
  list: GroceryList;
  /** Used as the heading of the shared text. */
  shareTitle: string;
}

export function GroceryListView({ list, shareTitle }: GroceryListViewProps) {
  const handleShare = () => {
    Share.share({ message: groceryListToText(list, shareTitle) }).catch(() => {});
  };

  return (
    <View className="gap-4">
      {list.groups.map((group) => (
        <View key={group.category} className="gap-1.5">
          <Text className="text-xs font-bold uppercase tracking-wider text-muted">
            {group.label}
          </Text>
          <View className="overflow-hidden rounded-2xl border border-line bg-card">
            {group.items.map((item, index) => (
              <View
                key={item.ingredientId}
                className={`flex-row items-center justify-between px-4 py-3 ${
                  index > 0 ? 'border-t border-line' : ''
                }`}
              >
                <View className="flex-1 pr-3">
                  <Text className="text-base text-ink">{item.name}</Text>
                  <Text className="text-xs text-muted">
                    {formatQuantity(item.quantity, item.unit as MeasureUnit)}
                    {item.localName ? ` · ${item.localName}` : ''}
                  </Text>
                </View>
                <Text className="text-sm text-muted">{formatNaira(item.estimatedCostNgn)}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}

      <View className="flex-row items-center justify-between rounded-2xl bg-brand-50 px-4 py-3">
        <Text className="text-sm text-brand-800">
          {list.itemCount} items · estimate
        </Text>
        <Text className="text-lg font-bold text-brand-800">
          {formatNaira(list.totalEstimatedNgn)}
        </Text>
      </View>

      <Button label="Share list" icon="📤" variant="secondary" onPress={handleShare} />
    </View>
  );
}
