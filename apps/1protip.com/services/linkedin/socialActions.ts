import {
  commentOnPost as commentWithAppToken,
  likePost as likeWithAppToken,
  repostPost as repostWithAppToken,
} from './feed';

interface LinkedInSocialActionResponse {
  success: boolean;
  error?: string;
}

export async function likePost(postUrn: string): Promise<LinkedInSocialActionResponse> {
  try {
    await likeWithAppToken(postUrn);
    return { success: true };
  } catch (error) {
    console.error('Error liking post:', error);
    return { success: false, error: 'Failed to like post' };
  }
}

export async function commentOnPost(
  postUrn: string,
  commentText: string
): Promise<LinkedInSocialActionResponse> {
  try {
    await commentWithAppToken(postUrn, commentText);
    return { success: true };
  } catch (error) {
    console.error('Error commenting on post:', error);
    return { success: false, error: 'Failed to comment on post' };
  }
}

export async function repostPost(
  postUrn: string,
  commentary?: string
): Promise<LinkedInSocialActionResponse> {
  try {
    await repostWithAppToken(postUrn, commentary);
    return { success: true };
  } catch (error) {
    console.error('Error reposting:', error);
    return { success: false, error: 'Failed to repost' };
  }
}

export async function openLinkedInPost(postUrl: string): Promise<void> {
  const { Linking } = await import('react-native');
  const canOpen = await Linking.canOpenURL(postUrl);
  if (canOpen) {
    await Linking.openURL(postUrl);
  }
}
