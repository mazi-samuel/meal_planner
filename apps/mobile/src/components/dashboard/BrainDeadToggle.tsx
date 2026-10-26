import { Switch, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/lib/colors';

interface BrainDeadToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  swappedCount: number;
}

export function BrainDeadToggle({ value, onChange, swappedCount }: BrainDeadToggleProps) {
  const handleChange = (next: boolean) => {
    Haptics.selectionAsync().catch(() => {});
    onChange(next);
  };

  return (
    <View
      className={`flex-row items-center gap-4 rounded-3xl p-4 ${
        value ? 'bg-night-800' : 'border border-line bg-card'
      }`}
    >
      <Text className="text-3xl">{value ? '🧠' : '⚡'}</Text>
      <View className="flex-1">
        <Text className={`text-base font-bold ${value ? 'text-white' : 'text-ink'}`}>
          Brain-Dead Mode
        </Text>
        <Text className={`mt-0.5 text-sm ${value ? 'text-night-100' : 'text-muted'}`}>
          {value
            ? swappedCount > 0
              ? `${swappedCount} meal${swappedCount === 1 ? '' : 's'} swapped for 20-minute options.`
              : 'Every meal today is already low effort.'
            : 'Too tired to think? Swap in no-stress meals.'}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={handleChange}
        trackColor={{ false: colors.line, true: colors.brand500 }}
        thumbColor={colors.white}
        ios_backgroundColor={colors.line}
        accessibilityLabel="Brain-Dead Mode"
        accessibilityHint="Replaces complex meals with quick, low-effort ones"
      />
    </View>
  );
}
