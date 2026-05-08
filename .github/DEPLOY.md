# Déploiement automatique vers Hostinger

À chaque `git push` sur `main`, le workflow `.github/workflows/deploy.yml`
build le projet et envoie le contenu de `dist/` sur ton hébergement
Hostinger via FTP.

## ⚙️ Configuration unique (à faire 1 seule fois)

Va dans ton repo GitHub :
**Settings → Secrets and variables → Actions → New repository secret**

Et ajoute ces 5 secrets :

| Nom du secret              | Valeur                                                      | Où la trouver |
|----------------------------|-------------------------------------------------------------|---------------|
| `FTP_SERVER`               | `ftp.tondomaine.com` ou l'IP du serveur                     | hPanel → Comptes FTP → ton compte |
| `FTP_USERNAME`             | `u123456789` ou ton login FTP                                | hPanel → Comptes FTP |
| `FTP_PASSWORD`             | mot de passe FTP                                             | hPanel → Comptes FTP (Modifier mdp) |
| `FTP_SERVER_DIR`           | `/public_html/` (ou `/public_html/crm/` si sous-dossier)    | dépend d'où tu veux héberger |
| `VITE_SUPABASE_URL`        | `https://yxfanlgklvpdpsrzcoqy.supabase.co`                  | déjà connu                      |
| `VITE_SUPABASE_ANON_KEY`   | la clé anon (cf. .env.local)                                | Supabase → Settings → API       |

### Trouver les infos FTP Hostinger

1. Connecte-toi à [hpanel.hostinger.com](https://hpanel.hostinger.com)
2. Sélectionne ton hébergement → **Avancé → Comptes FTP**
3. Tu verras :
   - **Hôte FTP** → c'est `FTP_SERVER` (souvent `ftp.tondomaine.com` ou
     `145.14.158.X`)
   - **Nom d'utilisateur FTP** → c'est `FTP_USERNAME`
   - **Mot de passe** → si tu ne le connais pas, clique **Changer le mot
     de passe** et note-le. C'est `FTP_PASSWORD`.
4. **Hôte du serveur** : note bien que sur Hostinger l'hôte FTP est souvent
   sous la forme `ftp.tondomaine.com`. Vérifie aussi l'option **Port** :
   par défaut `21` (FTP). Le workflow gère FTPS automatiquement.

## ✅ Vérification

Après avoir ajouté les secrets :

```bash
git commit --allow-empty -m "trigger: redeploy"
git push origin main
```

Puis va dans **GitHub → Actions → Build & Deploy to Hostinger**.
Tu vois le job tourner en live (1-3 min). Quand c'est vert ✅, le site
est à jour.

## 🚨 Erreurs courantes

- **`530 Login authentication failed`** → mauvais `FTP_USERNAME` ou
  `FTP_PASSWORD`. Régénère le mot de passe FTP dans hPanel.
- **`ECONNREFUSED`** → mauvais `FTP_SERVER`. Vérifie l'hôte FTP dans
  hPanel (souvent `ftp.tondomaine.com`).
- **`550 Permission denied`** → `FTP_SERVER_DIR` pointe vers un dossier
  où ton compte FTP n'a pas les droits. Mets `/public_html/`.
- **Site blanche** : ouvre la console Chrome (F12) — souvent c'est une
  variable d'env Supabase manquante. Vérifie `VITE_SUPABASE_URL` et
  `VITE_SUPABASE_ANON_KEY` dans Settings → Secrets.

## 🧰 Workflow manuel

Si tu veux déclencher un déploiement sans pousser de code :
**GitHub → Actions → Build & Deploy to Hostinger → Run workflow**.
