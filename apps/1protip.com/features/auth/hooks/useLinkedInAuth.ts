import { useState, useCallback } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '@/services/supabase/client';

WebBrowser.maybeCompleteAuthSession();

const LINKEDIN_CLIENT_ID = process.env.EXPO_PUBLIC_LINKEDIN_CLIENT_ID || '';
const LINKEDIN_REDIRECT_URI =
  process.env.EXPO_PUBLIC_LINKEDIN_REDIRECT_URI ||
  Linking.createURL('/auth/linkedin/callback');

export interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  email?: string;
}

interface AuthState {
  isLoading: boolean;
  error: Error | null;
  profile: LinkedInProfile | null;
}

export function useLinkedInAuth() {
  const [state, setState] = useState<AuthState>({
    isLoading: false,
    error: null,
    profile: null,
  });

  const generateState = useCallback(() => {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }, []);

  const buildAuthUrl = useCallback((state: string): string => {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: LINKEDIN_CLIENT_ID,
      redirect_uri: LINKEDIN_REDIRECT_URI,
      state,
      scope: 'r_liteprofile r_emailaddress w_member_social',
    });

    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  }, []);

  const exchangeCodeForToken = useCallback(async (code: string): Promise<string> => {
    const { data, error } = await supabase.functions.invoke(
      'linkedin-oauth-exchange',
      {
        body: { code, redirect_uri: LINKEDIN_REDIRECT_URI },
      }
    );

    if (error) throw error;

    return data.access_token;
  }, []);

  const storeAccessToken = useCallback(async (token: string): Promise<void> => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error('No active session');

    const { error } = await supabase.from('profiles').upsert({
      id: session.session.user.id,
      linkedin_access_token: token,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;
  }, []);

  const handleCallback = useCallback(
    async (url: string, expectedState: string): Promise<void> => {
      const parsed = Linking.parse(url);
      const code = parsed.queryParams?.code as string;
      const state = parsed.queryParams?.state as string;

      if (state !== expectedState) {
        throw new Error('State mismatch - possible CSRF attack');
      }

      if (!code) {
        throw new Error('No authorization code received');
      }

      const token = await exchangeCodeForToken(code);
      await storeAccessToken(token);
    },
    [exchangeCodeForToken, storeAccessToken]
  );

  const getProfile = useCallback(async (): Promise<LinkedInProfile | null> => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return null;

    try {
      const { data, error } = await supabase.functions.invoke(
        'linkedin-get-profile',
        {
          body: {},
        }
      );

      if (error) {
        console.error('Error fetching LinkedIn profile:', error);
        return null;
      }

      setState((prev) => ({ ...prev, profile: data }));
      return data;
    } catch (error) {
      console.error('Error fetching LinkedIn profile:', error);
      return null;
    }
  }, []);

  const login = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const state = generateState();
      const authUrl = buildAuthUrl(state);

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        LINKEDIN_REDIRECT_URI
      );

      if (result.type === 'success' && result.url) {
        await handleCallback(result.url, state);

        const profile = await getProfile();
        setState((prev) => ({ ...prev, isLoading: false, profile }));
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }));
      throw error;
    }
  }, [generateState, buildAuthUrl, handleCallback, getProfile]);

  return {
    login,
    getProfile,
    isLoading: state.isLoading,
    error: state.error,
    profile: state.profile,
  };
}
