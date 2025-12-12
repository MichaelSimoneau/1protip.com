import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  TextInput,
  ActivityIndicator,
  PanResponder,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useState, useRef, useEffect } from 'react';
import { useTabPanel } from '@/contexts/TabPanelContext';
import { FileText, Settings, UserCircle2, X, Send } from 'lucide-react-native';
import { commentOnPost as commentWithService } from '@/services/linkedin/socialActions';
import { createAppPost } from '@/services/linkedin/feed';
import { useLinkedInAuth } from '@/features/auth/hooks/useLinkedInAuth';

interface CustomTabBarProps extends Partial<BottomTabBarProps> {
  onTabPress?: (index: number) => void;
  visible?: boolean;
}

export function CustomTabBar({
  state,
  descriptors,
  navigation,
  onTabPress,
  visible = true,
}: CustomTabBarProps) {
  const [showPanel, setShowPanel] = useState<number | null>(null);
  const panelHeight = useRef(new Animated.Value(0)).current;
  const tabBarTranslate = useRef(new Animated.Value(0)).current;
  const { panelType, activePost, closePanel, onPostCreated } = useTabPanel();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postText, setPostText] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const { profile, logout } = useLinkedInAuth();
  const isAuthenticated = !!profile;

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
            // Only allow swipe up on certain tabs if needed, currently all
            setShowPanel(state.index);
          }
        } else if (gestureState.dy > 50) {
          // Swipe Down - Hide Panel
          setShowPanel(null);
          closePanel();
        }
      },
    }),
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
  }, [panelHeight, showPanel, panelType]);

  useEffect(() => {
    Animated.spring(tabBarTranslate, {
      toValue: visible ? 0 : 160,
      useNativeDriver: true,
      damping: 18,
      stiffness: 120,
    }).start();

    if (!visible) {
      setShowPanel(null);
      closePanel();
    }
  }, [visible, closePanel, tabBarTranslate]);

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
          <Text style={styles.panelTitle}>
            Comment on {activePost.author_name}'s post
          </Text>
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
            style={[
              styles.sendButton,
              (!commentText.trim() || isSubmitting) &&
                styles.sendButtonDisabled,
            ]}
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
            <Text style={styles.panelText}>
              Quick settings and account options
            </Text>
            {isAuthenticated && (
              <Pressable
                style={[
                  styles.primaryActionButton,
                  { backgroundColor: '#cc0000', marginTop: 16 },
                ]}
                onPress={handleLogout}
              >
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
              <Pressable
                onPress={() => setShowPanel(null)}
                style={styles.closeButton}
              >
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
            <Text style={styles.panelTitle}>MS Actions</Text>
            <Text style={styles.panelText}>Michael Simoneau quick actions</Text>
            <Pressable
              style={styles.primaryActionButton}
              onPress={handleMsDonate}
            >
              <Text style={styles.primaryActionText}>Donate via PayPal</Text>
              <Text style={styles.primaryActionSubtext}>
                Supports @michaelsimoneau
              </Text>
            </Pressable>
          </View>
        );
      default:
        return null;
    }
  };

  const tabOrder = ['settings', 'feed', 'ms'];
  const orderedRoutes = state
    ? (tabOrder
        .map((name) => {
          const index = state.routes.findIndex((r) => r.name === name);
          return index >= 0 ? { route: state.routes[index], index } : null;
        })
        .filter(Boolean) as {
        route: (typeof state.routes)[0];
        index: number;
      }[])
    : [];

  const tabLabels: Record<string, string> = {
    settings: 'Settings',
    feed: '#1ProTip',
    ms: 'MS',
  };

  const tabIcons: Record<string, any> = {
    settings: Settings,
    feed: FileText,
    ms: UserCircle2,
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: tabBarTranslate }] },
      ]}
      {...panResponder.panHandlers}
    >
      <Animated.View style={[styles.panel, { height: panelHeight }]}>
        {panelType !== null
          ? renderPanel('')
          : showPanel !== null && state
            ? renderPanel(state.routes[showPanel].name)
            : null}
      </Animated.View>

      <View style={styles.tabBar}>
        {orderedRoutes.map(({ route, index }) => {
          const currentStateIndex = state?.index ?? 0;
          const isFocused = currentStateIndex === index;
          const isPanelOpen =
            (showPanel === index || panelType !== null) && isFocused;

          const IconComponent = tabIcons[route.name];
          const label = tabLabels[route.name] ?? route.name;

          return (
            <Pressable
              key={route.key}
              onPress={() => handleTabPress(index)}
              style={[
                styles.tab,
                isFocused && styles.tabActive,
                isPanelOpen && isFocused && styles.tabWithPanel,
              ]}
            >
              <View
                style={[
                  styles.iconWrapper,
                  isFocused
                    ? styles.iconWrapperActive
                    : styles.iconWrapperInactive,
                ]}
              >
                {IconComponent && (
                  <IconComponent
                    size={28}
                    color={isFocused ? '#ffffff' : '#0b2d52'}
                    strokeWidth={isFocused ? 2.4 : 2}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
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
    paddingBottom: 18,
    paddingTop: 12,
    gap: 12,
    paddingHorizontal: 12,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e6eef8',
    shadowColor: '#001f4d',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  tabActive: {
    backgroundColor: '#0066cc',
    borderColor: '#0066cc',
    shadowOpacity: 0.12,
  },
  tabWithPanel: {
    backgroundColor: '#0052a3',
    borderColor: '#0052a3',
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f5fb',
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  iconWrapperInactive: {
    borderWidth: 1,
    borderColor: '#d8e2f2',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  tabLabelActive: {
    color: '#ffffff',
  },
  tabLabelInactive: {
    color: '#0b2d52',
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
    marginTop: 20,
    backgroundColor: '#0070ba',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryActionText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  primaryActionSubtext: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e6f0ff',
  },
});
