import { securityHeaders, rateLimit } from '../_middleware/security.js';

export default async function handler(req, res) {
    // CORS sécurisé
    const origin = req.headers.origin;
    securityHeaders(res, origin);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Rate limiting par IP pour visiteurs publics (plus restrictif)
        const clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress;
        const rateLimitResult = rateLimit(clientIp, 10, 60000); // 10 requêtes par minute par IP

        if (!rateLimitResult.allowed) {
            return res.status(429).json({
                success: false,
                error: 'Trop de requêtes. Veuillez patienter.'
            });
        }

        // Forcer les paramètres pour mode public (seulement general + us)
        const category = 'general';
        const country = 'us';
        const page = 1;

        // Vérifier que la clé API existe
        if (!process.env.NEWS_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'Service temporairement indisponible'
            });
        }

        // Appel à NewsAPI avec la clé sécurisée côté serveur
        const url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&page=${page}&pageSize=12&apiKey=${process.env.NEWS_API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'ok') {
            return res.status(400).json({
                success: false,
                error: 'Erreur lors du chargement des actualités'
            });
        }

        // Retourner les articles
        return res.status(200).json({
            success: true,
            articles: data.articles || [],
            totalResults: data.totalResults || 0
        });

    } catch (error) {
        console.error('Public News API error:', error);
        return res.status(500).json({
            success: false,
            error: 'Erreur serveur'
        });
    }
}
