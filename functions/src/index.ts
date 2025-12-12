/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
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

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const OWNER_URN =
  process.env.LINKEDIN_OWNER_URN || "urn:li:person:michaelsimoneau";
const OWNER_HANDLE =
  process.env.LINKEDIN_OWNER_HANDLE || "michaelsimoneau";
const DEFAULT_HASHTAG = "#1ProTip";

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
  if (!CLIENT_ID || !CLIENT_SECRET) {
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
    headers: {"Content-Type": "application/x-www-form-urlencoded"},
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LinkedIn token request failed: ${text}`);
  }

  const data = (await response.json()) as {access_token: string};
  return data.access_token;
}

function normalizePost(element: LinkedInPostElement): FeedPost | null {
  const id = element.urn || element.id;
  if (!id) return null;

  const content =
    element.commentary?.text ||
    element.content?.text ||
    element.summary ||
    "";

  if (!content.toLowerCase().includes(DEFAULT_HASHTAG.toLowerCase())) {
    return null;
  }

  const createdMs =
    typeof element.createdAt === "number"
      ? element.createdAt
      : typeof element.createdAt === "string"
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

export const feed = onRequest(
  {cors: true},
  async (req, res) => {
    try {
      const hashtagParam = (req.query.hashtag as string | undefined)?.trim();
      const hashtag = hashtagParam && hashtagParam.length ? hashtagParam : DEFAULT_HASHTAG;

      const token = await getAppAccessToken();
      const searchUrl = `https://api.linkedin.com/rest/posts?q=search&keywords=${encodeURIComponent(
        hashtag
      )}&count=50`;

      const response = await fetch(searchUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "LinkedIn-Version": "202412",
          "X-Restli-Protocol-Version": "2.0.0",
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`LinkedIn feed request failed: ${text}`);
      }

      const data = (await response.json()) as {elements?: LinkedInPostElement[]};
      const posts =
        data.elements
          ?.map((element) => normalizePost(element))
          .filter((p): p is FeedPost => Boolean(p)) ?? [];

      res.status(200).json({
        posts: sortPosts(posts),
        synced: posts.length,
      });
    } catch (error: unknown) {
      logger.error("feed error", error);
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Internal server error",
      });
    }
  }
);
