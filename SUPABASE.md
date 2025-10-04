# Configuration Supabase - Newsly AI

## Structure des données utilisateur

### Authentification
Newsly AI utilise **Supabase Auth** pour gérer les utilisateurs. Aucune table SQL personnalisée n'est nécessaire.

### user_metadata (JSON)
Tous les champs de profil sont stockés dans `auth.users.user_metadata` :

```json
{
  "username": "johndoe",
  "full_name": "John Doe",
  "display_name": "johndoe",
  "phone": "+33 6 12 34 56 78",
  "bio": "Développeur passionné",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

### Champs disponibles

| Champ | Type | Description | Requis |
|-------|------|-------------|--------|
| `username` | string | Nom d'utilisateur unique | ✅ |
| `full_name` | string | Nom complet | ❌ |
| `display_name` | string | Nom affiché | ❌ |
| `phone` | string | Numéro de téléphone | ❌ |
| `bio` | string | Biographie | ❌ |
| `avatar_url` | string | URL de l'avatar | ❌ |

## Configuration Supabase

### 1. Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
NEWSAPI_KEY=your-newsapi-key
```

### 2. Politique de sécurité (RLS)

Aucune politique RLS n'est nécessaire car nous utilisons uniquement `user_metadata`.

### 3. Email Templates (Optionnel)

Personnalisez les templates d'emails dans :
`Authentication > Email Templates`

## API Endpoints

### Authentification

#### POST /api/auth/signup
Créer un compte
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "johndoe"
}
```

#### POST /api/auth/login
Se connecter
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Profil Utilisateur

#### GET /api/user/profile
Récupérer le profil (nécessite Bearer token)

#### PUT /api/user/profile
Mettre à jour le profil (nécessite Bearer token)
```json
{
  "username": "newusername",
  "full_name": "New Name",
  "phone": "+33 6 12 34 56 78",
  "bio": "Updated bio",
  "avatar_url": "https://example.com/new-avatar.jpg"
}
```

#### DELETE /api/user/delete
Supprimer le compte (nécessite Bearer token)

## Sécurité

### Authentification
- ✅ JWT tokens gérés par Supabase
- ✅ Sessions sécurisées avec httpOnly cookies (recommandé)
- ✅ Validation des tokens côté serveur

### Protection des données
- ✅ Échappement HTML (XSS prevention)
- ✅ Validation des entrées utilisateur
- ✅ CORS configuré
- ✅ Rate limiting côté client

### Pages protégées
- `dashboard.html` - Nécessite authentification
- `settings.html` - Nécessite authentification
- `index.html` - Page publique

## Déploiement

### Vercel
1. Connectez votre repository GitHub
2. Ajoutez les variables d'environnement dans Vercel
3. Déployez

### Variables d'environnement Vercel
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
NEWSAPI_KEY=your-newsapi-key
```

## Maintenance

### Backup
Aucun backup manuel nécessaire - Supabase gère automatiquement les sauvegardes.

### Monitoring
- Tableau de bord Supabase pour les métriques
- Logs API dans Vercel

## Support

Pour toute question :
- Documentation Supabase : https://supabase.com/docs
- Documentation Newsly AI : README.md
