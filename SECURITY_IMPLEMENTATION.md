# 🔒 Implémentation des corrections de sécurité

## ✅ Corrections implémentées (2025-10-06)

### 1. CORS Restreint ✅
**Fichier :** `api/admin/users.js:4-18`

**Avant :**
```javascript
res.setHeader('Access-Control-Allow-Origin', '*'); // ❌ Tous les domaines acceptés
```

**Après :**
```javascript
const allowedOrigins = [
    'https://prod-julien.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
];
const origin = req.headers.origin;

if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', true);
}
```

**Impact :** Empêche les attaques CSRF depuis des domaines malveillants.

---

### 2. Rate Limiting ✅
**Fichiers :**
- `lib/rate-limit.js` (nouveau)
- `api/admin/users.js:2, 30-48`

**Implémentation :**
- 20 requêtes maximum par minute par IP
- Headers `X-RateLimit-*` pour monitoring
- Code 429 (Too Many Requests) si limite dépassée
- Nettoyage automatique de la mémoire toutes les 5 minutes

```javascript
const limiter = rateLimit({
    interval: 60 * 1000, // 1 minute
    maxRequests: 20
});

// Dans le handler
const identifier = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
const rateLimitResult = limiter.check(identifier);

if (!rateLimitResult.success) {
    return res.status(429).json({
        error: 'Trop de requêtes. Veuillez réessayer plus tard.',
        retryAfter: rateLimitResult.reset
    });
}
```

**Impact :** Protège contre brute force, DDoS et énumération d'utilisateurs.

---

### 3. Audit Logging ✅
**Fichiers :**
- `supabase/migrations/create_admin_audit_log.sql` (nouveau)
- `api/admin/users.js:91-98, 155-167`

**Table créée :**
```sql
CREATE TABLE admin_audit_log (
    id UUID PRIMARY KEY,
    admin_id UUID NOT NULL,
    admin_email TEXT NOT NULL,
    action TEXT NOT NULL, -- 'DELETE_USER', 'VIEW_USERS'
    target_user_id UUID,
    target_user_email TEXT,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Actions loggées :**
1. **VIEW_USERS** : Chaque consultation de la liste des utilisateurs
2. **DELETE_USER** : Chaque suppression (avec IP, user-agent, détails cible)

**Exemple de log :**
```json
{
  "admin_id": "abc-123",
  "admin_email": "ju.richard.33@gmail.com",
  "action": "DELETE_USER",
  "target_user_id": "xyz-789",
  "target_user_email": "user@example.com",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "metadata": {
    "target_username": "john_doe",
    "reason": "Admin deletion"
  },
  "created_at": "2025-10-06T05:30:00Z"
}
```

**Impact :** Traçabilité complète, détection d'abus, forensics.

---

### 4. userId en POST Body ✅
**Fichiers :**
- `api/admin/users.js:135`
- `settings.html:1366-1373`

**Avant :**
```javascript
// Backend
const { userId } = req.query; // ❌ Dans l'URL

// Frontend
fetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE' })
```

**Après :**
```javascript
// Backend
const { userId } = req.body; // ✅ Dans le body

// Frontend
fetch('/api/admin/users', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
})
```

**Impact :** userId non visible dans les logs serveur, moins facilement manipulable.

---

### 5. Suppression en cascade ✅
**Fichier :** `api/admin/users.js:169-212`

**Ordre de suppression :**
1. `particles_config` (configuration particules de l'utilisateur)
2. `profiles` (profil utilisateur)
3. `auth.users` (compte auth + sessions)

```javascript
// 1. Supprimer la configuration particles
await supabaseAdmin.from('particles_config').delete().eq('user_id', userId);

// 2. Supprimer le profil
await supabaseAdmin.from('profiles').delete().eq('id', userId);

