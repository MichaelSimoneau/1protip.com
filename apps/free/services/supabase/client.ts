import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_SECRET_SUPABASE_ANON_KEY;

const hasCreds = Boolean(supabaseUrl && supabaseAnonKey);
const effectiveUrl = supabaseUrl || 'http://localhost';
const effectiveKey = supabaseAnonKey || 'dev-placeholder-key';

export const supabase = createClient(effectiveUrl, effectiveKey);
