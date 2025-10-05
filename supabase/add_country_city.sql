-- ================================================
-- Ajouter les colonnes country et city à la table profiles
-- ================================================

-- Ajouter la colonne country (obligatoire)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS country TEXT NOT NULL DEFAULT 'France';

-- Ajouter la colonne city (obligatoire)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS city TEXT NOT NULL DEFAULT 'Paris';

-- Mettre à jour les profils existants (pour éviter les erreurs)
UPDATE public.profiles
SET country = 'France', city = 'Paris'
WHERE country IS NULL OR city IS NULL;

-- Ajouter des commentaires pour la documentation
COMMENT ON COLUMN public.profiles.country IS 'Pays de résidence de l''utilisateur (obligatoire)';
COMMENT ON COLUMN public.profiles.city IS 'Ville de résidence de l''utilisateur (obligatoire)';

-- Créer un index pour améliorer les performances de recherche par pays/ville
CREATE INDEX IF NOT EXISTS idx_profiles_country ON public.profiles(country);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);

-- Afficher la structure finale
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;
