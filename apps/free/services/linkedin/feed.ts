import { Platform } from 'react-native';

const getBaseUrl = () => {
  if (Platform.OS === 'web') return '';
  return process.env.EXPO_PUBLIC_API_URL || 'https://hashtag-1-pro-tip.web.app';
};

const API_BASE = getBaseUrl();
const DEFAULT_HASHTAG = '#1ProTip';
const FEED_API_URL = `${API_BASE}/api/feed`;
const POST_API_URL = `${API_BASE}/api/postToPage`;

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

export async function likePost(postUrn: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postUrn }),
  });

  if (!response.ok) {
     console.warn('Like failed', await response.text());
     // We suppress throw here for better UX unless critical, or handle in caller
     // throw new Error('Failed to like');
  }
}

export async function commentOnPost(postUrn: string, text: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postUrn, text }),
  });

  if (!response.ok) {
    throw new Error(`Comment failed: ${await response.text()}`);
  }
}

export async function repostPost(postUrn: string, commentary?: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/repost`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postUrn, commentary }),
  });

  if (!response.ok) {
    throw new Error(`Repost failed: ${await response.text()}`);
  }
}
