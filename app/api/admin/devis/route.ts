import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } }
  );
}

function isAuthenticated(cookieStore: Awaited<ReturnType<typeof cookies>>): boolean {
  const token = cookieStore.get('admin_token')?.value;
  return token === process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
}

// GET — appelle l'edge function getDevis avec X-Admin-Token
export async function GET(req: NextRequest) {
  const cookieStore = await cookies();

  if (!isAuthenticated(cookieStore)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const statut = searchParams.get('statut') || '';

  const edgeUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/getDevis`;
  const edgeRes = await fetch(edgeUrl, {
    headers: {
      'X-Admin-Token': process.env.NEXT_PUBLIC_ADMIN_PASSWORD!,
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SERVICE_ROLE_KEY}`,
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

  const PAGE_SIZE = 10;
  const filtered = statut
    ? (allData as any[]).filter(d => d.statut === statut)
    : (allData as any[]);

  const total = filtered.length;
  const from = (page - 1) * PAGE_SIZE;
  const paginated = filtered.slice(from, from + PAGE_SIZE);

  return NextResponse.json({ data: paginated, total });
}

// PATCH — changer le statut d'un devis via service role key
export async function PATCH(req: NextRequest) {
  const cookieStore = await cookies();

  if (!isAuthenticated(cookieStore)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const body = await req.json();
  const { id, statut } = body;

  if (!id || !statut) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
  }

  const { error } = await getSupabaseAdmin()
    .from('devis')
    .update({ statut })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
