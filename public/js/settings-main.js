// ================================================
// SETTINGS PAGE - Main Script
// ================================================

import { checkAuth, getUserProfile, updateUserProfile, changePassword, deleteAccount, logout } from './app.js';
import { escapeHtml, showSuccess, showError } from './dashboard-utils.js';
import { translatePage, changeLanguage } from './translation-service.js';
import { countries } from './countries.js';
import { attachPhoneFormatter } from './phone-formatter.js';
import { initNavbar } from './navbar-component.js';
import { initThemeSystem, setTheme } from './theme-manager.js';
import { initWeatherWidget, refreshWeatherLocation } from './weather.js';
import { initLanguageSwitcher } from './language-switcher.js';
import { showPageLoader, hidePageLoader, navigateWithLoader } from './page-loader.js';
import { initRippleButtons } from './micro-interactions.js';
import { initIconReplacement } from './icon-replacer.js';

// Détecter Chrome iOS (problèmes de performance avec modules lourds)
const isChromeIOS = /CriOS/i.test(navigator.userAgent);
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Lazy load modules lourds uniquement si pas Chrome iOS
let userIntelligence = null;
let initUniversalSearchBar = null;

if (!isChromeIOS) {
    // Import conditionnel des modules lourds
    import('./user-intelligence-system.js').then(module => {
        userIntelligence = module.userIntelligence;
        window.userIntelligence = userIntelligence;
    }).catch(err => console.warn('User intelligence system disabled:', err));

    import('./search-bar-universal.js').then(module => {
        initUniversalSearchBar = module.initUniversalSearchBar;
        // Initialiser après un délai pour éviter le freeze
        setTimeout(() => {
            if (initUniversalSearchBar) initUniversalSearchBar();
        }, 2000);
    }).catch(err => console.warn('Search bar disabled:', err));
} else {
    console.log('⚡ Chrome iOS détecté - Mode optimisé activé');
}

// Initialize navbar component
initNavbar('div.mobile-overlay', { showSettingsNav: true });

// Replace icons8 with Flowbite SVG icons
initIconReplacement();

// Initialize ripple effect EARLY - avant tous les autres listeners
initRippleButtons();

// Initialize theme system and weather widget after navbar is rendered
// Simplifier pour Chrome iOS (pas de double requestAnimationFrame)
const initUIComponents = () => {
    initThemeSystem();
    initWeatherWidget();
    initLanguageSwitcher();
};

if (isChromeIOS || isMobile) {
    // Chrome iOS / Mobile : init directe sans RAF
    setTimeout(initUIComponents, 100);
} else {
    // Desktop : double RAF pour garantir le DOM
    requestAnimationFrame(() => {
        requestAnimationFrame(initUIComponents);
    });
}


// Vérifier l'authentification
const isAuth = checkAuth();
if (!isAuth) {
    navigateWithLoader('index.html');
}

// Variable globale pour stocker l'avatar
let currentAvatarUrl = null;

// ================================================
// PREFERENCES MANAGEMENT
// ================================================
let userPreferences = {
    followed_categories: [],
    preferred_countries: []
};

// Load user feed preferences
const loadUserPreferences = async () => {
    try {
        const session = JSON.parse(localStorage.getItem('session'));
        if (!session || !session.access_token) {
            console.warn('No session found for preferences');
            return;
        }

        const response = await fetch('/api/user/feed-preferences', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load preferences');
        }

        const data = await response.json();
        userPreferences.followed_categories = data.followed_categories || [];
        userPreferences.preferred_countries = data.preferred_countries || [];

        console.log('✅ Preferences loaded:', userPreferences);

        // Update UI
        updatePreferencesUI();

    } catch (error) {
        console.error('Error loading preferences:', error);
    }
};

// Update preferences UI
const updatePreferencesUI = () => {
    // Update category switches
    document.querySelectorAll('[data-category-switch]').forEach(switchInput => {
        const category = switchInput.dataset.categorySwitch;
        switchInput.checked = userPreferences.followed_categories.includes(category);
    });

    // Update country switches
    document.querySelectorAll('[data-country-switch]').forEach(switchInput => {
        const country = switchInput.dataset.countrySwitch;
        switchInput.checked = userPreferences.preferred_countries.includes(country);
    });
};

// Toggle category preference
const toggleCategoryPreference = (category) => {
    const index = userPreferences.followed_categories.indexOf(category);
    if (index > -1) {
        userPreferences.followed_categories.splice(index, 1);
    } else {
        userPreferences.followed_categories.push(category);
    }
    updatePreferencesUI();
};

// Toggle country preference
const toggleCountryPreference = (country) => {
    const index = userPreferences.preferred_countries.indexOf(country);
    if (index > -1) {
        userPreferences.preferred_countries.splice(index, 1);
    } else {
        userPreferences.preferred_countries.push(country);
    }
    updatePreferencesUI();
};

// Save preferences
const savePreferences = async () => {
    try {
        const session = JSON.parse(localStorage.getItem('session'));
        if (!session || !session.access_token) {
            showError('Session expirée. Veuillez vous reconnecter.');
            return;
        }

        const response = await fetch('/api/user/feed-preferences', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                followed_categories: userPreferences.followed_categories,
                preferred_countries: userPreferences.preferred_countries
            })
        });

        if (!response.ok) {
            throw new Error('Failed to save preferences');
        }

        showSuccess('Préférences enregistrées avec succès');
        console.log('✅ Preferences saved');

    } catch (error) {
        console.error('Error saving preferences:', error);
        showError('Échec de la sauvegarde des préférences');
    }
};

// Event listeners for preference switches - Auto-save on toggle
document.querySelectorAll('[data-category-switch]').forEach(switchInput => {
    switchInput.addEventListener('change', async () => {
        const category = switchInput.dataset.categorySwitch;
        toggleCategoryPreference(category);
        await savePreferences();
    });
});

