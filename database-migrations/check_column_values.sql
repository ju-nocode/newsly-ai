-- ================================================
-- VERIFICATION: Contenu réel des colonnes user_*
-- ================================================

-- 1. Vérifier user_settings (avec toutes les colonnes)
SELECT
    'user_settings' as table_name,
    user_id,
    theme,
    language,
    email_notifications,
    push_notifications,
    newsletter_frequency,
    articles_per_page,
    compact_view,
    show_images,
    timezone,
    onboarding_completed,
    onboarding_step,
    created_at,
    updated_at
FROM public.user_settings
ORDER BY created_at DESC;

-- 2. Vérifier user_feed_preferences
SELECT
    'user_feed_preferences' as table_name,
    user_id,
    followed_categories,
    followed_sources,
    blocked_sources,
    interest_keywords,
    blocked_keywords,
    preferred_countries,
    excluded_countries,
    default_sort,
    max_article_age_hours,
    created_at,
    updated_at
FROM public.user_feed_preferences
ORDER BY created_at DESC;

-- 3. Vérifier user_search_preferences
SELECT
    'user_search_preferences' as table_name,
    user_id,
    search_history,
    favorite_commands,
    custom_shortcuts,
    command_stats,
    preferences,
    created_at,
    updated_at
FROM public.user_search_preferences
ORDER BY created_at DESC;

-- 4. Vérifier particles_config
SELECT
    'particles_config' as table_name,
    user_id,
    config,
    created_at,
    updated_at
FROM public.particles_config
ORDER BY created_at DESC;

-- 5. Vérifier profiles
SELECT
    'profiles' as table_name,
    id,
    email,
    username,
    full_name,
    phone,
    bio,
    avatar_url,
    country,
    city,
    is_admin,
    created_at,
    updated_at
FROM public.profiles
ORDER BY created_at DESC;
