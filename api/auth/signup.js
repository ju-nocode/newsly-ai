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

        console.log('=== SIGNUP REQUEST ===');
        console.log('Email:', email);
        console.log('Username:', username);
        console.log('Full name:', full_name);
        console.log('Country:', country);
        console.log('City:', city);
        console.log('Phone:', phone);
        console.log('Metadata:', metadata);

        if (!email || !password) {
            console.error('Missing email or password');
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
        console.log('Calling Supabase signUp...');
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: userMetadata
            }
        });

        if (error) {
            // Message générique pour la sécurité (ne pas révéler si l'email existe)
            console.error('Supabase Auth signup error:', error);
            console.error('Error message:', error.message);
            console.error('Error code:', error.code);
            console.error('Error status:', error.status);
            return res.status(400).json({
                error: 'Impossible de créer le compte. Veuillez réessayer plus tard.'
            });
        }

        console.log('Supabase Auth signup successful, user ID:', data?.user?.id);

        // Créer/Mettre à jour le profil dans la table profiles
        if (data.user) {
            console.log('Creating profile in database...');

            const supabaseAdmin = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_SERVICE_ROLE_KEY
            );

            const profileData = {
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
            };

            console.log('Profile data to insert:', profileData);

            // Upsert dans profiles (insert ou update si existe déjà)
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .upsert(profileData, {
                    onConflict: 'id'
                });

            if (profileError) {
                console.error('Profile creation error:', profileError);
                console.error('Profile error details:', {
                    code: profileError.code,
                    message: profileError.message,
                    details: profileError.details,
                    hint: profileError.hint
                });
                // Ne pas bloquer l'inscription même si la création du profil échoue
                // Message générique
                return res.status(400).json({
                    error: 'Impossible de créer le compte. Veuillez réessayer plus tard.'
                });
            }

            console.log('Profile created successfully in database');
        }

        return res.status(200).json({
            user: data.user,
            session: data.session,
            message: 'Inscription réussie'
        });

    } catch (error) {
        console.error('Signup error:', error);
        // Message générique pour toutes les erreurs serveur
        return res.status(500).json({
            error: 'Une erreur est survenue. Veuillez réessayer plus tard.'
        });
    }
}
