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

            // Vérifier si le token n'est pas trop gros (limite Vercel: ~16KB)
            const tokenSize = authToken?.length || 0;
            if (tokenSize > 100000) {
                console.error('❌ Token trop volumineux détecté (' + Math.round(tokenSize/1024) + ' KB), nettoyage...');
                clearSession();
                alert('⚠️ Votre session contenait des données trop volumineuses. Veuillez contacter le support.');
                window.location.href = 'index.html';
                return false;
            }

            console.log('✅ Session chargée:', {
                userId: currentUser?.id,
                tokenPresent: !!authToken,
                tokenLength: tokenSize
            });
            return true;
        } catch (e) {
            console.error('❌ Erreur chargement session:', e);
            clearSession();
        }
    }
    console.log('⚠️ Aucune session trouvée dans localStorage');
    return false;
};

// Sauvegarder la session
const saveSession = (user, token) => {
    currentUser = user;
    authToken = token;
    localStorage.setItem('session', JSON.stringify({ user, access_token: token }));
    console.log('💾 Session sauvegardée:', {
        userId: user?.id,
        email: user?.email,
        tokenPresent: !!token,
        tokenLength: token?.length
    });
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
export const signup = async (email, password, metadata) => {
    try {
        // Si metadata est une string (ancien format), convertir en objet
        const userMetadata = typeof metadata === 'string'
            ? { username: metadata, full_name: metadata, display_name: metadata }
            : {
                username: metadata.username || email.split('@')[0],
                full_name: metadata.full_name || metadata.username || email.split('@')[0],
                display_name: metadata.username || email.split('@')[0],
                phone: metadata.phone || '',
                bio: metadata.bio || '',
                avatar_url: metadata.avatar_url || '',
                country: metadata.country || 'France',
                city: metadata.city || 'Paris'
            };

        const requestBody = {
            email,
            password,
            metadata: userMetadata,
            username: metadata.username,
            full_name: metadata.full_name,
            country: metadata.country,
            city: metadata.city,
            phone: metadata.phone
        };

        console.log('=== SIGNUP CLIENT REQUEST ===');
        console.log('Email:', email);
        console.log('Username:', metadata.username);
        console.log('Full name:', metadata.full_name);
        console.log('Country:', metadata.country);
        console.log('City:', metadata.city);
        console.log('Phone:', metadata.phone);
        console.log('Request body:', requestBody);

        const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
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
    window.location.href = 'index.html';
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
        console.warn('⚠️ getUserProfile: Pas de token disponible');
        return { success: false, error: 'Non authentifié' };
    }

    console.log('🔍 getUserProfile: Envoi requête avec token', {
        tokenPresent: !!authToken,
        tokenLength: authToken?.length,
        tokenStart: authToken?.substring(0, 20) + '...'
    });

    try {
        const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        console.log('📥 getUserProfile: Réponse reçue', {
            status: response.status,
            statusText: response.statusText,
            contentType: response.headers.get('content-type')
        });

        // Si le token est invalide ou expiré, déconnecter l'utilisateur
        if (response.status === 401) {
            console.error('❌ Token invalide ou expiré, déconnexion...');
            clearSession();
            window.location.href = 'index.html';
            return { success: false, error: 'Session expirée' };
        }

        // Vérifier si la réponse est du JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error('❌ Réponse non-JSON reçue:', contentType);
            throw new Error(`Réponse invalide du serveur (${response.status})`);
        }

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ Erreur API:', data.error);
            throw new Error(data.error || 'Erreur de récupération du profil');
        }

        console.log('✅ getUserProfile: Succès', { email: data.email });
        return { success: true, profile: data };

    } catch (error) {
        console.error('Profile fetch error:', error);
        return { success: false, error: error.message };
    }
};

// Mettre à jour le profil
export const updateUserProfile = async (profileData) => {
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
            body: JSON.stringify(profileData)
        });

        // Si le token est invalide ou expiré, déconnecter l'utilisateur
        if (response.status === 401) {
            clearSession();
            window.location.href = 'index.html';
            return { success: false, error: 'Session expirée' };
        }

        // Vérifier si la réponse est du JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`Réponse invalide du serveur (${response.status})`);
        }

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

// Changer le mot de passe
export const changePassword = async (newPassword) => {
    if (!authToken) {
        return { success: false, error: 'Non authentifié' };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/user/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ newPassword })
        });

        // Si le token est invalide ou expiré, déconnecter l'utilisateur
        if (response.status === 401) {
            clearSession();
            window.location.href = 'index.html';
            return { success: false, error: 'Session expirée' };
        }

        // Vérifier si la réponse est du JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`Réponse invalide du serveur (${response.status})`);
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erreur lors du changement de mot de passe');
        }

        return { success: true, message: data.message };

    } catch (error) {
        console.error('Password change error:', error);
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

        // Si le token est invalide ou expiré, déconnecter l'utilisateur
        if (response.status === 401) {
            clearSession();
            window.location.href = 'index.html';
            return { success: false, error: 'Session expirée' };
        }

        // Vérifier si la réponse est du JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`Réponse invalide du serveur (${response.status})`);
        }

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
    const protectedPages = ['dashboard.html', 'settings.html'];
    const currentPage = window.location.pathname.split('/').pop();

    if (protectedPages.includes(currentPage) && !isAuthenticated) {
        window.location.href = 'index.html';
        return false;
    }

    return isAuthenticated;
};

// ================================================
// PARTICLES CONFIG - DATABASE
// ================================================

// Get particles config from database
export const getParticlesConfig = async () => {
    if (!authToken) {
        loadSession();
        if (!authToken) {
            return { success: false, error: 'Non authentifié' };
        }
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/particles/config`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erreur de récupération de la config');
        }

        return { success: true, config: data.config };
    } catch (error) {
        console.error('Get particles config error:', error);
        return { success: false, error: error.message };
    }
};

// Save particles config to database
export const saveParticlesConfigToDB = async (config) => {
    if (!authToken) {
        loadSession();
        if (!authToken) {
            return { success: false, error: 'Non authentifié - veuillez vous reconnecter' };
        }
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/particles/config`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ config })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.details || 'Erreur de sauvegarde de la config');
        }

        return { success: true, data };
    } catch (error) {
        console.error('Save particles config error:', error);
        return { success: false, error: error.message };
    }
};

// ================================================
// INITIALISATION
// ================================================

// Charger la session immédiatement au chargement du module
loadSession();

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    createThemeToggle();
    loadSession(); // Recharger pour être sûr
});

// Expose getParticlesConfig globally for particles-config.js
if (typeof window !== 'undefined') {
    window.getParticlesConfigFromDB = getParticlesConfig;
}

// Exporter les fonctions utiles
export { currentUser, authToken, loadSession };
