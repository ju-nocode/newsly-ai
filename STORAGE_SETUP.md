# Configuration Supabase Storage pour les Avatars

## État actuel

Pour le moment, les avatars sont stockés en **base64** directement dans la colonne `avatar_url` de la table `profiles`. Cela fonctionne mais peut rendre la base de données lourde avec de grandes images.

## Solution recommandée : Supabase Storage

### 1. Créer un bucket "avatars" dans Supabase

1. Allez dans votre dashboard Supabase
2. Cliquez sur **Storage** dans le menu latéral
3. Cliquez sur **New bucket**
4. Configurez le bucket :
   - Name: `avatars`
   - Public bucket: ✅ **OUI** (pour accès direct aux images)
   - File size limit: `2097152` (2 MB en bytes)
   - Allowed MIME types: `image/jpeg,image/png,image/gif,image/webp`

### 2. Configurer les politiques RLS (Row Level Security)

Dans le bucket `avatars`, ajoutez ces politiques :

#### Politique INSERT (upload)
```sql
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Politique SELECT (lecture)
```sql
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

#### Politique UPDATE (modification)
```sql
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Politique DELETE (suppression)
```sql
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3. Modifier le code JavaScript (optionnel)

Si vous souhaitez utiliser Supabase Storage au lieu de base64, remplacez le code d'upload dans `settings.html` :

```javascript
// Gérer la sélection d'image avec upload vers Supabase
avatarInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation: type d'image
    if (!file.type.startsWith('image/')) {
        showError('Veuillez sélectionner une image valide');
        return;
    }

    // Validation: taille max 2MB
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
        showError('L\'image ne doit pas dépasser 2 MB');
        return;
    }

    try {
        // Récupérer l'utilisateur actuel
        const { data: { user } } = await supabase.auth.getUser();

        // Nom du fichier: userID/avatar.extension
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/avatar.${fileExt}`;

        // Upload vers Supabase Storage
        const { data, error } = await supabase.storage
            .from('avatars')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true // Remplace si existe déjà
            });

        if (error) throw error;

        // Récupérer l'URL publique
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

        // Mettre à jour l'affichage
        avatarImage.src = publicUrl;
        currentAvatarUrl = publicUrl;

        showSuccess('Image uploadée ! Cliquez sur "Mettre à jour le profil" pour sauvegarder');
    } catch (error) {
        showError('Erreur lors de l\'upload: ' + error.message);
    }
});
```

### 4. Avantages de Supabase Storage

✅ **Performance** : Les images sont servies via CDN
✅ **Optimisation** : Gestion automatique des images
✅ **Sécurité** : Politiques RLS granulaires
✅ **Économie** : Pas de stockage base64 dans PostgreSQL
✅ **Scalabilité** : Supporte des millions d'images

### 5. Structure des fichiers

```
avatars/
├── {user_id_1}/
│   └── avatar.jpg
├── {user_id_2}/
│   └── avatar.png
└── {user_id_3}/
    └── avatar.webp
```

Chaque utilisateur a son propre dossier avec son `user.id` comme nom.

## Note

**Pas besoin de nouvelle table en base de données !** La colonne `avatar_url` existante dans `profiles` stocke simplement l'URL (qu'elle soit base64 ou Supabase Storage).
