# 📰 Newsly AI - AI-Powered NewsWall

> Votre agrégateur d'actualités personnalisé alimenté par l'intelligence artificielle

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ju-nocode/newsly-ai)
[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://prod-julien.vercel.app)

## 🌟 Fonctionnalités

### 🔐 Authentification
- Inscription/Connexion sécurisée (Supabase Auth)
- Gestion de profil (avatar compressé, bio, téléphone)
- Changement de mot de passe
- Session persistante

### 📰 Actualités
- Agrégation d'actualités (NewsAPI)
- 7 catégories + topics personnalisés
- Affichage en temps réel

### 🎨 Interface
- Mode Dark/Light
- Multilingue (FR/EN)
- Design moderne responsive
- Burger menu avec avatar

## 🚀 Stack

**Frontend:** HTML5, CSS3, Vanilla JS (ES6 Modules)
**Backend:** Vercel Serverless Functions
**Database:** Supabase (PostgreSQL)
**Auth:** Supabase Auth
**Deployment:** Vercel

## 📁 Structure

```
newsly-ai/
├── api/                    # Serverless functions
│   ├── auth/              # login, signup, resend
│   ├── user/              # profile, change-password, delete
│   └── news.js            # NewsAPI aggregation
├── public/
│   ├── css/styles.css     # Styles globaux
│   └── js/
│       ├── app.js         # Auth & API calls
│       ├── dashboard-utils.js
│       └── translation-service.js
├── index.html             # Landing page
├── dashboard.html         # News dashboard
├── settings.html          # User settings
├── 404.html               # Error page
└── vercel.json            # Vercel config
```

## ⚙️ Installation

### 1. Prérequis
- Node.js 18+
- Compte Supabase
- Compte Vercel
- Clé NewsAPI

### 2. Configuration Supabase

Créez une table `profiles` :
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  username TEXT,
  full_name TEXT,
  phone TEXT,
  bio TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger auto-création profil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'username')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 3. Variables d'environnement Vercel

```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
NEWSAPI_KEY=xxx
```

### 4. Déploiement

```bash
# Cloner
git clone https://github.com/ju-nocode/newsly-ai.git
cd newsly-ai

# Déployer
vercel --prod
```

## 🔒 Sécurité

- ✅ Validation stricte inputs (API + Frontend)
- ✅ Protection XSS avec `escapeHtml()`
- ✅ Headers sécurisés (CORS, HSTS)
- ✅ Compression avatars (max 50KB)
- ✅ Détection tokens volumineux
- ✅ HTTPS automatique (Vercel)

Voir [SECURITY.md](SECURITY.md) pour plus de détails.

## 📝 License

MIT © 2025 Newsly AI

## 🤝 Support

- 🐛 [Issues](https://github.com/ju-nocode/newsly-ai/issues)
- 📧 Email: support@newsly.ai
- 🌐 [Live Demo](https://prod-julien.vercel.app)
