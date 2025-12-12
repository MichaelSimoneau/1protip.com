import * as React from 'react';
import { useEffect, type ReactNode } from 'react';
import { View, StyleSheet, Dimensions, Platform, Text } from 'react-native';
import { LinkedInLogoButton } from './LinkedInLogoButton';

// Lazily require reanimated so a native/JS mismatch falls back safely.
let Animated: typeof import('react-native-reanimated').default;
let Easing: typeof import('react-native-reanimated').Easing;
let useSharedValue: typeof import('react-native-reanimated').useSharedValue;
let withTiming: typeof import('react-native-reanimated').withTiming;
let withRepeat: typeof import('react-native-reanimated').withRepeat;
let withSequence: typeof import('react-native-reanimated').withSequence;
let useAnimatedStyle: typeof import('react-native-reanimated').useAnimatedStyle;

try {
  // Reanimated may not be available in some environments (like web)
  // so we use a try-catch to avoid crashes.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const reanimated = require('react-native-reanimated');
  Animated = reanimated.default;
  Easing = reanimated.Easing;
  useSharedValue = reanimated.useSharedValue;
  withTiming = reanimated.withTiming;
  withRepeat = reanimated.withRepeat;
  withSequence = reanimated.withSequence;
  useAnimatedStyle = reanimated.useAnimatedStyle;
} catch (e) {
  Animated = undefined as never;
  Easing = undefined as never;
  useSharedValue = undefined as never;
  withTiming = undefined as never;
  withRepeat = undefined as never;
  withSequence = undefined as never;
  useAnimatedStyle = undefined as never;
}

const { width, height } = Dimensions.get('window');
const SQUARE_COUNT = 9; // 8 border squares + 1 filled logo square
const LINKEDIN_BLUE = '#0077b5';
const INITIAL_SIZE = 40;
const FINAL_SIZE = Math.max(width, height) * 1.5; // Larger than screen
const LOGO_FINAL_SIZE = 160; // Final size for the logo square
const ANIMATION_DURATION = 1500; // 1.5 seconds per square
const DELAY_BETWEEN_SQUARES = 375; // ~3 seconds total for 8 squares

type TunnelSplashProps = {
  onLogoPress?: () => void;
  logoLoading?: boolean;
  logoDisabled?: boolean;
  brandText?: ReactNode;
};

type RoundedSquareProps = {
  index: number;
  isFilled?: boolean;
  showLogoText?: boolean;
  onPress?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
};

function RoundedSquare({ index, isFilled = false, showLogoText = false, onPress, isLoading = false, disabled = false }: RoundedSquareProps) {
  if (!Animated) return null;

  const squareSize = useSharedValue(INITIAL_SIZE);
  const squareOpacity = useSharedValue(0);
  const startDelay = index * DELAY_BETWEEN_SQUARES;
  const isLogoSquare = isFilled && showLogoText;
  const targetSize = isLogoSquare ? LOGO_FINAL_SIZE : FINAL_SIZE;
  const shouldFadeOut = !isLogoSquare;

  useEffect(() => {
    const timer = setTimeout(() => {
      // Fade in quickly
      squareOpacity.value = withTiming(0.8, { duration: 200 });
      
      // Expand
      squareSize.value = withTiming(
        targetSize,
        {
          duration: ANIMATION_DURATION,
          easing: Easing?.out(Easing.ease) || undefined,
        },
        () => {
          // Fade out as it expands (only for border squares)
          if (shouldFadeOut) {
            squareOpacity.value = withTiming(0, { duration: ANIMATION_DURATION * 0.6 });
          } else {
            // Logo square stays visible at full opacity
            squareOpacity.value = withTiming(1, { duration: 200 });
          }
        }
      );
    }, startDelay);

    return () => clearTimeout(timer);
  }, [startDelay, squareSize, squareOpacity, targetSize, shouldFadeOut]);

  const style = useAnimatedStyle(() => ({
    width: squareSize.value as number,
    height: squareSize.value as number,
    borderRadius: (squareSize.value as number) * 0.15, // Rounded square like LinkedIn logo
    borderWidth: isFilled ? 2 : 3,
    borderColor: LINKEDIN_BLUE,
    backgroundColor: isFilled ? LINKEDIN_BLUE : 'transparent',
    position: 'absolute',
    opacity: squareOpacity.value as number,
    justifyContent: 'center',
    alignItems: 'center',
  }));

  // For logo square, we need to show text and make it pressable
  if (isLogoSquare) {
    const textSize = useSharedValue(0);
    const [isReady, setIsReady] = React.useState(false);
    
    useEffect(() => {
      // Show text when square reaches final size
      const textTimer = setTimeout(() => {
        textSize.value = withTiming(LOGO_FINAL_SIZE * 0.4, {
          duration: 300,
          easing: Easing?.out(Easing.ease) || undefined,
        });
        // Enable interactivity after text appears
        setIsReady(true);
      }, startDelay + ANIMATION_DURATION);

      return () => clearTimeout(textTimer);
    }, [startDelay, textSize]);

    const textStyle = useAnimatedStyle(() => ({
      fontSize: textSize.value as number,
      opacity: squareOpacity.value as number,
    }));

    return (
      <Animated.View style={style}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { justifyContent: 'center', alignItems: 'center' },
          ]}
        >
          {isReady && (
            <Pressable
              onPress={onPress}
              disabled={disabled || isLoading}
              style={StyleSheet.absoluteFill}
            >
              <Animated.Text
                style={[
                  {
                    color: '#ffffff',
                    fontWeight: '700',
                    textAlign: 'center',
                    includeFontPadding: false,
                  },
                  textStyle,
                ]}
              >
                in
              </Animated.Text>
              {isLoading && (
                <View style={StyleSheet.absoluteFill}>
                  <ActivityIndicator size="large" color="#ffffff" style={{ flex: 1 }} />
                </View>
              )}
            </Pressable>
          )}
        </Animated.View>
      </Animated.View>
    );
  }

  return <Animated.View style={style} />;
}

