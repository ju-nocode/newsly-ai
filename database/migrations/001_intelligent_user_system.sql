-- ================================================
-- NEWSLY AI - INTELLIGENT USER PERSONALIZATION SYSTEM
-- ================================================
-- Architecture multi-tables pour une expérience utilisateur intelligente
-- Chaque table a une responsabilité claire et contribue à la personnalisation

-- ================================================
-- TABLE 1: USER SETTINGS (Paramètres généraux)
-- ================================================
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Préférences d'interface
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'auto')),
  language TEXT DEFAULT 'fr' CHECK (language IN ('fr', 'en')),

  -- Préférences de notification
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT false,
  newsletter_frequency TEXT DEFAULT 'weekly' CHECK (newsletter_frequency IN ('daily', 'weekly', 'monthly', 'never')),

  -- Préférences d'affichage
  articles_per_page INTEGER DEFAULT 20 CHECK (articles_per_page BETWEEN 10 AND 100),
  compact_view BOOLEAN DEFAULT false,
  show_images BOOLEAN DEFAULT true,

  -- Timezone et localisation
  timezone TEXT DEFAULT 'Europe/Paris',
  country_code TEXT,
  city TEXT,

  -- Métadonnées
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- TABLE 2: USER FEED PREFERENCES (Préférences de flux)
-- ================================================
CREATE TABLE IF NOT EXISTS public.user_feed_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Catégories suivies (array simple pour requêtes rapides)
  followed_categories TEXT[] DEFAULT ARRAY['general'],

  -- Sources suivies
  followed_sources JSONB DEFAULT '[]'::jsonb,
  -- Example: [{"id": "bbc", "name": "BBC News", "priority": 1}]

  -- Sources bloquées
  blocked_sources JSONB DEFAULT '[]'::jsonb,

  -- Mots-clés d'intérêt
  interest_keywords JSONB DEFAULT '[]'::jsonb,
  -- Example: ["AI", "blockchain", "climate change"]

  -- Mots-clés à ignorer
  blocked_keywords JSONB DEFAULT '[]'::jsonb,

  -- Filtres de pays
  preferred_countries TEXT[] DEFAULT ARRAY[]::TEXT[],
  excluded_countries TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Algorithme de tri préféré
  default_sort TEXT DEFAULT 'relevance' CHECK (default_sort IN ('latest', 'relevance', 'popularity', 'personalized')),

  -- Préférences de fraîcheur
  max_article_age_hours INTEGER DEFAULT 48,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- TABLE 3: USER SEARCH PREFERENCES (Search bar)
-- ================================================
CREATE TABLE IF NOT EXISTS public.user_search_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Historique de recherche
  search_history JSONB DEFAULT '[]'::jsonb,
  -- Max 50 items, format: [{"query": "/feed: tech", "timestamp": 123456, "type": "command"}]

  -- Commandes favorites
  favorite_commands JSONB DEFAULT '[]'::jsonb,
  -- Example: ["/feed: technology", "/dashboard"]

  -- Raccourcis personnalisés
  custom_shortcuts JSONB DEFAULT '{}'::jsonb,
  -- Example: {"/t": "/feed: technology", "/d": "/dashboard"}

  -- Statistiques d'usage par commande
  command_stats JSONB DEFAULT '{}'::jsonb,
  -- Example: {"/feed: technology": 45, "/dashboard": 32}

  -- Préférences d'affichage
  preferences JSONB DEFAULT '{
    "maxHistoryItems": 10,
    "showFavoritesFirst": true,
    "enableShortcuts": true,
    "fuzzySearchEnabled": true
  }'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- TABLE 4: USER READING HISTORY (Historique de lecture)
-- ================================================
CREATE TABLE IF NOT EXISTS public.user_reading_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Article info
  article_id TEXT NOT NULL, -- ID de l'article (peut être URL hash ou ID externe)
  article_url TEXT NOT NULL,
  article_title TEXT,
  article_category TEXT,
  article_source TEXT,

  -- Engagement metrics
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  read_duration_seconds INTEGER DEFAULT 0,
  scroll_depth_percent INTEGER DEFAULT 0 CHECK (scroll_depth_percent BETWEEN 0 AND 100),
  completed BOOLEAN DEFAULT false,

  -- Actions utilisateur
  bookmarked BOOLEAN DEFAULT false,
  liked BOOLEAN DEFAULT false,
  shared BOOLEAN DEFAULT false,

  -- Métadonnées
  device_type TEXT, -- 'mobile', 'tablet', 'desktop'

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Index composite pour queries rapides
  CONSTRAINT unique_user_article UNIQUE (user_id, article_id)
);

