import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
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

        const supabaseAdmin = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // GET - Récupérer les paramètres utilisateur
        if (req.method === 'GET') {
            const { data: settings, error } = await supabaseAdmin
                .from('user_settings')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Settings fetch error:', error);
                return res.status(500).json({ error: 'Erreur lors de la récupération des paramètres' });
            }

            // Si pas de settings, retourner les valeurs par défaut
            if (!settings) {
                return res.status(200).json({
                    theme: 'dark',
                    language: 'fr',
                    email_notifications: true,
                    push_notifications: false,
                    newsletter_frequency: 'weekly',
                    articles_per_page: 20,
                    compact_view: false,
                    show_images: true,
                    timezone: 'Europe/Paris',
                    onboarding_completed: false,
                    onboarding_step: 0
                });
            }

            return res.status(200).json(settings);
        }

        // POST/PUT - Mettre à jour les paramètres
        if (req.method === 'POST' || req.method === 'PUT') {
            const {
                theme,
                language,
                email_notifications,
                push_notifications,
                newsletter_frequency,
                articles_per_page,
                compact_view,
                show_images,
                timezone,
                onboarding_completed,
                onboarding_step
            } = req.body;

            // Validation
            if (theme && !['light', 'dark', 'auto'].includes(theme)) {
                return res.status(400).json({ error: 'Thème invalide (light, dark, auto)' });
            }

            if (language && !['fr', 'en'].includes(language)) {
                return res.status(400).json({ error: 'Langue invalide (fr, en)' });
            }

            if (newsletter_frequency && !['daily', 'weekly', 'monthly', 'never'].includes(newsletter_frequency)) {
                return res.status(400).json({ error: 'Fréquence newsletter invalide' });
            }

            if (articles_per_page !== undefined && (articles_per_page < 10 || articles_per_page > 100)) {
                return res.status(400).json({ error: 'Articles par page doit être entre 10 et 100' });
            }

            // Préparer les données à mettre à jour
            const updateData = {
                user_id: user.id,
                updated_at: new Date().toISOString()
            };

            if (theme !== undefined) updateData.theme = theme;
            if (language !== undefined) updateData.language = language;
            if (email_notifications !== undefined) updateData.email_notifications = email_notifications;
            if (push_notifications !== undefined) updateData.push_notifications = push_notifications;
            if (newsletter_frequency !== undefined) updateData.newsletter_frequency = newsletter_frequency;
            if (articles_per_page !== undefined) updateData.articles_per_page = articles_per_page;
            if (compact_view !== undefined) updateData.compact_view = compact_view;
            if (show_images !== undefined) updateData.show_images = show_images;
            if (timezone !== undefined) updateData.timezone = timezone;
            if (onboarding_completed !== undefined) updateData.onboarding_completed = onboarding_completed;
            if (onboarding_step !== undefined) updateData.onboarding_step = onboarding_step;

            // Upsert (insert ou update)
            const { data, error } = await supabaseAdmin
                .from('user_settings')
                .upsert(updateData, {
                    onConflict: 'user_id',
                    ignoreDuplicates: false
                })
                .select()
                .single();

            if (error) {
                console.error('Settings update error:', error);
                return res.status(400).json({ error: error.message });
            }

            return res.status(200).json({
                message: 'Paramètres mis à jour',
                settings: data
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Settings error:', error);
        return res.status(500).json({
            error: 'Erreur serveur',
            details: error.message
        });
    }
}
