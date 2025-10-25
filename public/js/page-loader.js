// ================================================
// PAGE LOADER - Barre de progression en haut de page
// ================================================

/**
 * Affiche une barre de progression en haut de la page
 * Usage:
 *   import { showPageLoader, hidePageLoader } from './page-loader.js';
 *   showPageLoader();
 *   // ... opérations async ...
 *   hidePageLoader();
 */

let loaderBar = null;
let loaderProgress = 0;
let loaderInterval = null;

/**
 * Initialiser la barre de loader (appelé automatiquement)
 */
const initPageLoader = () => {
    if (loaderBar) return; // Déjà initialisé

    loaderBar = document.createElement('div');
    loaderBar.id = 'page-loader-bar';
    loaderBar.className = 'page-loader-bar';
    loaderBar.innerHTML = '<div class="page-loader-progress"></div>';

    // Insérer au tout début du body
    document.body.insertBefore(loaderBar, document.body.firstChild);
};

/**
 * Afficher la barre de loader avec animation progressive
 */
export const showPageLoader = () => {
    initPageLoader();

    loaderProgress = 0;
    loaderBar.classList.add('active');

    const progressBar = loaderBar.querySelector('.page-loader-progress');
    progressBar.style.width = '0%';

    // Animation progressive (0 → 90% en 2 secondes)
    loaderInterval = setInterval(() => {
        if (loaderProgress < 90) {
            loaderProgress += Math.random() * 10; // Progression aléatoire
            if (loaderProgress > 90) loaderProgress = 90;
            progressBar.style.width = `${loaderProgress}%`;
        }
    }, 200);
};

/**
 * Masquer la barre de loader (compléter à 100% puis disparaître)
 * @param {boolean} error - Si true, affiche en rouge (erreur)
 */
export const hidePageLoader = (error = false) => {
    if (!loaderBar) return;

    clearInterval(loaderInterval);

    const progressBar = loaderBar.querySelector('.page-loader-progress');

    // Si erreur, passer en rouge
    if (error) {
        loaderBar.classList.add('error');
    }

    // Compléter à 100%
    loaderProgress = 100;
    progressBar.style.width = '100%';

    // Disparaître après 300ms (ou 1s si erreur pour laisser voir le rouge)
    const delay = error ? 1000 : 300;
    setTimeout(() => {
        loaderBar.classList.remove('active');
        loaderBar.classList.remove('error');
        loaderProgress = 0;
    }, delay);
};

/**
 * Wrapper pour naviguer vers une autre page avec loader
 * @param {string} url - URL de destination
 */
export const navigateWithLoader = (url) => {
    showPageLoader();

    // Petit délai pour que l'animation démarre avant la navigation
    setTimeout(() => {
        window.location.href = url;
    }, 100);
};

/**
 * Transition avec effet de flou vers une autre page (pour login/signup)
 * @param {string} url - URL de destination
 */
export const navigateWithBlur = (url) => {
    showPageLoader();

    // Appliquer l'effet de flou progressif sur le body
    const body = document.body;
    body.style.transition = 'filter 0.4s ease-out, opacity 0.4s ease-out';
    body.style.filter = 'blur(10px)';
    body.style.opacity = '0.6';

    // Naviguer après l'animation de flou
    setTimeout(() => {
        window.location.href = url;
    }, 400);
};

// Auto-init au chargement du module
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPageLoader);
    } else {
        initPageLoader();
    }
}
