#!/usr/bin/env bash
# Runs on the VM, started over SSH by .github/workflows/deploy-api.yml.
# Pulls the image named in .env, restarts the stack and waits until the API answers.
set -euo pipefail
cd /opt/fat-guide

docker compose pull api
docker compose up -d --remove-orphans
docker logout ghcr.io >/dev/null 2>&1 || true
docker image prune -f >/dev/null

for _ in $(seq 1 30); do
  if docker compose exec -T caddy wget -qO- http://api:8080/api/health >/dev/null 2>&1; then
    echo "API is healthy: $(grep '^API_IMAGE=' .env | cut -d= -f2)"
    exit 0
  fi
  sleep 2
done
echo "API did not become healthy within 60 s" >&2
docker compose logs --tail=50 api >&2
exit 1
