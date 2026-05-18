// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

export default {
  fetch: async (req: Request) => {
    // Récupérer le token depuis un header personnalisé
    const adminToken = req.headers.get("X-Admin-Token") || req.headers.get("x-admin-token");
    
    // Vérifier avec le mot de passe statique
    const adminPassword = Deno.env.get("ADMIN_PASSWORD");
    
    if (!adminToken || adminToken !== adminPassword) {
      return Response.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // Créer le client Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      return Response.json(
        { error: "Configuration Supabase manquante" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Récupérer les devis
    const { data, error } = await supabase.from("devis").select("*");
    
    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return Response.json({ data });
  }
};
