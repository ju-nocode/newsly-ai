// ================================================
// COLLAPSE MENU - Système universel pour tous les menus déroulants
// ================================================

/**
 * Initialise tous les menus collapsibles de la page
 * Utilise les data-attributes pour cibler les éléments
 */
export const initCollapseMenus = () => {
    // Sélectionner tous les headers avec data-collapse-id
    const collapseHeaders = document.querySelectorAll('[data-collapse-id]');

    if (collapseHeaders.length === 0) {
        console.log('ℹ️ Aucun menu collapse trouvé');
        return;
    }

    console.log(`✅ ${collapseHeaders.length} menu(s) collapse trouvé(s)`);

    collapseHeaders.forEach(header => {
        const collapseId = header.getAttribute('data-collapse-id');
        const content = document.querySelector(`[data-collapse-target="${collapseId}"]`);

        if (!content) {
            console.warn(`⚠️ Contenu collapse non trouvé pour: ${collapseId}`);
            return;
        }

        // Charger l'état sauvegardé depuis localStorage
        const isCollapsed = localStorage.getItem(`collapse_${collapseId}`) === 'true';

        if (isCollapsed) {
            header.classList.add('collapsed');
            content.classList.add('collapsed');
        }

        // Event listener pour le toggle
        header.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const willCollapse = !header.classList.contains('collapsed');

            // Toggle les classes
            header.classList.toggle('collapsed');
            content.classList.toggle('collapsed');

            // Sauvegarder l'état
            localStorage.setItem(`collapse_${collapseId}`, willCollapse);

            console.log(`🔄 Toggle ${collapseId}: ${willCollapse ? 'collapsed' : 'expanded'}`);
        });
    });
};

/**
 * Réinitialise tous les menus (les ouvre tous)
 */
export const resetCollapseMenus = () => {
    const collapseHeaders = document.querySelectorAll('[data-collapse-id]');

    collapseHeaders.forEach(header => {
        const collapseId = header.getAttribute('data-collapse-id');
        const content = document.querySelector(`[data-collapse-target="${collapseId}"]`);

        if (content) {
            header.classList.remove('collapsed');
            content.classList.remove('collapsed');
            localStorage.removeItem(`collapse_${collapseId}`);
        }
    });

    console.log('🔄 Tous les menus collapse réinitialisés');
};
