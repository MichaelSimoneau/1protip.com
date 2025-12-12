import { View, Text, StyleSheet } from 'react-native';

export default function ScreenAL() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Screen AL (Left Hidden)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e6f0ff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066cc',
  },
});

