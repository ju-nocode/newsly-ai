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

        // GET - Récupérer les préférences de flux
        if (req.method === 'GET') {
            const { data: preferences, error } = await supabaseAdmin
                .from('user_feed_preferences')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Feed preferences fetch error:', error);
                return res.status(500).json({ error: 'Erreur lors de la récupération des préférences' });
            }

            // Si pas de préférences, retourner les valeurs par défaut
            if (!preferences) {
                return res.status(200).json({
                    followed_categories: ['general'],
                    followed_sources: [],
                    blocked_sources: [],
                    interest_keywords: [],
                    blocked_keywords: [],
                    preferred_countries: [],
                    excluded_countries: [],
                    default_sort: 'relevance',
                    max_article_age_hours: 48
                });
            }

            return res.status(200).json(preferences);
        }

        // POST/PUT - Mettre à jour les préférences
        if (req.method === 'POST' || req.method === 'PUT') {
            const {
                followed_categories,
                followed_sources,
                blocked_sources,
                interest_keywords,
                blocked_keywords,
                preferred_countries,
                excluded_countries,
                default_sort,
                max_article_age_hours
            } = req.body;

            // Validation
            if (default_sort && !['latest', 'relevance', 'popularity', 'personalized'].includes(default_sort)) {
                return res.status(400).json({ error: 'Tri par défaut invalide' });
            }

            if (max_article_age_hours !== undefined && (max_article_age_hours < 1 || max_article_age_hours > 168)) {
                return res.status(400).json({ error: 'Âge max des articles doit être entre 1 et 168 heures' });
            }

            // Préparer les données à mettre à jour
            const updateData = {
                user_id: user.id,
                updated_at: new Date().toISOString()
            };

            if (followed_categories !== undefined) updateData.followed_categories = followed_categories;
            if (followed_sources !== undefined) updateData.followed_sources = followed_sources;
            if (blocked_sources !== undefined) updateData.blocked_sources = blocked_sources;
            if (interest_keywords !== undefined) updateData.interest_keywords = interest_keywords;
            if (blocked_keywords !== undefined) updateData.blocked_keywords = blocked_keywords;
            if (preferred_countries !== undefined) updateData.preferred_countries = preferred_countries;
            if (excluded_countries !== undefined) updateData.excluded_countries = excluded_countries;
            if (default_sort !== undefined) updateData.default_sort = default_sort;
            if (max_article_age_hours !== undefined) updateData.max_article_age_hours = max_article_age_hours;

            // Upsert (insert ou update)
            const { data, error } = await supabaseAdmin
                .from('user_feed_preferences')
                .upsert(updateData, {
                    onConflict: 'user_id',
                    ignoreDuplicates: false
                })
                .select()
                .single();

            if (error) {
                console.error('Feed preferences update error:', error);
                return res.status(400).json({ error: error.message });
            }

            return res.status(200).json({
                message: 'Préférences de flux mises à jour',
                preferences: data
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Feed preferences error:', error);
        return res.status(500).json({
            error: 'Erreur serveur',
            details: error.message
        });
    }
}
