// ================================================
// ANIMATIONS SYSTEM - Reusable UI Animations
// ================================================

/**
 * Fade in an element
 * @param {HTMLElement|string} element - Element or selector
 * @param {number} duration - Animation duration in ms
 */
export function fadeIn(element, duration = 300) {
    const el = getElement(element);
    if (!el) return;

    el.style.opacity = '0';
    el.style.display = '';
    el.style.transition = `opacity ${duration}ms ease`;

    requestAnimationFrame(() => {
        el.style.opacity = '1';
    });

    return new Promise(resolve => {
        setTimeout(() => {
            el.style.transition = '';
            resolve();
        }, duration);
    });
}

/**
 * Fade out an element
 * @param {HTMLElement|string} element - Element or selector
 * @param {number} duration - Animation duration in ms
 * @param {boolean} hide - Hide element after fade (default: true)
 */
export function fadeOut(element, duration = 300, hide = true) {
    const el = getElement(element);
    if (!el) return;

    el.style.transition = `opacity ${duration}ms ease`;
    el.style.opacity = '0';

    return new Promise(resolve => {
        setTimeout(() => {
            if (hide) {
                el.style.display = 'none';
            }
            el.style.transition = '';
            resolve();
        }, duration);
    });
}

/**
 * Slide in from direction
 * @param {HTMLElement|string} element - Element or selector
 * @param {string} direction - Direction: 'left', 'right', 'top', 'bottom'
 * @param {number} duration - Animation duration in ms
 */
export function slideIn(element, direction = 'right', duration = 400) {
    const el = getElement(element);
    if (!el) return;

    const transforms = {
        left: 'translateX(-100%)',
        right: 'translateX(100%)',
        top: 'translateY(-100%)',
        bottom: 'translateY(100%)'
    };

    el.style.transform = transforms[direction] || transforms.right;
    el.style.opacity = '0';
    el.style.display = '';
    el.style.transition = `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${duration}ms ease`;

    requestAnimationFrame(() => {
        el.style.transform = 'translateX(0) translateY(0)';
        el.style.opacity = '1';
    });

    return new Promise(resolve => {
        setTimeout(() => {
            el.style.transition = '';
            resolve();
        }, duration);
    });
}

/**
 * Slide out to direction
 * @param {HTMLElement|string} element - Element or selector
 * @param {string} direction - Direction: 'left', 'right', 'top', 'bottom'
 * @param {number} duration - Animation duration in ms
 * @param {boolean} hide - Hide element after slide (default: true)
 */
export function slideOut(element, direction = 'right', duration = 400, hide = true) {
    const el = getElement(element);
    if (!el) return;

    const transforms = {
        left: 'translateX(-100%)',
        right: 'translateX(100%)',
        top: 'translateY(-100%)',
        bottom: 'translateY(100%)'
    };

    el.style.transition = `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${duration}ms ease`;
    el.style.transform = transforms[direction] || transforms.right;
    el.style.opacity = '0';

    return new Promise(resolve => {
        setTimeout(() => {
            if (hide) {
                el.style.display = 'none';
            }
            el.style.transition = '';
            resolve();
        }, duration);
    });
}

/**
 * Scale animation (grow/shrink)
 * @param {HTMLElement|string} element - Element or selector
 * @param {number} scale - Target scale (1 = normal, 1.1 = 10% bigger, 0.9 = 10% smaller)
 * @param {number} duration - Animation duration in ms
 */
