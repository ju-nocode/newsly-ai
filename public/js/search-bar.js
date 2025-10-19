// ================================================
// ADVANCED SMART SEARCH BAR - Enhanced Search System
// ================================================

/**
 * Search command types (EXPANDED)
 */
const SEARCH_COMMANDS = {
    profile: {
        prefix: '/profile:',
        aliases: ['/profil:', '/user:', '/me:'],
        description: 'Rechercher dans votre profil',
        icon: '👤',
        suggestions: [
            { value: '/profile: username', label: 'Nom d\'utilisateur', desc: 'Modifier votre nom', action: 'settings' },
            { value: '/profile: email', label: 'Email', desc: 'Voir/modifier email', action: 'settings' },
            { value: '/profile: avatar', label: 'Avatar', desc: 'Changer votre avatar', action: 'settings' },
            { value: '/profile: password', label: 'Mot de passe', desc: 'Modifier mot de passe', action: 'settings' },
            { value: '/profile: preferences', label: 'Préférences', desc: 'Gérer vos préférences', action: 'settings' },
            { value: '/profile: delete', label: 'Supprimer compte', desc: 'Supprimer votre compte', action: 'delete-account' }
        ]
    },
    feed: {
        prefix: '/feed:',
        aliases: ['/news:', '/actu:', '/articles:'],
        description: 'Rechercher dans les actualités',
        icon: '📰',
        suggestions: [
            { value: '/feed: technology', label: 'Technologie', desc: 'Articles tech', category: 'technology' },
            { value: '/feed: business', label: 'Business', desc: 'Actualités business', category: 'business' },
            { value: '/feed: sports', label: 'Sports', desc: 'Actualités sportives', category: 'sports' },
            { value: '/feed: science', label: 'Science', desc: 'Actualités scientifiques', category: 'science' },
            { value: '/feed: entertainment', label: 'Divertissement', desc: 'Actualités entertainment', category: 'entertainment' },
            { value: '/feed: health', label: 'Santé', desc: 'Actualités santé', category: 'health' },
            { value: '/feed: general', label: 'Général', desc: 'Actualités générales', category: 'general' }
        ]
    },
    settings: {
        prefix: '/settings:',
        aliases: ['/config:', '/options:'],
        description: 'Accéder aux paramètres',
        icon: '⚙️',
        suggestions: [
            { value: '/settings: account', label: 'Compte', desc: 'Paramètres du compte', action: 'settings-account' },
            { value: '/settings: theme', label: 'Thème', desc: 'Apparence et thème', action: 'settings-theme' },
            { value: '/settings: language', label: 'Langue', desc: 'Changer la langue', action: 'settings-language' },
            { value: '/settings: notifications', label: 'Notifications', desc: 'Gérer les notifications', action: 'settings-notifications' }
        ]
    },
    help: {
        prefix: '/help',
        aliases: ['/aide', '/?', '/h'],
        description: 'Aide et documentation',
        icon: '❓',
        suggestions: [
            { value: '/help commands', label: 'Commandes', desc: 'Liste des commandes disponibles', action: 'show-help' },
            { value: '/help shortcuts', label: 'Raccourcis', desc: 'Raccourcis clavier', action: 'show-shortcuts' },
            { value: '/help search', label: 'Recherche', desc: 'Comment utiliser la recherche', action: 'show-search-help' }
        ]
    },
    filter: {
        prefix: '/filter:',
        aliases: ['/filtre:'],
        description: 'Filtrer les actualités',
        icon: '🔍',
        suggestions: [
            { value: '/filter: date:today', label: 'Aujourd\'hui', desc: 'Articles d\'aujourd\'hui', filter: 'date-today' },
            { value: '/filter: date:week', label: 'Cette semaine', desc: 'Articles de la semaine', filter: 'date-week' },
            { value: '/filter: date:month', label: 'Ce mois', desc: 'Articles du mois', filter: 'date-month' },
            { value: '/filter: country:us', label: 'États-Unis', desc: 'Articles des US', filter: 'country-us' },
            { value: '/filter: country:fr', label: 'France', desc: 'Articles de France', filter: 'country-fr' },
            { value: '/filter: source:', label: 'Par source', desc: 'Filtrer par source', filter: 'source' }
        ]
    }
};

