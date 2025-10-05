-- ================================================
-- PARTICLES CONFIGURATION TABLE
-- ================================================

-- Create particles_config table to store user-specific particle settings
CREATE TABLE IF NOT EXISTS public.particles_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure one config per user
    UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_particles_config_user_id ON public.particles_config(user_id);

-- Enable Row Level Security
ALTER TABLE public.particles_config ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own particles config
CREATE POLICY "Users can read own particles config"
    ON public.particles_config
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own particles config
CREATE POLICY "Users can insert own particles config"
    ON public.particles_config
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own particles config
CREATE POLICY "Users can update own particles config"
    ON public.particles_config
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own particles config
CREATE POLICY "Users can delete own particles config"
    ON public.particles_config
    FOR DELETE
    USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_particles_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on config changes
CREATE TRIGGER particles_config_updated_at
    BEFORE UPDATE ON public.particles_config
    FOR EACH ROW
    EXECUTE FUNCTION update_particles_config_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.particles_config TO authenticated;

-- ================================================
-- EXEMPLE D'UTILISATION
-- ================================================

-- Insérer une config pour un utilisateur
-- INSERT INTO public.particles_config (user_id, config)
-- VALUES (
--     'USER_UUID_HERE',
--     '{"particles": {"number": {"value": 250}, "color": {"value": "#fffe7a"}}}'::jsonb
-- );

-- Récupérer la config d'un utilisateur
-- SELECT config FROM public.particles_config WHERE user_id = 'USER_UUID_HERE';

-- Mettre à jour la config
-- UPDATE public.particles_config
-- SET config = '{"particles": {"number": {"value": 300}}}'::jsonb
-- WHERE user_id = 'USER_UUID_HERE';
