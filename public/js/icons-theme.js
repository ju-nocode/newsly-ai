/**
 * Icons Theme Manager
 * Automatically updates Icons8 icons based on the current theme (dark/light)
 */

// Get icon color based on theme
const getIconColorForTheme = (theme) => {
    return theme === 'dark' ? 'FFFFFF' : '000000';
};

// Update all Icons8 icons on the page
const updateIcons8Theme = () => {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    const iconColor = getIconColorForTheme(theme);

    // Find all images from icons8.com
    const icons8Images = document.querySelectorAll('img[src*="icons8.com"]');

    icons8Images.forEach(img => {
        const currentSrc = img.src;

        // Replace the color code in the URL (000000 or FFFFFF)
        // Pattern: /50/XXXXXX/ or /100/XXXXXX/
        const newSrc = currentSrc.replace(
            /(\/\d+\/)([0-9A-Fa-f]{6})(\/)/,
            `$1${iconColor}$3`
        );

        // Only update if the URL changed
        if (newSrc !== currentSrc) {
            img.src = newSrc;
        }
    });

    console.log(`✅ Icons8 updated for ${theme} mode (color: ${iconColor})`);
};

// Initialize: Update icons on page load
document.addEventListener('DOMContentLoaded', () => {
    updateIcons8Theme();
});

// Watch for theme changes using MutationObserver
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
            updateIcons8Theme();
        }
    });
});

// Start observing the document element for theme changes
observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
});

// Export for manual usage
window.updateIcons8Theme = updateIcons8Theme;

console.log('🎨 Icons8 Theme Manager initialized');
