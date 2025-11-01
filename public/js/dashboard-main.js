// ================================================
// DASHBOARD PAGE - Main Script
// ================================================

import { checkAuth, logout, getUserProfile, fetchNews, deleteAccount, currentUser } from './app.js';
import { displayNews, escapeHtml, showError, showSuccess } from './dashboard-utils.js';
import { tSync as t, translatePage, changeLanguage } from './translation-service.js';
import { initNavbar } from './navbar-component.js';
import { initThemeSystem } from './theme-manager.js';
import { initWeatherWidget, refreshWeatherLocation } from './weather.js';
import { initLanguageSwitcher } from './language-switcher.js';
import { showSuccess as notifySuccess, showError as notifyError, showInfo, showWarning as notifyWarning } from './notifications.js';
import { showLoader, hideLoader, showSkeletons, hideSkeletons, addButtonLoader, removeButtonLoader } from './loader.js';
import { fadeIn, shake, stagger, ripple } from './animations.js';
import { showPageLoader, hidePageLoader, navigateWithLoader } from './page-loader.js';
import { showShimmerLoader, hideShimmerLoader, showShimmerError } from './shimmer-loader.js';
import { initRippleButtons } from './micro-interactions.js';
//import { initIconReplacement } from './icon-replacer.js';

// Détecter Chrome iOS (problèmes de performance avec modules lourds)
const isChromeIOS = /CriOS/i.test(navigator.userAgent);
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Lazy load modules lourds uniquement si pas Chrome iOS
let userIntelligence = null;
let initUniversalSearchBar = null;

if (!isChromeIOS) {
    // Import conditionnel des modules lourds
    import('./user-intelligence-system.js').then(module => {
        userIntelligence = module.userIntelligence;
        window.userIntelligence = userIntelligence;
    }).catch(err => console.warn('User intelligence system disabled:', err));

    import('./search-bar-universal.js').then(module => {
        initUniversalSearchBar = module.initUniversalSearchBar;
        // Initialiser après un délai pour éviter le freeze
        setTimeout(() => {
            if (initUniversalSearchBar) initUniversalSearchBar();
        }, 2000);
    }).catch(err => console.warn('Search bar disabled:', err));
} else {
    console.log('⚡ Chrome iOS détecté - Mode optimisé activé');
}

// Initialize navbar component
initNavbar('div.mobile-overlay', { showMobileSidebarBtn: true });

// Replace icons8 with Flowbite SVG icons
initIconReplacement();

// Initialize ripple effect EARLY - avant tous les autres listeners
initRippleButtons();

// Initialize theme system and weather widget after navbar is rendered
// Simplifier pour Chrome iOS (pas de double requestAnimationFrame)
const initUIComponents = () => {
    initThemeSystem();
    initWeatherWidget();
    initLanguageSwitcher();

};

if (isChromeIOS || isMobile) {
    // Chrome iOS / Mobile : init directe sans RAF
    setTimeout(initUIComponents, 100);
} else {
    // Desktop : double RAF pour garantir le DOM
    requestAnimationFrame(() => {
        requestAnimationFrame(initUIComponents);
    });
}


let currentCategory = 'general';
let currentCountry = 'us'; // Par défaut : États-Unis
let userPreferences = {
    followed_categories: [],
    preferred_countries: []
};

// ================================================
// PREFERENCES MANAGEMENT - Pin System
// ================================================

// Load user feed preferences from Supabase
const loadUserPreferences = async () => {
    try {
        const session = JSON.parse(localStorage.getItem('session'));
        if (!session || !session.access_token) {
            console.warn('No session found for preferences');
            return;
        }

        const response = await fetch('/api/user/feed-preferences', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load preferences');
        }

        const data = await response.json();
        userPreferences.followed_categories = data.followed_categories || [];
        userPreferences.preferred_countries = data.preferred_countries || [];

        console.log('✅ Preferences loaded:', userPreferences);

        // Update UI with loaded preferences
        updatePinsUI();

    } catch (error) {
        console.error('Error loading preferences:', error);
    }
};

