import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email requis' });
  }

  try {
    // Vérifier si l'utilisateur existe
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
      console.error('Error listing users:', userError);
      return res.status(500).json({ error: 'Erreur lors de la vérification du compte' });
    }

    const userExists = userData.users.some(user => user.email === email);

    if (!userExists) {
      // Pour des raisons de sécurité, on renvoie le même message même si le compte n'existe pas
      return res.status(200).json({
        success: true,
        message: 'Si ce compte existe, un email de réinitialisation a été envoyé.'
      });
    }

    // Générer un lien de réinitialisation de mot de passe
    const redirectUrl = process.env.NODE_ENV === 'production'
      ? 'https://prod-julien.vercel.app/reset-password.html'
      : 'http://localhost:3000/reset-password.html';

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      console.error('Error sending reset email:', error);
      return res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email' });
    }

    return res.status(200).json({
      success: true,
      message: 'Un email de réinitialisation a été envoyé à votre adresse.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
