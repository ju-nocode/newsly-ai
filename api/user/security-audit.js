import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
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

        // GET - Récupérer les événements de sécurité
        if (req.method === 'GET') {
            const { limit = 50 } = req.query;

            // Types d'activités liées à la sécurité
            const securityActivityTypes = [
                'login',
                'logout',
                'password_change',
                'password_reset_request',
                'email_change',
                'profile_update',
                'account_deleted',
                'session_created',
                'session_expired',
                'failed_login',
                'suspicious_activity'
            ];

            // Récupérer les logs d'activité filtrés
            console.log('🔍 [security-audit.js] Fetching logs for user:', user.id);
            console.log('🔍 [security-audit.js] Security activity types:', securityActivityTypes);

            const { data: activityLogs, error: logsError } = await supabaseAdmin
                .from('user_activity_log')
                .select('*')
                .eq('user_id', user.id)
                .in('activity_type', securityActivityTypes)
                .order('created_at', { ascending: false })
                .limit(parseInt(limit, 10));

            if (logsError) {
                console.error('❌ [security-audit.js] Fetch error:', logsError);
                return res.status(500).json({ error: 'Erreur lors de la récupération de l\'audit de sécurité' });
            }

            console.log('🔍 [security-audit.js] Logs fetched:', {
                count: activityLogs?.length || 0,
                logs: activityLogs
            });

            // Transformer les données pour le frontend
            const auditEvents = (activityLogs || []).map(log => {
                // Déterminer le type et l'icône
                let type = 'info';
                let icon = 'ℹ️';
                let title = 'Activité';
                let description = log.activity_type;

                switch (log.activity_type) {
                    case 'login':
                    case 'session_created':
                        type = 'success';
                        icon = '✅';
                        title = 'Connexion réussie';
                        description = 'Vous vous êtes connecté à votre compte';
                        break;

                    case 'logout':
                    case 'session_expired':
                        type = 'info';
                        icon = '🚪';
                        title = 'Déconnexion';
                        description = 'Vous vous êtes déconnecté de votre compte';
                        break;

                    case 'password_change':
                        type = 'warning';
                        icon = '🔒';
                        title = 'Changement de mot de passe';
                        description = 'Votre mot de passe a été modifié avec succès';
                        break;

                    case 'password_reset_request':
                        type = 'warning';
                        icon = '🔑';
                        title = 'Demande de réinitialisation';
                        description = 'Une demande de réinitialisation de mot de passe a été effectuée';
                        break;

                    case 'email_change':
                        type = 'warning';
                        icon = '📧';
                        title = 'Changement d\'email';
                        description = 'Votre adresse email a été modifiée';
                        break;

                    case 'profile_update':
                        type = 'info';
                        icon = '✏️';
                        title = 'Modification du profil';
                        description = 'Votre profil a été mis à jour';
                        break;

                    case 'account_deleted':
                        type = 'error';
                        icon = '🗑️';
                        title = 'Compte supprimé';
                        description = 'Votre compte a été supprimé';
                        break;

                    case 'failed_login':
                        type = 'error';
                        icon = '❌';
                        title = 'Tentative de connexion échouée';
                        description = 'Une tentative de connexion a échoué';
                        break;

                    case 'suspicious_activity':
                        type = 'error';
                        icon = '⚠️';
                        title = 'Activité suspecte détectée';
                        description = 'Une activité inhabituelle a été détectée sur votre compte';
                        break;
                }

                // Extraire les informations du contexte
                const context = log.context || {};

                // Essayer de récupérer l'IP depuis différentes sources
                let ip = 'Non disponible';
                if (context.ip) {
                    ip = context.ip;
                } else if (context.userAgent) {
                    // Pas d'IP stockée, on affiche juste "Non disponible"
                    ip = 'Non disponible';
                } else {
                    ip = 'Non disponible';
                }

                // Device type
                const device = log.device_type || context.device || 'desktop';

                // Platform info
                const platform = context.platform || '';

                return {
                    id: log.id,
                    type,
                    icon,
                    title,
                    description,
                    timestamp: log.created_at,
                    ip,
                    device,
                    platform,
                    activityType: log.activity_type,
                    context
                };
            });

            // Récupérer l'IP actuelle de l'utilisateur (optionnel)
            let currentIP = 'Non disponible';
            try {
                const ipHeader = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket.remoteAddress;
                currentIP = ipHeader ? ipHeader.split(',')[0].trim() : 'Non disponible';
            } catch (e) {
                console.warn('Impossible de récupérer l\'IP:', e);
            }

            return res.status(200).json({
                events: auditEvents,
                currentIP,
                totalEvents: auditEvents.length
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Security audit error:', error);
        return res.status(500).json({
            error: 'Erreur serveur',
            ...(process.env.NODE_ENV === 'development' && { details: error.message })
        });
    }
}
