'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Devis = {
  id: string;
  created_at: string;
  etablissement: string;
  surface: number;
  nuisibles: string[];
  urgence: string;
  nom: string;
  email: string;
  telephone: string;
  message?: string;
  statut: 'nouveau' | 'traité' | 'archivé';
};

const STATUT_NEXT: Record<string, string> = {
  nouveau: 'traité',
  traité: 'archivé',
  archivé: 'nouveau',
};

const STATUT_COLORS: Record<string, string> = {
  nouveau: 'bg-blue-50 text-blue-700 border-blue-200',
  traité: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  archivé: 'bg-gray-100 text-gray-500 border-gray-200',
};

const URGENCE_COLORS: Record<string, string> = {
  'Intervention sous 24h': 'text-red-600',
  'Contrat annuel': 'text-amber-600',
  'Simple devis': 'text-gray-500',
};

export default function AdminPage() {
  const [devis, setDevis] = useState<Devis[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statut, setStatut] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [stats24h, setStats24h] = useState<number | null>(null);
  const router = useRouter();

  const fetchDevis = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (statut) params.set('statut', statut);
      const res = await fetch(`/api/admin/devis?${params}`);
      if (res.status === 401) {
        router.push('/login-admin');
        return;
      }
      if (res.ok) {
        const json = await res.json();
        setDevis(json.data || []);
        setTotal(json.total || 0);
      }
    } finally {
      setLoading(false);
    }
  }, [page, statut, router]);

  useEffect(() => { fetchDevis(); }, [fetchDevis]);

  useEffect(() => {
    const yesterday = new Date(Date.now() - 86_400_000).toISOString();
    fetch('/api/admin/devis?page=1')
      .then(r => r.json())
      .then(json => {
        if (json.data) {
          const count = (json.data as Devis[]).filter(
            d => d.created_at && d.created_at > yesterday
          ).length;
          setStats24h(count);
        }
      })
      .catch(() => {});
  }, []);

  const changeStatut = async (id: string, nextStatut: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/admin/devis', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, statut: nextStatut }),
      });
      if (res.ok) {
        setDevis(prev =>
          prev.map(d => (d.id === id ? { ...d, statut: nextStatut as Devis['statut'] } : d))
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const exportCSV = () => {
    const filtered = devis.filter(d => {
      if (!search) return true;
      const q = search.toLowerCase();
      return d.nom.toLowerCase().includes(q) || d.email.toLowerCase().includes(q);
    });
    const headers = ['ID', 'Date', 'Établissement', 'Surface', 'Nuisibles', 'Urgence', 'Nom', 'Email', 'Téléphone', 'Statut'];
    const rows = filtered.map(d => [
      d.id,
      new Date(d.created_at).toLocaleDateString('fr-FR'),
      d.etablissement,
      d.surface,
      d.nuisibles.join(' / '),
      d.urgence,
      d.nom,
      d.email,
      d.telephone,
      d.statut,
    ]);
    const csv = [headers, ...rows].map(row => row.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devis-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const logout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    document.cookie = 'admin_session=; Max-Age=0; path=/';
    router.push('/login-admin');
  };

  const filteredDevis = devis.filter(d => {
    if (!search) return true;
    const q = search.toLowerCase();
    return d.nom.toLowerCase().includes(q) || d.email.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <h1 className="text-gray-900 font-bold leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                ProDératisation
              </h1>
              <p className="text-gray-400 text-xs">Back-office administrateur</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            {stats24h !== null && (
              <div className="hidden sm:flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <span className="text-amber-700 text-xs font-semibold">{stats24h} demande(s) / 24h</span>
              </div>
            )}
            <button
              onClick={logout}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              Déconnexion →
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {['nouveau', 'traité', 'archivé', 'total'].map(s => {
            const count =
              s === 'total'
                ? total
                : devis.filter(d => d.statut === s).length;
            return (
              <div key={s} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">
                  {s === 'total' ? 'Total' : s.charAt(0).toUpperCase() + s.slice(1)}
                </p>
                <p className="text-gray-900 text-2xl font-bold">{count}</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Statut tabs */}
          <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1 shadow-sm">
            {[
              { label: 'Tous', value: '' },
              { label: 'Nouveaux', value: 'nouveau' },
              { label: 'Traités', value: 'traité' },
              { label: 'Archivés', value: 'archivé' },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => { setStatut(tab.value); setPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all
                  ${statut === tab.value
                    ? 'bg-amber-400 text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="Rechercher par nom ou email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl pl-10 pr-4 py-2.5
                focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
                placeholder-gray-400 text-sm shadow-sm"
            />
          </div>

          {/* Export CSV */}
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200
              text-gray-600 hover:text-gray-900 hover:border-gray-300 rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <svg className="animate-spin w-8 h-8 text-amber-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-gray-500 text-sm">Chargement…</p>
              </div>
            </div>
          ) : filteredDevis.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <span className="text-4xl mb-3">📭</span>
              <p>Aucune demande trouvée.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="overflow-x-auto hidden sm:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left text-gray-500 text-xs uppercase tracking-widest px-5 py-4 font-semibold">Date</th>
                      <th className="text-left text-gray-500 text-xs uppercase tracking-widest px-4 py-4 font-semibold">Établissement</th>
                      <th className="text-left text-gray-500 text-xs uppercase tracking-widest px-4 py-4 font-semibold">Nuisibles</th>
                      <th className="text-left text-gray-500 text-xs uppercase tracking-widest px-4 py-4 font-semibold">Urgence</th>
                      <th className="text-left text-gray-500 text-xs uppercase tracking-widest px-4 py-4 font-semibold">Contact</th>
                      <th className="text-left text-gray-500 text-xs uppercase tracking-widest px-4 py-4 font-semibold">Statut</th>
                      <th className="text-left text-gray-500 text-xs uppercase tracking-widest px-4 py-4 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDevis.map((d, i) => (
                      <>
                        <tr
                          key={d.id}
                          onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}
                          className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors
                            ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}
                        >
                          <td className="px-5 py-4 text-gray-500 text-sm whitespace-nowrap">
                            {new Date(d.created_at).toLocaleDateString('fr-FR', {
                              day: '2-digit', month: '2-digit', year: 'numeric',
                            })}
                          </td>
                          <td className="px-4 py-4 text-gray-900 text-sm font-medium">{d.etablissement}</td>
                          <td className="px-4 py-4 text-gray-500 text-sm max-w-40">
                            <div className="flex flex-wrap gap-1">
                              {d.nuisibles.slice(0, 2).map(n => (
                                <span key={n} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{n}</span>
                              ))}
                              {d.nuisibles.length > 2 && (
                                <span className="text-gray-400 text-xs">+{d.nuisibles.length - 2}</span>
                              )}
                            </div>
                          </td>
                          <td className={`px-4 py-4 text-sm font-medium ${URGENCE_COLORS[d.urgence] || 'text-gray-500'}`}>
                            {d.urgence}
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-gray-900 text-sm font-medium">{d.nom}</p>
                            <p className="text-gray-400 text-xs">{d.email}</p>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border
                              ${STATUT_COLORS[d.statut]}`}>
                              {d.statut}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <button
                              onClick={e => { e.stopPropagation(); changeStatut(d.id, STATUT_NEXT[d.statut]); }}
                              disabled={updatingId === d.id}
                              className="text-xs text-gray-500 hover:text-amber-600 border border-gray-200 hover:border-amber-300
                                px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 whitespace-nowrap bg-white"
                            >
                              {updatingId === d.id ? '…' : `→ ${STATUT_NEXT[d.statut]}`}
                            </button>
                          </td>
                        </tr>
                        {expandedId === d.id && (
                          <tr key={`${d.id}-expanded`} className="bg-gray-50 border-b border-gray-200">
                            <td colSpan={7} className="px-5 py-4">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-400 text-xs mb-1">Téléphone</p>
                                  <p className="text-gray-900">{d.telephone}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-xs mb-1">Surface</p>
                                  <p className="text-gray-900">{d.surface} m²</p>
                                </div>
                                <div className="col-span-2">
                                  <p className="text-gray-400 text-xs mb-1">Message</p>
                                  <p className="text-gray-600">{d.message || '—'}</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-gray-100">
                {filteredDevis.map(d => (
                  <div key={d.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-gray-900 font-semibold">{d.nom}</p>
                        <p className="text-gray-400 text-xs">{d.email}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border
                        ${STATUT_COLORS[d.statut]}`}>
                        {d.statut}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
                      <span>{d.etablissement}</span>
                      <span>{d.surface} m²</span>
                      <span className={URGENCE_COLORS[d.urgence]}>{d.urgence}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs">
                        {new Date(d.created_at).toLocaleDateString('fr-FR')}
                      </span>
                      <button
                        onClick={() => changeStatut(d.id, STATUT_NEXT[d.statut])}
                        disabled={updatingId === d.id}
                        className="text-xs text-gray-500 hover:text-amber-600 border border-gray-200 hover:border-amber-300
                          px-3 py-1.5 rounded-lg transition-all bg-white"
                      >
                        {updatingId === d.id ? '…' : `→ ${STATUT_NEXT[d.statut]}`}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-gray-500 text-sm">
              Page {page} sur {totalPages} — {total} demande(s) au total
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:text-gray-900
                  hover:border-gray-300 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                ← Précédent
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:text-gray-900
                  hover:border-gray-300 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Suivant →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
