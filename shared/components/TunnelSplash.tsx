import { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withSequence,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export function TunnelSplash() {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });

    rotation.value = withRepeat(
      withTiming(360, {
        duration: 20000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, {
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(0.8, {
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const createRingStyle = (index: number) => {
    const size = (width * 0.3) + (index * 60);
    const delay = index * 100;
    const ringOpacity = useSharedValue(0);
    const ringScale = useSharedValue(0.5);

    useEffect(() => {
      setTimeout(() => {
        ringOpacity.value = withTiming(0.7 - (index * 0.1), { duration: 1000 });
        ringScale.value = withRepeat(
          withSequence(
            withTiming(1.1, {
              duration: 2000 + (index * 200),
              easing: Easing.inOut(Easing.ease),
            }),
            withTiming(0.9, {
              duration: 2000 + (index * 200),
              easing: Easing.inOut(Easing.ease),
            })
          ),
          -1,
          true
        );
      }, delay);
    }, []);

    return useAnimatedStyle(() => ({
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: 3,
      borderColor: '#0066cc',
      position: 'absolute',
      transform: [{ scale: ringScale.value }],
      opacity: ringOpacity.value,
    }));
  };

  const rings = Array.from({ length: 8 }, (_, i) => i);
  const ringStyles = rings.map(i => createRingStyle(i));

  return (
    <View style={styles.container}>
      <View style={styles.tunnelContainer}>
        {rings.map((index) => (
          <Animated.View
            key={index}
            style={ringStyles[index]}
          />
        ))}
      </View>

      <Animated.View style={[styles.centerLogo, animatedStyle]}>
        <View style={styles.logoCircle}>
          <View style={styles.logoInner} />
        </View>
      </Animated.View>

      <Animated.View style={[styles.particle, { top: '20%', left: '10%' }]}>
        <View style={styles.particleDot} />
      </Animated.View>
      <Animated.View style={[styles.particle, { top: '60%', right: '15%' }]}>
        <View style={styles.particleDot} />
      </Animated.View>
      <Animated.View style={[styles.particle, { bottom: '30%', left: '20%' }]}>
        <View style={styles.particleDot} />
      </Animated.View>
      <Animated.View style={[styles.particle, { top: '40%', right: '25%' }]}>
        <View style={styles.particleDot} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000814',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  tunnelContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerLogo: {
    zIndex: 10,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#0066cc',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0066cc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 10,
  },
  logoInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#000814',
    borderWidth: 4,
    borderColor: '#00ccff',
  },
  particle: {
    position: 'absolute',
    width: 20,
    height: 20,
  },
  particleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00ccff',
    shadowColor: '#00ccff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
});
