# 📚 Exemples d'utilisation des API Routes

## 🔐 Authentication Headers

Toutes les routes protégées nécessitent un Bearer token :

```javascript
const headers = {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
};
```

---

## 1. **user_settings** - Paramètres utilisateur

### GET - Récupérer les paramètres
```javascript
const response = await fetch('/api/user/settings', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${access_token}`
    }
});

const data = await response.json();
// {
//     theme: 'dark',
//     language: 'fr',
//     email_notifications: true,
//     push_notifications: false,
//     newsletter_frequency: 'weekly',
//     articles_per_page: 20,
//     compact_view: false,
//     show_images: true,
//     timezone: 'Europe/Paris',
//     onboarding_completed: false,
//     onboarding_step: 0
// }
```

### POST - Mettre à jour le thème
```javascript
const response = await fetch('/api/user/settings', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        theme: 'light'  // ou 'dark', 'auto'
    })
});
```

### POST - Mettre à jour la langue
```javascript
await fetch('/api/user/settings', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        language: 'en'  // ou 'fr'
    })
});
```

### POST - Mettre à jour les notifications
```javascript
await fetch('/api/user/settings', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        email_notifications: false,
        push_notifications: true,
        newsletter_frequency: 'daily'  // 'daily', 'weekly', 'monthly', 'never'
    })
});
```

---

## 2. **user_feed_preferences** - Préférences de flux

### GET - Récupérer les préférences
```javascript
const response = await fetch('/api/user/feed-preferences', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${access_token}`
    }
});

const data = await response.json();
// {
//     followed_categories: ['general'],
//     followed_sources: [],
//     blocked_sources: [],
//     interest_keywords: [],
//     blocked_keywords: [],
//     preferred_countries: [],
//     excluded_countries: [],
//     default_sort: 'relevance',
//     max_article_age_hours: 48
// }
```

### POST - Ajouter des catégories suivies
```javascript
await fetch('/api/user/feed-preferences', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        followed_categories: ['general', 'technology', 'business', 'sports']
    })
});
```

### POST - Ajouter des mots-clés d'intérêt
```javascript
await fetch('/api/user/feed-preferences', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        interest_keywords: ['AI', 'blockchain', 'startup']
    })
});
```

### POST - Bloquer des sources
```javascript
await fetch('/api/user/feed-preferences', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        blocked_sources: ['source-a.com', 'source-b.com']
    })
});
```

---

## 3. **user_search_preferences** - Préférences de recherche

### GET - Récupérer les préférences
```javascript
const response = await fetch('/api/user/search-preferences', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${access_token}`
    }
});

const data = await response.json();
// {
//     search_history: [],
//     favorite_commands: [],
//     custom_shortcuts: {},
//     command_stats: {},
//     preferences: {
//         enableShortcuts: true,
//         maxHistoryItems: 10,
//         fuzzySearchEnabled: true,
//         showFavoritesFirst: true
//     }
// }
```

### POST - Ajouter une recherche à l'historique
```javascript
// Récupérer l'historique actuel
const currentPrefs = await fetch('/api/user/search-preferences', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${access_token}` }
}).then(r => r.json());

// Ajouter la nouvelle recherche
const updatedHistory = [
    { query: 'AI news', timestamp: new Date().toISOString() },
    ...currentPrefs.search_history
].slice(0, 10); // Garder max 10 items

await fetch('/api/user/search-preferences', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        search_history: updatedHistory
    })
});
```

### POST - Ajouter une commande favorite
```javascript
await fetch('/api/user/search-preferences', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        favorite_commands: ['/profile', '/feed:technology', '/settings']
    })
});
```

---

## 4. **particles_config** - Configuration particules

### GET - Récupérer la configuration
```javascript
const response = await fetch('/api/particles/config', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${access_token}`
    }
});

const data = await response.json();
// { config: { /* config particules.js */ } }
```

### POST - Sauvegarder la configuration
```javascript
await fetch('/api/particles/config', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        config: {
            particles: {
                number: { value: 80 },
                color: { value: "#ffffff" },
                shape: { type: "circle" },
                // ... reste de la config
            }
        }
    })
});
```

---

## 📝 Notes importantes

1. **Toutes les routes utilisent UPSERT** : Si les données n'existent pas, elles sont créées. Si elles existent, elles sont mises à jour.

2. **Validation côté serveur** : Les données sont validées avant d'être insérées en base.

3. **Timestamps automatiques** : `updated_at` est automatiquement mis à jour à chaque modification.

4. **Valeurs partielles** : Tu peux envoyer seulement les champs que tu veux modifier, pas besoin d'envoyer tous les champs.

Exemple :
```javascript
// Modifier SEULEMENT le thème, sans toucher aux autres paramètres
await fetch('/api/user/settings', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        theme: 'light'  // Les autres champs restent inchangés
    })
});
```

---

## 🚀 Intégration dans le code existant

### Exemple: Sauvegarder le thème dans `theme-manager.js`

```javascript
// Dans theme-manager.js
async function saveThemeToDatabase(theme) {
    const session = JSON.parse(localStorage.getItem('session'));
    if (!session?.access_token) return;

    try {
        await fetch('/api/user/settings', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ theme })
        });
    } catch (error) {
        console.error('Failed to save theme:', error);
    }
}

// Appeler cette fonction quand le thème change
document.getElementById('themeToggle').addEventListener('change', async (e) => {
    const theme = e.target.checked ? 'dark' : 'light';
    applyTheme(theme);
    await saveThemeToDatabase(theme);  // Sauvegarder en DB
});
```
