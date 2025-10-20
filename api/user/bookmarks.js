import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
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

        // GET - Récupérer tous les favoris
        if (req.method === 'GET') {
            const { folder } = req.query;

            let query = supabaseAdmin
                .from('user_bookmarks')
                .select('*')
                .eq('user_id', user.id)
                .order('bookmarked_at', { ascending: false });

            if (folder) {
                query = query.eq('folder', folder);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Bookmarks fetch error:', error);
                return res.status(500).json({ error: 'Erreur lors de la récupération des favoris' });
            }

            return res.status(200).json({ bookmarks: data || [] });
        }

        // POST - Ajouter un favori
        if (req.method === 'POST') {
            const {
                article_id,
                article_url,
                article_title,
                article_category,
                article_source,
                article_image_url,
                article_published_at,
                folder,
                tags,
                notes
            } = req.body;

            if (!article_id || !article_url) {
                return res.status(400).json({ error: 'article_id et article_url requis' });
            }

            const bookmarkData = {
                user_id: user.id,
                article_id,
                article_url,
                article_title: article_title || null,
                article_category: article_category || null,
                article_source: article_source || null,
                article_image_url: article_image_url || null,
                article_published_at: article_published_at || null,
                folder: folder || 'default',
                tags: tags || [],
                notes: notes || null,
                bookmarked_at: new Date().toISOString()
            };

            const { data, error } = await supabaseAdmin
                .from('user_bookmarks')
                .insert(bookmarkData)
                .select()
                .single();

            if (error) {
                console.error('Bookmark insert error:', error);
                return res.status(400).json({ error: error.message });
            }

            return res.status(201).json({ message: 'Favori ajouté', bookmark: data });
        }

        // DELETE - Supprimer un favori
        if (req.method === 'DELETE') {
            const { article_id } = req.query;

            if (!article_id) {
                return res.status(400).json({ error: 'article_id requis' });
            }

            const { error } = await supabaseAdmin
                .from('user_bookmarks')
                .delete()
                .eq('user_id', user.id)
                .eq('article_id', article_id);

            if (error) {
                console.error('Bookmark delete error:', error);
                return res.status(400).json({ error: error.message });
            }

            return res.status(200).json({ message: 'Favori supprimé' });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Bookmarks error:', error);
        return res.status(500).json({ error: 'Erreur serveur', details: error.message });
    }
}
