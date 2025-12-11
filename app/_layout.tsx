import { Suspense } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner message="Loading..." />}>
        <Stack
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </Suspense>
    </ErrorBoundary>
  );
}
