# ⚡ QUICK START - Par où commencer

## 🎯 3 étapes simples

### ✅ ÉTAPE 1: Migration SQL (5 min)

1. **Ouvre Supabase**
   - https://supabase.com/dashboard
   - Sélectionne ton projet "Newsly AI"

2. **Va dans SQL Editor**
   - Menu gauche → "SQL Editor"
   - Clique "New query"

3. **Exécute la migration**
   - Ouvre: `database/migrations/001_intelligent_user_system.sql`
   - Copie TOUT le contenu (Ctrl+A, Ctrl+C)
   - Colle dans Supabase (Ctrl+V)
   - Clique **"Run"** ou F5
   - ✅ Attends "Success. No rows returned"

### ✅ ÉTAPE 2: Vérification (1 min)

Dans le même SQL Editor, exécute:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'user_%'
ORDER BY table_name;
```

**Tu DOIS voir 6 tables:**
- user_activity_log
- user_bookmarks
- user_feed_preferences
- user_reading_history
- user_search_preferences
- user_settings

✅ Si tu les vois → C'est bon!

### ✅ ÉTAPE 3: Test (2 min)

1. Ouvre `dashboard.html` dans ton navigateur
2. Connecte-toi
3. Ouvre la console (F12)
4. Tape:
   ```javascript
   await userIntelligence.getUserProfile()
   ```

✅ **Si ça retourne un objet JSON → Tout fonctionne!** 🎉

---

## 🎉 C'est fait!

Le système intelligent est maintenant actif:
- ✅ Search bar synchronisée en base de données
- ✅ Historique multi-appareils
- ✅ Tracking prêt à l'emploi
- ✅ Recommandations intelligentes

---

## 📚 Après l'installation

### Pour comprendre le système:
- Lis: `INTELLIGENT_PERSONALIZATION_SYSTEM.md`

### Pour utiliser l'API:
```javascript
// Suivre une catégorie
await userIntelligence.followCategory('technology');

// Tracker un article
await userIntelligence.trackArticleOpened({
    id: 'abc123',
    url: 'https://...',
    title: 'Mon article',
    category: 'technology'
});

// Recommandations
const reco = await userIntelligence.getRecommendedCategories(5);
```

---

## ❌ Problèmes?

### "Table does not exist"
→ Réexécute la migration SQL (Étape 1)

### "userIntelligence is not defined"
→ Rafraîchis la page (Ctrl+F5)

### "RLS policy violation"
→ Assure-toi d'être connecté

---

## ✅ Checklist

- [ ] Migration SQL exécutée
- [ ] 6 tables créées
- [ ] `getUserProfile()` fonctionne
- [ ] Prêt à utiliser!

**Let's go! 🚀**
