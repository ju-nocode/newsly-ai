/**
 * Browser and Device Detection
 * Adds classes to <html> for CSS targeting
 */

(function() {
    const html = document.documentElement;
    const ua = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();

    // Mobile detection
    const isMobile = /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
    const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(ua);
    const isDesktop = !isMobile && !isTablet;

    // Browser detection
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    const isChrome = /chrome|crios/i.test(ua) && !isSafari;
    const isFirefox = /firefox|fxios/i.test(ua);
    const isEdge = /edg/i.test(ua);
    const isIE = /msie|trident/i.test(ua);

    // OS detection
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);
    const isMac = /mac/.test(platform);
    const isWindows = /win/.test(platform);

    // Touch support
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Apply classes
    if (isMobile) html.classList.add('is-mobile');
    if (isTablet) html.classList.add('is-tablet');
    if (isDesktop) html.classList.add('is-desktop');

    if (isSafari) html.classList.add('is-safari');
    if (isChrome) html.classList.add('is-chrome');
    if (isFirefox) html.classList.add('is-firefox');
    if (isEdge) html.classList.add('is-edge');
    if (isIE) html.classList.add('is-ie');

    if (isIOS) html.classList.add('is-ios');
    if (isAndroid) html.classList.add('is-android');
    if (isMac) html.classList.add('is-mac');
    if (isWindows) html.classList.add('is-windows');

    if (hasTouch) html.classList.add('has-touch');

    // Debug log (dev only - remove in production)
    console.log('Device/Browser Detection:', {
        mobile: isMobile,
        tablet: isTablet,
        desktop: isDesktop,
        browser: isSafari ? 'Safari' : isChrome ? 'Chrome' : isFirefox ? 'Firefox' : isEdge ? 'Edge' : 'Other',
        os: isIOS ? 'iOS' : isAndroid ? 'Android' : isMac ? 'macOS' : isWindows ? 'Windows' : 'Other',
        touch: hasTouch
    });
})();
