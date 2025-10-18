import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // CORS simple
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vérifier les variables d'environnement
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[ERROR] Missing environment variables');
      return res.status(500).json({
        error: 'Configuration serveur manquante'
      });
    }

    const { accessToken, newPassword } = req.body;

    // Validation basique
    if (!accessToken || !newPassword) {
      return res.status(400).json({ error: 'Token et mot de passe requis' });
    }

    if (newPassword.length < 12) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 12 caractères' });
    }

    if (newPassword.length > 100) {
      return res.status(400).json({ error: 'Le mot de passe est trop long (maximum 100 caractères)' });
    }

    // Créer le client Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Vérifier le token
    const { data: { user }, error: getUserError } = await supabase.auth.getUser(accessToken);

    if (getUserError || !user) {
      console.error('[SECURITY] Invalid recovery token attempt');
      return res.status(401).json({
        error: 'Token de réinitialisation invalide ou expiré'
      });
    }

    // Mettre à jour le mot de passe
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('[SECURITY] Password update failed:', updateError.code);
      return res.status(500).json({
        error: 'Erreur lors de la mise à jour du mot de passe'
      });
    }

    console.log('[SECURITY] Password reset successful');

    return res.status(200).json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });

  } catch (error) {
    console.error('[SECURITY] Reset password exception:', error.name);
    return res.status(500).json({
      error: 'Erreur serveur'
    });
  }
}
