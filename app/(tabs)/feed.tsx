import { View, Text, StyleSheet, FlatList, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFeed } from '@/features/feed/hooks/useFeed';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { Rss, User } from 'lucide-react-native';

export default function FeedTab() {
  const { posts, isLoading, error, refreshFeed } = useFeed();

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
              Posts with #1ProTip hashtag will appear here
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
  },
  postDate: {
    fontSize: 12,
    color: '#999999',
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
