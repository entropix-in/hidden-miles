#! /usr/bin/env bash
##############################################
# == Development environment setup script == #
##############################################
set -euo pipefail

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$BASE_DIR"

COMPOSE=(docker compose --env-file extra/docker/local/.env -f extra/docker/local/docker-compose.yml)

echo "🚀 Setting up the Safarnest development environment 🚀"

if ! command -v docker >/dev/null 2>&1; then
    echo "❌ Docker not installed."
    echo "▶️ Install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
    echo "❌ Docker Compose v2 is required."
    echo "▶️ Install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

if [ ! -f extra/docker/local/.env ]; then
    cp extra/docker/local/.env.example extra/docker/local/.env
    echo "✅ Created extra/docker/local/.env"
fi

if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "✅ Created .env.local for running the app outside Docker"
fi

echo "⌛️ Building and starting containers..."
"${COMPOSE[@]}" up -d --build

echo "⌛️ Waiting for the app to become healthy..."
for _ in $(seq 1 60); do
    if curl -fsS http://localhost:3000/api/health >/dev/null 2>&1; then
        break
    fi
    sleep 3
done

echo ""
echo "🎉 Setup completed successfully 🎉"
echo ""
echo "------------------------------------------------------"
echo "🔗 Website:    http://localhost:3000"
echo "🔗 Health:     http://localhost:3000/api/health"
echo "🔗 MySQL:      localhost:3307 (safarnest / safarnest)"
echo ""
echo "Optional database admin:"
echo "  docker compose --env-file extra/docker/local/.env \\"
echo "    -f extra/docker/local/docker-compose.yml --profile tools up -d phpmyadmin"
echo "🔗 PhpMyAdmin: http://localhost:88"
echo "------------------------------------------------------"
