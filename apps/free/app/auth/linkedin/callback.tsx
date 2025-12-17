import { useEffect, useRef } from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';

export default function LinkedInCallback() {
  const router = useRouter();
  const processedRef = useRef(false);

  useEffect(() => {
    // Prevent double processing in React strict mode or if effect re-runs
    if (processedRef.current) return;
    processedRef.current = true;

    // This handles the redirect from LinkedIn back to the app on Web
    // The WebBrowser.openAuthSessionAsync call in useLinkedInAuth is waiting for this to happen.
    // By calling maybeCompleteAuthSession, we signal to that waiting promise that the flow is done.
    WebBrowser.maybeCompleteAuthSession();

    // After signaling completion, we should probably redirect the user back to the main app flow
    // if the WebBrowser doesn't close the window automatically (which it often doesn't on web mobile).
    // However, on desktop web, openAuthSessionAsync usually opens a popup. 
    // If it was a redirect (not popup), we need to manually navigate back.
    
    // Check if we are inside a popup or separate window
    if (typeof window !== 'undefined' && window.opener) {
       // We are likely in a popup, do nothing and let maybeCompleteAuthSession close it (if configured)
       // or let the parent window handle the result.
    } else {
       // We might be in the main window (redirect flow).
       // Give maybeCompleteAuthSession a moment to work, then redirect home or to settings.
       setTimeout(() => {
         router.replace('/(tabs)/settings'); 
       }, 1500);
    }

  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0077b5" />
      <Text style={styles.text}>Completing login...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000814',
  },
  text: {
    marginTop: 20,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
