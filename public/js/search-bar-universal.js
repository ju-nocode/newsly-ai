// ================================================
// UNIVERSAL SMART SEARCH BAR - Autonomous Module
// ================================================
// Module complètement autonome qui fonctionne sur toutes les pages

/**
 * Import User Intelligence System
 */
import { userIntelligence } from './user-intelligence-system.js';

/**
 * Import Search Commands Loader
 */
import { initializeSearchCommands } from './search-commands-loader.js';

/**
 * Import Theme Manager
 */
import { setTheme } from './theme-manager.js';

/**
 * Import App Module (logout function)
 */
import { logout } from './app.js';

/**
 * Search command configuration with universal actions
 * These are the LOCAL FALLBACK commands used when database is unavailable
 */
const LOCAL_SEARCH_COMMANDS = {
    dashboard: {
        prefix: '/dashboard',
        aliases: ['/home', '/accueil', '/db'],
        description: 'Aller au tableau de bord',
        icon: '',
        action: () => window.location.href = 'dashboard.html',
        suggestions: []
    },
    profile: {
        prefix: '/profile:',
        aliases: ['/profil:', '/user:', '/me:'],
        description: 'Gérer votre profil',
        icon: '',
        suggestions: [
            {
                value: '/profile: info',
                label: 'Mes informations',
                desc: 'Nom, email, avatar',
                action: () => window.location.href = 'settings.html#profile'
            },
            {
                value: '/profile: account',
                label: 'Compte',
                desc: 'Langue, thème, préférences',
                action: () => window.location.href = 'settings.html#account'
            },
            {
                value: '/profile: security',
                label: 'Sécurité',
                desc: 'Mot de passe et sécurité',
                action: () => window.location.href = 'settings.html#security'
            }
        ]
    },
    feed: {
        prefix: '/feed:',
        aliases: ['/news:', '/actu:', '/articles:', '/cat:'],
        description: 'Rechercher des actualités',
        icon: '',
        suggestions: [
            {
                value: '/feed: general',
                label: 'Général',
                desc: 'Actualités générales',
                action: () => {
                    window.location.href = 'dashboard.html?category=general';
                }
            },
            {
                value: '/feed: technology',
                label: 'Technologie',
                desc: 'Articles tech',
                action: () => {
                    window.location.href = 'dashboard.html?category=technology';
                }
            },
            {
                value: '/feed: business',
                label: 'Business',
                desc: 'Actualités business',
                action: () => {
                    window.location.href = 'dashboard.html?category=business';
                }
            },
            {
                value: '/feed: sports',
                label: 'Sports',
                desc: 'Actualités sportives',
                action: () => {
                    window.location.href = 'dashboard.html?category=sports';
                }
            },
            {
                value: '/feed: science',
                label: 'Science',
                desc: 'Actualités scientifiques',
                action: () => {
                    window.location.href = 'dashboard.html?category=science';
                }
            },
            {
                value: '/feed: entertainment',
                label: 'Divertissement',
                desc: 'Actualités entertainment',
                action: () => {
                    window.location.href = 'dashboard.html?category=entertainment';
                }
            },
            {
                value: '/feed: health',
                label: 'Santé',
                desc: 'Actualités santé',
                action: () => {
                    window.location.href = 'dashboard.html?category=health';
                }
            }
        ]
    },
    settings: {
        prefix: '/settings',
        aliases: ['/config', '/options', '/parametres', '/params'],
        description: 'Accéder aux paramètres',
        icon: '',
        action: () => window.location.href = 'settings.html',
        suggestions: [
            {
                value: '/settings: profile',
                label: 'Profil',
                desc: 'Informations personnelles',
                action: () => window.location.href = 'settings.html#profile'
            },
            {
                value: '/settings: account',
                label: 'Compte',
                desc: 'Langue, thème, préférences',
                action: () => window.location.href = 'settings.html#account'
            },
            {
                value: '/settings: security',
                label: 'Sécurité',
                desc: 'Mot de passe et sessions',
                action: () => window.location.href = 'settings.html#security'
            },
            {
                value: '/settings: notifications',
                label: 'Notifications',
                desc: 'Gérer les notifications',
                action: () => window.location.href = 'settings.html#notifications'
            },
            {
                value: '/settings: privacy',
                label: 'Confidentialité',
                desc: 'Paramètres de confidentialité',
                action: () => window.location.href = 'settings.html#privacy'
            },
            {
                value: '/settings: preferences',
                label: 'Préférences',
                desc: 'Préférences utilisateur',
                action: () => window.location.href = 'settings.html#preferences'
            }
        ]
    },
    theme: {
        prefix: '/theme:',
        aliases: ['/apparence:', '/mode:'],
        description: 'Changer le thème',
        icon: '',
        suggestions: [
            {
                value: '/theme: light',
                label: 'Clair',
                desc: 'Activer le mode clair',
                action: () => setTheme('light')
            },
            {
                value: '/theme: dark',
                label: 'Sombre',
                desc: 'Activer le mode sombre',
                action: () => setTheme('dark')
            },
            {
                value: '/theme: auto',
                label: 'Automatique',
                desc: 'Suivre le système',
                action: () => {
                    localStorage.removeItem('theme');
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    setTheme(prefersDark ? 'dark' : 'light');
                }
            }
        ]
    },
    logout: {
        prefix: '/logout',
        aliases: ['/deconnexion', '/signout', '/exit'],
        description: 'Se déconnecter',
        icon: '',
        action: () => logout(),
        suggestions: []
    },
    password: {
        prefix: '/password',
        aliases: ['/reset', '/mdp', '/forgot'],
        description: 'Changer le mot de passe',
        icon: '',
        action: () => window.location.href = 'settings.html#security',
        suggestions: []
    },
    help: {
        prefix: '/help',
        aliases: ['/aide', '/?', '/h'],
        description: 'Aide et documentation',
        icon: '',
        suggestions: [
            {
                value: '/help: commands',
                label: 'Commandes',
                desc: 'Liste des commandes disponibles',
                action: () => showHelpModal('commands')
            },
            {
                value: '/help: shortcuts',
                label: 'Raccourcis',
                desc: 'Raccourcis clavier',
                action: () => showHelpModal('shortcuts')
            },
            {
                value: '/help: search',
                label: 'Recherche',
                desc: 'Comment utiliser la recherche',
                action: () => showHelpModal('search')
            }
        ]
    }
};

/**
 * Active search commands (will be loaded from DB or use local fallback)
 */
let SEARCH_COMMANDS = { ...LOCAL_SEARCH_COMMANDS };

/**
 * Database manager for user search preferences
 * Now uses the centralized User Intelligence System
 */
