# 🧠 Système Intelligent de Personnalisation - Newsly AI

## 🎯 Vue d'ensemble

Architecture multi-tables complète pour offrir une **expérience utilisateur hautement personnalisée** basée sur le comportement, les préférences et l'engagement de chaque utilisateur.

## 🏗️ Architecture du système

### 📊 6 Tables interconnectées:

```
┌─────────────────────────────────────────────────────────┐
│                    USER (auth.users)                      │
│                  UUID (user_id primary)                   │
└───────────────────┬─────────────────────────────────────┘
                    │
        ┌───────────┴────────────────────────┐
        │                                    │
        ▼                                    ▼
┌──────────────────┐              ┌──────────────────────┐
│  user_settings   │              │ user_feed_preferences│
├──────────────────┤              ├──────────────────────┤
│ • theme          │              │ • followed_categories│
│ • language       │              │ • followed_sources   │
│ • notifications  │              │ • interest_keywords  │
│ • timezone       │              │ • blocked_keywords   │
│ • display prefs  │              │ • default_sort       │
└──────────────────┘              └──────────────────────┘
        │                                    │
        ├────────────────────────────────────┤
        │                                    │
        ▼                                    ▼
┌────────────────────┐            ┌──────────────────────┐
│user_search_         │            │ user_reading_history │
│  preferences        │            ├──────────────────────┤
├────────────────────┤            │ • articles opened    │
│ • search_history   │            │ • read_duration      │
│ • favorite_commands│            │ • scroll_depth       │
│ • custom_shortcuts │            │ • completed articles │
│ • command_stats    │            │ • engagement metrics │
└────────────────────┘            └──────────────────────┘
        │                                    │
        ├────────────────────────────────────┤
        │                                    │
        ▼                                    ▼
┌────────────────────┐            ┌──────────────────────┐
│  user_bookmarks    │            │ user_activity_log    │
├────────────────────┤            ├──────────────────────┤
│ • saved articles   │            │ • all user actions   │
│ • folders          │            │ • search queries     │
│ • tags             │            │ • clicks             │
│ • notes            │            │ • navigation         │
└────────────────────┘            └──────────────────────┘
```

## 📋 Détails des tables

### 1. `user_settings` - Paramètres généraux
```sql
Colonnes principales:
- theme (light/dark/auto)
- language (fr/en)
- email_notifications, push_notifications
- newsletter_frequency (daily/weekly/monthly/never)
- articles_per_page (10-100)
- compact_view, show_images
- timezone, country_code, city
- onboarding_completed, onboarding_step
```

**Usage:** Personnalisation de l'interface et des communications

### 2. `user_feed_preferences` - Préférences de flux
```sql
Colonnes principales:
- followed_categories[] (Array de catégories)
- followed_sources[] (JSONB: sources prioritaires)
- blocked_sources[] (JSONB: sources blacklist)
- interest_keywords[] (JSONB: mots-clés d'intérêt)
- blocked_keywords[] (JSONB: mots-clés à ignorer)
- preferred_countries[], excluded_countries[]
- default_sort (latest/relevance/popularity/personalized)
- max_article_age_hours
```

**Usage:** Filtrage intelligent du flux d'actualités

### 3. `user_search_preferences` - Search bar
```sql
Colonnes principales:
- search_history[] (50 dernières recherches)
- favorite_commands[] (commandes favorites)
- custom_shortcuts{} (raccourcis personnalisés)
- command_stats{} (stats d'usage par commande)
- preferences{} (config search bar)
```

**Usage:** Personnalisation de la barre de recherche

### 4. `user_reading_history` - Historique de lecture
```sql
Colonnes principales:
- article_id, article_url, article_title
- article_category, article_source
- opened_at, read_duration_seconds
- scroll_depth_percent (0-100)
- completed (true/false)
- bookmarked, liked, shared
- device_type
```

**Usage:** Analytics d'engagement et recommandations

### 5. `user_bookmarks` - Articles sauvegardés
```sql
Colonnes principales:
- article_* (toutes les infos de l'article)
- folder (organisation)
- tags[] (catégorisation)
- notes (commentaires personnels)
- bookmarked_at, last_accessed_at
```

**Usage:** Sauvegarde et organisation d'articles

### 6. `user_activity_log` - Journal d'activité
```sql
Colonnes principales:
- activity_type (search/read_article/bookmark/etc.)
- context{} (données contextuelles)
- session_id
- device_type, user_agent
- created_at
```

**Usage:** Analytics, ML, amélioration UX

## 🚀 Fonctions SQL intelligentes

### 1. `get_recommended_categories(user_id, limit)`
Retourne les catégories recommandées basées sur l'historique de lecture

