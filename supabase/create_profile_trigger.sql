-- ================================================
-- SOLUTION ALTERNATIVE: Trigger automatique
-- Crée automatiquement un profil quand un user s'inscrit
-- ================================================

-- 1. Créer la fonction trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
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
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        username = EXCLUDED.username,
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        bio = EXCLUDED.bio,
        avatar_url = EXCLUDED.avatar_url,
        country = EXCLUDED.country,
        city = EXCLUDED.city,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Créer le trigger sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 3. Tester que le trigger fonctionne
-- Ce trigger sera déclenché automatiquement à chaque inscription
