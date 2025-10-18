# Configuration Vercel - Variables d'environnement

## Problème actuel
L'API retourne une erreur 500 car les variables d'environnement ne sont pas configurées dans Vercel.

## Solution : Configurer les variables dans Vercel

### Étape 1 : Accéder aux paramètres Vercel

1. Allez sur https://vercel.com
2. Sélectionnez votre projet (newsly-ai ou prod-julien)
3. Cliquez sur **Settings** (en haut)
4. Dans le menu de gauche, cliquez sur **Environment Variables**

### Étape 2 : Ajouter les 3 variables requises

Vous devez ajouter ces 3 variables d'environnement :

#### Variable 1 : SUPABASE_URL
- **Name**: `SUPABASE_URL`
- **Value**: `https://krsivglhqdpnpbffsupd.supabase.co`
- **Environments**: Cochez `Production`, `Preview`, et `Development`

#### Variable 2 : SUPABASE_ANON_KEY
- **Name**: `SUPABASE_ANON_KEY`
- **Value**: Trouvez cette clé dans Supabase
  - Allez sur https://supabase.com/dashboard
  - Sélectionnez votre projet
  - Settings → API
  - Copiez la valeur de **anon / public**
- **Environments**: Cochez `Production`, `Preview`, et `Development`

#### Variable 3 : SUPABASE_SERVICE_ROLE_KEY
- **Name**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: Trouvez cette clé dans Supabase
  - Allez sur https://supabase.com/dashboard
  - Sélectionnez votre projet
  - Settings → API
  - Copiez la valeur de **service_role** (⚠️ clé secrète)
- **Environments**: Cochez `Production`, `Preview`, et `Development`

#### Variable 4 (optionnelle) : RESET_PASSWORD_URL
- **Name**: `RESET_PASSWORD_URL`
- **Value**: `https://prod-julien.vercel.app/reset-password.html`
- **Environments**: Cochez `Production`, `Preview`, et `Development`

### Étape 3 : REDÉPLOYER (CRUCIAL !)

⚠️ **IMPORTANT** : Les variables d'environnement ne sont appliquées qu'après un nouveau déploiement !

**Option A : Redéploiement automatique**
1. Dans Vercel, allez sur **Deployments**
2. Trouvez le dernier déploiement
3. Cliquez sur les 3 points (•••) à droite
4. Cliquez sur **Redeploy**
5. Attendez que le déploiement soit terminé (✓ Ready)

**Option B : Nouveau commit Git**
```bash
git add .
git commit -m "Configure environment variables"
git push
```

### Étape 4 : Vérifier la configuration

Une fois le redéploiement terminé, testez le mot de passe oublié :

1. Allez sur https://prod-julien.vercel.app
2. Cliquez sur "Mot de passe oublié ?"
3. Entrez votre email
4. Vérifiez que vous recevez l'email
5. Cliquez sur le lien dans l'email
6. Changez votre mot de passe

## Vérification rapide

Pour vérifier que tout fonctionne, ouvrez la console F12 sur la page de reset et vous devriez voir :

```
[DEBUG] Env check: {hasUrl: true, hasKey: true, url: "https://krsivglhqdpnpbffsupd.supabase.co", keyLength: 184}
```

Au lieu de :
```
[DEBUG] Env check: {hasUrl: false, hasKey: false, url: undefined, keyLength: undefined}
```

## Dépannage

### Les variables ne s'appliquent pas
- Assurez-vous d'avoir **redéployé** après avoir ajouté les variables
- Vérifiez que vous avez coché les bonnes environnements (Production, Preview, Development)
- Attendez que le build soit complètement terminé (statut "Ready")

### Toujours une erreur 500
- Ouvrez la console F12 sur la page de reset
- Regardez les logs dans Network → reset-password → Response
- Si vous voyez toujours "hasUrl: false", c'est que le redéploiement n'a pas été fait

### Comment trouver les clés Supabase
1. https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Settings (icône engrenage) → API
4. Vous verrez :
   - **Project URL** → utilisez ça pour SUPABASE_URL
   - **anon public** → utilisez ça pour SUPABASE_ANON_KEY
   - **service_role** → utilisez ça pour SUPABASE_SERVICE_ROLE_KEY (cliquez "Reveal" pour voir)

## Sécurité

✅ **Bonnes pratiques respectées** :
- Les clés Supabase sont UNIQUEMENT dans Vercel (côté serveur)
- Aucune clé n'est exposée dans le code JavaScript client
- Même si un attaquant regarde le code avec F12, il ne verra aucune clé
- Toutes les opérations sensibles passent par l'API backend

⚠️ **Ne jamais** :
- Mettre les clés directement dans le code
- Commiter les fichiers `.env` dans Git
- Partager la `SERVICE_ROLE_KEY` publiquement
