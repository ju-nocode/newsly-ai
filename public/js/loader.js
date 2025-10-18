// ================================================
// LOADER SYSTEM - Loading States & Skeletons
// ================================================

/**
 * Global loader overlay
 */
let globalLoaderInstance = null;

/**
 * Show global loader with optional message
 * @param {string} message - Loading message (optional)
 */
export function showLoader(message = 'Chargement...') {
    // Remove existing loader if any
    hideLoader();

    // Create loader overlay
    const loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.className = 'loader-overlay';
    loader.innerHTML = `
        <div class="loader-content">
            <div class="loader-spinner"></div>
            <div class="loader-message">${escapeHtml(message)}</div>
        </div>
    `;

    document.body.appendChild(loader);
    globalLoaderInstance = loader;

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Trigger animation
    requestAnimationFrame(() => {
        loader.classList.add('loader-show');
    });

    console.log(`⏳ Global loader shown: ${message}`);
}

/**
 * Hide global loader
 */
export function hideLoader() {
    if (!globalLoaderInstance) return;

    globalLoaderInstance.classList.remove('loader-show');
    globalLoaderInstance.classList.add('loader-hide');

    setTimeout(() => {
        globalLoaderInstance?.remove();
        globalLoaderInstance = null;

        // Restore body scroll
        document.body.style.overflow = '';
    }, 300);

    console.log('✅ Global loader hidden');
}

/**
 * Update global loader message
 * @param {string} message - New message
 */
export function updateLoaderMessage(message) {
    if (!globalLoaderInstance) return;

    const messageEl = globalLoaderInstance.querySelector('.loader-message');
    if (messageEl) {
        messageEl.textContent = escapeHtml(message);
    }
}

// ================================================
// PROGRESS BAR
// ================================================

let progressBarInstance = null;

/**
 * Show progress bar at top of page
 * @param {number} initialProgress - Initial progress (0-100)
 */
export function showProgressBar(initialProgress = 0) {
    // Remove existing progress bar
    hideProgressBar();

    const progressBar = document.createElement('div');
    progressBar.id = 'global-progress-bar';
    progressBar.className = 'progress-bar-container';
    progressBar.innerHTML = `
        <div class="progress-bar-fill" style="width: ${initialProgress}%"></div>
    `;

    document.body.appendChild(progressBar);
    progressBarInstance = progressBar;

    // Trigger animation
    requestAnimationFrame(() => {
        progressBar.classList.add('progress-bar-show');
    });

    console.log(`📊 Progress bar shown: ${initialProgress}%`);
}

/**
 * Update progress bar
 * @param {number} progress - Progress percentage (0-100)
 */
export function updateProgress(progress) {
    if (!progressBarInstance) return;

    const fill = progressBarInstance.querySelector('.progress-bar-fill');
    if (fill) {
        progress = Math.max(0, Math.min(100, progress)); // Clamp between 0-100
        fill.style.width = `${progress}%`;
    }
}

/**
 * Hide progress bar
 */
export function hideProgressBar() {
    if (!progressBarInstance) return;

    // Set to 100% before hiding
    updateProgress(100);

    setTimeout(() => {
        progressBarInstance?.classList.add('progress-bar-hide');

        setTimeout(() => {
            progressBarInstance?.remove();
            progressBarInstance = null;
        }, 300);
    }, 200);

    console.log('✅ Progress bar hidden');
}

// ================================================
// SKELETON SCREENS
// ================================================

/**
 * Show skeleton screens in a container
 * @param {string|HTMLElement} container - Container selector or element
 * @param {number} count - Number of skeletons to show
 * @param {string} type - Skeleton type ('news-card', 'text', 'circle')
 */
export function showSkeletons(container, count = 3, type = 'news-card') {
    const containerEl = typeof container === 'string'
        ? document.querySelector(container)
        : container;

    if (!containerEl) {
        console.warn(`⚠️ Skeleton container not found: ${container}`);
        return;
    }

    // Clear existing content
    containerEl.innerHTML = '';

    // Create skeletons
    for (let i = 0; i < count; i++) {
        const skeleton = createSkeleton(type);
        containerEl.appendChild(skeleton);
    }

    console.log(`💀 ${count} skeletons shown in container`);
}

/**
 * Create a single skeleton element
 * @param {string} type - Skeleton type
 * @returns {HTMLElement} Skeleton element
 */
