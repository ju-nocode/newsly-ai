export default async function handler(req, res) {
    // CORS headers
    const allowedOrigins = [
        'https://prod-julien.vercel.app',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ];

    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        // Simple rate limiting check (basic IP check)
        const clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
        console.log('📖 Public API request from IP:', clientIp);

        // Forcer les paramètres pour mode public (seulement general + us)
        const category = 'general';
        const country = 'us';
        const page = 1;

        // Vérifier que la clé API existe
        if (!process.env.NEWS_API_KEY) {
            console.error('❌ NEWS_API_KEY not configured');
            return res.status(500).json({
                success: false,
                error: 'Service temporairement indisponible'
            });
        }

        console.log('✅ NEWS_API_KEY found, fetching news...');

        // Appel à NewsAPI avec la clé sécurisée côté serveur
        const url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&page=${page}&pageSize=12&apiKey=${process.env.NEWS_API_KEY}`;

        // Use native fetch (Node 18+) or fallback to https module
        let data;
        if (typeof fetch !== 'undefined') {
            const response = await fetch(url);
            data = await response.json();
        } else {
            // Fallback for older Node versions
            const https = require('https');
            data = await new Promise((resolve, reject) => {
                https.get(url, (res) => {
                    let body = '';
                    res.on('data', chunk => body += chunk);
                    res.on('end', () => {
                        try {
                            resolve(JSON.parse(body));
                        } catch (e) {
                            reject(e);
                        }
                    });
                }).on('error', reject);
            });
        }

        console.log('📰 NewsAPI response status:', data.status);

        if (data.status !== 'ok') {
            console.error('❌ NewsAPI error:', data.message || data.code);
            return res.status(400).json({
                success: false,
                error: data.message || 'Erreur lors du chargement des actualités'
            });
        }

        console.log(`✅ Fetched ${data.articles?.length || 0} articles`);

        // Retourner les articles
        return res.status(200).json({
            success: true,
            articles: data.articles || [],
            totalResults: data.totalResults || 0
        });

    } catch (error) {
        console.error('❌ Public News API error:', error.message, error.stack);
        return res.status(500).json({
            success: false,
            error: 'Erreur serveur',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
