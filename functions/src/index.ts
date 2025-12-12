/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";
import * as logger from "firebase-functions/logger";

setGlobalOptions({
  region: "us-central1",
  maxInstances: 10,
});

type LinkedInPostElement = {
  id?: string;
  urn?: string;
  commentary?: {text?: string};
  content?: {text?: string};
  summary?: string;
  author?: string;
  actor?: string;
  actorName?: string;
  actorImageUrl?: string;
  actorProfileUrl?: string;
  createdAt?: string | number;
  created?: {time?: number};
  lifecycleStateInfo?: {createdAt?: number};
  permalink?: string;
};

type FeedPost = {
  id: string;
  content: string;
  created_at: string;
  linkedin_post_id?: string;
  author_name?: string;
  author_avatar_url?: string;
  author_profile_url?: string;
  is_owner?: boolean;
};

const CLIENT_ID =
  process.env.LINKEDIN_CLIENT_ID ||
  process.env.EXPO_PUBLIC_CLIENT_ID ||
  process.env.EXPO_PUBLIC_LINKEDIN_CLIENT_ID;
const CLIENT_SECRET =
  process.env.LINKEDIN_CLIENT_SECRET ||
  process.env.EXPO_SECRET_CLIENT_SECRET ||
  process.env.EXPO_SECRET_LINKEDIN_CLIENT_SECRET;
const SERVICE_TOKEN =
  process.env.LINKEDIN_SERVICE_ACCESS_TOKEN ||
  process.env.LINKEDIN_SERVICE_TOKEN;
const OWNER_URN =
  process.env.LINKEDIN_OWNER_URN || "urn:li:person:michaelsimoneau";
const OWNER_HANDLE =
  process.env.LINKEDIN_OWNER_HANDLE || "michaelsimoneau";
const DEFAULT_HASHTAG = "#1ProTip";
const DEFAULT_COUNT = 10;
const MAX_COUNT = 100;
const MAX_REQUESTS = 5;
const LINKEDIN_PAGE_LIMIT = 50;

function isOwner(authorUrn?: string, authorProfileUrl?: string) {
  if (!authorUrn && !authorProfileUrl) return false;
  const urnMatch =
    authorUrn &&
    (authorUrn === OWNER_URN ||
      authorUrn.endsWith(OWNER_HANDLE) ||
      authorUrn.includes(OWNER_HANDLE));
  const urlMatch =
    authorProfileUrl &&
    authorProfileUrl.toLowerCase().includes(OWNER_HANDLE.toLowerCase());
  return Boolean(urnMatch || urlMatch);
}

