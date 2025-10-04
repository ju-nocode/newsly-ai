import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email requis' });
        }

        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );

        // Renvoyer l'email de confirmation
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({
            message: 'Email de confirmation renvoyé'
        });

    } catch (error) {
        console.error('Resend confirmation error:', error);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
}