// Update pins UI based on loaded preferences
const updatePinsUI = () => {
    // Update category pins
    userPreferences.followed_categories.forEach(category => {
        const pinBtn = document.querySelector(`[data-pin-category="${category}"]`);
        if (pinBtn) {
            pinBtn.classList.add('pinned');
        }
    });

    // Update country pins
    userPreferences.preferred_countries.forEach(country => {
        const pinBtn = document.querySelector(`[data-pin-country="${country}"]`);
        if (pinBtn) {
            pinBtn.classList.add('pinned');
        }
    });
};

// Save preferences to Supabase
const saveUserPreferences = async () => {
    try {
        const session = JSON.parse(localStorage.getItem('session'));
        if (!session || !session.access_token) {
            console.warn('No session found for saving preferences');
            return;
        }

        const response = await fetch('/api/user/feed-preferences', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                followed_categories: userPreferences.followed_categories,
                preferred_countries: userPreferences.preferred_countries
            })
        });

        if (!response.ok) {
            throw new Error('Failed to save preferences');
        }

        console.log('✅ Preferences saved');

    } catch (error) {
        console.error('Error saving preferences:', error);
        notifyError('Échec de la sauvegarde des préférences');
    }
};

// Toggle category pin
const toggleCategoryPin = async (category) => {
    const pinBtn = document.querySelector(`[data-pin-category="${category}"]`);
    if (!pinBtn) return;

    const isPinned = userPreferences.followed_categories.includes(category);

    if (isPinned) {
        // Unpin
        userPreferences.followed_categories = userPreferences.followed_categories.filter(c => c !== category);
        pinBtn.classList.remove('pinned');

        // Get category display name
        const categoryLink = document.querySelector(`[data-category="${category}"] span`);
        const categoryName = categoryLink ? categoryLink.textContent : category;
        showInfo(`Catégorie "${categoryName}" retirée des favoris`);
    } else {
        // Pin
        userPreferences.followed_categories.push(category);
        pinBtn.classList.add('pinned');

        // Get category display name
        const categoryLink = document.querySelector(`[data-category="${category}"] span`);
        const categoryName = categoryLink ? categoryLink.textContent : category;
        notifySuccess(`Catégorie "${categoryName}" ajoutée aux favoris`);
    }

    // Log for debugging
    console.log('📌 Preferences after toggle:', {
        followed_categories: userPreferences.followed_categories,
        preferred_countries: userPreferences.preferred_countries
    });

    await saveUserPreferences();
};

// Toggle country pin
const toggleCountryPin = async (country) => {
    const pinBtn = document.querySelector(`[data-pin-country="${country}"]`);
    if (!pinBtn) return;

    const isPinned = userPreferences.preferred_countries.includes(country);

    // Get country display name
    const countryLink = document.querySelector(`[data-country="${country}"] span`);
    const countryName = countryLink ? countryLink.textContent : country;

    if (isPinned) {
        // Unpin
        userPreferences.preferred_countries = userPreferences.preferred_countries.filter(c => c !== country);
        pinBtn.classList.remove('pinned');
        showInfo(`Pays "${countryName}" retiré des favoris`);
    } else {
        // Pin
        userPreferences.preferred_countries.push(country);
        pinBtn.classList.add('pinned');
        notifySuccess(`Pays "${countryName}" ajouté aux favoris`);
    }

    // Log for debugging
    console.log('📌 Preferences after toggle:', {
        followed_categories: userPreferences.followed_categories,
        preferred_countries: userPreferences.preferred_countries
    });

    await saveUserPreferences();
};

// Vérifier l'authentification
const isAuth = checkAuth();
if (!isAuth) {
    navigateWithLoader('index.html');
}

