// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, apikey, Authorization',
}

console.log("Function new_devis started!")

// Créer le client Supabase avec SERVICE_ROLE_KEY pour contourner RLS
const supabaseAdmin = createClient(
  // @ts-ignore - Deno env
  Deno.env.get('SUPABASE_URL') ?? '',
  // @ts-ignore - Deno env
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

serve(async (req) => {
  // Gérer CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Récupérer l'IP du client
    const clientIP = req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'unknown'

    // Nettoyer les anciens rate limits
    const oneHourAgo = new Date()
    oneHourAgo.setHours(oneHourAgo.getHours() - 1)

    await supabaseAdmin
      .from('rate_limits')
      .delete()
      .lt('created_at', oneHourAgo.toISOString())

    // Vérifier le rate limit
    const { count: requestCount, error: countError } = await supabaseAdmin
      .from('rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('ip', clientIP)
      .gte('created_at', oneHourAgo.toISOString())

    if (countError) {
      console.error('Erreur rate limit:', countError)
    }

    // Limite: 3 requêtes par heure
    if (requestCount && requestCount >= 3) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Trop de tentatives. Veuillez réessayer dans une heure.',
          code: 'RATE_LIMIT_EXCEEDED',
          remaining_attempts: 0
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const body = await req.json()
    
    // Validation des données
    if (!body.etablissement || body.etablissement.trim().length < 2) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Le nom de l'établissement est requis (minimum 2 caractères)",
          code: 'INVALID_ETABLISSEMENT'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!body.surface || body.surface <= 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'La surface est requise et doit être supérieure à 0',
          code: 'INVALID_SURFACE'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (body.email && body.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/
      if (!emailRegex.test(body.email)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Format d'email invalide",
            code: 'INVALID_EMAIL'
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    if (!body.telephone || body.telephone.replace(/\D/g, '').length < 10) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Le numéro de téléphone est requis (minimum 10 chiffres)',
          code: 'INVALID_PHONE'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!body.nom || body.nom.trim().length < 2) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Le nom est requis (minimum 2 caractères)',
          code: 'INVALID_NAME'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Insérer le devis
    const { data: devis, error: insertError } = await supabaseAdmin
      .from('devis')
      .insert({
        etablissement: body.etablissement.trim(),
        surface: body.surface,
        nuisibles: body.nuisibles || [],
        urgence: body.urgence || 'normale',
        nom: body.nom.trim(),
        email: body.email?.trim() || null,
        telephone: body.telephone.trim(),
        message: body.message?.trim() || null,
        statut: 'nouveau'
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Erreur insertion:', insertError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Erreur lors de la création du devis',
          code: 'INSERT_ERROR',
          details: insertError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Enregistrer la tentative dans rate_limits
    const { error: rateLimitError } = await supabaseAdmin
      .from('rate_limits')
      .insert({ ip: clientIP })

    if (rateLimitError) {
      console.error('Erreur insertion rate limit:', rateLimitError)
    }

    const remainingAttempts = 2 - (requestCount || 0)

    const data = {
      success: true,
      devis_id: devis.id,
      message: 'Devis créé avec succès',
      remaining_attempts: Math.max(0, remainingAttempts)
    }

    return new Response(
      JSON.stringify(data),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    )

  } catch(error: any) {
    console.error('Erreur:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Une erreur interne est survenue',
        code: 'INTERNAL_ERROR',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})