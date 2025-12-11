export type Tip = {
  id: string;
  content: string;
  linkedin_url?: string;
  linkedin_post_id?: string;
  created_at: string;
  updated_at: string;
  published: boolean;
  user_id: string;
  author_name?: string;
  author_linkedin_id?: string;
  author_avatar_url?: string;
  author_profile_url?: string;
  is_owner?: boolean;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  tip_id?: string;
  created_at: string;
  updated_at: string;
  published: boolean;
  user_id: string;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  linkedin_access_token?: string;
  linkedin_profile_id?: string;
  created_at: string;
  updated_at: string;
};
