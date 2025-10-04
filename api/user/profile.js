import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
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

        // GET - Récupérer le profil
        if (req.method === 'GET') {
            return res.status(200).json({
                id: user.id,
                email: user.email,
                username: user.user_metadata?.username || user.user_metadata?.full_name || user.user_metadata?.display_name || user.email.split('@')[0],
                created_at: user.created_at
            });
        }

        // PUT - Mettre à jour le profil
        if (req.method === 'PUT') {
            const { username } = req.body;

            const { data, error } = await supabase.auth.updateUser({
                data: {
                    username,
                    full_name: username,
                    display_name: username
                }
            });

            if (error) {
                return res.status(400).json({ error: error.message });
            }

            return res.status(200).json({
                message: 'Profil mis à jour',
                user: data.user
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Profile error:', error);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
}
