-- ================================================
-- NETTOYER TOUTES LES POLITIQUES ET RECRÉER
-- ================================================

-- 1. Voir TOUTES les politiques actuelles
SELECT
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'profiles';

-- 2. Désactiver temporairement RLS pour nettoyer
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 3. Supprimer TOUTES les politiques (utiliser les noms exacts affichés ci-dessus)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', r.policyname);
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;

-- 4. Vérifier qu'il n'y a plus de politiques
SELECT COUNT(*) as remaining_policies
FROM pg_policies
WHERE tablename = 'profiles';

-- 5. Recréer les politiques SIMPLES
CREATE POLICY "profiles_select_own"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 6. Réactiver RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 7. Confirmer les nouvelles politiques
SELECT
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
