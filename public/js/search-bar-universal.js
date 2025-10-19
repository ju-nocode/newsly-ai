// ================================================
// UNIVERSAL SMART SEARCH BAR - Autonomous Module
// ================================================
// Module complètement autonome qui fonctionne sur toutes les pages

/**
 * Search command configuration with universal actions
 */
const SEARCH_COMMANDS = {
    dashboard: {
        prefix: '/dashboard',
        aliases: ['/home', '/accueil'],
        description: 'Aller au tableau de bord',
        icon: '🏠',
        action: () => window.location.href = 'dashboard.html',
        suggestions: []
    },
    profile: {
        prefix: '/profile:',
        aliases: ['/profil:', '/user:', '/me:'],
        description: 'Gérer votre profil',
        icon: '👤',
        suggestions: [
            {
                value: '/profile: account',
                label: 'Compte',
                desc: 'Paramètres du compte',
                action: () => window.location.href = 'settings.html#account'
            },
            {
                value: '/profile: password',
                label: 'Mot de passe',
                desc: 'Modifier votre mot de passe',
                action: () => window.location.href = 'settings.html#security'
            },
            {
                value: '/profile: preferences',
                label: 'Préférences',
                desc: 'Vos préférences',
                action: () => window.location.href = 'settings.html#preferences'
            }
        ]
    },
    feed: {
        prefix: '/feed:',
        aliases: ['/news:', '/actu:', '/articles:'],
        description: 'Rechercher des actualités',
        icon: '📰',
        suggestions: [
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
        aliases: ['/config', '/options', '/parametres'],
        description: 'Accéder aux paramètres',
        icon: '⚙️',
        action: () => window.location.href = 'settings.html',
        suggestions: [
            {
                value: '/settings: account',
                label: 'Compte',
                desc: 'Paramètres du compte',
                action: () => window.location.href = 'settings.html#account'
            },
            {
                value: '/settings: theme',
                label: 'Thème',
                desc: 'Apparence et thème',
                action: () => window.location.href = 'settings.html#appearance'
            },
            {
                value: '/settings: notifications',
                label: 'Notifications',
                desc: 'Gérer les notifications',
                action: () => window.location.href = 'settings.html#notifications'
            }
        ]
    },
    help: {
        prefix: '/help',
        aliases: ['/aide', '/?', '/h'],
        description: 'Aide et documentation',
        icon: '❓',
        suggestions: [
            {
                value: '/help: commands',
                label: 'Commandes',
                desc: 'Liste des commandes',
                action: () => showHelpModal('commands')
            },
            {
                value: '/help: shortcuts',
                label: 'Raccourcis',
                desc: 'Raccourcis clavier',
                action: () => showHelpModal('shortcuts')
            }
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
export function initUniversalSearchBar() {
    console.log('🔍 Initializing Universal Search Bar...');

    const searchInput = document.getElementById('smartSearchInput');
    if (!searchInput) {
        console.warn('⚠️ Search input not found');
        return;
    }

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

    console.log('✅ Universal Search Bar initialized');
}

/**
 * Handle search input
 */
function handleSearchInput(e) {
    const query = e.target.value;
    console.log('⌨️ Search input:', query);

    // Clear previous timeout
    if (searchState.searchTimeout) {
        clearTimeout(searchState.searchTimeout);
    }

    // Empty query - show default suggestions
    if (!query || query.trim().length === 0) {
        console.log('Empty query - showing default');
        showDefaultSuggestions();
        return;
    }

    // Just "/" - show all commands
    if (query === '/') {
        console.log('Just "/" - showing all commands');
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
                executeSuggestion(suggestion);
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
    console.log('🎯 Search focus triggered');
    const searchInput = document.getElementById('smartSearchInput');
    const query = searchInput?.value || '';
    console.log('Query:', query);

    if (!query || query.trim().length === 0) {
        console.log('Showing default suggestions...');
        showDefaultSuggestions();
    } else if (query.length >= 1) {
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
 * Show default suggestions (history or commands)
 */
function showDefaultSuggestions() {
    const history = searchState.history.getRecentSearches(5);

    if (history.length > 0) {
        showSearchHistory(history);
    } else {
        showAllCommands();
    }
}

/**
 * Show all available commands
 */
function showAllCommands() {
    console.log('📋 Showing all commands...');
    let container = getSuggestionsContainer();
    console.log('Container:', container);
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
    searchState.searchResults = commands.map(([type, command]) => ({
        value: command.prefix + (command.prefix.endsWith(':') ? ' ' : ''),
        label: command.prefix,
        desc: command.description,
        action: command.action
    }));
    searchState.selectedIndex = -1;

    positionDropdown(container);

    // Force reflow before adding show class
    container.offsetHeight;

    requestAnimationFrame(() => {
        // Force visibility with inline styles AND class
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
        container.style.pointerEvents = 'auto';
        container.style.display = 'block';
        container.classList.add('show');
        searchState.isOpen = true;
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
        action: command.action
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
        container.classList.add('show');
        searchState.isOpen = true;
    });
    updateSelectedSuggestion();
}

/**
 * Show command suggestions
 */
function showCommandSuggestions(commandType, query) {
    const command = SEARCH_COMMANDS[commandType];
    if (!command || !command.suggestions || command.suggestions.length === 0) {
        // Execute command directly if no suggestions
        if (command.action) {
            command.action();
        }
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
    searchState.selectedIndex = -1;

    positionDropdown(container);

    // Force reflow before adding show class
    container.offsetHeight;

    requestAnimationFrame(() => {
        // Force visibility with inline styles AND class
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
        container.style.pointerEvents = 'auto';
        container.style.display = 'block';
        container.classList.add('show');
        searchState.isOpen = true;
    });
}

/**
 * Show search history
 */
function showSearchHistory(history) {
    let container = getSuggestionsContainer();
    container.innerHTML = '';

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
        historyItem.className = 'search-suggestion-item search-history-item';

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

        historyItem.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('search-remove-history')) {
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

    positionDropdown(container);

    // Force reflow before adding show class
    container.offsetHeight;

    requestAnimationFrame(() => {
        // Force visibility with inline styles AND class
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
        container.style.pointerEvents = 'auto';
        container.style.display = 'block';
        container.classList.add('show');
        searchState.isOpen = true;
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
        const searchInput = document.getElementById('smartSearchInput');
        if (searchInput) {
            searchInput.value = command.prefix + (command.prefix.endsWith(':') ? ' ' : '');
            searchInput.focus();
            handleSearchInput({ target: searchInput });
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

    item.addEventListener('mousedown', (e) => {
        e.preventDefault();
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
function executeSuggestion(suggestion) {
    // Add to history
    searchState.history.addToHistory(suggestion.value, 'command');

    // Execute action
    if (suggestion.action && typeof suggestion.action === 'function') {
        suggestion.action();
    }

    // Close suggestions
    closeSearchSuggestions();

    // Clear input
    const searchInput = document.getElementById('smartSearchInput');
    if (searchInput) {
        searchInput.value = '';
        searchInput.blur();
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
 * Get or create suggestions container
 */
function getSuggestionsContainer() {
    let container = document.getElementById('searchSuggestionsContainer');

    if (!container) {
        container = document.createElement('div');
        container.id = 'searchSuggestionsContainer';
        container.className = 'search-suggestions-container';

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
    console.log('📍 Positioning dropdown at:', { top: rect.bottom + 8, left: rect.left, width: rect.width });

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
