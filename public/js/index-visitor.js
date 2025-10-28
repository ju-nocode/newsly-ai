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

console.log('🚀 Index Visitor Mode starting...');

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
// DOM ELEMENTS
// ================================================
const newsContainer = document.getElementById('newsContainer');
const categoryTitle = document.getElementById('categoryTitle');
const mobileOverlay = document.getElementById('mobileOverlay');
const verticalSidebar = document.getElementById('verticalSidebar');
const authModal = document.getElementById('authModal');
const loginFormDiv = document.getElementById('loginForm');
const signupFormDiv = document.getElementById('signupForm');

// Burger menu
const burgerBtnIndex = document.getElementById('burgerBtnIndex');
const burgerMenuIndex = document.getElementById('burgerMenuIndex');
const loginBtnBurger = document.getElementById('loginBtnBurger');
const signupBtnBurger = document.getElementById('signupBtnBurger');

// Theme toggle
const themeToggleIndex = document.getElementById('themeToggleIndex');

// ================================================
// THEME MANAGEMENT
// ================================================
initThemeSystem();

// Lier le toggle du burger menu au système de thème
if (themeToggleIndex) {
    const currentTheme = localStorage.getItem('theme') || 'light';
    themeToggleIndex.checked = currentTheme === 'dark';

    themeToggleIndex.addEventListener('change', () => {
        const newTheme = themeToggleIndex.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        console.log('🎨 Theme changed to:', newTheme);
    });
}

// ================================================
// WEATHER WIDGET
// ================================================
const weatherWidget = document.getElementById('weatherWidgetIndex');
if (weatherWidget) {
    initWeatherWidget('weatherWidgetIndex');
}

// ================================================
// BURGER MENU
// ================================================
if (burgerBtnIndex && burgerMenuIndex) {
    burgerBtnIndex.addEventListener('click', (e) => {
        e.stopPropagation();
        burgerBtnIndex.classList.toggle('active');
        burgerMenuIndex.classList.toggle('show');
    });

    // Fermer si on clique ailleurs
    document.addEventListener('click', () => {
        burgerBtnIndex.classList.remove('active');
        burgerMenuIndex.classList.remove('show');
    });

    // Empêcher la fermeture si on clique dans le menu
    burgerMenuIndex.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// ================================================
// AUTH MODAL - OPEN/CLOSE
// ================================================
const closeModal = document.getElementById('closeModal');

// Open login from burger
if (loginBtnBurger) {
    loginBtnBurger.addEventListener('click', () => {
        authModal.classList.add('show');
        loginFormDiv.style.display = 'block';
        signupFormDiv.style.display = 'none';
        burgerMenuIndex.classList.remove('show');
        burgerBtnIndex.classList.remove('active');
    });
}

// Open signup from burger
if (signupBtnBurger) {
    signupBtnBurger.addEventListener('click', () => {
        authModal.classList.add('show');
        loginFormDiv.style.display = 'none';
        signupFormDiv.style.display = 'block';
        burgerMenuIndex.classList.remove('show');
        burgerBtnIndex.classList.remove('active');
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
        loginFormDiv.style.display = 'none';
        signupFormDiv.style.display = 'block';
        if (forgotPasswordFormDiv) forgotPasswordFormDiv.style.display = 'none';
    });
}

if (switchToLogin) {
    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        signupFormDiv.style.display = 'none';
        loginFormDiv.style.display = 'block';
        if (forgotPasswordFormDiv) forgotPasswordFormDiv.style.display = 'none';
    });
}

if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginFormDiv.style.display = 'none';
        signupFormDiv.style.display = 'none';
        if (forgotPasswordFormDiv) forgotPasswordFormDiv.style.display = 'block';
    });
}

if (backToLogin) {
    backToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        if (forgotPasswordFormDiv) forgotPasswordFormDiv.style.display = 'none';
        loginFormDiv.style.display = 'block';
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

        // Show step 2
        document.getElementById('signupStep1').style.display = 'none';
        document.getElementById('signupStep2').style.display = 'block';
    });
}

// Step 2 back button
const signupBackBtn = document.getElementById('signupBackBtn');
if (signupBackBtn) {
    signupBackBtn.addEventListener('click', () => {
        document.getElementById('signupStep2').style.display = 'none';
        document.getElementById('signupStep1').style.display = 'block';
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
        document.getElementById('signupFlipCard').style.display = 'none';
        document.getElementById('signupLoader').classList.add('active');

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
        document.getElementById('signupLoader').classList.remove('active');

        if (result.success) {
            // Show success
            document.getElementById('signupSuccess').classList.add('active');
        } else {
            // Show error
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
        document.getElementById('signupSuccess').classList.remove('active');
        document.getElementById('signupFlipCard').style.display = 'block';
        document.getElementById('signupStep1').style.display = 'block';
        document.getElementById('signupStep2').style.display = 'none';
        signupStep1Form.reset();
        signupStep2Form.reset();
    });
}

// Close after error
const closeModalAfterError = document.getElementById('closeModalAfterError');
if (closeModalAfterError) {
    closeModalAfterError.addEventListener('click', () => {
        document.getElementById('signupError').classList.remove('active');
        document.getElementById('signupFlipCard').style.display = 'block';
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

// Burger btn (toggle sidebar on mobile)
if (burgerBtnIndex) {
    burgerBtnIndex.addEventListener('dblclick', () => {
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
            <div class="skeleton-card-content">
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

        console.warn('⚠️ API not OK or no results');
    } catch (error) {
        console.warn('⚠️ API error:', error.message);
    }

    console.log('📡 Waiting for API configuration...');
}

// Load initial news
loadNews(currentCategory, currentCountry);

console.log('✅ Index Visitor Mode ready!');
