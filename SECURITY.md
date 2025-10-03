# 🔒 Guide de Sécurité - Newsly AI

## Vue d'ensemble

Ce document décrit les mesures de sécurité mises en place dans Newsly AI et les bonnes pratiques à suivre.

## 🛡️ Mesures de sécurité implémentées

### 1. Protection des clés API

**Problème résolu :** Les clés API ne sont plus exposées dans le code source.

**Configuration :**
```bash
# 1. Copiez le fichier exemple
cp config.example.js config.js

# 2. Éditez config.js avec vos vraies clés
# 3. Le fichier config.js est automatiquement ignoré par Git
```

**Fichiers protégés :**
- `config.js` (ignoré par Git)
- `.env` (si utilisé)

### 2. Validation des entrées utilisateur

**Toutes les entrées sont validées :**

- **Email** : Format RFC 5322, longueur max 254 caractères
- **Mot de passe** : 6-128 caractères
- **Nom** : 2-100 caractères
- **Catégories** : Alphanumériques, tirets et underscores uniquement
- **URLs** : Protocoles HTTP/HTTPS uniquement

**Code de validation :**
```javascript
// Exemple dans app.js
const validateInput = (input, type, maxLength) => {
    // Validation selon le type
}
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

### 4. Rate Limiting

**Limitation des requêtes pour éviter les abus :**

- **Recherche** : 30 requêtes/minute
- **Ajout de catégories** : 5 requêtes/minute
- **Autres actions** : 10 requêtes/minute

```javascript
// Utilisation
if (!rateLimiter.isAllowed('search', 30, 60000)) {
    // Bloquer la requête
}
```

### 5. Validation des URLs

**Seules les URLs HTTP/HTTPS sont autorisées :**

```javascript
const isValidUrl = (url) => {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
};
```

Cela empêche :
- `javascript:` URLs
- `data:` URLs
- Autres protocoles malveillants

### 6. Authentification sécurisée (Supabase)

**Bonnes pratiques Supabase :**
- Utilisation de la clé `anon` publique uniquement
- Row Level Security (RLS) activé sur Supabase
- Validation côté serveur via Supabase Auth
- Sessions sécurisées avec tokens JWT

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

- [x] Clés API dans fichier séparé (non versionné)
- [x] Validation de toutes les entrées utilisateur
- [x] Protection XSS (escapeHtml)
- [x] Validation des URLs
- [x] Rate limiting
- [x] .gitignore configuré correctement
- [ ] HTTPS activé (production)
- [ ] CSP headers configurés (production)
- [ ] RLS activé sur Supabase
- [ ] Monitoring des logs (production)

## 📚 Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)

## 🐛 Signaler une vulnérabilité

Si vous découvrez une faille de sécurité, veuillez :

1. **NE PAS** créer une issue publique
2. Contacter l'équipe en privé
3. Fournir le maximum de détails
4. Attendre la correction avant divulgation publique

---

**Dernière mise à jour :** 2025-01-03