export function scaleElement(element, scale = 1.05, duration = 200) {
    const el = getElement(element);
    if (!el) return;

    el.style.transition = `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    el.style.transform = `scale(${scale})`;

    return new Promise(resolve => {
        setTimeout(() => {
            el.style.transform = 'scale(1)';
            setTimeout(() => {
                el.style.transition = '';
                resolve();
            }, duration);
        }, duration);
    });
}

/**
 * Shake animation (for errors)
 * @param {HTMLElement|string} element - Element or selector
 * @param {number} intensity - Shake intensity in pixels (default: 10)
 */
export function shake(element, intensity = 10) {
    const el = getElement(element);
    if (!el) return;

    el.classList.add('animate-shake');
    el.style.setProperty('--shake-intensity', `${intensity}px`);

    return new Promise(resolve => {
        setTimeout(() => {
            el.classList.remove('animate-shake');
            el.style.removeProperty('--shake-intensity');
            resolve();
        }, 500);
    });
}

/**
 * Bounce animation
 * @param {HTMLElement|string} element - Element or selector
 */
export function bounce(element) {
    const el = getElement(element);
    if (!el) return;

    el.classList.add('animate-bounce');

    return new Promise(resolve => {
        setTimeout(() => {
            el.classList.remove('animate-bounce');
            resolve();
        }, 600);
    });
}

/**
 * Pulse animation (for attention)
 * @param {HTMLElement|string} element - Element or selector
 * @param {number} count - Number of pulses (default: 2)
 */
export function pulse(element, count = 2) {
    const el = getElement(element);
    if (!el) return;

    el.classList.add('animate-pulse');
    el.style.setProperty('--pulse-count', count);

    const duration = count * 300;
    return new Promise(resolve => {
        setTimeout(() => {
            el.classList.remove('animate-pulse');
            el.style.removeProperty('--pulse-count');
            resolve();
        }, duration);
    });
}

/**
 * Rotate animation
 * @param {HTMLElement|string} element - Element or selector
 * @param {number} degrees - Rotation degrees (default: 360)
 * @param {number} duration - Animation duration in ms
 */
export function rotate(element, degrees = 360, duration = 400) {
    const el = getElement(element);
    if (!el) return;

    el.style.transition = `transform ${duration}ms ease`;
    el.style.transform = `rotate(${degrees}deg)`;

    return new Promise(resolve => {
        setTimeout(() => {
            el.style.transform = 'rotate(0deg)';
            setTimeout(() => {
                el.style.transition = '';
                resolve();
            }, duration);
        }, duration);
    });
}

/**
 * Flip animation
 * @param {HTMLElement|string} element - Element or selector
 * @param {string} axis - Flip axis: 'x' or 'y'
 * @param {number} duration - Animation duration in ms
 */
export function flip(element, axis = 'y', duration = 600) {
    const el = getElement(element);
    if (!el) return;

    const property = axis === 'x' ? 'rotateX' : 'rotateY';
    el.style.transition = `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    el.style.transformStyle = 'preserve-3d';
    el.style.transform = `${property}(180deg)`;

    return new Promise(resolve => {
        setTimeout(() => {
            el.style.transform = `${property}(360deg)`;
            setTimeout(() => {
                el.style.transition = '';
                el.style.transformStyle = '';
                el.style.transform = '';
                resolve();
            }, duration);
        }, duration);
    });
}

/**
 * Highlight flash animation
 * @param {HTMLElement|string} element - Element or selector
 * @param {string} color - Highlight color (default: primary color)
 */
export function highlightFlash(element, color = 'var(--primary)') {
    const el = getElement(element);
    if (!el) return;

    const originalBg = el.style.backgroundColor;
    el.style.transition = 'background-color 200ms ease';
    el.style.backgroundColor = color;

    return new Promise(resolve => {
        setTimeout(() => {
            el.style.backgroundColor = originalBg;
            setTimeout(() => {
                el.style.transition = '';
                resolve();
            }, 400);
        }, 200);
    });
}

/**
 * Morph animation (width/height)
 * @param {HTMLElement|string} element - Element or selector
 * @param {Object} dimensions - Target dimensions {width, height}
 * @param {number} duration - Animation duration in ms
 */
export function morph(element, dimensions = {}, duration = 400) {
    const el = getElement(element);
    if (!el) return;

    const { width, height } = dimensions;

    if (width) {
        el.style.transition = `width ${duration}ms ease`;
        el.style.width = width;
    }

    if (height) {
        el.style.transition = `height ${duration}ms ease`;
        el.style.height = height;
    }

    return new Promise(resolve => {
        setTimeout(() => {
            el.style.transition = '';
            resolve();
        }, duration);
    });
}

