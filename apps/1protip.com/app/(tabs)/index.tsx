import { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import { TunnelSplash } from '@/components/TunnelSplash';
import { useLinkedInAuth } from '@/features/auth/hooks/useLinkedInAuth';

export default function HomeTab() {
  const { login, getProfile, isLoading, error, profile } = useLinkedInAuth();
  const [checkingSession, setCheckingSession] = useState(true);

  // Check for existing session/token on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const existingProfile = await getProfile();
        if (existingProfile) {
          // Valid token exists, navigate to feed
          router.replace('/feed');
        } else {
          // No valid session, show LinkedIn logo
          setCheckingSession(false);
        }
      } catch (err) {
        // Error checking session, show LinkedIn logo
        console.error('Error checking session:', err);
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [getProfile, router]);

  // Navigate to feed when profile becomes available after login
  useEffect(() => {
    if (profile && !checkingSession) {
      router.replace('/feed');
    }
  }, [profile, checkingSession, router]);

  const handleLinkedInPress = async () => {
    try {
      await login();
      // After successful login, getProfile is called automatically
      // and profile state is updated, which will trigger navigation via useEffect
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to LinkedIn';
      Alert.alert('Connection Failed', errorMessage, [{ text: 'OK' }]);
    }
  };

  // Show loading while checking session
  if (checkingSession) {
    return (
      <View style={styles.container}>
        <TunnelSplash />
      </View>
    );
  }

  // Brand text component
  const brandText = <Text style={styles.brandText}>#1ProTip</Text>;

  return (
    <View style={styles.container}>
      <TunnelSplash
        onLogoPress={handleLinkedInPress}
        logoLoading={isLoading}
        logoDisabled={isLoading}
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
