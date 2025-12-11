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
  };
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("linkedin_access_token, linkedin_profile_id, full_name, hashtag_preferences")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile?.linkedin_access_token) {
      return new Response(
        JSON.stringify({ error: "LinkedIn not connected", synced: 0 }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const hashtags = profile.hashtag_preferences || ["#1protip"];

    const profileUrl = `https://api.linkedin.com/v2/me`;

    const profileResponse = await fetch(profileUrl, {
      headers: {
        "Authorization": `Bearer ${profile.linkedin_access_token}`,
        "Content-Type": "application/json",
      },
    });

    let authorName = profile.full_name || "LinkedIn User";
    let authorAvatarUrl = null;

    if (profileResponse.ok) {
      const profileData: LinkedInProfile = await profileResponse.json();
      authorName = `${profileData.localizedFirstName || ""} ${profileData.localizedLastName || ""}`.trim() || authorName;
    }

    const postsUrl = `https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(urn:li:person:${profile.linkedin_profile_id})&count=50`;

    const postsResponse = await fetch(postsUrl, {
      headers: {
        "Authorization": `Bearer ${profile.linkedin_access_token}`,
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
            user_id: user.id,
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