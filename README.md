# 🚀 Guide de Déploiement - Newsly AI

## Architecture Sécurisée

L'application utilise maintenant une architecture backend sécurisée avec :
- **Frontend** : HTML/CSS/JS statique
- **Backend** : Vercel Serverless Functions (dans `/api`)
- **Base de données** : Supabase
- **API externe** : NewsAPI (optionnel)

## 📋 Prérequis

1. **Compte Vercel** (gratuit) : https://vercel.com
2. **Compte Supabase** (gratuit) : https://supabase.com
3. **Compte NewsAPI** (optionnel, gratuit) : https://newsapi.org
4. **Git** installé

## 🔧 Configuration

### 1. Installation des dépendances

```bash
cd newsly-ai
npm install
```

### 2. Configuration des variables d'environnement

#### Récupérer vos clés Supabase

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **Settings → API**
4. Copiez :
   - `Project URL` → `SUPABASE_URL`
   - `anon public` → `SUPABASE_ANON_KEY`

#### Récupérer votre clé NewsAPI (optionnel)

1. Allez sur https://newsapi.org
2. Créez un compte gratuit
3. Copiez votre `API Key` → `NEWS_API_KEY`

### 3. Déploiement sur Vercel

#### Méthode 1 : Via l'interface Vercel (recommandé)

1. **Connectez votre repository Git** :
   - Allez sur https://vercel.com/new
   - Importez votre repository GitHub/GitLab/Bitbucket
   - Sélectionnez le projet `newsly-ai`

2. **Configurez le projet** :
   - **Framework Preset** : Other
   - **Root Directory** : `newsly-ai`
   - **Build Command** : (laisser vide)
   - **Output Directory** : (laisser vide)

3. **Ajoutez les variables d'environnement** :
   - Cliquez sur "Environment Variables"
   - Ajoutez :
     ```
     SUPABASE_URL=https://votre-projet.supabase.co
     SUPABASE_ANON_KEY=votre-cle-anon
     NEWS_API_KEY=votre-cle-newsapi
     ```

4. **Déployez** :
   - Cliquez sur "Deploy"
   - Attendez la fin du déploiement (1-2 minutes)

#### Méthode 2 : Via CLI

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter à Vercel
vercel login

# Déployer
vercel

# Ajouter les variables d'environnement
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add NEWS_API_KEY

# Redéployer avec les variables
vercel --prod
```

### 4. Configuration Supabase (si nécessaire)

#### Créer les tables (si pas encore fait)

```sql
-- Table des profils utilisateurs
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des préférences utilisateurs
CREATE TABLE user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category)
);

-- Activer Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Utilisateurs peuvent lire leur profil"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Utilisateurs peuvent modifier leur profil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Utilisateurs peuvent lire leurs préférences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent modifier leurs préférences"
  ON user_preferences FOR ALL
  USING (auth.uid() = user_id);
```

## ✅ Vérification du déploiement

1. Ouvrez votre URL Vercel (ex: `https://votre-app.vercel.app`)
2. Testez l'inscription : `/signup.html`
3. Testez la connexion : `/login.html`
4. Vérifiez le dashboard : `/dashboard.html`

## 🔍 Déboguer les problèmes

### Les API routes ne fonctionnent pas

1. Vérifiez les logs Vercel :
   ```bash
   vercel logs
   ```

2. Vérifiez que les variables d'environnement sont bien configurées :
   - Dashboard Vercel → Settings → Environment Variables

### Erreur "NewsAPI key not configured"

- Ajoutez la variable `NEWS_API_KEY` dans Vercel
- Ou modifiez `api/news.js` pour utiliser une source alternative

### Erreur CORS

- Les headers CORS sont déjà configurés dans `vercel.json`
- Si problème persiste, vérifiez la console du navigateur

## 🔄 Mises à jour

Pour déployer les changements :

```bash
git add .
git commit -m "Description des changements"
git push
```

Vercel redéploiera automatiquement ! 🎉

## 📚 Structure des fichiers

```
newsly-ai/
├── api/                     # Backend (Serverless Functions)
│   ├── auth/
│   │   ├── login.js         # Endpoint login
│   │   └── signup.js        # Endpoint signup
│   ├── news.js              # Endpoint actualités
│   └── user/
│       └── profile.js       # Endpoint profil
├── app.js                   # Frontend sécurisé
├── dashboard-utils.js       # Utilitaires dashboard
├── login.html               # Page de connexion
├── signup.html              # Page d'inscription
├── dashboard.html           # Dashboard utilisateur
├── index.html               # Page d'accueil
├── css/                     # Styles
│   └── styles.css           # Feuille de styles
├── vercel.json              # Config Vercel
├── package.json             # Dépendances
└── .env.example             # Template variables d'env
```

## 🔒 Sécurité

### Ce qui est sécurisé

✅ Clés API cachées côté serveur (Vercel)
✅ Authentification via backend
✅ Row Level Security (RLS) sur Supabase
✅ HTTPS automatique
✅ Validation des entrées
✅ Protection CORS

### Limites (plan gratuit)

⚠️ Pas de rate limiting avancé
⚠️ Pas de monitoring des erreurs
⚠️ NewsAPI limité à 100 requêtes/jour

## 🆘 Support

- **Vercel Docs** : https://vercel.com/docs
- **Supabase Docs** : https://supabase.com/docs
- **NewsAPI Docs** : https://newsapi.org/docs

---

**Fait avec ❤️ par Claude Code**
