# CRM 179 — Opération CEE BAR-TH-179 (PAC collective air/eau)

CRM premium dédié à la gestion des clients et chantiers de
l'opération CEE **BAR-TH-179** (pompe à chaleur collective air/eau,
résidentiel collectif). Stocke, structure, suit et visualise toutes
les informations clients/chantiers — **ne génère aucun devis**.

> Stack : **React 18 + Vite + Tailwind CSS + Framer Motion**, base
> de données **Supabase** (projet `stats-leads`), auth bcryptjs.

## ✨ Fonctionnalités

- **Login** sécurisé bcrypt (compte par défaut : `Sacha` / `Copro2026`).
- **Dashboard KPI** : 8 compteurs animés, donut/bar/area Recharts,
  top 5 clients, mini-carte densité, alertes intelligentes.
- **Clients** : tableau filtré (type, statut, département, énergie,
  Coup de Pouce x3), recherche instantanée, scroll infini, export
  CSV. Drawer fiche complète à 11 sections (identification,
  interlocuteurs, adresses, technique, devis, suivi, timeline,
  documents, checklist CEE, notes), export PDF avec **4 designs
  aléatoires**, mini-carte Leaflet sur l'adresse chantier, calculs
  automatiques (zone climatique, volume CEE, prime estimée, reste
  à charge, Coup de Pouce x3).
- **Pipeline Kanban** drag&drop @dnd-kit avec log timeline auto.
- **Carte de France** (React-Leaflet, tuiles CartoDB Dark) :
  markers colorés par statut, popup riche, filtres latéraux,
  heatmap toggleable, géocodage Nominatim.
- **Paramètres** : toutes les listes éditables (types clients,
  statuts, énergies, mandataires, sources, etc.) avec couleur,
  changement de mot de passe, mode clair/sombre, notifications.
- **Recherche globale `⌘K` / `Ctrl+K`** : pages, clients, actions.
- **Mode sombre** signature (par défaut) + mode clair.
- **Animations Framer Motion** partout (transitions de page,
  hover, compteurs, skeleton loaders, micro-interactions).
- **Glassmorphism** + dégradés violet→bleu + accent or.

## 🚀 Démarrage local

```bash
# 1. Installer
npm install

# 2. Configurer l'env (déjà fourni dans .env.local pour le projet stats-leads)
cp .env.example .env.local

# 3. Lancer en dev
npm run dev
# → http://localhost:5173
```

Connexion : **Sacha** / **Copro2026**

## 📦 Build de production

```bash
npm run build      # produit /dist
npm run preview    # serveur local pour tester /dist
```

Le build est **statique** (HashRouter) — aucun serveur Node requis,
parfait pour Hostinger.

## 🌐 Déploiement Hostinger

1. Connecte-toi à hPanel → ton hébergement → **Gestionnaire de
   fichiers**.
2. Place-toi dans le dossier `public_html/` (ou un sous-dossier
   ex. `public_html/crm179/`).
3. Upload **le contenu** du dossier `dist/` (pas le dossier dist
   lui-même) : `index.html`, `assets/`, `favicon.svg`.
4. C'est en ligne !
   URL : `https://tondomaine.com/` (ou `/crm179/`).
5. **Si tu déploies dans un sous-dossier** :
   - dans `vite.config.js`, modifie `base: './'` → c'est déjà
     paramétré pour fonctionner partout.

> Le HashRouter (URLs avec `#`) évite la config `.htaccess` :
> `https://ton-domaine/#/clients` fonctionne directement.

### Astuce : push GitHub puis déploiement automatique

Si tu utilises **GitHub Pages** ou un déploiement Hostinger via
Git :

```bash
cd C:\Users\sacha\Documents\GitHub\Crm-179
git add .
git commit -m "feat: CRM 179 v1.0"
git push origin main
```

## 🗄️ Base de données

Toutes les tables sont déjà créées dans le projet Supabase
**stats-leads** (`yxfanlgklvpdpsrzcoqy`) :

| Table                | Rôle                                |
|----------------------|-------------------------------------|
| `crm179_clients`     | fiches clients (jsonb riche)        |
| `crm179_contacts`    | jusqu'à 3 interlocuteurs / client   |
| `crm179_documents`   | méta-données documents (Storage)    |
| `crm179_timeline`    | journal d'évènements                |
| `crm179_parametres`  | listes paramétrables                |
| `crm179_users`       | comptes locaux (bcrypt)             |

**RLS** activée sur toutes — politiques `anon` permissives, l'auth
applicative étant gérée côté frontend (cf. `src/lib/auth.js`).

**Storage** : bucket privé `crm179-documents` — les fichiers sont
servis via signed URLs (validité 1h).

**Compte admin seedé** :

```
Prénom    : Sacha
Mot de passe : Copro2026
```

(le hash bcrypt est calculé par `pgcrypto` côté Supabase, et
vérifié côté front par `bcryptjs`).

## 🧪 Variables d'environnement

`.env.local` (ne pas commit, déjà dans `.gitignore`) :

```
VITE_SUPABASE_URL=https://yxfanlgklvpdpsrzcoqy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ…
```

Le template est dans `.env.example`.

## 🧱 Architecture

```
src/
├── lib/             supabase, auth, utils, geocoding, cee, pdf, départements
├── contexts/        Auth / Theme / Toast
├── hooks/           useClients, useDocuments, useTimeline, useParametres, useCountUp
├── components/
│   ├── ui/          Button, Card, Modal, Drawer, Input, Select, Badge, …
│   ├── layout/      Sidebar, Topbar, CommandPalette, Layout
│   ├── auth/        LoginPage
│   ├── dashboard/   KpiCard, Charts, MiniMapDensity, AlertsPanel
│   ├── clients/     ClientList, ClientDrawer, MiniMapChantier
│   ├── pipeline/    KanbanBoard
│   ├── map/         MapFrance
│   └── parametres/  CategorieEditor
└── pages/           Dashboard / Clients / Pipeline / Map / Paramètres
```

## ⚙️ Calculs métier

- **Coup de Pouce x3** auto si énergie remplacée ∈ {Gaz, Fioul, Charbon}.
- **Volume CEE (kWh cumac)** : forfait BAR-TH-179 par usage / zone H1-H2-H3,
  multiplié par le nombre de logements, pondéré par ETAS, ×3 si Coup de
  Pouce. Calcul indicatif (cf. `src/lib/cee.js`).
- **Reste à charge** = TTC − Prime CEE.
- **Département** auto depuis le code postal (Corse + DOM gérés).
- **Zone climatique** auto depuis le département.
- **ID client** auto-incrémenté `CL-2026-0001` via fonction RPC.

## 🛡️ Sécurité

- Hash bcrypt côté Postgres (`pgcrypto`), comparé côté front avec
  bcryptjs.
- RLS activée sur toutes les tables, politiques anonymes
  permissives **assumées** (auth applicative).
- Pour un déploiement multi-utilisateur en production, migrer vers
  Supabase Auth (`auth.users` + JWT) et restreindre les politiques
  par `auth.uid()`.

---

© 2026 — CRM 179 · Sacha
