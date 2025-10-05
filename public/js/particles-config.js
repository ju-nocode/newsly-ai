// Particles.js Configuration
export const defaultParticlesConfig = {
  "particles": {
    "number": {
      "value": 250,
      "density": {
        "enable": true,
        "value_area": 750
      }
    },
    "color": {
      "value": "#fffe7a"
    },
    "shape": {
      "type": "circle",
      "stroke": {
        "width": 0,
        "color": "#000000"
      },
      "polygon": {
        "nb_sides": 5
      },
      "image": {
        "src": "img/github.svg",
        "width": 100,
        "height": 100
      }
    },
    "opacity": {
      "value": 0.28409763488718937,
      "random": true,
      "anim": {
        "enable": true,
        "speed": 1,
        "opacity_min": 0.1,
        "sync": true
      }
    },
    "size": {
      "value": 0,
      "random": true,
      "anim": {
        "enable": true,
        "speed": 115.07755747884246,
        "size_min": 68.72687460541981,
        "sync": false
      }
    },
    "line_linked": {
      "enable": true,
      "distance": 60,
      "color": "#7c9149",
      "opacity": 0.3945800484544296,
      "width": 0
    },
    "move": {
      "enable": true,
      "speed": 0.5,
      "direction": "none",
      "random": true,
      "straight": false,
      "out_mode": "out",
      "bounce": false,
      "attract": {
        "enable": true,
        "rotateX": 5000,
        "rotateY": 5000
      }
    }
  },
  "interactivity": {
    "detect_on": "canvas",
    "events": {
      "onhover": {
        "enable": true,
        "mode": "repulse"
      },
      "onclick": {
        "enable": false,
        "mode": "push"
      },
      "resize": true
    },
    "modes": {
      "grab": {
        "distance": 80,
        "line_linked": {
          "opacity": 0.4127883447996764
        }
      },
      "bubble": {
        "distance": 491.47706839922307,
        "size": 151.83844389569492,
        "duration": 2,
        "opacity": 0.25572790550853886,
        "speed": 3
      },
      "repulse": {
        "distance": 100,
        "duration": 0.4
      },
      "push": {
        "particles_nb": 4
      },
      "remove": {
        "particles_nb": 2
      }
    }
  },
  "retina_detect": true
};

// Load particles config from localStorage or use default
export const loadParticlesConfig = () => {
  try {
    const saved = localStorage.getItem('particlesConfig');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate that it has the required structure
      if (parsed && parsed.particles && parsed.interactivity) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Failed to load particles config from localStorage:', error);
  }
  return defaultParticlesConfig;
};

// Save particles config to localStorage
export const saveParticlesConfig = (config) => {
  localStorage.setItem('particlesConfig', JSON.stringify(config));
};

// Adjust particle colors based on theme
export const adjustColorsForTheme = (config) => {
  const theme = document.documentElement.getAttribute('data-theme') || 'light';
  const adjustedConfig = JSON.parse(JSON.stringify(config));

  if (theme === 'light') {
    // Dark particles for light mode
    adjustedConfig.particles.color.value = '#2d3748';
    adjustedConfig.particles.line_linked.color = '#4a5568';
    adjustedConfig.particles.line_linked.opacity = 0.2;
  } else {
    // Keep original colors for dark mode or use saved colors
    // Colors are already set from config
  }

  return adjustedConfig;
};

// Initialize particles on a given element
export const initParticles = async (elementId, config = null) => {
  let particlesConfig;

  if (config) {
    // Use provided config
    particlesConfig = config;
  } else {
    // Try to load from database
    try {
      // Check if we're in a module context with access to app.js
      if (typeof window !== 'undefined' && window.getParticlesConfigFromDB) {
        const dbResult = await window.getParticlesConfigFromDB();
        if (dbResult.success && dbResult.config) {
          console.log('[Particles] Loaded config from database');
          particlesConfig = dbResult.config;
        } else {
          console.log('[Particles] No DB config, using default');
          particlesConfig = defaultParticlesConfig;
        }
      } else {
        // Fallback to default if DB function not available
        particlesConfig = defaultParticlesConfig;
      }
    } catch (error) {
      console.warn('[Particles] Error loading from DB, using default:', error);
      particlesConfig = defaultParticlesConfig;
    }
  }

  // Auto-adjust colors based on current theme
  particlesConfig = adjustColorsForTheme(particlesConfig);

  if (window.particlesJS) {
    window.particlesJS(elementId, particlesConfig);
  } else {
    console.error('particles.js not loaded');
  }
};
