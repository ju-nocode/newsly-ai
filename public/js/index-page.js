import { checkAuth, login, signup } from './app.js';
import { translatePage, changeLanguage } from './translation-service.js';
// DÉSACTIVÉ - Conflit avec Aurora et Dark/Light Mode
// import { defaultParticlesConfig } from './particles-config.js';
import { countries } from './countries.js';
import { attachPhoneFormatter } from './phone-formatter.js';
// DÉSACTIVÉ - Import CDN bloque Chrome iOS et n'est pas utilisé
// import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { initThemeSystem } from './theme-manager.js';
import { initWeatherWidget } from './weather.js';

// Détection de confirmation email - Écoute localStorage + BroadcastChannel + Polling
let emailConfirmationInterval = null;
let broadcastChannel = null;

const checkEmailConfirmed = () => {
    const confirmed = localStorage.getItem('emailJustConfirmed');

    if (confirmed === 'true') {
        // Nettoyer le flag
        localStorage.removeItem('emailJustConfirmed');
        localStorage.removeItem('emailJustConfirmedAt');

        // Arrêter le polling
        stopEmailConfirmationPolling();

        // Afficher le succès avec confettis
        showEmailConfirmedModal();
    }
};

const startEmailConfirmationPolling = () => {
    // 1. BroadcastChannel (instantané) - avec fallback Chrome iOS
    try {
        if ('BroadcastChannel' in window) {
            broadcastChannel = new BroadcastChannel('email_confirmation');
            broadcastChannel.onmessage = (event) => {
                if (event.data.type === 'CONFIRMED') {
                    checkEmailConfirmed();
                }
            };
        }
    } catch (e) {
        console.warn('BroadcastChannel non supporté:', e);
    }

    // 2. Storage Event (détecte changements depuis autre onglet)
    window.addEventListener('storage', (e) => {
        if (e.key === 'emailJustConfirmed' && e.newValue === 'true') {
            checkEmailConfirmed();
        }
    });

    // 3. Polling localStorage (backup, toutes les 2 secondes pour éviter surcharge Chrome iOS)
    emailConfirmationInterval = setInterval(() => {
        checkEmailConfirmed();
    }, 2000);
};

const stopEmailConfirmationPolling = () => {
    if (emailConfirmationInterval) {
        clearInterval(emailConfirmationInterval);
        emailConfirmationInterval = null;
    }
    if (broadcastChannel) {
        broadcastChannel.close();
        broadcastChannel = null;
    }
};

// Nettoyer les intervalles lors du déchargement de la page
window.addEventListener('beforeunload', () => {
    stopEmailConfirmationPolling();
});

// Afficher la modal de confirmation email
const showEmailConfirmedModal = () => {
    // Cacher le loader
    const signupLoader = document.getElementById('signupLoader');
    if (signupLoader) {
        signupLoader.classList.remove('active');
    }

    const signupSuccess = document.getElementById('signupSuccess');
    if (!signupSuccess) return;

    // Modifier le contenu du succès pour la confirmation - version simplifiée
    signupSuccess.innerHTML = `
        <div class="success-animation-container">
            <div class="success-checkmark"></div>
            <div class="success-glow"></div>
        </div>
        <h2 class="success-title">Email validé avec succès !</h2>
        <p class="success-subtitle">
            Votre compte est maintenant actif !
        </p>
        <button id="goToLoginBtn" class="btn-success-primary">
            Se connecter maintenant →
        </button>
    `;

    // Afficher le succès
    signupSuccess.classList.add('active');

    // Confettis uniquement quand l'utilisateur revient sur l'onglet
    let confettiPlayed = false;

    const playConfettiOnFocus = () => {
        if (!confettiPlayed && !document.hidden) {
            confettiPlayed = true;
            createConfetti();
            // Retirer l'event listener après la première utilisation
            document.removeEventListener('visibilitychange', playConfettiOnFocus);
        }
    };

    // Si la page est déjà visible (l'utilisateur n'a pas changé d'onglet), jouer immédiatement
    if (!document.hidden) {
        confettiPlayed = true;
        createConfetti();
    } else {
        // Sinon, attendre que l'utilisateur revienne sur l'onglet
        document.addEventListener('visibilitychange', playConfettiOnFocus);
    }

    // Bouton "Se connecter"
    const goToLoginBtn = document.getElementById('goToLoginBtn');
    if (goToLoginBtn) {
        goToLoginBtn.addEventListener('click', () => {
            const signupForm = document.getElementById('signupForm');
            const loginForm = document.getElementById('loginForm');
            if (signupForm) signupForm.style.display = 'none';
            if (loginForm) loginForm.style.display = 'block';
            stopEmailConfirmationPolling();
        });
    }
};

