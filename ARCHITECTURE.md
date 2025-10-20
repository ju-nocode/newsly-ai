# 🏗️ Architecture - NewslyAI

## Vue d'ensemble

NewslyAI est une application de news aggregator avec authentification utilisateur, utilisant:
- **Frontend**: HTML5, Vanilla JavaScript (ES6 Modules), CSS3
- **Backend**: Vercel Serverless Functions (API Routes)
- **Auth & Database**: Supabase (PostgreSQL + Auth JWT)
- **Déploiement**: Vercel

---

## 📁 Structure des dossiers

```
newsly-ai/
├── api/                          # Vercel API Routes (serverless)
│   ├── _middleware/
│   │   └── security.js          # Rate limiting, validation
│   ├── auth/                     # 🔐 Authentification (public, pas de token)
│   │   ├── login.js             # POST /api/auth/login
│   │   ├── signup.js            # POST /api/auth/signup
│   │   ├── resend.js            # POST /api/auth/resend
│   │   ├── forgot-password.js   # POST /api/auth/forgot-password
│   │   └── reset-password.js    # POST /api/auth/reset-password
│   ├── user/                     # 👤 Actions utilisateur (Bearer token requis)
│   │   ├── profile.js           # GET/PUT /api/user/profile
│   │   ├── change-password.js   # POST /api/user/change-password
│   │   └── delete.js            # DELETE /api/user/delete
│   ├── particles/
│   │   └── config.js            # GET/POST /api/particles/config
│   └── news.js                   # GET /api/news
│
├── public/
│   ├── css/
│   │   └── main.css
│   └── js/                       # Client-side JavaScript modules
│       ├── app.js                # ⭐ CORE - Auth & API calls
│       ├── index-page.js         # Logic pour index.html
│       ├── dashboard-utils.js    # Helpers pour dashboard
│       ├── search-bar-universal.js
│       ├── user-intelligence-system.js
│       ├── theme-manager.js
│       ├── weather.js
│       ├── navbar-component.js
│       ├── notifications.js
│       ├── loader.js
│       ├── animations.js
│       ├── translation-service.js
│       ├── particles-config.js
│       ├── phone-formatter.js
│       ├── countries.js
│       └── icons-theme.js
│
├── index.html                    # 🏠 Page login/signup (publique)
├── dashboard.html                # 🔒 Dashboard (protégée)
├── settings.html                 # 🔒 Paramètres (protégée)
├── reset-password.html           # 🔓 Reset password (publique)
├── 404.html                      # Page d'erreur
│
├── database-migrations/          # SQL migrations pour Supabase
│   └── 001_initialize_user_tables.sql
│
├── .gitignore
├── vercel.json                   # Configuration Vercel
├── package.json
└── README.md
```

---

## 🔐 Système d'Authentification

### Séparation `auth/` vs `user/`

#### **`api/auth/*` - Routes publiques**
Routes accessibles **SANS token**. Utilisées pour l'authentification initiale.

| Route | Méthode | Description | Body | Retour |
|-------|---------|-------------|------|--------|
| `/api/auth/login` | POST | Connexion | `{email, password}` | `{user, session: {access_token}}` |
| `/api/auth/signup` | POST | Inscription | `{email, password, metadata}` | `{user, session}` |
| `/api/auth/resend` | POST | Renvoyer email | `{email}` | `{message}` |
| `/api/auth/forgot-password` | POST | Demande reset | `{email}` | `{message}` |
| `/api/auth/reset-password` | POST | Reset password | `{token, password}` | `{message}` |

**Sécurité**:
- Variables d'environnement: `process.env.SUPABASE_URL`, `process.env.SUPABASE_ANON_KEY`
- Rate limiting par IP (via `_middleware/security.js`)
- Validation email/password côté serveur

---

#### **`api/user/*` - Routes protégées**
Routes nécessitant un **Bearer token** dans le header `Authorization`.