/**
 * Search history manager
 */
class SearchHistory {
    constructor(maxItems = 10) {
        this.maxItems = maxItems;
        this.storageKey = 'newsly-search-history';
    }

    getHistory() {
        try {
            const history = localStorage.getItem(this.storageKey);
            return history ? JSON.parse(history) : [];
        } catch (e) {
            console.error('Error reading search history:', e);
            return [];
        }
    }

    addToHistory(query, type = 'search') {
        if (!query || query.trim().length === 0) return;

        const history = this.getHistory();
        const newEntry = {
            query: query.trim(),
            type,
            timestamp: Date.now()
        };

        // Remove duplicates
        const filtered = history.filter(item => item.query !== newEntry.query);

        // Add to beginning
        filtered.unshift(newEntry);

        // Limit size
        const limited = filtered.slice(0, this.maxItems);

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(limited));
        } catch (e) {
            console.error('Error saving search history:', e);
        }
    }

    clearHistory() {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (e) {
            console.error('Error clearing search history:', e);
        }
    }

    getRecentSearches(limit = 5) {
        return this.getHistory().slice(0, limit);
    }
}

/**
 * Fuzzy search implementation (Levenshtein distance)
 */
function fuzzyMatch(query, target, threshold = 0.6) {
    const q = query.toLowerCase();
    const t = target.toLowerCase();

    // Exact match
    if (t.includes(q)) return { match: true, score: 1.0 };

    // Calculate Levenshtein distance
    const distance = levenshteinDistance(q, t);
    const maxLength = Math.max(q.length, t.length);
    const similarity = 1 - (distance / maxLength);

    return {
        match: similarity >= threshold,
        score: similarity
    };
}

function levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[str2.length][str1.length];
}

/**
 * Search bar state
 */
let searchState = {
    isOpen: false,
    currentCommand: null,
    searchResults: [],
    selectedIndex: -1,
    searchTimeout: null,
    callbacks: {},
    history: new SearchHistory(),
    advancedFilters: {
        dateRange: null,
        countries: [],
        sources: []
    }
};

/**
 * Initialize search bar
 */
export function initSearchBar(options = {}) {
    const {
        onProfileSearch = null,
        onFeedSearch = null,
        onNewsSearch = null,
        onSettingsSearch = null,
        onHelpSearch = null,
        onFilterSearch = null
    } = options;

    // Store callbacks
    searchState.callbacks = {
        onProfileSearch,
        onFeedSearch,
        onNewsSearch,
        onSettingsSearch,
        onHelpSearch,
        onFilterSearch
    };

    // Setup event listeners
    setupSearchListeners();

    console.log('✅ Advanced search bar initialized');
}

/**
 * Setup event listeners
 */
function setupSearchListeners() {
    const searchInput = document.getElementById('smartSearchInput');
    const searchBtn = document.getElementById('smartSearchBtn');

    if (!searchInput) {
        console.warn('⚠️ Search input not found');
        return;
    }

    // Search input events
    searchInput.addEventListener('input', handleSearchInput);
    searchInput.addEventListener('keydown', handleSearchKeydown);
    searchInput.addEventListener('focus', handleSearchFocus);
    searchInput.addEventListener('blur', handleSearchBlur);

    // Search button click
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            if (searchState.isOpen) {
                closeSearchSuggestions();
            } else {
                searchInput.focus();
            }
        });
    }

    // Close on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchState.isOpen) {
            closeSearchSuggestions();
        }
    });

    // Keyboard shortcut: Ctrl+K or Cmd+K
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
        }
    });
}

/**
 * Handle search input with fuzzy matching
 */
