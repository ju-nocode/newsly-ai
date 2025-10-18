// ================================================
// THEME SERVICE - Centralized Theme Management
// ================================================

// Custom event for theme changes
const THEME_CHANGE_EVENT = 'themeChanged';

/**
 * Initialize theme from localStorage and apply it
 */
export function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggles(savedTheme);
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

    // Dispatch custom event for cross-page synchronization
    window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: { theme } }));

    console.log(`🎨 Theme changed to: ${theme}`);

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
    const isDark = theme === 'dark';

    // Update checkbox toggles (without triggering change event)
    const themeToggles = document.querySelectorAll('#themeToggle, [data-theme-toggle]');
    themeToggles.forEach(toggle => {
        if (toggle.checked !== isDark) {
            toggle.checked = isDark;
        }
    });

    // Update theme text labels
    const themeTexts = document.querySelectorAll('#themeText, [data-theme-text]');
    themeTexts.forEach(text => {
        text.textContent = isDark ? 'Mode sombre' : 'Mode clair';
    });

    // Update theme icon images (moon/sun)
    const themeIcons = document.querySelectorAll('[data-theme-icon]');
    themeIcons.forEach(icon => {
        if (isDark) {
            // Dark mode → show moon (representing current state)
            icon.src = 'https://img.icons8.com/ios/20/moon-symbol.png';
            icon.alt = 'Dark mode';
        } else {
            // Light mode → show sun (representing current state)
            icon.src = 'https://img.icons8.com/ios/20/sun--v1.png';
            icon.alt = 'Light mode';
        }
    });

    // Update theme emoji buttons (☀️/🌙)
    const themeEmojiButtons = document.querySelectorAll('[data-theme-emoji]');
    themeEmojiButtons.forEach(button => {
        button.textContent = isDark ? '🌙' : '☀️';
        button.setAttribute('aria-label', isDark ? 'Dark mode active' : 'Light mode active');
    });

    // Update theme toggle buttons (with icons8 images)
    const themeToggleButtons = document.querySelectorAll('#themeToggleBtn, .theme-toggle, [data-theme-toggle-btn]');
    themeToggleButtons.forEach(button => {
        // Check if button already has an img, otherwise create one
        let img = button.querySelector('img');
        if (!img) {
            img = document.createElement('img');
            img.style.width = '1.25rem';
            img.style.height = '1.25rem';
            img.style.display = 'block';
            button.innerHTML = '';
            button.appendChild(img);
        }

        if (isDark) {
            // Dark mode → show moon
            img.src = 'https://img.icons8.com/ios/20/moon-symbol.png';
            img.alt = 'Dark mode';
        } else {
            // Light mode → show sun
            img.src = 'https://img.icons8.com/ios/20/sun--v1.png';
            img.alt = 'Light mode';
        }

        button.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    });

    // Update theme select dropdowns (except manual ones)
    const themeSelects = document.querySelectorAll('#themeSelect:not([data-manual-theme]), [data-theme-select]:not([data-manual-theme])');
    themeSelects.forEach(select => {
        if (select.value !== theme) {
            select.value = theme;
        }
    });

    // Update manual theme selects (without triggering change event)
    const manualSelects = document.querySelectorAll('[data-manual-theme]');
    manualSelects.forEach(select => {
        if (select.value !== theme) {
            select.value = theme;
        }
    });
}

/**
 * Setup theme toggle listeners with proper event handling
 */
export function setupThemeListeners() {
    // Remove any existing listeners first (prevent duplicates)
    const themeToggles = document.querySelectorAll('#themeToggle, [data-theme-toggle]');

    themeToggles.forEach(toggle => {
        // Clone node to remove all event listeners
        const newToggle = toggle.cloneNode(true);
        toggle.parentNode.replaceChild(newToggle, toggle);

        // Add fresh listener
        newToggle.addEventListener('change', function(e) {
            e.stopPropagation();
            const newTheme = this.checked ? 'dark' : 'light';
            console.log(`🔄 Toggle clicked: ${newTheme}`);
            setTheme(newTheme);
        });
    });

    // Setup select dropdowns (except manual ones that need Save button)
    const themeSelects = document.querySelectorAll('#themeSelect:not([data-manual-theme]), [data-theme-select]:not([data-manual-theme])');
    themeSelects.forEach(select => {
        const newSelect = select.cloneNode(true);
        select.parentNode.replaceChild(newSelect, select);

        newSelect.addEventListener('change', function(e) {
            e.stopPropagation();
            console.log(`🔄 Select changed: ${this.value}`);
            setTheme(this.value);
        });
    });

    // Setup theme toggle buttons (navbar buttons with icons)
    const themeToggleButtons = document.querySelectorAll('#themeToggleBtn, .theme-toggle, [data-theme-toggle-btn]');
    themeToggleButtons.forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        newButton.addEventListener('click', function(e) {
            e.stopPropagation();
            const currentTheme = getTheme();
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            console.log(`🔄 Theme button clicked: ${currentTheme} → ${newTheme}`);
            setTheme(newTheme);
        });
    });

    // Listen for storage events (cross-tab synchronization)
    window.addEventListener('storage', (e) => {
        if (e.key === 'theme' && e.newValue) {
            const newTheme = e.newValue;
            document.documentElement.setAttribute('data-theme', newTheme);
            updateThemeToggles(newTheme);
            console.log(`🔄 Theme synced from another tab: ${newTheme}`);
        }
    });

    // Listen for custom theme change events
    window.addEventListener(THEME_CHANGE_EVENT, (e) => {
        const theme = e.detail.theme;
        updateThemeToggles(theme);
    });

    const manualSelects = document.querySelectorAll('[data-manual-theme]');
    console.log(`✅ Theme service initialized (${themeToggles.length} toggles, ${themeSelects.length} auto-selects, ${manualSelects.length} manual-selects, ${themeToggleButtons.length} buttons)`);
}

// Auto-initialize theme on module load
initTheme();
