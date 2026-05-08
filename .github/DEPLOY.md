# Déploiement automatique vers Hostinger (via Git Auto-Deploy)

## Comment ça marche

```
  Tu push sur main
        ↓
  GitHub Actions :
    1. npm ci
    2. npm run build  →  dist/
    3. push dist/  →  branche `production`
    4. curl webhook Hostinger
        ↓
  Hostinger fait `git pull` de la branche `production`  →  /public_html/
        ↓
  Site à jour 🎉
```

Tu n'as JAMAIS besoin de :
- Build localement
- Uploader des fichiers via FTP
- Toucher au gestionnaire de fichiers Hostinger

Juste `git push`, et tout suit.

## ⚙️ Configuration unique (à faire 1 seule fois)

### 1️⃣ Côté Hostinger — connecter le repo GitHub

1. Va sur [hpanel.hostinger.com](https://hpanel.hostinger.com)
2. Sélectionne ton hébergement → **Avancé → GitHub**
3. Clique **Connecter** (autorise Hostinger à voir tes repos GitHub)
4. **Créer un déploiement** :
   - **Référentiel** : `Sosalancien26/Crm-179`
   - **Branche** : `production` ⚠️ (et pas `main` — c'est sur `production`
     que les fichiers buildés vont arriver)
   - **Répertoire d'installation** : `public_html` (ou `public_html/crm` si
     tu veux un sous-dossier)
5. Récupère l'**URL de webhook** affichée par Hostinger (genre
   `https://webhooks.hostinger.com/deploy/xxxxxx`) → on en aura besoin
   à l'étape 2.

### 2️⃣ Côté GitHub — ajouter les secrets

Va sur ton repo : **Settings → Secrets and variables → Actions →
New repository secret**.

Ajoute ces **3 secrets** :

| Nom | Valeur |
|---|---|
| `HOSTINGER_DEPLOY_HOOK` | l'URL webhook Hostinger récupérée à l'étape 1 |
| `VITE_SUPABASE_URL` | `https://yxfanlgklvpdpsrzcoqy.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | la clé anon (cf. ton `.env.local`) |

⚠️ **Le webhook Hostinger doit rester secret** — n'importe qui avec cette
URL peut redéclencher un deploy. Ne jamais le mettre dans du code,
toujours dans GitHub Secrets.

## ✅ Premier test

```powershell
cd C:\Users\sacha\Documents\GitHub\Crm-179
git commit --allow-empty -m "trigger: first auto-deploy"
git push origin main
```

Va dans **GitHub → Actions** : tu verras le workflow tourner (1-3 min).
Étapes affichées :
1. ✅ Checkout
2. ✅ Setup Node
3. ✅ Install dependencies
4. ✅ Build
5. ✅ Push to `production` branch
6. ✅ Notify Hostinger

Quand tout est vert, va sur ton domaine — le CRM est en ligne.

## 🚨 Erreurs courantes

- **Workflow rouge à l'étape 5 (push to production)** :
  vérifie que `permissions: contents: write` est bien dans le YAML
  (déjà fait — ne pas modifier).

- **Workflow rouge à l'étape 6 (notify Hostinger)** :
  vérifie que `HOSTINGER_DEPLOY_HOOK` est bien dans GitHub Secrets et que
  l'URL est exacte.

- **Workflow vert mais site pas à jour** :
  côté hPanel, dans GitHub Auto Deploy, vérifie qu'il pointe bien sur la
  branche `production` et le bon `public_html`.

- **Site blanc** :
  ouvre la console Chrome (F12) → tu vois sûrement
  `VITE_SUPABASE_URL is undefined`. Ajoute le secret dans GitHub.

- **Login refuse Sacha/Copro2026** :
  vérifie que la table `crm179_users` contient bien Sacha — d