// 3. Supprimer l'utilisateur auth (supprime aussi les sessions)
await supabaseAdmin.auth.admin.deleteUser(userId);
```

**Tracking des erreurs :**
- Si une suppression échoue, elle est loggée mais n'arrête pas le processus
- Le frontend reçoit un warning si des données n'ont pas pu être supprimées

**Impact :** Pas de données orphelines, suppression complète du compte.

---

### 6. Token corrigé (Frontend) ✅
**Fichier :** `settings.html:1260-1265, 1359-1364`

**Avant :**
```javascript
const token = localStorage.getItem('authToken'); // ❌ N'existait pas
```

**Après :**
```javascript
const session = localStorage.getItem('session');
const { access_token } = JSON.parse(session);
```

**Impact :** Fix du bug "Token invalide" lors de l'accès à l'admin panel.

---

## 📊 Résumé de la sécurité

| Vulnérabilité | Sévérité | Status | Protection |
|--------------|----------|--------|------------|
| CORS `*` | 🔴 Critique | ✅ Fixé | Liste blanche domaines |
| Pas de rate limit | 🔴 Critique | ✅ Fixé | 20 req/min par IP |
| Pas de logging | 🟠 Haute | ✅ Fixé | Table `admin_audit_log` |
| userId en query | 🟡 Moyenne | ✅ Fixé | POST body JSON |
| Suppression partielle | 🟡 Moyenne | ✅ Fixé | Cascade sur 3 tables |
| XSS → Token | 🟡 Moyenne | ⚠️ Mitigé | Aucun innerHTML user data |
| Pas de 2FA | 🟡 Moyenne | 🔵 Future | Confirmation email |

---

## 🧪 Comment tester

### Test 1: CORS Protection
```bash
# Depuis un domaine non autorisé
curl -X GET 'https://prod-julien.vercel.app/api/admin/users' \
  -H 'Origin: https://malicious-site.com' \
  -H 'Authorization: Bearer VALID_TOKEN'

# ✅ Attendu: Pas de header Access-Control-Allow-Origin dans la réponse
```

### Test 2: Rate Limiting
```bash
# Envoyer 25 requêtes rapidement
for i in {1..25}; do
  curl https://prod-julien.vercel.app/api/admin/users \
    -H 'Authorization: Bearer TOKEN' &
done

# ✅ Attendu: Après 20 requêtes, recevoir 429 Too Many Requests
```

### Test 3: Audit Logs
```sql
-- Dans Supabase SQL Editor
SELECT * FROM admin_audit_log
WHERE admin_email = 'ju.richard.33@gmail.com'
ORDER BY created_at DESC
LIMIT 10;

-- ✅ Attendu: Voir toutes les actions VIEW_USERS et DELETE_USER
```

### Test 4: Cascade Deletion
1. Créer un utilisateur de test
2. Lui ajouter des données (profil, particles config)
3. Le supprimer depuis l'admin panel
4. Vérifier dans Supabase:
```sql
SELECT * FROM profiles WHERE id = 'USER_ID'; -- ✅ Aucun résultat
SELECT * FROM particles_config WHERE user_id = 'USER_ID'; -- ✅ Aucun résultat
SELECT * FROM auth.users WHERE id = 'USER_ID'; -- ✅ Aucun résultat
```

---

## 🚀 Déploiement

### Étape 1: Créer la table audit log
```bash
# Dans Supabase Dashboard > SQL Editor
# Copier-coller le contenu de: supabase/migrations/create_admin_audit_log.sql
# Exécuter le script
```

### Étape 2: Déployer sur Vercel
```bash
git add .
git commit -m "🔒 Security hardening: CORS, rate limiting, audit logs, cascade deletion"
git push origin main

# Vercel déploiera automatiquement
```

### Étape 3: Vérifier
1. Tester l'accès admin: `https://prod-julien.vercel.app/settings.html`
2. Consulter les logs: Vercel Dashboard > Logs
3. Vérifier rate limiting: Headers `X-RateLimit-*` dans DevTools Network

---

## 📋 Prochaines améliorations (Phase 3)

### 1. 2FA pour suppressions critiques
- Email de confirmation avec token unique
- Expiration 15 minutes
- Table `pending_deletions`

### 2. CSP Headers
```javascript
res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' cdn.jsdelivr.net");
```

### 3. Monitoring & Alertes
- Sentry pour tracking d'erreurs
- Alerte si >10 suppressions en 1h
- Dashboard des actions admin

### 4. Rate Limiting avec Redis
- Remplacer in-memory par Upstash Redis
- Limite globale sur plusieurs instances Vercel

---

## 🔐 Checklist finale

- [x] CORS restreint aux domaines autorisés
- [x] Rate limiting 20 req/min par IP
- [x] Audit logging (VIEW_USERS, DELETE_USER)
- [x] userId en POST body
- [x] Suppression cascade (particles, profiles, auth)
- [x] Token fix (localStorage.session)
- [x] Logs console pour debugging
- [x] Documentation complète
- [ ] Tests automatisés (E2E)
- [ ] 2FA email
- [ ] CSP headers
- [ ] Monitoring Sentry

**🎉 6/12 corrections implémentées avec succès !**