export function TunnelSplash({
  onLogoPress,
  logoLoading = false,
  logoDisabled = false,
  brandText,
}: TunnelSplashProps) {
  // Calculate safe text position to avoid logo overlap
  // Logo final size is 160px, positioned at center
  // We position text at top 15-20% to ensure it never overlaps, even during expansion
  // Account for text height (~48px) and add margin
  const logoCenterY = height / 2;
  const logoRadius = LOGO_FINAL_SIZE / 2;
  const textHeight = 60; // Approximate text height with margin
  const safeTopPosition = Math.max(20, logoCenterY - logoRadius - textHeight - 20);
  const textTopPosition = Math.min(safeTopPosition, height * 0.2);

  // On web, avoid Reanimated entirely and render a static fallback.
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, styles.fallback]}>
        {brandText ? (
          <View style={[styles.brandTextContainer, { top: textTopPosition }]}>{brandText}</View>
        ) : null}
        <View style={[styles.fallbackLogo, { width: LOGO_FINAL_SIZE, height: LOGO_FINAL_SIZE, borderRadius: LOGO_FINAL_SIZE * 0.15 }]}>
          <Text style={[styles.fallbackLogoText, { fontSize: LOGO_FINAL_SIZE * 0.4 }]}>in</Text>
        </View>
      </View>
    );
  }

  if (!Animated) {
    return (
      <View style={[styles.container, styles.fallback]}>
        {brandText ? (
          <View style={[styles.brandTextContainer, { top: textTopPosition }]}>{brandText}</View>
        ) : null}
        <View style={[styles.fallbackLogo, { width: LOGO_FINAL_SIZE, height: LOGO_FINAL_SIZE, borderRadius: LOGO_FINAL_SIZE * 0.15 }]}>
          <Text style={[styles.fallbackLogoText, { fontSize: LOGO_FINAL_SIZE * 0.4 }]}>in</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tunnelContainer}>
        {/* First 8 squares: border-only, expand and fade out */}
        {[...Array(8)].map((_, index) => (
          <RoundedSquare key={index} index={index} />
        ))}
        {/* 9th square: filled LinkedIn logo, expands to final size and stays */}
        <RoundedSquare
          key={8}
          index={8}
          isFilled={true}
          showLogoText={true}
          onPress={onLogoPress}
          isLoading={logoLoading}
          disabled={logoDisabled}
        />
      </View>

      {/* Brand text overlay - positioned dynamically to avoid overlap */}
      {brandText ? (
        <View style={[styles.brandTextContainer, { top: textTopPosition }]}>{brandText}</View>
      ) : null}
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
          <View style={[styles.fallbackLogo, { width: 160, height: 160, borderRadius: 24 }]}>
            <Text style={[styles.fallbackLogoText, { fontSize: 64 }]}>in</Text>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

export function SafeTunnelSplash(props: TunnelSplashProps) {
  return (
    <SplashErrorBoundary>
      <TunnelSplash {...props} />
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
  logoContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  brandTextContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15,
  },
  fallback: {
    backgroundColor: '#000814',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackLogo: {
    backgroundColor: LINKEDIN_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 2,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    borderLeftColor: 'rgba(255, 255, 255, 0.3)',
    borderRightColor: 'rgba(0, 0, 0, 0.2)',
    borderBottomColor: 'rgba(0, 0, 0, 0.2)',
  },
  fallbackLogoText: {
    color: '#ffffff',
    fontWeight: '700',
    textAlign: 'center',
  },
});
