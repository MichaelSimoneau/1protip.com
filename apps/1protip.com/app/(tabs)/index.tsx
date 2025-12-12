import { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import { TunnelSplash } from '@/components/TunnelSplash';
import { useLinkedInAuth } from '@/features/auth/hooks/useLinkedInAuth';

const SPLASH_DURATION = 3500; // 3000ms animation + 500ms buffer

export default function HomeTab() {
  const { login, getProfile, isLoading, error, profile } = useLinkedInAuth();
  const [checkingSession, setCheckingSession] = useState(true);
  const [splashFinished, setSplashFinished] = useState(false);
  const [sessionValid, setSessionValid] = useState(false);

  // Handle splash timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashFinished(true);
    }, SPLASH_DURATION);

    return () => clearTimeout(timer);
  }, []);

  // Check session in background
  useEffect(() => {
    const checkSession = async () => {
      try {
        const existingProfile = await getProfile();
        if (existingProfile) {
          setSessionValid(true);
        }
      } catch (err) {
        console.error('Error checking session:', err);
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [getProfile]);

  // Handle navigation after splash finishes
  useEffect(() => {
    if (splashFinished && sessionValid) {
      router.replace('/feed');
    }
  }, [splashFinished, sessionValid]);

  // Handle navigation after login interaction
  useEffect(() => {
    if (splashFinished && profile && !checkingSession && !sessionValid) {
      router.replace('/feed');
    }
  }, [profile, checkingSession, splashFinished, sessionValid]);

  const handleLinkedInPress = async () => {
    try {
      await login();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to LinkedIn';
      Alert.alert('Connection Failed', errorMessage, [{ text: 'OK' }]);
    }
  };

  // Brand text component
  const brandText = <Text style={styles.brandText}>#1ProTip</Text>;

  return (
    <View style={styles.container}>
      <TunnelSplash
        onLogoPress={handleLinkedInPress}
        logoLoading={isLoading}
        // Disable logo until splash is finished AND we're done checking session
        // (to avoid clicking while auto-redirect might happen)
        logoDisabled={isLoading || !splashFinished || checkingSession}
        brandText={brandText}
      />
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  brandText: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  errorContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 107, 53, 0.9)',
    padding: 16,
    borderRadius: 12,
    zIndex: 30,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
