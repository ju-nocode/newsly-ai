// ================================================
// ICONS8 ICONS - SVG Icon Components
// Collection d'icônes Icons8 style Duo/Filled/Corners-Round
// Source: https://icones8.fr/icons/all--static--corners-round--duo--technique-filled
// ================================================

/**
 * Create an SVG icon element with Icons8 styling
 * @param {string} content - SVG content (paths, groups, etc.)
 * @param {string} size - Taille de l'icône (default: "20")
 * @param {string} className - Additional CSS classes
 * @returns {string} SVG element as HTML string
 */
function createIcon(content, size = "20", className = "") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="${className}">${content}</svg>`;
}

// ================================================
// NAVIGATION ICONS
// ================================================

export const icons = {
    // Login / Enter icon
    login: (size = "20", className = "") => createIcon(
        `<path fill="currentColor" fill-rule="evenodd" d="M2 4.75A2.75 2.75 0 0 1 4.75 2h4.5a.75.75 0 0 1 0 1.5h-4.5c-.69 0-1.25.56-1.25 1.25v10c0 .69.56 1.25 1.25 1.25h4.5a.75.75 0 0 1 0 1.5h-4.5A2.75 2.75 0 0 1 2 14.75zm11.78 1.97a.75.75 0 0 1 1.06 0l3.5 3.5a.75.75 0 0 1 0 1.06l-3.5 3.5a.75.75 0 1 1-1.06-1.06l2.22-2.22H7.75a.75.75 0 0 1 0-1.5H16l-2.22-2.22a.75.75 0 0 1 0-1.06" clip-rule="evenodd"/>`,
        size,
        className
    ),

    // Logout / Exit icon
    logout: (size = "20", className = "") => createIcon(
        `<path fill="currentColor" fill-rule="evenodd" d="M4.75 2A2.75 2.75 0 0 0 2 4.75v10A2.75 2.75 0 0 0 4.75 17.5h4.5a.75.75 0 0 0 0-1.5h-4.5c-.69 0-1.25-.56-1.25-1.25v-10c0-.69.56-1.25 1.25-1.25h4.5a.75.75 0 0 0 0-1.5zM13.78 6.72a.75.75 0 0 1 1.06 0l3.5 3.5a.75.75 0 0 1 0 1.06l-3.5 3.5a.75.75 0 1 1-1.06-1.06l2.22-2.22H7.75a.75.75 0 0 1 0-1.5H16l-2.22-2.22a.75.75 0 0 1 0-1.06" clip-rule="evenodd"/>`,
        size,
        className
    ),

    // User / Profile icon
    user: (size = "20", className = "") => createIcon(
        `<g fill="currentColor"><path d="M10 2.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7"/><path fill-rule="evenodd" d="M5 12.5A2.5 2.5 0 0 0 2.5 15v1.5a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1V15a2.5 2.5 0 0 0-2.5-2.5z" clip-rule="evenodd"/></g>`,
        size,
        className
    ),

    // Add user / Signup icon
    userPlus: (size = "20", className = "") => createIcon(
        `<g fill="currentColor"><path d="M9 2.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7"/><path fill-rule="evenodd" d="M4 12.5A2.5 2.5 0 0 0 1.5 15v1.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V15a2.5 2.5 0 0 0-2.5-2.5z" clip-rule="evenodd"/><path d="M16.5 5.75a.75.75 0 0 0-1.5 0V7h-1.25a.75.75 0 0 0 0 1.5H15v1.25a.75.75 0 0 0 1.5 0V8.5h1.25a.75.75 0 0 0 0-1.5H16.5z"/></g>`,
        size,
        className
    ),

    // Settings / Configuration icon
    settings: (size = "20", className = "") => createIcon(
        `<path fill="currentColor" fill-rule="evenodd" d="M7.948 2.75a.75.75 0 0 1 .698.472l.396 1a2.75 2.75 0 0 0 1.627 1.627l1 .396a.75.75 0 0 1 0 1.396l-1 .396a2.75 2.75 0 0 0-1.627 1.627l-.396 1a.75.75 0 0 1-1.396 0l-.396-1A2.75 2.75 0 0 0 5.227 7.04l-1-.396a.75.75 0 0 1 0-1.396l1-.396a2.75 2.75 0 0 0 1.627-1.627l.396-1a.75.75 0 0 1 .698-.471m5.052 6a.75.75 0 0 1 .698.472l.144.364a1.25 1.25 0 0 0 .74.74l.364.144a.75.75 0 0 1 0 1.396l-.364.144a1.25 1.25 0 0 0-.74.74l-.144.364a.75.75 0 0 1-1.396 0l-.144-.364a1.25 1.25 0 0 0-.74-.74l-.364-.144a.75.75 0 0 1 0-1.396l.364-.144a1.25 1.25 0 0 0 .74-.74l.144-.364a.75.75 0 0 1 .698-.472m-7 5a.75.75 0 0 1 .698.472l.144.364a1.25 1.25 0 0 0 .74.74l.364.144a.75.75 0 0 1 0 1.396l-.364.144a1.25 1.25 0 0 0-.74.74l-.144.364a.75.75 0 0 1-1.396 0l-.144-.364a1.25 1.25 0 0 0-.74-.74l-.364-.144a.75.75 0 0 1 0-1.396l.364-.144a1.25 1.25 0 0 0 .74-.74l.144-.364a.75.75 0 0 1 .698-.472" clip-rule="evenodd"/>`,
        size,
        className
    ),

    // Dashboard / Home icon
    dashboard: (size = "20", className = "") => createIcon(
        `<g fill="currentColor"><path d="M3.5 2.75a.75.75 0 0 0-.75.75v4a.75.75 0 0 0 .75.75h4a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 0-.75-.75zm0 8.5a.75.75 0 0 0-.75.75v4a.75.75 0 0 0 .75.75h4a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 0-.75-.75zm8.5-8.5a.75.75 0 0 0-.75.75v4a.75.75 0 0 0 .75.75h4a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 0-.75-.75zm-.75 9.25a.75.75 0 0 1 .75-.75h4a.75.75 0 0 1 .75.75v4a.75.75 0 0 1-.75.75h-4a.75.75 0 0 1-.75-.75z"/></g>`,
        size,
        className
    ),

    // Search icon
    search: (size = "20", className = "") => createIcon(
        `<path fill="currentColor" fill-rule="evenodd" d="M9 2.5a6.5 6.5 0 1 0 4.001 11.6l3.45 3.45a.75.75 0 1 0 1.06-1.061l-3.45-3.45A6.5 6.5 0 0 0 9 2.5M4 9a5 5 0 1 1 10 0A5 5 0 0 1 4 9" clip-rule="evenodd"/>`,
        size,
        className
    ),

    // News / Newspaper icon (iOS style outline)
    news: (size = "20", className = "") => createIcon(
        `<rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="16" x2="13" y2="16"/>`,
        size,
        className
    ),

    // Language / Globe icon
    language: (size = "20", className = "") => createIcon(
        `<path fill="currentColor" fill-rule="evenodd" d="M10 2.5a7.5 7.5 0 1 0 0 15a7.5 7.5 0 0 0 0-15M3.5 10a6.5 6.5 0 0 1 11.634-4.057a.75.75 0 0 0 .232.113a6.515 6.515 0 0 1-1.238 2.444h-.878a.75.75 0 0 0-.53.22l-.5.5a.75.75 0 0 1-.53.22h-1a.75.75 0 0 0-.75.75v.25a.75.75 0 0 1-.75.75h-1a.75.75 0 0 0-.53.22l-1.5 1.5a.75.75 0 0 1-.53.22h-.379q-.09.504-.251.982a6.5 6.5 0 0 1-.5-3.172M10 16.5a6.47 6.47 0 0 1-3.094-.785a.75.75 0 0 0 .344-.425l.5-1.5a.75.75 0 0 1 .71-.515h1.29a.75.75 0 0 0 .53-.22l1-1a.75.75 0 0 1 .53-.22h1.5a.75.75 0 0 0 .53-.22l.5-.5a.75.75 0 0 1 .53-.22h1.378q.09.504.251.982A6.5 6.5 0 0 1 10 16.5" clip-rule="evenodd"/>`,
        size,
        className
    ),

    // Eye / View icon
    eye: (size = "20", className = "") => createIcon(
        `<g fill="currentColor"><path d="M10 8.25a1.75 1.75 0 1 0 0 3.5a1.75 1.75 0 0 0 0-3.5"/><path fill-rule="evenodd" d="M2.438 9.47C3.598 6.392 6.523 4 10 4s6.402 2.392 7.562 5.47a1.75 1.75 0 0 1 0 1.06C16.402 13.608 13.477 16 10 16s-6.402-2.392-7.562-5.47a1.75 1.75 0 0 1 0-1.06M10 5.5c-2.774 0-5.15 1.915-6.147 4.5C4.85 12.585 7.226 14.5 10 14.5s5.15-1.915 6.147-4.5C15.15 7.415 12.774 5.5 10 5.5" clip-rule="evenodd"/></g>`,
        size,
        className
    ),

    // Eye slash / Hide icon
    eyeSlash: (size = "20", className = "") => createIcon(
        `<g fill="currentColor"><path d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l1.815 1.816A9.76 9.76 0 0 0 2.438 9.47a1.75 1.75 0 0 0 0 1.06C3.598 13.608 6.523 16 10 16c1.37 0 2.662-.37 3.798-1.012l2.922 2.922a.75.75 0 1 0 1.06-1.06zM10 14.5c-2.774 0-5.15-1.915-6.147-4.5a8.26 8.26 0 0 1 1.879-3.168l1.57 1.57a3.25 3.25 0 0 0 4.296 4.296l1.232 1.232A6.54 6.54 0 0 1 10 14.5"/><path d="M7.404 7.343a1.75 1.75 0 0 0 2.253 2.253zM6.365 4.682l1.238 1.238A6.54 6.54 0 0 1 10 5.5c2.774 0 5.15 1.915 6.147 4.5a8.26 8.26 0 0 1-1.65 2.732l1.076 1.076q.579-.63 1.065-1.338a1.75 1.75 0 0 0 0-1.06C15.402 8.392 12.477 6 9 6q-1.287 0-2.635.682"/></g>`,
        size,
        className
    ),

    // Shield / Security icon
    shield: (size = "20", className = "") => createIcon(
        `<path fill="currentColor" fill-rule="evenodd" d="M9.664 2.586a.75.75 0 0 1 .672 0l5.5 2.75A.75.75 0 0 1 16.25 6v4.75a5.75 5.75 0 0 1-2.843 4.956l-3 1.714a.75.75 0 0 1-.814 0l-3-1.714A5.75 5.75 0 0 1 3.75 10.75V6a.75.75 0 0 1 .414-.664zm.586 1.5L5.25 6.5v4.25a4.25 4.25 0 0 0 2.1 3.663L10 15.83l2.65-1.515a4.25 4.25 0 0 0 2.1-3.665V6.5z" clip-rule="evenodd"/>`,
        size,
        className
    ),

    // Bell / Notification icon
    bell: (size = "20", className = "") => createIcon(
        `<path fill="currentColor" fill-rule="evenodd" d="M10 2.5a5.25 5.25 0 0 0-5.25 5.25v2.879a2.75 2.75 0 0 1-.513 1.605l-.75 1.003A1.75 1.75 0 0 0 4.894 16H7.5a2.5 2.5 0 0 0 5 0h2.606a1.75 1.75 0 0 0 1.407-2.763l-.75-1.003a2.75 2.75 0 0 1-.513-1.605V7.75A5.25 5.25 0 0 0 10 2.5m1 13.5a1 1 0 1 1-2 0zm-4.894-1.5a.25.25 0 0 1-.201-.395l.75-1.003a4.25 4.25 0 0 0 .795-2.473V7.75a3.75 3.75 0 1 1 7.5 0v2.879c0 .89.268 1.76.795 2.473l.75 1.003a.25.25 0 0 1-.201.395z" clip-rule="evenodd"/>`,
        size,
        className
    ),

    // Trash / Delete icon
    trash: (size = "20", className = "") => createIcon(
        `<path fill="currentColor" fill-rule="evenodd" d="M8.75 2.5a.75.75 0 0 0-.75.75v.5h4v-.5a.75.75 0 0 0-.75-.75zM13.5 4.25v-.5A2.25 2.25 0 0 0 11.25 1.5h-2.5A2.25 2.25 0 0 0 6.5 3.75v.5H3.75a.75.75 0 0 0 0 1.5h.5v8.5A2.75 2.75 0 0 0 7 17h6a2.75 2.75 0 0 0 2.75-2.75v-8.5h.5a.75.75 0 0 0 0-1.5zM5.75 5.75v8.5c0 .69.56 1.25 1.25 1.25h6c.69 0 1.25-.56 1.25-1.25v-8.5z" clip-rule="evenodd"/>`,
        size,
        className
    ),

    // Check / Success icon
    check: (size = "20", className = "") => createIcon(
        `<path fill="currentColor" fill-rule="evenodd" d="M16.704 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-3-3a1 1 0 1 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0" clip-rule="evenodd"/>`,
        size,
        className
    ),

    // Close / X icon
    close: (size = "20", className = "") => createIcon(
        `<path fill="currentColor" fill-rule="evenodd" d="M4.293 4.293a1 1 0 0 1 1.414 0L10 8.586l4.293-4.293a1 1 0 1 1 1.414 1.414L11.414 10l4.293 4.293a1 1 0 0 1-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L8.586 10L4.293 5.707a1 1 0 0 1 0-1.414" clip-rule="evenodd"/>`,
        size,
        className
    ),

    // Menu / Hamburger icon
    menu: (size = "20", className = "") => createIcon(
        `<path fill="currentColor" fill-rule="evenodd" d="M2 5a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1m0 5a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1m1 4a1 1 0 1 0 0 2h14a1 1 0 1 0 0-2z" clip-rule="evenodd"/>`,
        size,
        className
    ),

    // Arrow Right icon
    arrowRight: (size = "20", className = "") => createIcon(
        `<path fill="currentColor" fill-rule="evenodd" d="M9.293 4.293a1 1 0 0 1 1.414 0l5 5a1 1 0 0 1 0 1.414l-5 5a1 1 0 0 1-1.414-1.414L13.586 10L9.293 5.707a1 1 0 0 1 0-1.414" clip-rule="evenodd"/>`,
        size,
        className
    ),

    // Edit / Pencil icon
    edit: (size = "20", className = "") => createIcon(
        `<path fill="currentColor" fill-rule="evenodd" d="M13.232 2.232a2.5 2.5 0 0 1 3.536 3.536l-9.5 9.5a2.75 2.75 0 0 1-1.158.663l-2.75.687a.75.75 0 0 1-.918-.918l.687-2.75a2.75 2.75 0 0 1 .663-1.158zm2.475 1.061a1 1 0 0 0-1.414 0l-9.5 9.5a1.25 1.25 0 0 0-.302.526l-.38 1.52l1.52-.38a1.25 1.25 0 0 0 .526-.302l9.5-9.5a1 1 0 0 0 0-1.414z" clip-rule="evenodd"/>`,
        size,
        className
    ),

    // Download icon
    download: (size = "20", className = "") => createIcon(
        `<path fill="currentColor" fill-rule="evenodd" d="M10 2.5a.75.75 0 0 1 .75.75v8.19l2.72-2.72a.75.75 0 1 1 1.06 1.06l-4 4a.75.75 0 0 1-1.06 0l-4-4a.75.75 0 0 1 1.06-1.06l2.72 2.72V3.25A.75.75 0 0 1 10 2.5M3.5 13.25a.75.75 0 0 1 .75.75v1.25c0 .69.56 1.25 1.25 1.25h9c.69 0 1.25-.56 1.25-1.25V14a.75.75 0 0 1 1.5 0v1.25A2.75 2.75 0 0 1 14.5 18h-9A2.75 2.75 0 0 1 2.75 15.25V14a.75.75 0 0 1 .75-.75" clip-rule="evenodd"/>`,
        size,
        className
    ),

    // ================================================
    // CATEGORY ICONS (Sidebar)
    // ================================================

    // Business / Briefcase icon (iOS style outline)
    briefcase: (size = "20", className = "") => createIcon(
        `<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="3" y1="13" x2="21" y2="13"/>`,
        size,
        className
    ),

    // Technology / Laptop icon (iOS style outline)
    laptop: (size = "20", className = "") => createIcon(
        `<rect x="2" y="5" width="20" height="12" rx="2"/><path d="M2 17h20"/><circle cx="12" cy="19" r="0.5" fill="currentColor"/>`,
        size,
        className
    ),

    // Science / Flask icon (iOS style outline - plus représentatif que test tube)
    testTube: (size = "20", className = "") => createIcon(
        `<path d="M9 3h6M10 3v7l4 6a2 2 0 0 1-1.7 3h-4.6A2 2 0 0 1 6 16l4-6V3"/><line x1="11" y1="13" x2="13" y2="13"/>`,
        size,
        className
    ),

    // Health / Heart with pulse icon (iOS style outline)
    heartPulse: (size = "20", className = "") => createIcon(
        `<path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/><path d="M9 12h2l1-3 1 6 1-3h2"/>`,
        size,
        className
    ),

    // Sports / Football icon (iOS style outline)
    football: (size = "20", className = "") => createIcon(
        `<circle cx="12" cy="12" r="9"/><path d="M12 3v2m0 14v2M3 12h2m14 0h2M6.34 6.34l1.41 1.41m8.49 8.49l1.41 1.41M6.34 17.66l1.41-1.41m8.49-8.49l1.41-1.41"/><circle cx="12" cy="12" r="3"/>`,
        size,
        className
    ),

    // Entertainment / Film icon (iOS style outline - plus simple)
    clapperboard: (size = "20", className = "") => createIcon(
        `<rect x="2" y="5" width="20" height="15" rx="2"/><path d="M2 9h20M7 5l-2 4M12 5l-2 4M17 5l-2 4M22 5l-2 4"/>`,
        size,
        className
    ),

    // Pin icon
    pin: (size = "20", className = "") => createIcon(
        `<path fill="currentColor" fill-rule="evenodd" d="M10 2.5a.75.75 0 0 1 .75.75v4.19l2.72-2.72a.75.75 0 1 1 1.06 1.06l-4 4a.75.75 0 0 1-1.06 0l-4-4a.75.75 0 0 1 1.06-1.06l2.72 2.72V3.25A.75.75 0 0 1 10 2.5m-6 9A.75.75 0 0 1 4.75 11h10.5a.75.75 0 0 1 0 1.5H4.75a.75.75 0 0 1-.75-.75" clip-rule="evenodd"/>`,
        size,
        className
    ),

    // Home icon
    home: (size = "20", className = "") => createIcon(
        `<path fill="currentColor" fill-rule="evenodd" d="M9.293 2.293a1 1 0 0 1 1.414 0l6 6A1 1 0 0 1 17 9v7a2 2 0 0 1-2 2h-3a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H4a2 2 0 0 1-2-2V9a1 1 0 0 1 .293-.707z" clip-rule="evenodd"/>`,
        size,
        className
    ),

    // Security checked / Shield with check icon
    securityChecked: (size = "20", className = "") => createIcon(
        `<g fill="currentColor"><path d="M9.664 2.586a.75.75 0 0 1 .672 0l5.5 2.75A.75.75 0 0 1 16.25 6v4.75a5.75 5.75 0 0 1-2.843 4.956l-3 1.714a.75.75 0 0 1-.814 0l-3-1.714A5.75 5.75 0 0 1 3.75 10.75V6a.75.75 0 0 1 .414-.664z"/><path fill-rule="evenodd" d="M13.78 7.72a.75.75 0 0 1 0 1.06l-4 4a.75.75 0 0 1-1.06 0l-2-2a.75.75 0 0 1 1.06-1.06L9 10.94l3.47-3.47a.75.75 0 0 1 1.06 0" clip-rule="evenodd"/></g>`,
        size,
        className
    ),

    // ================================================
    // COUNTRY FLAGS (Monochrome Globe)
    // ================================================

    // Globe icon (pour remplacer tous les drapeaux)
    globe: (size = "20", className = "") => createIcon(
        `<path fill="currentColor" fill-rule="evenodd" d="M10 2.5a7.5 7.5 0 1 0 0 15a7.5 7.5 0 0 0 0-15M3.5 10a6.5 6.5 0 0 1 11.634-4.057a.75.75 0 0 0 .232.113a6.515 6.515 0 0 1-1.238 2.444h-.878a.75.75 0 0 0-.53.22l-.5.5a.75.75 0 0 1-.53.22h-1a.75.75 0 0 0-.75.75v.25a.75.75 0 0 1-.75.75h-1a.75.75 0 0 0-.53.22l-1.5 1.5a.75.75 0 0 1-.53.22h-.379q-.09.504-.251.982a6.5 6.5 0 0 1-.5-3.172M10 16.5a6.47 6.47 0 0 1-3.094-.785a.75.75 0 0 0 .344-.425l.5-1.5a.75.75 0 0 1 .71-.515h1.29a.75.75 0 0 0 .53-.22l1-1a.75.75 0 0 1 .53-.22h1.5a.75.75 0 0 0 .53-.22l.5-.5a.75.75 0 0 1 .53-.22h1.378q.09.504.251.982A6.5 6.5 0 0 1 10 16.5" clip-rule="evenodd"/>`,
        size,
        className
    )
};

