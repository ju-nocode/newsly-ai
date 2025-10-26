-- ============================================
-- CLEANUP: Supprimer les anciennes colonnes username et full_name
-- Date: 2025-10-26
-- ⚠️ ATTENTION: Cette opération est IRRÉVERSIBLE
-- ============================================

-- VÉRIFICATION AVANT SUPPRESSION
-- Exécuter cette requête pour vérifier que les données sont bien migrées
SELECT
    id,
    email,
    username as old_username,
    full_name as old_full_name,
    first_name as new_first_name,
    last_name as new_last_name,
    display_name as new_display_name
FROM profiles
LIMIT 10;

-- ============================================
-- ⚠️ DÉCOMMENTER LES LIGNES CI-DESSOUS APRÈS VÉRIFICATION
-- ============================================

-- Supprimer les anciennes colonnes
-- ALTER TABLE profiles DROP COLUMN IF EXISTS username;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS full_name;

-- Vérification après suppression
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'profiles'
-- ORDER BY ordinal_position;

-- ============================================
-- RÉSULTAT ATTENDU:
-- ✅ username supprimé
-- ✅ full_name supprimé
-- ✅ first_name présent (NOT NULL)
-- ✅ last_name présent (NOT NULL)
-- ✅ display_name présent
-- ============================================