class SearchPreferencesDB {
    constructor() {
        this.intelligence = userIntelligence;
        this.supabase = window.supabase;
        this.syncInProgress = false;
    }

    get isAuthenticated() {
        return this.intelligence.isAuthenticated;
    }

    get currentUser() {
        return this.intelligence.currentUser;
    }

    async checkAuthStatus() {
        return await this.intelligence.checkAuth();
    }

    /**
     * Load user preferences from database or localStorage
     */
    async loadUserPreferences() {
        await this.checkAuthStatus();

        console.log('🔐 User authenticated:', this.isAuthenticated);
        console.log('👤 Current user:', this.currentUser);

        if (!this.isAuthenticated) {
            console.log('⚠️ User not authenticated, using localStorage');
            return this.loadFromLocalStorage();
        }

        try {
            console.log('📥 Loading from Supabase for user:', this.currentUser.id);
            const { data, error } = await this.supabase
                .from('user_search_preferences')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .single();

            if (error) {
                console.log('⚠️ Error loading preferences:', error.message);
                if (error.code === 'PGRST116') {
                    console.log('📝 No preferences found, creating defaults');
                    return this.getDefaultPreferences();
                }
                throw error;
            }

            if (!data) {
                console.log('📝 No data, using defaults');
                return this.getDefaultPreferences();
            }

            console.log('✅ Loaded preferences from DB:', data);
            return data;
        } catch (e) {
            console.error('❌ Error loading user preferences from DB:', e);
            return this.loadFromLocalStorage();
        }
    }

    /**
     * Save user preferences to database or localStorage
     */
    async saveUserPreferences(preferences) {
        await this.checkAuthStatus();

        console.log('💾 saveUserPreferences called');
        console.log('🔐 isAuthenticated:', this.isAuthenticated);
        console.log('👤 currentUser:', this.currentUser);
        console.log('📦 preferences to save:', preferences);

        if (!this.isAuthenticated) {
            console.log('⚠️ Not authenticated, saving to localStorage instead');
            this.saveToLocalStorage(preferences);
            return;
        }

        if (this.syncInProgress) {
            console.log('⏳ Sync already in progress, skipping');
            return;
        }

        try {
            this.syncInProgress = true;

            const dataToSave = {
                user_id: this.currentUser.id,
                ...preferences,
                updated_at: new Date().toISOString()
            };

            console.log('💾 Upserting to Supabase:', dataToSave);

            const { data, error } = await this.supabase
                .from('user_search_preferences')
                .upsert(dataToSave, {
                    onConflict: 'user_id'
                })
                .select();

            if (error) {
                console.error('❌ Error saving preferences to DB:', error);
                console.error('❌ Error details:', JSON.stringify(error));
                this.saveToLocalStorage(preferences);
            } else {
                console.log('✅ Preferences saved successfully to DB!');
                console.log('✅ Saved data:', data);
            }
        } catch (e) {
            console.error('❌ Exception saving user preferences:', e);
            this.saveToLocalStorage(preferences);
        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * Update search history
     */
    async updateHistory(history) {
        console.log('📝 updateHistory called with', history.length, 'items');
        const prefs = await this.loadUserPreferences();
        console.log('📥 Current prefs loaded:', prefs);
        prefs.search_history = history;
        console.log('📝 Updated prefs.search_history to', history.length, 'items');
        await this.saveUserPreferences(prefs);
        console.log('✅ updateHistory completed');
    }

    /**
     * Add to favorites
     */
    async addFavorite(command) {
        const prefs = await this.loadUserPreferences();
        const favorites = prefs.favorite_commands || [];

        if (!favorites.includes(command)) {
            favorites.push(command);
            prefs.favorite_commands = favorites;
            await this.saveUserPreferences(prefs);
        }
    }

    /**
     * Remove from favorites
     */
    async removeFavorite(command) {
        const prefs = await this.loadUserPreferences();
        const favorites = prefs.favorite_commands || [];
        prefs.favorite_commands = favorites.filter(c => c !== command);
        await this.saveUserPreferences(prefs);
    }

    /**
     * Increment command usage stats
     */
    async incrementCommandUsage(command) {
        const prefs = await this.loadUserPreferences();
        const stats = prefs.command_stats || {};
        stats[command] = (stats[command] || 0) + 1;
        prefs.command_stats = stats;
        await this.saveUserPreferences(prefs);
    }

    /**
     * Get personalized suggestions based on usage
     */
    async getPersonalizedSuggestions(limit = 5) {
        const prefs = await this.loadUserPreferences();
        const stats = prefs.command_stats || {};

        // Sort by usage count
        return Object.entries(stats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([command]) => command);
    }

    /**
     * Get favorite commands
     */
    async getFavorites() {
        const prefs = await this.loadUserPreferences();
        return prefs.favorite_commands || [];
    }

    /**
     * Get custom shortcuts
     */
    async getCustomShortcuts() {
        const prefs = await this.loadUserPreferences();
        return prefs.custom_shortcuts || {};
    }

    /**
     * Add custom shortcut
     */
    async addCustomShortcut(shortcut, command) {
        const prefs = await this.loadUserPreferences();
        const shortcuts = prefs.custom_shortcuts || {};
        shortcuts[shortcut] = command;
        prefs.custom_shortcuts = shortcuts;
        await this.saveUserPreferences(prefs);
    }

    /**
     * Load from localStorage (fallback)
     */
    loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem('newsly-search-preferences');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error('Error loading from localStorage:', e);
        }
        return this.getDefaultPreferences();
    }

    /**
     * Save to localStorage (fallback)
     */
    saveToLocalStorage(preferences) {
        try {
            localStorage.setItem('newsly-search-preferences', JSON.stringify(preferences));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    }

    /**
     * Get default preferences
     */
    getDefaultPreferences() {
        return {
            search_history: [],
            favorite_commands: [],
            custom_shortcuts: {},
            command_stats: {},
            preferences: {
                maxHistoryItems: 10,
                showFavoritesFirst: true,
                enableShortcuts: true
            }
        };
    }

    /**
     * Migrate localStorage data to database (one-time)
     */
    async migrateLocalStorageToDatabase() {
        await this.checkAuthStatus();

        if (!this.isAuthenticated) return;

        try {
            // Check if user already has data in database
            const { data: existing } = await this.supabase
                .from('user_search_preferences')
                .select('id')
                .eq('user_id', this.currentUser.id)
                .single();

            if (existing) return; // Already migrated

            // Get localStorage data
            const localHistory = localStorage.getItem('newsly-search-history');
            const localPrefs = localStorage.getItem('newsly-search-preferences');

            let historyData = [];
            let prefsData = this.getDefaultPreferences();

            if (localHistory) {
                try {
                    historyData = JSON.parse(localHistory);
                } catch (e) {}
            }

            if (localPrefs) {
                try {
                    prefsData = JSON.parse(localPrefs);
                } catch (e) {}
            }

            // Merge with history
            if (historyData.length > 0) {
                prefsData.search_history = historyData;
            }

            // Save to database
            await this.saveUserPreferences(prefsData);

            console.log('✅ Successfully migrated localStorage to database');
        } catch (e) {
            console.error('Error migrating to database:', e);
        }
    }
}

/**
 * Search history manager (now uses SearchPreferencesDB)
 */
class SearchHistory {
    constructor(maxItems = 10) {
        this.maxItems = maxItems;
        this.storageKey = 'newsly-search-history';
        this.db = new SearchPreferencesDB();
        this.cache = null;
        this.cacheTimestamp = 0;
        this.cacheDuration = 30000; // 30 seconds
    }

