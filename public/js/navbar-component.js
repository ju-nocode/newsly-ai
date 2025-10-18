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
