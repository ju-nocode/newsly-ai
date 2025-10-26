import { createClient } from '@supabase/supabase-js';
import { getIPGeolocation } from '../utils/geolocation.js';

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
            // Utiliser le service role pour récupérer toutes les colonnes sans restriction RLS
            const supabaseAdmin = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_SERVICE_ROLE_KEY
            );

            // Récupérer les données de la table profiles avec explicitement les colonnes
            const { data: profile, error: profileError } = await supabaseAdmin
                .from('profiles')
                .select('id, email, first_name, last_name, display_name, phone, bio, avatar_url, country, city, is_admin, created_at, updated_at')
                .eq('id', user.id)
                .single();

            if (profileError && profileError.code !== 'PGRST116') {
                console.error('Profile fetch error:', profileError);
            }

            return res.status(200).json({
                id: user.id,
                email: user.email,
                first_name: profile?.first_name || user.user_metadata?.first_name || user.email.split('@')[0],
                last_name: profile?.last_name || user.user_metadata?.last_name || '',
                display_name: profile?.display_name || `${profile?.first_name} ${profile?.last_name}`.trim() || user.email.split('@')[0],
                phone: profile?.phone || '',
                bio: profile?.bio || '',
                avatar_url: profile?.avatar_url || '',
                country: profile?.country || 'France',
                city: profile?.city || '',
                role: profile?.is_admin ? 'admin' : 'user',
                is_admin: profile?.is_admin || false,
                created_at: profile?.created_at || user.created_at,
                updated_at: profile?.updated_at || user.created_at
            });
        }

        // PUT - Mettre à jour le profil
        if (req.method === 'PUT') {
            const { first_name, last_name, display_name, phone, bio, avatar_url, country, city } = req.body;

            // Validation des données
            if (first_name !== undefined) {
                if (typeof first_name !== 'string' || first_name.trim().length < 1 || first_name.trim().length > 50) {
                    return res.status(400).json({ error: 'Prénom invalide (1-50 caractères)' });
                }
            }

            if (last_name !== undefined) {
                if (typeof last_name !== 'string' || last_name.trim().length < 1 || last_name.trim().length > 50) {
                    return res.status(400).json({ error: 'Nom invalide (1-50 caractères)' });
                }
            }

            if (display_name !== undefined && display_name !== null && display_name.trim() !== '') {
                if (typeof display_name !== 'string' || display_name.trim().length > 50) {
                    return res.status(400).json({ error: 'Nom d\'affichage invalide (max 50 caractères)' });
                }
            }

            if (phone !== undefined && phone !== null && phone.length > 20) {
                return res.status(400).json({ error: 'Numéro de téléphone invalide (max 20 caractères)' });
            }

            if (bio !== undefined && bio !== null && bio.length > 500) {
                return res.status(400).json({ error: 'Bio trop longue (max 500 caractères)' });
            }

            if (country !== undefined && country !== null && country !== '') {
                if (typeof country !== 'string' || country.trim().length < 1 || country.trim().length > 100) {
                    return res.status(400).json({ error: 'Pays invalide (1-100 caractères)' });
                }
            }

            if (city !== undefined && city !== null && city !== '') {
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
                } else if (trimmedUrl.length > 300000) {
                    // Limite stricte à 300KB pour avatars haute qualité (accepte photos jusqu'à 10MB compressées)
                    return res.status(400).json({ error: 'Avatar trop volumineux après compression (max 300KB)' });
                }
            }

            const updateData = {};

            if (first_name !== undefined) {
                updateData.first_name = first_name.trim();
            }

            if (last_name !== undefined) {
                updateData.last_name = last_name.trim();
            }

            if (display_name !== undefined && display_name !== null && display_name.trim() !== '') {
                updateData.display_name = display_name.trim();
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
            const firstName = updateData.first_name || existingProfile?.first_name || user.email.split('@')[0];
            const lastName = updateData.last_name || existingProfile?.last_name || '';
            const autoDisplayName = `${firstName} ${lastName}`.trim() || firstName;

            const finalData = {
                id: user.id,
                email: user.email,
                first_name: firstName,
                last_name: lastName,
                display_name: updateData.display_name || existingProfile?.display_name || autoDisplayName,
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
            if (first_name !== undefined || last_name !== undefined) {
                await supabaseAdmin.auth.admin.updateUserById(
                    user.id,
                    {
                        user_metadata: {
                            first_name: firstName,
                            last_name: lastName,
                            display_name: finalData.display_name
                        }
                    }
                );
            }

            // Log security event - Comparer avec existingProfile pour détecter les vrais changements
            try {
                const changedFields = [];
                const fieldLabels = {
                    first_name: 'prénom',
                    last_name: 'nom',
                    display_name: 'nom d\'affichage',
                    phone: 'téléphone',
                    bio: 'bio',
                    avatar_url: 'avatar',
                    country: 'pays',
                    city: 'ville'
                };

                // Comparer chaque champ avec l'existant
                for (const [key, label] of Object.entries(fieldLabels)) {
                    if (updateData[key] !== undefined && updateData[key] !== existingProfile?.[key]) {
                        changedFields.push(label);
                    }
                }

                // Logger seulement si des champs ont vraiment changé
                if (changedFields.length > 0) {
                    // Récupérer l'IP depuis les headers
                    const ipHeader = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket?.remoteAddress || req.connection?.remoteAddress;
                    const clientIP = ipHeader ? ipHeader.split(',')[0].trim() : 'Non disponible';

                    // Géolocaliser l'IP
                    const location = await getIPGeolocation(clientIP);

                    await supabaseAdmin
                        .from('user_activity_log')
                        .insert({
                            user_id: user.id,
                            activity_type: 'profile_update',
                            context: {
                                success: true,
                                fields_updated: changedFields,
                                ip: clientIP,
                                location: location,
                                timestamp: new Date().toISOString()
                            },
                            device_type: /Mobile|Android|iPhone/i.test(req.headers['user-agent']) ? 'mobile' : 'desktop',
                            user_agent: req.headers['user-agent'] || null,
                            created_at: new Date().toISOString()
                        });
                }
            } catch (logError) {
                console.error('Error logging profile update:', logError);
                // Continue même si le log échoue
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
