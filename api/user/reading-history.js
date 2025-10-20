import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        const token = authHeader.split(' ')[1];
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ error: 'Token invalide' });
        }

        const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

        // GET - Récupérer l'historique
        if (req.method === 'GET') {
            const { limit = 50 } = req.query;

            const { data, error } = await supabaseAdmin
                .from('user_reading_history')
                .select('*')
                .eq('user_id', user.id)
                .order('opened_at', { ascending: false })
                .limit(parseInt(limit));

            if (error) {
                console.error('Reading history fetch error:', error);
                return res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique' });
            }

            return res.status(200).json({ history: data || [] });
        }

        // POST - Ajouter une entrée dans l'historique
        if (req.method === 'POST') {
            const {
                article_id,
                article_url,
                article_title,
                article_category,
                article_source,
                read_duration_seconds,
                scroll_depth_percent,
                completed,
                bookmarked,
                liked,
                shared,
                device_type
            } = req.body;

            if (!article_id || !article_url) {
                return res.status(400).json({ error: 'article_id et article_url requis' });
            }

            const historyData = {
                user_id: user.id,
                article_id,
                article_url,
                article_title: article_title || null,
                article_category: article_category || null,
                article_source: article_source || null,
                read_duration_seconds: read_duration_seconds || 0,
                scroll_depth_percent: scroll_depth_percent || 0,
                completed: completed || false,
                bookmarked: bookmarked || false,
                liked: liked || false,
                shared: shared || false,
                device_type: device_type || null,
                opened_at: new Date().toISOString()
            };

            const { data, error } = await supabaseAdmin
                .from('user_reading_history')
                .insert(historyData)
                .select()
                .single();

            if (error) {
                console.error('Reading history insert error:', error);
                return res.status(400).json({ error: error.message });
            }

            return res.status(201).json({ message: 'Historique ajouté', history: data });
        }

        // PUT - Mettre à jour une entrée (durée de lecture, scroll, etc.)
        if (req.method === 'PUT') {
            const {
                article_id,
                read_duration_seconds,
                scroll_depth_percent,
                completed,
                bookmarked,
                liked,
                shared
            } = req.body;

            if (!article_id) {
                return res.status(400).json({ error: 'article_id requis' });
            }

            const updateData = {
                updated_at: new Date().toISOString()
            };

            if (read_duration_seconds !== undefined) updateData.read_duration_seconds = read_duration_seconds;
            if (scroll_depth_percent !== undefined) updateData.scroll_depth_percent = scroll_depth_percent;
            if (completed !== undefined) updateData.completed = completed;
            if (bookmarked !== undefined) updateData.bookmarked = bookmarked;
            if (liked !== undefined) updateData.liked = liked;
            if (shared !== undefined) updateData.shared = shared;

            const { data, error } = await supabaseAdmin
                .from('user_reading_history')
                .update(updateData)
                .eq('user_id', user.id)
                .eq('article_id', article_id)
                .order('opened_at', { ascending: false })
                .limit(1)
                .select()
                .single();

            if (error) {
                console.error('Reading history update error:', error);
                return res.status(400).json({ error: error.message });
            }

            return res.status(200).json({ message: 'Historique mis à jour', history: data });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Reading history error:', error);
        return res.status(500).json({ error: 'Erreur serveur', details: error.message });
    }
}
