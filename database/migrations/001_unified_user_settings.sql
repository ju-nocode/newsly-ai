-- ================================================
-- OPTION ALTERNATIVE: Table unifiée pour tous les settings utilisateur
-- ================================================

-- Supprimer l'ancienne table user_preferences (si elle existe et n'est pas utilisée)
DROP TABLE IF EXISTS public.user_preferences CASCADE;

-- Créer une table unifiée pour TOUS les settings utilisateur
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- ================================================
  -- CATÉGORIES D'ACTUALITÉS SUIVIES
  -- ================================================
  followed_categories JSONB DEFAULT '[]'::jsonb,
  -- Example: ["technology", "science", "sports"]

  -- ================================================
  -- SEARCH BAR PREFERENCES
  -- ================================================
  search_history JSONB DEFAULT '[]'::jsonb,
  favorite_commands JSONB DEFAULT '[]'::jsonb,
  custom_shortcuts JSONB DEFAULT '{}'::jsonb,
  command_stats JSONB DEFAULT '{}'::jsonb,

  -- ================================================
  -- AUTRES PRÉFÉRENCES
  -- ================================================
  preferences JSONB DEFAULT '{
    "maxHistoryItems": 10,
    "showFavoritesFirst": true,
    "enableShortcuts": true,
    "theme": "dark",
    "language": "fr"
  }'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;

CREATE POLICY "Users can view their own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_settings ON public.user_settings;

CREATE TRIGGER trigger_update_user_settings
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_updated_at();

-- ================================================
-- HELPER FUNCTIONS
-- ================================================

-- Ajouter une catégorie suivie
CREATE OR REPLACE FUNCTION add_followed_category(p_user_id UUID, p_category TEXT)
RETURNS VOID AS $$
DECLARE
  v_categories JSONB;
BEGIN
  SELECT followed_categories INTO v_categories
  FROM user_settings
  WHERE user_id = p_user_id;

  -- Si la catégorie n'existe pas déjà
  IF NOT v_categories ? p_category THEN
    UPDATE user_settings
    SET followed_categories = followed_categories || jsonb_build_array(p_category)
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Retirer une catégorie suivie
CREATE OR REPLACE FUNCTION remove_followed_category(p_user_id UUID, p_category TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE user_settings
  SET followed_categories = (
    SELECT jsonb_agg(elem)
    FROM jsonb_array_elements_text(followed_categories) elem
    WHERE elem != p_category
  )
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION add_followed_category TO authenticated;
GRANT EXECUTE ON FUNCTION remove_followed_category TO authenticated;
