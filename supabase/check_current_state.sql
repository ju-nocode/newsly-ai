-- ================================================
-- VÉRIFICATION DE L'ÉTAT ACTUEL
-- ================================================

-- 1. Vérifier si des utilisateurs existent dans auth.users
SELECT
    id,
    email,
    created_at,
    raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 2. Vérifier si des profils existent dans public.profiles
SELECT
    id,
    email,
    username,
    full_name,
    country,
    city,
    created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 5;

-- 3. Vérifier si le trigger existe
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 4. Vérifier les foreign keys actuelles sur profiles
SELECT
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass
    AND contype = 'f';
