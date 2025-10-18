// ================================================
// NOTIFICATIONS SYSTEM - Centralized Toast Manager
// ================================================

/**
 * Notification types with their icons and colors
 */
const NOTIFICATION_TYPES = {
    success: {
        icon: '✅',
        class: 'notification-success'
    },
    error: {
        icon: '❌',
        class: 'notification-error'
    },
    warning: {
        icon: '⚠️',
        class: 'notification-warning'
    },
    info: {
        icon: 'ℹ️',
        class: 'notification-info'
    }
};

/**
 * Default notification options
 */
const DEFAULT_OPTIONS = {
    duration: 4000,              // Auto-dismiss after 4s
    position: 'top-right',       // top-left, top-right, bottom-left, bottom-right, top-center, bottom-center
    dismissible: true,           // Show close button
    action: null,                // { label: 'Action', callback: () => {} }
    sound: false,                // Play sound (future feature)
    progressBar: true            // Show progress bar for auto-dismiss
};

/**
 * Notification queue to manage multiple notifications
 */
let notificationQueue = [];
let notificationIdCounter = 0;

/**
 * Create notification container if it doesn't exist
 */
function createNotificationContainer(position) {
    const containerId = `notification-container-${position}`;
    let container = document.getElementById(containerId);

    if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        container.className = `notification-container notification-${position}`;
        document.body.appendChild(container);
    }

    return container;
}

/**
 * Show a notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, warning, info)
 * @param {Object} options - Additional options
 * @returns {number} Notification ID
 */
export function showNotification(message, type = 'info', options = {}) {
    // Merge options with defaults
    const config = { ...DEFAULT_OPTIONS, ...options };

    // Validate type
    if (!NOTIFICATION_TYPES[type]) {
        console.warn(`Invalid notification type: ${type}. Using 'info' as default.`);
        type = 'info';
    }

    const typeConfig = NOTIFICATION_TYPES[type];
    const notificationId = ++notificationIdCounter;

    // Get or create container
    const container = createNotificationContainer(config.position);

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${typeConfig.class}`;
    notification.id = `notification-${notificationId}`;
    notification.setAttribute('data-notification-id', notificationId);

    // Build notification HTML
    notification.innerHTML = `
        <div class="notification-icon">${typeConfig.icon}</div>
        <div class="notification-content">
            <div class="notification-message">${escapeHtml(message)}</div>
            ${config.action ? `
                <button class="notification-action" data-action="true">
                    ${escapeHtml(config.action.label)}
                </button>
            ` : ''}
        </div>
        ${config.dismissible ? `
            <button class="notification-close" aria-label="Close" data-close="true">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 7.293l2.146-2.147a.5.5 0 01.708.708L8.707 8l2.147 2.146a.5.5 0 01-.708.708L8 8.707l-2.146 2.147a.5.5 0 01-.708-.708L7.293 8 5.146 5.854a.5.5 0 01.708-.708L8 7.293z"/>
                </svg>
            </button>
        ` : ''}
        ${config.progressBar && config.duration > 0 ? `
            <div class="notification-progress">
                <div class="notification-progress-bar"></div>
            </div>
        ` : ''}
    `;

    // Add to queue
    notificationQueue.push({
        id: notificationId,
        element: notification,
        timeout: null
    });

    // Add to container with animation
    container.appendChild(notification);

    // Trigger animation
    requestAnimationFrame(() => {
        notification.classList.add('notification-show');
    });

    // Setup event listeners
    setupNotificationEvents(notification, notificationId, config);

    // Auto-dismiss
    if (config.duration > 0) {
        startNotificationTimer(notificationId, config.duration);
    }

    console.log(`📢 Notification shown: ${type} - ${message}`);

    return notificationId;
}

/**
 * Setup event listeners for a notification
 */
function setupNotificationEvents(notification, notificationId, config) {
    // Close button
    const closeBtn = notification.querySelector('[data-close="true"]');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            dismissNotification(notificationId);
        });
    }

    // Action button
    const actionBtn = notification.querySelector('[data-action="true"]');
    if (actionBtn && config.action?.callback) {
        actionBtn.addEventListener('click', () => {
            config.action.callback();
            dismissNotification(notificationId);
        });
    }

    // Click to dismiss (optional)
    if (config.clickToDismiss) {
        notification.addEventListener('click', (e) => {
            // Don't dismiss if clicking on action button
            if (!e.target.closest('[data-action="true"]')) {
                dismissNotification(notificationId);
            }
        });
    }
}

/**
 * Start auto-dismiss timer
 */
function startNotificationTimer(notificationId, duration) {
    const notif = notificationQueue.find(n => n.id === notificationId);
    if (!notif) return;

    const progressBar = notif.element.querySelector('.notification-progress-bar');

    // Animate progress bar
    if (progressBar) {
        progressBar.style.transition = `width ${duration}ms linear`;
        requestAnimationFrame(() => {
            progressBar.style.width = '0%';
        });
    }

    // Set timeout for auto-dismiss
    notif.timeout = setTimeout(() => {
        dismissNotification(notificationId);
    }, duration);
}

/**
 * Dismiss a notification
 * @param {number} notificationId - Notification ID to dismiss
 */
export function dismissNotification(notificationId) {
    const notif = notificationQueue.find(n => n.id === notificationId);
    if (!notif) return;

    // Clear timeout
    if (notif.timeout) {
        clearTimeout(notif.timeout);
    }

    // Animate out
    notif.element.classList.remove('notification-show');
    notif.element.classList.add('notification-hide');

    // Remove from DOM after animation
    setTimeout(() => {
        notif.element.remove();

        // Remove from queue
        notificationQueue = notificationQueue.filter(n => n.id !== notificationId);

        // Remove container if empty
        const container = notif.element.parentElement;
        if (container && container.children.length === 0) {
            container.remove();
        }
    }, 300);
}

/**
 * Dismiss all notifications
 */
export function dismissAllNotifications() {
    notificationQueue.forEach(notif => {
        dismissNotification(notif.id);
    });
}

/**
 * Utility: Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Shorthand functions for each type
 */
export function showSuccess(message, options = {}) {
    return showNotification(message, 'success', options);
}

export function showError(message, options = {}) {
    return showNotification(message, 'error', {
        duration: 6000, // Errors stay longer
        ...options
    });
}

export function showWarning(message, options = {}) {
    return showNotification(message, 'warning', options);
}

export function showInfo(message, options = {}) {
    return showNotification(message, 'info', options);
}

/**
 * Example usage:
 *
 * import { showNotification, showSuccess, showError } from './notifications.js';
 *
 * // Simple
 * showSuccess('Article saved!');
 * showError('Failed to load news');
 *
 * // With options
 * showNotification('Are you sure?', 'warning', {
 *     duration: 0, // Don't auto-dismiss
 *     action: {
 *         label: 'Confirm',
 *         callback: () => deleteArticle()
 *     }
 * });
 *
 * // With custom position
 * showInfo('Update available', {
 *     position: 'bottom-center',
 *     duration: 10000
 * });
 */

console.log('✅ Notifications module loaded');