    /**
     * Get history from DB or localStorage
     */
    async getHistory() {
        // Use cache if available and not expired
        if (this.cache && (Date.now() - this.cacheTimestamp) < this.cacheDuration) {
            return this.cache;
        }

        try {
            const prefs = await this.db.loadUserPreferences();
            const history = prefs.search_history || [];

            // Update cache
            this.cache = history;
            this.cacheTimestamp = Date.now();

            return history;
        } catch (e) {
            console.error('Error reading search history:', e);

            // Fallback to localStorage
            try {
                const localHistory = localStorage.getItem(this.storageKey);
                return localHistory ? JSON.parse(localHistory) : [];
            } catch (fallbackError) {
                return [];
            }
        }
    }

    /**
     * Add to history (async with DB sync)
     */
    async addToHistory(query, type = 'search', commandValue = null) {
        if (!query || query.trim().length === 0) {
            console.log('⚠️ Empty query, skipping history');
            return;
        }

        console.log('📝 Adding to history:', { query, type, commandValue });

        const history = await this.getHistory();
        const newEntry = {
            query,
            type,
            timestamp: Date.now()
        };

        // Remove duplicates
        const filtered = history.filter(item => item.query !== query);

        // Add to beginning
        filtered.unshift(newEntry);

        // Limit to maxItems
        const limited = filtered.slice(0, this.maxItems);

        // Update cache IMMÉDIATEMENT pour affichage dynamique
        this.cache = limited;
        this.cacheTimestamp = Date.now();
        console.log('✅ Cache updated, new history length:', limited.length);

        try {
            // Save to DB
            console.log('💾 Saving to Supabase...');
            await this.db.updateHistory(limited);
            console.log('✅ Saved to Supabase');

            // Also increment command usage stats if it's a command
            if (type === 'command' && commandValue) {
                console.log('📊 Incrementing command stats...');
                await this.db.incrementCommandUsage(commandValue);
                console.log('✅ Stats updated');
            }

            // Fallback: Save to localStorage too
            localStorage.setItem(this.storageKey, JSON.stringify(limited));
            console.log('✅ Saved to localStorage');

        } catch (e) {
            console.error('❌ Error saving search history to DB:', e);

            // Fallback to localStorage only
            try {
                localStorage.setItem(this.storageKey, JSON.stringify(limited));
                console.log('✅ Saved to localStorage (fallback)');
            } catch (fallbackError) {
                console.error('❌ Error saving to localStorage:', fallbackError);
            }
        }
    }

    /**
     * Clear history from both DB and localStorage
     */
    async clearHistory() {
        try {
            // Clear from DB
            const prefs = await this.db.loadUserPreferences();
            prefs.search_history = [];
            await this.db.saveUserPreferences(prefs);

            // Clear cache
            this.cache = [];
            this.cacheTimestamp = Date.now();

            // Clear from localStorage
            localStorage.removeItem(this.storageKey);
        } catch (e) {
            console.error('Error clearing search history:', e);

            // Fallback: Clear localStorage only
            try {
                localStorage.removeItem(this.storageKey);
            } catch (fallbackError) {
                console.error('Error clearing localStorage:', fallbackError);
            }
        }
    }

    /**
     * Remove specific item from history
     */
    async removeFromHistory(query) {
        try {
            const history = await this.getHistory();
            const filtered = history.filter(item => item.query !== query);

            // Update cache
            this.cache = filtered;
            this.cacheTimestamp = Date.now();

            // Save to DB
            await this.db.updateHistory(filtered);

            // Fallback: Save to localStorage too
            localStorage.setItem(this.storageKey, JSON.stringify(filtered));
        } catch (e) {
            console.error('Error removing from search history:', e);

            // Fallback to localStorage only
            try {
                const localHistory = localStorage.getItem(this.storageKey);
                if (localHistory) {
                    const history = JSON.parse(localHistory);
                    const filtered = history.filter(item => item.query !== query);
                    localStorage.setItem(this.storageKey, JSON.stringify(filtered));
                }
            } catch (fallbackError) {
                console.error('Error removing from localStorage:', fallbackError);
            }
        }
    }

    /**
     * Get recent searches
     */
    async getRecentSearches(limit = 5) {
        const history = await this.getHistory();
        return history.slice(0, limit);
    }

    /**
     * Get favorites
     */
    async getFavorites() {
        return await this.db.getFavorites();
    }

    /**
     * Add to favorites
     */
    async addFavorite(command) {
        await this.db.addFavorite(command);
    }

    /**
     * Remove from favorites
     */
    async removeFavorite(command) {
        await this.db.removeFavorite(command);
    }

