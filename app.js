// ================================================
// NEWSLY AI - Version Sécurisée avec API Routes
// ================================================

// ================================================
// CONFIGURATION
// ================================================
const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : ''; // En production Vercel, les API routes sont sur le même domaine

// ================================================
// GESTION DE SESSION
// ================================================
let currentUser = null;
let authToken = null;

// Charger la session depuis localStorage
const loadSession = () => {
    const session = localStorage.getItem('session');
    if (session) {
        try {
            const data = JSON.parse(session);
            currentUser = data.user;
            authToken = data.access_token;
            return true;
        } catch (e) {
            console.error('Erreur chargement session:', e);
        }
    }
    return false;
};

// Sauvegarder la session
const saveSession = (user, token) => {
    currentUser = user;
    authToken = token;
    localStorage.setItem('session', JSON.stringify({ user, access_token: token }));
};

// Effacer la session
const clearSession = () => {
    currentUser = null;
    authToken = null;
    localStorage.removeItem('session');
};

// ================================================
// API CALLS - Authentification
// ================================================

// Connexion
export const login = async (email, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erreur de connexion');
        }

        saveSession(data.user, data.session.access_token);
        return { success: true, user: data.user };

    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
};

// Inscription
export const signup = async (email, password, username) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, username })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erreur d\'inscription');
        }

        if (data.session) {
            saveSession(data.user, data.session.access_token);
        }

        return { success: true, user: data.user };

    } catch (error) {
        console.error('Signup error:', error);
        return { success: false, error: error.message };
    }
};

// Renvoyer l'email de confirmation
export const resendConfirmation = async (email) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/resend`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erreur lors du renvoi');
        }

        return { success: true, message: data.message };

    } catch (error) {
        console.error('Resend error:', error);
        return { success: false, error: error.message };
    }
};

// Déconnexion
export const logout = () => {
    clearSession();
    window.location.href = 'login.html';
};

// ================================================
// API CALLS - Actualités
// ================================================

// Récupérer les actualités
export const fetchNews = async (category = 'general', country = 'us', page = 1) => {
    try {
        const url = `${API_BASE_URL}/api/news?category=${category}&country=${country}&page=${page}`;

        const response = await fetch(url, {
            headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erreur de récupération des news');
        }

        return { success: true, articles: data.articles };

    } catch (error) {
        console.error('News fetch error:', error);
        return { success: false, error: error.message, articles: [] };
    }
};

// ================================================
// API CALLS - Profil utilisateur
// ================================================

// Récupérer le profil
export const getUserProfile = async () => {
    if (!authToken) {
        return { success: false, error: 'Non authentifié' };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erreur de récupération du profil');
        }

        return { success: true, profile: data };

    } catch (error) {
        console.error('Profile fetch error:', error);
        return { success: false, error: error.message };
    }
};

// Mettre à jour le profil
export const updateUserProfile = async (username) => {
    if (!authToken) {
        return { success: false, error: 'Non authentifié' };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ username })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erreur de mise à jour du profil');
        }

        return { success: true, user: data.user };

    } catch (error) {
        console.error('Profile update error:', error);
        return { success: false, error: error.message };
    }
};

// Supprimer le compte
export const deleteAccount = async () => {
    if (!authToken) {
        return { success: false, error: 'Non authentifié' };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/user/delete`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erreur de suppression du compte');
        }

        // Effacer la session locale
        clearSession();

        return { success: true, message: data.message };

    } catch (error) {
        console.error('Delete account error:', error);
        return { success: false, error: error.message };
    }
};

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

// ================================================
// PROTECTION DES PAGES
// ================================================

// Vérifier si l'utilisateur est authentifié
export const checkAuth = () => {
    const isAuthenticated = loadSession();

    // Pages qui nécessitent une authentification
    const protectedPages = ['dashboard.html'];
    const currentPage = window.location.pathname.split('/').pop();

    if (protectedPages.includes(currentPage) && !isAuthenticated) {
        window.location.href = 'login.html';
        return false;
    }

    // Rediriger vers dashboard si déjà connecté sur login/signup
    const authPages = ['login.html', 'signup.html'];
    if (authPages.includes(currentPage) && isAuthenticated) {
        window.location.href = 'dashboard.html';
        return false;
    }

    return isAuthenticated;
};

// ================================================
// INITIALISATION
// ================================================

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    createThemeToggle();
    loadSession(); // Charger la session au démarrage
});

// Exporter les fonctions utiles
export { currentUser, authToken, loadSession };