document.querySelectorAll('[data-country-switch]').forEach(switchInput => {
    switchInput.addEventListener('change', async () => {
        const country = switchInput.dataset.countrySwitch;
        toggleCountryPreference(country);
        await savePreferences();
    });
});

// Populer le select des pays
const countrySelect = document.getElementById('countrySelect');
countries.forEach(country => {
    const option = document.createElement('option');
    option.value = country.name;
    option.textContent = `${country.emoji} ${country.name}`;
    countrySelect.appendChild(option);
});

// Populer le select des codes téléphoniques depuis countries.js
const phoneCountryCodeSelect = document.getElementById('phoneCountryCode');
const phoneInput = document.getElementById('phoneInput');
if (phoneCountryCodeSelect) {
    // Vider les options existantes
    phoneCountryCodeSelect.innerHTML = '';
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.dial_code;
        option.textContent = `${country.emoji} ${country.dial_code}`;
        phoneCountryCodeSelect.appendChild(option);
    });
    // Sélectionner +33 (France) par défaut
    phoneCountryCodeSelect.value = '+33';

    // Attach phone number formatter
    if (phoneInput) {
        attachPhoneFormatter(phoneInput, phoneCountryCodeSelect);
    }
}

// Charger le profil utilisateur
const loadProfile = async () => {
    const result = await getUserProfile();
    if (result.success) {
        const profile = result.profile;
        console.log('📂 Profil chargé depuis la base:', profile);
        const displayName = profile.display_name || `${profile.first_name} ${profile.last_name}`.trim() || profile.email.split('@')[0];
        const userRole = profile.role || 'user';

        // Navbar role badge
        const navUserRole = document.getElementById('navUserRole');

        if (navUserRole) {
            if (userRole === 'admin') {
                navUserRole.textContent = 'Connecté en tant qu\'admin';
                navUserRole.className = 'user-role-badge admin';
            } else {
                navUserRole.textContent = `Connecté en tant que ${escapeHtml(displayName)}`;
                navUserRole.className = 'user-role-badge user';
            }
        }

        // Timestamps
        const accountCreatedEl = document.getElementById('accountCreatedAt');
        const accountUpdatedEl = document.getElementById('accountUpdatedAt');

        if (profile.created_at) {
            const createdDate = new Date(profile.created_at);
            const createdText = createdDate.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
            accountCreatedEl.textContent = `Compte créé le ${createdText}`;
        } else {
            accountCreatedEl.style.display = 'none';
        }

        if (profile.updated_at && profile.updated_at !== profile.created_at) {
            const updatedDate = new Date(profile.updated_at);
            const updatedText = updatedDate.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
            accountUpdatedEl.textContent = `Mis à jour le ${updatedText}`;
        } else {
            // Masquer si pas de updated_at ou identique à created_at
            accountUpdatedEl.style.display = 'none';
            document.querySelector('.meta-separator')?.remove();
        }

        // Email (toujours présent)
        document.getElementById('emailDisplay').value = profile.email;

        // Avatar
        if (profile.avatar_url) {
            currentAvatarUrl = profile.avatar_url;
            document.getElementById('avatarImage').src = profile.avatar_url;
        } else {
            // Avatar par défaut avec initiales
            const displayName = profile.display_name || `${profile.first_name} ${profile.last_name}`.trim() || profile.email.split('@')[0];
            document.getElementById('avatarImage').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3ecf8e&color=fff&size=200`;
        }

        // Champs obligatoires
        document.getElementById('firstNameInput').value = profile.first_name || '';
        document.getElementById('lastNameInput').value = profile.last_name || '';

        // Country - s'assurer que la valeur existe dans le select
        const countryValue = profile.country || 'France';
        console.log('🌍 Pays depuis la base:', countryValue);
        const countryOptions = Array.from(countrySelect.options);
        const countryExists = countryOptions.some(opt => opt.value === countryValue);
        console.log('✅ Pays existe dans le select?', countryExists);

        if (countryExists) {
            countrySelect.value = countryValue;
            console.log('✅ Pays sélectionné:', countrySelect.value);
        } else {
            console.warn(`⚠️ Pays "${countryValue}" non trouvé dans la liste, utilisation de France par défaut`);
            countrySelect.value = 'France';
        }

        const cityValue = profile.city || '';
        console.log('🏙️ Ville depuis la base:', cityValue);
        document.getElementById('cityInput').value = cityValue;

        // Champs optionnels - Téléphone
        if (profile.phone && profile.phone.trim() !== '') {
            console.log('📞 Téléphone depuis la base:', profile.phone);
            // Séparer l'indicatif du numéro
            const phoneMatch = profile.phone.match(/^(\+\d+)\s*(.+)$/);
            if (phoneMatch) {
                const indicatif = phoneMatch[1];
                const numero = phoneMatch[2];
                console.log('📞 Indicatif:', indicatif, 'Numéro:', numero);

                // Vérifier si l'indicatif existe dans le select
                const phoneCodeSelect = document.getElementById('phoneCountryCode');
                const codeExists = Array.from(phoneCodeSelect.options).some(opt => opt.value === indicatif);

                if (codeExists) {
                    phoneCodeSelect.value = indicatif;
                    console.log('✅ Indicatif sélectionné:', phoneCodeSelect.value);
                } else {
                    console.warn(`⚠️ Indicatif "${indicatif}" non trouvé, utilisation de +33 par défaut`);
                    phoneCodeSelect.value = '+33';
                }

                document.getElementById('phoneInput').value = numero;
                console.log('✅ Numéro chargé:', numero);
            } else {
                // Format de téléphone invalide, mettre le numéro complet dans le champ
                console.warn('⚠️ Format téléphone invalide, mise du numéro complet');
                document.getElementById('phoneInput').value = profile.phone;
            }
        }

        if (profile.bio) {
            const bioInput = document.getElementById('bioInput');
            if (bioInput) {
                bioInput.value = profile.bio;
                const bioCount = document.getElementById('bioCount');
                if (bioCount) {
                    bioCount.textContent = profile.bio.length;
                }
            }
        }

        // Valider le formulaire après chargement
        validateForm();
    }
};

// Gestion de l'upload d'avatar
const avatarPreview = document.getElementById('avatarPreview');
const avatarInput = document.getElementById('avatarInput');
const avatarImage = document.getElementById('avatarImage');
const uploadAvatarBtn = document.getElementById('uploadAvatarBtn');
const removeAvatarBtn = document.getElementById('removeAvatarBtn');

// Compteur de caractères pour la bio (si présent)
const bioInput = document.getElementById('bioInput');
const bioCount = document.getElementById('bioCount');
if (bioInput && bioCount) {
    bioInput.addEventListener('input', () => {
        bioCount.textContent = bioInput.value.length;
    });
}

// Validation en temps réel et activation/désactivation du bouton
const updateProfileBtn = document.getElementById('updateProfileBtn');
const validateForm = () => {
    const firstName = document.getElementById('firstNameInput').value.trim();
    const lastName = document.getElementById('lastNameInput').value.trim();
    const country = document.getElementById('countrySelect').value;
    const city = document.getElementById('cityInput').value.trim();

    const isValid = firstName && lastName && country && city;

    if (isValid) {
        updateProfileBtn.disabled = false;
    } else {
        updateProfileBtn.disabled = true;
    }
};

// Écouter les changements sur les champs obligatoires
document.getElementById('firstNameInput').addEventListener('input', validateForm);
document.getElementById('lastNameInput').addEventListener('input', validateForm);
document.getElementById('countrySelect').addEventListener('change', validateForm);
document.getElementById('cityInput').addEventListener('input', validateForm);

// Bouton "Changer la photo"
uploadAvatarBtn.addEventListener('click', () => {
    avatarInput.click();
});

// Cliquer sur l'avatar ouvre aussi le sélecteur
avatarPreview.addEventListener('click', () => {
    avatarInput.click();
});

// Bouton "Supprimer la photo"
removeAvatarBtn.addEventListener('click', () => {
    currentAvatarUrl = null;
    const firstName = document.getElementById('firstNameInput').value || 'User';
    const lastName = document.getElementById('lastNameInput').value || '';
    const displayName = `${firstName} ${lastName}`.trim() || firstName;
    avatarImage.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3b82f6&color=fff&size=200`;
    showSuccess('Photo supprimée (cliquez sur "Mettre à jour" pour sauvegarder)');
});

// Bouton "Générer avatar"
document.getElementById('generateAvatarBtn').addEventListener('click', async () => {
    const btn = document.getElementById('generateAvatarBtn');
    const btnText = btn.querySelector('.btn-text');

    try {
        // Ajouter le spinner
        btn.classList.add('loading');
        btn.disabled = true;

        // Créer le spinner
        const spinner = document.createElement('span');
        spinner.className = 'btn-spinner';
        btn.insertBefore(spinner, btnText);

        // Générer un seed aléatoire pour un avatar unique
        const seed = Math.random().toString(36).substring(2, 15);

        // Styles disponibles de DiceBear (avatars géométriques/abstraits)
        const styles = [
            'adventurer',
            'adventurer-neutral',
            'avataaars',
            'big-ears',
            'big-smile',
            'bottts',
            'croodles',
            'fun-emoji',
            'icons',
            'identicon',
            'initials',
            'lorelei',
            'micah',
            'miniavs',
            'personas',
            'pixel-art',
            'shapes',
            'thumbs'
        ];

        const randomStyle = styles[Math.floor(Math.random() * styles.length)];

        // Générer l'URL de l'avatar SVG depuis DiceBear
        const avatarUrl = `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${seed}&size=200`;

        // Charger l'image SVG et la convertir en JPEG
        const response = await fetch(avatarUrl);
        const svgBlob = await response.blob();

        // Créer une URL temporaire pour le blob SVG
        const svgUrl = URL.createObjectURL(svgBlob);

        // Créer une image pour charger le SVG
        const img = new Image();
        img.crossOrigin = 'anonymous';

        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = svgUrl;
        });

        // Convertir le SVG en canvas JPEG
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');

        // Fond blanc pour le JPEG
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 200, 200);

        // Dessiner l'image SVG
        ctx.drawImage(img, 0, 0, 200, 200);

        // Convertir en base64 JPEG
        const jpegBase64 = canvas.toDataURL('image/jpeg', 0.9);

        // Libérer l'URL temporaire
        URL.revokeObjectURL(svgUrl);

        // Mettre à jour l'avatar
        avatarImage.src = jpegBase64;
        currentAvatarUrl = jpegBase64;

        const sizeKB = Math.round((jpegBase64.length * 0.75) / 1024);
        showSuccess(`Avatar généré (${sizeKB} KB) ! Cliquez sur "Enregistrer" pour sauvegarder`);

    } catch (error) {
        console.error('Erreur lors de la génération de l\'avatar:', error);
        showError('Erreur lors de la génération de l\'avatar. Veuillez réessayer.');
    } finally {
        // Retirer le spinner
        const spinner = btn.querySelector('.btn-spinner');
        if (spinner) {
            spinner.remove();
        }
        btn.classList.remove('loading');
        btn.disabled = false;
    }
});