| Route | Méthode | Description | Headers | Body |
|-------|---------|-------------|---------|------|
| `/api/user/profile` | GET | Get profil | `Authorization: Bearer <token>` | - |
| `/api/user/profile` | PUT | Update profil | `Authorization: Bearer <token>` | `{username, full_name, ...}` |
| `/api/user/change-password` | POST | Changer password | `Authorization: Bearer <token>` | `{old_password, new_password}` |
| `/api/user/delete` | DELETE | Supprimer compte | `Authorization: Bearer <token>` | - |

**Validation du token**:
```javascript
// Exemple dans api/user/profile.js
const token = req.headers.authorization?.replace('Bearer ', '');
const { data: { user }, error } = await supabase.auth.getUser(token);
if (error) return res.status(401).json({ error: 'Unauthorized' });
```

---

### Client-side: `public/js/app.js`

Ce fichier est le **CŒUR** de l'authentification côté client.

#### **Session Management**
```javascript
// Variables globales
let currentUser = null;
let authToken = null;

// Fonctions de session
const loadSession = () => { /* Lit localStorage */ }
const saveSession = (user, token) => { /* Stocke dans localStorage */ }
const clearSession = () => { /* Efface localStorage */ }
```

#### **Fonctions AUTH (appellent `api/auth/*`)**
```javascript
// Connexion
export const login = async (email, password) => {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    saveSession(data.user, data.session.access_token);
    return { success: true, user: data.user };
}

// Inscription
export const signup = async (email, password, metadata) => {
    // Appelle /api/auth/signup
    // Sauvegarde session si auto-login
}

// Vérification d'auth
export const checkAuth = () => {
    const isAuthenticated = loadSession();
    const protectedPages = ['dashboard.html', 'settings.html'];
    const currentPage = window.location.pathname.split('/').pop();

    if (protectedPages.includes(currentPage) && !isAuthenticated) {
        window.location.href = 'index.html';
        return false;
    }
    return isAuthenticated;
}

// Déconnexion
export const logout = () => {
    clearSession();
    window.location.href = 'index.html';
}
```

#### **Fonctions USER (appellent `api/user/*` avec Bearer token)**
```javascript
// Get profil
export const getUserProfile = async () => {
    const response = await fetch('/api/user/profile', {
        headers: { 'Authorization': `Bearer ${authToken}` }
    });
    return await response.json();
}

// Update profil
export const updateUserProfile = async (profileData) => {
    const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
    });
    return await response.json();
}

// Change password
export const changePassword = async (oldPassword, newPassword) => {
    const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
    });
    return await response.json();
}

// Delete account
export const deleteAccount = async () => {
    const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
    });
    return await response.json();
}
```

---

## 📄 Pages HTML et leurs responsabilités

### **`index.html` - Page publique (Login/Signup)**

**Responsabilités**:
- Afficher formulaires de login et signup
- Appeler `login()` ou `signup()` depuis `app.js`
- Rediriger vers `dashboard.html` après connexion réussie

**Module chargé**: `public/js/index-page.js`

**Imports clés**:
```javascript
import { checkAuth, login, signup } from './app.js';

// Vérifier si déjà connecté (redirect vers dashboard)
if (checkAuth()) {
    window.location.href = 'dashboard.html';
}

// Gérer le login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
        window.location.href = 'dashboard.html';
    } else {
        alert(result.error);
    }
});
```

---

### **`dashboard.html` - Page protégée**

**Responsabilités**:
- Vérifier l'authentification au chargement (`checkAuth()`)
- Afficher le profil utilisateur (`getUserProfile()`)
- Charger les news (`fetchNews()`)
- Bouton logout

**Script module**:
```html
<script type="module">
    import { checkAuth, logout, getUserProfile, fetchNews } from './public/js/app.js';
    import { displayNews } from './public/js/dashboard-utils.js';

    // Vérifier auth
    const isAuth = checkAuth();
    if (!isAuth) {
        window.location.href = 'index.html';
    }

    // Charger profil
    const loadProfile = async () => {
        const result = await getUserProfile();
        if (result.success) {
            // Afficher les infos user
        }
    };

    // Bouton logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        logout();
    });
</script>
```

---

### **`settings.html` - Page protégée**

