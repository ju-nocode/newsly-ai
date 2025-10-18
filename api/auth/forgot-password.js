import { createClient } from '@supabase/supabase-js';
import { securityHeaders, validateEmail, rateLimit } from '../_middleware/security.js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

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
    // Rate limiting par IP - 3 tentatives par 5 minutes
    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const rateLimitResult = rateLimit(clientIP, 3, 300000);

    if (!rateLimitResult.allowed) {
      return res.status(429).json({
        error: 'Trop de tentatives. Réessayez dans 5 minutes.'
      });
    }

    const { email } = req.body;

    // Validation de base
    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }

    // Limitation de longueur pour éviter DoS
    if (email.length > 255) {
      return res.status(400).json({ error: 'Email trop long' });
    }

    // Validation email avec fonction sécurisée
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Email invalide' });
    }

    // Normaliser l'email (lowercase, trim)
    const normalizedEmail = email.toLowerCase().trim();

    // Créer le client Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // SÉCURITÉ: On utilise resetPasswordForEmail directement
    // Supabase gère en interne si l'utilisateur existe ou non
    // Cela évite l'énumération d'utilisateurs et les timing attacks
    const redirectUrl = process.env.RESET_PASSWORD_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://prod-julien.vercel.app/reset-password.html'
        : 'http://localhost:3000/reset-password.html');

    // Délai artificiel pour éviter les timing attacks (toujours 1-2 secondes)
    const delay = 1000 + Math.random() * 1000;

    // Appel à Supabase (qui gère la vérification interne)
    const { data, error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: redirectUrl,
    });

    // Debug: Logger les informations pour diagnostiquer
    console.log('[DEBUG] Reset password request for email:', normalizedEmail);
    console.log('[DEBUG] Redirect URL:', redirectUrl);
    console.log('[DEBUG] Supabase response data:', data);
    if (error) {
      console.error('[DEBUG] Supabase error:', error);
      console.error('[DEBUG] Error message:', error.message);
      console.error('[DEBUG] Error status:', error.status);
    }

    // Attendre le délai même en cas d'erreur (timing attack prevention)
    await new Promise(resolve => setTimeout(resolve, delay));

    // SÉCURITÉ: Toujours renvoyer le même message de succès
    // Même si l'email n'existe pas, même si Supabase a une erreur
    // Cela empêche l'énumération d'utilisateurs
    if (error) {
      // Logger l'erreur côté serveur (sans exposer au client)
      console.error('[SECURITY] Password reset error for IP:', clientIP, '| Error code:', error.code);
    }

    // Message générique pour tous les cas
    return res.status(200).json({
      success: true,
      message: 'Si ce compte existe, un email de réinitialisation a été envoyé.'
    });

  } catch (error) {
    // Logger l'erreur sans détails sensibles
    console.error('[SECURITY] Forgot password exception:', error.name);

    // Message générique pour toutes les erreurs serveur
    return res.status(500).json({
      error: 'Une erreur est survenue. Veuillez réessayer plus tard.'
    });
  }
}
