# Database Migrations - Newsly AI

## 📋 Vue d'ensemble

Ce dossier contient toutes les migrations SQL pour la base de données Supabase de Newsly AI.

## 🚀 Installation

### Migration 001: Initialize User Tables

**Fichier**: `001_initialize_user_tables.sql`

**Objectif**:
- Créer les fonctions d'initialisation des tables user_*
- Créer le trigger automatique à l'inscription
- Remplir les tables pour les utilisateurs existants (backfill)

**Comment l'exécuter**:

1. **Via Supabase Dashboard** (Recommandé):
   - Va sur https://supabase.com/dashboard
   - Sélectionne ton projet
   - Clique sur "SQL Editor" dans le menu gauche
   - Clique sur "+ New query"
   - Copie-colle tout le contenu de `001_initialize_user_tables.sql`
   - Clique sur "Run"
   - Vérifie les résultats dans la section "Results"

2. **Via CLI Supabase**:
   ```bash
   supabase db push --file database-migrations/001_initialize_user_tables.sql
   ```

### Vérification

Après avoir exécuté la migration, vérifie que tout fonctionne :

#### 1. Vérifier que les fonctions existent

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('initialize_user_preferences', 'handle_new_user');
```

Tu devrais voir 2 lignes :
- `initialize_user_preferences` | `FUNCTION`
- `handle_new_user` | `FUNCTION`

#### 2. Vérifier que le trigger existe

```sql
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

Tu devrais voir 1 ligne avec le trigger sur `auth.users`.

#### 3. Vérifier que les tables user_* sont remplies

```sql
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
```

Toutes les tables devraient avoir **au moins 1 ligne par utilisateur**.

#### 4. Vérifier pour un utilisateur spécifique

Remplace `<USER_EMAIL>` par ton email :

```sql
SELECT
    u.id,
    u.email,
    CASE WHEN p.id IS NOT NULL THEN '✅' ELSE '❌' END as profile,
    CASE WHEN us.id IS NOT NULL THEN '✅' ELSE '❌' END as settings,
    CASE WHEN ufp.id IS NOT NULL THEN '✅' ELSE '❌' END as feed_prefs,
    CASE WHEN usp.id IS NOT NULL THEN '✅' ELSE '❌' END as search_prefs,
    CASE WHEN pc.id IS NOT NULL THEN '✅' ELSE '❌' END as particles
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.user_settings us ON us.user_id = u.id
LEFT JOIN public.user_feed_preferences ufp ON ufp.user_id = u.id
LEFT JOIN public.user_search_preferences usp ON usp.user_id = u.id
LEFT JOIN public.particles_config pc ON pc.user_id = u.id
WHERE u.email = '<USER_EMAIL>';
```

Tous les champs devraient afficher ✅.

## 🧪 Test du système

### Test 1: Inscription nouveau utilisateur

1. Déconnecte-toi de l'app
2. Crée un nouveau compte test
3. Va dans Supabase Dashboard → SQL Editor
4. Exécute la requête de vérification ci-dessus avec l'email du nouveau compte
5. Vérifie que toutes les tables sont initialisées (✅)

### Test 2: Appel manuel de la fonction

```sql
-- Remplace <USER_ID> par un UUID utilisateur
SELECT public.initialize_user_preferences('<USER_ID>');
```

Cette fonction devrait s'exécuter sans erreur et créer toutes les lignes manquantes.

## 🐛 Dépannage

### Problème: Les tables user_* sont toujours vides

**Solution 1**: Exécuter manuellement le backfill

```sql
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id FROM auth.users
    LOOP
        PERFORM public.initialize_user_preferences(user_record.id);
    END LOOP;
END $$;
```

**Solution 2**: Vérifier les permissions RLS

Les politiques RLS (Row Level Security) peuvent bloquer l'insertion. Vérifie :

```sql
-- Désactiver temporairement RLS pour debug (ATTENTION: à ne faire qu'en dev!)
ALTER TABLE public.user_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feed_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_search_preferences DISABLE ROW LEVEL SECURITY;

-- Ensuite, réactiver après avoir inséré les données
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feed_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_search_preferences ENABLE ROW LEVEL SECURITY;
```

### Problème: Erreur "function does not exist"

Vérifie que tu as bien exécuté la migration complète. Recopie et réexécute le fichier `001_initialize_user_tables.sql`.

### Problème: Trigger ne se déclenche pas

Vérifie que le trigger existe :

```sql
SELECT * FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

Si absent, réexécute juste la partie TRIGGER du fichier de migration.

## 📝 Notes importantes

- **SECURITY DEFINER**: Les fonctions utilisent `SECURITY DEFINER` pour bypasser les RLS policies lors de l'initialisation
- **ON CONFLICT DO NOTHING**: Empêche les erreurs si les lignes existent déjà
- **Backfill automatique**: La migration initialise automatiquement tous les utilisateurs existants

## 🔄 Ordre d'exécution

Si tu as plusieurs migrations à l'avenir :

1. `001_initialize_user_tables.sql` (Ce fichier)
2. `002_...` (Futures migrations)

Toujours exécuter dans l'ordre numérique !
