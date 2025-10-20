-- ================================================
-- MIGRATION: Initialize user tables automatically
-- ================================================
-- Ce script crée les fonctions et triggers nécessaires pour initialiser
-- automatiquement toutes les tables user_* lors de l'inscription

-- ================================================
-- FUNCTION: Initialize all user-related tables
-- ================================================
CREATE OR REPLACE FUNCTION public.initialize_user_preferences(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 1. User Settings (paramètres utilisateur)
    INSERT INTO public.user_settings (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;

    -- 2. User Feed Preferences (préférences de feed)
    INSERT INTO public.user_feed_preferences (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;

    -- 3. User Search Preferences (historique et préférences de recherche)
    INSERT INTO public.user_search_preferences (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;

    -- 4. Particles Config (configuration particles.js)
    INSERT INTO public.particles_config (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;

    RAISE NOTICE 'Initialized all user tables for user_id: %', p_user_id;
END;
$$;

-- ================================================
-- FUNCTION: Trigger function on user signup
-- ================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 1. Create profile (synchronize with auth.users)
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    )
    ON CONFLICT (id) DO NOTHING;

    -- 2. Initialize all user preferences tables
    PERFORM public.initialize_user_preferences(NEW.id);

    RETURN NEW;
END;
$$;

-- ================================================
-- TRIGGER: Auto-initialize on user signup
-- ================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ================================================
-- BACKFILL: Initialize for existing users
-- ================================================
-- Cette partie initialise les tables pour tous les utilisateurs existants
DO $$
DECLARE
    user_record RECORD;
    initialized_count INTEGER := 0;
BEGIN
    FOR user_record IN SELECT id, email FROM auth.users
    LOOP
        -- Create profile if not exists
        INSERT INTO public.profiles (id, email, full_name)
        VALUES (
            user_record.id,
            user_record.email,
            user_record.email
        )
        ON CONFLICT (id) DO NOTHING;

        -- Initialize all user tables
        PERFORM public.initialize_user_preferences(user_record.id);

        initialized_count := initialized_count + 1;
    END LOOP;

    RAISE NOTICE 'Backfilled % existing users', initialized_count;
END $$;

-- ================================================
-- VERIFICATION
-- ================================================
-- Vérifier que toutes les tables user_* ont bien des données
SELECT
    'user_settings' as table_name,
    COUNT(*) as row_count
FROM public.user_settings
UNION ALL
SELECT
    'user_feed_preferences',
    COUNT(*)
FROM public.user_feed_preferences
UNION ALL
SELECT
    'user_search_preferences',
    COUNT(*)
FROM public.user_search_preferences
UNION ALL
SELECT
    'particles_config',
    COUNT(*)
FROM public.particles_config
UNION ALL
SELECT
    'profiles',
    COUNT(*)
FROM public.profiles;
