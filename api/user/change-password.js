import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Extraire le token d'authentification
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        const token = authHeader.split(' ')[1];

        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );

        // Vérifier le token et récupérer l'utilisateur
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ error: 'Token invalide' });
        }

        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ error: 'Nouveau mot de passe requis' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' });
        }

        if (newPassword.length > 100) {
            return res.status(400).json({ error: 'Le mot de passe est trop long (max 100 caractères)' });
        }

        // Utiliser le Service Role pour mettre à jour le mot de passe
        const supabaseAdmin = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { password: newPassword }
        );

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({
            message: 'Mot de passe mis à jour avec succès',
            user: data.user
        });

    } catch (error) {
        console.error('Change password error:', error);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
}