    /**
     * Get personalized suggestions
     */
    async getPersonalizedSuggestions(limit = 5) {
        return await this.db.getPersonalizedSuggestions(limit);
    }
}

/**
 * Search state
 */
const searchState = {
    isOpen: false,
    selectedIndex: -1,
    currentCommand: null,
    searchResults: [],
    history: new SearchHistory(),
    searchTimeout: null
};

/**
 * Initialize universal search bar
 */
export async function initUniversalSearchBar() {
    const searchInput = document.getElementById('smartSearchInput');
    if (!searchInput) {
        console.warn('⚠️ Search input not found');
        return;
    }

    // Nettoyer le vieux cache (qui n'avait pas les actions)
    localStorage.removeItem('newsly-search-commands-cache');

    // Load search commands from database (async)
    initializeSearchCommands(LOCAL_SEARCH_COMMANDS).then(commands => {
        SEARCH_COMMANDS = commands;
        console.log('✅ Search commands initialized:', Object.keys(SEARCH_COMMANDS).length, 'commands');

        // Vérifier TOUTES les commandes et suggestions
        let totalSuggestions = 0;
        let suggestionsWithActions = 0;
        let commandsWithActions = 0;

        Object.entries(SEARCH_COMMANDS).forEach(([key, cmd]) => {
            // Vérifier la commande principale
            if (cmd.action) commandsWithActions++;

            // Vérifier les suggestions
            if (cmd.suggestions && cmd.suggestions.length > 0) {
                cmd.suggestions.forEach(s => {
                    totalSuggestions++;
                    if (s.action) suggestionsWithActions++;
                    else console.warn('⚠️ Suggestion sans action:', cmd.prefix, '→', s.label);
                });
            }
        });

        console.log('📊 Stats:', {
            commands: Object.keys(SEARCH_COMMANDS).length,
            commandsWithActions,
            totalSuggestions,
            suggestionsWithActions
        });

        if (suggestionsWithActions < totalSuggestions) {
            console.error('❌ PROBLÈME: Certaines suggestions n\'ont pas d\'action!');
        } else {
            console.log('✅ PARFAIT: Toutes les suggestions ont leurs actions!');
        }
    }).catch(err => {
        console.error('Error initializing search commands:', err);
        // Keep using local fallback
        SEARCH_COMMANDS = LOCAL_SEARCH_COMMANDS;
    });

    // Event listeners
    searchInput.addEventListener('input', handleSearchInput);
    searchInput.addEventListener('keydown', handleSearchKeydown);
    searchInput.addEventListener('focus', handleSearchFocus);
    searchInput.addEventListener('blur', handleSearchBlur);

    // Search button
    const searchBtn = document.getElementById('smartSearchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            if (searchState.isOpen) {
                closeSearchSuggestions();
            } else {
                searchInput.focus();
            }
        });
    }

    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
        }

        // Escape to close
        if (e.key === 'Escape' && searchState.isOpen) {
            closeSearchSuggestions();
        }
    });

    // Reposition dropdown on scroll/resize
    window.addEventListener('scroll', () => {
        if (searchState.isOpen) {
            const container = document.getElementById('searchSuggestionsContainer');
            if (container) {
                positionDropdown(container);
            }
        }
    }, true);

    window.addEventListener('resize', () => {
        if (searchState.isOpen) {
            const container = document.getElementById('searchSuggestionsContainer');
            if (container) {
                positionDropdown(container);
            }
        }
    });

    // Migrate localStorage to database (one-time, async)
    if (searchState.history.db && searchState.history.db.migrateLocalStorageToDatabase) {
        setTimeout(() => {
            searchState.history.db.migrateLocalStorageToDatabase().catch(err => {
                console.error('Migration failed:', err);
            });
        }, 2000); // Wait 2s after page load to avoid slowing down initial render
    }
}

/**
 * Handle search input
 */
function handleSearchInput(e) {
    const query = e.target.value;

    // Clear previous timeout
    if (searchState.searchTimeout) {
        clearTimeout(searchState.searchTimeout);
    }

    // Empty query - show default suggestions
    if (!query || query.trim().length === 0) {
        showDefaultSuggestions();
        return;
    }

    // Just "/" - show all commands
    if (query === '/') {
        showAllCommands();
        return;
    }

    // Detect command type
    const commandType = detectCommandType(query);
    searchState.currentCommand = commandType;

    if (commandType) {
        // Show command suggestions
        showCommandSuggestions(commandType, query);
    } else if (query.startsWith('/')) {
        // Partial command - show matching commands
        showPartialCommandMatches(query);
    } else {
        // Regular search (defer to page-specific logic if exists)
        closeSearchSuggestions();
    }
}

/**
 * Handle keyboard navigation
 */
function handleSearchKeydown(e) {
    // Tab for autocomplete
    if (e.key === 'Tab') {
        e.preventDefault();
        const query = e.target.value;

        // If just "/", autocomplete to first command
        if (query === '/') {
            const firstCommand = Object.values(SEARCH_COMMANDS)[0];
            e.target.value = firstCommand.prefix + (firstCommand.prefix.endsWith(':') ? ' ' : '');
            handleSearchInput({ target: e.target });
            return;
        }

        // If partial command
        if (query.startsWith('/') && !detectCommandType(query)) {
            const lowerQuery = query.toLowerCase();
            for (const command of Object.values(SEARCH_COMMANDS)) {
                if (command.prefix.toLowerCase().startsWith(lowerQuery) ||
                    command.aliases?.some(alias => alias.toLowerCase().startsWith(lowerQuery))) {
                    e.target.value = command.prefix + (command.prefix.endsWith(':') ? ' ' : '');
                    handleSearchInput({ target: e.target });
                    return;
                }
            }
        }

        // If suggestions are open, autocomplete selected or first
        if (searchState.isOpen && searchState.searchResults.length > 0) {
            const index = searchState.selectedIndex >= 0 ? searchState.selectedIndex : 0;
            const suggestion = searchState.searchResults[index];
            e.target.value = suggestion.value;
            handleSearchInput({ target: e.target });
            return;
        }
    }

    if (!searchState.isOpen) return;

    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            // Navigation circulaire: si on est à la fin, revenir au début
            if (searchState.selectedIndex >= searchState.searchResults.length - 1) {
                searchState.selectedIndex = 0;
            } else {
                searchState.selectedIndex++;
            }
            updateSelectedSuggestion();
            break;

        case 'ArrowUp':
            e.preventDefault();
            // Navigation circulaire: si on est au début, aller à la fin
            if (searchState.selectedIndex <= 0) {
                searchState.selectedIndex = searchState.searchResults.length - 1;
            } else {
                searchState.selectedIndex--;
            }
            updateSelectedSuggestion();
            break;

        case 'Enter':
            e.preventDefault();

            if (searchState.selectedIndex >= 0 && searchState.searchResults.length > 0) {
                const selectedItem = searchState.searchResults[searchState.selectedIndex];

                // CAS 1: Item sélectionné a des sous-menus (menu principal)
                // → Afficher les sous-menus au lieu d'exécuter
                if (selectedItem.hasSubmenus && selectedItem.commandType) {
                    // Mettre à jour l'input avec le prefix
                    e.target.value = selectedItem.value;
                    // Afficher les sous-menus
                    showCommandSuggestions(selectedItem.commandType, selectedItem.value);
                    return;
                }

                // CAS 2: Item sélectionné a une action → Exécuter
                if (selectedItem.action) {
                    executeSuggestion(selectedItem);
                    return;
                }

                // CAS 3: Aucune action (ne devrait pas arriver)
                console.warn('⚠️ Selected item has no action and no submenus:', selectedItem);
            }
            break;

        case 'Escape':
            e.preventDefault();
            closeSearchSuggestions();
            e.target.blur();
            break;
    }
}

