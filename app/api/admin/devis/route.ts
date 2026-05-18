import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function createSupabase(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

// GET — appelle l'edge function getDevis avec le token de l'utilisateur
export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createSupabase(cookieStore);

  // Récupérer la session pour obtenir le token JWT
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const statut = searchParams.get('statut') || '';

  // Appel de l'edge function avec le token JWT
  const edgeUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/getDevis`;
  const edgeRes = await fetch(edgeUrl, {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (edgeRes.status === 401) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  if (!edgeRes.ok) {
    const err = await edgeRes.json().catch(() => ({ error: 'Erreur edge function' }));
    return NextResponse.json(err, { status: edgeRes.status });
  }

  const { data: allData } = await edgeRes.json();

  // Filtrage et pagination côté API route (l'edge function retourne tout)
  const PAGE_SIZE = 10;
  const filtered = statut
    ? (allData as any[]).filter(d => d.statut === statut)
    : (allData as any[]);

  const total = filtered.length;
  const from = (page - 1) * PAGE_SIZE;
  const paginated = filtered.slice(from, from + PAGE_SIZE);

  return NextResponse.json({ data: paginated, total });
}

// PATCH — changer le statut d'un devis directement via Supabase
export async function PATCH(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createSupabase(cookieStore);

  // Vérification du token
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const body = await req.json();
  const { id, statut } = body;

  if (!id || !statut) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
  }

  const { error } = await supabase
    .from('devis')
    .update({ statut })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
