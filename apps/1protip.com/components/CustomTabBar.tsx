import { View, Text, Pressable, StyleSheet, Animated, TextInput, ActivityIndicator } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useState, useRef, useEffect } from 'react';
import { useTabPanel } from '@/contexts/TabPanelContext';
import { X, Send } from 'lucide-react-native';
import { commentOnPost as commentWithService } from '@/services/linkedin/socialActions';

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const [showPanel, setShowPanel] = useState<number | null>(null);
  const panelHeight = useRef(new Animated.Value(0)).current;
  const { panelType, activePost, closePanel } = useTabPanel();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMsDonate = () => {
    setShowPanel(null);
    navigation.navigate('ms', {
      action: 'donate',
      slug: 'michaelsimoneau',
    });
  };

  useEffect(() => {
    const shouldShow = panelType !== null || showPanel !== null;
    Animated.timing(panelHeight, {
      toValue: shouldShow ? 300 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showPanel, panelType]);

  const handleTabPress = (index: number) => {
    const isFocused = state.index === index;

    if (isFocused) {
      if (showPanel === index) {
        setShowPanel(null);
      } else {
        setShowPanel(index);
      }
    } else {
      setShowPanel(null);
      const event = navigation.emit({
        type: 'tabPress',
        target: state.routes[index].key,
        canPreventDefault: true,
      });

      if (!event.defaultPrevented) {
        navigation.navigate(state.routes[index].name);
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
          </View>
        );
      case 'feed':
        return (
          <View style={styles.panelContent}>
            <Text style={styles.panelTitle}>Feed Actions</Text>
            <Text style={styles.panelText}>Filter, sort, and manage your feed</Text>
          </View>
        );
      case 'ms':
        return (
          <View style={styles.panelContent}>
            <Text style={styles.panelTitle}>MS Actions</Text>
            <Text style={styles.panelText}>Michael Simoneau quick actions</Text>
            <Pressable style={styles.primaryActionButton} onPress={handleMsDonate}>
              <Text style={styles.primaryActionText}>Donate via PayPal</Text>
              <Text style={styles.primaryActionSubtext}>Supports @michaelsimoneau</Text>
            </Pressable>
          </View>
        );
      default:
        return null;
    }
  };

  const tabOrder = ['settings', 'feed', 'ms'];
  const orderedRoutes = tabOrder
    .map(name => {
      const index = state.routes.findIndex(r => r.name === name);
      return index >= 0 ? { route: state.routes[index], index } : null;
    })
    .filter(Boolean) as Array<{ route: typeof state.routes[0]; index: number }>;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.panel, { height: panelHeight }]}>
        {panelType !== null ? renderPanel('') : (showPanel !== null && renderPanel(state.routes[showPanel].name))}
      </Animated.View>

      <View style={styles.tabBar}>
        {orderedRoutes.map(({ route, index }) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const isPanelOpen = showPanel === index || panelType !== null;

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
              {options.tabBarIcon &&
                options.tabBarIcon({
                  focused: isFocused,
                  color: isFocused ? '#ffffff' : '#666666',
                  size: 32,
                })}
            </Pressable>
          );
        })}
      </View>
    </View>
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
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginHorizontal: 8,
  },
  tabActive: {
    backgroundColor: '#0066cc',
  },
  tabWithPanel: {
    backgroundColor: '#0052a3',
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
