import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your_supabase');

// Export null if not configured — authService handles this gracefully
export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!isConfigured) {
  console.warn(
    '⚠️  Supabase is not configured yet.\n' +
    'Open my-react-app/.env and replace the placeholder values with your real\n' +
    'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from the Supabase dashboard.'
  );
}
