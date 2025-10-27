-- Migration des métadonnées utilisateur existant
-- Convertit username/full_name → first_name/last_name/display_name
-- À exécuter dans le dashboard Supabase SQL Editor

-- 1. Vérifier les métadonnées actuelles
SELECT
    id,
    email,
    raw_user_meta_data
FROM auth.users
WHERE email = 'ju.richard.33@gmail.com';

-- 2. Mettre à jour les métadonnées de l'utilisateur existant
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
    jsonb_set(
        jsonb_set(
            raw_user_meta_data - 'username' - 'full_name',
            '{first_name}',
            to_jsonb('Julien'::text)
        ),
        '{last_name}',
        to_jsonb('RICHARD'::text)
    ),
    '{display_name}',
    to_jsonb('Julien RICHARD'::text)
)
WHERE id = '66510c8d-06c8-4320-978f-30b47016c63b';

-- 3. Vérifier le résultat
SELECT
    id,
    email,
    raw_user_meta_data
FROM auth.users
WHERE email = 'ju.richard.33@gmail.com';

-- 4. Mettre à jour la table profiles si nécessaire
UPDATE profiles
SET
    first_name = 'Julien',
    last_name = 'RICHARD',
    display_name = 'Julien RICHARD',
    updated_at = now()
WHERE id = '66510c8d-06c8-4320-978f-30b47016c63b';
