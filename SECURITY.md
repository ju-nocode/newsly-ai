# 🔒 Guide de Sécurité - Newsly AI

## Vue d'ensemble

Ce document décrit les mesures de sécurité mises en place dans Newsly AI et les bonnes pratiques à suivre pour garantir la protection des données utilisateurs et la sécurité de l'application.

## 🛡️ Mesures de sécurité implémentées

### 1. Architecture Serverless Sécurisée (Vercel Functions)

**Protection des clés API :**
- ✅ Toutes les clés API sont stockées dans les variables d'environnement Vercel
- ✅ Aucune clé n'est exposée côté client
- ✅ Les appels API sensibles passent par des serverless functions

**Variables d'environnement (Vercel Dashboard) :**
```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEWS_API_KEY=xxx
```

**Fichiers protégés :**
- `.env.local` (ignoré par Git)
- Aucune clé en dur dans le code source

### 2. Validation stricte des entrées utilisateur

**Toutes les entrées sont validées côté serveur ET client :**

#### API Routes (Vercel Functions)
```javascript
// api/auth/signup.js
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return res.status(400).json({ error: 'Email invalide' });
}

if (password.length < 8 || password.length > 100) {
  return res.status(400).json({ error: 'Mot de passe invalide (8-100 caractères)' });
}
```

#### Validation par type :
- **Email** : Regex RFC 5322 simplifié, max 254 caractères
- **Mot de passe** : 8-100 caractères
- **Username** : Alphanumérique + underscores, 2-50 caractères
- **Catégories NewsAPI** : Whitelist stricte `['general', 'business', 'technology', 'science', 'health', 'sports', 'entertainment']`
- **Pays** : Whitelist stricte `['us', 'fr', 'gb', 'ca', 'de']`
- **URLs** : Protocoles HTTP/HTTPS uniquement
- **Avatar** : Images uniquement (JPEG/PNG/GIF), max 2MB → compression automatique à 200x200px

#### Utilitaires de validation (dashboard-utils.js)
```javascript
export const validateInput = (value, type) => {
  switch (type) {
    case 'category':
      return /^[a-z0-9_-]+$/i.test(value) && value.length <= 50;
    case 'search':
      return value.length >= 2 && value.length <= 100;
    case 'url':
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    default:
      return value.length > 0 && value.length <= 500;
  }
};
```

### 3. Protection XSS (Cross-Site Scripting)

**Toutes les données dynamiques sont échappées :**

```javascript
// Fonction de sanitization
const escapeHtml = (unsafe) => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};
```

**Protections appliquées :**
- Titres d'articles
- Descriptions
- Noms d'utilisateurs
- URLs
- Résultats de recherche

### 4. Rate Limiting côté client

**Protection contre les abus et spam :**

```javascript
// dashboard-utils.js
export const rateLimiter = {
  requests: {},

  isAllowed(key, maxRequests, timeWindow) {
    const now = Date.now();

    if (!this.requests[key]) {
      this.requests[key] = [];
    }

    // Nettoyer les anciennes requêtes
    this.requests[key] = this.requests[key].filter(
      timestamp => now - timestamp < timeWindow
    );

    if (this.requests[key].length >= maxRequests) {
      return false; // Bloquer
    }

    this.requests[key].push(now);
    return true;
  }
};
```

**Limites appliquées :**
- **Recherche** : 30 requêtes/minute
- **Ajout topics** : 5 requêtes/minute
- **API calls** : 60 requêtes/minute

### 5. Authentification sécurisée (Supabase)

**Architecture sécurisée :**
- ✅ Utilisation de la clé `ANON` publique côté client
- ✅ Clé `SERVICE_ROLE` uniquement dans les serverless functions (jamais exposée)
- ✅ **Row Level Security (RLS)** activé sur toutes les tables
- ✅ Sessions JWT signées et vérifiées par Supabase
- ✅ Expiration automatique des tokens (1h par défaut)
- ✅ Refresh tokens gérés automatiquement

