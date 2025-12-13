import { useState, useEffect, useCallback } from 'react';
import { auth, db } from '@/services/firebase/client';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export function useHashtagPreferences() {
  const [hashtags, setHashtags] = useState<string[]>(['#1protip']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadHashtags = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        setHashtags(['#1protip']);
        return;
      }

      const docSnap = await getDoc(doc(db, 'profiles', user.uid));
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.hashtag_preferences && Array.isArray(data.hashtag_preferences) && data.hashtag_preferences.length > 0) {
          setHashtags(data.hashtag_preferences);
        } else {
          setHashtags(['#1protip']);
        }
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
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      await updateDoc(doc(db, 'profiles', user.uid), {
        hashtag_preferences: newHashtags
      });

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
