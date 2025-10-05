# 📰 Newsly AI - AI-Powered NewsWall

> Votre agrégateur d'actualités personnalisé alimenté par l'intelligence artificielle

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ju-nocode/newsly-ai)
[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://prod-julien.vercel.app)

## 🌟 Fonctionnalités

### 🔐 Authentification & Profil
- ✅ Inscription/Connexion sécurisée (Supabase Auth)
- ✅ Gestion de profil complet (avatar, bio, téléphone, nom complet)
- ✅ Compression automatique avatars (max 200KB → ~50KB en JPEG 0.8)
- ✅ Changement de mot de passe sécurisé
- ✅ Session persistante avec localStorage
- ✅ Suppression de compte avec double confirmation
- ✅ Admin panel - Gestion utilisateurs et rôles (admin only)
- ✅ Security audit avec historique d'activité

### 📰 NewsWall Intelligent
- ✅ Agrégation d'actualités en temps réel (NewsAPI)
- ✅ 7 catégories prédéfinies (Général, Business, Tech, Science, Santé, Sports, Entertainment)
- ✅ Topics personnalisés ajoutables dynamiquement
- ✅ Filtrage multi-pays (🇺🇸 🇫🇷 🇬🇧 🇨🇦 🇩🇪)
- ✅ Recherche de sujets personnalisés
- ✅ Rafraîchissement automatique
- ✅ Affichage carte élégant avec images

### 🎨 Interface & Expérience
- ✅ Mode Dark/Light avec switch animé
- ✅ Multilingue (FR/EN) avec traduction instantanée
- ✅ Design moderne Supabase-inspired
- ✅ 100% Responsive (Mobile/Tablet/Desktop)
- ✅ Burger menu avec avatar utilisateur
- ✅ Particles.js background entièrement personnalisable
  - Couleur, opacité, vitesse des particules
  - Distance et couleur des lignes
  - Mode interaction au survol
  - Blur effect configurable
  - Sauvegarde en base de données par utilisateur
- ✅ Widget météo géolocalisé (Open-Meteo API)
- ✅ Transitions et animations fluides
- ✅ Toast notifications (succès/erreur)

## 🚀 Stack

**Frontend:** HTML5, CSS3, Vanilla JS (ES6 Modules)
**Backend:** Vercel Serverless Functions
**Database:** Supabase (PostgreSQL)
**Auth:** Supabase Auth
**Deployment:** Vercel

## 📁 Structure

```
newsly-ai/
├── api/                           # Vercel Serverless Functions
│   ├── auth/
│   │   ├── login.js              # Authentification utilisateur
│   │   ├── signup.js             # Inscription + création profil
│   │   └── resend.js             # Renvoi email confirmation
│   ├── user/
│   │   ├── profile.js            # GET/PUT profil utilisateur
│   │   ├── change-password.js    # Changement mot de passe
│   │   └── delete.js             # Suppression compte
│   ├── particles/
│   │   └── config.js             # GET/POST config particles.js
│   ├── news.js                   # Agrégation NewsAPI
│   └── _middleware/
│       └── security.js           # Validation & sanitization
├── public/
│   ├── css/
│   │   └── styles.css            # Styles complets (2500+ lignes)
│   └── js/
│       ├── app.js                # Auth, session, API calls
│       ├── index-page.js         # Logique page d'accueil
│       ├── index-init.js         # Initialisation index
│       ├── dashboard-utils.js    # Utilitaires (toast, display news)
│       ├── translation-service.js # Service i18n FR/EN
│       └── particles-config.js   # Config & init particles.js
├── index.html                    # Landing page avec features
├── dashboard.html                # Dashboard actualités
├── settings.html                 # Paramètres utilisateur
├── 404.html                      # Page erreur 404
├── vercel.json                   # Configuration Vercel
├── README.md                     # Documentation
└── SECURITY.md                   # Guide sécurité
```

## ⚙️ Installation

### 1. Prérequis
- Node.js 18+
- Compte Supabase
- Compte Vercel
- Clé NewsAPI

### 2. Configuration Supabase

#### Créez la table `profiles` :
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  username TEXT,
  full_name TEXT,
  phone TEXT,
  bio TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  particles_config JSONB,
  last_sign_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Activer Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent lire leur propre profil
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Politique : Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Politique : Les admins peuvent tout voir
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### Trigger auto-création profil :
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    username,
    full_name,
    phone,
    bio,
    avatar_url,
    last_sign_in_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'username'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'bio', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

#### Fonction pour mettre à jour le timestamp :
```sql
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

### 3. Variables d'environnement Vercel

```bash
# Supabase
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# NewsAPI (https://newsapi.org)
NEWS_API_KEY=votre_cle_newsapi
```

**Où les obtenir :**
- **Supabase** : Dashboard → Project Settings → API
- **NewsAPI** : https://newsapi.org/register (gratuit jusqu'à 100 req/jour)

### 4. Déploiement

```bash
# Cloner
git clone https://github.com/ju-nocode/newsly-ai.git
cd newsly-ai

# Déployer
vercel --prod
```

## 🔒 Sécurité

- ✅ **Validation stricte** des inputs (API + Frontend)
- ✅ **Protection XSS** avec `escapeHtml()` sur toutes les données dynamiques
- ✅ **Row Level Security (RLS)** Supabase activé
- ✅ **Headers sécurisés** (CORS configuré)
- ✅ **Compression avatars** automatique (200x200px, JPEG 0.8, ~50KB)
- ✅ **Détection tokens volumineux** (protection limite 16KB Vercel)
- ✅ **Rate limiting** client-side
- ✅ **Sanitization URLs** (protocoles HTTP/HTTPS uniquement)
- ✅ **HTTPS automatique** (Vercel SSL)
- ✅ **Variables d'environnement** sécurisées (clés API côté serveur)
- ✅ **Session expiration** gérée automatiquement

Voir [SECURITY.md](SECURITY.md) pour le guide complet.

## 🎯 Roadmap

- [ ] Export articles en PDF
- [ ] Notifications push pour nouveaux articles
- [ ] Intégration IA pour résumés d'articles
- [ ] Mode offline avec cache
- [ ] Application mobile (React Native)
- [ ] Partage social d'articles

## 📝 License

MIT © 2025 Newsly AI - Développé par [Julien Richard](https://www.linkedin.com/in/fr-richard-julien/)

## 🤝 Support & Contact

- 🐛 [Issues GitHub](https://github.com/ju-nocode/newsly-ai/issues)
- 📧 Email: ju.richard.33@gmail.com
- 🌐 [Live Demo](https://prod-julien.vercel.app)
- 💼 [LinkedIn](https://www.linkedin.com/in/fr-richard-julien/)

---

**⭐ Si vous aimez ce projet, n'hésitez pas à lui donner une étoile sur GitHub !**
