import '../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FAF6EF' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" options={{ presentation: 'modal' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
