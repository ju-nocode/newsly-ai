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
        'nav.dashboard': 'Dashboard',

        'sidebar.categories': 'Catégories',
        'sidebar.countries': 'Pays',
        'sidebar.allCountries': 'Tous',

        // Countries
        'country.all': 'Tous',
        'country.us': '🇺🇸 États-Unis',
        'country.fr': '🇫🇷 France',
        'country.gb': '🇬🇧 Royaume-Uni',
        'country.ca': '🇨🇦 Canada',
        'country.de': '🇩🇪 Allemagne',

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
        'settings.identity': 'Identité',
        'settings.photo': 'Photo',
        'settings.email': 'Email',
        'settings.username': 'Nom d\'utilisateur',
        'settings.usernamePlaceholder': 'Votre nom d\'utilisateur',
        'settings.fullName': 'Nom complet',
        'settings.fullNamePlaceholder': 'Votre nom complet',
        'settings.phone': 'Téléphone',
        'settings.bio': 'Bio',
        'settings.bioPlaceholder': 'Parlez-nous de vous...',
        'settings.avatar': 'Photo de profil',
        'settings.avatarHint': 'Cliquez sur l\'avatar pour changer (max 2MB)',
        'settings.security': 'Sécurité',
        'settings.currentPassword': 'Mot de passe actuel',
        'settings.currentPasswordPlaceholder': 'Entrez votre mot de passe actuel',
        'settings.newPassword': 'Nouveau mot de passe',
        'settings.newPasswordPlaceholder': 'Nouveau mot de passe (min. 8 caractères)',
        'settings.confirmPassword': 'Confirmer le mot de passe',
        'settings.confirmPasswordPlaceholder': 'Confirmez le nouveau mot de passe',
        'settings.changePassword': 'Changer le mot de passe',
        'settings.updateProfile': 'Mettre à jour le profil',
        'settings.appearance': 'Apparence',
        'settings.account': 'Compte',
        'settings.deleteWarning': 'Une fois votre compte supprimé, toutes vos données seront définitivement effacées.',
        'settings.deleteAccount': 'Supprimer mon compte',
        'settings.profileUpdated': 'Profil mis à jour !',
        'settings.usernameEmpty': 'Le nom d\'utilisateur ne peut pas être vide',
        'settings.updateError': 'Erreur lors de la mise à jour',
        'settings.languagePreferences': 'Préférences de langue',
        'settings.french': 'Français',
        'settings.english': 'English',
        'settings.theme': 'Thème',
        'settings.light': 'Clair',
        'settings.dark': 'Sombre',
        'settings.savePreferences': 'Enregistrer les préférences',
        'settings.dangerZone': 'Zone de danger',
        'settings.dangerZoneDesc': 'Une fois votre compte supprimé, toutes vos données seront définitivement effacées. Cette action est irréversible.',
        'settings.protectAccount': 'Protégez votre compte',
        'settings.users': 'Utilisateurs',
        'settings.manageProfile': 'Gérez vos informations personnelles',
        'settings.general': 'Général',
        'settings.advanced': 'Avancé',
        'settings.country': 'Pays',
        'settings.city': 'Ville',

        'auth.login': 'Connexion',
        'auth.signup': 'Créer un compte',
        'auth.email': 'Email',
        'auth.password': 'Mot de passe',
        'auth.loginTitle': 'Connexion',
        'auth.loginSubtitle': 'Connectez-vous à votre compte',
        'auth.loginBtn': 'Se connecter',
        'auth.signupTitle': 'Créer un compte',
        'auth.signupSubtitle': 'Rejoignez Newsly AI',
        'auth.signupBtn': 'Créer mon compte',
        'auth.noAccount': 'Pas de compte ?',
        'auth.createAccount': 'Créer un compte',
        'auth.hasAccount': 'Déjà un compte ?',
        'auth.loginLink': 'Se connecter',

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
        'nav.dashboard': 'Dashboard',

        'sidebar.categories': 'Categories',
        'sidebar.countries': 'Countries',
        'sidebar.allCountries': 'All',

        // Countries
        'country.all': 'All',
        'country.us': '🇺🇸 United States',
        'country.fr': '🇫🇷 France',
        'country.gb': '🇬🇧 United Kingdom',
        'country.ca': '🇨🇦 Canada',
        'country.de': '🇩🇪 Germany',

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
        'settings.identity': 'Identity',
        'settings.photo': 'Photo',
        'settings.email': 'Email',
        'settings.username': 'Username',
        'settings.usernamePlaceholder': 'Your username',
        'settings.fullName': 'Full name',
        'settings.fullNamePlaceholder': 'Your full name',
        'settings.phone': 'Phone',
        'settings.bio': 'Bio',
        'settings.bioPlaceholder': 'Tell us about yourself...',
        'settings.avatar': 'Profile picture',
        'settings.avatarHint': 'Click on avatar to change (max 2MB)',
        'settings.security': 'Security',
        'settings.currentPassword': 'Current password',
        'settings.currentPasswordPlaceholder': 'Enter your current password',
        'settings.newPassword': 'New password',
        'settings.newPasswordPlaceholder': 'New password (min. 8 characters)',
        'settings.confirmPassword': 'Confirm password',
        'settings.confirmPasswordPlaceholder': 'Confirm new password',
        'settings.changePassword': 'Change password',
        'settings.updateProfile': 'Update profile',
        'settings.appearance': 'Appearance',
        'settings.account': 'Account',
        'settings.deleteWarning': 'Once your account is deleted, all your data will be permanently erased.',
        'settings.deleteAccount': 'Delete my account',
        'settings.profileUpdated': 'Profile updated!',
        'settings.usernameEmpty': 'Username cannot be empty',
        'settings.updateError': 'Error during update',
        'settings.languagePreferences': 'Language preferences',
        'settings.french': 'French',
        'settings.english': 'English',
        'settings.theme': 'Theme',
        'settings.light': 'Light',
        'settings.dark': 'Dark',
        'settings.savePreferences': 'Save preferences',
        'settings.dangerZone': 'Danger zone',
        'settings.dangerZoneDesc': 'Once your account is deleted, all your data will be permanently erased. This action is irreversible.',
        'settings.protectAccount': 'Protect your account',
        'settings.users': 'Users',
        'settings.manageProfile': 'Manage your personal information',
        'settings.general': 'General',
        'settings.advanced': 'Advanced',
        'settings.country': 'Country',
        'settings.city': 'City',

        'auth.login': 'Login',
        'auth.signup': 'Sign up',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.loginTitle': 'Login',
        'auth.loginSubtitle': 'Sign in to your account',
        'auth.loginBtn': 'Sign in',
        'auth.signupTitle': 'Create account',
        'auth.signupSubtitle': 'Join Newsly AI',
        'auth.signupBtn': 'Create my account',
        'auth.noAccount': 'No account?',
        'auth.createAccount': 'Create account',
        'auth.hasAccount': 'Already have an account?',
        'auth.loginLink': 'Sign in',

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
            } else if (element.tagName === 'OPTION') {
                // Pour les options de select, traduire le textContent
                element.textContent = translation;
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

/**
 * Change language and save to database
 * @param {string} lang - Language code (fr/en)
 */
export const changeLanguage = async (lang) => {
    if (lang !== 'fr' && lang !== 'en') {
        console.warn(`Invalid language: ${lang}. Using 'fr' as default.`);
        lang = 'fr';
    }

    const previousLang = localStorage.getItem('language') || 'fr';

    // Save to localStorage
    localStorage.setItem('language', lang);

    // Clear translation cache for new language
    translationCache = {};

    // Preload new language
    await preloadTranslations();

    // Translate current page
    await translatePage();

    // Save to database
    await saveLanguageToDatabase(lang);

    // ✅ Track language change in user_activity_log
    if (previousLang !== lang && window.userIntelligence) {
        window.userIntelligence.logActivity('language_change', {
            from_language: previousLang,
            to_language: lang,
            timestamp: new Date().toISOString()
        }).catch(err => console.error('Error logging language change:', err));
    }

    console.log(`🌍 Language changed to: ${lang}`);
    return lang;
};

/**
 * Save language to database via API
 * @param {string} language - Language to save
 */
async function saveLanguageToDatabase(language) {
    try {
        const session = JSON.parse(localStorage.getItem('session'));
        if (!session?.access_token) {
            console.log('⚠️ No session found, language not saved to database');
            return;
        }

        const response = await fetch('/api/user/settings', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ language })
        });

        if (!response.ok) {
            console.error('Failed to save language to database:', await response.text());
            return;
        }

        console.log('✅ Language saved to database');
    } catch (error) {
        console.error('Error saving language to database:', error);
    }
}

/**
 * Load language from database on init
 */
export const loadLanguageFromDatabase = async () => {
    try {
        const session = JSON.parse(localStorage.getItem('session'));
        if (!session?.access_token) {
            return localStorage.getItem('language') || 'fr';
        }

        const response = await fetch('/api/user/settings', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${session.access_token}`
            }
        });

        if (!response.ok) {
            return localStorage.getItem('language') || 'fr';
        }

        const data = await response.json();
        const dbLang = data.language || 'fr';

        // Sync with localStorage if different
        if (dbLang !== localStorage.getItem('language')) {
            localStorage.setItem('language', dbLang);
        }

        return dbLang;
    } catch (error) {
        console.error('Error loading language from database:', error);
        return localStorage.getItem('language') || 'fr';
    }
};

// Auto-preload on import
preloadTranslations();