/**
 * Get icon by name (helper function for compatibility)
 * @param {string} iconName - Name of the icon
 * @param {string} size - Size of the icon
 * @param {string} className - Additional CSS classes
 * @returns {string|null} SVG element as HTML string or null if not found
 */
export function getIcon(iconName, size = "20", className = "") {
    if (icons[iconName] && typeof icons[iconName] === 'function') {
        return icons[iconName](size, className);
    }
    console.warn(`⚠️ Icon "${iconName}" not found in Icons8 module`);
    return null;
}

// ================================================
// AUTO-REPLACEMENT SYSTEM
// ================================================

/**
 * Icon mapping from icons8 URLs to Icons8 SVG icon names
 */
const iconMapping = {
    // Category icons
    'news.png': 'news',
    'briefcase.png': 'briefcase',
    'laptop.png': 'laptop',
    'test-tube.png': 'testTube',
    'heart-with-pulse.png': 'heartPulse',
    'football.png': 'football',
    'clapperboard.png': 'clapperboard',

    // Pin icon
    'pin3.png': 'pin',

    // Navigation icons
    'home.png': 'home',
    'search.png': 'search',

    // User/auth icons
    'user.png': 'user',
    'user-male-circle.png': 'user',

    // Settings icons
    'settings.png': 'settings',
    'settings-3.png': 'settings',
    'dashboard.png': 'dashboard',
    'exit.png': 'logout',
    'security-checked.png': 'securityChecked',

    // Country flags (remplacer par globe monochrome)
    'usa.png': 'globe',
    'france.png': 'globe',
    'great-britain.png': 'globe',
    'germany.png': 'globe',
    'canada.png': 'globe',
};

