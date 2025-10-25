// ================================================
// SHIMMER LOADER - Loading skeleton avec effet shimmer
// ================================================

/**
 * Affiche des skeletons avec effet shimmer dans un container
 * @param {string|HTMLElement} container - Sélecteur ou élément DOM
 * @param {number} count - Nombre de cards skeleton à afficher
 * @param {number} timeout - Timeout en ms (0 = pas de timeout)
 * @param {Function} onTimeout - Callback appelé si timeout atteint
 */
export const showShimmerLoader = (container, count = 6, timeout = 0, onTimeout = null) => {
    const containerEl = typeof container === 'string'
        ? document.querySelector(container)
        : container;

    if (!containerEl) {
        console.warn('Shimmer loader: container not found');
        return;
    }

    // Créer le HTML des skeletons
    const skeletonsHTML = Array.from({ length: count }, () => `
        <div class="news-card skeleton-card">
            <div class="skeleton skeleton-image"></div>
            <div class="skeleton-content">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-title" style="width: 80%;"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text" style="width: 90%;"></div>
                <div class="skeleton skeleton-text" style="width: 60%;"></div>
                <div class="skeleton-footer">
                    <div class="skeleton skeleton-source"></div>
                    <div class="skeleton skeleton-date"></div>
                </div>
            </div>
        </div>
    `).join('');

    containerEl.innerHTML = skeletonsHTML;
    containerEl.classList.add('shimmer-loading');

    // Si timeout spécifié, figer le shimmer après X ms
    if (timeout > 0) {
        setTimeout(() => {
            freezeShimmerLoader(container);
            if (onTimeout) onTimeout();
        }, timeout);
    }
};

/**
 * Masque les skeletons et nettoie le container
 * @param {string|HTMLElement} container - Sélecteur ou élément DOM
 */
export const hideShimmerLoader = (container) => {
    const containerEl = typeof container === 'string'
        ? document.querySelector(container)
        : container;

    if (!containerEl) return;

    containerEl.classList.remove('shimmer-loading');
    containerEl.classList.remove('shimmer-frozen');
    // Ne pas vider le container, juste retirer la classe
    // Le contenu sera remplacé par les vraies cards
};

/**
 * Fige l'animation shimmer (garde les cards mais stoppe l'animation)
 * @param {string|HTMLElement} container - Sélecteur ou élément DOM
 */
export const freezeShimmerLoader = (container) => {
    const containerEl = typeof container === 'string'
        ? document.querySelector(container)
        : container;

    if (!containerEl) return;

    // Retirer l'animation mais garder les skeletons visibles
    containerEl.classList.remove('shimmer-loading');
    containerEl.classList.add('shimmer-frozen');
};

/**
 * Affiche un message d'erreur si le loading échoue (remplace complètement le shimmer)
 * @param {string|HTMLElement} container - Sélecteur ou élément DOM
 * @param {string} message - Message d'erreur à afficher
 */
export const showShimmerError = (container, message = 'Impossible de charger les actualités') => {
    const containerEl = typeof container === 'string'
        ? document.querySelector(container)
        : container;

    if (!containerEl) return;

    containerEl.classList.remove('shimmer-loading');
    containerEl.classList.remove('shimmer-frozen');
    containerEl.innerHTML = `
        <div class="shimmer-error">
            <div class="shimmer-error-icon">⚠️</div>
            <h3 class="shimmer-error-title">Erreur de chargement</h3>
            <p class="shimmer-error-message">${message}</p>
            <button class="btn-primary" onclick="location.reload()">
                Réessayer
            </button>
        </div>
    `;
};

/**
 * Affiche un message d'erreur en overlay au-dessus des shimmers figés
 * @param {string|HTMLElement} container - Sélecteur ou élément DOM
 * @param {string} message - Message d'erreur à afficher
 */
export const showShimmerTimeoutError = (container, message = 'Délai d\'attente dépassé') => {
    const containerEl = typeof container === 'string'
        ? document.querySelector(container)
        : container;

    if (!containerEl) return;

    // Créer un overlay au-dessus des shimmers figés
    const overlay = document.createElement('div');
    overlay.className = 'shimmer-timeout-overlay';
    overlay.innerHTML = `
        <div class="shimmer-timeout-message">
            <span class="shimmer-timeout-icon">⏱️</span>
            <p>${message}</p>
        </div>
    `;

    containerEl.style.position = 'relative';
    containerEl.appendChild(overlay);
};

/**
 * Utilitaire : remplace le shimmer par du contenu réel avec animation
 * @param {string|HTMLElement} container - Sélecteur ou élément DOM
 * @param {string} html - HTML à injecter
 */
export const replaceShimmerWithContent = (container, html) => {
    const containerEl = typeof container === 'string'
        ? document.querySelector(container)
        : container;

    if (!containerEl) return;

    // Retirer la classe shimmer
    containerEl.classList.remove('shimmer-loading');

    // Injecter le contenu avec fade-in
    containerEl.style.opacity = '0';
    containerEl.innerHTML = html;

    // Animer l'apparition
    requestAnimationFrame(() => {
        containerEl.style.transition = 'opacity 0.3s ease';
        containerEl.style.opacity = '1';
    });
};
