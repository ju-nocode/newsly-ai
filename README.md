# 📰 Newsly AI

> Votre agrégateur d'actualités personnalisé alimenté par l'intelligence artificielle

[![Live Demo](https://img.shields.io/badge/🌐_demo-live-success?style=for-the-badge)](https://prod-julien.vercel.app)
[![Stack](https://img.shields.io/badge/Stack-Supabase%20%7C%20Vercel-blue?style=for-the-badge)](https://github.com)
[![Made with](https://img.shields.io/badge/Made_with-❤️_&_JavaScript-red?style=for-the-badge)](https://github.com)

![Newsly AI Banner](https://via.placeholder.com/1200x400/3ecf8e/ffffff?text=Newsly+AI+-+Your+Personalized+NewsWall)

---

## 🎯 À propos

**Newsly AI** est une plateforme moderne d'agrégation d'actualités qui combine intelligence artificielle et design élégant pour vous offrir une expérience de lecture personnalisée. Restez informé avec des actualités du monde entier, filtrées selon vos préférences.

### ✨ Points forts

- 🤖 **IA-Powered** - Filtrage intelligent des actualités
- 🌍 **Multi-pays** - Actualités de 5 pays (🇺🇸 🇫🇷 🇬🇧 🇨🇦 🇩🇪)
- 🎨 **Design moderne** - Interface Supabase-inspired
- 📱 **100% Responsive** - Mobile, tablette, desktop
- 🌓 **Dark/Light Mode** - Adaptation à vos préférences
- 🌐 **Multilingue** - Français & English
- ⚡ **Temps réel** - Actualités rafraîchies en direct

---

## 🌟 Fonctionnalités

### 🔐 Authentification & Profil

| Fonctionnalité | Description |
|----------------|-------------|
| 🔑 **Connexion sécurisée** | Authentification Supabase avec JWT |
| 👤 **Profil complet** | Avatar, bio, téléphone, nom complet |
| 🖼️ **Upload avatar** | Compression automatique (200KB → 50KB) |
| 🔒 **Changement MDP** | Sécurité renforcée |
| 🗑️ **Suppression compte** | Double confirmation |
| 👥 **Admin Panel** | Gestion utilisateurs (admin only) |
| 📊 **Audit sécurité** | Historique des activités |

### 📰 NewsWall Intelligent

```
✅ 7 catégories prédéfinies
   📌 Général | 💼 Business | 💻 Technologie
   🔬 Science | ❤️ Santé | ⚽ Sports | 🎬 Divertissement

✅ Topics personnalisés
   Ajoutez vos propres sujets d'intérêt

✅ Filtrage multi-pays
   Combinez les sources de plusieurs pays

✅ Recherche dynamique
   Trouvez exactement ce que vous cherchez
```

### 🎨 Interface & Design

- **🌓 Mode Dark/Light** - Switch animé élégant
- **🌐 i18n FR/EN** - Traduction instantanée
- **✨ Particles.js** - Background personnalisable
  - Couleur, opacité, vitesse
  - Distance et couleur des lignes
  - Interaction au survol
  - Effet de flou configurable
- **🌤️ Widget météo** - Géolocalisé avec Open-Meteo API
- **🍔 Burger menu** - Navigation mobile optimisée
- **🎭 Animations fluides** - Transitions soignées
- **🔔 Toast notifications** - Feedback utilisateur

---

## 🛠️ Stack Technique

### Frontend
```javascript
HTML5 + CSS3 + Vanilla JavaScript (ES6 Modules)
├── Particles.js      // Background animé
├── Inter Font        // Typographie moderne
└── CSS Variables     // Theming dynamique
```

### Backend
```
Vercel Serverless Functions
├── /api/auth/*       // Authentification
├── /api/user/*       // Gestion profil
├── /api/news         // Agrégation actualités
└── /api/particles/*  // Config personnalisée
```

### Services & Database
```
Supabase (PostgreSQL + Auth)
├── Table: profiles          // Données utilisateurs
├── RLS Policies            // Sécurité par rôle
└── Triggers                // Auto-création profil

NewsAPI.org                 // Source actualités
Open-Meteo API              // Données météo
```

---

## 📁 Architecture du Projet

```
newsly-ai/
│
├── 📄 Pages HTML
│   ├── index.html              # Landing page
│   ├── dashboard.html          # NewsWall principal
│   ├── settings.html           # Paramètres utilisateur
│   └── 404.html                # Page erreur
│
├── 🎨 Assets
│   ├── public/css/
│   │   └── styles.css          # 2600+ lignes de style
│   │
│   ├── public/js/
│   │   ├── app.js              # Core (auth, API)
│   │   ├── dashboard-utils.js  # Utilitaires
│   │   ├── translation-service.js # i18n
│   │   ├── particles-config.js # Config particles
│   │   ├── index-page.js       # Logic landing
│   │   └── index-init.js       # Init landing
│   │
│   └── public/locales/
│       ├── fr.json             # Traductions FR
│       └── en.json             # Traductions EN
│
├── ⚡ API (Vercel Functions)
│   ├── auth/
│   │   ├── login.js            # POST /api/auth/login
│   │   ├── signup.js           # POST /api/auth/signup
│   │   └── resend.js           # POST /api/auth/resend
│   │
│   ├── user/
│   │   ├── profile.js          # GET/PUT /api/user/profile
│   │   ├── change-password.js  # POST /api/user/change-password
│   │   └── delete.js           # DELETE /api/user/delete
│   │
│   ├── particles/
│   │   └── config.js           # GET/POST /api/particles/config
│   │
│   ├── news.js                 # GET /api/news
│   │
│   └── _middleware/
│       └── security.js         # Validation & sanitization
│
├── 📋 Configuration
│   ├── vercel.json             # Config Vercel
│   ├── package.json            # Dependencies
│   └── .env.example            # Template variables
│
└── 📚 Documentation
    ├── README.md               # Ce fichier
    ├── SECURITY.md             # Politique sécurité
    └── CONTRIBUTING.md         # Guide contribution
```

---

## 🚀 Installation & Déploiement

### 1️⃣ Prérequis

- **Node.js** 18+
- **Compte Supabase** (gratuit)
- **Compte Vercel** (gratuit)
- **Clé NewsAPI** ([newsapi.org](https://newsapi.org/register))

### 2️⃣ Configuration Supabase

#### Créer la table `profiles`

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

-- Index pour performances
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Activer Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politique : Lecture propre profil
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Politique : Modification propre profil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Politique : Admins lisent tout
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### Trigger auto-création profil

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, username, full_name, phone, bio, avatar_url, last_sign_in_at
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

#### Trigger mise à jour timestamp

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

### 3️⃣ Variables d'environnement

Créer un fichier `.env` à la racine :

```bash
# Supabase
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# NewsAPI (https://newsapi.org)
NEWS_API_KEY=votre_cle_newsapi
```

**📍 Où trouver ces clés ?**
- **Supabase** : Dashboard → Settings → API
- **NewsAPI** : [newsapi.org/register](https://newsapi.org/register) (100 req/jour gratuit)

### 4️⃣ Déploiement sur Vercel

```bash
# Cloner le repo
git clone https://github.com/votre-username/newsly-ai.git
cd newsly-ai

# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel --prod
```

Puis configurer les variables d'environnement dans Vercel Dashboard :
**Settings → Environment Variables**

---

## 🔒 Sécurité

### Mesures implémentées

| 🛡️ Sécurité | ✅ Status |
|-------------|-----------|
| **JWT Tokens** | Authentification Supabase |
| **RLS Policies** | Sécurité base de données |
| **Input Validation** | Toutes les API |
| **XSS Protection** | `escapeHtml()` global |
| **HTTPS Only** | Vercel SSL automatique |
| **CORS** | Headers configurés |
| **Rate Limiting** | Client-side |
| **Image Compression** | 200x200px, 50KB max |
| **Token Validation** | Limite 16KB |
| **Session Expiration** | Auto-déconnexion |

👉 Voir [SECURITY.md](SECURITY.md) pour plus de détails

---

## 🎯 Roadmap

### En cours 🚧
- [ ] Mode offline avec cache
- [ ] Notifications push
- [ ] Partage social d'articles

### Futur 🔮
- [ ] Export PDF des articles
- [ ] Résumés IA des articles
- [ ] App mobile (React Native)
- [ ] Favoris et historique
- [ ] Filtres avancés par source

---

## 📸 Captures d'écran

### 🏠 Landing Page
![Landing](https://via.placeholder.com/800x450/3ecf8e/ffffff?text=Landing+Page)

### 📰 Dashboard
![Dashboard](https://via.placeholder.com/800x450/3ecf8e/ffffff?text=Dashboard)

### ⚙️ Settings
![Settings](https://via.placeholder.com/800x450/3ecf8e/ffffff?text=Settings)

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Consultez [CONTRIBUTING.md](CONTRIBUTING.md) pour démarrer.

### Comment contribuer ?

1. 🍴 Fork le projet
2. 🌿 Créer une branche (`git checkout -b feature/AmazingFeature`)
3. ✍️ Commit les changements (`git commit -m 'feat: Add AmazingFeature'`)
4. 📤 Push vers la branche (`git push origin feature/AmazingFeature`)
5. 🔁 Ouvrir une Pull Request

---

## 📞 Contact & Support

<div align="center">

### 👨‍💻 Julien Richard

[![Portfolio](https://img.shields.io/badge/Portfolio-000000?style=for-the-badge&logo=About.me&logoColor=white)](https://www.linkedin.com/in/fr-richard-julien/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/fr-richard-julien/)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:ju.richard.33@gmail.com)

**Live Demo:** [prod-julien.vercel.app](https://prod-julien.vercel.app)

</div>

### 🐛 Signaler un bug

Trouvé un bug ? [Ouvrez une issue](https://github.com/ju-nocode/newsly-ai/issues)

---

## 📜 License

**MIT License** - Voir le fichier LICENSE pour plus de détails

---

<div align="center">

**Fait avec ❤️ et ☕ par [Julien Richard](https://www.linkedin.com/in/fr-richard-julien/)**

⭐ **Si vous aimez ce projet, n'oubliez pas de lui donner une étoile !** ⭐

</div>
