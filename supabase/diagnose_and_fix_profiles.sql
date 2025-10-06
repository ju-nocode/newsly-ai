-- ================================================
-- DIAGNOSTIC ET CORRECTION TABLE PROFILES
-- ================================================

-- 1. DIAGNOSTIC: Vérifier toutes les contraintes sur profiles
SELECT
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass;

-- 2. DIAGNOSTIC: Vérifier si la table public.users existe
SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'users'
) AS public_users_exists;

-- 3. CORRECTION: Supprimer TOUTES les foreign keys sur profiles.id
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'public.profiles'::regclass
        AND contype = 'f'
        AND conkey::int[] = ARRAY[(
            SELECT attnum
            FROM pg_attribute
            WHERE attrelid = 'public.profiles'::regclass
            AND attname = 'id'
        )]
    LOOP
        EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS %I CASCADE', constraint_record.conname);
        RAISE NOTICE 'Dropped constraint: %', constraint_record.conname;
    END LOOP;
END $$;

-- 4. CORRECTION: Créer la bonne foreign key vers auth.users
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_id_fkey
FOREIGN KEY (id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 5. VÉRIFICATION: Confirmer que la contrainte est correcte
SELECT
    tc.constraint_name,
    tc.table_schema || '.' || tc.table_name AS table_full_name,
    kcu.column_name,
    ccu.table_schema || '.' || ccu.table_name AS references_table,
    ccu.column_name AS references_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name = 'profiles'
    AND kcu.column_name = 'id';
