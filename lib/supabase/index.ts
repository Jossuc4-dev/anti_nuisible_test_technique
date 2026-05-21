import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client public (lecture seule côté client)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client admin — créé à la demande pour éviter l'erreur au build
export const getSupabaseAdmin = () =>
  createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

// Rétrocompatibilité (lazy)
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient>, {
  get(_, prop) {
    return getSupabaseAdmin()[prop as keyof ReturnType<typeof createClient>];
  },
});