**Politiques RLS (profiles table) :**
```sql
-- Lecture : uniquement son propre profil
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Modification : uniquement son propre profil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins : peuvent tout lire
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 6. Gestion sécurisée des sessions

**Protection contre les attaques :**
```javascript
// app.js - Détection tokens volumineux (limite Vercel 16KB)
const loadSession = () => {
  const session = localStorage.getItem('session');
  if (session) {
    const data = JSON.parse(session);
    const tokenSize = data.access_token?.length || 0;

    if (tokenSize > 100000) {
      console.error('Token trop volumineux, nettoyage...');
      clearSession();
      alert('Session corrompue. Veuillez vous reconnecter.');
      window.location.href = 'index.html';
      return false;
    }
  }
};
```

**Vérification expiration :**
- Requêtes 401 → redirection automatique vers login
- Clear session automatique en cas d'erreur
- Validation de la structure du token

### 7. Compression et validation des avatars

**Sécurité des uploads d'images :**

```javascript
// settings.html - Compression automatique
const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Redimensionner à 200x200 max
        const MAX_SIZE = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compression JPEG qualité 0.8
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        resolve(compressedBase64);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};
```

**Validations :**
- Type MIME : `image/*` uniquement
- Taille max upload : 2 MB
- Taille finale : ~50 KB après compression
- Format final : JPEG 200x200px qualité 0.8

## ⚠️ Recommandations de sécurité

### Pour le développement

1. **Ne jamais commiter les secrets**
   ```bash
   # Vérifiez avant de commit
   git status
   # config.js ne doit PAS apparaître
   ```

2. **Utiliser HTTPS en production**
   - Certificat SSL/TLS requis
   - Rediriger HTTP vers HTTPS

3. **Configurer les headers de sécurité**
   ```
   Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.jsdelivr.net
   X-Frame-Options: DENY
   X-Content-Type-Options: nosniff
   Referrer-Policy: strict-origin-when-cross-origin
   ```

4. **Activer Row Level Security sur Supabase**
   ```sql
   -- Exemple de politique RLS
   CREATE POLICY "Users can only access their own data"
   ON profiles FOR ALL
   USING (auth.uid() = id);
   ```

### Pour la production

1. **Variables d'environnement**
   - Utilisez des variables d'environnement serveur
   - Ne jamais exposer les clés côté client en production

2. **Monitoring et logging**
   - Surveillez les tentatives d'accès suspectes
   - Loguez les erreurs de validation

3. **Mises à jour régulières**
   - Supabase SDK
   - Dépendances JavaScript

4. **Backup des données**
   - Sauvegarde automatique de la base Supabase
   - Plan de récupération en cas d'incident

## 🚨 Que faire en cas de fuite de clé API ?

1. **Supabase :**
   - Aller sur https://supabase.com/dashboard
   - Project Settings → API
   - Régénérer les clés immédiatement

2. **NewsAPI :**
   - Aller sur https://newsapi.org/account
   - Régénérer la clé API

3. **Git :**
   ```bash
   # Si vous avez commité des secrets par accident
   # 1. Régénérez TOUTES les clés compromises
   # 2. Nettoyez l'historique Git (complexe, contactez un expert)
   ```

## 📋 Checklist de sécurité

### Backend (Vercel Functions)
- [x] Clés API stockées dans variables d'environnement Vercel
- [x] Validation stricte de tous les paramètres API
- [x] CORS configuré correctement
- [x] Headers de sécurité (Access-Control-Allow-*)
- [x] Error handling sans exposition d'informations sensibles
- [x] Logs sécurisés (pas de secrets loggés)

### Frontend
- [x] Protection XSS (escapeHtml sur toutes les données dynamiques)
- [x] Validation des URLs (HTTP/HTTPS uniquement)
- [x] Rate limiting client-side
- [x] Compression automatique des avatars
- [x] Détection et nettoyage des tokens corrompus
- [x] Gestion propre des sessions expirées

### Supabase
- [x] Row Level Security (RLS) activé sur table `profiles`
- [x] Politiques RLS pour users et admins
- [x] Triggers de création/mise à jour automatiques
- [x] Index sur colonnes fréquemment requêtées
- [x] Clé SERVICE_ROLE jamais exposée côté client

### Production (Vercel)
- [x] HTTPS automatique (certificats SSL Vercel)
- [x] Domaines personnalisés sécurisés
- [x] Variables d'environnement isolées par environnement
- [x] Build automatique à chaque push
- [ ] CSP headers (Content Security Policy) - À configurer dans vercel.json
- [ ] Monitoring et alertes (Vercel Analytics)
- [ ] Rate limiting côté serveur (Vercel Edge Middleware)

## 📚 Ressources

### Documentation officielle
- [OWASP Top 10 2021](https://owasp.org/www-project-top-ten/)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth Best Practices](https://supabase.com/docs/guides/auth/server-side-auth)
- [Vercel Security](https://vercel.com/docs/security/secure-compute)
- [NewsAPI Documentation](https://newsapi.org/docs)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)

### Outils de test
- [OWASP ZAP](https://www.zaproxy.org/) - Scanner de vulnérabilités
- [Burp Suite](https://portswigger.net/burp) - Test de sécurité web
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Audit Chrome DevTools

## 🐛 Signaler une vulnérabilité

Si vous découvrez une faille de sécurité, veuillez suivre le processus de **divulgation responsable** :

### Processus
1. **NE PAS** créer une issue publique sur GitHub
2. Envoyer un email privé à : **ju.richard.33@gmail.com**
3. Inclure dans votre rapport :
   - Description détaillée de la vulnérabilité
   - Étapes pour reproduire
   - Impact potentiel
   - Preuve de concept (si applicable)
4. Attendre la réponse de l'équipe (sous 48h)
5. Attendre la correction avant toute divulgation publique

### Engagement
- ✅ Réponse initiale sous 48h
- ✅ Correction critique sous 7 jours
- ✅ Reconnaissance publique (si souhaité)
- ✅ Transparence sur les correctifs appliqués

## 🔐 Contact sécurité

- **Email** : ju.richard.33@gmail.com
- **PGP Key** : [À venir]
- **Bug Bounty** : Programme non disponible actuellement

---

**Dernière mise à jour :** 2025-01-10
**Version Newsly AI :** 1.0.0
**Maintenu par :** [Julien Richard](https://www.linkedin.com/in/fr-richard-julien/)
