-- ================================================
-- DIAGNOSTIC: Vérifier l'état des triggers et fonctions
-- ================================================

-- 1. Vérifier que les fonctions existent
SELECT
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('initialize_user_preferences', 'handle_new_user');

-- 2. Vérifier que le trigger existe
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public' OR event_object_schema = 'auth'
AND trigger_name = 'on_auth_user_created';

-- 3. Compter les utilisateurs dans auth.users
SELECT COUNT(*) as total_users FROM auth.users;

-- 4. Compter les entrées dans chaque table user_*
SELECT
    'profiles' as table_name,
    COUNT(*) as row_count
FROM public.profiles
UNION ALL
SELECT
    'user_settings',
    COUNT(*)
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
FROM public.particles_config;

-- 5. Trouver les utilisateurs qui n'ont PAS d'entrées dans les tables user_*
SELECT
    u.id,
    u.email,
    CASE WHEN p.id IS NULL THEN 'MISSING' ELSE 'OK' END as profile_status,
    CASE WHEN s.user_id IS NULL THEN 'MISSING' ELSE 'OK' END as settings_status,
    CASE WHEN f.user_id IS NULL THEN 'MISSING' ELSE 'OK' END as feed_prefs_status,
    CASE WHEN sp.user_id IS NULL THEN 'MISSING' ELSE 'OK' END as search_prefs_status,
    CASE WHEN pc.user_id IS NULL THEN 'MISSING' ELSE 'OK' END as particles_status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.user_settings s ON u.id = s.user_id
LEFT JOIN public.user_feed_preferences f ON u.id = f.user_id
LEFT JOIN public.user_search_preferences sp ON u.id = sp.user_id
LEFT JOIN public.particles_config pc ON u.id = pc.user_id
ORDER BY u.created_at DESC;

-- 6. Tester manuellement la fonction pour un utilisateur existant
-- ATTENTION: Remplace 'USER_ID_HERE' par un vrai ID d'utilisateur
-- SELECT public.initialize_user_preferences('USER_ID_HERE'::uuid);
