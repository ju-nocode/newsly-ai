// ================================================
// NEWSLY AI - Cloud Translation Service
// Using translation IDs with fallback to local
// ================================================

// Translation IDs mapping
export const translationIds = {
    // Navbar
    'nav.search': 'nav_search',
    'nav.settings': 'nav_settings',
    'nav.logout': 'nav_logout',
    'nav.darkMode': 'nav_dark_mode',
    'nav.lightMode': 'nav_light_mode',
    'nav.language': 'nav_language',
    'nav.backToDashboard': 'nav_back_dashboard',

    // Sidebar
    'sidebar.categories': 'sidebar_categories',
    'category.general': 'cat_general',
    'category.business': 'cat_business',
    'category.technology': 'cat_technology',
    'category.science': 'cat_science',
    'category.health': 'cat_health',
    'category.sports': 'cat_sports',
    'category.entertainment': 'cat_entertainment',

    // Dashboard
    'dashboard.title': 'dash_title',
    'dashboard.loading': 'dash_loading',
    'dashboard.noNews': 'dash_no_news',
    'dashboard.error': 'dash_error',
    'dashboard.retry': 'dash_retry',
    'dashboard.topicAdded': 'dash_topic_added',

    // Settings
    'settings.title': 'settings_title',
    'settings.profile': 'settings_profile',
    'settings.email': 'settings_email',
    'settings.username': 'settings_username',
    'settings.usernamePlaceholder': 'settings_username_ph',
    'settings.updateProfile': 'settings_update',
    'settings.appearance': 'settings_appearance',
    'settings.account': 'settings_account',
    'settings.deleteWarning': 'settings_delete_warn',
    'settings.deleteAccount': 'settings_delete_acc',
    'settings.profileUpdated': 'settings_updated',
    'settings.usernameEmpty': 'settings_username_empty',
    'settings.updateError': 'settings_error',

    // Auth
    'auth.login': 'auth_login',
    'auth.signup': 'auth_signup',
    'auth.email': 'auth_email',
    'auth.password': 'auth_password',

    // Messages
    'msg.languageChanged': 'msg_lang_changed',
    'msg.newsRefreshed': 'msg_news_refresh',
};

