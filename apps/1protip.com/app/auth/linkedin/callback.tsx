import { useEffect } from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

export default function LinkedInCallback() {
  useEffect(() => {
    // This handles the redirect from LinkedIn back to the app on Web
    WebBrowser.maybeCompleteAuthSession();
  }, []);

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