// Fonction pour compresser l'image (accepte photos lourdes, compresse intelligemment)
const compressImage = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Taille cible : 600x600 pour un bon compromis qualité/poids
                const MAX_SIZE = 600;
                let width = img.width;
                let height = img.height;

                // Calculer les nouvelles dimensions en gardant le ratio
                if (width > height) {
                    if (width > MAX_SIZE) {
                        height = Math.round((height * MAX_SIZE) / width);
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width = Math.round((width * MAX_SIZE) / height);
                        height = MAX_SIZE;
                    }
                }

                // Créer un canvas pour redimensionner
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');

                // Améliorer la qualité du rendu
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                // Dessiner l'image
                ctx.drawImage(img, 0, 0, width, height);

                // Compression progressive : essayer différentes qualités pour viser ~200 KB max
                let quality = 0.90;
                let compressedBase64 = canvas.toDataURL('image/jpeg', quality);

                // Si trop gros, réduire la qualité progressivement
                while (compressedBase64.length > 250000 && quality > 0.70) {
                    quality -= 0.05;
                    compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                }

                resolve(compressedBase64);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// Gérer la sélection d'image
avatarInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation: type d'image
    if (!file.type.startsWith('image/')) {
        showError('Veuillez sélectionner une image valide');
        return;
    }

    // Validation: taille max 10MB (photos iPhone supportées)
    const maxSize = 10 * 1024 * 1024; // 10MB en bytes
    if (file.size > maxSize) {
        showError('L\'image ne doit pas dépasser 10 MB');
        return;
    }

    try {
        // Compresser l'image
        const compressedBase64 = await compressImage(file);

        // Prévisualisation locale
        avatarImage.src = compressedBase64;
        currentAvatarUrl = compressedBase64;

        const sizeKB = Math.round((compressedBase64.length * 0.75) / 1024);
        showSuccess(`Image compressée (${sizeKB} KB) ! Cliquez sur "Mettre à jour le profil" pour sauvegarder`);
    } catch (error) {
        showError('Erreur lors de la compression de l\'image');
        console.error(error);
    }
});

