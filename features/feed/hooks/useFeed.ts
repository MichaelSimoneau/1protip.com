import { useState, useCallback, useEffect } from 'react';
import { fetchHashtagFeed, type FeedPost } from '@/services/linkedin/feed';

interface FeedState {
  posts: FeedPost[];
  isLoading: boolean;
  error: Error | null;
}

export function useFeed() {
  const [state, setState] = useState<FeedState>({
    posts: [],
    isLoading: true,
    error: null,
  });

  const fetchPublishedTips = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const posts = await fetchHashtagFeed();

      setState({
        posts,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }));
    }
  }, []);

  const refreshFeed = useCallback(async () => {
    await fetchPublishedTips();
  }, [fetchPublishedTips]);

  useEffect(() => {
    fetchPublishedTips();
  }, [fetchPublishedTips]);

  return {
    posts: state.posts,
    isLoading: state.isLoading,
    error: state.error,
    refreshFeed,
  };
}
