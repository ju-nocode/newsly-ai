// ================================================
// SAFE LOCALSTORAGE WRAPPER
// ================================================
const safeLocalStorage = {
    getItem: (key) => {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.error('localStorage.getItem error:', e);
            return null;
        }
    },
    setItem: (key, value) => {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            console.error('localStorage.setItem error (quota exceeded?):', e);
            return false;
        }
    },
    removeItem: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('localStorage.removeItem error:', e);
            return false;
        }
    }
};

// ================================================
// CONFIGURATION
// ================================================
const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : ''; // En production Vercel, les API routes sont sur le mÃªme domaine

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

            // VÃ©rifier si le token n'est pas trop gros (limite Vercel: ~16KB)
            const tokenSize = authToken?.length || 0;
            if (tokenSize > 100000) {
                console.error('âŒ Token trop volumineux dÃ©tectÃ© (' + Math.round(tokenSize/1024) + ' KB), nettoyage...');
                clearSession();
                alert('âš ï¸ Votre session contenait des donnÃ©es trop volumineuses. Veuillez contacter le support.');
                window.location.href = 'index.html';
                return false;
            }

            console.log('âœ… Session chargÃ©e:', {
                userId: currentUser?.id,
                tokenPresent: !!authToken,
                tokenLength: tokenSize
            });
            return true;
        } catch (e) {
            console.error('âŒ Erreur chargement session:', e);
            clearSession();
        }
    }
    console.log('âš ï¸ Aucune session trouvÃ©e dans localStorage');
    return false;
};

