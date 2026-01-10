import { createClient } from '@supabase/supabase-js';

if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error(
    "VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set.",
  );
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);
