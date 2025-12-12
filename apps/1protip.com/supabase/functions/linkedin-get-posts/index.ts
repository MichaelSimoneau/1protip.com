import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface LinkedInPost {
  id: string;
  author: string;
  created: {
    time: number;
  };
  text?: {
    text: string;
  };
  commentary?: string;
}

interface LinkedInPostsResponse {
  elements: LinkedInPost[];
}

interface LinkedInProfile {
  id: string;
  localizedFirstName?: string;
  localizedLastName?: string;
  profilePicture?: {
    displayImage?: string;
    "displayImage~"?: {
      elements?: {
        identifiers?: { identifier?: string }[];
      }[];
    };
  };
}

function parseHashtags(
  input: string | string[] | null | undefined,
  fallback: string[]
): string[] {
  if (!input) return fallback;

  const raw = Array.isArray(input) ? input : input.split(",");
  const tags = raw
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith("#") ? tag.toLowerCase() : `#${tag.toLowerCase()}`));

  return tags.length ? tags : fallback;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const serviceAccessToken = Deno.env.get("LINKEDIN_SERVICE_ACCESS_TOKEN") || null;
    const serviceProfileId = Deno.env.get("LINKEDIN_SERVICE_PROFILE_ID") || null;
    const serviceAuthorName = Deno.env.get("LINKEDIN_SERVICE_AUTHOR_NAME") || "LinkedIn User";
    const serviceAuthorAvatarUrl = Deno.env.get("LINKEDIN_SERVICE_AVATAR_URL") || null;
    const serviceHashtags = parseHashtags(
      Deno.env.get("LINKEDIN_SERVICE_HASHTAGS"),
      ["#1protip"]
    );

    const authHeader = req.headers.get("Authorization");
    let mode: "user" | "service" = "service";
    let accessToken = serviceAccessToken;
    let linkedinProfileId = serviceProfileId;
    let authorName = serviceAuthorName;
    let authorAvatarUrl = serviceAuthorAvatarUrl;
    let hashtags = serviceHashtags;
    let userId: string | null = null;

    if (authHeader) {
      const { data: { user }, error: userError } = await supabase.auth.getUser(
        authHeader.replace("Bearer ", "")
      );

      if (!userError && user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("linkedin_access_token, linkedin_profile_id, full_name, avatar_url, hashtag_preferences")
          .eq("id", user.id)
          .maybeSingle();

        if (!profileError && profile?.linkedin_access_token) {
          mode = "user";
          userId = user.id;
          accessToken = profile.linkedin_access_token;
          linkedinProfileId = profile.linkedin_profile_id || linkedinProfileId;
          authorName = profile.full_name || authorName;
          authorAvatarUrl = profile.avatar_url || authorAvatarUrl;
          hashtags = parseHashtags(profile.hashtag_preferences, serviceHashtags);

          const profileResponse = await fetch(
            "https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))",
            {
              headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            },
          );

          if (profileResponse.ok) {
            const profileData: LinkedInProfile = await profileResponse.json();
            linkedinProfileId = profileData.id || linkedinProfileId;
            authorName =
              `${profileData.localizedFirstName || ""} ${profileData.localizedLastName || ""}`.trim() ||
              authorName;
            authorAvatarUrl =
              profileData.profilePicture?.["displayImage~"]?.elements?.[0]?.identifiers?.[0]?.identifier ||
              profileData.profilePicture?.displayImage ||
              authorAvatarUrl;

            if (linkedinProfileId || authorAvatarUrl) {
              await supabase
                .from("profiles")
                .update({
                  linkedin_profile_id: linkedinProfileId ?? undefined,
                  full_name: authorName,
                  avatar_url: authorAvatarUrl ?? undefined,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", user.id);
            }
          } else {
            const errorText = await profileResponse.text();
            console.error("Failed to refresh LinkedIn profile:", errorText);
          }
        }
      }
    }

    if (!accessToken || !linkedinProfileId) {
      if (serviceAccessToken && serviceProfileId) {
        mode = "service";
        accessToken = serviceAccessToken;
        linkedinProfileId = serviceProfileId;
        authorName = serviceAuthorName;
        authorAvatarUrl = serviceAuthorAvatarUrl;
        hashtags = serviceHashtags;
        userId = null;
      } else {
        return new Response(
          JSON.stringify({ error: "LinkedIn not configured for public fetch", synced: 0 }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    const authorUrn = linkedinProfileId.startsWith("urn:")
      ? linkedinProfileId
      : `urn:li:person:${linkedinProfileId}`;
    const postsUrl = `https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(${authorUrn})&count=50`;

    const postsResponse = await fetch(postsUrl, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
    });

    if (!postsResponse.ok) {
      const errorText = await postsResponse.text();
      console.error("Failed to fetch LinkedIn posts:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to fetch LinkedIn posts", synced: 0 }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const postsData: LinkedInPostsResponse = await postsResponse.json();

    const posts = postsData.elements
      .filter(post => {
        const text = post.text?.text || post.commentary || "";
        return hashtags.some(tag => text.toLowerCase().includes(tag.toLowerCase()));
      })
      .map(post => ({
        id: post.id,
        content: post.text?.text || post.commentary || "",
        created_at: new Date(post.created.time).toISOString(),
        linkedin_post_id: post.id,
        author_name: authorName,
        author_avatar_url: authorAvatarUrl,
        is_owner: true,
      }));

    for (const post of posts) {
      const { data: existingTip } = await supabase
        .from("tips")
        .select("id")
        .eq("linkedin_post_id", post.linkedin_post_id)
        .maybeSingle();

      if (!existingTip) {
        await supabase
          .from("tips")
          .insert({
            content: post.content,
            linkedin_post_id: post.linkedin_post_id,
            user_id: userId,
            published: true,
            created_at: post.created_at,
            author_name: post.author_name,
            author_avatar_url: post.author_avatar_url,
            is_owner: post.is_owner,
          });
      }
    }

    return new Response(
      JSON.stringify({ message: "LinkedIn posts synced successfully", synced: posts.length }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching LinkedIn posts:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});