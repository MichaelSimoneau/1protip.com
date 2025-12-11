import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFeed } from '@/features/feed/hooks/useFeed';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { Rss } from 'lucide-react-native';

export default function FeedTab() {
  const { posts, isLoading, error, refreshFeed } = useFeed();

  if (isLoading && posts.length === 0) {
    return <LoadingSpinner message="Loading your feed..." />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>LinkedIn Feed</Text>
          <Text style={styles.subtitle}>Your #1ProTip posts</Text>
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
        <Text style={styles.title}>LinkedIn Feed</Text>
        <Text style={styles.subtitle}>Your #1ProTip posts</Text>
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
              Your published #1ProTip posts will appear here
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <Text style={styles.postContent}>{item.content}</Text>
            <Text style={styles.postDate}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
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
    color: '#1a1a1a',
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
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1a1a1a',
    marginBottom: 12,
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
