-- ============================================
-- MIGRATION: Rename username → first_name, full_name → last_name
-- Date: 2025-10-26
-- ============================================

-- ÉTAPE 1: Ajouter les nouvelles colonnes
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- ÉTAPE 2: Migrer les données existantes
-- username → first_name
-- full_name → last_name
-- Créer display_name à partir de first_name + last_name
UPDATE profiles
SET
  first_name = COALESCE(username, email),
  last_name = COALESCE(full_name, ''),
  display_name = COALESCE(username, email);

-- ÉTAPE 3: Rendre first_name et last_name NOT NULL après migration
ALTER TABLE profiles
ALTER COLUMN first_name SET NOT NULL,
ALTER COLUMN last_name SET NOT NULL;

-- ÉTAPE 4: Supprimer les anciennes colonnes (APRÈS avoir vérifié que tout fonctionne)
-- ⚠️ DÉCOMMENTER SEULEMENT APRÈS TESTS RÉUSSIS
-- ALTER TABLE profiles DROP COLUMN username;
-- ALTER TABLE profiles DROP COLUMN full_name;

-- ÉTAPE 5: Créer un index sur display_name pour recherches rapides
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON profiles(display_name);

-- ============================================
-- VÉRIFICATION
-- ============================================
-- SELECT id, email, first_name, last_name, display_name FROM profiles LIMIT 10;
