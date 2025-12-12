const DEFAULT_HASHTAG = '#1ProTip';
const FEED_API_URL = '/api/feed';
const POST_API_URL = '/api/postToPage';

export type FeedResponse = {
  posts: FeedPost[];
  start: number;
  count: number;
  nextStart?: number;
  hashtag: string;
  synced?: number;
  pinnedCount?: number;
  total?: number;
};

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

export async function fetchHashtagFeed(
  start = 0,
  count = 10
): Promise<FeedResponse> {
  const params = new URLSearchParams({
    start: String(start),
    count: String(count),
  });

  const url = `${FEED_API_URL}?${params.toString()}`;


  const response = await fetch(url);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Feed request failed: ${text}`);
  }

  const data = (await response.json()) as FeedResponse | { posts?: FeedPost[] };


  const posts = "posts" in data ? data.posts || [] : [];

  return {
    posts,
    start: "start" in data && typeof data.start === "number" ? data.start : start,
    count: "count" in data && typeof data.count === "number" ? data.count : count,
    nextStart:
      "nextStart" in data && typeof data.nextStart === "number" ? data.nextStart : undefined,
    hashtag:
      "hashtag" in data && typeof data.hashtag === "string" ? data.hashtag : DEFAULT_HASHTAG,
    synced: "synced" in data && typeof data.synced === "number" ? data.synced : posts.length,
    pinnedCount:
      "pinnedCount" in data && typeof data.pinnedCount === "number" ? data.pinnedCount : undefined,
    total: "total" in data && typeof data.total === "number" ? data.total : undefined,
  };
}

export async function createAppPost(content: string): Promise<FeedPost> {
  const response = await fetch(POST_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Post creation failed: ${text}`);
  }

  return await response.json();
}