/**
 * Handle search focus
 */
function handleSearchFocus() {
    const searchInput = document.getElementById('smartSearchInput');
    const query = searchInput?.value || '';

    if (!query || query.trim().length === 0) {
        showDefaultSuggestions();
    } else if (query.length >= 1) {
        handleSearchInput({ target: searchInput });
    }
}

/**
 * Handle search blur
 */
function handleSearchBlur(e) {
    // Don't close if clicking inside the suggestions container
    setTimeout(() => {
        const suggestionsContainer = document.getElementById('searchSuggestionsContainer');
        if (suggestionsContainer && suggestionsContainer.matches(':hover')) {
            return; // User is hovering over suggestions, don't close
        }
        closeSearchSuggestions();
    }, 300);
}

/**
 * Detect command type from query
 */
function detectCommandType(query) {
    const lowerQuery = query.toLowerCase();

    for (const [type, command] of Object.entries(SEARCH_COMMANDS)) {
        // Check main prefix
        if (lowerQuery.startsWith(command.prefix.toLowerCase())) {
            return type;
        }

        // Check aliases
        if (command.aliases) {
            for (const alias of command.aliases) {
                if (lowerQuery.startsWith(alias.toLowerCase())) {
                    return type;
                }
            }
        }
    }

    return null;
}

/**
 * Find the action for a query (from history or favorites)
 */
function findActionForQuery(query) {
    const trimmedQuery = query.trim();

    // Détecter le type de commande
    const commandType = detectCommandType(trimmedQuery);

    if (!commandType) {
        console.warn('No command type found for:', trimmedQuery);
        return null;
    }

    const command = SEARCH_COMMANDS[commandType];

    // Si c'est exactement le prefix (ex: "/settings"), vérifier si il y a des sous-menus
    if (trimmedQuery.toLowerCase() === command.prefix.toLowerCase() ||
        command.aliases?.some(alias => trimmedQuery.toLowerCase() === alias.toLowerCase())) {

        // Si la commande a des suggestions, on retourne une action qui affiche les sous-menus
        if (command.suggestions && command.suggestions.length > 0) {
            console.log('Command has submenus, returning submenu action for:', trimmedQuery);
            return () => {
                const searchInput = document.getElementById('smartSearchInput');
                if (searchInput) {
                    searchInput.value = command.prefix + (command.prefix.endsWith(':') ? ' ' : '');
                    searchInput.focus();
                    handleSearchInput({ target: searchInput });
                }
            };
        }

        // Sinon, utiliser l'action principale
        console.log('Found main command action for:', trimmedQuery);
        return command.action;
    }

    // Sinon, chercher dans les suggestions
    if (command.suggestions && command.suggestions.length > 0) {
        const suggestion = command.suggestions.find(s =>
            s.value.toLowerCase() === trimmedQuery.toLowerCase()
        );

        if (suggestion) {
            console.log('Found suggestion action for:', trimmedQuery);
            return suggestion.action;
        }
    }

    console.warn('No action found for query:', trimmedQuery);
    return null;
}

/**
 * Show default suggestions (history or commands)
 */
async function showDefaultSuggestions() {
    const history = await searchState.history.getRecentSearches(5);
    const favorites = await searchState.history.getFavorites();

    // Show favorites first if enabled and available
    if (favorites.length > 0) {
        showFavoritesAndHistory(favorites, history);
    } else if (history.length > 0) {
        showSearchHistory(history);
    } else {
        showAllCommands();
    }
}

/**
 * Show all available commands
 */
function showAllCommands() {
    let container = getSuggestionsContainer();
    container.innerHTML = '';

    // Header
    const header = document.createElement('div');
    header.className = 'search-suggestion-header';
    header.innerHTML = `
        <span class="search-command-icon">⚡</span>
        <span class="search-command-desc">Commandes disponibles</span>
        <span class="search-suggestion-hint" style="margin-left: auto; font-size: 0.75rem; color: var(--text-secondary);">Tab pour compléter</span>
    `;
    container.appendChild(header);

    // Commands
    const commands = Object.entries(SEARCH_COMMANDS);
    commands.forEach(([type, command], index) => {
        const item = createCommandItem(command, index);
        container.appendChild(item);
    });

    // Store as results for navigation
    // IMPORTANT: Pour les menus principaux, si la commande a des sous-menus,
    // l'action doit être d'afficher les sous-menus, PAS d'exécuter l'action principale
    searchState.searchResults = commands.map(([type, command]) => ({
        value: command.prefix + (command.prefix.endsWith(':') ? ' ' : ''),
        label: command.prefix,
        desc: command.description,
        commandType: type, // Garder le type pour afficher les sous-menus
        hasSubmenus: command.suggestions && command.suggestions.length > 0,
        action: (command.suggestions && command.suggestions.length > 0)
            ? null  // Pas d'action si il y a des sous-menus
            : command.action  // Action directe si pas de sous-menus
    }));
    searchState.selectedIndex = 0;

    positionDropdown(container);

    // Force reflow before adding show class
    container.offsetHeight;

    requestAnimationFrame(() => {
        // Force visibility with inline styles AND class
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
        container.style.pointerEvents = 'auto';
        container.style.display = 'block';
        container.style.zIndex = '10001';
        container.classList.add('show');
        searchState.isOpen = true;
        updateSelectedSuggestion();
    });
}

/**
 * Show partial command matches
 */
function showPartialCommandMatches(query) {
    const lowerQuery = query.toLowerCase();

    const matches = Object.entries(SEARCH_COMMANDS).filter(([type, command]) => {
        return command.prefix.toLowerCase().startsWith(lowerQuery) ||
               command.aliases?.some(alias => alias.toLowerCase().startsWith(lowerQuery));
    });

    if (matches.length === 0) {
        closeSearchSuggestions();
        return;
    }

    let container = getSuggestionsContainer();
    container.innerHTML = '';

    // Header
    const header = document.createElement('div');
    header.className = 'search-suggestion-header';
    header.innerHTML = `
        <span class="search-command-icon">⚡</span>
        <span class="search-command-desc">Commandes correspondantes</span>
        <span class="search-suggestion-hint" style="margin-left: auto; font-size: 0.75rem; color: var(--text-secondary);">Tab pour compléter</span>
    `;
    container.appendChild(header);

    // Matches
    matches.forEach(([type, command], index) => {
        const item = createCommandItem(command, index);
        container.appendChild(item);
    });

    searchState.searchResults = matches.map(([type, command]) => ({
        value: command.prefix + (command.prefix.endsWith(':') ? ' ' : ''),
        label: command.prefix,
        desc: command.description,
        commandType: type,
        hasSubmenus: command.suggestions && command.suggestions.length > 0,
        action: (command.suggestions && command.suggestions.length > 0)
            ? null
            : command.action
    }));
    searchState.selectedIndex = 0;

    positionDropdown(container);

    // Force reflow before adding show class
    container.offsetHeight;

    requestAnimationFrame(() => {
        // Force visibility with inline styles AND class
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
        container.style.pointerEvents = 'auto';
        container.style.display = 'block';
        container.style.zIndex = '10001';
        container.classList.add('show');
        searchState.isOpen = true;
    });
    updateSelectedSuggestion();
}

