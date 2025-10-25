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

        // GET - Récupérer les derniers logins (7 derniers jours)
        if (req.method === 'GET') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            // Récupérer uniquement les logins récents
            const { data: logins, error: loginsError } = await supabaseAdmin
                .from('user_activity_log')
                .select('*')
                .eq('user_id', user.id)
                .eq('activity_type', 'login')
                .gte('created_at', sevenDaysAgo.toISOString())
                .order('created_at', { ascending: false })
                .limit(10);

            if (loginsError) {
                console.error('Error fetching logins:', loginsError);
                return res.status(500).json({ error: 'Erreur lors de la récupération des connexions' });
            }

            // Récupérer tous les logouts récents
            const { data: logouts } = await supabaseAdmin
                .from('user_activity_log')
                .select('*')
                .eq('user_id', user.id)
                .eq('activity_type', 'logout')
                .gte('created_at', sevenDaysAgo.toISOString());

            // Récupérer le dernier global logout pour filtrer les sessions invalides
            const { data: globalLogouts } = await supabaseAdmin
                .from('user_global_logout')
                .select('logout_timestamp')
                .eq('user_id', user.id)
                .order('logout_timestamp', { ascending: false })
                .limit(1);

            const lastGlobalLogout = globalLogouts && globalLogouts.length > 0
                ? new Date(globalLogouts[0].logout_timestamp)
                : null;

            // Grouper par IP/Device pour éviter les doublons
            const seenSessions = new Set();
            const uniqueLogins = [];

            for (const login of logins) {
                const loginDate = new Date(login.created_at);

                // Filtrer les logins créés AVANT le dernier global logout
                if (lastGlobalLogout && loginDate < lastGlobalLogout) {
                    continue; // Session invalidée par global logout
                }

                const context = login.context || {};
                const sessionKey = `${context.ip || 'unknown'}_${login.device_type || 'desktop'}`;

                // Vérifier s'il y a un logout pour cette session (même IP/Device) APRÈS le login
                const hasLogout = logouts && logouts.some(logout => {
                    const logoutDate = new Date(logout.created_at);
                    const logoutContext = logout.context || {};
                    const logoutIP = logoutContext.ip || logout.ip;
                    const loginIP = context.ip;

                    // Un logout correspond si :
                    // - Il est postérieur au login
                    // - ET il vient de la même IP (ou IP similaire)
                    return logoutDate > loginDate &&
                           (logoutIP === loginIP || logoutIP === context.ip);
                });

                // Si un logout existe pour cette session, ne pas l'afficher
                if (hasLogout) {
                    continue;
                }

                if (!seenSessions.has(sessionKey)) {
                    seenSessions.add(sessionKey);
                    uniqueLogins.push({
                        id: login.id,
                        ip: context.ip || 'Non disponible',
                        location: context.location || null,
                        device: login.device_type || 'desktop',
                        userAgent: login.user_agent,
                        platform: context.platform || null,
                        lastActivity: login.created_at,
                        isCurrentSession: false
                    });
                }
            }

            // Identifier la session courante
            const currentIP = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.headers['x-real-ip'] || 'unknown';
            uniqueLogins.forEach(session => {
                if (session.ip === currentIP) {
                    session.isCurrentSession = true;
                }
            });

            return res.status(200).json({
                sessions: uniqueLogins,
                total: uniqueLogins.length
            });
        }

        // POST - Déconnecter tous les autres appareils
        if (req.method === 'POST') {
            const { logoutAll } = req.body;

            if (logoutAll) {
                try {
                    const logoutTimestamp = new Date().toISOString();

                    // Créer un enregistrement de global logout
                    await supabaseAdmin
                        .from('user_global_logout')
                        .insert({
                            user_id: user.id,
                            logout_timestamp: logoutTimestamp,
                            reason: 'Déconnexion volontaire de tous les appareils'
                        });

                    // Logger l'action dans activity log
                    await supabaseAdmin
                        .from('user_activity_log')
                        .insert({
                            user_id: user.id,
                            activity_type: 'logout',
                            context: {
                                forced: true,
                                global: true,
                                reason: 'Déconnexion de tous les appareils',
                                timestamp: logoutTimestamp
                            },
                            device_type: 'desktop',
                            created_at: logoutTimestamp
                        });

                    return res.status(200).json({
                        message: 'Tous les appareils seront déconnectés.',
                        requiresRelogin: true,
                        logoutTimestamp
                    });
                } catch (error) {
                    console.error('Error logging out all devices:', error);
                    return res.status(500).json({ error: 'Erreur lors de la déconnexion' });
                }
            }

            return res.status(400).json({ error: 'Action non spécifiée' });
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
