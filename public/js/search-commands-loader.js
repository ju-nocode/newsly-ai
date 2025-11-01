// ================================================
// SEARCH COMMANDS DATABASE LOADER
// ================================================
// Service to load search commands from Supabase database

/**
 * Load search commands from database
 */
export async function loadSearchCommandsFromDB() {
    try {
        if (!window.supabase) {
            console.log('ℹ️ Using local search commands (no client-side Supabase)');
            return null;
        }

        // Load all active commands with their suggestions
        const { data: commands, error: commandsError } = await window.supabase
            .from('search_commands')
            .select(`
                *,
                suggestions:search_command_suggestions(*)
            `)
            .eq('is_active', true)
            .order('display_order', { ascending: true });

        if (commandsError) {
            console.error('Error loading search commands from DB:', commandsError);
            return null;
        }

        if (!commands || commands.length === 0) {
            console.warn('No search commands found in database');
            return null;
        }

        // Transform database format to app format
        const transformedCommands = {};

        for (const cmd of commands) {
            // Generate a key from the prefix (remove special chars)
            const key = cmd.prefix.replace(/[^a-zA-Z]/g, '').toLowerCase();

            transformedCommands[key] = {
                prefix: cmd.prefix,
                aliases: cmd.aliases || [],
                description: cmd.description,
                icon: cmd.icon || '',
                action: createActionFromDB(cmd.action_type, cmd.action_value),
                suggestions: cmd.suggestions
                    ? cmd.suggestions
                        .filter(s => s.is_active)
                        .sort((a, b) => a.display_order - b.display_order)
                        .map(s => ({
                            value: s.value,
                            label: s.label,
                            desc: s.description,
                            action: createActionFromDB(s.action_type, s.action_value)
                        }))
                    : []
            };
        }

        console.log('✅ Loaded', Object.keys(transformedCommands).length, 'search commands from database');
        return transformedCommands;
    } catch (error) {
        console.error('Error in loadSearchCommandsFromDB:', error);
        return null;
    }
}

/**
 * Create action function from database values
 */
function createActionFromDB(actionType, actionValue) {
    switch (actionType) {
        case 'navigate':
            return () => window.location.href = actionValue;

        case 'function':
            return createFunctionAction(actionValue);

        case 'modal':
            return () => showModal(actionValue);

        default:
            return () => console.warn('Unknown action type:', actionType);
    }
}

/**
 * Create function action based on action value
 */
function createFunctionAction(actionValue) {
    if (actionValue === 'logout') {
        return async () => {
            if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
                if (window.supabase) {
                    await window.supabase.auth.signOut();
                }
                window.location.href = 'index.html';
            }
        };
    }

    if (actionValue.startsWith('setTheme:')) {
        const theme = actionValue.split(':')[1];
        return () => {
            if (theme === 'auto') {
                localStorage.removeItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
            } else {
                document.documentElement.setAttribute('data-theme', theme);
                localStorage.setItem('theme', theme);
            }
        };
    }

    return () => console.warn('Unknown function action:', actionValue);
}

/**
 * Show modal based on action value
 */
function showModal(actionValue) {
    const parts = actionValue.split(':');
    const modalType = parts[0];
    const section = parts[1] || '';

    // Call the showHelpModal function if it exists
    if (typeof window.showHelpModal === 'function') {
        window.showHelpModal(section || modalType);
    } else {
        alert(`Modal: ${modalType}${section ? ' - ' + section : ''}\n\nCette fonctionnalité sera implémentée prochainement.`);
    }
}

/**
 * Merge database commands with local fallback commands
 */
export function mergeCommands(dbCommands, localCommands) {
    // If no DB commands, use local
    if (!dbCommands || Object.keys(dbCommands).length === 0) {
        return localCommands;
    }

    // If no local commands, use DB
    if (!localCommands || Object.keys(localCommands).length === 0) {
        return dbCommands;
    }

    // Merge: DB commands take precedence
    return {
        ...localCommands,
        ...dbCommands
    };
}

/**
 * Cache management for commands
 */
const CACHE_KEY = 'newsly-search-commands-cache';
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

export function getCachedCommands() {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);

        // Check if cache is still valid
        if (Date.now() - timestamp > CACHE_DURATION) {
            localStorage.removeItem(CACHE_KEY);
            return null;
        }

        return data;
    } catch (e) {
        console.error('Error reading cached commands:', e);
        return null;
    }
}

export function setCachedCommands(commands) {
    try {
        const cache = {
            data: commands,
            timestamp: Date.now()
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
        console.error('Error caching commands:', e);
    }
}

/**
 * Main function to initialize search commands
 */
export async function initializeSearchCommands(localCommands) {
    console.log('🔄 Initializing search commands...');

    // NE PAS utiliser le cache car JSON.stringify supprime les fonctions
    // On charge toujours depuis la DB ou on utilise les commandes locales

    // Load from database
    const dbCommands = await loadSearchCommandsFromDB();

    if (dbCommands && Object.keys(dbCommands).length > 0) {
        console.log('✅ Using database commands:', Object.keys(dbCommands).length);
        return dbCommands;
    }

    // Fallback: use local commands
    console.log('✅ Using local commands fallback:', Object.keys(localCommands).length);
    return localCommands;
}
