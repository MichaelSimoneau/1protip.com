import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_SECRET_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables: set EXPO_PUBLIC_SUPABASE_URL and EXPO_SECRET_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Tip = {
  id: string;
  content: string;
  linkedin_url?: string;
  linkedin_post_id?: string;
  created_at: string;
  updated_at: string;
  published: boolean;
  user_id: string;
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
