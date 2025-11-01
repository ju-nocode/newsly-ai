#!/bin/bash
# Commit & push rapide sur la branche master (affichage léger)

set -e

# --- Fonctions ---
line() {
  cols=$(tput cols 2>/dev/null || echo 80)
  printf '%*s\n' "$cols" '' | tr ' ' '-'
}

# --- Vérifie la branche ---
branch=$(git branch --show-current 2>/dev/null || git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
if [ "$branch" != "master" ]; then
  echo "❌  Branche actuelle : $branch (doit être master)"
  exit 1
fi

# --- Vérifie les changements ---
changes=$(git status --porcelain)
if [ -z "$changes" ]; then
  echo "✅  Aucun changement à commit."
  exit 0
fi

# --- Affiche résumé ---
echo
line
echo "📦  Commit & push sur 'master'"
line
git status -s
line
echo

# --- Commit + push ---
echo
date=$(date +"%Y-%m-%d_%H-%M")
git add -A
git commit -m "Update: ${date}"

echo
echo "🔄 Push vers origin/master..."
if git push origin master; then
  echo
  line
  echo "🚀 Push réussi ! 🚀"
  line
  echo
else
  echo
  echo "❌ Échec du push. Vérifiez les conflits ou l'accès au dépôt."
  exit 1
fi
