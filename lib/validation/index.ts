const ETABLISSEMENTS = ['Restaurant', 'Hôtel', 'Copropriété', 'Autre'] as const;
const NUISIBLES_VALIDES = ['Rats', 'Cafards', 'Punaises de lit', 'Frelons', 'Autre'];
const URGENCES = ['Intervention sous 24h', 'Contrat annuel', 'Simple devis'] as const;
const PHONE_FR = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateDevis(body: Record<string, unknown>): string[] {
  const errors: string[] = [];

  // Établissement
  if (!body.etablissement || !ETABLISSEMENTS.includes(body.etablissement as typeof ETABLISSEMENTS[number])) {
    errors.push("Type d'établissement invalide.");
  }

  // Surface
  const surface = Number(body.surface);
  if (isNaN(surface) || surface < 10 || surface > 50000) {
    errors.push('Surface invalide (min 10m², max 50 000m²).');
  }

  // Nuisibles
  if (!Array.isArray(body.nuisibles) || body.nuisibles.length === 0) {
    errors.push('Sélectionnez au moins un type de nuisible.');
  } else {
    const invalid = (body.nuisibles as string[]).filter(n => !NUISIBLES_VALIDES.includes(n));
    if (invalid.length > 0) errors.push('Type(s) de nuisible(s) invalide(s).');
  }

  // Urgence
  if (!body.urgence || !URGENCES.includes(body.urgence as typeof URGENCES[number])) {
    errors.push("Type d'urgence invalide.");
  }

  // Nom
  if (!body.nom || typeof body.nom !== 'string' || body.nom.trim().length < 2) {
    errors.push('Le nom est requis (minimum 2 caractères).');
  }

  // Email
  if (!body.email || typeof body.email !== 'string' || !EMAIL_REGEX.test(body.email)) {
    errors.push('Email invalide.');
  }

  // Téléphone
  if (!body.telephone || typeof body.telephone !== 'string' || !PHONE_FR.test(body.telephone)) {
    errors.push('Numéro de téléphone invalide (format FR requis).');
  }

  // Message (optionnel, max 500 chars)
  if (body.message && typeof body.message === 'string' && body.message.length > 500) {
    errors.push('Le message ne peut dépasser 500 caractères.');
  }

  return errors;
}
