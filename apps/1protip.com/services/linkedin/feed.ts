const DEFAULT_HASHTAG = '#1ProTip';
const FEED_API_URL = '/api/feed';

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

  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/8b03ddb3-6464-4674-b4fe-3cc7ab9454d1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1',location:'services/linkedin/feed.ts:fetchHashtagFeed',message:'request start',data:{url,origin:typeof location!=='undefined'?location.href:'unknown',start,count},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  const response = await fetch(url);

  if (!response.ok) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/8b03ddb3-6464-4674-b4fe-3cc7ab9454d1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1',location:'services/linkedin/feed.ts:fetchHashtagFeed',message:'request failed',data:{status:response.status,statusText:response.statusText,url},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    const text = await response.text();
    throw new Error(`Feed request failed: ${text}`);
  }

  const data = (await response.json()) as FeedResponse | { posts?: FeedPost[] };

  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/8b03ddb3-6464-4674-b4fe-3cc7ab9454d1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1',location:'services/linkedin/feed.ts:fetchHashtagFeed',message:'request success',data:{status:response.status,receivedPosts:Array.isArray((data as any).posts)?(data as any).posts.length:0,start,dataStart:(data as any).start,nextStart:(data as any).nextStart},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

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
