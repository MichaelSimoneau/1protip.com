import { View, Text, StyleSheet } from 'react-native';
import { TAB_BAR_HEIGHT } from './(tabs)/_layout';

export default function ScreenAR() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Screen AR (Right Hidden)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    left: 0,
    right: 0,
    top: 0,
    bottom: TAB_BAR_HEIGHT,
    overflow: 'hidden',
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