// Détecter Chrome iOS
const isChromeIOS = /CriOS/i.test(navigator.userAgent);

// Si l'utilisateur est déjà connecté, rediriger vers le dashboard
// Sur Chrome iOS, utiliser setTimeout pour éviter freeze au chargement
if (isChromeIOS) {
    setTimeout(() => {
        if (checkAuth()) {
            window.location.href = 'dashboard.html';
        }
    }, 100);
} else {
    if (checkAuth()) {
        window.location.href = 'dashboard.html';
    }
}

// Hide app links in footer when not logged in
const appLinksSection = document.getElementById('appLinksSection');
if (appLinksSection) {
    appLinksSection.style.display = 'none';
}

// Traductions spécifiques à index.html
const indexTranslations = {
    fr: {
        heroTitle: 'Votre NewsWall Personnalisé',
        heroTitleAI: 'Alimenté par l\'IA',
        heroSubtitle: 'Restez informé avec des actualités filtrées intelligemment selon vos centres d\'intérêt. NewslyAI analyse et organise les informations pour vous.',
        heroSignup: 'Commencer Gratuitement',
        heroLogin: 'Se Connecter',
        featuresTitle: 'Pourquoi choisir Newsly AI ?',
        feature1Title: 'Filtrage Intelligent par IA',
        feature1Desc: 'Notre IA analyse et filtre les actualités pour ne vous présenter que l\'essentiel, adapté à vos préférences.',
        feature2Title: 'Personnalisation Avancée',
        feature2Desc: 'Choisissez vos catégories favorites : technologie, business, science, sports et bien plus.',
        feature3Title: 'Mises à jour en Temps Réel',
        feature3Desc: 'Restez toujours à jour avec les dernières actualités rafraîchies en temps réel.',
        feature4Title: 'Sauvegardez vos Favoris',
        feature4Desc: 'Gardez une trace des articles importants et accédez-y à tout moment.',
        feature5Title: 'Sources Multiples',
        feature5Desc: 'Accédez à des milliers de sources d\'information du monde entier, toutes au même endroit.',
        feature6Title: '100% Sécurisé',
        feature6Desc: 'Vos données sont protégées avec les dernières technologies de sécurité.',
        categoriesTitle: 'Explorez nos Catégories',
        cat1Name: 'Général',
        cat1Desc: 'Toutes les actualités importantes',
        cat2Name: 'Business',
        cat2Desc: 'Économie et finance',
        cat3Name: 'Technologie',
        cat3Desc: 'Innovation et tech',
        cat4Name: 'Science',
        cat4Desc: 'Découvertes scientifiques',
        cat5Name: 'Santé',
        cat5Desc: 'Bien-être et médecine',
        cat6Name: 'Sports',
        cat6Desc: 'Résultats et actualités sportives',
        cat7Name: 'Divertissement',
        cat7Desc: 'Cinéma, musique, culture',
        ctaTitle: 'Prêt à commencer ?',
        ctaSubtitle: 'Rejoignez des milliers d\'utilisateurs qui restent informés avec Newsly AI',
        ctaButton: 'Créer mon compte gratuitement',
        footerTagline: 'Votre NewsWall personnalisé alimenté par l\'intelligence artificielle'
    },
    en: {
        heroTitle: 'Your Personalized NewsWall',
        heroTitleAI: 'Powered by AI',
        heroSubtitle: 'Stay informed with intelligently filtered news based on your interests. NewslyAI analyzes and organizes information for you.',
        heroSignup: 'Start Free',
        heroLogin: 'Sign In',
        featuresTitle: 'Why choose Newsly AI?',
        feature1Title: 'Intelligent AI Filtering',
        feature1Desc: 'Our AI analyzes and filters news to present you only the essentials, tailored to your preferences.',
        feature2Title: 'Advanced Personalization',
        feature2Desc: 'Choose your favorite categories: technology, business, science, sports and much more.',
        feature3Title: 'Real-Time Updates',
        feature3Desc: 'Stay always up to date with the latest news refreshed in real time.',
        feature4Title: 'Save Your Favorites',
        feature4Desc: 'Keep track of important articles and access them anytime.',
        feature5Title: 'Multiple Sources',
        feature5Desc: 'Access thousands of news sources from around the world, all in one place.',
        feature6Title: '100% Secure',
        feature6Desc: 'Your data is protected with the latest security technologies.',
        categoriesTitle: 'Explore our Categories',
        cat1Name: 'General',
        cat1Desc: 'All important news',
        cat2Name: 'Business',
        cat2Desc: 'Economy and finance',
        cat3Name: 'Technology',
        cat3Desc: 'Innovation and tech',
        cat4Name: 'Science',
        cat4Desc: 'Scientific discoveries',
        cat5Name: 'Health',
        cat5Desc: 'Wellness and medicine',
        cat6Name: 'Sports',
        cat6Desc: 'Sports results and news',
        cat7Name: 'Entertainment',
        cat7Desc: 'Movies, music, culture',
        ctaTitle: 'Ready to get started?',
        ctaSubtitle: 'Join thousands of users who stay informed with Newsly AI',
        ctaButton: 'Create my free account',
        footerTagline: 'Your personalized NewsWall powered by artificial intelligence'
    }
};

