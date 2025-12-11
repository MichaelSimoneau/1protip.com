import { View, Text, StyleSheet, FlatList, RefreshControl, Image, Pressable, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFeed } from '@/features/feed/hooks/useFeed';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { Rss, User, ThumbsUp, MessageCircle, Repeat2, ExternalLink } from 'lucide-react-native';
import { useState } from 'react';
import { likePost, commentOnPost, repostPost } from '@/services/linkedin/socialActions';

export default function FeedTab() {
  const { posts, isLoading, error, refreshFeed } = useFeed();
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const handleLike = async (postId: string) => {
    setActionInProgress(postId);
    try {
      const result = await likePost(postId);
      if (result.success) {
        Alert.alert('Success', 'Post liked on LinkedIn!');
      } else {
        Alert.alert('Error', result.error || 'Failed to like post');
      }
    } catch (err) {
      Alert.alert('Error', 'An error occurred');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleComment = async (postId: string) => {
    Alert.alert(
      'Add Comment',
      'Enter your comment:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Post',
          onPress: async () => {
            setActionInProgress(postId);
            try {
              const result = await commentOnPost(postId, 'Great tip!');
              if (result.success) {
                Alert.alert('Success', 'Comment posted on LinkedIn!');
              } else {
                Alert.alert('Error', result.error || 'Failed to comment');
              }
            } catch (err) {
              Alert.alert('Error', 'An error occurred');
            } finally {
              setActionInProgress(null);
            }
          },
        },
      ]
    );
  };

  const handleRepost = async (postId: string) => {
    Alert.alert(
      'Repost to LinkedIn',
      'Share this post to your LinkedIn feed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Repost',
          onPress: async () => {
            setActionInProgress(postId);
            try {
              const result = await repostPost(postId);
              if (result.success) {
                Alert.alert('Success', 'Post shared to your LinkedIn!');
              } else {
                Alert.alert('Error', result.error || 'Failed to repost');
              }
            } catch (err) {
              Alert.alert('Error', 'An error occurred');
            } finally {
              setActionInProgress(null);
            }
          },
        },
      ]
    );
  };

  const handleOpenLinkedIn = async (linkedinUrl?: string) => {
    if (linkedinUrl) {
      const canOpen = await Linking.canOpenURL(linkedinUrl);
      if (canOpen) {
        await Linking.openURL(linkedinUrl);
      }
    }
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
              >
                <ThumbsUp size={20} color="#666666" />
                <Text style={styles.actionText}>Like</Text>
              </Pressable>

              <Pressable
                style={styles.actionButton}
                onPress={() => handleComment(item.linkedin_post_id || item.id)}
              >
                <MessageCircle size={20} color="#666666" />
                <Text style={styles.actionText}>Comment</Text>
              </Pressable>

              <Pressable
                style={styles.actionButton}
                onPress={() => handleRepost(item.linkedin_post_id || item.id)}
              >
                <Repeat2 size={20} color="#666666" />
                <Text style={styles.actionText}>Repost</Text>
              </Pressable>

              <Pressable
                style={styles.actionButton}
                onPress={() => handleOpenLinkedIn(item.linkedin_url)}
              >
                <ExternalLink size={20} color="#0066cc" />
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
