// ================================================
// MIDDLEWARE DE SÉCURITÉ
// ================================================

// Liste des origines autorisées (whitelist)
const ALLOWED_ORIGINS = [
    'https://prod-julien.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
];

export const securityHeaders = (res, origin) => {
    // CORS sécurisé avec whitelist
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');

    // Sécurité supplémentaire
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: http:;");
};

// Validation email (RFC 5322 plus strict)
export const validateEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    // Regex plus strict pour email
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length >= 5 && email.length <= 255;
};

// Validation mot de passe (Supabase exige 12 caractères minimum)
export const validatePassword = (password) => {
    if (!password || typeof password !== 'string') return false;
    return password.length >= 12 && password.length <= 100;
};

// Validation username
export const validateUsername = (username) => {
    if (!username || typeof username !== 'string') return false;
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    return usernameRegex.test(username) && username.length >= 1 && username.length <= 50;
};

// Sanitize string
export const sanitizeString = (str, maxLength = 500) => {
    if (!str || typeof str !== 'string') return '';
    return str.trim().substring(0, maxLength);
};

// Validation URL
export const validateUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
        return false;
    }
};

// Rate limiting simple (en mémoire)
const rateLimitStore = new Map();

export const rateLimit = (identifier, maxRequests = 10, windowMs = 60000) => {
    const now = Date.now();
    const key = `${identifier}_${Math.floor(now / windowMs)}`;

    const current = rateLimitStore.get(key) || 0;

    if (current >= maxRequests) {
        return { allowed: false, remaining: 0 };
    }

    rateLimitStore.set(key, current + 1);

    // Nettoyage automatique
    if (rateLimitStore.size > 1000) {
        const oldKeys = Array.from(rateLimitStore.keys()).slice(0, 500);
        oldKeys.forEach(k => rateLimitStore.delete(k));
    }

    return { allowed: true, remaining: maxRequests - current - 1 };
};
