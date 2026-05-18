// Interface pour une demande de devis
export interface Devis {
  id?: string; // UUID généré par Supabase
  created_at?: string;
  etablissement: 'Restaurant' | 'Hôtel' | 'Copropriété' | 'Autre';
  surface: number; // min 10, max 50000
  nuisibles: string[]; // Rats, Cafards, Punaises de lit, Frelons, Autre
  urgence: 'Intervention sous 24h' | 'Contrat annuel' | 'Simple devis';
  nom: string;
  email: string;
  telephone: string; // Format FR
  message?: string; // Max 500 caractères
  statut: 'nouveau' | 'traité' | 'archivé'; // 'nouveau' par défaut
}

// Interface pour le rate limiting
export interface RateLimit {
  ip: string;
  last_submission: string;
  count: number;
}
