// ================================================
// INDEX.HTML - MODE VISITEUR
// ================================================

import { checkAuth, login, signup, fetchNews } from './app.js';
import { countries } from './countries.js';
import { attachPhoneFormatter } from './phone-formatter.js';
import { initThemeSystem } from './theme-manager.js';
import { initWeatherWidget } from './weather.js';
import { navigateWithBlur } from './page-loader.js';
import { displayNews, showSuccess, showError } from './dashboard-utils.js';
import { initNavbar } from './navbar-component.js';
import { initIconReplacement } from './icon-replacer.js';

console.log('🚀 Index Visitor Mode starting...');

// ================================================
// INJECT NAVBAR
// ================================================
initNavbar('.mobile-overlay', {
    showMobileSidebarBtn: true,
    publicMode: true,
    showLanguageSwitcher: false
});

// Replace icons8 with Flowbite SVG icons
initIconReplacement();

// Redirection si déjà connecté
const isAuthenticated = checkAuth();
if (isAuthenticated) {
    console.log('✅ User logged in → Redirect to dashboard');
    navigateWithBlur('dashboard.html');
}

// ================================================
// STATE
// ================================================
let currentCategory = 'general';
let currentCountry = 'us';

// ================================================
// DOM ELEMENTS (wait for navbar injection)
// ================================================
const newsContainer = document.getElementById('newsContainer');
const categoryTitle = document.getElementById('categoryTitle');
const mobileOverlay = document.getElementById('mobileOverlay');
const verticalSidebar = document.getElementById('verticalSidebar');
const authModal = document.getElementById('authModal');
const loginFormDiv = document.getElementById('loginForm');
const signupFormDiv = document.getElementById('signupForm');

// ================================================
// THEME MANAGEMENT
// ================================================
initThemeSystem();

// ================================================
// WEATHER WIDGET
// ================================================
initWeatherWidget('weatherWidget');

// ================================================
// BURGER MENU (IDs from navbar-component)
// ================================================
const burgerBtn = document.getElementById('burgerBtn');
const burgerMenu = document.getElementById('burgerMenu');

if (burgerBtn && burgerMenu) {
    burgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        burgerBtn.classList.toggle('active');
        burgerMenu.classList.toggle('show');
    });

    // Fermer si on clique ailleurs
    document.addEventListener('click', () => {
        burgerBtn.classList.remove('active');
        burgerMenu.classList.remove('show');
    });

    // Empêcher la fermeture si on clique dans le menu
    burgerMenu.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// ================================================
// AUTH MODAL - OPEN/CLOSE
// ================================================
const closeModal = document.getElementById('closeModal');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');

// Open login from burger
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        authModal.classList.add('show');
        const flipCard = document.getElementById('signupFlipCard');
        if (flipCard) {
            flipCard.classList.remove('flipped', 'show-forgot');
        }
        burgerMenu.classList.remove('show');
        burgerBtn.classList.remove('active');
    });
}

// Open signup from burger
if (signupBtn) {
    signupBtn.addEventListener('click', () => {
        authModal.classList.add('show');
        const flipCard = document.getElementById('signupFlipCard');
        if (flipCard) {
            flipCard.classList.add('flipped');
            flipCard.classList.remove('show-forgot');
        }
        burgerMenu.classList.remove('show');
        burgerBtn.classList.remove('active');
    });
}

// Close modal
if (closeModal) {
    closeModal.addEventListener('click', () => {
        authModal.classList.remove('show');
    });
}

// Close on outside click
if (authModal) {
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.classList.remove('show');
        }
    });
}

// ================================================
// AUTH MODAL - SWITCH FORMS
// ================================================
const switchToSignup = document.getElementById('switchToSignup');
const switchToLogin = document.getElementById('switchToLogin');
const forgotPasswordFormDiv = document.getElementById('forgotPasswordForm');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const backToLogin = document.getElementById('backToLogin');

if (switchToSignup) {
    switchToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        const flipCard = document.getElementById('signupFlipCard');
        if (flipCard) {
            flipCard.classList.add('flipped');
            flipCard.classList.remove('show-forgot');
        }
    });
}

if (switchToLogin) {
    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        const flipCard = document.getElementById('signupFlipCard');
        if (flipCard) {
            flipCard.classList.remove('flipped', 'show-forgot');
        }
    });
}

if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        const flipCard = document.getElementById('signupFlipCard');
        if (flipCard) {
            flipCard.classList.add('show-forgot');
            flipCard.classList.remove('flipped');
        }
    });
}

if (backToLogin) {
    backToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        const flipCard = document.getElementById('signupFlipCard');
        if (flipCard) {
            flipCard.classList.remove('show-forgot', 'flipped');
        }
    });
}

