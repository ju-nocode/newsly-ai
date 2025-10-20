-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.particles_config (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT particles_config_pkey PRIMARY KEY (id),
  CONSTRAINT particles_config_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  full_name text,
  is_admin boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  username text,
  phone text,
  bio text,
  avatar_url text,
  country text NOT NULL DEFAULT 'France'::text,
  city text NOT NULL DEFAULT 'Paris'::text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.search_command_suggestions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  command_id uuid NOT NULL,
  value character varying NOT NULL,
  label character varying NOT NULL,
  description text,
  action_type character varying DEFAULT 'navigate'::character varying,
  action_value text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT search_command_suggestions_pkey PRIMARY KEY (id),
  CONSTRAINT search_command_suggestions_command_id_fkey FOREIGN KEY (command_id) REFERENCES public.search_commands(id)
);
CREATE TABLE public.search_commands (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  prefix character varying NOT NULL UNIQUE,
  aliases ARRAY DEFAULT '{}'::text[],
  description text NOT NULL,
  icon character varying DEFAULT '🔍'::character varying,
  action_type character varying DEFAULT 'navigate'::character varying,
  action_value text,
  has_suggestions boolean DEFAULT false,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT search_commands_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_activity_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  activity_type text NOT NULL,
  context jsonb DEFAULT '{}'::jsonb,
  session_id uuid,
  device_type text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_activity_log_pkey PRIMARY KEY (id),
  CONSTRAINT user_activity_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_bookmarks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  article_id text NOT NULL,
  article_url text NOT NULL,
  article_title text,
  article_category text,
  article_source text,
  article_image_url text,
  article_published_at timestamp with time zone,
  folder text DEFAULT 'default'::text,
  tags ARRAY DEFAULT ARRAY[]::text[],
  notes text,
  bookmarked_at timestamp with time zone DEFAULT now(),
  last_accessed_at timestamp with time zone,
  CONSTRAINT user_bookmarks_pkey PRIMARY KEY (id),
  CONSTRAINT user_bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_feed_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  followed_categories ARRAY DEFAULT ARRAY['general'::text],
  followed_sources jsonb DEFAULT '[]'::jsonb,
  blocked_sources jsonb DEFAULT '[]'::jsonb,
  interest_keywords jsonb DEFAULT '[]'::jsonb,
  blocked_keywords jsonb DEFAULT '[]'::jsonb,
  preferred_countries ARRAY DEFAULT ARRAY[]::text[],
  excluded_countries ARRAY DEFAULT ARRAY[]::text[],
  default_sort text DEFAULT 'relevance'::text CHECK (default_sort = ANY (ARRAY['latest'::text, 'relevance'::text, 'popularity'::text, 'personalized'::text])),
  max_article_age_hours integer DEFAULT 48,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_feed_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT user_feed_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_reading_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  article_id text NOT NULL,
  article_url text NOT NULL,
  article_title text,
  article_category text,
  article_source text,
  opened_at timestamp with time zone DEFAULT now(),
  read_duration_seconds integer DEFAULT 0,
  scroll_depth_percent integer DEFAULT 0 CHECK (scroll_depth_percent >= 0 AND scroll_depth_percent <= 100),
  completed boolean DEFAULT false,
  bookmarked boolean DEFAULT false,
  liked boolean DEFAULT false,
  shared boolean DEFAULT false,
  device_type text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_reading_history_pkey PRIMARY KEY (id),
  CONSTRAINT user_reading_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_search_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  search_history jsonb DEFAULT '[]'::jsonb,
  favorite_commands jsonb DEFAULT '[]'::jsonb,
  custom_shortcuts jsonb DEFAULT '{}'::jsonb,
  command_stats jsonb DEFAULT '{}'::jsonb,
  preferences jsonb DEFAULT '{"enableShortcuts": true, "maxHistoryItems": 10, "fuzzySearchEnabled": true, "showFavoritesFirst": true}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_search_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT user_search_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  theme text DEFAULT 'dark'::text CHECK (theme = ANY (ARRAY['light'::text, 'dark'::text, 'auto'::text])),
  language text DEFAULT 'fr'::text CHECK (language = ANY (ARRAY['fr'::text, 'en'::text])),
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT false,
  newsletter_frequency text DEFAULT 'weekly'::text CHECK (newsletter_frequency = ANY (ARRAY['daily'::text, 'weekly'::text, 'monthly'::text, 'never'::text])),
  articles_per_page integer DEFAULT 20 CHECK (articles_per_page >= 10 AND articles_per_page <= 100),
  compact_view boolean DEFAULT false,
  show_images boolean DEFAULT true,
  timezone text DEFAULT 'Europe/Paris'::text,
  onboarding_completed boolean DEFAULT false,
  onboarding_step integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_settings_pkey PRIMARY KEY (id),
  CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);