/**
 * Replace all icons8 img tags with Icons8 SVG icons
 */
export function replaceAllIcons() {
    console.log('🎨 Replacing icons8 images with Icons8 SVG icons...');

    const images = document.querySelectorAll('img[src*="icons8.com"]');
    let replacedCount = 0;

    images.forEach(img => {
        const src = img.src;
        const iconName = getIconNameFromUrl(src);

        if (iconName) {
            // Extract size from URL (e.g., /50/, /100/, /18/) or from img attributes
            let size = extractSizeFromUrl(src);

            // Fallback: use img width/height attribute or style
            if (!size) {
                size = img.width || img.getAttribute('width') ||
                       (img.style.width && parseInt(img.style.width)) || '20';
            }

            // Get icon HTML with extracted size
            const iconHTML = getIcon(iconName, size.toString(), img.className || '');

            if (iconHTML) {
                // Create a temporary div to parse the SVG
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = iconHTML;
                const svg = tempDiv.firstChild;

                // Copy inline styles if any (but don't override width/height)
                if (img.style.cssText) {
                    // Parse existing styles but remove width/height to let SVG attributes handle it
                    const styleText = img.style.cssText
                        .replace(/width:[^;]+;?/g, '')
                        .replace(/height:[^;]+;?/g, '');
                    if (styleText.trim()) {
                        svg.style.cssText = styleText;
                    }
                }

                // Copy alt text as aria-label if present
                if (img.alt) {
                    svg.setAttribute('aria-label', img.alt);
                    svg.setAttribute('role', 'img');
                } else {
                    svg.setAttribute('aria-hidden', 'true');
                }

                // Replace img with SVG
                img.parentNode.replaceChild(svg, img);
                replacedCount++;
            }
        }
    });

    console.log(`✅ Replaced ${replacedCount} icons with Icons8 SVG`);
}