// Mettre à jour le profil
updateProfileBtn.addEventListener('click', async () => {
    const firstName = document.getElementById('firstNameInput').value.trim();
    const lastName = document.getElementById('lastNameInput').value.trim();
    const country = document.getElementById('countrySelect').value;
    const city = document.getElementById('cityInput').value.trim();
    const phoneNumber = document.getElementById('phoneInput').value.trim();
    const phoneCode = document.getElementById('phoneCountryCode').value;
    const phone = phoneNumber ? `${phoneCode} ${phoneNumber}` : '';
    const bioInput = document.getElementById('bioInput');
    const bio = bioInput ? bioInput.value.trim() : '';

    // Validations (déjà faites par le bouton, mais double-check)
    if (!firstName || !lastName || !country || !city) {
        showError('Veuillez remplir tous les champs obligatoires (Prénom, Nom, Pays, Ville)');
        return;
    }

    // Construire l'objet avec seulement les champs nécessaires
    const profileData = {
        first_name: firstName,
        last_name: lastName,
        country,
        city
    };

    // Ajouter les champs optionnels seulement s'ils sont remplis
    if (phone) {
        profileData.phone = phone;
    }
    if (bio) {
        profileData.bio = bio;
    }
    // Avatar peut être null (pour supprimer) ou une URL/base64
    profileData.avatar_url = currentAvatarUrl;

    const result = await updateUserProfile(profileData);

    if (result.success) {
        showSuccess('Profil mis à jour avec succès !');
        // Mettre à jour l'avatar dans le burger menu
        if (currentAvatarUrl) {
            document.getElementById('burgerAvatarImage').src = currentAvatarUrl;
        }

        // Recharger l'audit de sécurité pour afficher le nouvel événement
        setTimeout(() => loadSecurityAudit(), 500);
    } else {
        showError(result.error || 'Erreur lors de la mise à jour');
    }
});

// Changer le mot de passe
document.getElementById('changePasswordBtn').addEventListener('click', async () => {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validation du mot de passe actuel
    if (!currentPassword || currentPassword.trim() === '') {
        showError('Veuillez saisir votre mot de passe actuel');
        return;
    }

    if (!newPassword || !confirmPassword) {
        showError('Veuillez remplir le nouveau mot de passe et sa confirmation');
        return;
    }

    if (newPassword.length < 12) {
        showError('Le mot de passe doit contenir au moins 12 caractères');
        return;
    }

    if (newPassword !== confirmPassword) {
        showError('Les mots de passe ne correspondent pas');
        return;
    }

    const result = await changePassword(newPassword, currentPassword);

    if (result.success) {
        showSuccess('Mot de passe changé avec succès ! Reconnexion requise...');

        // Recharger l'audit de sécurité pour afficher le nouvel événement
        setTimeout(() => loadSecurityAudit(), 500);

        // Déconnecter et rediriger vers la page de login
        setTimeout(() => {
            localStorage.removeItem('session');
            navigateWithLoader('index.html?passwordChanged=true');
        }, 2000);
    } else {
        showError(result.error || 'Erreur lors du changement de mot de passe');

        // Recharger l'audit pour afficher l'événement d'échec (même password, etc.)
        setTimeout(() => loadSecurityAudit(), 500);
    }
});

// Modal de suppression de compte
const deleteAccountModal = document.getElementById('deleteAccountModal');
const closeDeleteModal = document.getElementById('closeDeleteModal');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const deleteAccountError = document.getElementById('deleteAccountError');

// Ouvrir la modal de suppression
document.getElementById('deleteAccountBtn').addEventListener('click', () => {
    deleteAccountModal.classList.add('show');
    deleteAccountError.style.display = 'none';
});

// Fermer la modal - bouton X
closeDeleteModal.addEventListener('click', () => {
    deleteAccountModal.classList.remove('show');
});

