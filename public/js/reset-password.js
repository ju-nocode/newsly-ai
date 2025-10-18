import { supabase } from './supabase.js';

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

    try {
        // Mettre à jour le mot de passe
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            console.error('Reset password error:', error);
            showError(error.message || 'Erreur lors de la réinitialisation du mot de passe');
            return;
        }

        // Succès
        showSuccess('✅ Mot de passe réinitialisé avec succès !');

        // Rediriger vers la page de connexion après 2 secondes
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);

    } catch (error) {
        console.error('Reset password error:', error);
        showError('Erreur lors de la réinitialisation du mot de passe');
    }
});

// Vérifier si l'utilisateur a un token de réinitialisation valide
const checkResetToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        showError('Lien de réinitialisation invalide ou expiré');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }
};

// Vérifier le token au chargement
checkResetToken();
