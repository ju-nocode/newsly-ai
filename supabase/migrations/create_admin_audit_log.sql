-- Table pour logger toutes les actions administratives
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    admin_email TEXT NOT NULL,
    action TEXT NOT NULL, -- 'DELETE_USER', 'UPDATE_ROLE', 'VIEW_USERS', etc.
    target_user_id UUID,
    target_user_email TEXT,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB, -- Pour données additionnelles
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target_user ON admin_audit_log(target_user_id);

-- RLS (Row Level Security)
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Seuls les admins peuvent voir les logs
CREATE POLICY "Admins can view audit logs"
    ON admin_audit_log
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Policy: Les admins peuvent insérer des logs (via service role key uniquement)
CREATE POLICY "Service role can insert audit logs"
    ON admin_audit_log
    FOR INSERT
    WITH CHECK (true);

-- Ajouter un commentaire pour documentation
COMMENT ON TABLE admin_audit_log IS 'Log de toutes les actions administratives pour traçabilité et sécurité';
COMMENT ON COLUMN admin_audit_log.action IS 'Type d''action: DELETE_USER, UPDATE_ROLE, VIEW_USERS, etc.';
COMMENT ON COLUMN admin_audit_log.metadata IS 'Données JSON additionnelles selon le type d''action';
