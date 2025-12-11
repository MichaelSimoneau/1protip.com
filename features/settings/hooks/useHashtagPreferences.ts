import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabase/client';

export function useHashtagPreferences() {
  const [hashtags, setHashtags] = useState<string[]>(['#1protip']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadHashtags = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setHashtags(['#1protip']);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('hashtag_preferences')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profile?.hashtag_preferences && profile.hashtag_preferences.length > 0) {
        setHashtags(profile.hashtag_preferences);
      } else {
        setHashtags(['#1protip']);
      }
    } catch (err) {
      console.error('Error loading hashtag preferences:', err);
      setError(err as Error);
      setHashtags(['#1protip']);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveHashtags = useCallback(async (newHashtags: string[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ hashtag_preferences: newHashtags })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setHashtags(newHashtags);
    } catch (err) {
      console.error('Error saving hashtag preferences:', err);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addHashtag = useCallback(async (hashtag: string) => {
    const formattedTag = hashtag.startsWith('#') ? hashtag : `#${hashtag}`;
    const lowercaseTag = formattedTag.toLowerCase();

    if (hashtags.includes(lowercaseTag)) {
      return;
    }

    const newHashtags = [...hashtags, lowercaseTag];
    await saveHashtags(newHashtags);
  }, [hashtags, saveHashtags]);

  const removeHashtag = useCallback(async (hashtag: string) => {
    if (hashtag === '#1protip') {
      return;
    }

    const newHashtags = hashtags.filter(h => h !== hashtag);
    await saveHashtags(newHashtags);
  }, [hashtags, saveHashtags]);

  useEffect(() => {
    loadHashtags();
  }, [loadHashtags]);

  return {
    hashtags,
    isLoading,
    error,
    addHashtag,
    removeHashtag,
    refreshHashtags: loadHashtags,
  };
}
