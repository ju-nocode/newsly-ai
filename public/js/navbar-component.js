// ================================================
// NAVBAR COMPONENT - Shared Navigation
// ================================================

import { icons } from './flowbite-icons.js';

export function createNavbar(config = {}) {
    const {
        showMobileSidebarBtn = false,
        showSettingsNav = false,
        publicMode = false,
        showLanguageSwitcher = true
    } = config;

    return `
    <!-- Navigation Top Bar -->
    <nav class="navbar dashboard-nav">
        <div class="nav-container">
            <!-- Left Section: Logo (+ optional mobile button) -->
            <div class="nav-left">
                ${showMobileSidebarBtn ? `
                <button class="mobile-menu-btn" id="mobileSidebarBtn" aria-label="Ouvrir menu">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
                ` : ''}
                ${showSettingsNav ? `
                <button class="mobile-menu-btn" id="mobileSettingsNavBtn" aria-label="Ouvrir menu paramètres">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
                ` : ''}
                <a href="dashboard.html" class="logo">
                    ${icons.news()}
                    <span class="logo-text">Newsly AI</span>
                </a>
            </div>

            <!-- Center Section: Smart Search Bar (Floating Centered) - Only for authenticated users -->
            ${!publicMode ? `
            <div class="smart-search-wrapper">
                <div class="smart-search-container">
                    <div class="smart-search-icon">
                        ${icons.search()}
                    </div>
                    <input
                        type="text"
                        class="smart-search-input"
                        id="smartSearchInput"
                        placeholder="Rechercher... (essayez /profile: ou /feed:)"
                        autocomplete="off"
                        spellcheck="false"
                    >
                    <div class="search-kbd-hint">
                        <kbd class="search-kbd">⌘</kbd>
                        <kbd class="search-kbd">K</kbd>
                    </div>
                    <button class="smart-search-btn" id="smartSearchBtn" aria-label="Search">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M6.5 0a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zm0 11.5a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>
                            <path d="M13.854 13.146l-2.707-2.707a.5.5 0 0 0-.708.708l2.707 2.707a.5.5 0 0 0 .708-.708z"/>
                        </svg>
                    </button>
                </div>
            </div>
            ` : ''}

            <!-- Right Section: Weather + Language + Burger -->
            <div class="nav-right">
                <div class="nav-user-weather">
                    <!-- Weather Widget -->
                    <div class="weather-widget" id="weatherWidget">
                        <div class="weather-loading">
                            <span>🌤️</span>
                        </div>
                    </div>
                </div>

                <!-- Language Switcher (hidden in public mode) -->
                ${showLanguageSwitcher ? `
                <button class="nav-lang-btn" id="langSwitcher" title="Changer la langue" aria-label="Changer la langue">
                    ${icons.language()}
                </button>
                ` : ''}

                <div class="nav-links">
                    <!-- Burger Menu -->
                    <button class="burger-menu" id="burgerBtn">
                    <span class="burger-line"></span>
                    <span class="burger-line"></span>
                    <span class="burger-line"></span>
                </button>

                <!-- Burger Dropdown Menu -->
                <div class="burger-dropdown" id="burgerMenu">
                    <!-- User Info (hidden in public mode) -->
                    ${!publicMode ? `
                    <div class="burger-user-info">
                        <img id="burgerAvatarImage" class="burger-user-avatar" src="https://ui-avatars.com/api/?name=User&background=3ecf8e&color=fff&size=72" alt="Avatar">
                        <span id="userNameDisplay" class="burger-user-name">User: User</span>
                    </div>

                    <div class="burger-divider"></div>
                    ` : ''}

                    <!-- Public mode: Login button -->
                    ${publicMode ? `
                    <button class="burger-link" id="loginBtn">
                        ${icons.login()}
                        <span>Connexion</span>
                    </button>

                    <button class="burger-link" id="signupBtn">
                        ${icons.userPlus()}
                        <span>Créer un compte</span>
                    </button>
                    ` : ''}

                    <!-- Authenticated mode: Settings, Logout -->
                    ${!publicMode ? `
                    ${showSettingsNav ? `
                    <button class="burger-link" id="dashboardBtn">
                        ${icons.dashboard()}
                        <span data-i18n="nav.dashboard">Dashboard</span>
                    </button>
                    ` : `
                    <button class="burger-link" id="settingsBtn">
                        ${icons.settings()}
                        <span data-i18n="nav.settings">Paramètres</span>
                    </button>
                    `}

                    <button class="burger-link" id="logoutBtn">
                        ${icons.logout()}
                        <span data-i18n="nav.logout">Déconnexion</span>
                    </button>
                    ` : ''}
                </div>
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
