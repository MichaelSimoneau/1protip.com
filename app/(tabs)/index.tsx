import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { TunnelSplash } from '@/shared/components/TunnelSplash';

export default function HomeTab() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(tabs)/feed');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <TunnelSplash />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
