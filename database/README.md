# Database Migrations - Newsly AI

## 📋 Structure

```
database/
├── migrations/
│   └── 001_create_user_search_preferences.sql
└── README.md
```

## 🚀 Comment exécuter les migrations

### Option 1: Via Supabase Dashboard (Recommandé)

1. Ouvrez votre projet Supabase: https://supabase.com/dashboard
2. Allez dans **SQL Editor**
3. Créez une nouvelle query
4. Copiez-collez le contenu de `migrations/001_create_user_search_preferences.sql`
5. Cliquez sur **Run** (ou F5)

### Option 2: Via Supabase CLI

```bash
# Si vous avez le Supabase CLI installé
supabase db push
```

### Option 3: Via script JavaScript (pour automatiser)

```javascript
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const migration = fs.readFileSync('./database/migrations/001_create_user_search_preferences.sql', 'utf8');
const { data, error } = await supabase.rpc('exec_sql', { sql: migration });

if (error) {
  console.error('Migration failed:', error);
} else {
  console.log('Migration successful!');
}
```

## 📊 Tables créées

### `user_search_preferences`

Stocke les préférences de recherche pour chaque utilisateur.

**Colonnes:**
- `id` - UUID, clé primaire
- `user_id` - UUID, référence vers auth.users
- `search_history` - JSONB, historique des 50 dernières recherches
- `favorite_commands` - JSONB, commandes favorites
- `custom_shortcuts` - JSONB, raccourcis personnalisés
- `command_stats` - JSONB, statistiques d'usage
- `preferences` - JSONB, préférences générales
- `created_at` - Timestamp de création
- `updated_at` - Timestamp de dernière mise à jour

**Indexes:**
- `idx_user_search_preferences_user_id` - Sur user_id
- `idx_user_search_preferences_updated_at` - Sur updated_at

**RLS Policies:**
- Users can only access their own preferences
- Automatic update of `updated_at` on UPDATE

## 🔧 Fonctions utilitaires

### `get_user_top_commands(user_id, limit)`

Retourne les commandes les plus utilisées par l'utilisateur.

```sql
SELECT * FROM get_user_top_commands(auth.uid(), 5);
```

## 🧪 Tests

### Vérifier que la table existe

```sql
SELECT * FROM user_search_preferences LIMIT 1;
```

### Vérifier les indexes

```sql
SELECT indexname FROM pg_indexes WHERE tablename = 'user_search_preferences';
```

### Vérifier les RLS policies

```sql
SELECT * FROM pg_policies WHERE tablename = 'user_search_preferences';
```

### Insérer des données de test

```sql
INSERT INTO user_search_preferences (user_id, search_history, favorite_commands, command_stats)
VALUES (
  auth.uid(),
  '[
    {"query": "/feed: technology", "timestamp": 1234567890, "type": "command"},
    {"query": "/dashboard", "timestamp": 1234567891, "type": "command"}
  ]'::jsonb,
  '["/feed: technology", "/dashboard"]'::jsonb,
  '{
    "/feed: technology": 45,
    "/dashboard": 32,
    "/profile: account": 12
  }'::jsonb
);
```

### Récupérer vos préférences

```sql
SELECT * FROM user_search_preferences WHERE user_id = auth.uid();
```

## 📝 Notes

- La table utilise Row Level Security (RLS) pour garantir que chaque utilisateur ne peut accéder qu'à ses propres données
- La colonne `updated_at` est automatiquement mise à jour via un trigger
- Maximum 50 éléments dans l'historique (géré côté JavaScript)
- Les données JSONB permettent une grande flexibilité pour évoluer sans migration

## 🔐 Sécurité

- ✅ RLS activé
- ✅ Policies pour SELECT, INSERT, UPDATE, DELETE
- ✅ Un utilisateur ne peut accéder qu'à ses propres données
- ✅ Foreign key vers auth.users avec ON DELETE CASCADE