```sql
SELECT * FROM get_recommended_categories(auth.uid(), 5);

-- Retourne:
-- category      | score
-- technology    | 45
-- science       | 32
-- business      | 12
```

### 2. `get_recommended_sources(user_id, limit)`
Retourne les sources recommandées basées sur l'engagement

```sql
SELECT * FROM get_recommended_sources(auth.uid(), 5);

-- Retourne:
-- source        | engagement_score
-- BBC News      | 2845.50
-- TechCrunch    | 1932.25
```

### 3. `get_top_search_commands(user_id, limit)`
Retourne les commandes de recherche les plus utilisées

```sql
SELECT * FROM get_top_search_commands(auth.uid(), 5);

-- Retourne:
-- command              | usage_count
-- /feed: technology    | 45
-- /dashboard           | 32
```

### 4. `initialize_user_preferences(user_id)`
Initialise toutes les tables pour un nouvel utilisateur

```sql
SELECT initialize_user_preferences(auth.uid());
```

### 5. `get_user_profile(user_id)`
Retourne un profil complet avec statistiques

```sql
SELECT get_user_profile(auth.uid());

-- Retourne un JSONB complet:
{
  "settings": {...},
  "feed_preferences": {...},
  "search_preferences": {...},
  "stats": {
    "total_articles_read": 145,
    "articles_completed": 89,
    "total_bookmarks": 23,
    "favorite_category": "technology"
  }
}
```

## 💻 API JavaScript

### Initialisation

```javascript
import { userIntelligence } from './public/js/user-intelligence-system.js';

// Auto-initialisé, mais on peut aussi:
await userIntelligence.init();
```

### Settings

```javascript
// Récupérer les settings
const settings = await userIntelligence.getSettings();

// Mettre à jour
await userIntelligence.updateSettings({
    theme: 'dark',
    language: 'fr',
    articles_per_page: 30
});
```

### Feed Preferences

```javascript
// Récupérer les préférences
const feedPrefs = await userIntelligence.getFeedPreferences();

// Suivre une catégorie
await userIntelligence.followCategory('technology');

// Ne plus suivre
await userIntelligence.unfollowCategory('sports');
```

### Reading Analytics

```javascript
// Tracker qu'un article a été ouvert
await userIntelligence.trackArticleOpened({
    id: 'abc123',
    url: 'https://...',
    title: 'Mon article',
    category: 'technology',
    source: 'BBC News'
});

// Mettre à jour la progression
await userIntelligence.updateReadingProgress(
    'abc123',     // article_id
    120,          // durée en secondes
    75,           // scroll depth %
    true          // completed
);

// Obtenir des recommandations intelligentes
const recommendedCats = await userIntelligence.getRecommendedCategories(5);
const recommendedSources = await userIntelligence.getRecommendedSources(5);
```

### Bookmarks

```javascript
// Sauvegarder un article
await userIntelligence.bookmarkArticle({
    id: 'abc123',
    url: 'https://...',
    title: 'Mon article',
    category: 'technology',
    source: 'BBC News',
    image: 'https://...',
    publishedAt: '2025-10-19T...'
}, 'Tech', ['AI', 'innovation']);

// Supprimer un bookmark
await userIntelligence.removeBookmark('abc123');

// Récupérer tous les bookmarks
const bookmarks = await userIntelligence.getBookmarks();

// Récupérer par dossier
const techBookmarks = await userIntelligence.getBookmarks('Tech');
```

### Activity Logging

```javascript
// Logger une activité
await userIntelligence.logActivity('search', {
    query: '/feed: technology',
    result_count: 15,
    clicked_position: 3
});

await userIntelligence.logActivity('change_category', {
    from: 'general',
    to: 'technology'
});
```

### Profil complet

```javascript
// Obtenir le profil complet de l'utilisateur
const profile = await userIntelligence.getUserProfile();

console.log(profile);
/*
{
  settings: {...},
  feed_preferences: {...},
  search_preferences: {...},
  stats: {
    total_articles_read: 145,
    articles_completed: 89,
    total_bookmarks: 23,
    favorite_category: "technology"
  }
}
*/
```

## 🎯 Cas d'usage avancés

### 1. Feed personnalisé intelligent

```javascript
// 1. Récupérer les catégories suivies
const feedPrefs = await userIntelligence.getFeedPreferences();
const followedCategories = feedPrefs.followed_categories;

// 2. Récupérer les catégories recommandées (basé sur historique)
const recommended = await userIntelligence.getRecommendedCategories(3);

// 3. Combiner pour un feed ultra-personnalisé
const personalizedCategories = [
    ...followedCategories,
    ...recommended.map(r => r.category)
];

// 4. Filtrer les articles
const articles = await fetchArticles({
    categories: personalizedCategories,
    sources: feedPrefs.followed_sources,
    excludeSources: feedPrefs.blocked_sources,
    keywords: feedPrefs.interest_keywords,
    sort: feedPrefs.default_sort
});
```

