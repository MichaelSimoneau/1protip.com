import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/services/supabase/client';
import type { Tip } from '@/services/supabase/types';

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

      const { data, error } = await supabase
        .from('tips')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setState({
        tips: data || [],
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
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('No active session');

      const { data, error } = await supabase
        .from('tips')
        .insert({
          content,
          user_id: session.session.user.id,
          published: false,
        })
        .select()
        .single();

      if (error) throw error;

      setState((prev) => ({
        ...prev,
        tips: [data, ...prev.tips],
      }));

      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const updateTip = useCallback(async (id: string, updates: Partial<Tip>) => {
    try {
      const { data, error } = await supabase
        .from('tips')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setState((prev) => ({
        ...prev,
        tips: prev.tips.map((tip) => (tip.id === id ? data : tip)),
      }));

      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const deleteTip = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('tips').delete().eq('id', id);

      if (error) throw error;

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