/**
 * Show single command without submenus
 */
function showSingleCommand(command) {
    let container = getSuggestionsContainer();
    container.innerHTML = '';

    // Header
    const header = document.createElement('div');
    header.className = 'search-suggestion-header';
    header.innerHTML = `
        <span class="search-command-icon">${command.icon}</span>
        <span class="search-command-desc">${command.description}</span>
    `;
    container.appendChild(header);

    // Single item
    const item = document.createElement('div');
    item.className = 'search-suggestion-item selected';
    item.dataset.index = '0';
    item.innerHTML = `
        <span style="font-size: 1.125rem;">${command.icon}</span>
        <div class="search-suggestion-content">
            <div class="search-suggestion-label">${command.prefix}</div>
            <div class="search-suggestion-desc">${command.description}</div>
        </div>
        <span style="margin-left: auto; font-size: 0.75rem; opacity: 0.6;">ENTER pour exécuter</span>
    `;

    // Add click handler
    item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        if (command.action) {
            command.action();
        }
    });

    container.appendChild(item);

    // Store in searchResults for ENTER to work
    searchState.searchResults = [{
        value: command.prefix,
        label: command.prefix,
        desc: command.description,
        action: command.action
    }];
    searchState.selectedIndex = 0;

    positionDropdown(container);

    // Force reflow before adding show class
    container.offsetHeight;

    requestAnimationFrame(() => {
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
        container.style.pointerEvents = 'auto';
        container.style.display = 'block';
        container.style.zIndex = '10001';
        container.classList.add('show');
        searchState.isOpen = true;
        updateSelectedSuggestion();
    });
}

/**
 * Show command suggestions
 */
function showCommandSuggestions(commandType, query) {
    const command = SEARCH_COMMANDS[commandType];
    if (!command) {
        closeSearchSuggestions();
        return;
    }

    // Si pas de suggestions, afficher juste la commande elle-même
    if (!command.suggestions || command.suggestions.length === 0) {
        showSingleCommand(command);
        return;
    }

    // Extract search term after prefix
    let searchTerm = query.slice(command.prefix.length).trim().toLowerCase();

    // Filter suggestions
    let suggestions = command.suggestions;
    if (searchTerm) {
        suggestions = suggestions.filter(s =>
            s.label.toLowerCase().includes(searchTerm) ||
            s.desc.toLowerCase().includes(searchTerm)
        );
    }

    if (suggestions.length === 0) {
        closeSearchSuggestions();
        return;
    }

    let container = getSuggestionsContainer();
    container.innerHTML = '';

    // Header
    const header = document.createElement('div');
    header.className = 'search-suggestion-header';
    header.innerHTML = `
        <span class="search-command-icon">${command.icon}</span>
        <span class="search-command-desc">${command.description}</span>
    `;
    container.appendChild(header);

    // Suggestions
    suggestions.forEach((suggestion, index) => {
        const item = createSuggestionItem(suggestion, index);
        container.appendChild(item);
    });

    searchState.searchResults = suggestions;
    searchState.selectedIndex = 0;

    positionDropdown(container);

    // Force reflow before adding show class
    container.offsetHeight;

    requestAnimationFrame(() => {
        // Force visibility with inline styles AND class
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
        container.style.pointerEvents = 'auto';
        container.style.display = 'block';
        container.style.zIndex = '10001';
        container.classList.add('show');
        searchState.isOpen = true;
        updateSelectedSuggestion();
    });
}

/**
 * Show favorites and history combined
 */