// Sauvegarder la session
const saveSession = (user, token) => {
    currentUser = user;
    authToken = token;
    localStorage.setItem('session', JSON.stringify({ user, access_token: token }));
    console.log('ðŸ’¾ Session sauvegardÃ©e:', {
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

        const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password,
                metadata: userMetadata,
                username: metadata.username,
                full_name: metadata.full_name,
                country: metadata.country,
                city: metadata.city,
                phone: metadata.phone
            })
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

// DÃ©connexion
export const logout = () => {
    clearSession();
    window.location.href = 'index.html';
};

// ================================================
// API CALLS - ActualitÃ©s
// ================================================

// RÃ©cupÃ©rer les actualitÃ©s
export const fetchNews = async (category = 'general', country = 'us', page = 1) => {
    try {
        const url = `${API_BASE_URL}/api/news?category=${encodeURIComponent(category)}&country=${encodeURIComponent(country)}&page=${encodeURIComponent(page)}`;

        const response = await fetch(url, {
            headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erreur de rÃ©cupÃ©ration des news');
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

// RÃ©cupÃ©rer le profil
export const getUserProfile = async () => {
    if (!authToken) {
        console.warn('âš ï¸ getUserProfile: Pas de token disponible');
        return { success: false, error: 'Non authentifiÃ©' };
    }

    console.log('ðŸ” getUserProfile: Envoi requÃªte avec token', {
        tokenPresent: !!authToken,
        tokenLength: authToken?.length,
        tokenStart: authToken?.substring(0, 20) + '...'
    });

    try {
        const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        console.log('ðŸ“¥ getUserProfile: RÃ©ponse reÃ§ue', {
            status: response.status,
            statusText: response.statusText,
            contentType: response.headers.get('content-type')
        });

        // Si le token est invalide ou expirÃ©, dÃ©connecter l'utilisateur
        if (response.status === 401) {
            console.error('âŒ Token invalide ou expirÃ©, dÃ©connexion...');
            clearSession();
            window.location.href = 'index.html';
            return { success: false, error: 'Session expirÃ©e' };
        }

        // VÃ©rifier si la rÃ©ponse est du JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error('âŒ RÃ©ponse non-JSON reÃ§ue:', contentType);
            throw new Error(`RÃ©ponse invalide du serveur (${response.status})`);
        }

        const data = await response.json();

        if (!response.ok) {
            console.error('âŒ Erreur API:', data.error);
            throw new Error(data.error || 'Erreur de rÃ©cupÃ©ration du profil');
        }

        console.log('âœ… getUserProfile: SuccÃ¨s', { email: data.email });
        return { success: true, profile: data };

    } catch (error) {
        console.error('Profile fetch error:', error);
        return { success: false, error: error.message };
    }
};

// Mettre Ã  jour le profil
export const updateUserProfile = async (profileData) => {
    if (!authToken) {
        return { success: false, error: 'Non authentifiÃ©' };
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

        // Si le token est invalide ou expirÃ©, dÃ©connecter l'utilisateur
        if (response.status === 401) {
            clearSession();
            window.location.href = 'index.html';
            return { success: false, error: 'Session expirÃ©e' };
        }

        // VÃ©rifier si la rÃ©ponse est du JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`RÃ©ponse invalide du serveur (${response.status})`);
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erreur de mise Ã  jour du profil');
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
        return { success: false, error: 'Non authentifiÃ©' };
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

        // Si le token est invalide ou expirÃ©, dÃ©connecter l'utilisateur
        if (response.status === 401) {
            clearSession();
            window.location.href = 'index.html';
            return { success: false, error: 'Session expirÃ©e' };
        }

        // VÃ©rifier si la rÃ©ponse est du JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`RÃ©ponse invalide du serveur (${response.status})`);
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
        return { success: false, error: 'Non authentifiÃ©' };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/user/delete`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        // Si le token est invalide ou expirÃ©, dÃ©connecter l'utilisateur
        if (response.status === 401) {
            clearSession();
            window.location.href = 'index.html';
            return { success: false, error: 'Session expirÃ©e' };
        }

        // VÃ©rifier si la rÃ©ponse est du JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`RÃ©ponse invalide du serveur (${response.status})`);
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

// ================================================
// DARK/LIGHT MODE
// ================================================

const THEME_STORAGE_KEY = 'theme';
const THEME_SWITCH_SELECTOR = 'input[type=\"checkbox\"][data-theme-toggle]';
const THEME_EVENT_NAME = 'newsly-theme-change';

const getStoredTheme = () => localStorage.getItem(THEME_STORAGE_KEY) || 'dark';

const getCurrentTheme = () => document.documentElement.getAttribute('data-theme') || getStoredTheme();

const applyTheme = (theme, { persist = true } = {}) => {
    document.documentElement.setAttribute('data-theme', theme);

    if (persist) {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    }

    updateThemeControls(theme);

    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(THEME_EVENT_NAME, { detail: { theme } }));
    }
};

const toggleTheme = (explicitTheme) => {
    const currentTheme = getCurrentTheme();
    const targetTheme = explicitTheme || (currentTheme === 'dark' ? 'light' : 'dark');
    applyTheme(targetTheme);
};

const updateThemeControls = (theme) => {
    // DÉSACTIVÉ - Theme button updates are now handled by theme-service.js
    // Only update checkboxes here to avoid conflicts

    document.querySelectorAll(THEME_SWITCH_SELECTOR).forEach((input) => {
        input.checked = theme === 'dark';
    });

    // Theme text and button icons are now managed by theme-service.js
};

const handleThemeSwitchChange = (event) => {
    const desiredTheme = event.target.checked ? 'dark' : 'light';
    toggleTheme(desiredTheme);
};

const attachThemeSwitchListeners = () => {
    document.querySelectorAll(THEME_SWITCH_SELECTOR).forEach((input) => {
        input.removeEventListener('change', handleThemeSwitchChange);
        input.addEventListener('change', handleThemeSwitchChange);
    });

    updateThemeControls(getCurrentTheme());
};

// Initialiser le thème au chargement
const initTheme = () => {
    const savedTheme = getStoredTheme();
    applyTheme(savedTheme, { persist: false });
};

// Créer le bouton de toggle du thème
const createThemeToggle = () => {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    let themeToggleBtn = document.getElementById('themeToggleBtn');
    if (!themeToggleBtn) {
        themeToggleBtn = document.createElement('button');
        themeToggleBtn.className = 'theme-toggle';
        themeToggleBtn.id = 'themeToggleBtn';
        themeToggleBtn.setAttribute('aria-label', 'Toggle dark/light mode');

        // Create img element with Icons8 image (with correct color based on theme)
        const img = document.createElement('img');
        const currentTheme = getCurrentTheme();
        const iconColor = currentTheme === 'dark' ? 'FFFFFF' : '000000';
        img.src = currentTheme === 'dark'
            ? `https://img.icons8.com/ios-filled/50/${iconColor}/moon-symbol.png`
            : `https://img.icons8.com/ios-filled/50/${iconColor}/sun--v1.png`;
        img.alt = currentTheme === 'dark' ? 'Dark mode' : 'Light mode';
        img.style.width = '1.25rem';
        img.style.height = '1.25rem';
        img.style.display = 'block';

        themeToggleBtn.appendChild(img);
        navLinks.insertBefore(themeToggleBtn, navLinks.firstChild);
    }

    // Add event listener directly to ensure it works
    themeToggleBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const currentTheme = getCurrentTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        console.log(`🔄 Theme button clicked: ${currentTheme} → ${newTheme}`);
        toggleTheme(newTheme);
    });
};

// PROTECTION DES PAGES
// ================================================

// VÃ©rifier si l'utilisateur est authentifiÃ©
export const checkAuth = () => {
    const isAuthenticated = loadSession();

    // Pages qui nÃ©cessitent une authentification
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
            return { success: false, error: 'Non authentifiÃ©' };
        }
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/particles/config`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erreur de rÃ©cupÃ©ration de la config');
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
            return { success: false, error: 'Non authentifiÃ© - veuillez vous reconnecter' };
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

// Charger la session immÃ©diatement au chargement du module
loadSession();

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    createThemeToggle();
    attachThemeSwitchListeners();
    loadSession(); // Recharger pour être sûr
});



// Expose getParticlesConfig globally for particles-config.js
if (typeof window !== 'undefined') {
    window.newslyToggleTheme = toggleTheme;
    window.newslyApplyTheme = (theme) => applyTheme(theme);
    window.newslyGetTheme = getCurrentTheme;
    window.newslyAttachThemeSwitchListeners = attachThemeSwitchListeners;
    window.getParticlesConfigFromDB = getParticlesConfig;
}

export { currentUser, authToken, loadSession, safeLocalStorage };
