import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email requis' });
        }

        // Validation email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Email invalide' });
        }

        // Utiliser le Service Role pour trouver et modifier l'utilisateur
        const supabaseAdmin = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // Chercher l'utilisateur par email
        const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();

        if (listError) {
            console.error('List users error:', listError);
            return res.status(500).json({ error: 'Erreur serveur' });
        }

        const user = users.users.find(u => u.email === email);

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur introuvable' });
        }

        // Nettoyer l'avatar
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            {
                user_metadata: {
                    ...user.user_metadata,
                    avatar_url: ''
                }
            }
        );

        if (error) {
            console.error('Update error:', error);
            return res.status(500).json({ error: 'Erreur lors de la mise à jour' });
        }

        return res.status(200).json({
            message: 'Avatar nettoyé avec succès. Veuillez vous reconnecter.'
        });

    } catch (error) {
        console.error('Reset avatar error:', error);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
}
