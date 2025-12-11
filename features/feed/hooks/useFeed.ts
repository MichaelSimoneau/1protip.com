import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/services/supabase/client';
import type { Tip } from '@/services/supabase/types';

interface FeedState {
  posts: Tip[];
  isLoading: boolean;
  error: Error | null;
}

export function useFeed() {
  const [state, setState] = useState<FeedState>({
    posts: [],
    isLoading: true,
    error: null,
  });

  const syncLinkedInPosts = useCallback(async () => {
    try {
      await supabase.functions.invoke('linkedin-get-posts', {
        body: {},
      });
    } catch (error) {
      console.log('LinkedIn sync skipped:', error);
    }
  }, []);

  const fetchPublishedTips = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      await syncLinkedInPosts();

      const { data, error } = await supabase
        .from('tips')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setState({
        posts: data || [],
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
  }, [syncLinkedInPosts]);

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
