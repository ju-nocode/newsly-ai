-- ================================================
-- FIX: Créer les entrées manquantes pour tous les users
-- ================================================
-- Ce script force la création des entrées dans les tables user_*
-- pour tous les utilisateurs existants

-- Vérifier d'abord les utilisateurs concernés
DO $$
DECLARE
    user_record RECORD;
    fixed_count INTEGER := 0;
    error_count INTEGER := 0;
BEGIN
    RAISE NOTICE '=== DEBUT DU FIX ===';

    FOR user_record IN
        SELECT id, email
        FROM auth.users
        ORDER BY created_at ASC
    LOOP
        BEGIN
            RAISE NOTICE 'Processing user: % (%)', user_record.email, user_record.id;

            -- 1. Créer le profil si manquant
            INSERT INTO public.profiles (id, email, full_name, country, city)
            VALUES (
                user_record.id,
                user_record.email,
                user_record.email,
                'France',
                'Paris'
            )
            ON CONFLICT (id) DO UPDATE SET
                email = EXCLUDED.email,
                updated_at = NOW();

            -- 2. User Settings
            INSERT INTO public.user_settings (user_id, theme, language)
            VALUES (user_record.id, 'dark', 'fr')
            ON CONFLICT (user_id) DO NOTHING;

            -- 3. User Feed Preferences
            INSERT INTO public.user_feed_preferences (user_id, followed_categories)
            VALUES (user_record.id, ARRAY['general'])
            ON CONFLICT (user_id) DO NOTHING;

            -- 4. User Search Preferences
            INSERT INTO public.user_search_preferences (user_id)
            VALUES (user_record.id)
            ON CONFLICT (user_id) DO NOTHING;

            -- 5. Particles Config
            INSERT INTO public.particles_config (user_id, config)
            VALUES (user_record.id, '{}'::jsonb)
            ON CONFLICT (user_id) DO NOTHING;

            fixed_count := fixed_count + 1;
            RAISE NOTICE '✓ User % fixed successfully', user_record.email;

        EXCEPTION WHEN OTHERS THEN
            error_count := error_count + 1;
            RAISE WARNING '✗ Error fixing user %: %', user_record.email, SQLERRM;
        END;
    END LOOP;

    RAISE NOTICE '=== FIN DU FIX ===';
    RAISE NOTICE 'Users processed: %', fixed_count;
    RAISE NOTICE 'Errors: %', error_count;
END $$;

-- Vérification finale
SELECT
    'Total users in auth.users' as metric,
    COUNT(*)::text as value
FROM auth.users
UNION ALL
SELECT
    'profiles',
    COUNT(*)::text
FROM public.profiles
UNION ALL
SELECT
    'user_settings',
    COUNT(*)::text
FROM public.user_settings
UNION ALL
SELECT
    'user_feed_preferences',
    COUNT(*)::text
FROM public.user_feed_preferences
UNION ALL
SELECT
    'user_search_preferences',
    COUNT(*)::text
FROM public.user_search_preferences
UNION ALL
SELECT
    'particles_config',
    COUNT(*)::text
FROM public.particles_config;
