// ================================================
// NEWSLY AI - Traductions FR/EN
// ================================================

export const translations = {
    fr: {
        // Navbar
        'nav.search': 'Rechercher un sujet...',
        'nav.settings': 'Paramètres',
        'nav.logout': 'Déconnexion',
        'nav.darkMode': 'Mode sombre',
        'nav.lightMode': 'Mode clair',
        'nav.language': 'Français',
        'nav.backToDashboard': '← Retour au Dashboard',

        // Sidebar
        'sidebar.categories': 'Catégories',
        'category.general': 'Général',
        'category.business': 'Business',
        'category.technology': 'Technologie',
        'category.science': 'Science',
        'category.health': 'Santé',
        'category.sports': 'Sports',
        'category.entertainment': 'Divertissement',

        // Dashboard
        'dashboard.title': 'Actualités',
        'dashboard.loading': 'Chargement...',
        'dashboard.noNews': 'Aucune actualité disponible pour le moment.',
        'dashboard.error': 'Erreur lors du chargement des actualités',
        'dashboard.retry': 'Réessayer',
        'dashboard.topicAdded': 'Topic ajouté !',

        // Settings
        'settings.title': 'Paramètres du compte',
        'settings.profile': 'Profil',
        'settings.email': 'Email',
        'settings.username': 'Nom d\'utilisateur',
        'settings.usernamePlaceholder': 'Votre nom d\'utilisateur',
        'settings.updateProfile': 'Mettre à jour le profil',
        'settings.appearance': 'Apparence',
        'settings.lightMode': 'Mode clair',
        'settings.darkMode': 'Mode sombre',
        'settings.account': 'Compte',
        'settings.deleteWarning': 'Une fois votre compte supprimé, toutes vos données seront définitivement effacées. Cette action est irréversible.',
        'settings.deleteAccount': 'Supprimer mon compte',
        'settings.profileUpdated': 'Profil mis à jour avec succès !',
        'settings.usernameEmpty': 'Le nom d\'utilisateur ne peut pas être vide',
        'settings.updateError': 'Erreur lors de la mise à jour',
        'settings.deleteConfirm': '⚠️ Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible !',
        'settings.deleteConfirm2': '🚨 DERNIÈRE CONFIRMATION : Toutes vos données seront perdues. Continuer ?',
        'settings.accountDeleted': '✅ Compte supprimé avec succès',
        'settings.deleteError': 'Erreur lors de la suppression',
        'settings.themeActivated': 'activé',

        // Auth
        'auth.login': 'Connexion',
        'auth.signup': 'Créer un compte',
        'auth.email': 'Email',
        'auth.password': 'Mot de passe',
        'auth.rememberMe': 'Se souvenir de moi',
        'auth.forgotPassword': 'Mot de passe oublié ?',
        'auth.noAccount': 'Pas encore de compte ?',
        'auth.hasAccount': 'Déjà un compte ?',

        // Messages
        'msg.languageChanged': 'Langue changée en',
        'msg.newsRefreshed': 'Actualités rafraîchies !',
    },

    en: {
        // Navbar
        'nav.search': 'Search a topic...',
        'nav.settings': 'Settings',
        'nav.logout': 'Logout',
        'nav.darkMode': 'Dark mode',
        'nav.lightMode': 'Light mode',
        'nav.language': 'English',
        'nav.backToDashboard': '← Back to Dashboard',

        // Sidebar
        'sidebar.categories': 'Categories',
        'category.general': 'General',
        'category.business': 'Business',
        'category.technology': 'Technology',
        'category.science': 'Science',
        'category.health': 'Health',
        'category.sports': 'Sports',
        'category.entertainment': 'Entertainment',

        // Dashboard
        'dashboard.title': 'News',
        'dashboard.loading': 'Loading...',
        'dashboard.noNews': 'No news available at the moment.',
        'dashboard.error': 'Error loading news',
        'dashboard.retry': 'Retry',
        'dashboard.topicAdded': 'Topic added!',

        // Settings
        'settings.title': 'Account Settings',
        'settings.profile': 'Profile',
        'settings.email': 'Email',
        'settings.username': 'Username',
        'settings.usernamePlaceholder': 'Your username',
        'settings.updateProfile': 'Update profile',
        'settings.appearance': 'Appearance',
        'settings.lightMode': 'Light mode',
        'settings.darkMode': 'Dark mode',
        'settings.account': 'Account',
        'settings.deleteWarning': 'Once your account is deleted, all your data will be permanently erased. This action is irreversible.',
        'settings.deleteAccount': 'Delete my account',
        'settings.profileUpdated': 'Profile updated successfully!',
        'settings.usernameEmpty': 'Username cannot be empty',
        'settings.updateError': 'Error during update',
        'settings.deleteConfirm': '⚠️ Are you sure you want to delete your account? This action is irreversible!',
        'settings.deleteConfirm2': '🚨 LAST CONFIRMATION: All your data will be lost. Continue?',
        'settings.accountDeleted': '✅ Account successfully deleted',
        'settings.deleteError': 'Error during deletion',
        'settings.themeActivated': 'activated',

        // Auth
        'auth.login': 'Login',
        'auth.signup': 'Sign up',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.rememberMe': 'Remember me',
        'auth.forgotPassword': 'Forgot password?',
        'auth.noAccount': 'No account yet?',
        'auth.hasAccount': 'Already have an account?',

        // Messages
        'msg.languageChanged': 'Language changed to',
        'msg.newsRefreshed': 'News refreshed!',
    }
};

// Fonction pour obtenir une traduction
export const t = (key, lang = null) => {
    const currentLang = lang || localStorage.getItem('language') || 'fr';
    return translations[currentLang][key] || key;
};

// Fonction pour traduire toute la page
export const translatePage = () => {
    const currentLang = localStorage.getItem('language') || 'fr';

    // Traduire tous les éléments avec data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = translations[currentLang][key];

        if (translation) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        }
    });

    // Traduire les placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const translation = translations[currentLang][key];
        if (translation) {
            element.placeholder = translation;
        }
    });
};
