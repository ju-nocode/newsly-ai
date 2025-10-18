# Configuration Email Supabase - Mot de passe oublié

## 🔍 Diagnostic des problèmes d'email

Si vous ne recevez pas l'email de réinitialisation, voici les étapes à vérifier :

### 1. **Vérifier la configuration Supabase**

#### A. Authentification Email activée
1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet
3. Allez dans **Authentication** → **Providers**
4. Vérifiez que **Email** est activé
5. Vérifiez que "Confirm email" est activé

#### B. Template d'email configuré
1. Allez dans **Authentication** → **Email Templates**
2. Sélectionnez "Reset Password"
3. Vérifiez le template :

```html
<h2>Reset Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
```

#### C. URL de redirection autorisée
1. Allez dans **Authentication** → **URL Configuration**
2. Ajoutez dans "Redirect URLs" :
   - `http://localhost:3000/reset-password.html`
   - `https://prod-julien.vercel.app/reset-password.html`
   - `https://votre-domaine.com/reset-password.html`

### 2. **Vérifier le rate limiting Supabase**

Supabase limite les emails à :
- **4 emails par heure** par défaut
- Si dépassé, l'email n'est pas envoyé

**Solution** : Attendez 1 heure ou contactez le support Supabase

### 3. **Vérifier les logs**

#### Dans le terminal/console Vercel :
Recherchez les logs `[DEBUG]` :
```
[DEBUG] Reset password request for email: user@example.com
[DEBUG] Redirect URL: http://localhost:3000/reset-password.html
[DEBUG] Supabase response data: {...}
[DEBUG] Supabase error: {...}
```

#### Dans Supabase Dashboard :
1. Allez dans **Logs** → **API Logs**
2. Filtrez par "auth.resetPasswordForEmail"
3. Vérifiez les erreurs

### 4. **Vérifier le compte utilisateur**

L'email ne sera envoyé QUE si :
- ✅ Le compte existe
- ✅ L'email est confirmé (email_confirmed_at n'est pas null)
- ✅ Le compte n'est pas banni

#### Vérification SQL :
```sql
SELECT
  email,
  email_confirmed_at,
  banned_until,
  created_at
FROM auth.users
WHERE email = 'votre@email.com';
```

### 5. **Vérifier les emails Spam**

- Vérifiez le dossier Spam/Courrier indésirable
- Vérifiez les onglets Promotions/Social (Gmail)
- Cherchez "noreply@mail.app.supabase.io"

### 6. **Configuration SMTP personnalisée (optionnel)**

Si vous utilisez votre propre SMTP :
1. Allez dans **Project Settings** → **Auth**
2. Configurez "SMTP Settings"
3. Vérifiez les credentials

### 7. **Variables d'environnement**

Vérifiez dans `.env` ou Vercel :
```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
RESET_PASSWORD_URL=https://prod-julien.vercel.app/reset-password.html
```

## 🧪 Test manuel

### Test dans Supabase Dashboard :
1. Allez dans **Authentication** → **Users**
2. Sélectionnez un utilisateur
3. Cliquez sur les 3 points → "Send password reset"
4. Vérifiez si l'email arrive

### Test avec curl :
```bash
curl -X POST https://votre-api.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "votre@email.com"}'
```

## 🔧 Solutions rapides

### Solution 1 : Utiliser un email de test
Créez un compte avec un email que vous contrôlez (Gmail, etc.)

### Solution 2 : Vérifier Supabase Auth Logs
```sql
-- Dans Supabase SQL Editor
SELECT * FROM auth.audit_log_entries
WHERE payload->>'email' = 'votre@email.com'
ORDER BY created_at DESC
LIMIT 10;
```

### Solution 3 : Réessayer avec délai
Supabase limite à 1 email toutes les 60 secondes par utilisateur

### Solution 4 : Désactiver la confirmation email temporairement
⚠️ Seulement pour debug :
1. Authentication → Providers → Email
2. Décochez "Confirm email"
3. Testez
4. ✅ Réactivez après

## 📧 Email de Supabase par défaut

Par défaut, Supabase envoie depuis :
- **Expéditeur** : noreply@mail.app.supabase.io
- **Reply-to** : Votre email de projet

## ❓ Questions fréquentes

**Q : Le message "Si ce compte existe..." apparaît mais pas d'email ?**
R : C'est normal si le compte n'existe pas ou n'est pas confirmé

**Q : J'ai créé un compte mais l'email de confirmation n'arrive pas ?**
R : Vérifiez les spams et le rate limiting (4 emails/heure)

**Q : Puis-je tester sans email ?**
R : Oui, utilisez le SQL pour forcer `email_confirmed_at` :
```sql
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'votre@email.com';
```

## 🐛 Debug avancé

### Activer les logs détaillés :
Déjà fait dans `forgot-password.js` avec `[DEBUG]`

### Tester directement avec Supabase JS :
```javascript
const { data, error } = await supabase.auth.resetPasswordForEmail(
  'votre@email.com',
  { redirectTo: 'http://localhost:3000/reset-password.html' }
);
console.log('Data:', data);
console.log('Error:', error);
```

## ✅ Checklist finale

- [ ] Email provider activé dans Supabase
- [ ] Template d'email configuré
- [ ] URL de redirection autorisée
- [ ] Compte utilisateur existe et confirmé
- [ ] Pas de rate limiting actif
- [ ] Variables d'environnement correctes
- [ ] Logs Supabase vérifiés
- [ ] Dossier spam vérifié

---

**Besoin d'aide ?** Consultez les logs avec `[DEBUG]` dans la console Vercel/serveur.
