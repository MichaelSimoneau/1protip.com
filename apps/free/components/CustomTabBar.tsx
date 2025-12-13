import { View, Text, Pressable, StyleSheet, Animated, TextInput, ActivityIndicator, PanResponder, LayoutChangeEvent } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useState, useRef, useEffect } from 'react';
import { useTabPanel } from '@/contexts/TabPanelContext';
import { X, Send, ExternalLink, Heart, DollarSign } from 'lucide-react-native';
import { commentOnPost as commentWithService } from '@/services/linkedin/socialActions';
import { createAppPost } from '@/services/linkedin/feed';
import { useLinkedInAuth } from '@/features/auth/hooks/useLinkedInAuth';
import AnimatedReanimated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

interface CustomTabBarProps extends Partial<BottomTabBarProps> {
  onTabPress?: (index: number) => void;
  pageIndex?: number;
}

const Tile = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  onPress, 
  color = '#ffffff', 
  textColor = '#1a1a1a',
  size = 'medium' 
}: { 
  icon: any, 
  title: string, 
  subtitle?: string, 
  onPress: () => void, 
  color?: string,
  textColor?: string,
  size?: 'small' | 'medium' | 'large'
}) => (
  <Pressable 
    style={[
      styles.tile, 
      { backgroundColor: color, flex: size === 'large' ? 1 : 0.48 }
    ]} 
    onPress={onPress}
  >
    <View style={styles.tileHeader}>
      <Icon size={24} color={textColor} />
      <ExternalLink size={16} color={textColor} style={{ opacity: 0.5 }} />
    </View>
    <View>
      <Text style={[styles.tileTitle, { color: textColor }]}>{title}</Text>
      {subtitle && <Text style={[styles.tileSubtitle, { color: textColor, opacity: 0.8 }]}>{subtitle}</Text>}
    </View>
  </Pressable>
);

