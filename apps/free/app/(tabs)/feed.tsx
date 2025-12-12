import { View, Text, StyleSheet, RefreshControl, Image, Pressable, Dimensions, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useFeed } from '@/features/feed/hooks/useFeed';
import { useLinkedInAuth } from '@/features/auth/hooks/useLinkedInAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Rss, User, ThumbsUp, MessageCircle, Repeat2, Eye, Lock, Hash } from 'lucide-react-native';
import { useCallback, useRef, useState, useEffect } from 'react';
import { router } from 'expo-router';
import { useTabPanel } from '@/contexts/TabPanelContext';
import { TunnelSplash } from '@/components/TunnelSplash';
import type { FeedPost } from '@/services/linkedin/feed';
import {
  likePost as likeWithService,
  commentOnPost as commentWithService,
  repostPost as repostWithService,
} from '@/services/linkedin/socialActions';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = Math.min(420, SCREEN_HEIGHT * 0.7);
const CARD_SPACING = 24;
const CARD_TOTAL = CARD_HEIGHT + CARD_SPACING;

type CardProps = {
  item: FeedPost;
  index: number;
  scrollY: Animated.SharedValue<number>;
  onLike: (postUrn: string) => void;
  onComment: (post: FeedPost) => void;
  onRepost: (postUrn: string) => void;
  onView: (post: FeedPost) => void;
  disabled: boolean;
};

const RolodexCard = ({
  item,
  index,
  scrollY,
  onLike,
  onComment,
  onRepost,
  onView,
  disabled,
}: CardProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    const position = index * CARD_TOTAL;
    const diff = scrollY.value - position;

    const rotateX = interpolate(
      diff,
      [-CARD_TOTAL * 1.5, 0, CARD_TOTAL * 1.5],
      [12, 0, -12],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      diff,
      [-CARD_TOTAL * 1.5, 0, CARD_TOTAL * 1.5],
      [-28, 0, 36],
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      diff,
      [-CARD_TOTAL * 2, 0, CARD_TOTAL * 2],
      [0.9, 1, 0.9],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { perspective: 900 },
        { translateY },
        { scale },
        { rotateX: `${rotateX}deg` },
      ],
      zIndex: 1000 - index,
      opacity: interpolate(
        diff,
        [-CARD_TOTAL * 2, 0, CARD_TOTAL * 2],
        [0.2, 1, 0.2],
        Extrapolate.CLAMP
      ),
    };
  }, [index, scrollY]);

  return (
    <Animated.View style={[styles.postCard, animatedStyle]}>
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
          onPress={() => onLike(item.linkedin_post_id || item.id)}
          disabled={disabled}
        >
          <ThumbsUp size={20} color="#666666" />
          <Text style={styles.actionText}>Like</Text>
        </Pressable>

        <Pressable
          style={styles.actionButton}
          onPress={() => onComment(item)}
          disabled={disabled}
        >
          <MessageCircle size={20} color="#666666" />
          <Text style={styles.actionText}>Comment</Text>
        </Pressable>

        <Pressable
          style={styles.actionButton}
          onPress={() => onRepost(item.linkedin_post_id || item.id)}
          disabled={disabled}
        >
          <Repeat2 size={20} color="#666666" />
          <Text style={styles.actionText}>Repost</Text>
        </Pressable>

        <Pressable
          style={styles.actionButton}
          onPress={() => onView(item)}
        >
          <Eye size={20} color="#0066cc" />
          <Text style={[styles.actionText, styles.actionTextPrimary]}>View</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
};

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList as any);