function handleSearchInput(e) {
    const query = e.target.value;

    // Clear previous timeout
    if (searchState.searchTimeout) {
        clearTimeout(searchState.searchTimeout);
    }

    // Empty query - show history
    if (!query || query.trim().length === 0) {
        showSearchHistory();
        return;
    }

    // Just "/" - show all available commands
    if (query === '/') {
        showAllCommands();
        return;
    }

    // Detect command type (with aliases support)
    const commandType = detectCommandType(query);
    searchState.currentCommand = commandType;

    if (commandType) {
        // Show command suggestions with fuzzy matching
        showCommandSuggestions(commandType, query);
    } else if (query.startsWith('/')) {
        // Partial command - show matching commands
        showPartialCommandMatches(query);
    } else if (query.length >= 2) {
        // Regular search with debounce
        searchState.searchTimeout = setTimeout(() => {
            performRegularSearch(query);
        }, 300);
    } else {
        closeSearchSuggestions();
    }
}

/**
 * Detect command type from query (with aliases)
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
 * Show command suggestions with fuzzy matching
 */
function showCommandSuggestions(commandType, query) {
    const command = SEARCH_COMMANDS[commandType];
    if (!command) return;

    // Extract search term after prefix
    let searchTerm = query.slice(command.prefix.length).trim().toLowerCase();

    // Filter suggestions with fuzzy matching
    let suggestions = command.suggestions;
    if (searchTerm) {
        suggestions = suggestions
            .map(s => {
                const labelMatch = fuzzyMatch(searchTerm, s.label);
                const descMatch = fuzzyMatch(searchTerm, s.desc);
                const bestScore = Math.max(labelMatch.score, descMatch.score);

                return {
                    ...s,
                    fuzzyScore: bestScore,
                    fuzzyMatch: labelMatch.match || descMatch.match
                };
            })
            .filter(s => s.fuzzyMatch)
            .sort((a, b) => b.fuzzyScore - a.fuzzyScore);
    }

    // Reset selection
    searchState.selectedIndex = -1;

    // Display suggestions
    displaySuggestions(suggestions, commandType);
}

/**
 * Show partial command matches when user types "/x..."
 */
function showPartialCommandMatches(query) {
    const lowerQuery = query.toLowerCase();

    // Find matching commands
    const matches = Object.entries(SEARCH_COMMANDS).filter(([type, command]) => {
        return command.prefix.toLowerCase().startsWith(lowerQuery) ||
               command.aliases?.some(alias => alias.toLowerCase().startsWith(lowerQuery));
    });

    if (matches.length === 0) {
        closeSearchSuggestions();
        return;
    }

    let container = document.getElementById('searchSuggestionsContainer');

    if (!container) {
        container = document.createElement('div');
        container.id = 'searchSuggestionsContainer';
        container.className = 'search-suggestions-container';

        const searchWrapper = document.querySelector('.smart-search-wrapper');
        if (searchWrapper) {
            searchWrapper.appendChild(container);
        }
    }

    container.innerHTML = '';

    // Add header
    const header = document.createElement('div');
    header.className = 'search-suggestion-header';
    header.innerHTML = `
        <span class="search-command-icon">⚡</span>
        <span class="search-command-desc">Commandes correspondantes</span>
        <span class="search-suggestion-hint" style="margin-left: auto; font-size: 0.75rem; color: var(--text-secondary);">Tab pour compléter</span>
    `;
    container.appendChild(header);

    // Add matching commands
    matches.forEach(([type, command], index) => {
        const item = document.createElement('div');
        item.className = 'search-suggestion-item search-command-overview';
        item.dataset.index = index;
        item.dataset.value = command.prefix + ' ';

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
            const searchInput = document.getElementById('smartSearchInput');
            if (searchInput) {
                searchInput.value = command.prefix + ' ';
                searchInput.focus();
                handleSearchInput({ target: searchInput });
            }
        });

        item.addEventListener('mouseenter', () => {
            searchState.selectedIndex = index;
            updateSelectedSuggestion();
        });

        container.appendChild(item);
    });

    // Store matches as search results for Tab autocomplete
    searchState.searchResults = matches.map(([type, command]) => ({
        value: command.prefix + ' ',
        label: command.prefix,
        desc: command.description
    }));
    searchState.selectedIndex = 0; // Select first by default

    container.classList.add('show');
    searchState.isOpen = true;
    updateSelectedSuggestion();
}

