import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { ChowdeckOrderIntent } from '@mealplanner/core';
import { openChowdeck } from '@/services/chowdeckLinking';

interface ChowdeckOrderButtonProps {
  intent: ChowdeckOrderIntent;
  onOpened?: (via: 'app' | 'web') => void;
}

export function ChowdeckOrderButton({ intent, onOpened }: ChowdeckOrderButtonProps) {
  const [busy, setBusy] = useState(false);

  const hint =
    intent.mode === 'ready-to-eat'
      ? `Searches Chowdeck for "${intent.title}"`
      : 'Opens Chowdeck Groceries. Your list is above.';

  const handlePress = async () => {
    if (busy) return;
    setBusy(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      const result = await openChowdeck(intent);
      if (result.ok) {
        onOpened?.(result.via);
      } else {
        Alert.alert(
          'Could not open Chowdeck',
          'Check your connection or install the Chowdeck app, then try again.',
        );
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="gap-1.5">
      <Pressable
        onPress={handlePress}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel="Order via Chowdeck"
        accessibilityHint={hint}
        accessibilityState={{ disabled: busy, busy }}
        className={`min-h-[56px] flex-row items-center justify-center gap-2 rounded-2xl bg-accent-500 px-5 active:bg-accent-600 ${
          busy ? 'opacity-60' : ''
        }`}
      >
        <Text className="text-xl">🛵</Text>
        <Text className="text-base font-bold text-ink">
          {busy ? 'Opening Chowdeck…' : 'Order via Chowdeck'}
        </Text>
      </Pressable>
      <Text className="text-center text-xs text-muted">{hint}</Text>
    </View>
  );
}
