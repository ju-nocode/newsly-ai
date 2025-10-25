import { createClient } from '@supabase/supabase-js';
import { getIPGeolocation } from '../../utils/geolocation.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
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

        // Supprimer tous les logs d'activité de l'utilisateur
        const { error } = await supabaseAdmin
            .from('user_activity_log')
            .delete()
            .eq('user_id', user.id);

        if (error) {
            console.error('Activity log delete error:', error);
            return res.status(500).json({ error: 'Erreur lors de la suppression des logs' });
        }

        // Créer un nouveau login event pour la session actuelle
        const clientIP = req.headers['x-forwarded-for']?.split(',')[0].trim()
                      || req.headers['x-real-ip']
                      || req.socket?.remoteAddress
                      || 'Non disponible';

        const location = await getIPGeolocation(clientIP);

        await supabaseAdmin
            .from('user_activity_log')
            .insert({
                user_id: user.id,
                activity_type: 'login',
                context: {
                    ip: clientIP,
                    location: location,
                    userAgent: req.headers['user-agent'] || null,
                    platform: 'web',
                    language: req.headers['accept-language']?.split(',')[0] || 'fr',
                    recreatedAfterClear: true
                },
                device_type: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop',
                user_agent: req.headers['user-agent'] || null,
                created_at: new Date().toISOString()
            });

        return res.status(200).json({
            message: 'Historique d\'audit effacé avec succès',
            deleted: true
        });

    } catch (error) {
        console.error('Clear activity log error:', error);
        return res.status(500).json({ error: 'Erreur serveur', details: error.message });
    }
}