export default function FeedTab() {
  const { posts, isLoading, isLoadingMore, error, hasMore, refreshFeed, loadMore, prependPost } = useFeed();
  const { profile, login } = useLinkedInAuth();
  const isAuthenticated = !!profile;
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const { openCommentPanel, setPostCreatedCallback } = useTabPanel();
  const scrollY = useSharedValue(0);
  const currentIndex = useSharedValue(0);
  const listRef = useRef<FlatList<FeedPost>>(null);

  // Lock State
  const [isLocked, setIsLocked] = useState(true);
  const lockOpacity = useSharedValue(1);
  const feedOpacity = useSharedValue(0);

  useEffect(() => {
    // If authenticated on mount, unlock immediately
    if (isAuthenticated) {
      handleUnlock();
    }
  }, [isAuthenticated]);

  const handleUnlock = () => {
    setIsLocked(false);
    lockOpacity.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) });
    feedOpacity.value = withTiming(1, { duration: 500, easing: Easing.in(Easing.ease) });
  };

  const handleSkipLogin = () => {
    handleUnlock();
  };

  const handleLogin = async () => {
    try {
      await login();
      handleUnlock();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setPostCreatedCallback(prependPost);
  }, [prependPost, setPostCreatedCallback]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      currentIndex.value = event.contentOffset.y / CARD_TOTAL;
    },
  });

  const handleEndReached = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      void loadMore();
    }
  }, [hasMore, isLoadingMore, loadMore]);

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: CARD_TOTAL,
      offset: CARD_TOTAL * index,
      index,
    }),
    []
  );

  const panGesture = Gesture.Pan()
    .activeOffsetY([-20, 20])
    .onEnd((event) => {
      const direction = event.translationY < -40 ? 1 : event.translationY > 40 ? -1 : 0;
      if (!direction) return;
      const nextIndex = Math.max(
        0,
        Math.min(Math.round(currentIndex.value) + direction, Math.max(posts.length - 1, 0))
      );
      currentIndex.value = nextIndex;
      const offset = nextIndex * CARD_TOTAL;
      listRef.current?.scrollToOffset({ offset, animated: true });
    });

  const showFeedback = (message: string) => {
    setFeedbackMessage(message);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleLike = async (postUrn: string) => {
    if (!isAuthenticated) {
      showFeedback('Login to like posts');
      return;
    }
    if (actionInProgress) return;

    setActionInProgress(postUrn);
    try {
      await likeWithService(postUrn);
      showFeedback('Liked on LinkedIn!');
    } catch (err) {
      showFeedback('Failed to like post');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleCommentOpen = async (post: FeedPost) => {
    if (!isAuthenticated) {
      showFeedback('Login to comment');
      return;
    }
    openCommentPanel(post);
  };

  const handleRepost = async (postUrn: string) => {
    if (!isAuthenticated) {
      showFeedback('Login to repost');
      return;
    }
    if (actionInProgress) return;

    setActionInProgress(postUrn);
    try {
      await repostWithService(postUrn);
      showFeedback('Reposted to LinkedIn!');
    } catch (err) {
      showFeedback('Failed to repost');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleView = (post: FeedPost) => {
    router.push({
      pathname: '/(tabs)/ms',
      params: { postId: post.id },
    });
  };

  // Lock Overlay Styles
  const lockContainerStyle = useAnimatedStyle(() => ({
    opacity: lockOpacity.value,
    zIndex: lockOpacity.value > 0 ? 100 : -1,
  }));

  const feedContainerStyle = useAnimatedStyle(() => ({
    opacity: feedOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Lock / Splash Overlay */}
      <Animated.View style={[StyleSheet.absoluteFill, lockContainerStyle]}>
        <TunnelSplash
          onLogoPress={handleLogin}
          onSkip={handleSkipLogin}
          logoLoading={false}
          brandText={<Text style={styles.brandText}>#1ProTip</Text>}
        />
      </Animated.View>

      {/* Main Feed Content */}
      <Animated.View style={[styles.container, feedContainerStyle]}>
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.title}>#1ProTip</Text>
                <Text style={styles.subtitle}>Professional tips from the LinkedIn community</Text>
              </View>
              {/* Dynamic Icon Animation could go here */}
              <Hash size={32} color="#0066cc" />
            </View>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error loading feed</Text>
              <Text style={styles.errorMessage}>{error.message}</Text>
            </View>
          )}

          {feedbackMessage && (
            <View style={styles.feedback}>
              <Text style={styles.feedbackText}>{feedbackMessage}</Text>
            </View>
          )}

          <GestureDetector gesture={panGesture}>
            <AnimatedFlatList
              ref={listRef}
              data={posts}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              scrollEventThrottle={16}
              onScroll={onScroll}
              refreshControl={
                <RefreshControl refreshing={isLoading} onRefresh={refreshFeed} />
              }
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.65}
              maxToRenderPerBatch={2}
              windowSize={2}
              removeClippedSubviews
              initialNumToRender={1}
              getItemLayout={getItemLayout}
              snapToInterval={CARD_TOTAL}
              snapToAlignment="start"
              decelerationRate="fast"
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View style={styles.placeholder}>
                  <Rss size={64} color="#cccccc" />
                  <Text style={styles.placeholderTitle}>No posts yet</Text>
                  <Text style={styles.placeholderText}>
                    Connect your LinkedIn and posts with #1ProTip will appear here
                  </Text>
                </View>
              )}
              ListFooterComponent={() =>
                isLoadingMore ? (
                  <View style={styles.footerLoading}>
                    <LoadingSpinner message="Loading more tips..." />
                  </View>
                ) : null
              }
              renderItem={({ item, index }: { item: FeedPost; index: number }) => (
                <RolodexCard
                  item={item}
                  index={index}
                  scrollY={scrollY}
                  onLike={handleLike}
                  onComment={handleCommentOpen}
                  onRepost={handleRepost}
                  onView={handleView}
                  disabled={!!actionInProgress}
                />
              )}
            />
          </GestureDetector>
        </SafeAreaView>
      </Animated.View>
    </View>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  brandText: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
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
    paddingHorizontal: 16,
    paddingVertical: 24,
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
    marginBottom: CARD_SPACING,
    height: CARD_HEIGHT,
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
  footerLoading: {
    paddingVertical: 24,
  },
});
