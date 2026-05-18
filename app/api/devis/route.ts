import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateDevis } from '@/lib/validation';
import DOMPurify from 'isomorphic-dompurify';

export async function POST(req: Request) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'anonymous';

  // Parse body
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
  }

  // 1. Rate limiting — max 3 soumissions/heure par IP
  const { data: rateData } = await supabaseAdmin
    .from('rate_limits')
    .select('*')
    .eq('ip', ip)
    .single();

  if (
    rateData &&
    rateData.count >= 3 &&
    new Date().getTime() - new Date(rateData.last_submission).getTime() < 3_600_000
  ) {
    return NextResponse.json(
      { error: 'Trop de demandes. Maximum 3 soumissions par heure.' },
      { status: 429 }
    );
  }

  // 2. Nettoyage automatique des entrées rate_limits > 1h
  await supabaseAdmin
    .from('rate_limits')
    .delete()
    .lt('last_submission', new Date(Date.now() - 3_600_000).toISOString());

  // 3. Validation serveur
  const errors = validateDevis(body);
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  // 4. Sanitisation (prévention XSS)
  const sanitizedMessage = DOMPurify.sanitize(
    typeof body.message === 'string' ? body.message : ''
  );
  const sanitizedNom = DOMPurify.sanitize(body.nom as string);
  const sanitizedEmail = DOMPurify.sanitize(body.email as string);

  // 5. Insertion en base
  const { data, error } = await supabaseAdmin
    .from('devis')
    .insert([
      {
        etablissement: body.etablissement,
        surface: Number(body.surface),
        nuisibles: body.nuisibles,
        urgence: body.urgence,
        nom: sanitizedNom.trim(),
        email: sanitizedEmail.trim().toLowerCase(),
        telephone: body.telephone,
        message: sanitizedMessage,
        statut: 'nouveau',
      },
    ])
    .select('id')
    .single();

  if (error) {
    console.error('Supabase insert error:', error);
    return NextResponse.json({ error: "Erreur lors de l'enregistrement" }, { status: 500 });
  }

  // 6. Mise à jour du compteur de rate limiting
  await supabaseAdmin.from('rate_limits').upsert({
    ip,
    count: (rateData?.count || 0) + 1,
    last_submission: new Date().toISOString(),
  });

  return NextResponse.json({ id: data.id }, { status: 201 });
}
