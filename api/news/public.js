export default async function handler(req, res) {
    // CORS headers - Allow all origins for now
    res.setHeader('Access-Control-Allow-Origin', '*');
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

        // Get params from query (with validation)
        const { category = 'general', country = 'us', page = 1 } = req.query;

        // Validate category
        const validCategories = ['general', 'business', 'technology', 'science', 'health', 'sports', 'entertainment'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid category'
            });
        }

        // Validate country
        const validCountries = ['us', 'fr', 'gb', 'ca', 'de'];
        if (!validCountries.includes(country)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid country'
            });
        }

        console.log(`📰 Fetching ${category} news for ${country}`);

        // Vérifier que la clé API existe
        if (!process.env.NEWS_API_KEY) {
            console.error('❌ NEWS_API_KEY not configured');
            return res.status(500).json({
                success: false,
                error: 'Service temporairement indisponible'
            });
        }

        console.log('✅ NEWS_API_KEY found, fetching news...');

        // Appel à NewsAPI avec la clé sécurisée côté serveur + timeout
        const url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&page=${page}&pageSize=12&apiKey=${process.env.NEWS_API_KEY}`;

        console.log('🔗 Calling NewsAPI...');

        // Timeout controller
        const controller = new AbortController();
        const timeout = setTimeout(() => {
            console.warn('⏱️ NewsAPI timeout (10s)');
            controller.abort();
        }, 10000); // 10 secondes

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        const data = await response.json();

        console.log('📡 NewsAPI raw response:', JSON.stringify(data).substring(0, 200));

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

        // Handle timeout
        if (error.name === 'AbortError') {
            return res.status(504).json({
                success: false,
                error: 'Timeout lors de la récupération des actualités'
            });
        }

        return res.status(500).json({
            success: false,
            error: 'Erreur serveur',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