async function getAppAccessToken(): Promise<string> {
  if (SERVICE_TOKEN) {
    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/8b03ddb3-6464-4674-b4fe-3cc7ab9454d1", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "pre-fix",
        hypothesisId: "H3",
        location: "functions/src/index.ts:getAppAccessToken",
        message: "using service token",
        data: { hasServiceToken: true },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    return SERVICE_TOKEN;
  }

  // #region agent log
  fetch("http://127.0.0.1:7243/ingest/8b03ddb3-6464-4674-b4fe-3cc7ab9454d1", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      sessionId: "debug-session",
      runId: "pre-fix",
      hypothesisId: "H3",
      location: "functions/src/index.ts:getAppAccessToken",
      message: "env check",
      data: {
        hasClientId: Boolean(CLIENT_ID),
        hasClientSecret: Boolean(CLIENT_SECRET),
        envKeysPresent: [
          CLIENT_ID ? "CLIENT_ID" : null,
          process.env.EXPO_PUBLIC_CLIENT_ID ? "EXPO_PUBLIC_CLIENT_ID" : null,
          process.env.EXPO_PUBLIC_LINKEDIN_CLIENT_ID ? "EXPO_PUBLIC_LINKEDIN_CLIENT_ID" : null,
          process.env.LINKEDIN_CLIENT_ID ? "LINKEDIN_CLIENT_ID" : null,
          CLIENT_SECRET ? "CLIENT_SECRET" : null,
          process.env.EXPO_SECRET_CLIENT_SECRET ? "EXPO_SECRET_CLIENT_SECRET" : null,
          process.env.EXPO_SECRET_LINKEDIN_CLIENT_SECRET ? "EXPO_SECRET_LINKEDIN_CLIENT_SECRET" : null,
          process.env.LINKEDIN_CLIENT_SECRET ? "LINKEDIN_CLIENT_SECRET" : null,
        ].filter(Boolean),
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  if (!CLIENT_ID || !CLIENT_SECRET) {
    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/8b03ddb3-6464-4674-b4fe-3cc7ab9454d1", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "pre-fix",
        hypothesisId: "H3",
        location: "functions/src/index.ts:getAppAccessToken",
        message: "missing credentials",
        data: {
          hasClientId: Boolean(CLIENT_ID),
          hasClientSecret: Boolean(CLIENT_SECRET),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    throw new Error(
      "LinkedIn API credentials missing: set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET"
    );
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text();

    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/8b03ddb3-6464-4674-b4fe-3cc7ab9454d1", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "pre-fix",
        hypothesisId: "H3",
        location: "functions/src/index.ts:getAppAccessToken",
        message: "token request failed",
        data: { status: response.status, text: text.slice(0, 200) },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    throw new Error(`LinkedIn token request failed: ${text}`);
  }

  const data = (await response.json()) as {access_token: string};
  return data.access_token;
}

function normalizePost(element: LinkedInPostElement, hashtag: string): FeedPost | null {
  const id = element.urn || element.id;
  if (!id) return null;

  const content =
    element.commentary?.text ||
    element.content?.text ||
    element.summary ||
    "";

  // Require the exact hashtag substring (case-insensitive).
  if (!content.toLowerCase().includes(hashtag.toLowerCase())) {
    return null;
  }

  const createdMs =
    typeof element.createdAt === "number" ?
      element.createdAt :
      typeof element.createdAt === "string" ?
        Date.parse(element.createdAt) :
        element.created?.time ??
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
    author_name: owner ? "Michael Simoneau" : element.actorName || "LinkedIn User",
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

async function fetchLinkedInSearchPage(
  token: string,
  hashtag: string,
  start: number,
  count: number,
): Promise<LinkedInPostElement[]> {
  const url = new URL("https://api.linkedin.com/rest/posts");
  url.searchParams.set("q", "search");
  url.searchParams.set("keywords", hashtag);
  url.searchParams.set("start", String(start));
  url.searchParams.set("count", String(count));

  const response = await fetch(url.toString(), {
    headers: {
      "Authorization": `Bearer ${token}`,
      "LinkedIn-Version": "202412",
      "X-Restli-Protocol-Version": "2.0.0",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LinkedIn feed request failed: ${text}`);
  }

  const data = (await response.json()) as {elements?: LinkedInPostElement[]};
  return data.elements ?? [];
}

export const feed = onRequest(
  { cors: true },
  async (req, res) => {
    try {
      // Force the only supported hashtag.
      const hashtag = DEFAULT_HASHTAG;

      const startParam = Number(req.query.start ?? 0);
      const countParam = Number(req.query.count ?? DEFAULT_COUNT);

      const start = Number.isFinite(startParam) && startParam > 0 ? Math.floor(startParam) : 0;
      const requestedCount = Number.isFinite(countParam) && countParam > 0 ?
        Math.min(Math.floor(countParam), MAX_COUNT) :
        DEFAULT_COUNT;

      // #region agent log
      fetch("http://127.0.0.1:7243/ingest/8b03ddb3-6464-4674-b4fe-3cc7ab9454d1", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          sessionId: "debug-session",
          runId: "pre-fix",
          hypothesisId: "H2",
          location: "functions/src/index.ts:feed",
          message: "feed request start",
          data: { start, requestedCount, rawQuery: req.query },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion

      const token = await getAppAccessToken();

      const collected: FeedPost[] = [];
      const seen = new Set<string>();
      let cursor = 0;
      let remaining = MAX_COUNT;
      let requests = 0;

      // Collect up to MAX_COUNT so we can pin owner posts reliably.
      while (remaining > 0 && requests < MAX_REQUESTS) {
        const fetchCount = Math.min(LINKEDIN_PAGE_LIMIT, Math.max(remaining, DEFAULT_COUNT));
        const elements = await fetchLinkedInSearchPage(token, hashtag, cursor, fetchCount);
        requests += 1;

        if (!elements.length) {
          // #region agent log
          fetch("http://127.0.0.1:7243/ingest/8b03ddb3-6464-4674-b4fe-3cc7ab9454d1", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
              sessionId: "debug-session",
              runId: "pre-fix",
              hypothesisId: "H2",
              location: "functions/src/index.ts:feed",
              message: "linkedin page empty",
              data: { cursor, fetchCount },
              timestamp: Date.now(),
            }),
          }).catch(() => {});
          // #endregion
          break;
        }

        const normalized = elements
          .map((element) => normalizePost(element, hashtag))
          .filter((p): p is FeedPost => Boolean(p));

        // #region agent log
        fetch("http://127.0.0.1:7243/ingest/8b03ddb3-6464-4674-b4fe-3cc7ab9454d1", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            sessionId: "debug-session",
            runId: "pre-fix",
            hypothesisId: "H2",
            location: "functions/src/index.ts:feed",
            message: "linkedin page fetched",
            data: { cursor, fetchCount, elements: elements.length, normalized: normalized.length },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion

        for (const post of normalized) {
          if (!seen.has(post.id) && collected.length < MAX_COUNT) {
            seen.add(post.id);
            collected.push(post);
          }
        }

        cursor += elements.length;
        remaining = MAX_COUNT - collected.length;

        if (collected.length >= MAX_COUNT) {
          break;
        }
      }

      // Order: newest owner posts pinned to the top (up to 10), then everyone else.
      const sortedByOwnerThenDate = sortPosts(collected);
      const ownerSorted = sortedByOwnerThenDate.filter((p) => p.is_owner);
      const pinned = ownerSorted.slice(0, 10);
      const others = sortedByOwnerThenDate.filter((p) => !p.is_owner);
      const ordered = [...pinned, ...others];

      const page = ordered.slice(start, start + requestedCount);
      const nextStart = start + page.length < ordered.length ? start + page.length : undefined;

      // #region agent log
      fetch("http://127.0.0.1:7243/ingest/8b03ddb3-6464-4674-b4fe-3cc7ab9454d1", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          sessionId: "debug-session",
          runId: "pre-fix",
          hypothesisId: "H2",
          location: "functions/src/index.ts:feed",
          message: "response ready",
          data: { total: ordered.length, page: page.length, pinned: pinned.length, start, nextStart },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion

      res.status(200).json({
        posts: page,
        synced: ordered.length,
        start,
        count: requestedCount,
        nextStart,
        hashtag,
        pinnedCount: pinned.length,
        total: ordered.length,
      });
    } catch (error: unknown) {
      logger.error("feed error", error);
      // #region agent log
      fetch("http://127.0.0.1:7243/ingest/8b03ddb3-6464-4674-b4fe-3cc7ab9454d1", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          sessionId: "debug-session",
          runId: "pre-fix",
          hypothesisId: "H2",
          location: "functions/src/index.ts:feed",
          message: "feed error",
          data: { error: error instanceof Error ? error.message : String(error) },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Internal server error",
      });
    }
  }
);
