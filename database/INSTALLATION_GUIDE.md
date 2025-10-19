# 🚀 Guide d'Installation - Système Intelligent

## ⚡ Installation en 3 étapes

### Étape 1: Exécuter la migration SQL (5 min)

1. Ouvre **Supabase Dashboard**: https://supabase.com/dashboard
2. Sélectionne ton projet **Newsly AI**
3. Va dans **SQL Editor** (dans le menu de gauche)
4. Clique sur **New query**
5. Copie-colle le contenu de:
   ```
   database/migrations/001_intelligent_user_system.sql
   ```
6. Clique sur **Run** (ou appuie sur F5)
7. ✅ Tu devrais voir: "Success. No rows returned"

### Étape 2: Vérifier l'installation

Toujours dans le SQL Editor, exécute:

```sql
-- Vérifier que toutes les tables existent
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'user_%'
ORDER BY table_name;
```

✅ **Tu devrais voir 6 tables:**
- `user_activity_log`
- `user_bookmarks`
- `user_feed_preferences`
- `user_reading_history`
- `user_search_preferences`
- `user_settings`

### Étape 3: Tester le système

1. Ouvre `dashboard.html` dans ton navigateur local
2. Ouvre la console développeur (F12)
3. Tape:
   ```javascript
   await userIntelligence.getUserProfile()
   ```
4. ✅ Tu devrais voir un objet JSON avec tes données

---

## 🧪 Tests rapides

### Test 1: Vérifier l'auto-initialisation

```sql
-- Connecte-toi sur dashboard.html
-- Puis vérifie que tes tables ont été créées automatiquement:

SELECT * FROM user_settings WHERE user_id = auth.uid();
SELECT * FROM user_search_preferences WHERE user_id = auth.uid();
SELECT * FROM user_feed_preferences WHERE user_id = auth.uid();
```

### Test 2: Tester les fonctions intelligentes

```sql
-- Simule quelques lectures
INSERT INTO user_reading_history (user_id, article_id, article_url, article_category, article_source, completed)
VALUES
  (auth.uid(), 'test1', 'https://example.com/1', 'technology', 'BBC', true),
  (auth.uid(), 'test2', 'https://example.com/2', 'technology', 'BBC', true),
  (auth.uid(), 'test3', 'https://example.com/3', 'science', 'Nature', false);

-- Obtenir les catégories recommandées
SELECT * FROM get_recommended_categories(auth.uid(), 5);

-- Devrait retourner "technology" en premier
```

### Test 3: Tester via JavaScript

```javascript
// Dans la console du navigateur (dashboard.html)

// 1. Vérifier l'authentification
console.log('Authenticated:', userIntelligence.isAuthenticated);

// 2. Récupérer le profil
const profile = await userIntelligence.getUserProfile();
console.log('Profile:', profile);

// 3. Suivre une catégorie
await userIntelligence.followCategory('technology');

// 4. Vérifier
const prefs = await userIntelligence.getFeedPreferences();
console.log('Followed categories:', prefs.followed_categories);
// Devrait inclure "technology"

// 5. Tracker un article
await userIntelligence.trackArticleOpened({
    id: 'test-article-123',
    url: 'https://example.com/article',
    title: 'Test Article',
    category: 'technology',
    source: 'Test Source'
});

// 6. Vérifier l'historique
// Retourne dans SQL Editor:
SELECT * FROM user_reading_history WHERE user_id = auth.uid();
```

---

## ❓ Problèmes courants

### "Table user_settings does not exist"

**Solution:**
1. Vérifie que la migration SQL a bien été exécutée
2. Vérifie que tu es dans le bon projet Supabase
3. Réexécute la migration

### "Cannot read properties of null (reading 'uid')"

**Solution:**
1. Vérifie que tu es bien connecté (auth.uid() doit retourner un UUID)
2. Si pas connecté, connecte-toi via l'interface

### "RLS policy violation"

**Solution:**
- Les policies RLS sont automatiquement créées par la migration
- Vérifie que tu es bien connecté avec le bon utilisateur

### "Function get_user_profile does not exist"

**Solution:**
- Réexécute la migration SQL complète
- Les fonctions sont créées en fin de migration

---

## 📊 Vérifier les données

```sql
-- Combien d'utilisateurs ont des préférences ?
SELECT COUNT(DISTINCT user_id) FROM user_settings;

-- Voir toutes tes données
SELECT * FROM user_settings WHERE user_id = auth.uid();
SELECT * FROM user_feed_preferences WHERE user_id = auth.uid();
SELECT * FROM user_search_preferences WHERE user_id = auth.uid();
SELECT * FROM user_reading_history WHERE user_id = auth.uid();
SELECT * FROM user_bookmarks WHERE user_id = auth.uid();
SELECT * FROM user_activity_log WHERE user_id = auth.uid() ORDER BY created_at DESC LIMIT 10;
```

---

## ✅ Checklist finale

- [ ] Migration SQL exécutée sans erreur
- [ ] 6 tables créées dans Supabase
- [ ] Policies RLS actives
- [ ] Fonctions SQL créées (get_recommended_categories, etc.)
- [ ] Trigger auto-initialize_user créé
- [ ] userIntelligence accessible dans la console
- [ ] getUserProfile() retourne des données

---

## 🎉 Prochaines étapes

Une fois tout installé, tu peux:

1. **Intégrer le tracking dans ton app**
   - Tracker l'ouverture d'articles
   - Tracker le scroll et la durée de lecture
   - Logger les actions utilisateur

2. **Utiliser les recommandations**
   - Afficher les catégories recommandées
   - Suggérer des sources basées sur l'engagement
   - Personnaliser le feed

3. **Implémenter les bookmarks**
   - Bouton "Sauvegarder" sur les articles
   - Page "Mes articles sauvegardés"
   - Organisation par dossiers et tags

4. **Analytics**
   - Dashboard avec les métriques utilisateur
   - Graphiques d'engagement
   - Tendances de lecture

---

**Besoin d'aide?** Consulte `INTELLIGENT_PERSONALIZATION_SYSTEM.md` pour la documentation complète.
