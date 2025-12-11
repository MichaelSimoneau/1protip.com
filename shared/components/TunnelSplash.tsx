import React, { useEffect, type ReactNode } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

// Lazily require reanimated so a native/JS mismatch falls back safely.
let Animated: typeof import('react-native-reanimated') | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Animated = require('react-native-reanimated');
} catch (error) {
  console.warn('TunnelSplash: reanimated not available, using static fallback.', error);
}

const { width } = Dimensions.get('window');
const RING_COUNT = 8;

function Ring({ index }: { index: number }) {
  if (!Animated) {
    return null;
  }

  const {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    withSequence,
  } = Animated;

  const size = width * 0.3 + index * 60;
  const delay = index * 100;
  const ringOpacity = useSharedValue(0);
  const ringScale = useSharedValue(0.5);

  useEffect(() => {
    const timer = setTimeout(() => {
      ringOpacity.value = withTiming(0.7 - index * 0.1, { duration: 1000 });
      ringScale.value = withRepeat(
        withSequence(
          withTiming(1.1, {
            duration: 2000 + index * 200,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0.9, {
            duration: 2000 + index * 200,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        true
      );
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, index, ringOpacity, ringScale]);

  const style = useAnimatedStyle(() => ({
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: 3,
    borderColor: '#0066cc',
    position: 'absolute',
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  return <Animated.View style={style} />;
}

export function TunnelSplash() {
  if (!Animated) {
    return (
      <View style={[styles.container, styles.fallback]}>
        <View style={styles.fallbackMark} />
      </View>
    );
  }

  const {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    withSequence,
  } = Animated;

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
  }, [opacity, rotation, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.tunnelContainer}>
        {Array.from({ length: RING_COUNT }, (_, index) => (
          <Ring key={index} index={index} />
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

class SplashErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('TunnelSplash crashed, showing fallback:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={[styles.container, styles.fallback]}>
          <View style={styles.fallbackMark} />
        </View>
      );
    }

    return this.props.children;
  }
}

export function SafeTunnelSplash() {
  return (
    <SplashErrorBoundary>
      <TunnelSplash />
    </SplashErrorBoundary>
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
  fallback: {
    backgroundColor: '#000814',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackMark: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0066cc',
    borderWidth: 4,
    borderColor: '#00ccff',
  },
});