// Fermer la modal - bouton Annuler
cancelDeleteBtn.addEventListener('click', () => {
    deleteAccountModal.classList.remove('show');
});

// Fermer la modal - clic sur l'overlay
deleteAccountModal.addEventListener('click', (e) => {
    if (e.target === deleteAccountModal) {
        deleteAccountModal.classList.remove('show');
    }
});

// Confirmer la suppression
confirmDeleteBtn.addEventListener('click', async () => {
    // Désactiver le bouton pendant le traitement
    confirmDeleteBtn.disabled = true;
    confirmDeleteBtn.textContent = '⏳ Suppression en cours...';

    // ✅ Track account deletion attempt BEFORE deleting
    if (userIntelligence) {
        await userIntelligence.logActivity('account_deletion_attempt', {
            timestamp: new Date().toISOString()
        }).catch(err => console.error('Error logging deletion attempt:', err));
    }

    const result = await deleteAccount();

    if (result.success) {
        deleteAccountModal.classList.remove('show');
        showSuccess('✅ Compte supprimé avec succès');
        setTimeout(() => {
            navigateWithLoader('index.html');
        }, 1500);
    } else {
        deleteAccountError.textContent = result.error || 'Erreur lors de la suppression';
        deleteAccountError.style.display = 'block';
        confirmDeleteBtn.disabled = false;
        confirmDeleteBtn.textContent = '🗑️ Supprimer définitivement';

        // ✅ Track failed deletion attempt
        if (userIntelligence) {
            userIntelligence.logActivity('account_deletion_failed', {
                error: result.error,
                timestamp: new Date().toISOString()
            }).catch(err => console.error('Error logging failed deletion:', err));
        }
    }
});

// Gérer le burger menu
const burgerBtn = document.getElementById('burgerBtn');
const burgerMenu = document.getElementById('burgerMenu');

// Initialiser AVANT d'attacher les event listeners
let burgerInitialized = true;

burgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    burgerBtn.classList.toggle('active');
    burgerMenu.classList.toggle('show');
});

// Fermer le menu si on clique ailleurs
document.addEventListener('click', () => {
    burgerBtn.classList.remove('active');
    burgerMenu.classList.remove('show');
});

// Empêcher la fermeture si on clique dans le menu
burgerMenu.addEventListener('click', (e) => {
    e.stopPropagation();
});

// ================================================
// WEATHER WIDGET
// ================================================

const weatherWidget = document.getElementById('weatherWidget');

const getWeatherIcon = (weatherCode) => {
    // WMO Weather codes: https://open-meteo.com/en/docs
    if (weatherCode === 0) return '🌤️'; // Clear sky
    if (weatherCode <= 3) return '⛅'; // Partly cloudy
    if (weatherCode <= 48) return '🌫️'; // Fog
    if (weatherCode <= 67) return '🌫️'; // Rain
    if (weatherCode <= 77) return '🌫️'; // Snow
    if (weatherCode <= 82) return '🌫️'; // Showers
    if (weatherCode <= 99) return '⛈️'; // Thunderstorm
    return '🌤️';
};

