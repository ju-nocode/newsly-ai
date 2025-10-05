// ================================================
// Liste des pays pour le formulaire d'inscription
// ================================================

export const countries = [
    { code: 'FR', name: 'France', emoji: '🇫🇷' },
    { code: 'BE', name: 'Belgique', emoji: '🇧🇪' },
    { code: 'CH', name: 'Suisse', emoji: '🇨🇭' },
    { code: 'CA', name: 'Canada', emoji: '🇨🇦' },
    { code: 'LU', name: 'Luxembourg', emoji: '🇱🇺' },
    { code: 'MC', name: 'Monaco', emoji: '🇲🇨' },
    { code: 'US', name: 'États-Unis', emoji: '🇺🇸' },
    { code: 'GB', name: 'Royaume-Uni', emoji: '🇬🇧' },
    { code: 'DE', name: 'Allemagne', emoji: '🇩🇪' },
    { code: 'ES', name: 'Espagne', emoji: '🇪🇸' },
    { code: 'IT', name: 'Italie', emoji: '🇮🇹' },
    { code: 'PT', name: 'Portugal', emoji: '🇵🇹' },
    { code: 'NL', name: 'Pays-Bas', emoji: '🇳🇱' },
    { code: 'SE', name: 'Suède', emoji: '🇸🇪' },
    { code: 'NO', name: 'Norvège', emoji: '🇳🇴' },
    { code: 'DK', name: 'Danemark', emoji: '🇩🇰' },
    { code: 'FI', name: 'Finlande', emoji: '🇫🇮' },
    { code: 'IE', name: 'Irlande', emoji: '🇮🇪' },
    { code: 'AT', name: 'Autriche', emoji: '🇦🇹' },
    { code: 'PL', name: 'Pologne', emoji: '🇵🇱' },
    { code: 'CZ', name: 'République tchèque', emoji: '🇨🇿' },
    { code: 'GR', name: 'Grèce', emoji: '🇬🇷' },
    { code: 'JP', name: 'Japon', emoji: '🇯🇵' },
    { code: 'CN', name: 'Chine', emoji: '🇨🇳' },
    { code: 'KR', name: 'Corée du Sud', emoji: '🇰🇷' },
    { code: 'AU', name: 'Australie', emoji: '🇦🇺' },
    { code: 'NZ', name: 'Nouvelle-Zélande', emoji: '🇳🇿' },
    { code: 'BR', name: 'Brésil', emoji: '🇧🇷' },
    { code: 'AR', name: 'Argentine', emoji: '🇦🇷' },
    { code: 'MX', name: 'Mexique', emoji: '🇲🇽' },
    { code: 'MA', name: 'Maroc', emoji: '🇲🇦' },
    { code: 'DZ', name: 'Algérie', emoji: '🇩🇿' },
    { code: 'TN', name: 'Tunisie', emoji: '🇹🇳' },
    { code: 'SN', name: 'Sénégal', emoji: '🇸🇳' },
    { code: 'CI', name: 'Côte d\'Ivoire', emoji: '🇨🇮' },
    { code: 'CM', name: 'Cameroun', emoji: '🇨🇲' },
    { code: 'ZA', name: 'Afrique du Sud', emoji: '🇿🇦' },
    { code: 'Other', name: 'Autre', emoji: '🌍' }
];

/**
 * Obtenir le nom du pays à partir du code
 */
export const getCountryName = (code) => {
    const country = countries.find(c => c.code === code);
    return country ? country.name : code;
};

/**
 * Obtenir l'emoji du pays à partir du code
 */
export const getCountryEmoji = (code) => {
    const country = countries.find(c => c.code === code);
    return country ? country.emoji : '🌍';
};
