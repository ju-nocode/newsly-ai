// ================================================
// THEME SERVICE - Centralized Theme Management
// ================================================

/**
 * Initialize theme from localStorage and apply it
 */
export function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    return savedTheme;
}

/**
 * Toggle theme between light and dark
 * @param {string} theme - 'light' or 'dark'
 */
export function setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') {
        console.warn(`Invalid theme: ${theme}. Using 'light' as default.`);
        theme = 'light';
    }

    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Update all theme toggles on the page
    updateThemeToggles(theme);

    return theme;
}

/**
 * Get current theme
 */
export function getTheme() {
    return localStorage.getItem('theme') || 'light';
}

/**
 * Update all theme toggle elements on the page
 * @param {string} theme - Current theme
 */
function updateThemeToggles(theme) {
    // Update checkbox toggles
    const themeToggles = document.querySelectorAll('#themeToggle');
    themeToggles.forEach(toggle => {
        toggle.checked = theme === 'dark';
    });

    // Update theme text labels
    const themeTexts = document.querySelectorAll('#themeText');
    themeTexts.forEach(text => {
        text.textContent = theme === 'dark' ? 'Mode sombre' : 'Mode clair';
    });

    // Update theme select dropdowns
    const themeSelects = document.querySelectorAll('#themeSelect');
    themeSelects.forEach(select => {
        select.value = theme;
    });
}

/**
 * Setup theme toggle listeners
 */
export function setupThemeListeners() {
    // Setup checkbox toggles
    const themeToggles = document.querySelectorAll('#themeToggle');
    themeToggles.forEach(toggle => {
        toggle.addEventListener('change', () => {
            const newTheme = toggle.checked ? 'dark' : 'light';
            setTheme(newTheme);
        });
    });

    // Setup select dropdowns
    const themeSelects = document.querySelectorAll('#themeSelect');
    themeSelects.forEach(select => {
        select.addEventListener('change', () => {
            setTheme(select.value);
        });
    });

    console.log('✅ Theme service initialized');
}

// Auto-initialize theme on module load
initTheme();
