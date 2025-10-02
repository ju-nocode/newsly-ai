// ================================================
// NEWSLY AI - Configuration & Logique Complète
// ================================================

// ================================================
// CONFIGURATION SUPABASE
// ================================================
// ⚠️ REMPLACEZ PAR VOS VRAIES CLÉS SUPABASE
const SUPABASE_URL = 'VOTRE_PROJECT_URL_ICI'; // ex: https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = 'VOTRE_ANON_PUBLIC_KEY_ICI'; // La longue clé qui commence par eyJ...

// Initialiser Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ================================================
// CONFIGURATION NEWS API
// ================================================
// Option 1: NewsAPI (gratuit 100 req/jour)
const NEWS_API_KEY = 'VOTRE_CLE_NEWSAPI_ICI'; // Obtenez-la sur https://newsapi.org
const USE_NEWS_API = false; // Mettez true si vous avez une clé NewsAPI

// ================================================
// DARK/LIGHT MODE
// ================================================

// Initialiser le thème au chargement
const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
};

// Créer le bouton de toggle du thème
const createThemeToggle = () => {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.id = 'themeToggle';
    themeToggle.innerHTML = '🌙';
    themeToggle.setAttribute('aria-label', 'Toggle dark/light mode');
    
    themeToggle.addEventListener('click', toggleTheme);
    
    // Insérer en premier dans nav-links
    navLinks.insertBefore(themeToggle, navLinks.firstChild);
};

// Toggle entre dark et light mode
const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
};

// Mettre à jour l'icône du thème
const updateThemeIcon = (theme) => {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.innerHTML = theme === 'dark' ? '🌙' : '☀️';
    }
};

// Initialiser au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    createThemeToggle();
});

// ================================================
// GESTION DES UTILISATEURS (Supabase)
// ================================================

// Charger le profil utilisateur
export const loadUserProfile = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Erreur chargement profil:', error);
        return null;
    }
};

// Charger les préférences utilisateur
export const loadUserPreferences = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;

        // Convertir en objet {category: is_active}
        const preferences = {};
        data.forEach(pref => {
            preferences[pref.category] = pref.is_active;
        });

        return preferences;
    } catch (error) {
        console.error('Erreur chargement préférences:', error);
        return { ai: true, world: true, finance: true, science: true };
    }
};

// Sauvegarder les préférences utilisateur
export const saveUserPreferences = async (userId, category, isActive) => {
    try {
        const { error } = await supabase
            .from('user_preferences')
            .upsert({
                user_id: userId,
                category: category,
                is_active: isActive
            }, {
                onConflict: 'user_id,category'
            });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Erreur sauvegarde préférences:', error);
        return false;
    }
};

// ================================================
// RÉCUPÉRATION DES ACTUALITÉS
// ================================================

// Configuration des catégories avec requêtes de recherche
const categoryConfig = {
    ai: {
        query: 'artificial intelligence OR AI OR machine learning OR ChatGPT',
        fallbackFeeds: [
            'https://techcrunch.com/category/artificial-intelligence/feed/',
            'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml'
        ]
    },
    world: {
        query: 'world news OR international OR politics',
        fallbackFeeds: [
            'https://feeds.bbci.co.uk/news/world/rss.xml',
            'https://www.lemonde.fr/international/rss_full.xml'
        ]
    },
    finance: {
        query: 'finance OR stock market OR economy OR cryptocurrency',
        fallbackFeeds: [
            'https://feeds.bloomberg.com/markets/news.rss',
            'https://www.reuters.com/finance/rss'
        ]
    },
    science: {
        query: 'science OR research OR technology OR innovation',
        fallbackFeeds: [
            'https://www.nature.com/nature.rss',
            'https://www.sciencedaily.com/rss/all.xml'
        ]
    }
};

// Récupérer les actualités pour une catégorie (NewsAPI)
const fetchNewsFromAPI = async (category) => {
    if (!USE_NEWS_API || !NEWS_API_KEY || NEWS_API_KEY === 'VOTRE_CLE_NEWSAPI_ICI') {
        return null;
    }

    const config = categoryConfig[category];
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(config.query)}&language=fr&sortBy=publishedAt&pageSize=5&apiKey=${NEWS_API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'ok' && data.articles) {
            return data.articles.map(article => ({
                title: article.title,
                description: article.description,
                url: article.url,
                source: article.source.name,
                publishedAt: article.publishedAt
            }));
        }
        return null;
    } catch (error) {
        console.error(`Erreur NewsAPI pour ${category}:`, error);
        return null;
    }
};