const applyIndexTranslations = (lang) => {
    const t = indexTranslations[lang];
    if (!t) return;

    // Hero section
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        heroTitle.innerHTML = `${t.heroTitle}<br><span class="gradient-text">${t.heroTitleAI}</span>`;
    }
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) heroSubtitle.textContent = t.heroSubtitle;

    const heroSignupBtn = document.getElementById('heroSignupBtn');
    if (heroSignupBtn) heroSignupBtn.textContent = t.heroSignup;
    const heroLoginBtn = document.getElementById('heroLoginBtn');
    if (heroLoginBtn) heroLoginBtn.textContent = t.heroLogin;

    // Features section
    const featuresTitle = document.querySelector('.features .section-title');
    if (featuresTitle) featuresTitle.textContent = t.featuresTitle;

    const featureTitles = document.querySelectorAll('.feature-title');
    const featureDescs = document.querySelectorAll('.feature-description');

    if (featureTitles[0]) featureTitles[0].textContent = t.feature1Title;
    if (featureDescs[0]) featureDescs[0].textContent = t.feature1Desc;
    if (featureTitles[1]) featureTitles[1].textContent = t.feature2Title;
    if (featureDescs[1]) featureDescs[1].textContent = t.feature2Desc;
    if (featureTitles[2]) featureTitles[2].textContent = t.feature3Title;
    if (featureDescs[2]) featureDescs[2].textContent = t.feature3Desc;
    if (featureTitles[3]) featureTitles[3].textContent = t.feature4Title;
    if (featureDescs[3]) featureDescs[3].textContent = t.feature4Desc;
    if (featureTitles[4]) featureTitles[4].textContent = t.feature5Title;
    if (featureDescs[4]) featureDescs[4].textContent = t.feature5Desc;
    if (featureTitles[5]) featureTitles[5].textContent = t.feature6Title;
    if (featureDescs[5]) featureDescs[5].textContent = t.feature6Desc;

    // Categories section
    const categoriesTitle = document.querySelector('.category-section-title');
    if (categoriesTitle) categoriesTitle.textContent = t.categoriesTitle;

    const categoryNames = document.querySelectorAll('.category-name');
    const categoryDescs = document.querySelectorAll('.category-desc');

    if (categoryNames[0]) categoryNames[0].textContent = t.cat1Name;
    if (categoryDescs[0]) categoryDescs[0].textContent = t.cat1Desc;
    if (categoryNames[1]) categoryNames[1].textContent = t.cat2Name;
    if (categoryDescs[1]) categoryDescs[1].textContent = t.cat2Desc;
    if (categoryNames[2]) categoryNames[2].textContent = t.cat3Name;
    if (categoryDescs[2]) categoryDescs[2].textContent = t.cat3Desc;
    if (categoryNames[3]) categoryNames[3].textContent = t.cat4Name;
    if (categoryDescs[3]) categoryDescs[3].textContent = t.cat4Desc;
    if (categoryNames[4]) categoryNames[4].textContent = t.cat5Name;
    if (categoryDescs[4]) categoryDescs[4].textContent = t.cat5Desc;
    if (categoryNames[5]) categoryNames[5].textContent = t.cat6Name;
    if (categoryDescs[5]) categoryDescs[5].textContent = t.cat6Desc;
    if (categoryNames[6]) categoryNames[6].textContent = t.cat7Name;
    if (categoryDescs[6]) categoryDescs[6].textContent = t.cat7Desc;

    // Footer
    const footerText = document.querySelector('.footer-text');
    if (footerText) footerText.textContent = t.footerTagline;
};

