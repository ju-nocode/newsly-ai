// ================================================
// WEATHER WIDGET - Centralized Weather Management
// ================================================

/**
 * Get weather icon based on WMO Weather codes
 * @param {number} weatherCode - WMO weather code
 * @returns {string} Weather emoji
 */
function getWeatherIcon(weatherCode) {
    // WMO Weather codes: https://open-meteo.com/en/docs
    if (weatherCode === 0) return '🌤️'; // Clear sky
    if (weatherCode <= 3) return '⛅'; // Partly cloudy
    if (weatherCode <= 48) return '🌫️'; // Fog
    if (weatherCode <= 67) return '🌧️'; // Rain
    if (weatherCode <= 77) return '❄️'; // Snow
    if (weatherCode <= 82) return '🌧️'; // Showers
    if (weatherCode <= 99) return '⛈️'; // Thunderstorm
    return '🌤️';
}

/**
 * Fetch weather data for given coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Weather data
 */
async function fetchWeatherData(lat, lon) {
    try {
        // Fetch weather with timeout
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

        // Get city name from reverse geocoding
        const geoController = new AbortController();
        const geoTimeoutId = setTimeout(() => geoController.abort(), 5000);

        const geoResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=fr`,
            { signal: geoController.signal }
        );
        clearTimeout(geoTimeoutId);

        const geoData = await geoResponse.json();
        const city = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.state || 'Votre position';

        return { temp, icon, city, success: true };
    } catch (error) {
        console.error('Erreur météo:', error);
        return { success: false, error };
    }
}

/**
 * Update weather widget display
 * @param {HTMLElement} widget - Weather widget element
 * @param {Object} data - Weather data
 */
function updateWeatherWidget(widget, data) {
    if (!widget) return;

    if (data.success) {
        widget.innerHTML = `
            <div class="weather-info">
                <span class="weather-icon">${data.icon}</span>
                <div class="weather-details">
                    <span class="weather-temp">${data.temp}°C</span>
                    <span class="weather-city">${data.city}</span>
                </div>
            </div>
        `;
    } else {
        widget.innerHTML = `
            <div class="weather-error">
                <span>🌫️</span>
            </div>
        `;
    }
}

/**
 * Load weather for current location or saved coordinates
 * @param {string} widgetId - ID of the weather widget element (default: 'weatherWidget')
 */
export async function loadWeather(widgetId = 'weatherWidget') {
    const weatherWidget = document.getElementById(widgetId);
    if (!weatherWidget) {
        console.warn(`⚠️ Weather widget element "${widgetId}" not found`);
        return;
    }

    // Check if geolocation is available in localStorage
    const savedLat = localStorage.getItem('weatherLat');
    const savedLon = localStorage.getItem('weatherLon');

    if (savedLat && savedLon) {
        // Use saved coordinates
        const data = await fetchWeatherData(parseFloat(savedLat), parseFloat(savedLon));
        updateWeatherWidget(weatherWidget, data);
    } else if (navigator.geolocation) {
        // Request geolocation
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                localStorage.setItem('weatherLat', lat);
                localStorage.setItem('weatherLon', lon);
                const data = await fetchWeatherData(lat, lon);
                updateWeatherWidget(weatherWidget, data);
            },
            async (error) => {
                console.log('Géolocalisation refusée, utilisation de Paris par défaut');
                // Show temporary message
                weatherWidget.innerHTML = `
                    <div class="weather-info" style="opacity: 0.7;">
                        <span class="weather-icon">☀️</span>
                        <div class="weather-details">
                            <div class="weather-temp" style="font-size: 0.875rem;">Position par défaut</div>
                            <div class="weather-location" style="font-size: 0.75rem;">Géolocalisation désactivée</div>
                        </div>
                    </div>
                `;
                // Load Paris weather after 2s
                setTimeout(async () => {
                    const data = await fetchWeatherData(48.8566, 2.3522); // Paris
                    updateWeatherWidget(weatherWidget, data);
                }, 2000);
            }
        );
    } else {
        // No geolocation support, use Paris as default
        const data = await fetchWeatherData(48.8566, 2.3522);
        updateWeatherWidget(weatherWidget, data);
    }
}

/**
 * Initialize weather widget with auto-refresh
 * @param {string} widgetId - ID of the weather widget element (default: 'weatherWidget')
 */
export function initWeatherWidget(widgetId = 'weatherWidget') {
    const weatherWidget = document.getElementById(widgetId);

    if (!weatherWidget) {
        console.warn(`⚠️ Weather widget element "${widgetId}" not found`);
        return;
    }

    // Load weather on init
    loadWeather(widgetId);

    // Refresh weather every 10 minutes
    setInterval(() => loadWeather(widgetId), 10 * 60 * 1000);

    // Make weather widget clickable with refresh effect
    weatherWidget.style.cursor = 'pointer';
    weatherWidget.setAttribute('title', 'Cliquer pour actualiser la météo');

    weatherWidget.addEventListener('click', async () => {
        // Add darkening effect
        weatherWidget.style.transition = 'opacity 0.3s ease';
        weatherWidget.style.opacity = '0.4';

        // Clear saved location and reload weather
        localStorage.removeItem('weatherLat');
        localStorage.removeItem('weatherLon');

        // Reload weather
        await loadWeather(widgetId);

        // Remove darkening effect after reload
        setTimeout(() => {
            weatherWidget.style.opacity = '1';
        }, 300);

        console.log('🔄 Weather refreshed by user click');
    });

    console.log(`✅ Weather widget "${widgetId}" initialized with click-to-refresh`);
}

/**
 * Allow user to manually refresh weather location
 */
export function refreshWeatherLocation() {
    // Clear saved location
    localStorage.removeItem('weatherLat');
    localStorage.removeItem('weatherLon');

    // Reload weather
    loadWeather();

    console.log('🔄 Weather location refreshed');
}

// Export for global access
if (typeof window !== 'undefined') {
    window.refreshWeatherLocation = refreshWeatherLocation;
}
