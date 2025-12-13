import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable, Text, ActivityIndicator, Platform } from 'react-native';

// Lazily require reanimated for safe fallback
let Animated: typeof import('react-native-reanimated').default;
let useSharedValue: typeof import('react-native-reanimated').useSharedValue;
let withTiming: typeof import('react-native-reanimated').withTiming;
let withRepeat: typeof import('react-native-reanimated').withRepeat;
let withSequence: typeof import('react-native-reanimated').withSequence;
let useAnimatedStyle: typeof import('react-native-reanimated').useAnimatedStyle;
let Easing: typeof import('react-native-reanimated').Easing;

try {
  const reanimated = require('react-native-reanimated');
  Animated = reanimated.default;
  useSharedValue = reanimated.useSharedValue;
  withTiming = reanimated.withTiming;
  withRepeat = reanimated.withRepeat;
  withSequence = reanimated.withSequence;
  useAnimatedStyle = reanimated.useAnimatedStyle;
  Easing = reanimated.Easing;
} catch {
  Animated = undefined as never;
  useSharedValue = undefined as never;
  withTiming = undefined as never;
  withRepeat = undefined as never;
  withSequence = undefined as never;
  useAnimatedStyle = undefined as never;
  Easing = undefined as never;
}

const LINKEDIN_BLUE = '#0077b5';
const LINKEDIN_BLUE_DARK = '#005885';

interface LinkedInLogoButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  size?: number;
}

// Static fallback component (no reanimated)
function StaticLinkedInLogoButton({
  onPress,
  isLoading = false,
  disabled = false,
  size = 160,
}: LinkedInLogoButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || isLoading}
      style={({ pressed }) => [
        styles.container,
        { width: size, height: size },
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.logoContainer,
          {
            width: size,
            height: size,
            borderRadius: size * 0.15,
            backgroundColor: LINKEDIN_BLUE,
          },
        ]}
      >
        <Text style={[styles.logoText, { fontSize: size * 0.4 }]}>in</Text>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        )}
      </View>
    </Pressable>
  );
}

// Animated component (with reanimated)
function AnimatedLinkedInLogoButton({
  onPress,
  isLoading = false,
  disabled = false,
  size = 160,
}: LinkedInLogoButtonProps) {
  const pulseScale = useSharedValue!(1);
  const shadowOpacity = useSharedValue!(0.8);
  const brightness = useSharedValue!(1);
  const glowIntensity = useSharedValue!(0.6);

  useEffect(() => {

    if (isLoading || disabled) {
      pulseScale.value = 1;
      shadowOpacity.value = 0.8;
      brightness.value = 1;
      glowIntensity.value = 0.6;
      return;
    }

    // Dramatic multi-pulse glimmer effect
    // Scale animation - more dramatic (1.0 to 1.18)
    pulseScale.value = withRepeat!(
      withSequence!(
        withTiming!(1.18, {
          duration: 1200,
          easing: Easing!.inOut(Easing!.ease),
        }),
        withTiming!(1, {
          duration: 1200,
          easing: Easing!.inOut(Easing!.ease),
        })
      ),
      -1,
      true
    );

    // Shadow opacity - dramatic range (0.4 to 1.3)
    shadowOpacity.value = withRepeat!(
      withSequence!(
        withTiming!(1.3, {
          duration: 1400,
          easing: Easing!.inOut(Easing!.ease),
        }),
        withTiming!(0.4, {
          duration: 1400,
          easing: Easing!.inOut(Easing!.ease),
        })
      ),
      -1,
      true
    );

    // Brightness/opacity overlay effect (glimmer)
    brightness.value = withRepeat!(
      withSequence!(
        withTiming!(1.3, {
          duration: 1000,
          easing: Easing!.inOut(Easing!.ease),
        }),
        withTiming!(0.9, {
          duration: 1000,
          easing: Easing!.inOut(Easing!.ease),
        })
      ),
      -1,
      true
    );

    // Glow intensity - offset timing for layered effect
    glowIntensity.value = withRepeat!(
      withSequence!(
        withTiming!(1.2, {
          duration: 1100,
          easing: Easing!.inOut(Easing!.ease),
        }),
        withTiming!(0.5, {
          duration: 1100,
          easing: Easing!.inOut(Easing!.ease),
        })
      ),
      -1,
      true
    );
  }, [isLoading, disabled, pulseScale, shadowOpacity, brightness, glowIntensity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value as number }],
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    shadowOpacity: shadowOpacity.value as number,
    opacity: brightness.value as number,
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowIntensity.value as number,
  }));

  // TypeScript knows Animated exists here because we only render this component when it does
  const AnimatedView = Animated!.View;
  
  return (
    <AnimatedView style={[styles.container, animatedStyle]}>
      <Pressable
        onPress={onPress}
        disabled={disabled || isLoading}
        style={({ pressed }) => [
          styles.pressable,
          pressed && styles.pressed,
        ]}
      >
        {/* Glow layer for glimmer effect */}
        <AnimatedView
          style={[
            styles.glowLayer,
            {
              width: size * 1.2,
              height: size * 1.2,
              borderRadius: size * 0.18,
            },
            glowAnimatedStyle,
          ]}
        />
        <AnimatedView
          style={[
            styles.logoContainer,
            {
              width: size,
              height: size,
              borderRadius: size * 0.15,
              backgroundColor: LINKEDIN_BLUE,
            },
            logoAnimatedStyle,
          ]}
        >
          <Text style={[styles.logoText, { fontSize: size * 0.4 }]}>in</Text>
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          )}
        </AnimatedView>
      </Pressable>
    </AnimatedView>
  );
}

// Main export - conditionally renders animated or static version
export function LinkedInLogoButton(props: LinkedInLogoButtonProps) {
  // Check if reanimated is available before rendering
  // This check happens at render time, not inside hooks
  if (Platform.OS === 'web' || !Animated || !useSharedValue || !useAnimatedStyle) {
    return <StaticLinkedInLogoButton {...props} />;
  }
  return <AnimatedLinkedInLogoButton {...props} />;
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressable: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 30,
    shadowColor: LINKEDIN_BLUE,
    elevation: 12,
    // Embossed effect
    borderWidth: 2,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    borderLeftColor: 'rgba(255, 255, 255, 0.3)',
    borderRightColor: 'rgba(0, 0, 0, 0.2)',
    borderBottomColor: 'rgba(0, 0, 0, 0.2)',
  },
  glowLayer: {
    position: 'absolute',
    backgroundColor: LINKEDIN_BLUE,
    shadowColor: LINKEDIN_BLUE,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 40,
    shadowOpacity: 0.8,
    elevation: 15,
  },
  logoText: {
    color: '#ffffff',
    fontWeight: '700',
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif-medium',
      default: 'Arial',
    }),
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 119, 181, 0.7)',
    borderRadius: 24,
  },
  pressed: {
    opacity: 0.8,
  },
});
