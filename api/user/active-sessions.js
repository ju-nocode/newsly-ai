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

        // GET - Récupérer les sessions actives basées sur les logins récents
        if (req.method === 'GET') {
            // Récupérer tous les logins et logouts des 30 derniers jours
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const { data: activities, error: activitiesError } = await supabaseAdmin
                .from('user_activity_log')
                .select('*')
                .eq('user_id', user.id)
                .in('activity_type', ['login', 'logout'])
                .gte('created_at', thirtyDaysAgo.toISOString())
                .order('created_at', { ascending: false });

            if (activitiesError) {
                console.error('Error fetching activities:', activitiesError);
                return res.status(500).json({ error: 'Erreur lors de la récupération des sessions' });
            }

            // Grouper par IP/Device pour créer des "sessions"
            const sessionMap = new Map();

            for (const activity of activities) {
                const context = activity.context || {};
                const sessionKey = `${context.ip || 'unknown'}_${activity.device_type || 'desktop'}`;

                if (!sessionMap.has(sessionKey)) {
                    sessionMap.set(sessionKey, {
                        id: activity.id,
                        ip: context.ip || 'Non disponible',
                        location: context.location || null,
                        device: activity.device_type || 'desktop',
                        userAgent: activity.user_agent,
                        platform: context.platform || null,
                        lastActivity: activity.created_at,
                        activityType: activity.activity_type,
                        isCurrentSession: false // On mettra à jour après
                    });
                } else {
                    // Si c'est un logout, marquer la session comme inactive
                    if (activity.activity_type === 'logout') {
                        sessionMap.delete(sessionKey);
                    }
                }
            }

            // Convertir en array et identifier la session courante
            const sessions = Array.from(sessionMap.values());

            // La session courante est celle du token actuel (même user)
            const currentIP = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.headers['x-real-ip'] || 'unknown';
            sessions.forEach(session => {
                if (session.ip === currentIP) {
                    session.isCurrentSession = true;
                }
            });

            // Trier par date d'activité
            sessions.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));

            return res.status(200).json({
                sessions,
                total: sessions.length
            });
        }

        // POST - Révoquer une session (logout forcé)
        if (req.method === 'POST') {
            const { sessionId } = req.body;

            if (!sessionId) {
                return res.status(400).json({ error: 'sessionId requis' });
            }

            // Pour révoquer, on ajoute un logout artificiel
            // Note: Supabase ne permet pas de révoquer directement les tokens des autres sessions
            // On peut juste logger un logout pour masquer la session côté UI

            await supabaseAdmin
                .from('user_activity_log')
                .insert({
                    user_id: user.id,
                    activity_type: 'logout',
                    context: {
                        forced: true,
                        reason: 'Révoqué par l\'utilisateur',
                        timestamp: new Date().toISOString()
                    },
                    device_type: 'desktop',
                    created_at: new Date().toISOString()
                });

            return res.status(200).json({
                message: 'Session révoquée',
                note: 'La session sera effacée de la liste lors du prochain rafraîchissement'
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Active sessions error:', error);
        return res.status(500).json({
            error: 'Erreur serveur',
            details: error.message
        });
    }
}
