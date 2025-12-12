import * as React from 'react';
import { useEffect, type ReactNode } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  Text,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { LinkedInLogoButton } from './LinkedInLogoButton';

const LINKEDIN_BLUE = '#0077b5';
const INITIAL_SIZE = 40;
const LOGO_FINAL_SIZE = 160; // Final size for the logo square
const ANIMATION_DURATION = 1500; // 1.5 seconds per square
const DELAY_BETWEEN_SQUARES = 375; // ~3 seconds total for 8 squares

type TunnelSplashProps = {
  onLogoPress?: () => void;
  logoLoading?: boolean;
  logoDisabled?: boolean;
  brandText?: ReactNode;
  onSkip?: () => void;
};

type RoundedSquareProps = {
  index: number;
  isFilled?: boolean;
  showLogoText?: boolean;
  onPress?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  finalSize: number;
};

function RoundedSquare({
  index,
  isFilled = false,
  showLogoText = false,
  onPress,
  isLoading = false,
  disabled = false,
  finalSize,
}: RoundedSquareProps) {
  const squareSize = useSharedValue(INITIAL_SIZE);
  const squareOpacity = useSharedValue(0);
  const textSize = useSharedValue(0);
  const loginTextSize = useSharedValue(0);
  const [isReady, setIsReady] = React.useState(false);

  const startDelay = index * DELAY_BETWEEN_SQUARES;
  const isLogoSquare = isFilled && showLogoText;
  const targetSize = isLogoSquare ? LOGO_FINAL_SIZE : finalSize;
  const shouldFadeOut = !isLogoSquare;

  useEffect(() => {
    if (!Animated) return;

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
            squareOpacity.value = withTiming(0, {
              duration: ANIMATION_DURATION * 0.6,
            });
          } else {
            // Logo square stays visible at full opacity
            squareOpacity.value = withTiming(1, { duration: 200 });
          }
        },
      );
    }, startDelay);

    return () => clearTimeout(timer);
  }, [startDelay, squareSize, squareOpacity, targetSize, shouldFadeOut]);

  useEffect(() => {
    if (!isLogoSquare || !Animated) return;

    // Show text when square reaches final size
    const textTimer = setTimeout(() => {
      textSize.value = withTiming(LOGO_FINAL_SIZE * 0.4, {
        duration: 300,
        easing: Easing?.out(Easing.ease) || undefined,
      });
      loginTextSize.value = withTiming(LOGO_FINAL_SIZE * 0.1, {
        duration: 300,
        easing: Easing?.out(Easing.ease) || undefined,
      });
      // Enable interactivity after text appears
      setIsReady(true);
    }, startDelay + ANIMATION_DURATION);

    return () => clearTimeout(textTimer);
  }, [startDelay, textSize, loginTextSize, isLogoSquare]);

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

  const textStyle = useAnimatedStyle(() => ({
    fontSize: textSize.value as number,
    opacity: squareOpacity.value as number,
  }));

  const loginTextStyle = useAnimatedStyle(() => ({
    fontSize: loginTextSize.value as number,
    opacity: squareOpacity.value as number,
  }));

  if (!Animated) return null;

  // For logo square, we need to show text and make it pressable
  if (isLogoSquare) {
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
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Animated.Text
                  style={[
                    {
                      color: '#ffffff',
                      fontWeight: '700',
                      textAlign: 'center',
                      includeFontPadding: false,
                      // "in" stays centered in the square visually
                    },
                    textStyle,
                  ]}
                >
                  in
                </Animated.Text>
              </View>

              <View
                style={{
                  position: 'absolute',
                  bottom: '15%',
                  width: '100%',
                  alignItems: 'center',
                }}
              >
                <Animated.Text
                  style={[
                    {
                      color: '#ffffff',
                      fontWeight: '600',
                      textAlign: 'center',
                      letterSpacing: 1,
                    },
                    loginTextStyle,
                  ]}
                >
                  LOGIN
                </Animated.Text>
              </View>

              {isLoading && (
                <View style={StyleSheet.absoluteFill}>
                  <ActivityIndicator
                    size="large"
                    color="#ffffff"
                    style={{ flex: 1 }}
                  />
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
  onSkip,
}: TunnelSplashProps) {
  const { width, height } = useWindowDimensions();
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const finalSize = Math.max(width, height) * 1.5;

  // Calculate safe text position to avoid logo overlap
  // Logo final size is 160px, positioned at center
  // We position text at top 15-20% to ensure it never overlaps, even during expansion
  // Account for text height (~48px) and add margin
  const logoCenterY = height / 2;
  const logoRadius = LOGO_FINAL_SIZE / 2;
  const textHeight = 60; // Approximate text height with margin
  const safeTopPosition = Math.max(
    20,
    logoCenterY - logoRadius - textHeight - 20,
  );
  const textTopPosition = Math.min(safeTopPosition, height * 0.2);

  // Calculate skip button position (below logo)
  const skipButtonTop = logoCenterY + logoRadius + 60;

  // On web, to avoid hydration mismatch (server vs client), we must match the server render initially.
  // The server renders the fallback (or nothing).
  // Once mounted, we can switch to the animation.
  if (Platform.OS === 'web' && !mounted) {
    // Render an empty container to match the initial state of the animation (which starts empty/invisible).
    // This avoids a "flash" of static content before the animation starts.
    return <View style={styles.container} />;
  }

  if (!Animated) {
    return (
      <View style={[styles.container, styles.fallback]}>
        {brandText && mounted ? (
          <View style={[styles.brandTextContainer, { top: textTopPosition }]}>
            {brandText}
          </View>
        ) : null}
        <LinkedInLogoButton
          onPress={onLogoPress || (() => {})}
          isLoading={logoLoading}
          disabled={logoDisabled}
          size={LOGO_FINAL_SIZE}
        />
        {onSkip && (
          <View style={[styles.skipButtonContainer, { top: skipButtonTop }]}>
            <Pressable onPress={onSkip} style={styles.skipButton}>
              <Text style={styles.skipButtonText}>SKIP LOGIN</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tunnelContainer}>
        {/* First 8 squares: border-only, expand and fade out */}
        {[...Array(8)].map((_, index) => (
          <RoundedSquare key={index} index={index} finalSize={finalSize} />
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
          finalSize={finalSize}
        />
      </View>

      {/* Brand text overlay - positioned dynamically to avoid overlap */}
      {brandText && mounted ? (
        <View style={[styles.brandTextContainer, { top: textTopPosition }]}>
          {brandText}
        </View>
      ) : null}

      {/* Skip Login Button */}
      {onSkip && mounted && (
        <View style={[styles.skipButtonContainer, { top: skipButtonTop }]}>
          <Pressable onPress={onSkip} style={styles.skipButton}>
            <Text style={styles.skipButtonText}>SKIP LOGIN</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

class SplashErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean }
> {
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
          <View
            style={[
              styles.fallbackLogo,
              { width: 160, height: 160, borderRadius: 24 },
            ]}
          >
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
  skipButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
    opacity: 0.5,
  },
  skipButton: {
    padding: 16,
  },
  skipButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
