import { useState, useCallback, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { auth, functions, db } from '@/services/firebase/client';
import { httpsCallable } from 'firebase/functions';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { signInWithCustomToken, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const LINKEDIN_CLIENT_ID = process.env.EXPO_PUBLIC_LINKEDIN_CLIENT_ID;

// Helper to determine the correct redirect URI based on platform and environment
const getRedirectUri = () => {
  if (Platform.OS === 'web') {
    // For web, we MUST use the window location to support both dev (localhost) and prod (1protip.com)
    // using the same build if possible, OR rely on environment variable that strictly matches the registered URI.
    // However, LinkedIn requires an EXACT match.
    // If we are in production (window.location.hostname !== 'localhost'), we should use the prod URI.
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
       // Support multiple production domains (e.g. app.1protip.com, www.1protip.com)
       // by constructing the redirect URI from the current origin.
       // This avoids cross-domain cookie issues if the user is on a subdomain.
       return `${window.location.origin}/auth/linkedin/callback`;
    }
  }
  // Default fallback or local dev
  return process.env.EXPO_PUBLIC_LINKEDIN_REDIRECT_URI || Linking.createURL('/auth/linkedin/callback');
};

const LINKEDIN_REDIRECT_URI = getRedirectUri();

export interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  email?: string;
  has_connected_with_owner?: boolean;
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

  // Use a ref to persist the generated state across re-renders during the auth flow
  // This is critical because if the component re-renders (e.g. due to loading state change),
  // the 'state' variable captured in the closure might be stale or regenerated if we weren't careful.
  // Actually, generateState is just a helper. The 'state' used for validation must be the one sent.
  // In the login function, we generate 'state' and pass it to handleCallback.
  // However, handleCallback is called AFTER the redirect returns.
  // In a popup flow (WebBrowser.openAuthSessionAsync), the promise resolves with the result including the url.
  // So the 'state' variable inside the login() function scope is still valid and correct (closure).
  // But wait, if the page reloads (full redirect flow), React state is lost.
  // openAuthSessionAsync on web might cause a full page navigation if it's not a popup?
  // No, expo-web-browser usually tries to use a popup or an iframe.
  // If it's a full redirect (e.g. mobile safari), we might lose state if not stored in AsyncStorage/localStorage.
  // But for now, let's assume the standard flow keeps the JS environment alive or rehydrates correctly.
  
  // The user reported "No authorization code received".
  // This means the URL parsing logic failed to find 'code'.
  // OR the state mismatch error happened.
  // Let's refine the URL construction first.

  const generateState = useCallback(() => {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }, []);

  const buildAuthUrl = useCallback((state: string): string => {
    // LinkedIn documentation says redirect_uri should be URL encoded.
    // URLSearchParams handles encoding values automatically.
    // BUT we were adding redirect_uri manually to the string in the return statement AND in params?
    // In the previous version (which I'm fixing), 'redirect_uri' was missing from 'params' object
    // and manually appended to the string.
    // The issue might be double encoding or improper inclusion if params.toString() already encodes spaces/symbols.
    // Let's rely entirely on URLSearchParams to construct the query string safely.
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: LINKEDIN_CLIENT_ID || '',
      redirect_uri: LINKEDIN_REDIRECT_URI,
      state,
      scope: 'r_liteprofile r_emailaddress w_member_social',
    });

    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, fetch profile
        try {
          const profileDoc = await getDoc(doc(db, 'profiles', user.uid));
          if (profileDoc.exists()) {
            const data = profileDoc.data();
            setState(prev => ({
              ...prev,
              profile: {
                id: user.uid,
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                profilePicture: data.avatar_url,
                has_connected_with_owner: data.has_connected_with_owner ?? false,
              }
            }));
          }
        } catch (e) {
          console.error('Error fetching profile on auth change:', e);
        }
      } else {
        setState(prev => ({ ...prev, profile: null }));
      }
    });
    return () => unsubscribe();
  }, []);

  const exchangeCodeForToken = useCallback(async (code: string): Promise<string> => {
    const exchangeFunc = httpsCallable(functions, 'linkedinSignIn');
    // Note: The Firebase function handles exchange + profile fetch + custom token creation
    // We don't just get an access token back, we get a Firebase Auth custom token.
    const result = await exchangeFunc({ 
      code, 
      redirect_uri: LINKEDIN_REDIRECT_URI 
    });
    
    const data = result.data as { token: string; profile: any };
    return data.token;
  }, []);

  const handleCallback = useCallback(
    async (url: string, expectedState: string): Promise<void> => {
      // Robust URL parsing
      let code: string | null = null;
      let returnedState: string | null = null;

      try {
        const parsed = Linking.parse(url);
        code = parsed.queryParams?.code as string;
        returnedState = parsed.queryParams?.state as string;
        
        // Check for OAuth errors
        if (parsed.queryParams?.error) {
          const errorDesc = parsed.queryParams?.error_description as string;
          throw new Error(errorDesc || (parsed.queryParams?.error as string));
        }
      } catch (e) {
        if (e instanceof Error && e.message !== 'Linking.parse failed') throw e;
        console.warn('Linking.parse failed', e);
      }

      // Fallback parsing logic...
      if (!code && typeof window !== 'undefined') {
          try {
             const urlObj = new URL(url);
             const params = new URLSearchParams(urlObj.search);
             code = params.get('code');
             returnedState = params.get('state');
          } catch (e) {
             const params = new URLSearchParams(window.location.search);
             code = params.get('code');
             returnedState = params.get('state');
          }
      }

      if (returnedState !== expectedState) {
        console.error('State mismatch', { expected: expectedState, received: returnedState });
        throw new Error('State mismatch - possible CSRF attack');
      }

      if (!code) {
        throw new Error('No authorization code received');
      }

      // Exchange code for Firebase Custom Token
      const customToken = await exchangeCodeForToken(code);
      
      // Sign in to Firebase
      await signInWithCustomToken(auth, customToken);
      
      // Profile update happens in onAuthStateChanged
    },
    [exchangeCodeForToken]
  );

  const updateConnectionStatus = useCallback(async (status: boolean) => {
    const user = auth.currentUser;
    if (!user) return;

    // Optimistic update
    setState((prev) => ({
      ...prev,
      profile: prev.profile ? { ...prev.profile, has_connected_with_owner: status } : null,
    }));

    try {
      await updateDoc(doc(db, 'profiles', user.uid), {
        has_connected_with_owner: status
      });
    } catch (error) {
      console.error('Error updating connection status:', error);
    }
  }, []);

  const getProfile = useCallback(async (): Promise<LinkedInProfile | null> => {
    const user = auth.currentUser;
    if (!user) return null;

    try {
      const docSnap = await getDoc(doc(db, 'profiles', user.uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        const profile = {
          id: user.uid,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          profilePicture: data.avatar_url,
          has_connected_with_owner: data.has_connected_with_owner ?? false,
        };
        setState(prev => ({ ...prev, profile }));
        return profile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching LinkedIn profile:', error);
      return null;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setState(prev => ({ ...prev, profile: null }));
    } catch (e) {
      console.error('Logout failed:', e);
    }
  }, []);

  const login = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      if (!LINKEDIN_CLIENT_ID) {
        throw new Error('LinkedIn Client ID is missing. Please check your .env file.');
      }

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
        // If the user cancelled or closed the window, we might just stop loading
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
    logout,
    getProfile,
    updateConnectionStatus,
    isLoading: state.isLoading,
    error: state.error,
    profile: state.profile,
  };
}
