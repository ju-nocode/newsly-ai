# Configuration Newsly-AI

## Variables d'environnement requises (Vercel)

### 1. Supabase (✅ Configuré)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 2. News API (❌ Non configuré)

**Problème actuel** : Les actualités ne s'affichent pas sur index.html car `NEWS_API_KEY` n'est pas configurée.

**Solution** :
1. Créer un compte gratuit sur https://newsapi.org
2. Copier la clé API
3. Aller sur Vercel → Settings → Environment Variables
4. Ajouter `NEWS_API_KEY` avec la valeur
5. Cocher : Production, Preview, Development
6. Redéployer le projet

**Limite gratuite** : 100 requêtes/jour

---

## Fichiers concernés

- `/api/news/public.js` - Endpoint API qui utilise NEWS_API_KEY
- `/public/js/index-visitor.js` - Frontend qui appelle l'API

**Message d'erreur affiché** : "Configuration en cours : La clé News API n'est pas encore configurée."