// Initialiser les traductions
const currentLang = localStorage.getItem('language') || 'fr';
applyIndexTranslations(currentLang);
translatePage();

// Gestion du modal
const authModal = document.getElementById('authModal');
const loginFormDiv = document.getElementById('loginForm');
const signupFormDiv = document.getElementById('signupForm');
const openLoginBtn = document.getElementById('openLoginBtn');
const openSignupBtn = document.getElementById('openSignupBtn');
const closeModal = document.getElementById('closeModal');
const switchToSignup = document.getElementById('switchToSignup');
const switchToLogin = document.getElementById('switchToLogin');

// Ouvrir login
openLoginBtn.addEventListener('click', () => {
    authModal.classList.add('show');
    loginFormDiv.style.display = 'block';
    signupFormDiv.style.display = 'none';
});

// Ouvrir signup
openSignupBtn.addEventListener('click', () => {
    authModal.classList.add('show');
    loginFormDiv.style.display = 'none';
    signupFormDiv.style.display = 'block';
});

// Fermer modal
closeModal.addEventListener('click', () => {
    authModal.classList.remove('show');
});

authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
        authModal.classList.remove('show');
    }
});

// Switch entre login et signup
switchToSignup.addEventListener('click', (e) => {
    e.preventDefault();
    loginFormDiv.style.display = 'none';
    signupFormDiv.style.display = 'block';
    forgotPasswordFormDiv.style.display = 'none';
});

switchToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    signupFormDiv.style.display = 'none';
    loginFormDiv.style.display = 'block';
    forgotPasswordFormDiv.style.display = 'none';
});

// Forgot Password - Elements
const forgotPasswordFormDiv = document.getElementById('forgotPasswordForm');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const backToLogin = document.getElementById('backToLogin');

// Switch to Forgot Password
forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginFormDiv.style.display = 'none';
    signupFormDiv.style.display = 'none';
    forgotPasswordFormDiv.style.display = 'block';
});

// Back to Login from Forgot Password
backToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    forgotPasswordFormDiv.style.display = 'none';
    loginFormDiv.style.display = 'block';
});

// Gérer la soumission du formulaire "Mot de passe oublié"
document.getElementById('forgotPasswordFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('forgotPasswordEmail').value.trim();
    const errorDiv = document.getElementById('forgotPasswordError');
    const successDiv = document.getElementById('forgotPasswordSuccess');
    const submitBtn = e.target.querySelector('button[type="submit"]');

    // Cacher les messages précédents
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';

    // Désactiver le bouton pendant l'envoi
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours...';

    try {
        const response = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            successDiv.textContent = data.message || 'Un email de réinitialisation a été envoyé.';
            successDiv.style.display = 'block';

            // Réinitialiser le formulaire
            document.getElementById('forgotPasswordFormElement').reset();

            // Retour à la page de login après 3 secondes
            setTimeout(() => {
                forgotPasswordFormDiv.style.display = 'none';
                loginFormDiv.style.display = 'block';
            }, 3000);
        } else {
            errorDiv.textContent = data.error || 'Erreur lors de l\'envoi de l\'email';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        errorDiv.textContent = 'Erreur de connexion au serveur';
        errorDiv.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Envoyer le lien';
    }
});

