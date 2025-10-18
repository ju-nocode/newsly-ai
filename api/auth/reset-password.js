import { createClient } from '@supabase/supabase-js';
import { securityHeaders, validatePassword } from '../_middleware/security.js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  // CORS sécurisé
  const origin = req.headers.origin;
  securityHeaders(res, origin);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('[DEBUG] Reset password - Request received');
    console.log('[DEBUG] Body keys:', Object.keys(req.body));

    const { accessToken, newPassword } = req.body;

    // Validation
    if (!accessToken || !newPassword) {
      console.error('[DEBUG] Missing fields:', { hasToken: !!accessToken, hasPassword: !!newPassword });
      return res.status(400).json({ error: 'Token et mot de passe requis' });
    }

    console.log('[DEBUG] Token length:', accessToken.length);
    console.log('[DEBUG] Password length:', newPassword.length);

    // Validation du mot de passe (Supabase exige minimum 12 caractères)
    if (newPassword.length < 12) {
      console.error('[DEBUG] Password validation failed');
      return res.status(400).json({
        error: 'Le mot de passe doit contenir au moins 12 caractères'
      });
    }

    if (newPassword.length > 100) {
      return res.status(400).json({
        error: 'Le mot de passe est trop long (maximum 100 caractères)'
      });
    }

    console.log('[DEBUG] Creating Supabase client...');
    console.log('[DEBUG] Supabase URL:', supabaseUrl);
    console.log('[DEBUG] Has Service Key:', !!supabaseServiceKey);

    // Créer un client Supabase avec le service key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('[DEBUG] Getting user from token...');

    // Vérifier et décoder le token de récupération
    const { data: { user }, error: getUserError } = await supabase.auth.getUser(accessToken);

    console.log('[DEBUG] Get user result:', { hasUser: !!user, hasError: !!getUserError });

    if (getUserError) {
      console.error('[DEBUG] Get user error:', getUserError);
      console.error('[DEBUG] Error message:', getUserError.message);
      console.error('[DEBUG] Error status:', getUserError.status);
    }

    if (getUserError || !user) {
      console.error('[SECURITY] Invalid recovery token');
      return res.status(401).json({
        error: 'Token de réinitialisation invalide ou expiré'
      });
    }

    console.log('[DEBUG] User found, ID:', user.id);
    console.log('[DEBUG] Updating password...');

    // Mettre à jour le mot de passe avec le service key
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('[DEBUG] Update error:', updateError);
      console.error('[DEBUG] Update error message:', updateError.message);
      console.error('[DEBUG] Update error code:', updateError.code);
      console.error('[SECURITY] Password update error:', updateError.code);
      return res.status(500).json({
        error: 'Erreur lors de la réinitialisation du mot de passe'
      });
    }

    // Logger l'action (sans détails sensibles)
    console.log('[SECURITY] Password reset successful for user ID:', user.id);

    return res.status(200).json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });

  } catch (error) {
    console.error('[DEBUG] Exception caught:', error);
    console.error('[DEBUG] Exception name:', error.name);
    console.error('[DEBUG] Exception message:', error.message);
    console.error('[DEBUG] Exception stack:', error.stack);
    console.error('[SECURITY] Reset password exception:', error.name);
    return res.status(500).json({
      error: 'Une erreur est survenue. Veuillez réessayer plus tard.'
    });
  }
}
