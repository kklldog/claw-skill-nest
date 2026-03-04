#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "[Agile Skill Hub] Stopping..."

if command -v docker >/dev/null 2>&1; then
  if docker compose version >/dev/null 2>&1; then
    docker compose down || true
  elif command -v docker-compose >/dev/null 2>&1; then
    docker-compose down || true
  fi
fi

if [[ -f .run.pid ]]; then
  PID="$(cat .run.pid)"
  if kill -0 "$PID" 2>/dev/null; then
    kill "$PID" || true
    echo "[Agile Skill Hub] Stopped Node process (PID: $PID)"
  fi
  rm -f .run.pid
fi

echo "[Agile Skill Hub] Stopped"