/**
 * Extract icon size from Icons8 URL
 * @param {string} url - Icons8 image URL
 * @returns {number|null} - Icon size in pixels or null
 */
function extractSizeFromUrl(url) {
    // Match pattern like /50/, /100/, /18/, etc.
    const sizeMatch = url.match(/\/(\d+)\//);
    return sizeMatch ? parseInt(sizeMatch[1]) : null;
}

/**
 * Get Icons8 SVG icon name from icons8 URL
 * @param {string} url - icons8 image URL
 * @returns {string|null} - Icons8 icon name or null
 */
function getIconNameFromUrl(url) {
    // Extract filename from URL
    const filename = url.split('/').pop();

    // Check mapping
    if (iconMapping[filename]) {
        return iconMapping[filename];
    }

    // Try to match pattern in filename
    for (const [pattern, iconName] of Object.entries(iconMapping)) {
        if (filename.includes(pattern.replace('.png', ''))) {
            return iconName;
        }
    }

    console.warn(`⚠️ No mapping found for icon: ${filename}`);
    return null;
}

/**
 * Initialize icon replacement on DOM ready
 */
export function initIconReplacement() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', replaceAllIcons);
    } else {
        replaceAllIcons();
    }
}

// Auto-initialize if not in module context
if (typeof window !== 'undefined' && !window.__ICONS8_MANUAL_INIT__) {
    initIconReplacement();
}
