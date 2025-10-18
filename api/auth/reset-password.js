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
    const { accessToken, newPassword } = req.body;

    // Validation
    if (!accessToken || !newPassword) {
      return res.status(400).json({ error: 'Token et mot de passe requis' });
    }

    // Validation du mot de passe
    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        error: 'Le mot de passe doit contenir au moins 8 caractères'
      });
    }

    // Créer un client Supabase avec le service key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Vérifier et décoder le token de récupération
    const { data: { user }, error: getUserError } = await supabase.auth.getUser(accessToken);

    if (getUserError || !user) {
      console.error('[SECURITY] Invalid recovery token');
      return res.status(401).json({
        error: 'Token de réinitialisation invalide ou expiré'
      });
    }

    // Mettre à jour le mot de passe avec le service key
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
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
    console.error('[SECURITY] Reset password exception:', error.name);
    return res.status(500).json({
      error: 'Une erreur est survenue. Veuillez réessayer plus tard.'
    });
  }
}
