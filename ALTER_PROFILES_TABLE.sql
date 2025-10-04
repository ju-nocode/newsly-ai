-- Ajouter les colonnes manquantes à la table profiles
-- Exécuter dans le SQL Editor de Supabase

-- 1. Ajouter la colonne username
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS username TEXT;

-- 2. Ajouter la colonne phone
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone TEXT;

-- 3. Ajouter la colonne bio
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS bio TEXT;

-- 4. Ajouter la colonne avatar_url
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 5. Créer un index sur username pour des recherches rapides
CREATE INDEX IF NOT EXISTS idx_profiles_username
ON profiles(username);

-- 6. Vérifier que tout est bien ajouté
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
