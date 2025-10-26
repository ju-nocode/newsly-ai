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
        const { email, password, metadata, first_name, last_name, country, city, phone } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe requis' });
        }

        // Validation email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Email invalide' });
        }

        // Validation mot de passe
        if (password.length < 12) {
            return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 12 caractères' });
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
            first_name: first_name || metadata?.first_name || email.split('@')[0],
            last_name: last_name || metadata?.last_name || '',
            display_name: metadata?.display_name || `${first_name || email.split('@')[0]} ${last_name || ''}`.trim() || email.split('@')[0],
            phone: phone || metadata?.phone || '',
            bio: metadata?.bio || '',
            avatar_url: metadata?.avatar_url || '',
            country: country || metadata?.country || 'France',
            city: city || metadata?.city || 'Paris'
        };

        // Inscription avec redirect URL pour confirmation email (vers callback qui auto-ferme)
        const redirectUrl = process.env.NODE_ENV === 'production'
            ? 'https://prod-julien.vercel.app/auth/callback'
            : 'http://localhost:3000/auth/callback';

        console.log('🔄 Attempting signup with:', { email, userMetadata });

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: userMetadata,
                emailRedirectTo: redirectUrl
            }
        });

        if (error) {
            // Message générique pour la sécurité (ne pas révéler si l'email existe)
            console.error('❌ Signup error:', error.message, error);
            console.error('Error details:', JSON.stringify(error, null, 2));

            // Si l'utilisateur existe déjà, renvoyer un message spécifique
            if (error.message.includes('already registered') || error.message.includes('already been registered')) {
                return res.status(400).json({
                    error: 'Un compte existe déjà avec cet email.'
                });
            }

            return res.status(400).json({
                error: 'Impossible de créer le compte. Veuillez réessayer plus tard.'
            });
        }

        // Créer/Mettre à jour le profil dans la table profiles
        if (data.user) {
            const supabaseAdmin = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_SERVICE_ROLE_KEY
            );

            // Attendre 1 seconde pour que l'utilisateur soit bien dans auth.users
            await new Promise(resolve => setTimeout(resolve, 1000));

            const profileData = {
                id: data.user.id,
                email: data.user.email,
                first_name: userMetadata.first_name || email.split('@')[0],
                last_name: userMetadata.last_name || '',
                display_name: userMetadata.display_name || `${userMetadata.first_name} ${userMetadata.last_name}`.trim() || email.split('@')[0],
                phone: userMetadata.phone || null,
                bio: userMetadata.bio || null,
                avatar_url: userMetadata.avatar_url || null,
                country: userMetadata.country || 'France',
                city: userMetadata.city || 'Paris',
                is_admin: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            // Upsert dans profiles (insert ou update si existe déjà)
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .upsert(profileData, {
                    onConflict: 'id',
                    ignoreDuplicates: false
                });

            if (profileError) {
                console.error('Profile creation error:', profileError.message, profileError);

                // Si c'est juste un conflit d'email (trigger a déjà créé), on ignore
                if (!profileError.message.includes('duplicate') && !profileError.message.includes('unique')) {
                    return res.status(400).json({
                        error: 'Impossible de créer le compte. Veuillez réessayer plus tard.'
                    });
                }
                // Sinon on continue (le profile existe déjà via trigger)
            }
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