/**
 * Show all commands when user types "/"
 */
function showAllCommands() {
    let container = document.getElementById('searchSuggestionsContainer');

    if (!container) {
        container = document.createElement('div');
        container.id = 'searchSuggestionsContainer';
        container.className = 'search-suggestions-container';

        const searchWrapper = document.querySelector('.smart-search-wrapper');
        if (searchWrapper) {
            searchWrapper.appendChild(container);
        }
    }

    container.innerHTML = '';

    // Add header
    const header = document.createElement('div');
    header.className = 'search-suggestion-header';
    header.innerHTML = `
        <span class="search-command-icon">⚡</span>
        <span class="search-command-desc">Commandes disponibles</span>
        <span class="search-suggestion-hint" style="margin-left: auto; font-size: 0.75rem; color: var(--text-secondary);">Appuyez sur Tab pour compléter</span>
    `;
    container.appendChild(header);

    // Add all command types
    const commands = Object.entries(SEARCH_COMMANDS);
    commands.forEach(([type, command], index) => {
        const item = document.createElement('div');
        item.className = 'search-suggestion-item search-command-overview';
        item.dataset.index = index;
        item.dataset.value = command.prefix + ' ';

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
            const searchInput = document.getElementById('smartSearchInput');
            if (searchInput) {
                searchInput.value = command.prefix + ' ';
                searchInput.focus();
                handleSearchInput({ target: searchInput });
            }
        });

        item.addEventListener('mouseenter', () => {
            searchState.selectedIndex = index;
            updateSelectedSuggestion();
        });

        container.appendChild(item);
    });

    // Store commands as search results for Tab autocomplete
    searchState.searchResults = commands.map(([type, command]) => ({
        value: command.prefix + ' ',
        label: command.prefix,
        desc: command.description
    }));
    searchState.selectedIndex = -1;

    container.classList.add('show');
    searchState.isOpen = true;
}

/**
 * Show default commands (when no history)
 */
function showDefaultCommands() {
    let container = document.getElementById('searchSuggestionsContainer');

    if (!container) {
        container = document.createElement('div');
        container.id = 'searchSuggestionsContainer';
        container.className = 'search-suggestions-container';

        const searchWrapper = document.querySelector('.smart-search-wrapper');
        if (searchWrapper) {
            searchWrapper.appendChild(container);
        }
    }

    container.innerHTML = '';

    // Add header
    const header = document.createElement('div');
    header.className = 'search-suggestion-header';
    header.innerHTML = `
        <span class="search-command-icon">⚡</span>
        <span class="search-command-desc">Commandes disponibles</span>
    `;
    container.appendChild(header);

    // Add all command types
    Object.entries(SEARCH_COMMANDS).forEach(([type, command]) => {
        const item = document.createElement('div');
        item.className = 'search-suggestion-item search-command-overview';

        item.innerHTML = `
            <span class="search-command-icon">${command.icon}</span>
            <div class="search-suggestion-content">
                <div class="search-suggestion-label">${command.prefix}</div>
                <div class="search-suggestion-desc">${command.description}</div>
            </div>
            <div class="search-suggestion-shortcut">→</div>
        `;

        item.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const searchInput = document.getElementById('smartSearchInput');
            if (searchInput) {
                searchInput.value = command.prefix + ' ';
                searchInput.focus();
                handleSearchInput({ target: searchInput });
            }
        });

        container.appendChild(item);
    });

    container.classList.add('show');
    searchState.isOpen = true;
}

/**
 * Show search history
 */
