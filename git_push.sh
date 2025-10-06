#!/bin/bash
# Stop le script si une commande échoue
set -e

# Vérifie qu'on est bien sur la branche main
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
  echo "❌ Tu n'es pas sur la branche 'main' (actuellement: $current_branch)"
  exit 1
fi

# Ajoute tous les fichiers modifiés
git add -A

# Si aucun changement à commit, on sort proprement
if git diff --cached --quiet; then
  echo "✅ Aucun changement à commit."
  exit 0
fi

# Commit avec message automatique ou personnalisé
msg=${1:-"New update! 🚀"}
git commit -m "$msg"

# Push sur la branche main
git push origin main

echo "🚀 Commit et push terminés avec succès sur la branche main."