function showFavoritesAndHistory(favorites, history) {
    let container = getSuggestionsContainer();
    container.innerHTML = '';

    // Build searchResults array for keyboard navigation
    searchState.searchResults = [];
    let itemIndex = 0;

    // Favorites section
    if (favorites.length > 0) {
        const favHeader = document.createElement('div');
        favHeader.className = 'search-suggestion-header';
        favHeader.innerHTML = `
            <span class="search-command-icon">⭐</span>
            <span class="search-command-desc">Favoris</span>
        `;
        container.appendChild(favHeader);

        favorites.forEach((favCommand) => {
            // Find command in SEARCH_COMMANDS
            let commandData = null;
            for (const [key, cmd] of Object.entries(SEARCH_COMMANDS)) {
                if (cmd.prefix === favCommand || cmd.aliases?.includes(favCommand)) {
                    commandData = cmd;
                    break;
                }
            }

            if (commandData) {
                const item = document.createElement('div');
                item.className = 'search-suggestion-item';
                item.dataset.index = itemIndex;
                item.innerHTML = `
                    <span style="font-size: 1.25rem;">${commandData.icon || '⭐'}</span>
                    <div class="search-suggestion-content">
                        <div class="search-suggestion-label">${commandData.prefix}</div>
                        <div class="search-suggestion-desc">${commandData.description}</div>
                    </div>
                `;

                // Add to searchResults for keyboard navigation
                searchState.searchResults.push({
                    value: commandData.prefix + (commandData.prefix.endsWith(':') ? ' ' : ''),
                    label: commandData.prefix,
                    desc: commandData.description,
                    action: commandData.action
                });

                item.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    executeSuggestion(searchState.searchResults[itemIndex]);
                });

                item.addEventListener('mouseenter', () => {
                    searchState.selectedIndex = itemIndex;
                    updateSelectedSuggestion();
                });

                container.appendChild(item);
                itemIndex++;
            }
        });
    }

    // History section
    if (history.length > 0) {
        const histHeader = document.createElement('div');
        histHeader.className = 'search-suggestion-header';
        histHeader.innerHTML = `
            <span class="search-command-icon">🕒</span>
            <span class="search-command-desc">Recherches récentes</span>
            <button class="search-clear-history" id="clearHistoryBtn" style="margin-left: auto; padding: 0.25rem 0.5rem; background: transparent; border: 1px solid var(--border); border-radius: 4px; font-size: 0.75rem; cursor: pointer;">Effacer</button>
        `;
        container.appendChild(histHeader);

        history.slice(0, 3).forEach((item) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'search-suggestion-item';
            historyItem.dataset.index = itemIndex;

            const icon = '';
            const timeAgo = getTimeAgo(item.timestamp);

            historyItem.innerHTML = `
                <span style="font-size: 1.125rem;">${icon}</span>
                <div class="search-suggestion-content">
                    <div class="search-suggestion-label">${escapeHtml(item.query)}</div>
                    <div class="search-suggestion-desc">${timeAgo}</div>
                </div>
                <button class="search-remove-history" data-query="${escapeHtml(item.query)}" style="margin-left: auto; background: transparent; border: none; width: 24px; height: 24px; cursor: pointer; font-size: 1.25rem; opacity: 0.6;">×</button>
            `;

            // Find the real action for this query
            const realAction = findActionForQuery(item.query);

            // Add to searchResults for keyboard navigation
            searchState.searchResults.push({
                value: item.query,
                label: item.query,
                desc: timeAgo,
                action: realAction || (() => {
                    // Fallback: re-type the query
                    const searchInput = document.getElementById('smartSearchInput');
                    if (searchInput) {
                        searchInput.value = item.query;
                        handleSearchInput({ target: searchInput });
                    }
                })
            });

            // Capturer l'index actuel dans la closure
            const currentIndex = itemIndex;

            historyItem.addEventListener('mousedown', (e) => {
                // Si on clique sur le bouton de suppression, ne rien faire ici
                if (e.target.classList.contains('search-remove-history')) {
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
                executeSuggestion(searchState.searchResults[currentIndex]);
            });

            historyItem.addEventListener('mouseenter', () => {
                searchState.selectedIndex = currentIndex;
                updateSelectedSuggestion();
            });

            // Add remove button handler
            const removeBtn = historyItem.querySelector('.search-remove-history');
            if (removeBtn) {
                removeBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const query = removeBtn.getAttribute('data-query');
                    console.log('🗑️ Removing from history:', query);
                    await searchState.history.removeFromHistory(query);
                    console.log('✅ Removed, refreshing display...');
                    // Refresh the display
                    await showDefaultSuggestions();
                });
                // Empêcher le mousedown de déclencher l'action parent
                removeBtn.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                });
            }

            container.appendChild(historyItem);
            itemIndex++;
        });

        // Clear history button
        const clearBtn = container.querySelector('#clearHistoryBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                await searchState.history.clearHistory();
                showDefaultSuggestions();
            });
        }
    }

    searchState.selectedIndex = 0;

    positionDropdown(container);

    // Force reflow before adding show class
    container.offsetHeight;

    requestAnimationFrame(() => {
        // Force visibility with inline styles AND class
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
        container.style.pointerEvents = 'auto';
        container.style.display = 'block';
        container.style.zIndex = '10001';
        container.classList.add('show');
        searchState.isOpen = true;
        updateSelectedSuggestion();
    });
}

/**
 * Show search history
 */
function showSearchHistory(history) {
    let container = getSuggestionsContainer();
    container.innerHTML = '';

    // Build searchResults array for keyboard navigation
    searchState.searchResults = [];

    // Header
    const header = document.createElement('div');
    header.className = 'search-suggestion-header';
    header.innerHTML = `
        <span class="search-command-icon">🕒</span>
        <span class="search-command-desc">Recherches récentes</span>
        <button class="search-clear-history" id="clearHistoryBtn" style="margin-left: auto; padding: 0.25rem 0.5rem; background: transparent; border: 1px solid var(--border); border-radius: 4px; font-size: 0.75rem; cursor: pointer;">Effacer</button>
    `;
    container.appendChild(header);

    // History items
    history.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'search-suggestion-item';
        historyItem.dataset.index = index;

        const icon = item.type === 'command' ? '⚡' : '🔍';
        const timeAgo = getTimeAgo(item.timestamp);

        historyItem.innerHTML = `
            <span style="font-size: 1.125rem;">${icon}</span>
            <div class="search-suggestion-content">
                <div class="search-suggestion-label">${escapeHtml(item.query)}</div>
                <div class="search-suggestion-desc">${timeAgo}</div>
            </div>
            <button class="search-remove-history" data-query="${escapeHtml(item.query)}" style="margin-left: auto; background: transparent; border: none; width: 24px; height: 24px; cursor: pointer; font-size: 1.25rem; opacity: 0.6;">×</button>
        `;

        // Find the real action for this query
        const realAction = findActionForQuery(item.query);

        // Add to searchResults for keyboard navigation
        searchState.searchResults.push({
            value: item.query,
            label: item.query,
            desc: timeAgo,
            action: realAction || (() => {
                // Fallback: re-type the query
                const searchInput = document.getElementById('smartSearchInput');
                if (searchInput) {
                    searchInput.value = item.query;
                    handleSearchInput({ target: searchInput });
                }
            })
        });

        historyItem.addEventListener('mousedown', (e) => {
            // Si on clique sur le bouton de suppression, ne rien faire ici
            if (e.target.classList.contains('search-remove-history')) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            executeSuggestion(searchState.searchResults[index]);
        });

        historyItem.addEventListener('mouseenter', () => {
            searchState.selectedIndex = index;
            updateSelectedSuggestion();
        });

        // Add remove button handler
        const removeBtn = historyItem.querySelector('.search-remove-history');
        if (removeBtn) {
            removeBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const query = removeBtn.getAttribute('data-query');
                console.log('🗑️ Removing from history:', query);
                await searchState.history.removeFromHistory(query);
                console.log('✅ Removed, refreshing display...');
                // Refresh the display
                await showDefaultSuggestions();
            });
            // Empêcher le mousedown de déclencher l'action parent
            removeBtn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        }

        container.appendChild(historyItem);
    });

    // Clear history button
    const clearBtn = container.querySelector('#clearHistoryBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await searchState.history.clearHistory();
            closeSearchSuggestions();
        });
    }

    searchState.selectedIndex = 0;

    positionDropdown(container);

    // Force reflow before adding show class
    container.offsetHeight;

    requestAnimationFrame(() => {
        // Force visibility with inline styles AND class
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
        container.style.pointerEvents = 'auto';
        container.style.display = 'block';
        container.style.zIndex = '10001';
        container.classList.add('show');
        searchState.isOpen = true;
        updateSelectedSuggestion();
    });
}

/**
 * Create command item element
 */
