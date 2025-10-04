# Migration de la base de données - Ajout des colonnes profiles

## Problème détecté

La table `profiles` manque de colonnes utilisées par le code :
- ❌ `username` - utilisé dans settings.html
- ❌ `phone` - utilisé dans settings.html
- ❌ `bio` - utilisé dans settings.html
- ❌ `avatar_url` - utilisé pour l'avatar

## Structure actuelle de profiles

```
| column_name | data_type                | is_nullable |
| ----------- | ------------------------ | ----------- |
| id          | uuid                     | NO          |
| email       | text                     | NO          |
| full_name   | text                     | YES         |
| is_admin    | boolean                  | YES         |
| created_at  | timestamp with time zone | YES         |
| updated_at  | timestamp with time zone | YES         |
```

## Solution : Exécuter la migration

### Étape 1 : Ouvrir le SQL Editor de Supabase

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Cliquez sur **SQL Editor** dans le menu latéral
4. Cliquez sur **New query**

### Étape 2 : Copier-coller le SQL

Copiez tout le contenu du fichier `ALTER_PROFILES_TABLE.sql` :

```sql
-- Ajouter les colonnes manquantes à la table profiles

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS username TEXT;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone TEXT;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS bio TEXT;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Index pour recherche rapide par username
CREATE INDEX IF NOT EXISTS idx_profiles_username
ON profiles(username);

-- Vérifier le résultat
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

### Étape 3 : Exécuter

1. Cliquez sur **Run** (ou Ctrl+Enter)
2. Vérifiez que vous voyez les nouvelles colonnes dans le résultat

### Étape 4 : Résultat attendu

Vous devriez voir 10 colonnes au total :

```
| column_name | data_type                | is_nullable |
| ----------- | ------------------------ | ----------- |
| id          | uuid                     | NO          |
| email       | text                     | NO          |
| full_name   | text                     | YES         |
| is_admin    | boolean                  | YES         |
| created_at  | timestamp with time zone | YES         |
| updated_at  | timestamp with time zone | YES         |
| username    | text                     | YES         | ← NOUVEAU
| phone       | text                     | YES         | ← NOUVEAU
| bio         | text                     | YES         | ← NOUVEAU
| avatar_url  | text                     | YES         | ← NOUVEAU
```

## Alternative : Via l'interface Table Editor

Si vous préférez l'interface graphique :

1. Allez dans **Table Editor** → `profiles`
2. Cliquez sur **+** (Add column)
3. Ajoutez manuellement chaque colonne :
   - Name: `username`, Type: `text`, Nullable: ✅
   - Name: `phone`, Type: `text`, Nullable: ✅
   - Name: `bio`, Type: `text`, Nullable: ✅
   - Name: `avatar_url`, Type: `text`, Nullable: ✅

## Après la migration

✅ Les pages settings et signup fonctionneront correctement
✅ L'upload d'avatar fonctionnera
✅ Tous les champs du profil seront sauvegardés

## Sécurité (RLS)

Les politiques RLS existantes sur `profiles` s'appliquent automatiquement aux nouvelles colonnes. Aucune modification de sécurité nécessaire.
