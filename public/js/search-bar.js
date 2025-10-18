// ================================================
// SMART SEARCH BAR - Command-based Search System
// ================================================

/**
 * Search command types
 */
const SEARCH_COMMANDS = {
    profile: {
        prefix: '/profile:',
        description: 'Rechercher dans votre profil',
        icon: '👤',
        suggestions: [
            { value: '/profile: username', label: 'Nom d\'utilisateur', desc: 'Modifier votre nom' },
            { value: '/profile: email', label: 'Email', desc: 'Voir/modifier email' },
            { value: '/profile: avatar', label: 'Avatar', desc: 'Changer votre avatar' },
            { value: '/profile: password', label: 'Mot de passe', desc: 'Modifier mot de passe' },
            { value: '/profile: preferences', label: 'Préférences', desc: 'Gérer vos préférences' },
            { value: '/profile: settings', label: 'Paramètres', desc: 'Accéder aux paramètres' }
        ]
    },
    feed: {
        prefix: '/feed:',
        description: 'Rechercher dans les actualités',
        icon: '📰',
        suggestions: [
            { value: '/feed: technology', label: 'Technologie', desc: 'Articles tech' },
            { value: '/feed: business', label: 'Business', desc: 'Actualités business' },
            { value: '/feed: sports', label: 'Sports', desc: 'Actualités sportives' },
            { value: '/feed: science', label: 'Science', desc: 'Actualités scientifiques' },
            { value: '/feed: entertainment', label: 'Divertissement', desc: 'Actualités entertainment' },
            { value: '/feed: health', label: 'Santé', desc: 'Actualités santé' }
        ]
    }
};

/**
 * Search bar state
 */
let searchState = {
    isOpen: false,
    currentCommand: null,
    searchResults: [],
    selectedIndex: -1,
    searchTimeout: null
};

/**
 * Initialize search bar
 * @param {Object} options - Configuration options
 */
export function initSearchBar(options = {}) {
    const {
        onProfileSearch = null,
        onFeedSearch = null,
        onNewsSearch = null
    } = options;

    // Store callbacks
    searchState.callbacks = {
        onProfileSearch,
        onFeedSearch,
        onNewsSearch
    };

    // Setup event listeners
    setupSearchListeners();

    console.log('✅ Search bar initialized');
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
 * Handle search input
 */
function handleSearchInput(e) {
    const query = e.target.value;

    // Clear previous timeout
    if (searchState.searchTimeout) {
        clearTimeout(searchState.searchTimeout);
    }

    // Detect command type
    const commandType = detectCommandType(query);
    searchState.currentCommand = commandType;

    if (commandType) {
        // Show command suggestions
        showCommandSuggestions(commandType, query);
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
 * Detect command type from query
 */
function detectCommandType(query) {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.startsWith('/profile') || lowerQuery.startsWith('/profil')) {
        return 'profile';
    } else if (lowerQuery.startsWith('/feed')) {
        return 'feed';
    }

    return null;
}

/**
 * Show command suggestions
 */
function showCommandSuggestions(commandType, query) {
    const command = SEARCH_COMMANDS[commandType];
    if (!command) return;

    // Extract search term after prefix
    const searchTerm = query.slice(command.prefix.length).trim().toLowerCase();

    // Filter suggestions
    let suggestions = command.suggestions;
    if (searchTerm) {
        suggestions = suggestions.filter(s =>
            s.label.toLowerCase().includes(searchTerm) ||
            s.desc.toLowerCase().includes(searchTerm)
        );
    }

    // Reset selection
    searchState.selectedIndex = -1;

    // Display suggestions
    displaySuggestions(suggestions, commandType);
}

/**
 * Display suggestions dropdown
 */
function displaySuggestions(suggestions, commandType) {
    // Get or create suggestions container
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

    // Clear previous suggestions
    container.innerHTML = '';

    if (suggestions.length === 0) {
        container.innerHTML = `
            <div class="search-suggestion-empty">
                <p>Aucun résultat trouvé</p>
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

        item.innerHTML = `
            <div class="search-suggestion-content">
                <div class="search-suggestion-label">${escapeHtml(suggestion.label)}</div>
                <div class="search-suggestion-desc">${escapeHtml(suggestion.desc)}</div>
            </div>
            <div class="search-suggestion-shortcut">↵</div>
        `;

        // Click handler
        item.addEventListener('mousedown', (e) => {
            e.preventDefault(); // Prevent blur
            selectSuggestion(suggestion, commandType);
        });

        // Hover handler
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
 * Perform regular search (news articles)
 */
function performRegularSearch(query) {
    // This will search in news articles in real-time
    const callback = searchState.callbacks?.onNewsSearch;

    if (callback && typeof callback === 'function') {
        callback(query);
    }

    // Show searching indicator
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
                // Execute regular search
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
    const items = document.querySelectorAll('.search-suggestion-item');
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

    if (commandType === 'profile') {
        // Handle profile command
        const callback = searchState.callbacks?.onProfileSearch;
        if (callback && typeof callback === 'function') {
            callback(suggestion);
        }
    } else if (commandType === 'feed') {
        // Handle feed command
        const callback = searchState.callbacks?.onFeedSearch;
        if (callback && typeof callback === 'function') {
            callback(suggestion);
        }
    }

    // Clear search
    if (searchInput) {
        searchInput.value = '';
    }
    closeSearchSuggestions();
}

/**
 * Execute regular search
 */
function executeSearch(query) {
    const callback = searchState.callbacks?.onNewsSearch;
    if (callback && typeof callback === 'function') {
        callback(query, true); // true = execute search
    }
    closeSearchSuggestions();
}

/**
 * Handle search focus
 */
function handleSearchFocus() {
    const searchInput = document.getElementById('smartSearchInput');
    const query = searchInput?.value || '';

    if (query.length >= 2 || detectCommandType(query)) {
        // Re-show suggestions if there's a query
        handleSearchInput({ target: searchInput });
    }
}

/**
 * Handle search blur (with delay for click handling)
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
 * Update search results (for news search)
 * @param {Array} articles - Search results
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

    // Show max 5 results
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
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Example usage:
 *
 * import { initSearchBar, updateSearchResults } from './search-bar.js';
 *
 * // Initialize
 * initSearchBar({
 *     onProfileSearch: (suggestion) => {
 *         console.log('Profile search:', suggestion);
 *         // Navigate to settings or show profile modal
 *     },
 *     onFeedSearch: (suggestion) => {
 *         console.log('Feed search:', suggestion);
 *         // Load news for this category
 *     },
 *     onNewsSearch: (query, execute = false) => {
 *         if (execute) {
 *             // Perform actual search
 *         } else {
 *             // Search in real-time and show results
 *             const results = searchArticles(query);
 *             updateSearchResults(results);
 *         }
 *     }
 * });
 */

console.log('✅ Search bar module loaded');
