-- ================================================
-- CORRECTION SIMPLE DE LA FOREIGN KEY PROFILES
-- ================================================

-- 1. Voir toutes les contraintes actuelles
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass;

-- 2. Supprimer toutes les contraintes foreign key nommées profiles_id_fkey
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey CASCADE;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey CASCADE;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS fk_profiles_users CASCADE;

-- 3. Créer la bonne contrainte vers auth.users
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_id_fkey
FOREIGN KEY (id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 4. Vérification finale
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'profiles'
    AND tc.constraint_type = 'FOREIGN KEY';