function createCommandItem(command, index) {
    const item = document.createElement('div');
    item.className = 'search-suggestion-item search-command-overview';
    item.dataset.index = index;

    item.innerHTML = `
        <span class="search-command-icon">${command.icon}</span>
        <div class="search-suggestion-content">
            <div class="search-suggestion-label">${command.prefix}</div>
            <div class="search-suggestion-desc">${command.description}</div>
        </div>
        <div class="search-suggestion-shortcut">⇥</div>
    `;

    item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const searchInput = document.getElementById('smartSearchInput');
        if (searchInput) {
            // Si la commande a des suggestions, afficher les sous-menus
            if (command.suggestions && command.suggestions.length > 0) {
                searchInput.value = command.prefix + (command.prefix.endsWith(':') ? ' ' : '');
                searchInput.focus();
                handleSearchInput({ target: searchInput });
            } else {
                // Sinon, exécuter l'action directement
                if (command.action && typeof command.action === 'function') {
                    searchInput.value = '';
                    searchInput.blur();
                    closeSearchSuggestions();
                    command.action();
                }
            }
        }
    });

    item.addEventListener('mouseenter', () => {
        searchState.selectedIndex = index;
        updateSelectedSuggestion();
    });

    return item;
}

/**
 * Create suggestion item element
 */
function createSuggestionItem(suggestion, index) {
    const item = document.createElement('div');
    item.className = 'search-suggestion-item';
    item.dataset.index = index;

    item.innerHTML = `
        <div class="search-suggestion-content">
            <div class="search-suggestion-label">${escapeHtml(suggestion.label)}</div>
            <div class="search-suggestion-desc">${escapeHtml(suggestion.desc)}</div>
        </div>
        <div class="search-suggestion-shortcut">↵</div>
    `;

    // Utiliser mousedown pour exécuter AVANT le blur
    item.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Empêche le blur
        e.stopPropagation();
        console.log('🖱️ Suggestion mousedown:', suggestion.label, suggestion);

        // Exécuter immédiatement
        executeSuggestion(suggestion);
    });

    item.addEventListener('mouseenter', () => {
        searchState.selectedIndex = index;
        updateSelectedSuggestion();
    });

    return item;
}

/**
 * Execute suggestion action
 */
async function executeSuggestion(suggestion) {
    console.log('🚀 Executing suggestion:', suggestion);
    console.log('📝 Suggestion details:', {
        label: suggestion.label,
        value: suggestion.value,
        hasAction: !!suggestion.action,
        actionType: typeof suggestion.action
    });

    // Clear input and close dropdown IMMEDIATELY
    const searchInput = document.getElementById('smartSearchInput');
    if (searchInput) {
        searchInput.value = '';
        searchInput.blur();
    }
    closeSearchSuggestions();

    // Add to history AVANT l'exécution (pour que ça s'enregistre même si la page redirige)
    try {
        console.log('💾 Saving to history:', suggestion.value);
        await searchState.history.addToHistory(suggestion.value, 'command', suggestion.value);
        console.log('✅ Saved to history successfully');
    } catch (err) {
        console.error('❌ Error adding to history:', err);
    }

    // Execute action
    if (suggestion.action && typeof suggestion.action === 'function') {
        console.log('✅ Action found, executing NOW...');

        try {
            const result = suggestion.action();
            console.log('✅ Action executed, result:', result);

            // Si c'est une Promise, attendre
            if (result instanceof Promise) {
                console.log('⏳ Waiting for async action...');
                await result;
                console.log('✅ Async action completed');
            }

        } catch (error) {
            console.error('❌ Error executing action:', error);
        }
    } else {
        console.warn('⚠️ No action found for suggestion:', suggestion);
    }

    console.log('🏁 executeSuggestion completed');
}

/**
 * Update selected suggestion visual state
 */
function updateSelectedSuggestion() {
    const container = document.getElementById('searchSuggestionsContainer');
    if (!container) return;

    const items = container.querySelectorAll('.search-suggestion-item');
    items.forEach((item, index) => {
        if (index === searchState.selectedIndex) {
            item.classList.add('selected');
            // Scroll into view if needed
            item.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest'
            });
        } else {
            item.classList.remove('selected');
        }
    });
}

/**
 * Get or create suggestions container
 */
function getSuggestionsContainer() {
    let container = document.getElementById('searchSuggestionsContainer');

    if (!container) {
        container = document.createElement('div');
        container.id = 'searchSuggestionsContainer';
        container.className = 'search-suggestions-container';

        // Set initial hidden state with inline styles
        container.style.position = 'fixed';
        container.style.opacity = '0';
        container.style.transform = 'translateY(-10px)';
        container.style.pointerEvents = 'none';
        container.style.display = 'block';
        container.style.zIndex = '10001';

        // Empêcher le blur quand on clique dans le container
        container.addEventListener('mousedown', (e) => {
            // Ne preventDefault que si c'est sur le container lui-même, pas sur les items
            if (e.target === container || e.target.classList.contains('search-suggestion-header')) {
                e.preventDefault(); // Empêche le blur de l'input
                console.log('🖱️ Mousedown sur container/header, blur prevented');
            }
        }, true); // Capture phase pour attraper avant les items

        // Attach to body instead of wrapper to avoid layout issues
        document.body.appendChild(container);

        // Position it relative to search input
        positionDropdown(container);
    }

    return container;
}

/**
 * Position dropdown relative to search input
 */
function positionDropdown(container) {
    const searchInput = document.getElementById('smartSearchInput');
    if (!searchInput) {
        console.warn('⚠️ Search input not found for positioning');
        return;
    }

    const rect = searchInput.getBoundingClientRect();

    container.style.position = 'fixed';
    container.style.top = `${rect.bottom + 8}px`;
    container.style.left = `${rect.left}px`;
    container.style.width = `${rect.width}px`;
}

/**
 * Close suggestions dropdown
 */
function closeSearchSuggestions() {
    const container = document.getElementById('searchSuggestionsContainer');
    if (container) {
        // Remove inline styles to hide
        container.style.opacity = '0';
        container.style.transform = 'translateY(-10px)';
        container.style.pointerEvents = 'none';

        container.classList.remove('show');
        setTimeout(() => {
            if (!searchState.isOpen) {
                container.innerHTML = '';
            }
        }, 300);
    }
    searchState.isOpen = false;
    searchState.selectedIndex = -1;
}

/**
 * Show help modal
 */
function showHelpModal(section) {
    alert(`Help section: ${section}\n\nCette fonctionnalité sera implémentée prochainement.`);
}

/**
 * Utility: Get time ago string
 */
function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return 'À l\'instant';
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)}min`;
    if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
    return `Il y a ${Math.floor(seconds / 86400)}j`;
}

/**
 * Utility: Escape HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