/**
 * Stagger animation for lists
 * @param {string} selector - CSS selector for elements to animate
 * @param {Function} animation - Animation function to apply
 * @param {number} delay - Delay between each element in ms
 */
export async function stagger(selector, animation = fadeIn, delay = 100) {
    const elements = document.querySelectorAll(selector);

    for (let i = 0; i < elements.length; i++) {
        animation(elements[i]);
        if (i < elements.length - 1) {
            await wait(delay);
        }
    }
}

/**
 * Collapse/Expand animation
 * @param {HTMLElement|string} element - Element or selector
 * @param {boolean} expand - True to expand, false to collapse
 * @param {number} duration - Animation duration in ms
 */
export function toggleCollapse(element, expand = true, duration = 400) {
    const el = getElement(element);
    if (!el) return;

    if (expand) {
        // Expand
        el.style.display = '';
        const height = el.scrollHeight;
        el.style.height = '0';
        el.style.overflow = 'hidden';
        el.style.transition = `height ${duration}ms ease`;

        requestAnimationFrame(() => {
            el.style.height = `${height}px`;
        });

        return new Promise(resolve => {
            setTimeout(() => {
                el.style.height = '';
                el.style.overflow = '';
                el.style.transition = '';
                resolve();
            }, duration);
        });
    } else {
        // Collapse
        const height = el.scrollHeight;
        el.style.height = `${height}px`;
        el.style.overflow = 'hidden';
        el.style.transition = `height ${duration}ms ease`;

        requestAnimationFrame(() => {
            el.style.height = '0';
        });

        return new Promise(resolve => {
            setTimeout(() => {
                el.style.display = 'none';
                el.style.height = '';
                el.style.overflow = '';
                el.style.transition = '';
                resolve();
            }, duration);
        });
    }
}

/**
 * Ripple effect animation (Material Design style)
 * @param {HTMLElement} element - Element to add ripple to
 * @param {Event} event - Click event
 */
export function ripple(element, event) {
    const el = getElement(element);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const rippleEl = document.createElement('span');
    rippleEl.className = 'ripple-effect';
    rippleEl.style.width = rippleEl.style.height = `${size}px`;
    rippleEl.style.left = `${x}px`;
    rippleEl.style.top = `${y}px`;

    el.style.position = 'relative';
    el.style.overflow = 'hidden';
    el.appendChild(rippleEl);

    setTimeout(() => {
        rippleEl.remove();
    }, 600);
}

// ================================================
// UTILITY FUNCTIONS
// ================================================

/**
 * Get element from selector or element
 */
function getElement(element) {
    if (typeof element === 'string') {
        return document.querySelector(element);
    }
    return element;
}

/**
 * Wait helper
 */
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Add animation class utilities
 */
export function addClass(element, className, duration = 0) {
    const el = getElement(element);
    if (!el) return;

    el.classList.add(className);

    if (duration > 0) {
        return new Promise(resolve => {
            setTimeout(() => {
                el.classList.remove(className);
                resolve();
            }, duration);
        });
    }
}

export function removeClass(element, className) {
    const el = getElement(element);
    if (!el) return;
    el.classList.remove(className);
}

export function toggleClass(element, className) {
    const el = getElement(element);
    if (!el) return;
    el.classList.toggle(className);
}

/**
 * Example usage:
 *
 * import { fadeIn, shake, stagger, ripple } from './animations.js';
 *
 * // Fade in element
 * await fadeIn('#myElement', 300);
 *
 * // Shake on error
 * shake('#errorField', 10);
 *
 * // Stagger list items
 * stagger('.news-card', fadeIn, 100);
 *
 * // Ripple effect on buttons
 * button.addEventListener('click', (e) => ripple(button, e));
 *
 * // Chain animations
 * await fadeIn('#card');
 * await pulse('#card', 2);
 * await scaleElement('#card', 1.05);
 */

console.log('✅ Animations module loaded');
