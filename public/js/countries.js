// ================================================
// Liste des pays pour le formulaire d'inscription
// ================================================

export const countries = [
    { code: 'FR', name: 'France', emoji: '🇫🇷', dial_code: '+33' },
    { code: 'BE', name: 'Belgique', emoji: '🇧🇪', dial_code: '+32' },
    { code: 'CH', name: 'Suisse', emoji: '🇨🇭', dial_code: '+41' },
    { code: 'CA', name: 'Canada', emoji: '🇨🇦', dial_code: '+1' },
    { code: 'LU', name: 'Luxembourg', emoji: '🇱🇺', dial_code: '+352' },
    { code: 'MC', name: 'Monaco', emoji: '🇲🇨', dial_code: '+377' },
    { code: 'US', name: 'États-Unis', emoji: '🇺🇸', dial_code: '+1' },
    { code: 'GB', name: 'Royaume-Uni', emoji: '🇬🇧', dial_code: '+44' },
    { code: 'DE', name: 'Allemagne', emoji: '🇩🇪', dial_code: '+49' },
    { code: 'ES', name: 'Espagne', emoji: '🇪🇸', dial_code: '+34' },
    { code: 'IT', name: 'Italie', emoji: '🇮🇹', dial_code: '+39' },
    { code: 'PT', name: 'Portugal', emoji: '🇵🇹', dial_code: '+351' },
    { code: 'NL', name: 'Pays-Bas', emoji: '🇳🇱', dial_code: '+31' },
    { code: 'SE', name: 'Suède', emoji: '🇸🇪', dial_code: '+46' },
    { code: 'NO', name: 'Norvège', emoji: '🇳🇴', dial_code: '+47' },
    { code: 'DK', name: 'Danemark', emoji: '🇩🇰', dial_code: '+45' },
    { code: 'FI', name: 'Finlande', emoji: '🇫🇮', dial_code: '+358' },
    { code: 'IE', name: 'Irlande', emoji: '🇮🇪', dial_code: '+353' },
    { code: 'AT', name: 'Autriche', emoji: '🇦🇹', dial_code: '+43' },
    { code: 'PL', name: 'Pologne', emoji: '🇵🇱', dial_code: '+48' },
    { code: 'CZ', name: 'République tchèque', emoji: '🇨🇿', dial_code: '+420' },
    { code: 'GR', name: 'Grèce', emoji: '🇬🇷', dial_code: '+30' },
    { code: 'JP', name: 'Japon', emoji: '🇯🇵', dial_code: '+81' },
    { code: 'CN', name: 'Chine', emoji: '🇨🇳', dial_code: '+86' },
    { code: 'KR', name: 'Corée du Sud', emoji: '🇰🇷', dial_code: '+82' },
    { code: 'AU', name: 'Australie', emoji: '🇦🇺', dial_code: '+61' },
    { code: 'NZ', name: 'Nouvelle-Zélande', emoji: '🇳🇿', dial_code: '+64' },
    { code: 'BR', name: 'Brésil', emoji: '🇧🇷', dial_code: '+55' },
    { code: 'AR', name: 'Argentine', emoji: '🇦🇷', dial_code: '+54' },
    { code: 'MX', name: 'Mexique', emoji: '🇲🇽', dial_code: '+52' },
    { code: 'MA', name: 'Maroc', emoji: '🇲🇦', dial_code: '+212' },
    { code: 'DZ', name: 'Algérie', emoji: '🇩🇿', dial_code: '+213' },
    { code: 'TN', name: 'Tunisie', emoji: '🇹🇳', dial_code: '+216' },
    { code: 'SN', name: 'Sénégal', emoji: '🇸🇳', dial_code: '+221' },
    { code: 'CI', name: 'Côte d\'Ivoire', emoji: '🇨🇮', dial_code: '+225' },
    { code: 'CM', name: 'Cameroun', emoji: '🇨🇲', dial_code: '+237' },
    { code: 'ZA', name: 'Afrique du Sud', emoji: '🇿🇦', dial_code: '+27' },
    { code: 'Other', name: 'Autre', emoji: '🌍', dial_code: '+' }
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