// Gérer la soumission login
document.getElementById('loginFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    const result = await login(email, password);

    if (result.success) {
        window.location.href = 'dashboard.html';
    } else {
        errorDiv.textContent = result.error;
        errorDiv.style.display = 'block';
    }
});

// ================================================
// SIGNUP EN 2 ÉTAPES AVEC FLIP
// ================================================

// Peupler le dropdown des pays dans Step 2
const signupCountrySelect = document.getElementById('signupCountry');
if (signupCountrySelect) {
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.name;
        option.textContent = `${country.emoji} ${country.name}`;
        signupCountrySelect.appendChild(option);
    });
}

// Peupler le dropdown des indicatifs téléphoniques
const signupPhoneCodeSelect = document.getElementById('signupPhoneCode');
const signupPhoneInput = document.getElementById('signupPhone');
if (signupPhoneCodeSelect) {
    // Vider les options existantes
    signupPhoneCodeSelect.innerHTML = '';
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.dial_code;
        option.textContent = `${country.emoji} ${country.dial_code}`;
        signupPhoneCodeSelect.appendChild(option);
    });
    // Sélectionner +33 (France) par défaut
    signupPhoneCodeSelect.value = '+33';

    // Attach phone number formatter
    if (signupPhoneInput) {
        attachPhoneFormatter(signupPhoneInput, signupPhoneCodeSelect);
    }
}

// Variables pour stocker les données de Step 1
let step1Email = '';
let step1Password = '';

// STEP 1 - Email & Password
const signupStep1Form = document.getElementById('signupStep1Form');
if (signupStep1Form) {
    signupStep1Form.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const errorDiv = document.getElementById('signupStep1Error');

        // Validation
        if (!email || !email.includes('@')) {
            errorDiv.textContent = 'Email invalide';
            errorDiv.style.display = 'block';
            return;
        }

        if (password.length < 8) {
            errorDiv.textContent = 'Le mot de passe doit contenir au moins 8 caractères';
            errorDiv.style.display = 'block';
            return;
        }

        // Stocker les données
        step1Email = email;
        step1Password = password;

        // Cacher l'erreur
        errorDiv.style.display = 'none';

        // FLIP vers Step 2
        document.getElementById('signupFlipCard').classList.add('flipped');
    });
}

// Bouton RETOUR - Flip back to Step 1
const signupBackBtn = document.getElementById('signupBackBtn');
if (signupBackBtn) {
    signupBackBtn.addEventListener('click', () => {
        document.getElementById('signupFlipCard').classList.remove('flipped');
    });
}

