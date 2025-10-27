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
                    <img src="${safeImage}" alt="${safeTitle}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x200?text=No+Image'">
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
    // Supprimer toutes les notifications existantes de type erreur pour éviter l'empilement
    const existingNotifications = document.querySelectorAll('.notification-error');
    existingNotifications.forEach(notif => {
        notif.classList.remove('notification-show');
        notif.classList.add('notification-hide');
        setTimeout(() => notif.remove(), 300);
    });

    // Créer le container s'il n'existe pas
    let container = document.getElementById('notification-container-bottom-right');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container-bottom-right';
        container.className = 'notification-container notification-bottom-right';
        document.body.appendChild(container);
    }

    // Créer la notification
    const notification = document.createElement('div');
    notification.className = 'notification notification-error';
    notification.innerHTML = `
        <div class="notification-icon">✕</div>
        <div class="notification-content">
            <div class="notification-message">${escapeHtml(message)}</div>
        </div>
        <div class="notification-progress">
            <div class="notification-progress-bar"></div>
        </div>
    `;

    container.appendChild(notification);

    // Animation d'entrée
    requestAnimationFrame(() => {
        notification.classList.add('notification-show');
        const progressBar = notification.querySelector('.notification-progress-bar');
        if (progressBar) {
            progressBar.style.transition = `width ${duration}ms linear`;
            requestAnimationFrame(() => {
                progressBar.style.width = '0%';
            });
        }
    });

    // Auto-dismiss
    setTimeout(() => {
        notification.classList.remove('notification-show');
        notification.classList.add('notification-hide');
        setTimeout(() => {
            notification.remove();
            if (container && container.children.length === 0) {
                container.remove();
            }
        }, 300);
    }, duration);
};

// Afficher un message de succès
export const showSuccess = (message, duration = 3000) => {
    // Supprimer toutes les notifications existantes de type succès pour éviter l'empilement
    const existingNotifications = document.querySelectorAll('.notification-success');
    existingNotifications.forEach(notif => {
        notif.classList.remove('notification-show');
        notif.classList.add('notification-hide');
        setTimeout(() => notif.remove(), 300);
    });

    // Créer le container s'il n'existe pas
    let container = document.getElementById('notification-container-bottom-right');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container-bottom-right';
        container.className = 'notification-container notification-bottom-right';
        document.body.appendChild(container);
    }

    // Créer la notification
    const notification = document.createElement('div');
    notification.className = 'notification notification-success';
    notification.innerHTML = `
        <div class="notification-icon">✓</div>
        <div class="notification-content">
            <div class="notification-message">${escapeHtml(message)}</div>
        </div>
        <div class="notification-progress">
            <div class="notification-progress-bar"></div>
        </div>
    `;

    container.appendChild(notification);

    // Animation d'entrée
    requestAnimationFrame(() => {
        notification.classList.add('notification-show');
        const progressBar = notification.querySelector('.notification-progress-bar');
        if (progressBar) {
            progressBar.style.transition = `width ${duration}ms linear`;
            requestAnimationFrame(() => {
                progressBar.style.width = '0%';
            });
        }
    });

    // Auto-dismiss
    setTimeout(() => {
        notification.classList.remove('notification-show');
        notification.classList.add('notification-hide');
        setTimeout(() => {
            notification.remove();
            if (container && container.children.length === 0) {
                container.remove();
            }
        }, 300);
    }, duration);
};
