# 🔐 Système d'Authentification - NewslyAI

## Architecture

Le système d'authentification utilise **Supabase Auth** avec une architecture API serverless via **Vercel**.

### Pourquoi cette architecture ?

- ✅ **Sécurisé** : Les clés Supabase sont dans `process.env` côté serveur uniquement
- ✅ **Pas de clés dans le code client** : Impossible de voler les credentials
- ✅ **API Routes Vercel** : Serverless, scalable automatiquement
- ✅ **Rate limiting** : Protection contre les attaques brute-force
- ✅ **Validation** : Email et password validés côté serveur

---

## 📁 Structure des fichiers

```
api/auth/                    # API Routes Vercel (serverless)
  ├── login.js              # POST /api/auth/login
  ├── signup.js             # POST /api/auth/signup
  ├── resend.js             # POST /api/auth/resend
  ├── forgot-password.js    # POST /api/auth/forgot-password
  └── reset-password.js     # POST /api/auth/reset-password

public/js/
  └── app.js                # Client-side auth functions
                            # - login(email, password)
                            # - signup(email, password, metadata)
                            # - checkAuth()
                            # - logout()
```

---

## 🔄 Flux d'authentification

### 1. **Inscription (Signup)**

```javascript
// Client appelle (public/js/app.js)
const result = await signup(email, password, { username, full_name, ... });

// → Envoie requête à /api/auth/signup
// → API valide les données
// → Supabase crée l'utilisateur (process.env.SUPABASE_URL)
// → Retourne { user, session }
// → Client stocke session dans localStorage
```

### 2. **Connexion (Login)**

```javascript
// Client appelle
const result = await login(email, password);

// → Envoie requête à /api/auth/login
// → API authentifie via Supabase
// → Retourne { user, session: { access_token } }
// → Client stocke dans localStorage
// → Redirect vers dashboard.html
```

### 3. **Vérification d'authentification**

```javascript
// À chaque chargement de page protégée
const isAuth = checkAuth();

// → Charge session depuis localStorage
// → Si pas de session → redirect vers index.html
// → Si session existe → continue
```

### 4. **Déconnexion (Logout)**

```javascript
logout();

// → Efface localStorage
// → Redirect vers index.html
```

---

## 🔒 Sécurité

### Variables d'environnement (Vercel)

```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxxx...
```

Ces clés sont **JAMAIS** exposées au client.

### Rate Limiting

Chaque endpoint a un rate limit :
- **Login** : 5 tentatives/minute par IP
- **Signup** : 3 tentatives/minute par IP
- **Reset Password** : 3 tentatives/15min par IP

### Validation

- Email : Format RFC 5322
- Password :
  - Min 8 caractères
  - Au moins 1 majuscule
  - Au moins 1 chiffre

---

## 📝 Utilisation dans le code

### Dans une page protégée (dashboard.html, settings.html)

```javascript
import { checkAuth, logout } from './public/js/app.js';

// Vérifier l'authentification
const isAuth = checkAuth();
if (!isAuth) {
    window.location.href = 'index.html';
}

// Bouton de déconnexion
document.getElementById('logoutBtn').addEventListener('click', () => {
    logout();
});
```

### Dans la page de login (index.html)

```javascript
import { login, signup } from './public/js/app.js';

// Login
const result = await login(email, password);
if (result.success) {
    window.location.href = 'dashboard.html';
} else {
    alert(result.error);
}

// Signup
const result = await signup(email, password, { username, full_name });
```

---

## ⚠️ Important

### ❌ NE JAMAIS FAIRE :

```javascript
// ❌ NE PAS créer de fichiers config.js avec des clés Supabase
export const SUPABASE_CONFIG = {
    url: 'https://xxxxx.supabase.co',  // ❌ EXPOSÉ AU CLIENT
    anonKey: 'eyJxxxx...'               // ❌ EXPOSÉ AU CLIENT
};
```

### ✅ À FAIRE :

```javascript
// ✅ Utiliser les API routes qui ont accès à process.env
const response = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
});
```

---

## 🧪 Testing

### Tester l'authentification complète :

1. Ouvrir `index.html`
2. S'inscrire avec un nouvel email
3. Confirmer l'email via Supabase
4. Se connecter
5. Vérifier redirection vers `dashboard.html`
6. Tester le bouton logout
7. Vérifier qu'on ne peut plus accéder à `dashboard.html` sans session

### Vérifier les logs :

```javascript
// F12 Console
✅ Session chargée: { userId: "...", tokenPresent: true }
✅ getUserProfile: Succès { email: "..." }
```

---

## 🐛 Debugging

### Problème : "Infinite redirect loop"

**Cause** : Vérification d'auth sur index.html (page de login)

**Solution** :
- index.html ne doit PAS vérifier l'auth au chargement
- Seules dashboard.html et settings.html appellent `checkAuth()`

### Problème : "Token invalide après logout"

**Cause** : Session pas effacée correctement

**Solution** :
```javascript
// Vérifier que logout() efface bien localStorage
localStorage.clear();
window.location.href = 'index.html';
```

---

## 📚 Documentation Supabase

- [Auth API](https://supabase.com/docs/reference/javascript/auth-api)
- [signInWithPassword](https://supabase.com/docs/reference/javascript/auth-signinwithpassword)
- [signUp](https://supabase.com/docs/reference/javascript/auth-signup)
- [signOut](https://supabase.com/docs/reference/javascript/auth-signout)
