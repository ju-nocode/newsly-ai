import { checkAuth, login, signup } from './app.js';
import { translatePage } from './translation-service.js';
import { defaultParticlesConfig } from './particles-config.js';

// Si l'utilisateur est déjà connecté, rediriger vers le dashboard
if (checkAuth()) {
    window.location.href = 'dashboard.html';
} else {
    // Hide app links in footer when not logged in
    const appLinksSection = document.getElementById('appLinksSection');
    if (appLinksSection) {
        appLinksSection.style.display = 'none';
    }
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
        feature4Desc: 'Sauvegardez vos articles préférés et accédez-y à tout moment.',
        howTitle: 'Comment ça marche ?',
        howSubtitle: 'Trois étapes simples pour rester informé',
        step1Title: 'Créez votre compte',
        step1Desc: 'Inscrivez-vous gratuitement en quelques secondes. Aucune carte bancaire requise.',
        step2Title: 'Personnalisez',
        step2Desc: 'Sélectionnez vos catégories et sources préférées pour une expérience sur mesure.',
        step3Title: 'Consultez et profitez',
        step3Desc: 'Accédez à votre fil d\'actualités personnalisé et restez informé en temps réel.',
        categoriesTitle: 'Catégories d\'actualités',
        categoriesSubtitle: 'Des sujets variés pour tous les intérêts',
        ctaTitle: 'Prêt à révolutionner votre lecture d\'actualités ?',
        ctaSubtitle: 'Rejoignez des milliers d\'utilisateurs qui font confiance à Newsly AI',
        ctaButton: 'Commencer Maintenant'
    },
    en: {
        heroTitle: 'Your Personalized NewsWall',
        heroTitleAI: 'Powered by AI',
        heroSubtitle: 'Stay informed with intelligently filtered news according to your interests. NewslyAI analyzes and organizes information for you.',
        heroSignup: 'Start Free',
        heroLogin: 'Sign In',
        featuresTitle: 'Why choose Newsly AI?',
        feature1Title: 'AI-Powered Smart Filtering',
        feature1Desc: 'Our AI analyzes and filters news to present only what matters, tailored to your preferences.',
        feature2Title: 'Advanced Personalization',
        feature2Desc: 'Choose your favorite categories: technology, business, science, sports and more.',
        feature3Title: 'Real-Time Updates',
        feature3Desc: 'Stay current with the latest news refreshed in real-time.',
        feature4Title: 'Save Your Favorites',
        feature4Desc: 'Bookmark your favorite articles and access them anytime.',
        howTitle: 'How it works?',
        howSubtitle: 'Three simple steps to stay informed',
        step1Title: 'Create your account',
        step1Desc: 'Sign up for free in seconds. No credit card required.',
        step2Title: 'Customize',
        step2Desc: 'Select your favorite categories and sources for a tailored experience.',
        step3Title: 'Browse and enjoy',
        step3Desc: 'Access your personalized news feed and stay informed in real-time.',
        categoriesTitle: 'News Categories',
        categoriesSubtitle: 'Various topics for all interests',
        ctaTitle: 'Ready to revolutionize your news reading?',
        ctaSubtitle: 'Join thousands of users who trust Newsly AI',
        ctaButton: 'Get Started Now'
    }
};

translatePage(indexTranslations);

// Modal management
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

// Open modals
document.getElementById('heroLoginBtn').addEventListener('click', () => {
    loginModal.style.display = 'flex';
});

document.getElementById('heroSignupBtn').addEventListener('click', () => {
    signupModal.style.display = 'flex';
});

document.getElementById('navLoginBtn').addEventListener('click', () => {
    loginModal.style.display = 'flex';
});

document.getElementById('navSignupBtn').addEventListener('click', () => {
    signupModal.style.display = 'flex';
});

// Close modals
document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
        loginModal.style.display = 'none';
        signupModal.style.display = 'none';
    });
});

// Close on outside click
window.addEventListener('click', (e) => {
    if (e.target === loginModal) loginModal.style.display = 'none';
    if (e.target === signupModal) signupModal.style.display = 'none';
});

// Switch between modals
document.getElementById('switchToSignup').addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.style.display = 'none';
    signupModal.style.display = 'flex';
});

document.getElementById('switchToLogin').addEventListener('click', (e) => {
    e.preventDefault();
    signupModal.style.display = 'none';
    loginModal.style.display = 'flex';
});

// Handle login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = '';

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const result = await login(email, password);

        if (result.success) {
            window.location.href = 'dashboard.html';
        } else {
            errorDiv.textContent = result.error;
        }
    } catch (error) {
        errorDiv.textContent = 'Une erreur est survenue';
    }
});

// Handle signup
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorDiv = document.getElementById('signupError');
    errorDiv.textContent = '';

    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        errorDiv.textContent = 'Les mots de passe ne correspondent pas';
        return;
    }

    try {
        const result = await signup(email, password);

        if (result.success) {
            window.location.href = 'dashboard.html';
        } else {
            errorDiv.textContent = result.error;
        }
    } catch (error) {
        errorDiv.textContent = 'Une erreur est survenue';
    }
});

// Initialize particles with default config
window.addEventListener('DOMContentLoaded', () => {
    window.particlesJS('particles-js', defaultParticlesConfig);
});