// Récupérer les actualités via RSS (fallback gratuit)
const fetchNewsFromRSS = async (category) => {
    // Pour la démo, on utilise des actualités fictives
    // En production, vous pouvez utiliser un service comme rss2json.com
    
    const demoNews = {
        ai: [
            {
                title: "Les dernières avancées en intelligence artificielle révolutionnent l'industrie",
                description: "De nouveaux modèles d'IA démontrent des capacités sans précédent dans le traitement du langage naturel et la compréhension contextuelle.",
                url: "#",
                source: "TechCrunch",
                publishedAt: new Date().toISOString()
            },
            {
                title: "ChatGPT atteint 100 millions d'utilisateurs actifs mensuels",
                description: "Le chatbot d'OpenAI continue sa croissance fulgurante et transforme la façon dont les gens travaillent et créent du contenu.",
                url: "#",
                source: "The Verge",
                publishedAt: new Date().toISOString()
            },
            {
                title: "Google annonce Gemini Pro, son modèle d'IA le plus avancé",
                description: "Le nouveau modèle multimodal de Google promet des performances supérieures dans diverses tâches d'IA.",
                url: "#",
                source: "Google Blog",
                publishedAt: new Date().toISOString()
            }
        ],
        world: [
            {
                title: "Sommet international sur le climat : des engagements historiques",
                description: "Les dirigeants mondiaux s'accordent sur de nouveaux objectifs ambitieux pour réduire les émissions de carbone d'ici 2030.",
                url: "#",
                source: "BBC News",
                publishedAt: new Date().toISOString()
            },
            {
                title: "Tensions géopolitiques en Asie : ce qu'il faut savoir",
                description: "Analyse approfondie des derniers développements dans les relations internationales en Asie-Pacifique.",
                url: "#",
                source: "Le Monde",
                publishedAt: new Date().toISOString()
            },
            {
                title: "L'ONU lance une initiative mondiale pour l'éducation",
                description: "Un programme visant à améliorer l'accès à l'éducation de qualité pour 200 millions d'enfants dans le monde.",
                url: "#",
                source: "Reuters",
                publishedAt: new Date().toISOString()
            }
        ],
        finance: [
            {
                title: "Les marchés boursiers atteignent de nouveaux sommets",
                description: "Les indices mondiaux enregistrent des gains record grâce à l'optimisme des investisseurs concernant la croissance économique.",
                url: "#",
                source: "Bloomberg",
                publishedAt: new Date().toISOString()
            },
            {
                title: "Bitcoin franchit un nouveau cap historique",
                description: "La principale cryptomonnaie continue sa progression alors que l'adoption institutionnelle s'accélère.",
                url: "#",
                source: "CoinDesk",
                publishedAt: new Date().toISOString()
            },
            {
                title: "Les banques centrales face au défi de l'inflation",
                description: "Analyse des politiques monétaires et de leur impact sur l'économie mondiale dans le contexte actuel.",
                url: "#",
                source: "Financial Times",
                publishedAt: new Date().toISOString()
            }
        ],
        science: [
            {
                title: "Découverte majeure dans la recherche sur le cancer",
                description: "Des scientifiques identifient un nouveau mécanisme qui pourrait révolutionner les traitements contre certains types de cancer.",
                url: "#",
                source: "Nature",
                publishedAt: new Date().toISOString()
            },
            {
                title: "Mission spatiale réussie vers les confins du système solaire",
                description: "La sonde spatiale transmet des images extraordinaires révélant de nouveaux détails sur les lunes glacées.",
                url: "#",
                source: "NASA",
                publishedAt: new Date().toISOString()
            },
            {
                title: "Percée dans la fusion nucléaire : l'énergie propre du futur ?",
                description: "Les chercheurs atteignent un nouveau record dans la production d'énergie par fusion, rapprochant cette technologie de la viabilité commerciale.",
                url: "#",
                source: "Science Daily",
                publishedAt: new Date().toISOString()
            }
        ]
    };

    return demoNews[category] || [];
};

// Fonction principale pour récupérer les actualités
export const fetchNewsForCategory = async (category) => {
    // Essayer d'abord NewsAPI si configuré
    let articles = await fetchNewsFromAPI(category);
    
    // Sinon utiliser RSS/demo
    if (!articles) {
        articles = await fetchNewsFromRSS(category);
    }

    return articles;
};

// ================================================
// AFFICHAGE DES ACTUALITÉS
// ================================================

export const displayNews = (containerId, articles) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!articles || articles.length === 0) {
        container.innerHTML = '<div class="loading">Aucune actualité disponible pour le moment.</div>';
        return;
    }

    let html = '';
    articles.slice(0, 3).forEach((article, index) => {
        const title = article.title || 'Sans titre';
        const source = article.source || 'Source inconnue';
        const description = article.description || '';
        const url = article.url || '#';
        const date = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }) : '';

        html += `
            <div class="news-item stagger-item" style="animation-delay: ${index * 0.1}s">
                <div class="news-title">
                    <a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a>
                </div>
                <div class="news-source">${source}${date ? ' • ' + date : ''}</div>
                <div class="news-description">${truncateText(description, 150)}</div>
            </div>
        `;
    });

    container.innerHTML = html;
};

// Tronquer le texte
const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// ================================================
// NOTIFICATIONS & MESSAGES
// ================================================

export const showError = (message, container = null) => {
    if (container) {
        container.textContent = message;
        container.style.display = 'block';
    } else {
        console.error(message);
    }
};

export const showSuccess = (message) => {
    console.log('✅', message);
};

// ================================================
// ANIMATIONS AU SCROLL
// ================================================

// Observer pour les animations au scroll
const observeElements = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    // Observer tous les éléments avec animation
    document.querySelectorAll('.feature-card, .category-preview, .news-category').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
};

// Initialiser les animations au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeElements);
} else {
    observeElements();
}

// ================================================
// SMOOTH SCROLL
// ================================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ================================================
// UTILITAIRES
// ================================================

// Formater la date
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    
    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

// Debounce pour optimiser les performances
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// ================================================
// GESTION DES ERREURS GLOBALES
// ================================================

window.addEventListener('error', (e) => {
    console.error('Erreur globale:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Promise rejetée:', e.reason);
});

// ================================================
// CONSOLE INFO
// ================================================

console.log('%c🚀 Newsly AI', 'font-size: 24px; font-weight: bold; color: #667eea;');
console.log('%cPlateforme de curation de news IA', 'font-size: 14px; color: #888;');
console.log('%c⚠️ N\'oubliez pas de configurer vos clés API dans app.js', 'font-size: 12px; color: #f59e0b; font-weight: bold;');

// ================================================
// EXPORT POUR UTILISATION DANS D'AUTRES FICHIERS
// ================================================

export default {
    supabase,
    loadUserProfile,
    loadUserPreferences,
    saveUserPreferences,
    fetchNewsForCategory,
    displayNews,
    showError,
    showSuccess,
    formatDate,
    debounce
};
