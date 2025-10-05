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
        // Vérifier l'authentification admin
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        const token = authHeader.split(' ')[1];

        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ error: 'Token invalide' });
        }

        // Vérifier que l'utilisateur est admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (!profile?.is_admin) {
            return res.status(403).json({ error: 'Accès refusé - Admin uniquement' });
        }

        // Utiliser le Service Role pour accéder à auth.users
        const supabaseAdmin = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // Récupérer tous les utilisateurs
        const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

        if (usersError) {
            return res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
        }

        let migrated = 0;
        let errors = 0;

        // Pour chaque utilisateur, synchroniser les données
        for (const authUser of users) {
            try {
                const metadata = authUser.user_metadata || {};

                // Upsert dans profiles
                const { error: upsertError } = await supabaseAdmin
                    .from('profiles')
                    .upsert({
                        id: authUser.id,
                        email: authUser.email,
                        username: metadata.username || metadata.full_name || metadata.display_name || authUser.email.split('@')[0],
                        full_name: metadata.full_name || metadata.username || metadata.display_name || '',
                        phone: metadata.phone || null,
                        bio: metadata.bio || null,
                        avatar_url: metadata.avatar_url || null,
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'id',
                        ignoreDuplicates: false
                    });

                if (upsertError) {
                    console.error(`Erreur pour user ${authUser.id}:`, upsertError);
                    errors++;
                } else {
                    migrated++;
                }
            } catch (error) {
                console.error(`Erreur pour user ${authUser.id}:`, error);
                errors++;
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Migration terminée',
            stats: {
                total: users.length,
                migrated,
                errors
            }
        });

    } catch (error) {
        console.error('Migration error:', error);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
}