// Fonction pour générer des confettis plein écran
const createConfetti = () => {
    // Créer un container plein écran s'il n'existe pas
    let container = document.getElementById('globalConfettiContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'globalConfettiContainer';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 99999;
            overflow: hidden;
        `;
        document.body.appendChild(container);
    }

    container.innerHTML = '';

    // Créer 150 confettis sur toute la page avec variations
    for (let i = 0; i < 150; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.top = `${Math.random() * 30 - 20}%`;
        confetti.style.animationDelay = `${Math.random() * 1}s`;
        confetti.style.animationDuration = `${3 + Math.random() * 2}s`; // Entre 3 et 5s
        container.appendChild(confetti);
    }

    // Nettoyer après l'animation (garder 5s pour voir les confettis)
    setTimeout(() => {
        container.innerHTML = '';
        // Vérifier que le container existe toujours dans le DOM avant suppression
        if (container.parentNode) {
            container.parentNode.removeChild(container);
        }
    }, 6000);
};

// STEP 2 - Profil complet
const signupStep2Form = document.getElementById('signupStep2Form');
if (signupStep2Form) {
    signupStep2Form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('signupUsername').value.trim();
        const fullName = document.getElementById('signupFullName').value.trim();
        const country = document.getElementById('signupCountry').value;
        const city = document.getElementById('signupCity').value.trim();
        const phoneCode = document.getElementById('signupPhoneCode').value;
        const phoneNumber = document.getElementById('signupPhone').value.trim();
        const errorDiv = document.getElementById('signupStep2Error');

        // Validation
        if (!username) {
            errorDiv.textContent = 'Le nom d\'utilisateur est obligatoire';
            errorDiv.style.display = 'block';
            return;
        }

        if (!fullName) {
            errorDiv.textContent = 'Le nom complet est obligatoire';
            errorDiv.style.display = 'block';
            return;
        }

        if (!country) {
            errorDiv.textContent = 'Le pays est obligatoire';
            errorDiv.style.display = 'block';
            return;
        }

        if (!city) {
            errorDiv.textContent = 'La ville est obligatoire';
            errorDiv.style.display = 'block';
            return;
        }

        // Cacher l'erreur
        errorDiv.style.display = 'none';

        // ÉTAPE 1: Animation de disparition du formulaire avec flou
        const flipCard = document.getElementById('signupFlipCard');
        flipCard.classList.add('submitting');

        // ÉTAPE 2: Afficher le loader après 800ms (durée de l'animation shrink)
        setTimeout(() => {
            // Cacher le flip card
            flipCard.style.display = 'none';

            // Afficher le loader
            document.getElementById('signupLoader').classList.add('active');
        }, 800);

        // ÉTAPE 3: Créer le compte (appel API)
        setTimeout(async () => {
            // Construire le numéro de téléphone complet (optionnel)
            const phone = phoneNumber ? `${phoneCode} ${phoneNumber}` : '';

            // Créer le compte avec toutes les données
            const result = await signup(step1Email, step1Password, {
                username,
                full_name: fullName,
                country,
                city,
                phone
            });

            // ÉTAPE 4: Afficher succès ou erreur
            if (result.success) {
                // SUCCÈS: Afficher la notification email sous le loader
                const emailNotification = document.getElementById('emailSentNotification');
                if (emailNotification) {
                    emailNotification.style.display = 'block';
                }

                // Changer le texte du loader
                const loader = document.getElementById('signupLoader');
                if (loader) {
                    const loaderTitle = loader.querySelector('h3');
                    const loaderSubtitle = loader.querySelector('p');
                    if (loaderTitle) {
                        loaderTitle.innerHTML = '<span style="font-size: 1.5rem;">⏳</span> En attente de confirmation';
                        loaderTitle.style.display = 'flex';
                        loaderTitle.style.alignItems = 'center';
                        loaderTitle.style.gap = '0.5rem';
                        loaderTitle.style.justifyContent = 'center';
                    }
                    if (loaderSubtitle) loaderSubtitle.textContent = 'Cliquez sur le lien dans votre email';
                }

                // Démarrer le polling pour détecter la confirmation
                startEmailConfirmationPolling(result.user?.id);
            } else {
                // ERREUR: Cacher le loader et afficher l'erreur
                document.getElementById('signupLoader').classList.remove('active');
                document.getElementById('signupError').classList.add('active');
            }
        }, 1000);
    });
}

// Validation en temps réel pour griser le bouton Step 2
const validateSignupStep2 = () => {
    const username = document.getElementById('signupUsername').value.trim();
    const fullName = document.getElementById('signupFullName').value.trim();
    const country = document.getElementById('signupCountry').value;
    const city = document.getElementById('signupCity').value.trim();
    const submitBtn = signupStep2Form.querySelector('button[type="submit"]');

    const isValid = username && fullName && country && city;

    if (submitBtn) {
        submitBtn.disabled = !isValid;
        submitBtn.style.opacity = isValid ? '1' : '0.5';
    }
};

// Ajouter les listeners pour la validation en temps réel
['signupUsername', 'signupFullName', 'signupCountry', 'signupCity'].forEach(id => {
    const element = document.getElementById(id);
    if (element) {
        element.addEventListener('input', validateSignupStep2);
    }
});

// Fonction de reset complet du signup
const resetSignupModal = () => {
    // Cacher tous les écrans
    document.getElementById('signupSuccess').classList.remove('active');
    document.getElementById('signupError').classList.remove('active');
    document.getElementById('signupLoader').classList.remove('active');

    // Réafficher et reset le flip card
    const flipCard = document.getElementById('signupFlipCard');
    flipCard.style.display = 'block';
    flipCard.classList.remove('submitting', 'flipped', 'flipped-twice');

    // Reset les formulaires
    document.getElementById('signupStep1Form').reset();
    document.getElementById('signupStep2Form').reset();

    // Reset les variables
    step1Email = '';
    step1Password = '';

    // Reset les messages d'erreur
    document.getElementById('signupStep1Error').style.display = 'none';
    document.getElementById('signupStep2Error').style.display = 'none';
};

// Bouton Fermer après signup succès
const closeModalAfterSignupBtn = document.getElementById('closeModalAfterSignup');
if (closeModalAfterSignupBtn) {
    closeModalAfterSignupBtn.addEventListener('click', () => {
        authModal.classList.remove('show');
        setTimeout(resetSignupModal, 300);
    });
}

// Bouton Fermer après erreur
const closeModalAfterErrorBtn = document.getElementById('closeModalAfterError');
if (closeModalAfterErrorBtn) {
    closeModalAfterErrorBtn.addEventListener('click', () => {
        authModal.classList.remove('show');
        setTimeout(resetSignupModal, 300);
    });
}

// Hero buttons
document.getElementById('heroSignupBtn').addEventListener('click', () => {
    authModal.classList.add('show');
    loginFormDiv.style.display = 'none';
    signupFormDiv.style.display = 'block';
});

document.getElementById('heroLoginBtn').addEventListener('click', () => {
    authModal.classList.add('show');
    loginFormDiv.style.display = 'block';
    signupFormDiv.style.display = 'none';
});

// Gérer le burger menu
const burgerBtnIndex = document.getElementById('burgerBtnIndex');
const burgerMenuIndex = document.getElementById('burgerMenuIndex');

if (burgerBtnIndex && burgerMenuIndex) {
    burgerBtnIndex.addEventListener('click', (e) => {
        e.stopPropagation();
        burgerBtnIndex.classList.toggle('active');
        burgerMenuIndex.classList.toggle('show');
    });

    // Fermer le menu si on clique ailleurs
    document.addEventListener('click', () => {
        burgerBtnIndex.classList.remove('active');
        burgerMenuIndex.classList.remove('show');
    });

    // Empêcher la fermeture si on clique dans le menu
    burgerMenuIndex.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// Sync burger menu with user state
async function updateBurgerMenuUserInfo() {
    const user = await checkAuth();
    const burgerUserInfo = document.getElementById('burgerUserInfoIndex');
    const burgerAuthButtons = document.getElementById('burgerAuthButtons');
    const dashboardLink = document.getElementById('dashboardLinkIndex');
    const userName = document.getElementById('userNameDisplayIndex');
    const avatarImg = document.getElementById('burgerAvatarImageIndex');

    if (user) {
        // User is logged in - show user info
        burgerUserInfo.style.display = 'flex';
        burgerAuthButtons.style.display = 'none';
        dashboardLink.style.display = 'flex';
        userName.textContent = `User: ${user.full_name || user.username || 'User'}`;
        avatarImg.src = user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.username || 'User')}&background=3ecf8e&color=fff&size=72`;
    } else {
        // User not logged in - show auth buttons
        burgerUserInfo.style.display = 'none';
        burgerAuthButtons.style.display = 'block';
        dashboardLink.style.display = 'none';
    }
}

// Dashboard link navigation
const dashboardLinkIndex = document.getElementById('dashboardLinkIndex');
if (dashboardLinkIndex) {
    dashboardLinkIndex.addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });
}

// Language toggle
const langToggle = document.getElementById('langToggleIndex');
const langLabel = document.getElementById('langLabel');
const savedLang = localStorage.getItem('language') || 'fr';

langToggle.checked = savedLang === 'en';

langToggle.addEventListener('change', async () => {
    const newLang = langToggle.checked ? 'en' : 'fr';
    // Use centralized language change function
    await changeLanguage(newLang);
    // Apply index-specific translations
    applyIndexTranslations(newLang);
});

// Initialize particles with default config
// DÉSACTIVÉ - Conflit avec Aurora et Dark/Light Mode
/*
window.addEventListener('DOMContentLoaded', () => {
    window.particlesJS('particles-js', defaultParticlesConfig);
    // Update burger menu with user info
    updateBurgerMenuUserInfo();
});
*/

// Update burger menu with user info on load
window.addEventListener('DOMContentLoaded', () => {
    updateBurgerMenuUserInfo();
    // Initialize theme system
    initThemeSystem();
    // Initialize weather widget for index page
    initWeatherWidget('weatherWidgetIndex');
});
