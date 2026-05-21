'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    fetch('/api/admin/check')
      .then(res => res.json())
      .then(data => setIsAdminLoggedIn(data.loggedIn))
      .catch(() => setIsAdminLoggedIn(false));
  }, []);

  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-200 bg-white/90 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <span className="text-gray-900 font-bold text-lg" style={{ fontFamily: 'Georgia, serif' }}>
              ProDératisation
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isAdminLoggedIn ? (
              <Link
                href="/admin/devis"
                className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors"
              >
                Tableau de bord
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold px-5 py-2.5 rounded-full text-sm transition-colors"
              >
                Admin
              </Link>
            )}
            <Link
              href="/devis"
              className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold px-5 py-2.5 rounded-full text-sm transition-colors"
            >
              Demander un devis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 py-24 text-center">
        <p className="text-amber-500 text-sm font-semibold uppercase tracking-widest mb-4">
          Agence parisienne de désinfection
        </p>
        <h1
          className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          Débarrassez-vous<br />
          <span className="text-amber-500">de tous les nuisibles</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto mb-10">
          Rats, cafards, punaises de lit, frelons — nos experts interviennent
          pour les restaurants, hôtels, copropriétés et professionnels.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/devis"
            className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold px-8 py-4 rounded-full text-lg transition-colors"
          >
            Demander un devis gratuit →
          </Link>
          <a
            href="tel:+33100000000"
            className="border border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-900 font-semibold px-8 py-4 rounded-full text-lg transition-colors"
          >
            📞 01 00 00 00 00
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { emoji: '⚡', title: 'Intervention sous 24h', desc: 'Disponibles 7j/7 pour les situations urgentes.' },
          { emoji: '🔬', title: 'Protocoles certifiés', desc: 'Produits homologués, sans danger pour vos équipes.' },
          { emoji: '📋', title: 'Contrats annuels', desc: 'Suivi préventif et interventions illimitées.' },
        ].map(f => (
          <div key={f.title} className="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3">{f.emoji}</div>
            <h3 className="text-gray-900 font-bold mb-2">{f.title}</h3>
            <p className="text-gray-500 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="bg-amber-400 rounded-3xl p-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            Problème détecté ? Agissez maintenant.
          </h2>
          <p className="text-gray-800 mb-6">Devis gratuit en 2 minutes, réponse garantie sous 24h.</p>
          <Link
            href="/devis"
            className="inline-block bg-gray-900 hover:bg-gray-800 text-white font-bold px-8 py-3 rounded-full transition-colors"
          >
            Obtenir mon devis →
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8 text-center text-gray-400 text-sm">
        © 2024 ProDératisation Paris — Tous droits réservés
      </footer>
    </main>
  );
}
