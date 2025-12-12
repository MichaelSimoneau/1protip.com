import { Suspense } from 'react';
import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ErrorBoundary>
      <Head>
        <meta charSet="utf-8" />
        <title>#1ProTip</title>
        <meta name="description" content="The best pro tips, crowdsourced and collected in one place. Share yours at #1ProTip!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://1protip.com/" />
        <meta property="og:title" content="#1ProTip" />
        <meta
          property="og:description"
          content="The best pro tips, crowdsourced and collected in one place. Share yours at #1ProTip!"
        />
        <meta property="og:image" content="https://1protip.com/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://1protip.com/" />
        <meta name="twitter:title" content="#1ProTip" />
        <meta
          name="twitter:description"
          content="The best pro tips, crowdsourced and collected in one place. Share yours at #1ProTip!"
        />
        <meta name="twitter:image" content="https://1protip.com/logo.png" />
      </Head>
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
