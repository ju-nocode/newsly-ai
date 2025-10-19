// ================================================
// NAVBAR COMPONENT - Shared Navigation
// ================================================

export function createNavbar(config = {}) {
    const {
        showMobileSidebarBtn = false,
        showSettingsNav = false
    } = config;

    return `
    <!-- Navigation Top Bar -->
    <nav class="navbar dashboard-nav">
        <div class="nav-container">
            ${showMobileSidebarBtn ? `
            <!-- Bouton burger pour menu mobile -->
            <button class="mobile-menu-btn" id="mobileSidebarBtn" aria-label="Ouvrir menu">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            </button>
            ` : ''}

            ${showSettingsNav ? `
            <!-- Bouton burger pour menu mobile (settings nav) -->
            <button class="mobile-menu-btn" id="mobileSettingsNavBtn" aria-label="Ouvrir menu paramètres">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            </button>
            ` : ''}

            <a href="dashboard.html" class="logo">
                <img src="https://img.icons8.com/ios/24/news.png" alt="News" class="logo-icon icon-white">
                <span class="logo-text">Newsly AI</span>
            </a>

            <!-- Smart Search Bar -->
            <div class="smart-search-wrapper" style="position: relative; display: flex; align-items: center; flex: 1; max-width: 600px; min-width: 200px;">
                <div class="smart-search-container" style="position: relative; flex: 1; display: flex; align-items: center; background: var(--bg-secondary, #f3f4f6); border: 1px solid var(--border, #e5e7eb); border-radius: 8px; height: 42px; transition: all 0.2s ease;">
                    <div class="smart-search-icon" style="position: absolute; left: 1rem; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 1;">
                        <img src="https://img.icons8.com/ios/18/search--v1.png" alt="Search" class="icon-secondary" style="width: 18px; height: 18px; opacity: 0.6;">
                    </div>
                    <input
                        type="text"
                        class="smart-search-input"
                        id="smartSearchInput"
                        placeholder="Rechercher... (essayez /profile: ou /feed:)"
                        autocomplete="off"
                        spellcheck="false"
                        style="flex: 1; padding: 0.75rem 3rem; background: transparent; border: none; outline: none; color: var(--text-primary, #111827); font-size: 0.9375rem; font-family: inherit; width: 100%; height: 100%;"
                    >
                    <div class="search-kbd-hint" style="position: absolute; right: 3rem; display: flex; align-items: center; gap: 0.25rem; pointer-events: none; z-index: 1;">
                        <kbd class="search-kbd" style="padding: 0.25rem 0.5rem; background: var(--bg-tertiary, #e5e7eb); border: 1px solid var(--border, #d1d5db); border-radius: 4px; font-size: 0.75rem; color: var(--text-secondary, #6b7280); font-family: 'Monaco', monospace;">⌘</kbd>
                        <kbd class="search-kbd" style="padding: 0.25rem 0.5rem; background: var(--bg-tertiary, #e5e7eb); border: 1px solid var(--border, #d1d5db); border-radius: 4px; font-size: 0.75rem; color: var(--text-secondary, #6b7280); font-family: 'Monaco', monospace;">K</kbd>
                    </div>
                    <button class="smart-search-btn" id="smartSearchBtn" aria-label="Search" style="position: absolute; right: 0.5rem; background: transparent; border: none; padding: 0.5rem; border-radius: 4px; cursor: pointer; color: var(--text-secondary, #6b7280); display: flex; align-items: center; justify-content: center; transition: all 0.2s; z-index: 1;">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M6.5 0a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zm0 11.5a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>
                            <path d="M13.854 13.146l-2.707-2.707a.5.5 0 0 0-.708.708l2.707 2.707a.5.5 0 0 0 .708-.708z"/>
                        </svg>
                    </button>
                </div>
            </div>

            <div class="nav-user-weather">
                <!-- Weather Widget -->
                <div class="weather-widget" id="weatherWidget">
                    <div class="weather-loading">
                        <span>🌤️</span>
                    </div>
                </div>
            </div>

            <div class="nav-links">
                <!-- Burger Menu -->
                <button class="burger-menu" id="burgerBtn">
                    <span class="burger-line"></span>
                    <span class="burger-line"></span>
                    <span class="burger-line"></span>
                </button>

                <!-- Burger Dropdown Menu -->
                <div class="burger-dropdown" id="burgerMenu">
                    <!-- User Info -->
                    <div class="burger-user-info">
                        <img id="burgerAvatarImage" class="burger-user-avatar" src="https://ui-avatars.com/api/?name=User&background=3ecf8e&color=fff&size=72" alt="Avatar">
                        <span id="userNameDisplay" class="burger-user-name">User: User</span>
                    </div>

                    <div class="burger-divider"></div>

                    <!-- Theme Toggle avec Switch -->
                    <div class="burger-item">
                        <div class="burger-item-label">
                            <img src="https://img.icons8.com/ios/20/sun--v1.png" alt="Theme" class="icon-secondary" data-theme-icon>
                            <span id="themeText" data-i18n="nav.darkMode">Mode sombre</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="themeToggle" data-theme-toggle>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <!-- Language Toggle avec Switch -->
                    <div class="burger-item">
                        <div class="burger-item-label">
                            <img src="https://img.icons8.com/ios/20/globe.png" alt="Language" class="icon-secondary">
                            <span id="langLabel">Français / English</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="langToggle">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div class="burger-divider"></div>

                    <!-- Weather Location Refresh Button -->
                    <button class="burger-link" id="refreshWeatherBtn">
                        <img src="https://img.icons8.com/ios/20/marker.png" alt="Weather" class="icon-secondary">
                        <span data-i18n="nav.refreshWeather">Actualiser la météo</span>
                    </button>

                    <div class="burger-divider"></div>

                    ${showSettingsNav ? `
                    <button class="burger-link" id="dashboardBtn">
                        <img src="https://img.icons8.com/ios/20/dashboard.png" alt="Dashboard" class="icon-secondary">
                        <span data-i18n="nav.dashboard">Dashboard</span>
                    </button>
                    ` : `
                    <button class="burger-link" id="settingsBtn">
                        <img src="https://img.icons8.com/ios/20/settings.png" alt="Settings" class="icon-secondary">
                        <span data-i18n="nav.settings">Paramètres</span>
                    </button>
                    `}

                    <button class="burger-link" id="logoutBtn">
                        <img src="https://img.icons8.com/ios/20/exit.png" alt="Logout" class="icon-secondary">
                        <span data-i18n="nav.logout">Déconnexion</span>
                    </button>
                </div>
            </div>
        </div>
    </nav>
    `;
}

export function initNavbar(targetSelector, config = {}) {
    const target = document.querySelector(targetSelector);
    if (!target) {
        console.error(`Navbar target "${targetSelector}" not found`);
        return;
    }

    target.insertAdjacentHTML('afterend', createNavbar(config));
}
