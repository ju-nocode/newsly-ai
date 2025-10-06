# 🔒 Recommandations de sécurité - API Admin

## ⚠️ Vulnérabilités identifiées

### 1. CORS trop permissif (CRITIQUE)
**Fichier :** `api/admin/users.js:6`

**Problème :**
```javascript
res.setHeader('Access-Control-Allow-Origin', '*'); // ❌ Accepte tous les domaines
```

**Solution :**
```javascript
const allowedOrigins = [
    'https://prod-julien.vercel.app',
    'http://localhost:3000'
];
const origin = req.headers.origin;
if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
}
```

---

### 2. Pas de rate limiting (CRITIQUE)
**Problème :** Brute force, énumération, DDoS possibles

**Solution :** Ajouter rate limiting avec Vercel Edge Config ou Upstash Redis
```javascript
import rateLimit from '@/lib/rate-limit';

const limiter = rateLimit({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 500,
});

// Dans le handler
const identifier = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
await limiter.check(res, 10, identifier); // 10 requêtes/min
```

---

### 3. Logging des actions admin manquant (HAUTE)
**Problème :** Aucune traçabilité des suppressions

**Solution :** Créer table `admin_audit_log`
```sql
CREATE TABLE admin_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL, -- 'DELETE_USER', 'UPDATE_ROLE', etc.
    target_user_id UUID,
    target_user_email TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

```javascript
// Avant la suppression
await supabaseAdmin.from('admin_audit_log').insert({
    admin_id: user.id,
    action: 'DELETE_USER',
    target_user_id: userId,
    target_user_email: userEmail,
    ip_address: req.headers['x-forwarded-for'],
    user_agent: req.headers['user-agent']
});
```

---

### 4. userId en query parameter (MOYENNE)
**Problème :** Visible dans logs, facile à manipuler

**Solution :** Passer en POST body
```javascript
// DELETE avec body
if (req.method === 'DELETE') {
    const { userId } = req.body; // Au lieu de req.query
    // ...
}
```

---

### 5. XSS via localStorage (MOYENNE)
**Problème :** Token accessible en JavaScript → vol si XSS

**Solution :**
- Impossible de passer en httpOnly cookie avec Supabase client-side
- **Mitigation :** CSP strict, pas d'innerHTML avec données utilisateur

---

### 6. Pas de 2FA pour actions critiques (MOYENNE)
**Problème :** Si session admin compromise, dégâts massifs

**Solution :** Email de confirmation avant suppression
```javascript
// Générer token unique
const confirmToken = crypto.randomUUID();
await supabaseAdmin.from('pending_deletions').insert({
    token: confirmToken,
    user_to_delete: userId,
    expires_at: new Date(Date.now() + 15 * 60 * 1000) // 15 min
});

// Envoyer email avec lien de confirmation
await sendEmail({
    to: adminEmail,
    subject: '⚠️ Confirmer suppression utilisateur',
    body: `Cliquez ici pour confirmer: ${BASE_URL}/api/admin/confirm-delete?token=${confirmToken}`
});
```

---

### 7. Suppression en cascade incomplète (MOYENNE)
**Problème :** Données orphelines possibles

**Solution :** Vérifier toutes les tables liées
```javascript
// Supprimer dans cet ordre
await supabaseAdmin.from('user_preferences').delete().eq('user_id', userId);
await supabaseAdmin.from('saved_articles').delete().eq('user_id', userId);
await supabaseAdmin.from('reading_history').delete().eq('user_id', userId);
await supabaseAdmin.from('profiles').delete().eq('id', userId);
await supabaseAdmin.auth.admin.deleteUser(userId);
```

---

## 🎯 Priorités d'implémentation

### Phase 1 - Immédiat (1-2h)
1. ✅ Fixer CORS
2. ✅ Ajouter logging audit

### Phase 2 - Cette semaine (4-6h)
3. ✅ Rate limiting
4. ✅ userId en body POST
5. ✅ Suppression en cascade complète

### Phase 3 - Amélioration continue
6. ⚠️ 2FA email pour actions critiques
7. ⚠️ CSP headers strict
8. ⚠️ Monitoring alertes (Sentry, Datadog)

---

## 🧪 Tests de sécurité à effectuer

### Test 1 : CSRF
```bash
# Depuis un autre domaine, tenter d'appeler l'API
curl -X DELETE 'https://prod-julien.vercel.app/api/admin/users?userId=xxx' \
  -H 'Authorization: Bearer VALID_TOKEN' \
  -H 'Origin: https://malicious-site.com'
# ✅ Devrait être bloqué après fix CORS
```

### Test 2 : Rate limiting
```bash
# Envoyer 100 requêtes en 10 secondes
for i in {1..100}; do
  curl https://prod-julien.vercel.app/api/admin/users &
done
# ✅ Devrait bloquer après 10 requêtes
```

### Test 3 : Privilege escalation
```bash
# Avec token utilisateur normal, tenter d'accéder à l'API admin
curl https://prod-julien.vercel.app/api/admin/users \
  -H 'Authorization: Bearer NORMAL_USER_TOKEN'
# ✅ Devrait retourner 403 (fonctionne déjà)
```

---

## 📋 Checklist de sécurité

- [x] Validation token JWT côté serveur
- [x] Vérification `is_admin` en base de données
- [x] Protection auto-suppression
- [ ] CORS restreint aux domaines autorisés
- [ ] Rate limiting par IP
- [ ] Logging des actions admin
- [ ] Suppression en cascade complète
- [ ] 2FA pour actions critiques
- [ ] CSP headers
- [ ] Monitoring et alertes
