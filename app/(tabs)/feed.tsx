import { View, Text, StyleSheet, FlatList, RefreshControl, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFeed } from '@/features/feed/hooks/useFeed';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { Rss, User, ThumbsUp, MessageCircle, Repeat2, Eye } from 'lucide-react-native';
import { useState } from 'react';
import { supabase } from '@/services/supabase/client';
import { router } from 'expo-router';
import type { Tip } from '@/services/supabase/types';
import { useTabPanel } from '@/shared/contexts/TabPanelContext';

export default function FeedTab() {
  const { posts, isLoading, error, refreshFeed } = useFeed();
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const { openCommentPanel } = useTabPanel();

  const showFeedback = (message: string) => {
    setFeedbackMessage(message);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const checkLinkedInConnection = async (): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('linkedin_access_token')
      .eq('id', user.id)
      .maybeSingle();

    return !!profile?.linkedin_access_token;
  };

  const redirectToSettings = () => {
    router.push({
      pathname: '/(tabs)/settings',
      params: { highlight: 'connect' },
    });
    showFeedback('Connect your LinkedIn account to interact with posts');
  };

  const handleLike = async (postUrn: string) => {
    if (actionInProgress) return;

    const isConnected = await checkLinkedInConnection();
    if (!isConnected) {
      redirectToSettings();
      return;
    }

    setActionInProgress(postUrn);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('linkedin-like-post', {
        body: { postUrn },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (response.error) throw response.error;
      if (response.data?.needsAuth) {
        redirectToSettings();
        return;
      }

      if (response.data?.success) {
        showFeedback('Liked on LinkedIn!');
      }
    } catch (err) {
      showFeedback('Failed to like post');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleCommentOpen = async (post: Tip) => {
    const isConnected = await checkLinkedInConnection();
    if (!isConnected) {
      redirectToSettings();
      return;
    }

    openCommentPanel(post);
  };

  const handleRepost = async (postUrn: string) => {
    if (actionInProgress) return;

    const isConnected = await checkLinkedInConnection();
    if (!isConnected) {
      redirectToSettings();
      return;
    }

    setActionInProgress(postUrn);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('linkedin-repost-post', {
        body: { postUrn },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (response.error) throw response.error;
      if (response.data?.needsAuth) {
        redirectToSettings();
        return;
      }

      if (response.data?.success) {
        showFeedback('Reposted to your LinkedIn!');
      }
    } catch (err) {
      showFeedback('Failed to repost');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleView = (post: Tip) => {
    router.push({
      pathname: '/(tabs)/ms',
      params: { postId: post.id },
    });
  };

  if (isLoading && posts.length === 0) {
    return <LoadingSpinner message="Loading your feed..." />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>#1ProTip</Text>
          <Text style={styles.subtitle}>Professional tips from the LinkedIn community</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading feed</Text>
          <Text style={styles.errorMessage}>{error.message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>#1ProTip</Text>
        <Text style={styles.subtitle}>Professional tips from the LinkedIn community</Text>
      </View>

      {feedbackMessage && (
        <View style={styles.feedback}>
          <Text style={styles.feedbackText}>{feedbackMessage}</Text>
        </View>
      )}

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshFeed} />
        }
        ListEmptyComponent={() => (
          <View style={styles.placeholder}>
            <Rss size={64} color="#cccccc" />
            <Text style={styles.placeholderTitle}>No posts yet</Text>
            <Text style={styles.placeholderText}>
              Connect your LinkedIn and posts with #1ProTip will appear here
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              {item.author_avatar_url ? (
                <Image
                  source={{ uri: item.author_avatar_url }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <User size={20} color="#666666" />
                </View>
              )}
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>
                  {item.author_name || 'Anonymous'}
                  {item.is_owner && <Text style={styles.ownerBadge}> (You)</Text>}
                </Text>
                <Text style={styles.postDate}>
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <Text style={styles.postContent}>{item.content}</Text>

            <View style={styles.actionsBar}>
              <Pressable
                style={styles.actionButton}
                onPress={() => handleLike(item.linkedin_post_id || item.id)}
                disabled={!!actionInProgress}
              >
                <ThumbsUp size={20} color="#666666" />
                <Text style={styles.actionText}>Like</Text>
              </Pressable>

              <Pressable
                style={styles.actionButton}
                onPress={() => handleCommentOpen(item)}
                disabled={!!actionInProgress}
              >
                <MessageCircle size={20} color="#666666" />
                <Text style={styles.actionText}>Comment</Text>
              </Pressable>

              <Pressable
                style={styles.actionButton}
                onPress={() => handleRepost(item.linkedin_post_id || item.id)}
                disabled={!!actionInProgress}
              >
                <Repeat2 size={20} color="#666666" />
                <Text style={styles.actionText}>Repost</Text>
              </Pressable>

              <Pressable
                style={styles.actionButton}
                onPress={() => handleView(item)}
              >
                <Eye size={20} color="#0066cc" />
                <Text style={[styles.actionText, styles.actionTextPrimary]}>View</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0066cc',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
  },
  feedback: {
    backgroundColor: '#0066cc',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  placeholder: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666666',
    textAlign: 'center',
  },
  postCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  ownerBadge: {
    color: '#0066cc',
    fontWeight: '700',
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1a1a1a',
    marginBottom: 16,
  },
  postDate: {
    fontSize: 12,
    color: '#999999',
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  actionTextPrimary: {
    color: '#0066cc',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ff6b35',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});
