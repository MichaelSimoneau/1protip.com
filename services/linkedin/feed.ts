import { Platform } from 'react-native';

const CLIENT_ID =
  process.env.EXPO_PUBLIC_CLIENT_ID ||
  process.env.EXPO_PUBLIC_LINKEDIN_CLIENT_ID ||
  '';
const CLIENT_SECRET =
  process.env.EXPO_SECRET_CLIENT_SECRET ||
  process.env.EXPO_SECRET_LINKEDIN_CLIENT_SECRET ||
  '';
const OWNER_URN =
  process.env.EXPO_PUBLIC_LINKEDIN_OWNER_URN || 'urn:li:person:michaelsimoneau';
const OWNER_HANDLE =
  process.env.EXPO_PUBLIC_LINKEDIN_OWNER_HANDLE || 'michaelsimoneau';
const DEFAULT_HASHTAG = '#1ProTip';

type LinkedInPostElement = {
  id?: string;
  urn?: string;
  commentary?: { text?: string };
  content?: { text?: string };
  summary?: string;
  author?: string;
  lifecycleState?: string;
  createdAt?: string | number;
  created?: { time?: number };
  lifecycleStateInfo?: { createdAt?: number };
  distribution?: { feedDistribution?: string };
  media?: { title?: string; description?: string; originalUrl?: string };
  visibility?: string;
  actor?: string;
  actorName?: string;
  actorProfileUrl?: string;
  actorImageUrl?: string;
  permalink?: string;
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

type LinkedInSearchResponse = {
  elements?: LinkedInPostElement[];
};

let cachedToken: { token: string; expiresAt: number } | null = null;

function assertEnv() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error(
      'LinkedIn API credentials missing: set EXPO_PUBLIC_CLIENT_ID/EXPO_PUBLIC_LINKEDIN_CLIENT_ID and EXPO_SECRET_CLIENT_SECRET/EXPO_SECRET_LINKEDIN_CLIENT_SECRET'
    );
  }
}

async function getAppAccessToken(): Promise<string> {
  assertEnv();

  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 30_000) {
    return cachedToken.token;
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LinkedIn token request failed: ${text}`);
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };

  return cachedToken.token;
}

function isOwner(authorUrn?: string, authorProfileUrl?: string) {
  if (!authorUrn && !authorProfileUrl) return false;
  const urnMatch =
    authorUrn &&
    (authorUrn === OWNER_URN ||
      authorUrn.endsWith(OWNER_HANDLE) ||
      authorUrn.includes(OWNER_HANDLE));
  const urlMatch =
    authorProfileUrl && authorProfileUrl.toLowerCase().includes(OWNER_HANDLE.toLowerCase());
  return Boolean(urnMatch || urlMatch);
}

function normalizePost(element: LinkedInPostElement): FeedPost | null {
  const id = element.urn || element.id;
  if (!id) return null;

  const content =
    element.commentary?.text ||
    element.content?.text ||
    element.summary ||
    element.media?.description ||
    '';

  if (!content.toLowerCase().includes(DEFAULT_HASHTAG.toLowerCase())) {
    return null;
  }

  const createdMs =
    typeof element.createdAt === 'number'
      ? element.createdAt
      : typeof element.createdAt === 'string'
        ? Date.parse(element.createdAt)
        : element.created?.time ??
          element.lifecycleStateInfo?.createdAt ??
          Date.now();

  const authorUrn = element.author || element.actor;
  const authorProfileUrl = element.permalink || element.actorProfileUrl;
  const owner = isOwner(authorUrn, authorProfileUrl);

  return {
    id,
    content,
    created_at: new Date(createdMs || Date.now()).toISOString(),
    linkedin_post_id: id,
    author_name: owner ? 'Michael Simoneau' : element.actorName || 'LinkedIn User',
    author_avatar_url: element.actorImageUrl || undefined,
    author_profile_url: authorProfileUrl,
    is_owner: owner,
  };
}

function sortPosts(posts: FeedPost[]): FeedPost[] {
  return [...posts].sort((a, b) => {
    if (a.is_owner && !b.is_owner) return -1;
    if (!a.is_owner && b.is_owner) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export async function fetchHashtagFeed(hashtag = DEFAULT_HASHTAG): Promise<FeedPost[]> {
  const token = await getAppAccessToken();
  const searchUrl = `https://api.linkedin.com/rest/posts?q=search&keywords=${encodeURIComponent(
    hashtag
  )}&count=50`;

  const response = await fetch(searchUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      'LinkedIn-Version': '202412',
      'X-Restli-Protocol-Version': '2.0.0',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LinkedIn feed request failed: ${text}`);
  }

  const data = (await response.json()) as LinkedInSearchResponse;
  const posts =
    data.elements
      ?.map((element) => normalizePost(element))
      .filter((p): p is FeedPost => Boolean(p)) ?? [];

  return sortPosts(posts);
}

export async function likePost(postUrn: string): Promise<void> {
  const token = await getAppAccessToken();
  const response = await fetch('https://api.linkedin.com/v2/reactions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      actor: OWNER_URN,
      object: postUrn,
      reactionType: 'LIKE',
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to like post: ${text}`);
  }
}

export async function commentOnPost(postUrn: string, commentText: string): Promise<void> {
  const token = await getAppAccessToken();
  const response = await fetch('https://api.linkedin.com/v2/socialActions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      actor: OWNER_URN,
      object: postUrn,
      message: { text: commentText },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to comment: ${text}`);
  }
}

export async function repostPost(postUrn: string, commentary = ''): Promise<void> {
  const token = await getAppAccessToken();
  const response = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
      'LinkedIn-Version': '202412',
    },
    body: JSON.stringify({
      author: OWNER_URN,
      commentary,
      visibility: 'PUBLIC',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false,
      reshareContext: { parent: postUrn },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to repost: ${text}`);
  }
}

export function getLinkedInOwnerInfo() {
  return {
    ownerUrn: OWNER_URN,
    ownerHandle: OWNER_HANDLE,
    hashtag: DEFAULT_HASHTAG,
    platform: Platform.OS,
  };
}