-- ================================================
-- TABLE 5: USER BOOKMARKS (Articles sauvegardés)
-- ================================================
CREATE TABLE IF NOT EXISTS public.user_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Article info
  article_id TEXT NOT NULL,
  article_url TEXT NOT NULL,
  article_title TEXT,
  article_category TEXT,
  article_source TEXT,
  article_image_url TEXT,
  article_published_at TIMESTAMPTZ,

  -- Organisation
  folder TEXT DEFAULT 'default',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT,

  -- Métadonnées
  bookmarked_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ,

  CONSTRAINT unique_user_bookmark UNIQUE (user_id, article_id)
);

-- ================================================
-- TABLE 6: USER ACTIVITY LOG (Pour analytics et ML)
-- ================================================
CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Type d'activité
  activity_type TEXT NOT NULL,
  -- Examples: 'search', 'read_article', 'bookmark', 'change_category', 'login', etc.

  -- Contexte de l'activité
  context JSONB DEFAULT '{}'::jsonb,
  -- Example: {"query": "/feed: tech", "result_count": 15, "clicked_position": 3}

  -- Métadonnées
  session_id UUID,
  device_type TEXT,
  user_agent TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- INDEXES POUR PERFORMANCE
-- ================================================

-- user_settings
CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);

-- user_feed_preferences
CREATE INDEX idx_user_feed_prefs_user_id ON public.user_feed_preferences(user_id);
CREATE INDEX idx_user_feed_prefs_categories ON public.user_feed_preferences USING GIN(followed_categories);

-- user_search_preferences
CREATE INDEX idx_user_search_prefs_user_id ON public.user_search_preferences(user_id);

-- user_reading_history
CREATE INDEX idx_reading_history_user_id ON public.user_reading_history(user_id);
CREATE INDEX idx_reading_history_category ON public.user_reading_history(article_category);
CREATE INDEX idx_reading_history_created_at ON public.user_reading_history(created_at DESC);
CREATE INDEX idx_reading_history_completed ON public.user_reading_history(user_id, completed) WHERE completed = true;

-- user_bookmarks
CREATE INDEX idx_bookmarks_user_id ON public.user_bookmarks(user_id);
CREATE INDEX idx_bookmarks_folder ON public.user_bookmarks(user_id, folder);
CREATE INDEX idx_bookmarks_tags ON public.user_bookmarks USING GIN(tags);

-- user_activity_log
CREATE INDEX idx_activity_log_user_id ON public.user_activity_log(user_id);
CREATE INDEX idx_activity_log_type ON public.user_activity_log(activity_type);
CREATE INDEX idx_activity_log_created_at ON public.user_activity_log(created_at DESC);

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================

-- Enable RLS on all tables
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feed_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_search_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users manage their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users manage their own feed prefs" ON public.user_feed_preferences;
DROP POLICY IF EXISTS "Users manage their own search prefs" ON public.user_search_preferences;
DROP POLICY IF EXISTS "Users manage their own reading history" ON public.user_reading_history;
DROP POLICY IF EXISTS "Users manage their own bookmarks" ON public.user_bookmarks;
DROP POLICY IF EXISTS "Users manage their own activity log" ON public.user_activity_log;

-- Create policies for user_settings
CREATE POLICY "Users manage their own settings"
  ON public.user_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for user_feed_preferences
CREATE POLICY "Users manage their own feed prefs"
  ON public.user_feed_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for user_search_preferences
CREATE POLICY "Users manage their own search prefs"
  ON public.user_search_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for user_reading_history
CREATE POLICY "Users manage their own reading history"
  ON public.user_reading_history FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for user_bookmarks
CREATE POLICY "Users manage their own bookmarks"
  ON public.user_bookmarks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for user_activity_log
CREATE POLICY "Users manage their own activity log"
  ON public.user_activity_log FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ================================================
