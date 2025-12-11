import { useState, useEffect, useCallback } from 'react';

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: immediate,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, isLoading: true, error: null });

    try {
      const response = await asyncFunction();
      setState({ data: response, isLoading: false, error: null });
      return response;
    } catch (error) {
      setState({ data: null, isLoading: false, error: error as Error });
      throw error;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { ...state, execute };
}
