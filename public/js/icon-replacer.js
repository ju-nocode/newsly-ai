// ================================================
// ICON REPLACER - Replace icons8 img tags with Flowbite SVG
// ================================================

import { icons, getIcon } from './flowbite-icons.js';

/**
 * Icon mapping from icons8 URLs to Flowbite icon names
 */
const iconMapping = {
    // Category icons
    'news.png': 'news',
    'briefcase.png': 'business',
    'laptop.png': 'technology',
    'test-tube.png': 'science',
    'heart-with-pulse.png': 'health',
    'football.png': 'sports',
    'clapperboard.png': 'entertainment',

    // Pin icon
    'pin3.png': 'pin',

    // Navigation icons
    'home.png': 'home',
    'search.png': 'searchLarge',

    // User/auth icons
    'user.png': 'user',
    'user-male-circle.png': 'user',

    // Settings icons
    'settings.png': 'settings',
    'settings-3.png': 'settings',
    'dashboard.png': 'dashboard',
    'exit.png': 'logout',
    'security-checked.png': 'securityChecked',

    // Theme icons
    'sun--v1.png': 'sun',
    'moon-symbol.png': 'moon',

    // Country flags (remplacer par globe monochrome)
    // Les icônes colorées ne correspondent pas au thème monochrome
    'usa.png': 'globe',
    'france.png': 'globe',
    'great-britain.png': 'globe',
    'germany.png': 'globe',
    'canada.png': 'globe',
};

/**
 * Replace all icons8 img tags with Flowbite SVG icons
 */
export function replaceAllIcons() {
    console.log('🎨 Replacing icons8 images with Flowbite SVG icons...');

    const images = document.querySelectorAll('img[src*="icons8.com"]');
    let replacedCount = 0;

    images.forEach(img => {
        const src = img.src;
        const iconName = getIconNameFromUrl(src);

        if (iconName) {
            const iconHTML = getIcon(iconName);

            if (iconHTML) {
                // Create a temporary div to parse the SVG
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = iconHTML;
                const svg = tempDiv.firstChild;

                // Copy classes from img to SVG
                if (img.className) {
                    const existingClasses = svg.getAttribute('class') || '';
                    svg.setAttribute('class', `${existingClasses} ${img.className}`.trim());
                }

                // Copy inline styles if any
                if (img.style.cssText) {
                    svg.style.cssText = img.style.cssText;
                }

                // Replace img with SVG
                img.parentNode.replaceChild(svg, img);
                replacedCount++;
            }
        }
    });

    console.log(`✅ Replaced ${replacedCount} icons with Flowbite SVG`);
}

/**
 * Get Flowbite icon name from icons8 URL
 * @param {string} url - icons8 image URL
 * @returns {string|null} - Flowbite icon name or null
 */
function getIconNameFromUrl(url) {
    // Extract filename from URL
    const filename = url.split('/').pop();

    // Check mapping
    if (iconMapping[filename]) {
        return iconMapping[filename];
    }

    // Try to match pattern in filename
    for (const [pattern, iconName] of Object.entries(iconMapping)) {
        if (filename.includes(pattern.replace('.png', ''))) {
            return iconName;
        }
    }

    console.warn(`⚠️ No mapping found for icon: ${filename}`);
    return null;
}

/**
 * Initialize icon replacement on DOM ready
 */
export function initIconReplacement() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', replaceAllIcons);
    } else {
        replaceAllIcons();
    }
}
