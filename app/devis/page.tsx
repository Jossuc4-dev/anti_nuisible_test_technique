'use client';

import { useState, useRef } from 'react';
import { sendDevisEmail } from '@/lib/email';

const ETABLISSEMENTS = ['Restaurant', 'Hôtel', 'Copropriété', 'Autre'];
const NUISIBLES = ['Rats', 'Cafards', 'Punaises de lit', 'Frelons', 'Autre'];
const URGENCES = ['Intervention sous 24h', 'Contrat annuel', 'Simple devis'];

const URGENCE_DETAILS: Record<string, string> = {
  'Intervention sous 24h': 'Une équipe se déplace en urgence dans les 24h.',
  'Contrat annuel': 'Suivi et interventions préventives tout au long de l\'année.',
  'Simple devis': 'Estimation gratuite, sans engagement.',
};

type FormData = {
  etablissement: string;
  surface: string;
  nuisibles: string[];
  urgence: string;
  nom: string;
  email: string;
  telephone: string;
  message: string;
};

const INITIAL: FormData = {
  etablissement: '',
  surface: '',
  nuisibles: [],
  urgence: '',
  nom: '',
  email: '',
  telephone: '',
  message: '',
};

function validateStep(step: number, data: FormData): Record<string, string> {
  const err: Record<string, string> = {};
  if (step === 1) {
    if (!data.etablissement) err.etablissement = 'Sélectionnez un type d\'établissement.';
    const s = Number(data.surface);
    if (!data.surface || isNaN(s) || s < 10 || s > 50000)
      err.surface = 'Surface requise (entre 10 et 50 000 m²).';
    if (data.nuisibles.length === 0) err.nuisibles = 'Sélectionnez au moins un nuisible.';
  }
  if (step === 2) {
    if (!data.urgence) err.urgence = 'Sélectionnez un niveau d\'urgence.';
  }
  if (step === 3) {
    if (!data.nom.trim() || data.nom.trim().length < 2) err.nom = 'Nom requis (min 2 caractères).';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) err.email = 'Email invalide.';
    if (!/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/.test(data.telephone))
      err.telephone = 'Téléphone invalide (format FR).';
    if (data.message.length > 500) err.message = 'Maximum 500 caractères.';
  }
  return err;
}

const NUISIBLE_ICONS: Record<string, string> = {
  Rats: '🐀',
  Cafards: '🪳',
  'Punaises de lit': '🛏️',
  Frelons: '🐝',
  Autre: '🦟',
};