// Fallback translations (local)
const fallbackTranslations = {
    fr: {
        'nav.search': 'Rechercher un sujet...',
        'nav.settings': 'Paramètres',
        'nav.logout': 'Déconnexion',
        'nav.darkMode': 'Mode sombre',
        'nav.lightMode': 'Mode clair',
        'nav.backToDashboard': '← Retour au Dashboard',

        'sidebar.categories': 'Catégories',
        'category.general': 'Général',
        'category.business': 'Business',
        'category.technology': 'Technologie',
        'category.science': 'Science',
        'category.health': 'Santé',
        'category.sports': 'Sports',
        'category.entertainment': 'Divertissement',

        'dashboard.title': 'Actualités',
        'dashboard.loading': 'Chargement...',
        'dashboard.noNews': 'Aucune actualité disponible.',
        'dashboard.error': 'Erreur lors du chargement',
        'dashboard.retry': 'Réessayer',
        'dashboard.topicAdded': 'Topic ajouté !',

        'settings.title': 'Paramètres du compte',
        'settings.profile': 'Profil',
        'settings.email': 'Email',
        'settings.username': 'Nom d\'utilisateur',
        'settings.usernamePlaceholder': 'Votre nom d\'utilisateur',
        'settings.updateProfile': 'Mettre à jour le profil',
        'settings.appearance': 'Apparence',
        'settings.account': 'Compte',
        'settings.deleteWarning': 'Une fois votre compte supprimé, toutes vos données seront définitivement effacées.',
        'settings.deleteAccount': 'Supprimer mon compte',
        'settings.profileUpdated': 'Profil mis à jour !',
        'settings.usernameEmpty': 'Le nom d\'utilisateur ne peut pas être vide',
        'settings.updateError': 'Erreur lors de la mise à jour',

        'auth.login': 'Connexion',
        'auth.signup': 'Créer un compte',
        'auth.email': 'Email',
        'auth.password': 'Mot de passe',

        'msg.languageChanged': 'Langue changée en',
        'msg.newsRefreshed': 'Actualités rafraîchies !',
    },

    en: {
        'nav.search': 'Search a topic...',
        'nav.settings': 'Settings',
        'nav.logout': 'Logout',
        'nav.darkMode': 'Dark mode',
        'nav.lightMode': 'Light mode',
        'nav.backToDashboard': '← Back to Dashboard',

        'sidebar.categories': 'Categories',
        'category.general': 'General',
        'category.business': 'Business',
        'category.technology': 'Technology',
        'category.science': 'Science',
        'category.health': 'Health',
        'category.sports': 'Sports',
        'category.entertainment': 'Entertainment',

        'dashboard.title': 'News',
        'dashboard.loading': 'Loading...',
        'dashboard.noNews': 'No news available.',
        'dashboard.error': 'Error loading news',
        'dashboard.retry': 'Retry',
        'dashboard.topicAdded': 'Topic added!',

        'settings.title': 'Account Settings',
        'settings.profile': 'Profile',
        'settings.email': 'Email',
        'settings.username': 'Username',
        'settings.usernamePlaceholder': 'Your username',
        'settings.updateProfile': 'Update profile',
        'settings.appearance': 'Appearance',
        'settings.account': 'Account',
        'settings.deleteWarning': 'Once your account is deleted, all your data will be permanently erased.',
        'settings.deleteAccount': 'Delete my account',
        'settings.profileUpdated': 'Profile updated!',
        'settings.usernameEmpty': 'Username cannot be empty',
        'settings.updateError': 'Error during update',

        'auth.login': 'Login',
        'auth.signup': 'Sign up',
        'auth.email': 'Email',
        'auth.password': 'Password',

        'msg.languageChanged': 'Language changed to',
        'msg.newsRefreshed': 'News refreshed!',
    }
};

// Cache for translations
let translationCache = {};

/**
 * Get translation from cloud or fallback
 * @param {string} key - Translation key
 * @param {string} lang - Language code (fr/en)
 * @returns {Promise<string>} Translated text
 */
export const t = async (key, lang = null) => {
    const currentLang = lang || localStorage.getItem('language') || 'fr';

    // Check cache first
    const cacheKey = `${currentLang}_${key}`;
    if (translationCache[cacheKey]) {
        return translationCache[cacheKey];
    }

    // Use fallback (cloud translation could be added here)
    const translation = fallbackTranslations[currentLang][key] || key;

    // Cache it
    translationCache[cacheKey] = translation;

    return translation;
};

/**
 * Synchronous translation (uses fallback only)
 * @param {string} key - Translation key
 * @param {string} lang - Language code
 * @returns {string} Translated text
 */
export const tSync = (key, lang = null) => {
    const currentLang = lang || localStorage.getItem('language') || 'fr';
    return fallbackTranslations[currentLang][key] || key;
};

/**
 * Translate entire page
 */
export const translatePage = async () => {
    const currentLang = localStorage.getItem('language') || 'fr';

    // Translate all elements with data-i18n
    const elements = document.querySelectorAll('[data-i18n]');
    for (const element of elements) {
        const key = element.getAttribute('data-i18n');
        const translation = await t(key, currentLang);

        if (translation && translation !== key) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        }
    }

    // Translate placeholders
    const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
    for (const element of placeholderElements) {
        const key = element.getAttribute('data-i18n-placeholder');
        const translation = await t(key, currentLang);
        if (translation && translation !== key) {
            element.placeholder = translation;
        }
    }
};

/**
 * Preload all translations for current language
 */
export const preloadTranslations = async () => {
    const currentLang = localStorage.getItem('language') || 'fr';

    // Preload all keys into cache
    for (const key in fallbackTranslations[currentLang]) {
        const cacheKey = `${currentLang}_${key}`;
        translationCache[cacheKey] = fallbackTranslations[currentLang][key];
    }
};

// Auto-preload on import
preloadTranslations();
