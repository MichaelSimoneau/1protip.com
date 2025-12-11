import { View, Text, StyleSheet, ActivityIndicator, Platform, ScrollView, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { fetchHashtagFeed, type FeedPost } from '@/services/linkedin/feed';
import { User, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';

export default function MSTab() {
  const [loading, setLoading] = useState(true);
  const { postId } = useLocalSearchParams<{ postId?: string }>();
  const [post, setPost] = useState<FeedPost | null>(null);

  useEffect(() => {
    if (postId) {
      loadPost(postId);
    }
  }, [postId]);

  const loadPost = async (id: string) => {
    setLoading(true);
    try {
      const posts = await fetchHashtagFeed();
      const match = posts.find((p) => p.id === id || p.linkedin_post_id === id) || null;
      setPost(match);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/(tabs)/feed');
  };

  if (postId && post) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.postViewHeader}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color="#0066cc" />
            <Text style={styles.backText}>Back to Feed</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.postView}>
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              {post.author_avatar_url ? (
                <Image
                  source={{ uri: post.author_avatar_url }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <User size={24} color="#666666" />
                </View>
              )}
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>
                  {post.author_name || 'Anonymous'}
                  {post.is_owner && <Text style={styles.ownerBadge}> (You)</Text>}
                </Text>
                <Text style={styles.postDate}>
                  {new Date(post.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
            <Text style={styles.postContent}>{post.content}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (loading && postId) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
        </View>
      </SafeAreaView>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <iframe
          src="https://MichaelSimoneau.com"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title="Michael Simoneau Website"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
        </View>
      )}
      <WebView
        source={{ uri: 'https://MichaelSimoneau.com' }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => setLoading(false)}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scalesPageToFit={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    zIndex: 1,
  },
  postViewHeader: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066cc',
  },
  postView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  postCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  ownerBadge: {
    color: '#0066cc',
    fontWeight: '700',
  },
  postDate: {
    fontSize: 14,
    color: '#999999',
  },
  postContent: {
    fontSize: 18,
    lineHeight: 28,
    color: '#1a1a1a',
  },
});
