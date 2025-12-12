import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { TunnelSplash } from '@/components/TunnelSplash';

export default function HomeTab() {
  useEffect(() => {
    const timer = setTimeout(() => {
      useRouter().replace('/feed');
    }, 2500);

    return () => {
      clearTimeout(timer);
    };
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
