import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
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

        const supabaseAdmin = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // GET - Récupérer les préférences de recherche
        if (req.method === 'GET') {
            const { data: preferences, error } = await supabaseAdmin
                .from('user_search_preferences')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Search preferences fetch error:', error);
                return res.status(500).json({ error: 'Erreur lors de la récupération des préférences' });
            }

            // Si pas de préférences, retourner les valeurs par défaut
            if (!preferences) {
                return res.status(200).json({
                    search_history: [],
                    favorite_commands: [],
                    custom_shortcuts: {},
                    command_stats: {},
                    preferences: {
                        enableShortcuts: true,
                        maxHistoryItems: 10,
                        fuzzySearchEnabled: true,
                        showFavoritesFirst: true
                    }
                });
            }

            return res.status(200).json(preferences);
        }

        // POST/PUT - Mettre à jour les préférences
        if (req.method === 'POST' || req.method === 'PUT') {
            const {
                search_history,
                favorite_commands,
                custom_shortcuts,
                command_stats,
                preferences
            } = req.body;

            // Validation
            if (search_history && !Array.isArray(search_history)) {
                return res.status(400).json({ error: 'search_history doit être un tableau' });
            }

            if (favorite_commands && !Array.isArray(favorite_commands)) {
                return res.status(400).json({ error: 'favorite_commands doit être un tableau' });
            }

            if (custom_shortcuts && typeof custom_shortcuts !== 'object') {
                return res.status(400).json({ error: 'custom_shortcuts doit être un objet' });
            }

            if (command_stats && typeof command_stats !== 'object') {
                return res.status(400).json({ error: 'command_stats doit être un objet' });
            }

            if (preferences && typeof preferences !== 'object') {
                return res.status(400).json({ error: 'preferences doit être un objet' });
            }

            // Préparer les données à mettre à jour
            const updateData = {
                user_id: user.id,
                updated_at: new Date().toISOString()
            };

            if (search_history !== undefined) updateData.search_history = search_history;
            if (favorite_commands !== undefined) updateData.favorite_commands = favorite_commands;
            if (custom_shortcuts !== undefined) updateData.custom_shortcuts = custom_shortcuts;
            if (command_stats !== undefined) updateData.command_stats = command_stats;
            if (preferences !== undefined) updateData.preferences = preferences;

            // Upsert (insert ou update)
            const { data, error } = await supabaseAdmin
                .from('user_search_preferences')
                .upsert(updateData, {
                    onConflict: 'user_id',
                    ignoreDuplicates: false
                })
                .select()
                .single();

            if (error) {
                console.error('Search preferences update error:', error);
                return res.status(400).json({ error: error.message });
            }

            return res.status(200).json({
                message: 'Préférences de recherche mises à jour',
                preferences: data
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Search preferences error:', error);
        return res.status(500).json({
            error: 'Erreur serveur',
            details: error.message
        });
    }
}
