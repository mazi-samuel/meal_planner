import { Pressable, Text } from 'react-native';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** Visual treatment for the selected state. `danger` is used for allergens. */
  tone?: 'brand' | 'danger';
}

export function Chip({ label, selected, onPress, tone = 'brand' }: ChipProps) {
  const selectedStyle =
    tone === 'danger' ? 'border-danger bg-red-50' : 'border-brand-700 bg-brand-50';
  const selectedText = tone === 'danger' ? 'text-danger' : 'text-brand-800';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      className={`min-h-[44px] justify-center rounded-full border px-4 ${
        selected ? selectedStyle : 'border-line bg-card active:bg-brand-50'
      }`}
    >
      <Text className={`text-sm font-medium ${selected ? selectedText : 'text-ink'}`}>
        {selected ? '✓ ' : ''}
        {label}
      </Text>
    </Pressable>
  );
}
