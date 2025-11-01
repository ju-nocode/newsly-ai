// ================================================
// 404 PAGE - Main Script
// ================================================

import { initTheme } from './theme-manager.js';
import { initIconReplacement } from './icon-replacer.js';

// Initialize theme on page load
initTheme();

// Replace icons8 with Flowbite SVG icons
initIconReplacement();
