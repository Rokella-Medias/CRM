import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase configuration keys are missing! Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are present in your .env configuration file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
