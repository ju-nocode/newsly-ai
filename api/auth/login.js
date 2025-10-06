import { createClient } from '@supabase/supabase-js';

import { securityHeaders, validateEmail, validatePassword, rateLimit } from '../_middleware/security.js';

export default async function handler(req, res) {
    // CORS sécurisé
    const origin = req.headers.origin;
    securityHeaders(res, origin);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, password } = req.body;

        // Rate limiting par IP
        const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const rateLimitResult = rateLimit(clientIP, 5, 60000); // 5 tentatives par minute

        if (!rateLimitResult.allowed) {
            return res.status(429).json({ error: 'Trop de tentatives. Réessayez dans 1 minute.' });
        }

        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe requis' });
        }

        // Validation email avec fonction sécurisée
        if (!validateEmail(email)) {
            return res.status(400).json({ error: 'Email invalide' });
        }

        // Validation mot de passe avec fonction sécurisée
        if (!validatePassword(password)) {
            return res.status(400).json({ error: 'Mot de passe invalide' });
        }

        // Initialiser Supabase avec les clés sécurisées côté serveur
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );

        // Authentification
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.status(401).json({ error: error.message });
        }

        // Retourner les données d'authentification
        return res.status(200).json({
            user: data.user,
            session: data.session
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
}