export function CustomTabBar({ state, descriptors, navigation, onTabPress, pageIndex }: CustomTabBarProps) {
  const [showPanel, setShowPanel] = useState<number | null>(null);
  const panelHeight = useRef(new Animated.Value(0)).current;
  const { panelType, activePost, closePanel, onPostCreated } = useTabPanel();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postText, setPostText] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const { profile, logout } = useLinkedInAuth();
  const isAuthenticated = !!profile;

  // Tab bar height animation for hidden pages
  const isHiddenPage = pageIndex === 0 || pageIndex === 4;
  const tabBarHeight = useRef(new Animated.Value(120)).current; // Initial height from styles

  // Animated highlight indicator
  const indicatorPosition = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const tabLayouts = useRef<{ [key: number]: { x: number; width: number } }>({});

  useEffect(() => {
    Animated.timing(tabBarHeight, {
      toValue: isHiddenPage ? 0 : 120,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isHiddenPage, tabBarHeight]);

  // Update indicator position when active tab changes
  useEffect(() => {
    if (state?.index !== undefined && tabLayouts.current[state.index]) {
      const layout = tabLayouts.current[state.index];
      indicatorPosition.value = withTiming(layout.x, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
      indicatorWidth.value = withTiming(layout.width, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [state?.index, indicatorPosition, indicatorWidth]);

  const indicatorAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: indicatorPosition.value }],
      width: indicatorWidth.value,
    };
  });

  // Swipe Gesture Handling
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Detect vertical swipes only
        return Math.abs(gestureState.dy) > 20 && Math.abs(gestureState.dx) < 20;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -50) {
          // Swipe Up - Show Panel if active tab allows
          if (state && state.index !== undefined) {
             setShowPanel(state.index);
          }
        } else if (gestureState.dy > 50) {
          // Swipe Down - Hide Panel
          setShowPanel(null);
          closePanel();
        }
      },
    })
  ).current;

  const handleMsDonate = () => {
    setShowPanel(null);
    if (navigation) {
        navigation.navigate('ms'); // This might need parameters if we can pass them
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowPanel(null);
  };

  useEffect(() => {
    const shouldShow = panelType !== null || showPanel !== null;
    Animated.timing(panelHeight, {
      toValue: shouldShow ? 300 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showPanel, panelType, panelHeight]);

  const handleTabPress = (index: number) => {
    // If locked (Feed tab logic handled in FeedTab itself via TunnelSplash), 
    // but here we just handle navigation.
    // If user is on a tab and taps it again, toggle panel
    const isFocused = state?.index === index;

    if (isFocused) {
      if (showPanel === index) {
        setShowPanel(null);
      } else {
        setShowPanel(index);
      }
    } else {
      setShowPanel(null);
      
      if (onTabPress) {
        onTabPress(index);
      } else if (navigation && state) {
          const event = navigation.emit({
            type: 'tabPress',
            target: state.routes[index].key,
            canPreventDefault: true,
          });

          if (!event.defaultPrevented) {
            navigation.navigate(state.routes[index].name);
          }
      }
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || !activePost || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const postUrn = activePost.linkedin_post_id || activePost.id;
      await commentWithService(postUrn, commentText.trim());
      setCommentText('');
      closePanel();
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostSubmit = async () => {
    if (!postText.trim() || isPosting) return;

    setIsPosting(true);
    try {
      const newPost = await createAppPost(postText.trim());
      setPostText('');
      setShowPanel(null);
      onPostCreated?.(newPost);
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      setIsPosting(false);
    }
  };

  const renderCommentPanel = () => {
    if (!activePost) return null;

    return (
      <View style={styles.panelContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.panelTitle}>Comment on {activePost.author_name}'s post</Text>
          <Pressable onPress={closePanel} style={styles.closeButton}>
            <X size={24} color="#666666" />
          </Pressable>
        </View>

        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Write your comment..."
            placeholderTextColor="#999999"
            value={commentText}
            onChangeText={setCommentText}
            multiline
            numberOfLines={3}
            editable={!isSubmitting}
          />
          <Pressable
            style={[styles.sendButton, (!commentText.trim() || isSubmitting) && styles.sendButtonDisabled]}
            onPress={handleCommentSubmit}
            disabled={!commentText.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Send size={20} color="#ffffff" />
            )}
          </Pressable>
        </View>
      </View>
    );
  };

  const renderPanel = (routeName: string) => {
    if (panelType === 'comment') {
      return renderCommentPanel();
    }

    switch (routeName) {
      case 'settings':
        return (
          <View style={styles.panelContent}>
            <Text style={styles.panelTitle}>Account Actions</Text>
            <Text style={styles.panelText}>Quick settings and account options</Text>
            {isAuthenticated && (
                <Pressable style={[styles.primaryActionButton, { backgroundColor: '#cc0000', marginTop: 16 }]} onPress={handleLogout}>
                    <Text style={styles.primaryActionText}>Logout</Text>
                </Pressable>
            )}
          </View>
        );
      case 'feed':
        return (
          <View style={styles.panelContent}>
            <View style={styles.commentHeader}>
              <Text style={styles.panelTitle}>Share a ProTip</Text>
              <Pressable onPress={() => setShowPanel(null)} style={styles.closeButton}>
                <X size={24} color="#666666" />
              </Pressable>
            </View>
            <Text style={[styles.panelText, { marginBottom: 16 }]}>
              Post to the #1ProTip community
            </Text>
            
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="What's your tip?"
                placeholderTextColor="#999999"
                value={postText}
                onChangeText={setPostText}
                multiline
                numberOfLines={3}
                editable={!isPosting}
              />
              <Pressable
                style={[
                  styles.sendButton,
                  (!postText.trim() || isPosting) && styles.sendButtonDisabled,
                ]}
                onPress={handlePostSubmit}
                disabled={!postText.trim() || isPosting}
              >
                {isPosting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Send size={20} color="#ffffff" />
                )}
              </Pressable>
            </View>
          </View>
        );
      case 'ms':
        return (
          <View style={styles.panelContent}>
            <View style={styles.commentHeader}>
              <Text style={styles.panelTitle}>Michael Simoneau</Text>
              <Pressable onPress={() => setShowPanel(null)} style={styles.closeButton}>
                <X size={24} color="#666666" />
              </Pressable>
            </View>
            <Text style={[styles.panelText, { marginBottom: 24 }]}>Support the developer & platform</Text>
            
            <View style={styles.tilesContainer}>
              <Tile 
                icon={DollarSign}
                title="Donate"
                subtitle="via PayPal"
                color="#0070ba"
                textColor="#ffffff"
                size="large"
                onPress={handleMsDonate}
              />
              <Tile 
                icon={Heart}
                title="Sponsor"
                subtitle="GitHub"
                color="#24292e"
                textColor="#ffffff"
                size="large"
                onPress={() => {}} // TODO: Add GitHub sponsor link
              />
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  const tabOrder = ['settings', 'feed', 'ms'];
  const orderedRoutes = state ? tabOrder
    .map(name => {
      const index = state.routes.findIndex(r => r.name === name);
      return index >= 0 ? { route: state.routes[index], index } : null;
    })
    .filter(Boolean) as { route: typeof state.routes[0]; index: number }[] : [];

  const handleTabLayout = (index: number, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    tabLayouts.current[index] = { x, width };
    
    // If this is the active tab, immediately update indicator position
    if (state?.index === index) {
      indicatorPosition.value = x;
      indicatorWidth.value = width;
    }
  };

  return (
    <Animated.View style={[styles.container, { height: tabBarHeight, overflow: 'hidden' }]} {...panResponder.panHandlers}>
      <Animated.View style={[styles.panel, { height: panelHeight }]}>
        {panelType !== null ? renderPanel('') : (showPanel !== null && state ? renderPanel(state.routes[showPanel].name) : null)}
      </Animated.View>

      <View style={styles.tabBar}>
        {orderedRoutes.map(({ route, index }) => {
          const descriptor = descriptors ? descriptors[route.key] : null;
          const options = descriptor ? descriptor.options : {};
          const isFocused = state ? state.index === index : false;
          const isPanelOpen = showPanel === index || panelType !== null;

          // Dynamic Icon for Feed
          let icon = options.tabBarIcon;
          if (route.name === 'feed' && !isAuthenticated) {
             // We can optionally show a Lock icon here if we want to reflect the locked state in the tab bar too
             // For now, we stick to the plan: Feed Tab is the Lock screen content, but icon transforms.
             // Since we don't have easy access to the animation value here without context,
             // we keep the static icon or update based on auth.
          }

          return (
            <Pressable
              key={route.key}
              onPress={() => handleTabPress(index)}
              onLayout={(event) => handleTabLayout(index, event)}
              style={[
                styles.tab,
                // Remove tabActive background since we're using indicator instead
                isPanelOpen && isFocused && styles.tabWithPanel,
              ]}
            >
              {icon &&
                icon({
                  focused: isFocused,
                  color: isFocused ? '#0066cc' : '#666666',
                  size: 32,
                })}
            </Pressable>
          );
        })}
        {/* Animated highlight indicator */}
        <AnimatedReanimated.View
          style={[
            styles.indicator,
            indicatorAnimatedStyle,
          ]}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  panel: {
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    overflow: 'hidden',
  },
  panelContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  panelTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  panelText: {
    fontSize: 16,
    color: '#666666',
  },
  tabBar: {
    flexDirection: 'row',
    height: 120,
    paddingBottom: 16,
    paddingTop: 16,
    position: 'relative',
    zIndex: 1,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 16,
    marginHorizontal: 8,
    position: 'relative',
    zIndex: 3,
  },
  tabWithPanel: {
    backgroundColor: '#0052a3',
  },
  indicator: {
    position: 'absolute',
    bottom: 12,
    height: 3,
    backgroundColor: '#0066cc',
    borderRadius: 2,
    zIndex: 2,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1a1a1a',
    minHeight: 80,
    maxHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0066cc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  primaryActionButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  tilesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  tile: {
    padding: 20,
    borderRadius: 20,
    minHeight: 140,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tileTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  tileSubtitle: {
    fontSize: 14,
    fontWeight: '600',
  },
});