### 2. Tracking de lecture complet

```javascript
// Variables de tracking
let articleStartTime = Date.now();
let maxScrollDepth = 0;

// Quand l'article s'ouvre
await userIntelligence.trackArticleOpened(articleData);

// Tracking du scroll
window.addEventListener('scroll', () => {
    const scrollPercent = (window.scrollY / document.body.scrollHeight) * 100;
    maxScrollDepth = Math.max(maxScrollDepth, scrollPercent);
});

// Quand l'utilisateur quitte/ferme
window.addEventListener('beforeunload', async () => {
    const duration = Math.floor((Date.now() - articleStartTime) / 1000);
    const completed = maxScrollDepth > 80; // 80% = lu complètement

    await userIntelligence.updateReadingProgress(
        articleData.id,
        duration,
        maxScrollDepth,
        completed
    );
});
```

### 3. Suggestions personnalisées dans la search bar

```javascript
// Récupérer les commandes les plus utilisées
const topCommands = await userIntelligence.getTopSearchCommands(5);

// Les afficher en premier dans le dropdown
topCommands.forEach(cmd => {
    // Afficher avec badge "⭐ Plus utilisée"
    displaySuggestion(cmd.command, {
        badge: '⭐ Plus utilisée',
        usageCount: cmd.usage_count
    });
});
```

### 4. Onboarding intelligent

```javascript
// Récupérer les settings
const settings = await userIntelligence.getSettings();

if (!settings.onboarding_completed) {
    // Afficher l'étape en cours
    showOnboardingStep(settings.onboarding_step);

    // Quand l'étape est complétée
    await userIntelligence.updateSettings({
        onboarding_step: settings.onboarding_step + 1,
        onboarding_completed: settings.onboarding_step + 1 >= 5
    });
}
```

## 🔐 Sécurité

- ✅ **Row Level Security (RLS)** activé sur toutes les tables
- ✅ Chaque utilisateur ne peut accéder qu'à ses propres données
- ✅ Policies Supabase pour SELECT, INSERT, UPDATE, DELETE
- ✅ Fonctions SECURITY DEFINER pour les opérations sensibles
- ✅ Auto-initialisation sécurisée lors du signup

## 📈 Performance

- ✅ **Indexes optimisés** sur toutes les colonnes fréquemment requêtées
- ✅ **Cache local** (60s) pour éviter les requêtes répétées
- ✅ **Queries composites** pour récupérer plusieurs infos en 1 fois
- ✅ **JSONB** pour flexibilité sans migrations
- ✅ **Pagination** sur les requêtes lourdes

## 🚀 Installation

### 1. Exécuter la migration SQL

```bash
# Via Supabase Dashboard → SQL Editor
# Copier/coller: database/migrations/001_intelligent_user_system.sql
```

### 2. Vérifier l'installation

```sql
-- Vérifier que les tables existent
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'user_%';

-- Devrait retourner:
-- user_settings
-- user_feed_preferences
-- user_search_preferences
-- user_reading_history
-- user_bookmarks
-- user_activity_log
```

### 3. C'est tout!

Le système s'auto-initialise:
- ✅ Trigger sur auth.users → Auto-création des tables utilisateur
- ✅ JavaScript auto-importe le système
- ✅ Fallback localStorage si non connecté

## 📊 Métriques disponibles

### Par utilisateur:
- Articles lus (total et complétés)
- Temps moyen de lecture
- Catégories préférées (par engagement)
- Sources préférées (par temps de lecture)
- Commandes de recherche favorites
- Taux d'engagement (scroll depth moyen)
- Bookmarks par catégorie

### Agrégées (admin):
- Catégories les plus populaires
- Sources les plus lues
- Commandes de recherche populaires
- Tendances de lecture

## 🔮 Évolutions futures

- [ ] **ML Recommendations**: Utiliser user_reading_history pour du ML
- [ ] **Collaborative filtering**: "Les utilisateurs comme vous ont aimé..."
- [ ] **Smart notifications**: Basées sur les intérêts et l'engagement
- [ ] **Reading streaks**: Gamification de la lecture
- [ ] **Export GDPR**: Exporter toutes les données utilisateur
- [ ] **A/B Testing**: Tester différents algorithmes de tri
- [ ] **Sentiment analysis**: Analyser les bookmarks et notes

---

**Version**: 2.0
**Date**: 2025-10-19
**Auteur**: Claude Code & Team Newsly AI
