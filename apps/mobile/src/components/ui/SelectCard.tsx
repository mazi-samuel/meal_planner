import { Pressable, Text, View } from 'react-native';

interface SelectCardProps {
  emoji: string;
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
}

export function SelectCard({ emoji, title, subtitle, selected, onPress }: SelectCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${title}. ${subtitle}`}
      className={`flex-row items-center gap-4 rounded-2xl border-2 p-4 ${
        selected ? 'border-brand-700 bg-brand-50' : 'border-line bg-card active:bg-brand-50'
      }`}
    >
      <Text className="text-3xl">{emoji}</Text>
      <View className="flex-1">
        <Text className="text-base font-semibold text-ink">{title}</Text>
        <Text className="mt-0.5 text-sm text-muted">{subtitle}</Text>
      </View>
      <View
        className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
          selected ? 'border-brand-700 bg-brand-700' : 'border-line'
        }`}
      >
        {selected ? <Text className="text-xs font-bold text-white">✓</Text> : null}
      </View>
    </Pressable>
  );
}
