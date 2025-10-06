import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '../../lib/rate-limit.js';

const limiter = rateLimit({
    interval: 60 * 1000, // 1 minute
    maxRequests: 20 // 20 requêtes par minute
});

export default async function handler(req, res) {
    // CORS headers - Restricted to allowed origins
    const allowedOrigins = [
        'https://prod-julien.vercel.app',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ];
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', true);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Rate limiting - Get identifier from IP
    const identifier = req.headers['x-forwarded-for']?.split(',')[0] ||
                      req.headers['x-real-ip'] ||
                      req.socket.remoteAddress ||
                      'unknown';

    const rateLimitResult = limiter.check(identifier);

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', rateLimitResult.limit);
    res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining);
    res.setHeader('X-RateLimit-Reset', rateLimitResult.reset);

    if (!rateLimitResult.success) {
        return res.status(429).json({
            error: 'Trop de requêtes. Veuillez réessayer plus tard.',
            retryAfter: rateLimitResult.reset
        });
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

        // Utiliser le service role pour récupérer le profil de l'utilisateur connecté
        const supabaseAdmin = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // Vérifier si l'utilisateur est admin
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (profileError || !profile || !profile.is_admin) {
            return res.status(403).json({ error: 'Accès non autorisé - Admin uniquement' });
        }

        // GET - Récupérer la liste des utilisateurs (admin only)
        if (req.method === 'GET') {
            // Log audit: consultation de la liste des utilisateurs
            await supabaseAdmin.from('admin_audit_log').insert({
                admin_id: user.id,
                admin_email: user.email,
                action: 'VIEW_USERS',
                ip_address: identifier,
                user_agent: req.headers['user-agent'],
                metadata: { method: 'GET' }
            });

            const { data: users, error: usersError } = await supabaseAdmin
                .from('profiles')
                .select('id, email, username, full_name, is_admin, created_at')
                .order('created_at', { ascending: false });

            if (usersError) {
                console.error('Users fetch error:', usersError);
                return res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
            }

            // Formater les données pour inclure le rôle
            const formattedUsers = users.map(u => ({
                ...u,
                role: u.is_admin ? 'admin' : 'user'
            }));

            // Calculer les stats
            const totalUsers = users.length;
            const totalAdmins = users.filter(u => u.is_admin).length;
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            const recentUsers = users.filter(u => new Date(u.created_at) > oneWeekAgo).length;

            return res.status(200).json({
                users: formattedUsers,
                stats: {
                    totalUsers,
                    totalAdmins,
                    recentUsers
                }
            });
        }

        // DELETE - Supprimer un utilisateur (admin only)
        if (req.method === 'DELETE') {
            const { userId } = req.body;

            if (!userId) {
                return res.status(400).json({ error: 'userId requis' });
            }

            // Vérifier qu'on ne supprime pas son propre compte
            if (userId === user.id) {
                return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
            }

            try {
                // Récupérer les infos de l'utilisateur à supprimer pour l'audit
                const { data: targetUser } = await supabaseAdmin
                    .from('profiles')
                    .select('email, username')
                    .eq('id', userId)
                    .single();

                // Log audit AVANT la suppression
                await supabaseAdmin.from('admin_audit_log').insert({
                    admin_id: user.id,
                    admin_email: user.email,
                    action: 'DELETE_USER',
                    target_user_id: userId,
                    target_user_email: targetUser?.email || 'unknown',
                    ip_address: identifier,
                    user_agent: req.headers['user-agent'],
                    metadata: {
                        target_username: targetUser?.username,
                        reason: 'Admin deletion'
                    }
                });

                // Suppression en cascade de toutes les données liées
                const deletionErrors = [];

                // 1. Supprimer la configuration particles
                const { error: particlesError } = await supabaseAdmin
                    .from('particles_config')
                    .delete()
                    .eq('user_id', userId);
                if (particlesError) {
                    console.error('Particles config delete error:', particlesError);
                    deletionErrors.push('particles_config');
                }

                // 2. Supprimer le profil
                const { error: profileError } = await supabaseAdmin
                    .from('profiles')
                    .delete()
                    .eq('id', userId);
                if (profileError) {
                    console.error('Profile delete error:', profileError);
                    deletionErrors.push('profiles');
                }

                // 3. Supprimer l'utilisateur auth (supprime aussi les sessions)
                const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
                if (authError) {
                    console.error('Auth delete error:', authError);
                    return res.status(500).json({
                        error: 'Erreur lors de la suppression du compte auth',
                        details: authError.message,
                        partialDeletion: deletionErrors.length > 0 ? deletionErrors : undefined
                    });
                }

                console.log(`✅ Admin ${user.email} deleted user ${targetUser?.email} (${userId}) from IP ${identifier}`);

                if (deletionErrors.length > 0) {
                    console.warn(`⚠️ Some data could not be deleted: ${deletionErrors.join(', ')}`);
                }

                return res.status(200).json({
                    message: 'Utilisateur supprimé avec succès',
                    warning: deletionErrors.length > 0 ? `Certaines données n'ont pas pu être supprimées: ${deletionErrors.join(', ')}` : undefined
                });
            } catch (error) {
                console.error('Delete user error:', error);
                return res.status(500).json({ error: error.message });
            }
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Admin users API error:', error);
        return res.status(500).json({
            error: 'Erreur serveur',
            details: error.message
        });
    }
}