function createSkeleton(type) {
    const skeleton = document.createElement('div');
    skeleton.className = `skeleton skeleton-${type}`;

    switch (type) {
        case 'news-card':
            skeleton.innerHTML = `
                <div class="skeleton-image"></div>
                <div class="skeleton-content">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-text"></div>
                    <div class="skeleton-text" style="width: 80%;"></div>
                    <div class="skeleton-footer">
                        <div class="skeleton-avatar"></div>
                        <div class="skeleton-text" style="width: 100px;"></div>
                    </div>
                </div>
            `;
            break;

        case 'text':
            skeleton.innerHTML = `
                <div class="skeleton-text"></div>
            `;
            break;

        case 'circle':
            skeleton.innerHTML = `
                <div class="skeleton-circle"></div>
            `;
            break;

        default:
            skeleton.innerHTML = `
                <div class="skeleton-box"></div>
            `;
    }

    return skeleton;
}

/**
 * Hide skeletons and restore content
 * @param {string|HTMLElement} container - Container selector or element
 * @param {string} content - HTML content to restore (optional)
 */
export function hideSkeletons(container, content = '') {
    const containerEl = typeof container === 'string'
        ? document.querySelector(container)
        : container;

    if (!containerEl) return;

    // Fade out skeletons
    const skeletons = containerEl.querySelectorAll('.skeleton');
    skeletons.forEach(skeleton => {
        skeleton.classList.add('skeleton-fade-out');
    });

    setTimeout(() => {
        if (content) {
            containerEl.innerHTML = content;
        } else {
            skeletons.forEach(skeleton => skeleton.remove());
        }
    }, 300);

    console.log('✅ Skeletons hidden');
}

// ================================================
// BUTTON LOADING STATES
// ================================================

/**
 * Add loading state to a button
 * @param {HTMLElement} button - Button element
 * @param {string} loadingText - Text to show while loading (optional)
 */
export function addButtonLoader(button, loadingText = '') {
    if (!button) return;

    // Store original content
    button.setAttribute('data-original-content', button.innerHTML);
    button.setAttribute('data-original-text', button.textContent);

    // Disable button
    button.disabled = true;
    button.classList.add('button-loading');

    // Create spinner
    const spinner = document.createElement('span');
    spinner.className = 'button-spinner';
    spinner.innerHTML = `
        <svg class="spinner-icon" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-opacity="0.25"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        </svg>
    `;

    // Update button content
    if (loadingText) {
        button.innerHTML = '';
        button.appendChild(spinner);
        button.appendChild(document.createTextNode(loadingText));
    } else {
        button.innerHTML = '';
        button.appendChild(spinner);
    }
}

/**
 * Remove loading state from a button
 * @param {HTMLElement} button - Button element
 * @param {string} newText - New text to show (optional, uses original if not provided)
 */
export function removeButtonLoader(button, newText = '') {
    if (!button) return;

    // Restore original content or use new text
    if (newText) {
        button.textContent = newText;
    } else {
        const originalContent = button.getAttribute('data-original-content');
        if (originalContent) {
            button.innerHTML = originalContent;
        }
    }

    // Enable button
    button.disabled = false;
    button.classList.remove('button-loading');

    // Clean up attributes
    button.removeAttribute('data-original-content');
    button.removeAttribute('data-original-text');
}

// ================================================
// INLINE SPINNER
// ================================================

/**
 * Create an inline spinner element
 * @param {string} size - Spinner size ('sm', 'md', 'lg')
 * @returns {HTMLElement} Spinner element
 */
export function createSpinner(size = 'md') {
    const spinner = document.createElement('div');
    spinner.className = `inline-spinner inline-spinner-${size}`;
    spinner.innerHTML = `
        <svg class="spinner-icon" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-opacity="0.25"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        </svg>
    `;
    return spinner;
}

// ================================================
// UTILITY
// ================================================

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Example usage:
 *
 * import { showLoader, hideLoader, showSkeletons, addButtonLoader } from './loader.js';
 *
 * // Global loader
 * showLoader('Chargement des articles...');
 * await fetchNews();
 * hideLoader();
 *
 * // Skeleton screens
 * showSkeletons('newsContainer', 6, 'news-card');
 * const news = await fetchNews();
 * hideSkeletons('newsContainer');
 *
 * // Progress bar
 * showProgressBar(0);
 * updateProgress(50);
 * updateProgress(100);
 * hideProgressBar();
 *
 * // Button loading
 * const btn = document.getElementById('loadMoreBtn');
 * addButtonLoader(btn, 'Chargement...');
 * await loadMore();
 * removeButtonLoader(btn, 'Charger plus');
 */

console.log('✅ Loader module loaded');
