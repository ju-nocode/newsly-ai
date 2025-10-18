import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Initialiser Supabase
const supabaseUrl = 'https://ycdtglcngcbevxxmxsfk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljZHRnbGNuZ2NiZXZ4eG14c2ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgzMjQ1MDMsImV4cCI6MjA0MzkwMDUwM30.M1eubqJLNj53oZjVGc_Wh-WRWQo8g2x4B1IEwqA_Cqw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const resetPasswordForm = document.getElementById('resetPasswordForm');
const newPasswordInput = document.getElementById('newPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');
const resetError = document.getElementById('resetError');
const resetSuccess = document.getElementById('resetSuccess');

// Afficher les erreurs
const showError = (message) => {
    resetError.textContent = message;
    resetError.style.display = 'block';
    resetSuccess.style.display = 'none';
};

// Afficher le succès
const showSuccess = (message) => {
    resetSuccess.textContent = message;
    resetSuccess.style.display = 'block';
    resetError.style.display = 'none';
};

// Gérer la soumission du formulaire
resetPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    // Validation
    if (newPassword.length < 8) {
        showError('Le mot de passe doit contenir au moins 8 caractères');
        return;
    }

    if (newPassword !== confirmPassword) {
        showError('Les mots de passe ne correspondent pas');
        return;
    }

    // Désactiver le bouton
    const submitBtn = resetPasswordForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Réinitialisation en cours...';

    try {
        // Mettre à jour le mot de passe
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            console.error('Reset password error:', error);
            showError(error.message || 'Erreur lors de la réinitialisation du mot de passe');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Réinitialiser le mot de passe';
            return;
        }

        // Succès
        showSuccess('✅ Mot de passe réinitialisé avec succès ! Redirection...');

        // Déconnecter l'utilisateur pour qu'il se reconnecte avec le nouveau mot de passe
        await supabase.auth.signOut();

        // Rediriger vers la page de connexion après 2 secondes
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);

    } catch (error) {
        console.error('Reset password error:', error);
        showError('Erreur lors de la réinitialisation du mot de passe');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Réinitialiser le mot de passe';
    }
});

// Vérifier si l'utilisateur a un token de réinitialisation valide
const checkResetToken = async () => {
    try {
        // Récupérer la session depuis l'URL (hash fragment)
        const { data: { session }, error } = await supabase.auth.getSession();

        console.log('Session check:', { session, error });

        if (error) {
            console.error('Session error:', error);
            showError('Erreur lors de la vérification du lien');
            return;
        }

        if (!session) {
            // Vérifier si on a des fragments dans l'URL
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');
            const type = hashParams.get('type');

            console.log('Hash params:', { accessToken: !!accessToken, refreshToken: !!refreshToken, type });

            if (type === 'recovery' && accessToken) {
                // Le token est dans l'URL, Supabase devrait le gérer automatiquement
                console.log('Recovery token found in URL');
                // Attendre un peu que Supabase traite le token
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Revérifier la session
                const { data: { session: newSession } } = await supabase.auth.getSession();
                if (!newSession) {
                    showError('Lien de réinitialisation invalide ou expiré');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 3000);
                }
            } else {
                showError('Lien de réinitialisation invalide ou expiré');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 3000);
            }
        }
    } catch (error) {
        console.error('Token check error:', error);
        showError('Erreur lors de la vérification du lien');
    }
};

// Vérifier le token au chargement
checkResetToken();
