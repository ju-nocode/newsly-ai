// ================================================
// THEME MANAGER - Centralized Dark/Light Mode Management
// ================================================

const THEME_STORAGE_KEY = 'theme';
const THEME_EVENT_NAME = 'newsly-theme-change';

/**
 * Get current theme from localStorage or default to 'dark'
 */
export function getTheme() {
    return localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
}

/**
 * Set theme and update all UI elements
 * @param {string} theme - 'light' or 'dark'
 */
export async function setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') {
        console.warn(`Invalid theme: ${theme}. Using 'dark' as default.`);
        theme = 'dark';
    }

    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    // Update all UI controls
    updateAllThemeControls(theme);

    // Dispatch event for cross-component communication
    window.dispatchEvent(new CustomEvent(THEME_EVENT_NAME, { detail: { theme } }));

    // Save to database
    await saveThemeToDatabase(theme);

    console.log(`🎨 Theme changed to: ${theme}`);
    return theme;
}

/**
 * Save theme to database via API
 * @param {string} theme - Theme to save
 */
async function saveThemeToDatabase(theme) {
    try {
        const session = JSON.parse(localStorage.getItem('session'));
        if (!session?.access_token) {
            console.log('⚠️ No session found, theme not saved to database');
            return;
        }

        const response = await fetch('/api/user/settings', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ theme })
        });

        if (!response.ok) {
            console.error('Failed to save theme to database:', await response.text());
            return;
        }

        console.log('✅ Theme saved to database');
    } catch (error) {
        console.error('Error saving theme to database:', error);
    }
}

/**
 * Toggle between light and dark theme
 */
export function toggleTheme() {
    const currentTheme = getTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    return setTheme(newTheme);
}

/**
 * Update all theme-related UI elements
 * @param {string} theme - Current theme
 */
function updateAllThemeControls(theme) {
    const isDark = theme === 'dark';

    // 1. Update all checkboxes/switches (burger menu toggle)
    const checkboxes = document.querySelectorAll('#themeToggle, [data-theme-toggle]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = isDark;
    });

    // 2. Update theme text labels (burger menu text)
    const themeText = document.getElementById('themeText');
    if (themeText) {
        themeText.textContent = isDark ? 'Mode sombre' : 'Mode clair';
    }

    // 3. Update theme icons in burger menu
    const burgerIcons = document.querySelectorAll('[data-theme-icon]');
    burgerIcons.forEach(icon => {
        icon.src = isDark
            ? 'https://img.icons8.com/ios/20/moon-symbol.png'
            : 'https://img.icons8.com/ios/20/sun--v1.png';
        icon.alt = isDark ? 'Dark mode' : 'Light mode';
    });

    // 4. Update navbar theme toggle button
    const navbarBtn = document.getElementById('themeToggleBtn');
    if (navbarBtn) {
        const img = navbarBtn.querySelector('img');
        if (img) {
            const iconColor = isDark ? 'FFFFFF' : '000000';
            img.src = isDark
                ? `https://img.icons8.com/ios-filled/50/${iconColor}/moon-symbol.png`
                : `https://img.icons8.com/ios-filled/50/${iconColor}/sun--v1.png`;
            img.alt = isDark ? 'Dark mode' : 'Light mode';
        }
    }
}

/**
 * Create theme toggle button in navbar
 */
export function createNavbarThemeButton() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) {
        console.warn('⚠️ .nav-links not found, cannot create theme button');
        return;
    }

    // Check if button already exists
    let themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
        console.log('ℹ️ Theme button already exists');
        return;
    }

    // Create button
    themeBtn = document.createElement('button');
    themeBtn.className = 'theme-toggle';
    themeBtn.id = 'themeToggleBtn';
    themeBtn.setAttribute('aria-label', 'Toggle dark/light mode');

    // Create icon
    const currentTheme = getTheme();
    const isDark = currentTheme === 'dark';
    const iconColor = isDark ? 'FFFFFF' : '000000';

    const img = document.createElement('img');
    img.src = isDark
        ? `https://img.icons8.com/ios-filled/50/${iconColor}/moon-symbol.png`
        : `https://img.icons8.com/ios-filled/50/${iconColor}/sun--v1.png`;
    img.alt = isDark ? 'Dark mode' : 'Light mode';
    img.style.width = '1.25rem';
    img.style.height = '1.25rem';
    img.style.display = 'block';

    themeBtn.appendChild(img);
    navLinks.insertBefore(themeBtn, navLinks.firstChild);

    // Add click event
    themeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleTheme();
    });

    console.log('✅ Navbar theme button created');
}

/**
 * Setup all theme event listeners
 */
export function setupThemeListeners() {
    // 1. Burger menu checkbox listeners
    const checkboxes = document.querySelectorAll('#themeToggle, [data-theme-toggle]');
    checkboxes.forEach(checkbox => {
        // Remove old listeners
        const newCheckbox = checkbox.cloneNode(true);
        checkbox.parentNode.replaceChild(newCheckbox, checkbox);

        // Add new listener
        newCheckbox.addEventListener('change', (e) => {
            const newTheme = e.target.checked ? 'dark' : 'light';
            setTheme(newTheme);
        });
    });

    // 2. Cross-tab synchronization (storage event)
    window.addEventListener('storage', (e) => {
        if (e.key === THEME_STORAGE_KEY && e.newValue) {
            setTheme(e.newValue);
        }
    });

    console.log(`✅ Theme listeners setup (${checkboxes.length} checkboxes)`);
}

/**
 * Load theme from database
 */
async function loadThemeFromDatabase() {
    try {
        const session = JSON.parse(localStorage.getItem('session'));
        if (!session?.access_token) {
            return null;
        }

        const response = await fetch('/api/user/settings', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${session.access_token}`
            }
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data.theme || null;
    } catch (error) {
        console.error('Error loading theme from database:', error);
        return null;
    }
}

/**
 * Initialize theme on page load
 */
export async function initTheme() {
    // Try to load from database first
    const dbTheme = await loadThemeFromDatabase();
    const savedTheme = dbTheme || getTheme();

    // If database theme differs from localStorage, update localStorage
    if (dbTheme && dbTheme !== getTheme()) {
        localStorage.setItem(THEME_STORAGE_KEY, dbTheme);
    }

    document.documentElement.setAttribute('data-theme', savedTheme);
    updateAllThemeControls(savedTheme);
    console.log(`✅ Theme initialized: ${savedTheme}`);
    return savedTheme;
}

/**
 * Complete theme system initialization
 * Call this after DOM is ready and navbar is loaded
 */
export async function initThemeSystem() {
    await initTheme();
    createNavbarThemeButton();
    setupThemeListeners();
    console.log('✅ Theme system fully initialized');
}

// Auto-initialize theme on module load (before DOM ready)
// Use async IIFE to handle the Promise
(async () => {
    // Quick init with localStorage first (no waiting for API)
    const localTheme = getTheme();
    document.documentElement.setAttribute('data-theme', localTheme);

    // Then load from database in background
    await initTheme();
})();
