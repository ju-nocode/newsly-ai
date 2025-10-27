-- ========================================
-- SCRIPT DE DEBUG COMPLET - NEWSLY AI
-- ========================================
-- Exécute ces requêtes UNE PAR UNE dans Supabase SQL Editor
-- et copie les résultats pour chaque section

-- ========================================
-- 1. LISTER TOUTES LES TABLES
-- ========================================
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY schemaname, tablename;

-- ========================================
-- 2. LISTER TOUS LES TRIGGERS
-- ========================================
SELECT
    trigger_schema,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE trigger_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY trigger_schema, event_object_table, trigger_name;

-- ========================================
-- 3. LISTER TOUTES LES FONCTIONS
-- ========================================
SELECT
    n.nspname as schema,
    p.proname as function_name,
    pg_get_function_result(p.oid) as return_type,
    pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
ORDER BY schema, function_name;

-- ========================================
-- 4. DÉTAILS DES COLONNES DE TOUTES LES TABLES PUBLIC
-- ========================================
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- ========================================
-- 5. CODE SOURCE DES FONCTIONS (important pour debug)
-- ========================================
SELECT
    n.nspname as schema,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
ORDER BY schema, function_name;

-- ========================================
-- 6. VÉRIFIER LA TABLE user_preferences
-- ========================================
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_preferences'
ORDER BY ordinal_position;

-- ========================================
-- 7. VÉRIFIER LA TABLE profiles
-- ========================================
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- ========================================
-- 8. VÉRIFIER LES POLICIES RLS
-- ========================================
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ========================================
-- 9. VÉRIFIER SI RLS EST ACTIVÉ
-- ========================================
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
