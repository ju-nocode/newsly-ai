-- ================================================
-- SOLUTION FINALE: Spécifier explicitement le schéma auth
-- ================================================

-- 1. Vérifier si public.users existe
SELECT
    schemaname,
    tablename
FROM pg_tables
WHERE tablename = 'users';

-- 2. Supprimer la contrainte actuelle
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey CASCADE;

-- 3. Recréer la contrainte en spécifiant EXPLICITEMENT le schéma auth
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_id_fkey
FOREIGN KEY (id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 4. Vérifier la définition exacte de la contrainte
SELECT
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conname = 'profiles_id_fkey'
    AND conrelid = 'public.profiles'::regclass;

-- 5. Alternative: Supprimer public.users si elle existe et n'est pas utilisée
-- ATTENTION: Décommente cette ligne SEULEMENT si tu es sûr que public.users n'est pas utilisée
-- DROP TABLE IF EXISTS public.users CASCADE;
