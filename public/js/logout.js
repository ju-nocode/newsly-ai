// ================================================
// LOGOUT MODULE - Centralized logout management
// ================================================
// Module centralisé pour gérer la déconnexion sur toutes les pages

/**
 * Perform logout - clear session, invalidate token, redirect
 * @param {boolean} skipConfirmation - Skip confirmation dialog (default: false)
 */
export async function performLogout(skipConfirmation = false) {
    // Ask for confirmation unless skipped
    if (!skipConfirmation) {
        const confirmed = confirm('Voulez-vous vraiment vous déconnecter ?');
        if (!confirmed) {
            return false;
        }
    }

    console.log('🚪 Logout initiated...');

    try {
        // 1. Sign out from Supabase (invalidates token)
        if (window.supabase) {
            console.log('📤 Signing out from Supabase...');
            const { error } = await window.supabase.auth.signOut();

            if (error) {
                console.error('❌ Supabase signOut error:', error);
            } else {
                console.log('✅ Supabase session cleared');
            }
        }

        // 2. Clear all localStorage data
        console.log('🧹 Clearing localStorage...');
        const keysToKeep = []; // Add keys to preserve if needed
        const allKeys = Object.keys(localStorage);

        allKeys.forEach(key => {
            if (!keysToKeep.includes(key)) {
                localStorage.removeItem(key);
            }
        });
        console.log('✅ localStorage cleared');

        // 3. Clear sessionStorage
        console.log('🧹 Clearing sessionStorage...');
        sessionStorage.clear();
        console.log('✅ sessionStorage cleared');

        // 4. Invalidate User Intelligence System
        if (window.userIntelligence) {
            console.log('🔒 Invalidating user intelligence...');
            window.userIntelligence.isAuthenticated = false;
            window.userIntelligence.currentUser = null;
            console.log('✅ User intelligence invalidated');
        }

        // 5. Redirect to login page
        console.log('↪️ Redirecting to login page...');
        window.location.href = 'index.html';

        return true;

    } catch (error) {
        console.error('❌ Error during logout:', error);

        // Force redirect even if error
        alert('Une erreur est survenue lors de la déconnexion. Vous allez être redirigé.');
        window.location.href = 'index.html';

        return false;
    }
}

/**
 * Check if user is authenticated
 * @returns {boolean} - True if authenticated
 */
export async function isUserAuthenticated() {
    if (!window.supabase) {
        return false;
    }

    try {
        const { data: { user }, error } = await window.supabase.auth.getUser();
        return !!user && !error;
    } catch (e) {
        return false;
    }
}

/**
 * Protect page - redirect to login if not authenticated
 * Call this at the top of protected pages
 */
export async function protectPage() {
    const isAuth = await isUserAuthenticated();

    if (!isAuth) {
        console.warn('🚫 User not authenticated, redirecting to login...');
        window.location.href = 'index.html';
        return false;
    }

    return true;
}

/**
 * Initialize logout buttons on the page
 * Automatically finds all elements with data-logout attribute
 * Call this manually if needed for dynamic logout buttons
 */
export function initLogoutButtons() {
    const logoutButtons = document.querySelectorAll('[data-logout], .logout-btn');

    logoutButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            await performLogout();
        });
    });

    console.log(`✅ Initialized ${logoutButtons.length} logout buttons`);
}
