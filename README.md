# 📰 Newsly AI - Your AI-Powered NewsWall

> Votre agrégateur d'actualités personnalisé alimenté par l'intelligence artificielle

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ju-nocode/newsly-ai)
[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://prod-julien.vercel.app)

## 🌟 Fonctionnalités

### 🔐 Authentification & Profil
- **Inscription/Connexion** sécurisée avec Supabase Auth
- **Gestion de profil** complète (username, nom complet, téléphone, bio, avatar)
- **Changement de mot de passe** sécurisé
- **Suppression de compte** avec double confirmation
- **Session persistante** avec localStorage

### 📰 Actualités
- **Agrégation d'actualités** via NewsAPI
- **7 catégories** : Général, Business, Technologie, Science, Santé, Sports, Divertissement
- **Topics personnalisés** : Ajoutez vos propres sujets d'intérêt
- **Actualisation en temps réel**
- **Affichage carte** avec image, titre, description, source et date

### 🌍 Multilingue
- **Traduction complète** FR/EN
- **Switch langue** dynamique sans rechargement
- **Système de traduction** avec fallback local

### 🎨 Thème
- **Mode Dark/Light** avec switch élégant
- **Persistance** du thème sélectionné
- **Design moderne** inspiré de Supabase
- **Responsive** mobile-first

### 🔒 Sécurité
- ✅ **Validation stricte** de tous les inputs (API + Frontend)
- ✅ **Protection XSS** avec `escapeHtml()`
- ✅ **Headers de sécurité** (CORS, CSP, X-Frame-Options, HSTS)
- ✅ **Rate limiting** client & serveur
- ✅ **Service Role Key** pour opérations admin
- ✅ **HTTPS** automatique via Vercel
- ✅ **Pas d'exposition** des clés API côté client

## 🚀 Stack Technique

### Frontend
- **HTML5** + **CSS3** (Variables CSS, Grid, Flexbox)
- **Vanilla JavaScript** (ES6 Modules)
- **Architecture modulaire** : app.js, dashboard-utils.js, translation-service.js

### Backend
- **Vercel Serverless Functions** (Node.js)
- **API Routes** : `/api/auth/*`, `/api/user/*`, `/api/news`
- **Build Output API v3** pour déploiement optimisé

### Services
- **Supabase** - Authentification & stockage (user_metadata)
- **NewsAPI** - Agrégation d'actualités
- **Vercel** - Hébergement & déploiement

## 📁 Structure du Projet

```
newsly-ai/
├── api/                          # API Serverless Functions
│   ├── _middleware/
│   │   └── security.js          # Fonctions de sécurité (validation, sanitization)
│   ├── auth/
│   │   ├── login.js             # POST /api/auth/login
│   │   ├── signup.js            # POST /api/auth/signup
│   │   └── resend.js            # POST /api/auth/resend
│   ├── user/
│   │   ├── profile.js           # GET/PUT /api/user/profile
│   │   ├── change-password.js   # POST /api/user/change-password
│   │   └── delete.js            # DELETE /api/user/delete
│   └── news.js                   # GET /api/news
│
├── public/                       # Assets statiques
│   ├── css/
│   │   └── styles.css           # CSS global (30KB)
│   ├── js/
│   │   ├── app.js               # Logique principale + Auth
│   │   ├── dashboard-utils.js   # Utilitaires + Protection XSS
│   │   └── translation-service.js  # Système de traduction
│   ├── images/                  # Images (vide, prêt à utiliser)
│   └── fonts/                   # Polices (vide, prêt à utiliser)
│
├── docs/                         # Documentation
│   ├── ARCHITECTURE.md          # Architecture technique détaillée
│   └── SECURITY_IMPLEMENTATION.md  # Guide de sécurité complet
│
├── index.html                    # Page d'accueil + Auth modale
├── dashboard.html                # Dashboard principal
├── settings.html                 # Paramètres utilisateur
│
├── build.js                      # Script de build pour Vercel
├── vercel.json                   # Configuration Vercel
├── package.json                  # Dépendances
├── .env.example                  # Template variables d'environnement
├── .gitignore                    # Fichiers ignorés par Git
└── .vercelignore                 # Fichiers ignorés par Vercel
```

## 🛠️ Installation & Déploiement

### Prérequis
- Node.js >= 18.0.0
- Compte Vercel (gratuit)
- Compte Supabase (gratuit)
- Compte NewsAPI (gratuit)

### 1. Cloner le projet

```bash
git clone https://github.com/ju-nocode/newsly-ai.git
cd newsly-ai
npm install
```

### 2. Configuration Supabase

1. Créez un projet sur [Supabase](https://supabase.com)
2. Allez dans **Settings → API**
3. Copiez :
   - `Project URL` → `SUPABASE_URL`
   - `anon public` → `SUPABASE_ANON_KEY`
4. Allez dans **Settings → API → Service Role Key**
5. Copiez `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

**Important** : Le projet utilise `user_metadata` JSON. **Aucune table SQL n'est nécessaire** !

### 3. Configuration NewsAPI

1. Créez un compte sur [NewsAPI](https://newsapi.org)
2. Copiez votre API Key → `NEWS_API_KEY`

### 4. Variables d'environnement

Dans Vercel Dashboard → Settings → Environment Variables :

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEWS_API_KEY=xxxxxxxxxxxxxxxxxxxxx
```

### 5. Déploiement Vercel

#### Via Interface (Recommandé)

1. Importez le repo sur [Vercel](https://vercel.com/new)
2. Framework Preset : **Other**
3. Build Command : Laissez vide (auto-détecté)
4. Ajoutez les variables d'environnement
5. Deploy ! 🚀

#### Via CLI

```bash
npm install -g vercel
vercel login
vercel
```

### 6. Développement Local

```bash
npm run dev
# Ouvre http://localhost:3000
```

## 🔑 API Routes

### Authentification

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/auth/login` | POST | ❌ | Connexion utilisateur |
| `/api/auth/signup` | POST | ❌ | Inscription utilisateur |
| `/api/auth/resend` | POST | ❌ | Renvoyer email de confirmation |

**Body (login)** :
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Body (signup)** :
```json
{
  "email": "user@example.com",
  "password": "password123",
  "metadata": {
    "username": "john_doe",
    "full_name": "John Doe",
    "phone": "+33612345678"
  }
}
```

### Utilisateur

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/user/profile` | GET | ✅ | Récupérer profil |
| `/api/user/profile` | PUT | ✅ | Modifier profil |
| `/api/user/change-password` | POST | ✅ | Changer mot de passe |
| `/api/user/delete` | DELETE | ✅ | Supprimer compte |

**Headers (authentifié)** :
```
Authorization: Bearer <access_token>
```

### Actualités

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/news` | GET | ❌ | Récupérer actualités |

**Query params** :
- `category` : general, business, technology, science, health, sports, entertainment
- `country` : us, fr, gb, ca, de
- `page` : 1-10

**Exemple** :
```
GET /api/news?category=technology&country=us&page=1
```

## 📊 Base de Données

### Structure Supabase

Le projet utilise **user_metadata JSON** au lieu de tables SQL :

```json
{
  "username": "john_doe",
  "display_name": "john_doe",
  "full_name": "John Doe",
  "phone": "+33612345678",
  "bio": "Developer & Tech Enthusiast",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

**Avantages** :
- ✅ Pas de migration SQL
- ✅ Flexible et extensible
- ✅ Intégré nativement dans Supabase Auth
- ✅ Row-level security automatique

## 🔧 Scripts NPM

```bash
npm run dev      # Développement local (Vercel Dev)
npm run build    # Build pour production (copie fichiers statiques)
npm run deploy   # Déploiement Vercel
```

## 🎨 Personnalisation

### Couleurs (CSS Variables)

Modifiez `public/css/styles.css` :

```css
:root[data-theme="dark"] {
  --color-primary: #3ecf8e;      /* Vert principal */
  --color-bg: #0a0a0a;           /* Fond noir */
  --color-surface: #1a1a1a;      /* Surfaces */
  /* ... */
}
```

### Traductions

Ajoutez des traductions dans `public/js/translation-service.js` :

```javascript
const fallbackTranslations = {
  fr: {
    'new.key': 'Nouvelle traduction'
  },
  en: {
    'new.key': 'New translation'
  }
};
```

## 📚 Documentation Complète

- [📖 ARCHITECTURE.md](docs/ARCHITECTURE.md) - Architecture technique détaillée
- [🔒 SECURITY_IMPLEMENTATION.md](docs/SECURITY_IMPLEMENTATION.md) - Guide de sécurité complet
- [🚀 DEPLOYMENT.md](DEPLOYMENT.md) - Guide de déploiement
- [🔐 SECURITY.md](SECURITY.md) - Politique de sécurité
- [📦 SUPABASE.md](SUPABASE.md) - Configuration Supabase

## 🐛 Debugging

### Problème : 404 Not Found

- Vérifiez que le build s'est bien passé dans Vercel Deployments
- Vérifiez `build.js` copie bien les fichiers dans `.vercel/output/static/`

### Problème : API Routes ne fonctionnent pas

```bash
# Vérifiez les logs Vercel
vercel logs

# Vérifiez les variables d'environnement
vercel env ls
```

### Problème : "Auth session missing"

- Vérifiez que `SUPABASE_SERVICE_ROLE_KEY` est bien configurée
- Cette clé est nécessaire pour update profile et change password

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir [LICENSE](LICENSE) pour plus d'informations.

## 🙏 Remerciements

- [Supabase](https://supabase.com) - Backend as a Service
- [Vercel](https://vercel.com) - Hébergement & Déploiement
- [NewsAPI](https://newsapi.org) - Agrégation d'actualités
- [Claude Code](https://claude.com/claude-code) - Développement assisté par IA

## 📞 Support

- 🐛 **Issues** : [GitHub Issues](https://github.com/ju-nocode/newsly-ai/issues)
- 📧 **Email** : security@newsly-ai.com
- 🌐 **Demo** : [https://prod-julien.vercel.app](https://prod-julien.vercel.app)

---

**Développé avec ❤️ par Claude Code**

🤖 Generated with [Claude Code](https://claude.com/claude-code)
