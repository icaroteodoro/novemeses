import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// Use service role key on server side (bypasses RLS for storage uploads)
// Falls back to publishable key if service role not set
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
