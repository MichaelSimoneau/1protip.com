import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from './supabase';

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

export class LinkedInAuth {
  static async initiateLogin(): Promise<void> {
    const state = this.generateState();
    const authUrl = this.buildAuthUrl(state);

    try {
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        LINKEDIN_REDIRECT_URI
      );

      if (result.type === 'success' && result.url) {
        await this.handleCallback(result.url, state);
      }
    } catch (error) {
      console.error('LinkedIn auth error:', error);
      throw error;
    }
  }

  private static buildAuthUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: LINKEDIN_CLIENT_ID,
      redirect_uri: LINKEDIN_REDIRECT_URI,
      state,
      scope: 'r_liteprofile r_emailaddress w_member_social',
    });

    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  }

  private static async handleCallback(
    url: string,
    expectedState: string
  ): Promise<void> {
    const parsed = Linking.parse(url);
    const code = parsed.queryParams?.code as string;
    const state = parsed.queryParams?.state as string;

    if (state !== expectedState) {
      throw new Error('State mismatch - possible CSRF attack');
    }

    if (!code) {
      throw new Error('No authorization code received');
    }

    await this.exchangeCodeForToken(code);
  }

  private static async exchangeCodeForToken(code: string): Promise<void> {
    const { data, error } = await supabase.functions.invoke(
      'linkedin-oauth-exchange',
      {
        body: { code, redirect_uri: LINKEDIN_REDIRECT_URI },
      }
    );

    if (error) throw error;

    const { access_token } = data;
    await this.storeAccessToken(access_token);
  }

  private static async storeAccessToken(token: string): Promise<void> {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error('No active session');

    const { error } = await supabase.from('profiles').upsert({
      id: session.session.user.id,
      linkedin_access_token: token,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;
  }

  static async getProfile(): Promise<LinkedInProfile | null> {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return null;

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

    return data;
  }

  private static generateState(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
