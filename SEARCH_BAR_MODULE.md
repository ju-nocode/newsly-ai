# 🔍 Module de Recherche Universel - Documentation

## Vue d'ensemble

Le module `search-bar-universal.js` est un **module complètement autonome** qui gère la barre de recherche intelligente sur toutes les pages de l'application Newsly AI.

## ✨ Caractéristiques

### 1. **Complètement Autonome**
- ✅ Aucun callback externe requis
- ✅ Gère lui-même toutes les navigations
- ✅ Fonctionne de manière identique sur toutes les pages
- ✅ Auto-initialisation automatique

### 2. **Interactions Utilisateur**

#### **Clic dans la barre vide**
- Affiche l'historique de recherche (si disponible)
- Sinon, affiche toutes les commandes disponibles

#### **Tapez "/"**
- Affiche toutes les commandes disponibles
- Chaque commande est cliquable
- Support de l'autocomplétion avec Tab

#### **Tapez "/prof..."**
- Filtre automatiquement les commandes correspondantes
- Affiche uniquement `/profile:` si vous tapez "/prof"
- Tab pour compléter automatiquement

#### **Commande complète "/profile: "**
- Affiche les suggestions spécifiques à cette commande
- Chaque suggestion est cliquable et exécute une action

### 3. **Raccourcis Clavier**

| Raccourci | Action |
|-----------|--------|
| **Ctrl/Cmd + K** | Ouvrir la recherche |
| **Tab** | Autocomplétion |
| **↑/↓** | Navigation dans les suggestions |
| **Enter** | Exécuter la suggestion sélectionnée |
| **Escape** | Fermer les suggestions |

## 📋 Commandes Disponibles

### `/dashboard`
**Aliases:** `/home`, `/accueil`
**Action:** Redirige vers dashboard.html

### `/profile:`
**Aliases:** `/profil:`, `/user:`, `/me:`
**Suggestions:**
- `/profile: account` → Paramètres du compte
- `/profile: password` → Modifier mot de passe
- `/profile: preferences` → Préférences utilisateur

### `/feed:`
**Aliases:** `/news:`, `/actu:`, `/articles:`
**Suggestions:**
- `/feed: technology` → Articles tech
- `/feed: business` → Actualités business
- `/feed: sports` → Actualités sportives
- `/feed: science` → Actualités scientifiques
- `/feed: entertainment` → Divertissement
- `/feed: health` → Santé

**Action:** Redirige vers `dashboard.html?category=XXX`

### `/settings`
**Aliases:** `/config`, `/options`, `/parametres`
**Suggestions:**
- `/settings: account` → Paramètres du compte
- `/settings: theme` → Apparence et thème
- `/settings: notifications` → Gérer les notifications

**Action:** Redirige vers settings.html

### `/help`
**Aliases:** `/aide`, `/?`, `/h`
**Suggestions:**
- `/help: commands` → Liste des commandes
- `/help: shortcuts` → Raccourcis clavier

**Action:** Affiche un modal d'aide

## 🔧 Utilisation

### Installation sur une nouvelle page

```html
<script type="module">
    import { initUniversalSearchBar } from './public/js/search-bar-universal.js';

    // Le module s'auto-initialise, mais vous pouvez le forcer :
    initUniversalSearchBar();
</script>
```

### Structure HTML requise

La navbar doit contenir :

```html
<div class="smart-search-wrapper">
    <div class="smart-search-container">
        <input
            type="text"
            id="smartSearchInput"
            placeholder="Rechercher... (essayez /profile: ou /feed:)"
            autocomplete="off"
            spellcheck="false"
        >
        <button id="smartSearchBtn">🔍</button>
    </div>
</div>
```

## 📦 Dépendances

- **CSS:** `public/css/modules/search-bar.css`
- **Historique:** localStorage (`newsly-search-history`)
- **Aucune dépendance externe**

## 🎯 Actions Universelles

Toutes les actions sont définies dans le module et fonctionnent sur toutes les pages :

```javascript
const SEARCH_COMMANDS = {
    dashboard: {
        action: () => window.location.href = 'dashboard.html'
    },
    profile: {
        suggestions: [
            {
                action: () => window.location.href = 'settings.html#account'
            }
        ]
    },
    // ...
};
```

## 🔄 Historique de Recherche

- **Stockage:** localStorage
- **Limite:** 10 dernières recherches
- **Affichage:** Quand la barre est vide et focusée
- **Effacement:** Bouton "Effacer" dans l'historique

## ✅ Pages Intégrées

- ✅ `dashboard.html`
- ✅ `settings.html`
- ⏳ À intégrer si nécessaire : autres pages d'utilisateurs connectés

## 🚀 Fonctionnement Interne

### 1. Auto-initialisation
```javascript
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUniversalSearchBar);
} else {
    setTimeout(initUniversalSearchBar, 100);
}
```

### 2. Gestion des événements
- `input` : Détecte les commandes, filtre les suggestions
- `keydown` : Tab, Arrows, Enter, Escape
- `focus` : Affiche historique ou commandes
- `blur` : Ferme les suggestions

### 3. Détection de commandes
```javascript
function detectCommandType(query) {
    // Vérifie le prefix principal
    // Vérifie les aliases
    // Retourne le type de commande ou null
}
```

### 4. Exécution d'action
```javascript
function executeSuggestion(suggestion) {
    // Ajoute à l'historique
    // Exécute suggestion.action()
    // Ferme les suggestions
    // Nettoie l'input
}
```

## 🎨 Styles

Tous les styles sont dans `public/css/modules/search-bar.css` :

- `.search-suggestions-container` : Conteneur dropdown
- `.search-suggestion-item` : Item de suggestion
- `.search-command-overview` : Item de commande
- `.search-history-item` : Item d'historique
- `.selected` : Item sélectionné

## 🐛 Debug

### Vérifier que le module est chargé :
```javascript
console.log('🔍 Initializing Universal Search Bar...');
```

### Vérifier l'input :
```javascript
document.getElementById('smartSearchInput')
```

### Vérifier les suggestions :
```javascript
document.getElementById('searchSuggestionsContainer')
```

## 📝 Notes Importantes

1. **Module ES6** : Utilise `export/import`
2. **Autonome** : Ne nécessite aucune configuration
3. **Universel** : Fonctionne identiquement partout
4. **Léger** : ~600 lignes de code
5. **Performant** : Pas de dépendances externes

## 🔮 Évolutions Futures

- [ ] Recherche fuzzy/floue
- [ ] Raccourcis personnalisables
- [ ] Plus de commandes (/logout, /notifications, etc.)
- [ ] Thèmes de suggestions
- [ ] Analytics de recherche

---

**Auteur:** Claude Code
**Version:** 1.0
**Date:** 2025-10-18
