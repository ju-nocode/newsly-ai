#!/bin/bash
# Commit & push rapide sur la branche main (affichage léger)

set -e

# --- Fonctions ---
line() {
  cols=$(tput cols 2>/dev/null || echo 80)
  printf '%*s\n' "$cols" '' | tr ' ' '-'
}

# --- Vérifie la branche ---
branch=$(git branch --show-current 2>/dev/null || git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
if [ "$branch" != "main" ]; then
  echo "❌  Branche actuelle : $branch (doit être main)"
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
echo "📦  Commit & push sur 'main'"
line
git status -s
line

# --- Commit + push ---
git add -A
git commit -m "new updates"
echo
git push origin main
line
echo "🚀  Terminé."
echo
