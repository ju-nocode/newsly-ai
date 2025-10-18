// SÉCURITÉ: Pas d'import direct de Supabase côté client
// Toutes les opérations passent par l'API backend sécurisée

const resetPasswordForm = document.getElementById('resetPasswordForm');
const newPasswordInput = document.getElementById('newPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');
const resetError = document.getElementById('resetError');
const resetSuccess = document.getElementById('resetSuccess');

// Récupérer le token depuis l'URL
let recoveryToken = null;

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

// Extraire le token de l'URL
const extractTokenFromUrl = () => {
    // Le token est dans le hash fragment de l'URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');

    console.log('[DEBUG] URL params:', {
        hasAccessToken: !!accessToken,
        type: type,
        hash: window.location.hash.substring(0, 50) + '...'
    });

    if (type === 'recovery' && accessToken) {
        recoveryToken = accessToken;
        return true;
    }

    return false;
};

// Gérer la soumission du formulaire
resetPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    // Validation côté client
    if (newPassword.length < 8) {
        showError('Le mot de passe doit contenir au moins 8 caractères');
        return;
    }

    if (newPassword.length > 100) {
        showError('Le mot de passe est trop long (maximum 100 caractères)');
        return;
    }

    if (newPassword !== confirmPassword) {
        showError('Les mots de passe ne correspondent pas');
        return;
    }

    if (!recoveryToken) {
        showError('Token de réinitialisation manquant. Veuillez cliquer à nouveau sur le lien dans votre email.');
        return;
    }

    // Désactiver le bouton
    const submitBtn = resetPasswordForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Réinitialisation en cours...';

    try {
        // SÉCURITÉ: Appel à l'API backend (pas d'exposition des clés)
        // Utilise l'API simplifiée avec plus de debug pour diagnostiquer
        const response = await fetch('/api/auth/reset-password-simple', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                accessToken: recoveryToken,
                newPassword: newPassword
            })
        });

        const data = await response.json();

        console.log('[DEBUG] API Response:', {
            status: response.status,
            ok: response.ok,
            data: data
        });

        if (!response.ok) {
            console.error('[ERROR] API returned error:', data);
            showError(data.error || 'Erreur lors de la réinitialisation');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Réinitialiser le mot de passe';
            return;
        }

        // Succès
        showSuccess('✅ Mot de passe réinitialisé avec succès ! Redirection...');

        // Nettoyer le token de l'URL
        window.history.replaceState({}, document.title, window.location.pathname);

        // Rediriger vers la page de connexion après 2 secondes
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);

    } catch (error) {
        console.error('[ERROR] Reset password failed:', error);
        showError('Erreur de connexion au serveur. Veuillez réessayer.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Réinitialiser le mot de passe';
    }
});

// Vérifier le token au chargement de la page
const checkResetToken = () => {
    const hasToken = extractTokenFromUrl();

    if (!hasToken) {
        showError('⚠️ Lien de réinitialisation invalide ou expiré. Veuillez demander un nouveau lien.');

        // Désactiver le formulaire
        newPasswordInput.disabled = true;
        confirmPasswordInput.disabled = true;
        resetPasswordForm.querySelector('button[type="submit"]').disabled = true;

        // Rediriger après 5 secondes
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 5000);
    } else {
        console.log('[INFO] Valid recovery token found');
    }
};

// Vérifier le token au chargement
checkResetToken();
