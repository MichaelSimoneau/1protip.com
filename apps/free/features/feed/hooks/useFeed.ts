import { useState, useCallback, useEffect } from 'react';
import { fetchHashtagFeed, type FeedPost } from '@/services/linkedin/feed';

const PAGE_SIZE = 10;

interface FeedState {
  posts: FeedPost[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  nextStart?: number;
}

export function useFeed() {
  const [state, setState] = useState<FeedState>({
    posts: [],
    isLoading: true,
    isLoadingMore: false,
    error: null,
    nextStart: undefined,
  });

  const loadPage = useCallback(
    async (opts: { reset?: boolean } = {}) => {
      const { reset = false } = opts;
      const start = reset ? 0 : state.nextStart ?? 0;

      if (!reset && state.isLoadingMore) return;
      if (!reset && state.nextStart === undefined) return;

      setState((prev) => ({
        ...prev,
        isLoading: reset ? true : prev.isLoading,
        isLoadingMore: !reset,
        error: null,
      }));

      try {
        const response = await fetchHashtagFeed(start, PAGE_SIZE);
        const incoming = response.posts || [];

        setState((prev) => {
          const merged = reset ? incoming : [...prev.posts, ...incoming];
          const deduped = Array.from(new Map(merged.map((p) => [p.id, p])).values());

          const owners = deduped
            .filter((p) => p.is_owner)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          const pinned = owners.slice(0, 10);

          const nonOwners = deduped
            .filter((p) => !p.is_owner)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

          const ordered = [...pinned, ...nonOwners];

          return {
            ...prev,
            posts: ordered,
            isLoading: false,
            isLoadingMore: false,
            error: null,
            nextStart: response.nextStart,
          };
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: reset ? false : prev.isLoading,
          isLoadingMore: false,
          error: error as Error,
        }));
      }
    },
    [state.isLoadingMore, state.nextStart]
  );

  const refreshFeed = useCallback(async () => {
    await loadPage({ reset: true });
  }, [loadPage]);

  const loadMore = useCallback(async () => {
    await loadPage({ reset: false });
  }, [loadPage]);

  const prependPost = useCallback((post: FeedPost) => {
    setState((prev) => ({
      ...prev,
      posts: [post, ...prev.posts],
    }));
  }, []);

  useEffect(() => {
    loadPage({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    posts: state.posts,
    isLoading: state.isLoading,
    isLoadingMore: state.isLoadingMore,
    hasMore: state.nextStart !== undefined,
    error: state.error,
    refreshFeed,
    loadMore,
    prependPost,
  };
}
