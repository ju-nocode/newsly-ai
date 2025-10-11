import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '../../lib/rate-limit.js';

const limiter = rateLimit({
    interval: 60 * 1000, // 1 minute
    maxRequests: 20 // 20 requêtes par minute
});

export default async function handler(req, res) {
    // CORS headers - Restricted to allowed origins
    const allowedOrigins = [
        'https://prod-julien.vercel.app',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ];
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', true);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Rate limiting - Get identifier from IP
    const identifier = req.headers['x-forwarded-for']?.split(',')[0] ||
                      req.headers['x-real-ip'] ||
                      req.socket.remoteAddress ||
                      'unknown';

    const rateLimitResult = limiter.check(identifier);

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', rateLimitResult.limit);
    res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining);
    res.setHeader('X-RateLimit-Reset', rateLimitResult.reset);

    if (!rateLimitResult.success) {
        return res.status(429).json({
            error: 'Trop de requêtes. Veuillez réessayer plus tard.',
            retryAfter: rateLimitResult.reset
        });
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

        // Utiliser le service role pour récupérer le profil de l'utilisateur connecté
        const supabaseAdmin = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // Vérifier si l'utilisateur est admin
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (profileError || !profile || !profile.is_admin) {
            return res.status(403).json({ error: 'Accès non autorisé - Admin uniquement' });
        }

        // GET - Récupérer les déploiements Vercel (admin only)
        if (req.method === 'GET') {
            console.log('🔍 [VERCEL API] Début de la requête GET');
            console.log('👤 [VERCEL API] Admin:', user.email, '- ID:', user.id);

            // Log audit: consultation du dashboard Vercel
            await supabaseAdmin.from('admin_audit_log').insert({
                admin_id: user.id,
                admin_email: user.email,
                action: 'VIEW_VERCEL_DASHBOARD',
                ip_address: identifier,
                user_agent: req.headers['user-agent'],
                metadata: { method: 'GET' }
            });

            console.log('✅ [VERCEL API] Audit log créé');

            // Vérifier l'environnement actuel
            console.log('🌍 [VERCEL API] VERCEL_ENV:', process.env.VERCEL_ENV);
            console.log('🌍 [VERCEL API] VERCEL_URL:', process.env.VERCEL_URL);
            console.log('🌍 [VERCEL API] NODE_ENV:', process.env.NODE_ENV);

            // Vérifier que le token Vercel est configuré
            console.log('🔑 [VERCEL API] Variables d\'environnement disponibles:', Object.keys(process.env).filter(k => k.includes('VERCEL') || k.includes('TOKEN')));

            // Essayer plusieurs noms de variables (compatibilité)
            const vercelToken = process.env.VERCEL_API_TOKEN || process.env.VERCEL_TOKEN || process.env.VERCEL_DEPLOYMENT_TOKEN;

            console.log('🔑 [VERCEL API] VERCEL_API_TOKEN existe?', !!process.env.VERCEL_API_TOKEN);
            console.log('🔑 [VERCEL API] VERCEL_TOKEN existe?', !!process.env.VERCEL_TOKEN);
            console.log('🔑 [VERCEL API] VERCEL_DEPLOYMENT_TOKEN existe?', !!process.env.VERCEL_DEPLOYMENT_TOKEN);
            console.log('🔑 [VERCEL API] Token final trouvé?', !!vercelToken);
            console.log('🔑 [VERCEL API] Token longueur:', vercelToken ? vercelToken.length : 0);
            console.log('🔑 [VERCEL API] Token preview (premiers 10 chars):', vercelToken ? vercelToken.substring(0, 10) + '...' : 'undefined');

            if (!vercelToken) {
                console.error('❌ [VERCEL API] Token Vercel NON TROUVÉ dans process.env');
                return res.status(500).json({
                    error: 'Token Vercel non configuré',
                    message: 'Veuillez ajouter VERCEL_API_TOKEN ou VERCEL_TOKEN dans les variables d\'environnement'
                });
            }

            console.log('✅ [VERCEL API] Token Vercel trouvé, appel à l\'API Vercel...');

            try {
                // Appeler l'API Vercel pour récupérer les déploiements
                // Documentation: https://vercel.com/docs/rest-api/endpoints#list-deployments
                console.log('🌐 [VERCEL API] Appel à l\'API Vercel: https://api.vercel.com/v6/deployments?limit=20');

                const vercelResponse = await fetch('https://api.vercel.com/v6/deployments?limit=20', {
                    headers: {
                        'Authorization': `Bearer ${vercelToken}`
                    }
                });

                console.log('📡 [VERCEL API] Réponse reçue - Status:', vercelResponse.status, vercelResponse.statusText);

                if (!vercelResponse.ok) {
                    const errorData = await vercelResponse.json();
                    console.error('❌ [VERCEL API] Erreur API Vercel:', JSON.stringify(errorData, null, 2));
                    return res.status(vercelResponse.status).json({
                        error: 'Erreur API Vercel',
                        details: errorData.error?.message || 'Erreur inconnue'
                    });
                }

                const vercelData = await vercelResponse.json();
                const deployments = vercelData.deployments || [];

                console.log('✅ [VERCEL API] Déploiements récupérés:', deployments.length);
                console.log('📊 [VERCEL API] Premier déploiement:', deployments[0] ? {
                    name: deployments[0].name,
                    state: deployments[0].state,
                    url: deployments[0].url
                } : 'Aucun');

                // Formater les déploiements
                const formattedDeployments = deployments.map(d => ({
                    id: d.uid,
                    name: d.name,
                    url: d.url,
                    state: d.state, // READY, ERROR, BUILDING, QUEUED, CANCELED
                    created: d.created,
                    ready: d.ready,
                    target: d.target || 'preview', // production ou preview
                    creator: d.creator?.username || d.creator?.email || 'Unknown',
                    source: d.source || 'git',
                    inspectorUrl: `https://vercel.com/${d.creator?.username || 'dashboard'}/deployments/${d.uid}`
                }));

                // Calculer les statistiques
                const totalDeployments = deployments.length;
                const readyDeployments = deployments.filter(d => d.state === 'READY').length;
                const errorDeployments = deployments.filter(d => d.state === 'ERROR').length;
                const buildingDeployments = deployments.filter(d => d.state === 'BUILDING').length;

                // Dernier déploiement
                const lastDeployment = deployments[0] || null;

                // Calculer le temps de build moyen (pour les déploiements terminés)
                const completedDeployments = deployments.filter(d => d.ready && d.created);
                const avgBuildTime = completedDeployments.length > 0
                    ? completedDeployments.reduce((acc, d) => {
                        const buildTime = d.ready - d.created;
                        return acc + buildTime;
                    }, 0) / completedDeployments.length
                    : 0;

                // Convertir en secondes
                const avgBuildTimeSeconds = Math.round(avgBuildTime / 1000);

                // Production deployments
                const productionDeployments = deployments.filter(d => d.target === 'production').length;

                console.log('📊 [VERCEL API] Statistiques calculées:', {
                    total: totalDeployments,
                    ready: readyDeployments,
                    error: errorDeployments,
                    building: buildingDeployments,
                    production: productionDeployments,
                    avgBuildTime: avgBuildTimeSeconds
                });

                console.log('✅ [VERCEL API] Envoi de la réponse au client');

                return res.status(200).json({
                    deployments: formattedDeployments,
                    stats: {
                        total: totalDeployments,
                        ready: readyDeployments,
                        error: errorDeployments,
                        building: buildingDeployments,
                        production: productionDeployments,
                        avgBuildTime: avgBuildTimeSeconds,
                        lastDeployment: lastDeployment ? {
                            state: lastDeployment.state,
                            created: lastDeployment.created,
                            url: lastDeployment.url,
                            target: lastDeployment.target || 'preview'
                        } : null
                    }
                });

            } catch (fetchError) {
                console.error('❌ [VERCEL API] Erreur lors du fetch:', fetchError);
                console.error('❌ [VERCEL API] Stack trace:', fetchError.stack);
                return res.status(500).json({
                    error: 'Erreur lors de la communication avec l\'API Vercel',
                    details: fetchError.message
                });
            }
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Admin Vercel API error:', error);
        return res.status(500).json({
            error: 'Erreur serveur',
            details: error.message
        });
    }
}
