const DEFAULT_HASHTAG = '#1ProTip';
const FEED_API_URL =
  process.env.EXPO_PUBLIC_FEED_API_URL ||
  'https://hashtag-1-pro-tip.web.app/api/feed';

export type FeedPost = {
  id: string;
  content: string;
  created_at: string;
  linkedin_post_id?: string;
  author_name?: string;
  author_avatar_url?: string;
  author_profile_url?: string;
  is_owner?: boolean;
};

export async function fetchHashtagFeed(hashtag = DEFAULT_HASHTAG): Promise<FeedPost[]> {
  const url = `${FEED_API_URL}?hashtag=${encodeURIComponent(hashtag)}`;
  const response = await fetch(url);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Feed request failed: ${text}`);
  }

  const data = (await response.json()) as { posts?: FeedPost[] };
  return data.posts || [];
}
