# 🔐 Documentation de Sécurité - Newsly AI

## Vue d'ensemble

Ce document détaille toutes les mesures de sécurité implémentées dans l'application Newsly AI.

## 1. Authentification & Autorisation

### Supabase Auth
- **Backend seulement** : Les clés Supabase sont stockées dans `.env` et utilisées uniquement côté serveur
- **JWT Tokens** : Tokens Bearer pour authentifier les requêtes
- **Session Management** : Sessions stockées en localStorage (côté client)

### Protection des routes
- **Middleware d'authentification** : Vérification du token sur toutes les routes protégées
- **Routes protégées** :
  - `GET/PUT /api/user/profile`
  - `POST /api/user/change-password`
  - `DELETE /api/user/delete`

## 2. Validation des Données

### API Routes
Toutes les entrées sont validées :

#### Auth (login.js, signup.js)
- **Email** : Regex + longueur max 255 caractères
- **Password** : 8-100 caractères
- **Username** : Alphanumerique + tirets, 1-50 caractères

#### Profil (profile.js)
- **Username** : 1-50 caractères
- **Full name** : Max 100 caractères
- **Phone** : Max 20 caractères
- **Bio** : Max 500 caractères
- **Avatar URL** : Validation URL + max 500 caractères

#### News (news.js)
- **Category** : Whitelist stricte (general, business, technology, science, health, sports, entertainment)
- **Country** : Whitelist stricte (us, fr, gb, ca, de)
- **Page** : Integer entre 1 et 10

### Frontend
- **escapeHtml()** : Protection XSS sur tous les contenus affichés
- **validateInput()** : Validation côté client avant envoi
- **sanitizeString()** : Nettoyage des strings

## 3. Protection XSS

### Backend
- Validation stricte des inputs
- Sanitization des données avant stockage
- Headers de sécurité

### Frontend
```javascript
export const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};
```

Utilisé sur :
- Titres et descriptions des articles
- Noms d'utilisateur
- Tous les contenus dynamiques

## 4. Headers de Sécurité

Implémentés dans `/api/_middleware/security.js` :

```javascript
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000
- Content-Security-Policy: Restrictions strictes
```

## 5. Rate Limiting

### Backend
- Rate limiting en mémoire pour les API
- Max 10 requêtes par minute par identifiant

### Frontend
- Rate limiter client-side pour les actions utilisateur
- Protection contre les abus

## 6. CORS

Configuration CORS sécurisée :
- Allow-Credentials: true
- Allow-Origin: * (à restreindre en production)
- Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
- Allow-Headers: Content-Type, Authorization

## 7. Gestion des Erreurs

- **Pas d'exposition de stack traces** en production
- **Messages d'erreur génériques** côté client
- **Logs détaillés** côté serveur uniquement

## 8. Variables d'Environnement

### Obligatoires
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx (admin operations)
NEWS_API_KEY=xxx
```

### Jamais exposées au client
- Service Role Key
- News API Key
- Tokens serveur

## 9. SQL Injection

### Protection
- **Supabase ORM** : Requêtes paramétrées automatiques
- **Pas de SQL brut** : Utilisation exclusive de l'API Supabase
- **user_metadata JSON** : Stockage sécurisé sans SQL personnalisé

## 10. Bonnes Pratiques

### ✅ Implémenté
- [x] Validation de toutes les entrées
- [x] Échappement HTML (XSS)
- [x] Headers de sécurité
- [x] Rate limiting
- [x] HTTPS only
- [x] JWT tokens
- [x] Pas de clés exposées côté client
- [x] Gestion sécurisée des sessions
- [x] Protection CSRF via tokens

### 🔄 À améliorer (production)
- [ ] CORS plus restrictif (domaine spécifique)
- [ ] Rate limiting avec Redis
- [ ] Monitoring et alertes
- [ ] 2FA (Authentification à deux facteurs)
- [ ] Audit logging
- [ ] WAF (Web Application Firewall)

## 11. Checklist de Déploiement

Avant le déploiement en production :

1. **Variables d'environnement**
   - [ ] Toutes les clés sont en `.env`
   - [ ] Pas de secrets dans le code
   - [ ] Service Role Key bien protégée

2. **CORS**
   - [ ] Restreindre Allow-Origin au domaine de production
   - [ ] Vérifier les headers autorisés

3. **Rate Limiting**
   - [ ] Configurer les limites adaptées au trafic
   - [ ] Implémenter Redis pour le rate limiting

4. **Monitoring**
   - [ ] Logs centralisés
   - [ ] Alertes sur erreurs critiques
   - [ ] Métriques de sécurité

5. **Tests**
   - [ ] Test de pénétration
   - [ ] Scan de vulnérabilités
   - [ ] Audit de sécurité

## 12. Contacts Sécurité

Pour rapporter une vulnérabilité :
- Email : security@newsly-ai.com
- Voir : [SECURITY.md](../SECURITY.md)

---

**Dernière mise à jour** : 2025-10-03
**Version** : 1.0
