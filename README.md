# Désinfection — Application web

## Lancement

```bash
npm install
npx supabase start
```

Crée un fichier `.env.local` à la racine :

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<anon key affiché par supabase start>
NEXT_RESEND_API_KEY=<clé API Resend>
```

```bash
npm run dev
```

L'application tourne sur [http://localhost:3000](http://localhost:3000).

---

## Choix techniques

- **Next.js 15** avec App Router pour le routing et les Server Components
- **Supabase** pour la base de données PostgreSQL, l'authentification et le temps réel
- **TypeScript** pour la sécurité des types
- **Tailwind CSS** pour le design de l'interface
- **Resend** pour l'envoi d'emails

---

## Difficultés rencontrées

- **Container Supabase instable au démarrage** : le container `supabase_realtime` se retrouve parfois en état `unhealthy` après `npx supabase start`. La solution est de relancer la commande ou d'exécuter `npx supabase stop --no-backup` puis `npx supabase start`.
- **Conflit de ports Docker** : deux instances PostgreSQL tournent en parallèle (port 54322 et 5433), ce qui nécessite de bien cibler la bonne base selon le service.
