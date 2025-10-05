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
  const saved = localStorage.getItem('particlesConfig');
  return saved ? JSON.parse(saved) : defaultParticlesConfig;
};

// Save particles config to localStorage
export const saveParticlesConfig = (config) => {
  localStorage.setItem('particlesConfig', JSON.stringify(config));
};

// Initialize particles on a given element
export const initParticles = (elementId, config = null) => {
  const particlesConfig = config || loadParticlesConfig();

  if (window.particlesJS) {
    window.particlesJS(elementId, particlesConfig);
  } else {
    console.error('particles.js not loaded');
  }
};
