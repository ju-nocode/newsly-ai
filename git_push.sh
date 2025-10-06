#!/bin/bash
# Stop le script si une commande échoue
set -e

# Fonction : dessine une ligne de tirets sur la largeur du terminal
print_line() {
  cols=$(tput cols 2>/dev/null || echo 80)   # fallback à 80 si tput indisponible
  # crée une chaîne vide de la longueur cols puis remplace les espaces par des '-'
  printf '%*s\n' "$cols" '' | tr ' ' '-'
}

echo
print_line
echo "📌 Vérification de la branche et préparation du commit"
print_line
echo

# Vérifie qu'on est bien sur la branche main
current_branch=$(git branch --show-current 2>/dev/null || git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
if [ "$current_branch" != "main" ]; then
  echo "❌ Tu n'es pas sur la branche 'main' (actuellement: $current_branch)"
  exit 1
fi

# Ajoute tous les fichiers modifiés
git add -A

# Si aucun changement à commit, on sort proprement
if git diff --cached --quiet; then
  echo "✅ Aucun changement à commit."
  print_line
  exit 0
fi

# Commit avec message automatique ou personnalisé
msg=${1:-"new updates"}
git commit -m "$msg"

# Optionnel : pull pour réduire les risques de conflit (non bloquant)
# git pull --rebase origin main

# Push sur la branche main
git push origin main

echo
print_line
echo "🚀 Commit et push terminés avec succès sur la branche main."
print_line
echo
