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
    const langText = document.getElementById('navLangText');

    if (!langSwitcher || !langText) {
        console.warn('Language switcher elements not found');
        return;
    }

    // Set initial language
    const currentLang = localStorage.getItem('language') || 'fr';
    updateLanguageDisplay(currentLang, langText);

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
            updateLanguageDisplay(newLang, langText);
        } catch (error) {
            console.error('Error changing language:', error);
        } finally {
            langSwitcher.disabled = false;
            langSwitcher.style.opacity = '1';
        }
    });

    console.log('✅ Language switcher initialized');
}

/**
 * Update language display text
 */
function updateLanguageDisplay(lang, element) {
    element.textContent = lang.toUpperCase();
}
