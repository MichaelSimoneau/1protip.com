import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeTunnelSplash } from '@/shared/components/TunnelSplash';

export default function HomeTab() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/feed');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <SafeTunnelSplash />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
