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

        // Log security event
        await logSecurityEvent('login', {
            success: true,
            email: data.user.email
        });

        return { success: true, user: data.user };

    } catch (error) {
        console.error('Login error:', error);

        // Log failed login attempt
        logSecurityEvent('failed_login', {
            success: false,
            error: error.message
        }).catch(() => {}); // Ignore errors in logging

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
export const logout = async () => {
    // Log security event before clearing session
    await logSecurityEvent('logout', {
        timestamp: new Date().toISOString()
    }).catch(() => {}); // Ignore errors

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

// Expose getParticlesConfig globally for particles-config.js
if (typeof window !== 'undefined') {
    window.getParticlesConfigFromDB = getParticlesConfig;
}

// Afficher une popup de sécurité
const showSecurityAlert = (message, callback) => {
    console.log('🔔 showSecurityAlert called:', message);

    // Créer l'overlay si il n'existe pas déjà
    let overlay = document.getElementById('security-alert-overlay');

    if (!overlay) {
        console.log('📦 Creating security alert overlay');
        overlay = document.createElement('div');
        overlay.id = 'security-alert-overlay';
        overlay.className = 'security-alert-overlay';
        overlay.innerHTML = `
            <div class="security-alert-container">
                <div class="security-alert-header">
                    <div class="security-alert-icon">🔒</div>
                    <h3 class="security-alert-title">Sécurité</h3>
                </div>
                <div class="security-alert-body">
                    <p class="security-alert-message"></p>
                </div>
                <div class="security-alert-footer">
                    <button class="security-alert-btn">Compris</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        console.log('✅ Overlay added to body');

        // Event listener sur le bouton
        const btn = overlay.querySelector('.security-alert-btn');
        btn.addEventListener('click', () => {
            console.log('🖱️ Button clicked, closing popup');
            overlay.classList.remove('show');
            setTimeout(() => {
                if (overlay.dataset.callback === 'true') {
                    const callbackFn = overlay.callbackFn;
                    if (callbackFn) {
                        console.log('🔄 Executing callback');
                        callbackFn();
                    }
                }
            }, 300);
        });
    }

    // Mettre à jour le message
    overlay.querySelector('.security-alert-message').textContent = message;

    // Stocker le callback
    if (callback) {
        overlay.dataset.callback = 'true';
        overlay.callbackFn = callback;
    } else {
        overlay.dataset.callback = 'false';
        overlay.callbackFn = null;
    }

    // Afficher
    console.log('👁️ Showing popup');
    setTimeout(() => {
        overlay.classList.add('show');

        // Force le style en cas de problème CSS
        overlay.style.zIndex = '99999';
        overlay.style.display = 'flex';
        overlay.style.opacity = '1';
        overlay.style.visibility = 'visible';
        overlay.style.pointerEvents = 'auto';

        console.log('✅ Popup should now be visible');
        console.log('📊 Overlay computed style:', {
            display: window.getComputedStyle(overlay).display,
            opacity: window.getComputedStyle(overlay).opacity,
            zIndex: window.getComputedStyle(overlay).zIndex,
            visibility: window.getComputedStyle(overlay).visibility
        });
    }, 10);
};

// Vérifier la validité de la session (global logout check)
export const checkSessionValidity = async () => {
    if (!authToken) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/user/check-session`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            // Déconnecter seulement si shouldLogout est explicitement true
            // ET que c'est à cause d'un global logout (pas juste un token invalide)
            if (data.shouldLogout && data.reason === 'global_logout') {
                console.warn('Session invalidee:', data.reason);
                showSecurityAlert(
                    data.message || 'Vous avez été déconnecté de tous les appareils',
                    () => {
                        clearSession();
                        window.location.href = 'index.html';
                    }
                );
            }
        } else if (response.status === 401) {
            // 401 = token invalide, mais on ne force pas le logout ici
            // car ça pourrait être un token expiré normalement
            console.warn('Token non valide ou expiré (401)');
        }
    } catch (error) {
        // En cas d'erreur réseau, on laisse l'utilisateur connecté
        console.warn('Impossible de verifier la session:', error.message);
    }
};

// Vérifier la session de manière quasi-instantanée sur les pages protégées
if (typeof window !== 'undefined') {
    const protectedPages = ['dashboard.html', 'settings.html'];
    const currentPage = window.location.pathname.split('/').pop();

    if (protectedPages.includes(currentPage)) {
        // Attendre que le DOM soit chargé avant d'initialiser
        document.addEventListener('DOMContentLoaded', () => {
            // Charger la session d'abord
            const hasSession = loadSession();

            // Ne lancer les vérifications que si on a un token
            if (hasSession && authToken) {
                console.log('🔒 Initialisation des vérifications de session');

                // Vérification initiale
                setTimeout(() => checkSessionValidity(), 2000);

                // 1. Vérification périodique toutes les 3 secondes
                setInterval(() => {
                    if (authToken) checkSessionValidity();
                }, 3000);

                // 2. Vérification immédiate quand l'onglet redevient visible
                document.addEventListener('visibilitychange', () => {
                    if (!document.hidden && authToken) {
                        checkSessionValidity();
                    }
                });

                // 3. Vérification immédiate au focus de la fenêtre
                window.addEventListener('focus', () => {
                    if (authToken) {
                        checkSessionValidity();
                    }
                });

                // 4. Vérification immédiate sur toute interaction utilisateur (clic, touche)
                let lastCheckTime = Date.now();
                const checkOnInteraction = () => {
                    if (!authToken) return;
                    // Éviter de checker trop souvent (max 1x par seconde)
                    const now = Date.now();
                    if (now - lastCheckTime > 1000) {
                        lastCheckTime = now;
                        checkSessionValidity();
                    }
                };

                document.addEventListener('click', checkOnInteraction, { passive: true });
                document.addEventListener('keydown', checkOnInteraction, { passive: true });
                document.addEventListener('touchstart', checkOnInteraction, { passive: true });
            }
        });
    }
}

export { currentUser, authToken, loadSession, safeLocalStorage };

// ================================================
// SECURITY AUDIT HELPER
// ================================================

/**
 * Log a security event to user_activity_log
 * @param {string} activityType - Type d'activité (login, logout, password_change, etc.)
 * @param {object} context - Contexte additionnel (ip, device, etc.)
 */
export const logSecurityEvent = async (activityType, context = {}) => {
    if (!authToken) {
        loadSession();
        if (!authToken) {
            console.warn('⚠️ Cannot log security event: not authenticated');
            return { success: false, error: 'Non authentifié' };
        }
    }

    try {
        // Récupérer l'IP publique + géolocalisation (avec fallback rapide)
        let publicIP = 'Non disponible';
        let location = null;
        try {
            // ip-api.com fournit IP + géolocalisation en une seule requête
            const geoResponse = await fetch('http://ip-api.com/json/?fields=status,message,country,regionName,city,zip,lat,lon,query', { timeout: 3000 });
            if (geoResponse.ok) {
                const geoData = await geoResponse.json();
                if (geoData.status === 'success') {
                    publicIP = geoData.query || 'Non disponible';
                    location = {
                        city: geoData.city || null,
                        region: geoData.regionName || null,
                        country: geoData.country || null,
                        latitude: geoData.lat || null,
                        longitude: geoData.lon || null
                    };
                }
            }
        } catch (geoError) {
            console.warn('⚠️ Could not fetch geolocation:', geoError.message);
        }

        // Enrichir le contexte avec des infos du navigateur
        const enrichedContext = {
            ...context,
            ip: publicIP,
            location: location,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            platform: navigator.platform,
            language: navigator.language
        };

        const response = await fetch(`${API_BASE_URL}/api/user/activity-log`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                activity_type: activityType,
                context: enrichedContext,
                device_type: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to log security event: ${response.status}`);
        }

        const data = await response.json();
        console.log(`✅ Security event logged: ${activityType}`, { ip: publicIP });
        return { success: true, data };

    } catch (error) {
        console.error('Error logging security event:', error);
        return { success: false, error: error.message };
    }
};
