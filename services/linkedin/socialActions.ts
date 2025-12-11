import { supabase } from '@/services/supabase/client';

interface LinkedInSocialActionResponse {
  success: boolean;
  error?: string;
}

async function getAccessToken(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('linkedin_access_token')
    .eq('id', user.id)
    .maybeSingle();

  return profile?.linkedin_access_token || null;
}

export async function likePost(postUrn: string): Promise<LinkedInSocialActionResponse> {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch('https://api.linkedin.com/v2/reactions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        actor: 'urn:li:person:CURRENT_USER',
        object: postUrn,
        reactionType: 'LIKE',
      }),
    });

    if (!response.ok) {
      return { success: false, error: 'Failed to like post' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error liking post:', error);
    return { success: false, error: 'Network error' };
  }
}

export async function commentOnPost(
  postUrn: string,
  commentText: string
): Promise<LinkedInSocialActionResponse> {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch('https://api.linkedin.com/v2/socialActions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        actor: 'urn:li:person:CURRENT_USER',
        object: postUrn,
        message: {
          text: commentText,
        },
      }),
    });

    if (!response.ok) {
      return { success: false, error: 'Failed to comment on post' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error commenting on post:', error);
    return { success: false, error: 'Network error' };
  }
}

export async function repostPost(
  postUrn: string,
  commentary?: string
): Promise<LinkedInSocialActionResponse> {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch('https://api.linkedin.com/rest/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202412',
      },
      body: JSON.stringify({
        author: 'urn:li:person:CURRENT_USER',
        commentary: commentary || '',
        visibility: 'PUBLIC',
        distribution: {
          feedDistribution: 'MAIN_FEED',
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        lifecycleState: 'PUBLISHED',
        isReshareDisabledByAuthor: false,
        reshareContext: {
          parent: postUrn,
        },
      }),
    });

    if (!response.ok) {
      return { success: false, error: 'Failed to repost' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error reposting:', error);
    return { success: false, error: 'Network error' };
  }
}

export async function openLinkedInPost(postUrl: string): Promise<void> {
  const { Linking } = await import('react-native');
  const canOpen = await Linking.canOpenURL(postUrl);
  if (canOpen) {
    await Linking.openURL(postUrl);
  }
}
