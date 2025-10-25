/**
 * Récupère la géolocalisation d'une IP via ip-api.com
 * @param {string} ip - Adresse IP à géolocaliser
 * @returns {Promise<object|null>} - Objet avec city, region, country ou null
 */
export async function getIPGeolocation(ip) {
    // Ne pas géolocaliser les IPs locales
    if (!ip || ip === 'Non disponible' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('127.') || ip === '::1') {
        return null;
    }

    try {
        // Créer un timeout manuel avec AbortController
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,regionName,city,lat,lon`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            return null;
        }

        const data = await response.json();

        if (data.status !== 'success') {
            return null;
        }

        return {
            city: data.city || null,
            region: data.regionName || null,
            country: data.country || null,
            latitude: data.lat || null,
            longitude: data.lon || null
        };
    } catch (error) {
        console.warn('Geolocation API error:', error.message);
        return null;
    }
}