export default function DevisPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ id: string } | null>(null);
  const [serverError, setServerError] = useState('');
  const topRef = useRef<HTMLDivElement>(null);

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: 'smooth' });

  const update = (field: keyof FormData, value: string | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  const toggleNuisible = (n: string) => {
    setForm(prev => ({
      ...prev,
      nuisibles: prev.nuisibles.includes(n)
        ? prev.nuisibles.filter(x => x !== n)
        : [...prev.nuisibles, n],
    }));
    setErrors(prev => { const e = { ...prev }; delete e.nuisibles; return e; });
  };

  const next = () => {
    const e = validateStep(step, form);
    if (Object.keys(e).length > 0) { setErrors(e); scrollTop(); return; }
    setErrors({});
    setStep(s => s + 1);
    scrollTop();
  };

  const back = () => { setStep(s => s - 1); scrollTop(); };

  const submit = async () => {
    const e = validateStep(3, form);
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);
    setServerError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL!}/functions/v1/new_devis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, surface: Number(form.surface) }),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.errors?.join(' ') || json.error || 'Erreur inattendue.');
      } else {
        const sendEmail = await sendDevisEmail(form.email);
        console.log(sendEmail);
        setResult({ id: json.devis_id });
        scrollTop();
      }
    } catch {
      setServerError('Impossible de contacter le serveur. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            Demande envoyée !
          </h2>
          <p className="text-stone-400 mb-6 leading-relaxed">
            Votre demande de devis a bien été reçue. Nos équipes vous répondront sous 24h.
          </p>
          <div className="bg-stone-900 border border-stone-700 rounded-2xl p-5 mb-8">
            <p className="text-stone-500 text-sm mb-1">Numéro de dossier</p>
            <p className="text-emerald-400 font-mono font-bold text-lg tracking-wider">{result.id}</p>
            <p className="text-stone-600 text-xs mt-2">Conservez cet identifiant pour le suivi de votre dossier.</p>
          </div>
          <a
            href="/"
            className="inline-block bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-8 py-3 rounded-full transition-colors"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950" ref={topRef}>
      {/* Header */}
      <header className="border-b border-stone-800 bg-stone-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <span className="text-white font-bold text-lg" style={{ fontFamily: 'Georgia, serif' }}>
              ProDératisation
            </span>
          </a>
          <span className="text-amber-500 text-sm font-semibold">Devis gratuit</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            {['Votre établissement', 'Urgence', 'Vos coordonnées'].map((label, i) => {
              const idx = i + 1;
              const active = step === idx;
              const done = step > idx;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all
                    ${done ? 'bg-emerald-500 text-white' : active ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-500'}`}>
                    {done ? '✓' : idx}
                  </div>
                  <span className={`text-xs text-center hidden sm:block transition-colors
                    ${active ? 'text-amber-400' : done ? 'text-emerald-400' : 'text-stone-600'}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="relative h-1.5 bg-stone-800 rounded-full">
            <div
              className="absolute left-0 top-0 h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* ÉTAPE 1 */}
          {step === 1 && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Georgia, serif' }}>
                Votre établissement
              </h1>
              <p className="text-stone-500 mb-8">Décrivez votre site et les nuisibles présents.</p>

              <div className="mb-6">
                <label className="block text-stone-300 text-sm font-semibold mb-3">
                  Type d'établissement <span className="text-amber-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {ETABLISSEMENTS.map(e => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => update('etablissement', e)}
                      aria-pressed={form.etablissement === e}
                      className={`p-4 rounded-xl border-2 text-left text-sm font-medium transition-all
                        ${form.etablissement === e
                          ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                          : 'border-stone-700 text-stone-400 hover:border-stone-500'}`}
                    >
                      {e === 'Restaurant' && '🍽️ '}
                      {e === 'Hôtel' && '🏨 '}
                      {e === 'Copropriété' && '🏢 '}
                      {e === 'Autre' && '🏗️ '}
                      {e}
                    </button>
                  ))}
                </div>
                {errors.etablissement && (
                  <p role="alert" className="text-red-400 text-xs mt-2">{errors.etablissement}</p>
                )}
              </div>

              <div className="mb-6">
                <label htmlFor="surface" className="block text-stone-300 text-sm font-semibold mb-2">
                  Surface du site (m²) <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="surface"
                    type="number"
                    min={10}
                    max={50000}
                    value={form.surface}
                    onChange={e => update('surface', e.target.value)}
                    placeholder="Ex : 250"
                    aria-invalid={!!errors.surface}
                    className="w-full bg-stone-800 border border-stone-700 text-white rounded-xl px-4 py-3 pr-12
                      focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
                      placeholder-stone-600 transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 text-sm">m²</span>
                </div>
                {errors.surface && (
                  <p role="alert" className="text-red-400 text-xs mt-2">{errors.surface}</p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-stone-300 text-sm font-semibold mb-3">
                  Type(s) de nuisible(s) <span className="text-amber-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {NUISIBLES.map(n => {
                    const checked = form.nuisibles.includes(n);
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => toggleNuisible(n)}
                        aria-pressed={checked}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all text-left
                          ${checked
                            ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                            : 'border-stone-700 text-stone-400 hover:border-stone-500'}`}
                      >
                        <span>{NUISIBLE_ICONS[n]}</span>
                        <span>{n}</span>
                        {checked && <span className="ml-auto text-amber-500">✓</span>}
                      </button>
                    );
                  })}
                </div>
                {errors.nuisibles && (
                  <p role="alert" className="text-red-400 text-xs mt-2">{errors.nuisibles}</p>
                )}
              </div>
            </div>
          )}

          {/* ÉTAPE 2 */}
          {step === 2 && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Georgia, serif' }}>
                Niveau d'urgence
              </h1>
              <p className="text-stone-500 mb-8">Quel type d'intervention recherchez-vous ?</p>

              <div className="space-y-4 mb-6">
                {URGENCES.map(u => {
                  const selected = form.urgence === u;
                  return (
                    <button
                      key={u}
                      type="button"
                      onClick={() => update('urgence', u)}
                      aria-pressed={selected}
                      className={`w-full p-5 rounded-2xl border-2 text-left transition-all
                        ${selected
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-stone-700 hover:border-stone-500'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center
                          ${selected ? 'border-amber-500' : 'border-stone-600'}`}>
                          {selected && <div className="w-2.5 h-2.5 bg-amber-500 rounded-full" />}
                        </div>
                        <div>
                          <p className={`font-semibold text-sm ${selected ? 'text-amber-400' : 'text-stone-300'}`}>{u}</p>
                          <p className="text-stone-500 text-xs mt-0.5">{URGENCE_DETAILS[u]}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {errors.urgence && (
                <p role="alert" className="text-red-400 text-xs">{errors.urgence}</p>
              )}

              <div className="bg-stone-800/60 rounded-2xl p-4 mt-8 border border-stone-700/50">
                <p className="text-stone-500 text-xs font-semibold uppercase tracking-widest mb-3">Récapitulatif</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Établissement</span>
                    <span className="text-stone-300">{form.etablissement}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Surface</span>
                    <span className="text-stone-300">{form.surface} m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Nuisibles</span>
                    <span className="text-stone-300 text-right max-w-48">{form.nuisibles.join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 3 */}
          {step === 3 && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Georgia, serif' }}>
                Vos coordonnées
              </h1>
              <p className="text-stone-500 mb-8">Nous vous contacterons dans les meilleurs délais.</p>

              <div className="space-y-5">
                <div>
                  <label htmlFor="nom" className="block text-stone-300 text-sm font-semibold mb-2">
                    Nom du contact <span className="text-amber-500">*</span>
                  </label>
                  <input
                    id="nom"
                    type="text"
                    value={form.nom}
                    onChange={e => update('nom', e.target.value)}
                    placeholder="Jean Dupont"
                    aria-invalid={!!errors.nom}
                    className="w-full bg-stone-800 border border-stone-700 text-white rounded-xl px-4 py-3
                      focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
                      placeholder-stone-600 transition-all"
                  />
                  {errors.nom && <p role="alert" className="text-red-400 text-xs mt-1.5">{errors.nom}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-stone-300 text-sm font-semibold mb-2">
                    Email <span className="text-amber-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    placeholder="jean@exemple.fr"
                    aria-invalid={!!errors.email}
                    className="w-full bg-stone-800 border border-stone-700 text-white rounded-xl px-4 py-3
                      focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
                      placeholder-stone-600 transition-all"
                  />
                  {errors.email && <p role="alert" className="text-red-400 text-xs mt-1.5">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="telephone" className="block text-stone-300 text-sm font-semibold mb-2">
                    Téléphone <span className="text-amber-500">*</span>
                  </label>
                  <input
                    id="telephone"
                    type="tel"
                    value={form.telephone}
                    onChange={e => update('telephone', e.target.value)}
                    placeholder="06 12 34 56 78"
                    aria-invalid={!!errors.telephone}
                    className="w-full bg-stone-800 border border-stone-700 text-white rounded-xl px-4 py-3
                      focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
                      placeholder-stone-600 transition-all"
                  />
                  {errors.telephone && <p role="alert" className="text-red-400 text-xs mt-1.5">{errors.telephone}</p>}
                </div>

                <div>
                  <label htmlFor="message" className="block text-stone-300 text-sm font-semibold mb-2">
                    Message <span className="text-stone-600 font-normal">(optionnel)</span>
                  </label>
                  <textarea
                    id="message"
                    value={form.message}
                    onChange={e => update('message', e.target.value)}
                    placeholder="Informations complémentaires, accès, contraintes particulières..."
                    rows={4}
                    maxLength={500}
                    className="w-full bg-stone-800 border border-stone-700 text-white rounded-xl px-4 py-3
                      focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
                      placeholder-stone-600 resize-none transition-all"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span>{errors.message && <p role="alert" className="text-red-400 text-xs">{errors.message}</p>}</span>
                    <span className={`text-xs ${form.message.length > 450 ? 'text-amber-400' : 'text-stone-600'}`}>
                      {form.message.length}/500
                    </span>
                  </div>
                </div>
              </div>

              {serverError && (
                <div role="alert" className="mt-6 bg-red-950/50 border border-red-800 rounded-xl p-4">
                  <p className="text-red-400 text-sm">{serverError}</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={back}
                className="flex-1 py-3 rounded-xl border border-stone-700 text-stone-400
                  hover:border-stone-500 hover:text-stone-300 font-semibold text-sm transition-all"
              >
                ← Retour
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={next}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950
                  font-bold text-sm transition-all active:scale-95"
              >
                Continuer →
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950
                  font-bold text-sm transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Envoi en cours…
                  </>
                ) : (
                  'Envoyer ma demande ✓'
                )}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-stone-600 text-xs mt-6">
          Vos données sont protégées et ne seront jamais revendues.
        </p>
      </div>
    </div>
  );
}
