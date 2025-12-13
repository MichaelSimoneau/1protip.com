import { useState, useCallback, useEffect } from 'react';
import { auth, db } from '@/services/firebase/client';
import { collection, addDoc, updateDoc, deleteDoc, getDocs, query, orderBy, doc, Timestamp } from 'firebase/firestore';

export type Tip = {
  id: string;
  content: string;
  created_at: string;
  published: boolean;
  user_id: string;
  linkedin_url?: string;
};

interface TipsState {
  tips: Tip[];
  isLoading: boolean;
  error: Error | null;
}

export function useTips() {
  const [state, setState] = useState<TipsState>({
    tips: [],
    isLoading: true,
    error: null,
  });

  const fetchTips = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const q = query(collection(db, 'tips'), orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const tips: Tip[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tips.push({
          id: doc.id,
          content: data.content,
          created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
          published: data.published,
          user_id: data.user_id,
          linkedin_url: data.linkedin_url,
        });
      });

      setState({
        tips,
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

  const createTip = useCallback(async (content: string) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No active session');

      const now = Timestamp.now();
      const newTipData = {
        content,
        user_id: user.uid,
        published: false,
        created_at: now,
        updated_at: now,
      };

      const docRef = await addDoc(collection(db, 'tips'), newTipData);
      
      const newTip: Tip = {
        id: docRef.id,
        content: newTipData.content,
        created_at: now.toDate().toISOString(),
        published: newTipData.published,
        user_id: newTipData.user_id,
      };

      setState((prev) => ({
        ...prev,
        tips: [newTip, ...prev.tips],
      }));

      return newTip;
    } catch (error) {
      throw error;
    }
  }, []);

  const updateTip = useCallback(async (id: string, updates: Partial<Tip>) => {
    try {
      const tipRef = doc(db, 'tips', id);
      await updateDoc(tipRef, {
        ...updates,
        updated_at: Timestamp.now()
      });

      setState((prev) => ({
        ...prev,
        tips: prev.tips.map((tip) => (tip.id === id ? { ...tip, ...updates } : tip)),
      }));

      return { id, ...updates };
    } catch (error) {
      throw error;
    }
  }, []);

  const deleteTip = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tips', id));

      setState((prev) => ({
        ...prev,
        tips: prev.tips.filter((tip) => tip.id !== id),
      }));
    } catch (error) {
      throw error;
    }
  }, []);

  useEffect(() => {
    fetchTips();
  }, [fetchTips]);

  return {
    tips: state.tips,
    isLoading: state.isLoading,
    error: state.error,
    fetchTips,
    createTip,
    updateTip,
    deleteTip,
  };
}
