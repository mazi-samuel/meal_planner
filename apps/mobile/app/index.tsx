import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useHydrated } from '@/hooks/useHydrated';
import { colors } from '@/lib/colors';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { useAppStore } from '@/store/appStore';

export default function Index() {
  const hydrated = useHydrated();
  const hasProfile = useAppStore((s) => s.profile !== null);

  if (!hydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color={colors.brand700} />
      </View>
    );
  }

  if (!hasProfile) return <Redirect href="/onboarding" />;
  return <DashboardScreen />;
}