const fetchWeather = async (lat, lon) => {
    try {
        // AbortController pour timeout de 5 secondes
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`,
            { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        const data = await response.json();

        const temp = Math.round(data.current.temperature_2m);
        const weatherCode = data.current.weather_code;
        const icon = getWeatherIcon(weatherCode);

        // Get city name from reverse geocoding using Nominatim (OpenStreetMap)
        const geoController = new AbortController();
        const geoTimeoutId = setTimeout(() => geoController.abort(), 5000);

        const geoResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=fr`,
            { signal: geoController.signal }
        );
        clearTimeout(geoTimeoutId);

        const geoData = await geoResponse.json();
        const city = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.state || 'Votre position';

        weatherWidget.innerHTML = `
            <div class="weather-info">
                <span class="weather-icon">${icon}</span>
                <div class="weather-details">
                    <span class="weather-temp">${temp}°C</span>
                    <span class="weather-city">${city}</span>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Erreur météo:', error);
        weatherWidget.innerHTML = `
            <div class="weather-error">
                <span>🌫️</span>
            </div>
        `;
    }
};

const loadWeather = () => {
    // Check if geolocation is available in localStorage
    const savedLat = localStorage.getItem('weatherLat');
    const savedLon = localStorage.getItem('weatherLon');

    if (savedLat && savedLon) {
        fetchWeather(parseFloat(savedLat), parseFloat(savedLon));
    } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                localStorage.setItem('weatherLat', lat);
                localStorage.setItem('weatherLon', lon);
                fetchWeather(lat, lon);
            },
            (error) => {
                console.log('Géolocalisation refusée, utilisation de Paris par défaut');
                // Afficher un message à l'utilisateur
                weatherWidget.innerHTML = `
                    <div class="weather-info" style="opacity: 0.7;">
                        <span class="weather-icon">☀️</span>
                        <div class="weather-details">
                            <div class="weather-temp" style="font-size: 0.875rem;">Position par défaut</div>
                            <div class="weather-location" style="font-size: 0.75rem;">Géolocalisation désactivée</div>
                        </div>
                    </div>
                `;
                // Puis charger météo Paris après 2s
                setTimeout(() => {
                    fetchWeather(48.8566, 2.3522); // Paris par défaut
                }, 2000);
            }
        );
    } else {
        // Paris par défaut si pas de géolocalisation
        fetchWeather(48.8566, 2.3522);
    }
};

// Load weather on page load
loadWeather();

// Refresh weather every 10 minutes
setInterval(loadWeather, 10 * 60 * 1000);

// ================================================
// ACCOUNT SETTINGS
// ================================================

// Load current preferences in Account section
const languageSelect = document.getElementById('languageSelect');
const themeSelect = document.getElementById('themeSelect');

const savedThemeForSelect = localStorage.getItem('theme') || 'light';
const savedLangForSelect = localStorage.getItem('language') || 'fr';

themeSelect.value = savedThemeForSelect;
languageSelect.value = savedLangForSelect;

// Save account preferences button
document.getElementById('saveAccountBtn').addEventListener('click', async () => {
    const newTheme = themeSelect.value;
    const newLang = languageSelect.value;

    // Apply theme using centralized service
    setTheme(newTheme);

    // Apply language
    localStorage.setItem('language', newLang);

    // Traduire d'abord
    await translatePage();

    showSuccess('Préférences enregistrées avec succès !');
});

// Theme and language are now managed by their respective modules

// Bouton Dashboard
document.getElementById('dashboardBtn').addEventListener('click', () => {
    navigateWithLoader('dashboard.html');
});

// Bouton Logout (burger menu)
document.getElementById('logoutBtn').addEventListener('click', () => {
    logout();
});

// Bouton Logout (sidebar)
const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
if (sidebarLogoutBtn) {
    sidebarLogoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
}

// ================================================
// MENU MOBILE - Gestion settings nav responsive
// ================================================
const mobileSettingsNavBtn = document.getElementById('mobileSettingsNavBtn');
const mobileOverlay = document.getElementById('mobileOverlay');
const settingsNav = document.querySelector('.vertical-sidebar');

// Fonction pour fermer le menu settings mobile
const closeSettingsMobileMenu = () => {
    if (settingsNav) {
        settingsNav.classList.remove('mobile-open');
    }
    if (mobileOverlay) {
        mobileOverlay.classList.remove('show');
    }
    document.body.style.overflow = ''; // Réactiver scroll
};

// Fonction pour ouvrir le menu settings mobile
const openSettingsMobileMenu = () => {
    if (settingsNav) {
        settingsNav.classList.add('mobile-open');
    }
    if (mobileOverlay) {
        mobileOverlay.classList.add('show');
    }
    document.body.style.overflow = 'hidden'; // Empêcher scroll background
};

// Toggle menu avec le bouton burger
if (mobileSettingsNavBtn && settingsNav) {
    mobileSettingsNavBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (settingsNav.classList.contains('mobile-open')) {
            closeSettingsMobileMenu();
        } else {
            openSettingsMobileMenu();
        }
    });

    // Support touch events pour iOS
    mobileSettingsNavBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        mobileSettingsNavBtn.click();
    }, { passive: false });
}

// Fermer avec overlay (click et touch)
if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeSettingsMobileMenu);
    mobileOverlay.addEventListener('touchend', (e) => {
        e.preventDefault();
        closeSettingsMobileMenu();
    }, { passive: false });
}

// Fermer nav après sélection section sur mobile
document.querySelectorAll('.settings-nav-item').forEach(item => {
    item.addEventListener('click', () => {
        if (window.innerWidth <= 1024) {
            setTimeout(closeSettingsMobileMenu, 100); // Petit délai pour UX
        }
    });
});

// Fermer avec touche Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && settingsNav && settingsNav.classList.contains('mobile-open')) {
        closeSettingsMobileMenu();
    }
});

// ================================================
// SIDEBAR TOGGLE - Collapsible functionality
// ================================================
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.querySelector('.vertical-sidebar');

// Load saved state from localStorage (par défaut: ouvert)
const isSidebarClosed = localStorage.getItem('vertical_sidebar_closed') === 'true';
if (isSidebarClosed && sidebar) {
    sidebar.classList.add('closed');
}

// Toggle sidebar on button click
if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        sidebar.classList.toggle('closed');

        // Save state to localStorage
        const isClosed = sidebar.classList.contains('closed');
        localStorage.setItem('vertical_sidebar_closed', isClosed);

        console.log(`🔄 Sidebar ${isClosed ? 'fermée (2px)' : 'ouverte (250px)'}`);
    });
}

// Charger le nom utilisateur pour le burger
const loadUserName = async () => {
    const result = await getUserProfile();
    if (result.success) {
        const displayName = result.profile.display_name || `${result.profile.first_name} ${result.profile.last_name}`.trim() || result.profile.email.split('@')[0];
        document.getElementById('userNameDisplay').textContent = `User: ${escapeHtml(displayName)}`;

        // Charger l'avatar dans le burger
        if (result.profile.avatar_url) {
            document.getElementById('burgerAvatarImage').src = result.profile.avatar_url;
        } else {
            document.getElementById('burgerAvatarImage').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3ecf8e&color=fff&size=72`;
        }
    }
};

// ================================================
// SETTINGS NAVIGATION
// ================================================

// Get all navigation items and sections
const navItems = document.querySelectorAll('.settings-nav-item');
const sections = document.querySelectorAll('.settings-section');
const usersNavBtn = document.getElementById('usersNavBtn');
const usersSection = document.getElementById('section-users');

// Handle section switching
navItems.forEach(item => {
    item.addEventListener('click', () => {
        const sectionId = item.dataset.section;

        // Remove active class from all nav items
        navItems.forEach(nav => nav.classList.remove('active'));

        // Add active class to clicked item
        item.classList.add('active');

        // Hide all sections
        sections.forEach(section => section.classList.remove('active'));

        // Show selected section
        const targetSection = document.getElementById(`section-${sectionId}`);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    });
});

// Handle section switching from VERTICAL SIDEBAR
const sidebarLinks = document.querySelectorAll('.sidebar-menu-link[data-section]');

