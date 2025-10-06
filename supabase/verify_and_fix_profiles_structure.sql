-- ================================================
-- VÉRIFIER ET CORRIGER LA STRUCTURE DE LA TABLE PROFILES
-- ================================================

-- Étape 1: Voir la structure actuelle
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Étape 2: Ajouter les colonnes manquantes si elles n'existent pas
DO $$
BEGIN
    -- Ajouter country si manquant
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'profiles'
          AND column_name = 'country'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN country TEXT DEFAULT 'France';
        RAISE NOTICE 'Colonne country ajoutée';
    ELSE
        RAISE NOTICE 'Colonne country existe déjà';
    END IF;

    -- Ajouter city si manquant
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'profiles'
          AND column_name = 'city'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN city TEXT DEFAULT 'Paris';
        RAISE NOTICE 'Colonne city ajoutée';
    ELSE
        RAISE NOTICE 'Colonne city existe déjà';
    END IF;

    -- Ajouter phone si manquant
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'profiles'
          AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN phone TEXT;
        RAISE NOTICE 'Colonne phone ajoutée';
    ELSE
        RAISE NOTICE 'Colonne phone existe déjà';
    END IF;
END $$;

-- Étape 3: Vérifier à nouveau la structure après ajout
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Étape 4: Voir toutes les données pour l'email reechar.nills.music@gmail.com
SELECT
    id,
    email,
    username,
    full_name,
    country,
    city,
    phone,
    created_at
FROM public.profiles
WHERE email = 'reechar.nills.music@gmail.com';

-- Étape 5: Mettre à jour avec des données de test pour voir si ça fonctionne
UPDATE public.profiles
SET
    country = 'Canada',
    city = 'Montréal',
    phone = '+1 5141234567',
    updated_at = NOW()
WHERE email = 'reechar.nills.music@gmail.com';

-- Étape 6: Vérifier que la mise à jour a marché
SELECT
    id,
    email,
    username,
    country,
    city,
    phone
FROM public.profiles
WHERE email = 'reechar.nills.music@gmail.com';
