// ================================================
// MICRO-INTERACTIONS - Animations boutons & UI
// ================================================

/**
 * Ajoute un effet ripple à la position du clic
 * @param {HTMLElement} element - Élément sur lequel ajouter le ripple
 * @param {MouseEvent} event - Événement de clic
 */
export const addRipple = (element, event) => {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');

    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    element.appendChild(ripple);

    // Retirer le ripple après l'animation
    setTimeout(() => ripple.remove(), 600);
};

/**
 * Initialise l'effet ripple sur tous les boutons
 */
export const initRippleButtons = () => {
    const buttons = document.querySelectorAll('.btn-primary, .btn-success, .btn-danger, .btn-secondary, .btn-secondary-danger, .btn-submit');

    buttons.forEach(button => {
        // Éviter les double listeners
        if (button.hasAttribute('data-ripple-init')) return;
        button.setAttribute('data-ripple-init', 'true');

        button.addEventListener('click', (e) => {
            addRipple(button, e);
        });
    });
};

/**
 * Effet magnétique sur un élément (suit la souris)
 * @param {HTMLElement} element - Élément à rendre magnétique
 * @param {number} strength - Force de l'effet (0-1)
 */
export const makeMagnetic = (element, strength = 0.2) => {
    element.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

    element.addEventListener('mousemove', (e) => {
        const rect = element.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * strength;
        const y = (e.clientY - rect.top - rect.height / 2) * strength;

        element.style.transform = `translate(${x}px, ${y}px)`;
    });

    element.addEventListener('mouseleave', () => {
        element.style.transform = 'translate(0, 0)';
    });
};

/**
 * Ajoute un effet de rebond au hover
 * @param {string} selector - Sélecteur CSS des éléments
 */
export const addBounceEffect = (selector) => {
    const elements = document.querySelectorAll(selector);

    elements.forEach(element => {
        element.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';

        element.addEventListener('mouseenter', () => {
            element.style.transform = 'scale(1.05)';
        });

        element.addEventListener('mouseleave', () => {
            element.style.transform = 'scale(1)';
        });
    });
};

// Auto-init au chargement du module
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRippleButtons);
    } else {
        initRippleButtons();
    }
}