// Charger le profil utilisateur
const loadProfile = async () => {
    const result = await getUserProfile();
    if (result.success) {
        const displayName = result.profile.display_name || `${result.profile.first_name} ${result.profile.last_name}`.trim() || result.profile.email.split('@')[0];
        const userRole = result.profile.role || 'user';

        // Burger menu display
        document.getElementById('userNameDisplay').textContent = `User: ${escapeHtml(displayName)}`;

        // Navbar role badge
        const navUserRole = document.getElementById('navUserRole');

        if (navUserRole) {
            if (userRole === 'admin') {
                navUserRole.textContent = 'Connecté en tant qu\'admin';
                navUserRole.className = 'user-role-badge admin';
            } else {
                navUserRole.textContent = `Connecté en tant que ${escapeHtml(displayName)}`;
                navUserRole.className = 'user-role-badge user';
            }
        }

        // Charger l'avatar dans le burger
        if (result.profile.avatar_url) {
            document.getElementById('burgerAvatarImage').src = result.profile.avatar_url;
        } else {
            document.getElementById('burgerAvatarImage').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3ecf8e&color=fff&size=72`;
        }
    }
};

// Charger les actualités
const loadNews = async (category = 'general', country = 'us') => {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const newsContainer = document.getElementById('newsContainer');

    // Masquer l'ancien indicateur
    loadingIndicator.style.display = 'none';

    // Démarrer le page loader
    showPageLoader();

    // Afficher le shimmer loader (sans timeout automatique)
    showShimmerLoader(newsContainer, 6);

    try {
        // Charger les news pour le pays sélectionné (timeout 10s intégré dans fetchNews)
        const result = await fetchNews(category, country, 1, 10000); // 10s timeout

        // Debug: afficher les résultats
        console.log('📰 loadNews result:', result);
        console.log(`📍 Country ${country}:`, result);

        // Si on a des articles → succès
        if (result.success && result.articles && result.articles.length > 0) {
            // Arrêter les shimmers
            hideShimmerLoader(newsContainer);

            // Arrêter le page loader en succès (bleu/vert)
            hidePageLoader(false);

            // Ajouter le code pays à chaque article pour l'affichage
            const articlesWithCountry = result.articles.map(article => ({
                ...article,
                countryCode: country
            }));

            console.log(`✅ Total articles chargés: ${articlesWithCountry.length}`);

            displayNews(articlesWithCountry, 'newsContainer');
            // Animate news cards on load
            setTimeout(() => {
                stagger('.news-card', fadeIn, 80);
            }, 100);
        } else {
            // Aucun article → garder les shimmers actifs et page loader rouge
            console.warn('⚠️ Aucun article disponible - shimmers restent actifs');

            // Les shimmers restent visibles et animés (ne rien faire)
            // Le container garde déjà les shimmers affichés

            // Page loader rouge si timeout/échec, bleu sinon
            if (result.timeout === true || !result.success) {
                hidePageLoader(true); // Rouge
                console.warn('⚠️ Échec API - page loader rouge');
            } else {
                hidePageLoader(false); // Bleu (cas rare)
            }
        }

    } catch (error) {
        console.error('❌ Erreur loadNews:', error);
        // En cas d'erreur critique, afficher le shimmer error et arrêter le page loader en rouge
        hidePageLoader(true); // Rouge = error
        showShimmerError(newsContainer, error.message || 'Erreur lors du chargement des actualités');
        notifyError('Échec du chargement des actualités', { duration: 6000 });
    } finally {
        loadingIndicator.style.display = 'none';
    }
};

// Gérer les clics sur les catégories
// Function to switch category and update URL
function switchToCategory(category) {
    const previousCategory = currentCategory;

    // Retirer la classe active de tous les boutons de catégorie
    document.querySelectorAll('.sidebar-menu-link[data-category]').forEach(b => b.classList.remove('active'));

    // Ajouter la classe active au bouton correspondant
    const activeBtn = document.querySelector(`.sidebar-menu-link[data-category="${category}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');

        // Mettre à jour le titre
        const title = activeBtn.querySelector('span').textContent;
        document.getElementById('categoryTitle').textContent = `Actualités ${title}`;
    }

    // Charger les news de cette catégorie
    currentCategory = category;

    // ✅ Track category change in user_activity_log
    if (userIntelligence && previousCategory !== category) {
        userIntelligence.logActivity('category_change', {
            from_category: previousCategory,
            to_category: category,
            timestamp: new Date().toISOString()
        }).catch(err => console.error('Error logging category change:', err));
    }

    loadNews(category, currentCountry);

    // Update URL with query parameter
    const url = new URL(window.location);
    url.searchParams.set('category', category);
    window.history.pushState({}, '', url);
}

// Function to switch country and update URL
function switchToCountry(country) {
    const previousCountry = currentCountry;

    // Retirer la classe active de tous les boutons de pays
    document.querySelectorAll('.sidebar-menu-link[data-country]').forEach(b => b.classList.remove('active'));

    // Ajouter la classe active au bouton correspondant
    const activeBtn = document.querySelector(`.sidebar-menu-link[data-country="${country}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // Charger les news de ce pays
    currentCountry = country;

    // ✅ Track country change in user_activity_log
    if (userIntelligence && previousCountry !== country) {
        userIntelligence.logActivity('country_filter_change', {
            from_countries: [previousCountry],
            to_countries: [country],
            filter_type: 'single',
            timestamp: new Date().toISOString()
        }).catch(err => console.error('Error logging country change:', err));
    }

    loadNews(currentCategory, country);

    // Update URL with query parameter
    const url = new URL(window.location);
    url.searchParams.set('country', country);
    window.history.pushState({}, '', url);
}

document.querySelectorAll('.sidebar-menu-link[data-category]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const category = btn.dataset.category;
        switchToCategory(category);
    });
});

document.querySelectorAll('.sidebar-menu-link[data-country]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const country = btn.dataset.country;
        switchToCountry(country);
    });
});

// ================================================
// PIN BUTTONS EVENT LISTENERS
// ================================================

// Category pin buttons
document.querySelectorAll('[data-pin-category]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const category = btn.dataset.pinCategory;
        await toggleCategoryPin(category);
    });
});

// Country pin buttons
document.querySelectorAll('[data-pin-country]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const country = btn.dataset.pinCountry;
        await toggleCountryPin(country);
    });
});

// Handle URL parameters on page load
const urlParams = new URLSearchParams(window.location.search);
const urlCategory = urlParams.get('category');
const urlCountry = urlParams.get('country');

if (urlCategory) {
    currentCategory = urlCategory;
}
if (urlCountry) {
    currentCountry = urlCountry;
    switchToCountry(urlCountry);
}
if (urlCategory) {
    switchToCategory(urlCategory);
}

// Gérer le burger menu
const burgerBtn = document.getElementById('burgerBtn');
const burgerMenu = document.getElementById('burgerMenu');

// Initialiser AVANT d'attacher les event listeners
let burgerInitialized = true;

burgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    burgerBtn.classList.toggle('active');
    burgerMenu.classList.toggle('show');
});

// Fermer le menu si on clique ailleurs
document.addEventListener('click', () => {
    burgerBtn.classList.remove('active');
    burgerMenu.classList.remove('show');
});

// Empêcher la fermeture si on clique dans le menu
burgerMenu.addEventListener('click', (e) => {
    e.stopPropagation();
});

// ================================================
// WEATHER WIDGET
// ================================================
// Weather is now managed by weather.js module

// Gérer les topics personnalisés
const topicSearch = document.getElementById('topicSearch');
const addTopicBtn = document.getElementById('addTopicBtn');

if (addTopicBtn) {
    addTopicBtn.addEventListener('click', () => {
    const topic = topicSearch.value.trim();
    if (!topic) return;

    // Créer un nouveau bouton de catégorie
    const categoriesList = document.querySelector('.sidebar-menu');
    const newCategory = document.createElement('li');
    newCategory.className = 'sidebar-menu-item';
    const newLink = document.createElement('a');
    newLink.className = 'sidebar-menu-link';
    newLink.href = '#';
    newLink.dataset.category = topic;
    newLink.innerHTML = `
        <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1z"/>
        </svg>
        <span>${escapeHtml(topic)}</span>
    `;
    newCategory.appendChild(newLink);

    // Ajouter l'événement de clic
    newLink.addEventListener('click', () => {
        document.querySelectorAll('.sidebar-menu-link[data-category]').forEach(b => b.classList.remove('active'));
        newLink.classList.add('active');

        currentCategory = topic;
        document.getElementById('categoryTitle').textContent = `Actualités ${escapeHtml(topic)}`;
        loadNews(topic);
    });

    categoriesList.appendChild(newCategory);
    topicSearch.value = '';
    notifySuccess(`Topic "${topic}" ajouté !`);
    });

    // Permettre l'ajout avec Enter
    if (topicSearch) {
        topicSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addTopicBtn.click();
            }
        });
    }
}

// Language switcher is now handled by language-switcher.js module

// Gérer le bouton Settings (burger menu)
document.getElementById('settingsBtn').addEventListener('click', () => {
    navigateWithLoader('settings.html');
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    logout();
});

// Bouton Logout (sidebar)
const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
if (sidebarLogoutBtn) {
    sidebarLogoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
}

// ================================================
// MENU MOBILE - Gestion sidebar responsive
// ================================================
const mobileSidebarBtn = document.getElementById('mobileSidebarBtn');
const mobileOverlay = document.getElementById('mobileOverlay');
const verticalSidebar = document.querySelector('.vertical-sidebar');

// Fonction pour fermer le menu mobile
const closeMobileMenu = () => {
    if (verticalSidebar) {
        verticalSidebar.classList.remove('mobile-open');
    }
    if (mobileOverlay) {
        mobileOverlay.classList.remove('show');
    }
    document.body.style.overflow = ''; // Réactiver scroll
};

// Fonction pour ouvrir le menu mobile
const openMobileMenu = () => {
    if (verticalSidebar) {
        verticalSidebar.classList.add('mobile-open');
    }
    if (mobileOverlay) {
        mobileOverlay.classList.add('show');
    }
    document.body.style.overflow = 'hidden'; // Empêcher scroll background
};

// Toggle menu avec le bouton burger
if (mobileSidebarBtn && verticalSidebar) {
    mobileSidebarBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (verticalSidebar.classList.contains('mobile-open')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    // Support touch events pour iOS
    mobileSidebarBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        mobileSidebarBtn.click();
    }, { passive: false });
}

// Fermer avec overlay (click et touch)
if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobileMenu);
    mobileOverlay.addEventListener('touchend', (e) => {
        e.preventDefault();
        closeMobileMenu();
    }, { passive: false });
}

// Fermer sidebar après sélection sur mobile (clic sur une catégorie ou pays)
document.querySelectorAll('.sidebar-menu-link[data-category], .sidebar-menu-link[data-country]').forEach(btn => {
    btn.addEventListener('click', () => {
        if (window.innerWidth <= 1024) {
            setTimeout(closeMobileMenu, 100); // Petit délai pour UX
        }
    });
});

// Fermer avec touche Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && verticalSidebar && verticalSidebar.classList.contains('mobile-open')) {
        closeMobileMenu();
    }
});

// Initialiser (optimisé pour Chrome iOS)
(async () => {
    // Afficher le loader pendant le chargement initial
    showPageLoader();

    try {
        // Traduire d'abord (synchrone)
        await translatePage();

        // Chrome iOS : charger profil + news en parallèle pour éviter freeze
        if (isChromeIOS || isMobile) {
            console.log('⚡ Chargement optimisé mobile');
            // Lancer en parallèle mais ignorer les erreurs pour éviter freeze
            await Promise.all([
                loadProfile().catch(err => console.warn('Profile load error:', err)),
                loadUserPreferences().catch(err => console.warn('Preferences load error:', err)),
                loadNews(currentCategory, currentCountry).catch(err => console.warn('News load error:', err))
            ]).catch(() => {
                // Si tout échoue, au moins la page ne freeze pas
                console.error('Failed to load dashboard data');
            });
        } else {
            // Desktop : chargement séquentiel normal
            await loadProfile();
            await loadUserPreferences();
            await loadNews(currentCategory, currentCountry);
        }
    } finally {
        // Masquer le loader une fois tout chargé
        hidePageLoader();
    }

    // ================================================
    // SIDEBAR COLLAPSIBLE - Système universel
    // ================================================

    // Sélectionner tous les headers avec data-collapse-id
    const collapseHeaders = document.querySelectorAll('[data-collapse-id]');

    if (collapseHeaders.length > 0) {
        console.log(`✅ ${collapseHeaders.length} menu(s) collapse trouvé(s)`);

        collapseHeaders.forEach(header => {
            const collapseId = header.getAttribute('data-collapse-id');
            const content = document.querySelector(`[data-collapse-target="${collapseId}"]`);

            if (!content) {
                console.warn(`⚠️ Contenu collapse non trouvé pour: ${collapseId}`);
                return;
            }

            // Charger l'état sauvegardé depuis localStorage
            const isCollapsed = localStorage.getItem(`collapse_${collapseId}`) === 'true';

            if (isCollapsed) {
                header.classList.add('collapsed');
                content.classList.add('collapsed');
            }

            // Event listener pour le toggle
            header.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const willCollapse = !header.classList.contains('collapsed');

                // Toggle les classes
                header.classList.toggle('collapsed');
                content.classList.toggle('collapsed');

                // Sauvegarder l'état
                localStorage.setItem(`collapse_${collapseId}`, willCollapse);

                console.log(`🔄 Toggle ${collapseId}: ${willCollapse ? 'collapsed' : 'expanded'}`);
            });
        });
    }

    // ================================================
    // ADVANCED SEARCH - HELPER FUNCTIONS
    // ================================================

    // Show help modal
    function showHelpModal() {
        const helpContent = `
            <h3>📚 Aide - Commandes disponibles</h3>
            <div style="margin-top: 1.5rem;">
                <h4>Commandes de recherche:</h4>
                <ul style="list-style: none; padding-left: 0;">
                    <li><strong>/profile:</strong> - Accéder à votre profil</li>
                    <li><strong>/feed:</strong> - Rechercher des actualités par catégorie</li>
                    <li><strong>/settings:</strong> - Accéder aux paramètres</li>
                    <li><strong>/filter:</strong> - Filtrer les actualités</li>
                    <li><strong>/help</strong> - Afficher l'aide</li>
                </ul>
                <h4 style="margin-top: 1.5rem;">Raccourcis clavier:</h4>
                <ul style="list-style: none; padding-left: 0;">
                    <li><kbd>Ctrl/Cmd + K</kbd> - Ouvrir la recherche</li>
                    <li><kbd>↑ ↓</kbd> - Naviguer dans les suggestions</li>
                    <li><kbd>Enter</kbd> - Sélectionner</li>
                    <li><kbd>Esc</kbd> - Fermer</li>
                </ul>
            </div>
        `;
        showInfo(helpContent, { duration: 0, position: 'top-center' });
    }

    // Show shortcuts modal
    function showShortcutsModal() {
        const shortcutsContent = `
            <h3>⌨️ Raccourcis Clavier</h3>
            <div style="margin-top: 1.5rem; display: grid; gap: 0.75rem;">
                <div><kbd>Ctrl/Cmd + K</kbd> → Recherche rapide</div>
                <div><kbd>↑ ↓</kbd> → Navigation suggestions</div>
                <div><kbd>Enter</kbd> → Sélection</div>
                <div><kbd>Esc</kbd> → Fermer</div>
                <div><kbd>1-9</kbd> → Catégories (à venir)</div>
            </div>
        `;
        showInfo(shortcutsContent, { duration: 0, position: 'top-center' });
    }

    // Show search help modal
    function showSearchHelpModal() {
        const searchHelp = `
            <h3>🔍 Aide Recherche</h3>
            <div style="margin-top: 1.5rem;">
                <p><strong>Recherche simple:</strong> Tapez n'importe quel mot</p>
                <p><strong>Commandes:</strong> Utilisez / pour des actions rapides</p>
                <p><strong>Historique:</strong> Vos recherches sont sauvegardées</p>
                <p><strong>Fuzzy search:</strong> Même avec des fautes de frappe</p>
            </div>
        `;
        showInfo(searchHelp, { duration: 0, position: 'top-center' });
    }

    // Filter by date range
    function filterByDate(range) {
        const newsCards = document.querySelectorAll('.news-card');
        const now = new Date();
        let cutoffDate;

        switch (range) {
            case 'today':
                cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            default:
                return;
        }

        let visibleCount = 0;
        newsCards.forEach(card => {
            // This is a simple filter - in production, you'd use actual article dates
            // For now, show all articles
            card.style.display = '';
            visibleCount++;
        });

        notifySuccess(`${visibleCount} articles affichés`);
    }

    // ================================================
    // SIDEBAR TOGGLE - Collapsible functionality
    // ================================================
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.vertical-sidebar');

    // Load saved state from localStorage (par défaut: ouvert)
    const isSidebarClosed = localStorage.getItem('vertical_sidebar_closed') === 'true';
    if (isSidebarClosed && sidebar) {
        sidebar.classList.add('closed');
    }

    // Toggle sidebar on button click
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            sidebar.classList.toggle('closed');

            // Save state to localStorage
            const isClosed = sidebar.classList.contains('closed');
            localStorage.setItem('vertical_sidebar_closed', isClosed);

            console.log(`🔄 Sidebar ${isClosed ? 'fermée (2px)' : 'ouverte (250px)'}`);
        });
    }
})();
