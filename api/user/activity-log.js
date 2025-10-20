import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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

        // GET - Récupérer les logs d'activité
        if (req.method === 'GET') {
            const { activity_type, limit = 100 } = req.query;

            let query = supabaseAdmin
                .from('user_activity_log')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(parseInt(limit));

            if (activity_type) {
                query = query.eq('activity_type', activity_type);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Activity log fetch error:', error);
                return res.status(500).json({ error: 'Erreur lors de la récupération des logs' });
            }

            return res.status(200).json({ logs: data || [] });
        }

        // POST - Ajouter un log d'activité
        if (req.method === 'POST') {
            const {
                activity_type,
                context,
                session_id,
                device_type,
                user_agent
            } = req.body;

            if (!activity_type) {
                return res.status(400).json({ error: 'activity_type requis' });
            }

            const logData = {
                user_id: user.id,
                activity_type,
                context: context || {},
                session_id: session_id || null,
                device_type: device_type || null,
                user_agent: user_agent || req.headers['user-agent'] || null,
                created_at: new Date().toISOString()
            };

            const { data, error } = await supabaseAdmin
                .from('user_activity_log')
                .insert(logData)
                .select()
                .single();

            if (error) {
                console.error('Activity log insert error:', error);
                return res.status(400).json({ error: error.message });
            }

            return res.status(201).json({ message: 'Log ajouté', log: data });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Activity log error:', error);
        return res.status(500).json({ error: 'Erreur serveur', details: error.message });
    }
}
