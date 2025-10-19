-- ================================================
-- USER SEARCH PREFERENCES TABLE
-- ================================================
-- Store user search history, favorites, custom shortcuts, and usage stats

-- Create table
CREATE TABLE IF NOT EXISTS user_search_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Search history (last 50 searches)
  search_history JSONB DEFAULT '[]'::jsonb,

  -- Favorite commands (starred by user)
  favorite_commands JSONB DEFAULT '[]'::jsonb,

  -- Custom shortcuts defined by user (e.g., "/t" -> "/feed: technology")
  custom_shortcuts JSONB DEFAULT '{}'::jsonb,

  -- Command usage statistics (command -> count)
  command_stats JSONB DEFAULT '{}'::jsonb,

  -- General preferences (display order, etc.)
  preferences JSONB DEFAULT '{
    "maxHistoryItems": 10,
    "showFavoritesFirst": true,
    "enableShortcuts": true
  }'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one row per user
  CONSTRAINT unique_user_search_prefs UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_search_preferences_user_id
  ON user_search_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_user_search_preferences_updated_at
  ON user_search_preferences(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE user_search_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own search preferences" ON user_search_preferences;
DROP POLICY IF EXISTS "Users can insert their own search preferences" ON user_search_preferences;
DROP POLICY IF EXISTS "Users can update their own search preferences" ON user_search_preferences;
DROP POLICY IF EXISTS "Users can delete their own search preferences" ON user_search_preferences;

-- RLS Policies: Users can only access their own preferences
CREATE POLICY "Users can view their own search preferences"
  ON user_search_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own search preferences"
  ON user_search_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own search preferences"
  ON user_search_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own search preferences"
  ON user_search_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update 'updated_at'
CREATE OR REPLACE FUNCTION update_user_search_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
DROP TRIGGER IF EXISTS trigger_update_user_search_preferences_updated_at ON user_search_preferences;

CREATE TRIGGER trigger_update_user_search_preferences_updated_at
  BEFORE UPDATE ON user_search_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_search_preferences_updated_at();

-- ================================================
-- HELPER FUNCTIONS
-- ================================================

-- Function to get user's most used commands
CREATE OR REPLACE FUNCTION get_user_top_commands(
  p_user_id UUID,
  p_limit INT DEFAULT 5
)
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_top_commands TO authenticated;

-- ================================================
-- SAMPLE DATA (for testing - remove in production)
-- ================================================

-- Insert sample preferences for testing
-- COMMENT OUT OR REMOVE THIS IN PRODUCTION
/*
INSERT INTO user_search_preferences (user_id, search_history, favorite_commands, command_stats)
VALUES (
  auth.uid(), -- Current user
  '[
    {"query": "/feed: technology", "timestamp": 1234567890, "type": "command"},
    {"query": "/dashboard", "timestamp": 1234567891, "type": "command"}
  ]'::jsonb,
  '["/feed: technology", "/dashboard"]'::jsonb,
  '{
    "/feed: technology": 45,
    "/dashboard": 32,
    "/profile: account": 12
  }'::jsonb
)
ON CONFLICT (user_id) DO NOTHING;
*/

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- Verify table exists
-- SELECT * FROM user_search_preferences LIMIT 1;

-- Verify indexes
-- SELECT indexname FROM pg_indexes WHERE tablename = 'user_search_preferences';

-- Verify RLS policies
-- SELECT * FROM pg_policies WHERE tablename = 'user_search_preferences';
