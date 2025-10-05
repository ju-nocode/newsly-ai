import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Extraire le token d'authentification
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        const token = authHeader.split(' ')[1];

        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );

        // Vérifier le token et récupérer l'utilisateur
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ error: 'Token invalide' });
        }

        // GET - Récupérer le profil
        if (req.method === 'GET') {
            // Récupérer les données de la table profiles
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError && profileError.code !== 'PGRST116') {
                console.error('Profile fetch error:', profileError);
            }

            return res.status(200).json({
                id: user.id,
                email: user.email,
                username: profile?.username || user.user_metadata?.username || user.email.split('@')[0],
                full_name: profile?.full_name || user.user_metadata?.full_name || '',
                phone: profile?.phone || '',
                bio: profile?.bio || '',
                avatar_url: profile?.avatar_url || '',
                country: profile?.country || 'France',
                city: profile?.city || '',
                role: profile?.is_admin ? 'admin' : 'user',
                is_admin: profile?.is_admin || false,
                created_at: user.created_at
            });
        }

        // PUT - Mettre à jour le profil
        if (req.method === 'PUT') {
            const { username, full_name, phone, bio, avatar_url, country, city } = req.body;

            // Validation des données
            if (username !== undefined) {
                if (typeof username !== 'string' || username.trim().length < 1 || username.trim().length > 50) {
                    return res.status(400).json({ error: 'Username invalide (1-50 caractères)' });
                }
            }

            if (full_name !== undefined) {
                if (typeof full_name !== 'string' || full_name.length > 100) {
                    return res.status(400).json({ error: 'Nom complet invalide (max 100 caractères)' });
                }
            }

            if (phone !== undefined && phone !== null && phone.length > 20) {
                return res.status(400).json({ error: 'Numéro de téléphone invalide (max 20 caractères)' });
            }

            if (bio !== undefined && bio !== null && bio.length > 500) {
                return res.status(400).json({ error: 'Bio trop longue (max 500 caractères)' });
            }

            if (country !== undefined) {
                if (typeof country !== 'string' || country.trim().length < 1 || country.trim().length > 100) {
                    return res.status(400).json({ error: 'Pays invalide (1-100 caractères)' });
                }
            }

            if (city !== undefined) {
                if (typeof city !== 'string' || city.trim().length < 1 || city.trim().length > 100) {
                    return res.status(400).json({ error: 'Ville invalide (1-100 caractères)' });
                }
            }

            if (avatar_url !== undefined && avatar_url !== null && avatar_url.trim().length > 0) {
                const trimmedUrl = avatar_url.trim();

                // Accepter les URLs http/https et les data URLs (base64)
                const isValidUrl = trimmedUrl.match(/^https?:\/\/.+/) || trimmedUrl.match(/^data:image\/.+;base64,.+/);

                if (!isValidUrl) {
                    // Si ce n'est pas une URL valide, mettre à null au lieu de rejeter
                    avatar_url = null;
                } else if (trimmedUrl.length > 50000) {
                    // Limite stricte à 50KB pour éviter les tokens trop gros
                    return res.status(400).json({ error: 'Avatar trop volumineux (max 50KB en base64 ou URL)' });
                }
            }

            const updateData = {};

            if (username !== undefined) {
                updateData.username = username.trim();
            }

            if (full_name !== undefined) {
                updateData.full_name = full_name.trim();
            }

            if (phone !== undefined) {
                updateData.phone = phone.trim();
            }

            if (bio !== undefined) {
                updateData.bio = bio.trim();
            }

            if (avatar_url !== undefined) {
                updateData.avatar_url = avatar_url === null ? null : avatar_url.trim();
            }

            if (country !== undefined) {
                updateData.country = country.trim();
            }

            if (city !== undefined) {
                updateData.city = city.trim();
            }

            // Mettre à jour updated_at
            updateData.updated_at = new Date().toISOString();

            // Utiliser le Service Role pour mettre à jour la table profiles
            if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
                console.error('SUPABASE_SERVICE_ROLE_KEY is missing!');
                return res.status(500).json({
                    error: 'Configuration serveur manquante',
                    details: 'SUPABASE_SERVICE_ROLE_KEY non définie'
                });
            }

            const supabaseAdmin = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_SERVICE_ROLE_KEY
            );

            // Récupérer le profil existant pour éviter d'écraser des données
            const { data: existingProfile, error: fetchError } = await supabaseAdmin
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                console.error('Error fetching existing profile:', fetchError);
                // Continue quand même, on créera un nouveau profil
            }

            // Convertir is_admin en boolean si c'est une string
            let isAdmin = false;
            if (existingProfile?.is_admin !== undefined && existingProfile?.is_admin !== null) {
                if (typeof existingProfile.is_admin === 'string') {
                    isAdmin = existingProfile.is_admin === 'true' || existingProfile.is_admin === 't';
                } else {
                    isAdmin = Boolean(existingProfile.is_admin);
                }
            }

            // Préparer les données finales en fusionnant avec l'existant
            const finalData = {
                id: user.id,
                email: user.email,
                username: updateData.username || existingProfile?.username || null,
                full_name: updateData.full_name || existingProfile?.full_name || user.email.split('@')[0],
                phone: updateData.phone !== undefined ? updateData.phone : (existingProfile?.phone || null),
                bio: updateData.bio !== undefined ? updateData.bio : (existingProfile?.bio || null),
                avatar_url: updateData.avatar_url !== undefined ? updateData.avatar_url : (existingProfile?.avatar_url || null),
                country: updateData.country || existingProfile?.country || 'France',
                city: updateData.city || existingProfile?.city || 'Paris',
                is_admin: isAdmin,
                created_at: existingProfile?.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            console.log('Attempting to upsert profile:', {
                userId: user.id,
                finalData: finalData
            });

            const { data, error } = await supabaseAdmin
                .from('profiles')
                .upsert(finalData, {
                    onConflict: 'id',
                    ignoreDuplicates: false
                })
                .select()
                .single();

            if (error) {
                console.error('Profile update error:', error);
                console.error('Error code:', error.code);
                console.error('Error details:', error.details);
                console.error('Error hint:', error.hint);
                return res.status(400).json({
                    error: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint
                });
            }

            // Aussi mettre à jour user_metadata pour garder la cohérence
            if (username !== undefined) {
                await supabaseAdmin.auth.admin.updateUserById(
                    user.id,
                    {
                        user_metadata: {
                            username: username.trim(),
                            display_name: username.trim()
                        }
                    }
                );
            }

            return res.status(200).json({
                message: 'Profil mis à jour',
                profile: data
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Profile error:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        return res.status(500).json({
            error: 'Erreur serveur',
            details: error.message,
            code: error.code
        });
    }
}
