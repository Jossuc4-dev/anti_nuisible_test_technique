import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

export default {
  fetch: async (req: Request) => {
    const adminToken = req.headers.get("X-Admin-Token") || req.headers.get("x-admin-token");
    const adminPassword = Deno.env.get("NEXT_ADMIN_PASSWORD");

    if (!adminToken || adminToken !== adminPassword) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"); // bypass RLS

    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ error: "Configuration Supabase manquante" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    const { data, error } = await supabase
      .from("devis")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ data });
  }
};
