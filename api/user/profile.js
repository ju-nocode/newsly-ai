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
                full_name: user.user_metadata?.full_name || user.user_metadata?.username || '',
                phone: user.user_metadata?.phone || '',
                bio: user.user_metadata?.bio || '',
                avatar_url: user.user_metadata?.avatar_url || '',
                created_at: user.created_at
            });
        }

        // PUT - Mettre à jour le profil
        if (req.method === 'PUT') {
            const { username, full_name, phone, bio, avatar_url } = req.body;

            // Validation des données
            if (username !== undefined) {
                if (typeof username !== 'string' || username.trim().length < 1 || username.trim().length > 50) {
                    return res.status(400).json({ error: 'Username invalide (1-50 caractères)' });
                }
            }

            if (full_name !== undefined) {
                if (typeof full_name !== 'string' || full_name.length > 100) {
                    return res.status(400).json({ error: 'Nom complet invalide (max 100 caractères)' });
                }
            }

            if (phone !== undefined && phone.length > 20) {
                return res.status(400).json({ error: 'Numéro de téléphone invalide (max 20 caractères)' });
            }

            if (bio !== undefined && bio.length > 500) {
                return res.status(400).json({ error: 'Bio trop longue (max 500 caractères)' });
            }

            if (avatar_url !== undefined && avatar_url.length > 0) {
                // Accepter les URLs http/https et les data URLs (base64)
                const isValidUrl = avatar_url.match(/^https?:\/\/.+/) || avatar_url.match(/^data:image\/.+;base64,.+/);
                if (avatar_url.length > 2000000 || !isValidUrl) {
                    return res.status(400).json({ error: 'URL d\'avatar invalide (max 2MB, format URL ou base64)' });
                }
            }

            const updateData = {};

            if (username !== undefined) {
                updateData.username = username.trim();
                updateData.display_name = username.trim();
            }

            if (full_name !== undefined) {
                updateData.full_name = full_name.trim();
            }

            if (phone !== undefined) {
                updateData.phone = phone.trim();
            }

            if (bio !== undefined) {
                updateData.bio = bio.trim();
            }

            if (avatar_url !== undefined) {
                updateData.avatar_url = avatar_url.trim();
            }

            // Utiliser le Service Role pour mettre à jour les métadonnées
            const supabaseAdmin = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_SERVICE_ROLE_KEY
            );

            const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
                user.id,
                { user_metadata: updateData }
            );

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
