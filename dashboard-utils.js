// ================================================
// UTILITIES POUR LE DASHBOARD
// ================================================

// Rate limiter simple côté client
export const rateLimiter = {
    requests: {},

    isAllowed(key, maxRequests, timeWindow) {
        const now = Date.now();

        if (!this.requests[key]) {
            this.requests[key] = [];
        }

        // Nettoyer les anciennes requêtes
        this.requests[key] = this.requests[key].filter(
            timestamp => now - timestamp < timeWindow
        );

        if (this.requests[key].length >= maxRequests) {
            return false;
        }

        this.requests[key].push(now);
        return true;
    }
};

// Échapper les caractères HTML pour prévenir XSS
export const escapeHtml = (text) => {
    if (typeof text !== 'string') return '';

    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

// Valider les entrées utilisateur
export const validateInput = (value, type) => {
    if (!value || typeof value !== 'string') return false;

    switch (type) {
        case 'category':
            return /^[a-z0-9_-]+$/i.test(value) && value.length <= 50;
        case 'search':
            return value.length >= 2 && value.length <= 100;
        case 'url':
            try {
                new URL(value);
                return true;
            } catch {
                return false;
            }
        default:
            return value.length > 0 && value.length <= 500;
    }
};

// Afficher les actualités dans le DOM
export const displayNews = (articles, containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!articles || articles.length === 0) {
        container.innerHTML = `
            <div class="news-empty">
                <p>Aucune actualité disponible pour le moment.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = articles.map(article => {
        const safeTitle = escapeHtml(article.title || 'Sans titre');
        const safeDescription = escapeHtml(article.description || '');
        const safeUrl = article.url && validateInput(article.url, 'url') ? article.url : '#';
        const safeImage = article.urlToImage || 'https://via.placeholder.com/400x200?text=No+Image';
        const safeSource = escapeHtml(article.source?.name || 'Source inconnue');
        const safeDate = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('fr-FR') : '';

        return `
            <article class="news-card">
                <div class="news-image">
                    <img src="${safeImage}" alt="${safeTitle}" onerror="this.src='https://via.placeholder.com/400x200?text=No+Image'">
                </div>
                <div class="news-content">
                    <h3 class="news-title">
                        <a href="${safeUrl}" target="_blank" rel="noopener noreferrer">
                            ${safeTitle}
                        </a>
                    </h3>
                    <p class="news-description">${safeDescription}</p>
                    <div class="news-meta">
                        <span class="news-source">${safeSource}</span>
                        ${safeDate ? `<span class="news-date">${safeDate}</span>` : ''}
                    </div>
                </div>
            </article>
        `;
    }).join('');
};

// Afficher un message d'erreur
export const showError = (message, duration = 5000) => {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'toast toast-error';
    errorDiv.textContent = escapeHtml(message);
    document.body.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.classList.add('show');
    }, 10);

    setTimeout(() => {
        errorDiv.classList.remove('show');
        setTimeout(() => errorDiv.remove(), 300);
    }, duration);
};

// Afficher un message de succès
export const showSuccess = (message, duration = 3000) => {
    const successDiv = document.createElement('div');
    successDiv.className = 'toast toast-success';
    successDiv.textContent = escapeHtml(message);
    document.body.appendChild(successDiv);

    setTimeout(() => {
        successDiv.classList.add('show');
    }, 10);

    setTimeout(() => {
        successDiv.classList.remove('show');
        setTimeout(() => successDiv.remove(), 300);
    }, duration);
};