**Responsabilités**:
- Vérifier l'authentification (`checkAuth()`)
- Charger profil utilisateur (`getUserProfile()`)
- Permettre modification profil (`updateUserProfile()`)
- Changer mot de passe (`changePassword()`)
- Supprimer compte (`deleteAccount()`)
- Bouton logout

**Script module**:
```html
<script type="module">
    import { checkAuth, getUserProfile, updateUserProfile, changePassword, deleteAccount, logout } from './public/js/app.js';

    // Vérifier auth
    const isAuth = checkAuth();
    if (!isAuth) {
        window.location.href = 'index.html';
    }

    // Load et update profil...
</script>
```

---

### **`reset-password.html` - Page publique**

**Responsabilités**:
- Récupérer le token depuis l'URL (`?token=xxx`)
- Formulaire nouveau mot de passe
- Appeler `/api/auth/reset-password`

**Module chargé**: `public/js/reset-password.js`

---

## 🔄 Flux d'authentification complet

### **1. Inscription (Signup)**

```
User → index.html (formulaire signup)
  ↓
  Remplit email + password + metadata (username, full_name, etc.)
  ↓
  Click "S'inscrire"
  ↓
public/js/app.js → signup(email, password, metadata)
  ↓
  fetch POST /api/auth/signup
  ↓
api/auth/signup.js
  ↓
  Valide email/password (security.js)
  ↓
  supabase.auth.signUp({ email, password, options: { data: metadata } })
  ↓
  Supabase crée utilisateur + envoie email de confirmation
  ↓
  Trigger SQL: handle_new_user() → crée profil + user_settings
  ↓
  Retourne { user, session }
  ↓
app.js → saveSession(user, token)
  ↓
  localStorage.setItem('session', JSON.stringify({ user, access_token }))
  ↓
  Redirect → dashboard.html (si auto-login) ou message "Confirmez votre email"
```

---

### **2. Connexion (Login)**

```
User → index.html (formulaire login)
  ↓
  Remplit email + password
  ↓
  Click "Se connecter"
  ↓
public/js/app.js → login(email, password)
  ↓
  fetch POST /api/auth/login
  ↓
api/auth/login.js
  ↓
  Valide email/password (security.js)
  ↓
  supabase.auth.signInWithPassword({ email, password })
  ↓
  Supabase vérifie credentials
  ↓
  Retourne { user, session: { access_token } }
  ↓
app.js → saveSession(user, access_token)
  ↓
  localStorage.setItem('session', ...)
  ↓
  Redirect → dashboard.html
```

---

### **3. Accès à une page protégée**

```
User → dashboard.html (ou settings.html)
  ↓
<script type="module">
  ↓
  import { checkAuth } from './app.js'
  ↓
  checkAuth()
  ↓
app.js → loadSession()
  ↓
  localStorage.getItem('session')
  ↓
  Si session existe → return true
  ↓
  Si pas de session → window.location.href = 'index.html'
  ↓
  getUserProfile() pour charger les données user
  ↓
  fetch GET /api/user/profile avec Authorization: Bearer <token>
  ↓
api/user/profile.js
  ↓
  supabase.auth.getUser(token) pour valider
  ↓
  Si token invalide → 401 Unauthorized
  ↓
  Si token valide → retourne profil utilisateur
  ↓
  Affiche les données sur la page
```

---

### **4. Déconnexion (Logout)**

```
User → Click bouton "Déconnexion"
  ↓
  Listener: logout()
  ↓
app.js → logout()
  ↓
  clearSession()
  ↓
  localStorage.removeItem('session')
  ↓
  currentUser = null
  authToken = null
  ↓
  window.location.href = 'index.html'
  ↓
User redirigé vers page de login
```

---

## 🔒 Sécurité

### Variables d'environnement Vercel

Configurées dans le dashboard Vercel:
```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEWS_API_KEY=xxxxxxxxx
```

**IMPORTANT**: Ces clés ne sont **JAMAIS** exposées côté client.

### Rate Limiting

