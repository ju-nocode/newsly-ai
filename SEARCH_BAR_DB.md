# 🔍 Search Bar - Database Integration

## 🎯 Vue d'ensemble

Le module `search-bar-universal.js` est maintenant **entièrement intégré avec Supabase** pour offrir une **synchronisation multi-appareils** et une **personnalisation avancée** basée sur les préférences utilisateur.

## ✨ Nouvelles fonctionnalités

### 1. **Synchronisation automatique**
- ✅ Historique de recherche sauvegardé en base de données
- ✅ Synchronisé sur tous les appareils de l'utilisateur
- ✅ Fallback sur localStorage si non connecté ou erreur DB

### 2. **Suggestions personnalisées**
- ✅ Commandes les plus utilisées remontées en premier
- ✅ Statistiques d'usage par commande
- ✅ Favoris avec étoiles ⭐

### 3. **Commandes favorites**
- ✅ Marquer des commandes comme favorites
- ✅ Affichées en premier lors de l'ouverture
- ✅ Gérées depuis l'interface de recherche

### 4. **Migration automatique**
- ✅ Migration localStorage → Database au premier login
- ✅ Transparente pour l'utilisateur
- ✅ Exécutée une seule fois

## 🗄️ Structure de données

### Table `user_search_preferences`

```sql
{
  id: UUID,
  user_id: UUID (référence auth.users),
  search_history: JSONB,      // Historique des 10 dernières recherches
  favorite_commands: JSONB,    // Liste des commandes favorites
  custom_shortcuts: JSONB,     // Raccourcis personnalisés (future feature)
  command_stats: JSONB,        // Statistiques d'usage { "/feed: tech": 45, ... }
  preferences: JSONB,          // Préférences générales
  created_at: TIMESTAMPTZ,
  updated_at: TIMESTAMPTZ
}
```

### Exemple de données

```json
{
  "user_id": "abc123...",
  "search_history": [
    {
      "query": "/feed: technology",
      "timestamp": 1698765432000,
      "type": "command"
    },
    {
      "query": "/profile: account",
      "timestamp": 1698765431000,
      "type": "command"
    }
  ],
  "favorite_commands": [
    "/feed: technology",
    "/dashboard",
    "/profile: account"
  ],
  "command_stats": {
    "/feed: technology": 45,
    "/dashboard": 32,
    "/profile: account": 12,
    "/feed: science": 8
  },
  "preferences": {
    "maxHistoryItems": 10,
    "showFavoritesFirst": true,
    "enableShortcuts": true
  }
}
```

## 🚀 Installation

### 1. Exécuter la migration SQL

Ouvrez votre **Supabase Dashboard** → **SQL Editor**:

```bash
# Fichier à exécuter
database/migrations/001_create_user_search_preferences.sql
```

Ou copiez-collez le contenu dans le SQL Editor et cliquez sur **Run**.

### 2. Vérifier que la table existe

```sql
SELECT * FROM user_search_preferences LIMIT 1;
```

### 3. C'est tout! 🎉

Le module JavaScript est déjà configuré et s'auto-initialise.

## 📋 Fonctionnement

### 1. **Au chargement de la page**

```javascript
// Automatique dans dashboard.html et settings.html
import { initUniversalSearchBar } from './public/js/search-bar-universal.js';

initUniversalSearchBar();

// Le module fait automatiquement :
// 1. Vérifie si l'utilisateur est connecté
// 2. Migre localStorage vers DB si c'est la première fois
// 3. Charge les préférences depuis DB
// 4. Configure le cache local (30s)
```

### 2. **Quand l'utilisateur recherche**

```javascript
// L'utilisateur tape "/feed: technology" et clique
// → Sauvegarde dans search_history
// → Incrémente command_stats["/feed: technology"]
// → Synchronise avec la DB (async)
// → Garde une copie dans localStorage (fallback)
```

### 3. **Affichage des suggestions**

```javascript
// Quand l'utilisateur clique dans la barre vide:
// 1. Charge les favoris (si disponibles)
// 2. Charge l'historique récent
// 3. Affiche les favoris en premier ⭐
// 4. Puis l'historique des 3 dernières recherches
```

### 4. **Suggestions personnalisées** (À venir)

```javascript
// Basé sur command_stats, les commandes les plus utilisées
// seront suggérées en premier dans le dropdown
```

## 🔧 API JavaScript

### `SearchPreferencesDB`

Classe principale pour gérer la base de données.

```javascript
const db = new SearchPreferencesDB();

// Charger les préférences
const prefs = await db.loadUserPreferences();

// Sauvegarder les préférences
await db.saveUserPreferences(prefs);

// Ajouter un favori
await db.addFavorite('/feed: technology');

// Supprimer un favori
await db.removeFavorite('/feed: technology');

// Obtenir les suggestions personnalisées
const suggestions = await db.getPersonalizedSuggestions(5);
// → ["/feed: technology", "/dashboard", ...]

// Incrémenter les stats d'usage
await db.incrementCommandUsage('/feed: technology');
```