// ================================================
// LOGIN FORM SUBMIT
// ================================================
const loginFormElement = document.getElementById('loginFormElement');
if (loginFormElement) {
    loginFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const errorDiv = document.getElementById('loginError');

        errorDiv.style.display = 'none';

        const result = await login(email, password);

        if (result.success) {
            showSuccess('Connexion réussie !');
            navigateWithBlur('dashboard.html');
        } else {
            errorDiv.textContent = result.error || 'Erreur de connexion';
            errorDiv.style.display = 'block';
        }
    });
}

// ================================================
// SIGNUP 2-STEP FLIP
// ================================================
let step1Email = '';
let step1Password = '';

// Populate country dropdown
const signupCountrySelect = document.getElementById('signupCountry');
if (signupCountrySelect) {
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.name;
        option.textContent = `${country.emoji} ${country.name}`;
        signupCountrySelect.appendChild(option);
    });
}

// Populate phone code dropdown
const signupPhoneCodeSelect = document.getElementById('signupPhoneCode');
const signupPhoneInput = document.getElementById('signupPhone');
if (signupPhoneCodeSelect) {
    signupPhoneCodeSelect.innerHTML = '';
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.dial_code;
        option.textContent = `${country.emoji} ${country.dial_code}`;
        signupPhoneCodeSelect.appendChild(option);
    });
    signupPhoneCodeSelect.value = '+33';

    if (signupPhoneInput) {
        attachPhoneFormatter(signupPhoneInput, signupPhoneCodeSelect);
    }
}

// Step 1 submit
const signupStep1Form = document.getElementById('signupStep1Form');
if (signupStep1Form) {
    signupStep1Form.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const errorDiv = document.getElementById('signupStep1Error');

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

        step1Email = email;
        step1Password = password;
        errorDiv.style.display = 'none';

        // Animate transition to step 2
        const step1 = document.getElementById('signupStep1');
        const step2 = document.getElementById('signupStep2');

        if (step1 && step2) {
            step1.classList.add('hidden');
            setTimeout(() => {
                step1.style.display = 'none';
                step2.style.display = 'block';
                // Trigger reflow to enable CSS transition
                step2.offsetHeight;
                step2.classList.add('active');
            }, 300);
        }
    });
}

// Step 2 back button
const signupBackBtn = document.getElementById('signupBackBtn');
if (signupBackBtn) {
    signupBackBtn.addEventListener('click', () => {
        const step1 = document.getElementById('signupStep1');
        const step2 = document.getElementById('signupStep2');

        if (step1 && step2) {
            step2.classList.remove('active');
            setTimeout(() => {
                step2.style.display = 'none';
                step1.style.display = 'block';
                step1.classList.remove('hidden');
            }, 300);
        }
    });
}

// Step 2 submit
const signupStep2Form = document.getElementById('signupStep2Form');
if (signupStep2Form) {
    signupStep2Form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const firstName = document.getElementById('signupFirstName').value.trim();
        const lastName = document.getElementById('signupLastName').value.trim();
        const country = document.getElementById('signupCountry').value;
        const city = document.getElementById('signupCity').value.trim();
        const phoneCode = document.getElementById('signupPhoneCode').value;
        const phoneNumber = document.getElementById('signupPhone').value.trim();
        const errorDiv = document.getElementById('signupStep2Error');

        if (!firstName || !lastName || !country || !city) {
            errorDiv.textContent = 'Tous les champs obligatoires doivent être remplis';
            errorDiv.style.display = 'block';
            return;
        }

        errorDiv.style.display = 'none';

        // Show loader
        const flipCard = document.getElementById('signupFlipCard');
        const loader = document.getElementById('signupLoader');
        if (flipCard) flipCard.classList.add('hidden');
        if (loader) loader.classList.add('active');

        // Build phone
        const phone = phoneNumber ? `${phoneCode} ${phoneNumber}` : '';

        // Create account
        const result = await signup(step1Email, step1Password, {
            first_name: firstName,
            last_name: lastName,
            country,
            city,
            phone
        });

        // Hide loader
        if (loader) loader.classList.remove('active');

        if (result.success) {
            // Hide form and show success
            if (flipCard) flipCard.classList.add('hidden');
            const success = document.getElementById('signupSuccess');
            if (success) success.classList.add('active');
        } else {
            // Hide form and show error
            if (flipCard) flipCard.classList.add('hidden');
            const signupError = document.getElementById('signupError');
            if (signupError) {
                signupError.classList.add('active');
                const errorSubtitle = signupError.querySelector('.error-subtitle');
                if (errorSubtitle) {
                    errorSubtitle.textContent = result.error || 'Une erreur est survenue';
                }
            }
        }
    });
}

