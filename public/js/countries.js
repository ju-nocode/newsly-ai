// ================================================
// Liste des pays pour le formulaire d'inscription
// ================================================

export const countries = [
    { code: 'FR', name: 'France', emoji: '🇫🇷', dial_code: '+33' },
    { code: 'BE', name: 'Belgium', emoji: '🇧🇪', dial_code: '+32' },
    { code: 'CH', name: 'Switzerland', emoji: '🇨🇭', dial_code: '+41' },
    { code: 'CA', name: 'Canada', emoji: '🇨🇦', dial_code: '+1' },
    { code: 'LU', name: 'Luxembourg', emoji: '🇱🇺', dial_code: '+352' },
    { code: 'MC', name: 'Monaco', emoji: '🇲🇨', dial_code: '+377' },
    { code: 'US', name: 'United States', emoji: '🇺🇸', dial_code: '+1' },
    { code: 'GB', name: 'United Kingdom', emoji: '🇬🇧', dial_code: '+44' },
    { code: 'DE', name: 'Germany', emoji: '🇩🇪', dial_code: '+49' },
    { code: 'ES', name: 'Spain', emoji: '🇪🇸', dial_code: '+34' },
    { code: 'IT', name: 'Italy', emoji: '🇮🇹', dial_code: '+39' },
    { code: 'PT', name: 'Portugal', emoji: '🇵🇹', dial_code: '+351' },
    { code: 'NL', name: 'Netherlands', emoji: '🇳🇱', dial_code: '+31' },
    { code: 'SE', name: 'Sweden', emoji: '🇸🇪', dial_code: '+46' },
    { code: 'NO', name: 'Norway', emoji: '🇳🇴', dial_code: '+47' },
    { code: 'DK', name: 'Denmark', emoji: '🇩🇰', dial_code: '+45' },
    { code: 'FI', name: 'Finland', emoji: '🇫🇮', dial_code: '+358' },
    { code: 'IE', name: 'Ireland', emoji: '🇮🇪', dial_code: '+353' },
    { code: 'AT', name: 'Austria', emoji: '🇦🇹', dial_code: '+43' },
    { code: 'PL', name: 'Poland', emoji: '🇵🇱', dial_code: '+48' },
    { code: 'CZ', name: 'Czech Republic', emoji: '🇨🇿', dial_code: '+420' },
    { code: 'GR', name: 'Greece', emoji: '🇬🇷', dial_code: '+30' },
    { code: 'JP', name: 'Japan', emoji: '🇯🇵', dial_code: '+81' },
    { code: 'CN', name: 'China', emoji: '🇨🇳', dial_code: '+86' },
    { code: 'KR', name: 'South Korea', emoji: '🇰🇷', dial_code: '+82' },
    { code: 'AU', name: 'Australia', emoji: '🇦🇺', dial_code: '+61' },
    { code: 'NZ', name: 'New Zealand', emoji: '🇳🇿', dial_code: '+64' },
    { code: 'BR', name: 'Brazil', emoji: '🇧🇷', dial_code: '+55' },
    { code: 'AR', name: 'Argentina', emoji: '🇦🇷', dial_code: '+54' },
    { code: 'MX', name: 'Mexico', emoji: '🇲🇽', dial_code: '+52' },
    { code: 'MA', name: 'Morocco', emoji: '🇲🇦', dial_code: '+212' },
    { code: 'DZ', name: 'Algeria', emoji: '🇩🇿', dial_code: '+213' },
    { code: 'TN', name: 'Tunisia', emoji: '🇹🇳', dial_code: '+216' },
    { code: 'SN', name: 'Senegal', emoji: '🇸🇳', dial_code: '+221' },
    { code: 'CI', name: 'Ivory Coast', emoji: '🇨🇮', dial_code: '+225' },
    { code: 'CM', name: 'Cameroon', emoji: '🇨🇲', dial_code: '+237' },
    { code: 'ZA', name: 'South Africa', emoji: '🇿🇦', dial_code: '+27' },
    { code: 'Other', name: 'Other', emoji: '🌍', dial_code: '+' }
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