function switchToSection(sectionId) {
    // Remove active class from all sidebar links
    sidebarLinks.forEach(l => l.classList.remove('active'));

    // Add active class to clicked item
    const activeLink = document.querySelector(`.sidebar-menu-link[data-section="${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    // Hide all sections
    sections.forEach(section => section.classList.remove('active'));

    // Show selected section
    const targetSection = document.getElementById(`section-${sectionId}`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Update URL hash
    window.location.hash = sectionId;
}

sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.dataset.section;
        switchToSection(sectionId);
    });
});

// Handle URL hash on page load and hash change
function handleHashChange() {
    const hash = window.location.hash.substring(1); // Remove #
    if (hash && document.getElementById(`section-${hash}`)) {
        switchToSection(hash);
    }
}

// Listen for hash changes
window.addEventListener('hashchange', handleHashChange);

// Handle hash on page load
if (window.location.hash) {
    handleHashChange();
}

// ================================================
// SECURITY AUDIT
// ================================================

let currentAuditOffset = 0;
let allAuditEvents = [];
const AUDIT_PAGE_SIZE = 20;

const loadSecurityAudit = async (append = false) => {
    const auditContainer = document.getElementById('securityAuditContainer');

    if (!append) {
        // Réinitialiser si on ne fait pas append
        currentAuditOffset = 0;
        allAuditEvents = [];
        auditContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Chargement de l\'audit de sécurité...</p>';
    }

    try {
        // Récupérer le token de session
        const session = JSON.parse(localStorage.getItem('session'));
        if (!session?.access_token) {
            auditContainer.innerHTML = '<p style="text-align: center; color: var(--error);">Session expirée. Veuillez vous reconnecter.</p>';
            return;
        }

        // Appeler l'API security-audit avec limit élevée (on va paginer côté frontend)
        const response = await fetch('/api/user/security-audit?limit=200', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        allAuditEvents = data.events || [];

        // Si aucun événement
        if (allAuditEvents.length === 0) {
            auditContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Aucune activité de sécurité récente</p>';
            return;
        }

        // Afficher seulement les premiers AUDIT_PAGE_SIZE
        renderAuditEvents();

    } catch (error) {
        console.error('Erreur lors du chargement de l\'audit de sécurité:', error);
        auditContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <p style="color: var(--error); margin-bottom: 0.5rem;">❌ Erreur lors du chargement</p>
                <p style="color: var(--text-muted); font-size: 0.875rem;">${escapeHtml(error.message)}</p>
                <button id="retryAuditBtn" class="btn-primary btn-mt-1">
                    🔄 Réessayer
                </button>
            </div>
        `;

        // Attacher l'event listener au bouton retry
        setTimeout(() => {
            const retryBtn = document.getElementById('retryAuditBtn');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => loadSecurityAudit());
            }
        }, 0);
    }
};

const renderAuditEvents = () => {
    const auditContainer = document.getElementById('securityAuditContainer');
    const eventsToShow = allAuditEvents.slice(0, currentAuditOffset + AUDIT_PAGE_SIZE);

    if (eventsToShow.length === 0) {
        auditContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Aucune activité de sécurité récente</p>';
        return;
    }

    // Construire le HTML
    let auditHTML = '<div class="audit-list">';

    eventsToShow.forEach(event => {
            const timestamp = new Date(event.timestamp);
            const formattedDate = timestamp.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Extraire les détails du contexte
            const context = event.context || {};
            const ip = context.ip || event.ip || 'Non disponible';
            const device = event.device || context.device || 'Desktop';

            // Géolocalisation : afficher ville, pays au lieu de l'IP
            let locationDisplay = 'Localisation inconnue';
            if (context.location && (context.location.city || context.location.country)) {
                const parts = [];
                if (context.location.city) parts.push(context.location.city);
                if (context.location.country) parts.push(context.location.country);
                locationDisplay = parts.join(', ');
            } else if (event.location && (event.location.city || event.location.country)) {
                const parts = [];
                if (event.location.city) parts.push(event.location.city);
                if (event.location.country) parts.push(event.location.country);
                locationDisplay = parts.join(', ');
            } else if (ip && ip !== 'Non disponible') {
                locationDisplay = ip; // Afficher l'IP si disponible
            }

            // Convertir platform en label lisible
            let platform = context.platform || event.platform || '';
            if (platform) {
                // Détection OS depuis platform
                if (platform.includes('Win')) {
                    platform = 'Windows';
                } else if (platform.includes('Mac')) {
                    platform = 'macOS';
                } else if (platform.includes('Linux')) {
                    platform = 'Linux';
                } else if (platform.includes('Android')) {
                    platform = 'Android';
                } else if (platform.includes('iPhone') || platform.includes('iPad')) {
                    platform = 'iOS';
                }
            }

            const success = context.success !== undefined ? context.success : true;

            // Créer une description enrichie
            let enrichedDescription = event.description;
            if (event.activityType === 'login' && context.email) {
                enrichedDescription = `Connexion avec ${context.email}`;
            }
            if (event.activityType === 'profile_update' && context.fields_updated) {
                const fields = Array.isArray(context.fields_updated) && context.fields_updated.length > 0
                    ? context.fields_updated.join(', ')
                    : 'profil';
                enrichedDescription = `Mise à jour : ${fields}`;
            }
            if (event.activityType === 'password_change') {
                enrichedDescription = 'Mot de passe modifié avec succès';
            }

            auditHTML += `
                <div class="audit-item">
                    <div class="audit-icon ${event.type}">
                        ${event.icon}
                    </div>
                    <div class="audit-content">
                        <div class="audit-title">${escapeHtml(event.title)}</div>
                        <div class="audit-description">${escapeHtml(enrichedDescription)}</div>
                        <div class="audit-meta">
                            <span>📅 ${formattedDate}</span>
                            <span>📍 ${escapeHtml(locationDisplay)}</span>
                            <span>💻 ${escapeHtml(device)}</span>
                            ${platform ? `<span>🖥️ ${escapeHtml(platform)}</span>` : ''}
                            ${!success ? '<span style="color: var(--error);">⚠️ Échec</span>' : ''}
                        </div>
                    </div>
                    <span class="audit-badge ${event.type}">${escapeHtml(event.type)}</span>
                </div>
            `;
        });

        auditHTML += '</div>';

        // Ajouter bouton "Charger +" si il reste des événements
        if (eventsToShow.length < allAuditEvents.length) {
            auditHTML += `
                <div style="text-align: center; margin-top: 1rem;">
                    <button id="loadMoreAuditBtn" class="btn btn-primary">
                        Charger + (${Math.min(AUDIT_PAGE_SIZE, allAuditEvents.length - eventsToShow.length)} de plus)
                    </button>
                </div>
            `;
        }

        auditContainer.innerHTML = auditHTML;

        // Attacher l'événement au bouton "Charger +"
        if (eventsToShow.length < allAuditEvents.length) {
            document.getElementById('loadMoreAuditBtn').addEventListener('click', () => {
                currentAuditOffset += AUDIT_PAGE_SIZE;
                renderAuditEvents();
            });
        }
};


