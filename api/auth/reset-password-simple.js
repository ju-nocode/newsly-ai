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
    console.log('[DEBUG] Reset password - Request received');

    // Vérifier les variables d'environnement
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('[DEBUG] Env check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseServiceKey,
      url: supabaseUrl,
      keyLength: supabaseServiceKey?.length
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[ERROR] Missing environment variables');
      return res.status(500).json({
        error: 'Configuration serveur manquante',
        debug: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseServiceKey
        }
      });
    }

    const { accessToken, newPassword } = req.body;

    console.log('[DEBUG] Body received:', {
      hasToken: !!accessToken,
      hasPassword: !!newPassword,
      tokenLength: accessToken?.length,
      passwordLength: newPassword?.length
    });

    // Validation basique
    if (!accessToken || !newPassword) {
      return res.status(400).json({ error: 'Token et mot de passe requis' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' });
    }

    // Créer le client Supabase
    console.log('[DEBUG] Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Vérifier le token
    console.log('[DEBUG] Verifying token...');
    const { data: { user }, error: getUserError } = await supabase.auth.getUser(accessToken);

    if (getUserError) {
      console.error('[DEBUG] Get user error:', {
        message: getUserError.message,
        status: getUserError.status,
        name: getUserError.name
      });
      return res.status(401).json({
        error: 'Token de réinitialisation invalide ou expiré',
        debug: getUserError.message
      });
    }

    if (!user) {
      console.error('[DEBUG] No user found');
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    console.log('[DEBUG] User found:', user.id);

    // Mettre à jour le mot de passe
    console.log('[DEBUG] Updating password...');
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('[DEBUG] Update error:', {
        message: updateError.message,
        code: updateError.code
      });
      return res.status(500).json({
        error: 'Erreur lors de la mise à jour du mot de passe',
        debug: updateError.message
      });
    }

    console.log('[SUCCESS] Password updated for user:', user.id);

    return res.status(200).json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });

  } catch (error) {
    console.error('[EXCEPTION] Caught error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      error: 'Erreur serveur',
      debug: {
        name: error.name,
        message: error.message
      }
    });
  }
}