-- TRIGGERS POUR AUTO-UPDATE
-- ================================================

-- Function pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour toutes les tables avec updated_at
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
DROP TRIGGER IF EXISTS update_user_feed_prefs_updated_at ON public.user_feed_preferences;
DROP TRIGGER IF EXISTS update_user_search_prefs_updated_at ON public.user_search_preferences;
DROP TRIGGER IF EXISTS update_user_reading_history_updated_at ON public.user_reading_history;

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_feed_prefs_updated_at
  BEFORE UPDATE ON public.user_feed_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_search_prefs_updated_at
  BEFORE UPDATE ON public.user_search_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_reading_history_updated_at
  BEFORE UPDATE ON public.user_reading_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- INTELLIGENT FUNCTIONS
-- ================================================

-- Function: Obtenir les catégories recommandées basées sur l'historique de lecture
CREATE OR REPLACE FUNCTION get_recommended_categories(p_user_id UUID, p_limit INT DEFAULT 5)
RETURNS TABLE(category TEXT, score BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    article_category,
    COUNT(*) as score
  FROM user_reading_history
  WHERE user_id = p_user_id
    AND completed = true
    AND article_category IS NOT NULL
    AND created_at > NOW() - INTERVAL '30 days'
  GROUP BY article_category
  ORDER BY score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Obtenir les sources recommandées
CREATE OR REPLACE FUNCTION get_recommended_sources(p_user_id UUID, p_limit INT DEFAULT 5)
RETURNS TABLE(source TEXT, engagement_score NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT
    article_source,
    (AVG(read_duration_seconds) * COUNT(*))::NUMERIC as engagement_score
  FROM user_reading_history
  WHERE user_id = p_user_id
    AND article_source IS NOT NULL
    AND created_at > NOW() - INTERVAL '30 days'
  GROUP BY article_source
  ORDER BY engagement_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Obtenir les top commandes de recherche
CREATE OR REPLACE FUNCTION get_top_search_commands(p_user_id UUID, p_limit INT DEFAULT 5)
RETURNS TABLE(command TEXT, usage_count INT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    key::TEXT as command,
    value::TEXT::INT as usage_count
  FROM
    user_search_preferences,
    jsonb_each_text(command_stats)
  WHERE
    user_id = p_user_id
  ORDER BY
    value::TEXT::INT DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Initialiser toutes les tables pour un nouvel utilisateur
CREATE OR REPLACE FUNCTION initialize_user_preferences(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Insert default settings
  INSERT INTO user_settings (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO user_feed_preferences (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO user_search_preferences (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Obtenir un profile utilisateur complet
CREATE OR REPLACE FUNCTION get_user_profile(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_profile JSONB;
BEGIN
  SELECT jsonb_build_object(
    'settings', (SELECT row_to_json(s.*) FROM user_settings s WHERE s.user_id = p_user_id),
    'feed_preferences', (SELECT row_to_json(f.*) FROM user_feed_preferences f WHERE f.user_id = p_user_id),
    'search_preferences', (SELECT row_to_json(sp.*) FROM user_search_preferences sp WHERE sp.user_id = p_user_id),
    'stats', jsonb_build_object(
      'total_articles_read', (SELECT COUNT(*) FROM user_reading_history WHERE user_id = p_user_id),
      'articles_completed', (SELECT COUNT(*) FROM user_reading_history WHERE user_id = p_user_id AND completed = true),
      'total_bookmarks', (SELECT COUNT(*) FROM user_bookmarks WHERE user_id = p_user_id),
      'favorite_category', (SELECT category FROM get_recommended_categories(p_user_id, 1) LIMIT 1)
    )
  ) INTO v_profile;

  RETURN v_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_recommended_categories TO authenticated;
GRANT EXECUTE ON FUNCTION get_recommended_sources TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_search_commands TO authenticated;
GRANT EXECUTE ON FUNCTION initialize_user_preferences TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_profile TO authenticated;

-- ================================================
-- TRIGGER: Auto-initialize user on signup
-- ================================================
CREATE OR REPLACE FUNCTION auto_initialize_user()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM initialize_user_preferences(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_auto_initialize_user ON auth.users;

CREATE TRIGGER trigger_auto_initialize_user
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_initialize_user();