// ================================================
// ACTIVE SESSIONS
// ================================================

const loadActiveSessions = async () => {
    const sessionsContainer = document.getElementById('activeSessionsContainer');

    sessionsContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Chargement des sessions...</p>';

    try {
        const session = JSON.parse(localStorage.getItem('session'));
        if (!session?.access_token) {
            sessionsContainer.innerHTML = '<p style="text-align: center; color: var(--error);">Session expirée</p>';
            return;
        }

        const response = await fetch('/api/user/active-sessions', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const sessions = data.sessions || [];

        if (sessions.length === 0) {
            sessionsContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Aucune session active</p>';
            return;
        }

        let sessionsHTML = '<div class="sessions-list">';

        sessions.forEach(s => {
            const lastActivity = new Date(s.lastActivity);
            const formattedTime = lastActivity.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });

            let locationDisplay = s.ip;
            if (s.location && (s.location.city || s.location.country)) {
                const parts = [];
                if (s.location.city) parts.push(s.location.city);
                if (s.location.country) parts.push(s.location.country);
                locationDisplay = parts.join(', ');
            }

            const deviceIcon = s.device === 'mobile' ? '📱' : '💻';
            const currentBadge = s.isCurrentSession ? '<span style="color: var(--success); font-size: 0.75rem; font-weight: 500;">● Connexion actuelle</span>' : '';

            sessionsHTML += `
                <div class="session-item ${s.isCurrentSession ? 'current' : ''}">
                    <div class="session-info">
                        <div class="session-device">
                            ${deviceIcon} ${escapeHtml(s.device)} ${currentBadge}
                        </div>
                        <div class="session-location">📍 ${escapeHtml(locationDisplay)}</div>
                        <div class="session-time">Connexion: ${formattedTime}</div>
                    </div>
                </div>
            `;
        });

        sessionsHTML += '</div>';
        sessionsContainer.innerHTML = sessionsHTML;

    } catch (error) {
        console.error('Erreur lors du chargement des sessions:', error);
        sessionsContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <p style="color: var(--error); margin-bottom: 0.5rem;">❌ Erreur lors du chargement</p>
                <button id="retrySessionsBtn" class="btn-primary btn-mt-1">
                    🔄 Réessayer
                </button>
            </div>
        `;

        // Attacher l'event listener au bouton retry
        setTimeout(() => {
            const retryBtn = document.getElementById('retrySessionsBtn');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => loadActiveSessions());
            }
        }, 0);
    }
};

// Déconnecter tous les appareils
document.getElementById('logoutAllDevicesBtn').addEventListener('click', async () => {
    if (!confirm('⚠️ Cela déconnectera TOUS vos appareils (y compris celui-ci). Vous devrez vous reconnecter. Continuer ?')) {
        return;
    }

    try {
        const session = JSON.parse(localStorage.getItem('session'));
        const response = await fetch('/api/user/active-sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ logoutAll: true })
        });

        const data = await response.json();

        if (response.ok) {
            showSuccess('Tous les appareils ont été déconnectés');
            // Déconnecter l'utilisateur actuel et le rediriger
            setTimeout(() => {
                logout();
            }, 1500);
        } else {
            showError(data.error || 'Erreur lors de la déconnexion');
        }
    } catch (error) {
        console.error('Erreur déconnexion:', error);
        showError('Erreur lors de la déconnexion');
    }
});

// Effacer l'historique d'audit
document.getElementById('clearAuditLogsBtn').addEventListener('click', async () => {
    if (!confirm('⚠️ Êtes-vous sûr de vouloir effacer tout l\'historique de sécurité ? Cette action est irréversible.')) {
        return;
    }

    try {
        const session = JSON.parse(localStorage.getItem('session'));
        const response = await fetch('/api/user/activity-log/clear', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            showSuccess('Historique d\'audit effacé');
            // Recharger l'audit après un petit délai
            setTimeout(() => {
                loadSecurityAudit();
                loadActiveSessions();
            }, 1000);
        } else {
            showError(data.error || 'Erreur lors de la suppression');
        }
    } catch (error) {
        console.error('Erreur suppression:', error);
        showError('Erreur lors de la suppression de l\'historique');
    }
});

// Initialiser
(async () => {
    // Afficher le loader pendant le chargement initial
    showPageLoader();

    try {
        await translatePage();
        await loadProfile();
        await loadUserPreferences();
        await loadUserName();
        await loadSecurityAudit();
        await loadActiveSessions();

        console.log('✅ Settings page fully loaded');
    } finally {
        // Masquer le loader une fois tout chargé
        hidePageLoader();
    }
})();
