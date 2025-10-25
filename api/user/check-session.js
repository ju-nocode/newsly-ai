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

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Extraire le token d'authentification
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Non authentifié', shouldLogout: false });
        }

        const token = authHeader.split(' ')[1];

        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );

        // Vérifier le token et récupérer l'utilisateur
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ error: 'Token invalide', shouldLogout: true });
        }

        const supabaseAdmin = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // Récupérer le timestamp du token JWT (issued at)
        // Les tokens JWT Supabase ont une propriété 'iat' (issued at timestamp)
        const tokenPayload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        const tokenIssuedAt = new Date(tokenPayload.iat * 1000);

        // Vérifier s'il y a eu un global logout après l'émission de ce token
        const { data: globalLogouts, error: logoutError } = await supabaseAdmin
            .from('user_global_logout')
            .select('logout_timestamp')
            .eq('user_id', user.id)
            .gte('logout_timestamp', tokenIssuedAt.toISOString())
            .order('logout_timestamp', { ascending: false })
            .limit(1);

        if (logoutError) {
            console.error('Error checking global logout:', logoutError);
            // En cas d'erreur, on laisse l'utilisateur connecté
            return res.status(200).json({
                valid: true,
                shouldLogout: false
            });
        }

        // Si un global logout existe après l'émission du token, forcer la déconnexion
        if (globalLogouts && globalLogouts.length > 0) {
            return res.status(200).json({
                valid: false,
                shouldLogout: true,
                reason: 'global_logout',
                message: 'Vous avez été déconnecté de tous les appareils'
            });
        }

        // Session valide
        return res.status(200).json({
            valid: true,
            shouldLogout: false
        });

    } catch (error) {
        console.error('Check session error:', error);
        return res.status(500).json({
            error: 'Erreur serveur',
            shouldLogout: false
        });
    }
}
