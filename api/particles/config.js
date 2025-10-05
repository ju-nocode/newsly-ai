import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Extract authentication token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('[Particles API] No auth header');
            return res.status(401).json({ error: 'Non authentifié' });
        }

        const token = authHeader.split(' ')[1];

        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
            console.error('[Particles API] Missing environment variables');
            return res.status(500).json({ error: 'Configuration serveur manquante' });
        }

        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );

        // Verify token and get user
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            console.log('[Particles API] Auth error:', authError?.message);
            return res.status(401).json({ error: 'Token invalide' });
        }

        console.log('[Particles API] User authenticated:', user.id);

        // GET - Get particles config
        if (req.method === 'GET') {
            const { data, error } = await supabase
                .from('particles_config')
                .select('config')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                console.error('Get particles config error:', error);
                return res.status(500).json({ error: 'Erreur de récupération de la configuration' });
            }

            // Return config or null if not found
            return res.status(200).json({
                config: data?.config || null
            });
        }

        // POST - Save/Update particles config
        if (req.method === 'POST') {
            const { config } = req.body;

            if (!config || typeof config !== 'object') {
                return res.status(400).json({ error: 'Configuration invalide' });
            }

            // Check if config exists
            const { data: existing } = await supabase
                .from('particles_config')
                .select('id')
                .eq('user_id', user.id)
                .single();

            let result;

            if (existing) {
                // Update existing config
                result = await supabase
                    .from('particles_config')
                    .update({
                        config,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', user.id)
                    .select()
                    .single();
            } else {
                // Insert new config
                result = await supabase
                    .from('particles_config')
                    .insert({
                        user_id: user.id,
                        config
                    })
                    .select()
                    .single();
            }

            if (result.error) {
                console.error('Save particles config error:', result.error);
                return res.status(500).json({
                    error: 'Erreur de sauvegarde de la configuration',
                    details: result.error.message
                });
            }

            return res.status(200).json({
                success: true,
                config: result.data?.config || config
            });
        }

        return res.status(405).json({ error: 'Méthode non autorisée' });

    } catch (error) {
        console.error('Particles config API error:', error);
        return res.status(500).json({
            error: 'Erreur serveur',
            details: error.message
        });
    }
}
