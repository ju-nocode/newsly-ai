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
        const { category = 'general', country = 'us', page = 1 } = req.query;

        // Vérifier que la clé API existe
        if (!process.env.NEWS_API_KEY) {
            return res.status(500).json({ error: 'NewsAPI key not configured' });
        }

        // Appel à NewsAPI avec la clé sécurisée côté serveur
        const url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&page=${page}&pageSize=20&apiKey=${process.env.NEWS_API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'ok') {
            return res.status(400).json({ error: data.message || 'Erreur NewsAPI' });
        }

        // Retourner les articles
        return res.status(200).json({
            articles: data.articles,
            totalResults: data.totalResults
        });

    } catch (error) {
        console.error('News API error:', error);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
}
