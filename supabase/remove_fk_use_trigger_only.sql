-- ================================================
-- SOLUTION ULTIME: Supprimer la FK et utiliser seulement le trigger
-- ================================================

-- 1. Supprimer complètement la foreign key problématique
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey CASCADE;

-- 2. S'assurer que le trigger fonctionne bien
-- Vérifier que le trigger existe
SELECT
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 3. Si le trigger n'existe pas, le recréer
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.profiles (
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
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
        COALESCE(NEW.raw_user_meta_data->>'bio', NULL),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
        COALESCE(NEW.raw_user_meta_data->>'country', 'France'),
        COALESCE(NEW.raw_user_meta_data->>'city', 'Paris'),
        false,
        NOW(),
        NOW()
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Logger l'erreur mais ne pas empêcher la création du user
        RAISE WARNING 'Could not create profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- 4. Créer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 5. Test: Le trigger doit se déclencher automatiquement à la prochaine inscription
