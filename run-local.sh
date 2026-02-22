#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

echo "[1/2] Vérification JavaScript..."
npm run check

echo "[2/2] Démarrage du site sur http://localhost:8080 ..."
npm start
