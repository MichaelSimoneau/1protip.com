interface LinkedInSocialActionResponse {
  success: boolean;
  error?: string;
}

type SocialAction = 'like' | 'comment' | 'repost';

const SOCIAL_ACTION_URL = '/api/socialActions';

const sendSocialAction = async (
  action: SocialAction,
  body: Record<string, unknown>,
): Promise<LinkedInSocialActionResponse> => {
  try {
    const response = await fetch(SOCIAL_ACTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, ...body }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Request failed');
    }

    const data = await response.json().catch(() => null);
    if (data && typeof data.success === 'boolean') {
      return data as LinkedInSocialActionResponse;
    }

    return { success: true };
  } catch (error) {
    console.error(`Error performing ${action}:`, error);
    return { success: false, error: `Failed to ${action} post` };
  }
};

export async function likePost(
  postUrn: string,
): Promise<LinkedInSocialActionResponse> {
  return sendSocialAction('like', { postUrn });
}

export async function commentOnPost(
  postUrn: string,
  commentText: string,
): Promise<LinkedInSocialActionResponse> {
  return sendSocialAction('comment', { postUrn, commentText });
}

export async function repostPost(
  postUrn: string,
  commentary?: string,
): Promise<LinkedInSocialActionResponse> {
  return sendSocialAction('repost', { postUrn, commentary });
}

export async function openLinkedInPost(postUrl: string): Promise<void> {
  const { Linking } = await import('react-native');
  const canOpen = await Linking.canOpenURL(postUrl);
  if (canOpen) {
    await Linking.openURL(postUrl);
  }
}