Défini dans `api/_middleware/security.js`:
```javascript
const rateLimit = (clientIP, maxRequests, timeWindow) => {
    // Login: 5 tentatives/minute
    // Signup: 3 tentatives/minute
    // Reset password: 3 tentatives/15min
}
```

### Validation

```javascript
const validateEmail = (email) => {
    // Regex RFC 5322
}

const validatePassword = (password) => {
    // Min 8 caractères
    // Au moins 1 majuscule
    // Au moins 1 chiffre
}
```

---

## ➕ Ajouter une nouvelle page protégée

### Étape 1: Créer le fichier HTML

```html
<!-- new-page.html -->
<!DOCTYPE html>
<html lang="fr">
<head>
    <title>Nouvelle Page - Newsly AI</title>
    <link rel="stylesheet" href="public/css/main.css">
</head>
<body>
    <h1>Ma nouvelle page protégée</h1>

    <script type="module">
        import { checkAuth, logout, getUserProfile } from './public/js/app.js';

        // Vérifier auth
        const isAuth = checkAuth();
        if (!isAuth) {
            window.location.href = 'index.html';
        }

        // Charger profil si besoin
        const loadProfile = async () => {
            const result = await getUserProfile();
            console.log('User profile:', result.profile);
        };

        loadProfile();

        // Bouton logout
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            logout();
        });
    </script>
</body>
</html>
```

### Étape 2: Ajouter la page dans `checkAuth()`

```javascript
// public/js/app.js
export const checkAuth = () => {
    const isAuthenticated = loadSession();

    // Ajouter la nouvelle page ici
    const protectedPages = ['dashboard.html', 'settings.html', 'new-page.html'];
    const currentPage = window.location.pathname.split('/').pop();

    if (protectedPages.includes(currentPage) && !isAuthenticated) {
        window.location.href = 'index.html';
        return false;
    }

    return isAuthenticated;
};
```

---

## ➕ Ajouter une nouvelle API route

### Exemple: API route protégée

```javascript
// api/user/my-new-endpoint.js
import { createClient } from '@supabase/supabase-js';
import { securityHeaders } from '../_middleware/security.js';

export default async function handler(req, res) {
    // CORS
    const origin = req.headers.origin;
    securityHeaders(res, origin);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Vérifier le token Bearer
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        // Initialiser Supabase
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );

        // Valider le token
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Traiter la requête
        const { someData } = req.body;

        // Faire quelque chose avec les données...

        return res.status(200).json({ success: true, result: 'done' });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
}
```

### Appeler depuis le client

```javascript
// public/js/app.js (ajouter)
export const myNewFunction = async (someData) => {
    if (!authToken) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/user/my-new-endpoint`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ someData })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error');
        }

        return { success: true, result: data.result };

    } catch (error) {
        console.error('Error:', error);
        return { success: false, error: error.message };
    }
};
```

---

## 🐛 Debugging

### Problème: "Infinite redirect loop"

**Cause**: Vérification d'auth sur `index.html` (page publique)

**Solution**:
- `index.html` ne doit PAS appeler `checkAuth()` au chargement
- Seulement `dashboard.html` et `settings.html` appellent `checkAuth()`

---

### Problème: "401 Unauthorized" sur API user

**Cause**: Token manquant ou invalide

**Debug**:
```javascript
// Dans F12 Console
localStorage.getItem('session'); // Vérifier que la session existe
JSON.parse(localStorage.getItem('session')).access_token; // Vérifier le token
```

**Solution**:
- Vérifier que `login()` a bien sauvegardé la session
- Vérifier que le header `Authorization: Bearer <token>` est envoyé
- Re-login si le token a expiré

---

### Problème: "Module not found"

**Cause**: Import d'un fichier inexistant (ex: `config.js`, `logout.js`)

**Solution**:
- Vérifier que tous les imports pointent vers des fichiers existants
- `logout` doit venir de `./app.js`, pas de `./logout.js`
- Aucun fichier `config.js` ne doit exister dans `public/js/`

---

## 📚 Ressources

- [Supabase Auth Docs](https://supabase.com/docs/reference/javascript/auth-api)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [ES6 Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