function showSearchHistory() {
    const history = searchState.history.getRecentSearches(5);

    if (history.length === 0) {
        // Show default commands instead of closing
        showDefaultCommands();
        return;
    }

    let container = document.getElementById('searchSuggestionsContainer');

    if (!container) {
        container = document.createElement('div');
        container.id = 'searchSuggestionsContainer';
        container.className = 'search-suggestions-container';

        const searchWrapper = document.querySelector('.smart-search-wrapper');
        if (searchWrapper) {
            searchWrapper.appendChild(container);
        }
    }

    container.innerHTML = '';

    // Add header
    const header = document.createElement('div');
    header.className = 'search-suggestion-header';
    header.innerHTML = `
        <span class="search-command-icon">🕒</span>
        <span class="search-command-desc">Recherches récentes</span>
        <button class="search-clear-history" id="clearHistoryBtn">Effacer</button>
    `;
    container.appendChild(header);

    // Add history items
    history.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'search-suggestion-item search-history-item';
        historyItem.dataset.index = index;

        const icon = item.type === 'command' ? '⚡' : '🔍';
        const timeAgo = getTimeAgo(item.timestamp);

        historyItem.innerHTML = `
            <span class="search-history-icon">${icon}</span>
            <div class="search-suggestion-content">
                <div class="search-suggestion-label">${escapeHtml(item.query)}</div>
                <div class="search-suggestion-desc">${timeAgo}</div>
            </div>
            <button class="search-remove-history" data-query="${escapeHtml(item.query)}">×</button>
        `;

        historyItem.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('search-remove-history')) {
                e.stopPropagation();
                // Remove this item from history
                return;
            }
            e.preventDefault();
            const searchInput = document.getElementById('smartSearchInput');
            if (searchInput) {
                searchInput.value = item.query;
                handleSearchInput({ target: searchInput });
            }
        });

        container.appendChild(historyItem);
    });

    // Clear history button
    const clearBtn = container.querySelector('#clearHistoryBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            searchState.history.clearHistory();
            closeSearchSuggestions();
        });
    }

    container.classList.add('show');
    searchState.isOpen = true;
}

/**
 * Display suggestions dropdown
 */
function displaySuggestions(suggestions, commandType) {
    let container = document.getElementById('searchSuggestionsContainer');

    if (!container) {
        container = document.createElement('div');
        container.id = 'searchSuggestionsContainer';
        container.className = 'search-suggestions-container';

        const searchWrapper = document.querySelector('.smart-search-wrapper');
        if (searchWrapper) {
            searchWrapper.appendChild(container);
        } else {
            console.warn('⚠️ Search wrapper not found');
            return;
        }
    }

    container.innerHTML = '';

    if (suggestions.length === 0) {
        container.innerHTML = `
            <div class="search-suggestion-empty">
                <p>Aucun résultat trouvé</p>
                <p class="search-suggestion-hint">Essayez avec une autre recherche</p>
            </div>
        `;
        container.classList.add('show');
        searchState.isOpen = true;
        return;
    }

    // Add command header
    const command = SEARCH_COMMANDS[commandType];
    const header = document.createElement('div');
    header.className = 'search-suggestion-header';
    header.innerHTML = `
        <span class="search-command-icon">${command.icon}</span>
        <span class="search-command-desc">${command.description}</span>
    `;
    container.appendChild(header);

    // Add suggestions
    suggestions.forEach((suggestion, index) => {
        const item = document.createElement('div');
        item.className = 'search-suggestion-item';
        item.dataset.index = index;
        item.dataset.value = suggestion.value;

        // Show fuzzy score if applicable
        const scoreIndicator = suggestion.fuzzyScore && suggestion.fuzzyScore < 1
            ? `<span class="fuzzy-indicator" title="Correspondance approximative">${Math.round(suggestion.fuzzyScore * 100)}%</span>`
            : '';

        item.innerHTML = `
            <div class="search-suggestion-content">
                <div class="search-suggestion-label">${escapeHtml(suggestion.label)} ${scoreIndicator}</div>
                <div class="search-suggestion-desc">${escapeHtml(suggestion.desc)}</div>
            </div>
            <div class="search-suggestion-shortcut">↵</div>
        `;

        item.addEventListener('mousedown', (e) => {
            e.preventDefault();
            selectSuggestion(suggestion, commandType);
        });

        item.addEventListener('mouseenter', () => {
            searchState.selectedIndex = index;
            updateSelectedSuggestion();
        });

        container.appendChild(item);
    });

    container.classList.add('show');
    searchState.isOpen = true;
    searchState.searchResults = suggestions;
}

