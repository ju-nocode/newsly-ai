// ================================================
// LANGUAGE SWITCHER - Navbar Component
// Gère le changement de langue via le bouton navbar
// ================================================

import { changeLanguage } from './translation-service.js';

/**
 * Initialize language switcher button in navbar
 */
export function initLanguageSwitcher() {
    const langSwitcher = document.getElementById('langSwitcher');

    if (!langSwitcher) {
        console.warn('Language switcher button not found');
        return;
    }

    // Handle click
    langSwitcher.addEventListener('click', async () => {
        const currentLang = localStorage.getItem('language') || 'fr';
        const newLang = currentLang === 'fr' ? 'en' : 'fr';

        // Update UI immediately
        langSwitcher.disabled = true;
        langSwitcher.style.opacity = '0.6';

        try {
            // Change language (includes translation)
            await changeLanguage(newLang);
            console.log(`✅ Language changed to: ${newLang}`);
        } catch (error) {
            console.error('Error changing language:', error);
        } finally {
            langSwitcher.disabled = false;
            langSwitcher.style.opacity = '1';
        }
    });

    console.log('✅ Language switcher initialized');
}
