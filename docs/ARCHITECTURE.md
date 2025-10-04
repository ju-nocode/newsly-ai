# 🏗️ Architecture - Newsly AI

## Structure du Projet

```
newsly-ai/
├── api/                          # API Routes (Vercel Serverless)
│   ├── _middleware/             # Middleware partagé
│   │   └── security.js          # Fonctions de sécurité
│   ├── auth/                    # Authentification
│   │   ├── login.js            # POST /api/auth/login
│   │   ├── signup.js           # POST /api/auth/signup
│   │   └── resend.js           # POST /api/auth/resend
│   ├── user/                    # Gestion utilisateur
│   │   ├── profile.js          # GET/PUT /api/user/profile
│   │   ├── change-password.js  # POST /api/user/change-password
│   │   └── delete.js           # DELETE /api/user/delete
│   └── news.js                  # GET /api/news
│
├── pages/                       # Pages HTML
│   ├── index.html              # Page d'accueil + Auth modale
│   ├── dashboard.html          # Dashboard principal
│   └── settings.html           # Paramètres utilisateur
│
├── public/                      # Assets statiques
│   ├── css/
│   │   └── styles.css          # CSS global avec dark/light mode
│   ├── js/
│   │   ├── app.js              # Logique principale + Auth
│   │   ├── dashboard-utils.js  # Utilitaires + Protection XSS
│   │   └── translation-service.js  # Système de traduction FR/EN
│   ├── images/                 # Images et logos
│   └── fonts/                  # Polices personnalisées
│
├── docs/                        # Documentation
│   ├── ARCHITECTURE.md         # Ce fichier
│   └── SECURITY_IMPLEMENTATION.md  # Documentation sécurité
│
├── index.html                   # Redirection vers pages/
│
├── .env.example                 # Template variables d'env
├── vercel.json                  # Config Vercel
├── package.json                 # Dépendances
└── README.md                    # Documentation principale
```

## Stack Technique

### Frontend
- **HTML5** + CSS3 moderne
- **Vanilla JavaScript** (ES6 modules)
- **Responsive Design** (mobile-first)

### Backend
- **Vercel Serverless Functions** (Node.js)
- **Supabase** (Auth + Storage)
- **NewsAPI** (Actualités)

### Sécurité
- Validation stricte des inputs
- Protection XSS
- Rate limiting
- Headers de sécurité
- JWT tokens

## Flux de Données

### 1. Authentification
```
User → Frontend → /api/auth/login
                     ↓
                  Supabase Auth
                     ↓
                  JWT Token
                     ↓
                  localStorage
                     ↓
                  Dashboard
```

### 2. Chargement des News
```
Dashboard → /api/news?category=X
              ↓
           Validation params
              ↓
           NewsAPI (server-side)
              ↓
           Articles JSON
              ↓
           XSS Protection
              ↓
           Affichage
```

### 3. Mise à jour Profil
```
Settings → /api/user/profile (PUT)
             ↓
          JWT Verification
             ↓
          Validation Data
             ↓
          Supabase Auth.updateUser
             ↓
          user_metadata JSON
             ↓
          Success Response
```

## Gestion d'État

### Session
- **Token** : JWT stocké en localStorage
- **User** : Objet currentUser global
- **Vérification** : À chaque chargement de page protégée

### Thème
- **Storage** : localStorage.theme
- **States** : dark (défaut) / light
- **Attribute** : data-theme sur <html>

### Langue
- **Storage** : localStorage.language
- **States** : fr (défaut) / en
- **System** : translation-service.js

## Routes API

### Auth
| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/auth/login` | POST | ❌ | Connexion |
| `/api/auth/signup` | POST | ❌ | Inscription |
| `/api/auth/resend` | POST | ❌ | Renvoyer email confirmation |

### User
| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/user/profile` | GET | ✅ | Récupérer profil |
| `/api/user/profile` | PUT | ✅ | Modifier profil |
| `/api/user/change-password` | POST | ✅ | Changer mot de passe |
| `/api/user/delete` | DELETE | ✅ | Supprimer compte |

### News
| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/news` | GET | ❌ | Récupérer actualités |

**Query Params** :
- `category` : general, business, technology, science, health, sports, entertainment
- `country` : us, fr, gb, ca, de
- `page` : 1-10

## Système de Traduction

### Architecture
```javascript
// translation-service.js
fallbackTranslations = {
    fr: { key: 'valeur' },
    en: { key: 'value' }
}

translatePage() // Auto-traduit tous les [data-i18n]
```

### Utilisation
```html
<!-- HTML -->
<button data-i18n="nav.settings">Paramètres</button>
<input data-i18n-placeholder="nav.search" />

<!-- Script -->
const text = await t('nav.settings'); // Async
const text = tSync('nav.settings');   // Sync
```

## Base de Données

### Supabase Structure

**Table** : `auth.users` (Supabase intégré)

**user_metadata JSON** :
```json
{
  "username": "string",
  "display_name": "string",
  "full_name": "string",
  "phone": "string",
  "bio": "string",
  "avatar_url": "string (URL)"
}
```

**Pas de tables SQL personnalisées** - Tout est stocké dans `user_metadata`.

## Variables d'Environnement

### Production (Vercel)
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
NEWS_API_KEY=xxx
```

### Développement Local
Copier `.env.example` → `.env`

## Déploiement

### Vercel
```bash
# Auto-deploy depuis GitHub
git push origin main

# Ou manuel
vercel --prod
```

### Configuration Requise
1. Variables d'environnement dans Vercel Dashboard
2. Domaine configuré (optionnel)
3. Build settings : Framework Preset = Other

## Performance

### Optimisations
- ✅ Code splitting (ES6 modules)
- ✅ Lazy loading des news
- ✅ Rate limiting client/server
- ✅ Cache traductions (localStorage)
- ✅ CDN Vercel (assets statiques)

### Métriques Cibles
- First Contentful Paint : < 1.5s
- Time to Interactive : < 3.5s
- Lighthouse Score : > 90

## Évolutions Futures

### Court Terme
- [ ] Pagination infinie des news
- [ ] Filtres avancés
- [ ] Sauvegarde des articles favoris
- [ ] Notifications push

### Moyen Terme
- [ ] PWA (Progressive Web App)
- [ ] Mode offline
- [ ] Partage social
- [ ] AI Summarization

### Long Terme
- [ ] Mobile apps (React Native)
- [ ] API publique
- [ ] Webhooks
- [ ] Analytics dashboard

---

**Version** : 1.0
**Dernière mise à jour** : 2025-10-03