/**
 * Perform regular search (continued in next message...)
 */
function performRegularSearch(query) {
    const callback = searchState.callbacks?.onNewsSearch;

    if (callback && typeof callback === 'function') {
        callback(query);
    }

    let container = document.getElementById('searchSuggestionsContainer');

    if (!container) {
        container = document.createElement('div');
        container.id = 'searchSuggestionsContainer';
        container.className = 'search-suggestions-container';

        const searchWrapper = document.querySelector('.smart-search-wrapper');
        if (searchWrapper) {
            searchWrapper.appendChild(container);
        }
    }

    container.innerHTML = `
        <div class="search-suggestion-header">
            <span class="search-command-icon">🔍</span>
            <span class="search-command-desc">Recherche dans les actualités</span>
        </div>
        <div class="search-suggestion-loading">
            <div class="search-loading-spinner"></div>
            <p>Recherche de "${escapeHtml(query)}"...</p>
        </div>
    `;

    container.classList.add('show');
    searchState.isOpen = true;
}

/**
 * Handle keyboard navigation
 */
function handleSearchKeydown(e) {
    // Tab for autocomplete - handle even if not open
    if (e.key === 'Tab') {
        const query = e.target.value;

        // If just "/", autocomplete to first command
        if (query === '/') {
            e.preventDefault();
            const firstCommand = Object.values(SEARCH_COMMANDS)[0];
            e.target.value = firstCommand.prefix + ' ';
            handleSearchInput({ target: e.target });
            return;
        }

        // If typing partial command (starts with / but not complete)
        if (query.startsWith('/') && !detectCommandType(query)) {
            e.preventDefault();
            // Find matching command
            const lowerQuery = query.toLowerCase();
            for (const command of Object.values(SEARCH_COMMANDS)) {
                if (command.prefix.toLowerCase().startsWith(lowerQuery) ||
                    command.aliases?.some(alias => alias.toLowerCase().startsWith(lowerQuery))) {
                    e.target.value = command.prefix + ' ';
                    handleSearchInput({ target: e.target });
                    return;
                }
            }
        }

        // If suggestions are open, autocomplete selected or first suggestion
        if (searchState.isOpen && searchState.searchResults.length > 0) {
            e.preventDefault();
            const index = searchState.selectedIndex >= 0 ? searchState.selectedIndex : 0;
            const suggestion = searchState.searchResults[index];

            // Autocomplete with the suggestion value
            e.target.value = suggestion.value;
            handleSearchInput({ target: e.target });
            return;
        }
    }

    if (!searchState.isOpen) return;

    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            searchState.selectedIndex = Math.min(
                searchState.selectedIndex + 1,
                searchState.searchResults.length - 1
            );
            updateSelectedSuggestion();
            break;

        case 'ArrowUp':
            e.preventDefault();
            searchState.selectedIndex = Math.max(searchState.selectedIndex - 1, 0);
            updateSelectedSuggestion();
            break;

        case 'Enter':
            e.preventDefault();
            if (searchState.selectedIndex >= 0 && searchState.searchResults.length > 0) {
                const suggestion = searchState.searchResults[searchState.selectedIndex];
                selectSuggestion(suggestion, searchState.currentCommand);
            } else {
                const query = e.target.value;
                if (query.length >= 2) {
                    executeSearch(query);
                }
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
 * Update selected suggestion visual state
 */
function updateSelectedSuggestion() {
    const items = document.querySelectorAll('.search-suggestion-item:not(.search-history-item)');
    items.forEach((item, index) => {
        if (index === searchState.selectedIndex) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
}

/**
 * Select a suggestion
 */
function selectSuggestion(suggestion, commandType) {
    const searchInput = document.getElementById('smartSearchInput');

    // Add to history
    searchState.history.addToHistory(suggestion.value, 'command');

    if (commandType === 'profile') {
        const callback = searchState.callbacks?.onProfileSearch;
        if (callback) callback(suggestion);
    } else if (commandType === 'feed') {
        const callback = searchState.callbacks?.onFeedSearch;
        if (callback) callback(suggestion);
    } else if (commandType === 'settings') {
        const callback = searchState.callbacks?.onSettingsSearch;
        if (callback) callback(suggestion);
    } else if (commandType === 'help') {
        const callback = searchState.callbacks?.onHelpSearch;
        if (callback) callback(suggestion);
    } else if (commandType === 'filter') {
        const callback = searchState.callbacks?.onFilterSearch;
        if (callback) callback(suggestion);
    }

    if (searchInput) {
        searchInput.value = '';
    }
    closeSearchSuggestions();
}

/**
 * Execute regular search
 */
function executeSearch(query) {
    // Add to history
    searchState.history.addToHistory(query, 'search');

    const callback = searchState.callbacks?.onNewsSearch;
    if (callback && typeof callback === 'function') {
        callback(query, true);
    }
    closeSearchSuggestions();
}

/**
 * Handle search focus
 */
function handleSearchFocus() {
    const searchInput = document.getElementById('smartSearchInput');
    const query = searchInput?.value || '';

    if (!query || query.trim().length === 0) {
        showSearchHistory();
    } else if (query.length >= 2 || detectCommandType(query)) {
        handleSearchInput({ target: searchInput });
    }
}

/**
 * Handle search blur
 */
function handleSearchBlur() {
    setTimeout(() => {
        closeSearchSuggestions();
    }, 200);
}

/**
 * Close suggestions dropdown
 */
function closeSearchSuggestions() {
    const container = document.getElementById('searchSuggestionsContainer');
    if (container) {
        container.classList.remove('show');
        setTimeout(() => {
            container.remove();
        }, 200);
    }
    searchState.isOpen = false;
    searchState.selectedIndex = -1;
    searchState.currentCommand = null;
}

/**
 * Update search results
 */
export function updateSearchResults(articles) {
    const container = document.getElementById('searchSuggestionsContainer');
    if (!container) return;

    if (articles.length === 0) {
        container.innerHTML = `
            <div class="search-suggestion-header">
                <span class="search-command-icon">🔍</span>
                <span class="search-command-desc">Résultats de recherche</span>
            </div>
            <div class="search-suggestion-empty">
                <p>Aucun article trouvé</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="search-suggestion-header">
            <span class="search-command-icon">🔍</span>
            <span class="search-command-desc">${articles.length} article(s) trouvé(s)</span>
        </div>
    `;

    articles.slice(0, 5).forEach((article, index) => {
        const item = document.createElement('div');
        item.className = 'search-suggestion-item search-result-article';
        item.dataset.index = index;

        item.innerHTML = `
            <div class="search-result-image">
                <img src="${article.urlToImage || 'https://via.placeholder.com/60x60?text=News'}"
                     alt="${escapeHtml(article.title)}"
                     onerror="this.src='https://via.placeholder.com/60x60?text=News'">
            </div>
            <div class="search-suggestion-content">
                <div class="search-suggestion-label">${escapeHtml(article.title.slice(0, 60))}...</div>
                <div class="search-suggestion-desc">${escapeHtml(article.source?.name || 'Source inconnue')}</div>
            </div>
        `;

        item.addEventListener('mousedown', (e) => {
            e.preventDefault();
            if (article.url) {
                window.open(article.url, '_blank');
            }
            closeSearchSuggestions();
        });

        container.appendChild(item);
    });
}

/**
 * Clear search history
 */
export function clearSearchHistory() {
    searchState.history.clearHistory();
}

/**
 * Get search history
 */
export function getSearchHistory() {
    return searchState.history.getHistory();
}

/**
 * Utility: Get time ago
 */
function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `Il y a ${days}j`;
    if (hours > 0) return `Il y a ${hours}h`;
    if (minutes > 0) return `Il y a ${minutes}min`;
    return 'À l\'instant';
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

console.log('✅ Advanced search bar module loaded');
