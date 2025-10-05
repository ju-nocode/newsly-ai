-- ================================================
-- FIX FOREIGN KEYS - Tout référence auth.users(id)
-- ================================================

-- 1. Supprimer les anciennes contraintes problématiques
ALTER TABLE public.saved_articles
DROP CONSTRAINT IF EXISTS saved_articles_user_id_fkey;

ALTER TABLE public.user_preferences
DROP CONSTRAINT IF EXISTS user_preferences_user_id_fkey;

-- 2. Recréer les contraintes pour référencer auth.users(id)
ALTER TABLE public.saved_articles
ADD CONSTRAINT saved_articles_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

ALTER TABLE public.user_preferences
ADD CONSTRAINT user_preferences_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 3. Vérifier que particles_config est correct (normalement déjà OK)
-- Si erreur, décommenter ces lignes :
-- ALTER TABLE public.particles_config
-- DROP CONSTRAINT IF EXISTS particles_config_user_id_fkey;
--
-- ALTER TABLE public.particles_config
-- ADD CONSTRAINT particles_config_user_id_fkey
-- FOREIGN KEY (user_id)
-- REFERENCES auth.users(id)
-- ON DELETE CASCADE;

-- ================================================
-- VÉRIFICATION FINALE
-- ================================================

-- Afficher toutes les foreign keys pour vérification
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_schema || '.' || ccu.table_name AS foreign_table,
    ccu.column_name AS foreign_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name;