### `SearchHistory` (modifié)

Classe existante, maintenant avec support DB.

```javascript
const history = searchState.history;

// Récupérer l'historique (async maintenant!)
const hist = await history.getHistory();

// Ajouter à l'historique
await history.addToHistory('/feed: technology', 'command', '/feed: technology');

// Effacer l'historique
await history.clearHistory();

// Récupérer les favoris
const favs = await history.getFavorites();

// Ajouter un favori
await history.addFavorite('/dashboard');
```

## 💾 Fallback localStorage

Si l'utilisateur n'est pas connecté ou si Supabase est indisponible:

- ✅ **Tout continue de fonctionner** avec localStorage
- ✅ Pas de perte de données
- ✅ Migration automatique lors du prochain login

```javascript
// Le module détecte automatiquement :
if (user is authenticated && supabase is available) {
  // Utilise la DB
} else {
  // Utilise localStorage
}
```

## 🔄 Cache local

Pour optimiser les performances:

- Cache de **30 secondes** pour l'historique
- Évite les requêtes DB répétées
- Invalidé automatiquement lors des modifications

```javascript
class SearchHistory {
  cacheDuration = 30000; // 30 secondes

  async getHistory() {
    // Utilise le cache si disponible et valide
    if (this.cache && (Date.now() - this.cacheTimestamp) < this.cacheDuration) {
      return this.cache;
    }

    // Sinon, recharge depuis la DB
    const prefs = await this.db.loadUserPreferences();
    this.cache = prefs.search_history;
    this.cacheTimestamp = Date.now();

    return this.cache;
  }
}
```

## 📊 Statistiques d'usage

Le système track automatiquement l'usage de chaque commande:

```javascript
{
  "command_stats": {
    "/feed: technology": 45,    // Utilisé 45 fois
    "/dashboard": 32,            // Utilisé 32 fois
    "/profile: account": 12,     // Utilisé 12 fois
    "/feed: science": 8,         // Utilisé 8 fois
    "/settings": 5               // Utilisé 5 fois
  }
}
```

Ces stats seront utilisées pour:
- Suggérer les commandes les plus utilisées
- Personnaliser l'ordre d'affichage
- Analytics utilisateur

## 🔐 Sécurité

- ✅ **Row Level Security (RLS)** activé
- ✅ Chaque utilisateur ne peut accéder qu'à ses propres données
- ✅ Policies Supabase pour SELECT, INSERT, UPDATE, DELETE
- ✅ Pas de risque de fuite de données entre utilisateurs

```sql
-- Policy example
CREATE POLICY "Users can view their own search preferences"
  ON user_search_preferences
  FOR SELECT
  USING (auth.uid() = user_id);
```

## 🧪 Test

### 1. Vérifier que la table existe

```sql
SELECT * FROM user_search_preferences WHERE user_id = auth.uid();
```

### 2. Tester via la console navigateur

```javascript
// Ouvrir dashboard.html, puis console:
const history = searchState.history;

// Ajouter un favori
await history.addFavorite('/feed: technology');

// Récupérer les favoris
const favs = await history.getFavorites();
console.log('Favoris:', favs);

// Vérifier les stats
const db = history.db;
const prefs = await db.loadUserPreferences();
console.log('Stats:', prefs.command_stats);
```

### 3. Tester la synchronisation multi-appareils

1. Connectez-vous sur un appareil
2. Faites quelques recherches
3. Connectez-vous sur un autre appareil
4. → L'historique doit être synchronisé ✅

## 🚧 Futures améliorations

- [ ] **Raccourcis personnalisés**: Permettre "/t" → "/feed: technology"
- [ ] **Export/Import**: Sauvegarder et restaurer les préférences
- [ ] **Suggestions IA**: Prédire la prochaine commande basé sur le contexte
- [ ] **Recherche fuzzy**: Tolérance aux fautes de frappe
- [ ] **Commandes custom**: Permettre aux users de créer leurs propres commandes

## 📝 Changelog

### Version 2.0 (2025-10-19)
- ✅ Ajout SearchPreferencesDB
- ✅ Intégration Supabase
- ✅ Synchronisation multi-appareils
- ✅ Migration automatique localStorage → DB
- ✅ Cache local (30s)
- ✅ Favoris ⭐
- ✅ Statistiques d'usage

### Version 1.0 (2025-10-18)
- ✅ Module search-bar-universal.js autonome
- ✅ Historique localStorage
- ✅ Commandes avec préfixes
- ✅ Autocomplétion Tab

---

**Auteur**: Claude Code
**Date**: 2025-10-19
**Version**: 2.0