// Close after signup success
const closeModalAfterSignup = document.getElementById('closeModalAfterSignup');
if (closeModalAfterSignup) {
    closeModalAfterSignup.addEventListener('click', () => {
        authModal.classList.remove('show');
        const success = document.getElementById('signupSuccess');
        const flipCard = document.getElementById('signupFlipCard');
        const step1 = document.getElementById('signupStep1');
        const step2 = document.getElementById('signupStep2');

        if (success) success.classList.remove('active');
        if (flipCard) flipCard.classList.remove('hidden', 'flipped', 'show-forgot');

        // Reset steps with proper state
        if (step1) {
            step1.style.display = 'block';
            step1.classList.remove('hidden');
        }
        if (step2) {
            step2.style.display = 'none';
            step2.classList.remove('active');
        }

        if (signupStep1Form) signupStep1Form.reset();
        if (signupStep2Form) signupStep2Form.reset();
    });
}

// Close after error
const closeModalAfterError = document.getElementById('closeModalAfterError');
if (closeModalAfterError) {
    closeModalAfterError.addEventListener('click', () => {
        const error = document.getElementById('signupError');
        const flipCard = document.getElementById('signupFlipCard');

        if (error) error.classList.remove('active');
        if (flipCard) flipCard.classList.remove('hidden');
    });
}

// ================================================
// FORGOT PASSWORD
// ================================================
const forgotPasswordFormElement = document.getElementById('forgotPasswordFormElement');
if (forgotPasswordFormElement) {
    forgotPasswordFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('forgotPasswordEmail').value.trim();
        const errorDiv = document.getElementById('forgotPasswordError');
        const successDiv = document.getElementById('forgotPasswordSuccess');
        const submitBtn = e.target.querySelector('button[type="submit"]');

        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';

        submitBtn.disabled = true;
        submitBtn.textContent = 'Envoi en cours...';

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                successDiv.textContent = data.message || 'Un email de réinitialisation a été envoyé.';
                successDiv.style.display = 'block';
                forgotPasswordFormElement.reset();

                setTimeout(() => {
                    const flipCard = document.getElementById('signupFlipCard');
                    if (flipCard) {
                        flipCard.classList.remove('show-forgot', 'flipped');
                    }
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
}

// ================================================
// CATEGORIES & COUNTRIES
// ================================================
document.querySelectorAll('.sidebar-menu-link[data-category]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const category = link.dataset.category;

        document.querySelectorAll('.sidebar-menu-link[data-category]').forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        const categoryName = link.querySelector('span').textContent;
        categoryTitle.textContent = `Actualités ${categoryName}`;

        currentCategory = category;
        loadNews(category, currentCountry);

        closeMobileSidebar();
    });
});

document.querySelectorAll('.sidebar-menu-link[data-country]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const country = link.dataset.country;

        document.querySelectorAll('.sidebar-menu-link[data-country]').forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        currentCountry = country;
        loadNews(currentCategory, country);

        closeMobileSidebar();
    });
});

// ================================================
// MOBILE SIDEBAR
// ================================================
function closeMobileSidebar() {
    verticalSidebar?.classList.remove('mobile-open');
    mobileOverlay?.classList.remove('show');
    document.body.style.overflow = '';
}

function openMobileSidebar() {
    verticalSidebar?.classList.add('mobile-open');
    mobileOverlay?.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Mobile sidebar toggle button (ID from navbar-component)
const mobileSidebarBtn = document.getElementById('mobileSidebarBtn');
if (mobileSidebarBtn) {
    mobileSidebarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (verticalSidebar.classList.contains('mobile-open')) {
            closeMobileSidebar();
        } else {
            openMobileSidebar();
        }
    });
}

if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobileSidebar);
}

// ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (verticalSidebar?.classList.contains('mobile-open')) {
            closeMobileSidebar();
        }
        if (authModal.classList.contains('show')) {
            authModal.classList.remove('show');
        }
    }
});

// ================================================
// NEWS LOADING
// ================================================
function showShimmer() {
    newsContainer.innerHTML = '';
    for (let i = 0; i < 6; i++) {
        const card = document.createElement('div');
        card.className = 'skeleton-card';
        card.innerHTML = `
            <div class="skeleton-image skeleton"></div>
            <div class="skeleton-content">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text" style="width: 60%;"></div>
            </div>
        `;
        newsContainer.appendChild(card);
    }
    newsContainer.classList.add('shimmer-loading');
}

function hideShimmer() {
    newsContainer.classList.remove('shimmer-loading');
}

async function loadNews(category, country) {
    console.log(`📰 Loading ${category} / ${country}`);

    showShimmer();

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(`/api/news/public?category=${category}&country=${country}&page=1`, {
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (response.ok) {
            const data = await response.json();
            console.log('✅ News data received:', data);

            hideShimmer();

            if (data.success && data.articles && data.articles.length > 0) {
                displayNews(data.articles, 'newsContainer');
                return;
            }
        }

        console.warn('⚠️ API not OK or no results - keeping shimmers visible');
    } catch (error) {
        console.warn('⚠️ API error:', error.message);
    }
}

// Load initial news
loadNews(currentCategory, currentCountry);

console.log('✅ Index Visitor Mode ready!');
