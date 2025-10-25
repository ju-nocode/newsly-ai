/**
 * Récupère la géolocalisation d'une IP via ipapi.co
 * @param {string} ip - Adresse IP à géolocaliser
 * @returns {Promise<object|null>} - Objet avec city, region, country ou null
 */
export async function getIPGeolocation(ip) {
    // Ne pas géolocaliser les IPs locales
    if (!ip || ip === 'Non disponible' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('127.') || ip === '::1') {
        return null;
    }

    try {
        const response = await fetch(`https://ipapi.co/${ip}/json/`);

        if (!response.ok) {
            return null;
        }

        const data = await response.json();

        return {
            city: data.city || null,
            region: data.region || null,
            country: data.country_name || null,
            latitude: data.latitude || null,
            longitude: data.longitude || null
        };
    } catch (error) {
        console.warn('Geolocation API error:', error.message);
        return null;
    }
}
