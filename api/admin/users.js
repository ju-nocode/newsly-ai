import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
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

        // Utiliser le service role pour récupérer le profil de l'utilisateur connecté
        const supabaseAdmin = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // Vérifier si l'utilisateur est admin
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (profileError || !profile || !profile.is_admin) {
            return res.status(403).json({ error: 'Accès non autorisé - Admin uniquement' });
        }

        // GET - Récupérer la liste des utilisateurs (admin only)
        if (req.method === 'GET') {
            const { data: users, error: usersError } = await supabaseAdmin
                .from('profiles')
                .select('id, email, username, full_name, is_admin, created_at')
                .order('created_at', { ascending: false });

            if (usersError) {
                console.error('Users fetch error:', usersError);
                return res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
            }

            // Formater les données pour inclure le rôle
            const formattedUsers = users.map(u => ({
                ...u,
                role: u.is_admin ? 'admin' : 'user'
            }));

            return res.status(200).json({ users: formattedUsers });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Admin users API error:', error);
        return res.status(500).json({
            error: 'Erreur serveur',
            details: error.message
        });
    }
}
