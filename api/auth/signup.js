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
        const { email, password, metadata, username, full_name, country, city, phone } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe requis' });
        }

        // Validation email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Email invalide' });
        }

        // Validation mot de passe
        if (password.length < 8) {
            return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' });
        }

        if (password.length > 100) {
            return res.status(400).json({ error: 'Le mot de passe est trop long (max 100 caractères)' });
        }

        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );

        // Préparer les métadonnées utilisateur
        const userMetadata = {
            username: username || metadata?.username || email.split('@')[0],
            full_name: full_name || metadata?.full_name || username || email.split('@')[0],
            display_name: username || metadata?.username || email.split('@')[0],
            phone: phone || metadata?.phone || '',
            bio: metadata?.bio || '',
            avatar_url: metadata?.avatar_url || '',
            country: country || metadata?.country || 'France',
            city: city || metadata?.city || 'Paris'
        };

        // Inscription
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: userMetadata
            }
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // Créer/Mettre à jour le profil dans la table profiles
        if (data.user) {
            const supabaseAdmin = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_SERVICE_ROLE_KEY
            );

            // Upsert dans profiles (insert ou update si existe déjà)
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .upsert({
                    id: data.user.id,
                    email: data.user.email,
                    username: userMetadata.username || userMetadata.full_name || email.split('@')[0],
                    full_name: userMetadata.full_name || userMetadata.username || email.split('@')[0],
                    phone: userMetadata.phone || null,
                    bio: userMetadata.bio || null,
                    avatar_url: userMetadata.avatar_url || null,
                    country: userMetadata.country || 'France',
                    city: userMetadata.city || 'Paris',
                    is_admin: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'id'
                });

            if (profileError) {
                console.error('Profile creation error:', profileError);
                // Ne pas bloquer l'inscription même si la création du profil échoue
            }
        }

        return res.status(200).json({
            user: data.user,
            session: data.session,
            message: 'Inscription réussie'
        });

    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
}
